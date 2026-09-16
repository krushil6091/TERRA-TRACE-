import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.audit_store import init_audit_db
from app.db.decision_store import init_decision_db, get_db_connection
from app.schemas.triage import InvestigationStatus, EntityType

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_databases():
    init_audit_db()
    init_decision_db()
    # Reset test database state for test isolation
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM investigation_status")
        cursor.execute("DELETE FROM decisions_audit")
        conn.commit()


def test_sample_generation_and_queue():
    # Ingest synthetic sample benchmark datasets
    gen_res = client.post("/api/ingest/generate-sample", headers={"X-Uploader-Identity": "TestAuditor"})
    assert gen_res.status_code == 200

    # Query queue
    res = client.get("/api/queue?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["total"] > 0
    assert data["is_synthetic_active"] is True

    # Verify sorting by combined risk score descending
    scores = [it["combined_risk_score"] for it in data["items"]]
    assert scores == sorted(scores, reverse=True)

    # Top item should be the tamper anomaly CAND_001_01_005 (+25.0 score difference)
    top_item = data["items"][0]
    assert top_item["combined_risk_score"] >= 40.0
    assert top_item["status"] == "Pending"


def test_human_decision_workflow():
    # Generate sample dataset first
    client.post("/api/ingest/generate-sample", headers={"X-Uploader-Identity": "TestAuditor"})
    
    # Target candidate
    target_id = "CAND_001_01_005"

    # 1. Set to Confirmed with justification
    dec_res = client.post("/api/decision", json={
        "entity_id": target_id,
        "entity_type": "candidate",
        "status": "Confirmed",
        "justification": "Verified manual raw score tally does not match server entry. Direct score inflation confirmed.",
        "investigator_identity": "Lead Auditor Sharma (BADGE-882)"
    })
    assert dec_res.status_code == 200
    dec_data = dec_res.json()
    assert dec_data["success"] is True
    assert dec_data["previous_status"] == "Pending"
    assert dec_data["new_status"] == "Confirmed"

    # 2. Check queue reflects Confirmed status
    queue_res = client.get(f"/api/queue?search={target_id}")
    assert queue_res.status_code == 200
    items = queue_res.json()["items"]
    assert len(items) == 1
    assert items[0]["status"] == "Confirmed"
    assert items[0]["last_decision_by"] == "Lead Auditor Sharma (BADGE-882)"

    # 3. Check decisions audit trail
    audit_res = client.get("/api/decision/audit")
    assert audit_res.status_code == 200
    audits = audit_res.json()
    assert len(audits) >= 1
    latest = audits[0]
    assert latest["entity_id"] == target_id
    assert latest["new_status"] == "Confirmed"


def test_decision_validation_rejection():
    # Attempting to submit without justification or too short
    res_short = client.post("/api/decision", json={
        "entity_id": "CAND_002_01_012",
        "entity_type": "candidate",
        "status": "False Positive",
        "justification": "ok"  # Too short
    })
    assert res_short.status_code == 422

    # Attempting to set status to Pending (invalid transition)
    res_pending = client.post("/api/decision", json={
        "entity_id": "CAND_002_01_012",
        "entity_type": "candidate",
        "status": "Pending",
        "justification": "Reset to pending"
    })
    assert res_pending.status_code == 422


def test_geography_aggregation():
    # Ensure sample data exists
    client.post("/api/ingest/generate-sample", headers={"X-Uploader-Identity": "TestAuditor"})
    
    res = client.get("/api/queue/geography")
    assert res.status_code == 200
    geo = res.json()
    assert "centres" in geo
    assert len(geo["centres"]) > 0
    # Patna Centre 3 should have highest or elevated risk
    centre_ids = [c["centre_id"] for c in geo["centres"]]
    assert "CENTRE_003" in centre_ids
