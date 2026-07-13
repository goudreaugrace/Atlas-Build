# UI / UX Specification

## Design thesis

The app should feel like an executive-grade diagnostic room: simple enough for a brand manager, deep enough for an insights lead, and trustworthy enough to make the diagnosis believable.

## Product feel

- Bold but clear.
- Report-first, not dashboard-first.
- Data-rich but not overwhelming.
- Interactive graphics with plain-English explanations.
- Chat as a sidecar to visuals, not the main surface.
- Progressive disclosure: simple first, deep when requested.

## Primary screens

The single-brand report should follow the final report IA in `docs/design/BRAND_REPORT_FINAL_IA_SPEC.md`. The core principle is BBE-first diagnosis, evidence-backed trust, support-lens explanation, portfolio-context provocation, treatment path to test, and just-in-time learning.

### 1. Find My Brand

A search-first landing page with brand cards and category filters.

Must show:
- brand
- category
- typology
- primary diagnosis
- latest period

### 2. Brand Health Panel

A large framed report surface.

Must include:
- diagnosis hero
- Demand Power
- Perceived Value
- Meaningful
- Different
- Salient
- BrandZ typology
- benchmark chips
- trend sparks

The executive summary at the top of the report should read like a one-page decision brief: diagnosis, so what, compact evidence basis, what is working, what to do next, and headline KPI proof. Evidence Readiness should appear here as a short trust cue with a clear CTA into the Evidence Ledger; detailed available/missing inputs belong in evidence drawers, Insights Lead views, data views, or rule trace.

### 3. Diagnosis Explanation

Doctor explains the bloodwork.

Must include:
- diagnosis
- what it means
- why it matters
- why we believe it
- what complicates it
- what not to conclude

### 4. Root Cause Explorer

Interactive visual explanation of the brand equity system.

Must include:
- DP path: Meaningful + Salient
- PP path: Meaningful + Different
- key binding constraint
- GN bridge if available

### 5. Treatment Pharmacy

Filtered treatment options.

Must include:
- foundation treatments
- acceleration treatments
- specialist referrals
- tradeoff grid

### 6. Dialog With Data

Right-side sidecar.

Must include:
- active brand context
- active visual context
- suggested questions
- response with evidence links or missing-data caveat

### 7. Follow-Up Signals

A treatment follow-up plan.

Must include:
- next-quarter watch signals
- 6–12 month signals
- what would prove/falsify treatment

### 8. Pattern Radar

An Insights Lead portfolio-intelligence brief powered by the JSON-first Brand Equity Knowledge Graph.

Must include:
- active symptom fingerprint
- brands that look like this
- emerging portfolio patterns
- evidence gap map
- treatment memory
- explicit "similarity is associative, not causal" caveat

Pattern Radar should be report-first, not a node-link graph. See `docs/design/PATTERN_RADAR_UX_SPEC.md`.

## Two modes

Audience mode is a depth and decision-support control, not a separate product, AI personality, or different diagnostic engine. Both modes must use the same Brand Health Record, deterministic diagnosis, evidence ledger, treatment library, guardrails, and category lens. The difference is how much method, provenance, and caveat detail is visible by default.

### Brand Manager Mode

Use this mode for marketers who need to quickly understand the brand read and decide where to focus the team.

- Plain-English diagnosis and implication first.
- One primary diagnosis with supporting context, not a rule-audit experience.
- Treatment paths framed as options to consider or test.
- Follow-up signals expressed as practical watchouts.
- Minimal raw methodology, surfaced only when it builds confidence.
- Caveats translated into "what not to conclude" and "what to check next."

Brand Manager mode should answer: "What is happening, why should I care, what can we test next, and what should I not overclaim?"

### Insights Lead Mode

Use this mode for evidence owners and insight partners who need to inspect whether the read is trustworthy enough to socialize, challenge, or act on.

- Evidence drawer and full evidence ledger access.
- Rules fired, rule summaries, and deterministic logic trace.
- Benchmark definitions, category lens, source periods, and provenance.
- Explicit caveats, missing evidence, and confidence/readiness states.
- Data exports or source-packet views where available.
- Method language can use BBE/GN terms directly, but should still be readable.

Insights Lead mode should answer: "What exactly supports this read, what rules fired, what evidence is missing, what are the limits, and what would change the conclusion?"

### Shared Audience Principles

- Same facts, different depth.
- Same diagnosis, different explanation level.
- Same treatment library, different risk/proof detail.
- Same guardrails, different caveat precision.
- Never hide contradictory evidence from Insights Lead mode.
- Never make Brand Manager mode feel shallow, vague, or unsupported.
- Do not use audience mode to change the AI persona; persona controls tone and reasoning posture, while audience mode controls product depth.

## Visual rules

- Every score needs basis and guidance.
- Every diagnosis needs evidence.
- Every treatment needs pros/cons and follow-up signals.
- Every portfolio analogy needs reasons, key differences, and caveats.
- Avoid stacked card soup.
- Keep the primary reading path top-down.
- Use the right chart for the data: trend lines for time, matrices for typology, driver trees for root cause, pathway maps for treatments.
