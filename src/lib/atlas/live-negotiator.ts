import { getBuyingGroup, getMarket, pct } from '@/src/lib/atlas-intelligence/kernel';

export type LiveSignalType =
  | 'buyer_ask'
  | 'pricing_guardrail'
  | 'margin_pressure'
  | 'promo_exposure'
  | 'market_offset'
  | 'strategy_drift'
  | 'cno_request'
  | 'debrief';

export type LiveDetectedSignal = {
  id: string;
  timestamp: string;
  type: LiveSignalType;
  summary: string;
  extractedNumbers: string[];
  sourceMode: 'simulated_listener' | 'manual_command' | 'browser_speech';
  confidence: 'high' | 'medium' | 'low';
  recommendedDocumentType: string;
};

export type LiveGeneratedDocument = {
  id: string;
  sessionId: string;
  title: string;
  documentType: string;
  trigger: string;
  prompt: string;
  createdAt: string;
  confidence: 'high' | 'medium' | 'low';
  sourceFreshness: string;
  openUrl: string;
};

export type LiveNegotiatorSession = {
  id: string;
  buyingGroupId: string;
  prepDeckLabel: string;
  status: 'setup' | 'listening' | 'ended';
  startedAt: string;
  endedAt?: string;
  generatedDocuments: LiveGeneratedDocument[];
  hiddenSignals: LiveDetectedSignal[];
};

export type LiveDebriefReportContext = {
  sessionId: string;
  buyingGroup: string;
  prepDeckLabel: string;
  startedAt: string;
  endedAt: string;
  detectedSignals: LiveDetectedSignal[];
  generatedDocuments: LiveGeneratedDocument[];
};

export type LiveBuyingGroup = {
  id: string;
  name: string;
  region: string;
  activeMarket: string;
  stage: string;
  strategy: string;
};

export const liveBuyingGroups: LiveBuyingGroup[] = [
  {
    id: 'carrefour',
    name: 'Carrefour Group',
    region: 'Western Europe',
    activeMarket: 'France',
    stage: 'Execution',
    strategy: 'Hold 3.0% counter with Q4 promo phasing as a finance-gated fallback.'
  },
  {
    id: 'everest',
    name: 'Everest Buying Group',
    region: 'Pan-European',
    activeMarket: 'Germany',
    stage: 'Strategy alignment',
    strategy: 'Protect margin floor while testing volume recovery offsets across Germany and Benelux.'
  },
  {
    id: 'emdag',
    name: 'EMD Alliance',
    region: 'Central Europe',
    activeMarket: 'Switzerland',
    stage: 'Pre-read',
    strategy: 'Use commodity proof and branded value story before any trade-spend expansion.'
  },
  {
    id: 'auchan',
    name: 'Auchan Retail',
    region: 'France / Iberia',
    activeMarket: 'France',
    stage: 'Buyer counter review',
    strategy: 'Separate base-price defense from temporary promo support to avoid permanent leakage.'
  }
];

export const scriptedLiveSignals: Array<Omit<LiveDetectedSignal, 'timestamp'>> = [
  {
    id: 'signal-buyer-ask',
    type: 'buyer_ask',
    summary: 'Buyer restated a 4.2% France ask and asked whether PepsiCo can move closer before the next governance checkpoint.',
    extractedNumbers: ['Buyer ask 4.2%', 'Current counter 3.0%', 'Target 3.5%'],
    sourceMode: 'simulated_listener',
    confidence: 'high',
    recommendedDocumentType: 'Buyer ask impact readout'
  },
  {
    id: 'signal-guardrail',
    type: 'pricing_guardrail',
    summary: 'Conversation shifted to whether the 3.0% counter is still defensible against the approved pricing corridor.',
    extractedNumbers: ['Red line 3.0%', 'Target 3.5%', 'Fallback 3.2%'],
    sourceMode: 'simulated_listener',
    confidence: 'high',
    recommendedDocumentType: 'Pricing corridor / guardrail visual'
  },
  {
    id: 'signal-margin',
    type: 'margin_pressure',
    summary: 'Buyer asked for more support while finance validation is still open on Germany volume recovery.',
    extractedNumbers: ['Germany volume recovery open', 'Margin pressure +18 bps modeled', 'Finance validation needed'],
    sourceMode: 'simulated_listener',
    confidence: 'medium',
    recommendedDocumentType: 'Margin and volume sensitivity report'
  },
  {
    id: 'signal-promo',
    type: 'promo_exposure',
    summary: 'Buyer introduced Q4 promotion pressure as a condition for accepting the counter.',
    extractedNumbers: ['Q4 promo phasing', 'Trade spend +0.4 pts modeled', 'Promo exposure medium-high'],
    sourceMode: 'simulated_listener',
    confidence: 'medium',
    recommendedDocumentType: 'Promo exposure risk readout'
  },
  {
    id: 'signal-offset',
    type: 'market_offset',
    summary: 'Market-scope discussion moved toward whether Germany can absorb part of the tradeoff.',
    extractedNumbers: ['Germany offset scenario', 'France base price protected', 'Volume recovery unresolved'],
    sourceMode: 'simulated_listener',
    confidence: 'medium',
    recommendedDocumentType: 'Market offset view'
  },
  {
    id: 'signal-strategy-drift',
    type: 'strategy_drift',
    summary: 'ATLAS detected a draft strategy change: fallback may be usable, but it should remain review-gated.',
    extractedNumbers: ['Strategy v4 draft', 'Finance review dependency', 'Fallback not validated'],
    sourceMode: 'simulated_listener',
    confidence: 'high',
    recommendedDocumentType: 'Strategy drift / validation risk note'
  }
];

export function getLiveBuyingGroup(id?: string) {
  const staticGroup = liveBuyingGroups.find((group) => group.id === id);
  if (staticGroup) return staticGroup;
  const atlasGroup = id ? getBuyingGroup(id) : undefined;
  if (!atlasGroup) return liveBuyingGroups[0];
  const primaryMarket = getMarket(atlasGroup.primaryMarkets[0]);
  return {
    id: atlasGroup.id,
    name: atlasGroup.name,
    region: primaryMarket?.region ?? 'Europe',
    activeMarket: primaryMarket?.name ?? atlasGroup.primaryMarkets[0] ?? 'Europe',
    stage: atlasGroup.negotiationStage.replaceAll('_', ' '),
    strategy: `Current read: ${pct(atlasGroup.financialExposure.expectedPriceRealization)} expected realization vs ${pct(atlasGroup.financialExposure.targetPriceRealization)} target; protect margin at risk before expanding support.`
  };
}

export function buildLiveDocumentPrompt(signal: LiveDetectedSignal, buyingGroup: LiveBuyingGroup, prepDeckLabel: string) {
  return [
    `Create a PDF-ready ${signal.recommendedDocumentType} for the live ${buyingGroup.name} negotiation.`,
    `Buying group: ${buyingGroup.name}. Region: ${buyingGroup.region}. Active market: ${buyingGroup.activeMarket}.`,
    `Prep/scenario evidence output context: ${prepDeckLabel}.`,
    `Detected signal: ${signal.summary}`,
    `Extracted numbers: ${signal.extractedNumbers.join(', ')}.`,
    'Show the data points, source/freshness/confidence, implications for the negotiation, and the specific open validation items.'
  ].join('\n');
}

export function liveDocumentUrl(prompt: string, liveContext?: unknown) {
  const params = new URLSearchParams({ prompt, mode: 'draft', editable: '1' });
  if (liveContext) params.set('liveContext', JSON.stringify(liveContext));
  return `/generated-views?${params.toString()}`;
}
