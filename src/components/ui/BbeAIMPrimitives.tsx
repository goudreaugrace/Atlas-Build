import type { ElementType, ReactNode } from 'react';

export type BbeTone = 'neutral' | 'good' | 'watch' | 'bad' | 'dark';

export type BbeSectionLabelProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export type BbeSurfaceCardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
};

export type BbeTrustBadgeProps = {
  children: ReactNode;
  tone?: BbeTone;
};

export type BbeProofCardProps = {
  label: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  tone?: BbeTone;
  className?: string;
};

export type BbeSmartPromptStripProps = {
  intro: ReactNode;
  prompts: string[];
  tone?: 'light' | 'dark';
};

export type BbePunchlineBandProps = {
  children: ReactNode;
  meta?: ReactNode;
};

export type BbeMicroMomentProps = {
  label?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BbeSectionLabel({ children, icon, className }: BbeSectionLabelProps) {
  return (
    <span className={cx('bbe-section-label', className)}>
      {icon}
      {children}
    </span>
  );
}

export function BbeSurfaceCard({ as, children, className, id }: BbeSurfaceCardProps) {
  const Component = as ?? 'article';
  return (
    <Component className={cx('bbe-surface-card', className)} id={id}>
      {children}
    </Component>
  );
}

export function BbeTrustBadge({ children, tone = 'neutral' }: BbeTrustBadgeProps) {
  return <span className={cx('bbe-trust-badge', tone !== 'neutral' && `is-${tone}`)}>{children}</span>;
}

export function BbeProofCard({ label, title, children, tone = 'neutral', className }: BbeProofCardProps) {
  return (
    <article className={cx('bbe-proof-card', tone !== 'neutral' && `is-${tone}`, className)}>
      <span>{label}</span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </article>
  );
}

export function BbeSmartPromptStrip({ intro, prompts, tone = 'light' }: BbeSmartPromptStripProps) {
  return (
    <div className={cx('bbe-smart-prompt-strip', tone === 'dark' && 'is-dark')} aria-label="Smart follow-up prompts">
      <span className="bbe-signal-dot" aria-hidden="true" />
      <p>{intro}</p>
      <div>
        {prompts.map((prompt, index) => (
          <span className="bbe-smart-chip" key={`${prompt}-${index}`}>
            {prompt}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BbePunchlineBand({ children, meta }: BbePunchlineBandProps) {
  return (
    <footer className="bbe-punchline-band">
      <strong>{children}</strong>
      {meta && <span>{meta}</span>}
    </footer>
  );
}

export function BbeMicroMoment({ label = 'Delight detail', title, children }: BbeMicroMomentProps) {
  return (
    <article className="bbe-micro-moment">
      <span>{label}</span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </article>
  );
}
