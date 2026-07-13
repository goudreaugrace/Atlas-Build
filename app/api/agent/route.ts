import { NextRequest, NextResponse } from 'next/server';
import { runAgentTurn } from '@/src/lib/intelligence/agent-runtime';
import { acceptedMemoryForSession, durableSessionToPersistence, persistAgentTurn } from '@/src/lib/intelligence/server-session-store';
import { scanBrandStrategicContextRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-brand-strategic-context-file-drop-audit';
import { scanMomentumRuntimeSourceFileDropAudit } from '@/src/lib/intelligence/server-momentum-file-drop-audit';
import { listSourceClaims } from '@/src/lib/intelligence/server-source-claim-store';
import { listSourcePromotions } from '@/src/lib/intelligence/server-source-promotion-store';
import type { ExperienceAudience, ExperienceObjective } from '@/src/lib/intelligence/types';

export const runtime = 'nodejs';

const experienceAudiences: ExperienceAudience[] = ['executive', 'marketer', 'insights_lead', 'learner', 'agency', 'specialist'];
const experienceObjectives: ExperienceObjective[] = ['diagnose', 'decide', 'teach', 'challenge', 'compare', 'package', 'monitor', 'research'];

function optionalAudience(value: unknown): ExperienceAudience | undefined {
  return typeof value === 'string' && experienceAudiences.includes(value as ExperienceAudience)
    ? value as ExperienceAudience
    : undefined;
}

function optionalObjective(value: unknown): ExperienceObjective | undefined {
  return typeof value === 'string' && experienceObjectives.includes(value as ExperienceObjective)
    ? value as ExperienceObjective
    : undefined;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const brandId = String(body.brandId ?? '');
  const acceptedMemory = typeof body.sessionId === 'string'
    ? acceptedMemoryForSession(body.sessionId, brandId)
    : [];
  const sourcePromotionCandidates = listSourcePromotions({ brandId }).records;
  const sourceClaimCandidates = listSourceClaims({ brandId }).records;
  const baseResult = runAgentTurn({
    brandId,
    question: String(body.question ?? ''),
    runtimeSurfaceId: typeof body.runtimeSurfaceId === 'string' ? body.runtimeSurfaceId : 'api-agent-json',
    audienceMode: body.audienceMode === 'brand_manager' ? 'brand_manager' : 'insights_lead',
    experienceAudience: optionalAudience(body.experienceAudience),
    experienceObjective: optionalObjective(body.experienceObjective),
    preferredExperienceTemplateId: typeof body.preferredExperienceTemplateId === 'string' ? body.preferredExperienceTemplateId : undefined,
    preferredSkillId: typeof body.preferredSkillId === 'string' ? body.preferredSkillId : undefined,
    activeViewId: typeof body.activeViewId === 'string' ? body.activeViewId : undefined,
    acceptedMemory,
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

  return NextResponse.json(result);
}
