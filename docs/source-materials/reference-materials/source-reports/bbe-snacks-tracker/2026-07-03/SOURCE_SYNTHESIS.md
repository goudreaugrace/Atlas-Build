# Source Synthesis - 2026 Q1 United States Snacks BBE Automated Report

## Why This Matters

This deck materially strengthens the source basis for the next Brand Doctor reasoning upgrade. It gives a formal automated-report frame for how BBE should read the same problem Kate and Lydia flagged in the prototype review: category index, size-adjusted Ahead/Behind, and Momentum are separate lenses and should not be collapsed into a generic "strong brand" read.

## High-Value Knowledge To Add To The Corpus

### 1. Three Benchmark Lenses

The automated report defines three BBE benchmark lenses:

- `vs. CATEGORY`: how the brand indexes versus the whole category.
- `AHEAD`: whether the brand is in the top third versus same size/life-stage peers.
- `MOMENTUM`: whether the brand improved significantly versus the prior period, tested at 95% confidence.

Implication for Brand Doctor:

- Category index is descriptive context, not the final health verdict.
- Ahead/Behind is the size-adjusted strength check.
- Momentum is the trajectory read and should remain the executive tension.
- The Equity Reasoning Layer should force these lenses to be interpreted together and in a defined precedence order.

### 2. Automated Report Example Mirrors Kate's Feedback

The deck's dummy chart-read example explicitly shows a large/established brand that over-indexes versus category on all BBE KPIs but is not Ahead on Pricing Power or Different and has flat Momentum.

Implication for Brand Doctor:

- This validates Kate's concern that category-leading/index strength can mask weakness.
- The system should avoid calling a brand "strong" simply because it over-indexes versus category.
- A better read is "large/category-leading, but not fully healthy if size-adjusted advantage and momentum are weak."

### 3. Ambition Is Ahead Plus Momentum

The deck frames ambition around brands being `AHEAD` and in `MOMENTUM` in anchor markets. It also links these states to growth relevance: brands that outperform peers and move size/life-stage tier, and brands with momentum on Demand Power or Pricing Power, are associated with stronger growth outcomes in the source framing.

Implication for Brand Doctor:

- The pilot doctrine should not use "high index" as success.
- The system should ask whether the brand is both ahead for its size/life stage and building momentum.
- Output-quality checks should flag any executive read that celebrates category index while hiding not-ahead or declining signals.

### 4. Outcome And Driver Roles

The deck reinforces:

- Demand Power and Pricing Power are outcome KPIs.
- Meaningful, Different, and Salient are input KPIs.
- Demand Power is typically driven by Meaningful and Salient.
- Pricing Power is typically driven more by Meaningful and Different.

Visual spot-check of slide 19 confirms the source weights shown:

- Demand Power: Meaningful 48%, Salient 30%, Different 22%.
- Pricing Power: Meaningful 55%, Different 39%, Salient 6%.

Implication for Brand Doctor:

- Treatment logic should connect Demand Power pressure primarily through Meaningful/Salient evidence.
- Price-value vulnerability should connect primarily through Meaningful/Different evidence.
- The system should interpret M/D/S/Pricing Power as a connected driver system, not isolated cards.

### 5. Pricing Power Guardrail

The deck strongly caveats Pricing Power:

- It is about the role of brand equity in justifying a premium.
- It is intentionally about the overall brand, not specific products/SKUs.
- It excludes product-specific pricing, packaging, store context, on-shelf display, and competitive store context.
- Specific price points require separate pricing studies such as conjoint/trade-off, Newton Miller Smith, or market mix modeling.

Implication for Brand Doctor:

- Current Pricing Power/Perceived Value guardrails are directionally right and should remain visible.
- The source deck adds useful examples of excluded evidence that can improve guardrail language.

### 6. Provocation Questions

The deck offers useful questions for weak output KPIs:

- For Pricing Power weakness: added value, differentiation against price-based switching, quality/leadership cues.
- For Demand Power weakness: meeting category needs, relevance/ease of choice, mental and physical availability.

For weak input KPIs:

- Salient: speed of coming to mind, right contexts/channels, memory structures.
- Different: standing out beyond price/promotion, innovation/category leadership, distinctive assets.
- Meaningful: superior proposition, benefits that matter, right usage occasions.

Implication for Brand Doctor:

- These now inform `ProvocationQuestionsModule` as a governed question artifact, not only candidate prompt copy.
- They should also inform the Treatment Recommendation artifact's "areas to inspect before action."
- Each provocation question should carry evidence to use, evidence still needed, and the overclaim it blocks.
- Questions should be prioritized in this order: source-deck questions, Kate/V7 calibration questions, then broader CMO/brand-growth questions.
- External brand-growth frameworks such as Kantar MDS, Kantar Blueprint for Brand Growth, Kantar BrandZ Chief Marketing Objectives, and WARC's brand/performance framing are useful for executive question shape, but they are not brand-specific evidence for PepsiCo claims. The reviewed reference note is preserved at `docs/source-materials/reference-materials/external-frameworks/brand-growth/2026-07-06-kantar-warc-cmo-question-framing/README.md`.

Implemented product translation:

- `provocation_questions` is now part of the BBE domain pack output-module stack.
- The module separates executive decision questions from source-owner handoff questions.
- Source-owner handoff questions currently cover chart reproduction approval, official demographic cuts, and Momentum movement/significance/room-to-grow evidence.
- The module blocks generic brainstorm questions, category-index-as-health-proof questions, typology-as-verdict questions, unsupported causality, SKU-level pricing guidance, simulated demographic claims, and unsupported cannibalization / portfolio migration / occasion substitution claims.

### 7. Source Data Requirements

The deck names several source-context inputs that should be captured or requested:

- Data period and study context.
- Sample design, including age 13-70, gender, past 4-week category users, and readable base sizes.
- Market conditions.
- Category disruptors.
- Mental availability levers, including A&M/SOV/creative performance.
- Physical availability levers, including distribution, price positioning, pack, promos, supply, delisting, retailer environment.
- Monthly diagnostics where base size permits: TBCA, funnels, consideration, imagery.

Implication for Brand Doctor:

- These are source-readiness requirements, not nice-to-have annotations.
- Demographic cuts requested after the demo fit directly into this source-data framework.

## Recommended Product Incorporation

### Add To Source Ledger

- Treat `deck-chart-ledger.json` as the first governed bridge between source-report structure and future report modules.
- Use its reconciliation states to decide where the current processed BBE rows are sufficient for prototype output and where chart/workbook promotion is still needed.
- Keep source-report extraction as `reviewed_for_prototype` until the business/source owners approve the underlying workbook export and mapping.
- Make generated slides, QBR pages, Jarvis canvases, and app modules consume the source ledger and `EquityReasoningRead`, not the raw PowerPoint directly.

### Add To Equity Reasoning Layer

- Lens precedence and definitions for `vsCategory`, `aheadBehind`, and `momentum`.
- Strength-language permission rules that block "strong" when not-ahead or declining signals materially undermine the profile.
- A "large but vulnerable" read state for large/category-leading brands that are not Ahead on key size-adjusted metrics and/or have negative Momentum.
- Driver-link rules that map Demand Power to Meaningful/Salient and Pricing Power/Perceived Value to Meaningful/Different.

### Add To Evals

- "Is this brand strong or just big?"
- "Explain category index, Ahead/Behind, and Momentum and how they relate."
- "A brand over-indexes vs category but is not Ahead on Different or Pricing Power; what should the read be?"
- "What should I inspect if Pricing Power is weak?"
- "What should I inspect if Demand Power is weak?"

### Add To Data/Source Readiness

- Approved source fields for sample design/base size.
- Demographic cut availability.
- Market/category disruptor context.
- Mental and physical availability levers.
- Monthly diagnostic availability and base-size caveats.

### Keep Caveated

- Kantar BrandZ typology can remain source context but should not headline the product's diagnosis unless explicitly asked.
- The source deck is an automated report and should not override SME-approved PepsiCo language without review.
