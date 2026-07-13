# BBE / AIM UI Adoption Guide

## Purpose

This guide makes the approved BBE/AIM design direction repeatable for every new UI pass.

The goal is not an app-wide reskin. The goal is a disciplined path where each new surface feels PepsiCo-branded, premium, report-first, evidence-backed, and web-native without destabilizing the working prototype.

Use this guide with:

- `docs/design/BBE_AIM_UI_SYSTEM_RULES.md`
- `docs/design/PEPSICO_INTERNAL_TOOL_UI_FOUNDATION.md`
- `docs/design/UI_UX_SPEC.md`
- `docs/product/BBE_AIM_UI_SYSTEM_MIGRATION_PRD.md`
- `docs/product/BBE_AIM_UI_SYSTEM_MIGRATION_PLAN.md`
- `src/components/ui/README.md`

## Required Workflow For New UI

1. Classify the surface before designing it.
   - Executive asset: replaces or outperforms a deck page.
   - Report: durable analysis and diagnosis.
   - Aggregation: list, library, tracker, or comparison.
   - Workflow: create, approve, revise, promote, or hand off.

2. Start from shared primitives.
   - Import from `@/src/components/ui`.
   - Add new primitives only when the pattern repeats or removes meaningful complexity.
   - Keep page-specific layout CSS close to the route, but keep reusable grammar in primitives and global design classes.

3. Choose the reading hierarchy.
   - Executive assets, reports, Evidence Reads, Treatment Reads, and QBR-style decision reads should default to a full-width reading lane.
   - Do not use a right rail for technical metadata on polished reading artifacts.
   - Put review posture, source period, proof counts, share/export state, and continuation actions in an in-flow footer or a disclosure near the bottom.
   - Use a right rail only for workflow, utility, aggregation, or debugging surfaces where the side metadata is part of the active task.

4. Keep the reasoning boundary clean.
   - UI renders product contracts.
   - Services compute diagnosis, treatment, source posture, and next actions.
   - Config files define rules and page/module requirements.
   - LLMs explain, challenge, summarize, and translate.

5. Use the approved type system.
   - Body: `--font-body` / DM Sans.
   - Display: `--font-display` / Barlow Condensed.
   - Mono: `--font-mono` / JetBrains Mono.
   - Fonts load once through `app/layout.tsx` with `next/font/google`.

6. Add web-native value only when it helps the decision.
   - Good: ask-this-asset prompts, proof drawers, revision loops, source-owner handoff, contextual next operations, useful micro-moments.
   - Avoid: generic AI glow, decorative motion, redundant cards, or clever language that weakens trust.

7. Validate before broadening.
   - Keep migration slices small.
   - Browser-check desktop and mobile.
   - Confirm no horizontal overflow.
   - Confirm the intended display font is actually rendered.
   - Confirm proof, caveats, and evidence gaps remain visible.
   - Confirm metric cards and good/watch/bad status labels remain readable on dark authority surfaces.
   - Confirm console warnings do not introduce duplicate keys or broken assets.

## Surface Defaults

### Executive Asset

Use slide-level focus, a strong cover/verdict, page-stack rhythm, proof in drawers or compact cards, and a smart prompt strip for follow-up loops.

Do not make the page feel like a dashboard. The user should feel they are reading an executive asset with extra intelligence around it.

If the cover or verdict is navy, dense metric cards and status labels inside it should use light card/chip surfaces with verified contrast.

### Report

Use one primary reading column, restrained support panels, visible evidence/inference/recommendation separation, and details on demand.

Do not overfill reports with equal-weight cards. Do not place technical governance metadata in a right rail unless it is part of an active workflow.

### Aggregation

Use tables, filters, segmented controls, compact cards, and comparison affordances. Density is acceptable when the user is scanning or choosing.

### Workflow

Show what is decided, what is missing, what happens next, and what governance boundary applies.

Right rails are acceptable here only when they help the user act, compare, approve, or debug. If the surface is primarily for reading, use an in-flow governance footer instead.

## New Primitive Criteria

Create a new shared primitive only when at least two are true:

- The pattern appears on more than one route or output type.
- The pattern carries a product-governance role.
- The pattern removes repeated styling or accessibility decisions.
- The pattern helps preserve a clean data/reasoning/UI boundary.

If only one page needs it, keep it local until it proves reusable.

## Done Checklist

- Surface uses shared primitives where applicable.
- Surface follows the correct surface type.
- No diagnosis or treatment logic is hard-coded into React components.
- Fonts use the project `next/font` variables.
- Proof/caveat/source posture is visible near key claims.
- Dark hero metrics and status chips have readable contrast.
- Desktop and mobile browser checks pass.
- `npm run typecheck` passes.
- `git diff --check` passes.
- `STATUS.md` and `BACKLOG.md` are updated for meaningful UI migrations.
