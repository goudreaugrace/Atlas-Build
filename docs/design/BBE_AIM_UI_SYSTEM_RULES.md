# BBE / AIM UI System Rules

## Role Of This Doc

This doc translates the AIM UI portability kit and PepsiCo presentation grammar into BBE Brand Doctor runtime design rules.

Use this together with:

- `PEPSICO_INTERNAL_TOOL_UI_FOUNDATION.md`
- `UI_UX_SPEC.md`
- `BBE_AIM_UI_ADOPTION_GUIDE.md`
- `docs/product/BBE_AIM_UI_SYSTEM_MIGRATION_PRD.md`
- `src/components/ui/README.md`

## Design Position

BBE Brand Doctor should feel:

- PepsiCo-branded
- warm and premium
- executive-ready
- report-first
- evidence-backed
- useful for marketers and deep enough for insights leads
- quietly delightful, not gimmicky

## Token Position

Use existing `--pepsi-*` CSS variables in the app runtime.

Do not add parallel `--aim-*` runtime tokens unless the app later creates a formal theme package. AIM is the governing source; `--pepsi-*` is the implementation language.

## Typography

- Display: Libre Franklin for structural headings and page titles (H1-H4, page-heading).
- Body: Inter for body paragraphs, data grids, inputs, metadata, controls, and eyebrow labels (H5).
- Mono: SFMono-Regular / JetBrains Mono only for technical IDs, manifests, source keys, or audit details.

Do not use hero-scale display type inside compact cards or proof drawers.

## Contrast And Dark Surfaces

Navy authority surfaces are appropriate for executive covers, verdicts, and next-step bands.

Dense metric cards, status chips, and red/green diagnostic labels inside those dark surfaces must sit on light readable cards or otherwise prove accessible contrast. Avoid dark-on-dark metric boxes.

Use these defaults:

- Metric cards inside a navy hero should use a near-white card surface.
- Metric values should use navy or another high-contrast text color.
- Status states such as good/watch/bad should render as light contrast pills, not raw red/green text directly on navy.
- Browser QA should verify status text remains readable on desktop and mobile.

## Surface Selection

### Executive Asset

Use when a web object should replace or outperform a deck.

Core pattern:

1. cover or verdict page
2. slide-like page stack
3. compact source/proof cards
4. punchline / next-step band
5. expandable proof drawer
6. smart loops for ask, revise, inspect, handoff, and next asset

### Report

Use for durable analysis and diagnosis.

Core pattern:

1. strong report header
2. one reading column or clearly secondary support column
3. evidence / inference / recommendation separation
4. proof and limitations in flow
5. details on demand

### Aggregation

Use for lists, libraries, trackers, and comparison.

Tables, filters, and cards are appropriate here because the job is navigation or comparison.

### Workflow

Use for creating, approving, revising, or promoting.

Always show what has been decided, what is needed next, and what happens if the user continues.

## Component Rules

### Layout Hierarchy

Polished reading artifacts should use a full-width main reading lane.

This applies to executive assets, reports, Evidence Reads, Treatment Reads, and QBR-style decision reads. Avoid technical right rails on these surfaces because they compete with the story hierarchy. Put review posture, proof counts, source period, share/export state, and continuation actions in an in-flow footer or disclosure near the bottom.

Use right rails only for workflow, utility, aggregation, or debugging surfaces where side metadata is part of the active task.

### Section Label

Small, blue, uppercase, and consistent. It anchors the page hierarchy.

### Surface Card

Border-first. Radius should stay tight. Shadow only for hover or clear elevation.

### Trust Badge

Use for confidence, source posture, review state, and readiness. Do not show a score or verdict without basis.

On dark authority surfaces, badges and status labels must still render on a light or sufficiently contrasting chip. Do not rely on red, green, or orange text alone over navy.

### Proof Card

Use for evidence, blocked overclaims, next action, and source needs. Each proof card should have a role label and a concise statement.

### Punchline Band

Use sparingly on executive asset pages when there is a clear "so what" or next move. It should not appear on every ordinary report section.

### Smart Prompt Strip

Use when the web asset can do something a static deck cannot:

- ask the asset
- revise framing
- inspect proof
- create source-owner handoff
- start next governed work

### Micro-Moment

Use for one useful delight detail that converts a caveat, source gap, or insight into a next action. Avoid stacking many of these in one view.

## Delight Rules

Good delight:

- makes the system feel responsive
- helps the user see what they can do next
- reveals intelligence without adding clutter
- uses motion only as a subtle state cue
- is useful even if the animation is disabled

Bad delight:

- generic AI glow
- purely decorative animation
- extra cards that do not help the decision
- novelty language
- visual effects that undermine trust

## Migration Rules

- Migrate one surface at a time.
- For new UI work, follow `BBE_AIM_UI_ADOPTION_GUIDE.md` and start from primitives in `src/components/ui`.
- Keep data, reasoning, treatment, proof, and rendering separate.
- Components render. Services compute. Config defines. LLMs explain.
- Do not put diagnosis or treatment logic into UI primitives.
- Browser-check desktop and mobile before marking a UI migration complete.
