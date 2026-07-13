import { NextRequest, NextResponse } from 'next/server';
import { runUnifiedAssistantTurn } from '@/src/lib/intelligence/unified-assistant';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawHistory: unknown[] = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
  const result = await runUnifiedAssistantTurn({
    brandId: String(body.brandId ?? ''),
    question: String(body.question ?? ''),
    personaId: typeof body.personaId === 'string' ? body.personaId : undefined,
    conversationMode: typeof body.conversationMode === 'string' ? body.conversationMode : undefined,
    activeWorkId: typeof body.activeWorkId === 'string' ? body.activeWorkId : undefined,
    conversationHistory: rawHistory
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') return null;
        const role = (item as { role?: unknown }).role;
        const text = (item as { text?: unknown }).text;
        if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim()) return null;
        return { role: role as 'user' | 'assistant', text: text.trim().slice(0, 1800) };
      })
      .filter((item: { role: 'user' | 'assistant'; text: string } | null): item is { role: 'user' | 'assistant'; text: string } => Boolean(item))
      .slice(-8)
  });

  return NextResponse.json(result);
}
