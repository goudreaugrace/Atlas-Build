import fs from 'node:fs';
import path from 'node:path';
import type {
  SourcePromotionKind,
  SourcePromotionRecord,
  SourcePromotionStore
} from '@/src/lib/intelligence/types';

export type SourcePromotionInput = {
  kind: unknown;
  brandId: unknown;
  packet: unknown;
  validationSummary?: unknown;
  warnings?: unknown;
};

const storeDirectory = path.join(process.cwd(), '.runtime');
const storePath = path.join(storeDirectory, 'source-packet-promotions.json');
const sourceKinds: SourcePromotionKind[] = ['brand_strategic_context', 'momentum_intelligence'];

function now() {
  return new Date().toISOString();
}

function emptyStore(): SourcePromotionStore {
  return {
    version: 'source-promotion-store-v1',
    updatedAt: now(),
    records: []
  };
}

function readStore(): SourcePromotionStore {
  if (!fs.existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8')) as Partial<SourcePromotionStore>;
    if (parsed.version !== 'source-promotion-store-v1' || !Array.isArray(parsed.records)) return emptyStore();
    return {
      version: 'source-promotion-store-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : now(),
      records: parsed.records.filter((record): record is SourcePromotionRecord => (
        record?.version === 'source-promotion-record-v1'
        && sourceKinds.includes(record.kind)
        && typeof record.brandId === 'string'
        && record.canonicalWriteEnabled === false
      ))
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: SourcePromotionStore) {
  fs.mkdirSync(storeDirectory, { recursive: true });
  const nextStore = {
    ...store,
    updatedAt: now()
  };
  const tempPath = `${storePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, storePath);
}

function listValue(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function packetObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function normalizeKind(value: unknown): SourcePromotionKind {
  if (typeof value === 'string' && sourceKinds.includes(value as SourcePromotionKind)) return value as SourcePromotionKind;
  throw new Error('Unsupported source promotion kind.');
}

function sourceField(packet: Record<string, unknown>, field: string) {
  return typeof packet[field] === 'string' && packet[field].trim() ? packet[field].trim() : null;
}

export function listSourcePromotions(filters: { brandId?: unknown; kind?: unknown } = {}) {
  const store = readStore();
  const brandId = typeof filters.brandId === 'string' && filters.brandId.trim() ? filters.brandId.trim() : null;
  const kind = typeof filters.kind === 'string' && sourceKinds.includes(filters.kind as SourcePromotionKind)
    ? filters.kind as SourcePromotionKind
    : null;
  return {
    version: store.version,
    updatedAt: store.updatedAt,
    persistence: {
      kind: 'local_json',
      storePath: '.runtime/source-packet-promotions.json',
      canonicalWriteEnabled: false,
      caveats: [
        'Source promotions are local review records, not canonical source data writes.',
        'The runtime does not automatically consume durable source promotion records.',
        'Canonical promotion remains blocked until source-owner governance and source_data_write capability are approved.'
      ]
    },
    records: store.records.filter((record) => (
      (!brandId || record.brandId === brandId)
      && (!kind || record.kind === kind)
    ))
  };
}

export function recordSourcePromotion(input: SourcePromotionInput): SourcePromotionRecord {
  const kind = normalizeKind(input.kind);
  const packet = packetObject(input.packet);
  const brandId = typeof input.brandId === 'string' && input.brandId.trim()
    ? input.brandId.trim()
    : sourceField(packet, 'brandId');
  if (!brandId) throw new Error('Source promotion brandId is required.');
  if (sourceField(packet, 'brandId') && sourceField(packet, 'brandId') !== brandId) {
    throw new Error('Source promotion brandId must match packet.brandId.');
  }

  const timestamp = now();
  const sourceLabel = sourceField(packet, 'sourceLabel') ?? 'Uploaded source packet';
  const record: SourcePromotionRecord = {
    id: `${brandId}-${kind}-${Date.now().toString(36)}`,
    version: 'source-promotion-record-v1',
    kind,
    brandId,
    sourceLabel,
    sourceOwner: sourceField(packet, 'sourceOwner'),
    sourceDate: sourceField(packet, 'sourceDate'),
    status: 'reviewed_local_only',
    promotedAt: timestamp,
    promotedBy: 'human_review',
    validationSummary: typeof input.validationSummary === 'string' && input.validationSummary.trim()
      ? input.validationSummary.trim()
      : `${kind.replaceAll('_', ' ')} source promotion candidate`,
    warnings: listValue(input.warnings),
    caveats: [
      'Recorded as a local reviewed source promotion candidate only.',
      'This record does not change canonical repo JSON or enterprise source truth.',
      'The agent runtime does not automatically consume this durable source record.',
      ...listValue(packet.caveats)
    ],
    canonicalWriteEnabled: false,
    packet: input.packet
  };

  const store = readStore();
  writeStore({
    version: 'source-promotion-store-v1',
    updatedAt: timestamp,
    records: [
      record,
      ...store.records
    ].slice(0, 100)
  });
  return record;
}
