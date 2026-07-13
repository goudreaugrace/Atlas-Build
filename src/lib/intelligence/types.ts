import type {
  BrandHealthRecord,
  DiagnosisResult,
  DiagnosisRuleTrace,
  EvidenceReadiness,
  GnVital,
  GrowthAvailabilityRecord,
  KpiDeepDiveSection,
  MentalAvailabilityRecord,
  Momentum,
  MomentumMonitor,
  PatternRadarRecord,
  TreatmentPlanOption
} from '@/src/types/domain';

export type AgentSkillFamily =
  | 'core_reasoning'
  | 'planning'
  | 'visualization'
  | 'learning'
  | 'research'
  | 'storytelling'
  | 'meeting'
  | 'system_building';

export type HumanApprovalRequirement =
  | 'not_required'
  | 'review_before_publish'
  | 'required_before_circulation'
  | 'required_for_final_takeaway';

export type PilotPriority = 'p0' | 'p1' | 'p2' | 'future';

export type DomainPackStatus = 'active_prototype' | 'pilot_candidate' | 'official' | 'retired';

export type DomainPackDefinition = {
  id: string;
  name: string;
  version: string;
  status: DomainPackStatus;
  purpose: string;
  centralRecordType: string;
  reasoningReadType: string;
  sourceRecordTypes: string[];
  knowledgeArtifacts: string[];
  reasoningArtifacts: string[];
  skillIds: string[];
  viewIds: string[];
  outputModuleIds: string[];
  guardrails: string[];
  pilotReadinessGates: string[];
};

export type AgentSkillDefinition = {
  id: string;
  name: string;
  family: AgentSkillFamily;
  purpose: string;
  primaryUserIntent: string[];
  requiredInputs: string[];
  optionalInputs: string[];
  allowedServices: string[];
  outputSchema: string;
  allowedViewIds: string[];
  guardrails: string[];
  humanApproval: HumanApprovalRequirement;
  pilotPriority: PilotPriority;
};

export type DynamicViewFamily =
  | 'metric_summary'
  | 'momentum'
  | 'diagnosis'
  | 'evidence'
  | 'planning'
  | 'comparison'
  | 'portfolio_intelligence'
  | 'learning'
  | 'storytelling'
  | 'meeting';

export type DynamicViewMode = 'brand_manager' | 'insights_lead' | 'voice_canvas';

export type DynamicViewDefinition = {
  id: string;
  name: string;
  family: DynamicViewFamily;
  purpose: string;
  requiredData: string[];
  supportedModes: DynamicViewMode[];
  claimTypes: string[];
  evidenceRequired: boolean;
  allowedSkillIds: string[];
  guardrails: string[];
};

export type EvidenceGapSeverity = 'low' | 'medium' | 'high';

export type IntelligenceEvidenceGap = {
  id: string;
  label: string;
  severity: EvidenceGapSeverity;
  missingInput: string;
  whyItMatters: string;
  bestNextSource: string;
  affectedSkills: string[];
};

export type RoomToGrowRead = {
  status: 'available' | 'partial' | 'missing';
  label: string;
  read: string;
  sourceLabel: string | null;
  evidenceMode: MomentumSourceEvidenceMode | null;
  inputs: {
    penetrationHeadroom: number | null;
    demandPowerShareVsMarketShareGap: number | null;
    categoryGrowth: number | null;
  };
  caveats: string[];
};

export type MomentumIntelligenceRead = {
  status: 'available' | 'partial' | 'missing';
  headline: string;
  demandPowerMomentum: Momentum;
  perceivedValueMomentum: Momentum;
  smdMomentum: {
    salient: Momentum;
    meaningful: Momentum;
    different: Momentum;
  };
  redSignals: string[];
  caveats: string[];
};

export type MomentumTrendDirection = 'up' | 'flat' | 'down' | 'insufficient';
export type MomentumTrendSignificance =
  | 'significant_increase'
  | 'significant_decrease'
  | 'not_significant'
  | 'not_tested';

export type MomentumTrendMetricRead = {
  metric: string;
  sourceTrendKey: string;
  periodCount: number;
  firstPeriod: string | null;
  lastPeriod: string | null;
  firstValue: number | null;
  lastValue: number | null;
  delta: number | null;
  direction: MomentumTrendDirection;
  significance: MomentumTrendSignificance;
  sourceLabel: string | null;
  caveats: string[];
  read: string;
};

export type MomentumTrendContext = {
  status: 'available' | 'partial' | 'missing';
  sourcePeriodCompatibility: 'aligned' | 'directionally_comparable' | 'lagged' | 'not_comparable' | 'insufficient';
  sourcePeriodLabel: string;
  metricReads: MomentumTrendMetricRead[];
  caveats: string[];
};

export type MomentumOutputQualityCheck = {
  id: string;
  label: string;
  status: 'pass' | 'watch' | 'gap';
  detail: string;
  guardrail: string;
};

export type OutputQualityCheck = MomentumOutputQualityCheck & {
  appliesTo: string[];
};

export type MomentumSourceEvidenceMode =
  | 'measured_partial_extract'
  | 'prototype_reviewed_partial'
  | 'directional_stakeholder_input'
  | 'missing';

export type MomentumMarketContext = {
  market: string;
  category: string;
  geography: string;
  period: string;
  categoryGrowth: number | null;
  categoryGrowthUnit: 'percent' | 'index' | 'not_available';
  maturity: 'emerging' | 'growing' | 'mature' | 'declining' | 'unknown';
};

export type MomentumPeerSet = {
  peerSetId: string;
  label: string;
  brandIds: string[];
  peerCount: number;
  selectionBasis: string;
  caveats: string[];
};

export type MomentumSmdContributionWeights = {
  salient: number;
  meaningful: number;
  different: number;
  sourceLabel: string;
  caveats: string[];
};

export type MomentumTrendEvidencePacket = {
  sourceLabel: string;
  sourcePeriodCompatibility: MomentumTrendContext['sourcePeriodCompatibility'];
  metricReads: MomentumTrendMetricRead[];
  caveats: string[];
};

export type MomentumSourceExtractReviewStatus = 'reviewed_for_prototype' | 'approved_source';
export type MomentumSourceExtractKind =
  | 'combined_momentum_source'
  | 'market_share_penetration'
  | 'bbe_contribution_weight'
  | 'bbe_movement_significance'
  | 'merged_source_owner_bundle';

export type MomentumSourceExtractPacket = {
  brandId: string;
  extractKind?: MomentumSourceExtractKind;
  sourceLabel: string;
  sourceOwner: string;
  sourceDate: string;
  reviewStatus: MomentumSourceExtractReviewStatus;
  marketContext?: MomentumMarketContext | null;
  peerSet?: MomentumPeerSet | null;
  roomToGrowInputs?: {
    penetrationHeadroom: number | null;
    demandPowerShareVsMarketShareGap: number | null;
    categoryGrowth: number | null;
  } | null;
  smdContributionWeights?: MomentumSmdContributionWeights | null;
  trendEvidence?: MomentumTrendEvidencePacket | null;
  caveats: string[];
};

export type MomentumSourceOwnerFileKind =
  | 'market_share_penetration_file'
  | 'bbe_contribution_weight_file'
  | 'bbe_movement_significance_file';

export type MomentumSourceOwnerFileRow = {
  brandId: string;
  marketContext?: MomentumMarketContext | null;
  peerSet?: MomentumPeerSet | null;
  roomToGrowInputs?: {
    penetrationHeadroom: number | null;
    demandPowerShareVsMarketShareGap: number | null;
    categoryGrowth: number | null;
  } | null;
  smdContributionWeights?: MomentumSmdContributionWeights | null;
  trendEvidence?: MomentumTrendEvidencePacket | null;
  caveats?: string[];
};

export type MomentumSourceOwnerFile = {
  fileKind: MomentumSourceOwnerFileKind;
  sourceLabel: string;
  sourceOwner: string;
  sourceDate: string;
  reviewStatus: MomentumSourceExtractReviewStatus;
  rows: MomentumSourceOwnerFileRow[];
  caveats: string[];
};

export type MomentumSourceOwnerFileBundle = {
  sourceBundleType: 'momentum_source_owner_file_bundle';
  sourceFiles: MomentumSourceOwnerFile[];
};

export type EquityReasoningTone = 'positive' | 'watch' | 'vulnerable' | 'gap';

export type EquityReasoningStrengthPermission = {
  status: 'allowed' | 'qualified' | 'blocked';
  blockedTerms: string[];
  requiredQualifier: string;
  rationale: string[];
};

export type EquityReasoningLensRead = {
  label: string;
  status: 'positive' | 'mixed' | 'negative' | 'unknown';
  read: string;
  evidence: string[];
};

export type EquityReasoningDriverRead = {
  demandPowerDrivers: string;
  perceivedValueDrivers: string;
  tensions: string[];
  treatmentImplications: string[];
};

export type EquityReasoningSourcePosture = {
  sourceId: string;
  title: string;
  reviewStatus: 'reviewed_for_prototype' | 'approved_source' | 'not_available';
  evidenceMode: string;
  allowedUses: string[];
  blockedUses: string[];
  canonicalUseAllowed: 'yes' | 'no' | 'with_caveat';
  metricRowsForBrand: number;
  sourceSlides: string[];
  sourceFiles: string[];
  chartReconciliation: {
    nativeChartAndProcessedRows: number;
    processedRowsNoNativeChart: number;
    nativeChartNoProcessedRows: number;
    noMachineReadableMetricPayload: number;
  };
  caveats: string[];
  pilotPromotionRequirement: string;
  read: string;
};

export type EquityReasoningRead = {
  id: 'equity-reasoning-read-v1';
  doctrineVersion: 'bbe-diagnostic-calibration-v1';
  headlineVerdict: string;
  tone: EquityReasoningTone;
  largeButVulnerable: boolean;
  momentumRead: EquityReasoningLensRead;
  categoryContext: EquityReasoningLensRead;
  aheadBehindRead: EquityReasoningLensRead;
  strengthLanguage: EquityReasoningStrengthPermission;
  driverRead: EquityReasoningDriverRead;
  demographicReadiness: {
    status: 'measured_available' | 'measured_limited' | 'simulated_available' | 'context_only' | 'unavailable';
    read: string;
    requiredSource: string;
  };
  evidenceGaps: string[];
  blockedClaims: string[];
  sourceCaveats: string[];
  sourcePosture: EquityReasoningSourcePosture;
};

export type BenchmarkLensExplainerLensId = 'momentum' | 'aheadBehind' | 'vsCategory';

export type BenchmarkLensExplainerLensRead = {
  id: BenchmarkLensExplainerLensId;
  label: string;
  role: 'headline_verdict' | 'size_adjusted_strength_check' | 'category_context';
  precedence: number;
  deckDefinition: string;
  sourceContext: string;
  productRule: string;
  brandRead: string;
  status: EquityReasoningLensRead['status'];
  evidence: string[];
};

export type BenchmarkLensExplainerBlockedMisread = {
  claim: string;
  correction: string;
  source: string;
};

export type BenchmarkLensExplainerModule = {
  id: 'benchmark-lens-explainer-v1';
  outputModuleId: 'benchmark_lens_explainer';
  title: string;
  subtitle: string;
  brandName: string;
  sourceReportId: string;
  sourceSlides: number[];
  headlineVerdict: string;
  lensReads: BenchmarkLensExplainerLensRead[];
  blockedMisreads: BenchmarkLensExplainerBlockedMisread[];
  driverIntegration: string[];
  nextProofNeeded: string[];
  sourcePosture: {
    title: string;
    reviewStatus: EquityReasoningSourcePosture['reviewStatus'];
    evidenceMode: string;
    canonicalUseAllowed: EquityReasoningSourcePosture['canonicalUseAllowed'];
    read: string;
    caveats: string[];
    pilotPromotionRequirement: string;
  };
};

export type ChartReadReconciliationStatus =
  | 'native_chart_and_processed_rows'
  | 'processed_rows_no_native_chart'
  | 'native_chart_no_processed_rows'
  | 'no_machine_readable_metric_payload';

export type ChartReadMetricPoint = {
  metric: string;
  displayLabel: string;
  value: string | number | null;
  categoryIndex: number | null;
  ahead: 'ahead' | 'not_ahead' | 'unknown';
  momentum: 'gaining' | 'holding' | 'declining' | 'unknown';
  sourceSlide: string;
  sourceFile: string;
  read: string;
};

export type ChartReadCard = {
  id: string;
  title: string;
  sourceSlide: number;
  chartRole: 'executive_mds_dashboard' | 'driver_relationship' | 'supporting_metric_deep_dive' | 'demographic_cut';
  reconciliationStatus: ChartReadReconciliationStatus;
  nativeChartCount: number;
  processedMetricRows: number;
  sourceFiles: string[];
  evidenceStatus: 'reconciled_chart_and_rows' | 'processed_rows_only' | 'native_chart_only' | 'not_machine_readable';
  chartRead: string;
  metricPoints: ChartReadMetricPoint[];
  guardrails: string[];
};

export type ChartReadModule = {
  id: 'chart-read-v1';
  outputModuleId: 'chart_read';
  title: string;
  subtitle: string;
  brandName: string;
  sourceReportId: string;
  primaryChartRead: ChartReadCard;
  supportingChartReads: ChartReadCard[];
  blockedClaims: string[];
  nextProofNeeded: string[];
  sourcePosture: {
    title: string;
    reviewStatus: EquityReasoningSourcePosture['reviewStatus'];
    evidenceMode: string;
    canonicalUseAllowed: EquityReasoningSourcePosture['canonicalUseAllowed'];
    read: string;
    caveats: string[];
    pilotPromotionRequirement: string;
  };
};

export type ExecutiveVerdictTone = 'positive' | 'watch' | 'vulnerable' | 'gap';

export type ExecutiveVerdictTakeaway = {
  label: string;
  body: string;
  evidence: string[];
};

export type ExecutiveVerdictEvidenceCard = {
  id: string;
  label: string;
  read: string;
  tone: 'good' | 'watch' | 'bad' | 'neutral';
  source: string;
};

export type ExecutiveVerdictTreatmentPath = {
  treatmentId: string;
  name: string;
  whyConsider: string;
  inspectBeforeAction: string[];
};

export type ExecutiveVerdictModule = {
  id: 'executive-verdict-v1';
  outputModuleId: 'executive_verdict';
  title: string;
  brandName: string;
  headline: string;
  verdict: string;
  tone: ExecutiveVerdictTone;
  confidence: 'high' | 'medium' | 'low';
  decisionImplication: string;
  primaryWatchout: string;
  takeaways: ExecutiveVerdictTakeaway[];
  evidenceCards: ExecutiveVerdictEvidenceCard[];
  treatmentPathsToConsider: ExecutiveVerdictTreatmentPath[];
  blockedClaims: string[];
  nextProofNeeded: string[];
  sourcePosture: {
    title: string;
    reviewStatus: EquityReasoningSourcePosture['reviewStatus'];
    evidenceMode: string;
    canonicalUseAllowed: EquityReasoningSourcePosture['canonicalUseAllowed'];
    read: string;
    caveats: string[];
    pilotPromotionRequirement: string;
  };
};

export type SourceReadinessStatus = 'demo_ready' | 'pilot_blocked' | 'source_ready' | 'missing';

export type SourceReadinessBlock = {
  id: string;
  label: string;
  status: 'ready' | 'review_needed' | 'blocked' | 'missing';
  sourceLabel: string | null;
  currentState: string;
  executiveUse: 'allowed' | 'blocked' | 'with_caveat';
  requiredForPilot: string;
  guardrails: string[];
};

export type SourceReadinessHandoff = {
  id: string;
  label: string;
  owner: string;
  currentStatus: string;
  nextAction: string;
  promotionGate: string;
};

export type SourceReadinessModule = {
  id: 'source-readiness-v1';
  outputModuleId: 'source_readiness';
  title: string;
  brandName: string;
  status: SourceReadinessStatus;
  headline: string;
  demoUse: 'safe_with_caveats' | 'unsafe';
  pilotUse: 'ready' | 'blocked';
  canonicalUseAllowed: 'yes' | 'no' | 'with_caveat';
  sourceBlocks: SourceReadinessBlock[];
  handoffRequirements: SourceReadinessHandoff[];
  blockedUses: string[];
  nextProofNeeded: string[];
  runtimeGovernance: {
    momentumRuntimeStatus: MomentumRuntimeSourceFileDropReadiness['status'];
    strategicRuntimeStatus: BrandStrategicContextRuntimeSourceFileDropReadiness['status'];
    defaultRuntimeConsumptionEnabled: boolean;
    canonicalUseEnabled: boolean;
    missingMomentumFileKinds: MomentumSourceOwnerFileKind[];
    missingStrategicContextFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  };
  sourcePosture: {
    title: string;
    reviewStatus: EquityReasoningSourcePosture['reviewStatus'];
    evidenceMode: string;
    canonicalUseAllowed: EquityReasoningSourcePosture['canonicalUseAllowed'];
    read: string;
    caveats: string[];
    pilotPromotionRequirement: string;
  };
};

export type DemographicDiagnosticMetricRead = {
  metric: string;
  displayLabel: string;
  value: number;
  categoryIndex: number;
  ahead: 'ahead' | 'not_ahead' | 'unknown';
  momentum: 'gaining' | 'holding' | 'declining' | 'unknown';
  read: string;
};

export type DemographicDiagnosticSegmentRead = {
  segment: string;
  baseSize: number;
  readableBase: boolean;
  evidenceMode: 'measured_bbe_cut' | 'simulated_workflow_demo' | 'context_only' | 'missing';
  allowedDiagnosticLanguage: 'measured_diagnostic' | 'simulated_workflow_only' | 'context_only' | 'blocked';
  interpretation: string;
  metricReads: DemographicDiagnosticMetricRead[];
};

export type DemographicDiagnosticStateModule = {
  id: 'demographic-diagnostic-state-v1';
  outputModuleId: 'demographic_diagnostic_state';
  title: string;
  brandName: string;
  dimension: 'age_cohort' | 'gender' | 'ethnicity' | 'income' | 'region';
  status: 'measured_available' | 'simulated_workflow_only' | 'context_only' | 'missing';
  headline: string;
  measuredDiagnosisAllowed: boolean;
  simulatedWorkflowAvailable: boolean;
  activeSegment: string;
  activeSegmentRead: DemographicDiagnosticSegmentRead | null;
  segmentReads: DemographicDiagnosticSegmentRead[];
  allowedLanguage: string[];
  blockedClaims: string[];
  requiredOfficialSource: {
    label: string;
    requiredFields: string[];
    baseSizeRule: string;
    promotionGate: string;
  };
  nextProofNeeded: string[];
  sourcePosture: {
    sourceLabel: string;
    evidenceMode: string;
    canonicalUseAllowed: 'yes' | 'no' | 'with_caveat';
    caveats: string[];
    replacementRequirement: string;
  };
};

export type ProvocationQuestionPurpose =
  | 'diagnose'
  | 'challenge'
  | 'decide'
  | 'test'
  | 'source_handoff'
  | 'growth_strategy';

export type ProvocationQuestionPriority = 'p0' | 'p1' | 'p2';

export type ProvocationQuestionSourceBasis =
  | 'deck'
  | 'kate_v7'
  | 'cmo_research'
  | 'source_readiness'
  | 'demographic_gate';

export type ProvocationQuestionRecord = {
  id: string;
  question: string;
  priority: ProvocationQuestionPriority;
  purpose: ProvocationQuestionPurpose;
  sourceBasis: ProvocationQuestionSourceBasis;
  whyItMatters: string;
  evidenceToUse: string[];
  evidenceNeededToAnswer: string[];
  blockedOverclaim: string;
};

export type ProvocationQuestionsModule = {
  id: 'provocation-questions-v1';
  outputModuleId: 'provocation_questions';
  title: string;
  brandName: string;
  headline: string;
  sourceSlides: number[];
  questionStrategy: string;
  priorityQuestions: ProvocationQuestionRecord[];
  sourceOwnerQuestions: ProvocationQuestionRecord[];
  researchBasis: {
    label: string;
    implication: string;
    sourceUrl: string;
  }[];
  blockedQuestionPatterns: string[];
  nextProofNeeded: string[];
};

export type MomentumRuntimeSourceFileDropPolicy = {
  id: string;
  lastReviewed: string;
  purpose: string;
  defaultRuntimeConsumptionEnabled: boolean;
  canonicalUseEnabled: boolean;
  acceptedBundleType: MomentumSourceOwnerFileBundle['sourceBundleType'];
  expectedSourceDirectory: string;
  templatePath: string;
  requiredFileKinds: MomentumSourceOwnerFileKind[];
  promotionRequirements: string[];
  disabledReasons: string[];
  guardrails: string[];
  caveats: string[];
};

export type MomentumRuntimeSourceFileDropAuditMode =
  | 'server_directory_scan'
  | 'not_scanned_client_context';

export type MomentumRuntimeSourceFileKindAudit = {
  fileKind: MomentumSourceOwnerFileKind;
  present: boolean;
  expectedPathHint: string;
  candidatePaths: string[];
  parsedBundleType: string | null;
  rowCount: number;
  brandIds: string[];
  reviewStatuses: MomentumSourceExtractReviewStatus[];
  issues: string[];
};

export type MomentumRuntimeSourceFileDropAudit = {
  auditMode: MomentumRuntimeSourceFileDropAuditMode;
  scannedAt: string;
  sourceDirectoryExists: boolean;
  expectedSourceDirectory: string;
  candidateFileCount: number;
  fileKindAudits: MomentumRuntimeSourceFileKindAudit[];
  caveats: string[];
};

export type MomentumRuntimeSourceFileDropReadiness = {
  id: 'momentum-runtime-source-file-drop-readiness-v1';
  policyId: string;
  status: 'blocked' | 'ready_for_governance_review' | 'ready';
  defaultRuntimeConsumptionEnabled: boolean;
  canonicalUseEnabled: boolean;
  acceptedBundleType: MomentumSourceOwnerFileBundle['sourceBundleType'];
  expectedSourceDirectory: string;
  templatePath: string;
  requiredFileKinds: MomentumSourceOwnerFileKind[];
  loadedFileKinds: MomentumSourceOwnerFileKind[];
  missingFileKinds: MomentumSourceOwnerFileKind[];
  audit: MomentumRuntimeSourceFileDropAudit;
  blockers: string[];
  nextAction: string;
  guardrails: string[];
  caveats: string[];
};

export type BrandStrategicContextSourceOwnerFileKind =
  | 'brand_foundations_file'
  | 'positioning_objectives_file'
  | 'creative_platform_claims_file';

export type BrandStrategicContextSourceOwnerFile = {
  fileKind: BrandStrategicContextSourceOwnerFileKind;
  sourceLabel: string;
  sourceOwner: string;
  sourceDate: string;
  reviewStatus: BrandStrategicContextReviewStatus;
  rows: BrandStrategicContextSourcePacket[];
  caveats: string[];
};

export type BrandStrategicContextSourceOwnerFileBundle = {
  sourceBundleType: 'brand_strategic_context_source_owner_file_bundle';
  sourceFiles: BrandStrategicContextSourceOwnerFile[];
};

export type BrandStrategicContextRuntimeSourceFileDropPolicy = {
  id: string;
  lastReviewed: string;
  purpose: string;
  defaultRuntimeConsumptionEnabled: boolean;
  canonicalUseEnabled: boolean;
  acceptedBundleType: BrandStrategicContextSourceOwnerFileBundle['sourceBundleType'];
  expectedSourceDirectory: string;
  templatePath: string;
  requiredFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  promotionRequirements: string[];
  disabledReasons: string[];
  guardrails: string[];
  caveats: string[];
};

export type BrandStrategicContextRuntimeSourceFileKindAudit = {
  fileKind: BrandStrategicContextSourceOwnerFileKind;
  present: boolean;
  expectedPathHint: string;
  candidatePaths: string[];
  parsedBundleType: string | null;
  rowCount: number;
  brandIds: string[];
  reviewStatuses: BrandStrategicContextReviewStatus[];
  sourceTypes: BrandStrategicContextSourceType[];
  issues: string[];
};

export type BrandStrategicContextRuntimeSourceFileDropAudit = {
  auditMode: MomentumRuntimeSourceFileDropAuditMode;
  scannedAt: string;
  sourceDirectoryExists: boolean;
  expectedSourceDirectory: string;
  candidateFileCount: number;
  fileKindAudits: BrandStrategicContextRuntimeSourceFileKindAudit[];
  caveats: string[];
};

export type BrandStrategicContextRuntimeSourceFileDropReadiness = {
  id: 'brand-strategic-context-runtime-source-file-drop-readiness-v1';
  policyId: string;
  status: 'blocked' | 'ready_for_governance_review' | 'ready';
  defaultRuntimeConsumptionEnabled: boolean;
  canonicalUseEnabled: boolean;
  acceptedBundleType: BrandStrategicContextSourceOwnerFileBundle['sourceBundleType'];
  expectedSourceDirectory: string;
  templatePath: string;
  requiredFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  loadedFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  missingFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  audit: BrandStrategicContextRuntimeSourceFileDropAudit;
  blockers: string[];
  nextAction: string;
  guardrails: string[];
  caveats: string[];
};

export type MomentumSourcePath =
  | 'approved_source_extract'
  | 'reviewed_prototype_source_extract'
  | 'browser_local_promoted_packet'
  | 'static_prototype_packet'
  | 'measured_growth_navigator_adapter'
  | 'missing';

export type MomentumSourceReadinessCheckStatus =
  | 'source_ready'
  | 'prototype_only'
  | 'partial'
  | 'missing';

export type MomentumSourceReadinessCheck = {
  id: string;
  label: string;
  status: MomentumSourceReadinessCheckStatus;
  sourceLabel: string | null;
  detail: string;
  requiredSource: string;
  guardrail: string;
};

export type MomentumSourceHandoffRequirement = {
  id: string;
  checkId: string;
  label: string;
  sourceOwnerRole: string;
  acceptedExtractShape: string;
  requiredFields: string[];
  validationRules: string[];
  promotionGate: string;
  canonicalUseCondition: string;
  guardrails: string[];
  starterQuestion: string;
  currentStatus: MomentumSourceReadinessCheckStatus;
  currentDetail: string;
  sourceLabel: string | null;
  nextAction: string;
};

export type MomentumSourceReadiness = {
  status: 'ready_for_prototype' | 'ready_for_source_review' | 'blocked_for_executive_use' | 'missing';
  sourcePath: MomentumSourcePath;
  sourceLabel: string | null;
  reviewStatus: MomentumSourceExtractReviewStatus | 'not_applicable';
  canonicalForExecutiveUse: boolean;
  checks: MomentumSourceReadinessCheck[];
  handoffRequirements: MomentumSourceHandoffRequirement[];
  blockers: string[];
  caveats: string[];
};

export type MomentumIntelligenceSourcePacket = {
  brandId: string;
  sourceLabel: string;
  sourceOwner: string;
  sourceDate: string;
  evidenceMode: MomentumSourceEvidenceMode;
  marketContext: MomentumMarketContext | null;
  peerSet: MomentumPeerSet | null;
  roomToGrowInputs: {
    penetrationHeadroom: number | null;
    demandPowerShareVsMarketShareGap: number | null;
    categoryGrowth: number | null;
  };
  smdContributionWeights: MomentumSmdContributionWeights | null;
  trendEvidence?: MomentumTrendEvidencePacket | null;
  caveats: string[];
};

export type GrowthProvocation = {
  id: string;
  title: string;
  what: string;
  soWhat: string;
  nowWhat: string;
  urgency: 'act_now' | 'watch' | 'longer_term_theme';
  evidenceLabels: string[];
  caveats: string[];
};

export type BrandStrategicContext = {
  status: 'available' | 'partial' | 'missing';
  officialName: 'Brand Strategic Context';
  aliases: string[];
  sourceType: BrandStrategicContextSourceType | null;
  sourceOwner: string | null;
  sourceDate: string | null;
  reviewStatus: BrandStrategicContextReviewStatus;
  brandStatement: string | null;
  brandDna: string[];
  positioning: string | null;
  objectives: string[];
  portfolioContext: string | null;
  planningPriorities: string[];
  creativePlatform: string | null;
  approvedClaims: string[];
  claimsNotToMake: string[];
  sourceLabel: string | null;
  caveats: string[];
};

export type BrandStrategicContextSourceType =
  | 'brand_book'
  | 'brand_dna'
  | 'strategy_brief'
  | 'annual_planning_doc'
  | 'creative_brief'
  | 'prototype_seed';

export type BrandStrategicContextReviewStatus =
  | 'draft'
  | 'reviewed_for_prototype'
  | 'approved_source';

export type BrandStrategicContextSourcePacket = {
  brandId: string;
  sourceType: BrandStrategicContextSourceType;
  reviewStatus: BrandStrategicContextReviewStatus;
  sourceLabel: string;
  sourceOwner: string;
  sourceDate: string;
  brandStatement: string | null;
  brandDna: string[];
  positioning: string | null;
  objectives: string[];
  portfolioContext: string | null;
  planningPriorities: string[];
  creativePlatform: string | null;
  approvedClaims: string[];
  claimsNotToMake: string[];
  caveats: string[];
};

export type BrandStrategicContextSourcePath =
  | 'approved_source_packet'
  | 'browser_local_promoted_packet'
  | 'static_prototype_packet'
  | 'missing';

export type BrandStrategicContextReadinessCheckStatus =
  | 'source_ready'
  | 'prototype_only'
  | 'partial'
  | 'missing';

export type BrandStrategicContextReadinessCheck = {
  id: string;
  label: string;
  status: BrandStrategicContextReadinessCheckStatus;
  sourceLabel: string | null;
  detail: string;
  requiredSource: string;
  guardrail: string;
};

export type BrandStrategicContextHandoffRequirement = {
  id: string;
  checkId: string;
  label: string;
  sourceOwnerRole: string;
  acceptedSourceTypes: BrandStrategicContextSourceType[];
  requiredFields: string[];
  validationRules: string[];
  promotionGate: string;
  canonicalUseCondition: string;
  guardrails: string[];
  starterQuestion: string;
  currentStatus: BrandStrategicContextReadinessCheckStatus;
  currentDetail: string;
  sourceLabel: string | null;
  nextAction: string;
};

export type BrandStrategicContextReadiness = {
  status: 'ready_for_source_review' | 'blocked_for_executive_use' | 'missing';
  sourcePath: BrandStrategicContextSourcePath;
  sourceLabel: string | null;
  reviewStatus: BrandStrategicContextReviewStatus | 'not_applicable';
  canonicalForExecutiveUse: boolean;
  checks: BrandStrategicContextReadinessCheck[];
  handoffRequirements: BrandStrategicContextHandoffRequirement[];
  blockers: string[];
  caveats: string[];
};

export type BrandIntelligencePacket = {
  generatedAt: string;
  brand: Pick<BrandHealthRecord, 'brandId' | 'brandName' | 'country' | 'category' | 'period' | 'portfolioRole' | 'typology'>;
  sourceFiles: string[];
  activeLens: BrandHealthRecord['categoryLens'];
  strategicContext: BrandStrategicContext;
  strategicContextReadiness: BrandStrategicContextReadiness;
  momentumSource: {
    sourceLabel: string;
    sourceOwner: string;
    sourceDate: string;
    evidenceMode: MomentumSourceEvidenceMode;
  } | null;
  marketContext: MomentumMarketContext | null;
  peerSet: MomentumPeerSet | null;
  smdContributionWeights: MomentumSmdContributionWeights | null;
  momentumRuntimeSourceFileDropReadiness: MomentumRuntimeSourceFileDropReadiness;
  strategicContextRuntimeSourceFileDropReadiness: BrandStrategicContextRuntimeSourceFileDropReadiness;
  displayLanguage: {
    perceivedValueMetricSource: 'Pricing Power';
    perceivedValueUserLabel: 'Perceived Value';
    perceivedValueRequiredLanguage: string;
  };
  dataCoverage: {
    metricCount: number;
    trendMetricCount: number;
    occasionCount: number;
    hasGrowthNavigator: boolean;
    growthNavigatorEvidenceMode: string;
    hasMarketContext: boolean;
    hasBrandStrategicContext: boolean;
    hasApprovedBrandStrategicContext: boolean;
    hasRuntimeBrandStrategicContextSourceFileDrop: boolean;
    hasSmdContributionWeights: boolean;
    hasRoomToGrowInputs: boolean;
    hasApprovedMomentumSource: boolean;
    hasRuntimeMomentumSourceFileDrop: boolean;
  };
  metrics: BrandHealthRecord['metrics'];
  diagnosisResult: DiagnosisResult;
  diagnosisTrace: DiagnosisRuleTrace;
  evidenceReadiness: EvidenceReadiness;
  kpiSections: KpiDeepDiveSection[];
  momentum: MomentumMonitor;
  momentumIntelligence: MomentumIntelligenceRead;
  equityReasoning: EquityReasoningRead;
  benchmarkLensExplainer: BenchmarkLensExplainerModule;
  chartRead: ChartReadModule;
  executiveVerdict: ExecutiveVerdictModule;
  sourceReadiness: SourceReadinessModule;
  demographicDiagnosticState: DemographicDiagnosticStateModule;
  provocationQuestions: ProvocationQuestionsModule;
  momentumTrendContext: MomentumTrendContext;
  momentumQualityChecks: MomentumOutputQualityCheck[];
  outputQualityChecks: OutputQualityCheck[];
  momentumSourceReadiness: MomentumSourceReadiness;
  roomToGrow: RoomToGrowRead;
  growthNavigatorVitals: GnVital[];
  growthAvailability: GrowthAvailabilityRecord;
  mentalAvailability: MentalAvailabilityRecord;
  treatmentOptions: TreatmentPlanOption[];
  patternRadar: PatternRadarRecord;
  evidenceGaps: IntelligenceEvidenceGap[];
  starterProvocations: GrowthProvocation[];
  recommendedViewIds: string[];
  agentGuardrails: string[];
};

export type DynamicViewRequest = {
  viewId: string;
  reason: string;
  requiredDataAvailable: boolean;
  fallbackViewId?: string;
};

export type ExperienceAudience =
  | 'executive'
  | 'marketer'
  | 'insights_lead'
  | 'learner'
  | 'agency'
  | 'specialist';

export type ExperienceObjective =
  | 'diagnose'
  | 'decide'
  | 'teach'
  | 'challenge'
  | 'compare'
  | 'package'
  | 'monitor'
  | 'research';

export type ExperienceLayout =
  | 'command_center'
  | 'evidence_lab'
  | 'planning_workshop'
  | 'learning_studio'
  | 'brief_builder';

export type ExperienceArtifactType =
  | 'qbr_story_draft'
  | 'talk_track'
  | 'agency_brief'
  | 'evidence_packet'
  | 'learning_practice'
  | 'decision_note';

export type ExperienceArtifactCirculationStatus =
  | 'not_for_circulation'
  | 'review_required'
  | 'reviewed_for_prototype';

export type ExperienceArtifactGovernance = {
  reviewRequirement: HumanApprovalRequirement;
  circulationStatus: ExperienceArtifactCirculationStatus;
  reviewGateId?: string;
  exportEnabled: false;
  sourceViewIds: string[];
  evidenceLabels: string[];
  guardrails: string[];
  caveats: string[];
  readiness: ExperienceArtifactReadiness;
};

export type ExperienceArtifactReadiness = {
  artifactType: ExperienceArtifactType;
  reviewerRole: string;
  requiredEvidence: string[];
  requiredLanguageApprovals: string[];
  requiredSourceViews: string[];
  promotionGate: string;
  exportGate: string;
  currentStatus: 'not_for_circulation' | 'review_required' | 'reviewed_for_prototype';
  exportBlocked: true;
  blockers: string[];
  guardrails: string[];
  nextAction: string;
};

export type ExperienceTemplateZoneDefinition = {
  id: string;
  title: string;
  purpose: string;
  viewId: string;
  requiredSkillId: string;
  evidenceRequired: boolean;
  priority: number;
};

export type ExperienceTemplateDefinition = {
  id: string;
  name: string;
  audience: ExperienceAudience;
  objective: ExperienceObjective;
  layout: ExperienceLayout;
  purpose: string;
  triggerTerms: string[];
  requiredSkillIds: string[];
  zones: ExperienceTemplateZoneDefinition[];
  artifactTypes: ExperienceArtifactType[];
  guardrails: string[];
  humanApproval: HumanApprovalRequirement;
  pilotPriority: PilotPriority;
};

export type ExperienceZone = {
  id: string;
  title: string;
  purpose: string;
  viewId: string;
  skillId: string;
  priority: number;
  evidenceRequired: boolean;
  requiredDataAvailable: boolean;
  fallbackViewId?: string;
  reason: string;
};

export type ExperienceViewManifestRecord = {
  zoneId: string;
  viewId: string;
  renderedViewId: string;
  viewName: string;
  family: DynamicViewFamily | 'unknown';
  purpose: string;
  skillId: string;
  requiredData: string[];
  dataStatus: 'ready' | 'fallback' | 'unknown_view';
  evidenceRequired: boolean;
  claimTypes: string[];
  supportedModes: DynamicViewMode[];
  guardrails: string[];
  reason: string;
  fallbackReason?: string;
};

export type ExperienceArtifact = {
  id: string;
  type: ExperienceArtifactType;
  label: string;
  status: 'available' | 'draft_ready' | 'planned' | 'blocked';
  reviewStatus?: 'pending' | 'approved' | 'rejected' | 'edited';
  reviewNote?: string;
  humanReviewRequired: boolean;
  sourceSkillId: string;
  governance: ExperienceArtifactGovernance;
};

export type ExperiencePlan = {
  planId: string;
  templateId: string;
  title: string;
  summary: string;
  audience: ExperienceAudience;
  objective: ExperienceObjective;
  layout: ExperienceLayout;
  brandId: string;
  brandName: string;
  requiredSkillIds: string[];
  zones: ExperienceZone[];
  viewManifest: ExperienceViewManifestRecord[];
  artifacts: ExperienceArtifact[];
  evidenceNeeds: IntelligenceEvidenceGap[];
  guardrails: string[];
  humanApproval: HumanApprovalRequirement;
  humanReviewRequired: boolean;
  fallbackUsed: boolean;
};

export type AgentEvidenceReference = {
  label: string;
  detail: string;
  source: string;
};

export type GroundedAgentAnswer = {
  skillId: string;
  skillName: string;
  intent: string;
  headline: string;
  answer: string;
  facts: string[];
  interpretation: string[];
  caveats: string[];
  evidence: AgentEvidenceReference[];
  missingEvidence: IntelligenceEvidenceGap[];
  dynamicViewRequests: DynamicViewRequest[];
  guardrailsApplied: string[];
};

export type BbeMomentumIntelligenceRead = GroundedAgentAnswer & {
  momentumRead: MomentumIntelligenceRead;
  roomToGrowRead: RoomToGrowRead;
  provocations: GrowthProvocation[];
};

export type GrowthProvocationSet = {
  skillId: string;
  brandName: string;
  diagnosisName: string;
  provocations: GrowthProvocation[];
  evidence: AgentEvidenceReference[];
  missingEvidence: IntelligenceEvidenceGap[];
  dynamicViewRequests: DynamicViewRequest[];
};

export type DecisionPackageDraft = {
  skillId: string;
  brandName: string;
  title: string;
  narrative: string;
  slideOutline: string[];
  requiredHumanReview: string[];
  evidence: AgentEvidenceReference[];
  caveats: string[];
};

export type AgentSkillRouterInput = {
  brandId: string;
  question: string;
  runtimeSurfaceId?: string;
  audienceMode?: 'brand_manager' | 'insights_lead';
  experienceAudience?: ExperienceAudience;
  experienceObjective?: ExperienceObjective;
  preferredExperienceTemplateId?: string;
  preferredSkillId?: string;
  activeViewId?: string;
  acceptedMemory?: AgentAcceptedMemoryContext[];
  sourcePromotionCandidates?: SourcePromotionRecord[];
  sourceClaimCandidates?: SourceClaimRecord[];
  momentumRuntimeSourceFileDropAudit?: MomentumRuntimeSourceFileDropAudit;
  strategicContextRuntimeSourceFileDropAudit?: BrandStrategicContextRuntimeSourceFileDropAudit;
};

export type AgentSkillRouterResult = {
  ok: true;
  routedSkillId: string;
  fallbackUsed: boolean;
  packet: BrandIntelligencePacket;
  answer: GroundedAgentAnswer | BbeMomentumIntelligenceRead;
  experiencePlan?: ExperiencePlan;
  acceptedMemory: AgentAcceptedMemoryContext[];
  sourcePromotionContext: SourcePromotionContext;
  sourceClaimContext: SourceClaimContext;
};

export type AgentTurnEventType =
  | 'turn_started'
  | 'packet_ready'
  | 'runtime_surface_ready'
  | 'memory_loaded'
  | 'working_context_built'
  | 'source_governance_ready'
  | 'persistence_readiness_checked'
  | 'review_identity_checked'
  | 'pilot_learning_ready'
  | 'treatment_outcome_readiness_checked'
  | 'skill_routed'
  | 'answer_ready'
  | 'evidence_spotlight_ready'
  | 'experience_planned'
  | 'canvas_state_ready'
  | 'experience_architecture_ready'
  | 'interruption_recovery_ready'
  | 'reasoning_status_ready'
  | 'conversation_presence_ready'
  | 'provider_adapters_ready'
  | 'voice_orchestration_contract_ready'
  | 'voice_orchestration_readiness_checked'
  | 'view_queued'
  | 'artifact_ready'
  | 'runtime_quality_checked'
  | 'guardrail_applied'
  | 'memory_suggested'
  | 'proactivity_suggested'
  | 'audit_recorded'
  | 'turn_completed';

export type AgentTurnEvent = {
  id: string;
  type: AgentTurnEventType;
  label: string;
  detail: string;
  timestamp: string;
  skillId?: string;
  viewId?: string;
  artifactId?: string;
  guardrail?: string;
};

export type AgentMemoryRecordType =
  | 'accepted_assumption'
  | 'open_question'
  | 'decision_candidate'
  | 'artifact_draft'
  | 'evidence_gap'
  | 'guardrail';

export type AgentMemoryRecord = {
  id: string;
  type: AgentMemoryRecordType;
  label: string;
  detail: string;
  status: 'suggested' | 'accepted' | 'rejected' | 'blocked';
  sourceTurnId: string;
  brandId: string;
  evidenceLabels: string[];
  humanReviewRequired: boolean;
};

export type AgentAcceptedMemoryContext = {
  id: string;
  type: AgentMemoryRecordType;
  label: string;
  detail: string;
  sourceTurnId: string;
  brandId: string;
  evidenceLabels: string[];
  reviewStatus: 'accepted';
  humanReviewRequired: boolean;
};

export type AgentAuditAction =
  | 'turn_started'
  | 'packet_built'
  | 'runtime_surface_checked'
  | 'accepted_memory_loaded'
  | 'source_claim_context_loaded'
  | 'working_context_built'
  | 'source_governance_checked'
  | 'persistence_readiness_checked'
  | 'review_identity_checked'
  | 'pilot_learning_ready'
  | 'treatment_outcome_readiness_checked'
  | 'skill_selected'
  | 'evidence_spotlight_created'
  | 'experience_planned'
  | 'canvas_state_built'
  | 'experience_architecture_checked'
  | 'interruption_recovery_ready'
  | 'reasoning_status_built'
  | 'conversation_presence_built'
  | 'provider_adapters_built'
  | 'voice_orchestration_contract_checked'
  | 'voice_orchestration_readiness_checked'
  | 'view_requested'
  | 'artifact_generated'
  | 'runtime_quality_checked'
  | 'guardrail_applied'
  | 'memory_suggested'
  | 'proactivity_suggested'
  | 'turn_completed';

export type AgentAuditRecord = {
  id: string;
  action: AgentAuditAction;
  label: string;
  detail: string;
  timestamp: string;
  turnId: string;
  brandId: string;
  skillId?: string;
  viewId?: string;
  artifactId?: string;
  evidenceLabels: string[];
  requiresConfirmation: boolean;
};

export type AgentSessionAuditSummary = {
  id: 'agent-session-audit-summary-v1';
  sessionId: string;
  mode: 'prototype_runtime_audit_continuity';
  store: 'local_json';
  turnsWithAudit: number;
  records: number;
  recordsRequiringConfirmation: number;
  actionCounts: { action: AgentAuditAction; count: number }[];
  skillIds: string[];
  viewIds: string[];
  artifactIds: string[];
  evidenceLabels: string[];
  latestRecords: {
    id: string;
    action: AgentAuditAction;
    label: string;
    detail: string;
    timestamp: string;
    turnId: string;
    brandId: string;
    skillId?: string;
    viewId?: string;
    artifactId?: string;
    evidenceLabels: string[];
    requiresConfirmation: boolean;
  }[];
  turnLifecycleAudited: boolean;
  evidenceUseAudited: boolean;
  viewRequestsAudited: boolean;
  artifactGenerationAudited: boolean;
  memorySuggestionsAudited: boolean;
  sourceGovernanceAudited: boolean;
  runtimeQualityAudited: boolean;
  auditExportEnabled: false;
  auditCanonicalWriteEnabled: false;
  enterpriseAuditStoreEnabled: false;
  auditGovernanceProtocol: {
    id:
      | 'runtime_audit_capture'
      | 'confirmation_linkage'
      | 'coverage_completeness'
      | 'audit_export_governance'
      | 'enterprise_audit_store_governance'
      | 'canonical_audit_write_governance';
    label: string;
    status: 'ready' | 'ready_for_review' | 'blocked';
    requiredBefore:
      | 'prototype_audit_review'
      | 'audit_export'
      | 'enterprise_audit_store'
      | 'canonical_audit_write';
    proof: string;
    blockers: string[];
    enablesAuditExport: false;
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionMemoryAuditSummary = {
  id: 'agent-session-memory-audit-v1';
  sessionId: string;
  mode: 'prototype_memory_audit_continuity';
  store: 'local_json';
  turnsWithWorkingContext: number;
  memory: {
    total: number;
    suggested: number;
    accepted: number;
    rejected: number;
    blocked: number;
    humanReviewRequired: number;
  };
  memoryTypeCounts: { type: AgentMemoryRecordType; count: number }[];
  acceptedMemoryContextIds: string[];
  acceptedMemorySourceTurnIds: string[];
  reviewGateIds: string[];
  blockedMemoryGateIds: string[];
  memoryReviewDecisions: {
    accepted: number;
    edited: number;
    rejected: number;
    total: number;
  };
  auditCoverage: {
    memoryAuditRecords: number;
    turnsWithMemoryAudit: number;
    workingContextAudited: boolean;
    memorySuggestionsAudited: boolean;
    acceptedMemoryLoadedAudited: boolean;
    runtimeQualityMemoryReviewChecked: boolean;
    latestMemoryAuditLabels: string[];
  };
  latestMemory: {
    id: string;
    type: AgentMemoryRecordType;
    label: string;
    status: AgentMemoryRecord['status'];
    sourceTurnId: string;
    evidenceLabels: string[];
    humanReviewRequired: boolean;
  }[];
  memoryPromotionProtocol: {
    id:
      | 'suggested_memory_capture'
      | 'human_memory_review'
      | 'accepted_working_context'
      | 'canonical_memory_governance'
      | 'enterprise_memory_storage'
      | 'memory_auto_accept_automation';
    label: string;
    status: 'ready_for_review' | 'accepted_for_context' | 'blocked';
    requiredBefore:
      | 'working_context_load'
      | 'canonical_memory_write'
      | 'enterprise_memory_store'
      | 'memory_auto_accept';
    proof: string;
    blockers: string[];
    enablesCanonicalMemory: false;
  }[];
  autoAcceptMemoryEnabled: false;
  reviewedMemoryWriteEnabled: false;
  canonicalMemoryWriteEnabled: false;
  enterpriseMemoryStoreEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentConfirmationGate = {
  id: string;
  action: 'circulate_artifact' | 'export_artifact' | 'accept_memory' | 'promote_source_claim' | 'write_source_data';
  label: string;
  reason: string;
  required: boolean;
  status: 'required' | 'not_required' | 'blocked' | 'approved' | 'dismissed';
  relatedArtifactId?: string;
  relatedMemoryId?: string;
  relatedSourceClaimId?: string;
};

export type AgentRuntimeQualityCheckStatus = 'pass' | 'watch' | 'blocked';

export type AgentRuntimeQualityCheck = {
  id: string;
  label: string;
  status: AgentRuntimeQualityCheckStatus;
  detail: string;
  evidenceLabels: string[];
  relatedGateIds: string[];
  guardrails: string[];
  humanReviewRequired: boolean;
};

export type AgentRuntimeQualityTurnRecord = {
  id: string;
  turnId: string;
  brandId: string;
  brandName: string;
  checks: AgentRuntimeQualityCheck[];
};

export type AgentCapabilityTurnRecord = {
  id: string;
  turnId: string;
  brandId: string;
  brandName: string;
  capabilities: AgentCapabilityDefinition[];
  runtimeControl: AgentRuntimeControlManifest;
};

export type AgentSessionCapabilityReadinessSummary = {
  id: 'agent-session-capability-readiness-v1';
  sessionId: string;
  mode: 'prototype_risky_capability_promotion_readiness';
  store: 'local_json';
  turnsWithCapabilityState: number;
  capabilities: {
    id: AgentCapabilityId;
    label: string;
    enabled: boolean;
    riskLevel: AgentCapabilityDefinition['riskLevel'];
    requiredHumanApproval: HumanApprovalRequirement;
    blockedReason: string | null;
    allowedActions: AgentConfirmationGate['action'][];
  }[];
  enabledCapabilityIds: AgentCapabilityId[];
  disabledCapabilityIds: AgentCapabilityId[];
  highRiskDisabledCapabilityIds: AgentCapabilityId[];
  mediumRiskDisabledCapabilityIds: AgentCapabilityId[];
  riskyCapabilitiesDisabled: AgentCapabilityId[];
  adminOverrideRequiredFor: AgentCapabilityId[];
  blockedCapabilityGateIds: string[];
  requiredReviewGateIds: string[];
  reviewedGateIds: string[];
  blockedGateCountsByAction: { action: AgentConfirmationGate['action']; count: number }[];
  exportEnabled: false;
  circulationEnabled: false;
  reviewedMemoryWriteEnabled: false;
  sourceClaimPromotionEnabled: false;
  sourceDataWriteEnabled: false;
  externalResearchIngestEnabled: false;
  continuousVoiceEnabled: false;
  runtimeEnabled: boolean;
  killSwitchActiveEver: boolean;
  runtimeBypassAllowed: false;
  allRiskyCapabilitiesDisabled: boolean;
  riskyCapabilityPromotionProtocol: {
    id:
      | 'capability_request'
      | 'human_review_gate'
      | 'policy_config_change'
      | 'runtime_control_validation'
      | 'integration_evidence'
      | 'production_rollout_governance';
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    requiredBefore:
      | 'prototype_review'
      | 'capability_enablement'
      | 'runtime_execution'
      | 'surface_promotion'
      | 'production_use';
    proof: string;
    blockers: string[];
    enablesCapability: false;
  }[];
  nextPromotionRequirements: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionRuntimeQualitySummary = {
  id: 'agent-session-runtime-quality-v1';
  sessionId: string;
  mode: 'prototype_runtime_quality_consistency';
  store: 'local_json';
  turnsWithRuntimeQuality: number;
  checkStatusCounts: {
    pass: number;
    watch: number;
    blocked: number;
  };
  checkIds: string[];
  consistentlyPassingCheckIds: string[];
  watchCheckIds: string[];
  blockedCheckIds: string[];
  humanReviewRequiredCheckIds: string[];
  latestChecks: {
    id: string;
    label: string;
    status: AgentRuntimeQualityCheckStatus;
    detail: string;
    evidenceLabels: string[];
    relatedGateIds: string[];
    humanReviewRequired: boolean;
  }[];
  approvedExperienceConsistent: boolean;
  evidenceAttachmentConsistent: boolean;
  sourceContextNonCanonicalConsistent: boolean;
  artifactExportDisabledConsistent: boolean;
  memoryReviewControlledConsistent: boolean;
  continuousVoiceDisabledConsistent: boolean;
  providerAdaptersGovernedConsistent: boolean;
  voiceOrchestrationGatedConsistent: boolean;
  runtimeSurfaceGovernedConsistent: boolean;
  guardrails: string[];
  caveats: string[];
};

export type AgentWorkingContextManifest = {
  id: 'agent-working-context-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  loadedContextTypes: Array<'brand_intelligence_packet' | 'accepted_memory' | 'source_promotion_candidates' | 'source_claim_candidates'>;
  acceptedMemory: Pick<
    AgentAcceptedMemoryContext,
    'id' | 'type' | 'label' | 'sourceTurnId' | 'evidenceLabels' | 'humanReviewRequired'
  >[];
  suggestedMemoryCount: number;
  sourcePromotionCandidateIds: string[];
  sourceClaimCandidateIds: string[];
  memoryReviewGateIds: string[];
  sourceReviewGateIds: string[];
  autoAcceptMemoryEnabled: false;
  sourcePromotionAutoConsumption: false;
  sourceClaimAutoConsumption: false;
  canonicalSourceWriteEnabled: false;
  canonicalClaimWriteEnabled: false;
  caveats: string[];
};

export type AgentPersistenceRequirementStatus = 'ready' | 'prototype_ready' | 'blocked';

export type AgentPersistenceRequirement = {
  id: string;
  label: string;
  owner: string;
  requiredFor: string[];
  recordTypes: string[];
  status: AgentPersistenceRequirementStatus;
  evidenceSourceIds: string[];
  acceptanceCriteria: string[];
  blockers: string[];
  nextAction: string;
  guardrails: string[];
};

export type AgentPersistenceReadinessManifest = {
  id: 'agent-persistence-readiness-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'storage_promotion_checklist';
  currentStorageMode: 'browser_local_and_local_json_prototype';
  browserLocalLedgerEnabled: true;
  localJsonPersistenceEnabled: true;
  enterprisePersistenceEnabled: false;
  reviewActionsEnabled: true;
  acceptedMemoryLoadsIntoContext: true;
  canonicalSourceWritesEnabled: false;
  sourceRuntimeAutoConsumptionEnabled: false;
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  persistedRecordTypes: string[];
  requirements: AgentPersistenceRequirement[];
  nextPromotionStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentReviewIdentityPolicyMode = 'prototype_reviewer_label_only';
export type AgentReviewableItemType = 'memory' | 'artifact' | 'confirmation_gate' | 'source_promotion_record' | 'source_claim_record';
export type AgentPrototypeReviewDecision = 'accepted' | 'rejected' | 'edited' | 'approved' | 'dismissed';
export type AgentBlockedEnterpriseApprovalType =
  | 'official_memory_approval'
  | 'artifact_circulation_approval'
  | 'canonical_source_promotion'
  | 'enterprise_transcript_retention';

export type AgentReviewIdentityPolicy = {
  id: 'agent-review-identity-policy-v1';
  lastReviewed: string;
  mode: AgentReviewIdentityPolicyMode;
  purpose: string;
  prototypeReviewerLabel: 'human_review';
  enterpriseIdentityEnabled: false;
  roleBasedAccessEnabled: false;
  brandAccessControlEnabled: false;
  officialApprovalEnabled: false;
  reviewableItemTypes: AgentReviewableItemType[];
  allowedPrototypeDecisions: AgentPrototypeReviewDecision[];
  blockedEnterpriseApprovalTypes: AgentBlockedEnterpriseApprovalType[];
  requiredBeforeEnterpriseApproval: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentReviewIdentityManifest = {
  id: 'agent-review-identity-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  policyId: AgentReviewIdentityPolicy['id'];
  mode: AgentReviewIdentityPolicyMode;
  prototypeReviewerLabel: 'human_review';
  enterpriseIdentityEnabled: false;
  roleBasedAccessEnabled: false;
  brandAccessControlEnabled: false;
  officialApprovalEnabled: false;
  accountableReviewerKnown: false;
  reviewActionsUsePrototypeIdentity: true;
  localReviewWorkflowEnabled: true;
  officialApprovalBlocked: true;
  reviewableItemTypes: AgentReviewableItemType[];
  allowedPrototypeDecisions: AgentPrototypeReviewDecision[];
  blockedEnterpriseApprovalTypes: AgentBlockedEnterpriseApprovalType[];
  requiredBeforeEnterpriseApproval: string[];
  relatedGateIds: string[];
  relatedReviewRecordIds: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionPersistenceGovernanceSummary = {
  id: 'agent-session-persistence-governance-v1';
  sessionId: string;
  mode: 'prototype_persistence_governance_continuity';
  store: 'local_json';
  turnsWithWorkingContext: number;
  turnsWithPersistenceReadiness: number;
  turnsWithReviewIdentity: number;
  loadedContextTypes: AgentWorkingContextManifest['loadedContextTypes'];
  acceptedMemoryIds: string[];
  sourcePromotionCandidateIds: string[];
  sourceClaimCandidateIds: string[];
  memoryReviewGateIds: string[];
  sourceReviewGateIds: string[];
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  persistedRecordTypes: string[];
  latestNextPromotionStep: string | null;
  reviewableItemTypes: AgentReviewableItemType[];
  allowedPrototypeDecisions: AgentPrototypeReviewDecision[];
  blockedEnterpriseApprovalTypes: AgentBlockedEnterpriseApprovalType[];
  requiredBeforeEnterpriseApproval: string[];
  relatedGateIds: string[];
  browserLocalLedgerEnabled: boolean;
  localJsonPersistenceEnabled: boolean;
  reviewActionsEnabled: boolean;
  acceptedMemoryLoadsIntoContext: boolean;
  enterprisePersistenceEnabled: false;
  enterpriseIdentityEnabled: false;
  roleBasedAccessEnabled: false;
  brandAccessControlEnabled: false;
  officialApprovalEnabled: false;
  officialApprovalBlocked: true;
  autoAcceptMemoryEnabled: false;
  sourcePromotionAutoConsumption: false;
  sourceClaimAutoConsumption: false;
  canonicalSourceWritesEnabled: false;
  canonicalClaimWritesEnabled: false;
  sourceRuntimeAutoConsumptionEnabled: false;
  enterprisePersistencePromotionProtocol: {
    id:
      | 'local_json_store'
      | 'reviewed_local_decisions'
      | 'enterprise_schema'
      | 'identity_access_control'
      | 'retention_backup_privacy'
      | 'canonical_promotion_governance';
    label: string;
    status: AgentPersistenceRequirementStatus;
    requiredBefore:
      | 'prototype_continuity'
      | 'enterprise_persistence'
      | 'official_approval'
      | 'canonical_memory_or_source'
      | 'production_operations';
    proof: string;
    blockers: string[];
    enablesEnterprisePersistence: false;
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentProactivitySuggestionType =
  | 'evidence_gap_follow_up'
  | 'source_owner_handoff'
  | 'artifact_review'
  | 'memory_review'
  | 'decision_follow_up';

export type AgentProactivitySuggestion = {
  id: string;
  type: AgentProactivitySuggestionType;
  label: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedTiming: 'now' | 'next_session' | 'when_source_available' | 'before_meeting';
  relatedEvidenceLabels: string[];
  relatedGapIds: string[];
  relatedGateIds: string[];
  relatedArtifactIds: string[];
  allowedNextSkillIds: string[];
  humanReviewRequired: boolean;
};

export type AgentHeldNotice = {
  id: string;
  label: string;
  reason: string;
  heldBecause: string;
  relatedGateIds: string[];
};

export type AgentProactivityManifest = {
  id: 'agent-proactivity-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'quiet_suggestions_only';
  autonomousActionsEnabled: false;
  scheduledNotificationsEnabled: false;
  externalSendEnabled: false;
  canCreateReminders: false;
  noOverlappingRuns: true;
  suggestions: AgentProactivitySuggestion[];
  heldNotices: AgentHeldNotice[];
  caveats: string[];
};

export type AgentSessionProactivitySummary = {
  id: 'agent-session-proactivity-v1';
  sessionId: string;
  mode: 'prototype_quiet_proactivity_continuity';
  store: 'local_json';
  turnsWithProactivity: number;
  suggestions: {
    total: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    humanReviewRequired: number;
  };
  heldNotices: {
    total: number;
    heldBecause: string[];
  };
  suggestionTypes: Array<{
    type: AgentProactivitySuggestionType;
    count: number;
  }>;
  suggestedTimings: Array<{
    timing: AgentProactivitySuggestion['suggestedTiming'];
    count: number;
  }>;
  latestSuggestions: AgentProactivitySuggestion[];
  latestHeldNotices: AgentHeldNotice[];
  relatedEvidenceLabels: string[];
  relatedGapIds: string[];
  relatedGateIds: string[];
  relatedArtifactIds: string[];
  allowedNextSkillIds: string[];
  autonomousActionsEnabled: false;
  scheduledNotificationsEnabled: false;
  externalSendEnabled: false;
  canCreateReminders: false;
  noOverlappingRuns: boolean;
  backgroundRunsEnabled: false;
  sourcePromotionEnabled: false;
  reviewRequiredBeforeAction: true;
  proactivityPromotionProtocol: {
    id:
      | 'quiet_suggestion_capture'
      | 'held_notice_review'
      | 'human_action_review'
      | 'reminder_scheduling_governance'
      | 'external_background_operations'
      | 'autonomous_action_rollout';
    label: string;
    status: 'ready_for_review' | 'held_for_review' | 'blocked';
    requiredBefore:
      | 'human_follow_up'
      | 'reminder_creation'
      | 'scheduled_notification'
      | 'external_send_or_background_run'
      | 'autonomous_action';
    proof: string;
    blockers: string[];
    enablesAutonomousAction: false;
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentPilotLearningSignalType =
  | 'question_intent'
  | 'skill_route'
  | 'experience_template'
  | 'rendered_view'
  | 'artifact_draft'
  | 'evidence_gap'
  | 'review_decision'
  | 'source_candidate'
  | 'voice_readiness'
  | 'follow_up_proof';

export type AgentPilotLearningSignalStatus = 'captured_for_review' | 'blocked' | 'not_available';

export type AgentPilotLearningSignal = {
  id: string;
  type: AgentPilotLearningSignalType;
  label: string;
  detail: string;
  status: AgentPilotLearningSignalStatus;
  relatedViewIds: string[];
  relatedGateIds: string[];
  relatedEvidenceLabels: string[];
  humanReviewRequired: boolean;
};

export type AgentPilotLearningManifest = {
  id: 'agent-pilot-learning-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'reviewed_learning_signals_only';
  learningLoopEnabled: true;
  autonomousLearningEnabled: false;
  outcomeLearningEnabled: false;
  canonicalMemoryWriteEnabled: false;
  canonicalSourceWriteEnabled: false;
  treatmentOutcomeClaimsEnabled: false;
  signals: AgentPilotLearningSignal[];
  blockedLearningPaths: string[];
  nextProofNeeds: string[];
  relatedReviewGateIds: string[];
  relatedEvidenceGapIds: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentTreatmentOutcomeReadinessPolicy = {
  id: string;
  lastReviewed: string;
  purpose: string;
  mode: 'outcome_learning_promotion_checklist';
  outcomeLearningEnabled: false;
  treatmentOutcomeClaimsEnabled: false;
  acceptedOutcomeRecordStoreEnabled: false;
  canonicalLearningStoreEnabled: false;
  requirements: {
    id: string;
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    requiredFor: 'outcome_record_capture' | 'follow_up_signal_linkage' | 'treatment_efficacy_summary' | 'portfolio_learning' | 'canonical_learning_store';
    requiredEvidence: string[];
    blockers: string[];
    guardrails: string[];
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentTreatmentOutcomeReadinessManifest = {
  id: 'agent-treatment-outcome-readiness-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  policyId: string;
  mode: 'outcome_learning_promotion_checklist';
  outcomeLearningEnabled: false;
  treatmentOutcomeClaimsEnabled: false;
  acceptedOutcomeRecordStoreEnabled: false;
  canonicalLearningStoreEnabled: false;
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  requirements: AgentTreatmentOutcomeReadinessPolicy['requirements'];
  relatedTreatmentIds: string[];
  relatedFollowUpSignals: string[];
  relatedLearningSignalIds: string[];
  nextPromotionStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentCanvasProofRailSection =
  | 'facts'
  | 'evidence_used'
  | 'claim_spotlight'
  | 'gaps_before_action'
  | 'source_readiness'
  | 'runtime_quality'
  | 'experience_plan'
  | 'canvas_state'
  | 'runtime_events'
  | 'working_context'
  | 'quiet_follow_ups'
  | 'pilot_learning'
  | 'treatment_outcomes'
  | 'review_queue'
  | 'provider_adapters'
  | 'voice_policy';

export type AgentCanvasStateManifest = {
  id: 'agent-canvas-state-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'experience_plan_driven';
  planId: string | null;
  templateId: string | null;
  layout: ExperienceLayout | 'fallback_stack';
  focusedZoneId: string | null;
  focusedViewId: string | null;
  activeZoneIds: string[];
  activeViewIds: string[];
  renderedViewIds: string[];
  fallbackViewIds: string[];
  voiceCompatibleViewIds: string[];
  artifactIds: string[];
  pendingGateIds: string[];
  evidenceGapIds: string[];
  proofRailSections: AgentCanvasProofRailSection[];
  dynamicUiGenerationEnabled: false;
  arbitraryViewIdsAllowed: false;
  preservesCanvasUntilNextTurn: true;
  interruptionRecovery: 'preserve_current_canvas_until_next_governed_turn';
  humanReviewRequired: boolean;
  guardrails: string[];
  caveats: string[];
};

export type AgentExperienceArchitectureManifest = {
  id: 'agent-experience-architecture-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'approved_experience_plan_composition';
  activeTemplateId: string | null;
  activeAudience: ExperienceAudience | null;
  activeObjective: ExperienceObjective | null;
  activeLayout: ExperienceLayout | 'fallback_stack';
  approvedTemplateCount: number;
  approvedSkillCount: number;
  approvedViewCount: number;
  supportedAudiences: ExperienceAudience[];
  supportedObjectives: ExperienceObjective[];
  supportedLayouts: ExperienceLayout[];
  renderedViewIds: string[];
  fallbackViewIds: string[];
  unknownViewIds: string[];
  artifactTypes: ExperienceArtifactType[];
  humanReviewRequired: boolean;
  dynamicUiGenerationEnabled: false;
  arbitraryViewIdsAllowed: false;
  unsupportedMetricGenerationEnabled: false;
  newSourceClaimGenerationEnabled: false;
  compositionBlockers: string[];
  nextCompositionStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentInterruptionRecoveryManifest = {
  id: 'agent-interruption-recovery-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'single_turn_interruptible';
  relatedCanvasStateId: AgentCanvasStateManifest['id'];
  focusedViewId: string | null;
  canInterruptCurrentTurn: true;
  preservesLastCompletedCanvas: true;
  noOverlappingRuns: true;
  clientStreamAbortSupported: true;
  serverSideCancelSupported: false;
  continuousVoiceBargeInEnabled: false;
  typedRecoveryPromptAvailable: true;
  suggestedRecoveryPrompts: string[];
  pendingGateIds: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentReasoningStatusPhase =
  | 'intake'
  | 'context'
  | 'skill'
  | 'evidence'
  | 'experience'
  | 'governance'
  | 'response';

export type AgentReasoningStatusStep = {
  id: string;
  phase: AgentReasoningStatusPhase;
  label: string;
  detail: string;
  status: AgentRuntimeQualityCheckStatus;
  publicOnly: true;
  relatedEventTypes: AgentTurnEventType[];
  evidenceLabels: string[];
  viewIds: string[];
  artifactIds: string[];
  gateIds: string[];
  guardrails: string[];
};

export type AgentReasoningStatusManifest = {
  id: 'agent-reasoning-status-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'public_status_steps';
  streamEventType: 'reasoning_status_ready';
  privateReasoningExposed: false;
  steps: AgentReasoningStatusStep[];
  caveats: string[];
  guardrails: string[];
};

export type AgentReviewItemType = 'memory' | 'artifact' | 'confirmation_gate';

export type AgentReviewDecision = 'accepted' | 'rejected' | 'edited' | 'approved' | 'dismissed';

export type AgentReviewRecord = {
  id: string;
  itemType: AgentReviewItemType;
  itemId: string;
  decision: AgentReviewDecision;
  label: string;
  note: string | null;
  reviewedAt: string;
  reviewer: 'human_review';
  sessionId: string;
  beforeStatus: string;
  afterStatus: string;
};

export type AgentSessionReviewWorkflowSummary = {
  id: 'agent-session-review-workflow-v1';
  sessionId: string;
  mode: 'prototype_local_review_queue';
  reviewer: 'human_review';
  store: 'local_json';
  pending: {
    memory: number;
    artifacts: number;
    confirmationGates: number;
    total: number;
  };
  reviewed: {
    acceptedMemory: number;
    approvedArtifacts: number;
    approvedGates: number;
    rejectedOrDismissed: number;
    totalReviews: number;
  };
  blocked: {
    memory: number;
    artifacts: number;
    confirmationGates: number;
    capabilityBlockedGates: number;
  };
  officialApprovalEnabled: false;
  enterpriseIdentityEnabled: false;
  canonicalWritesEnabled: false;
  artifactExportEnabled: false;
  autoAcceptMemoryEnabled: false;
  runtimeAutoConsumptionEnabled: false;
  nextActions: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionArtifactReadinessSummary = {
  id: 'agent-session-artifact-readiness-v1';
  sessionId: string;
  mode: 'prototype_artifact_readiness_continuity';
  store: 'local_json';
  artifacts: {
    total: number;
    reviewRequired: number;
    pendingReview: number;
    prototypeReviewed: number;
    blocked: number;
    exportBlocked: number;
  };
  artifactTypeCounts: { artifactType: ExperienceArtifactType; count: number }[];
  readinessStatusCounts: { status: ExperienceArtifactReadiness['currentStatus']; count: number }[];
  requiredReviewerRoles: string[];
  requiredEvidence: string[];
  requiredSourceViews: string[];
  requiredLanguageApprovals: string[];
  blockedExportGateIds: string[];
  reviewGateIds: string[];
  latestArtifacts: {
    id: string;
    type: ExperienceArtifactType;
    label: string;
    status: ExperienceArtifact['status'];
    reviewStatus: ExperienceArtifact['reviewStatus'] | 'pending';
    readinessStatus: ExperienceArtifactReadiness['currentStatus'];
    circulationStatus: ExperienceArtifactCirculationStatus;
    exportBlocked: true;
    reviewerRole: string;
    nextAction: string;
    evidenceLabels: string[];
    sourceViewIds: string[];
  }[];
  artifactCirculationProtocol: {
    id:
      | 'draft_artifact_capture'
      | 'evidence_source_coverage'
      | 'human_prototype_review'
      | 'stakeholder_language_approval'
      | 'export_capability_gate'
      | 'external_circulation_governance';
    label: string;
    status: 'ready_for_review' | 'prototype_reviewed' | 'blocked';
    requiredBefore:
      | 'prototype_review'
      | 'stakeholder_language_approval'
      | 'artifact_export'
      | 'external_circulation';
    proof: string;
    blockers: string[];
    enablesExport: false;
  }[];
  artifactExportEnabled: false;
  artifactCopyEnabled: false;
  artifactCirculationEnabled: false;
  officialApprovalEnabled: false;
  enterprisePublishingWorkflowEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionPilotLearningSummary = {
  id: 'agent-session-pilot-learning-v1';
  sessionId: string;
  mode: 'prototype_reviewed_learning_signals';
  store: 'local_json';
  turnsWithLearning: number;
  signals: {
    total: number;
    capturedForReview: number;
    blocked: number;
    notAvailable: number;
    humanReviewRequired: number;
  };
  signalTypes: {
    type: AgentPilotLearningSignalType;
    count: number;
  }[];
  latestSignals: AgentPilotLearningSignal[];
  blockedLearningPaths: string[];
  nextProofNeeds: string[];
  autonomousLearningEnabled: false;
  outcomeLearningEnabled: false;
  canonicalMemoryWriteEnabled: false;
  canonicalSourceWriteEnabled: false;
  treatmentOutcomeClaimsEnabled: false;
  learningPromotionProtocol: {
    id:
      | 'reviewed_signal_capture'
      | 'human_learning_review'
      | 'proof_need_resolution'
      | 'outcome_linkage_governance'
      | 'canonical_learning_governance'
      | 'autonomous_learning_rollout';
    label: string;
    status: 'ready_for_review' | 'blocked';
    requiredBefore:
      | 'pilot_review'
      | 'outcome_learning'
      | 'canonical_learning'
      | 'autonomous_learning';
    proof: string;
    blockers: string[];
    enablesLearningWrite: false;
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionTreatmentOutcomeReadinessSummary = {
  id: 'agent-session-treatment-outcome-readiness-v1';
  sessionId: string;
  mode: 'prototype_treatment_outcome_readiness_usage';
  store: 'local_json';
  turnsWithTreatmentOutcomeReadiness: number;
  requirementStatusCounts: {
    ready: number;
    prototypeReady: number;
    blocked: number;
  };
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  latestRequirements: {
    id: string;
    label: string;
    status: AgentTreatmentOutcomeReadinessPolicy['requirements'][number]['status'];
    requiredFor: AgentTreatmentOutcomeReadinessPolicy['requirements'][number]['requiredFor'];
    blockers: string[];
    requiredEvidence: string[];
  }[];
  relatedTreatmentIds: string[];
  relatedFollowUpSignals: string[];
  relatedLearningSignalIds: string[];
  outcomeProofProtocol: {
    id:
      | 'baseline_capture'
      | 'follow_up_linkage'
      | 'matched_evidence'
      | 'human_review'
      | 'efficacy_rule'
      | 'portfolio_learning_governance';
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    requiredBefore: AgentTreatmentOutcomeReadinessPolicy['requirements'][number]['requiredFor'];
    proof: string;
    blockers: string[];
    enabledInPrototype: false;
  }[];
  latestNextPromotionStep: string | null;
  outcomeLearningEnabled: false;
  treatmentOutcomeClaimsEnabled: false;
  acceptedOutcomeRecordStoreEnabled: false;
  canonicalLearningStoreEnabled: false;
  efficacySummaryEnabled: false;
  portfolioLearningEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionSourceGovernanceSummary = {
  id: 'agent-session-source-governance-v1';
  sessionId: string;
  mode: 'prototype_reviewed_source_context';
  store: 'local_json';
  turnsWithSourceGovernance: number;
  sourcePromotionCandidates: {
    total: number;
    latestIds: string[];
  };
  sourceClaimCandidates: {
    total: number;
    reviewed: number;
    unreviewed: number;
    latestIds: string[];
  };
  runtimeFileDrop: {
    latestStatus: MomentumRuntimeSourceFileDropReadiness['status'] | 'not_available';
    latestAuditMode: MomentumRuntimeSourceFileDropAuditMode | 'not_available';
    latestCandidateFileCount: number;
    requiredKinds: MomentumSourceOwnerFileKind[];
    loadedKinds: MomentumSourceOwnerFileKind[];
    missingKinds: MomentumSourceOwnerFileKind[];
  };
  strategicContextRuntimeFileDrop: {
    latestStatus: BrandStrategicContextRuntimeSourceFileDropReadiness['status'] | 'not_available';
    latestAuditMode: MomentumRuntimeSourceFileDropAuditMode | 'not_available';
    latestCandidateFileCount: number;
    requiredKinds: BrandStrategicContextSourceOwnerFileKind[];
    loadedKinds: BrandStrategicContextSourceOwnerFileKind[];
    missingKinds: BrandStrategicContextSourceOwnerFileKind[];
  };
  momentumSourceReadiness: {
    latestStatus: MomentumSourceReadiness['status'] | 'not_available';
    latestPath: MomentumSourcePath | 'not_available';
    executiveCanonicalUseReady: boolean;
  };
  blockedSourceGovernancePaths: string[];
  nextSourceGovernanceSteps: string[];
  sourceClaimPromotionProtocol: {
    id:
      | 'claim_extraction'
      | 'human_claim_review'
      | 'source_owner_verification'
      | 'evidence_mapping'
      | 'canonical_fact_governance'
      | 'runtime_evidence_wiring';
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    requiredBefore:
      | 'review_candidate'
      | 'reviewed_source_claim'
      | 'official_source_fact'
      | 'packet_evidence'
      | 'canonical_fact'
      | 'runtime_auto_consumption';
    proof: string;
    blockers: string[];
    enablesCanonicalFact: false;
  }[];
  canonicalSourceWritesEnabled: false;
  canonicalClaimFactsEnabled: false;
  runtimeSourceAutoConsumptionEnabled: false;
  runtimeFileDropConsumptionEnabled: false;
  runtimeFileDropCanonicalUseEnabled: false;
  sourceClaimPromotionEnabled: false;
  sourceDataWriteEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionSourceRuntimeIngestionSummary = {
  id: 'agent-session-source-runtime-ingestion-v1';
  sessionId: string;
  mode: 'prototype_runtime_source_ingestion_gate';
  store: 'local_json';
  turnsWithSourceGovernance: number;
  latestRuntimeFileDropStatus: MomentumRuntimeSourceFileDropReadiness['status'] | 'not_available';
  latestAuditMode: MomentumRuntimeSourceFileDropAuditMode | 'not_available';
  sourceDirectorySeen: boolean;
  candidateFileCount: number;
  requiredFileKinds: MomentumSourceOwnerFileKind[];
  loadedFileKinds: MomentumSourceOwnerFileKind[];
  missingFileKinds: MomentumSourceOwnerFileKind[];
  fileKindReadiness: {
    fileKind: MomentumSourceOwnerFileKind;
    status: 'loaded_for_review' | 'missing';
  }[];
  sourceOwnerFileCoverageStatus: 'not_observed' | 'missing_required_files' | 'ready_for_governance_review';
  latestMomentumSourceReadinessStatus: MomentumSourceReadiness['status'] | 'not_available';
  latestMomentumSourcePath: MomentumSourcePath | 'not_available';
  executiveCanonicalUseReady: boolean;
  strategicContextLatestRuntimeFileDropStatus: BrandStrategicContextRuntimeSourceFileDropReadiness['status'] | 'not_available';
  strategicContextLatestAuditMode: MomentumRuntimeSourceFileDropAuditMode | 'not_available';
  strategicContextSourceDirectorySeen: boolean;
  strategicContextCandidateFileCount: number;
  strategicContextRequiredFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  strategicContextLoadedFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  strategicContextMissingFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  strategicContextFileKindReadiness: {
    fileKind: BrandStrategicContextSourceOwnerFileKind;
    status: 'loaded_for_review' | 'missing';
  }[];
  strategicContextSourceOwnerFileCoverageStatus: 'not_observed' | 'missing_required_files' | 'ready_for_governance_review';
  strategicContextReadyForGovernanceReview: boolean;
  allRequiredFilesPresent: boolean;
  readyForGovernanceReview: boolean;
  readyToWireDefaultRuntimeSource: false;
  defaultRuntimeConsumptionEnabled: false;
  canonicalUseEnabled: false;
  canonicalSourceWritesEnabled: false;
  runtimeSourceAutoConsumptionEnabled: false;
  runtimeFileDropConsumptionEnabled: false;
  runtimeFileDropCanonicalUseEnabled: false;
  sourceDataWriteEnabled: false;
  defaultRuntimeSourcePromotionProtocol: {
    id:
      | 'momentum_file_coverage'
      | 'strategic_context_file_coverage'
      | 'source_owner_approval'
      | 'canonical_use_governance'
      | 'persistence_readiness'
      | 'default_runtime_wiring';
    label: string;
    status: 'ready_for_governance_review' | 'prototype_ready' | 'blocked';
    requiredBefore:
      | 'source_owner_governance_review'
      | 'canonical_runtime_consumption'
      | 'enterprise_persistence_clearance'
      | 'default_runtime_source_wiring';
    proof: string;
    blockers: string[];
    enablesRuntimeConsumption: false;
  }[];
  governanceBlockers: string[];
  nextIngestionStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionRuntimeSurfaceSummary = {
  id: 'agent-session-runtime-surface-v1';
  sessionId: string;
  mode: 'prototype_governed_runtime_surface_usage';
  store: 'local_json';
  turnsWithRuntimeSurface: number;
  activeSurfaces: {
    surfaceId: string;
    surfaceName: string;
    surfaceType: AgentRuntimeSurfaceManifest['activeSurfaceType'];
    status: AgentRuntimeSurfaceStatus;
    count: number;
  }[];
  usedSurfaceIds: string[];
  usedReadySurfaceIds: string[];
  usedOptInSurfaceIds: string[];
  usedLegacySurfaceIds: string[];
  usedGatedSurfaceIds: string[];
  usedDisabledSurfaceIds: string[];
  latestSurface: {
    surfaceId: string;
    surfaceName: string;
    surfaceType: AgentRuntimeSurfaceManifest['activeSurfaceType'];
    status: AgentRuntimeSurfaceStatus;
    runtimePath: string;
    proofSurface: string;
    persistence: string;
    streaming: boolean;
    voice: AgentRuntimeSurfaceManifest['activeVoice'];
  } | null;
  streamingTurns: number;
  voiceTurns: number;
  pushToTalkTurns: number;
  gatedOrDisabledSurfaceAttempts: number;
  surfaceGuardrailMatrix: {
    surfaceId: string;
    surfaceName: string;
    status: AgentRuntimeSurfaceStatus;
    turns: number;
    runtimePath: string;
    proofSurface: string;
    usesGovernedRuntime: boolean;
    defaultScopedChatPreserved: boolean;
    proofRequired: true;
    fullVoiceEnabled: false;
    realtimeVoiceEnabled: false;
    ttsEnabled: false;
    continuousVoiceEnabled: false;
    exportRuntimeEnabled: false;
    sourceWriteRuntimeEnabled: false;
    guardrailStatus: 'pass' | 'watch';
  }[];
  allUsedSurfacesGuarded: boolean;
  defaultScopedChatPreserved: boolean;
  governedRuntimeOnly: boolean;
  fullVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  continuousVoiceEnabled: false;
  exportRuntimeEnabled: false;
  sourceWriteRuntimeEnabled: false;
  runtimeSurfacePromotionProtocol: {
    id:
      | 'surface_observation'
      | 'opt_in_surface_review'
      | 'default_surface_promotion'
      | 'voice_provider_runtime_governance'
      | 'export_source_write_governance'
      | 'production_surface_certification';
    label: string;
    status: 'ready' | 'ready_for_review' | 'blocked';
    requiredBefore:
      | 'prototype_surface_review'
      | 'opt_in_rollout'
      | 'default_surface_promotion'
      | 'voice_provider_activation'
      | 'export_or_source_write_runtime'
      | 'production_certification';
    proof: string;
    blockers: string[];
    enablesSurfacePromotion: false;
  }[];
  nextRuntimeSurfaceSteps: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionExperienceArchitectureSummary = {
  id: 'agent-session-experience-architecture-v1';
  sessionId: string;
  mode: 'prototype_approved_experience_composition_usage';
  store: 'local_json';
  turnsWithExperienceArchitecture: number;
  approvedRegistrySnapshot: {
    latestTemplateCount: number;
    latestSkillCount: number;
    latestViewCount: number;
  };
  activeTemplates: {
    templateId: string;
    count: number;
  }[];
  activeAudiences: {
    audience: ExperienceAudience;
    count: number;
  }[];
  activeObjectives: {
    objective: ExperienceObjective;
    count: number;
  }[];
  activeLayouts: {
    layout: ExperienceLayout | 'fallback_stack';
    count: number;
  }[];
  renderedViewIds: string[];
  fallbackViewIds: string[];
  unknownViewIds: string[];
  artifactTypes: ExperienceArtifactType[];
  compositionBlockers: string[];
  nextCompositionSteps: string[];
  humanReviewRequired: boolean;
  dynamicUiGenerationEnabled: false;
  arbitraryViewIdsAllowed: false;
  unsupportedMetricGenerationEnabled: false;
  newSourceClaimGenerationEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentCapabilityId =
  | 'artifact_export'
  | 'artifact_circulation'
  | 'reviewed_memory_write'
  | 'source_claim_promotion'
  | 'source_data_write'
  | 'external_research_ingest'
  | 'voice_continuous_mode';

export type AgentCapabilityDefinition = {
  id: AgentCapabilityId;
  label: string;
  description: string;
  enabled: boolean;
  requiredHumanApproval: HumanApprovalRequirement;
  riskLevel: 'low' | 'medium' | 'high';
  blockedReason: string | null;
  allowedActions: AgentConfirmationGate['action'][];
  guardrails: string[];
};

export type AgentRuntimeMode = 'normal' | 'degraded_read_only' | 'stopped';

export type AgentRuntimeControlScope =
  | 'agent_turns'
  | 'streaming'
  | 'voice_capture'
  | 'artifact_generation'
  | 'memory_review'
  | 'source_review';

export type AgentRuntimePolicy = {
  id: 'agent-runtime-policy-v1';
  runtimeEnabled: boolean;
  killSwitchActive: boolean;
  mode: AgentRuntimeMode;
  adminOverrideRequiredFor: AgentCapabilityId[];
  emergencyStopScope: AgentRuntimeControlScope[];
  degradedModeFallback: 'read_only_packet_inspection';
  owner: string;
  lastReviewed: string;
  caveats: string[];
  guardrails: string[];
};

export type AgentRuntimeControlManifest = {
  id: 'agent-runtime-control-manifest-v1';
  turnId: string;
  runtimePolicyId: AgentRuntimePolicy['id'];
  runtimeEnabled: boolean;
  killSwitchActive: boolean;
  mode: AgentRuntimeMode;
  degradedModeFallback: AgentRuntimePolicy['degradedModeFallback'];
  emergencyStopScope: AgentRuntimeControlScope[];
  riskyCapabilitiesDisabled: AgentCapabilityId[];
  adminOverrideRequiredFor: AgentCapabilityId[];
  failClosedIfActivated: true;
  canBypassEvidenceOrReview: false;
  caveats: string[];
  guardrails: string[];
};

export type AgentSessionRuntimeControlSummary = {
  id: 'agent-session-runtime-control-v1';
  sessionId: string;
  mode: 'prototype_runtime_control_continuity';
  store: 'local_json';
  turnsWithRuntimeControl: number;
  runtimePolicyIds: AgentRuntimePolicy['id'][];
  runtimeModes: AgentRuntimeMode[];
  runtimeEnabledConsistent: boolean;
  killSwitchActiveEver: boolean;
  killSwitchActiveTurns: number;
  degradedModeFallbacks: AgentRuntimePolicy['degradedModeFallback'][];
  emergencyStopScopes: AgentRuntimeControlScope[];
  riskyCapabilitiesDisabled: AgentCapabilityId[];
  adminOverrideRequiredFor: AgentCapabilityId[];
  failClosedConsistent: boolean;
  evidenceReviewBypassPrevented: boolean;
  latestRuntimeControl: {
    turnId: string;
    runtimePolicyId: AgentRuntimePolicy['id'];
    runtimeEnabled: boolean;
    killSwitchActive: boolean;
    mode: AgentRuntimeMode;
    degradedModeFallback: AgentRuntimePolicy['degradedModeFallback'];
    emergencyStopScope: AgentRuntimeControlScope[];
    riskyCapabilitiesDisabled: AgentCapabilityId[];
    adminOverrideRequiredFor: AgentCapabilityId[];
    failClosedIfActivated: true;
    canBypassEvidenceOrReview: false;
  } | null;
  exportEnabled: false;
  sourceWriteEnabled: false;
  externalIngestEnabled: false;
  continuousVoiceEnabled: false;
  runtimeBypassAllowed: false;
  adminBypassEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentRuntimeSurfaceStatus = 'ready' | 'ready_opt_in' | 'legacy_stable' | 'gated' | 'disabled';

export type AgentRuntimeSurfaceManifest = {
  id: 'agent-runtime-surface-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  registryId: 'governed-runtime-surface-registry-v1';
  activeSurfaceId: string;
  activeSurfaceName: string;
  activeSurfaceType: 'api' | 'ui' | 'chat_surface' | 'voice_surface' | 'provider_adapter';
  activeSurfaceStatus: AgentRuntimeSurfaceStatus;
  activeDefaultState: 'governed_default' | 'governed_opt_in' | 'scoped_legacy_default' | 'gated_candidate' | 'gated_disabled';
  activeRuntimePath: string;
  activeProofSurface: string;
  activeSessionStrategy: string;
  activePersistence: string;
  activeStreaming: boolean;
  activeVoice: 'none' | 'push_to_talk_browser_stt' | 'realtime_candidate' | 'tts_disabled';
  usesGovernedRuntime: boolean;
  isGovernedDefault: boolean;
  isOptIn: boolean;
  isLegacyStable: boolean;
  isGated: boolean;
  isDisabled: boolean;
  readySurfaceIds: string[];
  optInSurfaceIds: string[];
  legacySurfaceIds: string[];
  gatedSurfaceIds: string[];
  disabledSurfaceIds: string[];
  governedDefaultSurfaceIds: string[];
  connectedRuntimeRails: string[];
  gates: string[];
  defaultScopedChatPreserved: true;
  fullVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  continuousVoiceEnabled: false;
  proofRequired: true;
  nextSurfaceStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentVoiceMode = 'push_to_talk' | 'wake_listen' | 'continuous';
export type AgentVoiceOrchestrationMode = AgentVoiceMode | 'continuous_voice' | 'realtime_voice' | 'text_to_speech';

export type AgentVoicePolicy = {
  id: 'agent-voice-policy-v1';
  defaultMode: AgentVoiceMode;
  enabledModes: AgentVoiceMode[];
  disabledModes: AgentVoiceMode[];
  consentRequired: boolean;
  interruptHandling: 'not_ready' | 'basic' | 'ready';
  runtimeEventSource: '/api/agent/stream';
  caveats: string[];
  guardrails: string[];
};

export type AgentVoiceRuntimeManifest = {
  id: 'agent-voice-runtime-manifest-v1';
  turnId: string;
  runtimeEventSource: AgentVoicePolicy['runtimeEventSource'];
  defaultMode: AgentVoiceMode;
  enabledModes: AgentVoiceMode[];
  disabledModes: AgentVoiceMode[];
  consentBoundary: 'push_to_talk_click';
  typedFallbackAvailable: true;
  continuousModeEnabled: false;
  interruptHandling: AgentVoicePolicy['interruptHandling'];
  streamEventTypes: AgentTurnEventType[];
  compatibleViewIds: string[];
  usesGovernedRuntime: true;
  usesSameEvidenceAndGatesAsTypedTurn: true;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionVoiceRuntimeSummary = {
  id: 'agent-session-voice-runtime-v1';
  sessionId: string;
  mode: 'prototype_governed_voice_runtime_continuity';
  store: 'local_json';
  turnsWithVoiceRuntime: number;
  runtimeEventSources: AgentVoicePolicy['runtimeEventSource'][];
  defaultModes: AgentVoiceMode[];
  enabledModes: AgentVoiceMode[];
  disabledModes: AgentVoiceMode[];
  consentBoundaries: AgentVoiceRuntimeManifest['consentBoundary'][];
  streamEventTypes: AgentTurnEventType[];
  compatibleViewIds: string[];
  latestCompatibleViewIds: string[];
  latestStreamEventTypes: AgentTurnEventType[];
  pushToTalkReady: boolean;
  typedFallbackAvailable: boolean;
  usesGovernedRuntimeConsistent: boolean;
  evidenceAndGateParityConsistent: boolean;
  runtimeEventSourceConsistent: boolean;
  continuousModeEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  autonomousSpeakingEnabled: false;
  backgroundListeningEnabled: false;
  providerBypassAllowed: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentVoiceSkillViewContractStatus = 'ready' | 'gated' | 'blocked';

export type AgentVoiceSkillViewModeContract = {
  id: AgentVoiceOrchestrationMode;
  label: string;
  status: AgentVoiceSkillViewContractStatus;
  allowedSkillIds: string[];
  requiredViewIds: string[];
  optionalViewIds: string[];
  requiredReadinessIds: string[];
  blockedUntil: string[];
  guardrails: string[];
};

export type AgentVoiceSkillViewStatePhase = {
  id: string;
  label: string;
  visibleToUser: boolean;
  allowedModes: AgentVoiceOrchestrationMode[];
  guardrail: string;
};

export type AgentVoiceSkillViewContractManifest = {
  id: 'agent-voice-skill-view-contract-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'skill_view_contract_map';
  contractId: 'voice-skill-view-contract-v1';
  defaultVoiceMode: AgentVoiceMode;
  activeSkillId: string;
  activeSkillVoiceCompatible: boolean;
  activeRequestedViewIds: string[];
  activeVoiceCompatibleViewIds: string[];
  activeIncompatibleViewIds: string[];
  allowedModeIds: AgentVoiceOrchestrationMode[];
  gatedModeIds: AgentVoiceOrchestrationMode[];
  blockedModeIds: AgentVoiceOrchestrationMode[];
  readyModeIds: AgentVoiceOrchestrationMode[];
  contractSkillIds: string[];
  contractViewIds: string[];
  requiredReadinessIds: string[];
  blockedReadinessIds: string[];
  statePhases: AgentVoiceSkillViewStatePhase[];
  visibleStatePhaseIds: string[];
  pushToTalkContractReady: boolean;
  wakeListenContractReady: false;
  continuousContractReady: false;
  realtimeContractReady: false;
  ttsContractReady: false;
  continuousVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  arbitrarySkillRoutingEnabled: false;
  arbitraryViewGenerationEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentConversationPresenceState =
  | 'ready'
  | 'listening'
  | 'routing'
  | 'rendering'
  | 'speaking';

export type AgentConversationPresenceMode = 'push_to_talk_streaming_presence';

export type AgentConversationPresenceManifest = {
  id: 'agent-conversation-presence-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: AgentConversationPresenceMode;
  activeState: AgentConversationPresenceState;
  stateSequence: AgentConversationPresenceState[];
  pulseSources: Array<'voice_policy' | 'runtime_events' | 'canvas_state' | 'status_steps' | 'interruption_recovery'>;
  visibleSignals: Array<'command_core' | 'orchestration_bus' | 'module_queue' | 'status_steps' | 'voice_policy' | 'proof_rail'>;
  voiceInputMode: AgentVoiceMode;
  consentBoundary: 'push_to_talk_click';
  streamEventSource: AgentVoicePolicy['runtimeEventSource'];
  continuousListeningEnabled: false;
  backgroundWakeWordEnabled: false;
  autonomousSpeakingEnabled: false;
  typedFallbackAvailable: true;
  preservesEvidenceAndGates: true;
  compatibleViewIds: string[];
  currentStatusStepIds: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionCanvasContinuitySummary = {
  id: 'agent-session-canvas-continuity-v1';
  sessionId: string;
  mode: 'prototype_canvas_interaction_continuity';
  store: 'local_json';
  turnsWithCanvasState: number;
  turnsWithInterruptionRecovery: number;
  turnsWithReasoningStatus: number;
  turnsWithConversationPresence: number;
  latestCanvas: {
    turnId: string;
    brandId: string;
    brandName: string;
    templateId: string | null;
    layout: ExperienceLayout | 'fallback_stack';
    focusedViewId: string | null;
    renderedViewIds: string[];
    fallbackViewIds: string[];
    proofRailSections: AgentCanvasProofRailSection[];
    pendingGateIds: string[];
    evidenceGapIds: string[];
    humanReviewRequired: boolean;
  } | null;
  renderedViewIds: string[];
  fallbackViewIds: string[];
  focusedViewIds: string[];
  compatibleViewIds: string[];
  proofRailSections: AgentCanvasProofRailSection[];
  statusPhaseCounts: { phase: AgentReasoningStatusPhase; count: number }[];
  visibleSignals: AgentConversationPresenceManifest['visibleSignals'];
  pulseSources: AgentConversationPresenceManifest['pulseSources'];
  dynamicUiGenerationEnabled: false;
  arbitraryViewIdsAllowed: false;
  preservesLastCompletedCanvas: boolean;
  clientStreamAbortSupported: boolean;
  serverSideCancelSupported: false;
  noOverlappingRuns: boolean;
  continuousListeningEnabled: false;
  backgroundWakeWordEnabled: false;
  autonomousSpeakingEnabled: false;
  typedFallbackAvailable: boolean;
  privateReasoningExposed: false;
  continuousVoiceBargeInEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentProviderAdapterCapability =
  | 'text_reasoning'
  | 'server_sent_events'
  | 'browser_speech_to_text'
  | 'realtime_voice'
  | 'text_to_speech';

export type AgentProviderAdapterStatus = 'ready' | 'prototype_client_only' | 'gated' | 'disabled';

export type AgentProviderAdapterRecord = {
  id: string;
  capability: AgentProviderAdapterCapability;
  status: AgentProviderAdapterStatus;
  runtimeBoundary: 'server' | 'browser' | 'not_connected';
  providerBinding: 'deterministic_local' | 'next_sse' | 'browser_web_speech' | 'openai_realtime_candidate' | 'none';
  endpoint: string | null;
  consentRequired: boolean;
  usesServerSideSecrets: boolean;
  enabledInAgentLab: boolean;
  sharesAgentRuntime: boolean;
  evidenceAndGateParity: boolean;
  caveats: string[];
};

export type AgentProviderAdapterManifest = {
  id: 'agent-provider-adapter-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'adapter_readiness_map';
  adapters: AgentProviderAdapterRecord[];
  readyAdapterIds: string[];
  gatedAdapterIds: string[];
  disabledAdapterIds: string[];
  coreRuntimeAdapterId: 'text-reasoning-local';
  streamAdapterId: 'agent-sse-stream';
  activeVoiceInputAdapterId: 'browser-speech-single-turn';
  realtimeVoiceAdapterId: 'openai-realtime-live-consult-candidate';
  ttsAdapterId: 'tts-not-connected';
  continuousVoiceEnabled: false;
  serverSideRealtimeConnectedToAgentRuntime: false;
  ttsEnabled: false;
  requiresPolicyReviewFor: AgentProviderAdapterCapability[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionProviderAdapterSummary = {
  id: 'agent-session-provider-adapter-v1';
  sessionId: string;
  mode: 'prototype_provider_adapter_readiness_usage';
  store: 'local_json';
  turnsWithProviderAdapters: number;
  readyAdapterIds: string[];
  prototypeAdapterIds: string[];
  gatedAdapterIds: string[];
  disabledAdapterIds: string[];
  latestAdapters: {
    id: string;
    capability: AgentProviderAdapterCapability;
    status: AgentProviderAdapterStatus;
    runtimeBoundary: AgentProviderAdapterRecord['runtimeBoundary'];
    providerBinding: AgentProviderAdapterRecord['providerBinding'];
    sharesAgentRuntime: boolean;
    evidenceAndGateParity: boolean;
  }[];
  latestCoreRuntimeAdapterId: AgentProviderAdapterManifest['coreRuntimeAdapterId'] | null;
  latestStreamAdapterId: AgentProviderAdapterManifest['streamAdapterId'] | null;
  latestActiveVoiceInputAdapterId: AgentProviderAdapterManifest['activeVoiceInputAdapterId'] | null;
  latestRealtimeVoiceAdapterId: AgentProviderAdapterManifest['realtimeVoiceAdapterId'] | null;
  latestTtsAdapterId: AgentProviderAdapterManifest['ttsAdapterId'] | null;
  requiredPolicyReviewFor: AgentProviderAdapterCapability[];
  textReasoningReady: boolean;
  sseStreamingReady: boolean;
  browserSttPrototypeReady: boolean;
  realtimeRuntimeConnected: false;
  ttsEnabled: false;
  continuousVoiceEnabled: false;
  providerBypassAllowed: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentVoiceOrchestrationRequirementStatus = 'ready' | 'prototype_ready' | 'blocked';

export type AgentVoiceOrchestrationRequirement = {
  id: string;
  label: string;
  owner: string;
  requiredFor: string[];
  acceptanceCriteria: string[];
  status: AgentVoiceOrchestrationRequirementStatus;
  evidenceSourceIds: string[];
  blockers: string[];
  nextAction: string;
  guardrails: string[];
};

export type AgentVoiceOrchestrationReadinessManifest = {
  id: 'agent-voice-orchestration-readiness-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'promotion_gate_checklist';
  fullVoiceEnabled: false;
  wakeListenEnabled: false;
  continuousVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  realtimeRuntimeParity: false;
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  requirements: AgentVoiceOrchestrationRequirement[];
  nextPromotionStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionVoiceReadinessSummary = {
  id: 'agent-session-voice-readiness-v1';
  sessionId: string;
  mode: 'prototype_voice_orchestration_readiness_usage';
  store: 'local_json';
  turnsWithVoiceReadiness: number;
  requirementStatusCounts: {
    ready: number;
    prototypeReady: number;
    blocked: number;
  };
  readyRequirementIds: string[];
  prototypeRequirementIds: string[];
  blockedRequirementIds: string[];
  latestRequirements: {
    id: string;
    label: string;
    owner: string;
    status: AgentVoiceOrchestrationRequirementStatus;
    blockers: string[];
    nextAction: string;
  }[];
  latestNextPromotionStep: string | null;
  fullVoiceEnabled: false;
  wakeListenEnabled: false;
  continuousVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  realtimeRuntimeParity: false;
  consentPrivacyReady: boolean;
  serverCancellationReady: boolean;
  enterpriseVoiceStorageReady: boolean;
  voiceActivationProtocol: {
    id:
      | 'push_to_talk_runtime'
      | 'browser_stt_prototype'
      | 'realtime_runtime_unification'
      | 'interruption_and_privacy'
      | 'tts_speaking_policy'
      | 'enterprise_voice_storage';
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    requiredBefore:
      | 'push_to_talk'
      | 'realtime_voice'
      | 'continuous_voice'
      | 'text_to_speech'
      | 'enterprise_voice_memory';
    proof: string;
    blockers: string[];
    enablesFullVoice: false;
  }[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionVoiceContractSummary = {
  id: 'agent-session-voice-contract-v1';
  sessionId: string;
  mode: 'prototype_voice_skill_view_contract_usage';
  store: 'local_json';
  turnsWithVoiceContracts: number;
  usedSkillIds: string[];
  compatibleViewIds: string[];
  incompatibleViewIds: string[];
  readyModeIds: AgentVoiceOrchestrationMode[];
  gatedModeIds: AgentVoiceOrchestrationMode[];
  blockedModeIds: AgentVoiceOrchestrationMode[];
  requiredReadinessIds: string[];
  blockedReadinessIds: string[];
  latestStatePhaseIds: string[];
  activeSkillCompatibilityConsistent: boolean;
  activeViewCompatibilityConsistent: boolean;
  pushToTalkContractReady: boolean;
  wakeListenContractReady: false;
  continuousContractReady: false;
  realtimeContractReady: false;
  ttsContractReady: false;
  continuousVoiceEnabled: false;
  realtimeVoiceEnabled: false;
  ttsEnabled: false;
  arbitrarySkillRoutingEnabled: false;
  arbitraryViewGenerationEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentFoundationReadinessAreaId =
  | 'experience_architecture'
  | 'evidence_grounding'
  | 'reviewed_memory'
  | 'source_governance'
  | 'audit_quality'
  | 'runtime_control'
  | 'runtime_surfaces'
  | 'provider_adapters'
  | 'voice_readiness'
  | 'persistence_governance'
  | 'artifact_readiness'
  | 'outcome_learning';

export type AgentFoundationReadinessStatus = 'ready' | 'prototype' | 'blocked' | 'waiting';

export type AgentSessionFoundationReadinessSummary = {
  id: 'agent-session-foundation-readiness-v1';
  sessionId: string;
  mode: 'prototype_composable_agentic_foundation_readiness';
  store: 'local_json';
  turns: number;
  foundationDemoReady: boolean;
  cmoReadinessSignal: 'foundation_demo_ready_with_gated_promotions' | 'needs_governed_turns_or_review';
  readinessAreas: {
    id: AgentFoundationReadinessAreaId;
    label: string;
    status: AgentFoundationReadinessStatus;
    evidence: string;
    blockers: string[];
  }[];
  statusCounts: {
    ready: number;
    prototype: number;
    blocked: number;
    waiting: number;
  };
  governedTurnCoverage: {
    experienceArchitectureTurns: number;
    evidenceSpotlightTurns: number;
    sourceGovernanceTurns: number;
    runtimeSurfaceTurns: number;
    runtimeControlTurns: number;
    runtimeQualityTurns: number;
    canvasContinuityTurns: number;
    persistenceReadinessTurns: number;
    providerAdapterTurns: number;
    voiceRuntimeTurns: number;
    voiceReadinessTurns: number;
  };
  approvedComposition: {
    templateCount: number;
    skillCount: number;
    viewCount: number;
    renderedViewIds: string[];
    unknownViewIds: string[];
    dynamicUiGenerationEnabled: false;
    arbitraryViewIdsAllowed: false;
    unsupportedMetricGenerationEnabled: false;
  };
  proofAndReview: {
    supportedClaims: number;
    missingEvidenceClaims: number;
    guardrailClaims: number;
    acceptedMemoryRecords: number;
    pendingReviewItems: number;
    reviewedItems: number;
    blockedReviewItems: number;
    auditRecords: number;
    runtimeQualityPasses: number;
    runtimeQualityBlockedChecks: number;
  };
  sourceAndPersistence: {
    sourcePromotionCandidates: number;
    sourceClaimCandidates: number;
    localJsonPersistenceEnabled: boolean;
    enterprisePersistenceEnabled: false;
    officialApprovalEnabled: false;
    canonicalSourceWritesEnabled: false;
    runtimeSourceAutoConsumptionEnabled: false;
  };
  runtimeAndCapability: {
    runtimeEnabledConsistent: boolean;
    failClosedConsistent: boolean;
    evidenceReviewBypassPrevented: boolean;
    killSwitchActiveEver: boolean;
    allRiskyCapabilitiesDisabled: boolean;
    blockedCapabilityGates: number;
    runtimeBypassAllowed: false;
    adminBypassEnabled: false;
  };
  voiceAndProvider: {
    textReasoningReady: boolean;
    sseStreamingReady: boolean;
    browserSttPrototypeReady: boolean;
    pushToTalkReady: boolean;
    fullVoiceEnabled: false;
    realtimeVoiceEnabled: false;
    ttsEnabled: false;
    continuousVoiceEnabled: false;
    providerBypassAllowed: false;
  };
  learningAndArtifacts: {
    proactivitySuggestions: number;
    pilotLearningSignals: number;
    outcomeReadinessBlockedRequirements: number;
    artifactsCaptured: number;
    artifactExportBlocked: number;
    artifactExportEnabled: false;
    outcomeLearningEnabled: false;
  };
  disabledPromotionPaths: string[];
  nextFoundationSteps: string[];
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionExecutivePilotStepId =
  | 'sponsor_runbook'
  | 'brand_read'
  | 'workspace_foundation'
  | 'foundation_control'
  | 'runtime_and_voice'
  | 'review_gates';

export type AgentSessionExecutivePilotStepSummary = {
  id: AgentSessionExecutivePilotStepId;
  label: string;
  expectedSkillId: string;
  expectedTemplateId: string;
  expectedViewIds: string[];
  completed: boolean;
  turnCount: number;
  latestTurnId: string | null;
  latestBrandName: string | null;
  renderedExpectedViews: string[];
  missingExpectedViews: string[];
};

export type AgentSessionExecutivePilotSummary = {
  id: 'agent-session-executive-pilot-v1';
  sessionId: string;
  mode: 'prototype_guided_executive_pilot_sequence';
  store: 'local_json';
  totalSteps: number;
  completedSteps: number;
  missingSteps: AgentSessionExecutivePilotStepId[];
  lastCompletedStepId: AgentSessionExecutivePilotStepId | null;
  sponsorRunbookReady: boolean;
  sequenceReadyForDemo: boolean;
  steps: AgentSessionExecutivePilotStepSummary[];
  requiredViewIds: string[];
  observedViewIds: string[];
  demoEvidenceStack: {
    id:
      | 'brand_read'
      | 'experience_plan_composition'
      | 'proof_and_audit_rails'
      | 'runtime_surface_parity'
      | 'source_governance'
      | 'voice_path';
    label: string;
    status: 'ready' | 'prototype_ready' | 'blocked';
    proof: string;
    relatedViewIds: string[];
    blockers: string[];
  }[];
  fundingAsks: {
    id:
      | 'source_owner_handoff'
      | 'enterprise_persistence_identity'
      | 'artifact_language_export_policy'
      | 'voice_policy_provider_runtime'
      | 'outcome_learning_design';
    label: string;
    priority: 'now' | 'next' | 'later';
    rationale: string;
    gatedUntil: string[];
    enabledInPrototype: false;
  }[];
  gatedPromotionPaths: string[];
  exportEnabled: false;
  autonomousSequenceEnabled: false;
  fullVoiceEnabled: false;
  arbitraryUiGenerationEnabled: false;
  nextRunbookStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentSessionPromotionGateSummary = {
  id: 'agent-session-promotion-gate-v1';
  sessionId: string;
  mode: 'prototype_foundation_promotion_gate';
  store: 'local_json';
  readinessLevel: 'needs_governed_turns' | 'executive_demo_ready' | 'pilot_review_ready';
  promotionDecision: 'ready_for_cmo_demo_not_production' | 'needs_more_governed_proof';
  recommendedAsk: 'fund_governed_pilot_and_source_owner_handoff' | 'run_governed_sequence_first';
  executiveDemoReady: boolean;
  pilotReviewReady: boolean;
  productionReady: false;
  demoProof: {
    governedTurns: number;
    completedExecutivePilotSteps: number;
    totalExecutivePilotSteps: number;
    approvedViewsRendered: number;
    supportedClaims: number;
    runtimeSurfacesGuarded: boolean;
    qualityPasses: number;
  };
  criticalGates: {
    sourceOwnerDataReady: boolean;
    canonicalUseApproved: false;
    enterprisePersistenceReady: false;
    officialApprovalReady: false;
    artifactExportReady: false;
    fullVoiceReady: false;
    autonomousLearningReady: false;
    arbitraryUiGenerationReady: false;
  };
  enabledForDemo: string[];
  blockedForProduction: string[];
  nextPilotSteps: string[];
  fundingRationale: string[];
  disabledPromotionPaths: string[];
  guardrails: string[];
  caveats: string[];
};

export type FoundationLayerStatus = 'solid' | 'poc_ready' | 'gated' | 'needs_source';

export type FoundationLayerReadiness = {
  id:
    | 'data-packet'
    | 'knowledge-guardrails'
    | 'runtime'
    | 'experience-plan'
    | 'voice'
    | 'memory-audit'
    | 'source-governance'
    | 'artifacts';
  label: string;
  status: FoundationLayerStatus;
  proof: string;
  testedBy: string;
  next: string;
};

export type FoundationLayerAudit = {
  verdict: string;
  solidLayerCount: number;
  pocReadyLayerCount: number;
  gatedLayerCount: number;
  gatedLayerText: string;
  productionLabel: string;
  experienceGap: string;
  layers: FoundationLayerReadiness[];
};

export type AgentTurnPersistence = {
  status: 'persisted' | 'skipped' | 'error';
  sessionId: string;
  store: 'local_json';
  ledgerSummary: {
    turns: number;
    memory: number;
    audit: number;
    auditActionTypes: number;
    auditRecordsRequiringConfirmation: number;
    artifacts: number;
    artifactTypes: number;
    artifactExportBlocked: number;
    confirmationGates: number;
    reviews: number;
    proactivityManifests: number;
    proactivitySuggestions: number;
    proactivityHeldNotices: number;
    pilotLearningManifests: number;
    pilotLearningSignals: number;
    sourceGovernanceManifests: number;
    sourcePromotionCandidates: number;
    sourceClaimCandidates: number;
    evidenceSpotlightTurns: number;
    evidenceSpotlightClaims: number;
    evidenceSpotlightMissingClaims: number;
    runtimeSurfaceManifests: number;
    runtimeSurfaceIds: number;
    experienceArchitectureManifests: number;
    experienceTemplates: number;
    renderedViewIds: number;
    canvasStateManifests: number;
    canvasRenderedViews: number;
    reasoningStatusSteps: number;
    conversationPresenceManifests: number;
    workingContextManifests: number;
    acceptedMemoryContextRecords: number;
    persistenceReadinessManifests: number;
    persistenceBlockedRequirements: number;
    reviewIdentityManifests: number;
    reviewIdentityBlockedApprovals: number;
    providerAdapterManifests: number;
    providerAdapters: number;
    capabilityStateTurns: number;
    runtimeControlTurns: number;
    runtimeControlAdminOverrideRequirements: number;
    runtimeControlEmergencyStopScopes: number;
    disabledCapabilities: number;
    blockedCapabilityGates: number;
    runtimeQualityTurns: number;
    runtimeQualityChecks: number;
    runtimeQualityBlockedChecks: number;
    voiceRuntimeManifests: number;
    voiceRuntimeCompatibleViews: number;
    voiceRuntimeStreamEventTypes: number;
    voiceReadinessManifests: number;
    voiceBlockedRequirements: number;
    voiceContractManifests: number;
    voiceContractIncompatibleViews: number;
    treatmentOutcomeReadinessManifests: number;
    treatmentOutcomeBlockedRequirements: number;
  };
  reviewWorkflowSummary?: AgentSessionReviewWorkflowSummary;
  artifactReadinessSummary?: AgentSessionArtifactReadinessSummary;
  auditSummary?: AgentSessionAuditSummary;
  memoryAuditSummary?: AgentSessionMemoryAuditSummary;
  proactivitySummary?: AgentSessionProactivitySummary;
  pilotLearningSummary?: AgentSessionPilotLearningSummary;
  treatmentOutcomeReadinessSummary?: AgentSessionTreatmentOutcomeReadinessSummary;
  sourceGovernanceSummary?: AgentSessionSourceGovernanceSummary;
  sourceRuntimeIngestionSummary?: AgentSessionSourceRuntimeIngestionSummary;
  evidenceSpotlightSummary?: AgentSessionEvidenceSpotlightSummary;
  runtimeSurfaceSummary?: AgentSessionRuntimeSurfaceSummary;
  experienceArchitectureSummary?: AgentSessionExperienceArchitectureSummary;
  canvasContinuitySummary?: AgentSessionCanvasContinuitySummary;
  persistenceGovernanceSummary?: AgentSessionPersistenceGovernanceSummary;
  providerAdapterSummary?: AgentSessionProviderAdapterSummary;
  capabilityReadinessSummary?: AgentSessionCapabilityReadinessSummary;
  runtimeControlSummary?: AgentSessionRuntimeControlSummary;
  runtimeQualitySummary?: AgentSessionRuntimeQualitySummary;
  voiceRuntimeSummary?: AgentSessionVoiceRuntimeSummary;
  voiceReadinessSummary?: AgentSessionVoiceReadinessSummary;
  voiceContractSummary?: AgentSessionVoiceContractSummary;
  foundationReadinessSummary?: AgentSessionFoundationReadinessSummary;
  executivePilotSummary?: AgentSessionExecutivePilotSummary;
  promotionGateSummary?: AgentSessionPromotionGateSummary;
  foundationLayerAudit?: FoundationLayerAudit;
  caveats: string[];
};

export type SourcePromotionKind = 'brand_strategic_context' | 'momentum_intelligence';

export type SourcePromotionRecord = {
  id: string;
  version: 'source-promotion-record-v1';
  kind: SourcePromotionKind;
  brandId: string;
  sourceLabel: string;
  sourceOwner: string | null;
  sourceDate: string | null;
  status: 'reviewed_local_only' | 'dismissed';
  promotedAt: string;
  promotedBy: 'human_review';
  validationSummary: string;
  warnings: string[];
  caveats: string[];
  canonicalWriteEnabled: false;
  packet: unknown;
};

export type SourcePromotionStore = {
  version: 'source-promotion-store-v1';
  updatedAt: string;
  records: SourcePromotionRecord[];
};

export type SourcePromotionContext = {
  records: Pick<
    SourcePromotionRecord,
    | 'id'
    | 'kind'
    | 'brandId'
    | 'sourceLabel'
    | 'sourceOwner'
    | 'sourceDate'
    | 'status'
    | 'promotedAt'
    | 'validationSummary'
    | 'warnings'
    | 'canonicalWriteEnabled'
  >[];
  canonicalWriteEnabled: false;
  runtimeAutoConsumption: false;
  caveats: string[];
};

export type SourceClaimKind =
  | 'brand_strategy'
  | 'momentum_signal'
  | 'market_context'
  | 'consumer_insight'
  | 'treatment_hypothesis'
  | 'evidence_gap'
  | 'other';

export type SourceClaimStatus = 'extracted_unreviewed' | 'reviewed_candidate' | 'rejected';

export type SourceClaimRecord = {
  id: string;
  version: 'source-claim-record-v1';
  brandId: string;
  claim: string;
  claimKind: SourceClaimKind;
  status: SourceClaimStatus;
  sourceLabel: string;
  sourceOwner: string | null;
  sourceDate: string | null;
  sourceExcerpt: string;
  extractedAt: string;
  reviewedAt: string | null;
  reviewedBy: 'human_review' | null;
  reviewNote: string | null;
  confidence: 'needs_review';
  warnings: string[];
  caveats: string[];
  canonicalFactEnabled: false;
  runtimeAutoConsumption: false;
};

export type SourceClaimStore = {
  version: 'source-claim-store-v1';
  updatedAt: string;
  records: SourceClaimRecord[];
};

export type SourceClaimContext = {
  records: Pick<
    SourceClaimRecord,
    | 'id'
    | 'brandId'
    | 'claim'
    | 'claimKind'
    | 'status'
    | 'sourceLabel'
    | 'sourceOwner'
    | 'sourceDate'
    | 'reviewedAt'
    | 'canonicalFactEnabled'
    | 'runtimeAutoConsumption'
  >[];
  canonicalFactEnabled: false;
  runtimeAutoConsumption: false;
  caveats: string[];
};

export type AgentSourceGovernanceManifest = {
  id: 'agent-source-governance-manifest-v1';
  turnId: string;
  brandId: string;
  brandName: string;
  mode: 'reviewed_local_source_context_only';
  sourcePromotionCandidateCount: number;
  sourceClaimCandidateCount: number;
  reviewedSourceClaimCount: number;
  unreviewedSourceClaimCount: number;
  sourcePromotionCandidateIds: string[];
  sourceClaimCandidateIds: string[];
  sourceReviewGateIds: string[];
  momentumSourceReadinessStatus: MomentumSourceReadiness['status'];
  momentumSourcePath: MomentumSourcePath;
  momentumCanonicalForExecutiveUse: boolean;
  momentumReadinessCheckStatusCounts: Record<MomentumSourceReadinessCheckStatus, number>;
  runtimeFileDropStatus: MomentumRuntimeSourceFileDropReadiness['status'];
  runtimeFileDropAuditMode: MomentumRuntimeSourceFileDropAuditMode;
  runtimeFileDropSourceDirectoryExists: boolean;
  runtimeFileDropCandidateFileCount: number;
  requiredRuntimeFileKinds: MomentumSourceOwnerFileKind[];
  loadedRuntimeFileKinds: MomentumSourceOwnerFileKind[];
  missingRuntimeFileKinds: MomentumSourceOwnerFileKind[];
  strategicContextRuntimeFileDropStatus: BrandStrategicContextRuntimeSourceFileDropReadiness['status'];
  strategicContextRuntimeFileDropAuditMode: MomentumRuntimeSourceFileDropAuditMode;
  strategicContextRuntimeFileDropSourceDirectoryExists: boolean;
  strategicContextRuntimeFileDropCandidateFileCount: number;
  strategicContextRequiredRuntimeFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  strategicContextLoadedRuntimeFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  strategicContextMissingRuntimeFileKinds: BrandStrategicContextSourceOwnerFileKind[];
  canonicalSourceWritesEnabled: false;
  canonicalClaimFactsEnabled: false;
  runtimeSourceAutoConsumptionEnabled: false;
  runtimeFileDropConsumptionEnabled: false;
  runtimeFileDropCanonicalUseEnabled: false;
  sourceClaimPromotionCapabilityEnabled: boolean;
  sourceDataWriteCapabilityEnabled: boolean;
  humanReviewRequired: true;
  blockers: string[];
  nextSourceGovernanceStep: string;
  guardrails: string[];
  caveats: string[];
};

export type AgentEvidenceSpotlightClaimType =
  | 'headline'
  | 'answer'
  | 'fact'
  | 'interpretation'
  | 'caveat'
  | 'dynamic_view';

export type AgentEvidenceSpotlightSupportStatus =
  | 'supported_by_packet'
  | 'missing_evidence'
  | 'guardrail'
  | 'reviewed_working_context'
  | 'not_evidence_claim';

export type AgentEvidenceSpotlight = {
  id: string;
  claimType: AgentEvidenceSpotlightClaimType;
  claim: string;
  supportStatus: AgentEvidenceSpotlightSupportStatus;
  evidenceLabels: string[];
  evidenceSources: string[];
  missingEvidenceIds: string[];
  guardrails: string[];
  sourceCandidateIds: string[];
  humanReviewRequired: boolean;
};

export type AgentEvidenceSpotlightTurnRecord = {
  id: string;
  turnId: string;
  brandId: string;
  brandName: string;
  claims: AgentEvidenceSpotlight[];
};

export type AgentSessionEvidenceSpotlightSummary = {
  id: 'agent-session-evidence-spotlight-v1';
  sessionId: string;
  mode: 'prototype_claim_evidence_continuity';
  store: 'local_json';
  turnsWithEvidenceSpotlight: number;
  claimStatusCounts: {
    supportedByPacket: number;
    missingEvidence: number;
    guardrail: number;
    reviewedWorkingContext: number;
    notEvidenceClaim: number;
  };
  claimTypeCounts: { claimType: AgentEvidenceSpotlightClaimType; count: number }[];
  supportedEvidenceLabels: string[];
  missingEvidenceIds: string[];
  sourceCandidateIds: string[];
  guardrailClaims: string[];
  humanReviewRequiredClaimIds: string[];
  latestClaims: {
    id: string;
    claimType: AgentEvidenceSpotlightClaimType;
    claim: string;
    supportStatus: AgentEvidenceSpotlightSupportStatus;
    evidenceLabels: string[];
    missingEvidenceIds: string[];
    guardrails: string[];
    humanReviewRequired: boolean;
  }[];
  packetEvidenceAttached: boolean;
  missingEvidenceVisible: boolean;
  reviewedContextSeparated: boolean;
  guardrailsVisible: boolean;
  canonicalClaimPromotionEnabled: false;
  unsupportedClaimGenerationEnabled: false;
  guardrails: string[];
  caveats: string[];
};

export type AgentTurnResult = AgentSkillRouterResult & {
  turnId: string;
  runtimeVersion: 'agent-runtime-v1';
  markdown: string;
  events: AgentTurnEvent[];
  evidenceSpotlight: AgentEvidenceSpotlight[];
  memory: AgentMemoryRecord[];
  audit: AgentAuditRecord[];
  confirmationGates: AgentConfirmationGate[];
  workingContextManifest: AgentWorkingContextManifest;
  sourceGovernanceManifest: AgentSourceGovernanceManifest;
  persistenceReadinessManifest: AgentPersistenceReadinessManifest;
  reviewIdentityManifest: AgentReviewIdentityManifest;
  proactivityManifest: AgentProactivityManifest;
  pilotLearningManifest: AgentPilotLearningManifest;
  treatmentOutcomeReadinessManifest: AgentTreatmentOutcomeReadinessManifest;
  canvasStateManifest: AgentCanvasStateManifest;
  experienceArchitectureManifest: AgentExperienceArchitectureManifest;
  interruptionRecoveryManifest: AgentInterruptionRecoveryManifest;
  reasoningStatusManifest: AgentReasoningStatusManifest;
  conversationPresenceManifest: AgentConversationPresenceManifest;
  providerAdapterManifest: AgentProviderAdapterManifest;
  voiceSkillViewContractManifest: AgentVoiceSkillViewContractManifest;
  voiceOrchestrationReadinessManifest: AgentVoiceOrchestrationReadinessManifest;
  runtimeControlManifest: AgentRuntimeControlManifest;
  runtimeSurfaceManifest: AgentRuntimeSurfaceManifest;
  runtimeQualityChecks: AgentRuntimeQualityCheck[];
  capabilities: AgentCapabilityDefinition[];
  voicePolicy: AgentVoicePolicy;
  voiceRuntimeManifest: AgentVoiceRuntimeManifest;
  persistence?: AgentTurnPersistence;
};

export type ConversationModeDecisionType =
  | 'direct_answer'
  | 'answer_and_offer'
  | 'approval_work_order'
  | 'fail_closed_governance';

export type ConversationModeDecision = {
  id: 'conversation-mode-decision-v1';
  type: ConversationModeDecisionType;
  label: string;
  reason: string;
  shouldRunGovernedTurn: boolean;
  requiresApproval: boolean;
  likelySkillId: string;
  offerLabels: string[];
  blockedCapabilityIds: string[];
};

export type ConversationComposedAnswer = {
  id: 'conversation-composed-answer-v1';
  source: 'openai' | 'deterministic_composer';
  model: string | null;
  fallbackReason?: string;
  headline: string;
  answer: string;
  spokenSummary: string;
  proofHighlights: string[];
  suggestedOffers: string[];
  blockedActions: string[];
  caveats: string[];
};

export type ConversationOrchestratorResult = {
  ok: true;
  question: string;
  brandId: string;
  decision: ConversationModeDecision;
  turn: AgentTurnResult;
  composedAnswer: ConversationComposedAnswer;
};
