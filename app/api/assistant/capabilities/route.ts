import { NextRequest, NextResponse } from 'next/server';
import { brandRecords } from '@/src/lib/data';
import { buildAssistantCapabilityManifest } from '@/src/lib/intelligence/assistant-capability-manifest';
import { buildBrandIntelligencePacket } from '@/src/lib/intelligence/kernel';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestedBrandId = searchParams.get('brandId') ?? '';
  const record = brandRecords.find((brand) => brand.brandId === requestedBrandId) ?? brandRecords[0];
  const packet = buildBrandIntelligencePacket(record.brandId);

  return NextResponse.json({
    ok: true,
    manifest: buildAssistantCapabilityManifest(packet)
  });
}
