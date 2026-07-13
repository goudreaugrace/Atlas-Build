'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Lock,
  Mic,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Unlock,
  X
} from 'lucide-react';
import {
  buildBuyingGroupWorkspacePacket,
  buildNegotiationPlanPacket,
  euros,
  pct
} from '@/src/lib/atlas-intelligence/kernel';
import type {
  ConcessionPathStep,
  NegotiationPlan,
  NegotiationPlanEdit,
  NegotiationPlanLever,
  PlanScenarioOutcome,
  ResistancePlanItem,
  SourceMeta
} from '@/src/lib/atlas-intelligence/types';

type WorkspacePacket = NonNullable<ReturnType<typeof buildBuyingGroupWorkspacePacket>>;
const GENERATED_VIEW_STORAGE_KEY = 'atlas-generated-views';

type StrategyMemoryEvent = {
  artifactType: 'generated_view';
  audienceMode: 'internal_cno';
  buyingGroupId: string;
  confidence: string;
  createdAt: string;
  id: string;
  lifecycleState: 'attached' | 'draft';
  marketId?: string;
  mode: 'new_draft';
  prompt: string;
  revisionCount: number;
  savedDestination: 'buyer_profile';
  savedToProfileAt?: string;
  sourceDate: string;
  sourceDecision: string;
  sourceName: string;
  summary: string;
  title: string;
  updatedAt: string;
};

function sourceStatusLabel(source: SourceMeta) {
  return `${source.sourceType} · ${source.sourceName} · ${source.sourceDate} · ${source.confidence} confidence · ${source.status}`;
}

function SourceLine({ source }: { source: SourceMeta }) {
  return (
    <div className="atlas-strategy-source-line">
      <span>{sourceStatusLabel(source)}</span>
      {source.url ? <a href={source.url} rel="noreferrer" target="_blank">Source</a> : null}
    </div>
  );
}

function leverUsability(lever: NegotiationPlanLever, index: number) {
  if (lever.allowedUse === 'avoid') return 28;
  if (lever.allowedUse === 'approval_required') return 54;
  return [86, 78, 72, 68, 82][index % 5];
}

function leverUseLabel(lever: NegotiationPlanLever) {
  if (lever.allowedUse === 'avoid') return 'Hold back';
  if (lever.allowedUse === 'approval_required') return 'Use with caution';
  return 'Usable in room';
}

function leverImpactItems(lever: NegotiationPlanLever) {
  return [
    ['NR', lever.financialImpact.revenueImpact],
    ['GM', lever.financialImpact.marginImpact],
    ['Volume', lever.financialImpact.volumeImpact],
    ['Trade', lever.financialImpact.tradeSpendImpact]
  ].filter((item): item is [string, number] => typeof item[1] === 'number');
}

function resistancePressure(index: number) {
  return [82, 68, 56, 74][index % 4];
}

function generatedHref(prompt: string, buyingGroupId: string, plan: NegotiationPlan) {
  const params = new URLSearchParams({
    buyingGroupId,
    editable: '1',
    mode: 'draft',
    prompt: `${prompt}\n\nBuying group: ${buyingGroupId}.\nStrategy version: v${plan.version}.\nStrategy status: ${plan.status}.\nUse the current negotiation plan, source trail, concession path, levers, and guardrails.`
  });
  return `/generated-views?${params.toString()}`;
}

function currencyInput(value: number, onChange: (value: number) => void, disabled: boolean) {
  return (
    <input
      disabled={disabled}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
      step={25000}
      type="number"
      value={Math.round(value)}
    />
  );
}

function numberInput(value: number, onChange: (value: number) => void, disabled: boolean, step = 0.1) {
  return (
    <input
      disabled={disabled}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
      step={step}
      type="number"
      value={Number(value.toFixed(step === 1 ? 0 : 1))}
    />
  );
}

function textInput(value: string, onChange: (value: string) => void, disabled: boolean) {
  const visualRows = Math.max(2, value.split('\n').length + Math.ceil(value.length / 82));
  return (
    <textarea
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.value)}
      rows={visualRows}
      value={value}
    />
  );
}

function derivePlanRead(plan: NegotiationPlan, workspace: WorkspacePacket) {
  const marginAtRisk = workspace.buyingGroup.financialExposure.marginAtRisk;
  const guardrailDelta = plan.ingoingAskPercent - plan.redLinePercent;
  const buyerDistance = Math.max(0, Number((parseFloat(workspace.currentState.latestBuyerAsk) - plan.ingoingAskPercent).toFixed(1)));
  const probabilityToLand = Math.max(35, Math.min(86, Math.round(82 - buyerDistance * 8 - Math.max(0, guardrailDelta) * 2)));
  const marginImpact = Math.round(marginAtRisk * (plan.ingoingAskPercent / Math.max(plan.targetPercent, 1)) * 0.18 - Math.max(0, plan.targetPercent - plan.ingoingAskPercent) * 160000);
  const nrImpact = Math.round(workspace.buyingGroup.financialExposure.revenueUnderNegotiation * (plan.ingoingAskPercent / 100));
  const volumeImpact = Math.round(workspace.buyingGroup.financialExposure.volumeExposure * (probabilityToLand / 100) * 0.08);
  const guardrailStatus = guardrailDelta < 0
    ? 'Breaches red line'
    : guardrailDelta <= 0.2
      ? 'Near red line'
      : 'Inside guardrail';

  return {
    buyerDistance,
    guardrailStatus,
    marginImpact,
    nrImpact,
    probabilityToLand,
    volumeImpact
  };
}

type StrategyEvidenceItem = {
  dataPoints: Array<{ label: string; value: string }>;
  id: string;
  source: SourceMeta;
  takeaway: string;
  title: string;
  type: 'corridor' | 'financial' | 'buyer_pressure' | 'source_readiness';
};

function corridorPosition(value: number, min: number, max: number) {
  if (max <= min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function buildStrategyEvidenceItems(plan: NegotiationPlan, planRead: ReturnType<typeof derivePlanRead>, workspace: WorkspacePacket): StrategyEvidenceItem[] {
  const latestSignal = workspace.signals[0];
  const competitorMove = workspace.competitorMoves[0];
  const approvedDocuments = workspace.documents.filter((document) => document.status === 'approved');
  const watchDocuments = workspace.documents.filter((document) => document.status !== 'approved');
  const buyerAsk = Number.parseFloat(workspace.currentState.latestBuyerAsk);
  const primarySource = workspace.documents[0]?.source ?? workspace.buyingGroup.source;
  const signalSource = latestSignal?.source ?? workspace.buyingGroup.source;

  return [
    {
      dataPoints: [
        { label: 'Buyer ask', value: Number.isFinite(buyerAsk) ? `${buyerAsk.toFixed(1)}%` : workspace.currentState.latestBuyerAsk },
        { label: 'In-going ask', value: `${plan.ingoingAskPercent.toFixed(1)}%` },
        { label: 'Target', value: `${plan.targetPercent.toFixed(1)}%` },
        { label: 'Red line', value: `${plan.redLinePercent.toFixed(1)}%` }
      ],
      id: 'pricing-corridor',
      source: primarySource,
      takeaway: `${planRead.guardrailStatus}; the in-going ask sits ${pct(planRead.buyerDistance)} from the buyer ask.`,
      title: 'Pricing corridor',
      type: 'corridor'
    },
    {
      dataPoints: [
        { label: 'NR impact', value: euros(planRead.nrImpact) },
        { label: 'GM impact', value: euros(planRead.marginImpact) },
        { label: 'Volume impact', value: euros(planRead.volumeImpact) },
        { label: 'Margin at risk', value: euros(workspace.buyingGroup.financialExposure.marginAtRisk) }
      ],
      id: 'financial-bridge',
      source: workspace.buyingGroup.source,
      takeaway: `${euros(planRead.nrImpact)} modeled NR impact with ${euros(planRead.marginImpact)} GM impact.`,
      title: 'Financial bridge',
      type: 'financial'
    },
    {
      dataPoints: [
        { label: 'Signal impact', value: euros(latestSignal?.estimatedMarginImpact ?? workspace.buyingGroup.financialExposure.marginAtRisk) },
        { label: 'Competitor move', value: competitorMove?.competitor ?? 'None linked' },
        { label: 'Affected markets', value: workspace.markets.map((market) => market.name).join(' / ') }
      ],
      id: 'buyer-pressure',
      source: signalSource,
      takeaway: latestSignal?.negotiationImplication ?? workspace.currentState.nextMilestone,
      title: latestSignal?.title ?? 'Buyer pressure read',
      type: 'buyer_pressure'
    },
    {
      dataPoints: [
        { label: 'Approved sources', value: String(approvedDocuments.length) },
        { label: 'Watch sources', value: String(watchDocuments.length) },
        { label: 'Primary source', value: approvedDocuments[0]?.title ?? workspace.documents[0]?.title ?? 'Buyer profile source' }
      ],
      id: 'source-readiness',
      source: approvedDocuments[0]?.source ?? workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      takeaway: watchDocuments[0] ? `${watchDocuments[0].title} is ${watchDocuments[0].status}.` : 'Current strategy has approved source coverage in the prototype packet.',
      title: 'Source readiness',
      type: 'source_readiness'
    }
  ];
}

function StrategyEvidenceDataPoints({ item }: { item: StrategyEvidenceItem }) {
  return (
    <div className="atlas-strategy-evidence-data">
      {item.dataPoints.map((point) => (
        <div key={`${item.id}-${point.label}`}>
          <span>{point.label}</span>
          <strong>{point.value}</strong>
          <small>{item.source.sourceName} · {item.source.sourceDate}</small>
        </div>
      ))}
    </div>
  );
}

function StrategyEvidenceBuilder({
  onOpenEvidencePanel,
  plan,
  planRead,
  workspace
}: {
  onOpenEvidencePanel: () => void;
  plan: NegotiationPlan;
  planRead: ReturnType<typeof derivePlanRead>;
  workspace: WorkspacePacket;
}) {
  const approvedDocuments = workspace.documents.filter((document) => document.status === 'approved');
  const watchDocuments = workspace.documents.filter((document) => document.status !== 'approved');
  const buyerAsk = Number.parseFloat(workspace.currentState.latestBuyerAsk);
  const corridorMin = Math.min(plan.redLinePercent, plan.fallbackPercent, plan.ingoingAskPercent, plan.targetPercent, Number.isFinite(buyerAsk) ? buyerAsk : plan.targetPercent) - 0.4;
  const corridorMax = Math.max(plan.redLinePercent, plan.fallbackPercent, plan.ingoingAskPercent, plan.targetPercent, Number.isFinite(buyerAsk) ? buyerAsk : plan.targetPercent) + 0.4;
  const evidenceItems = buildStrategyEvidenceItems(plan, planRead, workspace);
  const corridorEvidence = evidenceItems.find((item) => item.type === 'corridor') ?? evidenceItems[0];
  const financialEvidence = evidenceItems.find((item) => item.type === 'financial') ?? evidenceItems[1];
  const pressureEvidence = evidenceItems.find((item) => item.type === 'buyer_pressure') ?? evidenceItems[2];
  const sourceEvidence = evidenceItems.find((item) => item.type === 'source_readiness') ?? evidenceItems[3];
  const bridgeValues = [
    { label: 'NR', value: planRead.nrImpact, tone: 'good' },
    { label: 'GM', value: planRead.marginImpact, tone: planRead.marginImpact >= 0 ? 'good' : 'risk' },
    { label: 'Volume', value: planRead.volumeImpact, tone: planRead.volumeImpact >= 0 ? 'good' : 'watch' },
    { label: 'At risk', value: workspace.buyingGroup.financialExposure.marginAtRisk, tone: 'watch' }
  ];

  return (
    <section className="atlas-strategy-evidence-builder" id="strategy-evidence-builder" aria-label="Embedded evidence builder">
      <header>
        <div>
          <span>Evidence visuals</span>
          <h2>Proof inside the strategy plan</h2>
        </div>
        <button type="button" onClick={onOpenEvidencePanel}>
          Open evidence pack <ArrowRight size={14} />
        </button>
      </header>

      <div className="atlas-strategy-evidence-grid">
        <article className="atlas-strategy-proof-card wide">
          <div>
            <span>Pricing corridor</span>
            <strong>{plan.ingoingAskPercent.toFixed(1)}% in-going ask vs {plan.redLinePercent.toFixed(1)}% red line</strong>
          </div>
          <div className="atlas-strategy-corridor-visual" aria-label="Pricing corridor visual">
            <i />
            {[
              ['Red line', plan.redLinePercent, 'risk'],
              ['Fallback', plan.fallbackPercent, 'watch'],
              ['In-going', plan.ingoingAskPercent, 'primary'],
              ['Target', plan.targetPercent, 'good'],
              ['Buyer ask', Number.isFinite(buyerAsk) ? buyerAsk : plan.targetPercent, 'buyer']
            ].map(([label, value, tone]) => (
              <em
                className={`tone-${tone}`}
                key={String(label)}
                style={{ left: `${corridorPosition(Number(value), corridorMin, corridorMax)}%` }}
              >
                <b>{Number(value).toFixed(1)}%</b>
                <small>{label}</small>
              </em>
            ))}
          </div>
          <StrategyEvidenceDataPoints item={corridorEvidence} />
          <SourceLine source={corridorEvidence.source} />
        </article>

        <article className="atlas-strategy-proof-card">
          <div>
            <span>Financial bridge</span>
            <strong>{euros(planRead.nrImpact)} modeled NR impact</strong>
          </div>
          <div className="atlas-strategy-bridge-visual">
            {bridgeValues.map((item) => (
              <div className={`tone-${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{euros(item.value)}</strong>
                <i><b style={{ height: `${Math.max(16, Math.min(100, Math.abs(item.value) / Math.max(workspace.buyingGroup.financialExposure.marginAtRisk, 1) * 100))}%` }} /></i>
              </div>
            ))}
          </div>
          <StrategyEvidenceDataPoints item={financialEvidence} />
        </article>

        <article className="atlas-strategy-proof-card">
          <div>
            <span>Buyer pressure</span>
            <strong>{pressureEvidence.title}</strong>
          </div>
          <p>{pressureEvidence.takeaway}</p>
          <dl>
            {pressureEvidence.dataPoints.slice(0, 2).map((point) => <div key={point.label}><dt>{point.label}</dt><dd>{point.value}</dd></div>)}
          </dl>
          <SourceLine source={pressureEvidence.source} />
        </article>

        <article className="atlas-strategy-proof-card">
          <div>
            <span>Source readiness</span>
            <strong>{approvedDocuments.length} approved · {watchDocuments.length} watch</strong>
          </div>
          <div className="atlas-strategy-source-meter">
            <i style={{ width: `${Math.max(12, approvedDocuments.length / Math.max(workspace.documents.length, 1) * 100)}%` }} />
          </div>
          <StrategyEvidenceDataPoints item={sourceEvidence} />
          <SourceLine source={sourceEvidence.source} />
        </article>
      </div>
    </section>
  );
}

function StrategyEvidenceSidePanel({
  isLocked,
  onAddEvidence,
  onClose,
  plan,
  planRead,
  workspace
}: {
  isLocked: boolean;
  onAddEvidence: (item: StrategyEvidenceItem) => void;
  onClose: () => void;
  plan: NegotiationPlan;
  planRead: ReturnType<typeof derivePlanRead>;
  workspace: WorkspacePacket;
}) {
  const evidenceItems = buildStrategyEvidenceItems(plan, planRead, workspace);

  return (
    <aside className="atlas-strategy-evidence-panel" aria-label="Evidence pack side panel">
      <header>
        <div>
          <span>Evidence pack</span>
          <strong>{workspace.buyingGroup.name}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close evidence pack"><X size={15} /></button>
      </header>
      <section>
        {evidenceItems.map((item) => (
          <article key={item.id}>
            <div>
              <span>{item.type.replaceAll('_', ' ')}</span>
              <h3>{item.title}</h3>
              <p>{item.takeaway}</p>
            </div>
            <StrategyEvidenceDataPoints item={item} />
            <SourceLine source={item.source} />
            <button type="button" onClick={() => onAddEvidence(item)} disabled={isLocked}>
              <Plus size={13} />
              Add to strategy
            </button>
          </article>
        ))}
      </section>
    </aside>
  );
}

function saveStrategyMemoryEvent(event: StrategyMemoryEvent) {
  if (typeof window === 'undefined') return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
    const existing = Array.isArray(parsed) ? parsed : [];
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([event, ...existing.filter((item: { id?: string }) => item.id !== event.id)].slice(0, 60)));
    window.dispatchEvent(new Event('storage'));
  } catch {
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([event]));
    window.dispatchEvent(new Event('storage'));
  }
}

export default function AtlasNegotiationPlanBuilder({ buyingGroupId }: { buyingGroupId: string }) {
  const workspace = useMemo(() => buildBuyingGroupWorkspacePacket(buyingGroupId), [buyingGroupId]);
  const initialPlan = useMemo(() => buildNegotiationPlanPacket(buyingGroupId), [buyingGroupId]);
  const [plan, setPlan] = useState<NegotiationPlan | undefined>(initialPlan);
  const [lockReviewOpen, setLockReviewOpen] = useState(false);
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantNote, setAssistantNote] = useState('');

  useEffect(() => {
    if (!initialPlan || typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(`atlas-strategy-plan-${buyingGroupId}`);
    if (saved) {
      try {
        setPlan(JSON.parse(saved) as NegotiationPlan);
      } catch {
        setPlan(initialPlan);
      }
    }
  }, [buyingGroupId, initialPlan]);

  useEffect(() => {
    if (!plan || typeof window === 'undefined') return;
    window.localStorage.setItem(`atlas-strategy-plan-${buyingGroupId}`, JSON.stringify(plan));
  }, [buyingGroupId, plan]);

  const planRead = useMemo(() => {
    if (!plan || !workspace) return null;
    return derivePlanRead(plan, workspace);
  }, [plan, workspace]);

  if (!workspace || !plan || !planRead) {
    return (
      <main className="atlas-strategy-builder-page">
        <section className="atlas-strategy-plan-shell">
          <a href="/buying-groups" className="atlas-strategy-back">‹ Back to buying groups</a>
          <h1>Strategy plan not found.</h1>
          <p>ATLAS could not build a buying-group strategy plan from the current intelligence packet.</p>
        </section>
      </main>
    );
  }

  const activeWorkspace = workspace;
  const activePlan = plan;
  const isLocked = plan.status === 'locked';
  const sourceGaps = workspace.documents.filter((document) => document.status !== 'approved').map((document) => `${document.title} · ${document.status}`);
  const openAssumptions = plan.editableAssumptions.filter((edit) => edit.sourceStatus === 'user_assumption').map((edit) => `${edit.field}: ${edit.newValue}`);

  function recordEdit(field: string, previousValue: string, newValue: string, editedBy: 'user' | 'atlas' = 'user') {
    const edit: NegotiationPlanEdit = {
      editedAt: new Date().toISOString(),
      editedBy,
      field,
      id: `edit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      newValue,
      previousValue,
      sourceStatus: editedBy === 'atlas' ? 'modeled' : 'user_assumption'
    };
    return edit;
  }

  function updatePlan<K extends keyof NegotiationPlan>(field: K, value: NegotiationPlan[K], label: string) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before editing.');
      return;
    }
    setPlan((current) => {
      if (!current) return current;
      const edit = recordEdit(label, String(current[field]), String(value));
      return {
        ...current,
        [field]: value,
        editableAssumptions: [edit, ...current.editableAssumptions].slice(0, 24),
        status: current.status === 'locked' ? 'locked' : 'draft'
      };
    });
  }

  function updateConcessionStep(id: string, patch: Partial<ConcessionPathStep>) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before editing concession steps.');
      return;
    }
    setPlan((current) => {
      if (!current) return current;
      const existing = current.concessionPath.find((step) => step.id === id);
      const next = current.concessionPath.map((step) => step.id === id ? { ...step, ...patch } : step);
      return {
        ...current,
        concessionPath: next,
        editableAssumptions: [recordEdit(`Concession step ${existing?.stepNumber ?? ''}`, JSON.stringify(existing ?? {}), JSON.stringify(patch)), ...current.editableAssumptions].slice(0, 24)
      };
    });
  }

  function updateLever(id: string, patch: Partial<NegotiationPlanLever>) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before editing levers.');
      return;
    }
    setPlan((current) => {
      if (!current) return current;
      const existing = current.levers.find((lever) => lever.id === id);
      return {
        ...current,
        editableAssumptions: [recordEdit(`Lever ${existing?.label ?? ''}`, JSON.stringify(existing ?? {}), JSON.stringify(patch)), ...current.editableAssumptions].slice(0, 24),
        levers: current.levers.map((lever) => lever.id === id ? { ...lever, ...patch } : lever)
      };
    });
  }

  function updateResistance(id: string, patch: Partial<ResistancePlanItem>) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before editing the resistance plan.');
      return;
    }
    setPlan((current) => {
      if (!current) return current;
      const existing = current.resistancePlan.find((item) => item.id === id);
      return {
        ...current,
        editableAssumptions: [recordEdit(`Resistance plan ${existing?.buyerMove ?? ''}`, JSON.stringify(existing ?? {}), JSON.stringify(patch)), ...current.editableAssumptions].slice(0, 24),
        resistancePlan: current.resistancePlan.map((item) => item.id === id ? { ...item, ...patch } : item)
      };
    });
  }

  function updateOutcome(id: string, patch: Partial<PlanScenarioOutcome>) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before editing scenario outcomes.');
      return;
    }
    setPlan((current) => {
      if (!current) return current;
      const existing = current.scenarioOutcomes.find((item) => item.id === id);
      return {
        ...current,
        editableAssumptions: [recordEdit(`Scenario ${existing?.label ?? ''}`, JSON.stringify(existing ?? {}), JSON.stringify(patch)), ...current.editableAssumptions].slice(0, 24),
        scenarioOutcomes: current.scenarioOutcomes.map((item) => item.id === id ? { ...item, ...patch } : item)
      };
    });
  }

  function addEvidenceToStrategy(item: StrategyEvidenceItem) {
    if (isLocked) {
      setAssistantNote('This strategy is locked. Create a new draft before adding evidence.');
      return;
    }
    const sourceLabel = `${item.source.sourceName} (${item.source.sourceDate})`;
    const evidenceNote = `Evidence added: ${item.title} — ${item.takeaway} Source: ${sourceLabel}.`;
    setPlan((current) => {
      if (!current) return current;
      return {
        ...current,
        rationale: current.rationale.includes(item.takeaway)
          ? current.rationale
          : `${current.rationale}\n\n${evidenceNote}`,
        editableAssumptions: [
          recordEdit(`Evidence: ${item.title}`, 'Not attached', sourceLabel),
          ...current.editableAssumptions
        ].slice(0, 24),
        status: current.status === 'locked' ? 'locked' : 'draft'
      };
    });
    setAssistantNote(`${item.title} added to the strategy rationale with source context.`);
  }

  function submitAssistantCommand() {
    const prompt = assistantPrompt.trim();
    if (!prompt) return;
    const normalized = prompt.toLowerCase();

    if (isLocked) {
      setAssistantNote('This plan is locked. ATLAS can create a new draft, compare against the locked version, or generate a report from the locked strategy.');
      setAssistantPrompt('');
      return;
    }

    if (/concession|path|give/.test(normalized)) {
      updatePlan('rationale', `${activePlan.rationale} ATLAS revision: concession path should stay conditional on buyer commitments and avoid changing the price floor in-room.`, 'Rationale');
      setAssistantNote('Updated the rationale with a concession-path guardrail. The change is marked as an ATLAS-modeled draft edit.');
    } else if (/red line|below|1%|breach|walk/.test(normalized)) {
      updatePlan('walkAwayLogic', `If the buyer asks to move below ${activePlan.redLinePercent.toFixed(1)}%, hold the room decision, model the NR-GM impact, and do not commit below the stop point.`, 'Walk-away logic');
      setAssistantNote('Updated walk-away logic for a below-red-line pressure test.');
    } else if (/best|ingoing|ask|position/.test(normalized)) {
      updatePlan('bestIngoingPosition', `Open with ${activePlan.ingoingAskPercent.toFixed(1)}%, defend with value proof, and reserve ${activePlan.fallbackPercent.toFixed(1)}% as a conditional fallback only after buyer commitment.`, 'Best in-going position');
      setAssistantNote('Refined the best in-going position.');
    } else {
      updatePlan('sellingStory', `${activePlan.sellingStory} ATLAS note: ${prompt}`, 'Selling story');
      setAssistantNote('Added your prompt to the selling story as a draft strategy note.');
    }

    setAssistantPrompt('');
  }

  function markReadyForReview() {
    if (isLocked) return;
    setPlan((current) => current ? {
      ...current,
      status: 'ready_for_review',
      versionHistory: current.versionHistory.map((item) => item.version === current.version ? {
        ...item,
        status: 'ready_for_review',
        summary: `Marked ready for review with ${openAssumptions.length} user assumptions and ${sourceGaps.length} source gaps.`
      } : item)
    } : current);
    setAssistantNote('Marked ready for review. Lock review still requires confirmation.');
  }

  function lockStrategy() {
    const now = new Date().toISOString();
    setPlan((current) => current ? {
      ...current,
      lockRecord: {
        approvalDependencies: [],
        lockedAt: now,
        lockedBy: 'CNO prototype user',
        openAssumptions,
        sourceGaps
      },
      status: 'locked',
      versionHistory: current.versionHistory.map((item) => {
        if (item.version === current.version) return { ...item, lockedAt: now, status: 'locked' };
        if (item.status === 'locked') return { ...item, status: 'superseded' };
        return item;
      })
    } : current);
    saveStrategyMemoryEvent({
      artifactType: 'generated_view',
      audienceMode: 'internal_cno',
      buyingGroupId: activeWorkspace.buyingGroup.id,
      confidence: activeWorkspace.buyingGroup.source.confidence,
      createdAt: now,
      id: `strategy-lock-${activeWorkspace.buyingGroup.id}-v${activePlan.version}`,
      lifecycleState: 'attached',
      marketId: activeWorkspace.buyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt: `Strategy v${activePlan.version} locked for ${activeWorkspace.buyingGroup.name}.`,
      revisionCount: activePlan.editableAssumptions.length,
      savedDestination: 'buyer_profile',
      savedToProfileAt: now,
      sourceDate: activeWorkspace.buyingGroup.source.sourceDate,
      sourceDecision: 'Locked negotiation strategy saved as buyer history and version of record.',
      sourceName: activeWorkspace.buyingGroup.source.sourceName,
      summary: `${activePlan.bestIngoingPosition} Target ${activePlan.targetPercent.toFixed(1)}%, red line ${activePlan.redLinePercent.toFixed(1)}%, fallback ${activePlan.fallbackPercent.toFixed(1)}%.`,
      title: `${activeWorkspace.buyingGroup.name} Strategy v${activePlan.version} locked`,
      updatedAt: now
    });
    setLockReviewOpen(false);
    setAssistantNote('Strategy locked. Reports now reference this approved version of record.');
  }

  function createNewDraft() {
    const now = new Date().toISOString();
    const nextVersion = activePlan.version + 1;
    setPlan((current) => current ? {
      ...current,
      id: `plan-${activeWorkspace.buyingGroup.id}-v${nextVersion}`,
      lockRecord: undefined,
      status: 'draft',
      version: nextVersion,
      versionHistory: [
        ...current.versionHistory,
        {
          createdAt: now,
          status: 'draft',
          summary: `New draft created from locked Strategy v${current.version}.`,
          version: nextVersion
        }
      ]
    } : current);
    saveStrategyMemoryEvent({
      artifactType: 'generated_view',
      audienceMode: 'internal_cno',
      buyingGroupId: activeWorkspace.buyingGroup.id,
      confidence: activeWorkspace.buyingGroup.source.confidence,
      createdAt: now,
      id: `strategy-draft-${activeWorkspace.buyingGroup.id}-v${nextVersion}`,
      lifecycleState: 'draft',
      marketId: activeWorkspace.buyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt: `Strategy v${nextVersion} draft created from locked Strategy v${activePlan.version} for ${activeWorkspace.buyingGroup.name}.`,
      revisionCount: 0,
      savedDestination: 'buyer_profile',
      sourceDate: activeWorkspace.buyingGroup.source.sourceDate,
      sourceDecision: 'New editable strategy draft created from locked version; locked source remains preserved.',
      sourceName: activeWorkspace.buyingGroup.source.sourceName,
      summary: `Editable draft opened from locked Strategy v${activePlan.version}. Changes must be reviewed and locked before becoming the version of record.`,
      title: `${activeWorkspace.buyingGroup.name} Strategy v${nextVersion} draft created`,
      updatedAt: now
    });
    setAssistantNote('Created a new editable draft from the locked strategy.');
  }

  const outputLinks = [
    ['CNO negotiation plan', `Create a CNO negotiation plan for ${workspace.buyingGroup.name}.`],
    ['Recommended scenario brief', `Create a recommended scenario brief for ${workspace.buyingGroup.name}.`],
    ['Evidence pack', `Create an evidence pack for ${workspace.buyingGroup.name}.`],
    ['Concession path one-pager', `Create a concession path one-pager for ${workspace.buyingGroup.name}.`]
  ];

  return (
    <main className="atlas-strategy-builder-page">
      <section className="atlas-strategy-plan-shell">
        <div className="atlas-strategy-plan-nav">
          <a href={`/buying-groups/${workspace.buyingGroup.id}`}>‹ Back to {workspace.buyingGroup.name}</a>
          <div>
            <span className={`atlas-strategy-status status-${plan.status}`}>{plan.status.replaceAll('_', ' ')}</span>
            {isLocked ? (
              <button type="button" onClick={createNewDraft}><Unlock size={14} /> Create new draft</button>
            ) : (
              <>
                {plan.status !== 'ready_for_review' ? <button type="button" onClick={markReadyForReview}><CheckCircle2 size={14} /> Mark ready</button> : null}
                <button type="button" onClick={() => setLockReviewOpen(true)}><Lock size={14} /> Review and lock</button>
              </>
            )}
          </div>
        </div>

        <header className="atlas-strategy-plan-hero">
          <div>
            <span>Strategy v{plan.version} · {workspace.markets.map((market) => market.name).join(' / ')}</span>
            <h1>{workspace.buyingGroup.name} negotiation plan</h1>
            <p>What do we ask, how do we play, what can we give, and where do we stop?</p>
          </div>
          <dl>
            <div>
              <dt>In-going ask</dt>
              <dd>{numberInput(plan.ingoingAskPercent, (value) => updatePlan('ingoingAskPercent', value, 'In-going ask'), isLocked)}<span>%</span></dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{numberInput(plan.targetPercent, (value) => updatePlan('targetPercent', value, 'Target'), isLocked)}<span>%</span></dd>
            </div>
            <div>
              <dt>Red line</dt>
              <dd>{numberInput(plan.redLinePercent, (value) => updatePlan('redLinePercent', value, 'Red line'), isLocked)}<span>%</span></dd>
            </div>
            <div>
              <dt>Fallback</dt>
              <dd>{numberInput(plan.fallbackPercent, (value) => updatePlan('fallbackPercent', value, 'Fallback'), isLocked)}<span>%</span></dd>
            </div>
          </dl>
        </header>

        <section className="atlas-strategy-impact-strip">
          <article>
            <span>Likelihood to land</span>
            <strong>{planRead.probabilityToLand}%</strong>
            <em>{pct(planRead.buyerDistance)} from buyer ask</em>
          </article>
          <article>
            <span>Guardrail</span>
            <strong>{planRead.guardrailStatus}</strong>
            <em>Red line {plan.redLinePercent.toFixed(1)}%</em>
          </article>
          <article>
            <span>NR impact</span>
            <strong>{euros(planRead.nrImpact)}</strong>
            <em>Modeled from in-going ask</em>
          </article>
          <article>
            <span>GM impact</span>
            <strong>{euros(planRead.marginImpact)}</strong>
            <em>Modeled from current plan</em>
          </article>
        </section>

        {lockReviewOpen ? (
          <section className="atlas-strategy-lock-review">
            <div>
              <span>Lock review</span>
              <h2>Confirm this becomes the approved version of record.</h2>
              <p>After lock, the plan is read-only. Future edits create a new draft version.</p>
            </div>
            <div className="atlas-strategy-lock-grid">
              <article><strong>Changed values</strong>{plan.editableAssumptions.slice(0, 4).map((edit) => <p key={edit.id}>{edit.field}: {edit.newValue}</p>) || null}</article>
              <article><strong>Open assumptions</strong>{openAssumptions.length ? openAssumptions.slice(0, 4).map((item) => <p key={item}>{item}</p>) : <p>No user assumptions recorded.</p>}</article>
              <article><strong>Source gaps</strong>{sourceGaps.length ? sourceGaps.slice(0, 4).map((item) => <p key={item}>{item}</p>) : <p>No source gaps in current packet.</p>}</article>
            </div>
            <div className="atlas-strategy-lock-actions">
              <button type="button" onClick={() => setLockReviewOpen(false)}>Keep editing</button>
              <button type="button" onClick={lockStrategy}><ShieldCheck size={15} /> Confirm lock</button>
            </div>
          </section>
        ) : null}

        <section className="atlas-strategy-plan-grid">
          <article className="atlas-strategy-plan-card wide">
            <span>Best in-going position</span>
            {textInput(plan.bestIngoingPosition, (value) => updatePlan('bestIngoingPosition', value, 'Best in-going position'), isLocked)}
            <SourceLine source={workspace.documents[0]?.source ?? workspace.buyingGroup.source} />
          </article>
          <article className="atlas-strategy-plan-card">
            <span>Walk-away logic</span>
            {textInput(plan.walkAwayLogic, (value) => updatePlan('walkAwayLogic', value, 'Walk-away logic'), isLocked)}
          </article>
        </section>

        <section className="atlas-strategy-editor-block">
          <header>
            <h2>Selling story and rationale</h2>
            <a href="#strategy-evidence-builder">Open evidence visuals <ArrowRight size={14} /></a>
          </header>
          <div className="atlas-strategy-story-grid">
            <article>
              <span>Selling story</span>
              {textInput(plan.sellingStory, (value) => updatePlan('sellingStory', value, 'Selling story'), isLocked)}
            </article>
            <article>
              <span>Rationale</span>
              {textInput(plan.rationale, (value) => updatePlan('rationale', value, 'Rationale'), isLocked)}
            </article>
          </div>
        </section>

        <StrategyEvidenceBuilder
          onOpenEvidencePanel={() => setEvidencePanelOpen(true)}
          plan={plan}
          planRead={planRead}
          workspace={workspace}
        />

        <section className="atlas-strategy-editor-block">
          <header>
            <h2>Concession path</h2>
            <a href={generatedHref(`Create a concession path one-pager for ${workspace.buyingGroup.name}.`, workspace.buyingGroup.id, plan)} rel="noreferrer" target="_blank">Open one-pager <ArrowRight size={14} /></a>
          </header>
          <div className="atlas-strategy-concession-list">
            {plan.concessionPath.map((step) => (
              <article key={step.id}>
                <strong>Step {step.stepNumber}</strong>
                <label>Trigger {textInput(step.trigger, (value) => updateConcessionStep(step.id, { trigger: value }), isLocked)}</label>
                <label>Offer {textInput(step.offer, (value) => updateConcessionStep(step.id, { offer: value }), isLocked)}</label>
                <label>Cost {currencyInput(step.cost, (value) => updateConcessionStep(step.id, { cost: value }), isLocked)}</label>
                <label>Expected buyer response {textInput(step.expectedBuyerResponse, (value) => updateConcessionStep(step.id, { expectedBuyerResponse: value }), isLocked)}</label>
                <em>{step.guardrail}</em>
                <SourceLine source={step.source} />
              </article>
            ))}
          </div>
        </section>

        <section className="atlas-strategy-editor-block">
          <header>
            <h2>Levers and resistance plan</h2>
          </header>
          <div className="atlas-strategy-lever-grid">
            {plan.levers.map((lever, index) => (
              <article key={lever.id}>
                <div className="atlas-strategy-lever-topline">
                  <span>{lever.owner} · {lever.leverType.replaceAll('_', ' ')}</span>
                  <em>{leverUseLabel(lever)}</em>
                </div>
                <input disabled={isLocked} value={lever.label} onChange={(event) => updateLever(lever.id, { label: event.currentTarget.value })} />
                <div className="atlas-strategy-lever-visual" aria-label={`${lever.label} usability ${leverUsability(lever, index)} percent`}>
                  <i><b style={{ width: `${leverUsability(lever, index)}%` }} /></i>
                  <span>{leverUsability(lever, index)}% usable</span>
                </div>
                <div className="atlas-strategy-lever-impact">
                  {leverImpactItems(lever).map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{label === 'Volume' ? pct(value) : euros(value)}</strong>
                    </div>
                  ))}
                </div>
                {textInput(lever.expectedImpact, (value) => updateLever(lever.id, { expectedImpact: value }), isLocked)}
                <SourceLine source={lever.source} />
              </article>
            ))}
          </div>
          <div className="atlas-strategy-resistance-list">
            {plan.resistancePlan.map((item, index) => (
              <article key={item.id}>
                <div className="atlas-strategy-resistance-meter">
                  <span>Pressure pattern</span>
                  <i><b style={{ width: `${resistancePressure(index)}%` }} /></i>
                  <em>{resistancePressure(index)}%</em>
                </div>
                <div className="atlas-strategy-resistance-flow" aria-hidden="true">
                  <span>Buyer move</span>
                  <ArrowRight size={14} />
                  <span>Response</span>
                  <ArrowRight size={14} />
                  <span>Stop point</span>
                </div>
                <span>Buyer move</span>
                {textInput(item.buyerMove, (value) => updateResistance(item.id, { buyerMove: value }), isLocked)}
                <span>Response plan</span>
                {textInput(item.responsePlan, (value) => updateResistance(item.id, { responsePlan: value }), isLocked)}
                <span>Stop point</span>
                {textInput(item.escalationTrigger, (value) => updateResistance(item.id, { escalationTrigger: value }), isLocked)}
                <SourceLine source={item.source} />
              </article>
            ))}
          </div>
        </section>

        <section className="atlas-strategy-editor-block">
          <header>
            <h2>Success and failure scenarios</h2>
            <a href={generatedHref(`Create a recommended scenario brief for ${workspace.buyingGroup.name}.`, workspace.buyingGroup.id, plan)} rel="noreferrer" target="_blank">Open scenario brief <ArrowRight size={14} /></a>
          </header>
          <div className="atlas-strategy-outcome-grid">
            {plan.scenarioOutcomes.map((outcome) => (
              <article key={outcome.id}>
                <input disabled={isLocked} value={outcome.label} onChange={(event) => updateOutcome(outcome.id, { label: event.currentTarget.value })} />
                {textInput(outcome.description, (value) => updateOutcome(outcome.id, { description: value }), isLocked)}
                <dl>
                  <div><dt>Land</dt><dd>{numberInput(outcome.probabilityToLand, (value) => updateOutcome(outcome.id, { probabilityToLand: value }), isLocked, 1)}<span>%</span></dd></div>
                  <div><dt>NR</dt><dd>{currencyInput(outcome.nrImpact, (value) => updateOutcome(outcome.id, { nrImpact: value }), isLocked)}</dd></div>
                  <div><dt>GM</dt><dd>{currencyInput(outcome.gmImpact, (value) => updateOutcome(outcome.id, { gmImpact: value }), isLocked)}</dd></div>
                  <div><dt>Volume</dt><dd>{currencyInput(outcome.volumeImpact, (value) => updateOutcome(outcome.id, { volumeImpact: value }), isLocked)}</dd></div>
                </dl>
                <strong>{outcome.guardrailStatus.replaceAll('_', ' ')}</strong>
                <SourceLine source={outcome.source} />
              </article>
            ))}
          </div>
        </section>

        <section className="atlas-strategy-editor-block">
          <header>
            <h2>Can / cannot concede</h2>
          </header>
          <div className="atlas-strategy-concede-grid">
            <article>
              <span>Can concede</span>
              {plan.canConcede.map((item, index) => (
                <input
                  disabled={isLocked}
                  key={`${item}-${index}`}
                  onChange={(event) => updatePlan('canConcede', plan.canConcede.map((current, itemIndex) => itemIndex === index ? event.currentTarget.value : current), 'Can concede')}
                  value={item}
                />
              ))}
            </article>
            <article>
              <span>Cannot concede</span>
              {plan.cannotConcede.map((item, index) => (
                <input
                  disabled={isLocked}
                  key={`${item}-${index}`}
                  onChange={(event) => updatePlan('cannotConcede', plan.cannotConcede.map((current, itemIndex) => itemIndex === index ? event.currentTarget.value : current), 'Cannot concede')}
                  value={item}
                />
              ))}
            </article>
          </div>
        </section>

        <section className="atlas-strategy-output-block">
          <header>
            <h2>Outputs from this strategy</h2>
            <p>Reports open in a new editable tab and reference Strategy v{plan.version} · {plan.status}.</p>
          </header>
          <div>
            {outputLinks.map(([label, prompt]) => {
              return (
                <a href={generatedHref(prompt, workspace.buyingGroup.id, plan)} key={label} rel="noreferrer" target="_blank">
                  {label}
                  <em>{plan.status}</em>
                  <ArrowRight size={14} />
                </a>
              );
            })}
          </div>
        </section>

        <section className="atlas-strategy-version-block">
          <header>
            <h2>Version history</h2>
          </header>
          {plan.versionHistory.map((version) => (
            <article key={`${version.version}-${version.status}`}>
              <span>v{version.version}</span>
              <strong>{version.status.replaceAll('_', ' ')}</strong>
              <p>{version.summary}</p>
              {version.lockedAt ? <em>Locked {new Date(version.lockedAt).toLocaleDateString()}</em> : null}
            </article>
          ))}
        </section>
      </section>

      {evidencePanelOpen ? (
        <StrategyEvidenceSidePanel
          isLocked={isLocked}
          onAddEvidence={addEvidenceToStrategy}
          onClose={() => setEvidencePanelOpen(false)}
          plan={plan}
          planRead={planRead}
          workspace={workspace}
        />
      ) : null}

      <section className="atlas-strategy-command">
        <button type="button" className="voice"><Mic size={15} /> Voice</button>
        <input
          onChange={(event) => setAssistantPrompt(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitAssistantCommand();
          }}
          placeholder={isLocked ? 'Locked strategy: ask ATLAS to compare, report, or create a new draft...' : 'Ask ATLAS to revise the plan, test red line, build concession path...'}
          value={assistantPrompt}
        />
        <button type="button" onClick={submitAssistantCommand}><Send size={15} /></button>
        {assistantNote ? <p><Sparkles size={13} /> {assistantNote}</p> : null}
      </section>
    </main>
  );
}
