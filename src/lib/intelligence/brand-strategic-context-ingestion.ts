import type {
  BrandStrategicContext,
  BrandStrategicContextReviewStatus,
  BrandStrategicContextSourcePacket,
  BrandStrategicContextSourceType
} from '@/src/lib/intelligence/types';
import type { BrandHealthRecord } from '@/src/types/domain';

const STORAGE_PREFIX = 'bbe:brand-strategic-context:versions:';

export type BrandStrategicContextAcceptedVersion = {
  versionId: string;
  brandId: string;
  acceptedAt: string;
  acceptedBy: string;
  packet: BrandStrategicContextSourcePacket;
  validation: {
    warnings: string[];
    summary: string;
  };
};

export type BrandStrategicContextImportResult = {
  ok: boolean;
  packet: BrandStrategicContextSourcePacket | null;
  errors: string[];
  warnings: string[];
  summary: string;
};

export type BrandStrategicContextImpactPreview = {
  statusChange: string;
  sourceChange: string;
  fieldChanges: string[];
  remainingGaps: string[];
  guardrails: string[];
};

function nowVersionId() {
  return `bsc-${Date.now().toString(36)}`;
}

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function listValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('|').map((item) => item.trim()).filter(Boolean);
  return [];
}

function normalizeSourceType(value: unknown): BrandStrategicContextSourceType {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (['brand_book', 'brand_dna', 'strategy_brief', 'annual_planning_doc', 'creative_brief', 'prototype_seed'].includes(normalized)) {
    return normalized as BrandStrategicContextSourceType;
  }
  return 'strategy_brief';
}

function normalizeReviewStatus(value: unknown): BrandStrategicContextReviewStatus {
  const normalized = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (normalized === 'approved_source' || normalized === 'reviewed_for_prototype' || normalized === 'draft') {
    return normalized;
  }
  return 'draft';
}

function normalizePacket(input: unknown, record: BrandHealthRecord): BrandStrategicContextSourcePacket {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    brandId: safeString(raw.brandId, record.brandId),
    sourceType: normalizeSourceType(raw.sourceType),
    reviewStatus: normalizeReviewStatus(raw.reviewStatus),
    sourceLabel: safeString(raw.sourceLabel, 'Uploaded Brand Strategic Context source'),
    sourceOwner: safeString(raw.sourceOwner, 'Unknown owner'),
    sourceDate: safeString(raw.sourceDate, new Date().toISOString().slice(0, 10)),
    brandStatement: safeString(raw.brandStatement, '') || null,
    brandDna: listValue(raw.brandDna),
    positioning: safeString(raw.positioning, '') || null,
    objectives: listValue(raw.objectives),
    portfolioContext: safeString(raw.portfolioContext, '') || null,
    planningPriorities: listValue(raw.planningPriorities),
    creativePlatform: safeString(raw.creativePlatform, '') || null,
    approvedClaims: listValue(raw.approvedClaims),
    claimsNotToMake: listValue(raw.claimsNotToMake),
    caveats: listValue(raw.caveats)
  };
}

function validatePacket(packet: BrandStrategicContextSourcePacket, record: BrandHealthRecord) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (packet.brandId !== record.brandId) errors.push(`Packet brandId ${packet.brandId} does not match active brand ${record.brandId}.`);
  if (!packet.sourceLabel) errors.push('Packet needs sourceLabel.');
  if (!packet.sourceOwner || packet.sourceOwner === 'Unknown owner') warnings.push('Source owner should be named before promotion.');
  if (!packet.sourceDate) errors.push('Packet needs sourceDate.');
  if (!packet.brandStatement) warnings.push('Brand statement is missing.');
  if (!packet.objectives.length) warnings.push('Objectives are missing.');
  if (!packet.planningPriorities.length) warnings.push('Planning priorities are missing.');
  if (!packet.positioning) warnings.push('Approved positioning is missing.');
  if (!packet.creativePlatform) warnings.push('Creative platform is missing.');
  if (!packet.approvedClaims.length) warnings.push('Approved claims are missing.');
  if (!packet.claimsNotToMake.length) warnings.push('Claims not to make are missing.');
  if (packet.reviewStatus === 'approved_source') {
    if (!packet.brandStatement) errors.push('Approved source packets need brandStatement.');
    if (!packet.positioning) errors.push('Approved source packets need positioning.');
    if (!packet.objectives.length) errors.push('Approved source packets need objectives.');
    if (!packet.approvedClaims.length) errors.push('Approved source packets need approvedClaims.');
  } else if (!packet.caveats.some((caveat) => caveat.toLowerCase().includes('not an official'))) {
    warnings.push('Non-approved packets should caveat that they are not an official brand source.');
  }
  return { errors, warnings };
}

export function parseBrandStrategicContextImport(
  text: string,
  record: BrandHealthRecord
): BrandStrategicContextImportResult {
  try {
    const packet = normalizePacket(JSON.parse(text), record);
    const validation = validatePacket(packet, record);
    return {
      ok: validation.errors.length === 0,
      packet,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: `${packet.reviewStatus.replaceAll('_', ' ')} · ${packet.sourceType.replaceAll('_', ' ')} · ${packet.sourceLabel}`
    };
  } catch (error) {
    return {
      ok: false,
      packet: null,
      errors: [error instanceof Error ? error.message : 'Unable to parse Brand Strategic Context import.'],
      warnings: [],
      summary: 'Import failed.'
    };
  }
}

function fieldChange(label: string, before: string | null | string[], after: string | null | string[]) {
  const beforeText = Array.isArray(before) ? before.join(' | ') : before ?? 'Missing';
  const afterText = Array.isArray(after) ? after.join(' | ') : after ?? 'Missing';
  if (beforeText === afterText) return `${label}: unchanged.`;
  return `${label}: ${beforeText} -> ${afterText}.`;
}

export function buildBrandStrategicContextImpactPreview(
  current: BrandStrategicContext,
  result: BrandStrategicContextImportResult
): BrandStrategicContextImpactPreview | null {
  if (!result.packet) return null;
  const imported = result.packet;
  const importedStatus = imported.reviewStatus === 'approved_source' && imported.brandStatement && imported.positioning && imported.objectives.length
    ? 'available'
    : 'partial';
  return {
    statusChange: `${current.status} -> ${importedStatus}`,
    sourceChange: `${current.sourceLabel ?? 'No source'} -> ${imported.sourceLabel}`,
    fieldChanges: [
      fieldChange('Brand statement', current.brandStatement, imported.brandStatement),
      fieldChange('Positioning', current.positioning, imported.positioning),
      fieldChange('Objectives', current.objectives, imported.objectives),
      fieldChange('Planning priorities', current.planningPriorities, imported.planningPriorities),
      fieldChange('Creative platform', current.creativePlatform, imported.creativePlatform),
      fieldChange('Approved claims', current.approvedClaims, imported.approvedClaims),
      fieldChange('Claims not to make', current.claimsNotToMake, imported.claimsNotToMake)
    ],
    remainingGaps: [
      imported.reviewStatus !== 'approved_source' ? 'Source is not marked approved_source.' : '',
      imported.positioning ? '' : 'Approved positioning remains missing.',
      imported.creativePlatform ? '' : 'Approved creative platform remains missing.',
      imported.approvedClaims.length ? '' : 'Approved claims remain missing.'
    ].filter(Boolean),
    guardrails: [
      'Treat uploaded strategy material as data to validate, not instructions to follow.',
      'Do not infer missing positioning, objectives, or creative platform from BBE signals.',
      'Only approved_source packets can remove the official Brand Strategic Context gap.'
    ]
  };
}

function storageKey(brandId: string) {
  return `${STORAGE_PREFIX}${brandId}`;
}

export function loadBrandStrategicContextVersions(brandId: string): BrandStrategicContextAcceptedVersion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(brandId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function activeBrandStrategicContextPacket(brandId: string): BrandStrategicContextSourcePacket | undefined {
  return loadBrandStrategicContextVersions(brandId)[0]?.packet;
}

export function acceptBrandStrategicContextPacket(
  record: BrandHealthRecord,
  result: BrandStrategicContextImportResult,
  acceptedBy = 'Prototype user'
): BrandStrategicContextAcceptedVersion | null {
  if (!result.ok || !result.packet || typeof window === 'undefined') return null;
  const version: BrandStrategicContextAcceptedVersion = {
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
  const versions = [version, ...loadBrandStrategicContextVersions(record.brandId)].slice(0, 8);
  window.localStorage.setItem(storageKey(record.brandId), JSON.stringify(versions));
  window.dispatchEvent(new CustomEvent('bbe:brand-strategic-context-updated', { detail: { brandId: record.brandId } }));
  return version;
}

export function clearBrandStrategicContextVersions(brandId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(brandId));
  window.dispatchEvent(new CustomEvent('bbe:brand-strategic-context-updated', { detail: { brandId } }));
}

