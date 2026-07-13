import { NextRequest, NextResponse } from 'next/server';
import {
  listSourcePromotions,
  recordSourcePromotion
} from '@/src/lib/intelligence/server-source-promotion-store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const result = listSourcePromotions({
    brandId: req.nextUrl.searchParams.get('brandId'),
    kind: req.nextUrl.searchParams.get('kind')
  });
  return NextResponse.json({
    ok: true,
    ...result
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = recordSourcePromotion({
      kind: body.kind,
      brandId: body.brandId,
      packet: body.packet,
      validationSummary: body.validationSummary,
      warnings: body.warnings
    });
    return NextResponse.json({
      ok: true,
      record,
      canonicalWriteEnabled: false
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Source promotion failed.'
    }, { status: 400 });
  }
}
