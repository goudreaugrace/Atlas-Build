import { buildAssistantRealityContext, safeWorkOrderLabel } from '@/src/lib/intelligence/assistant-reality-boundaries';
import { formatMetricValue } from '@/src/lib/data';
import type { BrandWorkItem } from '@/src/lib/brand-work';
import type { BrandIntelligencePacket } from '@/src/lib/intelligence/types';
import type { TreatmentPlanOption } from '@/src/types/domain';

export type TreatmentArtifactTone = 'good' | 'watch' | 'bad';

export type TreatmentArtifactPath = {
  id: string;
  rank: number;
  title: string;
  family: string;
  tier: string;
  score: string;
  body: string;
  tone: TreatmentArtifactTone;
  whyItFits: string[];
  inspectBeforeActing: string[];
  contraindication: string;
  followUpSignals: string[];
  expectedMetricMovement: string[];
};

export type TreatmentReadArtifactModel = {
  label: string;
  verdict: {
    title: string;
    headline: string;
  };
  diagnosisBridge: {
    title: string;
    body: string;
    points: {
      label: string;
      value: string;
      detail: string;
      tone: TreatmentArtifactTone;
    }[];
  };
  paths: TreatmentArtifactPath[];
  inspect: {
    title: string;
    body: string;
    needs: string[];
  };
  guardrails: string[];
  nextTestPath: {
    title: string;
    body: string;
    bullets: string[];
  };
  inlineViewIds: string[];
  governance: {
    sourcePeriodLine: string;
    shareExportLine: string;
    workOrderLabel: string;
  };
};

function toneFromText(value: string): TreatmentArtifactTone {
  const normalized = value.toLowerCase();
  if (normalized.includes('declining') || normalized.includes('blocked') || normalized.includes('missing') || normalized.includes('not ahead') || normalized.includes('high')) return 'bad';
  if (normalized.includes('watch') || normalized.includes('partial') || normalized.includes('review') || normalized.includes('directional') || normalized.includes('medium')) return 'watch';
  return 'good';
}

function topMetricPoint(packet: BrandIntelligencePacket, metricName: string, detail: string) {
  const metric = packet.metrics[metricName];
  if (!metric) return null;
  return {
    label: metric.metric === packet.displayLanguage.perceivedValueMetricSource ? packet.displayLanguage.perceivedValueUserLabel : metric.metric,
    value: formatMetricValue(metric.value),
    detail: `${metric.ahead} · ${metric.momentum}. ${detail}`,
    tone: toneFromText(`${metric.ahead} ${metric.momentum}`)
  };
}

function unique(values: string[], limit = 8) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    next.push(trimmed);
    if (next.length >= limit) break;
  }
  return next;
}

function pathTone(option: TreatmentPlanOption): TreatmentArtifactTone {
  if (option.foundationFirst || option.difficulty.toLowerCase().includes('high')) return 'watch';
  if (option.likelihood.toLowerCase().includes('low')) return 'bad';
  return 'good';
}

function treatmentPath(option: TreatmentPlanOption, index: number): TreatmentArtifactPath {
  return {
    id: option.treatmentId,
    rank: index + 1,
    title: option.name,
    family: option.family,
    tier: option.tier,
    score: String(Math.round(option.score)),
    body: option.globalLibraryRole,
    tone: pathTone(option),
    whyItFits: unique(option.brandSpecificBasis, 4),
    inspectBeforeActing: unique(option.evidenceNeeds, 4),
    contraindication: option.whenNotToUse,
    followUpSignals: unique(option.followUpSignals, 4),
    expectedMetricMovement: unique(option.expectedMetricMovement, 4)
  };
}

function gapDetail(packet: BrandIntelligencePacket) {
  const topGap = packet.evidenceGaps[0];
  if (!topGap) return 'No top-level evidence gap is flagged for this packet.';
  return `${topGap.label}: ${topGap.missingInput}`;
}

export function buildTreatmentReadArtifactModel(
  packet: BrandIntelligencePacket,
  work: BrandWorkItem
): TreatmentReadArtifactModel {
  const realityContext = buildAssistantRealityContext(packet, work.sourcePrompt);
  const paths = packet.treatmentOptions.slice(0, 3).map(treatmentPath);
  const primaryPath = paths[0];
  const primaryOption = packet.treatmentOptions[0];
  const qualityChecks = packet.outputQualityChecks.filter((check) => check.appliesTo.includes('treatment_recommendation'));

  return {
    label: safeWorkOrderLabel('Treatment recommendation'),
    verdict: {
      title: primaryPath
        ? `${packet.brand.brandName} treatment path to consider: ${primaryPath.title}.`
        : `Complete the ${packet.brand.brandName} evidence review before recommending a treatment path.`,
      headline: primaryPath
        ? `${packet.diagnosisResult.primary.diagnosis.name} points toward ${primaryPath.family}, but this remains a path to test, not a prescription.`
        : 'No ranked treatment path is available in the active packet.'
    },
    diagnosisBridge: {
      title: `${packet.diagnosisResult.primary.diagnosis.name} to treatment options`,
      body: `${packet.diagnosisTrace.primaryRule.evidenceSummary} The treatment read translates that diagnosis into options to consider and evidence to inspect before action.`,
      points: [
        topMetricPoint(packet, 'Demand Power', 'Demand context for whether the path should build, protect, or repair demand.'),
        topMetricPoint(packet, packet.displayLanguage.perceivedValueMetricSource, packet.displayLanguage.perceivedValueRequiredLanguage),
        {
          label: 'Rule match',
          value: `${packet.diagnosisTrace.primaryRule.matchedConditionCount}/${packet.diagnosisTrace.primaryRule.totalConditionCount}`,
          detail: 'Governed diagnosis conditions matched before treatment paths were ranked.',
          tone: toneFromText(packet.evidenceReadiness.tone)
        },
        {
          label: 'Evidence gaps',
          value: String(packet.evidenceGaps.length),
          detail: gapDetail(packet),
          tone: packet.evidenceGaps.length ? 'watch' : 'good'
        }
      ].filter((point): point is TreatmentReadArtifactModel['diagnosisBridge']['points'][number] => Boolean(point))
    },
    paths,
    inspect: {
      title: 'Inspect before action.',
      body: 'These are the proof needs that should be checked before a brand team treats the recommendation as an action path.',
      needs: unique([
        ...(primaryOption?.evidenceNeeds ?? []),
        ...packet.evidenceGaps.map((gap) => `${gap.label}: ${gap.bestNextSource}`),
        ...qualityChecks.filter((check) => check.status !== 'pass').map((check) => `${check.label}: ${check.detail}`)
      ], 8)
    },
    guardrails: unique([
      'Keep treatment language as options to consider or paths to test, not final commands.',
      'Do not assign owners, dates, or task plans in the POC treatment read.',
      primaryOption?.whenNotToUse ?? '',
      ...packet.agentGuardrails.filter((guardrail) => guardrail.includes('Do not') || guardrail.includes('not ') || guardrail.includes('humans decide')).slice(0, 4)
    ], 7),
    nextTestPath: {
      title: primaryPath ? `Pressure-test ${primaryPath.title}.` : 'Choose the first evidence-backed path to test.',
      body: primaryPath
        ? `Use this as a focused treatment recommendation workspace: inspect the named evidence needs, compare the top paths, then decide whether ${primaryPath.title} is worth advancing to a human-owned test plan.`
        : 'Review evidence gaps and treatment library fit before advancing a path.',
      bullets: unique([
        ...(primaryPath?.inspectBeforeActing.map((need) => `Inspect: ${need}`) ?? []),
        ...(primaryPath?.followUpSignals.map((signal) => `Watch: ${signal}`) ?? []),
        'Keep official approval, export, and circulation gated.'
      ], 6)
    },
    inlineViewIds: Array.from(new Set([
      'growth_provocation_list',
      'treatment_path_card',
      'evidence_ledger',
      'data_gap_panel',
      ...work.approvedViewIds.filter((viewId) => ['data_basis_inspector', 'evidence_spotlight_panel'].includes(viewId))
    ])).slice(0, 6),
    governance: {
      sourcePeriodLine: realityContext.sourcePeriodLine,
      shareExportLine: realityContext.shareExportLine,
      workOrderLabel: realityContext.workOrderLabel
    }
  };
}
