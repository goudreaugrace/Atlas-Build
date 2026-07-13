import type { NegotiationRecord, StrategyRecentOutput, StrategyWatchout, StrategyWorkspaceSummary, VisualEvidenceModule } from './types';

export const demoNegotiation: NegotiationRecord = {
  id: 'carrefour-france-2026-pricing',
  customer: 'Carrefour',
  buyingGroup: 'Eurelec / Carrefour Group',
  pricingAlliance: 'EMD',
  year: 2026,
  retailers: [
    {
      id: 'carrefour-france',
      name: 'Carrefour France',
      role: 'Lead retailer in current annual pricing conversation',
      markets: ['France'],
      knownPriorities: ['Consumer affordability', 'Competitive shelf positioning', 'Promo funding pressure'],
      negotiationStyle: 'Responds well to data-backed counters. Avoid opening with PepsiCo margin constraints; lead with consumer demand, volume upside, and competitive shelf position.',
      source: {
        value: 'Customer context synthesized from legacy negotiation notes and PRD discovery.',
        label: 'modeled_estimate',
        source: 'ATLAS synthetic customer context packet',
        freshness: 'Prototype 2026-07-07',
        confidence: 'medium'
      }
    },
    {
      id: 'eurelec-buying-office',
      name: 'Eurelec buying office',
      role: 'Buying-group pressure comparator',
      markets: ['France', 'Germany', 'Belgium', 'Netherlands', 'Spain', 'Italy'],
      knownPriorities: ['Cross-market consistency', 'Joint buying leverage', 'Response before annual deadline'],
      negotiationStyle: 'Evaluates the deal as a whole and may compare country-level tradeoffs before accepting a path.',
      source: {
        value: 'Buying-group span is a working assumption pending sanitized customer materials.',
        label: 'user_assumption',
        source: 'PRD open question plus Stefan interview notes',
        freshness: 'Entered 2026-07-07',
        confidence: 'low'
      }
    }
  ],
  market: 'France',
  markets: [
    {
      market: 'France',
      products: ['Lay\'s', 'Doritos', 'Cheetos'],
      currentPriceIndex: {
        value: 100,
        label: 'sourced_fact',
        source: 'Mosaic monthly actuals extract',
        freshness: 'Synced 2026-07-06',
        confidence: 'high'
      },
      targetPriceMovePct: {
        value: 3.5,
        label: 'sourced_fact',
        source: 'CNO 2026 target file',
        freshness: 'Reviewed 2026-07-05',
        confidence: 'high'
      },
      redLinePct: {
        value: 3.0,
        label: 'user_assumption',
        source: 'CNO working guardrail',
        freshness: 'Entered 2026-07-06',
        confidence: 'medium'
      },
      marginFloorPct: {
        value: 30.8,
        label: 'modeled_estimate',
        source: 'ATLAS pricing corridor stand-in',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      breakevenPct: {
        value: 3.0,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      offsetRole: 'watch'
    },
    {
      market: 'Germany',
      products: ['Lay\'s', 'Doritos'],
      currentPriceIndex: {
        value: 104,
        label: 'modeled_estimate',
        source: 'Mosaic proxy market packet',
        freshness: 'Prototype 2026-07-06',
        confidence: 'medium'
      },
      targetPriceMovePct: {
        value: 3.2,
        label: 'user_assumption',
        source: 'Cross-market offset assumption',
        freshness: 'Entered 2026-07-07',
        confidence: 'low'
      },
      redLinePct: {
        value: 2.8,
        label: 'user_assumption',
        source: 'CNO working guardrail',
        freshness: 'Entered 2026-07-07',
        confidence: 'low'
      },
      marginFloorPct: {
        value: 33.1,
        label: 'modeled_estimate',
        source: 'ATLAS pricing corridor stand-in',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      breakevenPct: {
        value: 2.8,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      offsetRole: 'offsetting_value'
    },
    {
      market: 'Belgium',
      products: ['Lay\'s', 'Doritos'],
      currentPriceIndex: {
        value: 101,
        label: 'modeled_estimate',
        source: 'ATLAS market guardrail stand-in',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      targetPriceMovePct: {
        value: 3.1,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      redLinePct: {
        value: 2.7,
        label: 'user_assumption',
        source: 'CNO working guardrail',
        freshness: 'Entered 2026-03-22',
        confidence: 'medium'
      },
      marginFloorPct: {
        value: 31.2,
        label: 'modeled_estimate',
        source: 'ATLAS pricing corridor stand-in',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      breakevenPct: {
        value: 2.7,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      offsetRole: 'neutral'
    },
    {
      market: 'Netherlands',
      products: ['Lay\'s', 'Doritos'],
      currentPriceIndex: {
        value: 103,
        label: 'modeled_estimate',
        source: 'ATLAS market guardrail stand-in',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      targetPriceMovePct: {
        value: 3.0,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      redLinePct: {
        value: 2.6,
        label: 'user_assumption',
        source: 'CNO working guardrail',
        freshness: 'Entered 2026-03-22',
        confidence: 'medium'
      },
      marginFloorPct: {
        value: 31.4,
        label: 'modeled_estimate',
        source: 'ATLAS pricing corridor stand-in',
        freshness: 'Calculated from current packet',
        confidence: 'medium'
      },
      breakevenPct: {
        value: 2.6,
        label: 'modeled_estimate',
        source: 'Pricing corridor proxy',
        freshness: 'Prototype 2026-03-22',
        confidence: 'medium'
      },
      offsetRole: 'neutral'
    },
    {
      market: 'Spain',
      products: ['Lay\'s', 'Doritos'],
      currentPriceIndex: {
        value: 98,
        label: 'unknown_gap',
        source: 'Sanitized packet not yet available',
        freshness: 'Gap logged 2026-07-07',
        confidence: 'low'
      },
      targetPriceMovePct: {
        value: 3.6,
        label: 'modeled_estimate',
        source: 'ATLAS cross-market placeholder',
        freshness: 'Prototype 2026-07-07',
        confidence: 'low'
      },
      redLinePct: {
        value: 1.8,
        label: 'unknown_gap',
        source: 'Needs pricing corridor confirmation',
        freshness: 'Gap logged 2026-07-07',
        confidence: 'low'
      },
      marginFloorPct: {
        value: 30.9,
        label: 'modeled_estimate',
        source: 'ATLAS pricing corridor stand-in',
        freshness: 'Calculated from current packet',
        confidence: 'low'
      },
      breakevenPct: {
        value: 1.7,
        label: 'unknown_gap',
        source: 'Needs finance validation',
        freshness: 'Gap logged 2026-07-07',
        confidence: 'low'
      },
      offsetRole: 'watch'
    }
  ],
  products: ['Lay\'s', 'Doritos', 'Cheetos'],
  region: 'Europe Central',
  category: 'Salty Snacks',
  cycle: '2026 annual pricing negotiation',
  stage: 'nego_execution',
  strategyVersion: 'v3 working',
  strategyReadinessState: 'Needs finance validation on Germany volume recovery',
  recommendedPosition: 'Hold 3.0% counter',
  activeDecisionTitle: 'Carrefour counteroffer response',
  recommendedCounterPct: {
    value: 3.0,
    label: 'modeled_estimate',
    source: 'ATLAS Scenario Decision Lab',
    freshness: 'Generated 2026-03-22',
    confidence: 'medium'
  },
  responseDeadline: '2026-03-28',
  decisionConfidence: 'medium',
  blockingIssue: 'Germany volume uplift assumption needs finance validation.',
  buyerSilenceDays: 14,
  latestDebriefSnapshot: 'Buyer rejected prior 2.5% counter and came back at 4.2%. Buyer emphasized affordability pressure in France and hinted at reduced promo participation if PepsiCo does not move closer to the ask.',
  currentStrategySummary: 'Carrefour rejected the prior counter and returned at 4.2%, citing France affordability pressure and competitive shelf pricing. ATLAS recommends countering at 3.0% with a volume-upside argument.',
  sellStory: {
    narrative: 'We are defending a 3.0% counter by anchoring on cost pressure, branded value, and volume-upside support rather than pure price concession.',
    defense: 'The 3.0% counter protects the France red line while keeping Carrefour close enough to an acceptance range if the response is packaged around shopper value and volume recovery.',
    buyerPressurePoints: [
      'France affordability pressure and shelf-price sensitivity.',
      'Private label gap being used as the buyer anchor.',
      'Promo participation implied as leverage but not yet confirmed.',
      'Buying-group comparison across Western Europe.'
    ],
    expectedObjections: [
      'Consumers cannot absorb another increase in France.',
      'Private label and competitor A are more attractive at shelf.',
      'Carrefour needs more trade support to keep promo visibility.',
      'Germany offset is not relevant to France shelf pressure.'
    ],
    proofPointsNeeded: [
      'Pricing corridor strip showing buyer ask, target, red line, and recommended counter.',
      'Cost pressure stack refreshed with latest commodity and packaging inputs.',
      'Private label shelf-price comparison for France.',
      'Promo exposure view showing what is at risk if visibility pressure becomes explicit.',
      'Scenario mini-card for 3.0% counter versus 3.2% fallback.'
    ],
    confidence: 'medium',
    editableDraft: 'Defend 3.0% with a value-led Carrefour story: acknowledge affordability pressure, show cost and category support, pair the counter with volume-upside logic, and hold Q4 promo phasing as a fallback only after finance validates Germany recovery.'
  },
  annualPriorities: [
    'Protect the 3.0% France red line while keeping the buyer close enough to acceptance.',
    'Use Germany volume upside as recovery logic only after finance validates the 8% assumption.',
    'Lead with consumer demand, competitive shelf position, and cost pressure; avoid internal margin language.',
    'Prepare a buyer-facing argument before the Mar 28 response deadline.'
  ],
  buyingGroupPriorities: [
    'Consumer affordability pressure in France.',
    'Competitive shelf positioning versus private label.',
    'Promo funding and Q4 phasing.',
    'Fast response before the annual negotiation window closes.'
  ],
  openRisks: [
    'Germany volume uplift assumption is unvalidated and lowers recommendation confidence.',
    'Buyer has gone quiet for 14 days, increasing deadline and sanction pressure.',
    'Promo exclusion was implied but not confirmed in the latest debrief.',
    'Accepting 4.2% breaches the France guardrail and compresses margin.'
  ],
  activeScenarioId: 'scenario-counter-3',
  lastSourceSync: '2026-03-22 08:30 CET',
  sourceReadiness: 'Prototype packet: Mosaic/Cockpit/BG/Nielsen/Mintec stand-ins with source labels',
  pricingCorridorInputs: [
    {
      id: 'france-cost-to-serve',
      label: 'France cost and shelf-price bridge',
      market: 'France',
      value: {
        value: 'Commodity and packaging pressure support a defended counter, but the buyer-facing story should lead with affordability and volume upside.',
        label: 'modeled_estimate',
        source: 'Mintec/Expana proxy plus CNO target file',
        freshness: 'Prototype packet 2026-03-22',
        confidence: 'medium'
      },
      implication: 'Use as evidence for the 3.0% counter; do not lead with internal margin constraints.'
    },
    {
      id: 'germany-offset',
      label: 'Germany volume uplift assumption',
      market: 'Germany',
      value: {
        value: 'Scenario B depends on 8% Germany volume uplift that has not been validated by latest forecast.',
        label: 'user_assumption',
        source: 'CNO working offset assumption',
        freshness: 'Entered 2026-03-22',
        confidence: 'low'
      },
      implication: 'Blocking issue for approval; confidence stays medium until finance validates.'
    },
    {
      id: 'history-volume-argument',
      label: '2025 Carrefour acceptance pattern',
      market: 'France',
      value: {
        value: 'Buyer initially rejected firm counter but accepted after PepsiCo introduced volume upside.',
        label: 'sourced_fact',
        source: 'Historical negotiation tracker stand-in',
        freshness: 'Captured 2025-03-15',
        confidence: 'medium'
      },
      implication: 'Supports pairing the 3.0% counter with volume upside instead of pure price defense.'
    }
  ],
  pricingPosition: {
    currentNetPriceIndex: {
      value: 100,
      label: 'sourced_fact',
      source: 'Mosaic monthly actuals extract',
      freshness: 'Synced 2026-07-06',
      confidence: 'high'
    },
    targetPriceIncreasePct: {
      value: 3.5,
      label: 'sourced_fact',
      source: 'CNO 2026 target file',
      freshness: 'Reviewed 2026-03-20',
      confidence: 'high'
    },
    redLinePriceIncreasePct: {
      value: 3.0,
      label: 'user_assumption',
      source: 'CNO working red-line assumption',
      freshness: 'Entered 2026-03-20',
      confidence: 'medium'
    },
    currentCustomerAskPct: {
      value: 4.2,
      label: 'user_assumption',
      source: 'Latest buyer counteroffer debrief',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    },
    grossMarginPct: {
      value: 33.4,
      label: 'sourced_fact',
      source: 'Cockpit forecast extract',
      freshness: 'Synced 2026-07-06',
      confidence: 'high'
    },
    netRevenueAtRiskEuros: {
      value: 4800000,
      label: 'modeled_estimate',
      source: 'ATLAS scenario model v0.1',
      freshness: 'Calculated from current packet',
      confidence: 'medium'
    },
    volumeAtRiskPct: {
      value: 4.0,
      label: 'modeled_estimate',
      source: 'Historical elasticity proxy',
      freshness: 'Calculated from current packet',
      confidence: 'medium'
    },
    tradeMarginPct: {
      value: 28.7,
      label: 'sourced_fact',
      source: 'Nielsen sell-out plus BG trade terms',
      freshness: 'Synced 2026-07-04',
      confidence: 'medium'
    }
  },
  scenarios: [
    {
      id: 'scenario-accept',
      name: 'A. Accept buyer ask',
      scenarioType: 'buyer_offer',
      strategy: 'Accept Carrefour at 4.2%. This is likely accepted by the buyer but creates unacceptable margin and red-line pressure in France.',
      priceMovePct: 4.2,
      concessionPct: 0.0,
      tradeSpendChangePct: 0,
      marginImpactPct: -1.8,
      gapToTargetPct: -0.7,
      gapToRedLinePct: -1.2,
      acceptanceLikelihood: 'high',
      recommended: false,
      levers: [],
      netRevenueImpactEuros: -1800000,
      grossMarginImpactBps: -180,
      volumeImpactPct: 2.5,
      probabilityToLandPct: 86,
      sanctionRisk: 'low',
      redLineProximity: 'breach',
      confidence: 'medium',
      assumptions: ['Buyer accepts if PepsiCo moves to 4.2%.', 'Margin compression in France is not offset.'],
      recommendedUseCase: 'Not recommended: likely lands the buyer but breaches the France guardrail.'
    },
    {
      id: 'scenario-counter-3',
      name: 'B. Counter at 3.0%',
      scenarioType: 'ai_recommended',
      strategy: 'Counter at 3.0% and pair the move with a volume-upside argument. This protects margin while staying close enough to the buyer acceptance range.',
      priceMovePct: 3.0,
      concessionPct: 1.2,
      tradeSpendChangePct: 0.2,
      marginImpactPct: 0.4,
      gapToTargetPct: 0.5,
      gapToRedLinePct: 0,
      acceptanceLikelihood: 'medium',
      recommended: true,
      levers: ['phased-timing', 'promo-calendar-control', 'innovation-visibility'],
      netRevenueImpactEuros: 3600000,
      grossMarginImpactBps: 40,
      volumeImpactPct: 5.5,
      probabilityToLandPct: 64,
      sanctionRisk: 'medium',
      redLineProximity: 'watch',
      confidence: 'medium',
      assumptions: ['Germany volume uplift can reach 8%.', 'Buyer acceptance range is 3.0-3.4%.', 'Commodity and packaging pressure persists.'],
      recommendedUseCase: 'Recommended: best balance of margin protection, buyer acceptance, and defensible argument quality.'
    },
    {
      id: 'scenario-hold',
      name: 'C. Hold at 2.5%',
      scenarioType: 'hold_firm',
      strategy: 'Hold the prior 2.5% counter. This protects margin but increases rejection, silence, and escalation risk.',
      priceMovePct: 2.5,
      concessionPct: 1.7,
      tradeSpendChangePct: 0,
      marginImpactPct: 0.9,
      gapToTargetPct: 1.0,
      gapToRedLinePct: 0.5,
      acceptanceLikelihood: 'low',
      recommended: false,
      levers: ['innovation-visibility'],
      netRevenueImpactEuros: 4400000,
      grossMarginImpactBps: 90,
      volumeImpactPct: -2.0,
      probabilityToLandPct: 34,
      sanctionRisk: 'high',
      redLineProximity: 'safe',
      confidence: 'medium',
      assumptions: ['Buyer will tolerate another firm counter.', 'Promo exclusion threat remains manageable.'],
      recommendedUseCase: 'Use only if leadership prioritizes margin protection over buyer acceptance risk.'
    },
    {
      id: 'scenario-tradeoff',
      name: 'D. 3.2% with promo phasing',
      scenarioType: 'tradeoff',
      strategy: 'Counter at 3.2% with Q4 promo phasing. Potentially viable, but requires finance approval and validation of promo funding.',
      priceMovePct: 3.2,
      concessionPct: 1.0,
      tradeSpendChangePct: 0.5,
      marginImpactPct: 0.1,
      gapToTargetPct: 0.3,
      gapToRedLinePct: -0.2,
      acceptanceLikelihood: 'medium',
      recommended: false,
      levers: ['phased-timing', 'promo-calendar-control'],
      netRevenueImpactEuros: 3200000,
      grossMarginImpactBps: 10,
      volumeImpactPct: 6.5,
      probabilityToLandPct: 68,
      sanctionRisk: 'medium',
      redLineProximity: 'watch',
      confidence: 'low',
      assumptions: ['Promo phasing is available in Q4.', 'Finance approves incremental promo support.', 'Buyer values phasing more than a pure price move.'],
      recommendedUseCase: 'Potential fallback: viable only if finance accepts promo phasing and the buyer rejects 3.0%.'
    }
  ],
  levers: [
    {
      id: 'phased-timing',
      type: 'phasing',
      label: 'Phase timing over two windows',
      owner: 'CNO',
      availability: 'available',
      costEuros: 850000,
      expectedCustomerValue: 'Gives Carrefour a softer shelf-price transition without permanent red-line erosion.',
      timing: 'Q1 and Q2 windows',
      control: 'central',
      redLineImpact: 'Preserves the 3.0% France red line if phase two is locked.',
      escalationTrigger: 'Escalate if customer asks to make the phase permanent.'
    },
    {
      id: 'promo-calendar-control',
      type: 'promo',
      label: 'Controlled promo calendar support',
      owner: 'KAM',
      availability: 'approval_required',
      costEuros: 620000,
      expectedCustomerValue: 'Creates visible shopper value without changing base price architecture.',
      timing: 'Back-to-school and Q4 moments',
      control: 'joint',
      redLineImpact: 'Watch margin leakage if stacked with price concession.',
      escalationTrigger: 'Escalate if requested outside approved windows.'
    },
    {
      id: 'innovation-visibility',
      type: 'innovation',
      label: 'Innovation visibility commitment',
      owner: 'CAM',
      availability: 'available',
      costEuros: 260000,
      expectedCustomerValue: 'Supports retailer growth story and category premiumization.',
      timing: 'H1 sell-in',
      control: 'local',
      redLineImpact: 'Low direct red-line impact; proof needed on customer value.',
      escalationTrigger: 'Escalate if exchanged for permanent trade-margin give.'
    },
    {
      id: 'sanction-mitigation',
      type: 'sanction_mitigation',
      label: 'Sanction mitigation plan',
      owner: 'Leadership',
      availability: 'approval_required',
      costEuros: 1200000,
      expectedCustomerValue: 'Creates continuity path if delisting or visibility threat becomes credible.',
      timing: 'Only after explicit threat',
      control: 'central',
      redLineImpact: 'High risk if used before leadership approval.',
      escalationTrigger: 'Any delisting, reduced visibility, or buying-group pressure language.'
    },
    {
      id: 'local-scope-trade',
      type: 'scope',
      label: 'Local scope trade',
      owner: 'KAM',
      availability: 'approval_required',
      costEuros: 480000,
      expectedCustomerValue: 'Lets local teams trade executional commitments without reopening central strategy.',
      timing: 'Post-alignment only',
      control: 'local',
      redLineImpact: 'Must not expose central fallback thresholds.',
      escalationTrigger: 'Escalate if customer links local scope to base-price reduction.'
    }
  ],
  pushbackMap: [
    {
      id: 'commodity-deflation',
      objection: 'Affordability and shelf-price pressure',
      likelyArgument: 'Carrefour may argue French shoppers cannot absorb another increase while private label is cheaper.',
      affectedMarket: 'France',
      affectedCategory: 'Salty Snacks',
      quantifiedExposure: 'Accepting the 4.2% ask creates negative margin pressure and breaches the France red line.',
      recommendedResponse: 'Acknowledge affordability pressure, counter at 3.0%, and pair the counter with volume upside plus Q4 promo phasing rather than internal margin language.',
      evidenceIds: ['commodity-bridge', 'margin-waterfall'],
      confidence: 'medium',
      watchOut: 'Do not imply commodity proof alone explains the full price ask.'
    },
    {
      id: 'trade-margin-pressure',
      objection: 'Private label and competitor price gap',
      likelyArgument: 'Customer claims PepsiCo shelf price is less competitive than private label or competitor A.',
      affectedMarket: 'France',
      affectedCategory: 'Salty Snacks',
      quantifiedExposure: 'Could weaken acceptance of the 3.0% counter unless evidence shows volume and category upside.',
      recommendedResponse: 'Use competitive shelf context and historical acceptance range. Keep the counter data-led and avoid opening with PepsiCo margin constraints.',
      evidenceIds: ['trade-margin-map', 'scenario-b-proof'],
      confidence: 'high',
      watchOut: 'Escalate if customer asks for permanent trade-margin relief.'
    },
    {
      id: 'sanction-threat',
      objection: 'Promo exclusion or buyer silence',
      likelyArgument: 'Customer may go quiet or hint at reduced promo participation if PepsiCo holds firm.',
      affectedMarket: 'France',
      affectedCategory: 'Salty Snacks',
      quantifiedExposure: 'Medium-high risk because buyer has been silent for 14 days and response is due Mar 28.',
      recommendedResponse: 'Prepare sanction response, keep 3.0% counter active, and escalate if promo exclusion becomes explicit.',
      evidenceIds: ['sanction-history', 'scenario-c-watchout'],
      confidence: 'medium',
      watchOut: 'Do not approve sanction mitigation without leadership confirmation.'
    }
  ],
  evidenceClaims: [
    {
      id: 'commodity-bridge',
      claim: 'Potato and packaging costs remain elevated enough to support a defended pricing position.',
      label: 'sourced_fact',
      source: 'Commodity and packaging pressure packet',
      freshness: '2026-03-20',
      confidence: 'high',
      audienceSafe: ['cno_internal', 'leadership_safe', 'kam_safe']
    },
    {
      id: 'trade-margin-map',
      claim: 'Carrefour is anchoring on consumer affordability and competitive shelf position in France.',
      label: 'user_assumption',
      source: 'Latest debrief extraction',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium',
      audienceSafe: ['cno_internal', 'leadership_safe', 'kam_safe']
    },
    {
      id: 'margin-waterfall',
      claim: 'Countering at 3.0% protects the France red line while keeping the buyer within a likely acceptance range.',
      label: 'modeled_estimate',
      source: 'ATLAS scenario model v0.1',
      freshness: 'Calculated from current packet',
      confidence: 'high',
      audienceSafe: ['cno_internal', 'leadership_safe']
    },
    {
      id: 'scenario-b-proof',
      claim: '2025 Carrefour pattern suggests the buyer accepted after volume upside was introduced.',
      label: 'sourced_fact',
      source: 'Historical negotiation tracker stand-in',
      freshness: 'Captured 2025-03-15',
      confidence: 'medium',
      audienceSafe: ['cno_internal', 'leadership_safe', 'kam_safe']
    },
    {
      id: 'sanction-history',
      claim: 'Buyer silence for 14 days and hinted promo exclusion make sanction risk medium-high.',
      label: 'user_assumption',
      source: 'Debrief plus response deadline rule',
      freshness: 'Entered 2026-03-22',
      confidence: 'medium',
      audienceSafe: ['cno_internal', 'leadership_safe']
    },
    {
      id: 'customer-safe-value-story',
      claim: 'Buyer-facing argument should lead with affordability, volume upside, and Q4 promo phasing.',
      label: 'modeled_estimate',
      source: 'ATLAS customer-safe narrative template',
      freshness: 'Generated from current packet',
      confidence: 'medium',
      audienceSafe: ['cno_internal', 'leadership_safe', 'kam_safe', 'customer_safe']
    }
  ],
  debriefCaptures: [
    {
      id: 'debrief-2026-03-22',
      title: 'Post-meeting debrief: buyer counter at 4.2%',
      capturedAt: '2026-03-22 16:20 CET',
      captureMode: 'demo',
      rawNotes: 'Carrefour rejected the prior 2.5% counter and returned at 4.2%, citing affordability pressure in France and competitive shelf pricing. Promo exclusion was implied but not confirmed. Germany volume uplift was discussed but not quantified.',
      extractedAsks: ['Buyer counteroffer at 4.2%.', 'Move closer to the France affordability position.'],
      concessions: ['Q4 promo phasing discussed but not approved.'],
      pricingNumbers: ['4.2% buyer counter', '2.5% prior PepsiCo counter'],
      decisions: ['Keep Scenario B counter at 3.0% as ATLAS recommended path pending validation.'],
      openQuestions: ['Germany volume uplift was discussed but not quantified.', 'Promo exclusion was implied but not confirmed.'],
      nextSteps: ['Validate Germany 8% volume uplift with finance.', 'Generate buyer-facing argument for 3.0% counter.', 'Prepare response by Mar 28.'],
      scenarioAssumptionUpdates: ['Sanction risk moved from medium to medium-high.', 'Scenario B remains recommended but confidence stays medium.'],
      confidence: 'medium'
    }
  ],
  timelineEvents: [
    {
      id: 'timeline-initial-strategy',
      date: '2026-03-15',
      kind: 'scenario_change',
      title: 'Pricing position created',
      detail: 'CNO team defined 3.5% target, 3.0% red line, and 3.8% recommended anchor for Carrefour France.',
      whatChanged: 'Established the guardrails used to evaluate the latest buyer counter.',
      relatedScenarioId: 'scenario-counter-3',
      evidenceIds: ['scenario-b-proof', 'margin-waterfall'],
      source: {
        value: 'Scenario selection note',
        label: 'user_assumption',
        source: 'CNO working scenario note',
        freshness: 'Entered 2026-03-15',
        confidence: 'medium'
      }
    },
    {
      id: 'timeline-trade-margin',
      date: '2026-03-22',
      kind: 'counteroffer',
      title: 'Buyer counter increased to 4.2%',
      detail: 'Carrefour rejected the prior 2.5% counter and came back at 4.2%, citing affordability pressure and competitive shelf pricing.',
      whatChanged: 'Counter increased from 3.8% to 4.2%. Sanction risk increased from medium to medium-high; Scenario B remains recommended but confidence dropped due to unvalidated Germany volume assumption.',
      relatedScenarioId: 'scenario-counter-3',
      evidenceIds: ['trade-margin-map'],
      source: {
        value: 'Post-meeting debrief',
        label: 'user_assumption',
        source: 'KAM debrief notes',
        freshness: 'Captured 2026-03-22',
        confidence: 'medium'
      }
    },
    {
      id: 'timeline-sanction-watch',
      date: '2026-03-22',
      kind: 'risk',
      title: 'Promo exclusion risk moved to watch',
      detail: 'Buyer hinted at reduced promo participation if PepsiCo does not move closer to the ask.',
      whatChanged: 'Risk drawer should show medium-high promo exclusion risk and mitigation options.',
      relatedScenarioId: 'scenario-counter-3',
      evidenceIds: ['sanction-history'],
      source: {
        value: 'CNO working risk rule',
        label: 'user_assumption',
        source: 'CNO escalation guardrail',
        freshness: 'Entered 2026-03-22',
        confidence: 'medium'
      }
    }
  ],
  missingInformationTasks: [
    {
      id: 'task-carrefour-response',
      title: 'Carrefour counteroffer response',
      reason: 'Response is due Mar 28 and the 4.2% buyer ask breaches the France guardrail.',
      owner: 'CNO',
      priority: 'high',
      deadline: '2026-03-28',
      riskLevel: 'high',
      recommendedAction: 'Review Scenario B and generate buyer-facing argument.',
      relatedTimelineEventId: 'timeline-trade-margin',
      status: 'ready_to_review'
    },
    {
      id: 'task-germany-offset',
      title: 'Validate Germany volume assumption',
      reason: 'Scenario B depends on 8% Germany volume uplift that has not been validated.',
      owner: 'Finance',
      priority: 'high',
      deadline: '2026-03-26',
      riskLevel: 'medium',
      recommendedAction: 'Confirm latest forecast before approving the recommended counter.',
      status: 'ready_to_review'
    },
    {
      id: 'task-france-approval',
      title: 'France red-line approval needed',
      reason: 'Any move above the 3.0% red line requires explicit CNO approval.',
      owner: 'CNO',
      priority: 'high',
      deadline: '2026-03-27',
      riskLevel: 'high',
      recommendedAction: 'Approve Scenario B or mark the recommendation as not approved.',
      status: 'ready_to_review'
    },
    {
      id: 'task-promo-phasing',
      title: 'Promo-phasing tradeoff finance review',
      reason: 'Scenario D could work only if finance accepts Q4 promo phasing support.',
      owner: 'Finance',
      priority: 'medium',
      deadline: '2026-03-27',
      riskLevel: 'medium',
      recommendedAction: 'Review Scenario D as fallback, not primary recommendation.',
      status: 'ready_to_review'
    }
  ],
  externalRiskFactors: [
    {
      id: 'risk-retailer-action',
      title: 'Retailer visibility or delisting pressure',
      riskType: 'retailer_action',
      relevance: 'If Carrefour turns price pressure into visibility pressure, Scenario B needs escalation handling before any additional give.',
      source: {
        value: 'Retailer action risk modeled from public standoff patterns and internal watch rule.',
        label: 'modeled_estimate',
        source: 'ATLAS external-risk placeholder',
        freshness: 'Prototype 2026-07-07',
        confidence: 'medium'
      }
    },
    {
      id: 'risk-commodity-proof',
      title: 'Commodity deflation challenge',
      riskType: 'market_pressure',
      relevance: 'Customer may use commodity movement to reject the headline ask; response needs total cost-to-serve proof.',
      source: {
        value: 'Commodity proof is modeled until source packet is connected.',
        label: 'modeled_estimate',
        source: 'Mintec/Expana proxy',
        freshness: 'Prototype packet 2026-07-06',
        confidence: 'medium'
      }
    },
    {
      id: 'risk-tax-change',
      title: 'Local tax or regulatory pressure',
      riskType: 'tax_change',
      relevance: 'Local market pressure could alter shelf-price defensibility and should be pressure-tested before final approval.',
      source: {
        value: 'External factor not yet verified for current demo.',
        label: 'unknown_gap',
        source: 'External research gap',
        freshness: 'Gap logged 2026-07-07',
        confidence: 'low'
      }
    }
  ],
  strategyUpdates: [
    {
      id: 'strategy-update-v3',
      version: 'v3',
      date: '2026-03-22 16:20 CET',
      summary: 'Strategy updated after Carrefour moved to a 4.2% buyer ask and hinted at promo exposure pressure.',
      triggeredBy: 'Post-meeting debrief: buyer counter at 4.2%',
      changes: [
        'Added 3.2% fallback with Q4 promo phasing.',
        'Increased promo exposure risk to watch.',
        'Marked Germany volume recovery as needs validation.',
        'Kept 3.0% counter as recommended position.'
      ],
      signoffNeeded: 'Finance validation on Germany volume uplift before CNO approval.',
      debriefImpact: 'Latest debrief reduced confidence from high to medium because promo exclusion was implied but not confirmed.',
      source: {
        value: 'Strategy update derived from latest debrief and Scenario B model.',
        label: 'user_assumption',
        source: 'KAM debrief notes + ATLAS scenario model',
        freshness: 'Captured 2026-03-22',
        confidence: 'medium'
      }
    },
    {
      id: 'strategy-update-v2',
      version: 'v2',
      date: '2026-03-15 11:00 CET',
      summary: 'Initial Carrefour response strategy set target, red line, and value-protection scenario.',
      triggeredBy: 'Pricing position created',
      changes: [
        'Set PepsiCo target at 3.5%.',
        'Set France red line at 3.0%.',
        'Built base scenario around volume-upside argument.',
        'Identified private label shelf gap as expected objection.'
      ],
      signoffNeeded: 'CNO alignment on red-line guardrail.',
      debriefImpact: 'No debrief impact yet; strategy was based on prep packet and prior-year pattern.',
      source: {
        value: 'Initial strategy selection note.',
        label: 'user_assumption',
        source: 'CNO working strategy note',
        freshness: 'Entered 2026-03-15',
        confidence: 'medium'
      }
    }
  ]
};

export function getScenario(record: NegotiationRecord, scenarioId = record.activeScenarioId) {
  return record.scenarios.find((scenario) => scenario.id === scenarioId) ?? record.scenarios[0];
}

export const demoStrategyWorkspaces: StrategyWorkspaceSummary[] = [
  {
    id: 'strategy-carrefour-eurelec-2026',
    recordId: demoNegotiation.id,
    buyingGroup: 'Eurelec / Carrefour Group',
    primaryMarket: 'France',
    strategyVersion: 'v2.3 draft',
    stageLabel: 'Annual pricing strategy',
    latestBuyerPosition: 'Buyer countered at 4.2% in France',
    riskLevel: 'high',
    signoffStatus: 'needs_review',
    changedSinceLastOpen: 'Buyer silence reached 14 days and promo exclusion risk moved to watch.',
    nextAction: 'Validate Germany volume offset, then defend the 3.0% counter with deck-ready proof.',
    updatedAt: 'Updated Mar 22, 16:20 CET'
  },
  {
    id: 'strategy-everest-dach-2026',
    recordId: demoNegotiation.id,
    buyingGroup: 'Everest Buying Group',
    primaryMarket: 'Germany',
    strategyVersion: 'v1.7 working',
    stageLabel: 'Cross-market tradeoff',
    latestBuyerPosition: 'DACH ask holding near 3.8%',
    riskLevel: 'medium',
    signoffStatus: 'draft',
    changedSinceLastOpen: 'Hard-discount comparator added to the proof queue.',
    nextAction: 'Build Germany volume recovery visual and compare against France corridor.',
    updatedAt: 'Prototype update Jul 07'
  },
  {
    id: 'strategy-rewe-2026',
    recordId: demoNegotiation.id,
    buyingGroup: 'REWE Group',
    primaryMarket: 'Germany',
    strategyVersion: 'v0.9 prep',
    stageLabel: 'Negotiation prep',
    latestBuyerPosition: 'No formal counter captured yet',
    riskLevel: 'medium',
    signoffStatus: 'draft',
    changedSinceLastOpen: 'Commodity proof needs refresh before strategy lock.',
    nextAction: 'Pull shelf price comparison and create prep visual.',
    updatedAt: 'Prototype update Jul 07'
  }
];

export const demoStrategyWatchouts: StrategyWatchout[] = [
  {
    id: 'watchout-carrefour-silence',
    title: 'Carrefour response window tightening',
    detail: 'Buyer has been silent for 14 days with response due Mar 28; sanction language should be monitored live.',
    riskLevel: 'high',
    whyItMatters: 'The strategy depends on staying proof-led; silence may turn into deadline pressure or visibility leverage.',
    status: 'deadline',
    action: 'Start Live Negotiator or review debrief before the Mar 28 response window.',
    source: {
      value: 'Latest debrief and response-deadline rule',
      label: 'user_assumption',
      source: 'KAM debrief notes + CNO escalation guardrail',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'watchout-germany-offset',
    title: 'Germany offset not validated',
    detail: 'Scenario B depends on 8% Germany volume uplift; finance has not validated the latest forecast.',
    riskLevel: 'medium',
    whyItMatters: 'The recommended counter is only approval-ready if the offset logic survives finance review.',
    status: 'needs_validation',
    action: 'Ask finance to confirm the latest Germany forecast before generating the final strategy deck.',
    source: {
      value: 'Scenario B offset assumption',
      label: 'user_assumption',
      source: 'CNO working offset assumption',
      freshness: 'Entered 2026-03-22',
      confidence: 'low'
    }
  },
  {
    id: 'watchout-commodity-proof',
    title: 'Commodity proof may be challenged',
    detail: 'Customer may use commodity movement to reject the headline ask; refresh cost pressure visual before sharing.',
    riskLevel: 'medium',
    whyItMatters: 'The sell story needs credible proof, but it should not over-rely on cost inflation alone.',
    status: 'watch',
    action: 'Refresh the cost pressure stack and pair it with category value proof.',
    source: {
      value: 'Cost-pressure evidence gap',
      label: 'modeled_estimate',
      source: 'Mintec/Expana proxy',
      freshness: 'Prototype packet 2026-07-06',
      confidence: 'medium'
    }
  },
  {
    id: 'watchout-private-label',
    title: 'Private label pressure active in France',
    detail: 'Carrefour is using private label affordability as a negotiation anchor.',
    riskLevel: 'medium',
    whyItMatters: 'If the team cannot show branded value and volume upside, the buyer can frame the counter as consumer-unfriendly.',
    status: 'watch',
    action: 'Add shelf-price comparison to the buyer-facing deck visual queue.',
    source: {
      value: 'Private label pressure identified from latest debrief.',
      label: 'user_assumption',
      source: 'Latest debrief extraction + Nielsen stand-in',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'watchout-cost-support',
    title: 'Commodity data still supports price defense',
    detail: 'Cost and packaging pressure continue to support a defended position, with confidence caveated by prototype source freshness.',
    riskLevel: 'low',
    whyItMatters: 'This is one of the proof pillars that keeps the 3.0% counter defensible.',
    status: 'supports_strategy',
    action: 'Keep cost pressure in the evidence pack, but lead with shopper and category value.',
    source: {
      value: 'Cost pressure supports defended counter.',
      label: 'modeled_estimate',
      source: 'Mintec/Expana proxy plus CNO target file',
      freshness: 'Prototype packet 2026-03-22',
      confidence: 'medium'
    }
  }
];

export const demoVisualEvidenceModules: VisualEvidenceModule[] = [
  {
    id: 'visual-pricing-corridor',
    title: 'France pricing corridor strip',
    moduleType: 'pricing_corridor',
    deckUse: 'Defending target and red line',
    keyTakeaway: 'Carrefour 4.2% ask is outside the France guardrail; 3.0% counter protects the strategy.',
    proofMetrics: [
      { label: 'Buyer ask', value: '4.2%', note: 'France latest customer position', status: 'watch', sourceLabel: 'user_assumption' },
      { label: 'Target', value: '3.5%', note: 'CNO 2026 target file', status: 'supports', sourceLabel: 'sourced_fact' },
      { label: 'Red line', value: '3.0%', note: 'Current CNO guardrail', status: 'supports', sourceLabel: 'user_assumption' },
      { label: 'Margin floor', value: '30.8%', note: 'ATLAS corridor estimate', status: 'supports', sourceLabel: 'modeled_estimate' }
    ],
    source: demoNegotiation.pricingPosition.redLinePriceIncreasePct
  },
  {
    id: 'visual-cost-pressure',
    title: 'Cost pressure stack',
    moduleType: 'cost_pressure_stack',
    deckUse: 'Supporting the sell story',
    keyTakeaway: 'Commodity and packaging pressure support a defended counter, but buyer-facing story should stay value-led.',
    proofMetrics: [
      { label: 'Input cost pressure', value: '+2.4%', note: 'Commodity and packaging proxy', status: 'supports', sourceLabel: 'modeled_estimate' },
      { label: 'Packaging index', value: '106.8', note: 'EU corrugate and film proxy', status: 'supports', sourceLabel: 'modeled_estimate' },
      { label: 'Commodity freshness', value: '22 Mar', note: 'Needs refresh before final deck', status: 'watch', sourceLabel: 'unknown_gap' },
      { label: 'Price defense coverage', value: '68%', note: 'Modeled share of 3.0% counter supported by cost bridge', status: 'supports', sourceLabel: 'modeled_estimate' }
    ],
    source: {
      value: 'Cost pressure proof module',
      label: 'modeled_estimate',
      source: 'Mintec/Expana proxy plus CNO target file',
      freshness: 'Prototype packet 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'visual-shelf-price',
    title: 'Private label / shelf price comparison',
    moduleType: 'shelf_price_comparison',
    deckUse: 'Private label and competitor challenge',
    keyTakeaway: 'Use competitive shelf context with volume upside; avoid opening with internal margin constraints.',
    proofMetrics: [
      { label: 'Private label gap', value: '-18%', note: 'Shelf price gap vs Carrefour private label', status: 'watch', sourceLabel: 'user_assumption' },
      { label: 'PepsiCo index', value: '112', note: 'Branded shelf price index, France proxy', status: 'supports', sourceLabel: 'modeled_estimate' },
      { label: 'Buyer pressure', value: 'High', note: 'Affordability flagged in latest debrief', status: 'watch', sourceLabel: 'user_assumption' },
      { label: 'Volume upside case', value: '+0.8%', note: 'Modeled with Q4 activation support', status: 'supports', sourceLabel: 'modeled_estimate' }
    ],
    source: {
      value: 'Competitive shelf position proof',
      label: 'user_assumption',
      source: 'Latest debrief extraction + Nielsen stand-in',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'visual-promo-exposure',
    title: 'Promo exposure card',
    moduleType: 'promo_exposure',
    deckUse: 'Pressure-test buyer visibility risk',
    keyTakeaway: 'Promo exclusion is implied, not confirmed; mitigation should remain gated until exact language is captured.',
    proofMetrics: [
      { label: 'Promo weeks at risk', value: '9', note: 'Potential Q4 feature/display weeks', status: 'watch', sourceLabel: 'user_assumption' },
      { label: 'NR exposure', value: '€4.8M', note: 'Modeled France promotional revenue exposure', status: 'watch', sourceLabel: 'modeled_estimate' },
      { label: 'Confirmed language', value: 'No', note: 'Exact customer sanction wording still missing', status: 'gap', sourceLabel: 'unknown_gap' },
      { label: 'Mitigation lever', value: 'Q4 phasing', note: 'Approval-gated fallback lever', status: 'supports', sourceLabel: 'user_assumption' }
    ],
    source: {
      value: 'Promo visibility risk proof',
      label: 'user_assumption',
      source: 'KAM debrief notes + CNO escalation guardrail',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'visual-scenario-mini',
    title: 'Scenario mini-card',
    moduleType: 'scenario_mini_card',
    deckUse: 'Show recommended move and fallback',
    keyTakeaway: '3.0% counter remains the recommended position; 3.2% with Q4 phasing is a finance-gated fallback.',
    proofMetrics: [
      { label: 'Recommended counter', value: '3.0%', note: 'Base working position', status: 'supports', sourceLabel: 'modeled_estimate' },
      { label: 'Fallback move', value: '3.2%', note: 'With Q4 promo phasing', status: 'supports', sourceLabel: 'modeled_estimate' },
      { label: 'GM impact', value: '-18 bps', note: 'Scenario B vs base plan', status: 'watch', sourceLabel: 'modeled_estimate' },
      { label: 'Validation gap', value: 'Germany volume', note: 'Finance validation still required', status: 'gap', sourceLabel: 'unknown_gap' }
    ],
    source: {
      value: 'Scenario B and Scenario D comparison',
      label: 'modeled_estimate',
      source: 'ATLAS Scenario Decision Lab',
      freshness: 'Generated 2026-03-22',
      confidence: 'medium'
    }
  }
];

export const demoStrategyRecentOutputs: StrategyRecentOutput[] = [
  {
    id: 'output-pricing-corridor',
    title: 'France pricing corridor visual',
    outputType: 'deck_visual',
    detail: 'Deck-ready strip for buyer ask, target, red line, and recommended counter.',
    href: `/negotiation/${demoNegotiation.id}#visual-evidence`,
    updatedAt: 'Generated Mar 22',
    confidence: 'high'
  },
  {
    id: 'output-scenario-b',
    title: 'Strategy stress test: value protection',
    outputType: 'scenario',
    detail: '3.0% counter tested against volume upside, promo calendar control, and validation gates.',
    href: `/negotiation/${demoNegotiation.id}?panel=scenario&stressMove=hold#scenario`,
    updatedAt: 'Updated Mar 22',
    confidence: 'medium'
  },
  {
    id: 'output-debrief',
    title: 'Post-meeting debrief extraction',
    outputType: 'debrief',
    detail: 'Captured buyer 4.2% ask, promo-risk hint, open Germany offset question, and next steps.',
    href: `/negotiation/${demoNegotiation.id}#debrief`,
    updatedAt: 'Captured Mar 22',
    confidence: 'medium'
  }
];
