'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { ArrowLeft, Copy, Download, FileText, Mic, Pencil, Save, Send, ShieldCheck, X } from 'lucide-react';
import type { AtlasGeneratedReport, AtlasGeneratedSection, AtlasGeneratedTable } from '@/src/lib/atlas/llm-report';
import { buildAtlasIntelligencePacket } from '@/src/lib/atlas-intelligence/kernel';
import type { DocumentArtifact, SourceMeta } from '@/src/lib/atlas-intelligence/types';

export type GeneratedViewMode = 'retrieved' | 'new_draft' | 'duplicated';
export type GeneratedViewLifecycle = 'retrieved' | 'draft' | 'edited' | 'attached' | 'superseded';

type StoredGeneratedView = {
  artifactType: 'generated_view' | 'negotiation_plan' | 'scenario_output';
  audienceMode: 'internal_cno' | 'leadership_safe' | 'kam_safe' | 'customer_safe';
  id: string;
  lifecycleState: GeneratedViewLifecycle;
  title: string;
  prompt: string;
  mode: GeneratedViewMode;
  buyingGroupId?: string;
  marketId?: string;
  revisionCount: number;
  savedDestination: 'buyer_profile' | 'market_profile' | 'atlas_database';
  savedToProfileAt?: string;
  sourceDocumentId?: string;
  sourceDecision: string;
  summary: string;
  sourceName: string;
  sourceDate: string;
  confidence: string;
  contentSnapshot?: {
    sections: AtlasGeneratedSection[];
    summary: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
};

type GeneratedViewClientProps = {
  autoPrint?: boolean;
  buyingGroupId?: string;
  editable: boolean;
  marketId?: string;
  mode: GeneratedViewMode;
  prompt: string;
  report: AtlasGeneratedReport;
  reportOnly?: boolean;
  source: SourceMeta;
  sourceDocument?: DocumentArtifact;
  storedViewId?: string;
};

const packet = buildAtlasIntelligencePacket();
const GENERATED_VIEW_STORAGE_KEY = 'atlas-generated-views';

function cleanGeneratedSourceLabel(value: string | undefined, fallback = 'ATLAS source') {
  const cleaned = (value ?? '')
    .replace(/\bplaceholder\b/gi, '')
    .replace(/\bprototype\b/gi, 'POC')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || fallback;
}

function readStoredViews(): StoredGeneratedView[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredView(view: StoredGeneratedView) {
  const existing = readStoredViews().filter((item) => item.id !== view.id);
  window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([view, ...existing].slice(0, 60)));
  window.dispatchEvent(new Event('storage'));
}

function sourceStatusLabel(source: SourceMeta) {
  return `${source.sourceType.replaceAll('_', ' ')} · ${source.sourceName} · ${source.sourceDate} · ${source.confidence} confidence · ${source.status.replaceAll('_', ' ')}`;
}

function sourceTypeLabel(source: SourceMeta) {
  const sourceType = source.sourceType as string;
  if (source.sourceType === 'internal') return 'Database fact';
  if (source.sourceType === 'external') return 'External signal';
  if (source.sourceType === 'ai_generated') return 'AI-derived';
  if (source.sourceType === 'modeled') return 'Modeled estimate';
  if (source.sourceType === 'user_entered') return 'User-added';
  if (source.sourceType === 'historical') return 'Historical memory';
  return sourceType.replaceAll('_', ' ');
}

function sourceTypeClass(source: SourceMeta) {
  return `source-type-${source.sourceType.replaceAll('_', '-')}`;
}

function sourceTrustDecision(source: SourceMeta) {
  if (source.sourceType === 'ai_generated') return 'Derived by ATLAS from available context';
  if (source.sourceType === 'modeled') return 'Calculated from scenario assumptions';
  if (source.sourceType === 'user_entered') return 'Added to buyer memory by user';
  if (source.sourceType === 'external') return 'Pulled from public or external signal memory';
  if (source.sourceType === 'historical') return 'Pulled from buyer history';
  return 'Stored source in Intelligence Library';
}

function generatedSourceStatusClass(status: SourceMeta['status']) {
  return `status-${status.replace('_', '-')}`;
}

function GeneratedSourceTrustBar({ source }: { source: SourceMeta }) {
  const [open, setOpen] = useState(false);
  const governance = source.governance;

  return (
    <>
      <section className="atlas-generated-view-trust">
        <ShieldCheck size={17} />
        <span className={`atlas-source-type-pill ${sourceTypeClass(source)}`}>{sourceTypeLabel(source)}</span>
        <strong>{source.sourceName}</strong>
        <span>{sourceTrustDecision(source)}</span>
        <span>{source.sourceDate}</span>
        <span>Updated {source.lastUpdated}</span>
        <span className={`confidence-${source.confidence}`}>Confidence {source.confidence}</span>
        <span className={generatedSourceStatusClass(source.status)}>{source.status.replaceAll('_', ' ')}</span>
        {source.url ? <a href={source.url} rel="noreferrer" target="_blank">Open source</a> : null}
        <button type="button" onClick={() => setOpen(true)}>Inspect source</button>
      </section>
      {open ? (
        <div className="atlas-source-drawer-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <aside className="atlas-source-drawer" aria-label="Source detail" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>Source detail</span>
                <h2>{source.sourceName}</h2>
              </div>
              <button type="button" aria-label="Close source detail" onClick={() => setOpen(false)}><X size={17} /></button>
            </header>
            <section className="atlas-source-drawer-summary">
              <div><span>Type</span><strong>{source.sourceType.replaceAll('_', ' ')}</strong></div>
              <div><span>Status</span><strong>{source.status.replaceAll('_', ' ')}</strong></div>
              <div><span>Confidence</span><strong>{source.confidence}</strong></div>
              <div><span>Canonical</span><strong>{governance.canonicalUseAllowed === 'yes' ? 'Approved' : governance.canonicalUseAllowed === 'with_caveat' ? 'Use with caveat' : 'Not canonical'}</strong></div>
            </section>
            <dl>
              <div><dt>Source owner</dt><dd>{governance.sourceOwner}</dd></div>
              <div><dt>Validation status</dt><dd>{governance.approvalStatus.replaceAll('_', ' ')}</dd></div>
              <div><dt>Allowed use</dt><dd>{governance.allowedUse.map((item) => item.replaceAll('_', ' ')).join(', ')}</dd></div>
              <div><dt>Replacement requirement</dt><dd>{governance.replacementRequirement ?? 'No replacement required for prototype read'}</dd></div>
            </dl>
            {governance.caveats.length ? (
              <section>
                <h3>Caveats</h3>
                <ul>{governance.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
              </section>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function modeLabel(mode: GeneratedViewMode, editable: boolean) {
  if (mode === 'retrieved') return editable ? 'Retrieved scenario source copy' : 'Retrieved scenario source';
  if (mode === 'duplicated') return 'Duplicated scenario output';
  return 'New scenario output';
}

function lifecycleLabel(lifecycleState: GeneratedViewLifecycle) {
  if (lifecycleState === 'attached') return 'Attached to memory';
  if (lifecycleState === 'edited') return 'Edited draft';
  if (lifecycleState === 'retrieved') return 'Retrieved source';
  if (lifecycleState === 'superseded') return 'Superseded';
  return 'Draft';
}

function entityLabel(buyingGroupId?: string, marketId?: string) {
  const group = buyingGroupId ? packet.buyingGroups.find((item) => item.id === buyingGroupId) : undefined;
  const market = marketId ? packet.markets.find((item) => item.id === marketId) : undefined;
  if (group) return { destination: 'buyer_profile' as const, label: 'Save to scenario memory', detail: `${group.name} scenario workspace`, href: `/buying-groups/${group.id}?view=strategy` };
  if (market) return { destination: 'market_profile' as const, label: 'Save to scenario memory', detail: `${market.name} market context`, href: `/scenario-lab?market=${market.id}` };
  return { destination: 'atlas_database' as const, label: 'Save to Intelligence Library', detail: 'source and memory library', href: '/intelligence' };
}

function sourceDecisionForMode(mode: GeneratedViewMode) {
  if (mode === 'retrieved') return 'Retrieved existing approved or working source before creating new content.';
  if (mode === 'duplicated') return 'Duplicated an existing source into an editable working copy.';
  return 'Created a scenario output from available ATLAS context, source memory, and modeled assumptions.';
}

function provenanceDecision(mode: GeneratedViewMode, source: SourceMeta, lifecycleState: GeneratedViewLifecycle) {
  if (lifecycleState === 'attached') return 'Closed loop: saved back to buyer or market memory.';
  if (mode === 'retrieved') return `Retrieved from ${sourceTypeLabel(source).toLowerCase()} before creating anything new.`;
  if (mode === 'duplicated') return 'Duplicated into a user-editable working copy.';
  return 'New AI-derived scenario output. Review, edit, then save before treating it as memory.';
}

function GeneratedTable({ table }: { table: AtlasGeneratedTable }) {
  return (
    <div className="atlas-generated-view-table">
      {table.title ? <h3>{table.title}</h3> : null}
      <table>
        <thead>
          <tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${table.title}-${rowIndex}`}>
              {table.columns.map((column, columnIndex) => <td key={`${column}-${columnIndex}`}>{row[columnIndex] ?? ''}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GeneratedReportVisuals({
  metrics,
  sections
}: {
  metrics: AtlasGeneratedReport['metrics'];
  sections: AtlasGeneratedSection[];
}) {
  if (!metrics.length) return null;
  const actionSection = sections.find((section) => /action|recommend/i.test(section.title)) ?? sections[0];

  return (
    <section className="atlas-generated-report-visuals" aria-label="Generated scenario output template">
      <article className="atlas-generated-report-primary">
        <span>Scenario output</span>
        <div className="atlas-generated-metric-strip" aria-label="Report key metrics">
          {metrics.slice(0, 4).map((metric) => (
            <div className="atlas-generated-metric-tile" key={`${metric.label}-${metric.value}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.note ? <em>{metric.note}</em> : null}
            </div>
          ))}
        </div>
      </article>
      {actionSection ? (
        <article className="atlas-generated-report-action">
          <span>{actionSection.title}</span>
          <h2>{actionSection.body || actionSection.bullets[0]}</h2>
          {actionSection.bullets.length ? (
            <ul>{actionSection.bullets.slice(0, 3).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}

function ScenarioOutputLoop({
  attachment,
  source,
  sections
}: {
  attachment: ReturnType<typeof entityLabel>;
  source: SourceMeta;
  sections: AtlasGeneratedSection[];
}) {
  const buyerResponse = sections.find((section) => /buyer response|pushback|counter/i.test(section.title));
  const evidence = sections.find((section) => /evidence|source|proof|pressure/i.test(section.title));
  const nextMove = sections.find((section) => /action|recommend|next|decision/i.test(section.title));
  const scenario = sections.find((section) => /scenario|model|scope|lever/i.test(section.title)) ?? sections[0];
  const rows = [
    {
      label: 'Scenario tested',
      text: scenario?.bullets[0] ?? scenario?.body ?? 'Scenario assumptions are captured in the output.'
    },
    {
      label: 'Predicted buyer response',
      text: buyerResponse?.body ?? buyerResponse?.bullets[0] ?? 'Buyer response prediction needs review.'
    },
    {
      label: 'Evidence attached',
      text: evidence?.bullets[0] ?? `${source.sourceName} · ${source.confidence} confidence`
    },
    {
      label: 'Memory destination',
      text: `Save to ${attachment.detail} so this can influence future scenario reads.`
    },
    {
      label: 'Next move',
      text: nextMove?.body ?? nextMove?.bullets[0] ?? 'Review, edit, then save before use.'
    }
  ];

  return (
    <section className="atlas-generated-scenario-loop" aria-label="Scenario output loop">
      <header>
        <span>Scenario evidence loop</span>
        <h2>Use this output only if the prediction, evidence, and memory destination are clear.</h2>
      </header>
      <div>
        {rows.map((row) => (
          <article key={row.label}>
            <span>{row.label}</span>
            <strong>{row.text}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function splitReadableText(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function sectionIntent(title: string, index: number) {
  const normalized = title.toLowerCase();
  if (/buyer response|pushback|counter/.test(normalized)) return 'Buyer response';
  if (/scenario|model|scope|lever/.test(normalized)) return 'Scenario';
  if (/action|recommend|next/.test(normalized)) return 'Decision';
  if (/financial|margin|revenue|exposure|impact/.test(normalized)) return 'Impact';
  if (/source|evidence|proof|driving|pressure/.test(normalized)) return 'Evidence';
  return index === 0 ? 'Readout' : 'Context';
}

function editableProps(editable: boolean, onCommit: (value: string) => void) {
  return editable ? {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (event: FocusEvent<HTMLElement>) => onCommit(event.currentTarget.textContent?.trim() ?? '')
  } : {};
}

function GeneratedSectionVisual({
  index,
  metrics,
  section,
  source
}: {
  index: number;
  metrics: AtlasGeneratedReport['metrics'];
  section: AtlasGeneratedSection;
  source: SourceMeta;
}) {
  const intent = sectionIntent(section.title, index);
  const metric = metrics[index % Math.max(metrics.length, 1)];
  const bullets = section.bullets.slice(0, 3);

  if (intent === 'Impact' && metrics.length) {
    return (
      <div className="atlas-generated-section-visual impact" aria-label={`${section.title} impact visualization`}>
        <span>Impact view</span>
        <strong>{metric?.value ?? metrics[0].value}</strong>
        <em>{metric?.label ?? metrics[0].label}</em>
        <small>{metric?.note || `${source.sourceName} · ${source.sourceDate}`}</small>
        <dl>
          <div><dt>Source</dt><dd>{source.sourceName}</dd></div>
          <div><dt>Confidence</dt><dd>{source.confidence}</dd></div>
        </dl>
      </div>
    );
  }

  if (intent === 'Evidence') {
    return (
      <div className="atlas-generated-section-visual evidence" aria-label={`${section.title} evidence visualization`}>
        <span>Evidence</span>
        <strong>{source.confidence}</strong>
        <em>{source.sourceName}</em>
        <small>{source.sourceDate} · {source.status.replaceAll('_', ' ')}</small>
        <dl>
          <div><dt>Type</dt><dd>{source.sourceType.replaceAll('_', ' ')}</dd></div>
          <div><dt>Use</dt><dd>{source.governance.canonicalUseAllowed.replaceAll('_', ' ')}</dd></div>
        </dl>
      </div>
    );
  }

  if (intent === 'Decision') {
    return (
      <div className="atlas-generated-section-visual decision" aria-label={`${section.title} decision visualization`}>
        <span>Decision path</span>
        <ol>
          {(bullets.length ? bullets : ['Use approved source', 'Confirm exposure', 'Save to scenario memory']).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="atlas-generated-section-visual readout" aria-label={`${section.title} readout visualization`}>
      <span>{intent}</span>
      <strong>{metric?.value ?? source.confidence}</strong>
      <em>{metric?.label ?? 'Source confidence'}</em>
      {metric?.note ? <small>{metric.note}</small> : <small>{source.sourceName} · {source.sourceDate}</small>}
      <dl>
        <div><dt>Source</dt><dd>{source.sourceName}</dd></div>
        <div><dt>Updated</dt><dd>{source.sourceDate}</dd></div>
      </dl>
    </div>
  );
}

function EditableBlock({
  editable,
  index,
  metrics,
  onChange,
  source,
  section
}: {
  editable: boolean;
  index: number;
  metrics: AtlasGeneratedReport['metrics'];
  onChange: (section: AtlasGeneratedSection) => void;
  source: SourceMeta;
  section: AtlasGeneratedSection;
}) {
  const isAction = /action|recommend|next/i.test(section.title);
  const bodyLines = splitReadableText(section.body);
  const visibleBodyLines = bodyLines.length ? bodyLines : [''];
  function updateBodyLine(lineIndex: number, value: string) {
    const nextLines = visibleBodyLines.map((line, index) => index === lineIndex ? value : line).filter(Boolean);
    onChange({ ...section, body: nextLines.join(' ') });
  }
  function updateBullet(bulletIndex: number, value: string) {
    onChange({
      ...section,
      bullets: section.bullets.map((bullet, index) => index === bulletIndex ? value : bullet)
    });
  }
  function addBullet() {
    onChange({ ...section, bullets: [...section.bullets, 'New key point'] });
  }
  function removeBullet(bulletIndex: number) {
    onChange({ ...section, bullets: section.bullets.filter((_, index) => index !== bulletIndex) });
  }
  return (
    <section className={`atlas-generated-view-section${isAction ? ' action' : ''}`}>
      <GeneratedSectionVisual index={index} metrics={metrics} section={section} source={source} />
      <div className="atlas-generated-view-section-content">
        <div className="atlas-generated-view-section-head">
          <span>{sectionIntent(section.title, index)}</span>
          <h2
            aria-label={`Edit ${section.title} title`}
            className="atlas-generated-view-section-title"
            {...editableProps(editable, (value) => onChange({ ...section, title: value || section.title }))}
          >
            {section.title}
          </h2>
        </div>
        {section.body || editable ? (
          <div className="atlas-generated-view-body-lines">
            {visibleBodyLines.map((line, lineIndex) => (
              <p
                className={lineIndex === 0 ? 'lead' : 'support'}
                key={`${section.title}-${lineIndex}`}
                aria-label={`Edit ${section.title} executive read ${lineIndex + 1}`}
                {...editableProps(editable, (value) => updateBodyLine(lineIndex, value))}
              >
                {line || 'Add executive read'}
              </p>
            ))}
          </div>
        ) : null}
        {editable ? (
          <div className="atlas-generated-view-edit-list">
            <div>
              <span>Key points</span>
              <button type="button" onClick={addBullet}>Add point</button>
            </div>
            {section.bullets.length ? section.bullets.map((bullet, bulletIndex) => (
              <label className="atlas-generated-edit-point" key={`${section.title}-${bulletIndex}`}>
                <span>{String(bulletIndex + 1).padStart(2, '0')}</span>
                <p
                  aria-label={`Edit ${section.title} key point ${bulletIndex + 1}`}
                  {...editableProps(editable, (value) => updateBullet(bulletIndex, value || bullet))}
                >
                  {bullet}
                </p>
                <button type="button" aria-label={`Remove key point ${bulletIndex + 1}`} onClick={() => removeBullet(bulletIndex)}>×</button>
              </label>
            )) : (
              <button type="button" className="atlas-generated-add-point" onClick={addBullet}>Add first key point</button>
            )}
          </div>
        ) : section.bullets.length ? (
          <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        ) : null}
        {section.table ? <GeneratedTable table={section.table} /> : null}
        <div className="atlas-generated-view-section-source">
          <span>{source.sourceName}</span>
          <span>{source.sourceDate}</span>
          <span>{source.confidence} confidence</span>
        </div>
      </div>
    </section>
  );
}

export default function GeneratedViewClient({
  autoPrint = false,
  buyingGroupId,
  editable: initialEditable,
  marketId,
  mode,
  prompt,
  report,
  reportOnly = false,
  source,
  sourceDocument,
  storedViewId
}: GeneratedViewClientProps) {
  const initialSections = report.sections.length
    ? report.sections
    : [{ title: 'Generated answer', body: report.summary || report.title, bullets: [], table: undefined }];
  const [editable, setEditable] = useState(initialEditable);
  const [title, setTitle] = useState(report.title);
  const [summary, setSummary] = useState(report.summary || report.subtitle || prompt);
  const [sections, setSections] = useState<AtlasGeneratedSection[]>(initialSections);
  const [chatPrompt, setChatPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [revisionCount, setRevisionCount] = useState(0);
  const [lifecycleState, setLifecycleState] = useState<GeneratedViewLifecycle>(mode === 'retrieved' && !initialEditable ? 'retrieved' : 'draft');
  const [loadedStoredViewId, setLoadedStoredViewId] = useState('');
  const [viewId] = useState(() => `generated-view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);
  const printedRef = useRef(false);
  const attachment = useMemo(() => entityLabel(buyingGroupId, marketId), [buyingGroupId, marketId]);
  const duplicateHref = `/generated-views?prompt=${encodeURIComponent(prompt)}&duplicateFrom=${encodeURIComponent(sourceDocument?.id ?? '')}&editable=1${buyingGroupId ? `&buyingGroupId=${buyingGroupId}` : ''}${marketId ? `&marketId=${marketId}` : ''}`;
  const sourceDecision = sourceDecisionForMode(mode);
  const addToWorkspaceHref = buyingGroupId
    ? `/buying-groups/${buyingGroupId}?view=strategy`
    : '';

  useEffect(() => {
    if (!storedViewId || loadedStoredViewId === storedViewId) return;
    const storedView = readStoredViews().find((view) => view.id === storedViewId);
    if (!storedView) return;
    setTitle(storedView.contentSnapshot?.title ?? storedView.title);
    setSummary(storedView.contentSnapshot?.summary ?? storedView.summary ?? summary);
    if (storedView.contentSnapshot?.sections?.length) setSections(storedView.contentSnapshot.sections);
    setRevisionCount(storedView.revisionCount ?? 0);
    setLifecycleState(storedView.lifecycleState ?? 'draft');
    setStatus(`Loaded saved view from ${storedView.savedDestination?.replaceAll('_', ' ') ?? 'ATLAS memory'}.`);
    setLoadedStoredViewId(storedViewId);
  }, [loadedStoredViewId, storedViewId, summary]);

  useEffect(() => {
    if (!autoPrint || printedRef.current) return;
    printedRef.current = true;
    const timer = window.setTimeout(() => window.print(), 700);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  function updateSection(index: number, section: AtlasGeneratedSection) {
    setSections((current) => current.map((item, itemIndex) => itemIndex === index ? section : item));
  }

  function persistView(nextLifecycle: GeneratedViewLifecycle, nextStatus: string) {
    const now = new Date().toISOString();
    writeStoredView({
      artifactType: 'scenario_output',
      audienceMode: 'internal_cno',
      id: viewId,
      lifecycleState: nextLifecycle,
      title,
      prompt,
      mode,
      buyingGroupId,
      marketId,
      revisionCount,
      savedDestination: attachment.destination,
      savedToProfileAt: nextLifecycle === 'attached' ? now : undefined,
      sourceDocumentId: sourceDocument?.id,
      sourceDecision: sourceDecisionForMode(mode),
      summary,
      sourceName: source.sourceName,
      sourceDate: source.sourceDate,
      confidence: source.confidence,
      contentSnapshot: {
        sections,
        summary,
        title
      },
      createdAt: report.generatedAt,
      updatedAt: now
    });
    setLifecycleState(nextLifecycle);
    setStatus(nextStatus);
  }

  function saveDraft() {
    persistView(editable || revisionCount ? 'edited' : 'draft', 'Scenario output saved as a draft. Save it to memory when it should influence future reads.');
  }

  function attachView() {
    persistView('attached', `Saved to ${attachment.detail}.`);
  }

  function addRevisionFromText(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setEditable(true);
    setRevisionCount((current) => current + 1);
    setLifecycleState('edited');
    setSections((current) => [
      {
        title: `Revision from ATLAS chat`,
        body: `Applied request: ${trimmed}`,
        bullets: [
          'Prototype edit added as a new working block.',
          'Manual review required before this view is used as an official source.',
          `Original prompt: ${prompt}`
        ]
      },
      ...current
    ]);
    setStatus('Revision added. Save draft or send it to scenario memory when ready.');
  }

  function refineWithChat() {
    addRevisionFromText(chatPrompt);
    setChatPrompt('');
  }

  return (
    <main className={`atlas-generated-view-page${reportOnly ? ' report-only' : ''}`}>
      <header className="atlas-generated-view-topbar">
        <a href={attachment.href} target="_self"><ArrowLeft size={15} /> Back to {attachment.detail}</a>
        <nav aria-label="Scenario output actions">
              <button type="button" onClick={() => window.print()}><Download size={15} /> Download scenario PDF</button>
          {reportOnly ? null : (
            <>
              <a href={duplicateHref}><Copy size={15} /> Duplicate / edit</a>
              <button type="button" onClick={saveDraft}><Save size={15} /> Save draft</button>
            </>
          )}
          {addToWorkspaceHref ? <a href={addToWorkspaceHref}><Pencil size={15} /> Use in scenario workspace</a> : null}
          <button type="button" className="primary" onClick={attachView}><FileText size={15} /> {attachment.label}</button>
        </nav>
      </header>

      <article className="atlas-generated-view-document">
        <section className="atlas-generated-view-hero">
          <div className="atlas-generated-view-title-row">
            <div>
              <span>{modeLabel(mode, editable)}</span>
              <h1
                aria-label="Edit scenario output title"
                {...editableProps(editable, (value) => setTitle(value || title))}
              >
                {title}
              </h1>
            </div>
            <div className="atlas-generated-view-utility-actions">
              {reportOnly ? null : mode === 'retrieved' && !editable && sourceDocument ? (
                <>
                  <a href={duplicateHref}><Copy size={14} /> Duplicate and edit</a>
                  <button type="button" onClick={() => {
                    setEditable(true);
                    setLifecycleState('edited');
                    setStatus('Retrieved view is now an editable working copy.');
                  }}><Pencil size={14} /> Edit pulled view</button>
                </>
              ) : (
                <button type="button" onClick={saveDraft}><Save size={14} /> {status.startsWith('Draft saved') ? 'Saved' : 'Save draft'}</button>
              )}
            </div>
          </div>
          <div className="atlas-generated-view-summary-card">
            <span>Scenario decision summary</span>
            <p
              aria-label="Edit scenario output summary"
              {...editableProps(editable, (value) => setSummary(value || summary))}
            >
              {summary}
            </p>
          </div>
          <dl>
            <div><dt>Scope</dt><dd>{attachment.detail}</dd></div>
            <div><dt>Origin</dt><dd>{sourceTypeLabel(source)}</dd></div>
            <div><dt>Source</dt><dd>{cleanGeneratedSourceLabel(source.sourceName)}</dd></div>
            <div><dt>Confidence</dt><dd>{source.confidence} · {source.status.replaceAll('_', ' ')}</dd></div>
            <div><dt>Updated</dt><dd>{source.sourceDate}</dd></div>
          </dl>
          <div className="atlas-generated-provenance-callout">
            <span>{lifecycleLabel(lifecycleState)}</span>
            <strong>{provenanceDecision(mode, source, lifecycleState)}</strong>
            <em>{sourceDecision}</em>
          </div>
        </section>

      <GeneratedReportVisuals metrics={report.metrics} sections={sections} />

        <ScenarioOutputLoop attachment={attachment} sections={sections} source={source} />

        <GeneratedSourceTrustBar source={source} />

        <section className="atlas-generated-view-template-head">
          <span>Scenario readout</span>
          <strong>Working scenario output</strong>
          <p>Each section should clarify the selected move, assumptions, predicted buyer response, evidence, and source trail before saving or downloading.</p>
        </section>

        <div className="atlas-generated-view-body">
          <section>
            {sections.map((section, index) => (
              <EditableBlock editable={editable} index={index} key={`${section.title}-${index}`} metrics={report.metrics} onChange={(nextSection) => updateSection(index, nextSection)} section={section} source={source} />
            ))}
          </section>
          {reportOnly ? null : (
          <aside className="atlas-generated-view-chat atlas-command-surface atlas-global-command-surface">
            <div>
              <strong>Review with ATLAS</strong>
              <span>Revise the scenario output, then save it to memory.</span>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              refineWithChat();
            }}>
              <button type="button" className="voice" onClick={() => setStatus('Voice refinement ready. Typed refinement uses the same path.')}><Mic size={14} /> Voice</button>
              <input value={chatPrompt} onChange={(event) => setChatPrompt(event.target.value)} placeholder="Make this CNO-ready..." />
              <button type="submit" className="send" disabled={!chatPrompt.trim()}><Send size={14} /> Send</button>
            </form>
            <div className="atlas-command-surface-examples">
              {['Add buyer history', 'Add scenario evidence', 'Show source gaps', 'Create buyer-counter variant'].map((example) => (
                <button key={example} type="button" onClick={() => {
                  addRevisionFromText(example);
                }}>{example}</button>
              ))}
            </div>
            {status ? (
              <p className="atlas-generated-view-status">
                {status}
                {lifecycleState === 'attached' ? <> <a href={attachment.href}>Open destination</a></> : null}
              </p>
            ) : null}
          </aside>
          )}
        </div>
      </article>
    </main>
  );
}
