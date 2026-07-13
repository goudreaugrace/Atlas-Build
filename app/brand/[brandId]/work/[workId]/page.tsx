import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { AlertTriangle, ArrowRight, BadgeCheck, Bot, BriefcaseBusiness, CheckCircle2, ClipboardList, Database, Home, LineChart, Pill, ShieldCheck, Sparkles, Target } from 'lucide-react';
import DynamicViewRenderer from '@/src/components/intelligence/DynamicViewRenderer';
import { findBrandRecord } from '@/src/lib/brand-context';
import { findBrandWorkItem } from '@/src/lib/brand-work';
import { formatMetricValue } from '@/src/lib/data';
import { buildAssistantRealityContext } from '@/src/lib/intelligence/assistant-reality-boundaries';
import { buildBrandIntelligencePacket, findDynamicView } from '@/src/lib/intelligence/kernel';
import { buildEvidenceReadArtifactModel } from '@/src/lib/intelligence/evidence-read-artifact';
import {
  buildValidatedCmoReviewAssetSpec,
  getExecutiveIntelligenceAssetDefinition,
  type ExecutiveIntelligenceAssetDefinition,
  type ExecutiveIntelligenceAssetPage
} from '@/src/lib/intelligence/executive-intelligence-asset-spec';
import { buildQbrExecutiveArtifactModel } from '@/src/lib/intelligence/qbr-executive-artifact';
import { buildTreatmentReadArtifactModel } from '@/src/lib/intelligence/treatment-read-artifact';
import { BbeMicroMoment, BbeProofCard, BbePunchlineBand, BbeSectionLabel, BbeSmartPromptStrip, BbeSurfaceCard, BbeTrustBadge } from '@/src/components/ui';
import type { BrandWorkItem } from '@/src/lib/brand-work';
import type { BrandIntelligencePacket, DynamicViewRequest } from '@/src/lib/intelligence/types';

type BrandWorkDetailPageProps = {
  params: Promise<{ brandId: string; workId: string }>;
};

function label(value: string) {
  return value.replaceAll(/[-_]/g, ' ');
}

function displayWorkTitle(work: BrandWorkItem) {
  if (work.type !== 'qbr_read') return work.title;
  return work.title
    .replace('Executive QBR Decision Read', 'Meeting Prep Intelligence Asset')
    .replace('Executive QBR', 'Meeting Prep');
}

function displayWorkSummary(work: BrandWorkItem) {
  if (work.type !== 'qbr_read') return work.summary;
  return work.summary
    .replaceAll('QBR/BGS provocation', 'meeting prep/BGS provocation')
    .replaceAll('QBR provocation', 'meeting prep provocation');
}

function tone(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('declining') || normalized.includes('blocked') || normalized.includes('missing') || normalized.includes('not ahead')) return 'bad';
  if (normalized.includes('watch') || normalized.includes('partial') || normalized.includes('review') || normalized.includes('directional')) return 'watch';
  return 'good';
}

function modeLabel(value: string) {
  if (value === 'source_recreation') return 'Source';
  if (value === 'diagnostic_read') return 'Diagnosis';
  if (value === 'future_extension') return 'Extension';
  return label(value);
}

function executiveAssetCoverTitle(brandName: string) {
  return `${brandName} Momentum Read`;
}

type ExecutiveAssetFocus = {
  definition: ExecutiveIntelligenceAssetDefinition;
  title: string;
  coverTitle: string;
};

function executiveAssetFocusForWork(work: BrandWorkItem, brandName: string): ExecutiveAssetFocus | null {
  const definition = getExecutiveIntelligenceAssetDefinition(work.approvedTemplateId);
  if (!definition) return null;
  return {
    definition,
    title: `${brandName} ${definition.titlePrefix}`,
    coverTitle: `${brandName} ${definition.coverTitlePrefix}`
  };
}

function applyFocusedPageOverride(page: ExecutiveIntelligenceAssetPage, focus: ExecutiveAssetFocus | null): ExecutiveIntelligenceAssetPage {
  if (!focus) return page;
  const override = focus.definition.pageOverrides?.[page.moduleId];
  return override ? { ...page, ...override } : page;
}

function viewDataAvailable(viewId: string, packet: BrandIntelligencePacket) {
  if (!findDynamicView(viewId)) return false;
  if (viewId === 'momentum_room_to_grow_grid') return packet.roomToGrow.status !== 'missing';
  if (viewId === 'smd_driver_map') return Boolean(packet.metrics.Salient && packet.metrics.Meaningful && packet.metrics.Different);
  if (viewId === 'qbr_story_draft') return packet.treatmentOptions.length > 0 && packet.starterProvocations.length > 0;
  if (viewId === 'evidence_spotlight_panel') return false;
  return true;
}

function viewRequest(viewId: string, packet: BrandIntelligencePacket): DynamicViewRequest {
  const view = findDynamicView(viewId);
  const available = viewDataAvailable(viewId, packet);
  return {
    viewId,
    requiredDataAvailable: available,
    fallbackViewId: available ? undefined : 'data_gap_panel',
    reason: view?.purpose ?? 'Approved governed workspace view.'
  };
}

function MetricStrip({ packet }: { packet: BrandIntelligencePacket }) {
  const metrics = ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different']
    .map((name) => packet.metrics[name])
    .filter(Boolean);

  return (
    <div className="work-artifact-metrics">
      {metrics.map((metric) => (
        <div key={metric.metric}>
          <span>{metric.metric === packet.displayLanguage.perceivedValueMetricSource ? packet.displayLanguage.perceivedValueUserLabel : metric.metric}</span>
          <strong>{formatMetricValue(metric.value)}</strong>
          <em className={tone(`${metric.ahead} ${metric.momentum}`)}>{metric.ahead} · {metric.momentum}</em>
        </div>
      ))}
    </div>
  );
}

function WorkReviewPostureInline({
  packet,
  work,
  shareExportLine
}: {
  packet: BrandIntelligencePacket;
  work: BrandWorkItem;
  shareExportLine: string;
}) {
  const jarvisHref = `/brand/${packet.brand.brandId}/jarvis?workId=${encodeURIComponent(work.id)}`;
  return (
    <BbeSurfaceCard className="work-review-posture-inline">
      <div>
        <BbeSectionLabel icon={<ShieldCheck size={14} />}>Review Posture</BbeSectionLabel>
        <p>{shareExportLine}</p>
      </div>
      <dl>
        <div><dt>Loaded packet</dt><dd>{packet.brand.period}</dd></div>
        <div><dt>Evidence</dt><dd>{work.proofSummary.evidence}</dd></div>
        <div><dt>Gaps</dt><dd>{work.proofSummary.gaps}</dd></div>
        <div><dt>Review gates</dt><dd>{work.proofSummary.gates}</dd></div>
        <div><dt>Share</dt><dd>{work.shareState.replaceAll('_', ' ')}</dd></div>
        <div><dt>Export</dt><dd>{work.exportState}</dd></div>
      </dl>
      <Link className="primary-action" href={jarvisHref}>
        Continue with Jarvis <ArrowRight size={15} />
      </Link>
    </BbeSurfaceCard>
  );
}

function WorkArtifactSection({
  label: sectionLabel,
  icon,
  title,
  body,
  className,
  children
}: {
  label: string;
  icon?: ReactNode;
  title: string;
  body?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <BbeSurfaceCard className={`work-artifact-panel${className ? ` ${className}` : ''}`}>
      <div className="solution-section-head compact">
        <BbeSectionLabel icon={icon}>{sectionLabel}</BbeSectionLabel>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
      </div>
      {children}
    </BbeSurfaceCard>
  );
}

function WorkInlineViews({
  title,
  viewIds,
  packet
}: {
  title: string;
  viewIds: string[];
  packet: BrandIntelligencePacket;
}) {
  return (
    <WorkArtifactSection label="Approved Views" title={title}>
      <div className="work-inline-view-stack">
        {viewIds.map((viewId) => (
          <DynamicViewRenderer key={viewId} request={viewRequest(viewId, packet)} packet={packet} />
        ))}
      </div>
    </WorkArtifactSection>
  );
}

function WorkGovernanceDisclosure({
  work,
  governance
}: {
  work: BrandWorkItem;
  governance: {
    sourcePeriodLine: string;
    shareExportLine: string;
    workOrderLabel: string;
  };
}) {
  return (
    <details className="work-artifact-disclosure">
      <summary>Governance, source prompt, and workspace metadata</summary>
      <div>
        <p>{governance.sourcePeriodLine}</p>
        <p>{governance.shareExportLine}</p>
        <blockquote>{work.sourcePrompt}</blockquote>
        <dl>
          <div><dt>Workspace label</dt><dd>{governance.workOrderLabel}</dd></div>
          <div><dt>Approved skill</dt><dd>{work.approvedSkillName}</dd></div>
          <div><dt>Approved template</dt><dd>{work.approvedTemplateName}</dd></div>
          <div><dt>Review state</dt><dd>{label(work.reviewState)}</dd></div>
          <div><dt>Export state</dt><dd>{label(work.exportState)}</dd></div>
        </dl>
      </div>
    </details>
  );
}

function ExecutiveIntelligenceAsset({ packet, work }: { packet: BrandIntelligencePacket; work: BrandWorkItem }) {
  const validatedAsset = buildValidatedCmoReviewAssetSpec(packet);
  const focus = executiveAssetFocusForWork(work, packet.brand.brandName);
  const spec = focus
    ? {
      ...validatedAsset.spec,
      title: focus.title,
      prompt: focus.definition.sourcePrompt,
      decisionSupported: focus.definition.decisionSupported,
      pageSequence: validatedAsset.spec.pageSequence
        .filter((page) => focus.definition.moduleIds.includes(page.moduleId))
        .map((page) => applyFocusedPageOverride(page, focus)),
      askThisAssetPrompts: focus.definition.askPrompts
    }
    : validatedAsset.spec;
  const validation = validatedAsset.validation;
  const smartPrompts = spec.askThisAssetPrompts.slice(0, 3);
  const proofTotals = spec.pageSequence.reduce(
    (totals, page) => ({
      evidence: totals.evidence + page.primaryEvidence.length + page.expandableProof.length,
      needs: totals.needs + page.evidenceNeeded.length,
      blocked: totals.blocked + page.blockedOverclaims.length
    }),
    { evidence: 0, needs: 0, blocked: 0 }
  );

  return (
    <>
      <BbeSurfaceCard className="work-artifact-panel work-asset-cover">
        <div>
          <BbeSectionLabel icon={<Sparkles size={14} />}>{spec.title}</BbeSectionLabel>
          <h1 className="bbe-report-title">{focus?.coverTitle ?? executiveAssetCoverTitle(spec.brandName)}</h1>
          <p>{spec.decisionSupported}</p>
          <blockquote>{spec.prompt}</blockquote>
        </div>
        <dl>
          <div><dt>Pages</dt><dd>{spec.pageSequence.length}</dd></div>
          <div><dt>Validation</dt><dd><BbeTrustBadge tone={validation.status === 'pass' ? 'good' : 'watch'}>{validation.status}</BbeTrustBadge></dd></div>
          <div><dt>Review</dt><dd>{label(spec.reviewState)}</dd></div>
          <div><dt>Export</dt><dd>{label(spec.exportState)}</dd></div>
        </dl>
        <BbeSmartPromptStrip
          intro="Asset is ready for follow-up. Suggested loops:"
          prompts={smartPrompts}
          tone="dark"
        />
      </BbeSurfaceCard>

      <BbeSurfaceCard className="work-artifact-panel work-asset-readiness">
        <div className="solution-section-head compact">
          <BbeSectionLabel icon={<ShieldCheck size={14} />}>Proof Contract</BbeSectionLabel>
          <h2>Every page is governed before it is designed.</h2>
          <p>{spec.sourcePostureSummary}</p>
        </div>
        <div className="work-asset-proof-summary">
          <div>
            <span>Evidence And Proof</span>
            <strong>{proofTotals.evidence}</strong>
            <p>Primary evidence plus expandable proof points across the asset.</p>
          </div>
          <div>
            <span>Proof Still Needed</span>
            <strong>{proofTotals.needs}</strong>
            <p>Source-owner or measurement work needed before pilot/circulation.</p>
          </div>
          <div>
            <span>Blocked Overclaims</span>
            <strong>{proofTotals.blocked}</strong>
            <p>Language the asset must keep out of the executive read.</p>
          </div>
        </div>
        {validation.issues.length > 0 && (
          <div className="work-asset-validation-list">
            {validation.issues.map((issue) => (
              <p key={`${issue.severity}-${issue.pageId ?? issue.moduleId}-${issue.message}`}>{issue.severity}: {issue.message}</p>
            ))}
          </div>
        )}
      </BbeSurfaceCard>

      <nav className="work-asset-page-nav" aria-label={`${spec.title} pages`}>
        {spec.pageSequence.map((page, index) => (
          <a href={`#${page.id}`} key={page.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{page.title}</strong>
          </a>
        ))}
      </nav>

      <div className="work-asset-slide-stack">
        {spec.pageSequence.map((page, index) => (
          <BbeSurfaceCard as="section" className={`work-asset-slide ${page.visualPattern}`} id={page.id} key={page.id}>
            <header>
              <div>
                <BbeSectionLabel>{String(index + 1).padStart(2, '0')} · {label(page.moduleId)}</BbeSectionLabel>
                <h2>{page.title}</h2>
              </div>
              <dl>
                <div><dt>Read type</dt><dd>{modeLabel(page.outputMode)}</dd></div>
                <div><dt>Source</dt><dd>{label(page.sourcePosture.status)}</dd></div>
              </dl>
            </header>
            <div className="work-asset-slide-body">
              <BbeSurfaceCard as="div" className="work-asset-slide-read">
                <h3>{page.headline}</h3>
                <p>{page.role}</p>
                <div className="work-asset-source-pills">
                  {page.sourceModuleIds.map((sourceModuleId, sourceIndex) => (
                    <span key={`${page.id}-source-${sourceIndex}-${sourceModuleId}`}>{label(sourceModuleId)}</span>
                  ))}
                </div>
              </BbeSurfaceCard>
              <div className="work-asset-evidence-strip">
                {page.primaryEvidence.slice(0, 4).map((evidence, evidenceIndex) => (
                  <BbeProofCard label="Evidence" title={evidence} key={`${page.id}-primary-evidence-${evidenceIndex}`} />
                ))}
                {index === 0 && (
                  <BbeMicroMoment title="One-click executive reframing.">
                    Let the marketer ask for a CMO version, an Insights Lead proof version, or a tighter agency version without rebuilding the asset.
                  </BbeMicroMoment>
                )}
                {index === spec.pageSequence.length - 1 && (
                  <BbeMicroMoment label="Smart next step" title="Turn proof gaps into work.">
                    The missing-data list should become a source-owner request, not just a caveat in the appendix.
                  </BbeMicroMoment>
                )}
              </div>
            </div>
            <BbePunchlineBand meta={`${modeLabel(page.outputMode)} · ${label(page.sourcePosture.status)}`}>
              {page.nextActions[0] ?? 'Keep the page inside the governed proof contract before circulation.'}
            </BbePunchlineBand>
            <details className="work-asset-proof-drawer">
              <summary>Open page proof, caveats, and next actions</summary>
              <div>
                <section>
                  <span>Expandable proof</span>
                  <ul>{page.expandableProof.map((proof, proofIndex) => <li key={`${page.id}-proof-${proofIndex}`}>{proof}</li>)}</ul>
                </section>
                <section>
                  <span>Evidence needed</span>
                  <ul>{page.evidenceNeeded.map((need, needIndex) => <li key={`${page.id}-need-${needIndex}`}>{need}</li>)}</ul>
                </section>
                <section>
                  <span>Blocked overclaims</span>
                  <ul>{page.blockedOverclaims.map((claim, claimIndex) => <li key={`${page.id}-blocked-${claimIndex}`}>{claim}</li>)}</ul>
                </section>
                <section>
                  <span>Next actions</span>
                  <ul>{page.nextActions.map((action, actionIndex) => <li key={`${page.id}-action-${actionIndex}`}>{action}</li>)}</ul>
                </section>
              </div>
              <p>{page.sourcePosture.detail}</p>
            </details>
          </BbeSurfaceCard>
        ))}
      </div>

      <BbeSurfaceCard className="work-artifact-panel work-next-decision">
        <div>
          <BbeSectionLabel icon={<Target size={14} />}>Ask This Asset</BbeSectionLabel>
          <h2>Use the asset as a decision workspace, not a static deck.</h2>
          <p>The next layer should let Jarvis answer and revise from this active asset context while staying inside the same proof contract.</p>
          <BbeSmartPromptStrip
            intro="Smart loops available from this asset:"
            prompts={spec.askThisAssetPrompts}
            tone="dark"
          />
        </div>
      </BbeSurfaceCard>

      <details className="work-artifact-disclosure">
        <summary>Governance, revision types, and workspace metadata</summary>
        <div>
          <p>Allowed revisions: {spec.allowedRevisionTypes.map(label).join(', ')}.</p>
          <p>Next operations: {spec.nextOperationCandidates.map(label).join(', ')}.</p>
          <p>Validation notes: {spec.validationNotes.join(' ')}</p>
          <blockquote>{work.sourcePrompt}</blockquote>
          <dl>
            <div><dt>Asset id</dt><dd>{spec.assetId}</dd></div>
            <div><dt>Registry</dt><dd>{spec.pageSequence[0]?.proofContract.registryId}</dd></div>
            <div><dt>Approved skill</dt><dd>{work.approvedSkillName}</dd></div>
            <div><dt>Review state</dt><dd>{label(spec.reviewState)}</dd></div>
            <div><dt>Export state</dt><dd>{label(spec.exportState)}</dd></div>
          </dl>
        </div>
      </details>
    </>
  );
}

function ExecutiveQbrArtifact({ packet, work }: { packet: BrandIntelligencePacket; work: BrandWorkItem }) {
  const artifact = buildQbrExecutiveArtifactModel(packet, work);
  const compositionLabel = artifact.composition.compositionMode === 'executive_qbr'
    ? 'Meeting Prep · Executive Review'
    : artifact.composition.compositionMode.replaceAll('_', ' ');
  const qbrPrompts = [
    'Make this CMO-facing',
    'Open the proof pack',
    'Compare treatment paths'
  ];

  return (
    <>
      <BbeSurfaceCard className="work-artifact-panel work-artifact-verdict work-authority-hero work-qbr-hero">
        <div>
          <BbeSectionLabel icon={<Sparkles size={14} />}>{compositionLabel}</BbeSectionLabel>
          <h2 className="bbe-report-title">{artifact.verdict.title}</h2>
          <p>{artifact.verdict.headline}</p>
        </div>
        <MetricStrip packet={packet} />
        <BbeSmartPromptStrip intro="Meeting prep asset is ready for follow-up. Suggested loops:" prompts={qbrPrompts} tone="dark" />
      </BbeSurfaceCard>

      <WorkArtifactSection
        label="Goal And Composition"
        icon={<Target size={14} />}
        title={artifact.composition.goal}
        body={artifact.composition.decision}
      >
        <div className="work-composition-module-grid is-stacked-reading-list">
          {artifact.compositionModules.slice(0, 10).map((module, index) => (
            <section
              className={`work-composition-module ${module.tone}`}
              key={module.id}
              style={{ '--module-step': `"${String(index + 1).padStart(2, '0')}"` } as CSSProperties & Record<'--module-step', string>}
            >
              <div>
                <span>{module.kicker}</span>
                <strong>{module.title}</strong>
                <p>{module.body}</p>
              </div>
              {module.points.length > 0 && (
                <dl>
                  {module.points.map((point, pointIndex) => (
                    <div className={point.tone ?? 'watch'} key={`${module.id}-${pointIndex}-${point.label}-${point.value}`}>
                      <dt>{point.label}</dt>
                      <dd>{point.value}</dd>
                      <em>{point.detail}</em>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection label={`${artifact.executiveLabel} takeaways`} title="What the review should focus on">
        <div className="work-takeaway-grid">
          {artifact.takeaways.map((takeaway, index) => (
            <BbeProofCard label={`Takeaway ${index + 1}`} title={takeaway.label} key={takeaway.label}>
              {takeaway.body}
            </BbeProofCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection label="Proof Cards" icon={<ShieldCheck size={14} />} title="Why this draft is grounded">
        <div className="work-proof-card-grid">
          {artifact.proofCards.map((card) => (
            <BbeProofCard label={card.label} title={card.title} tone={card.tone} key={card.label}>
              {card.body}
            </BbeProofCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkInlineViews title="Inline workspace evidence" viewIds={artifact.inlineViewIds} packet={packet} />

      <WorkArtifactSection label="What Not To Overclaim" icon={<AlertTriangle size={14} />} title="Guardrails before this circulates">
        <div className="work-guardrail-list">
          <div>
            <Database size={16} />
            <p>Peer basis: {artifact.peerBasis.title}. {artifact.peerBasis.body}</p>
          </div>
          <div>
            <LineChart size={16} />
            <p>Trend basis: {artifact.trendRead.body}</p>
          </div>
          {artifact.guardrails.map((guardrail) => (
            <div key={guardrail}>
              <ShieldCheck size={16} />
              <p>{guardrail}</p>
            </div>
          ))}
          {artifact.qualityChecks.map((check) => (
            <div key={check.id}>
              <ShieldCheck size={16} />
              <p>{check.label}: {check.detail}</p>
            </div>
          ))}
        </div>
        <BbeMicroMoment
          label="Review cue"
          title="Use guardrails as trust signals, not appendix clutter."
        >
          The best executive read names what the current packet proves and what still needs source-owner support.
        </BbeMicroMoment>
      </WorkArtifactSection>

      <BbeSurfaceCard className="work-artifact-panel work-next-decision">
        <div>
          <BbeSectionLabel icon={<Target size={14} />}>Treatment Recommendation</BbeSectionLabel>
          <h2>{artifact.treatment.title}</h2>
          <p>{artifact.treatment.body}</p>
          {artifact.treatment.bullets.length > 0 && (
            <ul>
              {artifact.treatment.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          )}
        </div>
        <BbePunchlineBand meta="Decision read">
          Keep the meeting prep asset as a review-draft decision workspace until proof, source posture, and circulation gates clear.
        </BbePunchlineBand>
      </BbeSurfaceCard>

      <WorkReviewPostureInline packet={packet} work={work} shareExportLine={artifact.governance.shareExportLine} />

      <WorkGovernanceDisclosure work={work} governance={artifact.governance} />
    </>
  );
}

function TreatmentReadArtifact({ packet, work }: { packet: BrandIntelligencePacket; work: BrandWorkItem }) {
  const artifact = buildTreatmentReadArtifactModel(packet, work);
  const treatmentPrompts = [
    'Compare treatment paths',
    'Show proof needs',
    'Make this test-ready'
  ];

  return (
    <>
      <BbeSurfaceCard className="work-artifact-panel work-authority-hero work-treatment-hero">
        <div>
          <BbeSectionLabel icon={<Pill size={14} />}>Treatment Recommendation</BbeSectionLabel>
          <h2 className="bbe-report-title">{artifact.verdict.title}</h2>
          <p>{artifact.verdict.headline}</p>
        </div>
        <dl className="work-authority-facts work-treatment-hero-facts">
          <div><dt>Paths ranked</dt><dd>{artifact.paths.length}</dd></div>
          <div><dt>Bridge points</dt><dd>{artifact.diagnosisBridge.points.length}</dd></div>
          <div><dt>Proof needs</dt><dd>{artifact.inspect.needs.length}</dd></div>
          <div><dt>Approved views</dt><dd>{artifact.inlineViewIds.length}</dd></div>
        </dl>
        <BbeSmartPromptStrip intro="Treatment read is ready for follow-up. Suggested loops:" prompts={treatmentPrompts} tone="dark" />
      </BbeSurfaceCard>

      <WorkArtifactSection
        label="Diagnosis To Treatment Bridge"
        icon={<Target size={14} />}
        title={artifact.diagnosisBridge.title}
        body={artifact.diagnosisBridge.body}
      >
        <div className="work-treatment-proof-strip">
          {artifact.diagnosisBridge.points.map((point) => (
            <BbeProofCard label={point.label} title={point.value} tone={point.tone} key={point.label}>
              {point.detail}
            </BbeProofCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection label="Options To Consider" title="Ranked treatment paths, not prescriptions">
        <div className="work-treatment-path-list">
          {artifact.paths.map((path) => (
            <BbeSurfaceCard as="section" className={`work-treatment-path-card ${path.tone}`} key={path.id}>
              <div className="work-treatment-path-head">
                <span>0{path.rank} · {path.family}</span>
                <strong>{path.title}</strong>
                <p>{path.body}</p>
              </div>
              <div className="work-treatment-path-stats">
                <div><span>Fit</span><strong>{path.score}</strong><em>{path.tier}</em></div>
                <div><span>Use when</span><strong>{path.family}</strong><em>{path.whyItFits[0]}</em></div>
                <div><span>Do not use when</span><strong>Caveat</strong><em>{path.contraindication}</em></div>
              </div>
              <div className="work-treatment-columns">
                <div>
                  <span>Brand-specific basis</span>
                  <ul>{path.whyItFits.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <span>Inspect before acting</span>
                  <ul>{path.inspectBeforeActing.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </BbeSurfaceCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection
        label="Proof Needs And Guardrails"
        icon={<AlertTriangle size={14} />}
        title={artifact.inspect.title}
        body={artifact.inspect.body}
      >
        <div className="work-treatment-evidence-grid">
          <div>
            <strong>Areas to inspect</strong>
            <ul>{artifact.inspect.needs.map((need) => <li key={need}>{need}</li>)}</ul>
          </div>
          <div>
            <strong>What not to overclaim</strong>
            <ul>{artifact.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
          </div>
        </div>
        <BbeMicroMoment
          label="Human decision gate"
          title="Keep the treatment as a path to test until proof needs are resolved."
        >
          This is where the artifact should invite inspection, not imply the brand team has already committed.
        </BbeMicroMoment>
      </WorkArtifactSection>

      <WorkInlineViews title="Evidence behind the recommendation" viewIds={artifact.inlineViewIds} packet={packet} />

      <BbeSurfaceCard className="work-artifact-panel work-next-decision">
        <div>
          <BbeSectionLabel icon={<Target size={14} />}>Next Test Path</BbeSectionLabel>
          <h2>{artifact.nextTestPath.title}</h2>
          <p>{artifact.nextTestPath.body}</p>
          <ul>{artifact.nextTestPath.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        </div>
        <BbePunchlineBand meta="Human-owned test path">
          Advance only after the named evidence needs are inspected and the brand team chooses the treatment path.
        </BbePunchlineBand>
      </BbeSurfaceCard>

      <WorkReviewPostureInline packet={packet} work={work} shareExportLine={artifact.governance.shareExportLine} />

      <WorkGovernanceDisclosure work={work} governance={artifact.governance} />
    </>
  );
}

function EvidenceReadArtifact({ packet, work }: { packet: BrandIntelligencePacket; work: BrandWorkItem }) {
  const artifact = buildEvidenceReadArtifactModel(packet, work);
  const evidencePrompts = [
    'Show the source gaps',
    'Make this CMO-ready',
    'Create source-owner handoff'
  ];

  return (
    <>
      <BbeSurfaceCard className="work-artifact-panel work-authority-hero work-evidence-hero">
        <div>
          <BbeSectionLabel icon={<Database size={14} />}>Evidence Read</BbeSectionLabel>
          <h2 className="bbe-report-title">{artifact.verdict.title}</h2>
          <p>{artifact.verdict.headline}</p>
        </div>
        <dl className="work-authority-facts work-evidence-hero-facts">
          <div><dt>Metric cards</dt><dd>{artifact.dataBasis.metrics.length}</dd></div>
          <div><dt>Proof cards</dt><dd>{artifact.proofCards.length}</dd></div>
          <div><dt>Source checks</dt><dd>{artifact.sourcePosture.length}</dd></div>
          <div><dt>Approved views</dt><dd>{artifact.inlineViewIds.length}</dd></div>
        </dl>
        <BbeSmartPromptStrip intro="Evidence read is ready for follow-up. Suggested loops:" prompts={evidencePrompts} tone="dark" />
      </BbeSurfaceCard>

      <WorkArtifactSection
        label="Data Basis"
        icon={<Database size={14} />}
        title={artifact.dataBasis.title}
        body={artifact.dataBasis.body}
      >
        <div className="work-evidence-metric-grid">
          {artifact.dataBasis.metrics.map((metric) => (
            <div className={metric.tone} key={metric.metric}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.read}</p>
            </div>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection label="Proof Cards" icon={<BadgeCheck size={14} />} title="What the packet supports">
        <div className="work-evidence-card-grid">
          {artifact.proofCards.map((card) => (
            <BbeProofCard label={card.label} title={card.title} tone={card.tone} key={card.id}>
              {card.body}
            </BbeProofCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection
        label="Source Posture"
        icon={<ShieldCheck size={14} />}
        title="Measured, reviewed, directional, or blocked"
      >
        <div className="work-evidence-card-grid compact">
          {artifact.sourcePosture.map((card) => (
            <BbeProofCard label={card.label} title={card.title} tone={card.tone} key={card.id}>
              {card.body}
            </BbeProofCard>
          ))}
        </div>
      </WorkArtifactSection>

      <WorkArtifactSection
        label="Gaps And Caveats"
        icon={<AlertTriangle size={14} />}
        title="What still needs source-owner confidence"
      >
        <div className="work-treatment-evidence-grid">
          <div>
            <strong>Gaps to resolve</strong>
            <ul>{artifact.gaps.map((gap) => <li key={gap.id}>{gap.label}: {gap.body}</li>)}</ul>
          </div>
          <div>
            <strong>Guardrails</strong>
            <ul>{artifact.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
          </div>
        </div>
        <BbeMicroMoment
          label="Useful next move"
          title="Turn proof gaps into a source-owner handoff before circulating."
        >
          The asset can stay demo-safe now while making the missing official inputs explicit.
        </BbeMicroMoment>
      </WorkArtifactSection>

      <WorkInlineViews title="Evidence inspection surfaces" viewIds={artifact.inlineViewIds} packet={packet} />

      <BbeSurfaceCard className="work-artifact-panel work-next-decision">
        <div>
          <BbeSectionLabel icon={<Target size={14} />}>Next Proof Path</BbeSectionLabel>
          <h2>{artifact.nextProofPath.title}</h2>
          <p>{artifact.nextProofPath.body}</p>
          <ul>{artifact.nextProofPath.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        </div>
        <BbePunchlineBand meta="Proof before circulation">
          Use this as the source-confidence checkpoint before upgrading the asset from review draft to leadership-ready.
        </BbePunchlineBand>
      </BbeSurfaceCard>

      <WorkReviewPostureInline packet={packet} work={work} shareExportLine={artifact.governance.shareExportLine} />

      <WorkGovernanceDisclosure work={work} governance={artifact.governance} />
    </>
  );
}

export default async function BrandWorkDetailPage({ params }: BrandWorkDetailPageProps) {
  const { brandId, workId } = await params;
  const record = findBrandRecord(brandId);
  const work = findBrandWorkItem(record, workId);
  if (!work) notFound();
  const packet = buildBrandIntelligencePacket(record.brandId);
  const realityContext = buildAssistantRealityContext(packet, work.sourcePrompt);
  const isExecutiveAsset = work.type === 'executive_asset' || work.approvedTemplateId === 'cmo-review-intelligence-asset';
  const isEvidenceArtifact = work.type === 'proof_pack'
    || work.approvedTemplateId === 'insights-evidence-lab'
    || work.qbrCompositionPlan?.compositionMode === 'evidence_read';
  const isQbrArtifact = !isEvidenceArtifact && (work.type === 'qbr_read' || work.approvedTemplateId === 'executive-qbr-decision-read');
  const isTreatmentArtifact = work.type === 'treatment_path' || work.approvedTemplateId === 'marketer-treatment-planning';
  const isReadingArtifact = isExecutiveAsset || isQbrArtifact || isEvidenceArtifact || isTreatmentArtifact;
  const jarvisHref = `/brand/${record.brandId}/jarvis?workId=${encodeURIComponent(work.id)}`;
  const assistantHref = `/brand/${record.brandId}/assistant?workId=${encodeURIComponent(work.id)}`;
  const displayTitle = displayWorkTitle(work);

  return (
    <main className={`work-detail-page ${isExecutiveAsset ? 'executive-asset-page' : ''}`}>
      <section className="work-detail-topbar">
        <Link className="brand-scope" href={`/brand/${record.brandId}`}><Home size={15} /> Brand Home <span className="nav-scope-badge">Brand</span></Link>
        <Link className="brand-scope" href={`/brand/${record.brandId}/work`}><BriefcaseBusiness size={15} /> Work Shelf <span className="nav-scope-badge">Brand</span></Link>
        <Link className="brand-scope" href={jarvisHref}><Bot size={15} /> Jarvis <span className="nav-scope-badge">Brand</span></Link>
        <Link className="brand-scope" href={assistantHref}><Sparkles size={15} /> Assistant <span className="nav-scope-badge">Brand</span></Link>
        <Link className="brand-scope" href={`/brand/${record.brandId}/report`}><ClipboardList size={15} /> Report <span className="nav-scope-badge">Brand</span></Link>
        <Link className="brand-scope" href={`/brand/${record.brandId}/data`}><Database size={15} /> Data <span className="nav-scope-badge">Brand</span></Link>
      </section>

      {!isExecutiveAsset && (
        <section className="work-detail-hero">
          <div>
            <span className="section-kicker">{work.source === 'requested_work' ? 'Requested Output' : 'Approved Starter Output'} · {realityContext.workOrderLabel}</span>
            <h1>{displayTitle}</h1>
            <p>{isQbrArtifact ? `${realityContext.sourcePeriodLine} ${realityContext.shareExportLine}` : displayWorkSummary(work)}</p>
          </div>
          <aside>
            <span>{record.category} · {record.period}</span>
            <strong>{displayTitle}</strong>
            <em>{work.audience} · {work.objective}</em>
          </aside>
        </section>
      )}

      <section className={`work-detail-layout ${isExecutiveAsset ? 'executive-asset-layout' : ''} ${isReadingArtifact ? 'artifact-reading-layout' : ''}`}>
        <article className="work-detail-main">
          {isExecutiveAsset ? (
            <ExecutiveIntelligenceAsset packet={packet} work={work} />
          ) : isQbrArtifact ? (
            <ExecutiveQbrArtifact packet={packet} work={work} />
          ) : isEvidenceArtifact ? (
            <EvidenceReadArtifact packet={packet} work={work} />
          ) : isTreatmentArtifact ? (
            <TreatmentReadArtifact packet={packet} work={work} />
          ) : (
            <>
              <div className="solution-section-head compact">
                <span className="section-kicker"><CheckCircle2 size={14} /> Output Snapshot</span>
                <h2>Scope and source prompt</h2>
              </div>
              <blockquote>{work.sourcePrompt}</blockquote>
              <div className="work-detail-proof-grid">
                <div>
                  <span>Approved skill</span>
                  <strong>{work.approvedSkillName}</strong>
                </div>
                <div>
                  <span>Approved template</span>
                  <strong>{work.approvedTemplateName}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{work.status.replaceAll('_', ' ')}</strong>
                </div>
              </div>

              <div className="solution-section-head compact">
                <span className="section-kicker">Approved Views</span>
                <h2>Workspace modules</h2>
              </div>
              <div className="work-view-list">
                {work.approvedViewIds.map((viewId, index) => (
                  <div key={viewId}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{viewId.replaceAll('_', ' ')}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        {!isReadingArtifact && (
          <aside className="work-detail-rail">
            <div>
              <span className="section-kicker"><ShieldCheck size={14} /> Review Posture</span>
              <dl>
                <div>
                  <dt>Loaded packet</dt>
                  <dd>{record.period}</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>{work.proofSummary.evidence}</dd>
                </div>
                <div>
                  <dt>Gaps</dt>
                  <dd>{work.proofSummary.gaps}</dd>
                </div>
                <div>
                  <dt>Review gates</dt>
                  <dd>{work.proofSummary.gates}</dd>
                </div>
                <div>
                  <dt>Share</dt>
                  <dd>{work.shareState.replaceAll('_', ' ')}</dd>
                </div>
                <div>
                  <dt>Export</dt>
                  <dd>{work.exportState}</dd>
                </div>
              </dl>
            </div>
            <div className="work-rail-note">
              <strong>{realityContext.workOrderLabel}</strong>
              <p>{realityContext.shareExportLine}</p>
            </div>
            <Link className="primary-action" href={jarvisHref}>
              Continue with Jarvis <ArrowRight size={15} />
            </Link>
          </aside>
        )}
      </section>
    </main>
  );
}
