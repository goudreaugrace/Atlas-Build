import { NextRequest } from 'next/server';
import { runUnifiedAssistantTurn } from '@/src/lib/intelligence/unified-assistant';
import type { JarvisEvent, JarvisWorkspaceStatus, JarvisWorkspaceStep } from '@/src/lib/intelligence/jarvis-events';

export const runtime = 'nodejs';

function sse(data: JarvisEvent) {
  return `event: jarvis_event\ndata: ${JSON.stringify(data)}\n\n`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function compactHistory(rawHistory: unknown[]) {
  return rawHistory
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const role = (item as { role?: unknown }).role;
      const text = (item as { text?: unknown }).text;
      if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim()) return null;
      return { role: role as 'user' | 'assistant', text: text.trim().slice(0, 1800) };
    })
    .filter((item: { role: 'user' | 'assistant'; text: string } | null): item is { role: 'user' | 'assistant'; text: string } => Boolean(item))
    .slice(-8);
}

function answerChunks(answer: string) {
  const chunks = answer
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return chunks.length ? chunks : [answer];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const brandId = String(body.brandId ?? '');
  const question = String(body.question ?? '');
  const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim()
    ? body.sessionId.trim().slice(0, 120)
    : `jarvis-${brandId || 'brand'}-${Date.now().toString(36)}`;
  const inputMode = body.inputMode === 'voice' ? 'voice' : 'text';
  const rawHistory: unknown[] = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: JarvisEvent) => controller.enqueue(encoder.encode(sse(event)));
      const progress = (step: JarvisWorkspaceStep, status: JarvisWorkspaceStatus, detail?: string) => {
        emit({ type: 'workspace_progress', step, status, detail });
      };

      try {
        emit({ type: 'session_started', sessionId, brandId });
        emit({ type: 'user_message', text: question, inputMode });
        emit({ type: 'assistant_state', state: 'thinking', detail: 'Reading the active brand packet and conversation context.' });
        progress('ask', 'complete', 'Question captured in the active brand context.');
        progress('decide', 'active', 'Choosing direct answer, offer, approval work, or fail-closed governance.');

        const result = await runUnifiedAssistantTurn({
          brandId,
          question,
          personaId: typeof body.personaId === 'string' ? body.personaId : undefined,
          conversationMode: typeof body.conversationMode === 'string' ? body.conversationMode : undefined,
          activeWorkId: typeof body.activeWorkId === 'string' ? body.activeWorkId : undefined,
          conversationHistory: compactHistory(rawHistory)
        });

        progress('decide', 'complete', result.intent.reason);
        emit({ type: 'decision_ready', mode: result.intent.type, reason: result.intent.reason });
        emit({
          type: 'proof_update',
          evidenceCount: result.proofDisclosure.evidenceBasis.length,
          gapCount: result.proofDisclosure.missingEvidence.length,
          guardrailCount: result.proofDisclosure.guardrails.length
        });
        emit({ type: 'assistant_state', state: 'speaking', detail: 'Preparing the grounded answer.' });

        const chunks = answerChunks(result.writtenAnswer || result.answer);
        for (const [index, chunk] of chunks.entries()) {
          emit({ type: 'answer_delta', text: `${index > 0 ? ' ' : ''}${chunk}` });
          if (chunks.length > 1) await delay(18);
        }

        emit({ type: 'answer_ready', writtenAnswer: result.writtenAnswer || result.answer, spokenAnswer: result.spokenAnswer });
        emit({ type: 'assistant_response_ready', response: result });

        if (result.intent.requiresApproval) {
          progress('build', 'watch', 'Waiting for approval before opening governed views.');
          progress('review', 'active', 'Approval gate is active.');
          emit({
            type: 'approval_required',
            summary: result.intent.reason,
            workSpec: result.workSpec
          });
          emit({ type: 'assistant_state', state: 'approval', detail: result.intent.reason });
        } else {
          progress('prove', 'complete', 'Proof, gaps, and guardrails are attached to the answer.');
          progress('review', 'watch', 'Follow-up work remains gated if needed.');
          emit({ type: 'assistant_state', state: 'ready', detail: 'Answer ready. Ask a follow-up or request governed work.' });
        }

        emit({ type: 'workspace_ready', turnId: sessionId });
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Assistant event stream failed.';
        emit({ type: 'error', message, recoverable: true });
        emit({ type: 'assistant_state', state: 'error', detail: message });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive'
    }
  });
}
