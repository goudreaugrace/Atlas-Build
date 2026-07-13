# Unified Brand Assistant Design

## Purpose

The primary product interface should be one Jarvis-style brand assistant, not a choice between old chat quality and Agent Lab governance.

The assistant should answer direct questions with the strongest existing Brand Doctor conversation brain, then offer or launch governed work only when the user needs a report, proof pack, QBR read, treatment path, source readiness check, comparison, or governance review.

## Architecture

The interface has one front door, two intelligence modes, and two voice transports:

1. Fast conversation brain
   - Uses the scoped Brand Doctor LLM path as the primary writer for direct questions.
   - Optimized for direct strategic answers, follow-ups, synthesis, and human storytelling.
   - Keeps the answer quality of `/brand/[brandId]/conversation`.
   - The full foundation enriches proof, gaps, guardrails, memory context, and next-work offers; it does not replace the direct answer writer until parity is proven by eval and user testing.

2. Governed workbench
   - Uses the existing Agent Lab runtime, skill router, ExperiencePlan, dynamic view registry, evidence spotlight, memory, audit, and review gates.
   - Runs only when the user asks for heavier work or approves an offered next step.
   - Keeps Agent Lab as an inspection/debug workbench rather than the primary user surface.

3. Dynamic Work Spec planner
   - Proposed next layer between conversation and governed execution.
   - Converts broad requests into a reviewable work spec: intent, audience, objective, data needs, approved skills, approved views, artifact type, missing inputs, and review gates.
   - Enables more flexible "build me the right thing" behavior without arbitrary UI/code generation or unsupported metrics.

4. Primary Realtime voice shell
   - Uses OpenAI Realtime WebRTC for the natural Jarvis-style voice interaction.
   - The Realtime agent is a voice shell, not a separate brain. For every substantive user request it calls the `answer_or_prepare_brand_work` tool, which invokes `/api/assistant`.
   - The tool result is the source of truth for spoken answer, written answer, approval state, suggested next moves, proof disclosure, and dynamic work spec.
   - A second `approve_pending_brand_work` tool can execute the pending governed workspace only after explicit user approval.
   - Realtime handles natural turn-taking, voice activity detection, native voice cadence, and interruption feel; the governed assistant/runtime handles facts, decisions, proof, and gates.

5. Fallback voice shell
   - Browser STT plus `/api/agent/voice` OpenAI TTS remains as a fallback when Realtime is unavailable.
   - Fallback voice uses the same `/api/assistant` contract, but it should not be treated as the final interaction model because it is chained transcript-to-TTS rather than native turn-taking.

## Implemented Slice

- `/api/assistant` decides whether the prompt is a direct answer, answer-and-offer, approval work order, or fail-closed governance path.
- `/brand/[brandId]/assistant` renders one conversation interface plus a dynamic work canvas.
- The Assistant interaction model follows Jakob's Law: one familiar assistant composer with a text field, inline mic icon, send action, compact mode/status text, and short starter suggestions near the input. Text and voice are input modes inside the same composer, not separate instructional panels.
- Direct questions use the older scoped `answerWithBrandDoctorLlm()` path as the primary answer writer because testing showed it produces materially better Lay's momentum and CMO-read answers.
- The newer `BrandIntelligencePacket` foundation stays attached as deterministic proof disclosure, evidence gaps, guardrails, suggested next moves, and governed-work planning context.
- Work-order asks return quickly with an approval prompt and `dynamic-work-spec-v1`.
- Approved work calls `/api/agent/stream` and renders existing `DynamicViewRenderer` outputs.
- The Assistant page now supports typed input, a user-initiated Voice Agent mode, OpenAI TTS voice reply with browser speech fallback, and interactive follow-up listening over the same request-evaluation path.
- Typed input is quiet by default. A typed question produces a written answer only. Voice input can produce spoken output plus the same visible transcript/history.
- Voice controls are contextual. The default composer shows only the mic icon; audio/pause controls appear after Voice Agent starts or audio is active, and the composer becomes the voice-state surface while transcript/history stays visible.
- Active agent states occupy the same composer surface where the user normally types. When Voice Agent is listening/active, the assistant is thinking or speaking, or governed work is waiting for approval/building, the text field is replaced by a focused state console with the current status, concise progress detail, and only the relevant next actions. This follows common chat-assistant patterns: one place to ask, one place to see whether the assistant is listening, working, speaking, or waiting for approval.
- The transcript is the shared source of interaction continuity for both text and voice. Once a turn starts, starter examples should step back and the user/assistant message flow should remain obvious.
- The assistant has explicit, dynamic self-knowledge. For "what are you?", "what is your job?", and "what can you do?", `/api/assistant` answers from `assistant-capability-manifest-v1`, which is generated from the active Brand Intelligence Packet plus the live skill registry, dynamic view registry, experience template registry, capability flags, runtime surface registry, and voice readiness requirements. It should introduce itself like an expert in the room while staying bounded to actual approved product capabilities.
- Assistant introductions use an identity-composer layer rather than hard-coded request/response copy. `assistant-identity-brief-v1` defines the stable role, audience, trust promise, voice, metaphor policy, and boundaries; `assistant-capability-manifest-v1` supplies live product capabilities; the intro composer adapts to executive, capability, evidence, interaction-model, starter-guidance, or general intro contexts. A validator rejects intros that miss brand-equity scope, evidence/proof/gaps, no-invention boundaries, or executive decision-support language.
- `/api/assistant/capabilities?brandId=[brandId]` exposes the same capability manifest for inspection. This keeps self-introduction, demo prep, and troubleshooting grounded in latest product features instead of hand-authored claims.
- The manifest names what is available now: direct active-brand answers, proof/gap explanation, approved governed workspaces, initiated text/voice interaction, approved skills, voice-canvas-ready views, active data coverage, runtime posture, voice readiness, and blocked capabilities. It also names what is gated: exports/circulation, source writes, canonical source truth, continuous/background voice, autonomous work, and production certification.
- Voice Agent turns now give immediate spoken acknowledgement, expose a visible activity state for listening/thinking/speaking/building/approval, and include a pause control that stops listening/audio while allowing visual work to finish.
- Assistant responses now split written answer, short spoken answer, suggested next moves, and proof disclosure so the UI can sound natural while keeping evidence inspectable.
- Assistant responses now pass through `assistant-reality-boundaries-v1` when needed. The boundary is deliberately small and reusable: latest/current asks disclose the loaded packet period, share/export/final/CMO-ready asks become review-draft and gated-circulation language, capability questions use available/prototype/gated buckets, and outside-evidence asks log missing-evidence categories without treating them as current packet facts.
- `/api/assistant` accepts a compact in-session conversation history window so follow-ups can use active thread context without promoting memory to canonical truth.
- `/api/assistant/transcript` stores prototype-local diagnostic records for assistant testing in `.runtime/assistant-transcripts.json`. These records capture the user ask, answer, input mode, intent, source/grounding, proof counts, work summary, status, latency, and errors so test issues can be diagnosed later. They are not canonical brand evidence, accepted memory, source truth, or enterprise transcript retention.
- Assistant turns now include `assistant-coverage-assessment-v1`. The coverage assessment classifies each turn as answered from evidence, answered with gaps, outside current evidence, unable to answer, or work routed. When users ask for signals outside the current packet, such as campaign impact, pack recognition, promotion effectiveness, CEP movement, retail signals, media/social evidence, or production/export capabilities, the transcript logs that demand for enhancement review without treating it as current evidence.
- Follow-up turns include a compact active-workspace summary when governed work is open, so the conversation can discuss the right-side work canvas without treating workspace state as new evidence.
- Intent routing is answer-first: asking what a QBR/proof/report/treatment/comparison would say returns an answer and offers next moves; explicit build/create/draft/prepare/package/open-workspace language creates an approval work order.
- Work-intent routing treats "set up" plus a deliverable, such as a learning plan, test diagnostic, QBR, proof pack, or workspace, as governed work that pauses for approval.
- Suggested next moves are generated from the actual question and active packet, not a fixed menu. Momentum asks should offer proof, CMO, treatment, or learning paths; source/data asks should offer measured-vs-simulated and source-gap work; campaign or activity asks should offer proof-plan and watch-signal work.
- Learning and diagnostic asks are now part of the same pattern. Explicit training asks such as "Build a learning path for this read" create a `learning-coach` approval work order with `learning_explainer`, `quiz_card`, and `kpi_strip`; the rendered canvas reuses approved `/learn` modules, the Lay's case walkthrough, practice diagnostics, quiz checks, and active-brand KPI evidence.
- Governance overreach fails closed without enabling production, export, full voice, canonical writes, or official approvals.
- `/api/assistant/realtime/session` creates short-lived OpenAI Realtime client secrets for the product-facing Assistant.
- `/brand/[brandId]/assistant` now tries the Realtime voice shell first when the user starts Voice Agent, then falls back to browser STT plus chained TTS if Realtime is unavailable.
- The Realtime shell calls the same `/api/assistant` brain for direct answer versus governed-work decisions and calls the existing `/api/agent/stream` path only after explicit approval.
- Realtime must call the assistant brain for self-knowledge/capability questions too; it should not answer those from broad model training.
- Spoken replies are sentence-bounded and intentionally shorter than written answers; the full answer stays visible in the transcript.
- The dynamic work canvas has a Focus Work mode so approved work can take over the page while the chat remains available.
- The governed canvas now shows the work progression explicitly: Scope, Route, Plan, Render, Prove, and Review. Workspace-ready output includes view/proof/gap/gate counts plus follow-up questions that continue from the active workspace.
- Fast governed runtime results are held briefly in a visible "checking proof" state before the final canvas is revealed. This creates a clearer sense of work progression while staying honest: the status references approved views, proof, gaps, and review gates, not hidden reasoning or unsupported autonomous labor.
- The premium Jarvis route should express this progression through an orb-native Thought Core rather than a bright task card strip. Idle should simply say `Waiting for instructions...`; active states should show one safe operational trace phrase at a time, with orb/ring/node activity increasing as work complexity increases. This provides insight into what the assistant is checking, preparing, or building without exposing private chain-of-thought.
- Provider details such as Realtime status, browser STT availability, voice reply state, and fallback transport are diagnostics, not primary UX. They stay behind a compact disclosure unless the user is troubleshooting.

## Target Flow

```text
User: Tell me about Lay's momentum.
Assistant: Answers directly using the scoped Brand Doctor conversation brain.

User: What would I tell the CMO?
Assistant: Gives a sharper executive narrative and offers a QBR read.

User: Build this into a QBR read with proof.
Assistant: Asks for approval to build a CMO-review draft workspace.

User: Approve.
Assistant: Runs the governed workbench and opens QBR story, evidence, gaps, and review gates.

User: Build a learning path for this read.
Assistant: Asks for approval.

User: Approve.
Assistant: Opens the Learning Coach workspace with approved education pages, the guided brand case, practice diagnostics, quiz checks, and active-brand KPI grounding.
```

## Goal + Composition Planner Direction

The next Assistant/Jarvis intelligence layer is a lightweight Goal + Composition Planner for flagship QBR and related work.

The planner should not replace the answer-first conversation brain. It should activate when the user asks for an output, proof read, treatment recommendation, data inspection, source-readiness read, or QBR-style artifact. It should infer the user's goal, audience, decision, composition mode, selected approved modules, data needs, assumptions, guardrails, and next-best actions.

For QBR-related work, the primary composition modes are:

- Executive QBR: leadership-ready review draft with verdict, CMO takeaways, proof, guardrails, and next decision/test path.
- Evidence Read: granular data, evidence, source basis, peer basis, Room to Grow, SMD, gaps, and caveats.
- Treatment Read: treatment paths to consider and areas to inspect, not task-level planning or final prescriptions.
- Assumption/Readiness Read: measured versus prototype-assumed inputs, source-owner gaps, replacement work, and artifact readiness.

The Assistant should ask one clarification only when ambiguity materially changes the artifact. Otherwise it should proceed with a stated assumption and preserve review-draft, source-boundary, and export/circulation-gated language from `assistant-reality-boundaries-v1`.

## Next UX Work

- Keep the scoped Brand Doctor writer as the direct-answer standard; tune any future full-foundation answer composer offline until it beats that baseline.
- Implement the Goal + Composition Planner described in `docs/product/QBR_MODULAR_ARTIFACT_AND_GOAL_PLANNER_PLAN.md`, starting with QBR-related work.
- Add memory-aware follow-up summaries beyond the current compact in-session history window.
- Improve the offer copy so suggested work feels like a natural next move, not a workflow menu.
- Continue reducing left-column chrome so the work canvas remains the star: the composer should teach capability through familiar controls and contextual suggestions rather than explanatory cards.
- Deepen Dynamic Work Spec planning beyond the first approval-card spec so broad asks can select richer skill/view/template combinations.
- Deepen Learning Coach behavior beyond the first governed workspace: richer module-level tutoring, contextual report-section prompts, wiki/No Magic citations, more brand case walkthroughs, and optional reader-certification scaffolding.
- Stream direct conversational answers for perceived latency.
- Tune the Realtime tool instructions and approval language so spoken answers feel human while still respecting tool results.
- Add explicit Realtime status and fallback diagnostics to make it obvious whether the user is on native voice or chained fallback.
- Keep wake-word/background listening, production voice governance, transcript retention, and server-side cancellation policy gated for later pilot-hardening.
- Use Agent Lab only for foundation inspection, eval debugging, and advanced runtime operations.

## Conversation Quality Principles

- The assistant should sound like a brilliant brand strategist, not a policy appendix.
- Direct answers should start with the read: what matters, why it matters, and what the user should do with it.
- Evidence should be available and cited, but not recited mechanically unless the user asks for proof.
- Spoken answers should be shorter and more natural than written answers.
- Work orchestration should feel like a helpful next move: "I can build the QBR proof read for that" rather than a system workflow message.
- Guardrails stay firm: no causality, SKU pricing, cannibalization, occasion substitution, canonical source writes, official approvals, export/circulation, production certification, autonomous action, or full continuous voice unless explicitly governed later.
