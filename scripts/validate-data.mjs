import fs from 'node:fs';

function read(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const records = read('src/data/demo/brand-health-records.json');
const diagnoses = read('src/data/config/diagnosis-definitions.json');
const treatments = read('src/data/config/treatment-definitions.json');
const links = read('src/data/config/diagnosis-treatment-links.json');
const brandAssets = read('src/data/config/brand-assets.json');
const groundingModules = read('src/data/config/grounding-education-modules.json');
const groundingQuiz = read('src/data/config/grounding-education-quiz.json');
const learningModulePages = read('src/data/config/learning-module-pages.json');
const learningPaths = read('src/data/config/learning-paths.json');
const learningPracticeScenarios = read('src/data/config/learning-practice-scenarios.json');
const learningSignalLabScenarios = read('src/data/config/learning-signal-lab-scenarios.json');
const learningCaseWalkthroughs = read('src/data/config/learning-case-walkthroughs.json');
const momentumPolicy = read('src/data/config/momentum_policy.json');
const gnFrameworkNodes = read('src/data/config/gn_framework_nodes.json');
const sourcePeriodPolicy = read('src/data/config/source_period_policy.json');
const colorCodingRules = read('src/data/config/color_coding_rules.json');
const pricingPowerGuardrails = read('src/data/config/pricing_power_guardrails.json');
const diagnosisRules = read('src/data/config/diagnosis_rules.json');
const treatmentPlanTemplates = read('src/data/config/treatment_plan_templates.json');
const personas = read('src/data/config/personas.json');
const liveConsultActions = read('src/data/config/live-consult-actions.json');
const liveConsultScenarios = read('src/data/config/live-consult-scenarios.json');
const wikiNav = read('src/data/config/wiki-nav.json');
const growthAvailabilityPillars = read('src/data/config/growth-availability-pillars.json');
const growthAvailabilityDemoPackets = read('src/data/demo/growth-availability-demo-packets.json');
const mentalAvailabilityFramework = read('src/data/config/mental-availability-framework.json');
const mentalAvailabilityDemoPackets = read('src/data/demo/mental-availability-demo-packets.json');
const simulatedDemographicEquityRecords = read('src/data/demo/simulated-demographic-equity-records.json');
const mentalAvailabilitySourceMapping = read('src/data/config/mental-availability-source-mapping.json');
const agentSkillRegistry = read('src/data/config/agent-skill-registry.json');
const dynamicViewRegistry = read('src/data/config/dynamic-view-registry.json');
const experienceTemplateRegistry = read('src/data/config/experience-template-registry.json');
const domainPackRegistry = read('src/data/config/domain-pack-registry.json');
const bbeDeckDoctrine = read('src/data/config/bbe-deck-doctrine.json');
const kateGoldenTestCases = read('src/data/config/kate-s-golden-test-cases.json');
const artifactReadinessRequirements = read('src/data/config/artifact-readiness-requirements.json');
const executiveAssetPageModuleRegistry = read('src/data/config/executive-intelligence-asset-page-module-registry.json');
const persistenceReadinessRequirements = read('src/data/config/persistence-readiness-requirements.json');
const agentReviewIdentityPolicy = read('src/data/config/agent-review-identity-policy.json');
const agentCapabilityFlags = read('src/data/config/agent-capability-flags.json');
const agentRuntimePolicy = read('src/data/config/agent-runtime-policy.json');
const agentVoicePolicy = read('src/data/config/agent-voice-policy.json');
const voiceSkillViewContract = read('src/data/config/voice-skill-view-contract.json');
const voiceOrchestrationReadinessRequirements = read('src/data/config/voice-orchestration-readiness-requirements.json');
const governedRuntimeSurfaceRegistry = read('src/data/config/governed-runtime-surface-registry.json');
const brandStrategicContextHandoffRequirements = read('src/data/config/brand-strategic-context-handoff-requirements.json');
const brandStrategicContextRuntimeFileDropPolicy = read('src/data/config/brand-strategic-context-runtime-file-drop-policy.json');
const momentumSourceHandoffRequirements = read('src/data/config/momentum-source-handoff-requirements.json');
const momentumSourceRuntimeFileDropPolicy = read('src/data/config/momentum-source-runtime-file-drop-policy.json');
const treatmentOutcomeReadinessRequirements = read('src/data/config/treatment-outcome-readiness-requirements.json');
const brandStrategicContextPackets = read('src/data/demo/brand-strategic-context-packets.json');
const momentumSourceExtracts = read('src/data/demo/momentum-source-extracts.json');
const momentumIntelligenceSourcePackets = read('src/data/demo/momentum-intelligence-source-packets.json');
const bbeSourceDataLedger = read('src/data/processed/bbe_source_data_ledger.json');
const bbeDeckChartLedger = read('docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/deck-chart-ledger.json');
const atlasEuropeIntelligence = read('src/data/demo/atlas-europe-intelligence.json');

const diagnosisIds = new Set(diagnoses.map(d => d.id));
const treatmentIds = new Set(treatments.map(t => t.id));
const recordIds = new Set(records.map(r => r.brandId));
const assetIds = new Set(brandAssets.map(a => a.brandId));
const validMetricFields = new Set(['metric', 'value', 'displayValue', 'aheadRaw', 'ahead', 'momentumRaw', 'momentum', 'categoryBand', 'source', 'wave', 'slide']);
const validRuleOps = new Set(['equals', 'notEquals', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 'exists', 'missing']);
const validLiveConsultActionTypes = new Set(['navigate_to_section', 'highlight_metric', 'open_rule_trace', 'select_treatment_path', 'create_meeting_takeaway']);
const validGrowthPillarStatuses = new Set(['available', 'directional', 'missing', 'stale', 'conflicted']);
const validEvidenceModes = new Set(['measured', 'simulated_prototype', 'inferred_from_current_packet', 'missing']);
const validLearningBlockTypes = new Set(['narrative', 'principle-grid', 'signal-read', 'comparison', 'workflow', 'guardrail', 'example', 'questions']);
const validLearningPathStatuses = new Set(['available', 'planned']);
const validLearningPracticeAnswers = new Set(['valid_bbe_read', 'support_lens_hypothesis', 'missing_evidence', 'overreach', 'blocked_conclusion']);
const validLearningSignalTones = new Set(['good', 'watch', 'bad']);
const validAgentSkillFamilies = new Set(['core_reasoning', 'planning', 'visualization', 'learning', 'research', 'storytelling', 'meeting', 'system_building']);
const validHumanApprovalRequirements = new Set(['not_required', 'review_before_publish', 'required_before_circulation', 'required_for_final_takeaway']);
const validPilotPriorities = new Set(['p0', 'p1', 'p2', 'future']);
const validDomainPackStatuses = new Set(['active_prototype', 'pilot_candidate', 'official', 'retired']);
const validDemographicDimensions = new Set(['age_cohort', 'gender', 'ethnicity', 'income', 'region']);
const validDemographicSourceTypes = new Set(['simulated']);
const validDemographicApprovalStatuses = new Set(['prototype_simulation']);
const validDemographicEvidenceModes = new Set(['simulated_workflow_demo']);
const validDemographicAheadStatuses = new Set(['ahead', 'not_ahead', 'unknown']);
const validDemographicMomentumStatuses = new Set(['gaining', 'holding', 'declining', 'unknown']);
const requiredDemographicMetrics = ['Demand Power', 'Meaningful', 'Different', 'Salient', 'Pricing Power'];
const validDynamicViewFamilies = new Set(['metric_summary', 'momentum', 'diagnosis', 'evidence', 'planning', 'comparison', 'portfolio_intelligence', 'learning', 'storytelling', 'meeting']);
const validDynamicViewModes = new Set(['brand_manager', 'insights_lead', 'voice_canvas']);
const validExperienceAudiences = new Set(['executive', 'marketer', 'insights_lead', 'learner', 'agency', 'specialist']);
const validExperienceObjectives = new Set(['diagnose', 'decide', 'teach', 'challenge', 'compare', 'package', 'monitor', 'research']);
const validExperienceLayouts = new Set(['command_center', 'evidence_lab', 'planning_workshop', 'learning_studio', 'brief_builder']);
const validExperienceArtifactTypes = new Set(['qbr_story_draft', 'talk_track', 'agency_brief', 'evidence_packet', 'learning_practice', 'decision_note']);
const validExecutiveAssetPageModuleIds = new Set(['executive_verdict', 'benchmark_lens_read', 'primary_chart_read', 'driver_diagnosis', 'demographic_boundary', 'provocation_questions', 'treatment_paths', 'source_readiness_next_proof']);
const validExecutiveAssetVisualPatterns = new Set(['hero_verdict', 'lens_sequence', 'chart_read', 'driver_map', 'boundary_state', 'question_stack', 'treatment_options', 'proof_and_handoff']);
const validExecutiveAssetFocusLevels = new Set(['slide_like', 'proof_detail', 'action_panel']);
const validExecutiveAssetOutputModes = new Set(['source_recreation', 'diagnostic_read', 'future_extension']);
const validExecutiveAssetAudiences = new Set(['cmo', 'insights_lead', 'brand_lead', 'source_owner']);
const validExecutiveAssetObjectives = new Set(['decision_read', 'proof_review', 'source_handoff', 'treatment_path']);
const validExecutiveAssetProofKinds = new Set([
  'headline_verdict',
  'decision_implication',
  'primary_watchout',
  'evidence_card',
  'momentum_lens',
  'ahead_behind_lens',
  'category_context_lens',
  'source_slide',
  'metric_point',
  'reconciliation_status',
  'demand_power_driver',
  'perceived_value_driver',
  'mds_tension',
  'treatment_implication',
  'measured_availability_state',
  'simulated_workflow_state',
  'official_source_requirement',
  'priority_question',
  'evidence_to_use',
  'evidence_needed',
  'treatment_option',
  'why_consider',
  'inspect_before_action',
  'evidence_need',
  'source_block',
  'handoff_requirement',
  'next_proof',
  'blocked_use'
]);
const validExecutiveAssetRevisionTypes = new Set(['reframe_for_cmo', 'reframe_for_insights_lead', 'lead_with_momentum', 'add_demographic_caveat', 'increase_proof_depth', 'reduce_top_level_density', 'create_source_owner_ask_list', 'open_treatment_path_workspace']);
const validExecutiveAssetNextOperations = new Set(['source_owner_ask_list', 'treatment_path_workspace', 'evidence_read', 'external_context_lane']);
const validPersistenceReadinessModes = new Set(['storage_promotion_checklist']);
const validPersistenceReadinessStatuses = new Set(['ready', 'prototype_ready', 'blocked']);
const validPersistenceRequiredFor = new Set(['session_resume', 'agent_lab_review', 'skill_routed_chat', 'memory_acceptance', 'artifact_review', 'gate_review', 'future_turn_context', 'source_review', 'enterprise_persistence', 'voice_transcripts', 'source_claim_records', 'canonical_source_write']);
const validPersistenceRecordTypes = new Set(['turn_ids', 'memory', 'audit', 'artifacts', 'artifact_readiness', 'confirmation_gates', 'reviews', 'source_promotion_records', 'source_claim_records', 'voice_transcripts']);
const validReviewIdentityModes = new Set(['prototype_reviewer_label_only']);
const validReviewIdentityItemTypes = new Set(['memory', 'artifact', 'confirmation_gate', 'source_promotion_record', 'source_claim_record']);
const validReviewIdentityPrototypeDecisions = new Set(['accepted', 'rejected', 'edited', 'approved', 'dismissed']);
const validReviewIdentityBlockedApprovals = new Set(['official_memory_approval', 'artifact_circulation_approval', 'canonical_source_promotion', 'enterprise_transcript_retention']);
const validAgentCapabilityIds = new Set(['artifact_export', 'artifact_circulation', 'reviewed_memory_write', 'source_claim_promotion', 'source_data_write', 'external_research_ingest', 'voice_continuous_mode']);
const validCapabilityRiskLevels = new Set(['low', 'medium', 'high']);
const validConfirmationActions = new Set(['circulate_artifact', 'export_artifact', 'accept_memory', 'promote_source_claim', 'write_source_data']);
const validVoiceModes = new Set(['push_to_talk', 'wake_listen', 'continuous']);
const validInterruptHandling = new Set(['not_ready', 'basic', 'ready']);
const validRuntimeModes = new Set(['normal', 'degraded_read_only', 'stopped']);
const validRuntimeControlScopes = new Set(['agent_turns', 'streaming', 'voice_capture', 'artifact_generation', 'memory_review', 'source_review']);
const validRuntimeSurfaceTypes = new Set(['api', 'ui', 'chat_surface', 'voice_surface', 'provider_adapter']);
const validRuntimeSurfaceDefaultStates = new Set(['governed_default', 'governed_opt_in', 'scoped_legacy_default', 'gated_candidate', 'gated_disabled']);
const validRuntimeSurfaceStatuses = new Set(['ready', 'ready_opt_in', 'legacy_stable', 'gated', 'disabled']);
const validRuntimeSurfaceVoiceStates = new Set(['none', 'push_to_talk_browser_stt', 'realtime_candidate', 'tts_disabled']);
const validRuntimeSurfacePersistence = new Set(['none', 'local_json_when_session_id', 'browser_local_and_local_json', 'not_applicable']);
const validVoiceOrchestrationModes = new Set(['promotion_gate_checklist']);
const validVoiceOrchestrationStatuses = new Set(['ready', 'prototype_ready', 'blocked']);
const validVoiceOrchestrationRequiredFor = new Set(['push_to_talk', 'wake_listen', 'continuous_voice', 'realtime_voice', 'text_to_speech']);
const validVoiceSkillViewContractModes = new Set(['skill_view_contract_map']);
const validVoiceSkillViewContractStatuses = new Set(['ready', 'gated', 'blocked']);
const validBrandStrategicContextSourceTypes = new Set(['brand_book', 'brand_dna', 'strategy_brief', 'annual_planning_doc', 'creative_brief', 'prototype_seed']);
const validBrandStrategicContextReviewStatuses = new Set(['draft', 'reviewed_for_prototype', 'approved_source']);
const validBrandStrategicContextReadinessCheckIds = new Set(['source-owner-review-status', 'brand-foundations-source', 'positioning-objectives-source', 'creative-platform-claims-source']);
const validBrandStrategicContextPromotionGates = new Set(['source_owner_approval', 'brand_foundations_approval', 'positioning_objectives_approval', 'creative_claims_approval']);
const validBrandStrategicContextSourceOwnerFileKinds = new Set(['brand_foundations_file', 'positioning_objectives_file', 'creative_platform_claims_file']);
const validMomentumSourceEvidenceModes = new Set(['measured_partial_extract', 'prototype_reviewed_partial', 'directional_stakeholder_input', 'missing']);
const validSourceLedgerEvidenceModes = new Set(['measured_partial_extract', 'prototype_reviewed_partial', 'directional_stakeholder_input', 'missing']);
const validSourceLedgerReviewStatuses = new Set(['reviewed_for_prototype', 'approved_source']);
const validSourceLedgerTypes = new Set(['source_report_extract', 'source_owner_workbook', 'source_owner_packet', 'simulated_prototype_seed']);
const validDeckReconciliationStatuses = new Set(['native_chart_and_processed_rows', 'native_chart_no_processed_rows', 'processed_rows_no_native_chart', 'no_machine_readable_metric_payload']);
const validDeckDoctrineLensIds = new Set(['momentum', 'aheadBehind', 'vsCategory']);
const validDeckDoctrineLensRoles = new Set(['headline_verdict', 'size_adjusted_strength_check', 'category_context']);
const validKateGoldenIntentTypes = new Set(['direct_answer', 'answer_and_offer', 'approval_work_order', 'fail_closed_governance']);
const validKateGoldenGroundings = new Set(['assistant_router', 'scoped_primary']);
const validMomentumSourceExtractReviewStatuses = new Set(['reviewed_for_prototype', 'approved_source']);
const validMomentumSourceExtractKinds = new Set(['combined_momentum_source', 'market_share_penetration', 'bbe_contribution_weight', 'bbe_movement_significance', 'merged_source_owner_bundle']);
const validMomentumSourceOwnerFileKinds = new Set(['market_share_penetration_file', 'bbe_contribution_weight_file', 'bbe_movement_significance_file']);
const validMomentumSourceReadinessCheckIds = new Set(['source-owner-review-status', 'market-share-penetration-source', 'bbe-contribution-weight-source', 'movement-significance-source']);
const validMomentumSourcePromotionGates = new Set(['source_owner_approval', 'market_context_approval', 'contribution_weight_approval', 'movement_significance_approval']);
const validMomentumCategoryGrowthUnits = new Set(['percent', 'index', 'not_available']);
const validMomentumMarketMaturity = new Set(['emerging', 'growing', 'mature', 'declining', 'unknown']);
const validMomentumTrendDirections = new Set(['up', 'flat', 'down', 'insufficient']);
const validMomentumTrendSignificance = new Set(['significant_increase', 'significant_decrease', 'not_significant', 'not_tested']);
const validMomentumSourcePeriodCompatibility = new Set(['aligned', 'directionally_comparable', 'lagged', 'not_comparable', 'insufficient']);
const validTreatmentOutcomeReadinessModes = new Set(['outcome_learning_promotion_checklist']);
const validTreatmentOutcomeRequirementStatuses = new Set(['ready', 'prototype_ready', 'blocked']);
const validTreatmentOutcomeRequiredFor = new Set(['outcome_record_capture', 'follow_up_signal_linkage', 'treatment_efficacy_summary', 'portfolio_learning', 'canonical_learning_store']);
const validTreatmentOutcomeTemplateStatuses = new Set(['draft_for_governance_review']);
const validTreatmentOutcomeTemplateReviewStatuses = new Set(['draft_for_review', 'reviewed_for_prototype', 'approved_source']);
const validAtlasConfidence = new Set(['high', 'medium', 'low']);
const validAtlasStatuses = new Set(['ready', 'stale', 'needs_validation', 'missing', 'modeled', 'approved', 'superseded']);
const validAtlasRiskLevels = new Set(['critical', 'high', 'medium', 'low']);
const validAtlasSourceTypes = new Set(['external', 'internal', 'historical', 'modeled', 'ai_generated', 'user_entered']);
const validAtlasApprovalStatuses = new Set(['approved_source', 'reviewed_for_prototype', 'prototype_simulation', 'draft', 'not_reviewed']);
const validAtlasAllowedUse = new Set(['demo', 'review_draft', 'pilot_candidate', 'official']);
const validAtlasCanonicalUse = new Set(['yes', 'no', 'with_caveat']);
const agentSkillIds = new Set(agentSkillRegistry.map((skill) => skill.id));
const wikiExportFiles = [
  'public/exports/bbe-brand-doctor-system-wiki.docx',
  'public/exports/bbe-brand-doctor-system-wiki.pdf'
];
const mentalAvailabilityTemplateFiles = [
  'public/templates/mental-availability-template.json',
  'public/templates/mental-availability-template.csv'
];
const brandStrategicContextTemplateFiles = [
  'public/templates/brand-strategic-context-template.json'
];
const brandStrategicContextSourceOwnerFileBundleTemplateFiles = [
  'public/templates/brand-strategic-context-source-owner-file-bundle-template.json'
];
const momentumIntelligenceTemplateFiles = [
  'public/templates/momentum-intelligence-template.json'
];
const momentumSourceExtractTemplateFiles = [
  'public/templates/momentum-source-extract-template.json'
];
const momentumSourceExtractBundleTemplateFiles = [
  'public/templates/momentum-source-extract-bundle-template.json'
];
const momentumSourceOwnerFileBundleTemplateFiles = [
  'public/templates/momentum-source-owner-file-bundle-template.json'
];
const treatmentOutcomeRecordTemplateFiles = [
  'public/templates/treatment-outcome-record-template.json'
];

let errors = [];

function validateMomentumTrendEvidence(trendEvidence, contextLabel, options = {}) {
  const { requireCaveats = false } = options;
  if (!trendEvidence || typeof trendEvidence !== 'object') {
    errors.push(`${contextLabel} trendEvidence must be an object when supplied`);
    return;
  }
  if (typeof trendEvidence.sourceLabel !== 'string' || trendEvidence.sourceLabel.trim().length < 4) {
    errors.push(`${contextLabel} trendEvidence needs sourceLabel`);
  }
  if (!validMomentumSourcePeriodCompatibility.has(trendEvidence.sourcePeriodCompatibility)) {
    errors.push(`${contextLabel} trendEvidence has invalid sourcePeriodCompatibility ${trendEvidence.sourcePeriodCompatibility}`);
  }
  if (!Array.isArray(trendEvidence.metricReads) || trendEvidence.metricReads.length === 0) {
    errors.push(`${contextLabel} trendEvidence needs at least one metric read`);
  } else {
    const trendMetricIds = new Set();
    for (const [index, read] of trendEvidence.metricReads.entries()) {
      const readLabel = `${contextLabel} trendEvidence metricReads[${index}]`;
      if (!read || typeof read !== 'object') {
        errors.push(`${readLabel} must be an object`);
        continue;
      }
      if (typeof read.metric !== 'string' || read.metric.trim().length < 2) {
        errors.push(`${readLabel} needs metric`);
      } else if (trendMetricIds.has(read.metric)) {
        errors.push(`${contextLabel} trendEvidence duplicates metric ${read.metric}`);
      } else {
        trendMetricIds.add(read.metric);
      }
      if (!validMomentumTrendDirections.has(read.direction)) {
        errors.push(`${readLabel} has invalid direction ${read.direction}`);
      }
      if (!validMomentumTrendSignificance.has(read.significance)) {
        errors.push(`${readLabel} has invalid significance ${read.significance}`);
      }
      for (const field of ['firstValue', 'lastValue', 'delta']) {
        if (read[field] !== null && !Number.isFinite(read[field])) {
          errors.push(`${readLabel} has invalid ${field}`);
        }
      }
      if (!Number.isFinite(read.periodCount) || read.periodCount < 1) {
        errors.push(`${readLabel} needs positive periodCount`);
      }
      if (typeof read.read !== 'string' || read.read.trim().length < 8) {
        errors.push(`${readLabel} needs read`);
      }
      if (requireCaveats && (!Array.isArray(read.caveats) || read.caveats.length === 0)) {
        errors.push(`${readLabel} needs caveats`);
      }
    }
  }
  if (requireCaveats && (!Array.isArray(trendEvidence.caveats) || trendEvidence.caveats.length === 0)) {
    errors.push(`${contextLabel} trendEvidence needs caveats`);
  }
}

function validateMomentumSourceExtractShape(extract, contextLabel) {
  if (!extract || typeof extract !== 'object') {
    errors.push(`${contextLabel} must be an object`);
    return;
  }
  if (!recordIds.has(extract.brandId)) errors.push(`${contextLabel} references unknown brand ${extract.brandId}`);
  for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
    if (typeof extract[field] !== 'string' || extract[field].trim().length < 4) errors.push(`${contextLabel} needs ${field}`);
  }
  if (!validMomentumSourceExtractReviewStatuses.has(extract.reviewStatus)) {
    errors.push(`${contextLabel} has invalid reviewStatus ${extract.reviewStatus}`);
  }
  if (extract.extractKind !== undefined && !validMomentumSourceExtractKinds.has(extract.extractKind)) {
    errors.push(`${contextLabel} has invalid extractKind ${extract.extractKind}`);
  }
  if (extract.reviewStatus !== 'approved_source' && !extract.caveats?.some(caveat => caveat.toLowerCase().includes('prototype'))) {
    errors.push(`${contextLabel} reviewed_for_prototype extracts must caveat prototype status`);
  }
  const hasContent = Boolean(extract.marketContext || extract.peerSet || extract.roomToGrowInputs || extract.smdContributionWeights || extract.trendEvidence);
  if (!hasContent) errors.push(`${contextLabel} needs at least one source content block`);
  if (extract.marketContext) {
    for (const field of ['market', 'category', 'geography', 'period']) {
      if (typeof extract.marketContext[field] !== 'string' || extract.marketContext[field].trim().length < 2) {
        errors.push(`${contextLabel} marketContext needs ${field}`);
      }
    }
    if (extract.marketContext.categoryGrowth !== null && !Number.isFinite(extract.marketContext.categoryGrowth)) {
      errors.push(`${contextLabel} has invalid marketContext.categoryGrowth`);
    }
    if (!validMomentumCategoryGrowthUnits.has(extract.marketContext.categoryGrowthUnit)) {
      errors.push(`${contextLabel} has invalid categoryGrowthUnit ${extract.marketContext.categoryGrowthUnit}`);
    }
    if (!validMomentumMarketMaturity.has(extract.marketContext.maturity)) {
      errors.push(`${contextLabel} has invalid maturity ${extract.marketContext.maturity}`);
    }
  }
  if (extract.peerSet) {
    for (const field of ['peerSetId', 'label', 'selectionBasis']) {
      if (typeof extract.peerSet[field] !== 'string' || extract.peerSet[field].trim().length < 4) {
        errors.push(`${contextLabel} peerSet needs ${field}`);
      }
    }
    if (!Number.isFinite(extract.peerSet.peerCount) || extract.peerSet.peerCount < 1) {
      errors.push(`${contextLabel} peerSet needs positive peerCount`);
    }
    if (!Array.isArray(extract.peerSet.brandIds) || extract.peerSet.brandIds.length !== extract.peerSet.peerCount) {
      errors.push(`${contextLabel} peerSet brandIds must match peerCount`);
    }
    for (const peerBrandId of extract.peerSet.brandIds || []) {
      if (!recordIds.has(peerBrandId)) errors.push(`${contextLabel} references unknown peer brand ${peerBrandId}`);
      if (peerBrandId === extract.brandId) errors.push(`${contextLabel} should not include itself in peerSet.brandIds`);
    }
    if (!Array.isArray(extract.peerSet.caveats) || extract.peerSet.caveats.length === 0) {
      errors.push(`${contextLabel} peerSet needs caveats`);
    }
  }
  if (extract.roomToGrowInputs) {
    for (const field of ['penetrationHeadroom', 'demandPowerShareVsMarketShareGap', 'categoryGrowth']) {
      const value = extract.roomToGrowInputs[field];
      if (value !== null && !Number.isFinite(value)) errors.push(`${contextLabel} has invalid roomToGrowInputs.${field}`);
    }
  }
  if (extract.smdContributionWeights) {
    const weights = ['salient', 'meaningful', 'different'].map(field => extract.smdContributionWeights[field]);
    if (!weights.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
      errors.push(`${contextLabel} has invalid SMD contribution weights`);
    }
    const total = weights.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > 0.001) errors.push(`${contextLabel} SMD weights must sum to 1`);
    if (typeof extract.smdContributionWeights.sourceLabel !== 'string' || extract.smdContributionWeights.sourceLabel.trim().length < 4) {
      errors.push(`${contextLabel} smdContributionWeights needs sourceLabel`);
    }
    if (!Array.isArray(extract.smdContributionWeights.caveats) || extract.smdContributionWeights.caveats.length === 0) {
      errors.push(`${contextLabel} smdContributionWeights needs caveats`);
    }
  }
  if (extract.trendEvidence) {
    validateMomentumTrendEvidence(extract.trendEvidence, contextLabel, { requireCaveats: true });
  }
  if (extract.extractKind === 'market_share_penetration' && (!extract.marketContext || !extract.peerSet || !extract.roomToGrowInputs)) {
    errors.push(`${contextLabel} market_share_penetration extracts need marketContext, peerSet, and roomToGrowInputs`);
  }
  if (extract.extractKind === 'bbe_contribution_weight' && !extract.smdContributionWeights) {
    errors.push(`${contextLabel} bbe_contribution_weight extracts need smdContributionWeights`);
  }
  if (extract.extractKind === 'bbe_movement_significance' && !extract.trendEvidence) {
    errors.push(`${contextLabel} bbe_movement_significance extracts need trendEvidence`);
  }
  if (!Array.isArray(extract.caveats) || extract.caveats.length === 0) errors.push(`${contextLabel} needs caveats`);
}

function validateMomentumSourceOwnerFileBundleShape(bundle, contextLabel) {
  if (!bundle || typeof bundle !== 'object') {
    errors.push(`${contextLabel} must be an object`);
    return;
  }
  if (bundle.sourceBundleType !== 'momentum_source_owner_file_bundle') {
    errors.push(`${contextLabel} needs sourceBundleType momentum_source_owner_file_bundle`);
  }
  if (!Array.isArray(bundle.sourceFiles) || bundle.sourceFiles.length < 3) {
    errors.push(`${contextLabel} needs at least three sourceFiles`);
    return;
  }
  const fileKinds = new Set();
  for (const [fileIndex, sourceFile] of bundle.sourceFiles.entries()) {
    const fileLabel = `${contextLabel} sourceFiles[${fileIndex}]`;
    if (!sourceFile || typeof sourceFile !== 'object') {
      errors.push(`${fileLabel} must be an object`);
      continue;
    }
    if (!validMomentumSourceOwnerFileKinds.has(sourceFile.fileKind)) {
      errors.push(`${fileLabel} has invalid fileKind ${sourceFile.fileKind}`);
    } else {
      fileKinds.add(sourceFile.fileKind);
    }
    for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
      if (typeof sourceFile[field] !== 'string' || sourceFile[field].trim().length < 4) errors.push(`${fileLabel} needs ${field}`);
    }
    if (!validMomentumSourceExtractReviewStatuses.has(sourceFile.reviewStatus)) {
      errors.push(`${fileLabel} has invalid reviewStatus ${sourceFile.reviewStatus}`);
    }
    if (!Array.isArray(sourceFile.caveats) || sourceFile.caveats.length === 0) {
      errors.push(`${fileLabel} needs caveats`);
    }
    if (!Array.isArray(sourceFile.rows) || sourceFile.rows.length === 0) {
      errors.push(`${fileLabel} needs at least one row`);
      continue;
    }
    for (const [rowIndex, row] of sourceFile.rows.entries()) {
      const rowLabel = `${fileLabel} rows[${rowIndex}]`;
      if (!row || typeof row !== 'object') {
        errors.push(`${rowLabel} must be an object`);
        continue;
      }
      if (!recordIds.has(row.brandId)) errors.push(`${rowLabel} references unknown brand ${row.brandId}`);
      if (sourceFile.fileKind === 'market_share_penetration_file') {
        validateMomentumSourceExtractShape({
          brandId: row.brandId,
          extractKind: 'market_share_penetration',
          sourceLabel: sourceFile.sourceLabel,
          sourceOwner: sourceFile.sourceOwner,
          sourceDate: sourceFile.sourceDate,
          reviewStatus: sourceFile.reviewStatus,
          marketContext: row.marketContext,
          peerSet: row.peerSet,
          roomToGrowInputs: row.roomToGrowInputs,
          caveats: [...sourceFile.caveats, ...(row.caveats ?? [])]
        }, rowLabel);
      }
      if (sourceFile.fileKind === 'bbe_contribution_weight_file') {
        validateMomentumSourceExtractShape({
          brandId: row.brandId,
          extractKind: 'bbe_contribution_weight',
          sourceLabel: sourceFile.sourceLabel,
          sourceOwner: sourceFile.sourceOwner,
          sourceDate: sourceFile.sourceDate,
          reviewStatus: sourceFile.reviewStatus,
          smdContributionWeights: row.smdContributionWeights,
          caveats: [...sourceFile.caveats, ...(row.caveats ?? [])]
        }, rowLabel);
      }
      if (sourceFile.fileKind === 'bbe_movement_significance_file') {
        validateMomentumSourceExtractShape({
          brandId: row.brandId,
          extractKind: 'bbe_movement_significance',
          sourceLabel: sourceFile.sourceLabel,
          sourceOwner: sourceFile.sourceOwner,
          sourceDate: sourceFile.sourceDate,
          reviewStatus: sourceFile.reviewStatus,
          trendEvidence: row.trendEvidence,
          caveats: [...sourceFile.caveats, ...(row.caveats ?? [])]
        }, rowLabel);
      }
    }
  }
  for (const requiredKind of ['market_share_penetration_file', 'bbe_contribution_weight_file', 'bbe_movement_significance_file']) {
    if (!fileKinds.has(requiredKind)) errors.push(`${contextLabel} missing ${requiredKind}`);
  }
}

function validateBrandStrategicContextSourceOwnerFileBundleShape(bundle, contextLabel) {
  if (!bundle || typeof bundle !== 'object') {
    errors.push(`${contextLabel} must be an object`);
    return;
  }
  if (bundle.sourceBundleType !== 'brand_strategic_context_source_owner_file_bundle') {
    errors.push(`${contextLabel} needs sourceBundleType brand_strategic_context_source_owner_file_bundle`);
  }
  if (!Array.isArray(bundle.sourceFiles) || bundle.sourceFiles.length < 3) {
    errors.push(`${contextLabel} needs at least three sourceFiles`);
    return;
  }
  const fileKinds = new Set();
  for (const [fileIndex, sourceFile] of bundle.sourceFiles.entries()) {
    const fileLabel = `${contextLabel} sourceFiles[${fileIndex}]`;
    if (!sourceFile || typeof sourceFile !== 'object') {
      errors.push(`${fileLabel} must be an object`);
      continue;
    }
    if (!validBrandStrategicContextSourceOwnerFileKinds.has(sourceFile.fileKind)) {
      errors.push(`${fileLabel} has invalid fileKind ${sourceFile.fileKind}`);
    } else {
      fileKinds.add(sourceFile.fileKind);
    }
    for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
      if (typeof sourceFile[field] !== 'string' || sourceFile[field].trim().length < 4) errors.push(`${fileLabel} needs ${field}`);
    }
    if (!validBrandStrategicContextReviewStatuses.has(sourceFile.reviewStatus)) {
      errors.push(`${fileLabel} has invalid reviewStatus ${sourceFile.reviewStatus}`);
    }
    if (!Array.isArray(sourceFile.caveats) || sourceFile.caveats.length === 0) {
      errors.push(`${fileLabel} needs caveats`);
    }
    if (!Array.isArray(sourceFile.rows) || sourceFile.rows.length === 0) {
      errors.push(`${fileLabel} needs at least one row`);
      continue;
    }
    for (const [rowIndex, row] of sourceFile.rows.entries()) {
      const rowLabel = `${fileLabel} rows[${rowIndex}]`;
      if (!row || typeof row !== 'object') {
        errors.push(`${rowLabel} must be an object`);
        continue;
      }
      if (!recordIds.has(row.brandId)) errors.push(`${rowLabel} references unknown brand ${row.brandId}`);
      if (!validBrandStrategicContextSourceTypes.has(row.sourceType) || row.sourceType === 'prototype_seed') {
        errors.push(`${rowLabel} has invalid sourceType ${row.sourceType}`);
      }
      if (row.reviewStatus !== 'approved_source') errors.push(`${rowLabel} must be approved_source`);
      for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
        if (typeof row[field] !== 'string' || row[field].trim().length < 4) errors.push(`${rowLabel} needs ${field}`);
      }
      for (const field of ['brandDna', 'objectives', 'planningPriorities', 'approvedClaims', 'claimsNotToMake', 'caveats']) {
        if (!Array.isArray(row[field])) errors.push(`${rowLabel} needs ${field} array`);
      }
      if (sourceFile.fileKind === 'brand_foundations_file') {
        if (!row.brandStatement) errors.push(`${rowLabel} needs brandStatement`);
        if (!row.brandDna?.length) errors.push(`${rowLabel} needs brandDna`);
        if (!row.portfolioContext) errors.push(`${rowLabel} needs portfolioContext`);
      }
      if (sourceFile.fileKind === 'positioning_objectives_file') {
        if (!row.positioning) errors.push(`${rowLabel} needs positioning`);
        if (!row.objectives?.length) errors.push(`${rowLabel} needs objectives`);
        if (!row.planningPriorities?.length) errors.push(`${rowLabel} needs planningPriorities`);
      }
      if (sourceFile.fileKind === 'creative_platform_claims_file') {
        if (!row.creativePlatform) errors.push(`${rowLabel} needs creativePlatform`);
        if (!row.approvedClaims?.length) errors.push(`${rowLabel} needs approvedClaims`);
        if (!row.claimsNotToMake?.length) errors.push(`${rowLabel} needs claimsNotToMake`);
      }
    }
  }
  for (const requiredKind of ['brand_foundations_file', 'positioning_objectives_file', 'creative_platform_claims_file']) {
    if (!fileKinds.has(requiredKind)) errors.push(`${contextLabel} missing ${requiredKind}`);
  }
}

function validateBrandStrategicContextRuntimeFileDropPolicy(policy) {
  if (policy.id !== 'brand-strategic-context-runtime-file-drop-policy-v1') {
    errors.push('brand strategic context runtime file-drop policy has wrong id');
  }
  if (typeof policy.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(policy.lastReviewed)) {
    errors.push('brand strategic context runtime file-drop policy needs lastReviewed date');
  }
  if (typeof policy.purpose !== 'string' || policy.purpose.trim().length < 20) {
    errors.push('brand strategic context runtime file-drop policy needs purpose');
  }
  if (policy.defaultRuntimeConsumptionEnabled !== false) {
    errors.push('brand strategic context runtime file-drop policy must keep defaultRuntimeConsumptionEnabled false');
  }
  if (policy.canonicalUseEnabled !== false) {
    errors.push('brand strategic context runtime file-drop policy must keep canonicalUseEnabled false');
  }
  if (policy.acceptedBundleType !== 'brand_strategic_context_source_owner_file_bundle') {
    errors.push('brand strategic context runtime file-drop policy needs acceptedBundleType brand_strategic_context_source_owner_file_bundle');
  }
  if (typeof policy.expectedSourceDirectory !== 'string' || !policy.expectedSourceDirectory.includes('brand-strategic-context-source-owner-files')) {
    errors.push('brand strategic context runtime file-drop policy needs expectedSourceDirectory for Brand Strategic Context source-owner files');
  }
  if (typeof policy.templatePath !== 'string' || !policy.templatePath.endsWith('brand-strategic-context-source-owner-file-bundle-template.json')) {
    errors.push('brand strategic context runtime file-drop policy needs source-owner file-bundle templatePath');
  }
  if (!fs.existsSync(policy.templatePath)) {
    errors.push(`brand strategic context runtime file-drop policy references missing template ${policy.templatePath}`);
  }
  if (!Array.isArray(policy.requiredFileKinds) || policy.requiredFileKinds.length < 3) {
    errors.push('brand strategic context runtime file-drop policy needs requiredFileKinds');
  } else {
    for (const requiredKind of ['brand_foundations_file', 'positioning_objectives_file', 'creative_platform_claims_file']) {
      if (!policy.requiredFileKinds.includes(requiredKind)) errors.push(`brand strategic context runtime file-drop policy missing ${requiredKind}`);
    }
    for (const fileKind of policy.requiredFileKinds) {
      if (!validBrandStrategicContextSourceOwnerFileKinds.has(fileKind)) errors.push(`brand strategic context runtime file-drop policy invalid file kind ${fileKind}`);
    }
  }
  for (const field of ['promotionRequirements', 'disabledReasons', 'guardrails', 'caveats']) {
    if (!Array.isArray(policy[field]) || policy[field].length < 2) {
      errors.push(`brand strategic context runtime file-drop policy needs ${field}`);
    }
  }
}

function validateMomentumSourceRuntimeFileDropPolicy(policy) {
  if (policy.id !== 'momentum-source-runtime-file-drop-policy-v1') {
    errors.push('momentum source runtime file-drop policy has wrong id');
  }
  if (typeof policy.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(policy.lastReviewed)) {
    errors.push('momentum source runtime file-drop policy needs lastReviewed date');
  }
  if (typeof policy.purpose !== 'string' || policy.purpose.trim().length < 20) {
    errors.push('momentum source runtime file-drop policy needs purpose');
  }
  if (policy.defaultRuntimeConsumptionEnabled !== false) {
    errors.push('momentum source runtime file-drop policy must keep defaultRuntimeConsumptionEnabled false');
  }
  if (policy.canonicalUseEnabled !== false) {
    errors.push('momentum source runtime file-drop policy must keep canonicalUseEnabled false');
  }
  if (policy.acceptedBundleType !== 'momentum_source_owner_file_bundle') {
    errors.push('momentum source runtime file-drop policy needs acceptedBundleType momentum_source_owner_file_bundle');
  }
  if (typeof policy.expectedSourceDirectory !== 'string' || !policy.expectedSourceDirectory.includes('momentum-source-owner-files')) {
    errors.push('momentum source runtime file-drop policy needs expectedSourceDirectory for momentum source-owner files');
  }
  if (typeof policy.templatePath !== 'string' || !policy.templatePath.endsWith('momentum-source-owner-file-bundle-template.json')) {
    errors.push('momentum source runtime file-drop policy needs source-owner file-bundle templatePath');
  }
  if (!fs.existsSync(policy.templatePath)) {
    errors.push(`momentum source runtime file-drop policy references missing template ${policy.templatePath}`);
  }
  if (!Array.isArray(policy.requiredFileKinds) || policy.requiredFileKinds.length < 3) {
    errors.push('momentum source runtime file-drop policy needs requiredFileKinds');
  } else {
    for (const requiredKind of ['market_share_penetration_file', 'bbe_contribution_weight_file', 'bbe_movement_significance_file']) {
      if (!policy.requiredFileKinds.includes(requiredKind)) errors.push(`momentum source runtime file-drop policy missing ${requiredKind}`);
    }
    for (const fileKind of policy.requiredFileKinds) {
      if (!validMomentumSourceOwnerFileKinds.has(fileKind)) errors.push(`momentum source runtime file-drop policy invalid file kind ${fileKind}`);
    }
  }
  for (const field of ['promotionRequirements', 'disabledReasons', 'guardrails', 'caveats']) {
    if (!Array.isArray(policy[field]) || policy[field].length < 2) {
      errors.push(`momentum source runtime file-drop policy needs ${field}`);
    }
  }
}

function validateTreatmentOutcomeReadinessPolicy(policy) {
  if (policy.id !== 'treatment-outcome-readiness-requirements-v1') {
    errors.push('treatment outcome readiness policy has wrong id');
  }
  if (typeof policy.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(policy.lastReviewed)) {
    errors.push('treatment outcome readiness policy needs lastReviewed date');
  }
  if (typeof policy.purpose !== 'string' || policy.purpose.trim().length < 30) {
    errors.push('treatment outcome readiness policy needs purpose');
  }
  if (!validTreatmentOutcomeReadinessModes.has(policy.mode)) {
    errors.push(`treatment outcome readiness policy has invalid mode ${policy.mode}`);
  }
  for (const field of ['outcomeLearningEnabled', 'treatmentOutcomeClaimsEnabled', 'acceptedOutcomeRecordStoreEnabled', 'canonicalLearningStoreEnabled']) {
    if (policy[field] !== false) errors.push(`treatment outcome readiness policy must keep ${field} false`);
  }
  if (!Array.isArray(policy.requirements) || policy.requirements.length < 6) {
    errors.push('treatment outcome readiness policy needs at least six requirements');
  } else {
    const requirementIds = new Set();
    for (const requirement of policy.requirements) {
      if (!requirement.id || !requirement.label) errors.push(`treatment outcome readiness requirement missing identity fields: ${requirement.id || 'unknown'}`);
      if (requirementIds.has(requirement.id)) errors.push(`duplicate treatment outcome readiness requirement id: ${requirement.id}`);
      requirementIds.add(requirement.id);
      if (!validTreatmentOutcomeRequirementStatuses.has(requirement.status)) {
        errors.push(`treatment outcome readiness requirement ${requirement.id} has invalid status ${requirement.status}`);
      }
      if (!validTreatmentOutcomeRequiredFor.has(requirement.requiredFor)) {
        errors.push(`treatment outcome readiness requirement ${requirement.id} has invalid requiredFor ${requirement.requiredFor}`);
      }
      for (const field of ['requiredEvidence', 'blockers', 'guardrails']) {
        if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
          errors.push(`treatment outcome readiness requirement ${requirement.id} needs ${field}`);
        }
      }
    }
    for (const requiredId of ['outcome-record-schema', 'follow-up-signal-linkage', 'human-review-and-identity', 'efficacy-summary-rules', 'portfolio-learning-store', 'canonical-learning-governance']) {
      if (!requirementIds.has(requiredId)) errors.push(`treatment outcome readiness policy missing ${requiredId}`);
    }
  }
  for (const field of ['guardrails', 'caveats']) {
    if (!Array.isArray(policy[field]) || policy[field].length < 2) errors.push(`treatment outcome readiness policy needs ${field}`);
  }
  if (!JSON.stringify(policy).toLowerCase().includes('causality')) {
    errors.push('treatment outcome readiness policy must caveat causality');
  }
}

function validateTreatmentOutcomeRecordTemplate(template, contextLabel) {
  if (!template || typeof template !== 'object') {
    errors.push(`${contextLabel} must be an object`);
    return;
  }
  if (template.recordType !== 'treatment_outcome_record_draft') errors.push(`${contextLabel} has invalid recordType ${template.recordType}`);
  if (!validTreatmentOutcomeTemplateStatuses.has(template.schemaStatus)) errors.push(`${contextLabel} has invalid schemaStatus ${template.schemaStatus}`);
  if (typeof template.templateVersion !== 'string' || !template.templateVersion.includes('treatment-outcome-record')) errors.push(`${contextLabel} needs templateVersion`);
  for (const field of ['outcomeLearningEnabled', 'treatmentOutcomeClaimsEnabled', 'acceptedOutcomeRecordStoreEnabled', 'canonicalLearningStoreEnabled']) {
    if (template[field] !== false) errors.push(`${contextLabel} must keep ${field} false`);
  }
  if (!recordIds.has(template.brandId)) errors.push(`${contextLabel} references unknown brand ${template.brandId}`);
  if (!treatmentIds.has(template.treatmentId)) errors.push(`${contextLabel} references unknown treatment ${template.treatmentId}`);
  if (!template.decision || typeof template.decision !== 'object') {
    errors.push(`${contextLabel} needs decision block`);
  } else {
    for (const field of ['decisionDate', 'decisionOwner', 'reviewStatus', 'reviewerIdentityMode', 'sourceOwner', 'approvalCaveat']) {
      if (typeof template.decision[field] !== 'string' || template.decision[field].trim().length < 4) errors.push(`${contextLabel} decision needs ${field}`);
    }
    if (!validTreatmentOutcomeTemplateReviewStatuses.has(template.decision.reviewStatus)) {
      errors.push(`${contextLabel} decision has invalid reviewStatus ${template.decision.reviewStatus}`);
    }
    if (template.decision.reviewerIdentityMode !== 'prototype_reviewer_label_only') {
      errors.push(`${contextLabel} decision must preserve prototype reviewer identity mode`);
    }
  }
  if (!template.activationWindow || typeof template.activationWindow !== 'object') {
    errors.push(`${contextLabel} needs activationWindow`);
  } else {
    for (const field of ['plannedStartDate', 'plannedEndDate', 'market', 'category', 'channelOrOccasion']) {
      if (typeof template.activationWindow[field] !== 'string' || template.activationWindow[field].trim().length < 4) errors.push(`${contextLabel} activationWindow needs ${field}`);
    }
    if (!Array.isArray(template.activationWindow.caveats) || template.activationWindow.caveats.length === 0) errors.push(`${contextLabel} activationWindow needs caveats`);
  }
  for (const field of ['baselineSignals', 'followUpSignals']) {
    if (!Array.isArray(template[field]) || template[field].length === 0) {
      errors.push(`${contextLabel} needs ${field}`);
    } else {
      for (const [index, signal] of template[field].entries()) {
        const signalLabel = `${contextLabel} ${field}[${index}]`;
        for (const requiredField of ['signalId', 'signalType', 'metric', 'period', 'sourceLabel', 'sourceOwner', 'sourcePeriodCompatibility']) {
          if (typeof signal[requiredField] !== 'string' || signal[requiredField].trim().length < 2) errors.push(`${signalLabel} needs ${requiredField}`);
        }
        if (!Array.isArray(signal.caveats) || signal.caveats.length === 0) errors.push(`${signalLabel} needs caveats`);
      }
    }
  }
  if (!Array.isArray(template.commercialContextSignals)) errors.push(`${contextLabel} needs commercialContextSignals array`);
  if (!template.evidenceLinks || typeof template.evidenceLinks !== 'object') {
    errors.push(`${contextLabel} needs evidenceLinks`);
  } else {
    for (const field of ['baselineSignalIds', 'followUpSignalIds', 'relatedArtifactIds', 'relatedReviewGateIds', 'relatedSourceCandidateIds']) {
      if (!Array.isArray(template.evidenceLinks[field])) errors.push(`${contextLabel} evidenceLinks needs ${field}`);
    }
  }
  if (!template.efficacyReadiness || typeof template.efficacyReadiness !== 'object') {
    errors.push(`${contextLabel} needs efficacyReadiness`);
  } else {
    if (template.efficacyReadiness.status !== 'blocked') errors.push(`${contextLabel} efficacyReadiness must stay blocked`);
    for (const field of ['minimumOutcomeRecordCountMet', 'counterEvidenceReviewed', 'causalityEvidenceAvailable']) {
      if (template.efficacyReadiness[field] !== false) errors.push(`${contextLabel} efficacyReadiness must keep ${field} false`);
    }
    if (typeof template.efficacyReadiness.confidenceLanguage !== 'string' || !template.efficacyReadiness.confidenceLanguage.toLowerCase().includes('no efficacy claim')) {
      errors.push(`${contextLabel} efficacyReadiness must block efficacy claims`);
    }
    if (!Array.isArray(template.efficacyReadiness.blockers) || template.efficacyReadiness.blockers.length < 3) errors.push(`${contextLabel} efficacyReadiness needs blockers`);
  }
  const combinedText = JSON.stringify(template).toLowerCase();
  for (const phrase of ['causal proof', 'efficacy claim', 'canonical learning', 'accepted outcome-record']) {
    if (!combinedText.includes(phrase)) errors.push(`${contextLabel} must include guardrail/caveat for ${phrase}`);
  }
  if (!Array.isArray(template.guardrails) || template.guardrails.length < 4) errors.push(`${contextLabel} needs guardrails`);
  if (!Array.isArray(template.caveats) || template.caveats.length < 3) errors.push(`${contextLabel} needs caveats`);
}

for (const r of records) {
  for (const m of ['Demand Power','Pricing Power','Meaningful','Different','Salient']) {
    if (!r.metrics?.[m]) errors.push(`${r.brandName} missing ${m}`);
  }
  for (const id of r.diagnosisIds || []) {
    if (!diagnosisIds.has(id)) errors.push(`${r.brandName} references unknown diagnosis ${id}`);
  }
  if (!assetIds.has(r.brandId)) errors.push(`${r.brandName} missing brand asset config`);
}
for (const l of links) {
  if (!diagnosisIds.has(l.diagnosisId)) errors.push(`unknown diagnosis in link: ${l.diagnosisId}`);
  if (!treatmentIds.has(l.treatmentId)) errors.push(`unknown treatment in link: ${l.treatmentId}`);
}
for (const a of brandAssets) {
  if (!recordIds.has(a.brandId)) errors.push(`unknown brand asset: ${a.brandId}`);
  if (!a.domain && !a.logoUrl) errors.push(`brand asset ${a.brandId} needs a domain or logoUrl`);
}
for (const module of groundingModules) {
  if (!module.id || !module.title || !module.coreIdea) errors.push(`grounding module missing required fields: ${module.id || 'unknown'}`);
  if (!Number.isFinite(module.order)) errors.push(`grounding module ${module.id} needs numeric order`);
  if (!Array.isArray(module.dialogPrompts) || module.dialogPrompts.length === 0) errors.push(`grounding module ${module.id} needs dialog prompts`);
}
const groundingModuleIds = new Set(groundingModules.map(module => module.id));
const learningModuleIds = new Set();
for (const page of learningModulePages) {
  if (!page.moduleId || !page.title || !page.promise || !page.summary) errors.push(`learning module page missing required fields: ${page.moduleId || 'unknown'}`);
  if (page.moduleId && !groundingModuleIds.has(page.moduleId)) errors.push(`learning module page references unknown grounding module ${page.moduleId}`);
  if (learningModuleIds.has(page.moduleId)) errors.push(`duplicate learning module page: ${page.moduleId}`);
  learningModuleIds.add(page.moduleId);
  if (!Array.isArray(page.heroBullets) || page.heroBullets.length === 0) errors.push(`learning module page ${page.moduleId} needs heroBullets`);
  if (!Array.isArray(page.blocks) || page.blocks.length === 0) errors.push(`learning module page ${page.moduleId} needs content blocks`);
  for (const block of page.blocks || []) {
    if (!validLearningBlockTypes.has(block.type)) errors.push(`learning module page ${page.moduleId} has invalid block type ${block.type}`);
    if (!block.title) errors.push(`learning module page ${page.moduleId} has a block without title`);
  }
}
for (const module of groundingModules) {
  if (!learningModuleIds.has(module.id)) errors.push(`grounding module ${module.id} missing learning detail page`);
}
const learningPathIds = new Set();
const learningPathCoveredModuleIds = new Set();
for (const path of learningPaths) {
  if (!path.id || !path.title || !path.kicker || !path.description || !path.outcome) {
    errors.push(`learning path missing required fields: ${path.id || 'unknown'}`);
  }
  if (learningPathIds.has(path.id)) errors.push(`duplicate learning path: ${path.id}`);
  learningPathIds.add(path.id);
  if (!path.audience || !path.estimatedTime || !path.experienceType) errors.push(`learning path ${path.id} needs audience, estimatedTime, and experienceType`);
  if (!validLearningPathStatuses.has(path.status)) errors.push(`learning path ${path.id} has invalid status ${path.status}`);
  if (!Array.isArray(path.moduleIds) || path.moduleIds.length === 0) errors.push(`learning path ${path.id} needs moduleIds`);
  for (const moduleId of path.moduleIds || []) {
    if (!groundingModuleIds.has(moduleId)) errors.push(`learning path ${path.id} references unknown module ${moduleId}`);
    learningPathCoveredModuleIds.add(moduleId);
  }
  if (!path.practicePrompt) errors.push(`learning path ${path.id} needs a practicePrompt`);
}
for (const module of groundingModules) {
  if (!learningPathCoveredModuleIds.has(module.id)) errors.push(`grounding module ${module.id} is not included in any learning path`);
}
const learningPracticeIds = new Set();
const learningPracticeCoveredAnswers = new Set();
for (const scenario of learningPracticeScenarios) {
  if (!scenario.id || !scenario.title || !scenario.statement || !scenario.context) {
    errors.push(`learning practice scenario missing required fields: ${scenario.id || 'unknown'}`);
  }
  if (learningPracticeIds.has(scenario.id)) errors.push(`duplicate learning practice scenario: ${scenario.id}`);
  learningPracticeIds.add(scenario.id);
  if (!scenario.moduleId || !groundingModuleIds.has(scenario.moduleId)) {
    errors.push(`learning practice scenario ${scenario.id} references unknown module ${scenario.moduleId}`);
  }
  if (!scenario.lens) errors.push(`learning practice scenario ${scenario.id} needs a lens`);
  if (!validLearningPracticeAnswers.has(scenario.correctAnswer)) {
    errors.push(`learning practice scenario ${scenario.id} has invalid correctAnswer ${scenario.correctAnswer}`);
  } else {
    learningPracticeCoveredAnswers.add(scenario.correctAnswer);
  }
  if (!scenario.explanation || !scenario.whyItMatters) {
    errors.push(`learning practice scenario ${scenario.id} needs explanation and whyItMatters`);
  }
  if (!Array.isArray(scenario.relatedConcepts) || scenario.relatedConcepts.length === 0) {
    errors.push(`learning practice scenario ${scenario.id} needs relatedConcepts`);
  }
}
for (const answer of validLearningPracticeAnswers) {
  if (!learningPracticeCoveredAnswers.has(answer)) errors.push(`learning practice scenarios do not cover answer type ${answer}`);
}
const learningSignalLabIds = new Set();
for (const scenario of learningSignalLabScenarios) {
  if (!scenario.id || !scenario.title || !scenario.prompt || !scenario.brandExample || !scenario.coaching) {
    errors.push(`learning signal lab scenario missing required fields: ${scenario.id || 'unknown'}`);
  }
  if (learningSignalLabIds.has(scenario.id)) errors.push(`duplicate learning signal lab scenario: ${scenario.id}`);
  learningSignalLabIds.add(scenario.id);
  if (!scenario.moduleId || !groundingModuleIds.has(scenario.moduleId)) {
    errors.push(`learning signal lab scenario ${scenario.id} references unknown module ${scenario.moduleId}`);
  }
  if (!Array.isArray(scenario.signals) || scenario.signals.length < 3) {
    errors.push(`learning signal lab scenario ${scenario.id} needs at least three signals`);
  }
  for (const signal of scenario.signals || []) {
    if (!signal.label || !signal.value || !validLearningSignalTones.has(signal.tone)) {
      errors.push(`learning signal lab scenario ${scenario.id} has invalid signal ${signal.label || 'unknown'}`);
    }
  }
  if (!Array.isArray(scenario.choices) || scenario.choices.length < 3) {
    errors.push(`learning signal lab scenario ${scenario.id} needs at least three choices`);
  }
  const correctChoices = (scenario.choices || []).filter(choice => choice.isCorrect);
  if (correctChoices.length !== 1) errors.push(`learning signal lab scenario ${scenario.id} needs exactly one correct choice`);
  const choiceIds = new Set();
  for (const choice of scenario.choices || []) {
    if (!choice.id || !choice.label || !choice.read || !choice.nextLens || typeof choice.isCorrect !== 'boolean') {
      errors.push(`learning signal lab scenario ${scenario.id} has incomplete choice ${choice.id || 'unknown'}`);
    }
    if (choiceIds.has(choice.id)) errors.push(`learning signal lab scenario ${scenario.id} has duplicate choice ${choice.id}`);
    choiceIds.add(choice.id);
  }
}
const learningCaseIds = new Set();
for (const learningCase of learningCaseWalkthroughs) {
  if (!learningCase.caseId || !learningCase.brandId || !learningCase.title || !learningCase.subtitle || !learningCase.scenario) {
    errors.push(`learning case walkthrough missing required fields: ${learningCase.caseId || 'unknown'}`);
  }
  if (learningCaseIds.has(learningCase.caseId)) errors.push(`duplicate learning case walkthrough: ${learningCase.caseId}`);
  learningCaseIds.add(learningCase.caseId);
  if (learningCase.brandId && !recordIds.has(learningCase.brandId)) {
    errors.push(`learning case walkthrough ${learningCase.caseId} references unknown brand ${learningCase.brandId}`);
  }
  if (!learningCase.audience || !learningCase.estimatedTime || !learningCase.sourceCaveat) {
    errors.push(`learning case walkthrough ${learningCase.caseId} needs audience, estimatedTime, and sourceCaveat`);
  }
  if (!Array.isArray(learningCase.learningObjectives) || learningCase.learningObjectives.length < 3) {
    errors.push(`learning case walkthrough ${learningCase.caseId} needs at least three learningObjectives`);
  }
  if (!Array.isArray(learningCase.steps) || learningCase.steps.length < 4) {
    errors.push(`learning case walkthrough ${learningCase.caseId} needs at least four steps`);
  }
  const stepIds = new Set();
  for (const step of learningCase.steps || []) {
    if (!step.id || !step.title || !step.prompt || !step.context || !step.coaching) {
      errors.push(`learning case walkthrough ${learningCase.caseId} has incomplete step ${step.id || 'unknown'}`);
    }
    if (stepIds.has(step.id)) errors.push(`learning case walkthrough ${learningCase.caseId} has duplicate step ${step.id}`);
    stepIds.add(step.id);
    if (!step.moduleId || !groundingModuleIds.has(step.moduleId)) {
      errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} references unknown module ${step.moduleId}`);
    }
    if (!Array.isArray(step.signalCards) || step.signalCards.length < 3) {
      errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} needs at least three signalCards`);
    }
    for (const signal of step.signalCards || []) {
      if (!signal.label || !signal.value || !validLearningSignalTones.has(signal.tone)) {
        errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} has invalid signal ${signal.label || 'unknown'}`);
      }
    }
    if (!Array.isArray(step.choices) || step.choices.length < 3) {
      errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} needs at least three choices`);
    }
    const correctChoices = (step.choices || []).filter(choice => choice.isCorrect);
    if (correctChoices.length !== 1) errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} needs exactly one correct choice`);
    const choiceIds = new Set();
    for (const choice of step.choices || []) {
      if (!choice.id || !choice.label || typeof choice.isCorrect !== 'boolean' || !choice.feedback) {
        errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} has incomplete choice ${choice.id || 'unknown'}`);
      }
      if (choiceIds.has(choice.id)) errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} has duplicate choice ${choice.id}`);
      choiceIds.add(choice.id);
    }
    if (!Array.isArray(step.evidenceRefs) || step.evidenceRefs.length === 0) {
      errors.push(`learning case walkthrough ${learningCase.caseId}/${step.id} needs evidenceRefs`);
    }
  }
  if (!learningCase.completion?.headline || !learningCase.completion?.summary || !learningCase.completion?.reportLink) {
    errors.push(`learning case walkthrough ${learningCase.caseId} needs completion headline, summary, and reportLink`);
  }
  if (learningCase.completion?.reportLink && !learningCase.completion.reportLink.startsWith('/brand/')) {
    errors.push(`learning case walkthrough ${learningCase.caseId} completion reportLink should point to a brand route`);
  }
  if (!Array.isArray(learningCase.completion?.nextSteps) || learningCase.completion.nextSteps.length === 0) {
    errors.push(`learning case walkthrough ${learningCase.caseId} needs completion nextSteps`);
  }
}
for (const q of groundingQuiz) {
  if (!q.id || !q.question) errors.push(`grounding quiz item missing required fields: ${q.id || 'unknown'}`);
  if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`grounding quiz ${q.id} needs at least two options`);
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) errors.push(`grounding quiz ${q.id} has invalid correctIndex`);
}
if (!momentumPolicy.principle || !Array.isArray(momentumPolicy.states) || momentumPolicy.states.length < 6) {
  errors.push('momentum_policy.json needs principle and six core states');
}
for (const node of gnFrameworkNodes) {
  if (!node.id || !node.label || !Array.isArray(node.signalAliases)) errors.push(`GN framework node missing required fields: ${node.id || 'unknown'}`);
}
if (!sourcePeriodPolicy.defaultWithGrowthNavigator || !sourcePeriodPolicy.defaultWithoutGrowthNavigator) {
  errors.push('source_period_policy.json needs default compatibility labels');
}
if (!colorCodingRules.principle || !Array.isArray(colorCodingRules.tones) || colorCodingRules.tones.length < 3) {
  errors.push('color_coding_rules.json needs principle and tone rules');
}
if (!Array.isArray(pricingPowerGuardrails.notValidFor) || !pricingPowerGuardrails.notValidFor.some(item => item.includes('SKU'))) {
  errors.push('pricing_power_guardrails.json must explicitly block SKU-level pricing guidance');
}
for (const rule of diagnosisRules) {
  if (!rule.id || !rule.description || !rule.diagnosisId) errors.push(`diagnosis rule missing required fields: ${rule.id || 'unknown'}`);
  if (rule.diagnosisId && !diagnosisIds.has(rule.diagnosisId)) errors.push(`diagnosis rule ${rule.id} references unknown diagnosis ${rule.diagnosisId}`);
  if (!Number.isFinite(rule.priority)) errors.push(`diagnosis rule ${rule.id} needs numeric priority`);
  if (!rule.evidenceSummary) errors.push(`diagnosis rule ${rule.id} needs evidenceSummary`);
  const conditionGroups = [...(rule.all || []), ...(rule.any || []), ...(rule.counter || [])];
  if (!conditionGroups.length) errors.push(`diagnosis rule ${rule.id} needs at least one condition`);
  for (const condition of conditionGroups) {
    if (!condition.metric || !condition.field || !condition.op || !condition.evidence) {
      errors.push(`diagnosis rule ${rule.id} has an incomplete condition`);
      continue;
    }
    if (!validMetricFields.has(condition.field)) errors.push(`diagnosis rule ${rule.id} uses invalid metric field ${condition.field}`);
    if (!validRuleOps.has(condition.op)) errors.push(`diagnosis rule ${rule.id} uses invalid operator ${condition.op}`);
  }
  if (rule.minAnyMatches && (!Array.isArray(rule.any) || rule.minAnyMatches > rule.any.length)) {
    errors.push(`diagnosis rule ${rule.id} minAnyMatches exceeds any condition count`);
  }
}
for (const template of treatmentPlanTemplates) {
  if (!template.id || !template.name || !Array.isArray(template.sequence)) errors.push(`treatment plan template missing required fields: ${template.id || 'unknown'}`);
}
const personaIds = new Set();
for (const persona of personas) {
  if (!persona.id || !persona.name || !persona.shortName || !persona.description) errors.push(`persona missing required identity fields: ${persona.id || 'unknown'}`);
  if (personaIds.has(persona.id)) errors.push(`duplicate persona id: ${persona.id}`);
  personaIds.add(persona.id);
  if (!persona.systemInstruction) errors.push(`persona ${persona.id} needs systemInstruction`);
  if (!Array.isArray(persona.responseStyle) || persona.responseStyle.length === 0) errors.push(`persona ${persona.id} needs responseStyle items`);
  if (!Array.isArray(persona.bestFor) || persona.bestFor.length === 0) errors.push(`persona ${persona.id} needs bestFor items`);
  if (!persona.decisionBias) errors.push(`persona ${persona.id} needs decisionBias`);
  if (!persona.caveatStyle) errors.push(`persona ${persona.id} needs caveatStyle`);
}
const liveActionIds = new Set();
for (const action of liveConsultActions) {
  if (!action.id || !action.type || !action.label || !action.description || !action.spokenCue) {
    errors.push(`live consult action missing required fields: ${action.id || 'unknown'}`);
  }
  if (liveActionIds.has(action.id)) errors.push(`duplicate live consult action id: ${action.id}`);
  liveActionIds.add(action.id);
  if (!validLiveConsultActionTypes.has(action.type)) errors.push(`live consult action ${action.id} uses invalid type ${action.type}`);
  if (action.type === 'navigate_to_section' && !action.targetSectionId) errors.push(`live consult action ${action.id} needs targetSectionId`);
  if (action.type === 'highlight_metric' && !action.targetMetric) errors.push(`live consult action ${action.id} needs targetMetric`);
  if (action.type === 'select_treatment_path' && !Number.isFinite(action.targetRank)) errors.push(`live consult action ${action.id} needs numeric targetRank`);
}
for (const scenario of liveConsultScenarios) {
  if (!scenario.id || !scenario.label || !scenario.prompt) errors.push(`live consult scenario missing required fields: ${scenario.id || 'unknown'}`);
  if (!Array.isArray(scenario.preferredActions) || scenario.preferredActions.length === 0) errors.push(`live consult scenario ${scenario.id} needs preferredActions`);
  for (const actionId of scenario.preferredActions || []) {
    if (!liveActionIds.has(actionId)) errors.push(`live consult scenario ${scenario.id} references unknown action ${actionId}`);
  }
}
const skillIds = new Set();
const skillAllowedViewIds = new Set();
for (const skill of agentSkillRegistry) {
  if (!skill.id || !skill.name || !skill.family || !skill.purpose) {
    errors.push(`agent skill missing required identity fields: ${skill.id || 'unknown'}`);
  }
  if (skillIds.has(skill.id)) errors.push(`duplicate agent skill id: ${skill.id}`);
  skillIds.add(skill.id);
  if (!validAgentSkillFamilies.has(skill.family)) errors.push(`agent skill ${skill.id} has invalid family ${skill.family}`);
  if (!validHumanApprovalRequirements.has(skill.humanApproval)) errors.push(`agent skill ${skill.id} has invalid humanApproval ${skill.humanApproval}`);
  if (!validPilotPriorities.has(skill.pilotPriority)) errors.push(`agent skill ${skill.id} has invalid pilotPriority ${skill.pilotPriority}`);
  if (!Array.isArray(skill.primaryUserIntent) || skill.primaryUserIntent.length === 0) errors.push(`agent skill ${skill.id} needs primaryUserIntent`);
  if (!Array.isArray(skill.requiredInputs)) errors.push(`agent skill ${skill.id} needs requiredInputs array`);
  if (!Array.isArray(skill.optionalInputs)) errors.push(`agent skill ${skill.id} needs optionalInputs array`);
  if (!Array.isArray(skill.allowedServices) || skill.allowedServices.length === 0) errors.push(`agent skill ${skill.id} needs allowedServices`);
  if (!skill.outputSchema) errors.push(`agent skill ${skill.id} needs outputSchema`);
  if (!Array.isArray(skill.allowedViewIds) || skill.allowedViewIds.length === 0) errors.push(`agent skill ${skill.id} needs allowedViewIds`);
  for (const viewId of skill.allowedViewIds || []) skillAllowedViewIds.add(viewId);
  if (!Array.isArray(skill.guardrails) || skill.guardrails.length === 0) errors.push(`agent skill ${skill.id} needs guardrails`);
}
const viewIds = new Set();
const viewAllowedSkillsById = new Map();
const viewsAllowedSkillIds = new Set();
for (const view of dynamicViewRegistry) {
  if (!view.id || !view.name || !view.family || !view.purpose) {
    errors.push(`dynamic view missing required identity fields: ${view.id || 'unknown'}`);
  }
  if (viewIds.has(view.id)) errors.push(`duplicate dynamic view id: ${view.id}`);
  viewIds.add(view.id);
  if (!validDynamicViewFamilies.has(view.family)) errors.push(`dynamic view ${view.id} has invalid family ${view.family}`);
  if (!Array.isArray(view.requiredData) || view.requiredData.length === 0) errors.push(`dynamic view ${view.id} needs requiredData`);
  if (!Array.isArray(view.supportedModes) || view.supportedModes.length === 0) errors.push(`dynamic view ${view.id} needs supportedModes`);
  for (const mode of view.supportedModes || []) {
    if (!validDynamicViewModes.has(mode)) errors.push(`dynamic view ${view.id} has invalid mode ${mode}`);
  }
  if (!Array.isArray(view.claimTypes) || view.claimTypes.length === 0) errors.push(`dynamic view ${view.id} needs claimTypes`);
  if (typeof view.evidenceRequired !== 'boolean') errors.push(`dynamic view ${view.id} needs boolean evidenceRequired`);
  if (!Array.isArray(view.allowedSkillIds) || view.allowedSkillIds.length === 0) errors.push(`dynamic view ${view.id} needs allowedSkillIds`);
  viewAllowedSkillsById.set(view.id, new Set(view.allowedSkillIds || []));
  for (const skillId of view.allowedSkillIds || []) viewsAllowedSkillIds.add(skillId);
  if (!Array.isArray(view.guardrails) || view.guardrails.length === 0) errors.push(`dynamic view ${view.id} needs guardrails`);
}
for (const viewId of skillAllowedViewIds) {
  if (!viewIds.has(viewId)) errors.push(`agent skill references unknown dynamic view: ${viewId}`);
}
for (const skillId of viewsAllowedSkillIds) {
  if (!skillIds.has(skillId)) errors.push(`dynamic view references unknown agent skill: ${skillId}`);
}
for (const requiredSkill of ['answer_brand_question', 'bbe_momentum_intelligence_read', 'create_growth_provocations', 'recommend_dynamic_view', 'teach_brand_growth_concept', 'review_session_state', 'inspect_experience_architecture', 'inspect_source_promotion_readiness', 'inspect_artifact_readiness', 'inspect_pilot_learning', 'inspect_quiet_proactivity', 'inspect_voice_readiness', 'inspect_persistence_readiness', 'inspect_treatment_outcome_readiness', 'inspect_runtime_governance', 'inspect_foundation_readiness', 'plan_executive_pilot']) {
  if (!skillIds.has(requiredSkill)) errors.push(`agent skill registry missing required pilot skill ${requiredSkill}`);
}
for (const requiredView of ['kpi_strip', 'momentum_ladder', 'source_readiness_panel', 'source_runtime_ingestion_panel', 'source_promotion_readiness_panel', 'meeting_takeaway_panel', 'review_workflow_panel', 'memory_audit_panel', 'audit_trail_panel', 'review_identity_panel', 'artifact_readiness_panel', 'pilot_learning_panel', 'proactivity_panel', 'voice_readiness_panel', 'provider_adapter_panel', 'capability_readiness_panel', 'persistence_readiness_panel', 'treatment_outcome_readiness_panel', 'runtime_governance_panel', 'runtime_quality_panel', 'experience_architecture_panel', 'canvas_continuity_panel', 'foundation_readiness_panel', 'executive_pilot_runbook_panel', 'promotion_gate_panel', 'evidence_ledger', 'evidence_spotlight_panel', 'growth_provocation_list', 'data_gap_panel']) {
  if (!viewIds.has(requiredView)) errors.push(`dynamic view registry missing required pilot view ${requiredView}`);
}
const domainPackIds = new Set();
for (const pack of domainPackRegistry) {
  if (!pack.id || !pack.name || !pack.version || !pack.purpose) {
    errors.push(`domain pack missing identity fields: ${pack.id || 'unknown'}`);
  }
  if (domainPackIds.has(pack.id)) errors.push(`duplicate domain pack id: ${pack.id}`);
  domainPackIds.add(pack.id);
  if (!validDomainPackStatuses.has(pack.status)) errors.push(`domain pack ${pack.id} has invalid status ${pack.status}`);
  for (const field of ['centralRecordType', 'reasoningReadType']) {
    if (typeof pack[field] !== 'string' || pack[field].trim().length < 4) errors.push(`domain pack ${pack.id} needs ${field}`);
  }
  for (const field of ['sourceRecordTypes', 'knowledgeArtifacts', 'reasoningArtifacts', 'skillIds', 'viewIds', 'outputModuleIds', 'guardrails', 'pilotReadinessGates']) {
    if (!Array.isArray(pack[field]) || pack[field].length === 0) errors.push(`domain pack ${pack.id} needs ${field}`);
  }
  for (const artifactPath of [...(pack.knowledgeArtifacts || []), ...(pack.reasoningArtifacts || [])]) {
    if (!fs.existsSync(artifactPath)) errors.push(`domain pack ${pack.id} references missing artifact ${artifactPath}`);
  }
  for (const skillId of pack.skillIds || []) {
    if (!skillIds.has(skillId)) errors.push(`domain pack ${pack.id} references unknown skill ${skillId}`);
  }
  for (const viewId of pack.viewIds || []) {
    if (!viewIds.has(viewId)) errors.push(`domain pack ${pack.id} references unknown view ${viewId}`);
  }
  if (!pack.guardrails?.some((guardrail) => guardrail.toLowerCase().includes('simulated'))) {
    errors.push(`domain pack ${pack.id} needs simulated-data guardrail`);
  }
}
const bbeDomainPack = domainPackRegistry.find((pack) => pack.id === 'bbe-brand-equity');
for (const outputModuleId of ['benchmark_lens_explainer', 'chart_read', 'executive_verdict', 'source_readiness', 'demographic_diagnostic_state', 'provocation_questions']) {
  if (!bbeDomainPack?.outputModuleIds?.includes(outputModuleId)) {
    errors.push(`bbe-brand-equity domain pack must include ${outputModuleId} output module`);
  }
}
if (bbeDeckDoctrine.id !== 'bbe-deck-doctrine-v1') errors.push('bbe-deck-doctrine.json needs id bbe-deck-doctrine-v1');
if (bbeDeckDoctrine.sourceReportId !== 'bbe-snacks-tracker-2026-q1-us-snacks') {
  errors.push('bbe-deck-doctrine.json must reference the governed Q1 2026 US Snacks source report');
}
for (const field of ['benchmarkLenses', 'chartRead', 'typology', 'driverRelationships', 'pricingPowerGuardrail', 'provocations']) {
  if (!Array.isArray(bbeDeckDoctrine.sourceSlides?.[field]) || bbeDeckDoctrine.sourceSlides[field].length === 0) {
    errors.push(`bbe-deck-doctrine.json needs sourceSlides.${field}`);
  }
}
if (!bbeDeckDoctrine.sourceSlides?.chartRead?.includes(17)) {
  errors.push('bbe-deck-doctrine.json sourceSlides.chartRead must include executive MDS dashboard slide 17');
}
for (const metric of ['Demand Power', 'Pricing Power', 'Meaningful', 'Different', 'Salient']) {
  if (!bbeDeckDoctrine.metricSystem?.coreMetrics?.includes(metric)) errors.push(`bbe-deck-doctrine.json coreMetrics missing ${metric}`);
}
for (const metric of ['Salient', 'Meaningful', 'Different']) {
  if (!bbeDeckDoctrine.metricSystem?.userFacingInputOrder?.includes(metric)) errors.push(`bbe-deck-doctrine.json userFacingInputOrder missing ${metric}`);
}
if (bbeDeckDoctrine.metricSystem?.userFacingValueLabel !== 'Perceived Value') {
  errors.push('bbe-deck-doctrine.json must use Perceived Value as user-facing value label');
}
const deckDoctrineLensIds = new Set();
for (const lens of bbeDeckDoctrine.benchmarkLensHierarchy || []) {
  if (!validDeckDoctrineLensIds.has(lens.id)) errors.push(`bbe-deck-doctrine.json invalid lens id ${lens.id}`);
  if (!validDeckDoctrineLensRoles.has(lens.role)) errors.push(`bbe-deck-doctrine.json invalid lens role ${lens.role}`);
  if (!Number.isFinite(lens.precedence)) errors.push(`bbe-deck-doctrine.json lens ${lens.id} needs numeric precedence`);
  if (!lens.definition || !lens.productRule || !lens.sourceContext) errors.push(`bbe-deck-doctrine.json lens ${lens.id} needs definition/productRule/sourceContext`);
  deckDoctrineLensIds.add(lens.id);
}
for (const requiredLens of validDeckDoctrineLensIds) {
  if (!deckDoctrineLensIds.has(requiredLens)) errors.push(`bbe-deck-doctrine.json missing lens ${requiredLens}`);
}
if (!bbeDeckDoctrine.benchmarkLensHierarchy?.find((lens) => lens.id === 'momentum' && lens.precedence === 1)) {
  errors.push('bbe-deck-doctrine.json must make Momentum precedence 1');
}
if (!bbeDeckDoctrine.benchmarkLensHierarchy?.find((lens) => lens.id === 'vsCategory' && lens.productRule.toLowerCase().includes('cannot prove brand health'))) {
  errors.push('bbe-deck-doctrine.json vsCategory must block health proof overclaiming');
}
if (!bbeDeckDoctrine.typologyPolicy?.productRule?.toLowerCase().includes('source context')) {
  errors.push('bbe-deck-doctrine.json typologyPolicy must restrict typology to source context');
}
if (!bbeDeckDoctrine.typologyPolicy?.blockedUse?.toLowerCase().includes('final product verdict')) {
  errors.push('bbe-deck-doctrine.json typologyPolicy must block final product verdict use');
}
if (!bbeDeckDoctrine.strengthLanguagePolicy?.blockedTerms?.includes('strong')) {
  errors.push('bbe-deck-doctrine.json strengthLanguagePolicy must include strong as a blocked term');
}
if (!bbeDeckDoctrine.strengthLanguagePolicy?.requiredQualifierWhenBlocked?.toLowerCase().includes('large/category-leading but vulnerable')) {
  errors.push('bbe-deck-doctrine.json strengthLanguagePolicy needs large/category-leading but vulnerable qualifier');
}
for (const [metric, relationship] of Object.entries(bbeDeckDoctrine.driverRelationships || {})) {
  if (!['Demand Power', 'Pricing Power'].includes(metric)) errors.push(`bbe-deck-doctrine.json has unexpected driver relationship ${metric}`);
  if (!Array.isArray(relationship.primaryDrivers) || relationship.primaryDrivers.length === 0) errors.push(`bbe-deck-doctrine.json ${metric} needs primaryDrivers`);
  if (!relationship.read) errors.push(`bbe-deck-doctrine.json ${metric} needs read`);
  const weightSum = Object.values(relationship.sourceWeights || {}).reduce((sum, value) => sum + value, 0);
  if (Math.abs(weightSum - 1) > 0.01) errors.push(`bbe-deck-doctrine.json ${metric} sourceWeights must sum near 1`);
}
if (!bbeDeckDoctrine.pricingPowerPolicy?.notValidFor?.includes('SKU-level price decisions')) {
  errors.push('bbe-deck-doctrine.json pricingPowerPolicy must block SKU-level price decisions');
}
if (!bbeDeckDoctrine.demographicPolicy?.productRule?.toLowerCase().includes('official bbe demographic cuts')) {
  errors.push('bbe-deck-doctrine.json demographicPolicy must require official BBE demographic cuts');
}
if (!bbeDeckDoctrine.sourceUsePolicy?.blockedUses?.includes('pilot_canonical_data_store')) {
  errors.push('bbe-deck-doctrine.json sourceUsePolicy must block direct pilot canonical use');
}
if (!Array.isArray(kateGoldenTestCases) || kateGoldenTestCases.length < 8) {
  errors.push('kate-s-golden-test-cases.json needs at least eight golden cases');
} else {
  const goldenIds = new Set();
  for (const [index, testCase] of kateGoldenTestCases.entries()) {
    const label = `kate-s-golden-test-cases[${index}]`;
    for (const field of ['id', 'name', 'brandId', 'question']) {
      if (typeof testCase[field] !== 'string' || testCase[field].trim().length < 3) errors.push(`${label} needs ${field}`);
    }
    if (goldenIds.has(testCase.id)) errors.push(`duplicate Kate golden test id ${testCase.id}`);
    goldenIds.add(testCase.id);
    if (!recordIds.has(testCase.brandId)) errors.push(`${label} references unknown brand ${testCase.brandId}`);
    if (!Array.isArray(testCase.expectedIntentTypes) || testCase.expectedIntentTypes.length === 0) {
      errors.push(`${label} needs expectedIntentTypes`);
    } else {
      for (const intentType of testCase.expectedIntentTypes) {
        if (!validKateGoldenIntentTypes.has(intentType)) errors.push(`${label} has invalid expected intent ${intentType}`);
      }
    }
    if (!Array.isArray(testCase.expectedGroundings) || testCase.expectedGroundings.length === 0) {
      errors.push(`${label} needs expectedGroundings`);
    } else {
      for (const grounding of testCase.expectedGroundings) {
        if (!validKateGoldenGroundings.has(grounding)) errors.push(`${label} has invalid expected grounding ${grounding}`);
      }
    }
    for (const groupField of ['answerMustIncludeAny', 'evidenceBasisMustIncludeAny', 'guardrailsMustIncludeAny', 'missingEvidenceMustIncludeAny']) {
      if (!Array.isArray(testCase[groupField]) || testCase[groupField].length === 0) {
        errors.push(`${label} needs ${groupField}`);
      } else {
        for (const [groupIndex, group] of testCase[groupField].entries()) {
          if (!Array.isArray(group) || group.length === 0 || !group.every((term) => typeof term === 'string' && term.trim().length > 1)) {
            errors.push(`${label} ${groupField}[${groupIndex}] must be an array of search terms`);
          }
        }
      }
    }
    if (!Array.isArray(testCase.answerMustNotInclude)) errors.push(`${label} needs answerMustNotInclude array`);
  }
  for (const requiredId of ['strong-or-just-big', 'declining-while-category-leading', 'headline-verdict', 'star-typology', 'gen-z-demographic', 'pricing-power-inspect', 'driver-system', 'source-evidence', 'blocked-claims']) {
    if (!goldenIds.has(requiredId)) errors.push(`kate-s-golden-test-cases.json missing required case ${requiredId}`);
  }
}
const experienceTemplateIds = new Set();
for (const template of experienceTemplateRegistry) {
  if (!template.id || !template.name || !template.purpose) {
    errors.push(`experience template missing identity fields: ${template.id || 'unknown'}`);
  }
  if (experienceTemplateIds.has(template.id)) errors.push(`duplicate experience template id: ${template.id}`);
  experienceTemplateIds.add(template.id);
  if (!validExperienceAudiences.has(template.audience)) errors.push(`experience template ${template.id} has invalid audience ${template.audience}`);
  if (!validExperienceObjectives.has(template.objective)) errors.push(`experience template ${template.id} has invalid objective ${template.objective}`);
  if (!validExperienceLayouts.has(template.layout)) errors.push(`experience template ${template.id} has invalid layout ${template.layout}`);
  if (!Array.isArray(template.triggerTerms) || template.triggerTerms.length === 0) errors.push(`experience template ${template.id} needs triggerTerms`);
  if (!Array.isArray(template.requiredSkillIds) || template.requiredSkillIds.length === 0) errors.push(`experience template ${template.id} needs requiredSkillIds`);
  for (const skillId of template.requiredSkillIds || []) {
    if (!skillIds.has(skillId)) errors.push(`experience template ${template.id} references unknown skill ${skillId}`);
  }
  if (!Array.isArray(template.zones) || template.zones.length === 0) errors.push(`experience template ${template.id} needs zones`);
  const zoneIds = new Set();
  for (const zone of template.zones || []) {
    if (!zone.id || !zone.title || !zone.purpose || !zone.viewId || !zone.requiredSkillId) {
      errors.push(`experience template ${template.id} has incomplete zone ${zone.id || 'unknown'}`);
      continue;
    }
    if (zoneIds.has(zone.id)) errors.push(`experience template ${template.id} has duplicate zone ${zone.id}`);
    zoneIds.add(zone.id);
    if (!viewIds.has(zone.viewId)) errors.push(`experience template ${template.id}/${zone.id} references unknown view ${zone.viewId}`);
    if (!skillIds.has(zone.requiredSkillId)) errors.push(`experience template ${template.id}/${zone.id} references unknown skill ${zone.requiredSkillId}`);
    if (viewIds.has(zone.viewId) && !viewAllowedSkillsById.get(zone.viewId)?.has(zone.requiredSkillId)) {
      errors.push(`experience template ${template.id}/${zone.id} uses view ${zone.viewId} with disallowed skill ${zone.requiredSkillId}`);
    }
    if (typeof zone.evidenceRequired !== 'boolean') errors.push(`experience template ${template.id}/${zone.id} needs boolean evidenceRequired`);
    if (!Number.isFinite(zone.priority)) errors.push(`experience template ${template.id}/${zone.id} needs numeric priority`);
  }
  if (!Array.isArray(template.artifactTypes)) errors.push(`experience template ${template.id} needs artifactTypes array`);
  for (const artifactType of template.artifactTypes || []) {
    if (!validExperienceArtifactTypes.has(artifactType)) errors.push(`experience template ${template.id} has invalid artifact type ${artifactType}`);
  }
  if (!Array.isArray(template.guardrails) || template.guardrails.length === 0) errors.push(`experience template ${template.id} needs guardrails`);
  if (!validHumanApprovalRequirements.has(template.humanApproval)) errors.push(`experience template ${template.id} has invalid humanApproval ${template.humanApproval}`);
  if (!validPilotPriorities.has(template.pilotPriority)) errors.push(`experience template ${template.id} has invalid pilotPriority ${template.pilotPriority}`);
}
for (const requiredTemplate of ['executive-qbr-decision-read', 'insights-evidence-lab', 'marketer-treatment-planning', 'learning-coach', 'source-readiness-lab', 'source-owner-intake-workbench', 'source-promotion-readiness-cockpit', 'review-operations-cockpit', 'pilot-learning-cockpit', 'quiet-proactivity-cockpit', 'voice-readiness-cockpit', 'persistence-readiness-cockpit', 'treatment-outcome-readiness-cockpit', 'artifact-readiness-cockpit', 'runtime-governance-cockpit', 'experience-architecture-cockpit', 'foundation-readiness-cockpit', 'executive-pilot-runbook', 'live-meeting-capture', 'agency-brief-builder']) {
  if (!experienceTemplateIds.has(requiredTemplate)) errors.push(`experience template registry missing required pilot template ${requiredTemplate}`);
}
if (executiveAssetPageModuleRegistry.id !== 'executive-intelligence-asset-page-module-registry-v1') {
  errors.push('executive asset page module registry needs id executive-intelligence-asset-page-module-registry-v1');
}
if (typeof executiveAssetPageModuleRegistry.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(executiveAssetPageModuleRegistry.lastReviewed)) {
  errors.push('executive asset page module registry needs YYYY-MM-DD lastReviewed');
}
if (typeof executiveAssetPageModuleRegistry.purpose !== 'string' || executiveAssetPageModuleRegistry.purpose.trim().length < 20) {
  errors.push('executive asset page module registry needs purpose');
}
if (!Array.isArray(executiveAssetPageModuleRegistry.guardrails) || executiveAssetPageModuleRegistry.guardrails.length < 3) {
  errors.push('executive asset page module registry needs guardrails');
}
const executiveAssetModuleIds = new Set();
for (const definition of executiveAssetPageModuleRegistry.moduleDefinitions || []) {
  const label = `executive asset page module ${definition.moduleId || 'unknown'}`;
  if (!validExecutiveAssetPageModuleIds.has(definition.moduleId)) errors.push(`${label} has invalid moduleId`);
  if (executiveAssetModuleIds.has(definition.moduleId)) errors.push(`duplicate executive asset page module ${definition.moduleId}`);
  executiveAssetModuleIds.add(definition.moduleId);
  if (!definition.title || typeof definition.title !== 'string') errors.push(`${label} needs title`);
  if (!validExecutiveAssetVisualPatterns.has(definition.visualPattern)) errors.push(`${label} has invalid visualPattern ${definition.visualPattern}`);
  if (!validExecutiveAssetFocusLevels.has(definition.focusLevel)) errors.push(`${label} has invalid focusLevel ${definition.focusLevel}`);
  if (!validExecutiveAssetOutputModes.has(definition.outputMode)) errors.push(`${label} has invalid outputMode ${definition.outputMode}`);
  if (typeof definition.outputModeRationale !== 'string' || definition.outputModeRationale.trim().length < 40) errors.push(`${label} needs outputModeRationale`);
  if (!Array.isArray(definition.requiredSourceModuleIds) || definition.requiredSourceModuleIds.length === 0) errors.push(`${label} needs requiredSourceModuleIds`);
  if (!Array.isArray(definition.requiredProofKinds) || definition.requiredProofKinds.length === 0) errors.push(`${label} needs requiredProofKinds`);
  for (const proofKind of definition.requiredProofKinds || []) {
    if (!validExecutiveAssetProofKinds.has(proofKind)) errors.push(`${label} has invalid proof kind ${proofKind}`);
  }
  for (const field of ['minPrimaryEvidence', 'minExpandableProof', 'minEvidenceNeeded', 'minBlockedOverclaims', 'minNextActions']) {
    if (!Number.isInteger(definition[field]) || definition[field] < 1) errors.push(`${label} needs positive integer ${field}`);
  }
  if (typeof definition.sourcePostureRequired !== 'boolean') errors.push(`${label} needs boolean sourcePostureRequired`);
  for (const field of ['blockedClaimSignalGroups', 'evidenceNeededSignalGroups']) {
    if (!Array.isArray(definition[field]) || definition[field].length === 0) {
      errors.push(`${label} needs ${field}`);
      continue;
    }
    for (const [index, group] of definition[field].entries()) {
      if (!Array.isArray(group) || group.length === 0 || group.some((signal) => typeof signal !== 'string' || signal.trim().length < 3)) {
        errors.push(`${label} ${field}[${index}] needs non-empty string signals`);
      }
    }
  }
  if (!Array.isArray(definition.allowedRevisionTypes) || definition.allowedRevisionTypes.length === 0) errors.push(`${label} needs allowedRevisionTypes`);
  for (const revisionType of definition.allowedRevisionTypes || []) {
    if (!validExecutiveAssetRevisionTypes.has(revisionType)) errors.push(`${label} has invalid revision type ${revisionType}`);
  }
  if (!Array.isArray(definition.nextOperationCandidates) || definition.nextOperationCandidates.length === 0) errors.push(`${label} needs nextOperationCandidates`);
  for (const nextOperation of definition.nextOperationCandidates || []) {
    if (!validExecutiveAssetNextOperations.has(nextOperation)) errors.push(`${label} has invalid next operation ${nextOperation}`);
  }
}
for (const requiredModuleId of validExecutiveAssetPageModuleIds) {
  if (!executiveAssetModuleIds.has(requiredModuleId)) errors.push(`executive asset page module registry missing ${requiredModuleId}`);
}
const executiveAssetDefinitionIds = new Set();
if (!Array.isArray(executiveAssetPageModuleRegistry.assetDefinitions) || executiveAssetPageModuleRegistry.assetDefinitions.length < 1) {
  errors.push('executive asset page module registry needs assetDefinitions');
}
for (const definition of executiveAssetPageModuleRegistry.assetDefinitions || []) {
  const label = `executive asset definition ${definition.assetId || 'unknown'}`;
  if (!definition.assetId || typeof definition.assetId !== 'string') errors.push(`${label} needs assetId`);
  if (executiveAssetDefinitionIds.has(definition.assetId)) errors.push(`duplicate executive asset definition ${definition.assetId}`);
  executiveAssetDefinitionIds.add(definition.assetId);
  for (const field of ['titlePrefix', 'coverTitlePrefix', 'approvedSkillId', 'approvedTemplateId', 'sourcePrompt', 'summary', 'decisionSupported']) {
    if (typeof definition[field] !== 'string' || definition[field].trim().length < 8) errors.push(`${label} needs ${field}`);
  }
  if (!agentSkillIds.has(definition.approvedSkillId)) errors.push(`${label} references unknown skill ${definition.approvedSkillId}`);
  if (!validExecutiveAssetAudiences.has(definition.audience)) errors.push(`${label} has invalid audience ${definition.audience}`);
  if (!validExecutiveAssetObjectives.has(definition.objective)) errors.push(`${label} has invalid objective ${definition.objective}`);
  if (!definition.proofSummary || typeof definition.proofSummary !== 'object') {
    errors.push(`${label} needs proofSummary`);
  } else {
    for (const field of ['evidence', 'gaps', 'gates']) {
      if (!Number.isInteger(definition.proofSummary[field]) || definition.proofSummary[field] < 0) errors.push(`${label} proofSummary needs non-negative integer ${field}`);
    }
  }
  if (!Array.isArray(definition.moduleIds) || definition.moduleIds.length === 0) errors.push(`${label} needs moduleIds`);
  for (const moduleId of definition.moduleIds || []) {
    if (!executiveAssetModuleIds.has(moduleId)) errors.push(`${label} references unknown page module ${moduleId}`);
  }
  for (const field of ['askPrompts', 'triggerTerms', 'sourceBasis']) {
    if (!Array.isArray(definition[field]) || definition[field].length < 2) {
      errors.push(`${label} needs at least two ${field}`);
      continue;
    }
    for (const [index, value] of definition[field].entries()) {
      if (typeof value !== 'string' || value.trim().length < 3) errors.push(`${label} ${field}[${index}] needs a meaningful string`);
    }
  }
  if (definition.pageOverrides && typeof definition.pageOverrides === 'object') {
    for (const moduleId of Object.keys(definition.pageOverrides)) {
      if (!executiveAssetModuleIds.has(moduleId)) errors.push(`${label} pageOverrides references unknown page module ${moduleId}`);
      if (!definition.moduleIds?.includes(moduleId)) errors.push(`${label} pageOverrides references module ${moduleId} outside moduleIds`);
    }
  }
}
if (artifactReadinessRequirements.id !== 'artifact-readiness-requirements-v1') {
  errors.push('artifact readiness registry needs id artifact-readiness-requirements-v1');
}
if (typeof artifactReadinessRequirements.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(artifactReadinessRequirements.lastReviewed)) {
  errors.push('artifact readiness registry needs YYYY-MM-DD lastReviewed');
}
if (typeof artifactReadinessRequirements.purpose !== 'string' || artifactReadinessRequirements.purpose.trim().length < 12) {
  errors.push('artifact readiness registry needs purpose');
}
if (!Array.isArray(artifactReadinessRequirements.guardrails) || artifactReadinessRequirements.guardrails.length < 2) {
  errors.push('artifact readiness registry needs guardrails');
}
if (!Array.isArray(artifactReadinessRequirements.caveats) || artifactReadinessRequirements.caveats.length < 2) {
  errors.push('artifact readiness registry needs caveats');
}
const artifactReadinessTypes = new Set();
for (const requirement of artifactReadinessRequirements.requirements || []) {
  if (!validExperienceArtifactTypes.has(requirement.artifactType)) {
    errors.push(`artifact readiness requirement has invalid artifactType ${requirement.artifactType}`);
  }
  if (artifactReadinessTypes.has(requirement.artifactType)) {
    errors.push(`duplicate artifact readiness requirement for ${requirement.artifactType}`);
  }
  artifactReadinessTypes.add(requirement.artifactType);
  for (const field of ['reviewerRole', 'promotionGate', 'exportGate', 'nextActionWhenBlocked']) {
    if (typeof requirement[field] !== 'string' || requirement[field].trim().length < 4) {
      errors.push(`artifact readiness ${requirement.artifactType} needs ${field}`);
    }
  }
  for (const field of ['requiredEvidence', 'requiredLanguageApprovals', 'requiredSourceViews', 'guardrails']) {
    if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
      errors.push(`artifact readiness ${requirement.artifactType} needs ${field}`);
    }
  }
  if (requirement.exportGate !== 'artifact_export_capability') {
    errors.push(`artifact readiness ${requirement.artifactType} exportGate must be artifact_export_capability`);
  }
}
for (const artifactType of validExperienceArtifactTypes) {
  if (!artifactReadinessTypes.has(artifactType)) {
    errors.push(`artifact readiness registry missing requirement for ${artifactType}`);
  }
}
if (persistenceReadinessRequirements.id !== 'persistence-readiness-requirements-v1') {
  errors.push('persistence readiness registry needs id persistence-readiness-requirements-v1');
}
if (typeof persistenceReadinessRequirements.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(persistenceReadinessRequirements.lastReviewed)) {
  errors.push('persistence readiness registry needs YYYY-MM-DD lastReviewed');
}
if (typeof persistenceReadinessRequirements.purpose !== 'string' || persistenceReadinessRequirements.purpose.trim().length < 12) {
  errors.push('persistence readiness registry needs purpose');
}
if (!validPersistenceReadinessModes.has(persistenceReadinessRequirements.mode)) {
  errors.push(`persistence readiness registry has invalid mode ${persistenceReadinessRequirements.mode}`);
}
if (!Array.isArray(persistenceReadinessRequirements.guardrails) || persistenceReadinessRequirements.guardrails.length < 2) {
  errors.push('persistence readiness registry needs guardrails');
}
if (!Array.isArray(persistenceReadinessRequirements.caveats) || persistenceReadinessRequirements.caveats.length < 2) {
  errors.push('persistence readiness registry needs caveats');
}
const persistenceRequirementIds = new Set();
for (const requirement of persistenceReadinessRequirements.requirements || []) {
  if (!requirement.id || !requirement.label || !requirement.owner) {
    errors.push(`persistence readiness requirement missing identity fields: ${requirement.id || 'unknown'}`);
    continue;
  }
  if (persistenceRequirementIds.has(requirement.id)) errors.push(`duplicate persistence readiness requirement ${requirement.id}`);
  persistenceRequirementIds.add(requirement.id);
  if (!validPersistenceReadinessStatuses.has(requirement.status)) {
    errors.push(`persistence readiness ${requirement.id} has invalid status ${requirement.status}`);
  }
  for (const field of ['requiredFor', 'recordTypes', 'evidenceSourceIds', 'acceptanceCriteria', 'guardrails']) {
    if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
      errors.push(`persistence readiness ${requirement.id} needs ${field}`);
    }
  }
  for (const requiredFor of requirement.requiredFor || []) {
    if (!validPersistenceRequiredFor.has(requiredFor)) {
      errors.push(`persistence readiness ${requirement.id} has invalid requiredFor ${requiredFor}`);
    }
  }
  for (const recordType of requirement.recordTypes || []) {
    if (!validPersistenceRecordTypes.has(recordType)) {
      errors.push(`persistence readiness ${requirement.id} has invalid recordType ${recordType}`);
    }
  }
  if (requirement.status === 'blocked' && (!Array.isArray(requirement.blockers) || requirement.blockers.length === 0)) {
    errors.push(`blocked persistence readiness ${requirement.id} needs blockers`);
  }
  if (typeof requirement.nextAction !== 'string' || requirement.nextAction.trim().length < 8) {
    errors.push(`persistence readiness ${requirement.id} needs nextAction`);
  }
}
for (const requiredRequirement of [
  'browser-local-ledger',
  'local-json-session-store',
  'review-actions-workflow',
  'accepted-memory-context',
  'source-candidates-non-canonical',
  'enterprise-database-schema',
  'reviewer-identity-access-control',
  'retention-privacy-policy',
  'backup-recovery-migration',
  'canonical-source-promotion-governance'
]) {
  if (!persistenceRequirementIds.has(requiredRequirement)) errors.push(`persistence readiness registry missing ${requiredRequirement}`);
}
if (agentReviewIdentityPolicy.id !== 'agent-review-identity-policy-v1') {
  errors.push('agent review identity policy needs id agent-review-identity-policy-v1');
}
if (typeof agentReviewIdentityPolicy.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(agentReviewIdentityPolicy.lastReviewed)) {
  errors.push('agent review identity policy needs YYYY-MM-DD lastReviewed');
}
if (!validReviewIdentityModes.has(agentReviewIdentityPolicy.mode)) {
  errors.push(`agent review identity policy has invalid mode ${agentReviewIdentityPolicy.mode}`);
}
if (agentReviewIdentityPolicy.prototypeReviewerLabel !== 'human_review') {
  errors.push('agent review identity policy prototypeReviewerLabel must be human_review');
}
for (const field of ['enterpriseIdentityEnabled', 'roleBasedAccessEnabled', 'brandAccessControlEnabled', 'officialApprovalEnabled']) {
  if (agentReviewIdentityPolicy[field] !== false) {
    errors.push(`agent review identity policy ${field} must remain false in prototype`);
  }
}
for (const itemType of agentReviewIdentityPolicy.reviewableItemTypes || []) {
  if (!validReviewIdentityItemTypes.has(itemType)) errors.push(`agent review identity policy has invalid reviewable item type ${itemType}`);
}
for (const decision of agentReviewIdentityPolicy.allowedPrototypeDecisions || []) {
  if (!validReviewIdentityPrototypeDecisions.has(decision)) errors.push(`agent review identity policy has invalid prototype decision ${decision}`);
}
for (const approvalType of agentReviewIdentityPolicy.blockedEnterpriseApprovalTypes || []) {
  if (!validReviewIdentityBlockedApprovals.has(approvalType)) errors.push(`agent review identity policy has invalid blocked approval ${approvalType}`);
}
for (const requiredApproval of ['official_memory_approval', 'artifact_circulation_approval', 'canonical_source_promotion']) {
  if (!agentReviewIdentityPolicy.blockedEnterpriseApprovalTypes?.includes(requiredApproval)) {
    errors.push(`agent review identity policy must block ${requiredApproval}`);
  }
}
for (const field of ['reviewableItemTypes', 'allowedPrototypeDecisions', 'blockedEnterpriseApprovalTypes', 'requiredBeforeEnterpriseApproval', 'guardrails', 'caveats']) {
  if (!Array.isArray(agentReviewIdentityPolicy[field]) || agentReviewIdentityPolicy[field].length === 0) {
    errors.push(`agent review identity policy needs ${field}`);
  }
}
const capabilityIds = new Set();
for (const capability of agentCapabilityFlags) {
  if (!capability.id || !capability.label || !capability.description) {
    errors.push(`agent capability missing identity fields: ${capability.id || 'unknown'}`);
  }
  if (capabilityIds.has(capability.id)) errors.push(`duplicate agent capability id: ${capability.id}`);
  capabilityIds.add(capability.id);
  if (!validAgentCapabilityIds.has(capability.id)) errors.push(`agent capability ${capability.id} has invalid id`);
  if (typeof capability.enabled !== 'boolean') errors.push(`agent capability ${capability.id} needs boolean enabled`);
  if (!validHumanApprovalRequirements.has(capability.requiredHumanApproval)) {
    errors.push(`agent capability ${capability.id} has invalid requiredHumanApproval ${capability.requiredHumanApproval}`);
  }
  if (!validCapabilityRiskLevels.has(capability.riskLevel)) errors.push(`agent capability ${capability.id} has invalid riskLevel ${capability.riskLevel}`);
  if (capability.enabled === false && !capability.blockedReason) errors.push(`disabled agent capability ${capability.id} needs blockedReason`);
  if (!Array.isArray(capability.allowedActions)) errors.push(`agent capability ${capability.id} needs allowedActions array`);
  for (const action of capability.allowedActions || []) {
    if (!validConfirmationActions.has(action)) errors.push(`agent capability ${capability.id} uses invalid confirmation action ${action}`);
  }
  if (!Array.isArray(capability.guardrails) || capability.guardrails.length === 0) errors.push(`agent capability ${capability.id} needs guardrails`);
}
for (const requiredCapability of validAgentCapabilityIds) {
  if (!capabilityIds.has(requiredCapability)) errors.push(`agent capability registry missing required capability ${requiredCapability}`);
}
if (agentRuntimePolicy.id !== 'agent-runtime-policy-v1') errors.push('agent runtime policy needs id agent-runtime-policy-v1');
if (typeof agentRuntimePolicy.runtimeEnabled !== 'boolean') errors.push('agent runtime policy needs boolean runtimeEnabled');
if (typeof agentRuntimePolicy.killSwitchActive !== 'boolean') errors.push('agent runtime policy needs boolean killSwitchActive');
if (!validRuntimeModes.has(agentRuntimePolicy.mode)) errors.push(`agent runtime policy has invalid mode ${agentRuntimePolicy.mode}`);
if (agentRuntimePolicy.killSwitchActive && agentRuntimePolicy.mode === 'normal') errors.push('agent runtime policy cannot be normal when killSwitchActive is true');
if (!Array.isArray(agentRuntimePolicy.adminOverrideRequiredFor) || agentRuntimePolicy.adminOverrideRequiredFor.length === 0) {
  errors.push('agent runtime policy needs adminOverrideRequiredFor');
}
for (const capabilityId of agentRuntimePolicy.adminOverrideRequiredFor || []) {
  if (!validAgentCapabilityIds.has(capabilityId)) errors.push(`agent runtime policy adminOverrideRequiredFor has invalid capability ${capabilityId}`);
}
if (!Array.isArray(agentRuntimePolicy.emergencyStopScope) || agentRuntimePolicy.emergencyStopScope.length < 3) {
  errors.push('agent runtime policy needs emergencyStopScope');
}
for (const scope of agentRuntimePolicy.emergencyStopScope || []) {
  if (!validRuntimeControlScopes.has(scope)) errors.push(`agent runtime policy emergencyStopScope has invalid scope ${scope}`);
}
if (agentRuntimePolicy.degradedModeFallback !== 'read_only_packet_inspection') {
  errors.push('agent runtime policy degradedModeFallback must be read_only_packet_inspection');
}
if (typeof agentRuntimePolicy.owner !== 'string' || agentRuntimePolicy.owner.trim().length < 4) errors.push('agent runtime policy needs owner');
if (typeof agentRuntimePolicy.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(agentRuntimePolicy.lastReviewed)) errors.push('agent runtime policy needs YYYY-MM-DD lastReviewed');
if (!Array.isArray(agentRuntimePolicy.caveats) || agentRuntimePolicy.caveats.length < 2) errors.push('agent runtime policy needs caveats');
if (!Array.isArray(agentRuntimePolicy.guardrails) || agentRuntimePolicy.guardrails.length < 2) errors.push('agent runtime policy needs guardrails');
if (agentVoicePolicy.id !== 'agent-voice-policy-v1') errors.push('agent voice policy needs id agent-voice-policy-v1');
if (!validVoiceModes.has(agentVoicePolicy.defaultMode)) errors.push(`agent voice policy has invalid defaultMode ${agentVoicePolicy.defaultMode}`);
if (!Array.isArray(agentVoicePolicy.enabledModes) || agentVoicePolicy.enabledModes.length === 0) errors.push('agent voice policy needs enabledModes');
for (const mode of agentVoicePolicy.enabledModes || []) {
  if (!validVoiceModes.has(mode)) errors.push(`agent voice policy enabledModes has invalid mode ${mode}`);
}
if (!Array.isArray(agentVoicePolicy.disabledModes)) errors.push('agent voice policy needs disabledModes');
for (const mode of agentVoicePolicy.disabledModes || []) {
  if (!validVoiceModes.has(mode)) errors.push(`agent voice policy disabledModes has invalid mode ${mode}`);
}
if (!agentVoicePolicy.enabledModes?.includes(agentVoicePolicy.defaultMode)) errors.push('agent voice policy defaultMode must be enabled');
if (!agentVoicePolicy.disabledModes?.includes('continuous')) errors.push('agent voice policy must keep continuous mode disabled for now');
if (agentVoicePolicy.consentRequired !== true) errors.push('agent voice policy must require consent');
if (!validInterruptHandling.has(agentVoicePolicy.interruptHandling)) errors.push(`agent voice policy has invalid interruptHandling ${agentVoicePolicy.interruptHandling}`);
if (agentVoicePolicy.runtimeEventSource !== '/api/agent/stream') errors.push('agent voice policy runtimeEventSource must be /api/agent/stream');
if (!Array.isArray(agentVoicePolicy.caveats) || agentVoicePolicy.caveats.length < 2) errors.push('agent voice policy needs caveats');
if (!Array.isArray(agentVoicePolicy.guardrails) || agentVoicePolicy.guardrails.length < 2) errors.push('agent voice policy needs guardrails');
if (voiceSkillViewContract.id !== 'voice-skill-view-contract-v1') errors.push('voice skill/view contract needs id voice-skill-view-contract-v1');
if (typeof voiceSkillViewContract.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(voiceSkillViewContract.lastReviewed)) {
  errors.push('voice skill/view contract needs YYYY-MM-DD lastReviewed');
}
if (!validVoiceSkillViewContractModes.has(voiceSkillViewContract.mode)) {
  errors.push(`voice skill/view contract has invalid mode ${voiceSkillViewContract.mode}`);
}
if (typeof voiceSkillViewContract.purpose !== 'string' || voiceSkillViewContract.purpose.trim().length < 12) {
  errors.push('voice skill/view contract needs purpose');
}
if (!Array.isArray(voiceSkillViewContract.guardrails) || voiceSkillViewContract.guardrails.length < 2) {
  errors.push('voice skill/view contract needs guardrails');
}
if (!Array.isArray(voiceSkillViewContract.caveats) || voiceSkillViewContract.caveats.length < 2) {
  errors.push('voice skill/view contract needs caveats');
}
const agentSkillIdsForVoice = new Set(agentSkillRegistry.map((skill) => skill.id));
const dynamicViewByIdForVoice = new Map(dynamicViewRegistry.map((view) => [view.id, view]));
const voiceContractModeIds = new Set();
for (const mode of voiceSkillViewContract.voiceModes || []) {
  if (!mode.id || !mode.label) errors.push(`voice skill/view mode missing identity fields: ${mode.id || 'unknown'}`);
  if (voiceContractModeIds.has(mode.id)) errors.push(`duplicate voice skill/view mode ${mode.id}`);
  voiceContractModeIds.add(mode.id);
  if (!validVoiceOrchestrationRequiredFor.has(mode.id)) errors.push(`voice skill/view mode has invalid id ${mode.id}`);
  if (!validVoiceSkillViewContractStatuses.has(mode.status)) errors.push(`voice skill/view mode ${mode.id} has invalid status ${mode.status}`);
  for (const field of ['allowedSkillIds', 'requiredViewIds', 'requiredReadinessIds', 'guardrails']) {
    if (!Array.isArray(mode[field]) || mode[field].length === 0) errors.push(`voice skill/view mode ${mode.id} needs ${field}`);
  }
  for (const skillId of mode.allowedSkillIds || []) {
    if (!agentSkillIdsForVoice.has(skillId)) errors.push(`voice skill/view mode ${mode.id} references unknown skill ${skillId}`);
  }
  for (const viewId of [...(mode.requiredViewIds || []), ...(mode.optionalViewIds || [])]) {
    const view = dynamicViewByIdForVoice.get(viewId);
    if (!view) errors.push(`voice skill/view mode ${mode.id} references unknown view ${viewId}`);
    else if (!view.supportedModes?.includes('voice_canvas')) errors.push(`voice skill/view mode ${mode.id} references non-voice-canvas view ${viewId}`);
  }
  for (const readinessId of mode.requiredReadinessIds || []) {
    if (!voiceOrchestrationReadinessRequirements.requirements?.some((requirement) => requirement.id === readinessId)) {
      errors.push(`voice skill/view mode ${mode.id} references unknown readiness requirement ${readinessId}`);
    }
  }
  for (const blockedId of mode.blockedUntil || []) {
    if (!mode.requiredReadinessIds?.includes(blockedId)) errors.push(`voice skill/view mode ${mode.id} blockedUntil ${blockedId} must be required`);
  }
}
for (const requiredMode of ['push_to_talk', 'wake_listen', 'continuous_voice', 'realtime_voice', 'text_to_speech']) {
  if (!voiceContractModeIds.has(requiredMode)) errors.push(`voice skill/view contract missing ${requiredMode}`);
}
if ((voiceSkillViewContract.voiceModes || []).find((mode) => mode.id === 'continuous_voice')?.status !== 'blocked') {
  errors.push('voice skill/view contract must keep continuous_voice blocked');
}
if ((voiceSkillViewContract.voiceModes || []).find((mode) => mode.id === 'realtime_voice')?.status !== 'blocked') {
  errors.push('voice skill/view contract must keep realtime_voice blocked');
}
if ((voiceSkillViewContract.voiceModes || []).find((mode) => mode.id === 'text_to_speech')?.status !== 'blocked') {
  errors.push('voice skill/view contract must keep text_to_speech blocked');
}
for (const phase of voiceSkillViewContract.statePhases || []) {
  if (!phase.id || !phase.label || typeof phase.visibleToUser !== 'boolean' || typeof phase.guardrail !== 'string') {
    errors.push(`voice skill/view phase missing required fields: ${phase.id || 'unknown'}`);
    continue;
  }
  if (!Array.isArray(phase.allowedModes) || phase.allowedModes.length === 0) errors.push(`voice skill/view phase ${phase.id} needs allowedModes`);
  for (const modeId of phase.allowedModes || []) {
    if (!voiceContractModeIds.has(modeId)) errors.push(`voice skill/view phase ${phase.id} references unknown mode ${modeId}`);
  }
}
if (voiceOrchestrationReadinessRequirements.id !== 'voice-orchestration-readiness-requirements-v1') {
  errors.push('voice orchestration readiness registry needs id voice-orchestration-readiness-requirements-v1');
}
if (typeof voiceOrchestrationReadinessRequirements.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(voiceOrchestrationReadinessRequirements.lastReviewed)) {
  errors.push('voice orchestration readiness registry needs YYYY-MM-DD lastReviewed');
}
if (typeof voiceOrchestrationReadinessRequirements.purpose !== 'string' || voiceOrchestrationReadinessRequirements.purpose.trim().length < 12) {
  errors.push('voice orchestration readiness registry needs purpose');
}
if (!validVoiceOrchestrationModes.has(voiceOrchestrationReadinessRequirements.mode)) {
  errors.push(`voice orchestration readiness registry has invalid mode ${voiceOrchestrationReadinessRequirements.mode}`);
}
if (!Array.isArray(voiceOrchestrationReadinessRequirements.guardrails) || voiceOrchestrationReadinessRequirements.guardrails.length < 2) {
  errors.push('voice orchestration readiness registry needs guardrails');
}
if (!Array.isArray(voiceOrchestrationReadinessRequirements.caveats) || voiceOrchestrationReadinessRequirements.caveats.length < 2) {
  errors.push('voice orchestration readiness registry needs caveats');
}
const voiceReadinessRequirementIds = new Set();
for (const requirement of voiceOrchestrationReadinessRequirements.requirements || []) {
  if (!requirement.id || !requirement.label || !requirement.owner) {
    errors.push(`voice orchestration readiness requirement missing identity fields: ${requirement.id || 'unknown'}`);
    continue;
  }
  if (voiceReadinessRequirementIds.has(requirement.id)) errors.push(`duplicate voice orchestration readiness requirement ${requirement.id}`);
  voiceReadinessRequirementIds.add(requirement.id);
  if (!validVoiceOrchestrationStatuses.has(requirement.status)) {
    errors.push(`voice orchestration readiness ${requirement.id} has invalid status ${requirement.status}`);
  }
  for (const field of ['requiredFor', 'acceptanceCriteria', 'evidenceSourceIds', 'guardrails']) {
    if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
      errors.push(`voice orchestration readiness ${requirement.id} needs ${field}`);
    }
  }
  for (const requiredFor of requirement.requiredFor || []) {
    if (!validVoiceOrchestrationRequiredFor.has(requiredFor)) {
      errors.push(`voice orchestration readiness ${requirement.id} has invalid requiredFor ${requiredFor}`);
    }
  }
  if (requirement.status === 'blocked' && (!Array.isArray(requirement.blockers) || requirement.blockers.length === 0)) {
    errors.push(`blocked voice orchestration readiness ${requirement.id} needs blockers`);
  }
  if (typeof requirement.nextAction !== 'string' || requirement.nextAction.trim().length < 8) {
    errors.push(`voice orchestration readiness ${requirement.id} needs nextAction`);
  }
}
for (const requiredRequirement of [
  'same-runtime-evidence-gates',
  'streaming-status-and-canvas-parity',
  'push-to-talk-consent-boundary',
  'realtime-runtime-unification',
  'interruption-and-server-cancel',
  'continuous-consent-privacy-review',
  'tts-provider-and-speaking-policy'
]) {
  if (!voiceReadinessRequirementIds.has(requiredRequirement)) errors.push(`voice orchestration readiness registry missing ${requiredRequirement}`);
}
if (governedRuntimeSurfaceRegistry.id !== 'governed-runtime-surface-registry-v1') {
  errors.push('governed runtime surface registry needs id governed-runtime-surface-registry-v1');
}
if (typeof governedRuntimeSurfaceRegistry.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(governedRuntimeSurfaceRegistry.lastReviewed)) {
  errors.push('governed runtime surface registry needs YYYY-MM-DD lastReviewed');
}
if (typeof governedRuntimeSurfaceRegistry.principle !== 'string' || governedRuntimeSurfaceRegistry.principle.trim().length < 8) {
  errors.push('governed runtime surface registry needs principle');
}
if (!Array.isArray(governedRuntimeSurfaceRegistry.guardrails) || governedRuntimeSurfaceRegistry.guardrails.length < 3) {
  errors.push('governed runtime surface registry needs guardrails');
}
if (!Array.isArray(governedRuntimeSurfaceRegistry.caveats) || governedRuntimeSurfaceRegistry.caveats.length < 2) {
  errors.push('governed runtime surface registry needs caveats');
}
const runtimeSurfaceIds = new Set();
for (const surface of governedRuntimeSurfaceRegistry.surfaces || []) {
  if (!surface.id || !surface.name || !surface.route || !surface.runtimePath) {
    errors.push(`runtime surface missing required identity fields: ${surface.id || 'unknown'}`);
    continue;
  }
  if (runtimeSurfaceIds.has(surface.id)) errors.push(`duplicate runtime surface id: ${surface.id}`);
  runtimeSurfaceIds.add(surface.id);
  if (!validRuntimeSurfaceTypes.has(surface.surfaceType)) errors.push(`runtime surface ${surface.id} has invalid surfaceType ${surface.surfaceType}`);
  if (!validRuntimeSurfaceDefaultStates.has(surface.defaultState)) errors.push(`runtime surface ${surface.id} has invalid defaultState ${surface.defaultState}`);
  if (!validRuntimeSurfaceStatuses.has(surface.status)) errors.push(`runtime surface ${surface.id} has invalid status ${surface.status}`);
  if (!validRuntimeSurfaceVoiceStates.has(surface.voice)) errors.push(`runtime surface ${surface.id} has invalid voice ${surface.voice}`);
  if (!validRuntimeSurfacePersistence.has(surface.persistence)) errors.push(`runtime surface ${surface.id} has invalid persistence ${surface.persistence}`);
  if (typeof surface.streaming !== 'boolean') errors.push(`runtime surface ${surface.id} needs boolean streaming`);
  for (const field of ['sessionStrategy', 'proofSurface', 'owner', 'nextStep']) {
    if (typeof surface[field] !== 'string' || surface[field].trim().length < 3) errors.push(`runtime surface ${surface.id} needs ${field}`);
  }
  for (const field of ['connectedRuntimeRails', 'gates', 'guardrails']) {
    if (!Array.isArray(surface[field]) || surface[field].length === 0) errors.push(`runtime surface ${surface.id} needs ${field}`);
  }
  if ((surface.status === 'ready' || surface.status === 'ready_opt_in') && surface.runtimePath === 'runAgentTurn') {
    if (!surface.connectedRuntimeRails.includes('audit')) errors.push(`runtime surface ${surface.id} needs audit rail`);
    if (!surface.connectedRuntimeRails.some((rail) => rail.includes('quality') || rail === 'proof_rail')) {
      errors.push(`runtime surface ${surface.id} needs quality/proof rail`);
    }
    if (surface.proofSurface === 'gated_policy_manifest') errors.push(`runtime surface ${surface.id} cannot be ready with only gated proof`);
  }
  if (surface.defaultState === 'governed_default' && surface.status !== 'ready') {
    errors.push(`runtime surface ${surface.id} governed defaults must be ready`);
  }
  if (surface.defaultState === 'scoped_legacy_default' && surface.runtimePath === 'runAgentTurn') {
    errors.push(`runtime surface ${surface.id} scoped legacy default must not use runAgentTurn`);
  }
  if (surface.voice === 'realtime_candidate' && surface.status !== 'gated') {
    errors.push(`runtime surface ${surface.id} realtime candidate must remain gated`);
  }
  if (surface.voice === 'tts_disabled' && surface.status !== 'disabled') {
    errors.push(`runtime surface ${surface.id} TTS surface must remain disabled`);
  }
  if ((surface.voice === 'realtime_candidate' || surface.voice === 'tts_disabled') && !surface.gates.some((gate) => gate.includes('policy') || gate.includes('review'))) {
    errors.push(`runtime surface ${surface.id} voice/provider gated surfaces need policy or review gates`);
  }
  if (surface.voice === 'push_to_talk_browser_stt' && !surface.guardrails.some((guardrail) => guardrail.toLowerCase().includes('continuous'))) {
    errors.push(`runtime surface ${surface.id} browser voice surfaces must mention continuous voice guardrail`);
  }
}
for (const requiredSurface of [
  'api-agent-json',
  'api-agent-stream',
  'agent-lab-command-center',
  'api-chat-scoped-default',
  'api-chat-explicit-skill-router',
  'report-dialog-governed',
  'brand-conversation-governed',
  'live-consult-governed-fallback',
  'live-consult-realtime-candidate',
  'tts-provider-disabled'
]) {
  if (!runtimeSurfaceIds.has(requiredSurface)) errors.push(`governed runtime surface registry missing required surface ${requiredSurface}`);
}
if (brandStrategicContextHandoffRequirements.id !== 'brand-strategic-context-handoff-requirements-v1') {
  errors.push('brand strategic context handoff registry needs id brand-strategic-context-handoff-requirements-v1');
}
if (typeof brandStrategicContextHandoffRequirements.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(brandStrategicContextHandoffRequirements.lastReviewed)) {
  errors.push('brand strategic context handoff registry needs YYYY-MM-DD lastReviewed');
}
if (typeof brandStrategicContextHandoffRequirements.purpose !== 'string' || brandStrategicContextHandoffRequirements.purpose.trim().length < 12) {
  errors.push('brand strategic context handoff registry needs purpose');
}
if (!Array.isArray(brandStrategicContextHandoffRequirements.guardrails) || brandStrategicContextHandoffRequirements.guardrails.length < 2) {
  errors.push('brand strategic context handoff registry needs guardrails');
}
if (!Array.isArray(brandStrategicContextHandoffRequirements.caveats) || brandStrategicContextHandoffRequirements.caveats.length < 2) {
  errors.push('brand strategic context handoff registry needs caveats');
}
const strategicContextHandoffIds = new Set();
const strategicContextHandoffCheckIds = new Set();
for (const requirement of brandStrategicContextHandoffRequirements.requirements || []) {
  if (!requirement.id || !requirement.checkId || !requirement.label) {
    errors.push(`brand strategic context handoff requirement missing identity fields: ${requirement.id || 'unknown'}`);
    continue;
  }
  if (strategicContextHandoffIds.has(requirement.id)) errors.push(`duplicate brand strategic context handoff requirement id: ${requirement.id}`);
  strategicContextHandoffIds.add(requirement.id);
  if (strategicContextHandoffCheckIds.has(requirement.checkId)) errors.push(`duplicate brand strategic context handoff checkId: ${requirement.checkId}`);
  strategicContextHandoffCheckIds.add(requirement.checkId);
  if (!validBrandStrategicContextReadinessCheckIds.has(requirement.checkId)) {
    errors.push(`brand strategic context handoff requirement ${requirement.id} has invalid checkId ${requirement.checkId}`);
  }
  if (!validBrandStrategicContextPromotionGates.has(requirement.promotionGate)) {
    errors.push(`brand strategic context handoff requirement ${requirement.id} has invalid promotionGate ${requirement.promotionGate}`);
  }
  if (!Array.isArray(requirement.acceptedSourceTypes) || requirement.acceptedSourceTypes.length === 0) {
    errors.push(`brand strategic context handoff requirement ${requirement.id} needs acceptedSourceTypes`);
  } else {
    for (const sourceType of requirement.acceptedSourceTypes) {
      if (!validBrandStrategicContextSourceTypes.has(sourceType) || sourceType === 'prototype_seed') {
        errors.push(`brand strategic context handoff requirement ${requirement.id} has invalid acceptedSourceType ${sourceType}`);
      }
    }
  }
  for (const field of ['sourceOwnerRole', 'canonicalUseCondition', 'starterQuestion']) {
    if (typeof requirement[field] !== 'string' || requirement[field].trim().length < 8) {
      errors.push(`brand strategic context handoff requirement ${requirement.id} needs ${field}`);
    }
  }
  for (const field of ['requiredFields', 'validationRules', 'guardrails']) {
    if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
      errors.push(`brand strategic context handoff requirement ${requirement.id} needs ${field}`);
    }
  }
}
for (const requiredCheckId of validBrandStrategicContextReadinessCheckIds) {
  if (!strategicContextHandoffCheckIds.has(requiredCheckId)) {
    errors.push(`brand strategic context handoff registry missing requirement for readiness check ${requiredCheckId}`);
  }
}
if (momentumSourceHandoffRequirements.id !== 'momentum-source-handoff-requirements-v1') {
  errors.push('momentum source handoff registry needs id momentum-source-handoff-requirements-v1');
}
validateBrandStrategicContextRuntimeFileDropPolicy(brandStrategicContextRuntimeFileDropPolicy);
validateMomentumSourceRuntimeFileDropPolicy(momentumSourceRuntimeFileDropPolicy);
validateTreatmentOutcomeReadinessPolicy(treatmentOutcomeReadinessRequirements);
if (typeof momentumSourceHandoffRequirements.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(momentumSourceHandoffRequirements.lastReviewed)) {
  errors.push('momentum source handoff registry needs YYYY-MM-DD lastReviewed');
}
if (typeof momentumSourceHandoffRequirements.purpose !== 'string' || momentumSourceHandoffRequirements.purpose.trim().length < 12) {
  errors.push('momentum source handoff registry needs purpose');
}
if (!Array.isArray(momentumSourceHandoffRequirements.guardrails) || momentumSourceHandoffRequirements.guardrails.length < 2) {
  errors.push('momentum source handoff registry needs guardrails');
}
if (!Array.isArray(momentumSourceHandoffRequirements.caveats) || momentumSourceHandoffRequirements.caveats.length < 2) {
  errors.push('momentum source handoff registry needs caveats');
}
const handoffIds = new Set();
const handoffCheckIds = new Set();
for (const requirement of momentumSourceHandoffRequirements.requirements || []) {
  if (!requirement.id || !requirement.checkId || !requirement.label) {
    errors.push(`momentum source handoff requirement missing identity fields: ${requirement.id || 'unknown'}`);
    continue;
  }
  if (handoffIds.has(requirement.id)) errors.push(`duplicate momentum source handoff requirement id: ${requirement.id}`);
  handoffIds.add(requirement.id);
  if (handoffCheckIds.has(requirement.checkId)) errors.push(`duplicate momentum source handoff checkId: ${requirement.checkId}`);
  handoffCheckIds.add(requirement.checkId);
  if (!validMomentumSourceReadinessCheckIds.has(requirement.checkId)) {
    errors.push(`momentum source handoff requirement ${requirement.id} has invalid checkId ${requirement.checkId}`);
  }
  if (!validMomentumSourcePromotionGates.has(requirement.promotionGate)) {
    errors.push(`momentum source handoff requirement ${requirement.id} has invalid promotionGate ${requirement.promotionGate}`);
  }
  for (const field of ['sourceOwnerRole', 'acceptedExtractShape', 'canonicalUseCondition', 'starterQuestion']) {
    if (typeof requirement[field] !== 'string' || requirement[field].trim().length < 8) {
      errors.push(`momentum source handoff requirement ${requirement.id} needs ${field}`);
    }
  }
  for (const field of ['requiredFields', 'validationRules', 'guardrails']) {
    if (!Array.isArray(requirement[field]) || requirement[field].length === 0) {
      errors.push(`momentum source handoff requirement ${requirement.id} needs ${field}`);
    }
  }
}
for (const requiredCheckId of validMomentumSourceReadinessCheckIds) {
  if (!handoffCheckIds.has(requiredCheckId)) {
    errors.push(`momentum source handoff registry missing requirement for readiness check ${requiredCheckId}`);
  }
}
const brandStrategicContextBrandIds = new Set();
for (const packet of brandStrategicContextPackets) {
  if (!recordIds.has(packet.brandId)) errors.push(`brand strategic context packet references unknown brand: ${packet.brandId}`);
  if (brandStrategicContextBrandIds.has(packet.brandId)) errors.push(`duplicate brand strategic context packet for brand: ${packet.brandId}`);
  brandStrategicContextBrandIds.add(packet.brandId);
  if (!validBrandStrategicContextSourceTypes.has(packet.sourceType)) errors.push(`brand strategic context packet ${packet.brandId} has invalid sourceType ${packet.sourceType}`);
  if (!validBrandStrategicContextReviewStatuses.has(packet.reviewStatus)) errors.push(`brand strategic context packet ${packet.brandId} has invalid reviewStatus ${packet.reviewStatus}`);
  for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
    if (typeof packet[field] !== 'string' || packet[field].trim().length < 4) errors.push(`brand strategic context packet ${packet.brandId} needs ${field}`);
  }
  for (const field of ['brandDna', 'objectives', 'planningPriorities', 'approvedClaims', 'claimsNotToMake', 'caveats']) {
    if (!Array.isArray(packet[field])) errors.push(`brand strategic context packet ${packet.brandId} needs ${field} array`);
  }
  if (packet.reviewStatus === 'approved_source') {
    if (!packet.brandStatement) errors.push(`approved brand strategic context packet ${packet.brandId} needs brandStatement`);
    if (!packet.positioning) errors.push(`approved brand strategic context packet ${packet.brandId} needs positioning`);
    if (!packet.objectives?.length) errors.push(`approved brand strategic context packet ${packet.brandId} needs objectives`);
  }
  if (packet.reviewStatus !== 'approved_source' && !packet.caveats?.some(caveat => caveat.toLowerCase().includes('not an official'))) {
    errors.push(`non-approved brand strategic context packet ${packet.brandId} must caveat that it is not official`);
  }
}
const momentumSourceBrandIds = new Set();
for (const packet of momentumIntelligenceSourcePackets) {
  if (!recordIds.has(packet.brandId)) errors.push(`momentum intelligence source packet references unknown brand: ${packet.brandId}`);
  if (momentumSourceBrandIds.has(packet.brandId)) errors.push(`duplicate momentum intelligence source packet for brand: ${packet.brandId}`);
  momentumSourceBrandIds.add(packet.brandId);
  for (const field of ['sourceLabel', 'sourceOwner', 'sourceDate']) {
    if (typeof packet[field] !== 'string' || packet[field].trim().length < 4) errors.push(`momentum intelligence source packet ${packet.brandId} needs ${field}`);
  }
  if (!validMomentumSourceEvidenceModes.has(packet.evidenceMode)) errors.push(`momentum intelligence source packet ${packet.brandId} has invalid evidenceMode ${packet.evidenceMode}`);
  if (!Array.isArray(packet.caveats) || packet.caveats.length === 0) errors.push(`momentum intelligence source packet ${packet.brandId} needs caveats`);
  if (packet.evidenceMode !== 'measured_partial_extract' && !packet.caveats?.some(caveat => caveat.toLowerCase().includes('prototype') || caveat.toLowerCase().includes('directional'))) {
    errors.push(`non-measured momentum intelligence source packet ${packet.brandId} must caveat prototype or directional status`);
  }
  if (!packet.marketContext) {
    errors.push(`momentum intelligence source packet ${packet.brandId} needs marketContext`);
  } else {
    for (const field of ['market', 'category', 'geography', 'period']) {
      if (typeof packet.marketContext[field] !== 'string' || packet.marketContext[field].trim().length < 2) {
        errors.push(`momentum intelligence source packet ${packet.brandId} marketContext needs ${field}`);
      }
    }
    if (packet.marketContext.categoryGrowth !== null && !Number.isFinite(packet.marketContext.categoryGrowth)) {
      errors.push(`momentum intelligence source packet ${packet.brandId} has invalid marketContext.categoryGrowth`);
    }
    if (!validMomentumCategoryGrowthUnits.has(packet.marketContext.categoryGrowthUnit)) {
      errors.push(`momentum intelligence source packet ${packet.brandId} has invalid categoryGrowthUnit ${packet.marketContext.categoryGrowthUnit}`);
    }
    if (!validMomentumMarketMaturity.has(packet.marketContext.maturity)) {
      errors.push(`momentum intelligence source packet ${packet.brandId} has invalid maturity ${packet.marketContext.maturity}`);
    }
  }
  if (!packet.peerSet) {
    errors.push(`momentum intelligence source packet ${packet.brandId} needs peerSet`);
  } else {
    for (const field of ['peerSetId', 'label', 'selectionBasis']) {
      if (typeof packet.peerSet[field] !== 'string' || packet.peerSet[field].trim().length < 4) {
        errors.push(`momentum intelligence source packet ${packet.brandId} peerSet needs ${field}`);
      }
    }
    if (!Number.isFinite(packet.peerSet.peerCount) || packet.peerSet.peerCount < 1) {
      errors.push(`momentum intelligence source packet ${packet.brandId} needs positive peerCount`);
    }
    if (!Array.isArray(packet.peerSet.brandIds) || packet.peerSet.brandIds.length !== packet.peerSet.peerCount) {
      errors.push(`momentum intelligence source packet ${packet.brandId} peerSet brandIds must match peerCount`);
    }
    for (const peerBrandId of packet.peerSet.brandIds || []) {
      if (!recordIds.has(peerBrandId)) errors.push(`momentum intelligence source packet ${packet.brandId} references unknown peer brand ${peerBrandId}`);
      if (peerBrandId === packet.brandId) errors.push(`momentum intelligence source packet ${packet.brandId} should not include itself in peerSet.brandIds`);
    }
    if (!Array.isArray(packet.peerSet.caveats) || packet.peerSet.caveats.length === 0) {
      errors.push(`momentum intelligence source packet ${packet.brandId} peerSet needs caveats`);
    }
  }
  const roomInputs = packet.roomToGrowInputs || {};
  for (const field of ['penetrationHeadroom', 'demandPowerShareVsMarketShareGap', 'categoryGrowth']) {
    const value = roomInputs[field];
    if (value !== null && !Number.isFinite(value)) errors.push(`momentum intelligence source packet ${packet.brandId} has invalid roomToGrowInputs.${field}`);
  }
  const hasAllRoomInputs = ['penetrationHeadroom', 'demandPowerShareVsMarketShareGap', 'categoryGrowth'].every(field => Number.isFinite(roomInputs[field]));
  if (!hasAllRoomInputs) errors.push(`momentum intelligence source packet ${packet.brandId} needs all room-to-grow inputs for this demo slice`);
  if (!packet.smdContributionWeights) {
    errors.push(`momentum intelligence source packet ${packet.brandId} needs smdContributionWeights`);
  } else {
    const weights = ['salient', 'meaningful', 'different'].map(field => packet.smdContributionWeights[field]);
    if (!weights.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
      errors.push(`momentum intelligence source packet ${packet.brandId} has invalid SMD contribution weights`);
    }
    const total = weights.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > 0.001) errors.push(`momentum intelligence source packet ${packet.brandId} SMD weights must sum to 1`);
    if (typeof packet.smdContributionWeights.sourceLabel !== 'string' || packet.smdContributionWeights.sourceLabel.length < 4) {
      errors.push(`momentum intelligence source packet ${packet.brandId} smdContributionWeights needs sourceLabel`);
    }
    if (!Array.isArray(packet.smdContributionWeights.caveats) || packet.smdContributionWeights.caveats.length === 0) {
      errors.push(`momentum intelligence source packet ${packet.brandId} smdContributionWeights needs caveats`);
    }
  }
  if (packet.trendEvidence) {
    validateMomentumTrendEvidence(packet.trendEvidence, `momentum intelligence source packet ${packet.brandId}`, { requireCaveats: true });
  }
}
const momentumSourceExtractKeys = new Set();
for (const extract of momentumSourceExtracts) {
  validateMomentumSourceExtractShape(extract, `momentum source extract ${extract?.brandId ?? 'unknown'}`);
  const extractKey = `${extract.brandId}:${extract.extractKind ?? 'combined_momentum_source'}`;
  if (momentumSourceExtractKeys.has(extractKey)) errors.push(`duplicate momentum source extract block: ${extractKey}`);
  momentumSourceExtractKeys.add(extractKey);
  if (momentumSourceBrandIds.has(extract.brandId)) {
    errors.push(`brand ${extract.brandId} has both a source extract and static momentum intelligence packet; choose one default source path`);
  }
}
const growthPillarIds = new Set();
for (const pillar of growthAvailabilityPillars) {
  if (!pillar.id || !pillar.title || !pillar.shortTitle || !pillar.question || !pillar.definition) {
    errors.push(`growth availability pillar missing required identity fields: ${pillar.id || 'unknown'}`);
  }
  if (growthPillarIds.has(pillar.id)) errors.push(`duplicate growth availability pillar id: ${pillar.id}`);
  growthPillarIds.add(pillar.id);
  if (!Array.isArray(pillar.coreEvidence) || pillar.coreEvidence.length < 2) errors.push(`growth availability pillar ${pillar.id} needs coreEvidence`);
  if (!Array.isArray(pillar.missingEvidenceToImprove) || pillar.missingEvidenceToImprove.length < 2) errors.push(`growth availability pillar ${pillar.id} needs missingEvidenceToImprove`);
  if (!pillar.guardrail) errors.push(`growth availability pillar ${pillar.id} needs guardrail`);
}
for (const packet of growthAvailabilityDemoPackets) {
  if (!recordIds.has(packet.brandId)) errors.push(`growth availability demo packet references unknown brand: ${packet.brandId}`);
  if (packet.evidenceMode !== 'simulated_prototype') errors.push(`growth availability demo packet ${packet.brandId} must be simulated_prototype`);
  if (!packet.sourceLabel?.toLowerCase().includes('simulated')) errors.push(`growth availability demo packet ${packet.brandId} must label simulated evidence`);
  if (!packet.growthConstraint?.label || !packet.growthConstraint?.read || !packet.growthConstraint?.nextQuestion) {
    errors.push(`growth availability demo packet ${packet.brandId} needs growthConstraint label/read/nextQuestion`);
  }
  for (const [pillarId, read] of Object.entries(packet.pillars || {})) {
    if (!growthPillarIds.has(pillarId)) errors.push(`growth availability demo packet ${packet.brandId} references unknown pillar ${pillarId}`);
    if (!validGrowthPillarStatuses.has(read.status)) errors.push(`growth availability demo packet ${packet.brandId}/${pillarId} uses invalid status ${read.status}`);
    if (!read.read || !Array.isArray(read.evidence) || !Array.isArray(read.missingInputs) || !read.caveat) {
      errors.push(`growth availability demo packet ${packet.brandId}/${pillarId} needs read, evidence, missingInputs, and caveat`);
    }
  }
}
for (const packet of simulatedDemographicEquityRecords) {
  const packetLabel = `simulated demographic packet ${packet?.brandId ?? 'unknown'}`;
  if (!recordIds.has(packet.brandId)) errors.push(`${packetLabel} references unknown brand`);
  if (!validDemographicDimensions.has(packet.demographicDimension)) errors.push(`${packetLabel} has invalid demographicDimension ${packet.demographicDimension}`);
  if (!validDemographicSourceTypes.has(packet.sourceType)) errors.push(`${packetLabel} has invalid sourceType ${packet.sourceType}`);
  if (!validDemographicApprovalStatuses.has(packet.approvalStatus)) errors.push(`${packetLabel} has invalid approvalStatus ${packet.approvalStatus}`);
  if (!validDemographicEvidenceModes.has(packet.evidenceMode)) errors.push(`${packetLabel} has invalid evidenceMode ${packet.evidenceMode}`);
  if (!packet.sourceLabel?.toLowerCase().includes('prototype')) errors.push(`${packetLabel} must label prototype source status`);
  if (!packet.replacementRequirement?.toLowerCase().includes('official bbe')) errors.push(`${packetLabel} needs official BBE replacement requirement`);
  if (!packet.caveat?.toLowerCase().includes('not measured')) errors.push(`${packetLabel} caveat must state not measured`);
  if (!Array.isArray(packet.segments) || packet.segments.length < 5) errors.push(`${packetLabel} needs at least five segments`);
  const segmentIds = new Set();
  for (const segment of packet.segments || []) {
    const segmentLabel = `${packetLabel}/${segment?.segment ?? 'unknown'}`;
    if (!segment.segment || segmentIds.has(segment.segment)) errors.push(`${segmentLabel} missing or duplicate segment`);
    segmentIds.add(segment.segment);
    if (!Number.isFinite(segment.baseSize) || segment.baseSize < 100) errors.push(`${segmentLabel} needs readable prototype baseSize`);
    if (segment.readableBase !== true) errors.push(`${segmentLabel} must be marked readableBase true for the demo scenario`);
    if (!segment.interpretation || segment.interpretation.length < 24) errors.push(`${segmentLabel} needs interpretation`);
    for (const metric of requiredDemographicMetrics) {
      const value = segment.metrics?.[metric];
      if (!value) {
        errors.push(`${segmentLabel} missing ${metric}`);
        continue;
      }
      if (!Number.isFinite(value.value) || value.value < 0) errors.push(`${segmentLabel}/${metric} needs positive value`);
      if (!Number.isFinite(value.categoryIndex) || value.categoryIndex < 0) errors.push(`${segmentLabel}/${metric} needs positive categoryIndex`);
      if (!validDemographicAheadStatuses.has(value.aheadStatus)) errors.push(`${segmentLabel}/${metric} invalid aheadStatus ${value.aheadStatus}`);
      if (!validDemographicMomentumStatuses.has(value.momentumStatus)) errors.push(`${segmentLabel}/${metric} invalid momentumStatus ${value.momentumStatus}`);
    }
  }
}
if (!mentalAvailabilityFramework.principle) errors.push('mental-availability-framework.json needs principle');
if (!Array.isArray(mentalAvailabilityFramework.coreMeasures) || mentalAvailabilityFramework.coreMeasures.length < 4) {
  errors.push('mental-availability-framework.json needs four coreMeasures');
}
const mentalMeasureIds = new Set();
for (const measure of mentalAvailabilityFramework.coreMeasures || []) {
  if (!measure.id || !measure.label || !measure.definition || !measure.guardrail) {
    errors.push(`mental availability measure missing required fields: ${measure.id || 'unknown'}`);
  }
  if (mentalMeasureIds.has(measure.id)) errors.push(`duplicate mental availability measure id: ${measure.id}`);
  mentalMeasureIds.add(measure.id);
}
const cepRoleIds = new Set();
for (const role of mentalAvailabilityFramework.cepRoles || []) {
  if (!role.id || !role.label || !role.definition || !['good', 'watch', 'bad'].includes(role.tone)) {
    errors.push(`mental availability CEP role missing required fields: ${role.id || 'unknown'}`);
  }
  if (cepRoleIds.has(role.id)) errors.push(`duplicate mental availability CEP role id: ${role.id}`);
  cepRoleIds.add(role.id);
}
if (!Array.isArray(mentalAvailabilityFramework.defaultMissingInputs) || mentalAvailabilityFramework.defaultMissingInputs.length < 4) {
  errors.push('mental-availability-framework.json needs defaultMissingInputs');
}
if (!Array.isArray(mentalAvailabilityFramework.interpretationGuardrails) || mentalAvailabilityFramework.interpretationGuardrails.length < 3) {
  errors.push('mental-availability-framework.json needs interpretationGuardrails');
}
if (!mentalAvailabilitySourceMapping.id || !mentalAvailabilitySourceMapping.label) {
  errors.push('mental-availability-source-mapping.json needs id and label');
}
if (!Array.isArray(mentalAvailabilitySourceMapping.acceptedFormats) || mentalAvailabilitySourceMapping.acceptedFormats.length < 2) {
  errors.push('mental-availability-source-mapping.json needs acceptedFormats');
}
if (!Array.isArray(mentalAvailabilitySourceMapping.requiredPacketFields) || mentalAvailabilitySourceMapping.requiredPacketFields.length < 6) {
  errors.push('mental-availability-source-mapping.json needs requiredPacketFields');
}
for (const measureId of mentalAvailabilitySourceMapping.measureFields || []) {
  if (!mentalMeasureIds.has(measureId)) errors.push(`mental availability source mapping references unknown measure ${measureId}`);
}
const csvColumns = new Set();
for (const column of mentalAvailabilitySourceMapping.csvColumns || []) {
  if (!column.column || !column.mapsTo) errors.push(`mental availability source mapping csv column missing fields: ${column.column || 'unknown'}`);
  if (csvColumns.has(column.column)) errors.push(`duplicate mental availability csv column ${column.column}`);
  csvColumns.add(column.column);
}
for (const requiredColumn of ['brandId', 'period', 'sourceLabel', 'cepId', 'cepName', 'role', 'priority']) {
  if (!csvColumns.has(requiredColumn)) errors.push(`mental availability source mapping missing csv column ${requiredColumn}`);
}
if (!Array.isArray(mentalAvailabilitySourceMapping.governanceRules) || mentalAvailabilitySourceMapping.governanceRules.length < 3) {
  errors.push('mental-availability-source-mapping.json needs governanceRules');
}
for (const templatePath of mentalAvailabilityTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`mental availability template missing: ${templatePath}`);
  } else if (fs.statSync(templatePath).size < 200) {
    errors.push(`mental availability template ${templatePath} appears too small to be useful`);
  } else if (templatePath.endsWith('.json')) {
    const template = read(templatePath);
    if (!template.brandId || !template.period || !template.sourceLabel || !Array.isArray(template.ceps)) {
      errors.push(`mental availability JSON template ${templatePath} missing required packet fields`);
    }
  } else {
    const header = fs.readFileSync(templatePath, 'utf8').split(/\r?\n/)[0] ?? '';
    for (const requiredColumn of ['brandId', 'period', 'sourceLabel', 'cepId', 'cepName', 'role', 'priority']) {
      if (!header.split(',').includes(requiredColumn)) errors.push(`mental availability CSV template missing column ${requiredColumn}`);
    }
  }
}
for (const packet of mentalAvailabilityDemoPackets) {
  if (!recordIds.has(packet.brandId)) errors.push(`mental availability demo packet references unknown brand: ${packet.brandId}`);
  if (packet.evidenceMode !== 'simulated_prototype') errors.push(`mental availability demo packet ${packet.brandId} must be simulated_prototype`);
  if (!packet.sourceLabel?.toLowerCase().includes('simulated')) errors.push(`mental availability demo packet ${packet.brandId} must label simulated evidence`);
  if (!packet.topline?.label || !packet.topline?.read || !packet.topline?.strategicQuestion) {
    errors.push(`mental availability demo packet ${packet.brandId} needs topline label/read/strategicQuestion`);
  }
  for (const measureId of mentalMeasureIds) {
    const measure = packet.measures?.[measureId];
    if (!measure) errors.push(`mental availability demo packet ${packet.brandId} missing measure ${measureId}`);
    if (measure && !validEvidenceModes.has(measure.evidenceMode)) errors.push(`mental availability demo packet ${packet.brandId}/${measureId} invalid evidenceMode ${measure.evidenceMode}`);
    if (measure && (!measure.displayValue || !measure.read)) errors.push(`mental availability demo packet ${packet.brandId}/${measureId} needs displayValue and read`);
  }
  if (!Array.isArray(packet.ceps) || packet.ceps.length < 2) errors.push(`mental availability demo packet ${packet.brandId} needs at least two CEPs`);
  const cepIds = new Set();
  for (const cep of packet.ceps || []) {
    if (!cep.id || !cep.name || !cep.consumerQuestion || !cep.interpretation || !cep.action || !cep.caveat) {
      errors.push(`mental availability demo packet ${packet.brandId} has incomplete CEP ${cep.id || 'unknown'}`);
    }
    if (cepIds.has(cep.id)) errors.push(`duplicate CEP ${cep.id} in mental availability demo packet ${packet.brandId}`);
    cepIds.add(cep.id);
    if (!cepRoleIds.has(cep.role)) errors.push(`mental availability demo packet ${packet.brandId}/${cep.id} invalid role ${cep.role}`);
    if (!Number.isFinite(cep.priority)) errors.push(`mental availability demo packet ${packet.brandId}/${cep.id} needs numeric priority`);
    for (const scoreKey of ['relevance', 'brandAssociation', 'competitorPressure']) {
      const score = cep[scoreKey];
      if (score !== null && (!Number.isFinite(score) || score < 0 || score > 100)) {
        errors.push(`mental availability demo packet ${packet.brandId}/${cep.id} has invalid ${scoreKey}`);
      }
    }
    if (!Array.isArray(cep.evidence) || cep.evidence.length === 0) errors.push(`mental availability demo packet ${packet.brandId}/${cep.id} needs evidence`);
    if (!Array.isArray(cep.missingInputs) || cep.missingInputs.length === 0) errors.push(`mental availability demo packet ${packet.brandId}/${cep.id} needs missingInputs`);
  }
}
for (const templatePath of brandStrategicContextTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`brand strategic context template missing file ${templatePath}`);
  } else {
    const template = read(templatePath);
    for (const field of ['brandId', 'sourceType', 'reviewStatus', 'sourceLabel', 'sourceOwner', 'sourceDate', 'brandStatement']) {
      if (!(field in template)) errors.push(`brand strategic context template missing ${field}`);
    }
    for (const field of ['brandDna', 'objectives', 'planningPriorities', 'approvedClaims', 'claimsNotToMake', 'caveats']) {
      if (!Array.isArray(template[field])) errors.push(`brand strategic context template ${field} must be an array`);
    }
  }
}
for (const templatePath of momentumIntelligenceTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`momentum intelligence template missing file ${templatePath}`);
  } else {
    const template = read(templatePath);
    for (const field of ['brandId', 'sourceLabel', 'sourceOwner', 'sourceDate', 'evidenceMode', 'marketContext', 'peerSet', 'roomToGrowInputs', 'smdContributionWeights', 'caveats']) {
      if (!(field in template)) errors.push(`momentum intelligence template missing ${field}`);
    }
    if (!validMomentumSourceEvidenceModes.has(template.evidenceMode)) errors.push(`momentum intelligence template has invalid evidenceMode ${template.evidenceMode}`);
    if (!template.marketContext || !template.peerSet || !template.roomToGrowInputs || !template.smdContributionWeights) {
      errors.push('momentum intelligence template needs marketContext, peerSet, roomToGrowInputs, and smdContributionWeights');
    } else {
      for (const field of ['market', 'category', 'geography', 'period']) {
        if (!template.marketContext[field]) errors.push(`momentum intelligence template marketContext missing ${field}`);
      }
      if (!Array.isArray(template.peerSet.brandIds) || !template.peerSet.brandIds.length) errors.push('momentum intelligence template peerSet needs brandIds');
      for (const field of ['penetrationHeadroom', 'demandPowerShareVsMarketShareGap', 'categoryGrowth']) {
        if (!Number.isFinite(template.roomToGrowInputs[field])) errors.push(`momentum intelligence template roomToGrowInputs missing numeric ${field}`);
      }
      const weights = ['salient', 'meaningful', 'different'].map(field => template.smdContributionWeights[field]);
      if (!weights.every(value => Number.isFinite(value))) errors.push('momentum intelligence template needs numeric SMD weights');
      if (Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) > 0.001) errors.push('momentum intelligence template SMD weights must sum to 1');
    }
    if (template.trendEvidence) {
      validateMomentumTrendEvidence(template.trendEvidence, 'momentum intelligence template', { requireCaveats: true });
    }
    if (!Array.isArray(template.caveats) || !template.caveats.length) errors.push('momentum intelligence template needs caveats');
  }
}
for (const templatePath of momentumSourceExtractTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`momentum source extract template missing file ${templatePath}`);
  } else {
    validateMomentumSourceExtractShape(read(templatePath), 'momentum source extract template');
  }
}
for (const templatePath of momentumSourceExtractBundleTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`momentum source extract bundle template missing file ${templatePath}`);
  } else {
    const template = read(templatePath);
    if (!Array.isArray(template) || template.length < 3) {
      errors.push('momentum source extract bundle template needs at least three extract blocks');
    } else {
      const bundleKinds = new Set();
      for (const [index, extract] of template.entries()) {
        validateMomentumSourceExtractShape(extract, `momentum source extract bundle template[${index}]`);
        bundleKinds.add(extract.extractKind);
      }
      for (const requiredKind of ['market_share_penetration', 'bbe_contribution_weight', 'bbe_movement_significance']) {
        if (!bundleKinds.has(requiredKind)) errors.push(`momentum source extract bundle template missing ${requiredKind}`);
      }
    }
  }
}
for (const templatePath of momentumSourceOwnerFileBundleTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`momentum source-owner file bundle template missing file ${templatePath}`);
  } else {
    validateMomentumSourceOwnerFileBundleShape(read(templatePath), 'momentum source-owner file bundle template');
  }
}
for (const templatePath of brandStrategicContextSourceOwnerFileBundleTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`brand strategic context source-owner file bundle template missing file ${templatePath}`);
  } else {
    validateBrandStrategicContextSourceOwnerFileBundleShape(read(templatePath), 'brand strategic context source-owner file bundle template');
  }
}
for (const templatePath of treatmentOutcomeRecordTemplateFiles) {
  if (!fs.existsSync(templatePath)) {
    errors.push(`treatment outcome record template missing file ${templatePath}`);
  } else {
    validateTreatmentOutcomeRecordTemplate(read(templatePath), 'treatment outcome record template');
  }
}
if (bbeSourceDataLedger.ledgerId !== 'bbe-source-data-ledger') {
  errors.push('bbe_source_data_ledger.json needs ledgerId bbe-source-data-ledger');
}
if (!bbeSourceDataLedger.canonicalPolicy?.principle || !bbeSourceDataLedger.canonicalPolicy?.pilotPromotionRequirement) {
  errors.push('bbe_source_data_ledger.json needs canonicalPolicy principle and pilotPromotionRequirement');
}
if (!Array.isArray(bbeSourceDataLedger.sources) || bbeSourceDataLedger.sources.length === 0) {
  errors.push('bbe_source_data_ledger.json needs at least one source');
} else {
  const sourceIds = new Set();
  for (const source of bbeSourceDataLedger.sources) {
    if (!source.sourceId || sourceIds.has(source.sourceId)) {
      errors.push(`bbe_source_data_ledger.json has missing or duplicate sourceId ${source.sourceId || 'unknown'}`);
    }
    sourceIds.add(source.sourceId);
    if (!validSourceLedgerTypes.has(source.sourceType)) {
      errors.push(`source ledger ${source.sourceId} has invalid sourceType ${source.sourceType}`);
    }
    if (!validSourceLedgerReviewStatuses.has(source.reviewStatus)) {
      errors.push(`source ledger ${source.sourceId} has invalid reviewStatus ${source.reviewStatus}`);
    }
    if (!validSourceLedgerEvidenceModes.has(source.evidenceMode)) {
      errors.push(`source ledger ${source.sourceId} has invalid evidenceMode ${source.evidenceMode}`);
    }
    for (const requiredPathField of ['preservedCopy', 'chartLedger', 'processedMetricRecords']) {
      if (!source[requiredPathField] || !fs.existsSync(source[requiredPathField])) {
        errors.push(`source ledger ${source.sourceId} missing existing ${requiredPathField}`);
      }
    }
    if (!Array.isArray(source.caveats) || source.caveats.length < 2) {
      errors.push(`source ledger ${source.sourceId} needs source-use caveats`);
    }
  }
}
if (bbeDeckChartLedger.sourceId !== 'bbe-snacks-tracker-2026-q1-us-snacks') {
  errors.push('deck-chart-ledger.json has unexpected sourceId');
}
if (!bbeDeckChartLedger.governance?.caveats?.some(caveat => caveat.toLowerCase().includes('canonical'))) {
  errors.push('deck-chart-ledger.json must caveat canonical source status');
}
if (bbeDeckChartLedger.counts?.slides !== 128) errors.push('deck-chart-ledger.json expected 128 slides');
if (bbeDeckChartLedger.counts?.nativeCharts !== 107) errors.push('deck-chart-ledger.json expected 107 native charts');
if (bbeDeckChartLedger.counts?.embeddedWorkbooksLinkedToCharts !== 107) errors.push('deck-chart-ledger.json expected 107 linked embedded workbooks');
if (bbeDeckChartLedger.counts?.processedMetricRows !== 11158) errors.push('deck-chart-ledger.json expected 11158 processed metric rows');
if (!Array.isArray(bbeDeckChartLedger.slides) || bbeDeckChartLedger.slides.length !== bbeDeckChartLedger.counts?.slides) {
  errors.push('deck-chart-ledger.json slides length must match counts.slides');
}
if (!Array.isArray(bbeDeckChartLedger.charts) || bbeDeckChartLedger.charts.length !== bbeDeckChartLedger.counts?.nativeCharts) {
  errors.push('deck-chart-ledger.json charts length must match counts.nativeCharts');
}
for (const [index, slide] of (bbeDeckChartLedger.slides || []).entries()) {
  const label = `deck-chart-ledger slide[${index}]`;
  if (!Number.isFinite(slide.slide) || typeof slide.title !== 'string') errors.push(`${label} needs slide number and title`);
  if (!validDeckReconciliationStatuses.has(slide.reconciliationStatus)) errors.push(`${label} has invalid reconciliationStatus ${slide.reconciliationStatus}`);
  if (!slide.processedMetricCoverage || !Number.isFinite(slide.processedMetricCoverage.rowCount)) errors.push(`${label} needs processedMetricCoverage.rowCount`);
}
for (const [index, chart] of (bbeDeckChartLedger.charts || []).entries()) {
  const label = `deck-chart-ledger chart[${index}]`;
  if (!chart.chartId || !chart.sourcePath || !chart.embeddedWorkbookPath) errors.push(`${label} needs chartId, sourcePath, and embeddedWorkbookPath`);
  if (!Array.isArray(chart.chartTypes) || chart.chartTypes.length === 0) errors.push(`${label} needs chartTypes`);
  if (!Number.isFinite(chart.seriesCount)) errors.push(`${label} needs seriesCount`);
  if (!validDeckReconciliationStatuses.has(chart.reconciliationStatus)) errors.push(`${label} has invalid reconciliationStatus ${chart.reconciliationStatus}`);
}
const wikiIds = new Set();
for (const page of wikiNav) {
  if (!page.id || !page.title || !page.file || !page.summary) errors.push(`wiki nav item missing required fields: ${page.id || 'unknown'}`);
  if (wikiIds.has(page.id)) errors.push(`duplicate wiki page id: ${page.id}`);
  wikiIds.add(page.id);
  if (page.file && !page.file.endsWith('.md')) errors.push(`wiki page ${page.id} must reference a markdown file`);
  const wikiPath = page.file ? `docs/wiki/${page.file}` : '';
  if (wikiPath && !fs.existsSync(wikiPath)) {
    errors.push(`wiki page ${page.id} missing file ${wikiPath}`);
  } else if (wikiPath) {
    const content = fs.readFileSync(wikiPath, 'utf8');
    if (!content.trim().startsWith('# ')) errors.push(`wiki file ${wikiPath} needs an H1 heading`);
    if (content.trim().length < 300) errors.push(`wiki file ${wikiPath} is too short to be useful`);
  }
}
for (const exportPath of wikiExportFiles) {
  if (!fs.existsSync(exportPath)) {
    errors.push(`wiki export missing file ${exportPath}`);
  } else if (fs.statSync(exportPath).size < 1000) {
    errors.push(`wiki export ${exportPath} appears too small to be valid`);
  }
}

function validateAtlasSource(source, contextLabel) {
  if (!source || typeof source !== 'object') {
    errors.push(`${contextLabel} needs source metadata`);
    return;
  }
  for (const field of ['sourceName', 'sourceType', 'sourceDate', 'lastUpdated', 'confidence', 'status']) {
    if (typeof source[field] !== 'string' || source[field].trim().length === 0) {
      errors.push(`${contextLabel} source missing ${field}`);
    }
  }
  if (!validAtlasSourceTypes.has(source.sourceType)) {
    errors.push(`${contextLabel} source has invalid sourceType ${source.sourceType}`);
  }
  if (!validAtlasConfidence.has(source.confidence)) {
    errors.push(`${contextLabel} source has invalid confidence ${source.confidence}`);
  }
  if (!validAtlasStatuses.has(source.status)) {
    errors.push(`${contextLabel} source has invalid status ${source.status}`);
  }
  if (!source.governance || typeof source.governance !== 'object') {
    errors.push(`${contextLabel} source needs governance`);
    return;
  }
  if (!validAtlasSourceTypes.has(source.governance.sourceType)) {
    errors.push(`${contextLabel} governance has invalid sourceType ${source.governance.sourceType}`);
  }
  if (!validAtlasApprovalStatuses.has(source.governance.approvalStatus)) {
    errors.push(`${contextLabel} governance has invalid approvalStatus ${source.governance.approvalStatus}`);
  }
  if (!validAtlasCanonicalUse.has(source.governance.canonicalUseAllowed)) {
    errors.push(`${contextLabel} governance has invalid canonicalUseAllowed ${source.governance.canonicalUseAllowed}`);
  }
  if (!validAtlasConfidence.has(source.governance.confidence)) {
    errors.push(`${contextLabel} governance has invalid confidence ${source.governance.confidence}`);
  }
  if (typeof source.governance.sourceOwner !== 'string' || source.governance.sourceOwner.length < 3) {
    errors.push(`${contextLabel} governance needs sourceOwner`);
  }
  if (!Array.isArray(source.governance.allowedUse) || source.governance.allowedUse.length === 0) {
    errors.push(`${contextLabel} governance needs allowedUse`);
  }
  for (const allowedUse of source.governance.allowedUse || []) {
    if (!validAtlasAllowedUse.has(allowedUse)) errors.push(`${contextLabel} governance has invalid allowedUse ${allowedUse}`);
  }
  if (!Array.isArray(source.governance.caveats) || source.governance.caveats.length === 0) {
    errors.push(`${contextLabel} governance needs caveats`);
  }
  if (source.governance.replacementRequirement !== null && (typeof source.governance.replacementRequirement !== 'string' || source.governance.replacementRequirement.length < 5)) {
    errors.push(`${contextLabel} governance replacementRequirement must be null or meaningful text`);
  }
  if (source.status !== 'approved' && source.governance.canonicalUseAllowed === 'yes') {
    errors.push(`${contextLabel} cannot allow canonical use unless source status is approved`);
  }
}

function validateAtlasFinancialImpact(financialImpact, contextLabel) {
  if (!financialImpact || typeof financialImpact !== 'object') {
    errors.push(`${contextLabel} needs financialImpact`);
    return;
  }
  if (!Object.values(financialImpact).some(Number.isFinite)) {
    errors.push(`${contextLabel} financialImpact needs at least one numeric financial value`);
  }
}

function validateUniqueIds(items, contextLabel) {
  const ids = new Set();
  for (const item of items || []) {
    if (!item?.id || ids.has(item.id)) {
      errors.push(`${contextLabel} has missing or duplicate id ${item?.id || 'unknown'}`);
    }
    ids.add(item.id);
  }
  return ids;
}

if (atlasEuropeIntelligence.region !== 'Europe') errors.push('atlas-europe-intelligence region must be Europe');
if (atlasEuropeIntelligence.currency !== 'EUR') errors.push('atlas-europe-intelligence currency must be EUR');
if (atlasEuropeIntelligence.year !== 2026) errors.push('atlas-europe-intelligence year must be 2026');
if (!atlasEuropeIntelligence.summary || atlasEuropeIntelligence.summary.activeBuyingGroups < 30) {
  errors.push('atlas-europe-intelligence summary needs activeBuyingGroups over 30');
}

const atlasMarketIds = validateUniqueIds(atlasEuropeIntelligence.markets, 'atlas markets');
const atlasBuyingGroupIds = validateUniqueIds(atlasEuropeIntelligence.buyingGroups, 'atlas buyingGroups');
const atlasSignalIds = validateUniqueIds(atlasEuropeIntelligence.signals, 'atlas signals');
const atlasCompetitorMoveIds = validateUniqueIds(atlasEuropeIntelligence.competitorMoves, 'atlas competitorMoves');
const atlasDocumentIds = validateUniqueIds(atlasEuropeIntelligence.documents, 'atlas documents');
const atlasTimelineIds = validateUniqueIds(atlasEuropeIntelligence.timelineEvents, 'atlas timelineEvents');
const atlasScenarioIds = validateUniqueIds(atlasEuropeIntelligence.scenarioModels, 'atlas scenarioModels');
validateUniqueIds(atlasEuropeIntelligence.crossMarketPatterns, 'atlas crossMarketPatterns');
validateUniqueIds(atlasEuropeIntelligence.cnoWatchlist, 'atlas cnoWatchlist');
const atlasSourceReferenceIds = new Set([...atlasSignalIds, ...atlasCompetitorMoveIds, ...atlasDocumentIds, ...atlasTimelineIds, ...atlasScenarioIds]);

if ((atlasEuropeIntelligence.markets || []).length < 8) errors.push('atlas-europe-intelligence needs at least 8 markets');
if ((atlasEuropeIntelligence.buyingGroups || []).length < 10) errors.push('atlas-europe-intelligence needs at least 10 buying groups');
if ((atlasEuropeIntelligence.crossMarketPatterns || []).length < 3) errors.push('atlas-europe-intelligence needs cross-market pattern detection');
if ((atlasEuropeIntelligence.cnoWatchlist || []).length < 4) errors.push('atlas-europe-intelligence needs CNO watchlist items');

for (const market of atlasEuropeIntelligence.markets || []) {
  const label = `atlas market ${market.id}`;
  if (!validAtlasRiskLevels.has(market.pressureLevel)) errors.push(`${label} has invalid pressureLevel ${market.pressureLevel}`);
  validateAtlasFinancialImpact(market, label);
  validateAtlasSource(market.source, label);
}

for (const group of atlasEuropeIntelligence.buyingGroups || []) {
  const label = `atlas buyingGroup ${group.id}`;
  for (const marketId of group.primaryMarkets || []) {
    if (!atlasMarketIds.has(marketId)) errors.push(`${label} references missing marketId ${marketId}`);
  }
  for (const signalId of group.currentSignals || []) {
    if (!atlasSignalIds.has(signalId)) errors.push(`${label} references missing signalId ${signalId}`);
  }
  for (const moveId of group.competitorMoves || []) {
    if (!atlasCompetitorMoveIds.has(moveId)) errors.push(`${label} references missing competitorMoveId ${moveId}`);
  }
  for (const documentId of group.documents || []) {
    if (!atlasDocumentIds.has(documentId)) errors.push(`${label} references missing documentId ${documentId}`);
  }
  for (const timelineId of group.timelineEvents || []) {
    if (!atlasTimelineIds.has(timelineId)) errors.push(`${label} references missing timelineEventId ${timelineId}`);
  }
  if (!validAtlasRiskLevels.has(group.riskLevel)) errors.push(`${label} has invalid riskLevel ${group.riskLevel}`);
  validateAtlasFinancialImpact(group.financialExposure, label);
  validateAtlasSource(group.source, label);
}

for (const signal of atlasEuropeIntelligence.signals || []) {
  const label = `atlas signal ${signal.id}`;
  validateAtlasFinancialImpact({ revenueImpact: signal.estimatedRevenueImpact, marginImpact: signal.estimatedMarginImpact }, label);
  validateAtlasSource(signal.source, label);
  for (const marketId of signal.affectedMarkets || []) {
    if (!atlasMarketIds.has(marketId)) errors.push(`${label} references missing affectedMarketId ${marketId}`);
  }
  for (const buyingGroupId of signal.affectedBuyingGroups || []) {
    if (!atlasBuyingGroupIds.has(buyingGroupId)) errors.push(`${label} references missing affectedBuyingGroupId ${buyingGroupId}`);
  }
}

for (const move of atlasEuropeIntelligence.competitorMoves || []) {
  const label = `atlas competitorMove ${move.id}`;
  validateAtlasFinancialImpact({ revenueImpact: move.estimatedRevenueImpact, marginImpact: move.estimatedMarginImpact }, label);
  validateAtlasSource(move.source, label);
  for (const marketId of move.affectedMarkets || []) {
    if (!atlasMarketIds.has(marketId)) errors.push(`${label} references missing affectedMarketId ${marketId}`);
  }
  for (const buyingGroupId of move.affectedBuyingGroups || []) {
    if (!atlasBuyingGroupIds.has(buyingGroupId)) errors.push(`${label} references missing affectedBuyingGroupId ${buyingGroupId}`);
  }
}

for (const document of atlasEuropeIntelligence.documents || []) {
  const label = `atlas document ${document.id}`;
  if (!validAtlasStatuses.has(document.status)) errors.push(`${label} has invalid status ${document.status}`);
  validateAtlasSource(document.source, label);
  if (document.marketId && !atlasMarketIds.has(document.marketId)) {
    errors.push(`${label} references missing marketId ${document.marketId}`);
  }
  if (document.buyingGroupId && !atlasBuyingGroupIds.has(document.buyingGroupId)) {
    errors.push(`${label} references missing buyingGroupId ${document.buyingGroupId}`);
  }
}

for (const event of atlasEuropeIntelligence.timelineEvents || []) {
  const label = `atlas timelineEvent ${event.id}`;
  if (!validAtlasStatuses.has(event.status)) errors.push(`${label} has invalid status ${event.status}`);
  validateAtlasFinancialImpact(event.financialImpact, label);
  validateAtlasSource(event.source, label);
  for (const marketId of event.marketIds || []) {
    if (!atlasMarketIds.has(marketId)) errors.push(`${label} references missing marketId ${marketId}`);
  }
  for (const buyingGroupId of event.buyingGroupIds || []) {
    if (!atlasBuyingGroupIds.has(buyingGroupId)) errors.push(`${label} references missing buyingGroupId ${buyingGroupId}`);
  }
}

for (const scenario of atlasEuropeIntelligence.scenarioModels || []) {
  const label = `atlas scenarioModel ${scenario.id}`;
  if (!atlasBuyingGroupIds.has(scenario.buyingGroupId)) errors.push(`${label} references missing buyingGroupId ${scenario.buyingGroupId}`);
  if (!atlasMarketIds.has(scenario.marketId)) errors.push(`${label} references missing marketId ${scenario.marketId}`);
  if (!Array.isArray(scenario.sourceIds) || !scenario.sourceIds.some(sourceId => atlasSourceReferenceIds.has(sourceId))) {
    errors.push(`${label} needs at least one valid sourceId`);
  }
  validateAtlasFinancialImpact(scenario.outputs, label);
  for (const field of ['priceIncreasePercent', 'expectedRealizationPercent', 'tradeSpendChange', 'volumeChangePercent', 'buyerAcceptanceProbability']) {
    if (!Number.isFinite(scenario.inputs?.[field])) errors.push(`${label} inputs need numeric ${field}`);
  }
}

for (const pattern of atlasEuropeIntelligence.crossMarketPatterns || []) {
  const label = `atlas crossMarketPattern ${pattern.id}`;
  if (!validAtlasConfidence.has(pattern.confidence)) errors.push(`${label} has invalid confidence ${pattern.confidence}`);
  validateAtlasFinancialImpact(pattern.financialImplication, label);
  validateAtlasSource(pattern.source, label);
}

for (const item of atlasEuropeIntelligence.cnoWatchlist || []) {
  const label = `atlas cnoWatchlist ${item.id}`;
  if (!validAtlasStatuses.has(item.status)) errors.push(`${label} has invalid status ${item.status}`);
  if (!validAtlasConfidence.has(item.confidence)) errors.push(`${label} has invalid confidence ${item.confidence}`);
  validateAtlasFinancialImpact(item.financialImplication, label);
  validateAtlasSource(item.source, label);
}

for (const note of atlasEuropeIntelligence.retrievalNotes || []) {
  if (!['using_approved_source', 'needs_validation', 'generated_draft'].includes(note.noteType)) {
    errors.push(`atlas retrievalNote ${note.id} has invalid noteType ${note.noteType}`);
  }
  if (note.documentId && !atlasDocumentIds.has(note.documentId)) errors.push(`atlas retrievalNote ${note.id} references missing documentId ${note.documentId}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${records.length} brand records, ${diagnoses.length} diagnoses, ${treatments.length} treatments, ${links.length} links, ${brandAssets.length} brand assets, ${groundingModules.length} grounding modules, ${learningModulePages.length} learning module pages, ${learningPaths.length} learning paths, ${learningPracticeScenarios.length} learning practice scenarios, ${learningSignalLabScenarios.length} learning signal lab scenarios, ${learningCaseWalkthroughs.length} learning case walkthroughs, ${groundingQuiz.length} quiz items, ${gnFrameworkNodes.length} GN nodes, ${treatmentPlanTemplates.length} treatment plan templates, ${personas.length} personas, ${liveConsultActions.length} live consult actions, ${liveConsultScenarios.length} live consult scenarios, ${agentSkillRegistry.length} agent skills, ${dynamicViewRegistry.length} dynamic views, ${experienceTemplateRegistry.length} experience templates, ${domainPackRegistry.length} domain packs, ${artifactReadinessRequirements.requirements.length} artifact readiness requirements, ${executiveAssetPageModuleRegistry.moduleDefinitions.length} executive asset page modules, ${executiveAssetPageModuleRegistry.assetDefinitions.length} executive asset definitions, ${persistenceReadinessRequirements.requirements.length} persistence readiness requirements, 1 review identity policy, ${agentCapabilityFlags.length} agent capabilities, 1 runtime policy, 1 voice policy, ${voiceSkillViewContract.voiceModes.length} voice skill/view contracts, ${voiceOrchestrationReadinessRequirements.requirements.length} voice orchestration requirements, ${governedRuntimeSurfaceRegistry.surfaces.length} runtime surfaces, ${brandStrategicContextHandoffRequirements.requirements.length} brand strategic context handoff requirements, 1 brand strategic context runtime file-drop policy, ${momentumSourceHandoffRequirements.requirements.length} momentum source handoff requirements, 1 momentum source runtime file-drop policy, 1 treatment outcome readiness policy, ${treatmentOutcomeRecordTemplateFiles.length} treatment outcome record templates, ${brandStrategicContextPackets.length} brand strategic context packets, ${brandStrategicContextSourceOwnerFileBundleTemplateFiles.length} brand strategic context source-owner file bundle templates, ${momentumSourceExtracts.length} momentum source extracts, ${momentumSourceExtractBundleTemplateFiles.length} momentum source extract bundle templates, ${momentumSourceOwnerFileBundleTemplateFiles.length} momentum source-owner file bundle templates, ${momentumIntelligenceSourcePackets.length} momentum intelligence source packets, ${growthAvailabilityPillars.length} growth availability pillars, ${growthAvailabilityDemoPackets.length} growth demo packets, ${simulatedDemographicEquityRecords.length} simulated demographic packets, ${mentalAvailabilityFramework.coreMeasures.length} mental availability measures, ${mentalAvailabilityDemoPackets.length} mental availability demo packets, ${mentalAvailabilitySourceMapping.csvColumns.length} mental availability source columns, ${wikiNav.length} wiki pages, ${atlasEuropeIntelligence.markets.length} ATLAS markets, ${atlasEuropeIntelligence.buyingGroups.length} ATLAS buying groups, ${atlasEuropeIntelligence.signals.length} ATLAS signals, ${atlasEuropeIntelligence.scenarioModels.length} ATLAS scenario models.`);
