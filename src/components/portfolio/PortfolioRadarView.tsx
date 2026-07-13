import Link from 'next/link';
import { AlertTriangle, BookOpen, BookText, Brain, Database, GitBranch, Home, Network, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { getPortfolioRadarRecord } from '@/src/lib/data';
import PortfolioNetworkExplorer from '@/src/components/graph/PortfolioNetworkExplorer';

function BrandLinkList({ ids, names }: { ids: string[]; names: string[] }) {
  return (
    <div className="portfolio-brand-links">
      {ids.slice(0, 8).map((id, index) => (
        <Link href={`/brand/${id}`} key={id}>{names[index] ?? id}</Link>
      ))}
      {ids.length > 8 && <span>+{ids.length - 8} more</span>}
    </div>
  );
}

export default function PortfolioRadarView() {
  const portfolio = getPortfolioRadarRecord();
  const leadingPatterns = portfolio.patternClusters.slice(0, 4);
  const leadingGaps = portfolio.evidenceGapClusters.slice(0, 4);
  const treatmentPulls = portfolio.treatmentPulls.slice(0, 4);
  const crossBrandEdges = portfolio.crossBrandEdges.slice(0, 8);

  return (
    <main className="portfolio-page">
      <header className="portfolio-hero">
        <div>
          <div className="section-kicker"><Network size={14} /> Portfolio Intelligence</div>
          <h1>Portfolio Pattern Radar</h1>
          <p>Cross-brand graph intelligence for finding repeated equity patterns, hidden lookalikes, evidence gaps, and treatment memory across the portfolio.</p>
        </div>
        <nav className="conversation-actions" aria-label="Portfolio navigation">
          <Link href="/"><Home size={15} /> Home</Link>
          <Link href="/brands"><Search size={15} /> Brands</Link>
          <Link href="/start-here"><BookOpen size={15} /> Start Here</Link>
          <Link href="/wiki"><BookText size={15} /> Wiki</Link>
        </nav>
      </header>

      <section className="portfolio-command">
        <div>
          <span>Executive read</span>
          <strong>{portfolio.topline.read}</strong>
          <p>{portfolio.topline.caveat}</p>
        </div>
        <div className="portfolio-stat-grid">
          <article>
            <strong>{portfolio.topline.totalBrands}</strong>
            <span>Brands read</span>
          </article>
          <article>
            <strong>{portfolio.topline.categoryCount}</strong>
            <span>Categories</span>
          </article>
          <article>
            <strong>{portfolio.topline.patternClusterCount}</strong>
            <span>Pattern clusters</span>
          </article>
          <article>
            <strong>{portfolio.topline.crossCategoryEdgeCount}</strong>
            <span>Cross-category edges</span>
          </article>
        </div>
      </section>

      <section className="portfolio-principle">
        <ShieldAlert size={18} />
        <div>
          <strong>No Magic Portfolio Rules</strong>
          <p>The graph can reveal brands that look similar, repeated missing evidence, and treatment paths worth comparing. It cannot prove causality, cannibalization, portfolio migration, or occasion substitution without the right evidence.</p>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-head">
          <div>
            <div className="section-kicker"><Network size={14} /> Graph map</div>
            <h2>Cross-Brand Portfolio Network</h2>
          </div>
          <p>This is the visual layer on top of the same graph spine: brands connected when their symptom fingerprints look meaningfully similar.</p>
        </div>
        <PortfolioNetworkExplorer edges={portfolio.crossBrandEdges} />
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-head">
          <div>
            <div className="section-kicker"><Sparkles size={14} /> What AI helps see</div>
            <h2>Recurring Portfolio Patterns</h2>
          </div>
          <p>These are repeated symptom clusters derived from BBE metrics, deterministic diagnoses, support-lens coverage, and similar-brand graph relationships.</p>
        </div>
        <div className="portfolio-pattern-list">
          {leadingPatterns.map((pattern) => (
            <article className="portfolio-pattern-brief" key={pattern.id}>
              <div>
                <span>{pattern.brandIds.length} connected brands · {pattern.categories.length} categories</span>
                <h3>{pattern.name}</h3>
                <p>{pattern.definition}</p>
              </div>
              <BrandLinkList ids={pattern.brandIds} names={pattern.brandNames} />
              <div className="portfolio-proof-row">
                <div>
                  <strong>Why it matters</strong>
                  <p>{pattern.whyItMatters}</p>
                </div>
                <div>
                  <strong>Investigate next</strong>
                  <p>{pattern.investigateNext}</p>
                </div>
              </div>
              <em>{pattern.guardrail}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-head">
          <div>
            <div className="section-kicker"><GitBranch size={14} /> Cross-brand graph</div>
            <h2>Brands The System Would Compare</h2>
          </div>
          <p>These links are built from symptom fingerprints, not brand-team intuition alone. They are prompts for smarter comparison.</p>
        </div>
        <div className="portfolio-edge-grid">
          {crossBrandEdges.map((edge) => (
            <article className="portfolio-edge-card" key={`${edge.fromBrandId}-${edge.toBrandId}`}>
              <div className="portfolio-edge-line">
                <Link href={`/brand/${edge.fromBrandId}`}>{edge.fromBrandName}</Link>
                <span>{edge.score}</span>
                <Link href={`/brand/${edge.toBrandId}`}>{edge.toBrandName}</Link>
              </div>
              <p>{edge.fromCategory} to {edge.toCategory} · {edge.strength} similarity</p>
              <ul>{edge.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul>
              <em>{edge.keyDifference}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-two-col">
        <div className="portfolio-section compact">
          <div className="portfolio-section-head">
            <div>
              <div className="section-kicker"><AlertTriangle size={14} /> Evidence heat</div>
              <h2>Evidence Missing Before Action</h2>
            </div>
          </div>
          <div className="portfolio-gap-stack">
            {leadingGaps.map((gap) => (
              <article className={`portfolio-gap-card ${gap.decisionRisk.toLowerCase()}`} key={gap.id}>
                <span>{gap.decisionRisk} risk · {gap.affectedBrandIds.length} brands</span>
                <h3>{gap.label}</h3>
                <p>{gap.whyItMatters}</p>
                <BrandLinkList ids={gap.affectedBrandIds} names={gap.affectedBrandNames} />
                <em>{gap.nextSource} · {gap.ownerCandidate}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="portfolio-section compact">
          <div className="portfolio-section-head">
            <div>
              <div className="section-kicker"><Brain size={14} /> Treatment memory</div>
              <h2>Treatment Pulls Repeating</h2>
            </div>
          </div>
          <div className="portfolio-treatment-stack">
            {treatmentPulls.map((pull) => (
              <article className="portfolio-treatment-card" key={pull.family}>
                <span>{pull.brandIds.length} brands</span>
                <h3>{pull.family}</h3>
                <p>{pull.treatmentNames.join(', ')}</p>
                <strong>Evidence needed</strong>
                <ul>{pull.requiredEvidence.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
                <em>{pull.caveat}</em>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-head">
          <div>
            <div className="section-kicker"><Database size={14} /> Drilldown</div>
            <h2>Brand Reads Behind The Portfolio View</h2>
          </div>
          <p>Use this as the handoff into single-brand reports, graph packets, and evidence review.</p>
        </div>
        <div className="portfolio-table-wrap">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Category</th>
                <th>Diagnosis</th>
                <th>Pattern</th>
                <th>Evidence</th>
                <th>Treatment pull</th>
                <th>Graph</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.brandReads.map((brand) => (
                <tr key={brand.brandId}>
                  <td>
                    <Link href={`/brand/${brand.brandId}`}>{brand.brandName}</Link>
                    <span>{brand.portfolioRole}</span>
                  </td>
                  <td>{brand.category}</td>
                  <td>{brand.diagnosisName}</td>
                  <td>{brand.patternLabel}</td>
                  <td>{brand.evidenceReadiness} · {brand.materialGapCount} material gap{brand.materialGapCount === 1 ? '' : 's'}</td>
                  <td>{brand.topTreatmentFamily}</td>
                  <td><Link href={`/brand/${brand.brandId}/data`}>Open graph</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
