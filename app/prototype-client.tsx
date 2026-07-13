'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  BookText,
  Brain,
  ChevronDown,
  ClipboardList,
  Database,
  MessageSquareText,
  Navigation,
  Network,
  Pill,
  Search,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Sparkles,
  Stethoscope,
  Target,
  X
} from 'lucide-react';
import {
  aiPersonas,
  brandRecords,
  formatMetricValue,
  getBrandAsset,
  getBindingConstraint,
  getDiagnosisEvidence,
  getDiagnosisRuleTrace,
  getDialogQuestions,
  getEvidenceConfidence,
  getFollowUpSignals,
  getGrowthNavigatorVitals,
  getGrowthAvailabilityRecord,
  getKpiDeepDiveSections,
  getMentalAvailabilityRecord,
  getMetricOpportunityRows,
  getMomentumMonitor,
  getPatternRadarRecord,
  getPrimaryDiagnosis,
  getStrategicRoadmap,
  getTreatmentPlanDraft,
  getTreatmentPlanOptions,
  getTrendDelta,
  metric,
  treatmentDefinitions
} from '@/src/lib/data';
import type { BrandHealthRecord, ExecutiveSummary } from '@/src/types/domain';
import LiveConsultPanel from '@/src/components/live-consult/LiveConsultPanel';
import {
  findLiveConsultAction,
  inferLiveConsultActionIdFromQuestion,
  liveConsultActionTargetIds,
  metricAnchorId
} from '@/src/lib/live-consult/actions';
import MarkdownMessage from '@/src/components/common/MarkdownMessage';
import GovernedProofStrip from '@/src/components/intelligence/GovernedProofStrip';
import { governedChatProofFromResponse, type GovernedChatProof } from '@/src/lib/intelligence/governed-proof';
import { activeMentalAvailabilityPacket } from '@/src/lib/mental-availability-ingestion';
import type { MentalAvailabilitySourcePacket } from '@/src/types/domain';

type AudienceMode = 'brand' | 'insights';
type ActiveVisual = 'brand_health_panel' | 'bloodwork' | 'explanation_lenses' | 'pattern_radar' | 'diagnosis' | 'root_cause' | 'treatment' | 'plan_builder' | 'follow_up' | 'roadmap';
type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
  source?: 'openai' | 'grounded_fallback' | 'skill_router';
  proof?: GovernedChatProof;
  actionId?: string;
  actionLabel?: string;
};

function displayMetricName(name: string) {
  return name === 'Pricing Power' ? 'Perceived Value' : name;
}

function chatSourceLabel(source: ChatMessage['source']) {
  if (source === 'skill_router') return 'Governed runtime';
  if (source === 'openai') return 'Live LLM';
  return 'Grounded fallback';
}

function activeVisualDisplayName(activeVisual: ActiveVisual) {
  if (activeVisual === 'brand_health_panel') return 'Executive Summary';
  if (activeVisual === 'bloodwork') return 'BBE Bloodwork';
  if (activeVisual === 'plan_builder') return 'Treatment Path To Test';
  return activeVisual.replaceAll('_', ' ');
}

const visualToQuestionScope: Record<ActiveVisual, string> = {
  brand_health_panel: 'brand_health_panel',
  bloodwork: 'brand_health_panel',
  explanation_lenses: 'root_cause',
  pattern_radar: 'brand_health_panel',
  diagnosis: 'diagnosis',
  root_cause: 'root_cause',
  treatment: 'treatment',
  plan_builder: 'treatment',
  follow_up: 'treatment',
  roadmap: 'treatment'
};

const thinkingSteps = [
  'Reading the brand’s equity signals',
  'Finding the strongest marketing story in the evidence',
  'Matching potential treatment paths to the diagnosis',
  'Writing a grounded recommendation'
] as const;

const actionVisualMap: Record<string, ActiveVisual> = {
  open_executive_summary: 'brand_health_panel',
  open_health_panel: 'bloodwork',
  open_current_diagnosis: 'diagnosis',
  open_evidence_ledger: 'diagnosis',
  open_rule_trace: 'diagnosis',
  open_root_cause: 'explanation_lenses',
  open_prescription: 'plan_builder',
  open_follow_up_signals: 'follow_up',
  highlight_demand_power: 'bloodwork',
  highlight_pricing_power: 'bloodwork',
  highlight_meaningful: 'bloodwork',
  highlight_different: 'bloodwork',
  highlight_salient: 'bloodwork',
  select_top_treatment: 'plan_builder'
};

function scrollToReportElement(elementIds: string[]) {
  const target = elementIds.map((elementId) => document.getElementById(elementId)).find(Boolean);
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('live-consult-focus');
  window.setTimeout(() => target.classList.remove('live-consult-focus'), 2600);
  return true;
}

const executiveSummaryClientCache = new Map<string, ExecutiveSummary>();

function executiveSummaryClientCacheKey(record: BrandHealthRecord, mode: AudienceMode, personaId: string) {
  return `${record.brandId}::${record.category}::${mode}::${personaId}`;
}

function ThinkingMessage({ step }: { step: string }) {
  return (
    <div className="msg assistant thinking-msg" aria-live="polite" aria-label="Brand Doctor is working">
      <div className="thinking-title">
        <span>Brand Doctor is shaping the brand read</span>
        <span className="typing-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="thinking-step">{step}</div>
    </div>
  );
}

function statusClass(status?: string | null) {
  if (status === 'Ahead' || status === 'Category Leading' || status === 'Gaining') return 'good';
  if (status === 'Declining' || status === 'Not Ahead' || status === 'Category Lagging') return 'bad';
  return 'watch';
}

const treatmentFamilyLabels: Record<string, string> = {
  build_basic_familiarity: 'Build basic familiarity',
  establish_distinctive_assets: 'Establish distinctive brand assets',
  functional_difference: 'Make the functional difference clearer',
  emotive_difference: 'Strengthen the emotional reason to choose',
  increase_reach_continuity: 'Increase reach and continuity',
  availability_in_high_fit_channels: 'Improve availability in high-fit channels',
  modernize_iconicity: 'Modernize iconic brand assets',
  strengthen_distinctive_assets: 'Strengthen distinctive assets',
  broaden_relevance: 'Broaden relevance',
  translate_difference: 'Translate difference for broader appeal',
  monitor_context: 'Monitor context shifts',
  selective_acceleration: 'Selective acceleration'
};

function treatmentFamilyLabel(familyId: string) {
  return treatmentDefinitions.find((treatment) => treatment.id === familyId)?.name
    ?? treatmentFamilyLabels[familyId]
    ?? familyId.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function treatmentFamilySentence(familyIds: string[]) {
  const labels = familyIds.map(treatmentFamilyLabel);
  if (!labels.length) return 'No primary treatment family has been configured yet.';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function firstSentence(value: string) {
  return value.match(/[^.!?]+[.!?]/)?.[0]?.trim() ?? value;
}

function formatSummaryTimestamp(value?: string) {
  if (!value) return 'Generating now';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function BrandLogoMark({ record, brandName }: { record: BrandHealthRecord; brandName: string }) {
  const [failed, setFailed] = useState(false);
  const asset = getBrandAsset(record);
  const initials = brandName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || brandName.slice(0, 2).toUpperCase();

  if (!asset?.logoUrl || failed) {
    return <span className="brand-mark brand-mark-fallback">{initials}</span>;
  }

  return (
    <span className="brand-logo-mark">
      <img src={asset.logoUrl} alt={`${brandName} logo`} onError={() => setFailed(true)} />
    </span>
  );
}

function EvidenceReadinessPanel({ summary }: { summary: ExecutiveSummary }) {
  const readiness = summary.evidenceReadiness;
  const materialGaps = readiness.missingInputs.filter((item) => !item.toLowerCase().startsWith('no material'));
  const confidenceLabel = readiness.diagnosisConfidence === 'Fallback'
    ? 'fallback diagnosis'
    : `${readiness.diagnosisConfidence.toLowerCase()}-confidence diagnosis`;
  const gapSummary = materialGaps.length
    ? `Fill ${materialGaps.slice(0, 2).join(' and ')} before locking the plan.`
    : 'No material evidence gaps detected in the active packet.';
  const ctaLabel = materialGaps.length ? 'Review evidence gaps' : 'Review evidence';

  return (
    <aside className={`evidence-basis ${readiness.tone}`} aria-label="Evidence basis">
      <BadgeCheck size={17} />
      <span>
        <strong>Evidence basis:</strong> {readiness.label}, {confidenceLabel}. {readiness.evidenceStrength}. {gapSummary}
      </span>
      <a href="#evidence-title">{ctaLabel}</a>
    </aside>
  );
}

function ExecutiveSummaryCard({
  record,
  mode,
  personaId,
  onFocus
}: {
  record: BrandHealthRecord;
  mode: AudienceMode;
  personaId: string;
  onFocus: () => void;
}) {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = executiveSummaryClientCacheKey(record, mode, personaId);
    const cachedSummary = executiveSummaryClientCache.get(cacheKey);

    if (cachedSummary) {
      setSummary(cachedSummary);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setSummary(null);

    fetch('/api/summary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ brandId: record.brandId, category: record.category, mode, personaId })
    })
      .then((res) => res.json())
      .then((data: ExecutiveSummary) => {
        executiveSummaryClientCache.set(cacheKey, data);
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [record, mode, personaId]);

  if (loading || !summary) {
    return (
      <section className="exec-summary exec-summary-loading" onMouseEnter={onFocus} onFocus={onFocus} aria-label="Executive summary loading">
        <div className="summary-skeleton summary-skeleton-title" />
        <div className="summary-skeleton summary-skeleton-headline" />
        <div className="summary-skeleton summary-skeleton-copy" />
        <div className="summary-skeleton-row">
          <div className="summary-skeleton" />
          <div className="summary-skeleton" />
        </div>
      </section>
    );
  }

  return (
    <section className="exec-summary" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="exec-summary-title">
      <div className="exec-summary-top">
        <div>
          <div className="exec-brand-line">
            <BrandLogoMark key={record.brandId} record={record} brandName={summary.brandName} />
            <h2 id="exec-summary-title">{summary.brandName}</h2>
          </div>
          <div className="exec-meta">
            <span>{summary.summaryTitle}</span>
            <span>{formatSummaryTimestamp(summary.generatedAt)}</span>
          </div>
        </div>
        <div className={`exec-diagnosis-badge ${summary.diagnosisBadge.tone}`}>
          <span>{summary.diagnosisBadge.label}</span>
          <strong>{summary.diagnosisBadge.value}</strong>
          <em>{summary.diagnosisBadge.detail}</em>
        </div>
      </div>
      <div className="exec-divider" />
      <div className="exec-headline-row">
        <Signal size={30} />
        <h3>{summary.headline}</h3>
      </div>
      <p className="exec-narrative">{summary.narrative}</p>
      <EvidenceReadinessPanel summary={summary} />
      <div className="exec-two-col">
        <div>
          <h4>What’s Working</h4>
          {summary.whatsWorking.map((item) => (
            <article key={`${item.title}-${item.detail}`} className="exec-list-item good">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
              <em>{item.implication}</em>
            </article>
          ))}
        </div>
        <div>
          <h4>What To Do Next</h4>
          {summary.whatToFix.map((item, index) => (
            <article key={`${item.title}-${item.detail}`} className="exec-list-item watch">
              <strong>{index + 1}. {item.title}</strong>
              <span>{item.detail}</span>
              <em>{item.implication}</em>
            </article>
          ))}
        </div>
      </div>
      <div className="exec-metric-strip" aria-label="Executive KPI score summary">
        {summary.metricStrip.map((item) => (
          <article className={`exec-metric ${item.tone}`} key={`${item.label}-${item.value}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <em>{item.status}</em>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function metricRead(record: BrandHealthRecord, name: string) {
  const m = metric(record, name);
  const tone = m?.momentum === 'Declining' || m?.ahead === 'Not Ahead'
    ? 'bad'
    : m?.momentum === 'Gaining' || m?.ahead === 'Ahead'
      ? 'good'
      : 'watch';
  return {
    label: displayMetricName(name),
    value: formatMetricValue(m?.value),
    category: m?.categoryBand ?? 'Unknown category context',
    ahead: m?.ahead ?? 'Ahead unknown',
    momentum: m?.momentum ?? 'Momentum unknown',
    tone
  };
}

function cmoBriefHeadline(record: BrandHealthRecord) {
  const monitor = getMomentumMonitor(record);
  if (monitor.trajectory.toLowerCase() === 'declining') {
    return `${record.brandName} has scale strength, but the CMO read is momentum pressure.`;
  }
  if (monitor.trajectory.toLowerCase() === 'gaining') {
    return `${record.brandName} is building momentum; the CMO read is how to convert it responsibly.`;
  }
  return `${record.brandName} needs a disciplined read: strength, trajectory, proof, and next test.`;
}

function CmoDiagnosticBrief({ record, onFocus }: { record: BrandHealthRecord; onFocus: () => void }) {
  const diagnosisEvidence = getDiagnosisEvidence(record);
  const monitor = getMomentumMonitor(record);
  const evidenceConfidence = getEvidenceConfidence(record);
  const treatments = getTreatmentPlanOptions(record);
  const firstTreatment = treatments[0];
  const demand = metricRead(record, 'Demand Power');
  const perceivedValue = metricRead(record, 'Pricing Power');
  const meaningful = metricRead(record, 'Meaningful');
  const different = metricRead(record, 'Different');
  const salient = metricRead(record, 'Salient');
  const bindingConstraint = getBindingConstraint(record);
  const supporting = diagnosisEvidence.supporting.slice(0, 3);
  const caveats = diagnosisEvidence.notToConclude.slice(0, 3);

  return (
    <section className="cmo-diagnostic-brief" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="cmo-brief-title">
      <div className="cmo-brief-hero">
        <div>
          <div className="section-kicker"><Target size={14} /> CMO Diagnostic Brief</div>
          <h2 id="cmo-brief-title">{cmoBriefHeadline(record)}</h2>
          <p>{diagnosisEvidence.diagnosis.doctorRead}</p>
        </div>
        <aside>
          <span>Report role</span>
          <strong>Canonical diagnostic read</strong>
          <em>QBR and work assets should be audience-specific extracts from this fuller patient chart.</em>
        </aside>
      </div>

      <div className="cmo-answer-grid">
        <article className="cmo-answer-card primary">
          <span>01 · Leadership answer</span>
          <strong>{diagnosisEvidence.diagnosis.name}</strong>
          <p>{firstSentence(diagnosisEvidence.diagnosis.triggerSummary)}</p>
          <em>Implication: use the diagnosis to decide what to inspect and which treatment path to pressure-test.</em>
        </article>

        <article className="cmo-answer-card">
          <span>02 · Benchmark logic</span>
          <strong>{monitor.outcomeRead}</strong>
          <div className="cmo-lens-list">
            <div><b>Momentum</b><p>Headline verdict: {monitor.trajectory} outcome trajectory.</p></div>
            <div><b>Ahead / Behind</b><p>Size-adjusted check: {demand.label} {demand.ahead}; {perceivedValue.label} {perceivedValue.ahead}.</p></div>
            <div><b>Category index</b><p>Context only: {demand.label} {demand.category}; {perceivedValue.label} {perceivedValue.category}.</p></div>
          </div>
        </article>

        <article className="cmo-answer-card">
          <span>03 · Driver read</span>
          <strong>{bindingConstraint?.metric ? `${displayMetricName(bindingConstraint.metric)} is the first constraint to inspect.` : 'Driver priority needs more proof.'}</strong>
          <p>Read Demand Power with Meaningful and Salient; read Perceived Value with Meaningful and Different.</p>
          <div className="cmo-driver-strip">
            {[meaningful, salient, different].map((item) => (
              <div className={item.tone} key={item.label}>
                <b>{item.label}</b>
                <span>{item.value}</span>
                <em>{item.ahead} · {item.momentum}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="cmo-answer-card action">
          <span>04 · What to do next</span>
          <strong>{firstTreatment ? firstTreatment.name : 'Choose a proof path before action.'}</strong>
          <p>{firstTreatment ? firstSentence(firstTreatment.whyThisFits) : 'The evidence packet needs review before a treatment path is selected.'}</p>
          <em>Treatment language stays as paths to test. The brand and insights team owns the prescription decision.</em>
        </article>
      </div>

      <details className="cmo-proof-drawer">
        <summary><ShieldCheck size={15} /> Proof, caveats, and source readiness behind the brief</summary>
        <div>
          <section>
            <span>Evidence basis</span>
            <strong>{evidenceConfidence.label}</strong>
            <ul>{supporting.map((item, index) => <li key={`${item.label}-${index}`}>{item.label}: {item.statement}</li>)}</ul>
          </section>
          <section>
            <span><AlertTriangle size={13} /> What not to overclaim</span>
            <strong>Guardrails</strong>
            <ul>{caveats.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <span>Source posture</span>
            <strong>{record.period}</strong>
            <p>{evidenceConfidence.caveat}</p>
            <p>Pricing Power / Perceived Value remains broad brand-equity price justification, not SKU-level pricing guidance.</p>
          </section>
        </div>
      </details>
    </section>
  );
}

function BrandSelector({ active, setActive }: { active: BrandHealthRecord; setActive: (b: BrandHealthRecord) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const categories = ['All', ...Array.from(new Set(brandRecords.map((b) => b.category)))];
  const heatMapBrands = brandRecords.filter((b) => category === 'All' || b.category === category);
  const activeDiagnosis = getPrimaryDiagnosis(active);
  const normalizedQuery = query.trim().toLowerCase();
  const brandPickerOptions = brandRecords.filter((b) => {
    if (!normalizedQuery) return true;
    return b.brandName.toLowerCase().includes(normalizedQuery)
      || b.category.toLowerCase().includes(normalizedQuery)
      || `${b.brandName} ${b.category}`.toLowerCase().includes(normalizedQuery);
  });

  function brandOptionLabel(record: BrandHealthRecord) {
    return `${record.brandName} — ${record.category}`;
  }

  function findRecordFromValue(value: string) {
    const normalized = value.trim().toLowerCase();
    return brandRecords.find((b) => `${b.brandName} — ${b.category}`.toLowerCase() === normalized)
      ?? brandRecords.find((b) => b.brandName.toLowerCase() === normalized);
  }

  function chooseRecord(record: BrandHealthRecord) {
    setActive(record);
    setCategory(record.category);
    setQuery(brandOptionLabel(record));
    setIsPickerOpen(false);
  }

  function selectByKey(key: string) {
    const [selectedCategory, selectedBrandId] = key.split('::');
    const selected = brandRecords.find((b) => b.category === selectedCategory && b.brandId === selectedBrandId);
    if (selected) {
      chooseRecord(selected);
    }
  }

  function onQueryChange(value: string) {
    setQuery(value);
    setIsPickerOpen(true);
    const selected = findRecordFromValue(value);
    if (selected) {
      setActive(selected);
      setCategory(selected.category);
    }
  }

  return (
    <section className="finder-section" aria-labelledby="find-brand-title">
      <div className="section-kicker">
        <Search size={14} /> Find My Brand
      </div>
      <div className="finder-head">
        <div>
          <h2 id="find-brand-title">Start with one brand patient.</h2>
          <p className="muted">Select from the finite demo brand list, or expand the heat map for a quick scan.</p>
        </div>
      </div>
      <div className="brand-select-panel">
        <div className="selected-brand-summary">
          <span>Active brand</span>
          <strong>{active.brandName}</strong>
          <em>{active.category} · {active.period}</em>
          <b>{activeDiagnosis.name}</b>
        </div>
        <div className="brand-picker-controls">
          <div
            className="brand-combobox"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsPickerOpen(false);
            }}
          >
            <span>Brand picker</span>
            <div className={`brand-combobox-control ${isPickerOpen ? 'open' : ''}`}>
              <input
                aria-autocomplete="list"
                aria-controls="brand-picker-options"
                aria-expanded={isPickerOpen}
                aria-label="Brand picker"
                role="combobox"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => setIsPickerOpen(true)}
                placeholder={brandOptionLabel(active)}
              />
              <button
                type="button"
                aria-label={isPickerOpen ? 'Close brand list' : 'Open brand list'}
                onClick={() => setIsPickerOpen((open) => !open)}
              >
                <ChevronDown size={16} />
              </button>
            </div>
            {isPickerOpen && (
              <div className="brand-combobox-menu" id="brand-picker-options" role="listbox">
                {brandPickerOptions.length ? (
                  brandPickerOptions.map((b) => {
                    const d = getPrimaryDiagnosis(b);
                    const isSelected = active.brandId === b.brandId && active.category === b.category;
                    return (
                      <button
                        key={`${b.category}-${b.brandId}-picker`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={isSelected ? 'selected' : ''}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => chooseRecord(b)}
                      >
                        <strong>{b.brandName}</strong>
                        <span>{b.category} · {d.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="brand-combobox-empty">No matching brands</div>
                )}
              </div>
            )}
          </div>
          <label className="select-wrap">
            <span>Heat map filter</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
        </div>
      </div>
      <details className="brand-heatmap-drawer">
        <summary>Open brand heat map <span>{heatMapBrands.length} brand{heatMapBrands.length === 1 ? '' : 's'}</span></summary>
        <div className="brand-heatmap">
          {heatMapBrands.map((b) => {
            const d = getPrimaryDiagnosis(b);
            const isActive = active.brandId === b.brandId && active.category === b.category;
            return (
              <button
                key={`${b.category}-${b.brandId}`}
                className={`brand-heat-cell ${d.severityDefault} ${isActive ? 'active' : ''}`}
                onClick={() => selectByKey(`${b.category}::${b.brandId}`)}
                title={`${b.brandName}: ${d.name}`}
              >
                <strong>{b.brandName}</strong>
                <span>{d.name}</span>
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
}

function growthNavigatorEvidenceLabel(record: BrandHealthRecord) {
  const mode = record.growthNavigator?.evidenceMode;
  if (mode === 'measured_full_extract') return 'Measured GN extract';
  if (mode === 'measured_partial_extract') return 'Partial GN workbook';
  if (mode === 'synthetic_assumption') return 'Synthetic GN assumption';
  return record.growthNavigator ? 'GN bridge present' : 'GN bridge missing';
}

function InsightsEvidenceVisuals({ record }: { record: BrandHealthRecord }) {
  const rows = getMetricOpportunityRows(record);
  const confidence = getEvidenceConfidence(record);

  return (
    <div className="insights-viz">
      <div className="confidence-panel">
        <div>
          <span>Evidence confidence</span>
          <strong>{confidence.label}</strong>
        </div>
        <p>{confidence.caveat}</p>
        <div className="confidence-pills">
          <span>{confidence.knownBenchmarkCount}/5 benchmark reads</span>
          <span>{confidence.knownMomentumCount}/5 momentum reads</span>
          <span>{confidence.hasGnBridge ? 'GN bridge present' : 'GN bridge missing'}</span>
        </div>
      </div>
      <div className="evidence-table-wrap">
        <table className="evidence-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Benchmark</th>
              <th>Momentum</th>
              <th>Delta</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const m = metric(record, row.metric);
              const delta = getTrendDelta(record, row.metric);
              return (
                <tr key={row.metric}>
                  <td>{row.metric}</td>
                  <td>{formatMetricValue(row.value)}</td>
                  <td>{row.categoryBand} · {row.ahead}</td>
                  <td>{row.momentum}</td>
                  <td>{delta ? `${delta.delta > 0 ? '+' : ''}${formatMetricValue(delta.delta)} over ${delta.periods} waves` : 'No trend'}</td>
                  <td>{m?.wave} · slide {m?.slide}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LearnLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="learn-inline-link" href={href}>
      <BookOpen size={14} /> {children}
    </a>
  );
}

function BBEBloodworkSection({ record, mode, onFocus }: { record: BrandHealthRecord; mode: AudienceMode; onFocus: () => void }) {
  const sections = getKpiDeepDiveSections(record);

  return (
    <section className="report-section bloodwork-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="bloodwork-title">
      <div className="section-kicker">
        <Activity size={14} /> BBE Bloodwork
      </div>
      <div className="final-section-head">
        <div>
          <h2 id="bloodwork-title">The five core equity signals</h2>
          <p className="muted">Start with the BBE test results before interpreting support lenses. Demand Power and Perceived Value are the outcome signals; Salient, Meaningful, and Different explain the foundation underneath.</p>
        </div>
        <div className="learn-link-stack">
          <LearnLink href="/learn/bbe-system-one-picture">Learn the BBE system</LearnLink>
          <LearnLink href="/learn/three-benchmarks">Read the benchmarks</LearnLink>
        </div>
      </div>
      <div className="brand-context-strip">
        <div>
          <strong>Brand context</strong>
          <span>{record.brandName} · {record.category} · {record.period}</span>
        </div>
        <div>
          <strong>Active lens</strong>
          <span>{record.categoryLens.activeLens}</span>
        </div>
        <div>
          <strong>Portfolio context</strong>
          <span>{record.portfolioRole}</span>
        </div>
      </div>
      <div className="bloodwork-grid">
        {sections.map((section, index) => {
          const m = metric(record, section.id);
          return (
            <details id={metricAnchorId(section.id)} className={`bloodwork-metric ${section.tone}`} key={section.id} open={index < 2}>
              <summary>
                <div>
                  <span>{section.job}</span>
                  <strong>{displayMetricName(section.title)}</strong>
                  <em>{section.currentRead}</em>
                </div>
                <b>{section.value}</b>
                {m && (
                  <div className="chips">
                    <span className={`chip ${statusClass(m.categoryBand)}`}>{m.categoryBand}</span>
                    <span className={`chip ${statusClass(m.ahead)}`}>{m.ahead}</span>
                    <span className={`chip ${statusClass(m.momentum)}`}>{m.momentum}</span>
                  </div>
                )}
              </summary>
              <div className="bloodwork-detail">
                <div>
                  <h4>How to read it</h4>
                  <p>{section.howToRead}</p>
                  {section.id === 'Pricing Power' && <LearnLink href="/learn/pricing-power-guardrail">Learn the Perceived Value guardrail</LearnLink>}
                </div>
                <div>
                  <h4>Evidence</h4>
                  <ul>{section.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>Watch next</h4>
                  <ul>{section.watchNext.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h4>Prescription connection</h4>
                  {section.treatmentPaths.length ? section.treatmentPaths.slice(0, 2).map((path) => (
                    <p key={`${section.id}-${path.name}`}><strong>{path.name}:</strong> {path.whyItFits}</p>
                  )) : <p>No direct treatment link for this metric. Treat as supporting evidence.</p>}
                </div>
              </div>
            </details>
          );
        })}
      </div>
      {mode === 'insights' && <InsightsEvidenceVisuals record={record} />}
    </section>
  );
}

function DiagnosisEvidenceSection({
  record,
  mode,
  onFocus,
  onOpenTrace
}: {
  record: BrandHealthRecord;
  mode: AudienceMode;
  onFocus: () => void;
  onOpenTrace: () => void;
}) {
  const evidence = getDiagnosisEvidence(record);
  const supporting = mode === 'brand' ? evidence.supporting.slice(0, 4) : evidence.supporting;
  const complicating = mode === 'brand' ? evidence.complicating.slice(0, 4) : evidence.complicating;

  return (
    <section className="report-section diagnosis-evidence-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="diagnosis-evidence-title">
      <div className="section-kicker">
        <Stethoscope size={14} /> Diagnosis And Evidence
      </div>
      <div className="report-topline">
        <div>
          <h2 id="diagnosis-evidence-title">{evidence.diagnosis.name}</h2>
          <p>{evidence.diagnosis.plainEnglishDefinition}</p>
        </div>
        <div className="diagnosis-actions">
          <div className="diagnosis-badge">{evidence.diagnosis.severityDefault}</div>
          <TraceButton onOpenTrace={onOpenTrace} />
        </div>
      </div>
      <div className="doctor-read">
        <strong>Doctor read:</strong> {evidence.diagnosis.doctorRead}
      </div>
      <div className="learn-row">
        <LearnLink href="/learn/brand-doctor-workflow">Learn how diagnosis rules work</LearnLink>
        {evidence.supporting.some((item) => item.label === 'Pricing Power') && <LearnLink href="/learn/pricing-power-guardrail">Review Perceived Value limits</LearnLink>}
      </div>
      <div className="diagnosis-explain">
        <div>
          <h3>What it means</h3>
          <p>{evidence.diagnosis.triggerSummary}</p>
        </div>
        <div>
          <h3>Why it matters</h3>
          <p>{treatmentFamilySentence(evidence.diagnosis.primaryTreatmentFamilies)}</p>
        </div>
      </div>
      <div className="evidence-grid">
        <div>
          <h3>Supporting evidence</h3>
          <ul className="evidence-list">
            {supporting.map((item, index) => (
              <li key={`${item.label}-${item.slide}-${index}`}>
                <strong>{item.label}</strong>
                <span>{item.statement}</span>
                <em>{item.wave} · slide {item.slide}</em>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>What complicates it</h3>
          <ul className="evidence-list">
            {complicating.length ? complicating.map((item, index) => (
              <li key={`${item.label}-${item.statement}-${index}`}>
                <strong>{item.label}</strong>
                <span>{item.statement}</span>
                <em>{item.wave} · {item.slide}</em>
              </li>
            )) : <li><strong>No material counter-signal</strong><span>No material counter-signal found in the active packet.</span></li>}
          </ul>
        </div>
      </div>
      <div className="not-conclude-panel">
        <h3>What not to conclude</h3>
        <ul>{evidence.notToConclude.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      {mode === 'insights' && <div className="insights-box">Configured rule summary: {evidence.ruleSummary}</div>}
    </section>
  );
}

function ExplanationLensesSection({
  record,
  mode,
  sourcePacket,
  onFocus
}: {
  record: BrandHealthRecord;
  mode: AudienceMode;
  sourcePacket?: MentalAvailabilitySourcePacket;
  onFocus: () => void;
}) {
  const monitor = getMomentumMonitor(record);
  const vitals = getGrowthNavigatorVitals(record);
  const growthRead = getGrowthAvailabilityRecord(record);
  const mentalRead = getMentalAvailabilityRecord(record, sourcePacket);
  const bindingConstraint = getBindingConstraint(record);
  const topVital = vitals.find((vital) => vital.status !== 'missing') ?? vitals[0];

  return (
    <section className="report-section explanation-lenses-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="lenses-title">
      <div className="section-kicker">
        <Brain size={14} /> Explanation Lenses
      </div>
      <div className="final-section-head">
        <div>
          <h2 id="lenses-title">What might explain, complicate, or action the BBE read?</h2>
          <p className="muted">These lenses support the BBE diagnosis. They help identify what to investigate next; they do not replace the diagnosis engine.</p>
        </div>
        <LearnLink href="/learn/connecting-bbe-to-action">Learn how BBE connects to action</LearnLink>
      </div>
      <div className="lens-summary-grid">
        <details className={`lens-summary ${monitor.outcomeTone}`} open>
          <summary>
            <span>Momentum</span>
            <strong>{monitor.outcomeRead}</strong>
            <em>{monitor.currentStrength} today · {monitor.trajectory} trajectory</em>
          </summary>
          <p>{monitor.principle}</p>
          <div className="lens-mini-grid">
            {monitor.metrics.slice(0, mode === 'brand' ? 3 : 5).map((item) => (
              <div key={item.metric}>
                <strong>{displayMetricName(item.metric)}</strong>
                <span>{item.value} · {item.strength} · {item.momentum}</span>
              </div>
            ))}
          </div>
          <LearnLink href="/learn/momentum-ambition">Learn why Momentum matters</LearnLink>
        </details>
        <details className="lens-summary watch">
          <summary>
            <span>Root cause</span>
            <strong>{bindingConstraint?.metric ?? 'Constraint unclear'}</strong>
            <em>{bindingConstraint ? `${bindingConstraint.categoryBand} · ${bindingConstraint.ahead}` : 'Need more BBE evidence'}</em>
          </summary>
          <div className="root-map compact">
            {['Demand Power', 'Pricing Power', 'Salient', 'Meaningful', 'Different'].map((name) => (
              <div className={`root-node ${name.includes('Power') ? 'output' : 'input'}`} key={name}>
                <span>{displayMetricName(name)}</span>
                <strong>{formatMetricValue(metric(record, name)?.value)}</strong>
              </div>
            ))}
          </div>
          <LearnLink href="/learn/bbe-system-one-picture">Learn the BBE pathway</LearnLink>
        </details>
        <details className={`lens-summary ${topVital.tone}`}>
          <summary>
            <span>Growth Navigator</span>
            <strong>{record.growthNavigator ? topVital.label : 'GN bridge missing'}</strong>
            <em>{record.growthNavigator ? growthNavigatorEvidenceLabel(record) : 'support lens gap'}</em>
          </summary>
          <p>{topVital.description}</p>
          <ul>{topVital.keySignals.slice(0, mode === 'brand' ? 2 : 4).map((signal) => <li key={signal}>{signal}</li>)}</ul>
          <LearnLink href="/learn/growth-navigator-connection">Learn the GN bridge</LearnLink>
        </details>
        <details className={`lens-summary ${mentalRead.simulated ? 'watch' : 'good'}`}>
          <summary>
            <span>Mental Availability / CEPs</span>
            <strong>{mentalRead.topline.label}</strong>
            <em>{mentalRead.evidenceMode.replaceAll('_', ' ')}</em>
          </summary>
          <p>{mentalRead.topline.read}</p>
          <div className="lens-mini-grid">
            {mentalRead.measures.slice(0, 4).map((measure) => (
              <div key={measure.id}>
                <strong>{measure.label}</strong>
                <span>{measure.displayValue}</span>
              </div>
            ))}
          </div>
          <span className="lens-caveat">CEP evidence is a memory-structure lens, not proof of cannibalization or substitution.</span>
        </details>
        <details className={`lens-summary ${growthRead.simulated ? 'watch' : 'good'}`}>
          <summary>
            <span>Growth Availability</span>
            <strong>{growthRead.growthConstraint.label}</strong>
            <em>{growthRead.simulated ? 'simulated support evidence' : growthRead.evidenceMode.replaceAll('_', ' ')}</em>
          </summary>
          <p>{growthRead.growthConstraint.read}</p>
          <div className="lens-mini-grid">
            {growthRead.pillars.slice(0, mode === 'brand' ? 3 : 6).map((pillar) => (
              <div key={pillar.id}>
                <strong>{pillar.shortTitle}</strong>
                <span>{pillar.status.replaceAll('_', ' ')}</span>
              </div>
            ))}
          </div>
          <span className="lens-caveat">{growthRead.growthConstraint.nextQuestion}</span>
        </details>
      </div>
    </section>
  );
}

function TreatmentPathToTestSection({ record, onFocus }: { record: BrandHealthRecord; onFocus: () => void }) {
  const diagnosis = getPrimaryDiagnosis(record);
  const options = useMemo(() => getTreatmentPlanOptions(record), [record]);
  const [selectedId, setSelectedId] = useState(options[0]?.treatmentId ?? '');
  const selected = options.find((option) => option.treatmentId === selectedId) ?? options[0];
  const draft = getTreatmentPlanDraft(record, selected ? [selected.treatmentId] : []);
  const signals = getFollowUpSignals(record);
  const roadmap = getStrategicRoadmap(record, selected ? [selected.treatmentId] : []);

  useEffect(() => {
    setSelectedId(options[0]?.treatmentId ?? '');
  }, [options, record]);

  useEffect(() => {
    function handleLiveConsultSelection(event: Event) {
      const rank = Number((event as CustomEvent<{ rank?: number }>).detail?.rank ?? 1);
      const picked = options[Math.max(0, rank - 1)];
      if (picked) setSelectedId(picked.treatmentId);
    }

    window.addEventListener('live-consult-select-treatment', handleLiveConsultSelection);
    return () => window.removeEventListener('live-consult-select-treatment', handleLiveConsultSelection);
  }, [options]);

  if (!selected) {
    return (
      <section className="report-section treatment-path-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="treatment-path-title">
        <div className="section-kicker"><Pill size={14} /> Treatment Path To Test</div>
        <h2 id="treatment-path-title">No governed treatment path is linked yet</h2>
        <p className="muted">The diagnosis needs expert review before action planning.</p>
      </section>
    );
  }

  return (
    <section className="report-section treatment-path-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="treatment-path-title">
      <div className="section-kicker">
        <Pill size={14} /> Treatment Path To Test
      </div>
      <div className="prescription-topline">
        <div>
          <h2 id="treatment-path-title">{selected.name}</h2>
          <p className="muted">{selected.whyThisFits}</p>
        </div>
        <div className="prescription-status">
          <span>{diagnosis.name}</span>
          <strong>Fit {Math.round(selected.score)}</strong>
        </div>
      </div>
      <div className="learn-row">
        <LearnLink href="/learn/connecting-bbe-to-action">Learn how BBE moves to action</LearnLink>
        <LearnLink href="/learn/brand-doctor-workflow">Review the workflow</LearnLink>
      </div>
      <div className="treatment-focus-grid">
        <div className="treatment-focus-main">
          <span>{selected.tier} · {selected.family}</span>
          <h3>First path to pressure-test</h3>
          <p>{draft.objective}</p>
          <div className="treatment-rank-reasons">
            {selected.rankReasons.map((reason) => <em key={reason}>{reason}</em>)}
            {selected.foundationFirst && <em>Foundation-first path</em>}
          </div>
        </div>
        <div>
          <h3>Required proof</h3>
          <ul>{selected.dependencies.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h3>Follow-up signals</h3>
          <ul>{selected.followUpSignals.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <h3>Would challenge the plan</h3>
          <ul>{signals.falsify.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      <details className="treatment-detail-drawer">
        <summary>Compare other treatment paths and roadmap detail</summary>
        <div className="treatment-compare-grid">
          {options.slice(0, 4).map((option) => (
            <button
              key={option.treatmentId}
              type="button"
              className={option.treatmentId === selected.treatmentId ? 'selected' : ''}
              onClick={() => setSelectedId(option.treatmentId)}
            >
              <span>{option.tier} · fit {Math.round(option.score)}</span>
              <strong>{option.name}</strong>
              <em>{option.whenNotToUse}</em>
            </button>
          ))}
        </div>
        <div className="roadmap-compact">
          {roadmap.phases.slice(0, 3).map((phase) => (
            <article key={`${phase.phase}-${phase.horizon}`}>
              <span>{phase.horizon}</span>
              <strong>{phase.phase}</strong>
              <p>{phase.objective}</p>
            </article>
          ))}
        </div>
      </details>
      <div className="pattern-caveat">Treatments are paths to consider and test. The human brand and insights team owns the prescription decision.</div>
    </section>
  );
}

function PatternRadarSection({
  record,
  mode,
  sourcePacket,
  onFocus
}: {
  record: BrandHealthRecord;
  mode: AudienceMode;
  sourcePacket?: MentalAvailabilitySourcePacket;
  onFocus: () => void;
}) {
  const radar = getPatternRadarRecord(record, sourcePacket);
  const brandNameById = (brandId: string) => brandRecords.find((item) => item.brandId === brandId)?.brandName ?? brandId;

  return (
    <section className="report-section pattern-radar-section" onMouseEnter={onFocus} onFocus={onFocus} aria-labelledby="pattern-radar-title">
      <div className="section-kicker">
        <Signal size={14} /> Pattern Radar
      </div>
      <div className="pattern-radar-topline">
        <div>
          <h2 id="pattern-radar-title">{radar.topline.patternLabel}</h2>
          <p className="muted">{radar.topline.read}</p>
        </div>
        <div className="pattern-radar-proof">
          <span>Portfolio graph</span>
          <strong>{radar.topline.confidence}</strong>
          <em>{radar.graph.nodes.length} nodes · {radar.graph.edges.length} edges</em>
        </div>
      </div>
      <div className="pattern-radar-stat-row">
        <div>
          <span>Similar brands</span>
          <strong>{radar.topline.similarBrandCount}</strong>
        </div>
        <div>
          <span>Material gaps</span>
          <strong>{radar.topline.materialGapCount}</strong>
        </div>
        <div>
          <span>Caveat</span>
          <strong>Associative</strong>
        </div>
      </div>
      <div className="pattern-caveat">{radar.topline.caveat}</div>

      <div className="fingerprint-panel">
        <div className="fingerprint-heading">
          <h3>Active symptom fingerprint</h3>
          <span>BBE-led pattern, enriched by support-lens coverage and treatment pull</span>
        </div>
        <div className="fingerprint-grid">
          <div>
            <span>Equity shape</span>
            <strong>{radar.fingerprint.equityShape}</strong>
          </div>
          <div>
            <span>Trajectory</span>
            <strong>{radar.fingerprint.trajectory}</strong>
          </div>
          <div>
            <span>Support lenses</span>
            <strong>{radar.fingerprint.supportLensCoverage}</strong>
          </div>
          <div>
            <span>Treatment pull</span>
            <strong>{radar.fingerprint.treatmentPull.join(', ') || 'No governed treatment pull'}</strong>
          </div>
        </div>
        <div className="fingerprint-blockers">
          <strong>Confidence blockers</strong>
          {(radar.fingerprint.blockers.length ? radar.fingerprint.blockers : ['No material blocker found in the active packet.']).map((blocker) => (
            <span key={blocker}>{blocker}</span>
          ))}
        </div>
      </div>

      {mode === 'brand' ? (
        <div className="pattern-manager-cue">
          <div>
            <strong>Portfolio context is ready for review</strong>
            <span>Switch to Insights Lead mode to inspect similar brands, evidence gaps, and treatment memory behind this portfolio pattern.</span>
          </div>
          <div className="pattern-mini-list">
            {radar.similarBrands.slice(0, 2).map((match) => (
              <a key={match.brandId} href={`/brand/${match.brandId}`}>
                {match.brandName}
                <span>{match.strength} similarity</span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="pattern-similar-block">
            <div className="fingerprint-heading">
              <h3>Brands that look like this</h3>
              <span>Similarity is calculated from BBE symptoms, support-lens availability, and treatment pull.</span>
            </div>
            <div className="similar-brand-list">
              {radar.similarBrands.length ? radar.similarBrands.map((match) => (
                <article className="similar-brand-card" key={match.brandId}>
                  <div className="similar-brand-head">
                    <div>
                      <span>{match.category}</span>
                      <strong>{match.brandName}</strong>
                    </div>
                    <em>{match.strength} · {match.score}</em>
                  </div>
                  <p>{match.diagnosisName}</p>
                  <ul>
                    {match.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                  <div className="similar-difference">
                    <strong>Key difference</strong>
                    <span>{match.keyDifference}</span>
                  </div>
                  <div className="similar-actions">
                    <a href={`/brand/${match.brandId}`}>Open brand</a>
                    <span>{match.caveat}</span>
                  </div>
                </article>
              )) : (
                <div className="pattern-empty">No strong portfolio analogies found in the current demo packet.</div>
              )}
            </div>
          </div>

          <div className="portfolio-pattern-grid">
            <div className="fingerprint-heading">
              <h3>Emerging portfolio patterns</h3>
              <span>Repeated patterns are prompts for investigation, not causal claims.</span>
            </div>
            {radar.emergingPatterns.map((pattern) => (
              <article className="portfolio-pattern-card" key={pattern.id}>
                <div>
                  <span>{pattern.matchedBrandIds.length} matched brand{pattern.matchedBrandIds.length === 1 ? '' : 's'}</span>
                  <h4>{pattern.name}</h4>
                  <p>{pattern.definition}</p>
                </div>
                <div className="pattern-evidence-list">
                  <strong>Evidence basis</strong>
                  {pattern.evidenceBasis.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="pattern-brand-pills">
                  {pattern.matchedBrandIds.slice(0, 6).map((brandId) => <span key={brandId}>{brandNameById(brandId)}</span>)}
                </div>
                <div className="pattern-next">
                  <strong>Investigate next</strong>
                  <span>{pattern.investigateNext}</span>
                </div>
                <div className="pattern-caveat small">{pattern.guardrail}</div>
              </article>
            ))}
          </div>

          <div className="evidence-gap-map">
            <div className="fingerprint-heading">
              <h3>Evidence gap map</h3>
              <span>What to request, validate, or connect before locking action.</span>
            </div>
            <div className="gap-list">
              {radar.evidenceGaps.map((gap) => (
                <article className={`gap-card ${gap.decisionRisk.toLowerCase()}`} key={gap.id}>
                  <div className="gap-card-head">
                    <div>
                      <span>{gap.decisionRisk} decision risk</span>
                      <strong>{gap.label}</strong>
                    </div>
                    <em>{gap.affectedBrandIds.length} brand{gap.affectedBrandIds.length === 1 ? '' : 's'}</em>
                  </div>
                  <p>{gap.whyItMatters}</p>
                  <div className="gap-meta">
                    <span>Next source: {gap.nextSource}</span>
                    <span>Owner: {gap.ownerCandidate}</span>
                  </div>
                  <div className="pattern-brand-pills">
                    {gap.affectedBrandIds.slice(0, 6).map((brandId) => <span key={brandId}>{brandNameById(brandId)}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="treatment-memory">
            <div className="fingerprint-heading">
              <h3>Treatment memory</h3>
              <span>Commonly considered for this pattern. Not outcome-validated yet.</span>
            </div>
            <div className="treatment-memory-grid">
              {radar.treatmentMemory.map((item) => (
                <article className="treatment-memory-card" key={item.treatmentId}>
                  <span>{item.family}</span>
                  <h4>{item.treatmentName}</h4>
                  <p>{item.whyItAppears}</p>
                  <div>
                    <strong>Required proof</strong>
                    {item.requiredEvidence.map((proof) => <em key={proof}>{proof}</em>)}
                  </div>
                  <div>
                    <strong>Follow-up signals</strong>
                    {item.followUpSignals.slice(0, 3).map((signal) => <em key={signal}>{signal}</em>)}
                  </div>
                  <div className="pattern-caveat small">{item.contraindication}</div>
                </article>
              ))}
            </div>
          </div>

          <div className="pattern-future-row">
            {radar.sourceContradictions.map((item) => (
              <div key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.read}</span>
              </div>
            ))}
            {radar.precursorWatch.map((item) => (
              <div key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.read} {item.caveat}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function TraceButton({ onOpenTrace }: { onOpenTrace: () => void }) {
  return (
    <button type="button" className="trace-button" onClick={onOpenTrace}>
      <ClipboardList size={15} /> Rule & Evidence Trace
    </button>
  );
}

function RuleTraceDrawer({
  record,
  open,
  onClose
}: {
  record: BrandHealthRecord;
  open: boolean;
  onClose: () => void;
}) {
  const trace = useMemo(() => getDiagnosisRuleTrace(record), [record]);
  if (!open) return null;

  const primaryConditions = trace.primaryRule.conditions.filter((condition) => condition.group !== 'counter');
  const counterConditions = trace.primaryRule.conditions.filter((condition) => condition.group === 'counter');

  return (
    <div className="trace-overlay" role="dialog" aria-modal="true" aria-labelledby="trace-title">
      <div className="trace-backdrop" onClick={onClose} />
      <aside className="trace-drawer">
        <div className="trace-header">
          <div>
            <div className="section-kicker"><ClipboardList size={14} /> Rule & Evidence Trace</div>
            <h2 id="trace-title">{trace.brandName}: {trace.primaryRule.diagnosisName}</h2>
            <p>Read-only prototype trace showing how the deterministic diagnosis system reached this result.</p>
          </div>
          <button type="button" className="trace-close" onClick={onClose} aria-label="Close rule trace">
            <X size={18} />
          </button>
        </div>

        <div className="trace-system-note">
          {trace.systemPrinciples.map((principle) => <span key={principle}>{principle}</span>)}
        </div>

        <div className="trace-summary-grid">
          <div>
            <span>Primary rule</span>
            <strong>{trace.primaryRule.ruleId}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{trace.primaryRule.confidence ?? 'Not fired'}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{trace.primaryRule.score ?? 'n/a'}</strong>
          </div>
          <div>
            <span>Matched</span>
            <strong>{trace.primaryRule.matchedConditionCount}/{trace.primaryRule.totalConditionCount}</strong>
          </div>
          <div>
            <span>Seeded diagnosis</span>
            <strong>{trace.seededDiagnosisId ?? 'none'}</strong>
          </div>
          <div>
            <span>Fallback used</span>
            <strong>{trace.fallbackUsed ? 'Yes' : 'No'}</strong>
          </div>
        </div>

        <section className="trace-block">
          <h3>Why this rule fired</h3>
          <p>{trace.primaryRule.evidenceSummary}</p>
          <div className="trace-rule-card primary">
            <div className="trace-rule-head">
              <div>
                <strong>{trace.primaryRule.diagnosisName}</strong>
                <span>{trace.primaryRule.description}</span>
              </div>
              <em>priority {trace.primaryRule.priority} · {trace.primaryRule.severity}</em>
            </div>
          </div>
        </section>

        <section className="trace-block">
          <h3>Configured conditions and actual values</h3>
          <div className="trace-condition-list">
            {primaryConditions.map((condition) => (
              <article className={`trace-condition ${condition.matched ? 'matched' : 'missed'}`} key={`${condition.group}-${condition.metric}-${condition.field}-${condition.operator}`}>
                <div>
                  <strong>{condition.metric}</strong>
                  <span>{condition.group.toUpperCase()} · {condition.field} {condition.operator} {condition.expected}</span>
                </div>
                <div>
                  <b>{condition.matched ? 'Matched' : 'Not matched'}</b>
                  <span>Actual: {condition.actual}</span>
                </div>
                <p>{condition.matched ? condition.evidence : condition.missingEvidence ?? condition.evidence}</p>
                <em>{condition.wave} · slide {condition.slide} · {condition.source}</em>
              </article>
            ))}
          </div>
        </section>

        <section className="trace-block">
          <h3>Counter-evidence and missing evidence</h3>
          <div className="trace-condition-list compact">
            {counterConditions.length ? counterConditions.map((condition) => (
              <article className={`trace-condition ${condition.matched ? 'missed' : 'neutral'}`} key={`${condition.metric}-${condition.field}-${condition.operator}-counter`}>
                <div>
                  <strong>{condition.metric}</strong>
                  <span>COUNTER · {condition.field} {condition.operator} {condition.expected}</span>
                </div>
                <div>
                  <b>{condition.matched ? 'Complicates' : 'Not present'}</b>
                  <span>Actual: {condition.actual}</span>
                </div>
                <p>{condition.evidence}</p>
                <em>{condition.wave} · slide {condition.slide}</em>
              </article>
            )) : <p className="trace-empty">No counter-evidence conditions are configured for this rule.</p>}
          </div>
        </section>

        <section className="trace-block">
          <h3>Other rules evaluated</h3>
          <div className="trace-candidate-grid">
            {trace.allRules.map((rule) => (
              <article className={`trace-rule-card ${rule.fired ? 'fired' : ''}`} key={rule.ruleId}>
                <div className="trace-rule-head">
                  <div>
                    <strong>{rule.diagnosisName}</strong>
                    <span>{rule.ruleId}</span>
                  </div>
                  <em>{rule.fired ? `fired · score ${rule.score}` : 'did not fire'}</em>
                </div>
                <p>{rule.evidenceSummary}</p>
                <small>{rule.matchedConditionCount}/{rule.totalConditionCount} diagnostic conditions matched · priority {rule.priority}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="trace-block">
          <h3>Treatment links from this diagnosis</h3>
          <div className="trace-link-list">
            {trace.treatmentLinks.map((link) => (
              <article key={`${link.treatmentId}-${link.priority}`}>
                <strong>{link.name}</strong>
                <span>priority {link.priority} · {link.tier} · {link.family}</span>
                <p>{link.whyThisFits}</p>
                <em>{link.whenNotToUse}</em>
              </article>
            ))}
          </div>
        </section>

        <section className="trace-block">
          <h3>Guardrails, lens, and source limits</h3>
          <div className="trace-guardrail-grid">
            <div>
              <strong>Category lens</strong>
              <p>{trace.categoryLens.activeLens}</p>
              <ul>{trace.categoryLens.knownBlindSpots.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong>Perceived Value guardrail</strong>
              <p>{trace.pricingGuardrail.requiredLanguage}</p>
              <ul>{trace.pricingGuardrail.notValidFor.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong>Source files</strong>
              <ul>{trace.sourceFiles.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong>Prototype notes</strong>
              <ul>{trace.prototypeNotes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function DataChat({
  record,
  mode,
  activeVisual,
  personaId,
  setPersonaId,
  onOpenRuleTrace,
  onVisualAction,
  mentalAvailabilitySourcePacket
}: {
  record: BrandHealthRecord;
  mode: AudienceMode;
  activeVisual: ActiveVisual;
  personaId: string;
  setPersonaId: (personaId: string) => void;
  onOpenRuleTrace: () => void;
  onVisualAction: (visual: ActiveVisual) => void;
  mentalAvailabilitySourcePacket?: MentalAvailabilitySourcePacket;
}) {
  const selectedPersona = aiPersonas.find((persona) => persona.id === personaId) ?? aiPersonas[0];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: `Ask about ${record.brandName}'s diagnosis, evidence, root cause, treatment options, or follow-up signals. Persona: ${selectedPersona.name}.` }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [useGovernedRuntime, setUseGovernedRuntime] = useState(false);
  const questions = getDialogQuestions(visualToQuestionScope[activeVisual]).slice(0, 4);

  useEffect(() => {
    const possessive = record.brandName.endsWith('s') ? `${record.brandName}'` : `${record.brandName}'s`;
    setMessages([
      { role: 'assistant', text: `Ask about ${possessive} diagnosis, evidence, root cause, treatment options, or follow-up signals. I’ll answer as ${selectedPersona.name}.` }
    ]);
    setIsThinking(false);
    setThinkingStep(0);
  }, [record, selectedPersona.name]);

  useEffect(() => {
    if (!isThinking) return;

    setThinkingStep(0);
    const interval = window.setInterval(() => {
      setThinkingStep((step) => Math.min(step + 1, thinkingSteps.length - 1));
    }, 1200);

    return () => window.clearInterval(interval);
  }, [isThinking]);

  function executeChatAction(actionId: string) {
    const action = findLiveConsultAction(actionId);
    if (!action) return;

    const nextVisual = actionVisualMap[actionId];
    if (nextVisual) onVisualAction(nextVisual);

    if (action.type === 'open_rule_trace') {
      onOpenRuleTrace();
      window.setTimeout(() => scrollToReportElement(liveConsultActionTargetIds(action)), 80);
      return;
    }

    if (action.type === 'select_treatment_path') {
      window.dispatchEvent(new CustomEvent('live-consult-select-treatment', { detail: { rank: action.targetRank ?? 1 } }));
    }

    scrollToReportElement(liveConsultActionTargetIds(action));
  }

  async function ask(question: string) {
    if (!question.trim() || isThinking) return;
    const actionId = inferLiveConsultActionIdFromQuestion(question);
    const action = actionId ? findLiveConsultAction(actionId) : undefined;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          brandId: record.brandId,
          category: record.category,
          mode,
          activeVisual,
          personaId,
          useSkillRouter: useGovernedRuntime,
          sessionId: useGovernedRuntime ? `brand-report-chat-${record.brandId}` : undefined,
          mentalAvailabilitySourcePacket
        })
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: data.answer,
          source: data.source,
          proof: governedChatProofFromResponse(data),
          actionId: action?.id,
          actionLabel: action?.label
        }
      ]);
      if (action) window.setTimeout(() => executeChatAction(action.id), 120);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: 'I could not reach the chat service. The brand record and diagnosis panels are still available on this page.'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <aside className="chat-panel" aria-label="Dialog With Data">
      <div className="section-kicker">
        <MessageSquareText size={14} /> Dialog With Data
      </div>
      <div className="chat-context">
          Scoped to {record.brandName} · {record.category} · {activeVisualDisplayName(activeVisual)}
      </div>
      <div className="persona-control">
        <label htmlFor="ai-persona">AI persona</label>
        <select
          id="ai-persona"
          value={selectedPersona.id}
          onChange={(event) => setPersonaId(event.target.value)}
          disabled={isThinking}
        >
          {aiPersonas.map((persona) => (
            <option key={persona.id} value={persona.id}>{persona.name}</option>
          ))}
        </select>
        <p>{selectedPersona.description}</p>
        <div className="persona-fit">
          {selectedPersona.bestFor.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
        </div>
        <button
          type="button"
          className={`runtime-toggle ${useGovernedRuntime ? 'active' : ''}`}
          onClick={() => setUseGovernedRuntime((current) => !current)}
          disabled={isThinking}
          aria-pressed={useGovernedRuntime}
        >
          <BadgeCheck size={14} /> {useGovernedRuntime ? 'Governed runtime' : 'Scoped chat'}
        </button>
      </div>
      <div className="suggested">
        {questions.map((q) => (
          <button key={q.question} onClick={() => ask(q.question)} disabled={isThinking}>
            {q.question}
          </button>
        ))}
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={`${m.role}-${i}`} className={`msg ${m.role}`}>
            {m.role === 'assistant' ? <MarkdownMessage text={m.text} /> : <span>{m.text}</span>}
            {m.source && (
              <em className={`msg-source ${m.source}`}>
                {chatSourceLabel(m.source)}
              </em>
            )}
            <GovernedProofStrip proof={m.proof} />
            {m.actionId && m.actionLabel && (
              <button type="button" className="msg-action" onClick={() => executeChatAction(m.actionId!)}>
                <Navigation size={13} /> {m.actionLabel}
              </button>
            )}
          </div>
        ))}
        {isThinking && <ThinkingMessage step={thinkingSteps[thinkingStep]} />}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this brand..." disabled={isThinking} />
        <button disabled={isThinking}>{isThinking ? 'Working' : 'Ask'}</button>
      </form>
    </aside>
  );
}

type BrandDoctorAppProps = {
  initialBrandId?: string;
};

function findInitialBrand(initialBrandId?: string) {
  const decoded = initialBrandId ? decodeURIComponent(initialBrandId) : '';
  return brandRecords.find((b) => b.brandId === decoded || b.brandName.toLowerCase() === decoded.toLowerCase())
    ?? brandRecords.find((b) => b.brandName === "Lay's")
    ?? brandRecords[0];
}

export default function BrandDoctorApp({ initialBrandId }: BrandDoctorAppProps = {}) {
  const [active, setActive] = useState<BrandHealthRecord>(() => findInitialBrand(initialBrandId));
  const [mode, setMode] = useState<AudienceMode>('brand');
  const [personaId, setPersonaId] = useState(aiPersonas[0]?.id ?? 'brand_doctor');
  const [activeVisual, setActiveVisual] = useState<ActiveVisual>('brand_health_panel');
  const [traceOpen, setTraceOpen] = useState(false);
  const [mentalAvailabilitySourcePacket, setMentalAvailabilitySourcePacket] = useState<MentalAvailabilitySourcePacket | undefined>();
  const diagnosis = useMemo(() => getPrimaryDiagnosis(active), [active]);

  useEffect(() => {
    setActive(findInitialBrand(initialBrandId));
    setTraceOpen(false);
  }, [initialBrandId]);

  useEffect(() => {
    const refresh = () => setMentalAvailabilitySourcePacket(activeMentalAvailabilityPacket(active.brandId));
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes(`mental-availability:versions:${active.brandId}`)) refresh();
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ brandId?: string }>).detail;
      if (!detail?.brandId || detail.brandId === active.brandId) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('bbe:mental-availability-updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bbe:mental-availability-updated', onCustom);
    };
  }, [active.brandId]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="eyebrow">BBE Next for Growth · Brand Equity Diagnostic System</div>
        <h1>BBE Brand Doctor</h1>
        <p>Find your brand. Understand its equity health. Believe the diagnosis. Choose treatment paths to test.</p>
        <div className="hero-actions">
          <div className="mode-toggle" aria-label="Audience mode">
            <button className={mode === 'brand' ? 'selected' : ''} onClick={() => setMode('brand')}>
              <BadgeCheck size={16} /> Brand Manager
            </button>
            <button className={mode === 'insights' ? 'selected' : ''} onClick={() => setMode('insights')}>
              <ShieldAlert size={16} /> Insights Lead
            </button>
          </div>
          <div className="hero-action-group">
            <a className="hero-start-link" href="/start-here">
              <BookOpen size={16} /> Start Here
            </a>
            <a className="hero-start-link secondary" href="/wiki">
              <BookText size={16} /> Wiki
            </a>
            <a className="hero-start-link secondary" href="/portfolio">
              <Network size={16} /> Portfolio
            </a>
            <a className="hero-start-link secondary" href={`/brand/${active.brandId}`}>
              <ClipboardList size={16} /> Brand URL
            </a>
            <a className="hero-start-link secondary" href={`/brand/${active.brandId}/conversation`}>
              <MessageSquareText size={16} /> Conversation
            </a>
            <a className="hero-start-link secondary" href={`/brand/${active.brandId}/assistant`}>
              <Sparkles size={16} /> Assistant
            </a>
            <a className="hero-start-link secondary" href={`/brand/${active.brandId}/data`}>
              <Database size={16} /> Data
            </a>
            <div className="hero-diagnosis">{active.brandName}: {diagnosis.name}</div>
          </div>
        </div>
      </header>
      <LiveConsultPanel record={active} personaId={personaId} onOpenRuleTrace={() => setTraceOpen(true)} />

      <div className="workspace">
        <div className="main-column">
          <section className="grounding-reminder" aria-label="Start Here reminder">
            <div>
              <strong>New to BBE?</strong>
              <span>Start with the 5-minute grounding page so the diagnosis, benchmarks, and treatment language make sense.</span>
            </div>
            <a href="/start-here">Open Start Here</a>
          </section>
          <BrandSelector active={active} setActive={setActive} />
          <CmoDiagnosticBrief record={active} onFocus={() => setActiveVisual('brand_health_panel')} />
          <div className="report-frame">
            <ExecutiveSummaryCard record={active} mode={mode} personaId={personaId} onFocus={() => setActiveVisual('brand_health_panel')} />
            <BBEBloodworkSection record={active} mode={mode} onFocus={() => setActiveVisual('bloodwork')} />
            <DiagnosisEvidenceSection
              record={active}
              mode={mode}
              onFocus={() => setActiveVisual('diagnosis')}
              onOpenTrace={() => setTraceOpen(true)}
            />
            <ExplanationLensesSection
              record={active}
              mode={mode}
              sourcePacket={mentalAvailabilitySourcePacket}
              onFocus={() => setActiveVisual('explanation_lenses')}
            />
            <PatternRadarSection
              record={active}
              mode={mode}
              sourcePacket={mentalAvailabilitySourcePacket}
              onFocus={() => setActiveVisual('pattern_radar')}
            />
            <TreatmentPathToTestSection record={active} onFocus={() => setActiveVisual('plan_builder')} />
          </div>
        </div>
        <DataChat
          record={active}
          mode={mode}
          activeVisual={activeVisual}
          personaId={personaId}
          setPersonaId={setPersonaId}
          onOpenRuleTrace={() => setTraceOpen(true)}
          onVisualAction={setActiveVisual}
          mentalAvailabilitySourcePacket={mentalAvailabilitySourcePacket}
        />
      </div>
      <RuleTraceDrawer record={active} open={traceOpen} onClose={() => setTraceOpen(false)} />
    </main>
  );
}
