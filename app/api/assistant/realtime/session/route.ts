import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { findBrandRecord } from '@/src/lib/brand-context';

export const runtime = 'nodejs';

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export async function POST(req: NextRequest) {
  const apiKey = readSetting('OPENAI_API_KEY');
  const enabled = readSetting('ASSISTANT_REALTIME_ENABLED') ?? readSetting('LIVE_CONSULT_ENABLED') ?? 'true';

  if (!apiKey || enabled === 'false') {
    return NextResponse.json(
      { error: !apiKey ? 'missing_api_key' : 'assistant_realtime_disabled' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const record = findBrandRecord(String(body.brandId ?? ''));
  const model = readSetting('ASSISTANT_REALTIME_MODEL') ?? readSetting('LIVE_CONSULT_MODEL') ?? 'gpt-realtime';
  const voice = readSetting('ASSISTANT_REALTIME_VOICE') ?? readSetting('LIVE_CONSULT_VOICE') ?? 'marin';
  const client = new OpenAI({ apiKey });

  try {
    const secret = await client.realtime.clientSecrets.create({
      expires_after: { anchor: 'created_at', seconds: 600 },
      session: {
        type: 'realtime',
        model,
        instructions: [
          `You are the realtime voice shell for BBE Brand Assistant on ${record.brandName}.`,
          'For every substantive brand question or work request, call the client tool before giving the answer.',
          'Use the tool result as the source of truth. Do not invent diagnoses, metrics, causes, treatments, approval status, source truth, or governance permissions.',
          'Speak naturally and briefly. Direct answers should feel like a senior brand strategist, not a system log.',
          'If the tool says approval is required, ask the user whether to approve the governed work. Do not execute the work unless the user explicitly approves.'
        ].join('\n'),
        output_modalities: ['audio'],
        audio: {
          output: { voice },
          input: {
            transcription: { model: 'gpt-4o-mini-transcribe' },
            turn_detection: {
              type: 'semantic_vad',
              eagerness: 'medium',
              interrupt_response: true
            }
          }
        },
        max_output_tokens: 900,
        tracing: null
      }
    });

    return NextResponse.json({
      clientSecret: secret.value,
      expiresAt: secret.expires_at,
      model,
      voice,
      brandId: record.brandId,
      brandName: record.brandName,
      category: record.category
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown_error';
    console.warn(`Assistant Realtime token fallback: ${detail}`);
    return NextResponse.json({
      error: 'assistant_realtime_client_secret_failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : detail
    }, { status: 502 });
  }
}
