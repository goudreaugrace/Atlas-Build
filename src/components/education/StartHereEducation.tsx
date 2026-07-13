'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BookText,
  Brain,
  CheckCircle2,
  Compass,
  HelpCircle,
  Home,
  LineChart,
  Layers3,
  MessageSquareText,
  Search,
  ShieldAlert
} from 'lucide-react';
import modules from '@/src/data/config/grounding-education-modules.json';
import quiz from '@/src/data/config/grounding-education-quiz.json';

type EducationMode = 'brand-manager' | 'insights-lead';

type EducationModule = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  coreIdea: string;
  brandManagerTakeaway: string;
  insightsLeadDetail: string;
  visualType: string;
  keyTerms: string[];
  example: string;
  misreadWarning: string;
  dialogPrompts: string[];
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type EducationChatMessage = {
  role: 'assistant' | 'user';
  text: string;
  moduleTitle?: string;
  caution?: string;
};

const typedModules = modules as EducationModule[];
const typedQuiz = quiz as QuizQuestion[];

function normalizeText(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, ' ').trim();
}

function moduleScore(module: EducationModule, question: string) {
  const normalizedQuestion = normalizeText(question);
  const haystack = normalizeText([
    module.title,
    module.shortTitle,
    module.coreIdea,
    module.brandManagerTakeaway,
    module.insightsLeadDetail,
    module.keyTerms.join(' '),
    module.dialogPrompts.join(' ')
  ].join(' '));

  return module.keyTerms.reduce((score, term) => score + (normalizedQuestion.includes(normalizeText(term)) ? 4 : 0), 0)
    + module.dialogPrompts.reduce((score, prompt) => score + (normalizeText(prompt).split(' ').some((word) => word.length > 4 && normalizedQuestion.includes(word)) ? 2 : 0), 0)
    + normalizeText(module.shortTitle).split(' ').reduce((score, word) => score + (word.length > 3 && normalizedQuestion.includes(word) ? 3 : 0), 0)
    + (haystack.split(' ').some((word) => word.length > 5 && normalizedQuestion.includes(word)) ? 1 : 0);
}

function answerEducationQuestion(question: string, mode: EducationMode): EducationChatMessage {
  const sorted = [...typedModules]
    .map((module) => ({ module, score: moduleScore(module, question) }))
    .sort((a, b) => b.score - a.score || a.module.order - b.module.order);
  const match = sorted[0]?.score ? sorted[0].module : typedModules.find((module) => module.id === 'brand-doctor-workflow') ?? typedModules[0];
  const audienceRead = mode === 'brand-manager' ? match.brandManagerTakeaway : match.insightsLeadDetail;

  return {
    role: 'assistant',
    moduleTitle: match.title,
    text: `${match.coreIdea} ${audienceRead} Example: ${match.example}`,
    caution: match.misreadWarning
  };
}

function ModuleIcon({ visualType }: { visualType: string }) {
  if (visualType.includes('momentum')) return <LineChart size={22} />;
  if (visualType.includes('guardrail')) return <ShieldAlert size={22} />;
  if (visualType.includes('doctor')) return <Layers3 size={22} />;
  if (visualType.includes('bbe')) return <Brain size={22} />;
  if (visualType.includes('gn')) return <LineChart size={22} />;
  if (visualType.includes('connected')) return <Compass size={22} />;
  return <BookOpen size={22} />;
}

function MiniVisual({ module }: { module: EducationModule }) {
  if (module.visualType === 'bbe-system-diagram') {
    return (
      <div className="education-visual education-flow">
        <div className="flow-node input">Salient<span>mental availability</span></div>
        <div className="flow-node input">Meaningful<span>relevance</span></div>
        <div className="flow-node input">Different<span>distinctiveness</span></div>
        <div className="flow-arrow">-&gt;</div>
        <div className="flow-node output">Demand Power<span>demand strength</span></div>
        <div className="flow-node output">Perceived Value<span>value perception</span></div>
      </div>
    );
  }

  if (module.visualType === 'benchmark-triptych') {
    return (
      <div className="education-visual benchmark-triptych">
        <div><strong>Vs Category</strong><span>Where do I stand in the category?</span></div>
        <div><strong>Ahead</strong><span>Am I ahead of same-size peers?</span></div>
        <div><strong>Momentum</strong><span>Am I improving, holding, or declining?</span></div>
      </div>
    );
  }

  if (module.visualType === 'momentum-ladder') {
    return (
      <div className="education-visual momentum-ladder">
        <span className="state bad">Declining</span>
        <span className="state watch">Holding</span>
        <span className="state good">Gaining</span>
      </div>
    );
  }

  if (module.visualType === 'gn-vitals-map') {
    return (
      <div className="education-visual gn-vitals">
        {['Proposition', 'Reach', 'Resonance', 'Available & Visible', 'Value'].map((item) => <span key={item}>{item}</span>)}
      </div>
    );
  }

  if (module.visualType === 'guardrail-card' && module.id === 'brandz-typologies') {
    return (
      <div className="education-visual guardrail-visual">
        <ShieldAlert size={28} />
        <strong>Source label does not equal product verdict</strong>
      </div>
    );
  }

  if (module.visualType === 'guardrail-card') {
    return (
      <div className="education-visual guardrail-visual">
        <ShieldAlert size={28} />
        <strong>Broad equity signal does not equal SKU price decision</strong>
      </div>
    );
  }

  if (module.visualType === 'doctor-workflow') {
    return (
      <div className="education-visual doctor-flow">
        {['Equity Signals', 'Strategic Read', 'Evidence', 'Action Path', 'Follow-Up'].map((item) => <span key={item}>{item}</span>)}
      </div>
    );
  }

  if (module.visualType === 'connected-action-map') {
    return (
      <div className="education-visual connected-action-map">
        <div className="connected-center">
          <strong>BBE read</strong>
          <span>the spine</span>
        </div>
        <div className="connected-lenses">
          {['Growth Navigator', 'Mental Availability / CEPs', 'Distinctive Assets', 'Physical & Machine Availability', 'Evidence Readiness'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="education-visual hero-callout">
      <strong>{module.shortTitle}</strong>
      <span>{module.keyTerms.join(' · ')}</span>
    </div>
  );
}

function EducationModuleCard({ module, mode }: { module: EducationModule; mode: EducationMode }) {
  return (
    <article className="education-module-card" id={module.id}>
      <div className="module-icon"><ModuleIcon visualType={module.visualType} /></div>
      <div className="module-body">
        <div className="module-eyebrow">Module {module.order}</div>
        <h2>{module.title}</h2>
        <p className="module-core">{module.coreIdea}</p>
        <MiniVisual module={module} />
        <div className="module-takeaway">
          <strong>{mode === 'brand-manager' ? 'Brand manager takeaway' : 'Insights lead detail'}</strong>
          <p>{mode === 'brand-manager' ? module.brandManagerTakeaway : module.insightsLeadDetail}</p>
        </div>
        <div className="module-warning">
          <ShieldAlert size={15} />
          <span>{module.misreadWarning}</span>
        </div>
        <div className="education-card-actions">
          <Link href={`/learn/${module.id}`}>
            Learn more <ArrowRight size={15} />
          </Link>
          <span>{module.keyTerms.slice(0, 3).join(' / ')}</span>
        </div>
      </div>
    </article>
  );
}

function ComprehensionCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const score = useMemo(() => typedQuiz.reduce((total, q) => total + (answers[q.id] === q.correctIndex ? 1 : 0), 0), [answers]);
  const complete = Object.keys(answers).length === typedQuiz.length;

  return (
    <section className="education-check">
      <div className="section-kicker"><HelpCircle size={14} /> Quick comprehension check</div>
      <h2>Before you read a brand, check the basics.</h2>
      <p className="muted">This is not a test. It helps make sure the signal-reading language will make sense.</p>
      <div className="quiz-list">
        {typedQuiz.map((question) => (
          <div key={question.id} className="quiz-card">
            <h3>{question.question}</h3>
            <div className="quiz-options">
              {question.options.map((option, index) => {
                const selected = answers[question.id] === index;
                const correct = question.correctIndex === index;
                const showCorrect = selected && correct;
                const showWrong = selected && !correct;
                return (
                  <button
                    key={option}
                    className={`quiz-option ${selected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''}`}
                    onClick={() => setAnswers({ ...answers, [question.id]: index })}
                  >
                    {showCorrect ? <CheckCircle2 size={15} /> : null}
                    {option}
                  </button>
                );
              })}
            </div>
            {answers[question.id] !== undefined && <p className="quiz-explanation">{question.explanation}</p>}
          </div>
        ))}
      </div>
      <div className={`education-complete ${complete && score >= 6 ? 'ready' : ''}`}>
        <BadgeCheck size={20} />
        <div>
          <strong>{complete ? `${score}/${typedQuiz.length} complete` : 'Answer the questions to build confidence.'}</strong>
          <p>{complete && score >= 6 ? 'You are ready to use Brand Command, Jarvis, Report, Data, and Work with the right guardrails.' : 'Review any missed concepts before relying on the brand read.'}</p>
        </div>
      </div>
    </section>
  );
}

function EducationChat({ mode }: { mode: EducationMode }) {
  const promptChips = useMemo(() => typedModules.map((module) => module.dialogPrompts[0]).filter(Boolean), []);
  const [messages, setMessages] = useState<EducationChatMessage[]>([
    {
      role: 'assistant',
      moduleTitle: 'Grounding helper',
      text: 'Ask about Demand Power, Perceived Value, Salient / Meaningful / Different, benchmarks, momentum, source-context boundaries, Growth Navigator vitals, connected systems, Evidence Readiness, governed workspaces, or what Brand Doctor should not conclude.',
      caution: 'This helper only explains the Start Here education modules. It does not answer as a brand-data chatbot.'
    }
  ]);
  const [input, setInput] = useState('');

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmed },
      answerEducationQuestion(trimmed, mode)
    ]);
    setInput('');
  }

  return (
    <section className="education-chat" aria-labelledby="education-chat-title">
      <div>
        <div className="section-kicker"><MessageSquareText size={14} /> Ask Brand Doctor Basics</div>
        <h2 id="education-chat-title">Ground the language before you read the brand.</h2>
        <p className="muted">Answers stay inside the Start Here education modules and guardrails.</p>
      </div>
      <div className="education-chat-layout">
        <div className="education-chat-prompts">
          {promptChips.map((prompt) => (
            <button key={prompt} type="button" onClick={() => ask(prompt)}>{prompt}</button>
          ))}
        </div>
        <div className="education-chat-panel">
          <div className="education-chat-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`education-chat-message ${message.role}`}>
                {message.moduleTitle && <strong>{message.moduleTitle}</strong>}
                <p>{message.text}</p>
                {message.caution && <em>{message.caution}</em>}
              </div>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); ask(input); }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a BBE basics question..."
            />
            <button type="submit">Ask</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function StartHereEducation() {
  const [mode, setMode] = useState<EducationMode>('brand-manager');
  const sortedModules = useMemo(() => [...typedModules].sort((a, b) => a.order - b.order), []);

  return (
    <main className="start-here-page">
      <section className="start-hero">
        <div className="start-hero-top">
          <div className="section-kicker"><BookOpen size={14} /> Start Here</div>
          <div className="start-hero-actions">
            <Link href="/"><Home size={15} /> Home</Link>
            <Link href="/brands"><Search size={15} /> Brands</Link>
            <Link href="/learn"><BookOpen size={15} /> Learn</Link>
            <Link href="/wiki"><BookText size={15} /> Wiki</Link>
          </div>
        </div>
        <h1>Before the brand read, understand the equity signal panel.</h1>
        <p>
          Brand Doctor starts with Better Brand Equity. This page gives marketers the shared language to read the BBE equity signal panel, understand what connected systems add, and choose the right next surface: Report, Jarvis, Assistant, Data, or a governed Work Shelf asset.
        </p>
        <div className="education-mode-toggle" role="tablist" aria-label="Education depth">
          <button className={mode === 'brand-manager' ? 'active' : ''} onClick={() => setMode('brand-manager')}>Brand Manager View</button>
          <button className={mode === 'insights-lead' ? 'active' : ''} onClick={() => setMode('insights-lead')}>Insights Lead View</button>
        </div>
      </section>

      <section className="education-reader-note" aria-label="A note before you start">
        <div className="reader-note-kicker">A note before you start</div>
        <h2>Brand equity work matters because it shapes the choices people make before they ever reach the shelf, the screen, or the checkout.</h2>
        <p>
          Most teams do not live inside BBE every day. That is okay. This orientation is here to slow the room down just enough to create shared understanding: what the core BBE signals mean, how to avoid common misreads, and how connected systems can help turn the read into smarter marketing action.
        </p>
        <p>
          The important principle is simple: start with the BBE read, believe the evidence, understand what is missing, then decide whether the next step is a question, a data inspection, or a review-draft work asset.
        </p>
      </section>

      <section className="education-principle">
        <Layers3 size={22} />
        <div>
          <strong>The rule: evidence before output.</strong>
          <p>If users do not understand the brand read, they will not trust the action path or the work asset. This page makes the system's signal language legible before the brand command flow begins.</p>
        </div>
      </section>

      <section className="education-modules">
        {sortedModules.map((module) => <EducationModuleCard key={module.id} module={module} mode={mode} />)}
      </section>

      <EducationChat mode={mode} />

      <ComprehensionCheck />

      <section className="education-next-step">
        <div>
          <div className="section-kicker"><ArrowRight size={14} /> Continue</div>
          <h2>Now choose a brand and enter Brand Command.</h2>
          <p>Use the brand home to inspect what is known, ask Jarvis or the stable Assistant, open the full report, inspect data, or launch a governed workspace with proof and gates visible.</p>
        </div>
        <Link className="education-primary-action" href="/brands">Choose a brand <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
