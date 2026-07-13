'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  LineChart,
  RotateCcw,
  SearchCheck,
  XCircle
} from 'lucide-react';
import modules from '@/src/data/config/grounding-education-modules.json';
import scenarios from '@/src/data/config/learning-signal-lab-scenarios.json';
import type { GroundingEducationModule } from './LearnModulePage';

type SignalTone = 'good' | 'watch' | 'bad';

type SignalReadChoice = {
  id: string;
  label: string;
  read: string;
  nextLens: string;
  isCorrect: boolean;
};

type SignalLabScenario = {
  id: string;
  title: string;
  moduleId: string;
  brandExample: string;
  prompt: string;
  signals: Array<{ label: string; value: string; tone: SignalTone }>;
  choices: SignalReadChoice[];
  coaching: string;
};

const typedModules = modules as GroundingEducationModule[];
const typedScenarios = scenarios as SignalLabScenario[];
const moduleById = new Map(typedModules.map((module) => [module.id, module]));

function toneLabel(tone: SignalTone) {
  if (tone === 'good') return 'Good';
  if (tone === 'bad') return 'Watchout';
  return 'Mixed';
}

export default function SignalReadLab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const activeScenario = typedScenarios[activeIndex] ?? typedScenarios[0];
  const selectedChoiceId = answers[activeScenario.id];
  const selectedChoice = activeScenario.choices.find((choice) => choice.id === selectedChoiceId);
  const correctChoice = activeScenario.choices.find((choice) => choice.isCorrect);
  const isCorrect = Boolean(selectedChoice?.isCorrect);
  const relatedModule = moduleById.get(activeScenario.moduleId);

  const score = useMemo(
    () => typedScenarios.reduce((total, scenario) => {
      const answer = answers[scenario.id];
      const choice = scenario.choices.find((item) => item.id === answer);
      return total + (choice?.isCorrect ? 1 : 0);
    }, 0),
    [answers]
  );
  const answeredCount = Object.keys(answers).length;

  function chooseAnswer(choiceId: string) {
    setAnswers((current) => ({ ...current, [activeScenario.id]: choiceId }));
  }

  function nextScenario() {
    setActiveIndex((current) => (current + 1) % typedScenarios.length);
  }

  function resetPractice() {
    setAnswers({});
    setActiveIndex(0);
  }

  return (
    <section className="signal-lab" aria-label="Read The Signal practice">
      <div className="signal-lab-head">
        <div>
          <div className="section-kicker"><LineChart size={14} /> Practice Lab</div>
          <h2>Read The Signal</h2>
          <p>
            Look at a small signal pattern, then choose the most useful strategic read and the next evidence lens. The point is not to memorize scores; it is to learn how to slow the room down before choosing action.
          </p>
        </div>
        <div className="signal-lab-score" aria-label="Signal lab score">
          <strong>{score}/{typedScenarios.length}</strong>
          <span>{answeredCount} answered</span>
          <button type="button" onClick={resetPractice}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="signal-lab-layout">
        <aside className="signal-lab-list" aria-label="Signal scenarios">
          {typedScenarios.map((scenario, index) => {
            const answerId = answers[scenario.id];
            const answer = scenario.choices.find((choice) => choice.id === answerId);
            return (
              <button
                key={scenario.id}
                type="button"
                className={activeScenario.id === scenario.id ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
              >
                <span>{scenario.brandExample}</span>
                <strong>{scenario.title}</strong>
                {answer ? (
                  <em className={answer.isCorrect ? 'correct' : 'wrong'}>
                    {answer.isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {answer.isCorrect ? 'Good read' : 'Review'}
                  </em>
                ) : null}
              </button>
            );
          })}
        </aside>

        <article className="signal-lab-card">
          <div className="signal-lab-top">
            <span>{activeScenario.brandExample}</span>
            <strong>{activeScenario.title}</strong>
            <p>{activeScenario.prompt}</p>
          </div>

          <div className="signal-meter-grid" aria-label="Signal pattern">
            {activeScenario.signals.map((signal) => (
              <div key={`${activeScenario.id}-${signal.label}`} className={`signal-meter ${signal.tone}`}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <em>{toneLabel(signal.tone)}</em>
              </div>
            ))}
          </div>

          <div className="signal-choice-grid" role="group" aria-label="Choose the best signal read">
            {activeScenario.choices.map((choice) => {
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
                  <span>{choice.read}</span>
                  <em>{choice.nextLens}</em>
                </button>
              );
            })}
          </div>

          {selectedChoice ? (
            <div className={`signal-lab-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              <div>
                {isCorrect ? <BadgeCheck size={19} /> : <SearchCheck size={19} />}
                <strong>{isCorrect ? 'Good read.' : `Review this. Better read: ${correctChoice?.label ?? 'the evidence-led option'}.`}</strong>
              </div>
              <p>{activeScenario.coaching}</p>
              {correctChoice ? <p><b>Next lens:</b> {correctChoice.nextLens}</p> : null}
            </div>
          ) : null}

          <div className="signal-lab-footer">
            {relatedModule ? (
              <Link href={`/learn/${relatedModule.id}`}>
                Review {relatedModule.shortTitle} <ArrowRight size={15} />
              </Link>
            ) : null}
            <button type="button" onClick={nextScenario}>
              Next signal <ArrowRight size={15} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
