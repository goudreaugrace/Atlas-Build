import type {
  AgentAuditRecord,
  AgentCanvasStateManifest,
  AgentCapabilityTurnRecord,
  AgentConversationPresenceManifest,
  AgentConfirmationGate,
  AgentEvidenceSpotlightTurnRecord,
  AgentExperienceArchitectureManifest,
  AgentInterruptionRecoveryManifest,
  AgentMemoryRecord,
  AgentPilotLearningManifest,
  AgentPersistenceReadinessManifest,
  AgentProactivityManifest,
  AgentProviderAdapterManifest,
  AgentReasoningStatusManifest,
  AgentReviewIdentityManifest,
  AgentRuntimeQualityTurnRecord,
  AgentRuntimeSurfaceManifest,
  AgentSessionAuditSummary,
  AgentSessionArtifactReadinessSummary,
  AgentSessionCanvasContinuitySummary,
  AgentSessionCapabilityReadinessSummary,
  AgentSessionEvidenceSpotlightSummary,
  AgentSessionExperienceArchitectureSummary,
  AgentSessionExecutivePilotSummary,
  AgentSessionFoundationReadinessSummary,
  AgentSessionMemoryAuditSummary,
  AgentSessionProviderAdapterSummary,
  AgentSessionPersistenceGovernanceSummary,
  AgentSessionProactivitySummary,
  AgentSessionPromotionGateSummary,
  AgentSessionReviewWorkflowSummary,
  AgentSessionPilotLearningSummary,
  AgentSessionRuntimeControlSummary,
  AgentSessionRuntimeQualitySummary,
  AgentSessionRuntimeSurfaceSummary,
  AgentSessionSourceGovernanceSummary,
  AgentSessionSourceRuntimeIngestionSummary,
  AgentSessionTreatmentOutcomeReadinessSummary,
  AgentSessionVoiceContractSummary,
  AgentSessionVoiceReadinessSummary,
  AgentSessionVoiceRuntimeSummary,
  AgentReviewRecord,
  AgentSourceGovernanceManifest,
  AgentTreatmentOutcomeReadinessManifest,
  AgentTurnResult,
  AgentVoiceOrchestrationRequirementStatus,
  AgentVoiceOrchestrationReadinessManifest,
  AgentVoiceRuntimeManifest,
  AgentVoiceSkillViewContractManifest,
  AgentWorkingContextManifest,
  ExperienceArtifact
} from '@/src/lib/intelligence/types';

export type AgentSessionLedger = {
  version: 'agent-session-ledger-v1';
  updatedAt: string;
  turnIds: string[];
  memory: AgentMemoryRecord[];
  audit: AgentAuditRecord[];
  artifacts: ExperienceArtifact[];
  confirmationGates: AgentConfirmationGate[];
  capabilityState: AgentCapabilityTurnRecord[];
  evidenceSpotlight: AgentEvidenceSpotlightTurnRecord[];
  proactivity: AgentProactivityManifest[];
  pilotLearning: AgentPilotLearningManifest[];
  treatmentOutcomeReadiness: AgentTreatmentOutcomeReadinessManifest[];
  sourceGovernance: AgentSourceGovernanceManifest[];
  runtimeSurface: AgentRuntimeSurfaceManifest[];
  experienceArchitecture: AgentExperienceArchitectureManifest[];
  canvasState: AgentCanvasStateManifest[];
  interruptionRecovery: AgentInterruptionRecoveryManifest[];
  reasoningStatus: AgentReasoningStatusManifest[];
  conversationPresence: AgentConversationPresenceManifest[];
  workingContext: AgentWorkingContextManifest[];
  persistenceReadiness: AgentPersistenceReadinessManifest[];
  reviewIdentity: AgentReviewIdentityManifest[];
  providerAdapter: AgentProviderAdapterManifest[];
  runtimeQuality: AgentRuntimeQualityTurnRecord[];
  voiceRuntime: AgentVoiceRuntimeManifest[];
  voiceContract: AgentVoiceSkillViewContractManifest[];
  voiceReadiness: AgentVoiceOrchestrationReadinessManifest[];
  reviews: AgentReviewRecord[];
};

export const AGENT_SESSION_LEDGER_STORAGE_KEY = 'bbe-agent-lab-session-ledger-v1';

export function emptySessionLedger(): AgentSessionLedger {
  return {
    version: 'agent-session-ledger-v1',
    updatedAt: new Date().toISOString(),
    turnIds: [],
    memory: [],
    audit: [],
    artifacts: [],
    confirmationGates: [],
    capabilityState: [],
    evidenceSpotlight: [],
    proactivity: [],
    pilotLearning: [],
    treatmentOutcomeReadiness: [],
    sourceGovernance: [],
    runtimeSurface: [],
    experienceArchitecture: [],
    canvasState: [],
    interruptionRecovery: [],
    reasoningStatus: [],
    conversationPresence: [],
    workingContext: [],
    persistenceReadiness: [],
    reviewIdentity: [],
    providerAdapter: [],
    runtimeQuality: [],
    voiceRuntime: [],
    voiceContract: [],
    voiceReadiness: [],
    reviews: []
  };
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function uniqueByKey<T>(items: T[], keyFor: (item: T) => string) {
  return Array.from(new Map(items.map((item) => [keyFor(item), item])).values());
}

export function mergeSessionLedgers(left: AgentSessionLedger, right: AgentSessionLedger): AgentSessionLedger {
  const leftPilotLearning = left.pilotLearning ?? [];
  const rightPilotLearning = right.pilotLearning ?? [];
  const leftCapabilityState = left.capabilityState ?? [];
  const rightCapabilityState = right.capabilityState ?? [];
  const leftEvidenceSpotlight = left.evidenceSpotlight ?? [];
  const rightEvidenceSpotlight = right.evidenceSpotlight ?? [];
  const leftProactivity = left.proactivity ?? [];
  const rightProactivity = right.proactivity ?? [];
  const leftTreatmentOutcomeReadiness = left.treatmentOutcomeReadiness ?? [];
  const rightTreatmentOutcomeReadiness = right.treatmentOutcomeReadiness ?? [];
  const leftSourceGovernance = left.sourceGovernance ?? [];
  const rightSourceGovernance = right.sourceGovernance ?? [];
  const leftRuntimeSurface = left.runtimeSurface ?? [];
  const rightRuntimeSurface = right.runtimeSurface ?? [];
  const leftExperienceArchitecture = left.experienceArchitecture ?? [];
  const rightExperienceArchitecture = right.experienceArchitecture ?? [];
  const leftCanvasState = left.canvasState ?? [];
  const rightCanvasState = right.canvasState ?? [];
  const leftInterruptionRecovery = left.interruptionRecovery ?? [];
  const rightInterruptionRecovery = right.interruptionRecovery ?? [];
  const leftReasoningStatus = left.reasoningStatus ?? [];
  const rightReasoningStatus = right.reasoningStatus ?? [];
  const leftConversationPresence = left.conversationPresence ?? [];
  const rightConversationPresence = right.conversationPresence ?? [];
  const leftWorkingContext = left.workingContext ?? [];
  const rightWorkingContext = right.workingContext ?? [];
  const leftPersistenceReadiness = left.persistenceReadiness ?? [];
  const rightPersistenceReadiness = right.persistenceReadiness ?? [];
  const leftReviewIdentity = left.reviewIdentity ?? [];
  const rightReviewIdentity = right.reviewIdentity ?? [];
  const leftProviderAdapter = left.providerAdapter ?? [];
  const rightProviderAdapter = right.providerAdapter ?? [];
  const leftRuntimeQuality = left.runtimeQuality ?? [];
  const rightRuntimeQuality = right.runtimeQuality ?? [];
  const leftVoiceRuntime = left.voiceRuntime ?? [];
  const rightVoiceRuntime = right.voiceRuntime ?? [];
  const leftVoiceContract = left.voiceContract ?? [];
  const rightVoiceContract = right.voiceContract ?? [];
  const leftVoiceReadiness = left.voiceReadiness ?? [];
  const rightVoiceReadiness = right.voiceReadiness ?? [];
  return {
    version: 'agent-session-ledger-v1',
    updatedAt: new Date().toISOString(),
    turnIds: Array.from(new Set([...left.turnIds, ...right.turnIds])),
    memory: uniqueById([...left.memory, ...right.memory]),
    audit: uniqueById([...left.audit, ...right.audit]),
    artifacts: uniqueById([...left.artifacts, ...right.artifacts]),
    confirmationGates: uniqueById([...left.confirmationGates, ...right.confirmationGates]),
    capabilityState: uniqueByKey([...leftCapabilityState, ...rightCapabilityState], (record) => record.turnId),
    evidenceSpotlight: uniqueByKey([...leftEvidenceSpotlight, ...rightEvidenceSpotlight], (record) => record.turnId),
    proactivity: uniqueByKey([...leftProactivity, ...rightProactivity], (manifest) => manifest.turnId),
    pilotLearning: uniqueByKey([...leftPilotLearning, ...rightPilotLearning], (manifest) => manifest.turnId),
    treatmentOutcomeReadiness: uniqueByKey([...leftTreatmentOutcomeReadiness, ...rightTreatmentOutcomeReadiness], (manifest) => manifest.turnId),
    sourceGovernance: uniqueByKey([...leftSourceGovernance, ...rightSourceGovernance], (manifest) => manifest.turnId),
    runtimeSurface: uniqueByKey([...leftRuntimeSurface, ...rightRuntimeSurface], (manifest) => manifest.turnId),
    experienceArchitecture: uniqueByKey([...leftExperienceArchitecture, ...rightExperienceArchitecture], (manifest) => manifest.turnId),
    canvasState: uniqueByKey([...leftCanvasState, ...rightCanvasState], (manifest) => manifest.turnId),
    interruptionRecovery: uniqueByKey([...leftInterruptionRecovery, ...rightInterruptionRecovery], (manifest) => manifest.turnId),
    reasoningStatus: uniqueByKey([...leftReasoningStatus, ...rightReasoningStatus], (manifest) => manifest.turnId),
    conversationPresence: uniqueByKey([...leftConversationPresence, ...rightConversationPresence], (manifest) => manifest.turnId),
    workingContext: uniqueByKey([...leftWorkingContext, ...rightWorkingContext], (manifest) => manifest.turnId),
    persistenceReadiness: uniqueByKey([...leftPersistenceReadiness, ...rightPersistenceReadiness], (manifest) => manifest.turnId),
    reviewIdentity: uniqueByKey([...leftReviewIdentity, ...rightReviewIdentity], (manifest) => manifest.turnId),
    providerAdapter: uniqueByKey([...leftProviderAdapter, ...rightProviderAdapter], (manifest) => manifest.turnId),
    runtimeQuality: uniqueByKey([...leftRuntimeQuality, ...rightRuntimeQuality], (record) => record.turnId),
    voiceRuntime: uniqueByKey([...leftVoiceRuntime, ...rightVoiceRuntime], (manifest) => manifest.turnId),
    voiceContract: uniqueByKey([...leftVoiceContract, ...rightVoiceContract], (manifest) => manifest.turnId),
    voiceReadiness: uniqueByKey([...leftVoiceReadiness, ...rightVoiceReadiness], (manifest) => manifest.turnId),
    reviews: uniqueById([...left.reviews, ...right.reviews])
  };
}

export function mergeTurnIntoLedger(ledger: AgentSessionLedger, result: AgentTurnResult): AgentSessionLedger {
  return mergeSessionLedgers(ledger, {
    version: 'agent-session-ledger-v1',
    updatedAt: new Date().toISOString(),
    turnIds: [result.turnId],
    memory: result.memory,
    audit: result.audit,
    artifacts: result.experiencePlan?.artifacts ?? [],
    confirmationGates: result.confirmationGates,
    capabilityState: [{
      id: `${result.turnId}-capability-state`,
      turnId: result.turnId,
      brandId: result.packet.brand.brandId,
      brandName: result.packet.brand.brandName,
      capabilities: result.capabilities,
      runtimeControl: result.runtimeControlManifest
    }],
    evidenceSpotlight: [{
      id: `${result.turnId}-evidence-spotlight`,
      turnId: result.turnId,
      brandId: result.packet.brand.brandId,
      brandName: result.packet.brand.brandName,
      claims: result.evidenceSpotlight
    }],
    proactivity: result.proactivityManifest ? [result.proactivityManifest] : [],
    pilotLearning: result.pilotLearningManifest ? [result.pilotLearningManifest] : [],
    treatmentOutcomeReadiness: result.treatmentOutcomeReadinessManifest ? [result.treatmentOutcomeReadinessManifest] : [],
    sourceGovernance: result.sourceGovernanceManifest ? [result.sourceGovernanceManifest] : [],
    runtimeSurface: result.runtimeSurfaceManifest ? [result.runtimeSurfaceManifest] : [],
    experienceArchitecture: result.experienceArchitectureManifest ? [result.experienceArchitectureManifest] : [],
    canvasState: result.canvasStateManifest ? [result.canvasStateManifest] : [],
    interruptionRecovery: result.interruptionRecoveryManifest ? [result.interruptionRecoveryManifest] : [],
    reasoningStatus: result.reasoningStatusManifest ? [result.reasoningStatusManifest] : [],
    conversationPresence: result.conversationPresenceManifest ? [result.conversationPresenceManifest] : [],
    workingContext: result.workingContextManifest ? [result.workingContextManifest] : [],
    persistenceReadiness: result.persistenceReadinessManifest ? [result.persistenceReadinessManifest] : [],
    reviewIdentity: result.reviewIdentityManifest ? [result.reviewIdentityManifest] : [],
    providerAdapter: result.providerAdapterManifest ? [result.providerAdapterManifest] : [],
    runtimeQuality: [{
      id: `${result.turnId}-runtime-quality`,
      turnId: result.turnId,
      brandId: result.packet.brand.brandId,
      brandName: result.packet.brand.brandName,
      checks: result.runtimeQualityChecks
    }],
    voiceRuntime: result.voiceRuntimeManifest ? [result.voiceRuntimeManifest] : [],
    voiceContract: result.voiceSkillViewContractManifest ? [result.voiceSkillViewContractManifest] : [],
    voiceReadiness: result.voiceOrchestrationReadinessManifest ? [result.voiceOrchestrationReadinessManifest] : [],
    reviews: []
  });
}

export function buildSessionProactivitySummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionProactivitySummary {
  const manifests = ledger.proactivity ?? [];
  const suggestions = manifests.flatMap((manifest) => manifest.suggestions);
  const heldNotices = manifests.flatMap((manifest) => manifest.heldNotices);
  const suggestionTypeCounts = countsBy(suggestions.map((suggestion) => suggestion.type));
  const suggestedTimingCounts = countsBy(suggestions.map((suggestion) => suggestion.suggestedTiming));
  const reviewRequiredSuggestions = suggestions.filter((suggestion) => suggestion.humanReviewRequired);
  const protocolItem = (
    id: AgentSessionProactivitySummary['proactivityPromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionProactivitySummary['proactivityPromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionProactivitySummary['proactivityPromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionProactivitySummary['proactivityPromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesAutonomousAction: false
  });
  const proactivityPromotionProtocol: AgentSessionProactivitySummary['proactivityPromotionProtocol'] = [
    protocolItem(
      'quiet_suggestion_capture',
      'Quiet follow-up suggestion capture',
      suggestions.length > 0 ? 'ready_for_review' : 'blocked',
      'human_follow_up',
      `${suggestions.length} quiet suggestions are persisted as review-required options with related evidence, gaps, gates, artifacts, and allowed next skills.`,
      suggestions.length > 0
        ? ['Captured suggestions are not action intent, reminders, scheduled notifications, external sends, background runs, or autonomous work.']
        : ['No quiet suggestions have been observed in this session.']
    ),
    protocolItem(
      'held_notice_review',
      'Held notice review',
      heldNotices.length > 0 ? 'held_for_review' : 'blocked',
      'human_follow_up',
      `${heldNotices.length} held notices explain which follow-ups were withheld instead of being acted on automatically.`,
      heldNotices.length > 0
        ? ['Held notices require human review and cannot become notifications, reminders, or sends.']
        : ['No held notices have been observed in this session.']
    ),
    protocolItem(
      'human_action_review',
      'Human action review',
      reviewRequiredSuggestions.length > 0 ? 'ready_for_review' : 'blocked',
      'human_follow_up',
      `${reviewRequiredSuggestions.length} suggestions explicitly require human review before any action can be considered.`,
      reviewRequiredSuggestions.length > 0
        ? ['Prototype review labels do not authorize reminders, scheduled notifications, external sends, background runs, or autonomous actions.']
        : ['Human-review-required suggestions have not been observed.']
    ),
    protocolItem(
      'reminder_scheduling_governance',
      'Reminder and scheduling governance',
      'blocked',
      'reminder_creation',
      'Reminder creation and scheduled notifications need user consent, calendar/task integration policy, notification copy review, and no-overlap operations.',
      [
        'Reminder creation and scheduled notifications remain disabled.',
        'No approved task/calendar provider, consent model, or notification governance is connected.'
      ]
    ),
    protocolItem(
      'external_background_operations',
      'External send and background operations governance',
      'blocked',
      'external_send_or_background_run',
      'External sends and background checks need delivery-channel approval, privacy/security review, retry/idempotency rules, source-governance limits, and monitoring.',
      [
        'External sends, background runs, and source promotion remain disabled.',
        'The prototype has no approved background job runner, delivery provider, or enterprise observability for proactive operations.'
      ]
    ),
    protocolItem(
      'autonomous_action_rollout',
      'Autonomous action rollout governance',
      'blocked',
      'autonomous_action',
      'Autonomous proactivity requires explicit policy approval, capability gating, auditability, rollback, user interruption controls, and production monitoring before any action can execute.',
      [
        'Autonomous actions remain disabled.',
        'Quiet proactivity is a reviewed suggestion ledger only, not an automation engine.'
      ]
    )
  ];

  return {
    id: 'agent-session-proactivity-v1',
    sessionId,
    mode: 'prototype_quiet_proactivity_continuity',
    store: 'local_json',
    turnsWithProactivity: manifests.length,
    suggestions: {
      total: suggestions.length,
      highPriority: suggestions.filter((suggestion) => suggestion.priority === 'high').length,
      mediumPriority: suggestions.filter((suggestion) => suggestion.priority === 'medium').length,
      lowPriority: suggestions.filter((suggestion) => suggestion.priority === 'low').length,
      humanReviewRequired: suggestions.filter((suggestion) => suggestion.humanReviewRequired).length
    },
    heldNotices: {
      total: heldNotices.length,
      heldBecause: uniqueStrings(heldNotices.map((notice) => notice.heldBecause)).slice(0, 12)
    },
    suggestionTypes: suggestionTypeCounts.map(({ item, count }) => ({ type: item, count })),
    suggestedTimings: suggestedTimingCounts.map(({ item, count }) => ({ timing: item, count })),
    latestSuggestions: suggestions.slice(-8).reverse(),
    latestHeldNotices: heldNotices.slice(-6).reverse(),
    relatedEvidenceLabels: uniqueStrings(suggestions.flatMap((suggestion) => suggestion.relatedEvidenceLabels)).slice(0, 24),
    relatedGapIds: uniqueStrings(suggestions.flatMap((suggestion) => suggestion.relatedGapIds)).slice(0, 24),
    relatedGateIds: uniqueStrings([
      ...suggestions.flatMap((suggestion) => suggestion.relatedGateIds),
      ...heldNotices.flatMap((notice) => notice.relatedGateIds)
    ]).slice(0, 40),
    relatedArtifactIds: uniqueStrings(suggestions.flatMap((suggestion) => suggestion.relatedArtifactIds)).slice(0, 24),
    allowedNextSkillIds: uniqueStrings(suggestions.flatMap((suggestion) => suggestion.allowedNextSkillIds)).slice(0, 24),
    autonomousActionsEnabled: false,
    scheduledNotificationsEnabled: false,
    externalSendEnabled: false,
    canCreateReminders: false,
    noOverlappingRuns: manifests.length > 0 && manifests.every((manifest) => manifest.noOverlappingRuns),
    backgroundRunsEnabled: false,
    sourcePromotionEnabled: false,
    reviewRequiredBeforeAction: true,
    proactivityPromotionProtocol,
    guardrails: [
      'Session proactivity is a reviewed suggestion ledger, not an automation engine.',
      'Follow-up suggestions and held notices require human review before they can become action intent.',
      'This summary must not create reminders, scheduled notifications, external sends, background runs, source promotion, or autonomous actions.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'It can show what the agent thinks should be revisited, but it cannot schedule, send, or act.',
      'Reminder governance, privacy posture, no-overlap operations, and production scheduling are not connected.'
    ]
  };
}

export function buildSessionPilotLearningSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionPilotLearningSummary {
  const manifests = ledger.pilotLearning ?? [];
  const signals = manifests.flatMap((manifest) => manifest.signals);
  const countByType = new Map<AgentSessionPilotLearningSummary['signalTypes'][number]['type'], number>();
  for (const signal of signals) {
    countByType.set(signal.type, (countByType.get(signal.type) ?? 0) + 1);
  }
  const capturedSignals = signals.filter((signal) => signal.status === 'captured_for_review');
  const blockedLearningPaths = Array.from(new Set(manifests.flatMap((manifest) => manifest.blockedLearningPaths))).slice(0, 12);
  const nextProofNeeds = Array.from(new Set(manifests.flatMap((manifest) => manifest.nextProofNeeds))).slice(0, 12);
  const reviewRequiredSignals = signals.filter((signal) => signal.humanReviewRequired);
  const protocolItem = (
    id: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionPilotLearningSummary['learningPromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesLearningWrite: false
  });
  const learningPromotionProtocol: AgentSessionPilotLearningSummary['learningPromotionProtocol'] = [
    protocolItem(
      'reviewed_signal_capture',
      'Reviewed pilot signal capture',
      capturedSignals.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${capturedSignals.length} pilot learning signals are captured for review across skills, templates, views, artifacts, gaps, decisions, sources, and proactivity.`,
      capturedSignals.length > 0
        ? ['Captured signals are review evidence only; they are not accepted memory, source truth, outcome learning, or efficacy proof.']
        : ['No captured-for-review learning signals have been observed in this session.']
    ),
    protocolItem(
      'human_learning_review',
      'Human learning review',
      reviewRequiredSignals.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${reviewRequiredSignals.length} learning signals require human review before they can inform future product or pilot decisions.`,
      reviewRequiredSignals.length > 0
        ? ['Prototype review does not authorize autonomous learning, canonical writes, or treatment outcome claims.']
        : ['Human-review-required learning signals have not been observed.']
    ),
    protocolItem(
      'proof_need_resolution',
      'Proof need resolution',
      nextProofNeeds.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${nextProofNeeds.length} next proof needs are visible for pilot follow-up before any learning can be promoted.`,
      nextProofNeeds.length > 0
        ? nextProofNeeds.slice(0, 4)
        : ['No next proof needs have been captured for this session.']
    ),
    protocolItem(
      'outcome_linkage_governance',
      'Outcome linkage governance',
      'blocked',
      'outcome_learning',
      'Outcome learning needs accepted outcome records, follow-up signal linkage, efficacy rules, and causal caveats before pilot signals can become treatment learning.',
      [
        'Outcome learning and treatment outcome claims remain disabled.',
        blockedLearningPaths.find((path) => path.toLowerCase().includes('outcome')) ?? 'Outcome records and follow-up linkage are not connected.'
      ]
    ),
    protocolItem(
      'canonical_learning_governance',
      'Canonical learning governance',
      'blocked',
      'canonical_learning',
      'Canonical learning requires governed promotion, source lineage, identity/access, audit, rollback, and enterprise storage before signals can write memory or source truth.',
      [
        'Canonical memory writes and canonical source writes remain disabled.',
        blockedLearningPaths.find((path) => path.toLowerCase().includes('canonical')) ?? 'Canonical learning governance is not connected.'
      ]
    ),
    protocolItem(
      'autonomous_learning_rollout',
      'Autonomous learning rollout governance',
      'blocked',
      'autonomous_learning',
      'Autonomous learning requires approved policy, monitoring, no-overlap operations, human override, and enterprise learning storage before the system can update itself.',
      [
        'Autonomous learning remains disabled.',
        blockedLearningPaths.find((path) => path.toLowerCase().includes('autonomous')) ?? 'Autonomous learning rollout policy is not approved.'
      ]
    )
  ];

  return {
    id: 'agent-session-pilot-learning-v1',
    sessionId,
    mode: 'prototype_reviewed_learning_signals',
    store: 'local_json',
    turnsWithLearning: manifests.length,
    signals: {
      total: signals.length,
      capturedForReview: signals.filter((signal) => signal.status === 'captured_for_review').length,
      blocked: signals.filter((signal) => signal.status === 'blocked').length,
      notAvailable: signals.filter((signal) => signal.status === 'not_available').length,
      humanReviewRequired: signals.filter((signal) => signal.humanReviewRequired).length
    },
    signalTypes: Array.from(countByType.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type)),
    latestSignals: signals.slice(-8).reverse(),
    blockedLearningPaths,
    nextProofNeeds,
    autonomousLearningEnabled: false,
    outcomeLearningEnabled: false,
    canonicalMemoryWriteEnabled: false,
    canonicalSourceWriteEnabled: false,
    treatmentOutcomeClaimsEnabled: false,
    learningPromotionProtocol,
    guardrails: [
      'Session learning is a review summary, not autonomous memory.',
      'Learning signals must not become source truth, accepted pattern memory, or treatment outcome claims without human review and governance.',
      'Blocked learning paths require enterprise governance or outcome evidence, not local approval.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'It can show what the pilot should review next, but it cannot claim efficacy, causality, or canonical learning.',
      'Enterprise learning storage, canonical writes, and outcome records are not connected.'
    ]
  };
}

export function buildSessionTreatmentOutcomeReadinessSummary(
  sessionId: string,
  ledger: AgentSessionLedger
): AgentSessionTreatmentOutcomeReadinessSummary {
  const manifests = ledger.treatmentOutcomeReadiness ?? [];
  const latest = manifests[manifests.length - 1];
  const latestRequirements = latest?.requirements ?? [];
  const requirementById = new Map(latestRequirements.map((requirement) => [requirement.id, requirement]));
  const protocolItem = (
    id: AgentSessionTreatmentOutcomeReadinessSummary['outcomeProofProtocol'][number]['id'],
    label: string,
    requirementId: string,
    fallbackRequiredBefore: AgentSessionTreatmentOutcomeReadinessSummary['outcomeProofProtocol'][number]['requiredBefore'],
    proof: string
  ): AgentSessionTreatmentOutcomeReadinessSummary['outcomeProofProtocol'][number] => {
    const requirement = requirementById.get(requirementId);
    return {
      id,
      label,
      status: requirement?.status ?? 'blocked',
      requiredBefore: requirement?.requiredFor ?? fallbackRequiredBefore,
      proof,
      blockers: requirement?.blockers ?? ['Run a governed treatment outcome readiness turn to inspect this proof requirement.'],
      enabledInPrototype: false
    };
  };

  return {
    id: 'agent-session-treatment-outcome-readiness-v1',
    sessionId,
    mode: 'prototype_treatment_outcome_readiness_usage',
    store: 'local_json',
    turnsWithTreatmentOutcomeReadiness: manifests.length,
    requirementStatusCounts: {
      ready: latestRequirements.filter((requirement) => requirement.status === 'ready').length,
      prototypeReady: latestRequirements.filter((requirement) => requirement.status === 'prototype_ready').length,
      blocked: latestRequirements.filter((requirement) => requirement.status === 'blocked').length
    },
    readyRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.readyRequirementIds)),
    prototypeRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.prototypeRequirementIds)),
    blockedRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.blockedRequirementIds)),
    latestRequirements: latestRequirements.map((requirement) => ({
      id: requirement.id,
      label: requirement.label,
      status: requirement.status,
      requiredFor: requirement.requiredFor,
      blockers: requirement.blockers,
      requiredEvidence: requirement.requiredEvidence
    })),
    relatedTreatmentIds: uniqueStrings(manifests.flatMap((manifest) => manifest.relatedTreatmentIds)).slice(0, 24),
    relatedFollowUpSignals: uniqueStrings(manifests.flatMap((manifest) => manifest.relatedFollowUpSignals)).slice(0, 24),
    relatedLearningSignalIds: uniqueStrings(manifests.flatMap((manifest) => manifest.relatedLearningSignalIds)).slice(0, 24),
    outcomeProofProtocol: [
      protocolItem(
        'baseline_capture',
        'Baseline and treatment record schema',
        'outcome-record-schema',
        'outcome_record_capture',
        'Define the treatment, baseline signals, source period, owner, and decision context before any outcome record can be accepted.'
      ),
      protocolItem(
        'follow_up_linkage',
        'Follow-up signal linkage',
        'follow-up-signal-linkage',
        'follow_up_signal_linkage',
        'Link follow-up signals to the same brand, treatment path, source period, and evidence labels without treating movement as causality.'
      ),
      protocolItem(
        'matched_evidence',
        'Matched evidence and caveats',
        'follow-up-signal-linkage',
        'follow_up_signal_linkage',
        'Attach baseline, follow-up, source-owner caveats, and missing-evidence notes so the record can be reviewed without inventing proof.'
      ),
      protocolItem(
        'human_review',
        'Human review and identity',
        'human-review-and-identity',
        'outcome_record_capture',
        'Require accountable reviewer identity, role/access control, and approval workflow before any outcome record leaves prototype review.'
      ),
      protocolItem(
        'efficacy_rule',
        'Efficacy summary rules',
        'efficacy-summary-rules',
        'treatment_efficacy_summary',
        'Define minimum outcome count, comparison logic, causal caveats, and allowed language before summarizing treatment efficacy.'
      ),
      protocolItem(
        'portfolio_learning_governance',
        'Portfolio learning governance',
        'canonical-learning-governance',
        'canonical_learning_store',
        'Approve canonical learning storage, source ownership, retention, and promotion rules before learning can affect future recommendations.'
      )
    ],
    latestNextPromotionStep: latest?.nextPromotionStep ?? null,
    outcomeLearningEnabled: false,
    treatmentOutcomeClaimsEnabled: false,
    acceptedOutcomeRecordStoreEnabled: false,
    canonicalLearningStoreEnabled: false,
    efficacySummaryEnabled: false,
    portfolioLearningEnabled: false,
    guardrails: [
      'Session treatment outcome readiness is a promotion checklist, not outcome learning.',
      'Treatment paths remain options to test until reviewed outcome records and methodology are approved.',
      'Follow-up signals cannot become efficacy claims, causal proof, accepted pattern memory, or canonical learning without governance.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'It shows accumulated readiness blockers and related signals; it does not record treatment execution or outcomes.',
      'Outcome records, efficacy summaries, portfolio learning stores, and canonical learning writes are not connected.'
    ]
  };
}

export function buildSessionReviewWorkflowSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionReviewWorkflowSummary {
  const pendingMemory = ledger.memory.filter((record) => record.status === 'suggested').length;
  const pendingArtifacts = ledger.artifacts.filter((artifact) => (artifact.reviewStatus ?? 'pending') === 'pending' && artifact.status !== 'blocked').length;
  const pendingGates = ledger.confirmationGates.filter((gate) => gate.status === 'required').length;
  const acceptedMemory = ledger.memory.filter((record) => record.status === 'accepted').length;
  const approvedArtifacts = ledger.artifacts.filter((artifact) => artifact.reviewStatus === 'approved').length;
  const approvedGates = ledger.confirmationGates.filter((gate) => gate.status === 'approved').length;
  const rejectedOrDismissed = ledger.reviews.filter((review) => ['rejected', 'dismissed'].includes(review.decision)).length;
  const blockedMemory = ledger.memory.filter((record) => record.status === 'blocked').length;
  const blockedArtifacts = ledger.artifacts.filter((artifact) => artifact.status === 'blocked').length;
  const blockedGates = ledger.confirmationGates.filter((gate) => gate.status === 'blocked').length;
  const capabilityBlockedGates = ledger.confirmationGates.filter((gate) => gate.status === 'blocked' && ['export_artifact', 'accept_memory', 'promote_source_claim', 'write_source_data'].includes(gate.action)).length;

  return {
    id: 'agent-session-review-workflow-v1',
    sessionId,
    mode: 'prototype_local_review_queue',
    reviewer: 'human_review',
    store: 'local_json',
    pending: {
      memory: pendingMemory,
      artifacts: pendingArtifacts,
      confirmationGates: pendingGates,
      total: pendingMemory + pendingArtifacts + pendingGates
    },
    reviewed: {
      acceptedMemory,
      approvedArtifacts,
      approvedGates,
      rejectedOrDismissed,
      totalReviews: ledger.reviews.length
    },
    blocked: {
      memory: blockedMemory,
      artifacts: blockedArtifacts,
      confirmationGates: blockedGates,
      capabilityBlockedGates
    },
    officialApprovalEnabled: false,
    enterpriseIdentityEnabled: false,
    canonicalWritesEnabled: false,
    artifactExportEnabled: false,
    autoAcceptMemoryEnabled: false,
    runtimeAutoConsumptionEnabled: false,
    nextActions: [
      pendingMemory > 0 ? 'Review suggested memory before it can become accepted working context.' : 'No suggested memory is currently pending review.',
      pendingArtifacts > 0 ? 'Review draft artifacts for prototype use while export remains disabled.' : 'No draft artifacts are currently pending review.',
      pendingGates > 0 ? 'Resolve required confirmation gates without approving blocked capability gates.' : 'No required confirmation gates are currently pending review.',
      blockedGates > 0 ? 'Blocked capability gates require governance/config changes, not local approval.' : 'No blocked confirmation gates are currently present.'
    ],
    guardrails: [
      'Local review decisions are prototype workflow state, not official enterprise approvals.',
      'Accepted memory is working context only; it is not source truth.',
      'Artifact review may mark prototype readiness but must not enable export or circulation by itself.',
      'Source claims and source promotion candidates must not become canonical facts through this queue.'
    ],
    caveats: [
      'This summary is computed from the local JSON session ledger.',
      'Enterprise reviewer identity, role-based access, official approval, and retention controls are not connected.',
      'Blocked gates remain blocked even when a local reviewer tries to approve them.'
    ]
  };
}

export function buildSessionArtifactReadinessSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionArtifactReadinessSummary {
  const artifacts = ledger.artifacts ?? [];
  const reviewRequired = artifacts.filter((artifact) => artifact.humanReviewRequired).length;
  const pendingReview = artifacts.filter((artifact) => (artifact.reviewStatus ?? 'pending') === 'pending' && artifact.status !== 'blocked').length;
  const prototypeReviewed = artifacts.filter((artifact) => artifact.governance.circulationStatus === 'reviewed_for_prototype' || artifact.governance.readiness.currentStatus === 'reviewed_for_prototype').length;
  const blocked = artifacts.filter((artifact) => artifact.status === 'blocked').length;
  const exportBlocked = artifacts.filter((artifact) => artifact.governance.readiness.exportBlocked).length;
  const requiredEvidence = uniqueStrings(artifacts.flatMap((artifact) => artifact.governance.readiness.requiredEvidence)).slice(0, 20);
  const requiredSourceViews = uniqueStrings(artifacts.flatMap((artifact) => artifact.governance.readiness.requiredSourceViews)).slice(0, 20);
  const requiredLanguageApprovals = uniqueStrings(artifacts.flatMap((artifact) => artifact.governance.readiness.requiredLanguageApprovals)).slice(0, 20);
  const blockedExportGateIds = uniqueStrings(artifacts
    .filter((artifact) => artifact.governance.readiness.exportBlocked)
    .map((artifact) => artifact.governance.readiness.exportGate)).slice(0, 12);
  const protocolItem = (
    id: AgentSessionArtifactReadinessSummary['artifactCirculationProtocol'][number]['id'],
    label: string,
    status: AgentSessionArtifactReadinessSummary['artifactCirculationProtocol'][number]['status'],
    requiredBefore: AgentSessionArtifactReadinessSummary['artifactCirculationProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionArtifactReadinessSummary['artifactCirculationProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesExport: false
  });
  const artifactCirculationProtocol: AgentSessionArtifactReadinessSummary['artifactCirculationProtocol'] = [
    protocolItem(
      'draft_artifact_capture',
      'Draft artifact capture',
      artifacts.length > 0 ? 'ready_for_review' : 'blocked',
      'prototype_review',
      `${artifacts.length} generated artifact records are persisted in the prototype session ledger.`,
      artifacts.length > 0 ? ['Draft capture is not circulation approval.'] : ['No generated artifact records are available for review.']
    ),
    protocolItem(
      'evidence_source_coverage',
      'Evidence and source-view coverage',
      requiredEvidence.length > 0 && requiredSourceViews.length > 0 ? 'ready_for_review' : 'blocked',
      'prototype_review',
      `${requiredEvidence.length} evidence requirements and ${requiredSourceViews.length} source-view requirements are attached.`,
      requiredEvidence.length > 0 && requiredSourceViews.length > 0
        ? ['Coverage must still be reviewed by the accountable owner.']
        : ['Artifacts need evidence labels and source-view requirements before prototype review.']
    ),
    protocolItem(
      'human_prototype_review',
      'Human prototype review',
      prototypeReviewed > 0 ? 'prototype_reviewed' : 'blocked',
      'stakeholder_language_approval',
      `${prototypeReviewed} artifacts are reviewed for prototype use; ${pendingReview} remain pending review.`,
      prototypeReviewed > 0
        ? ['Prototype review does not enable export, copy, circulation, or official approval.']
        : ['A qualified reviewer must review the artifact before any circulation discussion.']
    ),
    protocolItem(
      'stakeholder_language_approval',
      'Stakeholder language approval',
      'blocked',
      'artifact_export',
      `${requiredLanguageApprovals.length} language approval requirements are tracked for generated artifacts.`,
      ['Stakeholder-approved language and circulation policy are not connected in the prototype.']
    ),
    protocolItem(
      'export_capability_gate',
      'Artifact export/copy capability gate',
      'blocked',
      'artifact_export',
      `${blockedExportGateIds.length || 1} export gate IDs remain blocked for generated artifacts.`,
      ['Artifact export and copy capabilities remain disabled by policy.']
    ),
    protocolItem(
      'external_circulation_governance',
      'External circulation governance',
      'blocked',
      'external_circulation',
      'Enterprise publishing workflow, official approval, and external circulation are not enabled.',
      ['External circulation, official approval, and enterprise publishing workflow remain disabled.']
    )
  ];

  return {
    id: 'agent-session-artifact-readiness-v1',
    sessionId,
    mode: 'prototype_artifact_readiness_continuity',
    store: 'local_json',
    artifacts: {
      total: artifacts.length,
      reviewRequired,
      pendingReview,
      prototypeReviewed,
      blocked,
      exportBlocked
    },
    artifactTypeCounts: countsBy(artifacts.map((artifact) => artifact.type)).map(({ item, count }) => ({ artifactType: item, count })),
    readinessStatusCounts: countsBy(artifacts.map((artifact) => artifact.governance.readiness.currentStatus)).map(({ item, count }) => ({ status: item, count })),
    requiredReviewerRoles: uniqueStrings(artifacts.map((artifact) => artifact.governance.readiness.reviewerRole)).slice(0, 12),
    requiredEvidence,
    requiredSourceViews,
    requiredLanguageApprovals,
    blockedExportGateIds,
    reviewGateIds: uniqueStrings(artifacts.map((artifact) => artifact.governance.reviewGateId).filter((item): item is string => Boolean(item))).slice(0, 24),
    latestArtifacts: artifacts.slice(-12).reverse().map((artifact) => ({
      id: artifact.id,
      type: artifact.type,
      label: artifact.label,
      status: artifact.status,
      reviewStatus: artifact.reviewStatus ?? 'pending',
      readinessStatus: artifact.governance.readiness.currentStatus,
      circulationStatus: artifact.governance.circulationStatus,
      exportBlocked: true,
      reviewerRole: artifact.governance.readiness.reviewerRole,
      nextAction: artifact.governance.readiness.nextAction,
      evidenceLabels: artifact.governance.evidenceLabels,
      sourceViewIds: artifact.governance.sourceViewIds
    })),
    artifactCirculationProtocol,
    artifactExportEnabled: false,
    artifactCopyEnabled: false,
    artifactCirculationEnabled: false,
    officialApprovalEnabled: false,
    enterprisePublishingWorkflowEnabled: false,
    guardrails: [
      'Session artifact readiness is review/proof metadata, not export approval.',
      'Prototype review can mark an artifact reviewed for prototype use, but it cannot enable copy, export, circulation, or official approval.',
      'Generated artifacts must remain linked to evidence, source views, language approvals, and blocked capability gates.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'Enterprise publishing workflow, stakeholder-approved language, official approval, and artifact export/copy are not connected.',
      'Readiness counts can guide review, but they do not make drafts final management recommendations.'
    ]
  };
}

function uniqueStrings<T extends string>(items: T[]): T[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function countsBy<T extends string>(items: T[]) {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count || a.item.localeCompare(b.item));
}

export function buildSessionAuditSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionAuditSummary {
  const records = ledger.audit ?? [];
  const actions = new Set(records.map((record) => record.action));
  const turnsWithAudit = new Set(records.map((record) => record.turnId)).size;
  const recordsRequiringConfirmation = records.filter((record) => record.requiresConfirmation).length;
  const turnLifecycleAudited = actions.has('turn_started') && actions.has('turn_completed');
  const evidenceUseAudited = actions.has('evidence_spotlight_created') || records.some((record) => record.evidenceLabels.length > 0);
  const viewRequestsAudited = actions.has('view_requested');
  const artifactGenerationAudited = actions.has('artifact_generated');
  const memorySuggestionsAudited = actions.has('memory_suggested');
  const sourceGovernanceAudited = actions.has('source_governance_checked');
  const runtimeQualityAudited = actions.has('runtime_quality_checked');
  const coverageChecks = [
    turnLifecycleAudited,
    evidenceUseAudited,
    viewRequestsAudited,
    artifactGenerationAudited,
    memorySuggestionsAudited,
    sourceGovernanceAudited,
    runtimeQualityAudited
  ];
  const coveredChecks = coverageChecks.filter(Boolean).length;
  const protocolItem = (
    id: AgentSessionAuditSummary['auditGovernanceProtocol'][number]['id'],
    label: string,
    status: AgentSessionAuditSummary['auditGovernanceProtocol'][number]['status'],
    requiredBefore: AgentSessionAuditSummary['auditGovernanceProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionAuditSummary['auditGovernanceProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesAuditExport: false
  });
  const auditGovernanceProtocol: AgentSessionAuditSummary['auditGovernanceProtocol'] = [
    protocolItem(
      'runtime_audit_capture',
      'Runtime audit capture',
      records.length > 0 ? 'ready' : 'blocked',
      'prototype_audit_review',
      `${records.length} local JSON audit records cover ${turnsWithAudit} governed turns.`,
      records.length > 0
        ? ['Prototype audit capture is local continuity, not an enterprise compliance log.']
        : ['No audit records have been observed in this session.']
    ),
    protocolItem(
      'confirmation_linkage',
      'Confirmation-required linkage',
      recordsRequiringConfirmation > 0 ? 'ready_for_review' : 'blocked',
      'prototype_audit_review',
      `${recordsRequiringConfirmation} audit records require confirmation and should remain linked to human review gates.`,
      recordsRequiringConfirmation > 0
        ? ['Confirmation-required records are review context only; they do not grant official approval.']
        : ['No confirmation-required audit records have been observed in this session.']
    ),
    protocolItem(
      'coverage_completeness',
      'Audit coverage completeness',
      coveredChecks >= 6 ? 'ready_for_review' : 'blocked',
      'prototype_audit_review',
      `${coveredChecks} of ${coverageChecks.length} audit coverage checks are observed across lifecycle, evidence, views, artifacts, memory, source, and runtime quality.`,
      coveredChecks >= 6
        ? ['Coverage is sufficient for prototype review, not production certification.']
        : ['Lifecycle, evidence, view, artifact, memory, source, or runtime-quality audit coverage is incomplete.']
    ),
    protocolItem(
      'audit_export_governance',
      'Audit export governance',
      'blocked',
      'audit_export',
      'Audit export requires approved report shape, stakeholder language, redaction rules, reviewer identity, and export capability policy.',
      [
        'Audit export remains disabled.',
        'Prototype audit records are not export-ready audit reports.'
      ]
    ),
    protocolItem(
      'enterprise_audit_store_governance',
      'Enterprise audit store governance',
      'blocked',
      'enterprise_audit_store',
      'Enterprise audit storage requires schema, retention/privacy policy, access control, backup/recovery, monitoring, and compliance ownership.',
      [
        'Enterprise audit storage remains disabled.',
        'Local JSON/browser continuity is not a compliant enterprise audit store.'
      ]
    ),
    protocolItem(
      'canonical_audit_write_governance',
      'Canonical audit write governance',
      'blocked',
      'canonical_audit_write',
      'Canonical audit writes require official identity, canonical record ownership, immutable write policy, source lineage, and rollback procedures.',
      [
        'Canonical audit writes remain disabled.',
        'Prototype audit continuity cannot certify source truth, official approval, or business decisions.'
      ]
    )
  ];

  return {
    id: 'agent-session-audit-summary-v1',
    sessionId,
    mode: 'prototype_runtime_audit_continuity',
    store: 'local_json',
    turnsWithAudit,
    records: records.length,
    recordsRequiringConfirmation,
    actionCounts: countsBy(records.map((record) => record.action)).map(({ item, count }) => ({ action: item, count })),
    skillIds: uniqueStrings(records.map((record) => record.skillId).filter((item): item is string => Boolean(item))).slice(0, 16),
    viewIds: uniqueStrings(records.map((record) => record.viewId).filter((item): item is string => Boolean(item))).slice(0, 16),
    artifactIds: uniqueStrings(records.map((record) => record.artifactId).filter((item): item is string => Boolean(item))).slice(0, 16),
    evidenceLabels: uniqueStrings(records.flatMap((record) => record.evidenceLabels)).slice(0, 16),
    latestRecords: records.slice(-12).reverse().map((record) => ({
      id: record.id,
      action: record.action,
      label: record.label,
      detail: record.detail,
      timestamp: record.timestamp,
      turnId: record.turnId,
      brandId: record.brandId,
      skillId: record.skillId,
      viewId: record.viewId,
      artifactId: record.artifactId,
      evidenceLabels: record.evidenceLabels,
      requiresConfirmation: record.requiresConfirmation
    })),
    turnLifecycleAudited,
    evidenceUseAudited,
    viewRequestsAudited,
    artifactGenerationAudited,
    memorySuggestionsAudited,
    sourceGovernanceAudited,
    runtimeQualityAudited,
    auditExportEnabled: false,
    auditCanonicalWriteEnabled: false,
    enterpriseAuditStoreEnabled: false,
    auditGovernanceProtocol,
    guardrails: [
      'Session audit summaries are read-only continuity records, not an exportable audit report.',
      'Confirmation-required audit records must remain linked to human review gates.',
      'Audit continuity does not enable canonical writes, source promotion, artifact export, or official approval.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Prototype audit continuity is not an enterprise audit store, retention policy, or official compliance log.',
      'Audit records can explain what the governed runtime did, but they do not certify source truth or business approval.'
    ]
  };
}

export function buildSessionMemoryAuditSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionMemoryAuditSummary {
  const memory = ledger.memory ?? [];
  const audit = ledger.audit ?? [];
  const workingContext = ledger.workingContext ?? [];
  const memoryAuditRecords = audit.filter((record) => ['memory_suggested', 'accepted_memory_loaded', 'working_context_built'].includes(record.action));
  const memoryReviewGates = ledger.confirmationGates.filter((gate) => gate.action === 'accept_memory');
  const memoryReviews = ledger.reviews.filter((review) => review.itemType === 'memory');
  const runtimeQualityChecks = ledger.runtimeQuality.flatMap((record) => record.checks);
  const suggested = memory.filter((record) => record.status === 'suggested').length;
  const accepted = memory.filter((record) => record.status === 'accepted').length;
  const rejected = memory.filter((record) => record.status === 'rejected').length;
  const blocked = memory.filter((record) => record.status === 'blocked').length;
  const humanReviewRequired = memory.filter((record) => record.humanReviewRequired).length;
  const acceptedMemoryContextIds = uniqueStrings(workingContext.flatMap((manifest) => manifest.acceptedMemory.map((record) => record.id))).slice(0, 40);
  const acceptedMemorySourceTurnIds = uniqueStrings(workingContext.flatMap((manifest) => manifest.acceptedMemory.map((record) => record.sourceTurnId))).slice(0, 40);
  const reviewGateIds = uniqueStrings(memoryReviewGates.map((gate) => gate.id)).slice(0, 40);
  const blockedMemoryGateIds = uniqueStrings(memoryReviewGates.filter((gate) => gate.status === 'blocked').map((gate) => gate.id)).slice(0, 40);
  const memoryReviewDecisions = {
    accepted: memoryReviews.filter((review) => review.decision === 'accepted').length,
    edited: memoryReviews.filter((review) => review.decision === 'edited').length,
    rejected: memoryReviews.filter((review) => review.decision === 'rejected').length,
    total: memoryReviews.length
  };
  const protocolItem = (
    id: AgentSessionMemoryAuditSummary['memoryPromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionMemoryAuditSummary['memoryPromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionMemoryAuditSummary['memoryPromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionMemoryAuditSummary['memoryPromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesCanonicalMemory: false
  });
  const memoryPromotionProtocol: AgentSessionMemoryAuditSummary['memoryPromotionProtocol'] = [
    protocolItem(
      'suggested_memory_capture',
      'Suggested memory capture',
      memory.length > 0 ? 'ready_for_review' : 'blocked',
      'working_context_load',
      `${memory.length} memory records captured; ${suggested} remain suggested and review-controlled.`,
      memory.length > 0 ? ['Suggested memory is not loaded into working context until human review.'] : ['No memory records have been captured yet.']
    ),
    protocolItem(
      'human_memory_review',
      'Human memory review',
      memoryReviewDecisions.total > 0 ? 'ready_for_review' : 'blocked',
      'working_context_load',
      `${memoryReviewDecisions.total} memory review decisions recorded; ${reviewGateIds.length} memory review gates tracked.`,
      memoryReviewDecisions.total > 0 ? ['Local prototype review is not official enterprise memory approval.'] : ['A human must accept, edit, or reject suggested memory before it can load as working context.']
    ),
    protocolItem(
      'accepted_working_context',
      'Accepted working context',
      acceptedMemoryContextIds.length > 0 ? 'accepted_for_context' : 'blocked',
      'canonical_memory_write',
      `${acceptedMemoryContextIds.length} accepted memory records loaded as active working context across ${acceptedMemorySourceTurnIds.length} source turns.`,
      acceptedMemoryContextIds.length > 0 ? ['Accepted memory is working context only, not canonical brand truth.'] : ['No accepted memory has been loaded into working context yet.']
    ),
    protocolItem(
      'canonical_memory_governance',
      'Canonical memory governance',
      'blocked',
      'canonical_memory_write',
      'Canonical memory writes remain disabled by policy.',
      ['Canonical memory governance, official approval, and source-of-truth promotion are not enabled.']
    ),
    protocolItem(
      'enterprise_memory_storage',
      'Enterprise memory storage',
      'blocked',
      'enterprise_memory_store',
      'Enterprise memory storage remains disabled by persistence readiness requirements.',
      ['Enterprise schema, identity/access, retention/privacy, and backup/recovery blockers are not cleared.']
    ),
    protocolItem(
      'memory_auto_accept_automation',
      'Memory auto-accept automation',
      'blocked',
      'memory_auto_accept',
      'Memory auto-accept remains disabled; all memory promotion requires review.',
      ['Suggested memory cannot auto-promote into working context, canonical memory, or enterprise storage.']
    )
  ];

  return {
    id: 'agent-session-memory-audit-v1',
    sessionId,
    mode: 'prototype_memory_audit_continuity',
    store: 'local_json',
    turnsWithWorkingContext: workingContext.length,
    memory: {
      total: memory.length,
      suggested,
      accepted,
      rejected,
      blocked,
      humanReviewRequired
    },
    memoryTypeCounts: countsBy(memory.map((record) => record.type)).map(({ item, count }) => ({ type: item, count })),
    acceptedMemoryContextIds,
    acceptedMemorySourceTurnIds,
    reviewGateIds,
    blockedMemoryGateIds,
    memoryReviewDecisions,
    auditCoverage: {
      memoryAuditRecords: memoryAuditRecords.length,
      turnsWithMemoryAudit: new Set(memoryAuditRecords.map((record) => record.turnId)).size,
      workingContextAudited: audit.some((record) => record.action === 'working_context_built'),
      memorySuggestionsAudited: audit.some((record) => record.action === 'memory_suggested'),
      acceptedMemoryLoadedAudited: audit.some((record) => record.action === 'accepted_memory_loaded'),
      runtimeQualityMemoryReviewChecked: runtimeQualityChecks.some((check) => check.id === 'memory-review-required'),
      latestMemoryAuditLabels: memoryAuditRecords.slice(-8).reverse().map((record) => record.label)
    },
    latestMemory: memory.slice(-12).reverse().map((record) => ({
      id: record.id,
      type: record.type,
      label: record.label,
      status: record.status,
      sourceTurnId: record.sourceTurnId,
      evidenceLabels: record.evidenceLabels,
      humanReviewRequired: record.humanReviewRequired
    })),
    memoryPromotionProtocol,
    autoAcceptMemoryEnabled: false,
    reviewedMemoryWriteEnabled: false,
    canonicalMemoryWriteEnabled: false,
    enterpriseMemoryStoreEnabled: false,
    guardrails: [
      'Memory continuity is review-controlled: suggested memory cannot become working context until a human accepts or edits it.',
      'Accepted memory is working context only; it is not source truth, official approval, or canonical brand knowledge.',
      'Memory audit continuity cannot enable reviewed-memory writes, canonical memory writes, source writes, exports, or autonomous learning.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Prototype memory review uses the local human_review label, not enterprise reviewer identity or role access.',
      'Enterprise memory storage, retention, backup, and canonical promotion governance remain disabled.'
    ]
  };
}

export function buildSessionCapabilityReadinessSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionCapabilityReadinessSummary {
  const records = ledger.capabilityState ?? [];
  const latest = records[records.length - 1];
  const latestCapabilities = latest?.capabilities ?? [];
  const latestRuntimeControl = latest?.runtimeControl;
  const enabledCapabilityIds = latestCapabilities.filter((capability) => capability.enabled).map((capability) => capability.id);
  const disabledCapabilities = latestCapabilities.filter((capability) => !capability.enabled);
  const disabledCapabilityIds = disabledCapabilities.map((capability) => capability.id);
  const blockedCapabilityGates = ledger.confirmationGates.filter((gate) => gate.status === 'blocked' && ['export_artifact', 'accept_memory', 'promote_source_claim', 'write_source_data'].includes(gate.action));
  const requiredReviewGates = ledger.confirmationGates.filter((gate) => gate.status === 'required');
  const reviewedGateIds = ledger.confirmationGates.filter((gate) => ['approved', 'dismissed'].includes(gate.status)).map((gate) => gate.id);
  const blockedGateCountsByAction = countsBy(blockedCapabilityGates.map((gate) => gate.action)).map(({ item, count }) => ({ action: item, count }));
  const riskyCapabilityPromotionProtocol: AgentSessionCapabilityReadinessSummary['riskyCapabilityPromotionProtocol'] = [
    {
      id: 'capability_request',
      label: 'Capability request captured',
      status: blockedCapabilityGates.length || requiredReviewGates.length ? 'prototype_ready' : 'blocked',
      requiredBefore: 'prototype_review',
      proof: `${blockedCapabilityGates.length} blocked capability gates and ${requiredReviewGates.length} review-required gates observed.`,
      blockers: blockedCapabilityGates.length || requiredReviewGates.length ? [] : ['capability_request_not_observed'],
      enablesCapability: false
    },
    {
      id: 'human_review_gate',
      label: 'Human review gate',
      status: requiredReviewGates.length || reviewedGateIds.length ? 'prototype_ready' : 'blocked',
      requiredBefore: 'capability_enablement',
      proof: `${requiredReviewGates.length} required review gates and ${reviewedGateIds.length} reviewed/dismissed gates observed.`,
      blockers: requiredReviewGates.length || reviewedGateIds.length ? [] : ['human_review_gate_not_observed'],
      enablesCapability: false
    },
    {
      id: 'policy_config_change',
      label: 'Policy and config change',
      status: 'blocked',
      requiredBefore: 'capability_enablement',
      proof: `${disabledCapabilityIds.length} capabilities remain disabled by configuration.`,
      blockers: ['capability_flag_change_not_approved', 'admin_override_not_available'],
      enablesCapability: false
    },
    {
      id: 'runtime_control_validation',
      label: 'Runtime control validation',
      status: latestRuntimeControl?.runtimeEnabled && !latestRuntimeControl.killSwitchActive ? 'prototype_ready' : 'blocked',
      requiredBefore: 'runtime_execution',
      proof: latestRuntimeControl
        ? `Runtime policy ${latestRuntimeControl.runtimePolicyId} observed; bypass remains disabled and kill switch is ${latestRuntimeControl.killSwitchActive ? 'active' : 'inactive'}.`
        : 'No runtime control manifest observed for this session.',
      blockers: latestRuntimeControl?.runtimeEnabled && !latestRuntimeControl.killSwitchActive
        ? ['runtime_control_is_observed_only']
        : ['runtime_control_not_ready'],
      enablesCapability: false
    },
    {
      id: 'integration_evidence',
      label: 'Surface integration evidence',
      status: 'blocked',
      requiredBefore: 'surface_promotion',
      proof: 'Capability-specific UI/API implementation, proof rails, adversarial evals, and rollback behavior are not approved for risky capability activation.',
      blockers: ['surface_specific_integration_not_approved', 'adversarial_promotion_evals_required', 'rollback_behavior_required'],
      enablesCapability: false
    },
    {
      id: 'production_rollout_governance',
      label: 'Production rollout governance',
      status: 'blocked',
      requiredBefore: 'production_use',
      proof: 'Enterprise authorization, audit/export policy, source governance, voice policy, and operations rollback are not cleared for production capability activation.',
      blockers: ['enterprise_authorization_required', 'production_rollout_not_certified', 'operations_rollback_plan_required'],
      enablesCapability: false
    }
  ];

  return {
    id: 'agent-session-capability-readiness-v1',
    sessionId,
    mode: 'prototype_risky_capability_promotion_readiness',
    store: 'local_json',
    turnsWithCapabilityState: records.length,
    capabilities: latestCapabilities.map((capability) => ({
      id: capability.id,
      label: capability.label,
      enabled: capability.enabled,
      riskLevel: capability.riskLevel,
      requiredHumanApproval: capability.requiredHumanApproval,
      blockedReason: capability.blockedReason,
      allowedActions: capability.allowedActions
    })),
    enabledCapabilityIds,
    disabledCapabilityIds,
    highRiskDisabledCapabilityIds: disabledCapabilities.filter((capability) => capability.riskLevel === 'high').map((capability) => capability.id),
    mediumRiskDisabledCapabilityIds: disabledCapabilities.filter((capability) => capability.riskLevel === 'medium').map((capability) => capability.id),
    riskyCapabilitiesDisabled: Array.from(new Set(records.flatMap((record) => record.runtimeControl.riskyCapabilitiesDisabled))),
    adminOverrideRequiredFor: Array.from(new Set(records.flatMap((record) => record.runtimeControl.adminOverrideRequiredFor))),
    blockedCapabilityGateIds: blockedCapabilityGates.map((gate) => gate.id),
    requiredReviewGateIds: requiredReviewGates.map((gate) => gate.id),
    reviewedGateIds,
    blockedGateCountsByAction,
    exportEnabled: false,
    circulationEnabled: false,
    reviewedMemoryWriteEnabled: false,
    sourceClaimPromotionEnabled: false,
    sourceDataWriteEnabled: false,
    externalResearchIngestEnabled: false,
    continuousVoiceEnabled: false,
    runtimeEnabled: latestRuntimeControl?.runtimeEnabled ?? false,
    killSwitchActiveEver: records.some((record) => record.runtimeControl.killSwitchActive),
    runtimeBypassAllowed: false,
    allRiskyCapabilitiesDisabled: latestCapabilities.filter((capability) => capability.riskLevel !== 'low').every((capability) => !capability.enabled),
    riskyCapabilityPromotionProtocol,
    nextPromotionRequirements: uniqueStrings([
      ...disabledCapabilities.map((capability) => capability.blockedReason ?? `${capability.label} remains disabled by capability flag.`),
      ...blockedCapabilityGates.map((gate) => gate.reason),
      ...(latestRuntimeControl?.guardrails ?? [])
    ]).slice(0, 12),
    guardrails: [
      'Session capability readiness is a promotion checklist, not permission to enable risky capabilities.',
      'Blocked capability gates require governance or config changes; local review cannot approve them.',
      'Capability promotion must preserve evidence, memory, source, artifact, audit, and review rails.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'It reflects emitted prototype capability state and blocked gates, not enterprise authorization.',
      'Exports, circulation, memory writes, source writes, source promotion, external ingest, continuous voice, and runtime bypass remain disabled until governance clears.'
    ]
  };
}

export function buildSessionRuntimeControlSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionRuntimeControlSummary {
  const controls = (ledger.capabilityState ?? []).map((record) => record.runtimeControl);
  const latest = controls[controls.length - 1] ?? null;

  return {
    id: 'agent-session-runtime-control-v1',
    sessionId,
    mode: 'prototype_runtime_control_continuity',
    store: 'local_json',
    turnsWithRuntimeControl: controls.length,
    runtimePolicyIds: uniqueStrings(controls.map((control) => control.runtimePolicyId)) as AgentSessionRuntimeControlSummary['runtimePolicyIds'],
    runtimeModes: uniqueStrings(controls.map((control) => control.mode)) as AgentSessionRuntimeControlSummary['runtimeModes'],
    runtimeEnabledConsistent: controls.length > 0 && controls.every((control) => control.runtimeEnabled),
    killSwitchActiveEver: controls.some((control) => control.killSwitchActive),
    killSwitchActiveTurns: controls.filter((control) => control.killSwitchActive).length,
    degradedModeFallbacks: uniqueStrings(controls.map((control) => control.degradedModeFallback)) as AgentSessionRuntimeControlSummary['degradedModeFallbacks'],
    emergencyStopScopes: uniqueStrings(controls.flatMap((control) => control.emergencyStopScope)) as AgentSessionRuntimeControlSummary['emergencyStopScopes'],
    riskyCapabilitiesDisabled: uniqueStrings(controls.flatMap((control) => control.riskyCapabilitiesDisabled)) as AgentSessionRuntimeControlSummary['riskyCapabilitiesDisabled'],
    adminOverrideRequiredFor: uniqueStrings(controls.flatMap((control) => control.adminOverrideRequiredFor)) as AgentSessionRuntimeControlSummary['adminOverrideRequiredFor'],
    failClosedConsistent: controls.length > 0 && controls.every((control) => control.failClosedIfActivated),
    evidenceReviewBypassPrevented: controls.length > 0 && controls.every((control) => !control.canBypassEvidenceOrReview),
    latestRuntimeControl: latest
      ? {
          turnId: latest.turnId,
          runtimePolicyId: latest.runtimePolicyId,
          runtimeEnabled: latest.runtimeEnabled,
          killSwitchActive: latest.killSwitchActive,
          mode: latest.mode,
          degradedModeFallback: latest.degradedModeFallback,
          emergencyStopScope: latest.emergencyStopScope,
          riskyCapabilitiesDisabled: latest.riskyCapabilitiesDisabled,
          adminOverrideRequiredFor: latest.adminOverrideRequiredFor,
          failClosedIfActivated: true,
          canBypassEvidenceOrReview: false
        }
      : null,
    exportEnabled: false,
    sourceWriteEnabled: false,
    externalIngestEnabled: false,
    continuousVoiceEnabled: false,
    runtimeBypassAllowed: false,
    adminBypassEnabled: false,
    guardrails: [
      'Session runtime control summarizes fail-closed posture and kill-switch policy; it is not an enterprise operations console.',
      'Admin override requirements are surfaced as blockers and do not permit local bypass.',
      'Runtime control must not bypass evidence, memory, source, artifact, audit, or human-review rails.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Kill-switch state, admin override requirements, and emergency stop scope are prototype policy posture, not enterprise authorization.',
      'Exports, source writes, external ingest, continuous voice, runtime bypass, and admin bypass remain disabled until governance clears them.'
    ]
  };
}

export function buildSessionEvidenceSpotlightSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionEvidenceSpotlightSummary {
  const records = ledger.evidenceSpotlight ?? [];
  const latest = records[records.length - 1];
  const claims = records.flatMap((record) => record.claims);
  const claimTypeCounts = countsBy(claims.map((claim) => claim.claimType)).map(({ item, count }) => ({ claimType: item, count }));
  const supportedClaims = claims.filter((claim) => claim.supportStatus === 'supported_by_packet');
  const missingEvidenceClaims = claims.filter((claim) => claim.supportStatus === 'missing_evidence');
  const guardrailClaims = claims.filter((claim) => claim.supportStatus === 'guardrail');
  const reviewedContextClaims = claims.filter((claim) => claim.supportStatus === 'reviewed_working_context');

  return {
    id: 'agent-session-evidence-spotlight-v1',
    sessionId,
    mode: 'prototype_claim_evidence_continuity',
    store: 'local_json',
    turnsWithEvidenceSpotlight: records.length,
    claimStatusCounts: {
      supportedByPacket: supportedClaims.length,
      missingEvidence: missingEvidenceClaims.length,
      guardrail: guardrailClaims.length,
      reviewedWorkingContext: reviewedContextClaims.length,
      notEvidenceClaim: claims.filter((claim) => claim.supportStatus === 'not_evidence_claim').length
    },
    claimTypeCounts,
    supportedEvidenceLabels: uniqueStrings(supportedClaims.flatMap((claim) => claim.evidenceLabels)).slice(0, 16),
    missingEvidenceIds: uniqueStrings(missingEvidenceClaims.flatMap((claim) => claim.missingEvidenceIds)).slice(0, 16),
    sourceCandidateIds: uniqueStrings(claims.flatMap((claim) => claim.sourceCandidateIds)).slice(0, 16),
    guardrailClaims: guardrailClaims.map((claim) => claim.claim).slice(-8).reverse(),
    humanReviewRequiredClaimIds: uniqueStrings(claims.filter((claim) => claim.humanReviewRequired).map((claim) => claim.id)).slice(0, 16),
    latestClaims: (latest?.claims ?? []).slice(0, 10).map((claim) => ({
      id: claim.id,
      claimType: claim.claimType,
      claim: claim.claim,
      supportStatus: claim.supportStatus,
      evidenceLabels: claim.evidenceLabels,
      missingEvidenceIds: claim.missingEvidenceIds,
      guardrails: claim.guardrails,
      humanReviewRequired: claim.humanReviewRequired
    })),
    packetEvidenceAttached: supportedClaims.length > 0,
    missingEvidenceVisible: missingEvidenceClaims.length > 0,
    reviewedContextSeparated: reviewedContextClaims.every((claim) => claim.sourceCandidateIds.length > 0 || claim.humanReviewRequired),
    guardrailsVisible: claims.some((claim) => claim.guardrails.length > 0),
    canonicalClaimPromotionEnabled: false,
    unsupportedClaimGenerationEnabled: false,
    guardrails: [
      'Session evidence spotlight is a claim-to-proof audit, not a new source of truth.',
      'Missing evidence and reviewed working context must remain visible instead of being smoothed into supported claims.',
      'Source candidates and reviewed context cannot become canonical facts through this summary.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Supported claims reflect packet-backed prototype evidence labels, not causal proof or official approval.',
      'Claim promotion, unsupported claim generation, and canonical fact creation remain disabled.'
    ]
  };
}

export function buildSessionSourceGovernanceSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionSourceGovernanceSummary {
  const manifests = ledger.sourceGovernance ?? [];
  const latest = manifests[manifests.length - 1];
  const sourcePromotionCandidateIds = uniqueStrings(manifests.flatMap((manifest) => manifest.sourcePromotionCandidateIds));
  const sourceClaimCandidateIds = uniqueStrings(manifests.flatMap((manifest) => manifest.sourceClaimCandidateIds));
  const reviewedSourceClaims = manifests.reduce((total, manifest) => total + manifest.reviewedSourceClaimCount, 0);
  const unreviewedSourceClaims = manifests.reduce((total, manifest) => total + manifest.unreviewedSourceClaimCount, 0);
  const sourceClaimPromotionProtocol: AgentSessionSourceGovernanceSummary['sourceClaimPromotionProtocol'] = [
    {
      id: 'claim_extraction',
      label: 'Claim extraction candidate',
      status: sourceClaimCandidateIds.length > 0 ? 'prototype_ready' : 'blocked',
      requiredBefore: 'review_candidate',
      proof: sourceClaimCandidateIds.length > 0
        ? `${sourceClaimCandidateIds.length} source-claim candidates observed as local review context.`
        : 'No source-claim candidates have been observed in this session.',
      blockers: sourceClaimCandidateIds.length > 0 ? [] : ['source_claim_context_not_observed'],
      enablesCanonicalFact: false
    },
    {
      id: 'human_claim_review',
      label: 'Human claim review',
      status: reviewedSourceClaims > 0 ? 'prototype_ready' : sourceClaimCandidateIds.length > 0 ? 'blocked' : 'blocked',
      requiredBefore: 'reviewed_source_claim',
      proof: `${reviewedSourceClaims} reviewed claim observations and ${unreviewedSourceClaims} unreviewed claim observations in persisted source governance.`,
      blockers: reviewedSourceClaims > 0 ? [] : ['human_review_required'],
      enablesCanonicalFact: false
    },
    {
      id: 'source_owner_verification',
      label: 'Source-owner verification',
      status: 'blocked',
      requiredBefore: 'official_source_fact',
      proof: 'Reviewed-local claims are not source-owner-approved official facts.',
      blockers: ['source_owner_approval_not_connected', 'official_source_record_missing'],
      enablesCanonicalFact: false
    },
    {
      id: 'evidence_mapping',
      label: 'Packet evidence mapping',
      status: 'blocked',
      requiredBefore: 'packet_evidence',
      proof: 'Source claims can appear as reviewed context, but they are excluded from packet evidence labels and active answer evidence.',
      blockers: ['packet_evidence_mapping_not_approved', 'claim_to_packet_fact_promotion_disabled'],
      enablesCanonicalFact: false
    },
    {
      id: 'canonical_fact_governance',
      label: 'Canonical fact governance',
      status: 'blocked',
      requiredBefore: 'canonical_fact',
      proof: 'Canonical claim facts and source writes are disabled in the current prototype.',
      blockers: ['canonical_claim_fact_store_not_approved', 'source_data_write_capability_disabled'],
      enablesCanonicalFact: false
    },
    {
      id: 'runtime_evidence_wiring',
      label: 'Runtime evidence wiring',
      status: 'blocked',
      requiredBefore: 'runtime_auto_consumption',
      proof: 'Runtime source auto-consumption remains disabled, so reviewed claims cannot become automatic answer evidence.',
      blockers: ['runtime_source_auto_consumption_disabled', 'source_claim_promotion_capability_disabled'],
      enablesCanonicalFact: false
    }
  ];

  return {
    id: 'agent-session-source-governance-v1',
    sessionId,
    mode: 'prototype_reviewed_source_context',
    store: 'local_json',
    turnsWithSourceGovernance: manifests.length,
    sourcePromotionCandidates: {
      total: sourcePromotionCandidateIds.length,
      latestIds: sourcePromotionCandidateIds.slice(-8).reverse()
    },
    sourceClaimCandidates: {
      total: sourceClaimCandidateIds.length,
      reviewed: reviewedSourceClaims,
      unreviewed: unreviewedSourceClaims,
      latestIds: sourceClaimCandidateIds.slice(-8).reverse()
    },
    runtimeFileDrop: {
      latestStatus: latest?.runtimeFileDropStatus ?? 'not_available',
      latestAuditMode: latest?.runtimeFileDropAuditMode ?? 'not_available',
      latestCandidateFileCount: latest?.runtimeFileDropCandidateFileCount ?? 0,
      requiredKinds: latest?.requiredRuntimeFileKinds ?? [],
      loadedKinds: latest?.loadedRuntimeFileKinds ?? [],
      missingKinds: latest?.missingRuntimeFileKinds ?? []
    },
    strategicContextRuntimeFileDrop: {
      latestStatus: latest?.strategicContextRuntimeFileDropStatus ?? 'not_available',
      latestAuditMode: latest?.strategicContextRuntimeFileDropAuditMode ?? 'not_available',
      latestCandidateFileCount: latest?.strategicContextRuntimeFileDropCandidateFileCount ?? 0,
      requiredKinds: latest?.strategicContextRequiredRuntimeFileKinds ?? [],
      loadedKinds: latest?.strategicContextLoadedRuntimeFileKinds ?? [],
      missingKinds: latest?.strategicContextMissingRuntimeFileKinds ?? []
    },
    momentumSourceReadiness: {
      latestStatus: latest?.momentumSourceReadinessStatus ?? 'not_available',
      latestPath: latest?.momentumSourcePath ?? 'not_available',
      executiveCanonicalUseReady: latest?.momentumCanonicalForExecutiveUse ?? false
    },
    blockedSourceGovernancePaths: uniqueStrings(manifests.flatMap((manifest) => manifest.blockers)).slice(0, 12),
    nextSourceGovernanceSteps: uniqueStrings(manifests.map((manifest) => manifest.nextSourceGovernanceStep)).slice(-8).reverse(),
    sourceClaimPromotionProtocol,
    canonicalSourceWritesEnabled: false,
    canonicalClaimFactsEnabled: false,
    runtimeSourceAutoConsumptionEnabled: false,
    runtimeFileDropConsumptionEnabled: false,
    runtimeFileDropCanonicalUseEnabled: false,
    sourceClaimPromotionEnabled: false,
    sourceDataWriteEnabled: false,
    guardrails: [
      'Session source governance is a reviewed working-context summary, not canonical source truth.',
      'Source promotions and claims remain local review candidates until enterprise governance enables canonical writes.',
      'Runtime file-drop audits can report readiness, but files are not consumed into answers automatically.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Reviewed candidates may guide prototype discussion, but they are not official source records or approved facts.',
      'Canonical source writes, claim facts, runtime auto-consumption, and source-data writes are disabled.'
    ]
  };
}

export function buildSessionSourceRuntimeIngestionSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionSourceRuntimeIngestionSummary {
  const manifests = ledger.sourceGovernance ?? [];
  const latest = manifests[manifests.length - 1];
  const requiredFileKinds = uniqueStrings(manifests.flatMap((manifest) => manifest.requiredRuntimeFileKinds));
  const loadedFileKinds = uniqueStrings(manifests.flatMap((manifest) => manifest.loadedRuntimeFileKinds));
  const strategicContextRequiredFileKinds = uniqueStrings(manifests.flatMap((manifest) => manifest.strategicContextRequiredRuntimeFileKinds));
  const strategicContextLoadedFileKinds = uniqueStrings(manifests.flatMap((manifest) => manifest.strategicContextLoadedRuntimeFileKinds));
  const latestRequiredFileKinds = latest?.requiredRuntimeFileKinds ?? requiredFileKinds;
  const latestLoadedFileKinds = latest?.loadedRuntimeFileKinds ?? loadedFileKinds;
  const latestStrategicContextRequiredFileKinds = latest?.strategicContextRequiredRuntimeFileKinds ?? strategicContextRequiredFileKinds;
  const latestStrategicContextLoadedFileKinds = latest?.strategicContextLoadedRuntimeFileKinds ?? strategicContextLoadedFileKinds;
  const missingFileKinds = latest
    ? latest.missingRuntimeFileKinds
    : latestRequiredFileKinds.filter((fileKind) => !latestLoadedFileKinds.includes(fileKind));
  const strategicContextMissingFileKinds = latest
    ? latest.strategicContextMissingRuntimeFileKinds
    : latestStrategicContextRequiredFileKinds.filter((fileKind) => !latestStrategicContextLoadedFileKinds.includes(fileKind));
  const allRequiredFilesPresent = latestRequiredFileKinds.length > 0 && missingFileKinds.length === 0;
  const allStrategicContextRequiredFilesPresent = latestStrategicContextRequiredFileKinds.length > 0 && strategicContextMissingFileKinds.length === 0;
  const readyForGovernanceReview = allRequiredFilesPresent && (
    latest?.runtimeFileDropStatus === 'ready_for_governance_review' ||
    latest?.runtimeFileDropStatus === 'ready'
  );
  const strategicContextReadyForGovernanceReview = allStrategicContextRequiredFilesPresent && (
    latest?.strategicContextRuntimeFileDropStatus === 'ready_for_governance_review' ||
    latest?.strategicContextRuntimeFileDropStatus === 'ready'
  );
  const sourceOwnerFileCoverageStatus: AgentSessionSourceRuntimeIngestionSummary['sourceOwnerFileCoverageStatus'] =
    !latest ? 'not_observed' : readyForGovernanceReview ? 'ready_for_governance_review' : 'missing_required_files';
  const strategicContextSourceOwnerFileCoverageStatus: AgentSessionSourceRuntimeIngestionSummary['strategicContextSourceOwnerFileCoverageStatus'] =
    !latest ? 'not_observed' : strategicContextReadyForGovernanceReview ? 'ready_for_governance_review' : 'missing_required_files';
  const governanceBlockers = uniqueStrings([
    ...manifests.flatMap((manifest) => manifest.blockers),
    latest?.momentumCanonicalForExecutiveUse ? '' : 'Momentum source readiness is not approved for executive canonical use.',
    readyForGovernanceReview ? '' : 'Required source-owner runtime files are not all present and clean for governance review.',
    strategicContextReadyForGovernanceReview ? '' : 'Required Brand Strategic Context source-owner runtime files are not all present and clean for governance review.',
    'Runtime source auto-consumption remains disabled by policy.',
    'Runtime file-drop consumption remains disabled by policy.',
    'Runtime file-drop canonical use remains disabled by policy.',
    'Canonical source writes and source-data writes remain disabled.'
  ]).slice(0, 14);
  const protocolItem = (
    id: AgentSessionSourceRuntimeIngestionSummary['defaultRuntimeSourcePromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionSourceRuntimeIngestionSummary['defaultRuntimeSourcePromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionSourceRuntimeIngestionSummary['defaultRuntimeSourcePromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionSourceRuntimeIngestionSummary['defaultRuntimeSourcePromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesRuntimeConsumption: false
  });
  const defaultRuntimeSourcePromotionProtocol: AgentSessionSourceRuntimeIngestionSummary['defaultRuntimeSourcePromotionProtocol'] = [
    protocolItem(
      'momentum_file_coverage',
      'Momentum source-owner file coverage',
      readyForGovernanceReview ? 'ready_for_governance_review' : 'blocked',
      'source_owner_governance_review',
      `${latestLoadedFileKinds.length}/${latestRequiredFileKinds.length} required Momentum file kinds observed for review.`,
      readyForGovernanceReview
        ? ['Observed files are review-ready only and are not runtime evidence.']
        : ['Required Momentum source-owner runtime files are missing or blocked by audit issues.']
    ),
    protocolItem(
      'strategic_context_file_coverage',
      'Brand Strategic Context source-owner file coverage',
      strategicContextReadyForGovernanceReview ? 'ready_for_governance_review' : 'blocked',
      'source_owner_governance_review',
      `${latestStrategicContextLoadedFileKinds.length}/${latestStrategicContextRequiredFileKinds.length} required strategy file kinds observed for review.`,
      strategicContextReadyForGovernanceReview
        ? ['Observed Brand Strategic Context files are review-ready only and are not canonical brand strategy.']
        : ['Required Brand Strategic Context source-owner runtime files are missing or blocked by audit issues.']
    ),
    protocolItem(
      'source_owner_approval',
      'Source-owner governance review',
      readyForGovernanceReview && strategicContextReadyForGovernanceReview ? 'prototype_ready' : 'blocked',
      'canonical_runtime_consumption',
      readyForGovernanceReview && strategicContextReadyForGovernanceReview
        ? 'Both source lanes have complete file-kind coverage for governance review.'
        : 'Source-owner governance review cannot start until both source lanes have complete, clean file-kind coverage.',
      readyForGovernanceReview && strategicContextReadyForGovernanceReview
        ? ['Governance review is still a human handoff and does not enable canonical use.']
        : ['Momentum and Brand Strategic Context source-owner file coverage must both be complete before governance review.']
    ),
    protocolItem(
      'canonical_use_governance',
      'Canonical-use governance',
      'blocked',
      'default_runtime_source_wiring',
      'Canonical runtime source consumption remains disabled by policy.',
      ['Canonical-use governance has not approved runtime consumption for source-owner file drops.']
    ),
    protocolItem(
      'persistence_readiness',
      'Enterprise persistence readiness',
      'blocked',
      'enterprise_persistence_clearance',
      'Persistence readiness still blocks canonical source promotion, identity/access, retention/privacy, and backup/recovery.',
      ['Enterprise persistence requirements are not cleared for canonical source promotion.']
    ),
    protocolItem(
      'default_runtime_wiring',
      'Default runtime source-path wiring',
      'blocked',
      'default_runtime_source_wiring',
      'Default runtime source wiring remains disabled even when file drops are observed for governance review.',
      ['Runtime source auto-consumption, file-drop consumption, canonical source writes, and source-data writes remain disabled.']
    )
  ];

  return {
    id: 'agent-session-source-runtime-ingestion-v1',
    sessionId,
    mode: 'prototype_runtime_source_ingestion_gate',
    store: 'local_json',
    turnsWithSourceGovernance: manifests.length,
    latestRuntimeFileDropStatus: latest?.runtimeFileDropStatus ?? 'not_available',
    latestAuditMode: latest?.runtimeFileDropAuditMode ?? 'not_available',
    sourceDirectorySeen: latest?.runtimeFileDropSourceDirectoryExists ?? false,
    candidateFileCount: latest?.runtimeFileDropCandidateFileCount ?? 0,
    requiredFileKinds: latestRequiredFileKinds,
    loadedFileKinds: latestLoadedFileKinds,
    missingFileKinds,
    fileKindReadiness: latestRequiredFileKinds.map((fileKind) => ({
      fileKind,
      status: latestLoadedFileKinds.includes(fileKind) ? 'loaded_for_review' : 'missing'
    })),
    sourceOwnerFileCoverageStatus,
    latestMomentumSourceReadinessStatus: latest?.momentumSourceReadinessStatus ?? 'not_available',
    latestMomentumSourcePath: latest?.momentumSourcePath ?? 'not_available',
    executiveCanonicalUseReady: latest?.momentumCanonicalForExecutiveUse ?? false,
    strategicContextLatestRuntimeFileDropStatus: latest?.strategicContextRuntimeFileDropStatus ?? 'not_available',
    strategicContextLatestAuditMode: latest?.strategicContextRuntimeFileDropAuditMode ?? 'not_available',
    strategicContextSourceDirectorySeen: latest?.strategicContextRuntimeFileDropSourceDirectoryExists ?? false,
    strategicContextCandidateFileCount: latest?.strategicContextRuntimeFileDropCandidateFileCount ?? 0,
    strategicContextRequiredFileKinds: latestStrategicContextRequiredFileKinds,
    strategicContextLoadedFileKinds: latestStrategicContextLoadedFileKinds,
    strategicContextMissingFileKinds,
    strategicContextFileKindReadiness: latestStrategicContextRequiredFileKinds.map((fileKind) => ({
      fileKind,
      status: latestStrategicContextLoadedFileKinds.includes(fileKind) ? 'loaded_for_review' : 'missing'
    })),
    strategicContextSourceOwnerFileCoverageStatus,
    strategicContextReadyForGovernanceReview,
    allRequiredFilesPresent,
    readyForGovernanceReview,
    readyToWireDefaultRuntimeSource: false,
    defaultRuntimeConsumptionEnabled: false,
    canonicalUseEnabled: false,
    canonicalSourceWritesEnabled: false,
    runtimeSourceAutoConsumptionEnabled: false,
    runtimeFileDropConsumptionEnabled: false,
    runtimeFileDropCanonicalUseEnabled: false,
    sourceDataWriteEnabled: false,
    defaultRuntimeSourcePromotionProtocol,
    governanceBlockers,
    nextIngestionStep: readyForGovernanceReview
      ? 'Review source-owner approvals, canonical-use governance, persistence readiness, and source-write policy before any default runtime source-path wiring.'
      : latest
        ? 'Load the missing approved source-owner files and clear source-owner review issues before requesting canonical-use governance.'
        : 'Run a governed source-readiness or agent turn to capture the runtime file-drop audit before considering source ingestion.',
    guardrails: [
      'This summary is an ingestion gate, not a runtime source loader.',
      'Momentum and Brand Strategic Context source-owner files may be audited for presence, but they cannot become answer evidence or canonical facts through this summary.',
      'Default runtime source-path wiring requires explicit source-owner approval, canonical-use governance, persistence readiness, and capability approval.'
    ],
    caveats: [
      'This summary is computed from local JSON/browser session source-governance manifests.',
      'Ready for governance review means required files were observed; it does not enable runtime consumption.',
      'Canonical source writes, runtime source auto-consumption, file-drop consumption, and source-data writes remain disabled.'
    ]
  };
}

export function buildSessionRuntimeSurfaceSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionRuntimeSurfaceSummary {
  const manifests = ledger.runtimeSurface ?? [];
  const latest = manifests[manifests.length - 1];
  const surfaceCounts = new Map<string, AgentSessionRuntimeSurfaceSummary['activeSurfaces'][number]>();
  const surfaceGuardrails = new Map<string, AgentSessionRuntimeSurfaceSummary['surfaceGuardrailMatrix'][number]>();
  for (const manifest of manifests) {
    const existing = surfaceCounts.get(manifest.activeSurfaceId);
    surfaceCounts.set(manifest.activeSurfaceId, {
      surfaceId: manifest.activeSurfaceId,
      surfaceName: manifest.activeSurfaceName,
      surfaceType: manifest.activeSurfaceType,
      status: manifest.activeSurfaceStatus,
      count: (existing?.count ?? 0) + 1
    });
    const existingGuardrail = surfaceGuardrails.get(manifest.activeSurfaceId);
    const usesGovernedRuntime = (existingGuardrail?.usesGovernedRuntime ?? true) && manifest.usesGovernedRuntime;
    const defaultScopedChatPreserved = (existingGuardrail?.defaultScopedChatPreserved ?? true) && manifest.defaultScopedChatPreserved;
    surfaceGuardrails.set(manifest.activeSurfaceId, {
      surfaceId: manifest.activeSurfaceId,
      surfaceName: manifest.activeSurfaceName,
      status: manifest.activeSurfaceStatus,
      turns: (existingGuardrail?.turns ?? 0) + 1,
      runtimePath: manifest.activeRuntimePath,
      proofSurface: manifest.activeProofSurface,
      usesGovernedRuntime,
      defaultScopedChatPreserved,
      proofRequired: true,
      fullVoiceEnabled: false,
      realtimeVoiceEnabled: false,
      ttsEnabled: false,
      continuousVoiceEnabled: false,
      exportRuntimeEnabled: false,
      sourceWriteRuntimeEnabled: false,
      guardrailStatus: usesGovernedRuntime && defaultScopedChatPreserved ? 'pass' : 'watch'
    });
  }
  const surfaceGuardrailMatrix = Array.from(surfaceGuardrails.values())
    .sort((a, b) => b.turns - a.turns || a.surfaceId.localeCompare(b.surfaceId));
  const observedReadySurface = manifests.some((manifest) => manifest.activeSurfaceStatus === 'ready');
  const observedOptInSurface = manifests.some((manifest) => manifest.activeSurfaceStatus === 'ready_opt_in');
  const guardedSurfaceUse = surfaceGuardrailMatrix.length > 0 && surfaceGuardrailMatrix.every((surface) => surface.guardrailStatus === 'pass');
  const defaultScopedChatPreserved = manifests.every((manifest) => manifest.defaultScopedChatPreserved);
  const governedRuntimeOnly = manifests.every((manifest) => manifest.usesGovernedRuntime);
  const protocolItem = (
    item: Omit<AgentSessionRuntimeSurfaceSummary['runtimeSurfacePromotionProtocol'][number], 'enablesSurfacePromotion'>
  ): AgentSessionRuntimeSurfaceSummary['runtimeSurfacePromotionProtocol'][number] => ({
    ...item,
    enablesSurfacePromotion: false
  });

  return {
    id: 'agent-session-runtime-surface-v1',
    sessionId,
    mode: 'prototype_governed_runtime_surface_usage',
    store: 'local_json',
    turnsWithRuntimeSurface: manifests.length,
    activeSurfaces: Array.from(surfaceCounts.values()).sort((a, b) => b.count - a.count || a.surfaceId.localeCompare(b.surfaceId)),
    usedSurfaceIds: uniqueStrings(manifests.map((manifest) => manifest.activeSurfaceId)),
    usedReadySurfaceIds: uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'ready').map((manifest) => manifest.activeSurfaceId)),
    usedOptInSurfaceIds: uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'ready_opt_in').map((manifest) => manifest.activeSurfaceId)),
    usedLegacySurfaceIds: uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'legacy_stable').map((manifest) => manifest.activeSurfaceId)),
    usedGatedSurfaceIds: uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'gated').map((manifest) => manifest.activeSurfaceId)),
    usedDisabledSurfaceIds: uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'disabled').map((manifest) => manifest.activeSurfaceId)),
    latestSurface: latest ? {
      surfaceId: latest.activeSurfaceId,
      surfaceName: latest.activeSurfaceName,
      surfaceType: latest.activeSurfaceType,
      status: latest.activeSurfaceStatus,
      runtimePath: latest.activeRuntimePath,
      proofSurface: latest.activeProofSurface,
      persistence: latest.activePersistence,
      streaming: latest.activeStreaming,
      voice: latest.activeVoice
    } : null,
    streamingTurns: manifests.filter((manifest) => manifest.activeStreaming).length,
    voiceTurns: manifests.filter((manifest) => manifest.activeVoice !== 'none' && manifest.activeVoice !== 'tts_disabled').length,
    pushToTalkTurns: manifests.filter((manifest) => manifest.activeVoice === 'push_to_talk_browser_stt').length,
    gatedOrDisabledSurfaceAttempts: manifests.filter((manifest) => manifest.isGated || manifest.isDisabled).length,
    surfaceGuardrailMatrix,
    allUsedSurfacesGuarded: surfaceGuardrailMatrix.every((surface) => surface.guardrailStatus === 'pass'),
    defaultScopedChatPreserved,
    governedRuntimeOnly,
    fullVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    continuousVoiceEnabled: false,
    exportRuntimeEnabled: false,
    sourceWriteRuntimeEnabled: false,
    runtimeSurfacePromotionProtocol: [
      protocolItem({
        id: 'surface_observation',
        label: 'Observed governed surface turns',
        status: manifests.length > 0 && guardedSurfaceUse ? 'ready' : 'blocked',
        requiredBefore: 'prototype_surface_review',
        proof: `${manifests.length} runtime-surface turns observed; ${surfaceGuardrailMatrix.length} surfaces appear in the guardrail matrix.`,
        blockers: manifests.length > 0 ? [] : ['no_runtime_surface_turns_observed']
      }),
      protocolItem({
        id: 'opt_in_surface_review',
        label: 'Opt-in surface review',
        status: observedOptInSurface && guardedSurfaceUse ? 'ready_for_review' : 'blocked',
        requiredBefore: 'opt_in_rollout',
        proof: `${uniqueStrings(manifests.filter((manifest) => manifest.activeSurfaceStatus === 'ready_opt_in').map((manifest) => manifest.activeSurfaceId)).length} opt-in surfaces observed with governed proof rails.`,
        blockers: observedOptInSurface ? [] : ['no_opt_in_surface_observed']
      }),
      protocolItem({
        id: 'default_surface_promotion',
        label: 'Default surface promotion',
        status: observedReadySurface && defaultScopedChatPreserved && governedRuntimeOnly ? 'ready_for_review' : 'blocked',
        requiredBefore: 'default_surface_promotion',
        proof: defaultScopedChatPreserved
          ? 'Default scoped chat preservation is tracked while governed ready surfaces are observed.'
          : 'Default scoped chat preservation is incomplete.',
        blockers: [
          ...(!observedReadySurface ? ['no_ready_surface_observed'] : []),
          ...(!defaultScopedChatPreserved ? ['default_scoped_chat_not_preserved'] : []),
          ...(!governedRuntimeOnly ? ['non_governed_runtime_observed'] : [])
        ]
      }),
      protocolItem({
        id: 'voice_provider_runtime_governance',
        label: 'Voice/provider runtime governance',
        status: manifests.some((manifest) => manifest.activeVoice === 'push_to_talk_browser_stt') ? 'ready_for_review' : 'blocked',
        requiredBefore: 'voice_provider_activation',
        proof: `${manifests.filter((manifest) => manifest.activeVoice === 'push_to_talk_browser_stt').length} push-to-talk turns observed; Realtime, continuous voice, TTS, and provider bypass remain disabled or gated.`,
        blockers: ['realtime_runtime_governance_required', 'tts_policy_required', 'continuous_voice_consent_required']
      }),
      protocolItem({
        id: 'export_source_write_governance',
        label: 'Export/source-write runtime governance',
        status: 'blocked',
        requiredBefore: 'export_or_source_write_runtime',
        proof: 'Export runtime and source-write runtime remain disabled for every observed surface.',
        blockers: ['artifact_export_capability_not_approved', 'source_write_governance_not_approved']
      }),
      protocolItem({
        id: 'production_surface_certification',
        label: 'Production surface certification',
        status: 'blocked',
        requiredBefore: 'production_certification',
        proof: 'Runtime-surface summaries are local prototype proof rails and do not certify production readiness.',
        blockers: ['enterprise_identity_required', 'enterprise_persistence_required', 'security_privacy_review_required', 'production_slo_monitoring_required']
      })
    ],
    nextRuntimeSurfaceSteps: uniqueStrings(manifests.map((manifest) => manifest.nextSurfaceStep)).slice(-8).reverse(),
    guardrails: [
      'Session runtime surface usage is an audit summary, not permission to activate new surfaces.',
      'Scoped default chat must remain preserved while governed surfaces move through opt-in readiness.',
      'Realtime voice, continuous voice, TTS, exports, source writes, and canonical promotion require explicit governance before activation.',
      'The surface guardrail matrix summarizes observed turns only; unobserved surfaces still require their own checks before promotion.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'It records which governed surfaces produced turns; it does not certify production readiness.',
      'Gated and disabled surfaces remain blocked even if their identifiers appear in registry readiness sets.'
    ]
  };
}

export function buildSessionExperienceArchitectureSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionExperienceArchitectureSummary {
  const manifests = ledger.experienceArchitecture ?? [];
  const latest = manifests[manifests.length - 1];
  const templateCounts = countsBy(manifests.map((manifest) => manifest.activeTemplateId).filter((templateId): templateId is string => Boolean(templateId)));
  const audienceCounts = countsBy(manifests.map((manifest) => manifest.activeAudience).filter((audience): audience is NonNullable<typeof audience> => Boolean(audience)));
  const objectiveCounts = countsBy(manifests.map((manifest) => manifest.activeObjective).filter((objective): objective is NonNullable<typeof objective> => Boolean(objective)));
  const layoutCounts = countsBy(manifests.map((manifest) => manifest.activeLayout));

  return {
    id: 'agent-session-experience-architecture-v1',
    sessionId,
    mode: 'prototype_approved_experience_composition_usage',
    store: 'local_json',
    turnsWithExperienceArchitecture: manifests.length,
    approvedRegistrySnapshot: {
      latestTemplateCount: latest?.approvedTemplateCount ?? 0,
      latestSkillCount: latest?.approvedSkillCount ?? 0,
      latestViewCount: latest?.approvedViewCount ?? 0
    },
    activeTemplates: templateCounts.map(({ item, count }) => ({ templateId: item, count })),
    activeAudiences: audienceCounts.map(({ item, count }) => ({ audience: item, count })),
    activeObjectives: objectiveCounts.map(({ item, count }) => ({ objective: item, count })),
    activeLayouts: layoutCounts.map(({ item, count }) => ({ layout: item, count })),
    renderedViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.renderedViewIds)),
    fallbackViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.fallbackViewIds)),
    unknownViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.unknownViewIds)),
    artifactTypes: Array.from(new Set(manifests.flatMap((manifest) => manifest.artifactTypes))),
    compositionBlockers: uniqueStrings(manifests.flatMap((manifest) => manifest.compositionBlockers)).slice(0, 12),
    nextCompositionSteps: uniqueStrings(manifests.map((manifest) => manifest.nextCompositionStep)).slice(-8).reverse(),
    humanReviewRequired: manifests.some((manifest) => manifest.humanReviewRequired),
    dynamicUiGenerationEnabled: false,
    arbitraryViewIdsAllowed: false,
    unsupportedMetricGenerationEnabled: false,
    newSourceClaimGenerationEnabled: false,
    guardrails: [
      'Session experience architecture is an approved-composition audit, not arbitrary UI generation.',
      'Dynamic workspaces must use registered templates, skills, and view IDs.',
      'Unsupported metrics and new source claims remain blocked until governance and source ownership approve them.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'It records which governed workspaces were composed; it does not certify production readiness.',
      'Fallback views and blockers are prompts for review, not permission to generate unregistered UI.'
    ]
  };
}

const executivePilotSequenceSteps: Array<{
  id: AgentSessionExecutivePilotSummary['steps'][number]['id'];
  label: string;
  expectedSkillId: string;
  expectedTemplateId: string;
  expectedViewIds: string[];
}> = [
  {
    id: 'sponsor_runbook',
    label: 'Sponsor Runbook',
    expectedSkillId: 'plan_executive_pilot',
    expectedTemplateId: 'executive-pilot-runbook',
    expectedViewIds: [
      'executive_pilot_runbook_panel',
      'momentum_ladder',
      'foundation_readiness_panel',
      'promotion_gate_panel',
      'canvas_continuity_panel',
      'source_runtime_ingestion_panel',
      'evidence_spotlight_panel',
      'runtime_governance_panel',
      'capability_readiness_panel',
      'runtime_quality_panel',
      'provider_adapter_panel',
      'review_workflow_panel',
      'memory_audit_panel',
      'audit_trail_panel',
      'review_identity_panel'
    ]
  },
  {
    id: 'brand_read',
    label: 'Brand Read',
    expectedSkillId: 'bbe_momentum_intelligence_read',
    expectedTemplateId: 'executive-qbr-decision-read',
    expectedViewIds: ['momentum_ladder', 'evidence_ledger', 'evidence_spotlight_panel', 'data_gap_panel']
  },
  {
    id: 'workspace_foundation',
    label: 'Workspace Foundation',
    expectedSkillId: 'inspect_experience_architecture',
    expectedTemplateId: 'experience-architecture-cockpit',
    expectedViewIds: ['experience_architecture_panel', 'canvas_continuity_panel', 'runtime_governance_panel', 'runtime_quality_panel', 'review_workflow_panel']
  },
  {
    id: 'foundation_control',
    label: 'Foundation Control',
    expectedSkillId: 'inspect_foundation_readiness',
    expectedTemplateId: 'foundation-readiness-cockpit',
    expectedViewIds: ['foundation_readiness_panel', 'promotion_gate_panel', 'experience_architecture_panel', 'canvas_continuity_panel', 'runtime_governance_panel', 'capability_readiness_panel', 'runtime_quality_panel', 'provider_adapter_panel', 'evidence_spotlight_panel', 'source_runtime_ingestion_panel', 'review_workflow_panel', 'memory_audit_panel', 'audit_trail_panel', 'review_identity_panel']
  },
  {
    id: 'runtime_and_voice',
    label: 'Runtime And Voice',
    expectedSkillId: 'inspect_runtime_governance',
    expectedTemplateId: 'runtime-governance-cockpit',
    expectedViewIds: ['runtime_governance_panel', 'capability_readiness_panel', 'provider_adapter_panel', 'voice_readiness_panel', 'runtime_quality_panel', 'review_workflow_panel']
  },
  {
    id: 'review_gates',
    label: 'Review Gates',
    expectedSkillId: 'review_session_state',
    expectedTemplateId: 'review-operations-cockpit',
    expectedViewIds: ['review_workflow_panel', 'memory_audit_panel', 'audit_trail_panel', 'review_identity_panel', 'evidence_ledger', 'evidence_spotlight_panel', 'data_gap_panel']
  }
];

export function buildSessionExecutivePilotSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionExecutivePilotSummary {
  const manifests = ledger.experienceArchitecture ?? [];
  const turnOrder = new Map(ledger.turnIds.map((turnId, index) => [turnId, index]));
  const steps = executivePilotSequenceSteps.map((step) => {
    const matchingManifests = manifests.filter((manifest) => (
      manifest.activeTemplateId === step.expectedTemplateId &&
      step.expectedViewIds.every((viewId) => manifest.renderedViewIds.includes(viewId))
    ));
    const latest = matchingManifests
      .slice()
      .sort((left, right) => (turnOrder.get(left.turnId) ?? -1) - (turnOrder.get(right.turnId) ?? -1))
      .at(-1);
    const renderedExpectedViews = latest
      ? step.expectedViewIds.filter((viewId) => latest.renderedViewIds.includes(viewId))
      : [];

    return {
      id: step.id,
      label: step.label,
      expectedSkillId: step.expectedSkillId,
      expectedTemplateId: step.expectedTemplateId,
      expectedViewIds: step.expectedViewIds,
      completed: Boolean(latest),
      turnCount: matchingManifests.length,
      latestTurnId: latest?.turnId ?? null,
      latestBrandName: latest?.brandName ?? null,
      renderedExpectedViews,
      missingExpectedViews: step.expectedViewIds.filter((viewId) => !renderedExpectedViews.includes(viewId))
    };
  });
  const completedSteps = steps.filter((step) => step.completed);
  const lastCompletedStep = completedSteps
    .slice()
    .sort((left, right) => (turnOrder.get(left.latestTurnId ?? '') ?? -1) - (turnOrder.get(right.latestTurnId ?? '') ?? -1))
    .at(-1);
  const missingSteps = steps.filter((step) => !step.completed).map((step) => step.id);
  const nextStep = steps.find((step) => !step.completed);
  const requiredViewIds = uniqueStrings(executivePilotSequenceSteps.flatMap((step) => step.expectedViewIds));
  const observedViewIds = uniqueStrings(manifests.flatMap((manifest) => manifest.renderedViewIds)).filter((viewId) => requiredViewIds.includes(viewId));
  const hasViews = (viewIds: string[]) => viewIds.every((viewId) => observedViewIds.includes(viewId));
  const sourceGovernanceTurns = ledger.sourceGovernance.length;
  const runtimeSurfaceTurns = ledger.runtimeSurface.length;
  const runtimeSurfaceGuarded = ledger.runtimeSurface.length > 0 && ledger.runtimeSurface.every((manifest) => (
    manifest.usesGovernedRuntime &&
    manifest.defaultScopedChatPreserved &&
    !manifest.fullVoiceEnabled &&
    !manifest.ttsEnabled
  ));
  const proofRailTurns = Math.max(ledger.evidenceSpotlight.length, ledger.audit.length, ledger.runtimeQuality.length);
  const reviewIdentityReady = ledger.reviewIdentity.some((manifest) => manifest.officialApprovalBlocked);
  const voicePathObserved = ledger.voiceRuntime.length > 0 || ledger.providerAdapter.length > 0 || ledger.voiceReadiness.length > 0;
  const voiceFullBlocked = ledger.voiceReadiness.every((manifest) => (
    !manifest.realtimeVoiceEnabled &&
    !manifest.ttsEnabled &&
    !manifest.continuousVoiceEnabled
  ));
  const demoEvidenceStack: AgentSessionExecutivePilotSummary['demoEvidenceStack'] = [
    {
      id: 'brand_read',
      label: 'Brand read with evidence',
      status: hasViews(['momentum_ladder', 'evidence_spotlight_panel']) ? 'ready' : 'blocked',
      proof: hasViews(['momentum_ladder', 'evidence_spotlight_panel'])
        ? 'Momentum, evidence spotlight, and gap views have rendered in the guided pilot path.'
        : 'Run the brand read or sponsor runbook step to render the momentum and evidence proof views.',
      relatedViewIds: ['momentum_ladder', 'evidence_spotlight_panel', 'data_gap_panel'],
      blockers: hasViews(['momentum_ladder', 'evidence_spotlight_panel']) ? [] : ['brand_read_step_not_completed']
    },
    {
      id: 'experience_plan_composition',
      label: 'Governed ExperiencePlan composition',
      status: hasViews(['executive_pilot_runbook_panel', 'canvas_continuity_panel']) ? 'ready' : 'blocked',
      proof: `${completedSteps.length}/${steps.length} guided steps completed with ${observedViewIds.length}/${requiredViewIds.length} required views observed.`,
      relatedViewIds: ['executive_pilot_runbook_panel', 'canvas_continuity_panel', 'experience_architecture_panel'],
      blockers: hasViews(['executive_pilot_runbook_panel', 'canvas_continuity_panel']) ? [] : ['runbook_or_canvas_continuity_not_observed']
    },
    {
      id: 'proof_and_audit_rails',
      label: 'Proof, audit, and review rails',
      status: proofRailTurns > 0 && reviewIdentityReady ? 'ready' : 'prototype_ready',
      proof: `${ledger.evidenceSpotlight.length} evidence spotlight records, ${ledger.audit.length} audit records, and ${ledger.runtimeQuality.length} runtime quality records persisted.`,
      relatedViewIds: ['evidence_spotlight_panel', 'audit_trail_panel', 'review_identity_panel', 'runtime_quality_panel'],
      blockers: reviewIdentityReady ? [] : ['prototype_review_identity_not_observed']
    },
    {
      id: 'runtime_surface_parity',
      label: 'Governed runtime surface parity',
      status: runtimeSurfaceGuarded ? 'ready' : runtimeSurfaceTurns > 0 ? 'prototype_ready' : 'blocked',
      proof: `${runtimeSurfaceTurns} governed surface turns observed; scoped default chat preservation and disabled voice/export/source-write posture are tracked.`,
      relatedViewIds: ['runtime_governance_panel', 'capability_readiness_panel', 'provider_adapter_panel'],
      blockers: runtimeSurfaceGuarded ? [] : ['runtime_surface_guardrail_matrix_incomplete']
    },
    {
      id: 'source_governance',
      label: 'Source-owner governance gates',
      status: sourceGovernanceTurns > 0 ? 'prototype_ready' : 'blocked',
      proof: `${sourceGovernanceTurns} source governance turns observed; source files, claims, and promotions remain review-only and non-canonical.`,
      relatedViewIds: ['source_runtime_ingestion_panel', 'source_promotion_readiness_panel', 'persistence_readiness_panel'],
      blockers: sourceGovernanceTurns > 0 ? ['canonical_source_use_not_approved'] : ['source_governance_not_observed']
    },
    {
      id: 'voice_path',
      label: 'Voice path without autonomous speaking',
      status: voicePathObserved && voiceFullBlocked ? 'prototype_ready' : 'blocked',
      proof: voicePathObserved
        ? 'Push-to-talk, stream, provider adapter, and voice orchestration gates are visible while Realtime, TTS, and continuous voice remain gated.'
        : 'Run voice readiness or runtime governance to observe the provider and voice orchestration gates.',
      relatedViewIds: ['voice_readiness_panel', 'provider_adapter_panel', 'runtime_governance_panel'],
      blockers: voicePathObserved && voiceFullBlocked ? ['full_voice_policy_not_approved'] : ['voice_readiness_not_observed']
    }
  ];
  const fundingAsks: AgentSessionExecutivePilotSummary['fundingAsks'] = [
    {
      id: 'source_owner_handoff',
      label: 'Source-owner handoff and approved files',
      priority: 'now',
      rationale: 'Move from prototype-reviewed inputs to approved Brand Strategic Context and Momentum source-owner files without weakening source governance.',
      gatedUntil: ['approved_source_owner_files', 'canonical_use_governance', 'source_data_write_policy'],
      enabledInPrototype: false
    },
    {
      id: 'enterprise_persistence_identity',
      label: 'Enterprise persistence and reviewer identity',
      priority: 'now',
      rationale: 'Turn local JSON/session review proof into enterprise-grade memory, audit, retention, access, and official reviewer controls.',
      gatedUntil: ['database_schema', 'identity_access_control', 'retention_privacy_review', 'backup_recovery_plan'],
      enabledInPrototype: false
    },
    {
      id: 'artifact_language_export_policy',
      label: 'Artifact language and export governance',
      priority: 'next',
      rationale: 'Make QBR stories, evidence packets, meeting notes, and agency briefs safely shareable after stakeholder language review.',
      gatedUntil: ['stakeholder_language_approval', 'circulation_policy', 'artifact_export_capability'],
      enabledInPrototype: false
    },
    {
      id: 'voice_policy_provider_runtime',
      label: 'Voice provider runtime and interruption policy',
      priority: 'next',
      rationale: 'Graduate from governed push-to-talk/stream proof to a real voice-first experience only after Realtime, TTS, consent, cancellation, and storage gates clear.',
      gatedUntil: ['realtime_runtime_parity', 'tts_policy', 'continuous_consent_privacy', 'server_side_cancellation', 'enterprise_voice_storage'],
      enabledInPrototype: false
    },
    {
      id: 'outcome_learning_design',
      label: 'Outcome learning design and records',
      priority: 'later',
      rationale: 'Close the loop from treatment options to outcome-validated portfolio learning without claiming efficacy early.',
      gatedUntil: ['accepted_outcome_record_schema', 'follow_up_signal_linkage', 'efficacy_rules', 'canonical_learning_governance'],
      enabledInPrototype: false
    }
  ];

  return {
    id: 'agent-session-executive-pilot-v1',
    sessionId,
    mode: 'prototype_guided_executive_pilot_sequence',
    store: 'local_json',
    totalSteps: steps.length,
    completedSteps: completedSteps.length,
    missingSteps,
    lastCompletedStepId: lastCompletedStep?.id ?? null,
    sponsorRunbookReady: steps.some((step) => step.id === 'sponsor_runbook' && step.completed),
    sequenceReadyForDemo: completedSteps.length === steps.length,
    steps,
    requiredViewIds,
    observedViewIds,
    demoEvidenceStack,
    fundingAsks,
    gatedPromotionPaths: [
      'artifact_export_copy_circulation',
      'enterprise_database_persistence',
      'official_approval_identity',
      'canonical_source_writes',
      'runtime_source_auto_consumption',
      'continuous_voice_realtime_tts',
      'autonomous_sequence_execution',
      'arbitrary_ui_generation'
    ],
    exportEnabled: false,
    autonomousSequenceEnabled: false,
    fullVoiceEnabled: false,
    arbitraryUiGenerationEnabled: false,
    nextRunbookStep: nextStep
      ? `Run ${nextStep.label} with ${nextStep.expectedTemplateId} and verify ${nextStep.expectedViewIds.join(', ')}.`
      : 'All guided pilot steps have been run in this local session; review evidence, gaps, and gates before any rollout decision.',
    guardrails: [
      'Executive pilot coverage is derived from approved ExperiencePlan manifests only.',
      'A completed sequence does not enable exports, autonomous execution, official approvals, full voice, canonical writes, or arbitrary UI generation.',
      'Missing steps should be run through the governed Agent Lab sequence rather than simulated from button state.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Step completion means the expected template and core registered views rendered at least once in the session.',
      'The sequence is demo coverage for the foundation, not a production readiness certification.'
    ]
  };
}

export function buildSessionCanvasContinuitySummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionCanvasContinuitySummary {
  const canvasState = ledger.canvasState ?? [];
  const interruptionRecovery = ledger.interruptionRecovery ?? [];
  const reasoningStatus = ledger.reasoningStatus ?? [];
  const conversationPresence = ledger.conversationPresence ?? [];
  const latestCanvas = canvasState.at(-1) ?? null;
  const phaseCounts = countsBy(reasoningStatus.flatMap((manifest) => manifest.steps.map((step) => step.phase)));

  return {
    id: 'agent-session-canvas-continuity-v1',
    sessionId,
    mode: 'prototype_canvas_interaction_continuity',
    store: 'local_json',
    turnsWithCanvasState: canvasState.length,
    turnsWithInterruptionRecovery: interruptionRecovery.length,
    turnsWithReasoningStatus: reasoningStatus.length,
    turnsWithConversationPresence: conversationPresence.length,
    latestCanvas: latestCanvas
      ? {
          turnId: latestCanvas.turnId,
          brandId: latestCanvas.brandId,
          brandName: latestCanvas.brandName,
          templateId: latestCanvas.templateId,
          layout: latestCanvas.layout,
          focusedViewId: latestCanvas.focusedViewId,
          renderedViewIds: latestCanvas.renderedViewIds,
          fallbackViewIds: latestCanvas.fallbackViewIds,
          proofRailSections: latestCanvas.proofRailSections,
          pendingGateIds: latestCanvas.pendingGateIds,
          evidenceGapIds: latestCanvas.evidenceGapIds,
          humanReviewRequired: latestCanvas.humanReviewRequired
        }
      : null,
    renderedViewIds: uniqueStrings(canvasState.flatMap((manifest) => manifest.renderedViewIds)).slice(0, 40),
    fallbackViewIds: uniqueStrings(canvasState.flatMap((manifest) => manifest.fallbackViewIds)).slice(0, 24),
    focusedViewIds: uniqueStrings(canvasState.map((manifest) => manifest.focusedViewId).filter((item): item is string => Boolean(item))).slice(0, 24),
    compatibleViewIds: uniqueStrings(conversationPresence.flatMap((manifest) => manifest.compatibleViewIds)).slice(0, 40),
    proofRailSections: uniqueStrings(canvasState.flatMap((manifest) => manifest.proofRailSections)) as AgentSessionCanvasContinuitySummary['proofRailSections'],
    statusPhaseCounts: phaseCounts.map(({ item, count }) => ({ phase: item, count })),
    visibleSignals: uniqueStrings(conversationPresence.flatMap((manifest) => manifest.visibleSignals)) as AgentSessionCanvasContinuitySummary['visibleSignals'],
    pulseSources: uniqueStrings(conversationPresence.flatMap((manifest) => manifest.pulseSources)) as AgentSessionCanvasContinuitySummary['pulseSources'],
    dynamicUiGenerationEnabled: false,
    arbitraryViewIdsAllowed: false,
    preservesLastCompletedCanvas: canvasState.length > 0 && canvasState.every((manifest) => manifest.preservesCanvasUntilNextTurn),
    clientStreamAbortSupported: interruptionRecovery.length > 0 && interruptionRecovery.every((manifest) => manifest.clientStreamAbortSupported),
    serverSideCancelSupported: false,
    noOverlappingRuns: interruptionRecovery.length > 0 && interruptionRecovery.every((manifest) => manifest.noOverlappingRuns),
    continuousListeningEnabled: false,
    backgroundWakeWordEnabled: false,
    autonomousSpeakingEnabled: false,
    typedFallbackAvailable: conversationPresence.length > 0 && conversationPresence.every((manifest) => manifest.typedFallbackAvailable),
    privateReasoningExposed: false,
    continuousVoiceBargeInEnabled: false,
    guardrails: [
      'Session canvas continuity summarizes approved rendered views and interaction state; it is not arbitrary UI generation.',
      'The last completed canvas is preserved across interrupts, but server-side provider cancellation and continuous voice barge-in remain unavailable.',
      'Conversation presence remains push-to-talk/typed fallback only; it does not enable continuous listening, background wake word, or autonomous speaking.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'It reports continuity of existing per-turn manifests; it does not add new view generation, provider control, or voice capabilities.',
      'Enterprise observability, provider cancellation, and full voice orchestration remain gated by separate readiness checks.'
    ]
  };
}

export function buildSessionPersistenceGovernanceSummary(
  sessionId: string,
  ledger: AgentSessionLedger
): AgentSessionPersistenceGovernanceSummary {
  const workingContext = ledger.workingContext ?? [];
  const persistenceReadiness = ledger.persistenceReadiness ?? [];
  const reviewIdentity = ledger.reviewIdentity ?? [];
  const latestPersistence = persistenceReadiness.at(-1) ?? null;
  const localJsonPersistenceEnabled = persistenceReadiness.length > 0 && persistenceReadiness.every((manifest) => manifest.localJsonPersistenceEnabled);
  const browserLocalLedgerEnabled = persistenceReadiness.length > 0 && persistenceReadiness.every((manifest) => manifest.browserLocalLedgerEnabled);
  const reviewActionsEnabled = persistenceReadiness.length > 0 && persistenceReadiness.every((manifest) => manifest.reviewActionsEnabled);
  const acceptedMemoryLoadsIntoContext = persistenceReadiness.length > 0 && persistenceReadiness.every((manifest) => manifest.acceptedMemoryLoadsIntoContext);
  const reviewIdentityObserved = reviewIdentity.length > 0 && reviewIdentity.every((manifest) => manifest.localReviewWorkflowEnabled);
  const protocolItem = (
    id: AgentSessionPersistenceGovernanceSummary['enterprisePersistencePromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionPersistenceGovernanceSummary['enterprisePersistencePromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionPersistenceGovernanceSummary['enterprisePersistencePromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionPersistenceGovernanceSummary['enterprisePersistencePromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesEnterprisePersistence: false
  });
  const enterprisePersistencePromotionProtocol: AgentSessionPersistenceGovernanceSummary['enterprisePersistencePromotionProtocol'] = [
    protocolItem(
      'local_json_store',
      'Prototype local JSON session store',
      localJsonPersistenceEnabled && browserLocalLedgerEnabled ? 'prototype_ready' : 'blocked',
      'prototype_continuity',
      'The browser/local JSON ledger can preserve prototype turns, rendered views, review queues, accepted memory, and readiness summaries for local continuity.',
      localJsonPersistenceEnabled && browserLocalLedgerEnabled
        ? ['Local JSON is prototype continuity only; it is not an enterprise system of record.']
        : ['Browser ledger or local JSON persistence has not been observed in this session.']
    ),
    protocolItem(
      'reviewed_local_decisions',
      'Reviewed local memory and source decisions',
      reviewActionsEnabled && acceptedMemoryLoadsIntoContext && reviewIdentityObserved ? 'prototype_ready' : 'blocked',
      'prototype_continuity',
      'Prototype review actions can label accepted memory for future local working context while source candidates and claims stay non-canonical.',
      reviewActionsEnabled && acceptedMemoryLoadsIntoContext && reviewIdentityObserved
        ? ['Prototype reviewer labels are not accountable enterprise approvals.']
        : ['Local review actions, accepted-memory loading, or review identity have not all been observed.']
    ),
    protocolItem(
      'enterprise_schema',
      'Enterprise persistence schema',
      'blocked',
      'enterprise_persistence',
      'Promotion needs governed schemas for sessions, turns, memories, claims, source records, evidence links, gates, review decisions, and audit events.',
      [
        'No enterprise database schema, migration plan, tenancy model, or canonical record ownership has been implemented.',
        latestPersistence?.blockedRequirementIds.includes('enterprise-database-schema')
          ? 'The active persistence readiness manifest explicitly blocks enterprise-database-schema.'
          : 'The local ledger cannot certify enterprise schema readiness.'
      ]
    ),
    protocolItem(
      'identity_access_control',
      'Identity and brand access control',
      'blocked',
      'official_approval',
      'Official approvals require authenticated users, accountable reviewer identity, role-based access, and brand-level access control before any persistence promotion.',
      [
        'Enterprise identity, role-based access, brand access control, and official approvals remain disabled.',
        'Prototype human_review labels cannot be treated as accountable enterprise approval records.'
      ]
    ),
    protocolItem(
      'retention_backup_privacy',
      'Retention, backup, and privacy operations',
      'blocked',
      'production_operations',
      'Production persistence needs retention policies, privacy review, backup/recovery, deletion rules, and operational monitoring before it stores durable brand memory.',
      [
        'Retention/privacy policy, backup/recovery procedures, and enterprise observability are not present in the prototype.',
        'Local JSON continuity is not resilient, recoverable, or compliant enough for production operations.'
      ]
    ),
    protocolItem(
      'canonical_promotion_governance',
      'Canonical memory and source promotion governance',
      'blocked',
      'canonical_memory_or_source',
      'Canonical promotion needs human approval workflow, source lineage, claim review, audit trails, and rollback before memory or source candidates can become runtime truth.',
      [
        'Memory auto-accept, canonical memory writes, canonical source writes, canonical claim writes, and runtime source auto-consumption remain disabled.',
        'Reviewed-local candidates are evidence for a future promotion workflow, not active canonical facts.'
      ]
    )
  ];

  return {
    id: 'agent-session-persistence-governance-v1',
    sessionId,
    mode: 'prototype_persistence_governance_continuity',
    store: 'local_json',
    turnsWithWorkingContext: workingContext.length,
    turnsWithPersistenceReadiness: persistenceReadiness.length,
    turnsWithReviewIdentity: reviewIdentity.length,
    loadedContextTypes: uniqueStrings(workingContext.flatMap((manifest) => manifest.loadedContextTypes)) as AgentSessionPersistenceGovernanceSummary['loadedContextTypes'],
    acceptedMemoryIds: uniqueStrings(workingContext.flatMap((manifest) => manifest.acceptedMemory.map((memory) => memory.id))).slice(0, 40),
    sourcePromotionCandidateIds: uniqueStrings(workingContext.flatMap((manifest) => manifest.sourcePromotionCandidateIds)).slice(0, 40),
    sourceClaimCandidateIds: uniqueStrings(workingContext.flatMap((manifest) => manifest.sourceClaimCandidateIds)).slice(0, 40),
    memoryReviewGateIds: uniqueStrings(workingContext.flatMap((manifest) => manifest.memoryReviewGateIds)).slice(0, 40),
    sourceReviewGateIds: uniqueStrings(workingContext.flatMap((manifest) => manifest.sourceReviewGateIds)).slice(0, 40),
    readyRequirementIds: uniqueStrings(persistenceReadiness.flatMap((manifest) => manifest.readyRequirementIds)).slice(0, 40),
    prototypeRequirementIds: uniqueStrings(persistenceReadiness.flatMap((manifest) => manifest.prototypeRequirementIds)).slice(0, 40),
    blockedRequirementIds: uniqueStrings(persistenceReadiness.flatMap((manifest) => manifest.blockedRequirementIds)).slice(0, 40),
    persistedRecordTypes: uniqueStrings(persistenceReadiness.flatMap((manifest) => manifest.persistedRecordTypes)).slice(0, 40),
    latestNextPromotionStep: latestPersistence?.nextPromotionStep ?? null,
    reviewableItemTypes: uniqueStrings(reviewIdentity.flatMap((manifest) => manifest.reviewableItemTypes)) as AgentSessionPersistenceGovernanceSummary['reviewableItemTypes'],
    allowedPrototypeDecisions: uniqueStrings(reviewIdentity.flatMap((manifest) => manifest.allowedPrototypeDecisions)) as AgentSessionPersistenceGovernanceSummary['allowedPrototypeDecisions'],
    blockedEnterpriseApprovalTypes: uniqueStrings(reviewIdentity.flatMap((manifest) => manifest.blockedEnterpriseApprovalTypes)) as AgentSessionPersistenceGovernanceSummary['blockedEnterpriseApprovalTypes'],
    requiredBeforeEnterpriseApproval: uniqueStrings(reviewIdentity.flatMap((manifest) => manifest.requiredBeforeEnterpriseApproval)).slice(0, 40),
    relatedGateIds: uniqueStrings(reviewIdentity.flatMap((manifest) => manifest.relatedGateIds)).slice(0, 60),
    browserLocalLedgerEnabled,
    localJsonPersistenceEnabled,
    reviewActionsEnabled,
    acceptedMemoryLoadsIntoContext,
    enterprisePersistenceEnabled: false,
    enterpriseIdentityEnabled: false,
    roleBasedAccessEnabled: false,
    brandAccessControlEnabled: false,
    officialApprovalEnabled: false,
    officialApprovalBlocked: true,
    autoAcceptMemoryEnabled: false,
    sourcePromotionAutoConsumption: false,
    sourceClaimAutoConsumption: false,
    canonicalSourceWritesEnabled: false,
    canonicalClaimWritesEnabled: false,
    sourceRuntimeAutoConsumptionEnabled: false,
    enterprisePersistencePromotionProtocol,
    guardrails: [
      'Session persistence governance summarizes prototype-local context and review rails; it is not enterprise persistence.',
      'Accepted memory can load as working context only after local review, but suggested memory is never auto-accepted.',
      'Reviewed-local source candidates and claims remain non-canonical and cannot become runtime source truth through this summary.',
      'Prototype reviewer labels are not official approvals, enterprise identity, role access, or brand access control.'
    ],
    caveats: [
      'This summary is computed from the prototype local JSON/browser session ledger.',
      'Enterprise database schema, identity/access, retention/privacy, backup/recovery, and canonical promotion governance remain blocked.',
      'The summary exposes readiness and blockers; it does not write canonical source data, claim facts, or official approval records.'
    ]
  };
}

export function buildSessionVoiceReadinessSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionVoiceReadinessSummary {
  const manifests = ledger.voiceReadiness ?? [];
  const latest = manifests[manifests.length - 1];
  const latestRequirements = latest?.requirements ?? [];
  const latestRequirementById = new Map(latestRequirements.map((requirement) => [requirement.id, requirement]));
  const requirementStatus = (requirementId: string): AgentVoiceOrchestrationRequirementStatus =>
    latestRequirementById.get(requirementId)?.status ?? (manifests.length > 0 ? 'blocked' : 'blocked');
  const requirementBlockers = (requirementId: string, fallback: string[]) => {
    const blockers = latestRequirementById.get(requirementId)?.blockers ?? [];
    return blockers.length ? blockers : fallback;
  };
  const protocolItem = (
    id: AgentSessionVoiceReadinessSummary['voiceActivationProtocol'][number]['id'],
    label: string,
    status: AgentSessionVoiceReadinessSummary['voiceActivationProtocol'][number]['status'],
    requiredBefore: AgentSessionVoiceReadinessSummary['voiceActivationProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionVoiceReadinessSummary['voiceActivationProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers: uniqueStrings(blockers).slice(0, 4),
    enablesFullVoice: false
  });
  const voiceActivationProtocol: AgentSessionVoiceReadinessSummary['voiceActivationProtocol'] = [
    protocolItem(
      'push_to_talk_runtime',
      'Governed push-to-talk runtime',
      requirementStatus('push-to-talk-consent-boundary') === 'ready' ? 'ready' : 'blocked',
      'push_to_talk',
      'Push-to-talk uses the governed stream, visible consent boundary, typed fallback, and the same evidence/memory/audit/gate rails as typed turns.',
      requirementBlockers('push-to-talk-consent-boundary', ['Push-to-talk consent boundary has not been observed in this session.'])
    ),
    protocolItem(
      'browser_stt_prototype',
      'Browser STT prototype input',
      requirementStatus('browser-stt-prototype-fallback') === 'prototype_ready' ? 'prototype_ready' : 'blocked',
      'push_to_talk',
      'Browser speech recognition is optional client-side input that routes captured text through /api/agent/stream when available.',
      requirementBlockers('browser-stt-prototype-fallback', ['Browser STT is client-only and not enterprise speech infrastructure.'])
    ),
    protocolItem(
      'realtime_runtime_unification',
      'Realtime runtime unification',
      'blocked',
      'realtime_voice',
      'Realtime voice remains a gated candidate until provider events call runAgentTurn and preserve ExperiencePlan, evidence, memory, audit, and gates.',
      requirementBlockers('realtime-runtime-unification', ['Realtime voice is not unified with the governed runtime.'])
    ),
    protocolItem(
      'interruption_and_privacy',
      'Interruption, cancellation, consent, and privacy',
      'blocked',
      'continuous_voice',
      'Continuous voice requires server-side provider cancellation plus consent/privacy/retention review before wake/listen or barge-in behavior can be enabled.',
      uniqueStrings([
        ...requirementBlockers('interruption-and-server-cancel', ['Server-side provider cancellation is not implemented.']),
        ...requirementBlockers('continuous-consent-privacy-review', ['Continuous listening consent and privacy review are not approved.'])
      ])
    ),
    protocolItem(
      'tts_speaking_policy',
      'TTS provider and speaking policy',
      'blocked',
      'text_to_speech',
      'Assistant speech remains disabled until a TTS provider, autonomous-speaking policy, and spoken caveat preservation rules are approved.',
      requirementBlockers('tts-provider-and-speaking-policy', ['TTS provider and autonomous speaking policy are not approved.'])
    ),
    protocolItem(
      'enterprise_voice_storage',
      'Enterprise voice memory and transcript storage',
      'blocked',
      'enterprise_voice_memory',
      'Voice transcripts and memory remain local/prototype governed until enterprise storage, retention, identity/access, and reversibility are approved.',
      requirementBlockers('enterprise-voice-memory-storage', ['Enterprise voice transcript and memory storage are not approved.'])
    )
  ];

  return {
    id: 'agent-session-voice-readiness-v1',
    sessionId,
    mode: 'prototype_voice_orchestration_readiness_usage',
    store: 'local_json',
    turnsWithVoiceReadiness: manifests.length,
    requirementStatusCounts: {
      ready: latestRequirements.filter((requirement) => requirement.status === 'ready').length,
      prototypeReady: latestRequirements.filter((requirement) => requirement.status === 'prototype_ready').length,
      blocked: latestRequirements.filter((requirement) => requirement.status === 'blocked').length
    },
    readyRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.readyRequirementIds)),
    prototypeRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.prototypeRequirementIds)),
    blockedRequirementIds: uniqueStrings(manifests.flatMap((manifest) => manifest.blockedRequirementIds)),
    latestRequirements: latestRequirements.map((requirement) => ({
      id: requirement.id,
      label: requirement.label,
      owner: requirement.owner,
      status: requirement.status,
      blockers: requirement.blockers,
      nextAction: requirement.nextAction
    })),
    latestNextPromotionStep: latest?.nextPromotionStep ?? null,
    fullVoiceEnabled: false,
    wakeListenEnabled: false,
    continuousVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    realtimeRuntimeParity: false,
    consentPrivacyReady: !manifests.some((manifest) => manifest.blockedRequirementIds.includes('continuous-consent-privacy-review')),
    serverCancellationReady: !manifests.some((manifest) => manifest.blockedRequirementIds.includes('interruption-and-server-cancel')),
    enterpriseVoiceStorageReady: !manifests.some((manifest) => manifest.blockedRequirementIds.includes('enterprise-voice-memory-storage')),
    voiceActivationProtocol,
    guardrails: [
      'Session voice readiness is a promotion checklist, not a full-voice activation.',
      'Realtime voice, wake/listen, continuous listening, and TTS remain gated until all blocked requirements clear.',
      'Voice readiness must preserve the same evidence, memory, audit, view, and confirmation-gate rails as typed turns.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Prototype browser speech recognition may be available, but it is not enterprise voice orchestration.',
      'Consent, privacy, interruption/cancellation, TTS policy, Realtime parity, and enterprise transcript/memory storage remain governance gates.'
    ]
  };
}

export function buildSessionVoiceRuntimeSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionVoiceRuntimeSummary {
  const manifests = ledger.voiceRuntime ?? [];
  const latest = manifests[manifests.length - 1];

  return {
    id: 'agent-session-voice-runtime-v1',
    sessionId,
    mode: 'prototype_governed_voice_runtime_continuity',
    store: 'local_json',
    turnsWithVoiceRuntime: manifests.length,
    runtimeEventSources: uniqueStrings(manifests.map((manifest) => manifest.runtimeEventSource)) as AgentSessionVoiceRuntimeSummary['runtimeEventSources'],
    defaultModes: uniqueStrings(manifests.map((manifest) => manifest.defaultMode)) as AgentSessionVoiceRuntimeSummary['defaultModes'],
    enabledModes: uniqueStrings(manifests.flatMap((manifest) => manifest.enabledModes)) as AgentSessionVoiceRuntimeSummary['enabledModes'],
    disabledModes: uniqueStrings(manifests.flatMap((manifest) => manifest.disabledModes)) as AgentSessionVoiceRuntimeSummary['disabledModes'],
    consentBoundaries: uniqueStrings(manifests.map((manifest) => manifest.consentBoundary)) as AgentSessionVoiceRuntimeSummary['consentBoundaries'],
    streamEventTypes: uniqueStrings(manifests.flatMap((manifest) => manifest.streamEventTypes)) as AgentSessionVoiceRuntimeSummary['streamEventTypes'],
    compatibleViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.compatibleViewIds)).slice(0, 40),
    latestCompatibleViewIds: (latest?.compatibleViewIds ?? []).slice(0, 24),
    latestStreamEventTypes: latest?.streamEventTypes ?? [],
    pushToTalkReady: manifests.length > 0 && manifests.every((manifest) => manifest.defaultMode === 'push_to_talk' && manifest.enabledModes.includes('push_to_talk')),
    typedFallbackAvailable: manifests.length > 0 && manifests.every((manifest) => manifest.typedFallbackAvailable),
    usesGovernedRuntimeConsistent: manifests.length > 0 && manifests.every((manifest) => manifest.usesGovernedRuntime),
    evidenceAndGateParityConsistent: manifests.length > 0 && manifests.every((manifest) => manifest.usesSameEvidenceAndGatesAsTypedTurn),
    runtimeEventSourceConsistent: manifests.length > 0 && manifests.every((manifest) => manifest.runtimeEventSource === '/api/agent/stream'),
    continuousModeEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    autonomousSpeakingEnabled: false,
    backgroundListeningEnabled: false,
    providerBypassAllowed: false,
    guardrails: [
      'Session voice runtime summarizes governed push-to-talk runtime usage; it is not full voice orchestration.',
      'Voice turns must use the same evidence, memory, audit, view, and confirmation-gate rails as typed turns.',
      'Continuous listening, Realtime runtime connection, TTS, autonomous speaking, background listening, and provider bypass remain disabled or gated.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Browser speech recognition is a prototype input convenience, not enterprise voice storage or transcription governance.',
      'Full voice still depends on voice readiness, provider adapter, consent/privacy, interruption/cancellation, and enterprise storage gates.'
    ]
  };
}

export function buildSessionVoiceContractSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionVoiceContractSummary {
  const manifests = ledger.voiceContract ?? [];
  const latest = manifests[manifests.length - 1];

  return {
    id: 'agent-session-voice-contract-v1',
    sessionId,
    mode: 'prototype_voice_skill_view_contract_usage',
    store: 'local_json',
    turnsWithVoiceContracts: manifests.length,
    usedSkillIds: uniqueStrings(manifests.map((manifest) => manifest.activeSkillId)).slice(0, 20),
    compatibleViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.activeVoiceCompatibleViewIds)).slice(0, 24),
    incompatibleViewIds: uniqueStrings(manifests.flatMap((manifest) => manifest.activeIncompatibleViewIds)).slice(0, 24),
    readyModeIds: uniqueStrings(manifests.flatMap((manifest) => manifest.readyModeIds)) as AgentSessionVoiceContractSummary['readyModeIds'],
    gatedModeIds: uniqueStrings(manifests.flatMap((manifest) => manifest.gatedModeIds)) as AgentSessionVoiceContractSummary['gatedModeIds'],
    blockedModeIds: uniqueStrings(manifests.flatMap((manifest) => manifest.blockedModeIds)) as AgentSessionVoiceContractSummary['blockedModeIds'],
    requiredReadinessIds: uniqueStrings(manifests.flatMap((manifest) => manifest.requiredReadinessIds)),
    blockedReadinessIds: uniqueStrings(manifests.flatMap((manifest) => manifest.blockedReadinessIds)),
    latestStatePhaseIds: latest?.visibleStatePhaseIds ?? [],
    activeSkillCompatibilityConsistent: manifests.every((manifest) => manifest.activeSkillVoiceCompatible),
    activeViewCompatibilityConsistent: manifests.every((manifest) => manifest.activeIncompatibleViewIds.length === 0 && manifest.activeVoiceCompatibleViewIds.length > 0),
    pushToTalkContractReady: manifests.length > 0 && manifests.every((manifest) => manifest.pushToTalkContractReady),
    wakeListenContractReady: false,
    continuousContractReady: false,
    realtimeContractReady: false,
    ttsContractReady: false,
    continuousVoiceEnabled: false,
    realtimeVoiceEnabled: false,
    ttsEnabled: false,
    arbitrarySkillRoutingEnabled: false,
    arbitraryViewGenerationEnabled: false,
    guardrails: [
      'Session voice contracts summarize approved skill/view usage; they do not enable continuous voice.',
      'Voice orchestration must request registered skills and voice-canvas views only.',
      'Wake/listen, continuous voice, Realtime voice, TTS, and autonomous speaking remain promotion-gated.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'A compatible contract means the turn stayed inside the approved vocabulary; it does not certify privacy, provider, TTS, or enterprise storage readiness.',
      'Future dynamic UI composition must keep using registered ExperiencePlan views until a reviewed UI-generation capability exists.'
    ]
  };
}

export function buildSessionProviderAdapterSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionProviderAdapterSummary {
  const manifests = ledger.providerAdapter ?? [];
  const latest = manifests[manifests.length - 1];
  const readyAdapterIds = uniqueStrings(manifests.flatMap((manifest) => manifest.readyAdapterIds));
  const prototypeAdapterIds = uniqueStrings(manifests.flatMap((manifest) => (
    manifest.adapters.filter((adapter) => adapter.status === 'prototype_client_only').map((adapter) => adapter.id)
  )));
  const gatedAdapterIds = uniqueStrings(manifests.flatMap((manifest) => manifest.gatedAdapterIds));
  const disabledAdapterIds = uniqueStrings(manifests.flatMap((manifest) => manifest.disabledAdapterIds));

  return {
    id: 'agent-session-provider-adapter-v1',
    sessionId,
    mode: 'prototype_provider_adapter_readiness_usage',
    store: 'local_json',
    turnsWithProviderAdapters: manifests.length,
    readyAdapterIds,
    prototypeAdapterIds,
    gatedAdapterIds,
    disabledAdapterIds,
    latestAdapters: (latest?.adapters ?? []).map((adapter) => ({
      id: adapter.id,
      capability: adapter.capability,
      status: adapter.status,
      runtimeBoundary: adapter.runtimeBoundary,
      providerBinding: adapter.providerBinding,
      sharesAgentRuntime: adapter.sharesAgentRuntime,
      evidenceAndGateParity: adapter.evidenceAndGateParity
    })),
    latestCoreRuntimeAdapterId: latest?.coreRuntimeAdapterId ?? null,
    latestStreamAdapterId: latest?.streamAdapterId ?? null,
    latestActiveVoiceInputAdapterId: latest?.activeVoiceInputAdapterId ?? null,
    latestRealtimeVoiceAdapterId: latest?.realtimeVoiceAdapterId ?? null,
    latestTtsAdapterId: latest?.ttsAdapterId ?? null,
    requiredPolicyReviewFor: Array.from(new Set(manifests.flatMap((manifest) => manifest.requiresPolicyReviewFor))),
    textReasoningReady: readyAdapterIds.includes('text-reasoning-local'),
    sseStreamingReady: readyAdapterIds.includes('agent-sse-stream'),
    browserSttPrototypeReady: prototypeAdapterIds.includes('browser-speech-single-turn'),
    realtimeRuntimeConnected: false,
    ttsEnabled: false,
    continuousVoiceEnabled: false,
    providerBypassAllowed: false,
    guardrails: [
      'Session provider adapter readiness is an audit map, not permission to bypass the governed runtime.',
      'Realtime voice and TTS remain gated or disabled until they preserve evidence, memory, audit, views, and confirmation gates.',
      'Browser speech recognition is prototype client-side input only; it is not enterprise voice orchestration.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'Ready text and SSE adapters indicate governed prototype paths, not production infrastructure certification.',
      'Provider activation, server-side Realtime unification, TTS, continuous voice, and autonomous speaking remain disabled.'
    ]
  };
}

export function buildSessionRuntimeQualitySummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionRuntimeQualitySummary {
  const records = ledger.runtimeQuality ?? [];
  const latest = records[records.length - 1];
  const checks = records.flatMap((record) => record.checks);
  const checkIds = uniqueStrings(checks.map((check) => check.id));
  const statusByCheckId = new Map<string, Set<(typeof checks)[number]['status']>>();
  for (const check of checks) {
    const statuses = statusByCheckId.get(check.id) ?? new Set<(typeof checks)[number]['status']>();
    statuses.add(check.status);
    statusByCheckId.set(check.id, statuses);
  }
  const consistentlyPassingCheckIds = Array.from(statusByCheckId.entries())
    .filter(([, statuses]) => statuses.size === 1 && statuses.has('pass'))
    .map(([id]) => id)
    .sort();
  const watchCheckIds = Array.from(statusByCheckId.entries())
    .filter(([, statuses]) => statuses.has('watch'))
    .map(([id]) => id)
    .sort();
  const blockedCheckIds = Array.from(statusByCheckId.entries())
    .filter(([, statuses]) => statuses.has('blocked'))
    .map(([id]) => id)
    .sort();
  const humanReviewRequiredCheckIds = uniqueStrings(checks.filter((check) => check.humanReviewRequired).map((check) => check.id)).sort();
  const allObservedPass = (id: string) => statusByCheckId.has(id) && Array.from(statusByCheckId.get(id) ?? []).every((status) => status === 'pass');

  return {
    id: 'agent-session-runtime-quality-v1',
    sessionId,
    mode: 'prototype_runtime_quality_consistency',
    store: 'local_json',
    turnsWithRuntimeQuality: records.length,
    checkStatusCounts: {
      pass: checks.filter((check) => check.status === 'pass').length,
      watch: checks.filter((check) => check.status === 'watch').length,
      blocked: checks.filter((check) => check.status === 'blocked').length
    },
    checkIds,
    consistentlyPassingCheckIds,
    watchCheckIds,
    blockedCheckIds,
    humanReviewRequiredCheckIds,
    latestChecks: (latest?.checks ?? []).map((check) => ({
      id: check.id,
      label: check.label,
      status: check.status,
      detail: check.detail,
      evidenceLabels: check.evidenceLabels,
      relatedGateIds: check.relatedGateIds,
      humanReviewRequired: check.humanReviewRequired
    })),
    approvedExperienceConsistent: allObservedPass('approved-experience-template') && allObservedPass('approved-rendered-views'),
    evidenceAttachmentConsistent: allObservedPass('answer-evidence-attached'),
    sourceContextNonCanonicalConsistent: allObservedPass('source-context-non-canonical'),
    artifactExportDisabledConsistent: allObservedPass('artifact-gates-and-export-disabled'),
    memoryReviewControlledConsistent: allObservedPass('memory-review-required'),
    continuousVoiceDisabledConsistent: allObservedPass('continuous-voice-disabled'),
    providerAdaptersGovernedConsistent: allObservedPass('provider-adapters-governed'),
    voiceOrchestrationGatedConsistent: allObservedPass('voice-orchestration-gated'),
    runtimeSurfaceGovernedConsistent: allObservedPass('runtime-surface-governed'),
    guardrails: [
      'Session runtime quality is an audit summary, not a production certification.',
      'Watch and blocked checks must remain visible until the underlying governance, data, or runtime gaps are resolved.',
      'Passing checks do not permit exports, canonical writes, full voice, provider bypass, or official approval.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger.',
      'It reports consistency across persisted prototype turns; it does not replace enterprise QA, identity, policy, or observability.',
      'A check is considered consistent only when the check exists and has passed every observed turn.'
    ]
  };
}

export function buildSessionFoundationReadinessSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionFoundationReadinessSummary {
  const reviewWorkflow = buildSessionReviewWorkflowSummary(sessionId, ledger);
  const artifactReadiness = buildSessionArtifactReadinessSummary(sessionId, ledger);
  const audit = buildSessionAuditSummary(sessionId, ledger);
  const capabilityReadiness = buildSessionCapabilityReadinessSummary(sessionId, ledger);
  const evidenceSpotlight = buildSessionEvidenceSpotlightSummary(sessionId, ledger);
  const proactivity = buildSessionProactivitySummary(sessionId, ledger);
  const pilotLearning = buildSessionPilotLearningSummary(sessionId, ledger);
  const treatmentOutcomeReadiness = buildSessionTreatmentOutcomeReadinessSummary(sessionId, ledger);
  const sourceGovernance = buildSessionSourceGovernanceSummary(sessionId, ledger);
  const runtimeSurface = buildSessionRuntimeSurfaceSummary(sessionId, ledger);
  const experienceArchitecture = buildSessionExperienceArchitectureSummary(sessionId, ledger);
  const canvasContinuity = buildSessionCanvasContinuitySummary(sessionId, ledger);
  const persistenceGovernance = buildSessionPersistenceGovernanceSummary(sessionId, ledger);
  const providerAdapter = buildSessionProviderAdapterSummary(sessionId, ledger);
  const runtimeControl = buildSessionRuntimeControlSummary(sessionId, ledger);
  const runtimeQuality = buildSessionRuntimeQualitySummary(sessionId, ledger);
  const voiceRuntime = buildSessionVoiceRuntimeSummary(sessionId, ledger);
  const voiceReadiness = buildSessionVoiceReadinessSummary(sessionId, ledger);
  const turns = ledger.turnIds.length;

  const area = (
    id: AgentSessionFoundationReadinessSummary['readinessAreas'][number]['id'],
    label: string,
    observed: boolean,
    ready: boolean,
    blockers: string[],
    evidence: string
  ): AgentSessionFoundationReadinessSummary['readinessAreas'][number] => ({
    id,
    label,
    status: !observed ? 'waiting' : blockers.length > 0 ? 'blocked' : ready ? 'ready' : 'prototype',
    evidence,
    blockers
  });

  const readinessAreas: AgentSessionFoundationReadinessSummary['readinessAreas'] = [
    area(
      'experience_architecture',
      'Approved experience architecture',
      experienceArchitecture.turnsWithExperienceArchitecture > 0,
      experienceArchitecture.unknownViewIds.length === 0 && !experienceArchitecture.dynamicUiGenerationEnabled,
      [...experienceArchitecture.unknownViewIds, ...experienceArchitecture.compositionBlockers].slice(0, 6),
      `${experienceArchitecture.activeTemplates.length} templates used, ${experienceArchitecture.renderedViewIds.length} approved views rendered.`
    ),
    area(
      'evidence_grounding',
      'Claim-level evidence grounding',
      evidenceSpotlight.turnsWithEvidenceSpotlight > 0,
      evidenceSpotlight.claimStatusCounts.supportedByPacket > 0,
      evidenceSpotlight.missingEvidenceIds.slice(0, 6),
      `${evidenceSpotlight.claimStatusCounts.supportedByPacket} supported claims, ${evidenceSpotlight.claimStatusCounts.missingEvidence} missing-evidence claims.`
    ),
    area(
      'reviewed_memory',
      'Reviewed memory and human decisions',
      ledger.memory.length > 0 || reviewWorkflow.reviewed.totalReviews > 0,
      reviewWorkflow.reviewed.totalReviews > 0 || ledger.memory.length > 0,
      reviewWorkflow.blocked.capabilityBlockedGates > 0 ? ['Capability-blocked gates cannot be locally approved.'] : [],
      `${ledger.memory.length} memory records, ${reviewWorkflow.reviewed.totalReviews} human review decisions.`
    ),
    area(
      'source_governance',
      'Reviewed source governance',
      sourceGovernance.turnsWithSourceGovernance > 0,
      !sourceGovernance.canonicalSourceWritesEnabled && !sourceGovernance.runtimeSourceAutoConsumptionEnabled,
      sourceGovernance.nextSourceGovernanceSteps.slice(0, 4),
      `${sourceGovernance.sourcePromotionCandidates.total} source candidates, ${sourceGovernance.sourceClaimCandidates.total} source-claim observations.`
    ),
    area(
      'audit_quality',
      'Audit and runtime quality',
      audit.turnsWithAudit > 0 && runtimeQuality.turnsWithRuntimeQuality > 0,
      runtimeQuality.approvedExperienceConsistent && runtimeQuality.evidenceAttachmentConsistent,
      runtimeQuality.blockedCheckIds.slice(0, 6),
      `${audit.records} audit records, ${runtimeQuality.checkStatusCounts.pass} passing quality checks.`
    ),
    area(
      'runtime_control',
      'Fail-closed runtime control',
      runtimeControl.turnsWithRuntimeControl > 0,
      runtimeControl.runtimeEnabledConsistent && runtimeControl.failClosedConsistent && runtimeControl.evidenceReviewBypassPrevented,
      runtimeControl.killSwitchActiveEver ? ['Kill switch was active in this session.'] : [],
      `${runtimeControl.turnsWithRuntimeControl} control turns, runtime bypass ${runtimeControl.runtimeBypassAllowed ? 'allowed' : 'blocked'}.`
    ),
    area(
      'runtime_surfaces',
      'Governed runtime surfaces',
      runtimeSurface.turnsWithRuntimeSurface > 0,
      runtimeSurface.governedRuntimeOnly && runtimeSurface.defaultScopedChatPreserved,
      runtimeSurface.usedGatedSurfaceIds.concat(runtimeSurface.usedDisabledSurfaceIds).slice(0, 6),
      `${runtimeSurface.usedSurfaceIds.length} surfaces used, ${runtimeSurface.streamingTurns} streaming turns.`
    ),
    area(
      'provider_adapters',
      'Provider adapter readiness',
      providerAdapter.turnsWithProviderAdapters > 0,
      providerAdapter.textReasoningReady && providerAdapter.sseStreamingReady,
      providerAdapter.requiredPolicyReviewFor.slice(0, 6),
      `${providerAdapter.readyAdapterIds.length} ready adapters, ${providerAdapter.gatedAdapterIds.length} gated adapters.`
    ),
    area(
      'voice_readiness',
      'Voice readiness without full-voice promotion',
      voiceRuntime.turnsWithVoiceRuntime > 0 || voiceReadiness.turnsWithVoiceReadiness > 0,
      voiceRuntime.pushToTalkReady && !voiceReadiness.fullVoiceEnabled,
      voiceReadiness.blockedRequirementIds.slice(0, 6),
      `${voiceRuntime.compatibleViewIds.length} voice-compatible views, ${voiceReadiness.blockedRequirementIds.length} full-voice blockers.`
    ),
    area(
      'persistence_governance',
      'Persistence and identity governance',
      persistenceGovernance.turnsWithPersistenceReadiness > 0,
      persistenceGovernance.localJsonPersistenceEnabled && persistenceGovernance.reviewActionsEnabled,
      persistenceGovernance.blockedRequirementIds.slice(0, 6),
      `${persistenceGovernance.persistedRecordTypes.length} persisted record types, enterprise persistence ${persistenceGovernance.enterprisePersistenceEnabled ? 'enabled' : 'blocked'}.`
    ),
    area(
      'artifact_readiness',
      'Artifact readiness and export gates',
      artifactReadiness.artifacts.total > 0,
      artifactReadiness.artifacts.total > 0 && artifactReadiness.artifacts.exportBlocked >= 0,
      artifactReadiness.blockedExportGateIds.slice(0, 6),
      `${artifactReadiness.artifacts.total} artifacts captured, ${artifactReadiness.artifacts.exportBlocked} export-blocked.`
    ),
    area(
      'outcome_learning',
      'Pilot learning and outcome readiness',
      pilotLearning.turnsWithLearning > 0 || treatmentOutcomeReadiness.turnsWithTreatmentOutcomeReadiness > 0,
      pilotLearning.signals.total > 0,
      treatmentOutcomeReadiness.blockedRequirementIds.slice(0, 6),
      `${pilotLearning.signals.total} reviewed learning signals, ${treatmentOutcomeReadiness.blockedRequirementIds.length} outcome-learning blockers.`
    )
  ];

  const statusCounts = {
    ready: readinessAreas.filter((item) => item.status === 'ready').length,
    prototype: readinessAreas.filter((item) => item.status === 'prototype').length,
    blocked: readinessAreas.filter((item) => item.status === 'blocked').length,
    waiting: readinessAreas.filter((item) => item.status === 'waiting').length
  };
  const foundationDemoReady = turns > 0 &&
    experienceArchitecture.unknownViewIds.length === 0 &&
    capabilityReadiness.allRiskyCapabilitiesDisabled &&
    runtimeControl.runtimeEnabledConsistent &&
    runtimeControl.failClosedConsistent &&
    runtimeControl.evidenceReviewBypassPrevented &&
    runtimeQuality.approvedExperienceConsistent &&
    runtimeQuality.evidenceAttachmentConsistent;

  return {
    id: 'agent-session-foundation-readiness-v1',
    sessionId,
    mode: 'prototype_composable_agentic_foundation_readiness',
    store: 'local_json',
    turns,
    foundationDemoReady,
    cmoReadinessSignal: foundationDemoReady ? 'foundation_demo_ready_with_gated_promotions' : 'needs_governed_turns_or_review',
    readinessAreas,
    statusCounts,
    governedTurnCoverage: {
      experienceArchitectureTurns: experienceArchitecture.turnsWithExperienceArchitecture,
      evidenceSpotlightTurns: evidenceSpotlight.turnsWithEvidenceSpotlight,
      sourceGovernanceTurns: sourceGovernance.turnsWithSourceGovernance,
      runtimeSurfaceTurns: runtimeSurface.turnsWithRuntimeSurface,
      runtimeControlTurns: runtimeControl.turnsWithRuntimeControl,
      runtimeQualityTurns: runtimeQuality.turnsWithRuntimeQuality,
      canvasContinuityTurns: canvasContinuity.turnsWithCanvasState,
      persistenceReadinessTurns: persistenceGovernance.turnsWithPersistenceReadiness,
      providerAdapterTurns: providerAdapter.turnsWithProviderAdapters,
      voiceRuntimeTurns: voiceRuntime.turnsWithVoiceRuntime,
      voiceReadinessTurns: voiceReadiness.turnsWithVoiceReadiness
    },
    approvedComposition: {
      templateCount: experienceArchitecture.approvedRegistrySnapshot.latestTemplateCount,
      skillCount: experienceArchitecture.approvedRegistrySnapshot.latestSkillCount,
      viewCount: experienceArchitecture.approvedRegistrySnapshot.latestViewCount,
      renderedViewIds: experienceArchitecture.renderedViewIds,
      unknownViewIds: experienceArchitecture.unknownViewIds,
      dynamicUiGenerationEnabled: false,
      arbitraryViewIdsAllowed: false,
      unsupportedMetricGenerationEnabled: false
    },
    proofAndReview: {
      supportedClaims: evidenceSpotlight.claimStatusCounts.supportedByPacket,
      missingEvidenceClaims: evidenceSpotlight.claimStatusCounts.missingEvidence,
      guardrailClaims: evidenceSpotlight.claimStatusCounts.guardrail,
      acceptedMemoryRecords: reviewWorkflow.reviewed.acceptedMemory,
      pendingReviewItems: reviewWorkflow.pending.total,
      reviewedItems: reviewWorkflow.reviewed.totalReviews,
      blockedReviewItems: reviewWorkflow.blocked.memory + reviewWorkflow.blocked.artifacts + reviewWorkflow.blocked.confirmationGates,
      auditRecords: audit.records,
      runtimeQualityPasses: runtimeQuality.checkStatusCounts.pass,
      runtimeQualityBlockedChecks: runtimeQuality.checkStatusCounts.blocked
    },
    sourceAndPersistence: {
      sourcePromotionCandidates: sourceGovernance.sourcePromotionCandidates.total,
      sourceClaimCandidates: sourceGovernance.sourceClaimCandidates.total,
      localJsonPersistenceEnabled: persistenceGovernance.localJsonPersistenceEnabled,
      enterprisePersistenceEnabled: false,
      officialApprovalEnabled: false,
      canonicalSourceWritesEnabled: false,
      runtimeSourceAutoConsumptionEnabled: false
    },
    runtimeAndCapability: {
      runtimeEnabledConsistent: runtimeControl.runtimeEnabledConsistent,
      failClosedConsistent: runtimeControl.failClosedConsistent,
      evidenceReviewBypassPrevented: runtimeControl.evidenceReviewBypassPrevented,
      killSwitchActiveEver: runtimeControl.killSwitchActiveEver,
      allRiskyCapabilitiesDisabled: capabilityReadiness.allRiskyCapabilitiesDisabled,
      blockedCapabilityGates: capabilityReadiness.blockedCapabilityGateIds.length,
      runtimeBypassAllowed: false,
      adminBypassEnabled: false
    },
    voiceAndProvider: {
      textReasoningReady: providerAdapter.textReasoningReady,
      sseStreamingReady: providerAdapter.sseStreamingReady,
      browserSttPrototypeReady: providerAdapter.browserSttPrototypeReady,
      pushToTalkReady: voiceRuntime.pushToTalkReady,
      fullVoiceEnabled: false,
      realtimeVoiceEnabled: false,
      ttsEnabled: false,
      continuousVoiceEnabled: false,
      providerBypassAllowed: false
    },
    learningAndArtifacts: {
      proactivitySuggestions: proactivity.suggestions.total,
      pilotLearningSignals: pilotLearning.signals.total,
      outcomeReadinessBlockedRequirements: treatmentOutcomeReadiness.blockedRequirementIds.length,
      artifactsCaptured: artifactReadiness.artifacts.total,
      artifactExportBlocked: artifactReadiness.artifacts.exportBlocked,
      artifactExportEnabled: false,
      outcomeLearningEnabled: false
    },
    disabledPromotionPaths: [
      'enterprise_database_persistence',
      'official_approval_identity',
      'canonical_source_writes',
      'runtime_source_auto_consumption',
      'artifact_export_copy_circulation',
      'external_research_ingest',
      'continuous_voice_realtime_tts',
      'autonomous_learning_or_reminders',
      'arbitrary_ui_generation'
    ],
    nextFoundationSteps: uniqueStrings([
      ...persistenceGovernance.blockedRequirementIds,
      ...voiceReadiness.blockedRequirementIds,
      ...sourceGovernance.nextSourceGovernanceSteps,
      ...treatmentOutcomeReadiness.blockedRequirementIds,
      ...capabilityReadiness.nextPromotionRequirements
    ]).slice(0, 12),
    guardrails: [
      'Foundation readiness is a cross-rail inspection summary, not permission to promote gated capabilities.',
      'Dynamic UI must remain ExperiencePlan-driven and use approved registry views.',
      'Enterprise persistence, official approvals, canonical source writes, artifact export, full voice, autonomous learning, and arbitrary UI generation remain disabled until explicitly approved.'
    ],
    caveats: [
      'This summary is computed from the local JSON/browser session ledger and existing per-turn governance manifests.',
      'Blocked areas indicate intentional governance gates, not runtime failure.',
      'A demo-ready foundation signal means the governed prototype is coherent; it does not certify enterprise production readiness.'
    ]
  };
}

export function buildSessionPromotionGateSummary(sessionId: string, ledger: AgentSessionLedger): AgentSessionPromotionGateSummary {
  const foundationReadiness = buildSessionFoundationReadinessSummary(sessionId, ledger);
  const executivePilot = buildSessionExecutivePilotSummary(sessionId, ledger);
  const sourceRuntimeIngestion = buildSessionSourceRuntimeIngestionSummary(sessionId, ledger);
  const runtimeSurface = buildSessionRuntimeSurfaceSummary(sessionId, ledger);
  const runtimeQuality = buildSessionRuntimeQualitySummary(sessionId, ledger);
  const criticalGates = {
    sourceOwnerDataReady: sourceRuntimeIngestion.readyForGovernanceReview,
    canonicalUseApproved: false as const,
    enterprisePersistenceReady: false as const,
    officialApprovalReady: false as const,
    artifactExportReady: false as const,
    fullVoiceReady: false as const,
    autonomousLearningReady: false as const,
    arbitraryUiGenerationReady: false as const
  };
  const executiveDemoReady = foundationReadiness.foundationDemoReady &&
    executivePilot.sponsorRunbookReady &&
    runtimeSurface.allUsedSurfacesGuarded &&
    foundationReadiness.approvedComposition.unknownViewIds.length === 0;
  const pilotReviewReady = executiveDemoReady &&
    foundationReadiness.proofAndReview.supportedClaims > 0 &&
    foundationReadiness.proofAndReview.auditRecords > 0 &&
    runtimeQuality.runtimeSurfaceGovernedConsistent;
  const readinessLevel: AgentSessionPromotionGateSummary['readinessLevel'] = pilotReviewReady
    ? 'pilot_review_ready'
    : executiveDemoReady
      ? 'executive_demo_ready'
      : 'needs_governed_turns';
  const blockedForProduction = uniqueStrings([
    sourceRuntimeIngestion.readyForGovernanceReview ? '' : 'approved_source_owner_runtime_files',
    'canonical_source_use_approval',
    'enterprise_database_persistence',
    'enterprise_identity_and_official_approval',
    'artifact_export_copy_circulation_approval',
    'full_voice_realtime_tts_consent_privacy_and_storage',
    'treatment_outcome_records_and_canonical_learning_governance',
    'arbitrary_ui_generation_capability_review'
  ]);

  return {
    id: 'agent-session-promotion-gate-v1',
    sessionId,
    mode: 'prototype_foundation_promotion_gate',
    store: 'local_json',
    readinessLevel,
    promotionDecision: pilotReviewReady ? 'ready_for_cmo_demo_not_production' : 'needs_more_governed_proof',
    recommendedAsk: pilotReviewReady ? 'fund_governed_pilot_and_source_owner_handoff' : 'run_governed_sequence_first',
    executiveDemoReady,
    pilotReviewReady,
    productionReady: false,
    demoProof: {
      governedTurns: foundationReadiness.turns,
      completedExecutivePilotSteps: executivePilot.completedSteps,
      totalExecutivePilotSteps: executivePilot.totalSteps,
      approvedViewsRendered: foundationReadiness.approvedComposition.renderedViewIds.length,
      supportedClaims: foundationReadiness.proofAndReview.supportedClaims,
      runtimeSurfacesGuarded: runtimeSurface.allUsedSurfacesGuarded,
      qualityPasses: foundationReadiness.proofAndReview.runtimeQualityPasses
    },
    criticalGates,
    enabledForDemo: [
      'governed_agent_runtime',
      'streaming_text_runtime',
      'approved_experienceplan_workspaces',
      'claim_level_evidence_spotlight',
      'local_json_session_persistence',
      'human_review_queue',
      'browser_push_to_talk_prototype',
      'executive_pilot_runbook'
    ],
    blockedForProduction,
    nextPilotSteps: uniqueStrings([
      executivePilot.nextRunbookStep,
      sourceRuntimeIngestion.nextIngestionStep,
      ...foundationReadiness.nextFoundationSteps,
      'Use the CMO demo to fund governed pilot infrastructure, approved source-owner handoff, and enterprise persistence design.'
    ]).slice(0, 10),
    fundingRationale: [
      'The foundation already composes role-specific workspaces from approved skills, templates, views, evidence, and runtime policy.',
      'The demo can show a governed agent experience with streaming, memory/audit continuity, review gates, and push-to-talk input without enabling risky capabilities.',
      'The funding ask is for the remaining enterprise rails: source-owner data, persistence, identity/approval, artifact export workflow, and full voice readiness.'
    ],
    disabledPromotionPaths: foundationReadiness.disabledPromotionPaths,
    guardrails: [
      'Promotion gate readiness is an inspection summary, not permission to ship, export, write sources, or enable full voice.',
      'Pilot-review-ready means the foundation can be demoed and reviewed with explicit blockers; production remains blocked.',
      'Production promotion requires source-owner data, canonical-use governance, enterprise persistence, official approval identity, artifact workflow, and voice policy clearance.'
    ],
    caveats: [
      'This summary is computed from local JSON/browser session manifests.',
      'It describes prototype promotion posture only and must not be treated as enterprise release approval.',
      'A CMO demo recommendation is a funding and pilot-review signal, not a production launch signal.'
    ]
  };
}

export function parseSessionLedger(raw: string | null): AgentSessionLedger {
  if (!raw) return emptySessionLedger();
  try {
    const parsed = JSON.parse(raw) as Partial<AgentSessionLedger>;
    if (parsed.version !== 'agent-session-ledger-v1') return emptySessionLedger();
    return {
      version: 'agent-session-ledger-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      turnIds: Array.isArray(parsed.turnIds) ? parsed.turnIds.filter((item): item is string => typeof item === 'string') : [],
      memory: Array.isArray(parsed.memory) ? parsed.memory as AgentMemoryRecord[] : [],
      audit: Array.isArray(parsed.audit) ? parsed.audit as AgentAuditRecord[] : [],
      artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts as ExperienceArtifact[] : [],
      confirmationGates: Array.isArray(parsed.confirmationGates) ? parsed.confirmationGates as AgentConfirmationGate[] : [],
      capabilityState: Array.isArray(parsed.capabilityState) ? parsed.capabilityState as AgentCapabilityTurnRecord[] : [],
      evidenceSpotlight: Array.isArray(parsed.evidenceSpotlight) ? parsed.evidenceSpotlight as AgentEvidenceSpotlightTurnRecord[] : [],
      proactivity: Array.isArray(parsed.proactivity) ? parsed.proactivity as AgentProactivityManifest[] : [],
      pilotLearning: Array.isArray(parsed.pilotLearning) ? parsed.pilotLearning as AgentPilotLearningManifest[] : [],
      treatmentOutcomeReadiness: Array.isArray(parsed.treatmentOutcomeReadiness) ? parsed.treatmentOutcomeReadiness as AgentTreatmentOutcomeReadinessManifest[] : [],
      sourceGovernance: Array.isArray(parsed.sourceGovernance) ? parsed.sourceGovernance as AgentSourceGovernanceManifest[] : [],
      runtimeSurface: Array.isArray(parsed.runtimeSurface) ? parsed.runtimeSurface as AgentRuntimeSurfaceManifest[] : [],
      experienceArchitecture: Array.isArray(parsed.experienceArchitecture) ? parsed.experienceArchitecture as AgentExperienceArchitectureManifest[] : [],
      canvasState: Array.isArray(parsed.canvasState) ? parsed.canvasState as AgentCanvasStateManifest[] : [],
      interruptionRecovery: Array.isArray(parsed.interruptionRecovery) ? parsed.interruptionRecovery as AgentInterruptionRecoveryManifest[] : [],
      reasoningStatus: Array.isArray(parsed.reasoningStatus) ? parsed.reasoningStatus as AgentReasoningStatusManifest[] : [],
      conversationPresence: Array.isArray(parsed.conversationPresence) ? parsed.conversationPresence as AgentConversationPresenceManifest[] : [],
      workingContext: Array.isArray(parsed.workingContext) ? parsed.workingContext as AgentWorkingContextManifest[] : [],
      persistenceReadiness: Array.isArray(parsed.persistenceReadiness) ? parsed.persistenceReadiness as AgentPersistenceReadinessManifest[] : [],
      reviewIdentity: Array.isArray(parsed.reviewIdentity) ? parsed.reviewIdentity as AgentReviewIdentityManifest[] : [],
      providerAdapter: Array.isArray(parsed.providerAdapter) ? parsed.providerAdapter as AgentProviderAdapterManifest[] : [],
      runtimeQuality: Array.isArray(parsed.runtimeQuality) ? parsed.runtimeQuality as AgentRuntimeQualityTurnRecord[] : [],
      voiceRuntime: Array.isArray(parsed.voiceRuntime) ? parsed.voiceRuntime as AgentVoiceRuntimeManifest[] : [],
      voiceContract: Array.isArray(parsed.voiceContract) ? parsed.voiceContract as AgentVoiceSkillViewContractManifest[] : [],
      voiceReadiness: Array.isArray(parsed.voiceReadiness) ? parsed.voiceReadiness as AgentVoiceOrchestrationReadinessManifest[] : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews as AgentReviewRecord[] : []
    };
  } catch {
    return emptySessionLedger();
  }
}
