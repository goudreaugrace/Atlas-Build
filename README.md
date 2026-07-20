# ATLAS Predictive Scenario Workspace

ATLAS is a scenario-led negotiation intelligence prototype for PepsiCo CNO planning. It helps users triage negotiation-impact alerts, model possible commercial moves, predict buying group response, inspect source confidence, and capture negotiation learning back into buyer memory.

The product is centered on one loop:

```text
Alert or scenario risk
-> Model impact in Scenario Lab
-> Predict buying group response
-> Personalize using buying group intelligence
-> Decide negotiation priority
-> Prepare pushback and evidence
-> Optional scenario brief
-> Capture debrief
-> Update buying group memory
-> Improve future recommendations
```

## Product Scope

The MVP has four primary areas:

- **Triage**: command-center view of alerts that may change negotiation plans.
- **Scenario Lab**: the core modeling workspace for ATLAS-generated, manually adjusted, and buyer-counter scenarios.
- **Buying Groups**: customer-specific intelligence, current negotiation context, relevant scenarios, and timeline memory.
- **Intelligence Library**: source, trust, evidence, and memory records used by ATLAS recommendations.

Standalone Outputs are intentionally out of scope. Useful output behavior is represented as lightweight scenario brief/report actions inside Scenario Lab.

## Core User Need

The primary user is a CNO preparing for retailer negotiations. ATLAS should answer:

- What changed that I need to pay attention to?
- Which buying group or negotiation is affected?
- What scenarios has ATLAS already modeled?
- What is likely to happen if we make this move?
- What evidence supports the recommendation?
- What should I bring into the room or save back to memory?

## Current Prototype State

- Next.js App Router + TypeScript.
- Local JSON-first demo data for ATLAS markets, buying groups, alerts, sources, and scenarios.
- Scenario Lab supports:
  - AI-generated scenario recommendations.
  - Scenario review by priority.
  - Scenario detail side panel and full scenario view.
  - Scenario comparison route.
  - Editable scenario assumptions.
  - Optional SKU/custom-lever modeling as advanced MVP behavior.
- Triage is alert-first, with alerts framed around trigger, business impact, how ATLAS reacted, and scenarios/tasks created from the alert.
- Buying Groups use five MVP customers across the app and expose profile, current negotiation, strategy/scenario context, and timeline memory.
- Intelligence Library stores source and trust records with source type, confidence, freshness, and validation posture.
- The UI is moving toward a clean, calm, Google-inspired product style: structured cards, readable hierarchy, light fills, clear blue actions, and progressive disclosure.

## Primary Routes

```text
/                                  Triage command center
/scenario-lab                      Scenario Lab
/scenario-lab?scenario=<id>        Full scenario detail
/scenario-lab/compare              Scenario comparison
/buying-groups                     Buying group list
/buying-groups/[buyingGroupId]     Buying group workspace
/intelligence                      Intelligence Library
/generated-views                   Lightweight generated scenario/evidence views
/how-it-works                      Product loop and scope explanation
```

The old brand-equity routes may still exist in the repository during migration, but they are not part of the ATLAS MVP navigation or product scope.

## Demo Data Notes

ATLAS currently uses synthetic and prototype-local records. Synthetic data is acceptable for the MVP only when source type, confidence, freshness, and validation role are visible.

Current data includes:

- European market and buying group examples.
- Negotiation-impact alerts.
- ATLAS-generated scenario options.
- Buyer behavior patterns and historical memory.
- Finance/NRM guardrail-style source records.
- External signal-style records for market/news pressure.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
pnpm typecheck
pnpm validate:data
pnpm build
```

For CI-style local validation:

```bash
CI=true pnpm typecheck
CI=true pnpm validate:data
CI=true pnpm build
```

## Repository Map

```text
app/atlas-intelligence-hub.tsx      Main ATLAS prototype shell and views
app/page.tsx                        Triage route
app/scenario-lab/                   Scenario Lab and comparison routes
app/buying-groups/                  Buying group routes
app/intelligence/                   Intelligence Library route
app/generated-views/                Scenario/evidence output views
src/data/demo/                      Demo ATLAS data and legacy demo data
src/lib/atlas-intelligence/         ATLAS intelligence packet/kernel
src/lib/atlas/                      ATLAS assistant, demo, scenario, and report helpers
scripts/validate-data.mjs           Data validation
```

## Current Git Note

Local `main` contains the ATLAS reimagine work. If GitHub authentication is configured, publish it with:

```bash
git push origin main
```
