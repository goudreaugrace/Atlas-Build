import { brandRecords } from '@/src/lib/data';
import type { BrandHealthRecord } from '@/src/types/domain';
import type {
  MomentumIntelligenceSourcePacket,
  MomentumPeerSet,
  MomentumSourceExtractKind,
  MomentumSourceExtractPacket,
  MomentumSourceOwnerFile,
  MomentumSourceOwnerFileKind
} from '@/src/lib/intelligence/types';

function numberOrNull(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function roundOne(value: number | null) {
  return value === null ? null : Math.round(value * 10) / 10;
}

function hasSourceContent(extract: MomentumSourceExtractPacket) {
  return Boolean(
    extract.marketContext
    || extract.peerSet
    || extract.roomToGrowInputs
    || extract.smdContributionWeights
    || extract.trendEvidence
  );
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function latestDate(extracts: MomentumSourceExtractPacket[]) {
  return extracts
    .map((extract) => extract.sourceDate)
    .filter(Boolean)
    .sort()
    .at(-1) ?? new Date().toISOString().slice(0, 10);
}

function extractKindForSourceFile(fileKind: MomentumSourceOwnerFileKind): MomentumSourceExtractKind {
  if (fileKind === 'market_share_penetration_file') return 'market_share_penetration';
  if (fileKind === 'bbe_contribution_weight_file') return 'bbe_contribution_weight';
  return 'bbe_movement_significance';
}

export function buildMomentumSourceExtractsFromSourceOwnerFiles(
  files: MomentumSourceOwnerFile[] = []
): MomentumSourceExtractPacket[] {
  return files.flatMap((file) => {
    const extractKind = extractKindForSourceFile(file.fileKind);
    return file.rows
      .map((row) => {
        const rowCaveats = row.caveats ?? [];
        return {
          brandId: row.brandId,
          extractKind,
          sourceLabel: `${file.sourceLabel} - ${row.brandId}`,
          sourceOwner: file.sourceOwner,
          sourceDate: file.sourceDate,
          reviewStatus: file.reviewStatus,
          marketContext: extractKind === 'market_share_penetration' ? row.marketContext ?? null : null,
          peerSet: extractKind === 'market_share_penetration' ? row.peerSet ?? null : null,
          roomToGrowInputs: extractKind === 'market_share_penetration' ? row.roomToGrowInputs ?? null : null,
          smdContributionWeights: extractKind === 'bbe_contribution_weight' ? row.smdContributionWeights ?? null : null,
          trendEvidence: extractKind === 'bbe_movement_significance' ? row.trendEvidence ?? null : null,
          caveats: uniqueValues([
            ...file.caveats,
            ...rowCaveats,
            file.reviewStatus === 'approved_source'
              ? 'Mapped from an approved source-owner file; preserve source-owner review, caveats, and promotion gates.'
              : 'Mapped from a non-approved source-owner file; keep as prototype/review context only.'
          ])
        };
      })
      .filter(hasSourceContent);
  });
}

export function mergeMomentumSourceExtracts(
  record: BrandHealthRecord,
  extracts: MomentumSourceExtractPacket[] = []
): MomentumSourceExtractPacket | undefined {
  const matchingExtracts = extracts.filter((extract) => extract.brandId === record.brandId && hasSourceContent(extract));
  if (!matchingExtracts.length) return undefined;
  if (matchingExtracts.length === 1) return matchingExtracts[0];

  const marketExtract = matchingExtracts.find((extract) => extract.marketContext || extract.peerSet || extract.roomToGrowInputs);
  const contributionExtract = matchingExtracts.find((extract) => extract.smdContributionWeights);
  const movementExtract = matchingExtracts.find((extract) => extract.trendEvidence);
  const allApproved = matchingExtracts.every((extract) => extract.reviewStatus === 'approved_source');
  const firstLabel = matchingExtracts[0].sourceLabel;

  return {
    brandId: record.brandId,
    extractKind: 'merged_source_owner_bundle',
    sourceLabel: `${firstLabel} + ${matchingExtracts.length - 1} source-owner block${matchingExtracts.length === 2 ? '' : 's'}`,
    sourceOwner: uniqueValues(matchingExtracts.map((extract) => extract.sourceOwner)).join('; '),
    sourceDate: latestDate(matchingExtracts),
    reviewStatus: allApproved ? 'approved_source' : 'reviewed_for_prototype',
    marketContext: marketExtract?.marketContext ?? null,
    peerSet: marketExtract?.peerSet ?? null,
    roomToGrowInputs: marketExtract?.roomToGrowInputs ?? null,
    smdContributionWeights: contributionExtract?.smdContributionWeights ?? null,
    trendEvidence: movementExtract?.trendEvidence ?? null,
    caveats: [
      allApproved
        ? 'Merged from multiple approved source-owner extract blocks; preserve block-level caveats and human review.'
        : 'Merged from multiple source-owner extract blocks with at least one prototype-reviewed block; do not present as official PepsiCo source truth.',
      'Each source block remains independently governed by the Momentum source-owner handoff requirements.',
      ...uniqueValues(matchingExtracts.flatMap((extract) => extract.caveats))
    ]
  };
}

export function buildMomentumSourceFromSourceExtract(
  record: BrandHealthRecord,
  extract?: MomentumSourceExtractPacket
): MomentumIntelligenceSourcePacket | undefined {
  if (!extract) return undefined;
  if (extract.brandId !== record.brandId) return undefined;
  if (!hasSourceContent(extract)) return undefined;

  const reviewCaveat = extract.reviewStatus === 'approved_source'
    ? 'Source extract is marked approved_source; still preserve metric-level caveats and source-period compatibility.'
    : 'Source extract is reviewed for prototype use only; do not present it as official PepsiCo source truth.';

  return {
    brandId: record.brandId,
    sourceLabel: extract.sourceLabel,
    sourceOwner: extract.sourceOwner,
    sourceDate: extract.sourceDate,
    evidenceMode: extract.reviewStatus === 'approved_source' ? 'measured_partial_extract' : 'prototype_reviewed_partial',
    marketContext: extract.marketContext ?? null,
    peerSet: extract.peerSet ?? null,
    roomToGrowInputs: {
      penetrationHeadroom: extract.roomToGrowInputs?.penetrationHeadroom ?? null,
      demandPowerShareVsMarketShareGap: extract.roomToGrowInputs?.demandPowerShareVsMarketShareGap ?? null,
      categoryGrowth: extract.roomToGrowInputs?.categoryGrowth ?? null
    },
    smdContributionWeights: extract.smdContributionWeights ?? null,
    trendEvidence: extract.trendEvidence ?? null,
    caveats: [
      reviewCaveat,
      'This adapter maps source-owner extract fields into the governed Momentum Intelligence packet contract; missing source fields remain visible gaps.',
      ...extract.caveats
    ]
  };
}

export function buildMomentumSourceFromSourceExtracts(
  record: BrandHealthRecord,
  extracts: MomentumSourceExtractPacket[] = []
): MomentumIntelligenceSourcePacket | undefined {
  return buildMomentumSourceFromSourceExtract(record, mergeMomentumSourceExtracts(record, extracts));
}

function measuredGnPeers(record: BrandHealthRecord): MomentumPeerSet | null {
  const peers = brandRecords
    .filter((peer) => peer.brandId !== record.brandId)
    .filter((peer) => peer.category === record.category)
    .filter((peer) => peer.growthNavigator?.evidenceMode === 'measured_full_extract' || peer.growthNavigator?.evidenceMode === 'measured_partial_extract')
    .slice(0, 8);

  if (!peers.length) return null;

  return {
    peerSetId: `${record.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-measured-gn-peers`,
    label: `${record.category} brands with measured Growth Navigator context`,
    brandIds: peers.map((peer) => peer.brandId),
    peerCount: peers.length,
    selectionBasis: 'Auto-derived from demo Brand Health Records in the same category with measured full or measured partial Growth Navigator evidence.',
    caveats: [
      'This peer set is adapter-derived from available measured Growth Navigator records and should be reviewed before executive circulation.',
      'Do not infer cannibalization, portfolio migration, or occasion substitution from this peer set.'
    ]
  };
}

export function buildMeasuredMomentumSourceFromGrowthNavigator(
  record: BrandHealthRecord
): MomentumIntelligenceSourcePacket | undefined {
  const growthNavigator = record.growthNavigator;
  if (!growthNavigator) return undefined;
  if (growthNavigator.evidenceMode !== 'measured_full_extract' && growthNavigator.evidenceMode !== 'measured_partial_extract') return undefined;

  const qualityGrowth = growthNavigator.qualityGrowth ?? {};
  const brandPenetration = numberOrNull(qualityGrowth.brandPenetration);
  const categoryPenetration = numberOrNull(qualityGrowth.categoryPenetration);
  const valueShare = numberOrNull(qualityGrowth.valueShare);
  const categoryGrowth = numberOrNull(qualityGrowth.categoryValueGrowth);
  const demandPowerShare = numberOrNull(record.powerShare);
  const penetrationHeadroom = brandPenetration !== null && categoryPenetration !== null
    ? Math.max(0, categoryPenetration - brandPenetration)
    : null;
  const demandPowerShareVsMarketShareGap = demandPowerShare !== null && valueShare !== null
    ? demandPowerShare - valueShare
    : null;

  return {
    brandId: record.brandId,
    sourceLabel: `Measured Growth Navigator adapter - ${record.brandName}`,
    sourceOwner: 'Growth Navigator extract adapter',
    sourceDate: '2026-06-28',
    evidenceMode: 'measured_partial_extract',
    marketContext: {
      market: `${record.country} ${growthNavigator.categoryLens}`,
      category: growthNavigator.categoryLens,
      geography: record.country,
      period: record.period,
      categoryGrowth,
      categoryGrowthUnit: categoryGrowth === null ? 'not_available' : 'percent',
      maturity: categoryGrowth === null ? 'unknown' : categoryGrowth >= 3 ? 'growing' : categoryGrowth >= 0 ? 'mature' : 'declining'
    },
    peerSet: measuredGnPeers(record),
    roomToGrowInputs: {
      penetrationHeadroom: roundOne(penetrationHeadroom),
      demandPowerShareVsMarketShareGap: roundOne(demandPowerShareVsMarketShareGap),
      categoryGrowth
    },
    smdContributionWeights: null,
    caveats: [
      `Derived from ${growthNavigator.evidenceMode.replaceAll('_', ' ')} Growth Navigator context, not from a full Momentum Intelligence source packet.`,
      'Room-to-grow fields are only populated where the source record has penetration, share, and category growth inputs.',
      'SMD contribution weights are not inferred by this adapter and remain a separate source requirement.',
      ...(growthNavigator.provenanceNotes ?? [])
    ]
  };
}
