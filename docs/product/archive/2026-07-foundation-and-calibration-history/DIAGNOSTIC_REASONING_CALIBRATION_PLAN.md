# Diagnostic Reasoning Calibration Plan

## Working Principle

> Harden source truth first, then definitions, then reasoning, then outputs.

The slide, report, chat, Jarvis, and QBR surfaces should be treated as renderers. They should not independently decide what the brand diagnosis is.

The reusable-shell boundary should be defined before implementation begins. See `docs/product/REUSABLE_GOVERNED_INTELLIGENCE_SHELL_ARCHITECTURE.md`. The practical sequence is not to build a generic platform first; it is to build BBE calibration as the first domain pack inside clean shell boundaries.

## Phase 0 - Preserve The Current Demo Baseline

Goal: keep the current prototype usable while the diagnostic foundation is upgraded.

Tasks:

- Keep `/brand/[brandId]/assistant`, `/brand/[brandId]/jarvis`, report, data, and work routes stable.
- Preserve current demo brands and Brand Work Item behavior.
- Keep all new data and reasoning additions behind explicit source/prototype status.
- Add evals before changing output language broadly.

Exit criteria:

- Current demo routes still compile and render.
- Existing data validation passes.
- New docs identify the diagnostic upgrade path.

## Phase 1 - Source And Data Hardening

Goal: make the source basis inspectable enough to support trustworthy reasoning.

Tasks:

- Extract and map embedded deck chart data and worksheet relationships from the Q1 2026 Snacks deck. First pass complete in `deck-chart-ledger.json`.
- Compare deck chart values against `src/data/processed/bbe_metric_records.json`.
- Maintain a product source ledger that records source posture, allowed/blocked uses, caveats, and pilot promotion requirements. First pass complete in `src/data/processed/bbe_source_data_ledger.json`.
- Define a canonical BBE metric record schema with source, benchmark, base, confidence, and caveat fields.
- Add source governance metadata across measured, extracted, simulated, assumption, public, and transcript-derived inputs.
- Add base-size and survey-question metadata where available.
- Define official demographic-cut requirements even before official files arrive.
- Add the prototype-only simulated demographic diagnostics pack.

Exit criteria:

- Every metric used in a diagnostic read has a source posture.
- Missing demographic evidence is machine-detectable.
- Simulated demographic rows are visibly separated from measured rows.
- Deck-derived report modules can point to a governed source ledger instead of raw PPTX assumptions.

## Phase 2 - Knowledge And Definition Hardening

Goal: convert deck and transcript lessons into machine-addressable doctrine.

Tasks:

- Formalize definitions for Demand Power, Pricing Power / Perceived Value, Meaningful, Different, Salient.
- Formalize `vs. Category`, `Ahead`, and `Momentum` lens definitions.
- Encode Pricing Power guardrails from the source deck.
- Encode Kantar typology language permissions.
- Add provocation-question templates from the deck.
- Define source hierarchy and conflict handling.
- Update data dictionary and prototype assumption catalog.

Exit criteria:

- Definitions are human-readable and machine-addressable.
- The system knows which language is source context, product language, or blocked.

## Phase 3 - Equity Reasoning Layer

Goal: create the canonical diagnostic object used by all surfaces.

Tasks:

- Add `EquityReasoningRead` type and builder service.
- Compute headline verdict, momentum read, category context, ahead/behind read, size-adjusted strength, driver read, risk level, evidence gaps, blocked claims, and treatment implications.
- Add large-but-vulnerable state.
- Add strength-language permission checks.
- Add demographic evidence gate.
- Update assistant/kernel/artifact builders to consume the reasoning read rather than re-deciding diagnosis independently.

Exit criteria:

- Chat, Jarvis, QBR, Treatment Read, Evidence Read, and report surfaces can reference the same reasoning read.
- The LLM explains the read instead of inventing it.

## Phase 4 - Calibration Evals And Golden Reads

Goal: prevent the whac-a-mole trap.

Tasks:

- Add evals for transcript-derived failure modes.
- Add evals for deck-derived benchmark lens interpretation.
- Add demographic refusal/simulated-data caveat evals.
- Add Pricing Power overreach evals.
- Add M/D/S integrated driver evals.
- Create golden human reads for priority brands once business inputs are available.

Exit criteria:

- The system passes "strong or just big?" pressure tests.
- The system refuses or caveats demographic claims correctly.
- Red Momentum and not-Ahead signals are not hidden.

## Phase 5 - Governed Output Modules

Goal: make outputs a faithful UI over the data and reasoning foundation.

Tasks:

- Add report module registry.
- Build benchmark lens explainer.
- Build chart-read module.
- Build executive verdict module.
- Build KPI deep-dive modules.
- Build source readiness module.
- Build demographic diagnostic module with measured/simulated/missing states.
- Build provocation module.

Exit criteria:

- A 6-10 slide governed brand read can be generated from approved modules.
- The same modules can render in app, work item, Jarvis canvas, or deck export later.

## Phase 6 - Pilot Readiness

Goal: broaden testing only after the brain is calibrated.

Tasks:

- Run priority brand golden reads with Kate/Lydia/GCC or methodology owners.
- Replace simulated or assumption data where official source-owner files are available.
- Document remaining source gaps.
- Freeze pilot-safe language.
- Decide which user groups see simulated demo features versus measured-only mode.

Exit criteria:

- Priority reads are SME-approved or explicitly marked as prototype.
- Output language is governed.
- Pilot users cannot mistake simulated demo data for measured BBE evidence.

## Recommended Build Order

1. Define the reusable shell/domain-pack boundary.
2. Data source ledger and canonical metric schema. First source ledger implemented for the Q1 2026 US Snacks automated report.
3. Simulated demographic diagnostics pack with hard caveats.
4. Equity Reasoning Layer type and deterministic builder.
5. Strength-language and benchmark-lens rules.
6. Demographic evidence gate.
7. Golden evals.
8. First governed report modules.
9. Mini brand-read deck output.

## Risks

- Polished generated decks could make unsupported claims feel official.
- Simulated demographic data could be misread as measured evidence.
- The LLM could continue to leak old "strong brand" language unless language permissions are enforced outside the prompt.
- Business teams may provide feedback as individual answer corrections instead of doctrine.
- Peer-set and significance logic may be hard to explain if Kantar/BBE methodology details are unavailable.

## Mitigations

- Keep output generation downstream of deterministic reasoning.
- Apply source badges and caveats at the data-object level.
- Add evals before broad language changes.
- Ask business teams for definitions, examples, and forbidden language, not just edited answers.
- Keep "review draft" posture until source-owner governance clears.
