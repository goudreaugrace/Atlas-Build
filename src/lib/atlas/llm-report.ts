import { demoNegotiation } from './demo-data';
import type { LiveDebriefReportContext } from './live-negotiator';
import { buildBuyingGroupWorkspacePacket, euros } from '@/src/lib/atlas-intelligence/kernel';

export type AtlasGeneratedMetric = {
  label: string;
  value: string;
  note: string;
};

export type AtlasGeneratedTable = {
  title: string;
  columns: string[];
  rows: string[][];
};

export type AtlasGeneratedSection = {
  title: string;
  body: string;
  bullets: string[];
  table?: AtlasGeneratedTable;
};

export type AtlasGeneratedSource = {
  label: string;
  detail: string;
};

export type AtlasGeneratedReport = {
  title: string;
  subtitle: string;
  audience: string;
  sourceMode: 'openai' | 'offline_placeholder';
  model: string | null;
  generatedAt: string;
  summary: string;
  metrics: AtlasGeneratedMetric[];
  sections: AtlasGeneratedSection[];
  sources: AtlasGeneratedSource[];
  caveats: string[];
};

export type AtlasReportGenerationOptions = {
  buyingGroupId?: string;
  liveContext?: LiveDebriefReportContext;
  marketId?: string;
};

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const outputText = (data as { output_text?: unknown }).output_text;
  if (typeof outputText === 'string' && outputText.trim()) return outputText.trim();

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
  return chunks.join('\n').trim() || null;
}

function parseReportJson(text: string): AtlasGeneratedReport | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  const jsonCandidate = jsonStart >= 0 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<AtlasGeneratedReport>;
    return normalizeParsedReport(parsed);
  } catch {
    try {
      const relaxedCandidate = jsonCandidate
        .replace(/:\s*undefined/g, ': null')
        .replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(relaxedCandidate) as Partial<AtlasGeneratedReport>;
      return normalizeParsedReport(parsed);
    } catch {
      return null;
    }
  }
}

function normalizeParsedReport(parsed: Partial<AtlasGeneratedReport> | null): AtlasGeneratedReport | null {
  if (!parsed || typeof parsed !== 'object') return null;
  if (!parsed.title || !Array.isArray(parsed.sections)) return null;
  return {
    title: String(parsed.title),
    subtitle: String(parsed.subtitle ?? ''),
    audience: String(parsed.audience ?? 'ATLAS user'),
    sourceMode: parsed.sourceMode === 'openai' ? 'openai' : 'offline_placeholder',
    model: typeof parsed.model === 'string' ? parsed.model : null,
    generatedAt: String(parsed.generatedAt ?? new Date().toISOString()),
    summary: String(parsed.summary ?? ''),
    metrics: Array.isArray(parsed.metrics) ? parsed.metrics.map((metric) => ({
      label: String(metric?.label ?? ''),
      value: String(metric?.value ?? ''),
      note: String(metric?.note ?? '')
    })).filter((metric) => metric.label && metric.value) : [],
    sections: parsed.sections.map((section) => ({
      title: String(section?.title ?? 'Generated section'),
      body: String(section?.body ?? ''),
      bullets: Array.isArray(section?.bullets) ? section.bullets.map(String) : [],
      table: section?.table && Array.isArray(section.table.columns) && Array.isArray(section.table.rows)
        ? {
            title: String(section.table.title ?? ''),
            columns: section.table.columns.map(String),
            rows: section.table.rows.map((row) => Array.isArray(row) ? row.map(String) : [])
          }
        : undefined
    })),
    sources: Array.isArray(parsed.sources) ? parsed.sources.map((source) => ({
      label: String(source?.label ?? ''),
      detail: String(source?.detail ?? '')
    })).filter((source) => source.label || source.detail) : [],
    caveats: Array.isArray(parsed.caveats) ? parsed.caveats.map(String) : []
  };
}

function splitTextIntoSections(text: string): AtlasGeneratedSection[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!paragraphs.length) {
    return [{
      title: 'Generated response',
      body: text.trim(),
      bullets: []
    }];
  }

  return paragraphs.slice(0, 6).map((paragraph, index) => {
    const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
    const heading = lines[0]?.replace(/^#+\s*/, '').replace(/:$/, '');
    const bulletLines = lines.slice(1).filter((line) => /^[-*•]\s+/.test(line)).map((line) => line.replace(/^[-*•]\s+/, ''));
    const bodyLines = lines.slice(1).filter((line) => !/^[-*•]\s+/.test(line));
    return {
      title: heading && heading.length < 80 ? heading : `Generated section ${index + 1}`,
      body: heading && heading.length < 80 ? bodyLines.join(' ') : paragraph,
      bullets: bulletLines
    };
  });
}

function liveTextReport(prompt: string, text: string, model: string, generatedAt: string): AtlasGeneratedReport {
  return {
    title: 'ATLAS Live Generated Report',
    subtitle: `Generated from: "${prompt}"`,
    audience: 'Strategy user',
    sourceMode: 'openai',
    model,
    generatedAt,
    summary: text.split(/\n{2,}/)[0]?.replace(/^#+\s*/, '').trim() || 'ATLAS generated this response from the live model.',
    metrics: [
      { label: 'Generation mode', value: 'Live OpenAI', note: model },
      { label: 'Request type', value: looksLikeFinanceAsk(prompt) ? 'Finance' : 'Freeform', note: 'Derived from user prompt' },
      { label: 'Source posture', value: /\b(recent|news|latest|today|current)\b/i.test(prompt) ? 'Current-source request' : 'Model response', note: 'Validate time-sensitive claims' },
      { label: 'Confidence', value: 'Draft', note: 'Review before using externally' }
    ],
    sections: splitTextIntoSections(text),
    sources: [
      { label: 'Live model', detail: model },
      { label: 'User prompt', detail: prompt }
    ],
    caveats: ['Generated by live model. Validate time-sensitive, financial, legal, and customer-facing claims before use.']
  };
}

function liveFailureReport(prompt: string, model: string, generatedAt: string, detail: string): AtlasGeneratedReport {
  return {
    title: 'ATLAS Live Generation Needs Attention',
    subtitle: `The request reached live mode but did not complete successfully.`,
    audience: 'Local prototype operator',
    sourceMode: 'openai',
    model,
    generatedAt,
    summary: 'ATLAS is configured for live generation, but the OpenAI request failed or returned an unusable response. This is not the offline placeholder path.',
    metrics: [
      { label: 'Live mode', value: 'Configured', note: 'OPENAI_API_KEY is present' },
      { label: 'Model', value: model, note: 'From OPENAI_MODEL' },
      { label: 'Request status', value: 'Failed', note: detail },
      { label: 'Next check', value: 'Billing / key / model', note: 'Review OpenAI platform access' }
    ],
    sections: [
      {
        title: 'What happened',
        body: detail,
        bullets: [
          'Confirm the API key is active and belongs to a project with billing enabled.',
          'Confirm the selected model is available to the project.',
          'Restart or rebuild the app after changing `.env.local`.'
        ]
      },
      {
        title: 'Original request',
        body: prompt,
        bullets: []
      }
    ],
    sources: [
      { label: 'Local environment', detail: 'OPENAI_API_KEY present' },
      { label: 'OpenAI model', detail: model }
    ],
    caveats: ['No placeholder data was substituted for this failed live request.']
  };
}

function looksLikeFinanceAsk(prompt: string) {
  return /\b(p&l|pnl|profit and loss|income statement|revenue|gross profit|operating profit|net income|ebit|eps)\b/i.test(prompt);
}

function shouldUseWebSearch(prompt: string) {
  return /\b(recent|news|latest|today|current|this week|this month|headline|headlines)\b/i.test(prompt);
}

function offlineFinanceReport(prompt: string): AtlasGeneratedReport {
  const generatedAt = new Date().toISOString();
  const year = prompt.match(/\b20\d{2}\b/)?.[0] ?? 'requested year';
  const company = /pepsico/i.test(prompt) ? 'PepsiCo' : 'Requested company';
  return {
    title: `${company} ${year} P&L Readout`,
    subtitle: `Generated from: "${prompt}"`,
    audience: 'Finance / strategy review',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt,
    summary: `ATLAS is not connected to a live financial filing source in this local session, so this is a structured placeholder P&L artifact. Once OPENAI_API_KEY and/or a filings data connector is configured, the same prompt should produce sourced figures and commentary.`,
    metrics: [
      { label: 'Net revenue', value: 'TBD', note: 'Requires 10-K / annual report source' },
      { label: 'Gross profit', value: 'TBD', note: 'Requires reported cost of sales' },
      { label: 'Operating profit', value: 'TBD', note: 'Requires reported operating profit' },
      { label: 'Net income', value: 'TBD', note: 'Requires reported attributable net income' }
    ],
    sections: [
      {
        title: 'P&L table',
        body: 'This is the output shape ATLAS should return for a P&L request. Values are intentionally marked TBD until the app is connected to a live model or financial source.',
        bullets: [
          'Use annual report / Form 10-K values as the primary source.',
          'Show year-over-year change when the prior year is available.',
          'Call out unusual items, FX impact, commodity inflation, productivity, and segment mix when sourced.'
        ],
        table: {
          title: `${company} ${year} income statement`,
          columns: ['Line item', year, 'Prior year', 'YoY change', 'Source status'],
          rows: [
            ['Net revenue', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['Cost of sales', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['Gross profit', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['SG&A / operating expenses', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['Operating profit', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['Net income attributable', 'TBD', 'TBD', 'TBD', 'Needs source'],
            ['Diluted EPS', 'TBD', 'TBD', 'TBD', 'Needs source']
          ]
        }
      },
      {
        title: 'What the connected chat should do',
        body: 'With the live model enabled, ATLAS should answer this directly, populate the table, provide short financial interpretation, and cite source freshness.',
        bullets: [
          'Retrieve or reason over the requested company/year.',
          'Return the table and a concise executive summary.',
          'Flag any uncertainty instead of smoothing over missing figures.'
        ]
      }
    ],
    sources: [
      { label: 'Source required', detail: `${company} ${year} annual report / Form 10-K` },
      { label: 'Current mode', detail: 'Offline placeholder because OPENAI_API_KEY is not present in the local environment.' }
    ],
    caveats: [
      'Do not use these TBD values as financial facts.',
      'Connect OPENAI_API_KEY or a filings connector to produce real figures.'
    ]
  };
}

function offlineGeneralReport(prompt: string): AtlasGeneratedReport {
  const generatedAt = new Date().toISOString();
  return {
    title: 'ATLAS Generated Draft',
    subtitle: `Generated from: "${prompt}"`,
    audience: 'Strategy user',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt,
    summary: 'ATLAS is running in offline placeholder mode. This artifact is structured around the user request, but it is not model-generated. Add OPENAI_API_KEY to enable real freeform generation.',
    metrics: [
      { label: 'Request type', value: 'Freeform', note: 'No fixed template matched' },
      { label: 'Data mode', value: 'Placeholder', note: 'Live model not configured' },
      { label: 'Primary context', value: demoNegotiation.customer, note: 'Default local ATLAS packet' },
      { label: 'Confidence', value: 'Low', note: 'Needs live generation/source retrieval' }
    ],
    sections: [
      {
        title: 'Draft response',
        body: `ATLAS understood the request as: ${prompt}`,
        bullets: [
          'Generate a report tailored to the prompt.',
          'Use available ATLAS context when relevant.',
          'Mark unsupported facts and source gaps clearly.'
        ]
      },
      {
        title: 'Needed to make this real',
        body: 'The app needs a live model call and, for factual/current/company-financial questions, a source or retrieval layer.',
        bullets: [
          'Set OPENAI_API_KEY in the local environment.',
          'Optionally add a data connector for SEC filings, annual reports, internal financials, and negotiation records.',
          'Keep the PDF renderer generic so any model-generated report shape can render.'
        ]
      }
    ],
    sources: [
      { label: 'Current mode', detail: 'Offline placeholder' },
      { label: 'Fallback context', detail: 'ATLAS Carrefour synthetic negotiation packet' }
    ],
    caveats: ['This output is not live model-generated until OPENAI_API_KEY is configured.']
  };
}

function isKamSafeReportRequest(prompt: string) {
  return /\b(kam|key account|account manager|field)\b/i.test(prompt)
    && /\b(safe|pack|report|guide|guidance|negotiation)\b/i.test(prompt);
}

function offlineKamSafeReport(prompt: string, buyingGroupId?: string): AtlasGeneratedReport {
  const generatedAt = new Date().toISOString();
  const promptGroupMatch = prompt.match(/\b(?:for|with)\s+([A-Za-z][A-Za-z\s-]+?)(?:\s+Group|\s+buying group|\.|,|:|$)/i)?.[1]?.trim();
  const normalizedPrompt = prompt.toLowerCase();
  const inferredId = buyingGroupId
    ?? (promptGroupMatch
      ? promptGroupMatch.toLowerCase().replace(/\s+/g, '-')
      : undefined)
    ?? (normalizedPrompt.includes('carrefour') ? 'carrefour' : normalizedPrompt.includes('edeka') ? 'edeka' : normalizedPrompt.includes('tesco') ? 'tesco' : undefined);
  const workspace = inferredId ? buildBuyingGroupWorkspacePacket(inferredId) : undefined;
  const buyingGroup = workspace?.buyingGroup.name ?? promptGroupMatch ?? 'selected buying group';
  const markets = workspace?.markets.map((market) => market.name).join(' / ') ?? 'active markets';
  const exposure = workspace?.buyingGroup.financialExposure;
  const currentState = workspace?.currentState;
  const topSignal = workspace?.signals[0];
  const topMove = workspace?.competitorMoves[0];
  const source = workspace?.documents[0]?.source ?? workspace?.buyingGroup.source;

  return {
    title: `${buyingGroup} KAM-Safe Negotiation Guide`,
    subtitle: 'Editable field-ready report for CNO review before sending to KAM',
    audience: 'KAM-safe / field negotiation guidance',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt,
    summary: `This draft translates ATLAS buyer intelligence into KAM-safe guidance for ${buyingGroup}. It keeps the field team focused on the approved customer-facing story, proof points, likely buyer pressure, and next actions while removing internal red lines, fallback thresholds, sensitive margin controls, and unsupported claims.`,
    metrics: [
      { label: 'Buying group', value: buyingGroup, note: markets },
      { label: 'Negotiation round', value: currentState?.negotiationRound ?? 'TBD', note: 'Use as field context only' },
      { label: 'Buyer ask', value: currentState?.latestBuyerAsk ?? 'TBD', note: 'Customer-facing number captured in profile' },
      { label: 'PepsiCo position', value: currentState?.pepsicoPosition ?? 'TBD', note: 'Approved external posture only' },
      { label: 'Revenue in scope', value: exposure ? euros(exposure.revenueUnderNegotiation) : 'TBD', note: 'Do not expose internal sensitivity logic' },
      { label: 'Expected realization', value: exposure ? `${exposure.expectedPriceRealization.toFixed(1)}%` : 'TBD', note: 'Directional field planning view' },
      { label: 'Source status', value: source?.status.replaceAll('_', ' ') ?? 'Needs source', note: source ? `${source.sourceName} / ${source.sourceDate}` : 'Attach buyer source before final send' },
      { label: 'Confidence', value: source?.confidence ?? 'medium', note: 'CNO must approve before sending' }
    ],
    sections: [
      {
        title: 'KAM-safe negotiation posture',
        body: `Use this posture with ${buyingGroup}: defend the current PepsiCo position through customer value, category performance, execution support, and source-backed external pressure. Keep the conversation anchored on what the buyer can validate, not internal thresholds.`,
        bullets: [
          currentState?.pepsicoPosition ? `Lead with the approved PepsiCo position: ${currentState.pepsicoPosition}.` : 'Lead with the CNO-approved PepsiCo position.',
          'Do not mention red lines, internal fallback thresholds, approval dependencies, or sensitive margin logic.',
          'If the buyer presses beyond the approved position, capture the ask and return to CNO/finance for review.'
        ]
      },
      {
        title: 'Likely buyer pressure',
        body: topSignal
          ? `${topSignal.title}: ${topSignal.negotiationImplication}`
          : `${buyingGroup} is expected to pressure pricing, promo support, and execution commitments based on the current buyer profile.`,
        bullets: [
          topSignal ? `Use source-backed framing: ${topSignal.source.sourceName}, ${topSignal.source.sourceDate}.` : 'Use only source-backed public or approved internal evidence.',
          topMove ? `Expect competitor/private label leverage: ${topMove.possibleBuyerLeverage}` : 'Expect the buyer to compare PepsiCo movement against private label or competitor activity.',
          'Ask clarifying questions before committing to concessions.'
        ]
      },
      {
        title: 'Approved proof points to use',
        body: 'Keep proof points simple, customer-facing, and easy for the KAM to repeat in the room.',
        bullets: [
          'Category and shopper value: branded performance, basket role, and execution quality.',
          'External pressure: inflation, commodity, supply chain, or retailer-market signals only when sourced.',
          'Execution support: promo phasing, service, visibility, or portfolio support that has been approved for field use.'
        ],
        table: {
          title: 'KAM-safe proof point checklist',
          columns: ['Proof point', 'Use in room', 'Source posture'],
          rows: [
            ['Buyer ask context', currentState?.latestBuyerAsk ?? 'Confirm latest ask before use', 'Buyer profile'],
            ['PepsiCo position', currentState?.pepsicoPosition ?? 'Use approved position only', 'CNO reviewed'],
            ['Market signal', topSignal?.title ?? 'Attach latest sourced signal', topSignal ? `${topSignal.source.sourceName} / ${topSignal.source.sourceDate}` : 'Needs source'],
            ['Competitor pressure', topMove?.title ?? 'Use only if relevant', topMove ? topMove.source.sourceName : 'Needs source']
          ]
        }
      },
      {
        title: 'What to capture and escalate',
        body: 'The field team should use this guide to move faster, but official scenario changes still require CNO/finance review.',
        bullets: [
          'Capture any new buyer number, condition, deadline, promo ask, or sanction threat.',
          'Escalate any request that changes margin, trade spend, volume assumptions, or market offset logic.',
          'After the meeting, upload the debrief into the buying group History tab so ATLAS updates memory.'
        ]
      }
    ],
    sources: [
      { label: source?.sourceName ?? 'ATLAS buyer profile', detail: source ? `${source.sourceType.replaceAll('_', ' ')} / ${source.sourceDate}` : 'Synthetic buyer profile source' },
      { label: 'Original request', detail: prompt },
      { label: 'Safety rule', detail: 'KAM-safe output removes red lines, fallback thresholds, sensitive margin controls, confidence gaps, and unsupported claims.' }
    ],
    caveats: [
      'CNO must review and save this guide before sending to KAM.',
      'Do not use this report as customer-facing material without additional redaction.',
      'Values are prototype data unless connected to approved PepsiCo source systems.'
    ]
  };
}

function offlineLiveDebriefReport(prompt: string, context: LiveDebriefReportContext): AtlasGeneratedReport {
  const generatedAt = new Date().toISOString();
  const signalRows = context.detectedSignals.map((signal) => [
    signal.type.replaceAll('_', ' '),
    signal.summary,
    signal.extractedNumbers.join(', '),
    signal.confidence
  ]);
  const documentRows = context.generatedDocuments.map((document, index) => [
    String(index + 1),
    document.title,
    document.documentType,
    document.trigger,
    document.confidence
  ]);

  return {
    title: `${context.buyingGroup} Live Negotiation Debrief`,
    subtitle: `Generated from live session ${context.sessionId}`,
    audience: 'CNO internal',
    sourceMode: 'offline_placeholder',
    model: null,
    generatedAt,
    summary: `ATLAS generated a debrief from hidden live-session signals and ${context.generatedDocuments.length} generated document${context.generatedDocuments.length === 1 ? '' : 's'}. This report uses structured signals and artifact history as the source trail.`,
    metrics: [
      { label: 'Buying group', value: context.buyingGroup, note: 'Live setup selection' },
      { label: 'Generated docs', value: String(context.generatedDocuments.length), note: 'Included in appendix' },
      { label: 'Detected signals', value: String(context.detectedSignals.length), note: 'Hidden structured event log' },
      { label: 'Prep deck', value: context.prepDeckLabel, note: 'Placeholder source input' }
    ],
    sections: [
      {
        title: 'Session summary',
        body: `The live agent ran from ${new Date(context.startedAt).toLocaleString('en-US')} to ${new Date(context.endedAt).toLocaleString('en-US')}. It monitored for buyer asks, pricing guardrails, margin pressure, promo exposure, market offsets, and strategy drift.`,
        bullets: [
          'Buyer and pricing signals should be reviewed before being promoted to the official negotiation history.',
          'Generated documents should be treated as draft internal artifacts until source validation is complete.',
          'Any fallback position remains approval-gated when finance validation is open.'
        ]
      },
      {
        title: 'Detected negotiation signals',
        body: 'These are structured signals captured by the listening agent and used as the source trail for the debrief.',
        bullets: [],
        table: {
          title: 'Hidden signal log',
          columns: ['Signal', 'Summary', 'Extracted numbers', 'Confidence'],
          rows: signalRows.length ? signalRows : [['No signal', 'No structured live signal was captured.', 'N/A', 'N/A']]
        }
      },
      {
        title: 'Recommended follow-ups',
        body: 'ATLAS recommends turning the generated work into a clean post-meeting action list before the next buyer interaction.',
        bullets: [
          'Validate finance-sensitive margin and volume assumptions.',
          'Confirm whether any buyer ask changes the approved strategy or only adds a fallback path.',
          'Send the relevant generated data views to owners for review before using them externally.'
        ]
      },
      {
        title: 'Appendix: documents generated during the session',
        body: 'Each artifact below was generated during the live session and should remain attached to the debrief trail.',
        bullets: [],
        table: {
          title: 'Generated document appendix',
          columns: ['#', 'Document', 'Type', 'Trigger', 'Confidence'],
          rows: documentRows.length ? documentRows : [['0', 'No generated document', 'N/A', 'No generated documents were created before session close.', 'N/A']]
        }
      }
    ],
    sources: [
      { label: 'Live session', detail: `Session ${context.sessionId}` },
      { label: 'Prep / strategy deck', detail: context.prepDeckLabel },
      { label: 'Original prompt', detail: prompt }
    ],
    caveats: [
      'Offline placeholder mode: values are generated from local live-session context, not a connected model.',
      'Live Negotiator uses structured signals as the report source trail.',
      'Validate margin, pricing, and customer-facing claims before external use.'
    ]
  };
}

export function buildOfflineAtlasReport(prompt: string): AtlasGeneratedReport {
  if (isKamSafeReportRequest(prompt)) return offlineKamSafeReport(prompt);
  return looksLikeFinanceAsk(prompt) ? offlineFinanceReport(prompt) : offlineGeneralReport(prompt);
}

function atlasContextPacket(options: AtlasReportGenerationOptions = {}) {
  const buyingGroupWorkspace = options.buyingGroupId
    ? buildBuyingGroupWorkspacePacket(options.buyingGroupId)
    : undefined;

  return {
    app: 'ATLAS POC',
    requestedScope: {
      buyingGroupId: options.buyingGroupId ?? null,
      marketId: options.marketId ?? null,
      buyingGroupWorkspace: buyingGroupWorkspace ?? null
    },
    currentNegotiation: {
      customer: demoNegotiation.customer,
      buyingGroup: demoNegotiation.buyingGroup,
      region: demoNegotiation.region,
      cycle: demoNegotiation.cycle,
      currentStrategy: demoNegotiation.currentStrategySummary,
      recommendedPosition: demoNegotiation.recommendedPosition,
      readiness: demoNegotiation.strategyReadinessState,
      pricingPosition: demoNegotiation.pricingPosition,
      scenarios: demoNegotiation.scenarios,
      watchouts: demoNegotiation.openRisks,
      sourceReadiness: demoNegotiation.sourceReadiness
    }
  };
}

export async function generateAtlasReport(prompt: string, options: AtlasReportGenerationOptions = {}): Promise<AtlasGeneratedReport> {
  const apiKey = readSetting('OPENAI_API_KEY');
  const model = readSetting('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  const generatedAt = new Date().toISOString();
  const offline = options.liveContext
    ? offlineLiveDebriefReport(prompt, options.liveContext)
    : isKamSafeReportRequest(prompt)
      ? offlineKamSafeReport(prompt, options.buyingGroupId)
      : buildOfflineAtlasReport(prompt);

  if (isKamSafeReportRequest(prompt)) return offline;
  if (!apiKey) return offline;

  const baseBody = {
    model,
    instructions: `You are ATLAS, a senior strategy and finance copilot. Generate a report for any user request.

Return valid JSON only. Do not wrap in markdown.

Rules:
- Always write the generated report in English, regardless of the market, country, source language, or user prompt language.
- Do not force every answer into Carrefour negotiation context. Use it only when relevant.
- If the user asks for public company financials or P&L, produce a finance-style report with line items, interpretation, and source caveats.
- If exact current or historical facts are uncertain, mark them as needing source validation rather than inventing certainty.
- If the request is negotiation-related, use the ATLAS context packet.
- If the request asks for a KAM-safe report, guide, or pack, produce field-ready guidance for KAMs and remove internal red lines, fallback thresholds, sensitive margin controls, unsupported claims, and confidence gaps. Include only approved external posture, safe proof points, escalation triggers, what to capture, and CNO review notes.
- If the request asks for recent news, current events, or latest developments, use web search when available and cite source names and dates in the sources array.
- Make the output feel like a polished PDF-ready artifact.
- Do not return a generic placeholder. If exact data is unavailable, still answer the specific user request with clearly labeled assumptions and gaps.

JSON shape:
{
  "title": string,
  "subtitle": string,
  "audience": string,
  "summary": string,
  "metrics": [{"label": string, "value": string, "note": string}],
  "sections": [{
    "title": string,
    "body": string,
    "bullets": string[],
    "table": {"title": string, "columns": string[], "rows": string[][]} | null
  }],
  "sources": [{"label": string, "detail": string}],
  "caveats": string[]
}`,
    input: `User request:\n${prompt}\n\nATLAS context packet:\n${JSON.stringify(atlasContextPacket(options), null, 2)}\n\nLive session context, when present:\n${JSON.stringify(options.liveContext ?? null, null, 2)}`,
    max_output_tokens: 2200
  };

  try {
    const requestBodies = shouldUseWebSearch(prompt)
      ? [{ ...baseBody, tools: [{ type: 'web_search_preview' }] }, baseBody]
      : [baseBody];

    let data: unknown = null;
    let response: Response | null = null;
    for (const body of requestBodies) {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      data = await response.json().catch(() => null);
      if (response.ok) break;
      if (body === baseBody) break;
    }

    if (!response?.ok) {
      const message = data && typeof data === 'object'
        ? JSON.stringify((data as { error?: unknown }).error ?? data).slice(0, 500)
        : `OpenAI request failed with status ${response?.status ?? 'unknown'}.`;
      return liveFailureReport(prompt, model, generatedAt, message);
    }

    const text = extractOutputText(data);
    if (!text) return liveFailureReport(prompt, model, generatedAt, 'OpenAI returned an empty response.');
    const parsed = parseReportJson(text);
    if (!parsed) return liveTextReport(prompt, text, model, generatedAt);

    return {
      ...parsed,
      sourceMode: 'openai',
      model,
      generatedAt,
      metrics: parsed.metrics.slice(0, 8),
      sections: parsed.sections.slice(0, 6),
      caveats: parsed.caveats.length ? parsed.caveats : ['Generated by live model. Validate sensitive factual or financial claims before use.']
    };
  } catch (error) {
    return liveFailureReport(
      prompt,
      model,
      generatedAt,
      `OpenAI request failed: ${error instanceof Error ? error.message : 'unknown error'}.`
    );
  }
}
