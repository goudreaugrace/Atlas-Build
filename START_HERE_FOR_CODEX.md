# Start Here for Codex

You are building a new prototype from scratch called **BBE Brand Doctor**.

## Product thesis

Build a brand-equity diagnostic system that behaves like a doctor for brands:

- Reads the brand health panel.
- Diagnoses the ailment.
- Explains the diagnosis in marketing language.
- Lets the user interrogate the data and visualizations.
- Surfaces treatment options from a governed pharmacy.
- Helps the user choose a treatment path and follow-up signals.

## Immediate development goal

Create a polished, single-brand prototype from the included scaffold and JSON data.

The first user journey must be:

```text
Find My Brand
→ Brand Health Panel
→ Diagnosis Explanation
→ Root Cause Explorer
→ Dialog With Data
→ Treatment Pharmacy
→ Treatment Plan
→ Follow-Up Signals
```

## Non-negotiables

1. This is single-brand first. Do not lead with Lay’s vs. PopCorners.
2. Do not build AIM OS UI or orchestration in this project.
3. Keep JSON-first data. Do not add Supabase until explicitly asked.
4. Load diagnosis and treatment logic from JSON/config, not hard-coded component text.
5. Brand Manager view must be simple, decisive, and plain-English.
6. Insights Lead view must expose evidence, rules, benchmarks, data provenance, and caveats.
7. Every diagnosis must show why to believe it.
8. Every treatment must show why it fits, pros/cons, cost, time, difficulty, likelihood, owners, and follow-up signals.
9. LLM chat must be scoped to the active brand record and active visual.
10. Do not imply cannibalization, portfolio migration, SKU price guidance, or causal proof unless the packet contains evidence.

## Suggested first task prompt

```text
Read AGENTS.md, docs/product/PRD.md, docs/design/UI_UX_SPEC.md, docs/data/DATA_MODEL.md, docs/diagnostics/DIAGNOSTIC_FRAMEWORK.md, docs/diagnostics/TREATMENT_LIBRARY.md, docs/ai/PROMPTS.md, and src/data/demo/brand-health-records.json.

Build/repair the prototype so it opens to a Find My Brand screen, allows a user to select a brand, and renders:
1. Brand Health Panel
2. Current Diagnosis
3. Why We Believe It
4. Root Cause Explorer
5. Treatment Pharmacy
6. Dialog With Data side panel

Use the included JSON data and config files. Keep UI simple, bold, PepsiCo-branded, and report-first.
Update STATUS.md and BACKLOG.md when complete.
```
