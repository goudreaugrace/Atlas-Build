import type { UnifiedAssistantResponse } from '@/src/lib/intelligence/unified-assistant';
import type { ConversationModeDecisionType } from '@/src/lib/intelligence/types';

export type JarvisAssistantState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'approval'
  | 'building'
  | 'ready'
  | 'error';

export type JarvisWorkspaceStep = 'ask' | 'decide' | 'plan' | 'build' | 'prove' | 'review';

export type JarvisWorkspaceStatus = 'waiting' | 'active' | 'complete' | 'watch';

export type JarvisEvent =
  | { type: 'session_started'; sessionId: string; brandId: string }
  | { type: 'assistant_state'; state: JarvisAssistantState; detail?: string }
  | { type: 'user_message'; text: string; inputMode: 'text' | 'voice' }
  | { type: 'workspace_progress'; step: JarvisWorkspaceStep; status: JarvisWorkspaceStatus; detail?: string }
  | { type: 'answer_delta'; text: string }
  | { type: 'answer_ready'; writtenAnswer: string; spokenAnswer?: string }
  | { type: 'assistant_response_ready'; response: UnifiedAssistantResponse }
  | { type: 'decision_ready'; mode: ConversationModeDecisionType; reason: string }
  | { type: 'approval_required'; summary: string; workSpec: UnifiedAssistantResponse['workSpec'] }
  | { type: 'proof_update'; evidenceCount: number; gapCount: number; guardrailCount: number }
  | { type: 'workspace_ready'; turnId: string }
  | { type: 'error'; message: string; recoverable: boolean };
