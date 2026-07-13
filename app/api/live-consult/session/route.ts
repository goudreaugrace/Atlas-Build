import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { findBrandRecord } from '@/src/lib/brand-context';
import { buildLiveConsultInstructions } from '@/src/lib/live-consult/context';

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export async function POST(req: NextRequest) {
  const apiKey = readSetting('OPENAI_API_KEY');
  const enabled = readSetting('LIVE_CONSULT_ENABLED') ?? 'true';

  if (!apiKey || enabled === 'false') {
    return NextResponse.json(
      { error: !apiKey ? 'missing_api_key' : 'live_consult_disabled' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const record = findBrandRecord(String(body.brandId ?? ''));
  const personaId = String(body.personaId ?? 'brand_doctor');
  const model = readSetting('LIVE_CONSULT_MODEL') ?? 'gpt-realtime';
  const voice = readSetting('LIVE_CONSULT_VOICE') ?? 'marin';
  const instructions = buildLiveConsultInstructions(record, personaId);
  const client = new OpenAI({ apiKey });

  try {
    const secret = await client.realtime.clientSecrets.create({
      expires_after: { anchor: 'created_at', seconds: 600 },
      session: {
        type: 'realtime',
        model,
        instructions,
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
    console.warn(`Live Consult token fallback: ${detail}`);
    return NextResponse.json({
      error: 'realtime_client_secret_failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : detail
    }, { status: 502 });
  }
}
