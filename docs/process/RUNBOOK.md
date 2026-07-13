# Runbook

## Local setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Data validation

```bash
pnpm validate:data
```

## Build check

```bash
pnpm typecheck
pnpm build
```

## Demo recording flow

Recommended primary route: `/brand/lay-s`.

Use Lay's when the team needs to see that Brand Doctor is not only for weak brands. The story is an iconic, structurally strong brand with a real momentum warning: Demand Power, Salient, and Meaningful are strong, but Demand Power and Meaningful are declining, while Perceived Value and Different are not ahead.

Suggested sequence:

1. Open `/start-here` and frame BBE as the diagnostic spine.
2. Open `/brand/lay-s` and let the executive brief generate on screen.
3. Read BBE Bloodwork first: current strength, trajectory, and benchmark tension.
4. Open Diagnosis And Evidence and explain why Strong but Slipping fired.
5. Open Rule & Evidence Trace to show deterministic rules and evidence provenance.
6. Use Explanation Lenses to show GN, Momentum, and Mental Availability as support lenses.
7. Use Pattern Radar to show the move from one brand read to portfolio intelligence.
8. Close on Treatment Path To Test and emphasize options to consider, proof signals, and human decision ownership.
9. Open Live Consult and use the real voice flow when recording conditions are stable. Keep guided prompt buttons as the recovery path if microphone, permissions, or room audio misbehaves.

Demo caveats to say out loud:

- Lay's uses a measured partial Growth Navigator workbook extract, not a full GN report extract.
- Perceived Value is the user-facing label for the Pricing Power source metric. It is broad equity-based value perception, not SKU-level price guidance.
- Pattern Radar shows associative similarity and investigation prompts, not causality.
- Treatments are paths to test, not commands.

## Adding a diagnosis

1. Edit `src/data/config/diagnosis-definitions.json`.
2. Add treatment links in `diagnosis-treatment-links.json`.
3. Add sample expected behavior in `docs/diagnostics/RULE_AUTHORING_GUIDE.md` if needed.
4. Run validation.

## Adding a treatment

1. Edit `src/data/config/treatment-definitions.json`.
2. Link it to one or more diagnoses.
3. Ensure all required fields are present.
4. Run validation.

## Adding a brand

1. Add raw BBE rows or append to `brand-health-records.json`.
2. Confirm metrics exist for Demand Power, Pricing Power source metric / Perceived Value display, Salient, Meaningful, and Different.
3. Add category lens and portfolio role.
4. Confirm diagnosis IDs are populated or computed.
