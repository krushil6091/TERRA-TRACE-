from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ReconciliationResultItem(BaseModel):
    candidate_id: str
    original_score: float
    published_score: float
    difference: float
    tamper_type: str


class ReconciliationDetectionResult(BaseModel):
    layer_name: str = "Reconciliation Check"
    checks_summary: str = "Compares each candidate's original recorded score to their final published score."
    total_candidates_checked: int
    mismatches_found: int
    found_summary: str
    flagged_items: List[ReconciliationResultItem]
    technical_details: Dict[str, Any]
    source_dataset_name: str


class MacroResultItem(BaseModel):
    centre_id: str
    centre_name: str
    state_name: str
    total_candidates: int
    flagged_candidates: Optional[int] = 0
    why_it_stood_out: str
    ks_statistic_d: float
    p_value: float
    kurtosis_val: float
    centre_avg: float
    national_avg: float


class MacroDetectionResult(BaseModel):
    layer_name: str = "Centre Pattern Check"
    checks_summary: str = "Compares each exam centre's score pattern to the national pattern."
    total_centres_checked: int
    anomalous_centres_found: int
    found_summary: str
    flagged_items: List[MacroResultItem]
    technical_details: Dict[str, Any]
    source_dataset_name: str


class MicroResultItem(BaseModel):
    candidate_a: str
    candidate_b: str
    centre_id: str
    room_id: str
    seat_distance: int
    shared_wrong_answers: int
    total_source_errors: int
    omega_index: float
    k_index_p_val: float


class MicroDetectionResult(BaseModel):
    layer_name: str = "Neighbour Answer Check (Micro Layer)"
    is_simulated: bool = True
    simulated_notice: str = "This layer is shown on simulated data. No Indian exam body has publicly released real item-level response data, so this cannot yet be demonstrated on a real case — shown here on realistic test data instead."
    checks_summary: str = "Compares neighbouring candidates' wrong answers for suspicious matching patterns."
    total_pairs_checked: int
    flagged_pairs_found: int
    found_summary: str
    flagged_items: List[MicroResultItem]
    technical_details: Dict[str, Any]
    source_dataset_name: str


class DetectionResultsResponse(BaseModel):
    is_ready: bool
    reconciliation: ReconciliationDetectionResult
    macro: MacroDetectionResult
    micro: MicroDetectionResult