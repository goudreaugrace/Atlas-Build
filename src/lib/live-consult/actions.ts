import actions from '@/src/data/config/live-consult-actions.json';
import scenarios from '@/src/data/config/live-consult-scenarios.json';

export type LiveConsultActionType =
  | 'navigate_to_section'
  | 'highlight_metric'
  | 'open_rule_trace'
  | 'select_treatment_path'
  | 'create_meeting_takeaway';

export type LiveConsultAction = {
  id: string;
  type: LiveConsultActionType;
  label: string;
  description: string;
  targetSectionId?: string;
  targetMetric?: string;
  targetRank?: number;
  spokenCue: string;
};

export type LiveConsultScenario = {
  id: string;
  label: string;
  prompt: string;
  preferredActions: string[];
};

export const liveConsultActions = actions as LiveConsultAction[];
export const liveConsultScenarios = scenarios as LiveConsultScenario[];

const sectionTargetAliases: Record<string, string[]> = {
  'health-title': ['bloodwork-title', 'find-brand-title'],
  'diagnosis-title': ['diagnosis-evidence-title'],
  'evidence-title': ['diagnosis-evidence-title'],
  'root-title': ['lenses-title'],
  'prescription-title': ['treatment-path-title']
};

export function findLiveConsultAction(actionId: string) {
  return liveConsultActions.find((action) => action.id === actionId);
}

export function metricAnchorId(metricName: string) {
  return `metric-${metricName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export function liveConsultActionTargetIds(action: LiveConsultAction) {
  if (action.type === 'highlight_metric' && action.targetMetric) return [metricAnchorId(action.targetMetric)];
  if (action.type === 'select_treatment_path') return ['treatment-path-title', 'prescription-title'];
  if (!action.targetSectionId) return [];
  return [action.targetSectionId, ...(sectionTargetAliases[action.targetSectionId] ?? [])];
}

export function inferLiveConsultActionIdFromQuestion(question: string) {
  const q = question.toLowerCase();

  if (/\b(rule|trace|logic|deterministic|configured)\b/.test(q)) return 'open_rule_trace';
  if (/\b(prove|proof|evidence|believe|supporting|complicat|caveat|missing|not conclude|wrong|change the read)\b/.test(q)) {
    return 'open_evidence_ledger';
  }
  if (/\b(treatment|prescription|action plan|path|first|test first|budget|risk|depend|owner|roadmap|follow-up|signal)\b/.test(q)) {
    return q.includes('follow') || q.includes('signal') ? 'open_follow_up_signals' : 'open_prescription';
  }
  if (/\b(demand power)\b/.test(q)) return 'highlight_demand_power';
  if (/\b(pricing power|price)\b/.test(q)) return 'highlight_pricing_power';
  if (/\bmeaningful\b/.test(q)) return 'highlight_meaningful';
  if (/\bdifferent\b/.test(q)) return 'highlight_different';
  if (/\bsalient\b/.test(q)) return 'highlight_salient';
  if (/\bdiagnos|fire|fired\b/.test(q)) return 'open_current_diagnosis';
  if (/\b(root|symptom|constraint|weak point)\b/.test(q)) return 'open_root_cause';
  if (/\bboardroom|summary|executive\b/.test(q)) return 'open_executive_summary';

  return null;
}

export function actionInstructionList() {
  return liveConsultActions
    .map((action) => `${action.id}: ${action.description}`)
    .join('\n');
}
