import { NextRequest, NextResponse } from 'next/server';
import {
  extractSourceClaims,
  listSourceClaims,
  reviewSourceClaim
} from '@/src/lib/intelligence/server-source-claim-store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const result = listSourceClaims({
    brandId: req.nextUrl.searchParams.get('brandId'),
    status: req.nextUrl.searchParams.get('status')
  });
  return NextResponse.json({
    ok: true,
    ...result
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const records = extractSourceClaims({
      brandId: body.brandId,
      sourceText: body.sourceText,
      sourceLabel: body.sourceLabel,
      sourceOwner: body.sourceOwner,
      sourceDate: body.sourceDate,
      warnings: body.warnings
    });
    return NextResponse.json({
      ok: true,
      records,
      canonicalFactEnabled: false,
      runtimeAutoConsumption: false
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Source claim extraction failed.'
    }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const record = reviewSourceClaim({
      id: body.id,
      decision: body.decision,
      note: body.note,
      claim: body.claim
    });
    return NextResponse.json({
      ok: true,
      record,
      canonicalFactEnabled: false,
      runtimeAutoConsumption: false
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Source claim review failed.'
    }, { status: 400 });
  }
}
