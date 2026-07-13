'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  FileText,
  FilePlus2,
  Layers3,
  Mic,
  Minus,
  Network,
  Plus,
  Save,
  Sparkles,
  Wand2
} from 'lucide-react';
import { bps, euros, pct } from '@/src/lib/atlas/assistant';
import { demoNegotiation } from '@/src/lib/atlas/demo-data';
import type { AtlasOutputType, EvidenceLabel, NegotiationLever, Scenario } from '@/src/lib/atlas/types';

type AtlasScenarioWorkbenchProps = {
  initialScenarioPrompt?: string;
  initialVoiceCommand?: string;
};

type ScenarioOrigin = 'atlas_generated' | 'user_created';
type ScenarioTone = 'ready' | 'watch' | 'breach' | 'approval';

type ScenarioCase = Scenario & {
  aiThesis: string;
  buyingGroup: string;
  cnoQuestion: string;
  confidenceNotes: string[];
  customerNarrative: string;
  importantFlags: Array<{ label: string; tone: ScenarioTone; value: string }>;
  market: string;
  negotiationMoment: 'prep' | 'live' | 'escalation' | 'post_call';
  origin: ScenarioOrigin;
  trigger: string;
};

type ManualState = {
  concessionPct: number;
  priceMovePct: number;
  sanctionPressurePct: number;
  tradeInvestmentEuros: number;
  volumeElasticity: number;
};

type DraftOutput = {
  id: string;
  title: string;
  type: AtlasOutputType;
};

type LeverLevels = Record<string, number>;

type LeverImpact = {
  grossMarginDeltaBps: number;
  label: string;
  netRevenueDeltaEuros: number;
  probabilityDeltaPts: number;
  sanctionPressureDelta: number;
  tradeSpendEuros: number;
  volumeDeltaPct: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function riskScore(risk: Scenario['sanctionRisk']) {
  if (risk === 'high') return 82;
  if (risk === 'medium') return 52;
  return 24;
}

function redLineLabel(value: number, redLine: number): Scenario['redLineProximity'] {
  if (value < redLine) return 'breach';
  if (value - redLine < 0.4) return 'watch';
  return 'safe';
}

function eurosWhole(value: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(value);
}

function formatSignedEuros(value: number) {
  const formatted = Math.abs(value) >= 1000000 ? euros(value) : eurosWhole(value);
  return value > 0 ? `+${formatted}` : formatted;
}

function evidenceLabel(label: EvidenceLabel) {
  return label.replaceAll('_', ' ');
}

function scenarioRankScore(scenario: Scenario) {
  const riskPenalty = scenario.sanctionRisk === 'high' ? 18 : scenario.sanctionRisk === 'medium' ? 8 : 0;
  const redLinePenalty = scenario.redLineProximity === 'breach' ? 35 : scenario.redLineProximity === 'watch' ? 12 : 0;
  return Math.round(scenario.probabilityToLandPct + scenario.grossMarginImpactBps / 4 + scenario.netRevenueImpactEuros / 900000 - riskPenalty - redLinePenalty);
}

function scenarioPriorityLabel(scenario: Scenario, index: number) {
  if (scenario.id === demoNegotiation.activeScenarioId) return 'Recommended';
  if (scenario.sanctionRisk === 'high') return 'Escalation case';
  if (scenario.probabilityToLandPct >= 70) return 'Landing case';
  return `Option ${index + 1}`;
}

function scenarioCnoRead(scenario: Scenario) {
  if (scenario.id === demoNegotiation.activeScenarioId) {
    return 'Best starting point: protects most value while keeping a credible path to land.';
  }
  if (scenario.sanctionRisk === 'high') {
    return 'Use only if leadership accepts sanction risk or the customer escalates visibility pressure.';
  }
  if (scenario.redLineProximity === 'watch') {
    return 'Higher chance to close, but needs careful approval because it sits close to guardrails.';
  }
  return 'Value-defense case for when proof quality is strong and probability tradeoff is acceptable.';
}

function metricTone(value: 'good' | 'watch' | 'bad') {
  return `tone-${value}`;
}

function guardrailTone(proximity: Scenario['redLineProximity']) {
  if (proximity === 'breach') return metricTone('bad');
  if (proximity === 'watch') return metricTone('watch');
  return metricTone('good');
}

function riskTone(risk: Scenario['sanctionRisk']) {
  if (risk === 'high') return metricTone('bad');
  if (risk === 'medium') return metricTone('watch');
  return metricTone('good');
}

function scenarioExternalFactors(scenario: Scenario) {
  if (scenario.sanctionRisk === 'high') {
    return ['Sanction language', 'Eurelec escalation', 'Delisting history'];
  }
  if (scenario.concessionPct >= 1.5) {
    return ['Trade-margin pressure', 'Continuity priority', 'Local recovery'];
  }
  if (scenario.priceMovePct >= 4) {
    return ['Commodity bridge', 'Category value proof', 'Leadership target'];
  }
  return ['Trade-margin pressure', 'Commodity bridge', 'Promo calendar'];
}

function scenarioMarketRead(scenario: Scenario) {
  if (scenario.sanctionRisk === 'high') return 'France primary / Spain and Benelux sanction comparators';
  if (scenario.probabilityToLandPct >= 70) return 'France primary / local execution recovery benchmark';
  return 'France primary / Eurelec buying-group read / Western Europe phasing patterns';
}

function leverTone(lever: NegotiationLever) {
  if (lever.availability === 'approval_required') return 'approval';
  if (lever.availability === 'blocked') return 'breach';
  return 'ready';
}

function defaultLeverLevels(scenario: Scenario): LeverLevels {
  return Object.fromEntries(demoNegotiation.levers.map((lever) => [
    lever.id,
    scenario.levers.includes(lever.id) ? 60 : 0
  ]));
}

function leverImpact(lever: NegotiationLever, level: number): LeverImpact {
  const intensity = level / 100;
  const tradeSpendEuros = Math.round(lever.costEuros * intensity);

  if (lever.type === 'phasing') {
    return {
      grossMarginDeltaBps: Math.round(-6 * intensity),
      label: 'Softer shelf-price transition; protects base price if phase two is locked.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .35 + level * 12000),
      probabilityDeltaPts: Math.round(14 * intensity),
      sanctionPressureDelta: Math.round(-10 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.35 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'promo') {
    return {
      grossMarginDeltaBps: Math.round(-14 * intensity),
      label: 'Improves customer value story but can leak margin if stacked with concession.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .62 + level * 18000),
      probabilityDeltaPts: Math.round(12 * intensity),
      sanctionPressureDelta: Math.round(-5 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.8 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'innovation') {
    return {
      grossMarginDeltaBps: Math.round(4 * intensity),
      label: 'Adds growth narrative and premiumization proof with low red-line exposure.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .22 + level * 24000),
      probabilityDeltaPts: Math.round(7 * intensity),
      sanctionPressureDelta: Math.round(-3 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.45 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'sanction_mitigation') {
    return {
      grossMarginDeltaBps: Math.round(-18 * intensity),
      label: 'Raises continuity odds only when sanction language is explicit and approved.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .72),
      probabilityDeltaPts: Math.round(16 * intensity),
      sanctionPressureDelta: Math.round(-24 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.65 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'scope') {
    return {
      grossMarginDeltaBps: Math.round(-9 * intensity),
      label: 'Trades local executional scope without reopening central base-price strategy.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .45 + level * 9000),
      probabilityDeltaPts: Math.round(9 * intensity),
      sanctionPressureDelta: Math.round(-6 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.35 * intensity).toFixed(1))
    };
  }

  return {
    grossMarginDeltaBps: Math.round(-8 * intensity),
    label: 'Commercial support lever with approval and source-confidence checks.',
    netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .5 + level * 10000),
    probabilityDeltaPts: Math.round(8 * intensity),
    sanctionPressureDelta: Math.round(-4 * intensity),
    tradeSpendEuros,
    volumeDeltaPct: Number((.3 * intensity).toFixed(1))
  };
}

function scenarioFromBase(scenario: Scenario, index: number): ScenarioCase {
  const record = demoNegotiation;
  const theses = [
    'ATLAS is testing whether the CNO should absorb sanction risk to protect the full annual target.',
    'ATLAS is balancing value protection against a credible probability to land with controlled phasing.',
    'ATLAS is testing the continuity case if sanction language becomes explicit and speed matters more than value.'
  ];
  const triggers = [
    'Use when the customer asks for proof and has not yet escalated sanctions.',
    'Use as the default CNO path when Carrefour pushes for margin relief but remains negotiable.',
    'Use when delisting, reduced visibility, or buying-group pressure becomes credible.'
  ];

  return {
    ...scenario,
    aiThesis: theses[index] ?? theses[1],
    buyingGroup: record.buyingGroup,
    cnoQuestion: index === 0
      ? 'Is leadership willing to trade probability for full target defense?'
      : index === 2
        ? 'What is the minimum value we protect if continuity becomes the priority?'
        : 'Which controlled give preserves value without revealing the red line?',
    confidenceNotes: [
      `${scenario.confidence} model confidence based on prototype data freshness.`,
      'Financials are modeled estimates until connected to the governed pricing engine.',
      'Sensitive guardrails remain CNO internal and should not move into KAM/customer-safe outputs.'
    ],
    customerNarrative: index === 0
      ? 'Lead with total cost-to-serve and category value proof. Avoid opening concession language early.'
      : index === 2
        ? 'Acknowledge continuity concerns, protect the relationship, and avoid naming internal thresholds.'
        : 'Offer phasing and shopper activation as customer value before permanent price or trade-margin give.',
    importantFlags: [
      { label: 'Red line', tone: scenario.redLineProximity === 'safe' ? 'ready' : 'watch', value: scenario.redLineProximity },
      { label: 'Sanction risk', tone: scenario.sanctionRisk === 'high' ? 'breach' : scenario.sanctionRisk === 'medium' ? 'watch' : 'ready', value: scenario.sanctionRisk },
      { label: 'Land probability', tone: scenario.probabilityToLandPct >= 60 ? 'ready' : 'watch', value: `${scenario.probabilityToLandPct}%` }
    ],
    market: record.market,
    negotiationMoment: index === 2 ? 'escalation' : 'prep',
    origin: 'atlas_generated',
    trigger: triggers[index] ?? triggers[1]
  };
}

function scenarioFromPrompt(prompt: string, count: number): ScenarioCase {
  const record = demoNegotiation;
  const normalized = prompt.toLowerCase();
  const sanction = /(sanction|delist|visibility|threat|pressure)/.test(normalized);
  const priceMatch = prompt.match(/(\d+(?:\.\d+)?)\s?(?:%|percent)/);
  const priceMovePct = priceMatch ? Number(priceMatch[1]) : sanction ? 2.6 : 3.0;
  const concessionPct = clamp(record.pricingPosition.targetPriceIncreasePct.value - priceMovePct, 0, 3.4);
  const probabilityToLandPct = sanction ? 66 : priceMovePct < 3 ? 72 : 58;
  const sanctionRisk: Scenario['sanctionRisk'] = sanction ? 'high' : probabilityToLandPct > 68 ? 'low' : 'medium';

  return {
    id: uid('scenario-user'),
    aiThesis: `ATLAS created this scenario from the user prompt: ${prompt}`,
    assumptions: ['User-created scenario requires CNO review.', 'Financials are modeled estimates.', 'Evidence must be checked before export.'],
    buyingGroup: record.buyingGroup,
    cnoQuestion: 'Should this user-created case become an official scenario or remain exploratory?',
    concessionPct,
    confidence: 'medium',
    confidenceNotes: [
      'Created from chat/manual input, not approved source data.',
      'Use as a draft until assumptions are confirmed.',
      'Review customer-safe language before sharing.'
    ],
    customerNarrative: sanction
      ? 'Hold the relationship line, capture exact sanction language, and trade continuity support only with approval.'
      : 'Use a controlled give and proof-led value story before any permanent concession.',
    grossMarginImpactBps: Math.round(24 + priceMovePct * 11 - concessionPct * 9),
    importantFlags: [
      { label: 'Created by user', tone: 'approval', value: 'draft' },
      { label: 'Sanction risk', tone: sanction ? 'breach' : 'watch', value: sanctionRisk },
      { label: 'Review needed', tone: 'approval', value: 'CNO gate' }
    ],
    levers: sanction ? ['sanction-mitigation', 'phased-timing'] : ['phased-timing', 'promo-calendar-control'],
    market: record.market,
    name: `Custom Scenario ${count + 1}`,
    negotiationMoment: sanction ? 'escalation' : 'prep',
    netRevenueImpactEuros: Math.round(900000 + priceMovePct * 820000 - concessionPct * 420000),
    origin: 'user_created',
    priceMovePct,
    probabilityToLandPct,
    recommendedUseCase: 'Use as an exploratory what-if until a CNO approves it for official planning.',
    redLineProximity: redLineLabel(priceMovePct, record.pricingPosition.redLinePriceIncreasePct.value),
    sanctionRisk,
    strategy: prompt || 'User-created scenario awaiting detail.',
    trigger: 'Created from chat or manual scenario entry.',
    volumeImpactPct: Number((-priceMovePct * 0.32).toFixed(1))
  };
}

function defaultManual(scenario: Scenario): ManualState {
  return {
    concessionPct: scenario.concessionPct,
    priceMovePct: scenario.priceMovePct,
    sanctionPressurePct: riskScore(scenario.sanctionRisk),
    tradeInvestmentEuros: 0,
    volumeElasticity: Math.abs(scenario.volumeImpactPct / Math.max(scenario.priceMovePct, 1))
  };
}

export default function AtlasScenarioWorkbench({ initialScenarioPrompt, initialVoiceCommand }: AtlasScenarioWorkbenchProps) {
  const record = demoNegotiation;
  const cleanInitialScenarioPrompt = initialScenarioPrompt?.trim() ?? '';
  const cleanInitialVoiceCommand = initialVoiceCommand?.trim() ?? '';
  const routedVoiceCommand = cleanInitialScenarioPrompt || cleanInitialVoiceCommand;
  const voiceScenario = useMemo(() => (
    cleanInitialScenarioPrompt ? scenarioFromPrompt(cleanInitialScenarioPrompt, 0) : null
  ), [cleanInitialScenarioPrompt]);
  const initialScenarios = useMemo(() => {
    const baseScenarios = record.scenarios.map(scenarioFromBase);
    return voiceScenario ? [voiceScenario, ...baseScenarios] : baseScenarios;
  }, [record.scenarios, voiceScenario]);
  const [scenarioCases, setScenarioCases] = useState<ScenarioCase[]>(initialScenarios);
  const [selectedScenarioId, setSelectedScenarioId] = useState(voiceScenario?.id ?? record.activeScenarioId);
  const [marketFilter, setMarketFilter] = useState(record.market);
  const [buyingGroupFilter, setBuyingGroupFilter] = useState(record.buyingGroup);
  const [riskFilter, setRiskFilter] = useState<'all' | Scenario['sanctionRisk']>('all');
  const [momentFilter, setMomentFilter] = useState<'all' | ScenarioCase['negotiationMoment']>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPrompt, setDraftPrompt] = useState('');
  const [savedScenarioIds, setSavedScenarioIds] = useState<string[]>([]);
  const [approvedScenarioIds, setApprovedScenarioIds] = useState<string[]>([]);
  const [draftOutputs, setDraftOutputs] = useState<DraftOutput[]>([]);
  const [detailOpen, setDetailOpen] = useState(Boolean(voiceScenario));
  const [leverLevels, setLeverLevels] = useState<LeverLevels>(() => {
    const initial = initialScenarios.find((scenario) => scenario.id === record.activeScenarioId) ?? initialScenarios[0];
    return defaultLeverLevels(initial);
  });

  const selectedScenario = scenarioCases.find((scenario) => scenario.id === selectedScenarioId) ?? scenarioCases[0];
  const [manual, setManual] = useState<ManualState>(() => defaultManual(selectedScenario));

  const filteredScenarios = scenarioCases.filter((scenario) => (
    scenario.market === marketFilter
    && scenario.buyingGroup === buyingGroupFilter
    && (riskFilter === 'all' || scenario.sanctionRisk === riskFilter)
    && (momentFilter === 'all' || scenario.negotiationMoment === momentFilter)
  ));
  const rankedScenarios = [...filteredScenarios].sort((a, b) => scenarioRankScore(b) - scenarioRankScore(a));

  const activeLevers = record.levers.filter((lever) => (leverLevels[lever.id] ?? 0) > 0);
  const approvalRequiredLevers = activeLevers.filter((lever) => lever.availability === 'approval_required');
  const leverModel = useMemo(() => {
    const impacts = record.levers.map((lever) => ({
      impact: leverImpact(lever, leverLevels[lever.id] ?? 0),
      lever,
      level: leverLevels[lever.id] ?? 0
    }));

    return {
      grossMarginDeltaBps: impacts.reduce((sum, item) => sum + item.impact.grossMarginDeltaBps, 0),
      impacts,
      netRevenueDeltaEuros: impacts.reduce((sum, item) => sum + item.impact.netRevenueDeltaEuros, 0),
      probabilityDeltaPts: impacts.reduce((sum, item) => sum + item.impact.probabilityDeltaPts, 0),
      sanctionPressureDelta: impacts.reduce((sum, item) => sum + item.impact.sanctionPressureDelta, 0),
      tradeSpendEuros: impacts.reduce((sum, item) => sum + item.impact.tradeSpendEuros, 0),
      volumeDeltaPct: Number(impacts.reduce((sum, item) => sum + item.impact.volumeDeltaPct, 0).toFixed(1))
    };
  }, [leverLevels, record.levers]);
  const selectedEvidenceClaims = record.evidenceClaims.filter((claim) => (
    selectedScenario.id === 'scenario-b-value-protection'
      ? ['trade-margin-map', 'margin-waterfall', 'scenario-b-proof', 'customer-safe-value-story'].includes(claim.id)
      : selectedScenario.sanctionRisk === 'high'
        ? ['sanction-history', 'customer-safe-value-story', 'trade-margin-map'].includes(claim.id)
        : ['commodity-bridge', 'margin-waterfall', 'customer-safe-value-story'].includes(claim.id)
  ));
  const manualModel = useMemo(() => {
    const priceDelta = manual.priceMovePct - selectedScenario.priceMovePct;
    const concessionDelta = manual.concessionPct - selectedScenario.concessionPct;
    const netRevenueImpactEuros = Math.round(
      selectedScenario.netRevenueImpactEuros
      + priceDelta * 1180000
      - concessionDelta * 690000
      - manual.tradeInvestmentEuros
      + leverModel.netRevenueDeltaEuros
    );
    const grossMarginImpactBps = Math.round(
      selectedScenario.grossMarginImpactBps
      + priceDelta * 24
      - concessionDelta * 18
      - manual.tradeInvestmentEuros / 95000
      + leverModel.grossMarginDeltaBps
    );
    const probabilityToLandPct = Math.round(clamp(
      selectedScenario.probabilityToLandPct
      - priceDelta * 7
      + concessionDelta * 5
      + manual.tradeInvestmentEuros / 260000
      + leverModel.probabilityDeltaPts
      - (manual.sanctionPressurePct - riskScore(selectedScenario.sanctionRisk)) * 0.18,
      12,
      92
    ));
    const adjustedSanctionPressure = clamp(manual.sanctionPressurePct + leverModel.sanctionPressureDelta, 0, 100);
    const sanctionRisk: Scenario['sanctionRisk'] = adjustedSanctionPressure >= 68 ? 'high' : adjustedSanctionPressure >= 38 ? 'medium' : 'low';

    return {
      adjustedSanctionPressure,
      grossMarginImpactBps,
      netRevenueImpactEuros,
      probabilityToLandPct,
      redLineProximity: redLineLabel(manual.priceMovePct, record.pricingPosition.redLinePriceIncreasePct.value),
      sanctionRisk,
      tradeSpendEuros: manual.tradeInvestmentEuros + leverModel.tradeSpendEuros,
      volumeImpactPct: Number((-manual.priceMovePct * manual.volumeElasticity + leverModel.volumeDeltaPct).toFixed(1))
    };
  }, [leverModel, manual, record.pricingPosition.redLinePriceIncreasePct.value, selectedScenario]);

  function selectScenario(scenario: ScenarioCase) {
    setSelectedScenarioId(scenario.id);
    setManual(defaultManual(scenario));
    setLeverLevels(defaultLeverLevels(scenario));
    setDetailOpen(true);
  }

  function updateManual<K extends keyof ManualState>(key: K, value: ManualState[K]) {
    setSavedScenarioIds((current) => current.filter((id) => id !== selectedScenarioId));
    setManual((current) => ({ ...current, [key]: value }));
  }

  function stepManual<K extends keyof ManualState>(
    key: K,
    delta: number,
    min: number,
    max: number,
    decimals = 1
  ) {
    const current = Number(manual[key]);
    const next = Number(clamp(current + delta, min, max).toFixed(decimals));
    updateManual(key, next as ManualState[K]);
  }

  function updateLeverLevel(leverId: string, value: number) {
    setSavedScenarioIds((current) => current.filter((id) => id !== selectedScenarioId));
    setLeverLevels((current) => ({ ...current, [leverId]: value }));
  }

  function saveScenarioChanges() {
    setSavedScenarioIds((current) => current.includes(selectedScenario.id) ? current : [...current, selectedScenario.id]);
  }

  function approveScenario() {
    setSavedScenarioIds((current) => current.includes(selectedScenario.id) ? current : [...current, selectedScenario.id]);
    setApprovedScenarioIds((current) => current.includes(selectedScenario.id) ? current : [...current, selectedScenario.id]);
  }

  function createDraftOutput(type: AtlasOutputType, title: string) {
    setDraftOutputs((current) => [
      { id: uid('output'), title, type },
      ...current
    ].slice(0, 4));
  }

  function reportHref(reportType: 'cno-prep-brief' | 'kam-safe-pack') {
    const params = new URLSearchParams({
      concession: String(manual.concessionPct),
      elasticity: String(manual.volumeElasticity),
      levers: Object.entries(leverLevels).map(([id, level]) => `${id}:${level}`).join(','),
      price: String(manual.priceMovePct),
      sanction: String(manual.sanctionPressurePct),
      scenario: selectedScenario.id,
      trade: String(manual.tradeInvestmentEuros)
    });
    return `/negotiation/${record.id}/report/${reportType}?${params.toString()}`;
  }

  function openReport(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    type: AtlasOutputType,
    title: string
  ) {
    event.preventDefault();
    createDraftOutput(type, title);
    const absoluteHref = new URL(href, window.location.origin).toString();
    const reportWindow = window.open(absoluteHref, '_blank');
    if (!reportWindow) window.location.href = absoluteHref;
  }

  function createScenarioFromText(text: string, name?: string) {
    const scenario = scenarioFromPrompt(text, scenarioCases.filter((item) => item.origin === 'user_created').length);
    const cleanName = name?.trim() ?? '';
    const next = cleanName ? { ...scenario, name: cleanName } : scenario;
    setScenarioCases((current) => [next, ...current]);
    setSelectedScenarioId(next.id);
    setManual(defaultManual(next));
    setLeverLevels(defaultLeverLevels(next));
    setRiskFilter('all');
    setMomentFilter('all');
    setDetailOpen(true);
    setCreateOpen(false);
    setDraftName('');
    setDraftPrompt('');
  }

  return (
    <main className="jarvis-page jarvis-immersive atlas-scenario-page atlas-ai-scenario-page">
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar">
        <a className="jarvis-mark" href="/">
          <Sparkles size={16} />
          <span>ATLAS Negotiation OS</span>
        </a>
        <nav aria-label="Scenario navigation">
          <a href="/"><ArrowLeft size={14} /> Assistant</a>
          <a href={`/negotiation/${record.id}/live`}><Mic size={14} /> Live Assist</a>
          <a href="/brand/lay-s/jarvis"><Network size={14} /> BBE Ref</a>
        </nav>
      </header>

      <section className="atlas-ai-scenario-shell" aria-label="AI scenario console">
        {!detailOpen ? (
          <>
            <section className="atlas-ai-scenario-hero">
              <div>
                <span>Scenario Studio</span>
                <h1>Choose the negotiation path</h1>
                <p>{routedVoiceCommand ? `Voice command routed: ${routedVoiceCommand}` : `ATLAS ranked ${rankedScenarios.length} paths for ${record.customer} ${record.market}. Start with the recommendation, then open one path when you want levers, sources, confidence, and reports.`}</p>
              </div>
              <button type="button" onClick={() => setCreateOpen((open) => !open)}>
                <FilePlus2 size={16} /> Create Scenario
              </button>
            </section>

            <section className="atlas-scenario-context-line" aria-label="Scenario context">
              <span>{record.customer} / {record.market} / {record.buyingGroup}</span>
              <strong>Target {pct(record.pricingPosition.targetPriceIncreasePct.value)} · customer ask {pct(record.pricingPosition.currentCustomerAskPct.value)} · guardrail {pct(record.pricingPosition.redLinePriceIncreasePct.value)}</strong>
              <em>{record.cycle}</em>
            </section>

            <section className="atlas-scenario-filter-bar" aria-label="Scenario filters">
              <div className="atlas-filter-label">
                <span>Refine</span>
                <strong>Use only when you need to narrow the scenario set</strong>
              </div>
              <label>
                <span>Market</span>
                <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}>
                  <option value={record.market}>{record.market}</option>
                </select>
              </label>
              <label>
                <span>Buying group</span>
                <select value={buyingGroupFilter} onChange={(event) => setBuyingGroupFilter(event.target.value)}>
                  <option value={record.buyingGroup}>{record.buyingGroup}</option>
                </select>
              </label>
              <label>
                <span>Sanction risk</span>
                <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as 'all' | Scenario['sanctionRisk'])}>
                  <option value="all">All risks</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                <span>Negotiation moment</span>
                <select value={momentFilter} onChange={(event) => setMomentFilter(event.target.value as 'all' | ScenarioCase['negotiationMoment'])}>
                  <option value="all">All moments</option>
                  <option value="prep">Prep</option>
                  <option value="live">Live</option>
                  <option value="escalation">Escalation</option>
                  <option value="post_call">Post-call</option>
                </select>
              </label>
            </section>

            {createOpen ? (
              <section className="atlas-create-scenario-panel" aria-label="Create a new scenario">
                <div>
                  <span>User-created scenario</span>
                  <strong>Describe the case ATLAS should model</strong>
                </div>
                <input aria-label="Scenario name" placeholder="Scenario name" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
                <textarea aria-label="Scenario prompt" placeholder="Example: Carrefour asks for 1% extra trade margin and threatens reduced visibility unless we add promo support." value={draftPrompt} onChange={(event) => setDraftPrompt(event.target.value)} />
                <button type="button" onClick={() => createScenarioFromText(draftPrompt, draftName)} disabled={!draftPrompt.trim()}>
                  <Wand2 size={15} /> Run Scenario
                </button>
              </section>
            ) : null}

          <section className="atlas-scenario-review" aria-label="AI-run scenario review queue">
            <div className="atlas-panel-title">
              <span>AI-run scenario set</span>
              <strong>{rankedScenarios.length} modeled paths</strong>
            </div>
            <div className="atlas-scenario-review-table">
              {rankedScenarios.map((scenario, index) => (
                <article
                  className={`atlas-scenario-review-row ${scenario.id === record.activeScenarioId ? 'recommended' : ''} ${scenario.id === selectedScenario.id ? 'selected' : ''}`}
                  key={scenario.id}
                >
                  <div className="atlas-scenario-review-name">
                    <span>#{index + 1} / {scenarioPriorityLabel(scenario, index)}</span>
                    <strong>{scenario.name}</strong>
                    <p>{scenarioCnoRead(scenario)}</p>
                    <em>{scenarioMarketRead(scenario)}</em>
                  </div>
                  <div className="atlas-scenario-review-signals">
                    <b className={scenario.netRevenueImpactEuros >= 3500000 ? metricTone('good') : metricTone('watch')}><small>Value</small>{eurosWhole(scenario.netRevenueImpactEuros)}</b>
                    <b className={scenario.probabilityToLandPct >= 65 ? metricTone('good') : scenario.probabilityToLandPct >= 45 ? metricTone('watch') : metricTone('bad')}><small>Land</small>{scenario.probabilityToLandPct}%</b>
                    <b className={guardrailTone(scenario.redLineProximity)}><small>Guardrail</small>{scenario.redLineProximity}</b>
                    <b className={riskTone(scenario.sanctionRisk)}><small>Risk</small>{scenario.sanctionRisk}</b>
                  </div>
                  <div className="atlas-scenario-review-action">
                    <span>{scenarioExternalFactors(scenario).slice(0, 2).join(' / ')}</span>
                    <button type="button" onClick={() => selectScenario(scenario)}>
                      Inspect
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          </>
        ) : (

          <section className="atlas-scenario-detail atlas-scenario-detail-deep" aria-label="Selected scenario deep dive">
            <div className="atlas-scenario-detail-head">
              <div>
                <span>{selectedScenario.origin.replace('_', ' ')} / {selectedScenario.market} / {selectedScenario.buyingGroup}</span>
                <h2>{selectedScenario.name}</h2>
              </div>
              <div className="atlas-scenario-actions">
                <span className={approvedScenarioIds.includes(selectedScenario.id) ? 'approved' : savedScenarioIds.includes(selectedScenario.id) ? 'saved' : ''}>
                  {approvedScenarioIds.includes(selectedScenario.id) ? 'CNO approved' : savedScenarioIds.includes(selectedScenario.id) ? 'Saved draft' : 'Exploratory model'}
                </span>
                <div className="atlas-scenario-header-command-row" aria-label="CNO scenario commands">
                  <button type="button" onClick={() => setDetailOpen(false)}>
                    <ArrowLeft size={15} /> Scenario Set
                  </button>
                  <button type="button" onClick={approveScenario}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <a
                    href={reportHref('cno-prep-brief')}
                    onClick={(event) => openReport(
                      event,
                      reportHref('cno-prep-brief'),
                      'cno_prep_brief',
                      `${selectedScenario.name} CNO Prep Brief`
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText size={16} /> CNO Brief
                  </a>
                  <a
                    href={reportHref('kam-safe-pack')}
                    onClick={(event) => openReport(
                      event,
                      reportHref('kam-safe-pack'),
                      'kam_cam_cascade_pack',
                      `${selectedScenario.name} KAM-safe Pack`
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileText size={16} /> KAM Pack
                  </a>
                </div>
              </div>
            </div>

            <div className="atlas-scenario-modeling-grid">
              <section className="atlas-scenario-live-cockpit" aria-label="Live scenario impact cockpit">
                <div className="atlas-panel-title">
                  <span>Need-to-know impact</span>
                  <strong>Scenario cockpit</strong>
                </div>
                <div className="atlas-scenario-data-strip simplified" aria-label="Selected scenario data">
                  <article className={manualModel.netRevenueImpactEuros >= 3500000 ? metricTone('good') : metricTone('watch')}>
                    <span>Value protected</span>
                    <strong>{formatSignedEuros(manualModel.netRevenueImpactEuros)}</strong>
                    <em>Modeled net revenue impact</em>
                  </article>
                  <article className={manualModel.grossMarginImpactBps >= 50 ? metricTone('good') : manualModel.grossMarginImpactBps >= 25 ? metricTone('watch') : metricTone('bad')}>
                    <span>Margin</span>
                    <strong>{bps(manualModel.grossMarginImpactBps)}</strong>
                    <em>Gross margin movement</em>
                  </article>
                  <article className={manualModel.probabilityToLandPct >= 65 ? metricTone('good') : manualModel.probabilityToLandPct >= 45 ? metricTone('watch') : metricTone('bad')}>
                    <span>Chance to land</span>
                    <strong>{manualModel.probabilityToLandPct}%</strong>
                    <em>Modeled acceptance likelihood</em>
                  </article>
                  <article className={guardrailTone(manualModel.redLineProximity)}>
                    <span>Guardrail</span>
                    <strong>{manualModel.redLineProximity}</strong>
                    <em>{manualModel.sanctionRisk} sanction risk</em>
                  </article>
                </div>
                <p className="atlas-scenario-cockpit-note">
                  Current setup: {pct(manual.priceMovePct)} price move, {pct(manual.concessionPct)} concession, {pct(manualModel.volumeImpactPct)} volume impact, {eurosWhole(manualModel.tradeSpendEuros)} total support.
                </p>
              </section>

              <div className="atlas-scenario-control-stack">
                <section className="atlas-ai-assumption-model" aria-label="Model assumptions">
                  <div className="atlas-scenario-detail-section-head">
                    <span>Model assumptions</span>
                    <strong>Pricing inputs</strong>
                  </div>
                  <div className="atlas-assumption-control-grid">
                    <article className="atlas-assumption-control">
                      <span>Price move</span>
                      <div className="atlas-assumption-stepper" aria-label="Manual price move">
                        <button aria-label="Decrease price move" disabled={manual.priceMovePct <= 1} onClick={() => stepManual('priceMovePct', -.1, 1, 5, 1)} type="button"><Minus size={14} /></button>
                        <b>{pct(manual.priceMovePct)}</b>
                        <button aria-label="Increase price move" disabled={manual.priceMovePct >= 5} onClick={() => stepManual('priceMovePct', .1, 1, 5, 1)} type="button"><Plus size={14} /></button>
                      </div>
                      <em>Base ask against Carrefour.</em>
                    </article>
                    <article className="atlas-assumption-control">
                      <span>Concession</span>
                      <div className="atlas-assumption-stepper" aria-label="Manual concession">
                        <button aria-label="Decrease concession" disabled={manual.concessionPct <= 0} onClick={() => stepManual('concessionPct', -.1, 0, 3, 1)} type="button"><Minus size={14} /></button>
                        <b>{pct(manual.concessionPct)}</b>
                        <button aria-label="Increase concession" disabled={manual.concessionPct >= 3} onClick={() => stepManual('concessionPct', .1, 0, 3, 1)} type="button"><Plus size={14} /></button>
                      </div>
                      <em>Give from the price position.</em>
                    </article>
                    <article className="atlas-assumption-control">
                      <span>Trade investment</span>
                      <div className="atlas-assumption-stepper" aria-label="Manual trade investment">
                        <button aria-label="Decrease trade investment" disabled={manual.tradeInvestmentEuros <= 0} onClick={() => stepManual('tradeInvestmentEuros', -50000, 0, 2000000, 0)} type="button"><Minus size={14} /></button>
                        <b>{eurosWhole(manual.tradeInvestmentEuros)}</b>
                        <button aria-label="Increase trade investment" disabled={manual.tradeInvestmentEuros >= 2000000} onClick={() => stepManual('tradeInvestmentEuros', 50000, 0, 2000000, 0)} type="button"><Plus size={14} /></button>
                      </div>
                      <em>Incremental support spend.</em>
                    </article>
                    <article className="atlas-assumption-control">
                      <span>Elasticity</span>
                      <div className="atlas-assumption-stepper" aria-label="Manual volume elasticity">
                        <button aria-label="Decrease volume elasticity" disabled={manual.volumeElasticity <= .1} onClick={() => stepManual('volumeElasticity', -.05, .1, 1.2, 2)} type="button"><Minus size={14} /></button>
                        <b>{manual.volumeElasticity.toFixed(2)}</b>
                        <button aria-label="Increase volume elasticity" disabled={manual.volumeElasticity >= 1.2} onClick={() => stepManual('volumeElasticity', .05, .1, 1.2, 2)} type="button"><Plus size={14} /></button>
                      </div>
                      <em>Volume sensitivity to price.</em>
                    </article>
                    <article className="atlas-assumption-control">
                      <span>Sanction pressure</span>
                      <div className="atlas-assumption-stepper" aria-label="Manual sanction pressure">
                        <button aria-label="Decrease sanction pressure" disabled={manual.sanctionPressurePct <= 0} onClick={() => stepManual('sanctionPressurePct', -5, 0, 100, 0)} type="button"><Minus size={14} /></button>
                        <b>{manual.sanctionPressurePct}%</b>
                        <button aria-label="Increase sanction pressure" disabled={manual.sanctionPressurePct >= 100} onClick={() => stepManual('sanctionPressurePct', 5, 0, 100, 0)} type="button"><Plus size={14} /></button>
                      </div>
                      <em>Current customer escalation read.</em>
                    </article>
                  </div>
                </section>

                <section className="atlas-ai-manual-model" aria-label="Manual scenario adjustments">
                  <div className="atlas-panel-title">
                    <span>Adjustable levers</span>
                    <strong>Commercial moves</strong>
                  </div>
                  <div className="atlas-lever-impact-summary" aria-label="Lever impact summary">
                    <article><span>Support spend</span><strong>{eurosWhole(leverModel.tradeSpendEuros)}</strong></article>
                    <article><span>Value impact</span><strong>{formatSignedEuros(leverModel.netRevenueDeltaEuros)}</strong></article>
                    <article><span>Chance to land</span><strong>{leverModel.probabilityDeltaPts >= 0 ? '+' : ''}{leverModel.probabilityDeltaPts} pts</strong></article>
                  </div>
                  <div className="atlas-lever-control-list">
                    {leverModel.impacts.map(({ impact, lever, level }) => (
                      <article className={`atlas-lever-control tone-${leverTone(lever)} ${level > 0 ? 'active' : ''}`} key={lever.id}>
                        <div className="atlas-lever-control-head">
                          <span>{lever.owner} / {lever.availability.replaceAll('_', ' ')}</span>
                          <strong>{lever.label}</strong>
                        </div>
                        <div className="atlas-lever-control-stepper" aria-label={`${lever.label} intensity`}>
                          <button
                            aria-label={`Decrease ${lever.label}`}
                            disabled={level === 0}
                            onClick={() => updateLeverLevel(lever.id, Math.max(0, level - 10))}
                            type="button"
                          >
                            <Minus size={14} />
                          </button>
                          <b>{level}%</b>
                          <button
                            aria-label={`Increase ${lever.label}`}
                            disabled={level === 100}
                            onClick={() => updateLeverLevel(lever.id, Math.min(100, level + 10))}
                            type="button"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="atlas-lever-control-deltas">
                          <span>Spend {eurosWhole(impact.tradeSpendEuros)}</span>
                          <span>Value {formatSignedEuros(impact.netRevenueDeltaEuros)}</span>
                          <span>Land {impact.probabilityDeltaPts >= 0 ? '+' : ''}{impact.probabilityDeltaPts} pts</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <section className="atlas-scenario-decision-grid" aria-label="CNO decision support">
              <article>
                <span>Use this when</span>
                <strong>{selectedScenario.trigger}</strong>
              </article>
              <article>
                <span>Say back</span>
                <strong>{selectedScenario.customerNarrative}</strong>
              </article>
              <article className={approvalRequiredLevers.length ? 'tone-approval' : ''}>
                <span>Approval gate</span>
                <strong>{approvalRequiredLevers.length ? `${approvalRequiredLevers.length} selected lever(s) need approval before field guidance.` : 'No selected lever requires escalation.'}</strong>
              </article>
              <article className={manualModel.redLineProximity === 'breach' ? 'tone-breach' : manualModel.redLineProximity === 'watch' ? 'tone-watch' : ''}>
                <span>Do not reveal</span>
                <strong>Red line, fallback thresholds, sensitive margin controls, or confidence gaps.</strong>
              </article>
            </section>

            <section className="atlas-scenario-deep-dive" aria-label="Scenario details">
              <section className="atlas-pressure-review-section">
                <div className="atlas-scenario-detail-section-head">
                  <span>Customer pressure</span>
                  <strong>Likely objections and responses</strong>
                </div>
                <div className="atlas-pressure-list">
                  {record.pushbackMap.map((item, index) => (
                    <article key={item.id}>
                      <div className="atlas-pressure-rank">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <AlertTriangle size={15} />
                      </div>
                      <div className="atlas-pressure-copy">
                        <strong>{item.objection}</strong>
                        <p>{item.recommendedResponse}</p>
                      </div>
                      <div className="atlas-pressure-meta">
                        <span>{item.quantifiedExposure}</span>
                        <em>{item.confidence} confidence</em>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="atlas-evidence-review-section">
                <div className="atlas-scenario-detail-section-head">
                  <span>Evidence and confidence</span>
                  <strong>Trust layer</strong>
                </div>
                <div className="atlas-confidence-note-list">
                  {selectedScenario.confidenceNotes.map((note) => (
                    <article className="atlas-confidence-note" key={note}>
                      <Database size={15} />
                      <p>{note}</p>
                    </article>
                  ))}
                </div>
                <div className="atlas-evidence-claim-list">
                  {selectedEvidenceClaims.map((claim) => (
                    <article className="atlas-evidence-row" key={claim.id}>
                      <div>
                        <span>{evidenceLabel(claim.label)}</span>
                        <strong>{claim.claim}</strong>
                      </div>
                      <dl>
                        <div>
                          <dt>Confidence</dt>
                          <dd>{claim.confidence}</dd>
                        </div>
                        <div>
                          <dt>Freshness</dt>
                          <dd>{claim.freshness}</dd>
                        </div>
                        <div>
                          <dt>Source</dt>
                          <dd>{claim.source}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="atlas-scenario-detail-section-head">
                  <span>Output shelf</span>
                  <strong>{draftOutputs.length ? `${draftOutputs.length} draft output(s)` : 'No drafts yet'}</strong>
                </div>
                {draftOutputs.length ? draftOutputs.map((output) => (
                  <article className="atlas-ai-proof" key={output.id}>
                    <FileText size={15} />
                    <div>
                      <strong>{output.title}</strong>
                      <p>{output.type.replaceAll('_', ' ')} created from {selectedScenario.name}. Sensitive red-line details remain internal until audience mode is selected.</p>
                    </div>
                  </article>
                )) : (
                  <article className="atlas-ai-proof">
                    <FileText size={15} />
                    <p>Approve or generate a brief to create a durable work item from this scenario.</p>
                  </article>
                )}
              </section>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
