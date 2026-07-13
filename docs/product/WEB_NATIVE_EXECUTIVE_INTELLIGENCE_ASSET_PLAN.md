# Web-Native Executive Intelligence Asset Plan

## Intent

Execute the web-native executive intelligence asset in small, testable foundation slices.

The plan is deliberately narrow:

1. Prove one flagship Lay's CMO Review Intelligence Asset.
2. Prove a small output showcase set from the deck-derived page modules before making generation highly dynamic.
3. Prove one web-native extension from those assets.
4. Do not expand to arbitrary output types until the showcase outputs are strong.

The focused showcase list and build sequence live in `OUTPUT_ASSET_SHOWCASE_SET_PLAN.md`.

## Build Strategy

Build from the current module stack:

- `benchmark_lens_explainer`
- `chart_read`
- `executive_verdict`
- `source_readiness`
- `demographic_diagnostic_state`
- `provocation_questions`

Use the Q1 Snacks PPTX for information density and focus. The asset should feel slide-level, not like a dense dashboard. Web-native depth belongs in proof rails, side panels, and follow-up actions.

## Phase 0 - Baseline Audit And Contract Alignment

Goal: confirm what we have and prevent duplicate architecture.

Work:

- Map existing QBR artifact code, Brand Work Item routes, ExperiencePlan registry, Dynamic View registry, and Brand Intelligence Packet fields.
- Identify which current modules can be used directly in the first asset.
- Identify which fields are missing for the first composition spec.
- Confirm the asset should be created as a review-draft Brand Work Item, not a new disconnected route.

Pause Point 0 - User Test:

- Review a short written architecture summary.
- Confirm the first asset is Lay's CMO Review, not a generic deck generator.
- Confirm export stays out of scope.

Acceptance:

- No new UI is built yet.
- The plan clearly reuses current foundation.

## Phase 1 - Artifact Composition Spec

Goal: define the durable contract that voice/chat creates and revises.

Work:

- Add a typed `ExecutiveIntelligenceAssetSpec` or similarly named contract.
- Include:
  - asset id,
  - brand id,
  - audience,
  - objective,
  - decision supported,
  - narrative arc,
  - page sequence,
  - page modules,
  - claims,
  - evidence used,
  - evidence needed,
  - blocked claims,
  - source posture,
  - next actions,
  - review state,
  - revision history.
- Add a builder for Lay's from the current `BrandIntelligencePacket`.
- Expose the spec in Brand Data or a simple inspection panel before building the polished UI.

Pause Point 1 - User Test:

- Inspect the generated Lay's composition spec.
- Validate that the story order makes sense.
- Validate that the proof gaps and blocked claims are visible.
- Confirm the spec feels like the right foundation before visual polish.

Acceptance:

- `npm run validate:data`
- `npm run typecheck`
- Lay's spec includes the six current governed modules.
- No unsupported claims are introduced.

## Phase 2 - Page Module Registry

Goal: define reusable page-level building blocks before visual implementation.

Work:

- Add config or typed registry entries for:
  - Executive Verdict Page,
  - Benchmark Lens Page,
  - Primary Chart Read Page,
  - Driver Diagnosis Page,
  - Demographic Boundary Page,
  - Provocation Questions Page,
  - Treatment Paths Page,
  - Source Readiness / Next Proof Page.
- Each page declares:
  - required packet fields,
  - visual pattern,
  - allowed claims,
  - blocked claims,
  - proof requirements,
  - next actions,
  - audience variants.

Pause Point 2 - User Test:

- Review the page list and what each page is allowed to say.
- Compare the information density to the PPTX slide style.
- Decide whether the first asset should be 6, 7, or 8 pages.

Acceptance:

- Validation prevents unknown page module IDs.
- Registry is reusable for future brands.
- Page definitions do not live inside React only.

## Phase 3 - Lay's CMO Review Asset V1

Goal: render the first slide-quality web asset.

Work:

- Create a Brand Work Item route or mode that renders the composition spec.
- Build page navigation with a focused slide-like first view.
- Add a proof rail or expandable proof drawer.
- Add source/readiness status without overwhelming the page.
- Use restrained page density based on the PPTX: one point per page, compact proof nearby.
- Add clear review-draft and export-gated language.

Pause Point 3 - User Test:

- Open the Lay's asset.
- Test whether it feels like something that can replace hand-built deck work.
- Check whether it is too busy.
- Check whether the top-level story is executive clear.
- Check whether proof is easy to inspect.

Acceptance:

- Browser QA passes for desktop and a narrower viewport.
- No horizontal overflow.
- Top-level pages are readable without opening proof.
- Proof/caveats are available for every page.

## Phase 4 - Ask-This-Asset

Goal: scope chat/voice around the active asset instead of generic brand chat.

Work:

- Pass active asset spec context into the assistant.
- Support questions such as:
  - "Why are we calling this vulnerable?"
  - "Show the proof behind Perceived Value."
  - "What would make this read wrong?"
  - "What would I tell Kate?"
  - "What source do we need to make this pilot-ready?"
- Keep answers grounded in the asset, packet, proof, and source readiness.

Pause Point 4 - User Test:

- Ask five follow-up questions about the asset.
- Confirm answers reference the asset and do not restart from generic brand chat.
- Confirm voice and typed paths behave consistently enough for the POC.

Acceptance:

- Follow-up answers cite active page/module context.
- Missing evidence is stated when needed.
- Official/export/source-truth asks fail closed.

## Phase 5 - Safe Revision Loop

Goal: allow useful iteration without arbitrary generation.

Initial allowed revisions:

- reframe for CMO,
- reframe for Insights Lead,
- lead with Momentum,
- add demographic caveat,
- increase proof depth,
- reduce proof density,
- create source-owner ask list,
- open treatment-path next step.

Work:

- Add a revision intent parser for the allowed set.
- Update the composition spec revision history.
- Re-render the asset from the revised spec.
- Keep facts, evidence, and blocked claims unchanged unless the revision is a governed source/context action.

Pause Point 5 - User Test:

- Try "Make it sharper for Kate."
- Try "Add the demographic caveat."
- Try "Lead with Momentum."
- Try "Reduce the density."
- Confirm revisions improve the asset without changing the diagnosis unsupportedly.

Acceptance:

- Revision history is visible.
- Unsupported revisions are declined or converted into source asks.
- No arbitrary UI generation.

## Phase 6 - Source-Owner Action Panel

Goal: prove the productivity workflow beyond slides.

Work:

- Generate source-owner asks from:
  - source readiness,
  - demographic diagnostic state,
  - provocation questions,
  - chart read reconciliation,
  - Momentum source readiness.
- Render as an action panel from the asset.
- Allow the user to copy/view the ask list inside the app, but keep export/circulation gated.

Pause Point 6 - User Test:

- Ask the asset: "What do I need from the business/source teams to make this pilot-ready?"
- Confirm the list is concrete and actionable.
- Confirm it distinguishes official source needs from nice-to-have context.

Acceptance:

- Source asks are grounded in module proof needs.
- Simulated demographic replacement is clearly named.
- Runtime/canonical source writes remain disabled.

## Phase 7 - External Context Lane

Goal: prove web-native value beyond PPT without weakening evidence trust.

Work:

- Add a context-only lane that can hold cited external context.
- Use the Kantar/WARC bundle as framework context.
- If live news/search is enabled, cite sources and label as current external context.
- Do not mutate measured diagnosis automatically.
- Convert context into questions or hypotheses, not claims.

Pause Point 7 - User Test:

- Ask: "Any recent context that might matter?"
- Confirm citations are visible.
- Confirm the diagnosis does not silently change.
- Confirm the output says what would need to be verified before executive use.

Acceptance:

- External context is visually and structurally separate from BBE evidence.
- The asset can suggest new questions without making unsupported claims.

## Phase 8 - Treatment Workshop Extension

Goal: prove one next operation from the asset.

Work:

- From the Lay's asset, open a treatment-path workspace.
- Carry over:
  - diagnosis,
  - proof,
  - provocation questions,
  - treatment paths to consider,
  - evidence needed before action.
- Keep treatment language as options to test.

Pause Point 8 - User Test:

- Ask: "Turn this into a treatment workshop."
- Confirm it starts from the asset context.
- Confirm it does not become a task plan with fake owners/dates.

Acceptance:

- Treatment workspace is grounded in asset context.
- Human decision language remains clear.

## Defer Until Examples Are Strong

- PPTX export.
- PDF export.
- Agency brief polished asset.
- Learning path asset.
- Multi-brand portfolio asset.
- Full 128-slide deck recreation.
- Arbitrary page generation.

## Evaluation Suite To Add

- Composition spec includes required pages and proof for Lay's.
- Page registry blocks unknown modules.
- Asset rendering has no unsupported claims.
- Revision loop preserves facts.
- External context does not mutate diagnosis.
- Source-owner ask list includes demographic replacement and chart/source approval needs.
- Adversarial export/source-truth/official approval prompts fail closed.

## Test Cadence

After each pause point:

1. Run automated validation.
2. Browser-test the relevant surface.
3. User tests the specific pause-point scenario.
4. Update `STATUS.md` and `BACKLOG.md`.
5. Only then proceed to the next phase.
