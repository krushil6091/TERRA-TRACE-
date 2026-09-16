from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.audit import AuditLogEntry
from app.db.audit_store import get_audit_logs

router = APIRouter(prefix="/audit-logs", tags=["Cryptographic Audit Log"])


@router.get("", response_model=List[AuditLogEntry])
async def list_audit_logs(
    record_type: Optional[str] = Query(None, description="Filter by record type ('omr', 'server', 'seating')"),
    uploader_identity: Optional[str] = Query(None, description="Filter by uploader identity"),
    limit: int = Query(100, ge=1, le=1000, description="Max entries to return"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Retrieves the append-only cryptographic audit logs for verification.
    """
    return get_audit_logs(
        record_type=record_type,
        uploader_identity=uploader_identity,
        limit=limit,
        offset=offset
    )
