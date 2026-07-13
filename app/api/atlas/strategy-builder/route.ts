import { NextResponse } from 'next/server';
import { demoNegotiation } from '@/src/lib/atlas/demo-data';
import { inferStrategyBuilderMutation, type StrategyBuilderMutation } from '@/src/lib/atlas/strategy-builder';

type StrategyBuilderRequest = {
  prompt?: string;
  activePathStep?: string;
  uploadedDocs?: Array<{ fileName?: string; role?: string }>;
  manualEdits?: Array<{ label?: string; value?: number; unit?: string }>;
};

type ResponseContent = {
  text?: string;
  type?: string;
};

function responseText(output: unknown) {
  if (!output || !Array.isArray(output)) return '';
  return output
    .flatMap((item) => {
      if (!item || typeof item !== 'object' || !('content' in item) || !Array.isArray(item.content)) return [];
      return item.content
        .filter((content: ResponseContent) => content?.type === 'output_text' && typeof content.text === 'string')
        .map((content: ResponseContent) => content.text);
    })
    .join('\n')
    .trim();
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function enrichWithOpenAI(body: StrategyBuilderRequest, fallback: StrategyBuilderMutation) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback;

  const prompt = body.prompt?.trim() ?? '';
  const manualEdits = (body.manualEdits ?? []).map((edit) => `${edit.label}: ${edit.value}${edit.unit ?? ''}`).join(', ');
  const docs = (body.uploadedDocs ?? []).map((doc) => `${doc.fileName} (${doc.role ?? 'source'})`).join(', ');
  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: `You are ATLAS, a CNO strategy builder for PepsiCo retailer negotiations.
Return only compact JSON matching:
{"assistantMessage":"...","proposedChange":"...","affectedModules":["thesis"],"affectedNumbers":["Current counter"]}

Context:
Buying group: Carrefour Group / Eurelec.
Current strategy: ${demoNegotiation.sellStory.editableDraft}
Prompt: ${prompt}
Current active module: ${body.activePathStep ?? 'thesis'}
Manual edits: ${manualEdits || 'none'}
Supporting docs: ${docs || 'none'}

Rules:
- Always write all generated content in English, regardless of the market, country, source language, or user prompt language.
- Keep the response grounded in strategy validation, buyer reaction, evidence, scenario pressure, market signals, or readiness.
- Do not claim real source access beyond the provided context.
- If the request involves a number, label it as a proposed working update until validated.`,
    max_output_tokens: 450
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return fallback;
    const data = await response.json();
    const text = responseText(data.output);
    const parsed = safeJson(text);
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      ...fallback,
      assistantMessage: typeof parsed.assistantMessage === 'string' ? parsed.assistantMessage : fallback.assistantMessage,
      proposal: {
        ...fallback.proposal,
        proposedChange: typeof parsed.proposedChange === 'string' ? parsed.proposedChange : fallback.proposal.proposedChange,
        affectedModules: Array.isArray(parsed.affectedModules) && parsed.affectedModules.length ? parsed.affectedModules : fallback.proposal.affectedModules,
        affectedNumbers: Array.isArray(parsed.affectedNumbers) ? parsed.affectedNumbers : fallback.proposal.affectedNumbers
      }
    } satisfies StrategyBuilderMutation;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as StrategyBuilderRequest;
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const fallback = inferStrategyBuilderMutation(prompt);
  const mutation = await enrichWithOpenAI(body, fallback);
  return NextResponse.json(mutation);
}
