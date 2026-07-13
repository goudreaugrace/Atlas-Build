# Lay's CMO Review Intelligence Asset Spec Proposal

## Purpose

This document describes the first proposed asset composition generated from the current Brand Doctor foundation.

The machine-readable starter contract is implemented in:

- `src/lib/intelligence/executive-intelligence-asset-spec.ts`

The reusable builder is:

- `buildCmoReviewAssetSpec(packet)`
- `buildValidatedCmoReviewAssetSpec(packet)`

The first-proof alias is:

- `buildLaysCmoReviewAssetSpec(packet)`
- `buildValidatedLaysCmoReviewAssetSpec(packet)`

The read-only executable endpoint is:

- `/api/executive-assets?brandId=lay-s`

The endpoint returns the spec, page-level proof contracts, validation report, registry id, and gated circulation posture.

## Asset Definition

Working title:

- `Lay's CMO Review Intelligence Asset`

Audience:

- CMO / executive sponsor.

Objective:

- Decision read.

Review state:

- Review draft.
- Source-owner blocked until source readiness gates clear.

Export state:

- Gated.

Primary prompt:

> Build me a CMO-ready read for Lay's. Focus on whether we are actually strong or just big, what the risk is, and what we should do next.

## Narrative Arc

1. Lead with the Momentum-first executive verdict.
2. Explain category index, Ahead/Behind, and Momentum as separate benchmark lenses.
3. Use the primary chart read to show the large/category-leading but vulnerable pattern.
4. Diagnose M/D/S and Perceived Value as a connected driver profile.
5. State the demographic boundary before anyone mistakes simulated workflow data for measured evidence.
6. Turn the read into leadership questions and source-owner asks.
7. Offer treatment paths to test, not final prescriptions.
8. Close with source readiness and next proof.

## Page Sequence

### 1. Executive Verdict

Job:

- Open with the single leadership read and the decision implication.

Primary source modules:

- `executive_verdict`
- `equity_reasoning_read`

Must show:

- headline verdict,
- decision implication,
- primary watch-out,
- confidence/source posture.

Must block:

- calling the brand strong unless the full profile supports it,
- final treatment prescription,
- official/circulation-ready language.

### 2. Benchmark Lens Read

Job:

- Make the Momentum / Ahead / Category hierarchy explicit.

Primary source modules:

- `benchmark_lens_explainer`
- `bbe_deck_doctrine`

Must show:

- Momentum as headline verdict,
- Ahead/Behind as size-adjusted strength check,
- category index as context.

Must block:

- category index as health proof,
- typology as product verdict,
- strength language from one positive lens.

### 3. Primary Chart Read

Job:

- Translate source-deck chart evidence into a focused business read.

Primary source modules:

- `chart_read`
- `deck_chart_ledger`

Must show:

- chart-read statement,
- source slide,
- reconciliation posture,
- key metric points.

Must block:

- official chart recreation before source-owner approval,
- claims not supported by chart/data reconciliation.

### 4. Driver Diagnosis

Job:

- Show why the system reads M/D/S and Perceived Value together.

Primary source modules:

- `equity_reasoning_read`
- `bbe_deck_doctrine`

Must show:

- Demand Power driver read,
- Perceived Value driver read,
- tensions to inspect,
- treatment implications.

Must block:

- isolated metric diagnosis,
- SKU-level pricing guidance from Perceived Value,
- unsupported causality.

### 5. Demographic Diagnostic Boundary

Job:

- Answer demographic pressure honestly.

Primary source module:

- `demographic_diagnostic_state`

Must show:

- whether measured demographic diagnosis is allowed,
- what simulated workflow data can demonstrate,
- official source replacement requirement.

Must block:

- simulated demographic values as measured BBE evidence,
- demographic performance inferred from total-market data.

### 6. Leadership / Provocation Questions

Job:

- Turn the read into the questions leadership and source owners must answer next.

Primary source module:

- `provocation_questions`

Must show:

- deck-first priority questions,
- evidence needed to answer,
- blocked overclaims.

Must block:

- generic brainstorm questions,
- unsupported category-index or typology questions,
- unsupported causal or demographic claims.

### 7. Treatment Paths To Consider

Job:

- Move from read to options without pretending the AI made the business decision.

Primary source modules:

- `executive_verdict`
- treatment library.

Must show:

- treatment path(s) to consider,
- why the path fits,
- what to inspect before action.

Must block:

- final prescription language,
- fake owners/dates/task plans.

### 8. Source Readiness And Next Proof

Job:

- Make the pilot/readiness boundary explicit and convert gaps into source-owner work.

Primary source modules:

- `source_readiness`
- Momentum source readiness.
- Brand Strategic Context readiness.

Must show:

- demo-safe / pilot-blocked status,
- source blocks,
- handoff requirements,
- next proof.

Must block:

- official readout language without source-owner approval,
- canonical writes or runtime source consumption.

## Ask-This-Asset Starter Prompts

- Why are we calling this vulnerable?
- What would make this read wrong?
- Show the evidence behind Perceived Value.
- What should I tell Kate if she challenges the demographic read?
- What do we need from source owners to make this pilot-ready?

## Safe Revision Types

- reframe for CMO,
- reframe for Insights Lead,
- lead with Momentum,
- add demographic caveat,
- increase proof depth,
- reduce top-level density,
- create source-owner ask list,
- open treatment-path workspace.

## Validation Notes

- The asset is review-draft and export-gated.
- External context, if added later, must stay separate from BBE evidence.
- The current executable Lay's asset returns 8 pages with `validation.status = pass`.
- Export, copy, and circulation remain disabled until governance changes.
- No page should treat simulated demographics as measured segment performance.
- No page should call the brand strong unless Momentum, Ahead/Behind, and driver support align.
- No page should use Perceived Value as SKU-level pricing guidance.

## Pause Point

Before building the renderer, review this proposal for:

- page count,
- story order,
- page density,
- missing page types,
- source caveat prominence,
- usefulness of next actions.
