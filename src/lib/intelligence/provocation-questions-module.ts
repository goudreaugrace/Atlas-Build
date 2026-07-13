import bbeDeckDoctrineJson from '@/src/data/config/bbe-deck-doctrine.json';
import type {
  BrandIntelligencePacket,
  ProvocationQuestionRecord,
  ProvocationQuestionsModule
} from '@/src/lib/intelligence/types';

type ProvocationQuestionsPacketBase = Pick<BrandIntelligencePacket,
  | 'brand'
  | 'benchmarkLensExplainer'
  | 'chartRead'
  | 'demographicDiagnosticState'
  | 'equityReasoning'
  | 'executiveVerdict'
  | 'sourceReadiness'
  | 'starterProvocations'
  | 'treatmentOptions'
>;

const deckDoctrine = bbeDeckDoctrineJson as {
  sourceSlides: {
    provocations: number[];
  };
};

function unique(items: string[], limit = 10) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= limit) break;
  }
  return result;
}

function firstSourceBlock(packet: ProvocationQuestionsPacketBase, id: string) {
  return packet.sourceReadiness.sourceBlocks.find((block) => block.id === id);
}

function treatmentEvidence(packet: ProvocationQuestionsPacketBase) {
  const treatment = packet.executiveVerdict.treatmentPathsToConsider[0];
  if (!treatment) return ['No ranked treatment path is available yet.'];
  return [
    `${treatment.name}: ${treatment.whyConsider}`,
    ...treatment.inspectBeforeAction.slice(0, 2)
  ];
}

function starterProvocationQuestion(packet: ProvocationQuestionsPacketBase): ProvocationQuestionRecord | null {
  const provocation = packet.starterProvocations[0];
  if (!provocation) return null;

  return {
    id: 'starter-growth-provocation',
    question: `Which existing growth provocation should leadership test first: ${provocation.title}?`,
    priority: 'p1',
    purpose: 'test',
    sourceBasis: 'deck',
    whyItMatters: 'Keeps the meeting output pointed toward a testable business discussion instead of stopping at diagnosis.',
    evidenceToUse: unique([
      provocation.what,
      provocation.soWhat,
      provocation.nowWhat,
      packet.executiveVerdict.primaryWatchout
    ], 4),
    evidenceNeededToAnswer: unique([
      ...packet.executiveVerdict.nextProofNeeded.slice(0, 2),
      'Human decision owner for the next test path.'
    ], 4),
    blockedOverclaim: 'Do not present the provocation as a decided action plan or final prescription.'
  };
}

function priorityQuestions(packet: ProvocationQuestionsPacketBase): ProvocationQuestionRecord[] {
  const starterQuestion = starterProvocationQuestion(packet);
  return uniqueQuestionRecords([
    {
      id: 'momentum-headline-verdict',
      question: `If Momentum is the headline verdict, what is the real growth risk ${packet.brand.brandName} needs leadership to face first?`,
      priority: 'p0',
      purpose: 'diagnose',
      sourceBasis: 'deck',
      whyItMatters: 'The deck and Kate/Lydia feedback both point away from isolated score reading and toward a clear trajectory verdict.',
      evidenceToUse: unique([
        packet.executiveVerdict.headline,
        packet.executiveVerdict.primaryWatchout,
        packet.benchmarkLensExplainer.lensReads.find((lens) => lens.id === 'momentum')?.brandRead ?? '',
        packet.chartRead.primaryChartRead.chartRead
      ], 5),
      evidenceNeededToAnswer: unique([
        'Movement/significance evidence for core BBE metrics.',
        ...packet.executiveVerdict.nextProofNeeded.slice(0, 2)
      ], 4),
      blockedOverclaim: 'Do not bury a declining or uncertain Momentum signal behind brand scale or category index.'
    },
    {
      id: 'scale-versus-size-adjusted-strength',
      question: `Are we treating ${packet.brand.brandName}'s category-leading scale as strength, or do Ahead/Behind and driver support change the story?`,
      priority: 'p0',
      purpose: 'challenge',
      sourceBasis: 'kate_v7',
      whyItMatters: 'This is the core anti-whac-a-mole rule: category index is context, while Ahead/Behind adjusts for brand size and driver profile.',
      evidenceToUse: unique([
        packet.equityReasoning.categoryContext.read,
        packet.equityReasoning.aheadBehindRead.read,
        packet.equityReasoning.strengthLanguage.rationale[0] ?? '',
        ...packet.executiveVerdict.blockedClaims.slice(0, 2)
      ], 6),
      evidenceNeededToAnswer: unique([
        'Validated same-size/life-stage peer set.',
        'Metric-level Ahead/Behind flags for outcome and driver metrics.',
        firstSourceBlock(packet, 'bbe-source-ledger')?.requiredForPilot ?? ''
      ], 5),
      blockedOverclaim: 'Do not call the brand strong unless Momentum, Ahead/Behind, and the driver profile support the full claim.'
    },
    {
      id: 'driver-tension-to-inspect',
      question: 'Which driver tension should we inspect first: Meaningful relevance, Difference, Salience, or Perceived Value?',
      priority: 'p0',
      purpose: 'diagnose',
      sourceBasis: 'deck',
      whyItMatters: 'The deck logic reads M/D/S and Perceived Value together; isolated metric callouts can point teams at the wrong treatment.',
      evidenceToUse: unique([
        packet.equityReasoning.driverRead.demandPowerDrivers,
        packet.equityReasoning.driverRead.perceivedValueDrivers,
        ...packet.equityReasoning.driverRead.tensions.slice(0, 3)
      ], 6),
      evidenceNeededToAnswer: unique([
        'Metric-level M/D/S and Perceived Value movement/significance.',
        'Validated driver contribution weights for the market/category/period.',
        firstSourceBlock(packet, 'momentum-source')?.requiredForPilot ?? ''
      ], 5),
      blockedOverclaim: 'Do not diagnose from one isolated input metric when the combined M/D/S and Perceived Value profile tells a different story.'
    },
    {
      id: 'treatment-path-before-action',
      question: 'What treatment path should we test before writing the action plan?',
      priority: 'p0',
      purpose: 'test',
      sourceBasis: 'deck',
      whyItMatters: 'The POC should move from evidence to options-to-test, while preserving the human prescription decision.',
      evidenceToUse: treatmentEvidence(packet),
      evidenceNeededToAnswer: unique([
        ...packet.treatmentOptions.slice(0, 2).flatMap((treatment) => treatment.evidenceNeeds.slice(0, 2)),
        'Business owner approval of the test objective and success metric.'
      ], 6),
      blockedOverclaim: 'Do not treat an AI-ranked treatment path as the final prescription.'
    },
    {
      id: 'what-would-make-read-wrong',
      question: 'What would make this read wrong or overconfident?',
      priority: 'p0',
      purpose: 'challenge',
      sourceBasis: 'source_readiness',
      whyItMatters: 'This directly supports prototype-to-pilot reliability: every compelling answer needs its proof boundary visible.',
      evidenceToUse: unique([
        packet.sourceReadiness.headline,
        ...packet.sourceReadiness.sourceBlocks.slice(0, 3).map((block) => `${block.label}: ${block.currentState}`),
        ...packet.executiveVerdict.blockedClaims.slice(0, 2)
      ], 7),
      evidenceNeededToAnswer: unique([
        ...packet.sourceReadiness.nextProofNeeded.slice(0, 4),
        'Human source-owner sign-off before executive/canonical use.'
      ], 6),
      blockedOverclaim: 'Do not present prototype-reviewed, browser-local, simulated, or unreconciled evidence as official pilot truth.'
    },
    {
      id: 'demographic-question-boundary',
      question: 'What demographic question can we answer today, and what must remain simulated until official cuts arrive?',
      priority: 'p0',
      purpose: 'source_handoff',
      sourceBasis: 'demographic_gate',
      whyItMatters: 'Kate asked for demographic-specific performance; the system needs a useful demo answer without pretending simulated data is measured.',
      evidenceToUse: unique([
        packet.demographicDiagnosticState.headline,
        packet.demographicDiagnosticState.activeSegmentRead?.interpretation ?? '',
        packet.demographicDiagnosticState.sourcePosture.replacementRequirement
      ], 5),
      evidenceNeededToAnswer: packet.demographicDiagnosticState.nextProofNeeded.slice(0, 5),
      blockedOverclaim: 'Do not infer demographic performance from total-market data or simulated workflow values.'
    },
    {
      id: 'chief-marketing-objective',
      question: 'Where should leadership focus first: fix fundamentals, accelerate momentum, or find new space?',
      priority: 'p1',
      purpose: 'growth_strategy',
      sourceBasis: 'cmo_research',
      whyItMatters: 'This translates the evidence into a CMO-level strategic choice while staying grounded in the brand profile.',
      evidenceToUse: unique([
        packet.executiveVerdict.decisionImplication,
        packet.equityReasoning.headlineVerdict,
        packet.benchmarkLensExplainer.headlineVerdict,
        packet.sourceReadiness.headline
      ], 5),
      evidenceNeededToAnswer: unique([
        'Approved Brand Strategic Context: objectives, planning priorities, and claims.',
        'Approved Momentum source extracts and source-owner review.',
        'Leadership decision criteria for the next planning cycle.'
      ], 5),
      blockedOverclaim: 'Do not convert a brand-equity diagnostic into portfolio strategy without approved business context.'
    },
    {
      id: 'equity-to-commercial-bridge',
      question: 'How does the equity read connect to commercial performance without collapsing into short-term tactics?',
      priority: 'p1',
      purpose: 'decide',
      sourceBasis: 'cmo_research',
      whyItMatters: 'CMO and brand-lead users need the bridge from brand equity to growth, but the system must avoid unsupported causal or SKU-pricing claims.',
      evidenceToUse: unique([
        packet.equityReasoning.momentumRead.read,
        packet.equityReasoning.driverRead.demandPowerDrivers,
        packet.equityReasoning.driverRead.perceivedValueDrivers,
        packet.benchmarkLensExplainer.driverIntegration[0] ?? ''
      ], 5),
      evidenceNeededToAnswer: unique([
        'Demand Power / Pricing Power source lineage and commercial-context caveats.',
        'Market/share/penetration source extract for room-to-grow context.',
        firstSourceBlock(packet, 'runtime-source-ingestion')?.requiredForPilot ?? ''
      ], 5),
      blockedOverclaim: 'Do not claim causality, SKU-level pricing guidance, cannibalization, portfolio migration, or occasion substitution without measured evidence.'
    },
    starterQuestion
  ].filter(Boolean) as ProvocationQuestionRecord[], 9);
}

function uniqueQuestionRecords(items: ProvocationQuestionRecord[], limit: number) {
  const seen = new Set<string>();
  const result: ProvocationQuestionRecord[] = [];
  for (const item of items) {
    const key = item.id.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

function sourceOwnerQuestions(packet: ProvocationQuestionsPacketBase): ProvocationQuestionRecord[] {
  return [
    {
      id: 'approve-chart-reproduction',
      question: 'Which source-owner file approves the BBE metric mapping and chart reproduction?',
      priority: 'p0',
      purpose: 'source_handoff',
      sourceBasis: 'source_readiness',
      whyItMatters: 'Deck replacement depends on trusted chart-to-data reconciliation, not only nice-looking generated slides.',
      evidenceToUse: unique([
        packet.chartRead.primaryChartRead.chartRead,
        `Primary chart slide ${packet.chartRead.primaryChartRead.sourceSlide}: ${packet.chartRead.primaryChartRead.reconciliationStatus.replaceAll('_', ' ')}.`,
        firstSourceBlock(packet, 'chart-ledger')?.currentState ?? ''
      ], 4),
      evidenceNeededToAnswer: unique([
        firstSourceBlock(packet, 'chart-ledger')?.requiredForPilot ?? '',
        'Approved embedded workbook/chart cache mapping.'
      ], 4),
      blockedOverclaim: 'Do not recreate source-deck charts as official output until the source mapping is approved.'
    },
    {
      id: 'replace-simulated-demographics',
      question: 'Which official demographic cut can replace simulated workflow data?',
      priority: 'p0',
      purpose: 'source_handoff',
      sourceBasis: 'demographic_gate',
      whyItMatters: 'This is the fastest way to answer Kate-style segment performance questions reliably in a pilot.',
      evidenceToUse: unique([
        packet.demographicDiagnosticState.headline,
        packet.demographicDiagnosticState.requiredOfficialSource.baseSizeRule
      ], 4),
      evidenceNeededToAnswer: packet.demographicDiagnosticState.requiredOfficialSource.requiredFields.slice(0, 8),
      blockedOverclaim: 'Do not use simulated demographic cuts for executive decisions or pilot source truth.'
    },
    {
      id: 'supply-movement-significance',
      question: 'Which Momentum/source file supplies movement, significance, and room-to-grow evidence?',
      priority: 'p0',
      purpose: 'source_handoff',
      sourceBasis: 'source_readiness',
      whyItMatters: 'Momentum is the headline verdict; it needs source-backed movement, significance, and opportunity context before pilot use.',
      evidenceToUse: unique([
        packet.sourceReadiness.sourceBlocks.find((block) => block.id === 'momentum-source')?.currentState ?? '',
        packet.executiveVerdict.primaryWatchout,
        packet.benchmarkLensExplainer.nextProofNeeded[0] ?? ''
      ], 4),
      evidenceNeededToAnswer: unique([
        ...packet.sourceReadiness.handoffRequirements
          .filter((handoff) => handoff.id.startsWith('momentum-'))
          .slice(0, 4)
          .map((handoff) => handoff.nextAction)
      ], 5),
      blockedOverclaim: 'Do not present directional deltas as statistically significant movement.'
    }
  ];
}

export function buildProvocationQuestionsModule(packet: ProvocationQuestionsPacketBase): ProvocationQuestionsModule {
  const questions = priorityQuestions(packet);
  const handoffQuestions = sourceOwnerQuestions(packet);

  return {
    id: 'provocation-questions-v1',
    outputModuleId: 'provocation_questions',
    title: `${packet.brand.brandName} Provocation Questions`,
    brandName: packet.brand.brandName,
    headline: `Use these questions to move ${packet.brand.brandName} from source-backed diagnosis to the next decision, while keeping proof gaps visible.`,
    sourceSlides: deckDoctrine.sourceSlides.provocations,
    questionStrategy: 'Prioritize questions already answered or implied by the source deck, then Kate/V7 guardrails, then CMO-level growth questions from external brand-growth research.',
    priorityQuestions: questions,
    sourceOwnerQuestions: handoffQuestions,
    researchBasis: [
      {
        label: 'Kantar Meaningful Different Salient framework',
        implication: 'Brand equity questions should connect M/D/S to penetration, market share, willingness to pay, and future growth potential without isolating one metric as the whole diagnosis.',
        sourceUrl: 'https://www.kantar.com/inspiration/brands/what-is-the-meaningful-different-salient-framework'
      },
      {
        label: 'Kantar Blueprint for Brand Growth',
        implication: 'CMO-level questions should clarify whether the brand needs to predispose more people, be more present, or find new space.',
        sourceUrl: 'https://www.kantar.com/campaigns/blueprint-for-brand-growth'
      },
      {
        label: 'Kantar BrandZ 2026 Chief Marketing Objectives',
        implication: 'Leadership framing can use fix fundamentals, accelerate momentum, or find new space as strategic choices after the evidence read.',
        sourceUrl: 'https://www.kantar.com/campaigns/brandz/global'
      },
      {
        label: 'WARC Multiplier Effect',
        implication: 'Questions should bridge brand equity and commercial performance while avoiding a false split between brand and performance thinking.',
        sourceUrl: 'https://page.warc.com/the-multiplier-effect-report'
      }
    ],
    blockedQuestionPatterns: unique([
      'Generic brainstorming questions with no evidence requirement.',
      'Questions that treat Category index as proof of brand health.',
      'Questions that ask for Star / Kantar typology as the product verdict rather than source context.',
      'Questions that infer causality from descriptive BBE movement.',
      'Questions that turn Perceived Value into SKU-level pricing, pack-price, promotion, or store-level guidance.',
      'Questions that claim demographic performance from simulated workflow data or total-market reads.',
      'Questions that imply cannibalization, portfolio migration, or occasion substitution without measured evidence.'
    ], 10),
    nextProofNeeded: unique([
      ...packet.sourceReadiness.nextProofNeeded,
      ...handoffQuestions.flatMap((question) => question.evidenceNeededToAnswer),
      ...packet.demographicDiagnosticState.nextProofNeeded
    ], 10)
  };
}
