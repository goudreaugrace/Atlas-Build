# Brand Report Final IA Spec

## Purpose

This spec defines the recommended final information architecture for the single-brand report page after the addition of Growth Availability, Mental Availability / CEPs, Pattern Radar, learning modules, Live Consult, data views, and action planning.

The page should no longer behave as a full inventory of every capability. It should behave like an executive diagnostic consult:

```text
What is the condition?
What does the bloodwork say?
Why do we believe it?
What explains or complicates it?
Have we seen this pattern elsewhere?
What treatment path should we test?
```

## Current Problem

The current report page has become too long and too flat. It contains many valuable modules, but the sequence makes the logic harder to follow:

- Support-lens modules appear before the core BBE bloodwork.
- Metric-by-metric diagnosis appears too late.
- Growth Availability, CEPs, Momentum, GN, Opportunity Views, Pattern Radar, Evidence Ledger, Root Cause, and Prescription all compete as peer sections.
- Learning is available globally through Start Here / Learn, but not connected at the moment users need help.
- Insights Lead depth and Brand Manager clarity are mixed into the same long scroll instead of being staged.

The product now needs an information architecture reset, not more content.

## Final Recommendation

The main brand page should become a **single-brand decision brief** with six core sections.

```text
1. Executive Decision Brief
2. BBE Bloodwork
3. Diagnosis And Evidence
4. Explanation Lenses
5. Portfolio Pattern Context
6. Treatment Path To Test
```

Everything else should become a subpage, drawer, expandable detail, or contextual learning link.

## The Main Page

### 1. Executive Decision Brief

Job:

Give the executive answer before the method.

Must include:

- Brand name, category, period, role.
- Primary diagnosis.
- One-line "so what."
- Compact evidence basis.
- What is working.
- What needs attention.
- What to do next.
- Headline KPI proof strip.

Keep:

- Current executive summary concept.
- Compact Evidence basis cue with CTA.

Remove from main brief:

- Detailed readiness lists.
- Long method notes.
- Anything that looks like raw data inspection.

Contextual Learn link:

- `/learn/brand-doctor-workflow`
- Label: "How Brand Doctor turns evidence into a diagnosis"

### 2. BBE Bloodwork

Job:

Show the core test results before any support-lens interpretation.

This should move immediately after the executive brief.

Must include:

- Demand Power.
- Perceived Value.
- Meaningful.
- Different.
- Salient.
- Category band.
- Ahead.
- Momentum.
- Short interpretation per metric.
- One "what this means for diagnosis" line.

Recommended structure:

```text
BBE Bloodwork
Outcome signals: Demand Power, Perceived Value
Input signals: Salient, Meaningful, Different
Benchmark triptych: Vs Category, Ahead, Momentum
```

Keep:

- Metric-by-metric diagnosis.

Change:

- Rename "Metric-By-Metric Diagnosis" to "BBE Bloodwork."
- Make it more compact on the main page.
- Use expansion for each metric's deeper evidence.

Move deeper content to:

- Evidence drawer.
- `/brand/[brandId]/data`.
- Learn modules.

Contextual Learn links:

- `/learn/bbe-system-one-picture`
- `/learn/three-benchmarks`
- `/learn/pricing-power-guardrail` on Perceived Value rows.

### 3. Diagnosis And Evidence

Job:

Earn trust in the diagnosis.

Must include:

- Current diagnosis.
- Why it fired.
- Supporting evidence.
- Counter-evidence / complicating evidence.
- What not to conclude.
- Rule & Evidence Trace CTA.

Recommended structure:

```text
Diagnosis And Evidence
Diagnosis read
Why we believe it
What complicates it
What not to conclude
```

Keep:

- Current Diagnosis.
- Evidence Ledger.
- Rule & Evidence Trace.

Change:

- Merge Current Diagnosis and Evidence Ledger into one main section.
- Put the full rule trace in a drawer, not the main flow.

Contextual Learn links:

- `/learn/brand-doctor-workflow`
- `/learn/pricing-power-guardrail` if Perceived Value appears in the evidence.

### 4. Explanation Lenses

Job:

Help the team understand what might explain, complicate, or action the BBE read.

This is where connected systems belong.

Must include compact summaries for:

- Momentum.
- Growth Navigator.
- Mental Availability / CEPs.
- Growth Availability.
- Root Cause pathway.

Recommended structure:

```text
Explanation Lenses
Tabs or expandable panels:
- Momentum
- Root Cause
- Growth Navigator
- Mental Availability / CEPs
- Growth Availability
```

Main page should show:

- One topline per lens.
- Evidence mode.
- One most important gap.
- CTA to expand or open detail.

Move full detail to:

- Expandable panels inside the section, or
- `/brand/[brandId]/lenses` later.

Contextual Learn links:

- Momentum: `/learn/momentum-ambition`
- Growth Navigator: `/learn/growth-navigator-connection`
- CEP / Mental Availability: future module needed.
- Growth Availability: `/learn/connecting-bbe-to-action`
- Root Cause / BBE system: `/learn/bbe-system-one-picture`

Important caveat:

Connected systems are support lenses. They should not appear before the BBE bloodwork.

### 5. Portfolio Pattern Context

Job:

Show the forest without overwhelming the tree.

Pattern Radar should be present, but compact on the main report.

Main page version:

- Active pattern label.
- Top 2 similar brands.
- Top evidence gap.
- Top treatment-memory cue.
- Associative-not-causal caveat.
- CTA: "Open full Pattern Radar."

Insights Lead expanded version:

- Similar brands with reasons.
- Emerging portfolio patterns.
- Evidence gap map.
- Treatment memory.
- Future contradiction queue.
- Future precursor watch.

Move full detail to:

- Expanded Insights Lead section for now.
- Future route: `/brand/[brandId]/patterns`.

Contextual Learn links:

- New needed module: `portfolio-patterns`
- Interim link: `/learn/connecting-bbe-to-action`

Important caveat:

Portfolio analogies are prompts for investigation. They are not causal proof, predictions, cannibalization claims, or portfolio migration evidence.

### 6. Treatment Path To Test

Job:

End with a decision-ready next step.

Must include:

- Top treatment path to consider.
- Why it fits the diagnosis.
- What evidence is required before locking it.
- Owner / dependency summary.
- Follow-up proof signals.
- Caveats.

Keep:

- Treatment ranking logic.
- Treatment Plan Builder.
- Follow-Up Signals.
- Strategic Roadmap.

Change:

- Main page should show only the first recommended treatment path and a short action plan.
- Full treatment builder, full pharmacy, and roadmap details should live in an expanded workspace.

Move full detail to:

- Future route: `/brand/[brandId]/action-plan`.
- Current fallback: expandable section inside Prescription & Action Plan.

Contextual Learn links:

- `/learn/connecting-bbe-to-action`
- `/learn/brand-doctor-workflow`

## Subpage Strategy

The main report should remain the decision spine. Subpages should hold depth.

### Existing Subpages

Use:

- `/brand/[brandId]/conversation`
- `/brand/[brandId]/data`
- `/learn`
- `/learn/[moduleId]`
- `/learn/cases/[caseId]`

### Recommended Future Subpages

Add later:

- `/brand/[brandId]/lenses`
  Full Growth Availability, GN, Mental Availability / CEP, Root Cause, Momentum.

- `/brand/[brandId]/patterns`
  Full Pattern Radar and portfolio graph evidence.

- `/brand/[brandId]/action-plan`
  Full treatment builder, roadmap, and follow-up proof plan.

- `/brand/[brandId]/evidence`
  Evidence ledger, rule trace, source provenance, evidence readiness, source gaps.

The main page can link to these as "Open detail" actions.

## Learning Hub Integration

Learning should be contextual, not a separate detour.

Use a quiet inline pattern:

```text
Confused by this signal? Learn how to read Momentum →
```

or:

```text
Method note: Perceived Value is brand-level equity value perception, not SKU pricing. Learn the guardrail →
```

Do not add long learning explanations into the brand report. The report should stay about the brand. Learn should teach the concept.

### Required Contextual Links

| Report Area | Learn Link |
|---|---|
| Executive Decision Brief | `/learn/brand-doctor-workflow` |
| BBE Bloodwork | `/learn/bbe-system-one-picture` |
| Benchmark chips | `/learn/three-benchmarks` |
| Momentum Monitor | `/learn/momentum-ambition` |
| Perceived Value row | `/learn/pricing-power-guardrail` |
| Growth Navigator lens | `/learn/growth-navigator-connection` |
| Growth Availability / action bridge | `/learn/connecting-bbe-to-action` |
| Diagnosis and evidence | `/learn/brand-doctor-workflow` |
| Pattern Radar | `/learn/connecting-bbe-to-action` until portfolio-patterns module exists |
| Prescription / Action Plan | `/learn/connecting-bbe-to-action` |

### Needed New Learn Modules

Add later:

- `portfolio-patterns`
  How to read cross-brand similarity, evidence gaps, treatment memory, and associative caveats.

- `mental-availability-ceps`
  How to read Mental Availability, Mental Penetration, Network Size, Share of Mind, CEP roles, and what not to conclude.

- `different-vs-distinctive`
  How BBE Different relates to but does not prove distinctive asset strength.

### Sidecar Learning Prompts

When a section is active, the sidecar should offer one learning prompt:

- "Teach me how to read these metrics."
- "Why does Momentum matter?"
- "Explain this Perceived Value guardrail."
- "How should I interpret this portfolio analogy?"
- "What evidence do we need before acting?"

The sidecar should answer from learning modules plus the active brand context.

## Mode Behavior

### Brand Manager Mode

Main page should be short and decision-oriented.

Default visible depth:

- Executive brief.
- Compact BBE Bloodwork.
- Diagnosis and evidence summary.
- Compact explanation lenses.
- Compact portfolio context.
- One treatment path to test.

Hidden by default:

- Rule trace.
- Full evidence tables.
- Full Pattern Radar.
- Full CEP explorer.
- Full GN vitals grid.
- Full treatment pharmacy.

### Insights Lead Mode

Main page can expose more depth, but should still preserve the same story order.

Visible depth:

- Same six-section flow.
- Expanded evidence by default.
- Full Pattern Radar allowed.
- More source/method/provenance cues.
- Clear links to Data, Rule Trace, and source packets.

Do not let Insights Lead mode become a raw append-only dashboard.

## Final Page Outline

Recommended final reading order:

```text
Hero / controls
Brand selector

Report frame
1. Executive Decision Brief
2. BBE Bloodwork
3. Diagnosis And Evidence
4. Explanation Lenses
5. Portfolio Pattern Context
6. Treatment Path To Test

Sidecar
- Ask Brand Doctor
- Active visual context
- One contextual learning prompt
- Evidence citations
```

## What To Remove From Main Scroll

Remove as standalone full sections:

- Growth Availability Read.
- Mental Availability / CEP Explorer.
- Brand Health Panel as a separate section.
- Momentum Monitor as a separate full section.
- Growth Navigator Vitals as a separate full section.
- Opportunity Views as a separate full section.
- Root Cause Explorer as a separate full section.
- Full Pattern Radar in Brand Manager mode.
- Full Prescription workspace on initial page load.

These should become:

- part of BBE Bloodwork,
- part of Explanation Lenses,
- part of Portfolio Pattern Context,
- part of Treatment Path To Test,
- or linked detail routes.

## Pressure Test

### Does the page answer the marketer's first question?

Yes, if the executive brief and BBE Bloodwork appear before support lenses.

Risk if not:

The page feels like an evidence warehouse rather than a diagnosis.

### Does the page protect the BBE spine?

Yes, if BBE Bloodwork is section 2 and support lenses are grouped after diagnosis evidence.

Risk if not:

Growth Availability, CEPs, Pattern Radar, and GN feel like competing frameworks.

### Does the page help an Insights Lead challenge the read?

Yes, if Diagnosis And Evidence includes supporting, complicating, missing evidence, and trace access.

Risk if not:

The product becomes polished but not trusted.

### Does the page create a WOW moment?

Yes, if Portfolio Pattern Context appears after the user understands the single-brand read.

Risk if not:

Pattern Radar feels clever but premature.

### Does the page move to action?

Yes, if the final section is one treatment path to test, with required proof and follow-up signals.

Risk if not:

The user leaves informed but not activated.

### Does Learn help without bloating the report?

Yes, if Learn links are quiet, contextual, and short.

Risk if not:

The report becomes a training course instead of a decision brief.

## Implementation Order

### Step 1: Reorder and rename main sections

- Move Metric-by-Metric Diagnosis to section 2.
- Rename it BBE Bloodwork.
- Move Diagnosis and Evidence directly after BBE Bloodwork.
- Group Momentum, GN, CEP, Growth Availability, and Root Cause into Explanation Lenses.

### Step 2: Compress support lenses

- Convert full support-lens sections into summary cards or tabs.
- Preserve full detail behind expansion or subpage CTAs.

### Step 3: Add contextual Learn links

- Add one quiet Learn link per complex section.
- Add sidecar learning prompts based on active visual.

### Step 4: Compress Pattern Radar for Brand Manager

- Keep full Pattern Radar for Insights Lead.
- Show compact portfolio context for Brand Manager.

### Step 5: Compress Prescription

- Show top treatment path and proof plan on main page.
- Move full treatment builder / roadmap detail behind expansion or route.

## Final Recommendation

The final page should be a **decision brief with depth behind it**, not a long dashboard.

The correct product shape is:

```text
BBE-first diagnosis
Evidence-backed trust
Support-lens explanation
Portfolio-context provocation
Treatment path to test
Just-in-time learning
```

That is the version most likely to WOW the customer because it feels both simpler and smarter. It will make the system feel less like "AI added more sections" and more like "AI helped organize the company's brand-growth judgment."
