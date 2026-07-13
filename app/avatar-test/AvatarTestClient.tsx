'use client';

import { Brain, MessageCircle, Mic, PauseCircle, Sparkles, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from './avatar-test.module.css';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

const stateCopy: Record<AvatarState, {
  label: string;
  eyebrow: string;
  line: string;
  transcript: string;
}> = {
  idle: {
    label: 'Ready',
    eyebrow: 'Female voice matched',
    line: 'Brand Doctor is ready for a scoped consult.',
    transcript: 'Choose a moment below to preview how the visual presence could support the voice channel.'
  },
  listening: {
    label: 'Listening',
    eyebrow: 'Input active',
    line: 'She holds eye contact while the user speaks.',
    transcript: 'Listening for the active brand, active visual, and evidence-backed question.'
  },
  thinking: {
    label: 'Thinking',
    eyebrow: 'Grounding answer',
    line: 'The expression softens while evidence is checked.',
    transcript: 'Checking the Brand Health Record, evidence ledger, rule trace, and treatment library before answering.'
  },
  speaking: {
    label: 'Speaking',
    eyebrow: 'Response active',
    line: 'Mouth, posture, and signal bars animate with the spoken answer.',
    transcript: 'Here is the read: the diagnosis is an evidence-backed interpretation, and the treatment path is an option to test.'
  }
};

const controls: Array<{ state: AvatarState; icon: typeof PauseCircle }> = [
  { state: 'idle', icon: PauseCircle },
  { state: 'listening', icon: Mic },
  { state: 'thinking', icon: Brain },
  { state: 'speaking', icon: Volume2 }
];

export default function AvatarTestClient() {
  const [avatarState, setAvatarState] = useState<AvatarState>('speaking');
  const activeCopy = stateCopy[avatarState];
  const stageClassName = useMemo(
    () => `${styles.avatarStage} ${styles[avatarState]}`,
    [avatarState]
  );

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.backLink}>
          BBE Brand Doctor
        </Link>
        <span className={styles.prototypePill}>Avatar visualization test</span>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Live Consult presence layer</p>
          <h1>Female Brand Doctor Avatar</h1>
          <p>
            A lightweight visual companion for the current female voice channel, styled as a fictional senior brand advisor.
          </p>
        </div>
        <div className={styles.voiceBadge}>
          <Sparkles size={18} aria-hidden="true" />
          <span>Fictional advisor persona</span>
        </div>
      </section>

      <section className={styles.workspace} aria-label="Avatar test surface">
        <div className={stageClassName}>
          <div className={styles.statusRail}>
            <span>{activeCopy.eyebrow}</span>
            <strong>{activeCopy.label}</strong>
          </div>

          <div className={styles.avatarHalo} aria-hidden="true" />

          <div className={styles.avatarFrame} aria-label={`Brand Doctor avatar is ${activeCopy.label.toLowerCase()}`}>
            <div className={styles.avatar}>
              <div className={styles.hairBack} />
              <div className={styles.neck} />
              <div className={styles.shoulders}>
                <div className={styles.lapelLeft} />
                <div className={styles.lapelRight} />
                <div className={styles.blouse} />
              </div>
              <div className={styles.face}>
                <div className={styles.hairSweep} />
                <div className={styles.hairSideLeft} />
                <div className={styles.hairSideRight} />
                <div className={styles.browLeft} />
                <div className={styles.browRight} />
                <div className={styles.eyeLeft} />
                <div className={styles.eyeRight} />
                <div className={styles.nose} />
                <div className={styles.cheekLeft} />
                <div className={styles.cheekRight} />
                <div className={styles.mouth} />
              </div>
            </div>
          </div>

          <div className={styles.signalPanel}>
            <div className={styles.signalBars} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>{activeCopy.line}</p>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <div>
            <p className={styles.kicker}>Consult channel</p>
            <h2>Visual states</h2>
          </div>

          <div className={styles.controlGrid} aria-label="Avatar state controls">
            {controls.map(({ state, icon: Icon }) => (
              <button
                className={avatarState === state ? styles.activeControl : styles.control}
                key={state}
                onClick={() => setAvatarState(state)}
                type="button"
              >
                <Icon size={17} aria-hidden="true" />
                <span>{stateCopy[state].label}</span>
              </button>
            ))}
          </div>

          <div className={styles.transcriptCard}>
            <div className={styles.transcriptHeader}>
              <MessageCircle size={18} aria-hidden="true" />
              <span>{activeCopy.label}</span>
            </div>
            <p>{activeCopy.transcript}</p>
          </div>

          <div className={styles.notes}>
            <h3>Prototype read</h3>
            <p>
              This keeps the interface human and voice-matched without using a real executive likeness. It can later be swapped for a vendor video avatar or a more polished illustrated asset.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
