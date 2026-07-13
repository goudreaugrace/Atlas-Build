# PepsiCo Internal Tool UI Foundation

Status: Copyable design foundation for new internal PepsiCo tools.
Source: Extracted from the AIM V1 UI standard, report-pattern work, module-harness work, and pre-run intelligence review work.

## Purpose

Use this document as the starting UI specification for a new internal PepsiCo solution.

It defines:
- product feel
- design principles
- visual tokens
- typography
- layout rules
- component patterns
- page archetypes
- report and decision-package rules
- loading, empty, error, and partial states
- accessibility and interaction rules
- implementation starter guidance
- acceptance checklist

The goal is consistency from step one, not a redesign after the product already has mismatched screens.

## Product Feel

The solution should feel:
- PepsiCo-branded
- trustworthy
- warm and human
- premium but not flashy
- editorial where users need to understand
- operational where users need to act
- dense only when density creates value
- specific to the work, not a generic AI dashboard

The solution should not feel:
- like a generic SaaS admin template
- like a public marketing site
- like a chatbot wrapper
- like a finance dashboard unless the job is explicitly financial control
- like stacked card soup
- like every paragraph was chunked into its own box
- like an AI product with decorative glows and novelty widgets

## Core Principle

Design around comprehension before decoration.

Every screen should answer:
- What is this about?
- What matters most?
- What can I trust?
- What should I do next?
- What evidence, method, data, or context supports this?

If the user has to infer the reading order from layout, the layout is failing.

## Surface Types

Every page should be classified before design begins.

### Report Surface

Use a report surface when the user needs to understand one coherent body of work.

Examples:
- research report
- recommendation memo
- strategy brief
- decision package
- concept detail
- validation readout
- audit report
- issue diagnosis
- executive brief

Report surfaces should use:
- one primary reading column
- top-down hierarchy
- strong title and summary
- larger sections
- restrained supporting exhibits
- visible evidence and limitations
- clear distinction between evidence, inference, and recommendation
- framed report content so nothing important floats on the page background

Do not split one argument across multiple competing columns.

### Aggregation Surface

Use an aggregation surface when the user needs to compare, triage, navigate, monitor, or manage many objects.

Examples:
- workspace home
- library
- tracker
- review queue
- approvals queue
- search results
- portfolio overview
- registry
- object table

Aggregation surfaces may use:
- tables
- cards
- filters
- columns
- dashboard summaries
- right rails
- grouped lists
- status chips

Aggregation pages should still preserve provenance, confidence, evidence basis, and next action.

### Workflow Surface

Use a workflow surface when the user is moving through a guided process.

Examples:
- wizard
- intake
- approval flow
- configuration flow
- testing harness
- sandbox
- phase gate

Workflow surfaces should show:
- current step
- what has been decided
- what still needs review
- why the system recommends the next action
- what happens after the user continues
- save or draft continuity

### Intelligence Check Surface

Use an intelligence check surface when the product should prevent duplicate work and reveal what the organization already knows.

This pattern is especially useful before launching new research, analysis, generation, testing, approval, or spend-heavy workflows.

Default hierarchy:
1. Recommended path: reuse, refresh, extend, or run new
2. Similar existing intelligence
3. What this new work adds
4. Connected reports, objects, sources, teams, and tools
5. Cost, effort, and approval transparency

Lead with organizational intelligence, not cost control.

## Non-Negotiable UI Rules

- Light mode only unless the product has a separate, explicit dark-mode requirement.
- Use a warm off-white page background.
- Use navy for authority surfaces: app shell, hero, table headers, report covers, and major decision frames.
- Use orange sparingly for primary action, caution, urgency, and attention.
- Use blue for interaction, selected states, supported confidence, and links.
- Use green for success, recommendation, completion, and validated states.
- Use purple for innovation, AI, concepts, or technology only when it communicates meaning.
- Use skeletons, not spinners, for serious loading states.
- Cards use borders first and shadow only on hover or clear elevation.
- Do not place essential content directly on the background when a report is framed as the reading object.
- Do not use cards inside cards unless the nested card is truly a separate object.
- Do not overuse columns for content that has a sequential reading order.
- Do not show scores without confidence, basis, and guidance.
- Do not show cost without explaining what decision it supports.
- Do not hide reused or inherited intelligence.
- Do not ship default browser-looking forms.

## Recommended Frontend Stack

Use this stack unless the project has a strong reason not to:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Motion
- TanStack Table
- React Hook Form
- Zod
- Lucide icons
- sonner for restrained toast feedback
- cmdk-style command surface for search

Avoid using MUI, Ant Design, Bootstrap admin templates, or generic AI dashboard starters as the primary UI foundation.

## Design Tokens

Use these CSS variables as the first design token layer.

```css
:root {
  --pepsi-navy: #02355a;
  --pepsi-navy-deep: #011423;
  --pepsi-navy-light: #0a4a7a;

  --pepsi-blue: #005eb8;
  --pepsi-blue-secondary: #3680ce;
  --pepsi-blue-light: #a6cbf0;
  --pepsi-blue-tint: #d5e6f6;

  --pepsi-green: #6ba43a;
  --pepsi-green-light: #eef5e3;

  --pepsi-purple: #7b3f98;
  --pepsi-purple-light: #f3ebf8;

  --pepsi-orange: #f7941d;
  --pepsi-orange-hover: #e08519;
  --pepsi-orange-light: #fdf0e6;

  --pepsi-page-bg: #f7f5f3;
  --pepsi-card-bg: #ffffff;
  --pepsi-border: #e2e2e2;
  --pepsi-border-dark: rgba(255, 255, 255, 0.1);

  --pepsi-danger: #b80000;
  --pepsi-danger-light: #fdf0f0;

  --pepsi-text: #1a1a1a;
  --pepsi-text-muted: #666666;
  --pepsi-text-light: #888888;
  --pepsi-text-on-dark: #ffffff;
  --pepsi-text-on-dark-muted: #a6cbf0;
}
```

If you copy AIM components directly, you may keep the `--aim-*` variable names. For a new project, prefer `--pepsi-*` or a product-specific prefix that maps to these same values.

## Base CSS

```css
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background: var(--pepsi-page-bg);
  color: var(--pepsi-text);
  font-family: var(--font-body), sans-serif;
}

a {
  text-decoration: none;
}

a:not([class]) {
  color: inherit;
}

button,
input,
select,
textarea {
  font: inherit;
}

.font-display {
  font-family: var(--font-display), sans-serif;
}

.font-mono-ui {
  font-family: var(--font-mono), monospace;
}

.pepsi-hero-gradient {
  background-image: linear-gradient(135deg, var(--pepsi-navy), var(--pepsi-navy-light));
}

.pepsi-skeleton {
  background: linear-gradient(90deg, #ede9e5, #f5f2ee, #ede9e5);
  background-size: 200% 100%;
  animation: pepsi-shimmer 1.5s ease-in-out infinite;
}

@keyframes pepsi-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
```

## Typography

Use:
- Display: Barlow Condensed 900
- Body: DM Sans 400, 500, 600, 700
- Mono: JetBrains Mono 500, 600

Google Fonts:

```text
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@500;600&display=swap
```

Typography rules:
- Page hero title: Barlow Condensed, 40 to 56px, 900, uppercase.
- Major section title: Barlow Condensed, 24 to 36px, 900, uppercase.
- Card heading: DM Sans or Barlow Condensed depending on emphasis, 14 to 18px, 700 to 900.
- Body text: DM Sans, 14 to 17px, 400 to 500, line-height 1.6 to 1.8.
- Dense metadata: DM Sans, 11 to 12px, 600, uppercase letter spacing.
- Technical labels and object IDs: JetBrains Mono, 11px, 600.
- Do not use all-caps for ordinary body text.
- Do not make every heading display type. Save display type for hierarchy anchors.

## Layout System

Baseline:
- desktop-first internal tool
- design reference width: 1440px
- app sidebar: 216px
- sticky top bar: 48px
- default page padding: 32px
- default section gap: 24px
- default card gap: 16px
- standard card padding: 24px
- hero padding: 40 to 44px
- card radius: 10px
- hero, modal, and large framed surface radius: 12px

Breakpoints:
- `xl`: 1440px and up, full layout
- `lg`: 1200px and up, same structure with reduced gutters
- `md`: 1024px and up, rails can collapse below
- `sm`: 768px and up, read-oriented fallback

Prototype rule:
For internal desktop prototypes, optimize for laptop and desktop first. Do not over-optimize mobile if the product is used on work laptops, but do not allow destructive horizontal overflow on normal desktop widths.

## Visual Hierarchy Rules

Use this hierarchy for most pages:
1. App shell context
2. Page title and short purpose statement
3. Primary decision or primary object
4. Supporting summary metrics
5. Main work surface
6. Secondary details, evidence, related objects, and next actions

If the page has a report:
1. Report cover/header
2. Research answer or recommendation
3. Findings
4. Connections and implications
5. Evidence, method, and limitations
6. What this enables
7. What needs more work
8. Reusable knowledge records or handoff objects

## App Shell

Use a left sidebar plus top bar for dense internal products.

Sidebar:
- 216px wide
- navy-deep background
- product wordmark at top
- navigation labels with Lucide icons
- active nav uses white or subtle white background
- hover state uses rgba white tint

Top bar:
- 48px high
- sticky
- warm translucent background
- page context left
- search or command trigger right
- one optional contextual action

Avoid top-heavy global navigation for internal tools with deep workflows.

## Component Primitives

Build a small project-specific layer on top of shadcn primitives.

Create these first:
- `AppShell`
- `PageHeader`
- `SectionLabel`
- `SurfaceCard`
- `StatusBadge`
- `ConfidenceBadge`
- `ObjectBadge`
- `ScorePill`
- `PrimaryAction`
- `SecondaryAction`
- `FilterChip`
- `KpiCard`
- `EmptyState`
- `SkeletonBlock`
- `PeekSheet`
- `DetailDrawer`
- `CommandSearch`
- `DataTable`
- `ReportFrame`

Do not scatter raw Tailwind class strings across pages if a shared primitive can own the pattern.

## Core Component Recipes

### Section Label

Purpose:
Anchor every section and make dense pages skimmable.

Style:
- DM Sans
- 10px
- 600
- uppercase
- letter spacing 0.18 to 0.22em
- color `--pepsi-blue-secondary`

### Surface Card

Purpose:
Contain a distinct object, section, or action group.

Style:
- background white
- border `--pepsi-border`
- radius 10px
- padding 24px
- no default shadow
- optional hover lift: translateY(-2px), shadow `0 8px 24px rgba(2,53,90,0.10)`

Use cards for separate objects.
Do not use cards for every paragraph.

### Primary Action

Use orange for the main action when there is one clear forward move.
Use blue for governed or utility-primary actions when orange would imply urgency.

```ts
type ActionSize = "xs" | "sm" | "md" | "lg" | "xl";

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--pepsi-blue)_26%,white)] focus-visible:ring-offset-2";

const primaryAction =
  "inline-flex items-center gap-2 rounded-full border border-transparent bg-[var(--pepsi-orange)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(235,91,37,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--pepsi-orange-hover)] disabled:cursor-not-allowed disabled:opacity-60";
```

### Secondary Action

Secondary actions should not be plain white chips.

```ts
const secondaryAction =
  "inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--pepsi-blue)_24%,white)] bg-[var(--pepsi-blue-tint)] px-4 py-2 text-sm font-semibold text-[var(--pepsi-blue)] transition hover:border-[var(--pepsi-blue)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60";
```

### Status Badge

Semantic mapping:
- neutral: zinc or warm neutral
- active: blue tint, blue text
- warning: orange light, orange text
- success: green light, green text
- danger: danger light, danger text
- accent: purple light, purple text

### Confidence Badge

Use for evidence confidence.

Tiers:
- Directional: orange on orange-light
- Supported: blue on blue-tint
- Validated: green on green-light
- Confirmed: dark green on green-light

Never show confidence without evidence basis when it affects a decision.

### Data Table

Rules:
- navy header row
- white header labels
- 11px uppercase labels
- row height 56px minimum, 72px for important rows
- row hover uses blue tint
- row actions reveal on hover and focus
- keyboard navigation required
- use TanStack Table for sorting, filtering, and custom display

### KPI Strip

Use for a small set of decision-support metrics.

Rules:
- 3 to 5 metrics only
- large Barlow numeric values
- short labels
- one-line explanation
- do not overload with charts

### Hero Frame

Use navy gradient for major decision or report openers.

Rules:
- use sparingly
- strong title
- concise explanation
- action or status cluster
- readable contrast
- no decorative clutter

## Report Standard

Reports are the highest-value surfaces in the standard.

Default report structure:
1. Answer or recommendation
2. What was found
3. What was connected
4. What was used
5. How the work was done
6. What this enables
7. What needs more work
8. Reusable records, sources, or handoff

Report design rules:
- Use a framed report object.
- Keep the primary argument top-down.
- Use one main reading column.
- Use rails only for outline, sources, or metadata.
- Embed exhibits only where they improve understanding.
- Use cards, tables, and matrices only for distinct objects.
- Clearly label evidence, inference, recommendation, limitation, and open question.
- Put sources and methods close enough to inspect, but do not let them dominate the reading flow.

## Decision Package Standard

Every decision package should show:
- recommendation
- confidence
- evidence basis
- decision guidance
- key risks
- what changed
- what to do next
- what would change the recommendation
- sources, method, and limitations

Decision packages should read like a well-authored internal memo, not like disconnected dashboard cards.

## Intelligence Review Pattern

Use before starting duplicate-prone or cost-bearing work.

Default page hierarchy:
1. Recommended path
2. Similar existing work
3. What new work adds
4. Connected objects
5. Cost, effort, and approval transparency
6. Operator choice and override path

Recommended path options:
- Reuse existing work
- Refresh prior work
- Extend prior work
- Run new work

Rules:
- Do not call this FinOps in the UI unless the product is specifically a finance operations tool.
- Cost transparency supports the decision, but existing intelligence is the hero.
- Always show provenance, freshness, confidence, and relevance.
- Always show what is inherited versus what is net-new.
- Let the operator start fresh, but capture the reason.

## Wizard Standard

Wizard steps should feel like a guided expert process, not a form marathon.

Recommended structure:
1. Seed input or objective
2. Working brief or structured understanding
3. Plan or configuration
4. Intelligence review or duplication check when relevant
5. Final review and launch

Rules:
- Preserve state when users step back.
- Use inline validation.
- Show why the system recommends each major choice.
- Show estimated time and cost before launch when meaningful.
- Use a sticky bottom action bar for long wizard steps.
- Show the final review as a clean summary, not another configuration page.

## Library and Search Standard

Search should feel like an intelligence library, not a generic keyword page.

Results should show:
- object type
- title
- status
- relevance
- confidence
- freshness
- source basis
- related objects
- primary action

Over time, the library should connect:
- topics
- teams
- brands
- reports
- decisions
- concepts or recommendations
- source clusters
- workflows
- modules or tools

## Loading, Empty, Partial, and Error States

### Loading

Use skeletons that preserve page shape.

Do:
- skeleton title
- skeleton rows
- skeleton cards
- skeleton rails

Do not:
- use a centered spinner as the main state
- collapse layout while loading

### Empty

Empty states should explain:
- what the surface is for
- why there is no data
- one strong next action

### Partial

Use when some data is present but not all.

Rules:
- show what loaded
- mark what is still computing
- do not block the whole screen because one section is late

### Error

Use:
- plain-language headline
- brief explanation
- one main recovery action
- optional technical details for power users

## Motion

Rules:
- state transitions: 120 to 180ms
- layout transitions: 180 to 280ms
- hover lift: 150ms
- row hover: 80ms
- modal or sheet open: 200 to 250ms
- skeleton shimmer: 1500ms loop
- respect reduced motion

Motion should improve continuity. It should not delay understanding.

## Copy Style

Voice:
- calm
- precise
- direct
- helpful
- not hype-driven

Use:
- "Review prior intelligence"
- "Extend prior work"
- "Evidence basis"
- "Recommended next move"
- "Needs more research"
- "No approval flag"
- "Approval required"

Avoid:
- "Magic"
- "AI-powered" as a generic label
- "Revolutionary"
- "FinOps" unless finance operations is the actual product domain
- technical jargon when plain language works

## Accessibility

Minimum requirements:
- keyboard-reachable core flows
- visible focus states
- semantic headings
- form labels
- no color-only status encoding
- accessible table semantics
- proper button and link usage
- reduced-motion support
- readable contrast on navy surfaces
- hit targets that feel comfortable on laptop

## Implementation Starter

### First Files To Create

```text
app/globals.css
components/app-shell.tsx
components/page-header.tsx
components/section-label.tsx
components/surface-card.tsx
components/badges.tsx
components/actions.ts
components/empty-state.tsx
components/skeleton-block.tsx
components/data-table.tsx
components/report-frame.tsx
lib/cn.ts
lib/design-tokens.ts
```

### First Screens To Build

Build in this order:
1. App shell and navigation
2. Workspace or home
3. Guided intake or wizard
4. Review or approval surface
5. Report or decision package surface
6. Library or search surface
7. Detail pages
8. Admin, sandbox, or configuration pages

### First Quality Gates

Before expanding features, verify:
- typography is installed
- CSS variables are in place
- app shell is stable
- primary and secondary actions are consistent
- cards use border-first styling
- skeletons exist
- report surface has a top-down hierarchy
- aggregation page is readable
- keyboard focus is visible

## Agent Instructions For New Project

Copy this into the new project agent instructions if AI coding agents will build UI.

```text
Use the PepsiCo Internal Tool UI Foundation as the design source of truth.

Build a desktop-first internal web app with warm off-white canvas, navy authority surfaces, DM Sans body, Barlow Condensed display titles, JetBrains Mono technical labels, restrained motion, skeleton loading states, and report-first hierarchy.

Classify every page before implementation as report, aggregation, workflow, intelligence review, library, or detail. Report pages must be top-down and document-like. Aggregation pages may use cards, filters, columns, and tables when the user is comparing or navigating multiple objects. Do not create card soup. Do not split one coherent argument across competing columns. Do not place essential report content on the page background.

Use shared primitives for shell, page header, section label, surface card, badges, actions, tables, skeletons, empty states, and report frames. Do not scatter one-off visual styles across pages.

Use orange only for primary action or caution. Use blue for interaction and active states. Use green for success and recommendation. Use navy for authority surfaces. Avoid generic AI chrome.

After every material UI change, run lint, typecheck, build, and a relevant UI smoke path.
```

## Acceptance Checklist

Use this before calling a screen done.

### Page Purpose

- The page has one clear job.
- The surface type is obvious.
- The main object or decision is visible above the fold.
- The next action is clear.

### Hierarchy

- Reading order is obvious.
- Headings are meaningful.
- Labels help scan the page.
- The most important content is not buried in equal-weight cards.

### Visual Standard

- Warm off-white background is used.
- Navy is used for authority, not decoration everywhere.
- Orange is reserved for primary action or attention.
- Secondary actions use blue-tinted treatment.
- Cards use 10px radius and border-first styling.
- There is no generic AI glow or decorative clutter.

### Trust

- Confidence and evidence basis are visible when decisions are made.
- Evidence, inference, and recommendation are visually distinct.
- Sources, method, limitations, or provenance are inspectable.
- Reused or inherited intelligence is not hidden.

### Interaction

- Loading uses skeletons.
- Empty state has one clear next action.
- Error state has recovery.
- Focus states are visible.
- Keyboard path works for core actions.
- Motion is restrained.

### Consistency

- Shared primitives are used.
- Button styles are consistent.
- Badge semantics are consistent.
- Tables use navy headers.
- Forms do not look like unstyled browser defaults.

## Common Anti-Patterns And Fixes

| Anti-pattern | Fix |
|---|---|
| Everything is a card | Use a report frame and only card distinct objects |
| Weird columns | Return to top-down hierarchy |
| White chips with poor contrast | Use blue-tinted secondary action treatment |
| Cost dominates the page | Lead with decision value, then show cost transparency |
| Report title floats on background | Put title inside the framed report object |
| Generic AI dashboard | Use PepsiCo palette, evidence, workflow, and decision language |
| Dense table is hard to scan | Use navy header, row height, hover tint, and progressive actions |
| Wizard feels like a form | Add brief, rationale, review summary, and continuity |
| Loading feels cheap | Preserve layout with warm skeletons |

## Final Rule

The best version of this standard makes complex internal work feel clear, credible, and calm.

If a screen makes the user feel more oriented, more confident, and more able to act, it is moving in the right direction.
