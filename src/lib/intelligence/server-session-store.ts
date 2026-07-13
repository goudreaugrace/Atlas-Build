import fs from 'node:fs';
import path from 'node:path';
import {
  buildSessionAuditSummary,
  buildSessionArtifactReadinessSummary,
  buildSessionCanvasContinuitySummary,
  buildSessionCapabilityReadinessSummary,
  buildSessionEvidenceSpotlightSummary,
  buildSessionExperienceArchitectureSummary,
  buildSessionExecutivePilotSummary,
  buildSessionFoundationReadinessSummary,
  buildSessionMemoryAuditSummary,
  emptySessionLedger,
  buildSessionPersistenceGovernanceSummary,
  buildSessionPilotLearningSummary,
  buildSessionProactivitySummary,
  buildSessionPromotionGateSummary,
  buildSessionProviderAdapterSummary,
  buildSessionReviewWorkflowSummary,
  buildSessionRuntimeControlSummary,
  buildSessionRuntimeQualitySummary,
  buildSessionRuntimeSurfaceSummary,
  buildSessionSourceGovernanceSummary,
  buildSessionSourceRuntimeIngestionSummary,
  buildSessionTreatmentOutcomeReadinessSummary,
  buildSessionVoiceContractSummary,
  buildSessionVoiceReadinessSummary,
  buildSessionVoiceRuntimeSummary,
  mergeSessionLedgers,
  mergeTurnIntoLedger,
  type AgentSessionLedger
} from '@/src/lib/intelligence/session-ledger';
import type { AgentAcceptedMemoryContext, AgentTurnPersistence, AgentTurnResult, ExperienceArtifact } from '@/src/lib/intelligence/types';
import type { AgentReviewDecision, AgentReviewItemType, AgentReviewRecord } from '@/src/lib/intelligence/types';
import { buildFoundationLayerAudit } from '@/src/lib/intelligence/foundation-layer-readiness';
import { buildWorkspaceOrchestrationState } from '@/src/lib/intelligence/workspace-orchestration';

export type AgentDurableSessionRecord = {
  sessionId: string;
  version: 'agent-durable-session-record-v1';
  createdAt: string;
  updatedAt: string;
  brandIds: string[];
  lastTurnId: string | null;
  ledger: AgentSessionLedger;
  persistence: {
    kind: 'local_json';
    reviewMode: 'reviewed_actions_enabled';
    storePath: string;
    caveats: string[];
  };
};

export type AgentDurableSessionResponse = AgentDurableSessionRecord & {
  reviewWorkflowSummary: ReturnType<typeof buildSessionReviewWorkflowSummary>;
  artifactReadinessSummary: ReturnType<typeof buildSessionArtifactReadinessSummary>;
  auditSummary: ReturnType<typeof buildSessionAuditSummary>;
  memoryAuditSummary: ReturnType<typeof buildSessionMemoryAuditSummary>;
  capabilityReadinessSummary: ReturnType<typeof buildSessionCapabilityReadinessSummary>;
  evidenceSpotlightSummary: ReturnType<typeof buildSessionEvidenceSpotlightSummary>;
  proactivitySummary: ReturnType<typeof buildSessionProactivitySummary>;
  pilotLearningSummary: ReturnType<typeof buildSessionPilotLearningSummary>;
  treatmentOutcomeReadinessSummary: ReturnType<typeof buildSessionTreatmentOutcomeReadinessSummary>;
  sourceGovernanceSummary: ReturnType<typeof buildSessionSourceGovernanceSummary>;
  sourceRuntimeIngestionSummary: ReturnType<typeof buildSessionSourceRuntimeIngestionSummary>;
  runtimeSurfaceSummary: ReturnType<typeof buildSessionRuntimeSurfaceSummary>;
  experienceArchitectureSummary: ReturnType<typeof buildSessionExperienceArchitectureSummary>;
  canvasContinuitySummary: ReturnType<typeof buildSessionCanvasContinuitySummary>;
  persistenceGovernanceSummary: ReturnType<typeof buildSessionPersistenceGovernanceSummary>;
  providerAdapterSummary: ReturnType<typeof buildSessionProviderAdapterSummary>;
  runtimeControlSummary: ReturnType<typeof buildSessionRuntimeControlSummary>;
  runtimeQualitySummary: ReturnType<typeof buildSessionRuntimeQualitySummary>;
  voiceRuntimeSummary: ReturnType<typeof buildSessionVoiceRuntimeSummary>;
  voiceContractSummary: ReturnType<typeof buildSessionVoiceContractSummary>;
  voiceReadinessSummary: ReturnType<typeof buildSessionVoiceReadinessSummary>;
  foundationReadinessSummary: ReturnType<typeof buildSessionFoundationReadinessSummary>;
  executivePilotSummary: ReturnType<typeof buildSessionExecutivePilotSummary>;
  promotionGateSummary: ReturnType<typeof buildSessionPromotionGateSummary>;
};

export type AgentDurableSessionStore = {
  version: 'agent-durable-session-store-v1';
  updatedAt: string;
  sessions: AgentDurableSessionRecord[];
};

export type AgentSessionReviewInput = {
  sessionId: unknown;
  itemType: AgentReviewItemType;
  itemId: string;
  decision: AgentReviewDecision;
  note?: string | null;
  editedLabel?: string;
  editedDetail?: string;
};

const storeDirectory = path.join(process.cwd(), '.runtime');
const storePath = path.join(storeDirectory, 'agent-session-ledgers.json');

function now() {
  return new Date().toISOString();
}

export function normalizeAgentSessionId(raw: unknown) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  const normalized = value.replace(/[^a-z0-9_-]/gi, '-').slice(0, 80);
  return normalized || 'agent-lab-default';
}

function emptyStore(): AgentDurableSessionStore {
  return {
    version: 'agent-durable-session-store-v1',
    updatedAt: now(),
    sessions: []
  };
}

function createSession(sessionId: string): AgentDurableSessionRecord {
  const timestamp = now();
  return {
    sessionId,
    version: 'agent-durable-session-record-v1',
    createdAt: timestamp,
    updatedAt: timestamp,
    brandIds: [],
    lastTurnId: null,
    ledger: emptySessionLedger(),
    persistence: {
      kind: 'local_json',
      reviewMode: 'reviewed_actions_enabled',
      storePath: '.runtime/agent-session-ledgers.json',
      caveats: [
        'Prototype persistence is local JSON on the app server, not enterprise database storage.',
        'Memory records remain suggested or blocked until a human review action promotes, edits, or rejects them.',
        'Generated artifacts and gates remain human-review records, not approved final outputs.'
      ]
    }
  };
}

function readStore(): AgentDurableSessionStore {
  if (!fs.existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8')) as Partial<AgentDurableSessionStore>;
    if (parsed.version !== 'agent-durable-session-store-v1' || !Array.isArray(parsed.sessions)) return emptyStore();
    return {
      version: 'agent-durable-session-store-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : now(),
      sessions: parsed.sessions.filter((session): session is AgentDurableSessionRecord => (
        session?.version === 'agent-durable-session-record-v1' &&
        typeof session.sessionId === 'string' &&
        session.ledger?.version === 'agent-session-ledger-v1'
      ))
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: AgentDurableSessionStore) {
  fs.mkdirSync(storeDirectory, { recursive: true });
  const nextStore = {
    ...store,
    updatedAt: now()
  };
  const tempPath = `${storePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, storePath);
}

export function getDurableSession(sessionIdInput: unknown): AgentDurableSessionRecord {
  const sessionId = normalizeAgentSessionId(sessionIdInput);
  const store = readStore();
  return store.sessions.find((session) => session.sessionId === sessionId) ?? createSession(sessionId);
}

export function durableSessionToResponse(session: AgentDurableSessionRecord): AgentDurableSessionResponse {
  return {
    ...session,
    reviewWorkflowSummary: buildSessionReviewWorkflowSummary(session.sessionId, session.ledger),
    artifactReadinessSummary: buildSessionArtifactReadinessSummary(session.sessionId, session.ledger),
    auditSummary: buildSessionAuditSummary(session.sessionId, session.ledger),
    memoryAuditSummary: buildSessionMemoryAuditSummary(session.sessionId, session.ledger),
    capabilityReadinessSummary: buildSessionCapabilityReadinessSummary(session.sessionId, session.ledger),
    evidenceSpotlightSummary: buildSessionEvidenceSpotlightSummary(session.sessionId, session.ledger),
    proactivitySummary: buildSessionProactivitySummary(session.sessionId, session.ledger),
    pilotLearningSummary: buildSessionPilotLearningSummary(session.sessionId, session.ledger),
    treatmentOutcomeReadinessSummary: buildSessionTreatmentOutcomeReadinessSummary(session.sessionId, session.ledger),
    sourceGovernanceSummary: buildSessionSourceGovernanceSummary(session.sessionId, session.ledger),
    sourceRuntimeIngestionSummary: buildSessionSourceRuntimeIngestionSummary(session.sessionId, session.ledger),
    runtimeSurfaceSummary: buildSessionRuntimeSurfaceSummary(session.sessionId, session.ledger),
    experienceArchitectureSummary: buildSessionExperienceArchitectureSummary(session.sessionId, session.ledger),
    canvasContinuitySummary: buildSessionCanvasContinuitySummary(session.sessionId, session.ledger),
    persistenceGovernanceSummary: buildSessionPersistenceGovernanceSummary(session.sessionId, session.ledger),
    providerAdapterSummary: buildSessionProviderAdapterSummary(session.sessionId, session.ledger),
    runtimeControlSummary: buildSessionRuntimeControlSummary(session.sessionId, session.ledger),
    runtimeQualitySummary: buildSessionRuntimeQualitySummary(session.sessionId, session.ledger),
    voiceRuntimeSummary: buildSessionVoiceRuntimeSummary(session.sessionId, session.ledger),
    voiceContractSummary: buildSessionVoiceContractSummary(session.sessionId, session.ledger),
    voiceReadinessSummary: buildSessionVoiceReadinessSummary(session.sessionId, session.ledger),
    foundationReadinessSummary: buildSessionFoundationReadinessSummary(session.sessionId, session.ledger),
    executivePilotSummary: buildSessionExecutivePilotSummary(session.sessionId, session.ledger),
    promotionGateSummary: buildSessionPromotionGateSummary(session.sessionId, session.ledger)
  };
}

export function acceptedMemoryForSession(sessionIdInput: unknown, brandId: string): AgentAcceptedMemoryContext[] {
  const session = getDurableSession(sessionIdInput);
  return session.ledger.memory
    .filter((record) => record.status === 'accepted' && record.brandId === brandId)
    .slice(-8)
    .map((record) => ({
      id: record.id,
      type: record.type,
      label: record.label,
      detail: record.detail,
      sourceTurnId: record.sourceTurnId,
      brandId: record.brandId,
      evidenceLabels: record.evidenceLabels,
      reviewStatus: 'accepted',
      humanReviewRequired: record.humanReviewRequired
    }));
}

export function persistAgentTurn(sessionIdInput: unknown, result: AgentTurnResult): AgentDurableSessionRecord {
  const sessionId = normalizeAgentSessionId(sessionIdInput);
  const store = readStore();
  const existing = store.sessions.find((session) => session.sessionId === sessionId) ?? createSession(sessionId);
  const updated: AgentDurableSessionRecord = {
    ...existing,
    updatedAt: now(),
    brandIds: Array.from(new Set([...existing.brandIds, result.packet.brand.brandId])),
    lastTurnId: result.turnId,
    ledger: mergeTurnIntoLedger(existing.ledger, result)
  };
  writeStore({
    version: 'agent-durable-session-store-v1',
    updatedAt: now(),
    sessions: [
      updated,
      ...store.sessions.filter((session) => session.sessionId !== sessionId)
    ].slice(0, 50)
  });
  return updated;
}

export function mergeDurableSession(sessionIdInput: unknown, ledger: AgentSessionLedger): AgentDurableSessionRecord {
  const sessionId = normalizeAgentSessionId(sessionIdInput);
  const store = readStore();
  const existing = store.sessions.find((session) => session.sessionId === sessionId) ?? createSession(sessionId);
  const updated: AgentDurableSessionRecord = {
    ...existing,
    updatedAt: now(),
    lastTurnId: ledger.turnIds[ledger.turnIds.length - 1] ?? existing.lastTurnId,
    ledger: mergeSessionLedgers(existing.ledger, ledger)
  };
  writeStore({
    version: 'agent-durable-session-store-v1',
    updatedAt: now(),
    sessions: [
      updated,
      ...store.sessions.filter((session) => session.sessionId !== sessionId)
    ].slice(0, 50)
  });
  return updated;
}

function rewriteSession(store: AgentDurableSessionStore, updated: AgentDurableSessionRecord) {
  writeStore({
    version: 'agent-durable-session-store-v1',
    updatedAt: now(),
    sessions: [
      updated,
      ...store.sessions.filter((session) => session.sessionId !== updated.sessionId)
    ].slice(0, 50)
  });
}

function reviewRecord(
  sessionId: string,
  itemType: AgentReviewItemType,
  itemId: string,
  decision: AgentReviewDecision,
  label: string,
  note: string | null,
  beforeStatus: string,
  afterStatus: string
): AgentReviewRecord {
  return {
    id: `${sessionId}-review-${Date.now().toString(36)}-${itemType}-${itemId}`,
    itemType,
    itemId,
    decision,
    label,
    note,
    reviewedAt: now(),
    reviewer: 'human_review',
    sessionId,
    beforeStatus,
    afterStatus
  };
}

function readinessForStoredArtifact(artifact: ExperienceArtifact): ExperienceArtifact['governance']['readiness'] {
  const storedReadiness = (artifact.governance as ExperienceArtifact['governance'] & {
    readiness?: ExperienceArtifact['governance']['readiness'];
  }).readiness;
  return storedReadiness ?? {
    artifactType: artifact.type,
    reviewerRole: 'Human reviewer',
    requiredEvidence: artifact.governance.evidenceLabels.length ? artifact.governance.evidenceLabels : ['evidence labels', 'source caveats'],
    requiredLanguageApprovals: ['Human language review'],
    requiredSourceViews: artifact.governance.sourceViewIds,
    promotionGate: 'artifact_circulation_review',
    exportGate: 'artifact_export_capability',
    currentStatus: artifact.governance.circulationStatus,
    exportBlocked: true,
    blockers: [
      'Artifact readiness was migrated from an older local session record.',
      'Artifact export capability is disabled by governance.'
    ],
    guardrails: artifact.governance.guardrails,
    nextAction: 'Review the artifact, evidence, caveats, and gates before circulation.'
  };
}

export function reviewDurableSessionItem(input: AgentSessionReviewInput): AgentDurableSessionRecord {
  const sessionId = normalizeAgentSessionId(input.sessionId);
  const store = readStore();
  const existing = store.sessions.find((session) => session.sessionId === sessionId) ?? createSession(sessionId);
  const note = typeof input.note === 'string' && input.note.trim() ? input.note.trim() : null;
  const timestamp = now();
  let nextLedger = existing.ledger;
  let review: AgentReviewRecord | null = null;

  if (input.itemType === 'memory') {
    const target = existing.ledger.memory.find((record) => record.id === input.itemId);
    if (!target) throw new Error('Memory record not found.');
    if (target.status === 'blocked' && input.decision === 'accepted') {
      throw new Error('Blocked memory cannot be accepted until its capability gate is enabled.');
    }
    const afterStatus = input.decision === 'accepted'
      ? 'accepted'
      : input.decision === 'edited'
        ? 'suggested'
        : 'rejected';
    review = reviewRecord(sessionId, input.itemType, target.id, input.decision, target.label, note, target.status, afterStatus);
    nextLedger = {
      ...nextLedger,
      memory: nextLedger.memory.map((record) => record.id === target.id ? {
        ...record,
        label: input.decision === 'edited' && input.editedLabel ? input.editedLabel : record.label,
        detail: input.decision === 'edited' && input.editedDetail ? input.editedDetail : record.detail,
        status: afterStatus
      } : record)
    };
  } else if (input.itemType === 'artifact') {
    const target = existing.ledger.artifacts.find((artifact) => artifact.id === input.itemId);
    if (!target) throw new Error('Artifact record not found.');
    if (target.status === 'blocked' && input.decision === 'approved') {
      throw new Error('Blocked artifacts cannot be approved.');
    }
    const beforeStatus = target.reviewStatus ?? 'pending';
    const afterStatus = input.decision === 'approved'
      ? 'approved'
      : input.decision === 'edited'
        ? 'edited'
        : 'rejected';
    review = reviewRecord(sessionId, input.itemType, target.id, input.decision, target.label, note, beforeStatus, afterStatus);
    nextLedger = {
      ...nextLedger,
      artifacts: nextLedger.artifacts.map((artifact) => {
        if (artifact.id !== target.id) return artifact;
        const readiness = readinessForStoredArtifact(artifact);
        return {
          ...artifact,
          label: input.decision === 'edited' && input.editedLabel ? input.editedLabel : artifact.label,
          reviewStatus: afterStatus,
          reviewNote: note ?? artifact.reviewNote,
          governance: {
            ...artifact.governance,
            circulationStatus: afterStatus === 'approved'
              ? 'reviewed_for_prototype'
              : artifact.governance.circulationStatus,
            exportEnabled: false,
            readiness: {
              ...readiness,
              currentStatus: afterStatus === 'approved'
                ? 'reviewed_for_prototype'
                : readiness.currentStatus,
              exportBlocked: true,
              blockers: afterStatus === 'approved'
                ? readiness.blockers.filter((blocker) => !blocker.toLowerCase().includes('review is required'))
                : readiness.blockers
            }
          }
        };
      })
    };
  } else if (input.itemType === 'confirmation_gate') {
    const target = existing.ledger.confirmationGates.find((gate) => gate.id === input.itemId);
    if (!target) throw new Error('Confirmation gate not found.');
    if (target.status === 'blocked' && input.decision === 'approved') {
      throw new Error('Blocked confirmation gates cannot be approved until the underlying capability is enabled.');
    }
    const afterStatus = input.decision === 'approved'
      ? 'approved'
      : input.decision === 'dismissed'
        ? 'dismissed'
        : target.status;
    review = reviewRecord(sessionId, input.itemType, target.id, input.decision, target.label, note, target.status, afterStatus);
    nextLedger = {
      ...nextLedger,
      confirmationGates: nextLedger.confirmationGates.map((gate) => gate.id === target.id ? {
        ...gate,
        label: input.decision === 'edited' && input.editedLabel ? input.editedLabel : gate.label,
        reason: input.decision === 'edited' && input.editedDetail ? input.editedDetail : gate.reason,
        status: afterStatus
      } : gate)
    };
  }

  if (!review) throw new Error('Unsupported review decision.');
  const updated: AgentDurableSessionRecord = {
    ...existing,
    updatedAt: timestamp,
    ledger: {
      ...nextLedger,
      updatedAt: timestamp,
      reviews: [...nextLedger.reviews, review]
    }
  };
  rewriteSession(store, updated);
  return updated;
}

export function durableSessionToPersistence(session: AgentDurableSessionRecord, result?: AgentTurnResult): AgentTurnPersistence {
  const proactivity = session.ledger.proactivity ?? [];
  const pilotLearning = session.ledger.pilotLearning ?? [];
  const treatmentOutcomeReadiness = session.ledger.treatmentOutcomeReadiness ?? [];
  const capabilityState = session.ledger.capabilityState ?? [];
  const evidenceSpotlight = session.ledger.evidenceSpotlight ?? [];
  const sourceGovernance = session.ledger.sourceGovernance ?? [];
  const runtimeSurface = session.ledger.runtimeSurface ?? [];
  const experienceArchitecture = session.ledger.experienceArchitecture ?? [];
  const canvasState = session.ledger.canvasState ?? [];
  const reasoningStatus = session.ledger.reasoningStatus ?? [];
  const conversationPresence = session.ledger.conversationPresence ?? [];
  const workingContext = session.ledger.workingContext ?? [];
  const persistenceReadiness = session.ledger.persistenceReadiness ?? [];
  const reviewIdentity = session.ledger.reviewIdentity ?? [];
  const providerAdapter = session.ledger.providerAdapter ?? [];
  const runtimeQuality = session.ledger.runtimeQuality ?? [];
  const voiceRuntime = session.ledger.voiceRuntime ?? [];
  const voiceContract = session.ledger.voiceContract ?? [];
  const voiceReadiness = session.ledger.voiceReadiness ?? [];
  const reviewWorkflowSummary = buildSessionReviewWorkflowSummary(session.sessionId, session.ledger);
  const artifactReadinessSummary = buildSessionArtifactReadinessSummary(session.sessionId, session.ledger);
  const auditSummary = buildSessionAuditSummary(session.sessionId, session.ledger);
  const memoryAuditSummary = buildSessionMemoryAuditSummary(session.sessionId, session.ledger);
  const capabilityReadinessSummary = buildSessionCapabilityReadinessSummary(session.sessionId, session.ledger);
  const evidenceSpotlightSummary = buildSessionEvidenceSpotlightSummary(session.sessionId, session.ledger);
  const proactivitySummary = buildSessionProactivitySummary(session.sessionId, session.ledger);
  const pilotLearningSummary = buildSessionPilotLearningSummary(session.sessionId, session.ledger);
  const treatmentOutcomeReadinessSummary = buildSessionTreatmentOutcomeReadinessSummary(session.sessionId, session.ledger);
  const sourceGovernanceSummary = buildSessionSourceGovernanceSummary(session.sessionId, session.ledger);
  const sourceRuntimeIngestionSummary = buildSessionSourceRuntimeIngestionSummary(session.sessionId, session.ledger);
  const runtimeSurfaceSummary = buildSessionRuntimeSurfaceSummary(session.sessionId, session.ledger);
  const experienceArchitectureSummary = buildSessionExperienceArchitectureSummary(session.sessionId, session.ledger);
  const canvasContinuitySummary = buildSessionCanvasContinuitySummary(session.sessionId, session.ledger);
  const persistenceGovernanceSummary = buildSessionPersistenceGovernanceSummary(session.sessionId, session.ledger);
  const providerAdapterSummary = buildSessionProviderAdapterSummary(session.sessionId, session.ledger);
  const runtimeControlSummary = buildSessionRuntimeControlSummary(session.sessionId, session.ledger);
  const runtimeQualitySummary = buildSessionRuntimeQualitySummary(session.sessionId, session.ledger);
  const voiceRuntimeSummary = buildSessionVoiceRuntimeSummary(session.sessionId, session.ledger);
  const voiceContractSummary = buildSessionVoiceContractSummary(session.sessionId, session.ledger);
  const voiceReadinessSummary = buildSessionVoiceReadinessSummary(session.sessionId, session.ledger);
  const foundationReadinessSummary = buildSessionFoundationReadinessSummary(session.sessionId, session.ledger);
  const executivePilotSummary = buildSessionExecutivePilotSummary(session.sessionId, session.ledger);
  const promotionGateSummary = buildSessionPromotionGateSummary(session.sessionId, session.ledger);
  const foundationLayerAudit = result ? buildFoundationLayerAudit({
    result,
    workspaceOrchestration: buildWorkspaceOrchestrationState({
      result,
      runtimeEvents: result.events,
      runtimeState: 'ready',
      sessionLedger: session.ledger
    }),
    runtimeQualitySummary,
    voiceRuntimeSummary,
    voiceReadinessSummary,
    auditSummary,
    memoryAuditSummary,
    sourceRuntimeIngestionSummary,
    artifactReadinessSummary,
    treatmentOutcomeReadinessSummary,
    promotionGateSummary
  }) : undefined;

  return {
    status: 'persisted',
    sessionId: session.sessionId,
    store: 'local_json',
    ledgerSummary: {
      turns: session.ledger.turnIds.length,
      memory: session.ledger.memory.length,
      audit: session.ledger.audit.length,
      auditActionTypes: new Set(session.ledger.audit.map((record) => record.action)).size,
      auditRecordsRequiringConfirmation: session.ledger.audit.filter((record) => record.requiresConfirmation).length,
      artifacts: session.ledger.artifacts.length,
      artifactTypes: new Set(session.ledger.artifacts.map((artifact) => artifact.type)).size,
      artifactExportBlocked: session.ledger.artifacts.filter((artifact) => artifact.governance.readiness.exportBlocked).length,
      confirmationGates: session.ledger.confirmationGates.length,
      reviews: session.ledger.reviews.length,
      proactivityManifests: proactivity.length,
      proactivitySuggestions: proactivity.flatMap((manifest) => manifest.suggestions).length,
      proactivityHeldNotices: proactivity.flatMap((manifest) => manifest.heldNotices).length,
      pilotLearningManifests: pilotLearning.length,
      pilotLearningSignals: pilotLearning.flatMap((manifest) => manifest.signals).length,
      treatmentOutcomeReadinessManifests: treatmentOutcomeReadiness.length,
      treatmentOutcomeBlockedRequirements: new Set(treatmentOutcomeReadiness.flatMap((manifest) => manifest.blockedRequirementIds)).size,
      sourceGovernanceManifests: sourceGovernance.length,
      sourcePromotionCandidates: new Set(sourceGovernance.flatMap((manifest) => manifest.sourcePromotionCandidateIds)).size,
      sourceClaimCandidates: new Set(sourceGovernance.flatMap((manifest) => manifest.sourceClaimCandidateIds)).size,
      evidenceSpotlightTurns: evidenceSpotlight.length,
      evidenceSpotlightClaims: evidenceSpotlight.flatMap((record) => record.claims).length,
      evidenceSpotlightMissingClaims: evidenceSpotlight.flatMap((record) => record.claims).filter((claim) => claim.supportStatus === 'missing_evidence').length,
      runtimeSurfaceManifests: runtimeSurface.length,
      runtimeSurfaceIds: new Set(runtimeSurface.map((manifest) => manifest.activeSurfaceId)).size,
      experienceArchitectureManifests: experienceArchitecture.length,
      experienceTemplates: new Set(experienceArchitecture.map((manifest) => manifest.activeTemplateId).filter(Boolean)).size,
      renderedViewIds: new Set(experienceArchitecture.flatMap((manifest) => manifest.renderedViewIds)).size,
      canvasStateManifests: canvasState.length,
      canvasRenderedViews: new Set(canvasState.flatMap((manifest) => manifest.renderedViewIds)).size,
      reasoningStatusSteps: reasoningStatus.flatMap((manifest) => manifest.steps).length,
      conversationPresenceManifests: conversationPresence.length,
      workingContextManifests: workingContext.length,
      acceptedMemoryContextRecords: new Set(workingContext.flatMap((manifest) => manifest.acceptedMemory.map((memory) => memory.id))).size,
      persistenceReadinessManifests: persistenceReadiness.length,
      persistenceBlockedRequirements: new Set(persistenceReadiness.flatMap((manifest) => manifest.blockedRequirementIds)).size,
      reviewIdentityManifests: reviewIdentity.length,
      reviewIdentityBlockedApprovals: new Set(reviewIdentity.flatMap((manifest) => manifest.blockedEnterpriseApprovalTypes)).size,
      providerAdapterManifests: providerAdapter.length,
      providerAdapters: new Set(providerAdapter.flatMap((manifest) => manifest.adapters.map((adapter) => adapter.id))).size,
      capabilityStateTurns: capabilityState.length,
      runtimeControlTurns: capabilityState.filter((record) => record.runtimeControl).length,
      runtimeControlAdminOverrideRequirements: new Set(capabilityState.flatMap((record) => record.runtimeControl.adminOverrideRequiredFor)).size,
      runtimeControlEmergencyStopScopes: new Set(capabilityState.flatMap((record) => record.runtimeControl.emergencyStopScope)).size,
      disabledCapabilities: new Set(capabilityState.flatMap((record) => record.capabilities.filter((capability) => !capability.enabled).map((capability) => capability.id))).size,
      blockedCapabilityGates: session.ledger.confirmationGates.filter((gate) => gate.status === 'blocked' && ['export_artifact', 'accept_memory', 'promote_source_claim', 'write_source_data'].includes(gate.action)).length,
      runtimeQualityTurns: runtimeQuality.length,
      runtimeQualityChecks: runtimeQuality.flatMap((record) => record.checks).length,
      runtimeQualityBlockedChecks: runtimeQuality.flatMap((record) => record.checks).filter((check) => check.status === 'blocked').length,
      voiceRuntimeManifests: voiceRuntime.length,
      voiceRuntimeCompatibleViews: new Set(voiceRuntime.flatMap((manifest) => manifest.compatibleViewIds)).size,
      voiceRuntimeStreamEventTypes: new Set(voiceRuntime.flatMap((manifest) => manifest.streamEventTypes)).size,
      voiceReadinessManifests: voiceReadiness.length,
      voiceBlockedRequirements: new Set(voiceReadiness.flatMap((manifest) => manifest.blockedRequirementIds)).size,
      voiceContractManifests: voiceContract.length,
      voiceContractIncompatibleViews: new Set(voiceContract.flatMap((manifest) => manifest.activeIncompatibleViewIds)).size
    },
    reviewWorkflowSummary,
    artifactReadinessSummary,
    auditSummary,
    memoryAuditSummary,
    capabilityReadinessSummary,
    evidenceSpotlightSummary,
    proactivitySummary,
    pilotLearningSummary,
    treatmentOutcomeReadinessSummary,
    sourceGovernanceSummary,
    sourceRuntimeIngestionSummary,
    runtimeSurfaceSummary,
    experienceArchitectureSummary,
    canvasContinuitySummary,
    persistenceGovernanceSummary,
    providerAdapterSummary,
    runtimeControlSummary,
    runtimeQualitySummary,
    voiceRuntimeSummary,
    voiceContractSummary,
    voiceReadinessSummary,
    foundationReadinessSummary,
    executivePilotSummary,
    promotionGateSummary,
    foundationLayerAudit,
    caveats: session.persistence.caveats
  };
}
