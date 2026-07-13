import { NextRequest, NextResponse } from 'next/server';
import { durableSessionToResponse, reviewDurableSessionItem } from '@/src/lib/intelligence/server-session-store';
import type { AgentReviewDecision, AgentReviewItemType } from '@/src/lib/intelligence/types';

export const runtime = 'nodejs';

const itemTypes: AgentReviewItemType[] = ['memory', 'artifact', 'confirmation_gate'];
const decisions: AgentReviewDecision[] = ['accepted', 'rejected', 'edited', 'approved', 'dismissed'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!itemTypes.includes(body.itemType)) {
      return NextResponse.json({ ok: false, error: 'Unsupported review item type.' }, { status: 400 });
    }
    if (!decisions.includes(body.decision)) {
      return NextResponse.json({ ok: false, error: 'Unsupported review decision.' }, { status: 400 });
    }
    if (typeof body.itemId !== 'string' || !body.itemId.trim()) {
      return NextResponse.json({ ok: false, error: 'Review itemId is required.' }, { status: 400 });
    }
    const session = reviewDurableSessionItem({
      sessionId: body.sessionId,
      itemType: body.itemType,
      itemId: body.itemId,
      decision: body.decision,
      note: typeof body.note === 'string' ? body.note : null,
      editedLabel: typeof body.editedLabel === 'string' ? body.editedLabel : undefined,
      editedDetail: typeof body.editedDetail === 'string' ? body.editedDetail : undefined
    });
    return NextResponse.json({ ok: true, session: durableSessionToResponse(session) });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Review action failed.'
    }, { status: 400 });
  }
}
