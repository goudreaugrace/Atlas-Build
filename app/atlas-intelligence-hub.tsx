'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileSearch,
  Filter,
  Globe2,
  Layers3,
  LineChart,
  Loader2,
  Mic,
  Newspaper,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X
} from 'lucide-react';
import {
  atlasIntelligenceSeed,
  buildAtlasIntelligencePacket,
  buildBuyingGroupWorkspacePacket,
  buildRetrievalMessage,
  calculateScenarioOutputs,
  competitorMovesFor,
  documentsFor,
  euros,
  getBuyingGroup,
  getMarket,
  pct,
  riskRank,
  signalsFor,
  timelineFor
} from '@/src/lib/atlas-intelligence/kernel';
import type {
  AtlasConfidence,
  AtlasRiskLevel,
  AtlasStatus,
  BuyingGroup,
  CompetitorMove,
  DocumentArtifact,
  ExternalSignal,
  Market,
  ScenarioInputs,
  SourceMeta,
  TimelineEvent
} from '@/src/lib/atlas-intelligence/types';

type HubView =
  | 'overview'
  | 'markets'
  | 'market'
  | 'buyingGroups'
  | 'buyingGroup'
  | 'signals'
  | 'competitors'
  | 'financialImpact'
  | 'documents'
  | 'timeline'
  | 'database'
  | 'howItWorks'
  | 'scenarioModels';

type AtlasIntelligenceHubProps = {
  view: HubView;
  marketId?: string;
  buyingGroupId?: string;
  initialPrompt?: string;
  initialGeneratedView?: string;
  initialSort?: string;
  initialMonitorTab?: string;
  initialBuyingGroupView?: string;
  initialBuyingGroupPhase?: string;
  initialBuyingGroupPrompt?: string;
};

const packet = buildAtlasIntelligencePacket();

type BuyingGroupWorkspacePacket = NonNullable<ReturnType<typeof buildBuyingGroupWorkspacePacket>>;

type BuyerProfileDocumentUpdate = {
  id: string;
  fileName: string;
  documentType: string;
  note: string;
  impactType: string;
  createdAt: string;
  confirmedAt?: string;
  buyerAskDelta: number;
  expectedRealizationDelta: number;
  marginAtRiskDelta: number;
  tradeSpendDelta: number;
  profileImpactSummary?: string;
  riskDelta?: 'increased' | 'reduced' | 'unchanged';
  confidenceDelta?: 'increased' | 'reduced' | 'unchanged';
};

type BuyerProfileRead = {
  currentState: BuyingGroupWorkspacePacket['currentState'];
  exposure: BuyingGroup['financialExposure'];
  source: SourceMeta;
  updateImpacts: {
    buyerAskDelta: number;
    expectedRealizationDelta: number;
    marginAtRiskDelta: number;
    tradeSpendDelta: number;
  };
  updateCount: number;
  updateSummary: string;
  lastUpdate?: BuyerProfileDocumentUpdate;
};

type StoredGeneratedView = {
  artifactType?: 'generated_view' | 'negotiation_plan';
  audienceMode?: 'internal_cno' | 'leadership_safe' | 'kam_safe' | 'customer_safe';
  id: string;
  lifecycleState?: 'retrieved' | 'draft' | 'edited' | 'attached' | 'superseded';
  title: string;
  prompt: string;
  mode: 'retrieved' | 'new_draft' | 'duplicated';
  buyingGroupId?: string;
  marketId?: string;
  revisionCount?: number;
  savedDestination?: 'buyer_profile' | 'market_profile' | 'atlas_database';
  savedToProfileAt?: string;
  sourceDocumentId?: string;
  sourceDecision?: string;
  summary?: string;
  sourceName: string;
  sourceDate: string;
  confidence: string;
  contentSnapshot?: {
    sections: unknown[];
    summary: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
};

const GENERATED_VIEW_STORAGE_KEY = 'atlas-generated-views';

function classNameForRisk(risk: AtlasRiskLevel) {
  return `risk-${risk}`;
}

function classNameForStatus(status: AtlasStatus) {
  return `status-${status.replace('_', '-')}`;
}

function labelForStatus(status: AtlasStatus) {
  if (status === 'needs_validation') return 'source review';
  return status.replace('_', ' ');
}

function readinessLabel(status: BuyingGroupWorkspacePacket['readiness']['status']) {
  if (status === 'escalation_needed') return 'Escalation needed';
  if (status === 'needs_review') return 'Needs review';
  return 'Ready';
}

function parsePctValue(value: string) {
  const parsed = Number(value.replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampProfileNumber(value: number, min = 0) {
  return Math.max(min, Number(value.toFixed(1)));
}

function signedPointLabel(value: number) {
  if (value === 0) return 'No movement';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} pts from supporting docs`;
}

function signedEuroLabel(value: number) {
  if (value === 0) return 'No movement';
  return `${value > 0 ? '+' : ''}${euros(value)}`;
}

function profileRiskDelta(update: BuyerProfileDocumentUpdate): NonNullable<BuyerProfileDocumentUpdate['riskDelta']> {
  if (update.marginAtRiskDelta > 0 || update.tradeSpendDelta > 0 || update.buyerAskDelta > 0) return 'increased';
  if (update.marginAtRiskDelta < 0 || update.tradeSpendDelta < 0 || update.expectedRealizationDelta > 0) return 'reduced';
  return 'unchanged';
}

function profileConfidenceDelta(update: BuyerProfileDocumentUpdate): NonNullable<BuyerProfileDocumentUpdate['confidenceDelta']> {
  if (update.note.trim().length > 24 && update.fileName.trim()) return 'increased';
  if (!update.note.trim()) return 'reduced';
  return 'unchanged';
}

function profileImpactSummary(update: BuyerProfileDocumentUpdate) {
  const risk = profileRiskDelta(update);
  const confidence = profileConfidenceDelta(update);
  const riskPhrase = risk === 'increased' ? 'raises risk' : risk === 'reduced' ? 'reduces risk' : 'keeps risk flat';
  const confidencePhrase = confidence === 'increased' ? 'adds confidence' : confidence === 'reduced' ? 'needs stronger source detail' : 'keeps confidence flat';
  return `${update.documentType.replaceAll('_', ' ')} ${riskPhrase}; ${confidencePhrase}. Buyer ask ${signedPointLabel(update.buyerAskDelta).toLowerCase()}, PepsiCo position ${signedPointLabel(update.expectedRealizationDelta).toLowerCase()}, margin ${signedEuroLabel(update.marginAtRiskDelta).toLowerCase()}.`;
}

function buildUserEnteredSource(update: BuyerProfileDocumentUpdate | undefined, fallback: SourceMeta): SourceMeta {
  if (!update) return fallback;
  return {
    sourceName: update.fileName,
    sourceType: 'user_entered',
    sourceDate: update.createdAt.slice(0, 10),
    lastUpdated: update.createdAt.slice(0, 10),
    confidence: 'medium',
    status: 'modeled',
    governance: {
      sourceType: 'user_entered',
      sourceOwner: 'CNO user',
      approvalStatus: 'draft',
      allowedUse: ['demo', 'review_draft'],
      canonicalUseAllowed: 'with_caveat',
      confidence: 'medium',
      caveats: ['Prototype update based on document metadata and user-entered impacts. File parsing is not connected yet.'],
      replacementRequirement: 'Connect source ingestion before official use.'
    }
  };
}

function buildGeneratedViewSource(view: StoredGeneratedView, fallback: SourceMeta): SourceMeta {
  const lifecycleState = view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft');
  return {
    ...fallback,
    sourceName: view.sourceName || fallback.sourceName,
    sourceType: 'ai_generated',
    sourceDate: (view.savedToProfileAt ?? view.updatedAt ?? view.createdAt).slice(0, 10),
    lastUpdated: (view.updatedAt ?? view.savedToProfileAt ?? view.createdAt).slice(0, 10),
    confidence: view.confidence === 'low' || view.confidence === 'medium' || view.confidence === 'high' ? view.confidence : fallback.confidence,
    status: lifecycleState === 'retrieved' ? 'ready' : lifecycleState === 'attached' ? 'modeled' : 'needs_validation',
    governance: {
      sourceType: 'ai_generated',
      sourceOwner: 'ATLAS generated view',
      approvalStatus: 'draft',
      allowedUse: ['demo', 'review_draft'],
      canonicalUseAllowed: 'with_caveat',
      confidence: view.confidence === 'low' || view.confidence === 'medium' || view.confidence === 'high' ? view.confidence : fallback.confidence,
      caveats: [
        view.sourceDecision ?? 'Generated or retrieved in prototype mode. Review before official use.',
        lifecycleState === 'attached'
          ? 'Attached to buyer or market memory as a working artifact, not an approved source.'
          : 'Saved as a draft until attached or superseded.'
      ],
      replacementRequirement: 'Save official source or approval state before customer-facing use.'
    }
  };
}

function buildBuyerProfileRead(workspace: BuyingGroupWorkspacePacket, updates: BuyerProfileDocumentUpdate[]): BuyerProfileRead {
  const exposure = workspace.buyingGroup.financialExposure;
  const totals = updates.reduce(
    (acc, update) => ({
      buyerAskDelta: acc.buyerAskDelta + update.buyerAskDelta,
      expectedRealizationDelta: acc.expectedRealizationDelta + update.expectedRealizationDelta,
      marginAtRiskDelta: acc.marginAtRiskDelta + update.marginAtRiskDelta,
      tradeSpendDelta: acc.tradeSpendDelta + update.tradeSpendDelta
    }),
    { buyerAskDelta: 0, expectedRealizationDelta: 0, marginAtRiskDelta: 0, tradeSpendDelta: 0 }
  );
  const lastUpdate = updates[0];
  const adjustedExpectedRealization = clampProfileNumber(exposure.expectedPriceRealization + totals.expectedRealizationDelta);
  const adjustedMarginAtRisk = Math.max(0, exposure.marginAtRisk + totals.marginAtRiskDelta + Math.max(0, totals.buyerAskDelta) * 800000);
  const adjustedGapToPlan = Math.max(0, exposure.gapToPlan - totals.expectedRealizationDelta * 1100000 + Math.max(0, totals.buyerAskDelta) * 650000);

  return {
    currentState: {
      ...workspace.currentState,
      latestBuyerAsk: pct(clampProfileNumber(parsePctValue(workspace.currentState.latestBuyerAsk) + totals.buyerAskDelta)),
      pepsicoPosition: pct(clampProfileNumber(parsePctValue(workspace.currentState.pepsicoPosition) + totals.expectedRealizationDelta)),
      nextMilestone: lastUpdate
        ? `Updated from ${lastUpdate.fileName}: ${lastUpdate.note || lastUpdate.impactType.replaceAll('_', ' ')}.`
        : workspace.currentState.nextMilestone
    },
    exposure: {
      ...exposure,
      expectedPriceRealization: adjustedExpectedRealization,
      acceptedPriceRealization: exposure.acceptedPriceRealization
        ? clampProfileNumber(exposure.acceptedPriceRealization + totals.expectedRealizationDelta * 0.5)
        : undefined,
      marginAtRisk: adjustedMarginAtRisk,
      tradeSpendExposure: Math.max(0, exposure.tradeSpendExposure + totals.tradeSpendDelta),
      gapToPlan: adjustedGapToPlan
    },
    source: buildUserEnteredSource(lastUpdate, workspace.documents[0]?.source ?? workspace.buyingGroup.source),
    updateImpacts: totals,
    updateCount: updates.length,
    updateSummary: updates.length
      ? `${updates.length} supporting ${updates.length === 1 ? 'document is' : 'documents are'} shaping this buyer profile.`
      : 'Base read from ATLAS source memory.',
    lastUpdate
  };
}

function commandHref(command: string) {
  const normalized = command.trim().toLowerCase();
  const encoded = encodeURIComponent(command.trim());
  const directBuyingGroup = packet.buyingGroups.find((group) => normalized.includes(group.name.toLowerCase()) || normalized.includes(group.id));
  if (directBuyingGroup && /profile|history|financial|overview|buyer|buying group|group|carrefour|edeka|tesco|aldi|lidl|rewe|auchan|intermarche|coop/.test(normalized)) {
    const view = /financial|margin|scenario|price|realization|volume|trade/.test(normalized)
      ? 'financials'
      : /history|memory|debrief|document|source|prior/.test(normalized)
        ? 'memory'
        : 'snapshot';
    return `/buying-groups/${directBuyingGroup.id}?ask=${encoded}&view=${view}`;
  }
  if (/financial|margin exposure|margin risk|revenue|gap|volume exposure|exposure|losing money|offset/.test(normalized)) return `/financial-impact?ask=${encoded}&view=money-at-risk`;
  if (/scenario|model|price move|realization|3\.2|trade spend|stress test/.test(normalized)) return `/scenario-models?ask=${encoded}&view=scenario`;
  if (/competitor|mondelez|kellanova|coca|nestle|private label/.test(normalized)) return `/competitors?ask=${encoded}&view=competitor-impact`;
  if (/database|data source|source table|raw data|actual data|source link|source links/.test(normalized)) return `/database?ask=${encoded}&view=source-database`;
  if (/document|source|file/.test(normalized)) return `/documents?ask=${encoded}&view=source-readiness`;
  if (/timeline|memory|history|decision|debrief/.test(normalized)) return `/timeline?ask=${encoded}&view=memory-index`;
  if (/market|germany|france|uk|united kingdom|spain|italy|poland|netherlands|belgium/.test(normalized)) return `/markets?ask=${encoded}&view=market-comparison`;
  if (/buying group|buyer|carrefour|edeka|tesco|aldi|lidl|rewe|auchan|round|intervention/.test(normalized)) return `/buying-groups?ask=${encoded}&view=buyer-ranking`;
  if (/signal|news|changed|external|public|inflation|regulatory/.test(normalized)) return `/signals?ask=${encoded}&view=signal-impact`;
  return `/?ask=${encoded}&view=focus`;
}

function tokenizeCommand(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%.\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !['the', 'and', 'for', 'with', 'show', 'pull', 'open', 'make', 'create', 'generate', 'give', 'report', 'view'].includes(token));
}

function documentSearchText(document: DocumentArtifact) {
  const group = document.buyingGroupId ? getBuyingGroup(document.buyingGroupId)?.name ?? document.buyingGroupId : '';
  const market = document.marketId ? getMarket(document.marketId)?.name ?? document.marketId : '';
  return [
    document.title,
    document.documentType.replaceAll('_', ' '),
    document.summary,
    group,
    market,
    String(document.year),
    document.status,
    document.source.sourceName
  ].join(' ').toLowerCase();
}

function findExistingReportForCommand(command: string) {
  const tokens = tokenizeCommand(command);
  if (!tokens.length) return undefined;

  return packet.documents
    .map((document) => {
      const searchText = documentSearchText(document);
      const score = tokens.reduce((total, token) => total + (searchText.includes(token) ? 1 : 0), 0)
        + (/debrief|brief|report|pack|summary|visual|document|deck|source|corridor|scenario|profile/i.test(command) && document.reusable ? 1 : 0)
        + (document.status === 'approved' || document.status === 'ready' ? 0.5 : 0);
      return { document, score };
    })
    .filter((item) => item.score >= Math.max(2, Math.ceil(tokens.length * 0.35)))
    .sort((a, b) => b.score - a.score)[0]?.document;
}

function isReportCommand(command: string) {
  return /report|brief|pack|deck|pdf|document|data view|data visualization|visual|readout|summary|prep|debrief|source|pull up|show me|show|find|what|where|which|create|generate|make|give me/i.test(command);
}

function isGeneratedOutputHref(href: string) {
  return href.startsWith('/generated-views') || href.startsWith('/atlas-output');
}

function generatedOutputLinkProps(href: string) {
  return isGeneratedOutputHref(href) ? { rel: 'noreferrer', target: '_blank' } : {};
}

function outputHrefForCommand(command: string) {
  const encoded = encodeURIComponent(command.trim());
  const existing = findExistingReportForCommand(command);
  if (existing) {
    const scope = `${existing.buyingGroupId ? `&buyingGroupId=${encodeURIComponent(existing.buyingGroupId)}` : ''}${existing.marketId ? `&marketId=${encodeURIComponent(existing.marketId)}` : ''}`;
    return `/generated-views?prompt=${encoded}&mode=retrieved&documentId=${encodeURIComponent(existing.id)}${scope}`;
  }
  if (isReportCommand(command)) {
    return `/generated-views?prompt=${encoded}&mode=draft&editable=1`;
  }
  return commandHref(command);
}

function SourceTrustBar({ linked = true, source }: { linked?: boolean; source: SourceMeta }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="atlas-source-trust-bar" aria-label="Source trust">
        <span>{source.sourceType.replaceAll('_', ' ')}</span>
        {source.url && linked ? (
          <a href={source.url} rel="noreferrer" target="_blank">{source.sourceName}</a>
        ) : (
          <strong>{source.sourceName}</strong>
        )}
        <span>{source.sourceDate}</span>
        <span>Updated {source.lastUpdated}</span>
        <span className={`confidence-${source.confidence}`}>Confidence {source.confidence}</span>
        <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
        <span>{source.governance.canonicalUseAllowed === 'yes' ? 'Canonical use' : source.governance.canonicalUseAllowed === 'with_caveat' ? 'Use with caveat' : 'Not canonical'}</span>
        <button type="button" onClick={() => setOpen(true)}>Inspect source</button>
      </div>
      {open ? <SourceDetailDrawer onClose={() => setOpen(false)} source={source} /> : null}
    </>
  );
}

function SourceDetailDrawer({ onClose, source }: { onClose: () => void; source: SourceMeta }) {
  const governance = source.governance;
  const allowedUse = governance.allowedUse.map((item) => item.replaceAll('_', ' ')).join(', ');
  const canonicalLabel = governance.canonicalUseAllowed === 'yes'
    ? 'Canonical use approved'
    : governance.canonicalUseAllowed === 'with_caveat'
      ? 'Use with caveat'
      : 'Not canonical';

  return (
    <div className="atlas-source-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="atlas-source-drawer" aria-label="Source detail" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Source detail</span>
            <h2>{source.sourceName}</h2>
          </div>
          <button type="button" aria-label="Close source detail" onClick={onClose}><X size={17} /></button>
        </header>
        <section className="atlas-source-drawer-summary">
          <div><span>Type</span><strong>{source.sourceType.replaceAll('_', ' ')}</strong></div>
          <div><span>Status</span><strong>{labelForStatus(source.status)}</strong></div>
          <div><span>Confidence</span><strong>{source.confidence}</strong></div>
          <div><span>Canonical</span><strong>{canonicalLabel}</strong></div>
        </section>
        <dl>
          <div><dt>Source owner</dt><dd>{governance.sourceOwner}</dd></div>
          <div><dt>Source date</dt><dd>{source.sourceDate}</dd></div>
          <div><dt>Last updated</dt><dd>{source.lastUpdated}</dd></div>
          <div><dt>Approval status</dt><dd>{governance.approvalStatus.replaceAll('_', ' ')}</dd></div>
          <div><dt>Allowed use</dt><dd>{allowedUse || 'No allowed-use state listed'}</dd></div>
          <div><dt>Replacement requirement</dt><dd>{governance.replacementRequirement ?? 'No replacement required for prototype read'}</dd></div>
        </dl>
        {governance.caveats.length ? (
          <section>
            <h3>Caveats</h3>
            <ul>
              {governance.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}
            </ul>
          </section>
        ) : null}
        <footer>
          {source.url ? <a href={source.url} rel="noreferrer" target="_blank">Open linked source</a> : <span>No source link connected yet</span>}
          <a href={`/database?source=${encodeURIComponent(source.sourceName)}`}>Find in database</a>
        </footer>
      </aside>
    </div>
  );
}

function useStoredGeneratedViews(filter: { buyingGroupId?: string; marketId?: string }) {
  const [views, setViews] = useState<StoredGeneratedView[]>([]);

  useEffect(() => {
    function loadViews() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
        const allViews = Array.isArray(parsed) ? parsed as StoredGeneratedView[] : [];
        setViews(allViews.filter((view) => {
          if (filter.buyingGroupId) return view.buyingGroupId === filter.buyingGroupId;
          if (filter.marketId) return view.marketId === filter.marketId;
          return true;
        }));
      } catch {
        setViews([]);
      }
    }

    loadViews();
    window.addEventListener('storage', loadViews);
    window.addEventListener('focus', loadViews);
    return () => {
      window.removeEventListener('storage', loadViews);
      window.removeEventListener('focus', loadViews);
    };
  }, [filter.buyingGroupId, filter.marketId]);

  return views;
}

function saveStoredGeneratedView(view: StoredGeneratedView) {
  if (typeof window === 'undefined') return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
    const allViews = Array.isArray(parsed) ? parsed as StoredGeneratedView[] : [];
    const nextViews = [view, ...allViews.filter((item) => item.id !== view.id)].slice(0, 60);
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify(nextViews));
    window.dispatchEvent(new Event('storage'));
  } catch {
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([view]));
    window.dispatchEvent(new Event('storage'));
  }
}

function SavedGeneratedViewsShelf({ buyingGroupId, marketId }: { buyingGroupId?: string; marketId?: string }) {
  const savedViews = useStoredGeneratedViews({ buyingGroupId, marketId });
  if (!savedViews.length) return null;
  const attachedCount = savedViews.filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached').length;
  const shelfTitle = buyingGroupId
    ? 'Generated views saved to buyer history'
    : marketId
      ? 'Generated views saved to market memory'
      : 'Generated views saved to ATLAS';

  return (
    <section className="atlas-saved-generated-views" aria-label="Saved generated views">
      <header>
        <h3>{shelfTitle}</h3>
        <span>{attachedCount} attached / {savedViews.length} total</span>
      </header>
      <div>
        {savedViews.slice(0, 5).map((view) => (
          <a href={hrefForStoredGeneratedView(view)} key={view.id} rel="noreferrer" target="_blank">
            <div>
              <strong>{view.title}</strong>
              <span>{view.summary ?? view.prompt}</span>
            </div>
            <em>{(view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')).replaceAll('_', ' ')}</em>
            <small>{view.sourceName} · {new Date(view.updatedAt).toLocaleDateString('en-US')} · {view.confidence}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: AtlasStatus }) {
  return <span className={`atlas-status-chip ${classNameForStatus(status)}`}>{labelForStatus(status)}</span>;
}

function ConfidenceChip({ confidence }: { confidence: AtlasConfidence }) {
  return <span className={`atlas-confidence-chip confidence-${confidence}`}>Confidence {confidence}</span>;
}

function FinancialImpactStrip({
  revenue,
  margin,
  volume,
  trade
}: {
  revenue?: number;
  margin?: number;
  volume?: number;
  trade?: number;
}) {
  return (
    <div className="atlas-financial-strip">
      <span><small>Revenue</small><strong>{Number.isFinite(revenue) ? euros(revenue ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Margin</small><strong>{Number.isFinite(margin) ? euros(margin ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Volume</small><strong>{Number.isFinite(volume) ? euros(volume ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Trade spend</small><strong>{Number.isFinite(trade) ? euros(trade ?? 0) : 'Not modeled'}</strong></span>
    </div>
  );
}

function CommandBar({ initialPrompt = '' }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState('');

  function submit(command = prompt) {
    const trimmed = command.trim();
    if (!trimmed) return;
    setStatus('Routing intelligence request...');
    window.setTimeout(() => {
      window.location.href = commandHref(trimmed);
    }, 500);
  }

  const examples = [
    'Show high-risk buying groups in Germany',
    'What changed across Europe this week?',
    'Find competitor moves affecting Carrefour',
    'Show margin exposure by market',
    'Retrieve prior-year EDEKA debrief',
    'Model 3.2% price realization for France'
  ];

  return (
    <section className="atlas-command-bar" aria-label="ATLAS command bar">
      <Search size={17} />
      <input
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
        placeholder="Ask ATLAS to find a signal, explain financial risk, retrieve a document, or model a scenario..."
        aria-label="Ask ATLAS"
      />
      <button type="button" onClick={() => submit()}><ArrowRight size={16} /> Ask</button>
      <button type="button" className="quiet" onClick={() => setStatus('Voice command placeholder ready for explicit-start capture.')}><Mic size={15} /> Voice</button>
      <div className="atlas-command-examples">
        {examples.map((example) => (
          <button type="button" key={example} onClick={() => submit(example)}>{example}</button>
        ))}
      </div>
      {status ? <p>{status}</p> : null}
    </section>
  );
}

function isNavItemActive(href: string, view: HubView) {
  if (href === '/' && view === 'overview') return true;
  if (href.startsWith('/markets') && (view === 'markets' || view === 'market')) return true;
  if (href.startsWith('/buying-groups') && (view === 'buyingGroups' || view === 'buyingGroup')) return true;
  if (href.startsWith('/signals') && view === 'signals') return true;
  if (href.startsWith('/competitors') && view === 'competitors') return true;
  if (href.startsWith('/financial-impact') && view === 'financialImpact') return true;
  if (href.startsWith('/scenario-models') && view === 'scenarioModels') return true;
  if (href.startsWith('/documents') && view === 'documents') return true;
  if (href.startsWith('/timeline') && view === 'timeline') return true;
  if (href.startsWith('/database') && view === 'database') return true;
  if (href.startsWith('/how-it-works') && view === 'howItWorks') return true;
  return false;
}

function hubCommandConfig({
  buyingGroupId,
  marketId,
  view
}: {
  buyingGroupId?: string;
  marketId?: string;
  view: HubView;
}) {
  const buyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
  const market = marketId ? getMarket(marketId) : undefined;

  if (buyingGroup) {
    return {
      basePath: `/buying-groups/${buyingGroup.id}`,
      examples: [
        `Show me ${buyingGroup.name} financial exposure`,
        `Pull ${buyingGroup.name} buyer history`,
        `Create a ${buyingGroup.name} prep report`
      ],
      placeholder: `Ask ATLAS about ${buyingGroup.name}, its numbers, history, documents, or room reports...`
    };
  }

  if (market) {
    return {
      basePath: `/markets/${market.id}`,
      examples: [
        `Show ${market.name} margin exposure`,
        `Which buyers are driving ${market.name} pressure?`,
        `Create a ${market.name} market readout`
      ],
      placeholder: `Ask ATLAS about ${market.name}, buyer pressure, margin risk, or market signals...`
    };
  }

  if (view === 'markets') {
    return {
      basePath: '/markets',
      examples: ['Where am I losing money by market?', 'Show offset opportunities', 'Rank markets by margin risk'],
      placeholder: 'Ask for market risk, offsets, buyer pressure, or margin exposure...'
    };
  }

  if (view === 'buyingGroups') {
    return {
      basePath: '/buying-groups',
      examples: ['Which buying groups need CNO intervention?', 'Show groups below target realization', 'Show buyers with external pressure'],
      placeholder: 'Ask for high-risk groups, long negotiation rounds, target gaps, or external pressure...'
    };
  }

  if (view === 'financialImpact') {
    return {
      basePath: '/financial-impact',
      examples: ['Show margin exposure by market', 'Where am I below plan?', 'Show a risk waterfall for Carrefour'],
      placeholder: 'Ask for margin risk, gap to plan, realization, or trade spend exposure...'
    };
  }

  if (view === 'scenarioModels') {
    return {
      basePath: '/scenario-models',
      examples: ['Model 3.2% realization for Carrefour', 'Compare Germany and France exposure', 'Create a scenario report for EDEKA'],
      placeholder: 'Ask ATLAS to model a buyer, market, price move, trade spend shift, or scenario report...'
    };
  }

  if (view === 'database') {
    return {
      basePath: '/database',
      examples: ['Show stale source records', 'Find source links for Carrefour', 'Show high confidence competitor sources'],
      placeholder: 'Ask for source records by buyer, market, confidence, status, or data type...'
    };
  }

  if (view === 'competitors') {
    return {
      basePath: '/competitors',
      examples: ['Find competitor moves affecting Carrefour', 'Show private label pressure', 'Create competitor leverage readout'],
      placeholder: 'Ask for competitor moves, buyer leverage, affected markets, or margin impact...'
    };
  }

  return {
    basePath: '/',
    examples: ['What needs my attention today?', 'Show margin exposure across Europe', 'Create a news impact report'],
    placeholder: 'Ask ATLAS to pull a view, report, buyer read, source, or scenario...'
  };
}

function AppShell({
  buyingGroupId,
  children,
  commandPrompt,
  marketId,
  view
}: {
  buyingGroupId?: string;
  children: React.ReactNode;
  commandPrompt?: string;
  marketId?: string;
  view: HubView;
}) {
  const commandConfig = hubCommandConfig({ buyingGroupId, marketId, view });
  const primaryNav = [
    { label: 'Overview', href: '/' },
    { label: 'Markets', href: '/markets' },
    { label: 'Buying Groups', href: '/buying-groups' },
    { label: 'PepsiCo Impact', href: '/financial-impact' },
    { label: 'Scenario Models', href: '/scenario-models' },
    { label: 'Database', href: '/database' },
    { label: 'How it works', href: '/how-it-works' }
  ];
  const marketMenu = [...packet.markets]
    .sort((a, b) => riskRank(b.pressureLevel) - riskRank(a.pressureLevel) || b.marginAtRisk - a.marginAtRisk);
  const buyingGroupMenu = [...packet.buyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk);

  return (
    <main className="atlas-hub-shell">
      <section className="atlas-hub-main">
        <header className="atlas-hub-header">
          <a className="atlas-hub-brand" href="/">
            <Sparkles size={18} />
            <span>ATLAS</span>
          </a>
          <nav className="atlas-primary-nav" aria-label="Primary intelligence navigation">
            {primaryNav.map((item) => {
              if (item.href === '/markets') {
                return (
                  <div className="atlas-primary-nav-item has-menu" key={item.href}>
                    <a href={item.href} className={isNavItemActive(item.href, view) ? 'active' : ''}>
                      {item.label}
                    </a>
                    <div className="atlas-nav-dropdown" role="menu" aria-label="Market shortcuts">
                      {marketMenu.map((market) => (
                        <a href={`/markets/${market.id}`} key={market.id} role="menuitem">
                          <span>{market.name}</span>
                          <em>{market.pressureLevel} · {euros(market.marginAtRisk)}</em>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              if (item.href === '/buying-groups') {
                return (
                  <div className="atlas-primary-nav-item has-menu" key={item.href}>
                    <a href={item.href} className={isNavItemActive(item.href, view) ? 'active' : ''}>
                      {item.label}
                    </a>
                    <div className="atlas-nav-dropdown" role="menu" aria-label="Buying group shortcuts">
                      {buyingGroupMenu.map((group) => (
                        <a href={`/buying-groups/${group.id}`} key={group.id} role="menuitem">
                          <span>{group.name}</span>
                          <em>{group.riskLevel} · {euros(group.financialExposure.marginAtRisk)}</em>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div className="atlas-primary-nav-item" key={item.href}>
                  <a href={item.href} className={isNavItemActive(item.href, view) ? 'active' : ''}>
                    {item.label}
                  </a>
                </div>
              );
            })}
          </nav>
          <div className="atlas-hub-context">
            <span>Europe CNO Hub</span>
            <span>{new Date(packet.generatedAt).toLocaleDateString('en-US')}</span>
            <span>EUR</span>
          </div>
        </header>
        {children}
        <AtlasCommandSurface
          basePath={commandConfig.basePath}
          className="atlas-global-command-surface"
          examples={commandConfig.examples}
          initialPrompt={commandPrompt}
          placeholder={commandConfig.placeholder}
        />
      </section>
    </main>
  );
}

function PageBrief({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <section className="atlas-page-brief">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      <strong>{action}</strong>
    </section>
  );
}

function IntentBrief({
  action,
  body,
  eyebrow,
  metrics,
  title
}: {
  action: string;
  body?: string;
  eyebrow?: string;
  metrics?: Array<{ label: string; value: string; tone?: 'risk' | 'good' | 'watch' }>;
  title: string;
}) {
  return (
    <section className="atlas-intent-brief">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
      </div>
      {metrics?.length ? (
        <dl>
          {metrics.map((metric) => (
            <div className={metric.tone ? `tone-${metric.tone}` : ''} key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <strong>{action}</strong>
    </section>
  );
}

function SnapshotStrip({
  items
}: {
  items: Array<{ action?: string; body: string; href?: string; label: string; title: string; value?: string }>;
}) {
  return (
    <section className="atlas-snapshot-strip" aria-label="Key snapshots">
      {items.map((item) => {
        const content = (
          <>
            <span>{item.label}</span>
            {item.value ? <strong>{item.value}</strong> : null}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.action ? <em>{item.action}</em> : null}
          </>
        );
        if (item.href) return <a href={item.href} key={item.label} {...generatedOutputLinkProps(item.href)}>{content}</a>;
        return <article key={item.label}>{content}</article>;
      })}
    </section>
  );
}

function inferGeneratedView(prompt?: string, fallback = 'focus') {
  const normalized = (prompt ?? '').toLowerCase();
  if (!normalized) return fallback;
  if (/market|germany|france|uk|spain|italy|poland|netherlands|belgium|offset/.test(normalized)) return 'market-comparison';
  if (/buying group|buyer|carrefour|edeka|tesco|aldi|lidl|rewe|round|intervention/.test(normalized)) return 'buyer-ranking';
  if (/financial|margin|revenue|gap|volume|trade|exposure|losing money|realization/.test(normalized)) return 'money-at-risk';
  if (/signal|news|changed|external|inflation|commodity|private label/.test(normalized)) return 'signal-impact';
  if (/competitor|mondelez|kellanova|coca|nestle/.test(normalized)) return 'competitor-impact';
  if (/document|source|file|prep|deck|debrief|validation/.test(normalized)) return 'source-readiness';
  if (/memory|timeline|history|decision|debrief/.test(normalized)) return 'memory-index';
  return fallback;
}

type AtlasQuickAnswer = {
  actionLabel: string;
  answer: string;
  href: string;
  source: SourceMeta;
  title: string;
};

function buildAtlasQuickAnswer(command: string, basePath: string): AtlasQuickAnswer {
  const normalized = command.toLowerCase();
  const existingReport = findExistingReportForCommand(command);
  const buyerMatch = basePath.match(/^\/buying-groups\/([^/?#]+)/);
  const marketMatch = basePath.match(/^\/markets\/([^/?#]+)/);
  const scope = [
    buyerMatch ? `buyingGroupId=${encodeURIComponent(buyerMatch[1])}` : '',
    marketMatch ? `marketId=${encodeURIComponent(marketMatch[1])}` : ''
  ].filter(Boolean).join('&');
  const unscopedReportHref = outputHrefForCommand(command);
  const reportHref = unscopedReportHref.startsWith('/generated-views') && scope && !unscopedReportHref.includes('buyingGroupId=') && !unscopedReportHref.includes('marketId=')
    ? `${unscopedReportHref}${unscopedReportHref.includes('?') ? '&' : '?'}${scope}`
    : unscopedReportHref;
  const buyerWorkspace = buyerMatch ? buildBuyingGroupWorkspacePacket(buyerMatch[1]) : undefined;

  if (existingReport) {
    return {
      actionLabel: 'Open existing report',
      answer: `ATLAS found an existing ${existingReport.documentType.replaceAll('_', ' ')} for this request. Use it first, then edit if the room context has changed.`,
      href: reportHref,
      source: existingReport.source,
      title: existingReport.title
    };
  }

  if (isReportCommand(command) && reportHref.startsWith('/generated-views')) {
    const source = buyerWorkspace?.documents[0]?.source ?? packet.documents[0].source;
    return {
      actionLabel: 'Open editable draft',
      answer: 'ATLAS does not have an exact reusable report for this request, so it is creating an editable draft from the available buyer, market, and source memory.',
      href: reportHref,
      source,
      title: 'New editable report'
    };
  }

  if (buyerWorkspace) {
    const profileRead = buildBuyerProfileRead(buyerWorkspace, []);
    const exposure = profileRead.exposure;
    const signal = buyerWorkspace.signals[0];
    const source = signal?.source ?? profileRead.source;

    if (/financial|margin|revenue|gap|volume|trade|price|realization|exposure/.test(normalized)) {
      return {
        actionLabel: 'Open financial view',
        answer: `${buyerWorkspace.buyingGroup.name} has ${euros(exposure.marginAtRisk)} margin at risk and expected realization is ${pct(exposure.expectedPriceRealization)} versus ${pct(exposure.targetPriceRealization)} target.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=financials`,
        source: profileRead.source,
        title: 'Financial answer'
      };
    }

    if (/history|timeline|debrief|document|source|prep|reaction|respond/.test(normalized)) {
      const latest = buyerWorkspace.timelineEvents[0];
      return {
        actionLabel: 'Open history',
        answer: latest
          ? `Latest buyer memory: ${latest.title}. This is the strongest current clue for how ${buyerWorkspace.buyingGroup.name} may respond.`
          : `No recent buyer memory is attached yet. Add a debrief or supporting document to improve the read.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=memory`,
        source: latest?.source ?? buyerWorkspace.documents[0]?.source ?? profileRead.source,
        title: 'Buyer history answer'
      };
    }

    if (/signal|news|competitor|private label|market|changed|world|pressure/.test(normalized)) {
      return {
        actionLabel: 'Open overview',
        answer: signal
          ? `${buyerWorkspace.buyingGroup.name} is likely to use this pressure point: ${signal.title}. ${signal.recommendedAction}`
          : `${buyerWorkspace.buyingGroup.name} has no buyer-specific external signal in the prototype data yet.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=snapshot`,
        source,
        title: 'Market signal answer'
      };
    }

    return {
      actionLabel: 'Open generated buyer view',
      answer: signal
        ? `${buyerWorkspace.buyingGroup.name} is likely to push on ${signal.title.toLowerCase()}. ATLAS created a focused view using the buyer profile, financial state, and source memory.`
        : `${buyerWorkspace.buyingGroup.name} should be read from its current position, active financial exposure, and latest timeline event first. ATLAS created a focused view from available memory.`,
      href: `${basePath}?ask=${encodeURIComponent(command)}&view=custom`,
      source,
      title: 'Generated buyer answer'
    };
  }

  const href = commandHref(command);
  const source = packet.signals[0]?.source ?? packet.markets[0].source;
  return {
    actionLabel: 'Open generated view',
    answer: 'ATLAS matched this request to the closest intelligence view. Open it for the ranked data, source context, and next action.',
    href,
    source,
    title: 'Fast answer'
  };
}

function AtlasCommandSurface({
  basePath,
  className = '',
  examples,
  initialPrompt = '',
  placeholder
}: {
  basePath: string;
  className?: string;
  examples: string[];
  initialPrompt?: string;
  placeholder: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<AtlasQuickAnswer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function resetCommandSurface() {
    setPrompt(initialPrompt);
    setStatus('');
    setIsThinking(false);
    setQuickAnswer(null);
  }

  useEffect(() => {
    resetCommandSurface();
  }, [basePath, initialPrompt]);

  useEffect(() => {
    function handlePageShow() {
      resetCommandSurface();
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [basePath, initialPrompt]);

  function scopedGeneratedViewHref(href: string) {
    if (!href.startsWith('/generated-views')) return href;
    const buyerMatch = basePath.match(/^\/buying-groups\/([^/?#]+)/);
    const marketMatch = basePath.match(/^\/markets\/([^/?#]+)/);
    const scope = [
      buyerMatch ? `buyingGroupId=${encodeURIComponent(buyerMatch[1])}` : '',
      marketMatch ? `marketId=${encodeURIComponent(marketMatch[1])}` : ''
    ].filter(Boolean).join('&');
    if (!scope || href.includes('buyingGroupId=') || href.includes('marketId=')) return href;
    return `${href}${href.includes('?') ? '&' : '?'}${scope}`;
  }

  function submit(command = prompt) {
    const trimmed = command.trim();
    if (!trimmed || isThinking) return;
    const href = scopedGeneratedViewHref(outputHrefForCommand(trimmed));
    const isOutput = href.startsWith('/generated-views') || href.startsWith('/atlas-output');
    const pendingOutputTab = isOutput ? window.open('about:blank', '_blank') : null;
    setIsThinking(true);
    setQuickAnswer(null);
    setStatus(isOutput ? 'ATLAS is checking the database and preparing the document...' : 'ATLAS is checking the data and source memory...');
    if (pendingOutputTab) {
      pendingOutputTab.document.write('<!doctype html><title>ATLAS is preparing</title><body style="margin:0;font-family:Inter,Arial,sans-serif;background:#fff;color:#0b1f33;display:grid;min-height:100vh;place-items:center;"><div style="text-align:center;"><strong style="font-size:18px;">ATLAS is preparing your document</strong><p style="color:#5f6f80;font-size:13px;">Checking the database and opening the report...</p></div></body>');
      pendingOutputTab.document.close();
    }

    window.setTimeout(() => {
      const answer = buildAtlasQuickAnswer(trimmed, basePath);
      if (isOutput) {
        setIsThinking(false);
        if (pendingOutputTab) {
          pendingOutputTab.location.href = href;
          setStatus('Generated report opened in a new tab.');
          return;
        }
        setStatus('Popup blocked. Opening here...');
        window.location.href = href;
        return;
      }
      setQuickAnswer(answer);
      setIsThinking(false);
      setStatus('Answer ready. Open the linked view for the full data.');
    }, 650);
  }

  function stageExample(example: string) {
    if (isThinking) return;
    setPrompt(example);
    setStatus('Prompt added. Adjust it or send when ready.');
    inputRef.current?.focus();
  }

  return (
    <section className={`atlas-command-surface${className ? ` ${className}` : ''}`} aria-label="Ask ATLAS">
      <div>
        <Sparkles size={16} />
        <strong>Ask ATLAS</strong>
        <span>Pull a view, report, buyer read, source, or scenario from this page.</span>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
        <button type="button" className="voice" onClick={() => setStatus('Voice capture placeholder ready. In the POC, typed commands create the same generated views.')} disabled={isThinking}><Mic size={14} /> Voice</button>
        <input
          ref={inputRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={placeholder}
          aria-label="Ask ATLAS for a generated view"
          disabled={isThinking}
        />
        <button type="submit" className="send" disabled={isThinking || !prompt.trim()}>
          {isThinking ? <Loader2 size={14} /> : <Send size={14} />}
          {isThinking ? 'Thinking' : 'Send'}
        </button>
      </form>
      {quickAnswer ? (
        <article className="atlas-command-answer">
          <span>Answer</span>
          <h3>{quickAnswer.title}</h3>
          <p>{quickAnswer.answer}</p>
          <SourceTrustMini source={quickAnswer.source} />
          <a href={quickAnswer.href} {...generatedOutputLinkProps(quickAnswer.href)}>{quickAnswer.actionLabel} <ArrowRight size={13} /></a>
        </article>
      ) : null}
      <div className="atlas-command-surface-examples">
        {examples.map((example) => (
          <button type="button" key={example} onClick={() => stageExample(example)} disabled={isThinking}>{example}</button>
        ))}
      </div>
      {status ? <p>{status}</p> : null}
    </section>
  );
}

function GeneratedWorkspace({
  ask,
  children,
  description,
  title
}: {
  ask?: string;
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="atlas-generated-workspace">
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
          {ask ? <em>Asked: “{ask}”</em> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function NextActionRail({
  actions
}: {
  actions: Array<{ href: string; label: string; reason: string }>;
}) {
  return (
    <section className="atlas-next-action-rail" aria-label="Recommended actions">
      {actions.map((action) => (
        <a href={action.href} key={action.label} {...generatedOutputLinkProps(action.href)}>
          <strong>{action.label}</strong>
          <span>{action.reason}</span>
          <ArrowRight size={14} />
        </a>
      ))}
    </section>
  );
}

function NextStepStrip({
  steps
}: {
  steps: Array<{ label: string; href: string; reason: string }>;
}) {
  return (
    <section className="atlas-next-step-strip" aria-label="Recommended next steps">
      {steps.map((step) => (
        <a href={step.href} key={step.label} {...generatedOutputLinkProps(step.href)}>
          <strong>{step.label}</strong>
          <span>{step.reason}</span>
          <ArrowRight size={14} />
        </a>
      ))}
    </section>
  );
}

function KpiRow() {
  const kpis = [
    { label: 'Revenue under negotiation', value: euros(packet.summary.revenueUnderNegotiation), delta: '+12% vs last refresh', note: 'Driven by Germany and UK renewals' },
    { label: 'Margin at risk', value: euros(packet.summary.marginAtRisk), delta: '+9% vs last refresh', note: 'EDEKA, Tesco and Carrefour lead exposure' },
    { label: 'Gap to plan', value: euros(packet.summary.gapToPlan), delta: '+EUR 1.6M vs last refresh', note: 'Expected realization trails target' },
    { label: 'High-risk buying groups', value: String(packet.summary.highRiskBuyingGroups), delta: `${packet.summary.activeBuyingGroups} active total`, note: 'Prioritize critical and high risk groups' }
  ];
  return (
    <section className="atlas-kpi-row">
      {kpis.map((kpi) => (
        <article key={kpi.label}>
          <strong>{kpi.value}</strong>
          <span>{kpi.label}</span>
          <em>{kpi.delta}</em>
          <p>{kpi.note}</p>
        </article>
      ))}
    </section>
  );
}

function NewsFinancialTape() {
  const items = [
    { label: 'Revenue in negotiation', value: euros(packet.summary.revenueUnderNegotiation), note: 'Europe active cycle' },
    { label: 'Margin at risk', value: euros(packet.summary.marginAtRisk), note: 'Highest in Germany and UK' },
    { label: 'Gap to plan', value: euros(packet.summary.gapToPlan), note: 'Realization behind target' },
    { label: 'High-risk groups', value: `${packet.summary.highRiskBuyingGroups}/${packet.summary.activeBuyingGroups}`, note: 'CNO watchlist' }
  ];

  return (
    <section className="atlas-news-tape" aria-label="Europe financial summary">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em>{item.note}</em>
        </div>
      ))}
    </section>
  );
}

function IntelligenceCard({
  title,
  whatHappened,
  whyItMatters,
  financial,
  affected,
  action,
  source,
  href,
  icon
}: {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  financial: { revenue?: number; margin?: number; volume?: number; trade?: number };
  affected: string;
  action: string;
  source: SourceMeta;
  href?: string;
  icon?: React.ReactNode;
}) {
  const content = (
    <>
      <header>
        <span>{icon}</span>
        <h3>{title}</h3>
      </header>
      <strong className="atlas-card-action">Recommended: {action}</strong>
      <FinancialImpactStrip revenue={financial.revenue} margin={financial.margin} volume={financial.volume} trade={financial.trade} />
      <dl className="atlas-card-read">
        <div><dt>Why now</dt><dd>{whyItMatters}</dd></div>
        <div><dt>Affected data</dt><dd>{affected}</dd></div>
        <div><dt>Signal</dt><dd>{whatHappened}</dd></div>
      </dl>
      <SourceTrustBar linked={!href} source={source} />
    </>
  );

  if (href) return <a className="atlas-intelligence-card" href={href}>{content}</a>;
  return <article className="atlas-intelligence-card">{content}</article>;
}

function MarketPressureGrid({ markets = packet.markets }: { markets?: Market[] }) {
  return (
    <section className="atlas-market-grid">
      {markets.map((market) => (
        <a className={`atlas-market-card ${classNameForRisk(market.pressureLevel)}`} href={`/markets/${market.id}`} key={market.id}>
          <span>{market.pressureLevel}</span>
          <h3>{market.name}</h3>
          <FinancialImpactStrip revenue={market.revenueUnderNegotiation} margin={market.marginAtRisk} volume={market.volumeExposure} trade={market.tradeSpendExposure} />
          <p>{market.topDrivers[0]}</p>
          <SourceTrustBar linked={false} source={market.source} />
        </a>
      ))}
    </section>
  );
}

function BuyingGroupTable({ groups }: { groups: BuyingGroup[] }) {
  return (
    <section className="atlas-hub-table" aria-label="Buying group exposure ranking">
      <div className="atlas-table-head">
        <span>Buying group</span>
        <span>Stage</span>
        <span>Revenue</span>
        <span>Margin risk</span>
        <span>Realization</span>
        <span>Action</span>
      </div>
      {groups.map((group) => (
        <a className="atlas-table-row" href={`/buying-groups/${group.id}`} key={group.id}>
          <span><strong>{group.name}</strong><em>{group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')}</em></span>
          <span><StatusChip status={group.negotiationStage === 'closed' ? 'approved' : group.riskLevel === 'critical' ? 'needs_validation' : 'modeled'} /></span>
          <span>{euros(group.financialExposure.revenueUnderNegotiation)}</span>
          <span>{euros(group.financialExposure.marginAtRisk)}</span>
          <span>{pct(group.financialExposure.expectedPriceRealization)} / target {pct(group.financialExposure.targetPriceRealization)}</span>
          <span>Open intelligence <ArrowRight size={13} /></span>
        </a>
      ))}
    </section>
  );
}

function SignalCards({ signals }: { signals: ExternalSignal[] }) {
  return (
    <section className="atlas-card-grid">
      {signals.map((signal) => {
        const firstGroup = signal.affectedBuyingGroups[0];
        return (
          <IntelligenceCard
            key={signal.id}
            icon={<Newspaper size={16} />}
            title={signal.title}
            whatHappened={signal.summary}
            whyItMatters={signal.negotiationImplication}
            financial={{ revenue: signal.estimatedRevenueImpact, margin: signal.estimatedMarginImpact }}
            affected={`${signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')} / ${signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(', ')}`}
            action={signal.recommendedAction}
            source={signal.source}
            href={firstGroup ? `/buying-groups/${firstGroup}` : `/signals?signal=${signal.id}`}
          />
        );
      })}
    </section>
  );
}

function CompetitorCards({ moves }: { moves: CompetitorMove[] }) {
  return (
    <section className="atlas-card-grid">
      {moves.map((move) => {
        const firstGroup = move.affectedBuyingGroups[0];
        return (
          <IntelligenceCard
            key={move.id}
            icon={<TrendingUp size={16} />}
            title={`${move.competitor}: ${move.title}`}
            whatHappened={move.summary}
            whyItMatters={`${move.possibleBuyerLeverage} ${move.pepsicoImplication}`}
            financial={{ revenue: move.estimatedRevenueImpact, margin: move.estimatedMarginImpact }}
            affected={`${move.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')} / ${move.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(', ')}`}
            action={move.recommendedAction}
            source={move.source}
            href={firstGroup ? `/buying-groups/${firstGroup}` : `/competitors?move=${move.id}`}
          />
        );
      })}
    </section>
  );
}

function DocumentLibrary({ documents, buyingGroupId }: { documents: DocumentArtifact[]; buyingGroupId?: string }) {
  const retrieval = buyingGroupId ? buildRetrievalMessage(buyingGroupId) : null;
  return (
    <section className="atlas-document-section">
      {retrieval ? (
        <article className={`atlas-retrieval-note ${retrieval.noteType}`}>
          <FileSearch size={18} />
          <div>
            <strong>{retrieval.noteType.replaceAll('_', ' ')}</strong>
            <p>{retrieval.message}</p>
          </div>
        </article>
      ) : null}
      <section className="atlas-card-grid">
        {documents.map((document) => (
          <article className="atlas-document-card" key={document.id}>
            <header>
              <BookOpen size={16} />
              <span>{document.documentType.replaceAll('_', ' ')}</span>
              <StatusChip status={document.status} />
            </header>
            <h3>{document.title}</h3>
            <p>{document.summary}</p>
            <div className="atlas-document-meta">
              <span>{document.reusable ? 'Reusable source' : 'Draft-only source'}</span>
              <span>{document.lastUsed ? `Last used ${document.lastUsed}` : 'Not used yet'}</span>
              {document.supersededBy ? <span>Superseded by {document.supersededBy}</span> : null}
            </div>
            <div className="atlas-document-actions">
              <a href={hrefForDocumentArtifact(document)} rel="noreferrer" target="_blank">Open document <ArrowRight size={13} /></a>
              {document.buyingGroupId ? <a href={`/buying-groups/${document.buyingGroupId}?view=memory`}>Buyer history</a> : null}
              {document.marketId ? <a href={`/markets/${document.marketId}`}>Market</a> : null}
            </div>
            <SourceTrustBar source={document.source} />
          </article>
        ))}
      </section>
    </section>
  );
}

function hrefForDocumentArtifact(document: DocumentArtifact) {
  const scope = `${document.buyingGroupId ? `&buyingGroupId=${encodeURIComponent(document.buyingGroupId)}` : ''}${document.marketId ? `&marketId=${encodeURIComponent(document.marketId)}` : ''}`;
  return `/generated-views?prompt=${encodeURIComponent(`Retrieve ${document.title}`)}&mode=retrieved&documentId=${encodeURIComponent(document.id)}${scope}`;
}

function hrefForStoredGeneratedView(view: StoredGeneratedView) {
  return `/generated-views?prompt=${encodeURIComponent(view.prompt)}&mode=draft&editable=1&storedViewId=${encodeURIComponent(view.id)}${view.buyingGroupId ? `&buyingGroupId=${view.buyingGroupId}` : ''}${view.marketId ? `&marketId=${view.marketId}` : ''}`;
}

function UploadSourceTray({ buyingGroup }: { buyingGroup: BuyingGroup }) {
  const [drafts, setDrafts] = useState<Array<{ id: string; name: string; note: string; type: string }>>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('prep_document');
  const [note, setNote] = useState('');

  function addDraft() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDrafts((current) => [
      {
        id: `uploaded-${Date.now()}`,
        name: trimmed,
        note: note.trim() || 'Placeholder extraction pending. User-added source memory only.',
        type
      },
      ...current
    ]);
    setName('');
    setNote('');
  }

  return (
    <section className="atlas-upload-source-tray">
      <header>
        <span>Attach source memory</span>
        <h3>Add prep decks, debriefs or supporting files to {buyingGroup.name}.</h3>
        <p>Prototype upload stores metadata and notes only. Added files are labeled as user-entered source memory.</p>
      </header>
      <div className="atlas-upload-fields">
        <label>
          <span>Document name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Carrefour Q3 prep deck.pdf" />
        </label>
        <label>
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="prep_document">Prep document</option>
            <option value="debrief">Debrief</option>
            <option value="source_doc">Source document</option>
            <option value="strategy_file">Strategy file</option>
          </select>
        </label>
        <label className="wide">
          <span>Notes or excerpt</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Key assumption, pasted excerpt, or why this matters..." />
        </label>
        <button type="button" onClick={addDraft}>Add to buyer memory</button>
      </div>
      <div className="atlas-upload-drafts">
        {drafts.length ? drafts.map((draft) => (
          <article key={draft.id}>
            <div>
              <strong>{draft.name}</strong>
              <span>{draft.type.replaceAll('_', ' ')} / user-entered source</span>
              <p>{draft.note}</p>
            </div>
            <button type="button" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}>Remove</button>
          </article>
        )) : (
          <p>No added source documents in this browser session yet.</p>
        )}
      </div>
    </section>
  );
}

function BuyerProfileUpdatePanel({
  buyingGroup,
  onAddUpdate,
  updates
}: {
  buyingGroup: BuyingGroup;
  onAddUpdate: (update: BuyerProfileDocumentUpdate) => void;
  updates: BuyerProfileDocumentUpdate[];
}) {
  const [fileName, setFileName] = useState('');
  const [documentType, setDocumentType] = useState('prep_document');
  const [impactType, setImpactType] = useState('buyer_counter');
  const [note, setNote] = useState('');
  const [buyerAskDelta, setBuyerAskDelta] = useState(0.2);
  const [expectedRealizationDelta, setExpectedRealizationDelta] = useState(0);
  const [marginAtRiskDelta, setMarginAtRiskDelta] = useState(0.8);
  const [tradeSpendDelta, setTradeSpendDelta] = useState(0.4);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<BuyerProfileDocumentUpdate | null>(null);
  const latestConfirmed = updates[0];
  const impactFields: Array<{
    label: string;
    setter: (next: number) => void;
    unit: string;
    value: number;
  }> = [
    { label: 'Buyer ask', value: buyerAskDelta, setter: setBuyerAskDelta, unit: 'pts' },
    { label: 'Expected realization', value: expectedRealizationDelta, setter: setExpectedRealizationDelta, unit: 'pts' },
    { label: 'Margin at risk', value: marginAtRiskDelta, setter: setMarginAtRiskDelta, unit: 'EUR M' },
    { label: 'Trade spend', value: tradeSpendDelta, setter: setTradeSpendDelta, unit: 'EUR M' }
  ];

  function applyPreset(nextImpactType: string) {
    setImpactType(nextImpactType);
    setPendingUpdate(null);
    if (nextImpactType === 'buyer_counter') {
      setBuyerAskDelta(0.2);
      setExpectedRealizationDelta(0);
      setMarginAtRiskDelta(0.8);
      setTradeSpendDelta(0.4);
    }
    if (nextImpactType === 'finance_update') {
      setBuyerAskDelta(0);
      setExpectedRealizationDelta(0.2);
      setMarginAtRiskDelta(-0.6);
      setTradeSpendDelta(0);
    }
    if (nextImpactType === 'promo_pressure') {
      setBuyerAskDelta(0.1);
      setExpectedRealizationDelta(-0.1);
      setMarginAtRiskDelta(0.5);
      setTradeSpendDelta(0.9);
    }
    if (nextImpactType === 'market_offset') {
      setBuyerAskDelta(0);
      setExpectedRealizationDelta(0.3);
      setMarginAtRiskDelta(-0.9);
      setTradeSpendDelta(-0.2);
    }
  }

  function buildDraftUpdate(): BuyerProfileDocumentUpdate | null {
    const trimmedName = fileName.trim();
    if (!trimmedName) return null;
    const draft: BuyerProfileDocumentUpdate = {
      id: `buyer-profile-update-${Date.now()}`,
      fileName: trimmedName,
      documentType,
      impactType,
      note: note.trim() || 'Supporting document impact entered by user.',
      createdAt: new Date().toISOString(),
      buyerAskDelta,
      expectedRealizationDelta,
      marginAtRiskDelta: marginAtRiskDelta * 1000000,
      tradeSpendDelta: tradeSpendDelta * 1000000
    };
    return {
      ...draft,
      riskDelta: profileRiskDelta(draft),
      confidenceDelta: profileConfidenceDelta(draft),
      profileImpactSummary: profileImpactSummary(draft)
    };
  }

  function previewUpdate() {
    const draft = buildDraftUpdate();
    if (!draft) return;
    setPendingUpdate(draft);
  }

  function confirmUpdate() {
    if (!pendingUpdate) return;
    onAddUpdate({
      ...pendingUpdate,
      confirmedAt: new Date().toISOString()
    });
    setFileName('');
    setNote('');
    setPendingUpdate(null);
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="atlas-buyer-profile-update-compact">
        <button type="button" onClick={() => setIsOpen(true)}>Add update</button>
        {latestConfirmed ? (
          <span>Latest confirmed: {latestConfirmed.fileName} changed profile read {new Date(latestConfirmed.confirmedAt ?? latestConfirmed.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</span>
        ) : null}
      </div>
    );
  }

  return (
    <section className="atlas-buyer-profile-update open" id="group-update">
      <header>
        <div>
          <span>Add update</span>
          <h3>Debrief or supporting document</h3>
        </div>
        <button type="button" onClick={() => setIsOpen(false)}>Close form</button>
      </header>

      <div className="atlas-profile-update-form">
        <label className="file">
          <span>Supporting document</span>
          <input type="file" onChange={(event) => { setFileName(event.target.files?.[0]?.name ?? ''); setPendingUpdate(null); }} />
        </label>
        <label>
          <span>Or document name</span>
          <input value={fileName} onChange={(event) => { setFileName(event.target.value); setPendingUpdate(null); }} placeholder={`${buyingGroup.name} latest prep update.pdf`} />
        </label>
        <label>
          <span>Document type</span>
          <select value={documentType} onChange={(event) => { setDocumentType(event.target.value); setPendingUpdate(null); }}>
            <option value="prep_document">Prep document</option>
            <option value="debrief">Debrief</option>
            <option value="finance_update">Finance update</option>
            <option value="customer_note">Customer note</option>
            <option value="market_source">Market source</option>
          </select>
        </label>
        <label>
          <span>Impact pattern</span>
          <select value={impactType} onChange={(event) => applyPreset(event.target.value)}>
            <option value="buyer_counter">Buyer counter increased pressure</option>
            <option value="finance_update">Finance improved the read</option>
            <option value="promo_pressure">Promo pressure increased</option>
            <option value="market_offset">Market offset found</option>
          </select>
        </label>
        <label className="wide">
          <span>What changed?</span>
          <input value={note} onChange={(event) => { setNote(event.target.value); setPendingUpdate(null); }} placeholder="Example: latest debrief says buyer moved ask up and requires Q4 promo support." />
        </label>
      </div>

      <div className="atlas-profile-impact-editor" aria-label="Profile number impacts">
        {impactFields.map((field) => (
          <label key={field.label}>
            <span>{field.label}</span>
            <div>
              <input
                type="number"
                step="0.1"
                value={field.value}
                onChange={(event) => { field.setter(Number(event.target.value)); setPendingUpdate(null); }}
              />
              <em>{field.unit}</em>
            </div>
          </label>
        ))}
        <button type="button" onClick={previewUpdate}>Preview impact</button>
      </div>

      {pendingUpdate ? (
        <article className="atlas-profile-impact-preview">
          <header>
            <div>
              <span>Pending buyer-profile change</span>
              <h4>{pendingUpdate.fileName}</h4>
            </div>
            <strong>{pendingUpdate.riskDelta === 'increased' ? 'Risk up' : pendingUpdate.riskDelta === 'reduced' ? 'Risk down' : 'Risk flat'}</strong>
          </header>
          <p>{pendingUpdate.profileImpactSummary}</p>
          <dl>
            <div>
              <dt>Buyer ask</dt>
              <dd>{signedPointLabel(pendingUpdate.buyerAskDelta)}</dd>
            </div>
            <div>
              <dt>PepsiCo position</dt>
              <dd>{signedPointLabel(pendingUpdate.expectedRealizationDelta)}</dd>
            </div>
            <div>
              <dt>Margin at risk</dt>
              <dd>{signedEuroLabel(pendingUpdate.marginAtRiskDelta)}</dd>
            </div>
            <div>
              <dt>Trade spend</dt>
              <dd>{signedEuroLabel(pendingUpdate.tradeSpendDelta)}</dd>
            </div>
          </dl>
          <div className="atlas-profile-impact-actions">
            <button type="button" onClick={confirmUpdate}>Confirm and update profile</button>
            <button type="button" onClick={() => setPendingUpdate(null)}>Dismiss preview</button>
          </div>
        </article>
      ) : null}
    </section>
  );
}

function ConfirmedProfileImpactStrip({ updates }: { updates: BuyerProfileDocumentUpdate[] }) {
  const latest = updates[0];
  if (!latest) return null;
  return (
    <section className="atlas-confirmed-profile-impact" aria-label="Confirmed buyer profile impact">
      <div>
        <span>Working read updated</span>
        <strong>{latest.profileImpactSummary ?? latest.note}</strong>
      </div>
      <dl>
        <div>
          <dt>Buyer ask</dt>
          <dd>{signedPointLabel(latest.buyerAskDelta)}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{signedPointLabel(latest.expectedRealizationDelta)}</dd>
        </div>
        <div>
          <dt>Margin</dt>
          <dd>{signedEuroLabel(latest.marginAtRiskDelta)}</dd>
        </div>
      </dl>
    </section>
  );
}

type TimelineMemoryEntry = {
  date: string;
  eventType: string;
  financialImpact?: TimelineEvent['financialImpact'];
  id: string;
  kind: 'event' | 'document' | 'update' | 'generated';
  openHref?: string;
  source?: SourceMeta;
  status: AtlasStatus;
  summary: string;
  title: string;
};

function yearForTimelineDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date.slice(0, 4) || 'Unknown';
  return String(parsed.getFullYear());
}

function buildTimelineMemoryEntries({
  documents = [],
  events,
  generatedViews = [],
  updates = []
}: {
  documents?: DocumentArtifact[];
  events: TimelineEvent[];
  generatedViews?: StoredGeneratedView[];
  updates?: BuyerProfileDocumentUpdate[];
}): TimelineMemoryEntry[] {
  const documentEntries: TimelineMemoryEntry[] = documents.map((document) => ({
    date: document.source.sourceDate || `${document.year}-01-01`,
    eventType: `Supporting document / ${document.documentType.replaceAll('_', ' ')}`,
    id: `doc-${document.id}`,
    kind: 'document',
    openHref: hrefForDocumentArtifact(document),
    source: document.source,
    status: document.status,
    summary: `${document.summary} Uploaded ${document.source.sourceDate}.`,
    title: document.title
  }));
  const updateEntries: TimelineMemoryEntry[] = updates.map((update) => ({
    date: update.confirmedAt ?? update.createdAt,
    eventType: `Confirmed profile update / ${update.documentType.replaceAll('_', ' ')}`,
    financialImpact: {
      marginImpact: update.marginAtRiskDelta,
      tradeSpendImpact: update.tradeSpendDelta
    },
    id: `update-${update.id}`,
    kind: 'update',
    source: documents[0]?.source ? buildUserEnteredSource(update, documents[0].source) : undefined,
    status: 'modeled',
    summary: update.profileImpactSummary ?? update.note,
    title: update.fileName
  }));
  const generatedEntries: TimelineMemoryEntry[] = generatedViews
    .filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached')
    .map((view) => ({
      date: view.savedToProfileAt ?? view.updatedAt,
      eventType: `${view.mode.replaceAll('_', ' ')} / attached generated view`,
      id: `generated-${view.id}`,
      kind: 'generated',
      openHref: hrefForStoredGeneratedView(view),
      source: buildGeneratedViewSource(view, documents[0]?.source ?? events[0]?.source ?? atlasIntelligenceSeed.documents[0].source),
      status: 'modeled',
      summary: view.summary || view.sourceDecision || `Generated from prompt: ${view.prompt}`,
      title: view.title
    }));
  const eventEntries: TimelineMemoryEntry[] = events.map((event) => ({
    date: event.timestamp,
    eventType: event.eventType.replaceAll('_', ' '),
    financialImpact: event.financialImpact,
    id: event.id,
    kind: 'event',
    source: event.source,
    status: event.status,
    summary: event.summary,
    title: event.title
  }));

  return [...updateEntries, ...generatedEntries, ...eventEntries, ...documentEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function TimelineFeed({
  documents,
  events,
  generatedViews,
  updates
}: {
  documents?: DocumentArtifact[];
  events: TimelineEvent[];
  generatedViews?: StoredGeneratedView[];
  updates?: BuyerProfileDocumentUpdate[];
}) {
  const entries = buildTimelineMemoryEntries({ documents, events, generatedViews, updates });
  const currentYear = '2026';
  const grouped = entries.reduce<Record<string, TimelineMemoryEntry[]>>((acc, entry) => {
    const year = yearForTimelineDate(entry.date);
    acc[year] = [...(acc[year] ?? []), entry];
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const hasCurrentYear = years.includes(currentYear);

  return (
    <section className="atlas-timeline-feed">
      {years.map((year, index) => (
        <details className="atlas-timeline-year" key={year} open={year === currentYear || (!hasCurrentYear && index === 0)}>
          <summary>
            <span>{year}</span>
            <em>{grouped[year].length} {grouped[year].length === 1 ? 'entry' : 'entries'}</em>
          </summary>
          <div className="atlas-timeline-year-items">
            {grouped[year].map((entry) => (
              <article className={`timeline-${entry.kind}`} key={entry.id}>
                <time>{new Date(entry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
                <div>
                  <span className="atlas-timeline-kind">{entry.eventType}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  {entry.financialImpact ? (
                    <FinancialImpactStrip
                      revenue={entry.financialImpact.revenueImpact}
                      margin={entry.financialImpact.marginImpact}
                      trade={entry.financialImpact.tradeSpendImpact}
                    />
                  ) : null}
                  {entry.source ? <SourceTrustBar source={entry.source} /> : null}
                  {entry.openHref ? <a className="atlas-timeline-open-link" href={entry.openHref} {...generatedOutputLinkProps(entry.openHref)}>Open view <ArrowRight size={13} /></a> : null}
                </div>
              </article>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}

type SupportingDocumentQuickEntry = {
  date: string;
  href: string;
  id: string;
  source?: SourceMeta;
  status: AtlasStatus;
  summary?: string;
  title: string;
  type: string;
};

function SupportingDocumentLedger({
  buyingGroupId,
  documents,
  generatedViews,
  updates
}: {
  buyingGroupId: string;
  documents: DocumentArtifact[];
  generatedViews?: StoredGeneratedView[];
  updates: BuyerProfileDocumentUpdate[];
}) {
  const entries: SupportingDocumentQuickEntry[] = [
    ...documents.map((document) => ({
      date: document.source.sourceDate || `${document.year}-01-01`,
      href: document.source.url ?? `/documents?buyingGroup=${buyingGroupId}&document=${document.id}`,
      id: document.id,
      source: document.source,
      status: document.status,
      summary: document.summary,
      title: document.title,
      type: document.documentType.replaceAll('_', ' ')
    })),
    ...updates.map((update) => ({
      date: update.createdAt,
      href: `/documents?buyingGroup=${buyingGroupId}&document=${update.id}`,
      id: update.id,
      source: documents[0]?.source ? buildUserEnteredSource(update, documents[0].source) : undefined,
      status: 'modeled' as AtlasStatus,
      summary: update.profileImpactSummary ?? update.note,
      title: update.fileName,
      type: update.documentType.replaceAll('_', ' ')
    })),
    ...(generatedViews ?? [])
      .filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached')
      .map((view) => ({
      date: view.savedToProfileAt ?? view.updatedAt,
      href: hrefForStoredGeneratedView(view),
      id: view.id,
      source: buildGeneratedViewSource(view, documents[0]?.source ?? atlasIntelligenceSeed.documents[0].source),
      status: 'modeled' as AtlasStatus,
      summary: view.summary || view.sourceDecision,
      title: view.title,
      type: view.artifactType === 'negotiation_plan' ? 'strategy plan' : 'generated view'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="atlas-supporting-document-ledger">
      {entries.map((entry) => (
        <a href={entry.href} key={entry.id} {...generatedOutputLinkProps(entry.href)}>
          <div>
            <h3>{entry.title}</h3>
            <p>{entry.type} / {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            {entry.summary ? <em>{entry.summary}</em> : null}
            {entry.source ? <SourceTrustMini source={entry.source} /> : null}
          </div>
        </a>
      ))}
    </section>
  );
}

function CompactSourceLine({ source }: { source: SourceMeta }) {
  return (
    <p className="atlas-compact-source">
      <ShieldCheck size={13} />
      {source.url ? (
        <a href={source.url} rel="noreferrer" target="_blank">{source.sourceName}</a>
      ) : (
        <span>{source.sourceName}</span>
      )}
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function CompactSourceText({ source }: { source: SourceMeta }) {
  return (
    <p className="atlas-compact-source">
      <ShieldCheck size={13} />
      <span>{source.sourceName}</span>
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function CompactImpactLine({
  revenue,
  margin,
  volume,
  trade
}: {
  revenue?: number;
  margin?: number;
  volume?: number;
  trade?: number;
}) {
  const values = [
    Number.isFinite(revenue) ? `Revenue ${euros(revenue ?? 0)}` : null,
    Number.isFinite(margin) ? `Margin ${euros(margin ?? 0)}` : null,
    Number.isFinite(volume) ? `Volume ${euros(volume ?? 0)}` : null,
    Number.isFinite(trade) ? `Trade ${euros(trade ?? 0)}` : null
  ].filter(Boolean);

  return <p className="atlas-compact-impact">{values.length ? values.join(' / ') : 'Financial impact not modeled'}</p>;
}

function SourceTrustMini({ source }: { source: SourceMeta }) {
  return (
    <p className="atlas-source-mini">
      <ShieldCheck size={12} />
      {source.url ? (
        <a href={source.url} rel="noreferrer" target="_blank">{source.sourceName}</a>
      ) : (
        <span>{source.sourceName}</span>
      )}
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function OverviewCallout({
  action,
  detail,
  href,
  label,
  tone,
  value
}: {
  action: string;
  detail: string;
  href: string;
  label: string;
  tone: 'risk' | 'watch' | 'source' | 'signal';
  value: string;
}) {
  return (
    <a className={`atlas-overview-callout ${tone}`} href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
      <em>{action}</em>
    </a>
  );
}

function PriorityQueue() {
  return (
    <section className="atlas-priority-queue" aria-label="Highest priority CNO watchouts">
      <header>
        <span>Priority queue</span>
        <strong>Act on these first</strong>
      </header>
      {packet.cnoWatchlist.slice(0, 3).map((item, index) => (
        <a href={item.href} key={item.id} {...generatedOutputLinkProps(item.href)}>
          <b>{index + 1}</b>
          <div>
            <span>{item.itemType.replaceAll('_', ' ')}</span>
            <h3>{item.title}</h3>
            <p>{item.whyItMatters}</p>
            <SourceTrustMini source={item.source} />
          </div>
          <aside>
            <strong>{euros(item.financialImplication.marginAtRisk ?? item.financialImplication.revenueAtRisk ?? 0)}</strong>
            <em>margin risk</em>
            <small>{item.recommendedAction}</small>
          </aside>
        </a>
      ))}
    </section>
  );
}

function MarketExposureVisual() {
  const maxMargin = Math.max(...packet.highPressureMarkets.map((market) => market.marginAtRisk));

  return (
    <section className="atlas-exposure-visual" aria-label="Highest market margin exposure">
      <header>
        <span>Market exposure</span>
        <strong>Margin at risk by pressure market</strong>
      </header>
      {packet.highPressureMarkets.slice(0, 4).map((market) => (
        <a href={`/markets/${market.id}`} key={market.id}>
          <div>
            <span>{market.name}</span>
            <strong>{euros(market.marginAtRisk)}</strong>
          </div>
          <i aria-hidden="true"><b style={{ width: `${Math.max(12, Math.round((market.marginAtRisk / maxMargin) * 100))}%` }} /></i>
          <em>{market.pressureLevel} pressure</em>
        </a>
      ))}
    </section>
  );
}

function IntelligenceSnapshot() {
  const latestSignal = packet.signals[0];
  const competitorMove = packet.competitorMoves[0];
  const scenario = packet.scenarioModels[0];
  const scenarioGroup = getBuyingGroup(scenario.buyingGroupId)?.name ?? scenario.buyingGroupId;
  const scenarioMarket = getMarket(scenario.marketId)?.name ?? scenario.marketId;

  const cards = [
    {
      label: 'What changed',
      title: latestSignal.title,
      body: latestSignal.negotiationImplication,
      value: euros(latestSignal.estimatedMarginImpact ?? 0),
      meta: 'estimated margin implication',
      href: `/signals?signal=${latestSignal.id}`,
      action: latestSignal.recommendedAction,
      source: latestSignal.source
    },
    {
      label: 'Competitor leverage',
      title: `${competitorMove.competitor}: ${competitorMove.title}`,
      body: competitorMove.possibleBuyerLeverage,
      value: euros(competitorMove.estimatedMarginImpact ?? 0),
      meta: 'estimated margin pressure',
      href: `/competitors?move=${competitorMove.id}`,
      action: competitorMove.recommendedAction,
      source: competitorMove.source
    },
    {
      label: 'Scenario prompt',
      title: `${scenarioGroup} / ${scenarioMarket}`,
      body: scenario.outputs.recommendation,
      value: euros(scenario.outputs.riskAdjustedValue),
      meta: `${pct(scenario.inputs.expectedRealizationPercent)} expected realization`,
      href: `/scenario-models?scenario=${scenario.id}`,
      action: 'Open scenario model',
      source: atlasIntelligenceSeed.documents.find((document) => scenario.sourceIds.includes(document.id))?.source ?? packet.topExposureBuyingGroups[0].source
    }
  ];

  return (
    <section className="atlas-intelligence-snapshot" aria-label="What changed and recommended actions">
      {cards.map((card) => (
        <a href={card.href} key={card.label} {...generatedOutputLinkProps(card.href)}>
          <span>{card.label}</span>
          <h3>{card.title}</h3>
          <strong>{card.value}</strong>
          <em>{card.meta}</em>
          <p>{card.body}</p>
          <SourceTrustMini source={card.source} />
          <small>{card.action}</small>
        </a>
      ))}
    </section>
  );
}

function NewsStoryRow({
  eyebrow,
  title,
  body,
  impact,
  source,
  href,
  action,
  status
}: {
  eyebrow: string;
  title: string;
  body: string;
  impact: React.ReactNode;
  source: SourceMeta;
  href: string;
  action: string;
  status?: AtlasStatus;
}) {
  return (
    <a className="atlas-news-row" href={href}>
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <strong className="atlas-news-action">Recommended: {action}</strong>
        <p>{body}</p>
        <CompactSourceLine source={source} />
      </div>
      <aside>
        {status ? <StatusChip status={status} /> : null}
        {impact}
      </aside>
    </a>
  );
}

function MonitorTabs({ initialTab = 'watchlist' }: { initialTab?: string }) {
  const staleDocuments = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const tabs = [
    {
      id: 'watchlist',
      label: 'CNO watchlist',
      count: packet.cnoWatchlist.length
    },
    {
      id: 'markets',
      label: 'Markets',
      count: packet.highPressureMarkets.length
    },
    {
      id: 'signals',
      label: 'Signals',
      count: packet.signals.length
    },
    {
      id: 'competitors',
      label: 'Competitors',
      count: packet.competitorMoves.length
    },
    {
      id: 'sources',
      label: 'Sources',
      count: staleDocuments.length
    }
  ];
  const activeTab = tabs.some((tab) => tab.id === initialTab) ? initialTab : 'watchlist';

  return (
    <section className="atlas-monitor-desk">
      <header>
        <div>
          <span>Monitor</span>
          <h2>What needs attention now</h2>
        </div>
        <a href="/timeline">Open full intelligence memory <ArrowRight size={14} /></a>
      </header>
      <nav aria-label="Monitor feed filters">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.id === 'watchlist' ? '/' : `/?monitor=${tab.id}`}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
            <span>{tab.count}</span>
          </a>
        ))}
      </nav>
      <div className="atlas-monitor-feed">
        {activeTab === 'watchlist' ? packet.cnoWatchlist.slice(0, 6).map((item) => (
          <NewsStoryRow
            key={item.id}
            eyebrow={item.itemType.replaceAll('_', ' ')}
            title={item.title}
            body={item.whyItMatters}
            impact={(
              <CompactImpactLine
                revenue={item.financialImplication.revenueAtRisk}
                margin={item.financialImplication.marginAtRisk}
                volume={item.financialImplication.volumeExposure}
                trade={item.financialImplication.tradeSpendExposure}
              />
            )}
            source={item.source}
            href={item.href}
            action={item.recommendedAction}
            status={item.status}
          />
        )) : null}
        {activeTab === 'markets' ? packet.highPressureMarkets.map((market) => (
          <NewsStoryRow
            key={market.id}
            eyebrow={`${market.pressureLevel} pressure market`}
            title={`${market.name}: ${market.topDrivers[0]}`}
            body={`${market.activeBuyingGroups.length} buying groups in scope. ${market.topDrivers.slice(1).join(' ')}`}
            impact={<CompactImpactLine revenue={market.revenueUnderNegotiation} margin={market.marginAtRisk} volume={market.volumeExposure} trade={market.tradeSpendExposure} />}
            source={market.source}
            href={`/markets/${market.id}`}
            action="Open market read"
            status={market.pressureLevel === 'critical' || market.pressureLevel === 'high' ? 'needs_validation' : 'modeled'}
          />
        )) : null}
        {activeTab === 'signals' ? packet.signals.slice(0, 6).map((signal) => (
          <NewsStoryRow
            key={signal.id}
            eyebrow={signal.signalType.replaceAll('_', ' ')}
            title={signal.title}
            body={`${signal.summary} ${signal.negotiationImplication}`}
            impact={<CompactImpactLine revenue={signal.estimatedRevenueImpact} margin={signal.estimatedMarginImpact} />}
            source={signal.source}
            href={`/signals?signal=${signal.id}`}
            action={signal.recommendedAction}
            status={signal.source.status}
          />
        )) : null}
        {activeTab === 'competitors' ? packet.competitorMoves.slice(0, 6).map((move) => (
          <NewsStoryRow
            key={move.id}
            eyebrow={`${move.competitor} / ${move.moveType.replaceAll('_', ' ')}`}
            title={move.title}
            body={`${move.summary} ${move.possibleBuyerLeverage}`}
            impact={<CompactImpactLine revenue={move.estimatedRevenueImpact} margin={move.estimatedMarginImpact} />}
            source={move.source}
            href={`/competitors?move=${move.id}`}
            action={move.recommendedAction}
            status={move.source.status}
          />
        )) : null}
        {activeTab === 'sources' ? staleDocuments.slice(0, 6).map((document) => (
          <NewsStoryRow
            key={document.id}
            eyebrow={document.documentType.replaceAll('_', ' ')}
            title={document.title}
            body={document.summary}
            impact={<p className="atlas-compact-impact">{document.reusable ? 'Reusable after validation' : 'Draft-only source'}</p>}
            source={document.source}
            href="/documents"
            action={document.status === 'missing' ? 'Upload or generate draft' : 'Validate before use'}
            status={document.status}
          />
        )) : null}
      </div>
    </section>
  );
}

function TodaysBriefingPanel() {
  const topGroups = packet.topExposureBuyingGroups.slice(0, 3).map((group) => group.name).join(', ');
  const topMarkets = packet.highPressureMarkets.slice(0, 3).map((market) => market.name).join(', ');

  return (
    <section className="atlas-briefing-panel">
      <div className="atlas-briefing-copy">
        <span>Today’s Intelligence Brief</span>
        <h2>Europe risk is concentrated in three markets.</h2>
        <p>{topMarkets} carry the near-term negotiation risk. Watch {topGroups} first, then validate source readiness before using generated outputs.</p>
        <MarketExposureVisual />
      </div>
      <PriorityQueue />
    </section>
  );
}

function OverviewAttentionBrief() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const latestSignal = packet.signals[0];
  const staleSourceCount = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing').length;

  const attentionItems = [
    {
      action: 'Open buyer',
      href: `/buying-groups/${topGroup.id}`,
      label: 'Buyer risk',
      meta: `${pct(topGroup.financialExposure.expectedPriceRealization)} realized / ${pct(topGroup.financialExposure.targetPriceRealization)} target`,
      movement: '+EUR 1.1M vs prior read',
      title: topGroup.name,
      tone: 'risk',
      value: euros(topGroup.financialExposure.marginAtRisk)
    },
    {
      action: 'Compare markets',
      href: `/markets/${topMarket.id}`,
      label: 'Market pressure',
      meta: topMarket.topDrivers.slice(0, 2).join(' / '),
      movement: '+9% pressure index',
      title: topMarket.name,
      tone: 'watch',
      value: euros(topMarket.marginAtRisk)
    },
    {
      action: 'Read signal',
      href: '/?ask=What changed across Europe this week?&view=signal-impact',
      label: 'World signal',
      meta: latestSignal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).slice(0, 2).join(' / '),
      movement: latestSignal.source.sourceDate,
      title: latestSignal.title,
      tone: 'signal',
      value: euros(latestSignal.estimatedMarginImpact ?? latestSignal.estimatedRevenueImpact ?? 0)
    },
    {
      action: 'Review sources',
      href: '/documents?view=source-readiness',
      label: 'Source watchout',
      meta: 'Stale / needs validation / missing',
      movement: 'Blocks official output',
      title: 'Source readiness',
      tone: 'source',
      value: `${staleSourceCount}`
    }
  ];

  return (
    <section className="atlas-overview-attention" aria-label="What needs attention first">
      <header>
        <h1>{topGroup.name} has {euros(topGroup.financialExposure.marginAtRisk)} margin at risk; {topMarket.name} is the pressure market.</h1>
        <a href={`/buying-groups/${topGroup.id}`}>Open {topGroup.name} <ArrowRight size={14} /></a>
      </header>
      <div>
        {attentionItems.map((item) => (
          <a className={item.tone} href={item.href} key={item.label}>
            <strong>{item.value}</strong>
            <h2>{item.title}</h2>
            <p>{item.meta}</p>
            <em>{item.movement}</em>
            <b>{item.action}</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function PepsiCoImpactAttention() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const realizationGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;
  const marketShare = topMarket.marginAtRisk / packet.summary.marginAtRisk;
  const buyerShare = topGroup.financialExposure.marginAtRisk / packet.summary.marginAtRisk;

  const items = [
    {
      action: 'Open exposure',
      href: '#exposure',
      label: 'Margin at risk',
      meta: '+9% vs last refresh',
      tone: 'risk',
      title: 'Europe active cycle',
      value: euros(packet.summary.marginAtRisk)
    },
    {
      action: 'Open buyer',
      href: `/buying-groups/${topGroup.id}?view=financials`,
      label: 'Top buyer',
      meta: `${pct(realizationGap)} realization gap`,
      tone: 'risk',
      title: topGroup.name,
      value: euros(topGroup.financialExposure.marginAtRisk)
    },
    {
      action: 'Open market',
      href: `/markets/${topMarket.id}`,
      label: 'Top market',
      meta: `${pct(marketShare * 100)} of margin risk`,
      tone: 'watch',
      title: topMarket.name,
      value: euros(topMarket.marginAtRisk)
    },
    {
      action: 'Model move',
      href: `/scenario-models?buyingGroup=${topGroup.id}`,
      label: 'Gap to plan',
      meta: `${pct(buyerShare * 100)} from ${topGroup.name}`,
      tone: 'signal',
      title: 'Scenario needed',
      value: euros(packet.summary.gapToPlan)
    }
  ];

  return (
    <section className="atlas-overview-attention atlas-impact-attention" aria-label="PepsiCo financial impact">
      <header>
        <h1>{euros(packet.summary.marginAtRisk)} margin at risk; {topGroup.name} and {topMarket.name} drive the read.</h1>
        <a href={`/scenario-models?buyingGroup=${topGroup.id}`}>Model {topGroup.name} <ArrowRight size={14} /></a>
      </header>
      <div>
        {items.map((item) => (
          <a className={item.tone} href={item.href} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <h2>{item.title}</h2>
            <p>{item.meta}</p>
            <b>{item.action}</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function FinancialExposureVisual() {
  const maxMargin = Math.max(...packet.topExposureBuyingGroups.map((group) => group.financialExposure.marginAtRisk));
  const maxMarket = Math.max(...packet.highPressureMarkets.map((market) => market.marginAtRisk));

  return (
    <section className="atlas-impact-visual-grid" id="exposure">
      <article className="atlas-chart-card atlas-impact-chart">
        <SectionTitle title="Buyer margin exposure" />
        {packet.topExposureBuyingGroups.slice(0, 7).map((group) => (
          <a className="atlas-impact-bar-row" href={`/buying-groups/${group.id}?view=financials`} key={group.id}>
            <span>{group.name}</span>
            <i><b style={{ width: `${Math.max(10, Math.round((group.financialExposure.marginAtRisk / maxMargin) * 100))}%` }} /></i>
            <strong>{euros(group.financialExposure.marginAtRisk)}</strong>
            <em>{pct(group.financialExposure.expectedPriceRealization)} / {pct(group.financialExposure.targetPriceRealization)}</em>
          </a>
        ))}
      </article>
      <article className="atlas-chart-card atlas-impact-chart">
        <SectionTitle title="Market margin pressure" />
        {packet.highPressureMarkets.slice(0, 6).map((market) => (
          <a className="atlas-impact-bar-row" href={`/markets/${market.id}`} key={market.id}>
            <span>{market.name}</span>
            <i><b style={{ width: `${Math.max(10, Math.round((market.marginAtRisk / maxMarket) * 100))}%` }} /></i>
            <strong>{euros(market.marginAtRisk)}</strong>
            <em>{market.pressureLevel}</em>
          </a>
        ))}
      </article>
    </section>
  );
}

function RealizationGapVisual() {
  return (
    <section className="atlas-chart-card atlas-realization-visual">
      <SectionTitle title="Price realization gap" />
      {packet.topExposureBuyingGroups.slice(0, 7).map((group) => {
        const expected = group.financialExposure.expectedPriceRealization;
        const target = group.financialExposure.targetPriceRealization;
        const gap = Math.max(0, target - expected);
        return (
          <a href={`/buying-groups/${group.id}?view=financials`} key={group.id}>
            <span>{group.name}</span>
            <div>
              <i style={{ width: `${Math.min(100, expected * 16)}%` }} />
              <b style={{ left: `${Math.min(96, target * 16)}%` }} />
            </div>
            <strong>{pct(expected)}</strong>
            <em>{pct(gap)} gap</em>
          </a>
        );
      })}
    </section>
  );
}

function buildFinancialDecisionRead() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const offsetMarket = [...packet.markets]
    .filter((market) => market.id !== topMarket.id)
    .sort((a, b) => a.marginAtRisk - b.marginAtRisk || a.gapToPlan - b.gapToPlan)[0];
  const sourceDocument = packet.documents.find((document) => document.buyingGroupId === topGroup.id && (document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing'))
    ?? packet.documents.find((document) => document.buyingGroupId === topGroup.id)
    ?? packet.documents[0];
  const realizationGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;
  const highRiskGroups = packet.buyingGroups.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high');
  const belowTargetGroups = packet.buyingGroups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);

  return {
    belowTargetGroups,
    highRiskGroups,
    offsetMarket,
    sourceDocument,
    topGroup,
    topMarket,
    headline: `${euros(packet.summary.marginAtRisk)} margin at risk; ${topGroup.name} drives the buyer exposure and ${topMarket.name} drives the market exposure.`,
    nextAction: `Open ${topGroup.name}, then model downside realization before using an updated counter.`,
    realizationGap
  };
}

function FinancialDecisionLens() {
  const read = buildFinancialDecisionRead();
  const decisions = [
    {
      action: 'Open buyer',
      href: `/buying-groups/${read.topGroup.id}?view=financials`,
      label: 'Buyer exposure',
      source: read.topGroup.source,
      title: read.topGroup.name,
      value: euros(read.topGroup.financialExposure.marginAtRisk),
      meta: `${pct(read.realizationGap)} gap to target`
    },
    {
      action: 'Run scenario',
      href: `/scenario-models?buyingGroup=${read.topGroup.id}`,
      label: 'Scenario needed',
      source: read.topGroup.source,
      title: 'Downside realization',
      value: pct(read.topGroup.financialExposure.expectedPriceRealization),
      meta: `${euros(read.topGroup.financialExposure.revenueUnderNegotiation)} revenue in play`
    },
    {
      action: 'Open market',
      href: `/markets/${read.topMarket.id}`,
      label: 'Market pressure',
      source: read.topMarket.source,
      title: read.topMarket.name,
      value: euros(read.topMarket.marginAtRisk),
      meta: `${read.topMarket.activeBuyingGroups.length} active buyers`
    },
    {
      action: 'Check offset',
      href: read.offsetMarket ? `/markets/${read.offsetMarket.id}` : '/markets',
      label: 'Offset candidate',
      source: read.offsetMarket?.source ?? read.topMarket.source,
      title: read.offsetMarket?.name ?? 'No offset market',
      value: read.offsetMarket ? euros(read.offsetMarket.marginAtRisk) : 'None',
      meta: read.offsetMarket ? `${read.offsetMarket.pressureLevel} pressure` : 'Review market list'
    },
    {
      action: 'Open source',
      href: `/generated-views?prompt=${encodeURIComponent(`Retrieve ${read.sourceDocument.title}`)}&mode=retrieved&documentId=${read.sourceDocument.id}${read.sourceDocument.buyingGroupId ? `&buyingGroupId=${read.sourceDocument.buyingGroupId}` : ''}`,
      label: 'Source check',
      source: read.sourceDocument.source,
      title: read.sourceDocument.title,
      value: labelForStatus(read.sourceDocument.status),
      meta: read.sourceDocument.source.sourceDate
    }
  ];

  return (
    <section className="atlas-financial-decision-lens" aria-label="Financial decisions">
      <header>
        <div>
          <h2>{read.headline}</h2>
          <p>{read.nextAction}</p>
        </div>
        <dl>
          <div><dt>High-risk buyers</dt><dd>{read.highRiskGroups.length}</dd></div>
          <div><dt>Below target</dt><dd>{read.belowTargetGroups.length}</dd></div>
          <div><dt>Gap to plan</dt><dd>{euros(packet.summary.gapToPlan)}</dd></div>
        </dl>
      </header>
      <div>
        {decisions.map((decision) => (
          <a href={decision.href} key={decision.label} {...generatedOutputLinkProps(decision.href)}>
            <span>{decision.label}</span>
            <strong>{decision.value}</strong>
            <h3>{decision.title}</h3>
            <p>{decision.meta}</p>
            <SourceTrustMini source={decision.source} />
            <em>{decision.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

function PepsiCoImpactWorkspace() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const secondGroup = packet.topExposureBuyingGroups[1] ?? topGroup;
  const topMarket = packet.highPressureMarkets[0];
  const latestSignal = packet.signals[0];
  const marketRows = packet.highPressureMarkets.slice(0, 4);
  const buyerRows = packet.topExposureBuyingGroups.slice(0, 4);
  const maxMarketRisk = Math.max(...marketRows.map((market) => market.marginAtRisk), 1);
  const maxBuyerRisk = Math.max(...buyerRows.map((group) => group.financialExposure.marginAtRisk), 1);
  const tradeSpendExposure = packet.buyingGroups.reduce((total, group) => total + group.financialExposure.tradeSpendExposure, 0);
  const belowTargetGroups = packet.buyingGroups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);
  const topGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;
  const revenueWeights = packet.buyingGroups.reduce((total, group) => total + group.financialExposure.revenueUnderNegotiation, 0);
  const weightedExpectedRealization = packet.buyingGroups.reduce((total, group) => (
    total + group.financialExposure.expectedPriceRealization * group.financialExposure.revenueUnderNegotiation
  ), 0) / Math.max(1, revenueWeights);
  const weightedTargetRealization = packet.buyingGroups.reduce((total, group) => (
    total + group.financialExposure.targetPriceRealization * group.financialExposure.revenueUnderNegotiation
  ), 0) / Math.max(1, revenueWeights);
  const netRevenueOutlook = packet.summary.revenueUnderNegotiation - packet.summary.gapToPlan;
  const marginRiskCeiling = 24000000;
  const tradeSpendCap = 18000000;
  const marginOverGoal = Math.max(0, packet.summary.marginAtRisk - marginRiskCeiling);
  const tradeOverGoal = Math.max(0, tradeSpendExposure - tradeSpendCap);
  const priceGap = Math.max(0, weightedTargetRealization - weightedExpectedRealization);

  const goalCards = [
    {
      action: `Close ${euros(packet.summary.gapToPlan)} plan gap`,
      current: euros(netRevenueOutlook),
      gap: `${euros(packet.summary.gapToPlan)} short`,
      goal: euros(packet.summary.revenueUnderNegotiation),
      label: 'Net revenue goal',
      status: 'Off track',
      tone: 'risk'
    },
    {
      action: `Reduce exposure by ${euros(marginOverGoal)}`,
      current: euros(packet.summary.marginAtRisk),
      gap: `${euros(marginOverGoal)} over ceiling`,
      goal: `Under ${euros(marginRiskCeiling)}`,
      label: 'Margin risk ceiling',
      status: 'Off track',
      tone: 'risk'
    },
    {
      action: `Recover ${pct(priceGap)} realization`,
      current: pct(weightedExpectedRealization),
      gap: `${pct(priceGap)} gap`,
      goal: pct(weightedTargetRealization),
      label: 'Price realization goal',
      status: 'Watch',
      tone: 'warning'
    },
    {
      action: `Rebalance ${euros(tradeOverGoal)}`,
      current: euros(tradeSpendExposure),
      gap: `${euros(tradeOverGoal)} over cap`,
      goal: `Under ${euros(tradeSpendCap)}`,
      label: 'Trade spend cap',
      status: tradeOverGoal > 0 ? 'Watch' : 'On track',
      tone: tradeOverGoal > 0 ? 'warning' : 'good'
    }
  ];

  const actions = [
    {
      href: `/scenario-models?market=${topMarket.id}&buyingGroup=${topGroup.id}`,
      label: 'Model top exposure',
      meta: `${topGroup.name} · ${topMarket.name}`,
      value: euros(topGroup.financialExposure.marginAtRisk)
    },
    {
      href: `/buying-groups/${topGroup.id}?view=financials`,
      label: `Open ${topGroup.name}`,
      meta: `${pct(topGap)} gap to target`,
      value: pct(topGroup.financialExposure.expectedPriceRealization)
    },
    {
      href: `/scenario-models?buyingGroup=${secondGroup.id}`,
      label: 'Compare fallback',
      meta: `${secondGroup.name} downside case`,
      value: euros(secondGroup.financialExposure.marginAtRisk)
    }
  ];

  return (
    <section className="atlas-impact-workspace" aria-label="PepsiCo financial impact workspace">
      <section className="atlas-impact-hero-v2">
        <div>
          <span className="atlas-market-readiness-pill readiness-escalation_needed">Recommended focus</span>
          <h1>{euros(packet.summary.gapToPlan)} short of plan; {euros(packet.summary.marginAtRisk)} margin at risk.</h1>
          <p>{topMarket.name} and {topGroup.name} are the fastest path back to the PepsiCo financial goals.</p>
        </div>
        <a href={`/scenario-models?market=${topMarket.id}&buyingGroup=${topGroup.id}`}>
          Model top exposure <ArrowRight size={14} />
        </a>
      </section>

      <section className="atlas-impact-goal-board" aria-label="PepsiCo financial goals">
        <header>
          <h2>PepsiCo financial goals</h2>
        </header>
        <div>
          {goalCards.map((goal) => (
            <article className={goal.tone} key={goal.label}>
              <div>
                <span>{goal.label}</span>
                <b>{goal.status}</b>
              </div>
              <strong>{goal.current}</strong>
              <dl>
                <div><dt>Goal</dt><dd>{goal.goal}</dd></div>
                <div><dt>Gap</dt><dd>{goal.gap}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-impact-main-grid">
        <article className="atlas-impact-rank-panel">
          <header>
            <h2>Gap by market</h2>
            <a href="/markets">Compare markets</a>
          </header>
          <div className="atlas-impact-rank-list">
            {marketRows.map((market) => (
              <a href={`/markets/${market.id}`} key={market.id}>
                <div>
                  <strong>{market.name}</strong>
                  <span>{market.pressureLevel} pressure · {market.activeBuyingGroups.length} active buyers</span>
                </div>
                <i><b style={{ width: `${Math.max(12, Math.round((market.marginAtRisk / maxMarketRisk) * 100))}%` }} /></i>
                <dl>
                  <div><dt>Margin risk</dt><dd>{euros(market.marginAtRisk)}</dd></div>
                  <div><dt>Gap</dt><dd>{euros(market.gapToPlan)}</dd></div>
                </dl>
                <SourceTrustMini source={market.source} />
              </a>
            ))}
          </div>
        </article>

        <article className="atlas-impact-rank-panel">
          <header>
            <div>
              <h2>Buying groups pulling goals off track</h2>
              <span className="atlas-impact-header-stat">{belowTargetGroups.length} below target · {packet.summary.highRiskBuyingGroups} high risk</span>
            </div>
            <a href="/buying-groups">All groups</a>
          </header>
          <div className="atlas-impact-rank-list">
            {buyerRows.map((group) => {
              const gap = group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization;
              return (
                <a href={`/buying-groups/${group.id}?view=financials`} key={group.id}>
                  <div>
                    <strong>{group.name}</strong>
                    <span>{buyerRoundLabel(group)} · {group.riskLevel} risk</span>
                  </div>
                  <i><b style={{ width: `${Math.max(12, Math.round((group.financialExposure.marginAtRisk / maxBuyerRisk) * 100))}%` }} /></i>
                  <dl>
                    <div><dt>Margin risk</dt><dd>{euros(group.financialExposure.marginAtRisk)}</dd></div>
                    <div><dt>Target gap</dt><dd>{pct(gap)}</dd></div>
                  </dl>
                  <SourceTrustMini source={group.source} />
                </a>
              );
            })}
          </div>
        </article>
      </section>

      <section className="atlas-impact-bottom-grid">
        <article className="atlas-impact-action-panel">
          <header>
            <h2>Next actions</h2>
          </header>
          <div>
            {actions.map((action) => (
              <a href={action.href} key={action.label}>
                <strong>{action.value}</strong>
                <span>{action.label}</span>
                <em>{action.meta}</em>
              </a>
            ))}
          </div>
        </article>

        <article className="atlas-impact-action-panel">
          <header>
            <h2>Latest signal</h2>
            <a href={`/?ask=${encodeURIComponent('What changed across Europe this week?')}&view=signal-impact`}>Full read</a>
          </header>
          <div className="atlas-impact-signal-card">
            <strong>{euros(latestSignal.estimatedMarginImpact ?? latestSignal.estimatedRevenueImpact ?? 0)}</strong>
            <h3>{latestSignal.title}</h3>
            <p>{latestSignal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {latestSignal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
            <em>Action: {latestSignal.recommendedAction}</em>
            <SourceTrustMini source={latestSignal.source} />
          </div>
        </article>
      </section>
    </section>
  );
}

function buildExternalSignalSource(sourceName: string, sourceDate: string, confidence: AtlasConfidence = 'medium'): SourceMeta {
  return {
    sourceName,
    sourceType: 'external',
    sourceDate,
    lastUpdated: sourceDate,
    confidence,
    status: 'modeled',
    url: '/database?type=external',
    governance: {
      sourceType: 'external',
      sourceOwner: 'ATLAS external signal monitor',
      approvalStatus: 'prototype_simulation',
      allowedUse: ['demo', 'review_draft'],
      canonicalUseAllowed: 'with_caveat',
      confidence,
      caveats: ['Synthetic POC signal until live news ingestion is connected.'],
      replacementRequirement: 'Replace with connected news, weather, commodity, logistics and public filing feeds.'
    }
  };
}

function OverviewNewsImpactFeed() {
  const rows = [
    ...packet.signals.slice(0, 2).map((signal) => ({
      action: signal.recommendedAction,
      affected: `${signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · ${signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}`,
      category: signal.signalType.replaceAll('_', ' '),
      href: `/signals?signal=${signal.id}`,
      impact: signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0,
      impactLabel: signal.estimatedMarginImpact ? 'margin impact' : 'revenue impact',
      source: signal.source,
      title: signal.title
    })),
    {
      action: 'Check commodity pass-through before concession review',
      affected: 'France / Germany · Carrefour / EDEKA / Rewe',
      category: 'weather / crop pressure',
      href: '/?ask=Show weather and commodity exposure by market&view=signal-impact',
      impact: 1800000,
      impactLabel: 'margin impact',
      source: buildExternalSignalSource('ATLAS weather + commodity watch', '2026-07-10'),
      title: 'Heat and crop-yield watch could pressure input-cost defense'
    },
    {
      action: 'Model logistics surcharge sensitivity',
      affected: 'UK / Netherlands / Belgium · Tesco / Ahold Delhaize',
      category: 'war / logistics route risk',
      href: '/scenario-models?ask=Model logistics surcharge sensitivity',
      impact: 1400000,
      source: buildExternalSignalSource('ATLAS geopolitics + logistics watch', '2026-07-10'),
      title: 'Shipping disruption watch may reopen freight-cost assumptions'
    },
    {
      action: 'Review pack-price architecture for discount buyers',
      affected: 'Spain / Italy / Poland · Aldi / Lidl / Auchan',
      category: 'consumer pressure',
      href: '/buying-groups?ask=Show discount buyers with affordability pressure',
      impact: 1200000,
      source: buildExternalSignalSource('ATLAS consumer + retailer watch', '2026-07-10'),
      title: 'Affordability pressure could increase private-label leverage'
    }
  ];

  return (
    <section className="atlas-news-impact-feed" aria-label="News that could impact negotiations">
      <header>
        <h2>News that could move negotiations</h2>
      </header>
      <div>
        {rows.map((row) => (
          <a href={row.href} key={`${row.category}-${row.title}`} {...generatedOutputLinkProps(row.href)}>
            <strong>{euros(row.impact)}</strong>
            <div>
              <h3>{row.title}</h3>
              <p>{row.affected}</p>
              <CompactSourceText source={row.source} />
            </div>
            <em>{row.action}</em>
          </a>
        ))}
      </div>
    </section>
  );
}

function OverviewBriefingCanvas({ generatedView, initialPrompt }: { generatedView: string; initialPrompt?: string }) {
  const topGroup = packet.topExposureBuyingGroups[0];
  const secondGroup = packet.topExposureBuyingGroups[1];
  const topMarket = packet.highPressureMarkets[0];
  const latestSignal = packet.signals[0];
  const staleSourceCount = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation').length;
  const maxMarketRisk = Math.max(...packet.highPressureMarkets.map((market) => market.marginAtRisk));
  const generatedReadIsRequested = Boolean(initialPrompt && generatedView !== 'focus');
  const newsRows = [
    ...packet.signals.slice(0, 2).map((signal) => ({
      action: signal.recommendedAction,
      affected: `${signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · ${signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}`,
      href: `/signals?signal=${signal.id}`,
      impact: signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0,
      impactLabel: signal.estimatedMarginImpact ? 'margin impact' : 'revenue impact',
      source: signal.source,
      title: signal.title
    })),
    {
      action: 'Check commodity pass-through before concession review',
      affected: 'France / Germany · Carrefour / EDEKA / Rewe',
      href: '/?ask=Show weather and commodity exposure by market&view=signal-impact',
      impact: 1800000,
      impactLabel: 'margin impact',
      source: buildExternalSignalSource('ATLAS weather + commodity watch', '2026-07-10'),
      title: 'Heat and crop-yield watch could pressure input-cost defense'
    },
    {
      action: 'Model logistics surcharge sensitivity',
      affected: 'UK / Netherlands / Belgium · Tesco / Ahold Delhaize',
      href: '/scenario-models?ask=Model logistics surcharge sensitivity',
      impact: 1400000,
      impactLabel: 'cost exposure',
      source: buildExternalSignalSource('ATLAS geopolitics + logistics watch', '2026-07-10'),
      title: 'Shipping disruption watch may reopen freight-cost assumptions'
    }
  ];

  const decisionRows = [
    {
      action: `Open ${topGroup.name}`,
      href: `/buying-groups/${topGroup.id}`,
      metric: euros(topGroup.financialExposure.marginAtRisk),
      metricLabel: 'margin at risk',
      movement: '+EUR 1.1M',
      title: `${topGroup.name}: CNO intervention likely`,
      supporting: `${buyerRoundLabel(topGroup)} · ${pct(topGroup.financialExposure.expectedPriceRealization)} realized / ${pct(topGroup.financialExposure.targetPriceRealization)} target`,
      tone: 'risk'
    },
    {
      action: `Open ${topMarket.name}`,
      href: `/markets/${topMarket.id}`,
      metric: euros(topMarket.marginAtRisk),
      metricLabel: 'market margin risk',
      movement: '+9% pressure',
      title: `${topMarket.name}: pressure market`,
      supporting: topMarket.topDrivers.slice(0, 2).join(' · '),
      tone: 'watch'
    },
    {
      action: 'Model fallback',
      href: `/scenario-models?buyingGroup=${secondGroup.id}`,
      metric: euros(secondGroup.financialExposure.marginAtRisk),
      metricLabel: 'margin at risk',
      movement: `${pct(secondGroup.financialExposure.targetPriceRealization - secondGroup.financialExposure.expectedPriceRealization)} gap`,
      title: `${secondGroup.name}: realization below target`,
      supporting: `${buyerRoundLabel(secondGroup)} · ${secondGroup.negotiationStage}`,
      tone: 'signal'
    },
    {
      action: 'Review sources',
      href: '/documents?view=source-readiness',
      metric: `${staleSourceCount}`,
      metricLabel: 'source gaps',
      movement: 'before output',
      title: 'Stale sources blocking confidence',
      supporting: 'Buyer profiles, debriefs, pricing proof',
      tone: 'source'
    }
  ];

  return (
    <section className="atlas-overview-v3" aria-label="Europe overview briefing">
      <section className="atlas-overview-v3-hero">
        <div className="atlas-overview-v3-title">
          <span className="atlas-market-readiness-pill readiness-escalation_needed">Escalation needed</span>
          <h1>{euros(packet.summary.marginAtRisk)} margin at risk. {topGroup.name}, {secondGroup.name}, and {topMarket.name} need focus.</h1>
          <p>Recommended action: open {topGroup.name}, review the realization gap, then run a fallback scenario before the next governance checkpoint.</p>
          <a href={`/buying-groups/${topGroup.id}`}>Open {topGroup.name} <ArrowRight size={14} /></a>
        </div>
        <dl className="atlas-overview-v3-pills" aria-label="Top Europe metrics">
          <div>
            <dt>Revenue in play</dt>
            <dd>{euros(packet.summary.revenueUnderNegotiation)}</dd>
          </div>
          <div>
            <dt>Margin at risk</dt>
            <dd>{euros(packet.summary.marginAtRisk)} <em>+9%</em></dd>
          </div>
          <div>
            <dt>Gap to plan</dt>
            <dd>{euros(packet.summary.gapToPlan)}</dd>
          </div>
          <div>
            <dt>High-risk groups</dt>
            <dd>{packet.summary.highRiskBuyingGroups}</dd>
          </div>
          <div>
            <dt>Latest signal</dt>
            <dd>{euros(latestSignal.estimatedMarginImpact ?? latestSignal.estimatedRevenueImpact ?? 0)}</dd>
          </div>
        </dl>
      </section>

      <section className="atlas-overview-v3-grid">
        <section className="atlas-overview-v3-panel atlas-overview-v3-priorities">
          <header>
            <h2>Recommended Focus</h2>
            <a href="/buying-groups">All buying groups</a>
          </header>
          <div>
            {decisionRows.map((row) => (
              <a className={row.tone} href={row.href} key={row.title}>
                <div className="atlas-overview-v3-number">
                  <strong>{row.metric}</strong>
                  <small>{row.metricLabel}</small>
                </div>
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.supporting}</p>
                </div>
                <span>{row.movement}</span>
                <em>{row.action}</em>
              </a>
            ))}
          </div>
        </section>

        <section className="atlas-overview-v3-panel atlas-overview-v3-markets">
          <header>
            <h2>Markets</h2>
            <a href="/markets">Compare</a>
          </header>
          <div>
            {packet.highPressureMarkets.slice(0, 5).map((market) => (
              <a className={`market-tone-${market.pressureLevel}`} href={`/markets/${market.id}`} key={market.id}>
                <span>{market.name}</span>
                <i><b style={{ width: `${Math.max(12, Math.round((market.marginAtRisk / maxMarketRisk) * 100))}%` }} /></i>
                <strong>{euros(market.marginAtRisk)} <small>margin risk</small></strong>
                <em>{market.pressureLevel}</em>
              </a>
            ))}
          </div>
        </section>
      </section>

      <section className="atlas-overview-v3-row">
        <section className="atlas-overview-v3-panel atlas-overview-v3-news">
          <header>
            <h2>News that could move negotiations</h2>
            <a href="/?ask=What changed across Europe this week?&view=signal-impact">Full read</a>
          </header>
          <div>
            {newsRows.map((row) => (
              <a href={row.href} key={row.title} {...generatedOutputLinkProps(row.href)}>
                <div className="atlas-overview-v3-number">
                  <strong>{euros(row.impact)}</strong>
                  <small>{row.impactLabel}</small>
                </div>
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.affected}</p>
                  <CompactSourceText source={row.source} />
                </div>
                <em>{row.action}</em>
              </a>
            ))}
          </div>
        </section>
      </section>

      <section className="atlas-overview-v3-row">
        <section className="atlas-overview-v3-panel atlas-overview-v3-patterns">
          <header>
            <h2>Cross-market patterns</h2>
            <a href="/scenario-models">Model</a>
          </header>
          <div>
            {packet.crossMarketPatterns.slice(0, 3).map((pattern) => (
              <a href="/scenario-models" key={pattern.id}>
                <span>Pattern detected</span>
                <h3>{pattern.title}</h3>
                <div className="atlas-overview-v3-number">
                  <strong>{euros(pattern.financialImplication.marginAtRisk ?? pattern.financialImplication.revenueAtRisk ?? 0)}</strong>
                  <small>{pattern.financialImplication.marginAtRisk ? 'margin at risk' : 'revenue at risk'}</small>
                </div>
                <p><b>Repeats in</b> {pattern.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {pattern.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
                <em>{pattern.recommendedAction}</em>
              </a>
            ))}
          </div>
        </section>
      </section>

      {generatedReadIsRequested ? <OverviewGeneratedRead ask={initialPrompt} view={generatedView} /> : null}
    </section>
  );
}

function SignalActionBoard({ signals }: { signals: ExternalSignal[] }) {
  return (
    <section className="atlas-data-action-board" aria-label="Signal actions">
      {signals.map((signal) => (
        <a href={`/generated-views?prompt=${encodeURIComponent(`Create signal impact readout for ${signal.title}`)}&mode=draft&editable=1`} key={signal.id} {...generatedOutputLinkProps(`/generated-views?prompt=${encodeURIComponent(signal.title)}&mode=draft&editable=1`)}>
          <strong>{euros(signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0)}</strong>
          <div>
            <h3>{signal.title}</h3>
            <p>{signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
            <SourceTrustMini source={signal.source} />
          </div>
          <em>{signal.recommendedAction}</em>
        </a>
      ))}
    </section>
  );
}

function CompetitorActionBoard({ moves }: { moves: CompetitorMove[] }) {
  return (
    <section className="atlas-data-action-board" aria-label="Competitor actions">
      {moves.map((move) => (
        <a href={`/generated-views?prompt=${encodeURIComponent(`Create competitor leverage readout for ${move.competitor}: ${move.title}`)}&mode=draft&editable=1`} key={move.id} {...generatedOutputLinkProps(`/generated-views?prompt=${encodeURIComponent(move.title)}&mode=draft&editable=1`)}>
          <strong>{euros(move.estimatedMarginImpact ?? move.estimatedRevenueImpact ?? 0)}</strong>
          <div>
            <h3>{move.competitor}: {move.title}</h3>
            <p>{move.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {move.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
            <SourceTrustMini source={move.source} />
          </div>
          <em>{move.recommendedAction}</em>
        </a>
      ))}
    </section>
  );
}

function ImpactSnapshotBoard() {
  const topGroups = packet.topExposureBuyingGroups.slice(0, 4);
  const rows = [
    {
      href: `/buying-groups/${topGroups[0].id}?view=financials`,
      label: topGroups[0].name,
      metric: euros(topGroups[0].financialExposure.marginAtRisk),
      sub: `${pct(topGroups[0].financialExposure.expectedPriceRealization)} realized / ${pct(topGroups[0].financialExposure.targetPriceRealization)} target`,
      action: 'Open buyer'
    },
    {
      href: `/buying-groups/${topGroups[1].id}?view=financials`,
      label: topGroups[1].name,
      metric: euros(topGroups[1].financialExposure.marginAtRisk),
      sub: `${pct(topGroups[1].financialExposure.targetPriceRealization - topGroups[1].financialExposure.expectedPriceRealization)} gap`,
      action: 'Model downside'
    },
    {
      href: `/markets/${packet.highPressureMarkets[0].id}`,
      label: packet.highPressureMarkets[0].name,
      metric: euros(packet.highPressureMarkets[0].marginAtRisk),
      sub: `${packet.highPressureMarkets[0].activeBuyingGroups.length} active buyers`,
      action: 'Open market'
    },
    {
      href: '/scenario-models',
      label: 'Gap to plan',
      metric: euros(packet.summary.gapToPlan),
      sub: `${packet.summary.highRiskBuyingGroups} high-risk groups`,
      action: 'Run scenario'
    }
  ];

  return (
    <section className="atlas-impact-snapshot-board" aria-label="Financial impact snapshots">
      {rows.map((row) => (
        <a href={row.href} key={row.label}>
          <span>{row.label}</span>
          <strong>{row.metric}</strong>
          <p>{row.sub}</p>
          <em>{row.action} <ArrowRight size={13} /></em>
        </a>
      ))}
    </section>
  );
}

function BriefingActionPanel() {
  return (
    <section className="atlas-briefing-action-panel">
      <div>
        <span>Next action</span>
        <h3>Model downside realization for EDEKA, Tesco and Carrefour.</h3>
        <p>Validate stale or missing source documents before creating any new output or using generated assumptions.</p>
      </div>
      <div className="atlas-briefing-actions">
        <a href="/scenario-models">Open Scenario Models <ArrowRight size={14} /></a>
        <a href="/documents">Review source readiness</a>
      </div>
    </section>
  );
}

function CommandPanel({ initialPrompt = '' }: { initialPrompt?: string }) {
  return (
    <section className="atlas-command-panel">
      <span>Command desk</span>
      <h2>Ask ATLAS for a specific read.</h2>
      <p>Use this when the brief raises a question and you want ATLAS to route you to the right intelligence view.</p>
      <CommandBar initialPrompt={initialPrompt} />
    </section>
  );
}

function CnoWatchlistBrief() {
  return (
    <section className="atlas-brief-list">
      {packet.cnoWatchlist.slice(0, 5).map((item) => (
        <a href={item.href} key={item.id} {...generatedOutputLinkProps(item.href)}>
          <div>
            <h3>{item.title}</h3>
            <CompactImpactLine
              revenue={item.financialImplication.revenueAtRisk}
              margin={item.financialImplication.marginAtRisk}
              volume={item.financialImplication.volumeExposure}
              trade={item.financialImplication.tradeSpendExposure}
            />
            <CompactSourceLine source={item.source} />
          </div>
          <aside>
            <strong>{item.recommendedAction}</strong>
          </aside>
        </a>
      ))}
    </section>
  );
}

function CrossMarketPatternBrief() {
  return (
    <section className="atlas-pattern-brief">
      {packet.crossMarketPatterns.map((pattern) => (
        <article key={pattern.id}>
          <h3>{pattern.title}</h3>
          <CompactImpactLine
            revenue={pattern.financialImplication.revenueAtRisk}
            margin={pattern.financialImplication.marginAtRisk}
            volume={pattern.financialImplication.volumeExposure}
            trade={pattern.financialImplication.tradeSpendExposure}
          />
          <CompactSourceLine source={pattern.source} />
          <a href="/scenario-models">{pattern.recommendedAction}</a>
        </article>
      ))}
    </section>
  );
}

function InvestigationLinks() {
  const links = [
    {
      title: 'Markets',
      body: 'Compare pressure and exposure by market.',
      href: '/markets',
      icon: <Globe2 size={17} />
    },
    {
      title: 'Buying Groups',
      body: 'Open Carrefour, EDEKA, Tesco or other buyer intelligence centers.',
      href: '/buying-groups',
      icon: <Layers3 size={17} />
    },
    {
      title: 'Signals',
      body: 'Review public-world changes with source and financial implication.',
      href: '/signals',
      icon: <Newspaper size={17} />
    },
    {
      title: 'Financial Impact',
      body: 'Trace margin-at-risk, realization gaps and exposure ranking.',
      href: '/financial-impact',
      icon: <CircleDollarSign size={17} />
    }
  ];

  return (
    <section className="atlas-investigation-links">
      {links.map((link) => (
        <a href={link.href} key={link.href} {...generatedOutputLinkProps(link.href)}>
          {link.icon}
          <strong>{link.title}</strong>
          <span>{link.body}</span>
        </a>
      ))}
    </section>
  );
}

function OverviewGeneratedRead({ ask, view }: { ask?: string; view: string }) {
  if (view === 'money-at-risk') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Where money is most at risk"
        description="Margin risk, gap to plan and expected realization are the first financial lens before drilling into buyers."
      >
        <NewsFinancialTape />
        <BuyingGroupTable groups={packet.topExposureBuyingGroups.slice(0, 5)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'market-comparison') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Markets compared by pressure and offset potential"
        description="Use this to see where exposure is concentrated and where cross-market offsets may be possible."
      >
        <MarketPressureGrid markets={packet.highPressureMarkets.slice(0, 5)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'buyer-ranking') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Buying groups needing attention"
        description="Ranked by risk, margin at risk, realization gap, source readiness and intervention need."
      >
        <BuyingGroupTable groups={packet.topExposureBuyingGroups.slice(0, 7)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'signal-impact') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="What changed in the market this week"
        description="External changes translated into affected buyers, financial implication and recommended action."
      >
        <SignalCards signals={packet.signals.slice(0, 4)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'competitor-impact') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Competitor moves creating buyer leverage"
        description="Public competitor activity translated into buyer pressure and PepsiCo financial implications."
      >
        <CompetitorCards moves={packet.competitorMoves.slice(0, 4)} />
      </GeneratedWorkspace>
    );
  }

  return (
    <GeneratedWorkspace
      ask={ask}
      title="Act on these first"
      description=""
    >
      <section className="atlas-generated-stack">
        <CnoWatchlistBrief />
        <CrossMarketPatternBrief />
      </section>
    </GeneratedWorkspace>
  );
}

function EuropeOverview({ initialGeneratedView, initialMonitorTab, initialPrompt }: { initialGeneratedView?: string; initialMonitorTab?: string; initialPrompt?: string }) {
  const generatedView = initialGeneratedView || inferGeneratedView(initialPrompt || initialMonitorTab, 'focus');

  return (
    <>
      <OverviewBriefingCanvas generatedView={generatedView} initialPrompt={initialPrompt} />
      <AtlasCommandSurface
        basePath="/"
        examples={[
          'What changed across Europe this week?',
          'Show margin exposure by market',
          'Which buying groups need CNO intervention?'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for a market read, buyer ranking, signal impact, source gap, or financial report..."
      />
    </>
  );
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <header className="atlas-section-title">
      <h2>{title}</h2>
      {detail ? <p>{detail}</p> : null}
    </header>
  );
}

function sortMarkets(markets: Market[], sort?: string) {
  const selected = sort || 'priority';
  return [...markets].sort((a, b) => {
    if (selected === 'margin') return b.marginAtRisk - a.marginAtRisk;
    if (selected === 'gap') return b.gapToPlan - a.gapToPlan;
    if (selected === 'trade') return b.tradeSpendExposure - a.tradeSpendExposure;
    if (selected === 'revenue') return b.revenueUnderNegotiation - a.revenueUnderNegotiation;
    if (selected === 'buyers') return b.activeBuyingGroups.length - a.activeBuyingGroups.length;
    return riskRank(b.pressureLevel) - riskRank(a.pressureLevel) || b.marginAtRisk - a.marginAtRisk;
  });
}

function filterMarketsForAsk(markets: Market[], ask?: string) {
  const normalized = (ask ?? '').toLowerCase();
  if (/losing money|margin|money at risk|risk/.test(normalized)) {
    return markets.filter((market) => market.marginAtRisk >= 3_000_000 || market.pressureLevel === 'critical' || market.pressureLevel === 'high');
  }
  if (/gap|plan|below/.test(normalized)) {
    return markets.filter((market) => market.gapToPlan >= 1_000_000);
  }
  if (/trade|promo|spend/.test(normalized)) {
    return [...markets].sort((a, b) => b.tradeSpendExposure - a.tradeSpendExposure);
  }
  if (/absorb|offset|safer|low pressure/.test(normalized)) {
    return markets.filter((market) => market.pressureLevel === 'low' || market.pressureLevel === 'medium');
  }
  return markets;
}

function marketMetricTone(metric: 'margin' | 'gap' | 'trade' | 'buyers', market: Market) {
  if (metric === 'margin') {
    if (market.marginAtRisk >= 7_000_000) return 'critical';
    if (market.marginAtRisk >= 4_000_000) return 'warning';
    return 'good';
  }
  if (metric === 'gap') {
    if (market.gapToPlan >= 2_500_000) return 'critical';
    if (market.gapToPlan >= 1_000_000) return 'warning';
    return 'good';
  }
  if (metric === 'trade') {
    if (market.tradeSpendExposure >= 5_000_000) return 'critical';
    if (market.tradeSpendExposure >= 2_500_000) return 'warning';
    return 'good';
  }
  if (market.activeBuyingGroups.length >= 3) return 'critical';
  if (market.activeBuyingGroups.length === 2) return 'warning';
  return 'good';
}

function marketMovementTone(movement: number) {
  if (movement >= 0.12) return 'risk';
  if (movement >= 0.06) return 'watch';
  return 'neutral';
}

function marketMovementLabel(value: number, movement: number, noun: string) {
  return `${movement >= 0 ? '+' : ''}${Math.round(movement * 100)}% ${noun}`;
}

function titleCaseText(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function buildMarketDecisionRead(market: Market) {
  const groups = market.activeBuyingGroups
    .map((id) => getBuyingGroup(id))
    .filter((group): group is BuyingGroup => Boolean(group))
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk);
  const topBuyer = groups[0];
  const marketSignals = signalsFor({ marketId: market.id });
  const moves = competitorMovesFor({ marketId: market.id });
  const marketDocuments = documentsFor({ marketId: market.id });
  const marketTimeline = timelineFor({ marketId: market.id });
  const readinessStatus: BuyingGroupWorkspacePacket['readiness']['status'] = market.pressureLevel === 'critical' || market.marginAtRisk >= 7_000_000
    ? 'escalation_needed'
    : market.pressureLevel === 'high' || market.gapToPlan >= 1_000_000 || market.tradeSpendExposure >= 3_000_000
      ? 'needs_review'
      : 'ready';
  const topWatchouts = [
    market.gapToPlan >= 1_000_000 ? `${euros(market.gapToPlan)} gap to plan` : null,
    market.tradeSpendExposure >= 2_500_000 ? `${euros(market.tradeSpendExposure)} trade spend exposed` : null,
    topBuyer ? `${topBuyer.name}: ${buyerInterventionTrigger(topBuyer)}` : null,
    marketDocuments.find((document) => document.status === 'stale' || document.status === 'needs_validation') ? 'Source memory needs review' : null,
    marketSignals[0]?.title,
    moves[0] ? `${moves[0].competitor}: ${moves[0].possibleBuyerLeverage}` : null
  ].filter((item): item is string => Boolean(item)).slice(0, 4);

  return {
    groups,
    marketDocuments,
    marketSignals,
    marketTimeline,
    moves,
    readinessStatus,
    topBuyer,
    topWatchouts,
    headline: `${market.name}: ${euros(market.marginAtRisk)} margin at risk across ${market.activeBuyingGroups.length} active buying groups.`,
    recommendedAction: topBuyer
      ? `Open ${topBuyer.name} first, then model the ${market.name} exposure.`
      : `Model ${market.name} exposure and check source memory.`
  };
}

function MarketSortBar({ activeSort }: { activeSort?: string }) {
  const selected = activeSort || 'priority';
  const sorts = [
    ['priority', 'Priority'],
    ['margin', 'Margin risk'],
    ['gap', 'Gap to plan'],
    ['trade', 'Trade spend'],
    ['buyers', 'Buyer count'],
    ['revenue', 'Revenue']
  ];

  return (
    <section className="atlas-buyer-list-head atlas-market-list-head">
      <h1>Markets</h1>
      <nav aria-label="Sort markets">
        {sorts.map(([sort, label]) => (
          <a href={sort === 'priority' ? '/markets' : `/markets?sort=${sort}`} className={selected === sort ? 'active' : ''} key={sort}>{label}</a>
        ))}
      </nav>
    </section>
  );
}

function MarketTriageCard({ market, rank }: { market: Market; rank: number }) {
  const read = buildMarketDecisionRead(market);
  const topGroup = read.topBuyer;

  return (
    <a href={`/markets/${market.id}`} className={`atlas-market-triage-card ${classNameForRisk(market.pressureLevel)}`}>
      <header>
        <div>
          <span>#{rank} / {market.pressureLevel} pressure</span>
          <h3>{market.name}</h3>
          <p>{read.recommendedAction}</p>
        </div>
        <span className={`atlas-risk-pill risk-${market.pressureLevel}`}>{readinessLabel(read.readinessStatus)}</span>
      </header>
      <section className="atlas-buyer-triage-metrics" aria-label={`${market.name} financial exposure`}>
        <div className={`metric-${marketMetricTone('margin', market)}`}><span>Margin risk</span><strong>{euros(market.marginAtRisk)}</strong></div>
        <div><span>Revenue</span><strong>{euros(market.revenueUnderNegotiation)}</strong></div>
        <div className={`metric-${marketMetricTone('gap', market)}`}><span>Gap to plan</span><strong>{euros(market.gapToPlan)}</strong></div>
        <div className={`metric-${marketMetricTone('trade', market)}`}><span>Trade spend</span><strong>{euros(market.tradeSpendExposure)}</strong></div>
      </section>
      <dl className="atlas-buyer-triage-state">
        <div className={`metric-${marketMetricTone('buyers', market)}`}><dt>Buying groups</dt><dd>{market.activeBuyingGroups.length} active · {topGroup ? `${topGroup.name} first` : 'No buyer linked'}</dd></div>
        <div><dt>Watchout</dt><dd>{read.topWatchouts[0] ?? market.topDrivers[0]}</dd></div>
      </dl>
      <footer>
        <SourceTrustMini source={market.source} />
        <span>Open market read <ArrowRight size={13} /></span>
      </footer>
    </a>
  );
}

function MarketTriageQueue({ markets }: { markets: Market[] }) {
  if (!markets.length) return <EmptyGeneratedState label="Markets" />;
  return (
    <section className="atlas-market-triage-queue" aria-label="Prioritized market list">
      {markets.map((market, index) => <MarketTriageCard market={market} key={market.id} rank={index + 1} />)}
    </section>
  );
}

function MarketsBriefingCanvas({ activeSort, initialPrompt, markets }: { activeSort?: string; initialPrompt?: string; markets: Market[] }) {
  const topMarket = markets[0] ?? packet.highPressureMarkets[0];
  const topRead = buildMarketDecisionRead(topMarket);
  const topBuyer = topRead.topBuyer;
  const offsetMarkets = [...packet.markets]
    .filter((market) => market.id !== topMarket.id)
    .sort((a, b) => a.marginAtRisk - b.marginAtRisk)
    .slice(0, 3);
  const maxMargin = Math.max(...packet.markets.map((market) => market.marginAtRisk));
  const maxGap = Math.max(...packet.markets.map((market) => market.gapToPlan));
  const maxTrade = Math.max(...packet.markets.map((market) => market.tradeSpendExposure));
  const selected = activeSort || 'priority';
  const sorts = [
    ['priority', 'Priority'],
    ['margin', 'Margin risk'],
    ['gap', 'Gap to plan'],
    ['trade', 'Trade spend'],
    ['buyers', 'Buyer count'],
    ['revenue', 'Revenue']
  ];

  return (
    <section className="atlas-markets-v3" aria-label="Markets comparison">
      <section className="atlas-markets-v3-hero">
        <div>
          <span className={`atlas-market-readiness-pill readiness-${topRead.readinessStatus}`}>{readinessLabel(topRead.readinessStatus)}</span>
          <h1>{topRead.headline}</h1>
          <p>{topRead.recommendedAction}</p>
          <div className="atlas-market-hero-actions">
            <a href={topBuyer ? `/buying-groups/${topBuyer.id}` : `/markets/${topMarket.id}`}>Open {topBuyer?.name ?? topMarket.name} <ArrowRight size={14} /></a>
            <a href={`/scenario-models?market=${topMarket.id}`}>Model exposure</a>
          </div>
        </div>
        <dl>
          <div><dt>Revenue in play</dt><dd>{euros(packet.summary.revenueUnderNegotiation)}</dd></div>
          <div><dt>Margin at risk</dt><dd>{euros(packet.summary.marginAtRisk)}</dd></div>
          <div><dt>Top market risk</dt><dd>{euros(topMarket.marginAtRisk)}</dd></div>
          <div><dt>Gap to plan</dt><dd>{euros(packet.summary.gapToPlan)}</dd></div>
          <div><dt>Active markets</dt><dd>{packet.markets.length}</dd></div>
        </dl>
      </section>

      <section className="atlas-market-watchout-strip" aria-label="Market watchouts">
        {topRead.topWatchouts.map((watchout) => (
          <span key={watchout}>{watchout}</span>
        ))}
      </section>

      <nav className="atlas-markets-v3-sort" aria-label="Sort markets">
        {sorts.map(([sort, label]) => (
          <a href={sort === 'priority' ? '/markets' : `/markets?sort=${sort}`} className={selected === sort ? 'active' : ''} key={sort}>{label}</a>
        ))}
      </nav>

      {initialPrompt ? (
        <section className="atlas-markets-v3-asked">
          <span>Asked</span>
          <strong>{initialPrompt}</strong>
        </section>
      ) : null}

      <section className="atlas-markets-v3-grid">
        <section className="atlas-markets-v3-panel atlas-markets-v3-ranking">
          <header>
            <h2>Compare markets</h2>
            <a href="/financial-impact">PepsiCo Impact</a>
          </header>
          <div>
            {markets.map((market, index) => {
              const groups = market.activeBuyingGroups.map((id) => getBuyingGroup(id)).filter((group): group is BuyingGroup => Boolean(group));
              const firstBuyer = groups.sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)[0];
              return (
                <a href={`/markets/${market.id}`} key={market.id}>
                  <strong>#{index + 1}</strong>
                  <div>
                    <h3>{market.name}</h3>
                    <p>{buildMarketDecisionRead(market).recommendedAction}</p>
                  </div>
                  <span>{euros(market.marginAtRisk)}</span>
                  <i><b style={{ width: `${Math.max(10, Math.round((market.marginAtRisk / maxMargin) * 100))}%` }} /></i>
                  <em>{firstBuyer ? `${firstBuyer.name} first` : `${market.activeBuyingGroups.length} buyers`}</em>
                </a>
              );
            })}
          </div>
        </section>

        <section className="atlas-markets-v3-panel atlas-markets-v3-pressure">
          <header>
            <h2>Risk shape</h2>
            <a href="/scenario-models">Model</a>
          </header>
          <div>
            {markets.slice(0, 5).map((market) => (
              <a href={`/markets/${market.id}`} key={market.id}>
                <span>{market.name}</span>
                <div>
                  <label>Gap</label>
                  <i><b style={{ width: `${Math.max(8, Math.round((market.gapToPlan / maxGap) * 100))}%` }} /></i>
                  <strong>{euros(market.gapToPlan)}</strong>
                </div>
                <div>
                  <label>Trade</label>
                  <i><b style={{ width: `${Math.max(8, Math.round((market.tradeSpendExposure / maxTrade) * 100))}%` }} /></i>
                  <strong>{euros(market.tradeSpendExposure)}</strong>
                </div>
              </a>
            ))}
          </div>
        </section>
      </section>

      <section className="atlas-markets-v3-grid secondary">
        <section className="atlas-markets-v3-panel atlas-markets-v3-actions">
          <header>
            <h2>Open next</h2>
          </header>
          <div>
            {markets.slice(0, 4).map((market) => {
              const buyer = market.activeBuyingGroups.map((id) => getBuyingGroup(id)).filter((group): group is BuyingGroup => Boolean(group))[0];
              return (
                <a href={buyer ? `/buying-groups/${buyer.id}` : `/markets/${market.id}`} key={market.id}>
                  <strong>{market.name}</strong>
                  <span>{buyer ? buyer.name : 'Market read'}</span>
                  <em>{market.topDrivers[0]}</em>
                </a>
              );
            })}
          </div>
        </section>

        <section className="atlas-markets-v3-panel atlas-markets-v3-offsets">
          <header>
            <h2>Potential offsets</h2>
            <a href="/markets?sort=margin">Review</a>
          </header>
          <div>
            {offsetMarkets.map((market) => (
              <a href={`/markets/${market.id}`} key={market.id}>
                <strong>{market.name}</strong>
                <span>{euros(market.marginAtRisk)} risk</span>
                <em>{market.pressureLevel} pressure</em>
              </a>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
}

function MarketStatePanel({ market }: { market: Market }) {
  const read = buildMarketDecisionRead(market);
  const pressureMovement = market.pressureLevel === 'critical' ? 0.18 : market.pressureLevel === 'high' ? 0.12 : market.pressureLevel === 'medium' ? 0.06 : 0.02;
  const headerMetrics = [
    {
      label: 'Revenue in negotiation',
      movement: marketMovementLabel(market.revenueUnderNegotiation, pressureMovement, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement),
      value: euros(market.revenueUnderNegotiation)
    },
    {
      label: 'Margin at risk',
      movement: marketMovementLabel(market.marginAtRisk, pressureMovement + 0.04, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement + 0.04),
      value: euros(market.marginAtRisk)
    },
    {
      label: 'Gap to plan',
      movement: marketMovementLabel(market.gapToPlan, pressureMovement + 0.02, 'worse than last read'),
      tone: marketMovementTone(pressureMovement + 0.02),
      value: euros(market.gapToPlan)
    },
    {
      label: 'Trade spend',
      movement: marketMovementLabel(market.tradeSpendExposure, pressureMovement, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement),
      value: euros(market.tradeSpendExposure)
    }
  ];

  return (
    <section className="atlas-market-state-panel">
      <div>
        <span className={`atlas-market-readiness-pill readiness-${read.readinessStatus}`}>{readinessLabel(read.readinessStatus)}</span>
        <h2>{market.name}</h2>
        <div className="atlas-market-state-watchouts">
          {read.topWatchouts.slice(0, 3).map((watchout) => <span key={watchout}>{watchout}</span>)}
        </div>
      </div>
      <dl>
        {headerMetrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>
              <strong>{metric.value}</strong>
              <em className={`movement-${metric.tone}`}>{metric.movement}</em>
            </dd>
          </div>
        ))}
      </dl>
      <aside>
        <span>Recommended action</span>
        <strong>{read.recommendedAction}</strong>
        <div className="atlas-market-state-actions">
          <a href={read.topBuyer ? `/buying-groups/${read.topBuyer.id}` : `/markets/${market.id}`}>Open buyer</a>
          <a href={`/scenario-models?market=${market.id}`}>Model market</a>
          <a href={`/documents?market=${market.id}`}>Sources</a>
        </div>
        <SourceTrustMini source={market.source} />
      </aside>
    </section>
  );
}

function MarketLoopPanel({ market }: { market: Market }) {
  const read = buildMarketDecisionRead(market);
  const savedViews = useStoredGeneratedViews({ marketId: market.id });
  const firstDocument = read.marketDocuments[0];
  const latestEvent = read.marketTimeline[0];
  const firstBuyer = read.topBuyer;
  const sourceWatchouts = read.marketDocuments.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const cards = [
    {
      action: firstDocument ? 'Open source' : 'Open documents',
      href: firstDocument ? hrefForDocumentArtifact(firstDocument) : `/documents?market=${market.id}`,
      label: 'Sources',
      meta: sourceWatchouts.length ? `${sourceWatchouts.length} watchouts` : 'Ready',
      source: firstDocument?.source,
      title: `${read.marketDocuments.length} documents`
    },
    {
      action: latestEvent?.buyingGroupIds[0] ? 'Open buyer history' : 'Open timeline',
      href: latestEvent?.buyingGroupIds[0] ? `/buying-groups/${latestEvent.buyingGroupIds[0]}?view=memory` : `/timeline?market=${market.id}`,
      label: 'Memory',
      meta: latestEvent ? compactFinancialImpact({
        margin: latestEvent.financialImpact?.marginImpact,
        revenue: latestEvent.financialImpact?.revenueImpact,
        trade: latestEvent.financialImpact?.tradeSpendImpact
      }) : 'No modeled impact',
      source: latestEvent?.source,
      title: `${read.marketTimeline.length} events`
    },
    {
      action: savedViews[0] ? 'Open latest view' : 'Create view',
      href: savedViews[0] ? `/generated-views?prompt=${encodeURIComponent(savedViews[0].prompt)}&mode=draft&editable=1&marketId=${market.id}` : `/generated-views?prompt=${encodeURIComponent(`Create ${market.name} market exposure readout`)}&mode=draft&editable=1&marketId=${market.id}`,
      label: 'Generated views',
      meta: savedViews[0]?.sourceName ?? 'Editable draft if new',
      title: `${savedViews.length} saved`
    },
    {
      action: firstBuyer ? 'Open buyer' : 'Open buying groups',
      href: firstBuyer ? `/buying-groups/${firstBuyer.id}` : '/buying-groups',
      label: 'Buyer to open',
      meta: firstBuyer ? buyerInterventionTrigger(firstBuyer) : `${market.activeBuyingGroups.length} active buyers`,
      source: firstBuyer?.source,
      title: firstBuyer?.name ?? 'No buyer selected'
    }
  ];

  return (
    <section className="atlas-market-loop-panel" aria-label={`${market.name} intelligence loop`}>
      <header>
        <h2>Market loop</h2>
        <span>{market.name} · sources, memory, buyers, generated views</span>
      </header>
      <div>
        {cards.map((card) => (
          <a href={card.href} key={card.label} {...generatedOutputLinkProps(card.href)}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.meta}</p>
            {card.source ? <SourceTrustMini source={card.source} /> : null}
            <em>{card.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

type MarketDetailTab = 'buyers' | 'signals' | 'competitors' | 'memory';

function normalizeMarketDetailTab(view?: string, prompt?: string): MarketDetailTab {
  const normalized = `${view ?? ''} ${prompt ?? ''}`.toLowerCase();
  if (/signal|news|world|changed|pressure/.test(normalized)) return 'signals';
  if (/competitor|private label|leverage/.test(normalized)) return 'competitors';
  if (/source|document|memory|history|timeline|generated|database|proof/.test(normalized)) return 'memory';
  return 'buyers';
}

function MarketDetailTabs({
  activeTab,
  market,
  metrics
}: {
  activeTab: MarketDetailTab;
  market: Market;
  metrics: {
    buyers: number;
    competitors: number;
    memory: number;
    signals: number;
  };
}) {
  const tabs: Array<[MarketDetailTab, string, number]> = [
    ['buyers', 'Buying groups', metrics.buyers],
    ['signals', 'Signals', metrics.signals],
    ['competitors', 'Competitors', metrics.competitors],
    ['memory', 'Source loop', metrics.memory]
  ];

  return (
    <nav className="atlas-market-detail-tabs" aria-label={`${market.name} market views`}>
      {tabs.map(([tab, label, count]) => (
        <a href={`/markets/${market.id}?view=${tab}`} className={activeTab === tab ? 'active' : ''} key={tab}>
          <span>{label}</span>
          <strong>{count}</strong>
        </a>
      ))}
    </nav>
  );
}

function MarketDetailRead({ market, initialPrompt, view }: { market: Market; initialPrompt?: string; view?: string }) {
  const read = buildMarketDecisionRead(market);
  const groups = sortBuyingGroups(read.groups, 'priority');
  const marketSignals = read.marketSignals;
  const moves = read.moves;
  const activeView = view || inferGeneratedView(initialPrompt, 'market-comparison');
  const activeTab = normalizeMarketDetailTab(view, initialPrompt);

  return (
    <section className="atlas-market-detail-read">
      {initialPrompt ? <p className="atlas-generated-prompt">Asked: “{initialPrompt}”</p> : null}
      <section className="atlas-market-read-summary">
        <article>
          <span>Watchout</span>
          <h3>{titleCaseText(market.topDrivers[0])}</h3>
          <p>{read.topWatchouts.slice(0, 2).join(' · ')}</p>
          <SourceTrustMini source={market.source} />
        </article>
        <article>
          <span>Open first</span>
          <h3>{groups[0]?.name ?? 'No buyer linked'}</h3>
          <p>{groups[0] ? buyerInterventionTrigger(groups[0]) : 'No active buying group is tied to this market in prototype data.'}</p>
          {groups[0] ? <a href={`/buying-groups/${groups[0].id}`}>Open buyer profile <ArrowRight size={13} /></a> : null}
        </article>
        <article>
          <span>Next view</span>
          <h3>{activeView === 'money-at-risk' ? 'Financial exposure' : activeView === 'signal-impact' ? 'Signals' : 'Market comparison'}</h3>
          <p>{read.recommendedAction}</p>
          <a href={`/scenario-models?market=${market.id}`}>Open scenario model <ArrowRight size={13} /></a>
        </article>
      </section>

      <MarketDetailTabs
        activeTab={activeTab}
        market={market}
        metrics={{
          buyers: groups.length,
          competitors: moves.length,
          memory: read.marketDocuments.length + read.marketTimeline.length,
          signals: marketSignals.length
        }}
      />

      <section className="atlas-market-tab-panel">
        {activeTab === 'buyers' ? (
          <>
            <SectionTitle title="Buying groups in this market" />
            <BuyingGroupTriageQueue groups={groups} />
          </>
        ) : null}

        {activeTab === 'signals' ? (
          <>
            <SectionTitle title="Signals" />
            {marketSignals.length ? <SignalCards signals={marketSignals} /> : <EmptyGeneratedState label="Signals" />}
          </>
        ) : null}

        {activeTab === 'competitors' ? (
          <>
            <SectionTitle title="Competitor pressure" />
            {moves.length ? <CompetitorCards moves={moves} /> : <EmptyGeneratedState label="Competitors" />}
          </>
        ) : null}

        {activeTab === 'memory' ? (
          <>
            <MarketLoopPanel market={market} />
            <SavedGeneratedViewsShelf marketId={market.id} />
          </>
        ) : null}
      </section>
    </section>
  );
}

function MarketsView({
  initialGeneratedView,
  initialPrompt,
  initialSort,
  marketId
}: {
  initialGeneratedView?: string;
  initialPrompt?: string;
  initialSort?: string;
  marketId?: string;
}) {
  const market = marketId ? getMarket(marketId) : undefined;

  if (market) {
    return (
      <>
        <MarketStatePanel market={market} />
        <AtlasCommandSurface
          basePath={`/markets/${market.id}`}
          examples={[
            `Where is ${market.name} losing money?`,
            `Which buyers in ${market.name} need attention?`,
            `Show ${market.name} competitor pressure`
          ]}
          initialPrompt={initialPrompt}
          placeholder={`Ask for ${market.name} buyer risk, margin exposure, offset potential, or external pressure...`}
        />
        <MarketDetailRead initialPrompt={initialPrompt} market={market} view={initialGeneratedView} />
      </>
    );
  }

  const markets = filterMarketsForAsk(sortMarkets(packet.markets, initialSort), initialPrompt);

  return (
    <>
      <MarketsBriefingCanvas activeSort={initialSort} initialPrompt={initialPrompt} markets={markets} />
      <AtlasCommandSurface
        basePath="/markets"
        examples={[
          'Where am I losing money by market?',
          'Which market can absorb pressure?',
          'Show markets with high trade spend exposure'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for market pressure, offset potential, margin risk, or trade spend exposure..."
      />
    </>
  );
}

function BuyingGroupStatePanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const { buyingGroup } = workspace;
  const currentState = profileRead.currentState;
  const riskMovement = buyingGroup.riskLevel === 'critical' ? 0.7 : buyingGroup.riskLevel === 'high' ? 0.5 : buyingGroup.riskLevel === 'medium' ? 0.3 : 0.1;
  const buyerAskValue = Number.parseFloat(currentState.latestBuyerAsk);
  const pepsicoPositionValue = Number.parseFloat(currentState.pepsicoPosition);
  const positionGap = Number.isFinite(buyerAskValue) && Number.isFinite(pepsicoPositionValue)
    ? `${(buyerAskValue - pepsicoPositionValue).toFixed(1)} pts ask gap`
    : 'Gap not modeled';
  const kamSafePrompt = [
    `Create a KAM-safe negotiation guide for ${buyingGroup.name}.`,
    `Buying group: ${buyingGroup.name}.`,
    `Markets: ${workspace.markets.map((market) => market.name).join(', ')}.`,
    `Latest buyer ask: ${currentState.latestBuyerAsk}. PepsiCo position: ${currentState.pepsicoPosition}.`,
    'Audience: KAM field negotiator. Remove internal red lines, fallback thresholds, sensitive margin controls, confidence gaps, and unsupported claims.',
    'Include approved negotiation posture, likely buyer pressure, proof points to use, what to capture, escalation triggers, source/freshness/confidence, and CNO review notes.'
  ].join('\n');
  const headerMetrics = [
    {
      label: 'Latest buyer ask',
      movement: `+${riskMovement.toFixed(1)} pts vs last negotiation`,
      tone: 'risk',
      value: currentState.latestBuyerAsk
    },
    {
      label: 'PepsiCo position',
      movement: positionGap,
      tone: 'watch',
      value: currentState.pepsicoPosition
    },
    {
      label: 'Margin at risk',
      movement: `${pct(profileRead.exposure.expectedPriceRealization)} expected realization`,
      tone: buyingGroup.riskLevel === 'critical' || buyingGroup.riskLevel === 'high' ? 'risk' : 'neutral',
      value: euros(profileRead.exposure.marginAtRisk)
    },
    {
      label: 'Next milestone',
      movement: currentState.nextMilestone,
      tone: 'neutral',
      value: currentState.negotiationRound
    }
  ];
  const headline = `${buyingGroup.name}: ${currentState.latestBuyerAsk} ask, ${currentState.pepsicoPosition} current position, ${euros(profileRead.exposure.marginAtRisk)} margin at risk.`;

  return (
    <section className="atlas-buying-group-hero" id="group-overview">
      <div className="atlas-buyer-hero-nav">
        <a href="/buying-groups" aria-label="Back to buying groups">‹</a>
        <span>Back to buying groups</span>
      </div>
      <div className="atlas-buyer-top-actions">
        <a className="atlas-buyer-strategy-action" href={`/buying-groups/${buyingGroup.id}/strategy`}>
          Build strategy <ArrowRight size={14} />
        </a>
        <a className="atlas-buyer-kam-action" href={`/generated-views?prompt=${encodeURIComponent(kamSafePrompt)}&buyingGroupId=${buyingGroup.id}&mode=draft&editable=1`} rel="noreferrer" target="_blank">
          Create KAM safe report <ArrowRight size={14} />
        </a>
        <a className="atlas-buyer-live-action" href={`/negotiation/carrefour-france-2026-pricing/live?group=${buyingGroup.id}&deck=${encodeURIComponent(`${buyingGroup.name} 2026 prep documents`)}`}>
          Open live room <ArrowRight size={14} />
        </a>
      </div>
      <div className="atlas-buyer-hero-title">
        <span className={`atlas-buyer-risk-badge risk-${buyingGroup.riskLevel}`}>{buyingGroup.riskLevel} risk</span>
        <h2>{buyingGroup.name}</h2>
        <p>
          <span>Markets <strong>{workspace.markets.map((market) => market.name).join(' / ')}</strong></span>
          <span>Round <strong>{currentState.negotiationRound}</strong></span>
          <span>Stage <strong>{buyingGroup.negotiationStage}</strong></span>
        </p>
      </div>
      <div className="atlas-buyer-hero-summary">
        <h3>{headline}</h3>
        <dl>
          {headerMetrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                <strong>{metric.value}</strong>
                <em className={`movement-${metric.tone}`}>{metric.movement}</em>
              </dd>
            </div>
          ))}
        </dl>
        <div className="atlas-buyer-readiness-strip">
          <strong>Recommended next action: {workspace.sixtySecondRead.recommendedAction}</strong>
          <div>
            {workspace.readiness.reasons.slice(0, 2).map((reason) => <span key={reason}>{reason}</span>)}
          </div>
        </div>
        <div className="atlas-buyer-hero-source">
          {profileRead.updateCount ? <em>{profileRead.updateSummary}</em> : null}
          <SourceTrustMini source={profileRead.source} />
        </div>
      </div>
    </section>
  );
}

function BuyingGroupFinancialPanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const exposure = profileRead.exposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const financialSource = profileRead.source;
  const initialScenarioInputs = useMemo<ScenarioInputs>(() => ({
    buyerAcceptanceProbability: Math.max(35, Math.min(82, Math.round(72 - realizationGap * 14 - riskRank(workspace.buyingGroup.riskLevel) * 4))),
    competitorPressureLevel: workspace.competitorMoves.length ? 'medium' : 'low',
    concessionAmount: Math.max(0, Math.round(exposure.marginAtRisk * 0.08)),
    contractLengthMonths: 12,
    costInflationPercent: Math.max(1.8, Math.min(5.5, exposure.targetPriceRealization + 0.4)),
    expectedRealizationPercent: exposure.expectedPriceRealization,
    priceIncreasePercent: exposure.targetPriceRealization,
    tradeSpendChange: Math.max(0, exposure.tradeSpendExposure ?? Math.round(exposure.marginAtRisk * 0.12)),
    volumeChangePercent: exposure.volumeExposure ? Math.max(-5, Math.min(3, exposure.volumeExposure / exposure.revenueUnderNegotiation * 100)) : -1.2
  }), [exposure, realizationGap, workspace.buyingGroup.riskLevel, workspace.competitorMoves.length]);
  const [scenarioInputs, setScenarioInputs] = useState<ScenarioInputs>(initialScenarioInputs);
  const scenarioOutputs = useMemo(
    () => calculateScenarioOutputs(scenarioInputs, exposure.revenueUnderNegotiation),
    [exposure.revenueUnderNegotiation, scenarioInputs]
  );

  function updateScenarioInput<K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) {
    setScenarioInputs((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="atlas-buying-group-financials" id="group-financials">
      <header>
        <div>
          <span>Financial state</span>
          <h2>{euros(exposure.marginAtRisk)} margin at risk</h2>
          <p>{pct(realizationGap)} realization gap to plan across {workspace.markets.map((market) => market.name).join(', ')}.</p>
          <SourceTrustMini source={financialSource} />
        </div>
        <a href={`/financial-impact?buyingGroup=${workspace.buyingGroup.id}`}>Open financial impact <ArrowRight size={14} /></a>
      </header>
      <FinancialImpactStrip
        revenue={exposure.revenueUnderNegotiation}
        margin={exposure.marginAtRisk}
        volume={exposure.volumeExposure}
        trade={exposure.tradeSpendExposure}
      />
      <div className="atlas-group-financial-bars">
        {[
          ['Expected realization', exposure.expectedPriceRealization, exposure.targetPriceRealization],
          ['Target realization', exposure.targetPriceRealization, exposure.targetPriceRealization],
          ['Accepted realization', exposure.acceptedPriceRealization ?? exposure.expectedPriceRealization, exposure.targetPriceRealization]
        ].map(([label, value, target]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <i><b style={{ width: `${Math.min(100, Number(value) / Number(target) * 100)}%` }} /></i>
            <strong>{pct(Number(value))}</strong>
          </div>
        ))}
      </div>
      <BuyingGroupScenarioModeler
        buyingGroup={workspace.buyingGroup}
        inputs={scenarioInputs}
        onUpdateInput={updateScenarioInput}
        outputs={scenarioOutputs}
        source={financialSource}
      />
    </section>
  );
}

function BuyingGroupScenarioModeler({
  buyingGroup,
  inputs,
  onUpdateInput,
  outputs,
  source
}: {
  buyingGroup: BuyingGroup;
  inputs: ScenarioInputs;
  onUpdateInput: <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => void;
  outputs: ReturnType<typeof calculateScenarioOutputs>;
  source: SourceMeta;
}) {
  const [saveStatus, setSaveStatus] = useState('');
  const scenarioLevers: Array<{
    affects: string;
    key: keyof ScenarioInputs;
    label: string;
    max: number;
    min: number;
    step: number;
  }> = [
    { key: 'expectedRealizationPercent', label: 'Expected realization', min: 0, max: Math.max(5, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Price realization, gap to plan, margin' },
    { key: 'volumeChangePercent', label: 'Volume change', min: -5, max: 3, step: 0.1, affects: 'Volume, revenue, risk-adjusted value' },
    { key: 'tradeSpendChange', label: 'Trade spend change', min: 0, max: Math.max(1000000, inputs.tradeSpendChange * 1.5), step: 25000, affects: 'Trade spend, margin, buyer acceptance' },
    { key: 'concessionAmount', label: 'Concession amount', min: 0, max: Math.max(1000000, inputs.concessionAmount * 1.75), step: 25000, affects: 'Revenue, margin, gap to plan' },
    { key: 'buyerAcceptanceProbability', label: 'Buyer acceptance', min: 0, max: 100, step: 1, affects: 'Risk-adjusted value, approval confidence' }
  ];
  const needsReview = outputs.marginImpact < 0 || outputs.riskLevel === 'high' || inputs.buyerAcceptanceProbability < 50;
  const currentExposure = buyingGroup.financialExposure;
  const scenarioReadRows = [
    {
      current: pct(currentExposure.expectedPriceRealization),
      delta: euros(outputs.priceRealizationImpact),
      label: 'Price realization',
      modeled: pct(inputs.expectedRealizationPercent),
      tone: outputs.priceRealizationImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.marginAtRisk),
      delta: euros(outputs.marginImpact),
      label: 'Margin',
      modeled: outputs.marginImpact >= 0 ? 'Improves' : 'Pressured',
      tone: outputs.marginImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.volumeExposure),
      delta: euros(outputs.volumeImpact),
      label: 'Volume',
      modeled: `${inputs.volumeChangePercent.toFixed(1)}% move`,
      tone: outputs.volumeImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.tradeSpendExposure),
      delta: euros(outputs.tradeSpendImpact),
      label: 'Trade spend',
      modeled: euros(inputs.tradeSpendChange),
      tone: outputs.tradeSpendImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.gapToPlan),
      delta: euros(outputs.gapToPlanImpact),
      label: 'Gap to plan',
      modeled: outputs.gapToPlanImpact <= 0 ? 'Closes gap' : 'Gap remains',
      tone: outputs.gapToPlanImpact <= 0 ? 'positive' : 'negative'
    }
  ];
  const scenarioViewPrompt = `Create an editable scenario view for ${buyingGroup.name}: expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, margin impact ${euros(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`;

  function saveScenarioToHistory() {
    const now = new Date().toISOString();
    const prompt = `Saved scenario for ${buyingGroup.name}: expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, margin impact ${euros(outputs.marginImpact)}.`;
    saveStoredGeneratedView({
      artifactType: 'generated_view',
      audienceMode: 'internal_cno',
      buyingGroupId: buyingGroup.id,
      confidence: source.confidence,
      createdAt: now,
      id: `scenario-memory-${buyingGroup.id}-${Date.now().toString(36)}`,
      lifecycleState: 'attached',
      marketId: buyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt,
      revisionCount: 0,
      savedDestination: 'buyer_profile',
      savedToProfileAt: now,
      sourceDate: source.sourceDate,
      sourceDecision: needsReview
        ? 'Saved scenario output as buyer memory with review required because the move creates risk or approval dependency.'
        : 'Saved scenario output as buyer memory from the inline financial model.',
      sourceName: source.sourceName,
      summary: `${outputs.recommendation} Revenue ${euros(outputs.revenueImpact)}, margin ${euros(outputs.marginImpact)}, trade ${euros(outputs.tradeSpendImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
      title: `${buyingGroup.name} scenario: ${inputs.expectedRealizationPercent.toFixed(1)}% realization`,
      updatedAt: now
    });
    setSaveStatus(needsReview ? 'Saved to History with review trigger.' : 'Saved to History.');
  }

  return (
    <section className="atlas-buyer-scenario-model" aria-label={`${buyingGroup.name} scenario model`}>
      <header>
        <div>
          <span>Scenario model</span>
          <h3>Test the next pricing move for {buyingGroup.name}</h3>
          <p>Change a lever, then read the affected metrics before saving the scenario to this buyer history.</p>
        </div>
        <a href={`/scenario-models?buyingGroup=${buyingGroup.id}`}>Open full model <ArrowRight size={14} /></a>
      </header>
      <section className="atlas-buyer-scenario-impact-key" aria-label="Scenario affected metrics">
        {['Price realization', 'Margin', 'Volume', 'Trade spend', 'Gap to plan', 'Risk-adjusted value'].map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </section>
      <div className="atlas-buyer-scenario-grid">
        <div className="atlas-buyer-scenario-levers">
          {scenarioLevers.map(({ key, label, max, min, step }) => (
            <label className="atlas-buyer-scenario-lever" key={key}>
              <span>{label}</span>
              <strong>{key === 'tradeSpendChange' || key === 'concessionAmount' ? euros(Number(inputs[key])) : `${Number(inputs[key]).toFixed(key === 'buyerAcceptanceProbability' ? 0 : 1)}%`}</strong>
              <input
                max={max}
                min={min}
                onChange={(event) => onUpdateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])}
                onInput={(event) => onUpdateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])}
                step={step}
                type="range"
                value={Number(inputs[key])}
              />
            </label>
          ))}
          <label className="atlas-buyer-scenario-lever">
            <span>Competitor pressure</span>
            <select value={inputs.competitorPressureLevel} onChange={(event) => onUpdateInput('competitorPressureLevel', event.currentTarget.value as ScenarioInputs['competitorPressureLevel'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="atlas-buyer-scenario-results">
          <article className={`atlas-buyer-scenario-verdict risk-${outputs.riskLevel}`}>
            <span>Scenario read</span>
            <strong>{outputs.riskLevel} risk · {euros(outputs.riskAdjustedValue)} risk-adjusted value</strong>
            <p>{outputs.recommendation}</p>
          </article>
          <section className="atlas-buyer-scenario-read-table" aria-label="Current versus modeled scenario read">
            <header>
              <span>Metric</span>
              <span>Current</span>
              <span>Modeled</span>
              <span>Delta</span>
            </header>
            {scenarioReadRows.map((row) => (
              <div key={row.label}>
                <strong>{row.label}</strong>
                <span>{row.current}</span>
                <span>{row.modeled}</span>
                <em className={`tone-${row.tone}`}>{row.delta}</em>
              </div>
            ))}
          </section>
          <FinancialImpactStrip
            revenue={outputs.revenueImpact}
            margin={outputs.marginImpact}
            volume={outputs.volumeImpact}
            trade={outputs.tradeSpendImpact}
          />
          <div className="atlas-buyer-scenario-bars">
            {[
              ['Gap to plan', outputs.gapToPlanImpact],
              ['Price realization', outputs.priceRealizationImpact],
              ['Risk-adjusted value', outputs.riskAdjustedValue]
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <i className={Number(value) < 0 ? 'negative' : ''}><b style={{ width: `${Math.min(100, Math.max(10, Math.abs(Number(value)) / 12000))}%` }} /></i>
                <strong>{euros(Number(value))}</strong>
              </div>
            ))}
          </div>
          <SourceTrustMini source={source} />
          <div className="atlas-buyer-scenario-actions">
            <button type="button" onClick={saveScenarioToHistory}>Save scenario to buyer history</button>
            <a href={`/generated-views?prompt=${encodeURIComponent(scenarioViewPrompt)}&buyingGroupId=${buyingGroup.id}&mode=draft&editable=1`} rel="noreferrer" target="_blank">Open editable scenario view <ArrowRight size={13} /></a>
            {saveStatus ? <span>{saveStatus}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type BuyingGroupGeneratedView = 'snapshot' | 'financials' | 'memory' | 'intelligence' | 'live' | 'custom';

function inferBuyingGroupView(prompt: string): BuyingGroupGeneratedView {
  const normalized = prompt.toLowerCase();
  if (/financial|margin|revenue|gap|price|realization|volume|trade|model|scenario/.test(normalized)) return 'financials';
  if (/memory|history|timeline|debrief|last year|prior|respond|reaction|meeting|document|source|prep|deck|file|evidence|validation|proof/.test(normalized)) return 'memory';
  if (/signal|news|competitor|private label|market|pressure|changed/.test(normalized)) return 'snapshot';
  if (/live|room|negotiator|meeting|listen|call/.test(normalized)) return 'live';
  return 'snapshot';
}

function labelForBuyingGroupView(view: BuyingGroupGeneratedView) {
  if (view === 'snapshot' || view === 'intelligence') return 'Overview';
  if (view === 'financials') return 'Financials';
  if (view === 'memory') return 'History';
  if (view === 'live') return 'Live room';
  return 'Custom report';
}

function EmptyGeneratedState({ label }: { label: string }) {
  return (
    <article className="atlas-generated-empty">
      <span>{label}</span>
      <h3>No matching records in the prototype data.</h3>
      <p>Ask ATLAS or add a source document to expand this buyer read.</p>
    </article>
  );
}

function BuyingGroupSnapshotGrid({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const latestEvent = workspace.timelineEvents[0];
  const exposure = profileRead.exposure;
  const competitorPressure = workspace.competitorMoves[0];
  const financialSource = profileRead.source;

  const snapshots = [
    {
      label: 'Financial',
      title: `${euros(exposure.marginAtRisk)} margin at risk`,
      body: `${pct(exposure.expectedPriceRealization)} vs ${pct(exposure.targetPriceRealization)} target`,
      action: 'Open financial view',
      source: financialSource,
      view: 'financials' as BuyingGroupGeneratedView
    },
    {
      label: 'Memory',
      title: latestEvent?.title ?? 'No memory event yet',
      body: latestEvent ? 'Latest event captured' : 'No recent event',
      action: 'Open memory',
      source: latestEvent?.source ?? workspace.buyingGroup.source,
      view: 'memory' as BuyingGroupGeneratedView
    },
    {
      label: 'Pressure',
      title: competitorPressure ? competitorPressure.title : 'No competitor pressure linked',
      body: competitorPressure ? competitorPressure.competitor : 'No linked move',
      action: 'Open overview',
      source: competitorPressure?.source ?? workspace.buyingGroup.source,
      view: 'snapshot' as BuyingGroupGeneratedView
    },
    {
      label: 'History',
      title: `${workspace.timelineEvents.length} events / ${workspace.documents.length} docs`,
      body: 'Timeline, debriefs and supporting files',
      action: 'Open history',
      source: workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      view: 'memory' as BuyingGroupGeneratedView
    }
  ];

  return (
    <section className="atlas-snapshot-grid" aria-label="Buying group snapshots">
      {snapshots.map((snapshot) => (
        <a href={`/buying-groups/${workspace.buyingGroup.id}?view=${snapshot.view}`} key={snapshot.label}>
          <span>{snapshot.label}</span>
          <strong>{snapshot.title}</strong>
          <p>{snapshot.body}</p>
          <SourceTrustMini source={snapshot.source} />
          <em>{snapshot.action}</em>
        </a>
      ))}
    </section>
  );
}

function BuyingGroupPhaseControl({
  activePhase,
  buyingGroupId,
  view
}: {
  activePhase: string;
  buyingGroupId: string;
  view: BuyingGroupGeneratedView;
}) {
  const phases = [
    ['monitor', 'Monitor'],
    ['prep', 'Prep'],
    ['active', 'Active room'],
    ['review', 'Review'],
    ['debrief', 'Debrief memory']
  ];

  return (
    <nav className="atlas-phase-control" aria-label="Buying group phase focus">
      {phases.map(([phase, label]) => (
        <a href={`/buying-groups/${buyingGroupId}?view=${view}&phase=${phase}`} key={phase} className={activePhase === phase ? 'active' : ''}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function BuyingGroupCustomReport({
  prompt,
  profileRead,
  workspace
}: {
  prompt: string;
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const normalized = prompt.toLowerCase();
  const exposure = profileRead.exposure;
  const primarySignal = workspace.signals[0];
  const primaryDocument = workspace.documents[0];
  const latestEvent = workspace.timelineEvents[0];
  const reportMode = /history|timeline|debrief|prior|respond|reaction/.test(normalized)
    ? 'buyer history'
    : /document|source|prep|deck|file|proof/.test(normalized)
      ? 'source review'
      : /signal|news|competitor|private label|market|changed/.test(normalized)
        ? 'market signal read'
        : /live|room|meeting|call/.test(normalized)
          ? 'live preparation'
          : 'financial readout';

  return (
    <section className="atlas-custom-report-tab" aria-label="Custom report">
      <article className="atlas-custom-report-hero">
        <div>
          <span>Created view</span>
          <h3>{labelForBuyingGroupView('custom')}: {reportMode}</h3>
          <p>{prompt}</p>
        </div>
        <button type="button" className="atlas-custom-report-download" onClick={() => window.print()}>
          <Download size={14} />
          Download report
        </button>
      </article>
      <section className="atlas-custom-report-grid">
        <article>
          <h4>{workspace.buyingGroup.name} is still a financially material watch item.</h4>
          <p>{euros(exposure.marginAtRisk)} margin remains at risk, with expected realization at {pct(exposure.expectedPriceRealization)} versus {pct(exposure.targetPriceRealization)} target.</p>
        </article>
        <article>
          <span>What changed</span>
          <h4>{primarySignal?.title ?? latestEvent?.title ?? 'No new external change linked'}</h4>
          <p>{primarySignal?.negotiationImplication ?? latestEvent?.summary ?? 'Use the source tray to add new buyer-specific context.'}</p>
        </article>
        <article>
          <span>Recommended view</span>
          <h4>{reportMode === 'financial readout' ? 'Open Financials next' : reportMode === 'source review' ? 'Open History next' : reportMode === 'live preparation' ? 'Open Live room next' : 'Open History next'}</h4>
          <p>{profileRead.currentState.nextMilestone}</p>
        </article>
      </section>
      <section className="atlas-custom-report-proof">
        <div>
          <span>Source used</span>
          <h4>{primaryDocument?.title ?? profileRead.source.sourceName}</h4>
          <SourceTrustMini source={primaryDocument?.source ?? profileRead.source} />
        </div>
        <a href={`/generated-views?prompt=${encodeURIComponent(`Create a buyer profile report for ${workspace.buyingGroup.name}: ${prompt}`)}&buyingGroupId=${workspace.buyingGroup.id}&mode=draft&editable=1`} rel="noreferrer" target="_blank">Open editable view <ArrowRight size={14} /></a>
      </section>
    </section>
  );
}

function publicSignalHref(title: string, source?: SourceMeta) {
  if (source?.url) return source.url;
  return `https://news.google.com/search?q=${encodeURIComponent(title)}`;
}

function BuyingGroupOverviewPanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const exposure = profileRead.exposure;
  const latestEvent = workspace.timelineEvents[0];
  const topSignal = workspace.signals[0];
  const signals = workspace.signals.slice(0, 2);
  const competitorMoves = workspace.competitorMoves.slice(0, 1);
  const primaryAction = topSignal?.recommendedAction ?? profileRead.currentState.nextMilestone;

  return (
    <section className="atlas-buyer-overview-panel" aria-label={`${workspace.buyingGroup.name} overview`}>
      <article className="atlas-buyer-room-read">
        <h3>{workspace.buyingGroup.name} will likely walk in anchoring on affordability pressure and proof gaps.</h3>
        <div className="atlas-buyer-room-metrics">
          <span><strong>{profileRead.currentState.latestBuyerAsk}</strong> buyer ask</span>
          <span><strong>{profileRead.currentState.pepsicoPosition}</strong> PepsiCo position</span>
          <span><strong>{euros(exposure.marginAtRisk)}</strong> margin at risk</span>
        </div>
        <p>{topSignal?.negotiationImplication ?? latestEvent?.summary ?? profileRead.currentState.nextMilestone}</p>
        <div className="atlas-buyer-next-answer">
          <strong>Recommended next action</strong>
          <span>{primaryAction}</span>
          <a href={`/buying-groups/${workspace.buyingGroup.id}?view=financials`}>Open financials <ArrowRight size={13} /></a>
        </div>
        <SourceTrustMini source={topSignal?.source ?? latestEvent?.source ?? profileRead.source} />
      </article>

      <section className="atlas-buyer-market-read">
        <header>
          <div>
            <h3>Market and world signals</h3>
          </div>
          <a href={`/signals?buyingGroup=${workspace.buyingGroup.id}`}>All signals <ArrowRight size={14} /></a>
        </header>
        <div className="atlas-buyer-signal-list">
          {signals.length ? signals.map((signal) => (
            <article key={signal.id}>
              <div>
                <span>{signal.signalType.replaceAll('_', ' ')}</span>
                <h4>{signal.title}</h4>
                <p>{signal.negotiationImplication}</p>
              </div>
              <div className="atlas-buyer-signal-impact">
                <strong>{euros(signal.estimatedMarginImpact ?? 0)}</strong>
                <span>margin implication</span>
              </div>
              <SourceTrustMini source={signal.source} />
              <a href={publicSignalHref(signal.title, signal.source)} rel="noreferrer" target="_blank">Open public source <ArrowRight size={13} /></a>
            </article>
          )) : <EmptyGeneratedState label="Market signals" />}
        </div>
      </section>

      {competitorMoves.length ? (
        <section className="atlas-buyer-market-read compact">
          <header>
            <div>
              <h3>Buyer leverage to expect</h3>
            </div>
          </header>
          <div className="atlas-buyer-signal-list compact">
            {competitorMoves.map((move) => (
              <article key={move.id}>
                <div>
                  <span>{move.competitor}</span>
                  <h4>{move.title}</h4>
                  <p>{move.possibleBuyerLeverage}</p>
                </div>
                <div className="atlas-buyer-signal-impact">
                  <strong>{euros(move.estimatedMarginImpact ?? 0)}</strong>
                  <span>margin implication</span>
                </div>
                <SourceTrustMini source={move.source} />
                <a href={publicSignalHref(move.title, move.source)} rel="noreferrer" target="_blank">Open public source <ArrowRight size={13} /></a>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function BuyingGroupGeneratedPanel({
  onAddProfileUpdate,
  profileRead,
  prompt,
  profileUpdates,
  view,
  workspace
}: {
  onAddProfileUpdate: (update: BuyerProfileDocumentUpdate) => void;
  profileRead: BuyerProfileRead;
  prompt?: string;
  profileUpdates: BuyerProfileDocumentUpdate[];
  view: BuyingGroupGeneratedView;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const savedViews = useStoredGeneratedViews({ buyingGroupId: workspace.buyingGroup.id });
  return (
    <section className="atlas-generated-panel">
      {view === 'snapshot' ? (
        <BuyingGroupOverviewPanel profileRead={profileRead} workspace={workspace} />
      ) : null}

      {view === 'financials' ? <BuyingGroupFinancialPanel profileRead={profileRead} workspace={workspace} /> : null}

      {view === 'memory' ? (
        <section className="atlas-generated-memory" id="group-timeline">
          <BuyerProfileUpdatePanel buyingGroup={workspace.buyingGroup} onAddUpdate={onAddProfileUpdate} updates={profileUpdates} />
          <ConfirmedProfileImpactStrip updates={profileUpdates} />
          <section className="atlas-history-source-grid">
            <div>
              <SectionTitle title="Negotiation timeline" />
              {workspace.timelineEvents.length || workspace.documents.length || profileUpdates.length || savedViews.length ? (
                <TimelineFeed documents={workspace.documents} events={workspace.timelineEvents} generatedViews={savedViews} updates={profileUpdates} />
              ) : <EmptyGeneratedState label="History" />}
            </div>
            <div>
              <SectionTitle title="Stored documents" />
              <SupportingDocumentLedger buyingGroupId={workspace.buyingGroup.id} documents={workspace.documents} generatedViews={savedViews} updates={profileUpdates} />
              <SavedGeneratedViewsShelf buyingGroupId={workspace.buyingGroup.id} />
            </div>
          </section>
        </section>
      ) : null}

      {view === 'live' ? (
        <article className="atlas-live-entry-panel">
          <span>Prepare / Live</span>
          <h3>Start the live agent with this buying-group memory loaded.</h3>
          <p>ATLAS will generate data views during the room and save the final debrief back into this buyer profile.</p>
          <a href={`/negotiation/carrefour-france-2026-pricing/live?group=${workspace.buyingGroup.id}&deck=${encodeURIComponent(`${workspace.buyingGroup.name} 2026 prep documents`)}`}>Start Live Negotiator <ArrowRight size={14} /></a>
        </article>
      ) : null}

      {view === 'custom' ? (
        <BuyingGroupCustomReport prompt={prompt || `Create a focused read for ${workspace.buyingGroup.name}.`} profileRead={profileRead} workspace={workspace} />
      ) : null}
    </section>
  );
}

function normalizeGeneratedView(view?: string): BuyingGroupGeneratedView {
  if (view === 'documents' || view === 'memory') return 'memory';
  if (view === 'intelligence' || view === 'overview') return 'snapshot';
  if (view === 'financials' || view === 'live' || view === 'custom') return view;
  return 'snapshot';
}

function normalizePhase(phase?: string, fallback = 'monitor') {
  if (phase === 'monitor' || phase === 'prep' || phase === 'active' || phase === 'review' || phase === 'debrief') return phase;
  return fallback;
}

function BuyingGroupWorkspaceTabs({
  activeView,
  customPrompt,
  onSelectView,
  workspace
}: {
  activeView: BuyingGroupGeneratedView;
  customPrompt: string;
  onSelectView: (view: BuyingGroupGeneratedView) => void;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const baseTabs: BuyingGroupGeneratedView[] = ['snapshot', 'financials', 'memory'];
  const tabs = customPrompt ? [...baseTabs, 'custom' as BuyingGroupGeneratedView] : baseTabs;

  return (
    <nav className="atlas-buyer-workspace-tabs" aria-label={`${workspace.buyingGroup.name} analysis views`}>
      {tabs.map((view) => (
        <button
          className={activeView === view ? 'active' : ''}
          key={view}
          onClick={() => onSelectView(view)}
          type="button"
        >
          {labelForBuyingGroupView(view)}
        </button>
      ))}
    </nav>
  );
}

function BuyingGroupGenerativeWorkspace({
  initialPhase,
  initialPrompt,
  initialView,
  onAddProfileUpdate,
  profileRead,
  profileUpdates,
  workspace
}: {
  initialPhase?: string;
  initialPrompt?: string;
  initialView?: string;
  onAddProfileUpdate: (update: BuyerProfileDocumentUpdate) => void;
  profileRead: BuyerProfileRead;
  profileUpdates: BuyerProfileDocumentUpdate[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const defaultPhase = workspace.buyingGroup.negotiationStage === 'active' ? 'active' : workspace.buyingGroup.negotiationStage === 'prep' ? 'prep' : 'monitor';
  const derivedView = normalizeGeneratedView(initialView);
  const [activeView, setActiveView] = useState<BuyingGroupGeneratedView>(derivedView);
  const activePhase = normalizePhase(initialPhase, defaultPhase);
  const [customPrompt, setCustomPrompt] = useState(initialView === 'custom' ? initialPrompt ?? '' : '');

  function selectView(view: BuyingGroupGeneratedView) {
    setActiveView(view);
    const askParam = view === 'custom' && customPrompt ? `&ask=${encodeURIComponent(customPrompt)}` : '';
    window.history.replaceState(null, '', `/buying-groups/${workspace.buyingGroup.id}?view=${view}&phase=${activePhase}${askParam}`);
  }

  return (
    <section className="atlas-generative-buying-group">
      <BuyingGroupWorkspaceTabs activeView={activeView} customPrompt={customPrompt} onSelectView={selectView} workspace={workspace} />

      <BuyingGroupGeneratedPanel
        onAddProfileUpdate={onAddProfileUpdate}
        profileRead={profileRead}
        profileUpdates={profileUpdates}
        prompt={customPrompt}
        view={activeView}
        workspace={workspace}
      />
    </section>
  );
}

function BuyingGroupWorkspaceView({
  buyingGroupId,
  initialPhase,
  initialPrompt,
  initialView
}: {
  buyingGroupId: string;
  initialPhase?: string;
  initialPrompt?: string;
  initialView?: string;
}) {
  const workspace = buildBuyingGroupWorkspacePacket(buyingGroupId);
  const [updates, setUpdates] = useState<BuyerProfileDocumentUpdate[]>([]);
  if (!workspace) {
    return (
      <PageBrief
        eyebrow="Buying Group"
        title="Buying group not found."
        body="ATLAS could not find this buying group in the synthetic Europe intelligence packet."
        action="Recommended action: return to all buying groups."
      />
    );
  }
  const profileRead = buildBuyerProfileRead(workspace, updates);

  return (
    <>
      <BuyingGroupStatePanel profileRead={profileRead} workspace={workspace} />
      <BuyingGroupGenerativeWorkspace
        initialPhase={initialPhase}
        initialPrompt={initialPrompt}
        initialView={initialView}
        onAddProfileUpdate={(update) => setUpdates((current) => [update, ...current])}
        profileRead={profileRead}
        profileUpdates={updates}
        workspace={workspace}
      />
      <AtlasCommandSurface
        basePath={`/buying-groups/${workspace.buyingGroup.id}`}
        examples={[
          `Show me ${workspace.buyingGroup.name} financial exposure`,
          `Pull ${workspace.buyingGroup.name} buyer history`,
          `Create a ${workspace.buyingGroup.name} prep report`
        ]}
        initialPrompt={initialPrompt}
        placeholder={`Ask ATLAS about ${workspace.buyingGroup.name}, its numbers, history, documents, or room reports...`}
      />
    </>
  );
}

function buyerRoundLabel(group: BuyingGroup) {
  if (group.negotiationStage === 'closed') return 'Closed cycle';
  if (group.negotiationStage === 'prep') return 'Prep / round 0';
  if (group.negotiationStage === 'paused') return 'Paused / round 6';
  if (group.riskLevel === 'critical') return 'Round 15';
  if (group.riskLevel === 'high') return 'Round 9';
  if (group.riskLevel === 'medium') return 'Round 5';
  return 'Monitoring';
}

function buyerInterventionTrigger(group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const latestSignal = signalsFor({ buyingGroupId: group.id })[0];
  const competitor = competitorMovesFor({ buyingGroupId: group.id })[0];

  if (group.riskLevel === 'critical') return 'CNO intervention likely needed';
  if (realizationGap >= 0.7) return `${pct(realizationGap)} below target realization`;
  if (competitor) return `${competitor.competitor} gives buyer leverage`;
  if (latestSignal) return latestSignal.title;
  return 'Monitor for movement';
}

function filterBuyingGroupsForAsk(groups: BuyingGroup[], ask?: string, view?: string) {
  const normalized = (ask ?? '').toLowerCase();
  if (/below target|target|realization|gap/.test(normalized)) {
    return groups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);
  }
  if (/intervention|step in|high-risk|high risk|critical|round|stuck|15/.test(normalized)) {
    return groups.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high' || buyerRoundLabel(group).includes('15'));
  }
  return groups;
}

function BuyingGroupFocusFilters({ activeView }: { activeView: string }) {
  const filters = [
    ['Needs intervention', '/buying-groups?ask=Which%20buying%20groups%20need%20CNO%20intervention%3F&view=buyer-ranking'],
    ['Below target', '/buying-groups?ask=Show%20groups%20below%20target%20realization&view=buyer-ranking'],
    ['Late rounds', '/buying-groups?ask=Show%20buyers%20stuck%20after%2010%20rounds&view=buyer-ranking'],
    ['External pressure', '/buying-groups?ask=Show%20buyers%20with%20competitor%20or%20external%20pressure&view=competitor-impact']
  ];

  return (
    <nav className="atlas-buyer-focus-filters" aria-label="Buying group focus filters">
      {filters.map(([label, href]) => (
        <a className={activeView === 'competitor-impact' && label === 'External pressure' ? 'active' : ''} href={href} key={label}>{label}</a>
      ))}
    </nav>
  );
}

function sortBuyingGroups(groups: BuyingGroup[], sort?: string) {
  const selected = sort || 'priority';
  return [...groups].sort((a, b) => {
    if (selected === 'margin') return b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk;
    if (selected === 'revenue') return b.financialExposure.revenueUnderNegotiation - a.financialExposure.revenueUnderNegotiation;
    if (selected === 'gap') {
      const gapA = a.financialExposure.targetPriceRealization - a.financialExposure.expectedPriceRealization;
      const gapB = b.financialExposure.targetPriceRealization - b.financialExposure.expectedPriceRealization;
      return gapB - gapA;
    }
    if (selected === 'round') return Number(buyerRoundLabel(b).match(/\d+/)?.[0] ?? 0) - Number(buyerRoundLabel(a).match(/\d+/)?.[0] ?? 0);
    return riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk;
  });
}

function BuyingGroupSortBar() {
  const topGroup = packet.topExposureBuyingGroups[0] ?? packet.buyingGroups[0];
  const realizationGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;

  return (
    <section className="atlas-buyer-list-head">
      <div>
        <span className={`atlas-market-readiness-pill readiness-${topGroup.riskLevel === 'critical' ? 'escalation_needed' : 'needs_review'}`}>
          {topGroup.riskLevel === 'critical' ? 'Escalation needed' : 'Needs review'}
        </span>
        <h1>{topGroup.name} needs focus: {euros(topGroup.financialExposure.marginAtRisk)} margin at risk across {buyerRoundLabel(topGroup).toLowerCase()}.</h1>
        <p>Recommended action: open {topGroup.name}, review the {pct(realizationGap)} target gap, then model the next concession before CNO intervention.</p>
        <div className="atlas-buyer-list-actions">
          <a href={`/buying-groups/${topGroup.id}`}>Open {topGroup.name} <ArrowRight size={14} /></a>
          <a href={`/scenario-models?buyingGroup=${topGroup.id}`}>Model exposure</a>
        </div>
      </div>
      <dl>
        <div><dt>Revenue in play</dt><dd>{euros(packet.summary.revenueUnderNegotiation)}</dd></div>
        <div><dt>Margin at risk</dt><dd>{euros(packet.summary.marginAtRisk)}</dd></div>
        <div><dt>High-risk groups</dt><dd>{packet.summary.highRiskBuyingGroups}</dd></div>
        <div><dt>Top target gap</dt><dd>{pct(realizationGap)}</dd></div>
        <div><dt>Active groups</dt><dd>{packet.summary.activeBuyingGroups}</dd></div>
      </dl>
    </section>
  );
}

function buyerMetricTone(metric: 'gap' | 'margin' | 'realization' | 'round', group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const roundNumber = Number(buyerRoundLabel(group).match(/\d+/)?.[0] ?? 0);

  if (metric === 'margin') {
    if (exposure.marginAtRisk >= 4_000_000) return 'critical';
    if (exposure.marginAtRisk >= 2_500_000) return 'warning';
    return 'good';
  }
  if (metric === 'gap') {
    if (realizationGap >= 0.8) return 'critical';
    if (realizationGap >= 0.4) return 'warning';
    return 'good';
  }
  if (metric === 'realization') {
    if (exposure.expectedPriceRealization < exposure.targetPriceRealization - 0.8) return 'critical';
    if (exposure.expectedPriceRealization < exposure.targetPriceRealization - 0.4) return 'warning';
    return 'good';
  }
  if (roundNumber >= 10) return 'critical';
  if (roundNumber >= 6) return 'warning';
  return 'good';
}

function BuyingGroupTriageCard({ group, rank }: { group: BuyingGroup; rank: number }) {
  const exposure = group.financialExposure;
  const markets = group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ');
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;

  return (
    <a href={`/buying-groups/${group.id}`} className={`atlas-buyer-triage-card ${classNameForRisk(group.riskLevel)}`}>
      <div className="atlas-buyer-triage-main">
        <header>
          <span>#{rank} / {group.riskLevel} risk</span>
          <h3>{group.name}</h3>
          <p>{markets} · {group.categories.join(', ')}</p>
        </header>
        <dl className="atlas-buyer-triage-state">
          <div className={`metric-${buyerMetricTone('round', group)}`}><dt>Stage</dt><dd>{buyerRoundLabel(group)} · {group.negotiationStage}</dd></div>
          <div><dt>Open first because</dt><dd>{buyerInterventionTrigger(group)}</dd></div>
        </dl>
      </div>
      <section className="atlas-buyer-triage-metrics" aria-label={`${group.name} financial exposure`}>
        <div className={`metric-${buyerMetricTone('margin', group)}`}>
          <span>Margin risk</span>
          <strong>{euros(exposure.marginAtRisk)}</strong>
        </div>
        <div className={`metric-${buyerMetricTone('gap', group)}`}>
          <span>Gap to target</span>
          <strong>{pct(realizationGap)}</strong>
        </div>
        <div>
          <span>Revenue in play</span>
          <strong>{euros(exposure.revenueUnderNegotiation)}</strong>
        </div>
        <div className={`metric-${buyerMetricTone('realization', group)}`}>
          <span>Expected / target</span>
          <strong>{pct(exposure.expectedPriceRealization)} / {pct(exposure.targetPriceRealization)}</strong>
        </div>
      </section>
    </a>
  );
}

function BuyingGroupTriageQueue({ groups }: { groups: BuyingGroup[] }) {
  if (!groups.length) return <EmptyGeneratedState label="Buying groups" />;
  return (
    <section className="atlas-buyer-triage-queue" aria-label="Prioritized buying group triage queue">
      {groups.map((group, index) => <BuyingGroupTriageCard group={group} key={group.id} rank={index + 1} />)}
    </section>
  );
}

function BuyingGroupsView({
  buyingGroupId,
  initialPhase,
  initialPrompt,
  initialSort,
  initialView
}: {
  buyingGroupId?: string;
  initialPhase?: string;
  initialPrompt?: string;
  initialSort?: string;
  initialView?: string;
}) {
  if (buyingGroupId) {
    return (
      <BuyingGroupWorkspaceView
        buyingGroupId={buyingGroupId}
        initialPhase={initialPhase}
        initialPrompt={initialPrompt}
        initialView={initialView}
      />
    );
  }

  const groups = sortBuyingGroups(packet.buyingGroups, initialSort);
  const generatedView = initialView || inferGeneratedView(initialPrompt, 'buyer-ranking');
  const visibleGroups = filterBuyingGroupsForAsk(groups, initialPrompt, generatedView);
  return (
    <>
      <BuyingGroupSortBar />
      <AtlasCommandSurface
        basePath="/buying-groups"
        examples={[
          'Which buying groups need CNO intervention?',
          'Show groups below target realization',
          'Show buyers with external pressure'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for high-risk groups, long negotiation rounds, target gaps, or external pressure..."
      />
      <section className="atlas-buyer-list-shell">
        <BuyingGroupTriageQueue groups={visibleGroups} />
      </section>
    </>
  );
}

function FinancialImpactView({ initialPrompt: _initialPrompt }: { initialGeneratedView?: string; initialPrompt?: string }) {
  return <PepsiCoImpactWorkspace />;
}

function scenarioInputsForBuyingGroup(group?: BuyingGroup): ScenarioInputs {
  const exposure = group?.financialExposure;
  if (!group || !exposure) return packet.scenarioModels[0].inputs;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  return {
    buyerAcceptanceProbability: Math.max(35, Math.min(82, Math.round(72 - realizationGap * 14 - riskRank(group.riskLevel) * 4))),
    competitorPressureLevel: group.competitorMoves.length ? 'medium' : 'low',
    concessionAmount: Math.max(0, Math.round(exposure.marginAtRisk * 0.08)),
    contractLengthMonths: 12,
    costInflationPercent: Math.max(1.8, Math.min(5.5, exposure.targetPriceRealization + 0.4)),
    expectedRealizationPercent: exposure.expectedPriceRealization,
    priceIncreasePercent: exposure.targetPriceRealization,
    tradeSpendChange: Math.max(0, exposure.tradeSpendExposure ?? Math.round(exposure.marginAtRisk * 0.12)),
    volumeChangePercent: exposure.volumeExposure ? Math.max(-5, Math.min(3, exposure.volumeExposure / exposure.revenueUnderNegotiation * 100)) : -1.2
  };
}

function scenarioInputsForMarket(market?: Market): ScenarioInputs {
  if (!market) return packet.scenarioModels[0].inputs;
  const expectedRealizationPercent = Math.max(1.4, Math.min(3.4, 3.4 - riskRank(market.pressureLevel) * 0.32));
  return {
    buyerAcceptanceProbability: Math.max(38, Math.min(78, 72 - riskRank(market.pressureLevel) * 8)),
    competitorPressureLevel: market.pressureLevel === 'critical' ? 'high' : market.pressureLevel === 'high' ? 'medium' : 'low',
    concessionAmount: Math.round(market.marginAtRisk * 0.16),
    contractLengthMonths: 12,
    costInflationPercent: market.pressureLevel === 'critical' ? 3.9 : market.pressureLevel === 'high' ? 3.4 : 2.7,
    expectedRealizationPercent,
    priceIncreasePercent: Math.max(expectedRealizationPercent + 0.5, 3.2),
    tradeSpendChange: Math.round(market.tradeSpendExposure * 0.12),
    volumeChangePercent: Math.max(-5, Math.min(2.5, market.gapToPlan / market.revenueUnderNegotiation * -100))
  };
}

type ScenarioFocus = 'full' | 'price' | 'risk' | 'trade' | 'volume';

function normalizeScenarioFocus(view?: string, prompt?: string): ScenarioFocus {
  const normalized = `${view ?? ''} ${prompt ?? ''}`.toLowerCase();
  if (/trade|promo|spend|investment/.test(normalized)) return 'trade';
  if (/volume|recovery|cases|unit/.test(normalized)) return 'volume';
  if (/risk|acceptance|probability|competitor|pressure/.test(normalized)) return 'risk';
  if (/price|realization|target|red line|ask|counter/.test(normalized)) return 'price';
  return 'full';
}

function scenarioFocusLabel(focus: ScenarioFocus) {
  if (focus === 'price') return 'Price realization';
  if (focus === 'trade') return 'Trade spend';
  if (focus === 'volume') return 'Volume recovery';
  if (focus === 'risk') return 'Buyer risk';
  return 'Full financial model';
}

function ScenarioModelsView({
  buyingGroupId,
  marketId
}: {
  buyingGroupId?: string;
  initialPrompt?: string;
  initialView?: string;
  marketId?: string;
}) {
  const defaultScenario = packet.scenarioModels[0];
  const attachedBuyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
  const attachedMarkets = attachedBuyingGroup?.primaryMarkets.map((id) => getMarket(id)).filter((market): market is Market => Boolean(market)) ?? [];
  const requestedMarket = marketId ? getMarket(marketId) : undefined;
  const selectedMarket = requestedMarket && (!attachedBuyingGroup || attachedBuyingGroup.primaryMarkets.includes(requestedMarket.id))
    ? requestedMarket
    : undefined;
  const attachedMarket = !attachedBuyingGroup ? selectedMarket : undefined;
  const initialInputs = useMemo(() => attachedBuyingGroup ? scenarioInputsForBuyingGroup(attachedBuyingGroup) : scenarioInputsForMarket(attachedMarket), [attachedBuyingGroup, attachedMarket]);
  const baseRevenue = attachedBuyingGroup?.financialExposure.revenueUnderNegotiation ?? attachedMarket?.revenueUnderNegotiation ?? 22000000;
  const scenarioSource = attachedBuyingGroup?.source ?? attachedMarket?.source ?? packet.documents.find((document) => document.id === defaultScenario.sourceIds[0])?.source ?? packet.markets[0].source;
  const [inputs, setInputs] = useState<ScenarioInputs>(initialInputs);
  const [scenarioSaveStatus, setScenarioSaveStatus] = useState('');
  const outputs = useMemo(() => calculateScenarioOutputs(inputs, baseRevenue), [baseRevenue, inputs]);
  const scenarioOwnerName = attachedBuyingGroup?.name ?? attachedMarket?.name ?? 'Europe';
  const scenarioScopeName = attachedBuyingGroup && selectedMarket
    ? `${attachedBuyingGroup.name} · ${selectedMarket.name}`
    : scenarioOwnerName;
  const selectedMarketId = selectedMarket?.id ?? '';
  const selectedBuyingGroupId = attachedBuyingGroup?.id ?? '';
  const marketOptions = attachedBuyingGroup ? attachedMarkets : packet.markets;
  const marketScopedBuyingGroups = selectedMarket
    ? packet.buyingGroups.filter((group) => group.primaryMarkets.includes(selectedMarket.id))
    : packet.buyingGroups;
  function scenarioHref({ buyer = selectedBuyingGroupId, market = selectedMarketId }: { buyer?: string; market?: string } = {}) {
    const params = new URLSearchParams();
    if (market) params.set('market', market);
    if (buyer) params.set('buyingGroup', buyer);
    const query = params.toString();
    return query ? `/scenario-models?${query}` : '/scenario-models';
  }

  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  function updateInput<K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
  }
  const scenarioControlRows: Array<{ affects: string; key: keyof ScenarioInputs; label: string; max: number; min: number; step: number }> = [
    { key: 'priceIncreasePercent', label: 'Price increase %', min: 0, max: Math.max(6, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Target ask, acceptance, revenue' },
    { key: 'expectedRealizationPercent', label: 'Expected realization %', min: 0, max: Math.max(5, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Gap to plan, margin, risk value' },
    { key: 'volumeChangePercent', label: 'Volume change %', min: -5, max: 3, step: 0.1, affects: 'Volume, revenue, buyer risk' },
    { key: 'tradeSpendChange', label: 'Trade spend change EUR', min: 0, max: Math.max(1000000, inputs.tradeSpendChange * 1.5), step: 25000, affects: 'Trade spend, margin, acceptance' },
    { key: 'concessionAmount', label: 'Concession amount EUR', min: 0, max: Math.max(1000000, inputs.concessionAmount * 1.75), step: 25000, affects: 'Revenue leakage, guardrail pressure' },
    { key: 'costInflationPercent', label: 'Cost inflation %', min: 0, max: Math.max(6, inputs.costInflationPercent + 1), step: 0.1, affects: 'Proof strength, defendability' },
    { key: 'buyerAcceptanceProbability', label: 'Buyer acceptance probability', min: 0, max: 100, step: 1, affects: 'Risk-adjusted value' },
    { key: 'contractLengthMonths', label: 'Contract length months', min: 3, max: 24, step: 1, affects: 'Exposure window, lock-in risk' }
  ];
  const visibleScenarioControls = scenarioControlRows;
  function formatScenarioInputValue(key: keyof ScenarioInputs, value: number) {
    if (key === 'buyerAcceptanceProbability' || key.includes('Percent')) return `${value.toFixed(key === 'buyerAcceptanceProbability' ? 0 : 1)}%`;
    if (key === 'contractLengthMonths') return `${value.toFixed(0)} mo`;
    return euros(value);
  }
  function scenarioDeltaLabel(value: number) {
    if (value === 0) return 'No change';
    return `${value > 0 ? '+' : ''}${euros(value)}`;
  }
  function scenarioPercentChange(delta: number, baseline: number) {
    if (!baseline) return 'n/a';
    const percentage = (delta / baseline) * 100;
    if (Math.abs(percentage) < 0.05) return '0.0%';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }
  const scenarioBaselineMetrics = attachedBuyingGroup
    ? {
        margin: attachedBuyingGroup.financialExposure.marginAtRisk,
        revenue: attachedBuyingGroup.financialExposure.revenueUnderNegotiation,
        trade: attachedBuyingGroup.financialExposure.tradeSpendExposure,
        volume: attachedBuyingGroup.financialExposure.volumeExposure
      }
    : attachedMarket
      ? {
          margin: attachedMarket.marginAtRisk,
          revenue: attachedMarket.revenueUnderNegotiation,
          trade: attachedMarket.tradeSpendExposure,
          volume: 0
        }
      : {
          margin: 0,
          revenue: baseRevenue,
          trade: inputs.tradeSpendChange,
          volume: 0
        };
  const scenarioMetricCards = [
    { delta: outputs.revenueImpact, label: 'Revenue', value: scenarioBaselineMetrics.revenue },
    { delta: outputs.marginImpact, label: 'Margin', value: scenarioBaselineMetrics.margin },
    { delta: outputs.volumeImpact, label: 'Volume', value: scenarioBaselineMetrics.volume },
    { delta: outputs.tradeSpendImpact, label: 'Trade spend', value: scenarioBaselineMetrics.trade }
  ];
  const scenarioReportPrompt = [
    `Create a PDF-ready financial scenario report for ${scenarioScopeName}.`,
    attachedBuyingGroup ? `Buying group: ${attachedBuyingGroup.name}.` : null,
    selectedMarket ? `Market: ${selectedMarket.name}.` : attachedMarket ? `Market: ${attachedMarket.name}.` : 'Market scope: Europe.',
    `Inputs: price increase ${inputs.priceIncreasePercent.toFixed(1)}%, expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, volume change ${inputs.volumeChangePercent.toFixed(1)}%, trade spend ${euros(inputs.tradeSpendChange)}, concession ${euros(inputs.concessionAmount)}, cost inflation ${inputs.costInflationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, competitor pressure ${inputs.competitorPressureLevel}, contract length ${inputs.contractLengthMonths} months.`,
    `Outputs: revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, volume ${scenarioDeltaLabel(outputs.volumeImpact)}, trade spend ${scenarioDeltaLabel(outputs.tradeSpendImpact)}, gap to plan ${scenarioDeltaLabel(outputs.gapToPlanImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}, risk ${outputs.riskLevel}.`,
    `Include current baseline, raw changes, percentage changes, source/freshness/confidence, assumptions, and recommended follow-up.`
  ].filter(Boolean).join('\n');
  const scenarioReportParams = new URLSearchParams({
    mode: 'draft',
    print: '1',
    prompt: scenarioReportPrompt,
    reportOnly: '1'
  });
  if (selectedBuyingGroupId) scenarioReportParams.set('buyingGroupId', selectedBuyingGroupId);
  if (selectedMarketId) scenarioReportParams.set('marketId', selectedMarketId);
  const scenarioReportHref = `/generated-views?${scenarioReportParams.toString()}`;

  function saveScenarioToBuyingGroup() {
    if (!attachedBuyingGroup) {
      setScenarioSaveStatus('Select a buying group before saving this scenario.');
      return;
    }
    const now = new Date().toISOString();
    saveStoredGeneratedView({
      artifactType: 'generated_view',
      audienceMode: 'internal_cno',
      buyingGroupId: attachedBuyingGroup.id,
      confidence: scenarioSource.confidence,
      contentSnapshot: {
        sections: [
          {
            title: 'Scenario inputs',
            body: `Price increase ${inputs.priceIncreasePercent.toFixed(1)}%, expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, competitor pressure ${inputs.competitorPressureLevel}.`,
            bullets: [
              `Trade spend: ${euros(inputs.tradeSpendChange)}`,
              `Concession: ${euros(inputs.concessionAmount)}`,
              `Volume change: ${inputs.volumeChangePercent.toFixed(1)}%`,
              `Contract length: ${inputs.contractLengthMonths} months`
            ]
          },
          {
            title: 'Modeled impact',
            body: `Risk-adjusted value is ${euros(outputs.riskAdjustedValue)} with ${outputs.riskLevel} risk.`,
            bullets: [
              `Revenue: ${scenarioDeltaLabel(outputs.revenueImpact)} (${scenarioPercentChange(outputs.revenueImpact, scenarioBaselineMetrics.revenue)} from current)`,
              `Margin: ${scenarioDeltaLabel(outputs.marginImpact)} (${scenarioPercentChange(outputs.marginImpact, scenarioBaselineMetrics.margin)} from current)`,
              `Volume: ${scenarioDeltaLabel(outputs.volumeImpact)} (${scenarioPercentChange(outputs.volumeImpact, scenarioBaselineMetrics.volume)} from current)`,
              `Trade spend: ${scenarioDeltaLabel(outputs.tradeSpendImpact)} (${scenarioPercentChange(outputs.tradeSpendImpact, scenarioBaselineMetrics.trade)} from current)`
            ]
          }
        ],
        summary: `${outputs.riskLevel} risk scenario for ${attachedBuyingGroup.name}: revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
        title: `${attachedBuyingGroup.name} scenario model · ${inputs.expectedRealizationPercent.toFixed(1)}% realization`
      },
      createdAt: now,
      id: `scenario-model-${attachedBuyingGroup.id}-${Date.now().toString(36)}`,
      lifecycleState: 'attached',
      marketId: selectedMarketId || attachedBuyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt: scenarioReportPrompt,
      revisionCount: 0,
      savedDestination: 'buyer_profile',
      savedToProfileAt: now,
      sourceDate: scenarioSource.sourceDate,
      sourceDecision: 'Saved from Scenario Models as buyer-specific scenario memory.',
      sourceName: scenarioSource.sourceName,
      summary: `${outputs.recommendation} Revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
      title: `${attachedBuyingGroup.name} scenario: ${inputs.expectedRealizationPercent.toFixed(1)}% realization`,
      updatedAt: now
    });
    setScenarioSaveStatus(`Saved to ${attachedBuyingGroup.name} history.`);
  }

  return (
    <>
      <section className="atlas-scenario-page-head">
        <div>
          <span>Scenario model</span>
          <h1>{scenarioScopeName} financial move</h1>
        </div>
        <strong>{outputs.riskLevel} risk / {euros(outputs.riskAdjustedValue)} risk-adjusted value</strong>
      </section>
      <section className="atlas-scenario-filter-controls" aria-label="Scenario model filters">
        <label>
          <span>Market</span>
          <select
            value={selectedMarketId}
            onChange={(event) => {
              const nextMarket = event.currentTarget.value;
              window.location.href = scenarioHref({
                buyer: selectedBuyingGroupId,
                market: nextMarket
              });
            }}
          >
            <option value="">{attachedBuyingGroup ? `All ${attachedBuyingGroup.name} markets` : 'Europe default'}</option>
            {[...marketOptions]
              .sort((a, b) => riskRank(b.pressureLevel) - riskRank(a.pressureLevel) || b.marginAtRisk - a.marginAtRisk)
              .map((market) => (
                <option value={market.id} key={market.id}>{market.name} · {euros(market.marginAtRisk)} margin risk</option>
              ))}
          </select>
        </label>
        <label>
          <span>Buying group</span>
          <select
            value={selectedBuyingGroupId}
            onChange={(event) => {
              const nextBuyer = event.currentTarget.value;
              const buyer = nextBuyer ? getBuyingGroup(nextBuyer) : undefined;
              const buyerSupportsMarket = selectedMarketId && buyer?.primaryMarkets.includes(selectedMarketId);
              window.location.href = scenarioHref({
                buyer: nextBuyer,
                market: buyerSupportsMarket ? selectedMarketId : ''
              });
            }}
          >
            <option value="">{selectedMarket ? `${selectedMarket.name} market model` : 'All buying groups'}</option>
            {[...marketScopedBuyingGroups]
              .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
              .map((group) => (
                <option value={group.id} key={group.id}>{group.name} · {euros(group.financialExposure.marginAtRisk)} risk</option>
              ))}
          </select>
        </label>
      </section>
      <section className="atlas-scenario-layout">
        <section className="atlas-scenario-controls">
          <header className="atlas-scenario-modeling-header">
            <div className="atlas-scenario-modeling-title">
              <h2>Scenario modeling</h2>
              <label className="atlas-scenario-pressure-control">
                <span>Competitor pressure</span>
                <select value={inputs.competitorPressureLevel} onChange={(event) => updateInput('competitorPressureLevel', event.target.value as ScenarioInputs['competitorPressureLevel'])}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <div className="atlas-scenario-header-actions">
              <div className="atlas-scenario-action-row">
                <button type="button" onClick={saveScenarioToBuyingGroup}>
                  <CheckCircle2 size={14} />
                  Save to buying group
                </button>
                <a href={scenarioReportHref} rel="noreferrer" target="_blank">
                  <Download size={14} />
                  PDF
                </a>
              </div>
            </div>
          </header>
          {scenarioSaveStatus ? <span className="atlas-scenario-save-status">{scenarioSaveStatus}</span> : null}
          <div className="atlas-scenario-delta-strip" aria-label="Scenario metric changes">
            {scenarioMetricCards.map((metric) => (
              <article className={metric.delta < 0 ? 'negative' : metric.delta > 0 ? 'positive' : ''} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{scenarioDeltaLabel(metric.delta)}</strong>
                <em>{scenarioPercentChange(metric.delta, metric.value)} from current</em>
                <small>Current {euros(metric.value)}</small>
              </article>
            ))}
          </div>
          <div className="atlas-scenario-lever-grid">
            {visibleScenarioControls.map(({ key, label, max, min, step }) => (
              <label className="atlas-scenario-input" key={key}>
                <span>{label}</span>
                <strong>{key.includes('Percent') || key === 'buyerAcceptanceProbability' ? `${inputs[key]}%` : key === 'contractLengthMonths' ? `${inputs[key]} mo` : euros(Number(inputs[key]))}</strong>
                <input type="range" min={min} max={max} step={step} value={Number(inputs[key])} onChange={(event) => updateInput(key, Number(event.target.value) as ScenarioInputs[typeof key])} onInput={(event) => updateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])} />
                <small><span>{formatScenarioInputValue(key, min)}</span><span>{formatScenarioInputValue(key, max)}</span></small>
              </label>
            ))}
          </div>
          <SourceTrustBar source={scenarioSource} />
        </section>
      </section>
    </>
  );
}

function sourceDecisionForDocument(document: DocumentArtifact) {
  if (document.status === 'approved' || document.status === 'ready') {
    return document.reusable ? 'Use as approved source' : 'Use as supporting context';
  }
  if (document.status === 'stale') return 'Review before reuse';
  if (document.status === 'superseded') return 'Open replacement source';
  if (document.status === 'missing') return 'Request source';
  return 'Keep as draft input';
}

function MemoryDecisionPanel({
  documents,
  events,
  title = 'Source decisions'
}: {
  documents: DocumentArtifact[];
  events: TimelineEvent[];
  title?: string;
}) {
  const reusable = documents.filter((document) => document.reusable && (document.status === 'approved' || document.status === 'ready'));
  const sourceWatchouts = documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const generated = documents.filter((document) => document.source.sourceType === 'ai_generated' || document.documentType === 'generated_report' || document.documentType === 'live_debrief');
  const topWatchout = sourceWatchouts[0] ?? documents.find((document) => document.status !== 'approved') ?? documents[0];
  const latestEvent = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const latestBuyerId = latestEvent?.buyingGroupIds[0] ?? topWatchout?.buyingGroupId;

  const cards = [
    {
      action: reusable[0] ? 'Open source' : 'Review library',
      href: reusable[0] ? hrefForDocumentArtifact(reusable[0]) : '/documents',
      label: 'Approved sources',
      source: reusable[0]?.source,
      title: `${reusable.length} reusable`,
      value: reusable[0]?.title ?? 'No approved source selected'
    },
    {
      action: topWatchout ? 'Resolve source' : 'Open documents',
      href: topWatchout ? hrefForDocumentArtifact(topWatchout) : '/documents',
      label: 'Source watchout',
      source: topWatchout?.source,
      tone: sourceWatchouts.length ? 'watch' : 'good',
      title: sourceWatchouts.length ? `${sourceWatchouts.length} need review` : 'No open source gaps',
      value: topWatchout ? sourceDecisionForDocument(topWatchout) : 'All sources ready'
    },
    {
      action: latestBuyerId ? 'Open buyer memory' : 'Open timeline',
      href: latestBuyerId ? `/buying-groups/${latestBuyerId}?view=memory` : '/timeline',
      label: 'Latest memory',
      source: latestEvent?.source,
      title: latestEvent?.title ?? 'No memory event',
      value: latestEvent ? compactFinancialImpact({
        margin: latestEvent.financialImpact?.marginImpact,
        revenue: latestEvent.financialImpact?.revenueImpact,
        trade: latestEvent.financialImpact?.tradeSpendImpact
      }) : 'No modeled impact'
    },
    {
      action: generated[0] ? 'Open latest draft' : 'Create view',
      href: generated[0] ? hrefForDocumentArtifact(generated[0]) : '/generated-views?prompt=Create%20source-backed%20CNO%20readout&mode=draft&editable=1',
      label: 'Generated views',
      source: generated[0]?.source,
      title: `${generated.length} stored`,
      value: generated[0]?.title ?? 'Create only when no source exists'
    }
  ];

  return (
    <section className="atlas-source-decision-panel" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <span>{documents.length} documents / {events.length} memory events</span>
      </header>
      <div>
        {cards.map((card) => (
          <a className={`atlas-source-decision-card ${card.tone ?? ''}`} href={card.href} key={`${card.label}-${card.title}`}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.value}</p>
            {card.source ? <SourceTrustMini source={card.source} /> : null}
            <em>{card.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

function TimelineDecisionPanel({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const buyerLinked = sorted.filter((event) => event.buyingGroupIds.length);
  const debriefs = sorted.filter((event) => event.eventType === 'debrief_created');
  const scenarios = sorted.filter((event) => event.eventType === 'scenario_modeled');
  const sourceWatchouts = sorted.filter((event) => event.status === 'stale' || event.status === 'needs_validation' || event.status === 'missing');
  const firstBuyer = buyerLinked[0]?.buyingGroupIds[0];

  const rows = [
    {
      href: firstBuyer ? `/buying-groups/${firstBuyer}?view=memory` : '/buying-groups',
      label: 'Buyer memory',
      metric: String(buyerLinked.length),
      title: buyerLinked[0]?.title ?? 'Open buyer memory',
      source: buyerLinked[0]?.source
    },
    {
      href: debriefs[0]?.buyingGroupIds[0] ? `/buying-groups/${debriefs[0].buyingGroupIds[0]}?view=memory` : '/timeline',
      label: 'Debriefs',
      metric: String(debriefs.length),
      title: debriefs[0]?.title ?? 'No debrief event selected',
      source: debriefs[0]?.source
    },
    {
      href: scenarios[0]?.buyingGroupIds[0] ? `/buying-groups/${scenarios[0].buyingGroupIds[0]}?view=financials` : '/scenario-models',
      label: 'Scenario memory',
      metric: String(scenarios.length),
      title: scenarios[0]?.title ?? 'No scenario event selected',
      source: scenarios[0]?.source
    },
    {
      href: sourceWatchouts[0]?.buyingGroupIds[0] ? `/buying-groups/${sourceWatchouts[0].buyingGroupIds[0]}?view=memory` : '/documents',
      label: 'Source watchouts',
      metric: String(sourceWatchouts.length),
      title: sourceWatchouts[0]?.title ?? 'No open watchouts',
      source: sourceWatchouts[0]?.source
    }
  ];

  return (
    <section className="atlas-memory-decision-strip" aria-label="Timeline memory decision read">
      {rows.map((row) => (
        <a href={row.href} key={row.label} {...generatedOutputLinkProps(row.href)}>
          <span>{row.label}</span>
          <strong>{row.metric}</strong>
          <p>{row.title}</p>
          {row.source ? <SourceTrustMini source={row.source} /> : null}
        </a>
      ))}
    </section>
  );
}

function DocumentsView({ initialPrompt }: { initialPrompt?: string }) {
  const staleOrMissing = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const reusable = packet.documents.filter((document) => document.reusable && document.status === 'approved');
  const generated = packet.documents.filter((document) => document.source.sourceType === 'ai_generated' || document.documentType === 'generated_report' || document.documentType === 'live_debrief');

  return (
    <>
      <IntentBrief
        eyebrow="Documents"
        title={`${staleOrMissing.length} source watchouts before official outputs.`}
        body={`${reusable.length} approved reusable sources / ${generated.length} generated or live artifacts stored.`}
        action="Retrieve approved sources first. Create only when the source does not exist."
        metrics={[
          { label: 'Approved reusable', value: String(reusable.length), tone: 'good' },
          { label: 'Source review', value: String(staleOrMissing.length), tone: 'watch' },
          { label: 'Generated artifacts', value: String(generated.length) }
        ]}
      />
      <AtlasCommandSurface
        basePath="/documents"
        examples={[
          'Retrieve prior-year EDEKA debrief',
          'Show stale prep documents',
          'Find documents for Carrefour'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask to retrieve debriefs, prep documents, source gaps, or generated outputs..."
      />
      <MemoryDecisionPanel documents={packet.documents} events={packet.latestTimelineEvents} />
      <section className="atlas-hub-section">
        <SectionTitle title="Document library" />
        <DocumentLibrary documents={packet.documents} />
      </section>
    </>
  );
}

function TimelineView({ initialPrompt }: { initialPrompt?: string }) {
  const debriefEvents = packet.latestTimelineEvents.filter((event) => event.eventType === 'debrief_created');
  const modeledEvents = packet.latestTimelineEvents.filter((event) => event.eventType === 'scenario_modeled');
  const validationEvents = packet.latestTimelineEvents.filter((event) => event.status === 'needs_validation' || event.eventType === 'validation_completed');

  return (
    <>
      <IntentBrief
        eyebrow="Timeline"
        title={`${debriefEvents.length} debriefs and ${modeledEvents.length} modeled events changed buyer memory.`}
        body={`${validationEvents.length} memory items need a source/status check before official reuse.`}
        action="Open the affected buying group when an event changes the current read."
        metrics={[
          { label: 'Recent debriefs', value: String(debriefEvents.length) },
          { label: 'Modeled events', value: String(modeledEvents.length) },
          { label: 'Validation watchouts', value: String(validationEvents.length), tone: 'watch' }
        ]}
      />
      <AtlasCommandSurface
        basePath="/timeline"
        examples={[
          'Show debriefs needing validation',
          'Show recent live outputs',
          'Find Carrefour history'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for debriefs, stale assumptions, scenario decisions, or buying-group history..."
      />
      <TimelineDecisionPanel events={packet.latestTimelineEvents} />
      <section className="atlas-hub-section">
        <SectionTitle title="Source-of-truth event memory" />
        <TimelineFeed events={packet.latestTimelineEvents} />
      </section>
    </>
  );
}

function SignalsView({ initialPrompt }: { initialPrompt?: string }) {
  const topSignal = packet.signals[0];
  return (
    <>
      <IntentBrief
        title={`${euros(topSignal.estimatedMarginImpact ?? 0)} signal impact across ${new Set(packet.signals.flatMap((signal) => signal.affectedBuyingGroups)).size} buyers.`}
        body=""
        action={topSignal.recommendedAction}
        metrics={[
          { label: 'Top signal impact', value: euros(topSignal.estimatedMarginImpact ?? 0), tone: 'watch' },
          { label: 'Affected markets', value: String(new Set(packet.signals.flatMap((signal) => signal.affectedMarkets)).size) },
          { label: 'Affected buyers', value: String(new Set(packet.signals.flatMap((signal) => signal.affectedBuyingGroups)).size) }
        ]}
      />
      <AtlasCommandSurface
        basePath="/signals"
        examples={[
          'What changed across Europe this week?',
          'Show signals affecting Carrefour',
          'Which signals affect margin risk?'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for signal impact, affected buyers, source freshness, or financial implication..."
      />
      <SignalActionBoard signals={packet.signals} />
    </>
  );
}

function CompetitorsView({ initialPrompt }: { initialPrompt?: string }) {
  const topMove = packet.competitorMoves[0];
  return (
    <>
      <IntentBrief
        title={`${euros(topMove.estimatedMarginImpact ?? 0)} competitor pressure across ${new Set(packet.competitorMoves.flatMap((move) => move.affectedBuyingGroups)).size} buyers.`}
        body=""
        action={topMove.recommendedAction}
        metrics={[
          { label: 'Top margin implication', value: euros(topMove.estimatedMarginImpact ?? 0), tone: 'watch' },
          { label: 'Competitor moves', value: String(packet.competitorMoves.length) },
          { label: 'Affected buyers', value: String(new Set(packet.competitorMoves.flatMap((move) => move.affectedBuyingGroups)).size) }
        ]}
      />
      <AtlasCommandSurface
        basePath="/competitors"
        examples={[
          'Find competitor moves affecting Carrefour',
          'Show private label leverage',
          'Which buyers can use competitor pressure?'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for competitor leverage, affected buyers, or PepsiCo financial implication..."
      />
      <CompetitorActionBoard moves={packet.competitorMoves} />
    </>
  );
}

type SourceDatabaseRow = {
  id: string;
  recordType: string;
  recordName: string;
  affectedMarkets: string;
  affectedBuyingGroups: string;
  financialImpact: string;
  source: SourceMeta;
  recordHref: string;
};

function marketNames(ids: string[]) {
  if (!ids.length) return 'Europe';
  return ids.map((id) => getMarket(id)?.name ?? id).join(', ');
}

function buyingGroupNames(ids: string[]) {
  if (!ids.length) return 'All buying groups';
  return ids.map((id) => getBuyingGroup(id)?.name ?? id).join(', ');
}

function compactFinancialImpact(input: { gap?: number; margin?: number; revenue?: number; trade?: number; volume?: number }) {
  const items = [
    input.revenue !== undefined ? `Revenue ${euros(input.revenue)}` : null,
    input.margin !== undefined ? `Margin ${euros(input.margin)}` : null,
    input.volume !== undefined ? `Volume ${euros(input.volume)}` : null,
    input.trade !== undefined ? `Trade ${euros(input.trade)}` : null,
    input.gap !== undefined ? `Gap ${euros(input.gap)}` : null
  ].filter((item): item is string => Boolean(item));
  return items.length ? items.join(' / ') : 'No financial impact modeled';
}

function buildSourceDatabaseRows(): SourceDatabaseRow[] {
  const marketRows = packet.markets.map((market): SourceDatabaseRow => ({
    id: `market-${market.id}`,
    recordType: 'Market',
    recordName: market.name,
    affectedMarkets: market.name,
    affectedBuyingGroups: buyingGroupNames(market.activeBuyingGroups),
    financialImpact: compactFinancialImpact({
      gap: market.gapToPlan,
      margin: market.marginAtRisk,
      revenue: market.revenueUnderNegotiation,
      trade: market.tradeSpendExposure,
      volume: market.volumeExposure
    }),
    source: market.source,
    recordHref: `/markets/${market.id}`
  }));
  const buyingGroupRows = packet.buyingGroups.map((group): SourceDatabaseRow => ({
    id: `buyer-${group.id}`,
    recordType: 'Buying group',
    recordName: group.name,
    affectedMarkets: marketNames(group.primaryMarkets),
    affectedBuyingGroups: group.name,
    financialImpact: compactFinancialImpact({
      gap: group.financialExposure.gapToPlan,
      margin: group.financialExposure.marginAtRisk,
      revenue: group.financialExposure.revenueUnderNegotiation,
      trade: group.financialExposure.tradeSpendExposure,
      volume: group.financialExposure.volumeExposure
    }),
    source: group.source,
    recordHref: `/buying-groups/${group.id}`
  }));
  const signalRows = packet.signals.map((signal): SourceDatabaseRow => ({
    id: `signal-${signal.id}`,
    recordType: 'External signal',
    recordName: signal.title,
    affectedMarkets: marketNames(signal.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(signal.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({ margin: signal.estimatedMarginImpact, revenue: signal.estimatedRevenueImpact }),
    source: signal.source,
    recordHref: `/signals?signal=${signal.id}`
  }));
  const competitorRows = packet.competitorMoves.map((move): SourceDatabaseRow => ({
    id: `competitor-${move.id}`,
    recordType: 'Competitor move',
    recordName: `${move.competitor}: ${move.title}`,
    affectedMarkets: marketNames(move.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(move.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({ margin: move.estimatedMarginImpact, revenue: move.estimatedRevenueImpact }),
    source: move.source,
    recordHref: `/competitors?move=${move.id}`
  }));
  const documentRows = packet.documents.map((document): SourceDatabaseRow => ({
    id: `document-${document.id}`,
    recordType: 'Document',
    recordName: document.title,
    affectedMarkets: document.marketId ? marketNames([document.marketId]) : 'Not market-specific',
    affectedBuyingGroups: document.buyingGroupId ? buyingGroupNames([document.buyingGroupId]) : 'Not buyer-specific',
    financialImpact: document.lastUsed ? `Last used ${document.lastUsed}` : document.reusable ? 'Reusable source' : 'Draft source',
    source: document.source,
    recordHref: `/documents?document=${document.id}`
  }));
  const timelineRows = packet.timelineEvents.map((event): SourceDatabaseRow => ({
    id: `timeline-${event.id}`,
    recordType: 'Timeline event',
    recordName: event.title,
    affectedMarkets: marketNames(event.marketIds),
    affectedBuyingGroups: buyingGroupNames(event.buyingGroupIds),
    financialImpact: compactFinancialImpact({
      margin: event.financialImpact?.marginImpact,
      revenue: event.financialImpact?.revenueImpact,
      trade: event.financialImpact?.tradeSpendImpact
    }),
    source: event.source,
    recordHref: `/timeline?event=${event.id}`
  }));
  const patternRows = packet.crossMarketPatterns.map((pattern): SourceDatabaseRow => ({
    id: `pattern-${pattern.id}`,
    recordType: 'Cross-market pattern',
    recordName: pattern.title,
    affectedMarkets: marketNames(pattern.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(pattern.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({
      margin: pattern.financialImplication.marginAtRisk,
      revenue: pattern.financialImplication.revenueAtRisk,
      trade: pattern.financialImplication.tradeSpendExposure,
      volume: pattern.financialImplication.volumeExposure
    }),
    source: pattern.source,
    recordHref: `/?monitor=patterns`
  }));
  const scenarioRows = packet.scenarioModels.map((scenario): SourceDatabaseRow => {
    const source = packet.documents.find((document) => scenario.sourceIds.includes(document.id))?.source ?? getBuyingGroup(scenario.buyingGroupId)?.source ?? packet.markets[0].source;
    return {
      id: `scenario-${scenario.id}`,
      recordType: 'Scenario model',
      recordName: scenario.name,
      affectedMarkets: marketNames([scenario.marketId]),
      affectedBuyingGroups: buyingGroupNames([scenario.buyingGroupId]),
      financialImpact: compactFinancialImpact({
        gap: scenario.outputs.gapToPlanImpact,
        margin: scenario.outputs.marginImpact,
        revenue: scenario.outputs.revenueImpact,
        trade: scenario.outputs.tradeSpendImpact,
        volume: scenario.outputs.volumeImpact
      }),
      source,
      recordHref: `/scenario-models?buyingGroup=${scenario.buyingGroupId}`
    };
  });

  return [...marketRows, ...buyingGroupRows, ...signalRows, ...competitorRows, ...documentRows, ...timelineRows, ...patternRows, ...scenarioRows]
    .sort((a, b) => b.source.lastUpdated.localeCompare(a.source.lastUpdated) || a.recordType.localeCompare(b.recordType));
}

function filterSourceDatabaseRows(rows: SourceDatabaseRow[], ask?: string) {
  const normalized = (ask ?? '').toLowerCase().trim();
  if (!normalized) return rows;
  return rows.filter((row) => {
    const haystack = [
      row.recordType,
      row.recordName,
      row.affectedMarkets,
      row.affectedBuyingGroups,
      row.financialImpact,
      row.source.sourceName,
      row.source.sourceType,
      row.source.status,
      row.source.confidence,
      row.source.governance.approvalStatus,
      row.source.governance.canonicalUseAllowed
    ].join(' ').toLowerCase();
    if (/stale|watchout|missing|validation|review/.test(normalized)) {
      return row.source.status === 'stale' || row.source.status === 'needs_validation' || row.source.status === 'missing';
    }
    if (/approved|ready|usable|canonical/.test(normalized)) {
      return row.source.status === 'approved' || row.source.status === 'ready' || row.source.governance.canonicalUseAllowed === 'yes';
    }
    if (/high confidence|trusted/.test(normalized)) return row.source.confidence === 'high';
    if (/generated|modeled|assumption|user entered/.test(normalized)) return row.source.sourceType === 'ai_generated' || row.source.sourceType === 'user_entered' || row.source.status === 'modeled';
    return normalized.split(/\s+/).filter((token) => token.length > 2).some((token) => haystack.includes(token));
  });
}

function SourceDatabaseView({ initialPrompt }: { initialPrompt?: string }) {
  const allRows = buildSourceDatabaseRows();
  const rows = filterSourceDatabaseRows(allRows, initialPrompt);
  const sourceWatchouts = allRows.filter((row) => row.source.status === 'stale' || row.source.status === 'needs_validation' || row.source.status === 'missing');
  const approvedRows = allRows.filter((row) => row.source.status === 'approved' || row.source.status === 'ready');
  const highConfidenceRows = allRows.filter((row) => row.source.confidence === 'high');
  const modeledRows = allRows.filter((row) => row.source.status === 'modeled' || row.source.sourceType === 'ai_generated' || row.source.sourceType === 'user_entered');
  const nonCanonicalRows = allRows.filter((row) => row.source.governance.canonicalUseAllowed !== 'yes');
  const governanceCards = [
    {
      action: 'Use first',
      detail: 'Approved or ready records can be retrieved before ATLAS creates new work.',
      label: 'Approved / ready',
      tone: 'good',
      value: String(approvedRows.length)
    },
    {
      action: 'Resolve before official use',
      detail: 'Stale, missing, or source-review records should not silently drive outputs.',
      label: 'Source watchouts',
      tone: 'watch',
      value: String(sourceWatchouts.length)
    },
    {
      action: 'Treat as assumption',
      detail: 'Modeled, user-entered, and generated records remain working context until validated.',
      label: 'Modeled / generated',
      tone: 'draft',
      value: String(modeledRows.length)
    },
    {
      action: 'Do not treat as source truth',
      detail: 'Non-canonical records need owner approval or replacement before governed use.',
      label: 'Non-canonical',
      tone: 'blocked',
      value: String(nonCanonicalRows.length)
    }
  ];

  return (
    <>
      <IntentBrief
        eyebrow="Database"
        title={`${rows.length} source-backed records / ${sourceWatchouts.length} watchouts.`}
        body={`${approvedRows.length} approved or ready / ${highConfidenceRows.length} high confidence records.`}
        action="Open the record or source when a number needs traceability."
        metrics={[
          { label: 'Records', value: String(rows.length) },
          { label: 'High confidence', value: String(highConfidenceRows.length), tone: 'good' },
          { label: 'Source watchouts', value: String(sourceWatchouts.length), tone: 'watch' }
        ]}
      />
      <AtlasCommandSurface
        basePath="/database"
        examples={[
          'Show stale source records',
          'Find source links for Carrefour',
          'Show high confidence competitor sources'
        ]}
        initialPrompt={initialPrompt}
        placeholder="Ask for source records by buyer, market, confidence, status, or data type..."
      />
      <MemoryDecisionPanel documents={packet.documents} events={packet.latestTimelineEvents} title="Database control read" />
      <section className="atlas-source-governance-summary" aria-label="Source governance summary">
        {governanceCards.map((card) => (
          <article className={`tone-${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
            <em>{card.action}</em>
          </article>
        ))}
      </section>
      <SavedGeneratedViewsShelf />
      <section className="atlas-source-database">
        <header>
          <div>
            <h2>{initialPrompt ? 'Filtered source records' : 'All ATLAS source records'}</h2>
          </div>
          <p>{rows.length} shown / {allRows.length} total. {sourceWatchouts.length} source watchouts / {approvedRows.length} usable records.</p>
        </header>
        {initialPrompt ? <p className="atlas-source-database-filter">Asked: “{initialPrompt}”</p> : null}
        <div className="atlas-source-database-table" role="table" aria-label="ATLAS source database">
          <div className="atlas-source-database-head" role="row">
            <span>Record</span>
            <span>Source</span>
            <span>Date</span>
            <span>Status</span>
            <span>Affected</span>
            <span>Financial data</span>
            <span>Links</span>
          </div>
          {rows.map((row) => (
            <article className="atlas-source-database-row" key={row.id} role="row">
              <div>
                <em>{row.recordType}</em>
                <strong>{row.recordName}</strong>
              </div>
              <div>
                <em>{row.source.sourceType}</em>
                <strong>{row.source.sourceName}</strong>
              </div>
              <span>{row.source.sourceDate}</span>
              <div className="atlas-source-database-status">
                <StatusChip status={row.source.status} />
                <ConfidenceChip confidence={row.source.confidence} />
              </div>
              <span>{row.affectedMarkets} / {row.affectedBuyingGroups}</span>
              <span>{row.financialImpact}</span>
              <div className="atlas-source-database-links">
                <a href={row.source.url ?? `/database?source=${encodeURIComponent(row.id)}`}>Open source</a>
                <a href={row.recordHref}>Open record</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function HowItWorksView() {
  const loopSteps = [
    {
      action: 'Open Overview, then drill into the highest-risk market or buyer.',
      input: 'Market pressure, watchlist, external movement, financial exposure.',
      output: 'Top focus areas and recommended next actions.',
      step: 'Monitor'
    },
    {
      action: 'Compare markets or buying groups by margin risk, realization gap, round, and pressure.',
      input: 'Revenue, margin, volume, trade spend, gap to plan, competitor pressure.',
      output: 'Where attention should go first.',
      step: 'Diagnose'
    },
    {
      action: 'Open the buying group profile.',
      input: 'Current negotiation state, documents, history, signals, competitor moves.',
      output: 'What is happening with this exact buyer.',
      step: 'Drill in'
    },
    {
      action: 'Run Scenario Models from the buyer profile or Impact page.',
      input: 'Price realization, volume, trade spend, concession, buyer acceptance.',
      output: 'Financial implication and risk-adjusted value.',
      step: 'Model'
    },
    {
      action: 'Use generated views or Live Room to pull source-backed reports in a new tab.',
      input: 'Prep docs, buyer history, source records, room requests.',
      output: 'Editable report artifact with PDF download and save-to-profile action.',
      step: 'Generate'
    },
    {
      action: 'Add generated views, debriefs, documents, and scenario events back to buyer or market memory.',
      input: 'What changed, document evidence, financial deltas, decisions, generated report links.',
      output: 'Updated memory for the next cycle.',
      step: 'Debrief / Memory'
    }
  ];
  const pageIntents = [
    {
      answer: 'Top watchouts, top buyer risk, market pressure, what changed.',
      page: 'Overview',
      problem: 'CNOs need to know where to focus first without reading a dashboard wall.',
      source: 'Watchlist, market packets, buying group packets, signals, competitor moves.',
      intent: 'What do I need to focus on right now?',
      action: 'Open the top buyer, compare markets, or ask ATLAS for a focused view.'
    },
    {
      answer: 'Market comparison by margin risk, gap to plan, trade spend, active buyer pressure.',
      page: 'Markets',
      problem: 'Users need to see if one market is losing money and where pressure can be offset.',
      source: 'Market records, linked buying groups, signals, competitor moves.',
      intent: 'How are markets performing against each other?',
      action: 'Open the highest-pressure market or find offset potential.'
    },
    {
      answer: 'Compact buyer list with margin risk, expected realization, stage, intervention trigger.',
      page: 'Buying Groups',
      problem: 'Users need to quickly see who is stuck, risky, below target, or needs escalation.',
      source: 'Buying group records, financial exposure, negotiation stage, source memory.',
      intent: 'Which customer relationships need attention?',
      action: 'Open the buyer profile.'
    },
    {
      answer: 'Current round, latest ask, PepsiCo position, target, margin risk, history, docs, scenarios.',
      page: 'Buying Group Profile',
      problem: 'Users need one place to understand the buyer and update the memory loop.',
      source: 'Buyer packet, timeline, supporting documents, signals, competitor moves, scenarios.',
      intent: 'What is happening with this exact buying group?',
      action: 'Review financials, run scenario, open Live Room, add update.'
    },
    {
      answer: 'Margin at risk, gap to plan, realization tracker, exposure ranking.',
      page: 'PepsiCo Impact',
      problem: 'Users need to know where money is at risk before deciding what to model.',
      source: 'Europe summary, market records, buyer financial exposure.',
      intent: 'Where is money at risk and what can be offset?',
      action: 'Open buyer profile or scenario model.'
    },
    {
      answer: 'Modeled revenue, margin, volume, trade spend, gap to plan, risk-adjusted value.',
      page: 'Scenario Models',
      problem: 'Users need to test a pricing move before approving or discussing it.',
      source: 'Buyer financials, scenario assumptions, linked source documents.',
      intent: 'What happens if we move price, trade spend, volume, or concessions?',
      action: 'Download scenario visual or save modeled output to buyer/market memory.'
    },
    {
      answer: 'Editable report artifact with source decision, metrics, sections, PDF download, duplicate/edit, and save destination.',
      page: 'Generated Views',
      problem: 'Users need ATLAS to retrieve existing work when it exists, or create an editable draft when it does not.',
      source: 'Document library, source metadata, buyer/market scope, generated report service.',
      intent: 'Can I get this exact report or view right now?',
      action: 'Download PDF, duplicate/edit, or add to buyer/market profile.'
    },
    {
      answer: 'Recommended action, buyer leverage, affected financials, affected buyers, source.',
      page: 'Competitors / Signals',
      problem: 'External events need to become negotiation implications, not generic news.',
      source: 'External signal records, competitor move records, affected buyer links.',
      intent: 'What changed in the world or competitive set, and who does it affect?',
      action: 'Open affected buyer or model downside.'
    },
    {
      answer: 'Every source record, status, confidence, source date, affected data, source link.',
      page: 'Database',
      problem: 'Trust depends on users being able to find where every number came from.',
      source: 'All normalized source metadata across ATLAS objects.',
      intent: 'Where is the actual data behind this read?',
      action: 'Open source or open record.'
    }
  ];

  return (
    <>
      <IntentBrief
        eyebrow="Builder explainer"
        title="How ATLAS gets a CNO from question to answer in 60 seconds."
        body="ATLAS is an intelligence loop: monitor what changed, diagnose financial exposure, drill into the buyer, model the move, generate the right view, then save the result back to memory."
        action="Design goal: every page should answer the user’s question, show affected financials, show source trust, and make the next action obvious."
        metrics={[
          { label: 'Goal', value: '<60 sec' },
          { label: 'Core object', value: 'Buying group' },
          { label: 'Trust layer', value: 'Source database', tone: 'good' }
        ]}
      />

      <section className="atlas-how-loop">
        <header>
          <span>System loop</span>
          <h2>Monitor → Diagnose → Drill in → Model → Generate → Debrief → Memory</h2>
        </header>
        <div>
          {loopSteps.map((step, index) => (
            <article key={step.step}>
              <em>{String(index + 1).padStart(2, '0')}</em>
              <h3>{step.step}</h3>
              <dl>
                <div><dt>Input</dt><dd>{step.input}</dd></div>
                <div><dt>Output</dt><dd>{step.output}</dd></div>
                <div><dt>Action</dt><dd>{step.action}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-how-answer-model">
        <div>
          <span>60-second answer model</span>
          <h2>Every view should collapse to four things.</h2>
        </div>
        <ol>
          <li><strong>Recommended action.</strong><span>What should the user do next?</span></li>
          <li><strong>Why now.</strong><span>What changed or what is at risk?</span></li>
          <li><strong>Affected data.</strong><span>Revenue, margin, volume, trade spend, gap, buyer, market.</span></li>
          <li><strong>Source trust.</strong><span>Where did the data come from, how fresh is it, and how confident is ATLAS?</span></li>
        </ol>
      </section>

      <section className="atlas-how-intent-table">
        <header>
          <div>
            <span>Page intent map</span>
            <h2>User intent, problem solved, and expected answer by page.</h2>
          </div>
          <p>This is the builder reference for deciding what belongs on each page and what should be hidden behind drilldown or Ask ATLAS.</p>
        </header>
        <div className="atlas-how-intent-head">
          <span>Page</span>
          <span>User intent</span>
          <span>Problem solved</span>
          <span>Default answer</span>
          <span>Source / data</span>
          <span>Next action</span>
        </div>
        {pageIntents.map((item) => (
          <article className="atlas-how-intent-row" key={item.page}>
            <strong>{item.page}</strong>
            <span>{item.intent}</span>
            <span>{item.problem}</span>
            <span>{item.answer}</span>
            <span>{item.source}</span>
            <span>{item.action}</span>
          </article>
        ))}
      </section>
    </>
  );
}

function AtlasIntelligenceContent({
  view,
  marketId,
  buyingGroupId,
  initialBuyingGroupPhase,
  initialBuyingGroupPrompt,
  initialBuyingGroupView,
  initialGeneratedView,
  initialMonitorTab,
  initialPrompt,
  initialSort
}: AtlasIntelligenceHubProps) {
  if (view === 'markets' || view === 'market') return <MarketsView initialGeneratedView={initialGeneratedView} initialPrompt={initialPrompt} initialSort={initialSort} marketId={marketId} />;
  if (view === 'buyingGroups' || view === 'buyingGroup') {
    return (
      <BuyingGroupsView
        buyingGroupId={buyingGroupId}
        initialPhase={initialBuyingGroupPhase}
        initialPrompt={buyingGroupId ? initialBuyingGroupPrompt : initialPrompt}
        initialSort={initialSort}
        initialView={buyingGroupId ? initialBuyingGroupView : initialGeneratedView}
      />
    );
  }
  if (view === 'signals') return <SignalsView initialPrompt={initialPrompt} />;
  if (view === 'competitors') return <CompetitorsView initialPrompt={initialPrompt} />;
  if (view === 'financialImpact') return <FinancialImpactView initialGeneratedView={initialGeneratedView} initialPrompt={initialPrompt} />;
  if (view === 'documents') return <DocumentsView initialPrompt={initialPrompt} />;
  if (view === 'timeline') return <TimelineView initialPrompt={initialPrompt} />;
  if (view === 'database') return <SourceDatabaseView initialPrompt={initialPrompt} />;
  if (view === 'howItWorks') return <HowItWorksView />;
  if (view === 'scenarioModels') return <ScenarioModelsView buyingGroupId={buyingGroupId} initialPrompt={initialPrompt} initialView={initialGeneratedView} marketId={marketId} />;
  return <EuropeOverview initialGeneratedView={initialGeneratedView} initialMonitorTab={initialMonitorTab} initialPrompt={initialPrompt} />;
}

export default function AtlasIntelligenceHub(props: AtlasIntelligenceHubProps) {
  const commandPrompt = props.buyingGroupId
    ? props.initialBuyingGroupPrompt || props.initialPrompt
    : props.initialPrompt;
  return (
    <AppShell buyingGroupId={props.buyingGroupId} commandPrompt={commandPrompt} marketId={props.marketId} view={props.view}>
      <AtlasIntelligenceContent {...props} />
    </AppShell>
  );
}
