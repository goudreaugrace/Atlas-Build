import { agentAnswerToMarkdown } from '@/src/lib/intelligence/skill-router';
import type {
  AgentTurnResult,
  ConversationComposedAnswer,
  ConversationModeDecision,
  ConversationModeDecisionType
} from '@/src/lib/intelligence/types';

const advancedSignals = [
  'build',
  'create',
  'make',
  'dashboard',
  'report',
  'qbr',
  'deck',
  'brief',
  'artifact',
  'export',
  'package',
  'compare',
  'workspace',
  'view',
  'show me the proof',
  'prove it',
  'source readiness',
  'evidence pack',
  'treatment plan',
  'agency brief'
];

const governanceSignals = [
  'certify',
  'production ready',
  'approve funding',
  'official approval',
  'export the audit',
  'write source truth',
  'canonical',
  'turn on full voice',
  'continuous listening',
  'autonomous'
];

const offerSignals = [
  'momentum',
  'cmo',
  'leadership',
  'what should',
  'why',
  'diagnosis',
  'treatment',
  'evidence'
];

function includesAny(value: string, signals: string[]) {
  return signals.some((signal) => value.includes(signal));
}

function skillForQuestion(normalized: string, fallbackSkillId: string) {
  if (includesAny(normalized, ['momentum', 'qbr', 'bgs', 'slipping'])) return 'bbe_momentum_intelligence_read';
  if (includesAny(normalized, ['treatment', 'what should', 'action'])) return 'create_growth_provocations';
  if (includesAny(normalized, ['proof', 'evidence', 'source', 'trust', 'actual data', 'data basis', 'data behind', 'what data are you using', 'show me the data'])) return 'explain_diagnosis_evidence';
  return fallbackSkillId;
}

export function decideConversationMode(question: string, turn?: Pick<AgentTurnResult, 'routedSkillId'>): ConversationModeDecision {
  const trimmed = question.trim();
  const normalized = trimmed.toLowerCase();
  const likelySkillId = skillForQuestion(normalized, turn?.routedSkillId ?? 'answer_brand_question');

  let type: ConversationModeDecisionType = 'direct_answer';
  let label = 'Direct Answer';
  let reason = 'The ask can be answered conversationally from the active brand packet.';
  let requiresApproval = false;
  let offerLabels: string[] = [];
  let blockedCapabilityIds: string[] = [];

  if (includesAny(normalized, governanceSignals)) {
    type = 'fail_closed_governance';
    label = 'Fail-Closed Governance';
    reason = 'The ask touches production, export, source truth, full voice, official approval, or autonomous capability gates.';
    offerLabels = ['Open governance readiness', 'Show blocked capabilities'];
    blockedCapabilityIds = [
      'artifact_export_capability',
      'source_data_write_capability',
      'continuous_voice_capability',
      'runtime_bypass_capability'
    ];
  } else if (includesAny(normalized, advancedSignals) || trimmed.length > 130) {
    type = 'approval_work_order';
    label = 'Approval Work Order';
    reason = 'The ask implies a deliverable, workspace, artifact, comparison, proof package, or other deeper workflow.';
    requiresApproval = true;
    offerLabels = ['Approve and build workspace'];
  } else if (includesAny(normalized, offerSignals)) {
    type = 'answer_and_offer';
    label = 'Answer And Offer';
    reason = 'The ask deserves a direct answer first, with an optional governed workspace or proof path available.';
    offerLabels = ['Show proof', 'Build meeting prep'];
  }

  return {
    id: 'conversation-mode-decision-v1',
    type,
    label,
    reason,
    shouldRunGovernedTurn: true,
    requiresApproval,
    likelySkillId,
    offerLabels,
    blockedCapabilityIds
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function sentenceJoin(values: string[]) {
  return values.filter(Boolean).join(' ');
}

function stripInternalGovernance(values: string[]) {
  return values.filter((value) => {
    const normalized = value.toLowerCase();
    return ![
      'runtime',
      'file drop',
      'canonical use',
      'source readiness',
      'brand strategic context readiness',
      'consumption disabled'
    ].some((term) => normalized.includes(term));
  });
}

function metricFact(turn: AgentTurnResult, metricName: string) {
  return turn.answer.facts.find((fact) => fact.toLowerCase().startsWith(metricName.toLowerCase()));
}

function firstEvidenceSource(turn: AgentTurnResult) {
  return turn.answer.evidence[0]?.source ?? 'active BBE packet';
}

function deterministicCompose(_question: string, decision: ConversationModeDecision, turn: AgentTurnResult): ConversationComposedAnswer {
  const brandName = turn.packet.brand.brandName;
  const diagnosisName = turn.packet.diagnosisResult.primary.diagnosis.name;
  const demandPower = metricFact(turn, 'Demand Power');
  const meaningful = turn.packet.metrics.Meaningful;
  const perceivedValue = turn.packet.metrics['Pricing Power'];
  const redSignals = turn.packet.momentumIntelligence.redSignals;
  const trendReads = turn.packet.momentumTrendContext.metricReads
    .filter((read) => read.delta !== null)
    .slice(0, 2)
    .map((read) => `${read.metric} moved ${read.delta && read.delta > 0 ? '+' : ''}${read.delta} from ${read.firstPeriod} to ${read.lastPeriod}`);
  const source = firstEvidenceSource(turn);
  const proofHighlights = unique([
    demandPower ?? '',
    meaningful ? `Meaningful is ${meaningful.displayValue ?? meaningful.value} with ${meaningful.momentum} momentum.` : '',
    perceivedValue ? `Perceived Value is ${perceivedValue.displayValue ?? perceivedValue.value} with ${perceivedValue.ahead} and ${perceivedValue.momentum} momentum.` : '',
    ...trendReads
  ]).slice(0, 4);
  const internalSafeCaveats = stripInternalGovernance(turn.answer.caveats).slice(0, 3);

  let headline = `${brandName}: ${diagnosisName}`;
  let answer = turn.answer.answer;
  let suggestedOffers = decision.offerLabels;
  let blockedActions: string[] = [];

  if (decision.type === 'fail_closed_governance') {
    headline = `${brandName}: this needs governance before it can be promoted`;
    blockedActions = [
      'Production certification is blocked.',
      'Export/circulation is blocked.',
      'Canonical source writes are blocked.',
      'Full voice activation is gated.'
    ];
    answer = `I cannot certify this as production-ready, export audit records, turn on full voice, or write source truth from the prototype. I can show the readiness workspace that separates what is demo-ready from what still needs governance.`;
  } else if (turn.routedSkillId === 'bbe_momentum_intelligence_read') {
    headline = `${brandName} is strong, but the momentum read is a warning light`;
    answer = sentenceJoin([
      `${brandName} is still a strong brand, but it is not a clean momentum story: this is not a weak-brand story; it points to relevance renewal.`,
      redSignals.length
        ? `${redSignals.join(' ')}`
        : `The current packet does not show a red BBE momentum signal.`,
      `${meaningful ? `Meaningful is ${meaningful.momentum}` : 'Meaningful needs checking'}, while Salient, Different, and Perceived Value should be read as the stabilizers or counter-signals.`
    ]);
  } else if (turn.routedSkillId === 'create_growth_provocations') {
    headline = `${brandName}: treatment recommendations should stay testable`;
    answer = `The useful move is to translate ${diagnosisName.toLowerCase()} into a treatment recommendation and the areas to inspect more closely, then attach proof needs before anyone treats it as a decision. ${turn.answer.answer}`;
  } else if (turn.routedSkillId === 'explain_diagnosis_evidence') {
    headline = `${brandName}: here is the evidence-backed read`;
    answer = `The diagnosis is ${diagnosisName}. The important part is not just the label; it is why the rule fired and what evidence would change the read. ${turn.answer.answer}`;
  }

  if (decision.type === 'answer_and_offer' && !suggestedOffers.length) {
    suggestedOffers = ['Show proof', 'Build meeting prep'];
  }

  const spokenSummary = `${headline}. ${answer}`.replace(/\s+/g, ' ').slice(0, 300);

  return {
    id: 'conversation-composed-answer-v1',
    source: 'deterministic_composer',
    model: null,
    headline,
    answer,
    spokenSummary,
    proofHighlights: proofHighlights.length ? proofHighlights : [`Grounded in ${source}.`],
    suggestedOffers,
    blockedActions,
    caveats: internalSafeCaveats
  };
}

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const maybeOutputText = (data as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) return maybeOutputText.trim();
  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') chunks.push(text);
    }
  }
  return chunks.join('\n').trim() || null;
}

function parseComposerJson(text: string): Pick<ConversationComposedAnswer, 'headline' | 'answer' | 'spokenSummary' | 'proofHighlights' | 'suggestedOffers' | 'blockedActions' | 'caveats'> | null {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<ConversationComposedAnswer>;
    if (!parsed.headline || !parsed.answer || !parsed.spokenSummary) return null;
    return {
      headline: String(parsed.headline),
      answer: String(parsed.answer),
      spokenSummary: String(parsed.spokenSummary),
      proofHighlights: Array.isArray(parsed.proofHighlights) ? parsed.proofHighlights.slice(0, 4).map(String) : [],
      suggestedOffers: Array.isArray(parsed.suggestedOffers) ? parsed.suggestedOffers.slice(0, 3).map(String) : [],
      blockedActions: Array.isArray(parsed.blockedActions) ? parsed.blockedActions.slice(0, 5).map(String) : [],
      caveats: Array.isArray(parsed.caveats) ? parsed.caveats.slice(0, 4).map(String) : []
    };
  } catch {
    return null;
  }
}

export async function composeConversationAnswer(
  question: string,
  decision: ConversationModeDecision,
  turn: AgentTurnResult,
  options: { forceDeterministic?: boolean } = {}
): Promise<ConversationComposedAnswer> {
  const fallback = deterministicCompose(question, decision, turn);
  if (options.forceDeterministic) {
    return {
      ...fallback,
      fallbackReason: 'forced_deterministic_composer'
    };
  }

  const apiKey = readSetting('OPENAI_API_KEY');
  const mode = readSetting('LLM_MODE') ?? 'mock';
  const model = readSetting('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  if (!apiKey || mode !== 'live') {
    return {
      ...fallback,
      fallbackReason: !apiKey ? 'missing_api_key' : 'llm_mode_not_live'
    };
  }

  const body: Record<string, unknown> = {
    model,
    instructions: `You are Brand Doctor's conversation composer. Write the first user-facing answer with the quality of a senior brand strategist.

Use only the supplied governed runtime result. Do not invent facts, diagnoses, treatments, source truth, approvals, exports, causality, cannibalization, portfolio migration, occasion substitution, or production readiness.

Do not lead with internal runtime, file-drop, canonical-use, memory, audit, or gate language unless the decision type is fail_closed_governance or the user explicitly asks for proof/governance.

Return valid JSON only with:
{
  "headline": string,
  "answer": string,
  "spokenSummary": string,
  "proofHighlights": string[],
  "suggestedOffers": string[],
  "blockedActions": string[],
  "caveats": string[]
}

Answer the exact question first. For simple or focused questions, keep answer to 45-90 words or at most 3 crisp bullets; expand only when the user asks for depth. Keep spokenSummary under 35 words. Make simple questions feel direct and human. For answer_and_offer, answer first then offer one or two next work options. Do not pre-answer every likely follow-up. For approval_work_order, summarize the intended work. For fail_closed_governance, be clear and firm about blocked capabilities.`,
    input: JSON.stringify({
      question,
      decision,
      brand: turn.packet.brand,
      diagnosis: turn.packet.diagnosisResult.primary.diagnosis,
      governedAnswer: turn.answer,
      markdown: agentAnswerToMarkdown(turn.answer),
      evidenceSpotlight: turn.evidenceSpotlight,
      runtimeQualityChecks: turn.runtimeQualityChecks,
      capabilities: turn.capabilities.map((capability) => ({
        id: capability.id,
        enabled: capability.enabled,
        riskLevel: capability.riskLevel,
        blockedReason: capability.blockedReason
      }))
    }, null, 2),
    max_output_tokens: 700
  };

  const reasoningEffort = readSetting('OPENAI_REASONING_EFFORT');
  const textVerbosity = readSetting('OPENAI_TEXT_VERBOSITY');
  if (reasoningEffort) body.reasoning = { effort: reasoningEffort };
  if (textVerbosity) body.text = { verbosity: textVerbosity };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { ...fallback, fallbackReason: `openai_${response.status}` };
    const text = extractOutputText(data);
    if (!text) return { ...fallback, fallbackReason: 'empty_openai_response' };
    const parsed = parseComposerJson(text);
    if (!parsed) return { ...fallback, fallbackReason: 'invalid_openai_json' };
    return {
      ...fallback,
      ...parsed,
      source: 'openai',
      model
    };
  } catch {
    return { ...fallback, fallbackReason: 'openai_request_failed' };
  }
}
