'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Database,
  Edit3,
  FileText,
  PenLine,
  ShieldCheck,
} from 'lucide-react';
import { pct } from '@/src/lib/atlas/assistant';
import {
  demoNegotiation,
  demoStrategyWatchouts,
  demoVisualEvidenceModules,
  getScenario
} from '@/src/lib/atlas/demo-data';
import type { VisualEvidenceModule } from '@/src/lib/atlas/types';

type StrategyPanelId = 'narrative' | 'evidence' | 'scenario' | 'watchouts' | 'changes';

const panelItems: Array<{ id: StrategyPanelId; label: string; intent: string }> = [
  { id: 'narrative', label: 'Strategy narrative', intent: 'Position, defense logic, proof needed' },
  { id: 'evidence', label: 'Proof points', intent: 'Evidence that supports the strategy' },
  { id: 'scenario', label: 'Strategy Stress Test', intent: 'Model a move inside this strategy' },
  { id: 'watchouts', label: 'Watchouts', intent: 'What can strengthen or weaken this' },
  { id: 'changes', label: 'Strategy changes', intent: 'v2 to v3 diff and sign-off' }
];

const storyboardRoles = [
  'Set the pricing guardrail',
  'Prove cost pressure',
  'Address affordability pressure',
  'Protect promo execution',
  'Show the fallback path'
];

const proofPointQuestions = [
  'Can we defend the 3.0% counter inside the approved pricing corridor?',
  'Do current cost pressures justify holding price?',
  'How do we answer private label and shelf-price pressure?',
  'What execution risk needs to be managed before we commit?',
  'What fallback can we offer without breaking the strategy?'
];

function cleanLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function titleCase(value: string) {
  return cleanLabel(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stageLabel(value: string) {
  if (value === 'nego_execution') return 'Execution';
  return titleCase(value);
}

function normalizePanel(value?: string | string[] | null): StrategyPanelId {
  const panel = Array.isArray(value) ? value[0] : value;
  if (panel === 'evidence') return 'evidence';
  if (panel === 'scenario') return 'scenario';
  if (panel === 'watchouts') return 'watchouts';
  if (panel === 'changes') return 'changes';
  return 'narrative';
}

function panelFromHash(): StrategyPanelId | undefined {
  if (typeof window === 'undefined') return undefined;
  if (window.location.hash === '#visual-evidence') return 'evidence';
  if (window.location.hash === '#scenario') return 'scenario';
  if (window.location.hash === '#watchouts') return 'watchouts';
  if (window.location.hash === '#debrief') return 'changes';
  return undefined;
}

function evidenceMeta(module: VisualEvidenceModule) {
  return {
    confidence: module.source.confidence,
    source: module.source.source,
    updated: module.source.freshness
  };
}

function clampPct(value: number) {
  return Math.max(0, Math.min(100, value));
}

function barStyle(value: number): CSSProperties {
  return { '--value': `${clampPct(value)}%` } as CSSProperties;
}

function signedPct(value?: number) {
  if (value === undefined) return 'n/a';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function signedPoints(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} pts`;
}

function stressMoveFromPrompt(value?: string | null) {
  const normalized = value?.toLowerCase() ?? '';
  if (!normalized) return undefined;
  if (normalized.includes('germany') || normalized.includes('recovery') || normalized.includes('offset')) return 'offset';
  if (normalized.includes('3.2') || normalized.includes('promo') || normalized.includes('q4')) return 'fallback';
  if (normalized.includes('3.0') || normalized.includes('hold')) return 'hold';
  return 'custom';
}

type AtlasNegotiationOverviewProps = {
  initialPanel?: string | string[] | null;
  initialSavedAction?: string | string[] | null;
  initialScenarioPrompt?: string | string[] | null;
  initialStressMove?: string | string[] | null;
  initialVersion?: string | string[] | null;
  initialWorkingVersion?: string | string[] | null;
};

function firstQueryValue(value?: string | string[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AtlasNegotiationOverview({ initialPanel, initialSavedAction, initialScenarioPrompt, initialStressMove, initialVersion, initialWorkingVersion }: AtlasNegotiationOverviewProps) {
  const record = demoNegotiation;
  const activeScenario = getScenario(record);
  const fallbackScenario = record.scenarios.find((scenario) => scenario.id === 'scenario-tradeoff') ?? record.scenarios[3];
  const holdScenario = record.scenarios.find((scenario) => scenario.id === 'scenario-counter-3') ?? activeScenario;
  const germany = record.markets.find((market) => market.market === 'Germany');
  const [activePanel, setActivePanel] = useState<StrategyPanelId>(() => normalizePanel(initialPanel));
  const currentUpdate = record.strategyUpdates[0];
  const priorUpdate = record.strategyUpdates[1];
  const initialVersionValue = firstQueryValue(initialVersion);
  const initialStrategyUpdate = record.strategyUpdates.find((update) => update.version === initialVersionValue || update.id === initialVersionValue) ?? currentUpdate;
  const initialWorkingVersionValue = firstQueryValue(initialWorkingVersion);
  const initialWorkingStrategyUpdate = record.strategyUpdates.find((update) => update.version === initialWorkingVersionValue || update.id === initialWorkingVersionValue) ?? currentUpdate;
  const [selectedStrategyUpdateId, setSelectedStrategyUpdateId] = useState(initialStrategyUpdate?.id ?? '');
  const [workingStrategyUpdateId, setWorkingStrategyUpdateId] = useState(initialWorkingStrategyUpdate?.id ?? '');
  const [strategyCommand, setStrategyCommand] = useState('');
  const selectedStrategyUpdate = record.strategyUpdates.find((update) => update.id === selectedStrategyUpdateId) ?? currentUpdate;
  const selectedStrategyIndex = record.strategyUpdates.findIndex((update) => update.id === selectedStrategyUpdate?.id);
  const strategyVersion = currentUpdate?.version ?? record.strategyVersion.replace(' working', '');
  const weakeningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status !== 'supports_strategy');
  const strengtheningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status === 'supports_strategy');
  const customerHistory = [
    ...record.strategyUpdates.map((update) => ({
      action: update.signoffNeeded,
      confidence: update.source.confidence,
      date: update.date,
      detail: update.summary,
      source: update.source.source,
      title: `Strategy ${update.version}`,
      type: 'strategy version',
      whatChanged: update.changes.join(' ')
    })),
    ...record.timelineEvents.map((event) => ({
      action: event.whatChanged ?? 'Captured as part of the negotiation source of truth.',
      confidence: event.source.confidence,
      date: event.date,
      detail: event.detail,
      source: event.source.source,
      title: event.title,
      type: titleCase(event.kind),
      whatChanged: event.whatChanged ?? event.detail
    })),
    ...record.debriefCaptures.map((debrief) => ({
      action: debrief.nextSteps.join(' '),
      confidence: debrief.confidence,
      date: debrief.capturedAt,
      detail: debrief.rawNotes,
      source: `${titleCase(debrief.captureMode)} debrief capture`,
      title: debrief.title,
      type: 'debrief',
      whatChanged: debrief.scenarioAssumptionUpdates.join(' ')
    })),
    ...record.externalRiskFactors.map((factor) => ({
      action: factor.relevance,
      confidence: factor.source.confidence,
      date: factor.source.freshness,
      detail: factor.source.value,
      source: factor.source.source,
      title: factor.title,
      type: `external ${titleCase(factor.riskType)}`,
      whatChanged: factor.relevance
    })),
    ...record.missingInformationTasks.map((task) => ({
      action: task.recommendedAction ?? task.reason,
      confidence: task.priority,
      date: task.deadline ? `Due ${task.deadline}` : 'Open task',
      detail: task.reason,
      source: `${task.owner} task queue`,
      title: task.title,
      type: `task · ${titleCase(task.status)}`,
      whatChanged: task.reason
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  const scenarioMoves = [
    {
      id: 'hold',
      label: 'A',
      title: 'Hold 3.0%',
      scenario: holdScenario,
      when: 'Use when Carrefour needs a firm answer and finance has not validated incremental offsets.',
      benefit: 'Protects the France red line while keeping the response commercially defensible.',
      risk: 'May not be enough if buyer converts promo pressure into a formal condition.',
      validation: 'Confirm whether promo exclusion threat is real or still negotiating posture.',
      priceMovement: '3.0% counter',
      promoTrade: 'No incremental promo spend',
      volumeAssumption: 'Base volume plan',
      marketOffset: 'France only',
      buyerValueStory: 'Defend with cost pressure, branded value, and category support.',
      approvalDependency: 'CNO can hold; no new finance approval unless buyer asks for funding.',
      strategyImplication: 'Supports current Strategy v3. Keeps the sell story simple and protects the red line.',
      sellStoryImpact: 'Keeps cost pressure and branded value as the lead proof points.',
      evidenceNeeded: 'Refresh promo threat language and keep price corridor proof current.',
      result: 'Current strategy remains valid. Save only if Carrefour confirms promo pressure is posture, not a condition.'
    },
    {
      id: 'fallback',
      label: 'B',
      title: '3.2% + Q4 promo phasing',
      scenario: fallbackScenario,
      when: 'Use only if the buyer rejects 3.0% and asks for visible value support.',
      benefit: 'Creates a buyer-facing concession without moving directly to the 4.2% ask.',
      risk: 'Depends on promo phasing and can dilute the clean cost-pressure story.',
      validation: record.blockingIssue,
      priceMovement: '3.2% counter',
      promoTrade: 'Q4 promo phasing',
      volumeAssumption: '+0.8% activation support',
      marketOffset: 'Germany recovery watch',
      buyerValueStory: 'Give Carrefour visible support while keeping permanent base-price movement controlled.',
      approvalDependency: 'Requires finance validation on Germany volume recovery before becoming official.',
      strategyImplication: 'Viable fallback. Could become Draft Strategy v4 after validation.',
      sellStoryImpact: 'Adds shopper activation and phasing to the sell story; cost pressure remains the anchor.',
      evidenceNeeded: 'Germany volume forecast, Q4 promo calendar, updated shelf-price pressure read.',
      result: 'Viable fallback. 3.2% + Q4 promo phasing may improve acceptance, but should not be saved as v4 until finance validates Germany recovery.'
    },
    {
      id: 'offset',
      label: 'C',
      title: 'Germany volume recovery / market offset',
      scenario: fallbackScenario,
      when: 'Use if CNO wants a cross-market bridge for the buying group strategy.',
      benefit: germany ? `${germany.market} can carry part of the value story if ${cleanLabel(germany.offsetRole)} is validated.` : 'Provides a cross-market support case for the fallback.',
      risk: 'Buyer may reject cross-market logic if France shelf pressure remains the anchor.',
      validation: 'Finance needs to validate the Germany volume recovery assumption before sign-off.',
      priceMovement: '3.0-3.2% range',
      promoTrade: 'Local scope tradeoff',
      volumeAssumption: 'Germany recovery required',
      marketOffset: 'Germany offsets France pressure',
      buyerValueStory: 'Frame the buying-group package as balanced value across markets, not a France-only concession.',
      approvalDependency: 'Finance and market leads must validate recovery before CNO sign-off.',
      strategyImplication: 'Useful stress test, but too dependent on cross-market assumptions to make official now.',
      sellStoryImpact: 'Broadens the sell story from France defense to buying-group value balance.',
      evidenceNeeded: 'Germany volume bridge, market-level margin guardrails, Eurelec comparability check.',
      result: 'Keep as exploratory. It can support leadership discussion, but should remain a draft until market owners validate the offset.'
    },
    {
      id: 'custom',
      label: 'D',
      title: 'Custom move',
      scenario: fallbackScenario,
      when: 'Use when the CNO wants to quickly test a buyer ask or internal alternative.',
      benefit: 'Creates a fast read on whether a new move belongs in the strategy draft.',
      risk: 'Needs evidence before it can be used externally or sent for approval.',
      validation: 'Validate source assumptions before saving.',
      priceMovement: 'Editable',
      promoTrade: 'Editable',
      volumeAssumption: 'Editable',
      marketOffset: 'Editable',
      buyerValueStory: 'Shape the buyer value story after the levers are set.',
      approvalDependency: 'Depends on the modeled lever mix.',
      strategyImplication: 'Draft move. Use the levers to see whether it supports, weakens, or changes the strategy.',
      sellStoryImpact: 'Depends on the modeled lever mix.',
      evidenceNeeded: 'Source the pricing, promo, volume, and market-offset assumptions used in the custom move.',
      result: 'Custom move created as a working stress test. It should remain a draft until the assumptions are sourced.'
    }
  ];
  const initialScenarioPromptValue = firstQueryValue(initialScenarioPrompt);
  const initialStressMoveValue = firstQueryValue(initialStressMove) ?? stressMoveFromPrompt(initialScenarioPromptValue);
  const [selectedStressMoveId, setSelectedStressMoveId] = useState(initialStressMoveValue ?? 'fallback');
  const [savedStressAction, setSavedStressAction] = useState(firstQueryValue(initialSavedAction) ?? '');
  const selectedStressMove = scenarioMoves.find((move) => move.id === selectedStressMoveId) ?? scenarioMoves[1];
  const modelScenarioMoves = scenarioMoves.slice(0, 3);
  const [scenarioModels, setScenarioModels] = useState(() => Object.fromEntries(
    modelScenarioMoves.map((move) => [move.id, {
      concession: move.scenario.concessionPct,
      marketOffset: move.id === 'offset' ? 70 : 25,
      price: move.scenario.priceMovePct,
      timing: move.id === 'fallback' ? 70 : 35,
      trade: move.scenario.tradeSpendChangePct ?? 0,
      volume: move.scenario.volumeImpactPct
    }])
  ));
  const selectedScenarioModel = scenarioModels[selectedStressMove.id] ?? scenarioModels.fallback;
  const gapToTarget = Number((record.pricingPosition.targetPriceIncreasePct.value - selectedScenarioModel.price).toFixed(1));
  const gapToRedLine = Number((record.pricingPosition.redLinePriceIncreasePct.value - selectedScenarioModel.price).toFixed(1));
  const marginImpact = Number((
    (selectedStressMove.scenario.marginImpactPct ?? selectedStressMove.scenario.grossMarginImpactBps / 100)
    + (selectedScenarioModel.price - selectedStressMove.scenario.priceMovePct) * 0.7
    - (selectedScenarioModel.trade - (selectedStressMove.scenario.tradeSpendChangePct ?? 0)) * 0.35
    + (selectedScenarioModel.volume - selectedStressMove.scenario.volumeImpactPct) * 0.04
  ).toFixed(1));
  const probabilityToLand = Math.round(clampPct(
    selectedStressMove.scenario.probabilityToLandPct
    + (selectedScenarioModel.price - selectedStressMove.scenario.priceMovePct) * 8
    + (selectedScenarioModel.trade - (selectedStressMove.scenario.tradeSpendChangePct ?? 0)) * 18
    + (selectedScenarioModel.timing - 50) * 0.08
    + (selectedScenarioModel.marketOffset - 50) * 0.05
  ));
  const acceptanceLabel = probabilityToLand >= 76 ? 'High' : probabilityToLand >= 62 ? 'Medium-high' : probabilityToLand >= 48 ? 'Medium' : 'Low';
  const validationNeeded = selectedStressMove.id === 'fallback' || selectedStressMove.id === 'offset' || selectedScenarioModel.marketOffset > 55 || selectedScenarioModel.trade > 0.35;
  const breachesGuardrail = gapToRedLine < -0.4 || selectedScenarioModel.price >= record.pricingPosition.currentCustomerAskPct.value;
  const supportsStrategy = !breachesGuardrail && !validationNeeded && selectedScenarioModel.price <= record.pricingPosition.redLinePriceIncreasePct.value + 0.05;
  const resultState = breachesGuardrail ? 'breach' : validationNeeded ? 'validation' : supportsStrategy ? 'supports' : 'changes';
  const resultTone = resultState === 'breach' ? 'risk' : resultState === 'validation' || resultState === 'changes' ? 'watch' : 'good';
  const strategyResult = resultState === 'breach'
    ? 'Weakens strategy; do not approve.'
    : resultState === 'validation'
      ? 'Viable fallback, but not ready to approve.'
      : resultState === 'supports'
        ? 'Supports current Strategy v3.'
        : 'Changes the strategy; save only as a draft.';
  const resultWhy = resultState === 'breach'
    ? 'The move creates too much red-line pressure and would need leadership escalation before it can be used.'
    : resultState === 'validation'
      ? 'It improves buyer acceptance, but depends on validation of Germany recovery, promo funding, or timing assumptions.'
      : resultState === 'supports'
        ? 'It keeps the formal counter anchored to the current strategy and does not create a new approval dependency.'
        : 'It changes the sell story enough that the strategy draft should be updated before use.';
  const resultActions = resultState === 'breach'
    ? {
      primary: 'Discard move',
      secondary: ['Save as rejected scenario', 'View risk detail']
    }
    : resultState === 'validation'
      ? {
        primary: 'Save as fallback pending validation',
        secondary: ['Send for finance validation', 'Add visual to sell story', 'Discard']
      }
      : {
        primary: 'Add to strategy draft',
        secondary: ['Save as evidence', 'Use in Live Negotiator']
      };
  useEffect(() => {
    setActivePanel(panelFromHash() ?? normalizePanel(initialPanel));
    const versionValue = firstQueryValue(initialVersion);
    const updateFromRoute = record.strategyUpdates.find((update) => update.version === versionValue || update.id === versionValue);
    if (updateFromRoute) setSelectedStrategyUpdateId(updateFromRoute.id);
    const workingVersionValue = firstQueryValue(initialWorkingVersion);
    const workingUpdateFromRoute = record.strategyUpdates.find((update) => update.version === workingVersionValue || update.id === workingVersionValue);
    if (workingUpdateFromRoute) setWorkingStrategyUpdateId(workingUpdateFromRoute.id);
    const stressMoveValue = firstQueryValue(initialStressMove);
    const scenarioPromptValue = firstQueryValue(initialScenarioPrompt);
    const moveFromPrompt = stressMoveFromPrompt(scenarioPromptValue);
    if (stressMoveValue) setSelectedStressMoveId(stressMoveValue);
    else if (moveFromPrompt) setSelectedStressMoveId(moveFromPrompt);
    setSavedStressAction(firstQueryValue(initialSavedAction) ?? '');
  }, [initialPanel, initialSavedAction, initialScenarioPrompt, initialStressMove, initialVersion, initialWorkingVersion, record.strategyUpdates]);

  function selectPanel(panel: StrategyPanelId) {
    setActivePanel(panel);
    if (typeof window === 'undefined') return;

    const hashByPanel: Record<StrategyPanelId, string> = {
      narrative: '#strategy-narrative',
      evidence: '#visual-evidence',
      scenario: '#scenario',
      watchouts: '#watchouts',
      changes: '#debrief'
    };

    window.history.replaceState(null, '', hashByPanel[panel]);
  }

  function handleStrategyCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = strategyCommand.trim().toLowerCase();
    if (!command) return;

    if (command.includes('live') || command.includes('listen') || command.includes('negotiator')) {
      window.location.href = `/negotiation/${record.id}/live`;
      return;
    }

    if (command.includes('deck') || command.includes('presentation') || command.includes('powerpoint')) {
      window.open(deckHref(), '_blank', 'noopener,noreferrer');
      return;
    }

    if (command.includes('brief') || command.includes('cno')) {
      window.open(`/negotiation/${record.id}/report/cno-prep-brief`, '_blank', 'noopener,noreferrer');
      return;
    }

    if (command.includes('scenario') || command.includes('model') || command.includes('3.2') || command.includes('fallback')) {
      setActivePanel('scenario');
      window.history.replaceState(null, '', `/negotiation/${record.id}?panel=scenario&scenarioPrompt=${encodeURIComponent(strategyCommand)}#scenario`);
      return;
    }

    if (command.includes('proof') || command.includes('evidence') || command.includes('source')) {
      setActivePanel('evidence');
      window.history.replaceState(null, '', `/negotiation/${record.id}?panel=evidence#visual-evidence`);
      return;
    }

    if (command.includes('risk') || command.includes('watchout') || command.includes('changed')) {
      setActivePanel('watchouts');
      window.history.replaceState(null, '', `/negotiation/${record.id}?panel=watchouts#watchouts`);
      return;
    }

    setActivePanel('narrative');
    window.history.replaceState(null, '', `/negotiation/${record.id}?panel=narrative#strategy-narrative`);
  }

  function panelHref(panel: StrategyPanelId) {
    const hashByPanel: Record<StrategyPanelId, string> = {
      narrative: '#strategy-narrative',
      evidence: '#visual-evidence',
      scenario: '#scenario',
      watchouts: '#watchouts',
      changes: '#debrief'
    };

    return `/negotiation/${record.id}?panel=${panel}${hashByPanel[panel]}`;
  }

  function deckHref() {
    return `/negotiation/${record.id}/report/strategy-deck`;
  }

  function powerpointHref() {
    return `/api/atlas/strategy-deck?negotiationId=${record.id}`;
  }

  function versionHref(version: string) {
    const workingVersion = record.strategyUpdates.find((update) => update.id === workingStrategyUpdateId)?.version ?? strategyVersion;
    return `/negotiation/${record.id}?panel=changes&version=${version}&workingVersion=${workingVersion}#debrief`;
  }

  function restoreVersionHref(version?: string) {
    return `/negotiation/${record.id}?panel=changes&version=${version ?? strategyVersion}&workingVersion=${version ?? strategyVersion}#debrief`;
  }

  function stressMoveHref(moveId: string) {
    return `/negotiation/${record.id}?panel=scenario&stressMove=${moveId}#scenario`;
  }

  function stressActionHref(action: string) {
    return `/negotiation/${record.id}?panel=scenario&stressMove=${selectedStressMove.id}&savedAction=${encodeURIComponent(action)}#scenario`;
  }

  function updateScenarioModel(moveId: string, key: keyof typeof selectedScenarioModel, value: number) {
    setScenarioModels((current) => ({
      ...current,
      [moveId]: {
        ...current[moveId],
        [key]: value
      }
    }));
  }

  function modeledScenario(move: typeof modelScenarioMoves[number]) {
    const values = scenarioModels[move.id];
    const targetGap = Number((record.pricingPosition.targetPriceIncreasePct.value - values.price).toFixed(1));
    const redLineGap = Number((record.pricingPosition.redLinePriceIncreasePct.value - values.price).toFixed(1));
    const margin = Number((
      (move.scenario.marginImpactPct ?? move.scenario.grossMarginImpactBps / 100)
      + (values.price - move.scenario.priceMovePct) * 0.7
      - (values.trade - (move.scenario.tradeSpendChangePct ?? 0)) * 0.35
      + (values.volume - move.scenario.volumeImpactPct) * 0.04
    ).toFixed(1));
    const probability = Math.round(clampPct(
      move.scenario.probabilityToLandPct
      + (values.price - move.scenario.priceMovePct) * 8
      + (values.trade - (move.scenario.tradeSpendChangePct ?? 0)) * 18
      + (values.timing - 50) * 0.08
      + (values.marketOffset - 50) * 0.05
    ));
    const tone = redLineGap < -0.4 ? 'risk' : values.trade > 0.35 || values.marketOffset > 55 ? 'watch' : 'good';
    return { margin, probability, redLineGap, targetGap, tone, values };
  }

  function corridorMarkerStyle(value: number): CSSProperties {
    const ask = record.pricingPosition.currentCustomerAskPct.value;
    const redLine = record.pricingPosition.redLinePriceIncreasePct.value;
    const low = redLine - 0.7;
    const high = ask + 0.2;
    const left = ((value - low) / (high - low)) * 100;
    return { left: `${clampPct(left)}%` };
  }

  function renderActivePanel() {
    if (activePanel === 'evidence') {
      return (
        <section className="atlas-brief-panel-section" id="visual-evidence" aria-label="Strategy proof points">
          <div className="atlas-brief-panel-head">
            <span>Proof points</span>
            <h2>Evidence ATLAS would use to defend this strategy</h2>
            <p>Read this as the proof plan for the deck: each item answers one buyer or leadership question, shows the source, and tells you whether it is ready to use.</p>
          </div>

          <div className="atlas-storyboard-list">
            {demoVisualEvidenceModules.map((module, index) => {
              const meta = evidenceMeta(module);
              const isReady = index < 2;
              return (
                <details className={`atlas-storyboard-item ${isReady ? 'is-ready' : 'needs-review'}`} key={module.id}>
                  <summary className="atlas-storyboard-summary">
                    <div className="atlas-storyboard-step">
                      <span>{index + 1}</span>
                      <strong>{storyboardRoles[index] ?? module.deckUse}</strong>
                    </div>
                    <div className="atlas-storyboard-title">
                      <div>
                        <h3>{module.title}</h3>
                        <span>{isReady ? 'Ready' : 'Needs review'}</span>
                      </div>
                      <p>{module.keyTakeaway}</p>
                      <div className="atlas-proof-meta-strip">
                        <span>{titleCase(module.source.label)}</span>
                        <span>{titleCase(meta.confidence)} confidence</span>
                        <span>{meta.updated}</span>
                      </div>
                    </div>
                    <div className="atlas-storyboard-status" aria-hidden="true">
                      <span>Source trail</span>
                      <ChevronDown size={16} />
                    </div>
                    <div className="atlas-proof-metric-strip">
                      {module.proofMetrics.slice(0, 4).map((metric) => (
                        <div className={`atlas-proof-metric ${metric.status}`} key={`${module.id}-${metric.label}`}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                          <em>{metric.note}</em>
                        </div>
                      ))}
                    </div>
                  </summary>
                  <div className="atlas-storyboard-body">
                    <div className="atlas-storyboard-copy">
                      <div className="atlas-proof-question">
                        <span>Question this answers</span>
                        <strong>{proofPointQuestions[index] ?? module.deckUse}</strong>
                      </div>
                      <dl>
                        <div><dt>Used for</dt><dd>{module.deckUse}</dd></div>
                        <div><dt>Readiness</dt><dd>{isReady ? 'Can be used in deck draft now' : 'Needs CNO review before sharing'}</dd></div>
                      </dl>
                      <div className="atlas-proof-source-map">
                        <h4>Metric basis</h4>
                        <dl>
                          {module.proofMetrics.map((metric) => (
                            <div key={`${module.id}-${metric.label}-basis`}>
                              <dt>{metric.label}</dt>
                              <dd>{titleCase(metric.sourceLabel)} · {metric.note}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                    <div className="atlas-source-detail">
                      <h4>Source trail</h4>
                      <dl>
                        <div><dt>Source type</dt><dd>{titleCase(module.source.label)}</dd></div>
                        <div><dt>Source</dt><dd>{meta.source}</dd></div>
                        <div><dt>Last updated</dt><dd>{meta.updated}</dd></div>
                        <div><dt>Confidence</dt><dd>{titleCase(meta.confidence)}</dd></div>
                        <div><dt>Source value</dt><dd>{module.source.value}</dd></div>
                      </dl>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      );
    }

    if (activePanel === 'scenario') {
      return (
        <section className="atlas-brief-panel-section atlas-model-workbench-section" id="scenario" aria-label="Strategy Stress Test">
          <div className="atlas-brief-panel-head">
            <span>Strategy Stress Test</span>
            <h2>Compare the moves that could change the Carrefour strategy</h2>
            <p>Use this as the live pricing workbench: adjust each scenario and watch the approval, margin, target, and red-line math move in place.</p>
          </div>

          <div className="atlas-model-corridor" aria-label="Pricing corridor">
            <div className="atlas-model-corridor-copy">
              <span>Pricing corridor</span>
              <strong>Buyer ask, PepsiCo target, and red line stay visible while scenarios move.</strong>
            </div>
            <div className="atlas-model-corridor-visual" aria-hidden="true">
              <div className="atlas-model-corridor-track">
                <i className="red-line" style={corridorMarkerStyle(record.pricingPosition.redLinePriceIncreasePct.value)} />
                <i className="target" style={corridorMarkerStyle(record.pricingPosition.targetPriceIncreasePct.value)} />
                <i className="ask" style={corridorMarkerStyle(record.pricingPosition.currentCustomerAskPct.value)} />
                <i className="selected" style={corridorMarkerStyle(selectedScenarioModel.price)} />
              </div>
            </div>
            <dl>
              <div><dt>Buyer ask</dt><dd>{pct(record.pricingPosition.currentCustomerAskPct.value)}</dd></div>
              <div><dt>Target</dt><dd>{pct(record.pricingPosition.targetPriceIncreasePct.value)}</dd></div>
              <div><dt>Red line</dt><dd>{pct(record.pricingPosition.redLinePriceIncreasePct.value)}</dd></div>
              <div><dt>Selected</dt><dd>{pct(selectedScenarioModel.price)}</dd></div>
            </dl>
          </div>

          <div className={`atlas-scenario-model-board ${resultTone}`} aria-label="Scenario comparison model">
            <div className="atlas-model-board-head">
              <div>
                <span>Editable model</span>
                <strong>Scenario comparison</strong>
                <em>Inputs above, outcomes below. Each column can be adjusted independently.</em>
              </div>
              <div className="atlas-model-board-status" aria-label="Model source and status">
                <span>Modeled estimate</span>
                <span>Source: Strategy v3</span>
                <span>{validationNeeded ? 'Validation pending' : 'Inside current guardrails'}</span>
              </div>
            </div>

            <div className="atlas-model-grid">
              <div className="atlas-model-corner" />
              {modelScenarioMoves.map((move) => {
                const modeled = modeledScenario(move);
                const statusLabel = modeled.tone === 'risk' ? 'Guardrail risk' : modeled.tone === 'watch' ? 'Needs validation' : 'Guardrail OK';
                return (
                  <a
                    className={selectedStressMove.id === move.id ? 'atlas-model-column-head active' : 'atlas-model-column-head'}
                    href={stressMoveHref(move.id)}
                    key={move.id}
                    onClick={() => setSelectedStressMoveId(move.id)}
                  >
                    <div className="atlas-model-column-title">
                      <span>{move.id === 'hold' ? 'Current position' : `Scenario ${move.label}`}</span>
                      <small className={modeled.tone}>{statusLabel}</small>
                    </div>
                    <strong>{move.title}</strong>
                    <em>{move.id === 'hold' ? 'Baseline counter used for Strategy v3.' : move.when}</em>
                    <dl>
                      <div><dt>Price</dt><dd>{pct(modeled.values.price)}</dd></div>
                      <div><dt>Accept</dt><dd>{modeled.probability}%</dd></div>
                      <div><dt>GM</dt><dd>{signedPct(modeled.margin)}</dd></div>
                    </dl>
                  </a>
                );
              })}

              <div className="atlas-model-section-label">Scenario inputs</div>
              {modelScenarioMoves.map((move) => <div className="atlas-model-section-fill" key={`${move.id}-inputs`} />)}

              {[
                { key: 'price', label: 'Price', max: 4.2, min: 2.5, step: 0.1, sub: 'vs buyer ask', value: (value: number) => pct(value), width: (value: number) => value / 4.2 * 100 },
                { key: 'trade', label: 'Trade spend', max: 0.8, min: 0, step: 0.1, sub: 'incremental support', value: (value: number) => pct(value), width: (value: number) => value / 0.8 * 100 },
                { key: 'concession', label: 'Concession', max: 1.8, min: 0, step: 0.1, sub: 'give from ask', value: (value: number) => pct(value), width: (value: number) => value / 1.8 * 100 },
                { key: 'volume', label: 'Volume support', max: 8, min: -2, step: 0.5, sub: 'modeled uplift', value: (value: number) => pct(value), width: (value: number) => (value + 2) / 10 * 100 },
                { key: 'marketOffset', label: 'Market offset', max: 100, min: 0, step: 5, sub: 'cross-market support', value: (value: number) => `${value}%`, width: (value: number) => value },
                { key: 'timing', label: 'Timing adjustment', max: 100, min: 0, step: 5, sub: 'phasing flexibility', value: (value: number) => `${value}%`, width: (value: number) => value }
              ].map((row) => (
                <div className="atlas-model-row" key={row.key}>
                  <div className="atlas-model-row-label">
                    <strong>{row.label}</strong>
                    <span>{row.sub}</span>
                  </div>
                  {modelScenarioMoves.map((move) => {
                    const values = scenarioModels[move.id];
                    const currentValue = values[row.key as keyof typeof values];
                    return (
                      <div className="atlas-model-slider-cell" key={`${move.id}-${row.key}`}>
                        <div className="atlas-model-value-line">
                          <div className="atlas-model-number-group">
                            <label className="atlas-model-number-control">
                              <input
                                aria-label={`${move.title} ${row.label} value`}
                                inputMode="decimal"
                                onChange={(event) => {
                                  const nextValue = Number(event.currentTarget.value);
                                  if (!Number.isNaN(nextValue)) {
                                    updateScenarioModel(
                                      move.id,
                                      row.key as keyof typeof selectedScenarioModel,
                                      Math.min(row.max, Math.max(row.min, nextValue))
                                    );
                                  }
                                }}
                                onInput={(event) => {
                                  const nextValue = Number(event.currentTarget.value);
                                  if (!Number.isNaN(nextValue)) {
                                    updateScenarioModel(
                                      move.id,
                                      row.key as keyof typeof selectedScenarioModel,
                                      Math.min(row.max, Math.max(row.min, nextValue))
                                    );
                                  }
                                }}
                                type="text"
                                value={currentValue}
                              />
                              <span>%</span>
                            </label>
                            <span className="atlas-model-number-stepper" aria-hidden="false">
                              <button
                                aria-label={`${move.title} decrease ${row.label}`}
                                onClick={() => updateScenarioModel(move.id, row.key as keyof typeof selectedScenarioModel, Math.max(row.min, Number((currentValue - row.step).toFixed(2))))}
                                type="button"
                              >
                                -
                              </button>
                              <button
                                aria-label={`${move.title} increase ${row.label}`}
                                onClick={() => updateScenarioModel(move.id, row.key as keyof typeof selectedScenarioModel, Math.min(row.max, Number((currentValue + row.step).toFixed(2))))}
                                type="button"
                              >
                                +
                              </button>
                            </span>
                          </div>
                          <em>{move.id === 'hold' ? 'baseline' : `${signedPoints(currentValue - (scenarioModels.hold[row.key as keyof typeof values] ?? 0))} vs base`}</em>
                        </div>
                        <div className="atlas-model-slider-track">
                          <i style={barStyle(row.width(currentValue))} />
                        </div>
                        <input
                          aria-label={`${move.title} ${row.label}`}
                          max={row.max}
                          min={row.min}
                          onChange={(event) => updateScenarioModel(move.id, row.key as keyof typeof selectedScenarioModel, Number(event.currentTarget.value))}
                          onInput={(event) => updateScenarioModel(move.id, row.key as keyof typeof selectedScenarioModel, Number(event.currentTarget.value))}
                          step={row.step}
                          style={barStyle(row.width(currentValue))}
                          type="range"
                          value={currentValue}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="atlas-model-section-label outcomes">Scenario outcomes</div>
              {modelScenarioMoves.map((move) => <div className="atlas-model-section-fill outcomes" key={`${move.id}-outcomes`} />)}

              {[
                { key: 'acceptance', label: 'Acceptance likelihood', sub: 'probability to land' },
                { key: 'target', label: 'Gap to target', sub: 'target 3.5%' },
                { key: 'redline', label: 'Gap to red line', sub: 'red line 3.0%' },
                { key: 'margin', label: 'Margin', sub: 'modeled GM impact' }
              ].map((row) => (
                <div className="atlas-model-row" key={row.key}>
                  <div className="atlas-model-row-label">
                    <strong>{row.label}</strong>
                    <span>{row.sub}</span>
                  </div>
                  {modelScenarioMoves.map((move) => {
                    const modeled = modeledScenario(move);
                    const valueByRow = {
                      acceptance: `${modeled.probability}%`,
                      margin: signedPct(modeled.margin),
                      redline: signedPoints(modeled.redLineGap),
                      target: signedPoints(modeled.targetGap)
                    };
                    const widthByRow = {
                      acceptance: modeled.probability,
                      margin: (modeled.margin + 2) / 3.2 * 100,
                      redline: (modeled.redLineGap + 1.2) / 2.4 * 100,
                      target: (modeled.targetGap + 1.2) / 2.4 * 100
                    };
                    return (
                      <div className={`atlas-model-outcome-cell ${modeled.tone}`} key={`${move.id}-${row.key}`}>
                        <strong>{valueByRow[row.key as keyof typeof valueByRow]}</strong>
                        <div className="atlas-model-outcome-bar">
                          <i style={barStyle(widthByRow[row.key as keyof typeof widthByRow])} />
                        </div>
                        {row.key === 'acceptance' ? <span>Unlikely <b>Possible</b> Likely</span> : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <section className={`atlas-model-strategy-readout ${resultTone}`} aria-label="Selected scenario strategy result">
            <div>
              <span>Selected scenario</span>
              <strong>{selectedStressMove.title}</strong>
            </div>
            <div>
              <span>Strategy result</span>
              <strong>{strategyResult}</strong>
              <p>{resultWhy}</p>
            </div>
            <dl>
              <div><dt>Acceptance</dt><dd>{acceptanceLabel}</dd></div>
              <div><dt>Target gap</dt><dd>{signedPoints(gapToTarget)}</dd></div>
              <div><dt>Red-line gap</dt><dd>{signedPoints(gapToRedLine)}</dd></div>
              <div><dt>Margin</dt><dd>{signedPct(marginImpact)}</dd></div>
            </dl>
          </section>

          <div className="atlas-stress-actions contextual" aria-label="Save stress test into strategy">
            <a className="primary" href={stressActionHref(resultActions.primary)}>{resultActions.primary}</a>
            {resultActions.secondary.map((action) => (
              <a className={action.toLowerCase().includes('discard') ? 'quiet' : ''} href={stressActionHref(action)} key={action}>
                {action}
              </a>
            ))}
          </div>
          {savedStressAction ? (
            <p className="atlas-stress-save-note">
              <CheckCircle2 size={15} /> {savedStressAction} queued for {record.customer} Strategy {strategyVersion}. This remains a draft until approved.
            </p>
          ) : null}
        </section>
      );
    }

    if (activePanel === 'watchouts') {
      return (
        <section className="atlas-brief-panel-section" id="watchouts" aria-label="Strategy watchouts">
          <div className="atlas-brief-panel-head">
            <span>Strategy watchouts</span>
            <h2>What could change the answer</h2>
            <p>Separate the risks that weaken the position from evidence that makes the position easier to defend.</p>
          </div>

          <div className="atlas-watchout-groups">
            <div className="atlas-watchout-group weaken">
              <h3>Could weaken the strategy</h3>
              {weakeningWatchouts.map((watchout) => (
                <article key={watchout.id}>
                  <AlertTriangle size={16} />
                  <div>
                    <span>{titleCase(watchout.status)} · {watchout.source.confidence} confidence</span>
                    <strong>{watchout.title}</strong>
                    <p>{watchout.whyItMatters}</p>
                    <dl>
                      <div><dt>Trigger</dt><dd>{watchout.source.source}</dd></div>
                      <div><dt>Action</dt><dd>{watchout.action}</dd></div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>

            <div className="atlas-watchout-group strengthen">
              <h3>Could strengthen the strategy</h3>
              {strengtheningWatchouts.map((watchout) => (
                <article key={watchout.id}>
                  <ShieldCheck size={16} />
                  <div>
                    <span>{titleCase(watchout.status)} · {watchout.source.confidence} confidence</span>
                    <strong>{watchout.title}</strong>
                    <p>{watchout.whyItMatters}</p>
                    <dl>
                      <div><dt>Trigger</dt><dd>{watchout.source.source}</dd></div>
                      <div><dt>Action</dt><dd>{watchout.action}</dd></div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (activePanel === 'changes') {
      return (
        <section className="atlas-brief-panel-section" id="debrief" aria-label="Strategy changes">
          <div className="atlas-brief-panel-head">
            <span>Strategy history</span>
            <h2>Version control and customer memory</h2>
            <p>Move between strategy versions, understand what changed, and keep every customer interaction, debrief, task, and external signal connected to the strategy.</p>
          </div>

          <div className="atlas-version-browser">
            <div className="atlas-version-list" aria-label="Strategy versions">
              {record.strategyUpdates.map((update) => (
                <a
                  className={selectedStrategyUpdate?.id === update.id ? 'active' : ''}
                  href={versionHref(update.version)}
                  key={update.id}
                  onClick={() => setSelectedStrategyUpdateId(update.id)}
                >
                  <span>{workingStrategyUpdateId === update.id ? 'Working version' : 'Saved version'}</span>
                  <strong>{update.version}</strong>
                  <em>{update.date}</em>
                </a>
              ))}
            </div>

            <article className="atlas-version-detail">
              <div>
                <span>{selectedStrategyIndex === 0 ? 'Current strategy' : 'Prior strategy'}</span>
                <h3>{selectedStrategyUpdate?.version}</h3>
                <em>{selectedStrategyUpdate?.date}</em>
              </div>
              <p>{selectedStrategyUpdate?.summary}</p>
              <dl>
                <div><dt>Triggered by</dt><dd>{selectedStrategyUpdate?.triggeredBy}</dd></div>
                <div><dt>Sign-off needed</dt><dd>{selectedStrategyUpdate?.signoffNeeded}</dd></div>
                <div><dt>Debrief impact</dt><dd>{selectedStrategyUpdate?.debriefImpact}</dd></div>
                <div><dt>Source</dt><dd>{selectedStrategyUpdate?.source.source} · {selectedStrategyUpdate?.source.confidence} confidence</dd></div>
              </dl>
              <div className="atlas-brief-panel-actions compact">
                <a
                  aria-disabled={workingStrategyUpdateId === selectedStrategyUpdate?.id}
                  className={workingStrategyUpdateId === selectedStrategyUpdate?.id ? 'disabled' : ''}
                  href={restoreVersionHref(selectedStrategyUpdate?.version)}
                  onClick={() => selectedStrategyUpdate && setWorkingStrategyUpdateId(selectedStrategyUpdate.id)}
                >
                  <PenLine size={15} /> {workingStrategyUpdateId === selectedStrategyUpdate?.id ? 'In working view' : 'Restore as working view'}
                </a>
                <a href={`/negotiation/${record.id}/report/cno-prep-brief`} target="_blank" rel="noreferrer"><FileText size={15} /> Export from this view</a>
              </div>
            </article>
          </div>

          <div className="atlas-change-list">
            <h3>What changed in {selectedStrategyUpdate?.version}</h3>
            {(selectedStrategyUpdate?.changes ?? []).map((change) => (
              <p key={change}><CheckCircle2 size={15} /> {change}</p>
            ))}
          </div>

          <div className="atlas-customer-history">
            <div className="atlas-customer-history-head">
              <span>Customer legacy history</span>
              <h3>All negotiation memory, internal actions, and external signals</h3>
              <p>This is the source-of-truth feed ATLAS should use for future prep, debriefs, and recommendation changes.</p>
            </div>
            <div className="atlas-history-timeline">
              {customerHistory.map((item, index) => (
                <article key={`${item.type}-${item.title}-${index}`}>
                  <div>
                    <span>{item.type}</span>
                    <strong>{item.date}</strong>
                  </div>
                  <section>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                    <dl>
                      <div><dt>What changed</dt><dd>{item.whatChanged || 'No strategy movement recorded.'}</dd></div>
                      <div><dt>Source</dt><dd>{item.source} · {item.confidence} confidence</dd></div>
                      <div><dt>Action</dt><dd>{item.action}</dd></div>
                    </dl>
                  </section>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="atlas-brief-panel-section" id="strategy-narrative" aria-label="Strategy narrative">
        <div className="atlas-brief-panel-head">
          <span>Editable strategy brief</span>
          <h2>The strategy in working form</h2>
          <p>This is the CNO-readable answer: what we are holding, why, what pressure to expect, and what proof is still needed.</p>
        </div>

        <div className="atlas-brief-editor">
          <label htmlFor="strategy-brief-draft"><Edit3 size={14} /> Strategy draft</label>
          <textarea id="strategy-brief-draft" defaultValue={record.sellStory.editableDraft} />
        </div>

        <div className="atlas-brief-field-list">
          <article>
            <span>Core position</span>
            <p>{record.recommendedPosition}</p>
          </article>
          <article>
            <span>Defense logic</span>
            <p>{record.sellStory.defense}</p>
          </article>
          <article>
            <span>Buyer pressure expected</span>
            <ul>{record.sellStory.buyerPressurePoints.map((point) => <li key={point}>{point}</li>)}</ul>
          </article>
          <article>
            <span>Fallback logic</span>
            <p>{fallbackScenario.recommendedUseCase}</p>
          </article>
          <article>
            <span>Proof needed</span>
            <ul>{record.sellStory.proofPointsNeeded.map((proof) => <li key={proof}>{proof}</li>)}</ul>
          </article>
          <article>
            <span>Confidence</span>
            <p>{titleCase(record.sellStory.confidence)} until Germany volume recovery and promo exposure are validated.</p>
          </article>
        </div>
      </section>
    );
  }

  return (
    <main className={`jarvis-page jarvis-immersive atlas-strategy-immersive atlas-strategy-workspace atlas-brief-workspace atlas-panel-${activePanel} ${activePanel === 'scenario' ? 'atlas-model-mode' : ''}`}>
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar atlas-strategy-topbar">
        <a className="jarvis-mark" href="/">
          <ShieldCheck size={16} />
          <span>ATLAS Strategy OS</span>
        </a>
      </header>

      <section className="atlas-brief-hero" aria-label="Strategy brief">
        <header className="atlas-brief-hero-top">
          <div className="atlas-brief-hero-meta">
            <a href="/">ATLAS</a>
            <strong>{record.customer} Group</strong>
            <span>Western Europe</span>
            <span>{record.year}</span>
            <span>Strategy {strategyVersion}</span>
            <span>{stageLabel(record.stage)}</span>
            <span>Updated {currentUpdate?.date ?? record.lastSourceSync}</span>
          </div>
          <div className="atlas-brief-hero-actions">
            <span className="atlas-brief-readiness"><ShieldCheck size={14} /> {record.strategyReadinessState}</span>
          </div>
        </header>

        <div className="atlas-brief-hero-copy">
          <span>Current strategy</span>
          <h1>{record.recommendedPosition}</h1>
          <p>{record.sellStory.narrative} Hold Q4 promo phasing as fallback only after finance validates Germany recovery.</p>
        </div>

        <dl className="atlas-brief-key-numbers">
          <div>
            <dt>Buyer ask</dt>
            <dd>{pct(record.pricingPosition.currentCustomerAskPct.value)}</dd>
            <em>France</em>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{pct(record.pricingPosition.targetPriceIncreasePct.value)}</dd>
            <em>PepsiCo</em>
          </div>
          <div>
            <dt>Current counter</dt>
            <dd>{pct(record.recommendedCounterPct.value)}</dd>
            <em>{record.recommendedCounterPct.confidence} confidence</em>
          </div>
          <div>
            <dt>Next decision</dt>
            <dd>Review fallback</dd>
            <em>Finance validation required</em>
          </div>
        </dl>

        <div className="atlas-brief-hero-decision">
          <span>Why we are defending it</span>
          <p>{record.sellStory.defense}</p>
        </div>
      </section>

      <section className="atlas-strategy-command-strip" aria-label="ATLAS strategy command">
        <form onSubmit={handleStrategyCommand}>
          <label htmlFor="atlas-strategy-command">Ask ATLAS</label>
          <input
            id="atlas-strategy-command"
            onChange={(event) => setStrategyCommand(event.currentTarget.value)}
            placeholder="Run a fallback scenario, pull proof, build a deck, or start Live Negotiator"
            type="text"
            value={strategyCommand}
          />
          <button type="submit">Run</button>
        </form>
        <div>
          <a href={panelHref('scenario')} onClick={(event) => { event.preventDefault(); selectPanel('scenario'); }}>Run scenario</a>
          <a href={panelHref('evidence')} onClick={(event) => { event.preventDefault(); selectPanel('evidence'); }}>Pull proof</a>
          <a href={deckHref()} target="_blank" rel="noreferrer">Build deck</a>
          <a href={`/negotiation/${record.id}/report/cno-prep-brief`} target="_blank" rel="noreferrer">CNO brief</a>
          <a href={`/negotiation/${record.id}/live`}>Live Negotiator</a>
        </div>
      </section>

      <nav className="atlas-brief-tabs" aria-label="Open workspace">
        <span>Open workspace</span>
        {panelItems.map((item) => (
          <a
            aria-pressed={activePanel === item.id}
            className={activePanel === item.id ? 'active' : ''}
            href={panelHref(item.id)}
            key={item.id}
            onClick={(event) => {
              event.preventDefault();
              selectPanel(item.id);
            }}
            role="button"
            title={item.intent}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section className="atlas-brief-shell" aria-label="Strategy brief workspace">
        <div className="atlas-brief-panel">
          {renderActivePanel()}
        </div>
      </section>

      <section className="atlas-brief-footer-actions atlas-brief-source-strip" aria-label="Strategy source status">
        <div>
          <span>Source status</span>
          <strong>{record.sourceReadiness}</strong>
        </div>
        <span><Database size={15} /> Last sync {record.lastSourceSync}</span>
      </section>
    </main>
  );
}
