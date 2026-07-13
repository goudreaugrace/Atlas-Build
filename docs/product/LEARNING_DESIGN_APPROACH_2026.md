# Brand Doctor Learning Design Approach 2026

## Purpose

The Learn experience should help PepsiCo marketers build enough practical fluency to trust, challenge, and use Brand Doctor without turning the prototype into a generic learning management system.

The audience is not trying to become methodology experts. They are trying to make better brand decisions. The learning product should therefore teach Brand Doctor as brand-strategy enablement:

- read brand equity like an insights lead,
- explain the read like a brand leader,
- connect the read to action without overstating the evidence,
- use AI as a coach and translator while preserving deterministic rule logic and No Magic guardrails.

## 2026 Learning Context

The strongest direction for this prototype is a layered learning model rather than a long course.

Current learning signals:

- Short, focused modules and adaptive next steps are now expected patterns in corporate learning. This supports a microlearning-style hub with clear paths rather than one long Start Here page. Source: https://elearningindustry.com/microlearning-trends-and-strategies
- AI tutoring can improve learning and engagement when the tutor is carefully designed around sound pedagogy. A 2025 Scientific Reports randomized trial found students learned more in less time with a custom AI tutor than with an in-class active learning comparison. Source: https://www.nature.com/articles/s41598-025-97652-6
- Retrieval practice, spaced practice, interleaving, elaboration, and concrete examples remain core learning-science moves. These matter because marketers may return to Brand Doctor episodically, not daily. Sources: https://www.learningscientists.org/blog/2017/4/20-1 and https://cei.umn.edu/teaching-resources/leveraging-learning-sciences/spaced-and-interleaved-practice-improves-recall
- AI learning experiences need transparency, human oversight, and clear separation between source facts, system logic, and AI-generated explanation. This matches Brand Doctor's No Magic principle. Source: https://www.ed.gov/sites/ed/files/documents/ai-report/ai-report.pdf

## Design Stance

This should feel like a strategist sitting with the team before the meeting, not a compliance module.

The product pattern is:

1. **Orient**: give the user a fast shared language.
2. **Explain**: make each core concept legible in marketer language.
3. **Show**: anchor abstract ideas in demo-brand reads.
4. **Practice**: ask the user to retrieve, classify, compare, or decide.
5. **Apply**: connect the concept back to a strategic read, evidence gap, action path, or meeting question.

## Language Stance

Brand Doctor can remain the product name, but the education experience should sound like brand strategy coaching, not a medical metaphor.

Preferred marketer-facing language:

- **Brand read** or **strategic read**, not diagnosis as the default teaching word.
- **Equity signal panel**, not health panel.
- **Action path** or **option to test**, not treatment as the default teaching word.
- **Action library**, not pharmacy.
- **Evidence before action**, not belief before prescription.

Internal rule-engine documentation can still use diagnosis and treatment where those are data-contract terms. Learn pages should translate those terms into marketer language before asking users to apply them.

## Product Architecture

### `/start-here`

Executive orientation. It stays high level, introduces BBE-first language, and creates confidence before the brand report.

It should not become a full course. It should preview the modules and send users to focused pages when they want more detail.

### `/learn`

The learning hub. It organizes the content into role-relevant paths and shows how the current focused modules fit into a larger future education system.

The hub should support:

- recommended paths,
- audience and readiness cues,
- focused module links,
- future practice labs,
- future certification/checkpoint concepts,
- progress-ready metadata without requiring accounts yet.

### `/learn/[moduleId]`

Focused wiki-style learning pages. These pages should stay flexible. Each module gets the structure it needs: narrative, signal reads, comparisons, workflow, guardrails, examples, and meeting questions.

The renderer can use repeatable block types, but the content should not force every module into the same template.

## Recommended Learning Layers

### Layer 1: Executive Microlearning

Best for brand managers, marketers, and senior stakeholders who need fast understanding before entering a report.

Experience:

- short module pages,
- plain-English definitions,
- signal reads,
- misread warnings,
- demo-brand examples,
- meeting questions.

Current implementation:

- Start Here page,
- nine focused module pages,
- new Learn hub paths.

### Layer 2: Scenario Practice

Best for turning recognition into judgment.

Prototype ideas:

- **Read The Signal**: show a small BBE pattern and ask what the team can conclude.
- **Misread Detector**: classify statements as useful read, overreach, missing evidence, or blocked conclusion.
- **Brand Case Walkthrough**: step through Siete, Dots, Lay's, Cheetos, or Tostitos and choose the next evidence lens.
- **Action First Move**: pick the first action path and compare it with Brand Doctor's ranked shortlist.

This should be interactive but low-friction. The goal is confidence and judgment, not a school-like test.

### Layer 3: AI Learning Coach

Best for coaching users through concepts and helping them explain the material back.

The coach should be tightly scoped to:

- education modules,
- wiki documentation,
- active brand context when launched from a brand page,
- No Magic citations,
- configured rule logic and action-path language.

It should support:

- "explain this with Siete,"
- "what might a brand manager misread here?",
- "ask me one question to check if I understand Pricing Power,"
- "turn this into a meeting explanation."

Guardrail:

The learning coach can teach, quiz, and translate. It cannot invent new strategic reads, change configured action ranking, or cite unavailable evidence.

### Layer 4: Certification Path

Best as a later layer after the learning model is stable.

Recommended certification shape:

- short role path,
- a few scenario checks,
- a teach-back prompt,
- a practical brand case,
- a completion state that says the user is grounded enough to interpret Brand Doctor outputs.

Avoid heavy certification language too early. A prototype-friendly name is **Brand Doctor Grounded Reader** or **BBE Diagnostic Fluency Check**.

## Content Principles

### Assume No Critical Prior Knowledge

The target learner is a smart, uninitiated marketer. They may know brands, campaigns, customers, and business pressure, but they should not need prior fluency in BBE, BrandZ, Growth Navigator, Ehrenberg-Bass, How Brands Grow, Mental Availability, Category Entry Points, or AI guardrails to benefit.

Every learning page should define the concept before using it, translate it into marketer language, show the common misread, and connect it back to a practical brand decision.

### Keep BBE First

BBE remains the signal-reading spine. Growth Navigator, Mental Availability / CEPs, distinctive assets, physical availability, machine availability, personas, chat, and Live Consult are supporting lenses.

Every page should answer:

- What does this help us understand about the BBE read?
- What does it help us do next?
- What can it not prove?

### Teach Through Tension

Learning should center on strategic tensions:

- strong today but slipping,
- famous but generic,
- meaningful but not salient,
- salient but not different,
- equity strong but conversion blocked,
- premium ambition but weak price justification.

### Use Concrete Brand Cases

Every important concept should eventually be explainable with a demo brand. Prototype examples can be directional, but the UI and AI should label simulated or missing evidence.

### Make Misreads Visible

Each module should include the error pattern users are most likely to make. Examples:

- treating every red score as the same problem,
- interpreting Momentum as current strength,
- using Pricing Power as SKU-level price guidance,
- treating Growth Navigator as a replacement for BBE,
- letting AI explanation override deterministic evidence.

### End With Application

Each module should leave the user with:

- a question to ask in the meeting,
- a next evidence lens,
- an action-path implication,
- or a confidence caveat.

### Use Third-Party Frameworks Carefully

How Brands Grow, Byron Sharp, Ehrenberg-Bass, and EBI Mental Availability / CEP material can be powerful education context because they help users understand category buyers, mental availability, physical availability, distinctive assets, broad reach, and penetration growth.

The learning product should use those ideas as support lenses around BBE, not as a replacement operating system. Avoid implying formal endorsement unless approved source material explicitly supports it. When third-party concepts appear, label them as external framework context or methodology influence and bring the user back to what Brand Doctor can prove from its own evidence.

## Implementation Plan

### Step 1: Build The Learn Hub

Create `/learn` as the organizing layer for the current module pages.

Deliverables:

- JSON-backed learning paths,
- featured path cards,
- module links,
- future practice/certification preview,
- navigation from Start Here and module pages.

### Step 2: Add Practice Components

Add config-driven interactive checks for:

- read-the-signal,
- misread detector,
- benchmark conflict,
- Pricing Power guardrail,
- BBE-to-action next-lens choice.

Current implementation:

- **Can We Conclude This?** is the first practice component. It asks users to classify scenario statements as valid BBE reads, support-lens hypotheses, missing evidence, overreach, or blocked conclusions.
- The first scenario set covers Momentum, Pricing Power, Growth Navigator, Mental Availability / CEPs, Different versus distinctive assets, No Magic AI, BrandZ typology, performance-context causality, and external-framework endorsement guardrails.
- **Read The Signal** is the second practice component. It shows small BBE / support-lens signal patterns and asks the learner to choose the best strategic read and next evidence lens.
- **Lay's Strategy Read Walkthrough** is the first guided brand case. It asks the learner to move from scale-brand context, to BBE pattern read, to support-lens choice, to evidence caveat, to action-path implication, using source-backed Lay's demo evidence instead of abstract quiz language.

### Step 3: Add Learning Coach

Create a learning-scoped chat experience that can use education module content, wiki docs, and active brand context while showing No Magic citations.

### Step 4: Add Progress And Certification Readiness

Add local prototype progress state first, then consider account-backed progress later.

Certification should wait until the module content, practice checks, and stakeholder language are stable.

## Recommended Near-Term Course

The best next move is to add a second guided case, likely Siete, so the case pattern teaches both an iconic scale brand and a different kind of growth-brand tension. After that, the learning coach can connect module explanations to the same case evidence trail.
