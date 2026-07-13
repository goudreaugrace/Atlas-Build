'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  Circle,
  ClipboardList,
  Database,
  FileText,
  Mic,
  MicOff,
  Network,
  Play,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Waves
} from 'lucide-react';
import {
  answerNegotiationQuestion,
  bps,
  buildNegotiationEvent,
  buildScenarioDelta,
  createAtlasOutput,
  euros,
  labelEventType,
  pct,
  shouldCreateOutput
} from '@/src/lib/atlas/assistant';
import { demoNegotiation, getScenario } from '@/src/lib/atlas/demo-data';
import type { AtlasOutputRecord, EvidenceLabel, NegotiationEvent, ScenarioDelta } from '@/src/lib/atlas/types';

type AtlasNegotiationCommandOSProps = {
  autoStartLive?: boolean;
  initialBuyingGroupId?: string;
  initialSetupMetrics?: Partial<Record<LiveSetupMetricKey, number>>;
  mode?: 'command' | 'live';
  showSourceDrawer?: boolean;
};

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  meta?: string;
};

type SuggestedAction = {
  id: string;
  detail: string;
  href: string;
  label: string;
  target?: '_blank';
};

type LiveDemoState = 'idle' | 'running' | 'paused' | 'complete';

type LiveGuidance = {
  confidence: string;
  document: string;
  headline: string;
  response: string;
  scenario: string;
};

type LiveAnalystRead = {
  approval: string;
  basis: string;
  headline: string;
  margin: string;
  netRevenue: string;
  response: string;
  status: 'soft_yes' | 'approval' | 'follow_up';
};

type LiveDataPull = {
  cardType: 'data_pull' | 'visualization' | 'scenario_trigger' | 'risk_flag' | 'strategy_impact' | 'source_trust';
  confidence: 'high' | 'medium' | 'low';
  freshness: string;
  id: string;
  interpretation: string;
  keyMetric: string;
  lastUsed: string;
  owner: string;
  relevance: 'high' | 'medium' | 'low';
  status: 'ready' | 'stale' | 'needs_validation' | 'missing' | 'modeled';
  strategyImpact: string;
  sourceName: string;
  sourceType: EvidenceLabel;
  title: string;
  trigger: string;
  whyPulled: string;
};

type CapturedLiveNumber = {
  context: string;
  confidence: 'high' | 'medium' | 'low';
  label: string;
  status: 'detected' | 'confirmed' | 'needs review';
  value: string;
};

type LiveCaptureItem = {
  detail: string;
  status: 'detected' | 'confirm' | 'saved';
  title: string;
};

type LiveBuyingGroupContext = {
  activeMarket: string;
  activeScenario: string;
  alliance: string;
  buyerAskPct: number;
  confidence: 'high' | 'medium' | 'low';
  counterPct: number;
  cycle: string;
  evidencePack: string;
  freshness: string;
  id: string;
  markets: string[];
  name: string;
  redLinePct: number;
  region: string;
  sourceName: string;
  sourceType: EvidenceLabel;
  strategyFocus: string;
  targetPct: number;
  watchTopics: string[];
};

type LiveSetupMetricKey = 'buyerAskPct' | 'targetPct' | 'counterPct' | 'redLinePct';

type LiveDemoTurn = {
  at: number;
  documentType?: AtlasOutputRecord['type'];
  eventText?: string;
  guidance?: Partial<LiveGuidance>;
  meta: string;
  role: Message['role'];
  scenarioId?: string;
  text: string;
};

type LiveMode = 'off' | 'listening' | 'paused' | 'unsupported';

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results?: { [index: number]: { [index: number]: { transcript?: string } } } }) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop?: () => void;
  abort?: () => void;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function outputKind(type: AtlasOutputRecord['type']) {
  return type.replaceAll('_', ' ');
}

function liveEuros(value: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'EUR',
    maximumFractionDigits: Math.abs(value) >= 1000000 ? 1 : 0,
    notation: Math.abs(value) >= 1000000 ? 'compact' : 'standard',
    style: 'currency'
  }).format(value);
}

function statusFromDelta(delta: ScenarioDelta | null) {
  if (!delta) {
    return {
      detail: 'Ready to model customer moves, create outputs, and capture live negotiation events.',
      intensity: 'idle',
      label: 'Standing By',
      phrase: 'Negotiation context loaded'
    };
  }
  if (delta.approvalState === 'approved') {
    return {
      detail: 'The latest live scenario update is approved and available for outputs.',
      intensity: 'medium',
      label: 'Scenario Updated',
      phrase: delta.summary
    };
  }
  if (delta.approvalState === 'rejected') {
    return {
      detail: 'The latest scenario update was rejected and kept out of official guidance.',
      intensity: 'low',
      label: 'Delta Rejected',
      phrase: 'Working state preserved'
    };
  }
  return {
    detail: delta.rationale,
    intensity: delta.sanctionRisk === 'high' ? 'review' : 'high',
    label: 'Draft Scenario Delta',
    phrase: delta.summary
  };
}

function getBrowserSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return (window as unknown as {
    SpeechRecognition?: new () => VoiceRecognition;
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).SpeechRecognition ?? (window as unknown as {
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).webkitSpeechRecognition ?? null;
}

function riskPressureScore(risk: 'low' | 'medium' | 'high') {
  if (risk === 'high') return 82;
  if (risk === 'medium') return 52;
  return 24;
}

function evidenceLabelText(label: EvidenceLabel) {
  return label.replaceAll('_', ' ');
}

const LIVE_DEMO_DURATION_SECONDS = 300;

const liveBuyingGroups: LiveBuyingGroupContext[] = [
  {
    activeMarket: 'France',
    activeScenario: 'B. Counter at 3.0%',
    alliance: 'EMD',
    buyerAskPct: 4.2,
    confidence: 'high',
    counterPct: 3.0,
    cycle: '2026 annual negotiation',
    evidencePack: 'pricing corridor, private label, promo exposure, Carrefour history',
    freshness: 'Synced 2026-07-06',
    id: 'carrefour',
    markets: ['France', 'Germany', 'Belgium', 'Spain', 'Italy'],
    name: 'Carrefour',
    redLinePct: 3.0,
    region: 'Western Europe',
    sourceName: 'Mosaic monthly actuals + CNO target file',
    sourceType: 'sourced_fact',
    strategyFocus: 'Protect France base architecture while using targeted Q4 value levers.',
    targetPct: 3.5,
    watchTopics: ['buyer asks', 'numbers', 'private label', 'promo threats', 'volume commitments', 'decisions', 'next steps']
  },
  {
    activeMarket: 'Germany',
    activeScenario: 'A. Hold corridor with volume bridge',
    alliance: 'Eurelec',
    buyerAskPct: 3.8,
    confidence: 'medium',
    counterPct: 2.9,
    cycle: '2026 annual negotiation',
    evidencePack: 'German corridor, hard-discount comparison, cross-market offsets, 2025 close pattern',
    freshness: 'Prototype 2026-07-07',
    id: 'everest',
    markets: ['Germany', 'Austria', 'Switzerland', 'France'],
    name: 'Everest Buying Group',
    redLinePct: 2.6,
    region: 'DACH + Western Europe',
    sourceName: 'ATLAS synthetic DACH buying-group packet',
    sourceType: 'modeled_estimate',
    strategyFocus: 'Test whether Germany can absorb a narrower price move without weakening total group margin.',
    targetPct: 3.2,
    watchTopics: ['cross-market asks', 'hard-discount pressure', 'volume proof', 'margin floors', 'approval needs', 'country exceptions']
  },
  {
    activeMarket: 'Belgium',
    activeScenario: 'C. Tradeoff watch across Benelux',
    alliance: 'EMD',
    buyerAskPct: 3.6,
    confidence: 'medium',
    counterPct: 2.8,
    cycle: '2026 buying alliance reset',
    evidencePack: 'Benelux guardrails, promo calendar, private label pressure, alliance history',
    freshness: 'Updated 2026-07-05',
    id: 'emd',
    markets: ['Belgium', 'Netherlands', 'Luxembourg', 'France'],
    name: 'EMD Buying Alliance',
    redLinePct: 2.5,
    region: 'Benelux + France',
    sourceName: 'Buying alliance planning stand-in',
    sourceType: 'user_assumption',
    strategyFocus: 'Keep Benelux concessions local and prevent alliance-wide replication.',
    targetPct: 3.1,
    watchTopics: ['alliance spillover', 'country carve-outs', 'promo funding', 'local margin', 'decision owner', 'follow-up tasks']
  },
  {
    activeMarket: 'France',
    activeScenario: 'B. Value story plus phasing',
    alliance: 'Independent France',
    buyerAskPct: 4.0,
    confidence: 'medium',
    counterPct: 3.1,
    cycle: '2026 annual negotiation',
    evidencePack: 'France price corridor, shopper value story, promo windows, customer debriefs',
    freshness: 'Captured 2026-07-03',
    id: 'eleclerc',
    markets: ['France', 'Portugal', 'Poland'],
    name: 'E.Leclerc',
    redLinePct: 2.9,
    region: 'France-led',
    sourceName: 'Latest debrief extraction',
    sourceType: 'user_assumption',
    strategyFocus: 'Separate affordability objection from permanent trade margin expansion.',
    targetPct: 3.4,
    watchTopics: ['affordability', 'shopper value', 'promo windows', 'price image', 'commitments', 'missing facts']
  },
  {
    activeMarket: 'France',
    activeScenario: 'D. Controlled local support',
    alliance: 'Francap / local buying group',
    buyerAskPct: 3.7,
    confidence: 'low',
    counterPct: 3.0,
    cycle: '2026 annual negotiation',
    evidencePack: 'local trade spend, store execution, price image, source gaps',
    freshness: 'Gap logged 2026-07-07',
    id: 'systeme-u',
    markets: ['France'],
    name: 'Systeme U',
    redLinePct: 2.8,
    region: 'France',
    sourceName: 'Sanitized packet not yet available',
    sourceType: 'unknown_gap',
    strategyFocus: 'Use the live room to capture missing local economics before approving support.',
    targetPct: 3.3,
    watchTopics: ['local asks', 'missing data', 'store execution', 'trade spend', 'approval blockers', 'next steps']
  }
];

const liveSetupMetricFields: Array<{
  description: string;
  key: LiveSetupMetricKey;
  label: string;
  query: string;
}> = [
  {
    description: 'Latest customer position',
    key: 'buyerAskPct',
    label: 'Buyer ask',
    query: 'ask'
  },
  {
    description: 'PepsiCo landing goal',
    key: 'targetPct',
    label: 'Target',
    query: 'target'
  },
  {
    description: 'Recommended opening reply',
    key: 'counterPct',
    label: 'Counter',
    query: 'counter'
  },
  {
    description: 'Do-not-cross boundary',
    key: 'redLinePct',
    label: 'Red line',
    query: 'red'
  }
];

const liveDemoTurns: LiveDemoTurn[] = [
  {
    at: 0,
    meta: 'ATLAS',
    role: 'assistant',
    text: 'Transcript started. I am listening for buyer moves, numbers, private-label pressure, sanction language, commitments, and decisions. I will pull only the data that becomes relevant and draft the debrief as we go.',
    guidance: {
      confidence: 'high',
      document: 'Live negotiation brief opened',
      headline: 'Opening posture',
      response: 'Monitor value-protection strategy, pricing corridor movement, risk signals, and evidence changes as the conversation develops.',
      scenario: 'B. Counter at 3.0%'
    }
  },
  {
    at: 18,
    eventText: 'Carrefour says France needs to be closer to 4.2% and cites private label pressure in the category.',
    meta: 'Marie Dupont · Carrefour',
    role: 'user',
    text: 'We appreciate the movement, but France needs to be closer to 4.2%. Private label is putting a lot of pressure on the category.',
    guidance: {
      document: 'Customer ask logged',
      headline: 'Counteroffer plus affordability objection',
      response: 'Market-scope uncertainty added. Pull France guardrails, buying-group spillover watch, and private-label pressure evidence.',
      scenario: 'Scenario B under pressure'
    }
  },
  {
    at: 42,
    eventText: 'PepsiCo asks Carrefour to clarify whether the 4.2% ask is France-specific or applies across the buying group.',
    meta: 'Sarah Parker · PepsiCo',
    role: 'user',
    text: 'Can you clarify whether the 4.2% is specific to France or across the full buying group?',
    guidance: {
      confidence: 'medium-high',
      document: 'Clarifying question captured',
      headline: 'Good clarification',
      response: 'Market scope clarified. Keep tracking whether this is France-only pressure or broader buying-group exposure.',
      scenario: 'Keep Scenario B active'
    }
  },
  {
    at: 66,
    eventText: 'Carrefour says the immediate pressure is France but the broader Western Europe position is under review.',
    meta: 'Marie Dupont · Carrefour',
    role: 'user',
    text: 'The immediate pressure is France, but we are also reviewing the broader Western Europe position.',
    guidance: {
      document: 'Market-scope signal added',
      headline: 'Market-specific ask with alliance spillover',
      response: 'France remains the explicit ask. Western Europe is now a strategy watch item for cross-market tradeoff exposure.',
      scenario: 'Scenario B plus cross-market watch'
    }
  },
  {
    at: 92,
    eventText: 'Carrefour signals it may rethink promotional space next quarter if PepsiCo does not move closer.',
    meta: 'Marie Dupont · Carrefour',
    role: 'user',
    text: 'If we cannot get closer, we may need to rethink how much promotional space we can support next quarter.',
    guidance: {
      confidence: 'medium',
      document: 'Sanction watch note added',
      headline: 'Promo exclusion risk detected',
      response: 'Promo exposure became material. Pull Q4 promo history, sanction pattern, and volume breakeven evidence.',
      scenario: 'Escalation watch'
    }
  },
  {
    at: 118,
    eventText: 'PepsiCo asks which promotional windows would be affected and what volume commitment would preserve participation.',
    meta: 'Sarah Parker · PepsiCo',
    role: 'user',
    text: 'Understood. Which promotional windows would be affected, and what volume commitment would preserve participation?',
    guidance: {
      document: 'Mitigation question captured',
      headline: 'Right next move',
      response: 'Promo exposure, sanction history, and volume breakeven are now the active data pulls.',
      scenario: 'Scenario B with sanction watch'
    }
  },
  {
    at: 148,
    eventText: 'Carrefour says Q4 is the most important window and says it can discuss maintaining participation if PepsiCo moves toward 3.2%.',
    meta: 'Marie Dupont · Carrefour',
    role: 'user',
    text: 'Q4 is the most important window. If you can move toward 3.2%, we can discuss maintaining participation.',
    guidance: {
      confidence: 'medium',
      document: 'Conditional commitment captured',
      headline: '3.2% fallback needs validation',
      response: '3.2% is now a draft scenario input. Validate volume commitment and approved Q4 support windows before treating it as viable.',
      scenario: 'Scenario D preview'
    }
  },
  {
    at: 176,
    meta: 'ATLAS',
    role: 'assistant',
    text: 'Data scientist read: 3.2% is outside the primary 3.0% counter but may be defensible only with Q4 phasing and validated volume upside. Germany offset remains the blocker before it can be treated as approved.',
    guidance: {
      document: 'Scenario delta updated',
      headline: 'War-room read',
      response: '3.2% remains a draft strategy branch until volume commitment and Germany offset are validated.',
      scenario: 'Scenario D requires finance'
    }
  },
  {
    at: 208,
    eventText: 'PepsiCo offers controlled promo calendar support in back-to-school and Q4 while keeping the base price architecture intact.',
    meta: 'PepsiCo',
    role: 'user',
    text: 'We can discuss targeted support in back-to-school and Q4, but we need to keep the base price architecture intact.',
    guidance: {
      document: 'Negotiation brief updated',
      headline: 'Concession path controlled',
      response: 'Targeted support is logged as a controlled value lever. Track whether the base architecture remains intact.',
      scenario: 'Landing path improving'
    }
  },
  {
    at: 238,
    eventText: 'Carrefour says it can consider phasing and targeted shopper support if PepsiCo confirms the evidence pack and sends a clear cascade for local teams.',
    meta: 'Customer',
    role: 'user',
    text: 'We can consider phasing and targeted shopper support if you send the evidence pack and make the local team guidance clear.',
    guidance: {
      confidence: 'high',
      document: 'Local cascade requested',
      headline: 'Conditional commitment',
      response: 'Evidence pack and local guidance are now output requirements. Strategy draft shifts toward KAM-safe cascade readiness.',
      scenario: 'Scenario B likely landing'
    }
  },
  {
    at: 264,
    documentType: 'kam_cam_cascade_pack',
    meta: 'ATLAS',
    role: 'assistant',
    text: 'I created the KAM-safe pack. It includes approved field data, permitted levers, escalation triggers, and redacts internal thresholds and margin controls.',
    guidance: {
      document: 'KAM-safe pack created',
      headline: 'Field pack ready',
      response: 'Field cascade draft created from approved evidence, permitted levers, and escalation triggers.',
      scenario: 'Scenario B ready for cascade'
    }
  },
  {
    at: 300,
    documentType: 'cno_prep_brief',
    meta: 'ATLAS',
    role: 'assistant',
    text: 'Transcript session complete. I created the CNO prep brief from the live transcript, structured events, scenario deltas, strategy draft, evidence trail, and KAM-safe cascade.',
    guidance: {
      confidence: 'high',
      document: 'CNO prep brief created',
      headline: 'Session complete',
      response: 'Final draft strategy: Scenario B with locked phasing, approved promo windows, renewed visibility-risk escalation, and evidence-backed KAM-safe cascade.',
      scenario: 'Recommended final path'
    }
  }
];

function formatDemoTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function AtlasNegotiationCommandOS({ autoStartLive = false, initialBuyingGroupId, initialSetupMetrics, mode = 'command', showSourceDrawer = false }: AtlasNegotiationCommandOSProps) {
  const record = demoNegotiation;
  const isLiveWorkspace = mode === 'live';
  const liveRoute = `/negotiation/${record.id}/live`;
  const scenarioRoute = `/negotiation/${record.id}?panel=scenario#scenario`;
  function strategyStressTestHref(extraParams?: Record<string, string>) {
    const params = new URLSearchParams({ panel: 'scenario' });
    Object.entries(extraParams ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/negotiation/${record.id}?${params.toString()}#scenario`;
  }
  const routeSelectedBuyingGroupId = useMemo(
    () => liveBuyingGroups.some((group) => group.id === initialBuyingGroupId) ? initialBuyingGroupId! : liveBuyingGroups[0].id,
    [initialBuyingGroupId]
  );
  const routeSetupMetricOverride = useMemo(() => {
    const next: Partial<Pick<LiveBuyingGroupContext, LiveSetupMetricKey>> = {};
    liveSetupMetricFields.forEach((field) => {
      const value = initialSetupMetrics?.[field.key];
      if (typeof value === 'number') {
        next[field.key] = value;
      }
    });
    return next;
  }, [initialSetupMetrics]);
  const [selectedBuyingGroupId, setSelectedBuyingGroupId] = useState(routeSelectedBuyingGroupId);
  const [setupMetricOverrides, setSetupMetricOverrides] = useState<Record<string, Partial<Pick<LiveBuyingGroupContext, LiveSetupMetricKey>>>>(() => (
    Object.keys(routeSetupMetricOverride).length > 0
      ? { [routeSelectedBuyingGroupId]: routeSetupMetricOverride }
      : {}
  ));
  const [activeScenarioId, setActiveScenarioId] = useState(record.activeScenarioId);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: isLiveWorkspace
        ? autoStartLive
          ? `Live transcript started for ${record.customer} ${record.market}. I am capturing exact language, detecting buyer signals, pulling relevant data, updating scenario deltas, and preparing the debrief.`
          : 'Prepare Live Negotiator is loaded. Confirm the buying group, market scope, evidence, and watch mode before starting the transcript.'
        : `ATLAS is loaded on ${record.customer} ${record.market}. We are using ${getScenario(record).name} as the working scenario. Talk through scenarios here, or open the buying-group overview, scenario studio, or explicit Live Assist workspace.`,
      meta: 'ATLAS'
    }
  ]);
  const [liveMode, setLiveMode] = useState<LiveMode>(() => autoStartLive && isLiveWorkspace ? 'listening' : 'off');
  const [liveEvents, setLiveEvents] = useState<NegotiationEvent[]>([]);
  const [scenarioDelta, setScenarioDelta] = useState<ScenarioDelta | null>(null);
  const [outputs, setOutputs] = useState<AtlasOutputRecord[]>([
    createAtlasOutput({ record, type: 'current_position' }),
    createAtlasOutput({ record, type: 'scenario_comparison' })
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [liveDemoState, setLiveDemoState] = useState<LiveDemoState>(() => autoStartLive && isLiveWorkspace ? 'running' : 'idle');
  const [liveDemoElapsed, setLiveDemoElapsed] = useState(0);
  const [liveGuidance, setLiveGuidance] = useState<LiveGuidance>({
    confidence: 'ready',
    document: 'No live document yet',
    headline: 'Ready to assist',
    response: 'Start the transcript to watch ATLAS listen, structure the negotiation, pull live data, update scenario deltas, draft strategy changes, and create documents.',
    scenario: getScenario(record).name
  });
  const [proposalText, setProposalText] = useState('');
  const [selectedDataPullId, setSelectedDataPullId] = useState<string | null>(null);
  const [pinnedDataPullIds, setPinnedDataPullIds] = useState<string[]>([]);
  const [savedDataPullIds, setSavedDataPullIds] = useState<string[]>([]);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(showSourceDrawer);
  const [voiceNote, setVoiceNote] = useState(() => isLiveWorkspace
    ? autoStartLive
      ? 'Transcript is running. ATLAS is listening, structuring events, pulling live data, updating strategy drafts, and creating documents.'
      : 'Pre-session setup is ready. Start the transcript when the meeting begins.'
    : 'Voice command is off. Use the mic to dictate a question or start a flow.');
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const liveDemoTimerRef = useRef<number | null>(null);
  const liveDemoTurnIndexRef = useRef(0);
  const liveModeRef = useRef<LiveMode>('off');
  const scenarioDeltaRef = useRef<ScenarioDelta | null>(null);
  const autoStartAttemptedRef = useRef(false);
  const activeScenario = useMemo(() => getScenario(record, activeScenarioId), [activeScenarioId, record]);
  const baseSelectedBuyingGroup = useMemo(
    () => liveBuyingGroups.find((group) => group.id === selectedBuyingGroupId) ?? liveBuyingGroups[0],
    [selectedBuyingGroupId]
  );
  const selectedBuyingGroup = useMemo(
    () => ({
      ...baseSelectedBuyingGroup,
      ...(setupMetricOverrides[baseSelectedBuyingGroup.id] ?? {})
    }),
    [baseSelectedBuyingGroup, setupMetricOverrides]
  );
  const latestOutput = outputs[0];
  const thoughtCore = statusFromDelta(scenarioDelta);
  const showLiveSetup = isLiveWorkspace && liveDemoState === 'idle' && liveMode === 'off' && liveEvents.length === 0 && !scenarioDelta;
  const approvalLevers = useMemo(() => (
    record.levers.filter((lever) => activeScenario.levers.includes(lever.id) && lever.availability === 'approval_required')
  ), [activeScenario.levers, record.levers]);
  const liveAnalystRead: LiveAnalystRead = useMemo(() => {
    const sanctionRisk = scenarioDelta?.sanctionRisk ?? activeScenario.sanctionRisk;
    const marginBps = scenarioDelta?.grossMarginDeltaBps ?? activeScenario.grossMarginImpactBps;
    const netRevenueEuros = scenarioDelta?.netRevenueDeltaEuros ?? activeScenario.netRevenueImpactEuros;
    const needsApproval = scenarioDelta?.approvalState === 'draft' || approvalLevers.length > 0;
    const status: LiveAnalystRead['status'] = sanctionRisk === 'high'
      ? 'follow_up'
      : needsApproval
        ? 'approval'
        : 'soft_yes';

    if (status === 'follow_up') {
      return {
        approval: 'Escalate before agreeing',
        basis: 'Customer language or modeled risk is outside the quick-yes lane.',
        headline: 'Follow-up required',
        margin: bps(marginBps),
        netRevenue: liveEuros(netRevenueEuros),
        response: 'Customer language or modeled risk is outside the quick-analysis lane. Capture the exact ask, separate the objection from the sanction signal, and keep the update in draft state.',
        status
      };
    }

    if (status === 'approval') {
      return {
        approval: approvalLevers.length ? `${approvalLevers.length} approval lever(s)` : 'Draft delta needs CNO approval',
        basis: 'The proposal may work if kept inside approved phasing, promo, or local support guardrails.',
        headline: 'Soft yes with approval gate',
        margin: bps(marginBps),
        netRevenue: liveEuros(netRevenueEuros),
        response: 'The proposal may work if kept inside approved support windows and guardrails. Keep the scenario update in draft until validated.',
        status
      };
    }

    return {
      approval: 'Inside current working guardrails',
      basis: 'Modeled impact stays compatible with the active value-protection path.',
      headline: 'Soft yes path',
      margin: bps(marginBps),
      netRevenue: liveEuros(netRevenueEuros),
      response: 'Modeled impact stays compatible with the active value-protection path if the base architecture stays intact and the second phase is locked.',
      status
    };
  }, [activeScenario, approvalLevers.length, scenarioDelta]);
  const liveOn = liveMode === 'listening';
  const latestLiveEvent = liveEvents[0];
  const liveSessionStatus = liveOn
    ? 'Listening'
    : liveMode === 'paused'
      ? 'Paused'
      : liveDemoState === 'complete'
        ? 'Ended'
        : 'Ready';
  const currentBuyerAsk = pct(selectedBuyingGroup.buyerAskPct);
  const targetGap = (selectedBuyingGroup.buyerAskPct - selectedBuyingGroup.targetPct).toFixed(1);
  const redLineGap = (selectedBuyingGroup.buyerAskPct - selectedBuyingGroup.redLinePct).toFixed(1);
  const liveDataPulls: LiveDataPull[] = useMemo(() => {
    const privateLabelEvidence = record.evidenceClaims.find((claim) => claim.id === 'trade-margin-map');
    const marginEvidence = record.evidenceClaims.find((claim) => claim.id === 'margin-waterfall');
    const sanctionEvidence = record.evidenceClaims.find((claim) => claim.id === 'sanction-history');
    const pulls: LiveDataPull[] = [
      {
        cardType: 'data_pull',
        confidence: 'high',
        freshness: selectedBuyingGroup.freshness,
        id: 'pricing-corridor',
        interpretation: `Buyer ask is ${targetGap} pts above target and ${redLineGap} pts above the red-line boundary. This is the primary pricing-corridor tension to monitor live.`,
        keyMetric: `${currentBuyerAsk} ask vs ${pct(selectedBuyingGroup.counterPct)} recommended counter`,
        lastUsed: 'Live Strategy Draft v2',
        owner: 'Finance / Pricing',
        relevance: 'high',
        status: 'ready',
        strategyImpact: 'Reinforces current counter strategy; no official red-line change.',
        sourceName: selectedBuyingGroup.sourceName,
        sourceType: selectedBuyingGroup.sourceType,
        title: 'Target / red-line comparison',
        trigger: latestLiveEvent ? labelEventType(latestLiveEvent.type) : 'session setup',
        whyPulled: latestLiveEvent ? 'Buyer language changed the live pricing read.' : 'Session setup loaded the current pricing corridor.'
      },
      {
        cardType: 'visualization',
        confidence: privateLabelEvidence?.confidence ?? 'medium',
        freshness: privateLabelEvidence?.freshness ?? 'Captured 2026-03-22',
        id: 'private-label-pressure',
        interpretation: 'Private-label pressure is now active in the conversation. ATLAS is pulling competitive shelf position and affordability context before changing the scenario.',
        keyMetric: 'Private-label index gap flagged for France',
        lastUsed: 'Objection map v1',
        owner: 'Category / RGM',
        relevance: latestLiveEvent?.rawQuote.toLowerCase().includes('private label') ? 'high' : 'medium',
        status: privateLabelEvidence?.label === 'user_assumption' ? 'needs_validation' : 'modeled',
        strategyImpact: 'Supports defending branded premium while increasing affordability pressure watch.',
        sourceName: privateLabelEvidence?.source ?? 'Latest debrief extraction',
        sourceType: privateLabelEvidence?.label ?? 'user_assumption',
        title: 'Private label pressure',
        trigger: 'buyer objection',
        whyPulled: 'Buyer referenced private label or affordability pressure.'
      },
      {
        cardType: 'risk_flag',
        confidence: sanctionEvidence?.confidence ?? 'medium',
        freshness: sanctionEvidence?.freshness ?? 'Entered 2026-03-22',
        id: 'promo-sanction-risk',
        interpretation: 'Promotional-space language increases sanction risk and should pull Q4 exposure, prior sanction history, and volume breakeven into view.',
        keyMetric: 'Q4 promo exposure is the live sanction watch',
        lastUsed: 'Risk watch v1',
        owner: 'KAM / Promo planning',
        relevance: latestLiveEvent?.type === 'sanction_threat' ? 'high' : 'medium',
        status: 'needs_validation',
        strategyImpact: 'Raises promo execution exposure; mitigation plan may need to be added to the strategy draft.',
        sourceName: sanctionEvidence?.source ?? 'Debrief plus response deadline rule',
        sourceType: sanctionEvidence?.label ?? 'user_assumption',
        title: 'Promo / sanction exposure',
        trigger: 'feature visibility language',
        whyPulled: 'Buyer language suggested promotional visibility or sanction exposure.'
      },
      {
        cardType: 'source_trust',
        confidence: 'low',
        freshness: 'Gap logged 2026-07-07',
        id: 'finance-validation-gap',
        interpretation: 'This assumption is the blocker before using 3.2% with phasing. Capture as a finance follow-up, not a buyer commitment.',
        keyMetric: record.blockingIssue,
        lastUsed: 'Scenario B; Strategy Draft v2',
        owner: 'Finance',
        relevance: 'high',
        status: 'missing',
        strategyImpact: 'Blocks fallback approval until the volume or offset assumption is validated.',
        sourceName: 'Finance validation gap',
        sourceType: 'unknown_gap',
        title: 'Open validation needed',
        trigger: 'volume or offset ask',
        whyPulled: 'Fallback strategy depends on a data point that is not validated.'
      }
    ];

    if (scenarioDelta) {
      pulls.unshift({
        cardType: 'scenario_trigger',
        confidence: scenarioDelta.sanctionRisk === 'high' ? 'medium' : 'high',
        freshness: 'Updated from latest captured event',
        id: `scenario-${scenarioDelta.id}`,
        interpretation: `${scenarioDelta.summary} Draft impact is ${liveEuros(scenarioDelta.netRevenueDeltaEuros)} NR and ${bps(scenarioDelta.grossMarginDeltaBps)} GM before approval.`,
        keyMetric: `${scenarioDelta.updatedProbabilityToLandPct}% probability to land`,
        lastUsed: `Live Strategy Draft ${liveEvents.length + 1}`,
        owner: 'ATLAS scenario model',
        relevance: 'high',
        status: scenarioDelta.approvalState === 'draft' ? 'needs_validation' : 'ready',
        strategyImpact: 'Adds a draft strategy branch pending approval and validation.',
        sourceName: marginEvidence?.source ?? 'ATLAS live scenario model v0.1',
        sourceType: marginEvidence?.label ?? 'modeled_estimate',
        title: 'Instant impact model',
        trigger: latestLiveEvent ? labelEventType(latestLiveEvent.type) : 'captured update',
        whyPulled: 'A live number, concession, or risk signal triggered scenario modeling.'
      });
    }

    return pulls.slice(0, 5);
  }, [currentBuyerAsk, latestLiveEvent, liveEvents.length, record.blockingIssue, record.evidenceClaims, redLineGap, scenarioDelta, selectedBuyingGroup.counterPct, selectedBuyingGroup.freshness, selectedBuyingGroup.sourceName, selectedBuyingGroup.sourceType, targetGap]);
  const liveStrategyDraft = useMemo(() => {
    const probabilityShift = scenarioDelta
      ? scenarioDelta.updatedProbabilityToLandPct - scenarioDelta.priorProbabilityToLandPct
      : 0;
    const risk = scenarioDelta?.sanctionRisk ?? activeScenario.sanctionRisk;
    return {
      confidence: scenarioDelta ? scenarioDelta.sanctionRisk === 'high' ? 'medium' : 'high' : activeScenario.confidence,
      detail: scenarioDelta
        ? `Draft shifted ${probabilityShift >= 0 ? '+' : ''}${probabilityShift} pts probability. It is still tied to PepsiCo value protection and the ${selectedBuyingGroup.name} negotiation plan.`
        : `Monitoring ${selectedBuyingGroup.activeScenario} against PepsiCo value protection, market architecture, and the ${selectedBuyingGroup.name} negotiation plan.`,
      freshness: scenarioDelta ? 'Updated from latest captured event' : selectedBuyingGroup.freshness,
      headline: scenarioDelta ? 'Strategy draft updated' : 'Strategy draft ready',
      risk,
      sourceName: scenarioDelta ? 'ATLAS live strategy draft' : selectedBuyingGroup.sourceName,
      sourceType: scenarioDelta ? 'modeled_estimate' as EvidenceLabel : selectedBuyingGroup.sourceType,
      title: scenarioDelta ? scenarioDelta.summary : selectedBuyingGroup.strategyFocus
    };
  }, [activeScenario.confidence, activeScenario.sanctionRisk, scenarioDelta, selectedBuyingGroup.activeScenario, selectedBuyingGroup.freshness, selectedBuyingGroup.name, selectedBuyingGroup.sourceName, selectedBuyingGroup.sourceType, selectedBuyingGroup.strategyFocus]);
  const activeDataPull = liveDataPulls.find((pull) => pull.id === selectedDataPullId) ?? liveDataPulls[0];
  const secondaryDataPulls = liveDataPulls.filter((pull) => pull.id !== activeDataPull?.id).slice(0, 2);
  const liveSignalRailItems = liveEvents.length
    ? liveEvents.slice(0, 7).map((event, index) => ({
      confidence: event.confidence,
      id: event.id,
      label: labelEventType(event.type),
      pullId: liveDataPulls[Math.min(index, liveDataPulls.length - 1)]?.id ?? liveDataPulls[0]?.id,
      severity: event.type === 'sanction_threat' ? 'high' : event.type === 'customer_ask' || event.type === 'concession_offered' ? 'medium' : 'low',
      status: event.official ? 'saved' : index === 0 ? 'new' : 'needs validation',
      timestamp: event.timestamp
    }))
    : liveDataPulls.slice(0, 5).map((pull, index) => ({
      confidence: pull.confidence,
      id: pull.id,
      label: pull.title,
      pullId: pull.id,
      severity: pull.relevance === 'high' ? 'high' : pull.relevance === 'medium' ? 'medium' : 'low',
      status: index === 0 ? 'new' : pull.status.replaceAll('_', ' '),
      timestamp: index === 0 ? 'Now' : `T-${index + 1}`
    }));
  const strategyUpdates = [
    scenarioDelta ? `${scenarioDelta.summary}; approval state is ${scenarioDelta.approvalState}.` : `${selectedBuyingGroup.activeScenario} remains the active strategy lane.`,
    `${liveDataPulls.filter((pull) => pull.relevance === 'high').length} high-relevance data pull(s) are shaping the current read.`,
    `${pinnedDataPullIds.length} data point(s) pinned to the live strategy draft.`
  ];
  const strategyValidationNeeds = liveDataPulls
    .filter((pull) => pull.status === 'needs_validation' || pull.status === 'missing' || pull.status === 'stale')
    .map((pull) => `${pull.title}: ${pull.status.replaceAll('_', ' ')}`)
    .slice(0, 3);
  const capturedNumbers: CapturedLiveNumber[] = useMemo(() => [
    {
      confidence: 'high',
      context: `Buyer latest ask for ${selectedBuyingGroup.activeMarket} ${selectedBuyingGroup.cycle}.`,
      label: 'Buyer ask',
      status: 'confirmed',
      value: currentBuyerAsk
    },
    {
      confidence: 'high',
      context: 'CNO target loaded from current position.',
      label: 'Target',
      status: 'confirmed',
      value: pct(selectedBuyingGroup.targetPct)
    },
    {
      confidence: 'high',
      context: 'Internal boundary. Never include in buyer-facing language.',
      label: 'Red line',
      status: 'confirmed',
      value: pct(selectedBuyingGroup.redLinePct)
    },
    {
      confidence: 'medium',
      context: 'ATLAS recommended live counter path.',
      label: 'Recommended counter',
      status: 'detected',
      value: pct(selectedBuyingGroup.counterPct)
    },
    {
      confidence: 'medium',
      context: 'Negotiation close window from current record.',
      label: 'Response deadline',
      status: 'needs review',
      value: record.responseDeadline
    }
  ], [currentBuyerAsk, record.responseDeadline, selectedBuyingGroup.activeMarket, selectedBuyingGroup.counterPct, selectedBuyingGroup.cycle, selectedBuyingGroup.redLinePct, selectedBuyingGroup.targetPct]);
  const liveCaptures: LiveCaptureItem[] = useMemo(() => [
    {
      detail: latestLiveEvent?.rawQuote ?? 'Waiting for the next buyer statement or pasted meeting note.',
      status: latestLiveEvent ? 'detected' : 'confirm',
      title: latestLiveEvent ? labelEventType(latestLiveEvent.type) : 'Buyer signal'
    },
    {
      detail: scenarioDelta ? scenarioDelta.summary : `Keep ${activeScenario.name} active until a new number or sanction changes the lane.`,
      status: scenarioDelta ? 'confirm' : 'saved',
      title: 'Scenario implication'
    },
    {
      detail: `Capture whether ${selectedBuyingGroup.name} can maintain the priority commercial commitment at the ${pct(selectedBuyingGroup.counterPct)} counter, or whether any movement requires finance-approved phasing.`,
      status: 'confirm',
      title: 'Decision to confirm'
    },
    {
      detail: record.blockingIssue,
      status: 'detected',
      title: 'Missing information'
    }
  ], [activeScenario.name, latestLiveEvent, record.blockingIssue, scenarioDelta, selectedBuyingGroup.counterPct, selectedBuyingGroup.name]);
  const onboardingRequiredItems = [
    { label: 'Buying group', value: selectedBuyingGroup.name },
    { label: 'Region', value: selectedBuyingGroup.region },
    { label: 'Negotiation stage', value: record.stage },
    { label: 'Markets', value: selectedBuyingGroup.markets.length ? selectedBuyingGroup.markets.join(', ') : '' },
    { label: 'Target', value: selectedBuyingGroup.targetPct },
    { label: 'Red line', value: selectedBuyingGroup.redLinePct },
    { label: 'Buyer ask / position', value: selectedBuyingGroup.buyerAskPct },
    { label: 'Debrief output', value: 'full debrief' }
  ];
  const missingOnboardingItems = onboardingRequiredItems.filter((item) => item.value === '' || item.value === null || item.value === undefined);
  const selectedLiveParams = new URLSearchParams({
    ask: String(selectedBuyingGroup.buyerAskPct),
    counter: String(selectedBuyingGroup.counterPct),
    group: selectedBuyingGroup.id,
    red: String(selectedBuyingGroup.redLinePct),
    target: String(selectedBuyingGroup.targetPct)
  });
  const selectedLiveStartUrl = `${liveRoute}?${selectedLiveParams.toString()}&autostart=1`;
  const selectedLiveSourceUrl = `${selectedLiveStartUrl}&source=1`;

  useEffect(() => {
    setSelectedBuyingGroupId(routeSelectedBuyingGroupId);
    if (Object.keys(routeSetupMetricOverride).length === 0) return;
    setSetupMetricOverrides((current) => ({
      ...current,
      [routeSelectedBuyingGroupId]: routeSetupMetricOverride
    }));
  }, [routeSelectedBuyingGroupId, routeSetupMetricOverride]);

  useEffect(() => {
    if (!showLiveSetup) return undefined;

    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-live-setup-metric]'));
    const handleInput = (event: Event) => {
      const target = event.currentTarget as HTMLInputElement;
      const key = target.dataset.liveSetupMetric as LiveSetupMetricKey | undefined;
      if (!key) return;
      updateSetupMetric(key, target.value);
    };

    inputs.forEach((input) => input.addEventListener('input', handleInput));
    return () => {
      inputs.forEach((input) => input.removeEventListener('input', handleInput));
    };
  }, [selectedBuyingGroup.id, showLiveSetup]);

  useEffect(() => {
    liveModeRef.current = liveMode;
  }, [liveMode]);

  useEffect(() => {
    scenarioDeltaRef.current = scenarioDelta;
  }, [scenarioDelta]);

  useEffect(() => {
    if (!autoStartLive || !isLiveWorkspace || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    window.setTimeout(() => startLiveDemo(), 0);
  }, [autoStartLive, isLiveWorkspace]);

  useEffect(() => () => {
    clearLiveDemoTimer();
    stopRecognition();
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, liveEvents]);

  function addMessage(message: Omit<Message, 'id'>) {
    setMessages((current) => [...current, { ...message, id: uid(message.role) }]);
  }

  function cleanSpeechText(text: string) {
    return text
      .replace(/\bATLAS\b/g, 'Atlas')
      .replace(/\bCNO\b/g, 'C N O')
      .replace(/\bKAM\b/g, 'K A M')
      .replace(/\bCAM\b/g, 'C A M')
      .replace(/\bNR\b/g, 'net revenue')
      .replace(/\bGM\b/g, 'gross margin')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function speakAssistantResponse(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    const speech = cleanSpeechText(text);
    if (!speech) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speech);
    const preferredVoice = window.speechSynthesis.getVoices().find((voice) => /samantha|victoria|zira|google us english|female/i.test(voice.name))
      ?? window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = .96;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function addAssistantResponse(text: string, actions: SuggestedAction[] = []) {
    addMessage({ role: 'assistant', meta: 'ATLAS', text });
    setSuggestedActions(actions);
    speakAssistantResponse(text);
  }

  function togglePinnedDataPull(id: string) {
    setPinnedDataPullIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [id, ...current]);
  }

  function toggleSavedDataPull(id: string) {
    setSavedDataPullIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [id, ...current]);
  }

  function inspectDataPullSource(id: string) {
    setSelectedDataPullId(id);
    setShowTranscriptDrawer(true);
  }

  function stopRecognition() {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    try {
      recognition?.abort?.();
      recognition?.stop?.();
    } catch {
      // Browser speech recognition can throw if it already ended.
    }
  }

  function createDeltaFromText(text: string) {
    const event = buildNegotiationEvent(text);
    const delta = buildScenarioDelta(record, event, activeScenarioId);
    setLiveEvents((current) => [event, ...current].slice(0, 12));
    setScenarioDelta(delta);
    return { event, delta };
  }

  function clearLiveDemoTimer() {
    if (liveDemoTimerRef.current === null) return;
    window.clearInterval(liveDemoTimerRef.current);
    liveDemoTimerRef.current = null;
  }

  function createOutputFromLiveDemo(type: AtlasOutputRecord['type'], delta: ScenarioDelta | null) {
    const output = createAtlasOutput({
      audienceMode: type === 'kam_cam_cascade_pack' ? 'kam_safe' : 'cno_internal',
      delta,
      record,
      sourceEventIds: delta ? [delta.eventId] : liveEvents.slice(0, 3).map((event) => event.id),
      sourceScenarioId: activeScenarioId,
      type
    });
    setOutputs((current) => [output, ...current].slice(0, 10));
    return output;
  }

  function contextualizeLiveDemoText(text: string) {
    return text
      .replaceAll('Carrefour France', `${selectedBuyingGroup.name} ${selectedBuyingGroup.activeMarket}`)
      .replaceAll('Carrefour', selectedBuyingGroup.name)
      .replaceAll('France', selectedBuyingGroup.activeMarket)
      .replaceAll('Marie Dupont', `${selectedBuyingGroup.name} buyer`);
  }

  function runLiveDemoTurn(turn: LiveDemoTurn) {
    let deltaFromTurn: ScenarioDelta | null = null;
    if (turn.scenarioId) setActiveScenarioId(turn.scenarioId);
    addMessage({
      role: turn.role,
      text: contextualizeLiveDemoText(turn.text),
      meta: contextualizeLiveDemoText(turn.meta)
    });

    if (turn.eventText) {
      const { delta } = createDeltaFromText(contextualizeLiveDemoText(turn.eventText));
      deltaFromTurn = delta;
      scenarioDeltaRef.current = delta;
    }

    if (turn.guidance) {
      setLiveGuidance((current) => ({ ...current, ...turn.guidance }));
    }

    if (turn.documentType) {
      const output = createOutputFromLiveDemo(turn.documentType, deltaFromTurn ?? scenarioDeltaRef.current);
      setLiveGuidance((current) => ({
        ...current,
        document: `${output.title} created`,
        confidence: `${output.confidence} confidence`
      }));
    }
  }

  function runDueLiveDemoTurns(elapsed: number) {
    while (
      liveDemoTurnIndexRef.current < liveDemoTurns.length
      && liveDemoTurns[liveDemoTurnIndexRef.current].at <= elapsed
    ) {
      runLiveDemoTurn(liveDemoTurns[liveDemoTurnIndexRef.current]);
      liveDemoTurnIndexRef.current += 1;
    }
  }

  function startLiveDemoTimer() {
    clearLiveDemoTimer();
    liveDemoTimerRef.current = window.setInterval(() => {
      setLiveDemoElapsed((current) => {
        const next = Math.min(current + 1, LIVE_DEMO_DURATION_SECONDS);
        runDueLiveDemoTurns(next);
        if (next >= LIVE_DEMO_DURATION_SECONDS) {
          clearLiveDemoTimer();
          setLiveDemoState('complete');
          setLiveMode('off');
          setVoiceNote('Transcript session complete. Review the generated brief, scenario deltas, and KAM-safe pack in the workspace.');
        }
        return next;
      });
    }, 1000);
  }

  function startLiveDemo() {
    stopRecognition();
    clearLiveDemoTimer();
    window.speechSynthesis?.cancel?.();
    liveDemoTurnIndexRef.current = 0;
    scenarioDeltaRef.current = null;
    setLiveDemoElapsed(0);
    setLiveDemoState('running');
    setLiveMode('listening');
    setIsThinking(false);
    setPrompt('');
    setSuggestedActions([]);
    setLiveEvents([]);
    setScenarioDelta(null);
    setSelectedDataPullId(null);
    setPinnedDataPullIds([]);
    setSavedDataPullIds([]);
    setShowTranscriptDrawer(false);
    setActiveScenarioId(record.activeScenarioId);
    setOutputs([
      createAtlasOutput({ record, type: 'current_position' }),
      createAtlasOutput({ record, type: 'scenario_comparison' })
    ]);
    setLiveGuidance({
      confidence: 'high',
      document: 'Live negotiation record opened',
      headline: 'Transcript running',
      response: 'Listen for the customer ask first. I will pull relevant data, update scenario deltas, and keep the strategy draft current as the conversation moves.',
      scenario: selectedBuyingGroup.activeScenario
    });
    setMessages([
      {
        id: 'assistant-live-demo-ready',
        role: 'assistant',
        text: `Live transcript started for ${selectedBuyingGroup.name} ${selectedBuyingGroup.activeMarket}. I am capturing exact language, detecting buyer signals, pulling relevant data, updating scenario deltas, and preparing the debrief.`,
        meta: 'ATLAS'
      }
    ]);
    setVoiceNote('Transcript is running. ATLAS is listening, structuring events, pulling live data, updating strategy drafts, and creating documents.');
    runDueLiveDemoTurns(0);
    startLiveDemoTimer();
  }

  function updateSetupMetric(key: LiveSetupMetricKey, value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const normalized = Math.max(0, Math.min(10, Math.round(parsed * 10) / 10));
    setSetupMetricOverrides((current) => ({
      ...current,
      [selectedBuyingGroup.id]: {
        ...current[selectedBuyingGroup.id],
        [key]: normalized
      }
    }));
  }

  function resetSetupMetrics() {
    setSetupMetricOverrides((current) => {
      const next = { ...current };
      delete next[selectedBuyingGroup.id];
      return next;
    });
  }

  function pauseLiveDemo() {
    clearLiveDemoTimer();
    setLiveDemoState('paused');
    setLiveMode('paused');
    setVoiceNote('Transcript paused. Events, scenario deltas, and draft documents are preserved.');
  }

  function resumeLiveDemo() {
    if (liveDemoState !== 'paused') return;
    setLiveDemoState('running');
    setLiveMode('listening');
    setVoiceNote('Transcript resumed. ATLAS is continuing to process the live negotiation.');
    startLiveDemoTimer();
  }

  function endLiveDemo() {
    clearLiveDemoTimer();
    setLiveDemoState('complete');
    setLiveMode('off');
    setVoiceNote('Session ended. Review the transcript, structured events, scenario deltas, and generated documents.');
  }

  function processPrompt(text: string, options: { fromVoice?: boolean; forceLiveEvent?: boolean } = {}) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    setIsThinking(true);
    setPrompt('');
    setSuggestedActions([]);
    addMessage({ role: 'user', text: trimmed, meta: options.fromVoice ? 'Voice capture' : 'Typed command' });

    window.setTimeout(() => {
      const requestedOutput = shouldCreateOutput(trimmed);
      const shouldTreatAsLiveUpdate = options.forceLiveEvent
        || liveModeRef.current === 'listening'
        || /customer|carrefour|they|asked|ask|sanction|delist|deadline|trade margin|concession|update scenario/i.test(trimmed);

      let deltaForOutput = scenarioDelta;
      let sourceEventIds: string[] = [];
      if (shouldTreatAsLiveUpdate && !requestedOutput) {
        const { event, delta } = createDeltaFromText(trimmed);
        deltaForOutput = delta;
        sourceEventIds = [event.id];
        const quickResponse = delta.sanctionRisk === 'high'
          ? 'High-risk signal. Keep the scenario change in draft, capture the exact language, and move the commercial ask plus sanction signal into CNO escalation.'
          : delta.approvalState === 'draft'
            ? 'Draft update only. Validate approved support windows before changing the official scenario.'
            : 'Modeled inside guardrails if the base architecture stays intact and the second phase is locked.';
        setLiveGuidance((current) => ({
          ...current,
          confidence: event.confidence,
          document: 'Live analyst read updated',
          headline: delta.sanctionRisk === 'high' ? 'Follow-up required' : 'Quick commercial read',
          response: quickResponse,
          scenario: delta.summary
        }));
        addAssistantResponse(
          `Captured as ${labelEventType(event.type)}. ${delta.summary} Draft impact: ${liveEuros(delta.netRevenueDeltaEuros)} NR, ${bps(delta.grossMarginDeltaBps)} GM, ${pct(delta.volumeDeltaPct)} volume. Confirm before I make this official.`,
          [
            {
              id: uid('action'),
              detail: 'Open the live workspace with transcript, data pulls, strategy draft, and document actions.',
              href: liveRoute,
              label: 'Open Live Workspace'
            },
            {
              id: uid('action'),
              detail: 'Model the ask in scenario cockpit and adjust levers.',
              href: `${scenarioRoute}?${new URLSearchParams({ voiceScenario: trimmed }).toString()}`,
              label: 'Run Scenario Deep Dive'
            }
          ]
        );
      } else if (requestedOutput) {
        const output = createAtlasOutput({
          audienceMode: requestedOutput === 'kam_cam_cascade_pack' ? 'kam_safe' : 'cno_internal',
          delta: deltaForOutput,
          record,
          sourceEventIds,
          sourceScenarioId: activeScenarioId,
          type: requestedOutput
        });
        setOutputs((current) => [output, ...current].slice(0, 10));
        addAssistantResponse(
          `Created ${output.title}. It is saved in Negotiation Outputs with ${output.audienceMode.replaceAll('_', ' ')} controls, source freshness, assumptions, and confidence attached. Open the report when you want the PDF-ready view.`,
          suggestedActionsForPrompt(trimmed, requestedOutput)
        );
      } else {
        addAssistantResponse(
          answerNegotiationQuestion(record, trimmed, activeScenarioId),
          suggestedActionsForPrompt(trimmed, requestedOutput)
        );
      }
      setIsThinking(false);
    }, 420);
  }

  function runLiveProposalAnalysis(text = proposalText) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    setProposalText('');
    processPrompt(trimmed, { forceLiveEvent: true });
  }

  function handleCommandVoiceText(text: string) {
    const normalized = text.toLowerCase();
    if (/(start|open|begin).*(live|negotiation|nego|room)|live negotiation/.test(normalized)) {
      addMessage({ role: 'user', text, meta: 'Voice command' });
      addAssistantResponse('Opening Live Assist. Use it for explicit transcript capture, structured events, live data pulls, scenario deltas, strategy drafting, and documents while the conversation is happening.');
      window.location.href = liveRoute;
      return;
    }
    processPrompt(text, { fromVoice: true });
  }

  function reportHref(reportType: 'cno-prep-brief' | 'kam-safe-pack') {
    const params = new URLSearchParams({
      concession: String(activeScenario.concessionPct),
      elasticity: String(Math.abs(activeScenario.volumeImpactPct / Math.max(activeScenario.priceMovePct, 1))),
      levers: record.levers.map((lever) => `${lever.id}:${activeScenario.levers.includes(lever.id) ? 60 : 0}`).join(','),
      price: String(activeScenario.priceMovePct),
      sanction: String(riskPressureScore(activeScenario.sanctionRisk)),
      scenario: activeScenario.id,
      trade: '0'
    });
    return `/negotiation/${record.id}/report/${reportType}?${params.toString()}`;
  }

  function suggestedActionsForPrompt(promptText: string, requestedOutput: AtlasOutputRecord['type'] | null): SuggestedAction[] {
    const normalized = promptText.toLowerCase();
    if (requestedOutput === 'cno_prep_brief') {
      return [{
        id: uid('action'),
        detail: 'Open the light-mode, PDF-ready CNO prep brief.',
        href: reportHref('cno-prep-brief'),
        label: 'Open CNO Brief',
        target: '_blank'
      }];
    }

    if (requestedOutput === 'kam_cam_cascade_pack') {
      return [{
        id: uid('action'),
        detail: 'Open the redacted KAM-safe pack for field guidance.',
        href: reportHref('kam-safe-pack'),
        label: 'Open KAM-Safe Pack',
        target: '_blank'
      }];
    }

    if (requestedOutput === 'scenario_comparison' || requestedOutput === 'recommended_scenario_brief') {
      return [{
        id: uid('action'),
        detail: 'Stress-test a move inside the active buying-group strategy.',
        href: strategyStressTestHref({ voiceCommand: promptText }),
        label: 'Open Strategy Stress Test'
      }];
    }

    if (/(scenario|what happens|model|simulate|run|compare|lever|levers|price|pricing|red line|concession|another|extra|if they|if carrefour|ask for|asks for)/.test(normalized)) {
      const params = new URLSearchParams();
      if (/(what happens|model|simulate|run|create|new|another|extra|if they|if carrefour|ask for|asks for)/.test(normalized)) {
        params.set('voiceScenario', promptText);
      } else {
        params.set('voiceCommand', promptText);
      }
      return [{
        id: uid('action'),
        detail: 'Open the strategy stress test to see whether the move supports, weakens, or changes the strategy.',
        href: strategyStressTestHref(Object.fromEntries(params.entries())),
        label: 'Stress-Test This Move'
      }];
    }

    if (/(pushback|objection|customer ask|buyer ask|live data|risk|source|evidence)/.test(normalized)) {
      return [{
        id: uid('action'),
        detail: 'Move into Live Assist for transcript capture, live data pulls, source review, and scenario impact.',
        href: liveRoute,
        label: 'Open Live Assist'
      }];
    }

    return [{
      id: uid('action'),
      detail: 'Review the current strategy stress test, sources, assumptions, and next outputs.',
      href: scenarioRoute,
      label: 'Open Strategy Stress Test'
    }];
  }

  function startCommandVoice() {
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition) {
      setLiveMode('unsupported');
      setVoiceNote('Browser speech capture is unavailable here. Type a command and ATLAS will run the same flow.');
      return;
    }
    if (liveOn) {
      setLiveMode('off');
      setVoiceNote('Voice command stopped.');
      stopRecognition();
      return;
    }
    stopRecognition();
    setLiveMode('listening');
    setVoiceNote('Listening for a command. Try “compare scenarios” or “start live negotiation.”');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setLiveMode('listening');
      setVoiceNote('Listening for one ATLAS command.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      recognitionRef.current = null;
      setLiveMode('off');
      if (!transcript) return;
      setVoiceNote(`Captured: “${transcript}”`);
      handleCommandVoiceText(transcript);
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      const reason = event?.error ?? 'voice_error';
      if (reason === 'not-allowed' || reason === 'service-not-allowed') {
        setLiveMode('unsupported');
        setVoiceNote('Microphone permission was not granted. Enable microphone access in the browser, or type the command.');
        return;
      }
      setLiveMode('off');
      setVoiceNote(`Voice command hit ${reason}. Type the command and ATLAS will run the same flow.`);
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (liveModeRef.current === 'listening') setLiveMode('off');
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setLiveMode('unsupported');
      setVoiceNote('Voice command could not start. Type the command and ATLAS will run the same flow.');
    }
  }

  function startVoiceLoop() {
    if (liveDemoState === 'running') pauseLiveDemo();
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition) {
      setLiveMode('unsupported');
      setVoiceNote('Browser speech capture is unavailable here. Type live updates; ATLAS will still structure events and scenario deltas.');
      return;
    }
    stopRecognition();
    setLiveMode('listening');
    setVoiceNote('Live Negotiation is listening continuously. ATLAS will reopen listening after each captured turn until you pause or end.');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setLiveMode('listening');
      setVoiceNote('Listening for customer asks, objections, concessions, threats, decisions, and action items.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      recognitionRef.current = null;
      setVoiceNote('Captured voice turn. ATLAS is structuring it and checking scenario impact.');
      processPrompt(transcript, { forceLiveEvent: true, fromVoice: true });
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      const reason = event?.error ?? 'voice_error';
      if (reason === 'not-allowed' || reason === 'service-not-allowed') {
        setLiveMode('unsupported');
        setVoiceNote('Microphone permission was not granted. Type live updates here, or start listening again after enabling microphone access.');
        return;
      }
      if (reason === 'no-speech') {
        setVoiceNote('No speech captured yet. ATLAS is reopening listening while live mode remains on.');
        window.setTimeout(() => {
          if (liveModeRef.current === 'listening') startVoiceLoop();
        }, 700);
        return;
      }
      setLiveMode('paused');
      setVoiceNote(`Voice capture hit ${reason}. The live workspace is preserved; type updates or restart listening.`);
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (liveModeRef.current === 'listening') {
        window.setTimeout(() => {
          if (liveModeRef.current === 'listening' && !recognitionRef.current) startVoiceLoop();
        }, 850);
      }
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setLiveMode('unsupported');
      setVoiceNote('Voice capture could not start. Type a live update and ATLAS will use the same scenario path.');
    }
  }

  function pauseLiveMode() {
    if (liveDemoState === 'running') {
      pauseLiveDemo();
      return;
    }
    setLiveMode('paused');
    setVoiceNote('Live Assist is paused. The transcript and draft scenario state are preserved.');
    stopRecognition();
  }

  function endLiveMode() {
    if (liveDemoState === 'running' || liveDemoState === 'paused') {
      endLiveDemo();
      return;
    }
    setLiveMode('off');
    setVoiceNote('Live Assist ended. Create a brief or debrief from the captured state when ready.');
    stopRecognition();
  }

  function approveDelta() {
    if (!scenarioDelta) return;
    setScenarioDelta({ ...scenarioDelta, approvalState: 'approved' });
    setLiveEvents((events) => events.map((event) => event.id === scenarioDelta.eventId ? { ...event, official: true } : event));
    addMessage({
      role: 'assistant',
      meta: 'ATLAS',
      text: 'Scenario delta approved. I will use it as the working basis for the next CNO brief, live brief, or KAM-safe cascade.'
    });
  }

  function rejectDelta() {
    if (!scenarioDelta) return;
    setScenarioDelta({ ...scenarioDelta, approvalState: 'rejected' });
    addMessage({
      role: 'assistant',
      meta: 'ATLAS',
      text: 'Scenario delta rejected. I kept it in the transcript for audit, but it will not drive official outputs.'
    });
  }

  function generateOutput(type: AtlasOutputRecord['type'], audienceMode?: AtlasOutputRecord['audienceMode']) {
    const output = createAtlasOutput({
      audienceMode,
      delta: scenarioDelta,
      record,
      sourceEventIds: scenarioDelta ? [scenarioDelta.eventId] : [],
      sourceScenarioId: activeScenarioId,
      type
    });
    setOutputs((current) => [output, ...current].slice(0, 10));
    addMessage({
      role: 'assistant',
      meta: 'ATLAS',
      text: `${output.title} created from ${activeScenario.name}. I attached source scenario, live events, source freshness, assumptions, confidence, and approval state.`
    });
  }

  function generateBrief() {
    generateOutput('cno_prep_brief');
  }

  const liveModeLabel = liveMode === 'listening'
    ? 'Live Negotiation On'
    : liveMode === 'paused'
      ? 'Live Paused'
      : liveMode === 'unsupported'
        ? 'Voice Unavailable'
        : 'Start Live Assist';
  const commandVoiceLabel = liveMode === 'listening'
    ? 'Listening'
    : liveMode === 'unsupported'
      ? 'Voice Unavailable'
      : 'Voice Command';
  const liveDemoProgressPct = Math.round((liveDemoElapsed / LIVE_DEMO_DURATION_SECONDS) * 100);
  const liveDemoStatusLabel = liveDemoState === 'running'
    ? 'Demo running'
    : liveDemoState === 'paused'
      ? 'Demo paused'
      : liveDemoState === 'complete'
        ? 'Demo complete'
        : 'Ready for demo';

  return (
    <main className={`jarvis-page jarvis-immersive atlas-command-os ${isLiveWorkspace ? 'atlas-live-workspace' : 'atlas-command-home'} ${showLiveSetup ? 'atlas-live-setup-mode' : ''} jarvis-state-${scenarioDelta?.approvalState === 'draft' ? 'approval' : isThinking ? 'thinking' : liveOn ? 'speaking' : 'idle'}`}>
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar">
        <a className="jarvis-mark" href="/">
          <Sparkles size={16} />
          <span>ATLAS Negotiation OS</span>
        </a>
        <nav aria-label="ATLAS navigation">
          <a href={`/negotiation/${record.id}`}><BriefcaseBusiness size={14} /> Active Nego</a>
          <a href={liveRoute}><Mic size={14} /> Live Assist</a>
          <a href={scenarioRoute}><BarChart3 size={14} /> Scenario</a>
          <a href="#outputs"><FileText size={14} /> Outputs</a>
          <a href="#evidence"><Database size={14} /> Evidence</a>
          <a href="/brand/lay-s/jarvis"><Network size={14} /> BBE Ref</a>
        </nav>
      </header>

      <section className="jarvis-immersive-stage" aria-label="ATLAS immersive negotiation command layer">
        {isLiveWorkspace && !showLiveSetup ? (
          <aside className="jarvis-side-panel atlas-live-signal-rail-panel">
            <div className="jarvis-panel-head">
              <div>
                <span>Signal Rail</span>
                <strong>Meaningful moments</strong>
              </div>
              <em>{liveSignalRailItems.length}</em>
            </div>
            <div className="atlas-live-signal-list">
              {liveSignalRailItems.map((signal) => (
                <button
                  className={`${signal.pullId === activeDataPull?.id ? 'active' : ''} severity-${signal.severity}`}
                  type="button"
                  key={signal.id}
                  onClick={() => setSelectedDataPullId(signal.pullId)}
                >
                  <span>{signal.timestamp} · {signal.severity}</span>
                  <strong>{signal.label}</strong>
                  <em>{signal.status} · {signal.confidence}</em>
                </button>
              ))}
            </div>
            <button className="atlas-live-transcript-toggle" type="button" onClick={() => setShowTranscriptDrawer(true)}>
              <FileText size={14} /> Open transcript evidence
            </button>
          </aside>
        ) : null}

        <section className="jarvis-core-zone" aria-label="Negotiation intelligence core">
          {showLiveSetup ? (
            <section className="atlas-live-setup-screen" aria-label="Prepare Live Negotiator">
              <div className="atlas-live-setup-hero atlas-live-simple-hero">
                <div>
                  <span>Live Negotiator setup</span>
                  <h1>Who are we talking to?</h1>
                  <p>Confirm the buying group so ATLAS pulls the right pricing corridors, history, guardrails, scenarios, and evidence while it listens.</p>
                </div>
                <div className="atlas-live-setup-actions">
                  <a href={selectedLiveStartUrl} onClick={(event) => { event.preventDefault(); startLiveDemo(); }}><Play size={15} /> Start Live Negotiator</a>
                  <button type="button" onClick={startVoiceLoop} disabled={missingOnboardingItems.length > 0}><Mic size={15} /> Start Mic Listening</button>
                </div>
              </div>

              <div className="atlas-live-simple-layout">
                <section className="atlas-live-primary-choice" aria-label="Active buying group">
                  <div className="atlas-mini-head">
                    <span>Active negotiation</span>
                    <strong>{selectedBuyingGroup.name} - {selectedBuyingGroup.region}</strong>
                  </div>
                  <div className="atlas-live-choice-card">
                    <div>
                      <span>Buying group</span>
                      <strong>{selectedBuyingGroup.name}</strong>
                      <p>{selectedBuyingGroup.alliance} · {selectedBuyingGroup.region} · {selectedBuyingGroup.cycle}</p>
                    </div>
                    <em>{selectedBuyingGroup.confidence} confidence</em>
                  </div>
                  <div className="atlas-live-other-groups" aria-label="Other buying groups">
                    {liveBuyingGroups.map((group) => (
                      <a
                        className={group.id === selectedBuyingGroup.id ? 'active' : ''}
                        href={`${liveRoute}?group=${encodeURIComponent(group.id)}`}
                        key={group.id}
                        onClick={(event) => {
                          event.preventDefault();
                          setSelectedBuyingGroupId(group.id);
                        }}
                      >
                        <strong>{group.name}</strong>
                        <span>{group.activeMarket}</span>
                      </a>
                    ))}
                  </div>
                </section>

                <form action={liveRoute} className="atlas-live-simple-panel atlas-live-setup-editor" method="get" aria-label="Required live setup inputs">
                  <input name="group" type="hidden" value={selectedBuyingGroup.id} />
                  <div className="atlas-mini-head">
                    <span>Session inputs</span>
                    <strong>Confirm the numbers ATLAS will listen against</strong>
                  </div>
                  <div className="atlas-live-setup-inputs">
                    {liveSetupMetricFields.map((field) => (
                      <label key={field.key}>
                        <span>{field.label}</span>
                        <strong>{field.description}</strong>
                        <div>
                          <input
                            aria-label={`${field.label} percentage`}
                            data-live-setup-metric={field.key}
                            inputMode="decimal"
                            max="10"
                            min="0"
                            name={field.query}
                            onChange={(event) => updateSetupMetric(field.key, event.target.value)}
                            onInput={(event) => updateSetupMetric(field.key, event.currentTarget.value)}
                            step="0.1"
                            type="number"
                            value={selectedBuyingGroup[field.key]}
                          />
                          <em>%</em>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="atlas-live-readiness-note">
                    <strong>{missingOnboardingItems.length === 0 ? 'Ready to listen' : 'Needs setup'}</strong>
                    <span>{selectedBuyingGroup.name} · {selectedBuyingGroup.activeMarket} · {selectedBuyingGroup.activeScenario}</span>
                    <button type="submit">Apply inputs</button>
                    <a className="atlas-live-reset-link" href={`${liveRoute}?group=${encodeURIComponent(selectedBuyingGroup.id)}`} onClick={(event) => { event.preventDefault(); resetSetupMetrics(); }}>Reset defaults</a>
                  </div>
                </form>

                <section className="atlas-live-simple-panel" aria-label="What ATLAS will load">
                  <div className="atlas-mini-head">
                    <span>ATLAS will load</span>
                    <strong>Context for live listening</strong>
                  </div>
                  <div className="atlas-live-load-list">
                    {[
                      ['Pricing guardrails', `${currentBuyerAsk} ask · ${pct(selectedBuyingGroup.targetPct)} target · ${pct(selectedBuyingGroup.counterPct)} counter · ${pct(selectedBuyingGroup.redLinePct)} red line`],
                      ['Active scenario', selectedBuyingGroup.activeScenario],
                      ['Markets in scope', selectedBuyingGroup.markets.slice(0, 4).join(', ')],
                      ['Evidence pack', selectedBuyingGroup.evidencePack],
                      ['Live outputs', 'data pulls, strategy draft, debrief draft']
                    ].map(([label, value]) => (
                      <article key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="atlas-live-simple-panel" aria-label="Watch mode">
                  <div className="atlas-mini-head">
                    <span>Listen for</span>
                    <strong>Default watch mode</strong>
                  </div>
                  <div className="atlas-live-simple-tags">
                    {selectedBuyingGroup.watchTopics.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          ) : null}

          {isLiveWorkspace && !showLiveSetup ? (
            <section className="atlas-live-briefing-panel" aria-label="Live negotiation briefing">
              <div className="atlas-live-briefing-head">
                <div>
                  <span>{selectedBuyingGroup.name} · {selectedBuyingGroup.alliance} · {selectedBuyingGroup.cycle} · {record.stage.replaceAll('_', ' ')}</span>
                  <strong>Live Negotiator Agent</strong>
                </div>
                <div className="atlas-live-heading-rail">
                  <em className={liveOn ? 'active' : ''}>{liveSessionStatus}</em>
                  <div className="atlas-live-session-actions" aria-label="Live session controls">
                    {liveDemoState === 'paused' ? (
                      <button type="button" onClick={resumeLiveDemo}><Play size={14} /> Resume Transcript</button>
                    ) : (
                      <button type="button" onClick={pauseLiveMode} disabled={liveDemoState !== 'running' && !liveOn}><Square size={14} /> Pause Transcript</button>
                    )}
                    <button type="button" onClick={endLiveMode} disabled={liveMode === 'off' && liveDemoState !== 'running' && liveDemoState !== 'paused'}><BadgeCheck size={14} /> End Session</button>
                    <button type="button" onClick={startVoiceLoop} disabled={liveOn || liveDemoState === 'running'}><Mic size={14} /> Start Mic</button>
                    <button type="button" onClick={generateBrief}><ClipboardList size={14} /> Create CNO Brief</button>
                  </div>
                  <span>{voiceNote}</span>
                </div>
              </div>
              <div className="atlas-live-session-strip">
                <article>
                  <span>Active market</span>
                  <strong>{selectedBuyingGroup.activeMarket}</strong>
                </article>
                <article>
                  <span>Buyer ask</span>
                  <strong>{currentBuyerAsk}</strong>
                </article>
                <article>
                  <span>Target</span>
                  <strong>{pct(selectedBuyingGroup.targetPct)}</strong>
                </article>
                <article>
                  <span>Red line</span>
                  <strong>{pct(selectedBuyingGroup.redLinePct)}</strong>
                </article>
                <article>
                  <span>Timer</span>
                  <strong>{formatDemoTime(liveDemoElapsed)}</strong>
                </article>
              </div>
              <div className="atlas-live-real-time-shell" aria-label="Real-time intelligence surface">
                <section className="atlas-live-data-feed" aria-label="Real-time data feed">
                  <div className="atlas-live-feed-head">
                    <div>
                      <span>Real-time data feed</span>
                      <strong>{activeDataPull?.title ?? 'Waiting for first pull'}</strong>
                    </div>
                    <p>{activeDataPull?.whyPulled ?? 'ATLAS will pull only high-relevance data as the conversation changes.'}</p>
                  </div>

                  {activeDataPull ? (
                    <article className={`atlas-live-data-card primary status-${activeDataPull.status} type-${activeDataPull.cardType}`}>
                      <div className="atlas-live-card-meta">
                        <span>{activeDataPull.cardType.replaceAll('_', ' ')} · {activeDataPull.trigger}</span>
                        <em>{activeDataPull.relevance} relevance</em>
                      </div>
                      <strong>{activeDataPull.keyMetric}</strong>
                      <p>{activeDataPull.interpretation}</p>
                      <div className="atlas-live-trust-row" aria-label="Source trust">
                        <article>
                          <span>Source</span>
                          <strong>{activeDataPull.sourceName}</strong>
                        </article>
                        <article>
                          <span>Type</span>
                          <strong>{evidenceLabelText(activeDataPull.sourceType)}</strong>
                        </article>
                        <article>
                          <span>Last updated</span>
                          <strong>{activeDataPull.freshness}</strong>
                        </article>
                        <article>
                          <span>Last used</span>
                          <strong>{activeDataPull.lastUsed}</strong>
                        </article>
                        <article>
                          <span>Owner</span>
                          <strong>{activeDataPull.owner}</strong>
                        </article>
                        <article>
                          <span>Status</span>
                          <strong>{activeDataPull.status.replaceAll('_', ' ')}</strong>
                        </article>
                      </div>
                      <div className="atlas-live-strategy-impact">
                        <span>Strategy impact</span>
                        <strong>{activeDataPull.strategyImpact}</strong>
                        <em>{activeDataPull.confidence} confidence</em>
                      </div>
                      <div className="atlas-live-card-actions">
                        <button type="button" onClick={() => togglePinnedDataPull(activeDataPull.id)}>
                          {pinnedDataPullIds.includes(activeDataPull.id) ? 'Pinned to strategy' : 'Pin to strategy'}
                        </button>
                        <button type="button" onClick={() => toggleSavedDataPull(activeDataPull.id)}>
                          {savedDataPullIds.includes(activeDataPull.id) ? 'Saved to debrief' : 'Save to debrief'}
                        </button>
                        <a href={selectedLiveSourceUrl} onClick={(event) => { event.preventDefault(); inspectDataPullSource(activeDataPull.id); }}>View source</a>
                        <a href={scenarioRoute}>Related scenario</a>
                      </div>
                    </article>
                  ) : null}

                  <div className="atlas-live-secondary-feed" aria-label="Secondary data pulls">
                    {secondaryDataPulls.map((pull) => (
                      <button className={`status-${pull.status}`} type="button" key={pull.id} onClick={() => setSelectedDataPullId(pull.id)}>
                        <span>{pull.trigger} · {pull.relevance}</span>
                        <strong>{pull.title}</strong>
                        <p>{pull.keyMetric}</p>
                        <em>{pull.sourceName} · {pull.freshness} · {pull.status.replaceAll('_', ' ')}</em>
                      </button>
                    ))}
                  </div>
                </section>

                <aside className={`atlas-live-strategy-panel risk-${liveStrategyDraft.risk}`} aria-label="Live strategy draft">
                  <div className="atlas-mini-head">
                    <span>Live Strategy Draft v{Math.max(1, liveEvents.length + 1)}</span>
                    <strong>{liveStrategyDraft.headline}</strong>
                  </div>
                  <article>
                    <span>Original strategy</span>
                    <p>{selectedBuyingGroup.strategyFocus}</p>
                  </article>
                  <article>
                    <span>Current state</span>
                    <p>{liveStrategyDraft.title}</p>
                  </article>
                  <article>
                    <span>PepsiCo alignment</span>
                    <p>Margin protection and disciplined pricing architecture remain primary; promo execution risk is monitored live.</p>
                  </article>
                  <div className="atlas-live-strategy-updates">
                    {strategyUpdates.map((update) => (
                      <p key={update}>{update}</p>
                    ))}
                  </div>
                  {strategyValidationNeeds.length ? (
                    <div className="atlas-live-validation-list">
                      <span>Needs validation</span>
                      {strategyValidationNeeds.map((need) => <p key={need}>{need}</p>)}
                    </div>
                  ) : null}
                  <div className="atlas-live-card-actions">
                    <button type="button">Review changes</button>
                    <button type="button">Accept update</button>
                    <button type="button">Save v{Math.max(1, liveEvents.length + 1)}</button>
                  </div>
                </aside>
              </div>
            </section>
          ) : (
            <>
              <div className="jarvis-brand-lockup atlas-lockup">
                <span>{record.cycle}</span>
                <h1>ATLAS</h1>
                <p className="jarvis-active-context-chip">
                  <ShieldCheck size={13} /> {record.customer} · {record.market} · {activeScenario.name}
                </p>
              </div>

              <div className={`jarvis-holo-core thought-${thoughtCore.intensity}`}>
                <div className="jarvis-core-ring ring-one" />
                <div className="jarvis-core-ring ring-two" />
                <div className="jarvis-core-ring ring-three" />
                <div className="jarvis-core-scan scan-one" />
                <div className="jarvis-core-scan scan-two" />
                <div className="jarvis-core-grid" />
                <div className="jarvis-core-sigil">
                  {liveOn ? <Waves size={30} /> : <Radar size={30} />}
                </div>
                <div className="jarvis-thought-nodes">
                  {[
                    ['position', 'complete'],
                    ['scenario', scenarioDelta ? 'active' : 'complete'],
                    ['voice', liveOn ? 'active' : 'waiting'],
                    ['delta', scenarioDelta ? 'watch' : 'waiting'],
                    ['brief', outputs.some((output) => output.type === 'cno_prep_brief') ? 'complete' : 'waiting'],
                    ['proof', 'complete']
                  ].map(([label, status], index) => (
                    <span className={`jarvis-thought-node node-${index + 1} ${status}`} key={label}>
                      <i />
                      <em>{label}</em>
                    </span>
                  ))}
                </div>

                <section className={`jarvis-thought-panel ${thoughtCore.intensity}`} aria-label="ATLAS current work">
                  <span>{thoughtCore.label}</span>
                  <strong>{thoughtCore.phrase}</strong>
                  <p>{thoughtCore.detail}</p>
                  <div className="jarvis-thought-trace" aria-hidden="true">
                    {['position', 'scenario', 'voice', 'delta', 'brief'].map((item) => (
                      <b className={item === 'delta' && scenarioDelta ? 'active' : item === 'voice' && liveOn ? 'active' : 'complete'} key={item} />
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {isLiveWorkspace && !showLiveSetup && showTranscriptDrawer ? (
            <section className="atlas-live-transcript-drawer" aria-label="Transcript source drawer">
              <div className="atlas-live-drawer-head">
                <div>
                  <span>Source drawer</span>
                  <strong>{activeDataPull?.title ?? 'Transcript evidence'}</strong>
                </div>
                <button type="button" onClick={() => setShowTranscriptDrawer(false)}>Close</button>
              </div>
              {activeDataPull ? (
                <div className="atlas-live-source-summary">
                  <article>
                    <span>Why pulled</span>
                    <strong>{activeDataPull.whyPulled}</strong>
                  </article>
                  <article>
                    <span>Source</span>
                    <strong>{activeDataPull.sourceName}</strong>
                  </article>
                  <article>
                    <span>Trust</span>
                    <strong>{activeDataPull.freshness} · {activeDataPull.confidence} · {activeDataPull.status.replaceAll('_', ' ')}</strong>
                  </article>
                </div>
              ) : null}
              <div className="atlas-live-transcript-lines" ref={transcriptRef}>
                {messages.slice(-8).map((message) => (
                  <article className={message.role} key={message.id}>
                    <span>{message.meta ?? (message.role === 'assistant' ? 'ATLAS' : 'Speaker')} · source line</span>
                    <p>{message.text}</p>
                    <div>
                      <button type="button">Bookmark</button>
                      <button type="button">Include in debrief</button>
                      <button type="button">Correct signal</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {!isLiveWorkspace ? (
            <section className="atlas-position-strip" id="scenario" aria-label="Current position">
              <article>
                <span>Target</span>
                <strong>{pct(record.pricingPosition.targetPriceIncreasePct.value)}</strong>
              </article>
              <article>
                <span>Red line</span>
                <strong>{pct(record.pricingPosition.redLinePriceIncreasePct.value)}</strong>
              </article>
              <article>
                <span>Ask</span>
                <strong>{pct(record.pricingPosition.currentCustomerAskPct.value)}</strong>
              </article>
              <article>
                <span>NR at risk</span>
                <strong>{euros(record.pricingPosition.netRevenueAtRiskEuros.value)}</strong>
              </article>
            </section>
          ) : null}

          {isLiveWorkspace && !showLiveSetup ? (
            <section className="atlas-live-demo-cockpit" aria-label="Live demo cockpit">
              <div className="atlas-live-demo-meter">
                <div>
                  <span>{liveDemoStatusLabel}</span>
                  <strong>{formatDemoTime(liveDemoElapsed)} / 05:00</strong>
                </div>
                <i><b style={{ width: `${liveDemoProgressPct}%` }} /></i>
              </div>
              <dl>
                <div>
                  <dt>Scenario</dt>
                  <dd>{liveGuidance.scenario}</dd>
                </div>
                <div>
                  <dt>Strategy</dt>
                  <dd>{liveGuidance.headline}</dd>
                </div>
                <div>
                  <dt>Document</dt>
                  <dd>{liveGuidance.document}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{liveGuidance.confidence}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {scenarioDelta ? (
            <section className={`jarvis-output-callout ${scenarioDelta.approvalState === 'draft' ? 'approval' : 'ready'}`} aria-label="Scenario delta">
              <div>
                <span>{scenarioDelta.approvalState === 'draft' ? 'Approval Needed' : 'Scenario Delta'}</span>
                <strong>{scenarioDelta.summary}</strong>
                <p>{liveEuros(scenarioDelta.netRevenueDeltaEuros)} NR · {bps(scenarioDelta.grossMarginDeltaBps)} GM · {pct(scenarioDelta.volumeDeltaPct)} volume · sanction {scenarioDelta.sanctionRisk}</p>
              </div>
              {scenarioDelta.approvalState === 'draft' ? (
                <div>
                  <button type="button" onClick={approveDelta}><CheckCircle2 size={15} /> Approve</button>
                  <button type="button" onClick={rejectDelta}><Square size={15} /> Reject</button>
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="jarvis-command-surface">
            <form className="jarvis-command-dock atlas-command-dock" onSubmit={(event) => { event.preventDefault(); processPrompt(prompt); }}>
              <button
                className={`jarvis-mic ${liveOn ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  if (isLiveWorkspace) {
                    if (liveOn) pauseLiveMode();
                    else startVoiceLoop();
                  } else {
                    startCommandVoice();
                  }
                }}
                aria-label={isLiveWorkspace ? liveModeLabel : commandVoiceLabel}
              >
                {liveOn ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isLiveWorkspace ? liveModeLabel : commandVoiceLabel}</span>
              </button>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                aria-label="Talk through this negotiation"
                placeholder={isLiveWorkspace ? 'Type customer language, a number, or a negotiation update' : 'Talk through this negotiation'}
                disabled={isThinking}
              />
              {isThinking ? (
                <button className="jarvis-cancel" type="button" aria-label="Thinking" disabled>
                  <Circle size={16} />
                </button>
              ) : (
                <button
                  className="jarvis-send"
                  type="button"
                  onClick={() => processPrompt(prompt)}
                  disabled={!prompt.trim()}
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              )}
            </form>
          </div>
          <div className="atlas-live-controls">
            {isLiveWorkspace ? (
              <>
                <button type="button" onClick={startLiveDemo} disabled={liveDemoState === 'running'}><Play size={14} /> Start 5-Min Demo</button>
                {liveDemoState === 'paused' ? (
                  <button type="button" onClick={resumeLiveDemo}><Play size={14} /> Resume Demo</button>
                ) : (
                  <button type="button" onClick={pauseLiveMode} disabled={liveDemoState !== 'running' && !liveOn}><Square size={14} /> Pause</button>
                )}
                <button type="button" onClick={endLiveMode} disabled={liveMode === 'off' && liveDemoState !== 'running' && liveDemoState !== 'paused'}><BadgeCheck size={14} /> End Session</button>
                <button type="button" onClick={startVoiceLoop} disabled={liveOn || liveDemoState === 'running'}><Mic size={14} /> Start Mic Listening</button>
                <button type="button" onClick={generateBrief}><ClipboardList size={14} /> Create CNO Brief</button>
              </>
            ) : (
              <>
                <a href={liveRoute}><Play size={14} /> Start Live Assist</a>
                <button type="button" onClick={generateBrief}><ClipboardList size={14} /> Create CNO Brief</button>
              </>
            )}
          </div>
          <p className="atlas-voice-note">{isLiveWorkspace ? voiceNote : voiceNote}</p>
          {suggestedActions.length ? (
            <section className="atlas-followup-actions" aria-label="Suggested next actions">
              <span>Next step</span>
              <div>
                {suggestedActions.map((action) => (
                  <a href={action.href} key={action.id} rel={action.target ? 'noreferrer' : undefined} target={action.target}>
                    <strong>{action.label}</strong>
                    <em>{action.detail}</em>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {!isLiveWorkspace ? (
          <section className="jarvis-side-panel jarvis-work-panel atlas-output-panel atlas-inline-workspace" id="outputs">
            <div className="jarvis-panel-head">
              <div>
                <span>{isLiveWorkspace ? 'Live Intelligence' : 'Negotiation Outputs'}</span>
                <strong>{isLiveWorkspace ? 'Data + Debrief Capture' : 'Scenario + Work'}</strong>
              </div>
              <em>{record.lastSourceSync}</em>
            </div>

            {!isLiveWorkspace ? (
              <section className="atlas-scenario-card" aria-label="Active scenario">
                <span>Active Scenario</span>
                <strong>{activeScenario.name}</strong>
                <p>{activeScenario.strategy}</p>
                <dl>
                  <div><dt>NR</dt><dd>{euros(activeScenario.netRevenueImpactEuros)}</dd></div>
                  <div><dt>GM</dt><dd>{bps(activeScenario.grossMarginImpactBps)}</dd></div>
                  <div><dt>Land</dt><dd>{activeScenario.probabilityToLandPct}%</dd></div>
                  <div><dt>Risk</dt><dd>{activeScenario.sanctionRisk}</dd></div>
                </dl>
              </section>
            ) : null}

            {isLiveWorkspace ? (
              <section className={`atlas-live-analyst-card status-${liveAnalystRead.status}`} aria-label="Real-time data scientist">
                <div className="atlas-live-analyst-head">
                  <div>
                    <span>Real-Time Data Layer</span>
                    <strong>What ATLAS pulled into the room</strong>
                  </div>
                  <Calculator size={18} />
                </div>
                <div className="atlas-live-analyst-metrics atlas-live-decision-metrics">
                  <article>
                    <span>Guardrail state</span>
                    <strong>{liveAnalystRead.approval}</strong>
                  </article>
                  <article>
                    <span>NR impact</span>
                    <strong>{liveAnalystRead.netRevenue}</strong>
                  </article>
                  <article>
                    <span>GM impact</span>
                    <strong>{liveAnalystRead.margin}</strong>
                  </article>
                </div>
                <div className="atlas-live-data-pulls">
                  {liveDataPulls.map((pull) => (
                    <article className={`relevance-${pull.relevance}`} key={`${pull.title}-${pull.trigger}`}>
                      <div>
                        <span>{pull.trigger} · {pull.relevance} relevance</span>
                        <strong>{pull.title}</strong>
                      </div>
                      <p>{pull.interpretation}</p>
                      <em>{pull.keyMetric} · {evidenceLabelText(pull.sourceType)} · {pull.sourceName} · {pull.freshness} · {pull.confidence} confidence</em>
                    </article>
                  ))}
                </div>
                <div className="atlas-live-proposal-box">
                  <textarea
                    aria-label="Customer proposal to analyze"
                    placeholder="Type exactly what the customer said, e.g. 'We need another 1% trade margin and a close by Friday.'"
                    value={proposalText}
                    onChange={(event) => setProposalText(event.target.value)}
                    disabled={isThinking}
                  />
                  <button type="button" onClick={() => runLiveProposalAnalysis()} disabled={!proposalText.trim() || isThinking}>
                    <Calculator size={14} /> Run quick math
                  </button>
                </div>
              </section>
            ) : null}

            {isLiveWorkspace ? (
              <section className="atlas-response-card atlas-live-capture-panel" aria-label="Decision and debrief capture">
                <span>Decision / Debrief Capture</span>
                <strong>What ATLAS is preserving for the record</strong>
                <div className="atlas-live-number-grid">
                  {capturedNumbers.map((number) => (
                    <article key={`${number.label}-${number.value}`}>
                      <span>{number.label}</span>
                      <strong>{number.value}</strong>
                      <p>{number.context}</p>
                      <em>{number.status} · {number.confidence}</em>
                    </article>
                  ))}
                </div>
                <div className="atlas-live-capture-list">
                  {liveCaptures.map((item) => (
                    <article className={`status-${item.status}`} key={item.title}>
                      <span>{item.status}</span>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>
                <div className="atlas-live-action-row">
                  <button type="button" onClick={() => runLiveProposalAnalysis(latestLiveEvent?.rawQuote ?? proposalText)}>Analyze latest signal</button>
                  <button type="button" onClick={() => generateOutput('recommended_scenario_brief')}>Scenario brief</button>
                </div>
              </section>
            ) : null}

            {isLiveWorkspace || liveEvents.length ? (
              <section className="atlas-live-events" aria-label="Structured negotiation events">
                <div className="atlas-mini-head">
                  <span>{isLiveWorkspace ? 'Live Structured Events' : 'Draft Events'}</span>
                  <strong>{liveEvents.length || 'No live events yet'}</strong>
                </div>
                {liveEvents.length ? liveEvents.slice(0, 4).map((event) => (
                  <article key={event.id}>
                    <span>{event.timestamp} · {labelEventType(event.type)}</span>
                    <p>{event.rawQuote}</p>
                    <em>{event.official ? 'official' : 'draft'} · {event.confidence} confidence</em>
                  </article>
                )) : (
                  <div className="jarvis-output-shelf-empty">
                    <Mic size={18} />
                    <strong>Ready to capture</strong>
                    <p>Speak or type customer asks, objections, concessions, threats, decisions, and action items.</p>
                  </div>
                )}
              </section>
            ) : null}

            {isLiveWorkspace ? (
              <section className="atlas-document-actions" aria-label="Live document actions">
                <div className="atlas-mini-head">
                  <span>Documents</span>
                  <strong>Chief-of-staff workbench</strong>
                </div>
                <button type="button" onClick={() => generateOutput('live_negotiation_brief')}>
                  <FileText size={14} /> Live Negotiation Brief
                </button>
                <button type="button" onClick={() => generateOutput('cno_prep_brief')}>
                  <ClipboardList size={14} /> CNO Prep Brief
                </button>
                <button type="button" onClick={() => generateOutput('kam_cam_cascade_pack', 'kam_safe')}>
                  <ShieldCheck size={14} /> KAM-Safe Pack
                </button>
              </section>
            ) : null}

            <section className="jarvis-output-shelf" aria-label="ATLAS negotiation outputs">
              {outputs.map((output) => (
                <button className={`jarvis-output-shelf-item ${latestOutput.id === output.id ? 'active' : ''}`} type="button" key={output.id}>
                  <span>{outputKind(output.type)}</span>
                  <strong>{output.title}</strong>
                  <p>{output.audienceMode.replaceAll('_', ' ')} · {output.confidence} confidence · {output.exportState.replaceAll('_', ' ')}</p>
                  <em>{output.approvalState.replaceAll('_', ' ')}</em>
                </button>
              ))}
            </section>

            <section className="atlas-proof-panel" id="evidence" aria-label="Evidence and trust">
              <div className="atlas-mini-head">
                <span>Trust Layer</span>
                <strong>Source, freshness, confidence</strong>
              </div>
              {record.evidenceClaims.slice(0, 3).map((claim) => (
                <article key={claim.id}>
                  <span>{claim.label.replaceAll('_', ' ')} · {claim.confidence}</span>
                  <p>{claim.claim}</p>
                  <em>{claim.source} · {claim.freshness}</em>
                </article>
              ))}
            </section>
          </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}
