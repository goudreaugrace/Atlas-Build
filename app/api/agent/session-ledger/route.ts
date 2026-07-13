import { NextRequest, NextResponse } from 'next/server';
import { durableSessionToResponse, getDurableSession, mergeDurableSession } from '@/src/lib/intelligence/server-session-store';
import { parseSessionLedger } from '@/src/lib/intelligence/session-ledger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const session = getDurableSession(sessionId);
  return NextResponse.json({
    ok: true,
    session: durableSessionToResponse(session)
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = mergeDurableSession(body.sessionId, parseSessionLedger(JSON.stringify(body.ledger ?? null)));
  return NextResponse.json({
    ok: true,
    session: durableSessionToResponse(session)
  });
}
