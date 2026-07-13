import { NextRequest, NextResponse } from 'next/server';
import { generateExecutiveSummary } from '@/src/lib/llm';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const summary = await generateExecutiveSummary({
    brandId: String(body.brandId ?? ''),
    category: String(body.category ?? ''),
    mode: String(body.mode ?? 'brand'),
    personaId: String(body.personaId ?? 'brand_doctor')
  });

  return NextResponse.json(summary);
}
