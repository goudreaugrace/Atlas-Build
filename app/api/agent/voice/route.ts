import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const MAX_TTS_CHARS = 900;

const allowedVoices = new Set([
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar'
]);

function readSetting(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function normalizeText(value: unknown) {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= MAX_TTS_CHARS) return cleaned;
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  let text = '';
  for (const sentence of sentences) {
    const next = `${text} ${sentence.trim()}`.trim();
    if (next.length > MAX_TTS_CHARS) break;
    text = next;
  }
  if (text) return text;
  const clipped = cleaned.slice(0, MAX_TTS_CHARS);
  return clipped.slice(0, Math.max(0, clipped.lastIndexOf(' '))).trim() || clipped.trim();
}

function normalizeVoice(value: unknown) {
  const requested = typeof value === 'string' ? value.trim() : '';
  const configured = readSetting('OPENAI_TTS_VOICE') ?? readSetting('LIVE_CONSULT_VOICE') ?? 'marin';
  const voice = requested || configured;
  return allowedVoices.has(voice) ? voice : 'marin';
}

function normalizeSpeed(value: unknown) {
  const requested = typeof value === 'number' ? value : Number(readSetting('OPENAI_TTS_SPEED') ?? 1.12);
  if (!Number.isFinite(requested)) return 1.12;
  return Math.min(1.35, Math.max(0.8, requested));
}

export async function POST(req: NextRequest) {
  const apiKey = readSetting('OPENAI_API_KEY');
  const enabled = readSetting('OPENAI_TTS_ENABLED') ?? 'true';

  if (!apiKey || enabled === 'false') {
    return NextResponse.json(
      { error: !apiKey ? 'missing_api_key' : 'tts_disabled' },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const input = normalizeText((body as { text?: unknown }).text);
  if (!input) {
    return NextResponse.json({ error: 'missing_text' }, { status: 400 });
  }

  const model = readSetting('OPENAI_TTS_MODEL') ?? 'gpt-4o-mini-tts';
  const voice = normalizeVoice((body as { voice?: unknown }).voice);
  const speed = normalizeSpeed((body as { speed?: unknown }).speed);
  const client = new OpenAI({ apiKey });

  try {
    const speech = await client.audio.speech.create({
      model,
      voice,
      input,
      response_format: 'mp3',
      speed,
      instructions: 'Speak like a calm senior brand strategy advisor in a live working session. Be concise, confident, warm, and natural. Move a little briskly. Do not sound like a system log.'
    });
    const audio = await speech.arrayBuffer();

    return new Response(audio, {
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'no-store',
        'x-bbe-voice-provider': 'openai-tts',
        'x-bbe-voice-model': model,
        'x-bbe-voice-name': voice
      }
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown_error';
    console.warn(`Agent voice TTS failed: ${detail}`);
    return NextResponse.json({
      error: 'tts_request_failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : detail
    }, { status: 502 });
  }
}
