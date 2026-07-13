'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import modules from '@/src/data/config/grounding-education-modules.json';
import scenarios from '@/src/data/config/learning-practice-scenarios.json';
import type { GroundingEducationModule } from './LearnModulePage';

type PracticeAnswer =
  | 'valid_bbe_read'
  | 'support_lens_hypothesis'
  | 'missing_evidence'
  | 'overreach'
  | 'blocked_conclusion';

type PracticeScenario = {
  id: string;
  title: string;
  moduleId: string;
  lens: string;
  statement: string;
  context: string;
  correctAnswer: PracticeAnswer;
  explanation: string;
  whyItMatters: string;
  relatedConcepts: string[];
};

const typedModules = modules as GroundingEducationModule[];
const typedScenarios = scenarios as PracticeScenario[];
const moduleById = new Map(typedModules.map((module) => [module.id, module]));

const answerOptions: Array<{ id: PracticeAnswer; label: string; description: string }> = [
  {
    id: 'valid_bbe_read',
    label: 'Valid BBE read',
    description: 'The statement stays inside what BBE can support.'
  },
  {
    id: 'support_lens_hypothesis',
    label: 'Support-lens hypothesis',
    description: 'Useful, but only as context around the BBE read.'
  },
  {
    id: 'missing_evidence',
    label: 'Missing evidence',
    description: 'Plausible, but the proof is not in the packet yet.'
  },
  {
    id: 'overreach',
    label: 'Overreach',
    description: 'The statement moves faster than the evidence allows.'
  },
  {
    id: 'blocked_conclusion',
    label: 'Blocked conclusion',
    description: 'A guardrail prevents Brand Doctor from saying this.'
  }
];

function answerLabel(answer: PracticeAnswer) {
  return answerOptions.find((option) => option.id === answer)?.label ?? answer;
}

export default function MisreadDetector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PracticeAnswer>>({});
  const activeScenario = typedScenarios[activeIndex] ?? typedScenarios[0];
  const selectedAnswer = answers[activeScenario.id];
  const isCorrect = selectedAnswer === activeScenario.correctAnswer;
  const relatedModule = moduleById.get(activeScenario.moduleId);

  const score = useMemo(
    () => typedScenarios.reduce((total, scenario) => total + (answers[scenario.id] === scenario.correctAnswer ? 1 : 0), 0),
    [answers]
  );
  const answeredCount = Object.keys(answers).length;

  function chooseAnswer(answer: PracticeAnswer) {
    setAnswers((current) => ({ ...current, [activeScenario.id]: answer }));
  }

  function nextScenario() {
    setActiveIndex((current) => (current + 1) % typedScenarios.length);
  }

  function resetPractice() {
    setAnswers({});
    setActiveIndex(0);
  }

  return (
    <section className="misread-detector" aria-label="Can We Conclude This practice">
      <div className="misread-head">
        <div>
          <div className="section-kicker"><ShieldAlert size={14} /> Practice Lab</div>
          <h2>Can We Conclude This?</h2>
          <p>
            Practice the judgment Brand Doctor needs: separate a valid read from a useful hypothesis, missing evidence, overreach, or a blocked conclusion.
          </p>
        </div>
        <div className="misread-score" aria-label="Practice score">
          <strong>{score}/{typedScenarios.length}</strong>
          <span>{answeredCount} answered</span>
          <button type="button" onClick={resetPractice}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="misread-layout">
        <aside className="misread-scenario-list" aria-label="Practice scenarios">
          {typedScenarios.map((scenario, index) => {
            const answered = answers[scenario.id];
            const scenarioCorrect = answered === scenario.correctAnswer;
            return (
              <button
                key={scenario.id}
                type="button"
                className={activeScenario.id === scenario.id ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
              >
                <span>{scenario.lens}</span>
                <strong>{scenario.title}</strong>
                {answered ? (
                  <em className={scenarioCorrect ? 'correct' : 'wrong'}>
                    {scenarioCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {scenarioCorrect ? 'Got it' : 'Review'}
                  </em>
                ) : null}
              </button>
            );
          })}
        </aside>

        <article className="misread-card">
          <div className="misread-card-top">
            <span>{activeScenario.lens}</span>
            <strong>{activeScenario.title}</strong>
          </div>
          <div className="misread-statement">
            <span>Statement</span>
            <p>{activeScenario.statement}</p>
          </div>
          <p className="misread-context">{activeScenario.context}</p>

          <div className="misread-options" role="group" aria-label="Choose the best classification">
            {answerOptions.map((option) => {
              const selected = selectedAnswer === option.id;
              const correct = activeScenario.correctAnswer === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${selected ? 'selected' : ''} ${selected && correct ? 'correct' : ''} ${selected && !correct ? 'wrong' : ''}`}
                  onClick={() => chooseAnswer(option.id)}
                >
                  <strong>
                    {selected && correct ? <CheckCircle2 size={15} /> : null}
                    {selected && !correct ? <XCircle size={15} /> : null}
                    {option.label}
                  </strong>
                  <span>{option.description}</span>
                </button>
              );
            })}
          </div>

          {selectedAnswer ? (
            <div className={`misread-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              <div>
                {isCorrect ? <BadgeCheck size={19} /> : <HelpCircle size={19} />}
                <strong>{isCorrect ? 'Yes. That is the right read.' : `Not quite. Better answer: ${answerLabel(activeScenario.correctAnswer)}.`}</strong>
              </div>
              <p>{activeScenario.explanation}</p>
              <p><b>Why it matters:</b> {activeScenario.whyItMatters}</p>
            </div>
          ) : null}

          <div className="misread-footer">
            <div className="misread-concepts">
              {activeScenario.relatedConcepts.map((concept) => <span key={concept}>{concept}</span>)}
            </div>
            <div className="misread-actions">
              {relatedModule ? (
                <Link href={`/learn/${relatedModule.id}`}>
                  Review {relatedModule.shortTitle} <ArrowRight size={15} />
                </Link>
              ) : null}
              <button type="button" onClick={nextScenario}>
                Next scenario <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
