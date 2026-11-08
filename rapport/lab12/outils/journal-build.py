"""Resume lisible du journal JSONL d'un build EAS.

Usage : python journal-build.py <journal.log>
"""
import json
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print("Usage : python journal-build.py <journal.log>")
    raise SystemExit(2)

entries = []
for line in Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace").splitlines():
    line = line.strip()
    if line.startswith("{"):
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            pass

phases = []
for entry in entries:
    if entry.get("marker") == "START_PHASE":
        phases.append(
            {"name": entry["phase"], "start": entry["time"], "ms": None, "result": ""}
        )
    elif entry.get("marker") == "END_PHASE" and phases and phases[-1]["name"] == entry["phase"]:
        phases[-1]["ms"] = entry.get("durationMs")
        phases[-1]["result"] = entry.get("result", "")

print("PHASES DU BUILD EAS")
print("-" * 58)
for phase in phases:
    seconds = (phase["ms"] or 0) / 1000
    print(f"{phase['name']:<38}{seconds:>9.1f} s  {phase['result']}")
total = sum((p["ms"] or 0) for p in phases) / 1000
print("-" * 58)
print(f"{'Total des phases mesurees':<38}{total:>9.1f} s")

print()
print("EVENEMENTS CLES")
print("-" * 58)
wanted = [
    "Running \"npm ci",
    "Version code:",
    "Starting Metro Bundler",
    "Android Bundled",
    "Running 'gradlew",
    "BUILD SUCCESSFUL",
    "actionable tasks",
    "Application archives:",
    "app-release.apk",
    "Updated resolved version",
]
for entry in entries:
    message = entry.get("msg") or ""
    if any(message.startswith(w) or w in message for w in wanted):
        print(f"[{entry.get('phase', '')[:24]:<24}] {message[:110]}")
