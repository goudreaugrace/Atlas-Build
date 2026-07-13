import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Home,
  Layers3,
  Lightbulb,
  Route,
  Search,
  ShieldAlert
} from 'lucide-react';

export type GroundingEducationModule = {
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

type NarrativeBlock = {
  type: 'narrative';
  title: string;
  body: string[];
};

type PrincipleGridBlock = {
  type: 'principle-grid';
  title: string;
  items: Array<{ title: string; body: string }>;
};

type SignalReadBlock = {
  type: 'signal-read';
  title: string;
  intro: string;
  signals: Array<{ label: string; read: string; caveat: string }>;
};

type ComparisonBlock = {
  type: 'comparison';
  title: string;
  columns: Array<{ title: string; body: string; bullets?: string[] }>;
};

type WorkflowBlock = {
  type: 'workflow';
  title: string;
  steps: Array<{ label: string; body: string }>;
};

type GuardrailBlock = {
  type: 'guardrail';
  title: string;
  body: string;
  allowed: string[];
  blocked: string[];
};

type ExampleBlock = {
  type: 'example';
  title: string;
  brand: string;
  situation: string;
  read: string;
  whatToDo: string;
};

type QuestionsBlock = {
  type: 'questions';
  title: string;
  prompts: string[];
};

type LearnBlock =
  | NarrativeBlock
  | PrincipleGridBlock
  | SignalReadBlock
  | ComparisonBlock
  | WorkflowBlock
  | GuardrailBlock
  | ExampleBlock
  | QuestionsBlock;

export type LearnModuleContent = {
  moduleId: string;
  eyebrow: string;
  title: string;
  promise: string;
  summary: string;
  heroBullets: string[];
  blocks: LearnBlock[];
};

function BlockIcon({ type }: { type: LearnBlock['type'] }) {
  if (type === 'guardrail') return <ShieldAlert size={18} />;
  if (type === 'workflow') return <Route size={18} />;
  if (type === 'questions') return <HelpCircle size={18} />;
  if (type === 'signal-read' || type === 'comparison') return <Layers3 size={18} />;
  return <Lightbulb size={18} />;
}

function Narrative({ block }: { block: NarrativeBlock }) {
  return (
    <section className="learn-block learn-narrative">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      {block.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
  );
}

function PrincipleGrid({ block }: { block: PrincipleGridBlock }) {
  return (
    <section className="learn-block">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <div className="learn-card-grid">
        {block.items.map((item) => (
          <article key={item.title} className="learn-mini-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SignalRead({ block }: { block: SignalReadBlock }) {
  return (
    <section className="learn-block">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <p className="learn-block-intro">{block.intro}</p>
      <div className="learn-signal-list">
        {block.signals.map((signal) => (
          <article key={signal.label} className="learn-signal-row">
            <strong>{signal.label}</strong>
            <p>{signal.read}</p>
            <em>{signal.caveat}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function Comparison({ block }: { block: ComparisonBlock }) {
  return (
    <section className="learn-block">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <div className={`learn-comparison columns-${Math.min(block.columns.length, 3)}`}>
        {block.columns.map((column) => (
          <article key={column.title}>
            <h3>{column.title}</h3>
            <p>{column.body}</p>
            {column.bullets?.length ? (
              <ul>
                {column.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Workflow({ block }: { block: WorkflowBlock }) {
  return (
    <section className="learn-block">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <ol className="learn-steps">
        {block.steps.map((step, index) => (
          <li key={step.label}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Guardrail({ block }: { block: GuardrailBlock }) {
  return (
    <section className="learn-block learn-guardrail">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <p>{block.body}</p>
      <div className="learn-guardrail-grid">
        <div>
          <strong><CheckCircle2 size={15} /> Useful reads</strong>
          <ul>{block.allowed.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <strong><ShieldAlert size={15} /> Do not conclude</strong>
          <ul>{block.blocked.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function Example({ block }: { block: ExampleBlock }) {
  return (
    <section className="learn-block learn-example">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <div className="learn-example-body">
        <span>{block.brand}</span>
        <p><strong>Situation:</strong> {block.situation}</p>
        <p><strong>Read:</strong> {block.read}</p>
        <p><strong>What to do next:</strong> {block.whatToDo}</p>
      </div>
    </section>
  );
}

function Questions({ block }: { block: QuestionsBlock }) {
  return (
    <section className="learn-block">
      <div className="learn-block-title"><BlockIcon type={block.type} /><h2>{block.title}</h2></div>
      <div className="learn-question-list">
        {block.prompts.map((prompt) => <span key={prompt}>{prompt}</span>)}
      </div>
    </section>
  );
}

function LearnContentBlock({ block }: { block: LearnBlock }) {
  if (block.type === 'narrative') return <Narrative block={block} />;
  if (block.type === 'principle-grid') return <PrincipleGrid block={block} />;
  if (block.type === 'signal-read') return <SignalRead block={block} />;
  if (block.type === 'comparison') return <Comparison block={block} />;
  if (block.type === 'workflow') return <Workflow block={block} />;
  if (block.type === 'guardrail') return <Guardrail block={block} />;
  if (block.type === 'example') return <Example block={block} />;
  return <Questions block={block} />;
}

export default function LearnModulePage({
  module,
  page,
  nextModule,
  previousModule
}: {
  module: GroundingEducationModule;
  page: LearnModuleContent;
  nextModule?: GroundingEducationModule;
  previousModule?: GroundingEducationModule;
}) {
  return (
    <main className="learn-module-page">
      <header className="learn-hero">
        <div className="learn-hero-top">
          <div className="section-kicker"><BookOpen size={14} /> {page.eyebrow}</div>
          <nav className="learn-actions" aria-label="Learning navigation">
            <Link href="/learn"><BookOpen size={15} /> Learn</Link>
            <Link href="/start-here"><ArrowLeft size={15} /> Start Here</Link>
            <Link href="/"><Home size={15} /> Home</Link>
            <Link href="/brands"><Search size={15} /> Brands</Link>
          </nav>
        </div>
        <div className="learn-hero-layout">
          <div>
            <span className="learn-module-number">Module {module.order}</span>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <aside className="learn-promise" aria-label="What this page helps you do">
            <strong>What you will be able to do</strong>
            <p>{page.promise}</p>
            <ul>
              {page.heroBullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </aside>
        </div>
      </header>

      <div className="learn-shell">
        <aside className="learn-sidebar" aria-label="Module quick reference">
          <strong>Quick reference</strong>
          <div className="learn-reference-card">
            <span>Core idea</span>
            <p>{module.coreIdea}</p>
          </div>
          <div className="learn-reference-card caution">
            <span>Common misread</span>
            <p>{module.misreadWarning}</p>
          </div>
          <div className="learn-term-list">
            {module.keyTerms.map((term) => <span key={term}>{term}</span>)}
          </div>
        </aside>

        <article className="learn-content">
          {page.blocks.map((block, index) => <LearnContentBlock block={block} key={`${block.type}-${block.title}-${index}`} />)}
        </article>
      </div>

      <footer className="learn-next">
        {previousModule ? (
          <Link href={`/learn/${previousModule.id}`} className="learn-prev-link">
            <ArrowLeft size={16} />
            <span>Previous</span>
            <strong>{previousModule.shortTitle}</strong>
          </Link>
        ) : <span />}
        {nextModule ? (
          <Link href={`/learn/${nextModule.id}`} className="learn-next-link">
            <span>Next</span>
            <strong>{nextModule.shortTitle}</strong>
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link href="/start-here" className="learn-next-link">
            <span>Back to</span>
            <strong>Start Here</strong>
            <ArrowRight size={16} />
          </Link>
        )}
      </footer>
    </main>
  );
}
