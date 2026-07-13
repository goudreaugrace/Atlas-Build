import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  HelpCircle,
  Home,
  Layers3,
  MessageSquareText,
  Route,
  Search,
  Sparkles
} from 'lucide-react';
import modules from '@/src/data/config/grounding-education-modules.json';
import pages from '@/src/data/config/learning-module-pages.json';
import paths from '@/src/data/config/learning-paths.json';
import cases from '@/src/data/config/learning-case-walkthroughs.json';
import MisreadDetector from './MisreadDetector';
import SignalReadLab from './SignalReadLab';
import type { BrandCaseWalkthroughContent } from './BrandCaseWalkthrough';
import type { GroundingEducationModule, LearnModuleContent } from './LearnModulePage';

type LearningPath = {
  id: string;
  title: string;
  kicker: string;
  audience: string;
  estimatedTime: string;
  description: string;
  outcome: string;
  experienceType: string;
  status: 'available' | 'planned';
  moduleIds: string[];
  practicePrompt: string;
};

const typedModules = modules as GroundingEducationModule[];
const typedPages = pages as LearnModuleContent[];
const typedPaths = paths as LearningPath[];
const typedCases = cases as BrandCaseWalkthroughContent[];

const sortedModules = [...typedModules].sort((a, b) => a.order - b.order);
const moduleById = new Map(sortedModules.map((module) => [module.id, module]));
const pageById = new Map(typedPages.map((page) => [page.moduleId, page]));

function PathIcon({ pathId }: { pathId: string }) {
  if (pathId.includes('signals')) return <Layers3 size={20} />;
  if (pathId.includes('brand')) return <MessageSquareText size={20} />;
  if (pathId.includes('action')) return <Route size={20} />;
  if (pathId.includes('certify')) return <GraduationCap size={20} />;
  return <Brain size={20} />;
}

function LearningPathCard({ path }: { path: LearningPath }) {
  const pathModules = path.moduleIds
    .map((moduleId) => moduleById.get(moduleId))
    .filter((module): module is GroundingEducationModule => Boolean(module));

  return (
    <article className={`learn-path-card ${path.status === 'planned' ? 'planned' : ''}`}>
      <div className="learn-path-topline">
        <div className="learn-path-icon"><PathIcon pathId={path.id} /></div>
        <div>
          <span>{path.kicker}</span>
          <h2>{path.title}</h2>
        </div>
      </div>
      <p>{path.description}</p>
      <div className="learn-path-meta">
        <span>{path.audience}</span>
        <span>{path.estimatedTime}</span>
        <span>{path.experienceType}</span>
      </div>
      <div className="learn-path-outcome">
        <BadgeCheck size={16} />
        <strong>{path.outcome}</strong>
      </div>
      <div className="learn-path-modules">
        {pathModules.map((module) => (
          <Link key={module.id} href={`/learn/${module.id}`}>
            <span>Module {module.order}</span>
            <strong>{module.shortTitle}</strong>
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
      <div className="learn-path-practice">
        <HelpCircle size={16} />
        <span>{path.practicePrompt}</span>
      </div>
    </article>
  );
}

function FeaturedModule({ module }: { module: GroundingEducationModule }) {
  const page = pageById.get(module.id);

  return (
    <Link href={`/learn/${module.id}`} className="learn-featured-module">
      <span>Module {module.order}</span>
      <strong>{module.title}</strong>
      <p>{page?.promise ?? module.coreIdea}</p>
      <div>
        {module.keyTerms.slice(0, 3).map((term) => <em key={term}>{term}</em>)}
      </div>
    </Link>
  );
}

function CaseCard({ caseContent }: { caseContent: BrandCaseWalkthroughContent }) {
  return (
    <Link href={`/learn/cases/${caseContent.caseId}`} className="learn-case-card">
      <span>Guided case / {caseContent.estimatedTime}</span>
      <strong>{caseContent.title}</strong>
      <p>{caseContent.subtitle}</p>
      <div>
        {caseContent.learningObjectives.slice(0, 3).map((objective) => <em key={objective}>{objective}</em>)}
      </div>
      <b>Start case <ArrowRight size={15} /></b>
    </Link>
  );
}

export default function LearnHub() {
  const availablePaths = typedPaths.filter((path) => path.status === 'available');
  const plannedPath = typedPaths.find((path) => path.status === 'planned');

  return (
    <main className="learn-hub-page">
      <section className="learn-hub-hero">
        <div className="learn-hero-top">
          <div className="section-kicker"><BookOpen size={14} /> Learn</div>
          <nav className="learn-actions" aria-label="Learning navigation">
            <Link href="/start-here"><BookOpen size={15} /> Start Here</Link>
            <Link href="/"><Home size={15} /> Home</Link>
            <Link href="/brands"><Search size={15} /> Brands</Link>
          </nav>
        </div>
        <div className="learn-hub-hero-layout">
          <div>
            <h1>Build brand equity fluency without turning it into training theater.</h1>
            <p>
              Learn is the strategy-coaching layer for Better Brand Equity, evidence-backed reads, action-path thinking, and responsible AI use. Start high level, go deeper by module, then move toward practice when the prototype is ready.
            </p>
          </div>
          <aside className="learn-hub-principles" aria-label="Learning principles">
            <strong>Learning promise</strong>
            <ul>
              <li><CheckCircle2 size={15} /> Read BBE like an insights lead.</li>
              <li><CheckCircle2 size={15} /> Explain it like a brand leader.</li>
              <li><CheckCircle2 size={15} /> Use AI without losing the evidence.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="learn-hub-orientation">
        <div>
          <div className="section-kicker"><Sparkles size={14} /> Current best path</div>
          <h2>Use Start Here for the fast orientation, then use Learn for deeper judgment.</h2>
          <p>
            The current product shape is intentionally layered: Start Here keeps the executive introduction clean, Learn organizes the education journey, and each module page carries the focused wiki-style depth.
          </p>
        </div>
        <Link href="/start-here">Open Start Here <ArrowRight size={16} /></Link>
      </section>

      <section className="learn-path-section" aria-label="Learning paths">
        <div className="learn-section-heading">
          <div>
            <div className="section-kicker"><Route size={14} /> Paths</div>
            <h2>Recommended learning paths</h2>
          </div>
          <p>Each path is short on purpose. The goal is better brand judgment, not completion for its own sake.</p>
        </div>
        <div className="learn-path-grid">
          {availablePaths.map((path) => <LearningPathCard key={path.id} path={path} />)}
        </div>
      </section>

      <SignalReadLab />

      <MisreadDetector />

      <section className="learn-case-section" aria-label="Practice with a brand">
        <div className="learn-section-heading">
          <div>
            <div className="section-kicker"><Layers3 size={14} /> Practice With A Brand</div>
            <h2>Walk a real brand read from signal to action</h2>
          </div>
          <p>Use a guided case to connect equity signal reading, support lenses, evidence caveats, and action-path implications.</p>
        </div>
        <div className="learn-case-grid">
          {typedCases.map((caseContent) => <CaseCard key={caseContent.caseId} caseContent={caseContent} />)}
        </div>
      </section>

      <section className="learn-library-section" aria-label="Module library">
        <div className="learn-section-heading">
          <div>
            <div className="section-kicker"><ClipboardCheck size={14} /> Module library</div>
            <h2>Focused module pages</h2>
          </div>
          <p>Each page uses the structure the topic needs: signal reads, guardrails, workflows, examples, and meeting questions.</p>
        </div>
        <div className="learn-featured-grid">
          {sortedModules.map((module) => <FeaturedModule key={module.id} module={module} />)}
        </div>
      </section>

      <section className="learn-future-section" aria-label="Future learning layers">
        <div className="learn-future-main">
          <div className="section-kicker"><GraduationCap size={14} /> Future</div>
          <h2>Learning coach and certification come after the content spine is stable.</h2>
          <p>
            The first practice layer is live with Can We Conclude This. The next layers should add a learning-scoped AI coach, then a lightweight grounded-reader check once stakeholder language is settled.
          </p>
          {plannedPath ? (
            <div className="learn-future-path">
              <strong>{plannedPath.title}</strong>
              <span>{plannedPath.practicePrompt}</span>
            </div>
          ) : null}
        </div>
        <div className="learn-future-list">
          <article>
            <MessageSquareText size={18} />
            <strong>AI Learning Coach</strong>
            <p>Ask for teach-backs, meeting explanations, and brand examples with No Magic citations.</p>
          </article>
          <article>
            <GraduationCap size={18} />
            <strong>Grounded Reader Check</strong>
            <p>Lightweight certification for teams using Brand Doctor in recurring reviews.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
