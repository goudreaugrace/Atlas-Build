# Pattern Radar UX Spec

## Purpose

Pattern Radar is the first visible expression of the Brand Equity Knowledge Graph.

Its job is to help PepsiCo move from:

```text
What is happening with this brand?
```

to:

```text
Where else have we seen this pattern, what evidence supports the comparison, what is missing, and what treatment paths should we consider testing?
```

Pattern Radar should feel like an Insights Lead intelligence brief, not a graph visualization demo. It should reveal the forest across the portfolio while staying grounded in the BBE diagnostic tree for the active brand.

## Product Principle

Pattern Radar is not a replacement for the diagnosis engine.

It should sit after the core brand evidence and support-lens reads, then answer:

- What other brands look like this?
- What portfolio pattern does this brand appear to participate in?
- What evidence makes the similarity credible?
- What evidence is missing before we act?
- What treatments do similar cases commonly point toward?
- What should not be concluded?

## Audience

### Primary: Insights Lead

Insights Leads need to inspect, challenge, compare, and provoke. Pattern Radar should be visible by default in Insights Lead mode because it helps them turn brand-level diagnosis into portfolio learning.

### Secondary: Brand Manager

Brand Managers should not get a dense graph workbench by default. They can receive a compact "Portfolio context" cue, but the full Pattern Radar should remain an Insights Lead depth surface until the language and evidence confidence are mature.

## Placement In Report Flow

Recommended report sequence:

```text
Executive Summary
Growth Availability Read
Mental Availability / CEP Explorer
Brand Health Panel
Momentum Monitor
Growth Navigator Vitals
Opportunity Views
Pattern Radar
Metric-By-Metric Diagnosis
Current Diagnosis
Evidence Ledger
Root Cause Explorer
Prescription & Action Plan
```

Why here:

- It appears after the user has seen the active brand facts and connected support lenses.
- It appears before the detailed KPI modules and Evidence Ledger, so it can point users into deeper proof.
- It acts as the bridge from single-brand diagnosis to portfolio intelligence.

## Page Architecture

Pattern Radar should be one report section with six sequential bands.

```text
Pattern Radar
1. Topline: portfolio intelligence read
2. Active symptom fingerprint
3. Brands that look like this
4. Emerging portfolio patterns
5. Evidence gap map
6. Treatment memory
```

Future bands:

```text
7. Source contradiction queue
8. Precursor watch
```

Do not start with a node-link graph. A graph picture can be an optional "Evidence map" detail later, but the primary view should be a readable intelligence brief.

## Visual Form

Use the current report-section pattern:

- warm off-white page background
- white framed report section
- navy section kicker
- restrained blue interaction states
- orange only for evidence gaps, caution, or missing proof
- green only for supported or validated reads

Avoid:

- dashboard tile sprawl
- decorative AI gradients
- network spider charts as the main view
- dense tables without explanation
- unsupported "AI found this" language

## Section 1: Topline

Purpose:

Summarize what the portfolio graph sees for the active brand.

Example:

```text
Pattern Radar
This brand appears to sit in a "familiar but not special" pattern: salience is comparatively stronger than difference, treatment links point toward distinctive asset and choice-justification work, and the active packet still needs stronger support-lens evidence before action is locked.
```

Required elements:

- Pattern label.
- One-sentence read.
- Evidence confidence.
- Number of similar brands found.
- Material evidence gap count.
- Caveat: "Similarity is associative, not causal."

Recommended layout:

```text
+--------------------------------------------------------------+
| Pattern Radar                                                |
| Familiar but not special                                     |
| Salience is stronger than difference...                      |
|                                                              |
| Similar brands: 4 | Evidence gaps: 2 | Confidence: Medium    |
| Similarity is associative, not causal.                       |
+--------------------------------------------------------------+
```

## Section 2: Active Symptom Fingerprint

Purpose:

Show why the system thinks the active brand has a recognizable pattern.

Inputs:

- Demand Power.
- Perceived Value.
- Meaningful.
- Different.
- Salient.
- Momentum.
- Primary diagnosis.
- Diagnosis candidates.
- Evidence support / counter-evidence / missing evidence.
- Growth Navigator bridge.
- Mental Availability / CEP signals.
- Treatment links.

Design:

Use a compact evidence strip, not a full KPI dashboard.

Recommended rows:

- Equity shape: M / D / S and Demand / Perceived Value.
- Trajectory: momentum reads.
- Support lenses: GN and CEP availability.
- Prescription pull: top linked treatment families.
- Confidence blockers: missing evidence.

Example:

```text
Symptom fingerprint
Equity shape        Salient stronger than Different
Trajectory          No material momentum signal in active packet
Support lenses      GN missing; CEP simulated prototype evidence
Prescription pull   Distinctive assets, proposition clarity
Confidence blockers Physical availability, measured CEP evidence
```

## Section 3: Brands That Look Like This

Purpose:

Make the graph useful immediately: show comparable brands with reasons.

Each comparable brand row should include:

- Brand name.
- Category.
- Current diagnosis.
- Similarity score or strength label.
- Top 2-3 reasons.
- Key difference.
- Evidence caveat.
- Link to open that brand.

Recommended language:

```text
High similarity
Both brands show stronger Salient than Different, share a treatment pull toward distinctive assets, and have limited support-lens evidence loaded.

Key difference
This brand has stronger Perceived Value evidence; the comparison should not be read as the same commercial issue.
```

Interaction:

- "Open brand" navigates to `/brand/[brandId]`.
- "Compare evidence" expands an inline comparison panel.
- "Ask Brand Doctor" sends a scoped prompt to the sidecar:
  "Compare this brand's symptom fingerprint with [brand]."

Do not:

- Call a brand a twin without explaining why.
- Rank similarity based only on diagnosis label.
- Hide key differences.

## Section 4: Emerging Portfolio Patterns

Purpose:

Surface repeated patterns across brands, categories, or periods.

Pattern cards should include:

- Pattern name.
- Definition.
- Brands currently matching.
- Evidence basis.
- Why it matters.
- What to investigate next.
- Guardrail.

Example patterns:

### Familiar But Not Special

Signal:

- Salient is comparatively stronger than Different.
- Diagnosis often points toward Salient but Generic or related patterns.
- Treatment links often pull toward distinctive assets, difference sharpening, or proposition clarity.

Guardrail:

- BBE Different is not the same as distinctive asset strength. Do not prescribe an asset audit unless distinctive asset evidence exists or is missing and needed.

### Strong But Leaking

Signal:

- Current Demand Power or Perceived Value remains comparatively strong.
- Momentum or input metrics show decline.
- Diagnosis may point toward Strong but Slipping.

Guardrail:

- Do not call the brand miscast based on one period.

### Relevant But Hard To Retrieve

Signal:

- Meaningful is stronger than Salient.
- Occasion or CEP evidence suggests limited mental availability.
- Treatment pull points toward mental availability or occasion memory.

Guardrail:

- Occasion overlap is not cannibalization proof.

### Equity Present, Conversion Constrained

Signal:

- BBE read is comparatively healthy.
- Growth Navigator or physical availability evidence indicates availability, visibility, value, or reach constraint.

Guardrail:

- GN evidence explains possible conversion constraints; it does not replace the BBE diagnosis.

## Section 5: Evidence Gap Map

Purpose:

Turn missing evidence into an executive decision tool.

This should answer:

```text
What should we request, validate, or connect before locking the action plan?
```

Rows:

- Gap type.
- Why it matters.
- Brands affected.
- Decision risk if unresolved.
- Best next evidence source.
- Owner candidate.

Example:

```text
Measured CEP evidence missing
Why it matters: Treatment paths point toward mental availability, but current CEP evidence is simulated.
Brands affected: Siete, PopCorners, Smartfood
Decision risk: Team may overbuild occasion strategy without measured entry-point proof.
Next source: Mental Availability / CEP packet
```

Visual:

- Use a quiet table or grouped list.
- Use orange only for high decision risk.
- Use blue for "request source" or "open data view."
- Use green only where evidence is sufficient.

## Section 6: Treatment Memory

Purpose:

Show how similar patterns connect to treatment paths without pretending outcomes are validated yet.

V1 language:

```text
Commonly considered for this pattern
```

Not:

```text
Recommended because it works
```

Each treatment memory item:

- Treatment path.
- Treatment family.
- Why similar cases point there.
- Required evidence before using.
- Follow-up signals.
- Contraindication.

Example:

```text
Strengthen distinctive brand assets
Why it appears: Similar patterns show high Salient with weaker Different.
Required proof: Distinctive asset recognition or branding quality evidence.
Follow-up signals: Different, Salient, asset recognition, branded recall.
Contraindication: Do not use as the primary answer if Meaningful foundation is weak.
```

## Future Section: Source Contradiction Queue

Purpose:

Use extracted source claims to expose tensions across decks, reports, and measured evidence.

Example:

```text
Claim tension
A source deck says youth relevance is improving, but current BBE Meaningful and Momentum evidence do not support that as a measured fact.
```

States:

- Needs review.
- Resolved as context.
- Promoted to evidence.
- Rejected / outdated.

Guardrail:

Extracted claims remain source claims, not canonical facts.

## Future Section: Precursor Watch

Purpose:

Show early-warning analogies across prior periods.

Example:

```text
This brand's current fingerprint resembles two prior brand-period cases that later moved into Strong but Slipping.
```

Required caveat:

```text
This is a pattern analogy, not a prediction.
```

Do not ship this section until period-over-period brand fingerprints are stable enough to avoid theater.

## Data Contract

Recommended service output:

```ts
type PatternRadarRecord = {
  brandId: string;
  brandName: string;
  period: string;
  category: string;
  topline: {
    patternLabel: string;
    read: string;
    confidence: 'Directional' | 'Supported' | 'Validated';
    similarBrandCount: number;
    materialGapCount: number;
    caveat: string;
  };
  fingerprint: SymptomFingerprint;
  similarBrands: SimilarBrandMatch[];
  emergingPatterns: PortfolioPattern[];
  evidenceGaps: PortfolioEvidenceGap[];
  treatmentMemory: TreatmentMemoryItem[];
  sourceContradictions: SourceContradiction[];
  precursorWatch: PrecursorWatchItem[];
};
```

```ts
type SymptomFingerprint = {
  equityShape: string;
  trajectory: string;
  supportLensCoverage: string;
  diagnosisPull: string[];
  treatmentPull: string[];
  blockers: string[];
  features: Record<string, string | number | boolean | null>;
};
```

```ts
type SimilarBrandMatch = {
  brandId: string;
  brandName: string;
  category: string;
  diagnosisName: string;
  strength: 'High' | 'Medium' | 'Low';
  score: number;
  reasons: string[];
  keyDifference: string;
  caveat: string;
};
```

```ts
type PortfolioPattern = {
  id: string;
  name: string;
  definition: string;
  matchedBrandIds: string[];
  evidenceBasis: string[];
  whyItMatters: string;
  investigateNext: string;
  guardrail: string;
};
```

```ts
type PortfolioEvidenceGap = {
  id: string;
  label: string;
  whyItMatters: string;
  affectedBrandIds: string[];
  decisionRisk: 'Low' | 'Medium' | 'High';
  nextSource: string;
  ownerCandidate: string;
};
```

```ts
type TreatmentMemoryItem = {
  treatmentId: string;
  treatmentName: string;
  family: string;
  whyItAppears: string;
  requiredEvidence: string[];
  followUpSignals: string[];
  contraindication: string;
};
```

## Computation Rules

Pattern Radar should use deterministic service logic first.

Inputs:

- `BrandHealthRecord`.
- Diagnosis result and rule trace.
- Evidence ledger.
- Treatment definitions.
- Diagnosis-treatment links.
- Growth Availability record.
- Mental Availability / CEP record.
- Evidence readiness.
- Source claims when available.
- Treatment outcomes when available.

Similarity should be based on BBE symptom features, not generic natural-language embeddings.

Feature examples:

- Meaningful ahead / momentum / category band.
- Different ahead / momentum / category band.
- Salient ahead / momentum / category band.
- Demand Power ahead / momentum / category band.
- Perceived Value ahead / momentum / category band.
- Primary diagnosis.
- Candidate diagnoses.
- Diagnosis confidence.
- Treatment family pull.
- Missing GN bridge.
- Missing measured CEP evidence.
- Category lens caveat count.

## Copy Tone

Use:

- "looks similar to"
- "shares a symptom pattern with"
- "worth investigating"
- "evidence gap"
- "treatment path commonly considered"
- "pattern analogy"
- "not causal"

Avoid:

- "proves"
- "caused by"
- "will happen"
- "twin"
- "prescribe"
- "winning treatment"
- "cannibalization"
- "portfolio migration"

## Empty And Partial States

### No Similar Brands

```text
No strong portfolio analogies found in the current demo packet.
The active diagnosis can still be interpreted from the brand's own evidence.
```

### Missing Support Lenses

```text
The similarity read is BBE-led. Growth Navigator, CEP, physical availability, or distinctive asset evidence is missing for one or more brands.
```

### Prototype Data

```text
Some support-lens evidence is simulated for prototype storytelling. Use it to understand the experience, not as measured decision proof.
```

### Brand Manager Mode

```text
Portfolio context is available in Insights Lead mode.
Switch modes to inspect similar brands, evidence gaps, and treatment memory.
```

## Sidecar Prompts

Suggested Pattern Radar prompts:

- "Why does Brand Doctor think these brands look similar?"
- "What is the strongest difference between these cases?"
- "What evidence should we collect before acting?"
- "Which treatment path is most defensible for this pattern?"
- "What should I not conclude from this portfolio analogy?"
- "Turn this into a 2-minute Insights Lead readout."

## Acceptance Criteria

Pattern Radar is ready for a customer demo when:

- It appears only after the active brand's BBE and support-lens context is visible.
- It uses the same Brand Health Record, diagnosis rules, evidence ledger, treatment library, and guardrails as the rest of the app.
- It shows at least three similar-brand matches when data supports them.
- Every match includes reasons, key difference, and caveat.
- Evidence gaps are visible and tied to decision risk.
- Treatment memory uses "options to consider" language.
- No section claims causality, prediction, cannibalization, or SKU-level pricing guidance.
- Brand Manager mode does not become overloaded.
- Insights Lead mode can inspect enough evidence to trust or challenge the read.
- Desktop and 390px mobile layouts have no horizontal overflow.
