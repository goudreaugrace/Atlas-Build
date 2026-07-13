import Link from 'next/link';
import { ArrowRight, BadgeCheck, Bot, BriefcaseBusiness, ClipboardList, Database, FileText, Home, Pill, Search, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { BbeSectionLabel, BbeSmartPromptStrip, BbeSurfaceCard, BbeTrustBadge } from '@/src/components/ui';
import { findBrandRecord } from '@/src/lib/brand-context';
import { getBrandWorkItems } from '@/src/lib/brand-work';
import type { BrandWorkItem } from '@/src/lib/brand-work';

type BrandWorkPageProps = {
  params: Promise<{ brandId: string }>;
};

function artifactLabel(type: BrandWorkItem['type']) {
  if (type === 'executive_asset') return 'Executive Asset';
  if (type === 'qbr_read') return 'Meeting Prep Read';
  if (type === 'proof_pack') return 'Evidence Read';
  if (type === 'treatment_path') return 'Treatment Read';
  if (type === 'learning_path') return 'Learning Path';
  if (type === 'governance_review') return 'Governance Review';
  return 'Workspace';
}

function artifactIcon(type: BrandWorkItem['type']) {
  if (type === 'executive_asset') return <Sparkles size={15} />;
  if (type === 'qbr_read') return <ClipboardList size={15} />;
  if (type === 'proof_pack') return <Database size={15} />;
  if (type === 'treatment_path') return <Pill size={15} />;
  if (type === 'learning_path') return <FileText size={15} />;
  return <BriefcaseBusiness size={15} />;
}

function artifactTone(item: BrandWorkItem) {
  if (item.type === 'executive_asset' || item.type === 'qbr_read') return 'dark';
  if (item.type === 'proof_pack') return 'good';
  if (item.type === 'treatment_path') return 'watch';
  if (item.status === 'blocked') return 'bad';
  return 'neutral';
}

function artifactPrompt(type: BrandWorkItem['type']) {
  if (type === 'executive_asset') return 'Open executive asset';
  if (type === 'qbr_read') return 'Open meeting prep';
  if (type === 'proof_pack') return 'Inspect proof';
  if (type === 'treatment_path') return 'Review paths';
  if (type === 'learning_path') return 'Open learning';
  return 'Open workspace';
}

function isShowcaseAsset(item: BrandWorkItem) {
  return item.type === 'executive_asset' && item.id !== 'cmo-review-intelligence-asset';
}

function displayWorkTitle(item: BrandWorkItem) {
  if (item.type !== 'qbr_read') return item.title;
  return item.title
    .replace('Executive QBR Decision Read', 'Meeting Prep Intelligence Asset')
    .replace('Executive QBR', 'Meeting Prep');
}

function displayWorkSummary(item: BrandWorkItem) {
  if (item.type !== 'qbr_read') return item.summary;
  return item.summary
    .replaceAll('QBR/BGS provocation', 'meeting prep/BGS provocation')
    .replaceAll('QBR provocation', 'meeting prep provocation');
}

function WorkArtifactCard({ item, href, featured = false }: { item: BrandWorkItem; href: string; featured?: boolean }) {
  const title = displayWorkTitle(item);
  return (
    <BbeSurfaceCard className={`work-shelf-artifact-card ${featured ? 'is-featured' : ''} is-${item.type}`}>
      <Link href={href} aria-label={`Open ${title}`}>
        <header>
          <BbeSectionLabel icon={artifactIcon(item.type)}>{artifactLabel(item.type)}</BbeSectionLabel>
          <BbeTrustBadge tone={artifactTone(item)}>{item.source === 'requested_work' ? 'Requested' : 'Starter'}</BbeTrustBadge>
        </header>
        <strong>{title}</strong>
        <p>{displayWorkSummary(item)}</p>
        <dl>
          <div><dt>Evidence</dt><dd>{item.proofSummary.evidence}</dd></div>
          <div><dt>Gaps</dt><dd>{item.proofSummary.gaps}</dd></div>
          <div><dt>Review</dt><dd>{item.reviewState.replaceAll('_', ' ')}</dd></div>
        </dl>
        <span className="work-shelf-open">{artifactPrompt(item.type)} <ArrowRight size={14} /></span>
      </Link>
    </BbeSurfaceCard>
  );
}

export default async function BrandWorkPage({ params }: BrandWorkPageProps) {
  const { brandId } = await params;
  const record = findBrandRecord(brandId);
  const workItems = getBrandWorkItems(record);
  const featuredItem = workItems.find((item) => item.type === 'executive_asset') ?? workItems[0];
  const showcaseItems = workItems.filter((item) => item.id !== featuredItem?.id && isShowcaseAsset(item)).slice(0, 9);
  const readingItems = workItems.filter((item) => item.id !== featuredItem?.id && ['qbr_read', 'proof_pack', 'treatment_path'].includes(item.type)).slice(0, 6);
  const utilityItems = workItems
    .filter((item) => item.id !== featuredItem?.id
      && !showcaseItems.some((showcaseItem) => showcaseItem.id === item.id)
      && !readingItems.some((readingItem) => readingItem.id === item.id))
    .slice(0, 6);
  const workBaseHref = `/brand/${record.brandId}/work`;

  return (
    <main className="brand-home-page brand-work-page">
      <section className="brand-home-hero">
        <div>
          <span className="section-kicker"><BriefcaseBusiness size={15} /> Brand Work Shelf</span>
          <h1>{record.brandName} Work</h1>
          <p>Four focused governed workflows: meeting prep intelligence asset, data and evidence inspector, treatment recommendation, and brief/story draft.</p>
        </div>
        <nav className="brand-home-actions" aria-label={`${record.brandName} work navigation`}>
          <Link className="primary-action brand-scope" href={`/brand/${record.brandId}/jarvis`}><Bot size={16} /> Create With Jarvis <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}`}><Home size={16} /> Brand Home <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}/report`}><ClipboardList size={16} /> Report <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action brand-scope" href={`/brand/${record.brandId}/data`}><Database size={16} /> Data <span className="nav-scope-badge">Brand</span></Link>
          <Link className="secondary-action global-scope" href="/brands"><Search size={16} /> Brands <span className="nav-scope-badge">Global</span></Link>
          <Link className="secondary-action global-scope" href="/start-here"><ShieldCheck size={16} /> Start Here <span className="nav-scope-badge">Global</span></Link>
        </nav>
      </section>

      <section className="brand-work-library">
        {featuredItem && (
          <div className="work-shelf-featured">
            <div>
              <BbeSectionLabel icon={<BadgeCheck size={14} />}>Priority Asset</BbeSectionLabel>
              <h2>Start with the governed meeting prep asset.</h2>
              <p>The shelf now points into durable assets with proof, review posture, and next loops instead of generic workspace cards.</p>
            </div>
            <WorkArtifactCard item={featuredItem} href={`${workBaseHref}/${featuredItem.id}`} featured />
          </div>
        )}

        {showcaseItems.length > 0 && (
          <>
            <div className="work-shelf-section-head">
              <BbeSectionLabel icon={<Sparkles size={14} />}>PPTX Showcase Assets</BbeSectionLabel>
              <h2>CMO-grade outputs that replace the most valuable source-deck sections.</h2>
            </div>
            <div className="work-shelf-grid">
              {showcaseItems.map((item) => (
                <WorkArtifactCard item={item} href={`${workBaseHref}/${item.id}`} key={item.id} />
              ))}
            </div>
          </>
        )}

        <div className="work-shelf-section-head">
          <BbeSectionLabel icon={<Target size={14} />}>Decision Assets</BbeSectionLabel>
          <h2>Open the right artifact for the job.</h2>
        </div>
        <div className="work-shelf-grid">
          {readingItems.map((item) => (
            <WorkArtifactCard item={item} href={`${workBaseHref}/${item.id}`} key={item.id} />
          ))}
        </div>

        {utilityItems.length > 0 && (
          <>
            <div className="work-shelf-section-head compact">
              <BbeSectionLabel>Other Workspaces</BbeSectionLabel>
              <h2>Supporting outputs and recent work.</h2>
            </div>
            <div className="work-shelf-utility-list">
              {utilityItems.map((item) => (
                <Link href={`${workBaseHref}/${item.id}`} key={item.id}>
                  <span>{artifactLabel(item.type)}</span>
                  <strong>{displayWorkTitle(item)}</strong>
                  <em>{item.status.replaceAll('_', ' ')} · {item.approvedViewIds.length} views</em>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="solution-band solution-flow">
        <div className="solution-section-head">
          <span className="section-kicker"><Sparkles size={14} /> Next Output</span>
          <h2>Ask Jarvis for the next specific job.</h2>
        </div>
        <BbeSmartPromptStrip
          intro="Useful next requests:"
          prompts={['Build a CMO-ready read', 'Inspect the proof basis', 'Compare treatment paths']}
        />
        <div className="solution-more-row start">
          <Link href={`/brand/${record.brandId}/jarvis`}>
            Build an executive read, inspect the data basis, get a treatment recommendation, or draft a governed brief <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
