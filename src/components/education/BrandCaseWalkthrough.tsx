'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Layers3,
  RotateCcw,
  Search,
  XCircle
} from 'lucide-react';
import modules from '@/src/data/config/grounding-education-modules.json';
import type { GroundingEducationModule } from './LearnModulePage';

type CaseSignalTone = 'good' | 'watch' | 'bad';

type CaseChoice = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
};

export type BrandCaseStep = {
  id: string;
  title: string;
  moduleId: string;
  prompt: string;
  context: string;
  signalCards: Array<{ label: string; value: string; tone: CaseSignalTone }>;
  choices: CaseChoice[];
  coaching: string;
  evidenceRefs: string[];
};

export type BrandCaseWalkthroughContent = {
  caseId: string;
  brandId: string;
  title: string;
  subtitle: string;
  audience: string;
  estimatedTime: string;
  scenario: string;
  learningObjectives: string[];
  sourceCaveat: string;
  steps: BrandCaseStep[];
  completion: {
    headline: string;
    summary: string;
    nextSteps: string[];
    reportLink: string;
    reportCtaLabel?: string;
  };
};

const typedModules = modules as GroundingEducationModule[];
const moduleById = new Map(typedModules.map((module) => [module.id, module]));

function toneLabel(tone: CaseSignalTone) {
  if (tone === 'good') return 'Strength';
  if (tone === 'bad') return 'Watchout';
  return 'Mixed';
}

export default function BrandCaseWalkthrough({ caseContent }: { caseContent: BrandCaseWalkthroughContent }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const activeStep = caseContent.steps[activeStepIndex] ?? caseContent.steps[0];
  const selectedChoiceId = answers[activeStep.id];
  const selectedChoice = activeStep.choices.find((choice) => choice.id === selectedChoiceId);
  const correctChoice = activeStep.choices.find((choice) => choice.isCorrect);
  const relatedModule = moduleById.get(activeStep.moduleId);
  const isLastStep = activeStepIndex === caseContent.steps.length - 1;

  const score = useMemo(
    () => caseContent.steps.reduce((total, step) => {
      const answer = answers[step.id];
      const choice = step.choices.find((item) => item.id === answer);
      return total + (choice?.isCorrect ? 1 : 0);
    }, 0),
    [answers, caseContent.steps]
  );
  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === caseContent.steps.length;

  function chooseAnswer(choiceId: string) {
    setAnswers((current) => ({ ...current, [activeStep.id]: choiceId }));
  }

  function nextStep() {
    setActiveStepIndex((current) => Math.min(current + 1, caseContent.steps.length - 1));
  }

  function previousStep() {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  function resetCase() {
    setAnswers({});
    setActiveStepIndex(0);
  }

  return (
    <main className="brand-case-page">
      <header className="brand-case-hero">
        <div className="learn-hero-top">
          <div className="section-kicker"><Layers3 size={14} /> Guided Brand Case</div>
          <nav className="learn-actions" aria-label="Case navigation">
            <Link href="/learn"><BookOpen size={15} /> Learn</Link>
            <Link href="/"><Home size={15} /> Home</Link>
            <Link href="/brands"><Search size={15} /> Brands</Link>
          </nav>
        </div>
        <div className="brand-case-hero-layout">
          <div>
            <span className="learn-module-number">{caseContent.audience} / {caseContent.estimatedTime}</span>
            <h1>{caseContent.title}</h1>
            <p>{caseContent.subtitle}</p>
            <p>{caseContent.scenario}</p>
          </div>
          <aside className="brand-case-objectives" aria-label="Case learning objectives">
            <strong>What you will practice</strong>
            <ul>
              {caseContent.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ul>
          </aside>
        </div>
      </header>

      <section className="brand-case-caveat">
        <ClipboardCheck size={18} />
        <p>{caseContent.sourceCaveat}</p>
      </section>

      <section className="brand-case-workbench" aria-label="Guided walkthrough">
        <aside className="brand-case-steps">
          <div className="brand-case-score">
            <strong>{score}/{caseContent.steps.length}</strong>
            <span>{answeredCount} answered</span>
            <button type="button" onClick={resetCase}><RotateCcw size={14} /> Reset</button>
          </div>
          <div className="brand-case-step-list">
            {caseContent.steps.map((step, index) => {
              const answer = answers[step.id];
              const choice = step.choices.find((item) => item.id === answer);
              return (
                <button
                  key={step.id}
                  type="button"
                  className={activeStep.id === step.id ? 'active' : ''}
                  onClick={() => setActiveStepIndex(index)}
                >
                  <span>Step {index + 1}</span>
                  <strong>{step.title}</strong>
                  {choice ? (
                    <em className={choice.isCorrect ? 'correct' : 'wrong'}>
                      {choice.isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {choice.isCorrect ? 'Good read' : 'Review'}
                    </em>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <article className="brand-case-card">
          <div className="brand-case-card-top">
            <span>Step {activeStepIndex + 1} of {caseContent.steps.length}</span>
            <h2>{activeStep.title}</h2>
            <p>{activeStep.context}</p>
          </div>

          <div className="brand-case-signal-grid">
            {activeStep.signalCards.map((signal) => (
              <div key={`${activeStep.id}-${signal.label}`} className={`brand-case-signal ${signal.tone}`}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <em>{toneLabel(signal.tone)}</em>
              </div>
            ))}
          </div>

          <div className="brand-case-prompt">
            <span>Question</span>
            <p>{activeStep.prompt}</p>
          </div>

          <div className="brand-case-choice-grid" role="group" aria-label="Choose the best case read">
            {activeStep.choices.map((choice) => {
              const selected = selectedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`${selected ? 'selected' : ''} ${selected && choice.isCorrect ? 'correct' : ''} ${selected && !choice.isCorrect ? 'wrong' : ''}`}
                  onClick={() => chooseAnswer(choice.id)}
                >
                  <strong>
                    {selected && choice.isCorrect ? <CheckCircle2 size={15} /> : null}
                    {selected && !choice.isCorrect ? <XCircle size={15} /> : null}
                    {choice.label}
                  </strong>
                </button>
              );
            })}
          </div>

          {selectedChoice ? (
            <div className={`brand-case-feedback ${selectedChoice.isCorrect ? 'correct' : 'wrong'}`}>
              <div>
                {selectedChoice.isCorrect ? <BadgeCheck size={19} /> : <ClipboardCheck size={19} />}
                <strong>{selectedChoice.isCorrect ? 'Good read.' : `Review this. Better read: ${correctChoice?.label ?? 'the evidence-led answer'}.`}</strong>
              </div>
              <p>{selectedChoice.feedback}</p>
              <p><b>Coach:</b> {activeStep.coaching}</p>
            </div>
          ) : null}

          <div className="brand-case-evidence">
            <strong>Evidence trail</strong>
            <ul>
              {activeStep.evidenceRefs.map((ref) => <li key={ref}>{ref}</li>)}
            </ul>
          </div>

          <footer className="brand-case-card-actions">
            <div>
              {relatedModule ? (
                <Link href={`/learn/${relatedModule.id}`}>Review {relatedModule.shortTitle} <ArrowRight size={15} /></Link>
              ) : null}
            </div>
            <div>
              <button type="button" onClick={previousStep} disabled={activeStepIndex === 0}>
                <ArrowLeft size={15} /> Previous
              </button>
              <button type="button" onClick={nextStep} disabled={isLastStep}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </footer>
        </article>
      </section>

      <section className={`brand-case-completion ${complete ? 'complete' : ''}`}>
        <div>
          <div className="section-kicker"><BadgeCheck size={14} /> Case close</div>
          <h2>{caseContent.completion.headline}</h2>
          <p>{caseContent.completion.summary}</p>
          <ul>
            {caseContent.completion.nextSteps.map((nextStepItem) => <li key={nextStepItem}>{nextStepItem}</li>)}
          </ul>
        </div>
        <Link href={caseContent.completion.reportLink}>
          {caseContent.completion.reportCtaLabel ?? 'Open brand report'} <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
