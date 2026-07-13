import type {
  BrandIntelligencePacket,
  SourceReadinessBlock,
  SourceReadinessHandoff,
  SourceReadinessModule,
  SourceReadinessStatus
} from '@/src/lib/intelligence/types';

type SourceReadinessPacketBase = Pick<BrandIntelligencePacket,
  | 'brand'
  | 'chartRead'
  | 'equityReasoning'
  | 'executiveVerdict'
  | 'momentumRuntimeSourceFileDropReadiness'
  | 'momentumSourceReadiness'
  | 'strategicContextReadiness'
  | 'strategicContextRuntimeSourceFileDropReadiness'
>;

function statusFor(packet: SourceReadinessPacketBase): SourceReadinessStatus {
  const sourcePosture = packet.equityReasoning.sourcePosture;
  if (sourcePosture.reviewStatus === 'not_available') return 'missing';
  if (packet.momentumSourceReadiness.canonicalForExecutiveUse && packet.strategicContextReadiness.canonicalForExecutiveUse && sourcePosture.canonicalUseAllowed === 'yes') {
    return 'source_ready';
  }
  if (sourcePosture.reviewStatus === 'reviewed_for_prototype') return 'demo_ready';
  return 'pilot_blocked';
}

function headlineFor(status: SourceReadinessStatus, packet: SourceReadinessPacketBase) {
  if (status === 'source_ready') return `${packet.brand.brandName} source readiness is source-owner ready, with human review still required before circulation.`;
  if (status === 'demo_ready') return `${packet.brand.brandName} is safe for prototype demo and report-module design with caveats, but blocked for official pilot/canonical use.`;
  if (status === 'pilot_blocked') return `${packet.brand.brandName} remains blocked for pilot until source-owner approval and missing source blocks are resolved.`;
  return `${packet.brand.brandName} lacks the governed source posture required for a reliable executive read.`;
}

function blockStatus(input: {
  canonicalReady: boolean;
  hasSource: boolean;
  prototypeOnly?: boolean;
}): SourceReadinessBlock['status'] {
  if (!input.hasSource) return 'missing';
  if (input.canonicalReady) return 'ready';
  if (input.prototypeOnly) return 'review_needed';
  return 'blocked';
}

function sourceBlocks(packet: SourceReadinessPacketBase): SourceReadinessBlock[] {
  const sourcePosture = packet.equityReasoning.sourcePosture;
  const chart = packet.chartRead.primaryChartRead;
  return [
    {
      id: 'bbe-source-ledger',
      label: 'BBE source ledger',
      status: blockStatus({
        hasSource: sourcePosture.reviewStatus !== 'not_available',
        canonicalReady: sourcePosture.canonicalUseAllowed === 'yes',
        prototypeOnly: sourcePosture.reviewStatus === 'reviewed_for_prototype'
      }),
      sourceLabel: sourcePosture.title,
      currentState: `${sourcePosture.reviewStatus.replaceAll('_', ' ')} · ${sourcePosture.evidenceMode} · ${sourcePosture.metricRowsForBrand} brand metric rows`,
      executiveUse: sourcePosture.canonicalUseAllowed === 'yes' ? 'allowed' : sourcePosture.canonicalUseAllowed === 'with_caveat' ? 'with_caveat' : 'blocked',
      requiredForPilot: sourcePosture.pilotPromotionRequirement,
      guardrails: sourcePosture.caveats
    },
    {
      id: 'chart-ledger',
      label: 'Deck chart and metric reconciliation',
      status: chart.evidenceStatus === 'reconciled_chart_and_rows' ? 'review_needed' : chart.evidenceStatus === 'processed_rows_only' ? 'review_needed' : 'blocked',
      sourceLabel: packet.chartRead.sourceReportId,
      currentState: `Primary chart slide ${chart.sourceSlide}: ${chart.reconciliationStatus.replaceAll('_', ' ')} · ${chart.processedMetricRows} processed rows · ${chart.nativeChartCount} native chart payloads`,
      executiveUse: 'with_caveat',
      requiredForPilot: 'Source owner must approve the embedded workbook/chart cache mapping for any automated chart reproduction or official business readout.',
      guardrails: chart.guardrails
    },
    {
      id: 'momentum-source',
      label: 'Momentum Intelligence source',
      status: blockStatus({
        hasSource: packet.momentumSourceReadiness.sourcePath !== 'missing',
        canonicalReady: packet.momentumSourceReadiness.canonicalForExecutiveUse,
        prototypeOnly: packet.momentumSourceReadiness.status === 'ready_for_prototype' || packet.momentumSourceReadiness.status === 'ready_for_source_review'
      }),
      sourceLabel: packet.momentumSourceReadiness.sourceLabel,
      currentState: `${packet.momentumSourceReadiness.status.replaceAll('_', ' ')} via ${packet.momentumSourceReadiness.sourcePath.replaceAll('_', ' ')}`,
      executiveUse: packet.momentumSourceReadiness.canonicalForExecutiveUse ? 'allowed' : 'blocked',
      requiredForPilot: packet.momentumSourceReadiness.blockers[0] ?? 'Approved source-owner Momentum extracts must satisfy every readiness check before executive use.',
      guardrails: packet.momentumSourceReadiness.caveats
    },
    {
      id: 'brand-strategic-context',
      label: 'Brand Strategic Context source',
      status: blockStatus({
        hasSource: Boolean(packet.strategicContextReadiness.sourceLabel),
        canonicalReady: packet.strategicContextReadiness.canonicalForExecutiveUse,
        prototypeOnly: packet.strategicContextReadiness.reviewStatus === 'reviewed_for_prototype'
      }),
      sourceLabel: packet.strategicContextReadiness.sourceLabel,
      currentState: `${packet.strategicContextReadiness.status.replaceAll('_', ' ')} via ${packet.strategicContextReadiness.sourcePath.replaceAll('_', ' ')}`,
      executiveUse: packet.strategicContextReadiness.canonicalForExecutiveUse ? 'allowed' : 'blocked',
      requiredForPilot: packet.strategicContextReadiness.blockers[0] ?? 'Approved brand foundations, positioning/objectives, and creative/claims sources are required before executive or agency use.',
      guardrails: packet.strategicContextReadiness.caveats
    },
    {
      id: 'runtime-source-ingestion',
      label: 'Runtime source ingestion',
      status: packet.momentumRuntimeSourceFileDropReadiness.status === 'ready' && packet.strategicContextRuntimeSourceFileDropReadiness.status === 'ready' ? 'ready' : 'blocked',
      sourceLabel: 'Runtime source file-drop policies',
      currentState: `Momentum runtime ${packet.momentumRuntimeSourceFileDropReadiness.status.replaceAll('_', ' ')} · Strategic runtime ${packet.strategicContextRuntimeSourceFileDropReadiness.status.replaceAll('_', ' ')}`,
      executiveUse: packet.momentumRuntimeSourceFileDropReadiness.canonicalUseEnabled && packet.strategicContextRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'allowed' : 'blocked',
      requiredForPilot: 'Runtime source consumption and canonical use remain disabled until required files, source-owner approval, identity/access, and governance gates clear.',
      guardrails: [
        ...packet.momentumRuntimeSourceFileDropReadiness.guardrails,
        ...packet.strategicContextRuntimeSourceFileDropReadiness.guardrails
      ].slice(0, 6)
    }
  ];
}

function handoffRequirements(packet: SourceReadinessPacketBase): SourceReadinessHandoff[] {
  const momentum = packet.momentumSourceReadiness.handoffRequirements.map((requirement) => ({
    id: `momentum-${requirement.id}`,
    label: requirement.label,
    owner: requirement.sourceOwnerRole,
    currentStatus: requirement.currentStatus.replaceAll('_', ' '),
    nextAction: requirement.nextAction,
    promotionGate: requirement.promotionGate.replaceAll('_', ' ')
  }));
  const strategic = packet.strategicContextReadiness.handoffRequirements.map((requirement) => ({
    id: `strategic-${requirement.id}`,
    label: requirement.label,
    owner: requirement.sourceOwnerRole,
    currentStatus: requirement.currentStatus.replaceAll('_', ' '),
    nextAction: requirement.nextAction,
    promotionGate: requirement.promotionGate.replaceAll('_', ' ')
  }));
  return [...momentum, ...strategic];
}

function unique(items: string[], limit = 10) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= limit) break;
  }
  return result;
}

export function buildSourceReadinessModule(packet: SourceReadinessPacketBase): SourceReadinessModule {
  const sourcePosture = packet.equityReasoning.sourcePosture;
  const status = statusFor(packet);
  const blocks = sourceBlocks(packet);

  return {
    id: 'source-readiness-v1',
    outputModuleId: 'source_readiness',
    title: `${packet.brand.brandName} Source Readiness`,
    brandName: packet.brand.brandName,
    status,
    headline: headlineFor(status, packet),
    demoUse: status === 'missing' ? 'unsafe' : 'safe_with_caveats',
    pilotUse: status === 'source_ready' ? 'ready' : 'blocked',
    canonicalUseAllowed: status === 'source_ready' ? 'yes' : sourcePosture.canonicalUseAllowed,
    sourceBlocks: blocks,
    handoffRequirements: handoffRequirements(packet),
    blockedUses: unique([
      ...sourcePosture.blockedUses,
      ...packet.executiveVerdict.blockedClaims,
      'Official business readout without source-owner approval.',
      'Pilot canonical data store promotion without approved source files.'
    ], 12),
    nextProofNeeded: unique([
      ...packet.executiveVerdict.nextProofNeeded,
      ...packet.momentumSourceReadiness.blockers,
      ...packet.strategicContextReadiness.blockers,
      ...packet.momentumRuntimeSourceFileDropReadiness.blockers,
      ...packet.strategicContextRuntimeSourceFileDropReadiness.blockers
    ], 10),
    runtimeGovernance: {
      momentumRuntimeStatus: packet.momentumRuntimeSourceFileDropReadiness.status,
      strategicRuntimeStatus: packet.strategicContextRuntimeSourceFileDropReadiness.status,
      defaultRuntimeConsumptionEnabled: packet.momentumRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled
        || packet.strategicContextRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled,
      canonicalUseEnabled: packet.momentumRuntimeSourceFileDropReadiness.canonicalUseEnabled
        || packet.strategicContextRuntimeSourceFileDropReadiness.canonicalUseEnabled,
      missingMomentumFileKinds: packet.momentumRuntimeSourceFileDropReadiness.missingFileKinds,
      missingStrategicContextFileKinds: packet.strategicContextRuntimeSourceFileDropReadiness.missingFileKinds
    },
    sourcePosture: {
      title: sourcePosture.title,
      reviewStatus: sourcePosture.reviewStatus,
      evidenceMode: sourcePosture.evidenceMode,
      canonicalUseAllowed: sourcePosture.canonicalUseAllowed,
      read: sourcePosture.read,
      caveats: sourcePosture.caveats,
      pilotPromotionRequirement: sourcePosture.pilotPromotionRequirement
    }
  };
}
