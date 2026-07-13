import { Radar, Sparkles } from 'lucide-react';
import AtlasThinkingClient from './AtlasThinkingClient';

type AtlasThinkingPageProps = {
  searchParams: Promise<{ prompt?: string }>;
};

export default async function AtlasThinkingPage({ searchParams }: AtlasThinkingPageProps) {
  const query = await searchParams;
  const prompt = query.prompt?.trim() || 'Create the Carrefour strategy brief';
  const outputHref = `/atlas-output?prompt=${encodeURIComponent(prompt)}`;

  return (
    <main className="jarvis-page jarvis-immersive atlas-jarvis-home atlas-command-home atlas-landing-only jarvis-state-thinking">
      <AtlasThinkingClient outputHref={outputHref} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.setTimeout(function(){ window.location.replace(${JSON.stringify(outputHref)}); }, 1350);`
        }}
      />
      <div className="jarvis-starfield" aria-hidden="true" />
      <div className="jarvis-scanline" aria-hidden="true" />

      <header className="jarvis-topbar">
        <a className="jarvis-mark" href="/">
          <Sparkles size={16} />
          <span>ATLAS Strategy OS</span>
        </a>
      </header>

      <section className="jarvis-immersive-stage" aria-label="ATLAS thinking">
        <section className="jarvis-core-zone" aria-label="ATLAS command core">
          <div className="jarvis-brand-lockup atlas-lockup">
            <span>Building report</span>
            <h1>ATLAS</h1>
            <p>ATLAS is selecting the artifact type, applying audience rules, pulling placeholder data, and assembling the report.</p>
          </div>

          <div className="jarvis-holo-core thought-low">
            <div className="jarvis-core-ring ring-one" />
            <div className="jarvis-core-ring ring-two" />
            <div className="jarvis-core-ring ring-three" />
            <div className="jarvis-core-scan scan-one" />
            <div className="jarvis-core-scan scan-two" />
            <div className="jarvis-core-grid" />
            <div className="jarvis-core-sigil">
              <Radar size={28} />
            </div>
            <div className="jarvis-thought-nodes">
              {['Intent', 'Audience', 'Data', 'PDF', 'Trust'].map((label, index) => (
                <span className={`jarvis-thought-node node-${index + 1} ${index < 3 ? 'active' : 'waiting'}`} key={label}>
                  <i />
                  <em>{label}</em>
                </span>
              ))}
            </div>
          </div>

          <div className="jarvis-command-surface">
            <section className="atlas-thinking-panel persistent" aria-live="polite" aria-label="ATLAS thinking">
              <span>ATLAS is building</span>
              <strong>{prompt}</strong>
              <div className="atlas-thinking-steps" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <p>The report will open automatically. If it does not, <a href={outputHref}>open the generated report</a>.</p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
