from fastapi import APIRouter, Response, HTTPException, status
from fastapi.responses import StreamingResponse
import io

from app.schemas.drilldown import CandidateDrilldownResponse
from app.services.drilldown_service import DrilldownService
from app.services.pdf_dossier_service import generate_dossier_pdf

router = APIRouter(tags=["Candidate Drilldown & Forensic Dossier Export"])


@router.get("/drilldown/{candidate_id}", response_model=CandidateDrilldownResponse)
async def get_candidate_drilldown(candidate_id: str):
    """
    Retrieves deep-dive forensic analytics for a specific candidate:
    - Reconciliation (Raw vs Server Score, Question items, Tamper flag)
    - Macro layer (Overlapping bell curve points for Centre vs National)
    - Micro layer (Spatial 2D room seating layout and proximity collisions)
    - Cryptographic SHA-256 source data checkpoints
    - Human adjudication audit trail
    """
    return DrilldownService.get_candidate_drilldown(candidate_id=candidate_id)


@router.get("/dossier/{candidate_id}")
async def export_candidate_dossier_pdf(candidate_id: str):
    """
    Generates and downloads an official, tamper-evident forensic PDF Evidence Dossier
    bound to the SHA-256 ingestion checkpoints for independent verification.
    """
    data = DrilldownService.get_candidate_drilldown(candidate_id=candidate_id)
    pdf_bytes = generate_dossier_pdf(data)

    filename = f"TerraTrace_Evidence_Dossier_{candidate_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Dossier-Candidate": candidate_id,
            "X-Dossier-Status": data.status.value,
        }
    )
