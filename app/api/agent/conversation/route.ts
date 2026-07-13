import { NextRequest, NextResponse } from 'next/server';
import { runAgentTurn } from '@/src/lib/intelligence/agent-runtime';
import { composeConversationAnswer, decideConversationMode } from '@/src/lib/intelligence/conversation-orchestrator';
import { acceptedMemoryForSession, durableSessionToPersistence, persistAgentTurn } from '@/src/lib/intelligence/server-session-store';
import { scanBrandStrategicContextRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-brand-strategic-context-file-drop-audit';
import { scanMomentumRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-momentum-file-drop-audit';
import { listSourceClaims } from '@/src/lib/intelligence/server-source-claim-store';
import { listSourcePromotions } from '@/src/lib/intelligence/server-source-promotion-store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const brandId = String(body.brandId ?? '');
  const question = String(body.question ?? '');
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined;
  const sourcePromotionCandidates = listSourcePromotions({ brandId }).records;
  const sourceClaimCandidates = listSourceClaims({ brandId }).records;
  const baseTurn = runAgentTurn({
    brandId,
    question,
    runtimeSurfaceId: typeof body.runtimeSurfaceId === 'string' ? body.runtimeSurfaceId : 'agent-lab-conversation',
    audienceMode: body.audienceMode === 'brand_manager' ? 'brand_manager' : 'insights_lead',
    acceptedMemory: sessionId ? acceptedMemoryForSession(sessionId, brandId) : [],
    sourcePromotionCandidates,
    sourceClaimCandidates,
    momentumRuntimeSourceFileDropAudit: scanMomentumRuntimeSourceFileDropAudit(),
    strategicContextRuntimeSourceFileDropAudit: scanBrandStrategicContextRuntimeSourceFileDropAudit()
  });
  const decision = decideConversationMode(question, baseTurn);
  const turn = sessionId
    ? {
        ...baseTurn,
        persistence: durableSessionToPersistence(persistAgentTurn(sessionId, baseTurn), baseTurn)
      }
    : baseTurn;
  const composedAnswer = await composeConversationAnswer(question, decision, turn, {
    forceDeterministic: body.forceDeterministicComposer === true
  });

  return NextResponse.json({
    ok: true,
    question,
    brandId,
    decision,
    turn,
    composedAnswer
  });
}
