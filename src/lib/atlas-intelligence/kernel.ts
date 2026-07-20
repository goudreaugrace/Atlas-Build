import atlasSeedJson from '@/src/data/demo/atlas-europe-intelligence.json';
import type {
  AtlasIntelligencePacket,
  AtlasIntelligenceSeed,
  BuyerMemoryArtifact,
  BuyingGroupWorkspacePacket,
  BuyingGroup,
  CompetitorMove,
  DocumentArtifact,
  ExternalSignal,
  GovernanceTrigger,
  Market,
  NegotiationPlan,
  PrepReadinessState,
  ScenarioInputs,
  ScenarioOutputs,
  TimelineEvent
} from '@/src/lib/atlas-intelligence/types';

const rawAtlasIntelligenceSeed = atlasSeedJson as AtlasIntelligenceSeed;

export const MVP_BUYING_GROUP_IDS = ['edeka', 'tesco', 'carrefour', 'rewe', 'ahold-delhaize'] as const;

const mvpBuyingGroupIdSet = new Set<string>(MVP_BUYING_GROUP_IDS);

export function isMvpBuyingGroupId(id: string) {
  return mvpBuyingGroupIdSet.has(id);
}

function mvpGroupIds(ids: string[]) {
  return ids.filter(isMvpBuyingGroupId);
}

function filterAtlasSeedForMvp(seed: AtlasIntelligenceSeed): AtlasIntelligenceSeed {
  const buyingGroups = seed.buyingGroups.filter((group) => isMvpBuyingGroupId(group.id));
  const markets = seed.markets.map((market) => ({
    ...market,
    activeBuyingGroups: mvpGroupIds(market.activeBuyingGroups)
  }));
  const signals = seed.signals
    .map((signal) => ({ ...signal, affectedBuyingGroups: mvpGroupIds(signal.affectedBuyingGroups) }))
    .filter((signal) => signal.affectedBuyingGroups.length > 0);
  const competitorMoves = seed.competitorMoves
    .map((move) => ({ ...move, affectedBuyingGroups: mvpGroupIds(move.affectedBuyingGroups) }))
    .filter((move) => move.affectedBuyingGroups.length > 0);
  const documents = seed.documents.filter((document) => !document.buyingGroupId || isMvpBuyingGroupId(document.buyingGroupId));
  const timelineEvents = seed.timelineEvents
    .map((event) => ({ ...event, buyingGroupIds: mvpGroupIds(event.buyingGroupIds) }))
    .filter((event) => event.buyingGroupIds.length > 0 || event.marketIds.length > 0);
  const crossMarketPatterns = seed.crossMarketPatterns
    .map((pattern) => ({ ...pattern, affectedBuyingGroups: mvpGroupIds(pattern.affectedBuyingGroups) }))
    .filter((pattern) => pattern.affectedBuyingGroups.length > 0);

  return {
    ...seed,
    buyingGroups,
    markets,
    signals,
    competitorMoves,
    documents,
    timelineEvents,
    crossMarketPatterns,
    scenarioModels: seed.scenarioModels.filter((scenario) => isMvpBuyingGroupId(scenario.buyingGroupId)),
    retrievalNotes: seed.retrievalNotes.filter((note) => note.buyingGroupId ? isMvpBuyingGroupId(note.buyingGroupId) : false)
  };
}

export const atlasIntelligenceSeed = filterAtlasSeedForMvp(rawAtlasIntelligenceSeed);

export function euros(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}EUR ${(abs / 1000000).toFixed(abs >= 10000000 ? 0 : 1)}M`;
  if (abs >= 1000) return `${sign}EUR ${(abs / 1000).toFixed(0)}K`;
  return `${sign}EUR ${abs.toFixed(0)}`;
}

export function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function riskRank(risk: string) {
  return ({ critical: 4, high: 3, medium: 2, low: 1 } as Record<string, number>)[risk] ?? 0;
}

export function buildAtlasIntelligencePacket(): AtlasIntelligencePacket {
  const topExposureBuyingGroups = [...atlasIntelligenceSeed.buyingGroups]
    .sort((a, b) => b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
    .slice(0, 5);
  const highPressureMarkets = [...atlasIntelligenceSeed.markets]
    .sort((a, b) => riskRank(b.pressureLevel) - riskRank(a.pressureLevel) || b.marginAtRisk - a.marginAtRisk)
    .slice(0, 4);
  const latestTimelineEvents = [...atlasIntelligenceSeed.timelineEvents]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 7);
  const highestMarket = highPressureMarkets[0];
  const highestBuyingGroup = topExposureBuyingGroups[0];
  const topPattern = atlasIntelligenceSeed.crossMarketPatterns[0];

  return {
    ...atlasIntelligenceSeed,
    topExposureBuyingGroups,
    highPressureMarkets,
    latestTimelineEvents,
    todaysIntelligenceBrief: `${highestMarket.name} is the highest-pressure market and ${highestBuyingGroup.name} is the largest margin exposure. ${topPattern.title}. ATLAS recommends modeling downside price realization before the next governance checkpoint and validating stale or missing source documents before generating new outputs.`,
    aiPriorityBrief: `${highestMarket.name}, ${highPressureMarkets[1]?.name ?? 'the UK'} and ${highPressureMarkets[2]?.name ?? 'France'} represent the highest near-term margin exposure. Retailer pressure, private label activity and competitor promotion intensity are reducing expected price realization across ${topExposureBuyingGroups.slice(0, 3).map((group) => group.name).join(', ')}.`
  };
}

export function getMarket(id: string): Market | undefined {
  return atlasIntelligenceSeed.markets.find((market) => market.id === id);
}

export function getBuyingGroup(id: string): BuyingGroup | undefined {
  if (!isMvpBuyingGroupId(id)) return undefined;
  return atlasIntelligenceSeed.buyingGroups.find((group) => group.id === id);
}

export function signalsFor(input: { marketId?: string; buyingGroupId?: string }): ExternalSignal[] {
  return atlasIntelligenceSeed.signals.filter((signal) => {
    const marketMatch = input.marketId ? signal.affectedMarkets.includes(input.marketId) : true;
    const groupMatch = input.buyingGroupId ? signal.affectedBuyingGroups.includes(input.buyingGroupId) : true;
    return marketMatch && groupMatch;
  });
}

export function competitorMovesFor(input: { marketId?: string; buyingGroupId?: string }): CompetitorMove[] {
  return atlasIntelligenceSeed.competitorMoves.filter((move) => {
    const marketMatch = input.marketId ? move.affectedMarkets.includes(input.marketId) : true;
    const groupMatch = input.buyingGroupId ? move.affectedBuyingGroups.includes(input.buyingGroupId) : true;
    return marketMatch && groupMatch;
  });
}

export function documentsFor(input: { marketId?: string; buyingGroupId?: string }): DocumentArtifact[] {
  return atlasIntelligenceSeed.documents.filter((document) => {
    const marketMatch = input.marketId ? document.marketId === input.marketId : true;
    const groupMatch = input.buyingGroupId ? document.buyingGroupId === input.buyingGroupId : true;
    return marketMatch && groupMatch;
  });
}

export function timelineFor(input: { marketId?: string; buyingGroupId?: string }): TimelineEvent[] {
  return atlasIntelligenceSeed.timelineEvents
    .filter((event) => {
      const marketMatch = input.marketId ? event.marketIds.includes(input.marketId) : true;
      const groupMatch = input.buyingGroupId ? event.buyingGroupIds.includes(input.buyingGroupId) : true;
      return marketMatch && groupMatch;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function buildRetrievalMessage(buyingGroupId: string) {
  const note = atlasIntelligenceSeed.retrievalNotes.find((item) => item.buyingGroupId === buyingGroupId);
  if (note) return note;
  const docs = documentsFor({ buyingGroupId });
  const approved = docs.find((doc) => doc.status === 'approved');
  if (approved) {
    return {
      id: `retrieval-${buyingGroupId}-approved`,
      buyingGroupId,
      documentId: approved.id,
      noteType: 'using_approved_source' as const,
      message: `ATLAS found an approved source for ${getBuyingGroup(buyingGroupId)?.name ?? buyingGroupId} and will retrieve it before creating new content.`,
      sourceIds: [approved.id]
    };
  }
  const stale = docs.find((doc) => doc.status === 'stale' || doc.status === 'needs_validation');
  if (stale) {
    return {
      id: `retrieval-${buyingGroupId}-source-review`,
      buyingGroupId,
      documentId: stale.id,
      noteType: 'needs_validation' as const,
      message: `ATLAS found ${stale.title} and is using it as a working source while showing its source-review status.`,
      sourceIds: [stale.id]
    };
  }
  return {
    id: `retrieval-${buyingGroupId}-draft`,
    buyingGroupId,
    noteType: 'generated_draft' as const,
    message: 'No approved document found. ATLAS can generate a draft from available signals only and mark it non-canonical.',
    sourceIds: []
  };
}

function addDaysIso(days: number) {
  const date = new Date(atlasIntelligenceSeed.generatedAt);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function negotiationRoundNumber(group: BuyingGroup) {
  if (group.negotiationStage === 'closed') return 0;
  if (group.negotiationStage === 'prep') return 0;
  if (group.negotiationStage === 'paused') return 6;
  if (group.riskLevel === 'critical') return 15;
  if (group.riskLevel === 'high') return 9;
  if (group.riskLevel === 'medium') return 5;
  return 1;
}

function sourceIdsForDocuments(documents: DocumentArtifact[]) {
  return documents.map((document) => document.id);
}

export function buildBuyerMemoryArtifacts(input: {
  buyingGroup: BuyingGroup;
  documents: DocumentArtifact[];
  timelineEvents: TimelineEvent[];
}): BuyerMemoryArtifact[] {
  const documentArtifacts: BuyerMemoryArtifact[] = input.documents.map((document) => ({
    id: `memory-${document.id}`,
    artifactType: document.documentType === 'live_debrief'
      ? 'debrief'
      : document.documentType === 'scenario_output' || document.documentType === 'scenario_visual'
        ? 'scenario_output'
        : document.documentType === 'generated_report'
          ? 'generated_view'
          : 'uploaded_document',
    title: document.title,
    buyingGroupId: input.buyingGroup.id,
    marketId: document.marketId,
    createdAt: document.source.sourceDate,
    source: document.source,
    status: document.status,
    openHref: `/generated-views?prompt=${encodeURIComponent(`Open ${document.title}`)}&mode=retrieved&documentId=${encodeURIComponent(document.id)}&buyingGroupId=${input.buyingGroup.id}`,
    summary: document.summary,
    createdBy: document.documentType === 'scenario_output' || document.documentType === 'scenario_visual'
      ? 'scenario_model'
      : document.documentType === 'generated_report'
        ? 'atlas'
        : 'user',
    audienceMode: 'internal_cno'
  }));

  const eventArtifacts: BuyerMemoryArtifact[] = input.timelineEvents
    .filter((event) => event.eventType === 'scenario_modeled' || event.eventType === 'debrief_created' || event.eventType === 'document_retrieved')
    .map((event) => ({
      id: `memory-${event.id}`,
      artifactType: event.eventType === 'scenario_modeled' ? 'scenario_output' : event.eventType === 'debrief_created' ? 'debrief' : 'generated_view',
      title: event.title,
      buyingGroupId: input.buyingGroup.id,
      marketId: event.marketIds[0],
      createdAt: event.timestamp,
      source: event.source,
      status: event.status,
      financialImpact: event.financialImpact,
      openHref: `/generated-views?prompt=${encodeURIComponent(event.title)}&mode=draft&buyingGroupId=${input.buyingGroup.id}`,
      summary: event.summary,
      createdBy: event.eventType === 'scenario_modeled' ? 'scenario_model' : 'atlas',
      audienceMode: 'internal_cno'
    }));

  return [...documentArtifacts, ...eventArtifacts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 24);
}

export function buildGovernanceTriggers(input: {
  buyingGroup: BuyingGroup;
  documents: DocumentArtifact[];
  timelineEvents: TimelineEvent[];
  competitorMoves: CompetitorMove[];
}): GovernanceTrigger[] {
  const triggers: GovernanceTrigger[] = [];
  const exposure = input.buyingGroup.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const staleDocuments = input.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const latestEventIds = input.timelineEvents.slice(0, 2).map((event) => event.id);
  const round = negotiationRoundNumber(input.buyingGroup);

  if (round >= 10) {
    triggers.push({
      id: `trigger-${input.buyingGroup.id}-round`,
      label: `Round ${round}: CNO intervention check`,
      triggerType: 'round_count',
      severity: round >= 15 ? 'critical' : 'high',
      owner: 'CNO',
      dueDate: addDaysIso(3),
      status: 'needs_validation',
      reason: 'Negotiation has remained open long enough that the next move may need leadership intervention.',
      linkedSourceIds: [],
      linkedTimelineEventIds: latestEventIds
    });
  }

  if (exposure.marginAtRisk >= 4_000_000 || input.buyingGroup.riskLevel === 'critical') {
    triggers.push({
      id: `trigger-${input.buyingGroup.id}-margin`,
      label: `${euros(exposure.marginAtRisk)} margin at risk`,
      triggerType: 'margin_threshold',
      severity: exposure.marginAtRisk >= 5_000_000 ? 'critical' : 'high',
      owner: 'Finance',
      dueDate: addDaysIso(5),
      status: 'needs_validation',
      reason: 'Margin exposure is above the CNO review threshold for this prototype.',
      linkedSourceIds: sourceIdsForDocuments(input.documents.slice(0, 2)),
      linkedTimelineEventIds: latestEventIds
    });
  }

  if (realizationGap >= 0.4) {
    triggers.push({
      id: `trigger-${input.buyingGroup.id}-realization`,
      label: `${pct(realizationGap)} below target realization`,
      triggerType: 'approval_needed',
      severity: realizationGap >= 0.8 ? 'high' : 'medium',
      owner: 'Revenue Management',
      dueDate: addDaysIso(4),
      status: 'needs_validation',
      reason: 'Expected realization is below the target guardrail and should be reviewed before using the current counter.',
      linkedSourceIds: sourceIdsForDocuments(input.documents.slice(0, 2)),
      linkedTimelineEventIds: latestEventIds
    });
  }

  if (staleDocuments.length) {
    triggers.push({
      id: `trigger-${input.buyingGroup.id}-source`,
      label: `${staleDocuments.length} source ${staleDocuments.length === 1 ? 'item' : 'items'} need review`,
      triggerType: 'stale_source',
      severity: staleDocuments.some((document) => document.status === 'missing') ? 'high' : 'medium',
      owner: 'Commercial Strategy',
      dueDate: addDaysIso(2),
      status: 'needs_validation',
      reason: 'ATLAS can use these records for working views, but official output needs a reviewed source.',
      linkedSourceIds: sourceIdsForDocuments(staleDocuments),
      linkedTimelineEventIds: []
    });
  }

  if (input.competitorMoves.length) {
    triggers.push({
      id: `trigger-${input.buyingGroup.id}-competitor`,
      label: `${input.competitorMoves[0].competitor} may create buyer leverage`,
      triggerType: 'competitor_pressure',
      severity: input.buyingGroup.riskLevel === 'critical' ? 'high' : 'medium',
      owner: 'Category / Insights',
      dueDate: addDaysIso(6),
      status: 'ready',
      reason: input.competitorMoves[0].possibleBuyerLeverage,
      linkedSourceIds: [],
      linkedTimelineEventIds: latestEventIds
    });
  }

  return triggers.slice(0, 5);
}

export function buildBuyerReadinessState(input: {
  buyingGroup: BuyingGroup;
  documents: DocumentArtifact[];
  governanceTriggers: GovernanceTrigger[];
}): PrepReadinessState {
  const staleSourceCount = input.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation').length;
  const missingDocCount = input.documents.filter((document) => document.status === 'missing').length;
  const approvalCount = input.governanceTriggers.filter((trigger) => trigger.status === 'needs_validation').length;
  const criticalTrigger = input.governanceTriggers.find((trigger) => trigger.severity === 'critical');
  const highTrigger = input.governanceTriggers.find((trigger) => trigger.severity === 'high');
  const reasons = input.governanceTriggers.slice(0, 3).map((trigger) => trigger.label);

  if (criticalTrigger || input.buyingGroup.riskLevel === 'critical') {
    return {
      status: 'escalation_needed',
      reasons,
      staleSourceCount,
      missingDocCount,
      approvalCount,
      nextAction: criticalTrigger?.reason ?? 'Confirm the next move before entering the room.',
      owner: criticalTrigger?.owner ?? 'CNO'
    };
  }

  if (highTrigger || staleSourceCount || missingDocCount || approvalCount) {
    return {
      status: 'needs_review',
      reasons,
      staleSourceCount,
      missingDocCount,
      approvalCount,
      nextAction: highTrigger?.reason ?? 'Review source readiness and financial exposure before official use.',
      owner: highTrigger?.owner ?? 'Commercial Strategy'
    };
  }

  return {
    status: 'ready',
    reasons: ['Current buyer memory and source set are usable for prep.'],
    staleSourceCount,
    missingDocCount,
    approvalCount,
    nextAction: 'Use current profile for prep and save new meeting updates back to history.',
    owner: 'CNO'
  };
}

export function buildBuyingGroupWorkspacePacket(buyingGroupId: string): BuyingGroupWorkspacePacket | undefined {
  const buyingGroup = getBuyingGroup(buyingGroupId);
  if (!buyingGroup) return undefined;

  const markets = buyingGroup.primaryMarkets
    .map((marketId) => getMarket(marketId))
    .filter((market): market is Market => Boolean(market));
  const groupSignals = signalsFor({ buyingGroupId });
  const groupCompetitorMoves = competitorMovesFor({ buyingGroupId });
  const groupDocuments = documentsFor({ buyingGroupId });
  const groupTimelineEvents = timelineFor({ buyingGroupId });
  const scenarioModels = atlasIntelligenceSeed.scenarioModels.filter((scenario) => scenario.buyingGroupId === buyingGroupId);
  const retrievalNote = buildRetrievalMessage(buyingGroupId);
  const target = buyingGroup.financialExposure.targetPriceRealization;
  const expected = buyingGroup.financialExposure.expectedPriceRealization;
  const redLine = Math.max(0.5, target - 0.5);
  const buyerAsk = Math.min(6, target + (buyingGroup.riskLevel === 'critical' ? 1.1 : buyingGroup.riskLevel === 'high' ? 0.7 : 0.4));
  const openApprovals = [
    buyingGroup.financialExposure.expectedPriceRealization < target ? 'Finance validation on realization gap' : null,
    groupDocuments.some((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing') ? 'Source readiness before official output' : null,
    groupCompetitorMoves.length ? 'Competitor pressure readout' : null
  ].filter((item): item is string => Boolean(item));
  const memoryArtifacts = buildBuyerMemoryArtifacts({
    buyingGroup,
    documents: groupDocuments,
    timelineEvents: groupTimelineEvents
  });
  const governanceTriggers = buildGovernanceTriggers({
    buyingGroup,
    competitorMoves: groupCompetitorMoves,
    documents: groupDocuments,
    timelineEvents: groupTimelineEvents
  });
  const readiness = buildBuyerReadinessState({
    buyingGroup,
    documents: groupDocuments,
    governanceTriggers
  });
  const realizationGap = target - expected;
  const topSignal = groupSignals[0];

  return {
    buyingGroup,
    markets,
    signals: groupSignals,
    competitorMoves: groupCompetitorMoves,
    documents: groupDocuments,
    timelineEvents: groupTimelineEvents,
    scenarioModels,
    retrievalNote,
    memoryArtifacts,
    governanceTriggers,
    readiness,
    sixtySecondRead: {
      headline: `${buyingGroup.name}: ${euros(buyingGroup.financialExposure.marginAtRisk)} margin at risk; expected realization is ${pct(realizationGap)} below target.`,
      financialImplication: `${euros(buyingGroup.financialExposure.revenueUnderNegotiation)} revenue under negotiation, ${euros(buyingGroup.financialExposure.tradeSpendExposure)} trade spend exposed.`,
      recommendedAction: governanceTriggers[0]?.reason ?? topSignal?.recommendedAction ?? 'Review financials, buyer history and latest source state before the next room.'
    },
    currentState: {
      negotiationRound: buyingGroup.negotiationStage === 'active'
        ? 'Round 3 / active counter'
        : buyingGroup.negotiationStage === 'prep'
          ? 'Prep / next buyer meeting'
          : buyingGroup.negotiationStage === 'closed'
            ? 'Closed / memory only'
            : 'Monitoring / no active counter',
      latestBuyerAsk: pct(buyerAsk),
      pepsicoPosition: pct(expected),
      target: pct(target),
      redLine: pct(redLine),
      nextMilestone: buyingGroup.negotiationStage === 'active'
        ? 'Next governance checkpoint in 5 business days'
        : buyingGroup.negotiationStage === 'prep'
          ? 'Prep readout due before buyer session'
          : 'Monitor for new signal or buyer movement',
      openApprovals
    },
    recommendedActions: [
      {
        label: 'Model financial move',
        href: `/scenario-lab?buyingGroup=${buyingGroup.id}`,
        reason: `${euros(buyingGroup.financialExposure.marginAtRisk)} margin at risk needs scenario pressure testing.`
      },
      {
        label: 'Review source memory',
        href: `/documents?buyingGroup=${buyingGroup.id}`,
        reason: retrievalNote.message
      },
      {
        label: 'Add debrief memory',
        href: `/buying-groups/${buyingGroup.id}?view=memory`,
        reason: 'Capture what happened so future scenario predictions update from buyer memory.'
      }
    ]
  };
}

function parsePercent(value: string) {
  return Number(value.replace('%', '')) || 0;
}

export function buildNegotiationPlanPacket(buyingGroupId: string): NegotiationPlan | undefined {
  const workspace = buildBuyingGroupWorkspacePacket(buyingGroupId);
  if (!workspace) return undefined;

  const { buyingGroup } = workspace;
  const source = workspace.documents.find((document) => document.status === 'approved')?.source
    ?? workspace.documents[0]?.source
    ?? buyingGroup.source;
  const signalSource = workspace.signals[0]?.source ?? source;
  const competitorSource = workspace.competitorMoves[0]?.source ?? signalSource;
  const target = parsePercent(workspace.currentState.target);
  const redLine = parsePercent(workspace.currentState.redLine);
  const pepsicoPosition = parsePercent(workspace.currentState.pepsicoPosition);
  const buyerAsk = parsePercent(workspace.currentState.latestBuyerAsk);
  const fallback = Number(Math.max(redLine, Math.min(target, pepsicoPosition + 0.2)).toFixed(1));
  const marginAtRisk = buyingGroup.financialExposure.marginAtRisk;
  const realizationGap = target - pepsicoPosition;
  const baseDate = atlasIntelligenceSeed.generatedAt;
  const primarySignal = workspace.signals[0];
  const primaryCompetitor = workspace.competitorMoves[0];

  return {
    id: `plan-${buyingGroup.id}-v3`,
    buyingGroupId: buyingGroup.id,
    marketScope: buyingGroup.primaryMarkets,
    version: 3,
    status: 'draft',
    bestIngoingPosition: `Defend ${pepsicoPosition.toFixed(1)}% as the first formal counter while anchoring buyer value above ${target.toFixed(1)}%.`,
    ingoingAskPercent: pepsicoPosition,
    targetPercent: target,
    redLinePercent: redLine,
    fallbackPercent: fallback,
    walkAwayLogic: `Do not move below ${redLine.toFixed(1)}% without CNO and Finance review. If buyer pressure escalates, hold price and move only validated promo timing or volume-support levers.`,
    sellingStory: `Anchor on cost pressure, branded category value, and execution support. Use the latest market signals to defend the ask and keep concessions tied to measurable buyer commitments.`,
    rationale: primarySignal
      ? `${primarySignal.negotiationImplication} This supports a value-led posture rather than a pure price concession.`
      : `${buyingGroup.name} has ${euros(marginAtRisk)} margin at risk and a ${pct(realizationGap)} realization gap, so the plan should protect the approved corridor before adding trade support.`,
    kamSafeGuidance: `Use the approved posture, category proof points, and buyer commitment asks. Do not expose internal red lines, fallback thresholds, confidence gaps, or sensitive margin controls.`,
    canConcede: [
      `Q4 promo phasing up to ${euros(Math.round(buyingGroup.financialExposure.tradeSpendExposure * 0.18))} if tied to incremental volume`,
      'Local activation support when buyer confirms execution windows',
      'Market offset discussion where Finance has validated volume recovery'
    ],
    cannotConcede: [
      `Formal counter below ${redLine.toFixed(1)}% without source-backed finance review`,
      'Open-ended trade spend without retailer commitment',
      'Customer-facing disclosure of internal margin controls or fallback logic'
    ],
    concessionPath: [
      {
        id: `step-${buyingGroup.id}-1`,
        stepNumber: 1,
        trigger: `Buyer holds ask at ${buyerAsk.toFixed(1)}% or references affordability pressure`,
        offer: `Hold ${pepsicoPosition.toFixed(1)}% and add evidence on cost pressure / branded value`,
        cost: 0,
        expectedBuyerResponse: 'Push for support but keep negotiation inside approved corridor',
        guardrail: 'Inside guardrail',
        source
      },
      {
        id: `step-${buyingGroup.id}-2`,
        stepNumber: 2,
        trigger: 'Buyer asks for tangible support before the next governance checkpoint',
        offer: `Move to ${fallback.toFixed(1)}% only with Q4 promo phasing and volume commitment`,
        cost: Math.round(buyingGroup.financialExposure.tradeSpendExposure * 0.18),
        expectedBuyerResponse: 'Higher acceptance probability, but Finance validation required',
        guardrail: fallback <= redLine + 0.1 ? 'Near red line' : 'Inside guardrail',
        source: signalSource
      },
      {
        id: `step-${buyingGroup.id}-3`,
        stepNumber: 3,
        trigger: 'Buyer threatens sanctions or market-level delist pressure',
        offer: 'Escalate to central/local lever package; do not create a new price floor in the room',
        cost: Math.round(marginAtRisk * 0.08),
        expectedBuyerResponse: 'May pause sanctions while buyer evaluates execution package',
        guardrail: 'Approval required',
        source: competitorSource
      }
    ],
    levers: [
      {
        id: `lever-${buyingGroup.id}-price`,
        label: 'Price corridor defense',
        leverType: 'price',
        owner: 'central',
        expectedImpact: `Protects target realization at ${target.toFixed(1)}%`,
        financialImpact: { marginImpact: Math.round(marginAtRisk * 0.22), revenueImpact: Math.round(buyingGroup.financialExposure.revenueUnderNegotiation * 0.006) },
        allowedUse: 'available',
        source
      },
      {
        id: `lever-${buyingGroup.id}-promo`,
        label: 'Promo timing support',
        leverType: 'promo',
        owner: 'local',
        expectedImpact: 'Improves acceptance while preserving base price architecture',
        financialImpact: { tradeSpendImpact: -Math.round(buyingGroup.financialExposure.tradeSpendExposure * 0.18), volumeImpact: Math.round(buyingGroup.financialExposure.volumeExposure * 0.12) },
        allowedUse: 'approval_required',
        source: signalSource
      },
      {
        id: `lever-${buyingGroup.id}-offset`,
        label: 'Market offset / volume recovery',
        leverType: 'market_offset',
        owner: 'joint',
        expectedImpact: 'Absorbs part of the tradeoff outside the primary market if validated',
        financialImpact: { marginImpact: Math.round(marginAtRisk * 0.11), volumeImpact: Math.round(buyingGroup.financialExposure.volumeExposure * 0.18) },
        allowedUse: 'approval_required',
        source: workspace.scenarioModels[0] ? source : signalSource
      }
    ],
    resistancePlan: [
      {
        id: `resistance-${buyingGroup.id}-sanction`,
        buyerMove: 'Sanction or shelf pressure threat',
        responsePlan: 'Use category value proof, competitor readout, and approved execution levers; escalate before changing price.',
        escalationTrigger: `Any request below ${redLine.toFixed(1)}% or margin impact above ${euros(Math.round(marginAtRisk * 0.15))}`,
        source: competitorSource
      },
      {
        id: `resistance-${buyingGroup.id}-proof`,
        buyerMove: 'Buyer challenges inflation or category value proof',
        responsePlan: 'Pull approved evidence pack and cite source date/freshness before offering support.',
        escalationTrigger: 'Evidence source is stale, missing, or challenged by buyer',
        source: signalSource
      }
    ],
    scenarioOutcomes: [
      {
        id: `outcome-${buyingGroup.id}-base`,
        label: `Hold ${pepsicoPosition.toFixed(1)}%`,
        description: 'Best protects margin, but buyer acceptance depends on proof quality.',
        probabilityToLand: Math.max(42, Math.min(76, 72 - riskRank(buyingGroup.riskLevel) * 7)),
        nrImpact: Math.round(buyingGroup.financialExposure.revenueUnderNegotiation * (pepsicoPosition / 100)),
        gmImpact: Math.round(marginAtRisk * 0.18),
        volumeImpact: -Math.round(buyingGroup.financialExposure.volumeExposure * 0.08),
        guardrailStatus: 'inside_guardrail',
        source
      },
      {
        id: `outcome-${buyingGroup.id}-fallback`,
        label: `${fallback.toFixed(1)}% + promo phasing`,
        description: 'More likely to land, but requires validation and careful redaction for KAM use.',
        probabilityToLand: Math.max(55, Math.min(84, 80 - riskRank(buyingGroup.riskLevel) * 5)),
        nrImpact: Math.round(buyingGroup.financialExposure.revenueUnderNegotiation * (fallback / 100) - buyingGroup.financialExposure.tradeSpendExposure * 0.18),
        gmImpact: Math.round(marginAtRisk * 0.08),
        volumeImpact: Math.round(buyingGroup.financialExposure.volumeExposure * 0.10),
        guardrailStatus: fallback <= redLine + 0.1 ? 'near_red_line' : 'inside_guardrail',
        source: signalSource
      },
      {
        id: `outcome-${buyingGroup.id}-breach`,
        label: `${Math.max(0, redLine - 1).toFixed(1)}% breach test`,
        description: 'Useful only as a downside guardrail view; should not become a negotiable offer.',
        probabilityToLand: Math.max(68, Math.min(91, 88 - riskRank(buyingGroup.riskLevel) * 3)),
        nrImpact: Math.round(buyingGroup.financialExposure.revenueUnderNegotiation * ((redLine - 1) / 100) - marginAtRisk * 0.18),
        gmImpact: -Math.round(marginAtRisk * 0.22),
        volumeImpact: Math.round(buyingGroup.financialExposure.volumeExposure * 0.18),
        guardrailStatus: 'breaches_red_line',
        source
      }
    ],
    editableAssumptions: [],
    sourceIds: workspace.documents.map((document) => document.id),
    linkedScenarioIds: workspace.scenarioModels.map((scenario) => scenario.id),
    linkedTimelineEventIds: workspace.timelineEvents.slice(0, 8).map((event) => event.id),
    versionHistory: [
      {
        version: 2,
        status: 'superseded',
        createdAt: '2025-11-12T10:00:00.000Z',
        lockedAt: '2025-11-18T14:30:00.000Z',
        summary: 'Prior-year plan locked after final debrief and used as the first source for this cycle.'
      },
      {
        version: 3,
        status: 'draft',
        createdAt: baseDate,
        summary: 'Current draft generated from buyer memory, financial exposure, sources, and active signals.'
      }
    ]
  };
}

export function calculateScenarioOutputs(inputs: ScenarioInputs, baseRevenue = 22000000): ScenarioOutputs {
  const realizationDelta = inputs.expectedRealizationPercent - 2.4;
  const askPremium = inputs.priceIncreasePercent - inputs.expectedRealizationPercent;
  const contractFactor = Math.max(0.25, inputs.contractLengthMonths / 12);
  const pressurePenalty = inputs.competitorPressureLevel === 'high' ? 1.35 : inputs.competitorPressureLevel === 'medium' ? 1.1 : 0.85;
  const priceAskImpact = baseRevenue * (askPremium / 100) * 0.18;
  const revenueImpact = Math.round((baseRevenue * (realizationDelta / 100) + priceAskImpact + baseRevenue * (inputs.volumeChangePercent / 100) * 0.6 - inputs.concessionAmount) * contractFactor);
  const tradeSpendImpact = -Math.round(inputs.tradeSpendChange * contractFactor);
  const volumeImpact = Math.round(baseRevenue * (inputs.volumeChangePercent / 100) * 0.35 * contractFactor);
  const marginImpact = Math.round(revenueImpact * 0.32 + tradeSpendImpact * 0.58 - inputs.costInflationPercent * 65000 * pressurePenalty * contractFactor);
  const priceRealizationImpact = Math.round((baseRevenue * (realizationDelta / 100) + priceAskImpact) * contractFactor);
  const gapToPlanImpact = Math.round(1100000 - priceRealizationImpact + Math.max(0, -volumeImpact) * 0.4);
  const riskAdjustedValue = Math.round((revenueImpact + marginImpact + tradeSpendImpact) * (inputs.buyerAcceptanceProbability / 100));
  const riskLevel = inputs.buyerAcceptanceProbability < 45 || inputs.competitorPressureLevel === 'high'
    ? 'high'
    : inputs.buyerAcceptanceProbability > 68 && marginImpact > 0
      ? 'medium'
      : 'medium';

  return {
    revenueImpact,
    marginImpact,
    volumeImpact,
    tradeSpendImpact,
    priceRealizationImpact,
    gapToPlanImpact,
    riskAdjustedValue,
    riskLevel,
    recommendation: marginImpact < 0
      ? 'Do not use without finance validation; margin impact is negative.'
      : riskLevel === 'high'
        ? 'Use only with validation and a clear buyer acceptance rationale.'
        : 'Viable scenario for review; save to timeline before use.'
  };
}

export const navGroups = [
  {
    label: 'Monitor',
    items: [
      { label: 'Europe Overview', href: '/' },
      { label: 'Markets', href: '/markets' },
      { label: 'Signals', href: '/signals' },
      { label: 'Competitors', href: '/competitors' }
    ]
  },
  {
    label: 'Buying Groups',
    items: [
      { label: 'All Groups', href: '/buying-groups' },
      { label: 'EDEKA', href: '/buying-groups/edeka' },
      { label: 'Tesco', href: '/buying-groups/tesco' },
      { label: 'Carrefour', href: '/buying-groups/carrefour' },
      { label: 'Rewe', href: '/buying-groups/rewe' },
      { label: 'Ahold Delhaize', href: '/buying-groups/ahold-delhaize' }
    ]
  },
  {
    label: 'Impact',
    items: [
      { label: 'Financial Impact', href: '/financial-impact' },
      { label: 'Scenario Lab', href: '/scenario-lab' }
    ]
  },
  {
    label: 'Memory',
    items: [
      { label: 'Documents', href: '/documents' },
      { label: 'Timeline', href: '/intelligence' },
      { label: 'Debriefs', href: '/intelligence?type=debrief_created' }
    ]
  }
];
