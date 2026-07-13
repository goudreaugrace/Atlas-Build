import { NextRequest, NextResponse } from 'next/server';
import {
  buildValidatedCmoReviewAssetSpec,
  executiveIntelligenceAssetPageModuleRegistry
} from '@/src/lib/intelligence/executive-intelligence-asset-spec';
import { buildBrandIntelligencePacket } from '@/src/lib/intelligence/kernel';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get('brandId') ?? 'lay-s';
  const assetType = req.nextUrl.searchParams.get('assetType') ?? 'cmo-review';

  if (assetType !== 'cmo-review') {
    return NextResponse.json({
      ok: false,
      error: `Unsupported executive asset type: ${assetType}`,
      supportedAssetTypes: ['cmo-review']
    }, { status: 400 });
  }

  try {
    const packet = buildBrandIntelligencePacket(brandId);
    const { spec, validation } = buildValidatedCmoReviewAssetSpec(packet);
    return NextResponse.json({
      ok: validation.status !== 'fail',
      assetType,
      registryId: executiveIntelligenceAssetPageModuleRegistry.id,
      registryLastReviewed: executiveIntelligenceAssetPageModuleRegistry.lastReviewed,
      spec,
      validation,
      circulation: {
        reviewState: spec.reviewState,
        exportState: spec.exportState,
        copyEnabled: false,
        exportEnabled: false,
        circulationEnabled: false
      }
    }, { status: validation.status === 'fail' ? 422 : 200 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Executive asset spec build failed.'
    }, { status: 400 });
  }
}
