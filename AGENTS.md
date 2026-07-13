# AGENTS.md — Codex Instructions

## Mission

Build **BBE Brand Doctor**, a PepsiCo internal prototype for deep brand equity diagnosis and treatment planning.

## Product mental model

The brand is the patient. BBE and Growth Navigator data are the test results. The diagnostic engine is the doctor. The treatment library is the pharmacy. The human brand/insights team makes the prescription decision.

## Architecture rules

- Use Next.js App Router + TypeScript.
- Use local JSON data first.
- Treat `BrandHealthRecord` as the central product contract.
- Keep data, rules, treatments, prompts, and UI separate.
- Do not hard-code diagnosis or treatment text inside React components unless it is purely presentational copy.
- Components render. Services compute. Config files define. LLMs explain.

## UI rules

Use `docs/design/PEPSICO_INTERNAL_TOOL_UI_FOUNDATION.md` and `docs/design/UI_UX_SPEC.md`.

The UI must feel:
- PepsiCo-branded
- warm, premium, executive, and human
- clean for marketers
- deep for insights leads
- report-first, not dashboard-card soup

Use light mode only, warm off-white background, navy authority surfaces, orange sparingly for action/caution, and progressive disclosure.

For new UI work:

- Use `docs/design/BBE_AIM_UI_SYSTEM_RULES.md` and `docs/design/BBE_AIM_UI_ADOPTION_GUIDE.md`.
- Start from shared primitives in `src/components/ui` before creating page-local UI patterns.
- For polished reading artifacts, use a full-width reading lane and put technical review/governance metadata in-flow near the bottom; avoid right rails unless the surface is workflow, utility, aggregation, or debugging oriented.
- Load typography through the project font variables (`--font-body`, `--font-display`, `--font-mono`); do not add page-local font imports.
- Browser-check desktop and mobile for layout, overflow, proof visibility, and console warnings before marking UI migration complete.

## LLM rules

- LLM chat is scoped to the active brand, active visual, evidence ledger, diagnosis rules, and treatment library.
- Do not let the LLM invent diagnoses or treatments.
- It can explain, challenge, compare, summarize, and translate.
- If evidence is missing, say so.
- Keep treatment language as “options to consider” or “treatment paths to test,” not final commands.

## Guardrails

- Pricing Power is broad brand-equity price justification. It is not SKU-level pricing guidance.
- Category lens must be visible and caveated.
- Do not infer cannibalization, portfolio migration, or occasion substitution as measured facts.
- Do not claim causality without causal evidence.
- Do not call a brand miscast based on one period.

## Done definition

A task is done when:

- TypeScript compiles.
- UI renders with at least six demo brands.
- Brand Manager and Insights Lead views both exist or are clearly scaffolded.
- Diagnosis and treatment data are loaded from JSON.
- Evidence is visible behind each diagnosis.
- STATUS.md and BACKLOG.md are updated.
