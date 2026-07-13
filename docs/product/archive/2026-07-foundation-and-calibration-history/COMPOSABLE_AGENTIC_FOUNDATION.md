# Composable Agentic Foundation

## Purpose

This document defines the next foundation for BBE Brand Doctor as it moves from prototype toward pilot. The goal is not to replace the current six-section report. The goal is to build a stable intelligence foundation beside it so future pilot feedback, new data sources, voice/chat workflows, learning, exports, dynamic UI, and role-specific workspaces can be added without turning the app into a tangled one-off prototype.

The working principle:

> Stable brain, flexible surfaces.

The stable brain is structured data, source-grounded knowledge, deterministic reasoning, approved agent skills, governed prompts, evidence, memory, audit logs, and evals. The flexible surfaces are chat, voice, dynamic canvas views, reports, learning modules, QBR packages, Live Consult, Pattern Radar, agency briefs, and future workflow modes.

## Original Objective

The original objective remains the center:

> Help PepsiCo teams diagnose brand equity signals and translate them into evidence-backed growth action.

The newer vision changes the interaction model. Brand Doctor should no longer be thought of as a report with chat attached. It should become a governed brand-growth intelligence system where conversation is the orchestration layer and UI views are summoned or composed around the user's decision need.

The updated scope adds one more requirement: the agent should eventually be able to build the right workspace for the user in front of it. A CMO should see an executive decision cockpit. A marketer should see a treatment planning workspace. An insights lead should see evidence, trace, gaps, and assumptions. This must be done through governed experience plans and approved components, not arbitrary UI generation.

The latest interaction correction is equally important: conversation remains the default experience. The original scoped Brand Doctor chat produced the right answer style for simple questions: fast, contextual, human, and strategically synthesized. The governed runtime should provide stronger substrate and dynamic work capabilities, but it should not force every simple question into a work-order or cockpit answer.

## First Principles

### 1. Brand equity is the starting truth

BBE remains the diagnostic spine. Growth Navigator, Mental Availability / CEPs, market context, sales, consumer promotion engagement, social signals, and future commercial data are support and explanation layers. They may sharpen diagnosis or action planning, but they should not replace the BBE foundation unless the product explicitly creates a new governed method.

### 2. Evidence beats eloquence

Every important answer, visual, provocation, treatment path, or export must be traceable to evidence or an explicit missing-data note. If the system cannot support a claim, it should say what is missing.

### 3. Dynamic UI must be governed

The agent can choose which view to render, but it should choose from an approved view registry. It should not invent arbitrary visualizations, chart semantics, or unsupported metrics in the moment.

### 4. Skills are modular, truth is centralized

Teaching, diagnosis, research, visualization, pressure testing, export drafting, and meeting facilitation should all be agent skills. But each skill must call the same canonical data, knowledge, rules, evidence, and guardrails.

### 5. The product should be easy to change

Pilot users will bring opinions and new requirements. The system should absorb that through config, schemas, registries, and services before React component edits. Components render. Services compute. Config defines. Agents orchestrate. Humans decide.

### 6. Conversation is the front door

The assistant should decide whether to answer, offer, build, or block. Simple questions should receive high-quality conversational answers. Advanced asks should become orchestrated skills and approved workspaces. Governance details should be visible and inspectable, but they should not pollute the first answer unless the user asks for proof, source readiness, audit, or governance.

## System Layers

```text
Source Layer
-> Knowledge Layer
-> Reasoning Layer
-> Agent Skill Layer
-> Experience Planning Layer
-> Dynamic View Layer
-> Experience Surfaces
```

### Source Layer

Source data and reference material:

- BBE tracker exports.
- Brand Health Records.
- Growth Navigator workbooks, decks, and PDFs.
- Market, sales, penetration, share, category growth, and syndicated data.
- Consumer promotion engagement.
- Social listening and consumer interaction signals.
- Brand statements, portfolio context, and category trend context.
- Workshop requirements and stakeholder feedback.
- Treatment library and planning templates.

Each source should carry provenance, period, geography, category definition, source type, confidence, owner, and caveats.

### Knowledge Layer

The PepsiCo brain:

- Principles of Growth.
- BBE definitions.
- Demand Power, Perceived Value, Meaningful, Different, Salient.
- Momentum, Ahead/Behind, category benchmark, and room-to-grow logic.
- Growth Navigator concepts.
- Mental Availability and CEP concepts.
- Diagnosis definitions and treatment library.
- Forbidden claims and language guardrails.
- Learning modules and system wiki.

This layer should be human-readable and machine-addressable.

### Reasoning Layer

Deterministic services:

- Build the active Brand Intelligence Packet.
- Classify maturity.
- Read momentum.
- Calculate room to grow.
- Run diagnosis.
- Assemble evidence and counter-evidence.
- Scan opportunities.
- Generate growth provocations.
- Rank treatment paths.
- Detect data gaps.
- Run output-quality checks.

The LLM should call these services. It should not recreate them from prose.

### Agent Skill Layer

The agent interprets user intent and invokes approved skills. A skill is a governed capability with:

- purpose
- allowed inputs
- required data
- deterministic services/tools it may call
- output schema
- allowed views
- guardrails
- evals
- human approval requirements

The initial registry should cover diagnosis, BBE Momentum Intelligence, evidence explanation, teaching, testing, competitor/category research, dynamic view recommendation, treatment planning, QBR story drafting, and meeting facilitation.

### Experience Planning Layer

The Experience Planning Layer turns a user goal into an inspectable, governed workspace plan. It is the bridge between a flexible "Jarvis-style" experience and a safe enterprise product.

An `ExperiencePlan` should include:

- audience: executive, marketer, insights lead, learner, agency partner, or specialist
- objective: diagnose, decide, teach, challenge, compare, package, monitor, or research
- scope: brand, category, market, period, and source caveats
- skills to run
- evidence required
- approved layout pattern
- zones and dynamic view IDs
- artifacts to create
- memory to read or write
- guardrails and human-review requirements

The agent may recommend an experience plan. The renderer may only render approved zones and views. Unknown views, unsupported objectives, missing evidence, or risky artifacts should fail closed into a gap state or human-review state.

### Dynamic View Layer

Views are approved renderable components:

- KPI strip.
- Momentum ladder.
- Momentum x room-to-grow grid.
- SMD driver map.
- Evidence ledger.
- Data-gap panel.
- Peer comparison.
- Pattern Radar.
- Treatment path card.
- Learning explainer.
- Quiz.
- QBR narrative draft.

The agent returns a structured view request. The app renders the matching component with data from the kernel.

### Experience Surfaces

The same intelligence foundation should support:

- Chat-first workspace.
- Voice-first Live Consult.
- Current six-section report.
- BBE Momentum Intelligence workflow.
- Learn and coaching flows.
- Pattern Radar / portfolio intelligence.
- Brand data explorer.
- Executive memo, slide outline, agency brief, and talk track exports.
- Future meeting mode.
- Role-specific command centers generated from governed `ExperiencePlan` objects.

## Requirement Reconciliation

The BBE Momentum Intelligence v8 requirements sharpen the foundation in important ways. They should become kernel capabilities, not a rigid product boundary.

### Must absorb from v8

- User-facing Perceived Value language.
- Momentum as the headline verdict.
- Red momentum must not be hidden.
- Multi-quarter trend context.
- Market/category context before brand diagnosis.
- Brand statement and trend context.
- Market maturity classification.
- SMD contribution weights as data.
- Momentum x room-to-grow grid.
- Room-to-grow inputs: penetration headroom, Demand Power share vs market share, category growth.
- Peer-set identity and peer-set size.
- Additional scans across cohorts, occasions, image profiles, category drivers, and Demand Power headroom.
- Growth provocations with what / so what / now what / evidence / urgency.
- Output-quality self-check.
- Clear data-gap notes.

### Preserve beyond v8

- Deterministic diagnosis trace.
- Treatment library and treatment path ranking.
- Brand Manager and Insights Lead modes.
- Pattern Radar and portfolio intelligence.
- Live Consult voice and visual actions.
- Learning modules and practice labs.
- System wiki.
- Brand data explorer.
- No Magic AI citations.

### Push back gently on v8 as product boundary

The v8 report spine is a useful workflow, but the product should not become only a static report generator. The best pilot foundation is a chat/voice-first intelligence kernel that can produce the v8 report, explain it, teach it, challenge it, package it, and adapt it to future workflows.

## The Dynamic Conversation Model

The future interaction should look like:

```text
User asks or speaks
-> Agent identifies intent and active decision
-> Agent selects skill(s)
-> Skill calls deterministic services and retrieves source knowledge
-> Kernel returns structured evidence-bound output
-> Experience planner selects audience, objective, zones, views, artifacts, and review gates
-> Agent explains in plain language
-> View registry renders the right visual or work surface
-> User accepts, challenges, asks to go deeper, or asks to package
-> Session memory records assumptions, reviewed evidence, open questions, and decisions
```

The current Jarvis slice uses the same model as a chained voice workflow:

```text
Talk or type input
-> quick-answer vs approved-work-order decision
-> governed Brand Doctor runtime
-> ExperiencePlan and approved views
-> visual workspace, proof, gates, and offers
-> OpenAI TTS speaks brief human-facing moments
```

OpenAI TTS is the chained voice-output adapter for this prototype slice. It improves the listening experience while preserving deterministic evidence, work-order approval, proof rails, and dynamic view governance. It is not the Realtime brain and does not clear continuous listening, wake word, autonomous speaking, enterprise transcript storage, server-side interruption/cancellation, or production voice-governance gates.

Example:

```text
User: Why is Lay's slipping if it is still strong?

Agent:
- Calls BBE Momentum read.
- Calls diagnosis evidence.
- Calls SMD driver map.
- Calls Pattern Radar for similar cases.
- Creates an executive QBR `ExperiencePlan`.
- Renders a momentum strip, SMD driver view, evidence ledger, and alternative interpretation panel from approved view IDs.
- Explains the headline, caveat, and QBR provocation.
```

## Current Foundation Status

Implemented:

- Brand Intelligence Packet types and builder.
- Brand Strategic Context placeholder and missing-state guardrail.
- Agent skill registry and dynamic view registry.
- Registry validation in `pnpm validate:data`.
- Packet inspection surface in `/brand/[brandId]/data`.
- Deterministic skill router and `/api/agent`.
- Optional `/api/chat` skill-router path while preserving the original scoped chat default.
- `/agent-lab` as the first governed dynamic command-center slice.
- Dynamic view renderer for approved registry views.
- QBR story draft artifact with human-review language.
- Agent eval harness with `pnpm eval:agent`, including adversarial fail-closed coverage across JSON, streaming, explicit skill-routed chat, and governed Live Consult fallback for arbitrary UI/unsupported metrics, artifact review-export bypass, canonical source/runtime consumption, always-listening voice/TTS/autonomous speaking, and production/funding promotion overreach.
- A first Jarvis-style interaction pass with governed push-to-talk affordance, orchestration bus, module queue, active-read stats, and command-core visual hierarchy.
- Experience Plan schemas, twenty-one pilot templates, planner service, API output, Agent Lab plan-zone rendering, inspectable plan JSON, validation, and expanded evals.
- Governed competitive comparison workspace with compare-skill routing, approved peer-set handling, associative Pattern Radar fallback, `peer_comparison` rendering, and explicit non-causal/portfolio-overclaim caveats.
- Governed Source Readiness Lab with explicit readiness routing, `source_readiness_panel` rendering, source-owner blocker language, and eval coverage that keeps prototype/reviewed-local sources out of canonical evidence.
- Governed Momentum source-owner handoff registry that maps source-readiness blockers to owner role, accepted extract shape, required fields, validation rules, promotion gate, canonical-use condition, current status, and next action.
- Governed Live Meeting Capture with meeting-takeaway routing, `meeting_takeaway_panel` rendering, review-required `decision_note` artifacts, evidence/gap/next-proof context, and blocked export/circulation gates.
- Governed Review Operations Cockpit with `review_session_state` routing, `review_workflow_panel` rendering, local ledger review summary, evidence/gap context, and explicit blocked official approval/export/canonical-write/auto-consumption states.
- Unified `runAgentTurn()` runtime with turn IDs, markdown, ordered events, shared use in `/api/agent`, Agent Lab initial render, optional skill-routed chat, and `/api/agent/stream`.
- Optional skill-routed `/api/chat` runtime/persistence parity: explicit router turns now return the same governed runtime rails as `/api/agent`, including audit, memory, gates, manifests, runtime quality checks, capabilities, voice/runtime policies, and durable local session persistence when `sessionId` is supplied, while default scoped chat remains unchanged.
- Visible brand chat opt-in: the report Dialog With Data sidecar and standalone brand conversation page can switch from scoped chat to governed runtime for a turn, using stable brand-specific sessions, a governed-runtime source marker, and a compact proof strip for persistence, quality checks, gates, prototype review identity, evidence spotlight coverage, and approved view count. The proof summary is parsed in a non-React runtime utility and rendered through a shared component.
- Live Consult governed fallback: browser/demo fallback prompts can opt into the same governed runtime and shared proof strip with stable fallback sessions while Realtime voice, continuous listening, and TTS remain gated.
- Governed runtime surface registry: `src/data/config/governed-runtime-surface-registry.json` maps the API, streaming, Agent Lab, default scoped chat, opt-in governed chat surfaces, Live Consult fallback, Realtime candidate, future full voice, and disabled TTS into validated ready/opt-in/legacy/gated/disabled states. Agent Lab renders this as a Runtime Surface Map so the foundation is inspectable before additional surfaces are promoted.
- Agent Lab progressive stream consumption with JSON fallback.
- Claim-level evidence spotlighting in governed agent turns, including runtime records, stream event, audit record, Agent Lab Proof Rail rendering, approved `evidence_spotlight_panel` workspace rendering, and eval coverage.
- First-turn memory suggestions, audit records, and confirmation gates emitted by `runAgentTurn()` and surfaced in Agent Lab.
- Session audit summaries that persist audit continuity across governed turns, exposing action counts, confirmation-required records, skill/view/artifact/evidence coverage, latest records, lifecycle/evidence/view/artifact/memory/source/runtime-quality audit posture, a review-only audit governance protocol, and disabled audit export / canonical-write / enterprise-audit-store flags.
- An approved `audit_trail_panel` dynamic view that renders lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit continuity inside Review Operations, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while audit export, canonical audit writes, official approval, and enterprise audit storage remain disabled.
- An approved `review_identity_panel` dynamic view that renders prototype reviewer-label limits, reviewable item types, related gates/review records, blocked enterprise approval types, required identity/access steps, and disabled enterprise identity/role access/brand access/official approval paths inside Review Operations, Persistence Readiness, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while accountable reviewer claims and official approvals remain disabled.
- An approved `provider_adapter_panel` dynamic view that renders text/SSE readiness, browser STT prototype posture, Realtime candidate gates, TTS disabled state, policy-review needs, voice contract posture, and provider-bypass blockers inside Voice Readiness, Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while Realtime voice, TTS, continuous voice, autonomous speaking, and provider bypass remain disabled or gated.
- An approved `capability_readiness_panel` dynamic view that renders disabled risky capability flags, blocked confirmation gates, admin override requirements, review gate IDs, runtime-control posture, and hard-disabled export/circulation/memory-write/source-write/source-promotion/external-ingest/continuous-voice/runtime-bypass paths inside Runtime Governance, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while disabled capabilities remain blocked.
- Session capability-readiness summaries now include a review-only risky capability promotion protocol through `agent-session-capability-readiness-v1`, rendering request capture, human review, policy/config change, runtime-control validation, integration evidence, and production rollout governance as separate gates in `capability_readiness_panel`.
- Session memory/audit continuity summaries through `agent-session-memory-audit-v1`, consolidating memory records, accepted-memory working context, memory review gates, review decisions, and memory audit coverage while auto-accept, reviewed-memory writes, canonical memory writes, and enterprise memory storage remain disabled.
- Review-only memory promotion protocol steps inside the session memory/audit summary, separating suggested memory capture, human memory review, accepted working context, canonical memory governance, enterprise memory storage, and memory auto-accept automation before any canonical or enterprise memory behavior can be considered.
- An approved `memory_audit_panel` dynamic view that renders accepted working context, memory review gates, review decisions, audit coverage, latest memory, and disabled memory-write/enterprise-store paths inside governed ExperiencePlan workspaces, with voice-canvas compatibility and eval coverage.
- Browser-local Agent Lab session ledger for turn IDs, memory suggestions, artifacts, audit records, and confirmation gates.
- Config-backed capability flags for risky write/export/source/voice actions, disabled by default and surfaced in runtime confirmation gates.
- Config-backed runtime control / kill-switch policy with fail-closed fallback, emergency stop scope, admin override requirements, and per-turn manifest surfacing.
- Session runtime-control summaries that persist kill-switch and fail-closed posture across governed turns, exposing runtime policy IDs, runtime modes, emergency stop scope, admin override requirements, evidence/review bypass prevention, latest control state, and disabled export/source-write/external-ingest/continuous-voice/runtime-bypass/admin-bypass flags.
- Session runtime-surface guardrail matrix inside `agent-session-runtime-surface-v1`, making observed surface runtime path, proof surface, pass/watch posture, governed-runtime/scoped-chat preservation, and disabled full voice/export/source-write paths inspectable before any surface promotion.
- Review-only runtime-surface promotion protocol inside `agent-session-runtime-surface-v1`, separating observed governed surface turns, opt-in surface review, default surface promotion, voice/provider runtime governance, export/source-write runtime governance, and production surface certification before any runtime surface promotion can be considered.
- Session foundation-readiness summaries through `agent-session-foundation-readiness-v1`, consolidating approved experience architecture, evidence grounding, reviewed memory, source governance, audit/quality, runtime control, runtime surfaces, provider adapters, voice readiness, persistence governance, artifact readiness, and outcome-learning readiness into one inspectable control-plane while enterprise persistence, official approvals, canonical writes, runtime source auto-consumption, artifact export/copy/circulation, full voice, TTS, continuous voice, autonomous learning, and arbitrary UI generation remain gated.
- Session promotion-gate summaries through `agent-session-promotion-gate-v1`, rolling the foundation control-plane, guided Executive Pilot coverage, source-ingestion posture, runtime-surface guardrails, and runtime quality into a CMO-demo / pilot-review / production-blocked verdict with explicit demo rails, production blockers, next pilot steps, and funding rationale.
- An approved `promotion_gate_panel` dynamic view that renders the CMO-demo / pilot-review / production-blocked verdict inside governed ExperiencePlan workspaces, with voice-canvas compatibility and eval coverage.
- An approved Foundation Readiness Cockpit workspace that routes platform readiness, CMO readiness, fundable foundation, and control-plane prompts through `inspect_foundation_readiness` and renders `foundation_readiness_panel` beside promotion gate, experience architecture, canvas continuity, runtime governance, capability readiness, runtime quality, provider adapters, evidence spotlight, review workflow, memory audit, audit trail, review identity, and gap views while enterprise persistence, official approvals, canonical writes, exports/copy/circulation, full voice, autonomous learning, and arbitrary UI generation remain gated.
- An approved Executive Pilot Runbook workspace that routes CMO pilot, executive pilot, funding demo, sponsor runbook, and jaw-drop demo prompts through `plan_executive_pilot` and renders `executive_pilot_runbook_panel` beside momentum, foundation readiness, promotion gate, canvas continuity, evidence spotlight, runtime governance, capability readiness, runtime quality, provider adapters, review workflow, memory audit, audit trail, and review identity views while export/copy/circulation, official approvals, canonical writes, full voice, autonomous learning, and arbitrary UI generation remain gated.
- A guided Executive Pilot sequence in Agent Lab that lets a user manually load or run the approved sponsor-demo steps for the active brand, while browser-local ledger persistence compacts on quota pressure instead of blocking the command center.
- A typed Agent Lab Workspace Choreography layer that derives listen/route/plan/render/prove/review phase state, approved-view continuity, proof continuity, pending review counts, next action, runtime posture, and production-promotion blocker state from the current governed turn plus session ledger.
- Session Executive Pilot summaries through `agent-session-executive-pilot-v1`, making the guided sponsor-demo path auditable from persisted ExperiencePlan manifests: completed/missing steps, expected skills/templates/views, next runbook step, observed required views, disabled export/autonomous/full-voice/arbitrary-UI flags, CMO proof stack, and gated funding asks for source-owner handoff, enterprise persistence/identity, artifact export policy, voice runtime policy, and outcome-learning design.
- Governed voice policy with push-to-talk default, wake/listen allowed, continuous disabled, consent required, and `/api/agent/stream` as the runtime event source.
- Clearer push-to-talk voice loop connected to governed skills, views, and runtime events. The mic click is the explicit consent boundary, browser STT captures one prompt when available, and typed input remains the fallback.
- Durable local server JSON persistence for Agent Lab sessions through ignored `.runtime/agent-session-ledgers.json`, with API turn persistence and `/api/agent/session-ledger` read/merge access.
- Reviewed accept/edit/reject actions for persisted Agent Lab memory, artifacts, and confirmation gates, with review history and blocked-gate refusal.
- Session review workflow summaries through `agent-session-review-workflow-v1`, exposing pending/reviewed/blocked memory, artifacts, and gates from the local ledger while official approval, enterprise identity, artifact export, canonical writes, memory auto-accept, and runtime source auto-consumption remain disabled.
- Session persistence-governance summaries through `agent-session-persistence-governance-v1`, exposing persisted working context, persistence readiness, prototype review identity, and a review-only enterprise persistence promotion protocol across turns while enterprise persistence, enterprise identity, role/brand access, official approval, memory auto-accept, canonical writes, and runtime source auto-consumption remain disabled.
- Durable reviewed-local source promotion records through `/api/source-packets`, stored under ignored `.runtime/source-packet-promotions.json`, with canonical source-data writes disabled.
- Brand Data inspection of reviewed-local source promotion records beside browser-local promoted source versions.
- Reviewed-local source promotion context in governed agent turns and Agent Lab Proof Rail, deliberately kept out of packet facts, answer evidence, and runtime auto-consumption.
- Local-first source-claim extraction/review through `/api/source-claims` and the Brand Data Source Claims tab, stored under ignored `.runtime/source-claims.json`, with active-brand `sourceClaimContext` visible in governed turns but excluded from canonical facts and runtime evidence. Loading source-claim context now creates explicit audit records and claim-specific review gates, while source-promotion capability gates keep canonical/runtime promotion blocked.
- Session source-governance summaries now include a review-only source-claim promotion protocol through `agent-session-source-governance-v1`, rendering claim extraction, human review, source-owner verification, packet evidence mapping, canonical fact governance, and runtime evidence wiring as separate gates in `source_promotion_readiness_panel`.
- Experience Plan view manifests that explain every dynamic workspace zone: requested/rendered view, data dependencies, fallback state, claim types, guardrails, and selection rationale. This is the governed contract for future voice-driven UI composition.
- Experience Plan artifact manifests that keep QBR drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes attached to evidence labels, source views, guardrails, review gates, circulation state, and disabled export state.
- Artifact readiness manifests backed by `src/data/config/artifact-readiness-requirements.json`. Generated QBR story drafts, talk tracks, agency briefs, evidence packets, learning practice, and decision notes now expose reviewer role, required evidence/source views, required language approvals, blockers, next action, prototype-review status, and a still-disabled export gate.
- Session artifact-readiness summaries that persist generated artifact posture across governed turns, exposing artifact counts, type/readiness counts, reviewer/evidence/source/language requirements, blocked export gates, review gate IDs, latest artifacts, and disabled export/copy/circulation/official approval/enterprise publishing flags.
- Review-only artifact circulation protocol steps inside the session artifact-readiness summary, separating draft capture, evidence/source-view coverage, human prototype review, stakeholder language approval, export/copy capability gates, and external circulation governance before any export or circulation affordance can be considered.
- Session evidence-spotlight summaries that persist claim-level proof across governed turns, exposing support-status counts, claim-type counts, supported evidence labels, missing-evidence IDs, source candidate IDs, guardrail claims, review-required claim IDs, latest claims, and disabled canonical claim-promotion / unsupported-claim-generation flags.
- An approved `evidence_spotlight_panel` dynamic view that renders claim-to-proof continuity inside Executive QBR, Insights Evidence Lab, Review Operations, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while canonical claim promotion and unsupported claim generation remain disabled.
- Per-turn voice runtime manifests that keep voice readiness tied to the same governed stream, compatible views, evidence, memory, audit, and confirmation gates as typed turns while continuous mode remains disabled.
- Session voice-runtime summaries that persist governed voice-runtime usage across turns, exposing runtime sources, modes, consent boundaries, stream events, compatible views, push-to-talk and typed-fallback readiness, governed-runtime/evidence-gate parity, and disabled continuous voice, Realtime, TTS, autonomous speaking, background listening, and provider-bypass flags.
- Per-turn voice skill/view contract manifests backed by `src/data/config/voice-skill-view-contract.json`, mapping push-to-talk, wake/listen, continuous voice, Realtime voice, and TTS to registered skills, approved voice-canvas views, visible state phases, and readiness blockers. Session `agent-session-voice-contract-v1` summaries persist compatibility across turns while continuous voice, Realtime voice, TTS, arbitrary skill routing, and arbitrary UI generation remain disabled or gated.
- Per-turn runtime quality checks that create an inspectable pass/watch/blocked layer for approved views/templates, evidence, source context, artifact gates, memory review, voice policy, and unsafe language.
- Session capability-readiness summaries that persist emitted capability state and runtime control posture across governed turns, exposing disabled high/medium-risk capabilities, blocked capability gates, required/reviewed gate IDs, admin override requirements, kill-switch history, next promotion requirements, and disabled export, circulation, memory-write, source-promotion, source-write, external-ingest, continuous-voice, and runtime-bypass flags.
- Session runtime-quality summaries that persist quality checks across governed turns, exposing pass/watch/blocked counts, consistently passing check IDs, watch/blocked IDs, human-review-required checks, latest checks, and consistency posture for approved experience, evidence, non-canonical source context, disabled export, memory review, continuous voice disabled state, provider adapters, voice orchestration, and runtime surfaces.
- An approved `runtime_quality_panel` dynamic view that renders persisted runtime self-checks inside Runtime Governance, Experience Architecture, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while promotion and bypass capabilities remain disabled.
- Per-turn canvas state manifests that keep the active workspace inspectable: plan/template/layout, focused/rendered/fallback views, artifacts, pending gates, proof-rail sections, evidence gaps, voice-compatible views, and no-arbitrary-UI recovery rails.
- Per-turn interruption/recovery manifests that preserve the last completed canvas, allow client stream abort in Agent Lab, block overlapping runs, expose typed recovery prompts, and keep server-side provider cancellation plus continuous voice barge-in disabled.
- Per-turn public status-step manifests that explain the governed operational sequence from intake through response preparation without exposing hidden reasoning.
- Per-turn conversation presence manifests that make the Agent Lab command core, orchestration bus, module queue, status steps, voice policy, and proof rail respond to governed push-to-talk runtime state while continuous listening, background wake word, and autonomous speaking remain disabled.
- Session canvas-continuity summaries that persist canvas state, interruption/recovery, public status steps, and conversation presence across governed turns, exposing latest canvas state, rendered/fallback/focused/compatible views, proof-rail sections, status phase counts, visible signals, pulse sources, and disabled arbitrary UI, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, and continuous voice barge-in flags.
- An approved `canvas_continuity_panel` dynamic view that renders persisted approved-view canvas continuity inside Experience Architecture, Foundation Readiness, and Executive Pilot workspaces, with voice-canvas compatibility and eval coverage while arbitrary UI generation, arbitrary view IDs, private reasoning exposure, server-side cancellation, continuous listening, wake word, autonomous speaking, and continuous voice barge-in remain disabled.
- Per-turn provider adapter manifests that map text reasoning, SSE streaming, browser STT, Realtime voice candidate, and TTS readiness before any provider is allowed to bypass the governed runtime, evidence, memory, audit, or confirmation gates.
- Session provider-adapter summaries that persist adapter readiness across governed turns, exposing ready/prototype/gated/disabled adapter posture, latest provider bindings, policy-review requirements, ready text/SSE paths, browser STT prototype state, and disabled provider bypass, Realtime runtime connection, TTS, and continuous voice flags.
- Per-turn voice orchestration readiness manifests backed by `src/data/config/voice-orchestration-readiness-requirements.json`, giving wake/listen, continuous voice, Realtime voice, and TTS an explicit promotion checklist for runtime parity, streaming/canvas parity, consent/privacy, interruption/cancellation, TTS policy, and enterprise transcript/memory storage.
- Session voice-readiness summaries that persist voice orchestration blockers across governed turns, exposing ready/prototype/blocked requirements, latest blockers, next promotion steps, consent/privacy, server-cancellation, and enterprise-storage readiness without activating wake/listen, continuous voice, Realtime voice, or TTS.
- Session voice-readiness activation protocol steps through `agent-session-voice-readiness-v1`, rendering governed push-to-talk runtime, browser STT prototype input, Realtime runtime unification, interruption/privacy, TTS speaking policy, and enterprise voice storage as separate review-only gates in `voice_readiness_panel`.
- An approved Voice Readiness Cockpit workspace that routes Jarvis-style voice readiness, provider adapter, Realtime voice, continuous voice, wake/listen, and TTS gate prompts through `inspect_voice_readiness` and renders `voice_readiness_panel` beside `provider_adapter_panel`, review workflow, and gap views while full voice remains gated.
- An approved Persistence Readiness Cockpit workspace that routes durable memory, durable audit, local JSON, enterprise persistence, retention/privacy, backup/recovery, and canonical source-promotion blocker prompts through `inspect_persistence_readiness` and renders `persistence_readiness_panel` beside review workflow and gap views while enterprise persistence, official approvals, canonical writes, and runtime source auto-consumption remain disabled.
- An approved Treatment Outcome Readiness Cockpit workspace that routes outcome learning, follow-up signal linkage, efficacy readiness, portfolio learning, and canonical learning blocker prompts through `inspect_treatment_outcome_readiness` and renders `treatment_outcome_readiness_panel` beside pilot learning, review workflow, and gap views while outcome learning, treatment efficacy claims, accepted outcome-record storage, and canonical learning stores remain disabled.
- An approved Runtime Governance Cockpit workspace that routes runtime surface readiness, runtime control, kill-switch posture, capability flags, governed surfaces, provider gates, and quality-check prompts through `inspect_runtime_governance` and renders `runtime_governance_panel` beside capability readiness, provider adapters, voice readiness, runtime quality, review workflow, and gap views while default scoped chat stays stable and risky capabilities remain gated or disabled.
- An approved Artifact Readiness Cockpit workspace that routes artifact readiness, export readiness, circulation readiness, QBR draft readiness, meeting artifact readiness, agency brief readiness, and artifact gate prompts through `inspect_artifact_readiness` and renders `artifact_readiness_panel` beside review workflow, evidence, and gap views while export, copy, circulation, and official approval remain disabled.
- An approved Source Promotion Readiness Cockpit workspace that routes source promotion readiness, source claim promotion, canonical source promotion, canonical fact, source candidate, source claim, and runtime source-consumption prompts through `inspect_source_promotion_readiness` and renders `source_promotion_readiness_panel` beside review workflow, persistence readiness, and gap views while canonical writes/facts, source data writes, source-claim promotion, official approval, and runtime auto-consumption remain disabled.
- An approved Experience Architecture Cockpit workspace that routes experience architecture, ExperiencePlan readiness, dynamic UI foundation, workspace-builder, approved-template, approved-view, and role-specific workspace prompts through `inspect_experience_architecture` and renders `experience_architecture_panel` beside canvas continuity, runtime governance, runtime quality, review workflow, and gap views while arbitrary UI generation, unregistered views, unsupported metrics, and new source claims remain disabled.
- Per-turn experience architecture manifests that expose approved template/skill/view counts, supported audiences/objectives/layouts, active workspace composition, unknown-view checks, composition blockers, and disabled dynamic UI generation / arbitrary view ID / unsupported metric / new-source-claim flags across runtime results, stream events, audit records, Agent Lab, skill-routed chat, and Live Consult fallback.
- Session experience-architecture summaries that persist approved workspace composition across governed turns, exposing template/audience/objective/layout usage, rendered/fallback/unknown views, artifact types, blockers, and next composition steps without enabling arbitrary UI generation, unregistered views, unsupported metrics, or new source-claim generation.
- Per-turn working context manifests that make loaded context explicit: accepted reviewed memory, suggested memory, reviewed-local source candidates, extracted source claims, review gates, and disabled auto-promote/canonical-write flags.
- Per-turn source governance manifests that make source posture explicit: reviewed-local source candidates, extracted source claims, Momentum source readiness, runtime source file-drop audit state, source review gates, and disabled canonical writes, canonical claim facts, runtime source auto-consumption, source-claim promotion, and source-data writes.
- Session source-governance summaries that persist source posture across governed turns as reviewed working context, exposing source candidate counts, source-claim observations, runtime file-drop state, Momentum source readiness, blockers, and next governance steps without promoting source candidates, source claims, or runtime file drops into canonical facts.
- Session runtime source-ingestion summaries through `agent-session-source-runtime-ingestion-v1`, exposing Momentum and Brand Strategic Context required/loaded/missing source-owner file kinds, file-kind readiness, governance blockers, and next ingestion step while default runtime source wiring, canonical use, runtime auto-consumption, file-drop consumption, and source-data writes remain disabled.
- Review-only default runtime source promotion protocol steps inside the session source-ingestion summary, separating Momentum file coverage, Brand Strategic Context file coverage, source-owner governance review, canonical-use governance, enterprise persistence readiness, and default runtime wiring before any runtime source-path promotion.
- An approved `source_runtime_ingestion_panel` dynamic view that renders source-owner file coverage, missing file kinds, runtime file-drop audit state, governance blockers, next ingestion step, and disabled source-consumption/canonical-use paths inside governed ExperiencePlan workspaces, with voice-canvas compatibility and eval coverage.
- Invalid/non-approved source-owner file-drop eval coverage that keeps unclean runtime file candidates blocked, missing, non-canonical, and out of answer evidence across governed JSON, stream, chat, and Live Consult fallback paths.
- Per-turn runtime surface manifests that make surface parity explicit: active surface, proof surface, runtime path, persistence, streaming/voice posture, ready/opt-in/legacy/gated/disabled surface sets, default scoped-chat preservation, and disabled full voice / Realtime / TTS / continuous voice flags.
- Session runtime-surface summaries that persist governed surface usage across turns, exposing which surfaces actually produced work, latest surface posture, streaming and push-to-talk counts, gated/disabled usage, and the review-only promotion protocol without activating Realtime, TTS, continuous voice, exports, source-write runtimes, or production certification.
- Default scoped `/api/chat` preservation eval coverage, proving non-opted-in chat stays on the legacy scoped response shape, exposes no governed runtime payload, and does not persist governed turns even when a session ID is supplied.
- Per-turn persistence readiness manifests backed by `src/data/config/persistence-readiness-requirements.json`, distinguishing prototype browser/local JSON persistence from blocked enterprise database, reviewer identity/access control, retention/privacy, backup/recovery, and canonical source promotion requirements.
- Per-turn review identity manifests backed by `src/data/config/agent-review-identity-policy.json`, keeping local review workflow in prototype reviewer-label-only mode while enterprise identity, role/brand access controls, official approvals, and canonical approval claims remain blocked.
- Per-turn quiet proactivity manifests that suggest reviewed follow-ups and held notices while keeping autonomous actions, reminders, external sends, scheduled notifications, and overlapping runs disabled.
- Session quiet-proactivity summaries that persist those per-turn manifests in the local ledger and expose accumulated suggestion counts, held notices, related evidence/gaps/gates/artifacts, allowed next skills, a review-only autonomous proactivity promotion protocol, and disabled automation/reminder/send/background/source-promotion flags without creating scheduled work.
- Per-turn pilot learning manifests that capture what a turn can teach the pilot as review-required signals, blocked learning paths, and next proof needs while autonomous learning, outcome learning, treatment outcome claims, canonical memory writes, and canonical source writes remain disabled.
- Session pilot-learning summaries that persist those per-turn manifests in the local ledger and expose accumulated signal counts, latest signals, blocked learning paths, next proof needs, and a review-only learning promotion protocol without promoting them to accepted pattern memory, source truth, or outcome evidence.
- An approved Pilot Learning Cockpit workspace that routes learning-summary prompts through `inspect_pilot_learning` and renders `pilot_learning_panel` beside review workflow, evidence, and gap views rather than relying on arbitrary generated UI.
- An approved Quiet Proactivity Cockpit workspace that routes follow-up/reminder/held-notice prompts through `inspect_quiet_proactivity` and renders `proactivity_panel` beside review workflow, evidence, and gap views while reminders, scheduled notifications, external sends, background runs, autonomous action, source promotion, and overlapping runs stay disabled.
- Per-turn treatment outcome readiness manifests backed by `src/data/config/treatment-outcome-readiness-requirements.json`, making future outcome-record schema, follow-up linkage, review identity, efficacy-rule, portfolio-store, and canonical-learning blockers visible while outcome learning, treatment outcome claims, accepted outcome-record storage, and canonical learning stores remain disabled.
- Session treatment outcome readiness summaries that persist the outcome-learning promotion checklist across turns, exposing ready/prototype/blocked requirements, related treatment paths, follow-up signals, learning signal IDs, and disabled outcome-learning / efficacy-summary / outcome-record / canonical-learning flags without creating outcome records or efficacy claims.
- Review-only outcome proof protocol steps inside the session treatment outcome readiness summary, rendering baseline capture, follow-up linkage, matched evidence, human review, efficacy-rule, and portfolio/canonical learning governance as blocked reviewer guidance rather than enabled outcome-learning, efficacy, or canonical-learning behavior.
- Draft treatment outcome record template at `/templates/treatment-outcome-record-template.json`, validated and linked from the Treatment Outcome Readiness Panel as a governance-review handoff only; it cannot create accepted outcome records, efficacy claims, portfolio learning, or canonical learning.
- Brand Strategic Context source-packet model with prototype-reviewed partial packets for Lay's and Siete.
- Accepted reviewed memory injection into future agent turns as active-brand working context, with suggested/rejected/blocked memory excluded.
- Brand Strategic Context validate -> preview -> promote importer UI with browser-local promoted versions and active packet injection into the Brand Intelligence Packet.
- Brand Strategic Context packet-level handoff/readiness requirements for source-owner approval, brand foundations/DNA, positioning/objectives/priorities, and creative platform/claims, surfaced in packet inspection while prototype/browser-local/reviewed-local context remains non-canonical.
- Disabled Brand Strategic Context source-owner runtime file-drop readiness lane with an approved-file bundle template, read-only server audit, packet/Brand Data/Source Readiness Panel surfacing, validation, and eval coverage while runtime consumption and canonical use remain off.
- Brand Strategic Context source-owner file-drop adversarial eval coverage for approved-looking, draft/empty, and malformed bundles across JSON, stream, explicit skill-routed chat, and governed Live Consult fallback, proving strategy files stay review-only, non-canonical, non-evidence, and cannot replace active Strategic Context or enable runtime/canonical strategy.
- Momentum Intelligence source-packet model with prototype-reviewed market context, peer-set metadata, room-to-grow inputs, and SMD contribution weights for Lay's and Siete, including validation, eval coverage, packet surfacing, and source-fed grid availability.
- Momentum Intelligence validate -> preview -> promote importer UI with browser-local promoted versions, a downloadable template, impact preview, and active packet injection into the Brand Intelligence Packet.
- Measured Growth Navigator fallback adapter for Momentum Intelligence source packets, with explicit caveats and no inferred SMD contribution weights.
- Multi-quarter Momentum Intelligence trend context and output-quality checks for source-period caveats, significance overclaim prevention, red momentum visibility, Ahead/Behind misuse, and SMD source gaps.
- Optional source-provided Momentum trend evidence fields for significance-tested metric movement and source-period compatibility, wired through source packets, importer normalization, template, kernel consumption, quality checks, and data validation.
- Governed Momentum source-extract adapter lane with reviewed/approved extract contract, split Doritos prototype source-owner fixture blocks, downloadable single-extract and source-owner bundle templates, packet-builder priority order, bundle merging, validation, and agent eval coverage.
- Momentum Source importer support for source-extract shaped JSON objects or arrays, mapping extracts through the adapter and promoting the converted Momentum packet as a browser-local version.
- Momentum Source importer support for source-owner file bundles that map separate approved market/share/penetration, BBE contribution-weight, and movement/significance files into governed extract blocks before validation and browser-local promotion.
- Runtime Momentum source file-drop readiness policy that defines the future source-owner landing zone and exposes blocked runtime/canonical-use state in the packet and source-readiness surfaces.
- Read-only server audit of the runtime Momentum source-owner landing zone, exposing candidate file counts and per-file-kind audit records without consuming files as packet evidence.
- Runtime source file-drop eval coverage for approved-looking, invalid/non-approved, and malformed candidates, proving file presence and parse failures can be inspected without enabling canonical use, runtime consumption, source writes, crashes, or answer evidence.
- Packet-level Momentum source readiness gates for source-owner extract approval, market/share/penetration inputs, BBE contribution weights, movement/significance evidence, and executive-use blocker state, now visible in a dedicated governed workspace.
- Momentum source-owner handoff requirements that turn each readiness blocker into an actionable source-owner checklist while keeping canonical writes and runtime auto-consumption disabled.

Still foundationally missing:

- Enterprise database persistence for reviewed session memory, artifacts, artifact readiness history, audit logs, source promotion records, and source claim records, plus governance for when reviewed-local source candidates may become canonical facts consumed by the runtime. The readiness checklist, prototype review identity rail, and local review workflow summary are now explicit, but enterprise identity/access control, official approval, and the broader blocked enterprise requirements are not yet implemented.
- Longitudinal outcome learning: per-turn and session-level pilot-learning summaries, treatment outcome readiness manifests, and a draft outcome-record handoff template exist, but accepted pattern memory, accepted treatment outcome records, efficacy summaries, and canonical learning stores are still not implemented.
- Official Brand Strategic Context source packets and durable promotion after governance review.
- Approved source-owner files wired into the default runtime source path after `agent-session-source-runtime-ingestion-v1` shows the ingestion gate is satisfied, replacing the split prototype fixture blocks and broadening contribution-weight, trend/significance, market/share, and penetration coverage.
- Full voice promotion: Realtime runtime unification, server-side cancellation, continuous-listening consent/privacy review, TTS policy, and enterprise voice transcript/memory storage remain blocked readiness requirements.

## Quality Loops

Before a capability graduates from prototype to pilot, run it through four loops.

### Loop 1: Foundation loop

- Is the data contract clear?
- Are source periods, markets, categories, and caveats explicit?
- Are missing inputs visible?
- Can this be updated without React edits?

### Loop 2: Reasoning loop

- Is the computation deterministic where it should be?
- Does the LLM only explain or orchestrate?
- Are alternative interpretations and counter-evidence surfaced?
- Are guardrails enforced?

### Loop 3: Experience loop

- Does the user understand the point in seconds?
- Can they drill into proof?
- Is the next action obvious?
- Does the view support a real BGS, AOP, QBR, learning, or meeting job?
- Can the same evidence produce different role-appropriate workspaces without changing source truth?
- Is the rendered experience clearly driven by an inspectable plan?

### Loop 4: Pilot-learning loop

- What did the user accept, reject, or challenge?
- Which evidence gaps blocked action?
- Which treatment paths were selected?
- What follow-up signals moved?
- What needs to become config, rule, skill, or view?
- Which signals are captured only for review, and which learning paths remain blocked until outcome evidence and enterprise governance exist?

## Future Data Extension

The foundation should expect richer data:

- Sales, share, velocity, penetration, buyer frequency, and category growth.
- Brand Strategic Context: approved brand book, brand DNA, brand foundations, positioning, brand objectives, portfolio role, annual planning priorities, creative platform, and approved claims.
- Consumer promotion engagement.
- Social and consumer interaction signals.
- Retail availability, display, shelf/search prominence, and ecomm signals.
- Media reach, creative, and brand asset evidence.
- AI discoverability / machine availability.
- Treatment outcome and follow-up signal history.

These should enter through source adapters and reviewed packets, not direct hard-coding into UI components.

## Brand Strategic Context

The system needs a home for what teams may variously call brand book, brand DNA, brand foundations, brand positioning, brand objectives, or brand strategy brief. The working system name should be **Brand Strategic Context** because it is neutral, broad, and understandable.

This context should eventually include:

- simple brand statement
- brand DNA / foundations
- positioning
- target consumer or growth audience, when approved
- portfolio role and caveats
- annual brand objectives
- strategic jobs to be done
- creative platform or comms idea, when approved
- distinctive assets or brand codes, when approved
- approved claims and claims not to make
- source owner, source date, and review status

Why it matters:

- prevents generic AI brand commentary
- grounds provocations in the actual brand ambition
- helps distinguish equity diagnosis from strategic intent
- lets the agent ask better clarifying questions
- improves QBR, agency brief, and meeting story outputs

Guardrail:

> If Brand Strategic Context is missing, the system can diagnose from BBE and support evidence, but it should not infer brand intent, annual objectives, creative platform, or approved positioning.

## Near-Term Build Strategy

Build beside the existing prototype:

1. Keep the six-section report stable and demo-ready.
2. Implement the Conversation Orchestrator and answer-quality evals described in `docs/product/archive/2026-07-foundation-and-calibration-history/CONVERSATION_ORCHESTRATOR_DESIGN.md`.
3. Add a governed answer composer so Agent Lab can match or beat the original scoped conversation quality while still using the hardened runtime as substrate.
4. Integrate Direct Answer, Answer And Offer, Approval Work Order, and Fail-Closed Governance modes into Agent Lab.
5. Use `source_runtime_ingestion_panel` as the read-only governed source-ingestion trust surface; keep invalid/non-approved/malformed file drops blocked and non-evidence, wire approved source-owner file drops into the default runtime source path only after `agent-session-source-runtime-ingestion-v1` shows the ingestion gate is satisfied, then replace the split source-extract fixture blocks with approved extracts that satisfy `momentumSourceReadiness`.
6. Preserve default scoped `/api/chat` as the stable report-side experience; keep governed runtime payloads on Agent Lab, stream, explicit skill-routed chat, and governed Live Consult fallback, with Agent Lab quick answers using the Conversation Orchestrator composed-answer path.
7. Use `memory_audit_panel`, `audit_trail_panel`, `review_identity_panel`, `provider_adapter_panel`, and `capability_readiness_panel` as read-only trust surfaces before promoting memory writes, audit export, official approval, provider bypass, full voice, export, circulation, source writes, or runtime bypass.
8. Deepen pilot-learning UX only where it improves reviewability; never convert learning signals into canonical facts or outcome claims.
9. Keep artifact readiness as review/proof metadata until stakeholder language, circulation policy, and the artifact export capability are approved.
10. Decide enterprise database persistence once reviewed workflows and governance requirements are clear.
11. Promote official Brand Strategic Context packets only after source-owner governance is clear, packet readiness checks are satisfied by approved source packets or approved source-owner file drops, and canonical-use governance plus persistence readiness allow runtime consumption.
12. Connect wake/listen, continuous voice, or Realtime voice orchestration to the same runtime and approved view/action contracts only after the voice orchestration readiness manifest has no blocked requirements for Realtime parity, consent/privacy, interruption/cancellation, TTS policy, and enterprise storage. Keep the current OpenAI TTS adapter as chained output until then.

This sequence protects the working demo while creating the foundation for the more ambitious voice/chat-first experience.
