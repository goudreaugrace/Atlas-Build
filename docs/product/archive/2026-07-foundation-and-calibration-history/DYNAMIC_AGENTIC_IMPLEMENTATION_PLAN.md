# Dynamic Agentic Implementation Plan

## Goal

Create a composable, voice/chat-first foundation that can support BBE Momentum Intelligence, Brand Doctor diagnostics, learning, research, visualization, meeting facilitation, role-specific dynamic workspaces, and future data expansion from one governed intelligence kernel.

The implementation should remain bottom-up. Prove the brain, contracts, evals, runtime, memory, and rails before trying to make the full dynamic interface feel magical.

The next product correction is to make the interaction bi-modal. The original scoped conversation proved the desired answer quality: fast, synthesized, human, and useful. The governed runtime proved the needed foundation: skills, views, evidence, memory, audit, gates, and fail-closed behavior. The product needs a Conversation Orchestrator between the user and those layers so simple asks receive high-quality conversational answers, while heavier asks become approved orchestrated work.

## Pilot Promise

The pilot should eventually let a user say:

> Help me prepare the strongest BGS/QBR read for this brand.

And the system should:

- assemble the active brand and category context,
- show momentum and room-to-grow,
- explain the diagnosis with evidence,
- surface alternative interpretations,
- create growth provocations,
- recommend treatment paths to test,
- teach the user any concept they do not understand,
- package the answer for the meeting,
- remember decisions and follow-up questions.

The higher ambition is:

> Build the right experience for this person and decision.

That means the system can create a governed workspace for a CMO, marketer, insights lead, learner, or agency partner from the same canonical data and skills. The agent should produce an inspectable `ExperiencePlan`; the app should render approved views and artifacts from that plan.

## Current Phase Boundary

The current phase is the **Minimum Lovable Foundation POC**. It is not the full Jarvis/Trillion-style experience shell and it is not production certification.

For this phase, "done" means:

- The original Brand Doctor PRD journey is testable: brand selection, BBE health, diagnosis belief, evidence interrogation, and treatment path to test.
- The governed agentic extension is testable: role-specific `ExperiencePlan` workspaces, approved dynamic views, unified runtime/streaming path, proof/gap/guardrail visibility, memory/audit rails, source readiness, review gates, and fail-closed risky capabilities.
- The existing report and default scoped chat remain stable.
- The technical gates pass: `pnpm validate:data`, `pnpm typecheck`, `pnpm eval:agent`, and `pnpm build`.
- A human tester can run the `/agent-lab` MLV path and decide whether it is clear, trustworthy, and fundable.

The current implementation satisfies the technical gates and now includes the product-facing Brand Assistant correction. The next step is user checkpoint testing and focused experience tuning, not more foundation rail-building.

Initial user testing found a quality regression in simple answers inside `/agent-lab`: the runtime produced a governed but over-explained answer where the original conversation produced a better strategic read. That correction is now implemented. `/api/assistant` uses the scoped Brand Doctor writer for direct answer quality, attaches the governed foundation as proof/gap/guardrail/work-planning context, routes heavier asks into approval-gated work, and supports the user-initiated Realtime voice shell with fallback browser STT/TTS.

The current product-facing test surface is `/brand/[brandId]/assistant`. `/agent-lab` remains the bottom-up inspection and checkpoint workbench for runtime proof, source readiness, memory/audit, review gates, and adversarial fail-closed checks.

### Test-Now MLV

First test `/brand/lay-s/assistant`:

1. `Tell me about Lay's momentum.`
2. `What would I tell the CMO?`
3. `Build this into a QBR read with proof.`
4. Approve the work and inspect the right-side work canvas.
5. Ask a follow-up in the same thread.
6. Ask what the assistant does and verify it introduces the actual product scope and gated capabilities.

Then use `/agent-lab` for foundation inspection:

1. **Executive Brand Read**
2. **Trust Check**
3. **Treatment Path**
4. The adversarial production/export/full-voice/source-truth prompt

The experience should show the active Ask / Plan / Render / Prove / Review loop, approved views, evidence, gaps, source readiness, memory/audit, review gates, and blocked production capabilities.

### Future Tracks After Test

If the MLV scores well, pick one next lane:

- **Pilot Experience Polish:** cleaner executive demo flow, less cockpit density, richer sequencing, and more natural voice/chat rhythm.
- **Source Owner Handoff:** approved source-owner files and governed default runtime source wiring.
- **Production Governance:** enterprise identity, persistence, official approvals, export/circulation, full voice/TTS, and outcome-learning governance.

## Current Status

Completed foundation slices:

- Phase 0 protected the current six-section report.
- Brand Intelligence Packet types and builder are implemented.
- Brand Strategic Context exists as a missing-state placeholder and guardrail.
- Agent skill and dynamic view registries are implemented and validated.
- `/brand/[brandId]/data` exposes a read-only Intelligence Packet tab.
- `src/lib/intelligence/skill-router.ts` provides a deterministic first router.
- `/api/agent` exposes the router; `/api/chat` can opt into it with a feature flag/request flag while preserving the original scoped chat default.
- `/agent-lab` provides the first governed dynamic command-center slice.
- `DynamicViewRenderer` renders approved view IDs from structured output.
- QBR story draft artifact rendering exists with human-review language.
- `pnpm eval:agent` covers the first black-box routing/view/guardrail checks.
- `/brand/[brandId]/assistant` is now the primary product-facing Assistant surface. It uses the scoped Brand Doctor writer for direct answer quality, the governed `BrandIntelligencePacket` for proof/gap/guardrail/work planning, and approval-gated `/api/agent/stream` execution for heavier dynamic work.
- The Assistant supports typed quiet answers, user-initiated OpenAI Realtime voice when available, browser STT plus chained TTS fallback, shared transcript continuity, short spoken answers, diagnostic transcript logging, coverage assessment, and active-workspace follow-up context.
- The Assistant composer now behaves as one interaction surface: default text input with inline mic/send, then a live status/action surface for listening, thinking, speaking, pending approval, or workspace building.
- `assistant-capability-manifest-v1` and `assistant-identity-brief-v1` give the Assistant dynamic self-knowledge about its actual product role, approved skills/views, current data coverage, and gated capabilities.
- `/agent-lab` has a first Jarvis-style interaction pass: governed push-to-talk affordance, command core, orchestration bus, module queue, and active-read stats.
- `ExperiencePlan` schemas, twenty-one pilot templates, `experience-planner`, `/api/agent` plan output, `/agent-lab` plan-zone rendering, inspectable plan JSON, template validation, and expanded experience evals are implemented.
- Governed competitive comparison is implemented: compare prompts route to `compare_brands_or_competitors`, render `peer_comparison` plus Pattern Radar/evidence/gap views, and keep associative/non-causal/cannibalization caveats visible.
- Governed source readiness is implemented: explicit readiness/executive-use prompts route to `source-readiness-lab`, render `source_readiness_panel`, and keep prototype/reviewed-local source blockers visible without promoting them.
- Governed source-owner intake is implemented: source bundle/import/handoff prompts route to `source-owner-intake-workbench`, render source readiness, room-to-grow, SMD driver, and gap views, and keep source-owner bundle state as review/intake context rather than canonical source truth.
- Governed Momentum source-owner handoff is implemented: every source-readiness check maps to source-owner role, accepted extract shape, required fields, validation rules, promotion gate, canonical-use condition, current status, and next action.
- Governed live meeting capture is implemented: meeting takeaway/capture-decision prompts route to `facilitate_live_meeting`, render `meeting_takeaway_panel`, and create review-required `decision_note` artifacts while export/circulation remains blocked.
- Governed review operations is implemented: review queue/audit/pending approval prompts route to `review_session_state`, render `review_workflow_panel`, evidence, and gap views, and keep local review workflow separate from official approvals, exports, canonical writes, memory auto-accept, and runtime source auto-consumption.
- Unified `runAgentTurn()` runtime, markdown output, ordered runtime events, optional skill-routed chat integration, and `/api/agent/stream` are implemented. Explicit skill-routed `/api/chat` turns now return the full governed runtime payload and persist to the durable local session ledger when `sessionId` is supplied: audit, memory, gates, evidence spotlight, working context, proactivity, canvas, interruption, reasoning status, conversation presence, provider adapter, runtime control, runtime quality, capability, voice, and persistence manifests.
- The report Dialog With Data sidecar and standalone brand conversation page now expose default-off governed-runtime controls that call the explicit skill-routed `/api/chat` path with stable brand-specific session IDs. Governed answers render compact proof strips for persistence, quality checks, gates, prototype review identity, evidence spotlight coverage, and approved view count, making runtime rails visible on current brand surfaces without changing the default scoped chat behavior.
- Live Consult now exposes a default-off governed browser/demo fallback mode. Governed fallback answers use the explicit skill-routed `/api/chat` path, local session persistence, transcript source markers, and the shared proof strip while Realtime voice, continuous listening, and TTS remain gated.
- A governed runtime surface registry is implemented and validated. It maps `/api/agent`, `/api/agent/stream`, `/agent-lab`, scoped default chat, explicit skill-routed chat, report chat opt-in, brand conversation opt-in, Live Consult fallback, the Realtime candidate, future full voice, and disabled TTS into ready, opt-in, legacy, gated, or disabled states. Agent Lab surfaces the Runtime Surface Map in the proof rail.
- Agent Lab consumes `/api/agent/stream` progressively and falls back to `/api/agent` JSON.
- Claim-level `evidenceSpotlight` records are implemented. The runtime maps answer claims, facts, interpretation, caveats, and dynamic-view requests to packet evidence, evidence gaps, guardrails, reviewed context, or non-evidence planning status, then emits a stream event and audit record.
- Local sessions now include `agent-session-evidence-spotlight-v1` summaries computed from persisted claim-level evidence spotlight records. The summary exposes support-status counts, claim-type counts, supported evidence labels, missing-evidence IDs, source candidate IDs, guardrail claims, review-required claim IDs, latest claims, and disabled canonical claim-promotion / unsupported-claim-generation flags.
- First-turn memory suggestions, audit records, and confirmation gates are emitted by the runtime and surfaced in Agent Lab.
- Local sessions now include `agent-session-audit-summary-v1` summaries computed from persisted audit records. The summary exposes action counts, confirmation-required records, skill/view/artifact/evidence coverage, latest records, lifecycle/evidence/view/artifact/memory/source/runtime-quality audit posture, a review-only audit governance protocol, and disabled audit export / canonical-write / enterprise-audit-store flags.
- Local sessions now include `agent-session-memory-audit-v1` summaries computed from persisted memory, working-context, review-gate, review-decision, and audit records. The summary exposes accepted/suggested/rejected/blocked memory counts, memory type counts, accepted context IDs/source turns, memory review gates, memory review decisions, memory audit labels, working-context audit coverage, and disabled auto-accept/reviewed-write/canonical-write/enterprise-store flags.
- `agent-session-memory-audit-v1` now includes a review-only memory promotion protocol. The protocol separates suggested memory capture, human memory review, accepted working context, canonical memory governance, enterprise memory storage, and memory auto-accept automation, and `memory_audit_panel` renders those steps while accepted memory remains local working context only.
- `memory_audit_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Review, persistence, foundation, and executive pilot prompts now request it through the skill router; Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it surfaces memory/audit continuity without enabling memory writes or enterprise storage.
- Agent Lab persists its session ledger locally in browser `localStorage`.
- Config-backed capability flags are implemented for risky export, circulation, memory-write, source-write, source-promotion, external-research, and continuous-voice actions. Risky flags default disabled and create blocked gates.
- Local sessions now include `agent-session-capability-readiness-v1` summaries computed from emitted capability state and runtime control posture. The summary exposes disabled high/medium-risk capabilities, blocked capability gates, required/reviewed gate IDs, admin override requirements, kill-switch history, next promotion requirements, and hard-disabled export, circulation, reviewed-memory-write, source-promotion, source-write, external-ingest, continuous-voice, and runtime-bypass flags.
- Config-backed runtime control / kill-switch policy is implemented. Governed turns emit `runtimeControlManifest` with fail-closed fallback, emergency stop scope, admin override requirements, and evidence/review bypass prevention.
- Local sessions now include `agent-session-runtime-control-v1` summaries computed from persisted runtime control manifests. The summary exposes runtime policy IDs, runtime modes, runtime-enabled consistency, kill-switch history, degraded fallback, emergency stop scope, risky disabled capabilities, admin override requirements, fail-closed consistency, evidence/review bypass prevention, latest runtime control state, and disabled export, source-write, external-ingest, continuous-voice, runtime-bypass, and admin-bypass flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and the Runtime Governance panel.
- Local sessions now include `agent-session-foundation-readiness-v1` summaries that consolidate approved experience architecture, evidence grounding, reviewed memory, source governance, audit/quality, runtime control, runtime surfaces, provider adapters, voice readiness, persistence governance, artifact readiness, and outcome-learning readiness into one inspectable foundation control-plane. The summary is exposed through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and Runtime Governance views while enterprise persistence, official approvals, canonical writes, runtime source auto-consumption, artifact export/copy/circulation, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation remain gated.
- Local sessions now include `agent-session-promotion-gate-v1` summaries that roll up foundation readiness, Executive Pilot coverage, source-ingestion posture, runtime-surface guardrails, and runtime quality into an explicit CMO-demo / pilot-review / production-blocked verdict. The gate exposes demo-enabled rails, critical production blockers, next pilot steps, and funding rationale while enterprise persistence, official approvals, canonical writes, artifact export, full voice, autonomous learning, and arbitrary UI generation remain blocked.
- `promotion_gate_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Foundation readiness and executive pilot prompts now request it through the skill router, Foundation Readiness Cockpit and Executive Pilot Runbook templates render it as an ExperiencePlan zone, Agent Lab displays it through `DynamicViewRenderer`, and evals prove it carries the CMO-demo / pilot-review / production-blocked verdict without enabling blocked promotion paths.
- `runtime_quality_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Runtime governance, experience architecture, foundation readiness, and executive pilot prompts now request it through the skill router, the Runtime Governance Cockpit, Experience Architecture Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone, Agent Lab displays it through `DynamicViewRenderer`, and evals prove it carries persisted pass/watch/blocked self-checks without enabling bypass or promotion paths.
- `evidence_spotlight_panel` is implemented as an approved, voice-canvas-compatible dynamic view. QBR, evidence, review, foundation, and executive pilot prompts now request it through the skill router; Executive QBR Decision Read, Insights Evidence Lab, Review Operations, Foundation Readiness, and Executive Pilot templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries persisted claim-to-proof continuity without enabling canonical claim promotion or unsupported claim generation.
- `canvas_continuity_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Experience architecture, foundation readiness, and executive pilot prompts now request it through the skill router; Experience Architecture Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries persisted approved-view canvas continuity without enabling arbitrary UI, arbitrary view IDs, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, or continuous voice barge-in.
- `audit_trail_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Review operations, foundation readiness, and executive pilot prompts now request it through the skill router; Review Operations Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries persisted lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit continuity without enabling audit export, canonical audit writes, official approval, or enterprise audit storage.
- `review_identity_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Review operations, persistence readiness, foundation readiness, and executive pilot prompts now request it through the skill router; Review Operations Cockpit, Persistence Readiness Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries prototype reviewer-label limits, reviewable item types, related gates/review records, blocked enterprise approval types, and required identity/access steps without enabling enterprise identity, role access, brand access, accountable reviewer claims, official approval, or canonical approval writes.
- `provider_adapter_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Voice readiness, runtime governance, foundation readiness, and executive pilot prompts now request it through the skill router; Voice Readiness Cockpit, Runtime Governance Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries text/SSE readiness, browser STT prototype posture, Realtime candidate gates, TTS disabled state, policy-review needs, voice contract posture, and provider-bypass blockers without enabling Realtime voice, TTS, continuous voice, autonomous speaking, or provider bypass.
- `capability_readiness_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Runtime governance, foundation readiness, and executive pilot prompts now request it through the skill router; Runtime Governance Cockpit, Foundation Readiness Cockpit, and Executive Pilot Runbook templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it carries disabled risky capability flags, blocked gates, admin override requirements, review gate IDs, runtime-control posture, and hard-disabled promotion paths without enabling capabilities or clearing blocked gates.
- `agent-session-capability-readiness-v1` now includes a review-only risky capability promotion protocol rendered in `capability_readiness_panel`, separating capability request capture, human review gates, policy/config changes, runtime-control validation, surface integration evidence, and production rollout governance before export, circulation, memory/source writes, external ingest, continuous voice, or runtime bypass can be considered.
- The governed Foundation Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Foundation readiness, platform readiness, CMO readiness, fundable foundation, and control-plane prompts route to `inspect_foundation_readiness`, render `foundation_readiness_panel` beside promotion gate, experience architecture, canvas continuity, runtime governance, capability readiness, runtime quality, provider adapters, evidence spotlight, review workflow, memory audit, audit trail, review identity, and gap views, and keep enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation gated.
- The governed Executive Pilot Runbook is implemented as an approved ExperiencePlan workspace. CMO pilot, executive pilot, funding demo, sponsor runbook, and jaw-drop demo prompts route to `plan_executive_pilot`, render `executive_pilot_runbook_panel` beside momentum, foundation readiness, promotion gate, canvas continuity, evidence spotlight, runtime governance, capability readiness, runtime quality, provider adapters, review workflow, memory audit, audit trail, and review identity views, and keep export/copy/circulation, official approvals, canonical writes, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation gated.
- Agent Lab now includes a guided Executive Pilot sequence above the freeform command bar. The six manual steps load or run approved sponsor-demo prompts for the active brand, highlight the active skill/template, and keep execution user-triggered rather than autonomous. Browser-local session ledger writes are quota-safe and compact recent history when needed, while durable local JSON server session state remains the prototype persistence path.
- Local sessions now include `agent-session-executive-pilot-v1` summaries computed from persisted ExperiencePlan architecture manifests. The summary tracks the six guided sponsor-demo steps, expected skills/templates/views, completed and missing steps, latest turn/brand, observed required views, next runbook step, and disabled export, autonomous sequence execution, full voice, and arbitrary UI generation flags. Agent Lab uses the summary for completed-step state and next-step guidance, while session APIs and persisted turn metadata expose it for evals and future resume flows.
- Agent Lab now includes a typed Workspace Choreography band driven by `buildWorkspaceOrchestrationState()`. The band derives listen/route/plan/render/prove/review phase state, view continuity, proof continuity, pending review counts, next governed action, intact runtime posture, and production-promotion blocker status from the active governed turn plus session ledger, making the dynamic workspace assembly legible without enabling autonomous execution, arbitrary UI, export, full voice, production certification, or canonical writes.
- The Executive Pilot summary now includes a CMO proof stack and gated funding-ask matrix. The proof stack ties brand read, governed ExperiencePlan composition, proof/audit rails, runtime parity, source governance, and voice path to persisted evidence; the funding asks name source-owner handoff, enterprise persistence/identity, artifact export policy, voice runtime policy, and outcome-learning design without enabling any of those paths in the prototype.
- Governed voice policy is implemented: push-to-talk default, wake/listen allowed, continuous disabled, consent required, and `/api/agent/stream` runtime source.
- Governed turns now include a per-turn `voiceRuntimeManifest` that binds voice readiness to `/api/agent/stream`, push-to-talk consent, typed fallback, disabled continuous mode, compatible voice-canvas views, stream event types, and the same evidence/gates as typed turns.
- Local sessions now include `agent-session-voice-runtime-v1` summaries computed from persisted voice runtime manifests. The summary exposes runtime event sources, default/enabled/disabled modes, consent boundaries, stream event types, compatible views, push-to-talk and typed-fallback readiness, governed-runtime consistency, evidence/gate parity, stream-source consistency, and disabled continuous voice, Realtime voice, TTS, autonomous speaking, background listening, and provider-bypass flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and the Voice Readiness panel.
- Governed turns now include `agent-voice-skill-view-contract-v1` backed by `src/data/config/voice-skill-view-contract.json`. The contract maps push-to-talk, wake/listen, continuous voice, Realtime voice, and TTS to registered skills, approved voice-canvas views, visible state phases, and readiness blockers; sessions persist `agent-session-voice-contract-v1` while continuous voice, Realtime voice, TTS, arbitrary skill routing, and arbitrary UI generation remain disabled or gated.
- Governed turns now include per-turn `runtimeQualityChecks` plus a `runtime_quality_checked` stream event/audit record. Checks cover approved templates/views, evidence attachment, source non-canonical state, artifact gates/export disabled, memory review control, continuous voice disabled, and unsafe-language scan.
- Local sessions now include `agent-session-runtime-quality-v1` summaries computed from persisted runtime quality checks. The summary exposes session-level pass/watch/blocked counts, consistently passing check IDs, watch/blocked IDs, human-review-required checks, latest checks, and consistency posture for approved experience, evidence attachment, non-canonical source context, artifact export disabled state, memory review, continuous voice disabled state, provider adapters, voice orchestration, and runtime surfaces.
- Governed turns now include per-turn `canvasStateManifest` plus a `canvas_state_ready` stream event and `canvas_state_built` audit record. The manifest maps active plan/template/layout, focused/rendered/fallback views, artifacts, pending gates, proof-rail sections, evidence gaps, voice-compatible views, and no-arbitrary-UI recovery rails.
- Governed turns now include per-turn `experienceArchitectureManifest` plus an `experience_architecture_ready` stream event and `experience_architecture_checked` audit record. The manifest exposes approved template/skill/view counts, supported audiences/objectives/layouts, active template/view posture, unknown-view checks, composition blockers, and disabled dynamic UI generation / arbitrary view ID / unsupported metric / new-source-claim flags.
- Local sessions now include `agent-session-experience-architecture-v1` summaries computed from persisted experience architecture manifests. The summary exposes session-level template, audience, objective, layout, rendered-view, fallback-view, artifact-type, blocker, and next-step usage through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while arbitrary UI generation, unregistered views, unsupported metrics, and new source-claim generation remain disabled.
- Governed turns now include per-turn `interruptionRecoveryManifest` plus an `interruption_recovery_ready` stream event/audit record. The manifest keeps interruption recovery single-turn and canvas-preserving, supports client stream abort in Agent Lab, blocks overlapping runs, and keeps server-side provider cancellation plus continuous voice barge-in out of scope.
- Governed turns now include per-turn `reasoningStatusManifest` plus a `reasoning_status_ready` stream event and `reasoning_status_built` audit record. The manifest exposes public operational status steps for intake, context, skill routing, evidence mapping, workspace assembly, governance, and response preparation without exposing hidden reasoning.
- Governed turns now include per-turn `conversationPresenceManifest` plus a `conversation_presence_ready` stream event and `conversation_presence_built` audit record. The manifest ties the Agent Lab command core, orchestration bus, module queue, status steps, voice policy, and proof rail into a push-to-talk streaming presence layer while continuous listening, background wake word, and autonomous speaking remain disabled.
- Governed turns now include per-turn `providerAdapterManifest` plus a `provider_adapters_ready` stream event and `provider_adapters_built` audit record. The manifest maps local text reasoning, SSE streaming, browser STT, the Live Consult Realtime candidate, and disabled TTS so future voice work has an inspectable adapter contract before activation.
- Local sessions now include `agent-session-provider-adapter-v1` summaries computed from persisted provider adapter manifests. The summary exposes session-level ready/prototype/gated/disabled adapter posture, latest adapter bindings, policy-review requirements, ready text/SSE paths, browser STT prototype state, and disabled provider bypass / Realtime runtime connection / TTS / continuous voice flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback.
- Governed turns now include per-turn `voiceOrchestrationReadinessManifest` plus a `voice_orchestration_readiness_checked` stream/audit record. The manifest is backed by `src/data/config/voice-orchestration-readiness-requirements.json` and exposes the promotion checklist for wake/listen, continuous voice, Realtime voice, TTS, runtime parity, interruption/cancellation, consent/privacy, and enterprise voice transcript/memory storage.
- Local sessions now include `agent-session-voice-readiness-v1` summaries computed from persisted voice orchestration readiness manifests. The summary exposes session-level ready/prototype/blocked requirement posture, latest blockers, next promotion step, consent/privacy, server cancellation, enterprise voice storage, and disabled full-voice flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while wake/listen, continuous voice, Realtime voice, TTS, server-side cancellation, and enterprise voice memory/storage remain gated.
- `agent-session-voice-readiness-v1` now includes a review-only voice activation protocol rendered in `voice_readiness_panel`, separating governed push-to-talk runtime, browser STT prototype input, Realtime runtime unification, interruption/privacy, TTS speaking policy, and enterprise voice storage so browser/demo input cannot be mistaken for full voice readiness.
- Governed turns now include per-turn `runtimeSurfaceManifest` plus a `runtime_surface_ready` stream event and `runtime_surface_checked` audit record. The manifest identifies the active governed surface, proof surface, runtime path, persistence mode, streaming/voice posture, ready/opt-in/legacy/gated/disabled surface sets, default scoped-chat preservation, and disabled full voice, Realtime voice, TTS, and continuous voice flags.
- Local sessions now include `agent-session-runtime-surface-v1` summaries computed from persisted runtime surface manifests. The summary exposes session-level surface usage, ready/opt-in/legacy/gated/disabled surface categories, latest active surface, streaming and push-to-talk posture, and blocked runtime capabilities through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while default scoped chat remains preserved and full voice, Realtime, TTS, continuous voice, exports, and source writes stay disabled or gated.
- `agent-session-runtime-surface-v1` now includes an observed-surface guardrail matrix that exposes runtime path, proof surface, pass/watch status, governed-runtime/scoped-chat preservation, and disabled full voice/export/source-write posture through session APIs, Agent Lab, and eval coverage.
- `agent-session-runtime-surface-v1` now includes a review-only runtime-surface promotion protocol rendered in `runtime_governance_panel`, separating observed governed surface turns, opt-in surface review, default surface promotion, voice/provider runtime governance, export/source-write runtime governance, and production surface certification while every promotion path remains disabled or gated.
- The governed Voice Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Jarvis-style voice readiness, provider adapter, Realtime voice, continuous voice, wake/listen, and TTS gate prompts route to `inspect_voice_readiness`, render `voice_readiness_panel` beside `provider_adapter_panel`, review workflow, and gap views, and keep Realtime voice, continuous listening, wake-word capture, TTS, autonomous speaking, and server-side provider cancellation gated or disabled.
- The governed Persistence Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Durable memory, durable audit, local JSON, enterprise persistence, retention/privacy, backup/recovery, and canonical source-promotion blocker prompts route to `inspect_persistence_readiness`, render `persistence_readiness_panel` beside review workflow/gap views, and keep enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption disabled.
- The governed Treatment Outcome Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Outcome learning, follow-up signal linkage, efficacy readiness, portfolio learning, and canonical learning blocker prompts route to `inspect_treatment_outcome_readiness`, render `treatment_outcome_readiness_panel` beside pilot learning, review workflow, and gap views, and keep outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores disabled.
- The governed Runtime Governance Cockpit is implemented as an approved ExperiencePlan workspace. Runtime surface readiness, runtime control, kill-switch posture, capability flags, governed surfaces, provider gates, and quality-check prompts route to `inspect_runtime_governance`, render `runtime_governance_panel` beside capability readiness, provider adapters, voice readiness, runtime quality, review workflow, and gap views, and keep default scoped chat stable while Realtime voice, full voice, TTS, exports, source writes, and canonical promotion remain gated or disabled.
- The governed Artifact Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Artifact readiness, export readiness, circulation readiness, QBR draft readiness, meeting artifact readiness, agency brief readiness, and artifact gate prompts route to `inspect_artifact_readiness`, render `artifact_readiness_panel` beside review workflow, evidence, and gap views, and keep export, copy, circulation, and official approval disabled.
- The governed Source Promotion Readiness Cockpit is implemented as an approved ExperiencePlan workspace. Source promotion readiness, source claim promotion, canonical source promotion, canonical fact, source candidate, source claim, and runtime source-consumption prompts route to `inspect_source_promotion_readiness`, render `source_promotion_readiness_panel` beside review workflow, persistence readiness, and gap views, and keep canonical writes/facts, source data writes, source-claim promotion, official approval, and runtime auto-consumption disabled.
- The governed Experience Architecture Cockpit is implemented as an approved ExperiencePlan workspace. Experience architecture, ExperiencePlan readiness, dynamic UI foundation, workspace-builder, approved-template, approved-view, and role-specific workspace prompts route to `inspect_experience_architecture`, render `experience_architecture_panel` beside canvas continuity, runtime governance, runtime quality, review workflow, and gap views, and keep arbitrary UI generation, unregistered views, unsupported metrics, and new source claims disabled.
- Experience architecture proof is now emitted on every governed turn through `experienceArchitectureManifest`, so workspace composition can be evaluated from the runtime result, stream, audit ledger, Agent Lab proof rail, explicit skill-routed chat, and Live Consult fallback without enabling unregistered views or new source claims.
- Governed turns now include per-turn `workingContextManifest` plus a `working_context_built` stream event/audit record. The manifest exposes accepted reviewed memory, suggested-memory count, source candidate IDs, review gate IDs, and disabled flags for memory auto-accept, source auto-consumption, and canonical writes.
- Governed turns now include per-turn `sourceGovernanceManifest` plus a `source_governance_ready` stream event and `source_governance_checked` audit record. The manifest unifies reviewed-local source promotion candidates, extracted source claims, Momentum source readiness, runtime source file-drop audit posture, source review gates, and disabled flags for canonical source writes, canonical claim facts, runtime source auto-consumption, runtime file-drop consumption/canonical use, source-claim promotion, and source-data writes.
- Local sessions now include `agent-session-source-governance-v1` summaries computed from persisted source governance manifests. The summary exposes session-level source candidate counts, source-claim review observations, runtime file-drop posture, Momentum source readiness, blockers, and next governance steps through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while canonical source writes/facts, runtime auto-consumption, source-claim promotion, and source-data writes remain disabled.
- `agent-session-source-governance-v1` now includes a review-only source-claim promotion protocol rendered in `source_promotion_readiness_panel`, separating claim extraction, human review, source-owner verification, packet evidence mapping, canonical fact governance, and runtime evidence wiring so pasted/extracted claims cannot silently become packet evidence or canonical facts.
- Local sessions now include `agent-session-source-runtime-ingestion-v1` summaries computed from persisted source governance manifests. The summary exposes Momentum and Brand Strategic Context source-owner runtime file-drop status, required/loaded/missing file kinds, file-kind readiness, Momentum canonical-use readiness, strategy-source governance-review readiness, governance blockers, and the next ingestion step through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, and governed Live Consult fallback while default runtime source wiring, canonical use, runtime auto-consumption, file-drop consumption, and source-data writes remain disabled.
- `agent-session-source-runtime-ingestion-v1` now includes a review-only default runtime source promotion protocol. The protocol separates Momentum file coverage, Brand Strategic Context file coverage, source-owner governance review, canonical-use governance, enterprise persistence readiness, and default runtime wiring, and `source_runtime_ingestion_panel` renders those steps while every step keeps runtime consumption disabled.
- `source_runtime_ingestion_panel` is implemented as an approved, voice-canvas-compatible dynamic view. Source-readiness, source-owner intake, source-promotion, foundation, and executive pilot prompts now request it through the skill router; Source Readiness, Source Owner Intake, Source Promotion Readiness, Foundation Readiness, and Executive Pilot templates render it as an ExperiencePlan zone; Agent Lab displays it through `DynamicViewRenderer`; and evals prove it surfaces source-owner runtime file coverage without enabling source consumption, canonical use, source writes, or default runtime source-path wiring.
- Approved-looking source-owner file-drop candidate coverage is implemented. The eval suite temporarily places a Momentum source-owner file bundle in the governed landing zone, verifies all required file kinds are observed as `ready_for_governance_review`, and proves JSON, stream, explicit skill-routed chat, and governed Live Consult fallback still keep default runtime source wiring, runtime consumption, canonical use, file-drop consumption, canonical source writes, source-data writes, Realtime voice, and TTS disabled.
- Invalid/non-approved source-owner file-drop candidate coverage is implemented. The eval suite temporarily places a non-approved, empty Momentum source-owner file bundle in the governed landing zone, verifies the audit surfaces review-status and empty-row issues, keeps the ingestion gate blocked with required file kinds missing, and proves JSON, stream, explicit skill-routed chat, and governed Live Consult fallback do not treat that file as runtime evidence, canonical source truth, source writes, Realtime voice, or TTS.
- Malformed source-owner file-drop candidate coverage is implemented. The eval suite temporarily places malformed JSON in the governed landing zone, verifies the audit surfaces candidate parse issues across required file kinds, keeps the ingestion gate blocked with no loaded file kinds, and proves JSON, stream, explicit skill-routed chat, and governed Live Consult fallback do not crash or treat that file as runtime evidence, canonical source truth, source writes, Realtime voice, or TTS.
- Default scoped `/api/chat` preservation coverage is implemented. The eval suite calls chat without `useSkillRouter`, with a session ID and an unsafe request to use governed runtime/source writes/export/voice, and verifies the response stays in the legacy scoped `openai`/`grounded_fallback` shape with no governed packet, manifests, events, audit, capabilities, persistence payload, or persisted governed turns.
- The eval harness now includes adversarial fail-closed prompts across `/api/agent`, `/api/agent/stream`, explicit skill-routed `/api/chat`, and governed Live Consult fallback for arbitrary UI/unsupported metrics, artifact review-export bypass, agency-brief copy/export/package/external-circulation overreach, official-approval identity spoofing plus audit export, canonical source/runtime consumption, memory auto-accept plus enterprise persistence overreach, reminder scheduling/autonomous proactivity overreach, treatment efficacy plus canonical outcome-learning overreach, always-listening voice/TTS/autonomous speaking, and production/funding promotion overreach. These cases prove unsafe requests route through approved skills/templates/views, preserve the correct runtime surface posture, and keep source truth, exports, copy, circulation, enterprise publishing, audit export, audit canonical writes, enterprise audit storage, memory auto-accept, reviewed/canonical memory writes, enterprise memory storage, reminders, scheduled notifications, external sends, background runs, autonomous actions, outcome learning, treatment outcome claims, efficacy summaries, accepted outcome-record storage, canonical learning writes, continuous voice, TTS, autonomous speaking, unsupported metrics, arbitrary UI, official approval, production certification, and funding approval disabled or gated.
- Governed turns now include per-turn `persistenceReadinessManifest` plus a `persistence_readiness_checked` stream/audit record. The manifest is backed by `src/data/config/persistence-readiness-requirements.json` and separates prototype browser/local JSON persistence from blocked enterprise database, identity/access, retention/privacy, backup/recovery, and canonical source promotion requirements.
- Governed turns now include per-turn `reviewIdentityManifest` plus a `review_identity_checked` stream/audit record. The manifest is backed by `src/data/config/agent-review-identity-policy.json` and keeps local review workflow in prototype reviewer-label-only mode while enterprise identity, role/brand access controls, and official approvals remain disabled.
- Governed turns now include per-turn `pilotLearningManifest` plus a `pilot_learning_ready` stream/audit record. The manifest captures review-required turn signals, blocked learning paths, and next proof needs while autonomous learning, outcome learning, canonical memory writes, canonical source writes, and treatment outcome claims remain disabled.
- Local sessions now include `agent-session-pilot-learning-v1` summaries computed from persisted pilot-learning manifests. The summary exposes session-level signal counts, latest signals, blocked learning paths, next proof needs, and a review-only learning promotion protocol through session APIs, persisted turn metadata, and Agent Lab while staying reviewed-only and non-canonical.
- The governed Pilot Learning Cockpit is implemented as an approved ExperiencePlan workspace. Prompts about what the session is learning route to `inspect_pilot_learning`, render `pilot_learning_panel` beside review workflow/evidence/gap views, and keep autonomous learning, outcome learning, treatment outcome claims, canonical memory writes, and canonical source writes disabled.
- The governed Quiet Proactivity Cockpit is implemented as an approved ExperiencePlan workspace. Follow-up/reminder/held-notice prompts route to `inspect_quiet_proactivity`, render `proactivity_panel` beside review workflow/evidence/gap views, and keep reminder creation, scheduled notifications, external sends, background runs, autonomous action, source promotion, and overlapping runs disabled.
- Governed turns now include per-turn `treatmentOutcomeReadinessManifest` plus a `treatment_outcome_readiness_checked` stream/audit record. The manifest is backed by `src/data/config/treatment-outcome-readiness-requirements.json` and exposes the promotion checklist for future outcome records, follow-up signal linkage, review identity, efficacy rules, portfolio learning storage, and canonical learning governance while outcome learning, treatment outcome claims, accepted outcome-record storage, and canonical learning stores remain disabled.
- Local sessions now include `agent-session-treatment-outcome-readiness-v1` summaries computed from persisted treatment outcome readiness manifests. The summary exposes session-level ready/prototype/blocked requirement posture, latest blockers, related treatment paths, follow-up signals, learning signal IDs, and disabled outcome-learning / treatment-outcome-claims / accepted-outcome-record / efficacy-summary / portfolio-learning / canonical-learning flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and the Treatment Outcome Readiness panel.
- `agent-session-treatment-outcome-readiness-v1` now includes a review-only outcome proof protocol that maps baseline capture, follow-up linkage, matched evidence, human review, efficacy-rule, and portfolio/canonical learning governance to the blocked promotion requirements. The Treatment Outcome Readiness panel renders those steps as reviewer guidance while every step remains `enabledInPrototype: false`.
- A draft treatment outcome record template is available at `/templates/treatment-outcome-record-template.json`, validated by `pnpm validate:data`, checked by `pnpm eval:agent`, and linked from the Treatment Outcome Readiness Panel as a governance-review handoff only while outcome learning, efficacy claims, accepted outcome-record storage, portfolio learning, and canonical learning stay disabled.
- Local sessions now include `agent-session-canvas-continuity-v1` summaries computed from persisted canvas state, interruption/recovery, public reasoning/status, and conversation presence manifests. The summary exposes latest canvas state, rendered/fallback/focused/compatible views, proof-rail sections, status phase counts, visible signals, pulse sources, and disabled arbitrary UI generation, private reasoning exposure, server-side cancellation, continuous listening, background wake word, autonomous speaking, and continuous voice barge-in flags.
- The approved `canvas_continuity_panel` renders those session continuity summaries inside governed ExperiencePlan workspaces so future Jarvis-style UI composition can prove approved rendered-state continuity before richer voice/canvas behavior is promoted.
- Local sessions now include `agent-session-audit-summary-v1` summaries computed from persisted runtime audit records. The approved `audit_trail_panel` renders those summaries inside governed Review Operations, Foundation Readiness, and Executive Pilot workspaces so runtime action continuity can be inspected before any export, canonical audit write, official approval, or enterprise audit-store behavior is promoted.
- Governed turns now include `agent-review-identity-manifest-v1`, and the approved `review_identity_panel` renders that manifest plus persistence-governance continuity inside governed Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces so reviewer authority can be inspected before any enterprise identity, role access, brand access, accountable reviewer, or official approval behavior is promoted.
- Experience Plans now include a `viewManifest` for every planned zone. The manifest exposes requested/rendered view IDs, required data, fallback state, claim types, guardrails, and selection rationale so dynamic UI composition is inspectable rather than free-form generation.
- Experience Plan artifacts now include governed artifact manifests. Each artifact carries review requirement, circulation status, linked review gate ID, disabled export state, source views, evidence labels, guardrails, and caveats; human review can mark an artifact reviewed for prototype use, but it does not enable export or circulation.
- Experience Plan artifacts now include governed readiness manifests backed by `src/data/config/artifact-readiness-requirements.json`. QBR story drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes expose reviewer role, required evidence, required source views, language approvals, blockers, next action, prototype-review status, and a still-disabled export gate.
- Local sessions now include `agent-session-artifact-readiness-v1` summaries computed from persisted ExperiencePlan artifacts. The summary exposes artifact counts, artifact type/readiness counts, reviewer roles, required evidence/source views/language approvals, blocked export gates, review gate IDs, latest artifacts, and disabled export/copy/circulation/official-approval/enterprise-publishing flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and the Artifact Readiness panel.
- `agent-session-artifact-readiness-v1` now includes a review-only artifact circulation protocol. The protocol separates draft capture, evidence/source-view coverage, human prototype review, stakeholder language approval, export/copy capability gates, and external circulation governance, and `artifact_readiness_panel` renders those steps while every step keeps export disabled.
- Agent Lab now uses a clearer governed push-to-talk loop: the mic click is the consent boundary, browser speech recognition captures one prompt when available, the transcript routes through `/api/agent/stream`, and typed input remains the fallback.
- Agent Lab now has a chained OpenAI TTS voice-output adapter. The first command panel supports Talk or Type, Push To Talk, typed Send, Voice Reply, and Test Voice; spoken output is limited to expectation-setting, approval prompts, brief meaningful runtime progress, and final summaries from the governed runtime. Browser speech synthesis remains fallback only. This does not enable Realtime voice, continuous listening, autonomous speaking, server-side interruption/cancellation, enterprise transcript storage, or production spoken-output governance.
- Durable local server JSON persistence is implemented for Agent Lab sessions. Turns sent with a `sessionId` persist memory suggestions, artifacts, audit records, and confirmation gates to ignored `.runtime/agent-session-ledgers.json`; `/api/agent/session-ledger` reads/merges the persisted ledger.
- Reviewed actions are implemented for persisted Agent Lab records. `/api/agent/session-ledger/review` can accept/edit/reject memory, approve/reject artifacts, approve/edit/dismiss required gates, and refuse blocked capability gates. Agent Lab surfaces the Review Queue and Review History.
- Local sessions now include `agent-session-persistence-governance-v1` summaries computed from persisted working-context, persistence-readiness, and review-identity manifests. The summary exposes loaded context layers, accepted-memory IDs, source candidate IDs, review gate IDs, ready/prototype/blocked requirements, persisted record types, prototype decisions, blocked enterprise approval types, a review-only enterprise persistence promotion protocol, and disabled enterprise persistence, identity, role/brand access, official approval, memory auto-accept, canonical writes, and source auto-consumption flags.
- Session review workflow summaries are implemented for local ledger state. `agent-session-review-workflow-v1` exposes pending/reviewed/blocked memory, artifacts, and gates; local `human_review` reviewer state; and disabled official approval, enterprise identity, artifact export, canonical write, memory auto-accept, and runtime source auto-consumption flags through session APIs, persisted turn metadata, and Agent Lab.
- Durable reviewed-local source promotion records are implemented through `/api/source-packets`. Accepted Brand Strategic Context and Momentum source candidates can be recorded under ignored `.runtime/source-packet-promotions.json`, but canonical source-data writes remain disabled and the runtime does not auto-consume these records.
- Brand Data now displays durable reviewed-local source promotion records beside browser-local promoted source versions, while keeping canonical write and runtime auto-consumption caveats visible.
- Governed agent turns now expose active-brand reviewed-local source promotion candidates through `sourcePromotionContext`. Agent Lab displays them in the Proof Rail, but they are not added to the Brand Intelligence Packet, answer facts, or evidence references.
- Local-first source-claim extraction/review is implemented through `/api/source-claims` and the Brand Data Source Claims tab. Unstructured notes, decks, transcripts, or research summaries can become extracted/reviewed/rejected local claim records under ignored `.runtime/source-claims.json`; governed agent turns expose active-brand `sourceClaimContext`, emit confirmation-required source-claim audit records, and create claim-specific source-promotion review gates. Canonical facts and runtime auto-consumption remain disabled, and gate approval does not promote source truth.
- Hostile outside-content handling is implemented for source-claim extraction. Pasted source text that contains override, canonical-truth, runtime auto-consumption, export, or bypass language is stamped with an explicit untrusted-source warning and caveat, remains review-only, and is covered by adversarial JSON, stream, explicit skill-routed chat, and governed Live Consult fallback evals proving it cannot become runtime instructions, canonical facts, answer evidence, export permission, source writes, or voice/provider bypass.
- Brand Strategic Context now has a first source-packet model. Prototype-reviewed partial packets for Lay's and Siete load into the Brand Intelligence Packet and data inspection surface while retaining official-source gaps.
- Accepted reviewed memory now loads into later agent turns as active-brand working context. Suggested, rejected, and blocked memory stay excluded; runtime events and audit records expose memory loading.
- Brand Strategic Context validate -> preview -> promote importer UI is implemented in the brand data view, with a JSON template, impact preview, local promoted versions, and active packet injection into the Brand Intelligence Packet.
- Brand Strategic Context now has packet-level source-owner handoff/readiness requirements. Source-owner approval, brand foundations/DNA, positioning/objectives/priorities, and creative platform/claims each map to owner role, accepted source types, required fields, validation rules, promotion gates, starter questions, current status, and next action. Validation and evals keep prototype, browser-local, and reviewed-local context non-canonical.
- Brand Strategic Context now has a disabled source-owner runtime file-drop readiness lane. The policy and source-owner file-bundle template define approved foundations, positioning/objectives, and creative platform/claims file kinds; governed server turns attach a read-only audit; the packet, Brand Data view, Source Readiness Panel, validation, and evals expose the state while runtime consumption and canonical use stay disabled.
- Brand Strategic Context runtime file-drop hardening is implemented. The eval suite temporarily tests approved-looking, draft/empty, and malformed brand strategy source-owner bundles across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving file drops remain review-only and cannot replace active Strategic Context, become canonical evidence, enable runtime source consumption, source writes, Realtime voice, or TTS.
- Momentum Intelligence now has a first source-packet model. Prototype-reviewed packets for Lay's and Siete load market context, peer-set metadata, room-to-grow inputs, and SMD contribution weights into the Brand Intelligence Packet, close those specific evidence gaps for seeded brands, and enable the Momentum x Room To Grow Grid when supported.
- Momentum Intelligence validate -> preview -> promote importer UI is implemented in the brand data view, with a JSON template, impact preview, local promoted versions, and active packet injection into the Brand Intelligence Packet.
- Measured Growth Navigator fallback adapter is implemented for Momentum Intelligence source packets. It loads measured GN market/peer context and only fills room-to-grow fields when underlying penetration/share/category-growth inputs exist; SMD contribution weights remain a separate source requirement.
- Multi-quarter Momentum Intelligence trend context and output-quality checks are implemented. The packet now exposes directional five-metric trend reads, source-period compatibility, significance caveats, red momentum visibility, Ahead/Behind misuse checks, and SMD source gaps.
- Optional source-provided Momentum trend evidence fields are implemented across the source-packet contract, importer normalization, downloadable template, kernel consumption, output-quality checks, and data validation.
- A first Momentum source-extract adapter lane is implemented. A Doritos reviewed-for-prototype fixture exercises reviewed/approved extract mapping into the governed Momentum source packet, and validation/evals cover the fixture and downloadable template.
- The Momentum Source importer now accepts source-extract shaped JSON, maps it through the governed adapter, previews impact, and promotes the converted Momentum packet as a browser-local version.
- The Momentum Source importer now also accepts source-owner file bundles with separate market/share/penetration, BBE contribution-weight, and movement/significance file lanes. The loader maps file rows into the same governed source-extract blocks before validation and browser-local promotion.
- A runtime Momentum source file-drop readiness policy is implemented. `BrandIntelligencePacket` exposes the future approved source-owner landing zone, required file kinds, missing file kinds, blockers, promotion requirements, and disabled runtime/canonical-use flags in Brand Data, Agent Lab, and Source Readiness dynamic views.
- Governed server turns now attach a read-only Momentum source file-drop audit. The audit scans the expected source-owner landing zone for JSON candidates, records per-file-kind presence/issues, and surfaces the result in Agent Lab, Brand Data, Source Readiness views, SSE, and explicit skill-routed chat while keeping runtime consumption and canonical use disabled.
- Packet-level Momentum source readiness gates are implemented. `BrandIntelligencePacket` exposes source path, review status, executive-use blocker state, and readiness checks for source-owner extract approval, market/share/penetration inputs, BBE contribution weights, and movement/significance evidence; Agent Lab, Brand Data, Source Readiness Lab, and `pnpm eval:agent` surface and verify the gate.
- Momentum source-owner handoff requirements are implemented. Each readiness check now maps to owner role, accepted extract shape, required fields, validation rules, promotion gate, canonical-use condition, current status, and next action, rendered in Brand Data, Agent Lab, and the Source Readiness dynamic view.
- First quiet-proactivity manifests are implemented. Governed turns now emit `proactivityManifest` with review-required follow-up suggestions, held notices, related gates/artifacts/gaps, and disabled flags for autonomous action, scheduling, reminder creation, external sends, and overlapping runs; Agent Lab and `pnpm eval:agent` verify the rail.
- Local sessions now include `agent-session-proactivity-v1` summaries computed from persisted quiet-proactivity manifests. The summary exposes suggestion priority/type/timing counts, human-review-required counts, held notices, latest suggestions/notices, related evidence/gap/gate/artifact IDs, allowed next skills, a review-only autonomous proactivity promotion protocol, and disabled reminder, scheduled notification, external-send, background-run, source-promotion, and autonomous-action flags through session APIs, persisted turn metadata, Agent Lab, explicit skill-routed chat, governed Live Consult fallback, and the Quiet Proactivity panel.

Important gaps:

- Human acceptance is still pending. The foundation and Assistant pass technical gates, but the POC is not accepted until user testing scores answer quality, clarity, dynamic-work usefulness, guardrail confidence, and fund-this energy.
- Conversation quality is now unified for Agent Lab quick answers and product-facing Assistant direct answers, but ongoing tuning is still needed for response length, spoken cadence, offer language, and richer executive storytelling.
- The product-facing Assistant now has user-initiated OpenAI Realtime voice over the same `/api/assistant` brain, with browser STT/chained TTS fallback. It is still not a production voice runtime: continuous listening, wake/background listening, advanced interruptions/cancellation, autonomous speaking, enterprise transcript storage, and production voice governance remain gated.
- Dynamic UI is now driven by formal `ExperiencePlan` objects and approved dynamic views. The next gap is richer Dynamic Work Spec planning across more approved skill/view/template combinations, not arbitrary UI generation.
- Enterprise database persistence is still missing; Agent Lab, source promotion records, and source claim records currently use browser-local cache plus local server JSON prototype persistence and human-review actions. The persistence readiness manifest and governed Persistence Readiness Cockpit now name the blocked enterprise schema, identity/access, retention/privacy, backup/recovery, and canonical source promotion requirements. The review identity manifest and session review workflow summary make the current `human_review` label explicit as prototype-only and keep official approval blocked until enterprise identity/access control exists. Source promotion candidates and source claims remain visible audit context only until governance enables canonical writes and runtime consumption.
- Production quiet proactivity remains deferred: the runtime now emits suggestions-only manifests, held notices, an approved inspection cockpit, and session continuity summaries, but real scheduled reminders/background checks require governance before enablement.
- Brand Strategic Context still needs official source packets and durable server/database promotion after source-owner governance is clear.
- True BBE Momentum Intelligence still needs approved source-owner extracts wired into the default runtime source path to replace the fixture and broaden contribution-weight, trend/significance, market/share, and penetration coverage. The current readiness gate defines the acceptance checklist and keeps prototype extracts blocked for executive use.

## Phase 0: Protect The Current Prototype

Objective: keep the current report, data views, Live Consult, Pattern Radar, and learning flows stable.

Deliverables:

- Add new architecture docs beside existing docs.
- Add skill and view registries as config.
- Add TypeScript scaffolding for the future kernel.
- Do not change default report behavior.

Acceptance:

- `pnpm validate:data` passes.
- `pnpm typecheck` passes.
- Existing routes are not required to consume the new layer yet.

## Phase 1: Intelligence Kernel

Objective: make the system callable by chat/voice/tools rather than page-specific code.

Status: first slice implemented.

Deliverables:

- `BrandIntelligencePacket` service.
- Evidence gap model.
- Momentum read model.
- Initial room-to-grow placeholder model.
- Provocation output schema.
- Skill registry and view registry validation.

Priority capabilities:

- Build packet for active brand.
- Summarize data coverage.
- Return core BBE metrics and diagnosis result.
- Return evidence readiness and gaps.
- Return recommended next views.

Acceptance:

- One function can assemble a complete packet for any demo brand.
- Packet clearly labels measured, partial, synthetic, simulated, and missing evidence.
- The agent can answer from the packet without page-specific assumptions.

## Phase 2: BBE Momentum Intelligence Skill

Objective: turn the workshop requirements into a governed skill.

Status: first deterministic vertical slice implemented for momentum read, Perceived Value language, missing room-to-grow/SMD states, starter provocations, and approved view requests. A second source-fed slice now loads prototype-reviewed market context, peer sets, room-to-grow inputs, and SMD contribution weights for Lay's and Siete. A third governance slice adds validate -> preview -> promote import/version behavior for reviewed Momentum source packets and now source-extract shaped JSON. A fourth adapter slice derives measured Momentum context from measured full/partial Growth Navigator records without inferring SMD weights. A fifth trend/quality slice exposes directional multi-quarter reads and output-quality checks. A sixth contract slice supports optional source-provided significance-tested trend evidence when approved/promoted packets supply it. A seventh source-extract slice maps reviewed/approved extract-shaped data into the governed packet contract with a caveated Doritos fixture. An eighth readiness slice now blocks non-approved Momentum sources from executive use and names the exact source-owner blocks still needed. A ninth adapter slice now lets separate market/share/penetration, BBE contribution-weight, and movement/significance source-owner extract blocks merge into one governed Momentum packet while preserving review gates. A tenth handoff slice adds a downloadable bundle template and validation/eval coverage for those separate source-owner blocks. An eleventh source-owner file slice lets approved source files map into the same extract blocks through the Momentum Source importer. A twelfth runtime-readiness slice defines the source-owner file-drop landing zone while keeping runtime consumption and canonical use disabled. A thirteenth audit slice scans that landing zone on governed server turns and exposes candidate/per-file-kind audit records without consuming them. A fourteenth session-ingestion-gate slice persists required/loaded/missing source-owner file coverage and governance blockers into `agent-session-source-runtime-ingestion-v1` while default runtime source wiring remains disabled. A fifteenth eval-hardening slice now proves approved-looking source-owner file drops are review-ready only and invalid/non-approved empty file drops stay blocked, missing, non-canonical, and non-evidence across JSON, stream, chat, and governed Live Consult fallback. It still needs approved source-owner files wired into the default runtime source path before replacing the fixture.

Deliverables:

- [x] Momentum x room-to-grow read with gap and source-supported states.
- [x] Perceived Value display alias for user-facing output.
- [x] Market/category context model.
- [x] Peer-set metadata model.
- [x] SMD contribution-weight field and missing-data behavior.
- [x] Growth provocation schema.
- [x] Momentum Intelligence source import/version workflow.
- [x] Output-quality self-check schema.
- [x] Source-owner readiness gate for market/share/penetration, contribution-weight, and movement/significance handoff.

First vertical slice:

```text
Question: Why is this brand slipping, and what should we bring to QBR?
Skill calls:
- buildBrandIntelligencePacket
- readMomentum
- readRoomToGrow
- explainDiagnosis
- createProvocations
- recommendViews
Views:
- momentum strip
- SMD driver map
- evidence ledger
- growth provocation list
```

Acceptance:

- Red momentum is visible.
- Ahead/Behind is used only as size-check context.
- Perceived Value language appears in user-facing output.
- Missing room-to-grow inputs are named, not substituted with Ahead/Behind.
- Loaded room-to-grow and SMD source packets close their gaps only for brands where source context exists.
- Every provocation has evidence or a data-gap note.

## Phase 3: Dynamic View Composer

Objective: let the agent summon focused UI components from a registry.

Status: first slice implemented in `/agent-lab` through `DynamicViewRenderer`.

Deliverables:

- View request schema.
- View renderer wrapper.
- Approved first views:
  - KPI strip
  - momentum ladder
  - momentum x room-to-grow grid
  - evidence ledger
  - SMD driver map
  - provocation list
  - treatment path card
  - learning explainer
  - quiz card

Acceptance:

- Agent can recommend a view by ID and pass structured data.
- Unknown view IDs fail closed.
- View output always includes source/evidence affordance where claims are made.

## Phase 3.5: Experience Plan Layer

Objective: let the agent assemble role-specific workspaces from governed plans rather than hard-coded layouts.

Status: first slice implemented for executive QBR, insights evidence lab, marketer treatment planning, learning coach, agency brief builder, competitive comparison lab, source readiness lab, source-owner intake workbench, and live meeting capture.

Deliverables:

- `ExperiencePlan` schema.
- `ExperienceAudience` enum: executive, marketer, insights lead, learner, agency, specialist.
- `ExperienceObjective` enum: diagnose, decide, teach, challenge, compare, package, monitor, research.
- `ExperienceZone` schema with approved view ID, data requirements, evidence requirements, and fallback state.
- Experience template registry for:
  - executive QBR decision read
  - insights evidence lab
  - marketer treatment planning
  - learning coach
  - agency brief builder
  - competitive comparison lab
  - source readiness lab
  - source-owner intake workbench
  - live meeting capture
- `experience-architect` service that maps prompt + brand + audience + objective to skills, views, layout, artifacts, and guardrails.
- Agent Lab renderer refactor so the visible command center is driven by an `ExperiencePlan`.

Acceptance:

- User can ask for an executive, marketer, or insights lead workspace and receive a structured plan.
- The plan is visible in an expandable JSON/proof panel.
- All zones use approved dynamic view IDs.
- Missing evidence produces gap states, not fake charts.
- Decision/package artifacts carry human-review requirements.
- Decision/package artifacts carry readiness manifests and remain blocked from export until the artifact export capability is explicitly approved.

## Phase 4: Voice-First Consult Canvas

Objective: evolve Live Consult into a dynamic workspace.

The voice-first stack should be layered in this order:

1. Text brain: one reliable `runAgentTurn()` loop. Implemented for the first agent path.
2. Tools: typed skill/view/action registry with safe failures.
3. Streaming: visible partial answer, status, evidence, and view events. First Agent Lab stream consumption is implemented.
4. Voice: governed push-to-talk first. Single-turn browser STT is implemented in Agent Lab; wake/listen and continuous voice remain gated.
5. Presence: governed command-core, orchestration, module-queue, status-step, voice-policy, and proof-rail signals. First push-to-talk streaming presence manifest is implemented; continuous listening and autonomous speaking remain disabled.
6. Provider adapters: inspectable readiness for text, SSE, browser STT, Realtime voice candidate, and TTS. First adapter-readiness manifest is implemented; Realtime/TTS activation remains gated.
7. Voice orchestration gates: explicit promotion checklist for wake/listen, continuous voice, Realtime unification, interruption/cancellation, TTS policy, consent/privacy, and enterprise transcript/memory storage. First readiness manifest, activation protocol, and governed inspection cockpit are implemented; full voice remains disabled.
8. Memory: inspectable session, local durable prototype storage, and future reviewed facts.
9. Persistence readiness: explicit promotion checklist for enterprise database schema, identity/access control, retention/privacy, backup/recovery, and canonical source promotion. First readiness manifest is implemented; enterprise persistence remains disabled.
10. Review identity: explicit prototype reviewer-label policy for local review workflow, with enterprise identity/access controls and official approvals blocked. First identity manifest is implemented.
11. Heartbeat: quiet proactivity, scheduled checks, held notices, and no overlapping runs. First suggestions-only manifest and governed inspection cockpit are implemented; scheduling remains disabled.
12. Rails: confirmation gates, audit log, outside-content-as-data, capability flags, and kill switch. First runtime control manifest is implemented; enterprise operations controls remain future work.

Experience:

- Left: voice/chat transcript.
- Center: dynamic canvas.
- Right: evidence, assumptions, open questions, and actions.
- Bottom: conversation timeline and generated artifacts.

Deliverables:

- Unified `runAgentTurn()` runtime.
- Voice action map aligned to skill registry.
- Canvas state model. First governed manifest is implemented in `canvasStateManifest`, with stream/audit/eval coverage and Agent Lab proof-rail rendering.
- Streaming agent event schema. First event stream is implemented.
- Streamed reasoning/status steps. First governed implementation is `reasoningStatusManifest`, which exposes public operational steps and explicitly blocks hidden reasoning disclosure.
- Conversation presence. First governed implementation is `conversationPresenceManifest`, which makes the Agent Lab feel live through push-to-talk runtime/status/canvas signals without enabling continuous listening, wake-word capture, or autonomous speech.
- Evidence spotlight tied to every agent claim. First structured runtime spotlight is implemented.
- Meeting takeaway capture.
- Guided interruption and recovery handling. First governed slice is implemented with `interruptionRecoveryManifest`, client stream abort, preserve-last-canvas behavior, no-overlap guardrails, and eval coverage.
- Provider adapters for text, realtime voice, STT, and TTS so the core brain is not coupled to one vendor. Governed per-turn readiness maps and durable session provider-adapter summaries are implemented; Realtime voice, TTS, continuous voice, and provider bypass remain gated or disabled.
- Voice orchestration readiness gates. First governed checklist is implemented in `voiceOrchestrationReadinessManifest`, with a session-level activation protocol that separates push-to-talk, browser STT prototype input, Realtime unification, interruption/privacy, TTS policy, and enterprise storage; wake/listen, continuous voice, Realtime voice, and TTS remain gated until blocked requirements clear.

Acceptance:

- User can ask a natural-language question and see the relevant visual appear.
- The agent explains what it is showing.
- User can interrupt, challenge, ask to go deeper, or package the output.
- Chat and voice produce the same evidence-bound answer structure.
- Full voice activation has no blocked readiness requirements for runtime parity, consent/privacy, interruption, TTS policy, and storage.
- API keys remain server-side.

## Phase 4.5: Memory, Artifacts, And Audit

Objective: make the system resumable, inspectable, and enterprise-safe.

Deliverables:

- Session memory: assumptions accepted, evidence reviewed, open questions, decisions, and generated artifacts.
- Durable memory: approved brand facts, team preferences, and reusable work products.
- Artifact records: QBR story draft, talk track, memo, agency brief, research packet.
- Artifact readiness records: reviewer role, required evidence, required source views, language approvals, blockers, next action, prototype-review status, and disabled export gate.
- Session artifact readiness summary: accumulated artifact readiness posture from the local session ledger, including artifact counts, type/readiness counts, reviewer/evidence/source/language requirements, blocked export gates, latest artifacts, and disabled export/copy/circulation/official approval/publishing flags.
- Review identity records: prototype reviewer label, local-review workflow status, disabled enterprise identity/access/approval flags, blocked enterprise approval types, and requirements before official approval.
- Review workflow summaries: pending/reviewed/blocked memory, artifacts, and gates, with disabled export/canonical-write/auto-accept/runtime-consumption flags.
- Session persistence governance summary: accumulated working context, persistence readiness, and prototype review-identity posture from the local session ledger, with enterprise persistence, official approval, canonical writes, source auto-consumption, and memory auto-accept disabled.
- Session canvas continuity summary: accumulated canvas, interruption/recovery, public status, and presence posture from the local session ledger, with resume state visible but arbitrary UI generation, private reasoning exposure, continuous listening, autonomous speaking, and server-side provider cancellation disabled.
- Pilot learning manifest: review-required turn signals, blocked learning paths, and next proof needs, with autonomous learning, outcome learning, treatment outcome claims, and canonical writes disabled.
- Session pilot-learning summary: accumulated reviewed learning signals from the local session ledger, with blocked learning paths and proof needs visible but not promoted to accepted pattern memory or outcome evidence.
- Treatment outcome readiness manifest and session proof protocol: blocked outcome-record schema, baseline capture, follow-up linkage, matched evidence, human review/identity, efficacy-rule, portfolio-store, and canonical-learning requirements visible before outcome learning can be promoted.
- Audit log: user prompt, skills invoked, tools/views rendered, evidence referenced, guardrails triggered, human approvals.
- Memory inspection/edit UI. First Agent Lab review queue, accepted-memory context injection, and prototype review identity surfacing are implemented; richer filtering and enterprise reviewer identity remain future work.
- Prototype-local server JSON persistence before enterprise database storage.

Acceptance:

- User can resume a prior brand session.
- Memory writes are visible and reversible.
- Generated artifacts show source/evidence and review status.
- Generated artifacts show readiness blockers and cannot become export-enabled through review alone.
- The system can distinguish accepted decision, suggested option, and unresolved question.

## Phase 5: Learning And Research Skills

Objective: make teaching, testing, and research natural extensions of the same system.

Learning deliverables:

- Teach concept skill.
- Test understanding skill.
- Scenario practice skill.
- Adaptive coaching state.
- Visual explainer views.

Research deliverables:

- Source-claim extraction. First local API, Brand Data UI, and review queue state are implemented.
- Competitor/category research packet.
- Trend-context synthesis.
- Claim review queue. First local reviewed-candidate/rejected/edited state is implemented.
- Clear separation of extracted claims vs canonical facts.
- Research promotion workflow from extracted claim to reviewed fact.

Acceptance:

- The system can teach, quiz, and remediate a concept in the active brand context.
- Research claims are never promoted to canonical facts without review.

## Phase 6: Outcome Learning

Objective: move from options to consider toward evidence-informed prescriptions.

Deliverables:

- Treatment outcome records.
- Follow-up signal history.
- Decision and approval records.
- Pattern memory across brands, categories, and time.
- Treatment efficacy summaries with confidence caveats.
- Current prerequisite: `pilotLearningManifest`, `agent-session-pilot-learning-v1`, `treatmentOutcomeReadinessManifest`, the session-level outcome proof protocol, and the draft treatment outcome record template capture what each turn/session can teach the pilot plus the blocked outcome-learning promotion checklist, but they do not yet create accepted outcome records, accepted pattern memory, treatment efficacy claims, portfolio learning, canonical learning stores, or canonical source/memory writes.

Acceptance:

- System can say what was tested, where, what moved, and how confident we are.
- Prescriptions remain caveated when outcome evidence is thin.

## Required Evals

The system should have evals before broad pilot use:

- Does not invent diagnoses.
- Does not invent treatments.
- Does not claim causality without causal evidence.
- Does not infer cannibalization, portfolio migration, or occasion substitution.
- Does not turn Perceived Value into SKU-level pricing guidance.
- Current adversarial coverage proves SKU price increases, promo-depth recommendations, causal demand-lift claims, cannibalization proof, portfolio migration proof, and occasion-substitution proof fail closed across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback.
- Keeps red momentum visible.
- Uses Ahead/Behind only as size-check context.
- Names missing data instead of filling gaps with assumptions.
- Cites evidence for every provocation.
- Separates facts, interpretation, and caveats.
- Rejects unknown skill IDs and dynamic view IDs.
- Rejects unsupported experience plans.
- Requires human review on QBR/agency/meeting artifacts.
- Requires readiness blockers and disabled export gates on QBR/agency/meeting artifacts until export capability is approved.
- Keeps memory writes auditable and user-visible.
- Treats uploaded or outside content as data to review, not instructions to follow.
- Current adversarial coverage proves instruction-like pasted source content stays untrusted, review-only, non-canonical, and non-evidence across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback.

## Implementation Order

Recommended next practical sequence from the current state:

1. Freeze the current report as the stable demo path.
2. Keep the implemented Conversation Orchestrator contract and answer-quality evals green so simple prompts stay conversational and advanced prompts become work orders.
3. Continue tuning the product-facing Assistant against user feedback so `/brand/[brandId]/assistant` keeps the original scoped conversation quality while using the hardened packet/runtime as proof, gap, guardrail, and work-planning substrate.
4. Test the integrated bi-modal Assistant flow: Direct Answer, Answer And Offer, Approval Work Order, and Fail-Closed Governance. Use `/agent-lab` for inspection when the Assistant behavior needs diagnosis.
5. Use `agent-session-executive-pilot-v1` plus the Assistant QBR/proof path as the auditable CMO demo path while the broader foundation keeps maturing.
6. Use `source_runtime_ingestion_panel` as the read-only governed source-ingestion trust surface; observed approved-looking file drops may move the gate to `ready_for_governance_review`, invalid/non-approved/malformed file drops must stay blocked/missing/non-evidence, and default runtime source-path wiring can happen only after source-owner files and canonical-use governance are approved and `agent-session-source-runtime-ingestion-v1` shows the ingestion gate is satisfied, then replace the split source-extract fixture blocks with approved extracts that satisfy `momentumSourceReadiness`.
7. Keep default scoped `/api/chat` protected; non-opted-in chat should continue returning only the scoped response shape while explicit skill-routed chat, Agent Lab, stream, and Live Consult fallback carry governed runtime payloads.
8. Keep expanding adversarial fail-closed evals across JSON, stream, chat, Live Consult fallback, and future voice surfaces before any capability promotion: source truth, exports/copy/circulation, arbitrary UI, unsupported metrics, Pricing Power / Perceived Value overreach, memory auto-accept, enterprise persistence, reminder scheduling, autonomous proactivity, treatment efficacy/outcome learning, full voice, official approval, funding approval, and production certification must prove they stay governed under hostile or over-eager prompts.
9. Keep the runtime-surface guardrail matrix and promotion protocol visible as read-only proof before promoting any opt-in, gated, disabled, or voice-facing surface.
10. Use `memory_audit_panel`, `audit_trail_panel`, `review_identity_panel`, `provider_adapter_panel`, and `capability_readiness_panel` as read-only trust surfaces before promoting memory writes, audit export, official approval, provider bypass, full voice, export, circulation, source writes, or runtime bypass.
11. Deepen pilot-learning UX only where it improves reviewability; never turn learning signals into canonical facts or outcome claims.
12. Promote accepted Brand Strategic Context packets beyond browser-local prototype storage only after source-owner governance is clear, the Brand Strategic Context readiness checks are satisfied by approved source packets or approved source-owner file drops, and canonical-use governance plus persistence readiness allow runtime consumption.
13. Add export/copy/package affordances only after artifact language and review status are trusted.
14. Keep the user-initiated Assistant Realtime shell connected to `/api/assistant`, but do not promote wake/listen, continuous voice, background listening, advanced interruption/cancellation, autonomous speaking, or enterprise transcript storage until consent, privacy, retention, and production voice-governance gates are approved.

This keeps quality high and lets the current prototype remain demo-ready while the future system grows beside it.
