import type {
  BrandHealthRecord,
  BrandMetric,
  DiagnosisCandidate,
  DiagnosisDefinition,
  DiagnosisResult,
  DiagnosisRule,
  DiagnosisRuleCondition,
  EvidenceItem
} from '@/src/types/domain';

function asArray(value: DiagnosisRuleCondition['value']) {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

function compareValue(actual: unknown, condition: DiagnosisRuleCondition) {
  const expectedValues = asArray(condition.value);

  if (condition.op === 'exists') return actual !== undefined && actual !== null && actual !== '';
  if (condition.op === 'missing') return actual === undefined || actual === null || actual === '';
  if (actual === undefined || actual === null) return false;

  if (condition.op === 'equals') return expectedValues.some((expected) => actual === expected);
  if (condition.op === 'notEquals') return expectedValues.every((expected) => actual !== expected);
  if (condition.op === 'in') return expectedValues.some((expected) => actual === expected);
  if (condition.op === 'notIn') return expectedValues.every((expected) => actual !== expected);

  const actualNumber = Number(actual);
  const expectedNumber = Number(expectedValues[0]);
  if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) return false;

  if (condition.op === 'lt') return actualNumber < expectedNumber;
  if (condition.op === 'lte') return actualNumber <= expectedNumber;
  if (condition.op === 'gt') return actualNumber > expectedNumber;
  if (condition.op === 'gte') return actualNumber >= expectedNumber;

  return false;
}

function evidenceFromCondition(record: BrandHealthRecord, condition: DiagnosisRuleCondition, metric: BrandMetric | undefined, matched: boolean): EvidenceItem {
  return {
    label: condition.metric,
    statement: matched
      ? condition.evidence
      : condition.missingEvidence ?? `${condition.metric} does not satisfy the configured ${condition.field} ${condition.op} condition.`,
    source: metric?.source ?? record.sourceFiles.join(', '),
    wave: metric?.wave ?? record.period,
    slide: metric?.slide ?? 'Diagnosis rule'
  };
}

function evaluateCondition(record: BrandHealthRecord, condition: DiagnosisRuleCondition) {
  const metric = record.metrics[condition.metric];
  const matched = compareValue(metric?.[condition.field], condition);
  return {
    matched,
    item: evidenceFromCondition(record, condition, metric, matched)
  };
}

function confidenceFor(score: number, matched: number, total: number): DiagnosisCandidate['confidence'] {
  if (score >= 90 && matched >= Math.max(2, total - 1)) return 'High';
  if (score >= 65 && matched >= 2) return 'Medium';
  return 'Low';
}

function candidateFromRule(
  record: BrandHealthRecord,
  rule: DiagnosisRule,
  diagnosis: DiagnosisDefinition
): DiagnosisCandidate | null {
  const allResults = (rule.all ?? []).map((condition) => evaluateCondition(record, condition));
  const anyResults = (rule.any ?? []).map((condition) => evaluateCondition(record, condition));
  const counterResults = (rule.counter ?? []).map((condition) => evaluateCondition(record, condition));
  const minAnyMatches = rule.minAnyMatches ?? (anyResults.length ? 1 : 0);
  const allPassed = allResults.every((result) => result.matched);
  const anyMatchedCount = anyResults.filter((result) => result.matched).length;
  const anyPassed = anyMatchedCount >= minAnyMatches;

  if (!allPassed || !anyPassed) return null;

  const supporting = [...allResults, ...anyResults].filter((result) => result.matched).map((result) => result.item);
  const missingEvidence = [...allResults, ...anyResults].filter((result) => !result.matched).map((result) => result.item);
  const counterEvidence = counterResults.filter((result) => result.matched).map((result) => result.item);
  const totalConditionCount = allResults.length + anyResults.length;
  const matchedConditionCount = supporting.length;
  const score = Math.max(
    1,
    (100 - rule.priority * 7)
      + matchedConditionCount * 6
      - missingEvidence.length * 5
      - counterEvidence.length * 8
  );

  return {
    ruleId: rule.id,
    diagnosis,
    score,
    confidence: confidenceFor(score, matchedConditionCount, totalConditionCount),
    severity: rule.severity,
    evidenceSummary: rule.evidenceSummary,
    supporting,
    counterEvidence,
    missingEvidence,
    matchedConditionCount,
    totalConditionCount
  };
}

function fallbackCandidate(record: BrandHealthRecord, diagnoses: DiagnosisDefinition[]): DiagnosisCandidate {
  const seededDiagnosisId = record.diagnosisIds[0];
  const diagnosis = diagnoses.find((item) => item.id === seededDiagnosisId)
    ?? diagnoses.find((item) => item.id === 'healthy_or_watch')
    ?? diagnoses[0];
  const supporting = Object.values(record.metrics).slice(0, 5).map((metric) => ({
    label: metric.metric,
    statement: `${metric.metric}: ${metric.displayValue ?? metric.value} (${metric.categoryBand}; ${metric.ahead}; ${metric.momentum})`,
    source: metric.source,
    wave: metric.wave,
    slide: metric.slide
  }));

  return {
    ruleId: 'seeded_diagnosis_fallback',
    diagnosis,
    score: 1,
    confidence: 'Fallback',
    severity: diagnosis.severityDefault,
    evidenceSummary: 'No deterministic diagnosis rule fired, so the seeded Brand Health Record diagnosis is used as a fallback trace.',
    supporting,
    counterEvidence: [],
    missingEvidence: [],
    matchedConditionCount: 0,
    totalConditionCount: 0
  };
}

export function evaluateDiagnosisResult(
  record: BrandHealthRecord,
  diagnoses: DiagnosisDefinition[],
  rules: DiagnosisRule[]
): DiagnosisResult {
  const candidates = rules
    .map((rule) => {
      const diagnosis = diagnoses.find((item) => item.id === rule.diagnosisId);
      return diagnosis ? candidateFromRule(record, rule, diagnosis) : null;
    })
    .filter((candidate): candidate is DiagnosisCandidate => Boolean(candidate))
    .sort((a, b) => b.score - a.score || a.diagnosis.name.localeCompare(b.diagnosis.name));

  if (candidates.length) {
    return {
      primary: candidates[0],
      candidates,
      fallbackUsed: false,
      seededDiagnosisId: record.diagnosisIds[0]
    };
  }

  const fallback = fallbackCandidate(record, diagnoses);
  return {
    primary: fallback,
    candidates: [fallback],
    fallbackUsed: true,
    seededDiagnosisId: record.diagnosisIds[0]
  };
}
