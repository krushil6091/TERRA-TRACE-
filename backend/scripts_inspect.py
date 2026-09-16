import os
from pathlib import Path
import sqlite3

base = Path("d:/CODE/sih/backend/data")
print("=== DATA DIR FILES ===")
for root, dirs, files in os.walk(base):
    print(root, dirs, files)

db_path = base / "audit.db"
if db_path.exists():
    conn = sqlite3.connect(str(db_path))
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in c.fetchall()]
    print("\n=== SQLITE TABLES ===", tables)
    for t in tables:
        if t != "sqlite_sequence":
            c.execute(f"SELECT count(*) FROM {t}")
            print(f"Table {t} row count: {c.fetchone()[0]}")