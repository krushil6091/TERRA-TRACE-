from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class InvestigationStatus(str, Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    FALSE_POSITIVE = "False Positive"
    ESCALATED = "Escalated"


class EntityType(str, Enum):
    CANDIDATE = "candidate"
    CENTRE = "centre"


class TriageItem(BaseModel):
    entity_id: str
    entity_type: EntityType
    centre_id: str
    centre_name: str
    state_name: str
    city_name: str
    room_id: Optional[str] = None
    seat_number: Optional[int] = None
    raw_calculated_score: Optional[float] = None
    server_score: Optional[float] = None
    score_discrepancy: Optional[float] = None
    reconciliation_risk: float = Field(0.0, description="Risk score from raw vs server mismatch (0-100)")
    macro_risk: float = Field(0.0, description="Risk score from centre-level statistical anomalies (0-100)")
    micro_risk: float = Field(0.0, description="Risk score from seating proximity collusion (0-100)")
    combined_risk_score: float = Field(..., description="Weighted composite risk score (0-100)")
    primary_flags: List[str] = Field(default_factory=list)
    status: InvestigationStatus = Field(default=InvestigationStatus.PENDING)
    last_decision_by: Optional[str] = None
    last_decision_at: Optional[str] = None
    last_decision_justification: Optional[str] = None
    is_synthetic: bool = False


class TriageSummaryCounts(BaseModel):
    total_flagged: int
    pending: int
    confirmed: int
    false_positive: int
    escalated: int
    high_risk_count: int


class TriageQueueResponse(BaseModel):
    items: List[TriageItem]
    total: int
    page: int
    limit: int
    total_pages: int
    summary: TriageSummaryCounts
    is_synthetic_active: bool


class DecisionRequest(BaseModel):
    entity_id: str = Field(..., description="Unique ID of the candidate or centre")
    entity_type: EntityType = Field(EntityType.CANDIDATE, description="Type of entity")
    status: InvestigationStatus = Field(..., description="Human-set status: Confirmed, False Positive, or Escalated")
    justification: str = Field(..., min_length=4, description="Required free-text explanation for why this decision was taken")
    investigator_identity: Optional[str] = Field(None, description="Identity / badge of the adjudicating investigator")

    @field_validator("justification")
    def validate_justification(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 4:
            raise ValueError("Justification must be at least 4 characters explaining the investigative rationale.")
        return v

    @field_validator("status")
    def validate_non_pending(cls, v: InvestigationStatus) -> InvestigationStatus:
        if v == InvestigationStatus.PENDING:
            raise ValueError("Cannot explicitly set status back to Pending; must select Confirmed, False Positive, or Escalated.")
        return v


class DecisionResponse(BaseModel):
    success: bool
    decision_id: int
    entity_id: str
    entity_type: EntityType
    previous_status: InvestigationStatus
    new_status: InvestigationStatus
    justification: str
    investigator_identity: str
    timestamp: str
    message: str


class CentreRiskAggregate(BaseModel):
    centre_id: str
    centre_name: str
    state_name: str
    city_name: str
    total_candidates: int
    flagged_candidates: int
    avg_risk_score: float
    max_risk_score: float
    pending_count: int
    confirmed_count: int
    false_positive_count: int
    escalated_count: int
    risk_level: str  # 'Critical', 'Elevated', 'Normal'


class HierarchyRiskResponse(BaseModel):
    centres: List[CentreRiskAggregate]
    total_centres: int
    total_flagged_centres: int
    is_synthetic: bool
