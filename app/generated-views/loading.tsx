import { Loader2 } from 'lucide-react';

export default function GeneratedViewsLoading() {
  return (
    <main className="atlas-generated-view-page">
      <section className="atlas-generated-view-loading" aria-label="ATLAS is preparing scenario output">
        <Loader2 size={22} />
        <div>
          <strong>ATLAS is preparing the scenario output</strong>
          <span>Checking existing sources first. If no reusable output exists, an editable scenario draft will open.</span>
        </div>
      </section>
    </main>
  );
}
