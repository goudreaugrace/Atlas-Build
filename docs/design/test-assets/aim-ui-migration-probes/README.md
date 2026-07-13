# AIM UI Migration Probe Assets

Status: design-test assets only. These are not wired into the application runtime.

Purpose: test how the AIM UI portability kit and PepsiCo presentation grammar should influence BBE Brand Doctor before migrating shared UI patterns across the app.

## Assets

- `executive-asset-slide-probe.html`
  - Tests the web-native executive asset direction: slide-level feel, cover/page rhythm, section label, proof strip, punchline band, and expandable governance.
- `brand-command-report-probe.html`
  - Tests the broader app/report foundation: warm editorial canvas, navy authority header, trust display, evidence/inference/recommendation separation, and operational next steps.
- `probe-styles.css`
  - Shared prototype-only CSS mapping AIM design rules to BBE/PepsiCo tokens.

## How To Review

Open either HTML file in a browser. Review at desktop width first, then mobile/narrow width.

## What This Should Help Decide

- Whether the CMO Review Intelligence Asset should adopt a stronger slide-page rhythm before Phase 4.
- Which reusable UI primitives are worth creating before migrating existing screens.
- Whether the app foundation should stay `--pepsi-*` tokens while absorbing AIM component rules.
- How much PPT-style composition should enter the web experience without making the app feel like static PowerPoint.

## Review Criteria

- The first screen should feel executive and PepsiCo-branded without becoming decorative.
- The reading path should be obvious without a right rail.
- Evidence, inference, recommendation, and proof gaps should be visually distinct.
- Orange should feel like emphasis/action, not decoration.
- The layout should feel slide-quality but still web-native.

## Delightful Details Lens

Marketing teams will expect the product to feel polished, current, and a little desirable. The right delight layer should make the system feel more intelligent and tailored without adding noise.

Use delight for:

- smart contextual prompts such as "Ask why Momentum is the verdict" or "Create source-owner handoff"
- subtle active-state signals that show the asset is alive, listening, or proof-aware
- hover/focus polish that makes important objects feel inspectable
- confident microcopy that sounds like a useful strategy partner, not a generic dashboard
- web-native loops such as ask, revise, inspect proof, create next step, and return to the asset

Avoid delight that becomes:

- generic AI glow
- ornamental animation
- novelty widgets
- overuse of orange
- visual effects that compete with the executive read
