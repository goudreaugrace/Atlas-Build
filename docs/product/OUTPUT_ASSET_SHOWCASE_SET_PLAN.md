# Output Asset Showcase Set Plan

## Purpose

Before making the asset system more dynamic, build a small set of excellent, durable output assets that prove Brand Doctor can match or beat the Q1 2026 US Snacks PPTX workflow.

The goal is not to recreate all 128 slides. The goal is to showcase the highest-value deck-derived assets a CMO, brand lead, or insights lead would actually use:

- sharp executive answer,
- clear source-deck continuity,
- stronger reasoning than the static PPTX,
- visible proof and caveats,
- and a next action the web product can start.

## Product Bar

Each showcase asset must be good enough that a CMO-facing team would rather start from Brand Doctor than rebuild the equivalent deck section by hand.

Every asset should have:

- one executive-level headline,
- one clear business job,
- a slide-like first view,
- source/PPTX lineage where relevant,
- a governed proof contract,
- blocked-overclaim language,
- and a next operation such as proof inspection, treatment path, source-owner ask, or meeting prep.

## Showcase Assets

### 1. Meeting Prep Intelligence Asset

Role: flagship meeting-ready narrative.

PPTX basis: combines executive summary, benchmark lenses, source-chart read, driver diagnosis, questions, treatment paths, and source readiness.

CMO value: answers "What should I say, what is the risk, what proof do we have, and what should we do next?"

Current state: implemented as the first full multi-page executive asset.

### 2. Primary MDS Dashboard Read

Role: source-chart replacement and executive chart interpretation.

PPTX basis: slide 17, Executive Summary: MDS Dashboard.

CMO value: turns the core chart into a business read without requiring the CMO to decode source-chart mechanics.

Must prove:

- chart/source lineage is visible,
- metric evidence is concise,
- source-owner reconciliation is not hidden,
- and unsupported chart claims are blocked.

### 3. Benchmark Lens Explainer

Role: prevent misreads of Momentum, Ahead/Behind, and vs. Category.

PPTX basis: slides 10, 12, 20, 22, 33, 44, 71, 91, 121.

CMO value: makes the read trustworthy by explaining why Momentum is the headline verdict, Category Index is context, and Ahead/Behind is the size-adjusted strength check.

Must prove:

- category index is not treated as health proof,
- strong-language guardrails are visible,
- and Kate/Lydia feedback is embedded as reasoning policy.

### 4. Category Position Read

Role: answer "Where do I stand in the category?"

PPTX basis: slides 20, 33, 44.

CMO value: explains scale, category context, and peer posture without letting category leadership become the final diagnosis.

Must prove:

- category strength is framed as context,
- peer basis is disclosed,
- and the asset connects back to Momentum and driver support.

### 5. Momentum Over Time Read

Role: answer "Am I building strong brands over time?"

PPTX basis: slide 22.

CMO value: focuses leadership on trajectory, urgency, and whether current scale is being protected or eroded.

Must prove:

- Movement/significance limits are visible,
- the read does not overstate one period,
- and next proof asks are clear.

### 6. Driver Relationship Map

Role: show how M/D/S and Perceived Value work together.

PPTX basis: slides 19 and 26.

CMO value: explains why the diagnosis is not one isolated metric and why the next action should target the driver system.

Must prove:

- Demand Power is interpreted with Meaningful and Salient,
- Perceived Value is interpreted with Meaningful and Different,
- Perceived Value is not SKU-level pricing guidance,
- and treatment paths connect to the driver tension.

### 7. Perceived Value / Pricing Power Guardrail

Role: prevent pricing overclaim and explain source lineage.

PPTX basis: slides 25, 26, 27, 121.

CMO value: lets leadership discuss value perception without turning it into price-pack architecture advice.

Must prove:

- product language says Perceived Value,
- source lineage preserves Pricing Power,
- invalid SKU/store/promo claims are blocked,
- and evidence needed for pricing action is explicit.

### 8. Brand Jobs To Be Done

Role: bridge diagnosis into the jobs the brand team should explore.

PPTX basis: slides 24, 31, 42, 71.

CMO value: moves from "what is happening" to "what should the team investigate next" without pretending the AI has made the business decision.

Must prove:

- jobs are questions or paths to test,
- treatment language remains consultative,
- and proof requirements are connected to each job.

### 9. Demographic Diagnostic Boundary

Role: answer demographic performance questions honestly.

PPTX basis: demographic/sample context and slide 121-style cut logic.

CMO value: prevents the prototype from failing a predictable stakeholder question while clearly separating measured, simulated, and missing data.

Must prove:

- simulated workflow data is labeled,
- official demographic cuts are required for pilot truth,
- base sizes/significance requirements are visible,
- and segment claims do not leak into total-market conclusions.

### 10. Leadership Provocation Questions

Role: turn the deck into sharper next questions and source-owner asks.

PPTX basis: slides 13, 14, 24, 31, 42.

CMO value: makes the asset feel like a thinking partner by ending with the questions leadership should pressure-test.

Must prove:

- questions are evidence-linked,
- unsupported causal questions are blocked,
- and source-owner asks are actionable.

### 11. Typology Source Context

Role: explain BrandZ typology only when asked.

PPTX basis: slides 8, 9, 16, 91.

CMO value: preserves source-deck context without letting "Star" or similar labels become the product verdict.

Must prove:

- typology is not a default readout,
- product headline stays Momentum/full-profile based,
- and source methodology is available for provenance.

## Recommended Build Sequence

### Registry Decision - No Duplicate Skill Catalog

The showcase asset set now uses the existing executive intelligence asset page-module registry as the source of truth for named asset compositions.

This keeps the architecture clean:

- `agent-skill-registry.json` defines capabilities the agent can perform.
- `experience-template-registry.json` defines larger governed workspaces.
- `dynamic-view-registry.json` defines reusable runtime views.
- `executive-intelligence-asset-page-module-registry.json` defines proof-governed executive asset modules and named asset compositions.
- `brand-work.ts` consumes those definitions to expose starter assets; it no longer owns separate hard-coded executive asset definitions.
- Brand Assistant suggested moves consume the same asset definitions to recognize when a user is asking for the Benchmark Lens, Perceived Value Guardrail, Demographic Boundary, or related showcase output.

This means the agent can know which governed executive assets exist without creating a second skill taxonomy. Future additions should add or revise asset definitions in the executive asset registry, then let Work Shelf, asset rendering, validation, and assistant routing consume that same definition.

### Slice 1 - Showcase Shelf And Focused Asset Pages

Make the Work Shelf expose the highest-value deck-derived assets as durable starter outputs:

1. Primary MDS Dashboard Read.
2. Benchmark Lens Explainer.
3. Driver Relationship Map.
4. Brand Jobs To Be Done.
5. Perceived Value Guardrail.
6. Demographic Diagnostic Boundary.
7. Leadership Provocation Questions.

Use the existing `ExecutiveIntelligenceAssetSpec` page-module registry and render each asset as a focused subset of the full CMO asset.

Acceptance:

- `/brand/lay-s/work` shows the showcase assets.
- Each showcase asset has its own URL.
- Each asset renders one focused page or tightly related pages.
- The full Meeting Prep asset still works.
- `npm run validate:data` verifies each asset references valid page modules, trigger terms, source basis, and known skills.

### Slice 2 - Category And Momentum Standalone Reads

Add dedicated category-position and momentum-over-time assets if they need more than the current benchmark lens / chart read modules.

Acceptance:

- Category Position Read can answer "where do I stand?" without overclaiming health.
- Momentum Over Time Read can answer "are we building strength?" without overclaiming one period or missing significance.

### Slice 3 - CMO Polish Pass

Improve visual hierarchy and copy on the showcase assets until they feel at least as valuable as the PPTX sections:

- tighter titles,
- fewer top-level proof cards,
- stronger "so what",
- better source lineage,
- and clearer next action.

Acceptance:

- User tests the asset set and confirms which outputs are CMO-demo ready.
- No asset hides source gaps or blocked claims.

## Checkpoint Policy

Before expanding to dynamic recomposition, checkpoint a passing version to GitHub with:

- product docs updated,
- starter showcase assets available,
- routes smoke-tested,
- `npm run validate:data`,
- `npm run typecheck`,
- `npm run eval:assistant`,
- `npm run build`,
- and `git diff --check`.
