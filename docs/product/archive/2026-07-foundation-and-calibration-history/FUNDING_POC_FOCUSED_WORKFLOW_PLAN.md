# Funding POC Focused Workflow Plan

## Target Audience

The funding POC is designed for a CMO, Insights leadership, operators, and senior brand leaders. The experience should prove that BBE Brand Doctor is not a generic chatbot or a static dashboard. It is a governed brand-growth workbench that turns PepsiCo brand data, BBE/Growth Navigator evidence, and PepsiCo interpretation rules into credible executive work.

## Demo Brand Set

Use the data currently loaded for:

- Lay's
- Cheetos
- Siete
- Tostitos

These brands should run through the same governed workflows, but the outputs should feel tailored by each brand's equity posture, category context, diagnosis, evidence gaps, treatment options, and available source data.

## Focused Product Promise

Ask Jarvis about a brand. It can produce a governed executive read, show the exact data and evidence behind the read, recommend treatment paths and areas to inspect more closely, and turn the work into a review-ready brief.

That is the POC scope. Other registered capabilities can remain available as supporting rails, but they should not drive the funding demo narrative.

## Final POC Workflows

### 1. Executive Brand Read

Purpose: answer what is happening with the brand, why leadership should care, what proof exists, what should not be overclaimed, and which decision needs human judgment next.

Reuse:

- `bbe_momentum_intelligence_read`
- `draft_meeting_story`
- `executive-qbr-decision-read`
- `momentum_ladder`
- `momentum_room_to_grow_grid`
- `smd_driver_map`
- `qbr_story_draft`
- `evidence_ledger`
- `evidence_spotlight_panel`
- `data_gap_panel`

Design requirements:

- Lead with the point, not the data dump.
- Use Momentum as the headline verdict.
- Order SMD as Salient, Meaningful, Different.
- Use Perceived Value as the user-facing label while preserving Pricing Power as source lineage.
- Show room-to-grow only when source-backed; otherwise show the gap.
- Keep CMO takeaways crisp and caveated.
- Keep governance/source metadata behind disclosure in the polished artifact.

### 2. Data And Evidence Inspector

Purpose: answer "show me the actual data you are working with" in a granular, governed way.

Reuse:

- `explain_diagnosis_evidence`
- `insights-evidence-lab`
- `source-readiness-lab`
- `data_basis_inspector`
- `diagnosis_trace_summary`
- `evidence_ledger`
- `source_readiness_panel`
- `data_gap_panel`

Design requirements:

- Show loaded BBE metrics, source files, source period, peer basis, room-to-grow inputs, Growth Navigator evidence mode, and Brand Strategic Context status.
- Separate source metric names from user-facing labels.
- Distinguish measured, reviewed-local, prototype, synthetic, and missing inputs.
- Make gaps useful by naming the best next source owner/source type.
- Do not let "proof" become a wall of audit text; give the business answer first, then let Insights drill down.

### 3. Treatment Recommendation

Purpose: convert diagnosis into practical treatment recommendations and areas to look closer at, not final prescriptions or task-level action plans.

Reuse:

- `create_growth_provocations`
- `marketer-treatment-planning`
- `growth_provocation_list`
- `treatment_path_card`
- `evidence_ledger`
- `data_basis_inspector`
- `data_gap_panel`

Design requirements:

- Start from the diagnosis and the active evidence, not from generic tactics.
- Tag urgency and horizon.
- Name contraindications, missing proof, and the specific areas the team should inspect before committing.
- Include follow-up signals so the path can be tested later, without turning the POC output into owner-by-owner project planning.
- Keep standard marketing logic visible where useful: proposition clarity, relevance refresh, distinctive assets, mental availability, occasion memory structures, physical availability, price-value vulnerability, and long/short brand-building balance.
- Avoid causality, SKU pricing, cannibalization, portfolio migration, or occasion-substitution claims unless measured evidence exists.

### 4. Brief / Story Builder

Purpose: turn the read into a review-ready CMO takeaway, QBR talk track, or agency/partner brief draft.

Reuse:

- `draft_meeting_story`
- `agency-brief-builder`
- `qbr_story_draft`
- `growth_provocation_list`
- `data_basis_inspector`
- `evidence_ledger`
- `evidence_spotlight_panel`
- `data_gap_panel`

Design requirements:

- Make the output feel like marketer-ready work, not system narration.
- Translate source prompts into loaded-packet/review-draft language.
- Keep export, copy, and circulation gated.
- Carry the proof and caveats into the artifact without overwhelming the reader.
- Support three first modes only: CMO takeaway, QBR talk track, agency brief.

## Supporting Governance Layer

Do not position the following as headline product skills for the POC. Keep them as internal or secondary support:

- `review_session_state`
- `inspect_artifact_readiness`
- `inspect_runtime_governance`
- `inspect_foundation_readiness`
- `inspect_source_promotion_readiness`
- `inspect_persistence_readiness`
- `plan_executive_pilot`
- `facilitate_live_meeting`
- `teach_brand_growth_concept`
- `compare_brands_or_competitors`

They are valuable, but the funding demo should not feel like a catalog of features. They should prove governance, readiness, review gates, and future extensibility only when needed.

## Current Data Gaps To Surface

Use current data first, but make these gaps visible:

- Fully approved Brand Strategic Context sources for every demo brand.
- Measured Growth Navigator source status where current records are synthetic or partial.
- Source-backed room-to-grow inputs: penetration headroom, Demand Power/share gap, and category growth.
- Approved peer-set basis and peer count wherever Ahead/Behind or comparison context appears.
- Market/category/quarter-specific SMD contribution weights.
- Complete multi-quarter trend reads and significance caveats.
- Artifact lifecycle beyond review-required draft: reviewed, published, versioned, circulated.

## Funding Demo Story

The sharpest demo sequence:

1. Open Lay's and ask for the executive read.
2. Ask Jarvis to show the actual data behind the read.
3. Move to Cheetos or Siete and ask for a treatment recommendation and areas to look closer.
4. Move to Tostitos and turn the read into a governed brief draft.
5. Close by showing that the same four workflows adapt across brands while evidence, gaps, review gates, and PepsiCo guardrails stay consistent.

## POC Cut Line

Build these four workflows to feel outstanding. Defer task-level action planning, detailed ownership/sequencing, deeper meeting capture, learning paths, broad comparison labs, production export, autonomous memory, canonical source writes, and full voice until the pilot funding story is secured.
