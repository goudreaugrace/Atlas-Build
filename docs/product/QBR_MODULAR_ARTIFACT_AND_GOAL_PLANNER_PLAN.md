# Meeting Prep Modular Artifact And Goal Planner Plan

## Purpose

The next product track is to make the Meeting Prep Intelligence Asset the first flagship fundable output while making Jarvis smarter about shaping the work before it builds. QBR remains a supported meeting objective and user phrase, but it is not the name of the broader capability.

The goal is not a pile of static templates. The goal is a governed composition system: Jarvis understands the user's goal, confirms only the details that materially change the output, selects approved modules from the current brand data and knowledge foundation, and creates a review-draft artifact that feels executive-ready while staying honest about source coverage, assumptions, and gates.

The focused execution path for the first polished version now lives in `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PRD.md` and `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`. This plan remains the broader planner architecture; the web-native asset plan narrows the first proof to a Lay's CMO Review Intelligence Asset plus one source/context extension before expanding output types.

Important surface distinction: the Brand Report is the canonical, fuller diagnostic patient chart. Meeting Prep and Brand Work outputs are dynamic, audience-specific artifacts derived from that chart. They should not reduce the report's narrative, diagnostic, or teaching depth; they should selectively package the right answer for the meeting objective, audience, and decision.

This plan builds over the current foundation:

- One brand home.
- One intelligence agent.
- Many durable outputs.
- Local JSON data first.
- `BrandHealthRecord` and `BrandIntelligencePacket` as central contracts.
- Data, rules, treatments, prompts, output policy, and UI separated.
- LLMs explain and translate; services compute; config defines.

## Product Principles

1. Answer first, build when needed.
   Direct questions should get a strong strategist answer and natural next-best actions. Explicit build/create/draft/package requests should become governed work orders.

2. Clarify only when it matters.
   Jarvis should infer the likely goal, audience, and output mode from the ask. It should ask one focused question only when the answer changes the composition or risk posture.

3. Compose from governed modules.
   The system should not generate arbitrary UI. It should choose approved modules, view models, dynamic views, proof patterns, guardrails, and disclosure sections.

4. Keep assumptions visible.
   POC-created data can be used to show how the system works, but artifact modules must label project data, reviewed-local data, Codex-created assumptions, public-source context, and replacement work for a real pilot.

5. Separate artifact quality from runtime plumbing.
   The Meeting Prep output should feel polished and valuable even though export, official approval, enterprise persistence, canonical source writes, and production use remain gated.

6. Make next actions feel consultative.
   Every useful answer should offer the next logical work Jarvis can do, such as a CMO-review read, evidence/data inspector, treatment recommendation, brief/story draft, proof plan, or source-readiness check.

## User Request Patterns

The same brain should support several request shapes:

- Direct answer: answer in conversation, disclose proof/gaps when useful, and offer next-best actions.
- Explicit meeting prep build: create an approval-gated Meeting Prep review draft. A QBR ask is one specific meeting-prep objective.
- Specific meeting objective: compose the asset around the requested angle, such as QBR, evidence, treatment, risk, peer set, Room to Grow, or CMO story.
- Evidence/data ask: open a granular evidence and data-basis composition rather than a generic QBR.
- Treatment ask: create a recommendation-path artifact with treatment options to consider and areas to inspect, not a task-level plan.
- Assumption/readiness ask: create a source/readiness artifact showing what is measured, simulated, assumed, missing, and pilot-replacement work.
- Ambiguous high-value ask: ask one clarification about audience, decision, or output depth before creating work.
- Risky official-use ask: keep the artifact in review-draft language and keep export, circulation, source truth, and official approval gated.

## Meeting Prep Composition Modes

### 1. Executive Review / QBR

Default for "meeting prep," "QBR," "CMO read," "executive read," "decision read," and similar asks.

Primary job: tell leadership what is happening, why it matters, what evidence supports the read, what not to overclaim, and what decision/test path is reasonable next.

### 2. Evidence Read

Default for "show me the data," "prove it," "what are you working with," "source basis," and data inspection asks.

Primary job: expose the actual active metrics, packet inputs, proof claims, gaps, assumptions, peer basis, trend caveats, and available source views.

### 3. Treatment Read

Default for "what should we do," "treatment recommendation," "plan options," and diagnosis-to-action asks.

Primary job: recommend treatment paths to consider, link them to the brand diagnosis and evidence, name areas to inspect, and avoid task-level owner/date planning in the POC.

### 4. Assumption And Readiness Read

Default for "is this real," "what is synthetic," "what do we need for pilot," and source-readiness asks.

Primary job: show project data versus Codex-created assumptions, public-source context, replacement work, source-owner gaps, and artifact readiness.

### 5. Brief / Story Variant

Later POC extension after the meeting prep modes are excellent.

Primary job: translate the diagnosis and treatment direction into a governed narrative, agency brief, or leadership story draft with proof and review gates.

## Approved Module Library

The first meeting prep composition planner should select from these modules:

- Executive verdict.
- CMO-review takeaways.
- BBE bloodwork metric strip.
- Momentum ladder.
- Momentum x Room to Grow.
- Trend context and significance caveats.
- Peer basis and category context.
- Meaningful / Different / Salient driver map.
- Perceived Value source-lineage caveat.
- Diagnosis trace.
- Data Basis Inspector.
- Evidence spotlight and proof cards.
- Evidence gaps and missing inputs.
- Treatment recommendation paths.
- What not to overclaim.
- Assumption catalog.
- Artifact readiness.
- Governance and source metadata disclosure.
- Next decision or test path.

These are modules, not separate products. A user asking for "the actual data" should receive a data-heavy composition. A user asking "what would I tell the CMO" should receive a leadership-heavy composition. A user asking for a QBR should receive a quarterly/yearly review posture. All should be assembled from the same governed foundation.

## Goal And Composition Planner

Add a lightweight planner between conversation intent and artifact creation.

The planner should return:

- `goal`: the user's likely business goal.
- `audience`: CMO, insights lead, brand lead, operator, agency, or mixed.
- `decision`: the decision or discussion the output should support.
- `compositionMode`: executive review / QBR, evidence read, treatment read, assumption/readiness read, or brief/story.
- `confidence`: high, medium, or low.
- `clarifyingQuestion`: absent unless ambiguity materially changes the artifact.
- `selectedModules`: approved module IDs in recommended order.
- `dataNeeds`: evidence required, available, assumed, or missing.
- `guardrails`: claims to avoid and review posture.
- `nextBestActions`: follow-up works the system can actually create.

This should build on current pieces rather than introduce a second brain:

- `runUnifiedAssistantTurn()`
- `decideUnifiedAssistantIntent()`
- Dynamic Work Spec planning
- `ExperiencePlan` registry
- Dynamic view registry
- `BrandIntelligencePacket`
- `qbr-executive-artifact.ts`
- `assistant-reality-boundaries-v1`
- `output-quality-standards.json`
- `PROTOTYPE_ASSUMPTION_CATALOG.md`

## Jarvis Behavior

Jarvis should feel like a consultant shaping the work with the user.

For direct answers:

- Start with the strategic read.
- Keep proof close but not overwhelming.
- End with one to three logical next actions grounded in available skills and outputs.

For explicit work:

- Translate the ask into a concise approval statement: "I can build a CMO meeting prep draft focused on momentum, proof, and treatment paths."
- Name the selected composition mode and the most important modules.
- Keep the artifact review-draft and export-gated.

For ambiguous work:

- Ask one question if it changes the output, such as "Is this for CMO review or for an insights working session?"
- If the likely path is obvious, proceed with an inferred default and disclose the assumption.

For risky asks:

- Keep official approval, export, circulation, canonical source writes, production readiness, and unsupported claims blocked.

## Implementation Plan

### Step 0 - Protect The Current Baseline

- Preserve `/brand/[brandId]/assistant`.
- Preserve `/brand/[brandId]/jarvis`.
- Preserve `/brand/[brandId]/work` and existing work-detail URLs.
- Run baseline validation before and after runtime changes.

### Step 1 - Define The Composition Contract

- Add a meeting prep composition type/service beside the existing artifact view model. The current internal service names can remain QBR-prefixed until a safe rename window.
- Reuse the existing artifact model for default Executive Review / QBR.
- Add mode-aware module selection for Executive Review / QBR, Evidence Read, Treatment Read, and Assumption/Readiness Read.
- Keep module definitions data-driven and reusable where practical.

Likely files:

- `src/lib/intelligence/qbr-executive-artifact.ts`
- `src/lib/intelligence/qbr-composition-planner.ts`
- `src/lib/intelligence/types.ts`
- `src/data/config/output-quality-standards.json`

### Step 2 - Add Goal + Composition Planning To The Assistant Brain

- Extend Dynamic Work Spec planning so meeting prep work carries goal, audience, composition mode, selected modules, data needs, and clarification posture.
- Keep answer-first routing intact.
- Ask a clarification only when confidence is low or audience/decision materially changes the output.

Likely files:

- `src/lib/intelligence/unified-assistant.ts`
- `src/lib/intelligence/experience-planner.ts`
- `src/data/config/experience-template-registry.json`
- `scripts/eval-assistant.mjs`
- `scripts/eval-agent.mjs`

### Step 3 - Structure Next-Best Actions

- Convert suggested next moves from helpful text into a small grounded recommendation contract.
- Each action should map to an approved skill/template/view path or a safe direct follow-up.
- Keep action language consultative, such as "Build the CMO-review read" or "Open the Data and Evidence Inspector."

Likely files:

- `src/lib/intelligence/unified-assistant.ts`
- `src/lib/intelligence/assistant-capabilities.ts`
- `src/data/config/experience-template-registry.json`

### Step 4 - Upgrade The Meeting Prep Work Detail Into A Mode-Aware Artifact

- Render the same output shell with different module emphasis depending on composition mode.
- Keep governance/source metadata behind disclosure.
- Keep proof cards, data views, guardrails, and next decision/test path visible.
- Preserve generic work-detail fallback for non-meeting-prep work items.

Likely files:

- `app/brand/[brandId]/work/[workId]/page.tsx`
- `src/components/intelligence/DynamicViewRenderer.tsx`
- `src/lib/intelligence/qbr-executive-artifact.ts`

### Step 5 - Wire Jarvis Approval And Follow-Up Experience

- Show the inferred goal and module plan before governed build.
- Let users approve, refine, or answer one clarification.
- Preserve the Jarvis Thought Core behavior: visible operational trace, no private chain-of-thought.
- Keep the Recent Work shelf focused on durable outputs.

Likely files:

- `app/brand/[brandId]/jarvis/JarvisWorkbenchClient.tsx`
- `src/lib/intelligence/jarvis-events.ts`
- `app/api/assistant/events/route.ts`

### Step 6 - Add Evals And Browser Smokes

Add acceptance coverage for:

- Direct momentum answer includes useful next-best actions.
- Explicit QBR ask creates the Executive Review / QBR composition inside the broader Meeting Prep asset family.
- "Show me the data" creates Evidence Read composition.
- Treatment ask creates Treatment Read composition.
- "What is synthetic or missing" creates Assumption/Readiness composition.
- Ambiguous artifact ask asks one useful clarification or proceeds with a stated assumption.
- Overreach asks fail closed.

## Validation Gates

Every implementation slice should pass:

- `pnpm validate:data`
- `pnpm typecheck`
- `pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters`
- `pnpm build`
- `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:assistant`
- `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:agent`
- `git diff --check`

Browser smoke targets:

- `/brand/lay-s/assistant`
- `/brand/lay-s/jarvis`
- `/brand/lay-s/work`
- `/brand/cheetos/work/executive-qbr-read`
- `/brand/tostitos/work/executive-qbr-read`
- one current persisted Lay's meeting prep / QBR work item when local runtime state contains one.

## POC Cutline

Build now:

- Modular meeting prep composition.
- Goal + Composition Planner.
- Structured next-best actions.
- One-question clarification behavior.
- Mode-aware meeting prep work-detail artifact.
- Evidence, assumptions, treatment paths, and guardrails visible.

Defer to pilot:

- Official export/circulation.
- Enterprise persistence.
- Identity/access-controlled review.
- Canonical source writes.
- Automated treatment outcome learning.
- Real source-owner replacement for all POC assumptions.
- Arbitrary user-authored UI generation.

## Success Criteria

The next build is successful when a CMO or insights leader can ask for meeting prep in different ways and the system produces the right kind of governed artifact without a developer creating a one-off page:

- "What would I tell the CMO?" gets a direct executive answer and offers a meeting prep read.
- "Build a QBR for this" creates an Executive Review / QBR meeting prep draft.
- "Show me the actual data behind this" creates an Evidence Read.
- "What treatment should we consider?" creates a Treatment Read.
- "What is assumed versus real?" creates an Assumption and Readiness Read.
- Every artifact is grounded in active brand data, visible assumptions, approved modules, proof, guardrails, and review gates.

## Implementation Checkpoint - 2026-07-02

Implemented:

- `qbr-composition-plan-v1` in `src/lib/intelligence/qbr-composition-planner.ts`.
- `DynamicWorkSpec.qbrCompositionPlan` for relevant Assistant/Jarvis work orders.
- Four composition modes: Executive Review / QBR, Evidence Read, Treatment Read, and Assumption/Readiness Read.
- Optional meeting prep composition persistence on prototype-local Brand Work records.
- Mode-aware meeting prep artifact model and work-detail rendering with visible Goal And Composition.
- Eval coverage in `pnpm eval:assistant` and `pnpm eval:agent`.
- First artifact module-rendering slice: selected meeting prep composition modules now render as populated governed module cards instead of raw checklist labels on work-detail pages.
- Treatment Recommendation / Treatment Read artifact slice: `treatment_path` work-detail pages now render diagnosis-to-treatment bridge, ranked options to consider, brand-specific basis, evidence to inspect, guardrails, approved evidence views, and next test path.
- Evidence Read / Proof Pack artifact slice: `proof_pack`, `insights-evidence-lab`, and Evidence Read composition pages now render actual data basis, metric cards, proof cards, source posture, gaps and caveats, guardrails, approved evidence views, next proof path, and governance metadata disclosure.
- Brand Work detail lookup now resolves all work items, including starter Proof Pack URLs, before applying shelf display limits.

Still open:

- Broader structured next-best-action contract for every direct answer, not only meeting prep composition work.
- Deeper mode differentiation for Assumption/Readiness Read so measured, prototype-assumed, missing, and pilot-replacement work feel purpose-built from the same module foundation.
- Future meeting-objective refinements where a user can request a narrower angle such as peer set, Room to Grow, SMD, proof, risk, CMO story, or treatment path.
- Future follow-up recomposition of existing artifacts after user feedback, such as making a draft more CMO-facing or adding more proof on a specific metric.
- Future audience/persona tailoring after core skill quality is strong.
- Pilot replacement of Codex-created assumptions with approved source-owner data.
