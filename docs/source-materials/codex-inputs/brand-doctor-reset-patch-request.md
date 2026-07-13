You are working in my local BBE Brand Doctor project.

I have placed two extracted patch/source packages under the /patches folder:
1. The full BBE Brand Doctor Codex package.
2. The Start Here / Grounding Education patch.

Your job is to merge these into the current project as a clean, focused prototype.

IMPORTANT PRODUCT RESET
The core product is now NOT:
- an AIM run prototype
- a two-brand comparison workflow
- a Lay’s vs PopCorners exercise
- a generic dashboard
- a chatbot wrapper

The core product IS:
A single-brand Brand Equity Diagnostic System — “Brand Doctor.”

Core journey:
Start Here → Find My Brand → Brand Health Panel → Current Diagnosis → Why We Believe It → Root Cause Explorer → Dialog With Data → Treatment Pharmacy → Treatment Plan → Follow-Up Signals.

Product promise:
A brand manager or insights lead can come to the tool, find their brand, understand its current brand equity health, believe the diagnosis, interrogate the underlying data, and choose from an evidence-backed library of treatment options.

AUDIENCE
Build for two audiences:
1. Brand Manager View:
   - Clean
   - Simple
   - Plain-English
   - Big diagnosis
   - Few but strong visuals
   - Clear “what this means” and “what to consider next”

2. Insights Lead View:
   - Deep evidence
   - Benchmarks
   - rules that fired
   - source periods
   - caveats
   - data-cut and category-lens guardrails
   - diagnostic confidence
   - ability to inspect why the diagnosis and treatment options surfaced

FIRST TASK: CREATE OR UPDATE PLANS.md
Before coding, create or update a top-level PLANS.md.

PLANS.md must include:
- Product north star
- Current implementation phase
- Non-negotiable scope boundaries
- Current active tasks
- Deferred tasks
- Acceptance criteria
- Files expected to change
- Known risks
- Open questions
- Last updated timestamp
- A running task checklist

Codex must keep PLANS.md updated as work progresses.
Do not perform large refactors without updating PLANS.md first.

READ FIRST
Read the following from the current repo and from /patches:
- README.md
- START_HERE_FOR_CODEX.md
- AGENTS.md
- PLANS.md, if present
- STATUS.md
- BACKLOG.md
- DECISIONS.md
- docs/product/PRD.md
- docs/design/UI_UX_SPEC.md
- docs/design/PEPSICO_INTERNAL_TOOL_UI_FOUNDATION.md
- docs/diagnostics/DIAGNOSTIC_FRAMEWORK.md
- docs/diagnostics/TREATMENT_LIBRARY.md
- docs/ai/PROMPTS.md
- docs/product/START_HERE_EDUCATION_REQUIREMENTS.md
- docs/design/START_HERE_UX_SPEC.md
- docs/ai/START_HERE_DIALOG_PROMPTS.md

If some files do not exist in the current project, find them in /patches and copy or merge them into the appropriate location.

IMPLEMENTATION PRIORITIES

PHASE 0 — Inventory and merge plan
1. Inspect the current project structure.
2. Inspect /patches and identify the extracted package folders.
3. Determine whether the current app already has conflicting AIM-run or brand-pair code.
4. Write/update PLANS.md with a concrete merge plan.
5. Do not delete working code until you understand what replaces it.

PHASE 1 — Product framing and navigation
Implement or update navigation around the Brand Doctor journey:
- /start-here
- / or /brands for Find My Brand
- /brand/[brandId] or equivalent for the Brand Health Record
- Ensure Start Here is the first prominent entry point.

Visible product language:
- Product name: BBE Brand Doctor
- Product description: Find your brand. Understand its equity health. Believe the diagnosis. Choose the right treatment path.
- Avoid AIM OS as visible framing for now.
- Avoid two-brand comparison as the main journey.

PHASE 2 — Start Here grounding education
Implement the Start Here page from the grounding patch.

It must teach:
1. Why brand equity matters.
2. The difference between outcome KPIs and input KPIs.
3. Demand Power and Pricing Power.
4. Meaningful, Different, and Salient.
5. The three benchmark views: vs Category, Ahead, Momentum.
6. Why gaining Momentum matters.
7. BrandZ typology / life-stage logic.
8. How BBE connects to Growth Navigator.
9. Pricing Power guardrail: broad brand-equity price justification only, not SKU-level pricing.
10. How the Brand Doctor works: Health Panel → Diagnosis → Evidence → Treatment Pharmacy → Follow-Up Signals.

Design:
- Big, clear, onboarding-oriented.
- Use PepsiCo UI foundation.
- Include “Brand Manager” and “Insights Lead” explanation modes if feasible.
- Include a light “ready to diagnose” transition into Find My Brand.

PHASE 3 — JSON-first data foundation
Keep JSON-first. Do not add Supabase yet.

Create or merge these config/data files:
- diagnosis_definitions.json
- diagnosis_rules.json
- treatment_definitions.json
- diagnosis_treatment_links.json
- treatment_plan_templates.json
- dialog_question_library.json
- visualization_specs.json
- momentum_policy.json
- gn_framework_nodes.json
- source_period_policy.json
- color_coding_rules.json
- pricing_power_guardrails.json

Ensure diagnosis and treatment logic are loaded from config, not hard-coded in React components.

Data model objects required:
- BrandHealthRecord
- EquityLabMetric
- MomentumAmbition
- GrowthNavigatorVitals
- DiagnosisResult
- TreatmentOption
- TreatmentPlan
- EvidenceItem
- DialogContext

PHASE 4 — Brand Health Panel
Build the core brand page.

It must show:
- Brand name
- Market
- Category lens
- Period
- BrandZ typology
- Current condition
- Confidence
- Demand Power
- Pricing Power
- Meaningful
- Different
- Salient
- PowerShare, if available
- PricingPower9Box, if available
- Three benchmark chips per major KPI:
  - vs Category
  - Ahead
  - Momentum

Important:
Do not show red/green without explaining which benchmark is red/green.
A red Momentum signal is different from a red Ahead signal.

PHASE 5 — Momentum Monitor
Add a Momentum Monitor panel.

Purpose:
The clinical objective is not just current equity health. It is whether the brand is gaining brand equity momentum.

Momentum Monitor must show:
- Demand Power momentum
- Pricing Power momentum
- M/D/S momentum
- Current strength vs trajectory
- Momentum read:
  - Strong and Building
  - Strong but Holding
  - Strong but Slipping
  - Weak but Gaining
  - Weak and Stuck
  - Weak and Declining

Use this product principle:
Current strength tells us how healthy the brand is today.
Momentum tells us whether the brand is getting healthier.

PHASE 6 — Growth Navigator Vitals
Add GN Vitals as commercial vitals, not as a full dashboard.

Use these five GN areas:
- Proposition
- Reach
- Resonance
- Available & Visible
- Value

For each, show:
- Status
- Key signals
- Source period
- Whether it supports, complicates, or is missing from the equity diagnosis

Include a source-period compatibility label:
- aligned
- directionally comparable
- lagged
- not comparable
- insufficient

PHASE 7 — Diagnosis engine
Build deterministic diagnosis candidate generation from config.

The LLM must NOT invent diagnoses.

Diagnosis engine should:
1. Read the active BrandHealthRecord.
2. Evaluate diagnosis_rules.json.
3. Produce one primary diagnosis and optional secondary watchouts.
4. Attach supporting evidence and counter-evidence.
5. Attach confidence and severity.
6. Attach “what not to conclude.”

Core diagnosis states to support:
- Strong and Building
- Strong but Holding
- Strong but Slipping
- Salient but Generic
- Meaningful but Invisible
- Different but Niche
- Underbuilt Equity
- Foundation Deficit
- Momentum Deficit
- Equity Erosion Risk
- Commercial Conversion Leak
- Price-Value Vulnerability
- Price Justification Gap
- Under-Leveraged Equity
- Over-Activated Growth
- Healthy / Monitor

PHASE 8 — Why We Believe It
Build a diagnosis explanation page/section.

It must include:
- Diagnosis
- Plain-English read
- Why this matters
- Supporting evidence
- Counter-evidence
- Missing data
- Category lens caveat
- Data-cut caveat
- Pricing Power guardrail if relevant
- Confidence
- What not to conclude

This is the “patient believes the diagnosis” surface.
Do not show treatment options before the diagnosis is understandable.

PHASE 9 — Root Cause Explorer
Build interactive visuals that connect:
- Demand Power ← Meaningful + Salient
- Pricing Power ← Meaningful + Different
- GN conversion ← Proposition + Reach + Resonance + Available & Visible + Value

Use visuals appropriate to the data:
- KPI cards with benchmark chips
- small trend lines
- driver relationship map
- typology card or map
- evidence drawer
- GN vitals grid

Avoid generic dashboards and card soup.

PHASE 10 — Treatment Pharmacy
Build a configurable treatment library.

Treatment cards must include:
- Treatment name
- Treatment family
- Which ailment / diagnosis it treats
- Why it fits this brand
- Expected metric impact
- Pros
- Cons
- Cost level
- Difficulty
- Time to impact
- Likelihood of success
- Dependencies
- Owners
- Risks
- Follow-up signals

Treatment families should include:
- Meaningful / Relevance treatments
- Different / Distinctiveness treatments
- Salient / Mental Availability treatments
- Pricing Power / Value treatments
- GN Conversion treatments
- Specialist referrals

Important:
Do not recommend acceleration before foundation.
If the foundation is weak, surface foundational treatments first.

PHASE 11 — Treatment Plan and Follow-Up Signals
Allow the user to assemble or view a recommended treatment path:
- Foundation first
- Momentum-building treatment
- Conversion treatment
- Specialist referral, if needed
- Follow-up labs / signals

Follow-up signals should answer:
- What should move next quarter?
- What should move over the next MAT period?
- What would prove the treatment is working?
- What would falsify the diagnosis?

PHASE 12 — Dialog With Data
Implement or update LLM chat so it is scoped to:
- active brand
- active visual
- active BrandHealthRecord
- diagnosis result
- evidence ledger
- treatment library
- source/caveat context

The chat should support:
- “Explain this like I’m a brand manager.”
- “Explain this like I’m an insights lead.”
- “Why did this diagnosis fire?”
- “What evidence supports this?”
- “What evidence contradicts it?”
- “What should I not conclude?”
- “Which treatment should we consider first and why?”
- “What would make this diagnosis wrong?”
- “Show the rule that fired.”
- “Which metrics should move if the treatment works?”

The chat must not:
- invent unsupported metrics
- invent treatments
- claim causality
- convert Pricing Power into SKU-level price advice
- imply cannibalization or portfolio migration without evidence
- behave like a generic brand consultant

PHASE 13 — Brand Manager / Insights Lead modes
Add a simple mode toggle.

Brand Manager mode:
- simple diagnosis
- plain English
- fewer charts
- top evidence
- treatment path
- follow-up signals

Insights Lead mode:
- all metrics
- benchmark detail
- evidence drawer
- rule trace
- source periods
- caveats
- data quality
- treatment logic
- config references

PHASE 14 — Validation and documentation
Run:
- pnpm validate:data
- pnpm typecheck
- pnpm lint, if available
- pnpm build, if feasible

Update:
- PLANS.md
- STATUS.md
- BACKLOG.md
- DECISIONS.md

Document:
- what was implemented
- what remains mocked
- what config files drive diagnosis
- what config files drive treatment selection
- what remains deferred

DESIGN REQUIREMENTS
Use the PepsiCo Internal Tool UI Foundation.

The product should feel:
- PepsiCo-branded
- trustworthy
- warm
- premium but not flashy
- editorial where users need to understand
- operational where users need to act
- specific to the work
- not like a generic AI dashboard
- not like a chatbot wrapper
- not like stacked card soup

Use:
- warm off-white canvas
- navy authority surfaces
- orange sparingly for primary action or caution
- blue for interaction and selected states
- green for validated/success states
- clear evidence and limitation labeling
- progressive disclosure

NON-NEGOTIABLE GUARDRAILS
1. Diagnosis and treatment matching must be config-driven.
2. LLM explains, interrogates, challenges, and translates. It does not invent rules.
3. Every diagnosis must have supporting evidence and counter-evidence.
4. Every treatment must explain why it fits and what must be true for it to work.
5. Pricing Power is broad brand-equity price justification only. It is not SKU price optimization.
6. Category lens must always be visible.
7. Data-cut guardrails must remain visible.
8. AIM OS can be referenced in docs as future-compatible, but do not make it the product framing.
9. Do not build Supabase yet.
10. Do not turn this into a brand-pair comparison tool.

STOP CONDITIONS
If major existing structure conflicts with this plan:
- Do not delete everything immediately.
- Write the conflict in PLANS.md.
- Propose the minimal safe migration.
- Continue only after preserving useful code or intentionally replacing it with a documented decision.

At the end, provide a concise implementation summary and list any commands that failed.