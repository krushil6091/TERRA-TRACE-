import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.audit_store import init_audit_db
from app.db.decision_store import init_decision_db, get_db_connection

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_databases():
    init_audit_db()
    init_decision_db()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM investigation_status")
        cursor.execute("DELETE FROM decisions_audit")
        conn.commit()


def test_candidate_drilldown():
    # Ingest synthetic sample benchmark datasets
    client.post("/api/ingest/generate-sample", headers={"X-Uploader-Identity": "TestAuditor"})

    target_id = "CAND_001_01_005"
    res = client.get(f"/api/drilldown/{target_id}")
    assert res.status_code == 200
    data = res.json()

    # Check candidate identity & location
    assert data["candidate_id"] == target_id
    assert data["centre_id"] == "CENTRE_001"
    assert data["room_id"] == "R01"
    assert data["seat_number"] == 5

    # Check Reconciliation Layer: Tamper detected (+25.0 score difference)
    rec = data["reconciliation"]
    assert rec["tamper_flag"] is True
    assert rec["tamper_type"] == "INFLATION"
    assert rec["score_discrepancy"] == 25.0
    assert len(rec["question_items"]) > 0

    # Check Macro Layer: Overlapping bell curve points and KS stats
    macro = data["macro"]
    assert len(macro["points"]) > 10
    assert macro["centre_mean"] > 0
    assert macro["national_mean"] > 0

    # Check Micro Layer: Room seating grid
    micro = data["micro"]
    assert micro["total_seats"] > 0
    assert len(micro["candidates"]) > 0
    target_seat = next(c for c in micro["candidates"] if c["is_target"])
    assert target_seat["seat_number"] == 5

    # Check Cryptographic Audit hashes
    assert "omr_sha256" in data["audit_hashes"]
    assert len(data["audit_hashes"]["omr_sha256"]) == 64


def test_pdf_dossier_export():
    # Ingest synthetic sample benchmark datasets
    client.post("/api/ingest/generate-sample", headers={"X-Uploader-Identity": "TestAuditor"})

    target_id = "CAND_001_01_005"
    res = client.get(f"/api/dossier/{target_id}")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert f"TerraTrace_Evidence_Dossier_{target_id}.pdf" in res.headers["content-disposition"]
    # Verify PDF magic bytes
    assert res.content.startswith(b"%PDF")
    assert len(res.content) > 1000  # Valid non-empty PDF file
