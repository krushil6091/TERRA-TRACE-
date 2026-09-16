from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.triage import InvestigationStatus, EntityType


class QuestionResponseItem(BaseModel):
    question_id: str
    selected_option: Optional[str] = None
    raw_score: float


class DistributionPoint(BaseModel):
    score: float
    centre_density: float
    national_density: float


class MacroDistributionData(BaseModel):
    centre_id: str
    centre_name: str
    points: List[DistributionPoint]
    centre_mean: float
    centre_std: float
    national_mean: float
    national_std: float
    ks_statistic_d: float
    ks_p_value_approx: float
    divergence_summary: str


class RoomSeatCandidate(BaseModel):
    seat_number: int
    candidate_id: str
    score: float
    risk_score: float
    is_target: bool
    is_flagged_pair: bool
    status: InvestigationStatus


class CollusionPair(BaseModel):
    candidate_1: str
    candidate_2: str
    seat_1: int
    seat_2: int
    distance: int
    shared_incorrect_answers: int
    omega_index_approx: float
    evidence_note: str


class MicroSeatingData(BaseModel):
    room_id: str
    total_seats: int
    candidates: List[RoomSeatCandidate]
    collusion_pairs: List[CollusionPair]
    cluster_detected: bool


class ReconciliationDetail(BaseModel):
    raw_total_score: float
    server_score: float
    score_discrepancy: float
    tamper_flag: bool
    tamper_type: str  # "NONE" | "INFLATION" | "DEFLATION"
    tamper_explanation: str
    question_items: List[QuestionResponseItem]


class CandidateDrilldownResponse(BaseModel):
    candidate_id: str
    centre_id: str
    centre_name: str
    state_name: str
    city_name: str
    room_id: str
    seat_number: int
    combined_risk_score: float
    reconciliation_risk: float
    macro_risk: float
    micro_risk: float
    primary_flags: List[str]
    status: InvestigationStatus
    reconciliation: ReconciliationDetail
    macro: MacroDistributionData
    micro: MicroSeatingData
    decision_history: List[Dict[str, Any]]
    audit_hashes: Dict[str, str]
    is_synthetic: bool
    generated_at: str
