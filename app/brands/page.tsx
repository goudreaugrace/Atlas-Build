import Link from 'next/link';
import { ArrowRight, Home, Network } from 'lucide-react';
import { formatMetricValue, getBrandDemoSetup, getDemoReadyBrandRecords, getEvidenceReadiness, getPrimaryDiagnosis, metric } from '@/src/lib/data';

export default function BrandsPage() {
  const sortedBrands = getDemoReadyBrandRecords();

  return (
    <main className="solution-home-page">
      <section className="brand-home-hero">
        <div>
          <span className="section-kicker">Brand Library</span>
          <h1>Choose a brand</h1>
          <p>Best-data POC brands appear first, then the broader demo library. Open a brand command home, then choose report, Jarvis, work, or data for that brand.</p>
        </div>
        <nav className="brand-home-actions" aria-label="Global navigation">
          <Link className="secondary-action global-scope" href="/"><Home size={16} /> Home <span className="nav-scope-badge">Global</span></Link>
          <Link className="secondary-action global-scope" href="/portfolio"><Network size={16} /> Portfolio <span className="nav-scope-badge">Global</span></Link>
        </nav>
      </section>

      <section className="solution-band">
        <div className="brand-card-grid">
          {sortedBrands.map((record) => {
            const diagnosis = getPrimaryDiagnosis(record);
            const readiness = getEvidenceReadiness(record);
            const demoSetup = getBrandDemoSetup(record);
            const demandPower = metric(record, 'Demand Power');
            const pricingPower = metric(record, 'Pricing Power');
            return (
              <Link className="brand-entry-card" href={`/brand/${record.brandId}`} key={record.brandId}>
                <span>{record.category} · {record.period}</span>
                <em className={`brand-setup-badge ${demoSetup.focusedPocBrand ? 'best' : demoSetup.measuredGrowthNavigator ? 'strong' : 'standard'}`}>{demoSetup.label}</em>
                <strong>{record.brandName}</strong>
                <p>{diagnosis.name}</p>
                <dl>
                  <div>
                    <dt>Demand</dt>
                    <dd>{formatMetricValue(demandPower?.value)}</dd>
                  </div>
                  <div>
                    <dt>Value</dt>
                    <dd>{formatMetricValue(pricingPower?.value)}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{readiness.label}</dd>
                  </div>
                </dl>
                <em className="brand-entry-open">Open brand <ArrowRight size={14} /></em>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
