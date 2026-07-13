import type { BrandHealthRecord } from '@/src/types/domain';

const sourceTypologySignals = [
  'typology',
  'typologies',
  'brandz',
  'kantar',
  'star',
  'mainstream',
  'iconic',
  'fighter',
  'aspirational',
  'outsider',
  'specialist'
];

const unsolicitedTypologyTerms = [
  'BrandZ',
  'Kantar',
  'Star',
  'Mainstream',
  'Iconic',
  'Fighter',
  'Aspirational',
  'Outsider',
  'Specialist'
];

export const sourceTypologyLanguagePolicy = [
  'Do not volunteer source typology labels such as Star, Mainstream, Iconic, BrandZ, or Kantar in ordinary equity, diagnosis, CMO, momentum, or treatment answers.',
  'Use source typology only when the user explicitly asks about the source deck, Kantar/BrandZ methodology, or typology language.',
  'When typology is not explicitly requested, headline the read from Momentum, Ahead/Behind, category context, M/D/S, Perceived Value, evidence gaps, and treatment paths to test.'
].join(' ');

function currentQuestionForPolicy(question: string) {
  const marker = 'Current user question:';
  const markerIndex = question.lastIndexOf(marker);
  if (markerIndex < 0) return question;
  return question.slice(markerIndex + marker.length);
}

export function isSourceTypologyQuestion(question: string) {
  const normalized = currentQuestionForPolicy(question).toLowerCase();
  return sourceTypologySignals.some((signal) => normalized.includes(signal));
}

export function hasUnrequestedTypologyLanguage(answer: string, question: string) {
  if (isSourceTypologyQuestion(question)) return false;
  return unsolicitedTypologyTerms.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(answer));
}

export function redactSourceTypologyForDefaultUse(record: BrandHealthRecord, question: string): BrandHealthRecord {
  if (isSourceTypologyQuestion(question)) return record;
  return {
    ...record,
    typology: null
  };
}
