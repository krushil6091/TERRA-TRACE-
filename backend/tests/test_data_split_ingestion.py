import urllib.request, urllib.parse, json, hashlib
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api"
ROOT_DIR = Path("d:/CODE/sih")

# 1. Reset system to clean state
req = urllib.request.Request(f"{BASE_URL}/ingest/reset", method="POST")
urllib.request.urlopen(req)

files_to_ingest = [
    (ROOT_DIR / "data" / "real" / "wbssc_omr_scores.csv", "omr", False),
    (ROOT_DIR / "data" / "real" / "wbssc_server_scores.csv", "server", False),
    (ROOT_DIR / "data" / "real" / "neet2024_centre_results.csv", "server", False),
    (ROOT_DIR / "data" / "synthetic" / "synthetic_omr_responses.csv", "omr", True),
    (ROOT_DIR / "data" / "synthetic" / "synthetic_seating_layout.csv", "seating", True),
]

print("="*80)
print("STEP-BY-STEP INGESTION TEST")
print("="*80)

for idx, (filepath, record_type, is_synthetic) in enumerate(files_to_ingest, 1):
    file_bytes = filepath.read_bytes()
    expected_hash = hashlib.sha256(file_bytes).hexdigest()
    
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filepath.name}\"\r\nContent-Type: text/csv\r\n\r\n".encode("utf-8"))
    body.extend(file_bytes)
    body.extend(f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"record_type\"\r\n\r\n{record_type}".encode("utf-8"))
    body.extend(f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"is_synthetic\"\r\n\r\n{str(is_synthetic).lower()}".encode("utf-8"))
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        f"{BASE_URL}/ingest",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "X-Uploader-Identity": "Forensic_Auditor_General"
        },
        method="POST"
    )
    res = urllib.request.urlopen(req)
    res_data = json.loads(res.read().decode())
    
    logs_res = urllib.request.urlopen(f"{BASE_URL}/audit-logs")
    logs = json.loads(logs_res.read().decode())
    
    print(f"File {idx}/5: {filepath.name} ({record_type.upper()})")
    print(f"  Ingested Rows: {res_data['row_count']:,}")
    print(f"  Calculated SHA-256: {res_data['file_hash_sha256']}")
    print(f"  Expected SHA-256:   {expected_hash}")
    print(f"  Audit Log Entries Count: {len(logs)} (Latest Log ID #{logs[0]['id']})")
    assert res_data["file_hash_sha256"] == expected_hash, "Hash mismatch!"
    assert len(logs) == idx, f"Expected {idx} audit entries, found {len(logs)}"
    print("  Status: PASS [Audit Checkpoint Verified]")
    print("-"*80)

print("\n" + "="*80)
print("RUNNING THREE ANALYTICAL LAYERS ON INGESTED DATA")
print("="*80)

q_res = urllib.request.urlopen(f"{BASE_URL}/queue?limit=100")
q_data = json.loads(q_res.read().decode())

geo_res = urllib.request.urlopen(f"{BASE_URL}/queue/geography")
geo_data = json.loads(geo_res.read().decode())

items = q_data["items"]
total_flagged = q_data["summary"]["total_flagged"]

rec_flags = [it for it in items if it["reconciliation_risk"] > 0]
macro_flags = [it for it in items if it["macro_risk"] >= 25.0]
micro_flags = [it for it in items if it["micro_risk"] >= 30.0]

print(f"Total Candidates in Ingested Cohort: 200")
print(f"Total Flagged Entities in Triage Queue: {total_flagged}")
print(f"  1. Reconciliation Layer (Score Discrepancies): {len(rec_flags)} flagged candidates")
for it in rec_flags:
    print(f"     - {it['entity_id']} ({it['centre_name']}) | OMR: {it['raw_calculated_score']} -> Server: {it['server_score']} (Diff: {it['score_discrepancy']:+0.1f}) | Rec Risk: {it['reconciliation_risk']}")

print(f"  2. Macro Layer (Cohort Distribution Anomalies): {len(macro_flags)} candidates across anomalous centres")
print(f"  3. Micro Layer (Adjacent Collusion Clusters): {len(micro_flags)} candidates flagged")
for it in micro_flags[:6]:
    print(f"     - {it['entity_id']} ({it['centre_id']}, Room {it['room_id']}, Seat #{it['seat_number']}) | Micro Risk: {it['micro_risk']}")

print(f"\nTotal Exam Centres in Registry: {geo_data['total_centres']}")
print(f"Flagged Centres with Active Anomalies: {geo_data['total_flagged_centres']}")
for c in geo_data["centres"]:
    print(f"  - {c['centre_id']} ({c['centre_name']}) -> Max Risk: {c['max_risk_score']}, Avg Risk: {c['avg_risk_score']}, Flagged: {c['flagged_candidates']}/{c['total_candidates']}, Level: {c['risk_level']}")