'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BookOpen, CheckCircle2, ClipboardList, Clock, Cpu, Database, Eye, FileText, Home, MessageSquareText, Mic, Network, Play, Radio, Route, Search, Send, ShieldAlert, Sparkles, Square, Volume2, VolumeX, Zap } from 'lucide-react';
import DynamicViewRenderer from '@/src/components/intelligence/DynamicViewRenderer';
import {
  AGENT_SESSION_LEDGER_STORAGE_KEY,
  buildSessionAuditSummary,
  buildSessionArtifactReadinessSummary,
  buildSessionCanvasContinuitySummary,
  buildSessionCapabilityReadinessSummary,
  buildSessionEvidenceSpotlightSummary,
  buildSessionExperienceArchitectureSummary,
  buildSessionExecutivePilotSummary,
  buildSessionFoundationReadinessSummary,
  buildSessionMemoryAuditSummary,
  buildSessionPersistenceGovernanceSummary,
  buildSessionPilotLearningSummary,
  buildSessionProactivitySummary,
  buildSessionPromotionGateSummary,
  buildSessionProviderAdapterSummary,
  buildSessionReviewWorkflowSummary,
  buildSessionRuntimeControlSummary,
  buildSessionRuntimeQualitySummary,
  buildSessionRuntimeSurfaceSummary,
  buildSessionSourceGovernanceSummary,
  buildSessionSourceRuntimeIngestionSummary,
  buildSessionTreatmentOutcomeReadinessSummary,
  buildSessionVoiceContractSummary,
  buildSessionVoiceReadinessSummary,
  buildSessionVoiceRuntimeSummary,
  emptySessionLedger,
  mergeSessionLedgers,
  mergeTurnIntoLedger,
  parseSessionLedger,
  type AgentSessionLedger
} from '@/src/lib/intelligence/session-ledger';
import type {
  AgentReviewDecision,
  AgentReviewItemType,
  AgentTurnEvent,
  AgentTurnResult,
  ConversationOrchestratorResult
} from '@/src/lib/intelligence/types';
import type { GovernedRuntimeSurfaceRegistry } from '@/src/lib/intelligence/runtime-surface-registry';
import { buildFoundationLayerAudit } from '@/src/lib/intelligence/foundation-layer-readiness';
import { buildWorkspaceOrchestrationState } from '@/src/lib/intelligence/workspace-orchestration';

type BrandOption = {
  brandId: string;
  brandName: string;
  category: string;
  period: string;
};

type LabMessage = {
  role: 'user' | 'agent';
  text: string;
  skillId?: string;
};

type LabState = 'ready' | 'listening' | 'routing' | 'rendering' | 'speaking';

type VoiceTurnState = 'idle' | 'listening' | 'captured' | 'unsupported' | 'error';

type AgentLabViewMode = 'start' | 'focus' | 'inspect';

type WorkOrderMode = 'quick_answer' | 'advanced_skill';

type VoiceOutputState = 'checking' | 'ready' | 'speaking' | 'muted' | 'unsupported' | 'error';

type SpeechOptions = { interrupt?: boolean; force?: boolean; onDone?: () => void };

type WorkOrderPlan = {
  id: string;
  mode: WorkOrderMode;
  prompt: string;
  brandId: string;
  label: string;
  expectation: string;
  approvalReason: string;
  steps: string[];
  likelySkill: string;
  deliverable: string;
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

type PilotRunbookStep = {
  id: string;
  summaryStepId: ReturnType<typeof buildSessionExecutivePilotSummary>['steps'][number]['id'];
  label: string;
  objective: string;
  prompt: (brand: BrandOption) => string;
  expectedSkillId: string;
  expectedTemplateId: string;
};

type MlvDemoStep = {
  id: string;
  label: string;
  outcome: string;
  prompt: (brand: BrandOption) => string;
  expectedSkillId: string;
  expectedTemplateId: string;
  expectedViewIds: string[];
};

type MlvScoreDimension = {
  id: string;
  label: string;
  description: string;
};

const promptChips = [
  "Why is Lay's slipping if it is still strong, and what should we bring to QBR?",
  'Show me the evidence behind the diagnosis.',
  'What treatment path should we test first?',
  'Draft a QBR story for human review.',
  'Which approved views should open for this question?',
  'Pressure-test this read before I take it to leadership.'
];

const pilotRunbookSteps: PilotRunbookStep[] = [
  {
    id: 'pilot-runbook',
    summaryStepId: 'sponsor_runbook',
    label: 'Sponsor Runbook',
    objective: 'Open the CMO pilot path with the governed run sequence and funding gates.',
    prompt: (brand) => `Build the CMO pilot runbook and funding demo path for ${brand.brandName} so a sponsor can see the brand read, dynamic workspace foundation, proof rails, and what remains gated.`,
    expectedSkillId: 'plan_executive_pilot',
    expectedTemplateId: 'executive-pilot-runbook'
  },
  {
    id: 'brand-read',
    summaryStepId: 'brand_read',
    label: 'Brand Read',
    objective: 'Show the live BGS meeting prep problem before talking about platform mechanics.',
    prompt: (brand) => `Give me the strongest BGS meeting prep read for ${brand.brandName}, including momentum, room to grow, evidence, and gaps.`,
    expectedSkillId: 'bbe_momentum_intelligence_read',
    expectedTemplateId: 'executive-qbr-decision-read'
  },
  {
    id: 'workspace-foundation',
    summaryStepId: 'workspace_foundation',
    label: 'Workspace Foundation',
    objective: 'Prove role-specific UI assembly from approved ExperiencePlans, skills, and views.',
    prompt: (brand) => `Show experience architecture, ExperiencePlan readiness, approved templates, approved views, and how we build the right workspace for a new ${brand.brandName} user without arbitrary UI.`,
    expectedSkillId: 'inspect_experience_architecture',
    expectedTemplateId: 'experience-architecture-cockpit'
  },
  {
    id: 'foundation-control',
    summaryStepId: 'foundation_control',
    label: 'Foundation Control',
    objective: 'Show what is ready, prototype-ready, gated, and fundable next.',
    prompt: (brand) => `Show foundation readiness, platform readiness, the Brand Growth Intelligence foundation control plane, CMO readiness, what is ready, and what is gated for ${brand.brandName}.`,
    expectedSkillId: 'inspect_foundation_readiness',
    expectedTemplateId: 'foundation-readiness-cockpit'
  },
  {
    id: 'runtime-voice',
    summaryStepId: 'runtime_and_voice',
    label: 'Runtime And Voice',
    objective: 'Show the shared runtime, streaming path, provider gates, and disabled full voice.',
    prompt: (brand) => `Show runtime governance, runtime surfaces, capability flags, kill switch posture, provider gates, and Jarvis-style voice readiness blockers for ${brand.brandName}.`,
    expectedSkillId: 'inspect_runtime_governance',
    expectedTemplateId: 'runtime-governance-cockpit'
  },
  {
    id: 'review-gates',
    summaryStepId: 'review_gates',
    label: 'Review Gates',
    objective: 'Close with human review, blocked gates, and what must clear before rollout.',
    prompt: (brand) => `Show the review queue, audit trail, pending approvals, blocked gates, and what needs review before the next ${brand.brandName} pilot session.`,
    expectedSkillId: 'review_session_state',
    expectedTemplateId: 'review-operations-cockpit'
  }
];

const mlvDemoSteps: MlvDemoStep[] = [
  {
    id: 'executive-brand-read',
    label: 'Executive Brand Read',
    outcome: 'Leadership-ready answer, red momentum, evidence, gaps, and a QBR story draft.',
    prompt: (brand) => `Why is ${brand.brandName} slipping if it is still strong, and what should we bring to QBR? Show the executive read, evidence, gaps, and human-review story draft.`,
    expectedSkillId: 'bbe_momentum_intelligence_read',
    expectedTemplateId: 'executive-qbr-decision-read',
    expectedViewIds: ['momentum_ladder', 'evidence_ledger', 'evidence_spotlight_panel', 'qbr_story_draft', 'data_gap_panel']
  },
  {
    id: 'trust-source-readiness',
    label: 'Trust Check',
    outcome: 'What is demo-ready, what is source-dependent, and what must clear before executive use.',
    prompt: (brand) => `What would we need to trust ${brand.brandName} for executive use? Show source readiness, source-owner requirements, runtime ingestion gates, and blockers without promoting prototype data.`,
    expectedSkillId: 'bbe_momentum_intelligence_read',
    expectedTemplateId: 'source-readiness-lab',
    expectedViewIds: ['source_readiness_panel', 'momentum_room_to_grow_grid', 'source_runtime_ingestion_panel', 'smd_driver_map', 'data_gap_panel']
  },
  {
    id: 'treatment-path-test',
    label: 'Treatment Path',
    outcome: 'A governed path to test first, with provocations, proof needs, and human decision language.',
    prompt: (brand) => `What treatment should the ${brand.brandName} team test first? Build the first option to consider, with action prompts, gaps, and human review caveats.`,
    expectedSkillId: 'create_growth_provocations',
    expectedTemplateId: 'marketer-treatment-planning',
    expectedViewIds: ['growth_provocation_list', 'treatment_path_card', 'evidence_ledger']
  }
];

const AGENT_LAB_DURABLE_SESSION_KEY = 'bbe-agent-lab-durable-session-id-v1';
const AGENT_LAB_MLV_SCORE_STORAGE_KEY = 'bbe-agent-lab-mlv-score-v1';
const BROWSER_LEDGER_COMPACT_LIMIT = 12;
const STREAM_EVENT_PACE_MS = 45;

const advancedWorkSignals = [
  'build',
  'create',
  'make',
  'dashboard',
  'report',
  'qbr',
  'deck',
  'brief',
  'evidence',
  'evidence pack',
  'treatment',
  'proof',
  'source',
  'source readiness',
  'trust',
  'compare',
  'treatment plan',
  'draft',
  'story',
  'workspace',
  'view',
  'learn more',
  'go deeper',
  'pressure-test'
];

const mlvScoreDimensions: MlvScoreDimension[] = [
  {
    id: 'executive_clarity',
    label: 'Executive clarity',
    description: 'The first read is clear enough for a senior sponsor to understand quickly.'
  },
  {
    id: 'minimum_lovable_path',
    label: 'Minimum lovable path',
    description: 'The three guided use cases feel like a complete first product loop.'
  },
  {
    id: 'dynamic_workspace_feel',
    label: 'Dynamic workspace feel',
    description: 'The system feels like it assembles the right workspace, not a static report.'
  },
  {
    id: 'choreography_clarity',
    label: 'Choreography clarity',
    description: 'Ask, Plan, Render, Prove, and Review are easy to follow.'
  },
  {
    id: 'trust_proof_visibility',
    label: 'Trust and proof visibility',
    description: 'Evidence, gaps, guardrails, source readiness, memory, and audit are visible.'
  },
  {
    id: 'guardrail_confidence',
    label: 'Guardrail confidence',
    description: 'The fail-closed behavior is obvious and credible.'
  },
  {
    id: 'fund_this_energy',
    label: 'Fund-this energy',
    description: 'The experience feels strong enough to justify the next investment lane.'
  }
];

function answerToPlainText(result: AgentTurnResult) {
  return [
    result.answer.headline,
    result.answer.answer,
    ...result.answer.interpretation.slice(0, 2)
  ].join(' ');
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function cleanSpeechText(text: string) {
  return text
    .replace(/[`*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\bQBR\b/g, 'Q B R')
    .replace(/\bBBE\b/g, 'B B E')
    .replace(/\bSMD\b/g, 'S M D')
    .trim();
}

function shortSpeechSummary(headline: string, answer: string, maxLength = 360) {
  const text = cleanSpeechText(`${headline}. ${answer}`);
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const sentenceEnd = Math.max(clipped.lastIndexOf('.'), clipped.lastIndexOf('?'), clipped.lastIndexOf('!'));
  return `${(sentenceEnd > 120 ? clipped.slice(0, sentenceEnd + 1) : clipped).trim()} The full answer and proof are on screen.`;
}

function eventToSpokenStatus(event: AgentTurnEvent) {
  switch (event.type) {
    case 'packet_ready':
      return 'Checking the brand packet.';
    case 'experience_planned':
      return 'Building the workspace.';
    case 'evidence_spotlight_ready':
      return 'Proof and gaps are ready.';
    default:
      return null;
  }
}

function composedAnswerToMessage(result: ConversationOrchestratorResult) {
  return [
    `## ${result.composedAnswer.headline}`,
    result.composedAnswer.answer,
    result.composedAnswer.suggestedOffers.length ? `\n**I can also:** ${result.composedAnswer.suggestedOffers.join(' · ')}` : '',
    result.composedAnswer.proofHighlights.length ? `\n**Proof highlights**\n${result.composedAnswer.proofHighlights.map((item) => `- ${item}`).join('\n')}` : '',
    result.composedAnswer.blockedActions.length ? `\n**Blocked actions**\n${result.composedAnswer.blockedActions.map((item) => `- ${item}`).join('\n')}` : '',
    result.composedAnswer.caveats.length ? `\n**Caveats**\n${result.composedAnswer.caveats.map((item) => `- ${item}`).join('\n')}` : ''
  ].filter(Boolean).join('\n');
}

function inferWorkOrderPlan(promptText: string, brand: BrandOption): WorkOrderPlan {
  const normalized = promptText.toLowerCase();
  const governanceAsk = [
    'certify',
    'production ready',
    'export the audit',
    'write source truth',
    'turn on full voice',
    'official approval',
    'canonical'
  ].some((signal) => normalized.includes(signal));
  const signalHits = advancedWorkSignals.filter((signal) => normalized.includes(signal));
  const mode: WorkOrderMode = governanceAsk || signalHits.length > 0 || promptText.length > 150
    ? 'advanced_skill'
    : 'quick_answer';
  const asksForReport = ['report', 'qbr', 'story', 'draft'].some((signal) => normalized.includes(signal));
  const asksForTreatment = ['treatment', 'what should', 'plan'].some((signal) => normalized.includes(signal));
  const asksForProof = ['evidence', 'proof', 'source', 'trust', 'pressure-test'].some((signal) => normalized.includes(signal));
  const likelySkill = asksForTreatment
    ? 'treatment planning skill'
    : asksForReport
      ? 'executive QBR story skill'
      : asksForProof
        ? 'evidence and source readiness skill'
        : mode === 'advanced_skill'
          ? 'brand growth intelligence skill'
          : 'scoped brand Q&A';
  const deliverable = asksForReport
    ? 'a leadership-ready read with a review-only story draft'
    : asksForTreatment
      ? 'treatment paths to consider, proof needs, and review caveats'
      : asksForProof
        ? 'evidence, source readiness, missing inputs, and guardrails'
        : mode === 'advanced_skill'
          ? 'an assembled workspace with approved views, proof, and gates'
          : 'a concise answer grounded in the active brand packet';

  return {
    id: `work-order-${Date.now().toString(36)}`,
    mode,
    prompt: promptText,
    brandId: brand.brandId,
    label: mode === 'advanced_skill' ? 'Advanced Skill Run' : 'Quick Answer',
    expectation: mode === 'advanced_skill'
      ? `This looks bigger than a direct answer. I will route it, assemble the right ${brand.brandName} workspace, show proof, and hold anything risky for review.`
      : `This looks like a direct ${brand.brandName} question. I can answer it without opening a full work order.`,
    approvalReason: mode === 'advanced_skill'
      ? 'Approval required before I spend the turn building views, artifacts, memory suggestions, or treatment/report work.'
      : 'No approval gate needed unless you ask for a report, dashboard, treatment plan, evidence audit, or other advanced skill.',
    steps: mode === 'advanced_skill'
      ? [
        'Confirm the business ask and active brand',
        `Route to the approved ${likelySkill}`,
        'Read the packet and build an ExperiencePlan',
        'Open approved views and hide unsupported modules',
        'Attach evidence, missing inputs, and guardrails',
        'Stage artifacts, memory, and gates for human review'
      ]
      : [
        'Read the active brand packet',
        'Answer with scoped evidence',
        'Name gaps or guardrails if they matter'
      ],
    likelySkill,
    deliverable
  };
}

function createDurableSessionId() {
  const randomPart = typeof window.crypto?.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `agent-lab-${randomPart}`;
}

function takeRecent<T>(items: T[], limit = BROWSER_LEDGER_COMPACT_LIMIT) {
  return items.slice(-limit);
}

function compactBrowserSessionLedger(ledger: AgentSessionLedger): AgentSessionLedger {
  return {
    ...ledger,
    updatedAt: new Date().toISOString(),
    turnIds: takeRecent(ledger.turnIds, 24),
    memory: takeRecent(ledger.memory, 36),
    audit: takeRecent(ledger.audit, 80),
    artifacts: takeRecent(ledger.artifacts, 18),
    confirmationGates: takeRecent(ledger.confirmationGates, 36),
    capabilityState: takeRecent(ledger.capabilityState),
    evidenceSpotlight: takeRecent(ledger.evidenceSpotlight, 48),
    proactivity: takeRecent(ledger.proactivity),
    pilotLearning: takeRecent(ledger.pilotLearning),
    treatmentOutcomeReadiness: takeRecent(ledger.treatmentOutcomeReadiness),
    sourceGovernance: takeRecent(ledger.sourceGovernance),
    runtimeSurface: takeRecent(ledger.runtimeSurface),
    experienceArchitecture: takeRecent(ledger.experienceArchitecture),
    canvasState: takeRecent(ledger.canvasState),
    interruptionRecovery: takeRecent(ledger.interruptionRecovery),
    reasoningStatus: takeRecent(ledger.reasoningStatus),
    conversationPresence: takeRecent(ledger.conversationPresence),
    workingContext: takeRecent(ledger.workingContext),
    persistenceReadiness: takeRecent(ledger.persistenceReadiness),
    reviewIdentity: takeRecent(ledger.reviewIdentity),
    providerAdapter: takeRecent(ledger.providerAdapter),
    runtimeQuality: takeRecent(ledger.runtimeQuality),
    voiceRuntime: takeRecent(ledger.voiceRuntime),
    voiceContract: takeRecent(ledger.voiceContract),
    voiceReadiness: takeRecent(ledger.voiceReadiness),
    reviews: takeRecent(ledger.reviews, 36)
  };
}

function writeBrowserSessionLedger(ledger: AgentSessionLedger) {
  try {
    window.localStorage.setItem(AGENT_SESSION_LEDGER_STORAGE_KEY, JSON.stringify(ledger));
    return { ledger, compacted: false };
  } catch {
    const compacted = compactBrowserSessionLedger(ledger);
    try {
      window.localStorage.removeItem(AGENT_SESSION_LEDGER_STORAGE_KEY);
      window.localStorage.setItem(AGENT_SESSION_LEDGER_STORAGE_KEY, JSON.stringify(compacted));
    } catch {
      window.localStorage.removeItem(AGENT_SESSION_LEDGER_STORAGE_KEY);
    }
    return { ledger: compacted, compacted: true };
  }
}

export default function AgentLabClient({
  initialResult,
  brandOptions,
  defaultPrompt,
  runtimeSurfaceRegistry
}: {
  initialResult: AgentTurnResult;
  brandOptions: BrandOption[];
  defaultPrompt: string;
  runtimeSurfaceRegistry: GovernedRuntimeSurfaceRegistry;
}) {
  const [result, setResult] = useState(initialResult);
  const [brandId, setBrandId] = useState(initialResult.packet.brand.brandId);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [messages, setMessages] = useState<LabMessage[]>([
    { role: 'user', text: defaultPrompt },
    { role: 'agent', text: answerToPlainText(initialResult), skillId: initialResult.routedSkillId }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [labState, setLabState] = useState<LabState>('ready');
  const [voiceTurnState, setVoiceTurnState] = useState<VoiceTurnState>('idle');
  const [voiceConsentAcknowledged, setVoiceConsentAcknowledged] = useState(false);
  const [voiceNote, setVoiceNote] = useState('Talk or type a prompt. Hands-Free can keep reopening listening turns while the same session keeps context and memory.');
  const [browserSpeechSupported, setBrowserSpeechSupported] = useState<boolean | null>(null);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [voiceFollowUpEnabled, setVoiceFollowUpEnabled] = useState(false);
  const [voiceOutputState, setVoiceOutputState] = useState<VoiceOutputState>('checking');
  const [runtimeEvents, setRuntimeEvents] = useState<AgentTurnEvent[]>(initialResult.events);
  const [durableSessionId, setDurableSessionId] = useState('agent-lab-default');
  const [sessionLedger, setSessionLedger] = useState<AgentSessionLedger>(() => mergeTurnIntoLedger(emptySessionLedger(), initialResult));
  const [mlvScores, setMlvScores] = useState<Record<string, number>>({});
  const [interruptedTurnCount, setInterruptedTurnCount] = useState(0);
  const [viewMode, setViewMode] = useState<AgentLabViewMode>('start');
  const [pendingWorkOrder, setPendingWorkOrder] = useState<WorkOrderPlan | null>(null);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrderPlan | null>(null);
  const activeTurnAbortController = useRef<AbortController | null>(null);
  const topPromptInputRef = useRef<HTMLInputElement | null>(null);
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const spokenRuntimeTypesRef = useRef<Set<string>>(new Set());
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRequestIdRef = useRef(0);
  const voiceFollowUpEnabledRef = useRef(false);
  const isRunningRef = useRef(false);
  const activeVoiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const followUpRestartTimerRef = useRef<number | null>(null);

  function focusPromptInput() {
    const input = topPromptInputRef.current ?? promptInputRef.current;
    input?.focus();
    input?.select();
  }

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
      // Browser speech recognition may throw when it has already ended.
    }
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
    if (!speech) return;
    if (options.interrupt) window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(speech);
    const preferredVoice = window.speechSynthesis.getVoices().find((voice) => /female|samantha|victoria|zira|google us english/i.test(voice.name))
      ?? window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.08;
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
      setVoiceNote(`Browser voice reply could not play audio (${error}). Visual progress and typed/voice input still work.`);
    };
    window.speechSynthesis.speak(utterance);
  }

  async function speakAgent(text: string, options: SpeechOptions = {}) {
    if (!voiceReplyEnabled && !options.force) {
      setVoiceOutputState('muted');
      options.onDone?.();
      return;
    }
    const speech = cleanSpeechText(text);
    if (!speech) return;
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
        speakWithBrowserVoice(speech, options);
      };
      await audio.play();
      setVoiceNote('OpenAI voice reply is speaking. Visual progress and proof remain the source of truth.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'browser_audio_blocked';
      setVoiceNote(`OpenAI voice reply fell back to browser voice (${detail}).`);
      speakWithBrowserVoice(speech, options);
    }
  }

  function toggleVoiceReply() {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      setVoiceReplyEnabled(false);
      setVoiceOutputState('unsupported');
      setVoiceNote('Voice reply audio playback is not available here. Talk/type input and visual runtime progress still work.');
      return;
    }
    setVoiceReplyEnabled((current) => {
      const next = !current;
      if (!next) {
        activeAudioRef.current?.pause();
        activeAudioRef.current = null;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setVoiceOutputState('muted');
        setVoiceNote('Voice reply muted. Talk/type input and visual runtime progress remain active.');
      } else {
        setVoiceOutputState('ready');
        setVoiceNote('Voice reply enabled. I will speak short progress updates and summaries.');
        speakAgent('Voice reply is on. I will speak short progress updates and summaries.', { force: true, interrupt: true });
      }
      return next;
    });
  }

  function testVoiceReply() {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      setVoiceReplyEnabled(false);
      setVoiceOutputState('unsupported');
      setVoiceNote('Voice reply audio playback is not available here.');
      return;
    }
    setVoiceReplyEnabled(true);
    setVoiceOutputState('ready');
    speakAgent('OpenAI voice reply test. Brand Doctor can speak short progress updates and summaries when audio playback is allowed.', { interrupt: true, force: true });
  }

  function toggleVoiceFollowUp() {
    if (isRunning) return;
    setVoiceFollowUpEnabled((current) => {
      const next = !current;
      voiceFollowUpEnabledRef.current = next;
      if (next) {
        setVoiceConsentAcknowledged(true);
        setVoiceNote('Hands-Free is on. I will keep reopening listening turns in this session until you turn it off.');
        window.setTimeout(() => startFollowUpListen(), 250);
      } else {
        clearFollowUpRestart();
        stopActiveVoiceRecognition();
        setVoiceTurnState('idle');
        setLabState('ready');
        setVoiceNote('Hands-Free is off. Use Push To Talk or type when you want the next turn.');
      }
      return next;
    });
  }

  function scheduleFollowUpListen(delayMs = 700) {
    clearFollowUpRestart();
    if (!voiceFollowUpEnabledRef.current) return;
    followUpRestartTimerRef.current = window.setTimeout(() => {
      followUpRestartTimerRef.current = null;
      startFollowUpListen();
    }, delayMs);
  }

  function startFollowUpListen() {
    if (!voiceFollowUpEnabledRef.current || isRunningRef.current || pendingWorkOrder) return;
    if (!canUsePushToTalk) {
      setVoiceNote('Hands-Free is on, but voice capture is gated right now. Type the next turn and I will keep the same session context.');
      window.setTimeout(focusPromptInput, 0);
      return;
    }
    startVoicePrompt({ followUp: true });
  }

  useEffect(() => {
    voiceFollowUpEnabledRef.current = voiceFollowUpEnabled;
  }, [voiceFollowUpEnabled]);

  useEffect(() => () => {
    clearFollowUpRestart();
    stopActiveVoiceRecognition();
  }, []);

  useEffect(() => {
    const stored = parseSessionLedger(window.localStorage.getItem(AGENT_SESSION_LEDGER_STORAGE_KEY));
    const merged = mergeTurnIntoLedger(stored, initialResult);
    const persisted = writeBrowserSessionLedger(merged);
    setSessionLedger(persisted.ledger);
    if (persisted.compacted) {
      setVoiceNote('Browser session history was compacted locally; durable server session state remains active.');
    }
  }, [initialResult]);

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(AGENT_LAB_DURABLE_SESSION_KEY);
    const nextSessionId = storedSessionId || createDurableSessionId();
    window.localStorage.setItem(AGENT_LAB_DURABLE_SESSION_KEY, nextSessionId);
    setDurableSessionId(nextSessionId);

    fetch(`/api/agent/session-ledger?sessionId=${encodeURIComponent(nextSessionId)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const serverLedger = data?.session?.ledger as AgentSessionLedger | undefined;
        if (!serverLedger?.version) return;
        setSessionLedger((current) => {
          const merged = mergeSessionLedgers(current, serverLedger);
          const persisted = writeBrowserSessionLedger(merged);
          if (persisted.compacted) {
            window.setTimeout(() => setVoiceNote('Browser session history was compacted locally; durable server session state remains active.'), 0);
          }
          return persisted.ledger;
        });
      })
      .catch(() => {
        setVoiceNote('Server session ledger is unavailable; browser-local session state is still active.');
      });
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).SpeechRecognition ?? (window as unknown as {
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).webkitSpeechRecognition;
    const supported = Boolean(SpeechRecognition);
    setBrowserSpeechSupported(supported);
    if (!supported) {
      setVoiceTurnState('unsupported');
      setVoiceNote('Browser voice capture is not available in this session. Type a prompt and press Run; the same governed stream, views, evidence, memory, audit, and gates will still assemble.');
    }
  }, []);

  useEffect(() => {
    const supported = typeof Audio !== 'undefined';
    setVoiceOutputState(supported ? 'ready' : 'unsupported');
    if (!supported) setVoiceReplyEnabled(false);
    return () => {
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AGENT_LAB_MLV_SCORE_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return;
      setMlvScores(Object.fromEntries(
        Object.entries(parsed)
          .filter(([, value]) => typeof value === 'number' && value >= 1 && value <= 5)
      ) as Record<string, number>);
    } catch {
      window.localStorage.removeItem(AGENT_LAB_MLV_SCORE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(AGENT_LAB_MLV_SCORE_STORAGE_KEY, JSON.stringify(mlvScores));
    } catch {
      window.localStorage.removeItem(AGENT_LAB_MLV_SCORE_STORAGE_KEY);
    }
  }, [mlvScores]);

  const activeBrand = useMemo(
    () => brandOptions.find((brand) => brand.brandId === brandId) ?? brandOptions[0],
    [brandId, brandOptions]
  );
  const activePlan = result.experiencePlan;
  const voiceModeLabel = result.voicePolicy.defaultMode.replaceAll('_', ' ');
  const canUsePushToTalk = result.voicePolicy.enabledModes.includes('push_to_talk');
  const continuousVoiceDisabled = result.voicePolicy.disabledModes.includes('continuous');
  const pendingMemory = sessionLedger.memory.filter((record) => record.status === 'suggested').slice(0, 3);
  const pendingArtifacts = sessionLedger.artifacts.filter((artifact) => (artifact.reviewStatus ?? 'pending') === 'pending' && artifact.status !== 'blocked').slice(0, 3);
  const pendingGates = sessionLedger.confirmationGates.filter((gate) => gate.status === 'required').slice(0, 3);
  const reviewedRecords = sessionLedger.reviews.slice(-4).reverse();
  const reviewWorkflowSummary = useMemo(
    () => buildSessionReviewWorkflowSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const artifactReadinessSummary = useMemo(
    () => buildSessionArtifactReadinessSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const auditSummary = useMemo(
    () => buildSessionAuditSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const memoryAuditSummary = useMemo(
    () => buildSessionMemoryAuditSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const capabilityReadinessSummary = useMemo(
    () => buildSessionCapabilityReadinessSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const evidenceSpotlightSummary = useMemo(
    () => buildSessionEvidenceSpotlightSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const proactivitySummary = useMemo(
    () => buildSessionProactivitySummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const pilotLearningSummary = useMemo(
    () => buildSessionPilotLearningSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const treatmentOutcomeReadinessSummary = useMemo(
    () => buildSessionTreatmentOutcomeReadinessSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sourceGovernanceSummary = useMemo(
    () => buildSessionSourceGovernanceSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sourceRuntimeIngestionSummary = useMemo(
    () => buildSessionSourceRuntimeIngestionSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionRuntimeSurfaceSummary = useMemo(
    () => buildSessionRuntimeSurfaceSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionExperienceArchitectureSummary = useMemo(
    () => buildSessionExperienceArchitectureSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionCanvasContinuitySummary = useMemo(
    () => buildSessionCanvasContinuitySummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionPersistenceGovernanceSummary = useMemo(
    () => buildSessionPersistenceGovernanceSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionProviderAdapterSummary = useMemo(
    () => buildSessionProviderAdapterSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionRuntimeControlSummary = useMemo(
    () => buildSessionRuntimeControlSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionRuntimeQualitySummary = useMemo(
    () => buildSessionRuntimeQualitySummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionVoiceRuntimeSummary = useMemo(
    () => buildSessionVoiceRuntimeSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionVoiceContractSummary = useMemo(
    () => buildSessionVoiceContractSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const sessionVoiceReadinessSummary = useMemo(
    () => buildSessionVoiceReadinessSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const foundationReadinessSummary = useMemo(
    () => buildSessionFoundationReadinessSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const executivePilotSummary = useMemo(
    () => buildSessionExecutivePilotSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const promotionGateSummary = useMemo(
    () => buildSessionPromotionGateSummary(durableSessionId, sessionLedger),
    [durableSessionId, sessionLedger]
  );
  const activeZones = activePlan?.zones ?? result.answer.dynamicViewRequests.map((request, index) => ({
    id: request.viewId,
    title: request.viewId.replaceAll('_', ' '),
    purpose: request.reason,
    viewId: request.viewId,
    skillId: result.routedSkillId,
    priority: index + 1,
    evidenceRequired: true,
    requiredDataAvailable: request.requiredDataAvailable,
    fallbackViewId: request.fallbackViewId,
    reason: request.reason
  }));
  const runtimeSurfaceSummary = useMemo(() => ({
    ready: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'ready').length,
    optIn: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'ready_opt_in').length,
    legacy: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'legacy_stable').length,
    gated: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'gated').length,
    disabled: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'disabled').length,
    governedDefault: runtimeSurfaceRegistry.surfaces.filter((surface) => surface.defaultState === 'governed_default').length
  }), [runtimeSurfaceRegistry]);
  const blockedRuntimePromotionSteps = sessionRuntimeSurfaceSummary.runtimeSurfacePromotionProtocol
    .filter((item) => item.status === 'blocked');
  const missionControlTiles = [
    {
      id: 'pilot-readiness',
      label: 'CMO pilot',
      value: promotionGateSummary.readinessLevel.replaceAll('_', ' '),
      detail: `${executivePilotSummary.completedSteps}/${executivePilotSummary.totalSteps} sponsor steps · production ${promotionGateSummary.productionReady ? 'ready' : 'blocked'}`,
      state: promotionGateSummary.pilotReviewReady ? 'good' : promotionGateSummary.executiveDemoReady ? 'medium' : 'watch'
    },
    {
      id: 'runtime-surface',
      label: 'Runtime surfaces',
      value: sessionRuntimeSurfaceSummary.allUsedSurfacesGuarded ? 'guarded' : 'watch',
      detail: `${sessionRuntimeSurfaceSummary.turnsWithRuntimeSurface} turns · ${blockedRuntimePromotionSteps.length} promotion gates blocked`,
      state: sessionRuntimeSurfaceSummary.allUsedSurfacesGuarded ? 'good' : 'watch'
    },
    {
      id: 'source-ingestion',
      label: 'Source gate',
      value: sourceRuntimeIngestionSummary.readyToWireDefaultRuntimeSource ? 'ready to wire' : 'review only',
      detail: `${sourceRuntimeIngestionSummary.loadedFileKinds.length}/${sourceRuntimeIngestionSummary.requiredFileKinds.length} Momentum files · canonical ${sourceRuntimeIngestionSummary.canonicalUseEnabled ? 'enabled' : 'blocked'}`,
      state: sourceRuntimeIngestionSummary.readyToWireDefaultRuntimeSource ? 'good' : sourceRuntimeIngestionSummary.readyForGovernanceReview ? 'medium' : 'watch'
    },
    {
      id: 'voice-readiness',
      label: 'Voice path',
      value: sessionVoiceRuntimeSummary.pushToTalkReady ? 'push-to-talk proof' : 'typed proof',
      detail: `Realtime ${sessionVoiceReadinessSummary.realtimeVoiceEnabled ? 'enabled' : 'gated'} · TTS ${sessionVoiceReadinessSummary.ttsEnabled ? 'enabled' : 'gated'} · continuous ${sessionVoiceReadinessSummary.continuousVoiceEnabled ? 'enabled' : 'gated'}`,
      state: sessionVoiceRuntimeSummary.usesGovernedRuntimeConsistent ? 'good' : 'watch'
    },
    {
      id: 'memory-audit',
      label: 'Memory/audit',
      value: auditSummary.records > 0 ? 'audited' : 'waiting',
      detail: `${memoryAuditSummary.memory.accepted} accepted memory · ${auditSummary.records} audit records · export ${auditSummary.auditExportEnabled ? 'enabled' : 'blocked'}`,
      state: auditSummary.records > 0 && auditSummary.auditExportEnabled === false ? 'good' : 'watch'
    }
  ];
  const mlvDemoStatus = mlvDemoSteps.map((step) => {
    const matchingManifests = sessionLedger.experienceArchitecture.filter((manifest) => (
      manifest.activeTemplateId === step.expectedTemplateId &&
      step.expectedViewIds.every((viewId) => manifest.renderedViewIds.includes(viewId))
    ));
    const latest = matchingManifests.at(-1);
    const active = activePlan?.templateId === step.expectedTemplateId;
    return {
      ...step,
      active,
      completed: Boolean(latest),
      turnCount: matchingManifests.length,
      renderedViewIds: latest?.renderedViewIds.filter((viewId) => step.expectedViewIds.includes(viewId)) ?? [],
      missingViewIds: step.expectedViewIds.filter((viewId) => !(latest?.renderedViewIds ?? []).includes(viewId))
    };
  });
  const mlvCompletedCount = mlvDemoStatus.filter((step) => step.completed).length;
  const mlvScoreValues = Object.values(mlvScores);
  const mlvScoreAverage = mlvScoreValues.length
    ? (mlvScoreValues.reduce((total, score) => total + score, 0) / mlvScoreValues.length).toFixed(1)
    : 'not scored';
  const mlvScoreComplete = mlvScoreValues.length === mlvScoreDimensions.length;
  const workspaceOrchestration = useMemo(
    () => buildWorkspaceOrchestrationState({
      result,
      runtimeEvents,
      runtimeState: labState,
      sessionLedger
    }),
    [result, runtimeEvents, labState, sessionLedger]
  );
  const computedFoundationLayerAudit = buildFoundationLayerAudit({
    result,
    workspaceOrchestration,
    runtimeQualitySummary: sessionRuntimeQualitySummary,
    voiceRuntimeSummary: sessionVoiceRuntimeSummary,
    voiceReadinessSummary: sessionVoiceReadinessSummary,
    auditSummary,
    memoryAuditSummary,
    sourceRuntimeIngestionSummary,
    artifactReadinessSummary,
    treatmentOutcomeReadinessSummary,
    promotionGateSummary
  });
  const foundationLayerAudit = result.persistence?.foundationLayerAudit ?? computedFoundationLayerAudit;
  const activeMlvStep = mlvDemoStatus.find((step) => step.active);
  const currentMlvStep = activeMlvStep ?? mlvDemoStatus.find((step) => step.completed) ?? mlvDemoStatus[0];
  const activeWorkspaceLabel = activeMlvStep?.label
    ?? activePlan?.templateId?.replaceAll('-', ' ')
    ?? currentMlvStep.label;
  const activeWorkspaceOutcome = activeMlvStep?.outcome
    ?? result.answer.headline
    ?? 'Governed freeform turn assembled from the active ExperiencePlan.';
  const currentMlvRenderedViews = workspaceOrchestration.viewContinuity.renderedViewIds;
  const currentMlvExpectedViews = workspaceOrchestration.viewContinuity.expectedViewIds;
  const currentMlvProofCounts = workspaceOrchestration.proofContinuity;
  const currentTurnRequiredGateCount = result.confirmationGates.filter((gate) => gate.status === 'required').length;
  const currentTurnArtifactCount = activePlan?.artifacts.length ?? 0;
  const currentTurnMemoryCount = result.memory.length;
  const currentMlvReviewText = [
    currentTurnRequiredGateCount ? countLabel(currentTurnRequiredGateCount, 'turn gate') : null,
    currentTurnArtifactCount ? countLabel(currentTurnArtifactCount, 'artifact') : null,
    currentTurnMemoryCount ? countLabel(currentTurnMemoryCount, 'memory note') : null
  ].filter(Boolean).join(' · ') || 'session queue visible';
  const runtimeEventTypes = new Set(runtimeEvents.map((event) => event.type));
  const liveQueuedViews = runtimeEvents.filter((event) => event.type === 'view_queued');
  const liveArtifacts = runtimeEvents.filter((event) => event.type === 'artifact_ready');
  const liveGuardrails = runtimeEvents.filter((event) => event.type === 'guardrail_applied');
  const liveStreamStages = [
    {
      id: 'ask',
      label: 'Ask',
      ready: runtimeEventTypes.has('packet_ready') || runtimeEventTypes.has('turn_started'),
      active: isRunning && !runtimeEventTypes.has('skill_routed'),
      detail: runtimeEvents.find((event) => event.type === 'packet_ready')?.detail ?? 'Waiting for packet read.'
    },
    {
      id: 'plan',
      label: 'Plan',
      ready: runtimeEventTypes.has('experience_planned'),
      active: isRunning && runtimeEventTypes.has('skill_routed') && !runtimeEventTypes.has('experience_planned'),
      detail: runtimeEvents.find((event) => event.type === 'experience_planned')?.detail
        ?? runtimeEvents.find((event) => event.type === 'skill_routed')?.detail
        ?? 'Waiting for skill route.'
    },
    {
      id: 'render',
      label: 'Render',
      ready: liveQueuedViews.length > 0,
      active: isRunning && runtimeEventTypes.has('experience_planned') && !runtimeEventTypes.has('evidence_spotlight_ready'),
      detail: liveQueuedViews.length
        ? `${liveQueuedViews.length} approved view${liveQueuedViews.length === 1 ? '' : 's'} queued.`
        : 'Waiting for approved views.'
    },
    {
      id: 'prove',
      label: 'Prove',
      ready: runtimeEventTypes.has('runtime_quality_checked') || runtimeEventTypes.has('evidence_spotlight_ready'),
      active: isRunning && runtimeEventTypes.has('evidence_spotlight_ready') && !runtimeEventTypes.has('runtime_quality_checked'),
      detail: runtimeEvents.find((event) => event.type === 'runtime_quality_checked')?.detail
        ?? runtimeEvents.find((event) => event.type === 'evidence_spotlight_ready')?.detail
        ?? 'Waiting for proof checks.'
    },
    {
      id: 'review',
      label: 'Review',
      ready: runtimeEventTypes.has('memory_suggested') || runtimeEventTypes.has('audit_recorded') || liveArtifacts.length > 0,
      active: isRunning && runtimeEventTypes.has('runtime_quality_checked') && !runtimeEventTypes.has('turn_completed'),
      detail: liveArtifacts.length
        ? `${liveArtifacts.length} artifact${liveArtifacts.length === 1 ? '' : 's'} staged for review.`
        : runtimeEvents.find((event) => event.type === 'memory_suggested')?.detail
          ?? runtimeEvents.find((event) => event.type === 'audit_recorded')?.detail
          ?? 'Waiting for review state.'
    }
  ];
  const activeQuestionText = messages.at(-2)?.role === 'user' ? messages.at(-2)?.text : prompt;
  const conversationalRecapItems = [
    {
      label: 'You asked',
      value: activeQuestionText,
      detail: 'Brand Doctor treats this as the business question to route, not as a request for a fixed report.'
    },
    {
      label: 'It routed',
      value: result.routedSkillId.replaceAll('_', ' '),
      detail: `The skill router selected this from the approved registry; arbitrary skills remain blocked.`
    },
    {
      label: 'It planned',
      value: activePlan?.templateId?.replaceAll('-', ' ') ?? 'fallback workspace',
      detail: `${activePlan?.audience.replaceAll('_', ' ') ?? 'active'} audience · ${activePlan?.objective.replaceAll('_', ' ') ?? 'evidence-bound'} objective · ${activePlan?.layout.replaceAll('_', ' ') ?? 'approved stack'} layout.`
    },
    {
      label: 'It opened',
      value: currentMlvRenderedViews.length ? currentMlvRenderedViews.slice(0, 4).map((viewId) => viewId.replaceAll('_', ' ')).join(' + ') : 'approved views waiting',
      detail: `${currentMlvRenderedViews.length}/${currentMlvExpectedViews.length} approved views rendered; unsupported views fail into gap or review states.`
    },
    {
      label: 'It proved',
      value: `${result.answer.evidence.length} evidence refs · ${result.evidenceSpotlight.length} claim checks`,
      detail: `${result.answer.missingEvidence.length} missing-evidence notes and ${result.answer.guardrailsApplied.length} guardrails stay visible before action.`
    },
    {
      label: 'It held back',
      value: workspaceOrchestration.productionPromotionBlocked ? 'production, export, full voice, and source truth gated' : 'promotion review required',
      detail: `${currentTurnRequiredGateCount} current-turn gates · ${currentTurnArtifactCount} artifacts · ${currentTurnMemoryCount} memory notes remain review-controlled.`
    }
  ];
  const simulationCapabilities = [
    {
      label: 'Direct conversation',
      status: 'ready',
      detail: 'Type a messy business question or use push-to-talk; the runtime can route it through the same skill, packet, proof, and gate stack.'
    },
    {
      label: 'Workspace choice',
      status: 'ready',
      detail: 'The agent can simulate choosing the right report/workspace by returning an ExperiencePlan and approved dynamic views.'
    },
    {
      label: 'Report draft',
      status: activePlan?.artifacts.length ? 'review only' : 'on request',
      detail: 'QBR stories, meeting notes, and briefs can be drafted as human-review artifacts, but export and circulation remain disabled.'
    },
    {
      label: 'Voice behavior',
      status: canUsePushToTalk ? 'prototype' : 'typed only',
      detail: 'Push-to-talk and chained OpenAI voice reply can simulate the conversation loop; Realtime turn-taking, continuous listening, and autonomous speaking stay gated.'
    },
    {
      label: 'Memory and audit',
      status: 'prototype local',
      detail: 'The session can suggest memory, persist audit records, and expose review gates without auto-accepting memory or claiming official approval.'
    },
    {
      label: 'Sexy UI layer',
      status: 'not yet',
      detail: 'We can simulate the decisions, reports, and views first; final Jarvis-style choreography should come after the brain is trusted.'
    }
  ];
  const viewModeLabel = viewMode === 'start'
    ? 'Start'
    : viewMode === 'focus'
      ? 'Focused Run'
      : 'Inspect Foundation';
  const focusFollowUpChips = [
    `Go deeper on the evidence behind this ${activeWorkspaceLabel} for ${activeBrand.brandName}.`,
    `What should the ${activeBrand.brandName} team do next from this workspace?`,
    `What would change this read or make it unsafe to use?`,
    `Turn this into the next best workspace for a ${activePlan?.audience.replaceAll('_', ' ') ?? 'marketer'}.`
  ];
  const visibleWorkOrder = pendingWorkOrder ?? activeWorkOrder;
  const workOrderEvents = pendingWorkOrder ? [] : runtimeEvents;
  const workOrderRuntimeEventTypes = pendingWorkOrder ? new Set<AgentTurnEvent['type']>() : runtimeEventTypes;
  const workOrderQueuedViews = pendingWorkOrder ? [] : liveQueuedViews;
  const workOrderArtifacts = pendingWorkOrder ? [] : liveArtifacts;
  const workOrderTrackerStages = [
    {
      id: 'scope',
      label: 'Scope',
      status: visibleWorkOrder ? 'ready' : 'waiting',
      detail: visibleWorkOrder?.expectation ?? 'Ask a question or choose a use case.'
    },
    {
      id: 'approval',
      label: 'Approval',
      status: pendingWorkOrder ? 'active' : activeWorkOrder ? 'ready' : 'waiting',
      detail: pendingWorkOrder
        ? pendingWorkOrder.approvalReason
        : activeWorkOrder
          ? activeWorkOrder.mode === 'advanced_skill'
            ? 'Approved by the user for this governed run.'
            : 'No approval needed for a quick scoped answer.'
          : 'Advanced work will pause here before execution.'
    },
    {
      id: 'route',
      label: 'Route',
      status: workOrderRuntimeEventTypes.has('skill_routed') ? 'ready' : isRunning ? 'active' : 'waiting',
      detail: workOrderEvents.find((event) => event.type === 'skill_routed')?.detail ?? visibleWorkOrder?.likelySkill ?? 'Waiting for approved skill route.'
    },
    {
      id: 'build',
      label: 'Build',
      status: workOrderQueuedViews.length > 0 || workOrderRuntimeEventTypes.has('experience_planned') ? 'ready' : isRunning && workOrderRuntimeEventTypes.has('skill_routed') ? 'active' : 'waiting',
      detail: workOrderQueuedViews.length
        ? `${workOrderQueuedViews.length} approved view${workOrderQueuedViews.length === 1 ? '' : 's'} queued.`
        : workOrderEvents.find((event) => event.type === 'experience_planned')?.detail ?? visibleWorkOrder?.deliverable ?? 'Waiting for workspace plan.'
    },
    {
      id: 'prove',
      label: 'Prove',
      status: workOrderRuntimeEventTypes.has('runtime_quality_checked') || workOrderRuntimeEventTypes.has('evidence_spotlight_ready') ? 'ready' : isRunning && workOrderQueuedViews.length > 0 ? 'active' : 'waiting',
      detail: workOrderEvents.find((event) => event.type === 'runtime_quality_checked')?.detail
        ?? workOrderEvents.find((event) => event.type === 'evidence_spotlight_ready')?.detail
        ?? 'Evidence, guardrails, and missing inputs stay attached.'
    },
    {
      id: 'review',
      label: 'Review',
      status: workOrderRuntimeEventTypes.has('turn_completed') || workOrderArtifacts.length > 0 || workOrderRuntimeEventTypes.has('audit_recorded') ? 'ready' : isRunning && workOrderRuntimeEventTypes.has('runtime_quality_checked') ? 'active' : 'waiting',
      detail: workOrderArtifacts.length
        ? `${workOrderArtifacts.length} artifact${workOrderArtifacts.length === 1 ? '' : 's'} staged for review.`
        : currentMlvReviewText
    }
  ];

  async function runJsonFallback(trimmed: string, nextBrandId: string) {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        brandId: nextBrandId,
        question: trimmed,
        runtimeSurfaceId: 'api-agent-json',
        audienceMode: 'insights_lead',
        sessionId: durableSessionId
      })
    });
    return await response.json() as AgentTurnResult;
  }

  function persistTurn(data: AgentTurnResult) {
    setSessionLedger((current) => {
      const merged = mergeTurnIntoLedger(current, data);
      const persisted = writeBrowserSessionLedger(merged);
      if (persisted.compacted) {
        window.setTimeout(() => setVoiceNote('Browser session history was compacted locally; durable server session state remains active.'), 0);
      }
      return persisted.ledger;
    });
  }

  function applyServerLedger(serverLedger: AgentSessionLedger | undefined) {
    if (!serverLedger?.version) return;
    setSessionLedger((current) => {
      const merged = mergeSessionLedgers(current, serverLedger);
      const persisted = writeBrowserSessionLedger(merged);
      if (persisted.compacted) {
        window.setTimeout(() => setVoiceNote('Browser session history was compacted locally; durable server session state remains active.'), 0);
      }
      return persisted.ledger;
    });
  }

  async function reviewLedgerItem(
    itemType: AgentReviewItemType,
    itemId: string,
    decision: AgentReviewDecision,
    editedLabel?: string,
    editedDetail?: string
  ) {
    if (isRunning) return;
    try {
      const response = await fetch('/api/agent/session-ledger/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: durableSessionId,
          itemType,
          itemId,
          decision,
          note: 'Reviewed in Agent Lab proof rail.',
          editedLabel,
          editedDetail
        })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? 'Review action failed.');
      applyServerLedger(data.session?.ledger);
      setVoiceNote(`Review saved: ${itemType.replaceAll('_', ' ')} ${decision}.`);
    } catch (error) {
      setVoiceNote(error instanceof Error ? error.message : 'Review action failed.');
    }
  }

  function editMemory(recordId: string, currentDetail: string) {
    const editedDetail = window.prompt('Edit suggested memory detail before keeping it for review.', currentDetail);
    if (!editedDetail) return;
    reviewLedgerItem('memory', recordId, 'edited', undefined, editedDetail);
  }

  function editGate(gateId: string, currentReason: string) {
    const editedReason = window.prompt('Edit confirmation gate reason before keeping it for review.', currentReason);
    if (!editedReason) return;
    reviewLedgerItem('confirmation_gate', gateId, 'edited', undefined, editedReason);
  }

  function applyRuntimeEvent(event: AgentTurnEvent) {
    setRuntimeEvents((current) => [...current, event]);
    setVoiceNote(event.detail);
    const spokenStatus = eventToSpokenStatus(event);
    if (spokenStatus && !spokenRuntimeTypesRef.current.has(event.type)) {
      spokenRuntimeTypesRef.current.add(event.type);
      speakAgent(spokenStatus);
    }
    if (event.type === 'skill_routed' || event.type === 'packet_ready') setLabState('routing');
    if (event.type === 'experience_planned' || event.type === 'view_queued') setLabState('rendering');
    if (event.type === 'answer_ready' || event.type === 'artifact_ready') setLabState('speaking');
  }

  async function runStreamingTurn(trimmed: string, nextBrandId: string, signal: AbortSignal) {
    const response = await fetch('/api/agent/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({
        brandId: nextBrandId,
        question: trimmed,
        runtimeSurfaceId: 'api-agent-stream',
        audienceMode: 'insights_lead',
        sessionId: durableSessionId
      })
    });
    if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
      throw new Error('Streaming agent endpoint unavailable.');
    }

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
        const data = JSON.parse(dataLine.slice(6));
        if (eventName === 'turn_result') finalResult = data as AgentTurnResult;
        else if (eventName !== 'turn_metadata') {
          applyRuntimeEvent(data as AgentTurnEvent);
          await wait(STREAM_EVENT_PACE_MS);
        }
      }
    }
    if (!finalResult) throw new Error('Streaming turn finished without a final result.');
    return finalResult;
  }

  async function runConversationTurn(trimmed: string, nextBrandId: string, signal: AbortSignal) {
    const response = await fetch('/api/agent/conversation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal,
      body: JSON.stringify({
        brandId: nextBrandId,
        question: trimmed,
        runtimeSurfaceId: 'agent-lab-conversation',
        audienceMode: 'insights_lead',
        sessionId: durableSessionId
      })
    });
    if (!response.ok) throw new Error('Conversation orchestrator endpoint unavailable.');
    return await response.json() as ConversationOrchestratorResult;
  }

  async function run(nextPrompt = prompt, nextBrandId = brandId, approvedWorkOrder: WorkOrderPlan | null = null) {
    const trimmed = nextPrompt.trim();
    if (!trimmed || isRunning) return;
    isRunningRef.current = true;
    const abortController = new AbortController();
    activeTurnAbortController.current = abortController;
    setIsRunning(true);
    setPendingWorkOrder(null);
    setActiveWorkOrder(approvedWorkOrder);
    setLabState('routing');
    setRuntimeEvents([]);
    spokenRuntimeTypesRef.current.clear();
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    try {
      if (approvedWorkOrder?.mode === 'quick_answer') {
        setLabState('speaking');
        const conversation = await runConversationTurn(trimmed, nextBrandId, abortController.signal);
        const data = conversation.turn;
        setResult(data);
        setRuntimeEvents(data.events);
        persistTurn(data);
        setMessages((current) => [...current, {
          role: 'agent',
          text: composedAnswerToMessage(conversation),
          skillId: data.routedSkillId
        }]);
        setViewMode('focus');
        setVoiceNote(conversation.decision.reason);
        speakAgent(conversation.composedAnswer.spokenSummary, { interrupt: false, onDone: startFollowUpListen });
        window.setTimeout(() => setLabState('ready'), 1000);
        return;
      }

      const data = await runStreamingTurn(trimmed, nextBrandId, abortController.signal);
      setLabState('rendering');
      await wait(220);
      setResult(data);
      setRuntimeEvents(data.events);
      persistTurn(data);
      setMessages((current) => [...current, { role: 'agent', text: answerToPlainText(data), skillId: data.routedSkillId }]);
      setViewMode('focus');
      setLabState('speaking');
      speakAgent(`Done. ${shortSpeechSummary(data.answer.headline, data.answer.answer)}`, { interrupt: false, onDone: startFollowUpListen });
      window.setTimeout(() => setLabState('ready'), 1600);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setInterruptedTurnCount((current) => current + 1);
        setVoiceNote('Turn interrupted. The last completed governed canvas remains visible; no partial output was saved.');
        setMessages((current) => [...current, {
          role: 'agent',
          text: 'Interrupted before completion. The previous canvas, evidence, memory, and gates remain the source of truth.',
          skillId: 'interruption_recovery'
        }]);
        speakAgent('I stopped that run. The last completed workspace remains the source of truth.', { interrupt: true });
        setLabState('ready');
        return;
      }
      try {
        const data = await runJsonFallback(trimmed, nextBrandId);
        setResult(data);
        setRuntimeEvents(data.events);
        persistTurn(data);
        setMessages((current) => [...current, { role: 'agent', text: answerToPlainText(data), skillId: data.routedSkillId }]);
        setViewMode('focus');
        setVoiceNote('Streaming was unavailable, so the command center used the reliable JSON agent fallback.');
        speakAgent(`Streaming was unavailable, so I used the reliable fallback. Done. ${shortSpeechSummary(data.answer.headline, data.answer.answer)}`, { interrupt: true, onDone: startFollowUpListen });
        setLabState('ready');
      } catch {
        setVoiceNote('The agent endpoint did not respond. The current packet and last rendered views remain available.');
        speakAgent('The agent endpoint did not respond. The current packet and last rendered views remain available.', { interrupt: true });
        setLabState('ready');
      }
    } finally {
      setVoiceTurnState('idle');
      isRunningRef.current = false;
      setIsRunning(false);
      if (activeTurnAbortController.current === abortController) activeTurnAbortController.current = null;
    }
  }

  function submitPromptForApproval(nextPrompt = prompt, nextBrandId = brandId) {
    const trimmed = nextPrompt.trim();
    if (!trimmed || isRunning) return;
    const nextBrand = brandOptions.find((brand) => brand.brandId === nextBrandId) ?? activeBrand;
    const plan = inferWorkOrderPlan(trimmed, nextBrand);
    setPrompt(trimmed);
    if (plan.mode === 'advanced_skill') {
      setPendingWorkOrder(plan);
      setActiveWorkOrder(null);
      setViewMode('start');
      setVoiceNote(plan.expectation);
      speakAgent(`Let me look into that. This looks like it needs a workspace, so I will wait for your approval before I build it.`, { interrupt: true });
      return;
    }
    setVoiceNote(`Looking into ${nextBrand.brandName} with the current session context.`);
    run(trimmed, nextBrandId, plan);
  }

  function approveWorkOrder(plan: WorkOrderPlan) {
    if (isRunning) return;
    setPrompt(plan.prompt);
    setVoiceNote(`Approved. I am starting the ${plan.label.toLowerCase()} and will keep the tracker updated.`);
    speakAgent(`Approved. I am starting the ${plan.label.toLowerCase()} and will keep you updated.`, { interrupt: true });
    run(plan.prompt, plan.brandId, plan);
  }

  function cancelWorkOrder() {
    if (isRunning) return;
    setPendingWorkOrder(null);
    setVoiceNote('Work order cancelled. You can ask for a quick answer or revise the request before running an advanced skill.');
    speakAgent('Work order cancelled. You can revise the ask before running advanced work.', { interrupt: true });
    window.setTimeout(focusPromptInput, 0);
  }

  function interruptTurn() {
    if (!isRunning || !activeTurnAbortController.current) return;
    activeTurnAbortController.current.abort();
  }

  function startVoicePrompt(options: { followUp?: boolean } = {}) {
    if (isRunningRef.current || activeVoiceRecognitionRef.current) return;
    clearFollowUpRestart();
    const focusTypedFallback = () => {
      window.setTimeout(focusPromptInput, 0);
    };
    if (!canUsePushToTalk) {
      setVoiceTurnState('unsupported');
      setVoiceNote('Push-to-talk is disabled by the active voice policy. Use the typed command path.');
      focusTypedFallback();
      return;
    }

    const SpeechRecognition = (window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).SpeechRecognition ?? (window as unknown as {
      webkitSpeechRecognition?: new () => VoiceRecognition;
    }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceTurnState('unsupported');
      setBrowserSpeechSupported(false);
      setVoiceNote('Browser voice capture is not available in this session. Type a prompt and press Run; the same governed stream, views, evidence, memory, audit, and gates will still assemble.');
      focusTypedFallback();
      return;
    }

    setBrowserSpeechSupported(true);
    setVoiceConsentAcknowledged(true);
    const recognition = new SpeechRecognition();
    activeVoiceRecognitionRef.current = recognition;
    let transcriptCaptured = false;
    let recognitionFailed = false;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setLabState('listening');
      setVoiceTurnState('listening');
      setVoiceNote(options.followUp
        ? 'Hands-Free is listening. I will keep the same brand, session context, memory, evidence, and gates attached.'
        : 'Listening. Ask naturally; I will keep the same governed context, evidence, memory, and gates attached.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        transcriptCaptured = true;
        activeVoiceRecognitionRef.current = null;
        setVoiceTurnState('captured');
        setPrompt(transcript);
        setVoiceNote(options.followUp
          ? 'Captured your turn. Staying in this session context.'
          : `Captured voice turn. Routing through ${result.voicePolicy.runtimeEventSource}.`);
        submitPromptForApproval(transcript);
      }
    };
    recognition.onerror = (event) => {
      recognitionFailed = true;
      activeVoiceRecognitionRef.current = null;
      const error = event?.error ?? 'unknown';
      if (options.followUp && voiceFollowUpEnabledRef.current && error === 'no-speech') {
        setVoiceTurnState('idle');
        setLabState('ready');
        setVoiceNote('Still listening. I did not catch that turn yet.');
        scheduleFollowUpListen(650);
        return;
      }
      setVoiceTurnState('error');
      if (error === 'not-allowed' || error === 'service-not-allowed') setBrowserSpeechSupported(false);
      const reason = event?.error ? ` (${event.error})` : '';
      setVoiceNote(`Voice capture failed${reason} or microphone permission was not granted. Type a prompt and press Run; the governed command path is still ready.`);
      setLabState('ready');
      focusTypedFallback();
    };
    recognition.onend = () => {
      if (activeVoiceRecognitionRef.current === recognition) activeVoiceRecognitionRef.current = null;
      if (!transcriptCaptured && !recognitionFailed) {
        if (options.followUp && voiceFollowUpEnabledRef.current) {
          setVoiceNote('Listening is still open. I will keep the hands-free loop ready.');
          setVoiceTurnState('idle');
          setLabState('ready');
          scheduleFollowUpListen(650);
          return;
        }
        setVoiceNote(options.followUp
          ? 'I did not catch that turn. Hands-Free is still ready; type or turn it off if you want to pause.'
          : 'No voice transcript was captured. Type a prompt and press Run; the same governed stream will assemble the workspace.');
        focusTypedFallback();
        setVoiceTurnState('idle');
        setLabState('ready');
      }
    };
    try {
      recognition.start();
    } catch (error) {
      activeVoiceRecognitionRef.current = null;
      setVoiceTurnState('error');
      setBrowserSpeechSupported(false);
      setVoiceNote(error instanceof Error
        ? `Voice capture could not start: ${error.message}. Type a prompt and press Run; the governed command path is still ready.`
        : 'Voice capture could not start. Type a prompt and press Run; the governed command path is still ready.');
      setLabState('ready');
      focusTypedFallback();
    }
  }

  const orchestrationSteps = [
    { label: 'Voice turn', icon: Radio, active: ['listening', 'routing', 'rendering', 'speaking'].includes(labState) },
    { label: 'Route skill', icon: Route, active: ['routing', 'rendering', 'speaking'].includes(labState) },
    { label: 'Read packet', icon: Database, active: ['routing', 'rendering', 'speaking'].includes(labState) },
    { label: 'Assemble views', icon: Cpu, active: ['rendering', 'speaking'].includes(labState) },
    { label: 'Brief', icon: Activity, active: labState === 'speaking' }
  ];

  function selectBrand(nextBrandId: string) {
    setBrandId(nextBrandId);
    const nextBrand = brandOptions.find((brand) => brand.brandId === nextBrandId);
    const nextPrompt = nextBrand
      ? `Give me the strongest BGS meeting prep read for ${nextBrand.brandName}.`
      : prompt;
    setPrompt(nextPrompt);
    run(nextPrompt, nextBrandId);
  }

  function loadPilotStep(step: PilotRunbookStep) {
    setViewMode('start');
    setPrompt(step.prompt(activeBrand));
  }

  function runPilotStep(step: PilotRunbookStep) {
    const nextPrompt = step.prompt(activeBrand);
    const plan = inferWorkOrderPlan(nextPrompt, activeBrand);
    setPrompt(nextPrompt);
    run(nextPrompt, activeBrand.brandId, plan);
  }

  function loadMlvStep(step: MlvDemoStep) {
    setViewMode('start');
    setPrompt(step.prompt(activeBrand));
  }

  function runMlvStep(step: MlvDemoStep) {
    const nextPrompt = step.prompt(activeBrand);
    const plan = inferWorkOrderPlan(nextPrompt, activeBrand);
    setPrompt(nextPrompt);
    run(nextPrompt, activeBrand.brandId, plan);
  }

  function startCleanMlvCheckpoint() {
    if (isRunning) return;
    const nextSessionId = createDurableSessionId();
    const freshLedger = emptySessionLedger();
    window.localStorage.setItem(AGENT_LAB_DURABLE_SESSION_KEY, nextSessionId);
    window.localStorage.removeItem(AGENT_SESSION_LEDGER_STORAGE_KEY);
    writeBrowserSessionLedger(freshLedger);
    setDurableSessionId(nextSessionId);
    setSessionLedger(freshLedger);
    setRuntimeEvents([]);
    setMessages([]);
    setMlvScores({});
    setInterruptedTurnCount(0);
    setPendingWorkOrder(null);
    setActiveWorkOrder(null);
    setViewMode('start');
    setLabState('ready');
    setVoiceTurnState('idle');
    setPrompt(mlvDemoSteps[0].prompt(activeBrand));
    setVoiceNote('Clean MLV checkpoint started. Session history is fresh for scoring; canonical data and governance gates were not changed.');
    window.setTimeout(focusPromptInput, 0);
  }

  function startNewAsk() {
    if (isRunning) return;
    setPendingWorkOrder(null);
    setActiveWorkOrder(null);
    setViewMode('start');
    setPrompt(`What should we understand next about ${activeBrand.brandName}?`);
    window.setTimeout(focusPromptInput, 0);
  }

  return (
    <main className={`agent-lab-page jarvis-state-${labState}`}>
      <header className="agent-lab-hero">
        <div>
          <div className="section-kicker"><Sparkles size={14} /> Agent Lab</div>
          <h1>Brand Growth Command Center</h1>
          <p>Voice-style orchestration, governed skill routing, approved dynamic views, visible evidence, and explicit gaps beside the stable Brand Doctor report.</p>
        </div>
        <nav className="conversation-actions" aria-label="Agent lab navigation">
          <a href="/"><Home size={15} /> Home</a>
          <a href="/brands"><Search size={15} /> Brands</a>
          <a href="/portfolio"><Network size={15} /> Portfolio</a>
          <a href={`/brand/${brandId}/report`}><ClipboardList size={15} /> Report</a>
          <a href={`/brand/${brandId}/data`}><Database size={15} /> Data</a>
          <a href="/learn"><BookOpen size={15} /> Learn</a>
        </nav>
      </header>

      <section className="agent-mode-switcher" aria-label="Agent Lab mode">
        <div>
          <span>Current mode</span>
          <strong>{viewModeLabel}</strong>
          <p>{viewMode === 'start'
            ? 'Choose a use case or ask a new question. Run lands in a focused workspace.'
            : viewMode === 'focus'
              ? 'Stay with the original ask, inspect the created work, and continue the conversation in context.'
              : 'Inspect the full foundation, source, voice, memory, audit, and governance machinery.'}</p>
        </div>
        <div>
          <button className={viewMode === 'start' ? 'active' : ''} type="button" onClick={() => setViewMode('start')}>Start</button>
          <button className={viewMode === 'focus' ? 'active' : ''} type="button" onClick={() => setViewMode('focus')}>Focused Run</button>
          <button className={viewMode === 'inspect' ? 'active' : ''} type="button" onClick={() => setViewMode('inspect')}>Inspect Foundation</button>
        </div>
      </section>

      <section className="jarvis-command-deck" aria-label="Brand Doctor command deck">
        <div className="jarvis-core-panel">
          <div className="jarvis-input-hub" aria-label="Talk or type to Brand Doctor">
            <div className="jarvis-input-hub-head">
              <span><MessageSquareText size={13} /> Talk or type</span>
              <em>same governed agent</em>
            </div>
            <button className="jarvis-wake-button" type="button" onClick={() => startVoicePrompt()} disabled={isRunning}>
              <Mic size={21} />
              <span>
                {browserSpeechSupported === false
                  ? 'Type Instead'
                  : voiceTurnState === 'listening'
                  ? 'Listening'
                  : voiceTurnState === 'captured'
                    ? 'Captured'
                    : 'Push To Talk'}
              </span>
            </button>
            <form className="jarvis-type-form" onSubmit={(event) => { event.preventDefault(); submitPromptForApproval(); }}>
              <input
                ref={topPromptInputRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={isRunning}
                aria-label="Type a Brand Doctor prompt"
              />
              <button type="submit" disabled={isRunning}>
                <Send size={15} /> Send
              </button>
            </form>
            <div className="jarvis-voice-output-row">
              <button
                className={`jarvis-voice-reply-toggle ${voiceReplyEnabled ? 'active' : ''}`}
                type="button"
                onClick={toggleVoiceReply}
                disabled={voiceOutputState === 'unsupported'}
              >
                {voiceReplyEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{voiceOutputState === 'unsupported'
                  ? 'Voice Reply Unavailable'
                  : voiceOutputState === 'error'
                    ? 'Voice Reply Blocked'
                    : voiceReplyEnabled ? 'Voice Reply On' : 'Voice Reply Off'}</span>
              </button>
              <button className="jarvis-voice-test-button" type="button" onClick={testVoiceReply} disabled={voiceOutputState === 'unsupported'}>
                Test
              </button>
              <button
                className={`jarvis-follow-up-toggle ${voiceFollowUpEnabled ? 'active' : ''}`}
                type="button"
                onClick={toggleVoiceFollowUp}
                disabled={isRunning}
              >
                <Radio size={15} />
                <span>{voiceFollowUpEnabled ? 'Hands-Free On' : 'Hands-Free Off'}</span>
              </button>
            </div>
          </div>
          <div className="jarvis-core" aria-label="Active intelligence core">
            <div className="jarvis-ring outer" />
            <div className="jarvis-ring middle" />
            <div className="jarvis-ring inner" />
            <div className="jarvis-core-readout">
              <span>{labState}</span>
              <strong>{result.packet.brand.brandName}</strong>
              <p>{result.routedSkillId.replaceAll('_', ' ')}</p>
            </div>
          </div>
          <p>{voiceNote}</p>
          <div className="agent-voice-strip" aria-label="Voice policy state">
            <span>{voiceModeLabel}</span>
            <span>{browserSpeechSupported === false ? 'browser stt unavailable' : browserSpeechSupported === true ? 'browser stt available' : 'checking stt'}</span>
            <span>{result.conversationPresenceManifest.mode.replaceAll('_', ' ')}</span>
            <span>voice reply {voiceOutputState}</span>
            <span>hands-free {voiceFollowUpEnabled ? 'on' : 'off'}</span>
            <span>{voiceConsentAcknowledged ? 'consent acknowledged' : result.voicePolicy.consentRequired ? 'consent required' : 'consent optional'}</span>
            <span>{continuousVoiceDisabled ? 'continuous disabled' : 'continuous enabled'}</span>
          </div>
        </div>

        <div className="jarvis-orchestration">
          <div className="jarvis-orchestration-head">
            <Activity size={16} />
            <span>Orchestration bus</span>
          </div>
          <div className="jarvis-step-row">
            {orchestrationSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article className={step.active ? 'active' : ''} key={step.label}>
                  <Icon size={16} />
                  <span>{step.label}</span>
                </article>
              );
            })}
          </div>
          <div className="jarvis-module-queue" aria-label="Approved module queue">
            {(isRunning ? runtimeEvents.filter((event) => event.type === 'view_queued') : []).map((event, index) => (
              <span key={event.id}>{String(index + 1).padStart(2, '0')} · {(event.viewId ?? 'view').replaceAll('_', ' ')}</span>
            ))}
            {!isRunning && activeZones.map((zone, index) => (
              <span key={`${zone.id}-${zone.viewId}`}>{String(index + 1).padStart(2, '0')} · {zone.viewId.replaceAll('_', ' ')}</span>
            ))}
          </div>
        </div>

        <div className="jarvis-live-read">
          <div>
            <Eye size={16} />
            <span>Active read</span>
          </div>
          <strong>{result.answer.headline}</strong>
          <p>{activeZones.length} approved view modules queued · {result.answer.missingEvidence.length} evidence gaps visible</p>
          <div className="jarvis-stat-grid">
            <article>
              <span>Skill</span>
              <strong>{result.routedSkillId.replaceAll('_', ' ')}</strong>
            </article>
            <article>
              <span>Evidence refs</span>
              <strong>{result.answer.evidence.length}</strong>
            </article>
            <article>
              <span>Gaps</span>
              <strong>{result.answer.missingEvidence.length}</strong>
            </article>
            <article>
              <span>Events</span>
              <strong>{runtimeEvents.length}</strong>
            </article>
            <article>
              <span>Runtime map</span>
              <strong>{runtimeSurfaceSummary.ready + runtimeSurfaceSummary.optIn}/{runtimeSurfaceRegistry.surfaces.length}</strong>
            </article>
          </div>
        </div>
      </section>

      {viewMode !== 'focus' && <section className="agent-mlv-demo" aria-label="Minimum lovable demo path">
        <div className="agent-mlv-demo-head">
          <div>
            <span><Zap size={13} /> Minimum Lovable Path</span>
            <h2>{activeBrand.brandName}: ask, assemble, prove, decide</h2>
            <p>{mlvCompletedCount}/{mlvDemoSteps.length} end-to-end use cases run in this session. The runtime underneath is still governed by approved ExperiencePlans, views, evidence, and review gates.</p>
          </div>
          <div>
            <strong>{promotionGateSummary.executiveDemoReady ? 'executive demo ready' : 'pilot proof building'}</strong>
            <em>{promotionGateSummary.productionReady ? 'production ready' : 'production gated'}</em>
            <button type="button" disabled={isRunning} onClick={startCleanMlvCheckpoint}>
              <Square size={13} /> Clean Checkpoint
            </button>
          </div>
        </div>
        <div className="agent-mlv-step-grid">
          {mlvDemoStatus.map((step, index) => (
            <article className={[step.active ? 'active' : '', step.completed ? 'complete' : ''].filter(Boolean).join(' ')} key={step.id}>
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
              </div>
              <p>{step.outcome}</p>
              <em>{step.completed ? `run ${step.turnCount}x` : 'ready to run'} · {step.expectedTemplateId.replaceAll('-', ' ')}</em>
              <div className="agent-mlv-view-list">
                {(step.completed ? step.renderedViewIds : step.expectedViewIds).slice(0, 5).map((viewId) => (
                  <small key={viewId}>{viewId.replaceAll('_', ' ')}</small>
                ))}
              </div>
              <div>
                <button type="button" disabled={isRunning} onClick={() => loadMlvStep(step)}><Route size={13} /> Load</button>
                <button type="button" disabled={isRunning} onClick={() => runMlvStep(step)}><Play size={13} /> Run</button>
              </div>
            </article>
          ))}
        </div>
        <div className="agent-mlv-scorecard" aria-label="MLV checkpoint scorecard">
          <div className="agent-mlv-scorecard-head">
            <div>
              <span><ShieldAlert size={13} /> Checkpoint Scorecard</span>
              <h3>{mlvScoreComplete ? 'acceptance score captured' : 'score after the four-step checkpoint'}</h3>
              <p>Local-only scoring for the human acceptance gate. It does not approve production, export, source truth, full voice, or any blocked capability.</p>
            </div>
            <div>
              <strong>{mlvScoreAverage}</strong>
              <em>{mlvScoreValues.length}/{mlvScoreDimensions.length} scored</em>
            </div>
          </div>
          <div className="agent-mlv-score-grid">
            {mlvScoreDimensions.map((dimension) => (
              <article key={dimension.id}>
                <div>
                  <strong>{dimension.label}</strong>
                  <p>{dimension.description}</p>
                </div>
                <div className="agent-mlv-score-buttons" aria-label={`${dimension.label} score`}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      className={mlvScores[dimension.id] === score ? 'selected' : ''}
                      key={score}
                      type="button"
                      onClick={() => setMlvScores((current) => ({ ...current, [dimension.id]: score }))}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>}

      {viewMode !== 'start' && <section className="agent-conversation-sim" aria-label="Conversational orchestration simulation">
        <div className="agent-conversation-sim-head">
          <div>
            <span><MessageSquareText size={13} /> Conversational Simulation</span>
            <h2>What Brand Doctor just did</h2>
            <p>This is the plain-English layer for testing orchestration before the final Jarvis-style UI. It explains the route, workspace, views, proof, and gates behind the current answer.</p>
          </div>
          <div>
            <strong>{activePlan?.templateId?.replaceAll('-', ' ') ?? result.routedSkillId.replaceAll('_', ' ')}</strong>
            <em>{workspaceOrchestration.productionPromotionBlocked ? 'safe to simulate, not promote' : 'promotion review required'}</em>
          </div>
        </div>
        <div className="agent-conversation-recap-grid">
          {conversationalRecapItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="agent-simulation-depth">
          <div>
            <span><Sparkles size={13} /> How far we can simulate now</span>
            <p>Use this layer to test dynamic reports, views, voice-style turns, memory, proof, and review behavior before investing in the final visual experience.</p>
          </div>
          <div className="agent-simulation-depth-grid">
            {simulationCapabilities.map((item) => (
              <article key={item.label}>
                <strong>{item.label}</strong>
                <em>{item.status}</em>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>}

      {viewMode === 'inspect' && <section className="agent-mission-control" aria-label="Governed mission control">
        <div className="agent-mission-control-head">
          <span><ShieldAlert size={13} /> Governed Foundation State</span>
          <strong>{promotionGateSummary.promotionDecision.replaceAll('_', ' ')}</strong>
          <em>{promotionGateSummary.recommendedAsk.replaceAll('_', ' ')}</em>
        </div>
        <div className="agent-mission-control-grid">
          {missionControlTiles.map((tile) => (
            <article className={`mission-${tile.state}`} key={tile.id}>
              <span>{tile.label}</span>
              <strong>{tile.value}</strong>
              <em>{tile.detail}</em>
            </article>
          ))}
        </div>
      </section>}

      {viewMode === 'inspect' && <section className="agent-foundation-audit" aria-label="Foundation layer audit">
        <div className="agent-foundation-audit-head">
          <div>
            <span><Database size={13} /> Bottom-Up Foundation Audit</span>
            <h2>{foundationLayerAudit.verdict}</h2>
            <p>{foundationLayerAudit.pocReadyLayerCount}/{foundationLayerAudit.layers.length} layers are solid or POC-ready; {foundationLayerAudit.solidLayerCount} are solid; {foundationLayerAudit.gatedLayerText} gated or source-dependent.</p>
          </div>
          <div>
            <strong>{foundationLayerAudit.productionLabel}</strong>
            <em>{foundationLayerAudit.experienceGap}</em>
          </div>
        </div>
        <div className="agent-foundation-layer-grid">
          {foundationLayerAudit.layers.map((layer) => (
            <article className={`layer-${layer.status}`} key={layer.id}>
              <div>
                <span>{layer.label}</span>
                <strong>{layer.status.replaceAll('_', ' ')}</strong>
              </div>
              <p>{layer.proof}</p>
              <em>{layer.testedBy}</em>
              <small>{layer.next}</small>
            </article>
          ))}
        </div>
      </section>}

      {viewMode === 'inspect' && <section className="agent-workspace-choreography" aria-label="Workspace choreography">
        <div className="agent-workspace-choreography-head">
          <div>
            <span><Route size={13} /> Workspace Choreography</span>
            <h2>{workspaceOrchestration.statusLine}</h2>
            <p>{workspaceOrchestration.nextBestAction}</p>
          </div>
          <div>
            <strong>{workspaceOrchestration.governedRuntimeIntact ? 'runtime intact' : 'runtime watch'}</strong>
            <em>{workspaceOrchestration.productionPromotionBlocked ? 'production promotion blocked' : 'promotion review required'}</em>
          </div>
        </div>
        <div className="workspace-phase-grid">
          {workspaceOrchestration.phases.map((phase) => (
            <article className={`phase-${phase.status}`} key={phase.id}>
              <span>{phase.label}</span>
              <strong>{phase.status}</strong>
              <em>{phase.detail}</em>
            </article>
          ))}
        </div>
        <div className="workspace-continuity-grid">
          <article>
            <span><Cpu size={13} /> View Continuity</span>
            <strong>{workspaceOrchestration.viewContinuity.renderedViewIds.length}/{workspaceOrchestration.viewContinuity.expectedViewIds.length} rendered</strong>
            <p>{workspaceOrchestration.viewContinuity.approvedViewContinuity ? 'Approved registry views only; arbitrary UI remains blocked.' : 'Inspect missing or unknown view state before promotion.'}</p>
            <div>
              {workspaceOrchestration.viewContinuity.renderedViewIds.slice(0, 6).map((viewId) => (
                <em key={viewId}>{viewId.replaceAll('_', ' ')}</em>
              ))}
            </div>
          </article>
          <article>
            <span><ShieldAlert size={13} /> Proof Continuity</span>
            <strong>{workspaceOrchestration.proofContinuity.evidenceCount} evidence · {workspaceOrchestration.proofContinuity.spotlightCount} claims</strong>
            <p>{workspaceOrchestration.proofContinuity.proofRailReady ? 'Proof rail is populated for the active canvas.' : 'Proof rail needs evidence, claim spotlight, or guardrail coverage.'}</p>
            <div>
              <em>{workspaceOrchestration.proofContinuity.missingEvidenceCount} gaps</em>
              <em>{workspaceOrchestration.proofContinuity.pendingGateCount} gates</em>
              <em>{workspaceOrchestration.proofContinuity.pendingMemoryCount} memory</em>
              <em>{workspaceOrchestration.proofContinuity.pendingArtifactCount} artifacts</em>
            </div>
          </article>
        </div>
      </section>}

      {viewMode === 'inspect' && <section className="agent-pilot-runbook" aria-label="Executive pilot runbook">
        <div className="agent-pilot-runbook-head">
          <div>
            <span><ClipboardList size={13} /> Executive Pilot</span>
            <h2>Guided Sponsor Sequence</h2>
            <p>{executivePilotSummary.completedSteps}/{executivePilotSummary.totalSteps} steps run · {foundationReadinessSummary.cmoReadinessSignal.replaceAll('_', ' ')} · {foundationReadinessSummary.statusCounts.ready} ready · {foundationReadinessSummary.statusCounts.blocked} gated</p>
            <em>Next: {executivePilotSummary.nextRunbookStep} Export, full voice, canonical writes, autonomous sequence execution, and arbitrary UI remain disabled.</em>
          </div>
          <button type="button" disabled={isRunning} onClick={() => runPilotStep(pilotRunbookSteps[0])}>
            <Play size={15} /> Run Sequence Opener
          </button>
        </div>
        <div className="agent-pilot-step-grid">
          {pilotRunbookSteps.map((step, index) => {
            const active = result.routedSkillId === step.expectedSkillId || activePlan?.templateId === step.expectedTemplateId;
            const persistedStep = executivePilotSummary.steps.find((item) => item.id === step.summaryStepId);
            return (
              <article className={[active ? 'active' : '', persistedStep?.completed ? 'complete' : ''].filter(Boolean).join(' ')} key={step.id}>
                <div>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.label}</strong>
                </div>
                <p>{step.objective}</p>
                <em>{persistedStep?.completed ? `run ${persistedStep.turnCount}x` : 'not run in session'} · {step.expectedSkillId.replaceAll('_', ' ')} · {step.expectedTemplateId.replaceAll('-', ' ')}</em>
                <div>
                  <button type="button" disabled={isRunning} onClick={() => loadPilotStep(step)}><Route size={13} /> Load</button>
                  <button type="button" disabled={isRunning} onClick={() => runPilotStep(step)}><Play size={13} /> Run</button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="agent-pilot-step-grid agent-pilot-proof-grid">
          {executivePilotSummary.demoEvidenceStack.map((item) => (
            <article className={item.status === 'ready' ? 'complete' : ''} key={item.id}>
              <div>
                <span>{item.status === 'ready' ? 'OK' : item.status === 'prototype_ready' ? 'PR' : 'GT'}</span>
                <strong>{item.label}</strong>
              </div>
              <p>{item.proof}</p>
              <em>{item.blockers.length ? item.blockers.map((blocker) => blocker.replaceAll('_', ' ')).join(' · ') : item.relatedViewIds.slice(0, 3).join(' · ')}</em>
            </article>
          ))}
          {executivePilotSummary.fundingAsks.slice(0, 3).map((ask) => (
            <article key={ask.id}>
              <div>
                <span>{ask.priority}</span>
                <strong>{ask.label}</strong>
              </div>
              <p>{ask.rationale}</p>
              <em>Gated until {ask.gatedUntil.slice(0, 3).map((gate) => gate.replaceAll('_', ' ')).join(' · ')}</em>
            </article>
          ))}
        </div>
      </section>}

      {viewMode === 'focus' && <section className="agent-focus-actions" aria-label="Focused run actions">
        <div>
          <span><MessageSquareText size={13} /> Continue This Run</span>
          <h2>{activeWorkspaceLabel}</h2>
          <p>Ask a follow-up inside the same governed session, or return to Start to begin a new workspace. The proof, views, memory suggestions, audit records, and gates remain attached to this run.</p>
        </div>
        <div>
          <button type="button" disabled={isRunning} onClick={focusPromptInput}>
            <Send size={14} /> Ask Follow-Up
          </button>
          <button type="button" disabled={isRunning} onClick={startNewAsk}>
            <Square size={14} /> Start New Ask
          </button>
          <button type="button" disabled={isRunning} onClick={() => setViewMode('inspect')}>
            <ShieldAlert size={14} /> Inspect Proof
          </button>
        </div>
      </section>}

      <section className={`agent-work-order ${pendingWorkOrder ? 'is-pending' : activeWorkOrder ? 'is-active' : ''}`} aria-label="Agent work order and progress tracker">
        <div className="agent-work-order-head">
          <div>
            <span><Clock size={13} /> Work Order Tracker</span>
            <h2>{visibleWorkOrder?.label ?? 'Ask first, then approve heavier work'}</h2>
            <p>{visibleWorkOrder?.expectation ?? 'Quick questions run directly. Requests for reports, dashboards, treatment paths, source checks, or deeper analysis pause here with a clear plan before execution.'}</p>
          </div>
          <div>
            <strong>{pendingWorkOrder ? 'approval needed' : isRunning ? 'working' : activeWorkOrder ? 'last run complete' : 'ready'}</strong>
            <em>{visibleWorkOrder?.deliverable ?? 'Q&A stays fast; advanced skills become visible work.'}</em>
          </div>
        </div>
        <div className="agent-work-order-grid">
          <article className="agent-work-order-plan">
            <span><FileText size={13} /> Scope</span>
            <strong>{visibleWorkOrder?.likelySkill ?? 'Scoped brand answer or approved skill'}</strong>
            <p>{visibleWorkOrder?.approvalReason ?? 'The system will only ask for approval when the request implies multi-step work, artifact creation, evidence review, treatment planning, or dashboard/report assembly.'}</p>
            <div>
              {(visibleWorkOrder?.steps ?? [
                'Answer quick brand questions directly',
                'Pause before advanced skill work',
                'Show progress while views, proof, and review gates assemble'
              ]).map((step, index) => (
                <em key={step}>{String(index + 1).padStart(2, '0')} · {step}</em>
              ))}
            </div>
          </article>
          <div className="agent-work-order-track">
            {workOrderTrackerStages.map((stage) => (
              <article className={`status-${stage.status}`} key={stage.id}>
                <CheckCircle2 size={15} />
                <div>
                  <span>{stage.label}</span>
                  <strong>{stage.status}</strong>
                  <p>{stage.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        {pendingWorkOrder && <div className="agent-work-order-actions">
          <button type="button" disabled={isRunning} onClick={() => approveWorkOrder(pendingWorkOrder)}>
            <Play size={14} /> Approve And Build
          </button>
          <button type="button" disabled={isRunning} onClick={cancelWorkOrder}>
            <Square size={14} /> Revise Ask
          </button>
        </div>}
      </section>

      <section className="agent-command-bar">
        <label>
          <span>Active brand</span>
          <select value={brandId} onChange={(event) => selectBrand(event.target.value)} disabled={isRunning}>
            {brandOptions.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>{brand.brandName} · {brand.category}</option>
            ))}
          </select>
        </label>
        <form onSubmit={(event) => { event.preventDefault(); submitPromptForApproval(); }}>
          <input ref={promptInputRef} value={prompt} onChange={(event) => setPrompt(event.target.value)} disabled={isRunning} />
          <button type="submit" disabled={isRunning}><Send size={16} /> Send</button>
          <button type="button" onClick={interruptTurn} disabled={!isRunning}><Square size={15} /> Stop</button>
        </form>
      </section>

      <div className="agent-prompt-chips">
        {(viewMode === 'focus' ? focusFollowUpChips : promptChips).map((chip) => (
          <button key={chip} type="button" disabled={isRunning} onClick={() => { setPrompt(chip); submitPromptForApproval(chip); }}>
            <Play size={14} /> {chip}
          </button>
        ))}
      </div>

      {viewMode !== 'start' && <section className="agent-mlv-rhythm" aria-label="Current MLV workspace rhythm">
        <div className="agent-mlv-rhythm-head">
          <div>
            <span><Radio size={13} /> Live Workspace Loop</span>
            <h2>{activeWorkspaceLabel}</h2>
            <p>{activeWorkspaceOutcome}</p>
          </div>
          <div>
            <strong>{activePlan?.templateId?.replaceAll('-', ' ') ?? currentMlvStep.expectedTemplateId.replaceAll('-', ' ')}</strong>
            <em>{result.routedSkillId.replaceAll('_', ' ')}</em>
          </div>
        </div>
        <div className="agent-mlv-rhythm-grid">
          <article>
            <span>Ask</span>
            <strong>{labState}</strong>
            <p>{messages.at(-2)?.role === 'user' ? messages.at(-2)?.text : prompt}</p>
          </article>
          <article>
            <span>Plan</span>
            <strong>{activePlan?.layout.replaceAll('_', ' ') ?? 'fallback stack'}</strong>
            <p>{activePlan?.humanReviewRequired ? activePlan.humanApproval.replaceAll('_', ' ') : 'human review posture visible'}</p>
          </article>
          <article>
            <span>Render</span>
            <strong>{currentMlvRenderedViews.length}/{currentMlvExpectedViews.length} views</strong>
            <p>{currentMlvRenderedViews.slice(0, 3).map((viewId) => viewId.replaceAll('_', ' ')).join(' · ') || 'approved view queue waiting'}</p>
          </article>
          <article>
            <span>Prove</span>
            <strong>{currentMlvProofCounts.evidenceCount} evidence · {currentMlvProofCounts.spotlightCount} claims</strong>
            <p>{currentMlvProofCounts.missingEvidenceCount} gaps visible · arbitrary UI blocked</p>
          </article>
          <article>
            <span>Review</span>
            <strong>{currentMlvReviewText}</strong>
            <p>{workspaceOrchestration.productionPromotionBlocked ? 'production promotion blocked' : 'promotion review required'}</p>
          </article>
        </div>
        <div className="agent-stream-sequence" aria-label="Live runtime event sequence">
          {liveStreamStages.map((stage) => (
            <article className={[stage.ready ? 'ready' : '', stage.active ? 'active' : ''].filter(Boolean).join(' ')} key={stage.id}>
              <span>{stage.label}</span>
              <strong>{stage.active ? 'active' : stage.ready ? 'ready' : 'waiting'}</strong>
              <p>{stage.detail}</p>
            </article>
          ))}
        </div>
        <div className="agent-stream-chips" aria-label="Live queued views and guardrails">
          {(isRunning ? liveQueuedViews : currentMlvRenderedViews.map((viewId, index) => ({
            id: `${viewId}-${index}`,
            type: 'view_queued' as const,
            label: viewId.replaceAll('_', ' '),
            detail: 'Approved rendered view.',
            timestamp: '',
            viewId
          }))).slice(0, 6).map((event) => (
            <em key={event.id}>{(event.viewId ?? event.label).replaceAll('_', ' ')}</em>
          ))}
          {liveGuardrails.slice(0, 3).map((event) => (
            <em key={event.id}>{event.guardrail ?? event.label}</em>
          ))}
        </div>
      </section>}

      {viewMode !== 'start' && <section className="agent-lab-grid">
        <aside className="agent-transcript" aria-label="Agent transcript">
          <div className="agent-panel-title">
            <MessageSquareText size={16} />
            <div>
              <h2>Ask</h2>
              <small>{activeWorkspaceLabel}</small>
            </div>
          </div>
          <div className="agent-message-stack">
            {messages.map((message, index) => (
              <article className={message.role} key={`${message.role}-${index}`}>
                <span>{message.role === 'agent' ? message.skillId?.replaceAll('_', ' ') ?? 'agent' : 'you'}</span>
                <p>{message.text}</p>
              </article>
            ))}
            {isRunning && (
              <article className="agent">
                <span>routing</span>
                <p>{runtimeEvents[runtimeEvents.length - 1]?.detail ?? 'Reading packet, choosing a governed skill, and preparing approved views...'}</p>
              </article>
            )}
          </div>
        </aside>

        <section className="agent-canvas" aria-label="Dynamic canvas">
          <div className="agent-canvas-brief">
            <span><Zap size={13} /> Canvas · {activePlan?.templateId?.replaceAll('-', ' ') ?? result.routedSkillId.replaceAll('_', ' ')}</span>
            <h2>{result.answer.headline}</h2>
            <p>{result.answer.answer}</p>
          </div>
          <div className="dynamic-view-stack">
            {activeZones.map((zone) => (
              <DynamicViewRenderer
                key={`${activePlan?.planId ?? result.routedSkillId}-${zone.id}-${zone.viewId}`}
                request={{
                  viewId: zone.viewId,
                  reason: zone.reason,
                  requiredDataAvailable: zone.requiredDataAvailable,
                  fallbackViewId: zone.fallbackViewId
                }}
                packet={result.packet}
                result={result}
              />
            ))}
          </div>
        </section>

        <aside className="agent-evidence-rail" aria-label="Evidence and guardrails">
          <div className="agent-panel-title">
            <ShieldAlert size={16} />
            <div>
              <h2>Proof</h2>
              <small>{currentMlvReviewText}</small>
            </div>
          </div>
          <section>
            <h3>Facts</h3>
            <ul>{result.answer.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
          </section>
          <section>
            <h3>Evidence Used</h3>
            <ul>{result.answer.evidence.map((item) => (
              <li key={`${item.label}-${item.source}`}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
                <em>{item.source}</em>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Claim Spotlight</h3>
            <ul>
              {result.evidenceSpotlight.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <strong>{item.claimType.replaceAll('_', ' ')} · {item.supportStatus.replaceAll('_', ' ')}</strong>
                  <span>{item.claim}</span>
                  <em>
                    {item.evidenceLabels.length
                      ? `Evidence: ${item.evidenceLabels.join(', ')}`
                      : item.missingEvidenceIds.length
                        ? `Gaps: ${item.missingEvidenceIds.join(', ')}`
                        : item.guardrails[0] ?? 'No evidence claim required.'}
                  </em>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Gaps Before Action</h3>
            <ul>{result.answer.missingEvidence.slice(0, 5).map((gap) => (
              <li key={gap.id}>
                <strong>{gap.label}</strong>
                <span>{gap.missingInput}</span>
                <em>{gap.bestNextSource}</em>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Momentum Source Readiness</h3>
            <ul>
              <li>
                <strong>{result.packet.momentumSourceReadiness.status.replaceAll('_', ' ')}</strong>
                <span>{result.packet.momentumSourceReadiness.sourcePath.replaceAll('_', ' ')}</span>
                <em>{result.packet.momentumSourceReadiness.canonicalForExecutiveUse ? 'Approved source-owner blocks loaded; human review still required.' : 'Blocked for executive use until source-owner extracts cover all required blocks.'}</em>
              </li>
              {result.packet.momentumSourceReadiness.checks.map((check) => (
                <li key={check.id}>
                  <strong>{check.label}</strong>
                  <span>{check.status.replaceAll('_', ' ')}</span>
                  <em>{check.detail}</em>
                </li>
              ))}
              {result.packet.momentumSourceReadiness.handoffRequirements.slice(0, 4).map((requirement) => (
                <li key={requirement.id}>
                  <strong>{requirement.label}</strong>
                  <span>{requirement.currentStatus.replaceAll('_', ' ')} · {requirement.sourceOwnerRole}</span>
                  <em>{requirement.nextAction}</em>
                </li>
              ))}
              <li>
                <strong>Runtime file drop</strong>
                <span>{result.packet.momentumRuntimeSourceFileDropReadiness.status.replaceAll('_', ' ')} · consumption {result.packet.momentumRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'}</span>
                <em>{result.packet.momentumRuntimeSourceFileDropReadiness.nextAction}</em>
              </li>
              <li>
                <strong>File-drop audit</strong>
                <span>{result.packet.momentumRuntimeSourceFileDropReadiness.audit.auditMode.replaceAll('_', ' ')} · {result.packet.momentumRuntimeSourceFileDropReadiness.audit.sourceDirectoryExists ? 'directory found' : 'directory missing'}</span>
                <em>{result.packet.momentumRuntimeSourceFileDropReadiness.audit.candidateFileCount} candidate JSON files inspected without runtime consumption.</em>
              </li>
              <li>
                <strong>Required source files</strong>
                <span>{result.packet.momentumRuntimeSourceFileDropReadiness.requiredFileKinds.map((fileKind) => fileKind.replaceAll('_', ' ')).join(' · ')}</span>
                <em>Canonical use {result.packet.momentumRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'enabled' : 'disabled'} · {result.packet.momentumRuntimeSourceFileDropReadiness.expectedSourceDirectory}</em>
              </li>
            </ul>
          </section>
          <section>
            <h3>Source Governance</h3>
            <ul>
              <li>
                <strong>{result.sourceGovernanceManifest.mode.replaceAll('_', ' ')}</strong>
                <span>
                  {result.sourceGovernanceManifest.sourcePromotionCandidateCount} source candidates · {' '}
                  {result.sourceGovernanceManifest.sourceClaimCandidateCount} source claims
                </span>
                <em>{result.sourceGovernanceManifest.nextSourceGovernanceStep}</em>
              </li>
              <li>
                <strong>Canonical writes</strong>
                <span>
                  sources {result.sourceGovernanceManifest.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'} · {' '}
                  claims {result.sourceGovernanceManifest.canonicalClaimFactsEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>Runtime auto-consumption {result.sourceGovernanceManifest.runtimeSourceAutoConsumptionEnabled ? 'enabled' : 'disabled'}.</em>
              </li>
              <li>
                <strong>Runtime file drop</strong>
                <span>
                  {result.sourceGovernanceManifest.runtimeFileDropStatus.replaceAll('_', ' ')} · {' '}
                  {result.sourceGovernanceManifest.runtimeFileDropAuditMode.replaceAll('_', ' ')}
                </span>
                <em>
                  {result.sourceGovernanceManifest.runtimeFileDropCandidateFileCount} candidate files · {' '}
                  {result.sourceGovernanceManifest.missingRuntimeFileKinds.length} required kinds missing.
                </em>
              </li>
              <li>
                <strong>Strategy file drop</strong>
                <span>
                  {result.sourceGovernanceManifest.strategicContextRuntimeFileDropStatus.replaceAll('_', ' ')} · {' '}
                  {result.sourceGovernanceManifest.strategicContextRuntimeFileDropAuditMode.replaceAll('_', ' ')}
                </span>
                <em>
                  {result.sourceGovernanceManifest.strategicContextRuntimeFileDropCandidateFileCount} candidate files · {' '}
                  {result.sourceGovernanceManifest.strategicContextMissingRuntimeFileKinds.length} required kinds missing.
                </em>
              </li>
              <li>
                <strong>Momentum source gate</strong>
                <span>
                  {result.sourceGovernanceManifest.momentumSourceReadinessStatus.replaceAll('_', ' ')} · {' '}
                  {result.sourceGovernanceManifest.momentumSourcePath.replaceAll('_', ' ')}
                </span>
                <em>
                  Executive canonical use {result.sourceGovernanceManifest.momentumCanonicalForExecutiveUse ? 'ready' : 'blocked'}.
                </em>
              </li>
              <li>
                <strong>Disabled capabilities</strong>
                <span>
                  claim promotion {result.sourceGovernanceManifest.sourceClaimPromotionCapabilityEnabled ? 'enabled' : 'disabled'} · {' '}
                  source writes {result.sourceGovernanceManifest.sourceDataWriteCapabilityEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>{result.sourceGovernanceManifest.guardrails[0]}</em>
              </li>
            </ul>
          </section>
          <section className="agent-guardrail-note">
            <h3>Guardrail</h3>
            <p>{result.answer.guardrailsApplied[0]}</p>
            <p>Dynamic UI uses approved registry views only. Unsupported views fail into gap states.</p>
          </section>
          <section>
            <h3>Runtime Quality</h3>
            <ul>
              {result.runtimeQualityChecks.map((check) => (
                <li key={check.id}>
                  <strong>{check.label}</strong>
                  <span>{check.status}</span>
                  <em>{check.detail}</em>
                </li>
              ))}
            </ul>
          </section>
          {activePlan && (
            <section>
              <h3>Experience Plan</h3>
              <ul>
                <li><strong>{activePlan.title}</strong><span>{activePlan.audience} · {activePlan.objective} · {activePlan.layout}</span></li>
                <li><strong>Human review</strong><span>{activePlan.humanReviewRequired ? activePlan.humanApproval.replaceAll('_', ' ') : 'not required'}</span></li>
                <li><strong>Fallbacks</strong><span>{activePlan.fallbackUsed ? 'Gap states active' : 'All zones data-ready'}</span></li>
              </ul>
              <div className="agent-view-manifest">
                {activePlan.viewManifest.slice(0, 5).map((view) => (
                  <article key={view.zoneId}>
                    <strong>{view.viewName}</strong>
                    <span>{view.family.replaceAll('_', ' ')} · {view.dataStatus}</span>
                    <em>{view.reason}</em>
                    <small>
                      Data: {view.requiredData.length ? view.requiredData.join(', ') : 'not required'}
                      {' · '}
                      Rendered: {view.renderedViewId}
                    </small>
                  </article>
                ))}
              </div>
              <div className="agent-artifact-manifest">
                {activePlan.artifacts.map((artifact) => {
                  const readiness = (artifact.governance as typeof artifact.governance & {
                    readiness?: typeof artifact.governance.readiness;
                  }).readiness;
                  return (
                    <article key={artifact.id}>
                      <strong>{artifact.label}</strong>
                      <span>
                        {artifact.type.replaceAll('_', ' ')}
                        {' · '}
                        {artifact.governance.circulationStatus.replaceAll('_', ' ')}
                      </span>
                      <em>
                        Evidence: {artifact.governance.evidenceLabels.length ? artifact.governance.evidenceLabels.slice(0, 3).join(', ') : 'none attached'}
                      </em>
                      <small>
                        Views: {artifact.governance.sourceViewIds.length ? artifact.governance.sourceViewIds.join(', ') : 'none'}
                        {' · '}
                        Export: {artifact.governance.exportEnabled ? 'enabled' : 'disabled'}
                      </small>
                      <small>
                        Readiness: {(readiness?.currentStatus ?? artifact.governance.circulationStatus).replaceAll('_', ' ')}
                        {' · '}
                        Reviewer: {readiness?.reviewerRole ?? 'Human reviewer'}
                      </small>
                      <small>{readiness?.nextAction ?? artifact.governance.caveats[0] ?? 'Review before circulation.'}</small>
                    </article>
                  );
                })}
              </div>
              <details className="agent-plan-json">
                <summary>Inspect plan JSON</summary>
                <pre>{JSON.stringify(activePlan, null, 2)}</pre>
              </details>
            </section>
          )}
          <section>
            <h3>Canvas State</h3>
            <ul>
              <li><strong>{result.canvasStateManifest.mode.replaceAll('_', ' ')}</strong><span>{result.canvasStateManifest.layout.replaceAll('_', ' ')}</span></li>
              <li><strong>Focused view</strong><span>{result.canvasStateManifest.focusedViewId?.replaceAll('_', ' ') ?? 'none'}</span></li>
              <li><strong>Rendered views</strong><span>{result.canvasStateManifest.renderedViewIds.length} approved modules</span></li>
              <li><strong>Artifacts</strong><span>{result.canvasStateManifest.artifactIds.length} mapped</span></li>
              <li><strong>Pending gates</strong><span>{result.canvasStateManifest.pendingGateIds.length} review/export/source gates</span></li>
              <li><strong>Arbitrary UI</strong><span>{result.canvasStateManifest.arbitraryViewIdsAllowed ? 'allowed' : 'blocked'}</span></li>
              <li><strong>Recovery</strong><span>{result.canvasStateManifest.interruptionRecovery.replaceAll('_', ' ')}</span></li>
            </ul>
            <div className="agent-view-manifest">
              {result.canvasStateManifest.renderedViewIds.slice(0, 6).map((viewId, index) => (
                <article key={`${viewId}-${index}`}>
                  <strong>{viewId.replaceAll('_', ' ')}</strong>
                  <span>{result.canvasStateManifest.voiceCompatibleViewIds.includes(viewId) ? 'voice compatible' : 'visual canvas'}</span>
                  <em>{index === 0 ? 'Primary module for the current turn.' : 'Queued governed module.'}</em>
                </article>
              ))}
            </div>
            <p>{result.canvasStateManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Experience Architecture</h3>
            <ul>
              <li><strong>{result.experienceArchitectureManifest.mode.replaceAll('_', ' ')}</strong><span>{result.experienceArchitectureManifest.activeTemplateId ?? 'fallback'}</span></li>
              <li><strong>Registry</strong><span>{result.experienceArchitectureManifest.approvedTemplateCount} templates · {result.experienceArchitectureManifest.approvedSkillCount} skills · {result.experienceArchitectureManifest.approvedViewCount} views</span></li>
              <li><strong>Audience</strong><span>{result.experienceArchitectureManifest.activeAudience?.replaceAll('_', ' ') ?? 'none'} · {result.experienceArchitectureManifest.activeObjective ?? 'none'}</span></li>
              <li><strong>Layout</strong><span>{result.experienceArchitectureManifest.activeLayout.replaceAll('_', ' ')}</span></li>
              <li><strong>Unknown views</strong><span>{result.experienceArchitectureManifest.unknownViewIds.length}</span></li>
              <li><strong>Arbitrary UI</strong><span>{result.experienceArchitectureManifest.arbitraryViewIdsAllowed ? 'allowed' : 'blocked'}</span></li>
              <li><strong>New source claims</strong><span>{result.experienceArchitectureManifest.newSourceClaimGenerationEnabled ? 'enabled' : 'disabled'}</span></li>
            </ul>
            <div className="agent-view-manifest">
              {result.experienceArchitectureManifest.supportedAudiences.map((audience) => (
                <article key={audience}>
                  <strong>{audience.replaceAll('_', ' ')}</strong>
                  <span>supported audience</span>
                  <em>{result.experienceArchitectureManifest.supportedObjectives.slice(0, 4).join(', ')}</em>
                </article>
              ))}
            </div>
            <p>{result.experienceArchitectureManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Interruption Recovery</h3>
            <ul>
              <li><strong>{result.interruptionRecoveryManifest.mode.replaceAll('_', ' ')}</strong><span>{result.interruptionRecoveryManifest.canInterruptCurrentTurn ? 'client interrupt ready' : 'not ready'}</span></li>
              <li><strong>Preserve canvas</strong><span>{result.interruptionRecoveryManifest.preservesLastCompletedCanvas ? 'enabled' : 'disabled'}</span></li>
              <li><strong>Overlapping runs</strong><span>{result.interruptionRecoveryManifest.noOverlappingRuns ? 'blocked' : 'allowed'}</span></li>
              <li><strong>Server cancel</strong><span>{result.interruptionRecoveryManifest.serverSideCancelSupported ? 'enabled' : 'not available'}</span></li>
              <li><strong>Voice barge-in</strong><span>{result.interruptionRecoveryManifest.continuousVoiceBargeInEnabled ? 'enabled' : 'disabled'}</span></li>
              <li><strong>Interrupted turns</strong><span>{interruptedTurnCount}</span></li>
            </ul>
            <div className="agent-view-manifest">
              {result.interruptionRecoveryManifest.suggestedRecoveryPrompts.slice(0, 4).map((suggestion) => (
                <article key={suggestion}>
                  <strong>{suggestion}</strong>
                  <span>typed recovery prompt</span>
                  <em>Routes through governed skill, evidence, memory, audit, and gates.</em>
                </article>
              ))}
            </div>
            <p>{result.interruptionRecoveryManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Status Steps</h3>
            <ul>
              {result.reasoningStatusManifest.steps.map((step) => (
                <li key={step.id}>
                  <strong>{step.label}</strong>
                  <span>{step.phase} · {step.status} · {step.publicOnly ? 'public status' : 'private'}</span>
                  <em>{step.detail}</em>
                </li>
              ))}
            </ul>
            <p>{result.reasoningStatusManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Conversation Presence</h3>
            <ul>
              <li>
                <strong>{result.conversationPresenceManifest.mode.replaceAll('_', ' ')}</strong>
                <span>{labState} · {result.conversationPresenceManifest.consentBoundary.replaceAll('_', ' ')}</span>
                <em>{result.conversationPresenceManifest.guardrails[0]}</em>
              </li>
              <li>
                <strong>Pulse sources</strong>
                <span>{result.conversationPresenceManifest.pulseSources.map((source) => source.replaceAll('_', ' ')).join(', ')}</span>
              </li>
              <li>
                <strong>Visible signals</strong>
                <span>{result.conversationPresenceManifest.visibleSignals.map((signal) => signal.replaceAll('_', ' ')).join(', ')}</span>
              </li>
              <li>
                <strong>Disabled capture</strong>
                <span>
                  continuous {result.conversationPresenceManifest.continuousListeningEnabled ? 'enabled' : 'disabled'}
                  {' · wake word '}
                  {result.conversationPresenceManifest.backgroundWakeWordEnabled ? 'enabled' : 'disabled'}
                  {' · autonomous speech '}
                  {result.conversationPresenceManifest.autonomousSpeakingEnabled ? 'enabled' : 'disabled'}
                </span>
              </li>
              <li>
                <strong>Status-linked states</strong>
                <span>{result.conversationPresenceManifest.currentStatusStepIds.length} public steps · {result.conversationPresenceManifest.stateSequence.join(' -> ')}</span>
              </li>
              <li>
                <strong>Voice canvas</strong>
                <span>{result.conversationPresenceManifest.compatibleViewIds.length ? result.conversationPresenceManifest.compatibleViewIds.join(', ') : 'none'}</span>
              </li>
            </ul>
            <p>{result.conversationPresenceManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Provider Adapters</h3>
            <ul>
              <li>
                <strong>{result.providerAdapterManifest.mode.replaceAll('_', ' ')}</strong>
                <span>
                  {result.providerAdapterManifest.readyAdapterIds.length} ready
                  {' · '}
                  {result.providerAdapterManifest.gatedAdapterIds.length} gated
                  {' · '}
                  {result.providerAdapterManifest.disabledAdapterIds.length} disabled
                </span>
                <em>{result.providerAdapterManifest.guardrails[0]}</em>
              </li>
              {result.providerAdapterManifest.adapters.map((adapter) => (
                <li key={adapter.id}>
                  <strong>{adapter.capability.replaceAll('_', ' ')}</strong>
                  <span>
                    {adapter.status.replaceAll('_', ' ')}
                    {' · '}
                    {adapter.runtimeBoundary.replaceAll('_', ' ')}
                    {' · '}
                    {adapter.providerBinding.replaceAll('_', ' ')}
                  </span>
                  <em>
                    {adapter.endpoint ?? 'no endpoint'}
                    {' · runtime parity: '}
                    {adapter.sharesAgentRuntime ? 'yes' : 'not yet'}
                    {' · evidence/gates: '}
                    {adapter.evidenceAndGateParity ? 'yes' : 'not yet'}
                  </em>
                </li>
              ))}
              <li>
                <strong>Still gated</strong>
                <span>{result.providerAdapterManifest.requiresPolicyReviewFor.map((item) => item.replaceAll('_', ' ')).join(', ')}</span>
                <em>
                  Realtime unified: {result.providerAdapterManifest.serverSideRealtimeConnectedToAgentRuntime ? 'yes' : 'no'}
                  {' · TTS: '}
                  {result.providerAdapterManifest.ttsEnabled ? 'enabled' : 'disabled'}
                </em>
              </li>
            </ul>
            <p>{result.providerAdapterManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Voice Orchestration Gates</h3>
            <ul>
              <li>
                <strong>{result.voiceSkillViewContractManifest.mode.replaceAll('_', ' ')}</strong>
                <span>
                  {result.voiceSkillViewContractManifest.readyModeIds.length} ready modes
                  {' · '}
                  {result.voiceSkillViewContractManifest.gatedModeIds.length} gated
                  {' · '}
                  {result.voiceSkillViewContractManifest.blockedModeIds.length} blocked
                </span>
                <em>{result.voiceSkillViewContractManifest.pushToTalkContractReady ? 'Push-to-talk skill/view contract is ready.' : 'Push-to-talk contract needs review.'}</em>
              </li>
              <li>
                <strong>Active skill</strong>
                <span>{result.voiceSkillViewContractManifest.activeSkillId}</span>
                <em>{result.voiceSkillViewContractManifest.activeSkillVoiceCompatible ? 'Registered for voice orchestration' : 'Outside voice contract'}</em>
              </li>
              <li>
                <strong>Voice canvas views</strong>
                <span>{result.voiceSkillViewContractManifest.activeVoiceCompatibleViewIds.join(', ') || 'none'}</span>
                <em>{result.voiceSkillViewContractManifest.activeIncompatibleViewIds.length ? `Incompatible: ${result.voiceSkillViewContractManifest.activeIncompatibleViewIds.join(', ')}` : 'All active views are voice-compatible.'}</em>
              </li>
              <li>
                <strong>Disabled contracts</strong>
                <span>
                  continuous {result.voiceSkillViewContractManifest.continuousVoiceEnabled ? 'enabled' : 'disabled'}
                  {' · realtime '}
                  {result.voiceSkillViewContractManifest.realtimeVoiceEnabled ? 'enabled' : 'disabled'}
                  {' · TTS '}
                  {result.voiceSkillViewContractManifest.ttsEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>Arbitrary skill routing {result.voiceSkillViewContractManifest.arbitrarySkillRoutingEnabled ? 'enabled' : 'disabled'} · arbitrary UI {result.voiceSkillViewContractManifest.arbitraryViewGenerationEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{result.voiceSkillViewContractManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Voice Promotion Readiness</h3>
            <ul>
              <li>
                <strong>{result.voiceOrchestrationReadinessManifest.mode.replaceAll('_', ' ')}</strong>
                <span>
                  {result.voiceOrchestrationReadinessManifest.readyRequirementIds.length} ready
                  {' · '}
                  {result.voiceOrchestrationReadinessManifest.prototypeRequirementIds.length} prototype
                  {' · '}
                  {result.voiceOrchestrationReadinessManifest.blockedRequirementIds.length} blocked
                </span>
                <em>{result.voiceOrchestrationReadinessManifest.nextPromotionStep}</em>
              </li>
              <li>
                <strong>Full voice</strong>
                <span>
                  realtime {result.voiceOrchestrationReadinessManifest.realtimeVoiceEnabled ? 'enabled' : 'gated'}
                  {' · continuous '}
                  {result.voiceOrchestrationReadinessManifest.continuousVoiceEnabled ? 'enabled' : 'gated'}
                  {' · TTS '}
                  {result.voiceOrchestrationReadinessManifest.ttsEnabled ? 'enabled' : 'gated'}
                </span>
                <em>
                  Runtime parity: {result.voiceOrchestrationReadinessManifest.realtimeRuntimeParity ? 'ready' : 'not yet'}
                </em>
              </li>
              {result.voiceOrchestrationReadinessManifest.requirements.map((requirement) => (
                <li key={requirement.id}>
                  <strong>{requirement.label}</strong>
                  <span>
                    {requirement.status.replaceAll('_', ' ')}
                    {' · '}
                    {requirement.owner}
                  </span>
                  <em>{requirement.blockers[0] ?? requirement.nextAction}</em>
                </li>
              ))}
            </ul>
            <p>{result.voiceOrchestrationReadinessManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Runtime Surface</h3>
            <ul>
              <li>
                <strong>{result.runtimeSurfaceManifest.activeSurfaceName}</strong>
                <span>
                  {result.runtimeSurfaceManifest.activeSurfaceStatus.replaceAll('_', ' ')}
                  {' · '}
                  {result.runtimeSurfaceManifest.activeDefaultState.replaceAll('_', ' ')}
                </span>
                <em>{result.runtimeSurfaceManifest.activeSurfaceId}</em>
              </li>
              <li>
                <strong>Runtime path</strong>
                <span>{result.runtimeSurfaceManifest.activeRuntimePath}</span>
                <em>Proof: {result.runtimeSurfaceManifest.activeProofSurface.replaceAll('_', ' ')}</em>
              </li>
              <li>
                <strong>Transport</strong>
                <span>
                  streaming {result.runtimeSurfaceManifest.activeStreaming ? 'enabled' : 'off'}
                  {' · voice '}
                  {result.runtimeSurfaceManifest.activeVoice.replaceAll('_', ' ')}
                </span>
                <em>Persistence: {result.runtimeSurfaceManifest.activePersistence.replaceAll('_', ' ')}</em>
              </li>
              <li>
                <strong>Surface counts</strong>
                <span>
                  {result.runtimeSurfaceManifest.readySurfaceIds.length} ready
                  {' · '}
                  {result.runtimeSurfaceManifest.optInSurfaceIds.length} opt-in
                  {' · '}
                  {result.runtimeSurfaceManifest.legacySurfaceIds.length} legacy
                  {' · '}
                  {result.runtimeSurfaceManifest.gatedSurfaceIds.length} gated
                  {' · '}
                  {result.runtimeSurfaceManifest.disabledSurfaceIds.length} disabled
                </span>
                <em>Default scoped chat preserved: {result.runtimeSurfaceManifest.defaultScopedChatPreserved ? 'yes' : 'no'}</em>
              </li>
              <li>
                <strong>Gated voice</strong>
                <span>
                  realtime {result.runtimeSurfaceManifest.realtimeVoiceEnabled ? 'enabled' : 'gated'}
                  {' · TTS '}
                  {result.runtimeSurfaceManifest.ttsEnabled ? 'enabled' : 'gated'}
                  {' · continuous '}
                  {result.runtimeSurfaceManifest.continuousVoiceEnabled ? 'enabled' : 'gated'}
                </span>
                <em>{result.runtimeSurfaceManifest.nextSurfaceStep}</em>
              </li>
            </ul>
          </section>
          <section>
            <h3>Runtime Surface Map</h3>
            <ul>
              <li>
                <strong>{runtimeSurfaceRegistry.id}</strong>
                <span>
                  {runtimeSurfaceSummary.governedDefault} governed default
                  {' · '}
                  {runtimeSurfaceSummary.optIn} opt-in
                  {' · '}
                  {runtimeSurfaceSummary.gated} gated
                  {' · '}
                  {runtimeSurfaceSummary.disabled} disabled
                </span>
                <em>{runtimeSurfaceRegistry.principle}</em>
              </li>
            </ul>
            <div className="agent-runtime-surface-grid">
              {runtimeSurfaceRegistry.surfaces.map((surface) => (
                <article className={`runtime-surface-${surface.status}`} key={surface.id}>
                  <strong>{surface.name}</strong>
                  <span>
                    {surface.status.replaceAll('_', ' ')}
                    {' · '}
                    {surface.defaultState.replaceAll('_', ' ')}
                  </span>
                  <em>{surface.route}</em>
                  <small>
                    Runtime: {surface.runtimePath}
                    {' · Proof: '}
                    {surface.proofSurface.replaceAll('_', ' ')}
                    {' · Voice: '}
                    {surface.voice.replaceAll('_', ' ')}
                  </small>
                </article>
              ))}
            </div>
            <p>{runtimeSurfaceRegistry.guardrails[0]}</p>
          </section>
          <section>
            <h3>Runtime Events</h3>
            <ul>{runtimeEvents.slice(-6).map((event) => (
              <li key={event.id}>
                <strong>{event.label}</strong>
                <span>{event.detail}</span>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Working Context</h3>
            <ul>
              <li><strong>Layers</strong><span>{result.workingContextManifest.loadedContextTypes.map((item) => item.replaceAll('_', ' ')).join(', ')}</span></li>
              <li><strong>Accepted memory</strong><span>{result.workingContextManifest.acceptedMemory.length} loaded</span></li>
              <li><strong>Suggested memory</strong><span>{result.workingContextManifest.suggestedMemoryCount} review controlled</span></li>
              <li><strong>Source candidates</strong><span>{result.workingContextManifest.sourcePromotionCandidateIds.length} promotion · {result.workingContextManifest.sourceClaimCandidateIds.length} claims</span></li>
              <li><strong>Auto-accept</strong><span>{result.workingContextManifest.autoAcceptMemoryEnabled ? 'enabled' : 'disabled'}</span></li>
              <li><strong>Canonical writes</strong><span>{result.workingContextManifest.canonicalSourceWriteEnabled || result.workingContextManifest.canonicalClaimWriteEnabled ? 'enabled' : 'disabled'}</span></li>
            </ul>
            <p>{result.workingContextManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Persistence Readiness</h3>
            <ul>
              <li>
                <strong>{result.persistenceReadinessManifest.mode.replaceAll('_', ' ')}</strong>
                <span>
                  {result.persistenceReadinessManifest.readyRequirementIds.length} ready
                  {' · '}
                  {result.persistenceReadinessManifest.prototypeRequirementIds.length} prototype
                  {' · '}
                  {result.persistenceReadinessManifest.blockedRequirementIds.length} blocked
                </span>
                <em>{result.persistenceReadinessManifest.nextPromotionStep}</em>
              </li>
              <li>
                <strong>{result.persistenceReadinessManifest.currentStorageMode.replaceAll('_', ' ')}</strong>
                <span>
                  enterprise {result.persistenceReadinessManifest.enterprisePersistenceEnabled ? 'enabled' : 'gated'}
                  {' · reviews '}
                  {result.persistenceReadinessManifest.reviewActionsEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>
                  Canonical writes: {result.persistenceReadinessManifest.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'}
                  {' · auto-consumption: '}
                  {result.persistenceReadinessManifest.sourceRuntimeAutoConsumptionEnabled ? 'enabled' : 'disabled'}
                </em>
              </li>
              {result.persistenceReadinessManifest.requirements.slice(0, 6).map((requirement) => (
                <li key={requirement.id}>
                  <strong>{requirement.label}</strong>
                  <span>
                    {requirement.status.replaceAll('_', ' ')}
                    {' · '}
                    {requirement.owner}
                  </span>
                  <em>{requirement.blockers[0] ?? requirement.nextAction}</em>
                </li>
              ))}
            </ul>
            <p>{result.persistenceReadinessManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Review Identity</h3>
            <ul>
              <li>
                <strong>{result.reviewIdentityManifest.mode.replaceAll('_', ' ')}</strong>
                <span>{result.reviewIdentityManifest.prototypeReviewerLabel}</span>
                <em>
                  Enterprise identity: {result.reviewIdentityManifest.enterpriseIdentityEnabled ? 'enabled' : 'blocked'}
                  {' · official approval: '}
                  {result.reviewIdentityManifest.officialApprovalEnabled ? 'enabled' : 'blocked'}
                </em>
              </li>
              <li>
                <strong>Local review workflow</strong>
                <span>{result.reviewIdentityManifest.localReviewWorkflowEnabled ? 'enabled' : 'disabled'}</span>
                <em>Role access: {result.reviewIdentityManifest.roleBasedAccessEnabled ? 'enabled' : 'blocked'} · brand access: {result.reviewIdentityManifest.brandAccessControlEnabled ? 'enabled' : 'blocked'}</em>
              </li>
              <li>
                <strong>Enterprise approval blockers</strong>
                <span>{result.reviewIdentityManifest.blockedEnterpriseApprovalTypes.length}</span>
                <em>{result.reviewIdentityManifest.requiredBeforeEnterpriseApproval.slice(0, 3).join(' · ')}</em>
              </li>
              <li>
                <strong>Related gates</strong>
                <span>{result.reviewIdentityManifest.relatedGateIds.length}</span>
                <em>{result.reviewIdentityManifest.officialApprovalBlocked ? 'Official approvals remain blocked.' : 'Official approval path is enabled.'}</em>
              </li>
            </ul>
            <p>{result.reviewIdentityManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Quiet Follow-ups</h3>
            <ul>
              <li>
                <strong>{result.proactivityManifest.mode.replaceAll('_', ' ')}</strong>
                <span>{result.proactivityManifest.suggestions.length} suggestions · {result.proactivityManifest.heldNotices.length} held notices</span>
                <em>
                  Autonomous actions: {result.proactivityManifest.autonomousActionsEnabled ? 'enabled' : 'disabled'}
                  {' · reminders: '}
                  {result.proactivityManifest.canCreateReminders ? 'enabled' : 'disabled'}
                  {' · external sends: '}
                  {result.proactivityManifest.externalSendEnabled ? 'enabled' : 'disabled'}
                </em>
              </li>
              {result.proactivityManifest.suggestions.slice(0, 5).map((suggestion) => (
                <li key={suggestion.id}>
                  <strong>{suggestion.label}</strong>
                  <span>{suggestion.priority} · {suggestion.suggestedTiming.replaceAll('_', ' ')}</span>
                  <em>{suggestion.reason}</em>
                </li>
              ))}
              {result.proactivityManifest.heldNotices.slice(0, 2).map((notice) => (
                <li key={notice.id}>
                  <strong>{notice.label}</strong>
                  <span>{notice.heldBecause}</span>
                  <em>{notice.reason}</em>
                </li>
              ))}
            </ul>
            <p>{result.proactivityManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Pilot Learning Loop</h3>
            <ul>
              <li>
                <strong>{result.pilotLearningManifest.mode.replaceAll('_', ' ')}</strong>
                <span>{result.pilotLearningManifest.signals.length} signals · {result.pilotLearningManifest.blockedLearningPaths.length} blocked paths</span>
                <em>
                  Autonomous learning: {result.pilotLearningManifest.autonomousLearningEnabled ? 'enabled' : 'disabled'}
                  {' · outcome learning: '}
                  {result.pilotLearningManifest.outcomeLearningEnabled ? 'enabled' : 'disabled'}
                  {' · canonical writes: '}
                  {result.pilotLearningManifest.canonicalSourceWriteEnabled ? 'enabled' : 'disabled'}
                </em>
              </li>
              {result.pilotLearningManifest.signals.slice(0, 6).map((signal) => (
                <li key={signal.id}>
                  <strong>{signal.label}</strong>
                  <span>{signal.type.replaceAll('_', ' ')} · {signal.status.replaceAll('_', ' ')}</span>
                  <em>{signal.detail}</em>
                </li>
              ))}
              <li>
                <strong>Next proof needed</strong>
                <span>{result.pilotLearningManifest.nextProofNeeds.length}</span>
                <em>{result.pilotLearningManifest.nextProofNeeds.slice(0, 3).join(' · ') || 'No additional proof need captured.'}</em>
              </li>
            </ul>
            <p>{result.pilotLearningManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Treatment Outcome Readiness</h3>
            <ul>
              <li>
                <strong>{result.treatmentOutcomeReadinessManifest.mode.replaceAll('_', ' ')}</strong>
                <span>{result.treatmentOutcomeReadinessManifest.blockedRequirementIds.length} blocked requirements</span>
                <em>
                  Outcome learning: {result.treatmentOutcomeReadinessManifest.outcomeLearningEnabled ? 'enabled' : 'disabled'}
                  {' · efficacy claims: '}
                  {result.treatmentOutcomeReadinessManifest.treatmentOutcomeClaimsEnabled ? 'enabled' : 'disabled'}
                  {' · canonical learning: '}
                  {result.treatmentOutcomeReadinessManifest.canonicalLearningStoreEnabled ? 'enabled' : 'disabled'}
                </em>
              </li>
              <li>
                <strong>Treatment paths visible</strong>
                <span>{result.treatmentOutcomeReadinessManifest.relatedTreatmentIds.length}</span>
                <em>{result.treatmentOutcomeReadinessManifest.relatedTreatmentIds.join(' · ') || 'No treatment paths linked.'}</em>
              </li>
              <li>
                <strong>Follow-up signals</strong>
                <span>{result.treatmentOutcomeReadinessManifest.relatedFollowUpSignals.length}</span>
                <em>{result.treatmentOutcomeReadinessManifest.relatedFollowUpSignals.slice(0, 3).join(' · ') || 'No follow-up signals linked.'}</em>
              </li>
              {result.treatmentOutcomeReadinessManifest.requirements.slice(0, 4).map((requirement) => (
                <li key={requirement.id}>
                  <strong>{requirement.label}</strong>
                  <span>{requirement.status.replaceAll('_', ' ')} · {requirement.requiredFor.replaceAll('_', ' ')}</span>
                  <em>{requirement.blockers[0] ?? requirement.requiredEvidence[0]}</em>
                </li>
              ))}
            </ul>
            <p>{result.treatmentOutcomeReadinessManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Accepted Memory In Context</h3>
            <ul>
              {result.acceptedMemory.slice(0, 5).map((record) => (
                <li key={record.id}>
                  <strong>{record.label}</strong>
                  <span>{record.type.replaceAll('_', ' ')} · {record.reviewStatus}</span>
                  <em>{record.detail}</em>
                </li>
              ))}
              {result.acceptedMemory.length === 0 && <li>No accepted session memory was loaded into this turn.</li>}
            </ul>
          </section>
          <section>
            <h3>Reviewed Source Candidates</h3>
            <ul>
              {result.sourcePromotionContext.records.slice(0, 5).map((record) => (
                <li key={record.id}>
                  <strong>{record.sourceLabel}</strong>
                  <span>{record.kind.replaceAll('_', ' ')} · {record.status.replaceAll('_', ' ')}</span>
                  <em>
                    {record.validationSummary}
                    {' · canonical write: '}
                    {record.canonicalWriteEnabled ? 'enabled' : 'disabled'}
                  </em>
                </li>
              ))}
              {result.sourcePromotionContext.records.length === 0 && (
                <li>No reviewed-local source promotion candidates were loaded for this brand.</li>
              )}
            </ul>
            <p>
              Runtime auto-consumption: {result.sourcePromotionContext.runtimeAutoConsumption ? 'enabled' : 'disabled'}.
              {' '}
              {result.sourcePromotionContext.caveats[1]}
            </p>
          </section>
          <section>
            <h3>Source Claim Queue</h3>
            <ul>
              {result.sourceClaimContext.records.slice(0, 5).map((record) => (
                <li key={record.id}>
                  <strong>{record.claimKind.replaceAll('_', ' ')} · {record.status.replaceAll('_', ' ')}</strong>
                  <span>{record.claim}</span>
                  <em>
                    {record.sourceLabel}
                    {' · canonical fact: '}
                    {record.canonicalFactEnabled ? 'enabled' : 'disabled'}
                  </em>
                </li>
              ))}
              {result.sourceClaimContext.records.length === 0 && (
                <li>No local source claim candidates were loaded for this brand.</li>
              )}
            </ul>
            <p>
              Runtime auto-consumption: {result.sourceClaimContext.runtimeAutoConsumption ? 'enabled' : 'disabled'}.
              {' '}
              {result.sourceClaimContext.caveats[1]}
            </p>
          </section>
          <section>
            <h3>Memory Suggestions</h3>
            <ul>{sessionLedger.memory.slice(-5).reverse().map((record) => (
              <li key={record.id}>
                <strong>{record.label}</strong>
                <span>{record.type.replaceAll('_', ' ')} · {record.status}</span>
                <em>{record.humanReviewRequired ? 'Human review required' : 'Review before accepting'}</em>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Confirmation Gates</h3>
            <ul>{result.confirmationGates.slice(0, 5).map((gate) => (
              <li key={gate.id}>
                <strong>{gate.label}</strong>
                <span>{gate.action.replaceAll('_', ' ')} · {gate.status}</span>
                <em>{gate.reason}</em>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Capability Flags</h3>
            <ul>{result.capabilities.slice(0, 6).map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.enabled ? 'enabled' : 'disabled'} · {capability.riskLevel} risk</span>
                <em>{capability.enabled ? capability.description : capability.blockedReason}</em>
              </li>
            ))}</ul>
          </section>
          <section>
            <h3>Runtime Control</h3>
            <ul>
              <li>
                <strong>{result.runtimeControlManifest.runtimePolicyId}</strong>
                <span>{result.runtimeControlManifest.mode.replaceAll('_', ' ')} · kill switch {result.runtimeControlManifest.killSwitchActive ? 'active' : 'inactive'}</span>
                <em>{result.runtimeControlManifest.runtimeEnabled ? 'Runtime enabled' : `Runtime disabled; fallback ${result.runtimeControlManifest.degradedModeFallback}`}</em>
              </li>
              <li>
                <strong>Fail closed</strong>
                <span>{result.runtimeControlManifest.failClosedIfActivated ? 'enabled' : 'not configured'}</span>
                <em>Can bypass evidence/review: {result.runtimeControlManifest.canBypassEvidenceOrReview ? 'yes' : 'no'}</em>
              </li>
              <li>
                <strong>Disabled risky capabilities</strong>
                <span>{result.runtimeControlManifest.riskyCapabilitiesDisabled.length}</span>
                <em>{result.runtimeControlManifest.riskyCapabilitiesDisabled.slice(0, 5).map((item) => item.replaceAll('_', ' ')).join(', ')}</em>
              </li>
            </ul>
            <p>{result.runtimeControlManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Voice Policy</h3>
            <ul>
              <li><strong>Default</strong><span>{result.voicePolicy.defaultMode.replaceAll('_', ' ')}</span></li>
              <li><strong>Enabled</strong><span>{result.voicePolicy.enabledModes.map((mode) => mode.replaceAll('_', ' ')).join(', ')}</span></li>
              <li><strong>Disabled</strong><span>{result.voicePolicy.disabledModes.map((mode) => mode.replaceAll('_', ' ')).join(', ')}</span></li>
              <li><strong>Consent</strong><span>{result.voicePolicy.consentRequired ? 'required' : 'not required'}</span></li>
              <li><strong>Runtime</strong><span>{result.voicePolicy.runtimeEventSource}</span></li>
              <li><strong>Interrupts</strong><span>{result.voicePolicy.interruptHandling}</span></li>
              <li><strong>Voice manifest</strong><span>{result.voiceRuntimeManifest.usesGovernedRuntime ? 'governed runtime' : 'not ready'}</span></li>
              <li><strong>Voice views</strong><span>{result.voiceRuntimeManifest.compatibleViewIds.length ? result.voiceRuntimeManifest.compatibleViewIds.join(', ') : 'none'}</span></li>
              <li><strong>Continuous</strong><span>{result.voiceRuntimeManifest.continuousModeEnabled ? 'enabled' : 'disabled'}</span></li>
            </ul>
            <p>{result.voiceRuntimeManifest.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Ledger</h3>
            <ul>
              <li><strong>Turns</strong><span>{sessionLedger.turnIds.length} saved locally</span></li>
              <li><strong>Server session</strong><span>{durableSessionId}</span></li>
              <li><strong>Durable store</strong><span>{result.persistence ? `${result.persistence.status} · ${result.persistence.store}` : 'waiting for next turn'}</span></li>
              <li><strong>Memory</strong><span>{memoryAuditSummary.memory.accepted} accepted · {memoryAuditSummary.memory.suggested} suggested</span></li>
              <li><strong>Artifacts</strong><span>{artifactReadinessSummary.artifacts.total} captured · {artifactReadinessSummary.artifacts.exportBlocked} export blocked</span></li>
              <li><strong>Audit</strong><span>{auditSummary.records} records · {auditSummary.recordsRequiringConfirmation} confirmation</span></li>
              <li><strong>Gates</strong><span>{sessionLedger.confirmationGates.length} pending reviews</span></li>
              <li><strong>Reviews</strong><span>{sessionLedger.reviews.length} human decisions</span></li>
              <li><strong>Capabilities</strong><span>{capabilityReadinessSummary.disabledCapabilityIds.length} disabled · {capabilityReadinessSummary.blockedCapabilityGateIds.length} blocked gates</span></li>
              <li><strong>Evidence</strong><span>{evidenceSpotlightSummary.claimStatusCounts.supportedByPacket} supported · {evidenceSpotlightSummary.claimStatusCounts.missingEvidence} gaps</span></li>
              <li><strong>Proactivity</strong><span>{proactivitySummary.suggestions.total} suggestions · {proactivitySummary.heldNotices.total} held notices</span></li>
              <li><strong>Learning</strong><span>{pilotLearningSummary.signals.total} reviewed signals</span></li>
              <li><strong>Outcome readiness</strong><span>{treatmentOutcomeReadinessSummary.blockedRequirementIds.length} blockers</span></li>
              <li><strong>Sources</strong><span>{sourceGovernanceSummary.turnsWithSourceGovernance} governed turns</span></li>
              <li><strong>Surfaces</strong><span>{sessionRuntimeSurfaceSummary.usedSurfaceIds.length} used</span></li>
              <li><strong>Workspaces</strong><span>{sessionExperienceArchitectureSummary.activeTemplates.length} composed</span></li>
              <li><strong>Canvas</strong><span>{sessionCanvasContinuitySummary.turnsWithCanvasState} turns · {sessionCanvasContinuitySummary.renderedViewIds.length} rendered views</span></li>
              <li><strong>Persistence governance</strong><span>{sessionPersistenceGovernanceSummary.turnsWithPersistenceReadiness} turns · {sessionPersistenceGovernanceSummary.blockedRequirementIds.length} blockers</span></li>
              <li><strong>Providers</strong><span>{sessionProviderAdapterSummary.readyAdapterIds.length} ready · {sessionProviderAdapterSummary.gatedAdapterIds.length} gated</span></li>
              <li><strong>Runtime control</strong><span>{sessionRuntimeControlSummary.turnsWithRuntimeControl} turns · kill switch {sessionRuntimeControlSummary.killSwitchActiveEver ? 'seen active' : 'inactive'}</span></li>
              <li><strong>Quality</strong><span>{sessionRuntimeQualitySummary.checkStatusCounts.pass} pass · {sessionRuntimeQualitySummary.checkStatusCounts.blocked} blocked</span></li>
              <li><strong>Voice runtime</strong><span>{sessionVoiceRuntimeSummary.turnsWithVoiceRuntime} turns · {sessionVoiceRuntimeSummary.compatibleViewIds.length} compatible views</span></li>
              <li><strong>Voice contract</strong><span>{sessionVoiceContractSummary.turnsWithVoiceContracts} turns · {sessionVoiceContractSummary.incompatibleViewIds.length} incompatible views</span></li>
              <li><strong>Voice</strong><span>{sessionVoiceReadinessSummary.blockedRequirementIds.length} blockers</span></li>
              <li><strong>Foundation</strong><span>{foundationReadinessSummary.statusCounts.ready} ready · {foundationReadinessSummary.statusCounts.prototype} prototype · {foundationReadinessSummary.statusCounts.blocked} gated</span></li>
              <li><strong>Promotion gate</strong><span>{promotionGateSummary.readinessLevel.replaceAll('_', ' ')}</span></li>
            </ul>
          </section>
          <section>
            <h3>Session Promotion Gate</h3>
            <ul>
              <li>
                <strong>{promotionGateSummary.promotionDecision.replaceAll('_', ' ')}</strong>
                <span>{promotionGateSummary.readinessLevel.replaceAll('_', ' ')} · {promotionGateSummary.recommendedAsk.replaceAll('_', ' ')}</span>
                <em>production {promotionGateSummary.productionReady ? 'ready' : 'blocked'} · pilot review {promotionGateSummary.pilotReviewReady ? 'ready' : 'needs more proof'}</em>
              </li>
              <li>
                <strong>Demo proof</strong>
                <span>{promotionGateSummary.demoProof.governedTurns} turns · {promotionGateSummary.demoProof.completedExecutivePilotSteps}/{promotionGateSummary.demoProof.totalExecutivePilotSteps} pilot steps</span>
                <em>{promotionGateSummary.demoProof.approvedViewsRendered} approved views · {promotionGateSummary.demoProof.supportedClaims} supported claims · surfaces {promotionGateSummary.demoProof.runtimeSurfacesGuarded ? 'guarded' : 'watch'}</em>
              </li>
              <li>
                <strong>Enabled for demo</strong>
                <span>{promotionGateSummary.enabledForDemo.slice(0, 4).map((item) => item.replaceAll('_', ' ')).join(' · ')}</span>
                <em>{promotionGateSummary.enabledForDemo.slice(4, 8).map((item) => item.replaceAll('_', ' ')).join(' · ')}</em>
              </li>
              <li>
                <strong>Production blockers</strong>
                <span>{promotionGateSummary.blockedForProduction.slice(0, 4).map((item) => item.replaceAll('_', ' ')).join(' · ')}</span>
                <em>{promotionGateSummary.blockedForProduction.slice(4, 8).map((item) => item.replaceAll('_', ' ')).join(' · ')}</em>
              </li>
              <li>
                <strong>Critical gates</strong>
                <span>source files {promotionGateSummary.criticalGates.sourceOwnerDataReady ? 'ready for review' : 'needed'} · canonical use {promotionGateSummary.criticalGates.canonicalUseApproved ? 'approved' : 'blocked'}</span>
                <em>export {promotionGateSummary.criticalGates.artifactExportReady ? 'ready' : 'blocked'} · full voice {promotionGateSummary.criticalGates.fullVoiceReady ? 'ready' : 'blocked'} · arbitrary UI {promotionGateSummary.criticalGates.arbitraryUiGenerationReady ? 'ready' : 'blocked'}</em>
              </li>
              <li>
                <strong>Next pilot step</strong>
                <span>{promotionGateSummary.nextPilotSteps[0] ?? 'Run the governed executive pilot sequence before asking for funding.'}</span>
                <em>{promotionGateSummary.fundingRationale[0]}</em>
              </li>
            </ul>
            <p>{promotionGateSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Foundation Readiness</h3>
            <ul>
              <li>
                <strong>{foundationReadinessSummary.cmoReadinessSignal.replaceAll('_', ' ')}</strong>
                <span>{foundationReadinessSummary.turns} turns · {foundationReadinessSummary.foundationDemoReady ? 'demo coherent' : 'needs governed turns'}</span>
                <em>{foundationReadinessSummary.statusCounts.ready} ready · {foundationReadinessSummary.statusCounts.prototype} prototype · {foundationReadinessSummary.statusCounts.blocked} gated · {foundationReadinessSummary.statusCounts.waiting} waiting</em>
              </li>
              <li>
                <strong>Composable UI proof</strong>
                <span>{foundationReadinessSummary.approvedComposition.templateCount} templates · {foundationReadinessSummary.approvedComposition.skillCount} skills · {foundationReadinessSummary.approvedComposition.viewCount} views</span>
                <em>{foundationReadinessSummary.approvedComposition.renderedViewIds.length} rendered views · unknown views {foundationReadinessSummary.approvedComposition.unknownViewIds.length}</em>
              </li>
              <li>
                <strong>Proof and review</strong>
                <span>{foundationReadinessSummary.proofAndReview.supportedClaims} supported claims · {foundationReadinessSummary.proofAndReview.missingEvidenceClaims} evidence gaps</span>
                <em>{foundationReadinessSummary.proofAndReview.reviewedItems} reviewed items · {foundationReadinessSummary.proofAndReview.pendingReviewItems} pending</em>
              </li>
              <li>
                <strong>Runtime posture</strong>
                <span>fail closed {foundationReadinessSummary.runtimeAndCapability.failClosedConsistent ? 'consistent' : 'waiting'} · risky disabled {foundationReadinessSummary.runtimeAndCapability.allRiskyCapabilitiesDisabled ? 'yes' : 'no'}</span>
                <em>runtime bypass {foundationReadinessSummary.runtimeAndCapability.runtimeBypassAllowed ? 'allowed' : 'blocked'} · admin bypass {foundationReadinessSummary.runtimeAndCapability.adminBypassEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Voice and providers</strong>
                <span>SSE {foundationReadinessSummary.voiceAndProvider.sseStreamingReady ? 'ready' : 'waiting'} · browser STT {foundationReadinessSummary.voiceAndProvider.browserSttPrototypeReady ? 'prototype' : 'waiting'}</span>
                <em>Realtime {foundationReadinessSummary.voiceAndProvider.realtimeVoiceEnabled ? 'enabled' : 'gated'} · TTS {foundationReadinessSummary.voiceAndProvider.ttsEnabled ? 'enabled' : 'disabled'} · continuous {foundationReadinessSummary.voiceAndProvider.continuousVoiceEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Next foundation step</strong>
                <span>{foundationReadinessSummary.nextFoundationSteps[0] ?? 'Run a governed turn to capture next promotion blockers.'}</span>
                <em>{foundationReadinessSummary.disabledPromotionPaths.slice(0, 4).map((path) => path.replaceAll('_', ' ')).join(' · ')}</em>
              </li>
            </ul>
            <p>{foundationReadinessSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Quiet Proactivity</h3>
            <ul>
              <li>
                <strong>{proactivitySummary.mode.replaceAll('_', ' ')}</strong>
                <span>{proactivitySummary.turnsWithProactivity} turns · {proactivitySummary.suggestions.total} suggestions</span>
                <em>{proactivitySummary.suggestions.humanReviewRequired} require human review · {proactivitySummary.heldNotices.total} notices held</em>
              </li>
              <li>
                <strong>Suggestion mix</strong>
                <span>{proactivitySummary.suggestionTypes.slice(0, 4).map((item) => `${item.type.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No suggestions captured yet.'}</span>
                <em>{proactivitySummary.suggestedTimings.slice(0, 4).map((item) => `${item.timing.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No timing cues captured yet.'}</em>
              </li>
              <li>
                <strong>Related proof</strong>
                <span>{proactivitySummary.relatedGapIds.length} gaps · {proactivitySummary.relatedGateIds.length} gates · {proactivitySummary.relatedArtifactIds.length} artifacts</span>
                <em>{proactivitySummary.relatedEvidenceLabels.slice(0, 3).join(' · ') || 'No evidence labels captured yet.'}</em>
              </li>
              <li>
                <strong>Automation posture</strong>
                <span>reminders {proactivitySummary.canCreateReminders ? 'enabled' : 'disabled'} · sends {proactivitySummary.externalSendEnabled ? 'enabled' : 'disabled'}</span>
                <em>autonomous actions {proactivitySummary.autonomousActionsEnabled ? 'enabled' : 'disabled'} · no overlap {proactivitySummary.noOverlappingRuns ? 'enforced' : 'not proven'}</em>
              </li>
              <li>
                <strong>Latest suggestion</strong>
                <span>{proactivitySummary.latestSuggestions[0]?.label ?? 'No quiet follow-up captured yet.'}</span>
                <em>{proactivitySummary.latestSuggestions[0]?.reason ?? 'Run a governed turn to persist suggestions-only proactivity.'}</em>
              </li>
            </ul>
            <p>{proactivitySummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Persistence Governance</h3>
            <ul>
              <li>
                <strong>{sessionPersistenceGovernanceSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionPersistenceGovernanceSummary.turnsWithWorkingContext} context turns · {sessionPersistenceGovernanceSummary.turnsWithReviewIdentity} identity turns</span>
                <em>{sessionPersistenceGovernanceSummary.loadedContextTypes.map((type) => type.replaceAll('_', ' ')).join(' · ') || 'No context manifests captured yet.'}</em>
              </li>
              <li>
                <strong>Storage posture</strong>
                <span>browser {sessionPersistenceGovernanceSummary.browserLocalLedgerEnabled ? 'ready' : 'waiting'} · local JSON {sessionPersistenceGovernanceSummary.localJsonPersistenceEnabled ? 'ready' : 'waiting'}</span>
                <em>enterprise {sessionPersistenceGovernanceSummary.enterprisePersistenceEnabled ? 'enabled' : 'blocked'} · canonical source writes {sessionPersistenceGovernanceSummary.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Review identity</strong>
                <span>prototype decisions {sessionPersistenceGovernanceSummary.allowedPrototypeDecisions.join(' · ') || 'not captured yet'}</span>
                <em>official approval {sessionPersistenceGovernanceSummary.officialApprovalEnabled ? 'enabled' : 'blocked'} · role access {sessionPersistenceGovernanceSummary.roleBasedAccessEnabled ? 'enabled' : 'blocked'}</em>
              </li>
              <li>
                <strong>Blocked promotion</strong>
                <span>{sessionPersistenceGovernanceSummary.blockedRequirementIds.slice(0, 4).join(' · ') || 'No blockers captured yet.'}</span>
                <em>{sessionPersistenceGovernanceSummary.latestNextPromotionStep ?? 'Run a governed turn to capture the next promotion step.'}</em>
              </li>
            </ul>
            <p>{sessionPersistenceGovernanceSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Canvas Continuity</h3>
            <ul>
              <li>
                <strong>{sessionCanvasContinuitySummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionCanvasContinuitySummary.turnsWithCanvasState} canvas turns</span>
                <em>{sessionCanvasContinuitySummary.turnsWithReasoningStatus} status manifests · {sessionCanvasContinuitySummary.turnsWithConversationPresence} presence manifests</em>
              </li>
              <li>
                <strong>Latest canvas</strong>
                <span>{sessionCanvasContinuitySummary.latestCanvas?.templateId?.replaceAll('_', ' ') ?? 'No canvas captured yet.'}</span>
                <em>{sessionCanvasContinuitySummary.latestCanvas?.renderedViewIds.slice(0, 4).map((viewId) => viewId.replaceAll('_', ' ')).join(' · ') ?? 'Run a governed turn to persist canvas state.'}</em>
              </li>
              <li>
                <strong>Continuity</strong>
                <span>preserve canvas {sessionCanvasContinuitySummary.preservesLastCompletedCanvas ? 'ready' : 'waiting'} · stream abort {sessionCanvasContinuitySummary.clientStreamAbortSupported ? 'ready' : 'waiting'}</span>
                <em>server cancel {sessionCanvasContinuitySummary.serverSideCancelSupported ? 'enabled' : 'disabled'} · overlapping runs {sessionCanvasContinuitySummary.noOverlappingRuns ? 'blocked' : 'not proven'}</em>
              </li>
              <li>
                <strong>Interaction gates</strong>
                <span>
                  continuous listening {sessionCanvasContinuitySummary.continuousListeningEnabled ? 'enabled' : 'disabled'}
                  {' · autonomous speaking '}
                  {sessionCanvasContinuitySummary.autonomousSpeakingEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>arbitrary UI {sessionCanvasContinuitySummary.arbitraryViewIdsAllowed ? 'allowed' : 'blocked'} · private reasoning {sessionCanvasContinuitySummary.privateReasoningExposed ? 'exposed' : 'hidden'}</em>
              </li>
            </ul>
            <p>{sessionCanvasContinuitySummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Artifact Readiness</h3>
            <ul>
              <li>
                <strong>{artifactReadinessSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{artifactReadinessSummary.artifacts.total} artifacts</span>
                <em>{artifactReadinessSummary.artifacts.reviewRequired} review required · {artifactReadinessSummary.artifacts.exportBlocked} export blocked</em>
              </li>
              <li>
                <strong>Artifact types</strong>
                <span>{artifactReadinessSummary.artifactTypeCounts.slice(0, 4).map((item) => `${item.artifactType.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No artifacts captured yet.'}</span>
                <em>{artifactReadinessSummary.readinessStatusCounts.map((item) => `${item.status.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No readiness statuses captured.'}</em>
              </li>
              <li>
                <strong>Required review</strong>
                <span>{artifactReadinessSummary.requiredReviewerRoles.join(' · ') || 'No reviewer roles captured yet.'}</span>
                <em>{artifactReadinessSummary.requiredLanguageApprovals.slice(0, 3).join(' · ') || 'No language approvals captured yet.'}</em>
              </li>
              <li>
                <strong>Disabled actions</strong>
                <span>
                  export {artifactReadinessSummary.artifactExportEnabled ? 'enabled' : 'disabled'}
                  {' · copy '}
                  {artifactReadinessSummary.artifactCopyEnabled ? 'enabled' : 'disabled'}
                  {' · circulation '}
                  {artifactReadinessSummary.artifactCirculationEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>official approval {artifactReadinessSummary.officialApprovalEnabled ? 'enabled' : 'disabled'} · publishing workflow {artifactReadinessSummary.enterprisePublishingWorkflowEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{artifactReadinessSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Memory Audit Continuity</h3>
            <ul>
              <li>
                <strong>{memoryAuditSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{memoryAuditSummary.turnsWithWorkingContext} context turns</span>
                <em>{memoryAuditSummary.memory.total} memory records · {memoryAuditSummary.memory.humanReviewRequired} require review</em>
              </li>
              <li>
                <strong>Review state</strong>
                <span>{memoryAuditSummary.memory.accepted} accepted · {memoryAuditSummary.memory.suggested} suggested · {memoryAuditSummary.memory.rejected} rejected</span>
                <em>{memoryAuditSummary.memoryReviewDecisions.total} memory review decisions · {memoryAuditSummary.reviewGateIds.length} review gates</em>
              </li>
              <li>
                <strong>Loaded context</strong>
                <span>{memoryAuditSummary.acceptedMemoryContextIds.length} accepted records loaded</span>
                <em>{memoryAuditSummary.acceptedMemorySourceTurnIds.slice(0, 3).join(' · ') || 'No accepted memory source turns yet.'}</em>
              </li>
              <li>
                <strong>Audit coverage</strong>
                <span>{memoryAuditSummary.auditCoverage.memoryAuditRecords} memory audit records</span>
                <em>working context {memoryAuditSummary.auditCoverage.workingContextAudited ? 'audited' : 'waiting'} · suggestions {memoryAuditSummary.auditCoverage.memorySuggestionsAudited ? 'audited' : 'waiting'} · quality {memoryAuditSummary.auditCoverage.runtimeQualityMemoryReviewChecked ? 'checked' : 'waiting'}</em>
              </li>
              <li>
                <strong>Disabled writes</strong>
                <span>auto-accept {memoryAuditSummary.autoAcceptMemoryEnabled ? 'enabled' : 'disabled'} · reviewed writes {memoryAuditSummary.reviewedMemoryWriteEnabled ? 'enabled' : 'disabled'}</span>
                <em>canonical memory {memoryAuditSummary.canonicalMemoryWriteEnabled ? 'enabled' : 'disabled'} · enterprise store {memoryAuditSummary.enterpriseMemoryStoreEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Latest memory</strong>
                <span>{memoryAuditSummary.latestMemory[0]?.label ?? 'No memory record captured yet.'}</span>
                <em>{memoryAuditSummary.latestMemory[0]?.status ?? 'waiting for governed turn'}</em>
              </li>
            </ul>
            <p>{memoryAuditSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Audit Trail</h3>
            <ul>
              <li>
                <strong>{auditSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{auditSummary.turnsWithAudit} turns</span>
                <em>{auditSummary.records} records · {auditSummary.recordsRequiringConfirmation} require confirmation</em>
              </li>
              <li>
                <strong>Action coverage</strong>
                <span>{auditSummary.actionCounts.slice(0, 4).map((item) => `${item.action.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No audit actions captured yet.'}</span>
                <em>Lifecycle: {auditSummary.turnLifecycleAudited ? 'audited' : 'not yet'} · runtime quality: {auditSummary.runtimeQualityAudited ? 'audited' : 'not yet'}</em>
              </li>
              <li>
                <strong>Skills / views</strong>
                <span>{auditSummary.skillIds.length} skills · {auditSummary.viewIds.length} views</span>
                <em>{auditSummary.viewIds.slice(0, 4).join(' · ') || 'No view audit records captured yet.'}</em>
              </li>
              <li>
                <strong>Artifacts / evidence</strong>
                <span>{auditSummary.artifactIds.length} artifacts · {auditSummary.evidenceLabels.length} evidence labels</span>
                <em>Evidence use: {auditSummary.evidenceUseAudited ? 'audited' : 'not yet'} · artifacts: {auditSummary.artifactGenerationAudited ? 'audited' : 'not yet'}</em>
              </li>
              <li>
                <strong>Governance rails</strong>
                <span>
                  memory {auditSummary.memorySuggestionsAudited ? 'audited' : 'not yet'}
                  {' · source '}
                  {auditSummary.sourceGovernanceAudited ? 'audited' : 'not yet'}
                </span>
                <em>enterprise audit store {auditSummary.enterpriseAuditStoreEnabled ? 'enabled' : 'disabled'} · export {auditSummary.auditExportEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Latest record</strong>
                <span>{auditSummary.latestRecords[0]?.label ?? 'No audit record captured yet.'}</span>
                <em>{auditSummary.latestRecords[0]?.detail ?? 'Waiting for a governed turn.'}</em>
              </li>
            </ul>
            <p>{auditSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Capability Readiness</h3>
            <ul>
              <li>
                <strong>{capabilityReadinessSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{capabilityReadinessSummary.turnsWithCapabilityState} turns</span>
                <em>{capabilityReadinessSummary.disabledCapabilityIds.length} disabled · {capabilityReadinessSummary.enabledCapabilityIds.length} enabled · {capabilityReadinessSummary.blockedCapabilityGateIds.length} blocked gates</em>
              </li>
              <li>
                <strong>Risk posture</strong>
                <span>{capabilityReadinessSummary.highRiskDisabledCapabilityIds.length} high risk disabled · {capabilityReadinessSummary.mediumRiskDisabledCapabilityIds.length} medium risk disabled</span>
                <em>All risky disabled: {capabilityReadinessSummary.allRiskyCapabilitiesDisabled ? 'yes' : 'no'} · kill switch ever active: {capabilityReadinessSummary.killSwitchActiveEver ? 'yes' : 'no'}</em>
              </li>
              <li>
                <strong>Blocked capabilities</strong>
                <span>{capabilityReadinessSummary.disabledCapabilityIds.slice(0, 4).map((capability) => capability.replaceAll('_', ' ')).join(' · ') || 'No disabled capabilities captured yet.'}</span>
                <em>Runtime bypass: {capabilityReadinessSummary.runtimeBypassAllowed ? 'allowed' : 'blocked'}</em>
              </li>
              <li>
                <strong>Promotion gates</strong>
                <span>{capabilityReadinessSummary.blockedGateCountsByAction.map((gate) => `${gate.action.replaceAll('_', ' ')} (${gate.count})`).join(' · ') || 'No blocked capability gates captured yet.'}</span>
                <em>{capabilityReadinessSummary.requiredReviewGateIds.length} required review gates · {capabilityReadinessSummary.reviewedGateIds.length} reviewed gates</em>
              </li>
              <li>
                <strong>Disabled actions</strong>
                <span>
                  export {capabilityReadinessSummary.exportEnabled ? 'enabled' : 'disabled'}
                  {' · memory '}
                  {capabilityReadinessSummary.reviewedMemoryWriteEnabled ? 'enabled' : 'disabled'}
                  {' · source writes '}
                  {capabilityReadinessSummary.sourceDataWriteEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>continuous voice {capabilityReadinessSummary.continuousVoiceEnabled ? 'enabled' : 'disabled'} · external ingest {capabilityReadinessSummary.externalResearchIngestEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Next promotion requirement</strong>
                <span>{capabilityReadinessSummary.nextPromotionRequirements[0] ?? 'No capability state captured yet.'}</span>
                <em>Admin overrides tracked: {capabilityReadinessSummary.adminOverrideRequiredFor.length}</em>
              </li>
            </ul>
            <p>{capabilityReadinessSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Runtime Control</h3>
            <ul>
              <li>
                <strong>{sessionRuntimeControlSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionRuntimeControlSummary.turnsWithRuntimeControl} turns</span>
                <em>{sessionRuntimeControlSummary.runtimePolicyIds.join(' · ') || 'No runtime policy captured yet.'}</em>
              </li>
              <li>
                <strong>Fail-closed posture</strong>
                <span>runtime {sessionRuntimeControlSummary.runtimeEnabledConsistent ? 'consistent' : 'waiting'} · fail closed {sessionRuntimeControlSummary.failClosedConsistent ? 'consistent' : 'waiting'}</span>
                <em>evidence/review bypass {sessionRuntimeControlSummary.evidenceReviewBypassPrevented ? 'prevented' : 'not proven'}</em>
              </li>
              <li>
                <strong>Kill switch</strong>
                <span>{sessionRuntimeControlSummary.killSwitchActiveEver ? `${sessionRuntimeControlSummary.killSwitchActiveTurns} active turns` : 'inactive across captured turns'}</span>
                <em>{sessionRuntimeControlSummary.degradedModeFallbacks.map((fallback) => fallback.replaceAll('_', ' ')).join(' · ') || 'No fallback captured yet.'}</em>
              </li>
              <li>
                <strong>Emergency scope</strong>
                <span>{sessionRuntimeControlSummary.emergencyStopScopes.map((scope) => scope.replaceAll('_', ' ')).join(' · ') || 'No scope captured yet.'}</span>
                <em>Admin overrides: {sessionRuntimeControlSummary.adminOverrideRequiredFor.length}</em>
              </li>
              <li>
                <strong>Disabled runtime paths</strong>
                <span>
                  export {sessionRuntimeControlSummary.exportEnabled ? 'enabled' : 'disabled'}
                  {' · source writes '}
                  {sessionRuntimeControlSummary.sourceWriteEnabled ? 'enabled' : 'disabled'}
                  {' · runtime bypass '}
                  {sessionRuntimeControlSummary.runtimeBypassAllowed ? 'allowed' : 'blocked'}
                </span>
                <em>admin bypass {sessionRuntimeControlSummary.adminBypassEnabled ? 'enabled' : 'disabled'} · continuous voice {sessionRuntimeControlSummary.continuousVoiceEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{sessionRuntimeControlSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Evidence Spotlight</h3>
            <ul>
              <li>
                <strong>{evidenceSpotlightSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{evidenceSpotlightSummary.turnsWithEvidenceSpotlight} turns</span>
                <em>{evidenceSpotlightSummary.claimStatusCounts.supportedByPacket} supported · {evidenceSpotlightSummary.claimStatusCounts.missingEvidence} missing · {evidenceSpotlightSummary.claimStatusCounts.guardrail} guardrail</em>
              </li>
              <li>
                <strong>Claim types</strong>
                <span>{evidenceSpotlightSummary.claimTypeCounts.slice(0, 4).map((item) => `${item.claimType.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'No claims captured yet.'}</span>
                <em>Review-required claims: {evidenceSpotlightSummary.humanReviewRequiredClaimIds.length}</em>
              </li>
              <li>
                <strong>Evidence labels</strong>
                <span>{evidenceSpotlightSummary.supportedEvidenceLabels.slice(0, 4).join(' · ') || 'No packet-backed labels captured yet.'}</span>
                <em>Packet evidence attached: {evidenceSpotlightSummary.packetEvidenceAttached ? 'yes' : 'not yet'}</em>
              </li>
              <li>
                <strong>Missing evidence</strong>
                <span>{evidenceSpotlightSummary.missingEvidenceIds.slice(0, 4).join(' · ') || 'No missing-evidence claims captured.'}</span>
                <em>Visible: {evidenceSpotlightSummary.missingEvidenceVisible ? 'yes' : 'no'}</em>
              </li>
              <li>
                <strong>Reviewed context</strong>
                <span>{evidenceSpotlightSummary.sourceCandidateIds.length} source candidates</span>
                <em>Separated from canonical facts: {evidenceSpotlightSummary.reviewedContextSeparated ? 'yes' : 'not yet'} · claim promotion {evidenceSpotlightSummary.canonicalClaimPromotionEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Latest claim</strong>
                <span>{evidenceSpotlightSummary.latestClaims[0]?.claim ?? 'No claim spotlight captured yet.'}</span>
                <em>{evidenceSpotlightSummary.latestClaims[0]?.supportStatus.replaceAll('_', ' ') ?? 'waiting for a governed turn'}</em>
              </li>
            </ul>
            <p>{evidenceSpotlightSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Provider Adapters</h3>
            <ul>
              <li>
                <strong>{sessionProviderAdapterSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionProviderAdapterSummary.turnsWithProviderAdapters} turns</span>
                <em>{sessionProviderAdapterSummary.readyAdapterIds.length} ready · {sessionProviderAdapterSummary.prototypeAdapterIds.length} prototype · {sessionProviderAdapterSummary.gatedAdapterIds.length} gated · {sessionProviderAdapterSummary.disabledAdapterIds.length} disabled</em>
              </li>
              <li>
                <strong>Governed paths</strong>
                <span>
                  text {sessionProviderAdapterSummary.textReasoningReady ? 'ready' : 'not yet'}
                  {' · SSE '}
                  {sessionProviderAdapterSummary.sseStreamingReady ? 'ready' : 'not yet'}
                  {' · browser STT '}
                  {sessionProviderAdapterSummary.browserSttPrototypeReady ? 'prototype' : 'not yet'}
                </span>
                <em>Provider bypass: {sessionProviderAdapterSummary.providerBypassAllowed ? 'allowed' : 'blocked'}</em>
              </li>
              <li>
                <strong>Latest adapters</strong>
                <span>{sessionProviderAdapterSummary.latestAdapters.length}</span>
                <em>{sessionProviderAdapterSummary.latestAdapters.slice(0, 4).map((adapter) => `${adapter.id} (${adapter.status.replaceAll('_', ' ')})`).join(' · ') || 'No provider adapters captured yet.'}</em>
              </li>
              <li>
                <strong>Voice providers</strong>
                <span>
                  realtime {sessionProviderAdapterSummary.realtimeRuntimeConnected ? 'connected' : 'gated'}
                  {' · TTS '}
                  {sessionProviderAdapterSummary.ttsEnabled ? 'enabled' : 'disabled'}
                  {' · continuous '}
                  {sessionProviderAdapterSummary.continuousVoiceEnabled ? 'enabled' : 'gated'}
                </span>
                <em>{sessionProviderAdapterSummary.latestRealtimeVoiceAdapterId ?? 'no realtime adapter'} · {sessionProviderAdapterSummary.latestTtsAdapterId ?? 'no TTS adapter'}</em>
              </li>
              <li>
                <strong>Policy review</strong>
                <span>{sessionProviderAdapterSummary.requiredPolicyReviewFor.length} capabilities</span>
                <em>{sessionProviderAdapterSummary.requiredPolicyReviewFor.map((capability) => capability.replaceAll('_', ' ')).join(' · ') || 'No provider policy blockers captured yet.'}</em>
              </li>
            </ul>
            <p>{sessionProviderAdapterSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Runtime Quality</h3>
            <ul>
              <li>
                <strong>{sessionRuntimeQualitySummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionRuntimeQualitySummary.turnsWithRuntimeQuality} turns</span>
                <em>{sessionRuntimeQualitySummary.checkStatusCounts.pass} pass · {sessionRuntimeQualitySummary.checkStatusCounts.watch} watch · {sessionRuntimeQualitySummary.checkStatusCounts.blocked} blocked</em>
              </li>
              <li>
                <strong>Consistent checks</strong>
                <span>{sessionRuntimeQualitySummary.consistentlyPassingCheckIds.length}</span>
                <em>{sessionRuntimeQualitySummary.consistentlyPassingCheckIds.slice(0, 4).join(' · ') || 'No checks have a full-session pass record yet.'}</em>
              </li>
              <li>
                <strong>Watch / blocked</strong>
                <span>{sessionRuntimeQualitySummary.watchCheckIds.length} watch · {sessionRuntimeQualitySummary.blockedCheckIds.length} blocked</span>
                <em>{[...sessionRuntimeQualitySummary.watchCheckIds, ...sessionRuntimeQualitySummary.blockedCheckIds].slice(0, 4).join(' · ') || 'No watch or blocked quality checks captured.'}</em>
              </li>
              <li>
                <strong>Governed rails</strong>
                <span>
                  evidence {sessionRuntimeQualitySummary.evidenceAttachmentConsistent ? 'consistent' : 'not yet'}
                  {' · source '}
                  {sessionRuntimeQualitySummary.sourceContextNonCanonicalConsistent ? 'review-only' : 'check needed'}
                  {' · memory '}
                  {sessionRuntimeQualitySummary.memoryReviewControlledConsistent ? 'reviewed' : 'check needed'}
                </span>
                <em>exports {sessionRuntimeQualitySummary.artifactExportDisabledConsistent ? 'disabled' : 'check needed'} · continuous voice {sessionRuntimeQualitySummary.continuousVoiceDisabledConsistent ? 'disabled' : 'check needed'}</em>
              </li>
              <li>
                <strong>Runtime gates</strong>
                <span>
                  providers {sessionRuntimeQualitySummary.providerAdaptersGovernedConsistent ? 'governed' : 'check needed'}
                  {' · voice '}
                  {sessionRuntimeQualitySummary.voiceOrchestrationGatedConsistent ? 'gated' : 'check needed'}
                  {' · surfaces '}
                  {sessionRuntimeQualitySummary.runtimeSurfaceGovernedConsistent ? 'governed' : 'check needed'}
                </span>
                <em>{sessionRuntimeQualitySummary.humanReviewRequiredCheckIds.length} checks require human review signals</em>
              </li>
            </ul>
            <p>{sessionRuntimeQualitySummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Voice Runtime</h3>
            <ul>
              <li>
                <strong>{sessionVoiceRuntimeSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionVoiceRuntimeSummary.turnsWithVoiceRuntime} turns</span>
                <em>{sessionVoiceRuntimeSummary.runtimeEventSources.join(' · ') || 'No voice runtime source captured yet.'}</em>
              </li>
              <li>
                <strong>Runtime parity</strong>
                <span>
                  governed {sessionVoiceRuntimeSummary.usesGovernedRuntimeConsistent ? 'consistent' : 'waiting'}
                  {' · evidence/gates '}
                  {sessionVoiceRuntimeSummary.evidenceAndGateParityConsistent ? 'consistent' : 'waiting'}
                </span>
                <em>stream source {sessionVoiceRuntimeSummary.runtimeEventSourceConsistent ? 'consistent' : 'waiting'} · fallback {sessionVoiceRuntimeSummary.typedFallbackAvailable ? 'ready' : 'waiting'}</em>
              </li>
              <li>
                <strong>Voice posture</strong>
                <span>
                  push-to-talk {sessionVoiceRuntimeSummary.pushToTalkReady ? 'ready' : 'waiting'}
                  {' · consent '}
                  {sessionVoiceRuntimeSummary.consentBoundaries.map((boundary) => boundary.replaceAll('_', ' ')).join(' · ') || 'not captured'}
                </span>
                <em>enabled modes {sessionVoiceRuntimeSummary.enabledModes.map((mode) => mode.replaceAll('_', ' ')).join(' · ') || 'none captured'}</em>
              </li>
              <li>
                <strong>Compatible views</strong>
                <span>{sessionVoiceRuntimeSummary.compatibleViewIds.slice(0, 5).map((viewId) => viewId.replaceAll('_', ' ')).join(' · ') || 'No voice-compatible views captured.'}</span>
                <em>{sessionVoiceRuntimeSummary.latestStreamEventTypes.slice(0, 5).join(' · ') || 'No stream events captured yet.'}</em>
              </li>
              <li>
                <strong>Disabled runtime paths</strong>
                <span>
                  continuous {sessionVoiceRuntimeSummary.continuousModeEnabled ? 'enabled' : 'disabled'}
                  {' · realtime '}
                  {sessionVoiceRuntimeSummary.realtimeVoiceEnabled ? 'enabled' : 'disabled'}
                  {' · TTS '}
                  {sessionVoiceRuntimeSummary.ttsEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>background listening {sessionVoiceRuntimeSummary.backgroundListeningEnabled ? 'enabled' : 'disabled'} · provider bypass {sessionVoiceRuntimeSummary.providerBypassAllowed ? 'allowed' : 'blocked'}</em>
              </li>
            </ul>
            <p>{sessionVoiceRuntimeSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Voice Contract</h3>
            <ul>
              <li>
                <strong>{sessionVoiceContractSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionVoiceContractSummary.turnsWithVoiceContracts} turns</span>
                <em>{sessionVoiceContractSummary.usedSkillIds.length} skills · {sessionVoiceContractSummary.compatibleViewIds.length} compatible views</em>
              </li>
              <li>
                <strong>Mode posture</strong>
                <span>
                  ready {sessionVoiceContractSummary.readyModeIds.join(', ') || 'none'}
                  {' · blocked '}
                  {sessionVoiceContractSummary.blockedModeIds.length}
                </span>
                <em>gated: {sessionVoiceContractSummary.gatedModeIds.join(', ') || 'none'}</em>
              </li>
              <li>
                <strong>Compatibility</strong>
                <span>
                  skills {sessionVoiceContractSummary.activeSkillCompatibilityConsistent ? 'consistent' : 'check needed'}
                  {' · views '}
                  {sessionVoiceContractSummary.activeViewCompatibilityConsistent ? 'consistent' : 'check needed'}
                </span>
                <em>{sessionVoiceContractSummary.incompatibleViewIds.join(' · ') || 'No incompatible views captured.'}</em>
              </li>
              <li>
                <strong>Disabled contracts</strong>
                <span>
                  continuous {sessionVoiceContractSummary.continuousVoiceEnabled ? 'enabled' : 'disabled'}
                  {' · realtime '}
                  {sessionVoiceContractSummary.realtimeVoiceEnabled ? 'enabled' : 'disabled'}
                  {' · TTS '}
                  {sessionVoiceContractSummary.ttsEnabled ? 'enabled' : 'disabled'}
                </span>
                <em>arbitrary skill routing {sessionVoiceContractSummary.arbitrarySkillRoutingEnabled ? 'enabled' : 'disabled'} · arbitrary UI {sessionVoiceContractSummary.arbitraryViewGenerationEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{sessionVoiceContractSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Voice Readiness</h3>
            <ul>
              <li>
                <strong>{sessionVoiceReadinessSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionVoiceReadinessSummary.turnsWithVoiceReadiness} turns</span>
                <em>{sessionVoiceReadinessSummary.requirementStatusCounts.ready} ready · {sessionVoiceReadinessSummary.requirementStatusCounts.prototypeReady} prototype · {sessionVoiceReadinessSummary.requirementStatusCounts.blocked} blocked</em>
              </li>
              <li>
                <strong>Full voice</strong>
                <span>
                  realtime {sessionVoiceReadinessSummary.realtimeVoiceEnabled ? 'enabled' : 'gated'}
                  {' · continuous '}
                  {sessionVoiceReadinessSummary.continuousVoiceEnabled ? 'enabled' : 'gated'}
                  {' · TTS '}
                  {sessionVoiceReadinessSummary.ttsEnabled ? 'enabled' : 'gated'}
                </span>
                <em>Runtime parity: {sessionVoiceReadinessSummary.realtimeRuntimeParity ? 'ready' : 'not yet'}</em>
              </li>
              <li>
                <strong>Blocked requirements</strong>
                <span>{sessionVoiceReadinessSummary.blockedRequirementIds.length}</span>
                <em>{sessionVoiceReadinessSummary.blockedRequirementIds.slice(0, 4).join(' · ') || 'No blockers captured yet.'}</em>
              </li>
              <li>
                <strong>Governance checks</strong>
                <span>consent/privacy {sessionVoiceReadinessSummary.consentPrivacyReady ? 'ready' : 'blocked'}</span>
                <em>server cancel {sessionVoiceReadinessSummary.serverCancellationReady ? 'ready' : 'blocked'} · storage {sessionVoiceReadinessSummary.enterpriseVoiceStorageReady ? 'ready' : 'blocked'}</em>
              </li>
              <li>
                <strong>Next promotion step</strong>
                <span>{sessionVoiceReadinessSummary.latestNextPromotionStep ?? 'No voice readiness turn captured yet.'}</span>
                <em>Wake/listen: {sessionVoiceReadinessSummary.wakeListenEnabled ? 'enabled' : 'gated'}</em>
              </li>
            </ul>
            <p>{sessionVoiceReadinessSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Experience Architecture</h3>
            <ul>
              <li>
                <strong>{sessionExperienceArchitectureSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionExperienceArchitectureSummary.turnsWithExperienceArchitecture} turns</span>
                <em>{sessionExperienceArchitectureSummary.approvedRegistrySnapshot.latestTemplateCount} templates · {sessionExperienceArchitectureSummary.approvedRegistrySnapshot.latestSkillCount} skills · {sessionExperienceArchitectureSummary.approvedRegistrySnapshot.latestViewCount} views approved</em>
              </li>
              <li>
                <strong>Templates</strong>
                <span>{sessionExperienceArchitectureSummary.activeTemplates.length}</span>
                <em>{sessionExperienceArchitectureSummary.activeTemplates.slice(0, 3).map((template) => `${template.templateId} (${template.count})`).join(' · ') || 'No templates composed yet.'}</em>
              </li>
              <li>
                <strong>Audiences / objectives</strong>
                <span>{sessionExperienceArchitectureSummary.activeAudiences.length} audiences</span>
                <em>{sessionExperienceArchitectureSummary.activeObjectives.slice(0, 3).map((objective) => `${objective.objective} (${objective.count})`).join(' · ') || 'No objectives captured yet.'}</em>
              </li>
              <li>
                <strong>Rendered views</strong>
                <span>{sessionExperienceArchitectureSummary.renderedViewIds.length}</span>
                <em>{sessionExperienceArchitectureSummary.renderedViewIds.slice(0, 4).join(' · ') || 'No rendered views captured yet.'}</em>
              </li>
              <li>
                <strong>Composition blockers</strong>
                <span>{sessionExperienceArchitectureSummary.compositionBlockers.length}</span>
                <em>Arbitrary UI: {sessionExperienceArchitectureSummary.arbitraryViewIdsAllowed ? 'allowed' : 'blocked'} · new source claims: {sessionExperienceArchitectureSummary.newSourceClaimGenerationEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{sessionExperienceArchitectureSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Runtime Surfaces</h3>
            <ul>
              <li>
                <strong>{sessionRuntimeSurfaceSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sessionRuntimeSurfaceSummary.turnsWithRuntimeSurface} turns</span>
                <em>Store: {sessionRuntimeSurfaceSummary.store} · governed runtime only: {sessionRuntimeSurfaceSummary.governedRuntimeOnly ? 'yes' : 'no'}</em>
              </li>
              <li>
                <strong>Latest surface</strong>
                <span>{sessionRuntimeSurfaceSummary.latestSurface?.surfaceName ?? 'No runtime surface yet'}</span>
                <em>{sessionRuntimeSurfaceSummary.latestSurface ? `${sessionRuntimeSurfaceSummary.latestSurface.surfaceId} · ${sessionRuntimeSurfaceSummary.latestSurface.status.replaceAll('_', ' ')}` : 'Waiting for a governed turn.'}</em>
              </li>
              <li>
                <strong>Used surfaces</strong>
                <span>{sessionRuntimeSurfaceSummary.usedSurfaceIds.length}</span>
                <em>{sessionRuntimeSurfaceSummary.activeSurfaces.slice(0, 3).map((surface) => `${surface.surfaceId} (${surface.count})`).join(' · ') || 'No surfaces recorded yet.'}</em>
              </li>
              <li>
                <strong>Streaming / voice</strong>
                <span>{sessionRuntimeSurfaceSummary.streamingTurns} streaming turns</span>
                <em>{sessionRuntimeSurfaceSummary.pushToTalkTurns} push-to-talk turns · Realtime {sessionRuntimeSurfaceSummary.realtimeVoiceEnabled ? 'enabled' : 'gated'} · TTS {sessionRuntimeSurfaceSummary.ttsEnabled ? 'enabled' : 'gated'}</em>
              </li>
              <li>
                <strong>Blocked attempts</strong>
                <span>{sessionRuntimeSurfaceSummary.gatedOrDisabledSurfaceAttempts}</span>
                <em>Full voice: {sessionRuntimeSurfaceSummary.fullVoiceEnabled ? 'enabled' : 'gated'} · source writes: {sessionRuntimeSurfaceSummary.sourceWriteRuntimeEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Surface guardrails</strong>
                <span>{sessionRuntimeSurfaceSummary.allUsedSurfacesGuarded ? 'all observed pass' : 'watch needed'}</span>
                <em>{sessionRuntimeSurfaceSummary.surfaceGuardrailMatrix.slice(0, 4).map((surface) => `${surface.surfaceId}: ${surface.guardrailStatus}`).join(' · ') || 'No surface guardrails observed yet.'}</em>
              </li>
              <li>
                <strong>Disabled promotions</strong>
                <span>
                  export {sessionRuntimeSurfaceSummary.surfaceGuardrailMatrix.every((surface) => !surface.exportRuntimeEnabled) ? 'disabled' : 'check'}
                  {' · source write '}
                  {sessionRuntimeSurfaceSummary.surfaceGuardrailMatrix.every((surface) => !surface.sourceWriteRuntimeEnabled) ? 'disabled' : 'check'}
                </span>
                <em>continuous voice {sessionRuntimeSurfaceSummary.surfaceGuardrailMatrix.every((surface) => !surface.continuousVoiceEnabled) ? 'disabled' : 'check'} · TTS {sessionRuntimeSurfaceSummary.surfaceGuardrailMatrix.every((surface) => !surface.ttsEnabled) ? 'disabled' : 'check'}</em>
              </li>
              {sessionRuntimeSurfaceSummary.runtimeSurfacePromotionProtocol.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{item.status.replaceAll('_', ' ')} · before {item.requiredBefore.replaceAll('_', ' ')}</span>
                  <em>{item.blockers.length ? item.blockers.slice(0, 3).map((blocker) => blocker.replaceAll('_', ' ')).join(' · ') : 'No blocker in prototype review state.'} · promotion enabled: no</em>
                </li>
              ))}
            </ul>
            <p>{sessionRuntimeSurfaceSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Source Governance</h3>
            <ul>
              <li>
                <strong>{sourceGovernanceSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{sourceGovernanceSummary.turnsWithSourceGovernance} turns</span>
                <em>Store: {sourceGovernanceSummary.store} · canonical sources: {sourceGovernanceSummary.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Source candidates</strong>
                <span>{sourceGovernanceSummary.sourcePromotionCandidates.total}</span>
                <em>{sourceGovernanceSummary.sourcePromotionCandidates.latestIds.slice(0, 3).join(' · ') || 'No reviewed source candidates yet.'}</em>
              </li>
              <li>
                <strong>Claim candidates</strong>
                <span>{sourceGovernanceSummary.sourceClaimCandidates.total}</span>
                <em>{sourceGovernanceSummary.sourceClaimCandidates.reviewed} reviewed observations · {sourceGovernanceSummary.sourceClaimCandidates.unreviewed} unreviewed observations</em>
              </li>
              <li>
                <strong>Runtime files</strong>
                <span>{sourceGovernanceSummary.runtimeFileDrop.latestStatus.replaceAll('_', ' ')}</span>
                <em>{sourceGovernanceSummary.runtimeFileDrop.latestCandidateFileCount} candidate files · {sourceGovernanceSummary.runtimeFileDrop.missingKinds.length} required kinds missing</em>
              </li>
              <li>
                <strong>Strategy files</strong>
                <span>{sourceGovernanceSummary.strategicContextRuntimeFileDrop.latestStatus.replaceAll('_', ' ')}</span>
                <em>{sourceGovernanceSummary.strategicContextRuntimeFileDrop.latestCandidateFileCount} candidate files · {sourceGovernanceSummary.strategicContextRuntimeFileDrop.missingKinds.length} required kinds missing</em>
              </li>
              <li>
                <strong>Runtime ingestion gate</strong>
                <span>{sourceRuntimeIngestionSummary.sourceOwnerFileCoverageStatus.replaceAll('_', ' ')}</span>
                <em>Ready to wire: {sourceRuntimeIngestionSummary.readyToWireDefaultRuntimeSource ? 'yes' : 'no'} · canonical use {sourceRuntimeIngestionSummary.canonicalUseEnabled ? 'enabled' : 'disabled'} · runtime consumption {sourceRuntimeIngestionSummary.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Source-owner files</strong>
                <span>{sourceRuntimeIngestionSummary.loadedFileKinds.length}/{sourceRuntimeIngestionSummary.requiredFileKinds.length} loaded</span>
                <em>{sourceRuntimeIngestionSummary.missingFileKinds.map((fileKind) => fileKind.replaceAll('_', ' ')).join(' · ') || 'All required file kinds observed for governance review.'}</em>
              </li>
              <li>
                <strong>Strategy source-owner files</strong>
                <span>{sourceRuntimeIngestionSummary.strategicContextLoadedFileKinds.length}/{sourceRuntimeIngestionSummary.strategicContextRequiredFileKinds.length} loaded</span>
                <em>{sourceRuntimeIngestionSummary.strategicContextMissingFileKinds.map((fileKind) => fileKind.replaceAll('_', ' ')).join(' · ') || 'All Brand Strategic Context file kinds observed for governance review.'}</em>
              </li>
              <li>
                <strong>Next governance step</strong>
                <span>{sourceRuntimeIngestionSummary.nextIngestionStep}</span>
                <em>Runtime auto-consumption: {sourceGovernanceSummary.runtimeSourceAutoConsumptionEnabled ? 'enabled' : 'disabled'} · claim facts: {sourceGovernanceSummary.canonicalClaimFactsEnabled ? 'enabled' : 'disabled'}</em>
              </li>
            </ul>
            <p>{sourceGovernanceSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Learning Summary</h3>
            <ul>
              <li>
                <strong>{pilotLearningSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{pilotLearningSummary.turnsWithLearning} turns</span>
                <em>Store: {pilotLearningSummary.store} · autonomous learning: {pilotLearningSummary.autonomousLearningEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Signals</strong>
                <span>{pilotLearningSummary.signals.total}</span>
                <em>{pilotLearningSummary.signals.capturedForReview} captured · {pilotLearningSummary.signals.blocked} blocked · {pilotLearningSummary.signals.notAvailable} unavailable</em>
              </li>
              <li>
                <strong>Top signal types</strong>
                <span>{pilotLearningSummary.signalTypes.slice(0, 3).map((item) => `${item.type.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'none yet'}</span>
                <em>Outcome learning: {pilotLearningSummary.outcomeLearningEnabled ? 'enabled' : 'disabled'} · canonical writes: {pilotLearningSummary.canonicalSourceWriteEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Next proof needs</strong>
                <span>{pilotLearningSummary.nextProofNeeds.length}</span>
                <em>{pilotLearningSummary.nextProofNeeds.slice(0, 3).join(' · ') || 'No proof needs captured yet.'}</em>
              </li>
            </ul>
            <p>{pilotLearningSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Session Treatment Outcome Readiness</h3>
            <ul>
              <li>
                <strong>{treatmentOutcomeReadinessSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{treatmentOutcomeReadinessSummary.turnsWithTreatmentOutcomeReadiness} turns</span>
                <em>{treatmentOutcomeReadinessSummary.requirementStatusCounts.ready} ready · {treatmentOutcomeReadinessSummary.requirementStatusCounts.prototypeReady} prototype · {treatmentOutcomeReadinessSummary.requirementStatusCounts.blocked} blocked</em>
              </li>
              <li>
                <strong>Outcome learning</strong>
                <span>{treatmentOutcomeReadinessSummary.outcomeLearningEnabled ? 'enabled' : 'disabled'}</span>
                <em>efficacy claims {treatmentOutcomeReadinessSummary.treatmentOutcomeClaimsEnabled ? 'enabled' : 'disabled'} · canonical learning {treatmentOutcomeReadinessSummary.canonicalLearningStoreEnabled ? 'enabled' : 'disabled'}</em>
              </li>
              <li>
                <strong>Blocked requirements</strong>
                <span>{treatmentOutcomeReadinessSummary.blockedRequirementIds.length}</span>
                <em>{treatmentOutcomeReadinessSummary.blockedRequirementIds.slice(0, 4).join(' · ') || 'No blockers captured yet.'}</em>
              </li>
              <li>
                <strong>Linked signals</strong>
                <span>{treatmentOutcomeReadinessSummary.relatedTreatmentIds.length} treatments · {treatmentOutcomeReadinessSummary.relatedFollowUpSignals.length} follow-ups</span>
                <em>{treatmentOutcomeReadinessSummary.latestNextPromotionStep ?? 'No treatment outcome readiness turn captured yet.'}</em>
              </li>
            </ul>
            <p>{treatmentOutcomeReadinessSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Review Workflow</h3>
            <ul>
              <li>
                <strong>{reviewWorkflowSummary.mode.replaceAll('_', ' ')}</strong>
                <span>{reviewWorkflowSummary.reviewer}</span>
                <em>Store: {reviewWorkflowSummary.store} · official approval: {reviewWorkflowSummary.officialApprovalEnabled ? 'enabled' : 'blocked'}</em>
              </li>
              <li>
                <strong>Pending</strong>
                <span>{reviewWorkflowSummary.pending.total}</span>
                <em>{reviewWorkflowSummary.pending.memory} memory · {reviewWorkflowSummary.pending.artifacts} artifacts · {reviewWorkflowSummary.pending.confirmationGates} gates</em>
              </li>
              <li>
                <strong>Reviewed</strong>
                <span>{reviewWorkflowSummary.reviewed.totalReviews}</span>
                <em>{reviewWorkflowSummary.reviewed.acceptedMemory} accepted memory · {reviewWorkflowSummary.reviewed.approvedArtifacts} approved artifacts · {reviewWorkflowSummary.reviewed.approvedGates} approved gates</em>
              </li>
              <li>
                <strong>Blocked</strong>
                <span>{reviewWorkflowSummary.blocked.confirmationGates}</span>
                <em>{reviewWorkflowSummary.blocked.capabilityBlockedGates} capability gates require governance, not local approval</em>
              </li>
            </ul>
            <p>{reviewWorkflowSummary.caveats[0]}</p>
          </section>
          <section>
            <h3>Review Queue</h3>
            <div className="agent-review-stack">
              {pendingMemory.map((record) => (
                <article key={record.id}>
                  <strong>{record.label}</strong>
                  <span>Memory · {record.status}</span>
                  <em>{record.detail}</em>
                  <div>
                    <button type="button" onClick={() => reviewLedgerItem('memory', record.id, 'accepted')} disabled={isRunning}>Accept</button>
                    <button type="button" onClick={() => editMemory(record.id, record.detail)} disabled={isRunning}>Edit</button>
                    <button type="button" onClick={() => reviewLedgerItem('memory', record.id, 'rejected')} disabled={isRunning}>Reject</button>
                  </div>
                </article>
              ))}
              {pendingArtifacts.map((artifact) => (
                <article key={artifact.id}>
                  <strong>{artifact.label}</strong>
                  <span>Artifact · {artifact.status.replaceAll('_', ' ')} · {artifact.governance.circulationStatus.replaceAll('_', ' ')}</span>
                  <em>{artifact.governance.caveats[0] ?? (artifact.humanReviewRequired ? 'Human review required before circulation.' : 'Review before using.')}</em>
                  <div>
                    <button type="button" onClick={() => reviewLedgerItem('artifact', artifact.id, 'approved')} disabled={isRunning}>Approve</button>
                    <button type="button" onClick={() => reviewLedgerItem('artifact', artifact.id, 'rejected')} disabled={isRunning}>Reject</button>
                  </div>
                </article>
              ))}
              {pendingGates.map((gate) => (
                <article key={gate.id}>
                  <strong>{gate.label}</strong>
                  <span>Gate · {gate.action.replaceAll('_', ' ')}</span>
                  <em>{gate.reason}</em>
                  <div>
                    <button type="button" onClick={() => reviewLedgerItem('confirmation_gate', gate.id, 'approved')} disabled={isRunning}>Approve</button>
                    <button type="button" onClick={() => editGate(gate.id, gate.reason)} disabled={isRunning}>Edit</button>
                    <button type="button" onClick={() => reviewLedgerItem('confirmation_gate', gate.id, 'dismissed')} disabled={isRunning}>Dismiss</button>
                  </div>
                </article>
              ))}
              {pendingMemory.length + pendingArtifacts.length + pendingGates.length === 0 && (
                <p>No pending suggested memory, artifacts, or required gates in this session.</p>
              )}
            </div>
          </section>
          <section>
            <h3>Review History</h3>
            <ul>
              {reviewedRecords.map((review) => (
                <li key={review.id}>
                  <strong>{review.label}</strong>
                  <span>{review.itemType.replaceAll('_', ' ')} · {review.beforeStatus} {'->'} {review.afterStatus}</span>
                  <em>{review.note ?? review.decision}</em>
                </li>
              ))}
              {reviewedRecords.length === 0 && <li>No human review decisions yet.</li>}
            </ul>
          </section>
        </aside>
      </section>}

      <section className="agent-artifact-bar" aria-label="Session artifacts">
        <article>
          <span>Active packet</span>
          <strong>{result.packet.brand.brandName}</strong>
          <p>{activeBrand.category} · {activeBrand.period}</p>
        </article>
        <article>
          <span>Strategic context</span>
          <strong>{result.packet.strategicContext.status}</strong>
          <p>Do not infer brand intent or objectives until approved sources are loaded.</p>
        </article>
        <article>
          <span>Room to grow</span>
          <strong>{result.packet.roomToGrow.status}</strong>
          <p>{result.packet.roomToGrow.label}</p>
        </article>
        <article>
          <span>Memory / audit</span>
          <strong>{sessionLedger.memory.length} / {sessionLedger.audit.length}</strong>
          <p>{sessionLedger.confirmationGates.length} gates · {result.capabilities.filter((capability) => !capability.enabled).length} capabilities disabled</p>
        </article>
      </section>
    </main>
  );
}
