import fs from 'node:fs';
import path from 'node:path';
import type { QbrCompositionPlan } from '@/src/lib/intelligence/qbr-composition-planner';

const storeDirectory = path.join(process.cwd(), '.runtime');
const storePath = path.join(storeDirectory, 'brand-work-items.json');
const maxRecords = 400;

export type StoredBrandWorkRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: 'brand-work-item-v1';
  brandId: string;
  sessionId: string;
  surface: 'brand-assistant' | 'jarvis-preview' | 'agent-lab' | 'unknown';
  inputMode: 'text' | 'voice' | 'realtime' | 'unknown';
  sourcePrompt: string;
  title: string;
  summary: string;
  workType: string;
  status: 'ready' | 'review_required' | 'blocked';
  audience: string;
  objective: string;
  approvedSkillId: string;
  approvedTemplateId: string;
  approvedViewIds: string[];
  proofCounts: {
    evidence: number;
    gaps: number;
    gates: number;
  };
  reviewState: string;
  shareState: 'url_addressable';
  exportState: 'gated';
  qbrCompositionPlan?: QbrCompositionPlan;
  resultSnapshot?: {
    turnId?: string;
    headline?: string;
    templateId?: string;
    viewIds: string[];
    evidenceCount: number;
    gateCount: number;
  };
};

type BrandWorkStore = {
  version: 'brand-work-store-v1';
  updatedAt: string;
  records: StoredBrandWorkRecord[];
};

function emptyStore(): BrandWorkStore {
  return {
    version: 'brand-work-store-v1',
    updatedAt: new Date().toISOString(),
    records: []
  };
}

function stringValue(value: unknown, maxLength = 1200) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : undefined;
}

function stringArray(value: unknown, maxItems = 16, maxLength = 160) {
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

function qbrCompositionPlanValue(value: unknown): QbrCompositionPlan | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const plan = value as Partial<QbrCompositionPlan>;
  if (plan.id !== 'qbr-composition-plan-v1') return undefined;
  if (!plan.compositionMode || !plan.goal || !Array.isArray(plan.selectedModules) || !Array.isArray(plan.approvedViewIds)) return undefined;
  return plan as QbrCompositionPlan;
}

function readStore(): BrandWorkStore {
  if (!fs.existsSync(storePath)) return emptyStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(storePath, 'utf8')) as Partial<BrandWorkStore>;
    if (parsed.version !== 'brand-work-store-v1' || !Array.isArray(parsed.records)) return emptyStore();
    return {
      version: 'brand-work-store-v1',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      records: parsed.records.filter((record): record is StoredBrandWorkRecord => Boolean(record && record.id && record.brandId))
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: BrandWorkStore) {
  fs.mkdirSync(storeDirectory, { recursive: true });
  const tempPath = `${storePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, storePath);
}

function workTypeFromTemplate(templateId?: string) {
  if (!templateId) return 'workspace';
  if (templateId.includes('qbr') || templateId.includes('pilot') || templateId.includes('brief')) return 'qbr_read';
  if (templateId.includes('evidence')) return 'proof_pack';
  if (templateId.includes('treatment')) return 'treatment_path';
  if (templateId.includes('learning')) return 'learning_path';
  if (templateId.includes('governance') || templateId.includes('readiness') || templateId.includes('review')) return 'governance_review';
  return 'workspace';
}

function normalizeSurface(value: unknown): StoredBrandWorkRecord['surface'] {
  if (value === 'brand-assistant' || value === 'jarvis-preview' || value === 'agent-lab') return value;
  return 'unknown';
}

function normalizeInputMode(value: unknown): StoredBrandWorkRecord['inputMode'] {
  if (value === 'text' || value === 'voice' || value === 'realtime') return value;
  return 'unknown';
}

export function appendBrandWorkRecord(input: Record<string, unknown>) {
  const now = new Date().toISOString();
  const proof = input.proofCounts && typeof input.proofCounts === 'object'
    ? input.proofCounts as Record<string, unknown>
    : {};
  const snapshot = input.resultSnapshot && typeof input.resultSnapshot === 'object'
    ? input.resultSnapshot as Record<string, unknown>
    : {};
  const approvedTemplateId = stringValue(input.approvedTemplateId, 120) ?? 'dynamic-view-request-fallback';
  const approvedViewIds = stringArray(input.approvedViewIds, 16, 120);
  const evidenceCount = numberValue(proof.evidence) ?? numberValue(snapshot.evidenceCount) ?? 0;
  const gateCount = numberValue(proof.gates) ?? numberValue(snapshot.gateCount) ?? 0;
  const record: StoredBrandWorkRecord = {
    id: stringValue(input.id, 140) ?? `brand-work-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: stringValue(input.createdAt, 40) ?? now,
    updatedAt: now,
    version: 'brand-work-item-v1',
    brandId: stringValue(input.brandId, 80) ?? 'unknown',
    sessionId: stringValue(input.sessionId, 160) ?? 'unknown',
    surface: normalizeSurface(input.surface),
    inputMode: normalizeInputMode(input.inputMode),
    sourcePrompt: stringValue(input.sourcePrompt, 2400) ?? 'Governed workspace request',
    title: stringValue(input.title, 240) ?? 'Governed Brand Work',
    summary: stringValue(input.summary, 2400) ?? 'Approved governed work output for this brand.',
    workType: stringValue(input.workType, 120) ?? workTypeFromTemplate(approvedTemplateId),
    status: input.status === 'blocked' ? 'blocked' : 'review_required',
    audience: stringValue(input.audience, 120) ?? 'brand_team',
    objective: stringValue(input.objective, 120) ?? 'decide',
    approvedSkillId: stringValue(input.approvedSkillId, 120) ?? 'answer_brand_question',
    approvedTemplateId,
    approvedViewIds,
    proofCounts: {
      evidence: evidenceCount,
      gaps: numberValue(proof.gaps) ?? 0,
      gates: gateCount
    },
    reviewState: stringValue(input.reviewState, 160) ?? 'prototype_review_required',
    shareState: 'url_addressable',
    exportState: 'gated',
    qbrCompositionPlan: qbrCompositionPlanValue(input.qbrCompositionPlan),
    resultSnapshot: {
      turnId: stringValue(snapshot.turnId, 140),
      headline: stringValue(snapshot.headline, 240),
      templateId: stringValue(snapshot.templateId, 120) ?? approvedTemplateId,
      viewIds: stringArray(snapshot.viewIds, 16, 120).length ? stringArray(snapshot.viewIds, 16, 120) : approvedViewIds,
      evidenceCount,
      gateCount
    }
  };

  const current = readStore();
  const nextRecords = [record, ...current.records.filter((item) => item.id !== record.id)].slice(0, maxRecords);
  const next: BrandWorkStore = {
    version: 'brand-work-store-v1',
    updatedAt: now,
    records: nextRecords
  };
  writeStore(next);
  return record;
}

export function listBrandWorkRecords(input: {
  brandId?: string | null;
  sessionId?: string | null;
  limit?: number | null;
} = {}) {
  const store = readStore();
  const limit = Math.min(200, Math.max(1, input.limit ?? 80));
  return {
    storePath: '.runtime/brand-work-items.json',
    updatedAt: store.updatedAt,
    records: store.records
      .filter((record) => !input.brandId || record.brandId === input.brandId)
      .filter((record) => !input.sessionId || record.sessionId === input.sessionId)
      .slice(0, limit)
  };
}
