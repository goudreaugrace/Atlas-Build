# BBE Data Foundation Hardening Plan

## Purpose

This plan defines the data work needed before BBE Brand Doctor can safely deepen its knowledge, reasoning, and governed output generation.

The current prototype has useful brand-level BBE records and enough source material to demonstrate the experience. The next phase needs cleaner, richer, better-governed data contracts so the system can answer harder questions without hallucinating or overclaiming.

## Current Data Reality

Available today:

- Brand-level BBE metric records for Snacks and Better-for-You Snacks.
- KPI values for Demand Power, Pricing Power, Meaningful, Different, Salient, typology, and related measures.
- `Ahead` and `Momentum` flags for many BBE records.
- Multi-period trend rows for selected metrics.
- Source file and slide references.
- Q1 2026 United States Snacks automated report as a preserved PPTX.
- Searchable deck extraction and slide inventory.
- Deck chart ledger with 107 native charts, 107 linked embedded Excel workbooks, slide mapping, chart-cache previews, and processed-row reconciliation.
- Product source data ledger that records current source posture, allowed uses, blocked uses, caveats, and pilot promotion requirements.
- Prototype-reviewed strategic context packets for selected brands.
- Some clearly labeled simulated Growth Availability and Mental Availability demo packets.

Not available today:

- Official BBE demographic performance cuts.
- Segment-level metric values by age, gender, ethnicity, income, or region.
- Segment-level base sizes and significance flags.
- Fully explainable peer-set/life-stage thresholds behind `Ahead`.
- Cell-level workbook promotion from the PPTX embedded worksheets into canonical product records.
- Official source-owner approval for every strategic context and Momentum packet.

## Data Lanes

### 1. Measured BBE Data

Canonical source for brand equity diagnosis.

Required fields:

- `brandId`
- `brandName`
- `market`
- `category`
- `period`
- `metricId`
- `metricLabel`
- `value`
- `valueType`
- `categoryAverage`
- `categoryIndex`
- `aheadStatus`
- `momentumStatus`
- `trendDelta`
- `significanceStatus`
- `baseSize`
- `baseType`
- `questionText`
- `sourceFile`
- `sourceSlide`
- `sourceChart`
- `sourceTable`
- `sourceOwner`
- `approvalStatus`

### 2. Deck Extracted Data

Source-report data extracted from PowerPoint chart XML, embedded worksheets, text, notes, and rendered slide inspection.

Use for:

- validating processed BBE rows
- recreating report modules
- preserving source definitions and caveats
- mapping chart patterns to output modules
- determining which deck slides already have machine-readable metric coverage versus which need source-owner workbook promotion

Do not use for:

- official pilot decisions until source-owner review approves the extraction.

Current artifacts:

- `docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/deck-chart-ledger.json`
- `src/data/processed/bbe_source_data_ledger.json`
- `scripts/extract-bbe-deck-chart-ledger.mjs`

Current reconciliation:

- 128 source slides.
- 107 native charts.
- 107 chart-linked embedded Excel workbooks.
- 11,158 processed BBE metric rows.
- 32 slides with both native charts and processed metric rows.
- 67 slides with processed metric rows but no native chart object.
- 1 slide with native charts but no processed metric rows.
- 28 slides with no machine-readable metric payload.

### 3. Official Demographic Performance Cuts

Future source-owner data required to answer Kate-style questions.

Required fields:

- `brandId`
- `market`
- `category`
- `period`
- `metricId`
- `demographicDimension`
- `segment`
- `segmentValue`
- `categoryBenchmark`
- `aheadStatus`
- `momentumStatus`
- `baseSize`
- `readableBase`
- `significanceStatus`
- `sourceFile`
- `sourceOwner`
- `approvalStatus`

### 4. Simulated Demographic Diagnostics

Prototype-only data to demonstrate how demographic diagnostics would work once official cuts are loaded.

Rules:

- Must use `sourceType: simulated`.
- Must use `approvalStatus: prototype_simulation`.
- Must include `replacementRequirement`.
- Must render with a visible simulated-data badge.
- Must be excluded from official or pilot factual claims.

Recommended initial dimensions:

- age cohort: `13-17`, `18-24`, `25-34`, `35-49`, `50-70`
- gender only if there is a clear demo need
- Hispanic / non-Hispanic only if business stakeholders expect that question

Avoid broad synthetic expansion across income, race, region, household composition, or lifestyle until specific use cases justify it.

### 5. External Demographic Context

Examples:

- US Census ACS
- Census Population Estimates
- other approved market-sizing sources

Use for:

- audience sizing
- market composition
- geographic context
- opportunity framing

Do not use for:

- brand equity performance by demographic
- diagnosing whether a brand is strong or weak with a demographic
- substituting for BBE demographic cuts

### 6. Growth Navigator / Commercial Context

Support layer, not replacement for BBE.

Fields:

- market share
- penetration
- frequency
- category growth
- Demand Power share vs market share
- room-to-grow inputs
- price / promo / distribution where available
- source caveats

### 7. Mental Availability / CEP Data

Support layer for Salience and action planning.

Fields:

- CEP / occasion / need state
- category relevance
- brand linkage
- mental penetration
- network size
- share of mind
- advantage / disadvantage status
- buyer / non-buyer split where available
- source caveats

### 8. Brand Strategic Context

Needed to translate diagnosis into strategically useful recommendations.

Fields:

- brand statement
- brand DNA
- target audience
- positioning
- portfolio role
- planning priorities
- creative platform
- campaign context
- innovation or pack changes
- claims to use
- claims not to make
- official-source status

### 9. Treatment Evidence

Needed for governed recommendations.

Fields:

- treatment path
- diagnosis patterns it fits
- required evidence
- counter-indications
- expected mechanism
- examples / cases
- owner applicability
- risk and caveats
- follow-up proof signals

## Source Governance Fields

Every source-backed object should carry:

- `sourceType`: measured, extracted, simulated, assumption, public, transcript_feedback, reviewed_local
- `sourceOwner`
- `approvalStatus`
- `allowedUse`: demo, review_draft, pilot_candidate, official
- `freshnessDate`
- `replacementRequirement`
- `confidence`
- `caveats`
- `canonicalUseAllowed`

## Demographic Evidence Gate

The system should classify demographic answerability as:

- `measured_available`: official demographic BBE cut exists with readable base.
- `measured_limited`: official cut exists but base/significance is weak.
- `simulated_available`: prototype simulation exists.
- `context_only`: Census or other external context exists but no BBE cut exists.
- `unavailable`: no relevant demographic evidence.

Allowed behavior:

- `measured_available`: answer with source and caveats.
- `measured_limited`: answer cautiously or block depending on threshold.
- `simulated_available`: answer as workflow demonstration only.
- `context_only`: provide audience context but block brand-performance diagnosis.
- `unavailable`: say what data is needed.

## Immediate Data Tasks

1. Completed first-pass deck chart extractor for the Q1 2026 Snacks PPTX.
2. Completed first-pass chart-to-slide mapping and source ledger generation.
3. Normalize current BBE metric records into a stronger canonical schema.
4. Add source governance metadata to each record.
5. Promote embedded workbook cells only after source-owner review or a clear prototype-only caveat.
6. Add base-size and question-text mapping where extractable.
7. Create simulated demographic diagnostics records for priority demo brands.
8. Add official demographic-cut requirements and example schema.
9. Add data validation for measured vs simulated separation.
10. Update the data dictionary and prototype assumption catalog.

## Validation Questions

The hardened data foundation should be able to answer:

- Which source supports this metric?
- Is this value measured, extracted, simulated, or assumed?
- What period and sample does it represent?
- Is the base readable?
- Is the movement significant or directional?
- Is this a total-market read or a demographic cut?
- Is this approved for demo only, pilot review, or official use?
- What data would replace this prototype assumption?
