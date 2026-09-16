import sqlite3
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from app.config import DB_PATH
from app.schemas.triage import InvestigationStatus, EntityType


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_decision_db():
    """
    Initializes the human decision tracking table and the append-only immutable decision audit table.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Current human investigation status per entity
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS investigation_status (
                entity_id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                last_decision_by TEXT,
                last_decision_at TEXT,
                last_decision_justification TEXT
            )
        """)
        
        # Append-only immutable decision audit log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS decisions_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                previous_status TEXT NOT NULL,
                new_status TEXT NOT NULL,
                justification TEXT NOT NULL,
                investigator_identity TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_decisions_entity ON decisions_audit (entity_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions_audit (timestamp DESC)
        """)
        conn.commit()


def get_all_investigation_statuses() -> Dict[str, Dict[str, Any]]:
    """
    Returns map of entity_id -> status dictionary for all manually adjudicated items.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM investigation_status")
        rows = cursor.fetchall()
        return {
            row["entity_id"]: {
                "status": row["status"],
                "last_decision_by": row["last_decision_by"],
                "last_decision_at": row["last_decision_at"],
                "last_decision_justification": row["last_decision_justification"]
            }
            for row in rows
        }


def get_entity_status(entity_id: str) -> InvestigationStatus:
    """
    Gets the current status of an entity. Defaults to Pending if never adjudicated.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT status FROM investigation_status WHERE entity_id = ?",
            (entity_id,)
        )
        row = cursor.fetchone()
        if row:
            return InvestigationStatus(row["status"])
        return InvestigationStatus.PENDING


def record_human_decision(
    entity_id: str,
    entity_type: EntityType,
    new_status: InvestigationStatus,
    justification: str,
    investigator_identity: str
) -> Tuple[int, InvestigationStatus, str]:
    """
    Atomically:
    1. Reads previous status (defaults to 'Pending' if first human action)
    2. Writes to append-only decisions_audit log
    3. Updates investigation_status
    Returns (decision_audit_id, previous_status, timestamp)
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    previous_status = get_entity_status(entity_id)

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Append to immutable decisions_audit log
        cursor.execute("""
            INSERT INTO decisions_audit (
                timestamp,
                entity_id,
                entity_type,
                previous_status,
                new_status,
                justification,
                investigator_identity
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            entity_id,
            entity_type.value,
            previous_status.value,
            new_status.value,
            justification,
            investigator_identity
        ))
        decision_id = cursor.lastrowid

        # 2. Upsert current status in investigation_status
        cursor.execute("""
            INSERT INTO investigation_status (
                entity_id,
                entity_type,
                status,
                last_decision_by,
                last_decision_at,
                last_decision_justification
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(entity_id) DO UPDATE SET
                status = excluded.status,
                last_decision_by = excluded.last_decision_by,
                last_decision_at = excluded.last_decision_at,
                last_decision_justification = excluded.last_decision_justification
        """, (
            entity_id,
            entity_type.value,
            new_status.value,
            investigator_identity,
            timestamp,
            justification
        ))

        conn.commit()
        return decision_id, previous_status, timestamp


def get_decision_audit_trail(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Returns full immutable audit trail of all human adjudications.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM decisions_audit
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        return [dict(row) for row in cursor.fetchall()]


def clear_all_decisions():
    """
    Clears all investigation status records and decision audit entries for administrative system reset.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM investigation_status")
        cursor.execute("DELETE FROM decisions_audit")
        try:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('investigation_status', 'decisions_audit')")
        except Exception:
            pass
        conn.commit()

