# Jarvis Immersive Command Layer vNext Plan

## Purpose

Build a premium, highly interactive voice/chat agent experience **beside** the current working Brand Assistant, not in place of it.

The current `/brand/[brandId]/assistant` route remains the stable product-facing assistant. The vNext Jarvis immersive command layer should be developed as an alternative route:

```text
/brand/[brandId]/jarvis
```

This lets us test the futuristic interaction model without destabilizing the answer quality, proof disclosure, voice fallback, governed work approval, or dynamic work canvas that already work today.

The design correction from user testing is important: **Jarvis should not look like another app page or card dashboard.** It should feel like an immersive command environment: central brand-intelligence core, translucent peripheral readouts, ambient transcript, summoned work canvas, live state motion, and approval/build/proof moments that visibly assemble around the active brand.

## Product Goal

The user should feel like an expert brand-growth agent is in the room:

- able to talk or type naturally,
- able to answer direct questions immediately,
- able to recognize when heavier work is needed,
- able to ask permission before work execution,
- able to visibly assemble reports, proof packs, learning paths, treatment reads, and diagnostics,
- able to keep the conversation aware of the active work canvas,
- able to show proof, gaps, guardrails, and review gates as first-class trust surfaces.

The end state is not a sci-fi skin. It is a live working environment where the UI reacts to the agent's actual reasoning contract, work plan, evidence, and approvals. The experience should borrow the useful language of Jarvis/FUI interfaces: full-screen presence, layered HUD surfaces, spatial work zones, scanning/building/proving motion, and voice-first command feel, while remaining PepsiCo-branded and governed.

## Non-Negotiable Constraint

Do not replace the stable Assistant until vNext beats it in user testing.

Stable surfaces stay intact:

- `/brand/[brandId]/assistant`
- `/brand/[brandId]/conversation`
- `/brand/[brandId]`
- `/agent-lab`
- `/api/assistant`
- `/api/agent`
- `/api/agent/stream`

vNext can reuse the brain and APIs, but it should have its own route, components, state model, and experimental UX layer.

## Existing Platform We Reuse

The vNext workbench should build directly on the platform already created:

- `BrandIntelligencePacket`
- scoped Brand Doctor LLM direct-answer path
- `/api/assistant` decision brain
- `/api/assistant/realtime/session`
- `/api/agent/stream`
- skill registry
- dynamic view registry
- `ExperiencePlan`
- `DynamicViewRenderer`
- proof disclosure
- evidence spotlight
- gap and guardrail logic
- approval work orders
- transcript diagnostics
- local session/audit/memory manifests

This is why vNext is feasible now. The foundation already knows what the agent can answer, what it can build, what evidence it has, what is missing, and what must stay gated.

Jarvis should use the same Agent Reality Boundary foundation as the stable Assistant. The premium shell can be more immersive, but it should not invent separate capability language. "Latest" means latest loaded packet unless live data is wired. "CMO-ready" means CMO-review draft unless official approval exists. Share/export/circulation stays gated. Available-today, prototype governed workspace, and gated/future capability buckets should remain consistent across Assistant, Jarvis, and Brand Work Items.

## Recommended Frontend Architecture

### 1. Custom Next.js Jarvis Immersive Shell

Build the vNext frontend in our app, not as a generic third-party shell.

Suggested route:

```text
app/brand/[brandId]/jarvis/page.tsx
app/brand/[brandId]/jarvis/JarvisWorkbenchClient.tsx
src/components/jarvis/*
```

Core layout:

```text
Jarvis Immersive Command Layer
├─ Central Brand Intelligence Core
│  ├─ active brand patient / category / period
│  ├─ listening / thinking / speaking / approval / building / ready states
│  └─ visible scan/build/proof motion
├─ Ambient Conversation Rail
│  ├─ text + voice transcript
│  ├─ suggested next moves
│  └─ concise direct-answer thread
├─ Dynamic Work Canvas
│  ├─ approval gate
│  ├─ ExperiencePlan zones
│  ├─ DynamicViewRenderer stack
│  ├─ proof / gap / guardrail surfaces
│  └─ artifact and follow-up tray
├─ Peripheral Runtime Readouts
│  ├─ evidence / gaps / guardrails / mode
│  └─ Ask → Decide → Plan → Build → Prove → Review
└─ Command Dock
   └─ typed input now, voice adapter next
```

### 2. AG-UI-Style Event Protocol

Use an internal event protocol inspired by AG-UI. We do not need to adopt a third-party protocol on day one, but we should shape the contract similarly so we can integrate CopilotKit/AG-UI later if useful.

New event stream target:

```text
/api/assistant/events
```

Events should be serializable, append-only, and UI-friendly:

```ts
type JarvisEvent =
  | { type: 'session_started'; sessionId: string; brandId: string }
  | { type: 'assistant_state'; state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'approval' | 'building' | 'ready' }
  | { type: 'user_message'; text: string; inputMode: 'text' | 'voice' }
  | { type: 'answer_delta'; text: string }
  | { type: 'answer_ready'; writtenAnswer: string; spokenAnswer?: string }
  | { type: 'assistant_response_ready'; response: UnifiedAssistantResponse }
  | { type: 'decision_ready'; mode: 'direct_answer' | 'answer_and_offer' | 'approval_work_order' | 'fail_closed_governance' }
  | { type: 'approval_required'; workSpec: unknown; summary: string }
  | { type: 'workspace_progress'; step: 'ask' | 'decide' | 'plan' | 'build' | 'prove' | 'review'; status: 'waiting' | 'active' | 'complete' | 'watch' }
  | { type: 'experience_plan_ready'; plan: unknown }
  | { type: 'view_requested'; viewId: string; zone?: string }
  | { type: 'proof_update'; evidenceCount: number; gapCount: number; guardrailCount: number }
  | { type: 'workspace_ready'; turnId: string }
  | { type: 'error'; message: string; recoverable: boolean };
```

The vNext frontend listens to events and animates state. The agent brain remains the same.

### 3. Voice Transport Adapter

Do not hard-code vNext to one voice vendor.

Create a provider boundary:

```ts
type VoiceTransport = {
  id: 'openai_realtime' | 'livekit' | 'browser_fallback';
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sendText?: (text: string) => Promise<void>;
  onTranscript: (callback: (text: string) => void) => void;
  onState: (callback: (state: VoiceState) => void) => void;
};
```

Recommended order:

1. Keep current OpenAI Realtime as the first voice transport because it already works in the app.
2. Add LiveKit as an optional transport only when we need stronger session orchestration, rooms, observability, interruption handling, or future multi-participant scenarios.
3. Keep browser STT/TTS fallback as a recovery path.

LiveKit is infrastructure, not the product frontend. If we adopt it, it should feed the same Jarvis event stream and the same `/api/assistant` brain.

### 4. Constrained Dynamic UI

Do not generate arbitrary React/HTML in the POC.

The agent should produce:

```text
ExperiencePlan + DynamicViewRequest[] + proof/gap/guardrail metadata
```

The frontend renders approved components through:

```text
DynamicViewRenderer
```

This gives the user the feeling of "build anything useful for me" while preserving governance, brand consistency, and evidence integrity.

Future AG-UI/CopilotKit integration can sit on top of this contract. The key is that our current `ExperiencePlan` is already the safe version of generative UI.

## vNext Design Principles

1. **Conversation stays primary**
   - Direct questions should answer fast.
   - The UI should not force every question into a work order.

2. **Work is visible**
   - When the agent builds, the canvas should visibly move through plan/build/prove/review.
   - This should feel like work being assembled, not a page suddenly appearing.
   - The central orb is the primary work-visibility surface. It should feel like a governed brand brain becoming active, not a separate status card pasted on top of the interface.
   - Do not expose private chain-of-thought. Show an operational trace only: instruction intake, brand packet loading, evidence checks, diagnosis/treatment routing, approved-skill selection, proof/caveat review, and review gates.
   - Activity intensity should scale with task complexity. Idle is quiet. Simple direct answers light one or two rings. Evidence/diagnosis asks activate more scan motion and a few evidence nodes. Governed work builds should feel like a brain scan with multiple orbit nodes lighting in sequence around Scope, Evidence, Skill, Views, Proof, and Review.

3. **Approval is beautiful**
   - Approval gates should feel like a premium product safety moment, not an error or blocker.
   - Approval should slow and focus the orb into a review posture, using restrained orange/shield energy rather than an error treatment.

4. **Proof is always close**
   - Evidence, gaps, and guardrails should appear beside work, not buried in a debug rail.

5. **Voice and text are equal inputs**
   - Voice should not be a separate product.
   - Text and voice should drive the same event stream and work canvas.

6. **The current app remains safe**
   - vNext can be ambitious because the stable Assistant is still there.

### Jarvis Thought Core Alignment

The immersive route should use a Jarvis Thought Core instead of a modal-like status pop-up or bright task carousel.

Default idle state:

- Central orb breathes quietly.
- One phrase appears: `Waiting for instructions...`
- No task cards, no broad workflow menu, and no explanatory chrome before the user asks.

Active states:

- Listening: `Listening...`
- Thinking/direct answer: show one operational phrase such as `Checking brand record...`, `Reading BBE evidence...`, or `Reviewing caveats...`
- Evidence/diagnosis: light BBE, Growth, Diagnosis, and Caveats nodes around the orb.
- Governed work/build: light the most nodes and strongest scan sweeps, using Scope, Evidence, Skill, Views, Proof, and Review as the work trace.
- Approval: pause into `Review required before build.`
- Ready: `Ready with proof.`

The user should feel Jarvis doing more work when the request is more complicated, while the product stays honest: the UI reveals governed operations and evidence handling, not hidden model reasoning.

### Goal + Composition Planner Alignment

The next Jarvis behavior layer should use the Modular QBR + Goal Composition Planner in `docs/product/QBR_MODULAR_ARTIFACT_AND_GOAL_PLANNER_PLAN.md`.

Jarvis should treat the central orb and work canvas as the visible expression of a governed planning contract:

- Direct questions stay conversational and end with grounded next-best actions.
- Explicit QBR/build asks become reviewable work orders with inferred goal, audience, composition mode, selected modules, data needs, assumptions, and guardrails.
- Ambiguous artifact asks receive one focused clarification only when the answer changes the artifact.
- The same QBR foundation can assemble Executive QBR, Evidence Read, Treatment Read, or Assumption/Readiness Read outputs.
- The Thought Core can light up more intensely for broader compositions, but it should only reveal safe operational traces such as evidence checks, module selection, proof review, and gate review.
- Review-draft, loaded-packet, source-readiness, and export/circulation-gated language must continue to come from shared product-truth layers rather than Jarvis-only copy.

## Build Plan

### Phase 0 — Protect Stable Assistant

Deliverables:

- Keep `/brand/[brandId]/assistant` unchanged except for explicit bug fixes.
- Add vNext route and docs only.
- Add navigation from Assistant to Jarvis Preview only after the route is stable.

Acceptance:

- Existing Assistant test path still works.
- `pnpm validate:data`, `pnpm typecheck`, and `pnpm build` pass.

### Phase 1 — Jarvis Preview Shell

Status: first slice implemented on 2026-06-30, then visually corrected into an immersive command layer.

Deliverables:

- Add `/brand/[brandId]/jarvis`.
- Reuse the stable Assistant brain for text turns.
- Render transcript, central brand-intelligence core, orchestration timeline, proof readouts, and dynamic work canvas.
- Add the first user-initiated Realtime voice transport on the same event-stream path.
- No replacement of current Assistant.

Acceptance:

- User can ask `Tell me about Lay's momentum.`
- Direct answer appears in transcript.
- Presence/timeline states update from the Jarvis event stream.
- Existing Assistant route is untouched.

Implemented:

- `/brand/[brandId]/jarvis` route and `JarvisWorkbenchClient`.
- `/api/assistant/events` event stream and `jarvis-events.ts` contract.
- Typed turns call the event stream, which wraps `runUnifiedAssistantTurn()` with active brand and compact conversation history.
- Direct answers render in the conversation rail with suggested next moves.
- The Jarvis route now renders as a full-screen immersive command layer with central brand core, HUD-style peripheral readouts, ambient transcript, dynamic work canvas, and command dock.
- The command dock can start/stop a user-initiated OpenAI Realtime session through the existing `/api/assistant/realtime/session` endpoint.
- The Realtime tool calls the same Jarvis `ask()` event stream before speaking, so voice and typed turns share the Assistant brain, transcript, proof counts, approval decisions, and next moves.
- If Realtime cannot connect or errors mid-session, the same mic control can drop into browser fallback: one captured STT turn, the same Jarvis event-stream decision path, short browser TTS answer, and explicit spoken approval for pending governed work.
- The command dock now carries compact consent/privacy boundary copy: voice starts only when the user presses the mic, local prototype diagnostics may be recorded, and diagnostics are not source evidence.
- The command dock and Present Work floating control now swap Send for Cancel during active answer/work states. Cancellation aborts in-flight answer streams or governed workspace streams and stops browser fallback capture/speech.
- The first-viewport Jarvis core now includes mission presets that trigger real approved paths: Momentum Read, CMO Pilot, Workspace Builder, Voice Gates, and Agency Brief.
- The stable Brand Assistant navigation now includes a featured `Jarvis Preview` link so testers can intentionally move from the working assistant into the immersive command layer without replacing the stable route.
- Approval-required asks render a premium approval panel in the work canvas.
- Approved preview work streams the existing governed `/api/agent/stream` runtime, advancing the HUD timeline from real runtime events before rendering approved views with `DynamicViewRenderer`.
- The underlying Assistant Dynamic Work Spec planner now selects approved skills/templates/views from the ExperiencePlan registry for broader explicit work asks, including executive pilot runbooks, experience architecture, voice readiness, agency briefs, learning, QBR, treatment, source readiness, and governance work.
- `pnpm eval:agent` now includes assistant-level planner acceptance scoring for those broad work-order asks, proving the chat/voice front door produces approved `dynamic-work-spec-v1` work specs before any governed runtime execution.
- Focus Work mode lets approved dynamic work become the main artifact surface while the brand core collapses into a compact command rail and the transcript hides until the user exits focus.
- Present Work mode hides the shell chrome and gives the approved work output the full viewport for demo/review, while preserving proof, timeline, dynamic views, and a clear restore control.
- Present Work also keeps a floating voice/text command control available. Follow-up answers continue in the hidden transcript while the visible proof/timeline readouts remain tied to the active work artifact.
- Jarvis now writes prototype-local diagnostic records to the existing `/api/assistant/transcript` store with `surface: "jarvis-preview"`. Direct answers, approval moments, streamed governed work results, and errors can be reviewed after a test session without promoting conversation content into canonical evidence or enterprise memory.
- The first focus pass removes static explanatory chrome from the idle state. Activity details and the work timeline now appear around the center activity lens/orb when Jarvis is actively thinking, asking for approval, or building work. The right rail is no longer an always-on governed-output cockpit.
- The right rail is now a compact Recent Work shelf. It loads persisted brand work records, shows active approval/building as one row, links completed/review-required items to focused work URLs, and keeps "All Work" as the durable shelf path.
- Browser smoke target: Lay's momentum direct answer, QBR approval gate, approved QBR preview build, and dynamic view rendering.

Known limitations:

- Voice is user-initiated only. Wake word, background listening, enterprise transcript storage, production voice governance, and production-grade interruption policy are still future hardening.
- The first voice transport uses OpenAI Realtime directly; LiveKit remains an optional infrastructure adapter if session orchestration needs exceed the current transport.
- The immersive UI is still evolving. Next polish should deepen focused work pages into high-fidelity artifacts, connect Jarvis follow-up context to the selected work item, and tune the activity lens/orb motion while keeping the default screen calm.

### Phase 2 — Event Stream Contract

Deliverables:

- Extend the Jarvis client so approved work streams `/api/agent/stream` events into the same UI contract.
- Emit direct-answer, approval, work progress, proof, gap, view, and workspace-ready events.

Acceptance:

- The Jarvis shell updates progressively from events.
- Work order asks pause for approval.
- Approved work streams into the canvas.

### Phase 3 — Voice Transport Boundary

Status: first Realtime transport slice implemented in the Jarvis route.

Deliverables:

- Extract current OpenAI Realtime/browser fallback code into a `VoiceTransport` adapter.
- Use the same event stream for voice and typed turns.
- Keep current Assistant voice untouched.

Acceptance:

- Jarvis Preview can start a voice session.
- Voice transcript drives the same decision/workflow path as typed input.
- Fallback path remains available.

### Phase 4 — LiveKit Spike

Deliverables:

- Add LiveKit token/session endpoint behind feature flags.
- Add a LiveKit transport adapter if credentials are configured.
- Connect LiveKit transcript/tool calls to `/api/assistant/events`.

Acceptance:

- LiveKit can be enabled without removing OpenAI Realtime.
- If LiveKit config is absent, Jarvis Preview falls back cleanly.

### Phase 5 — Demo-Grade Dynamic Work

Deliverables:

- Build two or three premium end-to-end flows:
  - Lay's momentum → CMO read → QBR proof canvas.
  - Lay's diagnosis → treatment path → learning/diagnostic workspace.
  - "What can you do?" → expert intro → live capability canvas.

Acceptance:

- The work canvas feels alive.
- Follow-up questions understand the active canvas.
- Proof/gaps/guardrails are obvious.
- The stable Assistant still works.

## Tooling Recommendation

Use now:

- Next.js / React
- Current `/api/assistant`
- Current `/api/agent/stream`
- Current `DynamicViewRenderer`
- CSS or Framer Motion for premium transitions

Evaluate after Phase 2:

- CopilotKit / AG-UI if our internal event stream needs standardization.
- LiveKit if OpenAI Realtime/browser fallback is not enough for session quality.
- Vercel AI SDK generative UI only if it helps stream React Server Components safely inside our app.

Avoid for now:

- arbitrary generated HTML/React,
- replacing the current Assistant,
- vendor-specific Jarvis templates as the core app shell,
- making LiveKit responsible for product logic or dynamic views.

## Decision

Build vNext in parallel.

The stable Assistant remains the proof that the brain works. Jarvis Workbench vNext becomes the proving ground for the premium interaction layer, event-driven dynamic UI, and optional LiveKit-grade voice/session infrastructure.
