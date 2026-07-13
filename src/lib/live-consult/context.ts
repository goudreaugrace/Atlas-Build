import { getNoMagicContext } from '@/src/lib/brand-context';
import { actionInstructionList } from '@/src/lib/live-consult/actions';
import { getAiPersona } from '@/src/lib/data';
import { sourceTypologyLanguagePolicy } from '@/src/lib/intelligence/source-typology-language';
import type { BrandHealthRecord } from '@/src/types/domain';

export function buildLiveConsultInstructions(record: BrandHealthRecord, personaId = 'brand_doctor') {
  const persona = getAiPersona(personaId);
  const context = getNoMagicContext(record, personaId, 'live_consult');
  const packet = context.compactPacket;
  const compactLivePacket = {
    activeBrand: {
      brandId: record.brandId,
      brandName: record.brandName,
      category: record.category,
      period: record.period,
      portfolioRole: record.portfolioRole,
      sourceTypology: 'Hidden by default. Use only if the user explicitly asks about source typology or source methodology.',
      sourceFiles: record.sourceFiles
    },
    coreMetricEvidence: context.evidence,
    logic: context.logic,
    aiRole: context.aiRole,
    primaryDiagnosis: {
      id: packet.primaryDiagnosis.id,
      name: packet.primaryDiagnosis.name,
      definition: packet.primaryDiagnosis.plainEnglishDefinition,
      doctorRead: packet.primaryDiagnosis.doctorRead,
      whatNotToConclude: packet.primaryDiagnosis.whatNotToConclude
    },
    ruleTrace: {
      primaryRuleId: packet.ruleTrace.primaryRule.ruleId,
      evidenceSummary: packet.ruleTrace.primaryRule.evidenceSummary,
      confidence: packet.ruleTrace.primaryRule.confidence,
      matchedConditionCount: packet.ruleTrace.primaryRule.matchedConditionCount,
      totalConditionCount: packet.ruleTrace.primaryRule.totalConditionCount,
      matchedConditions: packet.ruleTrace.primaryRule.conditions
        .filter((condition) => condition.matched)
        .slice(0, 6)
        .map((condition) => ({
          metric: condition.metric,
          field: condition.field,
          actual: condition.actual,
          evidence: condition.evidence,
          source: `${condition.wave} slide ${condition.slide}`
        })),
      missingEvidence: packet.ruleTrace.primaryRule.conditions
        .filter((condition) => !condition.matched && condition.missingEvidence)
        .slice(0, 4)
        .map((condition) => condition.missingEvidence)
    },
    evidenceReadiness: {
      label: packet.evidenceReadiness.label,
      availableInputs: packet.evidenceReadiness.availableInputs,
      missingInputs: packet.evidenceReadiness.missingInputs,
      caveat: packet.evidenceReadiness.caveat
    },
    connectedReads: {
      growthAvailability: packet.growthAvailability.growthConstraint,
      mentalAvailability: packet.mentalAvailability.topline,
      growthNavigatorVitals: packet.growthNavigatorVitals
    },
    topTreatmentOptions: packet.treatmentOptions.slice(0, 3).map((treatment) => ({
      name: treatment.name,
      tier: treatment.tier,
      family: treatment.family,
      whyThisFits: treatment.whyThisFits,
      rankReasons: treatment.rankReasons,
      expectedMetricMovement: treatment.expectedMetricMovement,
      followUpSignals: treatment.followUpSignals
    })),
    followUpSignals: packet.followUpSignals
  };

  return [
    `You are Brand Doctor Live Consult for ${record.brandName}.`,
    `BRAND LOCK: the active brand is ${record.brandName} (brandId: ${record.brandId}; category: ${record.category}).`,
    `Every answer in this consult must stay scoped to ${record.brandName}.`,
    'Do not switch to, substitute, or casually use another brand name as an example unless the user explicitly asks for an outside comparison.',
    `If context appears conflicting, say: "This consult is scoped to ${record.brandName}; I do not have support for switching brands in this answer."`,
    persona.systemInstruction,
    'This is a spoken executive consult. Be concise, confident, and human.',
    'Use the configured diagnosis, evidence, rule trace, treatment options, and follow-up signals only.',
    'Do not invent diagnoses, treatments, metrics, competitors, causality, SKU price recommendations, cannibalization proof, or occasion-substitution proof.',
    sourceTypologyLanguagePolicy,
    'When the user asks to prove, show, open, highlight, compare, pressure-test, or choose, call the screen-control tool before or during your answer.',
    'Use treatment language as paths to consider or test. The human brand and insights team makes the prescription decision.',
    'Pricing Power is broad brand-equity price justification only. It is not SKU-level pricing guidance.',
    'If evidence is missing, say what is missing and offer to open the data view or evidence ledger.',
    '',
    'Available visual actions:',
    actionInstructionList(),
    '',
    'No Magic packet:',
    JSON.stringify(compactLivePacket)
  ].join('\n');
}
