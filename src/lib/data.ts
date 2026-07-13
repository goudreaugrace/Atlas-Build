import records from '@/src/data/demo/brand-health-records.json';
import diagnoses from '@/src/data/config/diagnosis-definitions.json';
import treatments from '@/src/data/config/treatment-definitions.json';
import links from '@/src/data/config/diagnosis-treatment-links.json';
import dialogQuestions from '@/src/data/config/dialog-question-library.json';
import visualizations from '@/src/data/config/visualization-specs.json';
import kpiAreas from '@/src/data/config/kpi-area-definitions.json';
import brandAssets from '@/src/data/config/brand-assets.json';
import momentumPolicy from '@/src/data/config/momentum_policy.json';
import gnFrameworkNodes from '@/src/data/config/gn_framework_nodes.json';
import sourcePeriodPolicy from '@/src/data/config/source_period_policy.json';
import diagnosisRules from '@/src/data/config/diagnosis_rules.json';
import personas from '@/src/data/config/personas.json';
import pricingPowerGuardrails from '@/src/data/config/pricing_power_guardrails.json';
import growthAvailabilityPillars from '@/src/data/config/growth-availability-pillars.json';
import growthAvailabilityDemoPackets from '@/src/data/demo/growth-availability-demo-packets.json';
import mentalAvailabilityFramework from '@/src/data/config/mental-availability-framework.json';
import mentalAvailabilityDemoPackets from '@/src/data/demo/mental-availability-demo-packets.json';
import domainPackRegistry from '@/src/data/config/domain-pack-registry.json';
import { evaluateDiagnosisResult } from '@/src/lib/diagnostics/engine';
import type { DomainPackDefinition } from '@/src/lib/intelligence/types';
import type {
  AiPersona,
  BrandAsset,
  BrandHealthRecord,
  BrandMetric,
  DiagnosisDefinition,
  DiagnosisResult,
  DiagnosisRule,
  DiagnosisRuleCondition,
  DiagnosisRuleTrace,
  DiagnosisTreatmentLink,
  DialogQuestion,
  EvidenceReadiness,
  GnVital,
  GrowthAvailabilityDemoPacket,
  GrowthAvailabilityEvidenceMode,
  GrowthAvailabilityPillarDefinition,
  GrowthAvailabilityPillarRead,
  GrowthAvailabilityPillarStatus,
  GrowthAvailabilityRecord,
  KpiAreaDefinition,
  KpiDeepDiveSection,
  MentalAvailabilityCepRead,
  MentalAvailabilityDemoPacket,
  MentalAvailabilityFramework,
  MentalAvailabilityMeasureRead,
  MentalAvailabilityRecord,
  MentalAvailabilitySourcePacket,
  Momentum,
  MomentumMonitor,
  MomentumMonitorMetric,
  PatternRadarRecord,
  PortfolioEvidenceGap,
  PortfolioRadarRecord,
  PortfolioPattern,
  RuleTraceCondition,
  RuleTraceRule,
  SimilarBrandMatch,
  StrategicRoadmap,
  SymptomFingerprint,
  TreatmentPlanDraft,
  TreatmentPlanOption,
  TreatmentDefinition,
  TreatmentMemoryItem,
  VisualizationSpec
} from '@/src/types/domain';

export const brandRecords = records as unknown as BrandHealthRecord[];
export const diagnosisDefinitions = diagnoses as DiagnosisDefinition[];
export const treatmentDefinitions = treatments as TreatmentDefinition[];
export const diagnosisTreatmentLinks = links as DiagnosisTreatmentLink[];
export const dialogQuestionLibrary = dialogQuestions as DialogQuestion[];
export const visualizationSpecs = visualizations as VisualizationSpec[];
export const kpiAreaDefinitions = kpiAreas as KpiAreaDefinition[];
export const brandAssetDefinitions = brandAssets as BrandAsset[];
export const aiPersonas = personas as AiPersona[];
export const growthAvailabilityPillarDefinitions = growthAvailabilityPillars as GrowthAvailabilityPillarDefinition[];
export const growthAvailabilityDemoPacketDefinitions = growthAvailabilityDemoPackets as GrowthAvailabilityDemoPacket[];
export const mentalAvailabilityFrameworkDefinition = mentalAvailabilityFramework as MentalAvailabilityFramework;
export const mentalAvailabilityDemoPacketDefinitions = mentalAvailabilityDemoPackets as MentalAvailabilityDemoPacket[];
export const domainPackDefinitions = domainPackRegistry as DomainPackDefinition[];
export const gnVitalDefinitions = gnFrameworkNodes as {
  id: string;
  label: string;
  description: string;
  signalAliases: string[];
}[];

export const coreMetrics = ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different'] as const;
export const focusedFundingPocBrandIds = ['lay-s', 'cheetos', 'siete', 'tostitos'] as const;

const focusedFundingPocBrandRank = new Map<string, number>(focusedFundingPocBrandIds.map((brandId, index) => [brandId, index]));

export function getBrandDemoSetup(record: BrandHealthRecord) {
  const readiness = getEvidenceReadiness(record);
  const focusedRank = focusedFundingPocBrandRank.get(record.brandId);
  const focusedPocBrand = focusedRank !== undefined;
  const measuredGrowthNavigator = record.growthNavigator?.evidenceMode === 'measured_full_extract'
    || record.growthNavigator?.evidenceMode === 'measured_partial_extract';
  const fullGrowthNavigator = record.growthNavigator?.evidenceMode === 'measured_full_extract';
  const hasCoreReadiness = readiness.label === 'Validated' || readiness.label === 'Supported';
  const score = (focusedPocBrand ? 100 : 0)
    + (hasCoreReadiness ? 24 : readiness.label === 'Directional' ? 10 : 0)
    + (fullGrowthNavigator ? 16 : measuredGrowthNavigator ? 10 : 0)
    + (record.sourceFiles.length >= 2 ? 6 : record.sourceFiles.length ? 3 : 0)
    - (focusedRank ?? 0);

  if (focusedPocBrand) {
    return {
      label: 'Best demo setup',
      detail: 'Focused POC brand with richer strategic context and support packets.',
      score,
      focusedPocBrand,
      measuredGrowthNavigator
    };
  }

  if (hasCoreReadiness && measuredGrowthNavigator) {
    return {
      label: 'Strong data setup',
      detail: 'Good BBE coverage with measured Growth Navigator support.',
      score,
      focusedPocBrand,
      measuredGrowthNavigator
    };
  }

  return {
    label: 'Standard demo packet',
    detail: 'Available for exploration, with more source gaps to review.',
    score,
    focusedPocBrand,
    measuredGrowthNavigator
  };
}

export function getDemoReadyBrandRecords() {
  return [...brandRecords].sort((a, b) => {
    const rankA = focusedFundingPocBrandRank.get(a.brandId);
    const rankB = focusedFundingPocBrandRank.get(b.brandId);
    if (rankA !== undefined || rankB !== undefined) {
      if (rankA === undefined) return 1;
      if (rankB === undefined) return -1;
      return rankA - rankB;
    }

    const setupDelta = getBrandDemoSetup(b).score - getBrandDemoSetup(a).score;
    if (setupDelta !== 0) return setupDelta;
    return a.brandName.localeCompare(b.brandName);
  });
}

export function findBrandRecordByIdentity(brandId?: string, category?: string): BrandHealthRecord | undefined {
  const decoded = brandId ? decodeURIComponent(brandId).trim() : '';
  const normalized = decoded.toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();

  if (!decoded) return undefined;

  if (normalizedCategory) {
    const exactWithCategory = brandRecords.find((record) => (
      (record.brandId === decoded || record.brandName.toLowerCase() === normalized)
      && record.category.toLowerCase() === normalizedCategory
    ));
    if (exactWithCategory) return exactWithCategory;
  }

  return brandRecords.find((record) => record.brandId === decoded)
    ?? brandRecords.find((record) => record.brandName.toLowerCase() === normalized);
}

export function getAiPersona(personaId?: string): AiPersona {
  return aiPersonas.find((persona) => persona.id === personaId) ?? aiPersonas[0];
}

export function getBrandAsset(record: BrandHealthRecord): BrandAsset | null {
  const asset = brandAssetDefinitions.find((item) => item.brandId === record.brandId);
  if (!asset) return null;
  return {
    ...asset,
    logoUrl: asset.logoUrl ?? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(asset.domain)}&sz=128`
  };
}

export function getDiagnosisResult(record: BrandHealthRecord): DiagnosisResult {
  return evaluateDiagnosisResult(record, diagnosisDefinitions, diagnosisRules as DiagnosisRule[]);
}

export function getPrimaryDiagnosis(record: BrandHealthRecord) {
  return getDiagnosisResult(record).primary.diagnosis;
}

function arrayValue(value: DiagnosisRuleCondition['value']) {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

function conditionMatches(actual: unknown, condition: DiagnosisRuleCondition) {
  const expected = arrayValue(condition.value);
  if (condition.op === 'exists') return actual !== undefined && actual !== null && actual !== '';
  if (condition.op === 'missing') return actual === undefined || actual === null || actual === '';
  if (actual === undefined || actual === null) return false;
  if (condition.op === 'equals') return expected.some((item) => actual === item);
  if (condition.op === 'notEquals') return expected.every((item) => actual !== item);
  if (condition.op === 'in') return expected.some((item) => actual === item);
  if (condition.op === 'notIn') return expected.every((item) => actual !== item);

  const actualNumber = Number(actual);
  const expectedNumber = Number(expected[0]);
  if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) return false;
  if (condition.op === 'lt') return actualNumber < expectedNumber;
  if (condition.op === 'lte') return actualNumber <= expectedNumber;
  if (condition.op === 'gt') return actualNumber > expectedNumber;
  if (condition.op === 'gte') return actualNumber >= expectedNumber;
  return false;
}

function displayConditionValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === undefined || value === null || value === '') return 'missing';
  return String(value);
}

function traceCondition(record: BrandHealthRecord, condition: DiagnosisRuleCondition, group: RuleTraceCondition['group']): RuleTraceCondition {
  const m = metric(record, condition.metric);
  const actual = m?.[condition.field];
  return {
    group,
    metric: condition.metric,
    field: String(condition.field),
    operator: condition.op,
    expected: displayConditionValue(condition.value),
    actual: displayConditionValue(actual),
    matched: conditionMatches(actual, condition),
    evidence: condition.evidence,
    missingEvidence: condition.missingEvidence,
    source: m?.source ?? record.sourceFiles.join(', '),
    wave: m?.wave ?? record.period,
    slide: m?.slide ?? 'Diagnosis rule'
  };
}

function traceRule(record: BrandHealthRecord, rule: DiagnosisRule, result: DiagnosisResult): RuleTraceRule {
  const diagnosis = diagnosisDefinitions.find((item) => item.id === rule.diagnosisId) ?? diagnosisDefinitions[0];
  const candidate = result.candidates.find((item) => item.ruleId === rule.id);
  const conditions = [
    ...(rule.all ?? []).map((condition) => traceCondition(record, condition, 'all' as const)),
    ...(rule.any ?? []).map((condition) => traceCondition(record, condition, 'any' as const)),
    ...(rule.counter ?? []).map((condition) => traceCondition(record, condition, 'counter' as const))
  ];
  const diagnosticConditions = conditions.filter((condition) => condition.group !== 'counter');
  const matchedConditionCount = candidate?.matchedConditionCount
    ?? diagnosticConditions.filter((condition) => condition.matched).length;
  const totalConditionCount = candidate?.totalConditionCount ?? diagnosticConditions.length;

  return {
    ruleId: rule.id,
    diagnosisId: rule.diagnosisId,
    diagnosisName: diagnosis.name,
    description: rule.description,
    priority: rule.priority,
    severity: rule.severity,
    evidenceSummary: rule.evidenceSummary,
    fired: Boolean(candidate),
    score: candidate?.score ?? null,
    confidence: candidate?.confidence ?? null,
    matchedConditionCount,
    totalConditionCount,
    conditions
  };
}

export function getDiagnosisRuleTrace(record: BrandHealthRecord): DiagnosisRuleTrace {
  const result = getDiagnosisResult(record);
  const rules = diagnosisRules as DiagnosisRule[];
  const allRules = rules.map((rule) => traceRule(record, rule, result));
  const fallbackRule: RuleTraceRule = {
    ruleId: result.primary.ruleId,
    diagnosisId: result.primary.diagnosis.id,
    diagnosisName: result.primary.diagnosis.name,
    description: 'Seeded Brand Health Record fallback used because no deterministic rule fired.',
    priority: 999,
    severity: result.primary.severity,
    evidenceSummary: result.primary.evidenceSummary,
    fired: true,
    score: result.primary.score,
    confidence: result.primary.confidence,
    matchedConditionCount: result.primary.matchedConditionCount,
    totalConditionCount: result.primary.totalConditionCount,
    conditions: []
  };
  const primaryRule = allRules.find((rule) => rule.ruleId === result.primary.ruleId) ?? fallbackRule;
  const guardrail = pricingPowerGuardrails as {
    validFor: string[];
    notValidFor: string[];
    requiredLanguage: string;
  };

  return {
    brandName: record.brandName,
    category: record.category,
    period: record.period,
    systemPrinciples: [
      'Diagnosis is deterministic and rules-based; the LLM does not choose the primary diagnosis.',
      'Rules and treatment links come from local JSON config.',
      'The LLM explains, interrogates, and translates the evidence only after the deterministic read exists.',
      'Treatments are options to consider and test, not final commands.'
    ],
    primaryRule,
    allRules,
    candidateRules: allRules.filter((rule) => rule.fired).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    seededDiagnosisId: result.seededDiagnosisId,
    fallbackUsed: result.fallbackUsed,
    sourceFiles: record.sourceFiles,
    categoryLens: record.categoryLens,
    treatmentLinks: getTreatmentRecommendations(result.primary.diagnosis.id).map(({ link, treatment }) => ({
      treatmentId: treatment.id,
      name: treatment.name,
      priority: link.priority,
      tier: treatment.tier,
      family: treatment.family,
      whyThisFits: link.whyThisFits,
      whenNotToUse: link.whenNotToUse
    })),
    pricingGuardrail: guardrail,
    prototypeNotes: [
      'Diagnosis rules are a prototype calibration layer and should be reviewed with BBE stakeholders.',
      'Missing momentum or Growth Navigator evidence lowers confidence but does not automatically invalidate the read.',
      'Category lens caveats are always part of interpretation.',
      'Future edit/versioning workflows should create drafts and impact previews before changing config.'
    ]
  };
}

export function getTreatmentsForDiagnosis(diagnosisId: string): TreatmentDefinition[] {
  const treatmentIds = diagnosisTreatmentLinks
    .filter((l) => l.diagnosisId === diagnosisId)
    .sort((a, b) => a.priority - b.priority)
    .map((l) => l.treatmentId);
  return treatmentIds
    .map((id) => treatmentDefinitions.find((t) => t.id === id))
    .filter(Boolean) as TreatmentDefinition[];
}

export function getTreatmentRecommendations(diagnosisId: string) {
  return diagnosisTreatmentLinks
    .filter((link) => link.diagnosisId === diagnosisId)
    .sort((a, b) => a.priority - b.priority)
    .map((link) => ({
      link,
      treatment: treatmentDefinitions.find((treatment) => treatment.id === link.treatmentId)
    }))
    .filter((item): item is { link: DiagnosisTreatmentLink; treatment: TreatmentDefinition } => Boolean(item.treatment));
}

export function metric(record: BrandHealthRecord, name: string) {
  return record.metrics[name];
}

export function formatMetricValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value;
}

export function getMetricTrend(record: BrandHealthRecord, name: string) {
  return record.trends[name] ?? record.trends[name === 'Demand Power' ? 'PowerIndex' : name === 'Pricing Power' ? 'Premium' : name] ?? [];
}

export function getTrendDelta(record: BrandHealthRecord, name: string) {
  const values = getMetricTrend(record, name).filter((point) => typeof point.value === 'number');
  const first = values[0]?.value;
  const last = values.at(-1)?.value;
  if (typeof first !== 'number' || typeof last !== 'number') return null;

  return {
    first,
    last,
    delta: last - first,
    periods: values.length
  };
}

export function getMetricOpportunityRows(record: BrandHealthRecord) {
  return coreMetrics
    .map((name) => metric(record, name))
    .filter((m): m is BrandMetric => Boolean(m))
    .map((m) => {
      const delta = getTrendDelta(record, m.metric);
      let job = 'Protect';
      let priority = 3;
      let guidance = 'Strong enough to maintain, with normal monitoring.';

      if (m.categoryBand === 'Category Lagging' || m.ahead === 'Not Ahead') {
        job = 'Build';
        priority = 1;
        guidance = 'Not ahead of the benchmark; treat as a likely equity workstream.';
      }
      if (m.momentum === 'Declining') {
        job = m.categoryBand === 'Category Leading' ? 'Renew' : 'Repair';
        priority = 0;
        guidance = 'Momentum is declining; refresh before the weakness becomes harder to reverse.';
      }
      if (m.momentum === 'Unknown') {
        job = priority <= 1 ? job : 'Validate';
        guidance = `${guidance} Momentum is missing, so the read needs a caveat.`;
      }

      return {
        metric: m.metric,
        value: m.value,
        categoryBand: m.categoryBand,
        ahead: m.ahead,
        momentum: m.momentum,
        job,
        priority,
        guidance,
        delta
      };
    })
    .sort((a, b) => a.priority - b.priority || String(a.metric).localeCompare(String(b.metric)));
}

export function getTopOccasions(record: BrandHealthRecord, limit = 6) {
  return [...record.occasions]
    .filter((occasion) => typeof occasion.score === 'number')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

export function getTypologyPeerSummary(record: BrandHealthRecord) {
  const categoryPeers = brandRecords.filter((peer) => peer.category === record.category);
  const counts = categoryPeers.reduce<Record<string, number>>((acc, peer) => {
    const key = peer.typology ?? 'Unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const peersWithSameTypology = categoryPeers
    .filter((peer) => peer.brandId !== record.brandId && peer.typology === record.typology)
    .map((peer) => peer.brandName)
    .slice(0, 4);

  return {
    category: record.category,
    activeTypology: record.typology ?? 'Unknown',
    counts,
    peersWithSameTypology
  };
}

export function getEvidenceConfidence(record: BrandHealthRecord) {
  const metrics = coreMetrics.map((name) => metric(record, name)).filter((m): m is BrandMetric => Boolean(m));
  const knownMomentumCount = metrics.filter((m) => m.momentum !== 'Unknown').length;
  const knownBenchmarkCount = metrics.filter((m) => m.ahead !== 'Unknown').length;
  const hasGnBridge = Boolean(record.growthNavigator);
  const hasComplication = getDiagnosisEvidence(record).complicating.length > 0;

  let label = 'Directional';
  if (knownBenchmarkCount >= 4 && knownMomentumCount >= 3) label = 'Supported';
  if (knownBenchmarkCount >= 5 && knownMomentumCount >= 5 && hasGnBridge) label = 'Validated';

  return {
    label,
    knownMomentumCount,
    knownBenchmarkCount,
    hasGnBridge,
    hasComplication,
    caveat: label === 'Directional'
      ? 'Useful as a hypothesis, but the packet has missing momentum, benchmark, or adjacent conversion evidence.'
      : 'Multiple signals support the read, while caveats should still be reviewed before action.'
  };
}

export function getEvidenceReadiness(record: BrandHealthRecord) {
  const confidence = getEvidenceConfidence(record);
  const diagnosisResult = getDiagnosisResult(record);
  const metrics = coreMetrics.map((name) => metric(record, name));
  const missingCoreMetrics = coreMetrics.filter((name) => !metric(record, name));
  const unknownMomentum = metrics
    .filter((m): m is BrandMetric => Boolean(m) && m.momentum === 'Unknown')
    .map((m) => m.metric);
  const unknownBenchmarks = metrics
    .filter((m): m is BrandMetric => Boolean(m) && m.ahead === 'Unknown')
    .map((m) => m.metric);
  const trendGaps = coreMetrics.filter((name) => getMetricTrend(record, name).filter((point) => typeof point.value === 'number').length < 2);
  const missingInputs = [
    ...missingCoreMetrics.map((name) => `${name} score`),
    ...unknownMomentum.map((name) => `${name} momentum`),
    ...unknownBenchmarks.map((name) => `${name} benchmark status`),
    ...trendGaps.map((name) => `${name} trend history`),
    ...(!record.growthNavigator ? ['Growth Navigator bridge'] : []),
    ...(record.occasions.filter((occasion) => typeof occasion.score === 'number').length ? [] : ['occasion scores'])
  ];
  const availableInputs = [
    `${coreMetrics.length - missingCoreMetrics.length}/${coreMetrics.length} core BBE metrics`,
    `${confidence.knownBenchmarkCount}/${coreMetrics.length} benchmark reads`,
    `${confidence.knownMomentumCount}/${coreMetrics.length} momentum reads`,
    record.growthNavigator ? 'Growth Navigator bridge' : '',
    record.occasions.filter((occasion) => typeof occasion.score === 'number').length ? 'occasion scores' : '',
    record.sourceFiles.length ? `${record.sourceFiles.length} source file${record.sourceFiles.length === 1 ? '' : 's'}` : ''
  ].filter(Boolean);

  let label: EvidenceReadiness['label'] = confidence.label === 'Validated' || confidence.label === 'Supported' ? confidence.label : 'Directional';
  if (diagnosisResult.primary.confidence === 'Fallback' || missingCoreMetrics.length >= 2) label = 'Incomplete';
  if (confidence.label === 'Validated' && (missingInputs.length > 2 || diagnosisResult.primary.confidence !== 'High')) label = 'Supported';

  const tone: EvidenceReadiness['tone'] = label === 'Validated' || label === 'Supported' ? 'good' : label === 'Incomplete' ? 'bad' : 'watch';
  const cappedMissingInputs = Array.from(new Set(missingInputs)).slice(0, 5);

  return {
    label,
    tone,
    diagnosisConfidence: diagnosisResult.primary.confidence,
    evidenceStrength: `${confidence.knownBenchmarkCount}/${coreMetrics.length} benchmark reads · ${confidence.knownMomentumCount}/${coreMetrics.length} momentum reads`,
    caveat: label === 'Incomplete'
      ? 'Treat this brand read as an evidence gap first; enrich the packet before making prescription decisions.'
      : label === 'Directional'
        ? 'Good for hypothesis-building, but missing signals should be filled before locking the plan.'
        : 'Good enough to support the diagnosis, while the named caveats still belong in the decision discussion.',
    availableInputs,
    missingInputs: cappedMissingInputs.length ? cappedMissingInputs : ['No material evidence gaps detected in the active packet.']
  };
}

function availabilityTone(status: GrowthAvailabilityPillarStatus): GrowthAvailabilityPillarRead['tone'] {
  if (status === 'available') return 'good';
  if (status === 'missing' || status === 'conflicted') return 'bad';
  return 'watch';
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function measuredMetricEvidence(record: BrandHealthRecord, metricName: string) {
  const m = metric(record, metricName);
  if (!m) return null;
  return `${metricName}: ${formatMetricValue(m.value)} · ${m.categoryBand} · ${m.ahead} · ${m.momentum}`;
}

function knownMomentumMetrics(record: BrandHealthRecord) {
  return coreMetrics
    .map((name) => metric(record, name))
    .filter((m): m is BrandMetric => Boolean(m) && m.momentum !== 'Unknown');
}

function fallbackGrowthPillarRead(record: BrandHealthRecord, definition: GrowthAvailabilityPillarDefinition): Omit<GrowthAvailabilityPillarRead, keyof GrowthAvailabilityPillarDefinition> {
  const salient = measuredMetricEvidence(record, 'Salient');
  const demandPower = measuredMetricEvidence(record, 'Demand Power');
  const different = measuredMetricEvidence(record, 'Different');
  const momentumMetrics = knownMomentumMetrics(record);
  const topOccasion = getTopOccasions(record, 1)[0];

  if (definition.id === 'mental_availability') {
    return {
      status: salient || topOccasion ? 'directional' : 'missing',
      tone: salient || topOccasion ? 'watch' : 'bad',
      evidenceMode: salient || topOccasion ? 'inferred_from_current_packet' : 'missing',
      read: salient || topOccasion
        ? 'Directional read from BBE Salient, Demand Power, and occasion evidence. True Mental Availability and CEP facts are not loaded yet.'
        : 'Mental Availability cannot be assessed from the current packet.',
      evidence: uniqueList([salient ?? '', demandPower ?? '', topOccasion ? `Top occasion evidence: ${topOccasion.occasion} (${formatMetricValue(topOccasion.score)})` : '']),
      missingInputs: definition.missingEvidenceToImprove,
      caveat: 'Use current BBE and occasion evidence as a bridge only; do not claim Mental Market Share, Mental Penetration, Network Size, Share of Mind, or CEP ownership without a Mental Availability packet.',
      sourceLabel: record.sourceFiles.join(', ')
    };
  }

  if (definition.id === 'distinctive_memory_structures') {
    return {
      status: different ? 'directional' : 'missing',
      tone: different ? 'watch' : 'bad',
      evidenceMode: different ? 'inferred_from_current_packet' : 'missing',
      read: different
        ? 'Directional read from BBE Different only. Distinctive asset strength is not measured in the current packet.'
        : 'Distinctive Memory Structures cannot be assessed from the current packet.',
      evidence: different ? [different] : [],
      missingInputs: definition.missingEvidenceToImprove,
      caveat: 'BBE Different is adjacent evidence, not proof of recognizable brand assets.',
      sourceLabel: record.sourceFiles.join(', ')
    };
  }

  if (definition.id === 'physical_availability') {
    return {
      status: record.growthNavigator ? 'directional' : 'missing',
      tone: record.growthNavigator ? 'watch' : 'bad',
      evidenceMode: record.growthNavigator ? 'inferred_from_current_packet' : 'missing',
      read: record.growthNavigator
        ? 'Directional read from the Growth Navigator bridge. Channel, retailer, shelf, and ecommerce availability facts are not loaded yet.'
        : 'Physical Availability is not assessed in the current packet.',
      evidence: record.growthNavigator ? [`Growth Navigator bridge loaded: ${record.growthNavigator.source}`] : [],
      missingInputs: record.growthNavigator
        ? definition.missingEvidenceToImprove.filter((item) => item !== 'Distribution/ACV')
        : definition.missingEvidenceToImprove,
      caveat: 'Do not infer physical availability from equity scores alone.',
      sourceLabel: record.growthNavigator?.source ?? 'No physical availability source loaded'
    };
  }

  if (definition.id === 'momentum') {
    return {
      status: momentumMetrics.length >= 3 ? 'available' : momentumMetrics.length > 0 ? 'directional' : 'missing',
      tone: momentumMetrics.length >= 3 ? 'good' : momentumMetrics.length > 0 ? 'watch' : 'bad',
      evidenceMode: momentumMetrics.length ? 'measured' : 'missing',
      read: momentumMetrics.length
        ? `${momentumMetrics.length}/${coreMetrics.length} BBE momentum reads are available. Use this as the current momentum signal until Mental Availability and treatment follow-up waves are added.`
        : 'Momentum is not assessable because core BBE momentum reads are missing.',
      evidence: momentumMetrics.map((m) => `${m.metric}: ${m.momentum}`),
      missingInputs: definition.missingEvidenceToImprove.filter((item) => item !== 'Complete BBE momentum'),
      caveat: 'One source of momentum is not a full growth momentum system; add CEP movement, GN trend, and treatment follow-up waves.',
      sourceLabel: record.sourceFiles.join(', ')
    };
  }

  if (definition.id === 'portfolio_growth_availability') {
    return {
      status: record.portfolioRole ? 'directional' : 'missing',
      tone: 'watch',
      evidenceMode: record.portfolioRole ? 'inferred_from_current_packet' : 'missing',
      read: record.portfolioRole
        ? `Directional portfolio context only: ${record.portfolioRole}. Portfolio CEP coverage is not loaded yet.`
        : 'Portfolio Growth Availability is not assessed in the current packet.',
      evidence: record.portfolioRole ? [`Portfolio role: ${record.portfolioRole}`, `Category lens: ${record.categoryLens.activeLens}`] : [],
      missingInputs: definition.missingEvidenceToImprove,
      caveat: 'Portfolio role is context, not proof of portfolio coverage, overlap, or migration.',
      sourceLabel: record.sourceFiles.join(', ')
    };
  }

  return {
    status: 'missing',
    tone: 'bad',
    evidenceMode: 'missing',
    read: `${definition.title} is not assessed in the current packet.`,
    evidence: [],
    missingInputs: definition.missingEvidenceToImprove,
    caveat: definition.guardrail,
    sourceLabel: 'No source loaded'
  };
}

function fallbackGrowthConstraint(record: BrandHealthRecord) {
  const diagnosis = getPrimaryDiagnosis(record);
  return {
    label: `${diagnosis.name} growth constraint`,
    read: `${diagnosis.doctorRead} The Growth Availability layer is currently directional because several future evidence packets are not loaded yet.`,
    nextQuestion: 'Which missing evidence would most improve confidence in the growth constraint?'
  };
}

export function getGrowthAvailabilityRecord(record: BrandHealthRecord): GrowthAvailabilityRecord {
  const demoPacket = growthAvailabilityDemoPacketDefinitions.find((packet) => packet.brandId === record.brandId);
  const sourceLabel = demoPacket?.sourceLabel ?? record.sourceFiles.join(', ');
  const evidenceMode: GrowthAvailabilityEvidenceMode = demoPacket ? 'simulated_prototype' : 'inferred_from_current_packet';

  const pillars = growthAvailabilityPillarDefinitions.map((definition) => {
    const simulated = demoPacket?.pillars[definition.id];
    const fallback = fallbackGrowthPillarRead(record, definition);
    const status = simulated?.status ?? fallback.status;
    return {
      ...definition,
      status,
      tone: availabilityTone(status),
      evidenceMode: simulated ? 'simulated_prototype' : fallback.evidenceMode,
      read: simulated?.read ?? fallback.read,
      evidence: simulated?.evidence ?? fallback.evidence,
      missingInputs: simulated?.missingInputs ?? fallback.missingInputs,
      caveat: simulated?.caveat ?? fallback.caveat,
      sourceLabel: simulated ? sourceLabel : fallback.sourceLabel
    };
  });

  return {
    brandId: record.brandId,
    brandName: record.brandName,
    category: record.category,
    period: demoPacket?.period ?? record.period,
    evidenceMode,
    simulated: Boolean(demoPacket),
    sourceLabel,
    growthConstraint: demoPacket?.growthConstraint ?? fallbackGrowthConstraint(record),
    pillars
  };
}

function mentalMeasureTone(mode: GrowthAvailabilityEvidenceMode, value: number | null): MentalAvailabilityMeasureRead['tone'] {
  if (mode === 'missing') return 'bad';
  if (mode === 'simulated_prototype' || mode === 'inferred_from_current_packet') return 'watch';
  if (value === null) return 'watch';
  return value >= 60 ? 'good' : value >= 35 ? 'watch' : 'bad';
}

function cepRoleTone(role: MentalAvailabilityCepRead['role']): MentalAvailabilityCepRead['tone'] {
  const roleDefinition = mentalAvailabilityFrameworkDefinition.cepRoles.find((item) => item.id === role);
  return roleDefinition?.tone ?? 'watch';
}

function cepRoleLabel(role: MentalAvailabilityCepRead['role']) {
  return mentalAvailabilityFrameworkDefinition.cepRoles.find((item) => item.id === role)?.label ?? role;
}

function fallbackMentalTopline(record: BrandHealthRecord) {
  const topOccasion = getTopOccasions(record, 1)[0];
  return {
    label: 'CEP evidence gap',
    read: topOccasion
      ? `${record.brandName} has current BBE and occasion evidence, but measured Category Entry Point links are not loaded. Treat ${topOccasion.occasion} as a directional clue, not a proven memory structure.`
      : `${record.brandName} has current BBE evidence, but measured Category Entry Point links are not loaded.`,
    strategicQuestion: 'Which buying situations should be measured first to understand mental availability?'
  };
}

function fallbackMentalMeasures(record: BrandHealthRecord): MentalAvailabilityMeasureRead[] {
  const salient = metric(record, 'Salient');
  const demandPower = metric(record, 'Demand Power');
  return mentalAvailabilityFrameworkDefinition.coreMeasures.map((definition) => {
    const inferred = definition.id === 'share_of_mind' && salient
      ? {
          value: Number.isFinite(Number(salient.value)) ? Number(salient.value) : null,
          displayValue: `${formatMetricValue(salient.value)} BBE Salient`,
          read: 'Directional proxy only. BBE Salient can suggest retrievability, but it is not a measured Share of Mind or CEP association metric.',
          evidenceMode: 'inferred_from_current_packet' as GrowthAvailabilityEvidenceMode
        }
      : definition.id === 'mental_market_share' && demandPower
        ? {
            value: Number.isFinite(Number(demandPower.value)) ? Number(demandPower.value) : null,
            displayValue: `${formatMetricValue(demandPower.value)} Demand Power`,
            read: 'Directional proxy only. Demand Power is useful context, but it is not measured Mental Market Share.',
            evidenceMode: 'inferred_from_current_packet' as GrowthAvailabilityEvidenceMode
          }
        : null;

    const evidenceMode = inferred?.evidenceMode ?? 'missing';
    return {
      ...definition,
      value: inferred?.value ?? null,
      displayValue: inferred?.displayValue ?? 'Not loaded',
      read: inferred?.read ?? `${definition.label} is not loaded for this brand.`,
      evidenceMode,
      tone: mentalMeasureTone(evidenceMode, inferred?.value ?? null)
    };
  });
}

function fallbackMentalCeps(record: BrandHealthRecord): MentalAvailabilityCepRead[] {
  return getTopOccasions(record, 3).map((occasion, index) => ({
    id: occasion.occasion.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `occasion_${index + 1}`,
    name: occasion.occasion,
    consumerQuestion: `When buyers are thinking about ${occasion.occasion.toLowerCase()}, does ${record.brandName} come to mind?`,
    role: index === 0 ? 'watch' : 'avoid',
    roleLabel: cepRoleLabel(index === 0 ? 'watch' : 'avoid'),
    tone: cepRoleTone(index === 0 ? 'watch' : 'avoid'),
    priority: index + 1,
    relevance: occasion.score,
    brandAssociation: null,
    competitorPressure: null,
    interpretation: 'Current occasion evidence is directional context only; measured CEP association and competitive mental set are not loaded.',
    action: index === 0
      ? 'Use this as the first CEP measurement candidate before treating it as a growth lane.'
      : 'Keep as a lower-priority hypothesis until measured CEP evidence exists.',
    evidence: [`Occasion score available: ${occasion.score ?? 'missing'}`, `Source: ${occasion.source}`],
    missingInputs: mentalAvailabilityFrameworkDefinition.defaultMissingInputs,
    caveat: 'Occasion scores are not the same as CEP ownership or Mental Availability proof.',
    evidenceMode: 'inferred_from_current_packet',
    sourceLabel: occasion.source
  }));
}

export function getMentalAvailabilityRecord(record: BrandHealthRecord, sourcePacket?: MentalAvailabilitySourcePacket): MentalAvailabilityRecord {
  const demoPacket = sourcePacket ?? mentalAvailabilityDemoPacketDefinitions.find((packet) => packet.brandId === record.brandId);
  const sourceLabel = demoPacket?.sourceLabel ?? record.sourceFiles.join(', ');
  const evidenceMode: GrowthAvailabilityEvidenceMode = demoPacket?.evidenceMode ?? 'inferred_from_current_packet';

  const measures = mentalAvailabilityFrameworkDefinition.coreMeasures.map((definition) => {
    const packetMeasure = demoPacket?.measures[definition.id];
    if (!packetMeasure) return fallbackMentalMeasures(record).find((item) => item.id === definition.id) as MentalAvailabilityMeasureRead;
    return {
      ...definition,
      value: packetMeasure.value,
      displayValue: packetMeasure.displayValue,
      read: packetMeasure.read,
      evidenceMode: packetMeasure.evidenceMode,
      tone: mentalMeasureTone(packetMeasure.evidenceMode, packetMeasure.value)
    };
  });

  const ceps = demoPacket
    ? demoPacket.ceps
        .slice()
        .sort((a, b) => a.priority - b.priority)
        .map((cep): MentalAvailabilityCepRead => ({
          ...cep,
          roleLabel: cepRoleLabel(cep.role),
          tone: cepRoleTone(cep.role),
          evidenceMode: demoPacket.evidenceMode,
          sourceLabel
        }))
    : fallbackMentalCeps(record);

  const missingInputs = uniqueList([
    ...mentalAvailabilityFrameworkDefinition.defaultMissingInputs,
    ...ceps.flatMap((cep) => cep.missingInputs)
  ]).slice(0, 8);

  return {
    brandId: record.brandId,
    brandName: record.brandName,
    category: record.category,
    period: demoPacket?.period ?? record.period,
    evidenceMode,
    simulated: demoPacket?.evidenceMode === 'simulated_prototype',
    sourceLabel,
    principle: mentalAvailabilityFrameworkDefinition.principle,
    topline: demoPacket?.topline ?? fallbackMentalTopline(record),
    measures,
    ceps,
    missingInputs,
    guardrails: mentalAvailabilityFrameworkDefinition.interpretationGuardrails
  };
}

function metricTone(m: BrandMetric | undefined): 'good' | 'watch' | 'bad' {
  if (!m) return 'watch';
  if (m.momentum === 'Declining' || m.categoryBand === 'Category Lagging') return 'bad';
  if (m.ahead === 'Ahead' || m.categoryBand === 'Category Leading') return 'good';
  return 'watch';
}

function metricStrength(m: BrandMetric | undefined): 'strong' | 'weak' | 'unknown' {
  if (!m) return 'unknown';
  if (m.categoryBand === 'Category Leading' || m.ahead === 'Ahead') return 'strong';
  if (m.categoryBand === 'Category Lagging' || m.ahead === 'Not Ahead') return 'weak';
  return 'unknown';
}

function aggregateStrength(metrics: (BrandMetric | undefined)[]): 'strong' | 'weak' | 'unknown' {
  const known = metrics.map(metricStrength).filter((strength) => strength !== 'unknown');
  if (!known.length) return 'unknown';
  return known.filter((strength) => strength === 'strong').length >= known.length / 2 ? 'strong' : 'weak';
}

function aggregateMomentum(metrics: (BrandMetric | undefined)[]): Momentum {
  const known = metrics.map((m) => m?.momentum ?? 'Unknown').filter((momentum) => momentum !== 'Unknown');
  if (!known.length) return 'Unknown';
  if (known.includes('Declining')) return 'Declining';
  if (known.includes('Gaining')) return 'Gaining';
  return 'Holding';
}

function momentumTone(momentum: Momentum, strength: 'strong' | 'weak' | 'unknown'): 'good' | 'watch' | 'bad' {
  if (momentum === 'Gaining' && strength === 'strong') return 'good';
  if (momentum === 'Declining' || (momentum === 'Holding' && strength === 'weak')) return 'bad';
  return 'watch';
}

function momentumPolicyState(strength: 'strong' | 'weak' | 'unknown', momentumValue: Momentum) {
  const policy = momentumPolicy as {
    states: { id: string; label: string; strength: string; momentum: string; tone: 'good' | 'watch' | 'bad'; read: string }[];
  };
  return policy.states.find((state) => state.strength === strength && state.momentum === momentumValue)
    ?? policy.states.find((state) => state.id === 'momentum_unknown')
    ?? { label: 'Momentum Unknown', tone: 'watch' as const, read: 'The current packet does not contain enough momentum evidence.' };
}

export function getMomentumMonitor(record: BrandHealthRecord): MomentumMonitor {
  const policy = momentumPolicy as { principle: string; primaryOutcomeMetrics: string[]; inputMetrics: string[] };
  const outcomeMetrics = policy.primaryOutcomeMetrics.map((name) => metric(record, name));
  const inputMetrics = policy.inputMetrics.map((name) => metric(record, name));
  const currentStrength = aggregateStrength(outcomeMetrics);
  const trajectory = aggregateMomentum(outcomeMetrics);
  const outcomeState = momentumPolicyState(currentStrength, trajectory);
  const inputStrength = aggregateStrength(inputMetrics);
  const inputTrajectory = aggregateMomentum(inputMetrics);
  const inputState = momentumPolicyState(inputStrength, inputTrajectory);

  const metrics: MomentumMonitorMetric[] = [...policy.primaryOutcomeMetrics, ...policy.inputMetrics].map((name) => {
    const m = metric(record, name);
    const strength = metricStrength(m);
    const momentumValue = m?.momentum ?? 'Unknown';
    const state = momentumPolicyState(strength, momentumValue);
    return {
      metric: name,
      value: formatMetricValue(m?.value),
      strength,
      momentum: momentumValue,
      read: state.read,
      tone: momentumTone(momentumValue, strength)
    };
  });

  return {
    principle: policy.principle,
    outcomeRead: outcomeState.label,
    outcomeTone: outcomeState.tone,
    inputRead: inputState.label,
    inputTone: inputState.tone,
    currentStrength,
    trajectory,
    metrics
  };
}

function gnTone(status: string): 'good' | 'watch' | 'bad' {
  if (status === 'support') return 'good';
  if (status === 'pressure') return 'bad';
  return 'watch';
}

function sourceCompatibility(record: BrandHealthRecord) {
  const policy = sourcePeriodPolicy as {
    defaultWithGrowthNavigator: string;
    defaultWithoutGrowthNavigator: string;
    labels: { id: string; label: string }[];
  };
  const id = record.growthNavigator?.evidenceMode === 'synthetic_assumption'
    ? policy.defaultWithoutGrowthNavigator
    : record.growthNavigator
      ? policy.defaultWithGrowthNavigator
      : policy.defaultWithoutGrowthNavigator;
  return policy.labels.find((label) => label.id === id)?.label ?? 'insufficient';
}

function signalMatchesNode(signalName: string, aliases: string[]) {
  const normalized = signalName.toLowerCase();
  return aliases.some((alias) => normalized.includes(alias.toLowerCase()) || alias.toLowerCase().includes(normalized));
}

export function getGrowthNavigatorVitals(record: BrandHealthRecord): GnVital[] {
  const compatibility = sourceCompatibility(record);
  const gn = record.growthNavigator;
  return gnVitalDefinitions.map((node) => {
    const matchedSignals = gn?.driverSignals.filter((signal) => signalMatchesNode(signal.name, node.signalAliases)) ?? [];
    const fallbackBreakpoint = gn?.breakpoints.find((breakpoint) => signalMatchesNode(breakpoint, node.signalAliases));
    const strongestStatus = matchedSignals.find((signal) => signal.status === 'pressure')?.status
      ?? matchedSignals.find((signal) => signal.status === 'watch')?.status
      ?? matchedSignals.find((signal) => signal.status === 'support')?.status
      ?? (fallbackBreakpoint ? 'watch' : 'missing');
    const status = strongestStatus === 'support' || strongestStatus === 'pressure' || strongestStatus === 'watch'
      ? strongestStatus
      : 'missing';
    const keySignals = matchedSignals.length
      ? matchedSignals.map((signal) => signal.evidence)
      : fallbackBreakpoint
        ? [`${fallbackBreakpoint} is named as a Growth Navigator breakpoint, but no deeper signal is in the active packet.`]
        : ['No Growth Navigator signal is available for this vital in the active packet.'];

    return {
      id: node.id,
      label: node.label,
      description: node.description,
      status,
      tone: gnTone(status),
      keySignals,
      sourcePeriod: gn?.source ?? 'Growth Navigator extract missing',
      compatibility,
      diagnosticRelationship: status === 'support' ? 'supports' : status === 'missing' ? 'missing' : 'complicates'
    };
  });
}

function strengthLabel(m: BrandMetric | undefined) {
  if (!m) return 'missing';
  if (m.categoryBand === 'Category Leading' || m.ahead === 'Ahead') return 'strong';
  if (m.categoryBand === 'Category Lagging' || m.ahead === 'Not Ahead') return 'soft';
  return 'mixed';
}

function strongestMetricLabel(record: BrandHealthRecord, names: readonly string[]) {
  const scored = names
    .map((name) => {
      const m = metric(record, name);
      const score = m?.categoryBand === 'Category Leading' || m?.ahead === 'Ahead'
        ? 2
        : m?.categoryBand === 'Category Lagging' || m?.ahead === 'Not Ahead'
          ? 0
          : 1;
      return { name, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.name ?? 'core equity';
}

function softestMetricLabel(record: BrandHealthRecord, names: readonly string[]) {
  const scored = names
    .map((name) => {
      const m = metric(record, name);
      const score = m?.categoryBand === 'Category Leading' || m?.ahead === 'Ahead'
        ? 2
        : m?.categoryBand === 'Category Lagging' || m?.ahead === 'Not Ahead'
          ? 0
          : 1;
      return { name, score };
    })
    .sort((a, b) => a.score - b.score);
  return scored[0]?.name ?? 'core equity';
}

function treatmentFamiliesForRecord(record: BrandHealthRecord) {
  return uniqueList(getTreatmentPlanOptions(record).slice(0, 4).map((option) => option.family));
}

function missingEvidenceBlockers(record: BrandHealthRecord, mentalRead: MentalAvailabilityRecord) {
  const readiness = getEvidenceReadiness(record);
  const blockers = readiness.missingInputs.filter((item) => !item.toLowerCase().startsWith('no material'));
  if (!record.growthNavigator) blockers.push('Growth Navigator bridge');
  if (mentalRead.evidenceMode !== 'measured') blockers.push('measured Mental Availability / CEP evidence');
  if (treatmentFamiliesForRecord(record).some((family) => family.toLowerCase().includes('distinctive'))) {
    blockers.push('distinctive asset recognition evidence');
  }
  return uniqueList(blockers).slice(0, 5);
}

export function getSymptomFingerprint(record: BrandHealthRecord, sourcePacket?: MentalAvailabilitySourcePacket): SymptomFingerprint {
  const diagnosisResult = getDiagnosisResult(record);
  const growthRead = getGrowthAvailabilityRecord(record);
  const mentalRead = getMentalAvailabilityRecord(record, sourcePacket);
  const treatmentPull = treatmentFamiliesForRecord(record);
  const blockers = missingEvidenceBlockers(record, mentalRead);
  const diagnosisPull = diagnosisResult.candidates.slice(0, 3).map((candidate) => candidate.diagnosis.name);
  const strongest = strongestMetricLabel(record, coreMetrics);
  const softest = softestMetricLabel(record, coreMetrics);
  const knownMomentum = coreMetrics
    .map((name) => metric(record, name)?.momentum ?? 'Unknown')
    .filter((momentum) => momentum !== 'Unknown');
  const declining = knownMomentum.filter((momentum) => momentum === 'Declining').length;
  const gaining = knownMomentum.filter((momentum) => momentum === 'Gaining').length;
  const trajectory = declining
    ? `${declining} core KPI${declining === 1 ? '' : 's'} declining`
    : gaining
      ? `${gaining} core KPI${gaining === 1 ? '' : 's'} gaining`
      : knownMomentum.length
        ? 'Core KPI momentum holding or mixed'
        : 'No material momentum signal in active packet';

  const features: SymptomFingerprint['features'] = {
    diagnosisId: diagnosisResult.primary.diagnosis.id,
    diagnosisConfidence: diagnosisResult.primary.confidence,
    category: record.category,
    typology: record.typology,
    demandPowerStrength: strengthLabel(metric(record, 'Demand Power')),
    pricingPowerStrength: strengthLabel(metric(record, 'Pricing Power')),
    meaningfulStrength: strengthLabel(metric(record, 'Meaningful')),
    differentStrength: strengthLabel(metric(record, 'Different')),
    salientStrength: strengthLabel(metric(record, 'Salient')),
    demandPowerMomentum: metric(record, 'Demand Power')?.momentum ?? 'Unknown',
    pricingPowerMomentum: metric(record, 'Pricing Power')?.momentum ?? 'Unknown',
    meaningfulMomentum: metric(record, 'Meaningful')?.momentum ?? 'Unknown',
    differentMomentum: metric(record, 'Different')?.momentum ?? 'Unknown',
    salientMomentum: metric(record, 'Salient')?.momentum ?? 'Unknown',
    hasGrowthNavigator: Boolean(record.growthNavigator),
    growthEvidenceMode: growthRead.evidenceMode,
    mentalEvidenceMode: mentalRead.evidenceMode,
    treatmentPull: treatmentPull.join('|'),
    missingBlockerCount: blockers.length,
    categoryBlindSpotCount: record.categoryLens.knownBlindSpots.length
  };

  return {
    brandId: record.brandId,
    brandName: record.brandName,
    period: record.period,
    equityShape: strongest === softest
      ? `${strongest} is the central equity signal`
      : `${strongest} is stronger than ${softest}`,
    trajectory,
    supportLensCoverage: [
      record.growthNavigator ? 'GN bridge present' : 'GN bridge missing',
      mentalRead.evidenceMode === 'measured' ? 'measured CEP evidence' : `${mentalRead.evidenceMode.replaceAll('_', ' ')} CEP evidence`,
      growthRead.simulated || mentalRead.simulated ? 'prototype support-lens evidence present' : ''
    ].filter(Boolean).join(' · '),
    diagnosisPull,
    treatmentPull,
    blockers,
    features
  };
}

function matchingReason(active: SymptomFingerprint, peer: SymptomFingerprint, feature: string, reason: string) {
  return active.features[feature] === peer.features[feature] ? reason : null;
}

function sharedTreatmentReasons(active: SymptomFingerprint, peer: SymptomFingerprint) {
  const activeFamilies = active.treatmentPull.map((family) => family.toLowerCase());
  return peer.treatmentPull
    .filter((family) => activeFamilies.includes(family.toLowerCase()))
    .map((family) => `Both pull toward ${family} treatment paths`);
}

function similarityScore(active: SymptomFingerprint, peer: SymptomFingerprint) {
  const reasons = [
    matchingReason(active, peer, 'diagnosisId', 'Both currently map to the same deterministic diagnosis family'),
    matchingReason(active, peer, 'salientStrength', 'Salient has a similar benchmark shape'),
    matchingReason(active, peer, 'differentStrength', 'Different has a similar benchmark shape'),
    matchingReason(active, peer, 'meaningfulStrength', 'Meaningful has a similar benchmark shape'),
    matchingReason(active, peer, 'pricingPowerStrength', 'Pricing Power has a similar benchmark shape'),
    matchingReason(active, peer, 'demandPowerStrength', 'Demand Power has a similar benchmark shape'),
    matchingReason(active, peer, 'hasGrowthNavigator', 'Both have the same Growth Navigator bridge availability'),
    ...sharedTreatmentReasons(active, peer)
  ].filter((reason): reason is string => Boolean(reason));

  const weights = [
    active.features.diagnosisId === peer.features.diagnosisId ? 22 : 0,
    active.features.salientStrength === peer.features.salientStrength ? 10 : 0,
    active.features.differentStrength === peer.features.differentStrength ? 10 : 0,
    active.features.meaningfulStrength === peer.features.meaningfulStrength ? 8 : 0,
    active.features.pricingPowerStrength === peer.features.pricingPowerStrength ? 10 : 0,
    active.features.demandPowerStrength === peer.features.demandPowerStrength ? 8 : 0,
    active.features.salientMomentum === peer.features.salientMomentum ? 5 : 0,
    active.features.differentMomentum === peer.features.differentMomentum ? 5 : 0,
    active.features.pricingPowerMomentum === peer.features.pricingPowerMomentum ? 5 : 0,
    active.features.hasGrowthNavigator === peer.features.hasGrowthNavigator ? 4 : 0,
    Math.min(sharedTreatmentReasons(active, peer).length * 7, 14),
    active.features.category === peer.features.category ? 6 : 0,
    active.features.typology && active.features.typology === peer.features.typology ? 3 : 0
  ];
  const score = Math.min(100, weights.reduce((sum, weight) => sum + weight, 0));

  return {
    score,
    reasons: reasons.slice(0, 4)
  };
}

function keyDifference(active: SymptomFingerprint, peer: SymptomFingerprint) {
  const checks = [
    ['category', 'category context'],
    ['pricingPowerStrength', 'Pricing Power shape'],
    ['demandPowerStrength', 'Demand Power shape'],
    ['mentalEvidenceMode', 'Mental Availability evidence mode'],
    ['hasGrowthNavigator', 'Growth Navigator bridge availability'],
    ['diagnosisConfidence', 'diagnosis confidence']
  ] as const;
  const difference = checks.find(([feature]) => active.features[feature] !== peer.features[feature]);
  if (!difference) return 'No major difference in the current graph slice; review evidence details before treating the cases as equivalent.';
  return `Different ${difference[1]}: ${String(active.features[difference[0]])} for this brand versus ${String(peer.features[difference[0]])} for the comparable brand.`;
}

function strengthForScore(score: number): SimilarBrandMatch['strength'] {
  if (score >= 70) return 'High';
  if (score >= 48) return 'Medium';
  return 'Low';
}

function getSimilarBrandMatches(record: BrandHealthRecord, activeFingerprint: SymptomFingerprint): SimilarBrandMatch[] {
  return brandRecords
    .filter((peer) => peer.brandId !== record.brandId || peer.category !== record.category)
    .map((peer) => {
      const peerFingerprint = getSymptomFingerprint(peer);
      const similarity = similarityScore(activeFingerprint, peerFingerprint);
      return {
        brandId: peer.brandId,
        brandName: peer.brandName,
        category: peer.category,
        diagnosisName: getPrimaryDiagnosis(peer).name,
        strength: strengthForScore(similarity.score),
        score: similarity.score,
        reasons: similarity.reasons.length ? similarity.reasons : ['Shared portfolio context, but no strong symptom reason exceeded the current threshold.'],
        keyDifference: keyDifference(activeFingerprint, peerFingerprint),
        caveat: 'Similarity is associative and evidence-led; it is not causal proof and should not be read as the same business issue.'
      };
    })
    .filter((match) => match.score >= 42)
    .sort((a, b) => b.score - a.score || a.brandName.localeCompare(b.brandName))
    .slice(0, 5);
}

function patternDefinitions(active: BrandHealthRecord, fingerprint: SymptomFingerprint, matches: SimilarBrandMatch[]): PortfolioPattern[] {
  const features = fingerprint.features;
  const patterns: PortfolioPattern[] = [];
  const matchedBrandIds = [active.brandId, ...matches.slice(0, 4).map((match) => match.brandId)];

  if (
    features.salientStrength === 'strong'
    && (features.differentStrength === 'soft' || features.pricingPowerStrength === 'soft' || fingerprint.treatmentPull.some((family) => family.toLowerCase().includes('different')))
  ) {
    patterns.push({
      id: 'familiar_but_not_special',
      name: 'Familiar But Not Special',
      definition: 'The brand appears more available in memory than meaningfully differentiated or price-justified.',
      matchedBrandIds,
      evidenceBasis: [
        `Active shape: ${fingerprint.equityShape}`,
        `Treatment pull: ${fingerprint.treatmentPull.join(', ') || 'none configured'}`,
        `${matches.length} comparable brand${matches.length === 1 ? '' : 's'} found in the current packet`
      ],
      whyItMatters: 'This pattern can create a false sense of safety: the brand may be easy to think of but not special enough to protect choice or price justification.',
      investigateNext: 'Check distinctive asset evidence, point-of-difference clarity, and whether Pricing Power softness is broad equity pressure or a value-delivery issue.',
      guardrail: 'BBE Different is not the same as distinctive asset strength; do not prescribe an asset audit as measured fact without asset evidence.'
    });
  }

  if (features.meaningfulStrength === 'strong' && features.salientStrength === 'soft') {
    patterns.push({
      id: 'relevant_but_hard_to_retrieve',
      name: 'Relevant But Hard To Retrieve',
      definition: 'The brand has relevance evidence but appears less mentally available or easy to retrieve.',
      matchedBrandIds,
      evidenceBasis: [
        'Meaningful is stronger than Salient in the active fingerprint',
        fingerprint.supportLensCoverage,
        `Diagnosis pull: ${fingerprint.diagnosisPull.join(', ')}`
      ],
      whyItMatters: 'The team may need to build memory structures and buying-situation links rather than only sharpening the proposition.',
      investigateNext: 'Prioritize measured Mental Availability and CEP evidence before committing to occasion-memory treatment paths.',
      guardrail: 'Occasion or CEP overlap is not proof of cannibalization, substitution, or portfolio migration.'
    });
  }

  if (
    [features.demandPowerMomentum, features.pricingPowerMomentum, features.meaningfulMomentum, features.differentMomentum, features.salientMomentum].includes('Declining')
  ) {
    patterns.push({
      id: 'strong_but_leaking',
      name: 'Strong But Leaking',
      definition: 'The brand has usable equity evidence but at least one core signal is declining.',
      matchedBrandIds,
      evidenceBasis: [
        fingerprint.trajectory,
        `Primary diagnosis: ${getPrimaryDiagnosis(active).name}`,
        `Evidence confidence: ${getEvidenceReadiness(active).label}`
      ],
      whyItMatters: 'Momentum weakness can be easier to address before it becomes a larger foundation issue.',
      investigateNext: 'Separate one-period noise from a sustained trajectory by reviewing trend history and source-period compatibility.',
      guardrail: 'Do not call a brand miscast or in structural decline based on one period.'
    });
  }

  if (features.hasGrowthNavigator === false && fingerprint.treatmentPull.length) {
    patterns.push({
      id: 'evidence_light_prescription_risk',
      name: 'Evidence-Light Prescription Risk',
      definition: 'The treatment path is directionally plausible, but support-lens proof is thin.',
      matchedBrandIds,
      evidenceBasis: [
        `Missing blockers: ${fingerprint.blockers.join(', ') || 'none material'}`,
        `Treatment pull: ${fingerprint.treatmentPull.join(', ')}`,
        fingerprint.supportLensCoverage
      ],
      whyItMatters: 'Teams may move to action before they have enough evidence to know which constraint the treatment is really addressing.',
      investigateNext: 'Fill the highest-risk missing evidence before locking the action plan.',
      guardrail: 'A missing support lens should be treated as a confidence gap, not proof that the support-lens issue exists.'
    });
  }

  if (!patterns.length) {
    patterns.push({
      id: 'single_brand_read_primary',
      name: 'Single-Brand Read Primary',
      definition: 'No strong recurring portfolio pattern exceeded the current rules, so the active brand evidence should lead.',
      matchedBrandIds: [active.brandId, ...matches.slice(0, 2).map((match) => match.brandId)],
      evidenceBasis: [
        `Primary diagnosis: ${getPrimaryDiagnosis(active).name}`,
        `Symptom fingerprint: ${fingerprint.equityShape}`,
        `Similar brands found: ${matches.length}`
      ],
      whyItMatters: 'The product should not force a portfolio analogy when the current evidence is primarily brand-specific.',
      investigateNext: 'Use the evidence ledger and rule trace to inspect the active diagnosis before searching for broader patterns.',
      guardrail: 'Absence of a graph pattern is not proof that no relationship exists; it only reflects the current packet.'
    });
  }

  return patterns.slice(0, 3);
}

function gapRisk(affectedCount: number, activeHasGap: boolean): PortfolioEvidenceGap['decisionRisk'] {
  if (activeHasGap && affectedCount >= 4) return 'High';
  if (activeHasGap || affectedCount >= 4) return 'Medium';
  return 'Low';
}

function getPortfolioEvidenceGaps(active: BrandHealthRecord, fingerprint: SymptomFingerprint, matches: SimilarBrandMatch[]): PortfolioEvidenceGap[] {
  const relatedRecords = [active, ...matches.map((match) => findBrandRecordByIdentity(match.brandId)).filter((item): item is BrandHealthRecord => Boolean(item))];
  const relatedFingerprints = relatedRecords.map((item) => item.brandId === active.brandId ? fingerprint : getSymptomFingerprint(item));

  const gapBuilders = [
    {
      id: 'growth_navigator_bridge',
      label: 'Growth Navigator bridge missing',
      whyItMatters: 'GN can help distinguish whether equity issues are being compounded by proposition, reach, resonance, availability, or value conversion constraints.',
      hasGap: (item: SymptomFingerprint) => item.features.hasGrowthNavigator === false,
      nextSource: 'Growth Navigator extract or scorecard bridge',
      ownerCandidate: 'Insights + Growth Navigator owner'
    },
    {
      id: 'measured_cep_evidence',
      label: 'Measured Mental Availability / CEP evidence missing',
      whyItMatters: 'Treatment paths tied to salience or occasion memory need measured entry-point proof before being treated as decision facts.',
      hasGap: (item: SymptomFingerprint) => item.features.mentalEvidenceMode !== 'measured',
      nextSource: 'Mental Availability / CEP packet',
      ownerCandidate: 'Insights'
    },
    {
      id: 'distinctive_asset_evidence',
      label: 'Distinctive asset evidence missing',
      whyItMatters: 'Similar patterns often point toward distinctive memory structures, but BBE Different alone is not asset-recognition evidence.',
      hasGap: (item: SymptomFingerprint) => item.treatmentPull.some((family) => family.toLowerCase().includes('distinctive')),
      nextSource: 'Distinctive asset audit or creative branding-quality read',
      ownerCandidate: 'Brand + Creative Strategy + Insights'
    },
    {
      id: 'momentum_completeness',
      label: 'Momentum evidence incomplete',
      whyItMatters: 'Portfolio analogies are much stronger when the system can distinguish a stable equity shape from a weakening trajectory.',
      hasGap: (item: SymptomFingerprint) => item.trajectory.toLowerCase().includes('no material momentum'),
      nextSource: 'Complete BBE trend history / next wave read',
      ownerCandidate: 'BBE evidence owner'
    }
  ];

  return gapBuilders
    .map((builder): PortfolioEvidenceGap | null => {
      const affected = relatedFingerprints.filter(builder.hasGap);
      if (!affected.length) return null;
      const activeHasGap = builder.hasGap(fingerprint);
      return {
        id: builder.id,
        label: builder.label,
        whyItMatters: builder.whyItMatters,
        affectedBrandIds: uniqueList(affected.map((item) => item.brandId)),
        decisionRisk: gapRisk(affected.length, activeHasGap),
        nextSource: builder.nextSource,
        ownerCandidate: builder.ownerCandidate
      };
    })
    .filter((gap): gap is PortfolioEvidenceGap => Boolean(gap))
    .sort((a, b) => {
      const riskOrder = { High: 3, Medium: 2, Low: 1 };
      return riskOrder[b.decisionRisk] - riskOrder[a.decisionRisk] || b.affectedBrandIds.length - a.affectedBrandIds.length;
    })
    .slice(0, 4);
}

function treatmentEvidenceNeeds(treatment: TreatmentPlanOption) {
  return uniqueList(treatment.evidenceNeeds.length ? treatment.evidenceNeeds : treatment.dependencies).slice(0, 3);
}

function getTreatmentMemory(record: BrandHealthRecord, matches: SimilarBrandMatch[]): TreatmentMemoryItem[] {
  const options = getTreatmentPlanOptions(record).slice(0, 4);
  const similarRecords = matches
    .map((match) => findBrandRecordByIdentity(match.brandId))
    .filter((item): item is BrandHealthRecord => Boolean(item));
  const similarTreatmentFamilies = uniqueList(similarRecords.flatMap((item) => getTreatmentPlanOptions(item).slice(0, 3).map((option) => option.family)));

  return options.map((option) => ({
    treatmentId: option.treatmentId,
    treatmentName: option.name,
    family: option.family,
    whyItAppears: similarTreatmentFamilies.includes(option.family)
      ? `Similar cases also pull toward ${option.family}, so this path is worth comparing before action.`
      : option.whyThisFits,
    requiredEvidence: treatmentEvidenceNeeds(option),
    followUpSignals: option.followUpSignals.slice(0, 4),
    contraindication: option.whenNotToUse
  }));
}

function patternToplineLabel(patterns: PortfolioPattern[]) {
  return patterns[0]?.name ?? 'Portfolio pattern not yet clear';
}

function confidenceFromReadiness(label: EvidenceReadiness['label']): PatternRadarRecord['topline']['confidence'] {
  if (label === 'Validated') return 'Validated';
  if (label === 'Supported') return 'Supported';
  return 'Directional';
}

function buildPatternGraph(
  active: BrandHealthRecord,
  fingerprint: SymptomFingerprint,
  matches: SimilarBrandMatch[],
  patterns: PortfolioPattern[],
  gaps: PortfolioEvidenceGap[],
  treatmentMemory: TreatmentMemoryItem[]
): PatternRadarRecord['graph'] {
  const nodes: PatternRadarRecord['graph']['nodes'] = [
    {
      id: `brand:${active.brandId}`,
      type: 'brand',
      label: active.brandName,
      properties: { category: active.category, period: active.period }
    },
    {
      id: `category:${normalized(active.category)}`,
      type: 'category',
      label: active.category,
      properties: {}
    },
    {
      id: `period:${normalized(active.period)}`,
      type: 'period',
      label: active.period,
      properties: {}
    },
    {
      id: `diagnosis:${String(fingerprint.features.diagnosisId)}`,
      type: 'diagnosis',
      label: getPrimaryDiagnosis(active).name,
      properties: { confidence: String(fingerprint.features.diagnosisConfidence) }
    },
    ...coreMetrics.map((name) => ({
      id: `metric:${active.brandId}:${normalized(name)}`,
      type: 'metric' as const,
      label: name,
      properties: {
        strength: String(fingerprint.features[`${name.charAt(0).toLowerCase()}${name.slice(1).replaceAll(' ', '')}Strength`] ?? strengthLabel(metric(active, name))),
        momentum: metric(active, name)?.momentum ?? 'Unknown'
      }
    })),
    ...matches.map((match) => ({
      id: `brand:${match.brandId}`,
      type: 'brand' as const,
      label: match.brandName,
      properties: { category: match.category, similarity: match.score }
    })),
    ...patterns.map((pattern) => ({
      id: `pattern:${pattern.id}`,
      type: 'portfolio_pattern' as const,
      label: pattern.name,
      properties: { matchedBrandCount: pattern.matchedBrandIds.length }
    })),
    ...gaps.map((gap) => ({
      id: `gap:${gap.id}`,
      type: 'evidence_gap' as const,
      label: gap.label,
      properties: { decisionRisk: gap.decisionRisk, affectedBrandCount: gap.affectedBrandIds.length }
    })),
    ...treatmentMemory.map((treatment) => ({
      id: `treatment:${treatment.treatmentId}`,
      type: 'treatment' as const,
      label: treatment.treatmentName,
      properties: { family: treatment.family }
    }))
  ];

  const edges: PatternRadarRecord['graph']['edges'] = [
    { from: `brand:${active.brandId}`, to: `category:${normalized(active.category)}`, type: 'observed_in' },
    { from: `brand:${active.brandId}`, to: `period:${normalized(active.period)}`, type: 'observed_in' },
    { from: `brand:${active.brandId}`, to: `diagnosis:${String(fingerprint.features.diagnosisId)}`, type: 'has_diagnosis' },
    ...coreMetrics.map((name) => ({ from: `brand:${active.brandId}`, to: `metric:${active.brandId}:${normalized(name)}`, type: 'has_metric' as const })),
    ...matches.map((match) => ({
      from: `brand:${active.brandId}`,
      to: `brand:${match.brandId}`,
      type: 'similar_to' as const,
      weight: match.score,
      evidence: match.reasons
    })),
    ...patterns.map((pattern) => ({
      from: `brand:${active.brandId}`,
      to: `pattern:${pattern.id}`,
      type: 'matches_pattern' as const,
      evidence: pattern.evidenceBasis
    })),
    ...gaps.map((gap) => ({
      from: `brand:${active.brandId}`,
      to: `gap:${gap.id}`,
      type: 'has_evidence_gap' as const,
      evidence: [gap.whyItMatters]
    })),
    ...treatmentMemory.map((treatment) => ({
      from: `diagnosis:${String(fingerprint.features.diagnosisId)}`,
      to: `treatment:${treatment.treatmentId}`,
      type: 'linked_treatment' as const,
      evidence: [treatment.whyItAppears]
    }))
  ];

  return { nodes, edges };
}

export function getPatternRadarRecord(record: BrandHealthRecord, sourcePacket?: MentalAvailabilitySourcePacket): PatternRadarRecord {
  const fingerprint = getSymptomFingerprint(record, sourcePacket);
  const similarBrands = getSimilarBrandMatches(record, fingerprint);
  const emergingPatterns = patternDefinitions(record, fingerprint, similarBrands);
  const evidenceGaps = getPortfolioEvidenceGaps(record, fingerprint, similarBrands);
  const treatmentMemory = getTreatmentMemory(record, similarBrands);
  const readiness = getEvidenceReadiness(record);
  const patternLabel = patternToplineLabel(emergingPatterns);
  const read = `${record.brandName} appears to participate in a "${patternLabel}" pattern: ${fingerprint.equityShape.toLowerCase()}, ${fingerprint.trajectory.toLowerCase()}, and the treatment pull points toward ${fingerprint.treatmentPull.slice(0, 2).join(' + ') || 'governed diagnosis review'}.`;

  return {
    brandId: record.brandId,
    brandName: record.brandName,
    period: record.period,
    category: record.category,
    graph: buildPatternGraph(record, fingerprint, similarBrands, emergingPatterns, evidenceGaps, treatmentMemory),
    topline: {
      patternLabel,
      read,
      confidence: confidenceFromReadiness(readiness.label),
      similarBrandCount: similarBrands.length,
      materialGapCount: evidenceGaps.filter((gap) => gap.decisionRisk !== 'Low').length,
      caveat: 'Similarity is associative, not causal. Use this as a portfolio learning prompt, not as proof of the same business issue.'
    },
    fingerprint,
    similarBrands,
    emergingPatterns,
    evidenceGaps,
    treatmentMemory,
    sourceContradictions: [{
      id: 'source_claims_future',
      label: 'Source contradiction queue not yet connected',
      read: 'Future source-claim extraction will compare deck, transcript, and research claims against measured BBE and support-lens evidence.',
      status: 'future'
    }],
    precursorWatch: [{
      id: 'precursor_watch_future',
      label: 'Precursor watch requires stable period history',
      read: 'The current slice avoids prediction language until brand-period fingerprints and outcome history are available.',
      caveat: 'Pattern analogies are not forecasts.'
    }]
  };
}

function riskWeight(risk: PortfolioEvidenceGap['decisionRisk']) {
  return risk === 'High' ? 3 : risk === 'Medium' ? 2 : 1;
}

function brandNameLookup(recordsToRead: BrandHealthRecord[]) {
  return new Map(recordsToRead.map((record) => [record.brandId, record.brandName]));
}

function categoryLookup(recordsToRead: BrandHealthRecord[]) {
  return new Map(recordsToRead.map((record) => [record.brandId, record.category]));
}

export function getPortfolioRadarRecord(recordsToRead: BrandHealthRecord[] = brandRecords): PortfolioRadarRecord {
  const recordsInScope = recordsToRead.length ? recordsToRead : brandRecords;
  const nameById = brandNameLookup(recordsInScope);
  const categoryById = categoryLookup(recordsInScope);
  const radarRecords = recordsInScope.map((record) => getPatternRadarRecord(record));
  const categories = uniqueList(recordsInScope.map((record) => record.category));
  const periods = uniqueList(recordsInScope.map((record) => record.period));

  const patternClusters = Array.from(
    radarRecords
      .flatMap((radar) => radar.emergingPatterns)
      .reduce((map, pattern) => {
        const current = map.get(pattern.id) ?? {
          id: pattern.id,
          name: pattern.name,
          definition: pattern.definition,
          brandIds: [] as string[],
          brandNames: [] as string[],
          categories: [] as string[],
          evidenceBasis: [] as string[],
          whyItMatters: pattern.whyItMatters,
          investigateNext: pattern.investigateNext,
          guardrail: pattern.guardrail
        };
        const knownBrandIds = pattern.matchedBrandIds.filter((brandId) => nameById.has(brandId));
        current.brandIds = uniqueList([...current.brandIds, ...knownBrandIds]);
        current.brandNames = uniqueList([...current.brandNames, ...knownBrandIds.map((brandId) => nameById.get(brandId) ?? brandId)]);
        current.categories = uniqueList([...current.categories, ...knownBrandIds.map((brandId) => categoryById.get(brandId) ?? 'Unknown')]);
        current.evidenceBasis = uniqueList([...current.evidenceBasis, ...pattern.evidenceBasis]).slice(0, 6);
        map.set(pattern.id, current);
        return map;
      }, new Map<string, PortfolioRadarRecord['patternClusters'][number]>())
      .values()
  ).sort((a, b) => b.brandIds.length - a.brandIds.length || a.name.localeCompare(b.name));

  const evidenceGapClusters = Array.from(
    radarRecords
      .flatMap((radar) => radar.evidenceGaps)
      .reduce((map, gap) => {
        const current = map.get(gap.id) ?? {
          id: gap.id,
          label: gap.label,
          whyItMatters: gap.whyItMatters,
          affectedBrandIds: [] as string[],
          affectedBrandNames: [] as string[],
          categories: [] as string[],
          decisionRisk: gap.decisionRisk,
          nextSource: gap.nextSource,
          ownerCandidate: gap.ownerCandidate
        };
        const knownBrandIds = gap.affectedBrandIds.filter((brandId) => nameById.has(brandId));
        current.affectedBrandIds = uniqueList([...current.affectedBrandIds, ...knownBrandIds]);
        current.affectedBrandNames = uniqueList([...current.affectedBrandNames, ...knownBrandIds.map((brandId) => nameById.get(brandId) ?? brandId)]);
        current.categories = uniqueList([...current.categories, ...knownBrandIds.map((brandId) => categoryById.get(brandId) ?? 'Unknown')]);
        current.decisionRisk = riskWeight(gap.decisionRisk) > riskWeight(current.decisionRisk) ? gap.decisionRisk : current.decisionRisk;
        map.set(gap.id, current);
        return map;
      }, new Map<string, PortfolioRadarRecord['evidenceGapClusters'][number]>())
      .values()
  ).sort((a, b) => riskWeight(b.decisionRisk) - riskWeight(a.decisionRisk) || b.affectedBrandIds.length - a.affectedBrandIds.length);

  const treatmentPulls = Array.from(
    radarRecords
      .flatMap((radar) => radar.treatmentMemory.map((item) => ({ radar, item })))
      .reduce((map, { radar, item }) => {
        const current = map.get(item.family) ?? {
          family: item.family,
          brandIds: [] as string[],
          brandNames: [] as string[],
          treatmentNames: [] as string[],
          requiredEvidence: [] as string[],
          followUpSignals: [] as string[],
          caveat: 'Treatment families are options to compare and test; they are not commands to execute or proof that the same action will work across brands.'
        };
        current.brandIds = uniqueList([...current.brandIds, radar.brandId]);
        current.brandNames = uniqueList([...current.brandNames, radar.brandName]);
        current.treatmentNames = uniqueList([...current.treatmentNames, item.treatmentName]).slice(0, 6);
        current.requiredEvidence = uniqueList([...current.requiredEvidence, ...item.requiredEvidence]).slice(0, 6);
        current.followUpSignals = uniqueList([...current.followUpSignals, ...item.followUpSignals]).slice(0, 6);
        map.set(item.family, current);
        return map;
      }, new Map<string, PortfolioRadarRecord['treatmentPulls'][number]>())
      .values()
  ).sort((a, b) => b.brandIds.length - a.brandIds.length || a.family.localeCompare(b.family));

  const crossBrandEdges = Array.from(
    radarRecords
      .flatMap((radar) => radar.similarBrands.map((match) => ({ radar, match })))
      .reduce((map, { radar, match }) => {
        const pair = [radar.brandId, match.brandId].sort().join('__');
        const existing = map.get(pair);
        if (existing && existing.score >= match.score) return map;
        map.set(pair, {
          fromBrandId: radar.brandId,
          fromBrandName: radar.brandName,
          fromCategory: radar.category,
          toBrandId: match.brandId,
          toBrandName: match.brandName,
          toCategory: match.category,
          score: match.score,
          strength: match.strength,
          reasons: match.reasons,
          keyDifference: match.keyDifference,
          caveat: match.caveat
        });
        return map;
      }, new Map<string, PortfolioRadarRecord['crossBrandEdges'][number]>())
      .values()
  ).sort((a, b) => b.score - a.score || a.fromBrandName.localeCompare(b.fromBrandName)).slice(0, 24);

  const brandReads = radarRecords
    .map((radar) => {
      const record = recordsInScope.find((item) => item.brandId === radar.brandId);
      return {
        brandId: radar.brandId,
        brandName: radar.brandName,
        category: radar.category,
        portfolioRole: record?.portfolioRole ?? 'Role not loaded',
        diagnosisName: getPrimaryDiagnosis(record ?? brandRecords[0]).name,
        patternLabel: radar.topline.patternLabel,
        evidenceReadiness: getEvidenceReadiness(record ?? brandRecords[0]).label,
        materialGapCount: radar.topline.materialGapCount,
        topTreatmentFamily: radar.treatmentMemory[0]?.family ?? 'Governed diagnosis review',
        topSimilarBrands: radar.similarBrands.slice(0, 3).map((match) => match.brandName)
      };
    })
    .sort((a, b) => b.materialGapCount - a.materialGapCount || a.brandName.localeCompare(b.brandName));

  const highRiskGapCount = evidenceGapClusters.filter((gap) => gap.decisionRisk === 'High').length;
  const crossCategoryEdgeCount = crossBrandEdges.filter((edge) => edge.fromCategory !== edge.toCategory).length;
  const leadingPattern = patternClusters[0]?.name ?? 'No dominant pattern yet';
  const leadingGap = evidenceGapClusters[0]?.label ?? 'No material repeated gap detected';

  return {
    period: periods.length === 1 ? periods[0] : `${periods.length} periods in scope`,
    topline: {
      totalBrands: recordsInScope.length,
      categoryCount: categories.length,
      patternClusterCount: patternClusters.length,
      highRiskGapCount,
      crossCategoryEdgeCount,
      read: `${recordsInScope.length} brands resolve into ${patternClusters.length} recurring pattern cluster${patternClusters.length === 1 ? '' : 's'}. The strongest current pattern is "${leadingPattern}", while the most material repeated evidence question is "${leadingGap}".`,
      caveat: 'This portfolio view is associative and evidence-led. It should provoke comparison, evidence gathering, and treatment testing; it must not be used as causality, cannibalization, migration, or occasion-substitution proof.'
    },
    patternClusters,
    evidenceGapClusters,
    treatmentPulls,
    crossBrandEdges,
    brandReads
  };
}

export function getKpiDeepDiveSections(record: BrandHealthRecord): KpiDeepDiveSection[] {
  const opportunityRows = getMetricOpportunityRows(record);
  const primaryDiagnosis = getPrimaryDiagnosis(record);
  const treatmentRecommendations = getTreatmentRecommendations(primaryDiagnosis.id);

  return kpiAreaDefinitions.map((definition) => {
    const m = metric(record, definition.id);
    const opportunity = opportunityRows.find((row) => row.metric === definition.id);
    const delta = getTrendDelta(record, definition.id);
    const trendText = delta
      ? `${delta.delta > 0 ? '+' : ''}${formatMetricValue(delta.delta)} over ${delta.periods} waves`
      : 'No usable trend series in the active packet';
    const currentRead = m
      ? `${definition.title} is ${formatMetricValue(m.value)} with ${m.categoryBand}, ${m.ahead}, and ${m.momentum} momentum. ${m.momentum === 'Declining' || m.ahead === 'Not Ahead' ? definition.cautionPattern : definition.healthyPattern}`
      : `${definition.title} is missing from the active Brand Health Record.`;
    const treatmentPaths = treatmentRecommendations
      .filter(({ treatment }) => {
        const movementMatch = treatment.expectedMetricMovement.some((movement) => movement.toLowerCase().includes(definition.id.toLowerCase()));
        const familyMatch = treatment.family.toLowerCase().includes(definition.title.toLowerCase().split(' ')[0]);
        const pricingMatch = definition.id === 'Pricing Power' && treatment.family.toLowerCase().includes('pricing');
        return movementMatch || familyMatch || pricingMatch;
      })
      .slice(0, 2)
      .map(({ treatment, link }) => ({
        name: treatment.name,
        tier: treatment.tier,
        whyItFits: link.whyThisFits
      }));

    return {
      id: definition.id,
      title: definition.title,
      value: formatMetricValue(m?.value),
      job: opportunity?.job ?? 'Validate',
      tone: metricTone(m),
      plainEnglishRole: definition.plainEnglishRole,
      howToRead: definition.howToRead,
      currentRead,
      evidence: [
        m ? `Benchmark: ${m.categoryBand} / ${m.ahead}` : 'Benchmark: missing',
        m ? `Momentum: ${m.momentum}` : 'Momentum: missing',
        `Trend: ${trendText}`,
        m ? `Source: ${m.wave}, slide ${m.slide}` : 'Source: missing'
      ],
      watchNext: definition.watchNext,
      source: m ? `${m.source} · ${m.wave} · slide ${m.slide}` : record.sourceFiles.join(', '),
      treatmentPaths
    };
  });
}

function metricEvidenceLine(m: BrandMetric) {
  return `${m.metric}: ${formatMetricValue(m.value)} (${m.categoryBand}; ${m.ahead}; ${m.momentum})`;
}

export function getDiagnosisEvidence(record: BrandHealthRecord) {
  const result = getDiagnosisResult(record);
  const diagnosis = result.primary.diagnosis;
  const metrics = coreMetrics.map((name) => metric(record, name)).filter((m): m is BrandMetric => Boolean(m));
  const supporting = result.primary.supporting.length
    ? result.primary.supporting
    : metrics.map((m) => ({
      label: m.metric,
      statement: metricEvidenceLine(m),
      source: m.source,
      wave: m.wave,
      slide: m.slide
    }));
  const complicating = [
    ...result.primary.counterEvidence,
    ...result.primary.missingEvidence.slice(0, 4),
    ...(result.fallbackUsed
      ? [{
        label: 'Diagnosis fallback',
        statement: 'No deterministic rule fired, so the seeded Brand Health Record diagnosis is being used until rules/data are expanded.',
        source: record.sourceFiles.join(', '),
        wave: record.period,
        slide: 'Diagnosis rule'
      }]
      : []),
    ...(result.seededDiagnosisId && result.seededDiagnosisId !== diagnosis.id
      ? [{
        label: 'Seeded diagnosis cross-check',
        statement: `The seeded record diagnosis is ${result.seededDiagnosisId}; the deterministic rules currently select ${diagnosis.id}.`,
        source: record.sourceFiles.join(', '),
        wave: record.period,
        slide: result.primary.ruleId
      }]
      : []),
    ...record.categoryLens.knownBlindSpots.map((statement) => ({
      label: 'Category lens caveat',
      statement,
      source: record.sourceFiles.join(', '),
      wave: record.period,
      slide: 'Lens'
    })),
    ...metrics
      .filter((m) => m.momentum === 'Unknown' || m.ahead === 'Unknown')
      .map((m) => ({
        label: `${m.metric} limitation`,
        statement: `${m.metric} has ${m.momentum === 'Unknown' ? 'unknown momentum' : 'unknown benchmark status'}, so confidence should be read with that limitation.`,
        source: m.source,
        wave: m.wave,
        slide: m.slide
      }))
  ];

  return {
    diagnosis,
    supporting,
    complicating,
    ruleSummary: result.primary.evidenceSummary,
    notToConclude: diagnosis.whatNotToConclude,
    sourceFiles: record.sourceFiles,
    confidence: result.primary.confidence,
    ruleId: result.primary.ruleId,
    candidates: result.candidates,
    fallbackUsed: result.fallbackUsed
  };
}

export function getBindingConstraint(record: BrandHealthRecord) {
  const metricScores = coreMetrics
    .map((name) => metric(record, name))
    .filter((m): m is BrandMetric => Boolean(m))
    .map((m) => {
      const numericValue = typeof m.value === 'number' ? m.value : Number.POSITIVE_INFINITY;
      const benchmarkPenalty = m.ahead === 'Not Ahead' ? -20 : 0;
      const momentumPenalty = m.momentum === 'Declining' ? -10 : 0;
      return { metric: m, score: numericValue + benchmarkPenalty + momentumPenalty };
    });
  return metricScores.sort((a, b) => a.score - b.score)[0]?.metric ?? null;
}

export function getFollowUpSignals(record: BrandHealthRecord) {
  const diagnosis = getPrimaryDiagnosis(record);
  const recommendations = getTreatmentRecommendations(diagnosis.id);
  const treatmentSignals = recommendations.flatMap(({ treatment }) => treatment.followUpSignals);
  const uniqueSignals = Array.from(new Set([...diagnosis.typicalFollowUpSignals, ...treatmentSignals]));

  return {
    nextQuarter: uniqueSignals.slice(0, 4),
    sixToTwelveMonths: uniqueSignals.slice(4, 9),
    prove: recommendations[0]?.treatment.expectedMetricMovement ?? diagnosis.typicalFollowUpSignals,
    falsify: [
      'No movement in the expected BBE metric family after sufficient execution window',
      'Contradictory evidence from category, creative, retail, or product diagnostics',
      'Category lens no longer matches the brand question being asked'
    ]
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalized(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '_').replaceAll(/^_+|_+$/g, '');
}

function treatmentRanking(record: BrandHealthRecord, treatment: TreatmentDefinition, link: DiagnosisTreatmentLink) {
  const diagnosis = getPrimaryDiagnosis(record);
  const bindingConstraint = getBindingConstraint(record);
  const rankReasons: string[] = [`Configured diagnosis link priority ${link.priority}`];
  const diagnosisId = normalized(diagnosis.id);
  const diagnosisName = normalized(diagnosis.name);
  const treatmentBestFor = treatment.bestFor.map(normalized);
  const treatmentNotFor = treatment.notFor.map(normalized);
  const expectedMovement = treatment.expectedMetricMovement.map((movement) => movement.toLowerCase());
  const primaryFamilies = diagnosis.primaryTreatmentFamilies.map(normalized);
  const treatmentFamily = normalized(treatment.family);
  const foundationNeed = diagnosis.severityDefault === 'priority'
    || diagnosis.id === 'foundation_deficit'
    || diagnosis.id === 'underbuilt_equity'
    || bindingConstraint?.categoryBand === 'Category Lagging'
    || bindingConstraint?.ahead === 'Not Ahead';
  const foundationFirst = foundationNeed && treatment.tier.toLowerCase().includes('foundation');

  let score = 100 - link.priority * 8;

  if (treatmentBestFor.includes(diagnosisId) || treatmentBestFor.includes(diagnosisName)) {
    score += 25;
    rankReasons.push('Treatment config names this diagnosis as a best-fit use case');
  }

  if (primaryFamilies.some((family) => treatmentFamily.includes(family) || family.includes(treatmentFamily))) {
    score += 10;
    rankReasons.push('Treatment family matches the diagnosis family');
  }

  if (foundationFirst) {
    score += 12;
    rankReasons.push('Foundation-first path because the current read needs basic equity repair or protection');
  }

  if (bindingConstraint && expectedMovement.some((movement) => movement.includes(bindingConstraint.metric.toLowerCase()))) {
    score += 10;
    rankReasons.push(`Targets the current binding constraint: ${bindingConstraint.metric}`);
  }

  if (treatment.likelihood.toLowerCase().includes('high')) {
    score += 8;
    rankReasons.push('Higher likelihood note in treatment config');
  } else if (treatment.likelihood.toLowerCase().includes('medium')) {
    score += 4;
    rankReasons.push('Medium likelihood note in treatment config');
  }

  if (treatmentNotFor.some((item) => item.includes(diagnosisId) || item.includes(diagnosisName))) {
    score -= 25;
    rankReasons.push('Treatment config includes a diagnosis-specific caution');
  }

  return {
    score,
    rankReasons: rankReasons.slice(0, 4),
    foundationFirst
  };
}

function treatmentEvidenceNeedsForDefinition(treatment: TreatmentDefinition) {
  const family = treatment.family.toLowerCase();
  const movement = treatment.expectedMetricMovement.map((item) => item.toLowerCase());
  const needs = [
    family.includes('pricing') || family.includes('value') || movement.some((item) => item.includes('pricing') || item.includes('value'))
      ? 'value-delivery or RGM-adjacent evidence'
      : '',
    family.includes('salient') || movement.some((item) => item.includes('salient'))
      ? 'measured Mental Availability / CEP evidence'
      : '',
    family.includes('different') || family.includes('distinctive') || movement.some((item) => item.includes('different'))
      ? 'distinctive asset or difference-driver evidence'
      : '',
    family.includes('meaningful') || movement.some((item) => item.includes('meaningful'))
      ? 'proposition and relevance evidence'
      : ''
  ].filter(Boolean);
  return unique(needs.length ? needs : treatment.dependencies).slice(0, 3);
}

export function getTreatmentPlanOptions(record: BrandHealthRecord): TreatmentPlanOption[] {
  const diagnosis = getPrimaryDiagnosis(record);
  const rankedOptions = getTreatmentRecommendations(diagnosis.id)
    .map(({ treatment, link }) => {
      const ranking = treatmentRanking(record, treatment, link);
      return {
        treatmentId: treatment.id,
        name: treatment.name,
        tier: treatment.tier,
        family: treatment.family,
        priority: link.priority,
        score: ranking.score,
        rankReasons: ranking.rankReasons,
        foundationFirst: ranking.foundationFirst,
        whyThisFits: link.whyThisFits,
        whenNotToUse: link.whenNotToUse,
        timeToImpact: treatment.timeToImpact,
        cost: treatment.cost,
        difficulty: treatment.difficulty,
        likelihood: treatment.likelihood,
        owners: treatment.owners,
        dependencies: treatment.dependencies,
        expectedMetricMovement: treatment.expectedMetricMovement,
        followUpSignals: treatment.followUpSignals,
        recommendationScope: 'ranked_for_active_brand' as const,
        globalLibraryRole: 'Global treatment library path; only becomes a brand recommendation after active diagnosis, evidence, and caveat review.',
        brandSpecificBasis: unique([
          link.whyThisFits,
          ...ranking.rankReasons,
          `Active brand diagnosis: ${diagnosis.name}`
        ]).slice(0, 5),
        evidenceNeeds: treatmentEvidenceNeedsForDefinition(treatment)
      };
    });

  const uniqueOptions = Array.from(rankedOptions.reduce((optionsByTreatment, option) => {
    const existing = optionsByTreatment.get(option.treatmentId);
    if (!existing || option.score > existing.score || (option.score === existing.score && option.priority < existing.priority)) {
      optionsByTreatment.set(option.treatmentId, option);
    }
    return optionsByTreatment;
  }, new Map<string, TreatmentPlanOption>()).values());

  return uniqueOptions
    .sort((a, b) => b.score - a.score || a.priority - b.priority || a.name.localeCompare(b.name));
}

export function getTreatmentPlanDraft(record: BrandHealthRecord, selectedTreatmentIds: string[]): TreatmentPlanDraft {
  const diagnosis = getPrimaryDiagnosis(record);
  const options = getTreatmentPlanOptions(record);
  const selectedIdSet = new Set(selectedTreatmentIds);
  const selectedTreatments = options.filter((option) => selectedIdSet.has(option.treatmentId));
  const activeTreatments = selectedTreatments.length ? selectedTreatments : options.slice(0, 1);
  const signals = getFollowUpSignals(record);

  return {
    title: `${record.brandName} draft treatment plan`,
    diagnosisName: diagnosis.name,
    objective: activeTreatments.length
      ? `Test ${activeTreatments.map((treatment) => treatment.family).join(' + ')} as governed treatment paths for ${diagnosis.name}.`
      : `Clarify the next treatment decision for ${diagnosis.name} before committing the brand team to execution.`,
    selectedTreatments: activeTreatments,
    targetKpiMovement: unique(activeTreatments.flatMap((treatment) => treatment.expectedMetricMovement)),
    proofSignals: unique([
      ...activeTreatments.flatMap((treatment) => treatment.followUpSignals),
      ...signals.nextQuarter
    ]).slice(0, 8),
    timing: unique(activeTreatments.map((treatment) => treatment.timeToImpact)),
    owners: unique(activeTreatments.flatMap((treatment) => treatment.owners)),
    dependencies: unique(activeTreatments.flatMap((treatment) => treatment.dependencies)),
    caveats: unique([
      ...activeTreatments.map((treatment) => treatment.whenNotToUse),
      'Treatments are options to consider and test, not final commands.',
      'Pricing Power is brand-level equity price justification, not SKU-level pricing guidance.',
      ...record.categoryLens.knownBlindSpots
    ]).slice(0, 6)
  };
}

export function getStrategicRoadmap(record: BrandHealthRecord, selectedTreatmentIds: string[] = []): StrategicRoadmap {
  const diagnosis = getPrimaryDiagnosis(record);
  const recommendations = getTreatmentRecommendations(diagnosis.id);
  const signals = getFollowUpSignals(record);
  const horizons = ['0-90 days', '3-6 months', '6-12 months'];
  const phaseNames = ['Stabilize the diagnosis', 'Build the treatment path', 'Scale and validate'];
  const fallbackProofSignals = [...signals.nextQuarter, ...signals.sixToTwelveMonths].slice(0, 4);
  const selectedIdSet = new Set(selectedTreatmentIds);
  const selectedRecommendations = selectedIdSet.size
    ? recommendations.filter(({ treatment }) => selectedIdSet.has(treatment.id)).slice(0, 3)
    : recommendations.slice(0, 3);

  const phases = selectedRecommendations.map(({ treatment, link }, index) => ({
    phase: phaseNames[index] ?? `Phase ${index + 1}`,
    horizon: horizons[index] ?? 'Next planning cycle',
    objective: index === 0
      ? `Start with ${treatment.family} because it is the highest-priority governed treatment path linked to ${diagnosis.name}.`
      : `Extend the work into ${treatment.family} once the prior phase has enough evidence to continue.`,
    treatmentPath: treatment.name,
    whyThisFits: link.whyThisFits,
    owners: treatment.owners,
    dependencies: treatment.dependencies,
    expectedMetricMovement: treatment.expectedMetricMovement,
    proofSignals: treatment.followUpSignals.length ? treatment.followUpSignals : fallbackProofSignals
  }));

  if (!phases.length) {
    phases.push({
      phase: 'Clarify next decision',
      horizon: '0-90 days',
      objective: 'No governed treatment path is linked to the active diagnosis, so the next step is expert review before prescribing action.',
      treatmentPath: 'Specialist review required',
      whyThisFits: 'Missing governed treatment linkage is itself a workflow gap to resolve.',
      owners: ['Brand', 'Insights'],
      dependencies: ['Diagnosis review', 'Treatment library update'],
      expectedMetricMovement: diagnosis.typicalFollowUpSignals,
      proofSignals: fallbackProofSignals
    });
  }

  phases.push({
    phase: 'Follow-up proof',
    horizon: 'Next BBE / GN read',
    objective: 'Use the next read to decide whether to continue, adjust, or stop the treatment path.',
    treatmentPath: 'Measurement and decision review',
    whyThisFits: 'The roadmap should be treated as a path to test, not a final command.',
    owners: ['Brand', 'Insights'],
    dependencies: ['Updated BBE wave', 'Execution readout', 'Category context review'],
    expectedMetricMovement: signals.prove,
    proofSignals: [...signals.nextQuarter, ...signals.sixToTwelveMonths].slice(0, 6)
  });

  return {
    title: `${record.brandName} strategic roadmap`,
    diagnosisName: diagnosis.name,
    strategicRead: `${diagnosis.doctorRead} The roadmap sequences governed treatment options as paths to consider and test with the cross-functional team.`,
    phases,
    decisionCaveats: [
      'Treatments are options to consider, not final commands.',
      'Pricing Power is brand-level equity price justification, not SKU-level pricing guidance.',
      'Do not infer cannibalization, portfolio migration, or occasion substitution from this packet.',
      ...record.categoryLens.knownBlindSpots
    ]
  };
}

export function getDialogQuestions(scope?: string) {
  const scoped = scope ? dialogQuestionLibrary.filter((q) => q.scope === scope) : dialogQuestionLibrary;
  return scoped.length ? scoped : dialogQuestionLibrary;
}

export function answerDialogQuestion(params: {
  question: string;
  brandId: string;
  category: string;
  mode?: string;
  activeVisual?: string;
}) {
  const record = findBrandRecordByIdentity(params.brandId, params.category) ?? brandRecords[0];
  const evidence = getDiagnosisEvidence(record);
  const recommendations = getTreatmentRecommendations(evidence.diagnosis.id);
  const bindingConstraint = getBindingConstraint(record);
  const visual = visualizationSpecs.find((spec) => spec.id === params.activeVisual);
  const q = params.question.toLowerCase();

  let answer: string;
  if (q.includes('why') || q.includes('diagnos') || q.includes('fire') || q.includes('rule')) {
    answer = `${record.brandName} is currently read as "${evidence.diagnosis.name}" because the configured diagnosis says: ${evidence.ruleSummary} Evidence basis: ${evidence.supporting.slice(0, 5).map((item) => item.statement).join('; ')}.`;
  } else if (q.includes('not conclude') || q.includes('wrong') || q.includes('caveat') || q.includes('change')) {
    answer = `The main caveats are: ${evidence.notToConclude.join(' ')} ${record.categoryLens.knownBlindSpots.join(' ')} Evidence that could change the read would need to contradict the active metric pattern, benchmark status, or category lens.`;
  } else if (q.includes('root') || q.includes('symptom') || q.includes('constraint')) {
    answer = bindingConstraint
      ? `The current binding constraint is ${bindingConstraint.metric}: ${formatMetricValue(bindingConstraint.value)} (${bindingConstraint.categoryBand}; ${bindingConstraint.ahead}; ${bindingConstraint.momentum}). Demand Power is read through Meaningful + Salient, while Pricing Power is read through Meaningful + Different.`
      : 'The packet does not include enough metric evidence to identify a binding constraint.';
  } else if (q.includes('treatment') || q.includes('first') || q.includes('budget') || q.includes('risk') || q.includes('depend')) {
    const first = recommendations[0];
    answer = first
      ? `First treatment path to consider: "${first.treatment.name}" (${first.treatment.tier}). Why it fits: ${first.link.whyThisFits} Tradeoffs: time ${first.treatment.timeToImpact}, cost ${first.treatment.cost}, difficulty ${first.treatment.difficulty}, likelihood ${first.treatment.likelihood}. Dependencies: ${first.treatment.dependencies.join(', ')}.`
      : 'No governed treatment link was found for this diagnosis.';
  } else if (q.includes('signal') || q.includes('follow')) {
    const signals = getFollowUpSignals(record);
    answer = `Follow-up signals to watch next: ${signals.nextQuarter.join(', ')}. Over 6-12 months, watch ${signals.sixToTwelveMonths.join(', ') || 'the same diagnosis-level signals until more treatment-specific evidence is available'}.`;
  } else {
    answer = `${record.brandName}'s active diagnosis is "${evidence.diagnosis.name}." ${evidence.diagnosis.plainEnglishDefinition} Ask about why it fired, root cause, treatment fit, caveats, or follow-up signals.`;
  }

  const visualContext = visual ? ` Active visual context: ${visual.name} - ${visual.purpose}` : '';
  const insightsContext = params.mode === 'insights' ? ` Insights basis: ${evidence.ruleSummary}` : '';
  return `${answer}${visualContext}${insightsContext}`;
}
