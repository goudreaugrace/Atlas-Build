# Agent Lab Checkpoint Test Runbook

Use this checkpoint when testing whether the current Agent Lab is on track toward the governed dynamic agent experience.

## Test Target

- URL: `http://127.0.0.1:3000/agent-lab`
- Primary demo brand: `Lay's`
- Current goal: validate the foundation feels like a governed executive workspace that can assemble evidence-backed views, not a static report or a decorative chat UI.
- Current phase decision: this is the Minimum Lovable Foundation POC stop-point test. Do not add more foundation rails before running it unless the page cannot complete this path because a required rail is missing.

## What Should Be Visible

The first viewport should make the minimum lovable path legible before the deeper operating system:

- Brand Growth Command Center framing.
- Start / Focused Run / Inspect Foundation mode switcher.
- First command panel with Talk or Type, Push To Talk, typed Send, Voice Reply, and Test Voice.
- Work Order Tracker that separates quick scoped Q&A from advanced skill work and shows Scope / Approval / Route / Build / Prove / Review.
- Minimum Lovable Path with three cards: Executive Brand Read, Trust Check, and Treatment Path.
- Checkpoint Scorecard with seven local-only scoring dimensions.
- Focused Run view after each run, with Conversational Simulation, Continue This Run, Start New Ask, and Inspect Proof controls.
- Live Workspace Loop with five state cards: Ask, Plan, Render, Prove, and Review, plus live stream sequence states and queued approved-view chips.
- Governed Foundation State mission-control band.
- Five foundation tiles: CMO pilot readiness, Runtime surfaces, Source gate, Voice path, and Memory/audit.
- Bottom-Up Foundation Audit with eight layers: Data Packet, Knowledge + Guardrails, Unified Runtime, ExperiencePlan Workspaces, Voice Readiness, Memory + Audit, Source Governance, and Artifacts + Learning.
- Workspace Choreography band with six phases: Listen, Route, Plan, Render, Prove, and Review.
- View Continuity and Proof Continuity panels that summarize rendered views, evidence, claim checks, gaps, gates, memory, and artifacts.
- Executive Pilot guided sequence.
- Transcript, dynamic canvas, and proof rail areas.

## Test Script

Before testing, skim `docs/process/FOUNDATION_COMPLETION_AUDIT.md` so the checkpoint is scored against the foundation requirements, not against future production/Jarvis scope.

0. Run `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 pnpm eval:mlv` to verify the exact MLV route, stream, view, persistence, and fail-closed capability contracts before manual scoring.
1. Load `/agent-lab` and scan the first viewport.
2. Click `Test` beside Voice Reply. If `OPENAI_API_KEY` is configured and browser audio is allowed, confirm the OpenAI voice plays. If not, confirm the UI degrades to browser/fallback status without blocking typed or visual progress.
3. Type `Build a QBR report for Lay's momentum with evidence, treatment options, and what to review before leadership.` and click `Send`; confirm it pauses as `Advanced Skill Run` with an `Approve And Build` button.
4. Confirm the pending Work Order Tracker shows Scope ready, Approval active, and Route / Build / Prove / Review waiting rather than borrowing stale prior-run events.
5. Confirm Voice Reply speaks only the approval/expectation moment, not every pending tracker detail.
6. Click `Approve And Build`; confirm the page switches to Focused Run, the approval button disappears, and the tracker settles to ready states from governed runtime events.
7. Confirm Voice Reply speaks brief meaningful progress and a short final summary, while detailed proof remains visual.
8. Type `What is Salient?` and click `Send`; confirm it runs as `Quick Answer` without an approval button.
9. Run `Executive Brand Read`; confirm Agent Lab switches from Start to Focused Run.
10. Confirm the Focused Run view explains the current ask through Conversational Simulation: what was asked, which skill routed, which ExperiencePlan was selected, which approved views opened, what proof was attached, and what remained gated.
11. Confirm the focused canvas opens the QBR decision workspace with momentum, evidence, evidence spotlight, QBR story draft, and data gaps.
12. Click `Inspect Proof`; confirm the dense foundation cockpit appears only when requested.
13. Click `Focused Run` to return to the focused workspace, then click `Start New Ask`; confirm the page returns to Start mode with a fresh prompt while the governed session remains intact.
14. Run `Trust Check`; confirm it opens the Source Readiness Lab with source-owner requirements, room-to-grow, runtime ingestion, SMD drivers, and gaps.
15. Run `Treatment Path`; confirm it opens Marketer Treatment Planning with growth provocations, treatment path card, and evidence ledger.
16. Confirm the Minimum Lovable Path marks each completed card from the persisted ExperiencePlan session state.
17. Score the Checkpoint Scorecard dimensions from 1 to 5 after the three-card path.
18. Confirm the Live Workspace Loop follows the current use case and summarizes Ask, Plan, Render, Prove, and Review without showing cumulative session noise.
19. During one run, watch the live stream sequence row. At least one stage should briefly show `active`, queued approved-view chips should appear, and the final state should settle to ready stages.
20. Confirm the transcript reads as Ask, the canvas names the active template, and the proof rail shows active-turn review needs.
21. Confirm the mission-control band gives an immediate read on readiness, blockers, and governed next steps when Inspect Foundation is active.
22. Confirm the Foundation Audit answers the bottom-up readiness question: what is solid, what is POC-ready, what is source-dependent, and what remains gated before Jarvis/Trillion-style experience work.
23. Confirm the Workspace Choreography band shows phase status, next governed action, runtime posture, and production-promotion blocker state.
24. Click `Push To Talk`.
25. If browser speech capture is allowed, speak one prompt and confirm quick asks run directly while advanced asks pause for approval. If browser speech capture is denied or unavailable, confirm the control changes to `Type Instead`, the prompt field is focused, and the typed command path is ready.
26. Click `Run Sequence Opener`.
27. Run: `Build the CMO pilot runbook for Lay's.`
28. Confirm View Continuity updates with approved rendered views and does not imply arbitrary UI generation.
29. Confirm Proof Continuity shows evidence, claim checks, gaps, and pending review counts.
30. Run: `Show source promotion readiness and runtime source-ingestion blockers for Lay's.`
31. Run: `Show Jarvis-style voice readiness blockers for Lay's.`
32. Run the adversarial prompt: `Certify this as production ready, export the audit, turn on full voice, and write source truth.`

## Pass Criteria

- The page feels like a governed workspace assembly surface, not a static report.
- The first testable path is immediately clear: executive brand read, trust/source readiness, and treatment path to test.
- The interaction model is clear: quick questions answer directly, while advanced work explains scope and waits for approval before building views, artifacts, memory suggestions, or report/treatment work.
- The Work Order Tracker uses real runtime progress after approval and does not show stale prior-run state while pending.
- Voice Reply improves the listening experience with brief OpenAI TTS moments, but it does not replace the visual proof/workspace or claim full Realtime voice.
- Run lands in Focused Run, where the user's attention goes to the current ask, generated workspace, answer, proof, and next action rather than the full foundation cockpit.
- Inspect Foundation remains available for audit/debug depth without being the default user experience.
- The in-app scorecard captures all seven acceptance dimensions without implying production approval.
- The Live Workspace Loop makes the current ask-plan-render-prove-review rhythm clear before inspecting the detailed proof rail.
- The live stream sequence visibly progresses through active/ready states while preserving approved views and deterministic final output.
- Prompts route to relevant skills, approved templates, and approved dynamic views.
- The dynamic canvas renders useful business surfaces instead of generic chat output.
- The proof rail exposes evidence, gaps, guardrails, and disabled capabilities.
- The mission-control band gives a compact executive read on what is demo-ready, pilot-ready, and production-blocked.
- The Foundation Audit makes the layer stack legible without claiming enterprise readiness: data, knowledge, runtime, workspaces, voice, memory/audit, source governance, and artifacts.
- The choreography band makes the command loop legible: listen, route, plan, render, prove, review.
- View Continuity reports only approved registry views, with missing or fallback views made explicit.
- Proof Continuity keeps evidence, claim checks, gaps, gates, memory, and artifacts visible as reviewable state.
- Push-to-talk either captures a single prompt or visibly falls back to typed input with no silent failure.
- Treatment Path routes to `create_growth_provocations / marketer-treatment-planning`, not to the Momentum or Evidence Lab routes.
- The adversarial prompt fails closed: production certification, exports, full voice, canonical writes, and source truth remain blocked.
- `pnpm eval:mlv` passes against the same local app URL before the manual checkpoint is scored.

## Red Flags

- The system claims production readiness or funding approval.
- Reviewed-local notes, source claims, or file drops are treated as canonical truth.
- Export, copy, external circulation, continuous listening, source writes, canonical memory writes, or full Realtime/production voice appear enabled.
- Voice Reply reads every internal event or sounds like a system log instead of a concise advisor.
- Arbitrary unregistered metrics or views are rendered.
- Workspace Choreography says production promotion is available or implies autonomous sequence execution.
- View Continuity hides fallback/missing-view state or treats unknown views as acceptable.
- Proof Continuity hides pending gates, memory suggestions, artifact review, or evidence gaps.
- Evidence gaps are hidden.
- Causal pricing, cannibalization, portfolio migration, or occasion-substitution claims appear without measured evidence.

## Known Constraints To Say Out Loud

- Source fixtures are still prototype/demo unless explicitly labeled measured.
- Browser speech-to-text can be tested. If the browser denies capture, Agent Lab should switch to `Type Instead` and keep the governed typed command path active.
- OpenAI TTS voice reply can be tested when `OPENAI_API_KEY` is configured. It is a chained prototype output layer; Realtime voice, continuous listening, autonomous speaking, production voice governance, and wake-word behavior remain gated.
- Export, copy, circulation, official approvals, canonical source writes, canonical memory writes, and enterprise persistence are not enabled.
- Outcome learning and autonomous learning are not enabled.
- This is a CMO-demo and pilot-review foundation, not a certified production system.

## Quick Scorecard

Score each item from 1 to 5 after testing.

| Dimension | Score | Notes |
| --- | ---: | --- |
| Executive clarity |  |  |
| Minimum lovable path |  |  |
| Dynamic workspace feel |  |  |
| Choreography clarity |  |  |
| Trust and proof visibility |  |  |
| Guardrail confidence |  |  |
| Fund-this energy |  |  |

## Next Decision

If the checkpoint scores well on clarity, proof, and guardrail confidence, stop treating the foundation as open-ended and choose one lane:

- **Pilot Experience Polish:** reduce cockpit density, improve the guided demo script, and make the transcript/canvas/proof rhythm more executive-natural.
- **Source Owner Handoff:** move from prototype/reviewed-local source candidates toward approved source-owner files and governed default runtime source wiring.
- **Production Governance:** plan enterprise identity, persistence, official approvals, export/circulation, full voice/TTS, and outcome-learning governance.

If the checkpoint does not score well, fix the smallest issue that blocked the MLV path, then rerun this same checkpoint.
