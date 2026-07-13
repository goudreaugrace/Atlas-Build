import { NextRequest, NextResponse } from 'next/server';
import {
  appendAssistantTranscriptRecord,
  listAssistantTranscriptRecords
} from '@/src/lib/intelligence/server-assistant-transcript-store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;
  return NextResponse.json({
    ok: true,
    ...listAssistantTranscriptRecords({
      brandId: req.nextUrl.searchParams.get('brandId'),
      sessionId: req.nextUrl.searchParams.get('sessionId'),
      limit
    })
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = appendAssistantTranscriptRecord(body && typeof body === 'object' ? body as Record<string, unknown> : {});
    return NextResponse.json({
      ok: true,
      record
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Assistant transcript append failed.'
    }, { status: 400 });
  }
}
