import { Loader2 } from 'lucide-react';

export default function GeneratedViewsLoading() {
  return (
    <main className="atlas-generated-view-page">
      <section className="atlas-generated-view-loading" aria-label="ATLAS is preparing generated view">
        <Loader2 size={22} />
        <div>
          <strong>ATLAS is preparing the view</strong>
          <span>Checking existing sources first. If no reusable view exists, an editable draft will open.</span>
        </div>
      </section>
    </main>
  );
}
