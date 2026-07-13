import type {
  BrandIntelligencePacket,
  ExecutiveVerdictEvidenceCard,
  ExecutiveVerdictModule,
  ExecutiveVerdictTakeaway,
  ExecutiveVerdictTone,
  OutputQualityCheck
} from '@/src/lib/intelligence/types';

type ExecutiveVerdictPacketBase = Pick<BrandIntelligencePacket,
  | 'brand'
  | 'equityReasoning'
  | 'benchmarkLensExplainer'
  | 'chartRead'
  | 'diagnosisResult'
  | 'diagnosisTrace'
  | 'evidenceGaps'
  | 'momentumIntelligence'
  | 'outputQualityChecks'
  | 'roomToGrow'
  | 'treatmentOptions'
>;

function confidenceFor(packet: ExecutiveVerdictPacketBase): ExecutiveVerdictModule['confidence'] {
  const highSeverityGaps = packet.evidenceGaps.filter((gap) => gap.severity === 'high').length;
  const canonicalUse = packet.equityReasoning.sourcePosture.canonicalUseAllowed;
  if (canonicalUse === 'yes' && highSeverityGaps === 0 && packet.outputQualityChecks.every((check) => check.status === 'pass')) return 'high';
  if (canonicalUse === 'no' || highSeverityGaps >= 2 || packet.equityReasoning.tone === 'gap') return 'low';
  return 'medium';
}

function toneFor(packet: ExecutiveVerdictPacketBase): ExecutiveVerdictTone {
  if (packet.equityReasoning.tone === 'gap') return 'gap';
  if (packet.equityReasoning.tone === 'vulnerable') return 'vulnerable';
  if (packet.equityReasoning.tone === 'watch' || packet.momentumIntelligence.redSignals.length > 0) return 'watch';
  return 'positive';
}

function evidenceTone(status: string): ExecutiveVerdictEvidenceCard['tone'] {
  if (status === 'positive' || status === 'available' || status === 'pass') return 'good';
  if (status === 'negative' || status === 'missing' || status === 'gap') return 'bad';
  if (status === 'mixed' || status === 'partial' || status === 'watch') return 'watch';
  return 'neutral';
}

function unique(items: string[], limit = 8) {
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

function decisionImplication(packet: ExecutiveVerdictPacketBase) {
  if (packet.equityReasoning.tone === 'vulnerable') {
    return 'Frame this as a leadership watch-out: protect scale while fixing the signals that undermine a simple strength story.';
  }
  if (packet.equityReasoning.tone === 'watch') {
    return 'Use this as a focused decision read: confirm the watch-outs, then choose the highest-leverage treatment path to test.';
  }
  if (packet.equityReasoning.tone === 'gap') {
    return 'Do not advance an executive conclusion until the missing evidence is replaced or explicitly caveated.';
  }
  return 'Use this as a supported executive read, while keeping source posture and remaining proof visible.';
}

function primaryWatchout(packet: ExecutiveVerdictPacketBase) {
  if (packet.equityReasoning.driverRead.tensions[0]) return packet.equityReasoning.driverRead.tensions[0];
  if (packet.momentumIntelligence.redSignals[0]) return packet.momentumIntelligence.redSignals[0];
  if (packet.evidenceGaps[0]) return `${packet.evidenceGaps[0].label}: ${packet.evidenceGaps[0].missingInput}`;
  return 'No single watch-out dominates the current packet; continue to monitor Momentum, Ahead/Behind, and driver support together.';
}

function qualityEvidence(checks: OutputQualityCheck[]): ExecutiveVerdictEvidenceCard | null {
  const watchCheck = checks.find((check) => check.status !== 'pass') ?? checks[0];
  if (!watchCheck) return null;
  return {
    id: `quality-${watchCheck.id}`,
    label: watchCheck.label,
    read: watchCheck.detail,
    tone: evidenceTone(watchCheck.status),
    source: 'output-quality-standards-v1'
  };
}

function buildEvidenceCards(packet: ExecutiveVerdictPacketBase): ExecutiveVerdictEvidenceCard[] {
  return [
    {
      id: 'momentum',
      label: packet.equityReasoning.momentumRead.label,
      read: packet.equityReasoning.momentumRead.read,
      tone: evidenceTone(packet.equityReasoning.momentumRead.status),
      source: packet.equityReasoning.doctrineVersion
    },
    {
      id: 'ahead-behind',
      label: packet.equityReasoning.aheadBehindRead.label,
      read: packet.equityReasoning.aheadBehindRead.read,
      tone: evidenceTone(packet.equityReasoning.aheadBehindRead.status),
      source: packet.equityReasoning.doctrineVersion
    },
    {
      id: 'chart-read',
      label: 'Primary chart read',
      read: packet.chartRead.primaryChartRead.chartRead,
      tone: evidenceTone(packet.chartRead.primaryChartRead.evidenceStatus === 'reconciled_chart_and_rows' ? 'positive' : 'mixed'),
      source: `Slide ${packet.chartRead.primaryChartRead.sourceSlide}`
    },
    qualityEvidence(packet.outputQualityChecks)
  ].filter(Boolean) as ExecutiveVerdictEvidenceCard[];
}

function buildTakeaways(packet: ExecutiveVerdictPacketBase): ExecutiveVerdictTakeaway[] {
  const firstTreatment = packet.treatmentOptions[0];
  return [
    {
      label: 'Verdict',
      body: packet.equityReasoning.headlineVerdict,
      evidence: [
        packet.equityReasoning.momentumRead.read,
        packet.equityReasoning.aheadBehindRead.read
      ]
    },
    {
      label: 'So what',
      body: primaryWatchout(packet),
      evidence: [
        ...packet.equityReasoning.driverRead.tensions.slice(0, 2),
        packet.chartRead.primaryChartRead.chartRead
      ].filter(Boolean)
    },
    {
      label: 'Now what',
      body: firstTreatment
        ? `Consider ${firstTreatment.name} as a treatment path to test, not a final prescription.`
        : 'Do not recommend a treatment path until the evidence review is complete.',
      evidence: firstTreatment
        ? [...firstTreatment.brandSpecificBasis.slice(0, 2), ...firstTreatment.evidenceNeeds.slice(0, 2)]
        : packet.evidenceGaps.slice(0, 3).map((gap) => gap.missingInput)
    }
  ];
}

export function buildExecutiveVerdictModule(packet: ExecutiveVerdictPacketBase): ExecutiveVerdictModule {
  const sourcePosture = packet.equityReasoning.sourcePosture;
  const treatmentPathsToConsider = packet.treatmentOptions.slice(0, 2).map((treatment) => ({
    treatmentId: treatment.treatmentId,
    name: treatment.name,
    whyConsider: treatment.brandSpecificBasis[0] ?? treatment.globalLibraryRole,
    inspectBeforeAction: treatment.evidenceNeeds.slice(0, 4)
  }));

  return {
    id: 'executive-verdict-v1',
    outputModuleId: 'executive_verdict',
    title: `${packet.brand.brandName} Executive Verdict`,
    brandName: packet.brand.brandName,
    headline: packet.equityReasoning.headlineVerdict,
    verdict: `${packet.brand.brandName} is a ${packet.diagnosisResult.primary.diagnosis.name.toLowerCase()} case: ${packet.momentumIntelligence.headline}`,
    tone: toneFor(packet),
    confidence: confidenceFor(packet),
    decisionImplication: decisionImplication(packet),
    primaryWatchout: primaryWatchout(packet),
    takeaways: buildTakeaways(packet),
    evidenceCards: buildEvidenceCards(packet),
    treatmentPathsToConsider,
    blockedClaims: unique([
      ...packet.equityReasoning.blockedClaims,
      ...packet.chartRead.blockedClaims,
      'Do not present treatment paths as final prescriptions.'
    ], 10),
    nextProofNeeded: unique([
      ...packet.evidenceGaps.slice(0, 4).map((gap) => `${gap.label}: ${gap.bestNextSource}`),
      ...packet.chartRead.nextProofNeeded.slice(0, 3),
      sourcePosture.pilotPromotionRequirement
    ], 8),
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
