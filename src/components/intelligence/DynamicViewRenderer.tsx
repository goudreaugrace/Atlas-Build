'use client';

import { AlertTriangle, BadgeCheck, BarChart3, Bell, BookOpen, BookOpenCheck, ClipboardList, Database, GitBranch, LineChart, Mic, Network, Pill, Route, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import artifactReadinessRequirementsJson from '@/src/data/config/artifact-readiness-requirements.json';
import groundingEducationQuizJson from '@/src/data/config/grounding-education-quiz.json';
import learningCaseWalkthroughsJson from '@/src/data/config/learning-case-walkthroughs.json';
import learningModulePagesJson from '@/src/data/config/learning-module-pages.json';
import learningPathsJson from '@/src/data/config/learning-paths.json';
import learningPracticeScenariosJson from '@/src/data/config/learning-practice-scenarios.json';
import { formatMetricValue } from '@/src/lib/data';
import { agentSkillRegistry, dynamicViewRegistry, experienceTemplateRegistry, findDynamicView } from '@/src/lib/intelligence/kernel';
import { governedRuntimeSurfaceRegistry, summarizeRuntimeSurfaces } from '@/src/lib/intelligence/runtime-surface-registry';
import type { AgentSessionAuditSummary, AgentSessionCanvasContinuitySummary, AgentSessionEvidenceSpotlightSummary, AgentSessionMemoryAuditSummary, AgentSessionPilotLearningSummary, AgentSessionReviewWorkflowSummary, AgentSessionRuntimeQualitySummary, AgentSessionSourceRuntimeIngestionSummary, AgentTurnResult, BrandIntelligencePacket, DynamicViewRequest } from '@/src/lib/intelligence/types';

const artifactReadinessRequirements = artifactReadinessRequirementsJson as {
  guardrails: string[];
  caveats: string[];
};

type LearningPath = {
  id: string;
  title: string;
  kicker: string;
  audience: string;
  estimatedTime: string;
  description: string;
  outcome: string;
  experienceType: string;
  status: string;
  moduleIds: string[];
  practicePrompt: string;
};

type LearningModulePage = {
  moduleId: string;
  eyebrow: string;
  title: string;
  promise: string;
  summary: string;
  heroBullets: string[];
};

type LearningPracticeScenario = {
  id: string;
  title: string;
  moduleId: string;
  lens: string;
  statement: string;
  context: string;
  correctAnswer: string;
  explanation: string;
  whyItMatters: string;
  relatedConcepts: string[];
};

type LearningQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type LearningCaseWalkthrough = {
  caseId: string;
  brandId: string;
  title: string;
  subtitle: string;
  audience: string;
  estimatedTime: string;
  scenario: string;
  learningObjectives: string[];
  sourceCaveat: string;
};

const learningPaths = learningPathsJson as LearningPath[];
const learningModulePages = learningModulePagesJson as LearningModulePage[];
const learningPracticeScenarios = learningPracticeScenariosJson as LearningPracticeScenario[];
const learningQuizQuestions = groundingEducationQuizJson as LearningQuizQuestion[];
const learningCaseWalkthroughs = learningCaseWalkthroughsJson as LearningCaseWalkthrough[];

function modulePage(moduleId: string) {
  return learningModulePages.find((module) => module.moduleId === moduleId);
}

function toneClass(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('declining') || normalized.includes('lagging') || normalized.includes('not ahead') || normalized.includes('missing')) return 'bad';
  if (normalized.includes('gaining') || normalized.includes('leading') || normalized.includes('ahead') || normalized.includes('available')) return 'good';
  return 'watch';
}

function ViewShell({ request, children }: { request: DynamicViewRequest; children: React.ReactNode }) {
  const view = findDynamicView(request.viewId);
  return (
    <article className="dynamic-view">
      <div className="dynamic-view-head">
        <div>
          <span>{view?.family.replaceAll('_', ' ') ?? 'approved view'}</span>
          <h3>{view?.name ?? request.viewId}</h3>
          <p>{request.reason}</p>
        </div>
        <strong className={request.requiredDataAvailable ? 'available' : 'gap'}>
          {request.requiredDataAvailable ? 'Data ready' : 'Gap state'}
        </strong>
      </div>
      {children}
    </article>
  );
}

function KpiStrip({ packet }: { packet: BrandIntelligencePacket }) {
  const metrics = ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different']
    .map((name) => packet.metrics[name])
    .filter(Boolean);
  return (
    <div className="dynamic-kpi-strip">
      {metrics.map((metric) => (
        <div key={metric.metric}>
          <span>{metric.metric === 'Pricing Power' ? 'Perceived Value' : metric.metric}</span>
          <strong>{formatMetricValue(metric.value)}</strong>
          <p>{metric.categoryBand}</p>
          <em className={toneClass(`${metric.ahead} ${metric.momentum}`)}>{metric.ahead} · {metric.momentum}</em>
        </div>
      ))}
    </div>
  );
}

function metricDisplayName(packet: BrandIntelligencePacket, metricName: string) {
  return metricName === packet.displayLanguage.perceivedValueMetricSource
    ? packet.displayLanguage.perceivedValueUserLabel
    : metricName;
}

function LearningExplainer({ packet }: { packet: BrandIntelligencePacket }) {
  const availablePaths = learningPaths.filter((path) => path.status === 'available').slice(0, 4);
  const primaryPath = availablePaths.find((path) => path.id === 'read-the-signals') ?? availablePaths[0];
  const modules = (primaryPath?.moduleIds ?? [])
    .map(modulePage)
    .filter((module): module is LearningModulePage => Boolean(module))
    .slice(0, 3);
  const brandCase = learningCaseWalkthroughs.find((item) => item.brandId === packet.brand.brandId) ?? learningCaseWalkthroughs[0];

  return (
    <div className="dynamic-learning">
      <div className="dynamic-learning-hero">
        <BookOpenCheck size={20} />
        <div>
          <span>Approved education path</span>
          <strong>{primaryPath?.title ?? 'Brand Doctor Learning'}</strong>
          <p>{primaryPath?.description ?? 'Use approved Brand Doctor education content to teach the active brand read.'}</p>
        </div>
        <a href="/learn">Open Learn hub</a>
      </div>
      <div className="dynamic-learning-grid">
        {modules.map((module) => (
          <a className="dynamic-learning-link" href={`/learn/${module.moduleId}`} key={module.moduleId}>
            <span>{module.eyebrow}</span>
            <strong>{module.title}</strong>
            <p>{module.promise}</p>
            <em>{module.heroBullets.slice(0, 2).join(' · ')}</em>
          </a>
        ))}
      </div>
      {brandCase && (
        <div className="dynamic-learning-case">
          <strong>{brandCase.title}</strong>
          <p>{brandCase.subtitle}</p>
          <ul>
            {brandCase.learningObjectives.slice(0, 3).map((objective) => <li key={objective}>{objective}</li>)}
          </ul>
          <a href={`/learn/cases/${brandCase.caseId}`}>Open case walkthrough</a>
        </div>
      )}
      <div className="dynamic-learning-paths">
        {availablePaths.map((path) => (
          <div key={path.id}>
            <span>{path.kicker} · {path.estimatedTime}</span>
            <strong>{path.title}</strong>
            <p>{path.outcome}</p>
            <em>{path.practicePrompt}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizCard({ packet }: { packet: BrandIntelligencePacket }) {
  const scenarios = learningPracticeScenarios
    .filter((scenario) => ['Momentum', 'Perceived Value', 'Different', 'Benchmarks'].some((lens) => scenario.lens.includes(lens)))
    .slice(0, 4);
  const questions = learningQuizQuestions.slice(0, 3);

  return (
    <div className="dynamic-quiz">
      <div className="dynamic-learning-hero">
        <ClipboardList size={20} />
        <div>
          <span>Signal-reading diagnostics</span>
          <strong>Practice with {packet.brand.brandName}</strong>
          <p>Use these checks to test whether the reader can separate measured evidence, interpretation, and blocked conclusions.</p>
        </div>
        <a href="/learn">Review modules</a>
      </div>
      <div className="dynamic-quiz-grid">
        {scenarios.map((scenario) => (
          <details className="dynamic-quiz-card" key={scenario.id}>
            <summary>
              <span>{scenario.lens}</span>
              <strong>{scenario.title}</strong>
            </summary>
            <p>{scenario.statement}</p>
            <em>{scenario.context}</em>
            <div>
              <strong>Best classification: {scenario.correctAnswer.replaceAll('_', ' ')}</strong>
              <p>{scenario.explanation}</p>
              <small>{scenario.whyItMatters}</small>
            </div>
          </details>
        ))}
      </div>
      <div className="dynamic-learning-diagnostics">
        {questions.map((question) => (
          <details key={question.id}>
            <summary>{question.question}</summary>
            <ol>
              {question.options.map((option, index) => (
                <li className={index === question.correctIndex ? 'correct' : undefined} key={option}>{option}</li>
              ))}
            </ol>
            <p>{question.explanation}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function MomentumLadder({ packet }: { packet: BrandIntelligencePacket }) {
  const rows = [
    { label: 'Demand Power', metric: packet.metrics['Demand Power'], momentum: packet.momentumIntelligence.demandPowerMomentum },
    { label: packet.displayLanguage.perceivedValueUserLabel, metric: packet.metrics[packet.displayLanguage.perceivedValueMetricSource], momentum: packet.momentumIntelligence.perceivedValueMomentum },
    { label: 'Salient', metric: packet.metrics.Salient, momentum: packet.momentumIntelligence.smdMomentum.salient },
    { label: 'Meaningful', metric: packet.metrics.Meaningful, momentum: packet.momentumIntelligence.smdMomentum.meaningful },
    { label: 'Different', metric: packet.metrics.Different, momentum: packet.momentumIntelligence.smdMomentum.different }
  ].filter((row) => row.metric);

  return (
    <div className="dynamic-ladder">
      <div className="dynamic-ladder-scale" aria-hidden="true">
        <span>0</span>
        <span>100</span>
        <span>200</span>
      </div>
      {rows.map(({ label, metric, momentum }) => {
        const value = Number(metric?.value ?? 0);
        const position = `${Math.max(0, Math.min(100, (value / 200) * 100))}%`;
        return (
          <div className="dynamic-ladder-row" key={label}>
            <span>{label}</span>
            <strong>{formatMetricValue(value)}</strong>
            <em className={toneClass(`${metric?.ahead} ${momentum}`)}>{metric?.ahead} · {momentum}</em>
            <i>
              <b style={{ left: position }} />
            </i>
          </div>
        );
      })}
    </div>
  );
}

function SmdDriverMap({ packet }: { packet: BrandIntelligencePacket }) {
  const smd = [
    ['Salient', packet.metrics.Salient, 'Memory retrieval and mental availability signal', packet.smdContributionWeights?.salient],
    ['Meaningful', packet.metrics.Meaningful, 'Relevance and needs-fit signal', packet.smdContributionWeights?.meaningful],
    ['Different', packet.metrics.Different, 'Distinctiveness in the BBE sense, not asset proof', packet.smdContributionWeights?.different]
  ];
  return (
    <div className="dynamic-smd-map">
      {packet.smdContributionWeights && (
        <div className="dynamic-smd-source">
          <ShieldAlert size={17} />
          <strong>Contribution weighting loaded</strong>
          <p>{packet.smdContributionWeights.sourceLabel}</p>
        </div>
      )}
      {smd.map(([label, metric, role, weight]) => (
        <div key={String(label)}>
          <BarChart3 size={17} />
          <strong>{String(label)}</strong>
          {metric && typeof metric === 'object' && 'value' in metric && (
            <p>{formatMetricValue(metric.value)} · {metric.categoryBand} · {metric.momentum}</p>
          )}
          {typeof weight === 'number' && (
            <span className="dynamic-weight-bar">
              <i style={{ width: `${Math.round(weight * 100)}%` }} />
              <small>{Math.round(weight * 100)}% directional weight</small>
            </span>
          )}
          <em>{String(role)}</em>
        </div>
      ))}
      {packet.smdContributionWeights?.caveats.map((caveat) => <p className="dynamic-source-caveat" key={caveat}>{caveat}</p>)}
    </div>
  );
}

function EvidenceLedger({ packet }: { packet: BrandIntelligencePacket }) {
  const matched = packet.diagnosisTrace.primaryRule.conditions.filter((condition) => condition.matched);
  const missing = packet.diagnosisTrace.primaryRule.conditions.filter((condition) => !condition.matched);
  return (
    <div className="dynamic-evidence-grid">
      <div>
        <h4>Matched evidence</h4>
        <ul>{(matched.length ? matched : packet.diagnosisTrace.primaryRule.conditions.slice(0, 3)).map((condition) => (
          <li key={`${condition.metric}-${condition.field}-${condition.group}`}>
            <strong>{condition.metric}</strong>
            <span>{condition.evidence}</span>
            <em>{condition.actual} · {condition.source}</em>
          </li>
        ))}</ul>
      </div>
      <div>
        <h4>Missing or complicating evidence</h4>
        <ul>{(missing.length ? missing : packet.evidenceReadiness.missingInputs.map((item) => ({ metric: item, evidence: item, actual: 'missing', source: 'Evidence readiness' }))).slice(0, 4).map((condition) => (
          <li key={`${condition.metric}-${condition.evidence}`}>
            <strong>{condition.metric}</strong>
            <span>{condition.evidence}</span>
            <em>{condition.actual} · {condition.source}</em>
          </li>
        ))}</ul>
      </div>
    </div>
  );
}

function EvidenceSpotlightPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.evidenceSpotlightSummary as AgentSessionEvidenceSpotlightSummary | undefined;

  if (!summary || summary.turnsWithEvidenceSpotlight === 0) {
    return (
      <div className="dynamic-empty">
        <BookOpen size={18} /> Evidence spotlight appears after a governed turn is persisted.
      </div>
    );
  }

  const statusRows = [
    { label: 'Supported', count: summary.claimStatusCounts.supportedByPacket, tone: 'good' },
    { label: 'Missing evidence', count: summary.claimStatusCounts.missingEvidence, tone: summary.claimStatusCounts.missingEvidence ? 'medium' : 'good' },
    { label: 'Guardrails', count: summary.claimStatusCounts.guardrail, tone: summary.claimStatusCounts.guardrail ? 'medium' : 'good' },
    { label: 'Reviewed context', count: summary.claimStatusCounts.reviewedWorkingContext, tone: 'medium' },
    { label: 'Not evidence', count: summary.claimStatusCounts.notEvidenceClaim, tone: 'medium' }
  ];

  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <div>
          <strong>Claim-to-proof continuity</strong>
          <p>{summary.turnsWithEvidenceSpotlight} governed turns · {summary.latestClaims.length} latest claims</p>
          <em>{summary.mode.replaceAll('_', ' ')} · store {summary.store.replaceAll('_', ' ')}</em>
        </div>
        <div>
          <strong>Canonical claim promotion</strong>
          <p>{summary.canonicalClaimPromotionEnabled ? 'enabled' : 'disabled'}</p>
          <em>unsupported claim generation {summary.unsupportedClaimGenerationEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        {statusRows.map((row) => (
          <div className={row.tone} key={row.label}>
            <BookOpen size={17} />
            <strong>{row.label}</strong>
            <p>{row.count} claims</p>
            <em>{row.label === 'Supported' ? 'Packet evidence labels attached.' : 'Visible before promotion or circulation.'}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-source-list">
        {summary.latestClaims.map((claim) => (
          <div key={claim.id}>
            <strong>{claim.claimType.replaceAll('_', ' ')}</strong>
            <span>{claim.supportStatus.replaceAll('_', ' ')} · {claim.humanReviewRequired ? 'human review required' : 'review not required'}</span>
            <p>{claim.claim}</p>
            <em>{claim.evidenceLabels.slice(0, 3).join(' · ') || claim.missingEvidenceIds.slice(0, 3).join(' · ') || claim.guardrails.slice(0, 2).join(' · ') || 'No proof label attached.'}</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        <li>Claim types: {summary.claimTypeCounts.slice(0, 5).map((item) => `${item.claimType.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'none yet'}</li>
        <li>Evidence labels: {summary.supportedEvidenceLabels.slice(0, 6).join(' · ') || 'none yet'}</li>
        <li>Missing evidence IDs: {summary.missingEvidenceIds.slice(0, 6).join(' · ') || 'none captured'}</li>
        <li>Source candidates: {summary.sourceCandidateIds.length} · reviewed context separated {summary.reviewedContextSeparated ? 'yes' : 'not yet'}</li>
        <li>{summary.guardrails[0]}</li>
        <li>{summary.caveats[2]}</li>
      </ul>
    </div>
  );
}

function DataBasisInspector({ packet }: { packet: BrandIntelligencePacket }) {
  const metricRows = ['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different']
    .map((name) => packet.metrics[name])
    .filter(Boolean);
  const matchedConditions = packet.diagnosisTrace.primaryRule.conditions.filter((condition) => condition.matched);
  const sourceRows = [
    {
      label: 'BBE Brand Health Record',
      status: 'loaded',
      detail: `${packet.dataCoverage.metricCount} metrics · ${packet.dataCoverage.trendMetricCount} trend reads · ${packet.dataCoverage.occasionCount} occasions`
    },
    {
      label: 'Momentum source',
      status: packet.momentumSourceReadiness.status.replaceAll('_', ' '),
      detail: packet.momentumSource?.sourceLabel ?? 'No reviewed Momentum source packet loaded'
    },
    {
      label: 'Brand Strategic Context',
      status: packet.strategicContextReadiness.status.replaceAll('_', ' '),
      detail: packet.strategicContextReadiness.sourceLabel ?? 'No approved brand strategy source loaded'
    },
    {
      label: 'Growth Navigator',
      status: packet.dataCoverage.growthNavigatorEvidenceMode.replaceAll('_', ' '),
      detail: packet.dataCoverage.hasGrowthNavigator ? 'Commercial support lens is present in the packet' : 'Growth Navigator source is missing'
    }
  ];
  const coverageRows = [
    ['Room to grow', packet.dataCoverage.hasRoomToGrowInputs ? packet.roomToGrow.label : 'Missing source inputs'],
    ['Peer basis', packet.peerSet ? `${packet.peerSet.label} · ${packet.peerSet.peerCount} peers` : 'Missing peer-set source'],
    ['Market context', packet.marketContext ? `${packet.marketContext.market} · ${packet.marketContext.period}` : 'Missing market/category context'],
    ['SMD weights', packet.dataCoverage.hasSmdContributionWeights ? 'Loaded source weights' : 'Missing contribution weights']
  ];
  const evidenceLabels = matchedConditions
    .map((condition) => `${condition.metric}: ${condition.evidence}`)
    .slice(0, 4);

  return (
    <div className="dynamic-data-basis">
      <div className="dynamic-source-band">
        <Database size={18} />
        <div>
          <strong>{packet.brand.brandName} active data packet</strong>
          <p>{packet.brand.category} · {packet.brand.period} · {packet.activeLens.activeLens}</p>
          <em>{packet.sourceFiles.slice(0, 3).join(' · ') || 'No source files listed on the Brand Health Record.'}</em>
        </div>
      </div>
      <div className="dynamic-data-metric-grid">
        {metricRows.map((metric) => (
          <div key={metric.metric}>
            <span>{metricDisplayName(packet, metric.metric)}</span>
            <strong>{formatMetricValue(metric.value)}</strong>
            <p>{metric.categoryBand}</p>
            <em>{metric.ahead} · {metric.momentum}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-source-checks">
        {sourceRows.map((row) => (
          <div key={row.label} className={row.status.includes('blocked') || row.status.includes('missing') ? 'high' : row.status.includes('synthetic') || row.status.includes('partial') || row.status.includes('ready for') ? 'medium' : 'good'}>
            <BookOpenCheck size={17} />
            <strong>{row.label}</strong>
            <p>{row.status}</p>
            <em>{row.detail}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-data-coverage">
        {coverageRows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="dynamic-source-list">
        {evidenceLabels.map((label) => (
          <div key={label}>
            <strong>Diagnosis proof</strong>
            <p>{label}</p>
          </div>
        ))}
        {packet.evidenceGaps.slice(0, 3).map((gap) => (
          <div key={gap.id}>
            <strong>{gap.label}</strong>
            <span>{gap.severity}</span>
            <p>{gap.missingInput}</p>
            <em>{gap.bestNextSource}</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        <li>{packet.displayLanguage.perceivedValueRequiredLanguage}</li>
        <li>Pricing Power remains the source metric name; Perceived Value is the user-facing label.</li>
        <li>Category lens caveat: {packet.activeLens.knownBlindSpots[0]}</li>
        <li>Peer and opportunity reads stay caveated until market, peer-set, and room-to-grow inputs are source-backed.</li>
      </ul>
    </div>
  );
}

function ProvocationList({ packet }: { packet: BrandIntelligencePacket }) {
  return (
    <div className="dynamic-provocation-list">
      {packet.starterProvocations.map((provocation) => (
        <div key={provocation.id}>
          <Sparkles size={17} />
          <strong>{provocation.title}</strong>
          <p>{provocation.what}</p>
          <p>{provocation.soWhat}</p>
          <em>{provocation.nowWhat}</em>
        </div>
      ))}
    </div>
  );
}

function TreatmentPathCard({ packet }: { packet: BrandIntelligencePacket }) {
  const option = packet.treatmentOptions[0];
  if (!option) return <div className="dynamic-empty"><Pill size={18} /> No governed treatment path is available.</div>;
  const treatmentQualityChecks = packet.outputQualityChecks.filter((check) => check.appliesTo.includes('treatment_recommendation'));
  return (
    <div className="dynamic-treatment-card">
      <Pill size={18} />
      <div>
        <span>Ranked for {packet.brand.brandName}</span>
        <strong>{option.name}</strong>
        <p>Global treatment library path · fit {Math.round(option.score)} · {option.tier}</p>
        <em>{option.globalLibraryRole}</em>
        <ul>{option.brandSpecificBasis.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <div className="dynamic-proof-mini">
          <strong>Inspect before acting</strong>
          {option.evidenceNeeds.slice(0, 3).map((need) => <span key={need}>{need}</span>)}
        </div>
        <div className="dynamic-quality-mini">
          {treatmentQualityChecks.slice(0, 4).map((check) => (
            <span className={check.status} key={check.id}>{check.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataGapPanel({ packet }: { packet: BrandIntelligencePacket }) {
  return (
    <div className="dynamic-gap-list">
      {packet.evidenceGaps.map((gap) => (
        <div className={gap.severity} key={gap.id}>
          <AlertTriangle size={17} />
          <strong>{gap.label}</strong>
          <p>{gap.missingInput}</p>
          <em>{gap.bestNextSource}</em>
        </div>
      ))}
    </div>
  );
}

function SourceReadinessPanel({ packet }: { packet: BrandIntelligencePacket }) {
  const readiness = packet.momentumSourceReadiness;
  const strategicReadiness = packet.strategicContextReadiness;
  const runtimeFileDrop = packet.momentumRuntimeSourceFileDropReadiness;
  const strategicRuntimeFileDrop = packet.strategicContextRuntimeSourceFileDropReadiness;
  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <ShieldAlert size={18} />
        <div>
          <strong>{readiness.status.replaceAll('_', ' ')}</strong>
          <p>{readiness.sourceLabel ?? 'No Momentum source context loaded.'}</p>
          <em>{readiness.canonicalForExecutiveUse ? 'Approved source-owner extract blocks are loaded; human review still required.' : 'Blocked for executive use until source-owner extracts cover all required blocks.'}</em>
        </div>
      </div>
      <div className="dynamic-source-band">
        <BookOpenCheck size={18} />
        <div>
          <strong>Brand Strategic Context {strategicReadiness.status.replaceAll('_', ' ')}</strong>
          <p>{strategicReadiness.sourceLabel ?? 'No official Brand Strategic Context source loaded.'}</p>
          <em>{strategicReadiness.canonicalForExecutiveUse ? 'Approved source-owner brand strategy blocks are loaded; human review still required.' : 'Blocked for executive or agency use until approved brand foundations, positioning/objectives, and creative/claims sources are loaded.'}</em>
        </div>
      </div>
      <div className="dynamic-source-band">
        <Database size={18} />
        <div>
          <strong>Runtime file drop {runtimeFileDrop.status.replaceAll('_', ' ')}</strong>
          <p>{runtimeFileDrop.expectedSourceDirectory} · audit {runtimeFileDrop.audit.auditMode.replaceAll('_', ' ')}</p>
          <em>Runtime consumption {runtimeFileDrop.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} · canonical use {runtimeFileDrop.canonicalUseEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-source-band">
        <Database size={18} />
        <div>
          <strong>Brand Strategic Context file drop {strategicRuntimeFileDrop.status.replaceAll('_', ' ')}</strong>
          <p>{strategicRuntimeFileDrop.expectedSourceDirectory} · audit {strategicRuntimeFileDrop.audit.auditMode.replaceAll('_', ' ')}</p>
          <em>Runtime consumption {strategicRuntimeFileDrop.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'} · canonical use {strategicRuntimeFileDrop.canonicalUseEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        {readiness.checks.map((check) => (
          <div className={check.status === 'source_ready' ? 'good' : check.status === 'missing' ? 'high' : 'medium'} key={check.id}>
            <BadgeCheck size={17} />
            <strong>{check.label}</strong>
            <p>{check.detail}</p>
            <em>{check.requiredSource}</em>
          </div>
        ))}
        {strategicReadiness.checks.map((check) => (
          <div className={check.status === 'source_ready' ? 'good' : check.status === 'missing' ? 'high' : 'medium'} key={`strategic-${check.id}`}>
            <BookOpenCheck size={17} />
            <strong>{check.label}</strong>
            <p>{check.detail}</p>
            <em>{check.requiredSource}</em>
          </div>
        ))}
        {runtimeFileDrop.requiredFileKinds.map((fileKind) => (
          <div className={runtimeFileDrop.loadedFileKinds.includes(fileKind) ? 'good' : 'high'} key={fileKind}>
            <Database size={17} />
            <strong>{fileKind.replaceAll('_', ' ')}</strong>
            <p>{runtimeFileDrop.loadedFileKinds.includes(fileKind) ? 'Loaded for governance review.' : 'Missing from the governed runtime source directory.'}</p>
            <em>{runtimeFileDrop.audit.fileKindAudits.find((audit) => audit.fileKind === fileKind)?.expectedPathHint ?? runtimeFileDrop.templatePath}</em>
          </div>
        ))}
        {strategicRuntimeFileDrop.requiredFileKinds.map((fileKind) => (
          <div className={strategicRuntimeFileDrop.loadedFileKinds.includes(fileKind) ? 'good' : 'high'} key={`strategic-runtime-${fileKind}`}>
            <Database size={17} />
            <strong>{fileKind.replaceAll('_', ' ')}</strong>
            <p>{strategicRuntimeFileDrop.loadedFileKinds.includes(fileKind) ? 'Loaded for governance review.' : 'Missing from the governed Brand Strategic Context source directory.'}</p>
            <em>{strategicRuntimeFileDrop.audit.fileKindAudits.find((audit) => audit.fileKind === fileKind)?.expectedPathHint ?? strategicRuntimeFileDrop.templatePath}</em>
          </div>
        ))}
      </div>
      {readiness.blockers.length > 0 && (
        <ul>{readiness.blockers.slice(0, 4).map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
      )}
      {strategicReadiness.blockers.length > 0 && (
        <ul>{strategicReadiness.blockers.slice(0, 4).map((blocker) => <li key={`strategic-${blocker}`}>{blocker}</li>)}</ul>
      )}
      <div className="dynamic-readiness-handoff">
        {strategicReadiness.handoffRequirements.map((requirement) => (
          <div key={`strategic-${requirement.id}`}>
            <strong>{requirement.label}</strong>
            <span>{requirement.currentStatus.replaceAll('_', ' ')} · {requirement.sourceOwnerRole}</span>
            <p>{requirement.nextAction}</p>
            <em>{requirement.acceptedSourceTypes.join(', ')} · gate: {requirement.promotionGate.replaceAll('_', ' ')}</em>
          </div>
        ))}
        {readiness.handoffRequirements.map((requirement) => (
          <div key={requirement.id}>
            <strong>{requirement.label}</strong>
            <span>{requirement.currentStatus.replaceAll('_', ' ')} · {requirement.sourceOwnerRole}</span>
            <p>{requirement.nextAction}</p>
            <em>{requirement.acceptedExtractShape} · gate: {requirement.promotionGate.replaceAll('_', ' ')}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagnosisTraceSummary({ packet }: { packet: BrandIntelligencePacket }) {
  return (
    <div className="dynamic-trace">
      <GitBranch size={18} />
      <div>
        <span>Rule fired</span>
        <strong>{packet.diagnosisTrace.primaryRule.ruleId}</strong>
        <p>{packet.diagnosisTrace.primaryRule.description}</p>
        <em>{packet.diagnosisTrace.primaryRule.matchedConditionCount}/{packet.diagnosisTrace.primaryRule.totalConditionCount} conditions matched · {packet.diagnosisTrace.primaryRule.confidence}</em>
      </div>
    </div>
  );
}

function PatternRadarBrief({ packet }: { packet: BrandIntelligencePacket }) {
  return (
    <div className="dynamic-pattern-list">
      {packet.patternRadar.similarBrands.slice(0, 3).map((match) => (
        <div key={match.brandId}>
          <Network size={17} />
          <strong>{match.brandName}</strong>
          <p>{match.strength} similarity · {match.score}</p>
          <em>{match.reasons.slice(0, 2).join(' · ')}</em>
        </div>
      ))}
    </div>
  );
}

function PeerComparison({ packet }: { packet: BrandIntelligencePacket }) {
  const matches = packet.patternRadar.similarBrands.slice(0, 4);
  return (
    <div className="dynamic-peer-comparison">
      <div className="dynamic-source-band">
        {packet.peerSet ? (
          <p><strong>{packet.peerSet.label}</strong> · {packet.peerSet.peerCount} peers · {packet.peerSet.selectionBasis}</p>
        ) : (
          <p><strong>Approved peer set missing</strong> · showing associative Pattern Radar matches only.</p>
        )}
      </div>
      <div className="dynamic-pattern-list">
        {matches.map((match) => (
          <div key={match.brandId}>
            <Network size={17} />
            <strong>{match.brandName}</strong>
            <p>{match.category} · {match.diagnosisName} · {match.strength} similarity</p>
            <em>{match.reasons.slice(0, 2).join(' · ')}</em>
            <small>{match.keyDifference}</small>
          </div>
        ))}
        {matches.length === 0 && (
          <div>
            <AlertTriangle size={17} />
            <strong>No peer matches loaded</strong>
            <p>Load approved peer-set context before using comparison as a decision aid.</p>
          </div>
        )}
      </div>
      <ul>
        <li>{packet.patternRadar.topline.caveat}</li>
        {packet.peerSet?.caveats.slice(0, 2).map((caveat) => <li key={caveat}>{caveat}</li>)}
      </ul>
    </div>
  );
}

function RoomToGrowGrid({ packet }: { packet: BrandIntelligencePacket }) {
  const inputCards = [
    ['Penetration headroom', packet.roomToGrow.inputs.penetrationHeadroom, 'points'],
    ['Demand Power / share gap', packet.roomToGrow.inputs.demandPowerShareVsMarketShareGap, 'points'],
    ['Category growth', packet.roomToGrow.inputs.categoryGrowth, packet.marketContext?.categoryGrowthUnit === 'percent' ? '%' : '']
  ];
  return (
    <div className="dynamic-room-grid">
      <div className="dynamic-room-head">
        <ShieldAlert size={18} />
        <div>
          <strong>{packet.roomToGrow.label}</strong>
          <p>{packet.roomToGrow.read}</p>
        </div>
      </div>
      <div className="dynamic-room-metrics">
        {inputCards.map(([label, value, unit]) => (
          <div key={String(label)}>
            <span>{String(label)}</span>
            <strong>{typeof value === 'number' ? `${value}${unit}` : 'Missing'}</strong>
          </div>
        ))}
      </div>
      {(packet.marketContext || packet.peerSet) && (
        <div className="dynamic-source-band">
          {packet.marketContext && (
            <p><strong>{packet.marketContext.market}</strong> · {packet.marketContext.period} · {packet.marketContext.maturity}</p>
          )}
          {packet.peerSet && (
            <p><strong>{packet.peerSet.label}</strong> · {packet.peerSet.peerCount} peers · {packet.peerSet.selectionBasis}</p>
          )}
        </div>
      )}
      <ul>{packet.roomToGrow.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
    </div>
  );
}

function QbrStoryDraft({ packet }: { packet: BrandIntelligencePacket }) {
  const treatment = packet.treatmentOptions[0];
  const provocation = packet.starterProvocations[0];
  const qualityChecks = packet.outputQualityChecks.filter((check) => check.appliesTo.includes('brief_story') || check.appliesTo.includes('executive_read'));
  const slides = [
    `Headline read: ${packet.diagnosisResult.primary.diagnosis.name}`,
    'BBE bloodwork: Demand Power, Perceived Value, Salient, Meaningful, Different',
    `Why we believe it: ${packet.diagnosisTrace.primaryRule.ruleId} evidence trace`,
    `What complicates action: ${packet.evidenceGaps.slice(0, 2).map((gap) => gap.label).join(' + ')}`,
    `Path to test: ${treatment?.name ?? 'Select treatment after evidence review'}`,
    'Follow-up proof: monitor intended metric movement and named caveats'
  ];

  return (
    <div className="dynamic-qbr-draft">
      <div>
        <span>Executive narrative</span>
        <strong>{packet.brand.brandName} QBR Decision Story Draft</strong>
        <p>{packet.brand.brandName} is currently read as {packet.diagnosisResult.primary.diagnosis.name}. {packet.momentumIntelligence.headline}</p>
        {provocation && <p>{provocation.soWhat}</p>}
        {treatment && <em>Ranked treatment path to consider: {treatment.name}. Human review required before circulation.</em>}
      </div>
      <ol>{slides.map((slide) => <li key={slide}>{slide}</li>)}</ol>
      <div className="dynamic-quality-mini">
        {qualityChecks.slice(0, 6).map((check) => (
          <span className={check.status} key={check.id}>{check.label}</span>
        ))}
      </div>
    </div>
  );
}

function MeetingTakeawayPanel({ packet }: { packet: BrandIntelligencePacket }) {
  const provocation = packet.starterProvocations[0];
  const treatment = packet.treatmentOptions[0];
  const nextProof = packet.evidenceGaps[0]?.bestNextSource ?? treatment?.followUpSignals[0] ?? 'Review next BBE wave and follow-up signals.';

  return (
    <div className="dynamic-meeting-takeaway">
      <div>
        <BadgeCheck size={18} />
        <span>Draft takeaway</span>
        <strong>{packet.diagnosisResult.primary.diagnosis.name}</strong>
        <p>{packet.momentumIntelligence.headline}</p>
      </div>
      <div>
        <Sparkles size={18} />
        <span>Provisional discussion point</span>
        <strong>{provocation?.title ?? 'Select a provocation after evidence review'}</strong>
        <p>{provocation?.soWhat ?? 'No starter provocation is available in this packet.'}</p>
      </div>
      <div>
        <ShieldAlert size={18} />
        <span>Path to consider</span>
        <strong>{treatment?.name ?? 'No treatment path ranked'}</strong>
        <p>{treatment ? treatment.rankReasons.slice(0, 2).join(' ') : 'Treatment selection needs human review.'}</p>
      </div>
      <div>
        <AlertTriangle size={18} />
        <span>Next proof signal</span>
        <strong>{nextProof}</strong>
        <p>Human review required before this takeaway becomes final meeting output.</p>
      </div>
    </div>
  );
}

function reviewWorkflowSummaryFromResult(result?: AgentTurnResult): AgentSessionReviewWorkflowSummary | null {
  if (result?.persistence?.reviewWorkflowSummary) return result.persistence.reviewWorkflowSummary;
  if (!result) return null;
  const pendingMemory = result.memory.filter((record) => record.status === 'suggested').length;
  const pendingArtifacts = (result.experiencePlan?.artifacts ?? []).filter((artifact) => (artifact.reviewStatus ?? 'pending') === 'pending' && artifact.status !== 'blocked').length;
  const pendingGates = result.confirmationGates.filter((gate) => gate.status === 'required').length;
  const blockedGates = result.confirmationGates.filter((gate) => gate.status === 'blocked').length;
  return {
    id: 'agent-session-review-workflow-v1',
    sessionId: result.persistence?.sessionId ?? result.turnId,
    mode: 'prototype_local_review_queue',
    reviewer: 'human_review',
    store: 'local_json',
    pending: {
      memory: pendingMemory,
      artifacts: pendingArtifacts,
      confirmationGates: pendingGates,
      total: pendingMemory + pendingArtifacts + pendingGates
    },
    reviewed: {
      acceptedMemory: result.acceptedMemory.length,
      approvedArtifacts: 0,
      approvedGates: result.confirmationGates.filter((gate) => gate.status === 'approved').length,
      rejectedOrDismissed: 0,
      totalReviews: result.persistence?.ledgerSummary.reviews ?? 0
    },
    blocked: {
      memory: result.memory.filter((record) => record.status === 'blocked').length,
      artifacts: (result.experiencePlan?.artifacts ?? []).filter((artifact) => artifact.status === 'blocked').length,
      confirmationGates: blockedGates,
      capabilityBlockedGates: result.confirmationGates.filter((gate) => gate.status === 'blocked' && ['export_artifact', 'accept_memory', 'promote_source_claim', 'write_source_data'].includes(gate.action)).length
    },
    officialApprovalEnabled: false,
    enterpriseIdentityEnabled: false,
    canonicalWritesEnabled: false,
    artifactExportEnabled: false,
    autoAcceptMemoryEnabled: false,
    runtimeAutoConsumptionEnabled: false,
    nextActions: [
      'Review suggested memory, artifacts, and required gates before they influence future work.',
      'Blocked capability gates require governance/config changes, not local approval.'
    ],
    guardrails: [
      'Local review decisions are prototype workflow state, not official enterprise approvals.',
      'Accepted memory is working context only; it is not source truth.'
    ],
    caveats: [
      'This current-turn summary is available before the local JSON session ledger is refreshed.',
      'Enterprise reviewer identity, official approval, export, and canonical writes remain disabled.'
    ]
  };
}

function ReviewWorkflowPanel({ result }: { result?: AgentTurnResult }) {
  const summary = reviewWorkflowSummaryFromResult(result);
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <ShieldAlert size={18} /> Review workflow state appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ShieldAlert size={18} />
        <div>
          <strong>{summary.mode.replaceAll('_', ' ')}</strong>
          <p>{summary.reviewer} · {summary.store} · official approval {summary.officialApprovalEnabled ? 'enabled' : 'blocked'}</p>
          <em>{summary.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.pending.total > 0 ? 'medium' : 'good'}>
          <ClipboardList size={17} />
          <strong>Pending review</strong>
          <p>{summary.pending.total} total</p>
          <em>{summary.pending.memory} memory · {summary.pending.artifacts} artifacts · {summary.pending.confirmationGates} gates</em>
        </div>
        <div className="good">
          <BadgeCheck size={17} />
          <strong>Reviewed locally</strong>
          <p>{summary.reviewed.totalReviews} decisions</p>
          <em>{summary.reviewed.acceptedMemory} memory · {summary.reviewed.approvedArtifacts} artifacts · {summary.reviewed.approvedGates} gates</em>
        </div>
        <div className={summary.blocked.confirmationGates > 0 ? 'high' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Blocked gates</strong>
          <p>{summary.blocked.confirmationGates} blocked</p>
          <em>{summary.blocked.capabilityBlockedGates} capability gates need governance/config changes</em>
        </div>
      </div>
      <ul>
        <li>Enterprise identity: {summary.enterpriseIdentityEnabled ? 'enabled' : 'blocked'}</li>
        <li>Canonical writes: {summary.canonicalWritesEnabled ? 'enabled' : 'disabled'}</li>
        <li>Artifact export: {summary.artifactExportEnabled ? 'enabled' : 'disabled'}</li>
        <li>Memory auto-accept: {summary.autoAcceptMemoryEnabled ? 'enabled' : 'disabled'}</li>
        <li>Runtime source auto-consumption: {summary.runtimeAutoConsumptionEnabled ? 'enabled' : 'disabled'}</li>
      </ul>
    </div>
  );
}

function MemoryAuditPanel({ result }: { result?: AgentTurnResult }) {
  const summary: AgentSessionMemoryAuditSummary | undefined = result?.persistence?.memoryAuditSummary;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <ClipboardList size={18} /> Memory audit continuity appears after a governed turn is persisted.
      </div>
    );
  }

  const acceptedContext = summary.acceptedMemoryContextIds.slice(0, 4);
  const latestMemory = summary.latestMemory.slice(0, 4);
  const auditCoverage = [
    ['Working context', summary.auditCoverage.workingContextAudited],
    ['Suggestions', summary.auditCoverage.memorySuggestionsAudited],
    ['Accepted load', summary.auditCoverage.acceptedMemoryLoadedAudited],
    ['Quality check', summary.auditCoverage.runtimeQualityMemoryReviewChecked]
  ] as const;

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ClipboardList size={18} />
        <div>
          <strong>{summary.mode.replaceAll('_', ' ')}</strong>
          <p>{summary.store} · {summary.turnsWithWorkingContext} working-context turns · {summary.auditCoverage.memoryAuditRecords} memory audit records</p>
          <em>{summary.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.memory.accepted > 0 ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Reviewed context</strong>
          <p>{summary.memory.accepted} accepted · {summary.memory.suggested} suggested</p>
          <em>{summary.acceptedMemorySourceTurnIds.length} source turns · {summary.acceptedMemoryContextIds.length} context records</em>
        </div>
        <div className={summary.memory.blocked > 0 ? 'high' : 'medium'}>
          <ShieldAlert size={17} />
          <strong>Review gates</strong>
          <p>{summary.reviewGateIds.length} gates · {summary.blockedMemoryGateIds.length} blocked</p>
          <em>{summary.memoryReviewDecisions.total} decisions · {summary.memoryReviewDecisions.rejected} rejected</em>
        </div>
        <div className={summary.autoAcceptMemoryEnabled || summary.canonicalMemoryWriteEnabled || summary.enterpriseMemoryStoreEnabled ? 'high' : 'good'}>
          <Database size={17} />
          <strong>Write posture</strong>
          <p>auto-accept {summary.autoAcceptMemoryEnabled ? 'enabled' : 'disabled'}</p>
          <em>canonical {summary.canonicalMemoryWriteEnabled ? 'enabled' : 'disabled'} · enterprise store {summary.enterpriseMemoryStoreEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {summary.memoryPromotionProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Canonical memory {step.enablesCanonicalMemory ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
        <div>
          <strong>Audit coverage</strong>
          <span>{summary.auditCoverage.turnsWithMemoryAudit} audited turns</span>
          <p>{auditCoverage.map(([label, covered]) => `${label}: ${covered ? 'covered' : 'waiting'}`).join(' · ')}</p>
          <em>{summary.auditCoverage.latestMemoryAuditLabels.slice(0, 3).join(' · ') || 'No latest memory audit labels captured yet.'}</em>
        </div>
        <div>
          <strong>Memory types</strong>
          <span>{summary.memoryTypeCounts.length} types</span>
          <p>{summary.memoryTypeCounts.slice(0, 5).map((item) => `${item.type}: ${item.count}`).join(' · ') || 'No memory types captured yet.'}</p>
          <em>{summary.guardrails[0]}</em>
        </div>
        <div>
          <strong>Accepted context</strong>
          <span>{acceptedContext.length ? acceptedContext.join(' · ') : 'none loaded yet'}</span>
          <p>{summary.acceptedMemorySourceTurnIds.slice(0, 3).join(' · ') || 'No accepted source turns captured yet.'}</p>
          <em>Accepted memory remains working context only.</em>
        </div>
      </div>
      <ul>
        {latestMemory.map((record) => (
          <li key={record.id}>{record.label} · {record.type} · {record.status.replaceAll('_', ' ')} · review {record.humanReviewRequired ? 'required' : 'not required'}</li>
        ))}
        <li>Reviewed-memory writes: {summary.reviewedMemoryWriteEnabled ? 'enabled' : 'disabled'} · canonical memory writes: {summary.canonicalMemoryWriteEnabled ? 'enabled' : 'disabled'}</li>
        <li>{summary.guardrails[1]}</li>
      </ul>
    </div>
  );
}

function AuditTrailPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.auditSummary as AgentSessionAuditSummary | undefined;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <ClipboardList size={18} /> Audit trail continuity appears after a governed turn is persisted.
      </div>
    );
  }

  const coverage = [
    ['Lifecycle', summary.turnLifecycleAudited],
    ['Evidence', summary.evidenceUseAudited],
    ['Views', summary.viewRequestsAudited],
    ['Artifacts', summary.artifactGenerationAudited],
    ['Memory', summary.memorySuggestionsAudited],
    ['Source', summary.sourceGovernanceAudited],
    ['Quality', summary.runtimeQualityAudited]
  ] as const;
  const disabledPaths = [
    ['Audit export', summary.auditExportEnabled],
    ['Canonical write', summary.auditCanonicalWriteEnabled],
    ['Enterprise store', summary.enterpriseAuditStoreEnabled]
  ] as const;

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ClipboardList size={18} />
        <div>
          <strong>{summary.mode.replaceAll('_', ' ')}</strong>
          <p>{summary.store} · {summary.turnsWithAudit} audited turns · {summary.records} records</p>
          <em>{summary.recordsRequiringConfirmation} confirmation-required records · {summary.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.records > 0 ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Audit coverage</strong>
          <p>{summary.skillIds.length} skills · {summary.viewIds.length} views</p>
          <em>{summary.artifactIds.length} artifacts · {summary.evidenceLabels.length} evidence labels</em>
        </div>
        <div className={summary.recordsRequiringConfirmation > 0 ? 'medium' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Confirmation state</strong>
          <p>{summary.recordsRequiringConfirmation} records</p>
          <em>{summary.actionCounts.slice(0, 3).map((item) => `${item.action.replaceAll('_', ' ')} ${item.count}`).join(' · ') || 'No action counts yet'}</em>
        </div>
        <div className={summary.auditExportEnabled || summary.auditCanonicalWriteEnabled || summary.enterpriseAuditStoreEnabled ? 'high' : 'good'}>
          <Database size={17} />
          <strong>Audit promotion</strong>
          <p>export {summary.auditExportEnabled ? 'enabled' : 'disabled'}</p>
          <em>canonical {summary.auditCanonicalWriteEnabled ? 'enabled' : 'disabled'} · enterprise {summary.enterpriseAuditStoreEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        <div>
          <strong>Coverage checks</strong>
          <span>{coverage.filter(([, covered]) => covered).length} of {coverage.length} covered</span>
          <p>{coverage.map(([label, covered]) => `${label}: ${covered ? 'covered' : 'waiting'}`).join(' · ')}</p>
          <em>{summary.guardrails[0]}</em>
        </div>
        <div>
          <strong>Evidence and views</strong>
          <span>{summary.viewIds.slice(0, 5).join(' · ') || 'No audited views yet'}</span>
          <p>{summary.evidenceLabels.slice(0, 5).join(' · ') || 'No audited evidence labels yet'}</p>
          <em>{summary.skillIds.slice(0, 5).join(' · ') || 'No audited skills yet'}</em>
        </div>
        <div>
          <strong>Disabled paths</strong>
          <span>{disabledPaths.map(([label, enabled]) => `${label}: ${enabled ? 'enabled' : 'disabled'}`).join(' · ')}</span>
          <p>Latest audit records remain prototype local JSON runtime evidence.</p>
          <em>{summary.guardrails[2] ?? summary.guardrails[0]}</em>
        </div>
      </div>
      <div className="dynamic-source-list">
        {summary.auditGovernanceProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · before {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Audit export {step.enablesAuditExport ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
      </div>
      <ul>
        {summary.latestRecords.slice(0, 5).map((record) => (
          <li key={record.id}>{record.label} · {record.action.replaceAll('_', ' ')} · {record.requiresConfirmation ? 'confirmation required' : 'logged'} · {record.skillId ?? 'no skill'}</li>
        ))}
        <li>{summary.guardrails[1] ?? summary.guardrails[0]}</li>
      </ul>
    </div>
  );
}

function ReviewIdentityPanel({ result }: { result?: AgentTurnResult }) {
  const manifest = result?.reviewIdentityManifest;
  const governance = result?.persistence?.persistenceGovernanceSummary;
  const review = result?.persistence?.reviewWorkflowSummary;
  if (!manifest) {
    return (
      <div className="dynamic-empty">
        <UserCheck size={18} /> Review identity state appears after a governed turn is available.
      </div>
    );
  }

  const disabledPaths = [
    ['Enterprise identity', manifest.enterpriseIdentityEnabled],
    ['Role access', manifest.roleBasedAccessEnabled],
    ['Brand access', manifest.brandAccessControlEnabled],
    ['Official approval', manifest.officialApprovalEnabled]
  ] as const;

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <UserCheck size={18} />
        <div>
          <strong>{manifest.mode.replaceAll('_', ' ')}</strong>
          <p>{manifest.prototypeReviewerLabel} · {manifest.reviewableItemTypes.length} reviewable item types · {manifest.blockedEnterpriseApprovalTypes.length} blocked approval types</p>
          <em>{manifest.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={manifest.localReviewWorkflowEnabled ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Local review workflow</strong>
          <p>{manifest.reviewActionsUsePrototypeIdentity ? 'prototype label active' : 'identity missing'}</p>
          <em>{manifest.allowedPrototypeDecisions.join(' · ')}</em>
        </div>
        <div className={manifest.officialApprovalBlocked ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Official approval</strong>
          <p>{manifest.officialApprovalBlocked ? 'blocked' : 'available'}</p>
          <em>accountable reviewer {manifest.accountableReviewerKnown ? 'known' : 'not connected'} · gates {manifest.relatedGateIds.length}</em>
        </div>
        <div className={manifest.enterpriseIdentityEnabled || manifest.roleBasedAccessEnabled || manifest.brandAccessControlEnabled ? 'medium' : 'good'}>
          <Database size={17} />
          <strong>Enterprise identity</strong>
          <p>{manifest.enterpriseIdentityEnabled ? 'enabled' : 'disabled'}</p>
          <em>role access {manifest.roleBasedAccessEnabled ? 'enabled' : 'disabled'} · brand access {manifest.brandAccessControlEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        <div>
          <strong>Blocked approval types</strong>
          <span>{manifest.blockedEnterpriseApprovalTypes.map((item) => item.replaceAll('_', ' ')).join(' · ')}</span>
          <p>{manifest.guardrails[0]}</p>
          <em>Session identity turns: {governance?.turnsWithReviewIdentity ?? 0}</em>
        </div>
        <div>
          <strong>Required before enterprise approval</strong>
          <span>{manifest.requiredBeforeEnterpriseApproval.slice(0, 3).join(' · ')}</span>
          <p>{manifest.requiredBeforeEnterpriseApproval.slice(3).join(' · ') || 'No additional steps listed.'}</p>
          <em>{governance?.latestNextPromotionStep ?? 'Enterprise identity and approval workflow remain future requirements.'}</em>
        </div>
        <div>
          <strong>Disabled paths</strong>
          <span>{disabledPaths.map(([label, enabled]) => `${label}: ${enabled ? 'enabled' : 'disabled'}`).join(' · ')}</span>
          <p>Review queue decisions remain prototype workflow state.</p>
          <em>Official approval {review?.officialApprovalEnabled ? 'enabled' : 'blocked'} · canonical writes {review?.canonicalWritesEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <ul>
        <li>Related gates: {manifest.relatedGateIds.slice(0, 5).join(' · ') || 'No related gates captured yet.'}</li>
        <li>Related review records: {manifest.relatedReviewRecordIds.slice(0, 5).join(' · ') || 'No related review records captured yet.'}</li>
        <li>{manifest.guardrails[1]}</li>
        <li>{manifest.caveats[1]}</li>
      </ul>
    </div>
  );
}

function buildPilotLearningPromotionProtocol(
  signals: AgentTurnResult['pilotLearningManifest']['signals'],
  blockedLearningPaths: string[],
  nextProofNeeds: string[]
): AgentSessionPilotLearningSummary['learningPromotionProtocol'] {
  const capturedSignals = signals.filter((signal) => signal.status === 'captured_for_review');
  const reviewRequiredSignals = signals.filter((signal) => signal.humanReviewRequired);
  const item = (
    id: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['id'],
    label: string,
    status: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['status'],
    requiredBefore: AgentSessionPilotLearningSummary['learningPromotionProtocol'][number]['requiredBefore'],
    proof: string,
    blockers: string[]
  ): AgentSessionPilotLearningSummary['learningPromotionProtocol'][number] => ({
    id,
    label,
    status,
    requiredBefore,
    proof,
    blockers,
    enablesLearningWrite: false
  });

  return [
    item(
      'reviewed_signal_capture',
      'Reviewed pilot signal capture',
      capturedSignals.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${capturedSignals.length} signals captured for review.`,
      capturedSignals.length > 0 ? ['Signals are review evidence only.'] : ['No captured signals observed.']
    ),
    item(
      'human_learning_review',
      'Human learning review',
      reviewRequiredSignals.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${reviewRequiredSignals.length} signals require human review.`,
      reviewRequiredSignals.length > 0 ? ['Prototype review does not authorize autonomous learning.'] : ['No review-required signals observed.']
    ),
    item(
      'proof_need_resolution',
      'Proof need resolution',
      nextProofNeeds.length > 0 ? 'ready_for_review' : 'blocked',
      'pilot_review',
      `${nextProofNeeds.length} proof needs captured.`,
      nextProofNeeds.slice(0, 4)
    ),
    item(
      'outcome_linkage_governance',
      'Outcome linkage governance',
      'blocked',
      'outcome_learning',
      'Outcome learning needs accepted outcome records, follow-up linkage, efficacy rules, and causal caveats.',
      ['Outcome learning and treatment outcome claims remain disabled.']
    ),
    item(
      'canonical_learning_governance',
      'Canonical learning governance',
      'blocked',
      'canonical_learning',
      'Canonical learning needs governed promotion, source lineage, audit, rollback, and enterprise storage.',
      ['Canonical memory and source writes remain disabled.']
    ),
    item(
      'autonomous_learning_rollout',
      'Autonomous learning rollout governance',
      'blocked',
      'autonomous_learning',
      'Autonomous learning needs approved policy, monitoring, human override, and enterprise learning storage.',
      [blockedLearningPaths.find((path) => path.toLowerCase().includes('autonomous')) ?? 'Autonomous learning remains disabled.']
    )
  ];
}

function pilotLearningSummaryFromResult(result?: AgentTurnResult): AgentSessionPilotLearningSummary | null {
  if (result?.persistence?.pilotLearningSummary) return result.persistence.pilotLearningSummary;
  if (!result) return null;
  const signals = result.pilotLearningManifest.signals;
  const countByType = new Map<AgentSessionPilotLearningSummary['signalTypes'][number]['type'], number>();
  for (const signal of signals) {
    countByType.set(signal.type, (countByType.get(signal.type) ?? 0) + 1);
  }
  return {
    id: 'agent-session-pilot-learning-v1',
    sessionId: result.persistence?.sessionId ?? result.turnId,
    mode: 'prototype_reviewed_learning_signals',
    store: 'local_json',
    turnsWithLearning: 1,
    signals: {
      total: signals.length,
      capturedForReview: signals.filter((signal) => signal.status === 'captured_for_review').length,
      blocked: signals.filter((signal) => signal.status === 'blocked').length,
      notAvailable: signals.filter((signal) => signal.status === 'not_available').length,
      humanReviewRequired: signals.filter((signal) => signal.humanReviewRequired).length
    },
    signalTypes: Array.from(countByType.entries()).map(([type, count]) => ({ type, count })),
    latestSignals: signals.slice(0, 6),
    blockedLearningPaths: result.pilotLearningManifest.blockedLearningPaths,
    nextProofNeeds: result.pilotLearningManifest.nextProofNeeds,
    autonomousLearningEnabled: false,
    outcomeLearningEnabled: false,
    canonicalMemoryWriteEnabled: false,
    canonicalSourceWriteEnabled: false,
    treatmentOutcomeClaimsEnabled: false,
    learningPromotionProtocol: buildPilotLearningPromotionProtocol(
      signals,
      result.pilotLearningManifest.blockedLearningPaths,
      result.pilotLearningManifest.nextProofNeeds
    ),
    guardrails: result.pilotLearningManifest.guardrails,
    caveats: result.pilotLearningManifest.caveats
  };
}

function PilotLearningPanel({ result }: { result?: AgentTurnResult }) {
  const summary = pilotLearningSummaryFromResult(result);
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <BookOpen size={18} /> Pilot learning state appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <BookOpen size={18} />
        <div>
          <strong>{summary.mode.replaceAll('_', ' ')}</strong>
          <p>{summary.turnsWithLearning} learning turn{summary.turnsWithLearning === 1 ? '' : 's'} · {summary.signals.total} reviewed signals</p>
          <em>{summary.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className="medium">
          <Sparkles size={17} />
          <strong>Captured for review</strong>
          <p>{summary.signals.capturedForReview}</p>
          <em>{summary.signals.humanReviewRequired} signals require human review</em>
        </div>
        <div className={summary.signals.blocked > 0 ? 'high' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Blocked learning</strong>
          <p>{summary.signals.blocked}</p>
          <em>{summary.blockedLearningPaths.slice(0, 2).join(' · ') || 'No blocked paths captured.'}</em>
        </div>
        <div className="good">
          <BadgeCheck size={17} />
          <strong>Disabled writes</strong>
          <p>{summary.canonicalSourceWriteEnabled ? 'enabled' : 'disabled'}</p>
          <em>Outcome learning {summary.outcomeLearningEnabled ? 'enabled' : 'disabled'} · autonomous learning {summary.autonomousLearningEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-source-list">
        {summary.learningPromotionProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · before {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Learning write {step.enablesLearningWrite ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
      </div>
      <ul>
        <li>Top signal types: {summary.signalTypes.slice(0, 4).map((item) => `${item.type.replaceAll('_', ' ')} (${item.count})`).join(' · ') || 'none yet'}</li>
        <li>Next proof: {summary.nextProofNeeds.slice(0, 3).join(' · ') || 'No proof needs captured yet.'}</li>
        <li>Treatment outcome claims: {summary.treatmentOutcomeClaimsEnabled ? 'enabled' : 'disabled'}</li>
        <li>Canonical memory writes: {summary.canonicalMemoryWriteEnabled ? 'enabled' : 'disabled'}</li>
      </ul>
    </div>
  );
}

function ProactivityPanel({ result }: { result?: AgentTurnResult }) {
  const manifest = result?.proactivityManifest;
  const summary = result?.persistence?.proactivitySummary;
  if (!manifest) {
    return (
      <div className="dynamic-empty">
        <Bell size={18} /> Quiet proactivity state appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Bell size={18} />
        <div>
          <strong>{manifest.mode.replaceAll('_', ' ')}</strong>
          <p>{manifest.suggestions.length} suggestions · {manifest.heldNotices.length} held notices</p>
          <em>{manifest.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={manifest.suggestions.some((suggestion) => suggestion.priority === 'high') ? 'high' : 'medium'}>
          <Sparkles size={17} />
          <strong>Review suggestions</strong>
          <p>{manifest.suggestions.length} follow-up option{manifest.suggestions.length === 1 ? '' : 's'}</p>
          <em>{manifest.suggestions.filter((suggestion) => suggestion.humanReviewRequired).length} require human review</em>
        </div>
        <div className={manifest.heldNotices.length ? 'medium' : 'good'}>
          <ClipboardList size={17} />
          <strong>Held notices</strong>
          <p>{manifest.heldNotices.length} held</p>
          <em>{manifest.heldNotices[0]?.heldBecause ?? 'No notices are currently held.'}</em>
        </div>
        <div className="good">
          <ShieldAlert size={17} />
          <strong>Automation disabled</strong>
          <p>{manifest.canCreateReminders ? 'enabled' : 'disabled'}</p>
          <em>Reminders {manifest.canCreateReminders ? 'enabled' : 'disabled'} · sends {manifest.externalSendEnabled ? 'enabled' : 'disabled'} · scheduled notices {manifest.scheduledNotificationsEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {manifest.suggestions.slice(0, 4).map((suggestion) => (
          <div key={suggestion.id}>
            <strong>{suggestion.label}</strong>
            <span>{suggestion.type.replaceAll('_', ' ')} · {suggestion.priority} · {suggestion.suggestedTiming.replaceAll('_', ' ')}</span>
            <p>{suggestion.reason}</p>
            <em>{suggestion.relatedGapIds.length} gaps · {suggestion.relatedGateIds.length} gates · next skills: {suggestion.allowedNextSkillIds.slice(0, 3).join(', ') || 'review first'}</em>
          </div>
        ))}
      </div>
      {summary && (
        <div className="dynamic-source-list">
          {summary.proactivityPromotionProtocol.map((step) => (
            <div key={step.id}>
              <strong>{step.label}</strong>
              <span>{step.status.replaceAll('_', ' ')} · before {step.requiredBefore.replaceAll('_', ' ')}</span>
              <p>{step.proof}</p>
              <em>{step.blockers[0] ?? 'No blocker captured.'} Autonomous action {step.enablesAutonomousAction ? 'enabled' : 'disabled'}.</em>
            </div>
          ))}
        </div>
      )}
      <ul>
        <li>Autonomous actions: {manifest.autonomousActionsEnabled ? 'enabled' : 'disabled'}</li>
        <li>No overlapping runs: {manifest.noOverlappingRuns ? 'enforced' : 'not enforced'}</li>
        <li>Session continuity: {summary?.turnsWithProactivity ?? 0} proactivity turns · {summary?.suggestions.total ?? manifest.suggestions.length} suggestions · reminders {summary?.canCreateReminders ? 'enabled' : 'disabled'}</li>
        <li>{manifest.caveats[1]}</li>
      </ul>
    </div>
  );
}

function VoiceReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const readiness = result?.voiceOrchestrationReadinessManifest;
  const adapters = result?.providerAdapterManifest;
  const runtime = result?.voiceRuntimeManifest;
  const contract = result?.voiceSkillViewContractManifest;
  const presence = result?.conversationPresenceManifest;
  const interruption = result?.interruptionRecoveryManifest;
  const runtimeSummary = result?.persistence?.voiceRuntimeSummary;
  const voiceSummary = result?.persistence?.voiceReadinessSummary;
  if (!readiness || !adapters || !runtime || !contract || !presence || !interruption) {
    return (
      <div className="dynamic-empty">
        <Mic size={18} /> Voice readiness state appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Mic size={18} />
        <div>
          <strong>{readiness.mode.replaceAll('_', ' ')}</strong>
          <p>{readiness.readyRequirementIds.length} ready · {readiness.prototypeRequirementIds.length} prototype · {readiness.blockedRequirementIds.length} blocked</p>
          <em>{readiness.nextPromotionStep}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className="good">
          <BadgeCheck size={17} />
          <strong>Governed push-to-talk</strong>
          <p>{runtime.defaultMode.replaceAll('_', ' ')}</p>
          <em>{runtime.runtimeEventSource} · consent {runtime.consentBoundary.replaceAll('_', ' ')} · typed fallback {runtime.typedFallbackAvailable ? 'ready' : 'missing'}</em>
        </div>
        <div className={readiness.blockedRequirementIds.length ? 'high' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Full voice blocked</strong>
          <p>{readiness.fullVoiceEnabled ? 'enabled' : 'disabled'}</p>
          <em>Realtime {readiness.realtimeVoiceEnabled ? 'enabled' : 'gated'} · continuous {readiness.continuousVoiceEnabled ? 'enabled' : 'gated'} · TTS {readiness.ttsEnabled ? 'enabled' : 'gated'}</em>
        </div>
        <div className={interruption.serverSideCancelSupported ? 'good' : 'medium'}>
          <ShieldAlert size={17} />
          <strong>Interruption</strong>
          <p>{interruption.mode.replaceAll('_', ' ')}</p>
          <em>Client abort {interruption.clientStreamAbortSupported ? 'ready' : 'missing'} · server cancel {interruption.serverSideCancelSupported ? 'ready' : 'blocked'} · overlap {interruption.noOverlappingRuns ? 'blocked' : 'allowed'}</em>
        </div>
        <div className={contract.activeIncompatibleViewIds.length ? 'high' : 'good'}>
          <Route size={17} />
          <strong>Skill/view contract</strong>
          <p>{contract.activeSkillVoiceCompatible ? 'compatible' : 'review needed'}</p>
          <em>{contract.activeVoiceCompatibleViewIds.length} voice views · {contract.activeIncompatibleViewIds.length} incompatible · arbitrary UI {contract.arbitraryViewGenerationEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {voiceSummary?.voiceActivationProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Full voice {step.enablesFullVoice ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
        <div>
          <strong>{contract.activeSkillId}</strong>
          <span>{contract.mode.replaceAll('_', ' ')} · push-to-talk {contract.pushToTalkContractReady ? 'ready' : 'check needed'}</span>
          <p>{contract.caveats[0]}</p>
          <em>blocked modes: {contract.blockedModeIds.join(', ') || 'none'} · gated modes: {contract.gatedModeIds.join(', ') || 'none'}</em>
        </div>
        <div>
          <strong>Approved voice canvas</strong>
          <span>{contract.activeVoiceCompatibleViewIds.join(', ') || 'No active voice-canvas views.'}</span>
          <p>{contract.guardrails[0]}</p>
          <em>{contract.activeIncompatibleViewIds.join(', ') || 'No incompatible active views.'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {adapters.adapters.map((adapter) => (
          <div key={adapter.id}>
            <strong>{adapter.capability.replaceAll('_', ' ')}</strong>
            <span>{adapter.status.replaceAll('_', ' ')} · {adapter.runtimeBoundary} · {adapter.providerBinding.replaceAll('_', ' ')}</span>
            <p>{adapter.endpoint ?? 'No endpoint connected.'}</p>
            <em>Runtime parity {adapter.sharesAgentRuntime ? 'yes' : 'no'} · evidence/gates {adapter.evidenceAndGateParity ? 'yes' : 'no'} · Agent Lab {adapter.enabledInAgentLab ? 'enabled' : 'gated'}</em>
          </div>
        ))}
      </div>
      <ul>
        <li>Presence: {presence.mode.replaceAll('_', ' ')} · continuous listening {presence.continuousListeningEnabled ? 'enabled' : 'disabled'} · autonomous speaking {presence.autonomousSpeakingEnabled ? 'enabled' : 'disabled'}</li>
        <li>Session runtime: {runtimeSummary?.turnsWithVoiceRuntime ?? 0} turns · governed {runtimeSummary?.usesGovernedRuntimeConsistent ? 'consistent' : 'waiting'} · evidence/gates {runtimeSummary?.evidenceAndGateParityConsistent ? 'consistent' : 'waiting'} · Realtime {runtimeSummary?.realtimeVoiceEnabled ? 'enabled' : 'gated'}</li>
        <li>Blocked requirements: {readiness.blockedRequirementIds.map((id) => id.replaceAll('_', ' ')).join(' · ') || 'none'}</li>
        <li>{readiness.caveats[0]}</li>
      </ul>
    </div>
  );
}

function ProviderAdapterPanel({ result }: { result?: AgentTurnResult }) {
  const manifest = result?.providerAdapterManifest;
  const summary = result?.persistence?.providerAdapterSummary;
  const runtime = result?.voiceRuntimeManifest;
  const contract = result?.voiceSkillViewContractManifest;
  if (!manifest) {
    return (
      <div className="dynamic-empty">
        <Network size={18} /> Provider adapter state appears after a governed turn is available.
      </div>
    );
  }
  const prototypeAdapters = manifest.adapters.filter((adapter) => adapter.status === 'prototype_client_only');
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Network size={18} />
        <div>
          <strong>{manifest.mode.replaceAll('_', ' ')}</strong>
          <p>{manifest.readyAdapterIds.length} ready · {prototypeAdapters.length} prototype · {manifest.gatedAdapterIds.length} gated · {manifest.disabledAdapterIds.length} disabled</p>
          <em>Core {manifest.coreRuntimeAdapterId} · stream {manifest.streamAdapterId} · voice input {manifest.activeVoiceInputAdapterId}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary?.textReasoningReady ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Text runtime</strong>
          <p>{summary?.textReasoningReady ? 'ready' : 'waiting'}</p>
          <em>{manifest.coreRuntimeAdapterId} · governed local reasoning path</em>
        </div>
        <div className={summary?.sseStreamingReady ? 'good' : 'medium'}>
          <Route size={17} />
          <strong>SSE stream</strong>
          <p>{summary?.sseStreamingReady ? 'ready' : 'waiting'}</p>
          <em>{manifest.streamAdapterId} · {runtime?.runtimeEventSource ?? 'runtime event source pending'}</em>
        </div>
        <div className={summary?.browserSttPrototypeReady ? 'medium' : 'high'}>
          <Mic size={17} />
          <strong>Browser STT</strong>
          <p>{summary?.browserSttPrototypeReady ? 'prototype only' : 'not ready'}</p>
          <em>Consent {runtime?.consentBoundary.replaceAll('_', ' ') ?? 'pending'} · typed fallback {runtime?.typedFallbackAvailable ? 'ready' : 'waiting'}</em>
        </div>
        <div className={!summary?.realtimeRuntimeConnected && !summary?.ttsEnabled ? 'high' : 'medium'}>
          <ShieldAlert size={17} />
          <strong>Realtime/TTS</strong>
          <p>{summary?.realtimeRuntimeConnected ? 'connected' : 'gated'} · TTS {summary?.ttsEnabled ? 'enabled' : 'disabled'}</p>
          <em>Provider bypass {summary?.providerBypassAllowed ? 'allowed' : 'blocked'} · continuous voice {summary?.continuousVoiceEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {manifest.adapters.map((adapter) => (
          <div key={adapter.id}>
            <strong>{adapter.id}</strong>
            <span>{adapter.capability.replaceAll('_', ' ')} · {adapter.status.replaceAll('_', ' ')} · {adapter.runtimeBoundary}</span>
            <p>{adapter.endpoint ?? 'No endpoint connected.'}</p>
            <em>{adapter.providerBinding.replaceAll('_', ' ')} · runtime parity {adapter.sharesAgentRuntime ? 'yes' : 'no'} · evidence/gates {adapter.evidenceAndGateParity ? 'yes' : 'no'}</em>
          </div>
        ))}
      </div>
      <ul>
        <li>Session: {summary?.turnsWithProviderAdapters ?? 0} provider turns · ready {summary?.readyAdapterIds.join(', ') || 'none'} · prototype {summary?.prototypeAdapterIds.join(', ') || 'none'}.</li>
        <li>Gated adapters: {summary?.gatedAdapterIds.join(', ') || 'none'} · disabled adapters: {summary?.disabledAdapterIds.join(', ') || 'none'}.</li>
        <li>Policy review required for: {manifest.requiresPolicyReviewFor.map((item) => item.replaceAll('_', ' ')).join(' · ') || 'none'}.</li>
        <li>Voice contract: push-to-talk {contract?.pushToTalkContractReady ? 'ready' : 'waiting'} · Realtime {contract?.realtimeVoiceEnabled ? 'enabled' : 'blocked'} · TTS {contract?.ttsEnabled ? 'enabled' : 'blocked'}.</li>
        <li>{manifest.guardrails[0]}</li>
      </ul>
    </div>
  );
}

function PersistenceReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const manifest = result?.persistenceReadinessManifest;
  const review = result?.persistence?.reviewWorkflowSummary;
  const context = result?.workingContextManifest;
  const governanceSummary = result?.persistence?.persistenceGovernanceSummary;
  if (!manifest) {
    return (
      <div className="dynamic-empty">
        <Database size={18} /> Persistence readiness state appears after a governed turn is available.
      </div>
    );
  }
  const blocked = manifest.requirements.filter((requirement) => requirement.status === 'blocked');
  const ready = manifest.requirements.filter((requirement) => requirement.status === 'ready');
  const prototype = manifest.requirements.filter((requirement) => requirement.status === 'prototype_ready');
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Database size={18} />
        <div>
          <strong>{manifest.currentStorageMode.replaceAll('_', ' ')}</strong>
          <p>{ready.length} ready · {prototype.length} prototype · {blocked.length} blocked</p>
          <em>{manifest.nextPromotionStep}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={manifest.browserLocalLedgerEnabled && manifest.localJsonPersistenceEnabled ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Prototype continuity</strong>
          <p>{manifest.localJsonPersistenceEnabled ? 'local JSON ready' : 'local JSON missing'}</p>
          <em>Browser ledger {manifest.browserLocalLedgerEnabled ? 'ready' : 'missing'} · record types {manifest.persistedRecordTypes.length}</em>
        </div>
        <div className={manifest.reviewActionsEnabled && manifest.acceptedMemoryLoadsIntoContext ? 'good' : 'high'}>
          <ClipboardList size={17} />
          <strong>Reviewed memory</strong>
          <p>{manifest.acceptedMemoryLoadsIntoContext ? 'loads after review' : 'blocked'}</p>
          <em>Pending review {review?.pending.total ?? result?.confirmationGates.length ?? 0} · accepted memory {context?.acceptedMemory.length ?? result?.acceptedMemory.length ?? 0}</em>
        </div>
        <div className={!manifest.enterprisePersistenceEnabled ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Enterprise promotion</strong>
          <p>{manifest.enterprisePersistenceEnabled ? 'enabled' : 'blocked'}</p>
          <em>Canonical writes {manifest.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'} · source auto-consumption {manifest.sourceRuntimeAutoConsumptionEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {manifest.requirements.map((requirement) => (
          <div key={requirement.id}>
            <strong>{requirement.label}</strong>
            <span>{requirement.status.replaceAll('_', ' ')} · {requirement.owner}</span>
            <p>{requirement.nextAction}</p>
            <em>{requirement.requiredFor.map((item) => item.replaceAll('_', ' ')).join(' · ')}{requirement.blockers.length ? ` · blocker: ${requirement.blockers[0]}` : ''}</em>
          </div>
        ))}
      </div>
      {governanceSummary && (
        <div className="dynamic-source-list">
          {governanceSummary.enterprisePersistencePromotionProtocol.map((step) => (
            <div key={step.id}>
              <strong>{step.label}</strong>
              <span>{step.status.replaceAll('_', ' ')} · before {step.requiredBefore.replaceAll('_', ' ')}</span>
              <p>{step.proof}</p>
              <em>{step.blockers[0] ?? 'No blocker captured.'} Enterprise persistence {step.enablesEnterprisePersistence ? 'enabled' : 'disabled'}.</em>
            </div>
          ))}
        </div>
      )}
      <ul>
        <li>Enterprise persistence: {manifest.enterprisePersistenceEnabled ? 'enabled' : 'disabled'}</li>
        <li>Canonical source writes: {manifest.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'} · source runtime auto-consumption: {manifest.sourceRuntimeAutoConsumptionEnabled ? 'enabled' : 'disabled'}</li>
        <li>Session governance: {governanceSummary?.turnsWithPersistenceReadiness ?? 0} readiness turns · {governanceSummary?.blockedRequirementIds.length ?? manifest.blockedRequirementIds.length} blockers · official approval {governanceSummary?.officialApprovalEnabled ? 'enabled' : 'blocked'}</li>
        <li>{manifest.caveats[0]}</li>
      </ul>
    </div>
  );
}

function TreatmentOutcomeReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const manifest = result?.treatmentOutcomeReadinessManifest;
  const learningSummary = result?.persistence?.pilotLearningSummary;
  const outcomeSummary = result?.persistence?.treatmentOutcomeReadinessSummary;
  if (!manifest) {
    return (
      <div className="dynamic-empty">
        <Pill size={18} /> Treatment outcome readiness state appears after a governed turn is available.
      </div>
    );
  }
  const blocked = manifest.requirements.filter((requirement) => requirement.status === 'blocked');
  const ready = manifest.requirements.filter((requirement) => requirement.status === 'ready');
  const prototype = manifest.requirements.filter((requirement) => requirement.status === 'prototype_ready');
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Pill size={18} />
        <div>
          <strong>{manifest.mode.replaceAll('_', ' ')}</strong>
          <p>{ready.length} ready · {prototype.length} prototype · {blocked.length} blocked</p>
          <em>{manifest.nextPromotionStep}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={manifest.relatedTreatmentIds.length ? 'medium' : 'high'}>
          <ClipboardList size={17} />
          <strong>Treatment paths</strong>
          <p>{manifest.relatedTreatmentIds.length} visible</p>
          <em>Paths to test only; not outcome-validated instructions.</em>
        </div>
        <div className={manifest.relatedFollowUpSignals.length ? 'medium' : 'high'}>
          <LineChart size={17} />
          <strong>Follow-up signals</strong>
          <p>{manifest.relatedFollowUpSignals.length} named</p>
          <em>{manifest.relatedFollowUpSignals.slice(0, 2).join(' · ') || 'No follow-up signals linked yet.'}</em>
        </div>
        <div className={manifest.blockedRequirementIds.length ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Outcome learning</strong>
          <p>{manifest.outcomeLearningEnabled ? 'enabled' : 'disabled'}</p>
          <em>Efficacy claims {manifest.treatmentOutcomeClaimsEnabled ? 'enabled' : 'disabled'} · canonical learning {manifest.canonicalLearningStoreEnabled ? 'enabled' : 'disabled'}</em>
        </div>
        <div className="medium">
          <ClipboardList size={17} />
          <strong>Draft record template</strong>
          <p><a href="/templates/treatment-outcome-record-template.json" download>Download JSON</a></p>
          <em>Draft handoff only; accepted outcome-record storage remains disabled.</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {manifest.requirements.map((requirement) => (
          <div key={requirement.id}>
            <strong>{requirement.label}</strong>
            <span>{requirement.status.replaceAll('_', ' ')} · {requirement.requiredFor.replaceAll('_', ' ')}</span>
            <p>{requirement.blockers[0] ?? 'No blocker currently listed.'}</p>
            <em>Requires: {requirement.requiredEvidence.slice(0, 4).join(' · ')}{requirement.requiredEvidence.length > 4 ? ' · ...' : ''}</em>
          </div>
        ))}
      </div>
      {outcomeSummary && (
        <div className="dynamic-source-list">
          {outcomeSummary.outcomeProofProtocol.map((item) => (
            <div key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.status.replaceAll('_', ' ')} · {item.requiredBefore.replaceAll('_', ' ')}</span>
              <p>{item.proof}</p>
              <em>{item.blockers[0] ?? 'No blocker captured.'}</em>
            </div>
          ))}
        </div>
      )}
      <ul>
        <li>Learning signals linked: {manifest.relatedLearningSignalIds.length} · session signals captured: {learningSummary?.signals.total ?? result?.pilotLearningManifest.signals.length ?? 0}</li>
        <li>Session outcome blockers: {outcomeSummary?.blockedRequirementIds.length ?? manifest.blockedRequirementIds.length} · outcome-readiness turns: {outcomeSummary?.turnsWithTreatmentOutcomeReadiness ?? 1}</li>
        <li>Accepted outcome-record store: {manifest.acceptedOutcomeRecordStoreEnabled ? 'enabled' : 'disabled'} · canonical learning store: {manifest.canonicalLearningStoreEnabled ? 'enabled' : 'disabled'}</li>
        <li>{manifest.caveats[0]}</li>
      </ul>
    </div>
  );
}

function ArtifactReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const artifacts = result?.experiencePlan?.artifacts ?? [];
  const artifactSummary = result?.persistence?.artifactReadinessSummary;
  const exportCapability = result?.capabilities.find((capability) => capability.id === 'artifact_export');
  const circulationCapability = result?.capabilities.find((capability) => capability.id === 'artifact_circulation');
  const blockedExportCount = artifacts.filter((artifact) => artifact.governance.readiness.exportBlocked).length;
  const reviewRequiredCount = artifacts.filter((artifact) => artifact.humanReviewRequired).length;
  const missingSourceViewCount = artifacts.filter((artifact) => artifact.governance.readiness.blockers.some((blocker) => blocker.toLowerCase().includes('source views'))).length;
  if (!result?.experiencePlan) {
    return (
      <div className="dynamic-empty">
        <ClipboardList size={18} /> Artifact readiness appears after a governed ExperiencePlan is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ClipboardList size={18} />
        <div>
          <strong>{result.experiencePlan.title}</strong>
          <p>{artifacts.length} artifacts · {reviewRequiredCount} review required · {blockedExportCount} export blocked</p>
          <em>{artifactReadinessRequirements.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={reviewRequiredCount ? 'medium' : 'good'}>
          <BadgeCheck size={17} />
          <strong>Human review</strong>
          <p>{reviewRequiredCount} required</p>
          <em>{artifacts.filter((artifact) => artifact.governance.circulationStatus === 'review_required').length} waiting for prototype review</em>
        </div>
        <div className={blockedExportCount ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Export gate</strong>
          <p>{exportCapability?.enabled ? 'enabled' : 'disabled'}</p>
          <em>Circulation {circulationCapability?.enabled ? 'enabled' : 'disabled'} · export blocked on {blockedExportCount}</em>
        </div>
        <div className={missingSourceViewCount ? 'medium' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Source-view coverage</strong>
          <p>{missingSourceViewCount} gaps</p>
          <em>{result.experiencePlan.viewManifest.map((view) => view.renderedViewId).slice(0, 4).join(' · ')}</em>
        </div>
      </div>
      {artifactSummary && (
        <div className="dynamic-readiness-handoff">
          {artifactSummary.artifactCirculationProtocol.map((step) => (
            <div key={step.id}>
              <strong>{step.label}</strong>
              <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
              <p>{step.proof}</p>
              <em>{step.blockers[0] ?? 'No blocker captured.'} Export {step.enablesExport ? 'enabled' : 'disabled'}.</em>
            </div>
          ))}
        </div>
      )}
      <div className="dynamic-readiness-handoff">
        {artifacts.map((artifact) => {
          const readiness = artifact.governance.readiness;
          return (
            <div key={artifact.id}>
              <strong>{artifact.label}</strong>
              <span>{artifact.status.replaceAll('_', ' ')} · {readiness.currentStatus.replaceAll('_', ' ')} · {readiness.reviewerRole}</span>
              <p>{readiness.nextAction}</p>
              <em>Evidence: {readiness.requiredEvidence.slice(0, 3).join(' · ')} · gate: {readiness.exportGate.replaceAll('_', ' ')}</em>
              <small>{readiness.blockers[0] ?? artifact.governance.caveats[0]}</small>
            </div>
          );
        })}
      </div>
      <ul>
        <li>Session artifacts: {artifactSummary?.artifacts.total ?? artifacts.length} · session export blocked: {artifactSummary?.artifacts.exportBlocked ?? blockedExportCount}</li>
        <li>Language approvals: {Array.from(new Set(artifacts.flatMap((artifact) => artifact.governance.readiness.requiredLanguageApprovals))).slice(0, 5).join(' · ') || 'No artifact language approvals listed.'}</li>
        <li>Required source views: {Array.from(new Set(artifacts.flatMap((artifact) => artifact.governance.readiness.requiredSourceViews))).slice(0, 6).join(' · ') || 'No required source views listed.'}</li>
        <li>{artifactReadinessRequirements.guardrails[0]}</li>
      </ul>
    </div>
  );
}

function SourcePromotionReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const promotionContext = result?.sourcePromotionContext;
  const claimContext = result?.sourceClaimContext;
  const workingContext = result?.workingContextManifest;
  const sourceSummary = result?.persistence?.sourceGovernanceSummary;
  const sourceGates = result?.confirmationGates.filter((gate) => gate.action === 'promote_source_claim') ?? [];
  const promotionCapability = result?.capabilities.find((capability) => capability.id === 'source_claim_promotion');
  const writeCapability = result?.capabilities.find((capability) => capability.id === 'source_data_write');
  const qualityCheck = result?.runtimeQualityChecks.find((check) => check.id === 'source-context-non-canonical');
  const reviewedClaims = claimContext?.records.filter((record) => record.status === 'reviewed_candidate') ?? [];
  const unreviewedClaims = claimContext?.records.filter((record) => record.status === 'extracted_unreviewed') ?? [];
  const sourceCandidates = [
    ...(promotionContext?.records.map((record) => ({
      id: record.id,
      title: record.sourceLabel,
      kind: record.kind.replaceAll('_', ' '),
      status: record.status.replaceAll('_', ' '),
      detail: record.validationSummary,
      meta: `${record.sourceOwner ?? 'Unknown owner'} · ${record.sourceDate ?? 'Unknown date'}`
    })) ?? []),
    ...(claimContext?.records.map((record) => ({
      id: record.id,
      title: record.claim.length > 96 ? `${record.claim.slice(0, 93)}...` : record.claim,
      kind: record.claimKind.replaceAll('_', ' '),
      status: record.status.replaceAll('_', ' '),
      detail: record.sourceLabel,
      meta: `${record.sourceOwner ?? 'Unknown owner'} · ${record.sourceDate ?? 'Unknown date'}`
    })) ?? [])
  ];
  if (!result || !promotionContext || !claimContext || !workingContext) {
    return (
      <div className="dynamic-empty">
        <Database size={18} /> Source promotion readiness appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Database size={18} />
        <div>
          <strong>Source candidates stay non-canonical</strong>
          <p>{promotionContext.records.length} promoted-local records · {claimContext.records.length} extracted claims · {sourceGates.length} source gates</p>
          <em>{promotionContext.caveats[0]}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={!promotionContext.canonicalWriteEnabled && !claimContext.canonicalFactEnabled ? 'good' : 'high'}>
          <ShieldAlert size={17} />
          <strong>Canonical writes</strong>
          <p>{promotionContext.canonicalWriteEnabled || claimContext.canonicalFactEnabled ? 'enabled' : 'disabled'}</p>
          <em>Source writes {writeCapability?.enabled ? 'enabled' : 'disabled'} · claim promotion {promotionCapability?.enabled ? 'enabled' : 'disabled'}</em>
        </div>
        <div className={!promotionContext.runtimeAutoConsumption && !claimContext.runtimeAutoConsumption ? 'good' : 'high'}>
          <BadgeCheck size={17} />
          <strong>Runtime consumption</strong>
          <p>{promotionContext.runtimeAutoConsumption || claimContext.runtimeAutoConsumption ? 'enabled' : 'disabled'}</p>
          <em>{qualityCheck?.status ?? 'not checked'} · {qualityCheck?.detail ?? 'Source context quality check appears after runtime evaluation.'}</em>
        </div>
        <div className={sourceGates.some((gate) => gate.status === 'blocked') ? 'high' : sourceGates.length ? 'medium' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Review gates</strong>
          <p>{sourceGates.length} gates</p>
          <em>{sourceGates.filter((gate) => gate.status === 'required').length} required · {sourceGates.filter((gate) => gate.status === 'blocked').length} blocked · reviewed claims {reviewedClaims.length}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {sourceSummary?.sourceClaimPromotionProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Canonical fact {step.enablesCanonicalFact ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
        {sourceCandidates.slice(0, 8).map((candidate) => (
          <div key={candidate.id}>
            <strong>{candidate.title}</strong>
            <span>{candidate.kind} · {candidate.status}</span>
            <p>{candidate.detail}</p>
            <em>{candidate.meta}</em>
          </div>
        ))}
        {sourceCandidates.length === 0 && (
          <div>
            <strong>No local source candidates loaded</strong>
            <span>review context only</span>
            <p>Brand Strategic Context, Momentum source packets, or source-claim extraction can create reviewed-local candidates, but none are loaded for this turn.</p>
            <em>Canonical promotion still requires source-owner and enterprise governance.</em>
          </div>
        )}
      </div>
      <ul>
        <li>Loaded context: {workingContext.loadedContextTypes.map((type) => type.replaceAll('_', ' ')).join(' · ')}</li>
        <li>Source promotion IDs: {workingContext.sourcePromotionCandidateIds.slice(0, 4).join(' · ') || 'none loaded'} · source claim IDs: {workingContext.sourceClaimCandidateIds.slice(0, 4).join(' · ') || 'none loaded'}</li>
        <li>Unreviewed claims: {unreviewedClaims.length} · reviewed candidates: {reviewedClaims.length} · rejected claims stay excluded from promotion.</li>
        <li>{claimContext.caveats[0]}</li>
      </ul>
    </div>
  );
}

function SourceRuntimeIngestionPanel({ result }: { result?: AgentTurnResult }) {
  const summary: AgentSessionSourceRuntimeIngestionSummary | undefined = result?.persistence?.sourceRuntimeIngestionSummary;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <Database size={18} /> Source runtime ingestion appears after a governed source turn is persisted.
      </div>
    );
  }

  const statusClass = summary.readyToWireDefaultRuntimeSource
    ? 'good'
    : summary.readyForGovernanceReview
      ? 'medium'
      : 'high';

  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <div>
          <strong>Momentum files {summary.sourceOwnerFileCoverageStatus.replaceAll('_', ' ')}</strong>
          <p>{summary.loadedFileKinds.length}/{summary.requiredFileKinds.length} required file kinds loaded · {summary.candidateFileCount} candidate files</p>
          <em>{summary.latestRuntimeFileDropStatus.replaceAll('_', ' ')} · audit {summary.latestAuditMode.replaceAll('_', ' ')}</em>
        </div>
        <div>
          <strong>Strategy files {summary.strategicContextSourceOwnerFileCoverageStatus.replaceAll('_', ' ')}</strong>
          <p>{summary.strategicContextLoadedFileKinds.length}/{summary.strategicContextRequiredFileKinds.length} required file kinds loaded · {summary.strategicContextCandidateFileCount} candidate files</p>
          <em>{summary.strategicContextLatestRuntimeFileDropStatus.replaceAll('_', ' ')} · audit {summary.strategicContextLatestAuditMode.replaceAll('_', ' ')}</em>
        </div>
        <div>
          <strong>Default runtime source path</strong>
          <p>{summary.readyToWireDefaultRuntimeSource ? 'ready to wire' : 'blocked'}</p>
          <em>canonical use {summary.canonicalUseEnabled ? 'enabled' : 'disabled'} · runtime consumption {summary.defaultRuntimeConsumptionEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        <div className={statusClass}>
          <strong>Governance review</strong>
          <p>{summary.readyForGovernanceReview ? 'file coverage ready' : 'waiting on files'}</p>
          <em>source directory {summary.sourceDirectorySeen ? 'observed' : 'not observed'} · executive canonical use {summary.executiveCanonicalUseReady ? 'ready' : 'blocked'}</em>
        </div>
        <div className={summary.missingFileKinds.length ? 'high' : 'medium'}>
          <strong>Required Momentum files</strong>
          <p>{summary.missingFileKinds.length} missing</p>
          <em>{summary.missingFileKinds.map((kind) => kind.replaceAll('_', ' ')).join(' · ') || 'All file kinds observed for governance review.'}</em>
        </div>
        <div className={summary.strategicContextMissingFileKinds.length ? 'high' : 'medium'}>
          <strong>Required strategy files</strong>
          <p>{summary.strategicContextMissingFileKinds.length} missing</p>
          <em>{summary.strategicContextMissingFileKinds.map((kind) => kind.replaceAll('_', ' ')).join(' · ') || 'All Brand Strategic Context file kinds observed for governance review.'}</em>
        </div>
        <div className={summary.runtimeSourceAutoConsumptionEnabled || summary.sourceDataWriteEnabled ? 'high' : 'good'}>
          <strong>Runtime consumption</strong>
          <p>{summary.runtimeSourceAutoConsumptionEnabled ? 'enabled' : 'disabled'}</p>
          <em>file-drop consumption {summary.runtimeFileDropConsumptionEnabled ? 'enabled' : 'disabled'} · source writes {summary.sourceDataWriteEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-source-list">
        {summary.defaultRuntimeSourcePromotionProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Runtime consumption {step.enablesRuntimeConsumption ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
        {summary.fileKindReadiness.map((file) => (
          <div key={`momentum-${file.fileKind}`}>
            <strong>Momentum {file.fileKind.replaceAll('_', ' ')}</strong>
            <span>{file.status.replaceAll('_', ' ')}</span>
            <p>{file.status === 'loaded_for_review' ? 'Observed for source-owner governance review.' : 'Missing from the approved source-owner runtime file drop.'}</p>
            <em>{file.status === 'loaded_for_review' ? 'Still not canonical runtime evidence.' : 'Cannot close the ingestion gate until present and reviewed.'}</em>
          </div>
        ))}
        {summary.strategicContextFileKindReadiness.map((file) => (
          <div key={`strategy-${file.fileKind}`}>
            <strong>Strategy {file.fileKind.replaceAll('_', ' ')}</strong>
            <span>{file.status.replaceAll('_', ' ')}</span>
            <p>{file.status === 'loaded_for_review' ? 'Observed for Brand Strategic Context governance review.' : 'Missing from the approved Brand Strategic Context runtime file drop.'}</p>
            <em>{file.status === 'loaded_for_review' ? 'Still not canonical brand strategy or answer evidence.' : 'Cannot close the strategy ingestion gate until present and reviewed.'}</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        <li>Latest Momentum source path: {summary.latestMomentumSourcePath.replaceAll('_', ' ')} · readiness {summary.latestMomentumSourceReadinessStatus.replaceAll('_', ' ')}</li>
        <li>Brand Strategic Context file drop: {summary.strategicContextLatestRuntimeFileDropStatus.replaceAll('_', ' ')} · governance review {summary.strategicContextReadyForGovernanceReview ? 'ready' : 'blocked'}</li>
        <li>Next step: {summary.nextIngestionStep}</li>
        <li>Blocker: {summary.governanceBlockers[0] ?? 'No blocker captured.'}</li>
        <li>{summary.guardrails[1]}</li>
      </ul>
    </div>
  );
}

function ExperienceArchitecturePanel({ result }: { result?: AgentTurnResult }) {
  const plan = result?.experiencePlan;
  const audiences = Array.from(new Set(experienceTemplateRegistry.map((template) => template.audience)));
  const objectives = Array.from(new Set(experienceTemplateRegistry.map((template) => template.objective)));
  const layouts = Array.from(new Set(experienceTemplateRegistry.map((template) => template.layout)));
  const viewFamilies = Array.from(new Set(dynamicViewRegistry.map((view) => view.family)));
  const planViewIds = plan?.viewManifest.map((view) => view.renderedViewId) ?? [];
  const unknownViews = plan?.viewManifest.filter((view) => view.dataStatus === 'unknown_view') ?? [];
  const fallbackViews = plan?.viewManifest.filter((view) => view.dataStatus === 'fallback') ?? [];
  const canvasSummary = result?.persistence?.canvasContinuitySummary;
  const gatingSummary = [
    `Dynamic UI generation ${result?.canvasStateManifest.dynamicUiGenerationEnabled ? 'enabled' : 'disabled'}`,
    `Arbitrary view IDs ${result?.canvasStateManifest.arbitraryViewIdsAllowed ? 'allowed' : 'blocked'}`,
    `Human review ${plan?.humanReviewRequired ? 'required' : 'not required for this inspection'}`,
    `Fallback views ${fallbackViews.length}`,
    `Unknown views ${unknownViews.length}`
  ];

  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <div>
          <strong>Governed workspace engine</strong>
          <p>{experienceTemplateRegistry.length} templates · {agentSkillRegistry.length} skills · {dynamicViewRegistry.length} views</p>
          <em>{audiences.length} audiences · {objectives.length} objectives · {layouts.length} layouts · {viewFamilies.length} view families</em>
        </div>
        <div>
          <strong>Active plan</strong>
          <p>{plan?.templateId ?? 'No plan loaded'} · {plan?.layout.replaceAll('_', ' ') ?? 'fallback stack'}</p>
          <em>{plan?.zones.length ?? 0} zones · {plan?.artifacts.length ?? 0} artifacts · {plan?.evidenceNeeds.length ?? 0} evidence needs</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        <div className={result?.canvasStateManifest.dynamicUiGenerationEnabled ? 'high' : 'good'}>
          <strong>Arbitrary UI</strong>
          <p>{result?.canvasStateManifest.dynamicUiGenerationEnabled ? 'enabled' : 'disabled'}</p>
          <em>ExperiencePlans compose approved views; they do not invent charts or metrics.</em>
        </div>
        <div className={unknownViews.length ? 'high' : 'good'}>
          <strong>View registry fit</strong>
          <p>{unknownViews.length ? `${unknownViews.length} unknown` : 'all approved'}</p>
          <em>{planViewIds.slice(0, 5).join(' · ') || 'No rendered views yet'}</em>
        </div>
        <div className={fallbackViews.length ? 'medium' : 'good'}>
          <strong>Fallback state</strong>
          <p>{fallbackViews.length} fallback views</p>
          <em>{fallbackViews[0]?.fallbackReason ?? 'No fallback views required for the active plan.'}</em>
        </div>
      </div>
      <div className="dynamic-source-list">
        {experienceTemplateRegistry.slice(0, 8).map((template) => (
          <div key={template.id}>
            <strong>{template.name}</strong>
            <span>{template.audience.replaceAll('_', ' ')} · {template.objective} · {template.layout.replaceAll('_', ' ')}</span>
            <p>{template.zones.map((zone) => zone.viewId).slice(0, 4).join(' · ')}</p>
            <em>{template.guardrails[0]}</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        {gatingSummary.map((item) => <li key={item}>{item}</li>)}
        <li>Session canvas continuity: {canvasSummary?.turnsWithCanvasState ?? 0} turns · {canvasSummary?.renderedViewIds.length ?? 0} persisted rendered views</li>
        <li>Supported audiences: {audiences.map((audience) => audience.replaceAll('_', ' ')).join(' · ')}</li>
        <li>Supported objectives: {objectives.join(' · ')}</li>
      </ul>
    </div>
  );
}

function CanvasContinuityPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.canvasContinuitySummary as AgentSessionCanvasContinuitySummary | undefined;
  if (!summary) return <div className="dynamic-empty"><Route size={18} /> No canvas continuity summary has been persisted for this session yet.</div>;

  const latest = summary.latestCanvas;
  const disabledCapabilities: Array<[string, boolean]> = [
    ['Arbitrary UI generation', summary.dynamicUiGenerationEnabled],
    ['Arbitrary view IDs', summary.arbitraryViewIdsAllowed],
    ['Server-side provider cancel', summary.serverSideCancelSupported],
    ['Continuous listening', summary.continuousListeningEnabled],
    ['Background wake word', summary.backgroundWakeWordEnabled],
    ['Autonomous speaking', summary.autonomousSpeakingEnabled],
    ['Private reasoning exposure', summary.privateReasoningExposed],
    ['Continuous voice barge-in', summary.continuousVoiceBargeInEnabled]
  ];
  const continuityChecks: Array<[string, boolean]> = [
    ['Preserve last canvas', summary.preservesLastCompletedCanvas],
    ['Client stream abort', summary.clientStreamAbortSupported],
    ['No overlapping runs', summary.noOverlappingRuns],
    ['Typed fallback', summary.typedFallbackAvailable]
  ];

  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <div>
          <strong>Persisted canvas continuity</strong>
          <p>{summary.turnsWithCanvasState} canvas turns · {summary.renderedViewIds.length} rendered views · {summary.fallbackViewIds.length} fallbacks</p>
          <em>{summary.focusedViewIds.length} focused views · {summary.compatibleViewIds.length} voice-canvas compatible views</em>
        </div>
        <div>
          <strong>Latest canvas</strong>
          <p>{latest?.brandName ?? 'No canvas'} · {latest?.templateId ?? 'no template'} · {latest?.layout.replaceAll('_', ' ') ?? 'no layout'}</p>
          <em>Focus {latest?.focusedViewId ?? 'none'} · human review {latest?.humanReviewRequired ? 'required' : 'not required'}</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        {continuityChecks.map(([label, enabled]) => (
          <div key={label} className={enabled ? 'good' : 'medium'}>
            <strong>{label}</strong>
            <p>{enabled ? 'ready' : 'not proven'}</p>
            <em>{label === 'Client stream abort' ? 'Browser-side interruption support only.' : 'Computed from persisted per-turn manifests.'}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-source-list">
        <div>
          <strong>Rendered approved views</strong>
          <span>{summary.renderedViewIds.slice(0, 8).join(' · ') || 'No rendered view IDs persisted yet.'}</span>
          <p>Fallbacks: {summary.fallbackViewIds.slice(0, 6).join(' · ') || 'none'}</p>
          <em>Focused views: {summary.focusedViewIds.slice(0, 6).join(' · ') || 'none'}</em>
        </div>
        <div>
          <strong>Proof and presence rails</strong>
          <span>{summary.proofRailSections.map((item) => item.replaceAll('_', ' ')).join(' · ') || 'No proof rails persisted yet.'}</span>
          <p>Signals: {summary.visibleSignals.map((item) => item.replaceAll('_', ' ')).join(' · ') || 'none'}</p>
          <em>Pulses: {summary.pulseSources.map((item) => item.replaceAll('_', ' ')).join(' · ') || 'none'}</em>
        </div>
        <div>
          <strong>Reasoning status phases</strong>
          <span>{summary.statusPhaseCounts.map((item) => `${item.phase.replaceAll('_', ' ')} ${item.count}`).join(' · ') || 'No status phases persisted yet.'}</span>
          <p>Latest pending gates: {latest?.pendingGateIds.slice(0, 5).join(' · ') || 'none'}</p>
          <em>Latest evidence gaps: {latest?.evidenceGapIds.slice(0, 5).join(' · ') || 'none'}</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        {disabledCapabilities.map(([label, enabled]) => (
          <div key={label} className={enabled ? 'high' : 'good'}>
            <strong>{label}</strong>
            <p>{enabled ? 'enabled' : 'disabled'}</p>
            <em>Must remain disabled until the relevant runtime, privacy, source, or provider gate is approved.</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        <li>Continuity store: {summary.store.replaceAll('_', ' ')} · mode {summary.mode.replaceAll('_', ' ')}</li>
        <li>Interruption turns {summary.turnsWithInterruptionRecovery} · reasoning turns {summary.turnsWithReasoningStatus} · presence turns {summary.turnsWithConversationPresence}</li>
        <li>{summary.guardrails[0]}</li>
        <li>{summary.caveats[0]}</li>
      </ul>
    </div>
  );
}

function RuntimeGovernancePanel({ result }: { result?: AgentTurnResult }) {
  const control = result?.runtimeControlManifest;
  const capabilities = result?.capabilities ?? [];
  const adapters = result?.providerAdapterManifest;
  const runtimeControlSummary = result?.persistence?.runtimeControlSummary;
  const runtimeSurfaceSummary = result?.persistence?.runtimeSurfaceSummary;
  const foundationReadinessSummary = result?.persistence?.foundationReadinessSummary;
  const summary = summarizeRuntimeSurfaces(governedRuntimeSurfaceRegistry.surfaces);
  const gatedSurfaces = governedRuntimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'gated' || surface.status === 'disabled');
  const readySurfaces = governedRuntimeSurfaceRegistry.surfaces.filter((surface) => surface.status === 'ready' || surface.status === 'ready_opt_in');
  const disabledCapabilities = capabilities.filter((capability) => !capability.enabled);
  if (!control) {
    return (
      <div className="dynamic-empty">
        <Network size={18} /> Runtime governance state appears after a governed turn is available.
      </div>
    );
  }
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Network size={18} />
        <div>
          <strong>{governedRuntimeSurfaceRegistry.principle}</strong>
          <p>{summary.ready} ready · {summary.optIn} opt-in · {summary.legacy} legacy · {summary.gated} gated · {summary.disabled} disabled</p>
          <em>{control.runtimePolicyId} · mode {control.mode.replaceAll('_', ' ')} · kill switch {control.killSwitchActive ? 'active' : 'inactive'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={control.runtimeEnabled && !control.killSwitchActive ? 'good' : 'high'}>
          <BadgeCheck size={17} />
          <strong>Runtime policy</strong>
          <p>{control.runtimeEnabled ? 'enabled' : 'disabled'}</p>
          <em>Fail closed {control.failClosedIfActivated ? 'yes' : 'no'} · fallback {control.degradedModeFallback.replaceAll('_', ' ')}</em>
        </div>
        <div className={disabledCapabilities.length ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Capability flags</strong>
          <p>{disabledCapabilities.length} disabled</p>
          <em>{disabledCapabilities.slice(0, 3).map((capability) => capability.label).join(' · ') || 'No disabled capabilities in this turn.'}</em>
        </div>
        <div className={adapters?.gatedAdapterIds.length || adapters?.disabledAdapterIds.length ? 'medium' : 'good'}>
          <Mic size={17} />
          <strong>Provider gates</strong>
          <p>{adapters ? `${adapters.readyAdapterIds.length} ready` : 'not loaded'}</p>
          <em>Gated {adapters?.gatedAdapterIds.length ?? 0} · disabled {adapters?.disabledAdapterIds.length ?? 0} · TTS {adapters?.ttsEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {readySurfaces.slice(0, 5).map((surface) => (
          <div key={surface.id}>
            <strong>{surface.name}</strong>
            <span>{surface.status.replaceAll('_', ' ')} · {surface.defaultState.replaceAll('_', ' ')} · {surface.route}</span>
            <p>{surface.nextStep}</p>
            <em>{surface.proofSurface.replaceAll('_', ' ')} · {surface.connectedRuntimeRails.slice(0, 4).join(' · ')}</em>
          </div>
        ))}
        {gatedSurfaces.slice(0, 5).map((surface) => (
          <div key={surface.id}>
            <strong>{surface.name}</strong>
            <span>{surface.status.replaceAll('_', ' ')} · {surface.voice.replaceAll('_', ' ')}</span>
            <p>{surface.gates.slice(0, 3).join(' · ')}</p>
            <em>{surface.guardrails[0]}</em>
          </div>
        ))}
      </div>
      {runtimeSurfaceSummary?.runtimeSurfacePromotionProtocol?.length ? (
        <div className="dynamic-source-list">
          {runtimeSurfaceSummary.runtimeSurfacePromotionProtocol.map((item) => (
            <div key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.status.replaceAll('_', ' ')} · before {item.requiredBefore.replaceAll('_', ' ')}</span>
              <p>{item.proof}</p>
              <em>{item.blockers.length ? item.blockers.slice(0, 3).map((blocker) => blocker.replaceAll('_', ' ')).join(' · ') : 'No blocker in prototype review state.'} · promotion enabled: no</em>
            </div>
          ))}
        </div>
      ) : null}
      <ul>
        <li>Foundation: {foundationReadinessSummary?.cmoReadinessSignal.replaceAll('_', ' ') ?? 'waiting'} · ready {foundationReadinessSummary?.statusCounts.ready ?? 0} · gated {foundationReadinessSummary?.statusCounts.blocked ?? 0}</li>
        <li>Session control: {runtimeControlSummary?.turnsWithRuntimeControl ?? 0} turns · fail closed {runtimeControlSummary?.failClosedConsistent ? 'consistent' : 'waiting'} · bypass {runtimeControlSummary?.runtimeBypassAllowed ? 'allowed' : 'blocked'}</li>
        <li>Admin override required for: {control.adminOverrideRequiredFor.map((item) => item.replaceAll('_', ' ')).join(' · ')}</li>
        <li>Emergency stop scope: {control.emergencyStopScope.map((item) => item.replaceAll('_', ' ')).join(' · ')}</li>
        <li>{governedRuntimeSurfaceRegistry.caveats[0]}</li>
      </ul>
    </div>
  );
}

function CapabilityReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.capabilityReadinessSummary;
  const control = result?.runtimeControlManifest;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <ShieldAlert size={18} /> Capability readiness state appears after a governed turn is available.
      </div>
    );
  }
  const highRisk = summary.capabilities.filter((capability) => capability.riskLevel === 'high');
  const mediumRisk = summary.capabilities.filter((capability) => capability.riskLevel === 'medium');
  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ShieldAlert size={18} />
        <div>
          <strong>{summary.mode.replaceAll('_', ' ')}</strong>
          <p>{summary.enabledCapabilityIds.length} enabled · {summary.disabledCapabilityIds.length} disabled · {summary.blockedCapabilityGateIds.length} blocked gates</p>
          <em>Runtime {summary.runtimeEnabled ? 'enabled' : 'disabled'} · kill switch {summary.killSwitchActiveEver ? 'seen' : 'not active'} · bypass {summary.runtimeBypassAllowed ? 'allowed' : 'blocked'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.allRiskyCapabilitiesDisabled ? 'good' : 'high'}>
          <BadgeCheck size={17} />
          <strong>Risky capability posture</strong>
          <p>{summary.allRiskyCapabilitiesDisabled ? 'disabled' : 'review needed'}</p>
          <em>High risk disabled {summary.highRiskDisabledCapabilityIds.length} · medium risk disabled {summary.mediumRiskDisabledCapabilityIds.length}</em>
        </div>
        <div className={summary.exportEnabled || summary.circulationEnabled ? 'high' : 'good'}>
          <ClipboardList size={17} />
          <strong>Artifact movement</strong>
          <p>Export {summary.exportEnabled ? 'enabled' : 'disabled'} · circulation {summary.circulationEnabled ? 'enabled' : 'disabled'}</p>
          <em>{summary.blockedGateCountsByAction.find((item) => item.action === 'export_artifact')?.count ?? 0} blocked export gates</em>
        </div>
        <div className={summary.sourceDataWriteEnabled || summary.sourceClaimPromotionEnabled ? 'high' : 'good'}>
          <Database size={17} />
          <strong>Source writes</strong>
          <p>Data write {summary.sourceDataWriteEnabled ? 'enabled' : 'disabled'} · claim promotion {summary.sourceClaimPromotionEnabled ? 'enabled' : 'disabled'}</p>
          <em>External ingest {summary.externalResearchIngestEnabled ? 'enabled' : 'disabled'}</em>
        </div>
        <div className={summary.continuousVoiceEnabled ? 'high' : 'good'}>
          <Mic size={17} />
          <strong>Voice capability</strong>
          <p>Continuous voice {summary.continuousVoiceEnabled ? 'enabled' : 'disabled'}</p>
          <em>Admin override required for {summary.adminOverrideRequiredFor.length} capabilities</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {summary.riskyCapabilityPromotionProtocol.map((step) => (
          <div key={step.id}>
            <strong>{step.label}</strong>
            <span>{step.status.replaceAll('_', ' ')} · {step.requiredBefore.replaceAll('_', ' ')}</span>
            <p>{step.proof}</p>
            <em>{step.blockers[0] ?? 'No blocker captured.'} Capability {step.enablesCapability ? 'enabled' : 'disabled'}.</em>
          </div>
        ))}
        {highRisk.concat(mediumRisk).map((capability) => (
          <div key={capability.id}>
            <strong>{capability.label}</strong>
            <span>{capability.riskLevel} risk · {capability.enabled ? 'enabled' : 'disabled'} · approval {capability.requiredHumanApproval.replaceAll('_', ' ')}</span>
            <p>{capability.blockedReason ?? 'No blocker recorded.'}</p>
            <em>{capability.allowedActions.join(', ') || 'No direct actions allowed.'}</em>
          </div>
        ))}
      </div>
      <ul>
        <li>Blocked gates: {summary.blockedCapabilityGateIds.join(', ') || 'none'}.</li>
        <li>Required review gates: {summary.requiredReviewGateIds.join(', ') || 'none'} · reviewed gates: {summary.reviewedGateIds.join(', ') || 'none'}.</li>
        <li>Runtime control: {control?.runtimePolicyId ?? 'pending'} · fail closed {control?.failClosedIfActivated ? 'yes' : 'waiting'} · emergency stop {control?.emergencyStopScope.join(', ') ?? 'pending'}.</li>
        <li>{summary.guardrails[0]}</li>
      </ul>
    </div>
  );
}

function RuntimeQualityPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.runtimeQualitySummary as AgentSessionRuntimeQualitySummary | undefined;
  const latestChecks = summary?.latestChecks ?? [];
  const consistencyRows: { label: string; consistent: boolean }[] = summary
    ? [
        { label: 'Approved experience', consistent: summary.approvedExperienceConsistent },
        { label: 'Evidence attached', consistent: summary.evidenceAttachmentConsistent },
        { label: 'Source non-canonical', consistent: summary.sourceContextNonCanonicalConsistent },
        { label: 'Artifact export disabled', consistent: summary.artifactExportDisabledConsistent },
        { label: 'Memory review controlled', consistent: summary.memoryReviewControlledConsistent },
        { label: 'Continuous voice disabled', consistent: summary.continuousVoiceDisabledConsistent },
        { label: 'Provider adapters governed', consistent: summary.providerAdaptersGovernedConsistent },
        { label: 'Voice orchestration gated', consistent: summary.voiceOrchestrationGatedConsistent },
        { label: 'Runtime surfaces governed', consistent: summary.runtimeSurfaceGovernedConsistent }
      ]
    : [];

  if (!summary || summary.turnsWithRuntimeQuality === 0) {
    return (
      <div className="dynamic-empty">
        <BadgeCheck size={18} /> Runtime quality appears after a governed turn is persisted.
      </div>
    );
  }

  return (
    <div className="dynamic-source-readiness">
      <div className="dynamic-source-band">
        <div>
          <strong>Runtime self-check ledger</strong>
          <p>{summary.turnsWithRuntimeQuality} governed turns · {summary.checkIds.length} unique checks</p>
          <em>{summary.mode.replaceAll('_', ' ')} · store {summary.store.replaceAll('_', ' ')}</em>
        </div>
        <div>
          <strong>Quality status</strong>
          <p>{summary.checkStatusCounts.pass} pass · {summary.checkStatusCounts.watch} watch · {summary.checkStatusCounts.blocked} blocked</p>
          <em>{summary.humanReviewRequiredCheckIds.length} checks require human review</em>
        </div>
      </div>
      <div className="dynamic-source-checks">
        <div className={summary.watchCheckIds.length ? 'medium' : 'good'}>
          <BadgeCheck size={17} />
          <strong>Consistently passing</strong>
          <p>{summary.consistentlyPassingCheckIds.length} checks</p>
          <em>{summary.consistentlyPassingCheckIds.slice(0, 4).join(' · ') || 'No checks have passed every observed turn yet.'}</em>
        </div>
        <div className={summary.watchCheckIds.length ? 'medium' : 'good'}>
          <AlertTriangle size={17} />
          <strong>Watch items</strong>
          <p>{summary.watchCheckIds.length} checks</p>
          <em>{summary.watchCheckIds.slice(0, 4).join(' · ') || 'No watched checks in the persisted summary.'}</em>
        </div>
        <div className={summary.blockedCheckIds.length ? 'high' : 'good'}>
          <ShieldAlert size={17} />
          <strong>Blocked items</strong>
          <p>{summary.blockedCheckIds.length} checks</p>
          <em>{summary.blockedCheckIds.slice(0, 4).join(' · ') || 'No blocked runtime quality checks in the persisted summary.'}</em>
        </div>
      </div>
      <div className="dynamic-source-list">
        {latestChecks.map((check) => (
          <div key={check.id}>
            <strong>{check.label}</strong>
            <span>{check.status.replaceAll('_', ' ')} · {check.humanReviewRequired ? 'human review required' : 'review not required'}</span>
            <p>{check.detail}</p>
            <em>{check.evidenceLabels.slice(0, 3).join(' · ') || check.relatedGateIds.slice(0, 3).join(' · ') || 'No evidence label attached.'}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-source-list">
        {consistencyRows.map(({ label, consistent }) => (
          <div key={label}>
            <strong>{label}</strong>
            <span>{consistent ? 'consistent' : 'waiting or blocked'}</span>
            <p>{consistent ? 'Observed and passed across persisted runtime quality checks.' : 'Needs additional passing runtime quality evidence before promotion.'}</p>
            <em>{summary.guardrails[1]}</em>
          </div>
        ))}
      </div>
      <ul className="dynamic-source-footnotes">
        <li>Human-review checks: {summary.humanReviewRequiredCheckIds.join(' · ') || 'none'}</li>
        <li>{summary.guardrails[0]}</li>
        <li>{summary.guardrails[2]}</li>
        <li>{summary.caveats[1]}</li>
      </ul>
    </div>
  );
}

function ExecutivePilotRunbookPanel({ packet, result }: { packet: BrandIntelligencePacket; result?: AgentTurnResult }) {
  const foundation = result?.persistence?.foundationReadinessSummary;
  const executivePilot = result?.persistence?.executivePilotSummary;
  const review = result?.persistence?.reviewWorkflowSummary;
  const runtime = result?.runtimeControlManifest;
  const architecture = result?.experienceArchitectureManifest;
  const momentumStatus = packet.momentumIntelligence.status;
  const roomToGrowStatus = packet.roomToGrow.status;
  const blockedPaths = foundation?.disabledPromotionPaths.slice(0, 6) ?? [
    'enterprise_database_persistence',
    'official_approval_workflow',
    'artifact_export_or_circulation',
    'full_voice_realtime_tts',
    'arbitrary_ui_generation'
  ];

  const proofMoments = [
    {
      title: '1. Live brand read',
      status: momentumStatus === 'available' ? 'ready' : momentumStatus,
      detail: `${packet.brand.brandName} opens with momentum, SMD, evidence, and visible caveats instead of a generic platform tour.`,
      proof: `${packet.momentumIntelligence.redSignals.length} red signals · room to grow ${roomToGrowStatus}`
    },
    {
      title: '2. Governed workspace assembly',
      status: architecture?.dynamicUiGenerationEnabled ? 'blocked' : 'ready',
      detail: 'The agent produces an ExperiencePlan and renders approved views from the registry, proving dynamic UI without arbitrary component generation.',
      proof: `${experienceTemplateRegistry.length} templates · ${agentSkillRegistry.length} skills · ${dynamicViewRegistry.length} views`
    },
    {
      title: '3. Trust and review rail',
      status: (review?.pending.total ?? 0) > 0 ? 'prototype' : 'ready',
      detail: 'Evidence gaps, suggested memory, artifacts, and gates remain inspectable before anything becomes source truth or a circulated output.',
      proof: `${review?.pending.total ?? 0} pending review · ${review?.blocked.confirmationGates ?? 0} blocked gates`
    },
    {
      title: '4. Runtime and voice path',
      status: runtime?.runtimeEnabled ? 'prototype' : 'waiting',
      detail: 'The same governed runtime powers JSON, streaming, Agent Lab, opt-in chat, and the future push-to-talk voice canvas.',
      proof: `Runtime ${runtime?.mode.replaceAll('_', ' ') ?? 'waiting'} · kill switch ${runtime?.killSwitchActive ? 'active' : 'inactive'}`
    },
    {
      title: '5. Fundable next build',
      status: foundation?.foundationDemoReady ? 'ready' : 'prototype',
      detail: 'The close is a prioritized funding ask: source ownership, persistence/identity, artifact governance, voice policy, and outcome-learning design.',
      proof: `${foundation?.statusCounts.ready ?? 0} ready · ${foundation?.statusCounts.blocked ?? blockedPaths.length} gated`
    }
  ];

  const statusClass = (status: string) => {
    if (status === 'ready' || status === 'available') return 'good';
    if (status === 'blocked' || status === 'missing') return 'high';
    return 'medium';
  };

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ClipboardList size={18} />
        <div>
          <strong>{packet.brand.brandName} sponsor pilot sequence</strong>
          <p>{foundation?.cmoReadinessSignal.replaceAll('_', ' ') ?? 'foundation readiness waiting'} · {foundation?.foundationDemoReady ? 'demo coherent' : 'needs more governed proof'}</p>
          <em>Read-only runbook · approved views only · export, full voice, canonical writes, and arbitrary UI remain gated</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={momentumStatus === 'missing' ? 'high' : 'good'}>
          <LineChart size={17} />
          <strong>Business hook</strong>
          <p>{packet.momentumIntelligence.headline}</p>
          <em>{packet.brand.category} · {packet.brand.period}</em>
        </div>
        <div className={foundation?.approvedComposition.unknownViewIds.length ? 'high' : 'good'}>
          <Route size={17} />
          <strong>Dynamic foundation</strong>
          <p>{experienceTemplateRegistry.length} templates · {dynamicViewRegistry.length} views</p>
          <em>Unknown views {foundation?.approvedComposition.unknownViewIds.length ?? 0} · arbitrary UI blocked</em>
        </div>
        <div className={(review?.pending.total ?? 0) > 0 ? 'medium' : 'good'}>
          <BadgeCheck size={17} />
          <strong>Human governance</strong>
          <p>{review?.reviewed.totalReviews ?? 0} reviewed · {review?.pending.total ?? 0} pending</p>
          <em>Official approvals disabled · local review only</em>
        </div>
        <div className={foundation?.voiceAndProvider.fullVoiceEnabled ? 'high' : 'medium'}>
          <Mic size={17} />
          <strong>Voice path</strong>
          <p>Push-to-talk ready · continuous gated</p>
          <em>Realtime {foundation?.voiceAndProvider.realtimeVoiceEnabled ? 'enabled' : 'gated'} · TTS {foundation?.voiceAndProvider.ttsEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {proofMoments.map((moment) => (
          <div key={moment.title} className={statusClass(moment.status)}>
            <strong>{moment.title}</strong>
            <span>{moment.status.replaceAll('_', ' ')}</span>
            <p>{moment.detail}</p>
            <em>{moment.proof}</em>
          </div>
        ))}
      </div>
      {executivePilot && (
        <>
          <div className="dynamic-source-list">
            {executivePilot.demoEvidenceStack.map((item) => (
              <div key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.status.replaceAll('_', ' ')}</span>
                <p>{item.proof}</p>
                <em>{item.blockers.length ? `Gated: ${item.blockers.map((blocker) => blocker.replaceAll('_', ' ')).join(' · ')}` : `Proof views: ${item.relatedViewIds.join(' · ')}`}</em>
              </div>
            ))}
          </div>
          <div className="dynamic-source-list">
            {executivePilot.fundingAsks.map((ask) => (
              <div key={ask.id}>
                <strong>{ask.label}</strong>
                <span>{ask.priority}</span>
                <p>{ask.rationale}</p>
                <em>Gated until {ask.gatedUntil.map((gate) => gate.replaceAll('_', ' ')).join(' · ')}</em>
              </div>
            ))}
          </div>
        </>
      )}
      <ul>
        <li>Funding ask: approve source-owner extracts, enterprise persistence/identity, artifact language/circulation policy, voice governance, and outcome-learning records before promotion.</li>
        <li>Demo path: brand read {'->'} ExperiencePlan assembly {'->'} evidence/review proof {'->'} runtime/voice path {'->'} gated funding roadmap.</li>
        <li>Disabled promotion paths: {blockedPaths.map((path) => path.replaceAll('_', ' ')).join(' · ')}</li>
        <li>{foundation?.caveats[0] ?? 'Readiness is prototype evidence for prioritization, not production authorization.'}</li>
      </ul>
    </div>
  );
}

function FoundationReadinessPanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.foundationReadinessSummary;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <Network size={18} /> Foundation readiness appears after a governed turn is persisted.
      </div>
    );
  }

  const statusClass = (status: string) => {
    if (status === 'ready') return 'good';
    if (status === 'prototype') return 'medium';
    if (status === 'blocked') return 'high';
    return 'medium';
  };

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <Network size={18} />
        <div>
          <strong>{summary.cmoReadinessSignal.replaceAll('_', ' ')}</strong>
          <p>{summary.turns} governed turns · {summary.foundationDemoReady ? 'demo coherent' : 'needs governed turns or review'}</p>
          <em>{summary.statusCounts.ready} ready · {summary.statusCounts.prototype} prototype · {summary.statusCounts.blocked} gated · {summary.statusCounts.waiting} waiting</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.approvedComposition.unknownViewIds.length ? 'high' : 'good'}>
          <BadgeCheck size={17} />
          <strong>Approved composition</strong>
          <p>{summary.approvedComposition.templateCount} templates · {summary.approvedComposition.viewCount} views</p>
          <em>{summary.approvedComposition.renderedViewIds.length} rendered · unknown {summary.approvedComposition.unknownViewIds.length}</em>
        </div>
        <div className={summary.proofAndReview.missingEvidenceClaims ? 'medium' : 'good'}>
          <ClipboardList size={17} />
          <strong>Proof and review</strong>
          <p>{summary.proofAndReview.supportedClaims} supported · {summary.proofAndReview.missingEvidenceClaims} gaps</p>
          <em>{summary.proofAndReview.reviewedItems} reviewed · {summary.proofAndReview.pendingReviewItems} pending</em>
        </div>
        <div className={summary.runtimeAndCapability.allRiskyCapabilitiesDisabled ? 'good' : 'high'}>
          <ShieldAlert size={17} />
          <strong>Runtime guardrails</strong>
          <p>fail closed {summary.runtimeAndCapability.failClosedConsistent ? 'yes' : 'waiting'}</p>
          <em>runtime bypass {summary.runtimeAndCapability.runtimeBypassAllowed ? 'allowed' : 'blocked'} · risky disabled {summary.runtimeAndCapability.allRiskyCapabilitiesDisabled ? 'yes' : 'no'}</em>
        </div>
        <div className={summary.voiceAndProvider.fullVoiceEnabled || summary.voiceAndProvider.ttsEnabled ? 'high' : 'medium'}>
          <Mic size={17} />
          <strong>Voice and providers</strong>
          <p>SSE {summary.voiceAndProvider.sseStreamingReady ? 'ready' : 'waiting'} · STT {summary.voiceAndProvider.browserSttPrototypeReady ? 'prototype' : 'waiting'}</p>
          <em>Realtime {summary.voiceAndProvider.realtimeVoiceEnabled ? 'enabled' : 'gated'} · TTS {summary.voiceAndProvider.ttsEnabled ? 'enabled' : 'disabled'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {summary.readinessAreas.map((area) => (
          <div key={area.id} className={statusClass(area.status)}>
            <strong>{area.label}</strong>
            <span>{area.status}</span>
            <p>{area.evidence}</p>
            <em>{area.blockers.slice(0, 2).join(' · ') || 'No blocker captured for this area.'}</em>
          </div>
        ))}
      </div>
      <ul>
        <li>Source and persistence: local JSON {summary.sourceAndPersistence.localJsonPersistenceEnabled ? 'ready' : 'waiting'} · enterprise {summary.sourceAndPersistence.enterprisePersistenceEnabled ? 'enabled' : 'blocked'} · canonical writes {summary.sourceAndPersistence.canonicalSourceWritesEnabled ? 'enabled' : 'disabled'}</li>
        <li>Artifacts and learning: {summary.learningAndArtifacts.artifactsCaptured} artifacts · export {summary.learningAndArtifacts.artifactExportEnabled ? 'enabled' : 'disabled'} · outcome learning {summary.learningAndArtifacts.outcomeLearningEnabled ? 'enabled' : 'disabled'}</li>
        <li>Disabled promotion paths: {summary.disabledPromotionPaths.slice(0, 5).map((path) => path.replaceAll('_', ' ')).join(' · ')}</li>
        <li>Next step: {summary.nextFoundationSteps[0] ?? 'Run more governed turns or review gates to capture the next promotion step.'}</li>
        <li>{summary.caveats[0]}</li>
      </ul>
    </div>
  );
}

function PromotionGatePanel({ result }: { result?: AgentTurnResult }) {
  const summary = result?.persistence?.promotionGateSummary;
  if (!summary) {
    return (
      <div className="dynamic-empty">
        <ShieldAlert size={18} /> Promotion gate appears after a governed turn is persisted.
      </div>
    );
  }

  const gateRows = [
    ['Source-owner files', summary.criticalGates.sourceOwnerDataReady, summary.criticalGates.sourceOwnerDataReady ? 'Ready for governance review' : 'Needed before runtime source wiring'],
    ['Canonical use', summary.criticalGates.canonicalUseApproved, 'Blocked until source-owner and governance approval'],
    ['Enterprise persistence', summary.criticalGates.enterprisePersistenceReady, 'Blocked until database, identity, retention, and backup requirements clear'],
    ['Official approval', summary.criticalGates.officialApprovalReady, 'Blocked until enterprise reviewer identity and role/brand access exist'],
    ['Artifact export', summary.criticalGates.artifactExportReady, 'Blocked until language, artifact shape, and circulation policy are approved'],
    ['Full voice', summary.criticalGates.fullVoiceReady, 'Blocked until Realtime parity, consent/privacy, interruption, TTS, and storage clear'],
    ['Autonomous learning', summary.criticalGates.autonomousLearningReady, 'Blocked until outcome records, efficacy rules, and canonical learning governance clear'],
    ['Arbitrary UI', summary.criticalGates.arbitraryUiGenerationReady, 'Blocked until a reviewed UI-generation capability exists']
  ] as const;

  return (
    <div className="dynamic-review-workflow">
      <div className="dynamic-source-band">
        <ShieldAlert size={18} />
        <div>
          <strong>{summary.promotionDecision.replaceAll('_', ' ')}</strong>
          <p>{summary.readinessLevel.replaceAll('_', ' ')} · {summary.recommendedAsk.replaceAll('_', ' ')}</p>
          <em>Production {summary.productionReady ? 'ready' : 'blocked'} · pilot review {summary.pilotReviewReady ? 'ready' : 'needs proof'} · CMO demo {summary.executiveDemoReady ? 'ready' : 'needs sequence'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-checks">
        <div className={summary.executiveDemoReady ? 'good' : 'medium'}>
          <BadgeCheck size={17} />
          <strong>Demo proof</strong>
          <p>{summary.demoProof.governedTurns} turns · {summary.demoProof.completedExecutivePilotSteps}/{summary.demoProof.totalExecutivePilotSteps} pilot steps</p>
          <em>{summary.demoProof.approvedViewsRendered} approved views · {summary.demoProof.supportedClaims} supported claims · surfaces {summary.demoProof.runtimeSurfacesGuarded ? 'guarded' : 'watch'}</em>
        </div>
        <div className={summary.productionReady ? 'good' : 'high'}>
          <AlertTriangle size={17} />
          <strong>Production blockers</strong>
          <p>{summary.blockedForProduction.length} blocked</p>
          <em>{summary.blockedForProduction.slice(0, 3).map((item) => item.replaceAll('_', ' ')).join(' · ')}</em>
        </div>
        <div className={summary.criticalGates.fullVoiceReady || summary.criticalGates.artifactExportReady ? 'high' : 'good'}>
          <Mic size={17} />
          <strong>Risky promotion paths</strong>
          <p>full voice {summary.criticalGates.fullVoiceReady ? 'ready' : 'blocked'} · export {summary.criticalGates.artifactExportReady ? 'ready' : 'blocked'}</p>
          <em>canonical use {summary.criticalGates.canonicalUseApproved ? 'approved' : 'blocked'} · arbitrary UI {summary.criticalGates.arbitraryUiGenerationReady ? 'ready' : 'blocked'}</em>
        </div>
      </div>
      <div className="dynamic-readiness-handoff">
        {gateRows.map(([label, ready, detail]) => (
          <div className={ready ? 'good' : 'high'} key={label}>
            <strong>{label}</strong>
            <span>{ready ? 'ready' : 'blocked'}</span>
            <p>{detail}</p>
            <em>{ready ? 'Visible for review; still not production authorization.' : 'Must stay gated before rollout.'}</em>
          </div>
        ))}
      </div>
      <div className="dynamic-readiness-handoff">
        <div>
          <strong>Enabled for demo</strong>
          <span>{summary.enabledForDemo.slice(0, 4).map((item) => item.replaceAll('_', ' ')).join(' · ')}</span>
          <p>{summary.enabledForDemo.slice(4).map((item) => item.replaceAll('_', ' ')).join(' · ')}</p>
          <em>Demo rails are prototype rails; they do not unlock production promotion.</em>
        </div>
        <div>
          <strong>Funding rationale</strong>
          <span>{summary.fundingRationale[0]}</span>
          <p>{summary.fundingRationale[1] ?? summary.fundingRationale[0]}</p>
          <em>{summary.fundingRationale[2] ?? summary.caveats[0]}</em>
        </div>
      </div>
      <ul>
        <li>Next pilot step: {summary.nextPilotSteps[0] ?? 'Run the governed Executive Pilot sequence before requesting rollout funding.'}</li>
        <li>Disabled paths: {summary.disabledPromotionPaths.slice(0, 6).map((path) => path.replaceAll('_', ' ')).join(' · ')}</li>
        <li>{summary.guardrails[0]}</li>
        <li>{summary.caveats[0]}</li>
      </ul>
    </div>
  );
}

export default function DynamicViewRenderer({ request, packet, result }: { request: DynamicViewRequest; packet: BrandIntelligencePacket; result?: AgentTurnResult }) {
  const viewId = request.requiredDataAvailable ? request.viewId : request.fallbackViewId ?? request.viewId;
  return (
    <ViewShell request={request}>
      {viewId === 'kpi_strip' && <KpiStrip packet={packet} />}
      {viewId === 'learning_explainer' && <LearningExplainer packet={packet} />}
      {viewId === 'quiz_card' && <QuizCard packet={packet} />}
      {viewId === 'momentum_ladder' && <MomentumLadder packet={packet} />}
      {viewId === 'momentum_room_to_grow_grid' && <RoomToGrowGrid packet={packet} />}
      {viewId === 'smd_driver_map' && <SmdDriverMap packet={packet} />}
      {viewId === 'source_readiness_panel' && <SourceReadinessPanel packet={packet} />}
      {viewId === 'data_basis_inspector' && <DataBasisInspector packet={packet} />}
      {viewId === 'evidence_ledger' && <EvidenceLedger packet={packet} />}
      {viewId === 'evidence_spotlight_panel' && <EvidenceSpotlightPanel result={result} />}
      {viewId === 'diagnosis_trace_summary' && <DiagnosisTraceSummary packet={packet} />}
      {viewId === 'growth_provocation_list' && <ProvocationList packet={packet} />}
      {viewId === 'treatment_path_card' && <TreatmentPathCard packet={packet} />}
      {viewId === 'peer_comparison' && <PeerComparison packet={packet} />}
      {viewId === 'pattern_radar_brief' && <PatternRadarBrief packet={packet} />}
      {viewId === 'qbr_story_draft' && <QbrStoryDraft packet={packet} />}
      {viewId === 'meeting_takeaway_panel' && <MeetingTakeawayPanel packet={packet} />}
      {viewId === 'review_workflow_panel' && <ReviewWorkflowPanel result={result} />}
      {viewId === 'memory_audit_panel' && <MemoryAuditPanel result={result} />}
      {viewId === 'audit_trail_panel' && <AuditTrailPanel result={result} />}
      {viewId === 'review_identity_panel' && <ReviewIdentityPanel result={result} />}
      {viewId === 'pilot_learning_panel' && <PilotLearningPanel result={result} />}
      {viewId === 'proactivity_panel' && <ProactivityPanel result={result} />}
      {viewId === 'voice_readiness_panel' && <VoiceReadinessPanel result={result} />}
      {viewId === 'provider_adapter_panel' && <ProviderAdapterPanel result={result} />}
      {viewId === 'persistence_readiness_panel' && <PersistenceReadinessPanel result={result} />}
      {viewId === 'treatment_outcome_readiness_panel' && <TreatmentOutcomeReadinessPanel result={result} />}
      {viewId === 'artifact_readiness_panel' && <ArtifactReadinessPanel result={result} />}
      {viewId === 'source_promotion_readiness_panel' && <SourcePromotionReadinessPanel result={result} />}
      {viewId === 'source_runtime_ingestion_panel' && <SourceRuntimeIngestionPanel result={result} />}
      {viewId === 'experience_architecture_panel' && <ExperienceArchitecturePanel result={result} />}
      {viewId === 'canvas_continuity_panel' && <CanvasContinuityPanel result={result} />}
      {viewId === 'runtime_governance_panel' && <RuntimeGovernancePanel result={result} />}
      {viewId === 'capability_readiness_panel' && <CapabilityReadinessPanel result={result} />}
      {viewId === 'runtime_quality_panel' && <RuntimeQualityPanel result={result} />}
      {viewId === 'executive_pilot_runbook_panel' && <ExecutivePilotRunbookPanel packet={packet} result={result} />}
      {viewId === 'foundation_readiness_panel' && <FoundationReadinessPanel result={result} />}
      {viewId === 'promotion_gate_panel' && <PromotionGatePanel result={result} />}
      {viewId === 'data_gap_panel' && <DataGapPanel packet={packet} />}
      {!['kpi_strip', 'learning_explainer', 'quiz_card', 'momentum_ladder', 'momentum_room_to_grow_grid', 'smd_driver_map', 'source_readiness_panel', 'data_basis_inspector', 'source_runtime_ingestion_panel', 'source_promotion_readiness_panel', 'evidence_ledger', 'evidence_spotlight_panel', 'diagnosis_trace_summary', 'growth_provocation_list', 'treatment_path_card', 'peer_comparison', 'pattern_radar_brief', 'qbr_story_draft', 'meeting_takeaway_panel', 'review_workflow_panel', 'memory_audit_panel', 'audit_trail_panel', 'review_identity_panel', 'pilot_learning_panel', 'proactivity_panel', 'voice_readiness_panel', 'provider_adapter_panel', 'persistence_readiness_panel', 'treatment_outcome_readiness_panel', 'artifact_readiness_panel', 'experience_architecture_panel', 'canvas_continuity_panel', 'runtime_governance_panel', 'capability_readiness_panel', 'runtime_quality_panel', 'executive_pilot_runbook_panel', 'foundation_readiness_panel', 'promotion_gate_panel', 'data_gap_panel'].includes(viewId) && (
        <div className="dynamic-empty"><BadgeCheck size={18} /> Approved view placeholder: {viewId}</div>
      )}
    </ViewShell>
  );
}
