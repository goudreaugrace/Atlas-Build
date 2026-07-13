# Conversation Orchestrator Design

## Purpose

This document corrects the Agent Lab product direction after initial testing found a quality regression: the original scoped Brand Doctor conversation produced stronger, more human, more useful answers than the new governed Agent Lab answer text for simple questions like "tell me about Lay's momentum."

The fix is not to abandon the governed foundation. The fix is to put a high-quality conversational intelligence layer back on top of it.

## Implementation Status

Core slice implemented on 2026-06-29:

- `/api/agent/conversation` classifies prompts into Direct Answer, Answer And Offer, Approval Work Order, and Fail-Closed Governance.
- The conversation endpoint runs `runAgentTurn()` as the governed substrate, then composes a user-facing answer from packet facts, evidence, caveats, runtime quality, and capability gates.
- Agent Lab quick-answer prompts use the composed conversation path; approved advanced work still streams through `/api/agent/stream`.
- `pnpm eval:agent` compares default scoped chat, explicit governed chat, and Agent Lab conversation for the Lay's momentum regression prompt, then verifies advanced work-order and governance-overreach decisions.

Remaining work is experience tuning, not foundation architecture: reduce spoken over-narration, tune offer language, and validate with the user whether the quick-answer path now feels as strong as the original conversation.

## Product Principle

> Smooth conversation first. Governed orchestration when the work requires it.

Brand Doctor should feel like one smart strategist, not two products. A user should be able to talk or type naturally and get the same high-quality answer style they liked in the original version. When the ask implies deeper work, the same agent should recognize that and offer or execute an orchestrated skill, workspace, view, artifact, or review flow.

## Bi-Modal Interaction Model

### Mode 1: Conversational Answer

Use this for fast, natural, high-quality interaction.

Best for:

- "Tell me about Lay's momentum."
- "What is going on with this brand?"
- "How would you explain this to the CMO?"
- "What should I worry about?"
- "Why is Demand Power declining?"

Behavior:

- Answer directly before exposing machinery.
- Use the original scoped conversation quality as the standard.
- Synthesize the read into human strategy language.
- Include only the evidence and caveats needed for the user's question.
- Keep focused asks focused: answer the question in one short paragraph or up to three crisp bullets, then stop.
- Offer deeper work when useful through two or three natural next prompts instead of pre-answering every adjacent topic.
- Keep proof, source readiness, gates, and audit visible in the UI, not stuffed into the first answer.

Example:

```text
Lay's is still very strong, but the momentum read is a warning light: Demand Power and Meaningful are declining while Salient, Different, and Perceived Value are holding. So this is not a weak-brand story. It is a relevance-renewal story. The brand still has scale and memory, but the edge may be leaking.

I can also build this into a QBR momentum read with the proof, gaps, and treatment paths.
```

### Mode 2: Orchestrated Work

Use this when the ask implies a deliverable, workspace, or higher-risk action.

Best for:

- "Build a QBR report."
- "Create a dashboard."
- "Compare Lay's and Doritos."
- "Prepare an agency brief."
- "Show me the proof and gaps."
- "Create treatment options for leadership."
- "Certify this, export it, turn on full voice, or write source truth."

Behavior:

- Clarify the intended work when needed.
- Explain what will be built.
- Ask for approval before heavier work orders or review-sensitive artifacts.
- Route to approved skills, ExperiencePlans, views, artifacts, gates, memory, and audit.
- Keep production/export/source/voice/official approval paths fail-closed.
- Show progress visually through Ask / Plan / Render / Prove / Review.
- Use the conversational layer to summarize what happened in human language.

## Core Architecture

```text
User talk/type
-> Conversation Orchestrator
-> Intent and mode decision
   -> Conversational Answer Mode
      -> governed packet/context
      -> high-quality LLM answer composer
      -> optional offers for workspaces/views/reports
   -> Orchestrated Work Mode
      -> runAgentTurn()
      -> skill router
      -> ExperiencePlan
      -> approved dynamic views/artifacts
      -> proof, gates, memory, audit
      -> high-quality LLM result composer
-> Voice/text output
-> Visual workspace/proof rail
```

The governed runtime remains the source of truth for facts, evidence, views, gates, and audit. The LLM composer is the human storytelling layer. It may explain, synthesize, translate, compare, and challenge, but it must not invent diagnoses, treatments, unsupported facts, source truth, approvals, exports, or production readiness.

## Mode Decision Contract

The Conversation Orchestrator should classify every ask into one of four outcomes:

1. **Direct Answer**
   - Fast answer only.
   - No work order.
   - Optional proof chips.

2. **Answer And Offer**
   - Direct answer first.
   - Offer to build a workspace, report, dashboard, evidence pack, or treatment path.

3. **Approval Work Order**
   - Ask clearly implies heavier work.
   - Show scope, deliverable, likely skill, views, proof, and review needs.
   - Require user approval before execution.

4. **Fail-Closed Governance**
   - Ask requests production certification, official approval, export/circulation, canonical source writes, autonomous action, full voice activation, or unsupported claims.
   - Answer humanly, explain the blocked path, and route to the correct readiness/governance workspace when useful.

## Answer Quality Contract

The first answer must be judged by the original Brand Doctor conversation standard.

Good answers:

- Start with the strategic read.
- Say what matters and why.
- Separate strength from momentum.
- Use marketer/executive language, not internal runtime labels.
- Mention caveats only when they affect the decision.
- Offer useful next actions without turning the first answer into a mini-report.
- Keep treatment language as options to consider or paths to test.

Bad answers:

- Lead with source file-drop, runtime, canonical-use, or gate language when the user asked a simple strategy question.
- Repeat caveats.
- List internal facts without synthesis.
- Turn every question into a dashboard or work order.
- Assume the user wants every proof point, treatment implication, QBR angle, and governance caveat in the first reply.
- Hide the insight behind proof machinery.
- Sound like a system log.

## Implementation Plan

### Phase 1: Reproduce And Lock The Quality Gap

Goal: make the regression measurable before changing behavior.

Tasks:

- Add a small answer-quality fixture set for prompts like "tell me about Lay's momentum," "what changed?", "what would you tell the CMO?", and "what should we do next?"
- Compare default scoped chat, explicit governed chat, and Agent Lab outputs.
- Add assertions for source, routed skill, mode decision, blocked overreach, and whether the answer avoids internal governance leakage.
- Keep this as a non-flaky eval: structural checks first, reviewer checklist second.

Done when:

- The current regression is captured.
- The old answer quality is documented as the target.

### Phase 2: Add The Conversation Orchestrator Contract

Goal: classify the user's ask before deciding whether to answer, offer, or build.

Tasks:

- Add a typed `ConversationModeDecision` contract.
- Implement deterministic first-pass routing for direct answer, answer-and-offer, approval work order, and fail-closed governance.
- Use existing skill router signals but do not let every skill-routed ask become an orchestrated workspace by default.
- Persist the decision in Agent Lab state and proof surfaces.

Done when:

- "Tell me about Lay's momentum" becomes Direct Answer or Answer And Offer.
- "Build a QBR report for Lay's momentum" becomes Approval Work Order.
- "Certify this as production ready..." becomes Fail-Closed Governance.

### Phase 3: Add Governed Answer Composer

Goal: combine the old answer quality with the new governed foundation.

Tasks:

- Create a server-side answer composer that receives the governed packet, runtime facts, evidence, caveats, memory, and mode decision.
- Use OpenAI when live config is available, with grounded fallback when not.
- Instruct the composer to write the human answer from approved facts only.
- Keep internal governance details out of the answer unless the user asked for proof, source readiness, audit, or governance.
- Return structured sections for `spokenSummary`, `mainAnswer`, `proofHighlights`, `suggestedOffers`, and `blockedActions`.

Done when:

- Agent Lab answers simple questions with old-quality synthesis.
- The proof rail still exposes the full governed details.
- No unsupported diagnosis, treatment, source, export, or approval claims appear.

### Phase 4: Integrate Agent Lab

Goal: make Agent Lab feel like one intelligent assistant.

Tasks:

- Route typed and push-to-talk prompts through the Conversation Orchestrator.
- For Direct Answer, show the composed answer and optional proof chips without opening a heavy workspace.
- For Answer And Offer, show one or two contextual offers such as "Build QBR read" or "Open proof."
- For Approval Work Order, keep the existing Work Order Tracker and approved ExperiencePlan flow.
- For Fail-Closed Governance, render the relevant readiness workspace without implying production approval.

Done when:

- The same command bar supports fast Q&A and advanced governed work.
- Simple questions no longer feel over-engineered.
- Advanced work still gets the hardened runtime, views, proof, gates, memory, and audit.

### Phase 5: Realtime Voice Shell

Goal: make voice feel human because it is native turn-taking, not a chained transcript-to-TTS simulation.

Tasks:

- Use OpenAI Realtime as the primary `/brand/[brandId]/assistant` voice transport after explicit user start.
- Require the Realtime agent to call the Conversation Orchestrator / `/api/assistant` tool before every substantive answer.
- Voice should speak the `spokenAnswer` returned by the assistant tool, not raw runtime events or independent model memory.
- Speak only major moments: answer, offer, approval request, work started, work complete, blocked overreach.
- Keep detailed proof and orchestration visual.
- Preserve chained OpenAI TTS/browser STT as fallback only.
- Keep wake-word/background listening, autonomous speaking, production voice governance, transcript retention, and server-side cancellation policy gated.

Done when:

- Voice feels like a strategist talking back, not a system reading logs.
- Typed and Realtime voice turns produce the same decision: Direct Answer, Answer And Offer, Approval Work Order, or Fail-Closed Governance.
- Advanced spoken asks still pause for approval before opening governed work.

### Phase 6: MLV Acceptance Pass

Goal: prove the best-of-both-worlds experience.

Test prompts:

- "Tell me about Lay's momentum."
- "What would you tell the CMO about Lay's right now?"
- "Build a QBR report for Lay's momentum with evidence, treatment options, and what to review before leadership."
- "Show me the proof and gaps."
- "Certify this as production ready, export the audit, turn on full voice, and write source truth."

Acceptance:

- Simple answers match or beat the original conversation quality.
- Advanced asks route to approved work orders.
- Dynamic views and artifacts render only from approved registries.
- Proof, gaps, source readiness, memory/audit, and gates remain visible.
- Unsafe asks fail closed.
- `pnpm validate:data`, `pnpm typecheck`, `pnpm eval:mlv`, `pnpm eval:agent`, and `pnpm build` pass.

## Near-Term Recommendation

Do not add more foundation rails unless the MLV checkpoint exposes a missing rail. The next implementation slice should test and tune the Conversation Orchestrator experience, then reattach more Jarvis-style visual and voice polish to that higher-quality conversational layer.
