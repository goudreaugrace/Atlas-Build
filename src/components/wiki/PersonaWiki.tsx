'use client';

import { BookText, BrainCircuit, CheckCircle2, ClipboardList, Home, MessageSquareText, Search, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AiPersona } from '@/src/types/domain';

const outputSurfaces = [
  {
    name: 'Executive Summary',
    icon: ClipboardList,
    influenced: 'Changes the strategic framing, headline emphasis, narrative style, and what the summary foregrounds.',
    locked: 'Does not change the deterministic diagnosis badge, KPI facts, metric colors, or evidence status.'
  },
  {
    name: 'Dialog With Data',
    icon: MessageSquareText,
    influenced: 'Changes answer posture, tone, caveat style, and what the assistant tends to explain first.',
    locked: 'Does not change the active brand packet, evidence ledger, treatment library, or missing-data rules.'
  },
  {
    name: 'Brand Conversation',
    icon: BrainCircuit,
    influenced: 'Changes how the dedicated conversation page teaches, challenges, summarizes, or translates the same scoped data.',
    locked: 'Does not widen scope beyond the selected brand, active mode, and No Magic citations.'
  },
  {
    name: 'Live Consult',
    icon: Stethoscope,
    influenced: 'Changes the voice consult personality and spoken reasoning posture while keeping screen actions allowlisted.',
    locked: 'Does not choose new visual actions, invent evidence chips, or override the active brand lock.'
  }
];

const personaChoosingRules = [
  'Use Brand Doctor when you want the balanced default.',
  'Use CMO Advisor when the next decision matters more than methodology.',
  'Use Insights Skeptic when trust, evidence quality, or caveats are the issue.',
  'Use Creative Strategy Partner when the question is about brand meaning, memory, or briefing.',
  'Use RGM / Pricing Partner when Perceived Value or value perception is central.',
  'Use Executive Briefer when you need the shortest meeting-ready read.',
  'Use Byron Sharp Growth Lens when the team is debating mental availability, reach, distinctive assets, or over-narrow targeting.'
];

function PersonaInitials({ persona }: { persona: AiPersona }) {
  return <span className="persona-wiki-mark">{persona.shortName.slice(0, 3)}</span>;
}

export default function PersonaWiki({ personas }: { personas: AiPersona[] }) {
  const [selectedId, setSelectedId] = useState(personas[0]?.id ?? 'brand_doctor');
  const selectedPersona = useMemo(
    () => personas.find((persona) => persona.id === selectedId) ?? personas[0],
    [personas, selectedId]
  );

  return (
    <main className="wiki-page persona-wiki-page">
      <header className="wiki-hero">
        <div>
          <div className="section-kicker"><Sparkles size={14} /> Persona Wiki</div>
          <h1>Pick The Right AI Lens</h1>
          <p>Review each Brand Doctor persona, when to use it, and exactly how it influences summaries, chats, conversations, and Live Consult without changing the underlying facts.</p>
        </div>
        <nav className="wiki-actions" aria-label="Persona wiki navigation">
          <a href="/"><Home size={15} /> Home</a>
          <a href="/brands"><Search size={15} /> Brands</a>
          <a href="/wiki"><BookText size={15} /> Wiki</a>
          <a href="/start-here"><ShieldCheck size={15} /> Start Here</a>
        </nav>
      </header>

      <section className="persona-wiki-guidance" aria-label="Persona guidance">
        <div>
          <div className="section-kicker"><CheckCircle2 size={14} /> How to choose</div>
          <h2>Personas Change The Lens, Not The Diagnosis</h2>
          <p>Each persona adjusts tone, emphasis, reasoning posture, and caveat style. The deterministic diagnosis engine, KPI facts, treatment ranking, evidence ledger, and guardrails stay fixed.</p>
        </div>
        <ul>
          {personaChoosingRules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </section>

      <div className="persona-wiki-shell">
        <aside className="persona-picker-panel" aria-label="Persona selector">
          <label htmlFor="persona-wiki-select">Persona selector</label>
          <select id="persona-wiki-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>{persona.name}</option>
            ))}
          </select>
          <div className="persona-picker-list">
            {personas.map((persona) => (
              <button
                className={persona.id === selectedId ? 'active' : ''}
                key={persona.id}
                onClick={() => setSelectedId(persona.id)}
                type="button"
              >
                <PersonaInitials persona={persona} />
                <span>{persona.name}</span>
                <em>{persona.shortName}</em>
              </button>
            ))}
          </div>
        </aside>

        <section className="persona-definition-panel" aria-live="polite">
          <div className="persona-definition-hero">
            <PersonaInitials persona={selectedPersona} />
            <div>
              <span>{selectedPersona.shortName}</span>
              <h2>{selectedPersona.name}</h2>
              <p>{selectedPersona.description}</p>
            </div>
          </div>

          <div className="persona-definition-grid">
            <article>
              <h3>Best For</h3>
              <ul>
                {selectedPersona.bestFor.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <h3>Response Style</h3>
              <ul>
                {selectedPersona.responseStyle.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article>
              <h3>Decision Bias</h3>
              <p>{selectedPersona.decisionBias}</p>
            </article>
            <article>
              <h3>Caveat Style</h3>
              <p>{selectedPersona.caveatStyle}</p>
            </article>
          </div>

          <section className="persona-system-instruction" aria-label="Persona system instruction">
            <h3>Definition From Config</h3>
            <p>{selectedPersona.systemInstruction}</p>
          </section>
        </section>
      </div>

      <section className="persona-output-map" aria-label="Persona output influence">
        <div className="section-kicker"><BrainCircuit size={14} /> Output Influence Map</div>
        <h2>Where The Persona Shows Up</h2>
        <div>
          {outputSurfaces.map((surface) => {
            const Icon = surface.icon;
            return (
              <article key={surface.name}>
                <Icon size={18} />
                <h3>{surface.name}</h3>
                <p><strong>Influences:</strong> {surface.influenced}</p>
                <p><strong>Locked:</strong> {surface.locked}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
