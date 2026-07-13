# BBE v7 Accepted Requirements And Foundation Gaps

## Purpose

This is the single product source of truth for how the updated BBE v7 specification is being absorbed into Brand Doctor.

The original stakeholder document remains archived as source material, but product and build decisions should use this report going forward instead of re-reading the original Word document for every planning pass.

Source archive:

- `docs/source-materials/reference-materials/source-reports/bbe-v7-spec-review/2026-07-01/BBE_v7_Spec_Review_Notes.docx`
- `docs/source-materials/reference-materials/source-reports/bbe-v7-spec-review/2026-07-01/BBE_v7_Spec_Review_Notes.extracted.md`

Companion evaluation:

- `docs/product/BBE_V7_SPEC_REVIEW_ARCHITECTURE_EVALUATION.md`

## Product Interpretation

The v7 requirements sharpen the flagship BBE Momentum / QBR use case. They do not redefine the whole product as a static report generator.

Accepted product direction:

- BBE is the diagnostic spine.
- Jarvis is the conversation and orchestration layer.
- Brand Intelligence Packets are the serving contract.
- Dynamic views and work artifacts are the governed output layer.
- Human brand, insights, and leadership teams remain the decision makers.
- Generated work is review-draft support until explicit review, publish, export, and circulation gates are implemented.

## Current Implementation Checkpoint - 2026-07-02

The accepted v7 foundation is now represented in the POC through shared data, rules, packet contracts, Assistant/Jarvis routing, and durable Brand Work artifacts.

Implemented artifact coverage:

- Executive QBR / CMO Review Read: leadership verdict, takeaways, BBE bloodwork, proof cards, guardrails, inline approved views, treatment path, next decision, and governance disclosure.
- Treatment Recommendation / Treatment Read: diagnosis-to-treatment bridge, ranked options to consider, brand-specific basis, evidence to inspect, guardrails, approved evidence views, and next test path.
- Evidence Read / Proof Pack: actual data basis, metric cards, proof cards, source posture, gaps and caveats, guardrails, approved evidence views, next proof path, and metadata disclosure.
- Goal + Composition Planner: QBR-related asks can route into Executive QBR, Evidence Read, Treatment Read, or Assumption/Readiness Read modes without arbitrary generated UI.

Remaining near-term artifact gap:

- Assumption/Readiness Read needs the same high-fidelity treatment so measured, prototype-assumed, Codex-created, missing, and pilot-replacement work are unmistakable before stakeholder review.

Current POC stance:

- The product now accounts for the v7 requirements at the foundation level.
- Priority demo brands have enough POC assumption coverage to show the intended system behavior.
- Any Codex-created or prototype-reviewed data must remain labeled and must be replaced by source-owner-approved data before pilot/executive circulation.

## Included In Current Product Foundation

### User-Facing Metric Language

Status: included.

Current product truth:

- Use `Perceived Value` as the user-facing label.
- Preserve `Pricing Power` only as source metric lineage, source-keyed config, archived source copy, or explicit guardrail language.
- Keep the guardrail visible: Perceived Value is broad brand-equity price justification, not SKU-level pricing guidance.

Foundation locations:

- `src/data/config/momentum_policy.json`
- `src/data/config/pricing_power_guardrails.json`
- `BrandIntelligencePacket.displayLanguage`
- active report, Data, Jarvis, Assistant, Work, Learn, and Wiki language

### SMD Ordering

Status: included.

Current product truth:

- User-facing input metric order is Salient, Meaningful, Different.
- Source materials can preserve original metric order when needed for lineage.
- SMD order is an interpretation and presentation convention, not a claim that the metrics operate independently.

Foundation locations:

- `src/data/config/momentum_policy.json`
- `src/data/config/kpi-area-definitions.json`
- `src/components/intelligence/DynamicViewRenderer.tsx`
- active learning/report/work surfaces

### Momentum As Verdict

Status: included.

Current product truth:

- Momentum is the headline trajectory verdict.
- Current strength, Ahead/Behind, and vs-category context support the read but should not replace Momentum as the executive verdict.

Foundation locations:

- `src/data/config/momentum_policy.json`
- `src/data/config/color_coding_rules.json`
- `BrandIntelligencePacket.momentumIntelligence`
- `BrandIntelligencePacket.momentumQualityChecks`

### Ahead/Behind As Size-Check

Status: included as policy; needs continued artifact discipline.

Current product truth:

- Ahead/Behind is a size-check and ambition lens.
- It must not be used as opportunity sizing.
- It must not substitute for Room to Grow.
- It must not imply cannibalization, portfolio migration, or occasion substitution.

Foundation locations:

- `src/data/config/momentum_policy.json`
- `src/data/config/color_coding_rules.json`
- `src/data/config/output-quality-standards.json`
- `BrandIntelligencePacket.momentumQualityChecks`

### Momentum x Room To Grow

Status: included as architecture and partial data; not complete for every POC brand.

Current product truth:

- Use explicit Room to Grow inputs when available: penetration headroom, Demand Power / share gap, and category growth.
- If Room to Grow inputs are missing, show the gap. Do not fall back to Ahead/Behind.
- Treat Room to Grow as QBR provocation context unless approved source-owner extracts make it executive-ready.

Foundation locations:

- `src/data/config/momentum-source-handoff-requirements.json`
- `src/data/config/dynamic-view-registry.json`
- `src/data/demo/momentum-intelligence-source-packets.json`
- `src/lib/intelligence/momentum-source-adapters.ts`
- `BrandIntelligencePacket.roomToGrow`
- `momentum_room_to_grow_grid`

Current coverage:

- Lay's, Cheetos, Siete, and Tostitos now have prototype/directional Momentum source packets with peer set, market context, Room to Grow inputs, and SMD contribution weights.
- Cheetos and Tostitos are Codex-created POC assumption packets, not approved source-owner data.
- All Codex-created and Codex-assisted assumptions are cataloged in `docs/data/PROTOTYPE_ASSUMPTION_CATALOG.md`.
- POC QBR outputs must disclose whether Room to Grow is approved, prototype-reviewed, adapter-derived, partial, or missing.

### Trend Over Time

Status: included as directional trend foundation; approved significance remains a source gap.

Current product truth:

- Use available trend series for multi-period context.
- Treat trend deltas as directional unless source-provided significance exists.
- Keep source-period compatibility caveats visible when combining BBE and Growth Navigator context.

Foundation locations:

- `BrandIntelligencePacket.momentumTrendContext`
- `src/data/config/source_period_policy.json`
- `BrandIntelligencePacket.momentumQualityChecks`
- `src/data/config/momentum-source-handoff-requirements.json`

### Output Quality Checks

Status: included as packet-level checks and visible in the core QBR, Treatment, and Evidence artifacts.

Current product truth:

- Governed outputs should lead with the point.
- They should interpret, not narrate.
- They should be honest about certainty.
- They should be grounded in category and real brand context.
- They should show the right comparison set.
- They should name a watch-out.
- They should end in a useful provocation.
- Treatment language should stay in "paths to consider / areas to inspect" language.

Foundation locations:

- `src/data/config/output-quality-standards.json`
- `BrandIntelligencePacket.outputQualityChecks`
- Data view quality sections
- QBR/story/treatment dynamic views

### Competitive Set / Peer Basis

Status: architecture included; content coverage is a foundation gap before QBR polish.

Current product truth:

- Every Ahead/Behind or comparison-influenced read should carry peer-set label, peer count, selection basis, source status, and caveats.
- Peer sets are source metadata, not generic brand similarity.
- Do not blend different category trackers or peer definitions without caveats.

Foundation locations:

- `BrandIntelligencePacket.peerSet`
- `src/data/config/output-quality-standards.json`
- `data_basis_inspector`
- `peer_comparison`
- `momentum_room_to_grow_grid`
- `src/data/config/momentum-source-handoff-requirements.json`

Current coverage:

- Lay's, Cheetos, Siete, and Tostitos have prototype/directional peer-set basis/count in `src/data/demo/momentum-intelligence-source-packets.json`.
- Cheetos and Tostitos peer sets are Codex-created POC assumptions that must be replaced with approved competitive-set definitions before pilot or executive circulation.
- Adapter-derived peer sets can still be built from same-category measured Growth Navigator records when no explicit Momentum packet is loaded.

### Urgency And Horizon

Status: included in provocation/treatment foundation and visible in QBR/Treatment next-path sections.

Current product truth:

- Provocations and treatment paths should distinguish act-now, watch, and longer-term themes.
- Urgency should derive from evidence strength, trend severity, data freshness, and decision horizon.
- Do not turn this into owner-by-owner project management in the POC.

Foundation locations:

- `create_growth_provocations`
- `growth_provocation_list`
- `treatment_path_card`
- `src/data/config/treatment-definitions.json`
- `src/data/config/diagnosis-treatment-links.json`

### Brand Statement And Strategic Context

Status: included for priority POC brands as prototype/reviewed-public context; official-source gap remains.

Current product truth:

- Use Brand Strategic Context to tailor reads by real brand posture, role, DNA, planning priorities, creative platform, and claims boundaries.
- Label prototype or reviewed-public context before executive or agency circulation.
- Do not infer official brand strategy from BBE metrics alone.

Foundation locations:

- `src/data/demo/brand-strategic-context-packets.json`
- `BrandIntelligencePacket.strategicContext`
- `BrandIntelligencePacket.strategicContextReadiness`
- Brand Data and governed work artifacts

Current coverage:

- Lay's, Cheetos, Siete, and Tostitos have first-class prototype/reviewed-public Brand Strategic Context packets.
- Fully approved source-owner Brand Strategic Context remains a pilot hardening need.

### Color Lens Policy

Status: included.

Current product truth:

- Momentum can use the strongest verdict color treatment.
- Ahead/Behind and vs-category should use quieter context styling.
- If context lenses are colored, the UI must label what each color means and not imply all colors are equivalent verdicts.

Foundation location:

- `src/data/config/color_coding_rules.json`

## Deferred From The Funding POC

These are valuable but intentionally not required before the next dynamic QBR artifact build.

### Full Draft / Reviewed / Published Lifecycle

Defer to pilot hardening.

POC stance:

- Keep artifacts as review-required drafts.
- Keep export, copy, circulation, official approval, and publishing gated.
- Do not build full reviewer identity, immutable versions, publishing workflow, or enterprise retention yet.

Why deferred:

- It is important production governance, but not needed to prove fundable value.
- Overbuilding lifecycle before the artifact is compelling would slow the POC.

### Cross-Quarter Assistant Memory Of Prior Reads

Defer to phase 2.

POC stance:

- Reconstruct trend from source data.
- Do not use hidden assistant memory as canonical evidence.
- Reviewed memory can be future context only after governance, identity, persistence, and reversibility are clear.

### Production Source Ingestion And Canonical Writes

Defer beyond current POC.

POC stance:

- Source-owner handoff contracts and validation can exist.
- Runtime file-drop and browser-local promoted sources remain review/intake context.
- Do not auto-promote uploaded files into canonical facts.

### Export / Circulation

Defer beyond current POC.

POC stance:

- Show what the artifact would become.
- Keep export/circulation disabled until artifact readiness, identity/access, approval, and policy gates clear.

### Outcome Learning / Treatment Efficacy Claims

Defer beyond current POC.

POC stance:

- Recommend treatment paths and follow-up signals.
- Do not claim treatment efficacy without accepted baseline, follow-up, and outcome methodology.

### Detailed Action Planning

Defer for the funding demo.

POC stance:

- Provide treatment recommendations, areas to inspect, contraindications, and next proof signals.
- Avoid task lists with owners, timelines, and operating plans unless the product later adds an explicit planning workflow.

### Broad Comparison Lab As A Demo Centerpiece

Defer as a headline demo.

POC stance:

- Keep comparison as a supporting governed skill.
- The funding demo should focus on the executive QBR read, data/evidence inspector, treatment recommendation, and brief/story builder.

## Foundation Items To Resolve Before The Dynamic QBR Build

The dynamic artifact build should not wait for production governance, but these foundation items should be resolved or explicitly caveated before QBR polish.

### 1. Competitive Set Coverage For Priority Demo Brands

Recommendation: resolved for POC assumptions; replace for pilot.

Reason:

- The QBR will use Ahead/Behind, category context, and executive comparison language.
- v7 specifically calls for the right competitive set.
- If peer-set basis/count is missing or inconsistent, the polished artifact will look more authoritative than the data supports.

Minimum POC solution:

- Completed: Lay's, Cheetos, Siete, and Tostitos now have peer-set metadata in the Momentum source packet path, not inside React components.
- Each priority demo brand includes peer-set id, label, peer brand IDs, peer count, selection basis, source owner/date, and caveats.
- Cheetos and Tostitos are explicitly Codex-created POC assumptions.

Do not solve yet:

- Full enterprise competitive-set governance.
- Cross-market tracker reconciliation.
- Automatic peer selection algorithms.

### 2. Room To Grow Coverage For Priority Demo Brands

Recommendation: resolved for POC assumptions; replace for pilot.

Reason:

- Momentum x Room to Grow is one of the central v7 requirements.
- The flagship QBR should not rely on Ahead/Behind as a proxy for opportunity.

Minimum POC solution:

- Completed: the four priority demo brands have explicit Room to Grow inputs.
- Lay's and Siete remain prototype-reviewed/directional.
- Cheetos and Tostitos are Codex-created directional assumptions.
- QBR artifacts must keep these values as provocation context, not forecasts or investment sizing.

Do not solve yet:

- Official investment sizing.
- Forecasting.
- Causal conversion from equity to sales.

### 3. SMD Contribution Weight Coverage

Recommendation: resolved for POC assumptions; replace for pilot.

Reason:

- The QBR should prioritize which S/M/D driver is most strategically useful.
- Without contribution weights, the artifact can still diagnose but should not imply modeled driver contribution.

Minimum POC solution:

- Completed: each priority demo brand now has prototype/directional SMD weights.
- Use weights to prioritize questions and treatment inspection, not to claim causality.
- Cheetos and Tostitos weights are Codex-created assumptions.

Do not solve yet:

- Official market/category/quarter contribution model.
- Automated re-weighting.

### 4. Trend And Significance Language

Recommendation: implemented as artifact policy; replace with source-provided significance for pilot.

Reason:

- The QBR needs to say what changed and why leadership should care.
- Trend without significance can easily be over-read.

Minimum POC solution:

- QBR must show period count, source period compatibility, and significance state.
- If significance is not source-provided, language must say directional.
- Red momentum remains visible even when significance is missing.

Do not solve yet:

- Full tracker significance ingestion across all brands.

### 5. QBR Artifact View Model

Recommendation: initial reusable model implemented.

Reason:

- QBR should not become hard-coded executive copy inside React.
- The product needs a reusable object that Jarvis, Assistant, Work Detail, and future Brief Builder can all consume.

Minimum POC solution:

- Completed: `src/lib/intelligence/qbr-executive-artifact.ts` builds a QBR model from `BrandIntelligencePacket` plus `BrandWorkItem`.
- The model includes executive verdict, takeaways, proof cards, peer basis, trend read, Room to Grow, treatment recommendation, guardrails, output QA, approved views, and review gates.
- Keep rendering in React, but keep product logic in services/config/data.

### 6. Artifact-Level Quality Readiness

Recommendation: implemented for Executive QBR, Treatment Read, and Evidence Read; finish Assumption/Readiness Read next.

Reason:

- Packet-level checks exist, but the executive output needs to visibly prove it is good work, not just governed work.

Minimum POC solution:

- Show a compact QBR readiness section with pass/watch/gap states:
  - leads with the point
  - interprets instead of narrates
  - grounded in real brand context
  - peer basis visible
  - uncertainty/caveats visible
  - watch-out named
  - treatment boundary clear
  - provocation or next decision included

## Next Build Recommendation

Proceed with the final core artifact-quality pass in `docs/product/QBR_MODULAR_ARTIFACT_AND_GOAL_PLANNER_PLAN.md`, using the prototype assumption foundation while keeping assumption disclosure visible and planning replacement work for pilot.

Recommended order:

1. User-test Executive QBR, Treatment Read, and Evidence Read with the v7 stakeholders.
2. Finish the Assumption/Readiness Read as the fourth core artifact so the POC can clearly show what is real, assumed, missing, and required for pilot.
3. Keep artifacts composed from approved modules rather than component hard-coding or arbitrary generated UI.
4. Keep the assumption catalog and source-readiness state visible enough for Insights trust.
5. Prepare the pilot replacement ask: approved competitive sets, measured Room to Grow, contribution weights, trend significance, official Brand Strategic Context, persistence, review, and export/circulation governance.

## Decision Summary

The v7 requirements are accounted for as product foundation, with POC assumption coverage now filling the gaps needed to demonstrate the flagship QBR, Treatment, and Evidence workflows.

The remaining work is not architectural slot creation. It is the Assumption/Readiness artifact-quality pass, user validation with stakeholders, deeper future artifact flexibility, and eventual pilot replacement of Codex-created assumptions with approved source-owner data.
