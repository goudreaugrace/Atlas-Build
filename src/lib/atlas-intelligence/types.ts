export type AtlasConfidence = 'low' | 'medium' | 'high';

export type AtlasStatus =
  | 'ready'
  | 'stale'
  | 'needs_validation'
  | 'missing'
  | 'modeled'
  | 'approved'
  | 'superseded';

export type AtlasRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AtlasSourceGovernance = {
  sourceType: 'internal' | 'external' | 'modeled' | 'historical' | 'user_entered' | 'ai_generated';
  sourceOwner: string;
  approvalStatus: 'approved_source' | 'reviewed_for_prototype' | 'prototype_simulation' | 'draft' | 'not_reviewed';
  allowedUse: Array<'demo' | 'review_draft' | 'pilot_candidate' | 'official'>;
  canonicalUseAllowed: 'yes' | 'no' | 'with_caveat';
  confidence: AtlasConfidence;
  caveats: string[];
  replacementRequirement: string | null;
};

export type SourceMeta = {
  sourceName: string;
  sourceType: AtlasSourceGovernance['sourceType'];
  sourceDate: string;
  lastUpdated: string;
  confidence: AtlasConfidence;
  status: AtlasStatus;
  url?: string;
  governance: AtlasSourceGovernance;
};

export type FinancialExposure = {
  annualRevenue: number;
  netRevenue: number;
  marginContribution: number;
  marginAtRisk: number;
  volumeExposure: number;
  tradeSpendExposure: number;
  revenueUnderNegotiation: number;
  targetPriceRealization: number;
  expectedPriceRealization: number;
  acceptedPriceRealization?: number;
  gapToPlan: number;
  currency: 'EUR';
};

export type Market = {
  id: string;
  name: string;
  region: 'Europe';
  pressureLevel: AtlasRiskLevel;
  revenueUnderNegotiation: number;
  marginAtRisk: number;
  volumeExposure: number;
  tradeSpendExposure: number;
  gapToPlan: number;
  activeBuyingGroups: string[];
  topDrivers: string[];
  lastUpdated: string;
  source: SourceMeta;
};

export type BuyingGroup = {
  id: string;
  name: string;
  primaryMarkets: string[];
  categories: string[];
  negotiationStage: 'monitoring' | 'prep' | 'active' | 'paused' | 'closed';
  riskLevel: AtlasRiskLevel;
  financialExposure: FinancialExposure;
  currentSignals: string[];
  competitorMoves: string[];
  documents: string[];
  timelineEvents: string[];
  lastUpdated: string;
  source: SourceMeta;
};

export type ExternalSignal = {
  id: string;
  title: string;
  signalType:
    | 'world_news'
    | 'economic'
    | 'regulatory'
    | 'commodity'
    | 'supply_chain'
    | 'inflation'
    | 'retailer_pressure'
    | 'consumer_behavior'
    | 'category_trend';
  summary: string;
  affectedMarkets: string[];
  affectedBuyingGroups: string[];
  negotiationImplication: string;
  estimatedRevenueImpact?: number;
  estimatedMarginImpact?: number;
  recommendedAction: string;
  source: SourceMeta;
  confidence: AtlasConfidence;
};

export type CompetitorMove = {
  id: string;
  competitor: string;
  title: string;
  moveType:
    | 'price_action'
    | 'promotion'
    | 'assortment'
    | 'packaging'
    | 'retailer_partnership'
    | 'innovation'
    | 'earnings_commentary'
    | 'market_expansion'
    | 'sustainability_claim'
    | 'private_label';
  summary: string;
  affectedMarkets: string[];
  affectedCategories: string[];
  affectedBuyingGroups: string[];
  possibleBuyerLeverage: string;
  pepsicoImplication: string;
  estimatedRevenueImpact?: number;
  estimatedMarginImpact?: number;
  recommendedAction: string;
  source: SourceMeta;
  confidence: AtlasConfidence;
};

export type DocumentArtifact = {
  id: string;
  title: string;
  documentType:
    | 'prep_document'
    | 'prior_debrief'
    | 'live_debrief'
    | 'pricing_corridor'
    | 'financial_summary'
    | 'competitor_report'
    | 'scenario_output'
    | 'scenario_visual'
    | 'generated_report'
    | 'negotiation_recap'
    | 'customer_profile'
    | 'public_signal_summary'
    | 'historical_agreement';
  buyingGroupId?: string;
  marketId?: string;
  year: number;
  status: AtlasStatus;
  reusable: boolean;
  supersededBy?: string;
  source: SourceMeta;
  summary: string;
  lastUsed?: string;
};

export type TimelineEvent = {
  id: string;
  timestamp: string;
  eventType:
    | 'signal_detected'
    | 'competitor_move'
    | 'financial_change'
    | 'document_added'
    | 'document_retrieved'
    | 'scenario_modeled'
    | 'negotiation_update'
    | 'debrief_created'
    | 'decision_made'
    | 'validation_completed';
  title: string;
  summary: string;
  marketIds: string[];
  buyingGroupIds: string[];
  financialImpact?: {
    revenueImpact?: number;
    marginImpact?: number;
    tradeSpendImpact?: number;
  };
  source: SourceMeta;
  status: AtlasStatus;
};

export type ScenarioInputs = {
  priceIncreasePercent: number;
  expectedRealizationPercent: number;
  volumeChangePercent: number;
  tradeSpendChange: number;
  concessionAmount: number;
  costInflationPercent: number;
  buyerAcceptanceProbability: number;
  competitorPressureLevel: 'low' | 'medium' | 'high';
  contractLengthMonths: number;
};

export type ScenarioOutputs = {
  revenueImpact: number;
  marginImpact: number;
  volumeImpact: number;
  tradeSpendImpact: number;
  priceRealizationImpact: number;
  gapToPlanImpact: number;
  riskAdjustedValue: number;
  riskLevel: AtlasRiskLevel;
  recommendation: string;
};

export type ScenarioModel = {
  id: string;
  name: string;
  marketId: string;
  buyingGroupId: string;
  scenarioType: 'price_realization' | 'volume_risk' | 'trade_spend' | 'concession' | 'competitor_pressure' | 'best_base_worst';
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
  assumptions: string[];
  sourceIds: string[];
  createdAt: string;
  status: AtlasStatus;
};

export type AtlasRetrievalNote = {
  id: string;
  buyingGroupId?: string;
  documentId?: string;
  noteType: 'using_approved_source' | 'needs_validation' | 'generated_draft';
  message: string;
  sourceIds: string[];
};

export type AtlasValidationState = {
  id: string;
  label: string;
  status: AtlasStatus;
  owner: string;
  nextAction: string;
};

export type BuyerMemoryArtifact = {
  id: string;
  artifactType:
    | 'uploaded_document'
    | 'generated_view'
    | 'live_room_report'
    | 'scenario_output'
    | 'debrief'
    | 'source_update';
  title: string;
  buyingGroupId: string;
  marketId?: string;
  createdAt: string;
  source: SourceMeta;
  status: AtlasStatus;
  financialImpact?: {
    revenueImpact?: number;
    marginImpact?: number;
    tradeSpendImpact?: number;
  };
  openHref?: string;
  summary: string;
  createdBy: 'user' | 'atlas' | 'live_room' | 'scenario_model';
  audienceMode?: 'internal_cno' | 'leadership_safe' | 'kam_safe' | 'customer_safe';
};

export type GovernanceTrigger = {
  id: string;
  label: string;
  triggerType:
    | 'round_count'
    | 'margin_threshold'
    | 'stale_source'
    | 'approval_needed'
    | 'missing_debrief'
    | 'competitor_pressure'
    | 'scenario_breach';
  severity: AtlasRiskLevel;
  owner: string;
  dueDate: string;
  status: AtlasStatus;
  reason: string;
  linkedSourceIds: string[];
  linkedTimelineEventIds: string[];
};

export type PrepReadinessState = {
  status: 'ready' | 'needs_review' | 'escalation_needed';
  reasons: string[];
  staleSourceCount: number;
  missingDocCount: number;
  approvalCount: number;
  nextAction: string;
  owner: string;
};

export type CrossMarketPattern = {
  id: string;
  title: string;
  patternType: 'pricing_resistance' | 'competitor_pressure' | 'stale_documents' | 'margin_exposure' | 'retailer_pressure';
  summary: string;
  repeatedAcross: string[];
  affectedMarkets: string[];
  affectedBuyingGroups: string[];
  financialImplication: {
    revenueAtRisk?: number;
    marginAtRisk?: number;
    volumeExposure?: number;
    tradeSpendExposure?: number;
  };
  recommendedAction: string;
  source: SourceMeta;
  confidence: AtlasConfidence;
};

export type CnoWatchlistItem = {
  id: string;
  itemType: 'buying_group' | 'financial_exposure' | 'stale_document' | 'competitor_move' | 'external_signal' | 'recommended_scenario';
  title: string;
  whyItMatters: string;
  affectedMarkets: string[];
  affectedBuyingGroups: string[];
  financialImplication: {
    revenueAtRisk?: number;
    marginAtRisk?: number;
    volumeExposure?: number;
    tradeSpendExposure?: number;
  };
  recommendedAction: string;
  href: string;
  source: SourceMeta;
  confidence: AtlasConfidence;
  status: AtlasStatus;
};

export type NegotiationPlanStatus = 'draft' | 'ready_for_review' | 'locked' | 'superseded';

export type NegotiationPlanEdit = {
  id: string;
  field: string;
  previousValue: string;
  newValue: string;
  editedAt: string;
  editedBy: 'user' | 'atlas';
  sourceStatus: 'user_assumption' | 'sourced' | 'modeled';
};

export type ConcessionPathStep = {
  id: string;
  stepNumber: number;
  trigger: string;
  offer: string;
  cost: number;
  expectedBuyerResponse: string;
  guardrail: string;
  source: SourceMeta;
};

export type NegotiationPlanLever = {
  id: string;
  label: string;
  leverType: 'price' | 'mix' | 'promo' | 'investment' | 'volume' | 'market_offset' | 'sanction_response';
  owner: 'central' | 'local' | 'joint';
  expectedImpact: string;
  financialImpact: {
    revenueImpact?: number;
    marginImpact?: number;
    volumeImpact?: number;
    tradeSpendImpact?: number;
  };
  allowedUse: 'available' | 'approval_required' | 'avoid';
  source: SourceMeta;
};

export type ResistancePlanItem = {
  id: string;
  buyerMove: string;
  responsePlan: string;
  escalationTrigger: string;
  source: SourceMeta;
};

export type PlanScenarioOutcome = {
  id: string;
  label: string;
  description: string;
  probabilityToLand: number;
  nrImpact: number;
  gmImpact: number;
  volumeImpact: number;
  guardrailStatus: 'inside_guardrail' | 'near_red_line' | 'breaches_red_line';
  source: SourceMeta;
};

export type StrategyLockRecord = {
  lockedBy: string;
  lockedAt: string;
  openAssumptions: string[];
  sourceGaps: string[];
  approvalDependencies: string[];
};

export type NegotiationPlanVersion = {
  version: number;
  status: NegotiationPlanStatus;
  createdAt: string;
  lockedAt?: string;
  summary: string;
};

export type NegotiationPlan = {
  id: string;
  buyingGroupId: string;
  marketScope: string[];
  version: number;
  status: NegotiationPlanStatus;
  bestIngoingPosition: string;
  ingoingAskPercent: number;
  targetPercent: number;
  redLinePercent: number;
  fallbackPercent: number;
  walkAwayLogic: string;
  sellingStory: string;
  rationale: string;
  kamSafeGuidance: string;
  canConcede: string[];
  cannotConcede: string[];
  concessionPath: ConcessionPathStep[];
  levers: NegotiationPlanLever[];
  resistancePlan: ResistancePlanItem[];
  scenarioOutcomes: PlanScenarioOutcome[];
  editableAssumptions: NegotiationPlanEdit[];
  sourceIds: string[];
  linkedScenarioIds: string[];
  linkedTimelineEventIds: string[];
  versionHistory: NegotiationPlanVersion[];
  lockRecord?: StrategyLockRecord;
  supersededBy?: string;
};

export type AtlasIntelligenceSeed = {
  generatedAt: string;
  region: 'Europe';
  year: number;
  currency: 'EUR';
  summary: {
    revenueUnderNegotiation: number;
    marginAtRisk: number;
    gapToPlan: number;
    activeBuyingGroups: number;
    highRiskBuyingGroups: number;
    marketsWithHighPressure: string[];
    competitorMovesDetected: number;
    externalSignalsDetected: number;
  };
  markets: Market[];
  buyingGroups: BuyingGroup[];
  signals: ExternalSignal[];
  competitorMoves: CompetitorMove[];
  documents: DocumentArtifact[];
  timelineEvents: TimelineEvent[];
  scenarioModels: ScenarioModel[];
  crossMarketPatterns: CrossMarketPattern[];
  cnoWatchlist: CnoWatchlistItem[];
  retrievalNotes: AtlasRetrievalNote[];
  validationStates: AtlasValidationState[];
};

export type AtlasIntelligencePacket = AtlasIntelligenceSeed & {
  todaysIntelligenceBrief: string;
  aiPriorityBrief: string;
  topExposureBuyingGroups: BuyingGroup[];
  highPressureMarkets: Market[];
  latestTimelineEvents: TimelineEvent[];
};

export type BuyingGroupWorkspacePacket = {
  buyingGroup: BuyingGroup;
  markets: Market[];
  signals: ExternalSignal[];
  competitorMoves: CompetitorMove[];
  documents: DocumentArtifact[];
  timelineEvents: TimelineEvent[];
  scenarioModels: ScenarioModel[];
  retrievalNote: AtlasRetrievalNote;
  memoryArtifacts: BuyerMemoryArtifact[];
  governanceTriggers: GovernanceTrigger[];
  readiness: PrepReadinessState;
  sixtySecondRead: {
    headline: string;
    financialImplication: string;
    recommendedAction: string;
  };
  currentState: {
    negotiationRound: string;
    latestBuyerAsk: string;
    pepsicoPosition: string;
    target: string;
    redLine: string;
    nextMilestone: string;
    openApprovals: string[];
  };
  recommendedActions: Array<{
    label: string;
    href: string;
    reason: string;
  }>;
};
