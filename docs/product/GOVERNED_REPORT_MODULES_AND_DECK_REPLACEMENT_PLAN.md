# Governed Report Modules And Deck Replacement Plan

## Purpose

The Q1 2026 United States Snacks automated report shows that many BBE report outputs are modular, repeatable, and eventually replaceable by BBE Brand Doctor. The right path is not to recreate the full deck immediately. The right path is to build governed report modules over hardened data and reasoning.

The current execution track is documented in `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PRD.md` and `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`. This deck replacement plan remains the source-deck/module strategy; the web-native asset plan is the focused execution path for proving the first polished asset.

## Principle

> The slide is the UI. The source data and reasoning read are the product.

If the system can produce a trustworthy governed module in the app, it can later render that module as a slide, QBR page, Jarvis canvas, or export artifact.

## What The Deck Teaches Us

The automated report repeats a clear structure:

- source context
- BBE framework explanation
- benchmark lens explanation
- executive summary
- KPI dashboards
- KPI deep dives
- trend charts
- chart-read statements
- provocation questions
- Pricing Power guardrails
- jobs-to-be-done / action guidance
- source notes and bases

This should become a module registry rather than a one-off deck generator.

## Current Governed Module Stack

The first governed module stack now exists in the Brand Intelligence Packet and Brand Data inspection surface:

- `benchmark_lens_explainer`
- `chart_read`
- `executive_verdict`
- `source_readiness`
- `demographic_diagnostic_state`
- `provocation_questions`

These modules are intentionally app-rendered first. Slide or deck rendering should consume these modules later, after source-owner review and output QA, rather than rebuilding reasoning inside a PowerPoint generator.

## Module Registry Candidates

### 1. Source Context Module

Purpose: show market, category, period, sample, source status, base-size caveats, and data gaps.

Dependencies:

- source ledger
- sample metadata
- source governance fields
- deck chart ledger for automated-report source modules

### 2. Benchmark Lens Explainer

Purpose: explain `vs. Category`, `Ahead`, and `Momentum`.

Dependencies:

- metric definitions
- benchmark doctrine
- source-deck caveats

### 3. Chart Read Module

Purpose: convert a benchmark pattern into a business read.

Example pattern:

- over-indexing vs category
- not Ahead on key metrics
- flat or declining Momentum
- read: large/category-leading but vulnerable

Dependencies:

- Equity Reasoning Layer
- strength-language permission rules
- evidence ledger

### 4. Executive Verdict Module

Purpose: summarize the brand's headline read.

Dependencies:

- `EquityReasoningRead`
- evidence gaps
- blocked claims

### 5. MDS Dashboard Module

Purpose: show Meaningful, Different, Salient as an integrated driver profile.

Dependencies:

- BBE metric records
- M/D/S definitions
- driver interpretation rules

### 6. Demand Power Deep Dive

Purpose: explain consumer demand signal, category position, Ahead status, Momentum, and driver implications.

Dependencies:

- Demand Power data
- Meaningful / Salient / Different support
- trend significance

### 7. Pricing Power Deep Dive

Purpose: explain broad brand-equity premium justification with guardrails.

Dependencies:

- Pricing Power / Perceived Value data
- Meaningful / Different support
- Pricing Power guardrail config
- RGM/SKU-pricing blocked-claim rules

### 8. Salient Deep Dive

Purpose: explain mental availability pressure or strength.

Dependencies:

- Salient data
- CEP / mental availability packets where available
- base and category caveats

### 9. Meaningful Deep Dive

Purpose: explain relevance, needs fit, and brand relationship strength.

Dependencies:

- Meaningful data
- brand strategic context
- image / needs evidence where available

### 10. Different Deep Dive

Purpose: explain differentiation and category leadership perception.

Dependencies:

- Different data
- distinctiveness guardrails
- innovation / asset evidence where available

### 11. Demographic Diagnostic Module

Purpose: answer demographic questions only when source posture supports it.

States:

- official measured cut
- limited measured cut
- simulated prototype cut
- context-only external demographic data
- unavailable

Dependencies:

- demographic evidence gate
- source governance metadata

### 12. Provocation Module

Purpose: ask the right next diagnostic and decision questions based on weak or conflicting signals.

Current implementation: `ProvocationQuestionsModule` / `provocation_questions`.

Rules:

- Prioritize questions the source deck already answers or implies.
- Use Kate/V7 feedback as calibration guardrails, especially Momentum as headline verdict, category index as context, Ahead/Behind as size adjustment, and integrated M/D/S plus Perceived Value interpretation.
- Use external CMO and brand-growth research only as question framing, not as evidence for brand-specific claims.
- Each question must declare purpose, source basis, evidence to use, evidence still needed, and the overclaim it blocks.
- Separate source-owner handoff questions from executive decision questions.

Dependencies:

- deck-derived provocation templates
- Equity Reasoning Layer
- evidence gaps
- source readiness
- demographic evidence gate
- CMO/brand-growth research references

### 13. Treatment Implication Module

Purpose: recommend treatment paths to consider, not final prescriptions.

Dependencies:

- diagnosis-treatment links
- treatment library
- required evidence and counter-indications

### 14. Evidence Gap / Next Proof Module

Purpose: show what evidence is missing before the read becomes pilot or executive reliable.

Dependencies:

- evidence ledger
- source readiness requirements
- output quality checks

## First Mini Deck Target

Do not start with 128 slides. Start with a 6-10 slide governed brand read:

1. Source context and data posture
2. Benchmark lens explainer
3. Executive verdict
4. M/D/S and Demand/Pricing Power profile
5. Momentum / Ahead / category interpretation
6. Demographic diagnostic state
7. Provocations and evidence gaps
8. Treatment paths to consider
9. Next proof path

The `provocation_questions` module should act as the bridge between the executive verdict and the next proof/treatment decision. It should prevent polished outputs from ending in vague "next steps" by forcing each proposed question to name the evidence required to answer it and the claim it must not overstate.

## Exact Recreation Potential

Likely feasible early:

- static framework slides
- benchmark lens explainer
- Pricing Power guardrail slide
- provocation question slides
- selected KPI chart modules where chart data maps cleanly
- source-context and data-posture slides using the source ledger

Requires data hardening:

- MDS dashboard
- trend charts
- Ahead/Momentum visualizations
- brand jobs-to-be-done pages
- executive summaries
- cell-level workbook promotion where chart cache is insufficient

Requires business approval:

- final headlines
- interpretation language
- typology prominence
- official brand-specific recommendations
- demographic reads

## Build Sequence

1. Define module registry and module data contracts.
2. Extract chart/worksheet relationships from the source PPTX. First pass complete with 107 native charts and 107 linked workbooks.
3. Map source slides to module IDs, starting from `deck-chart-ledger.json` reconciliation states.
4. Build app-rendered modules first.
5. Validate each module against source deck and golden reads.
6. Add deck rendering only after module logic is stable.

## Validation Standard

Each module must answer:

- What source data does it use?
- What reasoning object does it use?
- What claims does it make?
- What claims does it block?
- What caveats must render?
- Can it be shown in demo, pilot review, or official use?
