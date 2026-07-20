import { generateAtlasReport, type AtlasGeneratedReport } from '@/src/lib/atlas/llm-report';
import { buildAtlasIntelligencePacket, euros } from '@/src/lib/atlas-intelligence/kernel';
import type { DocumentArtifact, SourceMeta } from '@/src/lib/atlas-intelligence/types';
import GeneratedViewClient, { type GeneratedViewMode } from './GeneratedViewClient';

type GeneratedViewsPageProps = {
  searchParams: Promise<{
    buyingGroupId?: string;
    documentId?: string;
    duplicateFrom?: string;
    editable?: string;
    marketId?: string;
    mode?: string;
    prompt?: string;
    print?: string;
    reportOnly?: string;
    reportType?: string;
    scenarioName?: string;
    scenarioLevel?: string;
    atlasScore?: string;
    likelihood?: string;
    topRecommendedMemoryAdjustment?: string;
    topRecommendedReason?: string;
    topRecommendedScenario?: string;
    topRecommendedScore?: string;
    buyerResponse?: string;
    recommendedEdit?: string;
    evidenceStrength?: string;
    guardrailRisk?: string;
    relationshipRisk?: string;
    nrImpact?: string;
    gmImpact?: string;
    volumeImpact?: string;
    tradeImpact?: string;
    riskAdjustedValue?: string;
    skuCount?: string;
    customLeverCount?: string;
    debriefMemory?: string;
    excludedEvidence?: string;
    reviewEvidence?: string;
    selectedEvidence?: string;
    storedViewId?: string;
  }>;
};

const packet = buildAtlasIntelligencePacket();

function resolveSourceDocument(documentId?: string) {
  if (!documentId) return undefined;
  return packet.documents.find((document) => document.id === documentId);
}

function inferBuyingGroupId(prompt: string, document?: DocumentArtifact) {
  if (document?.buyingGroupId) return document.buyingGroupId;
  const normalized = prompt.toLowerCase();
  return packet.buyingGroups.find((group) => normalized.includes(group.name.toLowerCase()) || normalized.includes(group.id))?.id;
}

function inferMarketId(prompt: string, document?: DocumentArtifact) {
  if (document?.marketId) return document.marketId;
  const normalized = prompt.toLowerCase();
  return packet.markets.find((market) => normalized.includes(market.name.toLowerCase()) || normalized.includes(market.id))?.id;
}

function buildRetrievedReport(prompt: string, document: DocumentArtifact): AtlasGeneratedReport {
  const buyingGroupRecord = document.buyingGroupId
    ? packet.buyingGroups.find((group) => group.id === document.buyingGroupId)
    : undefined;
  const marketRecord = document.marketId
    ? packet.markets.find((item) => item.id === document.marketId)
    : undefined;
  const buyingGroup = buyingGroupRecord?.name;
  const market = marketRecord?.name;
  const governance = document.source.governance;
  const exposure = buyingGroupRecord?.financialExposure;
  const signals = packet.signals.filter((signal) => (
    (document.buyingGroupId && signal.affectedBuyingGroups.includes(document.buyingGroupId))
    || (document.marketId && signal.affectedMarkets.includes(document.marketId))
  ));
  const competitors = packet.competitorMoves.filter((move) => (
    (document.buyingGroupId && move.affectedBuyingGroups.includes(document.buyingGroupId))
    || (document.marketId && move.affectedMarkets.includes(document.marketId))
  ));
  const marginGap = exposure ? exposure.targetPriceRealization - exposure.expectedPriceRealization : undefined;
  const riskPercent = exposure ? Math.round((exposure.marginAtRisk / Math.max(exposure.revenueUnderNegotiation, 1)) * 100) : undefined;

  return {
    title: document.title,
    subtitle: buyingGroup && market ? `${buyingGroup} / ${market} / ${document.year}` : document.summary,
    audience: 'ATLAS intelligence user',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt: new Date().toISOString(),
    summary: exposure
      ? `${buyingGroup ?? 'This buyer'} has ${euros(exposure.marginAtRisk)} margin at risk on ${euros(exposure.revenueUnderNegotiation)} revenue under negotiation. Expected realization is ${exposure.expectedPriceRealization.toFixed(1)}% versus ${exposure.targetPriceRealization.toFixed(1)}% target.`
      : document.summary,
    metrics: exposure ? [
      { label: 'Margin at risk', value: euros(exposure.marginAtRisk), note: `${riskPercent}% of negotiated revenue` },
      { label: 'Revenue under negotiation', value: euros(exposure.revenueUnderNegotiation), note: `${buyingGroup ?? market ?? 'ATLAS'} scope` },
      { label: 'Realization gap', value: `${(marginGap ?? 0).toFixed(1)} pts`, note: `${exposure.expectedPriceRealization.toFixed(1)}% expected vs ${exposure.targetPriceRealization.toFixed(1)}% target` },
      { label: 'Trade spend exposure', value: euros(exposure.tradeSpendExposure), note: 'Current pressure pool' }
    ] : [
      { label: 'Scope', value: buyingGroup ?? market ?? 'Europe', note: `Stored ${document.year}` },
      { label: 'Confidence', value: document.source.confidence, note: `${document.source.sourceName} / ${document.source.sourceDate}` },
      { label: 'Document status', value: document.status.replaceAll('_', ' '), note: document.reusable ? 'Reusable source' : 'Review before reuse' },
      { label: 'Type', value: document.documentType.replaceAll('_', ' '), note: 'ATLAS library' }
    ],
    sections: [
      {
        title: 'Financial read',
        body: exposure
          ? `${buyingGroup ?? 'The buying group'} is below target realization and carries a material margin exposure. Treat the current financial packet as the working baseline for pricing, trade spend, and volume pressure before entering the next negotiation round.`
          : document.summary,
        bullets: [
          exposure ? `${euros(exposure.gapToPlan)} gap to plan remains unresolved.` : `Requested as: ${prompt}`,
          exposure ? `${euros(exposure.volumeExposure)} volume exposure should be checked against concession scenarios.` : `Scope: ${buyingGroup ?? market ?? 'Europe'}`,
          exposure ? `${euros(exposure.tradeSpendExposure)} trade spend exposure is available for scenario pressure testing.` : `Source owner: ${governance.sourceOwner}`
        ]
      },
      {
        title: 'What is driving pressure',
        body: signals[0]?.negotiationImplication ?? competitors[0]?.possibleBuyerLeverage ?? 'No linked public signal is attached to this document in the prototype packet.',
        bullets: [
          signals[0] ? `Signal: ${signals[0].title}` : 'No signal linked',
          competitors[0] ? `Competitor pressure: ${competitors[0].competitor} / ${competitors[0].title}` : 'No competitor move linked',
          signals[0]?.recommendedAction ?? competitors[0]?.recommendedAction ?? 'Use Ask ATLAS to pull a deeper pressure read.'
        ]
      },
      {
        title: 'Recommended CNO action',
        body: exposure
          ? `Prioritize a scenario that closes the ${(marginGap ?? 0).toFixed(1)} point realization gap without expanding the ${euros(exposure.marginAtRisk)} margin-at-risk position.`
          : 'Use this retrieved document as the base source and ask ATLAS to expand the view with current buyer, market, or competitor context.',
        bullets: [
          buyingGroup ? `Open ${buyingGroup} profile to compare this read against negotiation history.` : 'Attach this view to the relevant buyer or market profile.',
          'Use Scenario Lab for pricing, trade spend, SKU, or custom-lever movement before committing to a position.',
          'Download the PDF when the view is ready to share internally.'
        ]
      }
    ],
    sources: [
      { label: document.source.sourceName, detail: `${document.source.sourceType.replaceAll('_', ' ')} / ${document.source.sourceDate}` },
      { label: 'ATLAS document library', detail: document.id }
    ],
    caveats: governance.caveats.length
      ? governance.caveats
      : ['Retrieved from the local ATLAS prototype source library. Confirm against source system before external use.']
  };
}

function buildPricingJustificationReport(prompt: string, buyingGroupId?: string, marketId?: string): AtlasGeneratedReport {
  const buyingGroup = buyingGroupId
    ? packet.buyingGroups.find((group) => group.id === buyingGroupId)
    : packet.buyingGroups.find((group) => prompt.toLowerCase().includes(group.name.toLowerCase()));
  const market = marketId
    ? packet.markets.find((item) => item.id === marketId)
    : buyingGroup?.primaryMarkets[0]
      ? packet.markets.find((item) => item.id === buyingGroup.primaryMarkets[0])
      : packet.markets.find((item) => prompt.toLowerCase().includes(item.name.toLowerCase()));
  const exposure = buyingGroup?.financialExposure;
  const latestEvent = packet.latestTimelineEvents.find((event) => buyingGroup?.id && event.buyingGroupIds.includes(buyingGroup.id));
  const signal = packet.signals.find((item) => (
    (buyingGroup?.id && item.affectedBuyingGroups.includes(buyingGroup.id))
    || (market?.id && item.affectedMarkets.includes(market.id))
  ));
  const recommendedAsk = exposure ? Math.max(exposure.targetPriceRealization + 0.6, exposure.expectedPriceRealization + 1.2) : 3.2;
  const buyerAsk = recommendedAsk + 1.1;
  const fallback = Math.max(0, exposure ? exposure.expectedPriceRealization + 0.4 : recommendedAsk - 0.8);
  const redLine = Math.max(0, fallback - 0.7);
  const realizationGap = exposure ? exposure.targetPriceRealization - exposure.expectedPriceRealization : 0.9;
  const source = buyingGroup?.source ?? market?.source ?? packet.documents[0].source;

  return {
    title: `${buyingGroup?.name ?? market?.name ?? 'ATLAS'} pricing justification`,
    subtitle: `${market?.name ?? 'Europe'} / Strategy-linked pricing corridor / ${source.sourceDate}`,
    audience: 'CNO negotiation prep',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt: new Date().toISOString(),
    summary: `Use a ${recommendedAsk.toFixed(1)}% recommended ask, defend it with corridor evidence, and do not move below the ${redLine.toFixed(1)}% red line unless the buyer replaces value with measurable volume, mix, or trade commitments.`,
    metrics: [
      { label: 'Recommended ask', value: `${recommendedAsk.toFixed(1)}%`, note: `Buyer expected to open near ${buyerAsk.toFixed(1)}%` },
      { label: 'Target', value: `${(exposure?.targetPriceRealization ?? recommendedAsk - 0.4).toFixed(1)}%`, note: `${realizationGap.toFixed(1)} pts realization gap` },
      { label: 'Red line', value: `${redLine.toFixed(1)}%`, note: 'Finance/NRM guardrail input' },
      { label: 'Margin at risk', value: exposure ? euros(exposure.marginAtRisk) : euros(market?.marginAtRisk ?? 0), note: exposure ? `${euros(exposure.revenueUnderNegotiation)} revenue in negotiation` : `${market?.name ?? 'Market'} exposure` }
    ],
    sections: [
      {
        title: 'Pricing corridor',
        body: `The recommended ask sits between the buyer opening position and the Finance/NRM red line, with fallback space reserved for measurable value exchange.`,
        bullets: [
          `Buyer ask: ${buyerAsk.toFixed(1)}%`,
          `Recommended ask: ${recommendedAsk.toFixed(1)}%`,
          `Fallback: ${fallback.toFixed(1)}%`,
          `Red line: ${redLine.toFixed(1)}%`
        ]
      },
      {
        title: 'Evidence to use in the room',
        body: 'Lead with evidence tied directly to the pricing number, then move to concessions only when the buyer offers measurable value back.',
        bullets: [
          exposure ? `${euros(exposure.marginAtRisk)} margin at risk on ${euros(exposure.revenueUnderNegotiation)} revenue under negotiation.` : `${market?.name ?? 'Market'} pressure is the working scope.`,
          signal ? `${signal.title}: ${signal.negotiationImplication}` : 'Use internal performance data as the primary justification.',
          latestEvent ? `${latestEvent.title}: ${latestEvent.summary}` : 'Prior-year negotiation memory should be reviewed before external sharing.'
        ]
      },
      {
        title: 'Expected buyer pushback',
        body: `${buyingGroup?.name ?? 'The buyer'} will likely challenge affordability, competitor options, and whether the increase is supported by category performance.`,
        bullets: [
          'If buyer asks for trade support, require volume, space, mix, or promo commitments.',
          'If buyer challenges inflation evidence, show historical realization gap and margin exposure before discussing concessions.',
          'If buyer threatens sanctions, escalate before crossing the red line.'
        ]
      },
      {
        title: 'Do-not-cross guardrails',
        body: 'Keep the plan inside the corridor unless Finance/NRM updates the guardrail or the buyer replaces the value through confirmed commitments.',
        bullets: [
          `Do not move below ${redLine.toFixed(1)}% without a new source-backed finance input.`,
          'Do not concede trade spend without a measured volume or visibility exchange.',
          'Do not use external signals without confirming source freshness.'
        ]
      }
    ],
    sources: [
      { label: source.sourceName, detail: `${source.sourceType.replaceAll('_', ' ')} / ${source.sourceDate} / ${source.confidence} confidence` },
      { label: 'ATLAS pricing corridor model', detail: 'Prototype Finance/NRM guardrail simulation' },
      { label: signal?.source.sourceName ?? 'ATLAS market signal packet', detail: signal?.source.sourceDate ?? source.sourceDate }
    ],
    caveats: [
      'Prototype readout based on synthetic ATLAS source records.',
      'Confirm Finance/NRM guardrails before external buyer use.'
    ]
  };
}

function numberFromQuery(value: string | undefined, fallback = 0) {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listFromQuery(value?: string) {
  return value?.split('|').map((item) => item.trim()).filter(Boolean) ?? [];
}

function buildScenarioEvidenceReport(
  prompt: string,
  buyingGroupId: string | undefined,
  marketId: string | undefined,
  query: Awaited<GeneratedViewsPageProps['searchParams']>
): AtlasGeneratedReport {
  const buyingGroup = buyingGroupId
    ? packet.buyingGroups.find((group) => group.id === buyingGroupId)
    : packet.buyingGroups.find((group) => prompt.toLowerCase().includes(group.name.toLowerCase()));
  const market = marketId
    ? packet.markets.find((item) => item.id === marketId)
    : buyingGroup?.primaryMarkets[0]
      ? packet.markets.find((item) => item.id === buyingGroup.primaryMarkets[0])
      : packet.markets.find((item) => prompt.toLowerCase().includes(item.name.toLowerCase()));
  const exposure = buyingGroup?.financialExposure;
  const source = buyingGroup?.source ?? market?.source ?? packet.documents[0].source;
  const signal = packet.signals.find((item) => (
    (buyingGroup?.id && item.affectedBuyingGroups.includes(buyingGroup.id))
    || (market?.id && item.affectedMarkets.includes(market.id))
  ));
  const latestEvent = packet.latestTimelineEvents.find((event) => buyingGroup?.id && event.buyingGroupIds.includes(buyingGroup.id));
  const scenarioName = query.scenarioName ?? 'Selected scenario';
  const level = query.scenarioLevel?.replaceAll('_', ' ') ?? 'buying group';
  const atlasScore = numberFromQuery(query.atlasScore, 72);
  const likelihood = numberFromQuery(query.likelihood, 65);
  const topRecommendedScenario = query.topRecommendedScenario ?? scenarioName;
  const topRecommendedScore = numberFromQuery(query.topRecommendedScore, atlasScore);
  const topRecommendedMemoryAdjustment = numberFromQuery(query.topRecommendedMemoryAdjustment, 0);
  const topRecommendedReason = query.topRecommendedReason ?? `${topRecommendedScenario} is currently the top recommendation based on scenario score, buyer history, guardrail fit, and evidence strength.`;
  const evidenceStrength = numberFromQuery(query.evidenceStrength, 70);
  const realizationGap = exposure
    ? Math.max(0.2, exposure.targetPriceRealization - exposure.expectedPriceRealization)
    : market
      ? Math.max(0.2, market.gapToPlan / Math.max(market.marginAtRisk, 1) * 10)
      : 0.8;
  const defaultNrImpact = exposure
    ? exposure.revenueUnderNegotiation * (realizationGap / 100)
    : market
      ? market.gapToPlan
      : 1200000;
  const defaultGmImpact = exposure
    ? Math.max(exposure.marginAtRisk * 0.18, defaultNrImpact * 0.38)
    : market
      ? market.marginAtRisk * 0.16
      : 480000;
  const defaultVolumeImpact = exposure
    ? -Math.round(exposure.volumeExposure * Math.min(0.06, realizationGap / 100))
    : -240000;
  const defaultTradeImpact = exposure
    ? -Math.round(exposure.tradeSpendExposure * 0.08)
    : -320000;
  const nrImpact = numberFromQuery(query.nrImpact, defaultNrImpact);
  const gmImpact = numberFromQuery(query.gmImpact, defaultGmImpact);
  const volumeImpact = numberFromQuery(query.volumeImpact, defaultVolumeImpact);
  const tradeImpact = numberFromQuery(query.tradeImpact, defaultTradeImpact);
  const riskAdjustedValue = numberFromQuery(query.riskAdjustedValue, exposure?.marginAtRisk ?? market?.marginAtRisk ?? 0);
  const guardrailRisk = query.guardrailRisk ?? 'Inside corridor';
  const relationshipRisk = query.relationshipRisk ?? 'Medium';
  const buyerResponse = query.buyerResponse ?? (
    buyingGroup
      ? `${buyingGroup.name} is likely to counter below target first, then ask for trade support or volume protection before accepting the modeled move.`
      : market
        ? `${market.name} buyers are likely to challenge affordability and ask PepsiCo to justify why the market pressure should flow into price.`
        : 'Buyer response prediction should be reviewed before using externally.'
  );
  const recommendedEdit = query.recommendedEdit ?? (
    exposure
      ? `Keep the modeled move tied to the ${realizationGap.toFixed(1)} point realization gap and use buyer history before offering trade support.`
      : 'Review sources and confirm finance guardrails before taking this scenario into the room.'
  );
  const debriefMemory = query.debriefMemory;
  const selectedEvidence = listFromQuery(query.selectedEvidence);
  const reviewEvidence = listFromQuery(query.reviewEvidence);
  const excludedEvidence = listFromQuery(query.excludedEvidence);
  const skuCount = Number.parseInt(query.skuCount ?? '0', 10);
  const customLeverCount = Number.parseInt(query.customLeverCount ?? '0', 10);

  return {
    title: `${buyingGroup?.name ?? market?.name ?? 'ATLAS'} scenario evidence`,
    subtitle: `${scenarioName} / ${level} model / ${source.sourceDate}`,
    audience: 'CNO scenario decisioning',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt: new Date().toISOString(),
    summary: `${scenarioName} scores ${atlasScore}/100 with ${likelihood}% modeled landing likelihood. ATLAS currently recommends testing ${topRecommendedScenario} next. Expected buyer response: ${buyerResponse}`,
    metrics: [
      { label: 'ATLAS score', value: `${atlasScore}/100`, note: `${guardrailRisk} · ${relationshipRisk} relationship risk` },
      { label: 'Top next test', value: topRecommendedScenario, note: `${topRecommendedScore}/100 · memory ${topRecommendedMemoryAdjustment >= 0 ? '+' : ''}${topRecommendedMemoryAdjustment}` },
      { label: 'Likelihood to land', value: `${likelihood}%`, note: 'Predicted from buyer history, current assumptions, and source strength' },
      { label: 'Risk-adjusted value', value: euros(riskAdjustedValue), note: `Evidence strength ${evidenceStrength}%` },
      { label: 'GM impact', value: euros(gmImpact), note: `NR ${euros(nrImpact)} · Trade ${euros(tradeImpact)}` }
    ],
    sections: [
      {
        title: 'Scenario decision',
        body: `${scenarioName} is the current modeled move for ${buyingGroup?.name ?? market?.name ?? 'this scope'}. Use it if the team accepts the guardrail state and can defend the buyer response with source-backed evidence.`,
        bullets: [
          `Scenario level: ${level}`,
          `Landing likelihood: ${likelihood}%`,
          `Guardrail state: ${guardrailRisk}`,
          `Relationship risk: ${relationshipRisk}`
        ]
      },
      {
        title: 'Memory-adjusted recommendation',
        body: `ATLAS recommends testing ${topRecommendedScenario} next based on the latest scenario score and buyer memory.`,
        bullets: [
          `Top scenario score: ${topRecommendedScore}/100`,
          `Debrief memory adjustment: ${topRecommendedMemoryAdjustment >= 0 ? '+' : ''}${topRecommendedMemoryAdjustment}`,
          topRecommendedReason,
          topRecommendedScenario === scenarioName
            ? 'The exported scenario is also the current top next test.'
            : `The exported scenario is not the top next test; review ${topRecommendedScenario} before using this output as the main room evidence.`
        ]
      },
      {
        title: 'Modeled financial effect',
        body: `The scenario changes net revenue, gross margin, volume, and trade spend simultaneously; do not read any one metric alone.`,
        bullets: [
          `Net revenue impact: ${euros(nrImpact)}`,
          `Gross margin impact: ${euros(gmImpact)}`,
          `Volume impact: ${euros(volumeImpact)}`,
          `Trade spend impact: ${euros(tradeImpact)}`
        ]
      },
      {
        title: 'Expected buyer response',
        body: buyerResponse,
        bullets: [
          recommendedEdit,
          debriefMemory ?? (latestEvent ? `${latestEvent.title}: ${latestEvent.summary}` : 'No debrief memory is attached yet. Capture one after the next round.'),
          signal ? `${signal.title}: ${signal.negotiationImplication}` : 'No active external signal is attached to this scenario.'
        ]
      },
      {
        title: 'Selected evidence set',
        body: selectedEvidence.length
          ? 'This evidence is currently included in the exported scenario readout and should be used to explain the modeled move.'
          : 'No evidence has been explicitly included yet; review the buyer workspace before using this output.',
        bullets: selectedEvidence.length
          ? [
            ...selectedEvidence,
            ...(reviewEvidence.length ? [`Needs review before use: ${reviewEvidence.join('; ')}`] : []),
            ...(excludedEvidence.length ? [`Excluded from this output: ${excludedEvidence.join('; ')}`] : [])
          ]
          : [
            ...(reviewEvidence.length ? [`Needs review before use: ${reviewEvidence.join('; ')}`] : []),
            ...(excludedEvidence.length ? [`Excluded from this output: ${excludedEvidence.join('; ')}`] : []),
            'Return to the buyer workspace and include source-backed evidence before sharing.'
          ]
      },
      {
        title: 'Modeling scope and levers',
        body: `This output reflects a ${level} scenario. SKU and custom-lever detail should be used only when those levers materially change buyer response or financial exposure.`,
        bullets: [
          `SKU rows considered: ${Number.isFinite(skuCount) ? skuCount : 0}`,
          `Custom levers considered: ${Number.isFinite(customLeverCount) ? customLeverCount : 0}`,
          exposure ? `${euros(exposure.marginAtRisk)} margin at risk on ${euros(exposure.revenueUnderNegotiation)} revenue under negotiation.` : `${market?.name ?? 'Market'} scenario scope.`,
          `Source confidence: ${source.confidence}`
        ]
      },
      {
        title: 'Recommended next move',
        body: recommendedEdit,
        bullets: [
          'Save this scenario to buyer memory if it should influence future predictions.',
          'Add a debrief after the next round so the buyer-counter model learns from the outcome.',
          'Download this report only after confirming Finance/NRM guardrails and source freshness.'
        ]
      }
    ],
    sources: [
      { label: source.sourceName, detail: `${source.sourceType.replaceAll('_', ' ')} / ${source.sourceDate} / ${source.confidence} confidence` },
      { label: 'ATLAS Scenario Lab', detail: `${scenarioName} generated from current scenario assumptions` },
      { label: signal?.source.sourceName ?? 'Buyer history memory', detail: debriefMemory ?? latestEvent?.title ?? 'No debrief attached' }
    ],
    caveats: [
      'Prototype scenario output based on synthetic ATLAS source records and user-modeled assumptions.',
      'Confirm Finance/NRM guardrails before using this as an external negotiation artifact.'
    ]
  };
}

function shouldUseScenarioEvidenceTemplate({
  buyingGroupId,
  marketId,
  mode,
  prompt,
  query
}: {
  buyingGroupId?: string;
  marketId?: string;
  mode: GeneratedViewMode;
  prompt: string;
  query: Awaited<GeneratedViewsPageProps['searchParams']>;
}) {
  if (query.reportType === 'scenario_evidence') return true;
  if (/scenario evidence|financial scenario output|scenario output|buyer counter|predict|what if|model|scenario|counter|sku|lever/i.test(prompt)) return true;
  if (mode !== 'retrieved' && (buyingGroupId || marketId)) return true;
  return false;
}

function fallbackSource(document?: DocumentArtifact, buyingGroupId?: string, marketId?: string): SourceMeta {
  if (document) return document.source;
  const groupSource = buyingGroupId ? packet.buyingGroups.find((group) => group.id === buyingGroupId)?.source : undefined;
  const marketSource = marketId ? packet.markets.find((market) => market.id === marketId)?.source : undefined;
  return groupSource ?? marketSource ?? packet.documents[0].source;
}

export default async function GeneratedViewsPage({ searchParams }: GeneratedViewsPageProps) {
  const query = await searchParams;
  const prompt = query.prompt?.trim() || 'Create an ATLAS intelligence view';
  const sourceDocument = resolveSourceDocument(query.documentId ?? query.duplicateFrom);
  const buyingGroupId = query.buyingGroupId || inferBuyingGroupId(prompt, sourceDocument);
  const marketId = query.marketId || inferMarketId(prompt, sourceDocument);
  const mode: GeneratedViewMode = query.duplicateFrom
    ? 'duplicated'
    : query.mode === 'retrieved' && sourceDocument
      ? 'retrieved'
      : query.mode === 'draft' || query.editable === '1'
        ? 'new_draft'
        : sourceDocument
          ? 'retrieved'
          : 'new_draft';
  const reportOnly = query.reportOnly === '1';
  const editable = !reportOnly && query.editable !== '0';
  const isPricingJustification = /pricing justification|price justification|pricing corridor|guardrail|do-not-cross|defend.*price/i.test(prompt);
  const isScenarioEvidence = shouldUseScenarioEvidenceTemplate({ buyingGroupId, marketId, mode, prompt, query });
  const report = isScenarioEvidence
    ? buildScenarioEvidenceReport(prompt, buyingGroupId, marketId, query)
    : isPricingJustification
    ? buildPricingJustificationReport(prompt, buyingGroupId, marketId)
    : mode === 'retrieved' && sourceDocument
      ? buildRetrievedReport(prompt, sourceDocument)
      : await generateAtlasReport(prompt, { buyingGroupId, marketId });

  return (
    <GeneratedViewClient
      buyingGroupId={buyingGroupId}
      editable={editable}
      marketId={marketId}
      mode={mode}
      prompt={prompt}
      report={report}
      reportOnly={reportOnly}
      source={fallbackSource(sourceDocument, buyingGroupId, marketId)}
      sourceDocument={sourceDocument}
      storedViewId={query.storedViewId}
      autoPrint={query.print === '1'}
    />
  );
}
