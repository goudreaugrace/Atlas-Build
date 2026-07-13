# BBE / AIM UI System Migration PRD

## Purpose

Raise BBE Brand Doctor's UI quality from a working prototype to a premium PepsiCo internal product by adopting the AIM UI portability kit as the app/product foundation and the PepsiCo PPTX skill as executive-output presentation grammar.

This migration must improve the current product without destabilizing the working system. The first runtime migration target is the Lay's CMO Review Intelligence Asset only.

## Product Thesis

> BBE Brand Doctor should feel like an executive-grade intelligence product: slide-clear when the user needs a decision, report-rich when the user needs proof, and alive with AI when the user wants to ask, revise, inspect, or start the next move.

The design system should support three kinds of value:

- **Trust:** visible evidence, caveats, source posture, and proof gaps.
- **Clarity:** a top-down reading path with one dominant decision per surface.
- **Delight:** thoughtful marketing-team polish through smart prompts, useful micro-interactions, and web-native loops.

## Source Inputs

- AIM UI portability kit: app foundation, tokens, trust display, report/aggregation/workflow surface rules.
- PepsiCo PPTX skill: slide-level composition grammar for executive assets.
- Existing BBE design docs:
  - `docs/design/PEPSICO_INTERNAL_TOOL_UI_FOUNDATION.md`
  - `docs/design/UI_UX_SPEC.md`
  - `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PRD.md`
  - `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`
- UI probes:
  - `docs/design/test-assets/aim-ui-migration-probes/executive-asset-slide-probe.html`
  - `docs/design/test-assets/aim-ui-migration-probes/brand-command-report-probe.html`

## Scope

### In Scope

- Create a small reusable BBE/AIM primitive layer.
- Document surface selection rules: executive asset, report, aggregation, workflow.
- Add a restrained delightful-details layer for marketing audiences.
- Migrate the Lay's CMO Review Intelligence Asset to the new primitives first.
- Preserve proof, source readiness, blocked overclaims, and review/export gates.

### Out Of Scope For This Pass

- Full app-wide visual migration.
- Tailwind/shadcn stack migration.
- PowerPoint export.
- Arbitrary AI-generated UI.
- Production share/export/circulation.
- Changes to diagnosis, treatment, or data logic.

## Surface Rules

### Executive Asset Surface

Use when the output is intended to replace a deck-like executive read.

Required qualities:

- slide-level focus
- strong cover or opening verdict
- page navigation
- one dominant headline per page
- compact proof nearby
- expandable proof/caveats/details
- clear punchline or next action
- smart loops for ask/revise/proof/source-owner actions

### Report Surface

Use when the user needs to understand one coherent body of work.

Required qualities:

- one primary reading path
- evidence/inference/recommendation separation
- proof and limitations visible
- restrained cards for distinct objects only
- no dashboard-card soup

### Aggregation Surface

Use when the user compares, filters, triages, or navigates many objects.

Allowed:

- tables
- cards
- filters
- grouped lists
- right rails when comparing or navigating

### Workflow Surface

Use when the user is making or revising something.

Required qualities:

- current step
- decisions already made
- what is needed next
- what the system will do after approval
- review and source boundaries

## Primitive Layer

The first shared primitives should be intentionally small:

- `BbeSectionLabel`
- `BbeSurfaceCard`
- `BbeTrustBadge`
- `BbeProofCard`
- `BbePunchlineBand`
- `BbeSmartPromptStrip`
- `BbeMicroMoment`

These primitives are presentational only. They must not compute diagnosis, treatment, source readiness, or evidence logic.

## Delightful Details Rules

Delight should help a marketing team feel the product is premium, useful, and built for their workflow.

Use delight for:

- smart prompt chips
- subtle active-state signals
- hover/focus polish
- useful microcopy
- one-click loops into ask, revise, inspect proof, create source-owner handoff, or start the next asset

Avoid:

- generic AI glow
- novelty widgets
- ornamental animation
- excessive orange
- animations that delay comprehension
- delight that competes with proof or executive clarity

## Acceptance Criteria

- TypeScript compiles.
- CMO Review Intelligence Asset still renders from `ExecutiveIntelligenceAssetSpec`.
- No diagnosis, data, treatment, or registry behavior changes are introduced.
- Desktop and mobile browser checks show no horizontal overflow.
- The asset feels closer to the probes while preserving review-draft/source-gated language.
- `STATUS.md`, `BACKLOG.md`, `PLANS.md`, and product docs are updated.
