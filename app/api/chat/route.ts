import { NextRequest, NextResponse } from 'next/server';
import { answerWithBrandDoctorLlm } from '@/src/lib/llm';
import { runAgentTurn } from '@/src/lib/intelligence/agent-runtime';
import { acceptedMemoryForSession, durableSessionToPersistence, persistAgentTurn } from '@/src/lib/intelligence/server-session-store';
import { scanBrandStrategicContextRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-brand-strategic-context-file-drop-audit';
import { scanMomentumRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-momentum-file-drop-audit';
import { listSourceClaims } from '@/src/lib/intelligence/server-source-claim-store';
import { listSourcePromotions } from '@/src/lib/intelligence/server-source-promotion-store';

function runtimeSurfaceIdFor(body: Record<string, unknown>) {
  if (typeof body.runtimeSurfaceId === 'string') return body.runtimeSurfaceId;
  if (typeof body.sessionId === 'string') {
    if (body.sessionId.includes('brand-report-chat-')) return 'report-dialog-governed';
    if (body.sessionId.includes('brand-conversation-')) return 'brand-conversation-governed';
    if (body.sessionId.includes('live-consult-fallback')) return 'live-consult-governed-fallback';
  }
  return 'api-chat-explicit-skill-router';
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const useSkillRouter = process.env.AGENT_SKILL_ROUTER === 'enabled' || body.useSkillRouter === true;
  if (useSkillRouter) {
    const brandId = String(body.brandId ?? '');
    const sourcePromotionCandidates = listSourcePromotions({ brandId }).records;
    const sourceClaimCandidates = listSourceClaims({ brandId }).records;
    const baseResult = runAgentTurn({
      question: String(body.question ?? ''),
      brandId,
      runtimeSurfaceId: runtimeSurfaceIdFor(body),
      audienceMode: String(body.mode ?? '') === 'brand' ? 'brand_manager' : 'insights_lead',
      preferredSkillId: typeof body.preferredSkillId === 'string' ? body.preferredSkillId : undefined,
      activeViewId: typeof body.activeVisual === 'string' ? body.activeVisual : undefined,
      acceptedMemory: typeof body.sessionId === 'string' ? acceptedMemoryForSession(body.sessionId, brandId) : [],
      sourcePromotionCandidates,
      sourceClaimCandidates,
      momentumRuntimeSourceFileDropAudit: scanMomentumRuntimeSourceFileDropAudit(),
      strategicContextRuntimeSourceFileDropAudit: scanBrandStrategicContextRuntimeSourceFileDropAudit()
    });
    const result = typeof body.sessionId === 'string'
      ? {
          ...baseResult,
          persistence: durableSessionToPersistence(persistAgentTurn(body.sessionId, baseResult), baseResult)
        }
      : baseResult;

    return NextResponse.json({
      answer: result.markdown,
      source: 'skill_router',
      model: null,
      turnId: result.turnId,
      runtimeVersion: result.runtimeVersion,
      skill: result.routedSkillId,
      packet: result.packet,
      dynamicViewRequests: result.answer.dynamicViewRequests,
      experiencePlan: result.experiencePlan,
      sourcePromotionContext: result.sourcePromotionContext,
      sourceClaimContext: result.sourceClaimContext,
      evidenceSpotlight: result.evidenceSpotlight,
      events: result.events,
      audit: result.audit,
      memory: result.memory,
      acceptedMemory: result.acceptedMemory,
      confirmationGates: result.confirmationGates,
      workingContextManifest: result.workingContextManifest,
      sourceGovernanceManifest: result.sourceGovernanceManifest,
      persistenceReadinessManifest: result.persistenceReadinessManifest,
      reviewIdentityManifest: result.reviewIdentityManifest,
      proactivityManifest: result.proactivityManifest,
      pilotLearningManifest: result.pilotLearningManifest,
      treatmentOutcomeReadinessManifest: result.treatmentOutcomeReadinessManifest,
      canvasStateManifest: result.canvasStateManifest,
      experienceArchitectureManifest: result.experienceArchitectureManifest,
      interruptionRecoveryManifest: result.interruptionRecoveryManifest,
      reasoningStatusManifest: result.reasoningStatusManifest,
      conversationPresenceManifest: result.conversationPresenceManifest,
      providerAdapterManifest: result.providerAdapterManifest,
      voiceSkillViewContractManifest: result.voiceSkillViewContractManifest,
      voiceOrchestrationReadinessManifest: result.voiceOrchestrationReadinessManifest,
      runtimeControlManifest: result.runtimeControlManifest,
      runtimeSurfaceManifest: result.runtimeSurfaceManifest,
      runtimeQualityChecks: result.runtimeQualityChecks,
      persistence: result.persistence,
      capabilities: result.capabilities,
      voicePolicy: result.voicePolicy,
      voiceRuntimeManifest: result.voiceRuntimeManifest,
      evidence: result.answer.evidence,
      missingEvidence: result.answer.missingEvidence
    });
  }

  const result = await answerWithBrandDoctorLlm({
    question: String(body.question ?? ''),
    brandId: String(body.brandId ?? ''),
    category: String(body.category ?? ''),
    mode: String(body.mode ?? 'brand'),
    activeVisual: String(body.activeVisual ?? 'brand_health_panel'),
    personaId: String(body.personaId ?? 'brand_doctor'),
    conversationMode: String(body.conversationMode ?? 'explore'),
    mentalAvailabilitySourcePacket: body.mentalAvailabilitySourcePacket
  });

  return NextResponse.json(result);
}
