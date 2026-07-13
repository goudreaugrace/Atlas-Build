# Prototype Assumption Catalog

## Purpose

This catalog separates source-backed project data from Codex-created POC assumptions.

The goal is to let the funding demo show how the system works end to end without pretending that every input is official PepsiCo source truth. Anything labeled as a Codex-created prototype assumption must be replaced, approved, or explicitly caveated before pilot or executive circulation.

## Current Data Classes

### Project-Provided / Existing Prototype Data

These inputs were already present in the project or provided through earlier source-material intake:

- Brand Health Records in `src/data/demo/brand-health-records.json`
- BBE metrics, trend series, category lens, diagnosis rules, and treatment links already loaded into the prototype
- Existing Growth Navigator evidence modes embedded in Brand Health Records
- Existing Lay's and Siete Momentum Intelligence source packets
- Brand Strategic Context packets for Lay's, Cheetos, Siete, and Tostitos
- v7 requirement interpretation in `docs/product/BBE_V7_ACCEPTED_REQUIREMENTS_AND_FOUNDATION_GAPS.md`

### Public-Source Brand Context

These sources support brand-literacy assumptions, not measured equity facts:

- Lay's public PepsiCo brand and redesign language: `https://www.pepsico.com/en/brands/lays` and `https://www.pepsico.com/en/newsroom/stories/2025/from-potato-to-chip-the-next-chapter-of-lays`
- Cheetos public PepsiCo language around mischief, Cheetle, Chester Cheetah, and playful spirit: `https://www.pepsico.com/newsroom/press-releases/2023/cheetos-enters-new-category-with-debut-of-cheetos-pretzels`, `https://www.pepsico.com/newsroom/press-releases/2023/cheetos-marks-75-years-of-mischief-with-epic-birthday-bash-with-cheetos-inspired-fashion-show-and-reveal-of-cheetos-milk-bar-cake`, and `https://www.cheetos.com/index.php/faqs/who-chester-cheetah`
- Tostitos public PepsiCo/Tostitos language around whole corn kernels, traditional masa, Fiesta Spirit, connection, and celebration: `https://www.pepsico.com/en/brands/tostitos`, `https://www.tostitos.com/`, and `https://www.tostitos.com/our-story`
- Siete public PepsiCo/Siete language around Mexican-American heritage, family, thoughtfully selected ingredients, and acquisition into PepsiCo: `https://www.pepsico.com/en/brands/siete`, `https://sietefoods.com/about/our-story`, and `https://www.pepsico.com/newsroom/press-releases/2025/pepsico-completes-acquisition-of-siete-foods`

### Codex-Created POC Assumptions

These inputs were created by Codex on 2026-07-02 to complete the minimum v7 foundation for the funding POC:

- Cheetos Momentum Intelligence assumption packet in `src/data/demo/momentum-intelligence-source-packets.json`
- Tostitos Momentum Intelligence assumption packet in `src/data/demo/momentum-intelligence-source-packets.json`
- Updated Lay's and Siete packet caveats/source-owner language to disclose Codex-assisted prototype assumption synthesis
- Reviewed-local competitive-set assumptions for Lay's, Cheetos, Siete, and Tostitos
- Directional Room to Grow assumptions where measured source fields are incomplete or not loaded
- Directional SMD contribution-weight assumptions for prioritizing executive questions

## Assumption Detail By Brand

### Lay's

Existing data:

- BBE metrics, trend series, category lens, diagnosis, treatment links, and measured partial Growth Navigator context from the project data.
- Existing prototype-reviewed Momentum source packet.

Codex-created or Codex-assisted assumptions:

- Peer-set caveat and source-owner disclosure were tightened to mark the packet as prototype assumption synthesis.
- SMD contribution weights remain prototype directional inputs.
- Room to Grow inputs remain QBR provocation context, not forecast or investment sizing.

Replacement needed for pilot:

- Approved competitive-set definition.
- Approved Room to Grow source extract with penetration headroom, share gap, and category growth.
- Approved BBE contribution-weight model and trend significance extract.

### Cheetos

Existing data:

- BBE metrics, trend series, category lens, diagnosis, treatment links, measured full Growth Navigator evidence mode, and public-source Brand Strategic Context.

Codex-created assumptions:

- Peer set: `us-savory-flavor-icons`
- Room to Grow inputs: penetration headroom `24`, Demand Power / share gap `2.6`, category growth `1.2`
- SMD weights: Salient `0.29`, Meaningful `0.38`, Different `0.33`

Logic:

- Public Cheetos sources support a distinctive mischief/flavor/icon read.
- Project BBE data shows category-leading Demand Power with Not Ahead posture and declining Demand Power / Meaningful momentum.
- The POC assumption therefore emphasizes relevance/meaning and distinctiveness while preserving Cheetos' playful asset base.

Replacement needed for pilot:

- Approved Cheetos competitive set.
- Measured penetration, share, and category growth fields.
- Official SMD contribution weights and movement/significance evidence.

### Siete

Existing data:

- BBE metrics, trend series, category lens, diagnosis, treatment links, synthetic Growth Navigator evidence mode, existing prototype-reviewed Momentum source packet, and public-source Brand Strategic Context.

Codex-created or Codex-assisted assumptions:

- Peer set and SMD weights remain prototype assumptions.
- Room to Grow values remain directional growth-brand context.

Logic:

- Public Siete sources support family, heritage, Mexican-American, thoughtfully selected ingredients, and togetherness cues.
- Current project data supports a growth-brand read but does not make official PepsiCo integration, distribution, or investment claims.

Replacement needed for pilot:

- Approved Siete competitive set and PepsiCo portfolio role.
- Approved or measured Growth Navigator source extract.
- Official Room to Grow, SMD contribution, and trend significance evidence.

### Tostitos

Existing data:

- BBE metrics, trend series, category lens, diagnosis, treatment links, measured full Growth Navigator evidence mode, and public-source Brand Strategic Context.

Codex-created assumptions:

- Peer set: `us-tortilla-social-snacking`
- Room to Grow inputs: penetration headroom `31`, Demand Power / share gap `1.7`, category growth `-2.4`
- SMD weights: Salient `0.36`, Meaningful `0.34`, Different `0.30`

Logic:

- Public Tostitos sources support a social snacking / hosting / Fiesta Spirit / craft and quality read.
- Project BBE data shows parity-to-lagging equity posture with holding momentum and a need to diagnose salience, hosting relevance, and distinctiveness.
- The POC assumption therefore emphasizes salience and meaning while keeping occasion-growth and substitution claims gated.

Replacement needed for pilot:

- Approved Tostitos competitive set.
- Approved tortilla/social-snacking market context and Room to Grow source extract.
- Official SMD contribution weights and movement/significance evidence.

## Required Work For A Real Solution

Before pilot or production, the prototype assumptions should be replaced by source-owner data and governance:

1. Define approved competitive sets by brand, market, category lens, period, peer count, selection basis, and source owner.
2. Load measured Room to Grow inputs: penetration headroom, Demand Power / share gap, market share/value share, category growth, and data period.
3. Load approved BBE contribution weights for S/M/D by market, category, and period.
4. Load movement and significance evidence so trend language can distinguish directional movement from statistically supported movement.
5. Replace public-source Brand Strategic Context with approved brand source packets where executive or agency use is expected.
6. Add source-owner review identity, approval workflow, versioning, persistence, and export/circulation policy.
7. Keep AI-generated reads as artifacts, not canonical facts, until a human owner approves the source data and artifact language.
8. Add any simulated demographic diagnostics only as prototype workflow demonstrations, clearly label them as simulated wherever they render, and replace them with official BBE demographic cuts before pilot or executive decision use.
