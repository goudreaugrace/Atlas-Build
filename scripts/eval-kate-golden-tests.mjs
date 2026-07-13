import fs from 'node:fs';

const baseUrl = process.env.AGENT_EVAL_BASE_URL ?? 'http://localhost:3000';
const cases = JSON.parse(fs.readFileSync('src/data/config/kate-s-golden-test-cases.json', 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function lower(value) {
  return String(value ?? '').toLowerCase();
}

function includesAny(value, terms) {
  const text = lower(value);
  return terms.some((term) => text.includes(lower(term)));
}

function assertGroups(value, groups, label) {
  for (const [index, terms] of (groups ?? []).entries()) {
    assert(Array.isArray(terms) && terms.length > 0, `${label}: group ${index} needs terms`);
    assert(includesAny(value, terms), `${label}: expected one of [${terms.join(' | ')}] in "${value}"`);
  }
}

function assertForbidden(value, terms, label) {
  for (const term of terms ?? []) {
    assert(!lower(value).includes(lower(term)), `${label}: forbidden term "${term}" found in "${value}"`);
  }
}

async function ask(testCase) {
  const response = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      brandId: testCase.brandId,
      question: testCase.question,
      personaId: 'brand_doctor',
      conversationMode: 'explore',
      conversationHistory: []
    })
  });
  assert(response.ok, `${testCase.id}: API returned ${response.status}`);
  const result = await response.json();
  assert(result.ok === true, `${testCase.id}: API result not ok`);
  return result;
}

try {
  assert(Array.isArray(cases) && cases.length >= 8, 'kate golden tests: expected at least eight cases');
  const passed = [];

  for (const testCase of cases) {
    assert(testCase.id && testCase.name && testCase.brandId && testCase.question, `golden case missing identity fields: ${testCase.id ?? 'unknown'}`);
    const result = await ask(testCase);
    const answerText = [
      result.answer,
      result.writtenAnswer,
      result.spokenAnswer
    ].filter(Boolean).join('\n');
    const evidenceText = (result.proofDisclosure?.evidenceBasis ?? []).join('\n');
    const guardrailText = (result.proofDisclosure?.guardrails ?? []).join('\n');
    const missingEvidenceText = (result.proofDisclosure?.missingEvidence ?? []).join('\n');

    if (testCase.expectedIntentTypes?.length) {
      assert(testCase.expectedIntentTypes.includes(result.intent?.type), `${testCase.id}: expected intent ${testCase.expectedIntentTypes.join(' or ')}, got ${result.intent?.type}`);
    }
    if (testCase.expectedGroundings?.length) {
      assert(testCase.expectedGroundings.includes(result.grounding), `${testCase.id}: expected grounding ${testCase.expectedGroundings.join(' or ')}, got ${result.grounding}`);
    }
    if (result.intent?.type === 'direct_answer') {
      assert(!result.workSpec, `${testCase.id}: direct golden answer should not create workSpec`);
    }

    assertGroups(answerText, testCase.answerMustIncludeAny, `${testCase.id} answer`);
    assertForbidden(answerText, testCase.answerMustNotInclude, `${testCase.id} answer`);
    assertGroups(evidenceText, testCase.evidenceBasisMustIncludeAny, `${testCase.id} evidence`);
    assertGroups(guardrailText, testCase.guardrailsMustIncludeAny, `${testCase.id} guardrails`);
    assertGroups(missingEvidenceText, testCase.missingEvidenceMustIncludeAny, `${testCase.id} missing evidence`);

    assert(result.coverageAssessment?.status, `${testCase.id}: missing coverage assessment`);
    passed.push(testCase.id);
  }

  console.log(`Kate S golden tests passed against ${baseUrl}`);
  for (const id of passed) console.log(`- ${id}`);
} catch (error) {
  console.error(`Kate S golden tests failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
