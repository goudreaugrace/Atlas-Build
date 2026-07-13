import {
  getDemographicEvidenceGate,
  getSimulatedDemographicEquityCuts,
  type DemographicDimension,
  type DemographicEquityCutRecord
} from '@/src/lib/intelligence/source-data-contracts';
import type {
  BrandIntelligencePacket,
  DemographicDiagnosticMetricRead,
  DemographicDiagnosticSegmentRead,
  DemographicDiagnosticStateModule
} from '@/src/lib/intelligence/types';

type DemographicDiagnosticPacketBase = Pick<BrandIntelligencePacket,
  | 'brand'
  | 'equityReasoning'
  | 'sourceReadiness'
>;

const DEFAULT_DIMENSION: DemographicDimension = 'age_cohort';
const DEFAULT_SEGMENT = '18-24';
const METRIC_ORDER = ['Demand Power', 'Pricing Power', 'Meaningful', 'Different', 'Salient'];

function displayLabel(metric: string) {
  return metric === 'Pricing Power' ? 'Perceived Value' : metric;
}

function metricRead(record: DemographicEquityCutRecord): DemographicDiagnosticMetricRead {
  const ahead = record.ahead === 'ahead' ? 'Ahead' : record.ahead === 'not_ahead' ? 'Not Ahead' : 'unknown Ahead/Behind';
  const momentum = record.momentum === 'gaining' ? 'gaining' : record.momentum === 'declining' ? 'declining' : record.momentum === 'holding' ? 'holding' : 'unknown momentum';
  return {
    metric: record.metric,
    displayLabel: displayLabel(record.metric),
    value: record.value,
    categoryIndex: record.categoryIndex,
    ahead: record.ahead,
    momentum: record.momentum,
    read: `${displayLabel(record.metric)} is ${record.value}, ${ahead}, and ${momentum} in the simulated ${record.segment} workflow cut.`
  };
}

function segmentRead(segment: string, records: DemographicEquityCutRecord[]): DemographicDiagnosticSegmentRead {
  const first = records[0];
  const sortedMetrics = [...records].sort((a, b) => {
    const left = METRIC_ORDER.indexOf(a.metric);
    const right = METRIC_ORDER.indexOf(b.metric);
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right) || a.metric.localeCompare(b.metric);
  });

  return {
    segment,
    baseSize: first?.baseSize ?? 0,
    readableBase: first?.readableBase ?? false,
    evidenceMode: first?.evidenceMode ?? 'missing',
    allowedDiagnosticLanguage: first?.evidenceMode === 'measured_bbe_cut' ? 'measured_diagnostic' : first?.evidenceMode === 'simulated_workflow_demo' ? 'simulated_workflow_only' : 'blocked',
    interpretation: first?.interpretation ?? 'No demographic segment evidence is loaded.',
    metricReads: sortedMetrics.map(metricRead)
  };
}

function groupBySegment(records: DemographicEquityCutRecord[]) {
  const groups = new Map<string, DemographicEquityCutRecord[]>();
  for (const record of records) {
    const current = groups.get(record.segment) ?? [];
    current.push(record);
    groups.set(record.segment, current);
  }
  return [...groups.entries()].map(([segment, segmentRecords]) => segmentRead(segment, segmentRecords));
}

function statusFor(segmentReads: DemographicDiagnosticSegmentRead[], gateStatus: ReturnType<typeof getDemographicEvidenceGate>['status']): DemographicDiagnosticStateModule['status'] {
  if (gateStatus === 'measured_available' || gateStatus === 'measured_limited') return 'measured_available';
  if (segmentReads.some((segment) => segment.evidenceMode === 'simulated_workflow_demo')) return 'simulated_workflow_only';
  if (gateStatus === 'context_only') return 'context_only';
  return 'missing';
}

function headlineFor(status: DemographicDiagnosticStateModule['status'], brandName: string, activeSegment: string) {
  if (status === 'measured_available') return `${brandName} has measured demographic BBE cuts available for diagnostic use.`;
  if (status === 'simulated_workflow_only') return `${brandName} can demonstrate a ${activeSegment} demographic diagnostic workflow, but not a measured demographic performance claim.`;
  if (status === 'context_only') return `${brandName} has demographic context only; it cannot diagnose segment-specific brand equity performance.`;
  return `${brandName} has no demographic performance evidence loaded for diagnostic use.`;
}

function sourcePosture(records: DemographicEquityCutRecord[]): DemographicDiagnosticStateModule['sourcePosture'] {
  const first = records[0];
  return {
    sourceLabel: first?.sourceLabel ?? 'No demographic source loaded',
    evidenceMode: first?.evidenceMode ?? 'missing',
    canonicalUseAllowed: first?.governance.canonicalUseAllowed ?? 'no',
    caveats: first?.governance.caveats ?? ['No demographic evidence is loaded.'],
    replacementRequirement: first?.governance.replacementRequirement ?? 'Official BBE demographic cuts are required before segment-specific pilot or executive decision use.'
  };
}

export function buildDemographicDiagnosticStateModule(packet: DemographicDiagnosticPacketBase): DemographicDiagnosticStateModule {
  const gate = getDemographicEvidenceGate(packet.brand.brandId, DEFAULT_DIMENSION, DEFAULT_SEGMENT);
  const simulatedRecords = getSimulatedDemographicEquityCuts(packet.brand.brandId, DEFAULT_DIMENSION);
  const segmentReads = groupBySegment(simulatedRecords);
  const activeSegmentRead = segmentReads.find((segment) => segment.segment === DEFAULT_SEGMENT) ?? segmentReads[0] ?? null;
  const status = statusFor(segmentReads, gate.status);

  return {
    id: 'demographic-diagnostic-state-v1',
    outputModuleId: 'demographic_diagnostic_state',
    title: `${packet.brand.brandName} Demographic Diagnostic State`,
    brandName: packet.brand.brandName,
    dimension: DEFAULT_DIMENSION,
    status,
    headline: headlineFor(status, packet.brand.brandName, activeSegmentRead?.segment ?? DEFAULT_SEGMENT),
    measuredDiagnosisAllowed: status === 'measured_available',
    simulatedWorkflowAvailable: segmentReads.length > 0,
    activeSegment: activeSegmentRead?.segment ?? DEFAULT_SEGMENT,
    activeSegmentRead,
    segmentReads,
    allowedLanguage: [
      status === 'simulated_workflow_only'
        ? 'You may say the prototype has simulated age-cohort data to demonstrate how the workflow would answer a demographic question.'
        : 'Use measured demographic language only when official BBE demographic cuts are loaded.',
      'You may describe base-size and metric-shape requirements for a real pilot handoff.',
      'You may compare simulated segments only as workflow demonstration, not consumer truth.'
    ],
    blockedClaims: [
      'Do not call simulated demographic values measured BBE evidence.',
      'Do not make an official demographic performance claim without official BBE cuts.',
      'Do not infer Gen Z, age, gender, ethnicity, income, or region performance from total-market BBE data.',
      'Do not use simulated demographic reads for pilot decisions, executive readouts, or canonical source data.'
    ],
    requiredOfficialSource: {
      label: 'Official BBE demographic cut',
      requiredFields: [
        'brandId / brand name',
        'market, category, period, and wave',
        'demographic dimension and segment',
        'metric values for Demand Power, Salient, Meaningful, Different, and Pricing Power / Perceived Value',
        'Ahead/Behind flags',
        'Momentum or movement/significance flags',
        'base size and readable-base indicator',
        'source owner, source date, and approval status'
      ],
      baseSizeRule: 'Segment reads require readable base sizes; unreadable or suppressed bases must block measured diagnostic language.',
      promotionGate: 'source_owner_approval'
    },
    nextProofNeeded: [
      gate.requiredSource,
      'Source-owner approval that the demographic cut matches the same BBE market/category/period as the total-brand read.',
      'Readable base-size metadata and any suppression rules for each segment.',
      'Metric-level movement/significance metadata before claiming demographic momentum.'
    ],
    sourcePosture: sourcePosture(simulatedRecords)
  };
}
