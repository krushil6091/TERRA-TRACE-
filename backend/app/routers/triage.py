from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, Header, HTTPException, status
from app.schemas.triage import (
    InvestigationStatus,
    EntityType,
    TriageQueueResponse,
    DecisionRequest,
    DecisionResponse,
    HierarchyRiskResponse,
)
from app.services.triage_service import TriageService
from app.db.decision_store import record_human_decision, get_decision_audit_trail

router = APIRouter(prefix="/queue", tags=["Investigator Triage Queue"])


@router.get("", response_model=TriageQueueResponse)
async def get_triage_queue(
    status: Optional[InvestigationStatus] = Query(None, description="Filter by human status (Pending/Confirmed/False Positive/Escalated)"),
    search: Optional[str] = Query(None, description="Search query by Candidate ID, Centre, State, City, or Flag reason"),
    min_risk: float = Query(0.0, ge=0.0, le=100.0, description="Minimum combined risk score filter"),
    page: int = Query(1, ge=1, description="Page number for virtualized pagination"),
    limit: int = Query(25, ge=1, le=500, description="Page size limit")
):
    """
    Returns paginated triage queue sorted by combined weighted risk score.
    Enables smooth navigation through thousands or lakhs of candidate results.
    """
    return TriageService.compute_triage_queue(
        status_filter=status,
        search=search,
        min_risk=min_risk,
        page=page,
        limit=limit
    )


@router.get("/geography", response_model=HierarchyRiskResponse)
async def get_hierarchy_risk():
    """
    Returns aggregated forensic risk metrics across national, state, and exam centre hierarchies for heatmaps.
    """
    return TriageService.get_hierarchy_risk()


# Also create top-level /decision endpoint
decision_router = APIRouter(prefix="/decision", tags=["Human Adjudication Engine"])


@decision_router.post("", response_model=DecisionResponse)
async def submit_investigator_decision(
    decision: DecisionRequest,
    x_uploader_identity: Optional[str] = Header(None, alias="X-Uploader-Identity")
):
    """
    Records a human investigator's adjudication decision.
    Strictly validates required justification.
    Immutably logs the action into the append-only decisions audit trail.
    """
    investigator = decision.investigator_identity or x_uploader_identity or "Lead Forensic Auditor (EXAM-SEC-7749)"

    try:
        decision_id, prev_status, timestamp = record_human_decision(
            entity_id=decision.entity_id,
            entity_type=decision.entity_type,
            new_status=decision.status,
            justification=decision.justification,
            investigator_identity=investigator
        )

        return DecisionResponse(
            success=True,
            decision_id=decision_id,
            entity_id=decision.entity_id,
            entity_type=decision.entity_type,
            previous_status=prev_status,
            new_status=decision.status,
            justification=decision.justification,
            investigator_identity=investigator,
            timestamp=timestamp,
            message=f"Human adjudication recorded: {decision.entity_id} set to {decision.status.value.upper()} by {investigator}."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record investigator decision: {str(e)}"
        )


@decision_router.get("/audit", response_model=List[Dict[str, Any]])
async def get_decision_audit(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Retrieves full immutable history of all human adjudication actions.
    """
    return get_decision_audit_trail(limit=limit, offset=offset)
