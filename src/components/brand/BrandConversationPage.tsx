'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, BookOpen, BookText, ClipboardList, Database, Home, MessageSquareText, Network, Search, Send, ShieldAlert, Sparkles } from 'lucide-react';
import {
  aiPersonas,
  formatMetricValue,
  getDiagnosisEvidence,
  getEvidenceConfidence,
  getFollowUpSignals,
  getPrimaryDiagnosis,
  getTreatmentPlanOptions,
  metric
} from '@/src/lib/data';
import { getNoMagicContext } from '@/src/lib/brand-context';
import MarkdownMessage from '@/src/components/common/MarkdownMessage';
import GovernedProofStrip from '@/src/components/intelligence/GovernedProofStrip';
import { governedChatProofFromResponse, type GovernedChatProof } from '@/src/lib/intelligence/governed-proof';
import { activeMentalAvailabilityPacket } from '@/src/lib/mental-availability-ingestion';
import type { BrandHealthRecord, MentalAvailabilitySourcePacket } from '@/src/types/domain';

type ConversationMode = 'explore' | 'diagnose' | 'challenge' | 'prescribe' | 'brief' | 'calibrate';

type ConversationMessage = {
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'grounded_fallback' | 'skill_router';
  proof?: GovernedChatProof;
  citations?: ReturnType<typeof getNoMagicContext>;
};

const conversationModes: { id: ConversationMode; label: string; prompt: string }[] = [
  { id: 'explore', label: 'Explore', prompt: 'What is the most important thing to understand about this brand?' },
  { id: 'diagnose', label: 'Diagnose', prompt: 'Why did this diagnosis fire, and what evidence supports it?' },
  { id: 'challenge', label: 'Challenge', prompt: 'Pressure-test this diagnosis. What could be wrong or missing?' },
  { id: 'prescribe', label: 'Prescribe', prompt: 'What treatment path should we test first, and why?' },
  { id: 'brief', label: 'Brief', prompt: 'Draft a concise executive readout for this brand.' },
  { id: 'calibrate', label: 'Calibrate', prompt: 'What rule or evidence should stakeholders review during calibration?' }
];

function sourceLabel(source: ConversationMessage['source']) {
  if (source === 'skill_router') return 'Governed runtime';
  if (source === 'openai') return 'Live LLM';
  return 'Grounded fallback';
}

function CitationPanel({ citations }: { citations: ReturnType<typeof getNoMagicContext> }) {
  return (
    <details className="no-magic-citations">
      <summary>No Magic: evidence, logic, AI role</summary>
      <div className="citation-grid">
        <div>
          <h3>Evidence Used</h3>
          <ul>
            {citations.evidence.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.value} · {item.status}</span>
                <em>{item.source}</em>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Logic Used</h3>
          <ul>{citations.logic.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h3>AI Role</h3>
          <ul>{citations.aiRole.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </details>
  );
}

export default function BrandConversationPage({ record }: { record: BrandHealthRecord }) {
  const diagnosis = getPrimaryDiagnosis(record);
  const evidence = getDiagnosisEvidence(record);
  const confidence = getEvidenceConfidence(record);
  const treatments = getTreatmentPlanOptions(record);
  const signals = getFollowUpSignals(record);
  const [personaId, setPersonaId] = useState(aiPersonas[0]?.id ?? 'brand_doctor');
  const [conversationMode, setConversationMode] = useState<ConversationMode>('explore');
  const [useGovernedRuntime, setUseGovernedRuntime] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [mentalAvailabilitySourcePacket, setMentalAvailabilitySourcePacket] = useState<MentalAvailabilitySourcePacket | undefined>();
  const citationContext = useMemo(
    () => getNoMagicContext(record, personaId, conversationMode, mentalAvailabilitySourcePacket),
    [record, personaId, conversationMode, mentalAvailabilitySourcePacket]
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      text: `${record.brandName} is currently read as ${diagnosis.name}. Ask a question or choose a mode to explore the diagnosis, evidence, treatment path, or calibration logic.`,
      citations: citationContext
    }
  ]);

  useEffect(() => {
    const refresh = () => setMentalAvailabilitySourcePacket(activeMentalAvailabilityPacket(record.brandId));
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes(`mental-availability:versions:${record.brandId}`)) refresh();
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ brandId?: string }>).detail;
      if (!detail?.brandId || detail.brandId === record.brandId) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('bbe:mental-availability-updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bbe:mental-availability-updated', onCustom);
    };
  }, [record.brandId]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isThinking) return;
    const citations = getNoMagicContext(record, personaId, conversationMode, mentalAvailabilitySourcePacket);
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          brandId: record.brandId,
          category: record.category,
          mode: 'insights',
          activeVisual: conversationMode === 'prescribe' ? 'plan_builder' : conversationMode === 'diagnose' ? 'diagnosis' : 'brand_health_panel',
          personaId,
          conversationMode,
          useSkillRouter: useGovernedRuntime,
          sessionId: useGovernedRuntime ? `brand-conversation-${record.brandId}` : undefined,
          mentalAvailabilitySourcePacket
        })
      });
      const data = await res.json();
      setMessages((current) => [...current, { role: 'assistant', text: data.answer, source: data.source, proof: governedChatProofFromResponse(data), citations }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'I could not reach the chat service. The local diagnosis, rule trace, and data packet are still available.',
          citations
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <main className="conversation-page">
      <header className="conversation-hero">
        <div>
          <div className="section-kicker"><MessageSquareText size={14} /> Brand Conversation</div>
          <h1>{record.brandName}</h1>
          <p>{record.category} · {record.period} · {diagnosis.name}</p>
        </div>
        <div className="conversation-actions">
          <a href="/"><Home size={15} /> Home</a>
          <a href="/brands"><Search size={15} /> Brands</a>
          <a href="/portfolio"><Network size={15} /> Portfolio</a>
          <a href={`/brand/${record.brandId}/assistant`}><Sparkles size={15} /> Assistant</a>
          <a href="/agent-lab"><Sparkles size={15} /> Agent Lab</a>
          <a href="/start-here"><BookOpen size={15} /> Start Here</a>
          <a href="/wiki"><BookText size={15} /> Wiki</a>
          <a href={`/brand/${record.brandId}/report`}><ClipboardList size={15} /> Report</a>
          <a href={`/brand/${record.brandId}/data`}><Database size={15} /> Data View</a>
        </div>
      </header>

      <div className="conversation-shell">
        <section className="conversation-main" aria-label="Brand conversation">
          <div className="conversation-controls">
            <label>
              <span>AI persona</span>
              <select value={personaId} onChange={(event) => setPersonaId(event.target.value)} disabled={isThinking}>
                {aiPersonas.map((persona) => <option key={persona.id} value={persona.id}>{persona.name}</option>)}
              </select>
            </label>
            <label className="conversation-runtime-toggle">
              <span>Runtime</span>
              <button
                type="button"
                className={useGovernedRuntime ? 'active' : ''}
                onClick={() => setUseGovernedRuntime((current) => !current)}
                disabled={isThinking}
                aria-pressed={useGovernedRuntime}
              >
                <BadgeCheck size={14} /> {useGovernedRuntime ? 'Governed' : 'Scoped'}
              </button>
            </label>
            <div className="conversation-mode-row" aria-label="Conversation mode">
              {conversationModes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  className={conversationMode === mode.id ? 'active' : ''}
                  onClick={() => setConversationMode(mode.id)}
                  disabled={isThinking}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="conversation-prompts">
            {conversationModes.map((mode) => (
              <button key={mode.id} type="button" onClick={() => ask(mode.prompt)} disabled={isThinking}>
                <Sparkles size={14} /> {mode.prompt}
              </button>
            ))}
          </div>

          <div className="conversation-messages">
            {messages.map((message, index) => (
              <article className={`conversation-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === 'assistant' ? <MarkdownMessage text={message.text} /> : <p>{message.text}</p>}
                {message.source && <em>{sourceLabel(message.source)}</em>}
                <GovernedProofStrip proof={message.proof} />
                {message.role === 'assistant' && message.citations && <CitationPanel citations={message.citations} />}
              </article>
            ))}
            {isThinking && (
              <article className="conversation-message assistant thinking">
                <p>Reading the evidence, rule trace, and selected persona...</p>
              </article>
            )}
          </div>

          <form className="conversation-input" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask about ${record.brandName}...`} disabled={isThinking} />
            <button type="submit" disabled={isThinking}><Send size={16} /> Ask</button>
          </form>
        </section>

        <aside className="conversation-context" aria-label="Conversation context">
          <div className="context-card diagnosis">
            <span>Primary diagnosis</span>
            <strong>{diagnosis.name}</strong>
            <p>{evidence.ruleSummary}</p>
          </div>
          <div className="context-card">
            <span>Evidence confidence</span>
            <strong>{confidence.label}</strong>
            <p>{confidence.knownBenchmarkCount}/5 benchmark reads · {confidence.knownMomentumCount}/5 momentum reads</p>
          </div>
          <div className="context-card">
            <span>Core metrics</span>
            <ul>
              {['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different'].map((name) => {
                const m = metric(record, name);
                return <li key={name}><strong>{name === 'Pricing Power' ? 'Perceived Value' : name}</strong><span>{formatMetricValue(m?.value)} · {m?.ahead ?? 'Missing'}</span></li>;
              })}
            </ul>
          </div>
          <div className="context-card">
            <span>Treatment shortlist</span>
            <ul>{treatments.slice(0, 3).map((treatment) => <li key={treatment.treatmentId}><strong>{treatment.name}</strong><span>Fit {Math.round(treatment.score)}</span></li>)}</ul>
          </div>
          <div className="context-card guardrail">
            <ShieldAlert size={17} />
            <p>Diagnosis and treatment matching are deterministic/config-driven. AI explains and drafts; it does not invent the diagnosis or treatment library.</p>
          </div>
          <div className="context-card">
            <span>Follow-up signals</span>
            <ul>{signals.nextQuarter.map((signal) => <li key={signal}>{signal}</li>)}</ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
