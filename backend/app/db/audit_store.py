import sqlite3
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.config import DB_PATH
from app.schemas.audit import AuditLogEntry


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_audit_db():
    """
    Initializes the append-only audit log SQLite database schema.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                record_type TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                file_size_bytes INTEGER NOT NULL,
                row_count INTEGER NOT NULL,
                uploader_identity TEXT NOT NULL,
                is_synthetic INTEGER NOT NULL,
                status TEXT NOT NULL,
                details TEXT
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_logs_file_hash ON audit_logs (file_hash)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_logs_record_type ON audit_logs (record_type)
        """)
        conn.commit()


def log_audit_event(
    record_type: str,
    filename: str,
    file_hash: str,
    file_size_bytes: int,
    row_count: int,
    uploader_identity: str,
    is_synthetic: bool,
    status: str,
    details: Optional[str] = None,
    timestamp: Optional[str] = None
) -> int:
    """
    Appends a new audit record to the append-only table. Never updates or deletes rows.
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs (
                timestamp,
                record_type,
                filename,
                file_hash,
                file_size_bytes,
                row_count,
                uploader_identity,
                is_synthetic,
                status,
                details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            record_type,
            filename,
            file_hash,
            file_size_bytes,
            row_count,
            uploader_identity,
            1 if is_synthetic else 0,
            status,
            details
        ))
        conn.commit()
        return cursor.lastrowid


def get_audit_logs(
    record_type: Optional[str] = None,
    uploader_identity: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[AuditLogEntry]:
    """
    Retrieves audit log entries ordered newest first.
    """
    query = "SELECT * FROM audit_logs WHERE 1=1"
    params: List[Any] = []

    if record_type:
        query += " AND record_type = ?"
        params.append(record_type)

    if uploader_identity:
        query += " AND uploader_identity = ?"
        params.append(uploader_identity)

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [
            AuditLogEntry(
                id=row["id"],
                timestamp=row["timestamp"],
                record_type=row["record_type"],
                filename=row["filename"],
                file_hash=row["file_hash"],
                file_size_bytes=row["file_size_bytes"],
                row_count=row["row_count"],
                uploader_identity=row["uploader_identity"],
                is_synthetic=bool(row["is_synthetic"]),
                status=row["status"],
                details=row["details"]
            )
            for row in rows
        ]


def get_latest_valid_hash(record_type: str) -> Optional[Dict[str, Any]]:
    """
    Gets the latest successful ingestion record for a specific record type.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM audit_logs
            WHERE record_type = ? AND status = 'SUCCESS'
            ORDER BY id DESC LIMIT 1
        """, (record_type,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def clear_audit_logs():
    """
    Clears all rows from audit_logs table for administrative system reset.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM audit_logs")
        try:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name = 'audit_logs'")
        except Exception:
            pass
        conn.commit()

