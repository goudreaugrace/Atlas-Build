import Link from 'next/link';
import { ArrowRight, BarChart3, Bot, BriefcaseBusiness, ClipboardList, Database, Home, MessageSquareText, Network, Search, ShieldCheck, Sparkles, Target } from 'lucide-react';
import {
  formatMetricValue,
  getEvidenceReadiness,
  getPrimaryDiagnosis,
  getTreatmentPlanOptions,
  metric
} from '@/src/lib/data';
import { findBrandRecord } from '@/src/lib/brand-context';
import { getBrandWorkItems } from '@/src/lib/brand-work';

type BrandPageProps = {
  params: Promise<{ brandId: string }>;
};

export default async function BrandPage({ params }: BrandPageProps) {
  const { brandId } = await params;
  const record = findBrandRecord(brandId);
  const diagnosis = getPrimaryDiagnosis(record);
  const readiness = getEvidenceReadiness(record);
  const treatments = getTreatmentPlanOptions(record).slice(0, 3);
  const workItems = getBrandWorkItems(record).slice(0, 4);
  const coreMetricNames = ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different'];
  const metricLabel = (name: string) => name === 'Pricing Power' ? 'Perceived Value' : name;
  const primaryTreatment = treatments[0];

  return (
    <main className="brand-home-page">
      <section className="brand-home-hero">
        <div>
          <span className="section-kicker"><Sparkles size={15} /> Brand Command Home</span>
          <h1>{record.brandName}</h1>
          <p>Orient on what we know, choose what to do next, then go to the right depth for the question.</p>
        </div>
        <nav className="brand-home-actions" aria-label={`${record.brandName} paths`}>
          <Link className="primary-action brand-scope" href={`/brand/${record.brandId}/jarvis`}><Bot size={16} /> Ask Jarvis <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}/report`}><ClipboardList size={16} /> Report <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}/work`}><BriefcaseBusiness size={16} /> Work <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}/data`}><Database size={16} /> Data <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action global-scope" href="/"><Home size={16} /> Home <span className="nav-scope-badge">Global</span></Link>
          <Link className="secondary-action global-scope" href="/brands"><Search size={16} /> Brands <span className="nav-scope-badge">Global</span></Link>
          <Link className="secondary-action global-scope" href="/start-here"><ShieldCheck size={16} /> Start Here <span className="nav-scope-badge">Global</span></Link>
        </nav>
      </section>

      <section className="brand-home-command-grid" aria-label={`${record.brandName} command lobby`}>
        <article className="brand-home-read brand-home-command-card primary">
          <span className="section-kicker"><ClipboardList size={14} /> What We Know</span>
          <h2>{diagnosis.name}</h2>
          <p>{diagnosis.doctorRead}</p>
          <div className="brand-home-chip-row">
            <span>{record.category} · {record.country} · {record.period}</span>
            <span>{record.portfolioRole}</span>
            <span>{readiness.label}</span>
          </div>
          <Link className="brand-home-card-action" href={`/brand/${record.brandId}/report`}>
            Open the full diagnostic report <ArrowRight size={15} />
          </Link>
        </article>

        <article className="brand-home-command-card">
          <span className="section-kicker"><Target size={14} /> What Can I Do?</span>
          <h2>{primaryTreatment ? primaryTreatment.name : 'Choose a proof path before action.'}</h2>
          <p>{primaryTreatment?.brandSpecificBasis[0] ?? 'Use Jarvis or the Work Shelf to create a review-draft output grounded in this brand packet.'}</p>
          <div className="brand-home-action-list">
            <Link href={`/brand/${record.brandId}/jarvis`}><Bot size={15} /> Ask Jarvis</Link>
            <Link href={`/brand/${record.brandId}/work/cmo-review-intelligence-asset`}><BriefcaseBusiness size={15} /> Open CMO asset</Link>
            <Link href={`/brand/${record.brandId}/work/treatment-path`}><Target size={15} /> Open treatment read</Link>
          </div>
        </article>

        <nav className="brand-home-command-card destinations" aria-label="Where to go">
          <span className="section-kicker"><Search size={14} /> Where Do I Want To Go?</span>
          <Link href={`/brand/${record.brandId}/report`}>
            <ClipboardList size={16} />
            <strong>Report</strong>
            <p>Full diagnostic read, narrative, evidence, caveats, and treatment logic.</p>
          </Link>
          <Link href={`/brand/${record.brandId}/work`}>
            <BriefcaseBusiness size={16} />
            <strong>Work</strong>
            <p>Generated QBRs, proof packs, treatment reads, and meeting-ready assets.</p>
          </Link>
          <Link href={`/brand/${record.brandId}/data`}>
            <Database size={16} />
            <strong>Data</strong>
            <p>Source evidence, context packets, rules, assumptions, and readiness.</p>
          </Link>
          <Link href={`/brand/${record.brandId}/assistant`}>
            <MessageSquareText size={16} />
            <strong>Assistant</strong>
            <p>Stable chat for questions, follow-ups, and grounded explanations.</p>
          </Link>
          <Link href="/portfolio">
            <Network size={16} />
            <strong>Portfolio</strong>
            <p>Cross-brand patterns, analogies, and portfolio intelligence.</p>
          </Link>
        </nav>
      </section>

      <section className="brand-home-grid">
        <article className="brand-home-panel">
          <div className="solution-section-head compact">
            <span className="section-kicker"><BarChart3 size={14} /> What We Know · Bloodwork</span>
            <h2>Core metrics</h2>
          </div>
          <div className="brand-home-metrics">
            {coreMetricNames.map((name) => {
              const m = metric(record, name);
              return (
                <div key={name}>
                  <span>{metricLabel(name)}</span>
                  <strong>{formatMetricValue(m?.value)}</strong>
                  <em>{m ? `${m.ahead} · ${m.momentum}` : 'Missing'}</em>
                </div>
              );
            })}
          </div>
        </article>

        <article className="brand-home-panel">
          <div className="solution-section-head compact">
            <span className="section-kicker"><Database size={14} /> What We Know · Brand Context</span>
            <h2>{record.brandName} context is attached as a governed packet.</h2>
          </div>
          <p>Positioning, objectives, planning priorities, and source-owner strategy packets are visible in Data. Global rules and treatment libraries stay separate from brand-specific evidence.</p>
          <Link className="brand-home-card-action" href={`/brand/${record.brandId}/data`}>Inspect evidence and context <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="brand-home-work">
        <div className="solution-section-head">
          <span className="section-kicker"><BriefcaseBusiness size={14} /> Recent Work</span>
          <h2>Open the output that fits the audience or moment.</h2>
        </div>
        <div className="brand-card-grid">
          {workItems.map((item) => (
            <Link className="brand-entry-card work-card" href={`/brand/${record.brandId}/work/${item.id}`} key={item.id}>
              <span>{item.source === 'requested_work' ? 'Requested work' : 'Starter workspace'} · {item.audience}</span>
              <strong>{item.title}</strong>
              <p>{item.approvedTemplateName}</p>
              <dl>
                <div>
                  <dt>Views</dt>
                  <dd>{item.approvedViewIds.length}</dd>
                </div>
                <div>
                  <dt>Proof</dt>
                  <dd>{item.proofSummary.evidence}</dd>
                </div>
                <div>
                  <dt>Export</dt>
                  <dd>Gated</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
        <div className="solution-more-row">
          <Link href={`/brand/${record.brandId}/work`}>Open all {record.brandName} work <ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
