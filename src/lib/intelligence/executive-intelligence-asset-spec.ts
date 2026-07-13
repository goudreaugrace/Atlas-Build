import pageModuleRegistryJson from '@/src/data/config/executive-intelligence-asset-page-module-registry.json';
import type { BrandIntelligencePacket } from '@/src/lib/intelligence/types';

export type ExecutiveIntelligenceAssetAudience = 'cmo' | 'insights_lead' | 'brand_lead' | 'source_owner';
export type ExecutiveIntelligenceAssetObjective = 'decision_read' | 'proof_review' | 'source_handoff' | 'treatment_path';
export type ExecutiveIntelligenceAssetReviewState = 'review_draft' | 'source_owner_blocked' | 'pilot_candidate' | 'approved_internal';
export type ExecutiveIntelligenceAssetExportState = 'gated' | 'disabled' | 'ready_after_review';
export type ExecutiveIntelligenceAssetOutputMode = 'source_recreation' | 'diagnostic_read' | 'future_extension';
export type ExecutiveIntelligenceAssetPageModuleId =
  | 'executive_verdict'
  | 'benchmark_lens_read'
  | 'primary_chart_read'
  | 'driver_diagnosis'
  | 'demographic_boundary'
  | 'provocation_questions'
  | 'treatment_paths'
  | 'source_readiness_next_proof';

export type ExecutiveIntelligenceAssetPageVisualPattern =
  | 'hero_verdict'
  | 'lens_sequence'
  | 'chart_read'
  | 'driver_map'
  | 'boundary_state'
  | 'question_stack'
  | 'treatment_options'
  | 'proof_and_handoff';

export type ExecutiveIntelligenceAssetProofKind =
  | 'headline_verdict'
  | 'decision_implication'
  | 'primary_watchout'
  | 'evidence_card'
  | 'momentum_lens'
  | 'ahead_behind_lens'
  | 'category_context_lens'
  | 'source_slide'
  | 'metric_point'
  | 'reconciliation_status'
  | 'demand_power_driver'
  | 'perceived_value_driver'
  | 'mds_tension'
  | 'treatment_implication'
  | 'measured_availability_state'
  | 'simulated_workflow_state'
  | 'official_source_requirement'
  | 'priority_question'
  | 'evidence_to_use'
  | 'evidence_needed'
  | 'treatment_option'
  | 'why_consider'
  | 'inspect_before_action'
  | 'evidence_need'
  | 'source_block'
  | 'handoff_requirement'
  | 'next_proof'
  | 'blocked_use';

export type ExecutiveIntelligenceAssetPageModuleDefinition = {
  moduleId: ExecutiveIntelligenceAssetPageModuleId;
  title: string;
  visualPattern: ExecutiveIntelligenceAssetPageVisualPattern;
  focusLevel: ExecutiveIntelligenceAssetPage['focusLevel'];
  outputMode: ExecutiveIntelligenceAssetOutputMode;
  outputModeRationale: string;
  requiredSourceModuleIds: string[];
  requiredProofKinds: ExecutiveIntelligenceAssetProofKind[];
  minPrimaryEvidence: number;
  minExpandableProof: number;
  minEvidenceNeeded: number;
  minBlockedOverclaims: number;
  minNextActions: number;
  sourcePostureRequired: boolean;
  blockedClaimSignalGroups: string[][];
  evidenceNeededSignalGroups: string[][];
  allowedRevisionTypes: string[];
  nextOperationCandidates: string[];
};

export type ExecutiveIntelligenceAssetDefinition = {
  assetId: string;
  titlePrefix: string;
  coverTitlePrefix: string;
  approvedSkillId: string;
  approvedTemplateId: string;
  audience: ExecutiveIntelligenceAssetAudience;
  objective: ExecutiveIntelligenceAssetObjective;
  sourcePrompt: string;
  summary: string;
  proofSummary: {
    evidence: number;
    gaps: number;
    gates: number;
  };
  moduleIds: ExecutiveIntelligenceAssetPageModuleId[];
  decisionSupported: string;
  askPrompts: string[];
  triggerTerms: string[];
  sourceBasis: string[];
  pageOverrides?: Partial<Record<ExecutiveIntelligenceAssetPageModuleId, Partial<Pick<ExecutiveIntelligenceAssetPage, 'title' | 'headline' | 'role'>>>>;
};

export type ExecutiveIntelligenceAssetPageModuleRegistry = {
  id: 'executive-intelligence-asset-page-module-registry-v1';
  lastReviewed: string;
  purpose: string;
  guardrails: string[];
  assetDefinitions: ExecutiveIntelligenceAssetDefinition[];
  moduleDefinitions: ExecutiveIntelligenceAssetPageModuleDefinition[];
};

export type ExecutiveIntelligenceAssetPageProofContract = {
  registryId: ExecutiveIntelligenceAssetPageModuleRegistry['id'];
  moduleId: ExecutiveIntelligenceAssetPageModuleId;
  requiredSourceModuleIds: string[];
  requiredProofKinds: ExecutiveIntelligenceAssetProofKind[];
  evidenceMinimums: {
    primaryEvidence: number;
    expandableProof: number;
    evidenceNeeded: number;
    blockedOverclaims: number;
    nextActions: number;
  };
  sourcePostureRequired: boolean;
  blockedClaimSignalGroups: string[][];
  evidenceNeededSignalGroups: string[][];
};

export type ExecutiveIntelligenceAssetPage = {
  id: string;
  moduleId: ExecutiveIntelligenceAssetPageModuleId;
  title: string;
  headline: string;
  role: string;
  visualPattern: ExecutiveIntelligenceAssetPageVisualPattern;
  focusLevel: 'slide_like' | 'proof_detail' | 'action_panel';
  outputMode: ExecutiveIntelligenceAssetOutputMode;
  outputModeRationale: string;
  sourceModuleIds: string[];
  primaryEvidence: string[];
  expandableProof: string[];
  evidenceNeeded: string[];
  blockedOverclaims: string[];
  sourcePosture: {
    status: string;
    detail: string;
  };
  proofContract: ExecutiveIntelligenceAssetPageProofContract;
  nextActions: string[];
};

export type ExecutiveIntelligenceAssetSpec = {
  id: 'executive-intelligence-asset-spec-v1';
  assetId: string;
  brandId: string;
  brandName: string;
  audience: ExecutiveIntelligenceAssetAudience;
  objective: ExecutiveIntelligenceAssetObjective;
  title: string;
  prompt: string;
  decisionSupported: string;
  narrativeArc: string[];
  supportedOutputModes: ExecutiveIntelligenceAssetOutputMode[];
  reviewState: ExecutiveIntelligenceAssetReviewState;
  exportState: ExecutiveIntelligenceAssetExportState;
  sourcePostureSummary: string;
  pageSequence: ExecutiveIntelligenceAssetPage[];
  askThisAssetPrompts: string[];
  allowedRevisionTypes: string[];
  nextOperationCandidates: string[];
  validationNotes: string[];
};

export type ExecutiveIntelligenceAssetValidationIssue = {
  severity: 'error' | 'warning';
  pageId?: string;
  moduleId?: ExecutiveIntelligenceAssetPageModuleId;
  message: string;
};

export type ExecutiveIntelligenceAssetValidationReport = {
  status: 'pass' | 'warning' | 'fail';
  issueCount: number;
  issues: ExecutiveIntelligenceAssetValidationIssue[];
};

export const executiveIntelligenceAssetPageModuleRegistry =
  pageModuleRegistryJson as ExecutiveIntelligenceAssetPageModuleRegistry;

const moduleDefinitionById = new Map(
  executiveIntelligenceAssetPageModuleRegistry.moduleDefinitions.map((definition) => [definition.moduleId, definition])
);

function unique(values: string[], limit = 8) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= limit) break;
  }
  return result;
}

function firstDefined(values: Array<string | null | undefined>, fallback: string) {
  return values.find((value) => value && value.trim()) ?? fallback;
}

function sourcePosture(status: string, detail: string): ExecutiveIntelligenceAssetPage['sourcePosture'] {
  return { status, detail };
}

function sourceReadinessSummary(packet: BrandIntelligencePacket) {
  return `${packet.sourceReadiness.status.replaceAll('_', ' ')} · demo ${packet.sourceReadiness.demoUse.replaceAll('_', ' ')} · pilot ${packet.sourceReadiness.pilotUse} · canonical ${packet.sourceReadiness.canonicalUseAllowed}`;
}

function primaryEvidenceFromCards(packet: BrandIntelligencePacket) {
  return packet.executiveVerdict.evidenceCards
    .map((card) => `${card.label}: ${card.read}`)
    .slice(0, 4);
}

export function getExecutiveIntelligenceAssetPageModuleDefinition(moduleId: ExecutiveIntelligenceAssetPageModuleId) {
  return moduleDefinitionById.get(moduleId);
}

export function getExecutiveIntelligenceAssetDefinitions() {
  return executiveIntelligenceAssetPageModuleRegistry.assetDefinitions;
}

export function getExecutiveIntelligenceAssetDefinition(id: string | undefined) {
  if (!id) return undefined;
  return executiveIntelligenceAssetPageModuleRegistry.assetDefinitions.find((definition) =>
    definition.assetId === id || definition.approvedTemplateId === id
  );
}

function proofContractFor(moduleId: ExecutiveIntelligenceAssetPageModuleId): ExecutiveIntelligenceAssetPageProofContract {
  const definition = getExecutiveIntelligenceAssetPageModuleDefinition(moduleId);
  if (!definition) throw new Error(`Missing executive intelligence asset page module definition: ${moduleId}`);
  return {
    registryId: executiveIntelligenceAssetPageModuleRegistry.id,
    moduleId,
    requiredSourceModuleIds: definition.requiredSourceModuleIds,
    requiredProofKinds: definition.requiredProofKinds,
    evidenceMinimums: {
      primaryEvidence: definition.minPrimaryEvidence,
      expandableProof: definition.minExpandableProof,
      evidenceNeeded: definition.minEvidenceNeeded,
      blockedOverclaims: definition.minBlockedOverclaims,
      nextActions: definition.minNextActions
    },
    sourcePostureRequired: definition.sourcePostureRequired,
    blockedClaimSignalGroups: definition.blockedClaimSignalGroups,
    evidenceNeededSignalGroups: definition.evidenceNeededSignalGroups
  };
}

function outputModeFor(moduleId: ExecutiveIntelligenceAssetPageModuleId) {
  const definition = getExecutiveIntelligenceAssetPageModuleDefinition(moduleId);
  if (!definition) throw new Error(`Missing executive intelligence asset page module definition: ${moduleId}`);
  return {
    outputMode: definition.outputMode,
    outputModeRationale: definition.outputModeRationale
  };
}

function includesSignalGroup(values: string[], group: string[]) {
  const text = values.join(' ').toLowerCase();
  return group.some((signal) => text.includes(signal.toLowerCase()));
}

function pushIfBelowMinimum(input: {
  issues: ExecutiveIntelligenceAssetValidationIssue[];
  page: ExecutiveIntelligenceAssetPage;
  label: string;
  actual: number;
  minimum: number;
}) {
  if (input.actual >= input.minimum) return;
  input.issues.push({
    severity: 'error',
    pageId: input.page.id,
    moduleId: input.page.moduleId,
    message: `${input.label} has ${input.actual} item(s), below required minimum ${input.minimum}.`
  });
}

export function validateExecutiveIntelligenceAssetSpec(spec: ExecutiveIntelligenceAssetSpec): ExecutiveIntelligenceAssetValidationReport {
  const issues: ExecutiveIntelligenceAssetValidationIssue[] = [];
  const pageIds = new Set<string>();

  if (!spec.pageSequence.length) {
    issues.push({ severity: 'error', message: 'Asset spec must include at least one page.' });
  }

  for (const page of spec.pageSequence) {
    if (pageIds.has(page.id)) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: 'Duplicate page id.'
      });
    }
    pageIds.add(page.id);

    const definition = getExecutiveIntelligenceAssetPageModuleDefinition(page.moduleId);
    if (!definition) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `No page module definition exists for ${page.moduleId}.`
      });
      continue;
    }

    if (page.visualPattern !== definition.visualPattern) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Visual pattern ${page.visualPattern} does not match registry pattern ${definition.visualPattern}.`
      });
    }
    if (page.focusLevel !== definition.focusLevel) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Focus level ${page.focusLevel} does not match registry focus ${definition.focusLevel}.`
      });
    }
    if (page.outputMode !== definition.outputMode) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Output mode ${page.outputMode} does not match registry output mode ${definition.outputMode}.`
      });
    }
    if (!page.outputModeRationale.trim()) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: 'Output mode rationale is required.'
      });
    }
    if (!spec.supportedOutputModes.includes(page.outputMode)) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Spec supported output modes do not include page mode ${page.outputMode}.`
      });
    }

    for (const sourceModuleId of definition.requiredSourceModuleIds) {
      if (!page.sourceModuleIds.includes(sourceModuleId)) {
        issues.push({
          severity: 'error',
          pageId: page.id,
          moduleId: page.moduleId,
          message: `Missing required source module ${sourceModuleId}.`
        });
      }
    }

    if (page.proofContract.registryId !== executiveIntelligenceAssetPageModuleRegistry.id) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Proof contract registry ${page.proofContract.registryId} does not match active registry ${executiveIntelligenceAssetPageModuleRegistry.id}.`
      });
    }
    if (page.proofContract.moduleId !== page.moduleId) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: `Proof contract module ${page.proofContract.moduleId} does not match page module ${page.moduleId}.`
      });
    }

    pushIfBelowMinimum({
      issues,
      page,
      label: 'Primary evidence',
      actual: page.primaryEvidence.length,
      minimum: definition.minPrimaryEvidence
    });
    pushIfBelowMinimum({
      issues,
      page,
      label: 'Expandable proof',
      actual: page.expandableProof.length,
      minimum: definition.minExpandableProof
    });
    pushIfBelowMinimum({
      issues,
      page,
      label: 'Evidence needed',
      actual: page.evidenceNeeded.length,
      minimum: definition.minEvidenceNeeded
    });
    pushIfBelowMinimum({
      issues,
      page,
      label: 'Blocked overclaims',
      actual: page.blockedOverclaims.length,
      minimum: definition.minBlockedOverclaims
    });
    pushIfBelowMinimum({
      issues,
      page,
      label: 'Next actions',
      actual: page.nextActions.length,
      minimum: definition.minNextActions
    });

    if (definition.sourcePostureRequired && (!page.sourcePosture.status.trim() || !page.sourcePosture.detail.trim())) {
      issues.push({
        severity: 'error',
        pageId: page.id,
        moduleId: page.moduleId,
        message: 'Source posture status and detail are required.'
      });
    }

    for (const group of definition.blockedClaimSignalGroups) {
      if (!includesSignalGroup(page.blockedOverclaims, group)) {
        issues.push({
          severity: 'warning',
          pageId: page.id,
          moduleId: page.moduleId,
          message: `Blocked overclaims should include one signal from: ${group.join(', ')}.`
        });
      }
    }

    for (const group of definition.evidenceNeededSignalGroups) {
      if (!includesSignalGroup(page.evidenceNeeded, group)) {
        issues.push({
          severity: 'warning',
          pageId: page.id,
          moduleId: page.moduleId,
          message: `Evidence needed should include one signal from: ${group.join(', ')}.`
        });
      }
    }
  }

  for (const definition of executiveIntelligenceAssetPageModuleRegistry.moduleDefinitions) {
    for (const revisionType of definition.allowedRevisionTypes) {
      if (!spec.allowedRevisionTypes.includes(revisionType)) {
        issues.push({
          severity: 'warning',
          moduleId: definition.moduleId,
          message: `Spec-level allowed revision types do not include registry revision ${revisionType}.`
        });
      }
    }
    for (const nextOperation of definition.nextOperationCandidates) {
      if (!spec.nextOperationCandidates.includes(nextOperation)) {
        issues.push({
          severity: 'warning',
          moduleId: definition.moduleId,
          message: `Spec-level next operations do not include registry operation ${nextOperation}.`
        });
      }
    }
  }

  if (spec.reviewState === 'source_owner_blocked' && spec.exportState === 'ready_after_review') {
    issues.push({
      severity: 'error',
      message: 'Source-owner blocked assets cannot be export-ready.'
    });
  }

  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  return {
    status: hasError ? 'fail' : hasWarning ? 'warning' : 'pass',
    issueCount: issues.length,
    issues
  };
}

function buildPages(packet: BrandIntelligencePacket): ExecutiveIntelligenceAssetPage[] {
  const firstTreatment = packet.executiveVerdict.treatmentPathsToConsider[0];
  const firstProvocations = packet.provocationQuestions.priorityQuestions.slice(0, 4);
  const sourceBlocks = packet.sourceReadiness.sourceBlocks.slice(0, 4);

  return [
    {
      id: '01-executive-verdict',
      moduleId: 'executive_verdict',
      title: 'Executive Verdict',
      headline: packet.executiveVerdict.headline,
        role: 'Open with the single leadership read and the decision implication.',
        visualPattern: 'hero_verdict',
        focusLevel: 'slide_like',
        ...outputModeFor('executive_verdict'),
        sourceModuleIds: ['executive_verdict', 'equity_reasoning_read'],
      primaryEvidence: unique([
        packet.executiveVerdict.verdict,
        packet.executiveVerdict.decisionImplication,
        packet.executiveVerdict.primaryWatchout,
        ...primaryEvidenceFromCards(packet)
      ], 6),
      expandableProof: unique([
        ...packet.executiveVerdict.takeaways.flatMap((takeaway) => takeaway.evidence),
        ...packet.executiveVerdict.evidenceCards.map((card) => card.source)
      ], 8),
      evidenceNeeded: packet.executiveVerdict.nextProofNeeded.slice(0, 5),
      blockedOverclaims: packet.executiveVerdict.blockedClaims.slice(0, 5),
      sourcePosture: sourcePosture(packet.executiveVerdict.confidence, packet.executiveVerdict.sourcePosture.read),
      proofContract: proofContractFor('executive_verdict'),
      nextActions: [
        'Open proof behind the verdict.',
        'Reframe for CMO or Insights Lead.',
        'Create source-owner ask list.'
      ]
    },
    {
      id: '02-benchmark-lens-read',
      moduleId: 'benchmark_lens_read',
      title: 'Benchmark Lens Read',
      headline: packet.benchmarkLensExplainer.headlineVerdict,
        role: 'Make the Momentum / Ahead / Category hierarchy explicit before the story drifts into generic strength language.',
        visualPattern: 'lens_sequence',
        focusLevel: 'slide_like',
        ...outputModeFor('benchmark_lens_read'),
        sourceModuleIds: ['benchmark_lens_explainer', 'bbe_deck_doctrine'],
      primaryEvidence: packet.benchmarkLensExplainer.lensReads
        .sort((left, right) => left.precedence - right.precedence)
        .map((lens) => `${lens.label}: ${lens.brandRead}`),
      expandableProof: packet.benchmarkLensExplainer.lensReads.flatMap((lens) => lens.evidence).slice(0, 8),
      evidenceNeeded: packet.benchmarkLensExplainer.nextProofNeeded.slice(0, 5),
      blockedOverclaims: packet.benchmarkLensExplainer.blockedMisreads.map((misread) => `${misread.claim} -> ${misread.correction}`).slice(0, 5),
      sourcePosture: sourcePosture(packet.benchmarkLensExplainer.sourcePosture.reviewStatus, packet.benchmarkLensExplainer.sourcePosture.read),
      proofContract: proofContractFor('benchmark_lens_read'),
      nextActions: [
        'Lead the asset with Momentum.',
        'Show why category index is context.',
        'Inspect Ahead/Behind size adjustment.'
      ]
    },
    {
      id: '03-primary-chart-read',
      moduleId: 'primary_chart_read',
      title: 'Primary Chart Read',
      headline: packet.chartRead.primaryChartRead.chartRead,
        role: 'Translate the source-deck chart pattern into the business read without recreating unsupported chart claims.',
        visualPattern: 'chart_read',
        focusLevel: 'slide_like',
        ...outputModeFor('primary_chart_read'),
        sourceModuleIds: ['chart_read', 'deck_chart_ledger'],
      primaryEvidence: packet.chartRead.primaryChartRead.metricPoints.map((point) => point.read).slice(0, 5),
      expandableProof: unique([
        `Slide ${packet.chartRead.primaryChartRead.sourceSlide}`,
        packet.chartRead.primaryChartRead.reconciliationStatus.replaceAll('_', ' '),
        `${packet.chartRead.primaryChartRead.processedMetricRows} processed rows`,
        `${packet.chartRead.primaryChartRead.nativeChartCount} native chart payloads`,
        ...packet.chartRead.primaryChartRead.sourceFiles
      ], 8),
      evidenceNeeded: packet.chartRead.nextProofNeeded.slice(0, 5),
      blockedOverclaims: unique([
        'Do not make unsupported claims from chart data before source-owner reconciliation.',
        ...packet.chartRead.blockedClaims.slice(0, 5)
      ], 6),
      sourcePosture: sourcePosture(packet.chartRead.primaryChartRead.evidenceStatus, packet.chartRead.sourcePosture.read),
      proofContract: proofContractFor('primary_chart_read'),
      nextActions: [
        'Open source chart reconciliation.',
        'Request chart reproduction approval.',
        'Compare with benchmark lens read.'
      ]
    },
    {
      id: '04-driver-diagnosis',
      moduleId: 'driver_diagnosis',
      title: 'Driver Diagnosis',
      headline: firstDefined(packet.equityReasoning.driverRead.tensions, 'Read M/D/S and Perceived Value together before choosing a treatment path.'),
        role: 'Show why the system is not diagnosing from isolated metric cards.',
        visualPattern: 'driver_map',
        focusLevel: 'slide_like',
        ...outputModeFor('driver_diagnosis'),
        sourceModuleIds: ['equity_reasoning_read', 'bbe_deck_doctrine'],
      primaryEvidence: unique([
        packet.equityReasoning.driverRead.demandPowerDrivers,
        packet.equityReasoning.driverRead.perceivedValueDrivers,
        ...packet.equityReasoning.driverRead.tensions
      ], 6),
      expandableProof: unique([
        ...packet.benchmarkLensExplainer.driverIntegration,
        ...packet.equityReasoning.driverRead.treatmentImplications
      ], 8),
      evidenceNeeded: unique([
        'Metric-level M/D/S and Perceived Value movement/significance.',
        'Validated driver contribution weights for the market/category/period.',
        ...packet.sourceReadiness.nextProofNeeded.slice(0, 3)
      ], 6),
      blockedOverclaims: unique([
        'Do not diagnose from one isolated input metric.',
        'Do not turn Perceived Value into SKU-level pricing guidance.',
        'Do not claim causality without causal evidence.',
        ...packet.equityReasoning.blockedClaims.slice(0, 4)
      ], 6),
      sourcePosture: sourcePosture(packet.equityReasoning.tone, packet.equityReasoning.sourcePosture.read),
      proofContract: proofContractFor('driver_diagnosis'),
      nextActions: [
        'Ask what driver tension to inspect first.',
        'Create treatment-path next step.',
        'Open evidence behind Perceived Value.'
      ]
    },
    {
      id: '05-demographic-boundary',
      moduleId: 'demographic_boundary',
      title: 'Demographic Diagnostic Boundary',
      headline: packet.demographicDiagnosticState.headline,
        role: 'Answer Kate-style demographic pressure honestly: useful workflow demo, not measured segment truth unless official cuts exist.',
        visualPattern: 'boundary_state',
        focusLevel: 'slide_like',
        ...outputModeFor('demographic_boundary'),
        sourceModuleIds: ['demographic_diagnostic_state'],
      primaryEvidence: unique([
        packet.demographicDiagnosticState.activeSegmentRead?.interpretation ?? '',
        ...packet.demographicDiagnosticState.allowedLanguage.slice(0, 2)
      ], 4),
      expandableProof: packet.demographicDiagnosticState.segmentReads
        .map((segment) => `${segment.segment}: ${segment.evidenceMode.replaceAll('_', ' ')} · base ${segment.baseSize}`)
        .slice(0, 6),
      evidenceNeeded: unique([
        'Replace simulated demographic workflow data with measured demographic source cuts before pilot use.',
        ...packet.demographicDiagnosticState.nextProofNeeded.slice(0, 6)
      ], 6),
      blockedOverclaims: packet.demographicDiagnosticState.blockedClaims.slice(0, 5),
      sourcePosture: sourcePosture(packet.demographicDiagnosticState.status, packet.demographicDiagnosticState.sourcePosture.replacementRequirement),
      proofContract: proofContractFor('demographic_boundary'),
      nextActions: [
        'Add demographic caveat.',
        'Create official demographic source ask.',
        'Show simulated workflow data.'
      ]
    },
    {
      id: '06-provocation-questions',
      moduleId: 'provocation_questions',
      title: 'Leadership Questions',
      headline: packet.provocationQuestions.headline,
        role: 'End the diagnostic read with the questions leadership and source owners need to answer next.',
        visualPattern: 'question_stack',
        focusLevel: 'slide_like',
        ...outputModeFor('provocation_questions'),
        sourceModuleIds: ['provocation_questions'],
      primaryEvidence: firstProvocations.map((question) => question.question),
      expandableProof: firstProvocations.flatMap((question) => question.evidenceToUse).slice(0, 8),
      evidenceNeeded: unique(firstProvocations.flatMap((question) => question.evidenceNeededToAnswer), 8),
      blockedOverclaims: packet.provocationQuestions.blockedQuestionPatterns.slice(0, 6),
      sourcePosture: sourcePosture('proof_gated', packet.provocationQuestions.questionStrategy),
      proofContract: proofContractFor('provocation_questions'),
      nextActions: [
        'Create source-owner ask list.',
        'Turn questions into treatment workshop.',
        'Ask what would make this read wrong.'
      ]
    },
    {
      id: '07-treatment-paths',
      moduleId: 'treatment_paths',
      title: 'Treatment Paths To Consider',
      headline: firstTreatment
        ? `${firstTreatment.name} is the first treatment path to test, not a final prescription.`
        : 'Complete evidence review before recommending a treatment path.',
        role: 'Move from read to options without pretending the AI has made the business decision.',
        visualPattern: 'treatment_options',
        focusLevel: 'slide_like',
        ...outputModeFor('treatment_paths'),
        sourceModuleIds: ['executive_verdict', 'treatment_library'],
      primaryEvidence: firstTreatment
        ? [firstTreatment.whyConsider, ...firstTreatment.inspectBeforeAction.slice(0, 3)]
        : ['No treatment path is available in the active packet.'],
      expandableProof: packet.treatmentOptions.slice(0, 3).map((treatment) => `${treatment.name}: ${treatment.globalLibraryRole}`),
      evidenceNeeded: packet.treatmentOptions.slice(0, 2).flatMap((treatment) => treatment.evidenceNeeds).slice(0, 8),
      blockedOverclaims: unique([
        'Do not present treatment paths as final prescriptions.',
        'Do not assign owners, dates, or task plans in the POC treatment read.',
        ...packet.agentGuardrails.filter((guardrail) => guardrail.includes('Treatment') || guardrail.includes('humans decide'))
      ], 6),
      sourcePosture: sourcePosture('review_before_action', 'Treatment options remain paths to consider until human review and proof inspection are complete.'),
      proofContract: proofContractFor('treatment_paths'),
      nextActions: [
        'Open treatment-path workspace.',
        'Compare top treatment options.',
        'List evidence to inspect before action.'
      ]
    },
    {
      id: '08-source-readiness-next-proof',
      moduleId: 'source_readiness_next_proof',
      title: 'Source Readiness And Next Proof',
      headline: packet.sourceReadiness.headline,
        role: 'Make the pilot/readiness boundary explicit and turn gaps into source-owner work.',
        visualPattern: 'proof_and_handoff',
        focusLevel: 'action_panel',
        ...outputModeFor('source_readiness_next_proof'),
        sourceModuleIds: ['source_readiness', 'momentum_source_readiness', 'strategic_context_readiness'],
      primaryEvidence: sourceBlocks.map((block) => `${block.label}: ${block.currentState}`),
      expandableProof: unique([
        ...packet.sourceReadiness.handoffRequirements.slice(0, 6).map((handoff) => `${handoff.owner}: ${handoff.nextAction}`),
        ...packet.sourceReadiness.blockedUses.slice(0, 4)
      ], 10),
      evidenceNeeded: packet.sourceReadiness.nextProofNeeded.slice(0, 8),
      blockedOverclaims: packet.sourceReadiness.blockedUses.slice(0, 6),
      sourcePosture: sourcePosture(packet.sourceReadiness.status, sourceReadinessSummary(packet)),
      proofContract: proofContractFor('source_readiness_next_proof'),
      nextActions: [
        'Create source-owner ask list.',
        'Mark asset as source-owner blocked.',
        'Open readiness read.'
      ]
    }
  ];
}

export function buildCmoReviewAssetSpec(packet: BrandIntelligencePacket): ExecutiveIntelligenceAssetSpec {
  return {
    id: 'executive-intelligence-asset-spec-v1',
    assetId: `${packet.brand.brandId}-cmo-review-intelligence-asset-v1`,
    brandId: packet.brand.brandId,
    brandName: packet.brand.brandName,
    audience: 'cmo',
    objective: 'decision_read',
    title: `${packet.brand.brandName} CMO Review Intelligence Asset`,
    prompt: `Build me a CMO-ready read for ${packet.brand.brandName}. Focus on whether we are actually strong or just big, what the risk is, and what we should do next.`,
    decisionSupported: `Decide how to frame ${packet.brand.brandName} for leadership: headline verdict, proof, risk, questions, treatment paths, and source-owner work before pilot/circulation.`,
      narrativeArc: [
        'Lead with the Momentum-first executive verdict.',
      'Explain category index, Ahead/Behind, and Momentum as separate benchmark lenses.',
      'Use the primary chart read to show the large/category-leading but vulnerable pattern.',
      'Diagnose M/D/S and Perceived Value as a connected driver profile.',
      'State the demographic boundary before anyone mistakes simulated workflow data for measured evidence.',
      'Turn the read into leadership questions and source-owner asks.',
      'Offer treatment paths to test, not final prescriptions.',
        'Close with source readiness and next proof.'
      ],
      supportedOutputModes: ['source_recreation', 'diagnostic_read', 'future_extension'],
      reviewState: packet.sourceReadiness.pilotUse === 'ready' ? 'pilot_candidate' : 'source_owner_blocked',
    exportState: 'gated',
    sourcePostureSummary: sourceReadinessSummary(packet),
    pageSequence: buildPages(packet),
    askThisAssetPrompts: [
      'Why are we calling this vulnerable?',
      'What would make this read wrong?',
      'Show the evidence behind Perceived Value.',
      'What should I tell Kate if she challenges the demographic read?',
      'What do we need from source owners to make this pilot-ready?'
    ],
    allowedRevisionTypes: [
      'reframe_for_cmo',
      'reframe_for_insights_lead',
      'lead_with_momentum',
      'add_demographic_caveat',
      'increase_proof_depth',
      'reduce_top_level_density',
      'create_source_owner_ask_list',
      'open_treatment_path_workspace'
    ],
    nextOperationCandidates: [
      'source_owner_ask_list',
      'treatment_path_workspace',
      'evidence_read',
      'external_context_lane'
    ],
    validationNotes: [
      'Asset is review-draft and export-gated.',
      'External context, if added later, must stay separate from BBE evidence.',
      'No page should treat simulated demographics as measured segment performance.',
      'No page should call the brand strong unless Momentum, Ahead/Behind, and driver support align.',
      'No page should use Perceived Value as SKU-level pricing guidance.'
    ]
  };
}

export function buildLaysCmoReviewAssetSpec(packet: BrandIntelligencePacket): ExecutiveIntelligenceAssetSpec {
  return buildCmoReviewAssetSpec(packet);
}

export function buildValidatedCmoReviewAssetSpec(packet: BrandIntelligencePacket) {
  const spec = buildCmoReviewAssetSpec(packet);
  return {
    spec,
    validation: validateExecutiveIntelligenceAssetSpec(spec)
  };
}

export function buildValidatedLaysCmoReviewAssetSpec(packet: BrandIntelligencePacket) {
  return buildValidatedCmoReviewAssetSpec(packet);
}
