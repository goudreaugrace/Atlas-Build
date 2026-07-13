import bbeDeckDoctrineJson from '@/src/data/config/bbe-deck-doctrine.json';
import type { BrandHealthRecord, BrandMetric, Momentum } from '@/src/types/domain';
import { getDemographicEvidenceGate, getEquityReasoningSourcePosture } from '@/src/lib/intelligence/source-data-contracts';
import type { EquityReasoningRead, EquityReasoningTone } from '@/src/lib/intelligence/types';

type BbeDeckDoctrine = {
  metricSystem: {
    coreMetrics: string[];
  };
  benchmarkLensHierarchy: {
    id: 'momentum' | 'aheadBehind' | 'vsCategory';
    label: string;
    productRule: string;
  }[];
  strengthLanguagePolicy: {
    blockedTerms: string[];
    requiredQualifierWhenBlocked: string;
  };
  typologyPolicy: {
    productRule: string;
    blockedUse: string;
  };
  driverRelationships: Record<string, {
    primaryDrivers: string[];
    secondaryDrivers: string[];
    read: string;
  }>;
  demographicPolicy: {
    productRule: string;
  };
};

const deckDoctrine = bbeDeckDoctrineJson as BbeDeckDoctrine;
const CORE_METRICS = deckDoctrine.metricSystem.coreMetrics;

function lensRule(lensId: 'momentum' | 'aheadBehind' | 'vsCategory') {
  return deckDoctrine.benchmarkLensHierarchy.find((lens) => lens.id === lensId)?.productRule ?? '';
}

function metric(record: BrandHealthRecord, metricName: string): BrandMetric | null {
  return record.metrics[metricName] ?? null;
}

function metricEvidence(metricRecord: BrandMetric | null, label: string) {
  if (!metricRecord) return `${label}: missing`;
  return `${label}: ${metricRecord.displayValue ?? metricRecord.value ?? 'n/a'}, ${metricRecord.ahead}, ${metricRecord.momentum}`;
}

function isCategoryLeading(metricRecord: BrandMetric | null) {
  return (metricRecord?.categoryBand ?? '').toLowerCase().includes('leading');
}

function isNotAhead(metricRecord: BrandMetric | null) {
  return metricRecord?.ahead === 'Not Ahead';
}

function isAhead(metricRecord: BrandMetric | null) {
  return metricRecord?.ahead === 'Ahead';
}

function isDeclining(metricRecord: BrandMetric | null) {
  return metricRecord?.momentum === 'Declining';
}

function momentumLabel(momentum: Momentum) {
  if (momentum === 'Declining') return 'declining';
  if (momentum === 'Gaining') return 'gaining';
  if (momentum === 'Holding') return 'holding';
  return 'unknown';
}

function buildHeadline(input: {
  largeButVulnerable: boolean;
  decliningCount: number;
  notAheadCount: number;
  demandPower: BrandMetric | null;
}) {
  if (input.largeButVulnerable) {
    return 'Large/category-leading brand with vulnerability beneath the scale read.';
  }
  if (input.decliningCount >= 2) {
    return 'Equity profile is under momentum pressure and needs a guarded read.';
  }
  if (input.notAheadCount >= 3) {
    return 'Brand is not clearly ahead for its size/life stage, even where category index looks acceptable.';
  }
  if (isAhead(input.demandPower) && input.decliningCount === 0) {
    return 'Equity profile is directionally supported, with proof still needed behind the full driver profile.';
  }
  return 'Mixed equity profile that should be read through Momentum, Ahead/Behind, and driver support together.';
}

function toneFor(input: {
  largeButVulnerable: boolean;
  decliningCount: number;
  notAheadCount: number;
  missingCount: number;
}): EquityReasoningTone {
  if (input.missingCount >= 3) return 'gap';
  if (input.largeButVulnerable || input.decliningCount >= 2) return 'vulnerable';
  if (input.notAheadCount >= 3 || input.decliningCount > 0) return 'watch';
  return 'positive';
}

export function buildEquityReasoningRead(record: BrandHealthRecord): EquityReasoningRead {
  const demandPower = metric(record, 'Demand Power');
  const pricingPower = metric(record, 'Pricing Power');
  const meaningful = metric(record, 'Meaningful');
  const different = metric(record, 'Different');
  const salient = metric(record, 'Salient');
  const coreRecords = CORE_METRICS.map((metricName) => metric(record, metricName));
  const decliningMetrics = CORE_METRICS.filter((metricName) => isDeclining(metric(record, metricName)));
  const notAheadMetrics = CORE_METRICS.filter((metricName) => isNotAhead(metric(record, metricName)));
  const categoryLeadingMetrics = CORE_METRICS.filter((metricName) => isCategoryLeading(metric(record, metricName)));
  const missingCount = coreRecords.filter((item) => !item).length;
  const largeButVulnerable = isCategoryLeading(demandPower)
    && (notAheadMetrics.length >= 2 || decliningMetrics.length >= 1 || isNotAhead(pricingPower) || isNotAhead(different));
  const headlineVerdict = buildHeadline({
    largeButVulnerable,
    decliningCount: decliningMetrics.length,
    notAheadCount: notAheadMetrics.length,
    demandPower
  });
  const strengthBlocked = largeButVulnerable || decliningMetrics.length > 0 || notAheadMetrics.length >= 3;
  const strengthQualified = !strengthBlocked && notAheadMetrics.length > 0;
  const demographicGate = getDemographicEvidenceGate(record.brandId, 'age_cohort', '18-24');
  const sourcePosture = getEquityReasoningSourcePosture(record.brandName);

  return {
    id: 'equity-reasoning-read-v1',
    doctrineVersion: 'bbe-diagnostic-calibration-v1',
    headlineVerdict,
    tone: toneFor({
      largeButVulnerable,
      decliningCount: decliningMetrics.length,
      notAheadCount: notAheadMetrics.length,
      missingCount
    }),
    largeButVulnerable,
    momentumRead: {
      label: 'Momentum',
      status: decliningMetrics.length > 0 ? 'negative' : coreRecords.some((item) => item && item.momentum === 'Gaining') ? 'positive' : 'mixed',
      read: decliningMetrics.length > 0
        ? `Momentum is the headline watch-out: ${decliningMetrics.join(', ')} ${decliningMetrics.length === 1 ? 'is' : 'are'} declining. ${lensRule('momentum')}`
        : `Momentum is mostly ${momentumLabel(demandPower?.momentum ?? 'Unknown')} across the core read; do not overstate acceleration without significance evidence. ${lensRule('momentum')}`,
      evidence: CORE_METRICS.map((metricName) => metricEvidence(metric(record, metricName), metricName))
    },
    categoryContext: {
      label: 'vs. Category',
      status: categoryLeadingMetrics.length >= 3 ? 'positive' : categoryLeadingMetrics.length > 0 ? 'mixed' : 'unknown',
      read: categoryLeadingMetrics.length > 0
        ? `${categoryLeadingMetrics.join(', ')} show category-leading context, but this is not health proof by itself. ${lensRule('vsCategory')}`
        : `Category-index context is limited or not category-leading in the loaded profile. ${lensRule('vsCategory')}`,
      evidence: categoryLeadingMetrics.map((metricName) => metricEvidence(metric(record, metricName), metricName))
    },
    aheadBehindRead: {
      label: 'Ahead/Behind',
      status: notAheadMetrics.length >= 3 ? 'negative' : notAheadMetrics.length > 0 ? 'mixed' : 'positive',
      read: notAheadMetrics.length > 0
        ? `Size-adjusted read is constrained: ${notAheadMetrics.join(', ')} ${notAheadMetrics.length === 1 ? 'is' : 'are'} Not Ahead. ${lensRule('aheadBehind')}`
        : `Loaded core metrics are Ahead where the field is available. ${lensRule('aheadBehind')}`,
      evidence: CORE_METRICS.map((metricName) => metricEvidence(metric(record, metricName), metricName))
    },
    strengthLanguage: {
      status: strengthBlocked ? 'blocked' : strengthQualified ? 'qualified' : 'allowed',
      blockedTerms: strengthBlocked ? deckDoctrine.strengthLanguagePolicy.blockedTerms : ['star as verdict'],
      requiredQualifier: strengthBlocked
        ? deckDoctrine.strengthLanguagePolicy.requiredQualifierWhenBlocked
        : strengthQualified
          ? 'Qualify strength with the not-Ahead signals and remaining proof gaps.'
          : 'Strength language may be used only with explicit evidence and caveats.',
      rationale: [
        largeButVulnerable ? 'Category-leading Demand Power is offset by not-Ahead and/or declining signals.' : '',
        decliningMetrics.length > 0 ? `Declining momentum appears in ${decliningMetrics.join(', ')}.` : '',
        notAheadMetrics.length > 0 ? `Not-Ahead metrics: ${notAheadMetrics.join(', ')}.` : ''
      ].filter(Boolean)
    },
    driverRead: {
      demandPowerDrivers: `${deckDoctrine.driverRelationships['Demand Power']?.read ?? 'Demand Power should be interpreted with Meaningful and Salient first, then Different.'} ${metricEvidence(meaningful, 'Meaningful')}; ${metricEvidence(salient, 'Salient')}.`,
      perceivedValueDrivers: `${deckDoctrine.driverRelationships['Pricing Power']?.read ?? 'Perceived Value / Pricing Power should be interpreted with Meaningful and Different first.'} ${metricEvidence(meaningful, 'Meaningful')}; ${metricEvidence(different, 'Different')}; ${metricEvidence(pricingPower, 'Pricing Power')}.`,
      tensions: [
        isNotAhead(different) ? 'Different is not Ahead, so avoid over-reading scale as distinctiveness.' : '',
        isNotAhead(pricingPower) ? 'Pricing Power / Perceived Value is not Ahead, so price/value claims need caveats.' : '',
        isDeclining(meaningful) ? 'Meaningful is declining, which can weaken both Demand Power and Perceived Value support.' : ''
      ].filter(Boolean),
      treatmentImplications: [
        isNotAhead(different) ? 'Inspect distinctiveness, innovation, and category-leadership cues before recommending a Difference-led path.' : '',
        isDeclining(meaningful) ? 'Inspect relevance, needs fit, and benefit sharpness before recommending broad communications action.' : '',
        isNotAhead(pricingPower) ? 'Inspect value justification, perceived quality, and premium defense; do not make SKU pricing recommendations.' : ''
      ].filter(Boolean)
    },
    demographicReadiness: {
      status: demographicGate.status,
      read: demographicGate.status === 'simulated_available'
        ? `Prototype simulated age-cohort diagnostics are available for workflow demonstration only. ${deckDoctrine.demographicPolicy.productRule}`
        : `Official demographic BBE cuts are not loaded for diagnostic use. ${deckDoctrine.demographicPolicy.productRule}`,
      requiredSource: demographicGate.requiredSource
    },
    evidenceGaps: [
      demographicGate.status !== 'measured_available' ? 'Official demographic BBE cuts with base sizes and significance/momentum flags.' : '',
      'Source-owner peer-set/life-stage threshold details behind Ahead/Behind.',
      'Human-approved golden read for priority demo brands.'
    ].filter(Boolean),
    blockedClaims: [
      'Do not call the brand strong based only on category index.',
      deckDoctrine.typologyPolicy.blockedUse,
      'Do not make SKU-level price, pack, promo, or channel pricing recommendations from Pricing Power.',
      demographicGate.status === 'simulated_available'
        ? 'Do not present simulated age-cohort performance as measured BBE evidence.'
        : 'Do not infer demographic performance from total-market BBE data.'
    ],
    sourceCaveats: [
      sourcePosture.read,
      ...sourcePosture.caveats,
      deckDoctrine.typologyPolicy.productRule,
      'Equity reasoning is calibrated from loaded prototype data, source-report doctrine, and transcript feedback.',
      'Official source-owner review is required before pilot or executive decision use where source status is prototype, extracted, or simulated.'
    ],
    sourcePosture
  };
}
