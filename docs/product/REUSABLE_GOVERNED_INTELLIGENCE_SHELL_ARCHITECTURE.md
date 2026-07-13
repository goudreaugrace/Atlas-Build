# Reusable Governed Intelligence Shell Architecture

## Purpose

This document defines how BBE Brand Doctor can become the first implementation of a reusable governed intelligence shell rather than a one-off BBE application.

The goal is portability without abstraction theater. The next phase should make the architecture reusable by clarifying boundaries and contracts, while still building the BBE diagnostic brain deeply enough to be trusted.

## Recommendation

Define the reusable shell boundaries first, then implement the BBE Diagnostic Reasoning Calibration work inside those boundaries.

Do not pause to build a generic platform before BBE works. That would create too much abstract scaffolding too early. The best path is:

1. Define the shell contracts.
2. Treat BBE as the first domain pack.
3. Build the Equity Reasoning Layer as a domain-specific reasoning model that plugs into the shell.
4. Keep outputs, skills, evidence, and governance modular enough that another domain can reuse the same architecture later.

This reduces rework without over-generalizing.

## Core Principle

> The shell orchestrates. The domain defines. The rules decide. The LLM explains. The evidence proves. The human approves.

## Reusable Shell Layers

```text
Source Layer
-> Domain Knowledge Layer
-> Reasoning Layer
-> Evidence Ledger
-> Agent Skill Layer
-> Experience Planning Layer
-> Governed View / Output Layer
-> Human Review And Governance Layer
```

### 1. Source Layer

Reusable job:

- ingest source files, records, extracts, and manually reviewed packets
- track provenance, period, owner, source type, approval status, and caveats
- distinguish measured, extracted, simulated, assumption, public, and transcript-derived inputs

BBE implementation:

- BBE tracker exports
- automated report decks
- Growth Navigator files
- demographic cuts
- Mental Availability / CEP packets
- brand strategic context packets
- treatment outcome records later

Another domain would swap in different sources while keeping the same provenance and approval posture.

### 2. Domain Knowledge Layer

Reusable job:

- store definitions, terminology, concept relationships, language permissions, and guardrails
- make knowledge human-readable and machine-addressable

BBE implementation:

- Demand Power
- Perceived Value / Pricing Power
- Meaningful, Different, Salient
- `vs. Category`
- `Ahead`
- `Momentum`
- BrandZ typology caveats
- Pricing Power guardrails
- treatment definitions

Another domain would provide its own vocabulary, measures, and guardrails.

### 3. Reasoning Layer

Reusable job:

- produce a canonical domain read from data and knowledge
- make decisions deterministically where possible
- expose evidence gaps and blocked claims
- give the LLM a result to explain, not a blank slate

BBE implementation:

- `EquityReasoningRead`
- headline verdict
- momentum read
- ahead/behind read
- strength-language permission
- large-but-vulnerable state
- integrated M/D/S and Perceived Value read
- demographic evidence gate
- treatment implications

Another domain would define a different reasoning read, such as `CommercialRiskRead`, `InnovationPipelineRead`, `RetailExecutionRead`, or `ConsumerExperienceRead`.

### 4. Evidence Ledger

Reusable job:

- attach claims to evidence, caveats, missing inputs, and source posture
- prevent unsupported or simulated claims from appearing official
- make proof inspectable

BBE implementation:

- metric evidence
- benchmark evidence
- source-deck evidence
- transcript feedback as calibration input
- demographic measured/simulated/missing state
- source readiness gaps

Another domain would keep the same claim/evidence/gap model.

### 5. Agent Skill Layer

Reusable job:

- route user intent to approved domain skills
- expose allowed inputs, required data, output schemas, views, and guardrails
- keep the agent from inventing unsupported workflows

BBE implementation:

- diagnose brand equity
- explain evidence
- build QBR read
- create treatment recommendation
- inspect source readiness
- generate provocation questions
- create governed report modules

Another domain would register different skills while using the same routing and approval pattern.

### 6. Experience Planning Layer

Reusable job:

- translate a user goal into an approved workspace or output plan
- select skills, views, modules, evidence needs, and guardrails
- ask clarifying questions only when needed

BBE implementation:

- executive QBR
- Evidence Read
- Treatment Read
- Assumption/Readiness Read
- demographic diagnostic read
- source readiness lab
- governed mini-deck

Another domain would define role-specific workspaces using the same `ExperiencePlan` concept.

### 7. Governed View / Output Layer

Reusable job:

- render approved modules using canonical data and reasoning
- support app views, Jarvis canvas, work items, reports, slides, and future exports
- keep outputs downstream of evidence and reasoning
- treat high-value questions as governed artifacts when they drive executive decisions or source-owner handoffs

BBE implementation:

- benchmark lens explainer
- chart-read module
- executive verdict module
- source readiness module
- MDS dashboard
- KPI deep dives
- Pricing Power guardrail module
- demographic diagnostic module
- provocation questions module

Another domain would register different modules.

### 7a. Governed Question Layer

This is a reusable pattern inside the Governed View / Output Layer, not a separate product.

Reusable job:

- convert source evidence, business feedback, and external frameworks into explicit questions the system is allowed to raise
- rank questions by business priority and evidence readiness
- distinguish decision questions from source-owner handoff questions
- attach evidence to use, evidence still needed, and blocked overclaims to every question
- prevent the agent from "sounding strategic" by asking questions that cannot be answered or that imply unsupported facts

BBE implementation:

- `ProvocationQuestionsModule`
- deck-first question priority from the Q1 Snacks automated report
- Kate/V7 guardrails for Momentum, category index, Ahead/Behind, strength language, typology, demographics, and M/D/S plus Perceived Value interpretation
- CMO/brand-growth research used as question framing only
- source-owner handoff questions for chart reproduction, official demographic cuts, and Momentum movement/significance/room-to-grow evidence

Another domain would provide its own question taxonomy, source-owner handoffs, blocked overclaims, and external framework references.

### 8. Human Review And Governance Layer

Reusable job:

- require review before promotion, official use, export, circulation, canonical writes, or pilot claims
- track accepted/rejected memory, source candidates, artifact readiness, and output approval

BBE implementation:

- source-owner approval for BBE cuts
- official demographic data replacement
- golden read approval
- treatment language review
- artifact readiness gates

Another domain would reuse the review/gate mechanics with different approvers and thresholds.

## Domain Pack Pattern

A reusable domain should be packaged as a domain pack.

Required domain-pack contents:

- source schemas
- canonical record schemas
- data dictionary
- knowledge definitions
- reasoning read type
- reasoning rules
- evidence rules
- language permissions
- skill registry entries
- view/output module registry entries
- governed question taxonomy and question-module contracts
- evals and golden examples
- source governance requirements
- prototype assumption catalog

For BBE, this becomes the BBE domain pack.

## What Is Reusable Versus BBE-Specific

Reusable shell:

- source provenance model
- source governance states
- evidence ledger pattern
- skill registry pattern
- experience plan pattern
- approved view registry
- work item model
- review gates
- artifact readiness model
- eval harness pattern
- LLM role as explainer/translator
- governed question pattern with evidence-needed and blocked-overclaim fields

BBE-specific:

- `BrandHealthRecord`
- BBE metric definitions
- BBE benchmark rules
- Equity Reasoning Layer
- treatment library
- BBE/GN/CEP source contracts
- Pricing Power guardrails
- BrandZ typology caveats
- BBE report modules
- BBE provocation question rules
- BBE golden reads

## Architectural Enhancements To Make Now

These should happen before or during BBE calibration to reduce rework:

1. Add a domain-pack folder or namespace convention.
2. Keep BBE reasoning in services, not React components.
3. Keep BBE doctrine in config/data docs, not prompt-only text.
4. Make source governance fields standard across measured, extracted, simulated, assumption, and public inputs.
5. Route outputs through canonical reasoning reads.
6. Require each skill and module to declare required data, allowed claims, blocked claims, and output caveats.
7. Keep the LLM behind deterministic reasoning and evidence contracts.
8. Add eval patterns that test shell behavior and BBE domain behavior separately.

## What Not To Build Yet

Avoid these until BBE calibration proves the pattern:

- a generic domain-pack marketplace
- a full multi-domain admin builder
- arbitrary schema authoring UI
- arbitrary generated React views
- cross-domain memory promotion
- production connector framework
- export/circulation automation

These are plausible future platform capabilities, but building them now would slow the work and add risk.

## Recommended Sequence

1. Define domain-pack contract in docs and lightweight types.
2. Refactor only where needed to keep BBE data, rules, reasoning, skills, and outputs separated.
3. Build the BBE data foundation hardening work.
4. Build `EquityReasoningRead` as the first domain reasoning read.
5. Add BBE evals and golden reads.
6. Build governed BBE report modules.
7. After BBE passes calibration, test the shell pattern with one small second-domain thought exercise or spike.

## Second-Domain Portability Test

After BBE calibration, run a narrow portability test without building a full second product.

Example test:

- choose a very different domain
- define 3-5 source record types
- define 5-10 domain concepts
- define one canonical reasoning read
- define two skills
- define three output modules
- run through the same evidence, governance, and experience planning pattern

Success means the architecture holds without rewriting the shell.

## Bottom Line

Do the reusable architecture work first at the boundary level, not at the platform-build level.

The next phase should not be "make a generic AI platform." It should be:

> Build BBE correctly as the first governed domain pack, with clean shell boundaries that make the second domain much easier.
