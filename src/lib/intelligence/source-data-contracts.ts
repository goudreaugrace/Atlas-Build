import processedBbeMetricRows from '@/src/data/processed/bbe_metric_records.json';
import bbeSourceDataLedgerJson from '@/src/data/processed/bbe_source_data_ledger.json';
import simulatedDemographicPackets from '@/src/data/demo/simulated-demographic-equity-records.json';
import bbeDeckChartLedgerJson from '@/docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/deck-chart-ledger.json';
import type { EquityReasoningSourcePosture } from '@/src/lib/intelligence/types';

export type SourceTruthType =
  | 'measured'
  | 'source_report_extract'
  | 'reviewed_local'
  | 'simulated'
  | 'assumption'
  | 'public_context'
  | 'transcript_feedback';

export type SourceApprovalStatus =
  | 'approved_source'
  | 'reviewed_for_prototype'
  | 'prototype_simulation'
  | 'draft'
  | 'not_reviewed';

export type AllowedUse = 'demo' | 'review_draft' | 'pilot_candidate' | 'official';

export type CanonicalUseAllowed = 'yes' | 'no' | 'with_caveat';

export type SourceGovernance = {
  sourceType: SourceTruthType;
  sourceOwner: string;
  approvalStatus: SourceApprovalStatus;
  allowedUse: AllowedUse[];
  canonicalUseAllowed: CanonicalUseAllowed;
  confidence: 'high' | 'medium' | 'low';
  caveats: string[];
  replacementRequirement: string | null;
};

export type BenchmarkLensValue = 'ahead' | 'not_ahead' | 'unknown';
export type MomentumLensValue = 'gaining' | 'holding' | 'declining' | 'unknown';
export type DemographicDimension = 'age_cohort' | 'gender' | 'ethnicity' | 'income' | 'region';
export type DemographicEvidenceStatus =
  | 'measured_available'
  | 'measured_limited'
  | 'simulated_available'
  | 'context_only'
  | 'unavailable';

export type BrandEquityMetricRecord = {
  brandName: string;
  market: string;
  category: string;
  period: string;
  metric: string;
  value: string | number | null;
  valueNumber: number | null;
  categoryIndex: number | null;
  ahead: BenchmarkLensValue;
  momentum: MomentumLensValue;
  sourceFile: string;
  sourceSlide: string;
  sourceKey: string;
  wave: string;
  governance: SourceGovernance;
};

export type SourceEvidenceRecord = {
  id: string;
  claimType: 'metric' | 'benchmark' | 'momentum' | 'definition' | 'guardrail' | 'gap' | 'simulation';
  label: string;
  statement: string;
  brandName: string | null;
  metric: string | null;
  market: string | null;
  category: string | null;
  period: string | null;
  sourceFile: string;
  sourceSlide: string | null;
  governance: SourceGovernance;
};

export type DemographicMetricValue = {
  value: number;
  categoryIndex: number;
  aheadStatus: BenchmarkLensValue;
  momentumStatus: MomentumLensValue;
};

export type DemographicEquityCutRecord = {
  brandId: string;
  brandName: string;
  market: string;
  category: string;
  period: string;
  demographicDimension: DemographicDimension;
  segment: string;
  metric: string;
  value: number;
  categoryIndex: number;
  ahead: BenchmarkLensValue;
  momentum: MomentumLensValue;
  baseSize: number;
  readableBase: boolean;
  interpretation: string;
  evidenceMode: 'measured_bbe_cut' | 'simulated_workflow_demo' | 'context_only' | 'missing';
  sourceLabel: string;
  governance: SourceGovernance;
};

export type DemographicEvidenceGate = {
  status: DemographicEvidenceStatus;
  brandId: string;
  dimension: DemographicDimension;
  segment: string;
  allowedDiagnosticLanguage: 'measured_diagnostic' | 'simulated_workflow_only' | 'context_only' | 'blocked';
  headline: string;
  caveats: string[];
  requiredSource: string;
  records: DemographicEquityCutRecord[];
};

type ProcessedBbeMetricRow = {
  Slide: string;
  Country: string;
  Category: string;
  Wave: string;
  Brand: string;
  Metric: string;
  Value: string | number | null;
  Ahead: string | null;
  Momentum: string | null;
  sourceFile: string;
  sourceKey: string;
  valueNumber: number | null;
};

type BbeSourceDataLedger = {
  canonicalPolicy: {
    pilotPromotionRequirement: string;
  };
  sources: {
    sourceId: string;
    title: string;
    reviewStatus: 'reviewed_for_prototype' | 'approved_source';
    evidenceMode: string;
    caveats: string[];
  }[];
};

type BbeDeckChartLedger = {
  governance: {
    allowedUses: string[];
    blockedUses: string[];
  };
  counts: {
    reconciliationStatusCounts: Partial<Record<
      'native_chart_and_processed_rows' | 'processed_rows_no_native_chart' | 'native_chart_no_processed_rows' | 'no_machine_readable_metric_payload',
      number
    >>;
  };
  slides: {
    slide: number;
    nativeChartCount: number;
    processedMetricCoverage: {
      rowCount: number;
      sourceFiles: string[];
    };
    reconciliationStatus: 'native_chart_and_processed_rows' | 'processed_rows_no_native_chart' | 'native_chart_no_processed_rows' | 'no_machine_readable_metric_payload';
  }[];
};

type SimulatedDemographicMetric = {
  value: number;
  categoryIndex: number;
  aheadStatus: BenchmarkLensValue;
  momentumStatus: MomentumLensValue;
};

type SimulatedDemographicPacket = {
  brandId: string;
  brandName: string;
  market: string;
  category: string;
  period: string;
  demographicDimension: DemographicDimension;
  sourceType: 'simulated';
  approvalStatus: 'prototype_simulation';
  evidenceMode: 'simulated_workflow_demo';
  sourceLabel: string;
  replacementRequirement: string;
  caveat: string;
  segments: {
    segment: string;
    baseSize: number;
    readableBase: boolean;
    interpretation: string;
    metrics: Record<string, SimulatedDemographicMetric>;
  }[];
};

function normalizeAhead(value: string | null): BenchmarkLensValue {
  if (value === 'Green') return 'ahead';
  if (value === 'Red') return 'not_ahead';
  return 'unknown';
}

function normalizeMomentum(value: string | null): MomentumLensValue {
  if (value === 'Green') return 'gaining';
  if (value === 'Amber') return 'holding';
  if (value === 'Red') return 'declining';
  return 'unknown';
}

function sourceReportGovernance(sourceFile: string): SourceGovernance {
  return {
    sourceType: 'source_report_extract',
    sourceOwner: 'BBE source report extract',
    approvalStatus: 'reviewed_for_prototype',
    allowedUse: ['demo', 'review_draft'],
    canonicalUseAllowed: 'with_caveat',
    confidence: 'medium',
    caveats: [
      'Processed from local source-report text extracts and should be reconciled with source-owner files before pilot use.',
      `Source lineage: ${sourceFile}.`
    ],
    replacementRequirement: 'Replace or approve with official BBE source-owner extract before pilot or official decision use.'
  };
}

export function normalizeProcessedBbeMetricRecord(row: ProcessedBbeMetricRow): BrandEquityMetricRecord {
  const valueNumber = Number.isFinite(row.valueNumber) ? row.valueNumber : null;
  return {
    brandName: row.Brand,
    market: row.Country,
    category: row.Category,
    period: row.Wave,
    metric: row.Metric,
    value: row.Value,
    valueNumber,
    categoryIndex: valueNumber,
    ahead: normalizeAhead(row.Ahead),
    momentum: normalizeMomentum(row.Momentum),
    sourceFile: row.sourceFile,
    sourceSlide: row.Slide,
    sourceKey: row.sourceKey,
    wave: row.Wave,
    governance: sourceReportGovernance(row.sourceFile)
  };
}

export const brandEquityMetricRecords = (processedBbeMetricRows as ProcessedBbeMetricRow[])
  .map(normalizeProcessedBbeMetricRecord);

export function getBrandEquityMetricRecords(brandName: string) {
  const normalized = brandName.trim().toLowerCase();
  return brandEquityMetricRecords.filter((record) => String(record.brandName ?? '').toLowerCase() === normalized);
}

export function getEquityReasoningSourcePosture(brandName: string): EquityReasoningSourcePosture {
  const sourceLedger = bbeSourceDataLedgerJson as BbeSourceDataLedger;
  const deckLedger = bbeDeckChartLedgerJson as BbeDeckChartLedger;
  const source = sourceLedger.sources[0];
  const rows = getBrandEquityMetricRecords(brandName);
  const slideIds = [...new Set(rows.map((row) => row.sourceSlide).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));
  const sourceFiles = [...new Set(rows.map((row) => row.sourceFile).filter(Boolean))].sort();
  const brandSlides = deckLedger.slides.filter((slide) => slideIds.includes(String(slide.slide)));
  const brandReconciliation = brandSlides.reduce((summary, slide) => {
    if (slide.reconciliationStatus === 'native_chart_and_processed_rows') summary.nativeChartAndProcessedRows += 1;
    if (slide.reconciliationStatus === 'processed_rows_no_native_chart') summary.processedRowsNoNativeChart += 1;
    if (slide.reconciliationStatus === 'native_chart_no_processed_rows') summary.nativeChartNoProcessedRows += 1;
    if (slide.reconciliationStatus === 'no_machine_readable_metric_payload') summary.noMachineReadableMetricPayload += 1;
    return summary;
  }, {
    nativeChartAndProcessedRows: 0,
    processedRowsNoNativeChart: 0,
    nativeChartNoProcessedRows: 0,
    noMachineReadableMetricPayload: 0
  });

  if (!source) {
    return {
      sourceId: 'not_available',
      title: 'No governed BBE source ledger available',
      reviewStatus: 'not_available',
      evidenceMode: 'missing',
      allowedUses: [],
      blockedUses: ['official_business_readout', 'pilot_canonical_data_store'],
      canonicalUseAllowed: 'no',
      metricRowsForBrand: rows.length,
      sourceSlides: slideIds,
      sourceFiles,
      chartReconciliation: brandReconciliation,
      caveats: ['No source ledger is loaded for this BBE reasoning read.'],
      pilotPromotionRequirement: 'Load and review an official source-owner BBE extract before pilot or official use.',
      read: 'Source posture is missing, so this read must remain prototype-only.'
    };
  }

  const hasReviewedPrototypeSource = source.reviewStatus === 'reviewed_for_prototype';
  return {
    sourceId: source.sourceId,
    title: source.title,
    reviewStatus: source.reviewStatus,
    evidenceMode: source.evidenceMode,
    allowedUses: deckLedger.governance.allowedUses,
    blockedUses: deckLedger.governance.blockedUses,
    canonicalUseAllowed: source.reviewStatus === 'approved_source' ? 'yes' : 'with_caveat',
    metricRowsForBrand: rows.length,
    sourceSlides: slideIds,
    sourceFiles,
    chartReconciliation: brandReconciliation,
    caveats: source.caveats,
    pilotPromotionRequirement: sourceLedger.canonicalPolicy.pilotPromotionRequirement,
    read: hasReviewedPrototypeSource
      ? `${brandName} has ${rows.length} processed BBE metric rows from the governed Q1 2026 US Snacks source ledger. Use for prototype reasoning calibration and report-module design; do not treat as canonical pilot data until source-owner review approves the metric mapping.`
      : `${brandName} has ${rows.length} processed BBE metric rows from an approved source ledger. Continue to render source, period, and caveats with the read.`
  };
}

export function createMetricEvidenceRecord(record: BrandEquityMetricRecord): SourceEvidenceRecord {
  return {
    id: [
      record.sourceKey,
      record.sourceSlide,
      record.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      record.metric.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ].join(':'),
    claimType: 'metric',
    label: `${record.brandName} ${record.metric}`,
    statement: `${record.brandName} has ${record.metric} value ${record.value ?? 'not available'} in ${record.period}.`,
    brandName: record.brandName,
    metric: record.metric,
    market: record.market,
    category: record.category,
    period: record.period,
    sourceFile: record.sourceFile,
    sourceSlide: record.sourceSlide,
    governance: record.governance
  };
}

function simulatedDemographicGovernance(packet: SimulatedDemographicPacket): SourceGovernance {
  return {
    sourceType: 'simulated',
    sourceOwner: packet.sourceLabel,
    approvalStatus: 'prototype_simulation',
    allowedUse: ['demo', 'review_draft'],
    canonicalUseAllowed: 'no',
    confidence: 'low',
    caveats: [
      packet.caveat,
      'Do not use simulated demographic cuts as measured BBE evidence or pilot decision support.'
    ],
    replacementRequirement: packet.replacementRequirement
  };
}

export const simulatedDemographicEquityCutRecords = (simulatedDemographicPackets as SimulatedDemographicPacket[])
  .flatMap((packet) => packet.segments.flatMap((segment) => Object.entries(segment.metrics).map(([metric, metricValue]) => ({
    brandId: packet.brandId,
    brandName: packet.brandName,
    market: packet.market,
    category: packet.category,
    period: packet.period,
    demographicDimension: packet.demographicDimension,
    segment: segment.segment,
    metric,
    value: metricValue.value,
    categoryIndex: metricValue.categoryIndex,
    ahead: metricValue.aheadStatus,
    momentum: metricValue.momentumStatus,
    baseSize: segment.baseSize,
    readableBase: segment.readableBase,
    interpretation: segment.interpretation,
    evidenceMode: packet.evidenceMode,
    sourceLabel: packet.sourceLabel,
    governance: simulatedDemographicGovernance(packet)
  } satisfies DemographicEquityCutRecord))));

export function getSimulatedDemographicEquityCuts(
  brandId: string,
  dimension: DemographicDimension = 'age_cohort',
  segment?: string
) {
  const normalizedSegment = segment?.trim().toLowerCase();
  return simulatedDemographicEquityCutRecords.filter((record) => (
    record.brandId === brandId
    && record.demographicDimension === dimension
    && (!normalizedSegment || record.segment.toLowerCase() === normalizedSegment)
  ));
}

export function getDemographicEvidenceGate(
  brandId: string,
  dimension: DemographicDimension,
  segment: string,
  options: { allowSimulated?: boolean; hasContextOnlySource?: boolean } = {}
): DemographicEvidenceGate {
  const simulatedRecords = options.allowSimulated === false
    ? []
    : getSimulatedDemographicEquityCuts(brandId, dimension, segment);

  if (simulatedRecords.length > 0) {
    return {
      status: 'simulated_available',
      brandId,
      dimension,
      segment,
      allowedDiagnosticLanguage: 'simulated_workflow_only',
      headline: 'Prototype simulated demographic workflow available',
      caveats: [
        'This is simulated prototype data, not measured BBE demographic performance.',
        'Use it to demonstrate the workflow only; official BBE demographic cuts are required before pilot or executive decision use.'
      ],
      requiredSource: 'Official BBE demographic cut with metric values, base sizes, and movement/significance flags.',
      records: simulatedRecords
    };
  }

  if (options.hasContextOnlySource) {
    return {
      status: 'context_only',
      brandId,
      dimension,
      segment,
      allowedDiagnosticLanguage: 'context_only',
      headline: 'Demographic context only',
      caveats: [
        'External demographic context can size or describe the audience, but it cannot diagnose brand equity performance.',
        'A BBE demographic cut is required for segment-specific brand diagnosis.'
      ],
      requiredSource: 'Official BBE demographic performance cut for this segment.',
      records: []
    };
  }

  return {
    status: 'unavailable',
    brandId,
    dimension,
    segment,
    allowedDiagnosticLanguage: 'blocked',
    headline: 'No demographic performance evidence loaded',
    caveats: [
      'The loaded data supports total-market brand reads, not this demographic-specific diagnosis.',
      'Do not infer segment performance from total-market BBE data.'
    ],
    requiredSource: 'Official BBE demographic cut with readable base size and significance/momentum metadata.',
    records: []
  };
}
