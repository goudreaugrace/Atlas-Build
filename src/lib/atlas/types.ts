export type EvidenceLabel = 'sourced_fact' | 'modeled_estimate' | 'user_assumption' | 'unknown_gap';

export type AudienceMode = 'cno_internal' | 'leadership_safe' | 'kam_safe' | 'customer_safe';

export type NegotiationEventType =
  | 'customer_ask'
  | 'objection'
  | 'concession_offered'
  | 'pepsico_counter'
  | 'sanction_threat'
  | 'deadline_pressure'
  | 'commitment'
  | 'unresolved_issue'
  | 'decision'
  | 'action_item';

export type SourceTaggedValue<T> = {
  value: T;
  label: EvidenceLabel;
  source: string;
  freshness: string;
  confidence: 'high' | 'medium' | 'low';
};

export type RetailerProfile = {
  id: string;
  name: string;
  role: string;
  markets: string[];
  knownPriorities: string[];
  negotiationStyle: string;
  source: SourceTaggedValue<string>;
};

export type MarketPricingPosition = {
  market: string;
  products: string[];
  currentPriceIndex: SourceTaggedValue<number>;
  targetPriceMovePct: SourceTaggedValue<number>;
  redLinePct: SourceTaggedValue<number>;
  marginFloorPct: SourceTaggedValue<number>;
  breakevenPct: SourceTaggedValue<number>;
  offsetRole: 'absorbing_concession' | 'offsetting_value' | 'neutral' | 'watch';
};

export type PricingCorridorInput = {
  id: string;
  label: string;
  market: string;
  value: SourceTaggedValue<string>;
  implication: string;
};

export type PricingPosition = {
  currentNetPriceIndex: SourceTaggedValue<number>;
  targetPriceIncreasePct: SourceTaggedValue<number>;
  redLinePriceIncreasePct: SourceTaggedValue<number>;
  currentCustomerAskPct: SourceTaggedValue<number>;
  grossMarginPct: SourceTaggedValue<number>;
  netRevenueAtRiskEuros: SourceTaggedValue<number>;
  volumeAtRiskPct: SourceTaggedValue<number>;
  tradeMarginPct: SourceTaggedValue<number>;
};

export type NegotiationLever = {
  id: string;
  type: 'price' | 'promo' | 'timing' | 'inventory' | 'innovation' | 'investment' | 'phasing' | 'scope' | 'sanction_mitigation';
  label: string;
  owner: 'CNO' | 'KAM' | 'CAM' | 'Leadership';
  availability: 'available' | 'approval_required' | 'blocked';
  costEuros: number;
  expectedCustomerValue: string;
  timing: string;
  control: 'central' | 'local' | 'joint';
  redLineImpact: string;
  escalationTrigger: string;
};

export type Scenario = {
  id: string;
  name: string;
  scenarioType?: 'current' | 'buyer_offer' | 'pepsico_counter' | 'hold_firm' | 'tradeoff' | 'ai_recommended';
  strategy: string;
  priceMovePct: number;
  concessionPct: number;
  tradeSpendChangePct?: number;
  marginImpactPct?: number;
  gapToTargetPct?: number;
  gapToRedLinePct?: number;
  acceptanceLikelihood?: 'low' | 'medium' | 'high';
  aopImpact?: string;
  recommended?: boolean;
  levers: string[];
  netRevenueImpactEuros: number;
  grossMarginImpactBps: number;
  volumeImpactPct: number;
  probabilityToLandPct: number;
  sanctionRisk: 'low' | 'medium' | 'high';
  redLineProximity: 'safe' | 'watch' | 'breach';
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
  recommendedUseCase: string;
};

export type PushbackItem = {
  id: string;
  objection: string;
  likelyArgument: string;
  affectedMarket: string;
  affectedCategory: string;
  quantifiedExposure: string;
  recommendedResponse: string;
  evidenceIds: string[];
  confidence: 'high' | 'medium' | 'low';
  watchOut: string;
};

export type EvidenceClaim = {
  id: string;
  claim: string;
  label: EvidenceLabel;
  source: string;
  freshness: string;
  confidence: 'high' | 'medium' | 'low';
  audienceSafe: AudienceMode[];
};

export type NegotiationEvent = {
  id: string;
  type: NegotiationEventType;
  timestamp: string;
  rawQuote: string;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low';
  official: boolean;
};

export type DebriefCapture = {
  id: string;
  title: string;
  capturedAt: string;
  captureMode: 'typed' | 'dictated' | 'uploaded' | 'demo';
  rawNotes: string;
  extractedAsks: string[];
  concessions: string[];
  pricingNumbers: string[];
  decisions: string[];
  openQuestions: string[];
  nextSteps: string[];
  scenarioAssumptionUpdates: string[];
  confidence: 'high' | 'medium' | 'low';
};

export type NegotiationTimelineEvent = {
  id: string;
  date: string;
  kind: 'meeting' | 'debrief' | 'customer_ask' | 'counteroffer' | 'concession' | 'scenario_change' | 'decision' | 'risk' | 'task';
  title: string;
  detail: string;
  whatChanged?: string;
  relatedScenarioId?: string;
  evidenceIds: string[];
  source: SourceTaggedValue<string>;
};

export type MissingInformationTask = {
  id: string;
  title: string;
  reason: string;
  owner: 'CNO' | 'KAM' | 'CAM' | 'Finance' | 'Leadership';
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  recommendedAction?: string;
  relatedTimelineEventId?: string;
  status: 'ready_to_review' | 'missing_input' | 'blocked' | 'complete';
};

export type ExternalRiskFactor = {
  id: string;
  title: string;
  riskType: 'tariff' | 'supply_chain' | 'lawsuit' | 'market_pressure' | 'tax_change' | 'retailer_action';
  relevance: string;
  source: SourceTaggedValue<string>;
};

export type StrategySellStory = {
  narrative: string;
  defense: string;
  buyerPressurePoints: string[];
  expectedObjections: string[];
  proofPointsNeeded: string[];
  confidence: 'high' | 'medium' | 'low';
  editableDraft: string;
};

export type StrategyUpdateRecord = {
  id: string;
  version: string;
  date: string;
  summary: string;
  triggeredBy: string;
  changes: string[];
  signoffNeeded: string;
  debriefImpact: string;
  source: SourceTaggedValue<string>;
};

export type StrategyWorkspaceSummary = {
  id: string;
  recordId: string;
  buyingGroup: string;
  primaryMarket: string;
  strategyVersion: string;
  stageLabel: string;
  latestBuyerPosition: string;
  riskLevel: 'low' | 'medium' | 'high';
  signoffStatus: 'draft' | 'needs_review' | 'approved';
  changedSinceLastOpen: string;
  nextAction: string;
  updatedAt: string;
};

export type StrategyWatchout = {
  id: string;
  title: string;
  detail: string;
  riskLevel: 'low' | 'medium' | 'high';
  whyItMatters: string;
  status: 'watch' | 'needs_validation' | 'supports_strategy' | 'deadline' | 'blocked';
  action: string;
  source: SourceTaggedValue<string>;
};

export type StrategyRecentOutput = {
  id: string;
  title: string;
  outputType: 'deck_visual' | 'scenario' | 'debrief' | 'strategy_draft';
  detail: string;
  href: string;
  updatedAt: string;
  confidence: 'high' | 'medium' | 'low';
};

export type StrategyBuilderPathId =
  | 'thesis'
  | 'buyer_reaction'
  | 'evidence'
  | 'scenario_pressure'
  | 'market_signals'
  | 'readiness';

export type StrategyEditableAssumption = {
  id: string;
  label: string;
  value: number;
  unit: '%' | 'bps' | 'EURm' | 'index';
  priorValue: number;
  sourceLabel: EvidenceLabel;
  source: string;
  freshness: string;
  confidence: 'high' | 'medium' | 'low';
  validationState: 'validated' | 'needs_validation' | 'user_assumption';
};

export type SupportingStrategyDocument = {
  id: string;
  fileName: string;
  fileType: string;
  role: 'prep_deck' | 'strategy_deck' | 'transcript' | 'notes' | 'data_export' | 'other';
  addedAt: string;
  userNotes: string;
  confidence: 'high' | 'medium' | 'low';
  extractedSummary: string;
};

export type BuyerReactionPrediction = {
  id: string;
  likelyObjection: string;
  historicalBasis: string;
  expectedSeverity: 'low' | 'medium' | 'high';
  confidence: 'high' | 'medium' | 'low';
  suggestedEvidence: string[];
};

export type StrategySignal = {
  id: string;
  title: string;
  type: 'public_news' | 'commodity' | 'competitor_private_label' | 'internal_decision' | 'debrief' | 'customer_history';
  detail: string;
  implication: string;
  source: SourceTaggedValue<string>;
};

export type StrategyPathModule = {
  id: StrategyBuilderPathId;
  title: string;
  generatedAt: string;
  recommendation: string;
  narrative: string;
  keyMetrics: Array<{ label: string; value: string; sourceLabel: EvidenceLabel; confidence: 'high' | 'medium' | 'low' }>;
  validationGaps: string[];
  sourceTrail: Array<{ label: string; source: string; freshness: string; confidence: 'high' | 'medium' | 'low' }>;
};

export type StrategyRevisionProposal = {
  id: string;
  trigger: string;
  proposedChange: string;
  affectedModules: StrategyBuilderPathId[];
  affectedNumbers: string[];
  status: 'proposed' | 'applied' | 'draft' | 'rejected';
};

export type StrategyBuilderState = {
  activePathStep: StrategyBuilderPathId;
  currentThesis: string;
  selectedNumbers: StrategyEditableAssumption[];
  uploadedDocs: SupportingStrategyDocument[];
  manualEdits: StrategyEditableAssumption[];
  revisions: StrategyRevisionProposal[];
  validationState: 'ready' | 'needs_validation' | 'blocked';
};

export type VisualEvidenceModule = {
  id: string;
  title: string;
  moduleType:
    | 'pricing_corridor'
    | 'cost_pressure_stack'
    | 'commodity_trend'
    | 'shelf_price_comparison'
    | 'product_pricing_movement'
    | 'promo_exposure'
    | 'volume_recovery'
    | 'scenario_mini_card';
  deckUse: string;
  keyTakeaway: string;
  proofMetrics: Array<{
    label: string;
    value: string;
    note: string;
    status: 'supports' | 'watch' | 'gap';
    sourceLabel: EvidenceLabel;
  }>;
  source: SourceTaggedValue<string | number>;
};

export type ScenarioDelta = {
  id: string;
  eventId: string;
  scenarioId: string;
  summary: string;
  priorProbabilityToLandPct: number;
  updatedProbabilityToLandPct: number;
  netRevenueDeltaEuros: number;
  grossMarginDeltaBps: number;
  volumeDeltaPct: number;
  sanctionRisk: Scenario['sanctionRisk'];
  redLineProximity: Scenario['redLineProximity'];
  rationale: string;
  approvalState: 'draft' | 'approved' | 'rejected';
};

export type AtlasOutputType =
  | 'current_position'
  | 'scenario_comparison'
  | 'customer_pushback_map'
  | 'recommended_scenario_brief'
  | 'cno_prep_brief'
  | 'live_negotiation_brief'
  | 'kam_cam_cascade_pack';

export type AtlasOutputRecord = {
  id: string;
  type: AtlasOutputType;
  title: string;
  audienceMode: AudienceMode;
  sourceScenarioId: string;
  sourceEventIds: string[];
  sourceFreshness: string;
  assumptions: string[];
  confidence: 'high' | 'medium' | 'low';
  approvalState: 'draft' | 'approved' | 'export_blocked';
  exportState: 'web_only' | 'pdf_ready_future' | 'ppt_ready_future';
  body: string[];
};

export type NegotiationRecord = {
  id: string;
  customer: string;
  buyingGroup: string;
  pricingAlliance: string;
  year: number;
  retailers: RetailerProfile[];
  market: string;
  markets: MarketPricingPosition[];
  products: string[];
  region: string;
  category: string;
  cycle: string;
  stage: 'pricing_establishment' | 'nego_prep' | 'nego_strategy' | 'nego_execution' | 'scenario_planning';
  strategyVersion: string;
  strategyReadinessState: string;
  recommendedPosition: string;
  activeDecisionTitle: string;
  recommendedCounterPct: SourceTaggedValue<number>;
  responseDeadline: string;
  decisionConfidence: 'high' | 'medium' | 'low';
  blockingIssue: string;
  buyerSilenceDays: number;
  latestDebriefSnapshot: string;
  currentStrategySummary: string;
  sellStory: StrategySellStory;
  annualPriorities: string[];
  buyingGroupPriorities: string[];
  openRisks: string[];
  activeScenarioId: string;
  lastSourceSync: string;
  sourceReadiness: string;
  pricingCorridorInputs: PricingCorridorInput[];
  pricingPosition: PricingPosition;
  scenarios: Scenario[];
  levers: NegotiationLever[];
  pushbackMap: PushbackItem[];
  evidenceClaims: EvidenceClaim[];
  debriefCaptures: DebriefCapture[];
  timelineEvents: NegotiationTimelineEvent[];
  missingInformationTasks: MissingInformationTask[];
  externalRiskFactors: ExternalRiskFactor[];
  strategyUpdates: StrategyUpdateRecord[];
};
