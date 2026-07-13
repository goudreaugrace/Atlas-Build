import {
  agentSkillRegistry,
  buildBrandIntelligencePacket,
  dynamicViewRegistry,
  experienceTemplateRegistry,
  findAgentSkill,
  findDynamicView
} from '@/src/lib/intelligence/kernel';
import { planExperience } from '@/src/lib/intelligence/experience-planner';
import type {
  AgentEvidenceReference,
  AgentAcceptedMemoryContext,
  AgentSkillRouterInput,
  AgentSkillRouterResult,
  BbeMomentumIntelligenceRead,
  BrandIntelligencePacket,
  DecisionPackageDraft,
  DynamicViewRequest,
  GroundedAgentAnswer,
  GrowthProvocation,
  SourceClaimContext,
  SourcePromotionContext
} from '@/src/lib/intelligence/types';

const DEFAULT_SKILL_ID = 'answer_brand_question';

function normalizedQuestion(question: string) {
  return question.trim().toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function asksForSourceReadiness(value: string) {
  return includesAny(value, [
    'source readiness',
    'source-owner',
    'source owner',
    'source extract',
    'source-extract',
    'source bundle',
    'extract bundle',
    'source intake',
    'handoff bundle',
    'import bundle',
    'upload extract',
    'approved extract',
    'executive use',
    'readiness blocker',
    'readiness blocks',
    'what blocks'
  ]);
}

function asksForDataBasis(value: string) {
  return includesAny(value, [
    'actual data',
    'data basis',
    'data behind',
    'data you are working with',
    'data are you working with',
    'what data are you using',
    'what data did you use',
    'show me the data',
    'show the data',
    'source data',
    'raw data behind',
    'metric basis'
  ]);
}

function asksForMeetingTakeaway(value: string) {
  return includesAny(value, [
    'meeting takeaway',
    'capture decision',
    'capture decisions',
    'final takeaway',
    'meeting recap',
    'workshop recap',
    'takeaway',
    'recap'
  ]);
}

function asksForReviewWorkflow(value: string) {
  return includesAny(value, [
    'review queue',
    'review workflow',
    'review operations',
    'audit session',
    'pending approval',
    'pending approvals',
    'pending review',
    'what needs review',
    'review state',
    'session review',
    'audit trail',
    'human decisions'
  ]);
}

function asksForPilotLearning(value: string) {
  return includesAny(value, [
    'pilot learning',
    'learning summary',
    'session learning',
    'learning signals',
    'what are we learning',
    'what did we learn',
    'learn from this session',
    'what can we learn',
    'what should we learn',
    'learning loop'
  ]);
}

function asksForQuietProactivity(value: string) {
  return includesAny(value, [
    'quiet proactivity',
    'follow up',
    'follow-up',
    'followups',
    'held notice',
    'held notices',
    'reminder',
    'reminders',
    'what should we revisit',
    'what should happen next',
    'next follow-up'
  ]);
}

function asksForVoiceReadiness(value: string) {
  return includesAny(value, [
    'voice readiness',
    'voice gates',
    'jarvis readiness',
    'jarvis-style',
    'realtime voice',
    'continuous voice',
    'tts',
    'provider adapter',
    'provider adapters',
    'wake listen',
    'wake/listen'
  ]);
}

function asksForPersistenceReadiness(value: string) {
  return includesAny(value, [
    'persistence readiness',
    'enterprise persistence',
    'durable memory',
    'durable audit',
    'local json',
    'database readiness',
    'retention privacy',
    'backup recovery',
    'audit storage'
  ]);
}

function asksForSourcePromotionReadiness(value: string) {
  return includesAny(value, [
    'source promotion readiness',
    'source claim promotion',
    'canonical source promotion',
    'canonical facts',
    'source candidates',
    'source claims',
    'source promotion blockers',
    'runtime source consumption',
    'reviewed local source'
  ]);
}

function asksForTreatmentOutcomeReadiness(value: string) {
  return includesAny(value, [
    'treatment outcome readiness',
    'treatment outcomes',
    'outcome learning',
    'efficacy readiness',
    'treatment efficacy',
    'follow-up signals',
    'outcome records',
    'portfolio learning',
    'canonical learning',
    'learning governance'
  ]);
}

function asksForRuntimeGovernance(value: string) {
  return includesAny(value, [
    'runtime governance',
    'runtime control',
    'kill switch',
    'capability flags',
    'runtime surfaces',
    'surface readiness',
    'surface map',
    'governed surfaces',
    'provider gates',
    'which surfaces are ready'
  ]);
}

function asksForCapabilityOverreach(value: string) {
  return includesAny(value, [
    'certify this as production ready',
    'certify production ready',
    'certify production-ready',
    'production ready',
    'production-ready',
    'production certification',
    'approve funding',
    'funding approval',
    'unlock export',
    'export the audit',
    'export audit',
    'audit export',
    'turn on full voice',
    'activate full voice',
    'enable full voice',
    'write source truth',
    'source truth',
    'canonical source truth',
    'write canonical',
    'canonical write',
    'canonical writes',
    'official approval',
    'official approver'
  ]);
}

function asksForFoundationReadiness(value: string) {
  return includesAny(value, [
    'foundation readiness',
    'platform readiness',
    'brand growth intelligence foundation',
    'cmo readiness',
    'fundable foundation',
    'foundation control plane',
    'control plane',
    'is the foundation ready',
    'what is ready',
    'what is gated'
  ]);
}

function asksForExecutivePilot(value: string) {
  return includesAny(value, [
    'executive pilot',
    'cmo pilot',
    'funding demo',
    'sponsor runbook',
    'demo runbook',
    'pilot runbook',
    'show the pilot path',
    'make the case to fund',
    'holy shit demo',
    'jaw drop demo'
  ]);
}

function asksForExperienceArchitecture(value: string) {
  return includesAny(value, [
    'experience architecture',
    'experience plan readiness',
    'dynamic ui foundation',
    'workspace builder',
    'build the right workspace',
    'role specific workspace',
    'role-specific workspace',
    'approved templates',
    'approved views',
    'compose ui',
    'new user workspace'
  ]);
}

function asksForArtifactReadiness(value: string) {
  return includesAny(value, [
    'artifact readiness',
    'export readiness',
    'circulation readiness',
    'can we share this',
    'can we export',
    'artifact gates',
    'qbr draft readiness',
    'meeting artifact readiness',
    'agency brief readiness'
  ]);
}

function asksForDraftArtifact(value: string) {
  return includesAny(value, [
    'draft a',
    'draft an',
    'draft qbr',
    'draft the',
    'write a',
    'write an',
    'make a memo',
    'create talk track',
    'create a talk track',
    'write agency brief',
    'agency brief',
    'make slides',
    'slide outline',
    'package this'
  ]);
}

function chooseSkillId(input: AgentSkillRouterInput): string {
  if (input.preferredSkillId && findAgentSkill(input.preferredSkillId)) return input.preferredSkillId;

  const question = normalizedQuestion(input.question);
  if (asksForExecutivePilot(question)) {
    return 'plan_executive_pilot';
  }
  if (asksForFoundationReadiness(question)) {
    return 'inspect_foundation_readiness';
  }
  if (asksForReviewWorkflow(question)) {
    return 'review_session_state';
  }
  if (asksForArtifactReadiness(question)) {
    return 'inspect_artifact_readiness';
  }
  if (asksForExperienceArchitecture(question)) {
    return 'inspect_experience_architecture';
  }
  if (asksForCapabilityOverreach(question)) {
    return 'inspect_runtime_governance';
  }
  if (asksForRuntimeGovernance(question)) {
    return 'inspect_runtime_governance';
  }
  if (asksForTreatmentOutcomeReadiness(question)) {
    return 'inspect_treatment_outcome_readiness';
  }
  if (asksForPersistenceReadiness(question)) {
    return 'inspect_persistence_readiness';
  }
  if (asksForSourcePromotionReadiness(question)) {
    return 'inspect_source_promotion_readiness';
  }
  if (asksForVoiceReadiness(question)) {
    return 'inspect_voice_readiness';
  }
  if (asksForQuietProactivity(question)) {
    return 'inspect_quiet_proactivity';
  }
  if (asksForPilotLearning(question)) {
    return 'inspect_pilot_learning';
  }
  if (asksForMeetingTakeaway(question)) {
    return 'facilitate_live_meeting';
  }
  if (asksForDataBasis(question)) {
    return 'explain_diagnosis_evidence';
  }
  if (asksForSourceReadiness(question)) {
    return 'bbe_momentum_intelligence_read';
  }
  if (includesAny(question, ['teach me', 'teach', 'explain concept', 'help me understand', 'learn', 'learning path', 'learning plan', 'training plan', 'education page', 'education pages'])) {
    return 'teach_brand_growth_concept';
  }
  if (includesAny(question, ['test me', 'quiz me', 'practice this', 'check my understanding', 'test diagnostic', 'diagnostic test', 'practice diagnostic'])) {
    return 'test_understanding';
  }
  if (asksForDraftArtifact(question)) {
    return 'draft_meeting_story';
  }
  if (includesAny(question, ['qbr', 'bgs', 'momentum', 'slipping', 'declining', 'red signal', 'growth provocation'])) {
    return 'bbe_momentum_intelligence_read';
  }
  if (includesAny(question, ['compare', 'competitor', 'competitors', 'peer', 'peers', 'versus', ' vs ', 'benchmark against'])) {
    return 'compare_brands_or_competitors';
  }
  if (includesAny(question, ['diagnosis', 'why did', 'evidence', 'proof', 'rule', 'trace', 'complicate', 'wrong'])) {
    return 'explain_diagnosis_evidence';
  }
  if (includesAny(question, ['what should', 'treatment', 'prescribe', 'test first', 'action', 'now what'])) {
    return 'create_growth_provocations';
  }
  if (includesAny(question, ['show', 'visual', 'view', 'chart', 'canvas', 'open'])) {
    return 'recommend_dynamic_view';
  }
  return DEFAULT_SKILL_ID;
}

function evidenceReferences(packet: BrandIntelligencePacket, limit = 5): AgentEvidenceReference[] {
  const supporting = packet.diagnosisTrace.primaryRule.conditions
    .filter((condition) => condition.matched)
    .map((condition) => ({
      label: `${condition.metric} ${condition.field}`,
      detail: `${condition.evidence} Actual: ${condition.actual}.`,
      source: `${condition.source} · ${condition.wave} · slide ${condition.slide}`
    }));

  const metrics = Object.values(packet.metrics).slice(0, limit).map((metric) => ({
    label: metric.metric === 'Pricing Power' ? 'Perceived Value' : metric.metric,
    detail: `${metric.displayValue ?? metric.value ?? 'Missing'} · ${metric.categoryBand} · ${metric.ahead} · ${metric.momentum}`,
    source: `${metric.source} · ${metric.wave} · slide ${metric.slide}`
  }));

  return [...supporting, ...metrics].slice(0, limit);
}

function viewRequest(viewId: string, packet: BrandIntelligencePacket, reason: string): DynamicViewRequest {
  const view = findDynamicView(viewId);
  const requiredDataAvailable = Boolean(view) && (
    viewId !== 'momentum_room_to_grow_grid' || packet.roomToGrow.status !== 'missing'
  );
  return {
    viewId,
    reason,
    requiredDataAvailable,
    fallbackViewId: requiredDataAvailable ? undefined : 'data_gap_panel'
  };
}

function approvedViewRequests(packet: BrandIntelligencePacket, skillId: string): DynamicViewRequest[] {
  const skill = findAgentSkill(skillId);
  const allowed = new Set(skill?.allowedViewIds ?? packet.recommendedViewIds);
  const recommended = packet.recommendedViewIds
    .filter((viewId) => allowed.has(viewId))
    .slice(0, 5);
  const viewIds = recommended.length
    ? recommended
    : skill?.family === 'learning'
      ? skill.allowedViewIds.slice(0, 5)
      : packet.recommendedViewIds.slice(0, 5);
  return viewIds
    .map((viewId) => viewRequest(viewId, packet, `Recommended for ${skill?.name ?? skillId}.`));
}

function acceptedMemoryForPacket(input: AgentSkillRouterInput, packet: BrandIntelligencePacket): AgentAcceptedMemoryContext[] {
  return (input.acceptedMemory ?? [])
    .filter((record) => record.reviewStatus === 'accepted' && record.brandId === packet.brand.brandId)
    .slice(0, 8);
}

function sourcePromotionContextForPacket(input: AgentSkillRouterInput, packet: BrandIntelligencePacket): SourcePromotionContext {
  const records = (input.sourcePromotionCandidates ?? [])
    .filter((record) => record.brandId === packet.brand.brandId)
    .slice(0, 8)
    .map((record) => ({
      id: record.id,
      kind: record.kind,
      brandId: record.brandId,
      sourceLabel: record.sourceLabel,
      sourceOwner: record.sourceOwner,
      sourceDate: record.sourceDate,
      status: record.status,
      promotedAt: record.promotedAt,
      validationSummary: record.validationSummary,
      warnings: record.warnings,
      canonicalWriteEnabled: record.canonicalWriteEnabled
    }));

  return {
    records,
    canonicalWriteEnabled: false,
    runtimeAutoConsumption: false,
    caveats: [
      records.length
        ? `${records.length} reviewed-local source promotion candidate${records.length === 1 ? '' : 's'} exist for this brand.`
        : 'No reviewed-local source promotion candidates were loaded for this brand.',
      'Reviewed-local source promotion records are not canonical source facts.',
      'The agent runtime does not automatically consume durable source promotion records as evidence.'
    ]
  };
}

function sourceClaimContextForPacket(input: AgentSkillRouterInput, packet: BrandIntelligencePacket): SourceClaimContext {
  const records = (input.sourceClaimCandidates ?? [])
    .filter((record) => record.brandId === packet.brand.brandId)
    .slice(0, 8)
    .map((record) => ({
      id: record.id,
      brandId: record.brandId,
      claim: record.claim,
      claimKind: record.claimKind,
      status: record.status,
      sourceLabel: record.sourceLabel,
      sourceOwner: record.sourceOwner,
      sourceDate: record.sourceDate,
      reviewedAt: record.reviewedAt,
      canonicalFactEnabled: record.canonicalFactEnabled,
      runtimeAutoConsumption: record.runtimeAutoConsumption
    }));

  return {
    records,
    canonicalFactEnabled: false,
    runtimeAutoConsumption: false,
    caveats: [
      records.length
        ? `${records.length} local source claim candidate${records.length === 1 ? '' : 's'} exist for this brand.`
        : 'No local source claim candidates were loaded for this brand.',
      'Extracted source claims are not canonical source facts.',
      'The agent runtime does not automatically consume extracted source claims as evidence.'
    ]
  };
}

function primaryFacts(packet: BrandIntelligencePacket, acceptedMemory: AgentAcceptedMemoryContext[] = []): string[] {
  const demandPower = packet.metrics['Demand Power'];
  const perceivedValue = packet.metrics['Pricing Power'];
  const facts = [
    `${packet.brand.brandName} is read as ${packet.diagnosisResult.primary.diagnosis.name}.`,
    `Demand Power is ${demandPower?.displayValue ?? demandPower?.value ?? 'missing'} with ${demandPower?.ahead ?? 'Unknown'} size-check status and ${demandPower?.momentum ?? 'Unknown'} momentum.`,
    `Perceived Value is ${perceivedValue?.displayValue ?? perceivedValue?.value ?? 'missing'} with ${perceivedValue?.ahead ?? 'Unknown'} size-check status and ${perceivedValue?.momentum ?? 'Unknown'} momentum.`,
    `Growth Navigator evidence mode is ${packet.dataCoverage.growthNavigatorEvidenceMode.replaceAll('_', ' ')}.`,
    `Brand Strategic Context is ${packet.strategicContext.status}.`,
    `Brand Strategic Context readiness is ${packet.strategicContextReadiness.status.replaceAll('_', ' ')} via ${packet.strategicContextReadiness.sourcePath.replaceAll('_', ' ')}.`,
    `Runtime Brand Strategic Context source file drop is ${packet.strategicContextRuntimeSourceFileDropReadiness.status}, with runtime consumption ${packet.strategicContextRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} and canonical use ${packet.strategicContextRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'enabled' : 'disabled'}.`,
    `Momentum trend context is ${packet.momentumTrendContext.status} with ${packet.momentumTrendContext.sourcePeriodLabel} source-period compatibility.`,
    `Momentum source readiness is ${packet.momentumSourceReadiness.status.replaceAll('_', ' ')} via ${packet.momentumSourceReadiness.sourcePath.replaceAll('_', ' ')}.`,
    `Runtime Momentum source file drop is ${packet.momentumRuntimeSourceFileDropReadiness.status}, with runtime consumption ${packet.momentumRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} and canonical use ${packet.momentumRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'enabled' : 'disabled'}.`,
    packet.marketContext ? `Market context loaded: ${packet.marketContext.market}, ${packet.marketContext.period}.` : 'Market context is missing.',
    packet.peerSet ? `Peer-set context loaded: ${packet.peerSet.label} (${packet.peerSet.peerCount} peers).` : 'Peer-set context is missing.'
  ];
  if (acceptedMemory.length) {
    facts.push(`Accepted session memory loaded: ${acceptedMemory.map((record) => record.label).join(' · ')}.`);
  }
  return facts;
}

function guardrailsFor(packet: BrandIntelligencePacket) {
  return [
    ...packet.agentGuardrails,
    ...packet.activeLens.notValidFor.map((item) => `Category lens not valid for: ${item}.`)
  ];
}

function baseAnswer(
  packet: BrandIntelligencePacket,
  skillId: string,
  intent: string,
  acceptedMemory: AgentAcceptedMemoryContext[] = []
): GroundedAgentAnswer {
  const skill = findAgentSkill(skillId) ?? findAgentSkill(DEFAULT_SKILL_ID);
  return {
    skillId,
    skillName: skill?.name ?? skillId,
    intent,
    headline: `${packet.brand.brandName}: ${packet.diagnosisResult.primary.diagnosis.name}`,
    answer: `${packet.diagnosisResult.primary.diagnosis.doctorRead} The strongest next move is to inspect the evidence and gaps before treating this as a final decision.`,
    facts: primaryFacts(packet, acceptedMemory),
    interpretation: [
      packet.diagnosisTrace.primaryRule.evidenceSummary,
      `${packet.evidenceReadiness.label} evidence readiness: ${packet.evidenceReadiness.evidenceStrength}.`,
      packet.roomToGrow.read,
      ...packet.momentumQualityChecks
        .filter((check) => check.status !== 'pass')
        .slice(0, 3)
        .map((check) => `${check.label}: ${check.detail}`),
      ...packet.momentumSourceReadiness.checks
        .filter((check) => check.status !== 'source_ready')
        .slice(0, 2)
        .map((check) => `${check.label}: ${check.detail}`),
      ...packet.strategicContextReadiness.checks
        .filter((check) => check.status !== 'source_ready')
        .slice(0, 2)
        .map((check) => `${check.label}: ${check.detail}`),
      ...acceptedMemory.slice(0, 3).map((record) => `Reviewed session memory: ${record.label}. ${record.detail}`)
    ],
    caveats: [
      ...packet.diagnosisResult.primary.diagnosis.whatNotToConclude.slice(0, 3),
      ...packet.roomToGrow.caveats,
      ...packet.momentumTrendContext.caveats,
      ...packet.momentumSourceReadiness.caveats,
      ...packet.strategicContextReadiness.caveats,
      acceptedMemory.length ? 'Accepted session memory is reviewed working context, not a replacement for source data or evidence.' : ''
    ].filter(Boolean),
    evidence: evidenceReferences(packet),
    missingEvidence: packet.evidenceGaps,
    dynamicViewRequests: approvedViewRequests(packet, skillId),
    guardrailsApplied: guardrailsFor(packet)
  };
}

function learningAnswer(packet: BrandIntelligencePacket, skillId: 'teach_brand_growth_concept' | 'test_understanding', intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, skillId, intent, acceptedMemory);
  const demandPower = packet.metrics['Demand Power'];
  const meaningful = packet.metrics.Meaningful;
  const different = packet.metrics.Different;
  return {
    ...answer,
    headline: `${packet.brand.brandName} learning path`,
    answer: `I can turn this into a guided learning path using the approved Brand Doctor education pages, the active ${packet.brand.brandName} signal read, and short diagnostics that test whether the user is reading BBE signals without overclaiming.`,
    facts: [
      `${packet.brand.brandName} is the active brand example in this learning workspace.`,
      `Demand Power is ${demandPower?.displayValue ?? demandPower?.value ?? 'missing'} with ${demandPower?.ahead ?? 'Unknown'} size-check status and ${demandPower?.momentum ?? 'Unknown'} momentum.`,
      `Meaningful is ${meaningful?.displayValue ?? meaningful?.value ?? 'missing'} with ${meaningful?.momentum ?? 'Unknown'} momentum; Different is ${different?.displayValue ?? different?.value ?? 'missing'} with ${different?.ahead ?? 'Unknown'} size-check status.`,
      `Momentum trend context is ${packet.momentumTrendContext.status} with ${packet.momentumTrendContext.sourcePeriodLabel} source-period compatibility.`,
      `Momentum source readiness is ${packet.momentumSourceReadiness.status.replaceAll('_', ' ')} via ${packet.momentumSourceReadiness.sourcePath.replaceAll('_', ' ')}.`,
      'Approved learning content is loaded from the Learn hub, module pages, case walkthroughs, practice scenarios, and quiz diagnostics.'
    ],
    interpretation: [
      'Start with the Learn hub to build shared BBE language before debating treatment paths.',
      `Use the ${packet.brand.brandName} case as the applied example only where packet evidence exists.`,
      'Use quiz and practice diagnostics to catch common misreads: current strength versus momentum, Pricing Power versus SKU price, and weak Different versus distinctive-asset proof.',
      'Keep the active brand KPI strip beside the education content so learning stays grounded in the same evidence as the assistant conversation.'
    ],
    caveats: [
      'Learning examples teach interpretation; they are not new measured facts or official training certification.',
      'Do not score users on unsupported or ambiguous facts.',
      'Teaching examples must separate measured brand evidence from conceptual coaching.',
      ...packet.agentGuardrails.slice(0, 3)
    ],
    dynamicViewRequests: [
      viewRequest('learning_explainer', packet, 'Open approved education pages, module links, and the active brand case walkthrough.'),
      viewRequest('quiz_card', packet, 'Show practice diagnostics and quiz checks for signal-reading fluency.'),
      viewRequest('kpi_strip', packet, `Keep ${packet.brand.brandName} evidence visible as the applied example.`)
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Learning workspaces cannot create official certification, unsupported scores, or new source claims.'
    ]
  };
}

function momentumAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): BbeMomentumIntelligenceRead {
  const redSignals = packet.momentumIntelligence.redSignals.length
    ? packet.momentumIntelligence.redSignals
    : ['No visible red BBE momentum signal in the current packet.'];
  const answer = baseAnswer(packet, 'bbe_momentum_intelligence_read', intent, acceptedMemory);
  const readinessRequested = asksForSourceReadiness(normalizedQuestion(intent));
  const readiness = packet.momentumSourceReadiness;
  const strategicReadiness = packet.strategicContextReadiness;
  const runtimeFileDrop = packet.momentumRuntimeSourceFileDropReadiness;
  const strategicRuntimeFileDrop = packet.strategicContextRuntimeSourceFileDropReadiness;
  const readinessBlockers = readiness.blockers.length
    ? readiness.blockers.slice(0, 3).join(' ')
    : 'No source-readiness blockers are visible in the current packet.';
  const strategicReadinessBlockers = strategicReadiness.blockers.length
    ? strategicReadiness.blockers.slice(0, 3).join(' ')
    : 'No Brand Strategic Context readiness blockers are visible in the current packet.';
  const runtimeFileDropRead = `Runtime file drop is ${runtimeFileDrop.status.replaceAll('_', ' ')} at ${runtimeFileDrop.expectedSourceDirectory}; runtime consumption is ${runtimeFileDrop.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} and canonical use is ${runtimeFileDrop.canonicalUseEnabled ? 'enabled' : 'disabled'}. Brand Strategic Context file drop is ${strategicRuntimeFileDrop.status.replaceAll('_', ' ')} at ${strategicRuntimeFileDrop.expectedSourceDirectory}; runtime consumption is ${strategicRuntimeFileDrop.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} and canonical use is ${strategicRuntimeFileDrop.canonicalUseEnabled ? 'enabled' : 'disabled'}.`;
  return {
    ...answer,
    headline: readinessRequested
      ? `${packet.brand.brandName} source readiness: ${readiness.status.replaceAll('_', ' ')}`
      : packet.momentumIntelligence.headline,
    answer: [
      readinessRequested
        ? `Momentum source readiness is ${readiness.status.replaceAll('_', ' ')} via ${readiness.sourcePath.replaceAll('_', ' ')}. ${readinessBlockers} Brand Strategic Context readiness is ${strategicReadiness.status.replaceAll('_', ' ')} via ${strategicReadiness.sourcePath.replaceAll('_', ' ')}. ${strategicReadinessBlockers} ${runtimeFileDropRead}`
        : packet.momentumIntelligence.headline,
      `Demand Power momentum is ${packet.momentumIntelligence.demandPowerMomentum}; Perceived Value momentum is ${packet.momentumIntelligence.perceivedValueMomentum}.`,
      `Room to grow is ${packet.roomToGrow.status}: ${packet.roomToGrow.read}`,
      'Use this as a QBR/BGS provocation, not as a final action order.'
    ].join(' '),
    interpretation: [
      ...(readinessRequested ? readiness.checks.map((check) => `${check.label}: ${check.detail}`) : []),
      ...(readinessRequested ? strategicReadiness.checks.map((check) => `${check.label}: ${check.detail}`) : []),
      ...(readinessRequested ? [
        `Runtime file-drop required files: ${runtimeFileDrop.requiredFileKinds.map((fileKind) => fileKind.replaceAll('_', ' ')).join(', ')}.`,
        `Runtime file-drop blocker: ${runtimeFileDrop.blockers[0] ?? runtimeFileDrop.nextAction}`,
        `Brand Strategic Context file-drop required files: ${strategicRuntimeFileDrop.requiredFileKinds.map((fileKind) => fileKind.replaceAll('_', ' ')).join(', ')}.`,
        `Brand Strategic Context file-drop blocker: ${strategicRuntimeFileDrop.blockers[0] ?? strategicRuntimeFileDrop.nextAction}`
      ] : []),
      ...redSignals,
      `SMD momentum: Salient ${packet.momentumIntelligence.smdMomentum.salient}, Meaningful ${packet.momentumIntelligence.smdMomentum.meaningful}, Different ${packet.momentumIntelligence.smdMomentum.different}.`,
      `Multi-quarter trend context is ${packet.momentumTrendContext.status}; ${packet.momentumTrendContext.metricReads.slice(0, 3).map((read) => read.read).join(' ')}`,
      packet.roomToGrow.read
    ],
    caveats: [
      ...(readinessRequested ? readiness.caveats : []),
      ...(readinessRequested ? strategicReadiness.caveats : []),
      ...(readinessRequested ? runtimeFileDrop.caveats : []),
      ...(readinessRequested ? strategicRuntimeFileDrop.caveats : []),
      ...packet.momentumIntelligence.caveats,
      ...packet.roomToGrow.caveats,
      'Ahead/Behind is a size-check only, not room-to-grow or momentum.'
    ],
    dynamicViewRequests: [
      ...(readinessRequested ? [viewRequest('source_readiness_panel', packet, 'Show source-owner readiness checks before executive use.')] : []),
      ...(readinessRequested ? [viewRequest('source_runtime_ingestion_panel', packet, 'Show runtime file-drop coverage and disabled default source-path wiring.')] : []),
      viewRequest('momentum_ladder', packet, 'Show the current BBE momentum read, including red signals.'),
      viewRequest('momentum_room_to_grow_grid', packet, 'Cross momentum with governed room-to-grow context when available.'),
      viewRequest('smd_driver_map', packet, 'Explain S/M/D driver movement behind the outcome read.'),
      viewRequest('evidence_ledger', packet, 'Keep proof visible behind the momentum story.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show claim-level proof and missing-evidence status behind the momentum story.'),
      viewRequest('growth_provocation_list', packet, 'Turn the read into testable QBR provocations.'),
      ...(packet.evidenceGaps.length ? [viewRequest('data_gap_panel', packet, 'Show missing source inputs before action.')] : [])
    ].slice(0, readinessRequested ? 7 : 6),
    momentumRead: packet.momentumIntelligence,
    roomToGrowRead: packet.roomToGrow,
    provocations: packet.starterProvocations
  };
}

function diagnosisAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'explain_diagnosis_evidence', intent, acceptedMemory);
  return {
    ...answer,
    answer: `${packet.diagnosisResult.primary.diagnosis.name} fired from deterministic rule ${packet.diagnosisTrace.primaryRule.ruleId}. ${packet.diagnosisTrace.primaryRule.evidenceSummary}`,
    dynamicViewRequests: [
      viewRequest('data_basis_inspector', packet, 'Show the active metrics, source posture, peer basis, proof labels, and missing inputs behind the request.'),
      viewRequest('diagnosis_trace_summary', packet, 'Show the deterministic rule and matched conditions.'),
      viewRequest('evidence_ledger', packet, 'Expose supporting, missing, and counter evidence.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show which answer claims are supported, missing evidence, guardrails, or reviewed context.'),
      viewRequest('data_gap_panel', packet, 'Name the evidence gaps before action.')
    ]
  };
}

function provocationAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'create_growth_provocations', intent, acceptedMemory);
  const primary = packet.starterProvocations[0];
  const treatment = packet.treatmentOptions[0];
  return {
    ...answer,
    headline: primary?.title ?? answer.headline,
    answer: treatment
      ? `${primary?.nowWhat ?? 'Start with the highest-fit treatment path to test.'} The first governed treatment path is ${treatment.name}, with fit score ${Math.round(treatment.score)}.`
      : 'The packet needs more evidence before a treatment path can be ranked confidently.',
    interpretation: [
      ...(primary ? [primary.what, primary.soWhat, primary.nowWhat] : []),
      ...packet.treatmentOptions.slice(0, 2).map((option) => `${option.name}: ${option.rankReasons.join(' ')}`)
    ],
    dynamicViewRequests: [
      viewRequest('growth_provocation_list', packet, 'Show what / so what / now what prompts.'),
      viewRequest('treatment_path_card', packet, 'Show the first treatment path to test.'),
      viewRequest('data_basis_inspector', packet, 'Show the data basis behind the treatment path and proof gaps.'),
      viewRequest('evidence_ledger', packet, 'Keep proof visible behind the recommendation.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show claim-level support and missing-evidence status behind the planning language.')
    ]
  };
}

function viewRecommendationAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'recommend_dynamic_view', intent, acceptedMemory);
  const viewNames = answer.dynamicViewRequests
    .map((request) => findDynamicView(request.viewId)?.name ?? request.viewId)
    .join(', ');
  return {
    ...answer,
    headline: `Approved views for ${packet.brand.brandName}`,
    answer: `Use these approved views for this question: ${viewNames}. Unknown or unsupported views should fail closed rather than inventing chart semantics.`
  };
}

function comparisonAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'compare_brands_or_competitors', intent, acceptedMemory);
  const similarBrands = packet.patternRadar.similarBrands.slice(0, 3);
  const peerBasis = packet.peerSet
    ? `${packet.peerSet.label} (${packet.peerSet.peerCount} peers): ${packet.peerSet.selectionBasis}`
    : 'No approved peer set is loaded; comparison falls back to associative Pattern Radar matches and explicit gaps.';
  const topSimilar = similarBrands.length
    ? similarBrands.map((match) => `${match.brandName} (${match.strength}, ${match.score})`).join('; ')
    : 'No similar brands are available in Pattern Radar.';

  return {
    ...answer,
    headline: `${packet.brand.brandName} comparison read`,
    answer: `Use approved peer and Pattern Radar context to compare ${packet.brand.brandName}; do not treat this as competitor causality, cannibalization, portfolio migration, or occasion substitution proof. ${peerBasis}`,
    facts: [
      ...answer.facts,
      `Pattern Radar comparison set: ${topSimilar}.`,
      packet.peerSet
        ? `Approved peer-set context loaded: ${peerBasis}.`
        : 'Approved peer-set context is missing; comparison should remain directional.'
    ],
    interpretation: [
      packet.patternRadar.topline.read,
      ...similarBrands.map((match) => `${match.brandName}: ${match.reasons.slice(0, 2).join(' ')} Key difference: ${match.keyDifference}`),
      ...packet.patternRadar.emergingPatterns.slice(0, 2).map((pattern) => `${pattern.name}: ${pattern.whyItMatters}`)
    ],
    caveats: [
      packet.patternRadar.topline.caveat,
      'Do not infer cannibalization, portfolio migration, or occasion substitution from peer comparison or pattern similarity without measured evidence.',
      packet.peerSet
        ? packet.peerSet.caveats.join(' ')
        : 'Without an approved peer set, comparison should be used to guide questions, not to make strategy claims.',
      ...answer.caveats,
      ...similarBrands.map((match) => match.caveat)
    ].filter(Boolean).slice(0, 10),
    dynamicViewRequests: [
      viewRequest('peer_comparison', packet, 'Compare the active brand with approved peer-set and Pattern Radar context.'),
      viewRequest('pattern_radar_brief', packet, 'Show associative pattern similarity and recurring portfolio signals.'),
      viewRequest('evidence_ledger', packet, 'Keep evidence and caveats visible behind comparison claims.'),
      ...(packet.evidenceGaps.length ? [viewRequest('data_gap_panel', packet, 'Show missing comparison inputs before action.')] : [])
    ]
  };
}

function meetingTakeawayAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'facilitate_live_meeting', intent, acceptedMemory);
  const provocation = packet.starterProvocations[0];
  const treatment = packet.treatmentOptions[0];
  const nextProof = packet.evidenceGaps[0]?.bestNextSource
    ?? packet.treatmentOptions[0]?.followUpSignals[0]
    ?? 'Review the next BBE wave and named follow-up signals before finalizing the takeaway.';

  return {
    ...answer,
    headline: `${packet.brand.brandName} meeting takeaway draft`,
    answer: [
      `Draft takeaway for review: ${packet.brand.brandName} is currently read as ${packet.diagnosisResult.primary.diagnosis.name}.`,
      provocation ? `Provisional discussion point: ${provocation.title}.` : '',
      treatment ? `Path to consider testing: ${treatment.name}.` : '',
      `Next proof signal: ${nextProof}.`,
      'This is a captured working takeaway, not final meeting minutes or an approved decision.'
    ].filter(Boolean).join(' '),
    facts: [
      ...answer.facts,
      `Meeting capture is review-required under the ${findAgentSkill('facilitate_live_meeting')?.name ?? 'facilitate_live_meeting'} skill.`,
      `Next proof signal: ${nextProof}.`
    ],
    interpretation: [
      `Provisional decision read: ${packet.diagnosisResult.primary.diagnosis.name}.`,
      provocation ? `Open provocation: ${provocation.what} ${provocation.soWhat}` : 'No starter provocation is available in the packet.',
      treatment ? `Treatment path to discuss, not prescribe: ${treatment.name}.` : 'No treatment path is ranked for this packet.',
      `Unresolved gaps before final circulation: ${packet.evidenceGaps.slice(0, 3).map((gap) => gap.label).join(' · ') || 'none surfaced in the packet.'}`
    ],
    caveats: [
      'Separate captured decisions from AI suggestions.',
      'Meeting takeaways require human review before final circulation.',
      'Do not treat this draft as approved meeting minutes, an approved prescription, or a final management command.',
      ...answer.caveats
    ].slice(0, 10),
    dynamicViewRequests: [
      viewRequest('meeting_takeaway_panel', packet, 'Capture the provisional decision, evidence, gaps, and next proof signal for human review.'),
      viewRequest('evidence_ledger', packet, 'Keep evidence visible behind the captured takeaway.'),
      viewRequest('growth_provocation_list', packet, 'Keep open provocations visible as options to test.'),
      ...(packet.evidenceGaps.length ? [viewRequest('data_gap_panel', packet, 'Show unresolved gaps before final circulation.')] : [])
    ]
  };
}

function reviewSessionAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'review_session_state', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} review operations cockpit`,
    answer: 'This workspace inspects prototype-local review workflow state: suggested memory, generated artifacts, confirmation gates, audit context, and blocked capability gates. It does not create official approvals, enable export, write canonical source facts, or auto-consume reviewed-local source context.',
    facts: [
      ...answer.facts,
      'Review workflow state is computed from the local session ledger when persistence is active.',
      'The prototype reviewer label is human_review; enterprise identity and official approvals remain disabled.',
      'Memory audit continuity shows which suggestions, review gates, and accepted working-context records are covered by the audit trail.',
      'Audit trail continuity shows lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality records without enabling audit export or canonical writes.',
      'Review identity inspection shows prototype reviewer-label limits, blocked enterprise approval types, and required identity/access steps without creating official approvals.',
      'Blocked capability gates require governance or config changes, not local approval.'
    ],
    interpretation: [
      'Use the Review Workflow Panel to inspect pending, reviewed, and blocked state before accepting memory or approving prototype artifacts.',
      'Use Memory Audit to prove accepted memory is loaded as reviewed working context and that suggested memory stays review-gated.',
      'Use Audit Trail to inspect which runtime actions were logged and whether evidence, views, artifacts, memory, source governance, and runtime quality are covered.',
      'Use Review Identity to prove local review labels are not enterprise identity, role access, brand access control, or official approvals.',
      'Accepted memory can become future working context only after local human review; it is not source truth.',
      'Artifact review can mark prototype readiness, but export and circulation remain disabled by capability gates.',
      'Source candidates and extracted claims remain audit context until source-owner governance defines canonical promotion.'
    ],
    caveats: [
      'Local review decisions are prototype workflow state, not official enterprise approvals.',
      'Enterprise reviewer identity, role-based access, official approval, retention, and canonical promotion governance are not connected.',
      'Do not treat review queue approval as permission to export, circulate, or write canonical source facts.'
    ],
    dynamicViewRequests: [
      viewRequest('review_workflow_panel', packet, 'Show pending, reviewed, and blocked local review workflow state.'),
      viewRequest('memory_audit_panel', packet, 'Show memory continuity, review decisions, audit coverage, and disabled memory-write paths.'),
      viewRequest('audit_trail_panel', packet, 'Show runtime lifecycle, evidence, view, artifact, memory, source, and quality audit continuity.'),
      viewRequest('review_identity_panel', packet, 'Show prototype reviewer-label limits, blocked enterprise approval types, and required identity/access steps.'),
      viewRequest('evidence_ledger', packet, 'Keep brand evidence visible while reviewing memory or artifacts.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show claim-level proof, guardrails, and reviewed-context separation before accepting review state.'),
      viewRequest('data_gap_panel', packet, 'Show source and evidence gaps before accepting review state.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Review workflow is prototype-local and cannot bypass evidence, source, or capability gates.'
    ]
  };
}

function pilotLearningAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_pilot_learning', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} pilot learning cockpit`,
    answer: 'This workspace inspects what the governed runtime can learn from the active session as review-required signals, blocked learning paths, and next proof needs. It does not create autonomous learning, treatment outcome claims, canonical memory, source truth, or enterprise learning records.',
    facts: [
      ...answer.facts,
      'Pilot learning is reviewed-signal state, not autonomous memory.',
      'Outcome learning, canonical memory writes, canonical source writes, and treatment outcome claims remain disabled.',
      'Learning signals need human review and stronger proof before they can influence future operating rules or outcome learning.'
    ],
    interpretation: [
      'Use the Pilot Learning Panel to inspect what the session is generating as possible learning inputs.',
      'Use blocked learning paths to see what governance, source, or outcome evidence is still required.',
      'Use next proof needs to decide what evidence would make a learning signal more decision-ready.',
      'Review workflow state should stay visible so learning signals do not bypass memory, artifact, source, or approval gates.'
    ],
    caveats: [
      'Pilot learning summaries are prototype-local review surfaces, not enterprise learning stores.',
      'Do not treat signal frequency as treatment efficacy or causal proof.',
      'Do not promote learning signals into source truth, accepted pattern memory, or canonical data without governance.'
    ],
    dynamicViewRequests: [
      viewRequest('pilot_learning_panel', packet, 'Show reviewed-only pilot learning signals, blocked paths, and next proof needs.'),
      viewRequest('review_workflow_panel', packet, 'Keep review workflow state visible beside learning signals.'),
      viewRequest('evidence_ledger', packet, 'Keep brand evidence visible while reviewing what should be learned.'),
      viewRequest('data_gap_panel', packet, 'Show proof needs before learning signals become stronger evidence.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Pilot learning is reviewed-only and cannot enable autonomous learning, outcome claims, canonical writes, or source promotion.'
    ]
  };
}

function quietProactivityAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_quiet_proactivity', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} quiet proactivity cockpit`,
    answer: 'This workspace inspects review-required follow-up suggestions and held notices from the governed runtime. It does not schedule reminders, send notifications, start background checks, promote source data, or take autonomous action.',
    facts: [
      ...answer.facts,
      'Quiet proactivity mode is suggestions-only.',
      'Reminder creation, scheduled notifications, external sends, background runs, and autonomous actions remain disabled.',
      'Follow-up suggestions require human review before they can become accepted memory, artifacts, source actions, or next-session intent.'
    ],
    interpretation: [
      'Use the Quiet Proactivity Panel to see what the runtime thinks should be revisited and why.',
      'Use held notices to see which actions were intentionally not taken because governance is not approved.',
      'Use review workflow state to decide whether any suggestion should be accepted, edited, dismissed, or left as a future prompt.',
      'Use evidence gaps to identify which source-owner or follow-up proof would make a suggestion more decision-ready.'
    ],
    caveats: [
      'Quiet proactivity is prototype-local suggestion state, not scheduled work.',
      'Do not treat a suggested follow-up as an approved reminder, task assignment, source update, or external communication.',
      'Reminder scheduling, privacy posture, no-overlap behavior, and notification governance must be approved before production proactivity can be enabled.'
    ],
    dynamicViewRequests: [
      viewRequest('proactivity_panel', packet, 'Show review-required follow-up suggestions and held notices without taking action.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates visible beside follow-up suggestions.'),
      viewRequest('evidence_ledger', packet, 'Keep brand evidence visible while reviewing follow-up intent.'),
      viewRequest('data_gap_panel', packet, 'Show evidence gaps that may be driving follow-up suggestions.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Quiet proactivity cannot create reminders, send notifications, start background runs, or promote source data.'
    ]
  };
}

function voiceReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_voice_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} voice readiness cockpit`,
    answer: 'This workspace inspects the governed voice foundation for Jarvis-style interaction. Push-to-talk can route through the governed stream with typed fallback, but Realtime voice, continuous listening, wake-word capture, and TTS remain gated until runtime parity, consent/privacy, interruption, provider, and enterprise storage requirements are cleared.',
    facts: [
      ...answer.facts,
      'Push-to-talk is the default consent boundary and typed input remains the reliable fallback.',
      'Voice turns must use /api/agent/stream, approved ExperiencePlan views, evidence spotlight, memory, audit, and confirmation gates.',
      'Provider adapter readiness is inspectable as a separate rail: text reasoning and SSE streaming are ready, browser speech-to-text is prototype-only, and Realtime/TTS remain gated or disabled.',
      'Realtime voice, continuous listening, wake-word capture, and TTS are not enabled in Agent Lab.'
    ],
    interpretation: [
      'Use the Voice Readiness Panel to inspect ready, prototype-ready, gated, and disabled voice requirements.',
      'Use the Provider Adapter Panel to separate ready text/SSE paths from prototype browser STT, gated Realtime, disabled TTS, and blocked provider bypass.',
      'Provider adapters must prove runtime, evidence, memory, audit, and gate parity before activation.',
      'Client stream abort preserves the last completed canvas, but server-side provider cancellation is still a blocker.',
      'Consent, privacy, TTS policy, and enterprise transcript/memory storage remain promotion blockers before full voice.'
    ],
    caveats: [
      'Voice readiness is an inspection surface, not provider activation.',
      'Browser speech recognition is prototype client-side convenience, not enterprise voice infrastructure.',
      'Do not enable continuous listening, Realtime voice, or TTS until the voice orchestration readiness checklist has no blocked requirements.'
    ],
    dynamicViewRequests: [
      viewRequest('voice_readiness_panel', packet, 'Show governed push-to-talk state, provider adapters, voice gates, and full-voice blockers.'),
      viewRequest('provider_adapter_panel', packet, 'Show text/SSE readiness, browser STT prototype state, Realtime gates, TTS disabled state, and provider-bypass blockers.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review and blocked capability state visible before voice promotion.'),
      viewRequest('data_gap_panel', packet, 'Show missing proof and governance before enabling full voice.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Voice readiness inspection cannot enable Realtime voice, continuous listening, wake-word capture, or TTS.'
    ]
  };
}

function persistenceReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_persistence_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} persistence readiness cockpit`,
    answer: 'This workspace inspects durable memory and audit readiness for the governed runtime. Browser-local ledger and local JSON prototype continuity are available, reviewed memory can load into future context, and source candidates stay non-canonical; enterprise database, identity/access, retention/privacy, backup/recovery, and canonical source-promotion requirements remain blocked.',
    facts: [
      ...answer.facts,
      'Browser-local ledger and local JSON persistence support prototype session continuity only.',
      'Accepted memory loads as active-brand working context after review; suggested memory does not auto-promote.',
      'Memory audit continuity remains read-only and preserves suggested, accepted, rejected, blocked, and audited memory state.',
      'Review identity remains prototype-label-only; enterprise identity, role access, brand access, and official approvals are blocked.',
      'Enterprise persistence, official approvals, canonical source writes, and runtime source auto-consumption remain disabled.'
    ],
    interpretation: [
      'Use the Persistence Readiness Panel to separate ready local rails from enterprise promotion blockers.',
      'Use review workflow state to confirm memory, artifacts, gates, source candidates, and source claims remain review-controlled.',
      'Use Memory Audit to confirm durable local continuity is review-gated before any enterprise memory store exists.',
      'Use Review Identity to inspect identity/access blockers before any local review is treated as enterprise approval.',
      'Treat local JSON as prototype continuity, not an enterprise database or approved source of truth.',
      'The next promotion step is enterprise schema, identity/access, retention/privacy, backup/recovery, and source-owner promotion governance.'
    ],
    caveats: [
      'Persistence readiness is inspection-only and does not create enterprise storage.',
      'Local/browser records are not official approvals, executive-use source truth, or canonical facts.',
      'Do not enable canonical writes or runtime source auto-consumption until governance explicitly approves the promotion workflow.'
    ],
    dynamicViewRequests: [
      viewRequest('persistence_readiness_panel', packet, 'Show local persistence readiness, accepted memory context, source candidate posture, and enterprise blockers.'),
      viewRequest('memory_audit_panel', packet, 'Show reviewed working context, memory audit coverage, and disabled memory-write promotion paths.'),
      viewRequest('review_identity_panel', packet, 'Show prototype reviewer-label limits and blocked enterprise identity/access approval requirements.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates visible beside durable memory and audit readiness.'),
      viewRequest('data_gap_panel', packet, 'Show missing governance and source-owner proof before enterprise persistence promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Persistence readiness cannot enable enterprise persistence, official approvals, canonical writes, or runtime source auto-consumption.'
    ]
  };
}

function sourcePromotionReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_source_promotion_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} source promotion readiness cockpit`,
    answer: 'This workspace inspects reviewed-local source promotion records and extracted source claims before any source candidate becomes canonical fact or runtime evidence. Source candidates can be visible as review context, but canonical writes, runtime auto-consumption, official approvals, and source-claim promotion remain disabled by governance.',
    facts: [
      ...answer.facts,
      'Reviewed-local source promotion records are not canonical source facts.',
      'Extracted or reviewed source claims are not runtime evidence.',
      'Runtime source ingestion remains gated until source-owner files, canonical-use governance, and source-write policy are approved.',
      'Canonical source writes, canonical claim writes, and runtime auto-consumption remain disabled until source-owner and enterprise governance approve promotion.'
    ],
    interpretation: [
      'Use the Source Promotion Readiness Panel to inspect source candidates, extracted claims, source-review gates, and disabled canonical/runtime states.',
      'Use Source Runtime Ingestion to see whether approved source-owner files are present before any default runtime source path is considered.',
      'Use the Review Workflow Panel to see whether local review gates exist without treating local approval as enterprise approval.',
      'Use Persistence Readiness to inspect the enterprise database, identity/access, retention/privacy, backup/recovery, and canonical source-promotion blockers.',
      'Use gaps to identify which source-owner approval, evidence, or governance steps are missing before promotion.'
    ],
    caveats: [
      'Source promotion readiness is inspection-only and cannot promote source candidates, extracted claims, or reviewed-local packets.',
      'Local human review is prototype workflow state, not canonical source-owner approval.',
      'Do not let source candidates influence diagnosis, treatment, QBR claims, or executive evidence until canonical promotion and runtime consumption are explicitly approved.'
    ],
    dynamicViewRequests: [
      viewRequest('source_promotion_readiness_panel', packet, 'Show reviewed-local source candidates, extracted claims, source-review gates, and disabled canonical/runtime states.'),
      viewRequest('source_runtime_ingestion_panel', packet, 'Show source-owner runtime file coverage and disabled default source-path wiring.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates visible without treating them as official approval.'),
      viewRequest('persistence_readiness_panel', packet, 'Show enterprise persistence and canonical source-promotion blockers.'),
      viewRequest('data_gap_panel', packet, 'Show missing source-owner, governance, and evidence inputs before promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Source promotion readiness inspection cannot promote source candidates, extracted claims, or reviewed-local packets into canonical facts or runtime evidence.'
    ]
  };
}

function treatmentOutcomeReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_treatment_outcome_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} treatment outcome readiness cockpit`,
    answer: 'This workspace inspects whether Brand Doctor is ready to capture treatment outcomes or learn from follow-up signals. Related treatment paths and follow-up signals are visible, but outcome-record schema, source linkage, review identity, efficacy rules, portfolio learning storage, and canonical learning governance remain blocked, so outcome learning and treatment efficacy claims stay disabled.',
    facts: [
      ...answer.facts,
      'Treatment paths remain options to consider or paths to test, not validated instructions.',
      'Follow-up signals are visible as proof needs; they are not causal treatment evidence.',
      'Outcome learning, treatment outcome claims, accepted outcome-record storage, and canonical learning writes remain disabled.'
    ],
    interpretation: [
      'Use the Treatment Outcome Readiness Panel to inspect which promotion requirements are blocked before any outcome learning can be trusted.',
      'Use pilot learning context to see reviewed-only session signals without converting them into accepted pattern memory or efficacy evidence.',
      'Use review workflow state to confirm prototype-local review is not official outcome approval.',
      'The next promotion step is an approved outcome-record schema plus source-owner, methodology, identity, storage, and canonical-learning governance.'
    ],
    caveats: [
      'Outcome readiness is inspection-only and does not create outcome records.',
      'Do not claim treatment efficacy, causality, or portfolio learning from a recommendation, follow-up signal, artifact draft, or one brand period.',
      'Pilot learning signals and follow-up signals remain review inputs until governed outcome evidence and methodology are approved.'
    ],
    dynamicViewRequests: [
      viewRequest('treatment_outcome_readiness_panel', packet, 'Show treatment outcome learning gates, follow-up signal linkage, efficacy blockers, and disabled outcome-learning states.'),
      viewRequest('pilot_learning_panel', packet, 'Keep reviewed-only pilot learning signals visible without promoting them to outcome evidence.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates visible beside outcome-readiness blockers.'),
      viewRequest('data_gap_panel', packet, 'Show missing schema, methodology, source, and governance proof before outcome learning promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Treatment outcome readiness cannot create outcome records, claim treatment efficacy, or write canonical learning.'
    ]
  };
}

function runtimeGovernanceAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_runtime_governance', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} runtime governance cockpit`,
    answer: 'This workspace inspects the governed runtime before any surface is promoted or risky capability is enabled. Governed JSON, streaming, Agent Lab, and explicit opt-in chat surfaces can use the shared runtime rails, while default scoped chat remains stable and Realtime voice, full voice, TTS, exports, source writes, and canonical promotion remain gated or disabled by runtime policy and capability flags.',
    facts: [
      ...answer.facts,
      'Runtime governance is inspection-only and cannot enable a disabled capability.',
      'Default scoped chat remains the stable fallback unless the user explicitly opts into governed runtime.',
      'Runtime quality checks are persisted in the session ledger so approved views, evidence, source, memory, voice, provider, artifact, and runtime-surface guardrails can be inspected across turns.',
      'Capability readiness is persisted in the session ledger so disabled exports, circulation, memory writes, source writes, source promotion, external ingest, continuous voice, and runtime bypass stay inspectable before promotion.',
      'Provider adapter readiness remains governed: text/SSE paths are ready, browser speech-to-text is prototype client-side input, Realtime remains gated, TTS is disabled, and provider bypass is blocked.',
      'Kill-switch and capability flags remain server-side governance rails that cannot bypass evidence, memory, source, artifact, or review gates.'
    ],
    interpretation: [
      'Use the Runtime Governance Panel to compare ready, opt-in, legacy, gated, and disabled surfaces.',
      'Use the Runtime Quality Panel to see pass/watch/blocked checks and human-review-required quality items before any surface promotion.',
      'Use the Capability Readiness Panel to inspect disabled risky capability flags, blocked gates, and admin override requirements.',
      'Use the Provider Adapter Panel to inspect provider-boundary readiness before any Realtime, TTS, or voice-provider promotion.',
      'Use provider gates to see why Realtime voice, full voice, and TTS cannot bypass the governed runtime.',
      'Use review workflow state to see blocked capability gates that require governance or config changes, not local approval.',
      'Promotion requires runtime parity, proof surfaces, policy review, capability enablement, and preserved evidence/memory/audit gates.'
    ],
    caveats: [
      'Ready surfaces are governed prototype surfaces, not production approvals.',
      'Runtime control is a prototype governance rail, not an enterprise operations console.',
      'Do not enable exports, source writes, continuous voice, TTS, or provider promotion from this workspace.'
    ],
    dynamicViewRequests: [
      viewRequest('runtime_governance_panel', packet, 'Show runtime surfaces, kill-switch posture, disabled capabilities, and promotion blockers.'),
      viewRequest('capability_readiness_panel', packet, 'Show disabled risky capability flags, blocked gates, admin override requirements, and hard-disabled promotion paths.'),
      viewRequest('runtime_quality_panel', packet, 'Show persisted runtime self-checks, consistency signals, and watch/blocked quality items.'),
      viewRequest('provider_adapter_panel', packet, 'Show provider adapter readiness and blocked provider-bypass paths beside runtime governance.'),
      viewRequest('voice_readiness_panel', packet, 'Keep provider adapter and voice orchestration gates visible beside runtime governance.'),
      viewRequest('review_workflow_panel', packet, 'Keep blocked capability gates and local review state visible.'),
      viewRequest('data_gap_panel', packet, 'Show missing policy, capability, provider, source, or review proof before surface promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Runtime governance inspection cannot enable disabled capabilities, alter kill-switch state, or promote gated runtime surfaces.'
    ]
  };
}

function foundationReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_foundation_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} foundation readiness cockpit`,
    answer: `This workspace inspects the Brand Growth Intelligence foundation as one governed control plane. It shows whether the core rails for approved ExperiencePlans, evidence grounding, reviewed memory, source governance, audit/quality, runtime control, surfaces, providers, voice readiness, persistence, artifacts, and outcome-learning readiness are ready, prototype-ready, gated, or waiting. It can prove what is fundable and scalable next, but it cannot enable enterprise persistence, official approvals, canonical writes, exports, full voice, autonomous learning, or arbitrary UI generation.`,
    facts: [
      ...answer.facts,
      `${experienceTemplateRegistry.length} approved ExperiencePlan templates, ${agentSkillRegistry.length} approved skills, and ${dynamicViewRegistry.length} approved views constrain workspace composition.`,
      'Foundation readiness is computed from the governed session ledger and per-turn manifests, not from an unconstrained LLM claim.',
      'Runtime quality is now an approved read-only view so the foundation can inspect whether governed turns passed or exposed watch/blocked self-checks.',
      'Evidence spotlight is now an approved read-only view so the foundation can inspect claim-level proof without promoting claims to canonical facts.',
      'Canvas continuity is now an approved read-only view so the foundation can inspect approved rendered views, fallbacks, focus, proof rails, and interaction continuity without arbitrary UI generation.',
      'Provider adapters are now an approved read-only view so the foundation can inspect text/SSE readiness, browser STT prototype input, Realtime/TTS blockers, and provider-bypass protection before full voice.',
      'Memory audit continuity is an approved read-only view so dynamic workspaces can inspect working context without accepting or promoting memory.',
      'Audit trail continuity is now an approved read-only view so the foundation can inspect runtime lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality coverage without exporting audit logs or writing canonical records.',
      'Review identity is now an approved read-only view so the foundation can inspect prototype reviewer-label limits, blocked enterprise identity/access, and official approval blockers.',
      'Capability readiness is now an approved read-only view so the foundation can inspect disabled risky capabilities, blocked gates, admin override requirements, and hard-disabled promotion paths.',
      'Source runtime ingestion is an approved read-only view so dynamic workspaces can inspect source-owner file coverage before any default runtime source-path promotion.',
      'Gated promotion paths stay visible: enterprise persistence, official approvals, canonical writes, exports/copy/circulation, Realtime/TTS/continuous voice, autonomous learning, and arbitrary UI generation.'
    ],
    interpretation: [
      'Use the Foundation Readiness Panel as the executive control plane for what is ready, prototype-ready, blocked by governance, or still waiting for governed turns.',
      'Use Experience Architecture to prove the agent can assemble role-specific workspaces from approved templates, skills, views, evidence needs, and review gates.',
      'Use Canvas Continuity to prove approved rendered views, fallbacks, focused views, proof rails, and push-to-talk presence persist without enabling arbitrary UI, private reasoning, or continuous voice.',
      'Use Runtime Governance to prove the same brain is shared across JSON, streaming, Agent Lab, opt-in chat, and Live Consult fallback without provider or capability bypass.',
      'Use Capability Readiness to prove risky actions remain disabled until governance and config gates are approved.',
      'Use Runtime Quality to prove the shared runtime is checking approved templates, rendered views, evidence attachments, source context, memory review, voice gates, provider gates, and runtime surfaces.',
      'Use Provider Adapters to inspect the substrate behind future voice/provider experiences before any Realtime or TTS activation.',
      'Use Evidence Spotlight to prove generated claims remain tied to packet evidence, missing evidence, guardrails, or reviewed working context.',
      'Use Source Runtime Ingestion to prove source-owner runtime files are still an ingestion gate, not canonical runtime evidence.',
      'Use Memory Audit to prove the future dynamic UI has governed memory and audit continuity before any autonomous or enterprise memory promotion.',
      'Use Audit Trail to prove runtime lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality actions are logged before any promotion decision.',
      'Use Review Identity to prove local review state is not official enterprise approval and cannot authenticate accountable reviewer authority.',
      'Use Review Workflow and Data Gaps to keep source, memory, artifact, persistence, voice, and learning promotion blockers explicit before funding or rollout decisions.'
    ],
    caveats: [
      'Foundation readiness is inspection-only and does not certify enterprise production readiness.',
      'Ready and prototype states are evidence for prioritization, not authorization to promote a capability.',
      'Do not treat this cockpit as permission to enable canonical writes, exports, full voice, autonomous learning, official approvals, or arbitrary UI generation.'
    ],
    dynamicViewRequests: [
      viewRequest('foundation_readiness_panel', packet, 'Show cross-rail foundation readiness, demo signal, gated promotion paths, and next foundation steps.'),
      viewRequest('promotion_gate_panel', packet, 'State the CMO-demo, pilot-review, and production-blocked verdict from persisted readiness summaries.'),
      viewRequest('experience_architecture_panel', packet, 'Show approved ExperiencePlan, skill, view, audience, objective, and arbitrary-UI guardrails.'),
      viewRequest('canvas_continuity_panel', packet, 'Show persisted approved rendered views, fallbacks, focus, proof rails, and interaction continuity.'),
      viewRequest('runtime_governance_panel', packet, 'Show runtime surfaces, kill-switch posture, provider gates, and disabled risky capabilities.'),
      viewRequest('capability_readiness_panel', packet, 'Show disabled risky capability flags, blocked gates, admin override requirements, and hard-disabled promotion paths.'),
      viewRequest('runtime_quality_panel', packet, 'Show persisted runtime self-checks and any watch/blocked quality items before promotion.'),
      viewRequest('provider_adapter_panel', packet, 'Show provider adapter readiness, Realtime/TTS blockers, and provider-bypass protection before promotion.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show claim-level proof, missing evidence, guardrails, and reviewed-context separation before promotion.'),
      viewRequest('source_runtime_ingestion_panel', packet, 'Show source-owner runtime file coverage and disabled default source-path wiring.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates and non-official approval state visible beside readiness.'),
      viewRequest('memory_audit_panel', packet, 'Show accepted working context, memory review decisions, and audit coverage beside foundation readiness.'),
      viewRequest('audit_trail_panel', packet, 'Show lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit continuity.'),
      viewRequest('review_identity_panel', packet, 'Show prototype reviewer-label limits, blocked official approval, and enterprise identity/access blockers.'),
      viewRequest('data_gap_panel', packet, 'Show missing governance, source, persistence, artifact, voice, or learning proof before promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Foundation readiness inspection cannot enable enterprise persistence, official approvals, canonical writes, exports, full voice, autonomous learning, or arbitrary UI generation.'
    ]
  };
}

function executivePilotAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'plan_executive_pilot', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} executive pilot runbook`,
    answer: 'This workspace packages the foundation into a read-only sponsor pilot: start with a live brand read, let the agent assemble the right approved workspace, prove the evidence and review rails, show the shared runtime and voice-ready command loop, then close with the specific governance and data asks required to fund the next build. It demonstrates the future Jarvis-style experience from today\'s governed foundation without enabling exports, official approvals, canonical writes, full voice, autonomous learning, or arbitrary UI generation.',
    facts: [
      ...answer.facts,
      `${experienceTemplateRegistry.length} approved ExperiencePlan templates, ${agentSkillRegistry.length} approved skills, and ${dynamicViewRegistry.length} approved views are available for governed workspace composition.`,
      'The pilot runbook uses approved dynamic views only and fails closed to visible data gaps when source inputs are missing.',
      'The runtime remains governed by evidence, review, audit, capability, voice, persistence, and source rails before any promotion decision.',
      'Runtime quality self-checks remain visible so sponsors can see whether the pilot turn honored approved-template, evidence, source, memory, provider, voice, and runtime-surface guardrails.',
      'Evidence spotlight stays visible so sponsors can see generated claim support, missing evidence, guardrails, and reviewed context before funding asks.',
      'Canvas continuity stays visible so sponsors can see the dynamic canvas preserving approved view state, focus, proof rails, and push-to-talk presence without arbitrary UI or continuous voice.',
      'Audit trail stays visible so sponsors can see lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality coverage without audit export or canonical writes.',
      'Review identity stays visible so sponsors can see local reviewer labels are not official enterprise approval or accountable identity.',
      'Capability readiness stays visible so sponsors can see export, circulation, memory-write, source-write, source-promotion, external-ingest, continuous-voice, and runtime-bypass flags remain disabled until governance clears.',
      'Provider adapter readiness stays visible so sponsors can distinguish ready text/SSE runtime paths from prototype browser STT, gated Realtime, disabled TTS, and blocked provider bypass.',
      'Source runtime ingestion stays blocked until approved source-owner files and canonical-use governance clear.'
    ],
    interpretation: [
      'Pilot moment 1: open with the active brand momentum read so the sponsor sees a real business problem, not a platform tour.',
      'Pilot moment 2: show the workspace assembling from an ExperiencePlan so role-specific UI feels dynamic while staying registered and testable.',
      'Pilot moment 3: show canvas continuity so the sponsor can see approved views, fallback behavior, focus, and proof rails persist across the interaction.',
      'Pilot moment 4: expose claim proof, review, source, memory, and audit state so trust is visible behind the answer.',
      'Pilot moment 5: show the audit trail and review identity so logged actions and local reviewer labels are visibly separate from enterprise approvals.',
      'Pilot moment 6: show runtime quality, capability readiness, provider adapters, source-ingestion, and push-to-talk/streaming readiness as paths toward scale, with canonical source use, Realtime, TTS, export, and continuous listening still gated.',
      'Pilot moment 7: close with fundable next steps: approved sources, enterprise persistence/identity, artifact language approval, voice governance, and outcome-learning design.'
    ],
    caveats: [
      'This runbook is a prototype workspace, not a circulated deck or official funding memo.',
      'Foundation readiness supports prioritization; it does not certify enterprise production readiness.',
      'Do not treat the pilot as approval to enable export, copy, official approvals, canonical writes, full voice, autonomous learning, or arbitrary UI generation.'
    ],
    dynamicViewRequests: [
      viewRequest('executive_pilot_runbook_panel', packet, 'Show the sponsor pilot sequence, proof moments, gating path, and funding asks.'),
      viewRequest('momentum_ladder', packet, 'Open the demo with a live brand momentum read.'),
      viewRequest('momentum_room_to_grow_grid', packet, 'Show opportunity context when room-to-grow source inputs support it.'),
      viewRequest('foundation_readiness_panel', packet, 'Prove foundation readiness and gated promotion paths.'),
      viewRequest('promotion_gate_panel', packet, 'State what is ready for CMO demo, what needs pilot review, and what remains production-blocked.'),
      viewRequest('canvas_continuity_panel', packet, 'Prove approved rendered views, fallbacks, focus, proof rails, and interaction continuity across the pilot canvas.'),
      viewRequest('source_runtime_ingestion_panel', packet, 'Show source-owner runtime file coverage and disabled canonical/runtime consumption before sponsor asks.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show supported, missing, guardrail, and reviewed-context claims before sponsor funding asks.'),
      viewRequest('runtime_governance_panel', packet, 'Show governed runtime surfaces, provider gates, and disabled risky capabilities.'),
      viewRequest('capability_readiness_panel', packet, 'Show disabled risky capabilities, blocked gates, admin overrides, and hard-disabled promotion paths before sponsor asks.'),
      viewRequest('runtime_quality_panel', packet, 'Show persisted runtime self-checks proving the pilot stayed inside governed guardrails.'),
      viewRequest('provider_adapter_panel', packet, 'Show ready text/SSE adapters, prototype browser STT, gated Realtime, disabled TTS, and provider-bypass blockers before sponsor asks.'),
      viewRequest('review_workflow_panel', packet, 'Keep human review and blocked capability gates visible.'),
      viewRequest('memory_audit_panel', packet, 'Show accepted working context, memory review decisions, and audit continuity before sponsor asks.'),
      viewRequest('audit_trail_panel', packet, 'Show lifecycle, evidence, view, artifact, memory, source-governance, and runtime-quality audit coverage before sponsor asks.'),
      viewRequest('review_identity_panel', packet, 'Show prototype reviewer-label limits and blocked enterprise approval identity before sponsor asks.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Executive pilot planning cannot export, circulate, approve, write canonical data, activate full voice, learn autonomously, or generate arbitrary UI.'
    ]
  };
}

function artifactReadinessAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_artifact_readiness', intent, acceptedMemory);
  return {
    ...answer,
    headline: `${packet.brand.brandName} artifact readiness cockpit`,
    answer: 'This workspace inspects whether generated artifacts are ready for prototype review, circulation, or export. It shows reviewer roles, required evidence, source-view coverage, language approvals, circulation blockers, and export gates while keeping export, copy, external circulation, and official approval disabled.',
    facts: [
      ...answer.facts,
      'Generated artifacts are draft support for human decision-making, not final deliverables.',
      'Artifact review can mark prototype readiness, but it does not enable export or external circulation.',
      'The artifact_export and artifact_circulation capabilities remain disabled until stakeholder language, artifact shape, and governance gates are approved.'
    ],
    interpretation: [
      'Use the Artifact Readiness Panel to inspect every planned or generated artifact in the active ExperiencePlan.',
      'Use required evidence, source views, and language approvals to decide what needs human review before a draft can be trusted.',
      'Use the Review Workflow Panel to confirm local review state and blocked capability gates.',
      'Use Evidence and Data Gap views to keep unresolved proof needs visible before any artifact is shared.'
    ],
    caveats: [
      'Artifact readiness is inspection-only and cannot enable export, copy, circulation, or official approval.',
      'Local prototype review is not enterprise approval or permission to distribute externally.',
      'Do not circulate QBR, meeting, agency, evidence, learning, or decision artifacts until required reviewers approve language and evidence.'
    ],
    dynamicViewRequests: [
      viewRequest('artifact_readiness_panel', packet, 'Show generated artifact readiness, reviewer roles, evidence/source-view coverage, language approvals, and export blockers.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review and blocked capability gates visible beside artifact readiness.'),
      viewRequest('evidence_ledger', packet, 'Keep source evidence visible before trusting or sharing an artifact draft.'),
      viewRequest('data_gap_panel', packet, 'Show missing evidence, source, language, or governance proof before circulation.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Artifact readiness inspection cannot enable export, copy, circulation, or official approval.'
    ]
  };
}

function experienceArchitectureAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const answer = baseAnswer(packet, 'inspect_experience_architecture', intent, acceptedMemory);
  const audiences = Array.from(new Set(experienceTemplateRegistry.map((template) => template.audience)));
  const objectives = Array.from(new Set(experienceTemplateRegistry.map((template) => template.objective)));
  return {
    ...answer,
    headline: `${packet.brand.brandName} experience architecture cockpit`,
    answer: `This workspace inspects the governed foundation for building role-specific Brand Doctor workspaces. The system can compose ${experienceTemplateRegistry.length} approved ExperiencePlan templates across ${audiences.length} audiences, ${objectives.length} objectives, ${agentSkillRegistry.length} skills, and ${dynamicViewRegistry.length} dynamic views, but it still cannot generate arbitrary UI, invent metrics, or bypass evidence, review, source, artifact, runtime, or voice gates.`,
    facts: [
      ...answer.facts,
      `${experienceTemplateRegistry.length} approved ExperiencePlan templates are available for governed workspace composition.`,
      `${dynamicViewRegistry.length} approved dynamic views and ${agentSkillRegistry.length} approved skills constrain what the agent can render and claim.`,
      'Runtime quality checks provide a persisted self-test layer for approved templates, rendered views, evidence, source context, memory review, voice gates, provider gates, and runtime surfaces.',
      'Canvas continuity provides a persisted inspection layer for approved rendered views, fallback views, focus, proof rails, presence signals, and interruption recovery.',
      'Dynamic UI generation remains disabled; approved ExperiencePlans choose registered views and fail closed to data-gap or review-required states.'
    ],
    interpretation: [
      'Use the Experience Architecture Panel to see audience/objective coverage and which templates can serve executives, marketers, insights leads, learners, agencies, and specialists.',
      'Use the Canvas Continuity Panel to confirm the dynamic canvas preserves approved view state and interaction context without arbitrary UI generation.',
      'Use the Runtime Governance Panel to confirm which surfaces can render governed plans and which voice/export/source capabilities remain gated.',
      'Use the Runtime Quality Panel to confirm recent governed turns are passing the checks that make dynamic workspaces trustworthy.',
      'Use Review Workflow state to keep generated artifacts, memory, source candidates, and confirmation gates review-controlled.',
      'The next foundation step is not arbitrary UI generation; it is deeper template coverage, stronger evidence contracts, and promotion governance for sources, persistence, artifacts, and full voice.'
    ],
    caveats: [
      'Experience architecture inspection is not permission to generate arbitrary UI or unsupported charts.',
      'A role-specific workspace is trustworthy only when it uses approved skills, approved views, visible evidence needs, and required human-review gates.',
      'Unsupported audiences, objectives, artifacts, metrics, or missing evidence must route to a gap or review state rather than a polished but unsupported surface.'
    ],
    dynamicViewRequests: [
      viewRequest('experience_architecture_panel', packet, 'Show approved template, skill, view, audience, objective, and composition coverage.'),
      viewRequest('canvas_continuity_panel', packet, 'Show approved rendered views, fallback views, focus, proof rails, presence, and interruption continuity.'),
      viewRequest('runtime_governance_panel', packet, 'Show which runtime surfaces can render governed ExperiencePlans and which remain gated.'),
      viewRequest('runtime_quality_panel', packet, 'Show persisted runtime self-checks behind approved workspace composition.'),
      viewRequest('review_workflow_panel', packet, 'Keep local review gates visible beside workspace-composition readiness.'),
      viewRequest('data_gap_panel', packet, 'Show missing evidence, source, governance, or template coverage before workspace promotion.')
    ],
    guardrailsApplied: [
      ...answer.guardrailsApplied,
      'Experience architecture inspection cannot generate arbitrary UI, unregistered views, unsupported metrics, or new source claims.'
    ]
  };
}

export function createDecisionPackageDraft(packet: BrandIntelligencePacket, sourceAnswer?: GroundedAgentAnswer | BbeMomentumIntelligenceRead): DecisionPackageDraft {
  const treatment = packet.treatmentOptions[0];
  const provocation = packet.starterProvocations[0];
  const evidence = evidenceReferences(packet, 6);
  const requiredHumanReview = [
    'Confirm Brand Strategic Context before using brand intent, objectives, positioning, creative platform, or approved claims.',
    packet.roomToGrow.status === 'missing'
      ? 'Review missing room-to-grow inputs before sizing upside or investment urgency.'
      : 'Review room-to-grow source status before using it to size upside or investment urgency.',
    'Confirm whether Growth Navigator evidence is measured, partial, synthetic, or missing before using commercial support-lens claims.',
    'Human brand and insights leads decide whether to adopt, revise, or reject the treatment path.'
  ];

  return {
    skillId: 'draft_meeting_story',
    brandName: packet.brand.brandName,
    title: `${packet.brand.brandName} QBR Decision Story Draft`,
    narrative: [
      `${packet.brand.brandName} is currently read as ${packet.diagnosisResult.primary.diagnosis.name}.`,
      packet.momentumIntelligence.headline,
      provocation ? `The executive provocation is: ${provocation.title}. ${provocation.soWhat}` : '',
      treatment ? `The first treatment path to consider testing is ${treatment.name}, supported by ${treatment.rankReasons.slice(0, 2).join(' ')}` : '',
      'This is a draft for human review, with evidence gaps kept visible.'
    ].filter(Boolean).join(' '),
    slideOutline: [
      `1. Headline read: ${packet.diagnosisResult.primary.diagnosis.name}`,
      `2. BBE bloodwork: Demand Power, Salient, Meaningful, Different, Perceived Value`,
      `3. Why we believe it: ${packet.diagnosisTrace.primaryRule.ruleId} evidence trace`,
      `4. What complicates action: ${packet.evidenceGaps.slice(0, 2).map((gap) => gap.label).join(' + ')}`,
      `5. Path to test: ${treatment?.name ?? 'Select treatment after evidence review'}`,
      '6. Follow-up proof: monitor intended metric movement and named caveats'
    ],
    requiredHumanReview,
    evidence,
    caveats: [
      ...packet.agentGuardrails,
      ...packet.roomToGrow.caveats,
      ...packet.diagnosisResult.primary.diagnosis.whatNotToConclude,
      ...(sourceAnswer?.caveats ?? [])
    ].slice(0, 10)
  };
}

function draftStoryAnswer(packet: BrandIntelligencePacket, intent: string, acceptedMemory: AgentAcceptedMemoryContext[]): GroundedAgentAnswer {
  const draft = createDecisionPackageDraft(packet);
  const answer = baseAnswer(packet, 'draft_meeting_story', intent, acceptedMemory);
  return {
    ...answer,
    headline: draft.title,
    answer: draft.narrative,
    interpretation: draft.slideOutline,
    caveats: draft.requiredHumanReview,
    dynamicViewRequests: [
      viewRequest('qbr_story_draft', packet, 'Render the draft QBR story for human review.'),
      viewRequest('growth_provocation_list', packet, 'Keep the provocation visible behind the story.'),
      viewRequest('data_basis_inspector', packet, 'Show the data basis behind the review draft.'),
      viewRequest('evidence_ledger', packet, 'Keep proof visible behind draft claims.'),
      viewRequest('evidence_spotlight_panel', packet, 'Show claim-level proof and missing-evidence status behind the draft story.'),
      viewRequest('data_gap_panel', packet, 'Show gaps that must be resolved before circulation.')
    ]
  };
}

export function routeAgentSkill(input: AgentSkillRouterInput): AgentSkillRouterResult {
  const packet = buildBrandIntelligencePacket(
    input.brandId,
    undefined,
    undefined,
    undefined,
    input.momentumRuntimeSourceFileDropAudit,
    input.strategicContextRuntimeSourceFileDropAudit
  );
  const acceptedMemory = acceptedMemoryForPacket(input, packet);
  const sourcePromotionContext = sourcePromotionContextForPacket(input, packet);
  const sourceClaimContext = sourceClaimContextForPacket(input, packet);
  const routedSkillId = chooseSkillId(input);
  const fallbackUsed = Boolean(input.preferredSkillId && input.preferredSkillId !== routedSkillId);
  const intent = input.question.trim() || 'Prepare an evidence-bound brand read.';

  let answer: GroundedAgentAnswer | BbeMomentumIntelligenceRead;
  if (routedSkillId === 'bbe_momentum_intelligence_read') answer = momentumAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'explain_diagnosis_evidence') answer = diagnosisAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'create_growth_provocations') answer = provocationAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'recommend_dynamic_view') answer = viewRecommendationAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'compare_brands_or_competitors') answer = comparisonAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'teach_brand_growth_concept' || routedSkillId === 'test_understanding') answer = learningAnswer(packet, routedSkillId, intent, acceptedMemory);
  else if (routedSkillId === 'facilitate_live_meeting') answer = meetingTakeawayAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'draft_meeting_story') answer = draftStoryAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'review_session_state') answer = reviewSessionAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_pilot_learning') answer = pilotLearningAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_quiet_proactivity') answer = quietProactivityAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_voice_readiness') answer = voiceReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_persistence_readiness') answer = persistenceReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_source_promotion_readiness') answer = sourcePromotionReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_treatment_outcome_readiness') answer = treatmentOutcomeReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_artifact_readiness') answer = artifactReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'plan_executive_pilot') answer = executivePilotAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_foundation_readiness') answer = foundationReadinessAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_experience_architecture') answer = experienceArchitectureAnswer(packet, intent, acceptedMemory);
  else if (routedSkillId === 'inspect_runtime_governance') answer = runtimeGovernanceAnswer(packet, intent, acceptedMemory);
  else answer = baseAnswer(packet, routedSkillId, intent, acceptedMemory);

  const baseResult = {
    ok: true,
    routedSkillId,
    fallbackUsed,
    packet,
    answer,
    acceptedMemory,
    sourcePromotionContext,
    sourceClaimContext
  } satisfies Omit<AgentSkillRouterResult, 'experiencePlan'>;

  return {
    ...baseResult,
    experiencePlan: planExperience({
      question: intent,
      result: baseResult,
      preferredAudience: input.experienceAudience,
      preferredObjective: input.experienceObjective,
      preferredTemplateId: input.preferredExperienceTemplateId
    })
  };
}

export function summarizeProvocation(provocation: GrowthProvocation) {
  return `${provocation.title}: ${provocation.what} ${provocation.soWhat} ${provocation.nowWhat}`;
}

export function agentAnswerToMarkdown(answer: GroundedAgentAnswer | BbeMomentumIntelligenceRead) {
  const evidence = answer.evidence
    .slice(0, 4)
    .map((item) => `- **${item.label}:** ${item.detail} _${item.source}_`)
    .join('\n');
  const gaps = answer.missingEvidence
    .slice(0, 4)
    .map((gap) => `- **${gap.label}:** ${gap.missingInput}`)
    .join('\n');
  const views = answer.dynamicViewRequests
    .map((request) => `- ${request.viewId}${request.requiredDataAvailable ? '' : ` -> fallback ${request.fallbackViewId ?? 'data_gap_panel'}`}: ${request.reason}`)
    .join('\n');

  return [
    `## ${answer.headline}`,
    answer.answer,
    '',
    '**Facts**',
    answer.facts.map((fact) => `- ${fact}`).join('\n'),
    '',
    '**Interpretation**',
    answer.interpretation.map((item) => `- ${item}`).join('\n'),
    '',
    '**Evidence**',
    evidence || '- No direct evidence references available in this packet.',
    '',
    '**Evidence gaps / caveats**',
    [
      ...answer.caveats.slice(0, 4).map((caveat) => `- ${caveat}`),
      gaps
    ].filter(Boolean).join('\n'),
    '',
    '**Approved views to open**',
    views || '- No approved view request was generated.'
  ].join('\n');
}
