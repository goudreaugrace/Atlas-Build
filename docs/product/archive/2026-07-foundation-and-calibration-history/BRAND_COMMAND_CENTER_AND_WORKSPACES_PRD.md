# PRD — Brand Command Center And Durable Workspaces

## Objective

Make BBE Brand Doctor feel like one scalable product system:

> One brand home. One intelligence agent. Many durable outputs.

The traditional diagnostic report remains the source-of-truth read. The Jarvis-style agent becomes the creation and interaction layer. Requested work becomes a first-class URL-addressable output that can be reviewed, revisited, shared internally, and eventually exported after governance clears.

## Product Thesis

Users should not have to choose between a trusted static report and a dynamic agent. They need both:

- A clean global home to understand the solution and choose a brand.
- A brand home to see what can be done for that brand.
- A traditional report for fixed diagnostic depth.
- A premium Jarvis interaction layer for natural questions and approved work requests.
- A work shelf where generated QBR reads, proof packs, treatment paths, learning plans, agency briefs, and future outputs live as durable objects.

## Information Architecture

```text
/
  Solution home: what the platform does, brand picker, portfolio/learning paths.

/brands
  All-brand selector and brand list.

/portfolio
  Cross-brand Pattern Radar and portfolio intelligence.

/learn
  BBE education and practice library.

/brand/[brandId]
  Brand command home: status, top diagnosis, available modes, recent work.

/brand/[brandId]/report
  Existing traditional Brand Doctor diagnostic report.

/brand/[brandId]/jarvis
  Premium immersive voice/chat command layer.

/brand/[brandId]/assistant
  Stable product-facing assistant/test surface.

/brand/[brandId]/work
  Brand work shelf: requested work plus approved starter output templates.

/brand/[brandId]/work/[workId]
  Focused output workspace: URL-addressable, reviewable, future export/share target.

/brand/[brandId]/data
  Brand data, source packets, evidence, strategic context, and raw JSON inspection.
```

## User Jobs

1. **Executive sponsor:** choose a brand, ask the agent for the strategic read, approve a QBR/proof output, and review the generated workspace without navigating a dense report.
2. **Brand manager:** understand the condition, ask natural follow-ups, compare treatment paths to test, and keep the resulting plan as brand work.
3. **Insights lead:** inspect evidence, gaps, rules, source readiness, and proof views behind any generated output.
4. **Learning/user enablement:** request education, practice diagnostics, and training paths grounded in the active brand.
5. **Future specialist users:** request new approved workspace shapes from the same data/skill/view foundation without creating a one-off app each time.

## Work Item Contract

A Brand Work Item is the durable shell for generated or starter output work.

Required fields:
- Brand ID and title.
- Source prompt.
- Source type: requested work or approved starter template.
- Approved skill ID.
- Approved ExperiencePlan template ID.
- Approved dynamic view IDs.
- Audience and objective.
- Proof summary: evidence, gaps, review gates.
- Review state.
- Share state.
- Export state.

Prototype boundary:
- URL-addressable workspaces are in scope now.
- Completed Assistant/Jarvis governed work persists to prototype-local `.runtime/brand-work-items.json` through `/api/brand-work`.
- Older local transcript-backed requested work can still appear as a fallback when present.
- Approved starter workspaces keep the shelf useful even before enterprise persistence.
- Enterprise persistence, identity, official approval, export, circulation, and canonical artifact storage remain gated.

## Interaction Principles

- The user starts with a brand, not a system diagram.
- Direct questions should answer first.
- Heavier work should request approval before building.
- Jarvis is the creator/operator; workspaces are the durable outputs.
- The right-side Jarvis canvas is a preview and build surface, not the final destination for every output.
- Focused workspaces should maximize the artifact and keep chat/voice available as a companion.
- Dynamic does not mean arbitrary UI generation. It means approved skills, templates, and views composed for the user's job.

## Acceptance Criteria

- `/` explains the solution and lets users enter a brand.
- `/brand/[brandId]` is a brand command home, not the dense report.
- `/brand/[brandId]/report` preserves the existing diagnostic report.
- `/brand/[brandId]/work` lists requested and starter work items.
- `/brand/[brandId]/work/[workId]` renders a focused, URL-addressable output shell.
- Assistant, Jarvis, Data, Conversation, Portfolio, and Agent Lab report links point to the preserved report route when they mean "report."
- Validation passes: `pnpm validate:data`, `pnpm typecheck`, assistant/agent evals, and `pnpm build`.

## Next Phase

After this checkpoint, focus on the skills library and dynamic work item creation:

1. Render saved `AgentTurnResult` snapshots inside work detail pages.
2. Add richer high-fidelity workspace renderers for QBR, proof, treatment, learning, source readiness, and agency briefs.
3. Add user-facing work history, filters, and ownership states.
4. Promote prototype-local persistence to enterprise persistence once database, identity/access, retention, and official approval gates clear.
5. Add governed export/share once artifact-readiness, identity, and circulation gates clear.
