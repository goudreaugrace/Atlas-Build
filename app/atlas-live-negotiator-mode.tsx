'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, FileText, Pin, PinOff, Presentation, Send, Sparkles } from 'lucide-react';
import {
  buildLiveDocumentPrompt,
  getLiveBuyingGroup,
  type LiveDetectedSignal,
  type LiveGeneratedDocument
} from '@/src/lib/atlas/live-negotiator';
import { documentsFor } from '@/src/lib/atlas-intelligence/kernel';
import type { AtlasStatus } from '@/src/lib/atlas-intelligence/types';

type AtlasLiveNegotiatorModeProps = {
  autoStartLive?: boolean;
  initialBuyingGroupId?: string;
  initialPrepDeckLabel?: string;
  initialStartedAt?: string;
  negotiationId: string;
};

type RoomDocument = {
  id: string;
  title: string;
  type: string;
  updated: string;
  prompt: string;
  sourceDate?: string;
  status?: AtlasStatus;
};

const GENERATED_VIEW_STORAGE_KEY = 'atlas-generated-views';

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function confidenceLabel(confidence: LiveGeneratedDocument['confidence']) {
  return `${confidence[0].toUpperCase()}${confidence.slice(1)} confidence`;
}

function editableOutputUrl(prompt: string, buyingGroupId: string) {
  const params = new URLSearchParams({ prompt, mode: 'draft', editable: '1', buyingGroupId });
  return `/generated-views?${params.toString()}`;
}

function inferDocumentType(title: string) {
  if (/prep/i.test(title)) return 'Prep deck';
  if (/strategy/i.test(title)) return 'Strategy deck';
  if (/evidence|proof/i.test(title)) return 'Evidence pack';
  if (/guardrail|scenario|corridor/i.test(title)) return 'Guardrails';
  if (/debrief|history|timeline/i.test(title)) return 'History';
  return 'Reference';
}

function roomDocuments(groupName: string, buyingGroupId: string, prepDeckLabel?: string): RoomDocument[] {
  const buyerDocuments = documentsFor({ buyingGroupId }).map((document) => ({
    id: document.id,
    prompt: `Retrieve ${document.title} for the ${groupName} negotiation room. Show the exact facts, key numbers, source date, confidence, and CNO-ready implication.`,
    sourceDate: document.source.sourceDate,
    status: document.status,
    title: document.title,
    type: document.documentType.replaceAll('_', ' '),
    updated: `${document.source.sourceName} / ${document.source.sourceDate} / ${document.source.confidence} confidence`
  }));
  const databaseDocuments = [
    `${groupName} 2026 negotiation prep deck`,
    `${groupName} strategy deck v3`,
    `${groupName} pricing corridor and red-line guardrails`,
    `${groupName} evidence pack`,
    `${groupName} prior debrief and negotiation history`,
    `${groupName} customer profile and decision memory`
  ];
  const queryDocuments = prepDeckLabel
    ?.split(';')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
  const knownTitles = new Set(buyerDocuments.map((document) => document.title.toLowerCase()));
  const titles = Array.from(new Set([...queryDocuments, ...databaseDocuments])).filter((title) => !knownTitles.has(title.toLowerCase()));

  const placeholderDocuments = titles.map((title, index) => {
    const type = inferDocumentType(title);
    return {
      id: `${type.toLowerCase().replaceAll(' ', '-')}-${index}`,
      title,
      type,
      updated: type === 'Guardrails' ? 'Finance source / current cycle' : type === 'History' ? 'Buyer memory / prior cycles' : 'ATLAS database / latest',
      prompt: `Open ${title} for the ${groupName} negotiation room. Return the exact facts, key numbers, source date, confidence, and the CNO-ready implications.`
    };
  });
  return [...buyerDocuments, ...placeholderDocuments].slice(0, 10);
}

function buildManualSignal(command: string): LiveDetectedSignal {
  return {
    id: makeId('room-request'),
    timestamp: nowIso(),
    type: 'cno_request',
    summary: command,
    extractedNumbers: command.match(/\d+(?:\.\d+)?%?/g) ?? ['No explicit number captured'],
    sourceMode: 'manual_command',
    confidence: 'medium',
    recommendedDocumentType: 'CNO requested room readout'
  };
}

function createRoomReport(command: string, negotiationId: string, buyingGroupId: string, prepDeckLabel: string): LiveGeneratedDocument {
  const group = getLiveBuyingGroup(buyingGroupId);
  const signal = buildManualSignal(command);
  const prompt = buildLiveDocumentPrompt(signal, group, prepDeckLabel);
  return {
    id: makeId('room-report'),
    sessionId: `room-${negotiationId}-${buyingGroupId}`,
    title: command,
    documentType: signal.recommendedDocumentType,
    trigger: `CNO asked: ${command}`,
    prompt,
    createdAt: signal.timestamp,
    confidence: signal.confidence,
    sourceFreshness: `Manual room request / ${new Date(signal.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
    openUrl: editableOutputUrl(prompt, buyingGroupId)
  };
}

function saveRoomReportToHistory(report: LiveGeneratedDocument, buyingGroupId: string) {
  const now = new Date().toISOString();
  const storedView = {
    artifactType: 'generated_view',
    audienceMode: 'internal_cno',
    buyingGroupId,
    confidence: report.confidence,
    createdAt: report.createdAt,
    id: `live-room-memory-${report.id}`,
    lifecycleState: 'attached',
    mode: 'new_draft',
    prompt: report.prompt,
    revisionCount: 0,
    savedDestination: 'buyer_profile',
    savedToProfileAt: now,
    sourceDate: report.createdAt.slice(0, 10),
    sourceDecision: 'Generated in Live Room from a CNO room request and saved to buyer history.',
    sourceName: report.sourceFreshness,
    summary: report.trigger,
    title: report.title,
    updatedAt: now
  };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
    const allViews = Array.isArray(parsed) ? parsed : [];
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([storedView, ...allViews.filter((item: { id?: string }) => item.id !== storedView.id)].slice(0, 60)));
    window.dispatchEvent(new Event('storage'));
  } catch {
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([storedView]));
    window.dispatchEvent(new Event('storage'));
  }
}

function openGeneratedViewInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function ReportOpenForm({ href, label, onOpen }: { href: string; label: string; onOpen?: () => void }) {
  return (
    <button className="atlas-room-open-report-button" type="button" onClick={() => {
      openGeneratedViewInNewTab(href);
      onOpen?.();
    }}>
      {label} <ExternalLink size={13} />
    </button>
  );
}

export default function AtlasLiveNegotiatorMode({
  initialBuyingGroupId,
  initialPrepDeckLabel,
  negotiationId
}: AtlasLiveNegotiatorModeProps) {
  const group = getLiveBuyingGroup(initialBuyingGroupId || 'carrefour');
  const prepDeckLabel = initialPrepDeckLabel || `${group.name} 2026 prep documents`;
  const documents = useMemo(() => roomDocuments(group.name, group.id, prepDeckLabel), [group.id, group.name, prepDeckLabel]);
  const [command, setCommand] = useState('');
  const [reports, setReports] = useState<LiveGeneratedDocument[]>([]);
  const [pinnedReportIds, setPinnedReportIds] = useState<string[]>([]);
  const [roomStatus, setRoomStatus] = useState('');
  const pinnedReports = reports.filter((report) => pinnedReportIds.includes(report.id));
  const quickPrompts = [
    'Current red line and pricing corridor',
    'Margin exposure if we move 0.5 pts',
    'Buyer history on concessions',
    'Buyer-safe proof point summary'
  ];

  function togglePinnedReport(id: string) {
    setPinnedReportIds((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function submitCommand(nextCommand = command) {
    const trimmed = nextCommand.trim();
    if (!trimmed) return;
    const report = createRoomReport(trimmed, negotiationId, group.id, prepDeckLabel);
    setReports((current) => [...current, report]);
    openGeneratedViewInNewTab(report.openUrl);
    setCommand('');
    setRoomStatus('Opening report in a new tab.');
  }

  return (
    <main className="atlas-room-page">
      <header className="atlas-room-header">
        <a href={`/buying-groups/${group.id}`} aria-label={`Back to ${group.name}`}>
          <ArrowLeft size={16} /> {group.name}
        </a>
        <div>
          <span>Room companion</span>
          <h1>{group.name}</h1>
          <p>{group.region} / {group.activeMarket}</p>
        </div>
        <dl>
          <div><dt>Stage</dt><dd>{group.stage}</dd></div>
          <div><dt>Position</dt><dd>{group.strategy}</dd></div>
          <div><dt>Docs</dt><dd>{documents.length}</dd></div>
          <div><dt>Reports</dt><dd>{reports.length}</dd></div>
        </dl>
      </header>

      <section className="atlas-room-grid">
        <section className="atlas-room-assistant" aria-label="ATLAS room assistant">
          <section className="atlas-room-chat-card">
            <div className="atlas-room-chat-intro">
              <Sparkles size={18} />
              <div>
                <h2>Pull up what you need.</h2>
              </div>
            </div>

            <div className="atlas-room-quick-prompts" aria-label="Suggested room requests">
              {quickPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => submitCommand(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <form className="atlas-room-command" onSubmit={(event) => {
              event.preventDefault();
              submitCommand();
            }}>
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Ask for a pricing visual, key data point, buyer history, margin read, or proof point..."
                aria-label="Ask ATLAS for a room report"
              />
              <button type="submit" disabled={!command.trim()}>
                <Send size={15} /> Send
              </button>
            </form>
            {roomStatus ? <p className="atlas-room-status">{roomStatus}</p> : null}
          </section>

          <section className="atlas-room-report-stream" aria-label="Reports pulled during room">
            <header>
              <h2>Reports pulled</h2>
              <span>{reports.length ? 'Newest at bottom' : 'Ready'}</span>
            </header>
            <div>
              {reports.length ? reports.map((report) => (
                <article key={report.id}>
                  <FileText size={16} />
                  <div>
                    <span>{new Date(report.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} / editable PDF draft</span>
                    <h3>{report.title}</h3>
                    <p>{report.sourceFreshness} / {confidenceLabel(report.confidence)}</p>
                  </div>
                  <button
                    type="button"
                    className={pinnedReportIds.includes(report.id) ? 'active' : ''}
                    onClick={() => togglePinnedReport(report.id)}
                    aria-label={pinnedReportIds.includes(report.id) ? `Unpin ${report.title}` : `Pin ${report.title}`}
                  >
                    {pinnedReportIds.includes(report.id) ? <PinOff size={13} /> : <Pin size={13} />}
                  </button>
                  <ReportOpenForm href={report.openUrl} label="Open report" onOpen={() => {
                    setRoomStatus('Report opened in a new tab. The live room stays active.');
                  }} />
                  <button type="button" onClick={() => {
                    saveRoomReportToHistory(report, group.id);
                    setRoomStatus('Report saved to buyer history.');
                  }}>Add to history</button>
                </article>
              )) : (
                <div className="atlas-room-empty">
                  <FileText size={18} />
                  <strong>No reports pulled yet.</strong>
                  <p>Ask for a margin bridge, red-line visual, buyer history, scenario impact, or proof point.</p>
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="atlas-room-reference" aria-label="Room documents">
          <section>
            <header>
              <h2>Room documents</h2>
              <span>{documents.length} loaded</span>
            </header>
            <div className="atlas-room-doc-list">
              {documents.map((document) => (
                <a href={editableOutputUrl(document.prompt, group.id)} target="_blank" rel="noreferrer" key={document.id}>
                  <i>{document.type === 'Prep deck' || document.type === 'Strategy deck' ? <Presentation size={15} /> : <BookOpen size={15} />}</i>
                  <span>{document.type}</span>
                  <strong>{document.title}</strong>
                  <em>{document.updated}{document.status ? ` / ${document.status}` : ''}</em>
                </a>
              ))}
            </div>
          </section>

          <section className="atlas-room-pinned">
            <header>
              <h2>Pinned reports</h2>
              <span>{pinnedReports.length ? `${pinnedReports.length} pinned` : 'None yet'}</span>
            </header>
            <div>
              {pinnedReports.length ? pinnedReports.map((report) => (
                <div className="atlas-room-pinned-report" key={`pinned-${report.id}`}>
                  <FileText size={14} />
                  <strong>{report.title}</strong>
                  <em>{new Date(report.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</em>
                  <ReportOpenForm href={report.openUrl} label="Open" onOpen={() => {
                    setRoomStatus('Pinned report opened in a new tab.');
                  }} />
                </div>
              )) : (
                <p>Pin the reports you need to keep visible during the conversation.</p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
