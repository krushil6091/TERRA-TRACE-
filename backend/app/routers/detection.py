from fastapi import APIRouter
from app.schemas.detection import DetectionResultsResponse
from app.services.detection_service import DetectionService

router = APIRouter(prefix="/detection", tags=["Explainable Detection Results"])


@router.get("/results", response_model=DetectionResultsResponse)
async def get_detection_results():
    """
    Returns explainable detection result panels for each of the 3 analytical layers:
    - Layer 1: Reconciliation Check (Original vs Published Score mismatches)
    - Layer 2: Centre Pattern Check (KS distribution divergence vs National baseline)
    - Layer 3: Neighbour Answer Check (Wollack Omega & Holland K-index simulated collusion)
    """
    return DetectionService.compute_all_detection_results()