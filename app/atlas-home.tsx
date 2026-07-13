'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Mic,
  Newspaper,
  Radar,
  Send,
  Sparkles,
  Target,
  Waves
} from 'lucide-react';

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

type HomeAlert = {
  id: string;
  label: string;
  title: string;
  detail: string;
  buyingGroup: string;
  freshness: string;
  confidence: string;
  href: string;
  actionLabel: string;
  tone: 'risk' | 'signal' | 'approval';
};

type BuyerGroupStatus = {
  id: string;
  name: string;
  region: string;
  stage: string;
  latestAsk: string;
  pepsicoPosition: string;
  readiness: string;
  risk: 'High' | 'Medium' | 'Low';
  nextAction: string;
  updatedAt: string;
  href: string;
};

type AtlasHomeProps = {
  initialPrompt?: string;
};

const NEGOTIATION_ID = 'carrefour-france-2026-pricing';

const briefingAlerts: HomeAlert[] = [
  {
    id: 'carrefour-finance-validation',
    label: 'Needs attention',
    title: 'Carrefour fallback still depends on Germany volume validation.',
    detail: 'The 3.2% fallback with Q4 promo phasing is usable as a draft move, but finance has not cleared the Germany recovery assumption.',
    buyingGroup: 'Carrefour Group',
    freshness: 'Updated today from strategy workspace',
    confidence: 'Medium',
    href: `/negotiation/${NEGOTIATION_ID}`,
    actionLabel: 'Open strategy',
    tone: 'approval'
  },
  {
    id: 'private-label-pressure',
    label: 'Market signal',
    title: 'Private label pressure remains active in France.',
    detail: 'ATLAS is flagging affordability language as the likely buyer anchor. The sell story should keep value proof close to the price defense.',
    buyingGroup: 'Carrefour Group',
    freshness: 'Public signal placeholder, refreshed this week',
    confidence: 'Medium',
    href: `/atlas-output?prompt=${encodeURIComponent('Create a negotiation news and market signal report for Carrefour Group France focused on private label pressure, affordability language, commodity movement, and pricing implications.')}`,
    actionLabel: 'Generate signal brief',
    tone: 'signal'
  },
  {
    id: 'everest-phasing-pattern',
    label: 'Reusable pattern',
    title: 'Everest accepted phasing-led value support in a similar move.',
    detail: 'Internal memory suggests the fallback should be framed as time-boxed phasing, not a permanent concession.',
    buyingGroup: 'Everest Buying Group',
    freshness: 'Synthetic internal memory, Mar 22',
    confidence: 'Medium',
    href: `/atlas-output?prompt=${encodeURIComponent('Compare Carrefour Group strategy against the Everest buying group phasing pattern and identify what can safely be reused.')}`,
    actionLabel: 'Compare pattern',
    tone: 'signal'
  }
];

const buyerGroupStatuses: BuyerGroupStatus[] = [
  {
    id: 'carrefour',
    name: 'Carrefour Group',
    region: 'Western Europe',
    stage: 'Execution',
    latestAsk: '4.2% France',
    pepsicoPosition: 'Hold 3.0% counter',
    readiness: 'Finance validation open',
    risk: 'High',
    nextAction: 'Review fallback scenario',
    updatedAt: 'Today',
    href: `/negotiation/${NEGOTIATION_ID}`
  },
  {
    id: 'everest',
    name: 'Everest Buying Group',
    region: 'DACH',
    stage: 'Prep',
    latestAsk: '3.6% corridor challenge',
    pepsicoPosition: 'Anchor with phasing support',
    readiness: 'Pattern reusable',
    risk: 'Medium',
    nextAction: 'Compare concession pattern',
    updatedAt: 'Yesterday',
    href: `/atlas-output?prompt=${encodeURIComponent('Create a strategy status brief for Everest Buying Group with latest ask, PepsiCo position, risk, and reusable concession pattern.')}`
  },
  {
    id: 'rewe',
    name: 'REWE Group',
    region: 'Central Europe',
    stage: 'Pre-read',
    latestAsk: 'Promo support expected',
    pepsicoPosition: 'Protect base price',
    readiness: 'Needs promo exposure view',
    risk: 'Medium',
    nextAction: 'Generate promo risk readout',
    updatedAt: '2 days ago',
    href: `/atlas-output?prompt=${encodeURIComponent('Create a promo exposure risk readout for REWE Group negotiation prep with placeholder pricing, margin, and source confidence.')}`
  },
  {
    id: 'emz',
    name: 'EMZ / Eurelec',
    region: 'Pan-Europe',
    stage: 'Monitoring',
    latestAsk: 'No formal change',
    pepsicoPosition: 'Track cross-market risk',
    readiness: 'Watch only',
    risk: 'Low',
    nextAction: 'Monitor public signals',
    updatedAt: 'This week',
    href: `/atlas-output?prompt=${encodeURIComponent('Create a monitored buying group status brief for EMZ Eurelec with public signals, cross-market watchouts, and negotiation implications.')}`
  }
];

const suggestedCommands = [
  'Show me my strategy for Carrefour Group',
  'What changed this week that affects my negotiations?',
  'Run 3.2% with Q4 promo phasing',
  'Start Live Negotiator for Carrefour',
  'Generate the CNO brief'
];

function getBrowserSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return (window as unknown as {
    SpeechRecognition?: new () => VoiceRecognition;
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).SpeechRecognition ?? (window as unknown as {
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).webkitSpeechRecognition ?? null;
}

function isReportRoute(href: string) {
  return href.startsWith('/atlas-output');
}

function writeReportLoadingPage(tab: Window | null) {
  if (!tab) return;
  tab.document.write('<!doctype html><title>ATLAS is preparing</title><body style="margin:0;font-family:Inter,Arial,sans-serif;background:#fff;color:#0b1f33;display:grid;min-height:100vh;place-items:center;"><div style="text-align:center;"><strong style="font-size:18px;">ATLAS is preparing your report</strong><p style="color:#5f6f80;font-size:13px;">You can keep using ATLAS while this loads.</p></div></body>');
  tab.document.close();
}

function commandHref(prompt: string) {
  const trimmed = prompt.trim();
  const normalized = trimmed.toLowerCase();
  const encoded = encodeURIComponent(trimmed);

  if (/live|listen|negotiator|meeting room|start session/.test(normalized)) {
    return `/negotiation/${NEGOTIATION_ID}/live`;
  }

  if (/scenario|stress|model|3\.2|3\.0|price|pricing|lever|promo|trade spend|fallback/.test(normalized)) {
    return `/negotiation/${NEGOTIATION_ID}?panel=scenario&scenarioPrompt=${encoded}#scenario`;
  }

  if (/changed|news|market|signal|public|external|this week|alert|risk|at risk/.test(normalized)) {
    return `/atlas-output?prompt=${encoded}`;
  }

  if (/strategy|carrefour|buying group|buyer group|negotiation|readiness/.test(normalized)) {
    return `/negotiation/${NEGOTIATION_ID}`;
  }

  if (/brief|deck|report|pdf|pack|output|p&l|p and l|margin|volume/.test(normalized)) {
    return `/atlas-output?prompt=${encoded}`;
  }

  return `/atlas-output?prompt=${encoded}`;
}

function alertIcon(tone: HomeAlert['tone']) {
  if (tone === 'approval') return <Clock3 size={15} />;
  if (tone === 'risk') return <AlertTriangle size={15} />;
  return <Newspaper size={15} />;
}

function riskClass(risk: BuyerGroupStatus['risk']) {
  return `risk-${risk.toLowerCase()}`;
}

export default function AtlasHome({ initialPrompt = '' }: AtlasHomeProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeRequest, setActiveRequest] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('Opening workspace');
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  function routeCommand(command: string) {
    const trimmed = command.trim();
    if (!trimmed) return;
    const href = commandHref(trimmed);

    setPrompt(trimmed);
    setActiveRequest(trimmed);
    setDestinationLabel(isReportRoute(href) ? 'Building PDF-ready output' : 'Opening the right workspace');
    setIsThinking(true);
    setVoiceStatus('ATLAS is routing the request');
    const outputTab = isReportRoute(href) ? window.open('about:blank', '_blank') : null;
    writeReportLoadingPage(outputTab);

    window.setTimeout(() => {
      if (outputTab) {
        outputTab.location.href = href;
        setIsThinking(false);
        setVoiceStatus('Report opened in a new tab');
        return;
      }
      window.location.href = href;
    }, isReportRoute(href) ? 1250 : 850);
  }

  function startVoiceCommand() {
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceStatus('Voice unavailable in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setVoiceStatus('Listening');
    recognition.onerror = () => {
      setVoiceStatus('Voice stopped. Type the request instead.');
    };
    recognition.onend = () => setVoiceStatus((current) => current.startsWith('Captured:') ? current : '');
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0].transcript?.trim();
      if (!transcript) return;
      setPrompt(transcript);
      setVoiceStatus(`Captured: ${transcript}`);
      routeCommand(transcript);
    };
    recognition.start();
  }

  function submitCommand() {
    const trimmed = (prompt || commandInputRef.current?.value || '').trim();
    if (!trimmed) return;
    routeCommand(trimmed);
  }

  return (
    <main className={`jarvis-page jarvis-immersive atlas-jarvis-home atlas-command-home atlas-home-briefing jarvis-state-${isThinking ? 'thinking' : 'idle'}`}>
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar atlas-home-topbar">
        <a className="jarvis-mark" href="/">
          <Sparkles size={16} />
          <span>ATLAS Strategy OS</span>
        </a>
        <nav aria-label="ATLAS primary navigation">
          <a className="atlas-live-toplink" href={`/negotiation/${NEGOTIATION_ID}`}>
            <FileText size={14} />
            <span>Strategy</span>
          </a>
          <a className="atlas-live-toplink" href={`/negotiation/${NEGOTIATION_ID}/live`}>
            <Waves size={14} />
            <span>Live Negotiator</span>
          </a>
        </nav>
      </header>

      <section className="atlas-home-briefing-shell" aria-label="ATLAS negotiation briefing home">
        <section className="atlas-home-command-card" aria-label="ATLAS assistant command center">
          <div className="jarvis-brand-lockup atlas-lockup">
            <span>Negotiation briefing assistant</span>
            <h1>ATLAS</h1>
            <p>Ask what changed, open a buyer group, run a pricing move, generate a brief, or start the live negotiator.</p>
          </div>

          <div className="jarvis-holo-core thought-low">
            <div className="jarvis-core-ring ring-one" />
            <div className="jarvis-core-ring ring-two" />
            <div className="jarvis-core-ring ring-three" />
            <div className="jarvis-core-scan scan-one" />
            <div className="jarvis-core-scan scan-two" />
            <div className="jarvis-core-grid" />
            <div className="jarvis-core-sigil">
              <Radar size={28} />
            </div>
            <div className="jarvis-thought-nodes">
              {['Briefing', 'Buyer Groups', 'Signals', 'Scenarios', 'Outputs'].map((label, index) => (
                <span className={`jarvis-thought-node node-${index + 1} ${index === 0 ? 'active' : 'waiting'}`} key={label}>
                  <i />
                  <em>{label}</em>
                </span>
              ))}
            </div>
          </div>

          <div className="jarvis-command-surface">
            <form className="jarvis-command-dock" action="/" method="get" onSubmit={(event) => {
              event.preventDefault();
              submitCommand();
            }}>
              <button
                className="jarvis-mic"
                type="button"
                onClick={startVoiceCommand}
                aria-label="Start voice command"
                disabled={isThinking}
              >
                <Mic size={18} />
                <span>Voice</span>
              </button>
              <input
                ref={commandInputRef}
                name="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                aria-label="Ask ATLAS"
                disabled={isThinking}
                placeholder='Say or type "Show me my strategy for Carrefour Group"'
              />
              <button
                className="jarvis-send"
                type="submit"
                aria-label="Send ATLAS command"
                disabled={isThinking}
                onClick={(event) => {
                  event.preventDefault();
                  submitCommand();
                }}
              >
                <Send size={18} />
              </button>
            </form>

            <div className="atlas-home-command-chips" aria-label="Suggested ATLAS commands">
              {suggestedCommands.map((command) => (
                <button type="button" key={command} onClick={() => routeCommand(command)} disabled={isThinking}>
                  {command}
                </button>
              ))}
            </div>

            {isThinking ? (
              <section className="atlas-thinking-panel" aria-live="polite" aria-label="ATLAS thinking">
                <span>{destinationLabel}</span>
                <strong>{activeRequest}</strong>
                <div className="atlas-thinking-steps" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>Classifying the request, selecting the buyer group, checking strategy context, and opening the right work surface.</p>
              </section>
            ) : null}
            {voiceStatus ? <p className="atlas-command-status" aria-live="polite">{voiceStatus}</p> : null}
          </div>
        </section>

        <section className="atlas-home-briefing-grid" aria-label="Negotiation briefing">
          <div className="atlas-home-section-heading">
            <span>Today</span>
            <h2>What needs attention before the next buyer conversation</h2>
          </div>

          <div className="atlas-home-alert-list">
            {briefingAlerts.map((alert) => (
              <a className={`atlas-home-alert ${alert.tone}`} href={alert.href} key={alert.id} {...(isReportRoute(alert.href) ? { rel: 'noreferrer', target: '_blank' } : {})}>
                <span className="atlas-home-alert-icon">{alertIcon(alert.tone)}</span>
                <span>
                  <em>{alert.label} / {alert.buyingGroup}</em>
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                  <i>{alert.freshness} / confidence {alert.confidence}</i>
                </span>
                <b>
                  {alert.actionLabel}
                  <ArrowRight size={14} />
                </b>
              </a>
            ))}
          </div>

          <div className="atlas-home-status-block">
            <div className="atlas-home-section-heading compact">
              <span>Buyer groups</span>
              <h2>Active negotiation status</h2>
            </div>
            <div className="atlas-home-status-list" role="list">
              {buyerGroupStatuses.map((group) => (
                <a className="atlas-home-status-row" href={group.href} key={group.id} role="listitem">
                  <span className="atlas-home-status-name">
                    <strong>{group.name}</strong>
                    <em>{group.region} / {group.stage}</em>
                  </span>
                  <span>
                    <small>Latest ask</small>
                    <strong>{group.latestAsk}</strong>
                  </span>
                  <span>
                    <small>PepsiCo position</small>
                    <strong>{group.pepsicoPosition}</strong>
                  </span>
                  <span>
                    <small>Readiness</small>
                    <strong>{group.readiness}</strong>
                  </span>
                  <span className={`atlas-home-risk ${riskClass(group.risk)}`}>
                    {group.risk}
                  </span>
                  <span className="atlas-home-next-action">
                    <small>{group.updatedAt}</small>
                    <strong>{group.nextAction}</strong>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <aside className="atlas-home-readiness-note" aria-label="ATLAS readiness summary">
            <Target size={16} />
            <strong>ATLAS reads Carrefour as the negotiation that needs the fastest action.</strong>
            <span>Current counter is defensible, but fallback use should remain gated until Germany volume recovery is validated.</span>
            <a href={`/negotiation/${NEGOTIATION_ID}`}>
              Review strategy readiness
              <ArrowRight size={14} />
            </a>
          </aside>

          <aside className="atlas-home-readiness-note quiet" aria-label="ATLAS output readiness">
            <CheckCircle2 size={16} />
            <strong>Ready outputs</strong>
            <span>Pricing corridor visual, CNO brief shell, and live negotiator setup are available from the command line or buyer group row.</span>
            <a href={`/atlas-output?prompt=${encodeURIComponent('Generate a CNO-ready negotiation briefing for Carrefour Group with latest status, key watchouts, source confidence, and next actions.')}`} rel="noreferrer" target="_blank">
              Generate CNO briefing
              <BarChart3 size={14} />
            </a>
          </aside>
        </section>
      </section>
    </main>
  );
}
