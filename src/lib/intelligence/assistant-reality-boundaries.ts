import realityBoundariesJson from '@/src/data/config/assistant-reality-boundaries.json';
import type { BrandIntelligencePacket } from '@/src/lib/intelligence/types';

type AssistantRealityBoundariesConfig = typeof realityBoundariesJson;

export const assistantRealityBoundaries = realityBoundariesJson as AssistantRealityBoundariesConfig;

export type AssistantRealityContext = {
  sourcePeriodLine: string;
  capabilityBucketLines: string[];
  shareExportLine: string;
  workOrderLabel: string;
  workOrderApprovalAsk: string;
  missingEvidenceLabels: string[];
  realityInstructions: string[];
};

function includesAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function interpolate(template: string, packet: BrandIntelligencePacket) {
  return template
    .replaceAll('{period}', packet.brand.period)
    .replaceAll('{brandName}', packet.brand.brandName)
    .replaceAll('{category}', packet.brand.category);
}

export function classifyRealityNeeds(question: string) {
  const triggers = assistantRealityBoundaries.mustUseWhenQuestionMentions;
  return {
    currentOrLatest: includesAny(question, triggers.currentOrLatest),
    shareOrExport: includesAny(question, triggers.shareOrExport),
    executiveReady: includesAny(question, triggers.executiveReady),
    capabilityOrIdentity: includesAny(question, triggers.capabilityOrIdentity),
    outsideEvidence: includesAny(question, triggers.outsideEvidence)
  };
}

export function missingEvidenceLabelsForQuestion(question: string) {
  return assistantRealityBoundaries.missingEvidenceTaxonomy
    .filter((item) => includesAny(question, item.triggerTerms))
    .map((item) => item.label);
}

export function buildAssistantRealityContext(packet: BrandIntelligencePacket, question = ''): AssistantRealityContext {
  const needs = classifyRealityNeeds(question);
  const sourcePeriodLine = interpolate(assistantRealityBoundaries.sourcePeriodRule.wording, packet);
  const capabilityBucketLines = assistantRealityBoundaries.capabilityBuckets.map((bucket) => `${bucket.label}: ${bucket.definition}`);
  const missingEvidenceLabels = missingEvidenceLabelsForQuestion(question);
  const realityInstructions = [
    needs.currentOrLatest ? assistantRealityBoundaries.sourcePeriodRule.instruction : '',
    needs.shareOrExport || needs.executiveReady ? assistantRealityBoundaries.shareExportRule.instruction : '',
    needs.capabilityOrIdentity ? 'Split capability claims into available today, prototype governed workspaces, and gated/future. Do not imply all prototype workspaces are production features.' : '',
    needs.outsideEvidence ? 'Name missing evidence categories instead of implying the loaded packet contains those signals.' : '',
    'Use “CMO-review draft” or “leadership-review workspace,” not “CMO-ready,” “final,” or “approved,” unless an official approval workflow exists.'
  ].filter(Boolean);

  return {
    sourcePeriodLine,
    capabilityBucketLines,
    shareExportLine: assistantRealityBoundaries.shareExportRule.wording,
    workOrderLabel: assistantRealityBoundaries.workOrderLanguage.reviewDraftLabel,
    workOrderApprovalAsk: assistantRealityBoundaries.workOrderLanguage.defaultApprovalAsk,
    missingEvidenceLabels,
    realityInstructions
  };
}

export function applyRealityBoundaryToAnswer(answer: string, packet: BrandIntelligencePacket, question: string) {
  const needs = classifyRealityNeeds(question);
  const context = buildAssistantRealityContext(packet, question);
  const additions: string[] = [];
  const normalized = answer.toLowerCase();

  if (needs.currentOrLatest && !normalized.includes(packet.brand.period.toLowerCase())) {
    additions.push(context.sourcePeriodLine);
  }

  if ((needs.shareOrExport || needs.executiveReady) && !normalized.includes('export') && !normalized.includes('circulation')) {
    additions.push(context.shareExportLine);
  }

  if (context.missingEvidenceLabels.length) {
    const line = `Missing evidence to close this fully: ${context.missingEvidenceLabels.join(', ')}.`;
    if (!normalized.includes('missing evidence')) additions.push(line);
  }

  return additions.length ? `${additions.join(' ')}\n\n${answer}` : answer;
}

export function safeWorkOrderLabel(label: string) {
  return Object.entries(assistantRealityBoundaries.workOrderLanguage.approvedArtifactReplacement)
    .reduce((current, [unsafe, replacement]) => current.replace(new RegExp(unsafe, 'gi'), replacement), label);
}
