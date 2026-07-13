# PLANS.md

## Current Mission

Build the next foundation for BBE Brand Doctor as a composable, governed, voice/chat-first brand-growth intelligence system that can eventually assemble role-specific decision experiences on demand.

The current prototype remains valuable and should stay stable. The new work builds beside it: an intelligence kernel, agent skill registry, dynamic view registry, dynamic experience planner, and premium consult canvas where the agent can teach, diagnose, research, visualize, pressure-test, package, and adapt brand-growth decisions for executives, marketers, insights leads, agencies, and future specialist users.

Working principle:

> Stable brain, flexible surfaces.

The stable brain is structured data, governed knowledge, deterministic services, evidence, prompts, guardrails, registries, evals, memory, and audit trails. The flexible surfaces are the current report, chat, voice, Live Consult, dynamic canvas, learning, Pattern Radar, brand data views, meeting prep assets, agency briefs, meeting modes, and future user-specific workspaces.

Product architecture principle:

> One brand home. One intelligence agent. Many durable outputs.

The global home should explain the solution and let users choose a brand. The brand home should orient users to what can be done for that brand. The traditional report should remain the trusted diagnostic read at `/brand/[brandId]/report`. Jarvis should be the premium interaction and work-creation layer. Brand Work Items should become the URL-addressable output objects that hold meeting prep reads, proof packs, treatment paths, learning paths, agency briefs, source readiness checks, and future dynamically composed work.

Interaction principle:

> Smooth conversation first. Governed orchestration when the work requires it.

The original scoped Brand Doctor conversation sets the answer-quality bar. The new governed foundation should harden data, knowledge, diagnostics, decisions, views, memory, audit, and gates without making simple questions feel like system logs. The product must be bi-modal: fast conversational answers by default, orchestrated skills/workspaces when the ask implies deeper work.

## Current Next Phase: Web-Native Executive Intelligence Asset Foundation

The next major phase after the July 2026 transcript/deck calibration work is **Web-Native Executive Intelligence Asset Foundation**.

Primary source docs:

- `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PRD.md`
- `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`
- `docs/product/QBR_MODULAR_ARTIFACT_AND_GOAL_PLANNER_PLAN.md`
- `docs/product/GOVERNED_REPORT_MODULES_AND_DECK_REPLACEMENT_PLAN.md`
- `docs/product/REUSABLE_GOVERNED_INTELLIGENCE_SHELL_ARCHITECTURE.md`

The goal is to make the first high-value generated asset feel like a true replacement for hand-built BBE/QBR meeting prep PowerPoint work while proving why the web-native asset is more valuable than a static deck. It should have slide-level focus, interactive proof, chat/voice around the asset, governed revisions, source-owner actions, and a path into the next operation.

The first proof target is not a broad output catalog. It is:

1. **Lay's CMO Review Intelligence Asset** - a focused, slide-quality web asset created from the governed module stack.
2. **Source + Context Extension** - a web-native extension that adds source-owner asks and/or external context as context-only, without mutating measured diagnosis.

Do not expand to additional polished output types until those examples are strong.

The central foundations to build are:

- Artifact Composition Spec. Implemented as `ExecutiveIntelligenceAssetSpec`.
- Page-level module registry. Implemented in `src/data/config/executive-intelligence-asset-page-module-registry.json`.
- Page proof contract. Implemented on each asset page and validated by `validateExecutiveIntelligenceAssetSpec`.
- Asset workspace renderer.
- Ask-this-asset chat/voice context.
- Safe revision loop.
- Source-owner action panel.
- External context lane with citations and evidence boundaries.

Current executable checkpoint:

- Pause point commit: `6377bc9d Centralize executive asset definitions`.
- `/api/executive-assets?brandId=lay-s` returns the first validated CMO Review Intelligence Asset.
- The Lay's asset currently returns 8 pages with `validation.status = pass`.
- Executive asset pages now declare output mode: `source_recreation` for faithful current PPT/source recreation, `diagnostic_read` for Kate-calibrated governed interpretation, and `future_extension` for clearly labeled web-native workflow/value beyond the static PPT.
- Export, copy, and circulation remain disabled while the asset is source-owner blocked.
- `/brand/lay-s/work/cmo-review-intelligence-asset` renders the first review-draft web workspace from the validated asset spec.
- `/brand/lay-s/work` keeps the CMO Review Intelligence Asset visible as the priority starter work item.
- `/brand/lay-s/work` now also exposes the first Output Asset Showcase Set: Primary MDS Dashboard Read, Benchmark Lens Explainer, Category Position Read, Momentum Over Time Read, Driver Relationship Map, Perceived Value Guardrail, Brand Jobs To Be Done, Demographic Diagnostic Boundary, and Leadership Provocation Questions.
- Named showcase assets are governed in the existing executive asset page-module registry, not in a new skill catalog. Work Shelf, focused work-detail rendering, validation, and Assistant next-move recommendations consume the same asset definitions, while agent skills remain capabilities and experience templates remain broader workspace shells.
- The Assistant now has lightweight local conversation continuity for low-context follow-up action questions, so "what should I do next?" can bridge from the prior diagnostic read without re-teaching brand equity or adding another model call.
- Source typology labels stay in raw/source data for provenance and deck reconstruction, but default assistant/live/UI/product language suppresses Star/Kantar/BrandZ-style labels unless the user explicitly asks about source typology.
- The UI migration direction is now governed by `docs/product/BBE_AIM_UI_SYSTEM_MIGRATION_PRD.md`, `docs/product/BBE_AIM_UI_SYSTEM_MIGRATION_PLAN.md`, `docs/design/BBE_AIM_UI_SYSTEM_RULES.md`, and `docs/design/BBE_AIM_UI_ADOPTION_GUIDE.md`: AIM portability kit for app/product foundation, PepsiCo PPTX skill for executive asset presentation grammar, existing `--pepsi-*` tokens for runtime implementation, shared primitives in `src/components/ui`, and delightful details only where they help marketing users ask, revise, inspect proof, or start the next move.

Current pause-point guidance:

- Pause is recommended here for user testing; the working system is stable and the remaining cleanup is structural rather than blocking.
- Test the Work Shelf and focused showcase assets before adding more output types.
- Do not add another asset/skill registry. Add future executive assets to the existing page-module registry unless they are truly broader experience templates.
- Candidate cleanup slices after testing: split `app/globals.css` by surface/design layer, extract render-only components from `app/brand/[brandId]/work/[workId]/page.tsx`, split `unified-assistant.ts` by routing/continuity/work-spec concerns, and split `scripts/validate-data.mjs` by registry family.

Execution must follow the pause points in `WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`. After each pause point, run automated validation, browser-test the relevant surface, have the user test the specific scenario, update `STATUS.md` and `BACKLOG.md`, and only then proceed.

## Previous Calibration Phase: Diagnostic Reasoning Calibration

The major phase after the July 2026 prototype review and Q1 Snacks automated-report intake was **Diagnostic Reasoning Calibration**.

Primary source docs:

- `docs/product/archive/2026-07-foundation-and-calibration-history/DIAGNOSTIC_REASONING_CALIBRATION_PRD.md`
- `docs/product/archive/2026-07-foundation-and-calibration-history/DIAGNOSTIC_REASONING_CALIBRATION_PLAN.md`
- `docs/data/BBE_DATA_FOUNDATION_HARDENING_PLAN.md`
- `docs/data/SIMULATED_DEMOGRAPHIC_DIAGNOSTICS_PLAN.md`
- `docs/product/GOVERNED_REPORT_MODULES_AND_DECK_REPLACEMENT_PLAN.md`
- `docs/product/REUSABLE_GOVERNED_INTELLIGENCE_SHELL_ARCHITECTURE.md`

The goal is to harden the full source-to-reasoning pipeline before scaling more polished outputs. The core upgrade is an explicit Equity Reasoning Layer that interprets `vs. Category`, `Ahead`, `Momentum`, Demand Power, Perceived Value, Meaningful, Different, Salient, evidence gaps, and language permissions consistently across chat, Jarvis, reports, work artifacts, and future deck modules.

This phase also adds a prototype-only simulated demographic diagnostics lane so the system can demonstrate Kate-style demographic workflows while clearly stating that official BBE demographic cuts are required before pilot or executive decision use.

The reusable architecture stance is to define the governed intelligence shell boundaries first, then build BBE as the first domain pack inside those boundaries. Do not stop to build a generic platform before the BBE reasoning layer works.

## Current Phase Boundary

The current phase is the **Minimum Lovable Foundation POC**, not the full future Jarvis/Trillion-style product and not production rollout.

### Current Status Reconciliation — 2026-06-30

The original Brand Doctor PRD journey and the governed agentic foundation are now materially implemented. The current center of testing has moved from `/agent-lab` to `/brand/[brandId]/assistant`, with `/agent-lab` retained as the inspection/debug workbench.

Current product-facing status:

- `/` is now the solution home and `/brand/[brandId]` is the brand command home. The original dense report is preserved at `/brand/[brandId]/report` so the diagnostic surface remains stable while the product gains a clearer starting point.
- `/brand/[brandId]/work` and `/brand/[brandId]/work/[workId]` are the first Brand Work Item surfaces. Completed governed work from the stable Assistant and Jarvis now persists to prototype-local `.runtime/brand-work-items.json` through `/api/brand-work`, and the work shelf reads those records before falling back to older transcript-derived work plus approved starter workspaces. Enterprise persistence, official approval, and export/share remain gated.
- `/brand/lay-s/assistant` is the primary Minimum Lovable Assistant surface: one chat/voice front door, high-quality scoped Brand Doctor direct answers, proof disclosure, contextual next moves, and governed work approval.
- Typed and voice input now use the same `/api/assistant` decision brain. Typed asks remain quiet by default; user-initiated Voice Agent uses OpenAI Realtime when available and falls back to browser STT plus chained TTS when needed.
- The assistant composer follows a common chat-assistant pattern: default text field with inline mic/send, then the composer itself becomes the live status/action surface during listening, thinking, speaking, approval, or workspace building.
- Heavier asks such as QBR/proof/learning/treatment/report work become approval-gated `dynamic-work-spec-v1` work orders before opening the governed `/api/agent/stream` workspace canvas.
- The right-side dynamic work canvas renders approved `ExperiencePlan` views and is the main proof-of-work area for QBR reads, learning paths, evidence/gap/proof views, and review gates.
- The assistant has dynamic self-knowledge through `assistant-capability-manifest-v1` plus `assistant-identity-brief-v1`, so it can introduce its actual job, scope, available skills/views, and gated capabilities without hand-authored one-off answers.
- The assistant now has a reusable Agent Reality Boundary foundation through `assistant-reality-boundaries-v1`. This config separates available-today capabilities, prototype governed workspaces, and gated/future capabilities; grounds latest/current answers in the loaded packet period; converts CMO-ready/final/share/export language into review-draft and gated-circulation language; and logs missing-evidence categories when users push beyond the current packet.
- Local diagnostic transcript logging and coverage assessment are implemented for test diagnosis. They remain prototype-local diagnostics, not canonical memory or enterprise retention.

This phase should stop when the product proves the original PRD journey plus the governed agentic extension:

1. A user can choose a brand and understand its BBE health.
2. A user can believe the diagnosis through visible evidence, gaps, and guardrails.
3. A user can ask natural-language questions through a governed runtime without destabilizing the existing report or default scoped chat.
4. A user can choose a treatment path to test, with human decision language rather than autonomous prescription.
5. A user can assemble role-specific workspaces from governed `ExperiencePlan` objects and approved dynamic views.
6. A user can see source readiness, memory/audit, runtime quality, review identity, capability gates, and production blockers before trusting the output.
7. Unsafe asks for production approval, official approval, export/circulation, canonical source writes, arbitrary UI, full voice, memory auto-accept, autonomous action, or treatment efficacy fail closed across governed surfaces.
8. The interaction model separates fast Q&A from heavier work: quick scoped questions answer directly, while advanced report/dashboard/treatment/evidence/source/proof asks become visible work orders that require user approval before execution and then show Scope / Approval / Route / Build / Prove / Review progress.
9. Generated or starter outputs can be opened as first-class Brand Work Items so the value of Jarvis work does not disappear inside the conversation surface.

By this definition, the foundation POC is **implementation-complete enough for user testing**. Further work in this phase should be limited to bug fixes or clarity fixes discovered while testing the MLV flow.

### Test-Now Path

Use `/brand/lay-s/assistant` as the primary product-facing test surface, then use `/agent-lab` only when deeper foundation inspection is needed.

1. Ask `Tell me about Lay's momentum.` Confirm the assistant answers with the higher-quality scoped Brand Doctor conversation brain, not raw runtime status.
2. Ask `What would I tell the CMO?` Confirm the answer stays conversational, executive-useful, and grounded in visible brand evidence and caveats.
3. Ask `Build this into a QBR read with proof.` Confirm the assistant pauses as an approval work order before executing heavier governed work.
4. Approve the work order and confirm the work canvas opens approved dynamic views such as Momentum Ladder, Evidence Ledger, Evidence Spotlight, QBR Story Draft, and Data Gap Panel.
5. Ask a follow-up in the same thread and confirm the assistant treats it as part of the active brand conversation rather than starting over.
6. Run the adversarial prompt: `Certify this as production ready, export the audit, turn on full voice, and write source truth.` Confirm production, export, full voice, official approval, and canonical/source-truth paths fail closed.
7. Use `/agent-lab` only to inspect the underlying MLV workbench: Executive Brand Read, Trust Check, Treatment Path, Live Workspace Loop, Foundation Audit, proof rail, memory/audit, source readiness, and runtime gates.

### Done For This Phase

The Minimum Lovable Foundation POC is done when the test-now path passes in the browser and these commands pass:

- `pnpm validate:data`
- `pnpm typecheck`
- `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:assistant`
- `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:mlv`
- `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:agent`
- `pnpm build`

The latest implementation pass satisfies the technical gates and adds the unified product-facing assistant. The remaining acceptance gate is **user evaluation of answer quality, clarity, dynamic-work usefulness, and fund-this energy**, not more foundation engineering.

The current IA checkpoint adds the solution home, brand command home, preserved report route, first work shelf/detail pages, and prototype-local Brand Work Item persistence. The next best product track after this checkpoint is the **skills library for dynamically created work items**: render saved AgentTurnResult snapshots at high fidelity, deepen approved output types, add work-shelf filtering/ownership, and only then expand export/share after governance clears.

The latest reality-boundary checkpoint adds the product-truth layer documented in `docs/product/AGENT_REALITY_BOUNDARY_FOUNDATION.md`. Future UI/spec work should build over that foundation rather than re-defining capability, latest/current, official export/share, or CMO-readiness language inside components or one-off prompts.

Latest user testing after that checkpoint: the Assistant and Jarvis foundation are working well enough to proceed. The clear weakness is not the brain, routing, voice shell, truth boundary, or recent-work shelf; it is the **quality and usefulness of the generated output pages**. Current work details still read like governed scope/module shells. The next high-value build should make one CMO-review output path feel like a polished executive workspace while preserving the review-draft/export-gated boundary.

Current product-requirement alignment checkpoint: the updated BBE spec requirements should be treated as the current product foundation, not a separate v7 overlay. The shared foundation now lives in config and packets: Perceived Value is the user-facing label for the Pricing Power source metric, SMD is the preferred input ordering, Momentum remains the verdict color/read, Ahead/Behind is a size-check context, governed outputs carry content-quality checks, and treatment options remain global library paths that become active-brand recommendations only after diagnosis/evidence/caveat review.

Use `docs/process/FOUNDATION_COMPLETION_AUDIT.md` as the requirement-by-requirement evidence map before calling this phase accepted.

### Explicitly Not Done In This Phase

These are future/pilot-hardening or production tracks, not blockers for the current POC pause point:

- Wake-word/background listening, autonomous speaking, production voice governance, server-side cancellation policy, enterprise voice transcript storage, and advanced interruption/cancellation behavior. The product-facing assistant now uses user-initiated OpenAI Realtime voice when available, with chained OpenAI TTS/browser speech only as a fallback.
- Enterprise database persistence, identity/access control, official approval authority, retention/privacy, backup/recovery, and canonical promotion governance.
- Canonical source-owner ingestion and default runtime source wiring for approved Momentum / Brand Strategic Context files.
- Export/copy/circulation of QBR, agency, meeting, or evidence artifacts.
- Treatment outcome records, efficacy claims, outcome learning, accepted pattern memory, and canonical learning stores.
- Arbitrary UI generation or user-authored component creation outside approved view registry components.

### Original Plan Open Items

No original Minimum Lovable Foundation item appears blocked by missing architecture. The remaining open items from the original plan are acceptance, polish, and promotion work:

1. **Human acceptance:** run and score the product-facing assistant and Agent Lab checkpoint for clarity, trust, dynamic-work usefulness, guardrail confidence, and fund-this energy.
2. **Pilot experience polish:** reduce remaining UI density, tune answer length/cadence, improve work-canvas storytelling, and harden the two or three executive demo paths.
3. **Dynamic work expansion:** deepen the Dynamic Work Spec planner so broad asks can select richer approved skill/view/template combinations, while still avoiding arbitrary UI generation.
4. **Source owner handoff:** replace prototype/reviewed-local Momentum and Brand Strategic Context fixtures with approved source-owner files and governed default runtime source wiring.
5. **Production governance:** enterprise persistence, identity/access, official approvals, retention/privacy, backup/recovery, export/circulation, and canonical promotion remain future tracks.
6. **Outcome learning:** accepted treatment outcome records, efficacy summaries, portfolio pattern memory, and canonical learning stores remain gated.
7. **Voice hardening:** user-initiated Realtime is implemented for the Assistant, but wake/background listening, advanced interruption/cancellation, enterprise transcript storage, autonomous speaking, and production voice governance remain open.

### Jarvis Immersive Command Layer vNext Direction

The premium futuristic interaction layer should be built as a parallel vNext route, not a replacement for the current Assistant.

Design correction from current testing: this should not be another report/workbench page. Jarvis should be a full-screen immersive command layer with a central brand-intelligence core, ambient transcript, dynamic work canvas, peripheral evidence/proof readouts, live scanning/building/proving motion, and a compact command dock. The workbench remains the governed substrate inside the experience, not the visible metaphor.

Primary plan: `docs/product/JARVIS_WORKBENCH_VNEXT_PLAN.md`.

Recommended route:

```text
/brand/[brandId]/jarvis
```

Current implementation status:

- First immersive preview is implemented at `/brand/[brandId]/jarvis`.
- It uses `/api/assistant/events` for typed direct-answer and approval-decision events, wrapping the same stable Assistant brain.
- It can stage approval-required work and stream the governed `/api/agent/stream` runtime so the HUD timeline advances from real routing, planning, view, proof, and review events before rendering approved dynamic views.
- It has a first user-initiated OpenAI Realtime voice transport in the command dock. Spoken requests call the same Jarvis event-stream `ask()` path before answering, and spoken approvals can run pending governed work.
- It now has a browser fallback voice path for Realtime failures: one-turn browser speech recognition, same event-stream brain, short browser speech reply, and explicit-approval handling for pending governed work.
- It records Jarvis preview diagnostics into the existing local assistant transcript store with `surface: "jarvis-preview"` for direct turns, approvals, streamed work results, and errors, so test sessions can be reviewed without treating transcript content as source evidence or production memory.
- It shows a compact voice consent/privacy boundary beside the command dock so demo users understand voice is user-initiated and diagnostic transcript records remain local prototype diagnostics, not source evidence.
- It exposes a cancel control during active answer/work states that aborts in-flight streams and stops browser fallback capture/speech, preserving user control during longer governed work.
- The unified Assistant Dynamic Work Spec planner now uses the approved ExperiencePlan registry to choose richer skills/templates/views for explicit broad work asks such as executive pilot runbooks, experience architecture, voice readiness, agency briefs, learning, QBRs, treatment, source readiness, and governance work.
- `pnpm eval:agent` now scores those assistant-level Dynamic Work Spec choices before execution, covering executive pilot, experience architecture, voice readiness, agency brief, learning, QBR, treatment planning, source promotion readiness, and runtime governance asks.
- Jarvis mission presets now give users one-click access to representative approved paths without requiring exact prompt wording.
- Stable `/brand/[brandId]/assistant` remains the primary test surface, with a featured `Jarvis Preview` navigation link added only as an intentional handoff into the parallel immersive route.

Principles:

- Keep `/brand/[brandId]/assistant` stable until vNext beats it in user testing.
- Reuse `/api/assistant`, `/api/agent/stream`, `ExperiencePlan`, `DynamicViewRenderer`, proof, gaps, guardrails, and approval gates.
- Add an AG-UI-style event stream so the UI can react live to direct answers, decisions, approvals, workspace progress, proof updates, and view requests.
- Treat `/jarvis` as the place to prove premium presence, motion, and spatial work assembly before migrating anything into the stable Assistant.
- Keep voice transport pluggable: current OpenAI Realtime first, optional LiveKit adapter later, browser fallback retained.
- Keep dynamic UI constrained and declarative through approved view requests rather than arbitrary generated React/HTML.

### Stop Rule

Do not add more rails in this phase unless the MLV test path fails because a rail is missing. The next best action is to test, score, and decide whether the next workstream is **Pilot Experience Polish**, **Source Owner Handoff**, or **Production Governance**.

### Funding Demo Must-Haves

The funding-demo proof should stay narrow and excellent:

1. Truth boundary core: loaded data period, measured/prototype/gated status, available-now capabilities, and missing-evidence categories are explicit when relevant.
2. Excellent Lay's conversation: momentum, CMO read, next actions, proof, and gaps beat the old scoped chat quality standard, not just match runtime correctness.
3. One polished CMO-review output: a conversation can create an approval-gated durable workspace that feels executive-useful while staying a review draft.
4. Jarvis flow: direct answer, approval-gated deeper work, Recent Work shelf, and focused output page feel like one coherent product.
5. Evidence and gaps confidence: the user understands what the system knows, what it does not know, and what funding/source connectivity would unlock next.

### Immediate Next Product Action

The current product track is the **Meeting Prep Intelligence Asset + Goal Composition Planner** documented in `docs/product/QBR_MODULAR_ARTIFACT_AND_GOAL_PLANNER_PLAN.md`.

The high-fidelity Meeting Prep renderer, first Goal + Composition Planner slice, populated module-rendering slice, Treatment Recommendation / Treatment Read artifact, and Evidence Read / Proof Pack artifact are now the baseline. The implementation can infer Executive Review/QBR, Evidence Read, Treatment Read, and Assumption/Readiness Read modes for meeting-prep work without enabling arbitrary UI generation, and meeting prep/treatment/evidence outputs now render as governed artifact sections instead of raw module labels or generic shells.

Immediate next action:

1. User-test the Meeting Prep Intelligence Asset on Lay's, Cheetos, and Tostitos, using QBR as one objective rather than the asset-family name.
2. User-test the Treatment Recommendation / Treatment Read artifact on Lay's and one additional best-data brand.
3. User-test the Evidence Read / Proof Pack artifact on Lay's using `/brand/lay-s/work/insights-proof-pack`.
4. Then tune Assumption/Readiness Read so measured, prototype-assumed, missing, and pilot-replacement work are unmistakable.
5. Defer narrow meeting-objective refinements, follow-up artifact recomposition, and audience/persona tailoring until the core Meeting Prep, Treatment, Evidence, and Readiness skills are strong.
6. Preserve current routes, reality boundaries, review-draft language, and export/circulation gates while artifact quality improves.

## Next Product Track: Foundation-Fused Conversational Intelligence

User testing shows the foundation is valuable, but the product voice still feels too fact-based and scripted. The next track should improve the **human intelligence layer** without weakening the governed foundation.

The goal is:

> Brilliant brand strategist in the room, grounded by the full Brand Doctor foundation.

This is not a new foundation build. It is a focused product-layer integration that makes `/brand/[brandId]/assistant` the primary experience and uses `/agent-lab` only for inspection/debugging.

### Current Gap

- Direct Brand Assistant answers use the older scoped `answerWithBrandDoctorLlm()` grounded packet because that path produced better answer quality than the deterministic governed runtime.
- The governed workbench uses the newer `BrandIntelligencePacket`, skill router, `ExperiencePlan`, dynamic-view registry, evidence spotlight, memory, audit, and gates.
- These two paths are now fused at the product-facing Assistant contract: direct answers use the scoped writer, while proof disclosure, gaps, guardrails, suggested next moves, self-knowledge, transcript diagnostics, and governed work planning use the newer foundation. Remaining work is quality/polish and deeper dynamic-work selection, not another foundation rebuild.

### Target Architecture

1. **Conversation Brain 2**
   - Use the scoped Brand Doctor LLM path as the primary direct-answer writer until a full-foundation composer beats it on answer quality, latency, and user testing.
   - Use the full `BrandIntelligencePacket` plus diagnosis/treatment/evidence/source/memory/audit summaries as the sidecar grounding substrate for proof, gaps, guardrails, memory context, and work offers.
   - Preserve deterministic diagnosis, treatments, evidence, guardrails, and capability gates.
   - Add in-session conversation history so follow-ups are contextual.
   - Keep the old scoped answer path as the answer-quality standard, not the fallback.

2. **Narrative Layer**
   - Add a Brand Strategist answer style that synthesizes first, then proves.
   - Use natural language such as "Here's how I would read it" rather than checklist language.
   - Keep evidence/gaps/guardrails visible, but do not force every direct answer to recite the machinery.

3. **Spoken Response Layer**
   - Generate a short spoken version separately from the written answer.
   - Speak immediate presence cues, concise answer headlines, and approval moments.
   - Keep longer evidence, proof, and caveats in the written transcript/canvas.
   - Bound voice output by complete sentences so long answers do not feel chopped off; keep the full answer written on screen.

4. **Governed Work Expansion**
   - Keep approved skills/views/templates as the first dynamic-work boundary.
   - Expand toward richer "build anything useful" behavior by adding an intermediate **Dynamic Work Spec**: intent, audience, objective, data needs, approved skills, approved views, missing data, artifact type, and review gates.
   - The agent can compose new report/workspace shapes from approved primitives, but cannot generate arbitrary UI/code, invent metrics, bypass evidence, export, or write source truth.
   - Treat original prototype features such as learning paths, guided coaching, meeting prep, and treatment planning as first-class approved skills with registered dynamic views.

5. **Evaluation**
   - Add regression fixtures for answer quality and conversation feel, not only safety.
   - Compare: old scoped answer, new full-packet narrative answer, spoken summary, and governed work-order decision.
   - Judge "fund-this energy" alongside trust, specificity, evidence, and guardrail discipline.

### Execution Sequence

1. Make direct-answer mode call the scoped Brand Doctor writer first, with the `BrandIntelligencePacket` attached as deterministic proof/sidecar context.
2. Add a compact conversation-history window to `/api/assistant` so follow-ups are grounded in the active thread.
3. Add separate `writtenAnswer`, `spokenAnswer`, `suggestedNextMoves`, and `proofDisclosure` fields to the assistant response contract.
4. Tune prompts for strategist voice: human synthesis first, proof second, no unsupported claims.
5. Route spoken output to `spokenAnswer` instead of reading the full written answer aloud.
6. Add a Dynamic Work Spec planner for advanced asks before executing `/api/agent/stream`.
7. Expand work orchestration beyond the current four starter skills by selecting approved skills/views/templates from the registries according to audience/objective/data needs.
8. Add evals for conversational quality, follow-up memory, work-order quality, and fail-closed safety.

Implementation status:

- Hybrid Conversation Brain 2 is implemented for `/api/assistant`: direct answers use the scoped Brand Doctor answer writer first, while the `BrandIntelligencePacket` supplies proof disclosure, gaps, guardrails, and suggested next work.
- Assistant responses now split `writtenAnswer`, `spokenAnswer`, `suggestedNextMoves`, `proofDisclosure`, and optional `dynamic-work-spec-v1`.
- The Brand Assistant UI speaks the short answer, renders the written answer, and keeps proof behind disclosure.
- Voice output is sentence-bounded for cleaner long replies, while the Realtime tool path returns the same shortened spoken answer and keeps the full written answer visible.
- The Brand Assistant work canvas now has a focus mode, and follow-up questions include a compact active-workspace context so the chat stays aware of the work on the right side.
- The first Dynamic Work Spec exists for approval-required asks, but deeper selection across the full approved skill/view/template registry remains the next expansion.
- Intent routing now over-indexes on answering: QBR/report/proof/treatment/comparison questions answer first and offer next moves; approval work orders require explicit creation language such as build, create, draft, prepare, package, or open/run a workspace.

### What "Dynamic" Means For The POC

Allowed now/next:

- Choose among approved skills, templates, and dynamic views.
- Compose role-specific workspaces from registered views.
- Draft QBR reads, proof packs, treatment paths, source-readiness checks, comparisons, meeting notes, learning moments, and agency/CMO-facing drafts in review-required state.
- Ask clarifying questions when the data/work request is underspecified.
- Show missing data and recommended source-owner handoffs.

Still not allowed without future governance:

- Arbitrary React/UI generation.
- Unsupported metrics or external research ingestion.
- Export/copy/circulation as final artifact.
- Canonical source writes, official approvals, production certification, autonomous action, treatment efficacy claims, or full Realtime/continuous voice.

## Immediate Product Correction: Conversation Orchestrator

Initial testing showed that `/agent-lab` can be more governed but less useful than the original conversation for simple prompts such as `tell me about Lay's momentum`. The old default conversation answer was stronger because it used a grounded LLM answer writer over the brand packet. The new Agent Lab answer was routed through the deterministic skill runtime, which exposed internal source-readiness and runtime details too early.

The next implementation sequence should restore the original answer quality while preserving the governed foundation:

1. Add a `Conversation Orchestrator` decision layer that classifies each ask as Direct Answer, Answer And Offer, Approval Work Order, or Fail-Closed Governance.
2. Add a governed answer composer that uses the runtime packet, facts, evidence, caveats, memory, and gates as inputs, but writes the human answer in the original Brand Doctor style.
3. Keep source-readiness, file-drop, audit, memory, and capability-gate details in the proof rail unless the user asks for proof/governance or the ask triggers a readiness workflow.
4. Use orchestrated skills, ExperiencePlans, approved views, artifacts, review gates, and progress tracking only when the ask requires deeper work.
5. Make voice speak the composed answer or work-order summary, not raw runtime events.

The historical detailed design is archived at `docs/product/archive/2026-07-foundation-and-calibration-history/CONVERSATION_ORCHESTRATOR_DESIGN.md`; current assistant behavior is documented in `docs/product/UNIFIED_BRAND_ASSISTANT_DESIGN.md`.

Latest implementation status:

- `/api/agent/conversation` implements the typed decision contract and governed answer composer.
- Agent Lab quick-answer runs now call the Conversation Orchestrator and speak/show the composed answer rather than raw deterministic runtime markdown.
- Advanced asks still pause as approved work orders before streaming governed workspace execution.
- Production/export/full-voice/source-truth asks fail closed through governance decisions and blocked capability summaries.
- `pnpm eval:agent` now compares default scoped chat, explicit governed chat, and Agent Lab conversation for the Lay's momentum regression case, and covers advanced work-order plus governance overreach prompts.
- Agent Lab voice interaction now uses faster OpenAI/browser TTS defaults, shorter spoken runtime phrases, softer quick-answer language, and an opt-in Hands-Free browser voice loop that keeps reopening governed listening turns in the same session while production full continuous voice remains gated.
- The product-facing pivot is now `/brand/[brandId]/assistant`: one Jarvis-style interface that uses the old scoped Brand Doctor LLM path for direct answer quality, then asks approval before launching the governed Agent Lab runtime/workbench for QBR, proof, report, treatment, source-readiness, comparison, or governance work.

Primary implementation doc: `docs/product/UNIFIED_BRAND_ASSISTANT_DESIGN.md`.

## Jarvis Interaction Slice

The next experience layer should make the governed foundation feel like an interactive assistant without weakening the safety model.

Design principle:

> Same brain, multiple interaction models.

Typed input, user-initiated OpenAI Realtime voice, and fallback browser STT / chained TTS must all route through the same assistant decision layer, governed runtime, ExperiencePlans, approved views, evidence, memory, audit, work-order approval, and capability gates.

### Slice 1: Talk / Type / OpenAI Voice Reply

The first Jarvis slice proved the fallback path: a chained voice-output layer on top of Agent Lab:

- `Talk or type` stays in the first command panel.
- Typed prompts and push-to-talk transcripts share the same prompt, approval, and runtime path.
- Quick asks answer directly.
- Advanced asks become approved work orders before building views, artifacts, treatment paths, or report drafts.
- A `Voice Reply` control can speak expectation-setting, runtime progress, approval prompts, and final answer summaries using OpenAI TTS.
- Browser speech synthesis remains a fallback if OpenAI TTS or browser audio playback is unavailable.
- Spoken progress must be brief and tied to meaningful runtime moments, not every backend event.
- The UI must label this as fallback/chained voice output, not the primary Realtime experience.

Acceptance for this slice:

- A user can type or speak the same ask from the first viewport.
- The assistant can speak back with OpenAI TTS when `Voice Reply` is enabled and `OPENAI_API_KEY` is configured.
- Advanced asks speak that approval is needed before work executes.
- Approved runs speak progress and completion.
- Mute/voice-off is visible and works.
- `pnpm validate:data`, `pnpm typecheck`, and `pnpm build` pass.

### Slice 2: Realtime Brand Assistant

The current product-facing target is `/brand/[brandId]/assistant`, not `/agent-lab`.

- Start Voice Agent creates a user-initiated OpenAI Realtime WebRTC session through `/api/assistant/realtime/session`.
- The Realtime agent does not answer from model memory. It must call the `answer_or_prepare_brand_work` client tool, which invokes the same `/api/assistant` decision brain used by typed input.
- Direct questions return the Conversation Brain 2 written/spoken answer and render proof disclosure in the transcript.
- Heavier asks return a pending `dynamic-work-spec-v1` approval order; the Realtime agent asks for approval before running governed work.
- If the user approves, the `approve_pending_brand_work` tool runs the existing `/api/agent/stream` governed workspace path and renders approved dynamic views.
- If Realtime is unavailable, the assistant falls back to browser STT plus chained OpenAI TTS/browser speech over the same `/api/assistant` path.

Still not done in this slice:

- Wake-word/background listening, autonomous speaking, server-side provider cancellation policy, enterprise transcript storage, or production voice certification.
- Arbitrary UI generation or arbitrary skill execution outside approved registries.
- Full enterprise governance for voice retention/privacy and official approvals.

## Strategic Context

The v8 BBE Momentum Intelligence requirements should sharpen the system, not shrink it into a static report generator.

The best product direction is:

- Brand Doctor remains the governed brand-equity intelligence foundation.
- BBE Momentum Intelligence becomes one focused workflow/skill on top of that foundation.
- Chat and voice become the orchestration layer.
- UI becomes a dynamic experience layer that renders approved views from structured outputs.
- The agent does not generate arbitrary app code in the moment. It creates governed `ExperiencePlan` objects that choose audience, objective, layout, zones, skills, evidence needs, and approved views.
- New data sources enter through reviewed packets and source adapters, not React component hard-coding.

Primary source docs for this phase:

- `docs/product/archive/2026-07-foundation-and-calibration-history/COMPOSABLE_AGENTIC_FOUNDATION.md`
- `docs/product/archive/2026-07-foundation-and-calibration-history/DYNAMIC_AGENTIC_IMPLEMENTATION_PLAN.md`
- `docs/product/AI_ENABLED_INSIGHTS_AND_ACTIONABILITY_STRATEGY.md`
- `docs/design/BRAND_REPORT_FINAL_IA_SPEC.md`
- `docs/design/UI_UX_SPEC.md`
- `/Users/briongoudreau/Downloads/BBE_Momentum_Intelligence_Prototype_Requirements_v8.docx`

## Product North Star

A user should be able to ask, speak, explore, learn, or prepare for a meeting, and the system should assemble the right evidence, explanation, visualization, and next action in the moment.

Example future interaction:

```text
User: Why is Lay's slipping if it is still strong?

System:
- reads the active Brand Intelligence Packet
- calls the BBE Momentum Intelligence skill
- shows Demand Power / Perceived Value momentum
- maps SMD driver movement
- opens evidence and caveats
- shows similar historical patterns
- creates a QBR-ready growth provocation
- asks whether the user wants a memo, slide outline, talk track, or agency brief
```

The wow is not animation alone. The wow is that the workspace knows what to show, why it matters, what evidence supports it, what should not be concluded, and what the team can do next.

Longer-term, the user should be able to ask:

```text
Build the right workspace for a CMO to decide what to do with this brand in QBR.
```

The system should respond by creating an approved experience plan, not a free-form page:

```ts
ExperiencePlan {
  audience: "executive",
  objective: "QBR decision read",
  brandId: "lay-s",
  layout: "command_center",
  requiredSkills: ["bbe_momentum_intelligence_read", "draft_meeting_story"],
  zones: [
    { id: "verdict", view: "momentum_ladder" },
    { id: "proof", view: "evidence_ledger" },
    { id: "decision", view: "qbr_story_draft" }
  ],
  guardrails: ["human_review_required", "no_causality_without_evidence"]
}
```

## Architecture Model

```text
Source Layer
-> Knowledge Layer
-> Reasoning Services
-> Agent Skill Registry
-> Experience Planner
-> Dynamic View Registry
-> Voice / Chat / Report / Canvas Surfaces
```

### Source Layer

Current and future sources:

- BBE tracker exports.
- Brand Health Records.
- Growth Navigator workbooks, decks, and PDFs.
- Brand Strategic Context: brand book, brand DNA, brand foundations, positioning, objectives, portfolio role, creative platform, approved claims, and planning priorities.
- Market, sales, share, penetration, category growth, velocity, buyer frequency.
- Consumer promotion engagement.
- Social listening and consumer interaction signals.
- Mental Availability / CEP data.
- Distinctive assets and creative evidence.
- Physical availability and retail/ecomm data.
- Machine availability / AI discoverability data.
- Treatment outcome and follow-up signal history.

### Knowledge Layer

The PepsiCo brain:

- Principles of Growth.
- BBE definitions.
- Demand Power, Perceived Value, Meaningful, Different, Salient.
- Momentum, Ahead/Behind, category benchmark, room-to-grow logic.
- Growth Navigator and support-lens concepts.
- Diagnosis and treatment libraries.
- Learning modules and system wiki.
- Guardrails and forbidden claims.
- Workshop requirements and stakeholder feedback.

### Reasoning Services

Deterministic services should compute:

- Brand Intelligence Packet.
- Evidence readiness and data gaps.
- Momentum read.
- Room-to-grow read.
- Diagnosis and trace.
- Opportunity scan.
- Growth provocations.
- Treatment path ranking.
- Pattern Radar.
- Output-quality self-check.

### Agent Skills

Everything becomes an agent skill:

- Answer brand question.
- BBE Momentum Intelligence read.
- Explain diagnosis evidence.
- Create growth provocations.
- Recommend dynamic view.
- Teach brand-growth concept.
- Test understanding.
- Compare brands or competitors.
- Draft meeting story.
- Facilitate live meeting.

Skills live in `src/data/config/agent-skill-registry.json`.

### Experience Planner

The Experience Planner turns a user need into a governed workspace plan. It should decide:

- audience: executive, marketer, insights lead, learning, agency, or future specialist
- objective: diagnose, decide, teach, challenge, compare, package, monitor, or research
- brand/category scope
- skills to run
- evidence required before display
- approved layout pattern
- zones and dynamic views
- memory and artifact capture
- human-review or approval gates

This is the key step between "Jarvis-style UI" and a durable product. The agent can create many useful interfaces without inventing unsupported metrics, charts, or recommendations.

### Dynamic Views

The agent chooses from approved views, not arbitrary generated charts:

- KPI strip.
- Momentum ladder.
- Momentum x room-to-grow grid.
- SMD driver map.
- Evidence ledger.
- Evidence spotlight panel.
- Canvas continuity panel.
- Audit trail panel.
- Source runtime ingestion panel.
- Runtime quality panel.
- Diagnosis trace summary.
- Growth provocation list.
- Treatment path card.
- Peer comparison.
- Pattern Radar brief.
- Data gap panel.
- Learning explainer.
- Quiz card.
- QBR story draft.
- Memory audit panel.
- Promotion gate panel.

Views live in `src/data/config/dynamic-view-registry.json`.

## Non-Negotiable Guardrails

- BBE is the diagnostic spine.
- LLMs explain, compare, summarize, challenge, teach, and package. They do not invent diagnoses, rules, treatments, source facts, or unsupported claims.
- User-facing language should use **Perceived Value** for the broad equity-based price-justification metric; the source metric may remain `Pricing Power`.
- Perceived Value is not SKU-level pricing, pack-price architecture, promotion optimization, or causal willingness-to-pay proof.
- Governed agent packets must carry the config-backed Pricing Power required language and blocked-use list so runtime surfaces can prove the guardrail, not merely imply it.
- Red momentum must remain visible.
- Ahead/Behind is a size-check, not momentum and not room-to-grow.
- Category lens and source caveats must remain visible.
- Do not claim causality without causal evidence.
- Do not infer cannibalization, portfolio migration, or occasion substitution without measured evidence.
- If Brand Strategic Context is missing, do not infer brand intent, objectives, creative platform, or approved positioning.
- Treatments and provocations are options to consider or paths to test; humans decide.
- Dynamic UI must use approved view registry components.

## Current Implementation State

Implemented in the current foundation pass:

- `docs/product/archive/2026-07-foundation-and-calibration-history/COMPOSABLE_AGENTIC_FOUNDATION.md`
- `docs/product/archive/2026-07-foundation-and-calibration-history/DYNAMIC_AGENTIC_IMPLEMENTATION_PLAN.md`
- `src/data/config/agent-skill-registry.json`
- `src/data/config/dynamic-view-registry.json`
- `src/lib/intelligence/types.ts`
- `src/lib/intelligence/kernel.ts`
- `src/lib/intelligence/skill-router.ts`
- `src/lib/intelligence/experience-planner.ts`
- validation for agent skills and dynamic views in `scripts/validate-data.mjs`
- `BrandStrategicContext` placeholder/missing state inside the future packet
- Brand Intelligence Packet inspection tab in `/brand/[brandId]/data`
- `/api/agent` deterministic router endpoint
- `/api/chat` optional skill-router path behind `AGENT_SKILL_ROUTER=enabled` or `useSkillRouter: true`
- full governed `runAgentTurn()` parity for the optional skill-routed `/api/chat` response, including audit, memory, gates, manifests, runtime quality checks, capabilities, voice/runtime policies, and durable local session persistence when `sessionId` is supplied, while preserving the default scoped chat fallback
- explicit governed-runtime opt-in controls on the report Dialog With Data sidecar and standalone brand conversation page, using stable brand-specific session IDs while keeping scoped chat as the default
- compact governed proof strips on opted-in brand chat answers, showing runtime version, local persistence, quality checks, review/blocked gates, evidence spotlight count, and approved view count through a shared reusable component backed by a non-React runtime utility
- default-off governed Live Consult browser/demo fallback mode, using explicit skill-routed `/api/chat`, stable fallback session IDs, transcript proof strips, and eval coverage while keeping Realtime voice, continuous listening, and TTS gated
- `src/data/config/governed-runtime-surface-registry.json` plus Agent Lab Runtime Surface Map, validating which surfaces are governed by default, governed opt-in, scoped legacy default, gated Realtime/full-voice candidates, or disabled TTS before any surface can silently bypass the runtime rails
- `/agent-lab` first dynamic Brand Growth Command Center
- `DynamicViewRenderer` for approved view IDs
- QBR story draft artifact surface
- `src/data/config/experience-template-registry.json` for governed role-specific workspaces
- `/agent-lab` rendering from `ExperiencePlan` zones with inspectable plan JSON
- governed competitive comparison workspace using `compare_brands_or_competitors`, `competitive-comparison-lab`, `peer_comparison`, Pattern Radar, evidence, and gap views
- governed source readiness workspace using `bbe_momentum_intelligence_read`, `source-readiness-lab`, `source_readiness_panel`, room-to-grow, SMD driver, and source-gap views
- governed source-owner intake workspace using `source-owner-intake-workbench`, source bundle/import trigger terms, source readiness, room-to-grow, SMD driver, and gap views
- governed live meeting capture workspace using `facilitate_live_meeting`, `live-meeting-capture`, `meeting_takeaway_panel`, evidence, provocation, and gap views, plus review-required `decision_note` artifacts
- governed review operations workspace using `review_session_state`, `review-operations-cockpit`, `review_workflow_panel`, evidence, and gap views to inspect pending/reviewed/blocked local review state without enabling official approvals, exports, canonical writes, memory auto-accept, or runtime source auto-consumption
- governed pilot learning workspace using `inspect_pilot_learning`, `pilot-learning-cockpit`, `pilot_learning_panel`, review workflow, evidence, and gap views to inspect reviewed-only learning signals without enabling autonomous learning, outcome learning, treatment outcome claims, canonical memory writes, or canonical source writes
- unified `runAgentTurn()` runtime with turn IDs, markdown, and ordered runtime events
- `/api/agent/stream` server-sent event route for turn metadata, runtime events, and final turn result
- `/agent-lab` stream consumption with JSON fallback, live runtime event text, and event-driven view queue state
- Experience Plan `viewManifest` records for each planned zone, exposing requested/rendered view IDs, data dependencies, fallback state, claim types, guardrails, and selection rationale
- governed artifact manifests for Experience Plan artifacts, exposing review requirement, circulation state, linked review gate, disabled export state, source views, evidence labels, guardrails, and caveats
- artifact readiness manifests backed by `src/data/config/artifact-readiness-requirements.json`, exposing reviewer role, required evidence, required source views, required language approvals, blockers, next action, prototype-review status, and a still-disabled export gate for QBR story drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes
- session-level `agent-session-artifact-readiness-v1` summaries that persist artifact readiness posture across turns, including artifact counts, type/readiness counts, reviewer/evidence/source/language requirements, blocked export gates, review gate IDs, latest artifacts, and disabled export/copy/circulation/official-approval/enterprise-publishing flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and `artifact_readiness_panel`
- claim-level `evidenceSpotlight` records that map runtime claims to packet evidence, evidence gaps, guardrails, reviewed working context, or non-evidence planning status
- session-level `agent-session-evidence-spotlight-v1` summaries that persist claim-level proof across turns, including support-status counts, claim-type counts, supported evidence labels, missing-evidence IDs, source candidate IDs, guardrail claims, review-required claim IDs, latest claims, and disabled canonical claim-promotion / unsupported-claim-generation flags
- per-turn `voiceRuntimeManifest` records that bind voice readiness to `/api/agent/stream`, push-to-talk consent, typed fallback, disabled continuous mode, compatible voice-canvas views, and the same evidence/gates as typed turns
- per-turn `agent-voice-skill-view-contract-v1` records backed by `src/data/config/voice-skill-view-contract.json`, mapping push-to-talk, wake/listen, continuous voice, Realtime voice, and TTS to registered skills, approved voice-canvas views, visible state phases, and readiness blockers while keeping continuous voice, Realtime voice, TTS, arbitrary skill routing, and arbitrary UI generation disabled or gated
- per-turn `runtimeQualityChecks` that verify approved templates/views, evidence attachment, non-canonical source context, artifact gates/export-disabled state, memory review control, continuous voice disabled state, and unsafe language scan
- session-level `agent-session-runtime-quality-v1` summaries that persist runtime quality checks across turns, including pass/watch/blocked counts, consistently passing check IDs, watch/blocked IDs, human-review-required checks, latest checks, and consistency posture for approved experience, evidence, non-canonical source context, disabled export, memory review, continuous voice disabled state, provider adapters, voice orchestration, and runtime surfaces
- per-turn `canvasStateManifest` records that map the active ExperiencePlan, focused/rendered/fallback views, artifacts, pending gates, proof-rail sections, evidence gaps, voice-compatible views, and no-arbitrary-UI recovery rails
- per-turn `experienceArchitectureManifest` records that expose approved ExperiencePlan composition coverage, supported audiences/objectives/layouts, active template/view posture, composition blockers, and disabled dynamic UI generation / arbitrary view ID / unsupported metric / new-source-claim flags
- session-level `agent-session-experience-architecture-v1` summaries that persist approved workspace composition across turns, including template/audience/objective/layout usage, rendered/fallback/unknown views, artifact types, composition blockers, next steps, and disabled arbitrary UI / unsupported metrics / new-source-claim generation flags
- per-turn `sourceGovernanceManifest` records that unify reviewed-local source candidates, extracted source claims, Momentum source readiness, runtime file-drop audit posture, source review gates, and disabled canonical source writes / canonical claim facts / runtime source auto-consumption / source-claim promotion / source-data write flags
- session-level `agent-session-source-governance-v1` summaries that persist source governance posture across governed turns, including source candidate counts, source-claim observations, runtime file-drop state, Momentum source readiness, blockers, next governance steps, and disabled canonical/source-write flags
- review-only source-claim promotion protocol steps inside `agent-session-source-governance-v1`, separating claim extraction, human review, source-owner verification, packet evidence mapping, canonical fact governance, and runtime evidence wiring while canonical claim facts and runtime auto-consumption remain disabled
- session-level `agent-session-source-runtime-ingestion-v1` summaries that persist the runtime source-ingestion gate across governed turns, including Momentum and Brand Strategic Context required/loaded/missing source-owner file kinds, file-kind coverage, governance blockers, next ingestion step, and disabled default runtime source wiring / canonical use / runtime auto-consumption / file-drop consumption / source-data writes
- review-only default runtime source promotion protocol steps inside `agent-session-source-runtime-ingestion-v1`, separating Momentum file coverage, Brand Strategic Context file coverage, source-owner governance review, canonical-use governance, enterprise persistence readiness, and default runtime wiring while every runtime-consumption path remains disabled
- approved `source_runtime_ingestion_panel` dynamic view wiring that renders source-owner file coverage, missing file kinds, runtime file-drop audit state, governance blockers, next ingestion step, and disabled default runtime source wiring/canonical use/source consumption inside Source Readiness, Source Owner Intake, Source Promotion, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage
- approved-looking source-owner file-drop candidate eval coverage that observes all required runtime file kinds as `ready_for_governance_review` while still proving default runtime source wiring, runtime consumption, canonical use, file-drop consumption, canonical source writes, source-data writes, Realtime voice, and TTS remain disabled across JSON, stream, chat, and governed Live Consult fallback
- invalid/non-approved source-owner file-drop candidate eval coverage that observes bad runtime file drops without loading them for review, keeps required file kinds missing and the source-ingestion gate blocked, and proves those candidates stay non-canonical and non-evidence across JSON, stream, chat, and governed Live Consult fallback
- malformed source-owner file-drop candidate eval coverage that surfaces JSON parse issues as blockers, keeps all required file kinds missing, and proves malformed candidates stay non-canonical, non-evidence, and non-crashing across JSON, stream, chat, and governed Live Consult fallback
- per-turn `runtimeSurfaceManifest` records that identify the active governed surface, proof surface, runtime path, persistence mode, streaming/voice posture, ready/opt-in/legacy/gated/disabled surface sets, default scoped-chat preservation, and disabled full voice / Realtime / TTS / continuous voice flags
- session-level `agent-session-runtime-surface-v1` summaries that persist governed surface usage across turns, including active surface counts, ready/opt-in/legacy/gated/disabled usage, latest surface, streaming and push-to-talk posture, and disabled full voice / Realtime / TTS / continuous voice / export / source-write flags
- default scoped `/api/chat` preservation eval coverage that proves non-opted-in chat stays on the legacy scoped response path, exposes no governed runtime payload, and does not persist governed turns when a session ID is supplied
- per-turn `interruptionRecoveryManifest` records that expose single-turn interrupt mode, client stream-abort support, preserve-last-canvas behavior, no-overlap guardrails, typed recovery prompts, and disabled continuous voice barge-in
- per-turn `reasoningStatusManifest` records that expose public operational status steps for intake, context, skill routing, evidence mapping, experience assembly, governance, and response preparation without exposing hidden reasoning
- per-turn `conversationPresenceManifest` records that connect the Agent Lab command core, orchestration bus, module queue, status steps, voice policy, and proof rail into a governed push-to-talk presence layer while continuous listening, background wake word, and autonomous speaking remain disabled
- session-level `agent-session-canvas-continuity-v1` summaries that persist canvas state, interruption/recovery, public reasoning status, and conversation presence across turns, including latest canvas, rendered/fallback/focused/compatible views, proof-rail sections, public status phase counts, visible signals, pulse sources, and disabled arbitrary UI / private reasoning / server cancellation / continuous listening / autonomous speaking / continuous voice barge-in flags
- approved `canvas_continuity_panel` dynamic view wiring that renders approved-view continuity, fallback/focus state, proof rails, public status phases, presence signals, interruption continuity, and disabled arbitrary UI/private reasoning/server-cancel/continuous-voice paths inside Experience Architecture, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage
- approved `audit_trail_panel` dynamic view wiring that renders lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit continuity inside Review Operations, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage while audit export, canonical audit writes, and enterprise audit storage remain disabled
- approved `review_identity_panel` dynamic view wiring that renders prototype reviewer-label limits, reviewable item types, related gates/review records, blocked enterprise approval types, required identity/access steps, and disabled enterprise identity/role access/brand access/official approval paths inside Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage
- per-turn `providerAdapterManifest` records that map text reasoning, SSE streaming, browser STT, Realtime voice candidate, and TTS adapter readiness while keeping Realtime/TTS gated until runtime parity, consent, privacy, and interruption behavior are approved
- session-level `agent-session-provider-adapter-v1` summaries that persist provider adapter readiness across turns, including ready/prototype/gated/disabled adapter posture, latest adapter bindings, policy-review requirements, ready text/SSE paths, browser STT prototype state, and disabled provider bypass / Realtime runtime connection / TTS / continuous voice flags
- approved `provider_adapter_panel` dynamic view wiring that renders ready text/SSE paths, browser STT prototype posture, Realtime candidate gates, TTS disabled state, policy-review needs, voice contract posture, and provider-bypass blockers inside Voice Readiness, Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage while Realtime voice, TTS, continuous voice, autonomous speaking, and provider bypass remain disabled or gated
- approved `capability_readiness_panel` dynamic view wiring that renders disabled risky capability flags, blocked confirmation gates, admin override requirements, review gate IDs, runtime-control posture, and hard-disabled export/circulation/memory-write/source-write/source-promotion/external-ingest/continuous-voice/runtime-bypass paths inside Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage while disabled capabilities remain blocked
- session-level `agent-session-voice-runtime-v1` summaries that persist governed voice-runtime usage across turns, including runtime event sources, default/enabled/disabled modes, consent boundaries, stream event types, compatible views, push-to-talk and typed-fallback readiness, governed-runtime/evidence-gate parity, and disabled continuous voice / Realtime / TTS / autonomous speaking / background listening / provider-bypass flags
- per-turn `voiceOrchestrationReadinessManifest` records backed by `src/data/config/voice-orchestration-readiness-requirements.json`, exposing the promotion gates for wake/listen, continuous voice, Realtime voice, TTS, runtime parity, interruption/cancellation, consent/privacy, and enterprise voice memory/transcript storage
- review-only `agent-session-voice-readiness-v1` activation protocol steps that separate governed push-to-talk runtime, browser STT prototype input, Realtime runtime unification, interruption/privacy, TTS speaking policy, and enterprise voice storage before any full-voice activation can be considered
- session-level `agent-session-voice-readiness-v1` summaries that persist voice orchestration readiness across turns, including ready/prototype/blocked requirement counts, latest requirement blockers, next promotion step, and disabled full voice / wake-listen / continuous / Realtime / TTS flags
- session-level `agent-session-voice-contract-v1` summaries that persist voice skill/view contract compatibility across turns, including used skills, compatible/incompatible views, ready/gated/blocked mode posture, visible state phases, blocked readiness IDs, and disabled continuous voice / Realtime / TTS / arbitrary-routing flags
- per-turn `workingContextManifest` records that expose loaded context layers, accepted reviewed memory, suggested-memory count, source candidate IDs, review gate IDs, and disabled auto-accept/source-consumption/canonical-write flags
- per-turn `persistenceReadinessManifest` records backed by `src/data/config/persistence-readiness-requirements.json`, exposing prototype browser/local JSON persistence, review workflow readiness, accepted-memory context readiness, non-canonical source candidate handling, and blocked enterprise database/access/retention/backup/source-promotion requirements
- per-turn `reviewIdentityManifest` records backed by `src/data/config/agent-review-identity-policy.json`, exposing prototype reviewer-label-only workflow, disabled enterprise identity, disabled role/brand access controls, blocked official approvals, required enterprise identity/access steps, and `review-identity-prototype-only` runtime quality coverage
- session-level `agent-session-persistence-governance-v1` summaries that persist working context, persistence readiness, and review identity across turns, including loaded context layers, accepted-memory IDs, source candidate IDs, review gate IDs, ready/prototype/blocked persistence requirements, persisted record types, latest promotion step, reviewable item types, prototype decisions, blocked enterprise approval types, a review-only enterprise persistence promotion protocol, and disabled enterprise persistence / identity / official approval / role access / brand access / memory auto-accept / canonical writes / source auto-consumption flags
- `agent-session-review-workflow-v1` summaries computed from the local session ledger, exposing pending/reviewed/blocked memory, artifacts, and gates while official approval, enterprise identity, artifact export, canonical writes, memory auto-accept, and runtime source auto-consumption remain disabled
- per-turn `proactivityManifest` records that expose quiet follow-up suggestions, held notices, review-required next steps, and disabled flags for autonomous actions, reminders, external sends, scheduled notifications, and overlapping runs
- session-level `agent-session-proactivity-v1` summaries that persist quiet follow-up continuity across turns, including suggestion priority/type/timing counts, human-review-required counts, held notices, related evidence/gap/gate/artifact IDs, allowed next skills, a review-only autonomous proactivity promotion protocol, and disabled reminder / notification / external-send / background-run / source-promotion / autonomous-action flags
- per-turn `pilotLearningManifest` records that expose review-required learning signals, blocked learning paths, and next proof needs while autonomous learning, outcome learning, treatment outcome claims, canonical memory writes, and canonical source writes remain disabled
- `agent-session-pilot-learning-v1` summaries computed from persisted local ledger pilot-learning manifests, exposing session-level signal counts, latest signals, blocked learning paths, next proof needs, and a review-only learning promotion protocol while keeping autonomous learning, outcome learning, treatment outcome claims, canonical memory writes, and canonical source writes disabled
- per-turn `treatmentOutcomeReadinessManifest` records backed by `src/data/config/treatment-outcome-readiness-requirements.json`, exposing blocked outcome-record schema, follow-up linkage, review identity, efficacy-rule, portfolio-store, and canonical-learning requirements while outcome learning, treatment outcome claims, accepted outcome-record storage, and canonical learning stores remain disabled
- session-level `agent-session-treatment-outcome-readiness-v1` summaries that persist outcome-learning promotion readiness across turns, including ready/prototype/blocked requirement posture, related treatment paths, follow-up signals, learning signal IDs, next promotion step, and disabled outcome learning / efficacy summary / accepted outcome-record / canonical-learning flags
- draft treatment outcome record template coverage through `/templates/treatment-outcome-record-template.json`, validation, eval checks, and Treatment Outcome Readiness Panel download affordance while the schema remains draft-only and outcome learning, efficacy claims, accepted outcome-record storage, portfolio learning, and canonical learning stay disabled
- deterministic first-turn memory suggestions, audit records, and confirmation gates in `runAgentTurn()`
- session-level `agent-session-audit-summary-v1` summaries that persist audit continuity across turns, including action counts, confirmation-required records, skill/view/artifact/evidence coverage, latest records, lifecycle/evidence/view/artifact/memory/source/runtime-quality audit posture, a review-only audit governance protocol, and disabled audit export / canonical-write / enterprise-audit-store flags
- Agent Lab proof rail summaries for memory suggestions and confirmation gates
- local-first Agent Lab session ledger persisted through browser `localStorage`
- durable reviewed-local source promotion records for accepted Brand Strategic Context and Momentum source candidates, stored under ignored `.runtime/`, exposed through `/api/source-packets`, and explicitly not canonical source-data writes
- packet-level Brand Strategic Context handoff/readiness requirements for source-owner approval, brand foundations/DNA, positioning/objectives/priorities, creative platform/claims, and executive-use blocker state, with prototype/browser-local context kept non-canonical
- Source Readiness Panel and source-readiness answer coverage for Brand Strategic Context readiness alongside Momentum readiness
- disabled Brand Strategic Context source-owner runtime file-drop readiness lane with approved-file bundle template, read-only server audit, packet/Brand Data/Source Readiness Panel surfacing, validation, and eval coverage while runtime consumption and canonical use remain off
- Brand Strategic Context runtime file-drop adversarial eval coverage for approved-looking, invalid/draft-empty, and malformed source-owner bundles across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving strategy source files stay review-only, non-canonical, non-evidence, and cannot replace active Strategic Context or enable runtime/canonical strategy
- Brand Data view inspection of durable reviewed-local source promotion records beside browser-local promoted source versions
- governed agent-turn source promotion context that surfaces active-brand reviewed-local candidates in Agent Lab without adding them to packet facts, answer evidence, or runtime auto-consumption
- local-first source-claim extraction/review workflow for unstructured notes, decks, transcripts, and research summaries through `/api/source-claims` and the Brand Data Source Claims tab, with active-brand `sourceClaimContext` visible in Agent Lab but never auto-consumed as evidence
- source-claim runtime audit and confirmation rails: active-brand claims create `source_claim_context_loaded` audit records plus claim-specific source-promotion review gates, while disabled promotion capability gates keep canonical/runtime promotion blocked
- hostile outside-content detection in source-claim extraction: pasted source text with override, canonical-truth, runtime auto-consumption, export, or bypass language is stamped with an untrusted-source warning and remains review-only, non-canonical, and non-evidence across JSON, stream, chat, and governed Live Consult fallback
- config-backed agent capability flags with disabled-by-default gates for exports, artifact circulation, memory writes, source writes, source-claim promotion, external research ingest, and continuous voice
- session-level `agent-session-capability-readiness-v1` summaries that persist emitted capability state and runtime control posture across turns, including disabled high/medium-risk capabilities, blocked capability gates, required/reviewed gate IDs, admin override requirements, kill-switch history, next promotion requirements, and hard-disabled export / circulation / memory-write / source-promotion / source-write / external-ingest / continuous-voice flags
- review-only risky capability promotion protocol steps inside `agent-session-capability-readiness-v1`, separating capability request capture, human review gates, policy/config changes, runtime-control validation, surface integration evidence, and production rollout governance while every risky capability remains disabled
- config-backed runtime control / kill-switch policy with per-turn manifest, fail-closed fallback, emergency stop scope, admin override requirements, and proof-rail/eval coverage
- session-level `agent-session-memory-audit-v1` summaries that consolidate memory records, accepted-memory working context, memory review gates, review decisions, and memory audit coverage while keeping auto-accept, reviewed-memory writes, canonical memory writes, and enterprise memory storage disabled
- approved `memory_audit_panel` dynamic view wiring that renders accepted working context, memory review gates, review decisions, audit coverage, and disabled memory-write/enterprise-store paths inside Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage
- session-level `agent-session-runtime-control-v1` summaries that persist runtime policy posture across governed turns, including runtime policy IDs, runtime modes, runtime-enabled consistency, kill-switch history, degraded fallback, emergency stop scope, risky disabled capabilities, admin override requirements, fail-closed consistency, evidence/review bypass prevention, latest runtime control state, and disabled export / source-write / external-ingest / continuous-voice / runtime-bypass / admin-bypass flags
- session-level `agent-session-foundation-readiness-v1` summaries that consolidate approved experience architecture, evidence grounding, reviewed memory, source governance, audit/quality, runtime control, runtime surfaces, provider adapters, voice readiness, persistence governance, artifact readiness, and outcome-learning readiness into one inspectable foundation control-plane while enterprise persistence, official approvals, canonical source writes, runtime source auto-consumption, artifact export/copy/circulation, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation remain disabled or gated
- governed Foundation Readiness Cockpit using `inspect_foundation_readiness`, `foundation_readiness_panel`, the `foundation-readiness-cockpit` ExperiencePlan template, voice skill/view compatibility, Agent Lab rendering, and eval coverage so executives and platform sponsors can inspect the foundation control plane without enabling gated capabilities
- governed Executive Pilot Runbook using `plan_executive_pilot`, `executive_pilot_runbook_panel`, the `executive-pilot-runbook` ExperiencePlan template, voice skill/view compatibility, Agent Lab rendering, API sanity, and eval coverage so CMO pilot / funding demo prompts assemble a sponsor-ready read-only sequence from the active brand read, approved workspace foundation, review rails, runtime controls, and gating roadmap without enabling export, official approvals, canonical writes, full voice, autonomous learning, or arbitrary UI generation
- CMO proof stack and funding-ask matrix inside `agent-session-executive-pilot-v1`, rendered in Agent Lab and the Executive Pilot Runbook panel, tying brand read, ExperiencePlan composition, proof/audit rails, runtime parity, source governance, voice path, source-owner handoff, enterprise persistence/identity, artifact export policy, voice runtime policy, and outcome-learning design to explicit gated asks instead of implying production readiness
- session-level `agent-session-promotion-gate-v1` summaries that roll foundation readiness, guided Executive Pilot coverage, source-ingestion posture, runtime-surface guardrails, and runtime quality into an explicit CMO-demo / pilot-review / production-blocked verdict while keeping enterprise persistence, official approvals, canonical writes, artifact export, full voice, autonomous learning, and arbitrary UI generation blocked
- approved `promotion_gate_panel` dynamic view wiring that renders the CMO-demo / pilot-review / production-blocked verdict inside the Foundation Readiness Cockpit and Executive Pilot Runbook, with voice-canvas compatibility, skill-router requests, Agent Lab rendering, durable sequence expectations, validation, and eval coverage
- Agent Lab guided Executive Pilot sequence with six manual sponsor-demo steps, active skill/template highlighting, load/run prompt controls, browser verification, and quota-safe browser-local ledger compaction so heavy local history does not block rendering while durable local JSON session state remains the prototype persistence path
- durable `agent-session-executive-pilot-v1` summaries computed from persisted ExperiencePlan architecture manifests, tracking six-step sponsor-demo completion, expected skills/templates/views, latest turn/brand, observed required views, next runbook step, Agent Lab progress state, and disabled export/autonomous sequence/full voice/arbitrary UI flags
- governed voice policy with push-to-talk default, wake/listen allowed, continuous disabled, consent required, and `/api/agent/stream` as the runtime source
- governed voice orchestration readiness registry with stream/audit events, Agent Lab proof-rail rendering, validation, and eval coverage while keeping full voice disabled
- governed Momentum Intelligence source packets for Lay's and Siete with market context, peer-set metadata, room-to-grow inputs, SMD contribution weights, source caveats, validation, eval coverage, and Intelligence Packet surfacing
- Momentum Intelligence validate -> preview -> promote importer UI with browser-local promoted versions, impact preview, downloadable JSON template, and active packet injection into the Brand Intelligence Packet
- measured Growth Navigator adapter that creates Momentum Intelligence source packets for brands with measured full/partial GN context, without inferring SMD contribution weights
- multi-quarter Momentum Intelligence trend context and output-quality checks for source-period caveats, significance overclaim prevention, red momentum visibility, Ahead/Behind misuse, and SMD source gaps
- optional source-provided Momentum trend evidence contract, importer normalization, downloadable template sample, kernel consumption, and data validation for significance-tested metric movement when approved extracts are supplied
- first governed Momentum source-extract adapter lane with a reviewed-for-prototype Doritos fixture, downloadable source-extract template, source-extract validation, packet-builder priority order, and eval coverage through `/api/agent`
- Momentum Source import workflow that accepts either normalized Momentum source packets or source-extract shaped JSON, maps source extracts through the governed adapter, previews impact, and promotes the converted packet as a browser-local version
- packet-level Momentum source readiness gates for source-owner extract approval, market/share/penetration inputs, BBE contribution weights, movement/significance evidence, executive-use blockers, Brand Data and Agent Lab rendering, and eval coverage
- `src/data/config/momentum-source-handoff-requirements.json` with source-owner handoff requirements mapped to every Momentum readiness check, including accepted extract shape, required fields, validation rules, promotion gates, canonical-use conditions, and next actions rendered in Brand Data, Agent Lab, and the Source Readiness dynamic view
- `scripts/eval-agent.mjs` and `pnpm eval:agent`
- status/backlog updates

The current report remains stable and the default scoped chat path is preserved. The new kernel is now inspectable and callable through the Agent Lab vertical slice, the explicit skill-routed `/api/chat` path, opt-in governed controls in the report Dialog With Data sidecar plus standalone brand conversation page, and a default-off governed Live Consult browser/demo fallback. It is not yet the unified default runtime for all chat, voice, report, learning, and Live Consult surfaces.

## Next Best Work Sequence

### Phase 1: Inspectable Intelligence Packet

Goal: make the future brain visible without changing the main report.

Status: implemented. `/brand/[brandId]/data` includes an Intelligence Packet tab with packet summary, data coverage, Brand Strategic Context status, evidence gaps, starter provocations, recommended views, guardrails, and raw JSON.

Tasks:

- Add a read-only Brand Intelligence Packet tab to `/brand/[brandId]/data`.
- Show packet summary, data coverage, strategic context status, evidence gaps, recommended views, starter provocations, and guardrails.
- Keep raw JSON behind an expandable panel.
- Do not change the current report flow.

Acceptance:

- User can inspect the active packet for any brand.
- Missing Brand Strategic Context, room-to-grow inputs, and SMD weights are visible.
- `pnpm validate:data`, `pnpm typecheck`, and `pnpm build` pass.

### Phase 2: Feature-Flagged Skill Router

Goal: let chat route through a governed skill layer while preserving current chat fallback.

Status: first vertical slice implemented. `src/lib/intelligence/skill-router.ts` routes deterministic intents to known registry skills, `/api/agent` exposes the router for the dynamic lab, and `/api/chat` can opt into the router with `AGENT_SKILL_ROUTER=enabled` or `useSkillRouter: true` while preserving the existing scoped chat path by default. The optional skill-routed `/api/chat` response now returns the full governed `runAgentTurn()` payload, including audit, memory, gates, manifests, runtime quality checks, capabilities, voice/runtime policies, and durable local session persistence when `sessionId` is supplied. The visible report chat, standalone brand conversation, and Live Consult browser/demo fallback surfaces now expose default-off governed switches backed by stable brand-specific session IDs and compact proof strips under governed answers. Proof-summary parsing lives in `src/lib/intelligence/governed-proof.ts`; `src/components/intelligence/GovernedProofStrip.tsx` is the shared renderer. Product-facing Assistant Realtime is handled through `/api/assistant`; Live Consult production Realtime/TTS runtime unification remains gated.

Tasks:

- Define output schemas for `GroundedAgentAnswer`, `BbeMomentumIntelligenceRead`, `GrowthProvocationSet`, `DynamicViewRequest`, and `DecisionPackageDraft`.
- Add a simple intent-to-skill router behind a feature flag.
- Start with `answer_brand_question`, `explain_diagnosis_evidence`, and `bbe_momentum_intelligence_read`.
- Keep existing scoped chat as fallback.
- [x] Return the full governed runtime payload from the optional skill-routed `/api/chat` path while keeping default scoped chat unchanged.
- [x] Persist explicit skill-routed `/api/chat` turns to the durable local session ledger when `sessionId` is supplied.
- [x] Add default-off governed-runtime controls to the report Dialog With Data sidecar and standalone brand conversation page.
- [x] Add compact governed proof strips to opted-in report and standalone brand conversation answers.
- [x] Extract proof-strip parsing/rendering into a shared component.
- [x] Move proof-summary parsing into a non-React runtime utility and eval the API fields it depends on.
- [x] Add default-off governed fallback to Live Consult browser/demo prompts while keeping Realtime voice and TTS gated.

Acceptance:

- Router chooses known skill IDs only.
- Unknown intents fall back safely.
- Every answer includes evidence or missing-data caveat.

### Phase 3: First Dynamic Canvas Slice

Goal: prove the Jarvis-style concept with one real, evidence-bound flow.

Status: first slice implemented at `/agent-lab`. The route defaults to the Lay's QBR prompt, renders a transcript / dynamic canvas / proof rail / artifact bar layout, and uses `DynamicViewRenderer` to render approved registry views from structured skill output.

Add-on status: explicit drafting prompts now route to `draft_meeting_story`, and `/agent-lab` renders a governed `qbr_story_draft` view with executive narrative, slide outline, evidence/gap context, and human-review language. The lab has also been refined into a Jarvis-style Brand Growth Command Center with governed push-to-talk, animated intelligence core, orchestration bus, approved module queue, and active-read stats.

Target prompt:

```text
Why is Lay's slipping if it is still strong?
```

Tasks:

- Create a separate route such as `/agent-lab` or `/consult`.
- Layout:
  - left: voice/chat transcript
  - center: dynamic canvas
  - right: evidence / assumptions / source rail
  - bottom: session memory / artifacts
- Implement `DynamicViewRenderer`.
- Render approved views from view requests.
- Start with `momentum_ladder`, `smd_driver_map`, `evidence_ledger`, `growth_provocation_list`, and `data_gap_panel`.

Acceptance:

- Agent response can sequence multiple views.
- View IDs must come from the registry.
- Evidence is visible for claims.
- UI feels premium but not decorative for its own sake.

### Phase 3.5: Experience Plan Foundation

Goal: make dynamic UI composable enough to serve executives, marketers, insights leads, learning, agency brief, and future specialist use cases from the same governed brain.

Status: implemented and expanding. `ExperiencePlan` schemas, twenty-one pilot templates, `experience-planner`, `/api/agent` plan output, `/agent-lab` plan-zone rendering, inspectable plan JSON, template validation, and expanded agent evals are in place. The newest templates are governed competitive comparison, source readiness, source-owner intake, source promotion readiness, live meeting capture, review operations, pilot learning, quiet proactivity, voice readiness, persistence readiness, treatment outcome readiness, runtime governance, artifact readiness, experience architecture, foundation readiness, and executive pilot workspaces that separate approved peer/source context, source-owner handoff state, reviewed-local source candidates, extracted source claims, review-required meeting notes, prototype-local review state, reviewed learning signals, review-required follow-up suggestions, voice-provider promotion gates, durable memory/audit promotion blockers, outcome-learning promotion blockers, runtime-surface promotion blockers, runtime-quality watch/blocked checks, artifact export/circulation blockers, canonical source blockers, runtime source-consumption blockers, dynamic-workspace composition blockers, foundation promotion gates, and sponsor-demo sequencing from associative, prototype, reviewed-local, outcome, automation, full-voice, enterprise-persistence, canonical-source, efficacy-claim, canonical-learning, default-runtime, export-ready, arbitrary-UI, official-funding, or final decision evidence.

Tasks:

- Define `ExperiencePlan`, `ExperienceZone`, `ExperienceAudience`, `ExperienceObjective`, and `ExperienceArtifact` schemas.
- Add an `experience-architect` service that maps user intent, audience, brand scope, and evidence needs to approved skills/views/layouts.
- Add a small experience-template registry for:
  - executive QBR decision read
  - insights evidence lab
  - marketer treatment planning
  - learning coach
  - agency brief builder
  - competitive comparison lab
  - source readiness lab
  - source owner intake workbench
  - live meeting capture
- Render `/agent-lab` from an `ExperiencePlan` instead of hard-coded layout assumptions.
- Add evals that reject unknown views, unsupported metrics, and missing human-review gates.

Acceptance:

- A prompt can request an audience-specific workspace and receive a structured plan.
- Every plan is inspectable as JSON.
- Every rendered zone uses approved view IDs.
- Unsupported requested experiences fail closed into a data-gap / human-review response.

### Phase 4: BBE Momentum Intelligence Skill

Goal: absorb the v8 requirements as a first-class skill.

Status: in progress with the first source-fed intelligence slice implemented. `src/data/demo/momentum-intelligence-source-packets.json` now provides prototype-reviewed market context, peer-set metadata, room-to-grow inputs, and SMD contribution weights for Lay's and Siete. `buildBrandIntelligencePacket()` loads those packets, closes the room-to-grow/SMD gaps for those brands, recommends the Momentum x Room To Grow Grid when supported, and exposes source/caveat context in `/brand/[brandId]/data` and `/agent-lab`. The brand data view also has a Momentum Source validate -> preview -> promote importer with browser-local promoted versions and downloadable templates. A measured Growth Navigator fallback adapter now creates Momentum Intelligence source packets for brands with measured full/partial GN context while leaving unsupported room-to-grow/SMD fields as gaps. Multi-quarter trend context and output-quality checks now expose directional deltas, source-period compatibility, significance caveats, red momentum visibility, Ahead/Behind misuse checks, and SMD source gaps. Optional source-provided trend evidence fields now let approved/promoted packets supply significance-tested metric movement and source-period compatibility. A first source-extract adapter lane now maps reviewed/approved extract-shaped data into the same packet contract, is verified with a clearly caveated Doritos prototype fixture, and is accepted by the Momentum Source import workflow. Packet-level `momentumSourceReadiness` gates now make executive-use readiness explicit across source-owner approval, market/share/penetration, contribution weights, and movement/significance, and the Source Readiness Lab turns those checks into a governed workspace for source-owner handoff. The importer now also accepts a source-owner file bundle shape with separate market/share/penetration, BBE contribution-weight, and movement/significance files, mapping rows into the same governed extract blocks before validation and local promotion. A runtime file-drop readiness policy now defines the future approved source-owner landing zone and exposes blocked runtime/canonical-use state in the packet, Brand Data, Agent Lab, and Source Readiness dynamic view. Governed server turns attach a read-only file-drop audit that scans the expected landing zone for candidate JSON files and per-file-kind presence without enabling runtime consumption. Local sessions now persist that posture into `agent-session-source-runtime-ingestion-v1`, making required/loaded/missing file kinds, governance blockers, and the disabled default runtime source-wiring gate visible across session APIs and Agent Lab. The eval suite now simulates both an approved-looking file bundle that can move the gate to `ready_for_governance_review` and an invalid/non-approved empty file bundle that keeps the gate blocked, missing, non-canonical, and non-evidence across JSON, stream, chat, and governed Live Consult fallback. Remaining Phase 4 work is to replace fixtures with approved source-owner extracts and wire approved file drops into the default runtime source path after source-owner governance is clear and the ingestion gate is satisfied.

Tasks:

- [x] Add real Perceived Value display handling.
- [x] Add market/category context model.
- [x] Add peer-set metadata.
- [x] Add first multi-quarter momentum model with directional trend reads and source-period caveats.
- [x] Add SMD contribution-weight field and missing-state behavior.
- [x] Add room-to-grow source-packet model and source-fed Momentum x Room To Grow Grid availability.
- [x] Add Momentum Intelligence source importer with validate -> preview -> promote/version behavior.
- [x] Add measured-source adapter for approved measured full/partial Growth Navigator extracts.
- [x] Add optional source-backed significance-tested movement fields to the Momentum source-packet contract, importer, template, kernel, and validation.
- [x] Add first reviewed/approved source-extract adapter lane with prototype fixture, template, validation, and eval coverage.
- [x] Add split source-owner extract bundle support so market/share/penetration, BBE contribution-weight, and movement/significance blocks can merge into one governed Momentum packet without becoming canonical unless all required approvals are present.
- [x] Add downloadable source-owner extract bundle template and validation/eval coverage for the required market/share/penetration, BBE contribution-weight, and movement/significance blocks.
- [x] Let the Momentum Source import workflow ingest source-extract JSON and promote the converted Momentum packet.
- [x] Add source-owner file-bundle import support for separate market/share/penetration, contribution-weight, and movement/significance files, with downloadable template, validation, and eval coverage.
- [x] Add runtime file-drop readiness policy and packet manifest for approved source-owner files, with runtime consumption and canonical use disabled by default.
- [x] Add read-only server audit of the runtime source-owner file-drop landing zone, with per-file-kind audit records and no runtime consumption.
- [x] Add approved-looking and invalid/non-approved runtime source-owner file-drop eval coverage, proving clean files are review-ready only and unclean files stay blocked/non-evidence.
- [x] Add durable `agent-session-source-runtime-ingestion-v1` summaries for the runtime source-ingestion gate, with required/loaded/missing file kinds, blockers, Agent Lab rendering, API persistence, and eval coverage while runtime source wiring remains disabled.
- [x] Add review-only default runtime source promotion protocol steps to `agent-session-source-runtime-ingestion-v1` and `source_runtime_ingestion_panel`, with eval coverage proving all six promotion steps keep runtime consumption disabled.
- [x] Add adversarial fail-closed evals across `/api/agent`, `/api/agent/stream`, explicit skill-routed `/api/chat`, and governed Live Consult fallback for arbitrary UI / unsupported metrics, artifact review-export bypass, canonical source/runtime consumption, and continuous voice/TTS/autonomous speaking requests.
- [x] Add packet-level Momentum source readiness gates and inspection surfaces for source-owner extract handoff.
- [x] Add Source Readiness Lab workspace and `source_readiness_panel` dynamic view for executive-use blockers and required source-owner extracts.
- [ ] Wire approved source-owner file drops into the default runtime source path once source owners provide files and governance approves canonical use.
- [ ] Replace prototype source-extract fixture with approved source-owner extract files.
- [x] Add growth provocations with what / so what / now what / evidence / urgency.
- [x] Add first output-quality self-check.
- [ ] Load official source-period movement once approved extracts expose those fields.

Acceptance:

- Momentum is the headline verdict.
- Red momentum is never hidden.
- Ahead/Behind is not used as opportunity.
- Missing room-to-grow data is named.
- Loaded room-to-grow and SMD inputs close the corresponding gaps without becoming unsupported official claims.
- Every provocation has evidence or data-gap note.

### Phase 5: Voice-First Consult Canvas

Goal: evolve Live Consult into the premium dynamic workspace.

Tasks:

- Create a unified `runAgentTurn()` runtime that text, voice, Agent Lab, and future Live Consult all call.
- Align voice actions to skill registry.
- Connect `/agent-lab` to real streaming response state instead of request/response-only turns.
- [x] Add claim-level evidence spotlight records for answers, facts, caveats, and dynamic-view requests.
- [x] Add governed provider adapter readiness map for text, SSE streaming, browser STT, Realtime voice candidate, and TTS through `providerAdapterManifest`, `provider_adapters_ready`, `provider_adapters_built`, Agent Lab proof-rail rendering, and eval coverage.
- [x] Add durable session provider-adapter summaries through `agent-session-provider-adapter-v1`, local session ledger persistence, API persistence metadata, Agent Lab rendering, and eval coverage while keeping provider bypass, Realtime runtime connection, TTS, and continuous voice disabled.
- [x] Add governed voice orchestration readiness gates for runtime parity, streaming/canvas parity, consent/privacy, Realtime unification, server-side cancellation, TTS policy, and enterprise transcript/memory storage through `voiceOrchestrationReadinessManifest`, stream/audit events, Agent Lab proof-rail rendering, and eval coverage while keeping full voice disabled.
- [x] Add governed Voice Readiness Cockpit with `inspect_voice_readiness`, `voice_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping Realtime voice, continuous listening, wake-word capture, TTS, autonomous speaking, and server-side provider cancellation gated/disabled.
- [x] Add governed Persistence Readiness Cockpit with `inspect_persistence_readiness`, `persistence_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption disabled.
- [x] Add governed Treatment Outcome Readiness Cockpit with `inspect_treatment_outcome_readiness`, `treatment_outcome_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores disabled.
- [x] Persist `treatmentOutcomeReadinessManifest` records into the session ledger and expose `agent-session-treatment-outcome-readiness-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping outcome learning, treatment efficacy claims, accepted outcome-record storage, efficacy summaries, portfolio learning, and canonical learning stores disabled.
- [x] Add review-only outcome proof protocol steps to `agent-session-treatment-outcome-readiness-v1` and `treatment_outcome_readiness_panel`, covering baseline capture, follow-up linkage, matched evidence, human review, efficacy rules, and portfolio/canonical learning governance without enabling treatment outcome records, efficacy summaries, portfolio learning, or canonical learning.
- [x] Add draft treatment outcome record template and validation/eval coverage while keeping the template a governance-review handoff only, not an accepted outcome-record store or efficacy claim path.
- [x] Add governed Runtime Governance Cockpit with `inspect_runtime_governance`, `runtime_governance_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping default scoped chat stable and Realtime voice, full voice, TTS, exports, source writes, and canonical promotion gated/disabled.
- [x] Add approved `runtime_quality_panel` dynamic view integration for `agent-session-runtime-quality-v1` across Runtime Governance, Experience Architecture, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping runtime/provider bypass, exports, canonical writes, full voice, autonomous learning, and arbitrary UI disabled.
- [x] Add approved `evidence_spotlight_panel` dynamic view integration for `agent-session-evidence-spotlight-v1` across Executive QBR Decision Read, Insights Evidence Lab, Review Operations, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping canonical claim promotion and unsupported claim generation disabled.
- [x] Add approved `canvas_continuity_panel` dynamic view integration for `agent-session-canvas-continuity-v1` across Experience Architecture, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping arbitrary UI, arbitrary view IDs, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, and continuous voice barge-in disabled.
- [x] Add approved `audit_trail_panel` dynamic view integration for `agent-session-audit-summary-v1` across Review Operations, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping audit export, canonical audit writes, official approval, and enterprise audit storage disabled.
- [x] Add review-only artifact circulation protocol steps to `agent-session-artifact-readiness-v1` and `artifact_readiness_panel`, with eval coverage proving prototype review cannot enable export, copy, circulation, official approval, or enterprise publishing.
- [x] Add review-only source-claim promotion protocol steps to `agent-session-source-governance-v1` and `source_promotion_readiness_panel`, with eval coverage proving extracted/reviewed claims cannot bypass source-owner verification, packet evidence mapping, canonical fact governance, or runtime auto-consumption gates.
- [x] Add adversarial official-approval identity and audit-export overreach eval coverage across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving Review Operations fails closed when asked to treat a user as an official enterprise approver, export audit logs, or write canonical approval records.
- [x] Add adversarial agency-brief copy/export/package/external-circulation overreach eval coverage across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving Artifact Readiness fails closed when asked to copy, export, package, or externally send agency briefs with stakeholder-approved language.
- [x] Add adversarial memory auto-accept and enterprise-persistence overreach eval coverage across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving Persistence Readiness fails closed when asked to auto-accept suggested memory, enable reviewed-memory writes, store memory in enterprise persistence, or treat memory as canonical brand truth.
- [x] Add adversarial reminder scheduling and autonomous proactivity overreach eval coverage across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving Quiet Proactivity fails closed when asked to create reminders, schedule notifications, send external follow-ups, run background checks, or take autonomous action.
- [x] Add adversarial treatment efficacy and canonical outcome-learning overreach eval coverage across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving Treatment Outcome Readiness fails closed when asked to record treatments as effective, store accepted outcome records, summarize efficacy, write portfolio learning, or make treatment paths canonical truth.
- [x] Add approved `review_identity_panel` dynamic view integration for `agent-review-identity-manifest-v1` across Review Operations, Persistence Readiness, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping enterprise identity, role access, brand access, official approval, accountable reviewer claims, and canonical approval writes disabled.
- [x] Add approved `provider_adapter_panel` dynamic view integration for `agent-session-provider-adapter-v1` across Voice Readiness, Runtime Governance, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping Realtime voice, TTS, continuous voice, autonomous speaking, and provider bypass disabled or gated.
- [x] Add approved `capability_readiness_panel` dynamic view integration for `agent-session-capability-readiness-v1` across Runtime Governance, Foundation Readiness, Executive Pilot, voice-canvas compatibility, Agent Lab rendering, skill-router requests, durable Executive Pilot expectations, validation, and eval coverage while keeping disabled risky capabilities and blocked gates unpromoted.
- [x] Add review-only risky capability promotion protocol steps to `agent-session-capability-readiness-v1` and `capability_readiness_panel`, with eval coverage proving capability requests, human review, policy/config changes, runtime-control validation, integration evidence, and production rollout governance do not enable export, circulation, memory writes, source writes, external ingest, continuous voice, or runtime bypass.
- Route voice through the existing server-side Realtime session pattern or an equivalent provider adapter with API keys kept server-side after runtime parity and policy gates are approved.
- [x] Add governed canvas state model with `canvasStateManifest`, `canvas_state_ready` stream event, `canvas_state_built` audit record, proof-rail rendering, and eval coverage.
- [x] Add governed pulsing voice/conversation presence through `conversationPresenceManifest`, `conversation_presence_ready`, `conversation_presence_built`, Agent Lab command-core/proof-rail rendering, and eval coverage while keeping continuous listening, wake word, and autonomous speaking disabled.
- [x] Add streamed public reasoning/status steps through `reasoningStatusManifest`, `reasoning_status_ready`, `reasoning_status_built`, Agent Lab proof-rail rendering, and eval coverage that keeps hidden reasoning unexposed.
- [x] Add evidence spotlight for each claim.
- [x] Add first governed interrupt/recovery behavior through `interruptionRecoveryManifest`, `interruption_recovery_ready`, Agent Lab Stop control, preserve-last-canvas behavior, and eval coverage.
- [x] Add governed meeting takeaway capture through `live-meeting-capture`, `meeting_takeaway_panel`, and review-required `decision_note` artifacts.
- Add reviewed meeting takeaway export only after artifact circulation/export governance is approved.

Acceptance:

- Voice is the premium path.
- Chat is the reliable fallback.
- User can interrupt, challenge, ask for proof, go deeper, or package output.

### Phase 6: Learning And Research Skills

Goal: make teaching, testing, and research natural extensions of the same system.

Tasks:

- Teach concept skill.
- Test understanding skill.
- Scenario practice skill.
- Competitor/category research packet.
- Source-claim extraction and review queue.
- Clear separation of reviewed claims, canonical facts, and unreviewed research.

Acceptance:

- User can say “teach me this,” “test me,” or “research competitors.”
- Learning can render explainers, quizzes, visuals, and brand examples.
- Research claims are not promoted to facts without review.

### Phase 7: Outcome Learning

Goal: move from options-to-consider toward evidence-informed prescriptions.

Tasks:

- Treatment outcome records.
- Follow-up signal history.
- Decision records.
- Pattern memory across brands, categories, and time.
- Treatment efficacy summaries with confidence caveats.
- Current foundation slice: per-turn `pilotLearningManifest`, session-level `agent-session-pilot-learning-v1` summaries, per-turn `treatmentOutcomeReadinessManifest` records, and the session-level outcome proof protocol capture reviewed learning signals plus the blocked promotion checklist for outcome learning, but they do not create treatment outcome records, canonical memory, source truth, accepted pattern memory, portfolio learning, or efficacy claims.

Acceptance:

- System can say what was tested, where, what moved, and how confident we are.
- Prescriptions remain caveated when outcome evidence is thin.

### Phase 8: Memory, Proactivity, And Rails

Goal: become a durable operating layer rather than a one-session demo.

Tasks:

- Add session memory for accepted assumptions, decisions, open questions, and generated artifacts.
- Add durable memory records for user/team preferences and reviewed brand facts.
- Add audit logs for agent turns, tool calls, evidence used, and generated artifacts.
- Add confirmation gates for export, external research promotion, source updates, and any future write action.
- Add quiet proactivity for scheduled checks, held notices, and follow-up reminders. Suggestions-only manifests, held notices, governed Quiet Proactivity Cockpit, and session-level quiet-proactivity summaries are implemented; real scheduling/reminders remain disabled.
- Add governed pilot-learning rails for reviewed turn/session signals before outcome learning. First per-turn `pilotLearningManifest` and session-level `agent-session-pilot-learning-v1` summary are implemented; autonomous learning, outcome learning, treatment outcome claims, and canonical writes remain disabled.
- Add admin kill switch and config-driven capability flags. First config-backed runtime control policy and manifest are implemented; enterprise operations controls remain future work.

Acceptance:

- A user can resume a brand-growth workstream and see prior decisions and unresolved gaps.
- The system can suggest follow-ups without acting autonomously on sensitive changes.
- Risky actions require explicit confirmation.
- Outside content is treated as data to review, not instructions to obey.

## Required Evals

Before pilot-wide use, add evals for:

- no invented diagnoses
- no invented treatments
- no unsupported source facts
- no causality overclaim
- no SKU pricing guidance from Perceived Value
- current adversarial coverage proves SKU price increases, promo-depth recommendations, causal demand-lift claims, cannibalization proof, portfolio migration proof, and occasion-substitution proof fail closed across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback
- current adversarial coverage proves hostile pasted source instructions cannot override runtime policy, promote canonical facts, enable runtime source consumption, export artifacts, or become answer evidence across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback
- red momentum visibility
- correct Ahead/Behind use
- missing-data behavior
- evidence citation for provocations
- separation of fact, interpretation, and caveat
- Brand Strategic Context missing-state behavior
- dynamic view IDs constrained to registry
- experience plans constrained to approved templates/views
- human-review gates on decision packages and exports
- memory writes auditable and user-visible

## Current Active Checklist

- [x] Review v8 requirements against current prototype.
- [x] Decide that v8 should sharpen kernel capabilities, not become the product boundary.
- [x] Define chat/voice-first composable architecture.
- [x] Document composable agentic foundation.
- [x] Document phased dynamic-agent implementation plan.
- [x] Add initial skill registry.
- [x] Add initial dynamic view registry.
- [x] Add typed intelligence packet scaffolding.
- [x] Add Brand Strategic Context placeholder and evidence gap.
- [x] Extend data validation for registries.
- [x] Update `STATUS.md` and `BACKLOG.md`.
- [x] Refresh `PLANS.md` for long-running / fresh-session continuation.
- [x] Add packet inspection UI.
- [x] Add feature-flagged skill router.
- [x] Add first dynamic canvas route.
- [x] Add BBE Momentum Intelligence skill schema and missing-state output.
- [x] Add eval harness for agent guardrails.
- [x] Add governed QBR story draft artifact.
- [x] Add Jarvis-style command-center interaction pass to `/agent-lab`.
- [x] Define Experience Plan schemas and renderer contract.
- [x] Add twenty-one pilot experience templates, including governed competitive comparison, source readiness, source-owner intake, source promotion readiness, live meeting capture, review operations, pilot learning, quiet proactivity, voice readiness, persistence readiness, treatment outcome readiness, runtime governance, artifact readiness, experience architecture, foundation readiness, and executive pilot workspaces.
- [x] Add experience planner / architect service.
- [x] Render Agent Lab from Experience Plan zones.
- [x] Add evals for experience planning and artifact review gates.
- [x] Add unified `runAgentTurn()` runtime.
- [x] Add streaming event schema and `/api/agent/stream`.
- [x] Connect streaming text/state updates to `/agent-lab`.
- [x] Add claim-level evidence spotlight records, stream event, audit record, Agent Lab Proof Rail section, and eval coverage.
- [x] Add durable session evidence-spotlight summaries through `agent-session-evidence-spotlight-v1`, local session ledger persistence, API persistence metadata, Agent Lab rendering, and eval coverage while keeping missing evidence and reviewed context visible.
- [x] Add durable session runtime-quality summaries through `agent-session-runtime-quality-v1`, local session ledger persistence, API persistence metadata, Agent Lab rendering, and eval coverage while keeping the checks read-only and governed.
- [x] Add governed canvas state manifests, stream event, audit record, Agent Lab proof-rail section, and eval coverage.
- [x] Add governed interruption/recovery manifests, stream/audit events, Agent Lab Stop control, preserve-last-canvas behavior, and eval coverage.
- [x] Add governed public status-step manifests, stream/audit events, Agent Lab proof-rail rendering, and eval coverage.
- [x] Add governed conversation presence manifests, stream/audit events, command-core/proof-rail rendering, and eval coverage while keeping the voice loop push-to-talk only.
- [x] Persist canvas state, interruption/recovery, public reasoning/status, and conversation presence manifests into `agent-session-canvas-continuity-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping arbitrary UI generation, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, and continuous voice barge-in disabled.
- [x] Add governed provider adapter manifests, stream/audit events, Agent Lab proof-rail rendering, and eval coverage while keeping Realtime voice and TTS gated.
- [x] Clarify `/agent-lab` as a governed push-to-talk voice loop over `/api/agent/stream`.
- [x] Connect continuous voice orchestration to governed skill/view contracts through `voice-skill-view-contract-v1`, per-turn `agent-voice-skill-view-contract-v1` manifests, session `agent-session-voice-contract-v1` summaries, Agent Lab rendering, API persistence, validation, and eval coverage while keeping continuous voice, Realtime voice, TTS, wake-word capture, arbitrary skill routing, and arbitrary UI generation disabled/gated.
- [x] Add first-turn session memory suggestions, artifact capture, audit log, and confirmation gates.
- [x] Add durable session audit summaries through `agent-session-audit-summary-v1`, local session ledger aggregation, API persistence metadata, Agent Lab rendering, and eval coverage while keeping audit export and enterprise audit storage disabled.
- [x] Persist Agent Lab memory, artifacts, audit, and confirmation gate state across browser reloads with local-first storage.
- [x] Add durable local server JSON persistence for memory, artifacts, audit, and confirmation gate state as the prototype persistence path.
- [x] Add reviewed accept/edit/reject workflows for persisted memory, artifacts, and confirmation gates.
- [x] Add reviewed-local source promotion record persistence for accepted Brand Strategic Context and Momentum source candidates.
- [x] Surface reviewed-local source promotion records in the Brand Data view.
- [x] Surface reviewed-local source promotion candidates in governed agent turns and Agent Lab Proof Rail without auto-consuming them as source facts.
- [x] Add local source-claim extraction and review queue for unstructured source text, including Brand Data UI, keeping extracted/reviewed claims separate from canonical facts and runtime evidence.
- [x] Add source-claim runtime audit records and claim-specific confirmation gates while keeping canonical facts and runtime auto-consumption disabled.
- [x] Add Experience Plan view manifests for dynamic workspace composition, including data dependency, fallback, guardrail, and selection-rationale metadata.
- [x] Add governed artifact manifests for dynamic workspace artifacts, including evidence, source-view, guardrail, review, circulation, and export-disabled metadata.
- [x] Add governed artifact readiness requirements and runtime/session review coverage so artifact approval can mark prototype-reviewed status without enabling export or circulation.
- [x] Persist ExperiencePlan artifacts into `agent-session-artifact-readiness-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping export, copy, circulation, official approval, and enterprise publishing disabled.
- [x] Add runtime quality checks, stream event, audit record, Agent Lab proof-rail rendering, and eval coverage.
- [x] Add working context manifests, stream event, audit record, Agent Lab proof-rail rendering, and eval coverage.
- [x] Add persistence readiness manifests, stream event, audit record, Agent Lab proof-rail rendering, validation, and eval coverage while keeping enterprise persistence gated.
- [x] Add governed Persistence Readiness Cockpit with `inspect_persistence_readiness`, `persistence_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption disabled.
- [x] Add governed Treatment Outcome Readiness Cockpit with `inspect_treatment_outcome_readiness`, `treatment_outcome_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores disabled.
- [x] Add quiet proactivity manifests, stream event, audit record, Agent Lab proof-rail rendering, held notices, disabled automation flags, and eval coverage.
- [x] Add governed Quiet Proactivity Cockpit with `inspect_quiet_proactivity`, `proactivity_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping reminders, scheduled notifications, external sends, background runs, autonomous action, source promotion, and overlapping runs disabled.
- [x] Persist quiet proactivity manifests into `agent-session-proactivity-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping reminders, scheduled notifications, external sends, background runs, source promotion, and autonomous actions disabled.
- [x] Add review-only autonomous proactivity promotion protocol steps to `agent-session-proactivity-v1` and `proactivity_panel`, with eval coverage proving quiet suggestions, held notices, human review, reminder/scheduling governance, external/background operations, and autonomous rollout stay separated.
- [x] Add review-only learning promotion protocol steps to `agent-session-pilot-learning-v1` and `pilot_learning_panel`, with eval coverage proving reviewed signals, human learning review, proof needs, outcome linkage, canonical learning, and autonomous learning rollout stay separated.
- [ ] Add enterprise database persistence for reviewed memory, artifacts, audit, confirmation gate state, and source promotion records after governance requirements are reviewed.
- [x] Add config-backed capability flags before exports, source updates, reviewed memory writes, or future write actions.
- [x] Add durable session capability-readiness summaries through `agent-session-capability-readiness-v1`, local session ledger persistence, API persistence metadata, Agent Lab rendering, and eval coverage while keeping risky capability promotion blocked.
- [x] Add config-backed runtime control / kill-switch policy, per-turn manifest, Agent Lab proof-rail rendering, validation, and eval coverage.
- [x] Expose dedicated `agent-session-runtime-control-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping runtime bypass, admin bypass, exports, source writes, external ingest, and continuous voice disabled.
- [x] Expose cross-rail `agent-session-foundation-readiness-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and Runtime Governance views while keeping enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation gated.
- [x] Add governed Foundation Readiness Cockpit with `inspect_foundation_readiness`, `foundation_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, voice skill/view compatibility, and eval coverage while keeping enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation gated.
- [x] Add governed Executive Pilot Runbook with `plan_executive_pilot`, `executive_pilot_runbook_panel`, ExperiencePlan routing, Agent Lab rendering, voice skill/view compatibility, API sanity, and eval coverage while keeping export/copy/circulation, official approvals, canonical writes, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation gated.
- [x] Add Agent Lab guided Executive Pilot sequence with six manual sponsor-demo steps, active skill/template highlighting, load/run prompt controls, browser verification, and quota-safe browser-local ledger compaction while keeping automation, export/copy/circulation, official approvals, canonical writes, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation gated.
- [x] Add durable `agent-session-executive-pilot-v1` coverage summaries for the guided sponsor-demo path, with API/session persistence, Agent Lab completed-step state, next-step guidance, eval coverage, and hard-disabled export/autonomous sequence/full voice/arbitrary UI flags.
- [x] Add governed Runtime Governance Cockpit with `inspect_runtime_governance`, `runtime_governance_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping default scoped chat stable and Realtime voice, full voice, TTS, exports, source writes, and canonical promotion gated/disabled.
- [x] Add approved `runtime_quality_panel` dynamic view integration for persisted runtime self-checks across Runtime Governance, Experience Architecture, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add approved `evidence_spotlight_panel` dynamic view integration for persisted claim-to-proof continuity across Executive QBR, Evidence Lab, Review Operations, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add approved `canvas_continuity_panel` dynamic view integration for persisted approved-view canvas continuity across Experience Architecture, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add approved `audit_trail_panel` dynamic view integration for persisted runtime audit continuity across Review Operations, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add review-only audit governance protocol steps to `agent-session-audit-summary-v1` and `audit_trail_panel`, with eval coverage proving runtime audit capture, confirmation linkage, coverage completeness, export governance, enterprise audit-store governance, and canonical audit-write governance stay separated.
- [x] Add focused adversarial eval coverage for official-approval identity spoofing and audit-export overreach across JSON, stream, skill-routed chat, and Live Consult fallback.
- [x] Add focused adversarial eval coverage for agency-brief copy/export/package/external-circulation and stakeholder-approved-language overreach across JSON, stream, skill-routed chat, and Live Consult fallback.
- [x] Add focused adversarial eval coverage for memory auto-accept, reviewed-memory write, enterprise persistence, and canonical-memory overreach across JSON, stream, skill-routed chat, and Live Consult fallback.
- [x] Add review-only enterprise persistence promotion protocol coverage to `agent-session-persistence-governance-v1` and `persistence_readiness_panel`, separating local JSON continuity and reviewed-local decisions from enterprise schema, identity/access, retention/backup/privacy, and canonical promotion governance while enterprise persistence remains disabled.
- [x] Add focused adversarial eval coverage for reminder scheduling, scheduled notifications, external sends, background checks, autonomous action, and overlapping-run overreach across JSON, stream, skill-routed chat, and Live Consult fallback.
- [x] Add focused adversarial eval coverage for treatment efficacy, accepted outcome-record storage, portfolio learning, and canonical outcome-learning overreach across JSON, stream, skill-routed chat, and Live Consult fallback.
- [x] Add approved `review_identity_panel` dynamic view integration for prototype reviewer-label and official-approval identity readiness across Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add approved `provider_adapter_panel` dynamic view integration for governed provider readiness across Voice Readiness, Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add approved `capability_readiness_panel` dynamic view integration for governed risky-capability readiness across Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with validation and eval coverage.
- [x] Add governed Artifact Readiness Cockpit with `inspect_artifact_readiness`, `artifact_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping artifact export, copy, circulation, and official approval disabled.
- [x] Add governed Source Promotion Readiness Cockpit with `inspect_source_promotion_readiness`, `source_promotion_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping canonical writes/facts, source data writes, source-claim promotion, official approval, and runtime source auto-consumption disabled.
- [x] Add governed Experience Architecture Cockpit with `inspect_experience_architecture`, `experience_architecture_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping arbitrary UI generation, unregistered views, unsupported metrics, and new source claims disabled.
- [x] Add per-turn `experienceArchitectureManifest`, stream event, audit record, Agent Lab proof rail, and eval coverage so every governed turn proves approved-template composition posture while dynamic UI generation, arbitrary view IDs, unsupported metric generation, and new source-claim generation remain disabled.
- [x] Persist `experienceArchitectureManifest` records into the session ledger and expose `agent-session-experience-architecture-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while arbitrary UI generation, unregistered views, unsupported metrics, and new source-claim generation remain disabled.
- [x] Add per-turn `sourceGovernanceManifest`, stream event, audit record, Agent Lab proof rail, and eval coverage so every governed turn proves reviewed-local source context remains non-canonical while source writes, source-claim promotion, runtime source auto-consumption, and runtime file-drop consumption stay disabled.
- [x] Persist `sourceGovernanceManifest` records into the session ledger and expose `agent-session-source-governance-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while canonical writes/facts, runtime source auto-consumption, source-claim promotion, and source-data writes remain disabled.
- [x] Persist runtime source-ingestion gate posture into `agent-session-source-runtime-ingestion-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while default runtime source wiring, canonical use, runtime source auto-consumption, file-drop consumption, and source-data writes remain disabled.
- [x] Promote runtime source-ingestion gate posture into governed workspace composition with `source_runtime_ingestion_panel` in the dynamic-view registry, voice skill/view contract, Source Readiness Lab, Source Owner Intake Workbench, Source Promotion Readiness Cockpit, Foundation Readiness Cockpit, Executive Pilot Runbook, skill-router view requests, Agent Lab rendering, durable Executive Pilot expected views, and eval coverage.
- [x] Persist memory/audit continuity into `agent-session-memory-audit-v1` through session APIs, persisted turn metadata, Agent Lab, JSON/stream/chat/Live Consult fallback eval coverage, and durable session APIs while memory auto-accept, reviewed-memory writes, canonical memory writes, and enterprise memory storage remain disabled.
- [x] Promote memory/audit continuity into governed workspace composition with `memory_audit_panel` in the dynamic-view registry, voice skill/view contract, Review Operations Cockpit, Persistence Readiness Cockpit, Foundation Readiness Cockpit, Executive Pilot Runbook, skill-router view requests, Agent Lab rendering, durable Executive Pilot expected views, and eval coverage.
- [x] Add review-only memory promotion protocol steps to `agent-session-memory-audit-v1` and `memory_audit_panel`, with eval coverage proving accepted memory can load as local working context without enabling canonical memory writes, enterprise storage, or auto-accept.
- [x] Add adversarial governed-runtime eval coverage proving unsafe requests for arbitrary UI, unsupported metrics, artifact export/review bypass, canonical source use, runtime source consumption, continuous voice, TTS, and autonomous speaking fail closed through approved templates/views, correct JSON/stream/chat/Live Consult fallback surface posture, and disabled gates.
- [x] Add adversarial promotion/funding overreach eval coverage proving CMO demo prompts cannot certify production readiness, approve funding, unlock export, turn on full voice, allow arbitrary UI, or write source truth; JSON, stream, skill-routed chat, and Live Consult fallback must fail closed through the governed Executive Pilot Runbook and `promotion_gate_panel`.
- [x] Add per-turn `runtimeSurfaceManifest`, stream event, audit record, Agent Lab proof rail, compact proof-strip surfacing, and eval coverage so every governed turn proves which surface produced it while scoped default chat, Realtime voice, TTS, and continuous voice stay gated or disabled.
- [x] Persist `runtimeSurfaceManifest` records into the session ledger and expose `agent-session-runtime-surface-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while default scoped chat remains preserved and full voice, Realtime, TTS, continuous voice, exports, and source writes stay disabled/gated.
- [x] Add a session runtime-surface guardrail matrix to `agent-session-runtime-surface-v1`, showing observed-surface runtime paths, proof surfaces, pass/watch status, governed-runtime/scoped-chat preservation, and disabled full voice/export/source-write posture in APIs, Agent Lab, and evals.
- [x] Add review-only runtime-surface promotion protocol steps to `agent-session-runtime-surface-v1` and `runtime_governance_panel`, with eval coverage proving observed surfaces, opt-in review, default promotion, voice/provider runtime governance, export/source-write governance, and production certification stay separated before any surface promotion.
- [x] Add a governed Agent Lab mission-control band that makes CMO pilot readiness, runtime-surface guardrails, source-ingestion posture, voice readiness, and memory/audit state visible in the first viewport for executive testing without enabling new capabilities.
- [x] Add a bottom-up Agent Lab Foundation Audit band plus reusable `foundation-layer-readiness` service and persisted `persistence.foundationLayerAudit` runtime payload that make the POC layer stack explicit: Data Packet, Knowledge + Guardrails, Unified Runtime, ExperiencePlan Workspaces, Voice Readiness, Memory + Audit, Source Governance, and Artifacts + Learning, each with status, proof, test basis, next gating action, and eval coverage.
- [x] Add an Agent Lab Minimum Lovable Path above the foundation audit so the POC can be tested as three focused, governed end-to-end use cases before deeper cockpit inspection: Executive Brand Read (`executive-qbr-decision-read`), Trust Check (`source-readiness-lab`), and Treatment Path (`marketer-treatment-planning`). The cards run approved prompts, complete from persisted ExperiencePlan architecture manifests, show expected/rendered approved views, and keep arbitrary UI, export, official approval, canonical writes, full voice, and autonomous action disabled.
- [x] Add an MLV workspace rhythm strip above the transcript/canvas/proof columns so each current use case has a visible Ask / Plan / Render / Prove / Review spine derived from the active governed turn, active ExperiencePlan, approved-view continuity, proof counts, and active-turn review needs.
- [x] Add live stream sequencing to the MLV rhythm so client-paced `/api/agent/stream` events visibly progress through Ask / Plan / Render / Prove / Review states and queued approved-view/guardrail chips while preserving deterministic final results and all governed runtime gates.
- [x] Add a pause-point Agent Lab checkpoint runbook for user testing, including first-viewport inspection, CMO pilot prompt, source-readiness prompt, voice-readiness prompt, adversarial overreach prompt, pass criteria, red flags, known constraints, and a quick executive scorecard.
- [x] Add a typed Agent Lab workspace choreography model and responsive UI band that tracks listen/route/plan/render/prove/review phase state, approved-view continuity, proof continuity, pending review counts, runtime posture, production-promotion blockers, and the next governed action from the active turn plus session ledger.
- [x] Add `agent-session-promotion-gate-v1` summaries through session APIs, persisted turn metadata, Agent Lab, and evals so CMO-demo readiness, pilot-review readiness, production blockers, enabled demo rails, and disabled promotion paths are inspectable without enabling gated capabilities.
- [x] Promote the promotion verdict into governed workspace composition with `promotion_gate_panel` in the dynamic-view registry, voice skill/view contract, Foundation Readiness Cockpit, Executive Pilot Runbook, skill-router view requests, Agent Lab rendering, durable Executive Pilot expected views, and eval coverage.
- [x] Add governed voice readiness policy.
- [x] Add per-turn voice runtime manifests so spoken turns use the same governed stream, views, evidence, memory, audit, and gates as typed turns while continuous mode remains disabled.
- [x] Persist `voiceRuntimeManifest` records into the session ledger and expose `agent-session-voice-runtime-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while continuous voice, Realtime voice, TTS, autonomous speaking, background listening, and provider bypass remain disabled.
- [x] Add voice orchestration readiness manifests so Jarvis-style voice promotion has an explicit checklist and production/continuous voice remains gated until Realtime parity, TTS policy, consent/privacy, interruption/cancellation, and storage requirements are ready.
- [x] Persist `voiceOrchestrationReadinessManifest` records into the session ledger and expose `agent-session-voice-readiness-v1` through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while wake/listen, continuous voice, Realtime voice, TTS, server-side cancellation, and enterprise voice memory/storage remain gated.
- [x] Add governed Voice Readiness Cockpit with `inspect_voice_readiness`, `voice_readiness_panel`, ExperiencePlan routing, Agent Lab rendering, and eval coverage while keeping Realtime voice, continuous listening, wake-word capture, TTS, autonomous speaking, and server-side provider cancellation gated/disabled.
- [x] Add review-only voice activation protocol coverage to `agent-session-voice-readiness-v1` and `voice_readiness_panel`, separating push-to-talk runtime, browser STT prototype input, Realtime unification, interruption/privacy, TTS policy, and enterprise voice storage while keeping full voice disabled.
- [x] Harden Agent Lab push-to-talk failure handling so browser STT permission denial or capture failure switches the visible control to `Type Instead`, marks browser STT unavailable, focuses the typed prompt, and keeps the same governed `/api/agent/stream` path available without enabling continuous voice.
- [x] Add Brand Strategic Context source-packet model, validation, and partial prototype-reviewed packets for Lay's and Siete.
- [x] Feed accepted reviewed memory back into future agent-turn context without auto-promoting suggestions.
- [x] Persist working context, persistence readiness, and review identity manifests into `agent-session-persistence-governance-v1` summaries through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and eval coverage while keeping enterprise persistence, enterprise identity, official approvals, role/brand access, memory auto-accept, canonical writes, and source auto-consumption disabled.
- [x] Extend `agent-session-persistence-governance-v1` with review-only enterprise persistence promotion protocol steps rendered in `persistence_readiness_panel`, proving prototype continuity can be inspected without enabling enterprise schema, identity/access, retention/backup/privacy, canonical promotion, official approvals, or canonical writes.
- [x] Add Brand Strategic Context validate -> preview -> promote importer UI in the brand data view.
- [x] Add Brand Strategic Context source-owner handoff requirements, validation, packet readiness surfacing, Brand Data inspection, and eval coverage while keeping prototype/browser-local context non-canonical.
- [x] Add Brand Strategic Context readiness to the governed Source Readiness Panel and source-readiness answer path.
- [x] Add disabled Brand Strategic Context source-owner runtime file-drop policy, source-owner file-bundle template, server audit, packet readiness, Brand Data/Source Readiness surfacing, validation, and eval coverage.
- [x] Add Momentum Intelligence source-packet model with market context, peer set, room-to-grow inputs, SMD contribution weights, validation, eval assertions, and dynamic view surfacing.
- [x] Add Momentum Intelligence validate -> preview -> promote importer UI in the brand data view.
- [x] Add measured Growth Navigator fallback adapter for Momentum Intelligence source packets.
- [x] Add multi-quarter trend context and Momentum output-quality checks.
- [x] Add packet-level Momentum source readiness gates for source-owner extract approval, market/share/penetration, contribution weights, movement/significance, and executive-use blocker state.
- [x] Add Source Readiness Lab routing/evals so explicit source-readiness prompts show required source-owner extracts without promoting prototype data.
- [x] Add Live Meeting Capture routing/evals so meeting takeaway prompts produce review-required decision notes with evidence, gaps, and next proof signals without becoming final meeting minutes.

## Files Expected To Change Next

Likely next slice:

- promote official Brand Strategic Context sources only after the new readiness checks are satisfied by source-owner-approved brand book / brand DNA / strategy / planning / creative claim sources
- use the disabled Brand Strategic Context runtime file-drop lane as the read-only intake/proof surface for official brand strategy source files; do not wire it into packet facts until canonical-use governance and persistence readiness clear
- promote accepted Brand Strategic Context packets beyond browser-local prototype storage after source-owner governance is clear
- use `agent-session-executive-pilot-v1` as the auditable CMO demo path, then wire approved source-owner Momentum file drops into the default runtime source path only after source-owner files are present, canonical-use governance is approved, and `agent-session-source-runtime-ingestion-v1` shows the ingestion gate is satisfied
- replace the Doritos Momentum source-extract fixture with approved source-owner extract files that satisfy `momentumSourceReadiness`
- keep adding adversarial eval cases across JSON, stream, chat, Live Consult fallback, and future voice surfaces for any proposed capability promotion before enabling source truth, exports, continuous voice, or arbitrary UI behavior
- keep the runtime-surface guardrail matrix and runtime-surface promotion protocol visible as the read-only proof layer before promoting any surface from opt-in/gated/disabled toward default use
- add multi-quarter Momentum Intelligence logic with source-period/significance caveats and output-quality self-checks
- keep disabled capability flags in place until reviewed workflows exist for exports, source updates, reviewed memory writes, and future write actions
- keep full voice disabled until `voiceOrchestrationReadinessManifest` has no blocked requirements for Realtime runtime parity, server-side cancellation, continuous consent/privacy, TTS policy, and enterprise storage; the current OpenAI TTS adapter is chained talk-back only, not full voice activation
- keep prototype review identity explicit through `reviewIdentityManifest`, and keep enterprise persistence/official approvals disabled until enterprise schema, reviewer identity/access control, retention/privacy, backup/recovery, and canonical source promotion governance are resolved
- keep pilot learning in reviewed-signal mode through `pilotLearningManifest`; use `treatmentOutcomeReadinessManifest` only as a blocked promotion checklist; do not enable autonomous learning, outcome claims, outcome-record capture, canonical memory writes, canonical learning stores, or canonical source writes until outcome records and enterprise governance exist
- deepen `src/lib/intelligence/skill-router.ts`
- deepen `src/lib/intelligence/kernel.ts`
- expand `src/components/intelligence/DynamicViewRenderer.tsx`
- add QBR draft export/copy affordances after stakeholder language review and explicit approval of the `artifact_export_capability` gate
- keep artifact manifests and readiness manifests as review/proof metadata only; artifact approval may mark prototype-reviewed but must not enable export or circulation without capability gates
- keep expanding accepted decision/session memory, review workflow summaries, reviewed source-candidate inspection, and source-claim review context in `/agent-lab` without auto-promoting suggested memory, durable source candidates, or extracted claims
- use the source-claim promotion protocol as the no-magic ladder for pasted/deck/transcript claims; do not map extracted claims into packet evidence, canonical facts, or runtime evidence until source-owner verification, canonical governance, and runtime evidence wiring are explicitly approved
- evolve quiet proactivity from suggestions-only manifests into reviewed scheduled checks only after reminder, privacy, and no-overlap governance is defined
- keep source-claim gates as review/audit state only until source-owner governance defines canonical promotion; gate approval must not write source truth
- connect `/agent-lab` to real streaming / continuous voice orchestration through the governed Live Consult Realtime path only after policy, consent, server-side cancellation, interruption behavior, transcript storage, and production voice governance are approved
- add richer eval cases in `scripts/eval-agent.mjs`
- `STATUS.md`
- `BACKLOG.md`

## Known Risks

- The dynamic UI could become decorative if not tied to skill outputs and evidence.
- A fully flexible agent could overreach unless skills, views, prompts, and evals are strict.
- Brand Strategic Context may be politically sensitive because official brand books/objectives may have ownership and approval constraints.
- New data sources like sales, promo engagement, and social interaction can imply causality too easily; source role and confidence must be explicit.
- The current app has strong demo value; avoid breaking it while building the next foundation.
- Too much UI generated too early could harden the wrong abstraction. Prove one vertical slice first.

## Open Questions

- What is PepsiCo’s official name for brand book / brand DNA / brand foundations / objectives?
- Which source should own Brand Strategic Context in pilot: Marketing, Insights, Strategy, or a reviewed source packet?
- Should the first dynamic route be called `/agent-lab`, `/consult`, `/live`, or something more product-facing?
- Should the dynamic canvas start as internal-only until the skill router and evals mature?
- Which brand should anchor the first Jane Wakely demo flow: Lay's, Siete, Cheetos, or another strategically meaningful brand?
- What is the minimum credible market/category data needed to make room-to-grow useful in pilot?

## Verification Commands

Run after every meaningful implementation slice:

```bash
pnpm validate:data
pnpm typecheck
pnpm eval:agent
pnpm build
```

For UI work, also browser-check desktop and 390px mobile for:

- no horizontal overflow
- no console warnings/errors
- stable dynamic view transitions
- readable evidence rail
- voice/chat fallback behavior

## Last Updated

2026-06-29
