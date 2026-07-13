import type {
  AgentSessionArtifactReadinessSummary,
  AgentSessionAuditSummary,
  AgentSessionMemoryAuditSummary,
  AgentSessionPromotionGateSummary,
  AgentSessionRuntimeQualitySummary,
  AgentSessionSourceRuntimeIngestionSummary,
  AgentSessionTreatmentOutcomeReadinessSummary,
  AgentSessionVoiceReadinessSummary,
  AgentSessionVoiceRuntimeSummary,
  AgentTurnResult,
  FoundationLayerAudit,
  FoundationLayerReadiness
} from '@/src/lib/intelligence/types';
import type { WorkspaceOrchestrationState } from '@/src/lib/intelligence/workspace-orchestration';

export function buildFoundationLayerAudit(input: {
  result: AgentTurnResult;
  workspaceOrchestration: WorkspaceOrchestrationState;
  runtimeQualitySummary: AgentSessionRuntimeQualitySummary;
  voiceRuntimeSummary: AgentSessionVoiceRuntimeSummary;
  voiceReadinessSummary: AgentSessionVoiceReadinessSummary;
  auditSummary: AgentSessionAuditSummary;
  memoryAuditSummary: AgentSessionMemoryAuditSummary;
  sourceRuntimeIngestionSummary: AgentSessionSourceRuntimeIngestionSummary;
  artifactReadinessSummary: AgentSessionArtifactReadinessSummary;
  treatmentOutcomeReadinessSummary: AgentSessionTreatmentOutcomeReadinessSummary;
  promotionGateSummary: AgentSessionPromotionGateSummary;
}): FoundationLayerAudit {
  const {
    result,
    workspaceOrchestration,
    runtimeQualitySummary,
    voiceRuntimeSummary,
    voiceReadinessSummary,
    auditSummary,
    memoryAuditSummary,
    sourceRuntimeIngestionSummary,
    artifactReadinessSummary,
    treatmentOutcomeReadinessSummary,
    promotionGateSummary
  } = input;
  const activeZoneCount = result.experiencePlan?.zones.length ?? result.answer.dynamicViewRequests.length;
  const activeTemplateLabel = result.experiencePlan?.templateId.replaceAll('-', ' ') ?? 'fallback plan';
  const layers: FoundationLayerReadiness[] = [
    {
      id: 'data-packet',
      label: 'Data Packet',
      status: result.answer.evidence.length > 0 && result.packet.dataCoverage.metricCount >= 5 ? 'solid' : 'needs_source',
      proof: `${result.packet.dataCoverage.metricCount} KPI reads · ${result.answer.evidence.length} answer evidence refs · ${result.packet.evidenceGaps.length} gaps`,
      testedBy: 'validate:data + packet builder',
      next: result.packet.evidenceGaps.length ? 'Replace demo/directional gaps with approved source-owner extracts.' : 'Keep packet contract stable.'
    },
    {
      id: 'knowledge-guardrails',
      label: 'Knowledge + Guardrails',
      status: result.answer.guardrailsApplied.length > 0 && result.packet.diagnosisTrace.primaryRule.ruleId ? 'solid' : 'gated',
      proof: `${result.packet.diagnosisTrace.primaryRule.ruleId.replaceAll('_', ' ')} · ${result.answer.guardrailsApplied.length} guardrails · ${result.evidenceSpotlight.length} claim checks`,
      testedBy: 'diagnosis rules + adversarial evals',
      next: 'Keep pricing, causality, source-truth, and portfolio caveats visible.'
    },
    {
      id: 'runtime',
      label: 'Unified Runtime',
      status: result.runtimeVersion === 'agent-runtime-v1' && runtimeQualitySummary.checkStatusCounts.blocked === 0 ? 'solid' : 'gated',
      proof: `${result.runtimeVersion} · ${runtimeQualitySummary.checkStatusCounts.pass} passing checks · ${runtimeQualitySummary.checkStatusCounts.blocked} blocked checks`,
      testedBy: '/api/agent, stream, chat, fallback evals',
      next: 'Promote no surface until the runtime-surface protocol clears review.'
    },
    {
      id: 'experience-plan',
      label: 'ExperiencePlan Workspaces',
      status: workspaceOrchestration.viewContinuity.approvedViewContinuity && activeZoneCount > 0 ? 'solid' : 'gated',
      proof: `${activeTemplateLabel} · ${activeZoneCount} approved zones · ${workspaceOrchestration.viewContinuity.missingViewIds.length} missing views`,
      testedBy: 'view registry + eval:agent',
      next: 'Simplify demo sequencing around one killer workflow before adding more views.'
    },
    {
      id: 'voice',
      label: 'Voice Readiness',
      status: voiceRuntimeSummary.typedFallbackAvailable && voiceReadinessSummary.fullVoiceEnabled === false ? 'poc_ready' : 'gated',
      proof: `push-to-talk ${voiceRuntimeSummary.pushToTalkReady ? 'ready' : 'waiting'} · typed fallback ${voiceRuntimeSummary.typedFallbackAvailable ? 'ready' : 'waiting'} · full voice gated`,
      testedBy: 'voice manifests + browser fallback QA',
      next: 'Realtime voice, TTS, wake word, and interruption stay gated until policy and provider parity clear.'
    },
    {
      id: 'memory-audit',
      label: 'Memory + Audit',
      status: auditSummary.records > 0 && auditSummary.auditExportEnabled === false ? 'poc_ready' : 'gated',
      proof: `${memoryAuditSummary.memory.accepted} accepted · ${memoryAuditSummary.memory.suggested} suggested · ${auditSummary.records} audit records`,
      testedBy: 'local ledger + review workflow evals',
      next: 'Enterprise identity, retention, database persistence, and canonical memory remain blocked.'
    },
    {
      id: 'source-governance',
      label: 'Source Governance',
      status: sourceRuntimeIngestionSummary.readyToWireDefaultRuntimeSource ? 'poc_ready' : 'needs_source',
      proof: `${sourceRuntimeIngestionSummary.loadedFileKinds.length}/${sourceRuntimeIngestionSummary.requiredFileKinds.length} source-owner files · canonical ${sourceRuntimeIngestionSummary.canonicalUseEnabled ? 'enabled' : 'blocked'}`,
      testedBy: 'file-drop audits + source overreach evals',
      next: 'Wait for approved source-owner files before wiring default runtime source consumption.'
    },
    {
      id: 'artifacts',
      label: 'Artifacts + Learning',
      status: artifactReadinessSummary.artifactExportEnabled === false && treatmentOutcomeReadinessSummary.outcomeLearningEnabled === false ? 'poc_ready' : 'gated',
      proof: `${artifactReadinessSummary.artifacts.total} artifacts · export blocked · outcome learning ${treatmentOutcomeReadinessSummary.outcomeLearningEnabled ? 'enabled' : 'blocked'}`,
      testedBy: 'artifact, pilot-learning, treatment-outcome evals',
      next: 'Keep QBR/brief/meeting outputs review-only until stakeholder language and export gates clear.'
    }
  ];
  const solidLayerCount = layers.filter((layer) => layer.status === 'solid').length;
  const pocReadyLayerCount = layers.filter((layer) => layer.status === 'solid' || layer.status === 'poc_ready').length;
  const gatedLayerCount = layers.filter((layer) => layer.status === 'gated' || layer.status === 'needs_source').length;

  return {
    verdict: gatedLayerCount > 0 ? 'foundation POC-ready, production gated' : 'foundation ready for pilot review',
    solidLayerCount,
    pocReadyLayerCount,
    gatedLayerCount,
    gatedLayerText: gatedLayerCount === 1 ? '1 layer remains' : `${gatedLayerCount} layers remain`,
    productionLabel: promotionGateSummary.productionReady ? 'production ready' : 'production blocked',
    experienceGap: 'Jarvis/Trillion experience layer still needs simplification, natural turn-taking, and approved voice promotion.',
    layers
  };
}
