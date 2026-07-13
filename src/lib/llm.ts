import prompts from '@/src/data/config/llm-prompts.json';
import {
  answerDialogQuestion,
  brandRecords,
  getBindingConstraint,
  getDiagnosisEvidence,
  getEvidenceConfidence,
  getEvidenceReadiness,
  getFollowUpSignals,
  getGrowthAvailabilityRecord,
  getMentalAvailabilityRecord,
  getMetricOpportunityRows,
  getTreatmentRecommendations,
  getTopOccasions,
  findBrandRecordByIdentity,
  metric,
  formatMetricValue,
  coreMetrics,
  getAiPersona,
  visualizationSpecs
} from '@/src/lib/data';
import {
  redactSourceTypologyForDefaultUse,
  sourceTypologyLanguagePolicy
} from '@/src/lib/intelligence/source-typology-language';
import type { AiPersona, BrandMetric, ExecutiveSummary, ExecutiveSummaryItem, ExecutiveSummaryMetric, LlmPrompts, MentalAvailabilitySourcePacket } from '@/src/types/domain';

const llmPrompts = prompts as LlmPrompts;
const EXECUTIVE_SUMMARY_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const executiveSummaryCache = new Map<string, { expiresAt: number; summary: ExecutiveSummary }>();
const executiveSummaryInFlight = new Map<string, Promise<ExecutiveSummary>>();

type ChatParams = {
  question: string;
  brandId: string;
  category: string;
  mode?: string;
  activeVisual?: string;
  personaId?: string;
  conversationMode?: string;
  mentalAvailabilitySourcePacket?: MentalAvailabilitySourcePacket;
};

type ChatResult = {
  answer: string;
  source: 'openai' | 'grounded_fallback';
  model: string | null;
  fallbackReason?: string;
};

type SummaryParams = {
  brandId: string;
  category: string;
  mode?: string;
  personaId?: string;
};

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function readNumberSetting(name: string, fallback: number) {
  const value = Number(readSetting(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashString(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function summaryCacheKey(params: SummaryParams, model: string, mode: string, packet: unknown) {
  const settings = {
    cacheVersion: 'evidence-readiness-summary-v1',
    model,
    mode,
    reasoningEffort: readSetting('OPENAI_REASONING_EFFORT') ?? '',
    textVerbosity: readSetting('OPENAI_TEXT_VERBOSITY') ?? '',
    prompt: llmPrompts.globalSystemPrompt
  };
  return hashString(stableStringify({ params, packet, settings }));
}

function personaInstruction(persona: AiPersona) {
  return [
    `Selected AI persona: ${persona.name}.`,
    persona.systemInstruction,
    `Response style: ${persona.responseStyle.join(' ')}`,
    `Decision bias: ${persona.decisionBias}`,
    `Caveat style: ${persona.caveatStyle}`
  ].join('\n');
}

function withCacheStatus(summary: ExecutiveSummary, cacheStatus: 'hit' | 'miss'): ExecutiveSummary {
  return { ...summary, cacheStatus };
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const maybeOutputText = (data as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) return maybeOutputText.trim();

  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== 'object') continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') chunks.push(text);
    }
  }

  const joined = chunks.join('\n').trim();
  return joined || null;
}

function summarizeMetricTone(m: BrandMetric | undefined): 'good' | 'watch' | 'bad' {
  if (!m) return 'watch';
  if (m.momentum === 'Declining' || m.categoryBand === 'Category Lagging') return 'bad';
  if (m.ahead === 'Ahead' || m.categoryBand === 'Category Leading') return 'good';
  return 'watch';
}

function diagnosisBadgeTone(severity: string): 'good' | 'watch' | 'bad' {
  if (severity === 'monitor') return 'good';
  if (severity === 'priority') return 'bad';
  return 'watch';
}

function summaryFallback(params: SummaryParams, reason?: string): ExecutiveSummary {
  const record = findBrandRecordByIdentity(params.brandId, params.category) ?? brandRecords[0];
  const selectedPersona = getAiPersona(params.personaId);
  const evidence = getDiagnosisEvidence(record);
  const confidence = getEvidenceConfidence(record);
  const evidenceReadiness = getEvidenceReadiness(record);
  const opportunities = getMetricOpportunityRows(record);
  const topOccasions = getTopOccasions(record, 2);
  const treatments = getTreatmentRecommendations(evidence.diagnosis.id);
  const workingRows = opportunities.filter((row) => row.categoryBand === 'Category Leading' || row.ahead === 'Ahead').slice(0, 2);
  const fixRows = opportunities.filter((row) => row.job !== 'Protect').slice(0, 2);

  const whatsWorking: ExecutiveSummaryItem[] = workingRows.length
    ? workingRows.map((row) => ({
      title: `${row.metric} is doing useful work`,
      detail: `${formatMetricValue(row.value)} · ${row.categoryBand} · ${row.ahead}`,
      implication: row.momentum === 'Declining' ? 'Strong base, but renewal is needed.' : 'A strength to protect in the plan.'
    }))
    : topOccasions.map((occasion) => ({
      title: `Owns "${occasion.occasion}"`,
      detail: `Occasion score ${formatMetricValue(occasion.score)}`,
      implication: 'Use as memory-structure evidence, not substitution proof.'
    }));

  const whatToFix: ExecutiveSummaryItem[] = fixRows.length
    ? fixRows.map((row) => ({
      title: `${row.job} ${row.metric}`,
      detail: `${formatMetricValue(row.value)} · ${row.ahead} · ${row.momentum}`,
      implication: row.guidance
    }))
    : treatments.slice(0, 2).map(({ treatment, link }) => ({
      title: treatment.name,
      detail: `${treatment.tier} · ${treatment.timeToImpact}`,
      implication: link.whyThisFits
    }));

  const metricStrip: ExecutiveSummaryMetric[] = coreMetrics.map((name) => {
    const m = metric(record, name);
    return {
      label: name,
      value: formatMetricValue(m?.value),
      status: m ? `${m.ahead} · ${m.momentum}` : 'Missing',
      note: m?.categoryBand ?? 'No metric in packet',
      tone: summarizeMetricTone(m)
    };
  });

  return {
    brandName: record.brandName,
    summaryTitle: selectedPersona.id === 'brand_doctor' ? 'BBE Brand Equity Diagnosis' : `${selectedPersona.shortName} · BBE Brand Equity Diagnosis`,
    modelLabel: readSetting('LLM_MODE') === 'live' ? readSetting('OPENAI_MODEL') ?? 'Live LLM' : 'Grounded fallback',
    generatedAt: new Date().toISOString(),
    diagnosisBadge: {
      label: 'Primary diagnosis',
      value: evidence.diagnosis.name,
      detail: `${confidence.label} evidence`,
      tone: diagnosisBadgeTone(evidence.diagnosis.severityDefault)
    },
    evidenceReadiness,
    headline: selectedPersona.id === 'how_brands_grow_lens'
      ? `${record.brandName} needs the diagnosis read through memory, distinctiveness, reach, and ease of buying.`
      : `${record.brandName} is ${evidence.diagnosis.name.toLowerCase()} with the clearest workstream around ${fixRows[0]?.metric ?? evidence.diagnosis.primaryTreatmentFamilies[0] ?? 'equity foundations'}.`,
    narrative: selectedPersona.id === 'how_brands_grow_lens'
      ? `${evidence.diagnosis.doctorRead} Read this with a How Brands Grow lens: protect or build mental availability, avoid over-narrow loyalty assumptions, and look for distinctive asset or availability friction before leaping to niche targeting. The current packet points to ${opportunities[0]?.metric ?? 'the primary diagnosis'} as the first place to inspect, while the active category lens should not be used for SKU pricing, cannibalization, or occasion-substitution claims.`
      : `${evidence.diagnosis.doctorRead} The current packet points to ${opportunities[0]?.metric ?? 'the primary diagnosis'} as the first place to look, while the active category lens should not be used for SKU pricing, cannibalization, or occasion-substitution claims.`,
    whatsWorking,
    whatToFix,
    metricStrip,
    source: 'grounded_fallback',
    fallbackReason: reason
  };
}

function parseSummaryJson(text: string): Omit<ExecutiveSummary, 'source' | 'modelLabel' | 'generatedAt' | 'evidenceReadiness'> | null {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<ExecutiveSummary>;
    if (!parsed.headline || !parsed.narrative || !Array.isArray(parsed.whatsWorking) || !Array.isArray(parsed.whatToFix)) return null;
    return {
      brandName: String(parsed.brandName ?? ''),
      summaryTitle: String(parsed.summaryTitle ?? 'BBE Brand Equity Diagnosis'),
      diagnosisBadge: {
        label: String(parsed.diagnosisBadge?.label ?? 'Primary diagnosis'),
        value: String(parsed.diagnosisBadge?.value ?? ''),
        detail: String(parsed.diagnosisBadge?.detail ?? ''),
        tone: parsed.diagnosisBadge?.tone === 'good' || parsed.diagnosisBadge?.tone === 'bad' ? parsed.diagnosisBadge.tone : 'watch'
      },
      headline: String(parsed.headline),
      narrative: String(parsed.narrative),
      whatsWorking: parsed.whatsWorking.slice(0, 2).map((item) => ({
        title: String((item as ExecutiveSummaryItem).title ?? ''),
        detail: String((item as ExecutiveSummaryItem).detail ?? ''),
        implication: String((item as ExecutiveSummaryItem).implication ?? '')
      })),
      whatToFix: parsed.whatToFix.slice(0, 2).map((item) => ({
        title: String((item as ExecutiveSummaryItem).title ?? ''),
        detail: String((item as ExecutiveSummaryItem).detail ?? ''),
        implication: String((item as ExecutiveSummaryItem).implication ?? '')
      })),
      metricStrip: Array.isArray(parsed.metricStrip) ? parsed.metricStrip.slice(0, 5).map((item) => ({
        label: String((item as ExecutiveSummaryMetric).label ?? ''),
        value: String((item as ExecutiveSummaryMetric).value ?? ''),
        status: String((item as ExecutiveSummaryMetric).status ?? ''),
        note: String((item as ExecutiveSummaryMetric).note ?? ''),
        tone: (item as ExecutiveSummaryMetric).tone === 'good' || (item as ExecutiveSummaryMetric).tone === 'bad' ? (item as ExecutiveSummaryMetric).tone : 'watch'
      })) : []
    };
  } catch {
    return null;
  }
}

function buildGroundedPacket(params: ChatParams) {
  const record = findBrandRecordByIdentity(params.brandId, params.category) ?? brandRecords[0];
  const activeBrandRecord = redactSourceTypologyForDefaultUse(record, params.question);
  const evidence = getDiagnosisEvidence(record);
  const selectedPersona = getAiPersona(params.personaId);
  const treatments = getTreatmentRecommendations(evidence.diagnosis.id).map(({ link, treatment }) => ({
    link,
    treatment
  }));
  const activeVisual = visualizationSpecs.find((spec) => spec.id === params.activeVisual) ?? null;

  return {
    userQuestion: params.question,
    userMode: params.mode ?? 'brand',
    conversationMode: params.conversationMode ?? 'explore',
    selectedPersona,
    activeVisual,
    activeBrandRecord,
    primaryDiagnosis: evidence.diagnosis,
    evidenceLedger: {
      supporting: evidence.supporting,
      complicating: evidence.complicating,
      ruleSummary: evidence.ruleSummary,
      whatNotToConclude: evidence.notToConclude
    },
    evidenceReadiness: getEvidenceReadiness(record),
    growthAvailability: getGrowthAvailabilityRecord(record),
    mentalAvailability: getMentalAvailabilityRecord(record, params.mentalAvailabilitySourcePacket),
    bindingConstraint: getBindingConstraint(record),
    treatmentRecommendations: treatments,
    followUpSignals: getFollowUpSignals(record),
    promptPolicy: {
      personaInstruction: personaInstruction(selectedPersona),
      styleGuide: llmPrompts.styleGuide,
      guardrails: [
        ...llmPrompts.guardrails,
        sourceTypologyLanguagePolicy
      ]
    }
  };
}

function fallback(params: ChatParams, reason?: string): ChatResult {
  const persona = getAiPersona(params.personaId);
  const baseAnswer = answerDialogQuestion(params);
  return {
    answer: `${baseAnswer}\n\n**Persona lens:** ${persona.decisionBias}`,
    source: 'grounded_fallback',
    model: null,
    fallbackReason: reason
  };
}

export async function answerWithBrandDoctorLlm(params: ChatParams): Promise<ChatResult> {
  const apiKey = readSetting('OPENAI_API_KEY');
  const mode = readSetting('LLM_MODE') ?? 'mock';
  const model = readSetting('OPENAI_MODEL') ?? 'gpt-4.1-mini';

  if (!apiKey || mode !== 'live') {
    return fallback(params, !apiKey ? 'missing_api_key' : 'llm_mode_not_live');
  }

  const packet = buildGroundedPacket(params);
  const selectedPersona = getAiPersona(params.personaId);
  const reasoningEffort = readSetting('OPENAI_REASONING_EFFORT');
  const textVerbosity = readSetting('OPENAI_TEXT_VERBOSITY');
  const body: Record<string, unknown> = {
    model,
    instructions: `${llmPrompts.globalSystemPrompt}\n\n${llmPrompts.dialogWithDataPrompt}\n\n${sourceTypologyLanguagePolicy}\n\nIf the user asks for a signal outside the current evidence packet, answer what the packet can support, say what you do not know yet, and name the specific evidence that would close the gap. Do not use external knowledge or web assumptions unless the supplied packet contains it.\n\n${personaInstruction(selectedPersona)}`,
    input: `User question:\n${params.question}\n\nGrounded packet JSON:\n${JSON.stringify(packet, null, 2)}`,
    max_output_tokens: readNumberSetting('OPENAI_CHAT_MAX_OUTPUT_TOKENS', 1100)
  };

  if (reasoningEffort) body.reasoning = { effort: reasoningEffort };
  if (textVerbosity) body.text = { verbosity: textVerbosity };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data && typeof data === 'object' && 'error' in data
        ? JSON.stringify((data as { error: unknown }).error)
        : `status_${response.status}`;
      console.warn(`OpenAI chat fallback: ${message}`);
      return fallback(params, `openai_${response.status}`);
    }

    const answer = extractOutputText(data);
    if (!answer) return fallback(params, 'empty_openai_response');

    return {
      answer,
      source: 'openai',
      model
    };
  } catch (error) {
    console.warn(`OpenAI chat fallback: ${error instanceof Error ? error.message : 'unknown_error'}`);
    return fallback(params, 'openai_request_failed');
  }
}

export async function generateExecutiveSummary(params: SummaryParams): Promise<ExecutiveSummary> {
  const apiKey = readSetting('OPENAI_API_KEY');
  const mode = readSetting('LLM_MODE') ?? 'mock';
  const model = readSetting('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  const packet = buildGroundedPacket({
    question: 'Generate the executive summary card for the active brand.',
    brandId: params.brandId,
    category: params.category,
    mode: params.mode ?? 'brand',
    activeVisual: 'brand_health_panel',
    personaId: params.personaId
  });
  const cacheKey = summaryCacheKey(params, model, mode, packet);
  const cached = executiveSummaryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return withCacheStatus(cached.summary, 'hit');
  if (cached) executiveSummaryCache.delete(cacheKey);

  const inFlight = executiveSummaryInFlight.get(cacheKey);
  if (inFlight) return withCacheStatus(await inFlight, 'hit');

  const summaryPromise: Promise<ExecutiveSummary> = (async (): Promise<ExecutiveSummary> => {
    if (!apiKey || mode !== 'live') {
      return summaryFallback(params, !apiKey ? 'missing_api_key' : 'llm_mode_not_live');
    }

    const fallbackSummary = summaryFallback(params);
    const selectedPersona = getAiPersona(params.personaId);
    const reasoningEffort = readSetting('OPENAI_REASONING_EFFORT');
    const textVerbosity = readSetting('OPENAI_TEXT_VERBOSITY');
    const body: Record<string, unknown> = {
      model,
      instructions: `${llmPrompts.globalSystemPrompt}

Create a polished executive summary card for the top of the BBE Brand Doctor report. Return valid JSON only. Do not wrap it in markdown. Use only the grounded packet. Do not invent data, diagnoses, treatments, competitors, causality, SKU pricing, cannibalization, portfolio migration, or occasion substitution.

${sourceTypologyLanguagePolicy}

Apply the selected persona lens to tone, framing, and what the summary emphasizes, without changing deterministic diagnosis, metric facts, treatment config, or caveats.

${personaInstruction(selectedPersona)}

JSON shape:
{
  "brandName": string,
  "summaryTitle": string,
  "headline": string,
  "narrative": string,
  "whatsWorking": [{"title": string, "detail": string, "implication": string}],
  "whatToFix": [{"title": string, "detail": string, "implication": string}]
}

Do not create or infer an overall brand health score, master index, or 0-100 summary number. The top-level badge, evidence readiness, and KPI strip values/colors are supplied by deterministic services. Keep headline decisive and under 28 words. Keep narrative to 90-130 words. Provide exactly two whatsWorking items and exactly two whatToFix items. Use treatment language as paths to consider or test. If the persona references an external marketing theory, use it as an interpretive lens only; do not claim the system is officially endorsed by that author, institute, or theory.`,
      input: `Deterministic diagnosis badge for the UI:\n${JSON.stringify(fallbackSummary.diagnosisBadge, null, 2)}\n\nDeterministic evidence readiness for the UI:\n${JSON.stringify(fallbackSummary.evidenceReadiness, null, 2)}\n\nGrounded packet JSON:\n${JSON.stringify(packet, null, 2)}`,
      max_output_tokens: 1200
    };

    if (reasoningEffort) body.reasoning = { effort: reasoningEffort };
    if (textVerbosity) body.text = { verbosity: textVerbosity };

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = data && typeof data === 'object' && 'error' in data
          ? JSON.stringify((data as { error: unknown }).error)
          : `status_${response.status}`;
        console.warn(`OpenAI summary fallback: ${message}`);
        return summaryFallback(params, `openai_${response.status}`);
      }

      const text = extractOutputText(data);
      if (!text) return summaryFallback(params, 'empty_openai_response');
      const parsed = parseSummaryJson(text);
      if (!parsed) return summaryFallback(params, 'invalid_openai_json');

      return {
        ...parsed,
        brandName: parsed.brandName || fallbackSummary.brandName,
        summaryTitle: fallbackSummary.summaryTitle,
        diagnosisBadge: fallbackSummary.diagnosisBadge,
        evidenceReadiness: fallbackSummary.evidenceReadiness,
        metricStrip: fallbackSummary.metricStrip,
        modelLabel: model,
        generatedAt: new Date().toISOString(),
        source: 'openai'
      };
    } catch (error) {
      console.warn(`OpenAI summary fallback: ${error instanceof Error ? error.message : 'unknown_error'}`);
      return summaryFallback(params, 'openai_request_failed');
    }
  })();

  executiveSummaryInFlight.set(cacheKey, summaryPromise);

  try {
    const summary = await summaryPromise;
    const cachedSummary = { ...summary };
    delete cachedSummary.cacheStatus;
    executiveSummaryCache.set(cacheKey, {
      expiresAt: Date.now() + EXECUTIVE_SUMMARY_CACHE_TTL_MS,
      summary: cachedSummary
    });
    return withCacheStatus(summary, 'miss');
  } finally {
    executiveSummaryInFlight.delete(cacheKey);
  }
}
