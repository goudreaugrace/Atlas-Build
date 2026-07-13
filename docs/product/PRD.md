# PRD — BBE Brand Doctor

## 1. Executive summary

BBE Brand Doctor is a brand equity diagnostic and intelligence system for PepsiCo brand managers and insights leads. It helps a user find a brand, understand its current brand equity health, believe the diagnosis, interrogate the data, review treatment options from a governed recommendation library, and prepare evidence-backed decisions.

The system is deliberately brand-first. It is not a dashboard, a generic chatbot, a two-brand exercise tool, or an AIM OS implementation. It is the diagnostic and work-output core that those future experiences can automate or call into later.

Better Brand Equity remains the center of gravity. Connected systems such as Growth Navigator, Mental Availability / Category Entry Points, distinctive assets, physical availability, machine availability, and AI-assisted conversation exist to explain the BBE pattern, expose missing evidence, and guide better marketing action. They should not be presented as a replacement for BBE or as a competing master framework.

The expanded product direction is a governed Brand Growth Intelligence foundation: a stable brain of data, knowledge, rules, evidence, skills, views, memory, and guardrails that can support many flexible surfaces. The product IA is now **one brand home, one intelligence agent, many durable outputs**. The next generation should let the agent assemble the right workspace for the user and decision, such as an executive QBR cockpit, marketer treatment plan, insights evidence lab, learning coach, or agency brief builder, then keep that work as a URL-addressable Brand Work Item.

The interaction model must stay bi-modal. Simple questions should feel like the original Brand Doctor conversation: fast, smart, human, synthesized, and grounded. Heavier asks should become orchestrated work: approved skills, ExperiencePlans, dynamic views, artifacts, proof, review gates, memory, and audit. The governed foundation should make the answers more trustworthy, not make every answer sound like a runtime report.

The agent must also know its own reality. It should be able to introduce itself like an expert in the room, explain what it can do today, what is a prototype governed workspace, and what remains gated. It should disclose loaded source period for "latest/current" asks, describe executive outputs as review drafts unless official approval exists, keep export/circulation gated, and name missing-evidence categories when users ask beyond the loaded packet.

## 2. Problem

Current BBE deep dives and reports are too difficult for business users to interpret and too labor-intensive for analysts to synthesize. The BBE Next work identifies a need to move from inconsistent, siloed deep dives with limited Growth Navigator linkage toward standardized, insight-driven, GN-aligned brand reviews focused on clear growth priorities.

The deeper problem is belief. If brand teams do not understand and trust the diagnosis, they will not act on the prescription.

## 3. Product thesis

> Find your brand. Understand its equity health. Believe the diagnosis. Choose the right treatment path. Package the decision with proof.

## 4. Primary users

### Brand Manager

Needs a clear, simple, plain-English read:
- What condition is my brand in?
- Why does it matter?
- What should I consider doing?
- What are the tradeoffs?
- What should I watch next?

### Insights Lead

Needs an evidence-backed, interrogable read:
- What evidence supports the diagnosis?
- What benchmark is being used?
- Which rules fired?
- What contradicts the read?
- What assumptions were made?
- What should not be concluded?
- How can the diagnosis or treatment library be improved?

### Executive / CMO Sponsor

Needs a fast, high-confidence decision read:
- What is the business-relevant verdict?
- What changed, what matters, and what should we not overclaim?
- What evidence should I trust?
- What decision, test, or resource conversation does this unlock?
- What should be packaged for QBR, BGS, AOP, or agency direction?

## 5. Core user journey

```text
Solution Home
→ Brand Home
→ Diagnostic Report or Jarvis Interaction
→ Direct Answer or Approved Work Request
→ Durable Work Item
→ Evidence / Data / Review Gates
```

## 6. Jobs to be done

### JTBD 1 — Understand current brand health

When I own a brand or support a brand team, I want to quickly understand the brand’s current BBE health so that I know what condition we are dealing with.

### JTBD 2 — Believe the diagnosis

When the system tells me the brand has an ailment, I want to see why it reached that conclusion so that I trust the diagnosis enough to act.

The agent foundation must also show what source context was reviewed across the session. Session source-governance summaries can expose reviewed-local source candidates, extracted claims, runtime file-drop posture, blockers, and next governance steps, but they must not convert those candidates into canonical facts or runtime evidence without approved source-owner governance. Session runtime source-ingestion summaries must expose required/loaded/missing source-owner file kinds and governance blockers before any default runtime source path can be wired.

The agent foundation must also show which governed runtime surfaces produced session work. Session runtime-surface summaries can expose active surface usage, opt-in/legacy/gated posture, streaming and push-to-talk state, and blocked full-voice/export/source-write capabilities before any premium dynamic UI or voice experience is promoted.

The agent foundation must also show promotion readiness and memory trust inside governed workspaces. The approved `promotion_gate_panel` should make CMO-demo readiness, pilot-review readiness, production blockers, enabled demo rails, next pilot steps, and funding rationale visible in Foundation Readiness and Executive Pilot experiences without certifying production readiness or enabling gated capabilities. The approved `memory_audit_panel` should make accepted working context, memory review gates, review decisions, audit coverage, and disabled memory-write/enterprise-store paths visible in Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot experiences without accepting or promoting memory.

The agent foundation must also show which governed workspace architecture was composed across the session. Session experience-architecture summaries can expose approved template, audience, objective, layout, rendered-view, fallback-view, and blocker history before any role-specific or Jarvis-style interface claims dynamic UI readiness.

The agent foundation must also show whether the dynamic canvas stayed continuous and governed across the session. Session canvas-continuity summaries and the approved `canvas_continuity_panel` should expose approved rendered views, fallback/focus state, proof rails, public status phases, presence signals, interruption recovery, and disabled arbitrary UI/private reasoning/server-cancel/continuous-voice paths before any Jarvis-style UI is promoted.

The agent foundation must also show what the runtime actually logged before any promotion decision. Session audit summaries and the approved `audit_trail_panel` should expose lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit coverage while audit export, canonical audit writes, official approval, and enterprise audit storage remain disabled.

The agent foundation must also show who can review what, and what that review does not prove. The approved `review_identity_panel` should expose the prototype `human_review` label, local-review limits, reviewable item types, related gates/review records, blocked enterprise approval types, required identity/access steps, and disabled enterprise identity, role access, brand access, accountable reviewer, and official approval paths.

The agent foundation must also show the provider substrate before any Jarvis-style voice or provider activation is promoted. The approved `provider_adapter_panel` should expose ready text/SSE runtime paths, browser speech-to-text prototype input, Realtime candidate gates, TTS disabled state, policy-review needs, voice contract posture, and provider-bypass blockers inside Voice Readiness, Runtime Governance, Foundation Readiness, and Executive Pilot workspaces.

The agent foundation must also show disabled capability posture before any risky action is promoted. The approved `capability_readiness_panel` should expose disabled high/medium-risk capabilities, blocked confirmation gates, admin override requirements, review gates, runtime-control posture, and hard-disabled export, circulation, memory-write, source-write, source-promotion, external-ingest, continuous-voice, and runtime-bypass paths.

The agent foundation must also show voice readiness as accumulated promotion evidence. Session voice-readiness summaries can expose ready, prototype-ready, and blocked requirements for consent/privacy, Realtime parity, interruption/cancellation, TTS policy, and enterprise transcript/memory storage before any wake/listen or continuous voice experience is promoted.

### JTBD 3 — Interrogate the data

When I do not understand a metric or visual, I want to ask questions in natural language so that I can learn the meaning without reading a 160-page deck.

The default interaction should answer in human strategy language before exposing machinery. For example, "tell me about Lay's momentum" should produce a concise strategic read, with proof and deeper workspace offers available nearby. It should not lead with source file-drop status, canonical-use blockers, or internal runtime language unless the user asks for source readiness, proof, or governance.

### JTBD 4 — Choose a treatment path

When I understand the diagnosis, I want to compare treatment options, tradeoffs, owners, cost, time, and likely impact so that I can decide what path to take with my cross-functional team.

### JTBD 5 — Improve the system over time

When experts refine the diagnostic logic or add new treatments, I want that knowledge to be added to the system without rebuilding the app.

### JTBD 6 — Assemble the right workspace

When I have a specific role, meeting, or decision need, I want the system to assemble the right evidence, views, caveats, and artifacts so that I do not have to translate a static report into my own working room.

The system should recognize when a question is no longer simple Q&A. If the user asks to build a QBR, dashboard, evidence pack, treatment plan, comparison, agency brief, or meeting artifact, the assistant should shift from conversational answer mode into orchestrated work mode, explain the scope, request approval when needed, and then render approved views/artifacts with visible proof and gates.

### JTBD 7 — Revisit generated work

When the agent creates useful work for a brand, I want that work to live somewhere I can return to, share internally, inspect for proof, and continue discussing so that the value does not disappear when the conversation ends.

### JTBD 8 — Trust what the agent can and cannot do

When the assistant describes itself, gives a current read, or offers to build work, I want it to be inspiring but precise so that I understand what is available today, what is a prototype review draft, and what is still gated before funding, source-owner approval, enterprise persistence, or official export/circulation.

## 7. In scope for prototype

- Single-brand selector.
- Brand Health Record.
- BBE metric panel: Demand Power, Perceived Value, Salient, Meaningful, Different, BrandZ typology, PowerShare, Perceived Value source grid.
- Benchmark interpretation: vs category, Ahead, Momentum.
- Diagnosis engine from config rules.
- Treatment library and diagnosis-treatment links.
- Evidence drawer.
- Dialog with data scoped to active brand and active visual.
- Brand Manager and Insights Lead modes.
- Growth Navigator bridge where available.
- Mental Availability / Category Entry Point evidence where available, clearly labeled as measured, inferred, simulated, or missing.
- Executive summary as a one-page decision brief with compact Evidence Readiness / evidence-basis transparency.
- Detailed Evidence Readiness and missing-data transparency in deeper evidence, data, and Insights Lead contexts.
- Follow-up signal plan.
- Brand data explorer with read-only Brand Intelligence Packet inspection.
- Product-facing Brand Assistant that unifies typed chat, user-initiated voice, direct strategic answers, proof disclosure, approval-gated governed work, and dynamic work-canvas rendering.
- Agent Reality Boundary foundation through `assistant-reality-boundaries-v1`, giving the assistant reusable product truth for available/prototype/gated capability buckets, loaded-source-period disclosure, CMO-review draft language, export/circulation gates, and missing-evidence categories.
- Global solution home that explains the product, exposes brand/portfolio/learning entry points, and lets users start from a brand.
- Brand command home at `/brand/[brandId]` that summarizes the current read, exposes brand-level paths, and links to recent or starter work.
- Preserved traditional diagnostic report at `/brand/[brandId]/report`.
- Brand work shelf at `/brand/[brandId]/work` and focused work detail routes at `/brand/[brandId]/work/[workId]` for URL-addressable governed outputs.
- Dynamic Assistant self-knowledge based on actual capability, skill, view, runtime, data-coverage, and voice-readiness manifests.
- Governed agent skill registry and dynamic view registry.
- First dynamic Agent Lab / Brand Growth Command Center slice.
- Deterministic agent router for evidence-bound answers, momentum reads, growth provocations, treatment prompts, and QBR story draft artifacts.
- Optional skill-routed `/api/chat` path that returns the full governed runtime payload and persists to the durable local session ledger when `sessionId` is supplied, while preserving the existing scoped chat default.
- Default-off governed-runtime controls on the report Dialog With Data sidecar and standalone brand conversation page, using stable brand-specific session IDs, governed source markers, and compact proof strips for persistence, quality checks, gates, prototype review identity, evidence coverage, and approved views.
- Default-off governed fallback mode for Live Consult browser/demo prompts, using the same governed runtime proof rails while Realtime voice, continuous listening, and TTS remain gated.
- Governed runtime surface registry and Agent Lab Runtime Surface Map covering governed defaults, opt-in surfaces, scoped legacy fallback, gated Realtime/full-voice candidates, and disabled TTS.
- Experience Plan view manifests that explain each dynamic workspace zone, including requested/rendered views, data dependencies, fallback status, guardrails, and selection rationale.
- Governed artifact manifests for generated/planned QBR, talk track, agency, evidence, learning, and decision artifacts, with evidence labels, source views, guardrails, review gates, circulation state, and export disabled.
- Governed artifact readiness manifests for QBR story drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes, with reviewer role, required evidence/source views, language approvals, blockers, next action, prototype-review status, and export still blocked by capability gate.
- Claim-level evidence spotlighting for governed agent answers, including proof/gap/guardrail mapping in runtime output, Agent Lab, and approved ExperiencePlan workspaces through `evidence_spotlight_panel`.
- Canvas continuity inspection for governed agent turns, including approved rendered/fallback/focused/compatible views, proof rails, public status phases, presence signals, interruption recovery, and disabled arbitrary UI/private reasoning/server-cancel/continuous-voice flags through `canvas_continuity_panel`.
- Runtime audit inspection for governed agent turns, including lifecycle/evidence/view/artifact/memory/source-governance/runtime-quality coverage, latest records, action counts, confirmation-required records, and disabled audit export/canonical-write/enterprise-store flags through `audit_trail_panel`.
- Review identity inspection for governed agent turns, including prototype reviewer-label limits, reviewable item types, related gates/review records, blocked enterprise approval types, required identity/access steps, and disabled enterprise identity/role access/brand access/official approval paths through `review_identity_panel`.
- Runtime quality checks for every governed turn, covering approved templates/views, evidence attachment, source non-canonical state, artifact gates/export disabled, memory review control, continuous voice disabled, and unsafe-language scan.
- Working context manifests for every governed turn, exposing accepted memory, suggested-memory count, reviewed-local source candidates, extracted source claims, review gates, and disabled auto-promote/canonical-write flags.
- Source governance manifests for every governed turn, exposing reviewed-local source candidates, extracted source claims, Momentum source readiness, runtime file-drop audit posture, source review gates, and disabled canonical source writes, canonical claim facts, runtime source auto-consumption, source-claim promotion, and source-data writes.
- Session runtime source-ingestion summaries through `agent-session-source-runtime-ingestion-v1`, exposing source-owner file coverage, missing file kinds, governance blockers, next ingestion step, and disabled default runtime source wiring / canonical use / runtime auto-consumption / file-drop consumption / source-data writes.
- Governed Source Runtime Ingestion workspaces, rendering that source-ingestion gate through an approved dynamic view before any source-owner files can become canonical runtime evidence.
- Default scoped chat preservation, keeping non-opted-in `/api/chat` on the legacy scoped response shape without governed runtime payloads or persisted governed turns while Agent Lab, stream, explicit skill-routed chat, and governed Live Consult fallback carry the new rails.
- Persistence readiness manifests for every governed turn, exposing prototype browser/local JSON storage, reviewed-action readiness, accepted-memory context readiness, non-canonical source candidate handling, and blocked enterprise database, identity/access, retention/privacy, backup/recovery, and canonical source promotion requirements.
- Review identity manifests for every governed turn, exposing prototype reviewer-label-only workflow, local review availability, disabled enterprise identity/access/official approval flags, blocked enterprise approval types, and required steps before official approval can be claimed.
- Runtime control manifests for every governed turn, exposing the config-backed kill-switch policy, fail-closed fallback, emergency stop scope, admin override requirements, and evidence/review bypass prevention.
- Session runtime-control summaries, exposing accumulated runtime policy posture, kill-switch history, degraded fallback, emergency stop scope, admin override requirements, fail-closed consistency, evidence/review bypass prevention, latest control state, and disabled export/source-write/external-ingest/continuous-voice/runtime-bypass/admin-bypass flags.
- Session runtime-surface summaries with an observed-surface guardrail matrix, exposing runtime path, proof surface, pass/watch posture, governed-runtime/scoped-chat preservation, and disabled full voice/export/source-write posture before any surface promotion.
- Session foundation-readiness summaries, exposing a cross-rail view of approved experience architecture, evidence grounding, reviewed memory, source governance, audit/quality, runtime control, runtime surfaces, provider adapters, voice readiness, persistence governance, artifact readiness, and outcome-learning readiness while enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation remain gated.
- Session promotion-gate summaries, exposing whether the current foundation is ready for CMO demo, pilot review, or still needs governed turns, with demo proof, production blockers, enabled demo rails, funding rationale, and disabled promotion paths while production remains blocked.
- Session capability-readiness summaries, exposing disabled high/medium-risk capabilities, blocked capability gates, required/reviewed gate IDs, admin override requirements, kill-switch history, next promotion requirements, and disabled export, circulation, memory-write, source-promotion, source-write, external-ingest, continuous-voice, and runtime-bypass flags.
- Session evidence-spotlight summaries, exposing claim support-status counts, claim-type counts, supported evidence labels, missing-evidence IDs, source candidate IDs, guardrail claims, review-required claim IDs, latest claims, and disabled canonical claim-promotion / unsupported-claim-generation flags.
- Session audit summaries, exposing action counts, confirmation-required records, skill/view/artifact/evidence coverage, latest records, lifecycle/evidence/view/artifact/memory/source/runtime-quality audit posture, and disabled audit export / canonical-write / enterprise-audit-store flags.
- Session memory/audit summaries, exposing accepted/suggested/rejected/blocked memory counts, accepted-memory working context, memory review gates, review decisions, memory audit coverage, and disabled auto-accept/reviewed-write/canonical-write/enterprise-store flags.
- Governed Memory Audit workspaces, rendering that same memory/audit continuity through an approved dynamic view rather than an unmanaged sidecar.
- Session runtime-quality summaries, exposing pass/watch/blocked check counts, consistent pass IDs, watch/blocked IDs, human-review-required checks, latest checks, and consistency posture across governed runtime rails.
- Conversation presence manifests for every governed turn, exposing push-to-talk streaming presence across command-core, orchestration, module queue, status steps, voice policy, and proof rail while continuous listening, background wake word, and autonomous speaking remain disabled.
- Provider adapter manifests for every governed turn, exposing text, SSE stream, browser STT, Realtime voice candidate, and TTS readiness while keeping Realtime/TTS gated until runtime parity, consent, privacy, and interruption behavior are approved.
- Session provider-adapter summaries, exposing durable ready/prototype/gated/disabled adapter posture, latest bindings, policy-review needs, ready text/SSE paths, browser STT prototype state, and disabled provider bypass / Realtime runtime connection / TTS / continuous voice flags.
- Session voice-runtime summaries, exposing governed stream source, modes, consent boundary, stream events, compatible views, push-to-talk and typed-fallback readiness, evidence/gate parity, and disabled continuous voice / Realtime / TTS / autonomous-speaking / background-listening / provider-bypass flags.
- Voice orchestration readiness manifests for every governed turn, exposing the promotion checklist for wake/listen, continuous voice, Realtime voice, TTS, runtime parity, streaming/canvas parity, consent/privacy, interruption/cancellation, and enterprise transcript/memory storage while full voice remains disabled.
- Voice skill/view contract manifests for every governed turn, backed by `voice-skill-view-contract-v1`, proving voice orchestration can request only registered skills and approved voice-canvas views while continuous voice, Realtime voice, TTS, arbitrary skill routing, and arbitrary UI generation remain disabled or gated.
- Runtime surface manifests for every governed turn, exposing the active surface, proof surface, runtime path, persistence, streaming/voice posture, ready/opt-in/legacy/gated/disabled surface sets, scoped default-chat preservation, and disabled full voice / Realtime / TTS / continuous voice flags.
- Governed Voice Readiness Cockpit workspace that routes Jarvis-style voice readiness, provider adapter, Realtime voice, continuous voice, wake/listen, and TTS gate prompts through `inspect_voice_readiness`, renders `voice_readiness_panel` beside `provider_adapter_panel`, and keeps full voice activation gated.
- Governed Persistence Readiness Cockpit workspace that routes durable memory, durable audit, local JSON, enterprise persistence, retention/privacy, backup/recovery, and canonical source-promotion blocker prompts through `inspect_persistence_readiness`, renders `persistence_readiness_panel`, and keeps enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption disabled.
- Governed Treatment Outcome Readiness Cockpit workspace that routes outcome learning, follow-up signal linkage, efficacy readiness, portfolio learning, and canonical learning blocker prompts through `inspect_treatment_outcome_readiness`, renders `treatment_outcome_readiness_panel`, and keeps outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores disabled.
- Governed Runtime Governance Cockpit workspace that routes runtime surface readiness, runtime control, kill-switch posture, capability flags, governed surfaces, provider gates, and runtime-quality prompts through `inspect_runtime_governance`, renders `runtime_governance_panel` beside `capability_readiness_panel`, `provider_adapter_panel`, and `runtime_quality_panel`, and keeps default scoped chat stable while Realtime voice, full voice, TTS, exports, source writes, and canonical promotion remain gated or disabled.
- Governed Artifact Readiness Cockpit workspace that routes artifact readiness, export readiness, circulation readiness, QBR draft readiness, meeting artifact readiness, agency brief readiness, and artifact gate prompts through `inspect_artifact_readiness`, renders `artifact_readiness_panel`, and keeps export, copy, circulation, and official approval disabled.
- Governed Source Promotion Readiness Cockpit workspace that routes source promotion readiness, source claim promotion, canonical source promotion, canonical fact, source candidate, source claim, and runtime source-consumption prompts through `inspect_source_promotion_readiness`, renders `source_promotion_readiness_panel`, and keeps canonical writes/facts, source data writes, source-claim promotion, official approval, and runtime auto-consumption disabled.
- Governed Foundation Readiness Cockpit workspace that routes foundation readiness, platform readiness, CMO readiness, fundable foundation, and control-plane prompts through `inspect_foundation_readiness`, renders `foundation_readiness_panel` beside canvas continuity, audit trail, review identity, capability readiness, provider adapters, runtime quality, and evidence spotlight, and keeps enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation gated.
- Governed Executive Pilot Runbook workspace that routes CMO pilot, executive pilot, funding demo, sponsor runbook, and jaw-drop demo prompts through `plan_executive_pilot`, renders `executive_pilot_runbook_panel` beside canvas continuity, audit trail, review identity, capability readiness, provider adapters, runtime quality, and evidence spotlight, and keeps export/copy/circulation, official approvals, canonical writes, full voice, autonomous learning, and arbitrary UI generation gated.
- Agent Lab guided Executive Pilot sequence with manual load/run sponsor-demo steps, active skill/template highlighting, and quota-safe browser-local session history.
- Session Executive Pilot summaries through `agent-session-executive-pilot-v1`, exposing six-step sponsor-demo coverage, expected skills/templates/views, completed/missing steps, next runbook step, and disabled export/autonomous sequence/full voice/arbitrary UI flags.
- Governed Experience Architecture Cockpit workspace that routes experience architecture, ExperiencePlan readiness, dynamic UI foundation, workspace-builder, approved-template, approved-view, and role-specific workspace prompts through `inspect_experience_architecture`, renders `experience_architecture_panel` beside canvas continuity and runtime quality, and keeps arbitrary UI generation, unregistered views, unsupported metrics, and new source claims disabled.
- Per-turn experience architecture manifests for every governed turn, exposing approved template/skill/view counts, supported audiences/objectives/layouts, active workspace composition, unknown-view checks, composition blockers, and disabled dynamic UI generation / arbitrary view ID / unsupported metric / new-source-claim flags.
- Governed competitive comparison workspace using approved peer sets where present, associative Pattern Radar context where appropriate, and explicit caveats against causal, cannibalization, portfolio migration, or occasion-substitution overclaims.
- Governed Source Readiness Lab for Momentum source-owner handoff, with source readiness checks, blockers, required extracts, and executive-use caveats rendered as an approved dynamic view.
- Governed Source Owner Intake Workbench for source bundle/import handoff, using approved source readiness, room-to-grow, SMD driver, and gap views without promoting source-owner intake state to canonical truth.
- Governed Momentum source-owner handoff registry that maps readiness blockers to owner roles, accepted extract shapes, required fields, validation rules, promotion gates, canonical-use conditions, and next actions.
- Governed Live Meeting Capture workspace that turns meeting takeaway / capture-decision prompts into a review-required decision note with evidence, unresolved gaps, next proof signal, and blocked export/circulation.
- Governed Review Operations Cockpit that turns review queue / audit / pending approval prompts into an approved workspace for local review workflow state, evidence context, and blocked approval/export/canonical-write flags.
- Local durable Agent Lab session persistence for suggested memory, artifacts, audit records, and confirmation gates.
- Reviewed accept/edit/reject actions for persisted Agent Lab memory, artifacts, and confirmation gates.
- Session review workflow summaries for pending/reviewed/blocked memory, artifacts, and gates, with prototype-only reviewer state and disabled official approval/export/canonical-write/auto-consumption flags.
- Per-turn voice runtime manifests that keep voice readiness tied to the same governed stream, compatible views, evidence, memory, audit, and gates as typed turns while continuous mode remains disabled.
- Per-turn quiet proactivity manifests that expose follow-up suggestions and held notices while autonomous actions, scheduling, reminders, external sends, and overlapping runs stay disabled.
- Session quiet-proactivity summaries that persist suggestion/held-notice continuity across governed turns while keeping reminders, scheduled notifications, external sends, background runs, source promotion, and autonomous actions disabled.
- Governed Quiet Proactivity Cockpit workspace that routes follow-up/reminder/held-notice prompts through `inspect_quiet_proactivity`, renders `proactivity_panel` from the approved view registry, and keeps all reminder/notification/autonomous-action rails disabled.
- Durable reviewed-local source promotion records for accepted Brand Strategic Context and Momentum source candidates, with canonical writes disabled.
- Brand Data inspection of durable reviewed-local source promotion records beside browser-local promoted versions.
- Agent-turn inspection of reviewed-local source promotion candidates as non-evidence audit context, with runtime auto-consumption disabled.
- Local source-claim extraction and review workflow in Brand Data for unstructured source text, with extracted/reviewed/rejected claims kept separate from canonical facts and runtime evidence.
- Source-claim runtime audit and confirmation gates: active-brand source claims create explicit audit records and claim-specific promotion review gates, but source-promotion capability remains blocked and gate approval does not create canonical facts.
- Accepted reviewed memory reused as active-brand working context in later agent turns.
- Brand Strategic Context source-packet model with prototype-reviewed partial context and official-source gap handling.
- Brand Strategic Context validate -> preview -> promote importer UI for reviewed JSON source packets.
- Brand Strategic Context source-owner handoff/readiness requirements surfaced in the packet and Brand Data view, while prototype, browser-local, and reviewed-local context remains non-canonical.
- Disabled Brand Strategic Context source-owner runtime file-drop readiness lane with source-owner bundle template, read-only server audit, packet/Brand Data/Source Readiness Panel surfacing, validation, and eval coverage while runtime consumption and canonical use remain off.
- Momentum Intelligence source-packet model with prototype-reviewed market context, peer sets, room-to-grow inputs, and SMD contribution weights for seeded brands.
- Momentum Intelligence validate -> preview -> promote importer UI for reviewed JSON source packets.
- Measured Growth Navigator fallback adapter for Momentum Intelligence source packets.
- Multi-quarter Momentum Intelligence trend context and output-quality checks with source-period/significance caveats.
- Optional source-provided Momentum trend evidence fields for significance-tested metric movement and source-period compatibility in reviewed source packets.
- Governed Momentum source-extract adapter lane with reviewed/approved extract contract, split prototype source-owner fixture blocks, downloadable single-extract and bundle templates, packet priority order, validation, bundle merging, and agent eval coverage.
- Momentum Source importer support for source-extract shaped JSON objects or arrays, mapping extracts into governed Momentum packets before browser-local promotion.
- Momentum Source importer support for source-owner file bundles, mapping separate market/share/penetration, BBE contribution-weight, and movement/significance files into governed source-extract blocks before validation and browser-local promotion.
- Runtime Momentum source file-drop readiness policy in the Brand Intelligence Packet, exposing the future source-owner landing zone while keeping runtime consumption and canonical use disabled.
- Read-only runtime Momentum source file-drop audit, exposing landing-zone candidate counts and per-file-kind presence/issues without enabling source consumption or canonical use.
- Invalid/non-approved runtime source-owner file-drop coverage, proving non-approved status, empty rows, or unclean required file kinds stay blocked and cannot become canonical source truth or answer evidence.
- Malformed runtime source-owner file-drop coverage, proving candidate JSON parse issues are surfaced as blockers and cannot become canonical source truth, answer evidence, source writes, or runtime consumption.
- Momentum source readiness gate in the Brand Intelligence Packet and Source Readiness Lab, covering source-owner approval, market/share/penetration, contribution weights, movement/significance, and executive-use blocker state.
- Momentum source-owner handoff registry that turns readiness blockers into required source-owner roles, accepted extract shapes, required fields, validation rules, promotion gates, canonical-use conditions, and next actions.
- Treatment outcome readiness policy and per-turn manifests that expose the blocked promotion checklist for future outcome records, follow-up linkage, efficacy summary rules, portfolio learning storage, and canonical learning governance while keeping outcome learning and treatment claims disabled.
- Session treatment outcome readiness summaries that persist outcome-learning blockers across governed turns, showing related treatment paths, follow-up signals, learning signal IDs, latest next promotion step, and disabled outcome-learning / efficacy-summary / accepted-outcome-record / canonical-learning flags.
- Draft treatment outcome record template at `/templates/treatment-outcome-record-template.json`, validated and visible from the Treatment Outcome Readiness Panel as a governance handoff only while outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning remain disabled.
- Guardrail eval harness for the agent-router path, including adversarial fail-closed cases across JSON, streaming, explicit skill-routed chat, and governed Live Consult fallback for arbitrary UI/unsupported metrics, artifact review-export bypass, canonical source/runtime consumption, always-listening voice/TTS/autonomous speaking, and production/funding promotion overreach.

## 8. Out of scope for prototype

- Full AIM OS orchestration.
- Full Supabase implementation.
- Arbitrary AI-generated React/app code at runtime.
- Treating prototype-local work history as enterprise persistence.
- Fully autonomous agent actions without human review.
- Enterprise reviewed memory/audit/source-promotion database beyond local JSON prototype scaffolding.
- Enterprise persistence activation before database schema, identity/access, retention/privacy, backup/recovery, and canonical promotion requirements are approved.
- Official enterprise reviewer identity, role-based access, brand access control, or approval claims beyond the prototype `human_review` label.
- Automatic conversion of reviewed-local source promotion candidates into canonical source facts or answer evidence.
- Automatic conversion of extracted source claims into canonical source facts or answer evidence.
- Export/copy of generated QBR, agency, evidence, learning, or meeting artifacts before stakeholder language, circulation policy, and artifact export capability approval.
- Approved source-owner files becoming the default runtime Momentum source path and replacing the split prototype source-extract fixture blocks.
- Accepted treatment outcome record capture, treatment efficacy summaries, accepted pattern memory, outcome learning, or canonical learning stores. The current draft outcome-record template is a governance handoff artifact only.
- Continuous production voice assistant behavior.
- Wake/listen, background listening, continuous voice, autonomous speaking, advanced interruption/cancellation behavior, enterprise transcript storage, and production voice governance. User-initiated prototype Realtime voice and fallback browser STT/TTS are in scope only as governed Assistant interaction modes.
- Portfolio migration/cannibalization proof.
- Full category ontology.
- SKU-level pricing recommendations.
- Automated budget reallocation.
- Final official BBE methodology approval.

## 9. MVP acceptance criteria

- User can select at least six brands.
- User can see a diagnosis for each brand.
- User can see the evidence supporting and complicating the diagnosis.
- User can ask chat questions about the active brand and receive grounded answers or clear missing-data statements.
- Treatments are loaded from JSON/config.
- Adding a treatment to config surfaces it without component code changes.
- UI is clean enough for a marketing audience and deep enough for insights review.
- Brand Intelligence Packet is inspectable for any demo brand.
- Agent-generated views use approved registry IDs only.
- QBR or meeting artifacts are clearly marked as human-review drafts.
- Generated artifacts expose readiness blockers and cannot become export-enabled through review alone.
- Full voice remains gated unless runtime parity, consent/privacy, interruption, TTS policy, and enterprise storage readiness are proven.

## 10. North-star experience

A user lands in the app only occasionally, but when they do, they are locked in. The app should onboard quickly, anticipate the next question, and make sophisticated brand equity science understandable without dumbing it down.

The north star is not a prettier dashboard. It is a governed brand-growth operating layer. The user can speak or type a goal, and Brand Doctor can plan the experience, assemble the evidence, render the right views, explain the caveats, draft the artifact, remember the decisions, and keep the human in control.
