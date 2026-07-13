'use client';

import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Archive,
  Bot,
  Check,
  ChevronRight,
  Database,
  FileUp,
  History,
  Mic,
  Newspaper,
  RotateCcw,
  Send,
  SlidersHorizontal,
  WandSparkles,
  X
} from 'lucide-react';
import { demoNegotiation, demoVisualEvidenceModules } from '@/src/lib/atlas/demo-data';
import {
  calculateStrategyReadout,
  createInitialStrategyBuilderState,
  createStrategyPathModules,
  demoBuyerReactionPredictions,
  demoInternalDecisionMemory,
  demoStrategySignals,
  strategyPathOrder
} from '@/src/lib/atlas/strategy-builder';
import type {
  StrategyBuilderPathId,
  StrategyEditableAssumption,
  StrategyRevisionProposal,
  SupportingStrategyDocument
} from '@/src/lib/atlas/types';

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onresult: ((event: { results?: { [index: number]: { [index: number]: { transcript?: string } } } }) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type DrawerId = 'history' | 'signals' | 'memory' | 'source' | null;

type ScenarioVariant = {
  id: string;
  intent: string;
  name: string;
  numbers: StrategyEditableAssumption[];
};

const controlRanges: Record<string, { min: number; max: number; step: number }> = {
  'buyer-ask': { min: 2.4, max: 5.2, step: 0.1 },
  'current-counter': { min: 2.4, max: 4.4, step: 0.1 },
  fallback: { min: 2.6, max: 4.4, step: 0.1 },
  'margin-impact': { min: -48, max: 16, step: 1 },
  'market-offset': { min: 0, max: 100, step: 5 },
  'promo-phasing': { min: 0, max: 100, step: 5 },
  'red-line': { min: 2.2, max: 4.0, step: 0.1 },
  target: { min: 2.5, max: 4.8, step: 0.1 },
  'trade-spend': { min: 0, max: 1.2, step: 0.1 },
  volume: { min: -2, max: 6, step: 0.1 }
};

const leverImpactMap: Record<string, { metrics: string[]; note: string }> = {
  'buyer-ask': {
    metrics: ['Acceptance read', 'Ask-to-counter pressure', 'Strategy risk'],
    note: 'Higher buyer asks make the current counter harder to defend.'
  },
  'current-counter': {
    metrics: ['Acceptance read', 'Gap to target', 'Gap to red line'],
    note: 'This is the main position lever; it moves both buyer acceptance and guardrail distance.'
  },
  fallback: {
    metrics: ['Fallback readiness', 'Approval pressure', 'Strategy draft'],
    note: 'Changes the backup path ATLAS can propose if the buyer rejects the current counter.'
  },
  'margin-impact': {
    metrics: ['Readiness', 'Validation gaps', 'Finance approval'],
    note: 'Worse margin pressure raises approval and validation needs.'
  },
  'market-offset': {
    metrics: ['Acceptance read', 'Validation gaps', 'Market tradeoff'],
    note: 'Offsets can protect France, but high offsets increase cross-market validation risk.'
  },
  'promo-phasing': {
    metrics: ['Acceptance read', 'Promo exposure', 'Validation gaps'],
    note: 'More promo support can soften buyer reaction while increasing execution risk.'
  },
  'red-line': {
    metrics: ['Gap to red line', 'Guardrail breach', 'Readiness'],
    note: 'Moves the hard floor ATLAS checks before a scenario can be defended.'
  },
  target: {
    metrics: ['Gap to target', 'Strategy result', 'Readiness story'],
    note: 'Moves the internal ambition the current counter is judged against.'
  },
  'trade-spend': {
    metrics: ['Acceptance read', 'Validation gaps', 'Promo cost risk'],
    note: 'More trade spend improves acceptance but can trigger finance validation.'
  },
  volume: {
    metrics: ['Acceptance read', 'Validation gaps', 'Recovery risk'],
    note: 'Higher recovery assumptions improve the case but need stronger proof.'
  }
};

const sourceSupportByRole: Record<SupportingStrategyDocument['role'], { audience: string; supports: string }> = {
  data_export: { audience: 'CNO internal', supports: 'margin, volume, and market offset validation' },
  notes: { audience: 'Leadership-safe after review', supports: 'buyer reaction, latest ask, and objection pattern' },
  other: { audience: 'Needs review', supports: 'working context until ATLAS extracts claims' },
  prep_deck: { audience: 'CNO internal', supports: 'position, guardrails, proof, and fallback logic' },
  strategy_deck: { audience: 'Leadership-safe draft', supports: 'sell story, evidence sequence, and strategy versioning' },
  transcript: { audience: 'CNO internal', supports: 'debrief, buyer language, and next-step extraction' }
};

const commandSuggestions: Record<StrategyBuilderPathId, string[]> = {
  buyer_reaction: ['Show buyer pushback history', 'Predict Carrefour next ask', 'What proof handles affordability?'],
  evidence: ['What proof is weakest?', 'Validate the cost story', 'Show sources for the red line'],
  market_signals: ['What changed this week?', 'Pull latest retailer pressure', 'Check commodity support'],
  readiness: ['Generate walk-in brief', 'What is not room-ready?', 'Make this KAM-safe'],
  scenario_pressure: ['Stress test 3.2% fallback', 'What if trade spend rises?', 'Show approval risk'],
  thesis: ['Validate the 3.0% counter', 'Summarize the strategy', 'What should I review first?']
};

function getBrowserSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return (window as unknown as {
    SpeechRecognition?: new () => VoiceRecognition;
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).SpeechRecognition ?? (window as unknown as {
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).webkitSpeechRecognition ?? null;
}

function titleCase(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueWithUnit(item: Pick<StrategyEditableAssumption, 'unit' | 'value'>) {
  if (item.unit === 'bps') return `${item.value.toFixed(0)} bps`;
  if (item.unit === 'EURm') return `EUR ${item.value.toFixed(1)}M`;
  if (item.unit === 'index') return item.value.toFixed(0);
  return `${item.value.toFixed(item.value % 1 === 0 ? 0 : 1)}%`;
}

function confidenceLabel(confidence: 'high' | 'medium' | 'low') {
  if (confidence === 'high') return 'High confidence';
  if (confidence === 'medium') return 'Medium confidence';
  return 'Low confidence';
}

function inferDocumentRole(file: File): SupportingStrategyDocument['role'] {
  const name = file.name.toLowerCase();
  if (name.includes('prep')) return 'prep_deck';
  if (name.includes('strategy')) return 'strategy_deck';
  if (name.includes('transcript')) return 'transcript';
  if (name.includes('note') || name.includes('debrief')) return 'notes';
  if (name.endsWith('.xlsx') || name.endsWith('.csv')) return 'data_export';
  return 'other';
}

function findNumber(numbers: StrategyEditableAssumption[], id: string) {
  return numbers.find((item) => item.id === id);
}

function withAssumptionOverrides(numbers: StrategyEditableAssumption[], overrides: Record<string, number>, source = 'ATLAS scenario draft'): StrategyEditableAssumption[] {
  return numbers.map((item) => item.id in overrides ? {
    ...item,
    confidence: item.validationState === 'validated' ? 'medium' : item.confidence,
    source,
    sourceLabel: item.sourceLabel === 'sourced_fact' ? item.sourceLabel : 'modeled_estimate' as const,
    validationState: item.validationState === 'validated' ? 'needs_validation' as const : item.validationState,
    value: overrides[item.id]
  } : { ...item });
}

function readinessItemState(isReady: boolean, needsAttention = false) {
  if (isReady) return 'ready';
  if (needsAttention) return 'watch';
  return 'blocked';
}

export default function AtlasStrategyBuilderCanvas() {
  const initialState = useMemo(() => createInitialStrategyBuilderState(), []);
  const [activePathStep, setActivePathStep] = useState<StrategyBuilderPathId>(initialState.activePathStep);
  const [selectedNumbers, setSelectedNumbers] = useState(initialState.selectedNumbers);
  const [scenarioVariants, setScenarioVariants] = useState<ScenarioVariant[]>(() => [
    {
      id: 'hold-current-counter',
      intent: 'Defend the current room position without expanding concessions.',
      name: 'Hold 3.0% counter',
      numbers: withAssumptionOverrides(initialState.selectedNumbers, {
        'current-counter': 3.0,
        fallback: 3.2,
        'market-offset': 35,
        'promo-phasing': 55,
        'trade-spend': 0.3,
        volume: 0.6
      }, 'ATLAS base strategy scenario')
    },
    {
      id: 'fallback-q4-phasing',
      intent: 'Improve buyer agreement by moving to fallback with Q4 promo phasing.',
      name: '3.2% + Q4 phasing',
      numbers: withAssumptionOverrides(initialState.selectedNumbers, {
        'current-counter': 3.2,
        fallback: 3.2,
        'market-offset': 42,
        'promo-phasing': 65,
        'trade-spend': 0.5,
        volume: 1.0
      }, 'ATLAS fallback scenario')
    },
    {
      id: 'buyer-pressure-case',
      intent: 'Model what happens if PepsiCo moves too close to the buyer ask.',
      name: 'Buyer pressure case',
      numbers: withAssumptionOverrides(initialState.selectedNumbers, {
        'current-counter': 3.6,
        fallback: 3.4,
        'margin-impact': -28,
        'market-offset': 52,
        'promo-phasing': 72,
        'trade-spend': 0.8,
        volume: 1.4
      }, 'ATLAS pressure test scenario')
    }
  ]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('hold-current-counter');
  const [supportingDocs, setSupportingDocs] = useState(initialState.uploadedDocs);
  const [revisions, setRevisions] = useState<StrategyRevisionProposal[]>(initialState.revisions);
  const [activeDrawer, setActiveDrawer] = useState<DrawerId>(null);
  const [selectedSourceId, setSelectedSourceId] = useState('current-counter');
  const [command, setCommand] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('ATLAS generated the working strategy from pricing, buyer history, proof, scenario pressure, and open validation gaps.');
  const [commandStatus, setCommandStatus] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [strategyFields, setStrategyFields] = useState({
    fallbackLogic: 'Keep 3.2% as a validation-gated fallback only after finance confirms Germany volume recovery.',
    nextAction: 'Validate Germany volume recovery before offering fallback in the room.',
    positionLanguage: 'Hold the 3.0% counter and defend it through shopper value, cost pressure, and branded category growth.',
    thesis: demoNegotiation.sellStory.narrative
  });
  const [buyerResponseFields, setBuyerResponseFields] = useState({
    concessionPattern: 'Carrefour tends to test promo support before accepting a defended price position.',
    expectedNextAsk: 'They may ask PepsiCo to move closer to 3.2% and attach Q4 promo support as the condition.',
    likelyObjection: demoBuyerReactionPredictions[0].likelyObjection
  });
  const [proofPoints, setProofPoints] = useState(() => demoVisualEvidenceModules.slice(0, 5).map((module) => ({
    confidence: module.source.confidence,
    freshness: module.source.freshness,
    id: module.id,
    sensitivity: 'CNO internal',
    source: module.source.source,
    status: module.source.confidence === 'high' ? 'Ready' : 'Needs validation',
    takeaway: module.keyTakeaway,
    title: module.title
  })));
  const [readinessFields, setReadinessFields] = useState({
    approvalOwner: 'Finance must validate Germany recovery and margin pressure before fallback is approved.',
    customerSafe: 'Use cost pressure, shopper value, and category growth; do not expose red line or margin controls.',
    internalOnly: 'Red line, fallback threshold, margin impact, and confidence gaps remain CNO internal.'
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  const modules = useMemo(() => createStrategyPathModules(selectedNumbers), [selectedNumbers]);
  const activeModule = modules.find((module) => module.id === activePathStep) ?? modules[0];
  const readout = calculateStrategyReadout(selectedNumbers);
  const editedNumbers = selectedNumbers.filter((item) => item.value !== item.priorValue || item.validationState === 'user_assumption');
  const latestProposal = revisions.find((revision) => revision.status === 'proposed');
  const selectedSource = selectedNumbers.find((item) => item.id === selectedSourceId) ?? selectedNumbers[0];
  const buyerAsk = findNumber(selectedNumbers, 'buyer-ask');
  const target = findNumber(selectedNumbers, 'target');
  const redLine = findNumber(selectedNumbers, 'red-line');
  const currentCounter = findNumber(selectedNumbers, 'current-counter');
  const fallback = findNumber(selectedNumbers, 'fallback');
  const tradeSpend = findNumber(selectedNumbers, 'trade-spend');
  const volume = findNumber(selectedNumbers, 'volume');
  const marginImpact = findNumber(selectedNumbers, 'margin-impact');
  const promoPhasing = findNumber(selectedNumbers, 'promo-phasing');
  const marketOffset = findNumber(selectedNumbers, 'market-offset');
  const visibleStrategyAreas = strategyPathOrder.filter((item) => item.id !== 'market_signals');
  const primaryReaction = demoBuyerReactionPredictions[0];
  const latestSignal = demoStrategySignals[0];
  const scenarioInterpretation = readout.readinessLabel === 'Blocked'
    ? {
      action: 'Discard or move back inside guardrails before sharing.',
      label: 'Breaches guardrail',
      tone: 'blocked',
      why: 'The edited move crosses a red-line or fallback boundary.'
    }
    : readout.readinessLabel === 'Needs validation'
      ? {
        action: 'Send Germany volume recovery and promo exposure to finance before approval.',
        label: 'Viable, validation-gated',
        tone: 'watch',
        why: 'The move can support the strategy, but open assumptions still carry approval risk.'
      }
      : {
        action: 'Use this as the defended room position and prepare buyer-facing proof.',
        label: 'Room-ready path',
        tone: 'ready',
        why: 'The current numbers support the working strategy without a guardrail breach.'
      };
  const walkInDecision = readout.readinessLabel === 'Blocked'
    ? {
      detail: 'Do not enter the room with this edited move as the working position. Re-open the move model and bring the counter or fallback back inside approved guardrails.',
      label: 'Do not walk in with this move'
    }
    : readout.readinessLabel === 'Needs validation'
      ? {
        detail: 'Walk in defending the current counter, but treat fallback, Germany recovery, and promo phasing as approval-gated. Do not offer the fallback as approved.',
        label: 'Walk in with caveats'
      }
      : {
        detail: 'The strategy is coherent enough for the room. Keep red-line, margin, and confidence-gap logic internal while using proof-led customer language.',
        label: 'Walk in ready'
      };
  const walkInChecklist = [
    { id: 'position', label: 'Position is clear', detail: `${currentCounter ? valueWithUnit(currentCounter) : '-'} counter vs ${buyerAsk ? valueWithUnit(buyerAsk) : '-'} buyer ask`, state: readinessItemState(Boolean(currentCounter && buyerAsk)) },
    { id: 'proof', label: 'Proof is usable', detail: 'Pricing corridor and cost proof are linked; commodity freshness still needs review.', state: readinessItemState(readout.confidence !== 'low', true) },
    { id: 'reaction', label: 'Buyer pushback anticipated', detail: primaryReaction.likelyObjection, state: readinessItemState(true) },
    { id: 'fallback', label: 'Fallback is defined', detail: `${fallback ? valueWithUnit(fallback) : '-'} remains approval-gated.`, state: readinessItemState(readout.readinessLabel !== 'Blocked', readout.readinessLabel === 'Needs validation') },
    { id: 'approvals', label: 'Approvals are known', detail: 'Finance validation is required for Germany recovery and promo phasing.', state: readinessItemState(readout.readinessLabel === 'Ready to defend', true) },
    { id: 'safety', label: 'Sensitive logic flagged', detail: 'Red line, margin controls, and confidence gaps stay CNO internal.', state: readinessItemState(true) }
  ];
  const walkInWatchouts = [
    { id: 'finance', label: 'Finance validation', detail: 'Germany volume recovery is still not approved.' },
    { id: 'promo', label: 'Buyer pressure', detail: 'Q4 promo support may become a formal condition.' },
    { id: 'source', label: 'Source freshness', detail: 'Refresh commodity proof before final output.' }
  ];
  const scenarioOutputCards = [
    { id: 'acceptance', label: 'Buyer acceptance', value: `${readout.acceptancePct}%`, detail: 'Driven by counter, trade spend, volume, promo phasing, and market offset.' },
    { id: 'target-gap', label: 'Gap to target', value: `${readout.gapToTarget.toFixed(1)} pts`, detail: `Target ${target ? valueWithUnit(target) : '-'}` },
    { id: 'redline-gap', label: 'Gap to red line', value: `${readout.gapToRedLine.toFixed(1)} pts`, detail: `Red line ${redLine ? valueWithUnit(redLine) : '-'}` },
    { id: 'margin', label: 'Margin impact', value: marginImpact ? valueWithUnit(marginImpact) : '-', detail: `${tradeSpend ? valueWithUnit(tradeSpend) : '-'} trade spend; ${volume ? valueWithUnit(volume) : '-'} volume.` },
    { id: 'execution', label: 'Execution mix', value: `${promoPhasing ? valueWithUnit(promoPhasing) : '-'} / ${marketOffset ? valueWithUnit(marketOffset) : '-'}`, detail: 'Promo phasing / market offset.' },
    { id: 'readiness', label: 'Readiness', value: readout.readinessLabel, detail: `${readout.gapCount} validation item${readout.gapCount === 1 ? '' : 's'} open.` }
  ];
  const guardrailNumbers = selectedNumbers.filter((item) => ['target', 'red-line'].includes(item.id));
  const modelLevers = selectedNumbers.filter((item) => !['target', 'red-line'].includes(item.id));
  const scenarioComparisonCards = scenarioVariants.map((scenario) => {
    const scenarioReadout = calculateStrategyReadout(scenario.numbers);
    const scenarioCounter = findNumber(scenario.numbers, 'current-counter');
    const scenarioTarget = findNumber(scenario.numbers, 'target');
    const scenarioMargin = findNumber(scenario.numbers, 'margin-impact');
    const scenarioVolume = findNumber(scenario.numbers, 'volume');
    const scenarioTrade = findNumber(scenario.numbers, 'trade-spend');
    const goalImpact = scenarioReadout.readinessLabel === 'Blocked'
      ? 'Weakens strategy'
      : scenarioReadout.readinessLabel === 'Needs validation'
        ? 'Viable with validation'
        : 'Supports strategy';
    return {
      acceptancePct: scenarioReadout.acceptancePct,
      counter: scenarioCounter ? valueWithUnit(scenarioCounter) : '-',
      gapToTarget: scenarioTarget && scenarioCounter ? `${(scenarioTarget.value - scenarioCounter.value).toFixed(1)} pts` : '-',
      goalImpact,
      id: scenario.id,
      intent: scenario.intent,
      margin: scenarioMargin ? valueWithUnit(scenarioMargin) : '-',
      name: scenario.name,
      readinessLabel: scenarioReadout.readinessLabel,
      sanctionLoad: scenarioTrade ? valueWithUnit(scenarioTrade) : '-',
      volume: scenarioVolume ? valueWithUnit(scenarioVolume) : '-'
    };
  });
  const walkInBriefPrompt = encodeURIComponent(`Create a CNO walk-in negotiation brief for Carrefour Group 2026. Include current strategy, buyer ask ${buyerAsk ? valueWithUnit(buyerAsk) : 'unknown'}, current counter ${currentCounter ? valueWithUnit(currentCounter) : 'unknown'}, target ${target ? valueWithUnit(target) : 'unknown'}, red line ${redLine ? valueWithUnit(redLine) : 'unknown'}, buyer reaction, proof points, weekly signals, scenario interpretation, approvals, source caveats, and what must stay CNO internal.`);

  function updateAssumption(id: string, value: number) {
    const range = controlRanges[id] ?? { min: -100, max: 100, step: 1 };
    const nextValue = Math.max(range.min, Math.min(range.max, Number(value.toFixed(2))));
    setSelectedNumbers((current) => {
      const nextNumbers = current.map((item) => item.id === id ? {
      ...item,
      confidence: item.validationState === 'validated' ? 'medium' as const : 'low' as const,
      source: 'Manual CNO working edit',
      sourceLabel: 'user_assumption' as const,
      validationState: 'user_assumption' as const,
      value: nextValue
      } : item);
      setScenarioVariants((variants) => variants.map((variant) => variant.id === selectedScenarioId ? { ...variant, numbers: nextNumbers } : variant));
      return nextNumbers;
    });
    setAssistantMessage('Manual edit captured. ATLAS recalculated readiness, buyer reaction, scenario pressure, and source status.');
  }

  function resetAssumption(id: string) {
    setSelectedNumbers((current) => {
      const nextNumbers = current.map((item) => item.id === id ? {
      ...item,
      confidence: item.priorValue === item.value ? item.confidence : 'medium' as const,
      source: item.source === 'Manual CNO working edit' ? 'Original ATLAS working source' : item.source,
      sourceLabel: item.source === 'Manual CNO working edit' ? 'modeled_estimate' as const : item.sourceLabel,
      validationState: item.source === 'Manual CNO working edit' ? 'needs_validation' as const : item.validationState,
      value: item.priorValue
      } : item);
      setScenarioVariants((variants) => variants.map((variant) => variant.id === selectedScenarioId ? { ...variant, numbers: nextNumbers } : variant));
      return nextNumbers;
    });
  }

  function selectScenarioVariant(id: string) {
    const scenario = scenarioVariants.find((variant) => variant.id === id);
    if (!scenario) return;
    setSelectedScenarioId(id);
    setSelectedNumbers(scenario.numbers);
    setActivePathStep('scenario_pressure');
    setAssistantMessage(`Loaded scenario: ${scenario.name}. Move levers to compare impact against the Carrefour strategy.`);
  }

  function createScenarioVariant() {
    const nextIndex = scenarioVariants.length + 1;
    const newScenario: ScenarioVariant = {
      id: `custom-scenario-${Date.now()}`,
      intent: 'User-created working move. Edit the levers to test the strategy impact.',
      name: `Custom scenario ${nextIndex}`,
      numbers: selectedNumbers.map((item) => ({
        ...item,
        confidence: item.confidence === 'high' ? 'medium' : item.confidence,
        source: 'User-created scenario draft',
        sourceLabel: item.sourceLabel === 'sourced_fact' ? item.sourceLabel : 'user_assumption' as const,
        validationState: item.validationState === 'validated' ? 'needs_validation' as const : item.validationState
      }))
    };
    setScenarioVariants((current) => [...current, newScenario]);
    setSelectedScenarioId(newScenario.id);
    setSelectedNumbers(newScenario.numbers);
    setActivePathStep('scenario_pressure');
    setAssistantMessage('Created a new scenario draft. Adjust levers to test a different pricing move.');
  }

  async function runCommand(rawCommand: string) {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;
    setIsThinking(true);
    setCommandStatus('ATLAS is reading the strategy context');

    try {
      const response = await fetch('/api/atlas/strategy-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activePathStep,
          manualEdits: editedNumbers.map((item) => ({ label: item.label, unit: item.unit, value: item.value })),
          prompt: trimmed,
          uploadedDocs: supportingDocs.map((doc) => ({ fileName: doc.fileName, role: doc.role }))
        })
      });
      const mutation = await response.json();
      if (!response.ok) throw new Error(mutation?.error ?? 'Command failed');
      setActivePathStep(mutation.activePathStep ?? activePathStep);
      setAssistantMessage(mutation.assistantMessage ?? 'ATLAS drafted a strategy update for review.');
      if (mutation.proposal) setRevisions((current) => [mutation.proposal, ...current]);
      setCommand('');
      setCommandStatus('Draft update ready');
    } catch {
      setCommandStatus('Command fallback created a draft update');
      setAssistantMessage('ATLAS could not reach the live command route, so the working strategy stayed unchanged.');
    } finally {
      setIsThinking(false);
      window.setTimeout(() => setCommandStatus(''), 1800);
    }
  }

  function startVoiceCommand() {
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition) {
      setCommandStatus('Voice unavailable in this browser. Type the request instead.');
      commandInputRef.current?.focus();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setCommandStatus('Listening');
    recognition.onerror = () => setCommandStatus('Voice stopped. Type the request instead.');
    recognition.onend = () => setCommandStatus((current) => current === 'Listening' ? '' : current);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      setCommand(transcript);
      void runCommand(transcript);
    };
    recognition.start();
  }

  function uploadDocuments(files: FileList | null) {
    if (!files?.length) return;
    const docs = Array.from(files).map((file) => {
      const role = inferDocumentRole(file);
      return {
        addedAt: new Date().toISOString().slice(0, 10),
        confidence: 'low' as const,
        extractedSummary: `Placeholder extraction queued from ${file.name}. ATLAS will treat this as supporting context until parsing is connected.`,
        fileName: file.name,
        fileType: file.name.split('.').pop() ?? (file.type || 'file'),
        id: `doc-${Date.now()}-${file.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
        role,
        userNotes: 'User-added source. Needs validation before official strategy use.'
      };
    });
    setSupportingDocs((current) => [...docs, ...current]);
    setAssistantMessage('Supporting document added. ATLAS marked it as a user-added source until extraction and validation are connected.');
  }

  function submitNotes() {
    const trimmed = notesInput.trim();
    if (!trimmed) return;
    const proposal: StrategyRevisionProposal = {
      affectedModules: ['thesis', 'buyer_reaction', 'readiness'],
      affectedNumbers: trimmed.match(/\d/) ? ['Buyer ask', 'Current counter', 'Fallback'] : [],
      id: `revision-notes-${Date.now()}`,
      proposedChange: 'Use pasted notes/transcript to update the strategy thesis, buyer reaction, and readiness gates.',
      status: 'proposed',
      trigger: trimmed.slice(0, 180)
    };
    setRevisions((current) => [proposal, ...current]);
    setNotesInput('');
    setAssistantMessage('Notes captured. ATLAS proposed a strategy revision, but did not apply it yet.');
  }

  function updateProposal(id: string, status: StrategyRevisionProposal['status']) {
    setRevisions((current) => current.map((revision) => revision.id === id ? { ...revision, status } : revision));
    if (status === 'applied') setAssistantMessage('Revision applied to the working strategy. Official sign-off is still gated by validation.');
    if (status === 'draft') setAssistantMessage('Revision kept as a draft. It will remain available in the revision queue.');
    if (status === 'rejected') setAssistantMessage('Revision rejected. The working strategy was not changed.');
  }

  return (
    <main className="atlas-builder-page">
      <div className="atlas-builder-docframe">
      <header className="atlas-builder-topbar">
        <a className="atlas-builder-mark" href="/">
          <span>ATLAS</span>
          <ChevronRight size={14} />
          <span>Carrefour strategy</span>
        </a>
        <nav aria-label="Strategy builder navigation">
          <button onClick={() => setActiveDrawer('history')} type="button">History</button>
          <button onClick={() => setActiveDrawer('signals')} type="button">Signals</button>
          <a href={`/negotiation/${demoNegotiation.id}/live`}>Live Negotiator</a>
          <a href={`/atlas-output?prompt=${walkInBriefPrompt}`} rel="noreferrer" target="_blank">Generate walk-in brief</a>
        </nav>
      </header>

      <section className="atlas-builder-shell" aria-label="Generative strategy builder">
        <section className="atlas-builder-hero">
          <div className="atlas-builder-context">
            <span>{demoNegotiation.customer} Group</span>
            <span>{demoNegotiation.strategyUpdates[0]?.version ?? demoNegotiation.strategyVersion}</span>
            <span>{readout.readinessLabel}</span>
          </div>

          <div className="atlas-builder-thesis">
            <span>Working strategy</span>
            <h1>{activeModule.id === 'thesis' ? activeModule.recommendation : modules[0].recommendation}</h1>
            <p>{demoNegotiation.sellStory.defense}</p>
          </div>

          <div className="atlas-builder-readout" aria-label="Live strategy readout">
            <div>
              <span>Current counter</span>
              <strong>{currentCounter ? valueWithUnit(currentCounter) : '-'}</strong>
            </div>
            <div>
              <span>Buyer reaction</span>
              <strong>{readout.acceptancePct}% acceptance</strong>
            </div>
            <div>
              <span>Open gaps</span>
              <strong>{readout.gapCount} to validate</strong>
            </div>
          </div>
        </section>

        <section className="atlas-walkin-readout" aria-label="Walk-in readiness readout">
          <div className="atlas-walkin-readout-head">
            <div>
              <span>Walk-in readout</span>
              <h2>{walkInDecision.label} <em>· Hold {currentCounter ? valueWithUnit(currentCounter) : '-'} counter · Fallback approval-gated</em></h2>
            </div>
            <a href={`/atlas-output?prompt=${walkInBriefPrompt}`} rel="noreferrer" target="_blank">Generate walk-in brief</a>
          </div>
          <div className="atlas-walkin-number-strip" aria-label="Core walk-in numbers">
            <article><span>Buyer ask</span><strong>{buyerAsk ? valueWithUnit(buyerAsk) : '-'}</strong></article>
            <article><span>Counter</span><strong>{currentCounter ? valueWithUnit(currentCounter) : '-'}</strong></article>
            <article><span>Target</span><strong>{target ? valueWithUnit(target) : '-'}</strong></article>
            <article><span>Red line</span><strong>{redLine ? valueWithUnit(redLine) : '-'}</strong></article>
            <article><span>Fallback</span><strong>{fallback ? valueWithUnit(fallback) : '-'}</strong></article>
          </div>
          <div className="atlas-walkin-watchouts">
            <section>
              <h3>Watchouts</h3>
              {walkInWatchouts.map((item) => (
                <p key={item.id}><strong>{item.label}</strong> {item.detail}</p>
              ))}
            </section>
            <section>
              <h3>Next action</h3>
              <p>{scenarioInterpretation.action}</p>
            </section>
          </div>
        </section>

        <section className="atlas-builder-path" aria-label="Strategy areas">
          <span className="atlas-path-label">Focus</span>
          {visibleStrategyAreas.map((item) => (
            <button
              aria-pressed={activePathStep === item.id}
              className={activePathStep === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => setActivePathStep(item.id)}
              type="button"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </section>

        <section className="atlas-builder-workgrid">
          <section className="atlas-builder-main">
            {activePathStep !== 'scenario_pressure' ? (
            <article className={`atlas-focus-workspace ${activePathStep}`}>
              <div className="atlas-generated-module-head">
                <div>
                  <span>{activeModule.generatedAt}</span>
                  <h2>{activeModule.title}</h2>
                </div>
                <div className="atlas-inline-ai-actions" aria-label="ATLAS inline editing actions">
                  <button onClick={() => runCommand(`Improve ${activeModule.title} for the Carrefour strategy`)} type="button">
                    <WandSparkles size={15} /> Improve
                  </button>
                  <button onClick={() => runCommand(`Find weak proof in ${activeModule.title}`)} type="button">
                    <Database size={15} /> Check sources
                  </button>
                  <button onClick={() => runCommand(`Regenerate ${activeModule.title}`)} type="button">
                    <RotateCcw size={15} /> Regenerate
                  </button>
                </div>
              </div>

              {activePathStep === 'thesis' ? (
                <section className="atlas-focus-panel" aria-label="Editable strategy workspace">
                  <div className="atlas-editable-prose-grid">
                    <label>
                      <span>Strategy thesis</span>
                      <textarea value={strategyFields.thesis} onChange={(event) => setStrategyFields((current) => ({ ...current, thesis: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Room position language</span>
                      <textarea value={strategyFields.positionLanguage} onChange={(event) => setStrategyFields((current) => ({ ...current, positionLanguage: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Fallback logic</span>
                      <textarea value={strategyFields.fallbackLogic} onChange={(event) => setStrategyFields((current) => ({ ...current, fallbackLogic: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Next action</span>
                      <textarea value={strategyFields.nextAction} onChange={(event) => setStrategyFields((current) => ({ ...current, nextAction: event.currentTarget.value }))} />
                    </label>
                  </div>
                  <div className="atlas-focus-number-row">
                    <article><span>Buyer ask</span><strong>{buyerAsk ? valueWithUnit(buyerAsk) : '-'}</strong></article>
                    <article><span>Counter</span><strong>{currentCounter ? valueWithUnit(currentCounter) : '-'}</strong></article>
                    <article><span>Fallback</span><strong>{fallback ? valueWithUnit(fallback) : '-'}</strong></article>
                    <article><span>Readiness</span><strong>{readout.readinessLabel}</strong></article>
                  </div>
                </section>
              ) : null}

              {activePathStep === 'buyer_reaction' ? (
                <section className="atlas-focus-panel" aria-label="Editable buyer response workspace">
                  <div className="atlas-editable-prose-grid">
                    <label>
                      <span>Likely objection</span>
                      <textarea value={buyerResponseFields.likelyObjection} onChange={(event) => setBuyerResponseFields((current) => ({ ...current, likelyObjection: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Expected next ask</span>
                      <textarea value={buyerResponseFields.expectedNextAsk} onChange={(event) => setBuyerResponseFields((current) => ({ ...current, expectedNextAsk: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Concession pattern</span>
                      <textarea value={buyerResponseFields.concessionPattern} onChange={(event) => setBuyerResponseFields((current) => ({ ...current, concessionPattern: event.currentTarget.value }))} />
                    </label>
                  </div>
                  <div className="atlas-buyer-response-proof">
                    <section>
                      <span>Historical basis</span>
                      <p>{primaryReaction.historicalBasis}</p>
                    </section>
                    <section>
                      <span>Evidence to use if pushed</span>
                      <div>{primaryReaction.suggestedEvidence.map((item) => <em key={item}>{item}</em>)}</div>
                    </section>
                  </div>
                </section>
              ) : null}

              {activePathStep === 'evidence' ? (
                <section className="atlas-focus-panel" aria-label="Editable proof workspace">
                  <div className="atlas-proof-editor-list">
                    {proofPoints.map((proof) => (
                      <article key={proof.id}>
                        <div>
                          <span>{proof.freshness} · {proof.confidence} confidence</span>
                          <strong>{proof.title}</strong>
                          <textarea value={proof.takeaway} onChange={(event) => setProofPoints((current) => current.map((item) => item.id === proof.id ? { ...item, takeaway: event.currentTarget.value } : item))} />
                        </div>
                        <label>
                          <span>Status</span>
                          <select value={proof.status} onChange={(event) => setProofPoints((current) => current.map((item) => item.id === proof.id ? { ...item, status: event.currentTarget.value } : item))}>
                            <option>Ready</option>
                            <option>Needs validation</option>
                            <option>Weak proof</option>
                          </select>
                        </label>
                        <label>
                          <span>Audience</span>
                          <select value={proof.sensitivity} onChange={(event) => setProofPoints((current) => current.map((item) => item.id === proof.id ? { ...item, sensitivity: event.currentTarget.value } : item))}>
                            <option>CNO internal</option>
                            <option>Leadership-safe</option>
                            <option>KAM-safe</option>
                            <option>Customer-safe</option>
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {activePathStep === 'readiness' ? (
                <section className="atlas-focus-panel" aria-label="Editable readiness workspace">
                  <div className="atlas-editable-prose-grid">
                    <label>
                      <span>Approval owner / dependency</span>
                      <textarea value={readinessFields.approvalOwner} onChange={(event) => setReadinessFields((current) => ({ ...current, approvalOwner: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>CNO internal only</span>
                      <textarea value={readinessFields.internalOnly} onChange={(event) => setReadinessFields((current) => ({ ...current, internalOnly: event.currentTarget.value }))} />
                    </label>
                    <label>
                      <span>Customer-safe language</span>
                      <textarea value={readinessFields.customerSafe} onChange={(event) => setReadinessFields((current) => ({ ...current, customerSafe: event.currentTarget.value }))} />
                    </label>
                  </div>
                  <div className="atlas-rail-checklist">
                    {walkInChecklist.map((item) => (
                      <article className={item.state} key={`focus-${item.id}`}>
                        <span>{item.state === 'ready' ? 'Ready' : item.state === 'watch' ? 'Watch' : 'Blocked'}</span>
                        <strong>{item.label}</strong>
                        <p>{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>
            ) : null}

            {activePathStep === 'scenario_pressure' ? (
            <section className="atlas-manual-model" aria-label="Manual strategy number editing">
              <header className="atlas-model-head">
                <div>
                  <span><SlidersHorizontal size={15} /> Scenario model</span>
                  <strong>Compare scenarios, then edit the working move</strong>
                </div>
                <button onClick={createScenarioVariant} type="button">Create scenario</button>
              </header>

              <div className="atlas-scenario-workbench">
                <section className="atlas-scenario-compare" aria-label="Scenario comparison">
                  {scenarioComparisonCards.map((scenario) => (
                    <button
                      aria-pressed={selectedScenarioId === scenario.id}
                      className={selectedScenarioId === scenario.id ? 'active' : ''}
                      key={scenario.id}
                      onClick={() => selectScenarioVariant(scenario.id)}
                      type="button"
                    >
                      <header>
                        <span>{scenario.name}</span>
                        <strong>{scenario.acceptancePct}% buyer agreement</strong>
                      </header>
                      <p>{scenario.intent}</p>
                      <div className="atlas-scenario-card-metrics">
                        <article>
                          <span>Price change</span>
                          <strong>{scenario.counter}</strong>
                        </article>
                        <article>
                          <span>Margin</span>
                          <strong>{scenario.margin}</strong>
                        </article>
                        <article>
                          <span>Volume</span>
                          <strong>{scenario.volume}</strong>
                        </article>
                      </div>
                      <footer>
                        <span>{scenario.goalImpact}</span>
                        <em>Target gap {scenario.gapToTarget}</em>
                      </footer>
                    </button>
                  ))}
                </section>

                <section className="atlas-model-decision-board" aria-label="Scenario decision board">
                  <article className={`atlas-model-verdict ${scenarioInterpretation.tone}`}>
                    <span>Move verdict</span>
                    <strong>{scenarioInterpretation.label}</strong>
                    <p>{scenarioInterpretation.why}</p>
                    <em>{scenarioInterpretation.action}</em>
                  </article>
                  <div className="atlas-impact-map" aria-label="Live outputs updated by model levers">
                    {scenarioOutputCards.map((output) => (
                      <article key={output.id} className={output.id === 'readiness' ? scenarioInterpretation.tone : ''}>
                        <span>{output.label}</span>
                        <strong>{output.value}</strong>
                        <p>{output.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="atlas-guardrail-editor" aria-label="Scenario guardrails">
                  <div>
                    <span>Guardrails</span>
                    <strong>Keep these visible while modeling the move</strong>
                  </div>
                  {guardrailNumbers.map((item) => (
                    <label key={item.id}>
                      <span>{item.label}</span>
                      <input
                        aria-label={`${item.label} guardrail value`}
                        inputMode="decimal"
                        onChange={(event) => {
                          const nextValue = Number(event.currentTarget.value);
                          if (!Number.isNaN(nextValue)) updateAssumption(item.id, nextValue);
                        }}
                        type="number"
                        value={item.value}
                      />
                      <em>{item.unit}</em>
                    </label>
                  ))}
                </section>

                <section className="atlas-lever-card-grid" aria-label="Manual scenario levers">
                {modelLevers.map((item) => {
                  const range = controlRanges[item.id] ?? { min: -100, max: 100, step: 1 };
                  const rangeProgress = ((item.value - range.min) / (range.max - range.min)) * 100;
                  const impact = leverImpactMap[item.id] ?? {
                    metrics: ['Strategy readout'],
                    note: 'Updates the working strategy model.'
                  };
                  return (
                    <article className={item.validationState === 'user_assumption' ? 'manual atlas-lever-card' : 'atlas-lever-card'} key={item.id}>
                      <button
                        className="atlas-number-source"
                        onClick={() => {
                          setSelectedSourceId(item.id);
                          setActiveDrawer('source');
                        }}
                        type="button"
                      >
                        <span>{item.label}</span>
                        <em>{titleCase(item.sourceLabel)}</em>
                      </button>
                      <div className="atlas-lever-control">
                        <label>
                          <input
                            aria-label={`${item.label} manual value`}
                            inputMode="decimal"
                            onChange={(event) => {
                              const nextValue = Number(event.currentTarget.value);
                              if (!Number.isNaN(nextValue)) updateAssumption(item.id, nextValue);
                            }}
                            type="number"
                            value={item.value}
                          />
                          <strong>{item.unit}</strong>
                        </label>
                        <input
                          aria-label={`${item.label} slider`}
                          max={range.max}
                          min={range.min}
                          onChange={(event) => updateAssumption(item.id, Number(event.currentTarget.value))}
                          step={range.step}
                          style={{ '--value': `${Math.max(0, Math.min(100, rangeProgress))}%` } as CSSProperties}
                          type="range"
                          value={item.value}
                        />
                      </div>
                      <section className="atlas-lever-impact" aria-label={`${item.label} affected metrics`}>
                        <span>Affects</span>
                        <div>
                          {impact.metrics.map((metric) => <em key={`${item.id}-${metric}`}>{metric}</em>)}
                        </div>
                      </section>
                      <div className="atlas-lever-status">
                        <span>{item.validationState === 'user_assumption' ? 'User assumption' : titleCase(item.validationState)}</span>
                        {item.value !== item.priorValue ? <button onClick={() => resetAssumption(item.id)} type="button">Reset</button> : null}
                      </div>
                    </article>
                  );
                })}
                </section>
              </div>
            </section>
            ) : null}

          </section>

          <aside className="atlas-builder-side">
            <details className="atlas-rail-accordion" open>
              <summary><Bot size={15} /><span>Ask ATLAS</span><strong>Command the strategy</strong></summary>
              <form
                className="atlas-side-command"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runCommand(command);
                }}
              >
                <div className="atlas-side-command-row">
                  <button aria-label="Start voice command" onClick={startVoiceCommand} type="button"><Mic size={16} /></button>
                  <input
                    aria-label="Ask ATLAS to update the strategy"
                    disabled={isThinking}
                    onChange={(event) => setCommand(event.currentTarget.value)}
                    placeholder="Validate a number, pressure-test a move, or update the strategy..."
                    ref={commandInputRef}
                    value={command}
                  />
                  <button disabled={isThinking} type="submit"><Send size={16} /></button>
                </div>
                <span aria-live="polite">{commandStatus || assistantMessage}</span>
                <div className="atlas-command-suggestions" aria-label="Suggested ATLAS commands">
                  {(commandSuggestions[activePathStep] ?? commandSuggestions.thesis).map((suggestion) => (
                    <button key={suggestion} onClick={() => void runCommand(suggestion)} type="button">{suggestion}</button>
                  ))}
                </div>
              </form>
            </details>

            <details className="atlas-rail-accordion atlas-history-rail" open>
              <summary><History size={15} /><span>Customer history</span><strong>Timeline + response prediction</strong></summary>
              <div className="atlas-rail-action-row">
                <button onClick={() => setActiveDrawer(activeDrawer === 'history' ? null : 'history')} type="button">Full history</button>
                <button onClick={() => setActiveDrawer(activeDrawer === 'signals' ? null : 'signals')} type="button">Signals</button>
              </div>
              <div className="atlas-history-timeline" aria-label="Customer negotiation history timeline">
                {demoNegotiation.timelineEvents.slice(0, 5).map((event) => (
                  <article key={event.id}>
                    <span>{event.date}</span>
                    <strong>{event.title}</strong>
                    <p>{event.detail}</p>
                    <em>{event.source.source} · {event.source.confidence} confidence</em>
                    <a href={`/atlas-output?prompt=${encodeURIComponent(`Create a debrief proof view for the Carrefour Group negotiation event "${event.title}". Include the event detail, source ${event.source.source}, confidence ${event.source.confidence}, and how this history informs predicted buyer response.`)}`} rel="noreferrer" target="_blank">Debrief proof</a>
                  </article>
                ))}
              </div>
              <div className="atlas-reaction-proof">
                <span>How ATLAS predicts response</span>
                <strong>{primaryReaction.likelyObjection}</strong>
                <p>{primaryReaction.historicalBasis}</p>
                <ul>
                  {primaryReaction.suggestedEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}
                </ul>
              </div>
            </details>

            <details className="atlas-rail-accordion">
              <summary><Check size={15} /><span>Readiness detail</span><strong>{readout.gapCount} open validation items</strong></summary>
              <div className="atlas-rail-checklist" aria-label="Walk-in readiness detail">
                {walkInChecklist.map((item) => (
                  <article className={item.state} key={`rail-${item.id}`}>
                    <span>{item.state === 'ready' ? 'Ready' : item.state === 'watch' ? 'Watch' : 'Blocked'}</span>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </details>

            <details className="atlas-rail-accordion">
              <summary><Database size={15} /><span>Evidence + sources</span><strong>{supportingDocs.length} strategy inputs</strong></summary>
              <div className="atlas-rail-action-row">
                <button onClick={() => setActiveDrawer(activeDrawer === 'source' ? null : 'source')} type="button">Source validation</button>
                <button onClick={() => setActiveDrawer(activeDrawer === 'memory' ? null : 'memory')} type="button">Internal memory</button>
              </div>
              <button className="atlas-rail-add-source" onClick={() => fileInputRef.current?.click()} type="button">Add source</button>
              <input
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.csv,.xlsx"
                hidden
                multiple
                onChange={(event) => uploadDocuments(event.currentTarget.files)}
                ref={fileInputRef}
                type="file"
              />
              <div className="atlas-doc-list">
                {supportingDocs.map((doc) => (
                  <article key={doc.id}>
                    <div>
                      <span>{titleCase(doc.role)}</span>
                      <strong>{doc.fileName}</strong>
                      <small>Supports {sourceSupportByRole[doc.role].supports}</small>
                      <small>{sourceSupportByRole[doc.role].audience}</small>
                      <em>{doc.extractedSummary}</em>
                    </div>
                    <button onClick={() => setSupportingDocs((current) => current.filter((item) => item.id !== doc.id))} type="button" aria-label={`Remove ${doc.fileName}`}>
                      <X size={15} />
                    </button>
                  </article>
                ))}
              </div>
            </details>

            <details className="atlas-rail-accordion">
              <summary><Archive size={15} /><span>Draft changes</span><strong>{latestProposal ? 'Review proposed change' : 'No change applied without approval'}</strong></summary>
              <section className="atlas-revision-queue" aria-label="Revision proposals">
                {latestProposal ? (
                  <article>
                    <span>{latestProposal.trigger}</span>
                    <p>{latestProposal.proposedChange}</p>
                    {latestProposal.affectedNumbers.length ? <em>Affects: {latestProposal.affectedNumbers.join(', ')}</em> : null}
                    <div>
                      <button onClick={() => updateProposal(latestProposal.id, 'applied')} type="button"><Check size={14} /> Apply</button>
                      <button onClick={() => updateProposal(latestProposal.id, 'draft')} type="button">Keep draft</button>
                      <button onClick={() => updateProposal(latestProposal.id, 'rejected')} type="button">Reject</button>
                    </div>
                  </article>
                ) : (
                  <p>Voice, chat, notes, documents, and manual edits can create draft changes. ATLAS will ask before making them official.</p>
                )}
              </section>
            </details>

            <details className="atlas-rail-accordion">
              <summary><FileUp size={15} /><span>Debrief / notes</span><strong>Update strategy from context</strong></summary>
              <section className="atlas-notes-intake" aria-label="Transcript and notes intake">
                <textarea
                  onChange={(event) => setNotesInput(event.currentTarget.value)}
                  placeholder="Paste meeting notes or transcript snippets. ATLAS will propose a strategy revision."
                  value={notesInput}
                />
                <button onClick={submitNotes} type="button">Propose update</button>
              </section>
            </details>
          </aside>
        </section>

        {activeDrawer ? (
          <aside className="atlas-context-drawer" aria-label="Strategy context drawer">
            <header>
              <div>
                <span>Context</span>
                <strong>{activeDrawer === 'history' ? 'Buying group history' : activeDrawer === 'signals' ? 'Market + world signals' : activeDrawer === 'memory' ? 'Internal decision memory' : 'Source validation'}</strong>
              </div>
              <button onClick={() => setActiveDrawer(null)} type="button"><X size={16} /></button>
            </header>

            {activeDrawer === 'history' ? (
              <div className="atlas-context-list">
                {demoNegotiation.timelineEvents.slice(0, 5).map((event) => (
                  <article key={event.id}>
                    <span>{event.date}</span>
                    <strong>{event.title}</strong>
                    <p>{event.detail}</p>
                    <em>{event.source.source} · {event.source.confidence} confidence</em>
                  </article>
                ))}
                {demoBuyerReactionPredictions.map((reaction) => (
                  <article key={reaction.id}>
                    <span>Predicted reaction</span>
                    <strong>{reaction.likelyObjection}</strong>
                    <p>{reaction.historicalBasis}</p>
                    <em>{reaction.expectedSeverity} severity · {reaction.confidence} confidence</em>
                  </article>
                ))}
              </div>
            ) : null}

            {activeDrawer === 'signals' ? (
              <div className="atlas-context-list">
                {demoStrategySignals.map((signal) => (
                  <article key={signal.id}>
                    <span>{titleCase(signal.type)}</span>
                    <strong>{signal.title}</strong>
                    <p>{signal.detail}</p>
                    <em>{signal.implication}</em>
                    <small>{signal.source.source} · {signal.source.freshness} · {signal.source.confidence}</small>
                  </article>
                ))}
              </div>
            ) : null}

            {activeDrawer === 'memory' ? (
              <div className="atlas-context-list">
                {demoInternalDecisionMemory.map((item) => (
                  <article key={item.id}>
                    <span>{item.buyingGroup}</span>
                    <strong>{item.decision}</strong>
                    <p>{item.reusablePattern}</p>
                    <em>{item.sensitivity}</em>
                  </article>
                ))}
              </div>
            ) : null}

            {activeDrawer === 'source' ? (
              <div className="atlas-source-validation">
                <span>{selectedSource.label}</span>
                <strong>{valueWithUnit(selectedSource)}</strong>
                <dl>
                  <div><dt>Source type</dt><dd>{titleCase(selectedSource.sourceLabel)}</dd></div>
                  <div><dt>Source</dt><dd>{selectedSource.source}</dd></div>
                  <div><dt>Freshness</dt><dd>{selectedSource.freshness}</dd></div>
                  <div><dt>Confidence</dt><dd>{confidenceLabel(selectedSource.confidence)}</dd></div>
                  <div><dt>Validation state</dt><dd>{titleCase(selectedSource.validationState)}</dd></div>
                  <div><dt>Original value</dt><dd>{valueWithUnit({ ...selectedSource, value: selectedSource.priorValue })}</dd></div>
                </dl>
                <h4>Related proof</h4>
                {demoVisualEvidenceModules.slice(0, 3).map((module) => (
                  <p key={module.id}>{module.title}: {module.keyTakeaway}</p>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}

      </section>
      </div>
    </main>
  );
}
