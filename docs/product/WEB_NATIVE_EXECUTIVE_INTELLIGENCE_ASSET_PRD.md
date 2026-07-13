# PRD - Web-Native Executive Intelligence Asset

## Purpose

Create the next flagship Brand Doctor output: a web-native executive intelligence asset that can replace the high-value parts of manually built BBE/QBR PowerPoint decks, then move beyond static decks through proof, interaction, voice/chat, revision, source actions, and governed next-step workflows.

The first dynamic asset family is the **Meeting Prep Intelligence Asset**. QBR is a supported meeting objective and common source-deck context, but the product should not frame every output as a QBR. The user's meeting objective, audience, decision, and proof depth should determine what the asset includes.

This is not a generic deck generator. It is a governed asset workspace with slide-level clarity and web-native intelligence.

## Product Thesis

> PowerPoint packages a point in time. Brand Doctor should create a living, governed executive asset that explains the read, proves it, adapts to the audience, and starts the next move.

The first version should feel familiar enough to replace hand-built slides, but clearly more valuable because it is connected to the Brand Intelligence Packet, source readiness, proof, guardrails, treatment paths, and chat/voice interaction.

## Brand Report Versus Meeting Prep / Work Asset

The Brand Report remains the canonical diagnostic report: the always-current patient chart for a brand. It should be richer than a QBR, with narrative, teaching, diagnosis, evidence, proof/caveats, treatment logic, and traceability.

Meeting Prep and Brand Work assets are dynamic derivatives from that diagnostic spine. They are audience- and situation-specific, shaped by the user's ask, meeting objective, decision, and proof depth. They should be shorter and more selective than the report, not a replacement for the report's full diagnostic depth. Quarterly and yearly review data may be the default evidence rhythm, but the dynamic value is the focus/composition, not pretending the data changes moment to moment.

The first visual versions may look similar because they use the same intelligence foundation. The product distinction is role: report equals full diagnostic understanding; Meeting Prep/work asset equals meeting-ready narrative extracted from that understanding.

## Current Foundation We Already Have

The current system already contains many of the required foundations:

- `BrandHealthRecord` as the central brand data contract.
- `BrandIntelligencePacket` as the central intelligence contract.
- Equity reasoning over Momentum, Ahead/Behind, vs. Category, Demand Power, Perceived Value, Meaningful, Different, and Salient.
- Governed output modules:
  - `benchmark_lens_explainer`
  - `chart_read`
  - `executive_verdict`
  - `source_readiness`
  - `demographic_diagnostic_state`
  - `provocation_questions`
- Q1 2026 US Snacks source-deck synthesis and chart ledger.
- Kate/V7 calibration rules and golden tests.
- Simulated demographic workflow data with replacement caveats.
- Treatment library and treatment paths to consider.
- Assistant/Jarvis work-order pattern with approval gates.
- Dynamic view registry, ExperiencePlan registry, and Brand Work Items.
- Source-governance, runtime-governance, review, audit, and promotion-gate foundations.
- External Kantar/WARC framework references cataloged as question framing, not brand evidence.

The gap is not the reasoning brain. The gap is the next asset surface: current generated work still feels more like a governed module shell than a slide-quality executive workspace.

## User Problem

Today, teams invest significant manual effort creating PowerPoint decks that:

- summarize brand performance,
- translate BBE signals into business implications,
- create executive-ready narrative,
- include caveats and source notes,
- generate discussion questions,
- prepare next-step asks,
- and often get rebuilt repeatedly for different audiences.

Those decks are useful, but static. They cannot answer follow-ups, adjust depth, expose proof dynamically, revise safely, start a next workflow, or stay connected to source readiness.

Brand Doctor should preserve the discipline and information focus of good slides, then add web-native value.

## Primary Users

### Insights Lead

Needs to replace manual synthesis work with a reliable draft that preserves proof, caveats, and source boundaries.

### Brand Lead / Brand Manager

Needs a clear read, business implication, and practical next move without reading a dense data deck.

### Executive / CMO Sponsor

Needs slide-level clarity, concise implication, confidence boundaries, and the ability to challenge the read.

### Source Owner / Analytics Partner

Needs a clean list of source gaps, approval needs, and data required to make the asset pilot-ready.

## Target Experience

The user can ask by voice or chat:

> Build me a CMO-ready read for Lay's. Focus on whether we are actually strong or just big, what the risk is, and what we should do next.

The system creates a web asset with slide-like pages:

1. Executive verdict.
2. Benchmark lens read.
3. Primary chart read.
4. Driver diagnosis.
5. Demographic diagnostic boundary.
6. Provocation questions.
7. Treatment paths to consider.
8. Source readiness and next proof.

Each page has:

- one clear headline,
- one primary visual or evidence pattern,
- concise implication,
- expandable proof,
- blocked overclaims,
- source readiness state,
- and next-step actions.

The user can then ask:

- "Make this sharper for Kate."
- "Add the demographic caveat."
- "Lead with Momentum."
- "Show the evidence behind Perceived Value."
- "Create the source-owner ask list."
- "Bring in recent external context, but keep it separate from BBE evidence."
- "Turn this into a treatment workshop."

The system revises the asset composition or opens the next governed workspace without inventing facts.

## Output Showcase Set

Before the product becomes highly dynamic, the POC should prove a small set of CMO-grade output assets that are as good as, and ideally better than, the PPTX sections they replace.

The active showcase set is documented in `OUTPUT_ASSET_SHOWCASE_SET_PLAN.md` and includes:

- Meeting Prep Intelligence Asset.
- Primary MDS Dashboard Read.
- Benchmark Lens Explainer.
- Category Position Read.
- Momentum Over Time Read.
- Driver Relationship Map.
- Perceived Value / Pricing Power Guardrail.
- Brand Jobs To Be Done.
- Demographic Diagnostic Boundary.
- Leadership Provocation Questions.
- Typology Source Context, only when explicitly requested.

The first implementation slice should expose the deck-derived assets as durable Work Shelf outputs using the governed page-module registry rather than waiting for arbitrary dynamic generation.

## Product Principles

1. Slide-level focus, web-native depth.
   The first view of each page should be as focused as a strong slide. Deeper proof should be available on demand, not forced into the main view.

2. Replace the hand-built workflow first.
   The first asset must be good enough to make a person who builds BBE decks by hand say: "This gets me most of the way there faster."

3. Move beyond PPT only after trust is earned.
   Interactive proof, chat/voice, revision, external context, and next actions should enhance the asset without making it busy.

4. Govern dynamic composition, not arbitrary UI generation.
   AI may choose module order, framing, emphasis, and revision strategy. It may not invent unsupported layouts, claims, metrics, diagnoses, or treatments.

5. Proof is part of the product.
   Every page must know what evidence supports it, what evidence is missing, what claims are blocked, and whether it is demo-safe, pilot-blocked, or source-ready.

6. External context is context only.
   News, public research, and Kantar/WARC references can suggest questions or hypotheses. They cannot become measured BBE evidence or brand-specific claims without review.

## Dynamic Versus Prebuilt Boundary

Dynamic:

- asset composition,
- module sequence,
- audience framing,
- narrative emphasis,
- proof depth,
- follow-up Q&A,
- safe revision requests,
- source-owner next actions,
- external context summaries with citations.

Prebuilt and governed:

- page templates,
- visual layouts,
- chart components,
- module contracts,
- claim rules,
- source gates,
- treatment library,
- audience modes,
- review states,
- output quality checks,
- export/circulation language.

## Required Foundations

### 1. Artifact Composition Spec

A structured JSON contract for each created asset:

- asset id,
- brand id,
- audience,
- objective,
- decision supported,
- narrative arc,
- page/module sequence,
- claims,
- evidence used,
- evidence missing,
- blocked claims,
- source posture,
- next actions,
- revision history,
- review state.

This is the core foundation. Voice/chat should create and revise this spec, not write arbitrary page content directly into React.

### 2. Page-Level Module Registry

Each page module declares:

- required packet fields,
- optional packet fields,
- visual layout type,
- headline pattern,
- allowed claims,
- blocked claims,
- proof disclosure,
- source posture display,
- audience variants,
- next-step actions.

### 3. Page Proof Contract

Every page must expose:

- evidence to show,
- evidence behind disclosure,
- source lineage,
- caveats,
- missing proof,
- blocked overclaims,
- review/promotion state.

### 4. Asset Workspace Renderer

Render the composition spec as a premium, slide-like web workspace:

- page navigation,
- focused first viewport,
- proof rail,
- audience depth controls,
- next-step action panel,
- ask-this-asset sidecar,
- review state.

### 5. Safe Revision Loop

Initial revision types should be limited to:

- reorder pages,
- reframe for audience,
- increase or reduce proof depth,
- add required caveat,
- change lead module,
- create a source-owner ask list,
- open a treatment-path workspace.

Later revision types can add richer recomposition, external context, and export behavior.

### 6. Ask-This-Asset Layer

Chat/voice should be scoped to the active asset:

- explain a page,
- show evidence,
- identify what would make the read wrong,
- translate for a CMO,
- name source gaps,
- create the next governed action.

### 7. Next-Step Operation Layer

Each page can start governed operations:

- build treatment path,
- create source-owner ask,
- compare another brand,
- open evidence inspector,
- draft test plan,
- create agency brief,
- request missing source,
- mark reviewed.

### 8. External Context Lane

Optional, governed lane:

- search or summarize current public context with citations,
- label as external context,
- suggest questions or hypotheses,
- do not mutate measured diagnosis,
- require review before appearing as an executive claim.

## UX Guidance From PPTX Slides

The Q1 Snacks deck should guide information density:

- one main point per page,
- compact executive headline,
- visual or evidence center of gravity,
- enough source context to trust the read,
- appendix/proof details available but not crowding the top-level story,
- questions and next actions at the end of the read.

The web version should not become dashboard-card soup. It should feel like slide-level storytelling with interactive depth.

## Initial Proof Examples

### Example 1 - Lay's CMO Review Intelligence Asset

Primary proof of replacement value.

Goal:

- replace the manually assembled CMO/QBR meeting prep read for a single brand,
- show slide-level quality,
- use current governed module stack,
- preserve source caveats.

Must prove:

- voice/chat can create the asset,
- page sequence is coherent,
- pages are focused and not busy,
- proof is expandable,
- Kate-style feedback is reflected,
- demographic caveat is visible,
- treatment path is framed as option to test,
- source-owner ask list can be generated.

### Example 2 - Source + Context Extension

Primary proof of web-native advantage beyond PPT.

Goal:

- start from the Lay's asset,
- bring in external context only as cited context,
- create source-owner asks or a treatment workshop from the asset.

Must prove:

- external context stays separate from BBE evidence,
- the diagnosis does not silently change,
- user can start a next operation from the asset,
- revision loop remains governed.

Do not build additional output types until these two examples feel strong.

## Out Of Scope For First Build

- Full PowerPoint export.
- Full 128-slide deck recreation.
- Arbitrary generated page layouts.
- Official approval/circulation.
- Canonical source writes.
- Production persistence or enterprise permissions.
- Multi-brand portfolio asset generation.
- Agency brief, learning path, or treatment workshop as first-class polished assets beyond the extension proof.

## Success Criteria

The first build succeeds when:

- a user can create the Lay's CMO asset from a natural language or voice request,
- the asset feels like a focused executive deck replacement, not a debug page,
- each page is grounded in the current packet and governed module stack,
- proof/caveats are visible without overwhelming the top-level page,
- the user can ask at least three follow-up questions about the asset,
- the user can perform at least three safe revisions,
- the asset can generate a source-owner ask list,
- external context can be added as context-only with citations,
- the artifact remains review-draft and export-gated.

## Pilot Readiness Gates

Before this can become a pilot output:

- source-owner approval for BBE source ledger / chart mapping,
- official demographic cuts if demographic performance claims are needed,
- approved Momentum movement/significance and room-to-grow source extracts,
- approved Brand Strategic Context,
- review workflow and asset persistence requirements,
- artifact QA and language approval,
- export/circulation governance if PPT/PDF output is enabled.
