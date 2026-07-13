import mentalAvailabilityFramework from '@/src/data/config/mental-availability-framework.json';
import sourceMapping from '@/src/data/config/mental-availability-source-mapping.json';
import type {
  BrandHealthRecord,
  GrowthAvailabilityEvidenceMode,
  MentalAvailabilityAcceptedVersion,
  MentalAvailabilityCepRole,
  MentalAvailabilityFramework,
  MentalAvailabilityMeasureId,
  MentalAvailabilityRecord,
  MentalAvailabilitySourceMapping,
  MentalAvailabilitySourcePacket
} from '@/src/types/domain';

const STORAGE_PREFIX = 'bbe:mental-availability:versions:';
const framework = mentalAvailabilityFramework as MentalAvailabilityFramework;

export const mentalAvailabilitySourceMapping = sourceMapping as MentalAvailabilitySourceMapping;

export type MentalAvailabilityImportResult = {
  ok: boolean;
  sourceFormat: MentalAvailabilityAcceptedVersion['sourceFormat'];
  packet: MentalAvailabilitySourcePacket | null;
  errors: string[];
  warnings: string[];
  summary: string;
};

export type MentalAvailabilityImpactPreview = {
  evidenceModeChange: string;
  measureChanges: string[];
  addedCeps: string[];
  removedCeps: string[];
  updatedCeps: string[];
  unchangedCeps: string[];
  remainingGaps: string[];
};

function nowVersionId() {
  return `mav-${Date.now().toString(36)}`;
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

function measureRead(id: MentalAvailabilityMeasureId, raw: unknown, mode: GrowthAvailabilityEvidenceMode) {
  const value = numberOrNull(raw);
  return {
    value,
    displayValue: value === null ? 'Not loaded' : String(value),
    read: value === null
      ? `${framework.coreMeasures.find((measure) => measure.id === id)?.label ?? id} was not loaded in the import.`
      : `Imported source value for ${framework.coreMeasures.find((measure) => measure.id === id)?.label ?? id}.`,
    evidenceMode: mode
  };
}

function normalizeEvidenceMode(value: unknown): Exclude<GrowthAvailabilityEvidenceMode, 'missing'> {
  if (value === 'measured' || value === 'simulated_prototype' || value === 'inferred_from_current_packet') return value;
  return 'measured';
}

function normalizeRole(value: unknown): MentalAvailabilityCepRole {
  const role = String(value ?? '').trim().toLowerCase().replaceAll(' ', '_');
  if (role === 'build' || role === 'defend' || role === 'watch' || role === 'avoid') return role;
  if (role === 'avoid_for_now') return 'avoid';
  return 'watch';
}

function normalizeJsonPacket(input: unknown, record: BrandHealthRecord): MentalAvailabilitySourcePacket {
  const raw = input as Record<string, unknown>;
  const evidenceMode = normalizeEvidenceMode(raw.evidenceMode);
  const measures = (raw.measures ?? {}) as Record<string, unknown>;
  const ceps = Array.isArray(raw.ceps) ? raw.ceps : [];
  return {
    brandId: safeString(raw.brandId, record.brandId),
    period: safeString(raw.period, record.period),
    evidenceMode,
    sourceLabel: safeString(raw.sourceLabel, 'Uploaded source packet'),
    topline: {
      label: safeString((raw.topline as Record<string, unknown> | undefined)?.label, 'Imported Mental Availability read'),
      read: safeString((raw.topline as Record<string, unknown> | undefined)?.read, 'Imported packet is ready for stakeholder review.'),
      strategicQuestion: safeString((raw.topline as Record<string, unknown> | undefined)?.strategicQuestion, 'Which CEPs should be built, defended, watched, or avoided?')
    },
    measures: {
      mental_penetration: normalizeMeasure('mental_penetration', measures.mental_penetration, evidenceMode),
      mental_market_share: normalizeMeasure('mental_market_share', measures.mental_market_share, evidenceMode),
      network_size: normalizeMeasure('network_size', measures.network_size, evidenceMode),
      share_of_mind: normalizeMeasure('share_of_mind', measures.share_of_mind, evidenceMode)
    },
    ceps: ceps.map((item, index) => normalizeCep(item, index, evidenceMode))
  };
}

function normalizeMeasure(id: MentalAvailabilityMeasureId, input: unknown, mode: GrowthAvailabilityEvidenceMode) {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      value: numberOrNull(raw.value),
      displayValue: safeString(raw.displayValue, numberOrNull(raw.value) === null ? 'Not loaded' : String(raw.value)),
      read: safeString(raw.read, `Imported source read for ${id}.`),
      evidenceMode: normalizeEvidenceMode(raw.evidenceMode ?? mode)
    };
  }
  return measureRead(id, input, mode);
}

function normalizeCep(input: unknown, index: number, _mode: GrowthAvailabilityEvidenceMode) {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = safeString(raw.name ?? raw.cepName, `CEP ${index + 1}`);
  return {
    id: safeString(raw.id ?? raw.cepId, name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `cep_${index + 1}`),
    name,
    consumerQuestion: safeString(raw.consumerQuestion, `When buyers are in this situation, does the brand come to mind?`),
    role: normalizeRole(raw.role),
    priority: numberOrNull(raw.priority) ?? index + 1,
    relevance: numberOrNull(raw.relevance),
    brandAssociation: numberOrNull(raw.brandAssociation),
    competitorPressure: numberOrNull(raw.competitorPressure),
    interpretation: safeString(raw.interpretation, 'Imported CEP requires interpretation review.'),
    action: safeString(raw.action, 'Review before assigning a treatment or media action.'),
    evidence: listValue(raw.evidence).length ? listValue(raw.evidence) : ['Imported source row.'],
    missingInputs: listValue(raw.missingInputs).length ? listValue(raw.missingInputs) : framework.defaultMissingInputs.slice(0, 4),
    caveat: safeString(raw.caveat, 'Imported CEP should be reviewed against source methodology before use.')
  };
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeCsvPacket(text: string, record: BrandHealthRecord): MentalAvailabilitySourcePacket {
  const rows = parseCsv(text);
  const headers = rows[0]?.map((header) => header.trim()) ?? [];
  const dataRows = rows.slice(1);
  const objects = dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  const first = objects[0] ?? {};
  const evidenceMode = normalizeEvidenceMode(first.evidenceMode);
  return {
    brandId: safeString(first.brandId, record.brandId),
    period: safeString(first.period, record.period),
    evidenceMode,
    sourceLabel: safeString(first.sourceLabel, 'Uploaded CSV source'),
    topline: {
      label: safeString(first.toplineLabel, 'Imported CEP source'),
      read: safeString(first.toplineRead, `Imported ${objects.length} CEP row${objects.length === 1 ? '' : 's'} for ${record.brandName}.`),
      strategicQuestion: safeString(first.strategicQuestion, 'Which imported CEPs should be built, defended, watched, or avoided?')
    },
    measures: {
      mental_penetration: measureRead('mental_penetration', first.mental_penetration, evidenceMode),
      mental_market_share: measureRead('mental_market_share', first.mental_market_share, evidenceMode),
      network_size: measureRead('network_size', first.network_size, evidenceMode),
      share_of_mind: measureRead('share_of_mind', first.share_of_mind, evidenceMode)
    },
    ceps: objects.map((row, index) => normalizeCep({
      id: row.cepId,
      name: row.cepName,
      consumerQuestion: row.consumerQuestion,
      role: row.role,
      priority: row.priority,
      relevance: row.relevance,
      brandAssociation: row.brandAssociation,
      competitorPressure: row.competitorPressure,
      interpretation: row.interpretation,
      action: row.action,
      evidence: row.evidence,
      missingInputs: row.missingInputs,
      caveat: row.caveat
    }, index, evidenceMode))
  };
}

function validatePacket(packet: MentalAvailabilitySourcePacket, record: BrandHealthRecord) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (packet.brandId !== record.brandId) errors.push(`Packet brandId ${packet.brandId} does not match active brand ${record.brandId}.`);
  if (!packet.sourceLabel) errors.push('Packet needs sourceLabel.');
  if (packet.evidenceMode === 'simulated_prototype') warnings.push('Packet is still labeled simulated; use only for prototype storytelling.');
  if (packet.evidenceMode === 'measured' && packet.sourceLabel.toLowerCase().includes('simulated')) {
    errors.push('Measured packets cannot use a sourceLabel that says simulated.');
  }
  if (!packet.ceps.length) errors.push('Packet needs at least one CEP.');
  const cepIds = new Set<string>();
  for (const cep of packet.ceps) {
    if (cepIds.has(cep.id)) errors.push(`Duplicate CEP id: ${cep.id}.`);
    cepIds.add(cep.id);
    if (!['build', 'defend', 'watch', 'avoid'].includes(cep.role)) errors.push(`${cep.name} has invalid role ${cep.role}.`);
    for (const [label, value] of [['relevance', cep.relevance], ['brandAssociation', cep.brandAssociation], ['competitorPressure', cep.competitorPressure]] as const) {
      if (value !== null && (value < 0 || value > 100)) errors.push(`${cep.name} has invalid ${label}; expected 0-100.`);
    }
    if (!cep.evidence.length) warnings.push(`${cep.name} has no evidence detail.`);
    if (!cep.missingInputs.length) warnings.push(`${cep.name} has no missing-input list.`);
  }
  for (const measure of Object.values(packet.measures)) {
    if (!['measured', 'simulated_prototype', 'inferred_from_current_packet', 'missing'].includes(measure.evidenceMode)) {
      errors.push(`Invalid measure evidenceMode ${measure.evidenceMode}.`);
    }
  }
  return { errors, warnings };
}

export function parseMentalAvailabilityImport(text: string, filename: string, record: BrandHealthRecord): MentalAvailabilityImportResult {
  const sourceFormat = filename.toLowerCase().endsWith('.csv') ? 'csv_rows' : 'json_packet';
  try {
    const packet = sourceFormat === 'csv_rows'
      ? normalizeCsvPacket(text, record)
      : normalizeJsonPacket(JSON.parse(text), record);
    const validation = validatePacket(packet, record);
    return {
      ok: validation.errors.length === 0,
      sourceFormat,
      packet,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: `${packet.ceps.length} CEP${packet.ceps.length === 1 ? '' : 's'} · ${packet.evidenceMode.replaceAll('_', ' ')} · ${packet.sourceLabel}`
    };
  } catch (error) {
    return {
      ok: false,
      sourceFormat,
      packet: null,
      errors: [error instanceof Error ? error.message : 'Unable to parse import.'],
      warnings: [],
      summary: 'Import failed.'
    };
  }
}

function sourceMeasureLabel(id: MentalAvailabilityMeasureId) {
  return framework.coreMeasures.find((measure) => measure.id === id)?.label ?? id;
}

export function buildMentalAvailabilityImpactPreview(
  current: MentalAvailabilityRecord,
  result: MentalAvailabilityImportResult
): MentalAvailabilityImpactPreview | null {
  if (!result.packet) return null;
  const imported = result.packet;
  const currentMeasures = new Map(current.measures.map((measure) => [measure.id, measure]));
  const measureChanges = Object.entries(imported.measures).map(([id, measure]) => {
    const measureId = id as MentalAvailabilityMeasureId;
    const existing = currentMeasures.get(measureId);
    if (!existing) return `${sourceMeasureLabel(measureId)} will be added as ${measure.displayValue}.`;
    if (existing.displayValue === measure.displayValue && existing.evidenceMode === measure.evidenceMode) {
      return `${existing.label} stays ${existing.displayValue}.`;
    }
    return `${existing.label}: ${existing.displayValue} (${existing.evidenceMode.replaceAll('_', ' ')}) -> ${measure.displayValue} (${measure.evidenceMode.replaceAll('_', ' ')}).`;
  });

  const currentCeps = new Map(current.ceps.map((cep) => [cep.id, cep]));
  const importedCeps = new Map(imported.ceps.map((cep) => [cep.id, cep]));
  const addedCeps = imported.ceps
    .filter((cep) => !currentCeps.has(cep.id))
    .map((cep) => `${cep.name} (${cep.role})`);
  const removedCeps = current.ceps
    .filter((cep) => !importedCeps.has(cep.id))
    .map((cep) => `${cep.name} (${cep.roleLabel})`);
  const updatedCeps = imported.ceps
    .filter((cep) => {
      const existing = currentCeps.get(cep.id);
      if (!existing) return false;
      return existing.name !== cep.name
        || existing.role !== cep.role
        || existing.priority !== cep.priority
        || existing.relevance !== cep.relevance
        || existing.brandAssociation !== cep.brandAssociation
        || existing.competitorPressure !== cep.competitorPressure;
    })
    .map((cep) => {
      const existing = currentCeps.get(cep.id);
      return `${existing?.name ?? cep.name}: ${existing?.roleLabel ?? 'existing'} -> ${cep.role}, priority ${existing?.priority ?? 'NA'} -> ${cep.priority}.`;
    });
  const unchangedCeps = imported.ceps
    .filter((cep) => currentCeps.has(cep.id) && !updatedCeps.some((item) => item.startsWith(`${currentCeps.get(cep.id)?.name}:`)))
    .map((cep) => cep.name);
  const remainingGaps = Array.from(new Set([
    ...Object.entries(imported.measures)
      .filter(([, measure]) => measure.evidenceMode === 'missing' || measure.value === null)
      .map(([id]) => `${sourceMeasureLabel(id as MentalAvailabilityMeasureId)} remains missing`),
    ...imported.ceps.flatMap((cep) => cep.missingInputs.slice(0, 2))
  ])).slice(0, 8);

  return {
    evidenceModeChange: `${current.evidenceMode.replaceAll('_', ' ')} -> ${imported.evidenceMode.replaceAll('_', ' ')}`,
    measureChanges,
    addedCeps,
    removedCeps,
    updatedCeps,
    unchangedCeps,
    remainingGaps
  };
}

function storageKey(brandId: string) {
  return `${STORAGE_PREFIX}${brandId}`;
}

export function loadMentalAvailabilityVersions(brandId: string): MentalAvailabilityAcceptedVersion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(brandId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function activeMentalAvailabilityPacket(brandId: string): MentalAvailabilitySourcePacket | undefined {
  return loadMentalAvailabilityVersions(brandId)[0]?.packet;
}

export function acceptMentalAvailabilityPacket(
  record: BrandHealthRecord,
  result: MentalAvailabilityImportResult,
  acceptedBy = 'Prototype user'
): MentalAvailabilityAcceptedVersion | null {
  if (!result.ok || !result.packet || typeof window === 'undefined') return null;
  const version: MentalAvailabilityAcceptedVersion = {
    versionId: nowVersionId(),
    brandId: record.brandId,
    acceptedAt: new Date().toISOString(),
    acceptedBy,
    sourceFormat: result.sourceFormat,
    packet: result.packet,
    validation: {
      warnings: result.warnings,
      summary: result.summary
    }
  };
  const versions = [version, ...loadMentalAvailabilityVersions(record.brandId)].slice(0, 8);
  window.localStorage.setItem(storageKey(record.brandId), JSON.stringify(versions));
  window.dispatchEvent(new CustomEvent('bbe:mental-availability-updated', { detail: { brandId: record.brandId } }));
  return version;
}

export function clearMentalAvailabilityVersions(brandId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(brandId));
  window.dispatchEvent(new CustomEvent('bbe:mental-availability-updated', { detail: { brandId } }));
}
