import artifactReadinessRequirementsJson from '@/src/data/config/artifact-readiness-requirements.json';
import {
  experienceTemplateRegistry,
  findDynamicView,
  findExperienceTemplate
} from '@/src/lib/intelligence/kernel';
import type {
  AgentSkillRouterResult,
  BbeMomentumIntelligenceRead,
  BrandIntelligencePacket,
  DynamicViewRequest,
  ExperienceArtifact,
  ExperienceArtifactReadiness,
  ExperienceArtifactType,
  ExperienceAudience,
  ExperienceObjective,
  ExperiencePlan,
  ExperienceTemplateDefinition,
  ExperienceViewManifestRecord,
  ExperienceZone,
  GroundedAgentAnswer,
  HumanApprovalRequirement
} from '@/src/lib/intelligence/types';

const artifactReadinessRequirements = artifactReadinessRequirementsJson as {
  requirements: Array<Omit<ExperienceArtifactReadiness, 'currentStatus' | 'exportBlocked' | 'blockers' | 'nextAction'> & {
    nextActionWhenBlocked: string;
  }>;
};

type PlanExperienceInput = {
  question: string;
  result: Omit<AgentSkillRouterResult, 'experiencePlan'>;
  preferredAudience?: ExperienceAudience;
  preferredObjective?: ExperienceObjective;
  preferredTemplateId?: string;
};

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function asksForPilotLearning(value: string) {
  return includesAny(value, ['pilot learning', 'learning summary', 'session learning', 'learning signals', 'what are we learning', 'what did we learn', 'learn from this session', 'what can we learn', 'what should we learn', 'learning loop']);
}

function asksForQuietProactivity(value: string) {
  return includesAny(value, ['quiet proactivity', 'follow up', 'follow-up', 'followups', 'held notice', 'held notices', 'reminder', 'reminders', 'what should we revisit', 'what should happen next', 'next follow-up']);
}

function asksForVoiceReadiness(value: string) {
  return includesAny(value, ['voice readiness', 'voice gates', 'jarvis readiness', 'jarvis-style', 'realtime voice', 'continuous voice', 'tts', 'provider adapter', 'provider adapters', 'wake listen', 'wake/listen']);
}

function asksForPersistenceReadiness(value: string) {
  return includesAny(value, ['persistence readiness', 'enterprise persistence', 'durable memory', 'durable audit', 'local json', 'database readiness', 'retention privacy', 'backup recovery']);
}

function asksForSourcePromotionReadiness(value: string) {
  return includesAny(value, ['source promotion readiness', 'source claim promotion', 'canonical source promotion', 'canonical facts', 'source candidates', 'source claims', 'source promotion blockers', 'runtime source consumption', 'reviewed local source']);
}

function asksForTreatmentOutcomeReadiness(value: string) {
  return includesAny(value, ['treatment outcome readiness', 'treatment outcomes', 'outcome learning', 'efficacy readiness', 'treatment efficacy', 'follow-up signals', 'outcome records', 'portfolio learning', 'canonical learning', 'learning governance']);
}

function asksForRuntimeGovernance(value: string) {
  return includesAny(value, ['runtime governance', 'runtime control', 'kill switch', 'capability flags', 'runtime surfaces', 'surface readiness', 'surface map', 'governed surfaces', 'provider gates', 'which surfaces are ready']);
}

function asksForFoundationReadiness(value: string) {
  return includesAny(value, ['foundation readiness', 'platform readiness', 'brand growth intelligence foundation', 'cmo readiness', 'fundable foundation', 'foundation control plane', 'control plane', 'is the foundation ready', 'what is ready', 'what is gated']);
}

function asksForExecutivePilot(value: string) {
  return includesAny(value, ['executive pilot', 'cmo pilot', 'funding demo', 'sponsor runbook', 'demo runbook', 'pilot runbook', 'show the pilot path', 'make the case to fund', 'holy shit demo', 'jaw drop demo']);
}

function asksForExperienceArchitecture(value: string) {
  return includesAny(value, ['experience architecture', 'experience plan readiness', 'dynamic ui foundation', 'workspace builder', 'build the right workspace', 'role specific workspace', 'role-specific workspace', 'approved templates', 'approved views', 'compose ui', 'new user workspace']);
}

function asksForArtifactReadiness(value: string) {
  return includesAny(value, ['artifact readiness', 'export readiness', 'circulation readiness', 'can we share this', 'can we export', 'artifact gates', 'qbr draft readiness', 'meeting artifact readiness', 'agency brief readiness']);
}

function asksForDraftArtifact(value: string) {
  return includesAny(value, ['draft a', 'draft an', 'draft qbr', 'draft the', 'write a', 'write an', 'make a memo', 'create talk track', 'create a talk track', 'write agency brief', 'agency brief', 'make slides', 'slide outline', 'package this']);
}

function asksForDataBasis(value: string) {
  return includesAny(value, ['actual data', 'data basis', 'data behind', 'data you are working with', 'data are you working with', 'what data are you using', 'what data did you use', 'show me the data', 'show the data', 'source data', 'raw data behind', 'metric basis']);
}

function inferAudience(question: string, skillId: string): ExperienceAudience {
  const q = normalized(question);
  if (asksForExecutivePilot(q) || skillId === 'plan_executive_pilot') return 'executive';
  if (asksForFoundationReadiness(q) || skillId === 'inspect_foundation_readiness') return 'executive';
  if (asksForExperienceArchitecture(q)) return 'insights_lead';
  if (asksForArtifactReadiness(q)) return 'insights_lead';
  if (asksForSourcePromotionReadiness(q)) return 'insights_lead';
  if (asksForRuntimeGovernance(q)) return 'insights_lead';
  if (asksForTreatmentOutcomeReadiness(q)) return 'insights_lead';
  if (asksForPersistenceReadiness(q)) return 'insights_lead';
  if (asksForVoiceReadiness(q)) return 'insights_lead';
  if (asksForQuietProactivity(q)) return 'insights_lead';
  if (asksForPilotLearning(q)) return 'insights_lead';
  if (includesAny(q, ['agency', 'brief', 'creative partner', 'partner brief']) && asksForDraftArtifact(q)) return 'agency';
  if (includesAny(q, ['teach', 'learn', 'quiz', 'test me', 'practice'])) return 'learner';
  if (includesAny(q, ['review queue', 'review workflow', 'review operations', 'audit session', 'pending approval', 'pending approvals', 'pending review', 'what needs review', 'review state', 'session review', 'audit trail', 'human decisions'])) return 'insights_lead';
  if (includesAny(q, ['meeting takeaway', 'capture decision', 'capture decisions', 'final takeaway', 'meeting recap', 'workshop recap', 'takeaway', 'recap'])) return 'executive';
  if (includesAny(q, ['cmo', 'executive', 'leadership', 'boardroom', 'qbr', 'bgs'])) return 'executive';
  if (includesAny(q, ['source readiness', 'source-owner', 'source owner', 'source bundle', 'extract bundle', 'source intake', 'handoff bundle', 'import bundle', 'upload extract', 'approved extract', 'executive use', 'readiness blocker', 'readiness blocks'])) return 'insights_lead';
  if (asksForDataBasis(q)) return 'insights_lead';
  if (includesAny(q, ['evidence', 'proof', 'trace', 'rule', 'pressure-test', 'challenge', 'insights'])) return 'insights_lead';
  if (includesAny(q, ['treatment', 'action', 'test first', 'now what', 'brand manager', 'marketer'])) return 'marketer';
  if (skillId === 'draft_meeting_story' || skillId === 'bbe_momentum_intelligence_read') return 'executive';
  if (skillId === 'explain_diagnosis_evidence') return 'insights_lead';
  if (skillId === 'create_growth_provocations') return 'marketer';
  return 'insights_lead';
}

function inferObjective(question: string, skillId: string): ExperienceObjective {
  const q = normalized(question);
  if (asksForExecutivePilot(q) || skillId === 'plan_executive_pilot') return 'package';
  if (asksForFoundationReadiness(q) || skillId === 'inspect_foundation_readiness') return 'monitor';
  if (asksForExperienceArchitecture(q)) return 'monitor';
  if (asksForArtifactReadiness(q)) return 'monitor';
  if (asksForSourcePromotionReadiness(q)) return 'monitor';
  if (asksForRuntimeGovernance(q)) return 'monitor';
  if (asksForTreatmentOutcomeReadiness(q)) return 'monitor';
  if (asksForPersistenceReadiness(q)) return 'monitor';
  if (asksForVoiceReadiness(q)) return 'monitor';
  if (asksForQuietProactivity(q)) return 'monitor';
  if (asksForPilotLearning(q)) return 'monitor';
  if (includesAny(q, ['teach', 'learn', 'quiz', 'test me', 'practice'])) return 'teach';
  if (includesAny(q, ['review queue', 'review workflow', 'review operations', 'audit session', 'pending approval', 'pending approvals', 'pending review', 'what needs review', 'review state', 'session review', 'audit trail', 'human decisions'])) return 'monitor';
  if (includesAny(q, ['meeting takeaway', 'capture decision', 'capture decisions', 'final takeaway', 'meeting recap', 'workshop recap', 'takeaway', 'recap'])) return 'package';
  if (asksForDraftArtifact(q)) return 'package';
  if (includesAny(q, ['compare', 'competitor', 'peer'])) return 'compare';
  if (includesAny(q, ['source readiness', 'source-owner', 'source owner', 'source bundle', 'extract bundle', 'source intake', 'handoff bundle', 'import bundle', 'upload extract', 'approved extract', 'executive use', 'readiness blocker', 'readiness blocks'])) return 'research';
  if (asksForDataBasis(q)) return 'challenge';
  if (includesAny(q, ['evidence', 'proof', 'trace', 'rule', 'pressure-test', 'challenge', 'complicate'])) return 'challenge';
  if (includesAny(q, ['monitor', 'watch', 'follow up'])) return 'monitor';
  if (includesAny(q, ['research', 'source', 'claim extraction'])) return 'research';
  if (skillId === 'draft_meeting_story') return 'package';
  if (skillId === 'explain_diagnosis_evidence') return 'challenge';
  return 'decide';
}

function templateScore(template: ExperienceTemplateDefinition, question: string, audience: ExperienceAudience, objective: ExperienceObjective, skillId: string) {
  const q = normalized(question);
  let score = 0;
  if (template.audience === audience) score += 8;
  if (template.objective === objective) score += 5;
  if (template.requiredSkillIds.includes(skillId)) score += 4;
  for (const term of template.triggerTerms) {
    if (q.includes(term)) score += 2;
  }
  return score;
}

function chooseTemplate(input: PlanExperienceInput): ExperienceTemplateDefinition {
  if (input.preferredTemplateId) {
    const preferred = findExperienceTemplate(input.preferredTemplateId);
    if (preferred) return preferred;
  }
  if (input.result.routedSkillId === 'inspect_foundation_readiness') {
    const foundationTemplate = findExperienceTemplate('foundation-readiness-cockpit');
    if (foundationTemplate) return foundationTemplate;
  }
  if (input.result.routedSkillId === 'plan_executive_pilot') {
    const executivePilotTemplate = findExperienceTemplate('executive-pilot-runbook');
    if (executivePilotTemplate) return executivePilotTemplate;
  }
  if (input.result.routedSkillId === 'inspect_runtime_governance') {
    const runtimeTemplate = findExperienceTemplate('runtime-governance-cockpit');
    if (runtimeTemplate) return runtimeTemplate;
  }

  const audience = input.preferredAudience ?? inferAudience(input.question, input.result.routedSkillId);
  const objective = input.preferredObjective ?? inferObjective(input.question, input.result.routedSkillId);
  const ranked = [...experienceTemplateRegistry]
    .map((template) => ({
      template,
      score: templateScore(template, input.question, audience, objective, input.result.routedSkillId)
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.template ?? experienceTemplateRegistry[0];
}

function isViewDataAvailable(viewId: string, packet: BrandIntelligencePacket) {
  if (!findDynamicView(viewId)) return false;
  if (viewId === 'momentum_room_to_grow_grid') return packet.roomToGrow.status !== 'missing';
  if (viewId === 'qbr_story_draft') return packet.treatmentOptions.length > 0 && packet.starterProvocations.length > 0;
  if (viewId === 'smd_driver_map') return Boolean(packet.metrics.Salient && packet.metrics.Meaningful && packet.metrics.Different);
  if (viewId === 'data_basis_inspector') return Object.keys(packet.metrics).length > 0;
  return true;
}

function zoneFromTemplate(
  template: ExperienceTemplateDefinition,
  zoneDefinition: ExperienceTemplateDefinition['zones'][number],
  packet: BrandIntelligencePacket,
  viewRequestById: Map<string, DynamicViewRequest>
): ExperienceZone {
  const matchingRequest = viewRequestById.get(zoneDefinition.viewId);
  const requiredDataAvailable = matchingRequest?.requiredDataAvailable ?? isViewDataAvailable(zoneDefinition.viewId, packet);
  return {
    id: zoneDefinition.id,
    title: zoneDefinition.title,
    purpose: zoneDefinition.purpose,
    viewId: zoneDefinition.viewId,
    skillId: zoneDefinition.requiredSkillId,
    priority: zoneDefinition.priority,
    evidenceRequired: zoneDefinition.evidenceRequired,
    requiredDataAvailable,
    fallbackViewId: requiredDataAvailable ? matchingRequest?.fallbackViewId : matchingRequest?.fallbackViewId ?? 'data_gap_panel',
    reason: matchingRequest?.reason ?? `Included by the ${template.name} experience template.`
  };
}

function labelForArtifact(type: ExperienceArtifactType, packet: BrandIntelligencePacket) {
  const labels: Record<ExperienceArtifactType, string> = {
    qbr_story_draft: `${packet.brand.brandName} QBR story draft`,
    talk_track: `${packet.brand.brandName} talk track`,
    agency_brief: `${packet.brand.brandName} agency brief`,
    evidence_packet: `${packet.brand.brandName} evidence packet`,
    learning_practice: `${packet.brand.brandName} learning practice`,
    decision_note: `${packet.brand.brandName} decision note`
  };
  return labels[type];
}

function artifactStatus(type: ExperienceArtifactType, answer: GroundedAgentAnswer | BbeMomentumIntelligenceRead): ExperienceArtifact['status'] {
  if (type === 'qbr_story_draft' && answer.dynamicViewRequests.some((request) => request.viewId === 'qbr_story_draft')) return 'draft_ready';
  if (type === 'decision_note' && answer.dynamicViewRequests.some((request) => request.viewId === 'meeting_takeaway_panel')) return 'draft_ready';
  if (type === 'evidence_packet' && answer.evidence.length > 0) return 'available';
  return 'planned';
}

function humanReviewRequired(approval: HumanApprovalRequirement) {
  return approval !== 'not_required';
}

function preferredArtifactViews(type: ExperienceArtifactType) {
  const views: Record<ExperienceArtifactType, string[]> = {
    qbr_story_draft: ['qbr_story_draft', 'evidence_ledger', 'data_gap_panel'],
    talk_track: ['qbr_story_draft', 'evidence_ledger', 'growth_provocation_list', 'data_gap_panel'],
    agency_brief: ['qbr_story_draft', 'growth_provocation_list', 'data_gap_panel'],
    evidence_packet: ['source_readiness_panel', 'diagnosis_trace_summary', 'evidence_ledger', 'smd_driver_map', 'data_gap_panel'],
    learning_practice: ['learning_explainer', 'quiz_card', 'kpi_strip'],
    decision_note: ['meeting_takeaway_panel', 'growth_provocation_list', 'treatment_path_card', 'evidence_ledger', 'data_gap_panel']
  };
  return views[type];
}

function artifactCirculationStatus(approval: HumanApprovalRequirement): ExperienceArtifact['governance']['circulationStatus'] {
  return approval === 'not_required' ? 'not_for_circulation' : 'review_required';
}

function artifactCaveats(type: ExperienceArtifactType, template: ExperienceTemplateDefinition, packet: BrandIntelligencePacket) {
  const caveats = new Set<string>([
    'Generated artifact is a prototype draft and must not be treated as an approved final deliverable.',
    'Export and circulation remain disabled until human-review and stakeholder language gates are approved.'
  ]);
  if (template.humanApproval !== 'not_required') {
    caveats.add('Human review is required before this artifact can be circulated outside the working session.');
  }
  if (packet.strategicContext.status !== 'available' && ['agency_brief', 'talk_track', 'qbr_story_draft'].includes(type)) {
    caveats.add('Brand Strategic Context is not fully available; do not infer approved positioning, creative platform, objectives, or claims.');
  }
  return Array.from(caveats);
}

function artifactReadinessFor(input: {
  type: ExperienceArtifactType;
  reviewRequirement: HumanApprovalRequirement;
  circulationStatus: ExperienceArtifact['governance']['circulationStatus'];
  sourceViewIds: string[];
  evidenceLabels: string[];
  packet: BrandIntelligencePacket;
}): ExperienceArtifactReadiness {
  const requirement = artifactReadinessRequirements.requirements.find((item) => item.artifactType === input.type);
  const currentStatus = input.circulationStatus;
  const blockers = [
    input.reviewRequirement !== 'not_required' && currentStatus !== 'reviewed_for_prototype'
      ? `${requirement?.reviewerRole ?? 'Human reviewer'} review is required before circulation.`
      : '',
    input.evidenceLabels.length === 0
      ? 'No evidence labels are attached to this artifact yet.'
      : '',
    requirement?.requiredSourceViews.some((viewId) => !input.sourceViewIds.includes(viewId))
      ? 'One or more expected source views are not present in the active ExperiencePlan.'
      : '',
    input.packet.strategicContext.status !== 'available' && ['agency_brief', 'talk_track', 'qbr_story_draft'].includes(input.type)
      ? 'Official Brand Strategic Context is not fully available for strategy or claim language.'
      : '',
    'Artifact export capability is disabled by governance.'
  ].filter(Boolean);

  return {
    artifactType: input.type,
    reviewerRole: requirement?.reviewerRole ?? 'Human reviewer',
    requiredEvidence: requirement?.requiredEvidence ?? ['evidence labels', 'source caveats'],
    requiredLanguageApprovals: requirement?.requiredLanguageApprovals ?? ['human language review'],
    requiredSourceViews: requirement?.requiredSourceViews ?? input.sourceViewIds,
    promotionGate: requirement?.promotionGate ?? 'artifact_circulation_review',
    exportGate: requirement?.exportGate ?? 'artifact_export_capability',
    currentStatus,
    exportBlocked: true,
    blockers,
    guardrails: requirement?.guardrails ?? ['Generated artifacts require human review before circulation.'],
    nextAction: blockers.length
      ? requirement?.nextActionWhenBlocked ?? 'Review the artifact, evidence, caveats, and gates before circulation.'
      : 'Artifact is reviewed for prototype use; export remains disabled until the export capability is approved.'
  };
}

function artifactsFor(
  template: ExperienceTemplateDefinition,
  packet: BrandIntelligencePacket,
  answer: GroundedAgentAnswer | BbeMomentumIntelligenceRead,
  zones: ExperienceZone[],
  guardrails: string[]
): ExperienceArtifact[] {
  const sourceSkillId = answer.skillId;
  const zoneViewIds = zones.map((zone) => zone.requiredDataAvailable ? zone.viewId : zone.fallbackViewId ?? zone.viewId);
  const evidenceLabels = answer.evidence.slice(0, 8).map((item) => item.label);
  return template.artifactTypes.map((type) => {
    const reviewRequirement = template.humanApproval;
    const circulationStatus = artifactCirculationStatus(reviewRequirement);
    const sourceViewIds = preferredArtifactViews(type).filter((viewId) => zoneViewIds.includes(viewId));
    const readiness = artifactReadinessFor({
      type,
      reviewRequirement,
      circulationStatus,
      sourceViewIds,
      evidenceLabels,
      packet
    });
    return {
      id: `${template.id}-${type}`,
      type,
      label: labelForArtifact(type, packet),
      status: artifactStatus(type, answer),
      humanReviewRequired: humanReviewRequired(reviewRequirement),
      sourceSkillId,
      governance: {
        reviewRequirement,
        circulationStatus,
        reviewGateId: humanReviewRequired(reviewRequirement) ? `${template.id}-${type}-circulation-gate` : undefined,
        exportEnabled: false,
        sourceViewIds,
        evidenceLabels,
        guardrails: guardrails.slice(0, 8),
        caveats: artifactCaveats(type, template, packet),
        readiness
      }
    }
  });
}

function viewManifestFor(zones: ExperienceZone[]): ExperienceViewManifestRecord[] {
  return zones.map((zone) => {
    const requestedView = findDynamicView(zone.viewId);
    const renderedViewId = zone.requiredDataAvailable ? zone.viewId : zone.fallbackViewId ?? zone.viewId;
    const renderedView = findDynamicView(renderedViewId);
    const view = renderedView ?? requestedView;
    const dataStatus: ExperienceViewManifestRecord['dataStatus'] = !view
      ? 'unknown_view'
      : zone.requiredDataAvailable
        ? 'ready'
        : 'fallback';

    return {
      zoneId: zone.id,
      viewId: zone.viewId,
      renderedViewId,
      viewName: view?.name ?? renderedViewId,
      family: view?.family ?? 'unknown',
      purpose: view?.purpose ?? zone.purpose,
      skillId: zone.skillId,
      requiredData: view?.requiredData ?? [],
      dataStatus,
      evidenceRequired: zone.evidenceRequired || Boolean(view?.evidenceRequired),
      claimTypes: view?.claimTypes ?? [],
      supportedModes: view?.supportedModes ?? [],
      guardrails: view?.guardrails ?? [],
      reason: zone.reason,
      fallbackReason: zone.requiredDataAvailable
        ? undefined
        : `Requested ${zone.viewId} but rendered ${renderedViewId} because required data was not available.`
    };
  });
}

export function planExperience(input: PlanExperienceInput): ExperiencePlan {
  const template = chooseTemplate(input);
  const { packet, answer } = input.result;
  const viewRequestById = new Map(answer.dynamicViewRequests.map((request) => [request.viewId, request]));
  const zones = template.zones
    .map((zone) => zoneFromTemplate(template, zone, packet, viewRequestById))
    .sort((a, b) => a.priority - b.priority);
  const fallbackUsed = zones.some((zone) => !zone.requiredDataAvailable);
  const guardrails = Array.from(new Set([
    ...template.guardrails,
    ...answer.guardrailsApplied,
    ...packet.agentGuardrails
  ]));

  return {
    planId: `${packet.brand.brandId}-${template.id}`,
    templateId: template.id,
    title: `${template.name}: ${packet.brand.brandName}`,
    summary: `${template.purpose} This plan uses approved skills and dynamic views only; unsupported zones fall back to explicit gap states.`,
    audience: template.audience,
    objective: template.objective,
    layout: template.layout,
    brandId: packet.brand.brandId,
    brandName: packet.brand.brandName,
    requiredSkillIds: template.requiredSkillIds,
    zones,
    viewManifest: viewManifestFor(zones),
    artifacts: artifactsFor(template, packet, answer, zones, guardrails),
    evidenceNeeds: packet.evidenceGaps,
    guardrails,
    humanApproval: template.humanApproval,
    humanReviewRequired: humanReviewRequired(template.humanApproval),
    fallbackUsed
  };
}
