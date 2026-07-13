import type { BrandIntelligencePacket } from '@/src/lib/intelligence/types';

export type QbrCompositionMode =
  | 'executive_qbr'
  | 'evidence_read'
  | 'treatment_read'
  | 'assumption_readiness_read';

export type QbrCompositionPlan = {
  id: 'qbr-composition-plan-v1';
  goal: string;
  audience: 'cmo' | 'insights_lead' | 'brand_lead' | 'operator' | 'agency' | 'mixed';
  decision: string;
  compositionMode: QbrCompositionMode;
  confidence: 'high' | 'medium' | 'low';
  clarifyingQuestion: string | null;
  selectedModules: string[];
  approvedViewIds: string[];
  dataNeeds: string[];
  assumptions: string[];
  guardrails: string[];
  nextBestActions: string[];
};

type PlannerInput = {
  question: string;
  packet: BrandIntelligencePacket;
  approvedViewIds?: string[];
};

const modeModules: Record<QbrCompositionMode, string[]> = {
  executive_qbr: [
    'executive_verdict',
    'cmo_review_takeaways',
    'bbe_bloodwork',
    'momentum_ladder',
    'momentum_room_to_grow',
    'smd_driver_map',
    'proof_cards',
    'guardrails',
    'next_decision_path',
    'governance_disclosure'
  ],
  evidence_read: [
    'data_basis_inspector',
    'diagnosis_trace',
    'evidence_spotlight',
    'evidence_ledger',
    'peer_basis',
    'room_to_grow',
    'smd_driver_map',
    'data_gaps',
    'source_disclosure'
  ],
  treatment_read: [
    'diagnosis_to_treatment_bridge',
    'treatment_recommendation_paths',
    'brand_specific_basis',
    'areas_to_inspect',
    'evidence_ledger',
    'proof_cards',
    'guardrails',
    'next_test_path'
  ],
  assumption_readiness_read: [
    'assumption_catalog',
    'source_readiness',
    'measured_vs_prototype_inputs',
    'peer_basis',
    'room_to_grow_readiness',
    'smd_weight_readiness',
    'artifact_readiness',
    'pilot_replacement_work',
    'governance_disclosure'
  ]
};

const modeViews: Record<QbrCompositionMode, string[]> = {
  executive_qbr: [
    'momentum_ladder',
    'momentum_room_to_grow_grid',
    'smd_driver_map',
    'qbr_story_draft',
    'evidence_ledger',
    'evidence_spotlight_panel',
    'data_gap_panel'
  ],
  evidence_read: [
    'data_basis_inspector',
    'evidence_ledger',
    'evidence_spotlight_panel',
    'diagnosis_trace_summary',
    'momentum_room_to_grow_grid',
    'smd_driver_map',
    'data_gap_panel'
  ],
  treatment_read: [
    'treatment_path_card',
    'growth_provocation_list',
    'data_basis_inspector',
    'evidence_ledger',
    'evidence_spotlight_panel',
    'data_gap_panel'
  ],
  assumption_readiness_read: [
    'data_basis_inspector',
    'source_readiness_panel',
    'source_runtime_ingestion_panel',
    'artifact_readiness_panel',
    'evidence_ledger',
    'data_gap_panel'
  ]
};

function includesAny(value: string, signals: string[]) {
  return signals.some((signal) => value.includes(signal));
}

function unique(values: string[], limit = 10) {
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

function inferMode(normalized: string): QbrCompositionMode {
  const asksQbrOrExecutive = includesAny(normalized, ['qbr', 'meeting prep', 'meeting read', 'cmo', 'executive read', 'leadership read', 'decision read']);
  if (includesAny(normalized, ['synthetic', 'assumption', 'assumed', 'made up', 'prototype', 'real data', 'source owner', 'source-owner', 'pilot replacement', 'what is missing', 'what is real', 'readiness'])) {
    return 'assumption_readiness_read';
  }
  if (includesAny(normalized, ['treatment', 'recommendation', 'what should we do', 'what should i do', 'action path', 'path to test', 'fix this', 'areas to inspect'])) {
    return 'treatment_read';
  }
  if (includesAny(normalized, ['actual data', 'show me the data', 'data basis', 'data behind', 'source basis', 'raw data', 'what data', 'evidence read'])
    || (!asksQbrOrExecutive && includesAny(normalized, ['proof', 'evidence']))) {
    return 'evidence_read';
  }
  return 'executive_qbr';
}

function inferAudience(normalized: string): QbrCompositionPlan['audience'] {
  if (includesAny(normalized, ['cmo', 'executive', 'leadership', 'qbr', 'meeting prep'])) return 'cmo';
  if (includesAny(normalized, ['insights', 'evidence', 'proof', 'data'])) return 'insights_lead';
  if (includesAny(normalized, ['brand lead', 'brand team', 'brand manager', 'marketer'])) return 'brand_lead';
  if (includesAny(normalized, ['operator', 'sales', 'retail', 'commercial'])) return 'operator';
  if (includesAny(normalized, ['agency', 'brief', 'creative'])) return 'agency';
  return 'mixed';
}

function confidenceFor(normalized: string, mode: QbrCompositionMode): QbrCompositionPlan['confidence'] {
  const hasAudience = includesAny(normalized, ['cmo', 'executive', 'leadership', 'insights', 'brand lead', 'brand team', 'agency', 'operator']);
  const hasMode = mode !== 'executive_qbr' || includesAny(normalized, ['qbr', 'meeting prep', 'meeting read', 'cmo', 'executive read', 'leadership read', 'decision read']);
  if (hasAudience && hasMode) return 'high';
  if (hasMode || includesAny(normalized, ['proof', 'data', 'treatment', 'assumption', 'readiness'])) return 'medium';
  if (includesAny(normalized, ['artifact', 'output', 'workspace', 'read', 'plan'])) return 'low';
  return 'medium';
}

function brandPossessive(brandName: string) {
  return brandName.endsWith('s') || brandName.endsWith("'s") ? brandName : `${brandName}'s`;
}

function decisionFor(mode: QbrCompositionMode, packet: BrandIntelligencePacket) {
  if (mode === 'evidence_read') return 'Decide whether the current read is sufficiently proven for a leadership discussion.';
  if (mode === 'treatment_read') return 'Decide which treatment path is worth considering and what evidence must be inspected first.';
  if (mode === 'assumption_readiness_read') return 'Decide what is demo-ready, what is assumed, and what source-owner work is required for pilot.';
  return `Decide how to frame ${brandPossessive(packet.brand.brandName)} momentum, risks, proof, and next test path for leadership review.`;
}

function goalFor(mode: QbrCompositionMode, packet: BrandIntelligencePacket) {
  if (mode === 'evidence_read') return `Expose the active ${packet.brand.brandName} data, proof, gaps, and caveats behind the read.`;
  if (mode === 'treatment_read') return `Translate the ${packet.brand.brandName} diagnosis into treatment paths to consider, with areas to inspect before action.`;
  if (mode === 'assumption_readiness_read') return `Separate measured, reviewed-local, prototype-assumed, and missing ${packet.brand.brandName} inputs before pilot use.`;
  return `Create a leadership-ready ${packet.brand.brandName} meeting prep intelligence asset grounded in the loaded packet.`;
}

function assumptionLines(packet: BrandIntelligencePacket) {
  return unique([
    `${packet.momentumSourceReadiness.status.replaceAll('_', ' ')} source posture for Momentum Intelligence.`,
    `Room to Grow is ${packet.roomToGrow.status.replaceAll('_', ' ')}: ${packet.roomToGrow.read}`,
    packet.peerSet
      ? `Peer set loaded as ${packet.peerSet.label} with ${packet.peerSet.peerCount} peers.`
      : 'Peer set is not loaded; comparison language must remain caveated.',
    ...packet.momentumTrendContext.caveats.slice(0, 2),
    ...packet.evidenceGaps.slice(0, 3).map((gap) => `${gap.label}: ${gap.missingInput}`)
  ], 8);
}

export function isQbrCompositionCandidate(question: string, approvedTemplateId?: string | null) {
  const normalized = question.toLowerCase();
  return approvedTemplateId === 'executive-qbr-decision-read'
    || includesAny(normalized, ['qbr', 'meeting prep', 'meeting read', 'executive read', 'leadership read', 'decision read', 'actual data', 'data basis', 'treatment recommendation', 'source readiness', 'assumption', 'synthetic']);
}

export function planQbrComposition(input: PlannerInput): QbrCompositionPlan {
  const normalized = input.question.toLowerCase();
  const compositionMode = inferMode(normalized);
  const confidence = confidenceFor(normalized, compositionMode);
  const audience = inferAudience(normalized);
  const clarifyingQuestion = confidence === 'low'
    ? 'Is this primarily for CMO review, an insights evidence check, a treatment recommendation, or an assumption/readiness review?'
    : null;
  const approvedViewIds = unique([
    ...modeViews[compositionMode],
    ...(input.approvedViewIds ?? [])
  ], 8);
  const firstTreatment = input.packet.treatmentOptions[0]?.name;

  return {
    id: 'qbr-composition-plan-v1',
    goal: goalFor(compositionMode, input.packet),
    audience,
    decision: decisionFor(compositionMode, input.packet),
    compositionMode,
    confidence,
    clarifyingQuestion,
    selectedModules: modeModules[compositionMode],
    approvedViewIds,
    dataNeeds: unique([
      'Brand Intelligence Packet',
      'BBE bloodwork in Demand Power / Salient / Meaningful / Different / Perceived Value order',
      'Momentum read and loaded source period',
      'Room to Grow posture',
      'SMD driver posture',
      'Peer-set basis and caveats',
      'Treatment library ranking and evidence needs',
      'Output quality checks and review gates'
    ], 8),
    assumptions: assumptionLines(input.packet),
    guardrails: unique([
      ...input.packet.agentGuardrails,
      'Keep output as a review draft; do not imply official approval.',
      'Do not export or circulate until governance clears.',
      'Do not treat prototype assumptions as source-owner facts.'
    ], 8),
    nextBestActions: unique([
      compositionMode === 'executive_qbr' ? 'Open the Evidence Read for the meeting prep proof basis.' : 'Build the meeting prep intelligence asset.',
      compositionMode === 'evidence_read' ? 'Create the Treatment Read from this evidence.' : 'Open the Data and Evidence Inspector.',
      firstTreatment ? `Create a governed treatment recommendation around ${firstTreatment}.` : 'Create a governed treatment recommendation workspace.',
      'Open the Assumption and Readiness Read.'
    ], 4)
  };
}
