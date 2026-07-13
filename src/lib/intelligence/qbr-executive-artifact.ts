import { buildAssistantRealityContext, safeWorkOrderLabel } from '@/src/lib/intelligence/assistant-reality-boundaries';
import { formatMetricValue } from '@/src/lib/data';
import type { BrandWorkItem } from '@/src/lib/brand-work';
import { planQbrComposition, type QbrCompositionPlan } from '@/src/lib/intelligence/qbr-composition-planner';
import type { BrandIntelligencePacket, OutputQualityCheck } from '@/src/lib/intelligence/types';

export type QbrArtifactTone = 'good' | 'watch' | 'bad';

export type QbrArtifactProofCard = {
  id: string;
  label: string;
  title: string;
  body: string;
  tone: QbrArtifactTone;
};

export type QbrArtifactModuleCard = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tone: QbrArtifactTone;
  points: {
    label: string;
    value: string;
    detail: string;
    tone?: QbrArtifactTone;
  }[];
};

export type QbrExecutiveArtifactModel = {
  executiveLabel: string;
  composition: QbrCompositionPlan;
  compositionModules: QbrArtifactModuleCard[];
  verdict: {
    title: string;
    headline: string;
  };
  takeaways: {
    label: string;
    body: string;
  }[];
  proofCards: QbrArtifactProofCard[];
  treatment: {
    title: string;
    body: string;
    bullets: string[];
  };
  peerBasis: {
    title: string;
    body: string;
    caveats: string[];
    tone: QbrArtifactTone;
  };
  roomToGrow: {
    title: string;
    body: string;
    tone: QbrArtifactTone;
  };
  trendRead: {
    title: string;
    body: string;
    caveats: string[];
    tone: QbrArtifactTone;
  };
  guardrails: string[];
  qualityChecks: OutputQualityCheck[];
  inlineViewIds: string[];
  governance: {
    sourcePeriodLine: string;
    shareExportLine: string;
    workOrderLabel: string;
  };
};

function toneFromText(value: string): QbrArtifactTone {
  const normalized = value.toLowerCase();
  if (normalized.includes('declining') || normalized.includes('blocked') || normalized.includes('missing') || normalized.includes('gap') || normalized.includes('not ahead')) return 'bad';
  if (normalized.includes('watch') || normalized.includes('partial') || normalized.includes('review') || normalized.includes('directional') || normalized.includes('unknown')) return 'watch';
  return 'good';
}

function roomTone(packet: BrandIntelligencePacket): QbrArtifactTone {
  if (packet.roomToGrow.status === 'missing') return 'bad';
  if (packet.roomToGrow.status === 'partial') return 'watch';
  return 'good';
}

function trendTone(packet: BrandIntelligencePacket): QbrArtifactTone {
  if (packet.momentumTrendContext.status === 'missing') return 'bad';
  if (packet.momentumTrendContext.metricReads.every((read) => read.significance === 'not_tested')) return 'watch';
  return 'good';
}

function strongestTrendRead(packet: BrandIntelligencePacket) {
  const reads = packet.momentumTrendContext.metricReads
    .filter((read) => read.delta !== null)
    .sort((left, right) => Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0));
  return reads[0];
}

function metricPoint(packet: BrandIntelligencePacket, metricName: string, labelOverride?: string): QbrArtifactModuleCard['points'][number] | null {
  const metric = packet.metrics[metricName];
  if (!metric) return null;
  return {
    label: labelOverride ?? metric.metric,
    value: formatMetricValue(metric.value),
    detail: `${metric.ahead} · ${metric.momentum}`,
    tone: toneFromText(`${metric.ahead} ${metric.momentum}`)
  };
}

function compactPoints(points: Array<QbrArtifactModuleCard['points'][number] | null | undefined>, limit = 4) {
  return points.filter(Boolean).slice(0, limit) as QbrArtifactModuleCard['points'];
}

function cleanBrandPossessive(text: string, brandName: string) {
  if (!brandName.endsWith('s') && !brandName.endsWith("'s")) return text;
  return text.replaceAll(`${brandName}'s`, brandName);
}

function cleanCompositionCopy(plan: QbrCompositionPlan, packet: BrandIntelligencePacket): QbrCompositionPlan {
  return {
    ...plan,
    goal: cleanBrandPossessive(plan.goal, packet.brand.brandName),
    decision: cleanBrandPossessive(plan.decision, packet.brand.brandName)
  };
}

function titleForComposition(packet: BrandIntelligencePacket, plan: QbrCompositionPlan) {
  if (plan.compositionMode === 'evidence_read') return `${packet.brand.brandName} evidence read: what the current packet proves`;
  if (plan.compositionMode === 'treatment_read') return `${packet.brand.brandName} treatment read: paths to consider`;
  if (plan.compositionMode === 'assumption_readiness_read') return `${packet.brand.brandName} readiness read: what is measured, assumed, and missing`;
  return `${packet.brand.brandName} is a ${packet.diagnosisResult.primary.diagnosis.name.toLowerCase()} case with a momentum decision to manage.`;
}

function headlineForComposition(packet: BrandIntelligencePacket, plan: QbrCompositionPlan) {
  if (plan.compositionMode === 'evidence_read') return `${packet.momentumIntelligence.headline} This version prioritizes proof, source basis, gaps, and caveats over executive storyline.`;
  if (plan.compositionMode === 'treatment_read') return `${packet.momentumIntelligence.headline} This version focuses on treatment paths to consider and evidence to inspect before action.`;
  if (plan.compositionMode === 'assumption_readiness_read') return `${packet.momentumIntelligence.headline} This version separates demo-ready evidence from prototype assumptions and pilot replacement work.`;
  return packet.momentumIntelligence.headline;
}

function takeawaysForComposition(packet: BrandIntelligencePacket, plan: QbrCompositionPlan) {
  const treatment = packet.treatmentOptions[0];
  const provocation = packet.starterProvocations[0];
  if (plan.compositionMode === 'evidence_read') {
    return [
      {
        label: 'Start with the data basis.',
        body: `${packet.diagnosisTrace.primaryRule.evidenceSummary} The read should stay tied to this active packet until source-owner updates replace or validate it.`
      },
      {
        label: 'Separate proof from gaps.',
        body: packet.evidenceGaps[0]
          ? `${packet.evidenceGaps[0].label}: ${packet.evidenceGaps[0].missingInput}`
          : 'The current packet has no top-level evidence gap flagged for this read.'
      },
      {
        label: 'Use caveats as trust builders.',
        body: plan.guardrails[0] ?? 'Do not overstate causality, pricing action, cannibalization, or official readiness from the current packet.'
      }
    ];
  }
  if (plan.compositionMode === 'treatment_read') {
    return [
      {
        label: 'Treat this as a recommendation path.',
        body: treatment ? `${treatment.name}: ${treatment.globalLibraryRole}` : 'No treatment path should be advanced until the evidence review is complete.'
      },
      {
        label: 'Ground it in brand-specific evidence.',
        body: treatment?.brandSpecificBasis[0] ?? packet.diagnosisTrace.primaryRule.evidenceSummary
      },
      {
        label: 'Inspect before action.',
        body: treatment?.evidenceNeeds[0] ?? 'Confirm evidence needs before treating any option as a prescription.'
      }
    ];
  }
  if (plan.compositionMode === 'assumption_readiness_read') {
    return [
      {
        label: 'Name what is usable for demo.',
        body: `${packet.momentumSourceReadiness.status.replaceAll('_', ' ')} Momentum source posture with ${packet.momentumSourceReadiness.checks.length} readiness checks.`
      },
      {
        label: 'Name what is assumed.',
        body: plan.assumptions[0] ?? 'Prototype assumptions must remain visible and cannot become source-owner facts by implication.'
      },
      {
        label: 'Name the pilot ask.',
        body: 'Replace prototype assumptions with approved competitive sets, measured Room to Grow, SMD contribution weights, trend significance, and official Brand Strategic Context.'
      }
    ];
  }
  return [
    {
      label: 'Start from the BBE read.',
      body: `${packet.brand.brandName} should be discussed through the BBE diagnosis first: ${packet.diagnosisTrace.primaryRule.evidenceSummary}`
    },
    {
      label: 'Name the tension, not just the score.',
      body: provocation?.soWhat ?? packet.momentumIntelligence.caveats[0] ?? 'The useful discussion is what the evidence does and does not prove yet.'
    },
    {
      label: 'Recommend where to look next.',
      body: treatment
        ? `${treatment.name}: ${treatment.brandSpecificBasis[0]}`
        : 'No treatment recommendation should be advanced until the evidence review is complete.'
    }
  ];
}

function moduleCardFor(
  moduleId: string,
  packet: BrandIntelligencePacket,
  plan: QbrCompositionPlan,
  proofCards: QbrArtifactProofCard[],
  peerBasis: QbrExecutiveArtifactModel['peerBasis'],
  trendRead: QbrExecutiveArtifactModel['trendRead'],
  qualityChecks: OutputQualityCheck[]
): QbrArtifactModuleCard {
  const treatment = packet.treatmentOptions[0];
  const provocation = packet.starterProvocations[0];
  const perceivedValuePoint = metricPoint(
    packet,
    packet.displayLanguage.perceivedValueMetricSource,
    packet.displayLanguage.perceivedValueUserLabel
  );
  const fallbackPoints = compactPoints([
    { label: 'Mode', value: plan.compositionMode.replaceAll('_', ' '), detail: plan.decision, tone: 'watch' },
    { label: 'Evidence', value: String(packet.evidenceReadiness.availableInputs.length), detail: packet.evidenceReadiness.evidenceStrength, tone: toneFromText(packet.evidenceReadiness.tone) },
    packet.evidenceGaps[0] ? { label: 'Gap', value: packet.evidenceGaps[0].label, detail: packet.evidenceGaps[0].missingInput, tone: 'watch' } : null
  ], 3);

  switch (moduleId) {
    case 'executive_verdict':
      return {
        id: moduleId,
        kicker: 'Verdict',
        title: `${packet.brand.brandName} is ${packet.diagnosisResult.primary.diagnosis.name.toLowerCase()}.`,
        body: packet.momentumIntelligence.headline,
        tone: packet.momentumIntelligence.redSignals.length ? 'watch' : 'good',
        points: compactPoints([
          metricPoint(packet, 'Demand Power'),
          perceivedValuePoint,
          { label: 'Primary rule', value: `${packet.diagnosisTrace.primaryRule.matchedConditionCount}/${packet.diagnosisTrace.primaryRule.totalConditionCount}`, detail: packet.diagnosisTrace.primaryRule.evidenceSummary, tone: toneFromText(packet.evidenceReadiness.tone) }
        ], 3)
      };
    case 'cmo_review_takeaways':
      return {
        id: moduleId,
        kicker: 'Leadership Takeaways',
        title: 'What the room should align on.',
        body: takeawaysForComposition(packet, plan).map((takeaway) => `${takeaway.label} ${takeaway.body}`).join(' '),
        tone: 'watch',
        points: compactPoints([
          provocation ? { label: 'Provocation', value: provocation.urgency.replaceAll('_', ' '), detail: provocation.soWhat, tone: toneFromText(provocation.urgency) } : null,
          treatment ? { label: 'Treatment path', value: treatment.name, detail: treatment.globalLibraryRole, tone: 'watch' } : null,
          { label: 'Audience', value: plan.audience.replaceAll('_', ' '), detail: plan.decision, tone: 'good' }
        ], 3)
      };
    case 'bbe_bloodwork':
      return {
        id: moduleId,
        kicker: 'BBE Bloodwork',
        title: 'The metric pattern behind the read.',
        body: 'Read Demand Power, Perceived Value, Salient, Meaningful, and Different together. Momentum is the verdict; Ahead/Behind is a size-check, not opportunity sizing.',
        tone: 'watch',
        points: compactPoints([
          metricPoint(packet, 'Demand Power'),
          perceivedValuePoint,
          metricPoint(packet, 'Salient'),
          metricPoint(packet, 'Meaningful'),
          metricPoint(packet, 'Different')
        ], 5)
      };
    case 'momentum_ladder':
      return {
        id: moduleId,
        kicker: 'Momentum Ladder',
        title: packet.momentumIntelligence.status.replaceAll('_', ' '),
        body: packet.momentumIntelligence.headline,
        tone: packet.momentumIntelligence.redSignals.length ? 'bad' : 'good',
        points: compactPoints([
          { label: 'Demand Power', value: packet.momentumIntelligence.demandPowerMomentum, detail: 'Trajectory signal used in the momentum read.', tone: toneFromText(packet.momentumIntelligence.demandPowerMomentum) },
          { label: 'Perceived Value', value: packet.momentumIntelligence.perceivedValueMomentum, detail: packet.displayLanguage.perceivedValueRequiredLanguage, tone: toneFromText(packet.momentumIntelligence.perceivedValueMomentum) },
          { label: 'Red signals', value: String(packet.momentumIntelligence.redSignals.length), detail: packet.momentumIntelligence.redSignals[0] ?? 'No red momentum signal is loaded.', tone: packet.momentumIntelligence.redSignals.length ? 'bad' : 'good' }
        ], 3)
      };
    case 'momentum_room_to_grow':
    case 'room_to_grow':
    case 'room_to_grow_readiness':
      return {
        id: moduleId,
        kicker: 'Momentum x Room To Grow',
        title: packet.roomToGrow.label,
        body: packet.roomToGrow.read,
        tone: roomTone(packet),
        points: compactPoints([
          { label: 'Penetration headroom', value: formatMetricValue(packet.roomToGrow.inputs.penetrationHeadroom), detail: packet.roomToGrow.sourceLabel ?? 'Room to Grow source not fully loaded.', tone: roomTone(packet) },
          { label: 'Demand/share gap', value: formatMetricValue(packet.roomToGrow.inputs.demandPowerShareVsMarketShareGap), detail: 'Used as headroom context, not as final opportunity sizing.', tone: roomTone(packet) },
          { label: 'Category growth', value: formatMetricValue(packet.roomToGrow.inputs.categoryGrowth), detail: 'Category context for the meeting prep provocation.', tone: roomTone(packet) }
        ], 3)
      };
    case 'smd_driver_map':
      return {
        id: moduleId,
        kicker: 'SMD Driver Map',
        title: 'Where salience, meaning, and difference are helping or slipping.',
        body: `SMD momentum reads: Salient ${packet.momentumIntelligence.smdMomentum.salient}, Meaningful ${packet.momentumIntelligence.smdMomentum.meaningful}, Different ${packet.momentumIntelligence.smdMomentum.different}.`,
        tone: toneFromText(`${packet.momentumIntelligence.smdMomentum.salient} ${packet.momentumIntelligence.smdMomentum.meaningful} ${packet.momentumIntelligence.smdMomentum.different}`),
        points: compactPoints([
          metricPoint(packet, 'Salient'),
          metricPoint(packet, 'Meaningful'),
          metricPoint(packet, 'Different'),
          packet.smdContributionWeights ? { label: 'Weight source', value: packet.smdContributionWeights.sourceLabel, detail: packet.smdContributionWeights.caveats[0] ?? 'Directional SMD contribution weights are loaded.', tone: 'watch' } : null
        ], 4)
      };
    case 'proof_cards':
    case 'evidence_spotlight':
    case 'evidence_ledger':
      return {
        id: moduleId,
        kicker: 'Proof Stack',
        title: 'Why the read is grounded.',
        body: `${packet.evidenceReadiness.evidenceStrength} The proof stack keeps diagnosis, momentum, Room to Grow, peer basis, trend context, and source posture visible.`,
        tone: toneFromText(packet.evidenceReadiness.tone),
        points: proofCards.slice(0, 4).map((card) => ({
          label: card.label,
          value: card.title,
          detail: card.body,
          tone: card.tone
        }))
      };
    case 'guardrails':
      return {
        id: moduleId,
        kicker: 'Guardrails',
        title: 'What not to overclaim.',
        body: plan.guardrails.slice(0, 3).join(' '),
        tone: 'watch',
        points: compactPoints([
          ...plan.guardrails.slice(0, 3).map((guardrail) => ({ label: 'Guardrail', value: 'Do not overclaim', detail: guardrail, tone: 'watch' as const })),
          qualityChecks[0] ? { label: qualityChecks[0].label, value: qualityChecks[0].status, detail: qualityChecks[0].detail, tone: toneFromText(qualityChecks[0].status) } : null
        ], 4)
      };
    case 'next_decision_path':
    case 'next_test_path':
      return {
        id: moduleId,
        kicker: 'Next Decision',
        title: treatment ? `Inspect ${treatment.name} before action.` : 'Decide the next evidence check.',
        body: treatment?.whyThisFits ?? provocation?.nowWhat ?? 'Use the artifact to decide the next test path, not to issue final action instructions.',
        tone: 'watch',
        points: compactPoints([
          treatment?.evidenceNeeds[0] ? { label: 'Inspect first', value: 'Evidence need', detail: treatment.evidenceNeeds[0], tone: 'watch' } : null,
          treatment?.followUpSignals[0] ? { label: 'Watch signal', value: 'Follow-up', detail: treatment.followUpSignals[0], tone: 'good' } : null,
          { label: 'Decision', value: plan.audience.replaceAll('_', ' '), detail: plan.decision, tone: 'good' }
        ], 3)
      };
    case 'governance_disclosure':
    case 'source_disclosure':
      return {
        id: moduleId,
        kicker: 'Governance',
        title: 'Review draft, not official circulation.',
        body: 'The output can support a review draft workspace here, while official export, circulation, and approval remain gated.',
        tone: 'watch',
        points: compactPoints([
          { label: 'Source posture', value: packet.momentumSourceReadiness.status.replaceAll('_', ' '), detail: packet.momentumSourceReadiness.checks[0]?.detail ?? 'Source readiness checks are retained in the packet.', tone: packet.momentumSourceReadiness.canonicalForExecutiveUse ? 'good' : 'watch' },
          { label: 'Assumption', value: String(plan.assumptions.length), detail: plan.assumptions[0] ?? 'No top-level assumption was returned by the planner.', tone: 'watch' },
          { label: 'Export', value: 'Gated', detail: 'Official export and circulation stay blocked in the POC.', tone: 'watch' }
        ], 3)
      };
    case 'data_basis_inspector':
      return {
        id: moduleId,
        kicker: 'Data Basis',
        title: 'What Jarvis is working from.',
        body: `The active packet has ${packet.dataCoverage.metricCount} metric reads, ${packet.dataCoverage.trendMetricCount} trend reads, ${packet.evidenceGaps.length} evidence gaps, and ${packet.sourceFiles.length} source files.`,
        tone: packet.evidenceGaps.length ? 'watch' : 'good',
        points: compactPoints([
          { label: 'Metrics', value: String(packet.dataCoverage.metricCount), detail: 'Loaded into the Brand Intelligence Packet.', tone: 'good' },
          { label: 'Trend reads', value: String(packet.dataCoverage.trendMetricCount), detail: packet.momentumTrendContext.sourcePeriodLabel, tone: trendRead.tone },
          { label: 'Source files', value: String(packet.sourceFiles.length), detail: packet.sourceFiles[0] ?? 'No source file label was loaded.', tone: 'watch' },
          packet.evidenceGaps[0] ? { label: 'Top gap', value: packet.evidenceGaps[0].label, detail: packet.evidenceGaps[0].missingInput, tone: 'bad' } : null
        ], 4)
      };
    case 'diagnosis_trace':
      return {
        id: moduleId,
        kicker: 'Diagnosis Trace',
        title: packet.diagnosisResult.primary.diagnosis.name,
        body: packet.diagnosisTrace.primaryRule.evidenceSummary,
        tone: toneFromText(packet.evidenceReadiness.tone),
        points: compactPoints([
          { label: 'Rule match', value: `${packet.diagnosisTrace.primaryRule.matchedConditionCount}/${packet.diagnosisTrace.primaryRule.totalConditionCount}`, detail: 'Matched governed diagnosis conditions.', tone: toneFromText(packet.evidenceReadiness.tone) },
          { label: 'Evidence', value: String(packet.evidenceReadiness.availableInputs.length), detail: packet.evidenceReadiness.evidenceStrength, tone: toneFromText(packet.evidenceReadiness.tone) }
        ], 2)
      };
    case 'peer_basis':
      return {
        id: moduleId,
        kicker: 'Peer Basis',
        title: peerBasis.title,
        body: peerBasis.body,
        tone: peerBasis.tone,
        points: compactPoints([
          packet.peerSet ? { label: 'Peer count', value: String(packet.peerSet.peerCount), detail: packet.peerSet.selectionBasis, tone: 'watch' } : null,
          ...peerBasis.caveats.slice(0, 2).map((caveat) => ({ label: 'Caveat', value: 'Comparison', detail: caveat, tone: 'watch' as const }))
        ], 3)
      };
    case 'data_gaps':
      return {
        id: moduleId,
        kicker: 'Evidence Gaps',
        title: packet.evidenceGaps.length ? 'Missing inputs to keep visible.' : 'No top-level evidence gap flagged.',
        body: packet.evidenceGaps[0]?.missingInput ?? 'The current packet did not return a top-level evidence gap for this read.',
        tone: packet.evidenceGaps.length ? 'bad' : 'good',
        points: packet.evidenceGaps.slice(0, 4).map((gap) => ({
          label: gap.label,
          value: gap.severity,
          detail: gap.missingInput,
          tone: toneFromText(gap.severity)
        }))
      };
    case 'diagnosis_to_treatment_bridge':
    case 'treatment_recommendation_paths':
    case 'brand_specific_basis':
    case 'areas_to_inspect':
      return {
        id: moduleId,
        kicker: 'Treatment Path',
        title: treatment?.name ?? 'Complete evidence review before recommending a path.',
        body: treatment?.globalLibraryRole ?? 'Treatment paths stay framed as options to consider until evidence review is complete.',
        tone: 'watch',
        points: compactPoints([
          treatment?.brandSpecificBasis[0] ? { label: 'Brand basis', value: 'Why it fits', detail: treatment.brandSpecificBasis[0], tone: 'good' } : null,
          treatment?.evidenceNeeds[0] ? { label: 'Inspect first', value: 'Evidence need', detail: treatment.evidenceNeeds[0], tone: 'watch' } : null,
          treatment?.whenNotToUse ? { label: 'Do not use when', value: 'Caveat', detail: treatment.whenNotToUse, tone: 'bad' } : null
        ], 3)
      };
    case 'assumption_catalog':
    case 'measured_vs_prototype_inputs':
    case 'source_readiness':
    case 'smd_weight_readiness':
    case 'artifact_readiness':
    case 'pilot_replacement_work':
      return {
        id: moduleId,
        kicker: 'Readiness',
        title: 'Measured, assumed, missing, and pilot replacement work.',
        body: plan.assumptions.slice(0, 3).join(' '),
        tone: 'watch',
        points: compactPoints([
          ...plan.assumptions.slice(0, 3).map((assumption) => ({ label: 'Current posture', value: 'Review', detail: assumption, tone: 'watch' as const })),
          { label: 'Pilot ask', value: 'Replace assumptions', detail: 'Source-owner data should replace prototype assumptions before pilot funding or executive circulation.', tone: 'bad' }
        ], 4)
      };
    default:
      return {
        id: moduleId,
        kicker: 'Approved Module',
        title: moduleId.replaceAll('_', ' '),
        body: 'This approved module is selected by the meeting prep composition planner and remains constrained to the loaded packet.',
        tone: 'watch',
        points: fallbackPoints
      };
  }
}

export function buildQbrExecutiveArtifactModel(
  packet: BrandIntelligencePacket,
  work: BrandWorkItem
): QbrExecutiveArtifactModel {
  const realityContext = buildAssistantRealityContext(packet, work.sourcePrompt);
  const composition = cleanCompositionCopy(work.qbrCompositionPlan ?? planQbrComposition({
    question: work.sourcePrompt,
    packet,
    approvedViewIds: work.approvedViewIds
  }), packet);
  const treatment = packet.treatmentOptions[0];
  const strongestTrend = strongestTrendRead(packet);
  const peerBasis = packet.peerSet
    ? {
      title: `${packet.peerSet.label} (${packet.peerSet.peerCount} peers)`,
      body: packet.peerSet.selectionBasis,
      caveats: packet.peerSet.caveats,
      tone: 'watch' as const
    }
    : {
      title: 'Peer-set basis missing',
      body: 'Ahead/Behind and comparison language must remain caveated until a reviewed peer set is loaded.',
      caveats: ['Do not use missing peer context as a proxy for competitive position.'],
      tone: 'bad' as const
    };

  const qualityChecks = packet.outputQualityChecks
    .filter((check) => check.appliesTo.includes('executive_read') || check.appliesTo.includes('brief_story'))
    .slice(0, 8);
  const trendRead = {
    title: strongestTrend ? `${strongestTrend.metric}: ${strongestTrend.direction}` : 'Trend evidence missing',
    body: strongestTrend?.read ?? 'Load or approve multi-quarter source evidence before using trend as an executive read.',
    caveats: packet.momentumTrendContext.caveats,
    tone: trendTone(packet)
  };
  const proofCards = [
    {
      id: 'diagnosis-proof',
      label: 'Diagnosis proof',
      title: packet.diagnosisResult.primary.diagnosis.name,
      body: `${packet.diagnosisTrace.primaryRule.matchedConditionCount}/${packet.diagnosisTrace.primaryRule.totalConditionCount} rule conditions matched. ${packet.evidenceReadiness.evidenceStrength}`,
      tone: toneFromText(packet.evidenceReadiness.tone)
    },
    {
      id: 'momentum-read',
      label: 'Momentum read',
      title: packet.momentumIntelligence.status.replaceAll('_', ' '),
      body: packet.momentumIntelligence.headline,
      tone: packet.momentumIntelligence.redSignals.length ? 'watch' : 'good'
    },
    {
      id: 'room-to-grow',
      label: 'Room to grow',
      title: packet.roomToGrow.label,
      body: packet.roomToGrow.read,
      tone: roomTone(packet)
    },
    {
      id: 'source-posture',
      label: 'Source posture',
      title: packet.momentumSourceReadiness.status.replaceAll('_', ' '),
      body: packet.momentumSourceReadiness.canonicalForExecutiveUse
        ? 'Approved source-owner Momentum evidence is available; human review still applies.'
        : `${packet.momentumSourceReadiness.checks.filter((check) => check.status !== 'source_ready').length} source-readiness checks still need owner review before executive use.`,
      tone: packet.momentumSourceReadiness.canonicalForExecutiveUse ? 'good' : 'watch'
    },
    {
      id: 'peer-basis',
      label: 'Peer basis',
      title: peerBasis.title,
      body: peerBasis.body,
      tone: peerBasis.tone
    },
    {
      id: 'trend-context',
      label: 'Trend context',
      title: packet.momentumTrendContext.sourcePeriodLabel,
      body: strongestTrend?.read ?? 'The packet does not have enough time-series evidence for a multi-quarter meeting prep read.',
      tone: trendTone(packet)
    }
  ] satisfies QbrArtifactProofCard[];
  const compositionModules = composition.selectedModules
    .map((moduleId) => moduleCardFor(moduleId, packet, composition, proofCards, peerBasis, trendRead, qualityChecks));

  return {
    executiveLabel: safeWorkOrderLabel('CMO-ready'),
    composition,
    compositionModules,
    verdict: {
      title: titleForComposition(packet, composition),
      headline: headlineForComposition(packet, composition)
    },
    takeaways: takeawaysForComposition(packet, composition),
    proofCards,
    treatment: {
      title: treatment?.name ?? 'Complete evidence review before recommending a path.',
      body: treatment?.globalLibraryRole ?? 'A human brand/insights lead should review the evidence before advancing a treatment recommendation.',
      bullets: treatment
        ? [
          ...treatment.brandSpecificBasis.slice(0, 3),
          ...treatment.evidenceNeeds.slice(0, 3).map((need) => `Inspect before acting: ${need}`)
        ]
        : []
    },
    peerBasis,
    roomToGrow: {
      title: packet.roomToGrow.label,
      body: packet.roomToGrow.read,
      tone: roomTone(packet)
    },
    trendRead,
    guardrails: [
      ...packet.agentGuardrails
        .filter((guardrail) => guardrail.includes('Do not') || guardrail.includes('not ') || guardrail.includes('humans decide') || guardrail.includes('broad brand-equity'))
        .slice(0, 5),
      ...packet.evidenceGaps.slice(0, 3).map((gap) => `${gap.label}: ${gap.missingInput}`)
    ],
    qualityChecks,
    inlineViewIds: Array.from(new Set([
      ...composition.approvedViewIds,
      ...work.approvedViewIds.filter((viewId) => ['data_gap_panel', 'treatment_path_card', 'growth_provocation_list', 'data_basis_inspector'].includes(viewId))
    ])).slice(0, 8),
    governance: {
      sourcePeriodLine: realityContext.sourcePeriodLine,
      shareExportLine: realityContext.shareExportLine,
      workOrderLabel: realityContext.workOrderLabel
    }
  };
}
