import { getScenario } from './demo-data';
import type {
  AtlasOutputRecord,
  AudienceMode,
  NegotiationEvent,
  NegotiationEventType,
  NegotiationRecord,
  Scenario,
  ScenarioDelta
} from './types';

const outputLabels: Record<AtlasOutputRecord['type'], string> = {
  current_position: 'Current Pricing And Margin Position',
  scenario_comparison: 'Scenario Comparison',
  customer_pushback_map: 'Customer Pushback Map',
  recommended_scenario_brief: 'Recommended Scenario Brief',
  cno_prep_brief: 'CNO Prep Brief',
  live_negotiation_brief: 'Live Negotiation Brief',
  kam_cam_cascade_pack: 'KAM / CAM Cascade Pack'
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function euros(value: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'EUR',
    maximumFractionDigits: 1,
    notation: Math.abs(value) >= 1000000 ? 'compact' : 'standard',
    style: 'currency'
  }).format(value);
}

export function pct(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function bps(value: number) {
  return `${value > 0 ? '+' : ''}${value} bps`;
}

export function labelEventType(type: NegotiationEventType) {
  return type.replaceAll('_', ' ');
}

export function classifyNegotiationEvent(text: string): NegotiationEventType {
  const normalized = text.toLowerCase();
  if (/(delist|sanction|visibility|remove|block|threat)/.test(normalized)) return 'sanction_threat';
  if (/(deadline|march|annual deadline|closing window|end of)/.test(normalized)) return 'deadline_pressure';
  if (/(we offered|we can give|we conceded|we propose|pepsico counter|counter)/.test(normalized)) return 'pepsico_counter';
  if (/(they ask|customer ask|asked for|wants|demand|another|extra|trade margin|discount|concession)/.test(normalized)) return 'customer_ask';
  if (/(object|push back|commodity|deflation|competitor|shelf price|margin pressure|private label|affordability|consumer)/.test(normalized)) return 'objection';
  if (/(commit|agreed|confirmed|will do|follow up)/.test(normalized)) return 'commitment';
  if (/(decision|approved|aligned)/.test(normalized)) return 'decision';
  if (/(action|owner|due|next step)/.test(normalized)) return 'action_item';
  return 'unresolved_issue';
}

export function buildNegotiationEvent(text: string): NegotiationEvent {
  const type = classifyNegotiationEvent(text);
  const interpretationByType: Record<NegotiationEventType, string> = {
    action_item: 'ATLAS heard a follow-up or owner/action signal that should be captured for the debrief.',
    commitment: 'ATLAS heard a possible commitment that should be confirmed before saving officially.',
    concession_offered: 'ATLAS heard a concession signal that may affect the active scenario.',
    customer_ask: 'ATLAS heard a customer ask that may reduce remaining room and shift probability.',
    deadline_pressure: 'ATLAS heard deadline pressure that can affect urgency and escalation posture.',
    decision: 'ATLAS heard a decision signal that should be confirmed before changing the official record.',
    objection: 'ATLAS heard pushback that should trigger an evidence response and scenario review.',
    pepsico_counter: 'ATLAS heard a PepsiCo counter-position that should be checked against red-line guardrails.',
    sanction_threat: 'ATLAS heard possible sanction or delisting language; escalation posture should move to watch.',
    unresolved_issue: 'ATLAS heard negotiation context that should remain in the live timeline for review.'
  };

  return {
    id: uid('nego-event'),
    confidence: type === 'unresolved_issue' ? 'medium' : 'high',
    interpretation: interpretationByType[type],
    official: false,
    rawQuote: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type
  };
}

function numericAskPressure(text: string) {
  const match = text.match(/(\d+(?:\.\d+)?)\s?(?:%|percent|point|points)/i);
  if (!match) return 0.8;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0.8;
  return Math.min(Math.max(value, 0.2), 5.0);
}

export function buildScenarioDelta(record: NegotiationRecord, event: NegotiationEvent, scenarioId = record.activeScenarioId): ScenarioDelta {
  const scenario = getScenario(record, scenarioId);
  const pressure = numericAskPressure(event.rawQuote);
  const sanctionMultiplier = event.type === 'sanction_threat' ? 1.8 : event.type === 'deadline_pressure' ? 1.2 : 1;
  const probabilityDrop = Math.round((event.type === 'customer_ask' ? 5 + pressure * 4 : event.type === 'objection' ? 4 : event.type === 'sanction_threat' ? 16 : 2) * sanctionMultiplier);
  const updatedProbability = Math.max(18, scenario.probabilityToLandPct - probabilityDrop);
  const redLineProximity = event.type === 'sanction_threat' || scenario.priceMovePct - pressure <= record.pricingPosition.redLinePriceIncreasePct.value
    ? 'watch'
    : scenario.redLineProximity;
  const sanctionRisk = event.type === 'sanction_threat'
    ? 'high'
    : event.type === 'deadline_pressure' && scenario.sanctionRisk === 'low'
      ? 'medium'
      : scenario.sanctionRisk;

  return {
    id: uid('scenario-delta'),
    approvalState: 'draft',
    eventId: event.id,
    grossMarginDeltaBps: Math.round(-10 * pressure * sanctionMultiplier),
    netRevenueDeltaEuros: Math.round(-520000 * pressure * sanctionMultiplier),
    priorProbabilityToLandPct: scenario.probabilityToLandPct,
    rationale: `${labelEventType(event.type)} increases pressure on ${scenario.name}. Keep it draft until CNO confirms whether the scenario should change officially.`,
    redLineProximity,
    sanctionRisk,
    scenarioId: scenario.id,
    summary: `${event.type === 'sanction_threat' ? 'Escalation watch' : 'Scenario pressure'}: probability shifts from ${scenario.probabilityToLandPct}% to ${updatedProbability}%.`,
    updatedProbabilityToLandPct: updatedProbability,
    volumeDeltaPct: Number((-0.25 * pressure * sanctionMultiplier).toFixed(1))
  };
}

function scenarioLine(scenario: Scenario) {
  return `${scenario.name}: ${pct(scenario.priceMovePct)} price move, ${euros(scenario.netRevenueImpactEuros)} NR impact, ${bps(scenario.grossMarginImpactBps)}, ${scenario.probabilityToLandPct}% probability, ${scenario.sanctionRisk} sanction risk.`;
}

export function answerNegotiationQuestion(record: NegotiationRecord, prompt: string, activeScenarioId = record.activeScenarioId) {
  const normalized = prompt.toLowerCase();
  const activeScenario = getScenario(record, activeScenarioId);
  const target = record.pricingPosition.targetPriceIncreasePct.value;
  const redLine = record.pricingPosition.redLinePriceIncreasePct.value;
  const currentAsk = record.pricingPosition.currentCustomerAskPct.value;

  if (/(red line|target|where are we|current position|baseline)/.test(normalized)) {
    return `We are at a ${pct(currentAsk)} customer ask versus a ${pct(target)} CNO target and a ${pct(redLine)} red line. The active path is ${activeScenario.name}, which keeps the price move at ${pct(activeScenario.priceMovePct)} and still above red-line watch. The key risk is permanent trade-margin give; use phasing before conceding base price.`;
  }

  if (/(another|extra|1%|one percent|what happens|scenario)/.test(normalized)) {
    return `If Carrefour asks for another 1%, treat it as a draft scenario delta before changing the official plan. On ${activeScenario.name}, that likely reduces probability to land, costs roughly EUR 0.5M in modeled NR per point of give, and moves trade-margin pressure closer to red-line watch. Recommended move: offer phased timing or promo-calendar control before permanent concession.`;
  }

  if (/(say back|respond|pushback|objection|what should we say)/.test(normalized)) {
    const pushback = record.pushbackMap[0];
    return `Say back: "${pushback.recommendedResponse}" Keep it evidence-led and avoid exposing red lines. The strongest proof is the commodity bridge plus margin waterfall; confidence is ${pushback.confidence}, so keep any unsupported commodity causality out of the customer-facing version.`;
  }

  if (/(field|cascade|safe pack|shareable)/.test(normalized)) {
    return 'I can create a field-ready scenario brief from the approved CNO scenario. It will include approved talking points, permitted levers, buyer concerns, evidence to show, escalation triggers, and a redacted source trail that removes internal thresholds, sensitive margin controls, recovery logic, and confidence gaps.';
  }

  if (/(brief|prep|memo|document|output)/.test(normalized)) {
    return `I can build a CNO prep brief from ${activeScenario.name}. It should include the current position, selected scenario, pushback forecast, concession path, watch-outs, open decisions, evidence trail, and next-best action. Official export stays gated until review.`;
  }

  return `For ${record.customer} ${record.market}, I recommend staying anchored on ${activeScenario.name}: ${activeScenario.strategy} It has ${activeScenario.probabilityToLandPct}% modeled probability to land, ${activeScenario.sanctionRisk} sanction risk, and keeps the current plan above red-line watch. Ask me to compare scenarios, capture a debrief, or create the CNO prep brief.`;
}

function redactedBodyForAudience(body: string[], audienceMode: AudienceMode) {
  if (audienceMode !== 'kam_safe' && audienceMode !== 'customer_safe') return body;
  const blocked = /(red line|fallback threshold|margin controls|confidence gap|market recovery|internal-only|sanction history)/i;
  return body
    .filter((line) => !blocked.test(line))
    .map((line) => line.replace(/CNO/g, audienceMode === 'customer_safe' ? 'PepsiCo' : 'central team'));
}

export function createAtlasOutput(input: {
  record: NegotiationRecord;
  type: AtlasOutputRecord['type'];
  audienceMode?: AudienceMode;
  sourceScenarioId?: string;
  sourceEventIds?: string[];
  delta?: ScenarioDelta | null;
}) {
  const { record, type, delta = null } = input;
  const audienceMode = input.audienceMode ?? (type === 'kam_cam_cascade_pack' ? 'kam_safe' : 'cno_internal');
  const scenario = getScenario(record, input.sourceScenarioId ?? record.activeScenarioId);
  const title = type === 'cno_prep_brief'
    ? `${record.customer} ${record.market} CNO Prep Brief`
    : type === 'recommended_scenario_brief'
      ? `${scenario.name} Recommendation`
      : outputLabels[type];

  const baseBody = [
    `Recommendation: use ${scenario.name} as the working path for ${record.customer} ${record.market}.`,
    `Scenario basis: ${scenario.strategy}`,
    `Current position: customer ask ${pct(record.pricingPosition.currentCustomerAskPct.value)}, target ${pct(record.pricingPosition.targetPriceIncreasePct.value)}, red line ${pct(record.pricingPosition.redLinePriceIncreasePct.value)}.`,
    `Financial impact: ${euros(scenario.netRevenueImpactEuros)} modeled NR, ${bps(scenario.grossMarginImpactBps)} GM, ${pct(scenario.volumeImpactPct)} volume impact.`,
    `Risk: ${scenario.sanctionRisk} sanction risk, ${scenario.redLineProximity} red-line proximity, ${scenario.confidence} confidence.`,
    delta ? `Live delta: ${delta.summary} ${euros(delta.netRevenueDeltaEuros)} NR movement, ${bps(delta.grossMarginDeltaBps)} GM movement.` : 'Live delta: no approved live scenario update yet.',
    `Next best action: defend value with proof, use phased timing before permanent concession, and escalate if sanction language becomes explicit.`,
    `Evidence trail: ${record.evidenceClaims.slice(0, 4).map((claim) => `${claim.claim} (${claim.label}, ${claim.source})`).join(' ')}`,
    `Assumptions: ${scenario.assumptions.join(' ')}`
  ];

  const cascadeBody = [
    `Approved strategy summary: hold the central value-protection path and use approved customer-safe proof.`,
    'Permitted talking points: phased timing, shopper activation, category value, and approved evidence visuals.',
    'Permitted levers: controlled promo calendar support and innovation visibility where locally approved.',
    'What not to say: do not discuss internal thresholds, sensitive margin logic, unsupported claims, or central fallback logic.',
    'Escalation trigger: any sanction, delisting, permanent trade-margin give, or base-price reopening request.'
  ];

  return {
    id: uid('atlas-output'),
    approvalState: type === 'kam_cam_cascade_pack' ? 'draft' : 'approved',
    assumptions: scenario.assumptions,
    audienceMode,
    body: redactedBodyForAudience(type === 'kam_cam_cascade_pack' ? cascadeBody : baseBody, audienceMode),
    confidence: scenario.confidence,
    exportState: 'web_only',
    sourceEventIds: input.sourceEventIds ?? [],
    sourceFreshness: record.lastSourceSync,
    sourceScenarioId: scenario.id,
    title,
    type
  } satisfies AtlasOutputRecord;
}

export function shouldCreateOutput(prompt: string): AtlasOutputRecord['type'] | null {
  const normalized = prompt.toLowerCase();
  if (/(kam|cam|cascade)/.test(normalized)) return 'kam_cam_cascade_pack';
  if (/(prep brief|cno prep)/.test(normalized)) return 'cno_prep_brief';
  if (/(recommended scenario|scenario brief|recommendation brief)/.test(normalized)) return 'recommended_scenario_brief';
  if (/(pushback|objection map)/.test(normalized)) return 'customer_pushback_map';
  if (/(scenario comparison|compare scenarios)/.test(normalized)) return 'scenario_comparison';
  if (/(live brief|next move|next-best)/.test(normalized)) return 'live_negotiation_brief';
  if (/(current position|pricing position|margin position)/.test(normalized)) return 'current_position';
  return null;
}
