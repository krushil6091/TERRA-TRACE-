import io
import pytest
from fastapi.testclient import TestClient
import polars as pl
from app.main import app
from app.db.audit_store import init_audit_db, get_audit_logs
from app.services.hash_service import compute_sha256

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_audit_db()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_omr_ingestion_valid():
    df = pl.DataFrame({
        "candidate_id": ["C001", "C002"],
        "centre_id": ["CENTRE_01", "CENTRE_01"],
        "room_id": ["R01", "R01"],
        "seat_number": [1, 2],
        "question_id": ["Q01", "Q01"],
        "selected_option": ["A", "B"],
        "raw_score": [4.0, -1.0]
    })
    buf = io.BytesIO()
    df.write_csv(buf)
    file_bytes = buf.getvalue()
    expected_hash = compute_sha256(file_bytes)

    response = client.post(
        "/api/ingest",
        files={"file": ("test_omr.csv", file_bytes, "text/csv")},
        data={"record_type": "omr", "is_synthetic": "true"},
        headers={"X-Uploader-Identity": "Audit_Officer_Test"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["record_type"] == "omr"
    assert data["file_hash_sha256"] == expected_hash
    assert data["row_count"] == 2
    assert data["is_synthetic"] is True


def test_missing_column_rejection():
    # OMR missing 'selected_option' and 'centre_id'
    df_invalid = pl.DataFrame({
        "candidate_id": ["C001", "C002"],
        "room_id": ["R01", "R01"],
        "seat_number": [1, 2],
        "question_id": ["Q01", "Q01"],
        "raw_score": [4.0, -1.0]
    })
    buf = io.BytesIO()
    df_invalid.write_csv(buf)
    file_bytes = buf.getvalue()

    response = client.post(
        "/api/ingest",
        files={"file": ("invalid_omr.csv", file_bytes, "text/csv")},
        data={"record_type": "omr", "is_synthetic": "false"},
        headers={"X-Uploader-Identity": "Audit_Officer_Test"}
    )
    # Must reject with 400 Bad Request and detailed missing columns
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "missing_columns" in detail
    assert "centre_id" in detail["missing_columns"]
    assert "selected_option" in detail["missing_columns"]


def test_server_records_ingestion():
    df = pl.DataFrame({
        "candidate_id": ["C001", "C002"],
        "final_score": [85.5, 92.0],
        "server_timestamp": ["2026-09-15T10:00:00Z", "2026-09-15T10:00:00Z"]
    })
    buf = io.BytesIO()
    df.write_csv(buf)
    file_bytes = buf.getvalue()

    response = client.post(
        "/api/ingest",
        files={"file": ("server_scores.csv", file_bytes, "text/csv")},
        data={"record_type": "server", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    assert response.json()["row_count"] == 2


def test_seating_records_ingestion():
    df = pl.DataFrame({
        "candidate_id": ["C001", "C002"],
        "centre_id": ["CENTRE_01", "CENTRE_01"],
        "room_id": ["R01", "R01"],
        "seat_number": [1, 2]
    })
    buf = io.BytesIO()
    df.write_csv(buf)
    file_bytes = buf.getvalue()

    response = client.post(
        "/api/ingest",
        files={"file": ("seating.csv", file_bytes, "text/csv")},
        data={"record_type": "seating", "is_synthetic": "false"}
    )
    assert response.status_code == 200
    assert response.json()["row_count"] == 2


def test_audit_logs_append_only():
    logs_res = client.get("/api/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 4  # Includes both success and validation error entries
    # Verify presence of SHA-256 hashes
    for entry in logs:
        assert len(entry["file_hash"]) == 64
        assert entry["uploader_identity"] is not None


def test_dataset_preview_endpoint():
    # Load WBSSC sample preset
    load_res = client.post("/api/ingest/load-sample?preset=wbssc")
    assert load_res.status_code == 200

    # 1. Test server preview
    srv_res = client.get("/api/ingest/preview/server?limit=50")
    assert srv_res.status_code == 200
    srv_data = srv_res.json()
    assert srv_data["record_type"] == "server"
    assert srv_data["total_rows"] == 200
    assert srv_data["flagged_rows_count"] > 0
    assert "final_score" in srv_data["columns"]

    # Check that flagged row has highlighted_columns and verdict
    flagged_srv = [r for r in srv_data["rows"] if r["is_proven_wrong"]]
    assert len(flagged_srv) > 0
    first_flagged = flagged_srv[0]
    assert "final_score" in first_flagged["highlighted_columns"]
    assert "PROVEN" in first_flagged["verdict"]

    # 2. Test only_flagged filter
    filtered_res = client.get("/api/ingest/preview/server?only_flagged=true")
    assert filtered_res.status_code == 200
    filtered_data = filtered_res.json()
    assert all(r["is_proven_wrong"] for r in filtered_data["rows"])
    assert filtered_data["total_rows"] == srv_data["flagged_rows_count"]

    # 3. Test seating preview
    seat_res = client.get("/api/ingest/preview/seating?only_flagged=true")
    assert seat_res.status_code == 200
    seat_data = seat_res.json()
    assert seat_data["record_type"] == "seating"
    assert len(seat_data["rows"]) > 0
    assert any("seat_number" in r["highlighted_columns"] for r in seat_data["rows"])

    # 4. Test omr preview
    omr_res = client.get("/api/ingest/preview/omr?limit=50&only_flagged=true")
    assert omr_res.status_code == 200
    omr_data = omr_res.json()
    assert omr_data["record_type"] == "omr"
    assert len(omr_data["rows"]) > 0

