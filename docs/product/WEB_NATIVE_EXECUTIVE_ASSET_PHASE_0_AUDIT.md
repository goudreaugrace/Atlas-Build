# Web-Native Executive Asset Phase 0 Audit

## Restore Point

Before this slice, the branch was clean at:

- `8e15c861 Archive superseded product planning docs`
- Local restore tag: `restore/web-native-asset-phase0-base-20260706`

The current slice is intended to be additive and non-invasive. It does not replace the report, Assistant, Jarvis, Brand Work routes, or existing QBR work item rendering.

## Phase 0 Question

Where should the first web-native executive intelligence asset live, and what existing foundation should it reuse?

Recommendation:

> Build the Lay's CMO Review Intelligence Asset as a Brand Work Item powered by a new asset composition spec, not as a separate one-off route.

## Existing Foundation To Reuse

### Brand Work Item Shell

Current files:

- `src/lib/brand-work.ts`
- `src/lib/intelligence/server-brand-work-store.ts`
- `app/api/brand-work/route.ts`
- `app/brand/[brandId]/work/page.tsx`
- `app/brand/[brandId]/work/[workId]/page.tsx`

What exists:

- URL-addressable work items.
- Starter and requested work items.
- Prototype-local persistence in `.runtime/brand-work-items.json`.
- Review/export state fields.
- Approved skill/template/view metadata.
- QBR composition plan persistence.

Phase 0 decision:

- Reuse Brand Work Items as the durable asset shell.
- Do not create a new disconnected `/asset` route yet.
- Later, add an asset-specific work type or metadata field only if needed.

### QBR Composition Planner

Current file:

- `src/lib/intelligence/qbr-composition-planner.ts`

What exists:

- QBR composition modes:
  - executive QBR,
  - evidence read,
  - treatment read,
  - assumption/readiness read.
- Audience inference.
- Selected modules and approved view IDs.
- Data needs, guardrails, next-best actions.

Phase 0 decision:

- Reuse the planner as a predecessor, but do not stretch it to carry slide/page-level proof.
- Add a new asset composition spec for page-level narrative, proof, blocked claims, and next operations.

### QBR Executive Artifact Model

Current file:

- `src/lib/intelligence/qbr-executive-artifact.ts`

What exists:

- A better-than-shell artifact model for QBR-style work details.
- Composition module cards.
- Proof cards.
- Treatment section.
- Inline dynamic views.
- Governance disclosure.

Gap:

- It still reads like a modular work-detail artifact, not a slide-level executive intelligence asset.
- It does not yet model each page as a focused slide-like unit with page-specific proof, blocked overclaims, revision behavior, and next operations.

Phase 0 decision:

- Keep this artifact working.
- Use the new asset spec as the contract for the next renderer rather than heavily refactoring the existing QBR model immediately.

### Governed Module Stack

Current packet modules:

- `benchmark_lens_explainer`
- `chart_read`
- `executive_verdict`
- `source_readiness`
- `demographic_diagnostic_state`
- `provocation_questions`

Phase 0 decision:

- These are the first asset's source modules.
- The first asset should not invent new diagnosis logic.
- The asset renderer should consume these modules through the `BrandIntelligencePacket`.

### Assistant / Jarvis Work Creation

Current foundation:

- Product-facing Assistant can answer directly or create approval-gated governed work.
- Jarvis can stage and run approved work.
- Work results can persist as Brand Work Items.
- Voice and typed paths share the same assistant/runtime foundation.

Phase 0 decision:

- The first asset should be creatable from a chat/voice request later.
- For the immediate foundation slice, create the spec builder first and inspect it before adding creation/routing behavior.

## Gaps Before Visual Build

1. Asset Composition Spec.
   Needed so voice/chat creates a governed asset plan instead of arbitrary UI or one-off markdown.

2. Page Module Registry.
   Needed so each page declares required data, allowed claims, blocked claims, proof, visual pattern, and next actions.

3. Asset Renderer.
   Needed after the spec is validated. It should feel slide-level, with proof behind disclosure.

4. Ask-This-Asset Context.
   Needed after the asset exists, so chat/voice answers from active asset context.

5. Safe Revision Loop.
   Needed after the page sequence is accepted.

## First Asset Scope

Asset:

- Lay's CMO Review Intelligence Asset.

Primary prompt:

> Build me a CMO-ready read for Lay's. Focus on whether we are actually strong or just big, what the risk is, and what we should do next.

First page sequence:

1. Executive Verdict.
2. Benchmark Lens Read.
3. Primary Chart Read.
4. Driver Diagnosis.
5. Demographic Diagnostic Boundary.
6. Leadership / Provocation Questions.
7. Treatment Paths To Consider.
8. Source Readiness And Next Proof.

This is intentionally eight pages, not a large generated deck.

## What Not To Build Yet

- PowerPoint export.
- PDF export.
- A new route outside Brand Work Items.
- Arbitrary generated layouts.
- Multi-brand asset generation.
- Agency brief or learning path polished asset.
- External context live-search lane in the first renderer.

## Test / Pause Point

Before visual implementation, the user should review:

- Does the page sequence feel like the right replacement path for a hand-built CMO/QBR deck?
- Is the information density right: slide-level first, proof on demand?
- Are the demographic and source caveats visible enough?
- Are the next actions useful?
- Is anything missing before we build the renderer?
