import { demoNegotiation, demoVisualEvidenceModules, getScenario } from './demo-data';
import type {
  BuyerReactionPrediction,
  StrategyBuilderPathId,
  StrategyBuilderState,
  StrategyEditableAssumption,
  StrategyPathModule,
  StrategyRevisionProposal,
  StrategySignal,
  SupportingStrategyDocument
} from './types';

export type StrategyBuilderMutation = {
  activePathStep: StrategyBuilderPathId;
  assistantMessage: string;
  proposal: StrategyRevisionProposal;
};

export const strategyPathOrder: Array<{ id: StrategyBuilderPathId; label: string; intent: string }> = [
  { id: 'thesis', label: 'Strategy', intent: 'Current position and why it holds' },
  { id: 'buyer_reaction', label: 'Buyer Response', intent: 'Likely Carrefour pushback' },
  { id: 'evidence', label: 'Proof', intent: 'Evidence and source strength' },
  { id: 'scenario_pressure', label: 'Scenarios', intent: 'Compare pricing moves and lever tradeoffs' },
  { id: 'market_signals', label: 'Market Signals', intent: 'World and customer signals' },
  { id: 'readiness', label: 'Readiness', intent: 'Validation and output safety' }
];

export const initialEditableAssumptions: StrategyEditableAssumption[] = [
  {
    id: 'buyer-ask',
    label: 'Buyer ask',
    value: demoNegotiation.pricingPosition.currentCustomerAskPct.value,
    unit: '%',
    priorValue: demoNegotiation.pricingPosition.currentCustomerAskPct.value,
    sourceLabel: demoNegotiation.pricingPosition.currentCustomerAskPct.label,
    source: demoNegotiation.pricingPosition.currentCustomerAskPct.source,
    freshness: demoNegotiation.pricingPosition.currentCustomerAskPct.freshness,
    confidence: demoNegotiation.pricingPosition.currentCustomerAskPct.confidence,
    validationState: 'validated'
  },
  {
    id: 'target',
    label: 'PepsiCo target',
    value: demoNegotiation.pricingPosition.targetPriceIncreasePct.value,
    unit: '%',
    priorValue: demoNegotiation.pricingPosition.targetPriceIncreasePct.value,
    sourceLabel: demoNegotiation.pricingPosition.targetPriceIncreasePct.label,
    source: demoNegotiation.pricingPosition.targetPriceIncreasePct.source,
    freshness: demoNegotiation.pricingPosition.targetPriceIncreasePct.freshness,
    confidence: demoNegotiation.pricingPosition.targetPriceIncreasePct.confidence,
    validationState: 'validated'
  },
  {
    id: 'red-line',
    label: 'Red line',
    value: demoNegotiation.pricingPosition.redLinePriceIncreasePct.value,
    unit: '%',
    priorValue: demoNegotiation.pricingPosition.redLinePriceIncreasePct.value,
    sourceLabel: demoNegotiation.pricingPosition.redLinePriceIncreasePct.label,
    source: demoNegotiation.pricingPosition.redLinePriceIncreasePct.source,
    freshness: demoNegotiation.pricingPosition.redLinePriceIncreasePct.freshness,
    confidence: demoNegotiation.pricingPosition.redLinePriceIncreasePct.confidence,
    validationState: 'needs_validation'
  },
  {
    id: 'current-counter',
    label: 'Current counter',
    value: demoNegotiation.recommendedCounterPct.value,
    unit: '%',
    priorValue: demoNegotiation.recommendedCounterPct.value,
    sourceLabel: demoNegotiation.recommendedCounterPct.label,
    source: demoNegotiation.recommendedCounterPct.source,
    freshness: demoNegotiation.recommendedCounterPct.freshness,
    confidence: demoNegotiation.recommendedCounterPct.confidence,
    validationState: 'needs_validation'
  },
  {
    id: 'fallback',
    label: 'Fallback',
    value: 3.2,
    unit: '%',
    priorValue: 3.2,
    sourceLabel: 'modeled_estimate',
    source: 'ATLAS Scenario Decision Lab',
    freshness: 'Generated 2026-03-22',
    confidence: 'medium',
    validationState: 'needs_validation'
  },
  {
    id: 'trade-spend',
    label: 'Trade spend',
    value: 0.4,
    unit: '%',
    priorValue: 0.4,
    sourceLabel: 'modeled_estimate',
    source: 'Q4 promo phasing model',
    freshness: 'Generated 2026-03-22',
    confidence: 'medium',
    validationState: 'needs_validation'
  },
  {
    id: 'volume',
    label: 'Volume assumption',
    value: 0.8,
    unit: '%',
    priorValue: 0.8,
    sourceLabel: 'modeled_estimate',
    source: 'Scenario B volume bridge',
    freshness: 'Generated 2026-03-22',
    confidence: 'medium',
    validationState: 'needs_validation'
  },
  {
    id: 'margin-impact',
    label: 'Margin impact',
    value: -18,
    unit: 'bps',
    priorValue: -18,
    sourceLabel: 'modeled_estimate',
    source: 'ATLAS pricing corridor stand-in',
    freshness: 'Generated 2026-03-22',
    confidence: 'medium',
    validationState: 'needs_validation'
  },
  {
    id: 'promo-phasing',
    label: 'Promo phasing',
    value: 60,
    unit: '%',
    priorValue: 60,
    sourceLabel: 'user_assumption',
    source: 'CNO Q4 support assumption',
    freshness: 'Entered 2026-03-22',
    confidence: 'low',
    validationState: 'needs_validation'
  },
  {
    id: 'market-offset',
    label: 'Market offset',
    value: 35,
    unit: '%',
    priorValue: 35,
    sourceLabel: 'user_assumption',
    source: 'Germany offset assumption',
    freshness: 'Entered 2026-03-22',
    confidence: 'low',
    validationState: 'needs_validation'
  }
];

export const initialSupportingDocuments: SupportingStrategyDocument[] = [
  {
    id: 'doc-carrefour-prep',
    fileName: 'Carrefour Group 2026 strategy prep deck',
    fileType: 'pptx',
    role: 'prep_deck',
    addedAt: '2026-03-22',
    userNotes: 'Primary placeholder prep packet for the current annual pricing conversation.',
    confidence: 'medium',
    extractedSummary: 'Contains target, red line, cost proof, buyer objections, and early fallback logic.'
  },
  {
    id: 'doc-kam-debrief',
    fileName: 'KAM debrief notes - 4.2% buyer ask',
    fileType: 'notes',
    role: 'notes',
    addedAt: '2026-03-22',
    userNotes: 'Latest meeting notes captured after Carrefour rejected the prior counter.',
    confidence: 'medium',
    extractedSummary: 'Buyer cited France affordability and hinted at reduced promo participation.'
  },
  {
    id: 'doc-finance-bridge',
    fileName: 'Germany volume recovery bridge',
    fileType: 'xlsx',
    role: 'data_export',
    addedAt: '2026-03-21',
    userNotes: 'Placeholder finance source for Germany offset validation.',
    confidence: 'low',
    extractedSummary: 'Open validation: Germany volume recovery is still not finance-approved.'
  }
];

export const demoBuyerReactionPredictions: BuyerReactionPrediction[] = [
  {
    id: 'reaction-affordability',
    likelyObjection: 'Carrefour will frame the 3.0% counter as difficult for French shoppers unless the value story is concrete.',
    historicalBasis: 'Latest debrief and 2025 acceptance pattern both show the buyer moves when price is paired with volume-upside proof.',
    expectedSeverity: 'high',
    confidence: 'medium',
    suggestedEvidence: ['Private label / shelf comparison', 'Cost pressure stack', 'Volume-upside proof']
  },
  {
    id: 'reaction-promo',
    likelyObjection: 'If the buyer presses for Q4 support, they may convert implied promo pressure into a formal condition.',
    historicalBasis: 'Promo exclusion was hinted in the latest debrief but exact sanction language is missing.',
    expectedSeverity: 'medium',
    confidence: 'medium',
    suggestedEvidence: ['Promo exposure readout', 'Q4 phasing model', 'KAM debrief language']
  },
  {
    id: 'reaction-cross-market',
    likelyObjection: 'Carrefour may reject Germany offset logic if France shelf pressure stays the center of the conversation.',
    historicalBasis: 'Buying-group conversations often compare markets, but customer-facing pressure is currently France-led.',
    expectedSeverity: 'medium',
    confidence: 'low',
    suggestedEvidence: ['Germany volume bridge', 'Market-level guardrails', 'Prior cross-market concession pattern']
  }
];

export const demoStrategySignals: StrategySignal[] = [
  {
    id: 'signal-private-label',
    title: 'Private label pressure remains active',
    type: 'competitor_private_label',
    detail: 'Retailer affordability language is still the strongest buyer anchor in France.',
    implication: 'The strategy needs shelf-price proof and a shopper-value argument before any final output.',
    source: {
      value: 'Private label pressure identified from latest debrief and shelf-price proxy.',
      label: 'user_assumption',
      source: 'KAM debrief + Nielsen stand-in',
      freshness: 'Captured 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'signal-cost',
    title: 'Commodity proof still supports defense',
    type: 'commodity',
    detail: 'Cost and packaging pressure support a defended counter, but source freshness needs review.',
    implication: 'Keep cost proof in the strategy, but lead with category value instead of margin language.',
    source: {
      value: 'Cost pressure bridge supports the counter.',
      label: 'modeled_estimate',
      source: 'Mintec/Expana proxy',
      freshness: 'Prototype packet 2026-03-22',
      confidence: 'medium'
    }
  },
  {
    id: 'signal-internal-everest',
    title: 'Everest accepted a phasing-led value story',
    type: 'internal_decision',
    detail: 'Synthetic internal memory: a DACH buying group moved after support was framed as time-boxed phasing, not permanent concession.',
    implication: 'Use Q4 phasing as a gated fallback, not as the primary Carrefour counter.',
    source: {
      value: 'Synthetic internal decision memory for POC.',
      label: 'modeled_estimate',
      source: 'ATLAS internal memory stand-in',
      freshness: 'Prototype 2026-07-09',
      confidence: 'low'
    }
  }
];

export const demoInternalDecisionMemory = [
  {
    id: 'memory-everest',
    buyingGroup: 'Everest Buying Group',
    decision: 'Accepted 3.1% with time-boxed Q4 activation support.',
    reusablePattern: 'Time-boxed support landed better than permanent trade expansion.',
    sensitivity: 'CNO internal only'
  },
  {
    id: 'memory-rewe',
    buyingGroup: 'REWE Group',
    decision: 'Rejected broad market-offset argument without SKU-level shelf proof.',
    reusablePattern: 'Cross-market logic needs local proof before buyer-facing use.',
    sensitivity: 'Leadership-safe summary'
  },
  {
    id: 'memory-emz',
    buyingGroup: 'EMZ comparator',
    decision: 'Finance blocked fallback until volume bridge was validated.',
    reusablePattern: 'Do not approve fallback while Germany volume recovery remains unresolved.',
    sensitivity: 'CNO internal only'
  }
];

function metric(label: string, value: string, sourceLabel: StrategyPathModule['keyMetrics'][number]['sourceLabel'], confidence: 'high' | 'medium' | 'low') {
  return { label, value, sourceLabel, confidence };
}

export function createStrategyPathModules(numbers = initialEditableAssumptions): StrategyPathModule[] {
  const activeScenario = getScenario(demoNegotiation);
  const get = (id: string) => numbers.find((item) => item.id === id)?.value ?? 0;
  const counter = get('current-counter');
  const redLine = get('red-line');
  const target = get('target');
  const ask = get('buyer-ask');
  const trade = get('trade-spend');
  const volume = get('volume');
  const margin = get('margin-impact');
  const readiness = counter < redLine ? 'guardrail breach' : trade > 0.6 ? 'finance validation needed' : 'strategy holds with validation';

  return [
    {
      id: 'thesis',
      title: 'ATLAS recommended strategy thesis',
      generatedAt: 'Live working view',
      recommendation: `Hold ${counter.toFixed(1)}% counter; keep ${get('fallback').toFixed(1)}% as a validation-gated fallback.`,
      narrative: `${demoNegotiation.sellStory.narrative} ATLAS currently reads the move as ${readiness}.`,
      keyMetrics: [
        metric('Buyer ask', `${ask.toFixed(1)}%`, 'user_assumption', 'medium'),
        metric('Target', `${target.toFixed(1)}%`, 'sourced_fact', 'high'),
        metric('Red line', `${redLine.toFixed(1)}%`, 'user_assumption', 'medium'),
        metric('Counter', `${counter.toFixed(1)}%`, 'modeled_estimate', 'medium')
      ],
      validationGaps: [demoNegotiation.blockingIssue, 'Exact promo sanction language still missing.'],
      sourceTrail: demoNegotiation.pricingCorridorInputs.map((input) => ({
        label: input.label,
        source: input.value.source,
        freshness: input.value.freshness,
        confidence: input.value.confidence
      }))
    },
    {
      id: 'buyer_reaction',
      title: 'Predicted Carrefour reaction',
      generatedAt: 'Updated from current assumptions',
      recommendation: counter <= redLine ? 'Expect affordability pressure, but current counter remains defensible.' : 'Higher counter improves acceptance but increases approval dependency.',
      narrative: demoBuyerReactionPredictions[0].likelyObjection,
      keyMetrics: [
        metric('Expected severity', counter <= redLine ? 'High' : 'Medium', 'modeled_estimate', 'medium'),
        metric('Acceptance read', `${calculateStrategyReadout(numbers).acceptancePct}%`, 'modeled_estimate', 'medium'),
        metric('Pressure anchor', 'Affordability', 'user_assumption', 'medium')
      ],
      validationGaps: ['Confirm whether promo pressure is a condition or posture.', 'Validate shopper-value proof before customer-facing use.'],
      sourceTrail: [{ label: 'Historical basis', source: 'Historical negotiation tracker stand-in', freshness: 'Captured 2025-03-15', confidence: 'medium' }]
    },
    {
      id: 'evidence',
      title: 'Evidence ATLAS would use',
      generatedAt: 'Assembled from proof modules',
      recommendation: 'Lead with pricing corridor, cost pressure, shelf comparison, and promo exposure proof.',
      narrative: 'The evidence is strongest around the corridor and cost proof. Private-label and promo exposure remain useful but need exact customer language.',
      keyMetrics: demoVisualEvidenceModules.slice(0, 4).map((module) => metric(module.deckUse, module.proofMetrics[0]?.value ?? 'Ready', module.source.label, module.source.confidence)),
      validationGaps: ['Refresh commodity source before final strategy output.', 'Confirm exact private-label comparison source.'],
      sourceTrail: demoVisualEvidenceModules.map((module) => ({ label: module.title, source: module.source.source, freshness: module.source.freshness, confidence: module.source.confidence }))
    },
    {
      id: 'scenario_pressure',
      title: 'Scenario pressure from editable numbers',
      generatedAt: 'Live model from manual edits',
      recommendation: `${counter.toFixed(1)}% counter produces ${calculateStrategyReadout(numbers).strategyResult}.`,
      narrative: `Trade spend at ${trade.toFixed(1)}%, volume support at ${volume.toFixed(1)}%, and ${margin.toFixed(0)} bps margin impact keep the strategy in a working state, but approval depends on validation.`,
      keyMetrics: [
        metric('Target gap', `${(target - counter).toFixed(1)} pts`, 'modeled_estimate', 'medium'),
        metric('Red-line gap', `${(redLine - counter).toFixed(1)} pts`, 'modeled_estimate', 'medium'),
        metric('Margin', `${margin.toFixed(0)} bps`, 'modeled_estimate', 'medium'),
        metric('Volume support', `${volume.toFixed(1)}%`, 'modeled_estimate', 'medium')
      ],
      validationGaps: activeScenario.assumptions,
      sourceTrail: [{ label: 'Scenario model', source: 'ATLAS Scenario Decision Lab', freshness: 'Generated 2026-03-22', confidence: 'medium' }]
    },
    {
      id: 'market_signals',
      title: 'Market and world signals',
      generatedAt: 'Prototype signal layer',
      recommendation: 'Current external signal set supports a defended position, with private-label pressure as the watch item.',
      narrative: 'ATLAS is tracking commodity proof, public retailer pressure, and internal buying-group memory as the signals most likely to shape this strategy.',
      keyMetrics: demoStrategySignals.map((signal) => metric(signal.title, signal.source.confidence, signal.source.label, signal.source.confidence)),
      validationGaps: ['Connect real public/news feed when production source pipeline is ready.', 'Confirm which internal decisions are safe to reuse.'],
      sourceTrail: demoStrategySignals.map((signal) => ({ label: signal.title, source: signal.source.source, freshness: signal.source.freshness, confidence: signal.source.confidence }))
    },
    {
      id: 'readiness',
      title: 'Strategy readiness and output safety',
      generatedAt: 'Updated from validation state',
      recommendation: calculateStrategyReadout(numbers).readiness,
      narrative: 'CNO can keep working from this strategy, but KAM-safe or customer-safe outputs should hide red lines, margin controls, and confidence gaps until validation is complete.',
      keyMetrics: [
        metric('Readiness', calculateStrategyReadout(numbers).readinessLabel, 'modeled_estimate', calculateStrategyReadout(numbers).confidence),
        metric('Open gaps', `${calculateStrategyReadout(numbers).gapCount}`, 'unknown_gap', 'medium'),
        metric('Audience safety', 'CNO internal', 'user_assumption', 'medium')
      ],
      validationGaps: ['Finance validation on Germany volume recovery.', 'Refresh cost pressure source.', 'Confirm exact buyer sanction language.'],
      sourceTrail: [{ label: 'Readiness source', source: demoNegotiation.sourceReadiness, freshness: demoNegotiation.lastSourceSync, confidence: 'medium' }]
    }
  ];
}

export function createInitialStrategyBuilderState(): StrategyBuilderState {
  return {
    activePathStep: 'thesis',
    currentThesis: demoNegotiation.sellStory.editableDraft,
    selectedNumbers: initialEditableAssumptions,
    uploadedDocs: initialSupportingDocuments,
    manualEdits: [],
    revisions: [],
    validationState: 'needs_validation'
  };
}

export function calculateStrategyReadout(numbers: StrategyEditableAssumption[]) {
  const get = (id: string) => numbers.find((item) => item.id === id)?.value ?? 0;
  const ask = get('buyer-ask');
  const target = get('target');
  const redLine = get('red-line');
  const counter = get('current-counter');
  const fallback = get('fallback');
  const trade = get('trade-spend');
  const volume = get('volume');
  const margin = get('margin-impact');
  const promo = get('promo-phasing');
  const offset = get('market-offset');
  const acceptancePct = Math.round(Math.max(28, Math.min(92,
    56
    + (counter - redLine) * 10
    + trade * 14
    + volume * 1.7
    + (promo - 50) * 0.08
    + (offset - 35) * 0.05
    - Math.max(0, ask - counter - 0.8) * 2.2
  )));
  const gapToTarget = Number((target - counter).toFixed(1));
  const gapToRedLine = Number((redLine - counter).toFixed(1));
  const guardrailBreach = counter < redLine - 0.05 || counter > ask;
  const fallbackBreach = fallback < redLine - 0.05 || fallback > ask + 0.05;
  const fallbackNeedsValidation = fallback > counter + 0.15;
  const needsValidation = trade > 0.55 || offset > 45 || volume > 1.1 || margin < -22 || fallbackNeedsValidation;
  const gapCount = 2 + (needsValidation ? 1 : 0) + (guardrailBreach || fallbackBreach ? 1 : 0);
  const confidence: 'high' | 'medium' | 'low' = guardrailBreach ? 'low' : needsValidation ? 'medium' : 'high';
  const readinessLabel = guardrailBreach || fallbackBreach ? 'Blocked' : needsValidation ? 'Needs validation' : 'Ready to defend';
  const readiness = guardrailBreach || fallbackBreach
    ? 'Blocked: the edited position crosses a guardrail and should not become official.'
    : needsValidation
      ? 'Needs validation: the strategy can be worked, but finance/source checks are required before sign-off.'
      : 'Ready to defend: current assumptions support the working strategy.';
  const strategyResult = guardrailBreach || fallbackBreach ? 'a guardrail breach' : needsValidation ? 'a validation-gated fallback' : 'a defensible working path';

  return { acceptancePct, confidence, gapCount, gapToRedLine, gapToTarget, readiness, readinessLabel, strategyResult };
}

export function inferStrategyBuilderMutation(prompt: string): StrategyBuilderMutation {
  const normalized = prompt.toLowerCase();
  const activePathStep: StrategyBuilderPathId =
    /history|responded|reaction|buyer|carrefour/.test(normalized) ? 'buyer_reaction'
      : /proof|evidence|source|validate|weakest/.test(normalized) ? 'evidence'
        : /scenario|stress|3\.2|trade|volume|margin|red line|redline|number/.test(normalized) ? 'scenario_pressure'
          : /world|news|market|commodity|private label|changed this week|public/.test(normalized) ? 'market_signals'
            : /ready|safe|kam|customer|approval|sign.?off/.test(normalized) ? 'readiness'
              : 'thesis';

  const labelByPath: Record<StrategyBuilderPathId, string> = {
    buyer_reaction: 'buyer reaction',
    evidence: 'evidence',
    market_signals: 'market signals',
    readiness: 'readiness',
    scenario_pressure: 'scenario pressure',
    thesis: 'strategy thesis'
  };

  return {
    activePathStep,
    assistantMessage: `ATLAS routed that into ${labelByPath[activePathStep]} and drafted a strategy update for review.`,
    proposal: {
      id: `revision-${Date.now()}`,
      trigger: prompt,
      proposedChange: mutationTextForPath(activePathStep, prompt),
      affectedModules: [activePathStep],
      affectedNumbers: /3\.2|red line|redline|margin|volume|trade|counter/.test(normalized)
        ? ['Current counter', 'Fallback', 'Trade spend', 'Volume assumption']
        : [],
      status: 'proposed'
    }
  };
}

function mutationTextForPath(path: StrategyBuilderPathId, prompt: string) {
  if (path === 'buyer_reaction') return 'Add buyer-history basis and predicted affordability objection to the working strategy.';
  if (path === 'evidence') return 'Promote the strongest proof points and flag weak sources before output readiness.';
  if (path === 'scenario_pressure') return 'Update the scenario-pressure readout and keep the move in draft until validation.';
  if (path === 'market_signals') return 'Add market and public-signal watch items to the strategy context.';
  if (path === 'readiness') return 'Update readiness gates and audience-safety caveats before any downstream output.';
  return `Refine the strategy thesis using this request: "${prompt}"`;
}
