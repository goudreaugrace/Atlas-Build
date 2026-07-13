import fs from 'node:fs';
import path from 'node:path';

const storeDirectory = path.join(process.cwd(), '.runtime');
const storePath = path.join(storeDirectory, 'assistant-transcripts.json');
const maxRecords = 600;

export type AssistantTranscriptRecord = {
  id: string;
  createdAt: string;
  surface: 'brand-assistant' | 'jarvis-preview';
  brandId: string;
  sessionId: string;
  eventType: 'assistant_turn' | 'work_approval' | 'work_result' | 'error';
  inputMode: 'text' | 'voice' | 'realtime' | 'unknown';
  question?: string;
  assistantText?: string;
  spokenAnswer?: string;
  intentType?: string;
  intentLabel?: string;
  requiresApproval?: boolean;
  source?: string;
  model?: string | null;
  grounding?: string;
  suggestedNextMoves?: string[];
  proofCounts?: {
    evidence: number;
    gaps: number;
    guardrails: number;
  };
  coverage?: {
    status?: string;
    reason?: string;
    logForEnhancement?: boolean;
    requestedSignals?: string[];
    missingEvidence?: string[];
  };
  work?: {
    approvedSkillId?: string;
    approvedTemplateId?: string;
    approvedViewIds?: string[];
    workTitle?: string;
    viewCount?: number;
    evidenceCount?: number;
    gateCount?: number;
  };
  status?: string;
  latencyMs?: number;
  error?: string;
};

type AssistantTranscriptStore = {
  version: 'assistant-transcript-store-v1';
  updatedAt: string;
  records: AssistantTranscriptRecord[];
};

function emptyStore(): AssistantTranscriptStore {
  return {
    version: 'assistant-transcript-store-v1',
    updatedAt: new Date().toISOString(),
    records: []
  };
}

function stringValue(value: unknown, maxLength = 4000) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : undefined;
}

function stringArray(value: unknown, maxItems = 8, maxLength = 180) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => stringValue(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

function numberValue(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function readStore(): AssistantTranscriptStore {
  if (!fs.existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8')) as Partial<AssistantTranscriptStore>;
    if (parsed.version !== 'assistant-transcript-store-v1' || !Array.isArray(parsed.records)) return emptyStore();
    return {
      version: 'assistant-transcript-store-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      records: parsed.records.filter((record): record is AssistantTranscriptRecord => Boolean(record && record.id && record.brandId && record.sessionId))
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: AssistantTranscriptStore) {
  fs.mkdirSync(storeDirectory, { recursive: true });
  const tempPath = `${storePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, storePath);
}

export function appendAssistantTranscriptRecord(input: Record<string, unknown>) {
  const now = new Date().toISOString();
  const proof = input.proofCounts && typeof input.proofCounts === 'object'
    ? input.proofCounts as Record<string, unknown>
    : {};
  const work = input.work && typeof input.work === 'object'
    ? input.work as Record<string, unknown>
    : {};
  const coverage = input.coverage && typeof input.coverage === 'object'
    ? input.coverage as Record<string, unknown>
    : {};
  const record: AssistantTranscriptRecord = {
    id: stringValue(input.id, 120) ?? `assistant-transcript-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: stringValue(input.createdAt, 40) ?? now,
    surface: input.surface === 'jarvis-preview' ? 'jarvis-preview' : 'brand-assistant',
    brandId: stringValue(input.brandId, 80) ?? 'unknown',
    sessionId: stringValue(input.sessionId, 160) ?? 'unknown',
    eventType: input.eventType === 'work_approval' || input.eventType === 'work_result' || input.eventType === 'error'
      ? input.eventType
      : 'assistant_turn',
    inputMode: input.inputMode === 'text' || input.inputMode === 'voice' || input.inputMode === 'realtime'
      ? input.inputMode
      : 'unknown',
    question: stringValue(input.question),
    assistantText: stringValue(input.assistantText, 8000),
    spokenAnswer: stringValue(input.spokenAnswer, 1200),
    intentType: stringValue(input.intentType, 80),
    intentLabel: stringValue(input.intentLabel, 120),
    requiresApproval: typeof input.requiresApproval === 'boolean' ? input.requiresApproval : undefined,
    source: stringValue(input.source, 80),
    model: typeof input.model === 'string' ? input.model.slice(0, 120) : null,
    grounding: stringValue(input.grounding, 80),
    suggestedNextMoves: stringArray(input.suggestedNextMoves, 5, 160),
    proofCounts: {
      evidence: numberValue(proof.evidence) ?? 0,
      gaps: numberValue(proof.gaps) ?? 0,
      guardrails: numberValue(proof.guardrails) ?? 0
    },
    coverage: {
      status: stringValue(coverage.status, 120),
      reason: stringValue(coverage.reason, 500),
      logForEnhancement: typeof coverage.logForEnhancement === 'boolean' ? coverage.logForEnhancement : undefined,
      requestedSignals: stringArray(coverage.requestedSignals, 10, 180),
      missingEvidence: stringArray(coverage.missingEvidence, 10, 240)
    },
    work: {
      approvedSkillId: stringValue(work.approvedSkillId, 120),
      approvedTemplateId: stringValue(work.approvedTemplateId, 120),
      approvedViewIds: stringArray(work.approvedViewIds, 12, 120),
      workTitle: stringValue(work.workTitle, 240),
      viewCount: numberValue(work.viewCount),
      evidenceCount: numberValue(work.evidenceCount),
      gateCount: numberValue(work.gateCount)
    },
    status: stringValue(input.status, 120),
    latencyMs: numberValue(input.latencyMs),
    error: stringValue(input.error, 1000)
  };
  const current = readStore();
  const next: AssistantTranscriptStore = {
    version: 'assistant-transcript-store-v1',
    updatedAt: now,
    records: [...current.records, record].slice(-maxRecords)
  };
  writeStore(next);
  return record;
}

export function listAssistantTranscriptRecords(input: {
  brandId?: string | null;
  sessionId?: string | null;
  limit?: number | null;
} = {}) {
  const store = readStore();
  const limit = Math.min(200, Math.max(1, input.limit ?? 80));
  const records = store.records
    .filter((record) => !input.brandId || record.brandId === input.brandId)
    .filter((record) => !input.sessionId || record.sessionId === input.sessionId)
    .slice(-limit);
  return {
    storePath: '.runtime/assistant-transcripts.json',
    updatedAt: store.updatedAt,
    records
  };
}
