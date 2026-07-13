'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Database, FileText, Home, MessageSquareText, Mic, MicOff, Network, Play, Radar, Search, Send, Sparkles, Square, Waves } from 'lucide-react';
import { z } from 'zod';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import MarkdownMessage from '@/src/components/common/MarkdownMessage';
import type { JarvisAssistantState, JarvisEvent, JarvisWorkspaceStatus, JarvisWorkspaceStep } from '@/src/lib/intelligence/jarvis-events';
import type { AgentTurnEvent, AgentTurnResult } from '@/src/lib/intelligence/types';
import type { UnifiedAssistantResponse } from '@/src/lib/intelligence/unified-assistant';
import type { BrandHealthRecord } from '@/src/types/domain';

type JarvisMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  response?: UnifiedAssistantResponse;
};

type TimelineStep = {
  id: JarvisWorkspaceStep;
  label: string;
  status: JarvisWorkspaceStatus;
  detail: string;
};

type VoiceTransportState = 'idle' | 'checking' | 'realtime' | 'fallback' | 'unavailable' | 'error';

type BrandWorkShelfRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  status: 'ready' | 'review_required' | 'blocked';
  workType: string;
  approvedTemplateId: string;
  approvedViewIds: string[];
  proofCounts: {
    evidence: number;
    gaps: number;
    gates: number;
  };
};

type WorkShelfItem = {
  id: string;
  title: string;
  status: string;
  kind: string;
  meta: string;
  href?: string;
  active?: boolean;
};

type ThoughtCoreIntensity = 'idle' | 'low' | 'medium' | 'high' | 'review' | 'error';

type ThoughtCoreNode = {
  id: string;
  label: string;
  status: JarvisWorkspaceStatus;
};

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

const defaultTimeline: TimelineStep[] = [
  { id: 'ask', label: 'Ask', status: 'waiting', detail: 'Awaiting brand question.' },
  { id: 'decide', label: 'Decide', status: 'waiting', detail: 'Direct answer or governed work.' },
  { id: 'plan', label: 'Plan', status: 'waiting', detail: 'Map work if needed.' },
  { id: 'build', label: 'Build', status: 'waiting', detail: 'Render approved modules.' },
  { id: 'prove', label: 'Prove', status: 'waiting', detail: 'Attach evidence and gaps.' },
  { id: 'review', label: 'Review', status: 'waiting', detail: 'Keep approvals visible.' }
];

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function possessiveBrandName(brandName: string) {
  if (brandName.endsWith("'s")) return brandName;
  if (brandName.endsWith('s')) return `${brandName}'`;
  return `${brandName}'s`;
}

function stateLabel(state: JarvisAssistantState) {
  if (state === 'listening') return 'Listening';
  if (state === 'thinking') return 'Scanning';
  if (state === 'speaking') return 'Responding';
  if (state === 'approval') return 'Approval Gate';
  if (state === 'building') return 'Building';
  if (state === 'ready') return 'Ready';
  if (state === 'error') return 'Recovery';
  return 'Standby';
}

function stateDetail(state: JarvisAssistantState, response: UnifiedAssistantResponse | null) {
  if (state === 'thinking') return 'Cross-checking the brand packet, proof, gaps, and action rules.';
  if (state === 'speaking') return 'Grounded answer is streaming into the conversation layer.';
  if (state === 'approval') return response?.intent.reason ?? 'Governed work needs your approval before execution.';
  if (state === 'building') return 'Approved work modules are being assembled in the live canvas.';
  if (state === 'ready') return 'Ask a follow-up or expand the active work surface.';
  if (state === 'error') return 'The preview hit a recoverable issue. Stable Assistant remains available.';
  return 'Type a prompt. Voice transport is the next adapter on this same surface.';
}

function titleCaseLabel(id: string) {
  return id.replaceAll(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactKind(record: Pick<BrandWorkShelfRecord, 'workType' | 'approvedTemplateId'>) {
  if (record.workType && record.workType !== 'workspace') return titleCaseLabel(record.workType);
  return titleCaseLabel(record.approvedTemplateId);
}

function formatShelfDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function transcriptProofCounts(response: UnifiedAssistantResponse) {
  return {
    evidence: response.proofDisclosure.evidenceBasis.length,
    gaps: response.proofDisclosure.missingEvidence.length,
    guardrails: response.proofDisclosure.guardrails.length
  };
}

function cleanSpeechText(text: string, maxChars = 900) {
  const cleaned = text
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\bQBR\b/g, 'Q B R')
    .replace(/\bBBE\b/g, 'B B E')
    .replace(/\bSMD\b/g, 'S M D')
    .trim();
  if (cleaned.length <= maxChars) return cleaned;
  const close = ' The fuller read is on screen.';
  const budget = Math.max(180, maxChars - close.length);
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  let speech = '';
  for (const sentence of sentences) {
    const next = `${speech} ${sentence.trim()}`.trim();
    if (next.length > budget) break;
    speech = next;
  }
  if (!speech) {
    const clipped = cleaned.slice(0, budget);
    speech = clipped.slice(0, Math.max(0, clipped.lastIndexOf(' '))).trim() || clipped.trim();
  }
  return `${speech}${close}`.trim();
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'error' in error) return errorMessage((error as { error: unknown }).error);
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error || 'unknown_error');
}

function realtimeFailureRead(error: unknown) {
  const message = errorMessage(error);
  if (/browser_missing_get_user_media/i.test(message)) return 'This browser does not expose microphone access for Realtime voice.';
  if (/permission|notallowed|denied/i.test(message)) return 'Microphone permission was blocked or denied.';
  if (/notfound|device/i.test(message)) return 'No microphone input device was available to the browser.';
  if (/ephemeral|client key|api key/i.test(message)) return 'Realtime rejected the browser credential.';
  if (/connection|webrtc|sdp|ice|network/i.test(message)) return 'The WebRTC voice connection failed after the session was created.';
  return message;
}

function browserSpeechRecognition() {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as {
    SpeechRecognition?: new () => VoiceRecognition;
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).SpeechRecognition ?? (window as unknown as {
    webkitSpeechRecognition?: new () => VoiceRecognition;
  }).webkitSpeechRecognition;
}

function isApprovalPhrase(text: string) {
  return /\b(yes|approve|approved|build it|create it|go ahead|do it|run it|let's do it|please build)\b/i.test(text);
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function buildJarvisRealtimeInstructions(record: BrandHealthRecord) {
  return [
    `You are the realtime voice interface for the BBE Brand Command OS on ${record.brandName}.`,
    `The active brand is ${record.brandName} (${record.brandId}) in ${record.category}. Stay scoped to this brand unless the user explicitly asks for comparison.`,
    'Your job is brand equity diagnosis, evidence explanation, momentum interpretation, treatment recommendations to consider, learning support, and governed workspace/report/proof planning for the active brand.',
    'For every substantive user request, give one brief acknowledgement only if useful, then call answer_or_prepare_brand_work before answering.',
    'The tool result is the source of truth. Use spokenAnswer for the voice response and do not add unsupported facts, metrics, diagnoses, treatments, source truth, approvals, or governance permissions.',
    'If the tool says requiresApproval is true, ask naturally whether the user wants to approve the governed work. If the user approves, call approve_pending_jarvis_work.',
    'Speak like a sharp, warm senior brand strategist. Be fast, conversational, and concise. Do not narrate backend steps unless the user asks what is happening.',
    'Guardrails: no causality without causal evidence, no SKU-level pricing advice, no cannibalization or occasion-substitution claims as facts, no official approval/export/source writes/production certification.'
  ].join('\n');
}

async function readJarvisEvents(response: Response, onEvent: (event: JarvisEvent) => void) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Jarvis event stream unavailable.');

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const dataLine = frame.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) continue;
      onEvent(JSON.parse(dataLine.slice(6)) as JarvisEvent);
    }
  }
}

export default function JarvisWorkbenchClient({ record, activeWorkId }: { record: BrandHealthRecord; activeWorkId?: string }) {
  const [prompt, setPrompt] = useState(activeWorkId
    ? 'What should we tighten in this asset?'
    : `Tell me about ${possessiveBrandName(record.brandName)} momentum.`);
  const [messages, setMessages] = useState<JarvisMessage[]>([]);
  const [state, setState] = useState<JarvisAssistantState>('idle');
  const [latestResponse, setLatestResponse] = useState<UnifiedAssistantResponse | null>(null);
  const [workResult, setWorkResult] = useState<AgentTurnResult | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>(defaultTimeline);
  const [, setStatus] = useState('Preview ready');
  const [voiceTransport, setVoiceTransport] = useState<VoiceTransportState>('idle');
  const [voiceNote, setVoiceNote] = useState(activeWorkId
    ? 'Asset context is active for this Jarvis session.'
    : 'Voice adapter ready to connect.');
  const [workShelfRecords, setWorkShelfRecords] = useState<BrandWorkShelfRecord[]>([]);
  const [workShelfLoading, setWorkShelfLoading] = useState(true);
  const [latestWorkRecordId, setLatestWorkRecordId] = useState<string | null>(null);
  const [sessionId] = useState(() => `jarvis-${record.brandId}-${Date.now().toString(36)}`);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const latestResponseRef = useRef<UnifiedAssistantResponse | null>(null);
  const realtimeSessionRef = useRef<RealtimeSession | null>(null);
  const fallbackRecognitionRef = useRef<VoiceRecognition | null>(null);
  const activeTurnAbortRef = useRef<AbortController | null>(null);
  const lastCommandActivationRef = useRef(0);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, state]);

  useEffect(() => {
    latestResponseRef.current = latestResponse;
  }, [latestResponse]);

  useEffect(() => {
    let canceled = false;
    async function loadWorkShelf() {
      setWorkShelfLoading(true);
      try {
        const response = await fetch(`/api/brand-work?brandId=${encodeURIComponent(record.brandId)}&limit=8`, { cache: 'no-store' });
        const data = await response.json() as { records?: BrandWorkShelfRecord[] };
        if (!canceled) setWorkShelfRecords(Array.isArray(data.records) ? data.records : []);
      } catch {
        if (!canceled) setWorkShelfRecords([]);
      } finally {
        if (!canceled) setWorkShelfLoading(false);
      }
    }
    void loadWorkShelf();
    return () => {
      canceled = true;
    };
  }, [record.brandId]);

  useEffect(() => () => {
    activeTurnAbortRef.current?.abort();
    activeTurnAbortRef.current = null;
    realtimeSessionRef.current?.close();
    realtimeSessionRef.current = null;
    fallbackRecognitionRef.current?.abort?.();
    fallbackRecognitionRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const displayTimeline = timeline;
  const busy = state === 'thinking' || state === 'speaking' || state === 'building' || voiceTransport === 'checking';
  const activeActivity = displayTimeline.find((step) => step.status === 'active')
    ?? displayTimeline.find((step) => step.status === 'watch')
    ?? [...displayTimeline].reverse().find((step) => step.status === 'complete')
    ?? displayTimeline[0];
  const thoughtCore = (() => {
    const timelineNodes = displayTimeline.map((step) => ({
      id: step.id,
      label: step.label,
      status: step.status
    }));

    if (voiceTransport === 'checking') {
      return {
        eyebrow: 'Voice Path',
        phrase: 'Connecting voice...',
        detail: voiceNote,
        intensity: 'medium' as ThoughtCoreIntensity,
        nodes: [
          { id: 'voice', label: 'Voice', status: 'active' as JarvisWorkspaceStatus },
          { id: 'brand', label: 'Brand', status: 'waiting' as JarvisWorkspaceStatus },
          { id: 'route', label: 'Route', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'listening') {
      return {
        eyebrow: 'Listening',
        phrase: 'Listening...',
        detail: voiceNote,
        intensity: 'medium' as ThoughtCoreIntensity,
        nodes: [
          { id: 'voice', label: 'Voice', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'brand', label: 'Brand', status: 'active' as JarvisWorkspaceStatus },
          { id: 'route', label: 'Route', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'thinking') {
      return {
        eyebrow: 'Thinking',
        phrase: `Checking ${record.brandName} evidence...`,
        detail: 'Reading the brand packet, BBE evidence, diagnosis rules, gaps, and guardrails.',
        intensity: 'medium' as ThoughtCoreIntensity,
        nodes: [
          { id: 'brand', label: 'Brand', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'bbe', label: 'BBE', status: 'active' as JarvisWorkspaceStatus },
          { id: 'diagnosis', label: 'Diagnosis', status: 'waiting' as JarvisWorkspaceStatus },
          { id: 'caveats', label: 'Caveats', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'speaking') {
      return {
        eyebrow: 'Responding',
        phrase: 'Answering with proof...',
        detail: voiceNote,
        intensity: 'low' as ThoughtCoreIntensity,
        nodes: [
          { id: 'proof', label: 'Proof', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'voice', label: 'Voice', status: 'active' as JarvisWorkspaceStatus },
          { id: 'next', label: 'Next', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'approval') {
      return {
        eyebrow: 'Review Gate',
        phrase: 'Review required before build.',
        detail: latestResponse?.intent.reason ?? 'Governed work waits for confirmation.',
        intensity: 'review' as ThoughtCoreIntensity,
        nodes: [
          { id: 'scope', label: 'Scope', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'skill', label: 'Skill', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'review', label: 'Review', status: 'watch' as JarvisWorkspaceStatus },
          { id: 'build', label: 'Build', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'building') {
      return {
        eyebrow: 'Building',
        phrase: activeActivity?.detail ?? 'Assembling governed work...',
        detail: 'Approved modules, evidence, gaps, and review gates are being prepared.',
        intensity: 'high' as ThoughtCoreIntensity,
        nodes: timelineNodes
      };
    }

    if (state === 'ready') {
      return {
        eyebrow: 'Ready',
        phrase: 'Ready with proof.',
        detail: 'Ask a follow-up or choose the next governed work action.',
        intensity: 'low' as ThoughtCoreIntensity,
        nodes: [
          { id: 'proof', label: 'Proof', status: 'complete' as JarvisWorkspaceStatus },
          { id: 'ready', label: 'Ready', status: 'active' as JarvisWorkspaceStatus },
          { id: 'next', label: 'Next', status: 'waiting' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    if (state === 'error') {
      return {
        eyebrow: 'Recovery',
        phrase: 'Recovery check needed.',
        detail: voiceNote || stateDetail(state, latestResponse),
        intensity: 'error' as ThoughtCoreIntensity,
        nodes: [
          { id: 'recover', label: 'Recover', status: 'watch' as JarvisWorkspaceStatus }
        ] satisfies ThoughtCoreNode[]
      };
    }

    return {
      eyebrow: 'Standby',
      phrase: 'Waiting for instructions...',
      intensity: 'idle' as ThoughtCoreIntensity,
      nodes: [] satisfies ThoughtCoreNode[]
    };
  })();
  const micActive = voiceTransport === 'realtime' || voiceTransport === 'checking' || voiceTransport === 'fallback';
  const micLabel = voiceTransport === 'checking'
    ? 'Connecting'
    : voiceTransport === 'realtime'
      ? 'Stop Voice'
      : voiceTransport === 'fallback'
        ? 'Stop Fallback'
        : voiceTransport === 'unavailable'
          ? 'Retry Voice'
        : 'Start Voice';

  function updateStep(step: JarvisWorkspaceStep, statusValue: JarvisWorkspaceStatus, detail?: string) {
    setTimeline((current) => current.map((item) => (
      item.id === step ? { ...item, status: statusValue, detail: detail ?? item.detail } : item
    )));
  }

  function updateAssistantMessage(id: string, patch: Partial<JarvisMessage>) {
    setMessages((current) => current.map((message) => (
      message.id === id ? { ...message, ...patch } : message
    )));
  }

  function recordJarvisTranscript(payload: Record<string, unknown>) {
    void fetch('/api/assistant/transcript', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        surface: 'jarvis-preview',
        brandId: record.brandId,
        sessionId,
        ...payload
      })
    }).catch(() => undefined);
  }

  async function recordBrandWork(
    result: AgentTurnResult,
    sourcePrompt: string,
    workSpec?: UnifiedAssistantResponse['workSpec']
  ) {
    const viewIds = result.answer.dynamicViewRequests.map((request) => request.viewId);
    const requiredGateCount = result.confirmationGates.filter((gate) => gate.status === 'required').length;
    try {
      const response = await fetch('/api/brand-work', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          surface: 'jarvis-preview',
          brandId: record.brandId,
          sessionId,
          inputMode: voiceTransport === 'realtime' ? 'realtime' : 'text',
          sourcePrompt,
          title: result.experiencePlan?.title ?? result.answer.headline,
          summary: result.answer.answer,
          audience: result.experiencePlan?.audience ?? 'brand_team',
          objective: result.experiencePlan?.objective ?? 'decide',
          approvedSkillId: result.routedSkillId,
          approvedTemplateId: result.experiencePlan?.templateId,
          approvedViewIds: viewIds,
          qbrCompositionPlan: workSpec?.qbrCompositionPlan,
          proofCounts: {
            evidence: result.answer.evidence.length,
            gaps: result.answer.missingEvidence.length,
            gates: requiredGateCount
          },
          reviewState: result.experiencePlan?.humanApproval ?? 'prototype_review_required',
          status: 'review_required',
          resultSnapshot: {
            turnId: result.turnId,
            headline: result.answer.headline,
            templateId: result.experiencePlan?.templateId,
            viewIds,
            evidenceCount: result.answer.evidence.length,
            gateCount: requiredGateCount
          }
        })
      });
      const payload = await response.json() as { record?: BrandWorkShelfRecord };
      if (!response.ok || !payload.record) return;
      setLatestWorkRecordId(payload.record.id);
      setWorkShelfRecords((current) => [payload.record!, ...current.filter((item) => item.id !== payload.record!.id)].slice(0, 8));
    } catch {
      // Work persistence is useful for demo continuity, but it should not block the live Jarvis answer.
    }
  }

  function cancelActiveTurn() {
    activeTurnAbortRef.current?.abort();
    activeTurnAbortRef.current = null;
    fallbackRecognitionRef.current?.abort?.();
    fallbackRecognitionRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setState('idle');
    setStatus('Canceled');
    setVoiceNote('Canceled the active Jarvis turn. Type or start voice when ready.');
    const assistantId = activeAssistantIdRef.current;
    if (assistantId) {
      updateAssistantMessage(assistantId, {
        text: 'Canceled before the answer completed.'
      });
    }
  }

  function handleJarvisEvent(event: JarvisEvent) {
    if (event.type === 'assistant_state') {
      setState(event.state);
      setStatus(event.detail ?? stateLabel(event.state));
      return;
    }
    if (event.type === 'workspace_progress') {
      updateStep(event.step, event.status, event.detail);
      return;
    }
    if (event.type === 'decision_ready') {
      setStatus(event.mode.replaceAll('_', ' '));
      return;
    }
    if (event.type === 'answer_delta') {
      const assistantId = activeAssistantIdRef.current;
      if (!assistantId) return;
      setMessages((current) => current.map((message) => (
        message.id === assistantId ? { ...message, text: `${message.text}${event.text}` } : message
      )));
      return;
    }
    if (event.type === 'assistant_response_ready') {
      setLatestResponse(event.response);
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        updateAssistantMessage(assistantId, {
          text: event.response.writtenAnswer || event.response.answer,
          response: event.response
        });
      }
      return;
    }
    if (event.type === 'approval_required') {
      setStatus('Approval required');
      return;
    }
    if (event.type === 'proof_update') {
      setStatus(`${event.evidenceCount} evidence signals · ${event.gapCount} gaps`);
      return;
    }
    if (event.type === 'error') {
      setState('error');
      setStatus(event.message);
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        updateAssistantMessage(assistantId, {
          text: `I could not complete that preview turn. The stable Assistant is still available at /brand/${record.brandId}/assistant.`
        });
      }
    }
  }

  function handleAgentStreamEvent(event: AgentTurnEvent) {
    setStatus(event.label);
    if (event.type === 'skill_routed') {
      updateStep('plan', 'active', event.detail);
      updateStep('build', 'active', 'Approved skill selected. Preparing view plan.');
    }
    if (event.type === 'experience_planned') {
      updateStep('plan', 'complete', event.detail);
      updateStep('build', 'active', 'Experience plan ready. Opening approved views.');
    }
    if (event.type === 'view_queued') {
      updateStep('build', 'active', event.viewId ? `Opening ${event.viewId.replaceAll('_', ' ')}.` : event.detail);
    }
    if (event.type === 'evidence_spotlight_ready' || event.type === 'answer_ready') {
      updateStep('prove', 'active', event.detail);
    }
    if (event.type === 'guardrail_applied' || event.type === 'review_identity_checked') {
      updateStep('review', 'active', event.detail);
    }
    if (event.type === 'turn_completed') {
      updateStep('build', 'complete', 'Approved modules rendered.');
      updateStep('prove', 'complete', 'Evidence and gaps attached.');
      updateStep('review', 'watch', 'Review gates remain active.');
    }
  }

  async function ask(nextPrompt = prompt, options: { inputMode?: 'text' | 'voice' } = {}): Promise<UnifiedAssistantResponse | null> {
    const question = nextPrompt.trim();
    if (!question || busy) return null;
    const startedAt = Date.now();
    const inputMode = options.inputMode ?? 'text';
    const controller = new AbortController();

    const userMessage: JarvisMessage = { id: uid('user'), role: 'user', text: question };
    const assistantId = uid('assistant');
    const assistantMessage: JarvisMessage = { id: assistantId, role: 'assistant', text: '' };
    let completedResponse: UnifiedAssistantResponse | null = null;
    const history = messages
      .slice(-8)
      .map((message) => ({ role: message.role, text: message.text }));

    activeAssistantIdRef.current = assistantId;
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setPrompt('');
    setLatestResponse(null);
    setTimeline(defaultTimeline);
    setState('thinking');
    setStatus('Initializing brand scan');
    activeTurnAbortRef.current = controller;

    try {
      const response = await fetch('/api/assistant/events', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: record.brandId,
          question,
          sessionId,
          inputMode,
          conversationMode: 'explore',
          activeWorkId,
          conversationHistory: history
        })
      });
      if (!response.ok) throw new Error(`Jarvis event stream failed (${response.status})`);
      await readJarvisEvents(response, (event) => {
        if (event.type === 'assistant_response_ready') {
          completedResponse = event.response;
          recordJarvisTranscript({
            eventType: 'assistant_turn',
            inputMode,
            question,
            assistantText: event.response.writtenAnswer || event.response.answer,
            spokenAnswer: event.response.spokenAnswer,
            intentType: event.response.intent.type,
            intentLabel: event.response.intent.label,
            requiresApproval: event.response.intent.requiresApproval,
            source: event.response.source,
            model: event.response.model,
            grounding: event.response.grounding,
            suggestedNextMoves: event.response.suggestedNextMoves,
            proofCounts: transcriptProofCounts(event.response),
            coverage: event.response.coverageAssessment,
            work: event.response.workSpec ? {
              approvedSkillId: event.response.workSpec.approvedSkillId,
              approvedTemplateId: event.response.workSpec.approvedTemplateId,
              approvedViewIds: event.response.workSpec.approvedViewIds
            } : undefined,
            status: event.response.intent.requiresApproval ? 'approval_needed' : 'answered',
            latencyMs: Date.now() - startedAt
          });
        }
        handleJarvisEvent(event);
      });
      return completedResponse;
    } catch (error) {
      const cancelled = isAbortError(error);
      const detail = error instanceof Error ? error.message : 'Unknown error';
      setState(cancelled ? 'idle' : 'error');
      setStatus(cancelled ? 'Canceled' : detail);
      updateAssistantMessage(assistantId, {
        text: cancelled
          ? 'Canceled before the answer completed.'
          : `I could not complete that preview turn. The stable Assistant is still available at /brand/${record.brandId}/assistant.`
      });
      recordJarvisTranscript({
        eventType: 'error',
        inputMode,
        question,
        status: cancelled ? 'assistant_canceled' : 'assistant_error',
        latencyMs: Date.now() - startedAt,
        error: detail
      });
      return null;
    } finally {
      if (activeTurnAbortRef.current === controller) activeTurnAbortRef.current = null;
    }
  }

  async function approvePreviewWork(responseOverride?: UnifiedAssistantResponse | null): Promise<AgentTurnResult | null> {
    const responseToApprove = responseOverride ?? latestResponse;
    if (!responseToApprove?.workSpec) return null;
    const startedAt = Date.now();
    const controller = new AbortController();
    recordJarvisTranscript({
      eventType: 'work_approval',
      inputMode: voiceTransport === 'realtime' ? 'realtime' : 'text',
      question: responseToApprove.question,
      assistantText: `Building the ${responseToApprove.workSpec.approvedTemplateId.replaceAll('-', ' ')} now.`,
      intentType: responseToApprove.intent.type,
      intentLabel: responseToApprove.intent.label,
      requiresApproval: true,
      source: 'governed_runtime',
      work: {
        approvedSkillId: responseToApprove.workSpec.approvedSkillId,
        approvedTemplateId: responseToApprove.workSpec.approvedTemplateId,
        approvedViewIds: responseToApprove.workSpec.approvedViewIds
      },
      status: 'approved'
    });
    setState('building');
    setStatus('Opening governed build sequence');
    updateStep('plan', 'active', 'Mapping approved skill, template, and view plan.');
    updateStep('build', 'active', 'Approved. Rendering governed views.');
    updateStep('prove', 'active', 'Preparing proof surfaces.');
    activeTurnAbortRef.current = controller;

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: record.brandId,
          question: responseToApprove.question,
          runtimeSurfaceId: 'jarvis-immersive-stream',
          audienceMode: 'insights_lead',
          sessionId: `jarvis-preview-${record.brandId}`,
          preferredSkillId: responseToApprove.workSpec.approvedSkillId,
          preferredExperienceTemplateId: responseToApprove.workSpec.approvedTemplateId
        })
      });
      if (!response.ok || !response.body) throw new Error(`Workspace stream failed (${response.status})`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let result: AgentTurnResult | null = null;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          const eventName = block.split('\n').find((line) => line.startsWith('event: '))?.slice(7).trim();
          const dataLine = block.split('\n').find((line) => line.startsWith('data: '));
          if (!eventName || !dataLine) continue;
          const parsed = JSON.parse(dataLine.slice(6));
          if (eventName === 'turn_result') result = parsed as AgentTurnResult;
          else if (eventName !== 'turn_metadata') handleAgentStreamEvent(parsed as AgentTurnEvent);
        }
      }
      if (!result) throw new Error('missing_workspace_result');
      setWorkResult(result);
      setState('ready');
      setStatus('Workspace online');
      updateStep('build', 'complete', 'Approved modules rendered.');
      updateStep('prove', 'complete', 'Evidence and gaps attached.');
      updateStep('review', 'watch', 'Review gates remain active.');
      recordJarvisTranscript({
        eventType: 'work_result',
        inputMode: voiceTransport === 'realtime' ? 'realtime' : 'text',
        question: responseToApprove.question,
        assistantText: `The governed workspace is ready: ${result.experiencePlan?.title ?? result.answer.headline}.`,
        intentType: responseToApprove.intent.type,
        intentLabel: responseToApprove.intent.label,
        source: 'governed_runtime',
        work: {
          approvedSkillId: result.routedSkillId,
          approvedTemplateId: result.experiencePlan?.templateId,
          approvedViewIds: result.answer.dynamicViewRequests.map((request) => request.viewId),
          workTitle: result.experiencePlan?.title ?? result.answer.headline,
          viewCount: result.answer.dynamicViewRequests.length,
          evidenceCount: result.answer.evidence.length,
          gateCount: result.confirmationGates.filter((gate) => gate.status === 'required').length
        },
        status: 'workspace_ready',
        latencyMs: Date.now() - startedAt
      });
      await recordBrandWork(result, responseToApprove.question, responseToApprove.workSpec);
      return result;
    } catch (error) {
      const cancelled = isAbortError(error);
      const detail = error instanceof Error ? error.message : 'Unknown error';
      setState(cancelled ? 'ready' : 'error');
      setStatus(cancelled ? 'Build canceled' : detail);
      recordJarvisTranscript({
        eventType: 'error',
        inputMode: voiceTransport === 'realtime' ? 'realtime' : 'text',
        question: responseToApprove.question,
        status: cancelled ? 'workspace_canceled' : 'workspace_error',
        latencyMs: Date.now() - startedAt,
        error: detail
      });
      return null;
    } finally {
      if (activeTurnAbortRef.current === controller) activeTurnAbortRef.current = null;
    }
  }

  function stopRealtimeVoice() {
    const session = realtimeSessionRef.current;
    realtimeSessionRef.current = null;
    try {
      session?.close();
    } catch {
      // Realtime sessions can already be closed by transport errors.
    }
    setVoiceTransport('idle');
    setVoiceNote('Voice adapter paused. Type or start voice again.');
    if (state === 'listening' || state === 'speaking') {
      setState('idle');
      setStatus('Preview ready');
    }
  }

  function stopBrowserFallbackVoice(note = 'Browser voice fallback stopped. Type or restart voice when ready.') {
    const recognition = fallbackRecognitionRef.current;
    fallbackRecognitionRef.current = null;
    try {
      recognition?.abort?.();
      recognition?.stop();
    } catch {
      // Browser speech recognizers can already be ended by the time Stop is clicked.
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (voiceTransport === 'fallback') setVoiceTransport('idle');
    if (state === 'listening' || state === 'speaking') setState('idle');
    setStatus('Preview ready');
    setVoiceNote(note);
  }

  function speakBrowserFallback(text: string, options: { onDone?: () => void } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setVoiceNote('Browser voice reply is not available here. The written answer is on screen.');
      options.onDone?.();
      return;
    }
    const speech = cleanSpeechText(text, 520);
    if (!speech) {
      options.onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(speech);
    const preferredVoice = window.speechSynthesis.getVoices().find((voice) => /female|samantha|victoria|zira|google us english/i.test(voice.name))
      ?? window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.1;
    utterance.pitch = 0.96;
    utterance.onstart = () => {
      setState('speaking');
      setStatus('Speaking');
      setVoiceNote('Browser fallback is speaking the short answer. The full answer remains on screen.');
    };
    utterance.onend = () => {
      setState(latestResponseRef.current?.intent.requiresApproval ? 'approval' : 'ready');
      setStatus(latestResponseRef.current?.intent.requiresApproval ? 'Approval needed' : 'Ready');
      setVoiceNote('Browser fallback turn complete. Start voice again or type a follow-up.');
      options.onDone?.();
    };
    utterance.onerror = (event) => {
      const error = 'error' in event ? event.error : 'browser_audio_error';
      if (error === 'canceled' || error === 'interrupted') return;
      setState('ready');
      setStatus('Answer ready');
      setVoiceNote(`Browser voice reply could not play audio (${error}). The written answer is on screen.`);
      options.onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  function startBrowserFallbackVoice(reason?: string) {
    if (busy || fallbackRecognitionRef.current) return;
    const SpeechRecognition = browserSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceTransport('unavailable');
      setState('error');
      setStatus('Voice unavailable');
      setVoiceNote(reason
        ? `Realtime was unavailable (${reason}) and this browser does not expose speech recognition. Type a prompt to use the same Jarvis brain.`
        : 'This browser does not expose speech recognition. Type a prompt to use the same Jarvis brain.');
      return;
    }

    const recognition = new SpeechRecognition();
    fallbackRecognitionRef.current = recognition;
    let transcriptCaptured = false;
    let recognitionFailed = false;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setVoiceTransport('fallback');
      setState('listening');
      setStatus('Listening');
      setVoiceNote(reason
        ? `Realtime had trouble (${reason}). Browser fallback is listening for one Jarvis turn.`
        : 'Browser fallback is listening for one Jarvis turn.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      transcriptCaptured = true;
      fallbackRecognitionRef.current = null;
      setPrompt(transcript);
      setVoiceNote('Captured. Jarvis is deciding whether to answer or ask approval before work.');

      const pending = latestResponseRef.current;
      if (pending?.intent.requiresApproval && isApprovalPhrase(transcript)) {
        setState('building');
        setStatus('Approval captured');
        void approvePreviewWork(pending).then((result) => {
          speakBrowserFallback(result
            ? 'Approved. The governed workspace is ready on screen with proof, gaps, and review gates visible.'
            : 'I could not complete the governed workspace build. The prior answer remains on screen.');
        });
        return;
      }

      void ask(transcript, { inputMode: 'voice' }).then((result) => {
        if (!result) return;
        speakBrowserFallback(result.spokenAnswer || result.answer);
      });
    };
    recognition.onerror = (event) => {
      recognitionFailed = true;
      fallbackRecognitionRef.current = null;
      const detail = event.error ?? 'browser_voice_error';
      setVoiceTransport('unavailable');
      setState('error');
      setStatus('Voice unavailable');
      setVoiceNote(`Browser voice capture failed (${detail}). Type the prompt; the same Jarvis event stream will run.`);
    };
    recognition.onend = () => {
      if (fallbackRecognitionRef.current === recognition) fallbackRecognitionRef.current = null;
      if (!transcriptCaptured && !recognitionFailed) {
        setVoiceTransport('idle');
        setState('idle');
        setStatus('Preview ready');
        setVoiceNote('No voice transcript was captured. Type or start voice again.');
      }
    };
    try {
      recognition.start();
    } catch (error) {
      fallbackRecognitionRef.current = null;
      setVoiceTransport('unavailable');
      setState('error');
      setStatus('Voice unavailable');
      setVoiceNote(`Browser voice capture could not start (${errorMessage(error)}). Type a prompt to use the same Jarvis brain.`);
    }
  }

  async function startRealtimeVoice() {
    if (busy || realtimeSessionRef.current) return;
    setVoiceTransport('checking');
    setVoiceNote('Connecting Realtime Voice to the same Brand Command OS brain.');
    setState('listening');
    setStatus('Connecting voice');

    try {
      if (!window.navigator?.mediaDevices?.getUserMedia) throw new Error('browser_missing_get_user_media');
      const response = await fetch('/api/assistant/realtime/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brandId: record.brandId })
      });
      const tokenData = await response.json();
      if (!response.ok || !tokenData.clientSecret) throw new Error(tokenData.error ?? 'session_unavailable');
      if (tokenData.brandId !== record.brandId) throw new Error('brand_context_changed');

      const assistantTool = tool({
        name: 'answer_or_prepare_brand_work',
        description: 'Evaluate a user brand question or work request through the governed Jarvis event stream before answering.',
        parameters: z.object({
          request: z.string().describe('The user question, follow-up, or work request to evaluate.')
        }),
        execute: async ({ request }) => {
          const result = await ask(request, { inputMode: 'voice' });
          if (!result) {
            return JSON.stringify({
              ok: false,
              spokenAnswer: 'I had trouble reaching the Brand Command OS brain. Please try that again or type it.',
              requiresApproval: false
            });
          }
          return JSON.stringify({
            ok: true,
            spokenAnswer: cleanSpeechText(result.spokenAnswer || result.answer),
            writtenAnswer: result.writtenAnswer,
            requiresApproval: result.intent.requiresApproval,
            decisionType: result.intent.type,
            suggestedNextMoves: result.suggestedNextMoves,
            instruction: result.intent.requiresApproval
              ? 'Ask naturally whether the user wants you to approve and build it. Do not execute until approval.'
              : 'Answer naturally using spokenAnswer. Do not add new claims.'
          });
        }
      });

      const approvalTool = tool({
        name: 'approve_pending_jarvis_work',
        description: 'Approve and run the currently pending governed Jarvis work order after explicit user approval.',
        parameters: z.object({
          confirmation: z.string().describe('The user approval phrase.')
        }),
        execute: async () => {
          const pending = latestResponseRef.current;
          if (!pending?.intent.requiresApproval) {
            return JSON.stringify({
              ok: false,
              spokenAnswer: 'There is no pending governed work order to approve right now.'
            });
          }
          const result = await approvePreviewWork(pending);
          return JSON.stringify({
            ok: Boolean(result),
            spokenAnswer: result
              ? 'The governed workspace is ready on screen. I kept the proof, gaps, and review gates visible.'
              : 'I could not complete the governed workspace build. The conversation answer remains on screen.'
          });
        }
      });

      const agent = new RealtimeAgent({
        name: 'BBE Brand Command OS',
        voice: tokenData.voice,
        instructions: buildJarvisRealtimeInstructions(record),
        tools: [assistantTool, approvalTool]
      });

      const session = new RealtimeSession(agent, {
        transport: 'webrtc',
        model: tokenData.model,
        config: {
          audio: {
            input: {
              transcription: { model: 'gpt-4o-mini-transcribe' },
              turnDetection: { type: 'semantic_vad', eagerness: 'medium', interruptResponse: true }
            },
            output: { voice: tokenData.voice }
          },
          outputModalities: ['audio']
        }
      });

      session.on('audio_start', () => {
        setState('speaking');
        setStatus('Speaking');
        setVoiceNote('Realtime Voice is answering. The written transcript remains the source of truth.');
      });
      session.on('audio_stopped', () => {
        setState('listening');
        setStatus('Listening');
        setVoiceNote('Realtime Voice is listening. Ask naturally, or tell me what to build.');
      });
      session.on('agent_start', () => {
        setStatus('Checking brain');
        setVoiceNote('Realtime heard the turn and is checking the Brand Command OS brain.');
      });
      session.on('agent_end', () => {
        setStatus(latestResponseRef.current?.intent.requiresApproval ? 'Approval needed' : 'Listening');
      });
      session.on('error', (event) => {
        const detail = realtimeFailureRead(event);
        console.warn(`Jarvis realtime session error: ${detail}`);
        stopRealtimeVoice();
        startBrowserFallbackVoice(detail);
      });

      await session.connect({ apiKey: tokenData.clientSecret, model: tokenData.model });
      realtimeSessionRef.current = session;
      setVoiceTransport('realtime');
      setState('listening');
      setStatus('Listening');
      setVoiceNote('Realtime Voice connected. Ask naturally; heavier work still pauses for approval.');
    } catch (error) {
      const detail = realtimeFailureRead(error);
      console.warn(`Jarvis realtime unavailable: ${detail}`);
      stopRealtimeVoice();
      startBrowserFallbackVoice(detail);
    }
  }

  function toggleRealtimeVoice() {
    if (fallbackRecognitionRef.current || voiceTransport === 'fallback') {
      stopBrowserFallbackVoice();
      return;
    }
    if (realtimeSessionRef.current || voiceTransport === 'realtime' || voiceTransport === 'checking') {
      stopRealtimeVoice();
      return;
    }
    void startRealtimeVoice();
  }

  function acceptCommandActivation() {
    const now = Date.now();
    if (now - lastCommandActivationRef.current < 250) return false;
    lastCommandActivationRef.current = now;
    return true;
  }

  function activateVoiceControl(event?: { preventDefault: () => void; stopPropagation: () => void }) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!acceptCommandActivation()) return;
    toggleRealtimeVoice();
  }

  function submitCommand(event?: { preventDefault: () => void; stopPropagation: () => void }) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!acceptCommandActivation()) return;
    void ask();
  }

  const pendingOutput = Boolean(latestResponse?.intent.requiresApproval && !workResult);
  const outputTitle = workResult?.experiencePlan?.title ?? latestResponse?.workSpec?.approvedTemplateId.replaceAll('-', ' ') ?? 'No output selected';
  const outputViewCount = workResult?.answer.dynamicViewRequests.length ?? latestResponse?.workSpec?.approvedViewIds.length ?? 0;
  const latestWorkHref = latestWorkRecordId ? `/brand/${record.brandId}/work/${latestWorkRecordId}` : undefined;
  const stableAssistantHref = activeWorkId
    ? `/brand/${record.brandId}/assistant?workId=${encodeURIComponent(activeWorkId)}`
    : `/brand/${record.brandId}/assistant`;
  const shelfItems: WorkShelfItem[] = useMemo(() => {
    const activeItem: WorkShelfItem | null = state === 'building'
      ? {
          id: 'active-building',
          title: outputTitle === 'No output selected' ? 'Building governed output' : outputTitle,
          status: 'Building',
          kind: 'Active',
          meta: 'Progress is shown in the center.',
          active: true
        }
      : pendingOutput
        ? {
            id: 'active-approval',
            title: outputTitle,
            status: 'Waiting approval',
            kind: 'Pending',
            meta: 'Approve from the center callout.',
            active: true
          }
        : null;

    const records = workShelfRecords.map((item): WorkShelfItem => ({
      id: item.id,
      title: item.title,
      status: item.status.replaceAll('_', ' '),
      kind: compactKind(item),
      meta: `${item.approvedViewIds.length} views · ${item.proofCounts.evidence} proof · ${formatShelfDate(item.updatedAt ?? item.createdAt)}`,
      href: `/brand/${record.brandId}/work/${item.id}`,
      active: item.id === latestWorkRecordId
    }));
    return activeItem ? [activeItem, ...records.filter((item) => item.id !== activeItem.id)].slice(0, 8) : records.slice(0, 8);
  }, [latestWorkRecordId, outputTitle, pendingOutput, record.brandId, state, workShelfRecords]);

  return (
    <main className={`jarvis-page jarvis-immersive jarvis-state-${state}`}>
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar">
        <a className="jarvis-mark" href={`/brand/${record.brandId}`}>
          <Sparkles size={16} />
          <span>Brand Command OS</span>
        </a>
        <nav aria-label="Jarvis navigation">
          <a href="/"><Home size={14} /> Home</a>
          <a href="/brands"><Search size={14} /> Brands</a>
          <a href="/portfolio"><Network size={14} /> Portfolio</a>
          <a href={stableAssistantHref}><MessageSquareText size={14} /> Stable</a>
          <a href={`/brand/${record.brandId}/data`}><Database size={14} /> Data</a>
        </nav>
      </header>

      <section className="jarvis-immersive-stage" aria-label="Immersive Jarvis brand intelligence layer">
        <aside className="jarvis-side-panel jarvis-transcript-panel">
          <div className="jarvis-panel-head">
            <div>
              <span>Live Conversation</span>
              <strong>Transcript</strong>
            </div>
            <em>{record.category} · {record.period}</em>
          </div>
          <div className="jarvis-message-stack" ref={transcriptRef}>
            {messages.length === 0 ? (
              <div className="jarvis-empty-note">
                <strong>Ask the room.</strong>
                <p>The same Brand Doctor brain answers first. If work is needed, the canvas asks for approval before it builds.</p>
              </div>
            ) : messages.map((message) => (
              <article className={message.role} key={message.id}>
                <span>{message.role === 'assistant' ? 'Brand Assistant' : 'You'}</span>
                {message.role === 'assistant'
                  ? message.text
                    ? <MarkdownMessage text={message.text} />
                    : <p className="jarvis-typing">Scanning evidence...</p>
                  : <p>{message.text}</p>}
                {message.response?.suggestedNextMoves.length ? (
                  <div className="jarvis-next-moves">
                    {message.response.suggestedNextMoves.slice(0, 3).map((move) => (
                      <button type="button" key={move} onClick={() => ask(move)} disabled={busy}>{move}</button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </aside>

        <section className="jarvis-core-zone" aria-label="Brand intelligence core">
          <div className="jarvis-brand-lockup">
            <h1>{record.brandName}</h1>
            {activeWorkId ? (
              <p className="jarvis-active-context-chip">
                <Sparkles size={13} /> Asset context active · {activeWorkId.replaceAll('-', ' ')}
              </p>
            ) : null}
          </div>

          <div className={`jarvis-holo-core thought-${thoughtCore.intensity}`}>
            <div className="jarvis-core-ring ring-one" />
            <div className="jarvis-core-ring ring-two" />
            <div className="jarvis-core-ring ring-three" />
            <div className="jarvis-core-scan scan-one" />
            <div className="jarvis-core-scan scan-two" />
            <div className="jarvis-core-grid" />
            <div className="jarvis-core-sigil">
              <Radar size={28} />
            </div>
            {thoughtCore.nodes.length ? (
              <div className="jarvis-thought-nodes">
                {thoughtCore.nodes.slice(0, 6).map((node, index) => (
                  <span className={`jarvis-thought-node node-${index + 1} ${node.status}`} key={node.id}>
                    <i />
                    <em>{node.label}</em>
                  </span>
                ))}
              </div>
            ) : null}

            <section className={`jarvis-thought-panel ${thoughtCore.intensity}`} aria-label="Jarvis current work">
              <span>{thoughtCore.eyebrow}</span>
              <strong>{thoughtCore.phrase}</strong>
              {thoughtCore.detail ? (
                <p>{thoughtCore.detail}</p>
              ) : null}
              {thoughtCore.nodes.length ? (
                <div className="jarvis-thought-trace" aria-hidden="true">
                  {thoughtCore.nodes.slice(0, 6).map((node) => (
                    <b className={node.status} key={node.id} />
                  ))}
                </div>
              ) : null}
            </section>
          </div>

          <div className="jarvis-command-surface">
            <form className="jarvis-command-dock" onSubmit={submitCommand}>
              <button
                className={`jarvis-mic ${micActive ? 'active' : ''}`}
                type="button"
                onPointerDown={activateVoiceControl}
                onMouseDown={activateVoiceControl}
                onClick={activateVoiceControl}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') activateVoiceControl(event);
                }}
                disabled={state === 'thinking' || state === 'building'}
                aria-label={micLabel}
              >
                {voiceTransport === 'realtime' || voiceTransport === 'fallback' ? <MicOff size={18} /> : voiceTransport === 'checking' ? <Waves size={18} /> : <Mic size={18} />}
                <span>{micLabel}</span>
              </button>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitCommand(event);
                }}
                aria-label="Ask Jarvis Preview"
                placeholder={`Ask ${record.brandName} anything`}
                disabled={busy}
              />
              {busy ? (
                <button className="jarvis-cancel" type="button" onClick={cancelActiveTurn} aria-label="Cancel active Jarvis turn">
                  <Square size={16} />
                </button>
              ) : (
                <button
                  className="jarvis-send"
                  type="button"
                  onPointerDown={submitCommand}
                  onMouseDown={submitCommand}
                  onClick={submitCommand}
                  disabled={!prompt.trim()}
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              )}
            </form>
          </div>

          {pendingOutput ? (
            <section className="jarvis-output-callout approval" aria-label="Governed output waiting for approval">
              <div>
                <span>Output Waiting</span>
                <strong>{outputTitle}</strong>
                <p>Approve once and Jarvis will build it with proof and review gates attached.</p>
              </div>
              <button type="button" onClick={() => approvePreviewWork()} disabled={state === 'building'}>
                <Play size={15} />
                Approve & Build
              </button>
            </section>
          ) : null}
          {workResult ? (
            <section className="jarvis-output-callout ready" aria-label="Governed output ready">
              <div>
                <span>Output Ready</span>
                <strong>{outputTitle}</strong>
                <p>{outputViewCount} approved views are ready. Open the workspace when you want the work to take over.</p>
              </div>
              <div>
                {latestWorkHref ? (
                  <a href={latestWorkHref} target="_blank" rel="noreferrer">
                    <ArrowUpRight size={15} />
                    Open Workspace
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="jarvis-side-panel jarvis-work-panel is-quiet">
          <div className="jarvis-panel-head">
            <div>
              <span>Brand Outputs</span>
              <strong>Recent Work</strong>
            </div>
            <a className="jarvis-shelf-all" href={`/brand/${record.brandId}/work`}>All Work <ArrowUpRight size={13} /></a>
          </div>

          <section className="jarvis-output-shelf" aria-label={`${record.brandName} recent governed outputs`}>
            {workShelfLoading ? (
              <div className="jarvis-output-shelf-empty">
                <FileText size={18} />
                <strong>Loading work shelf</strong>
                <p>Recent governed outputs for this brand will appear here.</p>
              </div>
            ) : shelfItems.length ? shelfItems.map((item) => {
              const content = (
                <>
                  <span>{item.kind}</span>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                  <em>{item.status}</em>
                </>
              );
              return item.href ? (
                <a className={`jarvis-output-shelf-item ${item.active ? 'active' : ''}`} href={item.href} key={item.id} target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <div className={`jarvis-output-shelf-item ${item.active ? 'active' : ''}`} key={item.id}>
                  {content}
                </div>
              );
            }) : (
              <div className="jarvis-output-shelf-empty">
                <FileText size={18} />
                <strong>No active output yet</strong>
                <p>When Jarvis builds an executive read, data basis check, treatment recommendation, or brief draft, it will appear here.</p>
              </div>
            )}
          </section>
        </aside>
      </section>

    </main>
  );
}
