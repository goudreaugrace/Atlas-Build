# Diagnosis Engine

The diagnosis engine is deterministic. AI can explain the result, but it does not choose the diagnosis.

## How A Diagnosis Fires

The engine evaluates rules from `diagnosis_rules.json` against the active Brand Health Record. A rule can include:

- Required conditions.
- Any-of conditions.
- Counter-evidence conditions.
- Thresholds on metric value, benchmark band, Ahead status, or momentum.

The highest-supported fired rule becomes the primary diagnosis. If no deterministic rule fires, the seeded Brand Health Record diagnosis can be used as a fallback trace.

## Evidence Ledger

For each diagnosis, the system exposes:

- Supporting evidence.
- Complicating evidence.
- Missing evidence.
- What not to conclude.
- Rule confidence.
- Source and slide context where available.

## Rule & Evidence Trace

The Rule & Evidence Trace drawer makes the system inspectable. It shows:

- The fired rule.
- Matched conditions.
- Missing or unmatched conditions.
- Counter-evidence.
- All evaluated rules.
- Treatment links.
- Perceived Value / Pricing Power source-metric and category-lens guardrails.

## Confidence

Confidence is not a universal truth score. It is a practical read of how much evidence is present in the current packet. Momentum gaps, missing GN data, or weak benchmark coverage should reduce confidence or make it directional.

## Important Boundary

Do not diagnose causality from these rules. A fired diagnosis says the observed pattern fits a configured diagnostic profile. It does not prove why the brand got there.
