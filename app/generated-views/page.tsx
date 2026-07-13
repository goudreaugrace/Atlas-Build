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
          'Use Scenario Models for pricing or trade spend movement before committing to a position.',
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
  const report = mode === 'retrieved' && sourceDocument
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
