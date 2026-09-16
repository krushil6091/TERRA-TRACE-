from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditLogEntry(BaseModel):
    id: int
    timestamp: str
    record_type: str
    filename: str
    file_hash: str
    file_size_bytes: int
    row_count: int
    uploader_identity: str
    is_synthetic: bool
    status: str
    details: Optional[str] = None


class AuditLogFilter(BaseModel):
    record_type: Optional[str] = None
    uploader_identity: Optional[str] = None
    limit: int = 100
    offset: int = 0
