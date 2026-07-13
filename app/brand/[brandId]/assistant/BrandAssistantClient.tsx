'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, BadgeCheck, BookOpen, Bot, CheckCircle2, Circle, ClipboardList, Clock3, Database, FileText, Home, ListChecks, Maximize2, MessageSquareText, Mic, Minimize2, Network, Play, Search, Send, ShieldAlert, ShieldCheck, Sparkles, Square, Volume2, VolumeX } from 'lucide-react';
import { z } from 'zod';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import MarkdownMessage from '@/src/components/common/MarkdownMessage';
import DynamicViewRenderer from '@/src/components/intelligence/DynamicViewRenderer';
import type { AgentTurnEvent, AgentTurnResult } from '@/src/lib/intelligence/types';
import type { UnifiedAssistantIntent, UnifiedAssistantResponse } from '@/src/lib/intelligence/unified-assistant';
import type { BrandHealthRecord } from '@/src/types/domain';

type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  intent?: UnifiedAssistantIntent;
  suggestedNextMoves?: string[];
  proofDisclosure?: UnifiedAssistantResponse['proofDisclosure'];
};

type PendingWork = {
  prompt: string;
  intent: UnifiedAssistantIntent;
  workSpec: UnifiedAssistantResponse['workSpec'];
  fromVoice?: boolean;
};

type VoiceTurnState = 'idle' | 'listening' | 'captured' | 'unsupported' | 'error';

type VoiceOutputState = 'checking' | 'ready' | 'speaking' | 'muted' | 'unsupported' | 'error';

type VoiceTransportState = 'checking' | 'realtime' | 'fallback' | 'unavailable';

type WorkStepStatus = 'waiting' | 'active' | 'complete' | 'watch';

type WorkStep = {
  id: string;
  label: string;
  status: WorkStepStatus;
  detail: string;
};

type SpeechOptions = { interrupt?: boolean; force?: boolean; onDone?: () => void };

type AssistantTranscriptInputMode = 'text' | 'voice' | 'realtime' | 'unknown';

type BrandWorkRecordResponse = {
  ok?: boolean;
  record?: {
    id: string;
  };
};

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results?: { [index: number]: { [index: number]: { transcript?: string } } } }) => void) | null;
  onerror: ((event?: { error?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop?: () => void;
  abort?: () => void;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function possessiveBrandName(brandName: string) {
  if (brandName.endsWith("'s")) return brandName;
  if (brandName.endsWith('s')) return `${brandName}'`;
  return `${brandName}'s`;
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

function proofCounts(response: UnifiedAssistantResponse) {
  return {
    evidence: response.proofDisclosure?.evidenceBasis.length ?? 0,
    gaps: response.proofDisclosure?.missingEvidence.length ?? 0,
    guardrails: response.proofDisclosure?.guardrails.length ?? 0
  };
}

function shortStatus(event: AgentTurnEvent) {
  if (event.type === 'packet_ready') return 'Reading packet';
  if (event.type === 'skill_routed') return 'Routing skill';
  if (event.type === 'experience_planned') return 'Planning workspace';
  if (event.type === 'evidence_spotlight_ready') return 'Checking proof';
  if (event.type === 'view_queued') return 'Opening views';
  if (event.type === 'turn_completed') return 'Done';
  return null;
}

function hasEvent(events: AgentTurnEvent[], type: AgentTurnEvent['type']) {
  return events.some((event) => event.type === type);
}

function formatIdLabel(value: string | undefined) {
  return value?.replaceAll(/[-_]/g, ' ') ?? 'not ready';
}

function buildWorkSteps(input: {
  pendingWork: PendingWork | null;
  workResult: AgentTurnResult | null;
  events: AgentTurnEvent[];
  isBuilding: boolean;
}): WorkStep[] {
  const { pendingWork, workResult, events, isBuilding } = input;
  const hasWork = Boolean(pendingWork || workResult || isBuilding || events.length);
  const routed = Boolean(workResult?.routedSkillId || hasEvent(events, 'skill_routed'));
  const planned = Boolean(workResult?.experiencePlan || hasEvent(events, 'experience_planned'));
  const rendered = Boolean(workResult?.answer.dynamicViewRequests.length || hasEvent(events, 'view_queued'));
  const proved = Boolean(workResult?.evidenceSpotlight.length || hasEvent(events, 'evidence_spotlight_ready'));
  const reviewed = Boolean(workResult);

  return [
    {
      id: 'scope',
      label: 'Scope',
      status: hasWork ? 'complete' : 'waiting',
      detail: pendingWork?.workSpec?.objective ?? workResult?.experiencePlan?.objective ?? 'Waiting for a governed work request.'
    },
    {
      id: 'route',
      label: 'Route',
      status: routed ? 'complete' : isBuilding ? 'active' : hasWork ? 'waiting' : 'waiting',
      detail: routed ? `${formatIdLabel(workResult?.routedSkillId ?? events.find((event) => event.type === 'skill_routed')?.skillId)} selected.` : 'Select an approved skill.'
    },
    {
      id: 'plan',
      label: 'Plan',
      status: planned ? 'complete' : routed || isBuilding ? 'active' : 'waiting',
      detail: planned ? `${formatIdLabel(workResult?.experiencePlan?.templateId)} workspace assembled.` : 'Compose approved views and evidence needs.'
    },
    {
      id: 'render',
      label: 'Render',
      status: rendered && workResult ? 'complete' : rendered || isBuilding ? 'active' : 'waiting',
      detail: workResult ? `${workResult.answer.dynamicViewRequests.length} approved views ready.` : rendered ? 'Opening approved views.' : 'Show the work on the canvas.'
    },
    {
      id: 'prove',
      label: 'Prove',
      status: proved && workResult ? 'complete' : proved || isBuilding ? 'active' : 'waiting',
      detail: workResult ? `${workResult.answer.evidence.length} evidence refs, ${workResult.answer.missingEvidence.length} gaps, ${workResult.answer.guardrailsApplied.length} guardrails.` : 'Attach evidence, gaps, and guardrails.'
    },
    {
      id: 'review',
      label: 'Review',
      status: reviewed ? (workResult?.confirmationGates.some((gate) => gate.status === 'required') ? 'watch' : 'complete') : 'waiting',
      detail: reviewed ? 'Ready for follow-up questions; export and official approval remain gated.' : 'Keep human review before anything final.'
    }
  ];
}

function activeWorkspaceContext(result: AgentTurnResult | null) {
  if (!result) return null;
  const viewLabels = result.answer.dynamicViewRequests
    .slice(0, 5)
    .map((request) => request.viewId.replaceAll('_', ' '))
    .join(', ');
  return [
    `Active governed workspace: ${result.experiencePlan?.title ?? result.answer.headline}.`,
    `Skill: ${result.routedSkillId.replaceAll('_', ' ')}.`,
    viewLabels ? `Visible work views: ${viewLabels}.` : null,
    `Workspace headline: ${result.answer.headline}.`
  ].filter(Boolean).join(' ');
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

function buildAssistantRealtimeInstructions(record: BrandHealthRecord) {
  return [
    `You are the realtime voice interface for BBE Brand Assistant on ${record.brandName}.`,
    `The active brand is ${record.brandName} (${record.brandId}) in ${record.category}. Stay scoped to this brand unless the user explicitly asks for comparison.`,
    'Your job is brand equity diagnosis, evidence explanation, momentum interpretation, treatment recommendations to consider, learning support, and governed workspace/report/proof planning for the active brand.',
    'You are not a general marketing, media, creative, pricing, sales, finance, or enterprise automation agent. If asked what you do, describe this bounded Brand Assistant scope.',
    'For every user request, including questions about who you are or what you can do, give one brief acknowledgement if needed, then call answer_or_prepare_brand_work before answering.',
    'The tool result is the source of truth. Use its spokenAnswer for the voice answer and do not add unsupported facts, metrics, diagnoses, treatments, source truth, approvals, or governance permissions.',
    'If the tool says requiresApproval is true, ask naturally whether the user wants to approve the governed work. Do not run the work until the user explicitly approves.',
    'If the user approves pending work, call approve_pending_brand_work.',
    'Speak like a sharp, warm senior brand strategist. Be fast, conversational, and concise. Do not narrate backend steps unless the user asks what is happening.',
    'Guardrails: no causality without causal evidence, no SKU-level pricing advice, no cannibalization or occasion-substitution claims as facts, no official approval/export/source writes/production certification.'
  ].join('\n');
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function BrandAssistantClient({ record, activeWorkId }: { record: BrandHealthRecord; activeWorkId?: string }) {
  const possessiveName = possessiveBrandName(record.brandName);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [pendingWork, setPendingWork] = useState<PendingWork | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [workResult, setWorkResult] = useState<AgentTurnResult | null>(null);
  const [events, setEvents] = useState<AgentTurnEvent[]>([]);
  const [isWorkFocus, setIsWorkFocus] = useState(true);
  const [isWorkFullscreen, setIsWorkFullscreen] = useState(false);
  const [latestWorkRecordId, setLatestWorkRecordId] = useState<string | null>(activeWorkId ?? null);
  const [voiceTurnState, setVoiceTurnState] = useState<VoiceTurnState>('idle');
  const [voiceOutputState, setVoiceOutputState] = useState<VoiceOutputState>('checking');
  const [voiceTransportState, setVoiceTransportState] = useState<VoiceTransportState>('checking');
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [handsFreeEnabled, setHandsFreeEnabled] = useState(false);
  const [browserSpeechSupported, setBrowserSpeechSupported] = useState<boolean | null>(null);
  const [voiceNote, setVoiceNote] = useState(activeWorkId
    ? 'Asset context is active. Ask about this read, proof, revisions, or next handoff.'
    : 'Turn the Voice Agent on or type. I will answer directly first, then ask approval before building heavier work.');
  const sessionIdRef = useRef(`brand-assistant-${record.brandId}-${Date.now().toString(36)}`);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRequestIdRef = useRef(0);
  const activeVoiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const realtimeSessionRef = useRef<RealtimeSession | null>(null);
  const handsFreeEnabledRef = useRef(false);
  const followUpRestartTimerRef = useRef<number | null>(null);
  const messagesRef = useRef(messages);
  const pendingWorkRef = useRef<PendingWork | null>(null);
  const workResultRef = useRef<AgentTurnResult | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  function clearFollowUpRestart() {
    if (followUpRestartTimerRef.current !== null) {
      window.clearTimeout(followUpRestartTimerRef.current);
      followUpRestartTimerRef.current = null;
    }
  }

  function stopActiveVoiceRecognition() {
    const recognition = activeVoiceRecognitionRef.current;
    activeVoiceRecognitionRef.current = null;
    try {
      recognition?.abort?.();
      recognition?.stop?.();
    } catch {
      // Browser speech recognition can throw after it has already ended.
    }
  }

  function stopRealtimeSession() {
    const session = realtimeSessionRef.current;
    realtimeSessionRef.current = null;
    try {
      session?.close();
    } catch {
      // Realtime sessions can already be closed by transport errors.
    }
  }

  function recordTranscript(payload: Record<string, unknown>) {
    void fetch('/api/assistant/transcript', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        surface: 'brand-assistant',
        brandId: record.brandId,
        sessionId: sessionIdRef.current,
        ...payload
      })
    }).catch((error) => {
      console.warn(`Assistant transcript store failed: ${errorMessage(error)}`);
    });
  }

  function recordBrandWork(
    result: AgentTurnResult,
    sourcePrompt: string,
    inputMode: AssistantTranscriptInputMode,
    workSpec?: UnifiedAssistantResponse['workSpec']
  ) {
    const viewIds = result.answer.dynamicViewRequests.map((request) => request.viewId);
    const requiredGateCount = result.confirmationGates.filter((gate) => gate.status === 'required').length;
    void fetch('/api/brand-work', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        surface: 'brand-assistant',
        brandId: record.brandId,
        sessionId: sessionIdRef.current,
        inputMode,
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
    })
      .then(async (response) => {
        const payload = await response.json() as BrandWorkRecordResponse;
        if (response.ok && payload.record?.id) setLatestWorkRecordId(payload.record.id);
      })
      .catch((error) => {
        console.warn(`Brand work store failed: ${errorMessage(error)}`);
      });
  }

  function scheduleFollowUpListen(delayMs = 750) {
    clearFollowUpRestart();
    if (!handsFreeEnabledRef.current) return;
    followUpRestartTimerRef.current = window.setTimeout(() => {
      followUpRestartTimerRef.current = null;
      startVoicePrompt({ followUp: true });
    }, delayMs);
  }

  function speakWithBrowserVoice(text: string, options: SpeechOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setVoiceOutputState('unsupported');
      options.onDone?.();
      return;
    }
    if (!voiceReplyEnabled && !options.force) {
      setVoiceOutputState('muted');
      options.onDone?.();
      return;
    }
    const speech = cleanSpeechText(text);
    if (!speech) {
      options.onDone?.();
      return;
    }
    if (options.interrupt) window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(speech);
    const preferredVoice = window.speechSynthesis.getVoices().find((voice) => /female|samantha|victoria|zira|google us english/i.test(voice.name))
      ?? window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.1;
    utterance.pitch = 0.96;
    utterance.onstart = () => setVoiceOutputState('speaking');
    utterance.onend = () => {
      setVoiceOutputState(voiceReplyEnabled ? 'ready' : 'muted');
      options.onDone?.();
    };
    utterance.onerror = (event) => {
      const error = 'error' in event ? event.error : 'browser_audio_error';
      if (error === 'canceled' || error === 'interrupted') {
        setVoiceOutputState(voiceReplyEnabled ? 'ready' : 'muted');
        return;
      }
      setVoiceOutputState('error');
      setVoiceNote(`Browser voice reply could not play audio (${error}). Type and visual progress still work.`);
      options.onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }

  async function speakAssistant(text: string, options: SpeechOptions = {}) {
    if (!voiceReplyEnabled && !options.force) {
      setVoiceOutputState('muted');
      options.onDone?.();
      return;
    }
    const speech = cleanSpeechText(text);
    if (!speech) {
      options.onDone?.();
      return;
    }
    const requestId = voiceRequestIdRef.current + 1;
    voiceRequestIdRef.current = requestId;

    if (options.interrupt) {
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    setVoiceOutputState('speaking');
    try {
      const response = await fetch('/api/agent/voice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: speech })
      });
      if (!response.ok) throw new Error(`openai_tts_${response.status}`);
      const blob = await response.blob();
      if (voiceRequestIdRef.current !== requestId) return;
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudioRef.current === audio) activeAudioRef.current = null;
        setVoiceOutputState(voiceReplyEnabled ? 'ready' : 'muted');
        options.onDone?.();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        if (activeAudioRef.current === audio) activeAudioRef.current = null;
        if (voiceRequestIdRef.current !== requestId) return;
        speakWithBrowserVoice(speech, options);
      };
      await audio.play();
      setVoiceNote('Voice reply is speaking. The written answer and work canvas remain the source of truth.');
    } catch (error) {
      if (voiceRequestIdRef.current !== requestId) return;
      const detail = error instanceof Error ? error.message : 'browser_audio_blocked';
      setVoiceNote(`OpenAI voice reply fell back to browser voice (${detail}).`);
      speakWithBrowserVoice(speech, options);
    }
  }

  function toggleVoiceReply() {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      setVoiceReplyEnabled(false);
      setVoiceOutputState('unsupported');
      setVoiceNote('Voice reply audio playback is not available here. Talk/type input and visual progress still work.');
      return;
    }
    setVoiceReplyEnabled((current) => {
      const next = !current;
      if (!next) {
        activeAudioRef.current?.pause();
        activeAudioRef.current = null;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setVoiceOutputState('muted');
        setVoiceNote('Voice reply muted. Talk/type input and visual progress remain active.');
      } else {
        setVoiceOutputState('ready');
        setVoiceNote('Voice reply enabled. I will speak answers, approval moments, and short work summaries.');
        speakAssistant('Voice reply is on. Ask naturally, and I will answer or ask permission before building heavier work.', { force: true, interrupt: true });
      }
      return next;
    });
  }

  function pauseVoiceAgent() {
    clearFollowUpRestart();
    stopActiveVoiceRecognition();
    stopRealtimeSession();
    handsFreeEnabledRef.current = false;
    setHandsFreeEnabled(false);
    setVoiceTurnState('idle');
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoiceOutputState(voiceReplyEnabled ? 'ready' : 'muted');
    setVoiceNote(isThinking || isBuilding
      ? 'Voice Agent paused. The current work may still finish visually, but listening and audio are stopped.'
      : 'Voice Agent paused. Type or start voice again when you want the next turn.');
    if (!isThinking && !isBuilding) setStatus('Ready');
  }

  function startFallbackVoiceAgent(reason?: string) {
    setVoiceTransportState(reason ? 'fallback' : 'checking');
    setHandsFreeEnabled(true);
    handsFreeEnabledRef.current = true;
    setVoiceNote(reason
      ? `Realtime voice is unavailable (${reason}). I switched to the browser speech plus voice-reply fallback.`
      : 'Voice fallback is on. I will listen in turns and answer through the same assistant brain.');
    speakAssistant(`Voice fallback is on for ${record.brandName}. Ask me a question, or tell me what you want to build.`, {
      force: true,
      interrupt: true,
      onDone: () => startVoicePrompt({ followUp: true })
    });
  }

  async function startRealtimeVoiceAgent() {
    if (isThinking || isBuilding) return;
    if (pendingWorkRef.current) {
      setVoiceNote('Approve or dismiss the pending work order before starting the Voice Agent again.');
      return;
    }
    setHandsFreeEnabled(true);
    handsFreeEnabledRef.current = true;
    setVoiceTurnState('idle');
    setStatus('Connecting voice');
    setVoiceOutputState('ready');
    setVoiceTransportState('checking');
    setVoiceNote('Connecting the Realtime Voice Agent. It will use the same assistant brain before answering.');

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
        description: 'Evaluate a user brand question or work request through the governed Brand Assistant brain before answering.',
        parameters: z.object({
          request: z.string().describe('The user question, follow-up, or work request to evaluate.')
        }),
        execute: async ({ request }) => {
          const result = await ask(request, { fromVoice: true, nativeRealtime: true });
          if (!result) {
            return JSON.stringify({
              ok: false,
              spokenAnswer: 'I had trouble reaching the Brand Assistant brain. Please try that again or type it.',
              requiresApproval: false
            });
          }
          return JSON.stringify({
            ok: true,
            spokenAnswer: cleanSpeechText(result.spokenAnswer),
            writtenAnswer: result.writtenAnswer,
            requiresApproval: result.intent.requiresApproval,
            decisionType: result.intent.type,
            suggestedNextMoves: result.suggestedNextMoves,
            instruction: result.intent.requiresApproval
              ? 'Ask naturally whether the user wants you to create it. Do not say "workspace ask."'
              : 'Answer naturally using spokenAnswer. Do not add new claims.'
          });
        }
      });

      const approvalTool = tool({
        name: 'approve_pending_brand_work',
        description: 'Approve and run the currently pending governed Brand Assistant work order after explicit user approval.',
        parameters: z.object({
          confirmation: z.string().describe('The user approval phrase.')
        }),
        execute: async ({ confirmation }) => {
          const work = pendingWorkRef.current;
          if (!work) {
            return JSON.stringify({
              ok: false,
              spokenAnswer: 'There is no pending governed work order to approve right now.'
            });
          }
          await approveWork(work, { nativeRealtime: true, confirmation });
          return JSON.stringify({
            ok: true,
            spokenAnswer: 'The governed workspace is ready on screen. I kept the proof, gaps, and review gates visible.'
          });
        }
      });

      const agent = new RealtimeAgent({
        name: 'BBE Brand Assistant',
        voice: tokenData.voice,
        instructions: buildAssistantRealtimeInstructions(record),
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
        setVoiceOutputState('speaking');
        setStatus('Speaking');
        setVoiceNote('Realtime Voice Agent is speaking.');
      });
      session.on('audio_stopped', () => {
        setVoiceOutputState('ready');
        setVoiceTurnState('listening');
        setStatus('Listening');
        setVoiceNote('Realtime Voice Agent is listening. Ask naturally.');
      });
      session.on('agent_start', () => {
        setVoiceTurnState('captured');
        setStatus('Thinking');
        setVoiceNote('Realtime Voice Agent is checking the assistant brain.');
      });
      session.on('agent_end', () => {
        setVoiceTurnState('listening');
        setStatus(pendingWorkRef.current ? 'Approval needed' : 'Listening');
      });
      session.on('error', (event) => {
        const detail = realtimeFailureRead(event);
        console.warn(`Assistant realtime session error: ${detail}`);
        setVoiceTurnState('error');
        setVoiceTransportState('fallback');
        setStatus('Voice fallback');
        setVoiceNote(`Realtime had trouble: ${detail}. Use typed input or restart voice fallback.`);
      });

      await session.connect({ apiKey: tokenData.clientSecret, model: tokenData.model });
      realtimeSessionRef.current = session;
      setVoiceTransportState('realtime');
      setVoiceTurnState('listening');
      setStatus('Listening');
      setVoiceNote('Realtime Voice Agent connected. Ask naturally; direct answers stay conversational and heavier work still asks approval.');
    } catch (error) {
      const detail = realtimeFailureRead(error);
      console.warn(`Assistant realtime fallback: ${detail}`);
      stopRealtimeSession();
      startFallbackVoiceAgent(detail);
    }
  }

  function toggleVoiceAgent() {
    if (handsFreeEnabled || realtimeSessionRef.current) {
      pauseVoiceAgent();
      return;
    }
    startRealtimeVoiceAgent();
  }

  function startVoicePrompt(options: { followUp?: boolean } = {}) {
    if (isThinking || isBuilding || activeVoiceRecognitionRef.current || pendingWork) {
      if (pendingWork) setVoiceNote('Approve or dismiss the pending work order before opening another listening turn.');
      return;
    }
    clearFollowUpRestart();
    const SpeechRecognition = (window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).SpeechRecognition ?? (window as unknown as {
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceTurnState('unsupported');
      setBrowserSpeechSupported(false);
      setVoiceNote('Browser voice capture is not available in this session. Type a prompt; the same assistant brain and governed work path will run.');
      return;
    }

    setBrowserSpeechSupported(true);
    const recognition = new SpeechRecognition();
    activeVoiceRecognitionRef.current = recognition;
    let transcriptCaptured = false;
    let recognitionFailed = false;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setVoiceTurnState('listening');
      setStatus('Listening');
      setVoiceNote(options.followUp
        ? 'Voice Agent is listening for the next turn in this same brand conversation.'
        : 'Listening. Ask a direct question or request a workspace.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      transcriptCaptured = true;
      activeVoiceRecognitionRef.current = null;
      setVoiceTurnState('captured');
      setPrompt(transcript);
      setVoiceNote('Captured. I will evaluate whether this is a quick answer or heavier governed work.');
      ask(transcript, { fromVoice: true });
    };
    recognition.onerror = (event) => {
      recognitionFailed = true;
      activeVoiceRecognitionRef.current = null;
      const error = event?.error ?? 'unknown';
      if (options.followUp && handsFreeEnabledRef.current && error === 'no-speech') {
        setVoiceTurnState('idle');
        setStatus('Ready');
        setVoiceNote('Voice Agent is still on, but I did not catch that turn yet. Try again or type the prompt.');
        scheduleFollowUpListen(700);
        return;
      }
      setVoiceTurnState('error');
      if (error === 'not-allowed' || error === 'service-not-allowed') setBrowserSpeechSupported(false);
      setStatus('Voice unavailable');
      setVoiceNote(`Voice capture failed (${error}). Type the prompt; the same request evaluation will run.`);
    };
    recognition.onend = () => {
      if (activeVoiceRecognitionRef.current === recognition) activeVoiceRecognitionRef.current = null;
      if (!transcriptCaptured && !recognitionFailed) {
          setVoiceTurnState('idle');
          setStatus('Ready');
        if (options.followUp && handsFreeEnabledRef.current) {
          setVoiceNote('Voice Agent is still on, but no transcript was captured. I will reopen listening.');
          scheduleFollowUpListen(700);
        } else {
          setVoiceNote('No voice transcript was captured. Type or start the Voice Agent again.');
        }
      }
    };
    try {
      recognition.start();
    } catch {
      activeVoiceRecognitionRef.current = null;
      setVoiceTurnState('error');
      setVoiceNote('Voice capture could not start. Type a prompt and I will use the same assistant path.');
    }
  }

  useEffect(() => {
    handsFreeEnabledRef.current = handsFreeEnabled;
  }, [handsFreeEnabled]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    pendingWorkRef.current = pendingWork;
  }, [pendingWork]);

  useEffect(() => {
    workResultRef.current = workResult;
  }, [workResult]);

  useEffect(() => {
    const SpeechRecognition = (window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).SpeechRecognition ?? (window as unknown as {
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).webkitSpeechRecognition;
    setBrowserSpeechSupported(Boolean(SpeechRecognition));
    if (!SpeechRecognition) setVoiceTurnState('unsupported');
    const supportedAudio = typeof Audio !== 'undefined';
    setVoiceOutputState(supportedAudio ? 'ready' : 'unsupported');
    if (!supportedAudio) setVoiceReplyEnabled(false);
    return () => {
      clearFollowUpRestart();
      stopActiveVoiceRecognition();
      stopRealtimeSession();
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  async function ask(nextPrompt = prompt, options: { fromVoice?: boolean; nativeRealtime?: boolean } = {}): Promise<UnifiedAssistantResponse | null> {
    const trimmed = nextPrompt.trim();
    if (!trimmed || isThinking || isBuilding) return null;
    const startedAt = Date.now();
    const inputMode: AssistantTranscriptInputMode = options.nativeRealtime ? 'realtime' : options.fromVoice ? 'voice' : 'text';
    const activeWorkContext = activeWorkspaceContext(workResultRef.current);
    const conversationHistory = [
      ...messagesRef.current
      .filter((message) => message.id !== 'welcome')
      .slice(-8)
      .map((message) => ({ role: message.role, text: message.text })),
      ...(activeWorkContext ? [{ role: 'assistant' as const, text: activeWorkContext }] : [])
    ];
    setPrompt('');
    setPendingWork(null);
    pendingWorkRef.current = null;
    setIsThinking(true);
    setStatus('Let me look into that');
    const shouldSpeak = Boolean(options.fromVoice) && !options.nativeRealtime;
    setVoiceNote(options.fromVoice
      ? options.nativeRealtime
        ? 'Realtime heard the request. I am checking the same assistant brain before answering.'
        : 'Voice turn captured. I am deciding whether this is a direct answer or governed work.'
      : 'Text mode is quiet. I am deciding whether this is a direct answer or governed work.');
    if (shouldSpeak) speakAssistant('Let me look into that.', { interrupt: true });
    setMessages((current) => [...current, { id: uid('user'), role: 'user', text: trimmed }]);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          brandId: record.brandId,
          question: trimmed,
          personaId: 'brand_doctor',
          conversationMode: 'explore',
          activeWorkId,
          conversationHistory
        })
      });
      const data = await response.json() as UnifiedAssistantResponse;
      if (!response.ok || !data.ok) throw new Error('assistant_unavailable');
      setMessages((current) => [...current, {
        id: uid('assistant'),
        role: 'assistant',
        text: data.writtenAnswer ?? data.answer,
        source: data.source,
        intent: data.intent,
        suggestedNextMoves: data.suggestedNextMoves,
        proofDisclosure: data.proofDisclosure
      }]);
      recordTranscript({
        eventType: 'assistant_turn',
        inputMode,
        question: trimmed,
        assistantText: data.writtenAnswer ?? data.answer,
        spokenAnswer: data.spokenAnswer,
        intentType: data.intent.type,
        intentLabel: data.intent.label,
        requiresApproval: data.intent.requiresApproval,
        source: data.source,
        model: data.model,
        grounding: data.grounding,
        suggestedNextMoves: data.suggestedNextMoves,
        proofCounts: proofCounts(data),
        coverage: data.coverageAssessment,
        work: data.workSpec ? {
          approvedSkillId: data.workSpec.approvedSkillId,
          approvedTemplateId: data.workSpec.approvedTemplateId,
          approvedViewIds: data.workSpec.approvedViewIds
        } : undefined,
        status: data.intent.requiresApproval ? 'approval_needed' : 'answered',
        latencyMs: Date.now() - startedAt
      });
      setStatus(data.intent.type === 'approval_work_order' ? 'Approval needed' : 'Ready');
      if (data.intent.requiresApproval) {
        const nextPendingWork = { prompt: trimmed, intent: data.intent, workSpec: data.workSpec, fromVoice: Boolean(options.fromVoice) };
        setPendingWork(nextPendingWork);
        pendingWorkRef.current = nextPendingWork;
      }
      setVoiceNote(options.fromVoice
        ? data.intent.requiresApproval
          ? 'This is heavier work. I paused for approval before opening governed views.'
          : 'Answered directly. Ask a follow-up or request a workspace when you want deeper work.'
        : data.intent.requiresApproval
          ? 'Text answer ready. I paused for approval before opening governed views.'
          : 'Text answer ready. Voice stays off unless you start the Voice Agent.');
      const spoken = data.spokenAnswer || (data.intent.requiresApproval
        ? `I can build that with proof, gaps, and review notes visible. Want me to create it?`
        : data.answer);
      if (shouldSpeak) {
        speakAssistant(spoken, {
          interrupt: true,
          onDone: () => {
            if (!data.intent.requiresApproval) scheduleFollowUpListen();
          }
        });
      }
      return data;
    } catch (error) {
      setMessages((current) => [...current, {
        id: uid('assistant-error'),
        role: 'assistant',
        text: 'I could not reach the assistant brain. The stable report, data view, and Agent Lab workbench are still available.'
      }]);
      recordTranscript({
        eventType: 'error',
        inputMode,
        question: trimmed,
        status: 'assistant_error',
        latencyMs: Date.now() - startedAt,
        error: errorMessage(error)
      });
      setStatus('Error');
      setVoiceNote('The assistant brain could not be reached. Type, report, data view, and Agent Lab are still available.');
      return null;
    } finally {
      setIsThinking(false);
    }
  }

  async function approveWork(workOverride?: PendingWork | null, options: { nativeRealtime?: boolean; confirmation?: string } = {}) {
    const workToApprove = workOverride ?? pendingWork;
    if (!workToApprove || isBuilding) return;
    const startedAt = Date.now();
    const inputMode: AssistantTranscriptInputMode = options.nativeRealtime ? 'realtime' : workToApprove.fromVoice ? 'voice' : 'text';
    const shouldSpeak = !options.nativeRealtime && Boolean(workToApprove.fromVoice || handsFreeEnabledRef.current);
    setIsBuilding(true);
    setEvents([]);
    setStatus('Building governed workspace');
    setVoiceNote('Approved. I am building the governed workspace and keeping proof, gaps, and gates visible.');
    setMessages((current) => [...current, {
      id: uid('assistant-approved'),
      role: 'assistant',
      text: `Building the ${workToApprove.intent.suggestedTemplateId.replaceAll('-', ' ')} now. I am assembling the approved views, proof, gaps, and review gates.`,
      source: 'governed_runtime'
    }]);
    recordTranscript({
      eventType: 'work_approval',
      inputMode,
      question: workToApprove.prompt,
      assistantText: `Building the ${workToApprove.intent.suggestedTemplateId.replaceAll('-', ' ')} now.`,
      intentType: workToApprove.intent.type,
      intentLabel: workToApprove.intent.label,
      requiresApproval: true,
      source: 'governed_runtime',
      work: workToApprove.workSpec ? {
        approvedSkillId: workToApprove.workSpec.approvedSkillId,
        approvedTemplateId: workToApprove.workSpec.approvedTemplateId,
        approvedViewIds: workToApprove.workSpec.approvedViewIds
      } : undefined,
      status: 'approved'
    });
    if (shouldSpeak) {
      speakAssistant('Approved. I am assembling the approved views, proof, gaps, and review gates now.', { interrupt: true });
    }

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          brandId: record.brandId,
          question: workToApprove.prompt,
          runtimeSurfaceId: 'api-agent-stream',
          audienceMode: 'insights_lead',
          sessionId: sessionIdRef.current
        })
      });
      if (!response.ok || !response.body) throw new Error('stream_unavailable');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: AgentTurnResult | null = null;
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
          if (eventName === 'turn_result') finalResult = parsed as AgentTurnResult;
          else if (eventName !== 'turn_metadata') {
            const event = parsed as AgentTurnEvent;
            setEvents((current) => [...current, event]);
            const nextStatus = shortStatus(event);
            if (nextStatus) setStatus(nextStatus);
          }
        }
      }
      if (!finalResult) throw new Error('missing_final_result');
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1800) {
        setStatus('Checking proof');
        setVoiceNote('The runtime returned quickly. I am holding the canvas for a moment to check proof, gaps, and review gates before showing the workspace.');
        await wait(1800 - elapsed);
      }
      setWorkResult(finalResult);
      setStatus('Workspace ready');
      setPendingWork(null);
      pendingWorkRef.current = null;
      setVoiceNote('Workspace ready. You can continue the conversation or ask for a related next step.');
      setMessages((current) => [...current, {
        id: uid('assistant-work-ready'),
        role: 'assistant',
        text: `The governed workspace is ready: ${finalResult.experiencePlan?.title ?? finalResult.answer.headline}.`,
        source: 'governed_runtime'
      }]);
      recordTranscript({
        eventType: 'work_result',
        inputMode,
        question: workToApprove.prompt,
        assistantText: `The governed workspace is ready: ${finalResult.experiencePlan?.title ?? finalResult.answer.headline}.`,
        intentType: workToApprove.intent.type,
        intentLabel: workToApprove.intent.label,
        source: 'governed_runtime',
        work: {
          approvedSkillId: finalResult.routedSkillId,
          approvedTemplateId: finalResult.experiencePlan?.templateId,
          approvedViewIds: finalResult.answer.dynamicViewRequests.map((request) => request.viewId),
          workTitle: finalResult.experiencePlan?.title ?? finalResult.answer.headline,
          viewCount: finalResult.answer.dynamicViewRequests.length,
          evidenceCount: finalResult.answer.evidence.length,
          gateCount: finalResult.confirmationGates.filter((gate) => gate.status === 'required').length
        },
        status: 'workspace_ready',
        latencyMs: Date.now() - startedAt
      });
      recordBrandWork(finalResult, workToApprove.prompt, inputMode, workToApprove.workSpec);
      if (shouldSpeak) {
        speakAssistant(`The governed workspace is ready. ${finalResult.experiencePlan?.title ?? finalResult.answer.headline}.`, {
          interrupt: true,
          onDone: () => scheduleFollowUpListen()
        });
      }
    } catch (error) {
      setStatus('Workspace failed');
      setVoiceNote('The governed workspace did not finish. The conversation answer remains available.');
      setMessages((current) => [...current, {
        id: uid('assistant-work-error'),
        role: 'assistant',
        text: 'The governed workspace did not finish. The conversation answer remains available, and the Agent Lab workbench can inspect the runtime path.'
      }]);
      recordTranscript({
        eventType: 'error',
        inputMode,
        question: workToApprove.prompt,
        status: 'workspace_error',
        latencyMs: Date.now() - startedAt,
        error: errorMessage(error)
      });
    } finally {
      setIsBuilding(false);
    }
  }

  const visibleViews = workResult?.answer.dynamicViewRequests.slice(0, 5) ?? [];
  const workSteps = buildWorkSteps({ pendingWork, workResult, events, isBuilding });
  const workspaceTitle = workResult?.experiencePlan?.title ?? pendingWork?.intent.suggestedTemplateId.replaceAll('-', ' ') ?? 'No workspace yet';
  const latestWorkHref = latestWorkRecordId ? `/brand/${record.brandId}/work/${latestWorkRecordId}` : undefined;
  const workspaceStats = workResult ? [
    { label: 'Views', value: String(workResult.answer.dynamicViewRequests.length), detail: 'approved modules' },
    { label: 'Proof', value: String(workResult.answer.evidence.length), detail: 'evidence refs' },
    { label: 'Gaps', value: String(workResult.answer.missingEvidence.length), detail: 'visible caveats' },
    { label: 'Gates', value: String(workResult.confirmationGates.filter((gate) => gate.status === 'required').length), detail: 'review checks' }
  ] : [];
  const workspaceFollowUps = workResult ? [
    'Explain the workspace on the right in plain English.',
    'What should I tell the CMO from this workspace?',
    'Which proof should I trust most here?',
    'What should we build next from this?'
  ] : [];
  const activityState = pendingWork
    ? 'approval'
    : isBuilding
      ? 'building'
      : isThinking
        ? 'thinking'
        : voiceTurnState === 'listening'
          ? 'listening'
          : voiceOutputState === 'speaking'
            ? 'speaking'
            : handsFreeEnabled
              ? 'active'
              : 'idle';
  const activityDetail = activityState === 'approval'
    ? 'The agent detected heavier work and paused before opening approved views.'
    : activityState === 'building'
      ? 'The governed runtime is assembling evidence, views, gaps, and review gates.'
      : activityState === 'thinking'
        ? 'The assistant is evaluating direct answer versus orchestrated work.'
        : activityState === 'listening'
          ? 'Ask naturally. The next captured turn will stay in this brand session.'
          : activityState === 'speaking'
            ? 'Audio reply is playing. The written answer remains visible.'
            : activityState === 'active'
              ? 'Voice Agent will reopen listening after replies.'
              : 'Start voice or type a prompt.';
  const voiceAgentLabel = browserSpeechSupported === false
    ? 'Type Instead'
    : handsFreeEnabled && voiceTurnState === 'listening'
      ? 'Listening'
      : voiceTurnState === 'captured'
        ? 'Captured'
        : handsFreeEnabled
          ? 'Voice Agent On'
          : 'Start Voice Agent';
  const interactionModeLabel = handsFreeEnabled
    ? voiceTurnState === 'listening'
      ? 'Voice listening'
      : voiceOutputState === 'speaking'
        ? 'Voice speaking'
        : 'Voice agent on'
    : 'Text mode';
  const interactionModeDetail = handsFreeEnabled
    ? 'Spoken replies stay transcribed here.'
    : 'Text replies only. Use the mic for voice.';
  const showVoiceControls = handsFreeEnabled || voiceOutputState === 'speaking' || voiceTurnState === 'listening';
  const composerConsoleActive = Boolean(pendingWork) || handsFreeEnabled || isThinking || isBuilding || voiceOutputState === 'speaking' || voiceTurnState === 'listening';
  const composerStateLabel = activityState === 'approval'
    ? 'Approval needed'
    : activityState === 'building'
      ? 'Building workspace'
      : activityState === 'thinking'
        ? 'Looking into that'
        : activityState === 'listening'
          ? 'Listening'
          : activityState === 'speaking'
            ? 'Speaking'
            : activityState === 'active'
              ? 'Voice agent on'
              : interactionModeLabel;
  const composerStateDetail = activityState === 'idle' ? interactionModeDetail : activityDetail;
  const starterPrompts = [
    { label: 'Executive read', prompt: `Build a CMO-ready executive read for ${possessiveName} current brand health.` },
    { label: 'Data basis', prompt: 'Show me the actual data you are working with for this request.' },
    { label: 'Treatment rec', prompt: 'Recommend the best treatment path to consider and the areas to inspect more closely.' },
    { label: 'Brief draft', prompt: 'Turn this into a governed agency brief draft.' }
  ];

  return (
    <main className="brand-assistant-page">
      <header className="brand-assistant-hero">
        <div>
          <div className="section-kicker"><Bot size={14} /> Brand Assistant</div>
          <h1>{record.brandName}</h1>
          <p>One conversation brain for executive reads, data inspection, treatment recommendations, brief drafts, proof, and review gates.</p>
        </div>
        <nav className="conversation-actions" aria-label="Assistant navigation">
          <a href="/"><Home size={15} /> Home</a>
          <a href="/brands"><Search size={15} /> Brands</a>
          <a href="/portfolio"><Network size={15} /> Portfolio</a>
          <a href={`/brand/${record.brandId}/report`}><ClipboardList size={15} /> Report</a>
          <a href={`/brand/${record.brandId}/conversation`}><MessageSquareText size={15} /> Old Chat</a>
          <a href={`/brand/${record.brandId}/data`}><Database size={15} /> Data</a>
          <a className="featured" href={`/brand/${record.brandId}/jarvis`}><Sparkles size={15} /> Jarvis Preview</a>
          <a href="/agent-lab"><Sparkles size={15} /> Workbench</a>
        </nav>
      </header>

      <section className="brand-assistant-status" aria-label="Assistant status">
        <article>
          <span>Primary mode</span>
          <strong>Conversation first</strong>
          <p>Direct questions use the scoped Brand Doctor brain for answer quality.</p>
        </article>
        <article>
          <span>Work mode</span>
          <strong>Governed on approval</strong>
          <p>Executive reads, data basis checks, treatment recommendations, and brief drafts open approved runtime views.</p>
        </article>
        <article>
          <span>Status</span>
          <strong>{status}</strong>
          <p>{events.slice(-1)[0]?.detail ?? 'Ready for a direct question or a work request.'}</p>
        </article>
      </section>

      <div className={`brand-assistant-shell ${isWorkFocus ? 'work-focus' : ''} ${isWorkFullscreen ? 'work-fullscreen' : ''}`}>
        <section className="brand-assistant-chat" aria-label="Jarvis-style brand conversation">
          <div className="brand-assistant-chat-head">
            <div>
              <span>Brand Assistant</span>
              <strong>Ask anything</strong>
            </div>
            <em>{record.category} · {record.period}</em>
          </div>

          <section className="brand-assistant-composer" aria-label="Ask Brand Assistant">
            {composerConsoleActive ? (
              <div className={`brand-assistant-mode-surface ${activityState}`} aria-live="polite">
                <div className="brand-assistant-mode-icon" aria-hidden="true">
                  {activityState === 'approval' ? <ShieldCheck size={22} />
                    : activityState === 'building' ? <Activity size={22} />
                      : activityState === 'thinking' ? <Clock3 size={22} />
                        : activityState === 'speaking' ? <Volume2 size={22} />
                          : <Mic size={22} />}
                </div>
                <div className="brand-assistant-mode-copy">
                  <span>{composerStateLabel}</span>
                  <p>{composerStateDetail}</p>
                </div>
                <div className="brand-assistant-mode-actions">
                  {pendingWork ? (
                    <>
                      <button type="button" onClick={() => approveWork()} disabled={isBuilding}>
                        <Play size={15} />
                        <span>Approve</span>
                      </button>
                      <button className="secondary" type="button" onClick={() => {
                        setPrompt(pendingWork.prompt);
                        setPendingWork(null);
                        pendingWorkRef.current = null;
                        pauseVoiceAgent();
                        setStatus('Ready');
                      }} disabled={isBuilding}>
                        <MessageSquareText size={15} />
                        <span>Refine</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {showVoiceControls && (
                        <button className="secondary" type="button" onClick={toggleVoiceReply} disabled={voiceOutputState === 'unsupported'}>
                          {voiceReplyEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                          <span>{voiceReplyEnabled ? 'Audio On' : 'Muted'}</span>
                        </button>
                      )}
                      <button className="secondary" type="button" onClick={pauseVoiceAgent} disabled={!handsFreeEnabled && voiceOutputState !== 'speaking' && voiceTurnState !== 'listening'}>
                        <Square size={15} />
                        <span>{handsFreeEnabled ? 'Pause' : 'Type'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <form className="brand-assistant-input" onSubmit={(event) => { event.preventDefault(); ask(); }}>
                <input value={prompt} onChange={(event) => setPrompt(event.target.value)} disabled={isThinking || isBuilding} aria-label="Ask Brand Assistant by text" placeholder={`Ask anything about ${record.brandName}`} />
                <button
                  className="voice"
                  type="button"
                  onClick={toggleVoiceAgent}
                  disabled={isThinking || isBuilding || (Boolean(pendingWork) && !handsFreeEnabled)}
                  aria-label={voiceAgentLabel}
                >
                  <Mic size={16} />
                </button>
                <button className="send" type="submit" disabled={isThinking || isBuilding || !prompt.trim()} aria-label="Ask">
                  <Send size={15} />
                </button>
              </form>
            )}

            {!composerConsoleActive && <div className="brand-assistant-composer-meta">
              <div className={`brand-assistant-compact-status ${activityState}`} aria-live="polite">
                <span>{interactionModeLabel}</span>
                <p>{activityState === 'idle' ? interactionModeDetail : activityDetail}</p>
              </div>
            </div>}

            {messages.length === 0 && <div className="brand-assistant-suggestions" aria-label="Suggested asks">
              <span>Try</span>
              <div>
                {starterPrompts.map((chip) => <button key={chip.label} type="button" onClick={() => ask(chip.prompt)} disabled={isThinking || isBuilding}>{chip.label}</button>)}
              </div>
            </div>}

            <details className="brand-assistant-diagnostics">
              <summary>Diagnostics</summary>
              <div className="brand-assistant-voice-strip">
                <span>{voiceTransportState === 'realtime' ? 'openai realtime' : voiceTransportState === 'fallback' ? 'fallback voice' : voiceTransportState === 'unavailable' ? 'voice unavailable' : 'checking realtime'}</span>
                <span>{browserSpeechSupported === false ? 'browser stt unavailable' : browserSpeechSupported === true ? 'browser stt available' : 'checking stt'}</span>
                <span>voice reply {voiceOutputState}</span>
                <span>{handsFreeEnabled ? 'voice agent on' : 'voice agent off'}</span>
              </div>
              <p>{voiceNote}</p>
            </details>
          </section>

          <div className="brand-assistant-transcript-head">
            <span>Conversation</span>
            <em>{messages.length ? 'Text and voice turns stay here.' : 'Your questions and answers will appear here.'}</em>
          </div>

          {(messages.length > 0 || isThinking) && <div className="brand-assistant-messages" ref={transcriptRef}>
            {messages.map((message) => (
              <article className={message.role} key={message.id}>
                <span>{message.role === 'assistant' ? 'Brand Assistant' : 'You'}</span>
                {message.role === 'assistant' ? <MarkdownMessage text={message.text} /> : <p>{message.text}</p>}
                {message.intent?.offers.length ? (
                  <div className="brand-assistant-offers">
                    {message.intent.offers.map((offer) => <button key={offer} type="button" onClick={() => ask(offer)}>{offer}</button>)}
                  </div>
                ) : null}
                {message.suggestedNextMoves?.length ? (
                  <div className="brand-assistant-offers">
                    {message.suggestedNextMoves.map((nextMove) => <button key={nextMove} type="button" onClick={() => ask(nextMove)}>{nextMove}</button>)}
                  </div>
                ) : null}
                {message.proofDisclosure ? (
                  <details className="brand-assistant-proof">
                    <summary>Proof basis</summary>
                    <div>
                      {message.proofDisclosure.evidenceBasis.length ? (
                        <section>
                          <strong>Evidence</strong>
                          <ul>{message.proofDisclosure.evidenceBasis.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                      ) : null}
                      {message.proofDisclosure.missingEvidence.length ? (
                        <section>
                          <strong>Gaps</strong>
                          <ul>{message.proofDisclosure.missingEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                      ) : null}
                      {message.proofDisclosure.guardrails.length ? (
                        <section>
                          <strong>Guardrails</strong>
                          <ul>{message.proofDisclosure.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </article>
            ))}
            {isThinking && (
              <article className="assistant thinking">
                <span>Brand Assistant</span>
                <p>Let me look into that.</p>
              </article>
            )}
          </div>}
        </section>

        <aside className="brand-assistant-work" aria-label="Governed work canvas">
          <div className="brand-assistant-work-head">
            <div>
              <span>Dynamic work canvas</span>
              <strong>{workspaceTitle}</strong>
            </div>
            <div className="brand-assistant-work-actions">
              <button className="secondary" type="button" onClick={() => {
                setIsWorkFullscreen((current) => !current);
                setIsWorkFocus(true);
              }}>
                {isWorkFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span>{isWorkFullscreen ? 'Show Chat' : 'Full Screen'}</span>
              </button>
              {!isWorkFullscreen && (
                <button className="secondary" type="button" onClick={() => setIsWorkFocus((current) => !current)}>
                  {isWorkFocus ? <MessageSquareText size={15} /> : <Maximize2 size={15} />}
                  <span>{isWorkFocus ? 'Widen Chat' : 'Focus Work'}</span>
                </button>
              )}
              {isWorkFullscreen && (
                <button className="secondary brand-assistant-return" type="button" onClick={() => setIsWorkFullscreen(false)}>
                  <MessageSquareText size={15} />
                  <span>Bring Back Conversation</span>
                </button>
              )}
              {pendingWork && <button type="button" onClick={() => approveWork()} disabled={isBuilding}><Play size={15} /> Approve</button>}
            </div>
          </div>

          <section className="brand-assistant-work-progress" aria-label="Workspace progress">
            {workSteps.map((step) => (
              <div className={`brand-assistant-work-step ${step.status}`} key={step.id}>
                <span>
                  {step.status === 'complete' ? <CheckCircle2 size={15} />
                    : step.status === 'active' ? <Clock3 size={15} />
                      : step.status === 'watch' ? <ShieldCheck size={15} />
                        : <Circle size={15} />}
                </span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </div>
            ))}
          </section>

          {pendingWork && (
            <section className="brand-assistant-work-order">
              <ShieldAlert size={18} />
              <div>
                <strong>Approval needed</strong>
                <p>{pendingWork.intent.reason}</p>
                {pendingWork.workSpec ? (
                  <div className="brand-assistant-work-spec">
                    <span>{pendingWork.workSpec.audience.replaceAll('_', ' ')} · {pendingWork.workSpec.objective}</span>
                    <span>{pendingWork.workSpec.artifactType.replaceAll('_', ' ')}</span>
                    <span>{pendingWork.workSpec.canExecuteNow ? 'ready to build' : 'review needed'}</span>
                  </div>
                ) : null}
                <em>{pendingWork.intent.suggestedViewIds.map((viewId) => viewId.replaceAll('_', ' ')).join(' · ')}</em>
              </div>
            </section>
          )}

          {workResult ? (
            <>
              <section className="brand-assistant-work-output">
                <div className="brand-assistant-work-summary">
                  <BadgeCheck size={18} />
                  <div>
                    <span>Workspace ready</span>
                    <strong>{workResult.routedSkillId.replaceAll('_', ' ')}</strong>
                    <p>{workResult.answer.headline}</p>
                  </div>
                </div>
                <div className="brand-assistant-work-stat-grid" aria-label="Workspace proof stats">
                  {workspaceStats.map((stat) => (
                    <div key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <p>{stat.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="brand-assistant-work-followups">
                  <span><ListChecks size={14} /> Continue from this work</span>
                  <div>
                    {latestWorkHref && (
                      <a href={latestWorkHref} target="_blank" rel="noreferrer">
                        <ArrowUpRight size={14} />
                        Open asset in new window
                      </a>
                    )}
                    {workspaceFollowUps.map((followUp) => (
                      <button key={followUp} type="button" onClick={() => ask(followUp)} disabled={isThinking || isBuilding}>{followUp}</button>
                    ))}
                  </div>
                </div>
              </section>
              <div className="dynamic-view-stack">
                {visibleViews.map((request) => (
                  <DynamicViewRenderer key={`${workResult.turnId}-${request.viewId}`} request={request} packet={workResult.packet} result={workResult} />
                ))}
              </div>
            </>
          ) : (
            <div className="brand-assistant-empty">
              <Activity size={20} />
              <strong>Conversation is the front door.</strong>
              <p>When the agent detects a heavier ask, it will ask permission and open the governed work here.</p>
              <ul>
                <li><BookOpen size={14} /> Executive and QBR views</li>
                <li><FileText size={14} /> Work plan before build</li>
                <li><ShieldAlert size={14} /> Proof, gaps, and guardrails</li>
                <li><BadgeCheck size={14} /> Review gates before anything final</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
