# Roadmap

## North-star expansion

See `docs/product/BRAND_GROWTH_INTELLIGENCE_VISION.md`.

The prototype remains BBE Brand Doctor at its core. The larger product direction is a PepsiCo Brand Growth Intelligence Layer that connects Better Brand Equity to How Brands Grow, Mental Availability, Category Entry Points, Growth Navigator, physical availability, distinctive assets, AI-era discoverability, and human insight judgment.

Brand Doctor remains the single-brand BBE diagnostic doorway. The broader roadmap should add connected evidence and action lenses: Growth Availability, Mental Availability / CEP intelligence, Physical Availability, Machine Availability, and eventually Portfolio Growth Intelligence. These additions should make the BBE diagnosis more useful, not replace it.

The newest product ambition is a governed dynamic experience layer: a voice/chat-first agent that can create the right workspace for an executive, marketer, insights lead, learner, agency partner, or future specialist from the same stable intelligence foundation. This should be implemented through typed skills, approved dynamic views, `ExperiencePlan` objects, memory, audit, and human-review gates rather than arbitrary generated UI.

The interaction ambition is bi-modal. The assistant should answer simple questions with the speed, synthesis, and humanity of the original Brand Doctor conversation, then shift into orchestrated work only when the ask requires a report, dashboard, comparison, proof package, artifact, governance review, or other deeper workflow.

The latest product priority is Web-Native Executive Intelligence Asset Foundation. Diagnostic Reasoning Calibration created the trusted source/reasoning/module substrate; the next step is to make the first high-value generated asset feel like a true replacement for hand-built BBE/QBR deck work while proving web-native value through proof, chat/voice, governed revisions, source-owner actions, and context-only external research. See `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PRD.md`, `docs/product/WEB_NATIVE_EXECUTIVE_INTELLIGENCE_ASSET_PLAN.md`, `docs/product/GOVERNED_REPORT_MODULES_AND_DECK_REPLACEMENT_PLAN.md`, and `docs/product/REUSABLE_GOVERNED_INTELLIGENCE_SHELL_ARCHITECTURE.md`.

## Current foundation status

Implemented:

- Six-section single-brand report remains the stable product spine.
- Brand data explorer now includes Brand Intelligence Packet inspection.
- Agent skill registry and dynamic view registry are implemented and validated.
- First deterministic skill router and `/api/agent` exist.
- `/agent-lab` exists as a Jarvis-style Brand Growth Command Center vertical slice.
- Approved dynamic view rendering exists for momentum, evidence, diagnosis trace, growth provocations, treatment path, Pattern Radar, data gaps, and QBR story draft.
- Experience Plans now generate Agent Lab workspaces from eighteen governed templates: executive QBR, insights evidence lab, marketer treatment planning, learning coach, agency brief builder, competitive comparison lab, source readiness lab, source-owner intake workbench, source promotion readiness, review operations, pilot learning, quiet proactivity, voice readiness, persistence readiness, treatment outcome readiness, runtime governance, artifact readiness, and live meeting capture.
- Governed compare prompts now render peer comparison, Pattern Radar, evidence, and data-gap views while separating approved peers from associative similarity.
- Governed source-readiness prompts now render Momentum source-owner checks, blockers, required extracts, and executive-use caveats without promoting prototype data.
- Governed meeting takeaway prompts now render a review-required meeting takeaway panel and decision-note artifact with evidence, unresolved gaps, and next proof signal while export/circulation remains blocked.
- Governed review operations prompts now render a Review Workflow Panel with pending/reviewed/blocked local review state, evidence/gap context, and disabled official approval/export/canonical-write/auto-consumption states.
- Unified `runAgentTurn()` runtime and `/api/agent/stream` event route exist for the first governed agent path.
- Explicit skill-routed `/api/chat` turns now return the full governed runtime payload and persist to the durable local session ledger when `sessionId` is supplied, while default scoped chat remains unchanged.
- The report Dialog With Data sidecar and standalone brand conversation page now have default-off governed-runtime controls that use stable brand-specific session IDs and compact proof strips.
- Live Consult browser/demo fallback now has a default-off governed runtime mode with local persistence and transcript proof strips; Realtime voice, continuous listening, and TTS remain gated.
- Governed runtime surface registry is implemented and visible in Agent Lab, mapping governed defaults, opt-in surfaces, scoped legacy fallback, gated Realtime/full-voice candidates, and disabled TTS into a validated Runtime Surface Map.
- Agent Lab consumes runtime stream events progressively with JSON fallback.
- Claim-level evidence spotlighting is implemented for governed agent turns, with runtime records, stream event, audit record, Agent Lab Proof Rail rendering, approved `evidence_spotlight_panel` workspace rendering, and eval coverage.
- Canvas continuity is implemented for governed agent turns, with persisted canvas/status/presence/recovery records, approved `canvas_continuity_panel` workspace rendering, and eval coverage while arbitrary UI, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, and continuous voice barge-in remain disabled.
- Runtime audit continuity is implemented for governed turns, with persisted lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality records, approved `audit_trail_panel` workspace rendering, and eval coverage while audit export, canonical audit writes, official approvals, and enterprise audit storage remain disabled.
- Review identity is implemented for governed turns, with prototype reviewer-label manifests, persistence-governance continuity, approved `review_identity_panel` workspace rendering, and eval coverage while enterprise identity, role access, brand access, accountable reviewer claims, official approvals, and canonical approval writes remain disabled.
- Runtime quality checks are implemented for governed turns, with pass/watch/blocked checks, stream event, audit record, Agent Lab Proof Rail rendering, and eval coverage.
- Canvas state manifests are implemented for governed turns, with active plan/template/layout, focused/rendered/fallback views, artifact/gate mapping, no-arbitrary-UI guardrails, stream/audit events, and eval coverage.
- Interruption/recovery manifests are implemented for governed turns, with client stream abort, preserve-last-canvas behavior, no-overlap guardrails, typed recovery prompts, Agent Lab Stop control, and eval coverage while continuous voice barge-in remains disabled.
- Public status-step manifests are implemented for governed turns, exposing intake/context/skill/evidence/experience/governance/response progress without exposing hidden reasoning.
- Conversation presence manifests are implemented for governed turns, connecting Agent Lab command-core, orchestration, module-queue, status-step, voice-policy, and proof-rail signals while continuous listening, background wake word, and autonomous speaking remain disabled.
- Provider adapter manifests are implemented for governed turns, mapping local text reasoning, SSE streaming, browser STT, the Live Consult Realtime candidate, and disabled TTS so future voice activation has a reviewed readiness contract first.
- Voice orchestration readiness manifests are implemented for governed turns, mapping wake/listen, continuous voice, Realtime voice, and TTS promotion requirements across runtime parity, streaming/canvas parity, consent/privacy, interruption/cancellation, TTS policy, and enterprise transcript/memory storage.
- Working context manifests are implemented for governed turns, with stream event, audit record, Agent Lab Proof Rail rendering, and eval coverage for accepted memory, source candidates, review gates, and disabled auto-promote/canonical-write flags.
- Source governance manifests are implemented for governed turns, with stream event, audit record, Agent Lab Proof Rail rendering, and eval coverage for reviewed-local source candidates, extracted source claims, Momentum source readiness, runtime source file-drop audit posture, source review gates, and disabled canonical/runtime source actions.
- Session runtime source-ingestion summaries are implemented through `agent-session-source-runtime-ingestion-v1`, making required/loaded/missing source-owner file kinds, governance blockers, next ingestion step, and disabled runtime source wiring visible before any default runtime source-path promotion.
- Runtime source-ingestion now also renders as approved workspace UI through `source_runtime_ingestion_panel`, a voice-canvas-compatible dynamic view included in Source Readiness, Source Owner Intake, Source Promotion Readiness, Foundation Readiness, and Executive Pilot workspaces.
- Runtime surface manifests are implemented for governed turns, with stream event, audit record, Agent Lab Proof Rail rendering, compact proof-strip surfacing, and eval coverage for the active surface, proof surface, runtime path, persistence, streaming/voice posture, surface readiness sets, scoped default-chat preservation, and disabled full voice / Realtime / TTS / continuous voice.
- Persistence readiness manifests are implemented for governed turns, distinguishing prototype browser/local JSON persistence from blocked enterprise database, identity/access, retention/privacy, backup/recovery, and canonical source promotion requirements.
- Review identity manifests are implemented for governed turns, keeping local review workflow in prototype reviewer-label-only mode and blocking enterprise identity, role/brand access controls, and official approvals until governance is connected.
- Runtime control manifests are implemented for governed turns, with config-backed kill-switch policy, fail-closed fallback, emergency stop scope, admin override requirements, and eval coverage.
- Session runtime-control summaries are implemented through `agent-session-runtime-control-v1`, preserving kill-switch, fail-closed, emergency-stop, admin-override, and evidence/review bypass posture across governed turns while exports, source writes, external ingest, continuous voice, runtime bypass, and admin bypass remain disabled.
- Session foundation-readiness summaries are implemented through `agent-session-foundation-readiness-v1`, consolidating approved experience architecture, evidence, memory/review, source governance, audit/quality, runtime control, surfaces, providers, voice, persistence, artifacts, and outcome-readiness while enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation remain gated.
- Session promotion-gate summaries are implemented through `agent-session-promotion-gate-v1`, making CMO-demo readiness, pilot-review readiness, production blockers, enabled demo rails, next pilot steps, and funding rationale inspectable while production remains blocked.
- The promotion verdict now also renders as approved workspace UI through `promotion_gate_panel`, a voice-canvas-compatible dynamic view included in the Foundation Readiness Cockpit and Executive Pilot Runbook.
- Memory/audit continuity now also renders as approved workspace UI through `memory_audit_panel`, a voice-canvas-compatible dynamic view included in Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces.
- First-turn memory suggestions, audit records, and confirmation gates are emitted and visible in Agent Lab.
- Session audit summaries persist action counts, confirmation-required records, skills/views/artifacts/evidence coverage, latest records, and audit posture across governed turns while audit export and enterprise audit storage remain disabled.
- Session memory/audit summaries persist memory counts, accepted working-context IDs, review gates, review decisions, and audit coverage while memory auto-accept, reviewed-memory writes, canonical memory writes, and enterprise memory storage remain disabled.
- Session capability-readiness summaries persist disabled risky capability posture, blocked capability gates, admin override requirements, kill-switch history, and promotion requirements across governed turns while exports, source writes, memory writes, external ingest, continuous voice, and runtime bypass remain disabled.
- Session evidence-spotlight summaries persist claim-level proof across governed turns so supported claims, missing-evidence claims, guardrails, reviewed context, and latest proof records remain inspectable beyond the current answer.
- Session runtime-quality summaries persist pass/watch/blocked quality checks across governed turns so approved experience, evidence, source, review, provider, voice, and runtime-surface consistency can be inspected before promotion.
- Config-backed risky capability flags are implemented and default disabled.
- Governed voice policy is implemented with push-to-talk default and continuous mode disabled.
- Governed Agent Lab push-to-talk is implemented as a single-turn browser STT path over `/api/agent/stream`, with typed fallback and visible policy state.
- Per-turn voice runtime manifests are implemented so voice readiness is tied to `/api/agent/stream`, push-to-talk consent, typed fallback, compatible views, and the same evidence/gates as typed turns.
- Session voice-runtime summaries are implemented through `agent-session-voice-runtime-v1`, preserving accumulated governed stream, mode, consent, compatible-view, and evidence/gate parity while continuous voice, Realtime voice, TTS, autonomous speaking, background listening, and provider bypass remain disabled.
- Session provider-adapter summaries persist text, SSE, browser STT, Realtime candidate, and disabled TTS readiness across governed turns while keeping provider bypass, Realtime runtime connection, TTS, and continuous voice disabled.
- Provider readiness now also renders as approved workspace UI through `provider_adapter_panel`, a voice-canvas-compatible dynamic view included in Voice Readiness, Runtime Governance, Foundation Readiness, and Executive Pilot workspaces.
- Capability readiness now also renders as approved workspace UI through `capability_readiness_panel`, a voice-canvas-compatible dynamic view included in Runtime Governance, Foundation Readiness, and Executive Pilot workspaces.
- Voice skill/view contract manifests and session summaries are implemented, mapping voice modes to registered skills, approved voice-canvas views, visible state phases, and readiness blockers while keeping continuous voice, Realtime voice, TTS, arbitrary skill routing, and arbitrary UI generation disabled or gated.
- Governed voice-readiness prompts now render a Voice Readiness Cockpit with `voice_readiness_panel`, `provider_adapter_panel`, review workflow, and gap views while Realtime voice, continuous listening, wake-word capture, TTS, autonomous speaking, and server-side provider cancellation remain gated/disabled.
- Governed persistence-readiness prompts now render a Persistence Readiness Cockpit with `persistence_readiness_panel`, review workflow, and gap views while enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption remain disabled.
- Governed treatment-outcome-readiness prompts now render a Treatment Outcome Readiness Cockpit with `treatment_outcome_readiness_panel`, pilot learning, review workflow, and gap views while outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores remain disabled.
- Session treatment-outcome-readiness summaries persist outcome-learning blockers across governed turns while keeping efficacy summaries, outcome records, treatment outcome claims, portfolio learning, and canonical learning stores disabled.
- Governed runtime-governance prompts now render a Runtime Governance Cockpit with `runtime_governance_panel`, `capability_readiness_panel`, `provider_adapter_panel`, voice readiness, `runtime_quality_panel`, review workflow, and gap views while default scoped chat remains stable and Realtime voice, full voice, TTS, exports, source writes, and canonical promotion remain gated/disabled.
- Governed foundation-readiness prompts now render a Foundation Readiness Cockpit with `foundation_readiness_panel`, promotion gate, experience architecture, canvas continuity, runtime governance, capability readiness, runtime quality, provider adapters, evidence spotlight, review workflow, memory audit, audit trail, review identity, and gap views while enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation remain gated.
- Governed executive-pilot prompts now render an Executive Pilot Runbook with `executive_pilot_runbook_panel`, momentum, foundation readiness, promotion gate, canvas continuity, evidence spotlight, runtime governance, capability readiness, runtime quality, provider adapters, review workflow, memory audit, audit trail, and review identity views while export/copy/circulation, official approvals, canonical writes, full voice, autonomous learning, and arbitrary UI generation remain gated.
- Governed evidence/QBR/review prompts now render an Evidence Spotlight panel that shows supported, missing, guardrail, reviewed-context, and non-evidence claims while canonical claim promotion and unsupported claim generation remain disabled.
- Agent Lab now provides a guided Executive Pilot sequence for manually loading/running sponsor-demo steps, with quota-safe browser-local session history so the command center keeps rendering under heavy prototype usage.
- Executive Pilot sequence coverage is now durable through `agent-session-executive-pilot-v1`, so Agent Lab and session APIs can show completed/missing sponsor-demo steps, next runbook step, and disabled export/autonomous/full-voice/arbitrary-UI flags from persisted ExperiencePlan manifests.
- Promotion-gate coverage is now durable through `agent-session-promotion-gate-v1`, so Agent Lab and session APIs can state what is demo-ready, what is pilot-review-ready, and what remains production-blocked before any funding or rollout decision.
- Governed artifact-readiness prompts now render an Artifact Readiness Cockpit with `artifact_readiness_panel`, review workflow, evidence, and gap views while export, copy, circulation, and official approval remain disabled.
- Governed source-promotion-readiness prompts now render a Source Promotion Readiness Cockpit with `source_promotion_readiness_panel`, review workflow, persistence readiness, and gap views while canonical writes/facts, source data writes, source-claim promotion, official approval, and runtime source auto-consumption remain disabled.
- Governed experience-architecture prompts now render an Experience Architecture Cockpit with `experience_architecture_panel`, canvas continuity, runtime governance, runtime quality, review workflow, and gap views while arbitrary UI generation, unregistered views, unsupported metrics, and new source claims remain disabled.
- Governed turns now emit per-turn `experienceArchitectureManifest` records with stream/audit proof of approved template/skill/view coverage, supported audiences/objectives/layouts, active workspace composition, unknown-view checks, and disabled arbitrary/dynamic generation rails.
- Per-turn quiet proactivity manifests are implemented for reviewed follow-up suggestions and held notices, with autonomous actions, scheduling, reminders, external sends, and overlapping runs disabled.
- Session quiet-proactivity summaries are implemented through `agent-session-proactivity-v1`, preserving accumulated suggestion and held-notice continuity without enabling reminders, scheduled notifications, external sends, background runs, source promotion, or autonomous actions.
- Governed quiet-proactivity prompts now render a Quiet Proactivity Cockpit with `proactivity_panel`, review workflow, evidence, and gap views while keeping reminder creation, scheduled notifications, external sends, background runs, autonomous action, source promotion, and overlapping runs disabled.
- Experience Plan view manifests are implemented for dynamic workspace zones, giving every rendered view an inspectable data/fallback/guardrail/selection-rationale record.
- Governed artifact manifests are implemented for Experience Plan artifacts, attaching review, circulation, source-view, evidence, guardrail, caveat, and export-disabled metadata to draft outputs.
- Governed artifact readiness manifests are implemented for QBR story drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes, exposing reviewer role, required evidence/source views, language approvals, blockers, next action, prototype-review status, and a still-disabled export gate.
- Durable local server JSON persistence is implemented for Agent Lab session turns, memory suggestions, artifacts, audit records, and confirmation gates.
- Reviewed accept/edit/reject workflows are implemented for persisted Agent Lab memory, artifacts, and confirmation gates.
- Session review workflow summaries are implemented for local ledger state, exposing pending/reviewed/blocked memory, artifacts, and gates while keeping official approval, enterprise identity, export, canonical writes, memory auto-accept, and runtime source auto-consumption disabled.
- Durable reviewed-local source promotion records are implemented for accepted Brand Strategic Context and Momentum source candidates through `/api/source-packets`, with canonical writes disabled.
- Brand Data now surfaces durable reviewed-local source promotion records beside browser-local promoted source versions.
- Agent Lab now surfaces reviewed-local source promotion candidates from governed agent turns as Proof Rail context, without auto-consuming them as packet facts or answer evidence.
- Local source-claim extraction/review is implemented through `/api/source-claims` and the Brand Data Source Claims tab; extracted and reviewed source claims are visible as non-evidence context while canonical facts and runtime consumption remain disabled.
- Source-claim runtime audit and confirmation gates are implemented. Loading active-brand source claims creates audit records and claim-specific review gates, while source-promotion capability remains blocked and gate approval does not canonicalize a claim.
- Brand Strategic Context source packets are implemented for prototype-reviewed partial context, with Lay's and Siete loaded into the Brand Intelligence Packet.
- Accepted reviewed memory now loads into later active-brand agent turns as working context; non-accepted memory remains excluded.
- Brand Strategic Context validate -> preview -> promote importer UI is implemented in the brand data view with browser-local promoted versions.
- Packet-level Brand Strategic Context handoff/readiness gates now expose source-owner approval, brand foundations/DNA, positioning/objectives/priorities, creative platform/claims, and executive-use blocker state in Brand Data and the packet contract.
- A disabled Brand Strategic Context source-owner runtime file-drop readiness lane now defines approved foundations, positioning/objectives, and creative platform/claims file kinds, exposes read-only server audit state, and keeps runtime consumption/canonical use disabled.
- Momentum Intelligence source packets are implemented for Lay's and Siete with prototype-reviewed market context, peer sets, room-to-grow inputs, and SMD contribution weights.
- Momentum Intelligence validate -> preview -> promote importer UI is implemented in the brand data view with browser-local promoted versions and a downloadable template.
- Measured Growth Navigator fallback adapter is implemented for Momentum Intelligence source packets.
- Multi-quarter Momentum Intelligence trend context and output-quality checks are implemented with source-period/significance caveats.
- Optional source-provided Momentum trend evidence fields are implemented across source packets, importer, template, kernel consumption, quality checks, and data validation.
- A Momentum source-extract adapter lane is implemented with split Doritos reviewed-for-prototype fixture blocks, downloadable single-extract and source-owner bundle templates, packet-builder priority order, bundle merging, validation, and agent eval coverage.
- The Momentum Source importer can now ingest source-extract shaped JSON objects or arrays and promote the converted Momentum packet as a browser-local version.
- The Momentum Source importer can now ingest source-owner file bundles, mapping separate approved market/share/penetration, BBE contribution-weight, and movement/significance file rows into governed source-extract blocks before preview/promotion.
- A runtime Momentum source file-drop readiness policy now defines the future source-owner landing zone and keeps runtime consumption/canonical use disabled until approved files and governance are in place.
- Governed server turns now include a read-only audit of that landing zone, showing whether expected source-owner file kinds are present without using them as source truth.
- Packet-level Momentum source readiness gates now expose source-owner approval, market/share/penetration, contribution-weight, movement/significance, and executive-use blocker state in Brand Data, Agent Lab proof surfaces, and the Source Readiness Lab.
- Momentum source-owner handoff requirements are implemented so each readiness blocker has an owner role, accepted extract shape, required fields, validation rules, promotion gate, canonical-use condition, and next action.
- Per-turn treatment outcome readiness manifests and a governed Treatment Outcome Readiness Cockpit are implemented so future outcome records, follow-up linkage, efficacy rules, portfolio learning storage, and canonical learning governance have a visible promotion checklist while outcome learning and treatment claims remain disabled.
- Agent eval harness exists through `pnpm eval:agent`, including adversarial fail-closed cases across JSON, streaming, explicit skill-routed chat, and governed Live Consult fallback for arbitrary UI/unsupported metrics, artifact review-export bypass, canonical source/runtime consumption, always-listening voice/TTS/autonomous speaking, and production/funding promotion overreach.

Still needed before this becomes the full operating layer:

- Enterprise database persistence for memory, audit, artifacts, artifact readiness history, source promotion records, and source claim records after the persistence readiness blockers are resolved, including explicit rules for when source candidates can become canonical runtime evidence and when prototype `human_review` labels become accountable enterprise identities/official approvals.
- Official Brand Strategic Context source packets or source-owner file drops and durable promotion after source-owner governance review, using the packet readiness checks, canonical-use governance, and persistence readiness as the promotion gate.
- Approved source-owner file drops wired into the default runtime source path, replacing the split prototype source-extract fixture blocks and satisfying the readiness gate across contribution-weight, trend/significance, market/share, and penetration coverage.
- Treatment outcome records, efficacy summaries, accepted pattern memory, and canonical learning stores after the treatment outcome readiness blockers clear.
- Wake/listen or continuous voice orchestration connected to governed skills and views after the voice orchestration readiness checklist clears Realtime runtime parity, consent/privacy, interruption/cancellation, TTS policy, and enterprise storage gates.

## 30 days

- Execute the Diagnostic Reasoning Calibration phase: normalize source records, map deck chart data, add source governance, define demographic evidence gates, and create the first `EquityReasoningRead` contract before expanding polished output generation.
- Define the reusable governed intelligence shell boundary and BBE domain-pack pattern before implementing the calibration layer, while avoiding a generic platform rewrite.
- Add the simulated demographic diagnostics pack as a prototype-only lane with visible source/replacement caveats and eval coverage for demographic questions.
- Convert the transcript and Q1 Snacks deck learnings into explicit evals: category-index overclaiming, "strong or just big?", Momentum-as-headline, Ahead/Behind-as-size-check, Pricing Power guardrails, and M/D/S integrated driver reads.
- Keep the single-brand diagnostic report stable and demo-ready.
- Harden BBE Momentum Intelligence by using `source_runtime_ingestion_panel` as the read-only source-ingestion trust surface, then wiring approved source-owner file drops into the default runtime source path only after `agent-session-source-runtime-ingestion-v1` shows the ingestion gate is satisfied, and replacing the split source-extract fixture blocks with approved extracts that satisfy `momentumSourceReadiness`.
- Keep session source governance inspectable as reviewed working context across governed surfaces, using `agent-session-source-governance-v1` summaries while canonical source writes, claim facts, runtime source auto-consumption, and source-data writes remain blocked.
- Keep session runtime surface usage inspectable with `agent-session-runtime-surface-v1` summaries and the observed-surface guardrail matrix so opt-in chat, Agent Lab, streaming, and Live Consult fallback can prove surface parity, proof posture, and disabled full voice/export/source-write paths before any promotion.
- Keep session voice readiness inspectable with `agent-session-voice-readiness-v1` summaries so Jarvis-style voice can show accumulated readiness and blockers before wake/listen, continuous voice, Realtime voice, or TTS activation.
- Keep session voice runtime inspectable with `agent-session-voice-runtime-v1` summaries so Jarvis-style voice can prove governed stream/evidence parity before wake/listen, continuous voice, Realtime voice, or TTS activation.
- Keep session experience architecture inspectable with `agent-session-experience-architecture-v1` summaries so role-specific workspaces can prove approved template/view composition before any arbitrary UI or generated-source-claim promotion.
- Use `agent-session-executive-pilot-v1` as the auditable CMO demo sequence while source-owner ingestion, voice, artifacts, and learning remain governed/gated.
- Improve accepted-memory inspection only where it helps users understand what context was loaded.
- Use `memory_audit_panel` as the default read-only memory trust surface before any reviewed-memory write, canonical memory write, or enterprise memory store promotion is considered.
- Use `audit_trail_panel` as the default read-only runtime audit trust surface before any audit export, canonical audit write, official approval, or enterprise audit-store promotion is considered.
- Use `review_identity_panel` as the default read-only reviewer authority surface before any enterprise identity, role access, brand access, accountable reviewer, or official approval promotion is considered.
- Use `provider_adapter_panel` as the default read-only provider-substrate surface before any Realtime voice, TTS, continuous voice, autonomous speaking, or provider-bypass promotion is considered.
- Use `capability_readiness_panel` as the default read-only risky-capability surface before any export, circulation, memory-write, source-write, source-promotion, external-ingest, continuous-voice, or runtime-bypass promotion is considered.
- Keep extending adversarial evals across the unified runtime, streaming event sequence, opt-in chat, governed Live Consult fallback, and future voice path before any source truth, export, audit export, arbitrary UI, unsupported metric, full-voice, official-approval, funding-approval, or production-certification capability is promoted. Current coverage includes official-approval identity spoofing and canonical audit/export overreach.
- Use the voice orchestration readiness manifest to drive consent, privacy, interruption, TTS, Realtime parity, and storage requirements for future wake/listen or continuous voice.
- Use the treatment outcome readiness manifest to define the schema, review identity, follow-up signal, efficacy language, and canonical learning requirements before building outcome records.

## 60 days

- Promote reviewed session memory, artifact capture, artifact readiness, and audit logs from local JSON prototype state to enterprise governed storage once the review workflow is trusted.
- Add QBR story draft copy/export once human-review language, artifact shape, and the `artifact_export_capability` gate are approved.
- Load official governed Brand Strategic Context source packets through the importer once source owners approve the workflow.
- Deepen BBE Momentum Intelligence with approved contribution weights, measured room-to-grow calculations, and source-owner trend/significance extracts as data becomes available.
- Add source-claim extraction/review workflow for decks, docs, transcripts, and research summaries.
- Connect wake/listen or continuous voice orchestration to the same runtime and event stream only after policy gates and voice orchestration readiness blockers are cleared.

## 90 days

- Pilot role-specific experiences with executives, brand managers, and insights leads.
- Validate which experience templates create the highest decision value.
- Expand durable persistence for memory, artifacts, audit, and source packets based on pilot governance feedback.
- Add reviewed Mental Availability / CEP, Physical Availability, Machine Availability, and treatment outcome packet paths.
- Define governance for source ownership, canonical facts, extracted claims, reviewed memory, diagnosis logic, treatment library, and generated artifacts.
- Validate the HBG-grounded Growth Availability framework with insights planners.

## Later

- Supabase data spine.
- Expert authoring layer for diagnoses and treatments.
- Outcome learning loop.
- AIM OS callable module wrapper.
- Portfolio and LLM equity modules.
- Portfolio Growth Intelligence layer.
- Machine Availability / AI discoverability evidence layer.
- Production quiet proactivity and scheduled follow-up checks beyond the current suggestions-only manifest, inspection cockpit, and session continuity summary.
- Multi-agent specialist workflows after the single-agent runtime, memory, and rails are trusted.
