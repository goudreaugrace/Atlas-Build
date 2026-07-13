export type MetricStatus = 'Ahead' | 'Not Ahead' | 'Unknown';
export type Momentum = 'Gaining' | 'Holding' | 'Declining' | 'Unknown';

export type BrandMetric = {
  metric: string;
  value: number | string | null;
  displayValue: string | null;
  aheadRaw: string | null;
  ahead: MetricStatus;
  momentumRaw: string | null;
  momentum: Momentum;
  categoryBand: string;
  source: string;
  wave: string;
  slide: string;
};

export type TimeSeriesPoint = { period: string; value: number | null };
export type OccasionScore = { occasion: string; score: number | null; source: string };

export type CategoryLens = {
  activeLens: string;
  validFor: string[];
  notValidFor: string[];
  knownBlindSpots: string[];
};

export type GrowthNavigatorBridge = {
  categoryLens: string;
  evidenceMode?: 'measured_full_extract' | 'measured_partial_extract' | 'synthetic_assumption';
  sourceType?: 'source_extract' | 'partial_workbook_extract' | 'synthetic_generated';
  provenanceNotes?: string[];
  qualityGrowth: Record<string, number>;
  breakpoints: string[];
  driverSignals: { name: string; status: string; evidence: string }[];
  source: string;
  supplementalSources?: string[];
};

export type BrandHealthRecord = {
  brandId: string;
  brandName: string;
  country: string;
  category: string;
  period: string;
  categoryLens: CategoryLens;
  portfolioRole: string;
  typology: string | null;
  pricingPower9Box?: string | null;
  powerShare?: number | null;
  metrics: Record<string, BrandMetric>;
  trends: Record<string, TimeSeriesPoint[]>;
  occasions: OccasionScore[];
  growthNavigator?: GrowthNavigatorBridge | null;
  diagnosisIds: string[];
  sourceFiles: string[];
};

export type DiagnosisDefinition = {
  id: string;
  name: string;
  severityDefault: string;
  plainEnglishDefinition: string;
  triggerSummary: string;
  doctorRead: string;
  whatNotToConclude: string[];
  primaryTreatmentFamilies: string[];
  typicalFollowUpSignals: string[];
};

export type DiagnosisRuleOperator = 'equals' | 'notEquals' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte' | 'exists' | 'missing';

export type DiagnosisRuleCondition = {
  metric: string;
  field: keyof BrandMetric;
  op: DiagnosisRuleOperator;
  value?: string | number | string[] | number[] | boolean | null;
  evidence: string;
  missingEvidence?: string;
};

export type DiagnosisRule = {
  id: string;
  diagnosisId: string;
  description: string;
  priority: number;
  severity: string;
  all?: DiagnosisRuleCondition[];
  any?: DiagnosisRuleCondition[];
  minAnyMatches?: number;
  counter?: DiagnosisRuleCondition[];
  evidenceSummary: string;
};

export type EvidenceItem = {
  label: string;
  statement: string;
  source: string;
  wave: string;
  slide: string;
};

export type DiagnosisCandidate = {
  ruleId: string;
  diagnosis: DiagnosisDefinition;
  score: number;
  confidence: 'High' | 'Medium' | 'Low' | 'Fallback';
  severity: string;
  evidenceSummary: string;
  supporting: EvidenceItem[];
  counterEvidence: EvidenceItem[];
  missingEvidence: EvidenceItem[];
  matchedConditionCount: number;
  totalConditionCount: number;
};

export type DiagnosisResult = {
  primary: DiagnosisCandidate;
  candidates: DiagnosisCandidate[];
  fallbackUsed: boolean;
  seededDiagnosisId?: string;
};

export type RuleTraceCondition = {
  group: 'all' | 'any' | 'counter';
  metric: string;
  field: string;
  operator: DiagnosisRuleOperator;
  expected: string;
  actual: string;
  matched: boolean;
  evidence: string;
  missingEvidence?: string;
  source: string;
  wave: string;
  slide: string;
};

export type RuleTraceRule = {
  ruleId: string;
  diagnosisId: string;
  diagnosisName: string;
  description: string;
  priority: number;
  severity: string;
  evidenceSummary: string;
  fired: boolean;
  score: number | null;
  confidence: DiagnosisCandidate['confidence'] | null;
  matchedConditionCount: number;
  totalConditionCount: number;
  conditions: RuleTraceCondition[];
};

export type DiagnosisRuleTrace = {
  brandName: string;
  category: string;
  period: string;
  systemPrinciples: string[];
  primaryRule: RuleTraceRule;
  allRules: RuleTraceRule[];
  candidateRules: RuleTraceRule[];
  seededDiagnosisId?: string;
  fallbackUsed: boolean;
  sourceFiles: string[];
  categoryLens: CategoryLens;
  treatmentLinks: {
    treatmentId: string;
    name: string;
    priority: number;
    tier: string;
    family: string;
    whyThisFits: string;
    whenNotToUse: string;
  }[];
  pricingGuardrail: {
    validFor: string[];
    notValidFor: string[];
    requiredLanguage: string;
  };
  prototypeNotes: string[];
};

export type TreatmentDefinition = {
  id: string;
  name: string;
  tier: string;
  family: string;
  description: string;
  bestFor: string[];
  notFor: string[];
  timeToImpact: string;
  cost: string;
  difficulty: string;
  likelihood: string;
  owners: string[];
  pros: string[];
  cons: string[];
  dependencies: string[];
  expectedMetricMovement: string[];
  followUpSignals: string[];
  recommendationScope: 'ranked_for_active_brand';
  globalLibraryRole: string;
  brandSpecificBasis: string[];
  evidenceNeeds: string[];
};

export type DiagnosisTreatmentLink = {
  diagnosisId: string;
  treatmentId: string;
  priority: number;
  whyThisFits: string;
  whenNotToUse: string;
};

export type DialogQuestion = {
  scope: string;
  question: string;
};

export type VisualizationSpec = {
  id: string;
  name: string;
  audience: string;
  purpose: string;
  charts: string[];
  questions: string[];
};

export type LlmPrompts = {
  globalSystemPrompt: string;
  dialogWithDataPrompt: string;
  styleGuide: string[];
  guardrails: string[];
};

export type AiPersona = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  bestFor: string[];
  systemInstruction: string;
  responseStyle: string[];
  decisionBias: string;
  caveatStyle: string;
};

export type BrandAsset = {
  brandId: string;
  domain: string;
  logoUrl?: string;
};

export type ExecutiveSummaryItem = {
  title: string;
  detail: string;
  implication: string;
};

export type ExecutiveSummaryMetric = {
  label: string;
  value: string;
  status: string;
  note: string;
  tone: 'good' | 'watch' | 'bad';
};

export type ExecutiveSummaryBadge = {
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'watch' | 'bad';
};

export type EvidenceReadiness = {
  label: 'Validated' | 'Supported' | 'Directional' | 'Incomplete';
  tone: 'good' | 'watch' | 'bad';
  diagnosisConfidence: 'High' | 'Medium' | 'Low' | 'Fallback';
  evidenceStrength: string;
  caveat: string;
  availableInputs: string[];
  missingInputs: string[];
};

export type GrowthAvailabilityPillarStatus = 'available' | 'directional' | 'missing' | 'stale' | 'conflicted';
export type GrowthAvailabilityEvidenceMode = 'measured' | 'simulated_prototype' | 'inferred_from_current_packet' | 'missing';

export type GrowthAvailabilityPillarDefinition = {
  id: string;
  title: string;
  shortTitle: string;
  question: string;
  definition: string;
  hbgRole: string;
  coreEvidence: string[];
  missingEvidenceToImprove: string[];
  guardrail: string;
};

export type GrowthAvailabilityPillarRead = {
  id: string;
  title: string;
  shortTitle: string;
  question: string;
  definition: string;
  hbgRole: string;
  status: GrowthAvailabilityPillarStatus;
  tone: 'good' | 'watch' | 'bad';
  evidenceMode: GrowthAvailabilityEvidenceMode;
  read: string;
  evidence: string[];
  missingInputs: string[];
  caveat: string;
  guardrail: string;
  sourceLabel: string;
};

export type GrowthAvailabilityConstraint = {
  label: string;
  read: string;
  nextQuestion: string;
};

export type GrowthAvailabilityRecord = {
  brandId: string;
  brandName: string;
  category: string;
  period: string;
  evidenceMode: GrowthAvailabilityEvidenceMode;
  simulated: boolean;
  sourceLabel: string;
  growthConstraint: GrowthAvailabilityConstraint;
  pillars: GrowthAvailabilityPillarRead[];
};

export type GrowthAvailabilityDemoPacket = {
  brandId: string;
  period: string;
  evidenceMode: 'simulated_prototype';
  sourceLabel: string;
  growthConstraint: GrowthAvailabilityConstraint;
  pillars: Record<string, {
    status: GrowthAvailabilityPillarStatus;
    read: string;
    evidence: string[];
    missingInputs: string[];
    caveat: string;
  }>;
};

export type MentalAvailabilityMeasureId = 'mental_penetration' | 'mental_market_share' | 'network_size' | 'share_of_mind';
export type MentalAvailabilityCepRole = 'build' | 'defend' | 'watch' | 'avoid';

export type MentalAvailabilityFramework = {
  principle: string;
  evidenceModes: {
    id: GrowthAvailabilityEvidenceMode;
    label: string;
    description: string;
  }[];
  coreMeasures: {
    id: MentalAvailabilityMeasureId;
    label: string;
    definition: string;
    guardrail: string;
  }[];
  cepRoles: {
    id: MentalAvailabilityCepRole;
    label: string;
    definition: string;
    tone: 'good' | 'watch' | 'bad';
  }[];
  defaultMissingInputs: string[];
  interpretationGuardrails: string[];
};

export type MentalAvailabilityMeasureRead = {
  id: MentalAvailabilityMeasureId;
  label: string;
  definition: string;
  guardrail: string;
  value: number | null;
  displayValue: string;
  read: string;
  evidenceMode: GrowthAvailabilityEvidenceMode;
  tone: 'good' | 'watch' | 'bad';
};

export type MentalAvailabilityCepRead = {
  id: string;
  name: string;
  consumerQuestion: string;
  role: MentalAvailabilityCepRole;
  roleLabel: string;
  tone: 'good' | 'watch' | 'bad';
  priority: number;
  relevance: number | null;
  brandAssociation: number | null;
  competitorPressure: number | null;
  interpretation: string;
  action: string;
  evidence: string[];
  missingInputs: string[];
  caveat: string;
  evidenceMode: GrowthAvailabilityEvidenceMode;
  sourceLabel: string;
};

export type MentalAvailabilityTopline = {
  label: string;
  read: string;
  strategicQuestion: string;
};

export type MentalAvailabilityRecord = {
  brandId: string;
  brandName: string;
  category: string;
  period: string;
  evidenceMode: GrowthAvailabilityEvidenceMode;
  simulated: boolean;
  sourceLabel: string;
  principle: string;
  topline: MentalAvailabilityTopline;
  measures: MentalAvailabilityMeasureRead[];
  ceps: MentalAvailabilityCepRead[];
  missingInputs: string[];
  guardrails: string[];
};

export type MentalAvailabilityDemoPacket = {
  brandId: string;
  period: string;
  evidenceMode: 'simulated_prototype';
  sourceLabel: string;
  topline: MentalAvailabilityTopline;
  measures: Record<MentalAvailabilityMeasureId, {
    value: number | null;
    displayValue: string;
    read: string;
    evidenceMode: GrowthAvailabilityEvidenceMode;
  }>;
  ceps: {
    id: string;
    name: string;
    consumerQuestion: string;
    role: MentalAvailabilityCepRole;
    priority: number;
    relevance: number | null;
    brandAssociation: number | null;
    competitorPressure: number | null;
    interpretation: string;
    action: string;
    evidence: string[];
    missingInputs: string[];
    caveat: string;
  }[];
};

export type MentalAvailabilitySourcePacket = Omit<MentalAvailabilityDemoPacket, 'evidenceMode'> & {
  evidenceMode: Exclude<GrowthAvailabilityEvidenceMode, 'missing'>;
};

export type MentalAvailabilitySourceMapping = {
  id: string;
  label: string;
  acceptedFormats: {
    id: 'json_packet' | 'csv_rows';
    label: string;
    description: string;
  }[];
  requiredPacketFields: string[];
  measureFields: MentalAvailabilityMeasureId[];
  csvColumns: {
    column: string;
    required: boolean;
    mapsTo: string;
    delimiter?: string;
  }[];
  governanceRules: string[];
};

export type MentalAvailabilityAcceptedVersion = {
  versionId: string;
  brandId: string;
  acceptedAt: string;
  acceptedBy: string;
  sourceFormat: 'json_packet' | 'csv_rows';
  packet: MentalAvailabilitySourcePacket;
  validation: {
    warnings: string[];
    summary: string;
  };
};

export type ExecutiveSummary = {
  brandName: string;
  summaryTitle: string;
  modelLabel: string;
  generatedAt: string;
  diagnosisBadge: ExecutiveSummaryBadge;
  evidenceReadiness: EvidenceReadiness;
  headline: string;
  narrative: string;
  whatsWorking: ExecutiveSummaryItem[];
  whatToFix: ExecutiveSummaryItem[];
  metricStrip: ExecutiveSummaryMetric[];
  source: 'openai' | 'grounded_fallback';
  fallbackReason?: string;
  cacheStatus?: 'hit' | 'miss';
};

export type KpiAreaDefinition = {
  id: string;
  title: string;
  plainEnglishRole: string;
  howToRead: string;
  healthyPattern: string;
  cautionPattern: string;
  watchNext: string[];
};

export type KpiDeepDiveSection = {
  id: string;
  title: string;
  value: string;
  job: string;
  tone: 'good' | 'watch' | 'bad';
  plainEnglishRole: string;
  howToRead: string;
  currentRead: string;
  evidence: string[];
  watchNext: string[];
  source: string;
  treatmentPaths: {
    name: string;
    tier: string;
    whyItFits: string;
  }[];
};

export type StrategicRoadmapPhase = {
  phase: string;
  horizon: string;
  objective: string;
  treatmentPath: string;
  whyThisFits: string;
  owners: string[];
  dependencies: string[];
  expectedMetricMovement: string[];
  proofSignals: string[];
};

export type StrategicRoadmap = {
  title: string;
  diagnosisName: string;
  strategicRead: string;
  phases: StrategicRoadmapPhase[];
  decisionCaveats: string[];
};

export type TreatmentPlanOption = {
  treatmentId: string;
  name: string;
  tier: string;
  family: string;
  priority: number;
  score: number;
  rankReasons: string[];
  foundationFirst: boolean;
  whyThisFits: string;
  whenNotToUse: string;
  timeToImpact: string;
  cost: string;
  difficulty: string;
  likelihood: string;
  owners: string[];
  dependencies: string[];
  expectedMetricMovement: string[];
  followUpSignals: string[];
  recommendationScope: 'ranked_for_active_brand';
  globalLibraryRole: string;
  brandSpecificBasis: string[];
  evidenceNeeds: string[];
};

export type TreatmentPlanDraft = {
  title: string;
  diagnosisName: string;
  objective: string;
  selectedTreatments: TreatmentPlanOption[];
  targetKpiMovement: string[];
  proofSignals: string[];
  timing: string[];
  owners: string[];
  dependencies: string[];
  caveats: string[];
};

export type MomentumMonitorMetric = {
  metric: string;
  value: string;
  strength: 'strong' | 'weak' | 'unknown';
  momentum: Momentum;
  read: string;
  tone: 'good' | 'watch' | 'bad';
};

export type MomentumMonitor = {
  principle: string;
  outcomeRead: string;
  outcomeTone: 'good' | 'watch' | 'bad';
  inputRead: string;
  inputTone: 'good' | 'watch' | 'bad';
  currentStrength: 'strong' | 'weak' | 'unknown';
  trajectory: Momentum;
  metrics: MomentumMonitorMetric[];
};

export type GnVital = {
  id: string;
  label: string;
  description: string;
  status: 'support' | 'watch' | 'pressure' | 'missing';
  tone: 'good' | 'watch' | 'bad';
  keySignals: string[];
  sourcePeriod: string;
  compatibility: string;
  diagnosticRelationship: 'supports' | 'complicates' | 'missing';
};

export type KnowledgeGraphNode = {
  id: string;
  type:
    | 'brand'
    | 'metric'
    | 'diagnosis'
    | 'treatment'
    | 'category'
    | 'period'
    | 'evidence_gap'
    | 'portfolio_pattern';
  label: string;
  properties: Record<string, string | number | boolean | null>;
};

export type KnowledgeGraphEdge = {
  from: string;
  to: string;
  type:
    | 'has_metric'
    | 'has_diagnosis'
    | 'linked_treatment'
    | 'similar_to'
    | 'matches_pattern'
    | 'has_evidence_gap'
    | 'observed_in';
  weight?: number;
  evidence?: string[];
};

export type KnowledgeGraph = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

export type SymptomFingerprint = {
  brandId: string;
  brandName: string;
  period: string;
  equityShape: string;
  trajectory: string;
  supportLensCoverage: string;
  diagnosisPull: string[];
  treatmentPull: string[];
  blockers: string[];
  features: Record<string, string | number | boolean | null>;
};

export type SimilarBrandMatch = {
  brandId: string;
  brandName: string;
  category: string;
  diagnosisName: string;
  strength: 'High' | 'Medium' | 'Low';
  score: number;
  reasons: string[];
  keyDifference: string;
  caveat: string;
};

export type PortfolioPattern = {
  id: string;
  name: string;
  definition: string;
  matchedBrandIds: string[];
  evidenceBasis: string[];
  whyItMatters: string;
  investigateNext: string;
  guardrail: string;
};

export type PortfolioEvidenceGap = {
  id: string;
  label: string;
  whyItMatters: string;
  affectedBrandIds: string[];
  decisionRisk: 'Low' | 'Medium' | 'High';
  nextSource: string;
  ownerCandidate: string;
};

export type TreatmentMemoryItem = {
  treatmentId: string;
  treatmentName: string;
  family: string;
  whyItAppears: string;
  requiredEvidence: string[];
  followUpSignals: string[];
  contraindication: string;
};

export type SourceContradiction = {
  id: string;
  label: string;
  read: string;
  status: 'future' | 'needs_review' | 'resolved';
};

export type PrecursorWatchItem = {
  id: string;
  label: string;
  read: string;
  caveat: string;
};

export type PatternRadarRecord = {
  brandId: string;
  brandName: string;
  period: string;
  category: string;
  graph: KnowledgeGraph;
  topline: {
    patternLabel: string;
    read: string;
    confidence: 'Directional' | 'Supported' | 'Validated';
    similarBrandCount: number;
    materialGapCount: number;
    caveat: string;
  };
  fingerprint: SymptomFingerprint;
  similarBrands: SimilarBrandMatch[];
  emergingPatterns: PortfolioPattern[];
  evidenceGaps: PortfolioEvidenceGap[];
  treatmentMemory: TreatmentMemoryItem[];
  sourceContradictions: SourceContradiction[];
  precursorWatch: PrecursorWatchItem[];
};

export type PortfolioPatternCluster = {
  id: string;
  name: string;
  definition: string;
  brandIds: string[];
  brandNames: string[];
  categories: string[];
  evidenceBasis: string[];
  whyItMatters: string;
  investigateNext: string;
  guardrail: string;
};

export type PortfolioGapCluster = {
  id: string;
  label: string;
  whyItMatters: string;
  affectedBrandIds: string[];
  affectedBrandNames: string[];
  categories: string[];
  decisionRisk: 'Low' | 'Medium' | 'High';
  nextSource: string;
  ownerCandidate: string;
};

export type PortfolioTreatmentPull = {
  family: string;
  brandIds: string[];
  brandNames: string[];
  treatmentNames: string[];
  requiredEvidence: string[];
  followUpSignals: string[];
  caveat: string;
};

export type PortfolioSimilarityEdge = {
  fromBrandId: string;
  fromBrandName: string;
  fromCategory: string;
  toBrandId: string;
  toBrandName: string;
  toCategory: string;
  score: number;
  strength: SimilarBrandMatch['strength'];
  reasons: string[];
  keyDifference: string;
  caveat: string;
};

export type PortfolioBrandRead = {
  brandId: string;
  brandName: string;
  category: string;
  portfolioRole: string;
  diagnosisName: string;
  patternLabel: string;
  evidenceReadiness: EvidenceReadiness['label'];
  materialGapCount: number;
  topTreatmentFamily: string;
  topSimilarBrands: string[];
};

export type PortfolioRadarRecord = {
  period: string;
  topline: {
    totalBrands: number;
    categoryCount: number;
    patternClusterCount: number;
    highRiskGapCount: number;
    crossCategoryEdgeCount: number;
    read: string;
    caveat: string;
  };
  patternClusters: PortfolioPatternCluster[];
  evidenceGapClusters: PortfolioGapCluster[];
  treatmentPulls: PortfolioTreatmentPull[];
  crossBrandEdges: PortfolioSimilarityEdge[];
  brandReads: PortfolioBrandRead[];
};
