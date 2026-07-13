import {
  agentAnswerToMarkdown,
  routeAgentSkill
} from '@/src/lib/intelligence/skill-router';
import persistenceReadinessRequirementsJson from '@/src/data/config/persistence-readiness-requirements.json';
import agentReviewIdentityPolicyJson from '@/src/data/config/agent-review-identity-policy.json';
import voiceSkillViewContractJson from '@/src/data/config/voice-skill-view-contract.json';
import voiceOrchestrationReadinessRequirementsJson from '@/src/data/config/voice-orchestration-readiness-requirements.json';
import treatmentOutcomeReadinessRequirementsJson from '@/src/data/config/treatment-outcome-readiness-requirements.json';
import { agentCapabilityRegistry, agentRuntimePolicy, agentSkillRegistry, agentVoicePolicy, dynamicViewRegistry, experienceTemplateRegistry, findDynamicView, findExperienceTemplate } from '@/src/lib/intelligence/kernel';
import { governedRuntimeSurfaceRegistry } from '@/src/lib/intelligence/runtime-surface-registry';
import type {
  AgentCapabilityDefinition,
  AgentAuditRecord,
  AgentCanvasStateManifest,
  AgentConversationPresenceManifest,
  AgentConfirmationGate,
  AgentEvidenceSpotlight,
  AgentEvidenceSpotlightClaimType,
  AgentEvidenceSpotlightSupportStatus,
  AgentExperienceArchitectureManifest,
  AgentInterruptionRecoveryManifest,
  AgentMemoryRecord,
  AgentPersistenceReadinessManifest,
  AgentPilotLearningManifest,
  AgentPilotLearningSignal,
  AgentProactivityManifest,
  AgentReviewIdentityManifest,
  AgentReviewIdentityPolicy,
  AgentProactivitySuggestion,
  AgentProviderAdapterManifest,
  AgentReasoningStatusManifest,
  AgentReasoningStatusPhase,
  AgentRuntimeControlManifest,
  AgentRuntimeSurfaceManifest,
  AgentSkillRouterInput,
  AgentSourceGovernanceManifest,
  AgentRuntimeQualityCheck,
  AgentTreatmentOutcomeReadinessManifest,
  AgentTreatmentOutcomeReadinessPolicy,
  AgentTurnEvent,
  AgentTurnEventType,
  AgentTurnResult,
  AgentVoiceOrchestrationReadinessManifest,
  AgentVoiceSkillViewContractManifest,
  AgentWorkingContextManifest,
  AgentVoiceRuntimeManifest
} from '@/src/lib/intelligence/types';

const voiceSkillViewContract = voiceSkillViewContractJson as {
  id: AgentVoiceSkillViewContractManifest['contractId'];
  mode: AgentVoiceSkillViewContractManifest['mode'];
  voiceModes: AgentVoiceSkillViewContractManifest['readyModeIds'][number] extends never ? never[] : Array<{
    id: AgentVoiceSkillViewContractManifest['allowedModeIds'][number];
    label: string;
    status: 'ready' | 'gated' | 'blocked';
    allowedSkillIds: string[];
    requiredViewIds: string[];
    optionalViewIds: string[];
    requiredReadinessIds: string[];
    blockedUntil: string[];
    guardrails: string[];
  }>;
  statePhases: AgentVoiceSkillViewContractManifest['statePhases'];
  guardrails: string[];
  caveats: string[];
};

const voiceOrchestrationReadinessRequirements = voiceOrchestrationReadinessRequirementsJson as {
  mode: AgentVoiceOrchestrationReadinessManifest['mode'];
  requirements: AgentVoiceOrchestrationReadinessManifest['requirements'];
  guardrails: string[];
  caveats: string[];
};

const persistenceReadinessRequirements = persistenceReadinessRequirementsJson as {
  mode: AgentPersistenceReadinessManifest['mode'];
  requirements: AgentPersistenceReadinessManifest['requirements'];
  guardrails: string[];
  caveats: string[];
};

const agentReviewIdentityPolicy = agentReviewIdentityPolicyJson as AgentReviewIdentityPolicy;
const treatmentOutcomeReadinessPolicy = treatmentOutcomeReadinessRequirementsJson as AgentTreatmentOutcomeReadinessPolicy;

function turnIdFor(input: AgentSkillRouterInput) {
  const safeBrandId = input.brandId.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'unknown-brand';
  return `${safeBrandId}-${Date.now().toString(36)}`;
}

function event(
  turnId: string,
  index: number,
  type: AgentTurnEventType,
  label: string,
  detail: string,
  extra: Partial<AgentTurnEvent> = {}
): AgentTurnEvent {
  return {
    id: `${turnId}-${String(index).padStart(2, '0')}-${type}`,
    type,
    label,
    detail,
    timestamp: new Date().toISOString(),
    ...extra
  };
}

type RuntimeBaseResult = Omit<AgentTurnResult, 'turnId' | 'runtimeVersion' | 'markdown' | 'events' | 'evidenceSpotlight' | 'memory' | 'audit' | 'confirmationGates' | 'workingContextManifest' | 'sourceGovernanceManifest' | 'persistenceReadinessManifest' | 'reviewIdentityManifest' | 'proactivityManifest' | 'pilotLearningManifest' | 'treatmentOutcomeReadinessManifest' | 'canvasStateManifest' | 'experienceArchitectureManifest' | 'interruptionRecoveryManifest' | 'reasoningStatusManifest' | 'conversationPresenceManifest' | 'providerAdapterManifest' | 'voiceSkillViewContractManifest' | 'voiceOrchestrationReadinessManifest' | 'runtimeControlManifest' | 'runtimeSurfaceManifest' | 'runtimeQualityChecks' | 'capabilities' | 'voicePolicy' | 'voiceRuntimeManifest'>;

function evidenceLabels(result: RuntimeBaseResult) {
  return result.answer.evidence.slice(0, 6).map((item) => item.label);
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function clampClaim(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 360 ? `${normalized.slice(0, 357)}...` : normalized;
}

function supportStatusForClaim(
  claim: string,
  claimType: AgentEvidenceSpotlightClaimType,
  result: RuntimeBaseResult
): AgentEvidenceSpotlightSupportStatus {
  const normalized = normalizeForMatch(claim);
  if (claimType === 'caveat') return 'guardrail';
  if (claimType === 'dynamic_view') return 'not_evidence_claim';
  if (
    normalized.includes('accepted session memory')
    || normalized.includes('reviewed session memory')
    || normalized.includes('reviewed working context')
  ) return 'reviewed_working_context';
  if (
    normalized.includes('missing')
    || normalized.includes('gap')
    || normalized.includes('not available')
    || result.answer.missingEvidence.some((gap) => normalized.includes(normalizeForMatch(gap.label)))
  ) return 'missing_evidence';
  return 'supported_by_packet';
}

function evidenceForClaim(claim: string, result: RuntimeBaseResult) {
  const normalized = normalizeForMatch(claim);
  const matched = result.answer.evidence.filter((item) => {
    const label = normalizeForMatch(item.label);
    const detail = normalizeForMatch(item.detail);
    return Boolean(label && normalized.includes(label)) || Boolean(detail && normalized.includes(detail.slice(0, 24)));
  });
  return (matched.length ? matched : result.answer.evidence).slice(0, 4);
}

function missingEvidenceForClaim(claim: string, result: RuntimeBaseResult) {
  const normalized = normalizeForMatch(claim);
  const matched = result.answer.missingEvidence.filter((gap) => (
    normalized.includes(normalizeForMatch(gap.label))
    || normalized.includes(normalizeForMatch(gap.id))
    || normalized.includes(normalizeForMatch(gap.missingInput).slice(0, 24))
  ));
  return matched.slice(0, 3);
}

function guardrailsForClaim(claim: string, status: AgentEvidenceSpotlightSupportStatus, result: RuntimeBaseResult) {
  const normalized = normalizeForMatch(claim);
  const matched = result.answer.guardrailsApplied.filter((guardrail) => {
    const normalizedGuardrail = normalizeForMatch(guardrail);
    return normalizedGuardrail.split(' ').some((term) => term.length > 7 && normalized.includes(term));
  });
  if (matched.length) return matched.slice(0, 3);
  if (status === 'guardrail') return [claim].slice(0, 1);
  return result.answer.guardrailsApplied.slice(0, 1);
}

function spotlightRecord(
  turnId: string,
  index: number,
  claimType: AgentEvidenceSpotlightClaimType,
  claim: string,
  result: RuntimeBaseResult
): AgentEvidenceSpotlight {
  const supportStatus = supportStatusForClaim(claim, claimType, result);
  const evidence = supportStatus === 'supported_by_packet' ? evidenceForClaim(claim, result) : [];
  const missingEvidence = supportStatus === 'missing_evidence' ? missingEvidenceForClaim(claim, result) : [];
  const sourceCandidateIds = supportStatus === 'supported_by_packet'
    ? []
    : [
        ...result.sourcePromotionContext.records.slice(0, 2).map((record) => record.id),
        ...result.sourceClaimContext.records.slice(0, 2).map((record) => record.id)
      ];

  return {
    id: `${turnId}-spotlight-${String(index).padStart(2, '0')}-${claimType}`,
    claimType,
    claim: clampClaim(claim),
    supportStatus,
    evidenceLabels: evidence.map((item) => item.label),
    evidenceSources: evidence.map((item) => item.source),
    missingEvidenceIds: missingEvidence.map((gap) => gap.id),
    guardrails: guardrailsForClaim(claim, supportStatus, result),
    sourceCandidateIds,
    humanReviewRequired: (
      supportStatus === 'missing_evidence'
      || supportStatus === 'reviewed_working_context'
      || claimType === 'dynamic_view'
      || Boolean(result.experiencePlan?.humanReviewRequired)
    )
  };
}

function buildEvidenceSpotlight(turnId: string, result: RuntimeBaseResult): AgentEvidenceSpotlight[] {
  const claims: { claimType: AgentEvidenceSpotlightClaimType; claim: string }[] = [
    { claimType: 'headline' as const, claim: result.answer.headline },
    { claimType: 'answer' as const, claim: result.answer.answer },
    ...result.answer.facts.map((claim) => ({ claimType: 'fact' as const, claim })),
    ...result.answer.interpretation.slice(0, 5).map((claim) => ({ claimType: 'interpretation' as const, claim })),
    ...result.answer.caveats.slice(0, 4).map((claim) => ({ claimType: 'caveat' as const, claim })),
    ...result.answer.dynamicViewRequests.slice(0, 5).map((request) => ({
      claimType: 'dynamic_view' as const,
      claim: `${request.viewId}: ${request.reason}${request.requiredDataAvailable ? '' : ` Fallback ${request.fallbackViewId ?? 'data_gap_panel'} required.`}`
    }))
  ].filter((item) => item.claim.trim().length > 0);

  return claims.map((item, index) => spotlightRecord(turnId, index + 1, item.claimType, item.claim, result));
}

function buildMemory(turnId: string, result: RuntimeBaseResult): AgentMemoryRecord[] {
  const brandId = result.packet.brand.brandId;
  const evidence = evidenceLabels(result);
  const records: AgentMemoryRecord[] = [
    {
      id: `${turnId}-memory-diagnosis`,
      type: 'decision_candidate',
      label: result.answer.headline,
      detail: result.answer.answer,
      status: 'suggested',
      sourceTurnId: turnId,
      brandId,
      evidenceLabels: evidence,
      humanReviewRequired: Boolean(result.experiencePlan?.humanReviewRequired)
    }
  ];

  for (const gap of result.answer.missingEvidence.slice(0, 3)) {
    records.push({
      id: `${turnId}-memory-gap-${gap.id}`,
      type: 'evidence_gap',
      label: gap.label,
      detail: gap.missingInput,
      status: 'suggested',
      sourceTurnId: turnId,
      brandId,
      evidenceLabels: [],
      humanReviewRequired: false
    });
  }

  for (const artifact of result.experiencePlan?.artifacts ?? []) {
    records.push({
      id: `${turnId}-memory-artifact-${artifact.id}`,
      type: 'artifact_draft',
      label: artifact.label,
      detail: `${artifact.status.replaceAll('_', ' ')} from ${artifact.sourceSkillId}; ${artifact.governance.circulationStatus.replaceAll('_', ' ')}.`,
      status: artifact.status === 'blocked' ? 'blocked' : 'suggested',
      sourceTurnId: turnId,
      brandId,
      evidenceLabels: evidence,
      humanReviewRequired: artifact.humanReviewRequired
    });
  }

  if (result.packet.strategicContext.status !== 'available') {
    records.push({
      id: `${turnId}-memory-open-question-brand-strategic-context`,
      type: 'open_question',
      label: 'Load Brand Strategic Context',
      detail: 'Approved brand book, DNA, positioning, objectives, planning priorities, and approved claims are still missing.',
      status: 'suggested',
      sourceTurnId: turnId,
      brandId,
      evidenceLabels: [],
      humanReviewRequired: true
    });
  }

  return records;
}

function auditRecord(
  turnId: string,
  result: RuntimeBaseResult,
  index: number,
  action: AgentAuditRecord['action'],
  label: string,
  detail: string,
  extra: Partial<AgentAuditRecord> = {}
): AgentAuditRecord {
  return {
    id: `${turnId}-audit-${String(index).padStart(2, '0')}-${action}`,
    action,
    label,
    detail,
    timestamp: new Date().toISOString(),
    turnId,
    brandId: result.packet.brand.brandId,
    evidenceLabels: evidenceLabels(result),
    requiresConfirmation: false,
    ...extra
  };
}

function buildAudit(
  turnId: string,
  result: RuntimeBaseResult,
  runtimeSurfaceManifest: AgentRuntimeSurfaceManifest,
  workingContextManifest: AgentWorkingContextManifest,
  sourceGovernanceManifest: AgentSourceGovernanceManifest,
  persistenceReadinessManifest: AgentPersistenceReadinessManifest,
  reviewIdentityManifest: AgentReviewIdentityManifest,
  proactivityManifest: AgentProactivityManifest,
  pilotLearningManifest: AgentPilotLearningManifest,
  treatmentOutcomeReadinessManifest: AgentTreatmentOutcomeReadinessManifest,
  canvasStateManifest: AgentCanvasStateManifest,
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest,
  reasoningStatusManifest: AgentReasoningStatusManifest,
  conversationPresenceManifest: AgentConversationPresenceManifest,
  providerAdapterManifest: AgentProviderAdapterManifest,
  voiceSkillViewContractManifest: AgentVoiceSkillViewContractManifest,
  voiceOrchestrationReadinessManifest: AgentVoiceOrchestrationReadinessManifest,
  experienceArchitectureManifest: AgentExperienceArchitectureManifest,
  memory: AgentMemoryRecord[],
  evidenceSpotlight: AgentEvidenceSpotlight[],
  runtimeQualityChecks: AgentRuntimeQualityCheck[]
): AgentAuditRecord[] {
  const records: AgentAuditRecord[] = [];
  const push = (
    action: AgentAuditRecord['action'],
    label: string,
    detail: string,
    extra: Partial<AgentAuditRecord> = {}
  ) => records.push(auditRecord(turnId, result, records.length + 1, action, label, detail, extra));

  push('turn_started', 'Turn started', `User asked for a governed read of ${result.packet.brand.brandName}.`);
  push('packet_built', 'Packet built', `${result.packet.evidenceGaps.length} evidence gaps surfaced.`);
  push(
    'runtime_surface_checked',
    'Runtime surface checked',
    `${runtimeSurfaceManifest.activeSurfaceId} is ${runtimeSurfaceManifest.activeSurfaceStatus.replaceAll('_', ' ')} with proof surface ${runtimeSurfaceManifest.activeProofSurface}; scoped default chat remains preserved.`,
    { requiresConfirmation: runtimeSurfaceManifest.isGated || runtimeSurfaceManifest.isDisabled }
  );
  if (result.acceptedMemory.length) {
    push('accepted_memory_loaded', 'Accepted memory loaded', `${result.acceptedMemory.length} reviewed memory records loaded into context.`);
  }
  if (result.sourceClaimContext.records.length) {
    push(
      'source_claim_context_loaded',
      'Source claim context loaded',
      `${result.sourceClaimContext.records.length} local source claim candidate${result.sourceClaimContext.records.length === 1 ? '' : 's'} loaded as non-evidence context.`,
      { requiresConfirmation: true }
    );
  }
  push(
    'working_context_built',
    'Working context built',
    `${workingContextManifest.loadedContextTypes.join(', ')} loaded. Memory auto-accept, source auto-consumption, and canonical writes remain disabled.`,
    { requiresConfirmation: false }
  );
  push(
    'source_governance_checked',
    'Source governance checked',
    `${sourceGovernanceManifest.sourcePromotionCandidateCount} reviewed-local source candidates, ${sourceGovernanceManifest.sourceClaimCandidateCount} source claims, and ${sourceGovernanceManifest.runtimeFileDropCandidateFileCount} runtime file-drop candidates are visible as non-canonical context; runtime source consumption remains disabled.`,
    { requiresConfirmation: true }
  );
  push(
    'persistence_readiness_checked',
    'Persistence readiness checked',
    `${persistenceReadinessManifest.readyRequirementIds.length} ready, ${persistenceReadinessManifest.prototypeRequirementIds.length} prototype-ready, and ${persistenceReadinessManifest.blockedRequirementIds.length} blocked persistence requirements; enterprise persistence remains disabled.`
  );
  push(
    'review_identity_checked',
    'Review identity checked',
    `${reviewIdentityManifest.prototypeReviewerLabel} prototype review identity is active; enterprise identity, role-based access, and official approvals remain blocked.`,
    { requiresConfirmation: reviewIdentityManifest.officialApprovalBlocked }
  );
  push('skill_selected', 'Skill selected', result.routedSkillId, { skillId: result.routedSkillId });
  push(
    'evidence_spotlight_created',
    'Evidence spotlight created',
    `${evidenceSpotlight.length} claim-level proof records created for this turn.`
  );
  if (result.experiencePlan) {
    push('experience_planned', 'Experience planned', result.experiencePlan.templateId);
    push(
      'canvas_state_built',
      'Canvas state built',
      `${canvasStateManifest.renderedViewIds.length} governed views, ${canvasStateManifest.artifactIds.length} artifacts, and ${canvasStateManifest.pendingGateIds.length} pending gates mapped into canvas state.`
    );
    push(
      'experience_architecture_checked',
      'Experience architecture checked',
      `${experienceArchitectureManifest.approvedTemplateCount} templates, ${experienceArchitectureManifest.approvedSkillCount} skills, and ${experienceArchitectureManifest.approvedViewCount} views are available for approved workspace composition; arbitrary UI remains blocked.`
    );
    push(
      'interruption_recovery_ready',
      'Interruption recovery ready',
      `Client stream abort is ${interruptionRecoveryManifest.clientStreamAbortSupported ? 'available' : 'unavailable'}; last completed canvas preservation is ${interruptionRecoveryManifest.preservesLastCompletedCanvas ? 'enabled' : 'disabled'}.`
    );
    push(
      'reasoning_status_built',
      'Reasoning status built',
      `${reasoningStatusManifest.steps.length} public status steps emitted without exposing private reasoning.`
    );
    push(
      'conversation_presence_built',
      'Conversation presence built',
      `${conversationPresenceManifest.mode.replaceAll('_', ' ')} is ready with ${conversationPresenceManifest.pulseSources.length} governed pulse sources and continuous listening disabled.`
    );
    push(
      'provider_adapters_built',
      'Provider adapters built',
      `${providerAdapterManifest.readyAdapterIds.length} adapters ready, ${providerAdapterManifest.gatedAdapterIds.length} gated, and ${providerAdapterManifest.disabledAdapterIds.length} disabled for this governed turn.`
    );
    push(
      'voice_orchestration_contract_checked',
      'Voice skill/view contract checked',
      `${voiceSkillViewContractManifest.activeSkillId} is ${voiceSkillViewContractManifest.activeSkillVoiceCompatible ? 'inside' : 'outside'} the voice contract; ${voiceSkillViewContractManifest.activeVoiceCompatibleViewIds.length} voice-compatible views and ${voiceSkillViewContractManifest.activeIncompatibleViewIds.length} incompatible views observed.`,
      { requiresConfirmation: voiceSkillViewContractManifest.activeIncompatibleViewIds.length > 0 || !voiceSkillViewContractManifest.activeSkillVoiceCompatible }
    );
    push(
      'voice_orchestration_readiness_checked',
      'Voice orchestration readiness checked',
      `${voiceOrchestrationReadinessManifest.blockedRequirementIds.length} voice orchestration requirements remain blocked; full voice stays gated.`
    );
    for (const zone of result.experiencePlan.zones) {
      push('view_requested', `View requested: ${zone.viewId}`, zone.reason, {
        skillId: zone.skillId,
        viewId: zone.viewId
      });
    }
    for (const artifact of result.experiencePlan.artifacts) {
      push('artifact_generated', `Artifact generated: ${artifact.label}`, `${artifact.status}; ${artifact.governance.circulationStatus}`, {
        skillId: artifact.sourceSkillId,
        artifactId: artifact.id,
        requiresConfirmation: artifact.humanReviewRequired
      });
    }
  }
  push(
    'runtime_quality_checked',
    'Runtime quality checked',
    `${runtimeQualityChecks.length} governed runtime quality checks emitted; ${runtimeQualityChecks.filter((check) => check.status !== 'pass').length} require attention.`,
    {
      requiresConfirmation: runtimeQualityChecks.some((check) => check.humanReviewRequired)
    }
  );
  for (const guardrail of result.answer.guardrailsApplied.slice(0, 5)) {
    push('guardrail_applied', 'Guardrail applied', guardrail);
  }
  for (const record of memory) {
    push('memory_suggested', `Memory suggested: ${record.label}`, record.detail, {
      requiresConfirmation: record.humanReviewRequired
    });
  }
  push(
    'proactivity_suggested',
    'Quiet proactivity suggested',
    `${proactivityManifest.suggestions.length} follow-up suggestions emitted with ${proactivityManifest.heldNotices.length} held notices; no autonomous actions were taken.`,
    { requiresConfirmation: true }
  );
  push(
    'pilot_learning_ready',
    'Pilot learning signals captured',
    `${pilotLearningManifest.signals.length} turn-level learning signals captured for review; autonomous learning, outcome learning, and canonical writes remain disabled.`,
    { requiresConfirmation: true }
  );
  push(
    'treatment_outcome_readiness_checked',
    'Treatment outcome readiness checked',
    `${treatmentOutcomeReadinessManifest.blockedRequirementIds.length} treatment outcome requirements remain blocked; outcome learning and treatment efficacy claims remain disabled.`,
    { requiresConfirmation: true }
  );
  push('turn_completed', 'Turn completed', 'Runtime emitted answer, plan, events, memory, audit, and confirmation gates.');
  return records;
}

function buildConfirmationGates(
  result: RuntimeBaseResult,
  memory: AgentMemoryRecord[],
  capabilities: AgentCapabilityDefinition[]
): AgentConfirmationGate[] {
  const gates: AgentConfirmationGate[] = [];
  for (const artifact of result.experiencePlan?.artifacts ?? []) {
    if (!artifact.humanReviewRequired) continue;
    gates.push({
      id: artifact.governance.reviewGateId ?? `${artifact.id}-circulation-gate`,
      action: 'circulate_artifact',
      label: `Review before circulating ${artifact.label}`,
      reason: 'Generated QBR, agency, and meeting artifacts must be reviewed by a human before circulation.',
      required: true,
      status: 'required',
      relatedArtifactId: artifact.id
    });
  }
  for (const record of memory) {
    gates.push({
      id: `${record.id}-accept-gate`,
      action: 'accept_memory',
      label: `Review memory: ${record.label}`,
      reason: record.humanReviewRequired
        ? 'This memory touches strategy, artifact, or decision context and needs human review.'
        : 'Suggested memory remains visible and editable before becoming accepted context.',
      required: true,
      status: 'required',
      relatedMemoryId: record.id
    });
  }
  if (result.packet.strategicContext.status !== 'available') {
    gates.push({
      id: `${result.packet.brand.brandId}-brand-strategic-context-source-gate`,
      action: 'promote_source_claim',
      label: 'Review Brand Strategic Context source before promotion',
      reason: 'Outside brand books, briefs, or planning docs must be reviewed as data before becoming canonical context.',
      required: true,
      status: 'required'
    });
  }
  for (const claim of result.sourceClaimContext.records.slice(0, 5)) {
    const clippedClaim = claim.claim.length > 76 ? `${claim.claim.slice(0, 73)}...` : claim.claim;
    gates.push({
      id: `${claim.id}-source-claim-review-gate`,
      action: 'promote_source_claim',
      label: `Review source claim: ${clippedClaim}`,
      reason: claim.status === 'reviewed_candidate'
        ? 'Reviewed local source claims still require source-owner governance before any canonical promotion.'
        : 'Extracted source claims must be reviewed before source promotion is considered.',
      required: true,
      status: 'required',
      relatedSourceClaimId: claim.id
    });
  }
  for (const capability of capabilities) {
    if (capability.enabled) continue;
    for (const action of capability.allowedActions) {
      gates.push({
        id: `${capability.id}-${action}-capability-gate`,
        action,
        label: `${capability.label} disabled`,
        reason: capability.blockedReason ?? `${capability.label} is disabled by capability flag.`,
        required: true,
        status: 'blocked'
      });
    }
  }
  return gates;
}

function buildWorkingContextManifest(
  turnId: string,
  result: RuntimeBaseResult,
  memory: AgentMemoryRecord[],
  confirmationGates: AgentConfirmationGate[]
): AgentWorkingContextManifest {
  const loadedContextTypes: AgentWorkingContextManifest['loadedContextTypes'] = ['brand_intelligence_packet'];
  if (result.acceptedMemory.length) loadedContextTypes.push('accepted_memory');
  if (result.sourcePromotionContext.records.length) loadedContextTypes.push('source_promotion_candidates');
  if (result.sourceClaimContext.records.length) loadedContextTypes.push('source_claim_candidates');

  return {
    id: 'agent-working-context-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    loadedContextTypes,
    acceptedMemory: result.acceptedMemory.map((record) => ({
      id: record.id,
      type: record.type,
      label: record.label,
      sourceTurnId: record.sourceTurnId,
      evidenceLabels: record.evidenceLabels,
      humanReviewRequired: record.humanReviewRequired
    })),
    suggestedMemoryCount: memory.filter((record) => record.status === 'suggested').length,
    sourcePromotionCandidateIds: result.sourcePromotionContext.records.map((record) => record.id),
    sourceClaimCandidateIds: result.sourceClaimContext.records.map((record) => record.id),
    memoryReviewGateIds: confirmationGates.filter((gate) => gate.action === 'accept_memory').map((gate) => gate.id),
    sourceReviewGateIds: confirmationGates.filter((gate) => gate.action === 'promote_source_claim').map((gate) => gate.id),
    autoAcceptMemoryEnabled: false,
    sourcePromotionAutoConsumption: result.sourcePromotionContext.runtimeAutoConsumption,
    sourceClaimAutoConsumption: result.sourceClaimContext.runtimeAutoConsumption,
    canonicalSourceWriteEnabled: result.sourcePromotionContext.canonicalWriteEnabled,
    canonicalClaimWriteEnabled: result.sourceClaimContext.canonicalFactEnabled,
    caveats: [
      'Only accepted reviewed memory is loaded as working context.',
      'Suggested memory remains review-controlled and is not auto-accepted.',
      'Reviewed-local source promotion records and extracted source claims remain candidate context, not canonical facts.',
      'Canonical source writes and runtime auto-consumption remain disabled.'
    ]
  };
}

function buildSourceGovernanceManifest(
  turnId: string,
  result: RuntimeBaseResult,
  workingContextManifest: AgentWorkingContextManifest,
  confirmationGates: AgentConfirmationGate[],
  capabilities: AgentCapabilityDefinition[]
): AgentSourceGovernanceManifest {
  const readinessChecks = result.packet.momentumSourceReadiness.checks;
  const statusCounts: AgentSourceGovernanceManifest['momentumReadinessCheckStatusCounts'] = {
    source_ready: 0,
    prototype_only: 0,
    partial: 0,
    missing: 0
  };
  for (const check of readinessChecks) statusCounts[check.status] += 1;

  const runtimeFileDrop = result.packet.momentumRuntimeSourceFileDropReadiness;
  const strategicContextRuntimeFileDrop = result.packet.strategicContextRuntimeSourceFileDropReadiness;
  const sourceClaimPromotionCapability = capabilities.find((capability) => capability.id === 'source_claim_promotion');
  const sourceDataWriteCapability = capabilities.find((capability) => capability.id === 'source_data_write');
  const sourceReviewGateIds = confirmationGates
    .filter((gate) => gate.action === 'promote_source_claim' || gate.action === 'write_source_data')
    .map((gate) => gate.id);
  const blockers = Array.from(new Set([
    ...result.packet.momentumSourceReadiness.blockers,
    ...runtimeFileDrop.blockers,
    ...strategicContextRuntimeFileDrop.blockers,
    ...(sourceClaimPromotionCapability?.enabled ? [] : [sourceClaimPromotionCapability?.blockedReason ?? 'Source claim promotion capability is disabled.']),
    ...(sourceDataWriteCapability?.enabled ? [] : [sourceDataWriteCapability?.blockedReason ?? 'Source data write capability is disabled.']),
    workingContextManifest.sourcePromotionAutoConsumption || workingContextManifest.sourceClaimAutoConsumption
      ? 'Runtime source auto-consumption is enabled and must be disabled before governance can pass.'
      : '',
    workingContextManifest.canonicalSourceWriteEnabled || workingContextManifest.canonicalClaimWriteEnabled
      ? 'Canonical source or claim writes are enabled and must remain disabled in this prototype.'
      : ''
  ].filter(Boolean)));

  return {
    id: 'agent-source-governance-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'reviewed_local_source_context_only',
    sourcePromotionCandidateCount: result.sourcePromotionContext.records.length,
    sourceClaimCandidateCount: result.sourceClaimContext.records.length,
    reviewedSourceClaimCount: result.sourceClaimContext.records.filter((record) => record.status === 'reviewed_candidate').length,
    unreviewedSourceClaimCount: result.sourceClaimContext.records.filter((record) => record.status === 'extracted_unreviewed').length,
    sourcePromotionCandidateIds: result.sourcePromotionContext.records.map((record) => record.id),
    sourceClaimCandidateIds: result.sourceClaimContext.records.map((record) => record.id),
    sourceReviewGateIds,
    momentumSourceReadinessStatus: result.packet.momentumSourceReadiness.status,
    momentumSourcePath: result.packet.momentumSourceReadiness.sourcePath,
    momentumCanonicalForExecutiveUse: result.packet.momentumSourceReadiness.canonicalForExecutiveUse,
    momentumReadinessCheckStatusCounts: statusCounts,
    runtimeFileDropStatus: runtimeFileDrop.status,
    runtimeFileDropAuditMode: runtimeFileDrop.audit.auditMode,
    runtimeFileDropSourceDirectoryExists: runtimeFileDrop.audit.sourceDirectoryExists,
    runtimeFileDropCandidateFileCount: runtimeFileDrop.audit.candidateFileCount,
    requiredRuntimeFileKinds: runtimeFileDrop.requiredFileKinds,
    loadedRuntimeFileKinds: runtimeFileDrop.loadedFileKinds,
    missingRuntimeFileKinds: runtimeFileDrop.missingFileKinds,
    strategicContextRuntimeFileDropStatus: strategicContextRuntimeFileDrop.status,
    strategicContextRuntimeFileDropAuditMode: strategicContextRuntimeFileDrop.audit.auditMode,
    strategicContextRuntimeFileDropSourceDirectoryExists: strategicContextRuntimeFileDrop.audit.sourceDirectoryExists,
    strategicContextRuntimeFileDropCandidateFileCount: strategicContextRuntimeFileDrop.audit.candidateFileCount,
    strategicContextRequiredRuntimeFileKinds: strategicContextRuntimeFileDrop.requiredFileKinds,
    strategicContextLoadedRuntimeFileKinds: strategicContextRuntimeFileDrop.loadedFileKinds,
    strategicContextMissingRuntimeFileKinds: strategicContextRuntimeFileDrop.missingFileKinds,
    canonicalSourceWritesEnabled: false,
    canonicalClaimFactsEnabled: false,
    runtimeSourceAutoConsumptionEnabled: false,
    runtimeFileDropConsumptionEnabled: false,
    runtimeFileDropCanonicalUseEnabled: false,
    sourceClaimPromotionCapabilityEnabled: Boolean(sourceClaimPromotionCapability?.enabled),
    sourceDataWriteCapabilityEnabled: Boolean(sourceDataWriteCapability?.enabled),
    humanReviewRequired: true,
    blockers,
    nextSourceGovernanceStep: result.packet.momentumSourceReadiness.canonicalForExecutiveUse
      ? 'Review canonical-use governance, persistence readiness, Brand Strategic Context source-owner approval, and source-owner file-drop gates before enabling runtime source consumption.'
      : 'Collect approved source-owner Momentum extracts, approved Brand Strategic Context files, and clear canonical-use governance before replacing prototype source context.',
    guardrails: [
      'Reviewed-local source promotion records are candidate context, not canonical facts.',
      'Extracted source claims are review queue items, not answer evidence.',
      'Momentum and Brand Strategic Context runtime file drops are audited read-only until canonical-use governance enables consumption.',
      'Source writes, source-claim promotion, and runtime auto-consumption remain disabled.'
    ],
    caveats: [
      'This manifest summarizes source governance posture for the turn; it does not promote any source.',
      'Source review gates record local prototype review state only.',
      'Approved-looking files or records do not become source truth while canonical use and runtime consumption are disabled.'
    ]
  };
}

function buildPersistenceReadinessManifest(
  turnId: string,
  result: RuntimeBaseResult,
  workingContextManifest: AgentWorkingContextManifest
): AgentPersistenceReadinessManifest {
  const requirements: AgentPersistenceReadinessManifest['requirements'] = persistenceReadinessRequirements.requirements.map((requirement) => {
    if (requirement.id === 'browser-local-ledger') {
      return { ...requirement, status: 'ready' as const, blockers: [] };
    }
    if (requirement.id === 'local-json-session-store') {
      return { ...requirement, status: 'prototype_ready' as const, blockers: requirement.blockers };
    }
    if (requirement.id === 'review-actions-workflow') {
      const ready = workingContextManifest.memoryReviewGateIds.length > 0
        && workingContextManifest.sourceReviewGateIds.length >= result.sourceClaimContext.records.length;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Review gates are not fully mapped for memory or source review records.']
      };
    }
    if (requirement.id === 'accepted-memory-context') {
      const ready = !workingContextManifest.autoAcceptMemoryEnabled
        && workingContextManifest.acceptedMemory.every((record) => record.humanReviewRequired);
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Accepted memory context is not review-controlled.']
      };
    }
    if (requirement.id === 'source-candidates-non-canonical') {
      const ready = !workingContextManifest.sourcePromotionAutoConsumption
        && !workingContextManifest.sourceClaimAutoConsumption
        && !workingContextManifest.canonicalSourceWriteEnabled
        && !workingContextManifest.canonicalClaimWriteEnabled;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Source candidates are being auto-consumed or canonical writes are enabled.']
      };
    }
    return { ...requirement, status: 'blocked' as const, blockers: requirement.blockers };
  });
  const readyRequirementIds = requirements.filter((requirement) => requirement.status === 'ready').map((requirement) => requirement.id);
  const prototypeRequirementIds = requirements.filter((requirement) => requirement.status === 'prototype_ready').map((requirement) => requirement.id);
  const blockedRequirementIds = requirements.filter((requirement) => requirement.status === 'blocked').map((requirement) => requirement.id);

  return {
    id: 'agent-persistence-readiness-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: persistenceReadinessRequirements.mode,
    currentStorageMode: 'browser_local_and_local_json_prototype',
    browserLocalLedgerEnabled: true,
    localJsonPersistenceEnabled: true,
    enterprisePersistenceEnabled: false,
    reviewActionsEnabled: true,
    acceptedMemoryLoadsIntoContext: true,
    canonicalSourceWritesEnabled: workingContextManifest.canonicalSourceWriteEnabled || workingContextManifest.canonicalClaimWriteEnabled,
    sourceRuntimeAutoConsumptionEnabled: workingContextManifest.sourcePromotionAutoConsumption || workingContextManifest.sourceClaimAutoConsumption,
    readyRequirementIds,
    prototypeRequirementIds,
    blockedRequirementIds,
    persistedRecordTypes: Array.from(new Set(requirements.flatMap((requirement) => requirement.recordTypes))).sort(),
    requirements,
    nextPromotionStep: blockedRequirementIds.includes('enterprise-database-schema')
      ? 'Design the enterprise persistence schema for turns, memory, artifacts, audit, gates, reviews, source candidates, and source claims.'
      : 'Review blocked persistence requirements before promoting local prototype records.',
    guardrails: persistenceReadinessRequirements.guardrails,
    caveats: persistenceReadinessRequirements.caveats
  };
}

function buildReviewIdentityManifest(
  turnId: string,
  result: RuntimeBaseResult,
  confirmationGates: AgentConfirmationGate[]
): AgentReviewIdentityManifest {
  return {
    id: 'agent-review-identity-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    policyId: agentReviewIdentityPolicy.id,
    mode: agentReviewIdentityPolicy.mode,
    prototypeReviewerLabel: agentReviewIdentityPolicy.prototypeReviewerLabel,
    enterpriseIdentityEnabled: agentReviewIdentityPolicy.enterpriseIdentityEnabled,
    roleBasedAccessEnabled: agentReviewIdentityPolicy.roleBasedAccessEnabled,
    brandAccessControlEnabled: agentReviewIdentityPolicy.brandAccessControlEnabled,
    officialApprovalEnabled: agentReviewIdentityPolicy.officialApprovalEnabled,
    accountableReviewerKnown: false,
    reviewActionsUsePrototypeIdentity: true,
    localReviewWorkflowEnabled: true,
    officialApprovalBlocked: true,
    reviewableItemTypes: agentReviewIdentityPolicy.reviewableItemTypes,
    allowedPrototypeDecisions: agentReviewIdentityPolicy.allowedPrototypeDecisions,
    blockedEnterpriseApprovalTypes: agentReviewIdentityPolicy.blockedEnterpriseApprovalTypes,
    requiredBeforeEnterpriseApproval: agentReviewIdentityPolicy.requiredBeforeEnterpriseApproval,
    relatedGateIds: confirmationGates
      .filter((gate) => gate.status === 'required' || gate.status === 'blocked')
      .map((gate) => gate.id),
    relatedReviewRecordIds: [],
    guardrails: agentReviewIdentityPolicy.guardrails,
    caveats: agentReviewIdentityPolicy.caveats
  };
}

function buildProactivityManifest(
  turnId: string,
  result: RuntimeBaseResult,
  memory: AgentMemoryRecord[],
  confirmationGates: AgentConfirmationGate[]
): AgentProactivityManifest {
  const suggestions: AgentProactivitySuggestion[] = [];
  const evidence = evidenceLabels(result);
  const gatesByAction = (action: AgentConfirmationGate['action']) => (
    confirmationGates.filter((gate) => gate.action === action).map((gate) => gate.id)
  );

  for (const gap of result.answer.missingEvidence.slice(0, 3)) {
    suggestions.push({
      id: `${turnId}-proactive-gap-${gap.id}`,
      type: 'evidence_gap_follow_up',
      label: `Follow up on ${gap.label}`,
      reason: `${gap.missingInput}. Best next source: ${gap.bestNextSource}.`,
      priority: gap.severity === 'high' ? 'high' : gap.severity === 'medium' ? 'medium' : 'low',
      suggestedTiming: gap.id.includes('source') || gap.id.includes('context') ? 'when_source_available' : 'next_session',
      relatedEvidenceLabels: [],
      relatedGapIds: [gap.id],
      relatedGateIds: gatesByAction('promote_source_claim').slice(0, 4),
      relatedArtifactIds: [],
      allowedNextSkillIds: gap.affectedSkills.slice(0, 4),
      humanReviewRequired: true
    });
  }

  if (!result.packet.momentumSourceReadiness.canonicalForExecutiveUse) {
    suggestions.push({
      id: `${turnId}-proactive-momentum-source-readiness`,
      type: 'source_owner_handoff',
      label: 'Prepare Momentum source-owner handoff',
      reason: result.packet.momentumSourceReadiness.blockers.slice(0, 3).join(' '),
      priority: 'high',
      suggestedTiming: 'when_source_available',
      relatedEvidenceLabels: [],
      relatedGapIds: result.packet.momentumSourceReadiness.checks
        .filter((check) => check.status !== 'source_ready')
        .map((check) => check.id),
      relatedGateIds: gatesByAction('promote_source_claim').slice(0, 4),
      relatedArtifactIds: [],
      allowedNextSkillIds: ['bbe_momentum_intelligence_read', 'explain_diagnosis_evidence'],
      humanReviewRequired: true
    });
  }

  const reviewArtifactIds = (result.experiencePlan?.artifacts ?? [])
    .filter((artifact) => artifact.humanReviewRequired)
    .map((artifact) => artifact.id);
  if (reviewArtifactIds.length) {
    suggestions.push({
      id: `${turnId}-proactive-artifact-review`,
      type: 'artifact_review',
      label: 'Review generated artifacts before circulation',
      reason: 'QBR, agency, and meeting artifacts remain review-required and export-disabled.',
      priority: 'medium',
      suggestedTiming: result.experiencePlan?.objective === 'package' || result.experiencePlan?.audience === 'executive'
        ? 'before_meeting'
        : 'next_session',
      relatedEvidenceLabels: evidence,
      relatedGapIds: [],
      relatedGateIds: confirmationGates
        .filter((gate) => gate.action === 'circulate_artifact' || gate.action === 'export_artifact')
        .map((gate) => gate.id),
      relatedArtifactIds: reviewArtifactIds,
      allowedNextSkillIds: ['draft_meeting_story'],
      humanReviewRequired: true
    });
  }

  const suggestedMemory = memory.filter((record) => record.status === 'suggested');
  if (suggestedMemory.length) {
    suggestions.push({
      id: `${turnId}-proactive-memory-review`,
      type: 'memory_review',
      label: 'Review suggested memory before the next turn',
      reason: `${suggestedMemory.length} suggested memory record${suggestedMemory.length === 1 ? '' : 's'} can be accepted, edited, or rejected by a human.`,
      priority: 'medium',
      suggestedTiming: 'next_session',
      relatedEvidenceLabels: evidence,
      relatedGapIds: [],
      relatedGateIds: gatesByAction('accept_memory').slice(0, 6),
      relatedArtifactIds: [],
      allowedNextSkillIds: ['answer_brand_question'],
      humanReviewRequired: true
    });
  }

  suggestions.push({
    id: `${turnId}-proactive-decision-follow-up`,
    type: 'decision_follow_up',
    label: `Decide next workspace for ${result.packet.brand.brandName}`,
    reason: result.experiencePlan
      ? `Continue from ${result.experiencePlan.title} with unresolved gaps and reviewed artifacts visible.`
      : 'Continue from the current grounded answer with evidence, gaps, and guardrails visible.',
    priority: result.answer.missingEvidence.some((gap) => gap.severity === 'high') ? 'high' : 'medium',
    suggestedTiming: 'next_session',
    relatedEvidenceLabels: evidence,
    relatedGapIds: result.answer.missingEvidence.slice(0, 5).map((gap) => gap.id),
    relatedGateIds: confirmationGates.filter((gate) => gate.status === 'required').map((gate) => gate.id).slice(0, 8),
    relatedArtifactIds: reviewArtifactIds,
    allowedNextSkillIds: Array.from(new Set([
      result.routedSkillId,
      ...(result.experiencePlan?.requiredSkillIds ?? []),
      'create_growth_provocations'
    ])).slice(0, 5),
    humanReviewRequired: true
  });

  const heldNotices = [
    {
      id: `${turnId}-held-no-scheduled-reminders`,
      label: 'No scheduled reminders created',
      reason: 'The runtime can suggest follow-ups but cannot schedule reminders or external notifications in this prototype.',
      heldBecause: 'scheduledNotificationsEnabled is false and canCreateReminders is false.',
      relatedGateIds: []
    },
    {
      id: `${turnId}-held-no-autonomous-source-promotion`,
      label: 'No autonomous source promotion',
      reason: 'Source-owner handoff suggestions remain review context only.',
      heldBecause: 'Canonical source writes and runtime source auto-consumption remain disabled.',
      relatedGateIds: gatesByAction('promote_source_claim').slice(0, 5)
    }
  ];

  return {
    id: 'agent-proactivity-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'quiet_suggestions_only',
    autonomousActionsEnabled: false,
    scheduledNotificationsEnabled: false,
    externalSendEnabled: false,
    canCreateReminders: false,
    noOverlappingRuns: true,
    suggestions: suggestions.slice(0, 8),
    heldNotices,
    caveats: [
      'Quiet proactivity is suggestions-only in this prototype.',
      'The runtime does not schedule reminders, send notifications, start background runs, or promote source data.',
      'Follow-up suggestions must be reviewed by a human before becoming accepted memory, artifacts, or source actions.'
    ]
  };
}

function buildPilotLearningManifest(
  turnId: string,
  result: RuntimeBaseResult,
  memory: AgentMemoryRecord[],
  confirmationGates: AgentConfirmationGate[],
  proactivityManifest: AgentProactivityManifest,
  voiceOrchestrationReadinessManifest: AgentVoiceOrchestrationReadinessManifest
): AgentPilotLearningManifest {
  const signals: AgentPilotLearningSignal[] = [];
  const viewIds = result.experiencePlan?.viewManifest.map((view) => view.renderedViewId)
    ?? result.answer.dynamicViewRequests.map((request) => request.viewId);
  const evidence = evidenceLabels(result);
  const relatedReviewGateIds = confirmationGates
    .filter((gate) => gate.status === 'required' || gate.status === 'blocked')
    .map((gate) => gate.id);
  const missingEvidence = result.answer.missingEvidence;
  const artifacts = result.experiencePlan?.artifacts ?? [];
  const sourceCandidateCount = result.sourcePromotionContext.records.length + result.sourceClaimContext.records.length;

  const pushSignal = (
    type: AgentPilotLearningSignal['type'],
    label: string,
    detail: string,
    status: AgentPilotLearningSignal['status'] = 'captured_for_review',
    extra: Partial<AgentPilotLearningSignal> = {}
  ) => signals.push({
    id: `${turnId}-learning-${String(signals.length + 1).padStart(2, '0')}-${type}`,
    type,
    label,
    detail,
    status,
    relatedViewIds: [],
    relatedGateIds: relatedReviewGateIds.slice(0, 6),
    relatedEvidenceLabels: evidence,
    humanReviewRequired: true,
    ...extra
  });

  pushSignal(
    'question_intent',
    'Question intent captured',
    result.answer.intent || `User asked for ${result.routedSkillId}.`
  );
  pushSignal(
    'skill_route',
    'Skill route captured',
    `${result.routedSkillId} was selected for ${result.packet.brand.brandName}.`
  );
  pushSignal(
    'experience_template',
    result.experiencePlan ? 'Experience template captured' : 'No ExperiencePlan template captured',
    result.experiencePlan
      ? `${result.experiencePlan.templateId} served ${result.experiencePlan.audience}/${result.experiencePlan.objective}.`
      : 'This turn did not produce a governed ExperiencePlan template.',
    result.experiencePlan ? 'captured_for_review' : 'not_available'
  );
  pushSignal(
    'rendered_view',
    viewIds.length ? 'Rendered view set captured' : 'No rendered views captured',
    viewIds.length
      ? `${viewIds.length} governed view${viewIds.length === 1 ? '' : 's'} can be reviewed for workspace fit.`
      : 'No dynamic view requests were produced for this answer.',
    viewIds.length ? 'captured_for_review' : 'not_available',
    { relatedViewIds: viewIds.slice(0, 8) }
  );
  pushSignal(
    'artifact_draft',
    artifacts.length ? 'Artifact draft signal captured' : 'No artifact draft captured',
    artifacts.length
      ? `${artifacts.length} draft artifact${artifacts.length === 1 ? '' : 's'} remain review-required and export-disabled.`
      : 'No draft artifact was generated by this turn.',
    artifacts.length ? 'captured_for_review' : 'not_available',
    {
      relatedGateIds: confirmationGates
        .filter((gate) => gate.action === 'circulate_artifact' || gate.action === 'export_artifact')
        .map((gate) => gate.id)
        .slice(0, 6)
    }
  );
  pushSignal(
    'evidence_gap',
    missingEvidence.length ? 'Evidence gaps captured' : 'No evidence gaps captured',
    missingEvidence.length
      ? `${missingEvidence.length} evidence gap${missingEvidence.length === 1 ? '' : 's'} define the next proof needed before stronger conclusions.`
      : 'The answer did not add a new missing-evidence record.',
    missingEvidence.length ? 'captured_for_review' : 'not_available',
    { relatedEvidenceLabels: missingEvidence.map((gap) => gap.label).slice(0, 6) }
  );
  pushSignal(
    'review_decision',
    'Review decision queue captured',
    `${relatedReviewGateIds.length} review gate${relatedReviewGateIds.length === 1 ? '' : 's'} and ${memory.length} memory signal${memory.length === 1 ? '' : 's'} remain human-controlled.`,
    relatedReviewGateIds.length || memory.length ? 'captured_for_review' : 'not_available',
    { relatedGateIds: relatedReviewGateIds.slice(0, 8) }
  );
  pushSignal(
    'source_candidate',
    sourceCandidateCount ? 'Source candidate signal captured' : 'No source candidate captured',
    sourceCandidateCount
      ? `${sourceCandidateCount} local source candidate${sourceCandidateCount === 1 ? '' : 's'} loaded as review context only; canonical writes and runtime auto-consumption remain disabled.`
      : 'No source promotion or source claim candidate was loaded for this turn.',
    sourceCandidateCount ? 'captured_for_review' : 'not_available'
  );
  pushSignal(
    'voice_readiness',
    'Voice readiness learning blocked',
    `${voiceOrchestrationReadinessManifest.blockedRequirementIds.length} voice requirements remain blocked; full voice, continuous listen, Realtime, and TTS are not learning from this turn.`,
    'blocked'
  );
  pushSignal(
    'follow_up_proof',
    'Follow-up proof signal captured',
    `${proactivityManifest.suggestions.length} quiet follow-up suggestion${proactivityManifest.suggestions.length === 1 ? '' : 's'} can be reviewed as next-step intent, not scheduled work.`,
    proactivityManifest.suggestions.length ? 'captured_for_review' : 'not_available',
    {
      relatedGateIds: proactivityManifest.suggestions
        .flatMap((suggestion) => suggestion.relatedGateIds)
        .slice(0, 8)
    }
  );

  return {
    id: 'agent-pilot-learning-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'reviewed_learning_signals_only',
    learningLoopEnabled: true,
    autonomousLearningEnabled: false,
    outcomeLearningEnabled: false,
    canonicalMemoryWriteEnabled: false,
    canonicalSourceWriteEnabled: false,
    treatmentOutcomeClaimsEnabled: false,
    signals,
    blockedLearningPaths: [
      'autonomous_learning_disabled',
      'outcome_learning_requires_follow_up_signal_records',
      'canonical_memory_write_disabled',
      'canonical_source_write_disabled',
      'runtime_source_auto_consumption_disabled',
      'treatment_outcome_claims_disabled',
      'enterprise_learning_store_disabled'
    ],
    nextProofNeeds: Array.from(new Set([
      ...missingEvidence.map((gap) => gap.bestNextSource),
      ...proactivityManifest.suggestions.slice(0, 4).map((suggestion) => suggestion.label)
    ])).slice(0, 8),
    relatedReviewGateIds,
    relatedEvidenceGapIds: missingEvidence.map((gap) => gap.id),
    guardrails: [
      'Pilot learning signals are review inputs, not autonomous memory writes.',
      'Do not treat turn patterns as outcome learning without follow-up evidence.',
      'Do not promote source candidates, memory, or treatment conclusions to canonical data from this manifest.',
      'Voice readiness signals are blocked until privacy, consent, Realtime parity, and TTS governance are approved.'
    ],
    caveats: [
      'This manifest is a per-turn prototype learning surface, not a longitudinal enterprise learning store.',
      'Human review is required before any signal influences accepted memory, source truth, artifact circulation, or future automation.',
      'The manifest can identify useful next proof, but it cannot claim treatment effectiveness or causality.'
    ]
  };
}

function buildTreatmentOutcomeReadinessManifest(
  turnId: string,
  result: RuntimeBaseResult,
  pilotLearningManifest: AgentPilotLearningManifest
): AgentTreatmentOutcomeReadinessManifest {
  const requirements = treatmentOutcomeReadinessPolicy.requirements.map((requirement) => ({
    ...requirement,
    status: requirement.status
  }));
  const readyRequirementIds = requirements.filter((requirement) => requirement.status === 'ready').map((requirement) => requirement.id);
  const prototypeRequirementIds = requirements.filter((requirement) => requirement.status === 'prototype_ready').map((requirement) => requirement.id);
  const blockedRequirementIds = requirements.filter((requirement) => requirement.status === 'blocked').map((requirement) => requirement.id);
  const relatedTreatmentIds = result.packet.treatmentOptions.slice(0, 5).map((treatment) => treatment.treatmentId);
  const relatedFollowUpSignals = Array.from(new Set(
    result.packet.treatmentOptions.flatMap((treatment) => treatment.followUpSignals)
  )).slice(0, 8);

  return {
    id: 'agent-treatment-outcome-readiness-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    policyId: treatmentOutcomeReadinessPolicy.id,
    mode: treatmentOutcomeReadinessPolicy.mode,
    outcomeLearningEnabled: treatmentOutcomeReadinessPolicy.outcomeLearningEnabled,
    treatmentOutcomeClaimsEnabled: treatmentOutcomeReadinessPolicy.treatmentOutcomeClaimsEnabled,
    acceptedOutcomeRecordStoreEnabled: treatmentOutcomeReadinessPolicy.acceptedOutcomeRecordStoreEnabled,
    canonicalLearningStoreEnabled: treatmentOutcomeReadinessPolicy.canonicalLearningStoreEnabled,
    readyRequirementIds,
    prototypeRequirementIds,
    blockedRequirementIds,
    requirements,
    relatedTreatmentIds,
    relatedFollowUpSignals,
    relatedLearningSignalIds: pilotLearningManifest.signals.map((signal) => signal.id).slice(0, 8),
    nextPromotionStep: blockedRequirementIds.includes('outcome-record-schema')
      ? 'Define and approve the treatment outcome record schema before capturing outcomes or claiming efficacy.'
      : 'Review blocked treatment outcome requirements before enabling outcome learning.',
    guardrails: treatmentOutcomeReadinessPolicy.guardrails,
    caveats: treatmentOutcomeReadinessPolicy.caveats
  };
}

function buildCanvasStateManifest(
  turnId: string,
  result: RuntimeBaseResult,
  confirmationGates: AgentConfirmationGate[]
): AgentCanvasStateManifest {
  const plan = result.experiencePlan;
  const activeZoneIds = plan?.zones.map((zone) => zone.id)
    ?? result.answer.dynamicViewRequests.map((request) => request.viewId);
  const activeViewIds = plan?.zones.map((zone) => zone.viewId)
    ?? result.answer.dynamicViewRequests.map((request) => request.viewId);
  const renderedViewIds = plan?.viewManifest.map((view) => view.renderedViewId) ?? activeViewIds;
  const fallbackViewIds = Array.from(new Set([
    ...(plan?.zones
      .filter((zone) => !zone.requiredDataAvailable)
      .map((zone) => zone.fallbackViewId)
      .filter((viewId): viewId is string => Boolean(viewId)) ?? []),
    ...(result.answer.dynamicViewRequests
      .filter((request) => !request.requiredDataAvailable)
      .map((request) => request.fallbackViewId)
      .filter((viewId): viewId is string => Boolean(viewId)) ?? [])
  ]));
  const focusedZone = plan?.zones.find((zone) => zone.requiredDataAvailable) ?? plan?.zones[0] ?? null;
  const voiceCompatibleViewIds = (plan?.viewManifest ?? [])
    .filter((view) => view.supportedModes.includes('voice_canvas'))
    .map((view) => view.renderedViewId);
  const pendingGateIds = confirmationGates
    .filter((gate) => gate.status === 'required' || gate.status === 'blocked')
    .map((gate) => gate.id);
  const proofRailSections: AgentCanvasStateManifest['proofRailSections'] = [
    'facts',
    'evidence_used',
    'claim_spotlight',
    'gaps_before_action',
    'source_readiness',
    'runtime_quality',
    'experience_plan',
    'canvas_state',
    'runtime_events',
    'working_context',
    'quiet_follow_ups',
    'pilot_learning',
    'treatment_outcomes',
    'review_queue',
    'voice_policy'
  ];

  return {
    id: 'agent-canvas-state-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'experience_plan_driven',
    planId: plan?.planId ?? null,
    templateId: plan?.templateId ?? null,
    layout: plan?.layout ?? 'fallback_stack',
    focusedZoneId: focusedZone?.id ?? null,
    focusedViewId: focusedZone?.viewId ?? result.answer.dynamicViewRequests[0]?.viewId ?? null,
    activeZoneIds,
    activeViewIds,
    renderedViewIds,
    fallbackViewIds,
    voiceCompatibleViewIds: Array.from(new Set(voiceCompatibleViewIds)),
    artifactIds: plan?.artifacts.map((artifact) => artifact.id) ?? [],
    pendingGateIds,
    evidenceGapIds: result.answer.missingEvidence.map((gap) => gap.id),
    proofRailSections,
    dynamicUiGenerationEnabled: false,
    arbitraryViewIdsAllowed: false,
    preservesCanvasUntilNextTurn: true,
    interruptionRecovery: 'preserve_current_canvas_until_next_governed_turn',
    humanReviewRequired: Boolean(plan?.humanReviewRequired),
    guardrails: [
      'Canvas state is derived from the governed ExperiencePlan and approved view registry.',
      'The runtime cannot render arbitrary view IDs or mutate canonical data from canvas state.',
      'If a turn is interrupted or fails, the previous governed canvas remains inspectable until the next completed turn.'
    ],
    caveats: [
      'Canvas state is a read-only prototype manifest, not a collaborative multi-user canvas store.',
      'Advanced interruption, rewind, branching, and drag-to-compose behavior remain future work.',
      'Export and circulation remain controlled by artifact and capability gates.'
    ]
  };
}

function buildExperienceArchitectureManifest(
  turnId: string,
  result: RuntimeBaseResult,
  canvasStateManifest: AgentCanvasStateManifest
): AgentExperienceArchitectureManifest {
  const plan = result.experiencePlan;
  const supportedAudiences = Array.from(new Set(experienceTemplateRegistry.map((template) => template.audience)));
  const supportedObjectives = Array.from(new Set(experienceTemplateRegistry.map((template) => template.objective)));
  const supportedLayouts = Array.from(new Set(experienceTemplateRegistry.map((template) => template.layout)));
  const unknownViewIds = canvasStateManifest.renderedViewIds.filter((viewId) => !findDynamicView(viewId));
  const blockers = [
    unknownViewIds.length ? `Unregistered rendered views detected: ${unknownViewIds.join(', ')}.` : '',
    canvasStateManifest.arbitraryViewIdsAllowed ? 'Arbitrary view IDs are allowed, which violates the governed view registry.' : '',
    canvasStateManifest.dynamicUiGenerationEnabled ? 'Dynamic UI generation is enabled, which would bypass approved ExperiencePlan composition.' : '',
    plan && !findExperienceTemplate(plan.templateId) ? `Unapproved ExperiencePlan template detected: ${plan.templateId}.` : '',
    result.packet.evidenceGaps.length ? `${result.packet.evidenceGaps.length} packet evidence gaps remain visible before workspace promotion.` : ''
  ].filter(Boolean);

  return {
    id: 'agent-experience-architecture-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'approved_experience_plan_composition',
    activeTemplateId: plan?.templateId ?? null,
    activeAudience: plan?.audience ?? null,
    activeObjective: plan?.objective ?? null,
    activeLayout: plan?.layout ?? 'fallback_stack',
    approvedTemplateCount: experienceTemplateRegistry.length,
    approvedSkillCount: agentSkillRegistry.length,
    approvedViewCount: dynamicViewRegistry.length,
    supportedAudiences,
    supportedObjectives,
    supportedLayouts,
    renderedViewIds: canvasStateManifest.renderedViewIds,
    fallbackViewIds: canvasStateManifest.fallbackViewIds,
    unknownViewIds,
    artifactTypes: Array.from(new Set(plan?.artifacts.map((artifact) => artifact.type) ?? [])),
    humanReviewRequired: Boolean(plan?.humanReviewRequired),
    dynamicUiGenerationEnabled: false,
    arbitraryViewIdsAllowed: false,
    unsupportedMetricGenerationEnabled: false,
    newSourceClaimGenerationEnabled: false,
    compositionBlockers: blockers,
    nextCompositionStep: unknownViewIds.length
      ? 'Register a governed dynamic view before rendering this workspace.'
      : 'Keep expanding approved templates, evidence contracts, and review gates before enabling more flexible workspace composition.',
    guardrails: [
      'Role-specific workspaces must be composed from approved ExperiencePlan templates, skills, views, artifacts, evidence needs, and human-review gates.',
      'The runtime cannot generate arbitrary UI, unsupported metrics, or new source claims in the moment.',
      'Unsupported audiences, objectives, artifacts, or missing evidence must fail closed into a data-gap or review-required state.'
    ],
    caveats: [
      'Experience architecture is a runtime inspection rail, not a visual editor or arbitrary app generator.',
      'Specialist workspaces can be added by registering templates, skills, views, and evals rather than bypassing governance.',
      'Artifact export, source promotion, enterprise persistence, and full voice remain controlled by their own readiness and capability gates.'
    ]
  };
}

function buildInterruptionRecoveryManifest(
  turnId: string,
  result: RuntimeBaseResult,
  canvasStateManifest: AgentCanvasStateManifest
): AgentInterruptionRecoveryManifest {
  return {
    id: 'agent-interruption-recovery-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'single_turn_interruptible',
    relatedCanvasStateId: canvasStateManifest.id,
    focusedViewId: canvasStateManifest.focusedViewId,
    canInterruptCurrentTurn: true,
    preservesLastCompletedCanvas: true,
    noOverlappingRuns: true,
    clientStreamAbortSupported: true,
    serverSideCancelSupported: false,
    continuousVoiceBargeInEnabled: false,
    typedRecoveryPromptAvailable: true,
    suggestedRecoveryPrompts: [
      'Pause here and keep this canvas visible.',
      'Challenge the current read with the evidence gaps.',
      'Go one level deeper on the focused view.',
      'Package the current read as a review-required takeaway.'
    ],
    pendingGateIds: canvasStateManifest.pendingGateIds,
    guardrails: [
      'Interrupting a stream must preserve the last completed governed canvas.',
      'A new turn cannot start while another turn is running.',
      'Recovery prompts route through the same governed skill, view, evidence, memory, audit, and confirmation gates.',
      'Continuous voice barge-in remains disabled until consent, privacy, and interruption behavior are reviewed.'
    ],
    caveats: [
      'Interrupt support is client-side stream abort in Agent Lab, not server-side cancellation of every possible provider action.',
      'Interrupted partial output is not persisted as accepted memory or an artifact.',
      'Advanced realtime voice barge-in, rewind, and branch replay remain future work.'
    ]
  };
}

function reasoningStatusStep(
  turnId: string,
  index: number,
  phase: AgentReasoningStatusPhase,
  label: string,
  detail: string,
  extra: Partial<AgentReasoningStatusManifest['steps'][number]> = {}
): AgentReasoningStatusManifest['steps'][number] {
  return {
    id: `${turnId}-status-step-${String(index).padStart(2, '0')}-${phase}`,
    phase,
    label,
    detail,
    status: 'pass',
    publicOnly: true,
    relatedEventTypes: [],
    evidenceLabels: [],
    viewIds: [],
    artifactIds: [],
    gateIds: [],
    guardrails: [],
    ...extra
  };
}

function buildReasoningStatusManifest(
  turnId: string,
  result: RuntimeBaseResult,
  evidenceSpotlight: AgentEvidenceSpotlight[],
  canvasStateManifest: AgentCanvasStateManifest,
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest,
  confirmationGates: AgentConfirmationGate[]
): AgentReasoningStatusManifest {
  const evidence = evidenceLabels(result);
  const requiredGateIds = confirmationGates
    .filter((gate) => gate.status === 'required' || gate.status === 'blocked')
    .map((gate) => gate.id);
  const steps: AgentReasoningStatusManifest['steps'] = [
    reasoningStatusStep(
      turnId,
      1,
      'intake',
      'Received request',
      `Created a governed turn for ${result.packet.brand.brandName} and held prior canvas state until this turn completed.`,
      {
        relatedEventTypes: ['turn_started'],
        guardrails: ['No overlapping runs; interrupted turns do not replace the last completed canvas.']
      }
    ),
    reasoningStatusStep(
      turnId,
      2,
      'context',
      'Loaded working context',
      `${result.packet.evidenceGaps.length} packet gaps, ${result.acceptedMemory.length} accepted memory records, ${result.sourcePromotionContext.records.length} source candidates, and ${result.sourceClaimContext.records.length} source claims were surfaced as governed context.`,
      {
        relatedEventTypes: ['packet_ready', 'working_context_built'],
        evidenceLabels: evidence,
        guardrails: ['Reviewed-local sources and extracted claims remain non-canonical context.']
      }
    ),
    reasoningStatusStep(
      turnId,
      3,
      'skill',
      'Selected governed skill',
      `Routed to ${result.routedSkillId} with fallback ${result.fallbackUsed ? 'used' : 'not used'}.`,
      {
        relatedEventTypes: ['skill_routed'],
        guardrails: ['Skill IDs must come from the approved registry.']
      }
    ),
    reasoningStatusStep(
      turnId,
      4,
      'evidence',
      'Mapped claims to proof',
      `${evidenceSpotlight.length} claim spotlight records mapped answer claims to packet evidence, gaps, guardrails, or reviewed context.`,
      {
        status: evidenceSpotlight.some((item) => item.supportStatus === 'missing_evidence') ? 'watch' : 'pass',
        relatedEventTypes: ['evidence_spotlight_ready'],
        evidenceLabels: evidence,
        gateIds: requiredGateIds.slice(0, 4),
        guardrails: ['Evidence and gaps must remain visible beside every diagnosis, treatment path, or draft output.']
      }
    ),
    reasoningStatusStep(
      turnId,
      5,
      'experience',
      'Assembled approved workspace',
      `${result.experiencePlan?.templateId ?? 'fallback'} rendered ${canvasStateManifest.renderedViewIds.length} approved view modules with focused view ${canvasStateManifest.focusedViewId ?? 'none'}.`,
      {
        relatedEventTypes: ['experience_planned', 'canvas_state_ready', 'view_queued'],
        viewIds: canvasStateManifest.renderedViewIds,
        artifactIds: canvasStateManifest.artifactIds,
        guardrails: canvasStateManifest.guardrails
      }
    ),
    reasoningStatusStep(
      turnId,
      6,
      'governance',
      'Applied gates and recovery rails',
      `${requiredGateIds.length} pending or blocked gates remain visible; client interrupt preserves the last completed canvas and continuous voice barge-in remains disabled.`,
      {
        status: requiredGateIds.length ? 'watch' : 'pass',
        relatedEventTypes: ['interruption_recovery_ready', 'runtime_quality_checked'],
        gateIds: requiredGateIds.slice(0, 8),
        guardrails: interruptionRecoveryManifest.guardrails
      }
    ),
    reasoningStatusStep(
      turnId,
      7,
      'response',
      'Prepared governed answer',
      `Returned ${result.answer.dynamicViewRequests.length} requested view records, ${result.answer.missingEvidence.length} missing-evidence notes, and ${result.answer.guardrailsApplied.length} applied guardrails.`,
      {
        relatedEventTypes: ['answer_ready', 'turn_completed'],
        viewIds: result.answer.dynamicViewRequests.map((request) => request.viewId),
        guardrails: result.answer.guardrailsApplied.slice(0, 5)
      }
    )
  ];

  return {
    id: 'agent-reasoning-status-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'public_status_steps',
    streamEventType: 'reasoning_status_ready',
    privateReasoningExposed: false,
    steps,
    caveats: [
      'These are public operational status steps, not hidden chain-of-thought.',
      'Status steps explain which governed inputs, skills, views, evidence records, and gates were used.',
      'Use claim spotlight and evidence ledger for proof, not private reasoning text.'
    ],
    guardrails: [
      'Do not expose hidden reasoning or unreviewed chain-of-thought.',
      'Status steps must reference approved skills, evidence, views, gates, and guardrails only.',
      'Missing evidence should be shown as watch state rather than filled with invented detail.'
    ]
  };
}

function buildConversationPresenceManifest(
  turnId: string,
  result: RuntimeBaseResult,
  canvasStateManifest: AgentCanvasStateManifest,
  reasoningStatusManifest: AgentReasoningStatusManifest
): AgentConversationPresenceManifest {
  return {
    id: 'agent-conversation-presence-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'push_to_talk_streaming_presence',
    activeState: 'ready',
    stateSequence: ['ready', 'listening', 'routing', 'rendering', 'speaking'],
    pulseSources: ['voice_policy', 'runtime_events', 'canvas_state', 'status_steps', 'interruption_recovery'],
    visibleSignals: ['command_core', 'orchestration_bus', 'module_queue', 'status_steps', 'voice_policy', 'proof_rail'],
    voiceInputMode: agentVoicePolicy.defaultMode,
    consentBoundary: 'push_to_talk_click',
    streamEventSource: agentVoicePolicy.runtimeEventSource,
    continuousListeningEnabled: false,
    backgroundWakeWordEnabled: false,
    autonomousSpeakingEnabled: false,
    typedFallbackAvailable: true,
    preservesEvidenceAndGates: true,
    compatibleViewIds: canvasStateManifest.voiceCompatibleViewIds,
    currentStatusStepIds: reasoningStatusManifest.steps.map((step) => step.id),
    guardrails: [
      'Presence is a visible state layer over governed push-to-talk turns, not continuous listening.',
      'Presence cannot bypass evidence, memory, audit, or confirmation gates.',
      'Presence pulses are driven by runtime events, canvas state, interruption recovery, and public status steps.'
    ],
    caveats: [
      'Conversation presence is visual/runtime state only; TTS and background wake-word listening remain disabled.',
      'The active state is updated client-side in Agent Lab during a governed turn.',
      'Continuous voice requires consent, privacy, interruption, and runtime review before enablement.'
    ]
  };
}

function buildProviderAdapterManifest(
  turnId: string,
  result: RuntimeBaseResult,
  conversationPresenceManifest: AgentConversationPresenceManifest
): AgentProviderAdapterManifest {
  const adapters: AgentProviderAdapterManifest['adapters'] = [
    {
      id: 'text-reasoning-local',
      capability: 'text_reasoning',
      status: 'ready',
      runtimeBoundary: 'server',
      providerBinding: 'deterministic_local',
      endpoint: '/api/agent',
      consentRequired: false,
      usesServerSideSecrets: false,
      enabledInAgentLab: true,
      sharesAgentRuntime: true,
      evidenceAndGateParity: true,
      caveats: ['Runs through the governed deterministic skill router and Brand Intelligence Packet services.']
    },
    {
      id: 'agent-sse-stream',
      capability: 'server_sent_events',
      status: 'ready',
      runtimeBoundary: 'server',
      providerBinding: 'next_sse',
      endpoint: agentVoicePolicy.runtimeEventSource,
      consentRequired: false,
      usesServerSideSecrets: false,
      enabledInAgentLab: true,
      sharesAgentRuntime: true,
      evidenceAndGateParity: true,
      caveats: ['Streams public runtime events and the final governed turn result; it is not hidden reasoning.']
    },
    {
      id: 'browser-speech-single-turn',
      capability: 'browser_speech_to_text',
      status: 'prototype_client_only',
      runtimeBoundary: 'browser',
      providerBinding: 'browser_web_speech',
      endpoint: null,
      consentRequired: true,
      usesServerSideSecrets: false,
      enabledInAgentLab: true,
      sharesAgentRuntime: true,
      evidenceAndGateParity: true,
      caveats: ['Captures one prompt after a user click when browser support exists; typed input remains the fallback.']
    },
    {
      id: 'openai-realtime-live-consult-candidate',
      capability: 'realtime_voice',
      status: 'gated',
      runtimeBoundary: 'server',
      providerBinding: 'openai_realtime_candidate',
      endpoint: '/api/live-consult/session',
      consentRequired: true,
      usesServerSideSecrets: true,
      enabledInAgentLab: false,
      sharesAgentRuntime: false,
      evidenceAndGateParity: false,
      caveats: ['Live Consult has a Realtime session path, but it is not yet unified with runAgentTurn, ExperiencePlan views, memory, audit, and gates.']
    },
    {
      id: 'tts-not-connected',
      capability: 'text_to_speech',
      status: 'disabled',
      runtimeBoundary: 'not_connected',
      providerBinding: 'none',
      endpoint: null,
      consentRequired: true,
      usesServerSideSecrets: false,
      enabledInAgentLab: false,
      sharesAgentRuntime: false,
      evidenceAndGateParity: false,
      caveats: ['Text-to-speech is intentionally disabled until provider, consent, interruption, and review behavior are defined.']
    }
  ];

  return {
    id: 'agent-provider-adapter-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: 'adapter_readiness_map',
    adapters,
    readyAdapterIds: adapters.filter((adapter) => adapter.status === 'ready').map((adapter) => adapter.id),
    gatedAdapterIds: adapters.filter((adapter) => adapter.status === 'gated' || adapter.status === 'prototype_client_only').map((adapter) => adapter.id),
    disabledAdapterIds: adapters.filter((adapter) => adapter.status === 'disabled').map((adapter) => adapter.id),
    coreRuntimeAdapterId: 'text-reasoning-local',
    streamAdapterId: 'agent-sse-stream',
    activeVoiceInputAdapterId: 'browser-speech-single-turn',
    realtimeVoiceAdapterId: 'openai-realtime-live-consult-candidate',
    ttsAdapterId: 'tts-not-connected',
    continuousVoiceEnabled: false,
    serverSideRealtimeConnectedToAgentRuntime: false,
    ttsEnabled: false,
    requiresPolicyReviewFor: ['realtime_voice', 'text_to_speech'],
    guardrails: [
      'Provider adapters must preserve the same Brand Intelligence Packet, evidence spotlight, memory, audit, and confirmation gates as typed turns.',
      'Realtime voice and TTS cannot be enabled in Agent Lab until consent, interruption, privacy, and runtime parity are reviewed.',
      'Adapter readiness is an inspectable map, not permission to bypass runtime control or capability flags.'
    ],
    caveats: [
      `Current presence mode is ${conversationPresenceManifest.mode.replaceAll('_', ' ')}; continuous listening remains disabled.`,
      'Browser speech capture is a prototype client-side convenience and must fall back to typed input.',
      'The Live Consult Realtime endpoint remains a candidate adapter until unified with runAgentTurn and ExperiencePlan contracts.'
    ]
  };
}

function buildVoiceSkillViewContractManifest(
  turnId: string,
  result: RuntimeBaseResult
): AgentVoiceSkillViewContractManifest {
  const modeContracts = voiceSkillViewContract.voiceModes;
  const contractSkillIds = Array.from(new Set(modeContracts.flatMap((mode) => mode.allowedSkillIds)));
  const contractViewIds = Array.from(new Set(modeContracts.flatMap((mode) => [...mode.requiredViewIds, ...mode.optionalViewIds])));
  const requestedViewIds = Array.from(new Set([
    ...(result.experiencePlan?.viewManifest ?? []).map((view) => view.renderedViewId),
    ...result.answer.dynamicViewRequests.map((request) => request.viewId)
  ].filter(Boolean)));
  const activeVoiceCompatibleViewIds = requestedViewIds.filter((viewId) => {
    const view = findDynamicView(viewId);
    return contractViewIds.includes(viewId) && Boolean(view?.supportedModes.includes('voice_canvas'));
  });
  const activeIncompatibleViewIds = requestedViewIds.filter((viewId) => !activeVoiceCompatibleViewIds.includes(viewId));
  const readyModeIds = modeContracts.filter((mode) => mode.status === 'ready').map((mode) => mode.id);
  const gatedModeIds = modeContracts.filter((mode) => mode.status === 'gated').map((mode) => mode.id);
  const blockedModeIds = modeContracts.filter((mode) => mode.status === 'blocked').map((mode) => mode.id);
  const requiredReadinessIds = Array.from(new Set(modeContracts.flatMap((mode) => mode.requiredReadinessIds)));
  const blockedReadinessIds = Array.from(new Set(modeContracts.flatMap((mode) => mode.blockedUntil)));
  const activeSkillVoiceCompatible = contractSkillIds.includes(result.routedSkillId);
  const activeViewsVoiceCompatible = activeIncompatibleViewIds.length === 0 && activeVoiceCompatibleViewIds.length > 0;
  const pushToTalkContractReady = readyModeIds.includes('push_to_talk')
    && activeSkillVoiceCompatible
    && activeViewsVoiceCompatible;

  return {
    id: 'agent-voice-skill-view-contract-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: voiceSkillViewContract.mode,
    contractId: voiceSkillViewContract.id,
    defaultVoiceMode: agentVoicePolicy.defaultMode,
    activeSkillId: result.routedSkillId,
    activeSkillVoiceCompatible,
    activeRequestedViewIds: requestedViewIds,
    activeVoiceCompatibleViewIds,
    activeIncompatibleViewIds,
    allowedModeIds: modeContracts.map((mode) => mode.id),
    gatedModeIds,
    blockedModeIds,
    readyModeIds,
    contractSkillIds,
    contractViewIds,
    requiredReadinessIds,
    blockedReadinessIds,
    statePhases: voiceSkillViewContract.statePhases,
    visibleStatePhaseIds: voiceSkillViewContract.statePhases.filter((phase) => phase.visibleToUser).map((phase) => phase.id),
    pushToTalkContractReady,
    wakeListenContractReady: false,
    continuousContractReady: false,
    realtimeContractReady: false,
    ttsContractReady: false,
    continuousVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    arbitrarySkillRoutingEnabled: false,
    arbitraryViewGenerationEnabled: false,
    guardrails: voiceSkillViewContract.guardrails,
    caveats: voiceSkillViewContract.caveats
  };
}

function buildVoiceOrchestrationReadinessManifest(
  turnId: string,
  result: RuntimeBaseResult,
  conversationPresenceManifest: AgentConversationPresenceManifest,
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest,
  providerAdapterManifest: AgentProviderAdapterManifest,
  voiceSkillViewContractManifest: AgentVoiceSkillViewContractManifest
): AgentVoiceOrchestrationReadinessManifest {
  const providerById = new Map(providerAdapterManifest.adapters.map((adapter) => [adapter.id, adapter]));
  const requirements: AgentVoiceOrchestrationReadinessManifest['requirements'] = voiceOrchestrationReadinessRequirements.requirements.map((requirement) => {
    if (requirement.id === 'same-runtime-evidence-gates') {
      const ready = providerById.get(providerAdapterManifest.activeVoiceInputAdapterId)?.sharesAgentRuntime === true
        && providerById.get(providerAdapterManifest.activeVoiceInputAdapterId)?.evidenceAndGateParity === true;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Active voice input is not yet bound to the governed runtime and proof rails.']
      };
    }
    if (requirement.id === 'streaming-status-and-canvas-parity') {
      const ready = conversationPresenceManifest.streamEventSource === agentVoicePolicy.runtimeEventSource
        && conversationPresenceManifest.preservesEvidenceAndGates
        && conversationPresenceManifest.compatibleViewIds.length > 0
        && voiceSkillViewContractManifest.activeIncompatibleViewIds.length === 0;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Voice-compatible ExperiencePlan views or stream parity are missing.']
      };
    }
    if (requirement.id === 'push-to-talk-consent-boundary') {
      const ready = conversationPresenceManifest.consentBoundary === 'push_to_talk_click'
        && conversationPresenceManifest.typedFallbackAvailable
        && !conversationPresenceManifest.continuousListeningEnabled;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : ['Push-to-talk consent, typed fallback, or disabled continuous capture is not satisfied.']
      };
    }
    if (requirement.id === 'browser-stt-prototype-fallback') {
      const adapter = providerById.get(providerAdapterManifest.activeVoiceInputAdapterId);
      const prototypeReady = adapter?.status === 'prototype_client_only'
        && adapter.enabledInAgentLab
        && conversationPresenceManifest.typedFallbackAvailable;
      return {
        ...requirement,
        status: prototypeReady ? 'prototype_ready' as const : 'blocked' as const,
        blockers: prototypeReady ? requirement.blockers : ['Browser speech fallback is not available or typed fallback is missing.']
      };
    }
    if (requirement.id === 'realtime-runtime-unification') {
      const adapter = providerById.get(providerAdapterManifest.realtimeVoiceAdapterId);
      const ready = adapter?.status === 'ready'
        && providerAdapterManifest.serverSideRealtimeConnectedToAgentRuntime
        && adapter.sharesAgentRuntime
        && adapter.evidenceAndGateParity;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : requirement.blockers
      };
    }
    if (requirement.id === 'interruption-and-server-cancel') {
      const ready = interruptionRecoveryManifest.serverSideCancelSupported
        && !interruptionRecoveryManifest.continuousVoiceBargeInEnabled
        && interruptionRecoveryManifest.noOverlappingRuns;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : requirement.blockers
      };
    }
    if (requirement.id === 'continuous-consent-privacy-review') {
      const ready = agentVoicePolicy.enabledModes.includes('continuous')
        && !agentVoicePolicy.disabledModes.includes('continuous')
        && providerAdapterManifest.continuousVoiceEnabled;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : requirement.blockers
      };
    }
    if (requirement.id === 'tts-provider-and-speaking-policy') {
      const adapter = providerById.get(providerAdapterManifest.ttsAdapterId);
      const ready = adapter?.status === 'ready' && providerAdapterManifest.ttsEnabled;
      return {
        ...requirement,
        status: ready ? 'ready' as const : 'blocked' as const,
        blockers: ready ? [] : requirement.blockers
      };
    }
    if (requirement.id === 'enterprise-voice-memory-storage') {
      return {
        ...requirement,
        status: 'blocked' as const,
        blockers: requirement.blockers
      };
    }
    return requirement;
  });
  const readyRequirementIds = requirements.filter((requirement) => requirement.status === 'ready').map((requirement) => requirement.id);
  const prototypeRequirementIds = requirements.filter((requirement) => requirement.status === 'prototype_ready').map((requirement) => requirement.id);
  const blockedRequirementIds = requirements.filter((requirement) => requirement.status === 'blocked').map((requirement) => requirement.id);

  return {
    id: 'agent-voice-orchestration-readiness-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    mode: voiceOrchestrationReadinessRequirements.mode,
    fullVoiceEnabled: false,
    wakeListenEnabled: false,
    continuousVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    realtimeRuntimeParity: providerAdapterManifest.serverSideRealtimeConnectedToAgentRuntime,
    readyRequirementIds,
    prototypeRequirementIds,
    blockedRequirementIds,
    requirements,
    nextPromotionStep: blockedRequirementIds.includes('realtime-runtime-unification')
      ? 'Build a gated Realtime adapter that calls runAgentTurn and proves evidence, view, memory, audit, and gate parity.'
      : 'Review blocked voice requirements before promoting wake/listen, continuous voice, Realtime voice, or TTS.',
    guardrails: [...voiceOrchestrationReadinessRequirements.guardrails, voiceSkillViewContractManifest.guardrails[0]].filter(Boolean),
    caveats: voiceOrchestrationReadinessRequirements.caveats
  };
}

function buildEvents(
  turnId: string,
  result: RuntimeBaseResult,
  runtimeSurfaceManifest: AgentRuntimeSurfaceManifest,
  workingContextManifest: AgentWorkingContextManifest,
  sourceGovernanceManifest: AgentSourceGovernanceManifest,
  persistenceReadinessManifest: AgentPersistenceReadinessManifest,
  reviewIdentityManifest: AgentReviewIdentityManifest,
  proactivityManifest: AgentProactivityManifest,
  pilotLearningManifest: AgentPilotLearningManifest,
  treatmentOutcomeReadinessManifest: AgentTreatmentOutcomeReadinessManifest,
  canvasStateManifest: AgentCanvasStateManifest,
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest,
  reasoningStatusManifest: AgentReasoningStatusManifest,
  conversationPresenceManifest: AgentConversationPresenceManifest,
  providerAdapterManifest: AgentProviderAdapterManifest,
  voiceSkillViewContractManifest: AgentVoiceSkillViewContractManifest,
  voiceOrchestrationReadinessManifest: AgentVoiceOrchestrationReadinessManifest,
  experienceArchitectureManifest: AgentExperienceArchitectureManifest,
  memory: AgentMemoryRecord[],
  audit: AgentAuditRecord[],
  evidenceSpotlight: AgentEvidenceSpotlight[],
  runtimeQualityChecks: AgentRuntimeQualityCheck[]
): AgentTurnEvent[] {
  const events: AgentTurnEvent[] = [];
  const push = (
    type: AgentTurnEventType,
    label: string,
    detail: string,
    extra: Partial<AgentTurnEvent> = {}
  ) => events.push(event(turnId, events.length + 1, type, label, detail, extra));

  push('turn_started', 'Turn started', `Started governed agent turn for ${result.packet.brand.brandName}.`);
  push('packet_ready', 'Packet ready', `Loaded Brand Intelligence Packet with ${result.packet.evidenceGaps.length} evidence gaps.`);
  push(
    'runtime_surface_ready',
    'Runtime surface ready',
    `${runtimeSurfaceManifest.activeSurfaceId} uses ${runtimeSurfaceManifest.activeRuntimePath}; ${runtimeSurfaceManifest.readySurfaceIds.length} ready, ${runtimeSurfaceManifest.optInSurfaceIds.length} opt-in, ${runtimeSurfaceManifest.gatedSurfaceIds.length} gated, and ${runtimeSurfaceManifest.disabledSurfaceIds.length} disabled surfaces remain visible.`
  );
  if (result.acceptedMemory.length) {
    push('memory_loaded', 'Accepted memory loaded', `${result.acceptedMemory.length} human-reviewed memory records loaded as working context.`);
  }
  push(
    'working_context_built',
    'Working context built',
    `${workingContextManifest.loadedContextTypes.length} context layers loaded; ${workingContextManifest.suggestedMemoryCount} suggested memory records remain review-controlled.`
  );
  push(
    'source_governance_ready',
    'Source governance ready',
    `${sourceGovernanceManifest.sourcePromotionCandidateCount} source candidates and ${sourceGovernanceManifest.sourceClaimCandidateCount} source claims are review context only; canonical writes and runtime consumption remain disabled.`
  );
  push(
    'persistence_readiness_checked',
    'Persistence readiness checked',
    `${persistenceReadinessManifest.currentStorageMode.replaceAll('_', ' ')} with ${persistenceReadinessManifest.blockedRequirementIds.length} enterprise promotion blockers.`
  );
  push(
    'review_identity_checked',
    'Review identity checked',
    `${reviewIdentityManifest.prototypeReviewerLabel} review label is local/prototype only; official approvals are blocked until enterprise identity and access control are connected.`
  );
  push('skill_routed', 'Skill routed', `Selected ${result.routedSkillId}.`, { skillId: result.routedSkillId });
  push('answer_ready', 'Answer ready', result.answer.headline, { skillId: result.routedSkillId });
  push('evidence_spotlight_ready', 'Evidence spotlight ready', `${evidenceSpotlight.length} claims mapped to evidence, gaps, guardrails, or reviewed context.`);

  if (result.experiencePlan) {
    push(
      'experience_planned',
      'Experience planned',
      `${result.experiencePlan.templateId} rendered as ${result.experiencePlan.layout}.`
    );
    push(
      'canvas_state_ready',
      'Canvas state ready',
      `${canvasStateManifest.renderedViewIds.length} governed views active; focused view ${canvasStateManifest.focusedViewId ?? 'none'}.`
    );
    push(
      'experience_architecture_ready',
      'Experience architecture ready',
      `${experienceArchitectureManifest.approvedTemplateCount} approved templates, ${experienceArchitectureManifest.approvedSkillCount} skills, and ${experienceArchitectureManifest.approvedViewCount} views constrain this workspace; arbitrary UI remains blocked.`
    );
    push(
      'interruption_recovery_ready',
      'Interruption recovery ready',
      `${interruptionRecoveryManifest.mode.replaceAll('_', ' ')}; current canvas is preserved until the next completed governed turn.`
    );
    push(
      'reasoning_status_ready',
      'Status steps ready',
      `${reasoningStatusManifest.steps.length} public operational status steps are available without exposing private reasoning.`
    );
    push(
      'conversation_presence_ready',
      'Conversation presence ready',
      `${conversationPresenceManifest.mode.replaceAll('_', ' ')} is visible across ${conversationPresenceManifest.visibleSignals.length} Agent Lab signals; continuous listening remains disabled.`
    );
    push(
      'provider_adapters_ready',
      'Provider adapters ready',
      `${providerAdapterManifest.readyAdapterIds.length} ready adapters; realtime voice and TTS remain gated or disabled.`
    );
    push(
      'voice_orchestration_contract_ready',
      'Voice skill/view contract ready',
      `${voiceSkillViewContractManifest.activeVoiceCompatibleViewIds.length} approved voice-canvas views are connected to ${voiceSkillViewContractManifest.activeSkillId}; continuous, Realtime, and TTS contracts remain disabled.`
    );
    push(
      'voice_orchestration_readiness_checked',
      'Voice orchestration readiness checked',
      `${voiceOrchestrationReadinessManifest.readyRequirementIds.length} ready, ${voiceOrchestrationReadinessManifest.prototypeRequirementIds.length} prototype-ready, and ${voiceOrchestrationReadinessManifest.blockedRequirementIds.length} blocked voice requirements; full voice remains gated.`
    );
    for (const zone of result.experiencePlan.zones) {
      push(
        'view_queued',
        `View queued: ${zone.title}`,
        zone.requiredDataAvailable ? zone.reason : `${zone.reason} Falling back to ${zone.fallbackViewId ?? 'data_gap_panel'}.`,
        { viewId: zone.viewId, skillId: zone.skillId }
      );
    }
    for (const artifact of result.experiencePlan.artifacts) {
      push(
        'artifact_ready',
        `Artifact: ${artifact.label}`,
        `${artifact.status.replaceAll('_', ' ')} · ${artifact.governance.circulationStatus.replaceAll('_', ' ')}${artifact.humanReviewRequired ? ' · human review required' : ''}.`,
        { artifactId: artifact.id, skillId: artifact.sourceSkillId }
      );
    }
  }

  push(
    'runtime_quality_checked',
    'Runtime quality checked',
    `${runtimeQualityChecks.filter((check) => check.status === 'pass').length}/${runtimeQualityChecks.length} checks passed; ${runtimeQualityChecks.filter((check) => check.status !== 'pass').length} remain watch or blocked.`
  );
  for (const guardrail of result.answer.guardrailsApplied.slice(0, 5)) {
    push('guardrail_applied', 'Guardrail applied', guardrail, { guardrail });
  }
  push('memory_suggested', 'Memory suggested', `${memory.length} memory records suggested for human review.`);
  push(
    'proactivity_suggested',
    'Quiet follow-ups suggested',
    `${proactivityManifest.suggestions.length} suggestions and ${proactivityManifest.heldNotices.length} held notices emitted; autonomous actions remain disabled.`
  );
  push(
    'pilot_learning_ready',
    'Pilot learning ready',
    `${pilotLearningManifest.signals.length} reviewed learning signals available; ${pilotLearningManifest.blockedLearningPaths.length} autonomous or canonical learning paths remain blocked.`
  );
  push(
    'treatment_outcome_readiness_checked',
    'Treatment outcome readiness checked',
    `${treatmentOutcomeReadinessManifest.readyRequirementIds.length} ready and ${treatmentOutcomeReadinessManifest.blockedRequirementIds.length} blocked outcome-learning requirements; treatment outcome claims remain disabled.`
  );
  push('audit_recorded', 'Audit recorded', `${audit.length} audit records created for this turn.`);
  push('turn_completed', 'Turn complete', 'Grounded answer, evidence, views, guardrails, and experience plan are ready.');
  return events;
}

function buildVoiceRuntimeManifest(turnId: string, events: AgentTurnEvent[], result: RuntimeBaseResult): AgentVoiceRuntimeManifest {
  const compatibleViewIds = (result.experiencePlan?.viewManifest ?? [])
    .filter((view) => view.supportedModes.includes('voice_canvas'))
    .map((view) => view.renderedViewId);

  return {
    id: 'agent-voice-runtime-manifest-v1',
    turnId,
    runtimeEventSource: agentVoicePolicy.runtimeEventSource,
    defaultMode: agentVoicePolicy.defaultMode,
    enabledModes: agentVoicePolicy.enabledModes,
    disabledModes: agentVoicePolicy.disabledModes,
    consentBoundary: 'push_to_talk_click',
    typedFallbackAvailable: true,
    continuousModeEnabled: false,
    interruptHandling: agentVoicePolicy.interruptHandling,
    streamEventTypes: Array.from(new Set(events.map((event) => event.type))),
    compatibleViewIds: Array.from(new Set(compatibleViewIds)),
    usesGovernedRuntime: true,
    usesSameEvidenceAndGatesAsTypedTurn: true,
    guardrails: agentVoicePolicy.guardrails,
    caveats: agentVoicePolicy.caveats
  };
}

function buildRuntimeControlManifest(
  turnId: string,
  capabilities: AgentCapabilityDefinition[]
): AgentRuntimeControlManifest {
  return {
    id: 'agent-runtime-control-manifest-v1',
    turnId,
    runtimePolicyId: agentRuntimePolicy.id,
    runtimeEnabled: agentRuntimePolicy.runtimeEnabled,
    killSwitchActive: agentRuntimePolicy.killSwitchActive,
    mode: agentRuntimePolicy.mode,
    degradedModeFallback: agentRuntimePolicy.degradedModeFallback,
    emergencyStopScope: agentRuntimePolicy.emergencyStopScope,
    riskyCapabilitiesDisabled: capabilities
      .filter((capability) => !capability.enabled)
      .map((capability) => capability.id),
    adminOverrideRequiredFor: agentRuntimePolicy.adminOverrideRequiredFor,
    failClosedIfActivated: true,
    canBypassEvidenceOrReview: false,
    caveats: agentRuntimePolicy.caveats,
    guardrails: agentRuntimePolicy.guardrails
  };
}

function qualityCheck(
  id: string,
  label: string,
  status: AgentRuntimeQualityCheck['status'],
  detail: string,
  extra: Partial<AgentRuntimeQualityCheck> = {}
): AgentRuntimeQualityCheck {
  return {
    id,
    label,
    status,
    detail,
    evidenceLabels: [],
    relatedGateIds: [],
    guardrails: [],
    humanReviewRequired: status !== 'pass',
    ...extra
  };
}

function runtimeSurfaceFor(surfaceId?: string) {
  return governedRuntimeSurfaceRegistry.surfaces.find((surface) => surface.id === surfaceId)
    ?? governedRuntimeSurfaceRegistry.surfaces.find((surface) => surface.id === 'api-agent-json')
    ?? governedRuntimeSurfaceRegistry.surfaces[0];
}

function buildRuntimeSurfaceManifest(
  turnId: string,
  result: RuntimeBaseResult,
  surfaceId?: string
): AgentRuntimeSurfaceManifest {
  const activeSurface = runtimeSurfaceFor(surfaceId);
  const readySurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.status === 'ready')
    .map((surface) => surface.id);
  const optInSurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.status === 'ready_opt_in')
    .map((surface) => surface.id);
  const legacySurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.status === 'legacy_stable')
    .map((surface) => surface.id);
  const gatedSurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.status === 'gated')
    .map((surface) => surface.id);
  const disabledSurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.status === 'disabled')
    .map((surface) => surface.id);
  const governedDefaultSurfaceIds = governedRuntimeSurfaceRegistry.surfaces
    .filter((surface) => surface.defaultState === 'governed_default')
    .map((surface) => surface.id);

  return {
    id: 'agent-runtime-surface-manifest-v1',
    turnId,
    brandId: result.packet.brand.brandId,
    brandName: result.packet.brand.brandName,
    registryId: 'governed-runtime-surface-registry-v1',
    activeSurfaceId: activeSurface.id,
    activeSurfaceName: activeSurface.name,
    activeSurfaceType: activeSurface.surfaceType,
    activeSurfaceStatus: activeSurface.status,
    activeDefaultState: activeSurface.defaultState,
    activeRuntimePath: activeSurface.runtimePath,
    activeProofSurface: activeSurface.proofSurface,
    activeSessionStrategy: activeSurface.sessionStrategy,
    activePersistence: activeSurface.persistence,
    activeStreaming: activeSurface.streaming,
    activeVoice: activeSurface.voice,
    usesGovernedRuntime: activeSurface.runtimePath === 'runAgentTurn',
    isGovernedDefault: activeSurface.defaultState === 'governed_default',
    isOptIn: activeSurface.defaultState === 'governed_opt_in',
    isLegacyStable: activeSurface.status === 'legacy_stable',
    isGated: activeSurface.status === 'gated',
    isDisabled: activeSurface.status === 'disabled',
    readySurfaceIds,
    optInSurfaceIds,
    legacySurfaceIds,
    gatedSurfaceIds,
    disabledSurfaceIds,
    governedDefaultSurfaceIds,
    connectedRuntimeRails: activeSurface.connectedRuntimeRails,
    gates: activeSurface.gates,
    defaultScopedChatPreserved: true,
    fullVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    continuousVoiceEnabled: false,
    proofRequired: true,
    nextSurfaceStep: activeSurface.nextStep,
    guardrails: [
      ...governedRuntimeSurfaceRegistry.guardrails,
      ...activeSurface.guardrails
    ],
    caveats: [
      ...governedRuntimeSurfaceRegistry.caveats,
      `Active surface route: ${activeSurface.route}.`,
      activeSurface.status === 'gated' || activeSurface.status === 'disabled'
        ? 'This surface is represented for governance visibility only and must not be treated as enabled by a turn manifest.'
        : 'This manifest proves the surface posture for the current governed turn; it does not change default routing.'
    ]
  };
}

function buildRuntimeQualityChecks(
  result: RuntimeBaseResult,
  workingContextManifest: AgentWorkingContextManifest,
  sourceGovernanceManifest: AgentSourceGovernanceManifest,
  persistenceReadinessManifest: AgentPersistenceReadinessManifest,
  reviewIdentityManifest: AgentReviewIdentityManifest,
  proactivityManifest: AgentProactivityManifest,
  pilotLearningManifest: AgentPilotLearningManifest,
  treatmentOutcomeReadinessManifest: AgentTreatmentOutcomeReadinessManifest,
  canvasStateManifest: AgentCanvasStateManifest,
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest,
  reasoningStatusManifest: AgentReasoningStatusManifest,
  conversationPresenceManifest: AgentConversationPresenceManifest,
  providerAdapterManifest: AgentProviderAdapterManifest,
  voiceSkillViewContractManifest: AgentVoiceSkillViewContractManifest,
  voiceOrchestrationReadinessManifest: AgentVoiceOrchestrationReadinessManifest,
  experienceArchitectureManifest: AgentExperienceArchitectureManifest,
  runtimeControlManifest: AgentRuntimeControlManifest,
  runtimeSurfaceManifest: AgentRuntimeSurfaceManifest,
  memory: AgentMemoryRecord[],
  confirmationGates: AgentConfirmationGate[],
  capabilities: AgentCapabilityDefinition[],
  evidenceSpotlight: AgentEvidenceSpotlight[]
): AgentRuntimeQualityCheck[] {
  const checks: AgentRuntimeQualityCheck[] = [];
  const templateApproved = Boolean(result.experiencePlan && findExperienceTemplate(result.experiencePlan.templateId));
  const renderedViewIds = result.experiencePlan?.viewManifest.map((view) => view.renderedViewId) ?? [];
  const unapprovedViewIds = renderedViewIds.filter((viewId) => !findDynamicView(viewId));
  const artifactGates = result.experiencePlan?.artifacts
    .filter((artifact) => artifact.humanReviewRequired)
    .map((artifact) => artifact.governance.reviewGateId)
    .filter((id): id is string => Boolean(id)) ?? [];
  const missingArtifactGateIds = artifactGates.filter((gateId) => !confirmationGates.some((gate) => gate.id === gateId));
  const exportCapability = capabilities.find((capability) => capability.id === 'artifact_export');
  const continuousVoiceCapability = capabilities.find((capability) => capability.id === 'voice_continuous_mode');
  const unsafeSerializedAnswer = JSON.stringify(result.answer).toLowerCase();

  checks.push(qualityCheck(
    'working-context-review-controlled',
    'Working context review-controlled',
    !workingContextManifest.autoAcceptMemoryEnabled
      && !workingContextManifest.sourcePromotionAutoConsumption
      && !workingContextManifest.sourceClaimAutoConsumption
      && !workingContextManifest.canonicalSourceWriteEnabled
      && !workingContextManifest.canonicalClaimWriteEnabled
      ? 'pass'
      : 'blocked',
    `${workingContextManifest.acceptedMemory.length} accepted memory records loaded; ${workingContextManifest.suggestedMemoryCount} suggested memory records remain review-controlled.`,
    {
      relatedGateIds: [
        ...workingContextManifest.memoryReviewGateIds.slice(0, 4),
        ...workingContextManifest.sourceReviewGateIds.slice(0, 4)
      ],
      guardrails: workingContextManifest.caveats
    }
  ));

  checks.push(qualityCheck(
    'persistence-readiness-gated',
    'Persistence readiness gated',
    persistenceReadinessManifest.currentStorageMode === 'browser_local_and_local_json_prototype'
      && persistenceReadinessManifest.browserLocalLedgerEnabled
      && persistenceReadinessManifest.localJsonPersistenceEnabled
      && !persistenceReadinessManifest.enterprisePersistenceEnabled
      && persistenceReadinessManifest.reviewActionsEnabled
      && persistenceReadinessManifest.acceptedMemoryLoadsIntoContext
      && !persistenceReadinessManifest.canonicalSourceWritesEnabled
      && !persistenceReadinessManifest.sourceRuntimeAutoConsumptionEnabled
      && persistenceReadinessManifest.blockedRequirementIds.includes('enterprise-database-schema')
      && persistenceReadinessManifest.blockedRequirementIds.includes('reviewer-identity-access-control')
      ? 'pass'
      : 'blocked',
    `${persistenceReadinessManifest.readyRequirementIds.length} persistence requirements ready, ${persistenceReadinessManifest.prototypeRequirementIds.length} prototype-ready, and ${persistenceReadinessManifest.blockedRequirementIds.length} blocked; enterprise persistence remains disabled.`,
    {
      guardrails: persistenceReadinessManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'review-identity-prototype-only',
    'Review identity prototype-only',
    reviewIdentityManifest.mode === 'prototype_reviewer_label_only'
      && reviewIdentityManifest.prototypeReviewerLabel === 'human_review'
      && reviewIdentityManifest.reviewActionsUsePrototypeIdentity
      && reviewIdentityManifest.localReviewWorkflowEnabled
      && !reviewIdentityManifest.enterpriseIdentityEnabled
      && !reviewIdentityManifest.roleBasedAccessEnabled
      && !reviewIdentityManifest.brandAccessControlEnabled
      && !reviewIdentityManifest.officialApprovalEnabled
      && reviewIdentityManifest.officialApprovalBlocked
      ? 'pass'
      : 'blocked',
    `${reviewIdentityManifest.prototypeReviewerLabel} can support local review workflow, but enterprise identity, access control, and official approvals remain disabled.`,
    {
      relatedGateIds: reviewIdentityManifest.relatedGateIds.slice(0, 8),
      guardrails: reviewIdentityManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'quiet-proactivity-non-autonomous',
    'Quiet proactivity non-autonomous',
    !proactivityManifest.autonomousActionsEnabled
      && !proactivityManifest.scheduledNotificationsEnabled
      && !proactivityManifest.externalSendEnabled
      && !proactivityManifest.canCreateReminders
      && proactivityManifest.noOverlappingRuns
      ? 'pass'
      : 'blocked',
    `${proactivityManifest.suggestions.length} follow-up suggestions emitted; scheduled reminders, external sends, background runs, and autonomous actions remain disabled.`,
    {
      relatedGateIds: proactivityManifest.suggestions.flatMap((suggestion) => suggestion.relatedGateIds).slice(0, 8),
      guardrails: proactivityManifest.caveats
    }
  ));

  checks.push(qualityCheck(
    'pilot-learning-review-controlled',
    'Pilot learning review-controlled',
    pilotLearningManifest.mode === 'reviewed_learning_signals_only'
      && pilotLearningManifest.learningLoopEnabled
      && !pilotLearningManifest.autonomousLearningEnabled
      && !pilotLearningManifest.outcomeLearningEnabled
      && !pilotLearningManifest.canonicalMemoryWriteEnabled
      && !pilotLearningManifest.canonicalSourceWriteEnabled
      && !pilotLearningManifest.treatmentOutcomeClaimsEnabled
      && pilotLearningManifest.signals.length >= 6
      && pilotLearningManifest.signals.every((signal) => signal.humanReviewRequired)
      ? 'pass'
      : 'blocked',
    `${pilotLearningManifest.signals.length} pilot learning signals captured for review; autonomous learning, outcome learning, canonical memory/source writes, and treatment outcome claims remain disabled.`,
    {
      relatedGateIds: pilotLearningManifest.relatedReviewGateIds.slice(0, 8),
      guardrails: pilotLearningManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'treatment-outcome-learning-gated',
    'Treatment outcome learning gated',
    treatmentOutcomeReadinessManifest.mode === 'outcome_learning_promotion_checklist'
      && !treatmentOutcomeReadinessManifest.outcomeLearningEnabled
      && !treatmentOutcomeReadinessManifest.treatmentOutcomeClaimsEnabled
      && !treatmentOutcomeReadinessManifest.acceptedOutcomeRecordStoreEnabled
      && !treatmentOutcomeReadinessManifest.canonicalLearningStoreEnabled
      && treatmentOutcomeReadinessManifest.blockedRequirementIds.includes('outcome-record-schema')
      && treatmentOutcomeReadinessManifest.blockedRequirementIds.includes('canonical-learning-governance')
      ? 'pass'
      : 'blocked',
    `${treatmentOutcomeReadinessManifest.relatedTreatmentIds.length} treatment paths and ${treatmentOutcomeReadinessManifest.relatedFollowUpSignals.length} follow-up signals are visible, but outcome learning, efficacy claims, accepted outcome records, and canonical learning writes remain disabled.`,
    {
      guardrails: treatmentOutcomeReadinessManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'canvas-state-governed',
    'Canvas state governed',
    canvasStateManifest.mode === 'experience_plan_driven'
      && !canvasStateManifest.dynamicUiGenerationEnabled
      && !canvasStateManifest.arbitraryViewIdsAllowed
      && canvasStateManifest.preservesCanvasUntilNextTurn
      && canvasStateManifest.renderedViewIds.every((viewId) => Boolean(findDynamicView(viewId)))
      ? 'pass'
      : 'blocked',
    `${canvasStateManifest.renderedViewIds.length} rendered views, ${canvasStateManifest.artifactIds.length} artifacts, and ${canvasStateManifest.pendingGateIds.length} gates are mapped from the governed canvas manifest.`,
    {
      relatedGateIds: canvasStateManifest.pendingGateIds.slice(0, 8),
      guardrails: canvasStateManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'experience-architecture-governed',
    'Experience architecture governed',
    experienceArchitectureManifest.mode === 'approved_experience_plan_composition'
      && experienceArchitectureManifest.unknownViewIds.length === 0
      && !experienceArchitectureManifest.dynamicUiGenerationEnabled
      && !experienceArchitectureManifest.arbitraryViewIdsAllowed
      && !experienceArchitectureManifest.unsupportedMetricGenerationEnabled
      && !experienceArchitectureManifest.newSourceClaimGenerationEnabled
      && Boolean(result.experiencePlan && findExperienceTemplate(result.experiencePlan.templateId))
      ? 'pass'
      : 'blocked',
    `${experienceArchitectureManifest.approvedTemplateCount} templates, ${experienceArchitectureManifest.approvedSkillCount} skills, and ${experienceArchitectureManifest.approvedViewCount} views constrain workspace composition; arbitrary UI and unsupported metric/source generation remain disabled.`,
    { guardrails: experienceArchitectureManifest.guardrails }
  ));

  checks.push(qualityCheck(
    'interruption-recovery-governed',
    'Interruption recovery governed',
    interruptionRecoveryManifest.canInterruptCurrentTurn
      && interruptionRecoveryManifest.preservesLastCompletedCanvas
      && interruptionRecoveryManifest.noOverlappingRuns
      && interruptionRecoveryManifest.clientStreamAbortSupported
      && !interruptionRecoveryManifest.serverSideCancelSupported
      && !interruptionRecoveryManifest.continuousVoiceBargeInEnabled
      && interruptionRecoveryManifest.relatedCanvasStateId === canvasStateManifest.id
      ? 'pass'
      : 'blocked',
    `${interruptionRecoveryManifest.mode.replaceAll('_', ' ')} recovery preserves the last completed canvas, blocks overlapping runs, and keeps continuous voice barge-in disabled.`,
    {
      relatedGateIds: interruptionRecoveryManifest.pendingGateIds.slice(0, 8),
      guardrails: interruptionRecoveryManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'reasoning-status-public-only',
    'Reasoning status public-only',
    reasoningStatusManifest.mode === 'public_status_steps'
      && reasoningStatusManifest.streamEventType === 'reasoning_status_ready'
      && !reasoningStatusManifest.privateReasoningExposed
      && reasoningStatusManifest.steps.length >= 6
      && reasoningStatusManifest.steps.every((step) => step.publicOnly)
      ? 'pass'
      : 'blocked',
    `${reasoningStatusManifest.steps.length} public status steps emitted; hidden reasoning remains unexposed.`,
    {
      relatedGateIds: reasoningStatusManifest.steps.flatMap((step) => step.gateIds).slice(0, 8),
      guardrails: reasoningStatusManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'conversation-presence-governed',
    'Conversation presence governed',
    conversationPresenceManifest.mode === 'push_to_talk_streaming_presence'
      && conversationPresenceManifest.consentBoundary === 'push_to_talk_click'
      && conversationPresenceManifest.streamEventSource === agentVoicePolicy.runtimeEventSource
      && conversationPresenceManifest.voiceInputMode === agentVoicePolicy.defaultMode
      && !conversationPresenceManifest.continuousListeningEnabled
      && !conversationPresenceManifest.backgroundWakeWordEnabled
      && !conversationPresenceManifest.autonomousSpeakingEnabled
      && conversationPresenceManifest.typedFallbackAvailable
      && conversationPresenceManifest.preservesEvidenceAndGates
      && conversationPresenceManifest.currentStatusStepIds.length === reasoningStatusManifest.steps.length
      ? 'pass'
      : 'blocked',
    `${conversationPresenceManifest.mode.replaceAll('_', ' ')} exposes ${conversationPresenceManifest.visibleSignals.length} visible Agent Lab signals while keeping continuous listening, wake-word capture, and autonomous speaking disabled.`,
    {
      guardrails: conversationPresenceManifest.guardrails
    }
  ));

  const readyAdapterIds = new Set(providerAdapterManifest.readyAdapterIds);
  const gatedAdapterIds = new Set(providerAdapterManifest.gatedAdapterIds);
  const disabledAdapterIds = new Set(providerAdapterManifest.disabledAdapterIds);
  checks.push(qualityCheck(
    'provider-adapters-governed',
    'Provider adapters governed',
    providerAdapterManifest.mode === 'adapter_readiness_map'
      && readyAdapterIds.has('text-reasoning-local')
      && readyAdapterIds.has('agent-sse-stream')
      && gatedAdapterIds.has('browser-speech-single-turn')
      && gatedAdapterIds.has('openai-realtime-live-consult-candidate')
      && disabledAdapterIds.has('tts-not-connected')
      && !providerAdapterManifest.continuousVoiceEnabled
      && !providerAdapterManifest.serverSideRealtimeConnectedToAgentRuntime
      && !providerAdapterManifest.ttsEnabled
      && providerAdapterManifest.adapters
        .filter((adapter) => adapter.status === 'ready')
        .every((adapter) => adapter.sharesAgentRuntime && adapter.evidenceAndGateParity)
      ? 'pass'
      : 'blocked',
    `${providerAdapterManifest.readyAdapterIds.length} provider adapters are ready; browser STT is prototype client-only, realtime voice is gated, and TTS is disabled.`,
    {
      guardrails: providerAdapterManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'voice-skill-view-contract-governed',
    'Voice skill/view contract governed',
    voiceSkillViewContractManifest.mode === 'skill_view_contract_map'
      && voiceSkillViewContractManifest.activeSkillVoiceCompatible
      && voiceSkillViewContractManifest.activeIncompatibleViewIds.length === 0
      && voiceSkillViewContractManifest.activeVoiceCompatibleViewIds.length > 0
      && voiceSkillViewContractManifest.readyModeIds.includes('push_to_talk')
      && voiceSkillViewContractManifest.gatedModeIds.includes('wake_listen')
      && voiceSkillViewContractManifest.blockedModeIds.includes('continuous_voice')
      && voiceSkillViewContractManifest.blockedModeIds.includes('realtime_voice')
      && voiceSkillViewContractManifest.blockedModeIds.includes('text_to_speech')
      && !voiceSkillViewContractManifest.continuousVoiceEnabled
      && !voiceSkillViewContractManifest.realtimeVoiceEnabled
      && !voiceSkillViewContractManifest.ttsEnabled
      && !voiceSkillViewContractManifest.arbitrarySkillRoutingEnabled
      && !voiceSkillViewContractManifest.arbitraryViewGenerationEnabled
      ? 'pass'
      : 'blocked',
    `${voiceSkillViewContractManifest.activeSkillId} is mapped to ${voiceSkillViewContractManifest.activeVoiceCompatibleViewIds.length} approved voice-canvas views; continuous, Realtime, TTS, arbitrary skill routing, and arbitrary view generation remain disabled.`,
    {
      guardrails: voiceSkillViewContractManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'voice-orchestration-gated',
    'Voice orchestration gated',
    voiceOrchestrationReadinessManifest.mode === 'promotion_gate_checklist'
      && !voiceOrchestrationReadinessManifest.fullVoiceEnabled
      && !voiceOrchestrationReadinessManifest.wakeListenEnabled
      && !voiceOrchestrationReadinessManifest.continuousVoiceEnabled
      && !voiceOrchestrationReadinessManifest.realtimeVoiceEnabled
      && !voiceOrchestrationReadinessManifest.ttsEnabled
      && voiceOrchestrationReadinessManifest.blockedRequirementIds.includes('realtime-runtime-unification')
      && voiceOrchestrationReadinessManifest.blockedRequirementIds.includes('continuous-consent-privacy-review')
      ? 'pass'
      : 'blocked',
    `${voiceOrchestrationReadinessManifest.readyRequirementIds.length} voice requirements ready, ${voiceOrchestrationReadinessManifest.prototypeRequirementIds.length} prototype-ready, and ${voiceOrchestrationReadinessManifest.blockedRequirementIds.length} blocked; full voice remains disabled.`,
    {
      guardrails: voiceOrchestrationReadinessManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'runtime-control-policy-loaded',
    'Runtime control policy loaded',
    runtimeControlManifest.runtimePolicyId === 'agent-runtime-policy-v1'
      && runtimeControlManifest.runtimeEnabled
      && !runtimeControlManifest.killSwitchActive
      && runtimeControlManifest.failClosedIfActivated
      && !runtimeControlManifest.canBypassEvidenceOrReview
      ? 'pass'
      : runtimeControlManifest.killSwitchActive ? 'blocked' : 'watch',
    runtimeControlManifest.killSwitchActive
      ? `Kill switch is active; runtime should fail closed to ${runtimeControlManifest.degradedModeFallback}.`
      : `Runtime policy ${runtimeControlManifest.runtimePolicyId} loaded in ${runtimeControlManifest.mode} mode; ${runtimeControlManifest.riskyCapabilitiesDisabled.length} risky capabilities remain disabled.`,
    {
      guardrails: runtimeControlManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'runtime-surface-governed',
    'Runtime surface governed',
    runtimeSurfaceManifest.registryId === 'governed-runtime-surface-registry-v1'
      && runtimeSurfaceManifest.usesGovernedRuntime
      && runtimeSurfaceManifest.defaultScopedChatPreserved
      && runtimeSurfaceManifest.readySurfaceIds.includes('api-agent-json')
      && runtimeSurfaceManifest.readySurfaceIds.includes('api-agent-stream')
      && runtimeSurfaceManifest.legacySurfaceIds.includes('api-chat-scoped-default')
      && runtimeSurfaceManifest.gatedSurfaceIds.includes('live-consult-realtime-candidate')
      && runtimeSurfaceManifest.disabledSurfaceIds.includes('tts-provider-disabled')
      && !runtimeSurfaceManifest.fullVoiceEnabled
      && !runtimeSurfaceManifest.realtimeVoiceEnabled
      && !runtimeSurfaceManifest.ttsEnabled
      && !runtimeSurfaceManifest.continuousVoiceEnabled
      ? 'pass'
      : 'blocked',
    `${runtimeSurfaceManifest.activeSurfaceId} uses ${runtimeSurfaceManifest.activeRuntimePath} with ${runtimeSurfaceManifest.activeProofSurface}; default scoped chat is preserved and full voice/TTS stay gated.`,
    {
      guardrails: runtimeSurfaceManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'approved-experience-template',
    'Approved experience template',
    templateApproved ? 'pass' : 'blocked',
    templateApproved
      ? `${result.experiencePlan?.templateId ?? 'none'} is an approved experience template.`
      : 'No approved experience template was found for this turn.',
    { guardrails: ['Dynamic workspaces must be generated as inspectable ExperiencePlans.'] }
  ));

  checks.push(qualityCheck(
    'approved-rendered-views',
    'Approved rendered views',
    unapprovedViewIds.length === 0 ? 'pass' : 'blocked',
    unapprovedViewIds.length === 0
      ? `${renderedViewIds.length} rendered views are approved registry views.`
      : `Unapproved rendered views detected: ${unapprovedViewIds.join(', ')}.`,
    { guardrails: ['Dynamic UI must use approved view registry components.'] }
  ));

  checks.push(qualityCheck(
    'answer-evidence-attached',
    'Answer evidence attached',
    result.answer.evidence.length > 0 && evidenceSpotlight.some((item) => item.supportStatus === 'supported_by_packet') ? 'pass' : 'watch',
    `${result.answer.evidence.length} evidence references and ${evidenceSpotlight.length} claim spotlight records emitted.`,
    { evidenceLabels: evidenceLabels(result), guardrails: ['Evidence should be visible behind each diagnosis, provocation, and treatment path.'] }
  ));

  checks.push(qualityCheck(
    'source-context-non-canonical',
    'Source context remains non-canonical',
    !result.sourcePromotionContext.canonicalWriteEnabled
      && !result.sourcePromotionContext.runtimeAutoConsumption
      && !result.sourceClaimContext.canonicalFactEnabled
      && !result.sourceClaimContext.runtimeAutoConsumption
      ? 'pass'
      : 'blocked',
    'Reviewed-local source candidates and extracted claims remain excluded from canonical facts and runtime evidence.',
    { guardrails: ['Keep user-provided content separate from canonical data until reviewed.'] }
  ));

  checks.push(qualityCheck(
    'source-governance-review-only',
    'Source governance review-only',
    sourceGovernanceManifest.mode === 'reviewed_local_source_context_only'
      && !sourceGovernanceManifest.canonicalSourceWritesEnabled
      && !sourceGovernanceManifest.canonicalClaimFactsEnabled
      && !sourceGovernanceManifest.runtimeSourceAutoConsumptionEnabled
      && !sourceGovernanceManifest.runtimeFileDropConsumptionEnabled
      && !sourceGovernanceManifest.runtimeFileDropCanonicalUseEnabled
      && !sourceGovernanceManifest.sourceClaimPromotionCapabilityEnabled
      && !sourceGovernanceManifest.sourceDataWriteCapabilityEnabled
      ? 'pass'
      : 'blocked',
    `${sourceGovernanceManifest.sourcePromotionCandidateCount} source candidates, ${sourceGovernanceManifest.sourceClaimCandidateCount} source claims, and ${sourceGovernanceManifest.runtimeFileDropCandidateFileCount} file-drop candidates remain review-only and non-canonical.`,
    {
      relatedGateIds: sourceGovernanceManifest.sourceReviewGateIds.slice(0, 8),
      guardrails: sourceGovernanceManifest.guardrails
    }
  ));

  checks.push(qualityCheck(
    'artifact-gates-and-export-disabled',
    'Artifact gates and export disabled',
    missingArtifactGateIds.length === 0
      && result.experiencePlan?.artifacts.every((artifact) => artifact.governance.exportEnabled === false)
      && exportCapability?.enabled === false
      ? 'pass'
      : 'blocked',
    missingArtifactGateIds.length === 0
      ? 'Artifacts have review gates where needed and export remains disabled.'
      : `Missing artifact review gates: ${missingArtifactGateIds.join(', ')}.`,
    {
      relatedGateIds: artifactGates,
      guardrails: ['Generated artifacts require human review before circulation.']
    }
  ));

  checks.push(qualityCheck(
    'memory-review-required',
    'Memory remains review-controlled',
    memory.every((record) => record.status === 'suggested' || record.status === 'blocked') ? 'pass' : 'blocked',
    `${memory.length} memory records emitted; none should auto-accept during a turn.`,
    {
      relatedGateIds: confirmationGates.filter((gate) => gate.action === 'accept_memory').map((gate) => gate.id).slice(0, 8),
      guardrails: ['Suggested memories cannot become accepted facts automatically.']
    }
  ));

  checks.push(qualityCheck(
    'continuous-voice-disabled',
    'Continuous voice disabled',
    agentVoicePolicy.disabledModes.includes('continuous') && continuousVoiceCapability?.enabled === false ? 'pass' : 'blocked',
    'Voice readiness remains push-to-talk / wake-listen only; continuous mode is disabled by policy and capability flag.',
    { guardrails: agentVoicePolicy.guardrails }
  ));

  checks.push(qualityCheck(
    'unsafe-language-scan',
    'Unsafe language scan',
    unsafeSerializedAnswer.includes('sku-level pricing recommendation')
      || unsafeSerializedAnswer.includes('caused by')
      || unsafeSerializedAnswer.includes('will lead to')
      ? 'blocked'
      : 'pass',
    'Answer text avoids SKU-level pricing, unsupported causality, and prediction-overclaim phrases checked by eval.',
    { guardrails: result.answer.guardrailsApplied.slice(0, 6) }
  ));

  return checks;
}

export function runAgentTurn(input: AgentSkillRouterInput): AgentTurnResult {
  const turnId = turnIdFor(input);
  const result = routeAgentSkill(input);
  const markdown = agentAnswerToMarkdown(result.answer);
  const capabilities = agentCapabilityRegistry;
  const evidenceSpotlight = buildEvidenceSpotlight(turnId, result);
  const memory = buildMemory(turnId, result);
  const confirmationGates = buildConfirmationGates(result, memory, capabilities);
  const workingContextManifest = buildWorkingContextManifest(turnId, result, memory, confirmationGates);
  const sourceGovernanceManifest = buildSourceGovernanceManifest(turnId, result, workingContextManifest, confirmationGates, capabilities);
  const persistenceReadinessManifest = buildPersistenceReadinessManifest(turnId, result, workingContextManifest);
  const reviewIdentityManifest = buildReviewIdentityManifest(turnId, result, confirmationGates);
  const proactivityManifest = buildProactivityManifest(turnId, result, memory, confirmationGates);
  const canvasStateManifest = buildCanvasStateManifest(turnId, result, confirmationGates);
  const experienceArchitectureManifest = buildExperienceArchitectureManifest(turnId, result, canvasStateManifest);
  const interruptionRecoveryManifest = buildInterruptionRecoveryManifest(turnId, result, canvasStateManifest);
  const reasoningStatusManifest = buildReasoningStatusManifest(turnId, result, evidenceSpotlight, canvasStateManifest, interruptionRecoveryManifest, confirmationGates);
  const conversationPresenceManifest = buildConversationPresenceManifest(turnId, result, canvasStateManifest, reasoningStatusManifest);
  const providerAdapterManifest = buildProviderAdapterManifest(turnId, result, conversationPresenceManifest);
  const voiceSkillViewContractManifest = buildVoiceSkillViewContractManifest(turnId, result);
  const voiceOrchestrationReadinessManifest = buildVoiceOrchestrationReadinessManifest(turnId, result, conversationPresenceManifest, interruptionRecoveryManifest, providerAdapterManifest, voiceSkillViewContractManifest);
  const runtimeControlManifest = buildRuntimeControlManifest(turnId, capabilities);
  const runtimeSurfaceManifest = buildRuntimeSurfaceManifest(turnId, result, input.runtimeSurfaceId);
  const pilotLearningManifest = buildPilotLearningManifest(turnId, result, memory, confirmationGates, proactivityManifest, voiceOrchestrationReadinessManifest);
  const treatmentOutcomeReadinessManifest = buildTreatmentOutcomeReadinessManifest(turnId, result, pilotLearningManifest);
  const runtimeQualityChecks = buildRuntimeQualityChecks(result, workingContextManifest, sourceGovernanceManifest, persistenceReadinessManifest, reviewIdentityManifest, proactivityManifest, pilotLearningManifest, treatmentOutcomeReadinessManifest, canvasStateManifest, interruptionRecoveryManifest, reasoningStatusManifest, conversationPresenceManifest, providerAdapterManifest, voiceSkillViewContractManifest, voiceOrchestrationReadinessManifest, experienceArchitectureManifest, runtimeControlManifest, runtimeSurfaceManifest, memory, confirmationGates, capabilities, evidenceSpotlight);
  const audit = buildAudit(turnId, result, runtimeSurfaceManifest, workingContextManifest, sourceGovernanceManifest, persistenceReadinessManifest, reviewIdentityManifest, proactivityManifest, pilotLearningManifest, treatmentOutcomeReadinessManifest, canvasStateManifest, interruptionRecoveryManifest, reasoningStatusManifest, conversationPresenceManifest, providerAdapterManifest, voiceSkillViewContractManifest, voiceOrchestrationReadinessManifest, experienceArchitectureManifest, memory, evidenceSpotlight, runtimeQualityChecks);
  const events = buildEvents(turnId, result, runtimeSurfaceManifest, workingContextManifest, sourceGovernanceManifest, persistenceReadinessManifest, reviewIdentityManifest, proactivityManifest, pilotLearningManifest, treatmentOutcomeReadinessManifest, canvasStateManifest, interruptionRecoveryManifest, reasoningStatusManifest, conversationPresenceManifest, providerAdapterManifest, voiceSkillViewContractManifest, voiceOrchestrationReadinessManifest, experienceArchitectureManifest, memory, audit, evidenceSpotlight, runtimeQualityChecks);
  return {
    ...result,
    turnId,
    runtimeVersion: 'agent-runtime-v1',
    markdown,
    events,
    evidenceSpotlight,
    memory,
    audit,
    confirmationGates,
    workingContextManifest,
    sourceGovernanceManifest,
    persistenceReadinessManifest,
    reviewIdentityManifest,
    proactivityManifest,
    pilotLearningManifest,
    treatmentOutcomeReadinessManifest,
    canvasStateManifest,
    experienceArchitectureManifest,
    interruptionRecoveryManifest,
    reasoningStatusManifest,
    conversationPresenceManifest,
    providerAdapterManifest,
    voiceSkillViewContractManifest,
    voiceOrchestrationReadinessManifest,
    runtimeControlManifest,
    runtimeSurfaceManifest,
    runtimeQualityChecks,
    capabilities,
    voicePolicy: agentVoicePolicy,
    voiceRuntimeManifest: buildVoiceRuntimeManifest(turnId, events, result)
  };
}
