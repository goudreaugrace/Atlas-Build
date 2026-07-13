import { buildAssistantRealityContext, safeWorkOrderLabel } from '@/src/lib/intelligence/assistant-reality-boundaries';
import { formatMetricValue } from '@/src/lib/data';
import type { BrandWorkItem } from '@/src/lib/brand-work';
import type { BrandIntelligencePacket } from '@/src/lib/intelligence/types';

export type EvidenceArtifactTone = 'good' | 'watch' | 'bad';

export type EvidenceArtifactCard = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: EvidenceArtifactTone;
};

export type EvidenceMetricCard = {
  metric: string;
  label: string;
  value: string;
  read: string;
  tone: EvidenceArtifactTone;
};

export type EvidenceReadArtifactModel = {
  label: string;
  verdict: {
    title: string;
    headline: string;
  };
  dataBasis: {
    title: string;
    body: string;
    metrics: EvidenceMetricCard[];
  };
  proofCards: EvidenceArtifactCard[];
  sourcePosture: EvidenceArtifactCard[];
  gaps: EvidenceArtifactCard[];
  guardrails: string[];
  nextProofPath: {
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

function toneFromText(value: string): EvidenceArtifactTone {
  const normalized = value.toLowerCase();
  if (normalized.includes('declining') || normalized.includes('blocked') || normalized.includes('missing') || normalized.includes('not ahead') || normalized.includes('high')) return 'bad';
  if (normalized.includes('watch') || normalized.includes('partial') || normalized.includes('review') || normalized.includes('directional') || normalized.includes('medium') || normalized.includes('not tested')) return 'watch';
  return 'good';
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

function metricCards(packet: BrandIntelligencePacket): EvidenceMetricCard[] {
  return ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different']
    .map((metricName) => packet.metrics[metricName])
    .filter(Boolean)
    .map((metric) => ({
      metric: metric.metric,
      label: metric.metric === packet.displayLanguage.perceivedValueMetricSource ? packet.displayLanguage.perceivedValueUserLabel : metric.metric,
      value: formatMetricValue(metric.value),
      read: `${metric.ahead} · ${metric.momentum}`,
      tone: toneFromText(`${metric.ahead} ${metric.momentum}`)
    }));
}

function strongestTrend(packet: BrandIntelligencePacket) {
  return packet.momentumTrendContext.metricReads
    .filter((read) => read.delta !== null)
    .sort((left, right) => Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0))[0];
}

function sourceTone(canonical: boolean, status: string) {
  if (canonical) return 'good';
  return toneFromText(status);
}

export function buildEvidenceReadArtifactModel(
  packet: BrandIntelligencePacket,
  work: BrandWorkItem
): EvidenceReadArtifactModel {
  const realityContext = buildAssistantRealityContext(packet, work.sourcePrompt);
  const trend = strongestTrend(packet);
  const metrics = metricCards(packet);
  const evidenceCount = packet.evidenceReadiness.availableInputs.length;
  const missingCount = packet.evidenceReadiness.missingInputs.length + packet.evidenceGaps.length;
  const peerSet = packet.peerSet;

  return {
    label: safeWorkOrderLabel('Evidence read'),
    verdict: {
      title: `${packet.brand.brandName} evidence read: what the current packet proves.`,
      headline: `${packet.evidenceReadiness.evidenceStrength} This read separates measured packet evidence, reviewed/prototype source context, assumptions, and gaps before it supports a QBR or treatment decision.`
    },
    dataBasis: {
      title: 'Active data basis',
      body: `${packet.brand.period} ${packet.brand.category} packet with ${metrics.length} BBE metric cards, ${packet.momentumTrendContext.metricReads.length} trend reads, ${packet.sourceFiles.length} source file labels, and ${packet.evidenceGaps.length} explicit evidence gaps.`,
      metrics
    },
    proofCards: [
      {
        id: 'diagnosis-rule',
        label: 'Diagnosis rule',
        title: packet.diagnosisResult.primary.diagnosis.name,
        body: `${packet.diagnosisTrace.primaryRule.matchedConditionCount}/${packet.diagnosisTrace.primaryRule.totalConditionCount} governed rule conditions matched. ${packet.diagnosisTrace.primaryRule.evidenceSummary}`,
        tone: toneFromText(packet.evidenceReadiness.tone)
      },
      {
        id: 'momentum-read',
        label: 'Momentum',
        title: packet.momentumIntelligence.status.replaceAll('_', ' '),
        body: packet.momentumIntelligence.headline,
        tone: packet.momentumIntelligence.redSignals.length ? 'watch' : 'good'
      },
      {
        id: 'room-to-grow',
        label: 'Room To Grow',
        title: packet.roomToGrow.label,
        body: packet.roomToGrow.read,
        tone: toneFromText(packet.roomToGrow.status)
      },
      {
        id: 'trend',
        label: 'Trend Context',
        title: packet.momentumTrendContext.sourcePeriodLabel,
        body: trend?.read ?? 'The packet does not have enough measured time-series evidence for a full trend read.',
        tone: toneFromText(trend?.significance ?? packet.momentumTrendContext.status)
      },
      {
        id: 'peer-basis',
        label: 'Peer Basis',
        title: peerSet ? `${peerSet.label} (${peerSet.peerCount} peers)` : 'Peer basis missing',
        body: peerSet ? peerSet.selectionBasis : 'Comparison language must remain caveated until reviewed peer context is loaded.',
        tone: peerSet ? 'watch' : 'bad'
      },
      {
        id: 'evidence-count',
        label: 'Coverage',
        title: `${evidenceCount} available inputs · ${missingCount} missing/gap signals`,
        body: packet.evidenceReadiness.caveat,
        tone: missingCount ? 'watch' : 'good'
      }
    ],
    sourcePosture: [
      {
        id: 'momentum-source',
        label: 'Momentum source',
        title: packet.momentumSourceReadiness.status.replaceAll('_', ' '),
        body: packet.momentumSourceReadiness.sourceLabel ?? 'No approved Momentum source label is loaded.',
        tone: sourceTone(packet.momentumSourceReadiness.canonicalForExecutiveUse, packet.momentumSourceReadiness.status)
      },
      {
        id: 'brand-context',
        label: 'Brand Strategic Context',
        title: packet.strategicContextReadiness.status.replaceAll('_', ' '),
        body: packet.strategicContextReadiness.sourceLabel ?? 'No official Brand Strategic Context source label is loaded.',
        tone: sourceTone(packet.strategicContextReadiness.canonicalForExecutiveUse, packet.strategicContextReadiness.status)
      },
      {
        id: 'source-period',
        label: 'Source period',
        title: packet.momentumTrendContext.sourcePeriodCompatibility.replaceAll('_', ' '),
        body: packet.momentumTrendContext.caveats[0] ?? 'No source-period caveat is loaded.',
        tone: toneFromText(packet.momentumTrendContext.sourcePeriodCompatibility)
      },
      {
        id: 'source-files',
        label: 'Source files',
        title: `${packet.sourceFiles.length} packet source labels`,
        body: packet.sourceFiles.slice(0, 3).join(' · ') || 'No source file labels are loaded.',
        tone: packet.sourceFiles.length ? 'good' : 'bad'
      }
    ],
    gaps: [
      ...packet.evidenceGaps.map((gap) => ({
        id: gap.id,
        label: gap.label,
        title: gap.severity,
        body: `${gap.missingInput} Next source: ${gap.bestNextSource}`,
        tone: toneFromText(gap.severity)
      })),
      ...packet.momentumSourceReadiness.checks
        .filter((check) => check.status !== 'source_ready')
        .slice(0, 4)
        .map((check) => ({
          id: check.id,
          label: check.label,
          title: check.status.replaceAll('_', ' '),
          body: `${check.detail} Required source: ${check.requiredSource}`,
          tone: toneFromText(check.status)
        }))
    ].slice(0, 8),
    guardrails: unique([
      packet.displayLanguage.perceivedValueRequiredLanguage,
      'Do not use Ahead/Behind as a substitute for Room to Grow.',
      'Treat trend deltas as directional unless source-provided significance exists.',
      'Do not infer cannibalization, portfolio migration, or occasion substitution without measured evidence.',
      'Keep prototype assumptions visible until source-owner replacement work is complete.',
      ...packet.agentGuardrails.filter((guardrail) => guardrail.includes('Do not') || guardrail.includes('not ') || guardrail.includes('broad brand-equity')).slice(0, 4)
    ], 8),
    nextProofPath: {
      title: 'What to validate before executive circulation.',
      body: 'Use this read to decide whether the packet is strong enough for a leadership discussion and what source-owner work should replace prototype or directional evidence before pilot.',
      bullets: unique([
        peerSet ? `Confirm peer-set approval for ${peerSet.label}.` : 'Load approved peer-set context.',
        packet.roomToGrow.status === 'available' ? 'Keep Room to Grow caveats visible.' : 'Replace partial/missing Room to Grow inputs with source-owner extracts.',
        trend?.significance === 'not_tested' || !trend ? 'Add source-provided significance testing for trend claims.' : `Preserve trend significance state: ${trend.significance.replaceAll('_', ' ')}.`,
        packet.evidenceGaps[0] ? `Resolve gap: ${packet.evidenceGaps[0].label}.` : 'Keep current gap posture visible.',
        'Keep export, circulation, and official approval gated.'
      ], 6)
    },
    inlineViewIds: Array.from(new Set([
      'data_basis_inspector',
      'diagnosis_trace_summary',
      'evidence_ledger',
      'evidence_spotlight_panel',
      'momentum_room_to_grow_grid',
      'smd_driver_map',
      'data_gap_panel',
      ...work.approvedViewIds
    ])).slice(0, 8),
    governance: {
      sourcePeriodLine: realityContext.sourcePeriodLine,
      shareExportLine: realityContext.shareExportLine,
      workOrderLabel: realityContext.workOrderLabel
    }
  };
}
