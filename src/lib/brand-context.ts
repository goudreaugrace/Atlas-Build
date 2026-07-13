import {
  aiPersonas,
  brandRecords,
  coreMetrics,
  diagnosisDefinitions,
  diagnosisTreatmentLinks,
  findBrandRecordByIdentity,
  formatMetricValue,
  getAiPersona,
  getBindingConstraint,
  getDiagnosisEvidence,
  getDiagnosisRuleTrace,
  getEvidenceConfidence,
  getEvidenceReadiness,
  getFollowUpSignals,
  getGrowthAvailabilityRecord,
  getGrowthNavigatorVitals,
  getMentalAvailabilityRecord,
  getMetricOpportunityRows,
  getPrimaryDiagnosis,
  getTreatmentPlanOptions,
  metric,
  treatmentDefinitions
} from '@/src/lib/data';
import { redactSourceTypologyForDefaultUse } from '@/src/lib/intelligence/source-typology-language';
import type { BrandHealthRecord } from '@/src/types/domain';
import type { MentalAvailabilitySourcePacket } from '@/src/types/domain';

export function findBrandRecord(brandId?: string): BrandHealthRecord {
  return findBrandRecordByIdentity(brandId)
    ?? brandRecords.find((record) => record.brandName === "Lay's")
    ?? brandRecords[0];
}

export function getNoMagicContext(record: BrandHealthRecord, personaId?: string, conversationMode = 'explore', mentalAvailabilitySourcePacket?: MentalAvailabilitySourcePacket) {
  const assistantRecord = redactSourceTypologyForDefaultUse(record, '');
  const diagnosis = getPrimaryDiagnosis(record);
  const evidence = getDiagnosisEvidence(record);
  const confidence = getEvidenceConfidence(record);
  const readiness = getEvidenceReadiness(record);
  const trace = getDiagnosisRuleTrace(record);
  const persona = getAiPersona(personaId);
  const treatments = getTreatmentPlanOptions(record);
  const bindingConstraint = getBindingConstraint(record);
  const growthAvailability = getGrowthAvailabilityRecord(record);
  const mentalAvailability = getMentalAvailabilityRecord(record, mentalAvailabilitySourcePacket);

  return {
    evidence: coreMetrics.map((name) => {
      const m = metric(record, name);
      return {
        label: name,
        value: formatMetricValue(m?.value),
        status: m ? `${m.categoryBand} / ${m.ahead} / ${m.momentum}` : 'Missing',
        source: m ? `${m.wave} · slide ${m.slide}` : record.sourceFiles.join(', ')
      };
    }),
    logic: [
      `Primary diagnosis: ${diagnosis.name}`,
      `Rule fired: ${trace.primaryRule.ruleId}`,
      `Evidence readiness: ${readiness.label}`,
      `Growth availability constraint: ${growthAvailability.growthConstraint.label}`,
      `Mental availability read: ${mentalAvailability.topline.label}`,
      `Confidence: ${evidence.confidence ?? confidence.label}`,
      `Matched conditions: ${trace.primaryRule.matchedConditionCount}/${trace.primaryRule.totalConditionCount}`,
      bindingConstraint ? `Binding constraint: ${bindingConstraint.metric} (${formatMetricValue(bindingConstraint.value)})` : 'Binding constraint: not available',
      `Top treatment path: ${treatments[0]?.name ?? 'No treatment path linked'}`
    ],
    aiRole: [
      `Persona: ${persona.name}`,
      `Conversation mode: ${conversationMode}`,
      'AI explains, translates, challenges, and drafts.',
      'AI does not choose the deterministic diagnosis or invent treatment definitions.',
      'If evidence is missing, the answer should say what is missing.'
    ],
    compactPacket: {
      activeBrandRecord: assistantRecord,
      primaryDiagnosis: diagnosis,
      evidenceLedger: evidence,
      evidenceConfidence: confidence,
      evidenceReadiness: readiness,
      growthAvailability,
      mentalAvailability,
      ruleTrace: trace,
      treatmentOptions: treatments,
      followUpSignals: getFollowUpSignals(record),
      growthNavigatorVitals: getGrowthNavigatorVitals(record),
      metricOpportunityRows: getMetricOpportunityRows(record),
      selectedPersona: persona,
      conversationMode
    }
  };
}

export function getBrandDataPacket(record: BrandHealthRecord, mentalAvailabilitySourcePacket?: MentalAvailabilitySourcePacket) {
  const diagnosis = getPrimaryDiagnosis(record);
  const trace = getDiagnosisRuleTrace(record);
  return {
    record,
    coreMetrics: coreMetrics.map((name) => metric(record, name)).filter(Boolean),
    trends: record.trends,
    occasions: record.occasions,
    growthNavigator: record.growthNavigator,
    mentalAvailability: getMentalAvailabilityRecord(record, mentalAvailabilitySourcePacket),
    diagnosis,
    diagnosisDefinitions,
    diagnosisRuleTrace: trace,
    treatmentDefinitions,
    diagnosisTreatmentLinks,
    treatmentOptions: getTreatmentPlanOptions(record),
    personas: aiPersonas,
    aiContextPacket: getNoMagicContext(record, aiPersonas[0]?.id, 'explore', mentalAvailabilitySourcePacket).compactPacket
  };
}
