'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  Bot,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Mic,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/app/atlas-intelligence-hub';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageRole = 'user' | 'atlas';

interface ReportCard {
  title: string;
  summary: string;
  href: string;
}

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isError?: boolean;
  reportCard?: ReportCard;
  isThinking?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Seeded past conversations (pre-populated history)
// ---------------------------------------------------------------------------

function makeSeedDate(hoursAgo: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

function makeSeedConv(id: string, userText: string, atlasText: string, hoursAgo: number, reportCard?: ReportCard): Conversation {
  const createdAt = makeSeedDate(hoursAgo + 0.05);
  const updatedAt = makeSeedDate(hoursAgo);
  const userMsg: Message = { id: `${id}-u`, role: 'user', text: userText, timestamp: createdAt };
  const atlasMsg: Message = { id: `${id}-a`, role: 'atlas', text: atlasText, timestamp: updatedAt, reportCard };
  return { id, title: userText, messages: [userMsg, atlasMsg], createdAt, updatedAt };
}

const SEED_CONVERSATIONS: Conversation[] = [
  makeSeedConv(
    'seed-1',
    'What is the margin risk exposure for Carrefour this quarter?',
    'Carrefour France shows a margin risk of €14.2M — a 9.4% shift above the modeled corridor. This is driven by a 12% private label push and elevated promotional intensity. Two scenario paths have been pre-modeled.',
    1
  ),
  makeSeedConv(
    'seed-2',
    'Show me competitive signals from Nestlé this week',
    'ATLAS has flagged 3 Nestlé signals this week: a +18% promotional intensity spike in France, a new SKU launch targeting Lay\'s price tier in Germany, and a strategic pricing test in Benelux. Cross-referenced against your scenario models.',
    2
  ),
  makeSeedConv(
    'seed-3',
    'Create a Lay\'s brand equity diagnostic',
    'I\'ve reviewed the available data and intelligence sources for this request. The report has been generated from verified data sources with 87% source confidence. Review the full readout below.',
    4,
    {
      title: "Lay's Brand Equity Diagnostic",
      summary: 'Generated from 12 verified sources · Last updated: Today · Confidence: High',
      href: `/generated-views?prompt=${encodeURIComponent("Create brand equity diagnostic for Lay's")}&mode=draft&editable=1`,
    }
  ),
  makeSeedConv(
    'seed-4',
    'Which buying groups are showing early warning indicators?',
    'Three buying groups are showing early warning indicators this cycle: Carrefour (High, €14.2M at risk), Lidl Germany (Medium, €6.8M), and Auchan France (Low-Medium, €3.1M). All three have elevated private label correlation scores above the 85th percentile.',
    6
  ),
  makeSeedConv(
    'seed-5',
    'Summarize the Lidl negotiation status',
    'Lidl Germany is in pre-negotiation phase. Current margin risk is €6.8M with a Medium risk classification. Their latest counter-position targets a 4.2% price reduction on the snacks corridor. Two scenario paths (concession vs. hold) have been modeled. The next milestone is the Jan 15 alignment meeting.',
    10
  ),
  makeSeedConv(
    'seed-6',
    'Create a European market risk readout',
    'I\'ve reviewed the available data and intelligence sources for this request. The report has been generated from verified data sources with 87% source confidence. Review the full readout below.',
    26,
    {
      title: 'European Market Risk Readout',
      summary: 'Generated from 18 verified sources · Last updated: Yesterday · Confidence: High',
      href: `/generated-views?prompt=${encodeURIComponent('Create European market risk readout')}&mode=draft&editable=1`,
    }
  ),
  makeSeedConv(
    'seed-7',
    'What changed across European markets last week?',
    'Key changes last week: (1) France — Carrefour escalated margin pressure +2.1%; (2) Germany — Lidl held position but Aldi entered price test; (3) Benelux — private label share grew to 38.4%; (4) Poland — new buyer entrant flagged. Net change: 4 alerts escalated, 2 resolved.',
    32
  ),
  makeSeedConv(
    'seed-8',
    'Model a scenario where Carrefour demands a 5% price reduction',
    'Scenario modeled: Carrefour 5% price reduction demand. Net margin impact: −€7.1M. Volume offset required to break even: +14.2% uplift. Recommended counter: tiered promotional support (2.5% + basket-size incentive) preserving €4.8M. Confidence: 83%. Want me to generate the full scenario evidence pack?',
    48
  ),
  makeSeedConv(
    'seed-9',
    'Create a competitor moves intelligence pack',
    'I\'ve reviewed the available data and intelligence sources for this request. The report has been generated from verified data sources with 87% source confidence. Review the full readout below.',
    52,
    {
      title: 'Competitor Moves Intelligence Pack',
      summary: 'Generated from 9 verified sources · Last updated: 2 days ago · Confidence: Medium',
      href: `/generated-views?prompt=${encodeURIComponent('Create competitor moves intelligence pack')}&mode=draft&editable=1`,
    }
  ),
  makeSeedConv(
    'seed-10',
    'Show Aldi margin exposure across all markets',
    'Aldi shows a combined margin exposure of €9.3M across all monitored markets. Breakdown: Germany €4.1M (Stable), France €2.8M (Watch), Poland €1.6M (Stable), Benelux €0.8M (Stable). No active risk escalation at this time. Corridor alignment is within the 7% tolerance band.',
    72
  ),
];

// ---------------------------------------------------------------------------
// Mock Atlas response engine
// ---------------------------------------------------------------------------

const REPORT_TRIGGERS = /report|brief|pack|deck|readout|summary|prep|debrief|create|generate|make|pull up|show me|visual/i;
const REPORT_TOPICS = [
  { pattern: /carrefour/i, title: 'Carrefour Buyer Leverage Readout', prompt: 'Create buyer leverage readout for Carrefour' },
  { pattern: /lay|lays/i, title: "Lay's Brand Equity Diagnostic", prompt: "Create brand equity diagnostic for Lay's" },
  { pattern: /margin|exposure/i, title: 'Margin Exposure Analysis Report', prompt: 'Create margin exposure analysis report' },
  { pattern: /scenario|model/i, title: 'Scenario Impact Model Report', prompt: 'Create scenario impact model report' },
  { pattern: /competitor|rival/i, title: 'Competitor Moves Intelligence Pack', prompt: 'Create competitor moves intelligence pack' },
  { pattern: /market|europe/i, title: 'European Market Risk Readout', prompt: 'Create European market risk readout' },
];

function buildAtlasResponse(prompt: string): { text: string; reportCard?: ReportCard } {
  const p = prompt.toLowerCase();

  if (REPORT_TRIGGERS.test(p)) {
    const matched = REPORT_TOPICS.find((t) => t.pattern.test(p)) ?? REPORT_TOPICS[0];
    return {
      text: `I've reviewed the available data and intelligence sources for this request. The report has been generated from verified data sources with 87% source confidence. Review the full readout below.`,
      reportCard: {
        title: matched.title,
        summary: 'Generated from 12 verified sources · Last updated: Today · Confidence: High',
        href: `/generated-views?prompt=${encodeURIComponent(matched.prompt)}&mode=draft&editable=1`,
      },
    };
  }

  if (/alert|risk|triage/i.test(p)) {
    return {
      text: `There are currently 3 high-priority alerts active across your monitored buying groups. The most critical is a margin risk of €14.2M linked to Carrefour France — a 9.4% shift above the modeled corridor. Two scenario paths have been pre-modeled for review. Would you like me to pull the full triage view or create a readout?`,
    };
  }

  if (/buyer|buying group/i.test(p)) {
    return {
      text: `I found 8 active buying groups in the intelligence database. Carrefour (High risk, €14.2M exposure) and Lidl (Medium risk, €6.8M exposure) are your highest-priority accounts this cycle. Aldi and Tesco both show stabilizing trends. Shall I build a detailed buying group comparison report?`,
    };
  }

  if (/signal|competitor|rival/i.test(p)) {
    return {
      text: `ATLAS has flagged 4 new competitive signals this week: Nestlé increased promotional intensity in France (+18%), Unilever launched a price corridor test in Germany, and two private label expansions in Benelux. These signals have been cross-referenced against your scenario models. Want a competitor leverage readout?`,
    };
  }

  if (/hello|hi|hey|start|help/i.test(p)) {
    return {
      text: `Hello! I'm ATLAS, your brand equity and negotiation intelligence assistant. I can help you analyze buying group risk, review competitive signals, model scenarios, and generate strategic readouts. What would you like to explore today?`,
    };
  }

  return {
    text: `I've analyzed your query against the current intelligence database. Based on available signals, buying group data, and scenario models, here's what I found: the current negotiation environment shows elevated margin pressure (avg. +7.2% above corridor) across Central European markets. Three buying groups are showing early warning indicators. Would you like me to build a detailed report, or should I walk you through the specific risk factors?`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConversationDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function deriveConversationTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New conversation';
  const text = first.text.trim();
  return text.length > 48 ? text.slice(0, 48) + '…' : text;
}

function makeThinkingMessage(): Message {
  return {
    id: generateId(),
    role: 'atlas',
    text: '',
    timestamp: new Date(),
    isThinking: true,
  };
}

// ---------------------------------------------------------------------------
// Default state prompts
// ---------------------------------------------------------------------------

const STARTER_PROMPTS = [
  { label: 'Review active alerts', icon: '⚡', prompt: 'Show me the current high-priority alerts across buying groups' },
  { label: 'Carrefour risk exposure', icon: '📊', prompt: 'What is the margin risk exposure for Carrefour this quarter?' },
  { label: 'Create buyer readout', icon: '📄', prompt: 'Create a buyer leverage readout for Carrefour' },
  { label: 'Competitive signals', icon: '🔍', prompt: 'What competitive signals are active across European markets?' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThinkingBubble() {
  return (
    <div className="atlas-asst-bubble atlas-asst-bubble--atlas" aria-label="Atlas is thinking">
      <div className="atlas-asst-bubble-avatar">
        <Bot size={14} />
      </div>
      <div className="atlas-asst-bubble-body">
        <div className="atlas-asst-thinking-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function AtlasReportCard({ card }: { card: ReportCard }) {
  return (
    <a className="atlas-asst-report-card" href={card.href} target="_blank" rel="noreferrer">
      <div className="atlas-asst-report-card-icon">
        <FileText size={18} />
      </div>
      <div className="atlas-asst-report-card-body">
        <span className="atlas-asst-report-card-eyebrow">REPORT READY</span>
        <strong className="atlas-asst-report-card-title">{card.title}</strong>
        <p className="atlas-asst-report-card-meta">{card.summary}</p>
      </div>
      <div className="atlas-asst-report-card-cta">
        <ExternalLink size={14} />
        <span>Open report</span>
      </div>
    </a>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`atlas-asst-bubble atlas-asst-bubble--${isUser ? 'user' : 'atlas'}${message.isError ? ' atlas-asst-bubble--error' : ''}`}
    >
      {!isUser && (
        <div className="atlas-asst-bubble-avatar" aria-hidden="true">
          {message.isError ? <AlertTriangle size={14} /> : <Bot size={14} />}
        </div>
      )}
      <div className="atlas-asst-bubble-body">
        {message.text && <p className="atlas-asst-bubble-text">{message.text}</p>}
        {message.isError && (
          <button className="atlas-asst-retry-btn" type="button" onClick={() => window.location.reload()}>
            <RefreshCw size={12} /> Retry
          </button>
        )}
        {message.reportCard && <AtlasReportCard card={message.reportCard} />}
        <span className="atlas-asst-bubble-time">{formatTime(message.timestamp)}</span>
      </div>
      {isUser && (
        <div className="atlas-asst-bubble-avatar atlas-asst-bubble-avatar--user" aria-hidden="true">
          <User size={14} />
        </div>
      )}
    </div>
  );
}

function DefaultState({ onPrompt }: { onPrompt: (p: string) => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="atlas-asst-default-state">
      <h1 className="atlas-asst-default-heading">{greeting}</h1>
      <p className="atlas-asst-default-sub">I'm ATLAS — your brand equity &amp; negotiation intelligence agent.</p>
      <p className="atlas-asst-default-sub atlas-asst-default-sub--muted">
        Ask me to analyze buying group risk, review competitive signals, or generate strategic readouts.
      </p>
      <div className="atlas-asst-starter-grid">
        {STARTER_PROMPTS.map((s) => (
          <button key={s.prompt} className="atlas-asst-starter-chip" type="button" onClick={() => onPrompt(s.prompt)}>
            <span className="atlas-asst-starter-chip-icon">{s.icon}</span>
            <span>{s.label}</span>
            <ArrowRight size={13} className="atlas-asst-starter-chip-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SidebarConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`atlas-asst-history-item${isActive ? ' is-active' : ''}`}>
      <button className="atlas-asst-history-item-btn" type="button" onClick={onSelect}>
        <span className="atlas-asst-history-item-title">{deriveConversationTitle(conversation.messages)}</span>
        <span className="atlas-asst-history-item-time">{formatConversationDate(conversation.updatedAt)}</span>
      </button>
      <button
        className="atlas-asst-history-delete-btn"
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Delete conversation"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AssistantClient({ initialPrompt = '' }: { initialPrompt?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);

  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? null;
  const messages = activeConversation?.messages ?? [];
  const isDefaultState = messages.filter((m) => !m.isThinking).length === 0;

  // Scroll thread to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-submit initial prompt if coming from command surface
  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true;
      setTimeout(() => { sendMessage(initialPrompt); }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      let convId = activeConvId;
      if (!convId) {
        convId = generateId();
        const conv: Conversation = {
          id: convId, title: 'New conversation', messages: [],
          createdAt: new Date(), updatedAt: new Date(),
        };
        setConversations((prev) => [conv, ...prev]);
        setActiveConvId(convId);
      }

      const userMsg: Message = { id: generateId(), role: 'user', text: trimmed, timestamp: new Date() };
      const thinkingMsg = makeThinkingMessage();

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, userMsg, thinkingMsg], updatedAt: new Date() }
            : c
        )
      );
      setInput('');
      setIsThinking(true);

      const delay = 900 + Math.random() * 800;
      setTimeout(() => {
        const isError = Math.random() < 0.083;
        let atlasMsg: Message;
        if (isError) {
          atlasMsg = {
            id: generateId(), role: 'atlas',
            text: 'I encountered an issue retrieving data from the intelligence sources. This may be a temporary connection problem. Please try again.',
            timestamp: new Date(), isError: true,
          };
        } else {
          const response = buildAtlasResponse(trimmed);
          atlasMsg = { id: generateId(), role: 'atlas', text: response.text, timestamp: new Date(), reportCard: response.reportCard };
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages.filter((m) => !m.isThinking), atlasMsg], updatedAt: new Date() }
              : c
          )
        );
        setIsThinking(false);
      }, delay);
    },
    [activeConvId, isThinking]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(conversations.filter((c) => c.id !== id)[0]?.id ?? null);
    }
  }

  // Group conversations by recency
  const todayConvs = conversations.filter((c) => new Date().getTime() - c.updatedAt.getTime() < 86400000);
  const yesterdayConvs = conversations.filter((c) => {
    const diff = new Date().getTime() - c.updatedAt.getTime();
    return diff >= 86400000 && diff < 172800000;
  });
  const earlierConvs = conversations.filter((c) => new Date().getTime() - c.updatedAt.getTime() >= 172800000);

  return (
    <AppShell view="assistant" hideCommandSurface>
      {/* Main layout */}
      <div className="atlas-asst-shell">
        {/* Thinking background animation — looping orbs that start/stop with isThinking */}
        <div className={`atlas-asst-thinking-bg${isThinking ? ' is-active' : ''}`} aria-hidden="true">
          <div className="atlas-asst-thinking-bg-orb atlas-asst-thinking-bg-orb--blue" />
          <div className="atlas-asst-thinking-bg-orb atlas-asst-thinking-bg-orb--orange" />
          <div className="atlas-asst-thinking-bg-orb atlas-asst-thinking-bg-orb--teal" />
        </div>
        {/* Sidebar */}
        <aside className={`atlas-asst-sidebar${sidebarOpen ? '' : ' is-collapsed'}`} aria-label="Conversation history">
          <div className="atlas-asst-sidebar-head">
            <button
              className="atlas-asst-sidebar-toggle"
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <X size={14} /> : <Bot size={16} />}
            </button>
            {sidebarOpen && <span className="atlas-asst-sidebar-label">Conversations</span>}
          </div>

          {sidebarOpen && (
            <>
              <button className="atlas-asst-new-conv-btn" type="button" onClick={() => { const id = generateId(); const conv: Conversation = { id, title: 'New conversation', messages: [], createdAt: new Date(), updatedAt: new Date() }; setConversations((prev) => [conv, ...prev]); setActiveConvId(id); }}>
                <Plus size={14} />
                <span>New conversation</span>
              </button>

              <div className="atlas-asst-history-scroll">
                {todayConvs.length > 0 && (
                  <>
                    <p className="atlas-asst-history-group-label">Today</p>
                    {todayConvs.map((conv) => (
                      <SidebarConversationItem key={conv.id} conversation={conv} isActive={conv.id === activeConvId} onSelect={() => setActiveConvId(conv.id)} onDelete={() => handleDeleteConversation(conv.id)} />
                    ))}
                  </>
                )}
                {yesterdayConvs.length > 0 && (
                  <>
                    <p className="atlas-asst-history-group-label">Yesterday</p>
                    {yesterdayConvs.map((conv) => (
                      <SidebarConversationItem key={conv.id} conversation={conv} isActive={conv.id === activeConvId} onSelect={() => setActiveConvId(conv.id)} onDelete={() => handleDeleteConversation(conv.id)} />
                    ))}
                  </>
                )}
                {earlierConvs.length > 0 && (
                  <>
                    <p className="atlas-asst-history-group-label">Earlier</p>
                    {earlierConvs.map((conv) => (
                      <SidebarConversationItem key={conv.id} conversation={conv} isActive={conv.id === activeConvId} onSelect={() => setActiveConvId(conv.id)} onDelete={() => handleDeleteConversation(conv.id)} />
                    ))}
                  </>
                )}
              </div>

              <div className="atlas-asst-sidebar-footer">
                <Clock size={12} />
                <span>History saved locally</span>
              </div>
            </>
          )}
        </aside>

        {/* Thread */}
        <div className="atlas-asst-main">
          <div className="atlas-asst-thread" ref={threadRef} aria-live="polite" aria-label="Conversation thread">
            {isDefaultState ? (
              <DefaultState onPrompt={(p) => sendMessage(p)} />
            ) : (
              <div className="atlas-asst-messages">
                {messages.map((msg) =>
                  msg.isThinking ? <ThinkingBubble key={msg.id} /> : <MessageBubble key={msg.id} message={msg} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input bar (placed outside atlas-asst-main for position fixed enforcement) */}
        <div className={`atlas-asst-input-bar${isFocused ? ' is-focused' : ''}${isThinking ? ' is-thinking' : ''}`}>
          {/* Blurry element on center-bottom underneath input (Figma node 131:2186) */}
          <div className={`atlas-asst-input-glow${isThinking ? ' is-thinking' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 734 456" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#asst-input-blur-filter)">
                <ellipse cx="367" cy="228" rx="273" ry="134" fill="#237FE1" />
              </g>
              <defs>
                <filter id="asst-input-blur-filter" x="0" y="0" width="734" height="456" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="47" result="effect1_foregroundBlur_131_2188" />
                </filter>
              </defs>
            </svg>
          </div>
          <form className="atlas-asst-input-form" onSubmit={handleSubmit}>
            <div className="atlas-asst-input-text-container">
              <textarea
                ref={inputRef}
                className="atlas-asst-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask Atlas..."
                rows={1}
                disabled={isThinking}
                aria-label="Message input"
              />
              <button className="atlas-asst-voice-btn" type="button" disabled={isThinking} aria-label="Voice input" onClick={() => {}}>
                <Mic size={16} />
              </button>
            </div>
            <button
              className="atlas-asst-send-btn"
              type="submit"
              disabled={isThinking || !input.trim()}
              aria-label={isThinking ? 'Processing' : 'Send message'}
            >
              {isThinking ? <Loader2 size={16} className="atlas-asst-spinning" /> : <Send size={16} />}
            </button>
          </form>
          <p className="atlas-asst-input-disclaimer">
            ATLAS responses are based on verified intelligence sources. All diagnoses are for internal strategic planning only.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
