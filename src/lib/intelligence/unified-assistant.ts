import { answerWithBrandDoctorLlm } from '@/src/lib/llm';
import { findBrandWorkItem, type BrandWorkItem } from '@/src/lib/brand-work';
import { brandRecords } from '@/src/lib/data';
import { buildAssistantCapabilityManifest } from '@/src/lib/intelligence/assistant-capability-manifest';
import { composeAssistantIntroduction } from '@/src/lib/intelligence/assistant-identity-composer';
import {
  applyRealityBoundaryToAnswer,
  buildAssistantRealityContext,
  missingEvidenceLabelsForQuestion,
  safeWorkOrderLabel
} from '@/src/lib/intelligence/assistant-reality-boundaries';
import { buildBrandIntelligencePacket, experienceTemplateRegistry } from '@/src/lib/intelligence/kernel';
import { getDemographicEvidenceGate } from '@/src/lib/intelligence/source-data-contracts';
import {
  hasUnrequestedTypologyLanguage,
  isSourceTypologyQuestion,
  sourceTypologyLanguagePolicy
} from '@/src/lib/intelligence/source-typology-language';
import {
  isQbrCompositionCandidate,
  planQbrComposition,
  type QbrCompositionPlan
} from '@/src/lib/intelligence/qbr-composition-planner';
import { getExecutiveIntelligenceAssetDefinitions } from '@/src/lib/intelligence/executive-intelligence-asset-spec';
import type {
  BrandIntelligencePacket,
  ConversationModeDecisionType,
  ExperienceAudience,
  ExperienceObjective
} from '@/src/lib/intelligence/types';

export type AssistantConversationMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export type AssistantProofDisclosure = {
  evidenceBasis: string[];
  missingEvidence: string[];
  guardrails: string[];
};

export type AssistantCoverageAssessment = {
  id: 'assistant-coverage-assessment-v1';
  status: 'answered_from_evidence' | 'answered_with_gaps' | 'outside_current_evidence' | 'unable_to_answer' | 'work_routed';
  reason: string;
  logForEnhancement: boolean;
  requestedSignals: string[];
  missingEvidence: string[];
};

export type DynamicWorkSpec = {
  id: 'dynamic-work-spec-v1';
  intent: string;
  audience: ExperienceAudience;
  objective: ExperienceObjective;
  artifactType: 'workspace' | 'qbr_read' | 'proof_pack' | 'treatment_path' | 'comparison' | 'source_readiness' | 'governance_review' | 'learning_practice';
  approvedSkillId: string;
  approvedTemplateId: string;
  approvedViewIds: string[];
  dataNeeds: string[];
  missingInputs: string[];
  reviewGates: string[];
  canExecuteNow: boolean;
  qbrCompositionPlan?: QbrCompositionPlan;
};

export type UnifiedAssistantIntent = {
  id: 'unified-assistant-intent-v1';
  type: ConversationModeDecisionType;
  label: string;
  reason: string;
  requiresApproval: boolean;
  suggestedSkillId: string;
  suggestedTemplateId: string;
  suggestedViewIds: string[];
  offers: string[];
  blockedActions: string[];
};

export type UnifiedAssistantResponse = {
  ok: true;
  id: 'unified-assistant-response-v1';
  brandId: string;
  question: string;
  intent: UnifiedAssistantIntent;
  answer: string;
  writtenAnswer: string;
  spokenAnswer: string;
  suggestedNextMoves: string[];
  proofDisclosure: AssistantProofDisclosure;
  coverageAssessment: AssistantCoverageAssessment;
  workSpec: DynamicWorkSpec | null;
  source: 'openai' | 'grounded_fallback' | 'assistant_router';
  model: string | null;
  grounding: 'full_foundation' | 'scoped_primary' | 'scoped_fallback' | 'assistant_router';
};

type FoundationAssistantAnswer = {
  writtenAnswer: string;
  spokenAnswer: string;
  suggestedNextMoves: string[];
  proofDisclosure: AssistantProofDisclosure;
  source: 'openai' | 'grounded_fallback';
  model: string | null;
};

type ConversationContinuity = {
  isFollowUp: boolean;
  followUpType: 'action_recommendation' | 'explain_more' | 'package_or_revise' | 'none';
  priorFrame: string;
  bridgeLine: string | null;
};

type AssistantActiveWorkContext = {
  id: 'assistant-active-work-context-v1';
  workId: string;
  title: string;
  type: BrandWorkItem['type'];
  source: BrandWorkItem['source'];
  templateId: string;
  templateName: string;
  skillName: string;
  sourcePrompt: string;
  summary: string;
  proofSummary: BrandWorkItem['proofSummary'];
  reviewState: string;
  shareState: BrandWorkItem['shareState'];
  exportState: BrandWorkItem['exportState'];
  approvedViewIds: string[];
  contextText: string;
};

const workActionSignals = [
  'build',
  'create',
  'make',
  'generate',
  'draft',
  'prepare',
  'package',
  'turn this into',
  'turn that into',
  'open a workspace',
  'open the workspace',
  'run the workspace',
  'run this',
  'assemble',
  'set up',
  'show',
  'open'
];

const workDeliverableSignals = [
  'dashboard',
  'report',
  'executive read',
  'cmo-review executive read',
  'cmo review executive read',
  'meeting prep',
  'meeting prep read',
  'meeting read',
  'qbr',
  'deck',
  'brief',
  'brief draft',
  'governed brief',
  'artifact',
  'workspace',
  'view',
  'proof pack',
  'evidence pack',
  'proof plan',
  'data and evidence inspector',
  'data basis inspector',
  'source readiness',
  'treatment plan',
  'treatment recommendation',
  'treatment recommendation workspace',
  'agency brief',
  'learning path',
  'learning plan',
  'learning workspace',
  'training plan',
  'training',
  'education page',
  'education pages',
  'test diagnostic',
  'diagnostic test',
  'quiz',
  'practice',
  'pilot runbook',
  'demo runbook',
  'sponsor runbook',
  'funding demo',
  'executive pilot',
  'foundation readiness',
  'platform readiness',
  'experience architecture',
  'workspace builder',
  'role-specific workspace',
  'voice readiness',
  'runtime governance',
  'persistence readiness',
  'artifact readiness',
  'source promotion readiness',
  'treatment outcome readiness'
];

const governanceSignals = [
  'certify',
  'production ready',
  'approve funding',
  'official approval',
  'export the audit',
  'write source truth',
  'canonical',
  'turn on full voice',
  'continuous listening',
  'autonomous'
];

const offerSignals = [
  'momentum',
  'cmo',
  'leadership',
  'meeting prep',
  'meeting read',
  'qbr',
  'report',
  'dashboard',
  'deck',
  'brief',
  'compare',
  'what should',
  'why',
  'diagnosis',
  'treatment',
  'proof',
  'evidence',
  'learn',
  'learning',
  'teach',
  'training',
  'education',
  'quiz',
  'practice'
];

const learningSignals = [
  'learn',
  'learning',
  'teach',
  'training',
  'education',
  'quiz',
  'test me',
  'practice',
  'learning path',
  'training plan',
  'test diagnostic',
  'diagnostic test'
];

const dataBasisSignals = [
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
];

const activeAssetReferenceSignals = [
  'this',
  'this asset',
  'this read',
  'this page',
  'this output',
  'this workspace',
  'this proof',
  'this meeting prep',
  'this qbr',
  'this deck',
  'this report',
  'it',
  'that',
  'current asset',
  'active asset',
  'active work'
];

const activeAssetProofSignals = [
  'proof',
  'evidence',
  'source',
  'gaps',
  'guardrail',
  'why',
  'basis',
  'backing'
];

const activeAssetRevisionSignals = [
  'make',
  'tighten',
  'revise',
  'change',
  'edit',
  'improve',
  'cmo',
  'leadership',
  'kate',
  'lydia',
  'source-owner',
  'source owner',
  'handoff',
  'follow-up',
  'next step'
];

function includesAny(value: string, signals: string[]) {
  return signals.some((signal) => value.includes(signal));
}

function displayCompositionMode(value: string) {
  if (value === 'executive_qbr') return 'Executive Review / QBR';
  if (value === 'evidence_read') return 'Evidence Read';
  if (value === 'treatment_read') return 'Treatment Read';
  if (value === 'assumption_readiness_read') return 'Assumption Readiness Read';
  return value.replaceAll('_', ' ');
}

function buildActiveWorkContext(work: BrandWorkItem | undefined): AssistantActiveWorkContext | null {
  if (!work) return null;
  const viewLabel = work.approvedViewIds.length
    ? work.approvedViewIds.slice(0, 5).map((viewId) => viewId.replaceAll('_', ' ')).join(', ')
    : 'no approved views listed';
  const contextText = [
    `Active work asset: ${work.title}.`,
    `Work type: ${work.type.replaceAll('_', ' ')}; template: ${work.approvedTemplateName}; skill: ${work.approvedSkillName}.`,
    `Original source prompt: ${work.sourcePrompt}`,
    `Asset summary: ${work.summary}`,
    `Proof posture: ${work.proofSummary.evidence} evidence items, ${work.proofSummary.gaps} gaps, ${work.proofSummary.gates} review gates.`,
    `Approved views: ${viewLabel}.`,
    `Review/circulation posture: review state ${work.reviewState.replaceAll('_', ' ')}, share state ${work.shareState.replaceAll('_', ' ')}, export ${work.exportState}.`,
    'Allowed follow-ups: explain proof, identify gaps, make the read more CMO-facing, draft source-owner handoff framing, or propose a review-draft revision. Do not claim official approval, export readiness, canonical source truth, or final prescription.'
  ].join(' ');

  return {
    id: 'assistant-active-work-context-v1',
    workId: work.id,
    title: work.title,
    type: work.type,
    source: work.source,
    templateId: work.approvedTemplateId,
    templateName: work.approvedTemplateName,
    skillName: work.approvedSkillName,
    sourcePrompt: work.sourcePrompt,
    summary: work.summary,
    proofSummary: work.proofSummary,
    reviewState: work.reviewState,
    shareState: work.shareState,
    exportState: work.exportState,
    approvedViewIds: work.approvedViewIds,
    contextText
  };
}

function referencesActiveAsset(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, activeAssetReferenceSignals);
}

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function reviewDraftLabel(reviewState: string) {
  const label = reviewState.replaceAll('_', ' ');
  if (label === 'not required') return 'prototype review';
  if (label === 'source owner blocked') return 'source-owner-blocked';
  return label;
}

function lastAssistantMessage(conversationHistory: AssistantConversationMessage[]) {
  return conversationHistory
    .slice()
    .reverse()
    .find((message) => message.role === 'assistant')?.text ?? '';
}

function isLowContextFollowUp(question: string) {
  const normalized = question.toLowerCase().trim();
  return includesAny(normalized, [
    'what should we do',
    'what should i do',
    'so what should',
    'what do we do',
    'what do i do',
    'what next',
    'do next',
    'next best',
    'based on that',
    'given that',
    'with that',
    'from that',
    'so what',
    'now what',
    'tell me what to do',
    'recommend',
    'recommendation'
  ]) || /^(so|ok|okay|great|got it|then|and)?\s*(what|now)\??$/i.test(normalized);
}

function followUpTypeFor(question: string): ConversationContinuity['followUpType'] {
  const normalized = question.toLowerCase();
  if (includesAny(normalized, ['build', 'create', 'make', 'draft', 'turn this', 'turn that', 'package', 'revise', 'change it'])) return 'package_or_revise';
  if (includesAny(normalized, ['why', 'explain', 'say more', 'tell me more', 'what does that mean'])) return 'explain_more';
  if (isLowContextFollowUp(normalized) || includesAny(normalized, ['action', 'treatment', 'recommend', 'what should'])) return 'action_recommendation';
  return 'none';
}

function priorFrameFromHistory(conversationHistory: AssistantConversationMessage[], packet: BrandIntelligencePacket) {
  const assistant = lastAssistantMessage(conversationHistory).toLowerCase();
  if (assistant.includes('large but vulnerable')) return `${packet.brand.brandName} is large but vulnerable: scale is real, but Momentum and driver support need attention.`;
  if (assistant.includes('strong but slipping')) return `${packet.brand.brandName} is strong but slipping: the equity base is useful, but Momentum is the watch-out.`;
  if (assistant.includes('momentum')) return packet.equityReasoning.headlineVerdict;
  if (assistant.includes('perceived value') || assistant.includes('pricing power')) return `The live thread is about the connected M/D/S and Perceived Value driver read for ${packet.brand.brandName}.`;
  return packet.equityReasoning.headlineVerdict;
}

function buildConversationContinuity(input: {
  question: string;
  conversationHistory: AssistantConversationMessage[];
  packet: BrandIntelligencePacket;
}): ConversationContinuity {
  const hasPriorAssistantTurn = Boolean(lastAssistantMessage(input.conversationHistory));
  const followUpType = hasPriorAssistantTurn ? followUpTypeFor(input.question) : 'none';
  const isFollowUp = hasPriorAssistantTurn && followUpType !== 'none';
  const priorFrame = priorFrameFromHistory(input.conversationHistory, input.packet);
  return {
    isFollowUp,
    followUpType,
    priorFrame,
    bridgeLine: isFollowUp
      ? 'Building on the read, move from re-diagnosing the brand to choosing the first proof-backed path to test.'
      : null
  };
}

function impliesGovernedWork(value: string) {
  if (includesAny(value, dataBasisSignals) && includesAny(value, ['show', 'open', 'build', 'create', 'pull up'])) {
    return true;
  }
  const asksForUsablePlan = includesAny(value, workActionSignals)
    && includesAny(value, [' plan', 'planning', 'recommendation'])
    && includesAny(value, ['governed', 'team can use', 'bring to the team', 'brought to the team', 'brand equity treatment', 'treatment recommendation']);
  if (asksForUsablePlan) return true;
  if (includesAny(value, ['proof pack', 'evidence pack', 'source readiness workbench', 'governance workspace'])) {
    return includesAny(value, workActionSignals);
  }
  return includesAny(value, workActionSignals) && includesAny(value, workDeliverableSignals);
}

function skillForQuestion(normalized: string) {
  if (includesAny(normalized, ['executive pilot', 'cmo pilot', 'funding demo', 'sponsor runbook', 'demo runbook', 'pilot runbook', 'make the case to fund', 'holy shit demo', 'jaw drop demo'])) return 'plan_executive_pilot';
  if (includesAny(normalized, ['foundation readiness', 'platform readiness', 'brand growth intelligence foundation', 'fundable foundation', 'control plane', 'is the foundation ready', 'what is ready', 'what is gated'])) return 'inspect_foundation_readiness';
  if (includesAny(normalized, ['experience architecture', 'dynamic ui foundation', 'workspace builder', 'build the right workspace', 'role specific workspace', 'role-specific workspace', 'approved templates', 'approved views', 'compose ui', 'new user workspace'])) return 'inspect_experience_architecture';
  if (includesAny(normalized, ['voice readiness', 'voice gates', 'jarvis readiness', 'jarvis-style', 'realtime voice', 'continuous voice', 'tts', 'provider adapter', 'wake listen'])) return 'inspect_voice_readiness';
  if (includesAny(normalized, ['runtime governance', 'runtime control', 'kill switch', 'capability flags', 'runtime surfaces', 'surface readiness', 'provider gates'])) return 'inspect_runtime_governance';
  if (includesAny(normalized, ['persistence readiness', 'enterprise persistence', 'durable memory', 'durable audit', 'database readiness', 'retention privacy', 'backup recovery'])) return 'inspect_persistence_readiness';
  if (includesAny(normalized, ['artifact readiness', 'export readiness', 'circulation readiness', 'can we share this', 'can we export', 'artifact gates', 'meeting artifact readiness'])) return 'inspect_artifact_readiness';
  if (includesAny(normalized, ['source promotion readiness', 'source claim promotion', 'canonical source promotion', 'source candidates', 'source claims', 'runtime source consumption'])) return 'inspect_source_promotion_readiness';
  if (includesAny(normalized, ['treatment outcome readiness', 'treatment outcomes', 'outcome learning', 'efficacy readiness', 'treatment efficacy', 'outcome records', 'portfolio learning', 'canonical learning'])) return 'inspect_treatment_outcome_readiness';
  if (includesAny(normalized, ['meeting takeaway', 'capture decision', 'capture decisions', 'meeting recap', 'workshop recap', 'takeaway', 'recap'])) return 'facilitate_live_meeting';
  if (includesAny(normalized, ['agency brief', 'creative brief', 'partner brief', 'talk track', 'memo', 'slide outline', 'make slides'])) return 'draft_meeting_story';
  if (includesAny(normalized, ['review queue', 'review workflow', 'review operations', 'audit session', 'pending approvals', 'pending review', 'session review'])) return 'review_session_state';
  if (includesAny(normalized, dataBasisSignals)) return 'explain_diagnosis_evidence';
  if (includesAny(normalized, learningSignals)) return includesAny(normalized, ['quiz', 'test me', 'practice', 'test diagnostic', 'diagnostic test'])
    ? 'test_understanding'
    : 'teach_brand_growth_concept';
  if (includesAny(normalized, ['qbr', 'meeting prep', 'meeting read', 'report', 'story', 'momentum', 'cmo', 'leadership'])) return 'bbe_momentum_intelligence_read';
  if (includesAny(normalized, ['treatment', 'what should', 'action plan'])) return 'create_growth_provocations';
  if (includesAny(normalized, ['compare', 'peer', 'competitor'])) return 'compare_brands_or_competitors';
  if (includesAny(normalized, ['source readiness', 'trust', 'proof', 'evidence'])) return 'explain_diagnosis_evidence';
  return 'bbe_momentum_intelligence_read';
}

function templateForSkill(skillId: string, question = '') {
  const normalizedQuestion = question.toLowerCase();
  const ranked = [...experienceTemplateRegistry]
    .map((template) => ({
      template,
      score: (template.requiredSkillIds.includes(skillId) ? 10 : 0)
        + template.triggerTerms.reduce((total, term) => total + (normalizedQuestion.includes(term) ? 3 : 0), 0)
        + (template.pilotPriority === 'p0' ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score);
  const selected = ranked.find((item) => item.score > 0)?.template
    ?? experienceTemplateRegistry.find((template) => template.id === 'executive-qbr-decision-read')
    ?? experienceTemplateRegistry[0];
  return {
    templateId: selected.id,
    viewIds: selected.zones
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((zone) => zone.viewId)
      .slice(0, 6)
  };
}

function defaultProofDisclosure(packet: BrandIntelligencePacket): AssistantProofDisclosure {
  return {
    evidenceBasis: [
      packet.diagnosisTrace.primaryRule.evidenceSummary,
      packet.momentumIntelligence.headline,
      `${packet.evidenceReadiness.label} evidence readiness`,
      packet.equityReasoning.sourcePosture.read
    ].filter(Boolean).slice(0, 4),
    missingEvidence: [
      ...packet.evidenceGaps.map((gap) => `${gap.label}: ${gap.missingInput}`),
      packet.equityReasoning.sourcePosture.pilotPromotionRequirement
    ].slice(0, 4),
    guardrails: [
      ...packet.agentGuardrails,
      ...packet.equityReasoning.sourcePosture.caveats
    ].slice(0, 4)
  };
}

function fallbackFoundationAnswer(packet: BrandIntelligencePacket, question: string) {
  const proofDisclosure = defaultProofDisclosure(packet);
  const firstTreatment = packet.treatmentOptions[0];
  const isActionAsk = /\b(should|do next|recommend|treatment|path|fix|action)\b/i.test(question);
  const writtenAnswer = [
    `Here is the tight read on ${packet.brand.brandName}: ${packet.momentumIntelligence.headline}`,
    isActionAsk && firstTreatment
      ? `The treatment recommendation I would consider first is ${firstTreatment.name}, with proof needs and areas to inspect visible before anyone treats it as a prescription.`
      : packet.roomToGrow.read
  ].join('\n\n');

  return {
    writtenAnswer,
    spokenAnswer: `${packet.brand.brandName} is not a weak-brand story, but the momentum read needs attention: ${packet.momentumIntelligence.headline}`,
    suggestedNextMoves: conciseNextMoves(packet),
    proofDisclosure
  };
}

function directRouterIntent(baseIntent: UnifiedAssistantIntent, reason: string): UnifiedAssistantIntent {
  return {
    ...baseIntent,
    type: 'direct_answer',
    label: 'Direct Answer',
    reason,
    requiresApproval: false,
    offers: [],
    blockedActions: []
  };
}

function continuityActionRecommendationAnswer(input: {
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
  continuity: ConversationContinuity;
}): UnifiedAssistantResponse | null {
  const { packet, continuity } = input;
  if (!continuity.isFollowUp || continuity.followUpType !== 'action_recommendation') return null;

  const treatment = packet.executiveVerdict.treatmentPathsToConsider[0];
  const treatmentLine = treatment
    ? `Therefore, the next best action is to test the "${treatment.name}" path, not as a final prescription, but as the first treatment path to inspect.`
    : `Therefore, the next best action is to finish the evidence review before selecting a treatment path.`;
  const inspectLine = treatment?.inspectBeforeAction.length
    ? `Before acting, inspect: ${treatment.inspectBeforeAction.slice(0, 3).join(' ')}`
    : `Before acting, inspect whether the issue is primarily Momentum, Perceived Value, Salient/Meaningful/Different support, or source readiness.`;
  const writtenAnswer = [
    continuity.bridgeLine,
    treatmentLine,
    `Because the diagnosis is not a generic weak-equity problem, I would avoid a broad brand reset. Focus the team on the specific vulnerability: ${packet.executiveVerdict.primaryWatchout}`,
    inspectLine,
    `Keep the caveat visible: this is a path to test with proof, not an autonomous recommendation to execute.`
  ].filter(Boolean).join('\n\n');
  const intent = directRouterIntent(input.intent, 'The user asked a low-context follow-up action question, so answer from recent conversation continuity plus the active diagnosis.');
  const proofDisclosure = defaultProofDisclosure(packet);

  return {
    ok: true,
    id: 'unified-assistant-response-v1',
    brandId: packet.brand.brandId,
    question: input.question,
    intent,
    answer: writtenAnswer,
    writtenAnswer,
    spokenAnswer: treatment
      ? `Building on that read, I would test ${treatment.name} first, with proof checks before treating it as a recommendation to execute.`
      : `Building on that read, I would complete the proof review before selecting a treatment path.`,
    suggestedNextMoves: uniqueMoves([
      treatment ? `Create a governed treatment recommendation around ${treatment.name}.` : 'Create a governed treatment recommendation workspace.',
      'Open the Data and Evidence Inspector.',
      'Build the meeting prep intelligence asset.'
    ], 3),
    proofDisclosure,
    coverageAssessment: assessAssistantCoverage({
      question: input.question,
      answer: writtenAnswer,
      intent,
      proofDisclosure,
      packet
    }),
    workSpec: null,
    source: 'assistant_router',
    model: null,
    grounding: 'assistant_router'
  };
}

function activeWorkFollowUpAnswer(input: {
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
  activeWorkContext: AssistantActiveWorkContext | null;
}): UnifiedAssistantResponse | null {
  const { activeWorkContext, packet } = input;
  if (!activeWorkContext || !referencesActiveAsset(input.question)) return null;
  const normalized = input.question.toLowerCase();
  const isProofAsk = includesAny(normalized, activeAssetProofSignals);
  const isRevisionAsk = includesAny(normalized, activeAssetRevisionSignals);
  if (!isProofAsk && !isRevisionAsk) return null;

  const proofLine = `This active asset has ${countLabel(activeWorkContext.proofSummary.evidence, 'evidence item')}, ${countLabel(activeWorkContext.proofSummary.gaps, 'gap')}, and ${countLabel(activeWorkContext.proofSummary.gates, 'review gate')} attached.`;
  const governanceLine = `It is still a ${reviewDraftLabel(activeWorkContext.reviewState)} review draft: URL-addressable for prototype review, but export and official circulation remain gated.`;
  const viewLine = activeWorkContext.approvedViewIds.length
    ? `The approved view spine is ${activeWorkContext.approvedViewIds.slice(0, 5).map((viewId) => viewId.replaceAll('_', ' ')).join(', ')}.`
    : activeWorkContext.templateId === 'cmo-review-intelligence-asset'
      ? 'This executive asset uses its page-level proof contract rather than a generic dynamic-view spine.'
    : `No approved view spine is attached to this asset yet.`;
  const cmoLine = `To make it more CMO-facing, I would lead with the decision read, keep Momentum as the headline verdict, move proof/gaps into concise support, and turn the ask into one or two treatment paths to test rather than a broad brand-equity lesson.`;
  const sourceOwnerLine = `For a source-owner handoff, I would list the claims this asset wants to make, the evidence already loaded, the missing official inputs, and the blocked overclaims that should stay out until those inputs clear.`;
  const kateLydiaLine = `For Kate/Lydia calibration, keep category index as context, use Ahead/Behind as the size-adjusted strength check, avoid source typology labels unless explicitly asked, and do not call the brand strong unless the full Momentum/M-D-S/Perceived Value profile supports it.`;

  const writtenAnswer = isProofAsk && !isRevisionAsk
    ? [
      `For this asset, the proof answer is: ${proofLine}`,
      viewLine,
      `The original source prompt was: "${activeWorkContext.sourcePrompt}"`,
      `What I would inspect next: source posture behind the headline claim, the named evidence gaps, and whether the active approved views support the exact language on the page.`,
      governanceLine
    ].join('\n\n')
    : [
      `Yes. I would treat "${activeWorkContext.title}" as the active work object and revise inside its existing proof contract, not as a brand-new generic answer.`,
      cmoLine,
      includesAny(normalized, ['source-owner', 'source owner', 'handoff']) ? sourceOwnerLine : null,
      includesAny(normalized, ['kate', 'lydia']) ? kateLydiaLine : null,
      `${proofLine} ${governanceLine}`
    ].filter(Boolean).join('\n\n');

  const intent = directRouterIntent(input.intent, 'The user referenced the active work asset, so answer from the active work context and keep revisions inside the asset proof/review contract.');
  const proofDisclosure: AssistantProofDisclosure = {
    evidenceBasis: [
      activeWorkContext.contextText,
      packet.equityReasoning.headlineVerdict,
      packet.equityReasoning.sourcePosture.read
    ].slice(0, 4),
    missingEvidence: [
      `${activeWorkContext.title}: ${activeWorkContext.proofSummary.gaps} active proof gaps remain attached to the asset.`,
      ...packet.evidenceGaps.map((gap) => `${gap.label}: ${gap.missingInput}`),
      packet.equityReasoning.sourcePosture.pilotPromotionRequirement
    ].slice(0, 4),
    guardrails: [
      `Keep ${activeWorkContext.title} as a review draft; export remains gated.`,
      ...packet.agentGuardrails,
      ...packet.equityReasoning.blockedClaims
    ].slice(0, 4)
  };

  return {
    ok: true,
    id: 'unified-assistant-response-v1',
    brandId: packet.brand.brandId,
    question: input.question,
    intent,
    answer: writtenAnswer,
    writtenAnswer,
    spokenAnswer: isProofAsk && !isRevisionAsk
      ? `For this asset, proof is attached but still review-gated: ${countLabel(activeWorkContext.proofSummary.evidence, 'evidence item')}, ${countLabel(activeWorkContext.proofSummary.gaps, 'gap')}, and export gated.`
      : `Yes. I would revise the active asset inside its proof contract: make the decision clearer, keep proof visible, and leave export or official circulation gated.`,
    suggestedNextMoves: uniqueMoves([
      'Open the proof behind this asset.',
      'Make this CMO-facing.',
      'Create source-owner handoff framing.',
      'Tighten this against Kate/Lydia feedback.'
    ], 4),
    proofDisclosure,
    coverageAssessment: assessAssistantCoverage({
      question: input.question,
      answer: writtenAnswer,
      intent,
      proofDisclosure,
      packet
    }),
    workSpec: null,
    source: 'assistant_router',
    model: null,
    grounding: 'assistant_router'
  };
}

function isStrongOrBigQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['just big', 'really strong', 'actually strong', 'truly strong', 'strong or', 'category leading', 'category-leading'])
    && includesAny(normalized, ['strong', 'healthy', 'big', 'scale', 'category']);
}

function isBenchmarkConflictQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['over-index', 'over indexes', 'overindexes', 'category-leading', 'category leading', 'category index'])
    && includesAny(normalized, ['declining', 'slipping', 'momentum', 'why']);
}

function isHeadlineVerdictQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['headline verdict', 'final verdict', 'which is the verdict'])
    || (includesAny(normalized, ['momentum', 'category index', 'ahead']) && includesAny(normalized, ['verdict', 'headline']));
}

function isTypologyQuestion(question: string) {
  return isSourceTypologyQuestion(question);
}

function isPricingPowerInspectionQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['pricing power', 'perceived value'])
    && includesAny(normalized, ['weak', 'inspect', 'look at', 'diagnose', 'pressure']);
}

function isDriverSystemQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['meaningful', 'different', 'salient'])
    && includesAny(normalized, ['perceived value', 'pricing power', 'together', 'driver']);
}

function isSourceEvidenceQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['source evidence', 'what source', 'evidence supports', 'source supports', 'data supports']);
}

function isBlockedClaimsQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, ['blocked claims', 'what claims are blocked', 'claims are blocked', 'cannot claim', 'source-owner data arrives']);
}

function isDemographicDiagnosticQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, [
    'demographic',
    'gen z',
    'gen-z',
    'younger',
    'older',
    'age cohort',
    '18-24',
    '13-17',
    'hispanic',
    'gender'
  ]) || /\b(women|men|male|female)\b/.test(normalized);
}

function deterministicEquityReasoningAnswer(input: {
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
}): UnifiedAssistantResponse | null {
  const { packet } = input;
  if (isStrongOrBigQuestion(input.question) || isBenchmarkConflictQuestion(input.question) || isHeadlineVerdictQuestion(input.question)) {
    const read = packet.equityReasoning;
    const writtenAnswer = [
      isHeadlineVerdictQuestion(input.question)
        ? `The headline verdict should be Momentum, not category index or Ahead by itself. For ${packet.brand.brandName}, the calibrated read is: ${read.headlineVerdict}`
        : `I would not call ${packet.brand.brandName} simply strong from the current profile. The better read is: ${read.headlineVerdict}`,
      read.largeButVulnerable
        ? `Category index is context, not proof of health. ${read.categoryContext.read} ${read.aheadBehindRead.read} ${read.momentumRead.read}`
        : `${read.categoryContext.read} ${read.aheadBehindRead.read} ${read.momentumRead.read}`,
      `Language guardrail: ${read.strengthLanguage.requiredQualifier}`,
      read.driverRead.tensions.length
        ? `The key driver tension: ${read.driverRead.tensions.join(' ')}`
        : `The driver profile does not show a major contradiction in the loaded data, but it still needs source-owner review before pilot use.`
    ].join('\n\n');
    const intent = directRouterIntent(input.intent, 'The user asked for the calibrated strength-vs-scale read, so answer from EquityReasoningRead.');
    const proofDisclosure: AssistantProofDisclosure = {
      evidenceBasis: [
        read.headlineVerdict,
        read.categoryContext.read,
        read.aheadBehindRead.read,
        read.momentumRead.read,
        read.sourcePosture.read
      ],
      missingEvidence: [
        ...read.evidenceGaps,
        read.sourcePosture.pilotPromotionRequirement
      ].slice(0, 4),
      guardrails: [
        ...read.blockedClaims,
        ...read.sourcePosture.caveats
      ].slice(0, 4)
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: packet.brand.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: `${packet.brand.brandName} should be read as large but vulnerable, not simply strong. Category index is context; Ahead and Momentum decide whether the strength is really supported.`,
      suggestedNextMoves: ['Open the Data and Evidence Inspector.', 'Build the meeting prep intelligence asset.', 'Show the benchmark lens explanation.'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  if (isTypologyQuestion(input.question)) {
    const read = packet.equityReasoning;
    const writtenAnswer = [
      `Use Star only as Kantar BrandZ typology source context, not as the product verdict.`,
      `For ${packet.brand.brandName}, the product headline should come from the calibrated read: ${read.headlineVerdict}`,
      `The governing rule is: ${read.blockedClaims.find((claim) => claim.includes('source typology')) ?? 'Do not use source typology labels as the final product verdict.'}`,
      `So the safer readout is to cite typology only if someone asks for the source deck context, then return to Momentum, Ahead/Behind, category context, and driver support.`
    ].join('\n\n');
    const intent = directRouterIntent(input.intent, 'The user asked about typology language, so answer from the deck doctrine and EquityReasoningRead.');
    const proofDisclosure: AssistantProofDisclosure = {
      evidenceBasis: [
        read.sourcePosture.read,
        'Kantar BrandZ typology is governed as source context only.',
        read.headlineVerdict
      ],
      missingEvidence: [
        read.sourcePosture.pilotPromotionRequirement,
        ...read.evidenceGaps
      ].slice(0, 4),
      guardrails: [
        ...read.blockedClaims,
        ...read.sourceCaveats
      ].slice(0, 4)
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: packet.brand.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: `Use Star only as source typology context, not as the product verdict. The headline should come from Momentum and the full equity profile.`,
      suggestedNextMoves: ['Show the benchmark lens explanation.', 'Open the Data and Evidence Inspector.', 'Build the meeting prep intelligence asset.'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  if (isPricingPowerInspectionQuestion(input.question) || isDriverSystemQuestion(input.question)) {
    const read = packet.equityReasoning;
    const writtenAnswer = isPricingPowerInspectionQuestion(input.question)
      ? [
        `For Perceived Value, the source metric is Pricing Power. Inspect it as broad brand-equity price justification, not SKU-level pricing.`,
        read.driverRead.perceivedValueDrivers,
        read.driverRead.treatmentImplications.length
          ? `Inspection areas: ${read.driverRead.treatmentImplications.join(' ')}`
          : 'Inspection areas: value justification, perceived quality, differentiation against price-based switching, and premium defense.',
        `Guardrail: do not turn this into SKU price, pack-price architecture, promo, or channel pricing guidance without separate pricing/RGM evidence.`
      ].join('\n\n')
      : [
        `Read Meaningful, Different, Salient, and Perceived Value together as a driver system, not as isolated metric cards.`,
        read.driverRead.demandPowerDrivers,
        read.driverRead.perceivedValueDrivers,
        read.driverRead.tensions.length
          ? `Current tensions: ${read.driverRead.tensions.join(' ')}`
          : 'No major driver contradiction is visible in the loaded profile, but source-owner review is still required before pilot use.'
      ].join('\n\n');
    const intent = directRouterIntent(input.intent, 'The user asked for deck-derived driver interpretation, so answer from EquityReasoningRead.');
    const proofDisclosure: AssistantProofDisclosure = {
      evidenceBasis: [
        read.driverRead.demandPowerDrivers,
        read.driverRead.perceivedValueDrivers,
        read.sourcePosture.read
      ],
      missingEvidence: [
        ...read.evidenceGaps,
        read.sourcePosture.pilotPromotionRequirement
      ].slice(0, 4),
      guardrails: [
        ...read.blockedClaims,
        ...read.sourceCaveats
      ].slice(0, 4)
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: packet.brand.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: isPricingPowerInspectionQuestion(input.question)
        ? `Inspect Perceived Value through Meaningful and Different first, and keep it away from SKU-level pricing recommendations.`
        : `Read the drivers together. Demand Power leans on Meaningful and Salient; Perceived Value leans on Meaningful and Different.`,
      suggestedNextMoves: ['Open the Data and Evidence Inspector.', 'Show the benchmark lens explanation.', 'Create a governed treatment recommendation workspace.'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  if (isSourceEvidenceQuestion(input.question) || isBlockedClaimsQuestion(input.question)) {
    const read = packet.equityReasoning;
    const writtenAnswer = isSourceEvidenceQuestion(input.question)
      ? [
        `This read is supported by the governed source ledger, not by raw PowerPoint interpretation: ${read.sourcePosture.read}`,
        `Source report: ${read.sourcePosture.title}. Review status: ${read.sourcePosture.reviewStatus}; evidence mode: ${read.sourcePosture.evidenceMode}.`,
        `For ${packet.brand.brandName}, the ledger currently maps ${read.sourcePosture.metricRowsForBrand} processed BBE metric rows across source slides ${read.sourcePosture.sourceSlides.slice(0, 8).join(', ')}${read.sourcePosture.sourceSlides.length > 8 ? ', ...' : ''}.`,
        `Pilot requirement: ${read.sourcePosture.pilotPromotionRequirement}`
      ].join('\n\n')
      : [
        `Blocked until source-owner data or approval arrives:`,
        ...read.blockedClaims.map((claim) => `- ${claim}`),
        `- Do not treat reviewed-for-prototype source extracts as canonical pilot data until source-owner approval clears the metric mapping.`,
        `Promotion requirement: ${read.sourcePosture.pilotPromotionRequirement}`
      ].join('\n');
    const intent = directRouterIntent(input.intent, 'The user asked for evidence posture or blocked claims, so answer from EquityReasoningRead source posture.');
    const proofDisclosure: AssistantProofDisclosure = {
      evidenceBasis: [
        read.sourcePosture.read,
        isBlockedClaimsQuestion(input.question) ? 'Blocked claims come from EquityReasoningRead guardrails.' : 'Source posture comes from bbe_source_data_ledger.json and deck-chart-ledger.json.'
      ],
      missingEvidence: [
        read.sourcePosture.pilotPromotionRequirement,
        ...read.evidenceGaps
      ].slice(0, 4),
      guardrails: [
        ...read.blockedClaims,
        ...read.sourceCaveats
      ].slice(0, 4)
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: packet.brand.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: isSourceEvidenceQuestion(input.question)
        ? `The read is supported by the governed source ledger, but it is still prototype-reviewed and needs source-owner approval before pilot use.`
        : `The blocked claims are mainly simple strong language, typology as verdict, SKU-level pricing, and measured demographic claims without official cuts.`,
      suggestedNextMoves: ['Open the Data and Evidence Inspector.', 'Build an assumption/readiness read.', 'Show source-owner promotion requirements.'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  if (isDemographicDiagnosticQuestion(input.question)) {
    const gate = getDemographicEvidenceGate(packet.brand.brandId, 'age_cohort', '18-24');
    const proofRecords = gate.records.filter((record) => ['Demand Power', 'Meaningful', 'Different', 'Salient', 'Pricing Power'].includes(record.metric));
    const metricLine = proofRecords.length
      ? proofRecords.map((record) => `${record.metric}: ${record.value}, ${record.ahead}, ${record.momentum}`).join('; ')
      : 'No demographic metric cut is loaded.';
    const interpretation = proofRecords[0]?.interpretation;
    const writtenAnswer = gate.status === 'simulated_available'
      ? [
        `For demographic performance, the current measured answer is still: official BBE demographic cuts are not loaded.`,
        `For prototype demonstration only, the simulated 18-24 age-cohort cut for ${packet.brand.brandName} says: ${interpretation}`,
        `Simulated metric pattern: ${metricLine}`,
        `Do not use this as measured consumer truth. ${gate.requiredSource}`
      ].join('\n\n')
      : [
        `I cannot diagnose ${packet.brand.brandName} performance for that demographic from the current measured data.`,
        gate.headline,
        gate.caveats.join(' '),
        `Needed next source: ${gate.requiredSource}`
      ].join('\n\n');
    const intent = directRouterIntent(input.intent, 'The user asked for demographic performance, so answer through the demographic evidence gate.');
    const proofDisclosure: AssistantProofDisclosure = {
      evidenceBasis: gate.status === 'simulated_available'
        ? [
          'Simulated prototype demographic diagnostics pack',
          packet.equityReasoning.sourcePosture.read,
          ...proofRecords.slice(0, 2).map((record) => `${record.segment} ${record.metric}: ${record.value}`)
        ]
        : [gate.headline],
      missingEvidence: [gate.requiredSource],
      guardrails: [
        ...gate.caveats,
        ...packet.equityReasoning.sourcePosture.caveats,
        'Do not infer demographic performance from total-market BBE data.'
      ].slice(0, 4)
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: packet.brand.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: gate.status === 'simulated_available'
        ? `Measured demographic cuts are not loaded. I can show a simulated prototype age-cohort read only to demonstrate the workflow.`
        : `I cannot diagnose that demographic from the current measured packet. We need official B B E demographic cuts first.`,
      suggestedNextMoves: ['Open the Data and Evidence Inspector.', 'Show demographic data requirements.', 'Build an assumption/readiness read.'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  return null;
}

function scopedQuestionWithHistory(
  question: string,
  conversationHistory: AssistantConversationMessage[],
  continuity?: ConversationContinuity,
  activeWorkContext?: AssistantActiveWorkContext | null
) {
  const recent = conversationHistory
    .slice(-6)
    .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.text}`)
    .join('\n');
  if (!recent) return question;
  return [
    'Use this recent conversation only as local context for the current follow-up. Do not treat it as source evidence.',
    sourceTypologyLanguagePolicy,
    activeWorkContext
      ? [
        'Active work context: the user is likely referring to the current work asset when they say "this", "it", "the asset", or "the read". Use this context for follow-ups, but do not treat it as new source evidence.',
        activeWorkContext.contextText
      ].join('\n')
      : '',
    continuity?.isFollowUp && continuity.bridgeLine
      ? `Continuity instruction: answer as a normal follow-up. Start from this prior frame instead of re-teaching the foundation: ${continuity.bridgeLine}`
      : '',
    continuity?.followUpType === 'action_recommendation'
      ? 'For this action follow-up, use a because/therefore bridge: because of the prior diagnosis, the next path to test is X. Do not restart with a generic brand-equity explanation.'
      : '',
    recent,
    '',
    `Current user question: ${question}`
  ].filter(Boolean).join('\n');
}

function cleanAnswerForSpeech(answer: string) {
  return answer
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/^-+\s*/gm, '')
    .replace(/\bQBR\b/g, 'Q B R')
    .replace(/\bBBE\b/g, 'B B E')
    .replace(/\bSMD\b/g, 'S M D')
    .replace(/\s+/g, ' ')
    .trim();
}

function scopedSpokenAnswer(answer: string, packet: BrandIntelligencePacket) {
  const cleaned = cleanAnswerForSpeech(answer);
  if (!cleaned) return fallbackFoundationAnswer(packet, '').spokenAnswer;
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [cleaned];
  const selected: string[] = [];
  for (const sentence of sentences) {
    const next = [...selected, sentence.trim()].join(' ');
    if (selected.length >= 1 && next.length >= 260) break;
    selected.push(sentence.trim());
    if (next.length >= 330 || selected.length >= 2) break;
  }
  const shortAnswer = selected.join(' ').slice(0, 380).trim() || cleaned.slice(0, 380).trim();
  return shortAnswer || fallbackFoundationAnswer(packet, '').spokenAnswer;
}

function conciseNextMoves(packet: BrandIntelligencePacket) {
  return [
    'Open the Data and Evidence Inspector.',
    'Build the meeting prep intelligence asset.',
    packet.treatmentOptions[0] ? 'Create a governed treatment recommendation workspace.' : 'Open the gaps and source-readiness view.'
  ].slice(0, 3);
}

function uniqueMoves(moves: string[], limit = 4) {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const move of moves) {
    const normalized = move.trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(normalized);
    if (cleaned.length >= limit) break;
  }
  return cleaned;
}

function matchExecutiveAssetDefinition(question: string) {
  const normalized = question.toLowerCase();
  const matches = getExecutiveIntelligenceAssetDefinitions()
    .map((definition) => ({
      definition,
      score: definition.triggerTerms.filter((term) => normalized.includes(term.toLowerCase())).length
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score);
  return matches[0]?.definition;
}

function suggestedNextMovesForQuestion(input: {
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
}) {
  if (input.intent.type !== 'answer_and_offer' && input.intent.type !== 'direct_answer') return [];
  const normalized = input.question.toLowerCase();
  const firstTreatment = input.packet.treatmentOptions[0]?.name;
  const matchedExecutiveAsset = matchExecutiveAssetDefinition(input.question);
  const moves: string[] = [];

  if (matchedExecutiveAsset) {
    moves.push(`Open the ${matchedExecutiveAsset.titlePrefix}.`);
  }

  if (includesAny(normalized, ['knowledge', 'data', 'source', 'evidence', 'proof', 'basis', 'access'])) {
    moves.push(
      'Open the Data and Evidence Inspector.',
      'Build the meeting prep intelligence asset with proof.',
      'Create a governed treatment recommendation workspace.'
    );
  }

  if (includesAny(normalized, ['campaign', 'packaging', 'promotion', 'promo', 'creative', 'activity', 'launched'])) {
    moves.push(
      'Build a follow-up proof plan.',
      'Open the Data and Evidence Inspector for activity proof gaps.',
      'Draft a governed brief with caveats.'
    );
  }

  if (includesAny(normalized, ['momentum', 'slipping', 'strong', 'trajectory', 'future health'])) {
    moves.push(
      'Build the meeting prep intelligence asset.',
      'Open the Data and Evidence Inspector.',
      firstTreatment ? `Create a governed treatment recommendation around ${firstTreatment}.` : 'Create a governed treatment recommendation workspace.',
      'Build a momentum learning path.'
    );
  }

  if (includesAny(normalized, ['learn', 'learning', 'teach', 'training', 'education', 'quiz', 'test me', 'practice'])) {
    moves.push(
      'Build an interactive learning workspace.',
      'Quiz me on this read.',
      'Show the active brand proof examples.'
    );
  }

  if (includesAny(normalized, ['what can i do', 'start impacting', 'action', 'treatment', 'fix', 'path', 'recommend'])) {
    moves.push(
      firstTreatment ? `Create a governed treatment recommendation around ${firstTreatment}.` : 'Create a governed treatment recommendation workspace.',
      'Open the Data and Evidence Inspector.',
      'Draft a team brief from this recommendation.'
    );
  }

  if (includesAny(normalized, ['cmo', 'leadership', 'meeting prep', 'meeting read', 'qbr', 'brand leads'])) {
    moves.push(
      'Build the meeting prep intelligence asset.',
      'Open the Data and Evidence Inspector.',
      'Draft a governed brief with proof and caveats.'
    );
  }

  moves.push(...conciseNextMoves(input.packet));
  return uniqueMoves(moves);
}

function appendSpokenOffer(input: {
  spokenAnswer: string;
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
}) {
  if (input.intent.type !== 'answer_and_offer') return input.spokenAnswer;
  const normalized = input.question.toLowerCase();
  const offer = includesAny(normalized, ['learn', 'learning', 'teach', 'training', 'quiz', 'practice'])
    ? 'I can also turn this into a learning workspace.'
    : includesAny(normalized, ['campaign', 'packaging', 'promotion', 'promo', 'creative', 'activity'])
      ? 'I can also build the proof plan to test that.'
      : includesAny(normalized, ['cmo', 'meeting prep', 'meeting read', 'qbr', 'leadership'])
        ? 'I can also turn this into a meeting prep draft.'
        : includesAny(normalized, ['what can i do', 'action', 'treatment', 'fix'])
          ? 'I can also build the treatment recommendation with proof.'
          : 'I can show the proof or build the next workspace if useful.';
  const combined = `${input.spokenAnswer.trim()} ${offer}`;
  return combined.length > 520 ? `${input.spokenAnswer.trim()} ${offer}`.slice(0, 520).trim() : combined;
}

function ensureCommercialBridge(answer: string, packet: BrandIntelligencePacket, question: string) {
  const normalizedQuestion = question.toLowerCase();
  const normalizedAnswer = answer.toLowerCase();
  const isMomentumAsk = includesAny(normalizedQuestion, ['momentum', 'slipping', 'strong', 'meeting prep', 'meeting read', 'qbr', 'demand power', 'meaningful']);
  const alreadyBridged = normalizedAnswer.includes('growth navigator') || normalizedAnswer.includes('commercial');
  if (!isMomentumAsk || alreadyBridged || !packet.dataCoverage.hasGrowthNavigator) return answer;

  const pressureVital = packet.growthNavigatorVitals.find((vital) => vital.status === 'pressure' || vital.status === 'watch');
  const signal = pressureVital?.keySignals.find(Boolean);
  const bridge = signal
    ? `Growth Navigator adds the commercial bridge: ${signal}`
    : `Growth Navigator adds the commercial bridge, but the current packet keeps that read directional rather than causal.`;
  return `${answer.trim()}\n\n${bridge}`;
}

function ensureMomentumFrame(answer: string, packet: BrandIntelligencePacket, question: string) {
  const normalizedQuestion = question.toLowerCase();
  const normalizedAnswer = answer.toLowerCase();
  const asksStrongButSlipping = includesAny(normalizedQuestion, ['slipping', 'strong', 'momentum', 'trajectory']);
  const diagnosisName = packet.diagnosisResult.primary.diagnosis.name.toLowerCase();
  const needsFrame = asksStrongButSlipping
    && diagnosisName.includes('strong but slipping')
    && !(normalizedAnswer.includes('strong') && (normalizedAnswer.includes('slipping') || normalizedAnswer.includes('weakening') || normalizedAnswer.includes('softening')));
  if (!needsFrame) return answer;
  return [
    `${packet.brand.brandName} is best framed as strong but slipping: the brand still has a strong equity base, but the loaded Momentum read shows softening that needs attention.`,
    answer.trim()
  ].join('\n\n');
}

function inferWorkSpec(input: {
  question: string;
  intent: UnifiedAssistantIntent;
  packet: BrandIntelligencePacket;
}): DynamicWorkSpec {
  const normalized = input.question.toLowerCase();
  const selectedTemplate = experienceTemplateRegistry.find((template) => template.id === input.intent.suggestedTemplateId);
  const qbrCompositionPlan = isQbrCompositionCandidate(input.question, input.intent.suggestedTemplateId)
    ? planQbrComposition({
      question: input.question,
      packet: input.packet,
      approvedViewIds: input.intent.suggestedViewIds
    })
    : undefined;
  const isLearningAsk = input.intent.suggestedTemplateId === 'learning-coach' || includesAny(normalized, learningSignals);
  const audience: ExperienceAudience = selectedTemplate?.audience ?? (isLearningAsk
    ? 'learner'
    : includesAny(normalized, ['cmo', 'meeting prep', 'meeting read', 'qbr', 'leadership', 'executive'])
    ? 'executive'
    : includesAny(normalized, ['treatment', 'brand manager', 'marketer'])
      ? 'marketer'
      : 'insights_lead');
  const objective: ExperienceObjective = selectedTemplate?.objective ?? (isLearningAsk
    ? 'teach'
    : includesAny(normalized, ['compare', 'peer', 'competitor'])
    ? 'compare'
    : includesAny(normalized, ['proof', 'evidence', 'trust', 'source'])
      ? 'challenge'
      : includesAny(normalized, ['report', 'meeting prep', 'meeting read', 'qbr', 'brief', 'deck', 'story'])
        ? 'package'
        : 'decide');
  const artifactType: DynamicWorkSpec['artifactType'] = input.intent.suggestedTemplateId === 'learning-coach'
    ? 'learning_practice'
    : input.intent.suggestedTemplateId === 'marketer-treatment-planning'
    ? 'treatment_path'
    : input.intent.suggestedTemplateId === 'competitive-comparison-lab'
      ? 'comparison'
      : input.intent.suggestedTemplateId === 'insights-evidence-lab'
        ? 'proof_pack'
        : input.intent.suggestedTemplateId.includes('source')
          ? 'source_readiness'
          : input.intent.suggestedTemplateId.includes('governance') || input.intent.suggestedTemplateId.includes('readiness') || input.intent.suggestedTemplateId.includes('review') || input.intent.suggestedTemplateId.includes('cockpit')
            ? 'governance_review'
            : input.intent.suggestedTemplateId === 'competitive-comparison-lab'
              ? 'comparison'
              : input.intent.suggestedTemplateId === 'executive-qbr-decision-read' || input.intent.suggestedTemplateId === 'executive-pilot-runbook' || input.intent.suggestedTemplateId === 'agency-brief-builder' || input.intent.suggestedTemplateId === 'live-meeting-capture'
                ? 'qbr_read'
                : 'workspace';
  const missingInputs = input.packet.evidenceGaps.map((gap) => gap.label).slice(0, 5);
  const approvedViewIds = qbrCompositionPlan?.approvedViewIds ?? input.intent.suggestedViewIds;
  const viewDataNeeds = approvedViewIds.map((viewId) => `${viewId.replaceAll('_', ' ')} view data`);

  return {
    id: 'dynamic-work-spec-v1',
    intent: input.intent.reason,
    audience,
    objective,
    artifactType,
    approvedSkillId: input.intent.suggestedSkillId,
    approvedTemplateId: input.intent.suggestedTemplateId,
    approvedViewIds,
    dataNeeds: selectedTemplate
      ? ['Brand Intelligence Packet', ...viewDataNeeds, 'approved dynamic views', 'human review gates'].slice(0, 8)
      : isLearningAsk
      ? ['approved learning modules', 'practice diagnostics', 'active brand example', 'guardrails', 'approved dynamic views']
      : ['Brand Intelligence Packet', 'diagnosis evidence', 'guardrails', 'approved dynamic views'],
    missingInputs,
    reviewGates: selectedTemplate?.guardrails.slice(0, 5) ?? ['Human review required before treating output as final', 'Export/circulation disabled', 'No canonical source writes'],
    canExecuteNow: qbrCompositionPlan?.confidence === 'low' ? false : true,
    qbrCompositionPlan
  };
}

function routerProofDisclosure(packet: BrandIntelligencePacket): AssistantProofDisclosure {
  return defaultProofDisclosure(packet);
}

function requestedSignalsForQuestion(question: string, answer: string) {
  const combined = `${question} ${answer}`.toLowerCase();
  const signals: string[] = [];
  const candidates: { signal: string; terms: string[] }[] = [
    { signal: 'post-activity BBE wave', terms: ['next bbe wave', 'post-activity', 'post activity', 'next wave'] },
    { signal: 'creative effectiveness', terms: ['creative effectiveness', 'campaign', 'creative lift'] },
    { signal: 'pack recognition and asset linkage', terms: ['packaging', 'pack recognition', 'asset linkage', 'distinctive asset'] },
    { signal: 'promotion effectiveness', terms: ['promotion', 'promo effectiveness', 'promo'] },
    { signal: 'occasion salience movement', terms: ['occasion salience', 'occasion'] },
    { signal: 'CEP movement', terms: ['cep', 'category entry point'] },
    { signal: 'mental availability trend', terms: ['mental availability', 'mental penetration', 'share of mind'] },
    { signal: 'retail or physical availability evidence', terms: ['retail', 'shelf', 'distribution', 'physical availability'] },
    { signal: 'media or social evidence', terms: ['media', 'social', 'search'] },
    { signal: 'sales/share or penetration evidence', terms: ['sales', 'share', 'penetration'] }
  ];
  for (const candidate of candidates) {
    if (candidate.terms.some((term) => combined.includes(term))) signals.push(candidate.signal);
  }
  return uniqueMoves(signals, 8);
}

function assessAssistantCoverage(input: {
  question: string;
  answer: string;
  intent: UnifiedAssistantIntent;
  proofDisclosure: AssistantProofDisclosure;
  packet: BrandIntelligencePacket;
}): AssistantCoverageAssessment {
  const answer = input.answer.toLowerCase();
  const question = input.question.toLowerCase();
  const requestedSignals = requestedSignalsForQuestion(input.question, input.answer);
  const missingEvidence = uniqueMoves([
    ...input.proofDisclosure.missingEvidence,
    ...missingEvidenceLabelsForQuestion(input.question).map((label) => `${label}: not fully available in the current packet`),
    ...requestedSignals.map((signal) => `${signal}: not fully available in the current packet`)
  ], 8);
  const explicitUnknown = includesAny(answer, [
    "i don't know",
    'i do not know',
    'cannot answer',
    'could not answer',
    'not enough evidence',
    'not enough data'
  ]);
  const outsideEvidenceCue = includesAny(answer, [
    'cannot confirm',
    'can not confirm',
    'current packet cannot',
    'not in the current packet',
    'not fully measured',
    'would need',
    'we need',
    'need post',
    'need follow-up',
    'outside the current evidence'
  ]);
  const externalAsk = includesAny(question, [
    'campaign',
    'packaging',
    'promotion',
    'promo',
    'latest',
    'recent',
    'social',
    'media',
    'retail',
    'sales',
    'share',
    'brand.com',
    'website',
    'ai search',
    'chatgpt',
    'gpt',
    'source authority',
    'structured data',
    'creative effectiveness',
    'pack recognition',
    'will that have an impact'
  ]);

  if (input.intent.type === 'approval_work_order') {
    return {
      id: 'assistant-coverage-assessment-v1',
      status: 'work_routed',
      reason: 'The request was routed into an approved governed work order before generating a final artifact.',
      logForEnhancement: false,
      requestedSignals,
      missingEvidence: input.proofDisclosure.missingEvidence.slice(0, 5)
    };
  }

  if (input.intent.type === 'fail_closed_governance') {
    return {
      id: 'assistant-coverage-assessment-v1',
      status: 'unable_to_answer',
      reason: 'The request asked for a blocked production, export, source truth, voice, approval, or autonomous capability.',
      logForEnhancement: true,
      requestedSignals: input.intent.blockedActions,
      missingEvidence: input.intent.blockedActions
    };
  }

  if (explicitUnknown) {
    return {
      id: 'assistant-coverage-assessment-v1',
      status: 'unable_to_answer',
      reason: 'The assistant explicitly could not answer from the current evidence.',
      logForEnhancement: true,
      requestedSignals,
      missingEvidence
    };
  }

  if (outsideEvidenceCue || externalAsk) {
    return {
      id: 'assistant-coverage-assessment-v1',
      status: 'outside_current_evidence',
      reason: 'The answer used current packet evidence but identified signals outside the current measured evidence.',
      logForEnhancement: true,
      requestedSignals,
      missingEvidence
    };
  }

  if (input.proofDisclosure.missingEvidence.length) {
    return {
      id: 'assistant-coverage-assessment-v1',
      status: 'answered_with_gaps',
      reason: 'The assistant answered from available evidence while keeping current packet gaps visible.',
      logForEnhancement: false,
      requestedSignals,
      missingEvidence: input.proofDisclosure.missingEvidence.slice(0, 5)
    };
  }

  return {
    id: 'assistant-coverage-assessment-v1',
    status: 'answered_from_evidence',
    reason: 'The assistant answered from the active brand packet and registered guardrails.',
    logForEnhancement: false,
    requestedSignals,
    missingEvidence: []
  };
}

function isAssistantSelfKnowledgeQuestion(question: string) {
  const normalized = question.toLowerCase();
  return includesAny(normalized, [
    'what is your job',
    'what do you do',
    'what can you do',
    'who are you',
    'what are you',
    'what is this',
    'what can this do',
    'how can you help',
    'introduce yourself',
    'introduce you',
    'introduce the assistant',
    'introduce this',
    'your role',
    'your purpose',
    'your capabilities'
  ]);
}

async function assistantSelfKnowledgeAnswer(question: string, packet: BrandIntelligencePacket): Promise<FoundationAssistantAnswer> {
  const manifest = buildAssistantCapabilityManifest(packet);
  const realityContext = buildAssistantRealityContext(packet, question);
  const brandName = manifest.brand.brandName;
  const workspaceLabels = manifest.governedWorkspaces
    .slice(0, 6)
    .map((workspace) => workspace.label)
    .join(', ');
  const blockedLabels = manifest.blockedCapabilities
    .slice(0, 5)
    .map((capability) => capability.label)
    .join(', ');
  const fallbackWrittenAnswer = [
    `I am the BBE Brand Assistant for ${brandName}: a brand equity strategist and governed workspace operator for this active brand.`,
    `${realityContext.capabilityBucketLines.join('\n')}`,
    `For ${brandName}, I am grounded in the loaded ${manifest.brand.period} packet: ${manifest.dataCoverage.metricCount} core metrics, ${manifest.dataCoverage.trendMetricCount} trend reads, ${manifest.dataCoverage.evidenceReadiness} evidence readiness, and the registered approved skills/views/templates. Example prototype workspaces I can build with approval include: ${workspaceLabels}.`,
    `I cannot invent data, make final prescriptions, export or circulate official artifacts, certify production readiness, write source truth, run autonomous work, or give SKU-level pricing advice. Blocked/gated capabilities include ${blockedLabels}.`
  ].join('\n\n');

  const intro = await composeAssistantIntroduction({ question, manifest });
  const composedWrittenAnswer = intro.writtenAnswer || fallbackWrittenAnswer;
  const hasCapabilityBuckets = realityContext.capabilityBucketLines
    .some((line) => composedWrittenAnswer.toLowerCase().includes(line.split(':')[0].toLowerCase()));
  const writtenAnswer = hasCapabilityBuckets
    ? composedWrittenAnswer
    : `${composedWrittenAnswer}\n\nCapability boundary:\n${realityContext.capabilityBucketLines.join('\n')}`;

  return {
    writtenAnswer,
    spokenAnswer: intro.spokenAnswer || `I am the BBE Brand Assistant for ${brandName}. I answer brand equity questions first, then can build approved proof, meeting prep, treatment, or learning workspaces with your approval.`,
    suggestedNextMoves: intro.suggestedNextMoves.length ? intro.suggestedNextMoves : manifest.starterQuestions.slice(1, 4),
    proofDisclosure: {
      evidenceBasis: [
        `Capability manifest generated from the active ${brandName} Brand Intelligence Packet.`,
        realityContext.sourcePeriodLine,
        `${manifest.approvedSkills.length} approved skills, ${manifest.approvedViews.length} approved voice-canvas views, and ${manifest.governedWorkspaces.length} governed workspaces are registered.`,
        `Runtime posture follows "${manifest.runtime.principle}" with ${manifest.runtime.readySurfaceCount} ready governed surfaces and ${manifest.runtime.gatedSurfaceCount + manifest.runtime.disabledSurfaceCount} gated or disabled surfaces.`,
        `Intro composed from assistant identity brief; composition source ${intro.validation.source}${intro.validation.model ? ` (${intro.validation.model})` : ''}.`
      ],
      missingEvidence: packet.evidenceGaps.map((gap) => `${gap.label}: ${gap.missingInput}`).slice(0, 3),
      guardrails: manifest.guardrails.slice(0, 5)
    },
    source: intro.validation.source === 'openai' ? 'openai' : 'grounded_fallback',
    model: intro.validation.model
  };
}

export function decideUnifiedAssistantIntent(question: string): UnifiedAssistantIntent {
  const trimmed = question.trim();
  const normalized = trimmed.toLowerCase();
  const suggestedSkillId = skillForQuestion(normalized);
  const template = templateForSkill(suggestedSkillId, trimmed);

  if (includesAny(normalized, governanceSignals)) {
    return {
      id: 'unified-assistant-intent-v1',
      type: 'fail_closed_governance',
      label: 'Governance Block',
      reason: 'The ask touches production, export, source truth, full voice, official approval, or autonomous capability gates.',
      requiresApproval: false,
      suggestedSkillId: 'inspect_runtime_governance',
      suggestedTemplateId: 'runtime-governance-cockpit',
      suggestedViewIds: ['runtime_governance_panel', 'capability_readiness_panel', 'provider_adapter_panel', 'runtime_quality_panel'],
      offers: ['Open governance readiness'],
      blockedActions: ['Production certification', 'Audit export', 'Canonical source writes', 'Full voice activation']
    };
  }

  if (impliesGovernedWork(normalized) || (trimmed.length > 220 && includesAny(normalized, workDeliverableSignals))) {
    return {
      id: 'unified-assistant-intent-v1',
      type: 'approval_work_order',
      label: 'Work Order',
      reason: 'The ask implies a governed executive read, data inspection, treatment recommendation, brief draft, or supporting workspace.',
      requiresApproval: true,
      suggestedSkillId,
      suggestedTemplateId: template.templateId,
      suggestedViewIds: template.viewIds,
      offers: ['Approve and build workspace'],
      blockedActions: []
    };
  }

  return {
    id: 'unified-assistant-intent-v1',
    type: includesAny(normalized, offerSignals) ? 'answer_and_offer' : 'direct_answer',
    label: includesAny(normalized, offerSignals) ? 'Answer And Offer' : 'Direct Answer',
    reason: 'The ask should be answered conversationally first using the scoped Brand Doctor brain.',
    requiresApproval: false,
    suggestedSkillId,
    suggestedTemplateId: template.templateId,
    suggestedViewIds: template.viewIds,
    offers: includesAny(normalized, offerSignals) ? ['Build the executive read', 'Open data and evidence'] : [],
    blockedActions: []
  };
}

export async function runUnifiedAssistantTurn(input: {
  brandId: string;
  question: string;
  personaId?: string;
  conversationMode?: string;
  activeWorkId?: string;
  conversationHistory?: AssistantConversationMessage[];
}): Promise<UnifiedAssistantResponse> {
  const record = brandRecords.find((brand) => brand.brandId === input.brandId) ?? brandRecords[0];
  const intent = decideUnifiedAssistantIntent(input.question);
  const packet = buildBrandIntelligencePacket(record.brandId);
  const activeWorkContext = buildActiveWorkContext(input.activeWorkId ? findBrandWorkItem(record, input.activeWorkId) : undefined);
  const continuity = buildConversationContinuity({
    question: input.question,
    conversationHistory: input.conversationHistory ?? [],
    packet
  });

  if (isAssistantSelfKnowledgeQuestion(input.question)) {
    const answer = await assistantSelfKnowledgeAnswer(input.question, packet);
    const selfIntent: UnifiedAssistantIntent = {
      ...intent,
      type: 'direct_answer',
      label: 'Direct Answer',
      reason: 'The user asked what the assistant is for, so answer from the product scope contract before offering work.',
      requiresApproval: false,
      offers: [],
      blockedActions: []
    };
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: record.brandId,
      question: input.question,
      intent: selfIntent,
      answer: answer.writtenAnswer,
      writtenAnswer: answer.writtenAnswer,
      spokenAnswer: answer.spokenAnswer,
      suggestedNextMoves: answer.suggestedNextMoves,
      proofDisclosure: answer.proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: answer.writtenAnswer,
        intent: selfIntent,
        proofDisclosure: answer.proofDisclosure,
        packet
      }),
      workSpec: null,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  if (intent.type === 'fail_closed_governance') {
    const answer = [
      'I cannot certify production readiness, export audit records, turn on full voice, or write source truth from this prototype.',
      'I can open the governance workspace that separates what is demo-ready from what still needs enterprise source, identity, persistence, approval, export, and voice governance.'
    ].join(' ');
    const proofDisclosure = routerProofDisclosure(packet);
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: record.brandId,
      question: input.question,
      intent,
      answer,
      writtenAnswer: answer,
      spokenAnswer: 'I cannot do that from this prototype. I can show the governance readiness workspace instead.',
      suggestedNextMoves: ['Open governance readiness', 'Show what remains gated'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec: {
        id: 'dynamic-work-spec-v1',
        intent: intent.reason,
        audience: 'insights_lead',
        objective: 'monitor',
        artifactType: 'governance_review',
        approvedSkillId: intent.suggestedSkillId,
        approvedTemplateId: intent.suggestedTemplateId,
        approvedViewIds: intent.suggestedViewIds,
        dataNeeds: ['runtime governance', 'capability flags', 'provider gates', 'review gates'],
        missingInputs: ['enterprise identity approval', 'export governance', 'canonical source governance', 'full voice governance'],
        reviewGates: ['Production certification blocked', 'Audit export blocked', 'Canonical source writes blocked', 'Full voice activation blocked'],
        canExecuteNow: false
      },
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  const continuityActionAnswer = continuityActionRecommendationAnswer({
    question: input.question,
    intent,
    packet,
    continuity
  });
  if (continuityActionAnswer) return continuityActionAnswer;

  const activeWorkAnswer = activeWorkFollowUpAnswer({
    question: input.question,
    intent,
    packet,
    activeWorkContext
  });
  if (activeWorkAnswer) return activeWorkAnswer;

  const deterministicAnswer = deterministicEquityReasoningAnswer({
    question: input.question,
    intent,
    packet
  });
  if (deterministicAnswer) return deterministicAnswer;

  if (intent.type === 'approval_work_order') {
    const workSpec = inferWorkSpec({ question: input.question, intent, packet });
    const realityContext = buildAssistantRealityContext(packet, input.question);
    const activeWorkLine = activeWorkContext
      ? `Active work context: revise or extend "${activeWorkContext.title}" (${activeWorkContext.templateName}) inside its current proof contract: ${activeWorkContext.proofSummary.evidence} evidence items, ${activeWorkContext.proofSummary.gaps} gaps, ${activeWorkContext.proofSummary.gates} review gates; export remains ${activeWorkContext.exportState}.`
      : '';
    const templateLabel = experienceTemplateRegistry.find((template) => template.id === intent.suggestedTemplateId)?.name
      ?? intent.suggestedTemplateId.replaceAll('-', ' ');
    const workspaceLabel = safeWorkOrderLabel(templateLabel);
    const composition = workSpec.qbrCompositionPlan;
    const modeLabel = composition ? displayCompositionMode(composition.compositionMode) : workSpec.artifactType.replaceAll('_', ' ');
    const moduleLabel = composition?.selectedModules.slice(0, 5).map((moduleId) => moduleId.replaceAll('_', ' ')).join(', ');
    const viewLabel = workSpec.approvedViewIds.map((viewId) => viewId.replaceAll('_', ' ')).join(', ');
    const needsClarification = Boolean(composition?.clarifyingQuestion && !workSpec.canExecuteNow);
    const writtenAnswer = needsClarification && composition?.clarifyingQuestion
      ? [
        `I can build this, but the output goal is still a little broad for a useful artifact.`,
        composition.clarifyingQuestion,
        `If you want me to proceed with my default, I would create a ${modeLabel} for ${record.brandName} using ${moduleLabel}. ${realityContext.sourcePeriodLine}`,
        realityContext.shareExportLine
      ].join('\n\n')
      : [
        `I can turn that into the ${workspaceLabel} ${realityContext.workOrderLabel} for ${record.brandName}.`,
        activeWorkLine,
        composition
          ? `Planned composition: ${modeLabel}. Goal: ${composition.goal} Decision supported: ${composition.decision}`
          : `${realityContext.sourcePeriodLine} I will build it with approved views for ${viewLabel}, then keep proof, gaps, and review notes visible on the work canvas.`,
        composition
          ? `I will assemble approved modules for ${moduleLabel}, with views for ${viewLabel}. ${realityContext.sourcePeriodLine}`
          : '',
        realityContext.shareExportLine,
        realityContext.workOrderApprovalAsk
      ].filter(Boolean).join('\n\n');
    const proofDisclosure = routerProofDisclosure(packet);
    return {
      ok: true,
      id: 'unified-assistant-response-v1',
      brandId: record.brandId,
      question: input.question,
      intent,
      answer: writtenAnswer,
      writtenAnswer,
      spokenAnswer: needsClarification
        ? `I can build it, but I need the goal narrowed first: C M O review, evidence check, treatment read, or readiness review.`
        : `I can build a ${modeLabel} review draft with proof, gaps, and review notes visible. Want me to create it?`,
      suggestedNextMoves: needsClarification
        ? ['Make it a CMO meeting prep read.', 'Make it an evidence read.', 'Make it a treatment read.', 'Make it an assumption readiness read.']
        : composition?.nextBestActions.length
          ? ['Approve and build it', ...composition.nextBestActions.slice(0, 3)]
          : ['Approve and build it', 'Refine the ask first', 'Show the proof before building'],
      proofDisclosure,
      coverageAssessment: assessAssistantCoverage({
        question: input.question,
        answer: writtenAnswer,
        intent,
        proofDisclosure,
        packet
      }),
      workSpec,
      source: 'assistant_router',
      model: null,
      grounding: 'assistant_router'
    };
  }

  const scopedAnswer = await answerWithBrandDoctorLlm({
    question: scopedQuestionWithHistory(input.question, input.conversationHistory ?? [], continuity, activeWorkContext),
    brandId: record.brandId,
    category: record.category,
    mode: 'insights',
    activeVisual: 'brand_health_panel',
    personaId: input.personaId ?? 'brand_doctor',
    conversationMode: input.conversationMode ?? 'explore'
  });
  const fallback = fallbackFoundationAnswer(packet, input.question);
  const rawScopedAnswer = scopedAnswer.answer.trim();
  const hasTypologyPolicyBreach = rawScopedAnswer
    ? hasUnrequestedTypologyLanguage(rawScopedAnswer, input.question)
    : false;
  const scopedWrittenAnswer = rawScopedAnswer && !hasTypologyPolicyBreach
    ? ensureMomentumFrame(ensureCommercialBridge(scopedAnswer.answer, packet, input.question), packet, input.question)
    : '';
  const realityBoundedWrittenAnswer = scopedWrittenAnswer
    ? applyRealityBoundaryToAnswer(scopedWrittenAnswer, packet, input.question)
    : '';
  const answer: FoundationAssistantAnswer = scopedWrittenAnswer
    ? {
        writtenAnswer: realityBoundedWrittenAnswer,
        spokenAnswer: appendSpokenOffer({
          spokenAnswer: scopedSpokenAnswer(realityBoundedWrittenAnswer, packet),
          question: input.question,
          intent,
          packet
        }),
        suggestedNextMoves: suggestedNextMovesForQuestion({ question: input.question, intent, packet }).length
          ? suggestedNextMovesForQuestion({ question: input.question, intent, packet })
          : fallback.suggestedNextMoves,
        proofDisclosure: defaultProofDisclosure(packet),
        source: scopedAnswer.source,
        model: scopedAnswer.model
      }
    : {
        ...fallback,
        source: 'grounded_fallback',
        model: null
      };
  const grounding: UnifiedAssistantResponse['grounding'] = scopedWrittenAnswer ? 'scoped_primary' : 'scoped_fallback';
  const coverageAssessment = assessAssistantCoverage({
    question: input.question,
    answer: answer.writtenAnswer,
    intent,
    proofDisclosure: answer.proofDisclosure,
    packet
  });

  return {
    ok: true,
    id: 'unified-assistant-response-v1',
    brandId: record.brandId,
    question: input.question,
    intent,
    answer: answer.writtenAnswer,
    writtenAnswer: answer.writtenAnswer,
    spokenAnswer: answer.spokenAnswer,
    suggestedNextMoves: answer.suggestedNextMoves,
    proofDisclosure: answer.proofDisclosure,
    coverageAssessment,
    workSpec: null,
    source: answer.source,
    model: answer.model,
    grounding
  };
}
