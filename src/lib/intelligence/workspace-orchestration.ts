import type { AgentTurnEvent, AgentTurnResult } from '@/src/lib/intelligence/types';
import type { AgentSessionLedger } from '@/src/lib/intelligence/session-ledger';

export type WorkspaceRuntimeState = 'ready' | 'listening' | 'routing' | 'rendering' | 'speaking';

export type WorkspaceOrchestrationStatus = 'complete' | 'active' | 'waiting' | 'watch' | 'blocked';

export type WorkspaceOrchestrationPhase = {
  id: 'listen' | 'route' | 'plan' | 'render' | 'prove' | 'review';
  label: string;
  status: WorkspaceOrchestrationStatus;
  detail: string;
};

export type WorkspaceViewContinuity = {
  expectedViewIds: string[];
  queuedViewIds: string[];
  renderedViewIds: string[];
  fallbackViewIds: string[];
  missingViewIds: string[];
  voiceCompatibleViewIds: string[];
  approvedViewContinuity: boolean;
};

export type WorkspaceProofContinuity = {
  evidenceCount: number;
  spotlightCount: number;
  missingEvidenceCount: number;
  pendingGateCount: number;
  pendingMemoryCount: number;
  pendingArtifactCount: number;
  blockedQualityCount: number;
  watchQualityCount: number;
  guardrailCount: number;
  proofRailReady: boolean;
};

export type WorkspaceOrchestrationState = {
  currentTemplateId: string;
  currentSkillId: string;
  currentBrandName: string;
  statusLine: string;
  nextBestAction: string;
  phases: WorkspaceOrchestrationPhase[];
  viewContinuity: WorkspaceViewContinuity;
  proofContinuity: WorkspaceProofContinuity;
  governedRuntimeIntact: boolean;
  productionPromotionBlocked: boolean;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function includesAny(values: string[], candidates: string[]) {
  const valueSet = new Set(values);
  return candidates.some((candidate) => valueSet.has(candidate));
}

function phaseStatus(
  phase: WorkspaceOrchestrationPhase['id'],
  runtimeState: WorkspaceRuntimeState,
  result: AgentTurnResult,
  viewContinuity: WorkspaceViewContinuity,
  proofContinuity: WorkspaceProofContinuity
): WorkspaceOrchestrationStatus {
  if (phase === 'listen') return runtimeState === 'listening' ? 'active' : 'complete';
  if (phase === 'route') {
    if (runtimeState === 'routing') return 'active';
    return result.routedSkillId ? 'complete' : 'waiting';
  }
  if (phase === 'plan') {
    if (runtimeState === 'rendering') return 'active';
    return result.experiencePlan ? 'complete' : 'watch';
  }
  if (phase === 'render') {
    if (runtimeState === 'rendering' || runtimeState === 'speaking') return 'active';
    return viewContinuity.renderedViewIds.length > 0 ? 'complete' : 'waiting';
  }
  if (phase === 'prove') {
    if (!proofContinuity.proofRailReady) return 'watch';
    return proofContinuity.blockedQualityCount > 0 ? 'blocked' : 'complete';
  }
  if (proofContinuity.pendingGateCount > 0 || proofContinuity.pendingArtifactCount > 0 || proofContinuity.pendingMemoryCount > 0) {
    return 'watch';
  }
  return 'complete';
}

function phaseDetail(
  phase: WorkspaceOrchestrationPhase['id'],
  result: AgentTurnResult,
  viewContinuity: WorkspaceViewContinuity,
  proofContinuity: WorkspaceProofContinuity
) {
  if (phase === 'listen') return result.voiceRuntimeManifest.enabledModes.includes('push_to_talk') ? 'Push-to-talk can feed the governed runtime; continuous voice remains gated.' : 'Typed command path is the governed fallback.';
  if (phase === 'route') return `${result.routedSkillId.replaceAll('_', ' ')} selected from the approved skill registry.`;
  if (phase === 'plan') return result.experiencePlan ? `${result.experiencePlan.templateId.replaceAll('-', ' ')} assembled from approved zones.` : 'No ExperiencePlan available; dynamic views fall back to request order.';
  if (phase === 'render') return `${viewContinuity.renderedViewIds.length}/${viewContinuity.expectedViewIds.length} expected views rendered; ${viewContinuity.fallbackViewIds.length} fallback views active.`;
  if (phase === 'prove') return `${proofContinuity.evidenceCount} evidence refs, ${proofContinuity.spotlightCount} claim checks, ${proofContinuity.missingEvidenceCount} gaps visible.`;
  return `${proofContinuity.pendingGateCount} gates, ${proofContinuity.pendingMemoryCount} memory items, and ${proofContinuity.pendingArtifactCount} artifacts need review.`;
}

function nextBestAction(
  runtimeState: WorkspaceRuntimeState,
  result: AgentTurnResult,
  viewContinuity: WorkspaceViewContinuity,
  proofContinuity: WorkspaceProofContinuity
) {
  if (runtimeState !== 'ready') return 'Let the current governed turn finish or stop it; partial output is not saved as truth.';
  if (!viewContinuity.approvedViewContinuity) return 'Inspect the fallback or missing-view state before using this workspace as a sponsor proof point.';
  if (!proofContinuity.proofRailReady) return 'Open proof rail coverage before moving from the canvas to a decision conversation.';
  if (proofContinuity.pendingGateCount > 0) return 'Review required gates before treating the output as a pilot-ready decision artifact.';
  if (proofContinuity.pendingArtifactCount > 0) return 'Review pending artifacts in the proof rail; export and circulation remain disabled.';
  if (proofContinuity.pendingMemoryCount > 0) return 'Review suggested memory before using it as future working context.';
  if (result.experiencePlan?.templateId === 'executive-pilot-runbook') return 'Continue the sponsor sequence with the next runbook prompt and keep blocked production gates visible.';
  return 'Ask the next brand, source, voice, or foundation-readiness question from the same governed workspace.';
}

export function buildWorkspaceOrchestrationState(input: {
  result: AgentTurnResult;
  runtimeEvents: AgentTurnEvent[];
  runtimeState: WorkspaceRuntimeState;
  sessionLedger: AgentSessionLedger;
}): WorkspaceOrchestrationState {
  const { result, runtimeEvents, runtimeState, sessionLedger } = input;
  const expectedViewIds = unique(
    result.experiencePlan?.zones.map((zone) => zone.viewId)
      ?? result.answer.dynamicViewRequests.map((request) => request.viewId)
  );
  const queuedViewIds = unique(runtimeEvents.filter((event) => event.type === 'view_queued').map((event) => event.viewId ?? ''));
  const renderedViewIds = unique(result.canvasStateManifest.renderedViewIds);
  const fallbackViewIds = unique(result.experiencePlan?.viewManifest
    .filter((view) => view.dataStatus === 'fallback')
    .map((view) => view.renderedViewId) ?? []);
  const missingViewIds = expectedViewIds.filter((viewId) => !includesAny(renderedViewIds, [viewId]));
  const viewContinuity: WorkspaceViewContinuity = {
    expectedViewIds,
    queuedViewIds,
    renderedViewIds,
    fallbackViewIds,
    missingViewIds,
    voiceCompatibleViewIds: unique(result.canvasStateManifest.voiceCompatibleViewIds),
    approvedViewContinuity: (
      result.experienceArchitectureManifest.arbitraryViewIdsAllowed === false
      && result.experienceArchitectureManifest.unknownViewIds.length === 0
      && result.canvasStateManifest.arbitraryViewIdsAllowed === false
    )
  };
  const pendingGateCount = sessionLedger.confirmationGates.filter((gate) => gate.status === 'required').length;
  const pendingMemoryCount = sessionLedger.memory.filter((record) => record.status === 'suggested').length;
  const pendingArtifactCount = sessionLedger.artifacts.filter((artifact) => (artifact.reviewStatus ?? 'pending') === 'pending' && artifact.status !== 'blocked').length;
  const blockedQualityCount = result.runtimeQualityChecks.filter((check) => check.status === 'blocked').length;
  const watchQualityCount = result.runtimeQualityChecks.filter((check) => check.status === 'watch').length;
  const proofContinuity: WorkspaceProofContinuity = {
    evidenceCount: result.answer.evidence.length,
    spotlightCount: result.evidenceSpotlight.length,
    missingEvidenceCount: result.answer.missingEvidence.length,
    pendingGateCount,
    pendingMemoryCount,
    pendingArtifactCount,
    blockedQualityCount,
    watchQualityCount,
    guardrailCount: result.answer.guardrailsApplied.length,
    proofRailReady: (
      result.answer.evidence.length > 0
      && result.evidenceSpotlight.length > 0
      && result.answer.guardrailsApplied.length > 0
    )
  };
  const phaseIds: WorkspaceOrchestrationPhase['id'][] = ['listen', 'route', 'plan', 'render', 'prove', 'review'];
  const phases = phaseIds.map((id) => ({
    id,
    label: id === 'listen' ? 'Listen'
      : id === 'route' ? 'Route'
        : id === 'plan' ? 'Plan'
          : id === 'render' ? 'Render'
            : id === 'prove' ? 'Prove'
              : 'Review',
    status: phaseStatus(id, runtimeState, result, viewContinuity, proofContinuity),
    detail: phaseDetail(id, result, viewContinuity, proofContinuity)
  }));

  return {
    currentTemplateId: result.experiencePlan?.templateId ?? 'dynamic-view-request-fallback',
    currentSkillId: result.routedSkillId,
    currentBrandName: result.packet.brand.brandName,
    statusLine: `${result.packet.brand.brandName} · ${(result.experiencePlan?.templateId ?? result.routedSkillId).replaceAll(/[-_]/g, ' ')} · ${renderedViewIds.length} views · ${proofContinuity.pendingGateCount} gates`,
    nextBestAction: nextBestAction(runtimeState, result, viewContinuity, proofContinuity),
    phases,
    viewContinuity,
    proofContinuity,
    governedRuntimeIntact: (
      result.runtimeSurfaceManifest.defaultScopedChatPreserved
      && result.runtimeControlManifest.runtimeEnabled
      && result.capabilities.every((capability) => capability.riskLevel !== 'high' || capability.enabled === false)
    ),
    productionPromotionBlocked: (
      result.runtimeSurfaceManifest.fullVoiceEnabled === false
      && result.runtimeSurfaceManifest.ttsEnabled === false
      && result.sourceGovernanceManifest.canonicalSourceWritesEnabled === false
      && result.sourceGovernanceManifest.runtimeSourceAutoConsumptionEnabled === false
    )
  };
}
