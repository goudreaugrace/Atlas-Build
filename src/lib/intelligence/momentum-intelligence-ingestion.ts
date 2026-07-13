import type {
  BrandIntelligencePacket,
  MomentumIntelligenceSourcePacket,
  MomentumMarketContext,
  MomentumPeerSet,
  MomentumSmdContributionWeights,
  MomentumSourceExtractPacket,
  MomentumSourceExtractReviewStatus,
  MomentumSourceEvidenceMode,
  MomentumSourceOwnerFile,
  MomentumSourceOwnerFileKind,
  MomentumTrendContext,
  MomentumTrendDirection,
  MomentumTrendEvidencePacket,
  MomentumTrendMetricRead,
  MomentumTrendSignificance
} from '@/src/lib/intelligence/types';
import {
  buildMomentumSourceExtractsFromSourceOwnerFiles,
  buildMomentumSourceFromSourceExtract,
  buildMomentumSourceFromSourceExtracts
} from '@/src/lib/intelligence/momentum-source-adapters';
import type { BrandHealthRecord } from '@/src/types/domain';

const STORAGE_PREFIX = 'bbe:momentum-intelligence:versions:';

export type MomentumIntelligenceAcceptedVersion = {
  versionId: string;
  brandId: string;
  acceptedAt: string;
  acceptedBy: string;
  packet: MomentumIntelligenceSourcePacket;
  validation: {
    warnings: string[];
    summary: string;
  };
};

export type MomentumIntelligenceImportResult = {
  ok: boolean;
  packet: MomentumIntelligenceSourcePacket | null;
  errors: string[];
  warnings: string[];
  summary: string;
};

export type MomentumIntelligenceImpactPreview = {
  sourceChange: string;
  coverageChanges: string[];
  roomToGrowChange: string;
  smdWeightChange: string;
  remainingGaps: string[];
  guardrails: string[];
};

function nowVersionId() {
  return `mi-${Date.now().toString(36)}`;
}

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function listValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('|').map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeEvidenceMode(value: unknown): MomentumSourceEvidenceMode {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (
    normalized === 'measured_partial_extract'
    || normalized === 'prototype_reviewed_partial'
    || normalized === 'directional_stakeholder_input'
    || normalized === 'missing'
  ) {
    return normalized;
  }
  return 'directional_stakeholder_input';
}

function normalizeSourceExtractReviewStatus(value: unknown): MomentumSourceExtractReviewStatus {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (normalized === 'approved_source' || normalized === 'reviewed_for_prototype') return normalized;
  return 'reviewed_for_prototype';
}

function normalizeSourceExtractKind(value: unknown): MomentumSourceExtractPacket['extractKind'] {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (
    normalized === 'combined_momentum_source'
    || normalized === 'market_share_penetration'
    || normalized === 'bbe_contribution_weight'
    || normalized === 'bbe_movement_significance'
    || normalized === 'merged_source_owner_bundle'
  ) {
    return normalized;
  }
  return undefined;
}

function normalizeSourceOwnerFileKind(value: unknown): MomentumSourceOwnerFileKind | null {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (
    normalized === 'market_share_penetration_file'
    || normalized === 'bbe_contribution_weight_file'
    || normalized === 'bbe_movement_significance_file'
  ) {
    return normalized;
  }
  return null;
}

function normalizeCategoryGrowthUnit(value: unknown): MomentumMarketContext['categoryGrowthUnit'] {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'percent' || normalized === 'index' || normalized === 'not_available') return normalized;
  return 'percent';
}

function normalizeMaturity(value: unknown): MomentumMarketContext['maturity'] {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'emerging' || normalized === 'growing' || normalized === 'mature' || normalized === 'declining' || normalized === 'unknown') {
    return normalized;
  }
  return 'unknown';
}

function normalizeMarketContext(input: unknown, record: BrandHealthRecord): MomentumMarketContext | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  return {
    market: safeString(raw.market, `${record.country} ${record.category}`),
    category: safeString(raw.category, record.category),
    geography: safeString(raw.geography, record.country),
    period: safeString(raw.period, record.period),
    categoryGrowth: numberOrNull(raw.categoryGrowth),
    categoryGrowthUnit: normalizeCategoryGrowthUnit(raw.categoryGrowthUnit),
    maturity: normalizeMaturity(raw.maturity)
  };
}

function normalizePeerSet(input: unknown): MomentumPeerSet | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const brandIds = listValue(raw.brandIds);
  return {
    peerSetId: safeString(raw.peerSetId, 'uploaded-peer-set'),
    label: safeString(raw.label, 'Uploaded peer set'),
    brandIds,
    peerCount: numberOrNull(raw.peerCount) ?? brandIds.length,
    selectionBasis: safeString(raw.selectionBasis, 'Uploaded peer set requires selection-basis review.'),
    caveats: listValue(raw.caveats)
  };
}

function normalizeSmdWeights(input: unknown): MomentumSmdContributionWeights | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  return {
    salient: numberOrNull(raw.salient) ?? 0,
    meaningful: numberOrNull(raw.meaningful) ?? 0,
    different: numberOrNull(raw.different) ?? 0,
    sourceLabel: safeString(raw.sourceLabel, 'Uploaded SMD contribution source'),
    caveats: listValue(raw.caveats)
  };
}

function normalizeTrendDirection(value: unknown): MomentumTrendDirection {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'up' || normalized === 'flat' || normalized === 'down' || normalized === 'insufficient') return normalized;
  return 'insufficient';
}

function normalizeTrendSignificance(value: unknown): MomentumTrendSignificance {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (
    normalized === 'significant_increase'
    || normalized === 'significant_decrease'
    || normalized === 'not_significant'
    || normalized === 'not_tested'
  ) {
    return normalized;
  }
  return 'not_tested';
}

function normalizeSourcePeriodCompatibility(value: unknown): MomentumTrendContext['sourcePeriodCompatibility'] {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (
    normalized === 'aligned'
    || normalized === 'directionally_comparable'
    || normalized === 'lagged'
    || normalized === 'not_comparable'
    || normalized === 'insufficient'
  ) {
    return normalized;
  }
  return 'directionally_comparable';
}

function normalizeTrendMetricRead(input: unknown, index: number, sourceLabel: string): MomentumTrendMetricRead {
  const raw = (input ?? {}) as Record<string, unknown>;
  const metric = safeString(raw.metric, `Trend metric ${index + 1}`);
  const firstValue = numberOrNull(raw.firstValue);
  const lastValue = numberOrNull(raw.lastValue);
  const suppliedDelta = numberOrNull(raw.delta);
  const delta = suppliedDelta ?? (firstValue !== null && lastValue !== null ? Math.round((lastValue - firstValue) * 10) / 10 : null);
  const direction = normalizeTrendDirection(raw.direction ?? (delta === null ? 'insufficient' : Math.abs(delta) < 1 ? 'flat' : delta > 0 ? 'up' : 'down'));
  const significance = normalizeTrendSignificance(raw.significance);
  return {
    metric,
    sourceTrendKey: safeString(raw.sourceTrendKey, metric),
    periodCount: numberOrNull(raw.periodCount) ?? 2,
    firstPeriod: safeString(raw.firstPeriod, '') || null,
    lastPeriod: safeString(raw.lastPeriod, '') || null,
    firstValue,
    lastValue,
    delta,
    direction,
    significance,
    sourceLabel: safeString(raw.sourceLabel, sourceLabel),
    caveats: listValue(raw.caveats),
    read: safeString(
      raw.read,
      delta === null
        ? `${metric} imported without enough values to calculate movement.`
        : `${metric} moved ${delta > 0 ? '+' : ''}${delta}; significance status is ${significance.replaceAll('_', ' ')}.`
    )
  };
}

function normalizeTrendEvidence(input: unknown): MomentumTrendEvidencePacket | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const sourceLabel = safeString(raw.sourceLabel, 'Uploaded Momentum trend evidence');
  const metricReads = Array.isArray(raw.metricReads)
    ? raw.metricReads.map((item, index) => normalizeTrendMetricRead(item, index, sourceLabel))
    : [];
  return {
    sourceLabel,
    sourcePeriodCompatibility: normalizeSourcePeriodCompatibility(raw.sourcePeriodCompatibility),
    metricReads,
    caveats: listValue(raw.caveats)
  };
}

function normalizePacket(input: unknown, record: BrandHealthRecord): MomentumIntelligenceSourcePacket {
  const raw = (input ?? {}) as Record<string, unknown>;
  const roomToGrowInputs = (raw.roomToGrowInputs ?? {}) as Record<string, unknown>;
  return {
    brandId: safeString(raw.brandId, record.brandId),
    sourceLabel: safeString(raw.sourceLabel, 'Uploaded Momentum Intelligence source'),
    sourceOwner: safeString(raw.sourceOwner, 'Unknown owner'),
    sourceDate: safeString(raw.sourceDate, new Date().toISOString().slice(0, 10)),
    evidenceMode: normalizeEvidenceMode(raw.evidenceMode),
    marketContext: normalizeMarketContext(raw.marketContext, record),
    peerSet: normalizePeerSet(raw.peerSet),
    roomToGrowInputs: {
      penetrationHeadroom: numberOrNull(roomToGrowInputs.penetrationHeadroom),
      demandPowerShareVsMarketShareGap: numberOrNull(roomToGrowInputs.demandPowerShareVsMarketShareGap),
      categoryGrowth: numberOrNull(roomToGrowInputs.categoryGrowth)
    },
    smdContributionWeights: normalizeSmdWeights(raw.smdContributionWeights),
    trendEvidence: normalizeTrendEvidence(raw.trendEvidence),
    caveats: listValue(raw.caveats)
  };
}

function normalizeSourceExtract(input: unknown, record: BrandHealthRecord): MomentumSourceExtractPacket {
  const raw = (input ?? {}) as Record<string, unknown>;
  const roomToGrowInputs = raw.roomToGrowInputs && typeof raw.roomToGrowInputs === 'object'
    ? raw.roomToGrowInputs as Record<string, unknown>
    : null;

  return {
    brandId: safeString(raw.brandId, record.brandId),
    extractKind: normalizeSourceExtractKind(raw.extractKind),
    sourceLabel: safeString(raw.sourceLabel, 'Uploaded Momentum source extract'),
    sourceOwner: safeString(raw.sourceOwner, 'Unknown owner'),
    sourceDate: safeString(raw.sourceDate, new Date().toISOString().slice(0, 10)),
    reviewStatus: normalizeSourceExtractReviewStatus(raw.reviewStatus),
    marketContext: normalizeMarketContext(raw.marketContext, record),
    peerSet: normalizePeerSet(raw.peerSet),
    roomToGrowInputs: roomToGrowInputs
      ? {
        penetrationHeadroom: numberOrNull(roomToGrowInputs.penetrationHeadroom),
        demandPowerShareVsMarketShareGap: numberOrNull(roomToGrowInputs.demandPowerShareVsMarketShareGap),
        categoryGrowth: numberOrNull(roomToGrowInputs.categoryGrowth)
      }
      : null,
    smdContributionWeights: normalizeSmdWeights(raw.smdContributionWeights),
    trendEvidence: normalizeTrendEvidence(raw.trendEvidence),
    caveats: listValue(raw.caveats)
  };
}

function normalizeSourceOwnerFile(input: unknown, record: BrandHealthRecord): MomentumSourceOwnerFile {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fileKind = normalizeSourceOwnerFileKind(raw.fileKind);
  const sourceLabel = safeString(raw.sourceLabel, 'Uploaded Momentum source-owner file');
  const rows = Array.isArray(raw.rows) ? raw.rows : [];

  return {
    fileKind: fileKind ?? 'market_share_penetration_file',
    sourceLabel,
    sourceOwner: safeString(raw.sourceOwner, 'Unknown owner'),
    sourceDate: safeString(raw.sourceDate, new Date().toISOString().slice(0, 10)),
    reviewStatus: normalizeSourceExtractReviewStatus(raw.reviewStatus),
    rows: rows.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const roomToGrowInputs = row.roomToGrowInputs && typeof row.roomToGrowInputs === 'object'
        ? row.roomToGrowInputs as Record<string, unknown>
        : null;
      return {
        brandId: safeString(row.brandId, record.brandId),
        marketContext: normalizeMarketContext(row.marketContext, record),
        peerSet: normalizePeerSet(row.peerSet),
        roomToGrowInputs: roomToGrowInputs
          ? {
            penetrationHeadroom: numberOrNull(roomToGrowInputs.penetrationHeadroom),
            demandPowerShareVsMarketShareGap: numberOrNull(roomToGrowInputs.demandPowerShareVsMarketShareGap),
            categoryGrowth: numberOrNull(roomToGrowInputs.categoryGrowth)
          }
          : null,
        smdContributionWeights: normalizeSmdWeights(row.smdContributionWeights),
        trendEvidence: normalizeTrendEvidence(row.trendEvidence),
        caveats: listValue(row.caveats)
      };
    }),
    caveats: listValue(raw.caveats)
  };
}

function normalizeImportToMomentumPacket(input: unknown, record: BrandHealthRecord): {
  packet: MomentumIntelligenceSourcePacket;
  importKind: 'source_packet' | 'source_extract' | 'source_extract_bundle' | 'source_owner_file_bundle';
} {
  if (Array.isArray(input)) {
    const extracts = input.map((item) => normalizeSourceExtract(item, record));
    const packet = buildMomentumSourceFromSourceExtracts(record, extracts);
    if (packet) return { packet, importKind: 'source_extract_bundle' };
  }
  const raw = (input ?? {}) as Record<string, unknown>;
  const sourceFiles = Array.isArray(raw.sourceFiles) ? raw.sourceFiles : Array.isArray(raw.files) ? raw.files : null;
  if (sourceFiles) {
    const files = sourceFiles.map((item) => normalizeSourceOwnerFile(item, record));
    const extracts = buildMomentumSourceExtractsFromSourceOwnerFiles(files);
    const packet = buildMomentumSourceFromSourceExtracts(record, extracts);
    if (packet) return { packet, importKind: 'source_owner_file_bundle' };
  }
  if (normalizeSourceOwnerFileKind(raw.fileKind)) {
    const extracts = buildMomentumSourceExtractsFromSourceOwnerFiles([normalizeSourceOwnerFile(raw, record)]);
    const packet = buildMomentumSourceFromSourceExtracts(record, extracts);
    if (packet) return { packet, importKind: 'source_owner_file_bundle' };
  }
  if ('reviewStatus' in raw && !('evidenceMode' in raw)) {
    const extract = normalizeSourceExtract(raw, record);
    const packet = buildMomentumSourceFromSourceExtract(record, extract);
    if (packet) return { packet, importKind: 'source_extract' };
  }
  return { packet: normalizePacket(input, record), importKind: 'source_packet' };
}

function hasCompleteRoomToGrow(packet: MomentumIntelligenceSourcePacket) {
  return Number.isFinite(packet.roomToGrowInputs.penetrationHeadroom)
    && Number.isFinite(packet.roomToGrowInputs.demandPowerShareVsMarketShareGap)
    && Number.isFinite(packet.roomToGrowInputs.categoryGrowth);
}

function validatePacket(packet: MomentumIntelligenceSourcePacket, record: BrandHealthRecord) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (packet.brandId !== record.brandId) errors.push(`Packet brandId ${packet.brandId} does not match active brand ${record.brandId}.`);
  if (!packet.sourceLabel) errors.push('Packet needs sourceLabel.');
  if (!packet.sourceOwner || packet.sourceOwner === 'Unknown owner') warnings.push('Source owner should be named before promotion.');
  if (!packet.sourceDate) errors.push('Packet needs sourceDate.');
  if (packet.evidenceMode === 'missing') warnings.push('Packet evidenceMode is missing; it will not close Momentum Intelligence source gaps.');
  if (packet.evidenceMode !== 'measured_partial_extract' && !packet.caveats.some((caveat) => /prototype|directional|not an official/i.test(caveat))) {
    warnings.push('Non-measured Momentum Intelligence packets should caveat prototype, directional, or non-official status.');
  }
  if (packet.evidenceMode === 'measured_partial_extract' && /prototype|simulated/i.test(packet.sourceLabel)) {
    errors.push('Measured Momentum Intelligence packets cannot use a sourceLabel that says prototype or simulated.');
  }
  if (!packet.marketContext) {
    warnings.push('Market context is missing.');
  } else {
    if (!packet.marketContext.market) errors.push('Market context needs market.');
    if (!packet.marketContext.category) errors.push('Market context needs category.');
    if (!packet.marketContext.period) errors.push('Market context needs period.');
    if (packet.marketContext.categoryGrowth === null) warnings.push('Market context categoryGrowth is missing.');
  }
  if (!packet.peerSet) {
    warnings.push('Peer-set context is missing.');
  } else {
    if (!packet.peerSet.label) errors.push('Peer set needs label.');
    if (!packet.peerSet.peerSetId) errors.push('Peer set needs peerSetId.');
    if (packet.peerSet.peerCount !== packet.peerSet.brandIds.length) warnings.push('Peer count does not match listed peer brand IDs.');
    if (packet.peerSet.brandIds.includes(record.brandId)) errors.push('Peer set should not include the active brand as its own peer.');
    if (!packet.peerSet.caveats.length) warnings.push('Peer set should include caveats.');
  }
  if (!hasCompleteRoomToGrow(packet)) warnings.push('Room-to-grow inputs are incomplete; the grid will remain partial or unavailable.');
  if (!packet.smdContributionWeights) {
    warnings.push('SMD contribution weights are missing.');
  } else {
    const weights = [
      packet.smdContributionWeights.salient,
      packet.smdContributionWeights.meaningful,
      packet.smdContributionWeights.different
    ];
    if (!weights.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) errors.push('SMD contribution weights must be numeric values from 0 to 1.');
    const total = weights.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > 0.001) errors.push('SMD contribution weights must sum to 1.');
    if (!packet.smdContributionWeights.caveats.length) warnings.push('SMD contribution weights should include caveats.');
  }
  if (packet.trendEvidence) {
    if (!packet.trendEvidence.sourceLabel) errors.push('Trend evidence needs sourceLabel.');
    if (!packet.trendEvidence.metricReads.length) errors.push('Trend evidence needs at least one metric read.');
    const seenMetrics = new Set<string>();
    for (const read of packet.trendEvidence.metricReads) {
      if (seenMetrics.has(read.metric)) errors.push(`Duplicate trend evidence metric: ${read.metric}.`);
      seenMetrics.add(read.metric);
      if (!read.firstPeriod || !read.lastPeriod) warnings.push(`${read.metric} trend evidence should include firstPeriod and lastPeriod.`);
      if (read.significance === 'not_tested') warnings.push(`${read.metric} trend evidence is not significance-tested.`);
      if (read.delta === null) warnings.push(`${read.metric} trend evidence has no movement delta.`);
    }
    if (!packet.trendEvidence.caveats.length) warnings.push('Trend evidence should include source-period and significance caveats.');
  }
  if (!packet.caveats.length) warnings.push('Packet should include caveats before promotion.');
  return { errors, warnings };
}

export function parseMomentumIntelligenceImport(
  text: string,
  record: BrandHealthRecord
): MomentumIntelligenceImportResult {
  try {
    const normalized = normalizeImportToMomentumPacket(JSON.parse(text), record);
    const packet = normalized.packet;
    const validation = validatePacket(packet, record);
    const sourceExtractWarnings = normalized.importKind === 'source_extract' || normalized.importKind === 'source_extract_bundle' || normalized.importKind === 'source_owner_file_bundle'
      ? [`${normalized.importKind === 'source_owner_file_bundle' ? 'Source-owner file bundle' : normalized.importKind === 'source_extract_bundle' ? 'Source extract bundle' : 'Source extract'} was mapped into the governed Momentum Intelligence packet contract before promotion.`]
      : [];
    return {
      ok: validation.errors.length === 0,
      packet,
      errors: validation.errors,
      warnings: [...sourceExtractWarnings, ...validation.warnings],
      summary: `${normalized.importKind === 'source_owner_file_bundle' ? 'source-owner file bundle' : normalized.importKind === 'source_extract_bundle' ? 'source extract bundle' : normalized.importKind === 'source_extract' ? 'source extract' : packet.evidenceMode.replaceAll('_', ' ')} · ${packet.marketContext?.market ?? 'market missing'} · ${packet.sourceLabel}`
    };
  } catch (error) {
    return {
      ok: false,
      packet: null,
      errors: [error instanceof Error ? error.message : 'Unable to parse Momentum Intelligence import.'],
      warnings: [],
      summary: 'Import failed.'
    };
  }
}

function valueLabel(value: number | null, suffix = '') {
  return Number.isFinite(value) ? `${value}${suffix}` : 'Missing';
}

function smdLabel(weights: MomentumSmdContributionWeights | null) {
  if (!weights) return 'Missing';
  return `S ${Math.round(weights.salient * 100)}% / M ${Math.round(weights.meaningful * 100)}% / D ${Math.round(weights.different * 100)}%`;
}

export function buildMomentumIntelligenceImpactPreview(
  current: BrandIntelligencePacket,
  result: MomentumIntelligenceImportResult
): MomentumIntelligenceImpactPreview | null {
  if (!result.packet) return null;
  const imported = result.packet;
  const importedRoom = imported.roomToGrowInputs;
  return {
    sourceChange: `${current.roomToGrow.sourceLabel ?? 'No source'} -> ${imported.sourceLabel}`,
    coverageChanges: [
      `Market context: ${current.marketContext?.market ?? 'Missing'} -> ${imported.marketContext?.market ?? 'Missing'}.`,
      `Peer set: ${current.peerSet?.label ?? 'Missing'} -> ${imported.peerSet?.label ?? 'Missing'}.`,
      `Room-to-grow inputs: ${current.dataCoverage.hasRoomToGrowInputs ? 'Loaded' : 'Missing'} -> ${hasCompleteRoomToGrow(imported) ? 'Loaded' : 'Partial or missing'}.`,
      `SMD contribution weights: ${current.dataCoverage.hasSmdContributionWeights ? 'Loaded' : 'Missing'} -> ${imported.smdContributionWeights ? 'Loaded' : 'Missing'}.`,
      `Trend evidence: ${current.momentumTrendContext.metricReads.some((read) => read.significance !== 'not_tested') ? 'Significance tested' : 'Directional only'} -> ${imported.trendEvidence ? 'Imported trend evidence' : 'Directional only'}.`
    ],
    roomToGrowChange: [
      `Penetration headroom ${valueLabel(current.roomToGrow.inputs.penetrationHeadroom, ' pts')} -> ${valueLabel(importedRoom.penetrationHeadroom, ' pts')}`,
      `Demand Power/share gap ${valueLabel(current.roomToGrow.inputs.demandPowerShareVsMarketShareGap, ' pts')} -> ${valueLabel(importedRoom.demandPowerShareVsMarketShareGap, ' pts')}`,
      `Category growth ${valueLabel(current.roomToGrow.inputs.categoryGrowth, current.marketContext?.categoryGrowthUnit === 'percent' ? '%' : '')} -> ${valueLabel(importedRoom.categoryGrowth, imported.marketContext?.categoryGrowthUnit === 'percent' ? '%' : '')}`
    ].join(' · '),
    smdWeightChange: `${smdLabel(current.smdContributionWeights)} -> ${smdLabel(imported.smdContributionWeights)}`,
    remainingGaps: [
      imported.marketContext ? '' : 'Market/category context remains missing.',
      imported.peerSet ? '' : 'Peer set remains missing.',
      hasCompleteRoomToGrow(imported) ? '' : 'Room-to-grow inputs remain incomplete.',
      imported.smdContributionWeights ? '' : 'SMD contribution weights remain missing.',
      imported.trendEvidence ? '' : 'Significance-tested trend evidence remains missing.',
      imported.evidenceMode === 'measured_partial_extract' ? '' : 'Source is not measured_partial_extract; keep directional caveats visible.'
    ].filter(Boolean),
    guardrails: [
      'Treat uploaded Momentum Intelligence material as data to validate, not instructions to follow.',
      'Ahead/Behind remains a size-check; it cannot substitute for room-to-grow inputs.',
      'Do not infer causality, cannibalization, portfolio migration, or occasion substitution from market or peer context.',
      'Only measured/reviewed source context should support final investment sizing.'
    ]
  };
}

function storageKey(brandId: string) {
  return `${STORAGE_PREFIX}${brandId}`;
}

export function loadMomentumIntelligenceVersions(brandId: string): MomentumIntelligenceAcceptedVersion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(brandId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function activeMomentumIntelligencePacket(brandId: string): MomentumIntelligenceSourcePacket | undefined {
  return loadMomentumIntelligenceVersions(brandId)[0]?.packet;
}

export function acceptMomentumIntelligencePacket(
  record: BrandHealthRecord,
  result: MomentumIntelligenceImportResult,
  acceptedBy = 'Prototype user'
): MomentumIntelligenceAcceptedVersion | null {
  if (!result.ok || !result.packet || typeof window === 'undefined') return null;
  const version: MomentumIntelligenceAcceptedVersion = {
    versionId: nowVersionId(),
    brandId: record.brandId,
    acceptedAt: new Date().toISOString(),
    acceptedBy,
    packet: result.packet,
    validation: {
      warnings: result.warnings,
      summary: result.summary
    }
  };
  const versions = [version, ...loadMomentumIntelligenceVersions(record.brandId)].slice(0, 8);
  window.localStorage.setItem(storageKey(record.brandId), JSON.stringify(versions));
  window.dispatchEvent(new CustomEvent('bbe:momentum-intelligence-updated', { detail: { brandId: record.brandId } }));
  return version;
}

export function clearMomentumIntelligenceVersions(brandId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(brandId));
  window.dispatchEvent(new CustomEvent('bbe:momentum-intelligence-updated', { detail: { brandId } }));
}
