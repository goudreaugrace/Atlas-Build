# Learning Experience Catalog — Brand Doctor

## Purpose

The Learn area should make Brand Doctor feel approachable, memorable, and useful for marketers before they enter brand strategy work. It should not feel like a PRD, a static glossary, or a compliance training module.

The learning product should help a marketer:

1. Understand the brand equity system.
2. Read BBE signals correctly.
3. Avoid common misreads.
4. See how evidence-backed reads connect to marketing action.
5. Build enough confidence to challenge, accept, or refine the system.

## BBE Alignment

The Learn area should not introduce a new master framework before marketers understand Better Brand Equity. BBE is the signal-reading spine. Connected systems such as Growth Navigator, Mental Availability / Category Entry Points, distinctive asset evidence, physical availability, machine availability, personas, chat, and Live Consult should be taught as supporting lenses that help teams interpret BBE, identify missing evidence, and choose better actions.

In practice:

- Start Here remains the executive orientation for marketers.
- BBE concepts come first.
- Connected systems are introduced through the question: "How does this help us explain or act on the BBE read?"
- Growth Availability language should be used carefully as an advanced synthesis layer, not as a replacement for BBE.

## Product Stance

Learning should feel like brand strategy coaching, not documentation.

The main Learn page should become a hub for learning areas, highlights, and guided paths. Each focused learning page should teach one concept through explanation, visual interpretation, brand examples, and a small active-learning moment.

## Current Design Approach

The 2026 learning design approach is documented in `docs/product/LEARNING_DESIGN_APPROACH_2026.md`.

That approach sets the product direction as four layers:

- executive microlearning,
- scenario-based practice,
- a tightly scoped AI learning coach,
- a later lightweight certification path.

The current implementation focuses on the first layer and prepares the structure for the next three. `/start-here` remains the fast executive orientation, `/learn` becomes the guided hub, and `/learn/[moduleId]` carries the richer focused module content.

The current language stance keeps Brand Doctor as the product name while removing the doctor/patient metaphor from marketer-facing learning. The preferred learning language is equity signal panel, strategic read, evidence lens, action path, action library, and follow-up proof.

The first scenario-practice components are now live in `/learn`:

- **Read The Signal** teaches users to interpret small BBE / support-lens signal patterns and choose the best next evidence lens.
- **Can We Conclude This?** teaches users to classify a statement as a valid BBE read, support-lens hypothesis, missing evidence, overreach, or blocked conclusion.
- **Lay's Strategy Read Walkthrough** teaches users to apply the whole Brand Doctor reasoning chain to one demo brand: scale context, BBE signal, support lens, evidence caveat, action-path implication, and meeting-ready read.

## Research Signals To Use

These signals should inform design, without turning the product into a generic learning management system.

- **AI tutors can improve engagement and learning when designed carefully.** A 2025 randomized controlled trial in Scientific Reports found a custom AI tutor helped students learn more in less time than an in-class active learning comparison, while also reporting higher engagement and motivation. Source: https://www.nature.com/articles/s41598-025-97652-6
- **Retrieval practice, spacing, interleaving, elaboration, and concrete examples remain core learning-science moves.** These are especially useful for helping people remember how to read BBE patterns instead of just recognizing them once. Source: https://www.learningscientists.org/blog/2017/4/20-1
- **Spaced and interleaved practice improves recall.** This matters because brand teams may use Brand Doctor episodically, so the product should reintroduce concepts at the right moment. Source: https://cei.umn.edu/teaching-resources/leveraging-learning-sciences/spaced-and-interleaved-practice-improves-recall
- **Microlearning and adaptive learning are becoming standard corporate-learning patterns.** Brand Doctor should use short, focused modules with adaptive next steps instead of long linear courses. Source: https://elearningindustry.com/microlearning-in-2025-the-basics-science-trends-and-more
- **AI in learning needs transparency and human oversight.** The Learn area should preserve the No Magic principle by separating facts, system logic, and AI coaching. Source: https://www.ed.gov/sites/ed/files/documents/ai-report/ai-report.pdf

## Marketing Learning Principles

### 1. Start With The Consumer And The Choice

BBE concepts should be taught through consumer choice moments: why a brand comes to mind, why it feels relevant, why it earns value perception, and why it wins or loses in context.

### 2. Teach Through Tension

Marketing learning sticks when there is a strategic tension:

- Strong but slipping.
- Famous but generic.
- Meaningful but not salient.
- Salient but not different.
- Equity strong, conversion blocked.
- Premium ambition, weak value perception.

Each learning module should expose a tension, then show how Brand Doctor reads it.

### 3. Make The Invisible System Visible

The experience should show how a metric becomes evidence, how evidence becomes a strategic read, and how that read becomes action options to test. This is the learning equivalent of the No Magic principle.

### 4. Use Brand Examples, Not Abstract Definitions

Every core idea should be anchored in one or more demo brands. The user should be able to ask, "Show this with Lay's, Siete, Dots, Cheetos, or Tostitos."

### 5. Teach Misreads Explicitly

A great Learn page should not only say what a metric means. It should say what people commonly get wrong.

Examples:

- High score does not always mean healthy trajectory.
- Red is not always the same kind of red.
- Perceived Value is not SKU price guidance.
- Growth Navigator is not a duplicate BBE dashboard.
- The AI explanation is not the deterministic rule itself.

### 6. End With A Marketing Action

Each learning module should end with a marketer-oriented implication:

- What would I ask next?
- What meeting question should I bring?
- What cross-functional partner should be involved?
- What evidence would change my mind?
- What action path might be relevant if this pattern appears?

## Proposed Learn Information Architecture

### `/learn`

The hub. It should show learning areas, featured lessons, progress, and recommended paths.

Primary sections:

- **Start With Brand Equity**: why BBE matters and how the system works.
- **Read The Signals**: Demand Power, Perceived Value, Salient, Meaningful, Different.
- **Interpret The Pattern**: benchmarks, momentum, typology, and tension detection.
- **Connect BBE To Action**: Growth Navigator, Mental Availability / CEPs, distinctive assets, physical availability, machine availability, evidence readiness, and conversion caveats as supporting lenses around BBE.
- **Use The System**: strategic read, evidence, action library, chat, Live Consult, and No Magic.
- **Practice With Brands**: interactive labs using demo brands.

### `/learn/[moduleId]`

Focused learning pages. Each module should be config-driven and render the same core structure.

Recommended page structure:

1. **Concept promise**: what the user will be able to do.
2. **Plain-English definition**: one human explanation.
3. **Brand strategy translation**: what it means for marketing.
4. **How Brand Doctor uses it**: data, rule, or UI connection.
5. **How to read the visual**: labels, axes, color, benchmark, caveat.
6. **Common misreads**: explicit traps.
7. **Brand example**: real demo brand pattern.
8. **Try it**: one interactive check.
9. **Ask Brand Doctor**: suggested coaching prompts.
10. **Go deeper**: wiki, data view, or focused report section link.

## Initial Focused Learning Pages

### 1. Why Brand Equity Matters

Goal: make BBE feel like growth infrastructure, not measurement theater.

Interactive idea: "Strong today or healthy tomorrow?" Show three mini brand cards and ask which one needs attention first.

Visual idea: equity health bridge from consumer memory to demand support and value perception.

### 2. The BBE System In One Picture

Goal: explain outcome KPIs versus input KPIs.

Interactive idea: drag Salient, Meaningful, and Different into the right role under Demand Power or Perceived Value.

Visual idea: layered system map with outcomes at top and foundations underneath.

### 3. Demand Power

Goal: teach demand strength as a brand-equity outcome.

Interactive idea: "Read the signal" exercise comparing category strength, Ahead status, and Momentum.

Visual idea: demand pulse card with current strength and trajectory separated.

### 4. Perceived Value

Goal: teach value perception without implying SKU pricing advice.

Interactive idea: "Can we conclude this?" quiz that separates equity permission from RGM price decisions.

Visual idea: guardrail rail with allowed reads on one side and blocked reads on the other.

### 5. Meaningful

Goal: teach relevance, emotional fit, and consumer need connection.

Interactive idea: match consumer need states to Meaningful signals.

Visual idea: consumer tension card showing when relevance is strong, weak, or changing.

### 6. Different

Goal: teach distinctiveness and brand choice advantage.

Interactive idea: "Generic or distinctive?" side-by-side brand memory prompts.

Visual idea: differentiation spectrum with evidence chips.

### 7. Salient

Goal: teach mental availability and come-to-mind strength.

Interactive idea: choose which occasion or demand moment the brand is most likely to own.

Visual idea: occasion memory map.

### 8. Benchmarks And Momentum

Goal: teach why the same score can mean different things under category, Ahead, and Momentum lenses.

Interactive idea: benchmark conflict simulator. The user toggles category index, Ahead, and Momentum to see how interpretation changes.

Visual idea: three-lens triptych.

### 9. Brand Typology And Role

Goal: teach why brand role changes interpretation and action.

Interactive idea: "Same signal, different brand" comparison where a Star and an Outsider get different reads.

Visual idea: typology grid with action implications.

### 10. Growth Navigator Bridge

Goal: teach BBE as equity health and GN as commercial vitals.

Interactive idea: determine whether a pattern suggests equity ailment, conversion leak, or missing evidence.

Visual idea: health record plus vitals monitor.

### 10A. Connecting BBE To Better Marketing Action

Goal: teach that connected systems help marketers explain and act on the BBE read without replacing it.

Interactive idea: show a BBE read and ask the learner which connected lens would help next: GN for conversion, CEPs for mental retrieval, distinctive assets for recognizability, physical availability for buyability, or evidence readiness for confidence.

Visual idea: BBE read at the center, surrounded by supporting evidence lenses and action paths.

### 11. Diagnosis And Evidence

Goal: teach how rules fire and why evidence/counter-evidence matter.

Interactive idea: let users inspect a simple rule, then predict whether it fires.

Visual idea: rule trace ladder from metric to evidence to strategic read.

### 12. Action Library

Goal: teach "action paths to test" after the strategic read, not generic recommendations.

Interactive idea: choose the first action path and see why foundation-first ranking matters.

Visual idea: action shelf organized by read fit, evidence confidence, time, cost, owner, and follow-up signal.

### 13. No Magic AI

Goal: teach what the AI can and cannot do.

Interactive idea: classify a sentence as observed data, deterministic logic, or AI interpretation.

Visual idea: three-layer evidence stack.

### 14. Dialog With Data

Goal: teach users how to ask better questions.

Interactive idea: prompt composer that turns vague questions into grounded questions.

Visual idea: active brand + active visual + evidence packet scope diagram.

### 15. Live Consult

Goal: teach the voice/avatar experience as a hands-free interface over the same governed system.

Interactive idea: choose a boardroom scenario and watch what evidence chips should appear.

Visual idea: transcript with citation chips and visual actions.

### 16. Operator And Governance Basics

Goal: teach how the prototype stays trustworthy.

Interactive idea: identify whether a proposed change belongs in JSON config, markdown docs, service logic, or UI rendering.

Visual idea: "Components render. Services compute. Config defines. LLM explains."

## Learning Capabilities Catalog

### Guided Learning Paths

Users can choose a path by role:

- Brand Manager: understand, believe, decide.
- Insights Lead: inspect, challenge, calibrate.
- Executive: read the headline, ask the right caveats.
- New user: complete the foundations before reading a brand report.

### Interactive Signal Labs

Small exercises where users interpret a metric pattern before seeing the system's read.

Best for:

- Benchmarks.
- Momentum.
- S/M/D pattern recognition.
- Perceived Value guardrails.

### Misread Detector

Fast quiz moments that ask, "What should we not conclude from this?"

This is important because the prototype's biggest risk is not lack of information; it is overclaiming.

### Brand Case Walkthroughs

Progressive reveal case studies using demo brands.

Pattern:

1. Show the brand context.
2. Reveal the health signal.
3. Ask the user to predict the strategic read.
4. Reveal rule/evidence.
5. Ask which action path should be explored first.
6. Reveal the system recommendation and caveats.

Current implementation:

- The first case uses Lay's because it is the brand stakeholders most want to understand and it has enough seeded BBE, measured partial Growth Navigator, rule, evidence, and action-link material to show the full reasoning loop.
- The case is config-driven through `learning-case-walkthroughs.json` and has seven steps: setup, equity signal panel read, momentum tension, support-lens choice, evidence caveat, action-path implication, and meeting read.
- The design is intentionally not a school test. It behaves like a guided strategy rehearsal: each answer gives coaching, shows evidence references, and points back to the relevant focused module.

### AI Learning Coach

A learning-specific assistant that teaches concepts, asks Socratic follow-ups, and cites the module it is using.

Guardrails:

- It should not create a new active-brand read unless the user is in the report area and the read is grounded in configured evidence.
- It should explain concepts using approved learning modules.
- It should label when it is using a demo example.
- It should never imply official methodology approval beyond prototype scope.

### Prompt Practice

Help users learn how to ask better questions:

- Too vague: "What is wrong with my brand?"
- Better: "What evidence supports the primary read, and what counter-evidence should I consider?"
- Better: "Explain the Demand Power Momentum read for a Brand Manager."
- Better: "What should I not conclude from Perceived Value?"

### Spaced Refreshers

When a user returns later, show a tiny contextual refresher:

- "You are looking at Momentum. Remember: current strength and trajectory are different."
- "You are looking at Perceived Value. This is not SKU pricing guidance."

### Learning Checkpoints

Short checks after modules:

- One concept question.
- One interpretation question.
- One misread question.
- One action implication question.

### Visual Glossary

An interactive glossary where each term has:

- Plain-English definition.
- Brand strategy meaning.
- UI location.
- Data source.
- Misread warning.
- Example brand.

### Pattern Read Simulator

Users adjust a few controlled metric states and watch the likely strategic read change.

Important guardrail: this is a teaching simulator, not a real rule editor.

### Action Decision Rehearsal

A marketer chooses an action path and sees:

- Why it fits.
- Why it may not fit.
- Which owner should be involved.
- What signal would prove progress.
- What caveat must be carried into the meeting.

### Persona Debate

Two personas respond to a learning case:

- CMO Advisor: decisive strategic implication.
- Insights Skeptic: caveats, evidence quality, what would change the read.

Then Brand Doctor reconciles the two.

### Voice-Based Teach-Back

The user explains a concept aloud. Brand Doctor listens and says:

- What they got right.
- What needs refinement.
- Which misread to avoid.
- Which module to revisit.

This would be a strong "wow" capability, but it should come after the written learning flow is stable.

### Meeting Mode

A shareable read-ahead for teams:

- 5-minute primer.
- 3 questions to discuss.
- 2 misreads to avoid.
- 1 brand case to practice.

This could export to Word/PDF like the System Wiki.

### Manager Coaching Cards

Cards a leader can use in a meeting:

- "Ask this when Demand Power is strong but declining."
- "Ask this when Salient is high but Different is weak."
- "Ask this before accepting an action path."

### Interactive Visual Explainers

Marketing-grade visuals that teach the system:

- BBE system map.
- Three benchmark lenses.
- Momentum ladder.
- Brand typology grid.
- GN vitals bridge.
- Rule trace ladder.
- Action library shelf.
- No Magic evidence stack.

## JSON-First Content Model

The Learn experience should be config-driven, not page-copy hard-coded.

Proposed module shape:

```json
{
  "id": "demand-power",
  "title": "Demand Power",
  "level": "foundation",
  "audiences": ["brand-manager", "insights-lead"],
  "promise": "Read Demand Power as an equity outcome, not just a score.",
  "plainEnglish": "Demand Power tells us whether brand equity is strong enough to support consumer demand.",
  "marketingTranslation": "This is about whether consumers are likely to choose or seek the brand when it matters.",
  "brandDoctorUsage": "Used as an outcome KPI in rule logic and executive summary interpretation.",
  "visualExplainer": {
    "type": "three-lens-triptych",
    "sourceMetrics": ["Demand Power"]
  },
  "misreads": [
    "Do not treat current strength as the same thing as Momentum.",
    "Do not prescribe from one metric alone."
  ],
  "exampleBrandIds": ["lays", "siete"],
  "interactive": {
    "type": "read-the-signal",
    "question": "Which signal should worry the team first?",
    "answers": []
  },
  "coachPrompts": [
    "Explain Demand Power like I am a brand manager.",
    "What would make a Demand Power read misleading?"
  ],
  "relatedWikiIds": ["data-model", "diagnosis-engine"]
}
```

## Build Sequence Recommendation

### Phase 1 — Learn Hub And Focus Pages

- Rename or route `/start-here` to `/learn`.
- Keep `/start-here` as a legacy alias.
- Add `/learn/[moduleId]`.
- Render existing grounding modules as focused pages.
- Add highlights, recommended path, and role paths on the hub.

### Phase 2 — Interactive Learning Moments

- Add read-the-signal checks.
- Add misread detector.
- Add brand case walkthroughs.
- Store answers and explanations in JSON.

### Phase 3 — AI Learning Coach

- Add learning-specific chat scope.
- Use module content, wiki links, guardrails, and citations.
- Add "ask a better question" coaching.

### Phase 4 — Marketing-Grade Visual Learning

- Build interactive diagrams for BBE system, benchmark triptych, Momentum ladder, GN bridge, and No Magic stack.
- Use real demo brand examples where possible.

### Phase 5 — Team Sharing And Facilitation

- Export learning modules as Word/PDF read-aheads.
- Add meeting mode.
- Add manager coaching cards.
- Add feedback capture for unclear concepts.

## Success Measures

The Learn area is working when:

- A first-time user can explain Demand Power, Perceived Value, S/M/D, Momentum, and guardrails without reading the wiki.
- A brand manager can correctly identify what not to conclude from a signal.
- An insights lead can trace a strategic read back to data and rules.
- Users ask better chat questions after completing modules.
- Stakeholders trust the prototype more because it teaches its own logic.

## Open Questions

- Should `/learn` replace `/start-here`, or should `/start-here` remain the short guided path while `/learn` becomes the broader library?
- Should progress be local-only for now, or should it wait for a future user profile/store?
- Should learning checks be mandatory before first report read, or optional but strongly promoted?
- Should learning coach responses use the same persona system or a separate educator persona?
- Should learning exports be one combined guide or one export per module?
