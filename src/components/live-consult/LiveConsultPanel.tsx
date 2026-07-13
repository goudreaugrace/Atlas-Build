'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle2, FileText, Mic, MicOff, Navigation, Pause, Play, Sparkles, Volume2, X } from 'lucide-react';
import { z } from 'zod';
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents/realtime';
import { getNoMagicContext } from '@/src/lib/brand-context';
import {
  findLiveConsultAction,
  liveConsultActionTargetIds,
  liveConsultActions,
  liveConsultScenarios,
} from '@/src/lib/live-consult/actions';
import { buildLiveConsultInstructions } from '@/src/lib/live-consult/context';
import { answerDialogQuestion, getAiPersona, getTreatmentPlanOptions } from '@/src/lib/data';
import MarkdownMessage from '@/src/components/common/MarkdownMessage';
import GovernedProofStrip from '@/src/components/intelligence/GovernedProofStrip';
import { governedChatProofFromResponse, type GovernedChatProof } from '@/src/lib/intelligence/governed-proof';
import type { BrandHealthRecord } from '@/src/types/domain';

type ConsultStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'fallback' | 'error';
type EvidenceChip = { label: string; value: string; detail?: string };
type TranscriptItem = {
  role: 'assistant' | 'user' | 'system';
  text: string;
  chips?: EvidenceChip[];
  source?: 'openai' | 'grounded_fallback' | 'skill_router';
  proof?: GovernedChatProof;
};

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function scrollToElement(elementIds: string[]) {
  const target = elementIds.map((elementId) => document.getElementById(elementId)).find(Boolean);
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('live-consult-focus');
  window.setTimeout(() => target.classList.remove('live-consult-focus'), 2600);
  return true;
}

function speakFallback(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 0.96;
  window.speechSynthesis.speak(utterance);
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

function transcriptSourceLabel(source: TranscriptItem['source']) {
  if (source === 'skill_router') return 'Governed runtime';
  if (source === 'openai') return 'Live LLM';
  return 'Grounded fallback';
}

export default function LiveConsultPanel({
  record,
  personaId,
  onOpenRuleTrace
}: {
  record: BrandHealthRecord;
  personaId: string;
  onOpenRuleTrace: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ConsultStatus>('idle');
  const [statusNote, setStatusNote] = useState('Ready for a brand consult.');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [useGovernedFallback, setUseGovernedFallback] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([
    { role: 'assistant', text: `Ready to talk through ${record.brandName}. Try: "Give me the boardroom version" or "Prove it."` }
  ]);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
  const activeRecordRef = useRef(record);
  activeRecordRef.current = record;
  const treatments = useMemo(() => getTreatmentPlanOptions(record), [record]);
  const noMagic = useMemo(() => getNoMagicContext(record, personaId, 'live_consult'), [record, personaId]);
  const persona = getAiPersona(personaId);

  function coreEvidenceChips(): EvidenceChip[] {
    return [
      { label: 'Brand', value: record.brandName, detail: record.category },
      { label: 'Diagnosis', value: noMagic.logic[0]?.replace('Primary diagnosis: ', '') ?? 'Primary diagnosis' },
      { label: 'Rule', value: noMagic.logic[1]?.replace('Rule fired: ', '') ?? 'Rule trace' },
      { label: 'Source', value: record.period, detail: record.sourceFiles[0] }
    ];
  }

  function chipsForAction(actionId: string): EvidenceChip[] {
    const action = findLiveConsultAction(actionId);
    if (!action) return coreEvidenceChips().slice(0, 2);

    if (action.type === 'highlight_metric') {
      const metricEvidence = noMagic.evidence.find((item) => item.label === action.targetMetric);
      return metricEvidence
        ? [{ label: metricEvidence.label, value: metricEvidence.value, detail: `${metricEvidence.status} · ${metricEvidence.source}` }]
        : coreEvidenceChips().slice(0, 2);
    }

    if (action.type === 'select_treatment_path') {
      const treatment = treatments[(action.targetRank ?? 1) - 1] ?? treatments[0];
      return treatment
        ? [{ label: 'Treatment', value: treatment.name, detail: `Fit ${Math.round(treatment.score)} · ${treatment.tier}` }]
        : coreEvidenceChips().slice(0, 2);
    }

    if (action.type === 'open_rule_trace') {
      return [
        { label: 'Rule', value: noMagic.logic[1]?.replace('Rule fired: ', '') ?? 'Rule trace' },
        { label: 'Confidence', value: noMagic.logic[2]?.replace('Confidence: ', '') ?? 'Evidence confidence' }
      ];
    }

    if (action.type === 'create_meeting_takeaway') {
      return [
        { label: 'Decision', value: noMagic.logic[0]?.replace('Primary diagnosis: ', '') ?? 'Diagnosis' },
        { label: 'Next proof', value: 'Follow-up signals', detail: 'Diagnosis, caveat, treatment, signal' }
      ];
    }

    return coreEvidenceChips().slice(0, 3);
  }

  function chipsForPrompt(preferredActions: string[]) {
    const chips = preferredActions.flatMap((actionId) => chipsForAction(actionId));
    const unique = new Map<string, EvidenceChip>();
    for (const chip of [...chips, ...coreEvidenceChips()]) {
      unique.set(`${chip.label}-${chip.value}`, chip);
    }
    return Array.from(unique.values()).slice(0, 4);
  }

  function stopAudioChannels() {
    sessionRef.current?.close();
    sessionRef.current = null;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  useEffect(() => {
    resetConsultState(false);
    return () => stopAudioChannels();
  }, [record, personaId]);

  function resetConsultState(closePanel = false) {
    stopAudioChannels();
    setStatus('idle');
    setStatusNote(`Ready for a ${record.brandName} brand consult.`);
    setActiveAction(null);
    if (closePanel) setOpen(false);
    setTranscript([
      {
        role: 'assistant',
        text: `Ready to talk through ${record.brandName}. Try: "Give me the boardroom version" or "Prove it."`,
        chips: coreEvidenceChips().slice(0, 3)
      }
    ]);
  }

  useEffect(() => {
    function onReset() {
      resetConsultState(true);
    }

    function onRunScenario(event: Event) {
      const scenarioId = (event as CustomEvent<{ scenarioId?: string }>).detail?.scenarioId;
      const scenario = liveConsultScenarios.find((item) => item.id === scenarioId);
      if (scenario) askFallback(scenario.prompt, scenario.preferredActions);
    }

    window.addEventListener('brand-doctor-reset-demo', onReset);
    window.addEventListener('live-consult-run-scenario', onRunScenario);
    return () => {
      window.removeEventListener('brand-doctor-reset-demo', onReset);
      window.removeEventListener('live-consult-run-scenario', onRunScenario);
    };
  }, [record, personaId]);

  function addTranscript(role: TranscriptItem['role'], text: string, chips?: EvidenceChip[], source?: TranscriptItem['source'], proof?: GovernedChatProof) {
    setTranscript((items) => [...items.slice(-7), { role, text, chips, source, proof }]);
  }

  function executeVisualAction(actionId: string, note?: string) {
    const action = findLiveConsultAction(actionId);
    if (!action) return `Unknown visual action: ${actionId}`;

    setActiveAction(action.label);
    window.setTimeout(() => setActiveAction(null), 3200);

    if (action.type === 'open_rule_trace') {
      onOpenRuleTrace();
      addTranscript('system', note || action.spokenCue, chipsForAction(actionId));
      return `${action.label}: rule trace opened.`;
    }

    if (action.type === 'highlight_metric') {
      const ok = scrollToElement(liveConsultActionTargetIds(action));
      addTranscript('system', note || `${action.spokenCue} ${ok ? '' : 'The metric module was not visible.'}`.trim(), chipsForAction(actionId));
      return `${action.label}: ${ok ? 'metric highlighted' : 'metric target not found'}.`;
    }

    if (action.type === 'select_treatment_path') {
      window.dispatchEvent(new CustomEvent('live-consult-select-treatment', { detail: { rank: action.targetRank ?? 1 } }));
      scrollToElement(liveConsultActionTargetIds(action));
      addTranscript('system', note || action.spokenCue, chipsForAction(actionId));
      return `${action.label}: treatment path selected.`;
    }

    if (action.type === 'create_meeting_takeaway') {
      addTranscript('system', note || action.spokenCue, chipsForAction(actionId));
      return `${action.label}: use the current diagnosis, proof, caveat, and next signal in the spoken answer.`;
    }

    const ok = scrollToElement(liveConsultActionTargetIds(action));
    addTranscript('system', note || `${action.spokenCue} ${ok ? '' : 'The section target was not visible.'}`.trim(), chipsForAction(actionId));
    return `${action.label}: ${ok ? 'section opened' : 'section target not found'}.`;
  }

  async function startRealtimeConsult() {
    setOpen(true);
    setStatus('connecting');
    setStatusNote('Starting a live voice consult...');
    const requestBrandId = record.brandId;

    try {
      if (!window.navigator?.mediaDevices?.getUserMedia) {
        throw new Error('browser_missing_get_user_media');
      }
      const response = await fetch('/api/live-consult/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ brandId: record.brandId, personaId })
      });
      const tokenData = await response.json();
      if (!response.ok || !tokenData.clientSecret) throw new Error(tokenData.error ?? 'session_unavailable');
      if (activeRecordRef.current.brandId !== requestBrandId || tokenData.brandId !== requestBrandId) {
        throw new Error('brand_context_changed');
      }

      const visualTool = tool({
        name: 'drive_brand_doctor_screen',
        description: 'Use this to control the visible Brand Doctor report. Only choose action IDs from the allowed action list.',
        parameters: z.object({
          actionId: z.string().describe('Allowed visual action id.'),
          note: z.string().nullable().describe('Brief human-readable reason for the action.')
        }),
        execute: async ({ actionId, note }) => executeVisualAction(actionId, note ?? undefined)
      });

      const agent = new RealtimeAgent({
        name: 'Brand Doctor Live Consult',
        voice: tokenData.voice,
        instructions: buildLiveConsultInstructions(record, personaId),
        tools: [visualTool]
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
        setStatus('speaking');
        setStatusNote('Brand Doctor is speaking.');
      });
      session.on('audio_stopped', () => {
        setStatus('listening');
        setStatusNote('Listening. Ask naturally.');
      });
      session.on('agent_start', () => {
        setStatus('thinking');
        setStatusNote('Reading evidence and deciding what to show.');
      });
      session.on('agent_end', (_context, _agent, output) => {
        if (output) addTranscript('assistant', output, coreEvidenceChips());
        setStatus('listening');
        setStatusNote('Listening. Ask naturally.');
      });
      session.on('transport_event', (event) => {
        if (event.type === 'conversation.item.input_audio_transcription.completed' && typeof event.transcript === 'string') {
          addTranscript('user', event.transcript);
        }
      });
      session.on('error', (event) => {
        const detail = realtimeFailureRead(event);
        console.warn(`Live Consult realtime session error: ${detail}`);
        setStatus('error');
        setStatusNote(`Realtime had trouble: ${detail}`);
        addTranscript('system', `Realtime voice error: ${detail}`, coreEvidenceChips().slice(0, 2));
      });

      await session.connect({ apiKey: tokenData.clientSecret, model: tokenData.model });
      if (activeRecordRef.current.brandId !== requestBrandId) {
        session.close();
        return;
      }
      sessionRef.current = session;
      setStatus('listening');
      setStatusNote('Live voice consult connected. Ask your question out loud.');
      addTranscript('system', 'Live Realtime voice connected.', coreEvidenceChips().slice(0, 2));
    } catch (error) {
      const detail = realtimeFailureRead(error);
      console.warn(`Live Consult realtime fallback: ${detail}`);
      setStatus('fallback');
      setStatusNote(`Realtime is not available: ${detail}`);
      addTranscript('system', `Realtime was unavailable: ${detail}. Browser voice fallback is still available.`, coreEvidenceChips().slice(0, 2));
    }
  }

  async function askFallback(question: string, preferredActions: string[] = []) {
    setOpen(true);
    setStatus('thinking');
    setStatusNote(useGovernedFallback ? 'Running the governed fallback runtime with proof rails.' : 'Reading the brand packet and preparing a grounded answer.');
    const answerChips = chipsForPrompt(preferredActions);
    addTranscript('user', question);
    const requestBrandId = record.brandId;
    for (const actionId of preferredActions.slice(0, 2)) executeVisualAction(actionId);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          brandId: record.brandId,
          category: record.category,
          mode: 'insights',
          activeVisual: 'brand_health_panel',
          personaId,
          conversationMode: 'live_consult',
          useSkillRouter: useGovernedFallback,
          sessionId: useGovernedFallback ? `live-consult-fallback-${record.brandId}` : undefined
        })
      });
      const data = await response.json();
      const answer = String(data.answer ?? answerDialogQuestion({ question, brandId: record.brandId, category: record.category }));
      if (activeRecordRef.current.brandId !== requestBrandId) return;
      addTranscript('assistant', answer, answerChips, data.source, governedChatProofFromResponse(data));
      speakFallback(answer.replace(/\*\*/g, '').slice(0, 700));
      setStatus('fallback');
      setStatusNote(useGovernedFallback ? 'Governed browser fallback is ready.' : 'Browser voice fallback is ready.');
    } catch {
      if (activeRecordRef.current.brandId !== requestBrandId) return;
      const fallbackAnswer = `I can still ground this locally: ${record.brandName} is being read through the deterministic diagnosis, evidence ledger, and treatment library. Open the evidence trace when you want the proof.`;
      addTranscript('assistant', fallbackAnswer, answerChips);
      speakFallback(fallbackAnswer);
      setStatus('fallback');
      setStatusNote('Local fallback answered from the visible brand context.');
    }
  }

  function startBrowserSpeech() {
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('fallback');
      setStatusNote('This browser does not expose speech recognition. Use the demo prompt buttons.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const result = Array.from(event.results).find((item) => item.isFinal) ?? event.results[0];
      const spoken = result?.[0]?.transcript ?? '';
      if (spoken.trim()) askFallback(spoken);
    };
    recognition.onerror = () => {
      setStatus('fallback');
      setStatusNote('Speech recognition could not hear that. Try a demo prompt.');
    };
    recognition.onend = () => {
      if (status === 'listening') setStatus('fallback');
    };
    recognitionRef.current = recognition;
    setStatus('listening');
    setStatusNote('Listening through browser speech recognition.');
    recognition.start();
  }

  function stopConsult() {
    stopAudioChannels();
    setStatus('idle');
    setStatusNote('Consult paused.');
  }

  return (
    <div className={`live-consult ${open ? 'open' : ''}`}>
      {!open && (
        <button className="live-consult-launch" type="button" onClick={() => setOpen(true)}>
          <Mic size={17} /> Live Consult
        </button>
      )}

      {open && (
        <section className="live-consult-panel" aria-label="Brand Doctor Live Consult">
          <div className="live-consult-head">
            <div className={`live-avatar ${status}`}>
              <Bot size={22} />
              <span />
            </div>
            <div>
              <strong>Brand Doctor Live</strong>
              <p>{record.brandName} · {persona.shortName}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Live Consult"><X size={16} /></button>
          </div>

          <div className="live-consult-status">
            <span className={status}>{status}</span>
            <p>{statusNote}</p>
          </div>

          <div className="live-consult-boundary">
            <span>Report consult</span>
            <p>Use this for grounded discussion and screen navigation. Use Jarvis when you want a governed output saved to {record.brandName} Work.</p>
            <a href={`/brand/${record.brandId}/jarvis`}>Open Jarvis</a>
          </div>

          {activeAction && (
            <div className="live-consult-action">
              <Navigation size={15} /> {activeAction}
            </div>
          )}

          <div className="live-consult-spotlight" aria-label="Evidence spotlight">
            <div>
              <FileText size={14} />
              <strong>Evidence spotlight</strong>
            </div>
            <div className="live-consult-chips">
              {coreEvidenceChips().slice(0, 3).map((chip) => (
                <span key={`${chip.label}-${chip.value}`}>
                  <b>{chip.label}</b>
                  {chip.value}
                </span>
              ))}
            </div>
          </div>

          <div className="live-consult-controls">
            <button type="button" onClick={startRealtimeConsult}>
              <Play size={15} /> Start voice
            </button>
            <button type="button" onClick={startBrowserSpeech}>
              <Volume2 size={15} /> Browser voice
            </button>
            <button
              type="button"
              className={useGovernedFallback ? 'active' : ''}
              onClick={() => setUseGovernedFallback((current) => !current)}
              aria-pressed={useGovernedFallback}
            >
              <CheckCircle2 size={15} /> {useGovernedFallback ? 'Governed fallback' : 'Scoped fallback'}
            </button>
            <button type="button" onClick={stopConsult}>
              <Pause size={15} /> Pause
            </button>
          </div>

          <div className="live-consult-prompts">
            {liveConsultScenarios.map((scenario) => (
              <button key={scenario.id} type="button" onClick={() => askFallback(scenario.prompt, scenario.preferredActions)}>
                <Sparkles size={13} /> {scenario.label}
              </button>
            ))}
          </div>

          <div className="live-consult-transcript">
            {transcript.map((item, index) => (
              <article key={`${item.role}-${index}`} className={item.role}>
                <span>{item.role}</span>
                {item.role === 'assistant' ? <MarkdownMessage text={item.text} /> : <p>{item.text}</p>}
                {item.source && <em className={`live-consult-source ${item.source}`}>{transcriptSourceLabel(item.source)}</em>}
                <GovernedProofStrip proof={item.proof} />
                {item.chips?.length ? (
                  <div className="live-consult-citations">
                    {item.chips.map((chip) => (
                      <span key={`${chip.label}-${chip.value}`}>
                        <b>{chip.label}</b>
                        {chip.value}
                        {chip.detail && <em>{chip.detail}</em>}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <details className="live-consult-proof">
            <summary><CheckCircle2 size={14} /> No Magic context</summary>
            <ul>
              {noMagic.logic.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>Actions available: {liveConsultActions.length}. Voice controls can only use the allowlisted screen actions.</p>
          </details>
        </section>
      )}

      {!open && status !== 'idle' && (
        <button className="live-consult-mini" type="button" onClick={() => setOpen(true)}>
          {status === 'speaking' ? <Mic size={15} /> : <MicOff size={15} />} {status}
        </button>
      )}
    </div>
  );
}
