import capabilityFlagsJson from '@/src/data/config/agent-capability-flags.json';
import runtimePolicyJson from '@/src/data/config/agent-runtime-policy.json';
import voicePolicyJson from '@/src/data/config/agent-voice-policy.json';
import brandStrategicContextPacketsJson from '@/src/data/demo/brand-strategic-context-packets.json';
import brandStrategicContextHandoffRequirementsJson from '@/src/data/config/brand-strategic-context-handoff-requirements.json';
import brandStrategicContextRuntimeFileDropPolicyJson from '@/src/data/config/brand-strategic-context-runtime-file-drop-policy.json';
import momentumSourceExtractsJson from '@/src/data/demo/momentum-source-extracts.json';
import momentumIntelligenceSourcePacketsJson from '@/src/data/demo/momentum-intelligence-source-packets.json';
import momentumSourceHandoffRequirementsJson from '@/src/data/config/momentum-source-handoff-requirements.json';
import momentumSourceRuntimeFileDropPolicyJson from '@/src/data/config/momentum-source-runtime-file-drop-policy.json';
import sourcePeriodPolicyJson from '@/src/data/config/source_period_policy.json';
import skillRegistryJson from '@/src/data/config/agent-skill-registry.json';
import experienceTemplateRegistryJson from '@/src/data/config/experience-template-registry.json';
import viewRegistryJson from '@/src/data/config/dynamic-view-registry.json';
import pricingPowerGuardrailsJson from '@/src/data/config/pricing_power_guardrails.json';
import outputQualityStandardsJson from '@/src/data/config/output-quality-standards.json';
import {
  findBrandRecordByIdentity,
  getDiagnosisEvidence,
  getDiagnosisResult,
  getDiagnosisRuleTrace,
  getEvidenceReadiness,
  getGrowthAvailabilityRecord,
  getGrowthNavigatorVitals,
  getKpiDeepDiveSections,
  getMentalAvailabilityRecord,
  getMomentumMonitor,
  getPatternRadarRecord,
  getTreatmentPlanOptions,
  metric
} from '@/src/lib/data';
import { buildMeasuredMomentumSourceFromGrowthNavigator, buildMomentumSourceFromSourceExtract, mergeMomentumSourceExtracts } from '@/src/lib/intelligence/momentum-source-adapters';
import { buildEquityReasoningRead } from '@/src/lib/intelligence/equity-reasoning';
import { buildBenchmarkLensExplainer } from '@/src/lib/intelligence/benchmark-lens-explainer';
import { buildChartReadModule } from '@/src/lib/intelligence/chart-read-module';
import { buildExecutiveVerdictModule } from '@/src/lib/intelligence/executive-verdict-module';
import { buildSourceReadinessModule } from '@/src/lib/intelligence/source-readiness-module';
import { buildDemographicDiagnosticStateModule } from '@/src/lib/intelligence/demographic-diagnostic-state-module';
import { buildProvocationQuestionsModule } from '@/src/lib/intelligence/provocation-questions-module';
import type { BrandHealthRecord, MentalAvailabilitySourcePacket, Momentum } from '@/src/types/domain';
import type {
  AgentCapabilityDefinition,
  AgentRuntimePolicy,
  AgentVoicePolicy,
  AgentSkillDefinition,
  BrandIntelligencePacket,
  BrandStrategicContext,
  BrandStrategicContextHandoffRequirement,
  BrandStrategicContextReadiness,
  BrandStrategicContextReadinessCheck,
  BrandStrategicContextRuntimeSourceFileDropAudit,
  BrandStrategicContextRuntimeSourceFileDropPolicy,
  BrandStrategicContextRuntimeSourceFileDropReadiness,
  BrandStrategicContextSourcePath,
  BrandStrategicContextSourcePacket,
  DynamicViewDefinition,
  ExperienceTemplateDefinition,
  GrowthProvocation,
  IntelligenceEvidenceGap,
  MomentumIntelligenceSourcePacket,
  MomentumIntelligenceRead,
  MomentumOutputQualityCheck,
  OutputQualityCheck,
  MomentumRuntimeSourceFileDropAudit,
  MomentumRuntimeSourceFileDropPolicy,
  MomentumRuntimeSourceFileDropReadiness,
  MomentumSourceHandoffRequirement,
  MomentumSourcePath,
  MomentumSourceReadiness,
  MomentumSourceReadinessCheck,
  MomentumSourceExtractPacket,
  MomentumTrendContext,
  MomentumTrendDirection,
  MomentumTrendMetricRead,
  RoomToGrowRead
} from '@/src/lib/intelligence/types';

export const agentSkillRegistry = skillRegistryJson as AgentSkillDefinition[];
export const dynamicViewRegistry = viewRegistryJson as DynamicViewDefinition[];
export const experienceTemplateRegistry = experienceTemplateRegistryJson as ExperienceTemplateDefinition[];
const outputQualityStandards = outputQualityStandardsJson as Array<{
  id: string;
  label: string;
  appliesTo: string[];
  guardrail: string;
}>;
export const agentCapabilityRegistry = capabilityFlagsJson as AgentCapabilityDefinition[];
export const agentRuntimePolicy = runtimePolicyJson as AgentRuntimePolicy;
export const agentVoicePolicy = voicePolicyJson as AgentVoicePolicy;
export const brandStrategicContextPackets = brandStrategicContextPacketsJson as BrandStrategicContextSourcePacket[];
export const momentumSourceExtracts = momentumSourceExtractsJson as MomentumSourceExtractPacket[];
export const momentumIntelligenceSourcePackets = momentumIntelligenceSourcePacketsJson as MomentumIntelligenceSourcePacket[];
export const momentumSourceRuntimeFileDropPolicy = momentumSourceRuntimeFileDropPolicyJson as MomentumRuntimeSourceFileDropPolicy;
export const brandStrategicContextRuntimeFileDropPolicy = brandStrategicContextRuntimeFileDropPolicyJson as BrandStrategicContextRuntimeSourceFileDropPolicy;
const momentumSourceHandoffRequirements = momentumSourceHandoffRequirementsJson as {
  requirements: Omit<MomentumSourceHandoffRequirement, 'currentStatus' | 'currentDetail' | 'sourceLabel' | 'nextAction'>[];
};
const brandStrategicContextHandoffRequirements = brandStrategicContextHandoffRequirementsJson as {
  requirements: Omit<BrandStrategicContextHandoffRequirement, 'currentStatus' | 'currentDetail' | 'sourceLabel' | 'nextAction'>[];
};

const PERCEIVED_VALUE_LANGUAGE = 'Perceived Value describes whether people believe the brand is worth paying more for. It is broad brand-equity evidence, not SKU-level pricing guidance.';
const pricingPowerGuardrails = pricingPowerGuardrailsJson as {
  validFor: string[];
  notValidFor: string[];
  requiredLanguage: string;
};
const sourcePeriodPolicy = sourcePeriodPolicyJson as {
  defaultWithGrowthNavigator: MomentumTrendContext['sourcePeriodCompatibility'];
  defaultWithoutGrowthNavigator: MomentumTrendContext['sourcePeriodCompatibility'];
};

function buildBrandStrategicContext(
  record: BrandHealthRecord,
  acceptedSourcePacket?: BrandStrategicContextSourcePacket
): BrandStrategicContext {
  const sourcePacket = acceptedSourcePacket ?? brandStrategicContextPackets.find((packet) => packet.brandId === record.brandId);
  if (sourcePacket) {
    const approved = sourcePacket.reviewStatus === 'approved_source';
    const hasCoreContext = Boolean(sourcePacket.brandStatement && sourcePacket.positioning && sourcePacket.objectives.length > 0);
    return {
      status: approved && hasCoreContext ? 'available' : 'partial',
      officialName: 'Brand Strategic Context',
      aliases: [
        'brand book',
        'brand DNA',
        'brand foundations',
        'brand positioning',
        'brand objectives',
        'brand strategy brief'
      ],
      sourceType: sourcePacket.sourceType,
      sourceOwner: sourcePacket.sourceOwner,
      sourceDate: sourcePacket.sourceDate,
      reviewStatus: sourcePacket.reviewStatus,
      brandStatement: sourcePacket.brandStatement,
      brandDna: sourcePacket.brandDna,
      positioning: sourcePacket.positioning,
      objectives: sourcePacket.objectives,
      portfolioContext: sourcePacket.portfolioContext,
      planningPriorities: sourcePacket.planningPriorities,
      creativePlatform: sourcePacket.creativePlatform,
      approvedClaims: sourcePacket.approvedClaims,
      claimsNotToMake: sourcePacket.claimsNotToMake,
      sourceLabel: sourcePacket.sourceLabel,
      caveats: [
        ...sourcePacket.caveats,
        sourcePacket.reviewStatus !== 'approved_source'
          ? 'Treat this as prototype context only; do not present it as official PepsiCo brand strategy.'
          : '',
        sourcePacket.positioning ? '' : 'Approved positioning is still missing.',
        sourcePacket.creativePlatform ? '' : 'Approved creative platform is still missing.'
      ].filter(Boolean)
    };
  }

  return {
    status: 'missing',
    officialName: 'Brand Strategic Context',
    aliases: [
      'brand book',
      'brand DNA',
      'brand foundations',
      'brand positioning',
      'brand objectives',
      'brand strategy brief'
    ],
    sourceType: null,
    sourceOwner: null,
    sourceDate: null,
    reviewStatus: 'draft',
    brandStatement: null,
    brandDna: [],
    positioning: null,
    objectives: [],
    portfolioContext: record.portfolioRole ? `Current prototype portfolio role: ${record.portfolioRole}. Validate against the official brand source before using as strategic direction.` : null,
    planningPriorities: [],
    creativePlatform: null,
    approvedClaims: [],
    claimsNotToMake: [],
    sourceLabel: null,
    caveats: [
      'Official brand book / DNA / objective source is not loaded yet.',
      'Use BBE and Growth Navigator evidence to diagnose the brand, but do not infer strategic intent, creative platform, or annual objectives without an approved brand source.'
    ]
  };
}

function strategicContextCheckStatus(
  sourceReady: boolean,
  hasPrototypeValue: boolean,
  hasPartialValue = false
): BrandStrategicContextReadinessCheck['status'] {
  if (sourceReady) return 'source_ready';
  if (hasPrototypeValue) return 'prototype_only';
  if (hasPartialValue) return 'partial';
  return 'missing';
}

function buildBrandStrategicContextReadinessCheck(input: {
  id: string;
  label: string;
  sourceReady: boolean;
  hasPrototypeValue: boolean;
  hasPartialValue?: boolean;
  sourceLabel: string | null;
  readyDetail: string;
  prototypeDetail: string;
  partialDetail?: string;
  missingDetail: string;
  requiredSource: string;
  guardrail: string;
}): BrandStrategicContextReadinessCheck {
  const status = strategicContextCheckStatus(input.sourceReady, input.hasPrototypeValue, input.hasPartialValue);
  return {
    id: input.id,
    label: input.label,
    status,
    sourceLabel: input.sourceLabel,
    detail: status === 'source_ready'
      ? input.readyDetail
      : status === 'prototype_only'
        ? input.prototypeDetail
        : status === 'partial'
          ? input.partialDetail ?? input.prototypeDetail
          : input.missingDetail,
    requiredSource: input.requiredSource,
    guardrail: input.guardrail
  };
}

function buildBrandStrategicContextHandoffRequirements(
  checks: BrandStrategicContextReadinessCheck[]
): BrandStrategicContextHandoffRequirement[] {
  return brandStrategicContextHandoffRequirements.requirements.map((requirement) => {
    const check = checks.find((item) => item.id === requirement.checkId);
    const currentStatus = check?.status ?? 'missing';
    return {
      ...requirement,
      currentStatus,
      currentDetail: check?.detail ?? 'Readiness check is missing from the active packet.',
      sourceLabel: check?.sourceLabel ?? null,
      nextAction: currentStatus === 'source_ready'
        ? 'Keep the approved source linked to human review before executive or agency circulation.'
        : `${requirement.sourceOwnerRole} should provide ${requirement.acceptedSourceTypes.join(', ')} context with ${requirement.requiredFields.slice(0, 3).join(', ')}.`
    };
  });
}

function inferBrandStrategicContextSourcePath(input: {
  explicitSourcePacket?: BrandStrategicContextSourcePacket;
  activeSourcePacket?: BrandStrategicContextSourcePacket;
}): BrandStrategicContextSourcePath {
  if (!input.activeSourcePacket) return 'missing';
  if (input.explicitSourcePacket) return 'browser_local_promoted_packet';
  if (input.activeSourcePacket.reviewStatus === 'approved_source') return 'approved_source_packet';
  return 'static_prototype_packet';
}

function buildBrandStrategicContextReadiness(input: {
  strategicContext: BrandStrategicContext;
  sourcePacket?: BrandStrategicContextSourcePacket;
  sourcePath: BrandStrategicContextSourcePath;
}): BrandStrategicContextReadiness {
  const sourceLabel = input.sourcePacket?.sourceLabel ?? input.strategicContext.sourceLabel ?? null;
  const sourceOwnerApproved = input.sourcePath === 'approved_source_packet' && input.sourcePacket?.reviewStatus === 'approved_source';
  const hasFoundations = Boolean(input.sourcePacket?.brandStatement && input.sourcePacket.brandDna.length > 0 && input.sourcePacket.portfolioContext);
  const hasSomeFoundations = Boolean(input.sourcePacket?.brandStatement || input.sourcePacket?.brandDna.length || input.sourcePacket?.portfolioContext);
  const hasPositioningObjectives = Boolean(input.sourcePacket?.positioning && input.sourcePacket.objectives.length > 0 && input.sourcePacket.planningPriorities.length > 0);
  const hasSomePositioningObjectives = Boolean(input.sourcePacket?.positioning || input.sourcePacket?.objectives.length || input.sourcePacket?.planningPriorities.length);
  const hasCreativeClaims = Boolean(input.sourcePacket?.creativePlatform && input.sourcePacket.approvedClaims.length > 0 && input.sourcePacket.claimsNotToMake.length > 0);
  const hasSomeCreativeClaims = Boolean(input.sourcePacket?.creativePlatform || input.sourcePacket?.approvedClaims.length || input.sourcePacket?.claimsNotToMake.length);

  const checks = [
    buildBrandStrategicContextReadinessCheck({
      id: 'source-owner-review-status',
      label: 'Source-owner review status',
      sourceReady: sourceOwnerApproved,
      hasPrototypeValue: Boolean(input.sourcePacket),
      sourceLabel,
      readyDetail: 'Approved source-owner Brand Strategic Context packet is loaded for this brand.',
      prototypeDetail: input.sourcePacket
        ? 'Brand Strategic Context exists, but it is not an approved canonical source-owner packet.'
        : 'No Brand Strategic Context source packet is loaded.',
      missingDetail: 'Approved source-owner Brand Strategic Context packet is missing.',
      requiredSource: 'Approved brand book, brand DNA, strategy brief, annual planning document, or creative brief for the active brand.',
      guardrail: 'Do not treat draft, prototype, browser-local, or reviewed-local packets as official PepsiCo brand strategy.'
    }),
    buildBrandStrategicContextReadinessCheck({
      id: 'brand-foundations-source',
      label: 'Brand foundations and DNA',
      sourceReady: sourceOwnerApproved && hasFoundations,
      hasPrototypeValue: !sourceOwnerApproved && hasFoundations,
      hasPartialValue: hasSomeFoundations,
      sourceLabel,
      readyDetail: 'Approved brand statement, DNA, and portfolio context are loaded.',
      prototypeDetail: 'Brand foundations are present, but not from an approved canonical source-owner packet.',
      partialDetail: 'Some brand-foundation fields are present, but the official foundation block is incomplete.',
      missingDetail: 'Approved brand statement, DNA, and portfolio context are missing.',
      requiredSource: 'Brand book, brand DNA, or strategy brief with brand statement, foundations, and portfolio context.',
      guardrail: 'Do not infer brand DNA or portfolio role from BBE scores, typology, or diagnostic output.'
    }),
    buildBrandStrategicContextReadinessCheck({
      id: 'positioning-objectives-source',
      label: 'Positioning, objectives, and priorities',
      sourceReady: sourceOwnerApproved && hasPositioningObjectives,
      hasPrototypeValue: !sourceOwnerApproved && hasPositioningObjectives,
      hasPartialValue: hasSomePositioningObjectives,
      sourceLabel,
      readyDetail: 'Approved positioning, objectives, and planning priorities are loaded.',
      prototypeDetail: 'Positioning, objectives, or planning priorities are present, but not from an approved canonical source-owner packet.',
      partialDetail: 'Some positioning, objectives, or priority fields are present, but the official planning block is incomplete.',
      missingDetail: 'Approved positioning, objectives, and planning priorities are missing.',
      requiredSource: 'Brand book, strategy brief, or annual planning document with approved positioning, objectives, and planning priorities.',
      guardrail: 'If positioning or objectives are missing, ask for source context instead of inventing brand intent.'
    }),
    buildBrandStrategicContextReadinessCheck({
      id: 'creative-platform-claims-source',
      label: 'Creative platform and claims',
      sourceReady: sourceOwnerApproved && hasCreativeClaims,
      hasPrototypeValue: !sourceOwnerApproved && hasCreativeClaims,
      hasPartialValue: hasSomeCreativeClaims,
      sourceLabel,
      readyDetail: 'Approved creative platform, allowed claims, and claim boundaries are loaded.',
      prototypeDetail: 'Creative platform or claim boundaries are present, but not from an approved canonical source-owner packet.',
      partialDetail: 'Some creative platform or claim fields are present, but the official claims block is incomplete.',
      missingDetail: 'Approved creative platform, allowed claims, and claim boundaries are missing.',
      requiredSource: 'Brand book, creative brief, or strategy brief with approved platform language and claim boundaries.',
      guardrail: 'Do not invent creative platforms, campaign claims, or claim permissions from diagnosis evidence.'
    })
  ];
  const canonicalForExecutiveUse = checks.every((check) => check.status === 'source_ready');
  const blockers = checks
    .filter((check) => check.status !== 'source_ready')
    .map((check) => `${check.label}: ${check.requiredSource}`);

  return {
    status: canonicalForExecutiveUse
      ? 'ready_for_source_review'
      : input.sourcePacket
        ? 'blocked_for_executive_use'
        : 'missing',
    sourcePath: input.sourcePath,
    sourceLabel,
    reviewStatus: input.sourcePacket?.reviewStatus ?? 'not_applicable',
    canonicalForExecutiveUse,
    checks,
    handoffRequirements: buildBrandStrategicContextHandoffRequirements(checks),
    blockers,
    caveats: [
      canonicalForExecutiveUse
        ? 'All required Brand Strategic Context source blocks are approved source-owner backed; human review is still required before executive or agency circulation.'
        : 'Brand Strategic Context is not official for executive or agency use until source-owner approved brand foundations, positioning/objectives, and creative/claims blocks are loaded.',
      input.sourcePath === 'browser_local_promoted_packet'
        ? 'Browser-local promoted Brand Strategic Context packets are useful for preview, not canonical enterprise source truth.'
        : '',
      input.sourcePath === 'static_prototype_packet'
        ? 'Prototype-reviewed Brand Strategic Context can power demo behavior, but should stay visibly caveated.'
        : '',
      'Canonical source writes and runtime auto-consumption remain disabled until source-owner governance enables them.'
    ].filter(Boolean)
  };
}

function momentumOf(record: BrandHealthRecord, metricName: string): Momentum {
  return metric(record, metricName)?.momentum ?? 'Unknown';
}

function buildMomentumIntelligenceRead(
  record: BrandHealthRecord,
  sourcePacket?: MomentumIntelligenceSourcePacket
): MomentumIntelligenceRead {
  const demandPowerMomentum = momentumOf(record, 'Demand Power');
  const perceivedValueMomentum = momentumOf(record, 'Pricing Power');
  const smdMomentum = {
    salient: momentumOf(record, 'Salient'),
    meaningful: momentumOf(record, 'Meaningful'),
    different: momentumOf(record, 'Different')
  };
  const redSignals = [
    demandPowerMomentum === 'Declining' ? 'Demand Power is declining.' : null,
    perceivedValueMomentum === 'Declining' ? 'Perceived Value is declining.' : null,
    smdMomentum.salient === 'Declining' ? 'Salient is declining.' : null,
    smdMomentum.meaningful === 'Declining' ? 'Meaningful is declining.' : null,
    smdMomentum.different === 'Declining' ? 'Different is declining.' : null
  ].filter((item): item is string => Boolean(item));
  const knownMomentumCount = [demandPowerMomentum, perceivedValueMomentum, smdMomentum.salient, smdMomentum.meaningful, smdMomentum.different]
    .filter((item) => item !== 'Unknown').length;

  return {
    status: knownMomentumCount >= 4 ? 'available' : knownMomentumCount > 0 ? 'partial' : 'missing',
    headline: redSignals.length
      ? `${record.brandName} has visible red momentum that should be addressed before action planning.`
      : `${record.brandName} has no visible red BBE momentum in the current packet.`,
    demandPowerMomentum,
    perceivedValueMomentum,
    smdMomentum,
    redSignals,
    caveats: [
      knownMomentumCount < 5 ? 'One or more momentum reads are missing or unknown in the current Brand Health Record.' : '',
      sourcePacket?.sourceLabel ? `Momentum context source: ${sourcePacket.sourceLabel}.` : '',
      sourcePacket?.marketContext ? `Market context: ${sourcePacket.marketContext.market}, ${sourcePacket.marketContext.period}.` : '',
      'Momentum should be read with source period and confidence context before being used in BGS or QBR.',
      ...(sourcePacket?.caveats ?? [])
    ].filter(Boolean)
  };
}

const TREND_METRIC_MAP = [
  ['Demand Power', 'PowerIndex'],
  ['Perceived Value', 'Premium'],
  ['Salient', 'Salient'],
  ['Meaningful', 'Meaningful'],
  ['Different', 'Different']
] as const;

function trendDirection(delta: number | null): MomentumTrendDirection {
  if (delta === null) return 'insufficient';
  if (Math.abs(delta) < 1) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

function buildTrendMetricRead(record: BrandHealthRecord, metricName: string, sourceTrendKey: string): MomentumTrendMetricRead {
  const points = (record.trends[sourceTrendKey] ?? [])
    .filter((point) => typeof point.value === 'number' && Number.isFinite(point.value));
  const first = points[0];
  const last = points[points.length - 1];
  const delta = first && last && typeof first.value === 'number' && typeof last.value === 'number'
    ? Math.round((last.value - first.value) * 10) / 10
    : null;
  const direction = trendDirection(delta);
  return {
    metric: metricName,
    sourceTrendKey,
    periodCount: points.length,
    firstPeriod: first?.period ?? null,
    lastPeriod: last?.period ?? null,
    firstValue: typeof first?.value === 'number' ? first.value : null,
    lastValue: typeof last?.value === 'number' ? last.value : null,
    delta,
    direction,
    significance: 'not_tested',
    sourceLabel: null,
    caveats: ['Directional trend read from Brand Health Record time series; significance testing was not supplied.'],
    read: delta === null
      ? `${metricName} does not have enough time-series evidence for a multi-quarter read.`
      : `${metricName} moved ${delta > 0 ? '+' : ''}${delta} from ${first?.period} to ${last?.period}; treat as ${direction} directionally unless significance testing is supplied.`
  };
}

function buildMomentumTrendContext(record: BrandHealthRecord, sourcePacket?: MomentumIntelligenceSourcePacket): MomentumTrendContext {
  const sourceTrendReads = new Map((sourcePacket?.trendEvidence?.metricReads ?? []).map((read) => [read.metric, read]));
  const metricReads = TREND_METRIC_MAP.map(([metricName, trendKey]) => sourceTrendReads.get(metricName) ?? buildTrendMetricRead(record, metricName, trendKey));
  const availableReads = metricReads.filter((read) => read.periodCount >= 2);
  const compatibility = record.growthNavigator
    ? sourcePeriodPolicy.defaultWithGrowthNavigator
    : sourcePeriodPolicy.defaultWithoutGrowthNavigator;
  const sourceCompatibility = sourcePacket?.trendEvidence?.sourcePeriodCompatibility ?? compatibility;
  const significanceTestedReads = metricReads.filter((read) => read.significance !== 'not_tested').length;

  return {
    status: availableReads.length >= 4 ? 'available' : availableReads.length > 0 ? 'partial' : 'missing',
    sourcePeriodCompatibility: sourceCompatibility,
    sourcePeriodLabel: sourceCompatibility.replaceAll('_', ' '),
    metricReads,
    caveats: [
      significanceTestedReads
        ? `${significanceTestedReads} trend read${significanceTestedReads === 1 ? '' : 's'} include significance-tested source evidence.`
        : 'Trend deltas are directional unless the source provides significance-tested movement.',
      ...(sourcePacket?.trendEvidence?.caveats ?? []),
      sourceCompatibility === 'directionally_comparable'
        ? 'BBE and Growth Navigator periods are directionally comparable, not synchronized causal proof.'
        : '',
      sourceCompatibility === 'insufficient'
        ? 'The packet lacks enough source-period evidence to connect BBE and commercial context.'
        : ''
    ].filter(Boolean)
  };
}

function buildMomentumQualityChecks(packet: {
  record: BrandHealthRecord;
  roomToGrow: RoomToGrowRead;
  momentum: MomentumIntelligenceRead;
  trendContext: MomentumTrendContext;
  momentumSource: MomentumIntelligenceSourcePacket | undefined;
}): MomentumOutputQualityCheck[] {
  return [
    {
      id: 'red-momentum-visible',
      label: 'Red momentum visible',
      status: packet.momentum.redSignals.length ? 'pass' : 'watch',
      detail: packet.momentum.redSignals.length
        ? packet.momentum.redSignals.join(' ')
        : 'No red BBE momentum is visible in the current packet.',
      guardrail: 'Red momentum must not be hidden.'
    },
    {
      id: 'ahead-behind-not-opportunity',
      label: 'Ahead/Behind not used as room-to-grow',
      status: packet.roomToGrow.status === 'missing' ? 'gap' : 'pass',
      detail: packet.roomToGrow.status === 'missing'
        ? 'Room-to-grow inputs are missing; the system must not substitute Ahead/Behind for opportunity sizing.'
        : 'Room-to-grow read comes from explicit source inputs.',
      guardrail: 'Ahead/Behind is a size-check only, not opportunity or momentum.'
    },
    {
      id: 'source-period-caveated',
      label: 'Source-period compatibility caveated',
      status: packet.trendContext.sourcePeriodCompatibility === 'aligned' ? 'pass' : 'watch',
      detail: `Source-period compatibility is ${packet.trendContext.sourcePeriodLabel}.`,
      guardrail: 'Cross-source reads need source-period caveats before QBR/BGS use.'
    },
    {
      id: 'significance-not-overclaimed',
      label: 'Significance not overclaimed',
      status: packet.trendContext.metricReads.some((read) => read.significance !== 'not_tested') ? 'pass' : 'watch',
      detail: packet.trendContext.metricReads.some((read) => read.significance !== 'not_tested')
        ? 'At least one trend read includes source-provided significance status; reads without it remain caveated.'
        : 'Trend deltas are directional because significance-tested movement is not present in the Brand Health Record trend series.',
      guardrail: 'Do not present simple multi-quarter deltas as statistically significant movement.'
    },
    {
      id: 'smd-weights-source',
      label: 'SMD contribution source',
      status: packet.momentumSource?.smdContributionWeights ? 'pass' : 'gap',
      detail: packet.momentumSource?.smdContributionWeights
        ? `SMD weights loaded from ${packet.momentumSource.smdContributionWeights.sourceLabel}.`
        : 'SMD contribution weights are missing and should remain a visible gap.',
      guardrail: 'Do not infer market/category/quarter-specific SMD weights.'
    }
  ];
}

function buildOutputQualityChecks(input: {
  packetBase: Pick<BrandIntelligencePacket,
    | 'brand'
    | 'activeLens'
    | 'strategicContext'
    | 'strategicContextReadiness'
    | 'peerSet'
    | 'momentumIntelligence'
    | 'momentumTrendContext'
    | 'roomToGrow'
    | 'treatmentOptions'
    | 'evidenceGaps'
    | 'starterProvocations'
  >;
}): OutputQualityCheck[] {
  const packet = input.packetBase;
  return outputQualityStandards.map((standard): OutputQualityCheck => {
    if (standard.id === 'leads-with-point') {
      return {
        ...standard,
        status: packet.momentumIntelligence.headline ? 'pass' : 'watch',
        detail: packet.momentumIntelligence.headline || 'A clear headline read is missing.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'interprets-not-narrates') {
      const hasSoWhat = packet.starterProvocations.length > 0 || packet.treatmentOptions.length > 0;
      return {
        ...standard,
        status: hasSoWhat ? 'pass' : 'watch',
        detail: hasSoWhat
          ? 'The packet contains provocations and/or treatment paths that translate evidence into implications.'
          : 'Add a provocation or treatment path before treating this as a decision-ready artifact.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'honest-certainty') {
      const hasCaveats = packet.evidenceGaps.length > 0
        || packet.momentumTrendContext.caveats.length > 0
        || packet.roomToGrow.caveats.length > 0;
      return {
        ...standard,
        status: hasCaveats ? 'pass' : 'watch',
        detail: hasCaveats
          ? 'Evidence gaps, source-period caveats, or room-to-grow caveats are available to surface.'
          : 'No caveat/gap language is visible in the packet; review before executive use.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'grounded-in-category') {
      return {
        ...standard,
        status: packet.activeLens ? 'pass' : 'gap',
        detail: packet.activeLens
          ? `${packet.brand.category} lens loaded: ${packet.activeLens.activeLens}. Blind spots: ${packet.activeLens.knownBlindSpots.slice(0, 2).join(' ')}`
          : 'Category lens is missing.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'grounded-in-real-brand') {
      return {
        ...standard,
        status: packet.strategicContextReadiness.canonicalForExecutiveUse
          ? 'pass'
          : packet.strategicContext.status === 'missing'
            ? 'gap'
            : 'watch',
        detail: packet.strategicContext.status === 'missing'
          ? 'Brand Strategic Context is missing.'
          : `${packet.strategicContext.status.replaceAll('_', ' ')} context is loaded; ${packet.strategicContextReadiness.status.replaceAll('_', ' ')} for executive use.`,
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'right-comparison-set') {
      return {
        ...standard,
        status: packet.peerSet ? 'pass' : 'gap',
        detail: packet.peerSet
          ? `${packet.peerSet.label}: ${packet.peerSet.peerCount} peers; ${packet.peerSet.selectionBasis}.`
          : 'Approved peer-set basis/count is missing; Ahead/Behind and comparisons must remain caveated.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'names-watchout') {
      const watchout = packet.evidenceGaps[0]?.label
        ?? packet.momentumIntelligence.redSignals[0]
        ?? packet.roomToGrow.caveats[0];
      return {
        ...standard,
        status: watchout ? 'pass' : 'watch',
        detail: watchout || 'Add a watch-out before presenting as a polished artifact.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'ends-in-provocation') {
      return {
        ...standard,
        status: packet.starterProvocations.length ? 'pass' : 'watch',
        detail: packet.starterProvocations[0]?.title ?? 'No starter provocation is available in the packet.',
        guardrail: standard.guardrail
      };
    }
    if (standard.id === 'treatment-boundary') {
      return {
        ...standard,
        status: packet.treatmentOptions.length ? 'pass' : 'gap',
        detail: packet.treatmentOptions[0]
          ? `${packet.treatmentOptions[0].name} is ranked for ${packet.brand.brandName} from the global treatment library.`
          : 'No treatment path is ranked for the active brand.',
        guardrail: standard.guardrail
      };
    }
    return {
      ...standard,
      status: 'watch',
      detail: 'Review this output quality standard before circulation.',
      guardrail: standard.guardrail
    };
  });
}

function sourceReadinessStatus(
  sourceReady: boolean,
  hasPrototypeValue: boolean
): MomentumSourceReadinessCheck['status'] {
  if (sourceReady) return 'source_ready';
  if (hasPrototypeValue) return 'prototype_only';
  return 'missing';
}

function buildMomentumSourceReadinessCheck(input: {
  id: string;
  label: string;
  sourceReady: boolean;
  hasPrototypeValue: boolean;
  sourceLabel: string | null;
  readyDetail: string;
  prototypeDetail: string;
  missingDetail: string;
  requiredSource: string;
  guardrail: string;
}): MomentumSourceReadinessCheck {
  const status = sourceReadinessStatus(input.sourceReady, input.hasPrototypeValue);
  return {
    id: input.id,
    label: input.label,
    status,
    sourceLabel: input.sourceLabel,
    detail: status === 'source_ready'
      ? input.readyDetail
      : status === 'prototype_only'
        ? input.prototypeDetail
        : input.missingDetail,
    requiredSource: input.requiredSource,
    guardrail: input.guardrail
  };
}

function buildMomentumSourceHandoffRequirements(
  checks: MomentumSourceReadinessCheck[]
): MomentumSourceHandoffRequirement[] {
  return momentumSourceHandoffRequirements.requirements.map((requirement) => {
    const check = checks.find((item) => item.id === requirement.checkId);
    const currentStatus = check?.status ?? 'missing';
    return {
      ...requirement,
      currentStatus,
      currentDetail: check?.detail ?? 'Readiness check is missing from the active packet.',
      sourceLabel: check?.sourceLabel ?? null,
      nextAction: currentStatus === 'source_ready'
        ? 'Keep the source linked to human review before executive circulation.'
        : `${requirement.sourceOwnerRole} should provide ${requirement.acceptedExtractShape} with ${requirement.requiredFields.slice(0, 3).join(', ')}.`
    };
  });
}

function inferMomentumSourcePath(input: {
  explicitMomentumSourcePacket?: MomentumIntelligenceSourcePacket;
  sourceExtract?: MomentumSourceExtractPacket;
  staticSourcePacket?: MomentumIntelligenceSourcePacket;
  growthNavigatorSource?: MomentumIntelligenceSourcePacket;
  activeMomentumSource?: MomentumIntelligenceSourcePacket;
}): MomentumSourcePath {
  if (!input.activeMomentumSource) return 'missing';
  if (input.explicitMomentumSourcePacket) return 'browser_local_promoted_packet';
  if (input.sourceExtract?.reviewStatus === 'approved_source') return 'approved_source_extract';
  if (input.sourceExtract?.reviewStatus === 'reviewed_for_prototype') return 'reviewed_prototype_source_extract';
  if (input.staticSourcePacket) return 'static_prototype_packet';
  if (input.growthNavigatorSource) return 'measured_growth_navigator_adapter';
  return 'missing';
}

function buildMomentumSourceReadiness(input: {
  activeMomentumSource?: MomentumIntelligenceSourcePacket;
  sourceExtract?: MomentumSourceExtractPacket;
  sourcePath: MomentumSourcePath;
  roomToGrow: RoomToGrowRead;
  trendContext: MomentumTrendContext;
}): MomentumSourceReadiness {
  const isApprovedSourceExtract = input.sourcePath === 'approved_source_extract';
  const hasMarketAndPeer = Boolean(input.activeMomentumSource?.marketContext && input.activeMomentumSource.peerSet);
  const hasRoomToGrow = input.roomToGrow.status !== 'missing';
  const hasSmdWeights = Boolean(input.activeMomentumSource?.smdContributionWeights);
  const hasSignificance = input.trendContext.metricReads.some((read) => read.significance !== 'not_tested');
  const sourceLabel = input.activeMomentumSource?.sourceLabel ?? input.sourceExtract?.sourceLabel ?? null;
  const reviewStatus = input.sourceExtract?.reviewStatus ?? 'not_applicable';
  const checks = [
    buildMomentumSourceReadinessCheck({
      id: 'source-owner-review-status',
      label: 'Source-owner review status',
      sourceReady: isApprovedSourceExtract,
      hasPrototypeValue: Boolean(input.activeMomentumSource),
      sourceLabel,
      readyDetail: 'Approved source-owner extract is loaded for this brand.',
      prototypeDetail: input.activeMomentumSource
        ? 'Momentum context exists, but it is not an approved source-owner extract.'
        : 'No Momentum source context is loaded.',
      missingDetail: 'Approved source-owner extract is missing.',
      requiredSource: 'Approved source-owner Momentum Intelligence extract for the active brand.',
      guardrail: 'Do not treat prototype or browser-local packets as canonical enterprise source truth.'
    }),
    buildMomentumSourceReadinessCheck({
      id: 'market-share-penetration-source',
      label: 'Market, share, and penetration inputs',
      sourceReady: isApprovedSourceExtract && hasMarketAndPeer && hasRoomToGrow,
      hasPrototypeValue: hasMarketAndPeer || hasRoomToGrow,
      sourceLabel,
      readyDetail: 'Approved market, peer-set, penetration headroom, share gap, and category growth inputs are loaded.',
      prototypeDetail: 'Some market, peer-set, share, or penetration inputs are loaded, but not from an approved source-owner extract.',
      missingDetail: 'Market, peer-set, share, penetration, or category-growth inputs are missing.',
      requiredSource: 'Market/share/penetration/category-growth source extract with source period and owner.',
      guardrail: 'Room-to-grow must come from explicit inputs; Ahead/Behind cannot substitute for opportunity sizing.'
    }),
    buildMomentumSourceReadinessCheck({
      id: 'bbe-contribution-weight-source',
      label: 'BBE contribution weights',
      sourceReady: isApprovedSourceExtract && hasSmdWeights,
      hasPrototypeValue: hasSmdWeights,
      sourceLabel: input.activeMomentumSource?.smdContributionWeights?.sourceLabel ?? sourceLabel,
      readyDetail: 'Approved market/category/period SMD contribution weights are loaded.',
      prototypeDetail: 'SMD contribution weights are present, but not from an approved source-owner extract.',
      missingDetail: 'SMD contribution weights are missing.',
      requiredSource: 'BBE contribution-weight extract with market, category, period, and owner.',
      guardrail: 'Do not infer market/category/quarter-specific SMD weights.'
    }),
    buildMomentumSourceReadinessCheck({
      id: 'movement-significance-source',
      label: 'Movement and significance evidence',
      sourceReady: isApprovedSourceExtract && hasSignificance,
      hasPrototypeValue: hasSignificance,
      sourceLabel: input.activeMomentumSource?.trendEvidence?.sourceLabel ?? sourceLabel,
      readyDetail: 'Approved movement extract includes significance-tested metric reads.',
      prototypeDetail: 'Significance-style movement evidence exists, but it is not approved source-owner truth.',
      missingDetail: 'Significance-tested movement evidence is missing; reads remain directional.',
      requiredSource: 'BBE movement/significance extract with metric-level significance and source-period compatibility.',
      guardrail: 'Do not present simple deltas as statistically significant movement.'
    })
  ];
  const blockers = checks
    .filter((check) => check.status !== 'source_ready')
    .map((check) => `${check.label}: ${check.requiredSource}`);
  const handoffRequirements = buildMomentumSourceHandoffRequirements(checks);
  const canonicalForExecutiveUse = checks.every((check) => check.status === 'source_ready');
  const hasAnyPrototypeValue = checks.some((check) => check.status === 'prototype_only' || check.status === 'source_ready');

  return {
    status: canonicalForExecutiveUse
      ? 'ready_for_source_review'
      : hasAnyPrototypeValue
        ? 'blocked_for_executive_use'
        : 'missing',
    sourcePath: input.sourcePath,
    sourceLabel,
    reviewStatus,
    canonicalForExecutiveUse,
    checks,
    handoffRequirements,
    blockers,
    caveats: [
      canonicalForExecutiveUse
        ? 'All required Momentum source blocks are approved source-extract backed; human review is still required before executive circulation.'
        : 'Momentum Intelligence is not ready for executive use until source-owner extracts cover market/share/penetration, SMD contribution weights, and movement/significance evidence.',
      input.sourcePath === 'browser_local_promoted_packet'
        ? 'Browser-local promoted Momentum packets are useful for preview, not canonical enterprise source truth.'
        : '',
      input.sourcePath === 'static_prototype_packet' || input.sourcePath === 'reviewed_prototype_source_extract'
        ? 'Prototype-reviewed source context can power demo behavior, but should stay visibly caveated.'
        : '',
      'Canonical source writes and runtime auto-consumption remain disabled until source-owner governance enables them.'
    ].filter(Boolean)
  };
}

function buildDefaultMomentumRuntimeSourceFileDropAudit(): MomentumRuntimeSourceFileDropAudit {
  return {
    auditMode: 'not_scanned_client_context',
    scannedAt: new Date().toISOString(),
    sourceDirectoryExists: false,
    expectedSourceDirectory: momentumSourceRuntimeFileDropPolicy.expectedSourceDirectory,
    candidateFileCount: 0,
    fileKindAudits: momentumSourceRuntimeFileDropPolicy.requiredFileKinds.map((fileKind) => ({
      fileKind,
      present: false,
      expectedPathHint: `${momentumSourceRuntimeFileDropPolicy.expectedSourceDirectory}${fileKind}.json`,
      candidatePaths: [],
      parsedBundleType: null,
      rowCount: 0,
      brandIds: [],
      reviewStatuses: [],
      issues: ['Runtime source-owner file-drop directory was not scanned in this client-safe packet context.']
    })),
    caveats: [
      'Client-side packet inspection cannot read the governed source-owner file landing zone.',
      'Server-governed turns can attach a read-only file-drop audit, but still cannot consume files as canonical evidence while policy gates are disabled.'
    ]
  };
}

function buildMomentumRuntimeSourceFileDropReadiness(
  runtimeFileDropAudit: MomentumRuntimeSourceFileDropAudit = buildDefaultMomentumRuntimeSourceFileDropAudit()
): MomentumRuntimeSourceFileDropReadiness {
  const loadedFileKinds = momentumSourceRuntimeFileDropPolicy.requiredFileKinds.filter((fileKind) =>
    runtimeFileDropAudit.fileKindAudits.some((audit) => audit.fileKind === fileKind && audit.present && audit.issues.length === 0)
  );
  const missingFileKinds = momentumSourceRuntimeFileDropPolicy.requiredFileKinds.filter((fileKind) => !loadedFileKinds.includes(fileKind));
  const blockers = [
    ...momentumSourceRuntimeFileDropPolicy.disabledReasons,
    runtimeFileDropAudit.auditMode === 'not_scanned_client_context'
      ? 'Runtime source-owner file-drop audit has not run in this packet context.'
      : '',
    runtimeFileDropAudit.sourceDirectoryExists
      ? ''
      : `Expected source-owner file directory is not present: ${runtimeFileDropAudit.expectedSourceDirectory}`,
    ...runtimeFileDropAudit.fileKindAudits.flatMap((audit) =>
      audit.issues.map((issue) => `${audit.fileKind}: ${issue}`)
    ),
    ...momentumSourceRuntimeFileDropPolicy.promotionRequirements
      .filter((requirement) => /governance|persistence|approved_source|validation/i.test(requirement))
      .map((requirement) => `Required before runtime use: ${requirement}`)
  ].filter(Boolean);
  const status = momentumSourceRuntimeFileDropPolicy.defaultRuntimeConsumptionEnabled && momentumSourceRuntimeFileDropPolicy.canonicalUseEnabled && missingFileKinds.length === 0
    ? 'ready'
    : missingFileKinds.length === 0 && runtimeFileDropAudit.auditMode === 'server_directory_scan'
      ? 'ready_for_governance_review'
      : 'blocked';

  return {
    id: 'momentum-runtime-source-file-drop-readiness-v1',
    policyId: momentumSourceRuntimeFileDropPolicy.id,
    status,
    defaultRuntimeConsumptionEnabled: momentumSourceRuntimeFileDropPolicy.defaultRuntimeConsumptionEnabled,
    canonicalUseEnabled: momentumSourceRuntimeFileDropPolicy.canonicalUseEnabled,
    acceptedBundleType: momentumSourceRuntimeFileDropPolicy.acceptedBundleType,
    expectedSourceDirectory: momentumSourceRuntimeFileDropPolicy.expectedSourceDirectory,
    templatePath: momentumSourceRuntimeFileDropPolicy.templatePath,
    requiredFileKinds: momentumSourceRuntimeFileDropPolicy.requiredFileKinds,
    loadedFileKinds,
    missingFileKinds,
    audit: runtimeFileDropAudit,
    blockers,
    nextAction: status === 'ready_for_governance_review'
      ? 'Review source-owner file audit, source-owner approval, and canonical-use governance before enabling runtime consumption.'
      : 'Collect approved source-owner file bundles in the accepted template shape, then review canonical-use governance before enabling runtime consumption.',
    guardrails: momentumSourceRuntimeFileDropPolicy.guardrails,
    caveats: [
      ...momentumSourceRuntimeFileDropPolicy.caveats,
      ...runtimeFileDropAudit.caveats
    ]
  };
}

function buildDefaultBrandStrategicContextRuntimeSourceFileDropAudit(): BrandStrategicContextRuntimeSourceFileDropAudit {
  return {
    auditMode: 'not_scanned_client_context',
    scannedAt: new Date().toISOString(),
    sourceDirectoryExists: false,
    expectedSourceDirectory: brandStrategicContextRuntimeFileDropPolicy.expectedSourceDirectory,
    candidateFileCount: 0,
    fileKindAudits: brandStrategicContextRuntimeFileDropPolicy.requiredFileKinds.map((fileKind) => ({
      fileKind,
      present: false,
      expectedPathHint: `${brandStrategicContextRuntimeFileDropPolicy.expectedSourceDirectory}${fileKind}.json`,
      candidatePaths: [],
      parsedBundleType: null,
      rowCount: 0,
      brandIds: [],
      reviewStatuses: [],
      sourceTypes: [],
      issues: ['Brand Strategic Context source-owner file-drop directory was not scanned in this client-safe packet context.']
    })),
    caveats: [
      'Client-side packet inspection cannot read the governed Brand Strategic Context source-owner file landing zone.',
      'Server-governed turns can attach a read-only file-drop audit, but still cannot consume files as canonical brand strategy while policy gates are disabled.'
    ]
  };
}

function buildBrandStrategicContextRuntimeSourceFileDropReadiness(
  runtimeFileDropAudit: BrandStrategicContextRuntimeSourceFileDropAudit = buildDefaultBrandStrategicContextRuntimeSourceFileDropAudit()
): BrandStrategicContextRuntimeSourceFileDropReadiness {
  const loadedFileKinds = brandStrategicContextRuntimeFileDropPolicy.requiredFileKinds.filter((fileKind) =>
    runtimeFileDropAudit.fileKindAudits.some((audit) => audit.fileKind === fileKind && audit.present && audit.issues.length === 0)
  );
  const missingFileKinds = brandStrategicContextRuntimeFileDropPolicy.requiredFileKinds.filter((fileKind) => !loadedFileKinds.includes(fileKind));
  const blockers = [
    ...brandStrategicContextRuntimeFileDropPolicy.disabledReasons,
    runtimeFileDropAudit.auditMode === 'not_scanned_client_context'
      ? 'Brand Strategic Context source-owner file-drop audit has not run in this packet context.'
      : '',
    runtimeFileDropAudit.sourceDirectoryExists
      ? ''
      : `Expected Brand Strategic Context source-owner file directory is not present: ${runtimeFileDropAudit.expectedSourceDirectory}`,
    ...runtimeFileDropAudit.fileKindAudits.flatMap((audit) =>
      audit.issues.map((issue) => `${audit.fileKind}: ${issue}`)
    ),
    ...brandStrategicContextRuntimeFileDropPolicy.promotionRequirements
      .filter((requirement) => /governance|persistence|approved_source|validation/i.test(requirement))
      .map((requirement) => `Required before runtime use: ${requirement}`)
  ].filter(Boolean);
  const status = brandStrategicContextRuntimeFileDropPolicy.defaultRuntimeConsumptionEnabled && brandStrategicContextRuntimeFileDropPolicy.canonicalUseEnabled && missingFileKinds.length === 0
    ? 'ready'
    : missingFileKinds.length === 0 && runtimeFileDropAudit.auditMode === 'server_directory_scan'
      ? 'ready_for_governance_review'
      : 'blocked';

  return {
    id: 'brand-strategic-context-runtime-source-file-drop-readiness-v1',
    policyId: brandStrategicContextRuntimeFileDropPolicy.id,
    status,
    defaultRuntimeConsumptionEnabled: brandStrategicContextRuntimeFileDropPolicy.defaultRuntimeConsumptionEnabled,
    canonicalUseEnabled: brandStrategicContextRuntimeFileDropPolicy.canonicalUseEnabled,
    acceptedBundleType: brandStrategicContextRuntimeFileDropPolicy.acceptedBundleType,
    expectedSourceDirectory: brandStrategicContextRuntimeFileDropPolicy.expectedSourceDirectory,
    templatePath: brandStrategicContextRuntimeFileDropPolicy.templatePath,
    requiredFileKinds: brandStrategicContextRuntimeFileDropPolicy.requiredFileKinds,
    loadedFileKinds,
    missingFileKinds,
    audit: runtimeFileDropAudit,
    blockers,
    nextAction: status === 'ready_for_governance_review'
      ? 'Review Brand Strategic Context source-owner file audit, source-owner approval, and canonical-use governance before enabling runtime consumption.'
      : 'Collect approved Brand Strategic Context source-owner file bundles in the accepted template shape, then review canonical-use governance before enabling runtime consumption.',
    guardrails: brandStrategicContextRuntimeFileDropPolicy.guardrails,
    caveats: [
      ...brandStrategicContextRuntimeFileDropPolicy.caveats,
      ...runtimeFileDropAudit.caveats
    ]
  };
}

function hasRoomToGrowInputs(sourcePacket?: MomentumIntelligenceSourcePacket) {
  const inputs = sourcePacket?.roomToGrowInputs;
  return Boolean(
    inputs
    && Number.isFinite(inputs.penetrationHeadroom)
    && Number.isFinite(inputs.demandPowerShareVsMarketShareGap)
    && Number.isFinite(inputs.categoryGrowth)
  );
}

function buildRoomToGrowRead(sourcePacket?: MomentumIntelligenceSourcePacket): RoomToGrowRead {
  if (sourcePacket && hasRoomToGrowInputs(sourcePacket)) {
    const inputs = sourcePacket.roomToGrowInputs;
    const market = sourcePacket.marketContext;
    const readParts = [
      `Penetration headroom is ${inputs.penetrationHeadroom} points`,
      `Demand Power share vs market share gap is ${inputs.demandPowerShareVsMarketShareGap} points`,
      `category growth is ${inputs.categoryGrowth}${market?.categoryGrowthUnit === 'percent' ? '%' : ''}`
    ];
    return {
      status: sourcePacket.evidenceMode === 'measured_partial_extract' ? 'available' : 'partial',
      label: market
        ? `${market.market} room-to-grow context`
        : 'Room-to-grow context available',
      read: `${readParts.join(', ')}. Use this to size the urgency and upside question, not to declare a forecast.`,
      sourceLabel: sourcePacket.sourceLabel,
      evidenceMode: sourcePacket.evidenceMode,
      inputs: {
        penetrationHeadroom: inputs.penetrationHeadroom,
        demandPowerShareVsMarketShareGap: inputs.demandPowerShareVsMarketShareGap,
        categoryGrowth: inputs.categoryGrowth
      },
      caveats: [
        ...sourcePacket.caveats,
        sourcePacket.evidenceMode !== 'measured_partial_extract'
          ? 'This is directional source context; replace with a measured extract before final investment sizing.'
          : '',
        'Do not use room-to-grow context as proof of causality, cannibalization, portfolio migration, or occasion substitution.'
      ].filter(Boolean)
    };
  }

  return {
    status: 'missing',
    label: 'Room to grow unavailable',
    read: 'The current Brand Health Record does not yet contain governed penetration headroom, Demand Power share vs market share, or category growth inputs.',
    sourceLabel: null,
    evidenceMode: null,
    inputs: {
      penetrationHeadroom: null,
      demandPowerShareVsMarketShareGap: null,
      categoryGrowth: null
    },
    caveats: [
      'Do not use Ahead/Behind as a stand-in for room to grow.',
      'Add market/category context before producing the full momentum x room-to-grow grid.'
    ]
  };
}

function buildEvidenceGaps(packet: {
  record: BrandHealthRecord;
  strategicContext: BrandStrategicContext;
  roomToGrow: RoomToGrowRead;
  momentum: MomentumIntelligenceRead;
  momentumSource: MomentumIntelligenceSourcePacket | undefined;
}): IntelligenceEvidenceGap[] {
  const gaps: IntelligenceEvidenceGap[] = [];
  if (packet.strategicContext.status !== 'available') {
    gaps.push({
      id: 'brand-strategic-context',
      label: 'Brand Strategic Context',
      severity: packet.strategicContext.status === 'partial' ? 'medium' : 'high',
      missingInput: packet.strategicContext.status === 'partial'
        ? 'Fully approved Brand Strategic Context source, including positioning, creative platform, and approved claims'
        : 'Official brand book, brand DNA, positioning, objectives, portfolio context, or brand strategy brief',
      whyItMatters: packet.strategicContext.status === 'partial'
        ? 'Partial context helps the agent ask better questions, but official strategy claims still need source approval.'
        : 'The agent needs the real brand foundation to avoid generic reads and to connect BBE evidence to the brand team’s actual objectives.',
      bestNextSource: 'Approved brand book / brand strategy brief / annual objectives source owned by Marketing or Insights',
      affectedSkills: ['answer_brand_question', 'bbe_momentum_intelligence_read', 'create_growth_provocations', 'draft_meeting_story']
    });
  }
  if (!packet.record.growthNavigator || packet.record.growthNavigator.evidenceMode === 'synthetic_assumption') {
    gaps.push({
      id: 'growth-navigator-measured-source',
      label: 'Measured Growth Navigator source',
      severity: packet.record.growthNavigator ? 'medium' : 'high',
      missingInput: 'Measured Growth Navigator extract or reviewed source patch',
      whyItMatters: 'Growth Navigator can explain commercial conversion context, but synthetic assumptions should not be treated as measured facts.',
      bestNextSource: 'Governed Growth Navigator workbook/deck extraction and review workflow',
      affectedSkills: ['bbe_momentum_intelligence_read', 'compare_brands_or_competitors', 'draft_meeting_story']
    });
  }
  if (packet.roomToGrow.status === 'missing') {
    gaps.push({
      id: 'room-to-grow-inputs',
      label: 'Room-to-grow inputs',
      severity: 'high',
      missingInput: 'Penetration headroom, Demand Power share vs market share, and category growth',
      whyItMatters: 'The v8 Momentum Intelligence logic requires opportunity context before sizing urgency and upside.',
      bestNextSource: 'Market data, syndicated share data, Growth Navigator penetration inputs, and category growth source',
      affectedSkills: ['bbe_momentum_intelligence_read', 'create_growth_provocations', 'draft_meeting_story']
    });
  }
  if (!packet.momentumSource?.marketContext || !packet.momentumSource.peerSet) {
    gaps.push({
      id: 'market-peer-context',
      label: 'Market and peer-set context',
      severity: packet.momentumSource ? 'medium' : 'high',
      missingInput: 'Governed market/category period, peer-set definition, and source caveats',
      whyItMatters: 'Dynamic comparison and opportunity views need a visible basis for the market and peer set before making strategy reads.',
      bestNextSource: 'Approved market definition, category period, and comparison-set input from Marketing, Insights, or Growth Navigator',
      affectedSkills: ['bbe_momentum_intelligence_read', 'compare_brands_or_competitors', 'draft_meeting_story']
    });
  }
  if (packet.momentum.status !== 'available') {
    gaps.push({
      id: 'complete-momentum-reads',
      label: 'Complete BBE momentum reads',
      severity: 'medium',
      missingInput: 'Known momentum for Demand Power, Perceived Value, Salient, Meaningful, and Different',
      whyItMatters: 'Momentum is the headline verdict for BGS/QBR use. Unknown reads should be visible rather than smoothed over.',
      bestNextSource: 'Multi-quarter BBE tracker exports with significance-tested movement',
      affectedSkills: ['bbe_momentum_intelligence_read', 'explain_diagnosis_evidence']
    });
  }
  if (!packet.momentumSource?.smdContributionWeights) {
    gaps.push({
      id: 'smd-contribution-weights',
      label: 'SMD contribution weights',
      severity: 'high',
      missingInput: 'Market/category/quarter-specific SMD weights',
      whyItMatters: 'The v8 requirements state that SMD weights change by market, category, and quarter and should inform diagnosis and prioritization.',
      bestNextSource: 'BBE contribution-weight output or reviewed stakeholder input',
      affectedSkills: ['bbe_momentum_intelligence_read', 'explain_diagnosis_evidence', 'create_growth_provocations']
    });
  }
  return gaps;
}

function buildStarterProvocations(record: BrandHealthRecord): GrowthProvocation[] {
  const diagnosisEvidence = getDiagnosisEvidence(record);
  const firstEvidence = diagnosisEvidence.supporting[0];
  const treatment = getTreatmentPlanOptions(record)[0];

  return [
    {
      id: `${record.brandId}-primary-provocation`,
      title: `Pressure-test the ${diagnosisEvidence.diagnosis.name} read`,
      what: firstEvidence?.statement ?? diagnosisEvidence.diagnosis.triggerSummary,
      soWhat: diagnosisEvidence.diagnosis.doctorRead,
      nowWhat: treatment
        ? `Use ${treatment.name} as the first treatment path to test, then validate required proof before committing.`
        : 'Identify the first evidence lens needed before selecting a treatment path.',
      urgency: diagnosisEvidence.diagnosis.severityDefault === 'priority' ? 'act_now' : 'watch',
      evidenceLabels: diagnosisEvidence.supporting.slice(0, 3).map((item) => item.label),
      caveats: diagnosisEvidence.notToConclude.slice(0, 2)
    }
  ];
}

function recommendedViewsFor(packet: Pick<BrandIntelligencePacket, 'roomToGrow' | 'momentumIntelligence' | 'evidenceGaps'>): string[] {
  const views = ['kpi_strip', 'momentum_ladder', 'evidence_ledger'];
  if (packet.roomToGrow.status !== 'missing') views.push('momentum_room_to_grow_grid');
  if (packet.momentumIntelligence.redSignals.length) views.push('smd_driver_map');
  views.push('growth_provocation_list', 'treatment_path_card');
  if (packet.evidenceGaps.length) views.push('data_gap_panel');
  return Array.from(new Set(views));
}

export function buildBrandIntelligencePacket(
  brandId: string,
  sourcePacket?: MentalAvailabilitySourcePacket,
  strategicContextSourcePacket?: BrandStrategicContextSourcePacket,
  momentumSourcePacket?: MomentumIntelligenceSourcePacket,
  runtimeFileDropAudit?: MomentumRuntimeSourceFileDropAudit,
  strategicContextRuntimeFileDropAudit?: BrandStrategicContextRuntimeSourceFileDropAudit
): BrandIntelligencePacket {
  const record = findBrandRecordByIdentity(brandId);
  if (!record) throw new Error(`Unknown brand record: ${brandId}`);

  const staticStrategicContextSource = brandStrategicContextPackets.find((packet) => packet.brandId === record.brandId);
  const activeStrategicContextSource = strategicContextSourcePacket ?? staticStrategicContextSource;
  const strategicContext = buildBrandStrategicContext(record, activeStrategicContextSource);
  const strategicContextSourcePath = inferBrandStrategicContextSourcePath({
    explicitSourcePacket: strategicContextSourcePacket,
    activeSourcePacket: activeStrategicContextSource
  });
  const strategicContextReadiness = buildBrandStrategicContextReadiness({
    strategicContext,
    sourcePacket: activeStrategicContextSource,
    sourcePath: strategicContextSourcePath
  });
  const sourceExtract = mergeMomentumSourceExtracts(
    record,
    momentumSourceExtracts.filter((packet) => packet.brandId === record.brandId)
  );
  const sourceExtractMomentumSource = buildMomentumSourceFromSourceExtract(
    record,
    sourceExtract
  );
  const staticMomentumSource = momentumIntelligenceSourcePackets.find((packet) => packet.brandId === record.brandId);
  const growthNavigatorMomentumSource = buildMeasuredMomentumSourceFromGrowthNavigator(record);
  const activeMomentumSource = momentumSourcePacket
    ?? sourceExtractMomentumSource
    ?? staticMomentumSource
    ?? growthNavigatorMomentumSource;
  const momentumSourcePath = inferMomentumSourcePath({
    explicitMomentumSourcePacket: momentumSourcePacket,
    sourceExtract,
    staticSourcePacket: staticMomentumSource,
    growthNavigatorSource: growthNavigatorMomentumSource,
    activeMomentumSource
  });
  const momentumIntelligence = buildMomentumIntelligenceRead(record, activeMomentumSource);
  const momentumTrendContext = buildMomentumTrendContext(record, activeMomentumSource);
  const roomToGrow = buildRoomToGrowRead(activeMomentumSource);
  const momentumSourceReadiness = buildMomentumSourceReadiness({
    activeMomentumSource,
    sourceExtract,
    sourcePath: momentumSourcePath,
    roomToGrow,
    trendContext: momentumTrendContext
  });
  const momentumRuntimeSourceFileDropReadiness = buildMomentumRuntimeSourceFileDropReadiness(runtimeFileDropAudit);
  const strategicContextRuntimeSourceFileDropReadiness = buildBrandStrategicContextRuntimeSourceFileDropReadiness(strategicContextRuntimeFileDropAudit);
  const momentumQualityChecks = buildMomentumQualityChecks({
    record,
    roomToGrow,
    momentum: momentumIntelligence,
    trendContext: momentumTrendContext,
    momentumSource: activeMomentumSource
  });
  const evidenceGaps = buildEvidenceGaps({
    record,
    strategicContext,
    roomToGrow,
    momentum: momentumIntelligence,
    momentumSource: activeMomentumSource
  });
  const diagnosisResult = getDiagnosisResult(record);
  const diagnosisTrace = getDiagnosisRuleTrace(record);
  const treatmentOptions = getTreatmentPlanOptions(record);
  const equityReasoning = buildEquityReasoningRead(record);
  const benchmarkLensExplainer = buildBenchmarkLensExplainer({
    brand: {
      brandId: record.brandId,
      brandName: record.brandName,
      country: record.country,
      category: record.category,
      period: record.period,
      portfolioRole: record.portfolioRole,
      typology: record.typology
    },
    equityReasoning
  });
  const chartRead = buildChartReadModule(record, equityReasoning);

  const packetBase: Omit<BrandIntelligencePacket, 'executiveVerdict' | 'sourceReadiness' | 'demographicDiagnosticState' | 'provocationQuestions'> = {
    generatedAt: new Date().toISOString(),
    brand: {
      brandId: record.brandId,
      brandName: record.brandName,
      country: record.country,
      category: record.category,
      period: record.period,
      portfolioRole: record.portfolioRole,
      typology: record.typology
    },
    sourceFiles: record.sourceFiles,
    activeLens: record.categoryLens,
    strategicContext,
    strategicContextReadiness,
    momentumSource: activeMomentumSource
      ? {
        sourceLabel: activeMomentumSource.sourceLabel,
        sourceOwner: activeMomentumSource.sourceOwner,
        sourceDate: activeMomentumSource.sourceDate,
        evidenceMode: activeMomentumSource.evidenceMode
      }
      : null,
    marketContext: activeMomentumSource?.marketContext ?? null,
    peerSet: activeMomentumSource?.peerSet ?? null,
    smdContributionWeights: activeMomentumSource?.smdContributionWeights ?? null,
    momentumRuntimeSourceFileDropReadiness,
    strategicContextRuntimeSourceFileDropReadiness,
    displayLanguage: {
      perceivedValueMetricSource: 'Pricing Power',
      perceivedValueUserLabel: 'Perceived Value',
      perceivedValueRequiredLanguage: PERCEIVED_VALUE_LANGUAGE
    },
    dataCoverage: {
      metricCount: Object.keys(record.metrics).length,
      trendMetricCount: Object.keys(record.trends ?? {}).length,
      occasionCount: record.occasions.length,
      hasGrowthNavigator: Boolean(record.growthNavigator),
      growthNavigatorEvidenceMode: record.growthNavigator?.evidenceMode ?? 'missing',
      hasMarketContext: Boolean(activeMomentumSource?.marketContext && activeMomentumSource.peerSet),
      hasBrandStrategicContext: strategicContext.status !== 'missing',
      hasApprovedBrandStrategicContext: strategicContextReadiness.canonicalForExecutiveUse,
      hasRuntimeBrandStrategicContextSourceFileDrop: strategicContextRuntimeSourceFileDropReadiness.status === 'ready',
      hasSmdContributionWeights: Boolean(activeMomentumSource?.smdContributionWeights),
      hasRoomToGrowInputs: roomToGrow.status !== 'missing',
      hasApprovedMomentumSource: momentumSourceReadiness.canonicalForExecutiveUse,
      hasRuntimeMomentumSourceFileDrop: momentumRuntimeSourceFileDropReadiness.status === 'ready'
    },
    metrics: record.metrics,
    diagnosisResult,
    diagnosisTrace,
    evidenceReadiness: getEvidenceReadiness(record),
    kpiSections: getKpiDeepDiveSections(record),
    momentum: getMomentumMonitor(record),
    momentumIntelligence,
    equityReasoning,
    benchmarkLensExplainer,
    chartRead,
    momentumTrendContext,
    momentumQualityChecks,
    outputQualityChecks: [],
    momentumSourceReadiness,
    roomToGrow,
    growthNavigatorVitals: getGrowthNavigatorVitals(record),
    growthAvailability: getGrowthAvailabilityRecord(record),
    mentalAvailability: getMentalAvailabilityRecord(record, sourcePacket),
    treatmentOptions,
    patternRadar: getPatternRadarRecord(record, sourcePacket),
    evidenceGaps,
    starterProvocations: buildStarterProvocations(record),
    recommendedViewIds: [],
    agentGuardrails: [
      'BBE is the diagnostic spine.',
      'LLMs explain, compare, summarize, challenge, teach, and package; they do not invent diagnoses or treatments.',
      pricingPowerGuardrails.requiredLanguage,
      'Perceived Value is broad brand-equity price justification, not SKU-level pricing guidance.',
      ...pricingPowerGuardrails.notValidFor.map((item) => `Pricing Power is not valid for: ${item}.`),
      'Do not infer cannibalization, portfolio migration, or occasion substitution without measured evidence.',
      'Treatments and provocations are options to consider or paths to test; humans decide.'
    ]
  };

  const outputQualityChecks = buildOutputQualityChecks({ packetBase });
  const executiveVerdict = buildExecutiveVerdictModule({
    ...packetBase,
    outputQualityChecks
  });
  const sourceReadiness = buildSourceReadinessModule({
    ...packetBase,
    executiveVerdict
  });
  const demographicDiagnosticState = buildDemographicDiagnosticStateModule({
    ...packetBase,
    sourceReadiness
  });
  const provocationQuestions = buildProvocationQuestionsModule({
    ...packetBase,
    executiveVerdict,
    sourceReadiness,
    demographicDiagnosticState
  });
  const packetWithQuality: BrandIntelligencePacket = {
    ...packetBase,
    outputQualityChecks,
    executiveVerdict,
    sourceReadiness,
    demographicDiagnosticState,
    provocationQuestions
  };

  return {
    ...packetWithQuality,
    recommendedViewIds: recommendedViewsFor(packetWithQuality)
  };
}

export function findAgentSkill(skillId: string): AgentSkillDefinition | undefined {
  return agentSkillRegistry.find((skill) => skill.id === skillId);
}

export function findDynamicView(viewId: string): DynamicViewDefinition | undefined {
  return dynamicViewRegistry.find((view) => view.id === viewId);
}

export function findExperienceTemplate(templateId: string): ExperienceTemplateDefinition | undefined {
  return experienceTemplateRegistry.find((template) => template.id === templateId);
}
