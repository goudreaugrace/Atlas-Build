export type GovernedChatProof = {
  runtimeVersion?: string;
  surface?: string;
  persistence?: string;
  quality: string;
  gates: string;
  reviewIdentity?: string;
  pilotLearning?: string;
  treatmentOutcomes?: string;
  evidence: string;
  views: string;
};

function arrayField(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object') : [];
}

function stringField(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

export function governedChatProofFromResponse(data: Record<string, unknown>): GovernedChatProof | undefined {
  if (data.source !== 'skill_router') return undefined;

  const qualityChecks = arrayField(data.runtimeQualityChecks);
  const passCount = qualityChecks.filter((check) => check.status === 'pass').length;
  const watchCount = qualityChecks.filter((check) => check.status !== 'pass').length;
  const gates = arrayField(data.confirmationGates);
  const blockedGates = gates.filter((gate) => gate.status === 'blocked').length;
  const requiredGates = gates.filter((gate) => gate.status === 'required').length;
  const evidenceSpotlight = arrayField(data.evidenceSpotlight);
  const dynamicViews = arrayField(data.dynamicViewRequests);
  const persistenceRecord = data.persistence && typeof data.persistence === 'object' ? data.persistence as Record<string, unknown> : null;
  const persistence = persistenceRecord?.status === 'persisted'
    ? `${stringField(persistenceRecord.store) ?? 'local_json'} persisted`
    : 'not persisted';
  const reviewIdentityRecord = data.reviewIdentityManifest && typeof data.reviewIdentityManifest === 'object'
    ? data.reviewIdentityManifest as Record<string, unknown>
    : null;
  const reviewerLabel = stringField(reviewIdentityRecord?.prototypeReviewerLabel) ?? 'human_review';
  const officialApprovalBlocked = reviewIdentityRecord?.officialApprovalBlocked === true;
  const reviewIdentity = reviewIdentityRecord
    ? `${reviewerLabel}${officialApprovalBlocked ? ' · official approval blocked' : ' · approval path enabled'}`
    : undefined;
  const pilotLearningRecord = data.pilotLearningManifest && typeof data.pilotLearningManifest === 'object'
    ? data.pilotLearningManifest as Record<string, unknown>
    : null;
  const pilotSignals = Array.isArray(pilotLearningRecord?.signals) ? pilotLearningRecord.signals.length : 0;
  const blockedLearningPaths = Array.isArray(pilotLearningRecord?.blockedLearningPaths) ? pilotLearningRecord.blockedLearningPaths.length : 0;
  const pilotLearning = pilotLearningRecord
    ? `${pilotSignals} learning signals · ${blockedLearningPaths} blocked paths`
    : undefined;
  const treatmentOutcomeRecord = data.treatmentOutcomeReadinessManifest && typeof data.treatmentOutcomeReadinessManifest === 'object'
    ? data.treatmentOutcomeReadinessManifest as Record<string, unknown>
    : null;
  const blockedOutcomeRequirements = Array.isArray(treatmentOutcomeRecord?.blockedRequirementIds)
    ? treatmentOutcomeRecord.blockedRequirementIds.length
    : 0;
  const outcomeClaimsEnabled = treatmentOutcomeRecord?.treatmentOutcomeClaimsEnabled === true;
  const treatmentOutcomes = treatmentOutcomeRecord
    ? `${blockedOutcomeRequirements} outcome blockers · claims ${outcomeClaimsEnabled ? 'enabled' : 'disabled'}`
    : undefined;
  const runtimeSurfaceRecord = data.runtimeSurfaceManifest && typeof data.runtimeSurfaceManifest === 'object'
    ? data.runtimeSurfaceManifest as Record<string, unknown>
    : null;
  const activeSurfaceName = stringField(runtimeSurfaceRecord?.activeSurfaceName);
  const activeSurfaceStatus = stringField(runtimeSurfaceRecord?.activeSurfaceStatus);
  const surface = runtimeSurfaceRecord
    ? `${activeSurfaceName ?? 'governed surface'}${activeSurfaceStatus ? ` · ${activeSurfaceStatus.replaceAll('_', ' ')}` : ''}`
    : undefined;

  return {
    runtimeVersion: stringField(data.runtimeVersion),
    surface,
    persistence,
    quality: `${passCount}/${qualityChecks.length} checks passed${watchCount ? `, ${watchCount} watch` : ''}`,
    gates: `${requiredGates} review · ${blockedGates} blocked`,
    reviewIdentity,
    pilotLearning,
    treatmentOutcomes,
    evidence: `${evidenceSpotlight.length} claim links`,
    views: `${dynamicViews.length} approved views`
  };
}
