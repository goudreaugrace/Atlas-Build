# BBE / AIM UI System Migration Plan

## Intent

Execute the UI migration in small, reversible slices. The working system already has value, so each pass should improve one surface without creating an app-wide redesign cliff.

## Phase 0 - Probe And Decide

Status: complete.

Work completed:

- Inspected AIM UI portability kit.
- Inspected PepsiCo PPTX skill.
- Created isolated UI probes under `docs/design/test-assets/aim-ui-migration-probes/`.
- Added the delightful-details lens to the probes.

Decision:

- AIM kit governs app/product UI foundation.
- PPTX skill informs executive asset presentation grammar.
- BBE keeps `--pepsi-*` runtime tokens rather than introducing parallel `--aim-*` tokens.

## Phase 1 - Documentation And Primitive Foundation

Status: complete.

Work:

- Add the UI migration PRD.
- Add the design-system rules doc.
- Add a small shared primitive layer.
- Do not migrate unrelated routes.

Acceptance:

- Primitives are presentational only.
- Existing route logic remains unchanged.
- TypeScript passes.

## Phase 2 - First Runtime Migration: CMO Review Intelligence Asset

Status: complete.

Work:

- Migrate only `/brand/lay-s/work/cmo-review-intelligence-asset`.
- Use shared primitives for cover, proof cards, smart prompts, micro-moments, and punchline bands.
- Preserve all existing source/proof/review/circulation gates.
- Add tasteful marketing-team delight details from the probe.

Pause point:

- User reviews the live CMO Review asset.
- Decide whether the design direction is strong enough before migrating other work-detail surfaces.

Acceptance:

- Browser desktop and mobile checks pass.
- No horizontal overflow.
- Source/proof drawers remain accessible.
- Asset still uses the validated `ExecutiveIntelligenceAssetSpec`.

## Phase 3 - Broader Work Surface Migration

Status: active.

Candidate targets:

- Evidence Read / Proof Pack - first migrated Phase 3 surface.
- Treatment Read - second migrated Phase 3 surface.
- Executive QBR - third migrated Phase 3 surface.
- Brand Work Shelf - fourth migrated Phase 3 surface.

Rule:

- Migrate one surface at a time.
- Keep diagnosis/data logic untouched unless the surface exposes a bug.

Current Phase 3 checkpoint:

- `/brand/lay-s/work/insights-proof-pack` now uses the shared BBE/AIM primitive layer for the evidence hero, section labels, proof/source cards, smart prompt strip, micro-moment, and next-proof punchline band.
- The underlying `EvidenceReadArtifactModel` and evidence computation remain unchanged.
- `/brand/lay-s/work/treatment-path` now uses the shared BBE/AIM primitive layer for the treatment hero, diagnosis bridge proof cards, ranked path cards, proof-needs guardrail block, smart prompt strip, micro-moment, next-test punchline band, and in-flow review footer.
- The underlying `TreatmentReadArtifactModel` and treatment ranking/recommendation computation remain unchanged.
- `/brand/lay-s/work/executive-qbr-read` now uses the shared BBE/AIM primitive layer for the QBR authority hero, smart prompt strip, executive takeaway cards, proof cards, guardrail micro-moment, recommendation punchline band, and in-flow review footer.
- The underlying `QbrExecutiveArtifactModel` and QBR composition/module computation remain unchanged.
- `/brand/lay-s/work` now uses an artifact-library shelf: a priority executive asset, decision-asset cards for QBR/Evidence/Treatment, supporting workspace rows, and smart next-request prompts.
- The underlying `BrandWorkItem` retrieval and persistence model remain unchanged.
- Desktop and mobile browser checks passed with no horizontal overflow and no console warnings.
- Polished reading artifacts now share the same layout rule: QBR, Evidence Read, and Treatment Read use a full-width `artifact-reading-layout` and the in-flow review-posture footer instead of a technical right rail. Rails remain available only for utility/workflow surfaces where side metadata is part of the active task.

## Phase 4 - App Foundation Cleanup

Status: active.

Started after CMO Review, Evidence Read, Treatment Read, Executive QBR, and Brand Work Shelf proved the pattern.

Current cleanup:

- Consolidated the repeated QBR/Evidence/Treatment navy authority-hero treatment into shared `work-authority-hero` styling while preserving semantic page hooks.
- Consolidated Evidence/Treatment hero fact strips into shared `work-authority-facts` styling so future reading artifacts do not rebuild the same grid/card rules.
- Added shared render-only work-detail helpers for polished reading artifacts: `WorkArtifactSection`, `WorkInlineViews`, and `WorkGovernanceDisclosure`. QBR, Evidence Read, and Treatment Read now share the same section-header, approved-view, and governance-disclosure shell while keeping their model-specific content separate.
- Added the first asset-aware follow-up loop: work-detail pages link to Jarvis and the stable Assistant with `workId`, `/api/assistant` reloads that work server-side as active context, and common follow-ups such as proof, CMO-facing revision, source-owner handoff, and Kate/Lydia tightening answer inside the active asset proof/review contract.

Candidate work:

- replace duplicated badge/card CSS with primitives
- define page-level hero/header variants
- normalize trust display across Brand Home, Data, Report, and Work
- add skeleton/empty/error states where absent

## Stop Conditions

Stop and reassess if:

- visual polish reduces proof clarity
- delight elements compete with the executive read
- primitives begin carrying product logic
- mobile layouts become crowded
- the migration starts touching many unrelated surfaces at once
