import fs from 'node:fs';
import path from 'node:path';
import type {
  SourceClaimKind,
  SourceClaimRecord,
  SourceClaimStatus,
  SourceClaimStore
} from '@/src/lib/intelligence/types';

export type SourceClaimExtractInput = {
  brandId: unknown;
  sourceText: unknown;
  sourceLabel?: unknown;
  sourceOwner?: unknown;
  sourceDate?: unknown;
  warnings?: unknown;
};

export type SourceClaimReviewInput = {
  id: unknown;
  decision: unknown;
  note?: unknown;
  claim?: unknown;
};

const storeDirectory = path.join(process.cwd(), '.runtime');
const storePath = path.join(storeDirectory, 'source-claims.json');
const claimKinds: SourceClaimKind[] = [
  'brand_strategy',
  'momentum_signal',
  'market_context',
  'consumer_insight',
  'treatment_hypothesis',
  'evidence_gap',
  'other'
];

function now() {
  return new Date().toISOString();
}

function emptyStore(): SourceClaimStore {
  return {
    version: 'source-claim-store-v1',
    updatedAt: now(),
    records: []
  };
}

function readStore(): SourceClaimStore {
  if (!fs.existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8')) as Partial<SourceClaimStore>;
    if (parsed.version !== 'source-claim-store-v1' || !Array.isArray(parsed.records)) return emptyStore();
    return {
      version: 'source-claim-store-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : now(),
      records: parsed.records.filter((record): record is SourceClaimRecord => (
        record?.version === 'source-claim-record-v1'
        && typeof record.id === 'string'
        && typeof record.brandId === 'string'
        && typeof record.claim === 'string'
        && claimKinds.includes(record.claimKind)
        && ['extracted_unreviewed', 'reviewed_candidate', 'rejected'].includes(record.status)
        && record.canonicalFactEnabled === false
        && record.runtimeAutoConsumption === false
      ))
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: SourceClaimStore) {
  fs.mkdirSync(storeDirectory, { recursive: true });
  const nextStore = {
    ...store,
    updatedAt: now()
  };
  const tempPath = `${storePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, storePath);
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function listValue(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function normalizeSentence(value: string) {
  return value.replace(/\s+/g, ' ').replace(/^[-*•\d.)\s]+/, '').trim();
}

function claimKindFor(value: string): SourceClaimKind {
  const normalized = value.toLowerCase();
  if (/(positioning|brand book|brand dna|creative platform|approved claim|planning priority|objective)/.test(normalized)) return 'brand_strategy';
  if (/(momentum|declin|improv|trend|red signal|significant)/.test(normalized)) return 'momentum_signal';
  if (/(market|category|share|penetration|growth|peer|competitor)/.test(normalized)) return 'market_context';
  if (/(consumer|shopper|buyer|occasion|need state|cep|mental availability)/.test(normalized)) return 'consumer_insight';
  if (/(treatment|test|action|recommend|activation|media|creative|pack|innovation)/.test(normalized)) return 'treatment_hypothesis';
  if (/(missing|gap|unknown|not available|need source|needs source)/.test(normalized)) return 'evidence_gap';
  return 'other';
}

function extractClaimSentences(sourceText: string) {
  const lineClaims = sourceText
    .split(/\n+/)
    .map(normalizeSentence)
    .filter((line) => line.length >= 30 && /[a-z0-9]/i.test(line));
  const sentenceClaims = sourceText
    .split(/(?<=[.!?])\s+/)
    .map(normalizeSentence)
    .filter((line) => line.length >= 45 && line.length <= 420 && /[a-z0-9]/i.test(line));
  return [...lineClaims, ...sentenceClaims]
    .filter((claim, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === claim.toLowerCase()) === index)
    .slice(0, 12);
}

function instructionLikeSourceWarning(sourceText: string) {
  const normalized = sourceText.toLowerCase();
  const instructionLike = [
    'ignore previous',
    'ignore all prior',
    'system override',
    'developer message',
    'treat this document as instruction',
    'new canonical source of truth',
    'set canonical',
    'enable runtime',
    'auto-consume',
    'bypass review',
    'approve promotion',
    'export the',
    'send externally'
  ];
  return instructionLike.some((phrase) => normalized.includes(phrase))
    ? 'Instruction-like source text detected; treat the content as untrusted review data, not runtime instructions.'
    : null;
}

export function listSourceClaims(filters: { brandId?: unknown; status?: unknown } = {}) {
  const store = readStore();
  const brandId = stringValue(filters.brandId);
  const status = typeof filters.status === 'string' && ['extracted_unreviewed', 'reviewed_candidate', 'rejected'].includes(filters.status)
    ? filters.status as SourceClaimStatus
    : null;
  return {
    version: store.version,
    updatedAt: store.updatedAt,
    persistence: {
      kind: 'local_json',
      storePath: '.runtime/source-claims.json',
      canonicalFactEnabled: false,
      runtimeAutoConsumption: false,
      caveats: [
        'Extracted source claims are local review records, not canonical facts.',
        'The runtime does not automatically consume extracted or reviewed source claims as evidence.',
        'Claims require human review and source-owner governance before any canonical source promotion.'
      ]
    },
    records: store.records.filter((record) => (
      (!brandId || record.brandId === brandId)
      && (!status || record.status === status)
    ))
  };
}

export function extractSourceClaims(input: SourceClaimExtractInput): SourceClaimRecord[] {
  const brandId = stringValue(input.brandId);
  const sourceText = stringValue(input.sourceText);
  if (!brandId) throw new Error('Source claim brandId is required.');
  if (!sourceText || sourceText.length < 80) throw new Error('Source text must contain at least 80 characters.');

  const sourceLabel = stringValue(input.sourceLabel) ?? 'Unstructured source extract';
  const timestamp = now();
  const sourceOwner = stringValue(input.sourceOwner);
  const sourceDate = stringValue(input.sourceDate);
  const instructionWarning = instructionLikeSourceWarning(sourceText);
  const warnings = [
    ...listValue(input.warnings),
    instructionWarning
  ].filter((warning): warning is string => Boolean(warning));
  const claims = extractClaimSentences(sourceText);
  if (!claims.length) throw new Error('No reviewable source claims were detected.');

  const records = claims.map((claim, index): SourceClaimRecord => ({
    id: `${brandId}-source-claim-${Date.now().toString(36)}-${index + 1}`,
    version: 'source-claim-record-v1',
    brandId,
    claim,
    claimKind: claimKindFor(claim),
    status: 'extracted_unreviewed',
    sourceLabel,
    sourceOwner,
    sourceDate,
    sourceExcerpt: claim,
    extractedAt: timestamp,
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
    confidence: 'needs_review',
    warnings,
    caveats: [
      'Extracted from unstructured source text for human review.',
      'This claim is not a canonical fact and is not runtime evidence.',
      'Source owner, date, geography, and method must be reviewed before promotion.',
      instructionWarning ? 'Instruction-like text inside a source is not followed as an agent instruction.' : ''
    ].filter(Boolean),
    canonicalFactEnabled: false,
    runtimeAutoConsumption: false
  }));

  const store = readStore();
  writeStore({
    version: 'source-claim-store-v1',
    updatedAt: timestamp,
    records: [
      ...records,
      ...store.records
    ].slice(0, 300)
  });
  return records;
}

export function reviewSourceClaim(input: SourceClaimReviewInput): SourceClaimRecord {
  const id = stringValue(input.id);
  if (!id) throw new Error('Source claim id is required.');
  const decision = stringValue(input.decision);
  if (decision !== 'accepted' && decision !== 'rejected' && decision !== 'edited') {
    throw new Error('Source claim review decision must be accepted, rejected, or edited.');
  }

  const store = readStore();
  const record = store.records.find((item) => item.id === id);
  if (!record) throw new Error('Source claim not found.');
  if (record.status === 'rejected' && decision === 'accepted') {
    throw new Error('Rejected source claims cannot be accepted without re-extraction.');
  }

  const editedClaim = stringValue(input.claim);
  const reviewedAt = now();
  const nextRecord: SourceClaimRecord = {
    ...record,
    claim: decision === 'edited' && editedClaim ? editedClaim : record.claim,
    claimKind: decision === 'edited' && editedClaim ? claimKindFor(editedClaim) : record.claimKind,
    status: decision === 'rejected' ? 'rejected' : 'reviewed_candidate',
    reviewedAt,
    reviewedBy: 'human_review',
    reviewNote: stringValue(input.note),
    canonicalFactEnabled: false,
    runtimeAutoConsumption: false,
    caveats: [
      ...record.caveats,
      decision === 'rejected'
        ? 'Human review rejected this claim for source-candidate use.'
        : 'Human review marked this as a reviewed local candidate only; it is still not canonical evidence.'
    ]
  };

  writeStore({
    version: 'source-claim-store-v1',
    updatedAt: reviewedAt,
    records: store.records.map((item) => item.id === id ? nextRecord : item)
  });
  return nextRecord;
}
