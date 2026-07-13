import 'server-only';

import {
  findAgentSkill,
  findExperienceTemplate
} from '@/src/lib/intelligence/kernel';
import { listBrandWorkRecords } from '@/src/lib/intelligence/server-brand-work-store';
import { listAssistantTranscriptRecords } from '@/src/lib/intelligence/server-assistant-transcript-store';
import { getExecutiveIntelligenceAssetDefinitions } from '@/src/lib/intelligence/executive-intelligence-asset-spec';
import type { QbrCompositionPlan } from '@/src/lib/intelligence/qbr-composition-planner';
import type { BrandHealthRecord } from '@/src/types/domain';

export type BrandWorkStatus = 'ready' | 'review_required' | 'starter' | 'blocked';

export type BrandWorkItem = {
  id: string;
  brandId: string;
  title: string;
  type: 'executive_asset' | 'qbr_read' | 'proof_pack' | 'treatment_path' | 'learning_path' | 'governance_review' | 'workspace';
  source: 'requested_work' | 'starter_template';
  status: BrandWorkStatus;
  audience: string;
  objective: string;
  sourcePrompt: string;
  createdAt: string;
  updatedAt: string;
  approvedSkillId: string;
  approvedSkillName: string;
  approvedTemplateId: string;
  approvedTemplateName: string;
  approvedViewIds: string[];
  summary: string;
  proofSummary: {
    evidence: number;
    gaps: number;
    gates: number;
  };
  reviewState: string;
  shareState: 'url_addressable';
  exportState: 'gated';
  qbrCompositionPlan?: QbrCompositionPlan;
};

type StarterWorkDefinition = {
  id: string;
  titlePrefix: string;
  type: BrandWorkItem['type'];
  approvedSkillId: string;
  approvedTemplateId: string;
  sourcePrompt: string;
  summary?: string;
  proofSummary?: BrandWorkItem['proofSummary'];
};

const starterWorkDefinitions: StarterWorkDefinition[] = [
  ...getExecutiveIntelligenceAssetDefinitions().map((definition): StarterWorkDefinition => ({
    id: definition.assetId,
    titlePrefix: definition.titlePrefix,
    type: 'executive_asset',
    approvedSkillId: definition.approvedSkillId,
    approvedTemplateId: definition.approvedTemplateId,
    sourcePrompt: definition.sourcePrompt,
    summary: definition.summary,
    proofSummary: definition.proofSummary
  })),
  {
    id: 'executive-qbr-read',
    titlePrefix: 'Meeting Prep Intelligence Asset',
    type: 'qbr_read' as const,
    approvedSkillId: 'bbe_momentum_intelligence_read',
    approvedTemplateId: 'executive-qbr-decision-read',
    sourcePrompt: 'Build this into a meeting prep read with proof.'
  },
  {
    id: 'insights-proof-pack',
    titlePrefix: 'Insights Proof Pack',
    type: 'proof_pack' as const,
    approvedSkillId: 'explain_diagnosis_evidence',
    approvedTemplateId: 'insights-evidence-lab',
    sourcePrompt: 'Show me the proof, gaps, and guardrails behind this read.'
  },
  {
    id: 'treatment-path',
    titlePrefix: 'Treatment Path To Test',
    type: 'treatment_path' as const,
    approvedSkillId: 'create_growth_provocations',
    approvedTemplateId: 'marketer-treatment-planning',
    sourcePrompt: 'What treatment path should we test first?'
  },
  {
    id: 'learning-path',
    titlePrefix: 'Learning Path',
    type: 'learning_path' as const,
    approvedSkillId: 'teach_brand_growth_concept',
    approvedTemplateId: 'learning-coach',
    sourcePrompt: 'Build a learning path for this read.'
  }
];

function itemTypeFromTemplate(templateId: string | undefined, fallback: BrandWorkItem['type'] = 'workspace') {
  if (!templateId) return fallback;
  if (templateId.includes('cmo-review') || templateId.includes('intelligence-asset')) return 'executive_asset';
  if (templateId.includes('qbr') || templateId.includes('pilot') || templateId.includes('brief')) return 'qbr_read';
  if (templateId.includes('evidence')) return 'proof_pack';
  if (templateId.includes('treatment')) return 'treatment_path';
  if (templateId.includes('learning')) return 'learning_path';
  if (templateId.includes('governance') || templateId.includes('readiness') || templateId.includes('review')) return 'governance_review';
  return fallback;
}

function viewIdsForTemplate(templateId: string | undefined) {
  const template = templateId ? findExperienceTemplate(templateId) : undefined;
  return template?.zones.map((zone) => zone.viewId) ?? [];
}

function titleCaseLabel(id: string) {
  return id.replaceAll(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function makeStarterWorkItem(record: BrandHealthRecord, definition: StarterWorkDefinition): BrandWorkItem {
  const template = findExperienceTemplate(definition.approvedTemplateId);
  const skill = findAgentSkill(definition.approvedSkillId);
  const now = '2026-07-01T00:00:00.000Z';
  const approvedViewIds = template?.zones.map((zone) => zone.viewId) ?? [];
  return {
    id: definition.id,
    brandId: record.brandId,
    title: `${definition.titlePrefix}: ${record.brandName}`,
    type: definition.type,
    source: 'starter_template',
    status: 'starter',
    audience: template?.audience ?? (definition.type === 'executive_asset' ? 'executive' : 'brand_team'),
    objective: template?.objective ?? (definition.type === 'executive_asset' ? 'decision_read' : 'decide'),
    sourcePrompt: definition.sourcePrompt,
    createdAt: now,
    updatedAt: now,
    approvedSkillId: definition.approvedSkillId,
    approvedSkillName: skill?.name ?? titleCaseLabel(definition.approvedSkillId),
    approvedTemplateId: definition.approvedTemplateId,
    approvedTemplateName: template?.name ?? titleCaseLabel(definition.approvedTemplateId),
    approvedViewIds,
    summary: definition.summary ?? template?.purpose ?? 'Approved workspace template for the active brand.',
    proofSummary: definition.proofSummary ?? {
      evidence: definition.type === 'executive_asset'
        ? 8
        : approvedViewIds.includes('evidence_ledger') || approvedViewIds.includes('evidence_spotlight_panel') ? 1 : 0,
      gaps: definition.type === 'executive_asset' ? 8 : approvedViewIds.includes('data_gap_panel') ? 1 : 0,
      gates: definition.type === 'executive_asset' ? 1 : template?.humanApproval ? 1 : 0
    },
    reviewState: definition.type === 'executive_asset' ? 'source_owner_blocked' : template?.humanApproval ?? 'prototype_review_required',
    shareState: 'url_addressable',
    exportState: 'gated'
  };
}

function getAllBrandWorkItems(record: BrandHealthRecord): BrandWorkItem[] {
  const storedItems = listBrandWorkRecords({ brandId: record.brandId, limit: 80 }).records
    .map((entry): BrandWorkItem => {
      const template = findExperienceTemplate(entry.approvedTemplateId);
      const skill = findAgentSkill(entry.approvedSkillId);
      return {
        id: entry.id,
        brandId: entry.brandId,
        title: entry.title,
        type: itemTypeFromTemplate(entry.approvedTemplateId, entry.workType as BrandWorkItem['type']),
        source: 'requested_work',
        status: entry.status === 'blocked' ? 'blocked' : 'review_required',
        audience: template?.audience ?? entry.audience,
        objective: template?.objective ?? entry.objective,
        sourcePrompt: entry.sourcePrompt,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        approvedSkillId: entry.approvedSkillId,
        approvedSkillName: skill?.name ?? titleCaseLabel(entry.approvedSkillId),
        approvedTemplateId: entry.approvedTemplateId,
        approvedTemplateName: template?.name ?? titleCaseLabel(entry.approvedTemplateId),
        approvedViewIds: entry.approvedViewIds,
        summary: entry.summary,
        proofSummary: {
          evidence: entry.proofCounts.evidence,
          gaps: entry.proofCounts.gaps,
          gates: entry.proofCounts.gates
        },
        reviewState: entry.reviewState,
        shareState: 'url_addressable',
        exportState: 'gated',
        qbrCompositionPlan: entry.qbrCompositionPlan
      };
    });

  const transcriptItems = listAssistantTranscriptRecords({ brandId: record.brandId, limit: 120 }).records
    .filter((entry) => entry.eventType === 'work_result')
    .reverse()
    .map((entry): BrandWorkItem => {
      const templateId = entry.work?.approvedTemplateId ?? 'dynamic-view-request-fallback';
      const skillId = entry.work?.approvedSkillId ?? 'answer_brand_question';
      const template = findExperienceTemplate(templateId);
      const skill = findAgentSkill(skillId);
      const approvedViewIds = entry.work?.approvedViewIds?.length ? entry.work.approvedViewIds : viewIdsForTemplate(templateId);
      return {
        id: entry.id,
        brandId: record.brandId,
        title: entry.work?.workTitle ?? `${template?.name ?? titleCaseLabel(templateId)}: ${record.brandName}`,
        type: itemTypeFromTemplate(templateId),
        source: 'requested_work',
        status: entry.status === 'completed' || entry.status === 'ready' ? 'review_required' : 'ready',
        audience: template?.audience ?? 'brand_team',
        objective: template?.objective ?? 'decide',
        sourcePrompt: entry.question ?? 'Governed workspace request',
        createdAt: entry.createdAt,
        updatedAt: entry.createdAt,
        approvedSkillId: skillId,
        approvedSkillName: skill?.name ?? titleCaseLabel(skillId),
        approvedTemplateId: templateId,
        approvedTemplateName: template?.name ?? titleCaseLabel(templateId),
        approvedViewIds,
        summary: entry.assistantText ?? template?.purpose ?? 'Approved governed work result for this brand.',
        proofSummary: {
          evidence: entry.work?.evidenceCount ?? entry.proofCounts?.evidence ?? 0,
          gaps: entry.proofCounts?.gaps ?? 0,
          gates: entry.work?.gateCount ?? 0
        },
        reviewState: template?.humanApproval ?? 'prototype_review_required',
        shareState: 'url_addressable',
        exportState: 'gated'
      };
    });

  const starterItems = starterWorkDefinitions.map((definition) => makeStarterWorkItem(record, definition));
  const priorityStarterItems = starterItems.filter((item) => item.type === 'executive_asset');
  const remainingStarterItems = starterItems.filter((item) => item.type !== 'executive_asset');
  const seen = new Set<string>();
  return [...priorityStarterItems, ...storedItems, ...transcriptItems, ...remainingStarterItems]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function getBrandWorkItems(record: BrandHealthRecord): BrandWorkItem[] {
  return getAllBrandWorkItems(record).slice(0, 16);
}

export function findBrandWorkItem(record: BrandHealthRecord, workId: string) {
  const decoded = decodeURIComponent(workId);
  return getAllBrandWorkItems(record).find((item) => item.id === decoded);
}
