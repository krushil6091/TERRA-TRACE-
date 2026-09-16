import urllib.request, urllib.parse, json, hashlib
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api"
ROOT_DIR = Path("d:/CODE/sih")

# 1. Reset
req = urllib.request.Request(f"{BASE_URL}/ingest/reset", method="POST")
urllib.request.urlopen(req)

# Ingest Synthetic Complete Set
files_to_ingest = [
    (ROOT_DIR / "data" / "synthetic" / "synthetic_omr_responses.csv", "omr", True),
    (ROOT_DIR / "data" / "synthetic" / "synthetic_server_scores.csv", "server", True),
    (ROOT_DIR / "data" / "synthetic" / "synthetic_seating_layout.csv", "seating", True),
]

for filepath, record_type, is_synthetic in files_to_ingest:
    file_bytes = filepath.read_bytes()
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
    urllib.request.urlopen(req)

q_res = urllib.request.urlopen(f"{BASE_URL}/queue?limit=100")
q_data = json.loads(q_res.read().decode())
items = q_data["items"]
total_flagged = q_data["summary"]["total_flagged"]

rec_flags = [it for it in items if it["reconciliation_risk"] > 0]
macro_flags = [it for it in items if it["macro_risk"] >= 25.0]
micro_flags = [it for it in items if it["micro_risk"] >= 30.0]

print("="*80)
print("SYNTHETIC DATASET LAYER TEST RESULTS")
print("="*80)
print(f"Total Candidates: 200")
print(f"Total Flagged Entities in Triage Queue: {total_flagged} / 200")
print(f"  - Reconciliation flags (Tamper Discrepancies): {len(rec_flags)}")
for it in rec_flags:
    print(f"    * {it['entity_id']}: OMR {it['raw_calculated_score']} -> Server {it['server_score']} (Discrepancy: {it['score_discrepancy']:+0.1f})")

print(f"  - Macro flags (Centre Cohort Anomalies): {len(macro_flags)}")
print(f"  - Micro flags (Seating Collusion Clusters): {len(micro_flags)}")