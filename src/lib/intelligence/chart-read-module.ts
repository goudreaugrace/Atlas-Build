import bbeDeckDoctrineJson from '@/src/data/config/bbe-deck-doctrine.json';
import bbeDeckChartLedgerJson from '@/docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/deck-chart-ledger.json';
import { getBrandEquityMetricRecords } from '@/src/lib/intelligence/source-data-contracts';
import type { BrandHealthRecord } from '@/src/types/domain';
import type {
  ChartReadCard,
  ChartReadMetricPoint,
  ChartReadModule,
  ChartReadReconciliationStatus,
  EquityReasoningRead
} from '@/src/lib/intelligence/types';

type BbeDeckDoctrine = {
  sourceReportId: string;
  sourceSlides: {
    chartRead: number[];
  };
  metricSystem: {
    coreMetrics: string[];
    outcomeDisplayLabels: Record<string, string>;
    userFacingValueLabel: string;
  };
  pricingPowerPolicy: {
    sourceMetricName: string;
    userFacingLabel: string;
    productRule: string;
  };
};

type DeckSlideLedgerRecord = {
  slide: number;
  title: string;
  nativeChartCount: number;
  processedMetricCoverage: {
    rowCount: number;
    sourceFiles: string[];
  };
  reconciliationStatus: ChartReadReconciliationStatus;
};

type BbeDeckChartLedger = {
  slides: DeckSlideLedgerRecord[];
};

const deckDoctrine = bbeDeckDoctrineJson as BbeDeckDoctrine;
const deckChartLedger = bbeDeckChartLedgerJson as BbeDeckChartLedger;
const PRIMARY_CHART_SLIDE = 17;

function evidenceStatus(status: ChartReadReconciliationStatus): ChartReadCard['evidenceStatus'] {
  if (status === 'native_chart_and_processed_rows') return 'reconciled_chart_and_rows';
  if (status === 'processed_rows_no_native_chart') return 'processed_rows_only';
  if (status === 'native_chart_no_processed_rows') return 'native_chart_only';
  return 'not_machine_readable';
}

function chartRole(slide: number): ChartReadCard['chartRole'] {
  if (slide === PRIMARY_CHART_SLIDE) return 'executive_mds_dashboard';
  if (slide === 19 || slide === 20) return 'driver_relationship';
  if (slide === 121) return 'demographic_cut';
  return 'supporting_metric_deep_dive';
}

function deckSlide(slide: number): DeckSlideLedgerRecord {
  return deckChartLedger.slides.find((record) => record.slide === slide) ?? {
    slide,
    title: `Slide ${slide}`,
    nativeChartCount: 0,
    processedMetricCoverage: {
      rowCount: 0,
      sourceFiles: []
    },
    reconciliationStatus: 'no_machine_readable_metric_payload'
  };
}

function displayLabel(metric: string) {
  if (metric === deckDoctrine.pricingPowerPolicy.sourceMetricName) return deckDoctrine.pricingPowerPolicy.userFacingLabel;
  return deckDoctrine.metricSystem.outcomeDisplayLabels[metric] ?? metric;
}

function humanAhead(value: ChartReadMetricPoint['ahead']) {
  if (value === 'ahead') return 'Ahead';
  if (value === 'not_ahead') return 'Not Ahead';
  return 'unknown Ahead/Behind';
}

function humanMomentum(value: ChartReadMetricPoint['momentum']) {
  if (value === 'gaining') return 'gaining';
  if (value === 'holding') return 'holding';
  if (value === 'declining') return 'declining';
  return 'unknown momentum';
}

function metricPointRead(point: Pick<ChartReadMetricPoint, 'displayLabel' | 'value' | 'ahead' | 'momentum'>) {
  return `${point.displayLabel} is ${point.value ?? 'not available'}, ${humanAhead(point.ahead)}, and ${humanMomentum(point.momentum)}.`;
}

function metricPoints(record: BrandHealthRecord, slide: number): ChartReadMetricPoint[] {
  const slideRows = getBrandEquityMetricRecords(record.brandName)
    .filter((row) => Number(row.sourceSlide) === slide);
  const metricOrder = deckDoctrine.metricSystem.coreMetrics;
  return slideRows
    .filter((row) => metricOrder.includes(row.metric) || row.metric.includes('Age :'))
    .sort((a, b) => {
      const aIndex = metricOrder.indexOf(a.metric);
      const bIndex = metricOrder.indexOf(b.metric);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex) || a.metric.localeCompare(b.metric);
    })
    .map((row) => {
      const point = {
        metric: row.metric,
        displayLabel: displayLabel(row.metric),
        value: row.value,
        categoryIndex: row.categoryIndex,
        ahead: row.ahead,
        momentum: row.momentum,
        sourceSlide: row.sourceSlide,
        sourceFile: row.sourceFile,
        read: ''
      };
      return {
        ...point,
        read: metricPointRead(point)
      };
    });
}

function chartReadText(input: {
  record: BrandHealthRecord;
  slide: DeckSlideLedgerRecord;
  role: ChartReadCard['chartRole'];
  points: ChartReadMetricPoint[];
  equityReasoning: EquityReasoningRead;
}) {
  const { record, slide, role, points, equityReasoning } = input;
  if (role === 'executive_mds_dashboard') {
    const declining = points.filter((point) => point.momentum === 'declining').map((point) => point.displayLabel);
    const notAhead = points.filter((point) => point.ahead === 'not_ahead').map((point) => point.displayLabel);
    return `${record.brandName} reads as category-leading in the MDS dashboard, but the chart read is not simply healthy: ${declining.join(', ') || 'no core metrics'} ${declining.length === 1 ? 'is' : 'are'} declining and ${notAhead.join(', ') || 'no core metrics'} ${notAhead.length === 1 ? 'is' : 'are'} Not Ahead. ${equityReasoning.headlineVerdict}`;
  }
  if (role === 'driver_relationship') {
    return `Slide ${slide.slide} is source context for interpreting drivers; it supports reading Demand Power with Meaningful and Salient, and Perceived Value with Meaningful and Different. It should not be treated as brand-specific causal proof by itself.`;
  }
  if (role === 'demographic_cut') {
    return `${record.brandName} has prototype-readable source rows on this demographic-style slide, but official demographic diagnosis still requires source-owner demographic cuts with base sizes and significance metadata.`;
  }
  if (points.length) {
    return `${record.brandName} has ${points.length} processed metric point${points.length === 1 ? '' : 's'} on this supporting source slide. Use as drill-down evidence behind the executive chart read, not as a standalone verdict.`;
  }
  return `Slide ${slide.slide} is relevant source-deck context, but no processed ${record.brandName} metric rows are mapped to this chart-read module yet.`;
}

function guardrailsFor(role: ChartReadCard['chartRole'], slide: DeckSlideLedgerRecord) {
  const guardrails = [
    'Do not convert chart appearance into an official business readout without source-owner approval.',
    'Do not call the brand healthy from category index alone.',
    deckDoctrine.pricingPowerPolicy.productRule
  ];
  if (slide.reconciliationStatus === 'processed_rows_no_native_chart') {
    guardrails.push('Processed metric rows are available, but no native chart payload was extracted for this slide.');
  }
  if (role === 'driver_relationship') {
    guardrails.push('Driver weights guide interpretation; they do not prove causality for this brand without causal evidence.');
  }
  if (role === 'demographic_cut') {
    guardrails.push('Demographic-specific performance requires official BBE demographic cuts with readable bases.');
  }
  return guardrails;
}

function buildChartCard(record: BrandHealthRecord, slideNumber: number, equityReasoning: EquityReasoningRead): ChartReadCard {
  const slide = deckSlide(slideNumber);
  const role = chartRole(slideNumber);
  const points = metricPoints(record, slideNumber);
  return {
    id: `chart-read-slide-${slideNumber}`,
    title: slide.title,
    sourceSlide: slide.slide,
    chartRole: role,
    reconciliationStatus: slide.reconciliationStatus,
    nativeChartCount: slide.nativeChartCount,
    processedMetricRows: slide.processedMetricCoverage.rowCount,
    sourceFiles: slide.processedMetricCoverage.sourceFiles,
    evidenceStatus: evidenceStatus(slide.reconciliationStatus),
    chartRead: chartReadText({ record, slide, role, points, equityReasoning }),
    metricPoints: points,
    guardrails: guardrailsFor(role, slide)
  };
}

export function buildChartReadModule(record: BrandHealthRecord, equityReasoning: EquityReasoningRead): ChartReadModule {
  const sourcePosture = equityReasoning.sourcePosture;
  const primaryChartRead = buildChartCard(record, PRIMARY_CHART_SLIDE, equityReasoning);
  const supportingChartReads = deckDoctrine.sourceSlides.chartRead
    .filter((slide) => slide !== PRIMARY_CHART_SLIDE)
    .map((slide) => buildChartCard(record, slide, equityReasoning));

  return {
    id: 'chart-read-v1',
    outputModuleId: 'chart_read',
    title: `${record.brandName} Chart Read`,
    subtitle: 'Source-deck chart evidence translated into governed product interpretation.',
    brandName: record.brandName,
    sourceReportId: deckDoctrine.sourceReportId,
    primaryChartRead,
    supportingChartReads,
    blockedClaims: [
      'Do not treat category-leading chart position as proof of brand health.',
      'Do not hide declining Momentum behind a large visual position.',
      'Do not use chart reads as official pilot/canonical data until source-owner approval is complete.',
      'Do not treat Pricing Power / Perceived Value as SKU-level price guidance.'
    ],
    nextProofNeeded: [
      sourcePosture.pilotPromotionRequirement,
      'Source-owner approval of the embedded workbook/chart cache mapping for chart reproduction.',
      'Approved significance/movement metadata before calling changes business-official.',
      'Official demographic cuts before demographic-specific chart reads become measured evidence.'
    ],
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
