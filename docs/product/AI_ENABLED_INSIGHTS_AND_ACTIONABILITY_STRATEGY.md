# AI-Enabled Insights and Actionability Strategy

## Purpose

This document defines how AI should enable the Brand Doctor initiative to move from reporting to insight, from single-brand readouts to portfolio learning, and from plausible action paths to increasingly validated actionability.

The ambition is not "AI summarizes brand reports." The ambition is:

> Use AI, deterministic diagnosis, connected evidence, and portfolio memory to help PepsiCo make better brand-growth decisions faster, with visible proof and disciplined caveats.

Better Brand Equity remains the diagnostic spine. AI and connected systems sit around BBE as explanation, interrogation, pattern-finding, learning, and action-support layers.

## Strategic Thesis

Brand Doctor should become a company-level Brand Growth Intelligence system.

The current product can diagnose one brand:

```text
Brand -> BBE facts -> diagnosis -> evidence -> treatment options -> follow-up signals
```

The next system should learn across brands:

```text
Many brands -> recurring equity patterns -> portfolio analogies -> evidence gaps -> treatment paths -> outcome learning
```

This is where AI becomes strategically valuable. It can help PepsiCo see patterns that are difficult for humans to notice across many reports, brands, categories, markets, decks, transcripts, and planning cycles. The product should still avoid causal overclaiming, SKU-level pricing guidance, cannibalization assumptions, or invented diagnoses.

## The Forest-Level Opportunity

Most brand organizations create a large amount of data but lose learning between teams.

One brand team learns something about salience. Another wrestles with distinctiveness. Another sees pricing-power pressure. Another explores a Growth Navigator constraint. Those learnings may live in separate reports, slides, research readouts, and stakeholder memory.

Brand Doctor can become the connective layer:

- A single brand doctor for diagnosis.
- A portfolio memory system for pattern recognition.
- An insights co-pilot for provocative but grounded interpretation.
- A treatment-planning workbench for action paths to test.
- A learning loop that improves as follow-up evidence and outcomes arrive.

The goal is not to automate brand judgment. It is to give PepsiCo better judgment infrastructure.

## Grounding Principles

1. BBE is the spine.
   Demand Power, Perceived Value, Salient, Meaningful, Different, Ahead, Momentum, BrandZ typology, and category lens remain the primary diagnosis foundation.

2. Connected systems are support lenses.
   Growth Navigator, Mental Availability / CEPs, distinctive assets, physical availability, machine availability, commercial signals, and unstructured source claims explain, challenge, or action the BBE read.

3. AI does not invent the medical chart.
   AI can extract claims, cluster patterns, explain logic, challenge conclusions, summarize evidence, compare treatments, and draft action narratives. It should not create unsupported diagnoses, treatments, facts, or causal claims.

4. Missing evidence is intelligence.
   The system should be as good at saying "we do not know yet" as it is at saying "this is the read."

5. Actionability should become validated over time.
   V1 treatment paths are options to consider. Later versions can become increasingly validated as follow-up signals and outcome data are connected.

## AI Enablement Map

### 1. Evidence Translation

AI helps translate dense BBE and source-report evidence into plain-English marketer reads.

Use cases:

- Executive summary.
- Metric-by-metric interpretation.
- Live Consult explanation.
- Brand Manager and Insights Lead depth modes.
- Meeting-ready narratives.

Guardrail:

AI translates the evidence packet. It does not decide the diagnosis.

### 2. Evidence Interrogation

AI helps users challenge the read.

Use cases:

- "What could be wrong with this diagnosis?"
- "What evidence complicates the story?"
- "What would change your confidence?"
- "What should I not conclude from Perceived Value?"
- "Where is Growth Navigator helpful, and where is it missing?"

Guardrail:

Challenge mode should surface counter-evidence and missing evidence without pretending missing evidence proves the opposite.

### 3. Cross-Brand Pattern Recognition

AI plus deterministic graph logic helps find relationships across the portfolio.

Use cases:

- Brands with similar BBE symptom fingerprints.
- Recurring diagnosis clusters.
- Similar current-period and prior-period trajectories.
- Portfolio-wide evidence gaps.
- Treatment paths commonly considered for similar patterns.
- Contradictions across structured metrics and unstructured source claims.

Guardrail:

The system should say "similar to," "associated with," "worth investigating," or "possible precursor." It should not say "caused by" or "will happen."

### 4. Unstructured Content Structuring

AI helps convert decks, transcripts, research reports, and stakeholder notes into source-linked claims.

Useful extracted objects:

- Source claim.
- Brand mention.
- Audience or buyer segment.
- Occasion / CEP.
- Metric or equity construct.
- Support-lens signal.
- Caveat.
- Contradiction.
- Recommended action.
- Follow-up evidence request.

Guardrail:

Extracted claims are not canonical facts. They remain source claims until validated or mapped to measured evidence.

### 5. Treatment Planning Support

AI helps turn diagnosis and treatment config into options to consider, tradeoffs, and test plans.

Use cases:

- Treatment path comparison.
- Foundation-first action sequencing.
- Follow-up signal selection.
- Owner/dependency prompts.
- Draft meeting takeaway.

Guardrail:

Treatments remain governed by the treatment library and diagnosis-treatment links. AI can explain and compare options, not invent new prescriptions.

### 6. Outcome Learning

AI helps interpret whether follow-up signals suggest momentum is improving after treatment.

Use cases:

- "Did the intended metric move?"
- "Did adjacent metrics move in the expected direction?"
- "Did counter-evidence weaken or strengthen?"
- "What should the team do next?"
- "Which treatment assumptions were validated or challenged?"

Guardrail:

Outcome learning requires time-series evidence and should distinguish correlation, intervention timing, and causal proof.

## Portfolio Knowledge Graph

The knowledge graph is the central architecture pattern for moving from single-brand reports to portfolio intelligence.

It should be implemented as a generated graph layer over the existing JSON-first product contract, not as a replacement for `BrandHealthRecord`.

### Core Nodes

- Brand.
- Market.
- Category.
- Period.
- Brand Health Record.
- Metric Observation.
- Diagnosis.
- Diagnosis Rule.
- Evidence Item.
- Treatment Path.
- Growth Navigator Signal.
- Mental Availability / CEP Signal.
- Source Document.
- Source Claim.
- Portfolio Pattern.
- Evidence Gap.
- Guardrail / Caveat.
- Follow-Up Signal.
- Treatment Outcome.

### Core Edges

- Brand has metric.
- Metric supports diagnosis.
- Metric complicates diagnosis.
- Rule fired for brand.
- Diagnosis linked to treatment.
- Treatment targets metric area.
- Brand has Growth Navigator signal.
- Brand has CEP signal.
- Source claim mentions brand.
- Source claim supports or contradicts evidence.
- Brand is similar to brand.
- Brand matches portfolio pattern.
- Pattern commonly links to treatment.
- Pattern has evidence gap.
- Treatment has follow-up signal.
- Follow-up signal validates or challenges treatment hypothesis.

### Why A Graph Is Valuable

The graph lets the product answer questions that flat reports struggle with:

- What other brands look like this?
- Have we seen this pattern before?
- Which symptoms tend to travel together?
- What treatments are typically considered for this pattern?
- What evidence is usually missing?
- Which source claims conflict with the measured read?
- Which brands may be entering an early-warning state?
- Which category or portfolio patterns deserve senior attention?

## Symptom Fingerprints

Each brand-period should receive a computed symptom fingerprint from the BBE spine and connected support lenses.

Inputs:

- Demand Power status and momentum.
- Perceived Value status and momentum.
- Meaningful status and momentum.
- Different status and momentum.
- Salient status and momentum.
- BrandZ typology.
- Category lens.
- Diagnosis candidates and confidence.
- Evidence support, counter-evidence, and missing evidence.
- Growth Navigator bridge signals.
- Mental Availability / CEP measures where available.
- Occasion scores.
- Treatment links and ranked recommendations.

The fingerprint powers portfolio similarity:

```text
Brand A in 2026 Q1 is similar to Brand B in 2025 Q3 because:
- both show strong Salient with weaker Different
- both show Perceived Value softness
- both link to distinctive asset and value-delivery treatment paths
- both lack enough support-lens evidence to distinguish equity issue from execution issue
```

This is not an answer. It is a better question generator.

## Pattern Radar Experience

The first visible product expression should be an Insights Lead feature called Pattern Radar.

It should be report-first, not a tangled graph visualization.

Recommended sections:

### 1. Brands That Look Like This

Shows brands with similar symptom fingerprints and the evidence explaining the match.

### 2. Emerging Portfolio Patterns

Shows recurring equity patterns across brands, categories, markets, or periods.

Example patterns:

- Familiar but not special: high Salient, weak Different, pricing pressure.
- Relevant but hard to retrieve: stronger Meaningful, weaker Salient, narrow occasion memory.
- Strong but leaking: strong current equity, declining momentum.
- Equity present, conversion constrained: BBE strength with Growth Navigator availability/value constraints.
- Evidence-light prescription risk: treatment options appear plausible, but support-lens proof is missing.

### 3. Precursor Watch

Shows brands whose current fingerprints resemble prior-period patterns observed before a later diagnosis shift.

Language must be careful:

> This resembles a prior pattern worth investigating.

Not:

> This brand will decline.

### 4. Evidence Gap Map

Shows repeated missing evidence across the portfolio.

Example:

> Seven brands have Perceived Value vulnerability signals, but only two have sufficient value-delivery or RGM-adjacent evidence to interpret the issue confidently.

### 5. Contradiction Queue

Shows conflicts between source claims, BBE facts, support lenses, and prior narratives.

Example:

> A source deck claims youth relevance is improving, but current Meaningful and Momentum evidence do not support that as a measured fact.

### 6. Treatment Memory

Shows treatments commonly linked to similar patterns and what proof signals should be monitored.

V1 language:

> Commonly considered treatment paths.

Later language, only with outcome data:

> Treatment paths associated with improved follow-up signals in comparable cases.

## Validated Actionability Ladder

Brand Doctor should move through a maturity ladder.

### Level 1: Reporting

The system shows BBE facts, benchmarks, and source citations.

Value:

- Faster access.
- Cleaner presentation.
- Less manual report assembly.

### Level 2: Interpreted Reporting

The system explains what the facts likely mean using deterministic diagnosis rules and evidence.

Value:

- Consistent interpretation.
- Less metric misreading.
- Stronger marketer confidence.

### Level 3: Connected Insight

The system connects BBE to Growth Navigator, Mental Availability / CEPs, distinctive assets, physical availability, machine availability, and source claims.

Value:

- Better "why" and "what next" thinking.
- More disciplined use of support lenses.
- Clearer evidence gaps.

### Level 4: Portfolio Pattern Intelligence

The system identifies recurring symptom patterns and brand lookalikes across the portfolio.

Value:

- Earlier issue detection.
- Cross-brand learning.
- Better research prioritization.
- Stronger senior-leader provocation.

### Level 5: Testable Action Planning

The system turns diagnosis into treatment paths, hypotheses, owners, dependencies, and follow-up proof signals.

Value:

- Action planning becomes evidence-led.
- Teams can test rather than merely debate.
- Insights owns the bridge from read to decision.

### Level 6: Outcome-Validated Learning

The system connects treatment actions to later waves and outcome signals.

Value:

- PepsiCo builds memory about what tends to work, where, and under what evidence conditions.
- Treatment confidence improves.
- The system becomes a learning engine, not a one-time diagnostic tool.

## Company-Level Value

### For Brand Managers

- Faster understanding of brand health.
- Clearer "what to do next" options.
- Less confusion between metric facts, support-lens hypotheses, and overclaims.
- Better preparation for decision meetings.

### For Insights Leads

- Stronger evidence-led provocation.
- Better cross-brand pattern detection.
- Better prioritization of missing research.
- More leverage from existing reports and unstructured material.
- A defensible way to challenge weak conclusions.

### For Senior Leaders

- Portfolio-wide early warning signals.
- Cross-category learning.
- Better visibility into which issues are isolated versus systemic.
- A clearer investment agenda for research, treatment testing, and capability building.

### For PepsiCo

- Less repeated learning.
- More reuse of brand-equity intelligence.
- Stronger institutional memory.
- Better movement from reports to decisions.
- Eventually, a proprietary intelligence asset that compounds with every brand, period, source, and treatment outcome.

## Implementation Path

### Phase 1: Graph From Existing Structured Data

Create a generated graph JSON from:

- Brand Health Records.
- Diagnosis definitions.
- Diagnosis rules and rule traces.
- Evidence ledger items.
- Treatment definitions.
- Diagnosis-treatment links.
- Growth Availability records.
- Mental Availability / CEP packets.
- Guardrail configs.

Deliverables:

- `KnowledgeGraph` TypeScript types.
- `buildBrandKnowledgeGraph()` service.
- Graph JSON debug tab in the brand data view.
- No new database.

### Phase 2: Symptom Similarity

Compute brand-period fingerprints and similarity edges.

Deliverables:

- Symptom vector schema.
- Similarity score with explanation reasons.
- Top similar brands for each active brand.
- Caveated "similar pattern" language.

### Phase 3: Pattern Radar UI

Add an Insights Lead Pattern Radar section.

Deliverables:

- Brands That Look Like This.
- Emerging Portfolio Patterns.
- Evidence Gap Map.
- Treatment Memory.
- Precursor Watch as a clearly caveated hypothesis area.

### Phase 4: Source Claim Extraction

Use AI to extract structured claims from decks, transcripts, and docs.

Deliverables:

- Source claim schema.
- Claim validation and preview flow.
- Source-linked claim graph nodes.
- Contradiction detection between claims and measured evidence.

### Phase 5: Treatment Outcome Loop

Add follow-up evidence and treatment outcome records.

Deliverables:

- Treatment action records.
- Follow-up metric snapshots.
- Outcome confidence labels.
- Comparable-case treatment learning.

## Near-Term Demo WOW Moments

These are the most compelling near-term moments for customers:

1. "Show me brands that look like this."
   The system explains similarity using BBE symptoms, not generic text embeddings.

2. "What portfolio pattern is emerging?"
   The system surfaces recurring equity risks across brands and categories.

3. "What evidence are we missing before we act?"
   The system identifies missing support-lens evidence across related brands.

4. "Has this happened before?"
   The system finds prior-period analogies and caveats them properly.

5. "What treatment paths do similar cases usually consider?"
   The system connects diagnosis, treatments, and follow-up proof signals.

6. "Where do source materials disagree?"
   The system turns unstructured-content overload into an evidence tension queue.

## Recommended First Build

The best first build is not a graph database or a node-link visualization.

Build:

1. A JSON-first knowledge graph generator.
2. A BBE-grounded symptom fingerprint service.
3. Cross-brand similarity with human-readable evidence reasons.
4. An Insights Lead Pattern Radar section.
5. A data/debug view exposing graph nodes and edges for trust.

This creates a strong demo while staying faithful to the current architecture:

- Components render.
- Services compute.
- Config defines.
- LLMs explain.

## Non-Negotiable Language

Use:

- Similar to.
- Associated with.
- Commonly appears with.
- Worth investigating.
- Possible precursor.
- Evidence gap.
- Source claim.
- Treatment path to consider.
- Follow-up signal to monitor.

Avoid:

- Caused by.
- Proves.
- Will lead to.
- Guaranteed.
- Prescribed action.
- Cannibalization.
- Portfolio migration.
- SKU-level pricing recommendation.

## Bottom Line

The knowledge graph matters because it gives Brand Doctor memory.

Without it, the product is a better way to read one brand report.

With it, Brand Doctor can become a company learning system:

> A BBE-grounded intelligence layer that helps PepsiCo diagnose brands, compare patterns, expose evidence gaps, plan treatments, and learn over time which actions appear to build momentum.
