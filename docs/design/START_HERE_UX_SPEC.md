# Start Here Education Page — UX Specification

## Product surface type

This is a hybrid **Workflow Surface** and **Report Surface**.

It should feel like a guided onboarding lesson, not a training deck and not a dense wiki.

## Page title

Recommended:

> Start Here: How to Read Brand Equity

Subtitle:

> Before you diagnose a brand or open a work asset, learn how the BBE signal panel works, what Momentum means, how connected systems support the read, and where Brand Command, Jarvis, Report, Data, and Work fit.

## Layout

Use a top-down guided sequence:

1. Hero: “Before the brand read, understand the equity signal panel.”
2. Progress rail: core BBE modules plus source-boundary, workflow, and connected-action modules.
3. Module cards with one key idea, one visual, and one “ask the data” prompt.
4. Quick glossary drawer.
5. Comprehension check.
6. Continue to Brand Command.

## Visual principles

- Use marketer-facing strategy language first; keep medical metaphor references rare and secondary.
- Use large, clear section titles.
- Avoid long paragraphs.
- Use diagrams for relationships:
  - Input KPIs -> Outcome KPIs.
  - Benchmarks: Vs Category / Ahead / Momentum.
  - BBE diagnosis -> connected evidence lenses -> governed outputs and treatment paths to test.
- Use large “What this means” callouts for brand managers.
- Use expandable “For Insights Leads” panels for methodology detail.

## Required components

- `StartHereEducation`
- `EducationModuleCard`
- `BenchmarkTriptych`
- `BbeSystemDiagram`
- `MomentumAmbitionExplainer`
- `PricingPowerGuardrail`
- `ComprehensionCheck`
- `StartHereChatPrompts`

## Interaction model

### Default path

The user scrolls or clicks through modules and then continues to Brand Command, where they can choose Report, Jarvis, Assistant, Data, Work, or Portfolio based on the question.

### Brand Manager mode

Shows:
- plain-English explanation,
- one visual,
- “why this matters” statement,
- example interpretation.

### Insights Lead mode

Adds:
- methodology note,
- benchmark mechanics,
- caveats,
- source-period reminders.

### Dialog prompts

Each module should include contextual prompts, such as:
- Explain this like I am a brand manager.
- What could someone misread here?
- Show an example using Lay’s.
- Show an example using PopCorners.
- What should I not conclude from this metric?

## Required caution language

Use caution labels for:
- Perceived Value misuse.
- Source typology labels as product verdicts.
- Cross-category comparison limitations.
- Momentum versus current strength.
- Diagnosis versus recommendation.
- Connected systems as support for BBE, not a replacement for BBE.
- Review-draft workspaces versus official exported/circulated assets.

## Navigation

The homepage should include a prominent “Start Here” action. If a user goes directly to the diagnostic, show a small reminder banner:

> New to BBE? Start with the 5-minute grounding page so the diagnosis makes sense.

## Acceptance checklist

- The page explains BBE without jargon.
- The page has a clear reading order.
- The page explains the three benchmarks.
- The page explains Momentum ambition.
- The page explains Perceived Value guardrails.
- The page connects BBE to GN, source context, governed work assets, and other supporting evidence lenses without replacing BBE.
- The page explains diagnosis versus treatment/prescription and review-draft workspaces versus official approval.
- The page has a comprehension check.
- The page includes contextual chat prompts.
- The page does not mention AIM OS as the core frame.
