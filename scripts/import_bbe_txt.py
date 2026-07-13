"""Import BBE pipe-delimited text exports into JSON.

Usage:
  python scripts/import_bbe_txt.py data/raw/2026.Q1.United\ States.Snacks\ 169\(1\).txt
"""
import csv, json, sys
from pathlib import Path

if len(sys.argv) < 2:
    raise SystemExit("Usage: python scripts/import_bbe_txt.py <input.txt>")

path = Path(sys.argv[1])
with path.open(encoding="cp1252") as f:
    rows = list(csv.DictReader(f, delimiter="|"))

for r in rows:
    try:
        r["valueNumber"] = float(str(r.get("Value", "")).replace("%", "").replace(",", ""))
    except Exception:
        r["valueNumber"] = None
    r["sourceFile"] = path.name

out = path.with_suffix(".json")
out.write_text(json.dumps(rows, indent=2), encoding="utf-8")
print(f"Wrote {len(rows)} rows to {out}")
