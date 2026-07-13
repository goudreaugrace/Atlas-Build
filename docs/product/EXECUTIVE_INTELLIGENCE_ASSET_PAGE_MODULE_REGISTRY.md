# Executive Intelligence Asset Page Module Registry

## Purpose

The web-native executive asset now has a governed page-module registry before visual rendering.

Registry:

- `src/data/config/executive-intelligence-asset-page-module-registry.json`

Service contract:

- `src/lib/intelligence/executive-intelligence-asset-spec.ts`

Read-only executable endpoint:

- `/api/executive-assets?brandId=lay-s`

## What The Registry Controls

Each page module defines:

- required source modules,
- required proof kinds,
- output mode and output-mode rationale,
- minimum primary evidence, expandable proof, evidence-needed, blocked-overclaim, and next-action counts,
- source posture requirement,
- blocked-claim signal groups,
- evidence-needed signal groups,
- allowed revision types,
- next operation candidates,
- visual pattern and focus level.

This keeps slide-quality rendering downstream from governed proof instead of letting a polished surface invent or hide the reasoning.

The same registry also owns named executive asset definitions. An asset definition is not a new skill; it is a governed composition of page modules with:

- user-facing asset ID and title,
- approved skill and template IDs,
- audience and objective,
- source prompt and summary,
- proof-summary counts,
- module sequence,
- decision supported,
- "ask this asset" prompts,
- trigger terms for assistant recommendations,
- source basis,
- optional page title/headline/role overrides.

This prevents a duplicate asset catalog from emerging in React routes or Work Shelf code. Work Shelf starter assets and Brand Assistant asset recommendations both consume the same definitions from this registry.

Output modes are defined in `INTELLIGENCE_OUTPUT_MODE_FOUNDATION.md`:

- `source_recreation` - faithful current PPT/source recreation or reconciliation.
- `diagnostic_read` - governed product interpretation of the current data.
- `future_extension` - clearly labeled web-native next-step or prototype workflow beyond the static PPT.

## First Registered Page Modules

The first asset pattern is the CMO Review sequence:

1. `executive_verdict`
2. `benchmark_lens_read`
3. `primary_chart_read`
4. `driver_diagnosis`
5. `demographic_boundary`
6. `provocation_questions`
7. `treatment_paths`
8. `source_readiness_next_proof`

These map to the Lay's CMO Review Intelligence Asset, but the builder entry point is now generic:

- `buildCmoReviewAssetSpec(packet)`
- `buildValidatedCmoReviewAssetSpec(packet)`

The older Lay's-named functions remain aliases for the first proof:

- `buildLaysCmoReviewAssetSpec(packet)`
- `buildValidatedLaysCmoReviewAssetSpec(packet)`

## Validation Contract

`validateExecutiveIntelligenceAssetSpec(spec)` returns:

- `pass` when every page meets source/proof/caveat/action requirements,
- `warning` when the asset is usable but a guardrail or evidence signal should be more explicit,
- `fail` when required proof, source modules, registry alignment, or circulation posture is unsafe.

Validation also fails when a rendered page's output mode does not match its registered module definition or when the asset does not declare that it supports the page mode.

Current Lay's route smoke:

- `/api/executive-assets?brandId=lay-s`
- 8 pages
- `validation.status = pass`
- export, copy, and circulation disabled
- review state remains source-owner blocked while source readiness gates are unresolved

Current named asset definitions:

- `cmo-review-intelligence-asset`
- `primary-mds-dashboard-read`
- `benchmark-lens-explainer`
- `category-position-read`
- `momentum-over-time-read`
- `driver-relationship-map`
- `perceived-value-guardrail`
- `brand-jobs-to-be-done`
- `demographic-diagnostic-boundary`
- `leadership-provocation-questions`

## Renderer Implication

The next UI build should render from the validated spec. It should not encode page business logic inside React components.

Renderer responsibilities:

- display the page sequence with slide-level focus,
- display the page output mode so users can distinguish source recreation, diagnostic interpretation, and future extension,
- show proof on demand from `primaryEvidence`, `expandableProof`, `evidenceNeeded`, `blockedOverclaims`, and `sourcePosture`,
- expose allowed revision and next-operation controls from the spec/registry,
- keep export/circulation disabled unless governance changes,
- fail closed if validation status is `fail`.
