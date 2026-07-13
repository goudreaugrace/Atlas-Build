# BBE / AIM UI Primitives

This folder holds the shared presentational primitives for new BBE Brand Doctor UI work.

Use these primitives when building new report, executive asset, workflow, or proof surfaces. They keep the product aligned to the AIM UI portability kit, PepsiCo presentation grammar, and the runtime design rules in `docs/design/BBE_AIM_UI_SYSTEM_RULES.md`.

## Import

```ts
import {
  BbeMicroMoment,
  BbeProofCard,
  BbePunchlineBand,
  BbeSectionLabel,
  BbeSmartPromptStrip,
  BbeSurfaceCard,
  BbeTrustBadge,
} from '@/src/components/ui';
```

## Primitive Roles

- `BbeSectionLabel`: compact uppercase hierarchy marker for report and asset sections.
- `BbeSurfaceCard`: restrained bordered surface for repeated proof, workflow, and content blocks.
- `BbeTrustBadge`: confidence, source posture, review state, readiness, or caveat badge.
- `BbeProofCard`: evidence, blocked claim, source need, or next-action card.
- `BbeSmartPromptStrip`: web-native follow-up loop that invites ask, revise, inspect, or handoff actions.
- `BbePunchlineBand`: executive "so what" or next-move band for slide-like assets.
- `BbeMicroMoment`: one useful delight detail that turns a caveat, insight, or source gap into a next action.

## Rules

- Components render. Services compute. Config files define. LLMs explain.
- Do not put diagnosis, treatment, ranking, or source-governance logic inside these primitives.
- Use `--font-body`, `--font-display`, and `--font-mono`; do not add page-local font imports.
- Use orange sparingly for action, caution, or a single active signal.
- Keep proof and caveats visible near the claim they govern.
- Browser-check desktop and mobile before calling a migrated surface complete.
