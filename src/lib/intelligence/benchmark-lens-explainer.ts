import bbeDeckDoctrineJson from '@/src/data/config/bbe-deck-doctrine.json';
import type {
  BenchmarkLensExplainerBlockedMisread,
  BenchmarkLensExplainerLensId,
  BenchmarkLensExplainerModule,
  BrandIntelligencePacket,
  EquityReasoningLensRead,
  EquityReasoningRead
} from '@/src/lib/intelligence/types';

type BenchmarkLensDoctrine = {
  id: BenchmarkLensExplainerLensId;
  label: string;
  role: 'headline_verdict' | 'size_adjusted_strength_check' | 'category_context';
  precedence: number;
  definition: string;
  productRule: string;
  sourceContext: string;
};

type BbeDeckDoctrine = {
  sourceReportId: string;
  sourceSlides: {
    benchmarkLenses: number[];
  };
  benchmarkLensHierarchy: BenchmarkLensDoctrine[];
  strengthLanguagePolicy: {
    requiredQualifierWhenBlocked: string;
  };
  typologyPolicy: {
    productRule: string;
    blockedUse: string;
  };
};

const deckDoctrine = bbeDeckDoctrineJson as BbeDeckDoctrine;

function lensReadFor(equityReasoning: EquityReasoningRead, lensId: BenchmarkLensExplainerLensId): EquityReasoningLensRead {
  if (lensId === 'momentum') return equityReasoning.momentumRead;
  if (lensId === 'aheadBehind') return equityReasoning.aheadBehindRead;
  return equityReasoning.categoryContext;
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildBlockedMisreads(equityReasoning: EquityReasoningRead): BenchmarkLensExplainerBlockedMisread[] {
  const doctrineBlocks: BenchmarkLensExplainerBlockedMisread[] = [
    {
      claim: 'Category-leading means healthy.',
      correction: 'Category index is context only; health language needs Momentum, Ahead/Behind, and driver support.',
      source: 'bbe-deck-doctrine-v1'
    },
    {
      claim: 'Source typology labels can be used as the verdict.',
      correction: deckDoctrine.typologyPolicy.blockedUse,
      source: 'bbe-deck-doctrine-v1'
    },
    {
      claim: 'Strong can be used when one positive lens is available.',
      correction: deckDoctrine.strengthLanguagePolicy.requiredQualifierWhenBlocked,
      source: 'bbe-deck-doctrine-v1'
    }
  ];

  const runtimeBlocks = equityReasoning.blockedClaims.map((claim) => ({
    claim,
    correction: 'Blocked by the current equity reasoning read for this brand packet.',
    source: equityReasoning.doctrineVersion
  }));

  return [...doctrineBlocks, ...runtimeBlocks].filter((item, index, all) => (
    all.findIndex((candidate) => candidate.claim === item.claim) === index
  ));
}

export function buildBenchmarkLensExplainer(packetBase: Pick<BrandIntelligencePacket, 'brand' | 'equityReasoning'>): BenchmarkLensExplainerModule {
  const { brand, equityReasoning } = packetBase;
  const sourcePosture = equityReasoning.sourcePosture;
  const lensReads = [...deckDoctrine.benchmarkLensHierarchy]
    .sort((a, b) => a.precedence - b.precedence)
    .map((lens) => {
      const activeRead = lensReadFor(equityReasoning, lens.id);
      return {
        id: lens.id,
        label: lens.label,
        role: lens.role,
        precedence: lens.precedence,
        deckDefinition: lens.definition,
        sourceContext: lens.sourceContext,
        productRule: lens.productRule,
        brandRead: activeRead.read,
        status: activeRead.status,
        evidence: activeRead.evidence.slice(0, 6)
      };
    });

  return {
    id: 'benchmark-lens-explainer-v1',
    outputModuleId: 'benchmark_lens_explainer',
    title: `${brand.brandName} Benchmark Lens Explainer`,
    subtitle: 'Deck-derived benchmark logic translated into governed product reasoning.',
    brandName: brand.brandName,
    sourceReportId: deckDoctrine.sourceReportId,
    sourceSlides: deckDoctrine.sourceSlides.benchmarkLenses,
    headlineVerdict: equityReasoning.headlineVerdict,
    lensReads,
    blockedMisreads: buildBlockedMisreads(equityReasoning),
    driverIntegration: unique([
      equityReasoning.driverRead.demandPowerDrivers,
      equityReasoning.driverRead.perceivedValueDrivers,
      ...equityReasoning.driverRead.tensions
    ]),
    nextProofNeeded: unique([
      ...equityReasoning.evidenceGaps,
      sourcePosture.pilotPromotionRequirement
    ]),
    sourcePosture: {
      title: sourcePosture.title,
      reviewStatus: sourcePosture.reviewStatus,
      evidenceMode: sourcePosture.evidenceMode,
      canonicalUseAllowed: sourcePosture.canonicalUseAllowed,
      read: sourcePosture.read,
      caveats: sourcePosture.caveats,
      pilotPromotionRequirement: sourcePosture.pilotPromotionRequirement
    }
  };
}
