from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RecordType(str, Enum):
    OMR = "omr"
    SERVER = "server"
    SEATING = "seating"


class OMRRecord(BaseModel):
    """
    Schema for OMR / CBT item-level response records.
    """
    candidate_id: str = Field(..., description="Unique identifier for the candidate")
    centre_id: str = Field(..., description="Unique identifier for the examination centre")
    room_id: str = Field(..., description="Room / hall identifier within the centre")
    seat_number: int = Field(..., description="Seat number or sequential seat index")
    question_id: str = Field(..., description="Unique question identifier")
    selected_option: Optional[str] = Field(None, description="Selected option ('A', 'B', 'C', 'D', or null/blank)")
    raw_score: float = Field(..., description="Score awarded for this specific question")

    model_config = {
        "extra": "ignore"
    }


class ServerRecord(BaseModel):
    """
    Schema for Server-side final result records.
    """
    candidate_id: str = Field(..., description="Unique identifier for the candidate")
    final_score: float = Field(..., description="Final tabulated/published score on the server")
    server_timestamp: str = Field(..., description="Server timestamp of result publication or entry")

    model_config = {
        "extra": "ignore"
    }


class SeatingRecord(BaseModel):
    """
    Schema for Seating layout records (used for micro-layer spatial proximity gating).
    """
    candidate_id: str = Field(..., description="Unique identifier for the candidate")
    centre_id: str = Field(..., description="Unique identifier for the examination centre")
    room_id: str = Field(..., description="Room / hall identifier within the centre")
    seat_number: int = Field(..., description="Seat number or sequential seat index")

    model_config = {
        "extra": "ignore"
    }


# Required columns dictionary for Polars validation
REQUIRED_COLUMNS: Dict[RecordType, List[str]] = {
    RecordType.OMR: [
        "candidate_id",
        "centre_id",
        "room_id",
        "seat_number",
        "question_id",
        "selected_option",
        "raw_score",
    ],
    RecordType.SERVER: [
        "candidate_id",
        "final_score",
        "server_timestamp",
    ],
    RecordType.SEATING: [
        "candidate_id",
        "centre_id",
        "room_id",
        "seat_number",
    ],
}


class IngestionResponse(BaseModel):
    success: bool
    record_type: RecordType
    filename: str
    file_hash_sha256: str
    row_count: int
    columns_found: List[str]
    is_synthetic: bool
    uploader_identity: str
    timestamp: str
    message: str


class ValidationErrorDetail(BaseModel):
    record_type: RecordType
    missing_columns: List[str]
    present_columns: List[str]
    required_columns: List[str]
    error_message: str


class DatasetStatus(BaseModel):
    record_type: RecordType
    is_ingested: bool
    filename: Optional[str] = None
    file_hash_sha256: Optional[str] = None
    row_count: int = 0
    candidate_count: int = 0
    is_synthetic: bool = False
    last_updated: Optional[str] = None


class DatasetRowPreview(BaseModel):
    data: Dict[str, Any]
    is_proven_wrong: bool
    verdict: Optional[str] = None
    highlighted_columns: List[str] = Field(default_factory=list)
    evidence_diff: Optional[Dict[str, Any]] = None


class DatasetPreviewResponse(BaseModel):
    record_type: RecordType
    filename: str
    total_rows: int
    flagged_rows_count: int
    columns: List[str]
    rows: List[DatasetRowPreview]
    is_synthetic: bool = False
