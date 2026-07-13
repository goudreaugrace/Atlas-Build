import { FileText, ShieldCheck } from 'lucide-react';
import { demoNegotiation, demoStrategyWatchouts, demoVisualEvidenceModules, getScenario } from '@/src/lib/atlas/demo-data';
import { generateAtlasReport, type AtlasGeneratedReport, type AtlasGeneratedTable } from '@/src/lib/atlas/llm-report';
import type { LiveDebriefReportContext } from '@/src/lib/atlas/live-negotiator';
import { buildAtlasIntelligencePacket } from '@/src/lib/atlas-intelligence/kernel';
import type { DocumentArtifact } from '@/src/lib/atlas-intelligence/types';
import AtlasPdfActions from './AtlasPdfActions';

type AtlasOutputPageProps = {
  searchParams: Promise<{ documentId?: string; editable?: string; liveContext?: string; mode?: string; prompt?: string }>;
};

type OutputMode = 'draft' | 'generated' | 'retrieved';

type OutputKind =
  | 'strategy'
  | 'cnoBrief'
  | 'kamPack'
  | 'customerPack'
  | 'scenario'
  | 'pricingCorridor'
  | 'costPressure'
  | 'shelfComparison'
  | 'promoRisk'
  | 'evidencePack'
  | 'debrief'
  | 'history'
  | 'tasks'
  | 'custom';

type Audience = 'CNO internal' | 'KAM-safe' | 'Customer-safe' | 'Strategy team';

type PromptIntent = {
  audience: Audience;
  kind: OutputKind;
  market: string;
  prompt: string;
  scenarioId: string;
};

const record = demoNegotiation;
const intelligencePacket = buildAtlasIntelligencePacket();

function pct(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function euros(value: number) {
  const abs = Math.abs(value);
  const formatted = abs >= 1000000 ? `EUR ${(abs / 1000000).toFixed(1)}M` : `EUR ${abs.toLocaleString('en-US')}`;
  return value < 0 ? `-${formatted}` : formatted;
}

function normalize(prompt: string) {
  return prompt.toLowerCase();
}

function inferMarket(prompt: string) {
  const normalized = normalize(prompt);
  return record.markets.find((market) => normalized.includes(market.market.toLowerCase()))?.market ?? record.market;
}

function inferAudience(prompt: string): Audience {
  const normalized = normalize(prompt);
  if (/(kam|cam|field|cascade|sales pack)/.test(normalized)) return 'KAM-safe';
  if (/(customer|buyer-facing|retailer-facing|external)/.test(normalized)) return 'Customer-safe';
  if (/(cno|internal|leadership|finance)/.test(normalized)) return 'CNO internal';
  return 'Strategy team';
}

function inferScenario(prompt: string) {
  const normalized = normalize(prompt);
  if (/(accept|4\.2|buyer ask|customer ask)/.test(normalized)) return 'scenario-accept';
  if (/(3\.2|fallback|q4|phasing|promo)/.test(normalized)) return 'scenario-tradeoff';
  if (/(hold|firm|3\.0|red line|red-line)/.test(normalized)) return 'scenario-hold';
  return record.activeScenarioId;
}

function classifyPrompt(prompt: string): OutputKind {
  const normalized = normalize(prompt);
  if (/(kam|cam|cascade|field pack|sales pack)/.test(normalized)) return 'kamPack';
  if (/(customer-safe|customer safe|buyer-facing|retailer-facing|external pack)/.test(normalized)) return 'customerPack';
  if (/(cno|prep brief|brief|leadership|finance brief)/.test(normalized)) return 'cnoBrief';
  if (/(price corridor|pricing corridor|corridor|guardrail)/.test(normalized)) return 'pricingCorridor';
  if (/(cost|commodity|packaging|inflation|input)/.test(normalized)) return 'costPressure';
  if (/(shelf|private label|competitor|affordability|price comparison)/.test(normalized)) return 'shelfComparison';
  if (/(promo|promotion|trade spend|visibility|sanction|exposure)/.test(normalized) && !/(scenario|stress|model|run|3\.2|3\.0|4\.2|fallback|q4)/.test(normalized)) return 'promoRisk';
  if (/(scenario|stress|model|run|3\.2|3\.0|4\.2|lever|tradeoff|volume|offset|fallback|red line)/.test(normalized)) return 'scenario';
  if (/(evidence|proof|visual|deck|data view|data|support)/.test(normalized)) return 'evidencePack';
  if (/(debrief|meeting notes|recap|follow up|follow-up|post meeting|notes)/.test(normalized)) return 'debrief';
  if (/(history|timeline|version|what changed|legacy|news|external)/.test(normalized)) return 'history';
  if (/(task|todo|missing|gap|attention|review)/.test(normalized)) return 'tasks';
  if (/(strategy|position|negotiation|buying group|recommendation|recommend)/.test(normalized)) return 'strategy';
  return 'custom';
}

function buildIntent(prompt: string): PromptIntent {
  return {
    audience: inferAudience(prompt),
    kind: classifyPrompt(prompt),
    market: inferMarket(prompt),
    prompt,
    scenarioId: inferScenario(prompt)
  };
}

function titleForIntent(intent: PromptIntent) {
  const marketPrefix = intent.market === record.market ? record.customer : `${record.customer} ${intent.market}`;
  switch (intent.kind) {
    case 'cnoBrief':
      return `${marketPrefix} CNO Prep Brief`;
    case 'kamPack':
      return `${marketPrefix} KAM-Safe Pack`;
    case 'customerPack':
      return `${marketPrefix} Customer-Safe Sell Story`;
    case 'scenario':
      return `${marketPrefix} Scenario Stress Test`;
    case 'pricingCorridor':
      return `${marketPrefix} Pricing Corridor`;
    case 'costPressure':
      return `${marketPrefix} Cost Pressure Proof`;
    case 'shelfComparison':
      return `${marketPrefix} Shelf Price Comparison`;
    case 'promoRisk':
      return `${marketPrefix} Promo Exposure Readout`;
    case 'evidencePack':
      return `${marketPrefix} Evidence Pack`;
    case 'debrief':
      return `${marketPrefix} Debrief Summary`;
    case 'history':
      return `${marketPrefix} Negotiation History`;
    case 'tasks':
      return `${marketPrefix} Items Needing Attention`;
    case 'custom':
      return `${marketPrefix} ATLAS Generated Response`;
    default:
      return `${marketPrefix} Strategy Brief`;
  }
}

function isExternal(intent: PromptIntent) {
  return intent.audience === 'KAM-safe' || intent.audience === 'Customer-safe';
}

function moduleById(id: string) {
  return demoVisualEvidenceModules.find((module) => module.id === id) ?? demoVisualEvidenceModules[0];
}

function sourceLine(source: { source: string; freshness: string; confidence: string }) {
  return `${source.source} / ${source.freshness} / ${source.confidence} confidence`;
}

function KeyMetrics({ intent }: { intent: PromptIntent }) {
  const market = record.markets.find((item) => item.market === intent.market) ?? record.markets[0];
  const scenario = getScenario(record, intent.scenarioId);
  const showInternal = !isExternal(intent);

  return (
    <section className="atlas-pdf-metric-strip" aria-label="Key output numbers">
      <div><span>Buyer ask</span><strong>{pct(record.pricingPosition.currentCustomerAskPct.value)}</strong><em>{record.pricingPosition.currentCustomerAskPct.source}</em></div>
      <div><span>{intent.market} target</span><strong>{pct(market.targetPriceMovePct.value)}</strong><em>{market.targetPriceMovePct.source}</em></div>
      <div><span>{showInternal ? 'Red line' : 'Recommended counter'}</span><strong>{showInternal ? pct(market.redLinePct.value) : pct(record.recommendedCounterPct.value)}</strong><em>{showInternal ? market.redLinePct.source : 'Approved external talking point'}</em></div>
      <div><span>{intent.kind === 'scenario' ? 'Land odds' : 'Confidence'}</span><strong>{intent.kind === 'scenario' ? `${scenario.probabilityToLandPct}%` : record.decisionConfidence}</strong><em>{intent.kind === 'scenario' ? scenario.acceptanceLikelihood : record.sourceReadiness}</em></div>
    </section>
  );
}

function StrategySection({ intent }: { intent: PromptIntent }) {
  const external = isExternal(intent);
  return (
    <>
      <section className="atlas-pdf-hero">
        <span>{intent.audience} strategy</span>
        <h1>{external ? 'Defend value with shopper and category proof' : record.recommendedPosition}</h1>
        <p>{external
          ? 'Lead with shopper value, category resilience, and a phased support plan. Do not include internal red lines, fallback thresholds, margin controls, or confidence gaps.'
          : record.sellStory.editableDraft}
        </p>
      </section>
      <KeyMetrics intent={intent} />
      <section className="atlas-pdf-two-col">
        <div>
          <h2>Recommended narrative</h2>
          <p>{external ? record.sellStory.defense.replace('red line', 'approved guardrail') : record.sellStory.defense}</p>
          <ul>
            {(external ? record.sellStory.proofPointsNeeded.slice(0, 3) : record.annualPriorities.slice(0, 4)).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h2>{external ? 'Approved next move' : 'Decision needed'}</h2>
          <p>{external ? 'Use the 3.0% counter as the supported buyer-facing position. Escalate if the buyer asks for permanent promo funding or asks to reopen the base price.' : record.blockingIssue}</p>
          <p><strong>Next action:</strong> {record.missingInformationTasks[1]?.recommendedAction ?? 'Validate open assumptions before sharing externally.'}</p>
        </div>
      </section>
    </>
  );
}

function ScenarioSection({ intent }: { intent: PromptIntent }) {
  const scenario = getScenario(record, intent.scenarioId);
  const activeScenario = getScenario(record);
  return (
    <>
      <section className="atlas-pdf-hero compact">
        <span>Tested move</span>
        <h1>{scenario.name}</h1>
        <p>{scenario.strategy}</p>
      </section>
      <section className="atlas-pdf-metric-strip" aria-label="Scenario impact">
        <div><span>Price move</span><strong>{pct(scenario.priceMovePct)}</strong><em>vs {pct(activeScenario.priceMovePct)} active counter</em></div>
        <div><span>NR impact</span><strong>{euros(scenario.netRevenueImpactEuros)}</strong><em>ATLAS scenario model</em></div>
        <div><span>GM impact</span><strong>{scenario.grossMarginImpactBps} bps</strong><em>{scenario.confidence} confidence</em></div>
        <div><span>Land odds</span><strong>{scenario.probabilityToLandPct}%</strong><em>{scenario.acceptanceLikelihood} acceptance</em></div>
      </section>
      <section className="atlas-pdf-two-col">
        <div>
          <h2>Strategy impact</h2>
          <p>{scenario.recommendedUseCase}</p>
          <ul>
            {scenario.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
          </ul>
        </div>
        <div>
          <h2>Guardrail read</h2>
          <p>Red-line proximity: <strong>{scenario.redLineProximity}</strong></p>
          <p>Sanction risk: <strong>{scenario.sanctionRisk}</strong></p>
          <p>Approval needed: <strong>{record.strategyReadinessState}</strong></p>
        </div>
      </section>
    </>
  );
}

function EvidenceModuleArticle({ id, index }: { id: string; index: number }) {
  const module = moduleById(id);
  return (
    <article>
      <span>{index + 1}</span>
      <div>
        <h3>{module.deckUse}</h3>
        <p>{module.keyTakeaway}</p>
        <div className="atlas-pdf-proof-metrics">
          {module.proofMetrics.slice(0, 4).map((metric) => (
            <div key={`${module.id}-${metric.label}`}>
              <strong>{metric.value}</strong>
              <em>{metric.label}</em>
            </div>
          ))}
        </div>
        <small>{sourceLine(module.source)}</small>
      </div>
    </article>
  );
}

function EvidenceSection({ intent }: { intent: PromptIntent }) {
  const ids = intent.kind === 'pricingCorridor'
    ? ['visual-pricing-corridor', 'visual-scenario-mini']
    : intent.kind === 'costPressure'
      ? ['visual-cost-pressure', 'visual-pricing-corridor']
      : intent.kind === 'shelfComparison'
        ? ['visual-shelf-price', 'visual-cost-pressure']
        : intent.kind === 'promoRisk'
          ? ['visual-promo-exposure', 'visual-scenario-mini']
          : demoVisualEvidenceModules.map((module) => module.id);

  return (
    <section className="atlas-pdf-section">
      <h2>{intent.kind === 'evidencePack' ? 'Evidence sequence' : titleForIntent(intent)}</h2>
      <p>{intent.kind === 'pricingCorridor'
        ? 'Use this to show how the buyer ask, target, recommended counter, and guardrail relate to each other.'
        : intent.kind === 'promoRisk'
          ? 'Use this to separate confirmed buyer pressure from modeled risk so the team does not overreact to unconfirmed sanction language.'
          : 'Use these proof points to support the sell story with clear numbers, source freshness, and confidence.'}
      </p>
      <div className="atlas-pdf-evidence-grid">
        {ids.map((id, index) => <EvidenceModuleArticle id={id} index={index} key={id} />)}
      </div>
    </section>
  );
}

function DebriefSection() {
  const debrief = record.debriefCaptures[0];
  return (
    <section className="atlas-pdf-section">
      <h2>Latest debrief extraction</h2>
      <p>{record.latestDebriefSnapshot}</p>
      <div className="atlas-pdf-two-col">
        <div>
          <h3>Captured next steps</h3>
          <ul>
            {debrief.nextSteps.map((step) => <li key={step}>{step}</li>)}
          </ul>
        </div>
        <div>
          <h3>Scenario updates</h3>
          <ul>
            {debrief.scenarioAssumptionUpdates.map((update) => <li key={update}>{update}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function HistorySection() {
  return (
    <section className="atlas-pdf-section">
      <h2>Negotiation history and strategy changes</h2>
      <div className="atlas-pdf-history">
        {record.strategyUpdates.map((update) => (
          <article key={update.id}>
            <span>{update.version}</span>
            <div>
              <h3>{update.summary}</h3>
              <p>{update.triggeredBy}</p>
              <ul>
                {update.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
              <small>{sourceLine(update.source)}</small>
            </div>
          </article>
        ))}
        {record.timelineEvents.slice(0, 4).map((event) => (
          <article key={event.id}>
            <span>{event.date}</span>
            <div>
              <h3>{event.title}</h3>
              <p>{event.detail}</p>
              <small>{sourceLine(event.source)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TasksSection() {
  return (
    <section className="atlas-pdf-section">
      <h2>Items needing attention</h2>
      <div className="atlas-pdf-watchouts">
        {record.missingInformationTasks.map((task) => (
          <article key={task.id}>
            <ShieldCheck size={16} />
            <div>
              <h3>{task.title}</h3>
              <p>{task.reason}</p>
              <small>{task.recommendedAction} / {task.owner} / {task.status}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function readablePrompt(prompt: string) {
  const cleaned = prompt.trim().replace(/\s+/g, ' ');
  return cleaned.length > 96 ? `${cleaned.slice(0, 93)}...` : cleaned;
}

function parseLiveContext(value?: string): LiveDebriefReportContext | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Partial<LiveDebriefReportContext>;
    if (!parsed || typeof parsed !== 'object') return undefined;
    if (!parsed.sessionId || !parsed.buyingGroup || !Array.isArray(parsed.generatedDocuments) || !Array.isArray(parsed.detectedSignals)) return undefined;
    return {
      sessionId: String(parsed.sessionId),
      buyingGroup: String(parsed.buyingGroup),
      prepDeckLabel: String(parsed.prepDeckLabel ?? 'Prep / strategy deck placeholder'),
      startedAt: String(parsed.startedAt ?? new Date().toISOString()),
      endedAt: String(parsed.endedAt ?? new Date().toISOString()),
      detectedSignals: parsed.detectedSignals,
      generatedDocuments: parsed.generatedDocuments
    };
  } catch {
    return undefined;
  }
}

function CustomSection({ intent }: { intent: PromptIntent }) {
  const scenario = getScenario(record, intent.scenarioId);
  const corridor = moduleById('visual-pricing-corridor');
  const promo = moduleById('visual-promo-exposure');

  return (
    <>
      <section className="atlas-pdf-hero">
        <span>Custom ATLAS response</span>
        <h1>{readablePrompt(intent.prompt)}</h1>
        <p>ATLAS does not yet have a dedicated template for this exact request, so it generated a draft answer using the Carrefour strategy packet, current scenario model, watchouts, and evidence placeholders.</p>
      </section>

      <KeyMetrics intent={intent} />

      <section className="atlas-pdf-two-col">
        <div>
          <h2>Draft answer</h2>
          <p>Use the current Carrefour strategy as the anchor: defend a 3.0% counter, keep 3.2% with Q4 phasing as the finance-gated fallback, and avoid sharing internal guardrails unless the audience is CNO or finance.</p>
          <ul>
            <li>Current buyer ask is {pct(record.pricingPosition.currentCustomerAskPct.value)} against a {pct(record.pricingPosition.targetPriceIncreasePct.value)} target.</li>
            <li>Recommended move remains {record.recommendedPosition} while Germany volume recovery is validated.</li>
            <li>Scenario reference: {scenario.name}, {scenario.probabilityToLandPct}% modeled probability to land.</li>
          </ul>
        </div>
        <div>
          <h2>Generated output shape</h2>
          <p>This is a draft placeholder artifact. It is suitable for prototype review and should be refined with real source data before external use.</p>
          <ul>
            <li>Audience inferred: {intent.audience}</li>
            <li>Market inferred: {intent.market}</li>
            <li>Primary sources: {corridor.source.source}; {promo.source.source}</li>
          </ul>
        </div>
      </section>

      <section className="atlas-pdf-section">
        <h2>Supporting data pulled in</h2>
        <div className="atlas-pdf-evidence-grid">
          <EvidenceModuleArticle id="visual-pricing-corridor" index={0} />
          <EvidenceModuleArticle id="visual-scenario-mini" index={1} />
          <EvidenceModuleArticle id="visual-promo-exposure" index={2} />
        </div>
      </section>
    </>
  );
}

function OutputBody({ intent }: { intent: PromptIntent }) {
  switch (intent.kind) {
    case 'scenario':
      return <ScenarioSection intent={intent} />;
    case 'pricingCorridor':
    case 'costPressure':
    case 'shelfComparison':
    case 'promoRisk':
    case 'evidencePack':
      return <EvidenceSection intent={intent} />;
    case 'debrief':
      return <DebriefSection />;
    case 'history':
      return <HistorySection />;
    case 'tasks':
      return <TasksSection />;
    case 'cnoBrief':
    case 'kamPack':
    case 'customerPack':
    case 'strategy':
      return <StrategySection intent={intent} />;
    case 'custom':
    default:
      return <CustomSection intent={intent} />;
  }
}

function Watchouts({ intent }: { intent: PromptIntent }) {
  const watchouts = isExternal(intent)
    ? demoStrategyWatchouts.filter((watchout) => watchout.status === 'supports_strategy').slice(0, 2)
    : demoStrategyWatchouts.slice(0, 3);

  return (
    <section className="atlas-pdf-section">
      <h2>{isExternal(intent) ? 'Approved support points' : 'Watchouts'}</h2>
      <div className="atlas-pdf-watchouts">
        {watchouts.map((watchout) => (
          <article key={watchout.id}>
            <ShieldCheck size={16} />
            <div>
              <h3>{watchout.title}</h3>
              <p>{watchout.whyItMatters}</p>
              <small>{sourceLine(watchout.source)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GeneratedTable({ table }: { table: AtlasGeneratedTable }) {
  return (
    <div className="atlas-generated-table">
      {table.title ? <h3>{table.title}</h3> : null}
      <table>
        <thead>
          <tr>
            {table.columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${table.title}-${rowIndex}`}>
              {table.columns.map((column, columnIndex) => (
                <td key={`${column}-${columnIndex}`}>{row[columnIndex] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isLiveArtifactPrompt(prompt: string) {
  return /PDF-ready .*live .*negotiation|Detected signal:|live data view/i.test(prompt);
}

function resolveSourceDocument(documentId?: string) {
  if (!documentId) return undefined;
  return intelligencePacket.documents.find((document) => document.id === documentId);
}

function buildRetrievedDocumentReport(prompt: string, document: DocumentArtifact): AtlasGeneratedReport {
  const buyingGroup = document.buyingGroupId
    ? intelligencePacket.buyingGroups.find((group) => group.id === document.buyingGroupId)?.name
    : undefined;
  const market = document.marketId
    ? intelligencePacket.markets.find((item) => item.id === document.marketId)?.name
    : undefined;
  const source = document.source;
  const governance = source.governance;

  return {
    title: document.title,
    subtitle: document.summary,
    audience: 'ATLAS source library user',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt: new Date().toISOString(),
    summary: document.summary,
    metrics: [
      { label: 'Document type', value: document.documentType.replaceAll('_', ' '), note: `Stored source from ${document.year}` },
      { label: 'Status', value: document.status.replaceAll('_', ' '), note: document.reusable ? 'Reusable in ATLAS outputs' : 'Review before reuse' },
      { label: 'Buying group', value: buyingGroup ?? 'Europe-wide', note: market ? `Market: ${market}` : 'No single market scope' },
      { label: 'Source confidence', value: source.confidence, note: `${source.sourceName} / ${source.sourceDate}` }
    ],
    sections: [
      {
        title: 'Stored report summary',
        body: document.summary,
        bullets: [
          `Requested as: ${prompt}`,
          `Source owner: ${governance.sourceOwner}`,
          `Allowed use: ${governance.allowedUse.join(', ')}`,
          document.lastUsed ? `Last used: ${new Date(document.lastUsed).toLocaleDateString('en-US')}` : 'No prior retrieval logged in this prototype'
        ]
      },
      {
        title: 'Source trust',
        body: `${source.sourceName} is marked ${source.status.replaceAll('_', ' ')} with ${source.confidence} confidence.`,
        bullets: [
          `Source type: ${source.sourceType.replaceAll('_', ' ')}`,
          `Source date: ${source.sourceDate}`,
          `Approval status: ${governance.approvalStatus.replaceAll('_', ' ')}`,
          governance.caveats.length ? `Caveat: ${governance.caveats.join(' ')}` : 'No caveat recorded'
        ]
      }
    ],
    sources: [
      { label: source.sourceName, detail: `${source.sourceType.replaceAll('_', ' ')} / ${source.sourceDate}` },
      { label: 'ATLAS document library', detail: document.id }
    ],
    caveats: governance.caveats.length
      ? governance.caveats
      : ['Retrieved from the local ATLAS prototype source library. Confirm against source system before external use.']
  };
}

function labelForOutputMode(mode: OutputMode, report: AtlasGeneratedReport) {
  if (mode === 'retrieved') return 'ATLAS retrieved existing report';
  if (mode === 'draft') return 'ATLAS editable draft';
  return report.sourceMode === 'openai' ? 'ATLAS live generated PDF' : 'ATLAS placeholder PDF';
}

function OutputModeBanner({
  editable,
  mode,
  sourceDocument
}: {
  editable: boolean;
  mode: OutputMode;
  sourceDocument?: DocumentArtifact;
}) {
  if (mode === 'retrieved' && sourceDocument) {
    return (
      <section className="atlas-output-mode-banner retrieved">
        <strong>Retrieved from database</strong>
        <span>{sourceDocument.title}</span>
        <em>{sourceDocument.documentType.replaceAll('_', ' ')} / {sourceDocument.year} / {sourceDocument.status}</em>
      </section>
    );
  }

  if (editable) {
    return (
      <section className="atlas-output-mode-banner draft">
        <strong>Editable AI draft</strong>
        <span>No matching approved report was found. ATLAS opened a draft workspace so the user can edit before sharing.</span>
        <em>Manual edits are local in this prototype.</em>
      </section>
    );
  }

  return null;
}

function EditableTextarea({
  ariaLabel,
  className,
  value
}: {
  ariaLabel: string;
  className?: string;
  value: string;
}) {
  return <textarea aria-label={ariaLabel} className={className} defaultValue={value} />;
}

function GeneratedReport({
  editable = false,
  mode = 'generated',
  prompt,
  report,
  sourceDocument
}: {
  editable?: boolean;
  mode?: OutputMode;
  prompt: string;
  report: AtlasGeneratedReport;
  sourceDocument?: DocumentArtifact;
}) {
  const liveArtifact = isLiveArtifactPrompt(prompt);
  const visibleSections = liveArtifact ? report.sections.slice(0, 2) : report.sections;
  const visibleSources = liveArtifact ? report.sources.slice(0, 2) : report.sources;
  const visibleCaveats = liveArtifact ? report.caveats.slice(0, 1) : report.caveats;
  const editHref = sourceDocument
    ? `/atlas-output?prompt=${encodeURIComponent(prompt)}&mode=retrieved&documentId=${encodeURIComponent(sourceDocument.id)}&editable=1`
    : undefined;

  return (
    <main className={`atlas-pdf-page ${liveArtifact ? 'atlas-live-artifact-page' : ''} ${editable ? 'atlas-editable-output-page' : ''}`}>
      <AtlasPdfActions editable={editable} editHref={editHref} mode={mode} />

      <article className="atlas-pdf-document">
        <header className="atlas-pdf-brandbar">
          <strong>PepsiCo</strong>
          <span>{labelForOutputMode(mode, report)}</span>
          <em>{report.model ?? 'offline fallback'}</em>
        </header>

        <OutputModeBanner editable={editable} mode={mode} sourceDocument={sourceDocument} />

        <section className="atlas-pdf-cover">
          <div>
            <span><FileText size={14} /> {mode === 'retrieved' ? 'Retrieved from ATLAS database' : editable ? 'Editable draft from chat' : 'Generated from chat'}</span>
            {editable ? (
              <>
                <EditableTextarea ariaLabel="Edit report title" className="atlas-editable-output-title" value={report.title} />
                <EditableTextarea ariaLabel="Edit report subtitle" className="atlas-editable-output-subtitle" value={report.subtitle || prompt} />
              </>
            ) : (
              <>
                <h1>{mode === 'retrieved' && sourceDocument ? sourceDocument.title : report.title}</h1>
                <p>{sourceDocument?.summary || report.subtitle || prompt}</p>
              </>
            )}
          </div>
          <dl>
            <div><dt>Audience</dt><dd>{report.audience}</dd></div>
            <div><dt>Mode</dt><dd>{mode === 'retrieved' ? 'Retrieved source' : editable ? 'Editable draft' : report.sourceMode === 'openai' ? 'Live model' : 'Offline placeholder'}</dd></div>
            <div><dt>Generated</dt><dd>{new Date(report.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
            <div><dt>Request</dt><dd>{prompt}</dd></div>
            {sourceDocument ? <div><dt>Source</dt><dd>{sourceDocument.source.sourceName}</dd></div> : null}
          </dl>
        </section>

        <section className="atlas-pdf-hero">
          <span>{mode === 'retrieved' ? 'Retrieved answer' : editable ? 'Editable answer' : report.sourceMode === 'openai' ? 'Generated answer' : 'Placeholder answer'}</span>
          {editable ? (
            <EditableTextarea ariaLabel="Edit report summary" className="atlas-editable-output-summary" value={report.summary || report.title} />
          ) : (
            <h1>{sourceDocument?.summary || report.summary || report.title}</h1>
          )}
          {report.sourceMode !== 'openai' && mode === 'generated' ? (
            <p>To make this fully live, add `OPENAI_API_KEY` to the local environment and restart the dev server.</p>
          ) : null}
        </section>

        {report.metrics.length ? (
          <section className="atlas-pdf-metric-strip atlas-generated-metrics" aria-label="Generated metrics">
            {report.metrics.slice(0, 4).map((metric) => (
              <div key={`${metric.label}-${metric.value}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.note}</em>
              </div>
            ))}
          </section>
        ) : null}

        <div className="atlas-generated-sections">
          {visibleSections.map((section) => (
            <section className="atlas-pdf-section" key={section.title}>
              {editable ? (
                <EditableTextarea ariaLabel={`Edit section title: ${section.title}`} className="atlas-editable-output-section-title" value={section.title} />
              ) : (
                <h2>{section.title}</h2>
              )}
              {section.body ? (
                editable ? <EditableTextarea ariaLabel={`Edit section body: ${section.title}`} className="atlas-editable-output-body" value={section.body} /> : <p>{section.body}</p>
              ) : null}
              {section.bullets.length && editable ? (
                <EditableTextarea ariaLabel={`Edit bullets: ${section.title}`} className="atlas-editable-output-bullets" value={(liveArtifact ? section.bullets.slice(0, 3) : section.bullets).join('\n')} />
              ) : section.bullets.length ? (
                <ul className="atlas-generated-bullets">
                  {(liveArtifact ? section.bullets.slice(0, 3) : section.bullets).map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
              {section.table ? <GeneratedTable table={section.table} /> : null}
            </section>
          ))}
        </div>

        <section className="atlas-pdf-section">
          <h2>Sources and caveats</h2>
          <div className="atlas-pdf-watchouts">
            {visibleSources.map((source) => (
              <article key={`${source.label}-${source.detail}`}>
                <ShieldCheck size={16} />
                <div>
                  <h3>{source.label || 'Source'}</h3>
                  <p>{source.detail}</p>
                </div>
              </article>
            ))}
            {visibleCaveats.map((caveat) => (
              <article key={caveat}>
                <ShieldCheck size={16} />
                <div>
                  <h3>Caveat</h3>
                  <p>{caveat}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="atlas-pdf-footer">
          <span>Prompt: {prompt}</span>
          <span>{report.sourceMode === 'openai' ? 'Live model output' : 'Offline placeholder output'}</span>
        </footer>
      </article>
    </main>
  );
}

export default async function AtlasOutputPage({ searchParams }: AtlasOutputPageProps) {
  const query = await searchParams;
  const prompt = query.prompt?.trim() || 'Create the Carrefour strategy brief';
  const sourceDocument = resolveSourceDocument(query.documentId);
  const mode: OutputMode = query.mode === 'retrieved' && sourceDocument ? 'retrieved' : query.mode === 'draft' || query.editable === '1' ? 'draft' : 'generated';
  const editable = mode === 'draft' || query.editable === '1';
  const generatedReport = mode === 'retrieved' && sourceDocument
    ? buildRetrievedDocumentReport(prompt, sourceDocument)
    : await generateAtlasReport(prompt, { liveContext: parseLiveContext(query.liveContext) });
  return <GeneratedReport editable={editable} mode={mode} report={generatedReport} prompt={prompt} sourceDocument={sourceDocument} />;

  const intent = buildIntent(prompt);

  return (
    <main className="atlas-pdf-page">
      <AtlasPdfActions />

      <article className="atlas-pdf-document">
        <header className="atlas-pdf-brandbar">
          <strong>PepsiCo</strong>
          <span>ATLAS generated PDF</span>
          <em>{record.lastSourceSync}</em>
        </header>

        <section className="atlas-pdf-cover">
          <div>
            <span><FileText size={14} /> Generated from prompt</span>
            <h1>{titleForIntent(intent)}</h1>
            <p>{prompt}</p>
          </div>
          <dl>
            <div><dt>Buying group</dt><dd>{record.buyingGroup}</dd></div>
            <div><dt>Market</dt><dd>{intent.market}</dd></div>
            <div><dt>Audience</dt><dd>{intent.audience}</dd></div>
            <div><dt>Status</dt><dd>{record.strategyReadinessState}</dd></div>
          </dl>
        </section>

        <OutputBody intent={intent} />
        {intent.kind !== 'tasks' ? <Watchouts intent={intent} /> : null}

        <footer className="atlas-pdf-footer">
          <span>Source posture: {record.sourceReadiness}</span>
          <span>Generated as draft output. Refine from the ATLAS command screen before sharing.</span>
        </footer>
      </article>
    </main>
  );
}
