# Simulated Demographic Diagnostics Plan

## Purpose

This plan defines how BBE Brand Doctor can demonstrate demographic diagnostic workflows in the prototype even though official BBE demographic performance cuts are not currently loaded.

The goal is to answer inevitable stakeholder questions such as "How is this brand doing with younger consumers?" without pretending the prototype has measured demographic evidence it does not have.

## Core Rule

> Simulated demographic data can demonstrate the workflow. It cannot support a real business conclusion.

Every simulated demographic answer, visual, artifact, or slide must disclose that the data is prototype simulation and must be replaced with official BBE cuts before pilot or executive decision use.

## Why Build It

Stakeholders will ask demographic questions. In the July 2026 prototype review, Kate asked about demographic-specific performance and the system correctly said the data was missing.

For the next phase, the prototype should be able to show both:

- the honest measured-data boundary
- the intended future workflow once demographic cuts are available

This is a stronger posture than either refusing every demographic question or hallucinating an answer.

## Initial Scope

Start with age cohorts only.

Recommended age segments:

- `13-17`
- `18-24`
- `25-34`
- `35-49`
- `50-70`

Optional second wave:

- gender, if there is a clear use case
- Hispanic / non-Hispanic, if stakeholders expect that question and the caveat standard is approved

Avoid in the first wave:

- income
- region
- race
- household composition
- psychographic/lifestyle groups
- retailer-specific audiences

## Required Fields

Each simulated row should include:

- `brandId`
- `brandName`
- `market`
- `category`
- `period`
- `metricId`
- `metricLabel`
- `demographicDimension`
- `segment`
- `value`
- `categoryIndex`
- `aheadStatus`
- `momentumStatus`
- `baseSize`
- `readableBase`
- `sourceType: simulated`
- `approvalStatus: prototype_simulation`
- `evidenceMode: simulated_workflow_demo`
- `replacementRequirement`
- `caveat`

## Recommended Scenario Design

Synthetic values should be purposeful scenario data, not random numbers.

They should demonstrate plausible diagnostic patterns such as:

- large legacy brand with younger-cohort Meaningful/Different softness
- youth-skewing brand with strong Salience/Different but Pricing Power pressure
- adult/family-relevant brand with weaker younger cultural Momentum
- small brand with narrow segment strength but insufficient total scale

The values should not be presented as actual consumer truth.

## Answer Rules

### If Official Cut Exists

Answer from official data with base/significance caveats.

### If Only Simulated Cut Exists

Answer with leading caveat:

> "Using the simulated prototype demographic cut, this is how the system would diagnose the pattern. This is not measured BBE demographic evidence and must be replaced with official BBE cuts before pilot use."

### If Only Census / External Context Exists

Provide audience-size or market-context language only. Block brand-performance diagnosis.

### If No Relevant Evidence Exists

Say what data is needed.

## UI And Output Requirements

Every simulated demographic surface must show:

- `Simulated prototype data`
- source/replacement note
- not-for-pilot or not-for-executive-decision caveat
- base-size status as simulated
- link or disclosure to prototype assumption catalog

## LLM Guardrails

The LLM may explain:

- what the simulated pattern would mean
- how the future workflow would work
- what official data is needed
- what questions a team should ask next

The LLM may not:

- call simulated segment performance a measured fact
- compare synthetic values to real consumer behavior as truth
- recommend final demographic targeting decisions
- hide the caveat after the first mention

## Validation Prompts

Add evals for:

- "How is Lay's doing with Gen Z?"
- "Is Cheetos stronger with younger consumers?"
- "Should we target older consumers based on this?"
- "What do you know from Census versus BBE?"
- "Can I use this in a pilot read?"

Expected behavior:

- measured data, if absent, is acknowledged as absent
- simulated data, if used, is labeled up front
- Census is treated as context only
- pilot/official use is blocked until official cuts are loaded

## Replacement Requirement

Before pilot, replace this pack with official BBE demographic cuts containing:

- segment-level KPI values
- category benchmarks
- Ahead/Behind where available
- Momentum/significance where available
- base sizes
- readable-base flags
- source owner approval
- period and question metadata

