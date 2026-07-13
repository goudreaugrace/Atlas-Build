'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, BookText, BrainCircuit, ClipboardList, Database, FileDown, FileJson, GitBranch, Home, LineChart, Network, Pill, Search, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react';
import { formatMetricValue, getDiagnosisRuleTrace, getPatternRadarRecord, getTreatmentPlanOptions } from '@/src/lib/data';
import { getBrandDataPacket } from '@/src/lib/brand-context';
import { buildBrandIntelligencePacket, findDynamicView } from '@/src/lib/intelligence/kernel';
import KnowledgeGraphMap from '@/src/components/graph/KnowledgeGraphMap';
import {
  acceptMentalAvailabilityPacket,
  buildMentalAvailabilityImpactPreview,
  clearMentalAvailabilityVersions,
  loadMentalAvailabilityVersions,
  mentalAvailabilitySourceMapping,
  parseMentalAvailabilityImport,
  type MentalAvailabilityImportResult
} from '@/src/lib/mental-availability-ingestion';
import {
  acceptBrandStrategicContextPacket,
  buildBrandStrategicContextImpactPreview,
  clearBrandStrategicContextVersions,
  loadBrandStrategicContextVersions,
  parseBrandStrategicContextImport,
  type BrandStrategicContextAcceptedVersion,
  type BrandStrategicContextImportResult
} from '@/src/lib/intelligence/brand-strategic-context-ingestion';
import {
  acceptMomentumIntelligencePacket,
  buildMomentumIntelligenceImpactPreview,
  clearMomentumIntelligenceVersions,
  loadMomentumIntelligenceVersions,
  parseMomentumIntelligenceImport,
  type MomentumIntelligenceAcceptedVersion,
  type MomentumIntelligenceImportResult
} from '@/src/lib/intelligence/momentum-intelligence-ingestion';
import type { BrandHealthRecord, MentalAvailabilityAcceptedVersion } from '@/src/types/domain';
import type { DynamicViewDefinition, SourceClaimRecord, SourcePromotionKind, SourcePromotionRecord } from '@/src/lib/intelligence/types';

type DataTab = 'record' | 'metrics' | 'trends' | 'occasions' | 'gn' | 'mental_availability' | 'imports' | 'strategic_context' | 'momentum_intelligence' | 'benchmark_lenses' | 'chart_read' | 'executive_verdict' | 'source_readiness' | 'demographic_state' | 'provocation_questions' | 'source_claims' | 'rules' | 'treatments' | 'knowledge_graph' | 'intelligence_packet' | 'ai_packet';

const dataTabs: { id: DataTab; label: string }[] = [
  { id: 'record', label: 'Health Record' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'trends', label: 'Trends' },
  { id: 'occasions', label: 'Occasions' },
  { id: 'gn', label: 'GN' },
  { id: 'mental_availability', label: 'Mental Availability' },
  { id: 'imports', label: 'Import & Version' },
  { id: 'strategic_context', label: 'Strategic Context' },
  { id: 'momentum_intelligence', label: 'Momentum Source' },
  { id: 'benchmark_lenses', label: 'Benchmark Lenses' },
  { id: 'chart_read', label: 'Chart Read' },
  { id: 'executive_verdict', label: 'Executive Verdict' },
  { id: 'source_readiness', label: 'Source Readiness' },
  { id: 'demographic_state', label: 'Demographic State' },
  { id: 'provocation_questions', label: 'Provocation Questions' },
  { id: 'source_claims', label: 'Source Claims' },
  { id: 'rules', label: 'Rules' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'knowledge_graph', label: 'Knowledge Graph' },
  { id: 'intelligence_packet', label: 'Intelligence Packet' },
  { id: 'ai_packet', label: 'AI Packet' }
];

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="data-json">{JSON.stringify(value, null, 2)}</pre>;
}

function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  return <span className={`packet-status ${tone}`}>{label}</span>;
}

function statusTone(status: string): 'good' | 'warn' | 'bad' | 'neutral' {
  if (status === 'available') return 'good';
  if (status === 'partial') return 'warn';
  if (status === 'missing') return 'bad';
  return 'neutral';
}

function coverageTone(covered: boolean): 'good' | 'bad' {
  return covered ? 'good' : 'bad';
}

function lensTone(status: string): 'good' | 'warn' | 'bad' | 'neutral' {
  if (status === 'positive') return 'good';
  if (status === 'negative') return 'bad';
  if (status === 'mixed') return 'warn';
  return 'neutral';
}

function verdictTone(status: string): 'good' | 'warn' | 'bad' | 'neutral' {
  if (status === 'positive' || status === 'high') return 'good';
  if (status === 'vulnerable' || status === 'watch' || status === 'medium') return 'warn';
  if (status === 'gap' || status === 'low') return 'bad';
  return 'neutral';
}

function SourcePromotionRecordsPanel({
  title,
  records,
  status
}: {
  title: string;
  records: SourcePromotionRecord[];
  status: string;
}) {
  return (
    <div className="version-stack">
      <h3>{title}</h3>
      <p>{status}</p>
      {records.length ? records.map((record) => (
        <article className="data-card" key={record.id}>
          <strong>{record.sourceLabel}</strong>
          <p>{record.status.replaceAll('_', ' ')} · {record.sourceOwner ?? 'Unknown owner'} · {record.sourceDate ?? 'Unknown date'}</p>
          <em>{new Date(record.promotedAt).toLocaleString()} · {record.validationSummary}</em>
          <ul>
            <li>Canonical write enabled: {record.canonicalWriteEnabled ? 'yes' : 'no'}</li>
            <li>Runtime auto-consumption: no</li>
          </ul>
          {record.warnings.length > 0 && (
            <ul>{record.warnings.slice(0, 3).map((warning) => <li key={warning}>{warning}</li>)}</ul>
          )}
        </article>
      )) : (
        <div className="data-empty"><FileJson size={18} /> No durable reviewed-local source records for this brand yet.</div>
      )}
    </div>
  );
}

export default function BrandDataView({ record }: { record: BrandHealthRecord }) {
  const [activeTab, setActiveTab] = useState<DataTab>('metrics');
  const [versions, setVersions] = useState<MentalAvailabilityAcceptedVersion[]>([]);
  const [strategicContextVersions, setStrategicContextVersions] = useState<BrandStrategicContextAcceptedVersion[]>([]);
  const [momentumVersions, setMomentumVersions] = useState<MomentumIntelligenceAcceptedVersion[]>([]);
  const [sourcePromotionRecords, setSourcePromotionRecords] = useState<SourcePromotionRecord[]>([]);
  const [sourcePromotionStatus, setSourcePromotionStatus] = useState('Reviewed-local source records load from server JSON when available.');
  const [sourceClaimRecords, setSourceClaimRecords] = useState<SourceClaimRecord[]>([]);
  const [sourceClaimStatus, setSourceClaimStatus] = useState('Source claims load from local server JSON when available.');
  const [sourceClaimText, setSourceClaimText] = useState('');
  const [sourceClaimLabel, setSourceClaimLabel] = useState(`${record.brandName} unstructured source note`);
  const [sourceClaimResult, setSourceClaimResult] = useState<{ ok: boolean; records: SourceClaimRecord[]; error?: string } | null>(null);
  const [importText, setImportText] = useState('');
  const [importFilename, setImportFilename] = useState('mental-availability.json');
  const [importResult, setImportResult] = useState<MentalAvailabilityImportResult | null>(null);
  const [strategicContextText, setStrategicContextText] = useState('');
  const [strategicContextResult, setStrategicContextResult] = useState<BrandStrategicContextImportResult | null>(null);
  const [momentumText, setMomentumText] = useState('');
  const [momentumResult, setMomentumResult] = useState<MomentumIntelligenceImportResult | null>(null);
  const activeMentalAvailabilityPacket = versions[0]?.packet;
  const activeStrategicContextPacket = strategicContextVersions[0]?.packet;
  const activeMomentumPacket = momentumVersions[0]?.packet;
  const packet = useMemo(() => getBrandDataPacket(record, activeMentalAvailabilityPacket), [record, activeMentalAvailabilityPacket]);
  const intelligencePacket = useMemo(
    () => buildBrandIntelligencePacket(record.brandId, activeMentalAvailabilityPacket, activeStrategicContextPacket, activeMomentumPacket),
    [record.brandId, activeMentalAvailabilityPacket, activeStrategicContextPacket, activeMomentumPacket]
  );
  const recommendedViews = useMemo(
    () => intelligencePacket.recommendedViewIds
      .map((viewId) => findDynamicView(viewId))
      .filter((view): view is DynamicViewDefinition => Boolean(view)),
    [intelligencePacket.recommendedViewIds]
  );
  const trace = useMemo(() => getDiagnosisRuleTrace(record), [record]);
  const treatmentOptions = useMemo(() => getTreatmentPlanOptions(record), [record]);
  const patternRadar = useMemo(() => getPatternRadarRecord(record, activeMentalAvailabilityPacket), [record, activeMentalAvailabilityPacket]);
  const graphNodeLabelById = useMemo(
    () => new Map(patternRadar.graph.nodes.map((node) => [node.id, node.label])),
    [patternRadar.graph.nodes]
  );
  const importImpact = useMemo(
    () => importResult ? buildMentalAvailabilityImpactPreview(packet.mentalAvailability, importResult) : null,
    [packet.mentalAvailability, importResult]
  );
  const strategicContextImpact = useMemo(
    () => strategicContextResult ? buildBrandStrategicContextImpactPreview(intelligencePacket.strategicContext, strategicContextResult) : null,
    [intelligencePacket.strategicContext, strategicContextResult]
  );
  const momentumImpact = useMemo(
    () => momentumResult ? buildMomentumIntelligenceImpactPreview(intelligencePacket, momentumResult) : null,
    [intelligencePacket, momentumResult]
  );

  useEffect(() => {
    setVersions(loadMentalAvailabilityVersions(record.brandId));
    setStrategicContextVersions(loadBrandStrategicContextVersions(record.brandId));
    setMomentumVersions(loadMomentumIntelligenceVersions(record.brandId));
    setSourceClaimLabel(`${record.brandName} unstructured source note`);
    refreshSourcePromotionRecords();
    refreshSourceClaimRecords();
  }, [record.brandId]);

  function refreshVersions() {
    setVersions(loadMentalAvailabilityVersions(record.brandId));
  }

  function refreshStrategicContextVersions() {
    setStrategicContextVersions(loadBrandStrategicContextVersions(record.brandId));
  }

  function refreshMomentumVersions() {
    setMomentumVersions(loadMomentumIntelligenceVersions(record.brandId));
  }

  async function refreshSourcePromotionRecords() {
    try {
      const response = await fetch(`/api/source-packets?brandId=${encodeURIComponent(record.brandId)}`);
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? 'Unable to load source promotion records.');
      setSourcePromotionRecords(Array.isArray(result.records) ? result.records : []);
      setSourcePromotionStatus(result.persistence?.canonicalWriteEnabled === false
        ? 'Reviewed-local records loaded. Canonical source writes remain disabled.'
        : 'Reviewed-local records loaded.');
    } catch (error) {
      setSourcePromotionRecords([]);
      setSourcePromotionStatus(error instanceof Error ? error.message : 'Unable to load source promotion records.');
    }
  }

  function sourceRecordsFor(kind: SourcePromotionKind) {
    return sourcePromotionRecords.filter((sourceRecord) => sourceRecord.kind === kind);
  }

  async function refreshSourceClaimRecords() {
    try {
      const response = await fetch(`/api/source-claims?brandId=${encodeURIComponent(record.brandId)}`);
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? 'Unable to load source claim records.');
      setSourceClaimRecords(Array.isArray(result.records) ? result.records : []);
      setSourceClaimStatus(result.persistence?.canonicalFactEnabled === false && result.persistence?.runtimeAutoConsumption === false
        ? 'Local source claims loaded. Canonical facts and runtime auto-consumption remain disabled.'
        : 'Local source claims loaded.');
    } catch (error) {
      setSourceClaimRecords([]);
      setSourceClaimStatus(error instanceof Error ? error.message : 'Unable to load source claim records.');
    }
  }

  async function extractSourceClaims() {
    const response = await fetch('/api/source-claims', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        brandId: record.brandId,
        sourceText: sourceClaimText,
        sourceLabel: sourceClaimLabel,
        sourceOwner: 'local_review',
        sourceDate: new Date().toISOString().slice(0, 10),
        warnings: ['Extracted source claims are local review records only.']
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setSourceClaimResult({ ok: false, records: [], error: result.error ?? 'Source claim extraction failed.' });
      return;
    }
    const records = Array.isArray(result.records) ? result.records : [];
    setSourceClaimResult({ ok: true, records });
    setSourceClaimText('');
    await refreshSourceClaimRecords();
  }

  async function reviewSourceClaim(id: string, decision: 'accepted' | 'rejected') {
    const response = await fetch('/api/source-claims', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        decision,
        note: decision === 'accepted'
          ? 'Reviewed locally as a source claim candidate only.'
          : 'Rejected from local source claim candidate use.'
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setSourceClaimStatus(result.error ?? 'Source claim review failed.');
      return;
    }
    setSourceClaimStatus(`Source claim ${decision === 'accepted' ? 'marked reviewed candidate' : 'rejected'}. Canonical facts remain disabled.`);
    await refreshSourceClaimRecords();
  }

  function previewImport(text = importText, filename = importFilename) {
    const result = parseMentalAvailabilityImport(text, filename, record);
    setImportResult(result);
    return result;
  }

  async function loadImportFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setImportFilename(file.name);
    setImportText(text);
    previewImport(text, file.name);
  }

  function acceptImport() {
    const result = importResult ?? previewImport();
    const accepted = acceptMentalAvailabilityPacket(record, result);
    if (accepted) {
      refreshVersions();
      setImportResult({ ...result, warnings: [...result.warnings, `Accepted as ${accepted.versionId}.`] });
    }
  }

  function clearImports() {
    clearMentalAvailabilityVersions(record.brandId);
    refreshVersions();
  }

  async function recordSourcePromotionCandidate(
    kind: 'brand_strategic_context' | 'momentum_intelligence',
    packet: unknown,
    validationSummary: string,
    warnings: string[]
  ) {
    const response = await fetch('/api/source-packets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        brandId: record.brandId,
        packet,
        validationSummary,
        warnings
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? 'Source promotion review record was not persisted.');
    }
    await refreshSourcePromotionRecords();
    return result.record?.id as string | undefined;
  }

  function previewStrategicContextImport(text = strategicContextText) {
    const result = parseBrandStrategicContextImport(text, record);
    setStrategicContextResult(result);
    return result;
  }

  async function loadStrategicContextFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setStrategicContextText(text);
    previewStrategicContextImport(text);
  }

  async function acceptStrategicContextImport() {
    const result = strategicContextResult ?? previewStrategicContextImport();
    const accepted = acceptBrandStrategicContextPacket(record, result);
    if (accepted) {
      refreshStrategicContextVersions();
      try {
        const durableId = await recordSourcePromotionCandidate('brand_strategic_context', accepted.packet, result.summary, result.warnings);
        setStrategicContextResult({ ...result, warnings: [...result.warnings, `Promoted locally as ${accepted.versionId}.`, `Recorded server-side review candidate ${durableId}. Canonical source writes remain disabled.`] });
      } catch (error) {
        setStrategicContextResult({ ...result, warnings: [...result.warnings, `Promoted locally as ${accepted.versionId}.`, error instanceof Error ? error.message : 'Server-side source promotion review record failed.'] });
      }
    }
  }

  function clearStrategicContextImports() {
    clearBrandStrategicContextVersions(record.brandId);
    refreshStrategicContextVersions();
  }

  function previewMomentumImport(text = momentumText) {
    const result = parseMomentumIntelligenceImport(text, record);
    setMomentumResult(result);
    return result;
  }

  async function loadMomentumFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setMomentumText(text);
    previewMomentumImport(text);
  }

  async function acceptMomentumImport() {
    const result = momentumResult ?? previewMomentumImport();
    const accepted = acceptMomentumIntelligencePacket(record, result);
    if (accepted) {
      refreshMomentumVersions();
      try {
        const durableId = await recordSourcePromotionCandidate('momentum_intelligence', accepted.packet, result.summary, result.warnings);
        setMomentumResult({ ...result, warnings: [...result.warnings, `Promoted locally as ${accepted.versionId}.`, `Recorded server-side review candidate ${durableId}. Canonical source writes remain disabled.`] });
      } catch (error) {
        setMomentumResult({ ...result, warnings: [...result.warnings, `Promoted locally as ${accepted.versionId}.`, error instanceof Error ? error.message : 'Server-side source promotion review record failed.'] });
      }
    }
  }

  function clearMomentumImports() {
    clearMomentumIntelligenceVersions(record.brandId);
    refreshMomentumVersions();
  }

  return (
    <main className="data-page">
      <header className="data-hero">
        <div>
          <div className="section-kicker"><Database size={14} /> Brand Data View</div>
          <h1>{record.brandName} Data</h1>
          <p>{record.country} · {record.category} · {record.period} · Brand-scoped packet with global rules and libraries clearly labeled.</p>
        </div>
        <div className="conversation-actions">
          <a className="global-scope" href="/"><Home size={15} /> Home <span className="nav-scope-badge">Global</span></a>
          <a className="global-scope" href="/brands"><Search size={15} /> Brands <span className="nav-scope-badge">Global</span></a>
          <a className="global-scope" href="/portfolio"><Network size={15} /> Portfolio <span className="nav-scope-badge">Global</span></a>
          <a className="brand-scope" href={`/brand/${record.brandId}/assistant`}><Sparkles size={15} /> Assistant <span className="nav-scope-badge">Brand</span></a>
          <a className="global-scope" href="/agent-lab"><Sparkles size={15} /> Agent Lab <span className="nav-scope-badge">Global</span></a>
          <a className="global-scope" href="/start-here"><BookOpen size={15} /> Start Here <span className="nav-scope-badge">Global</span></a>
          <a className="global-scope" href="/wiki"><BookText size={15} /> Wiki <span className="nav-scope-badge">Global</span></a>
          <a className="brand-scope" href={`/brand/${record.brandId}/report`}><ClipboardList size={15} /> Report <span className="nav-scope-badge">Brand</span></a>
          <a className="brand-scope" href={`/brand/${record.brandId}/conversation`}><Stethoscope size={15} /> Conversation <span className="nav-scope-badge">Brand</span></a>
        </div>
      </header>

      <section className="data-principle">
        <ShieldAlert size={19} />
        <div>
          <strong>No Magic Data Contract</strong>
          <p>{record.brandName} data is the observed packet. Diagnosis logic, treatment definitions, learning content, and governance rules are global foundations applied to this brand.</p>
        </div>
      </section>

      <div className="data-shell">
        <nav className="data-tabs" aria-label="Data view tabs">
          {dataTabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="data-panel">
          {activeTab === 'record' && (
            <div className="data-section">
              <h2>Brand Health Record</h2>
              <JsonBlock value={packet.record} />
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="data-section">
              <h2>Core Metrics</h2>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Band</th>
                      <th>Ahead</th>
                      <th>Momentum</th>
                      <th>Wave</th>
                      <th>Slide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packet.coreMetrics.map((m) => (
                      <tr key={m.metric}>
                        <td>{m.metric}</td>
                        <td>{formatMetricValue(m.value)}</td>
                        <td>{m.categoryBand}</td>
                        <td>{m.ahead}</td>
                        <td>{m.momentum}</td>
                        <td>{m.wave}</td>
                        <td>{m.slide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="data-section">
              <h2>Trends</h2>
              <div className="data-card-grid">
                {Object.entries(packet.trends).map(([name, points]) => (
                  <article className="data-card" key={name}>
                    <div className="data-card-head"><LineChart size={16} /><strong>{name}</strong></div>
                    <ol>{points.map((point) => <li key={`${name}-${point.period}`}>{point.period}: {formatMetricValue(point.value)}</li>)}</ol>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'occasions' && (
            <div className="data-section">
              <h2>Occasions</h2>
              <div className="data-card-grid">
                {packet.occasions.map((occasion) => (
                  <article className="data-card" key={occasion.occasion}>
                    <strong>{occasion.occasion}</strong>
                    <p>Score {formatMetricValue(occasion.score)}</p>
                    <em>{occasion.source}</em>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gn' && (
            <div className="data-section">
              <h2>Growth Navigator</h2>
              {packet.growthNavigator ? <JsonBlock value={packet.growthNavigator} /> : (
                <div className="data-empty"><Pill size={18} /> No Growth Navigator extract is available for this brand packet.</div>
              )}
            </div>
          )}

          {activeTab === 'mental_availability' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Mental Availability / CEP Packet</h2>
                <span><FileJson size={14} /> {activeMentalAvailabilityPacket ? 'Accepted source active' : 'Default packet'}</span>
              </div>
              <div className="data-card-grid">
                <article className="data-card primary">
                  <strong>{packet.mentalAvailability.topline.label}</strong>
                  <p>{packet.mentalAvailability.topline.read}</p>
                  <em>{packet.mentalAvailability.evidenceMode.replaceAll('_', ' ')} · {packet.mentalAvailability.sourceLabel}</em>
                </article>
                {packet.mentalAvailability.measures.map((measure) => (
                  <article className="data-card" key={measure.id}>
                    <strong>{measure.label}</strong>
                    <p>{measure.displayValue}</p>
                    <em>{measure.evidenceMode.replaceAll('_', ' ')}</em>
                  </article>
                ))}
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CEP</th>
                      <th>Role</th>
                      <th>Priority</th>
                      <th>Relevance</th>
                      <th>Brand link</th>
                      <th>Pressure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packet.mentalAvailability.ceps.map((cep) => (
                      <tr key={cep.id}>
                        <td>{cep.name}</td>
                        <td>{cep.roleLabel}</td>
                        <td>{cep.priority}</td>
                        <td>{cep.relevance ?? 'NA'}</td>
                        <td>{cep.brandAssociation ?? 'NA'}</td>
                        <td>{cep.competitorPressure ?? 'NA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <JsonBlock value={packet.mentalAvailability} />
            </div>
          )}

          {activeTab === 'imports' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Import & Version Mental Availability</h2>
                <span><ShieldAlert size={14} /> Preview before accept</span>
              </div>
              <div className="import-guidance">
                <article>
                  <strong>{mentalAvailabilitySourceMapping.label}</strong>
                  <p>Upload a measured or inferred Mental Availability / CEP source, preview the normalized packet, then accept it as a local version for this browser session.</p>
                  <ul>{mentalAvailabilitySourceMapping.governanceRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                </article>
                <article>
                  <strong>Required fields</strong>
                  <p>{mentalAvailabilitySourceMapping.requiredPacketFields.join(', ')}</p>
                  <strong>CSV columns</strong>
                  <p>{mentalAvailabilitySourceMapping.csvColumns.map((column) => column.column).join(', ')}</p>
                </article>
              </div>
              <div className="template-downloads" aria-label="Mental Availability import templates">
                <div>
                  <strong>Team templates</strong>
                  <p>Share these with the research or insights team to show the exact source shape this prototype can ingest.</p>
                </div>
                <a href="/templates/mental-availability-template.json" download>
                  <FileDown size={16} /> JSON template
                </a>
                <a href="/templates/mental-availability-template.csv" download>
                  <FileDown size={16} /> CSV template
                </a>
              </div>
              <div className="import-workbench">
                <div className="import-editor">
                  <label>
                    <span>Upload JSON or CSV</span>
                    <input type="file" accept=".json,.csv,application/json,text/csv" onChange={(event) => loadImportFile(event.target.files?.[0])} />
                  </label>
                  <label>
                    <span>Filename / format hint</span>
                    <input value={importFilename} onChange={(event) => setImportFilename(event.target.value)} />
                  </label>
                  <label>
                    <span>Source content</span>
                    <textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Paste JSON packet or CSV rows here..." />
                  </label>
                  <div className="import-actions">
                    <button type="button" onClick={() => previewImport()} disabled={!importText.trim()}>Preview</button>
                    <button type="button" onClick={acceptImport} disabled={!importResult?.ok}>Accept version</button>
                    <button type="button" onClick={clearImports} disabled={!versions.length}>Clear local versions</button>
                  </div>
                </div>
                <div className="import-preview">
                  <h3>Validation Preview</h3>
                  {importResult ? (
                    <>
                      <div className={`import-status ${importResult.ok ? 'good' : 'bad'}`}>
                        <strong>{importResult.ok ? 'Ready to accept' : 'Needs fixes'}</strong>
                        <span>{importResult.summary}</span>
                      </div>
                      {!!importResult.errors.length && <ul className="import-errors">{importResult.errors.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {!!importResult.warnings.length && <ul className="import-warnings">{importResult.warnings.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {importImpact && (
                        <div className="impact-preview">
                          <h4>Impact Preview</h4>
                          <div className="impact-grid">
                            <div>
                              <strong>Evidence mode</strong>
                              <p>{importImpact.evidenceModeChange}</p>
                            </div>
                            <div>
                              <strong>Measures</strong>
                              <ul>{importImpact.measureChanges.map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                            <div>
                              <strong>CEP changes</strong>
                              <ul>
                                {(importImpact.addedCeps.length ? importImpact.addedCeps.map((item) => `Add ${item}`) : ['No new CEPs']).map((item) => <li key={item}>{item}</li>)}
                                {importImpact.updatedCeps.map((item) => <li key={item}>{item}</li>)}
                                {importImpact.removedCeps.map((item) => <li key={item}>Remove {item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <strong>Remaining gaps</strong>
                              <ul>{(importImpact.remainingGaps.length ? importImpact.remainingGaps : ['No major gaps named by the imported packet.']).map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                          </div>
                        </div>
                      )}
                      {importResult.packet && <JsonBlock value={importResult.packet} />}
                    </>
                  ) : (
                    <div className="data-empty"><FileJson size={18} /> Paste or upload a source to preview validation.</div>
                  )}
                </div>
              </div>
              <div className="version-stack">
                <h3>Accepted Local Versions</h3>
                {versions.length ? versions.map((version) => (
                  <article className="data-card primary" key={version.versionId}>
                    <strong>{version.versionId}</strong>
                    <p>{version.packet.period} · {version.packet.evidenceMode.replaceAll('_', ' ')} · {version.packet.ceps.length} CEPs</p>
                    <em>{new Date(version.acceptedAt).toLocaleString()} · {version.validation.summary}</em>
                  </article>
                )) : (
                  <div className="data-empty"><FileJson size={18} /> No accepted local versions yet. The report is using the default packet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'strategic_context' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Brand Strategic Context Import</h2>
                <span><ShieldAlert size={14} /> Validate · preview · promote</span>
              </div>

              <div className="import-guidance">
                <article>
                  <strong>Governed source model</strong>
                  <p>Load brand book, brand DNA, strategy brief, annual planning, or creative-brief context as data. Draft and prototype packets stay caveated; only approved source packets can remove the official Brand Strategic Context gap.</p>
                  <ul>
                    <li>Do not infer missing positioning, creative platform, objectives, or approved claims from BBE signals.</li>
                    <li>Uploaded strategy material is reviewed data, not instructions for the agent to follow blindly.</li>
                    <li>Claims and claims-not-to-make stay visible in the Intelligence Packet proof surface.</li>
                  </ul>
                </article>
                <article>
                  <strong>Current active source</strong>
                  <p>{intelligencePacket.strategicContext.sourceLabel ?? 'No accepted local source. Static prototype seed may still be shown when available.'}</p>
                  <p>{intelligencePacket.strategicContext.reviewStatus.replaceAll('_', ' ')} · {intelligencePacket.strategicContext.sourceOwner ?? 'Unknown owner'} · {intelligencePacket.strategicContext.sourceDate ?? 'Unknown date'}</p>
                </article>
              </div>

              <div className="template-downloads" aria-label="Brand Strategic Context import template">
                <div>
                  <strong>Source packet template</strong>
                  <p>Use this shape for reviewed brand books, strategy briefs, planning docs, and approved claims.</p>
                </div>
                <a href="/templates/brand-strategic-context-template.json" download>
                  <FileDown size={16} /> JSON template
                </a>
              </div>

              <div className="import-workbench">
                <div className="import-editor">
                  <label>
                    <span>Upload JSON</span>
                    <input type="file" accept=".json,application/json" onChange={(event) => loadStrategicContextFile(event.target.files?.[0])} />
                  </label>
                  <label>
                    <span>Source content</span>
                    <textarea value={strategicContextText} onChange={(event) => setStrategicContextText(event.target.value)} placeholder="Paste Brand Strategic Context JSON here..." />
                  </label>
                  <div className="import-actions">
                    <button type="button" onClick={() => previewStrategicContextImport()} disabled={!strategicContextText.trim()}>Preview</button>
                    <button type="button" onClick={acceptStrategicContextImport} disabled={!strategicContextResult?.ok}>Promote local source</button>
                    <button type="button" onClick={clearStrategicContextImports} disabled={!strategicContextVersions.length}>Clear local sources</button>
                  </div>
                </div>

                <div className="import-preview">
                  <h3>Validation Preview</h3>
                  {strategicContextResult ? (
                    <>
                      <div className={`import-status ${strategicContextResult.ok ? 'good' : 'bad'}`}>
                        <strong>{strategicContextResult.ok ? 'Ready to promote locally' : 'Needs fixes'}</strong>
                        <span>{strategicContextResult.summary}</span>
                      </div>
                      {!!strategicContextResult.errors.length && <ul className="import-errors">{strategicContextResult.errors.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {!!strategicContextResult.warnings.length && <ul className="import-warnings">{strategicContextResult.warnings.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {strategicContextImpact && (
                        <div className="impact-preview">
                          <h4>Impact Preview</h4>
                          <div className="impact-grid">
                            <div>
                              <strong>Status</strong>
                              <p>{strategicContextImpact.statusChange}</p>
                            </div>
                            <div>
                              <strong>Source</strong>
                              <p>{strategicContextImpact.sourceChange}</p>
                            </div>
                            <div>
                              <strong>Field changes</strong>
                              <ul>{strategicContextImpact.fieldChanges.map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                            <div>
                              <strong>Remaining gaps</strong>
                              <ul>{(strategicContextImpact.remainingGaps.length ? strategicContextImpact.remainingGaps : ['No major Brand Strategic Context gaps remain after this packet.']).map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                            <div>
                              <strong>Guardrails</strong>
                              <ul>{strategicContextImpact.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                          </div>
                        </div>
                      )}
                      {strategicContextResult.packet && <JsonBlock value={strategicContextResult.packet} />}
                    </>
                  ) : (
                    <div className="data-empty"><FileJson size={18} /> Paste or upload a source to preview validation.</div>
                  )}
                </div>
              </div>

              <div className="version-stack">
                <h3>Promoted Local Sources</h3>
                {strategicContextVersions.length ? strategicContextVersions.map((version) => (
                  <article className="data-card primary" key={version.versionId}>
                    <strong>{version.versionId}</strong>
                    <p>{version.packet.reviewStatus.replaceAll('_', ' ')} · {version.packet.sourceType.replaceAll('_', ' ')} · {version.packet.sourceLabel}</p>
                    <em>{new Date(version.acceptedAt).toLocaleString()} · {version.validation.summary}</em>
                  </article>
                )) : (
                  <div className="data-empty"><FileJson size={18} /> No promoted local Brand Strategic Context source yet.</div>
                )}
              </div>
              <SourcePromotionRecordsPanel
                title="Server Review Records"
                status={sourcePromotionStatus}
                records={sourceRecordsFor('brand_strategic_context')}
              />
            </div>
          )}

          {activeTab === 'momentum_intelligence' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Momentum Intelligence Source Import</h2>
                <span><ShieldAlert size={14} /> Validate · preview · promote</span>
              </div>

              <div className="import-guidance">
                <article>
                  <strong>Governed Momentum source model</strong>
                  <p>Load market context, peer-set definition, room-to-grow inputs, and SMD contribution weights as reviewed data. Directional packets stay caveated; measured extracts can support richer Momentum Intelligence reads when source-owner review is clear.</p>
                  <ul>
                    <li>Ahead/Behind remains a size-check and cannot substitute for room-to-grow inputs.</li>
                    <li>Peer context is comparative only; do not infer cannibalization, migration, or substitution.</li>
                    <li>SMD weights guide prioritization and do not prove causality without causal evidence.</li>
                  </ul>
                </article>
                <article>
                  <strong>Current active source</strong>
                  <p>{intelligencePacket.momentumSource?.sourceLabel ?? 'No accepted local source. Static prototype seed may still be shown when available.'}</p>
                  <p>{intelligencePacket.momentumSource?.evidenceMode.replaceAll('_', ' ') ?? 'missing'} · {intelligencePacket.marketContext?.market ?? 'market missing'} · {intelligencePacket.marketContext?.period ?? 'period missing'}</p>
                </article>
              </div>

              <div className="template-downloads" aria-label="Momentum Intelligence import template">
                <div>
                  <strong>Source templates</strong>
                  <p>Use the packet template for normalized Momentum sources, the single extract for combined handoffs, the extract bundle for reviewed blocks, or the source-owner file bundle when owners provide separate approved files.</p>
                </div>
                <a href="/templates/momentum-intelligence-template.json" download>
                  <FileDown size={16} /> Packet template
                </a>
                <a href="/templates/momentum-source-extract-template.json" download>
                  <FileDown size={16} /> Single extract
                </a>
                <a href="/templates/momentum-source-extract-bundle-template.json" download>
                  <FileDown size={16} /> Extract bundle
                </a>
                <a href="/templates/momentum-source-owner-file-bundle-template.json" download>
                  <FileDown size={16} /> File bundle
                </a>
              </div>

              <div className="import-workbench">
                <div className="import-editor">
                  <label>
                    <span>Upload JSON</span>
                    <input type="file" accept=".json,application/json" onChange={(event) => loadMomentumFile(event.target.files?.[0])} />
                  </label>
                  <label>
                    <span>Source content</span>
                    <textarea value={momentumText} onChange={(event) => setMomentumText(event.target.value)} placeholder="Paste Momentum Intelligence JSON here..." />
                  </label>
                  <div className="import-actions">
                    <button type="button" onClick={() => previewMomentumImport()} disabled={!momentumText.trim()}>Preview</button>
                    <button type="button" onClick={acceptMomentumImport} disabled={!momentumResult?.ok}>Promote local source</button>
                    <button type="button" onClick={clearMomentumImports} disabled={!momentumVersions.length}>Clear local sources</button>
                  </div>
                </div>

                <div className="import-preview">
                  <h3>Validation Preview</h3>
                  {momentumResult ? (
                    <>
                      <div className={`import-status ${momentumResult.ok ? 'good' : 'bad'}`}>
                        <strong>{momentumResult.ok ? 'Ready to promote locally' : 'Needs fixes'}</strong>
                        <span>{momentumResult.summary}</span>
                      </div>
                      {!!momentumResult.errors.length && <ul className="import-errors">{momentumResult.errors.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {!!momentumResult.warnings.length && <ul className="import-warnings">{momentumResult.warnings.map((item) => <li key={item}>{item}</li>)}</ul>}
                      {momentumImpact && (
                        <div className="impact-preview">
                          <h4>Impact Preview</h4>
                          <div className="impact-grid">
                            <div>
                              <strong>Source</strong>
                              <p>{momentumImpact.sourceChange}</p>
                            </div>
                            <div>
                              <strong>Coverage</strong>
                              <ul>{momentumImpact.coverageChanges.map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                            <div>
                              <strong>Room to grow</strong>
                              <p>{momentumImpact.roomToGrowChange}</p>
                            </div>
                            <div>
                              <strong>SMD weights</strong>
                              <p>{momentumImpact.smdWeightChange}</p>
                            </div>
                            <div>
                              <strong>Remaining gaps</strong>
                              <ul>{(momentumImpact.remainingGaps.length ? momentumImpact.remainingGaps : ['No major Momentum Intelligence source gaps remain after this packet.']).map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                            <div>
                              <strong>Guardrails</strong>
                              <ul>{momentumImpact.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
                            </div>
                          </div>
                        </div>
                      )}
                      {momentumResult.packet && <JsonBlock value={momentumResult.packet} />}
                    </>
                  ) : (
                    <div className="data-empty"><FileJson size={18} /> Paste or upload a Momentum source to preview validation.</div>
                  )}
                </div>
              </div>

              <div className="version-stack">
                <h3>Promoted Local Sources</h3>
                {momentumVersions.length ? momentumVersions.map((version) => (
                  <article className="data-card primary" key={version.versionId}>
                    <strong>{version.versionId}</strong>
                    <p>{version.packet.evidenceMode.replaceAll('_', ' ')} · {version.packet.marketContext?.market ?? 'market missing'} · {version.packet.sourceLabel}</p>
                    <em>{new Date(version.acceptedAt).toLocaleString()} · {version.validation.summary}</em>
                  </article>
                )) : (
                  <div className="data-empty"><FileJson size={18} /> No promoted local Momentum Intelligence source yet.</div>
                )}
              </div>
              <SourcePromotionRecordsPanel
                title="Server Review Records"
                status={sourcePromotionStatus}
                records={sourceRecordsFor('momentum_intelligence')}
              />
            </div>
          )}

          {activeTab === 'benchmark_lenses' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Benchmark Lens Explainer</h2>
                <span><ShieldAlert size={14} /> Governed output module</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.benchmarkLensExplainer.outputModuleId}</span>
                  <h3>{intelligencePacket.benchmarkLensExplainer.title}</h3>
                  <p>{intelligencePacket.benchmarkLensExplainer.headlineVerdict}</p>
                  <em>{intelligencePacket.benchmarkLensExplainer.subtitle}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.benchmarkLensExplainer.lensReads.length}</strong>
                    <span>Benchmark lenses</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.benchmarkLensExplainer.sourceSlides.length}</strong>
                    <span>Source slides</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.benchmarkLensExplainer.blockedMisreads.length}</strong>
                    <span>Blocked misreads</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.benchmarkLensExplainer.sourcePosture.canonicalUseAllowed}</strong>
                    <span>Canonical use</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <LineChart size={16} />
                  <h3>Deck logic translated into product rules</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.benchmarkLensExplainer.lensReads.map((lens) => (
                    <article className={`packet-card ${lens.status === 'negative' ? 'high' : lens.status === 'mixed' ? 'medium' : ''}`} key={lens.id}>
                      <div className="packet-card-head">
                        <strong>{lens.precedence}. {lens.label}</strong>
                        <StatusPill label={lens.status} tone={lensTone(lens.status)} />
                      </div>
                      <p>{lens.brandRead}</p>
                      <em>{lens.role.replaceAll('_', ' ')} · {lens.deckDefinition}</em>
                      <span>{lens.productRule}</span>
                      <ul>{lens.evidence.map((evidence) => <li key={`${lens.id}-${evidence}`}>{evidence}</li>)}</ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <BrainCircuit size={16} />
                  <h3>Integrated read rules</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>How to read the profile</strong>
                    <p>Momentum is the trajectory verdict, Ahead/Behind is the brand-size adjustment, and vs. Category is context. The full profile must support any strong-health language.</p>
                  </div>
                  <div>
                    <span>M/D/S and Perceived Value</span>
                    <p>{intelligencePacket.benchmarkLensExplainer.driverIntegration.join(' ')}</p>
                  </div>
                  <div>
                    <span>Next proof before pilot use</span>
                    <p>{intelligencePacket.benchmarkLensExplainer.nextProofNeeded.join(' ')}</p>
                  </div>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Blocked misreads</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.benchmarkLensExplainer.blockedMisreads.map((item) => (
                    <article className="packet-card medium" key={item.claim}>
                      <div className="packet-card-head">
                        <strong>{item.claim}</strong>
                        <StatusPill label="blocked" tone="warn" />
                      </div>
                      <p>{item.correction}</p>
                      <em>{item.source}</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Source posture</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill
                      label={intelligencePacket.benchmarkLensExplainer.sourcePosture.reviewStatus.replaceAll('_', ' ')}
                      tone={intelligencePacket.benchmarkLensExplainer.sourcePosture.canonicalUseAllowed === 'yes' ? 'good' : 'warn'}
                    />
                    <strong>{intelligencePacket.benchmarkLensExplainer.sourcePosture.title}</strong>
                    <p>{intelligencePacket.benchmarkLensExplainer.sourcePosture.read}</p>
                  </div>
                  <div>
                    <span>Source report</span>
                    <p>{intelligencePacket.benchmarkLensExplainer.sourceReportId} · slides {intelligencePacket.benchmarkLensExplainer.sourceSlides.join(', ')}</p>
                  </div>
                  <div>
                    <span>Evidence mode</span>
                    <p>{intelligencePacket.benchmarkLensExplainer.sourcePosture.evidenceMode} · canonical use {intelligencePacket.benchmarkLensExplainer.sourcePosture.canonicalUseAllowed}</p>
                  </div>
                  <div>
                    <span>Pilot promotion requirement</span>
                    <p>{intelligencePacket.benchmarkLensExplainer.sourcePosture.pilotPromotionRequirement}</p>
                  </div>
                  <ul>{intelligencePacket.benchmarkLensExplainer.sourcePosture.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Benchmark Lens Module JSON</summary>
                <JsonBlock value={intelligencePacket.benchmarkLensExplainer} />
              </details>
            </div>
          )}

          {activeTab === 'chart_read' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Chart Read</h2>
                <span><FileJson size={14} /> Source-deck evidence module</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.chartRead.outputModuleId}</span>
                  <h3>{intelligencePacket.chartRead.title}</h3>
                  <p>{intelligencePacket.chartRead.primaryChartRead.chartRead}</p>
                  <em>{intelligencePacket.chartRead.subtitle}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.chartRead.primaryChartRead.sourceSlide}</strong>
                    <span>Primary slide</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.chartRead.primaryChartRead.metricPoints.length}</strong>
                    <span>Brand points</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.chartRead.supportingChartReads.length}</strong>
                    <span>Supporting reads</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.chartRead.sourcePosture.canonicalUseAllowed}</strong>
                    <span>Canonical use</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <LineChart size={16} />
                  <h3>Primary MDS chart read</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill
                      label={intelligencePacket.chartRead.primaryChartRead.evidenceStatus.replaceAll('_', ' ')}
                      tone={intelligencePacket.chartRead.primaryChartRead.evidenceStatus === 'reconciled_chart_and_rows' ? 'good' : 'warn'}
                    />
                    <strong>{intelligencePacket.chartRead.primaryChartRead.title}</strong>
                    <p>{intelligencePacket.chartRead.primaryChartRead.chartRead}</p>
                  </div>
                  <div>
                    <span>Source status</span>
                    <p>Slide {intelligencePacket.chartRead.primaryChartRead.sourceSlide} · {intelligencePacket.chartRead.primaryChartRead.reconciliationStatus.replaceAll('_', ' ')} · {intelligencePacket.chartRead.primaryChartRead.processedMetricRows} processed rows · {intelligencePacket.chartRead.primaryChartRead.nativeChartCount} native chart payloads</p>
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.chartRead.primaryChartRead.metricPoints.map((point) => (
                      <article className={`packet-card ${point.momentum === 'declining' || point.ahead === 'not_ahead' ? 'medium' : ''}`} key={`${point.sourceSlide}-${point.metric}`}>
                        <div className="packet-card-head">
                          <strong>{point.displayLabel}</strong>
                          <StatusPill label={point.ahead.replaceAll('_', ' ')} tone={point.ahead === 'ahead' ? 'good' : point.ahead === 'not_ahead' ? 'warn' : 'neutral'} />
                        </div>
                        <p>{point.read}</p>
                        <em>Source metric: {point.metric} · slide {point.sourceSlide} · {point.sourceFile}</em>
                      </article>
                    ))}
                  </div>
                  <ul>{intelligencePacket.chartRead.primaryChartRead.guardrails.map((guardrail) => <li key={guardrail}>{guardrail}</li>)}</ul>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Supporting source-deck reads</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.chartRead.supportingChartReads.map((chart) => (
                    <article className={`packet-card ${chart.evidenceStatus === 'not_machine_readable' || chart.evidenceStatus === 'native_chart_only' ? 'high' : chart.evidenceStatus === 'processed_rows_only' ? 'medium' : ''}`} key={chart.id}>
                      <div className="packet-card-head">
                        <strong>Slide {chart.sourceSlide}</strong>
                        <StatusPill label={chart.evidenceStatus.replaceAll('_', ' ')} tone={chart.evidenceStatus === 'reconciled_chart_and_rows' ? 'good' : chart.evidenceStatus === 'not_machine_readable' || chart.evidenceStatus === 'native_chart_only' ? 'bad' : 'warn'} />
                      </div>
                      <p>{chart.chartRead}</p>
                      <em>{chart.title}</em>
                      <span>{chart.processedMetricRows} processed rows · {chart.nativeChartCount} native chart payloads · {chart.chartRole.replaceAll('_', ' ')}</span>
                      {!!chart.metricPoints.length && <ul>{chart.metricPoints.slice(0, 4).map((point) => <li key={`${chart.id}-${point.metric}`}>{point.read}</li>)}</ul>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Blocked claims and next proof</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>Blocked chart claims</strong>
                    <ul>{intelligencePacket.chartRead.blockedClaims.map((claim) => <li key={claim}>{claim}</li>)}</ul>
                  </div>
                  <div>
                    <span>Next proof needed</span>
                    <ul>{intelligencePacket.chartRead.nextProofNeeded.map((proof) => <li key={proof}>{proof}</li>)}</ul>
                  </div>
                  <div>
                    <span>Source posture</span>
                    <p>{intelligencePacket.chartRead.sourcePosture.read}</p>
                  </div>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Chart Read Module JSON</summary>
                <JsonBlock value={intelligencePacket.chartRead} />
              </details>
            </div>
          )}

          {activeTab === 'executive_verdict' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Executive Verdict</h2>
                <span><BrainCircuit size={14} /> Governed answer spine</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.executiveVerdict.outputModuleId}</span>
                  <h3>{intelligencePacket.executiveVerdict.title}</h3>
                  <p>{intelligencePacket.executiveVerdict.verdict}</p>
                  <em>{intelligencePacket.executiveVerdict.decisionImplication}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.executiveVerdict.tone}</strong>
                    <span>Verdict tone</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.executiveVerdict.confidence}</strong>
                    <span>Confidence</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.executiveVerdict.evidenceCards.length}</strong>
                    <span>Evidence cards</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.executiveVerdict.treatmentPathsToConsider.length}</strong>
                    <span>Treatment paths</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Sparkles size={16} />
                  <h3>Leadership takeaways</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.executiveVerdict.takeaways.map((takeaway) => (
                    <article className="packet-card" key={takeaway.label}>
                      <div className="packet-card-head">
                        <strong>{takeaway.label}</strong>
                        <StatusPill label={intelligencePacket.executiveVerdict.tone} tone={verdictTone(intelligencePacket.executiveVerdict.tone)} />
                      </div>
                      <p>{takeaway.body}</p>
                      <ul>{takeaway.evidence.slice(0, 3).map((evidence) => <li key={`${takeaway.label}-${evidence}`}>{evidence}</li>)}</ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Watch-out and proof stack</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill label={intelligencePacket.executiveVerdict.confidence} tone={verdictTone(intelligencePacket.executiveVerdict.confidence)} />
                    <strong>{intelligencePacket.executiveVerdict.primaryWatchout}</strong>
                    <p>{intelligencePacket.executiveVerdict.headline}</p>
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.executiveVerdict.evidenceCards.map((card) => (
                      <article className={`packet-card ${card.tone === 'bad' ? 'high' : card.tone === 'watch' ? 'medium' : ''}`} key={card.id}>
                        <div className="packet-card-head">
                          <strong>{card.label}</strong>
                          <StatusPill label={card.tone} tone={card.tone === 'good' ? 'good' : card.tone === 'bad' ? 'bad' : card.tone === 'watch' ? 'warn' : 'neutral'} />
                        </div>
                        <p>{card.read}</p>
                        <em>{card.source}</em>
                      </article>
                    ))}
                  </div>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Pill size={16} />
                  <h3>Treatment paths to consider</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.executiveVerdict.treatmentPathsToConsider.map((path) => (
                    <article className="packet-card" key={path.treatmentId}>
                      <strong>{path.name}</strong>
                      <p>{path.whyConsider}</p>
                      <em>Path to test, not a final prescription.</em>
                      <ul>{path.inspectBeforeAction.map((item) => <li key={`${path.treatmentId}-${item}`}>{item}</li>)}</ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Blocked claims and pilot proof</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>Blocked executive claims</strong>
                    <ul>{intelligencePacket.executiveVerdict.blockedClaims.slice(0, 6).map((claim) => <li key={claim}>{claim}</li>)}</ul>
                  </div>
                  <div>
                    <span>Next proof needed</span>
                    <ul>{intelligencePacket.executiveVerdict.nextProofNeeded.map((proof) => <li key={proof}>{proof}</li>)}</ul>
                  </div>
                  <div>
                    <span>Source posture</span>
                    <p>{intelligencePacket.executiveVerdict.sourcePosture.read}</p>
                  </div>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Executive Verdict Module JSON</summary>
                <JsonBlock value={intelligencePacket.executiveVerdict} />
              </details>
            </div>
          )}

          {activeTab === 'source_readiness' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Source Readiness</h2>
                <span><ShieldAlert size={14} /> Demo safe · pilot gated</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.sourceReadiness.outputModuleId}</span>
                  <h3>{intelligencePacket.sourceReadiness.title}</h3>
                  <p>{intelligencePacket.sourceReadiness.headline}</p>
                  <em>Demo use: {intelligencePacket.sourceReadiness.demoUse.replaceAll('_', ' ')} · Pilot use: {intelligencePacket.sourceReadiness.pilotUse} · Canonical use: {intelligencePacket.sourceReadiness.canonicalUseAllowed}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.sourceReadiness.status.replaceAll('_', ' ')}</strong>
                    <span>Readiness</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.sourceReadiness.sourceBlocks.length}</strong>
                    <span>Source blocks</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.sourceReadiness.handoffRequirements.length}</strong>
                    <span>Handoffs</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.sourceReadiness.nextProofNeeded.length}</strong>
                    <span>Proof needs</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Source blocks</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.sourceReadiness.sourceBlocks.map((block) => (
                    <article className={`packet-card ${block.status === 'blocked' || block.status === 'missing' ? 'high' : block.status === 'review_needed' ? 'medium' : ''}`} key={block.id}>
                      <div className="packet-card-head">
                        <strong>{block.label}</strong>
                        <StatusPill label={block.status.replaceAll('_', ' ')} tone={block.status === 'ready' ? 'good' : block.status === 'blocked' || block.status === 'missing' ? 'bad' : 'warn'} />
                      </div>
                      <p>{block.currentState}</p>
                      <em>{block.sourceLabel ?? 'No source label loaded'} · executive use {block.executiveUse.replaceAll('_', ' ')}</em>
                      <span>{block.requiredForPilot}</span>
                      {!!block.guardrails.length && <ul>{block.guardrails.slice(0, 3).map((guardrail) => <li key={`${block.id}-${guardrail}`}>{guardrail}</li>)}</ul>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Runtime governance</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill
                      label={intelligencePacket.sourceReadiness.runtimeGovernance.canonicalUseEnabled ? 'canonical enabled' : 'canonical disabled'}
                      tone={intelligencePacket.sourceReadiness.runtimeGovernance.canonicalUseEnabled ? 'good' : 'bad'}
                    />
                    <strong>Runtime source use remains gated</strong>
                    <p>Momentum runtime {intelligencePacket.sourceReadiness.runtimeGovernance.momentumRuntimeStatus.replaceAll('_', ' ')} · Strategic runtime {intelligencePacket.sourceReadiness.runtimeGovernance.strategicRuntimeStatus.replaceAll('_', ' ')}</p>
                  </div>
                  <div>
                    <span>Default runtime consumption</span>
                    <p>{intelligencePacket.sourceReadiness.runtimeGovernance.defaultRuntimeConsumptionEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <span>Missing Momentum files</span>
                    <p>{intelligencePacket.sourceReadiness.runtimeGovernance.missingMomentumFileKinds.length ? intelligencePacket.sourceReadiness.runtimeGovernance.missingMomentumFileKinds.map((kind) => kind.replaceAll('_', ' ')).join(' · ') : 'No missing Momentum file kinds.'}</p>
                  </div>
                  <div>
                    <span>Missing Brand Strategic Context files</span>
                    <p>{intelligencePacket.sourceReadiness.runtimeGovernance.missingStrategicContextFileKinds.length ? intelligencePacket.sourceReadiness.runtimeGovernance.missingStrategicContextFileKinds.map((kind) => kind.replaceAll('_', ' ')).join(' · ') : 'No missing Brand Strategic Context file kinds.'}</p>
                  </div>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ClipboardList size={16} />
                  <h3>Business handoffs</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.sourceReadiness.handoffRequirements.slice(0, 8).map((handoff) => (
                    <article className={`packet-card ${handoff.currentStatus.includes('missing') ? 'high' : handoff.currentStatus.includes('source ready') ? '' : 'medium'}`} key={handoff.id}>
                      <div className="packet-card-head">
                        <strong>{handoff.label}</strong>
                        <StatusPill label={handoff.currentStatus} tone={handoff.currentStatus.includes('source ready') ? 'good' : handoff.currentStatus.includes('missing') ? 'bad' : 'warn'} />
                      </div>
                      <p>{handoff.owner}</p>
                      <em>{handoff.nextAction}</em>
                      <span>{handoff.promotionGate}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Blocked uses and next proof</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>Blocked uses</strong>
                    <ul>{intelligencePacket.sourceReadiness.blockedUses.slice(0, 6).map((use) => <li key={use}>{use}</li>)}</ul>
                  </div>
                  <div>
                    <span>Next proof needed</span>
                    <ul>{intelligencePacket.sourceReadiness.nextProofNeeded.map((proof) => <li key={proof}>{proof}</li>)}</ul>
                  </div>
                  <div>
                    <span>Source posture</span>
                    <p>{intelligencePacket.sourceReadiness.sourcePosture.read}</p>
                  </div>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Source Readiness Module JSON</summary>
                <JsonBlock value={intelligencePacket.sourceReadiness} />
              </details>
            </div>
          )}

          {activeTab === 'demographic_state' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Demographic Diagnostic State</h2>
                <span><ShieldAlert size={14} /> Simulated workflow · measured blocked</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.demographicDiagnosticState.outputModuleId}</span>
                  <h3>{intelligencePacket.demographicDiagnosticState.title}</h3>
                  <p>{intelligencePacket.demographicDiagnosticState.headline}</p>
                  <em>Measured diagnosis allowed: {intelligencePacket.demographicDiagnosticState.measuredDiagnosisAllowed ? 'yes' : 'no'} · Simulated workflow: {intelligencePacket.demographicDiagnosticState.simulatedWorkflowAvailable ? 'available' : 'missing'}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.demographicDiagnosticState.status.replaceAll('_', ' ')}</strong>
                    <span>Status</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.demographicDiagnosticState.dimension.replaceAll('_', ' ')}</strong>
                    <span>Dimension</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.demographicDiagnosticState.segmentReads.length}</strong>
                    <span>Segments</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.demographicDiagnosticState.activeSegment}</strong>
                    <span>Active test segment</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <BrainCircuit size={16} />
                  <h3>Active segment read</h3>
                </div>
                {intelligencePacket.demographicDiagnosticState.activeSegmentRead ? (
                  <article className="packet-context-card">
                    <div>
                      <StatusPill
                        label={intelligencePacket.demographicDiagnosticState.activeSegmentRead.allowedDiagnosticLanguage.replaceAll('_', ' ')}
                        tone={intelligencePacket.demographicDiagnosticState.activeSegmentRead.allowedDiagnosticLanguage === 'measured_diagnostic' ? 'good' : intelligencePacket.demographicDiagnosticState.activeSegmentRead.allowedDiagnosticLanguage === 'simulated_workflow_only' ? 'warn' : 'bad'}
                      />
                      <strong>{intelligencePacket.demographicDiagnosticState.activeSegmentRead.segment}</strong>
                      <p>{intelligencePacket.demographicDiagnosticState.activeSegmentRead.interpretation}</p>
                    </div>
                    <div>
                      <span>Base and evidence mode</span>
                      <p>Base {intelligencePacket.demographicDiagnosticState.activeSegmentRead.baseSize} · readable base {intelligencePacket.demographicDiagnosticState.activeSegmentRead.readableBase ? 'yes' : 'no'} · {intelligencePacket.demographicDiagnosticState.activeSegmentRead.evidenceMode.replaceAll('_', ' ')}</p>
                    </div>
                    <div className="packet-card-grid">
                      {intelligencePacket.demographicDiagnosticState.activeSegmentRead.metricReads.map((metric) => (
                        <article className={`packet-card ${metric.ahead === 'not_ahead' || metric.momentum === 'declining' ? 'medium' : ''}`} key={`${intelligencePacket.demographicDiagnosticState.activeSegment}-${metric.metric}`}>
                          <div className="packet-card-head">
                            <strong>{metric.displayLabel}</strong>
                            <StatusPill label={metric.ahead.replaceAll('_', ' ')} tone={metric.ahead === 'ahead' ? 'good' : metric.ahead === 'not_ahead' ? 'warn' : 'neutral'} />
                          </div>
                          <p>{metric.read}</p>
                          <em>Category index {metric.categoryIndex} · momentum {metric.momentum}</em>
                        </article>
                      ))}
                    </div>
                  </article>
                ) : (
                  <div className="data-empty"><FileJson size={18} /> No demographic segment evidence is loaded.</div>
                )}
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Available simulated segments</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.demographicDiagnosticState.segmentReads.map((segment) => (
                    <article className="packet-card medium" key={segment.segment}>
                      <div className="packet-card-head">
                        <strong>{segment.segment}</strong>
                        <StatusPill label={segment.evidenceMode.replaceAll('_', ' ')} tone="warn" />
                      </div>
                      <p>{segment.interpretation}</p>
                      <em>Base {segment.baseSize} · readable {segment.readableBase ? 'yes' : 'no'} · {segment.metricReads.length} metrics</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Allowed language and blocked claims</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>Allowed language</strong>
                    <ul>{intelligencePacket.demographicDiagnosticState.allowedLanguage.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <span>Blocked claims</span>
                    <ul>{intelligencePacket.demographicDiagnosticState.blockedClaims.map((claim) => <li key={claim}>{claim}</li>)}</ul>
                  </div>
                  <div>
                    <span>Current source posture</span>
                    <p>{intelligencePacket.demographicDiagnosticState.sourcePosture.sourceLabel} · {intelligencePacket.demographicDiagnosticState.sourcePosture.evidenceMode.replaceAll('_', ' ')} · canonical use {intelligencePacket.demographicDiagnosticState.sourcePosture.canonicalUseAllowed}</p>
                    <p>{intelligencePacket.demographicDiagnosticState.sourcePosture.replacementRequirement}</p>
                  </div>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ClipboardList size={16} />
                  <h3>Official source requirement</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>{intelligencePacket.demographicDiagnosticState.requiredOfficialSource.label}</strong>
                    <p>{intelligencePacket.demographicDiagnosticState.requiredOfficialSource.baseSizeRule}</p>
                    <em>{intelligencePacket.demographicDiagnosticState.requiredOfficialSource.promotionGate.replaceAll('_', ' ')}</em>
                  </div>
                  <div>
                    <span>Required fields</span>
                    <ul>{intelligencePacket.demographicDiagnosticState.requiredOfficialSource.requiredFields.map((field) => <li key={field}>{field}</li>)}</ul>
                  </div>
                  <div>
                    <span>Next proof needed</span>
                    <ul>{intelligencePacket.demographicDiagnosticState.nextProofNeeded.map((proof) => <li key={proof}>{proof}</li>)}</ul>
                  </div>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Demographic Diagnostic State JSON</summary>
                <JsonBlock value={intelligencePacket.demographicDiagnosticState} />
              </details>
            </div>
          )}

          {activeTab === 'provocation_questions' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Provocation Questions</h2>
                <span><Search size={14} /> Deck first · proof gated</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>{intelligencePacket.provocationQuestions.outputModuleId}</span>
                  <h3>{intelligencePacket.provocationQuestions.title}</h3>
                  <p>{intelligencePacket.provocationQuestions.headline}</p>
                  <em>{intelligencePacket.provocationQuestions.questionStrategy}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.provocationQuestions.priorityQuestions.length}</strong>
                    <span>Priority questions</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.provocationQuestions.sourceOwnerQuestions.length}</strong>
                    <span>Source-owner asks</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.provocationQuestions.sourceSlides.join(', ')}</strong>
                    <span>Source slides</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.provocationQuestions.researchBasis.length}</strong>
                    <span>Research inputs</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <BrainCircuit size={16} />
                  <h3>Priority questions</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.provocationQuestions.priorityQuestions.map((question) => (
                    <article className={`packet-card ${question.priority === 'p0' ? 'medium' : ''}`} key={question.id}>
                      <div className="packet-card-head">
                        <strong>{question.question}</strong>
                        <StatusPill label={`${question.priority} · ${question.sourceBasis.replaceAll('_', ' ')}`} tone={question.priority === 'p0' ? 'warn' : 'neutral'} />
                      </div>
                      <p>{question.whyItMatters}</p>
                      <em>{question.purpose.replaceAll('_', ' ')}</em>
                      <span>Evidence to use</span>
                      <ul>{question.evidenceToUse.slice(0, 4).map((evidence) => <li key={`${question.id}-use-${evidence}`}>{evidence}</li>)}</ul>
                      <span>Evidence needed to answer</span>
                      <ul>{question.evidenceNeededToAnswer.slice(0, 4).map((evidence) => <li key={`${question.id}-need-${evidence}`}>{evidence}</li>)}</ul>
                      <span>Blocked overclaim: {question.blockedOverclaim}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ClipboardList size={16} />
                  <h3>Source-owner questions</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.provocationQuestions.sourceOwnerQuestions.map((question) => (
                    <article className="packet-card high" key={question.id}>
                      <div className="packet-card-head">
                        <strong>{question.question}</strong>
                        <StatusPill label={question.priority} tone="bad" />
                      </div>
                      <p>{question.whyItMatters}</p>
                      <em>{question.sourceBasis.replaceAll('_', ' ')} · {question.purpose.replaceAll('_', ' ')}</em>
                      <span>Evidence needed</span>
                      <ul>{question.evidenceNeededToAnswer.slice(0, 5).map((evidence) => <li key={`${question.id}-source-${evidence}`}>{evidence}</li>)}</ul>
                      <span>Blocked overclaim: {question.blockedOverclaim}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <BookOpen size={16} />
                  <h3>Research basis</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.provocationQuestions.researchBasis.map((basis) => (
                    <article className="packet-card" key={basis.label}>
                      <strong>{basis.label}</strong>
                      <p>{basis.implication}</p>
                      <a href={basis.sourceUrl} target="_blank" rel="noreferrer">{basis.sourceUrl}</a>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Blocked patterns and proof needs</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <strong>Blocked question patterns</strong>
                    <ul>{intelligencePacket.provocationQuestions.blockedQuestionPatterns.map((pattern) => <li key={pattern}>{pattern}</li>)}</ul>
                  </div>
                  <div>
                    <span>Next proof needed</span>
                    <ul>{intelligencePacket.provocationQuestions.nextProofNeeded.slice(0, 8).map((proof) => <li key={proof}>{proof}</li>)}</ul>
                  </div>
                </article>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Provocation Questions Module JSON</summary>
                <JsonBlock value={intelligencePacket.provocationQuestions} />
              </details>
            </div>
          )}

          {activeTab === 'source_claims' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Source Claim Extraction</h2>
                <span><ShieldAlert size={14} /> Extract · review · keep separate</span>
              </div>

              <div className="import-guidance">
                <article>
                  <strong>Unstructured source intake</strong>
                  <p>Paste notes, transcript excerpts, research summaries, or deck text to extract candidate claims for human review. These claims do not update canonical data and are not consumed as runtime evidence.</p>
                  <ul>
                    <li>Extracted claims start as unreviewed local records.</li>
                    <li>Reviewed candidates are still not canonical source facts.</li>
                    <li>Rejected claims remain visible for audit and should not be reused without re-extraction.</li>
                  </ul>
                </article>
                <article>
                  <strong>Current queue</strong>
                  <p>{sourceClaimRecords.length} local source claim records loaded for {record.brandName}.</p>
                  <p>Canonical facts: disabled · Runtime auto-consumption: disabled</p>
                </article>
              </div>

              <div className="import-workbench">
                <div className="import-editor">
                  <label>
                    <span>Source label</span>
                    <input value={sourceClaimLabel} onChange={(event) => setSourceClaimLabel(event.target.value)} />
                  </label>
                  <label>
                    <span>Unstructured source text</span>
                    <textarea value={sourceClaimText} onChange={(event) => setSourceClaimText(event.target.value)} placeholder="Paste source notes, transcript excerpts, deck text, or research summary here..." />
                  </label>
                  <div className="import-actions">
                    <button type="button" onClick={extractSourceClaims} disabled={sourceClaimText.trim().length < 80}>Extract review claims</button>
                    <button type="button" onClick={refreshSourceClaimRecords}>Refresh queue</button>
                  </div>
                </div>

                <div className="import-preview">
                  <h3>Extraction Preview</h3>
                  {sourceClaimResult ? (
                    <>
                      <div className={`import-status ${sourceClaimResult.ok ? 'good' : 'bad'}`}>
                        <strong>{sourceClaimResult.ok ? 'Claims extracted for review' : 'Extraction needs fixes'}</strong>
                        <span>{sourceClaimResult.ok ? `${sourceClaimResult.records.length} local claim records created.` : sourceClaimResult.error}</span>
                      </div>
                      {sourceClaimResult.ok && (
                        <div className="version-stack">
                          {sourceClaimResult.records.slice(0, 5).map((claim) => (
                            <article className="data-card" key={claim.id}>
                              <strong>{claim.claimKind.replaceAll('_', ' ')} · {claim.status.replaceAll('_', ' ')}</strong>
                              <p>{claim.claim}</p>
                              <em>{claim.sourceLabel} · canonical fact disabled · runtime evidence disabled</em>
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="data-empty"><FileJson size={18} /> Paste source text to extract a reviewed-local claim queue.</div>
                  )}
                </div>
              </div>

              <div className="version-stack">
                <h3>Local Source Claim Queue</h3>
                <p>{sourceClaimStatus}</p>
                {sourceClaimRecords.length ? sourceClaimRecords.map((claim) => (
                  <article className={`data-card ${claim.status === 'reviewed_candidate' ? 'primary' : ''}`} key={claim.id}>
                    <strong>{claim.claimKind.replaceAll('_', ' ')} · {claim.status.replaceAll('_', ' ')}</strong>
                    <p>{claim.claim}</p>
                    <em>{claim.sourceLabel} · {claim.sourceOwner ?? 'Unknown owner'} · {claim.sourceDate ?? 'Unknown date'}</em>
                    <ul>
                      <li>Canonical fact enabled: {claim.canonicalFactEnabled ? 'yes' : 'no'}</li>
                      <li>Runtime auto-consumption: {claim.runtimeAutoConsumption ? 'yes' : 'no'}</li>
                    </ul>
                    <div className="import-actions">
                      <button type="button" onClick={() => reviewSourceClaim(claim.id, 'accepted')} disabled={claim.status === 'reviewed_candidate'}>Mark reviewed candidate</button>
                      <button type="button" onClick={() => reviewSourceClaim(claim.id, 'rejected')} disabled={claim.status === 'rejected'}>Reject claim</button>
                    </div>
                  </article>
                )) : (
                  <div className="data-empty"><FileJson size={18} /> No source claim records for this brand yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="data-section">
              <h2>Diagnosis Rules</h2>
              <div className="data-rule-stack">
                <article className="data-card primary">
                  <strong>{trace.primaryRule.ruleId}</strong>
                  <p>{trace.primaryRule.diagnosisName} · {trace.primaryRule.confidence} · score {trace.primaryRule.score}</p>
                  <em>{trace.primaryRule.evidenceSummary}</em>
                </article>
                {trace.allRules.map((rule) => (
                  <article className={`data-card ${rule.fired ? 'primary' : ''}`} key={rule.ruleId}>
                    <strong>{rule.ruleId}</strong>
                    <p>{rule.diagnosisName} · {rule.fired ? 'fired' : 'did not fire'} · {rule.matchedConditionCount}/{rule.totalConditionCount}</p>
                    <em>{rule.description}</em>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="data-section">
              <h2>Global Treatment Library + {record.brandName} Fit</h2>
              <div className="data-card-grid">
                {treatmentOptions.map((option) => (
                  <article className="data-card" key={option.treatmentId}>
                    <strong>{option.name}</strong>
                    <p>Ranked for {record.brandName} · fit {Math.round(option.score)} · priority {option.priority} · {option.tier}</p>
                    <em>{option.globalLibraryRole}</em>
                    <ul>
                      {option.brandSpecificBasis.slice(0, 3).map((basis) => <li key={basis}>{basis}</li>)}
                    </ul>
                    <span>Inspect: {option.evidenceNeeds.join(' · ')}</span>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'knowledge_graph' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Knowledge Graph</h2>
                <span><Network size={14} /> JSON-first Pattern Radar graph</span>
              </div>

              <section className="graph-brief">
                <div>
                  <span>Pattern read</span>
                  <strong>{patternRadar.topline.patternLabel}</strong>
                  <p>{patternRadar.topline.read}</p>
                  <em>{patternRadar.topline.confidence} · {patternRadar.topline.caveat}</em>
                </div>
                <div className="graph-stats" aria-label="Knowledge graph summary">
                  <article>
                    <strong>{patternRadar.graph.nodes.length}</strong>
                    <span>Nodes</span>
                  </article>
                  <article>
                    <strong>{patternRadar.graph.edges.length}</strong>
                    <span>Edges</span>
                  </article>
                  <article>
                    <strong>{patternRadar.similarBrands.length}</strong>
                    <span>Similar brands</span>
                  </article>
                  <article>
                    <strong>{patternRadar.evidenceGaps.length}</strong>
                    <span>Evidence gaps</span>
                  </article>
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <Network size={16} />
                  <h3>Graph map</h3>
                </div>
                <KnowledgeGraphMap graph={patternRadar.graph} title={`${record.brandName} knowledge graph map`} />
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <GitBranch size={16} />
                  <h3>Active symptom fingerprint</h3>
                </div>
                <div className="fingerprint-grid">
                  <article>
                    <span>Equity shape</span>
                    <strong>{patternRadar.fingerprint.equityShape}</strong>
                  </article>
                  <article>
                    <span>Trajectory</span>
                    <strong>{patternRadar.fingerprint.trajectory}</strong>
                  </article>
                  <article>
                    <span>Support lens coverage</span>
                    <strong>{patternRadar.fingerprint.supportLensCoverage}</strong>
                  </article>
                </div>
                <div className="graph-evidence-columns">
                  <article>
                    <strong>Diagnosis pull</strong>
                    <ul>{patternRadar.fingerprint.diagnosisPull.map((item) => <li key={item}>{item}</li>)}</ul>
                  </article>
                  <article>
                    <strong>Treatment pull</strong>
                    <ul>{patternRadar.fingerprint.treatmentPull.map((item) => <li key={item}>{item}</li>)}</ul>
                  </article>
                  <article>
                    <strong>Blockers</strong>
                    <ul>{(patternRadar.fingerprint.blockers.length ? patternRadar.fingerprint.blockers : ['No material blockers in the current packet.']).map((item) => <li key={item}>{item}</li>)}</ul>
                  </article>
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <Network size={16} />
                  <h3>Graph nodes</h3>
                </div>
                <div className="data-table-wrap">
                  <table className="data-table graph-table">
                    <thead>
                      <tr>
                        <th>Node</th>
                        <th>Type</th>
                        <th>Properties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patternRadar.graph.nodes.map((node) => (
                        <tr key={node.id}>
                          <td>
                            <strong>{node.label}</strong>
                            <span>{node.id}</span>
                          </td>
                          <td>{node.type.replaceAll('_', ' ')}</td>
                          <td>{Object.entries(node.properties).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || 'No properties'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <GitBranch size={16} />
                  <h3>Graph edges</h3>
                </div>
                <div className="graph-edge-list">
                  {patternRadar.graph.edges.map((edge) => (
                    <article key={`${edge.from}-${edge.type}-${edge.to}`}>
                      <div>
                        <strong>{graphNodeLabelById.get(edge.from) ?? edge.from}</strong>
                        <span>{edge.type.replaceAll('_', ' ')}{edge.weight ? ` · weight ${edge.weight}` : ''}</span>
                        <strong>{graphNodeLabelById.get(edge.to) ?? edge.to}</strong>
                      </div>
                      {!!edge.evidence?.length && <ul>{edge.evidence.map((item) => <li key={item}>{item}</li>)}</ul>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <Search size={16} />
                  <h3>Brands that look like this</h3>
                </div>
                <div className="data-card-grid">
                  {patternRadar.similarBrands.map((match) => (
                    <article className="data-card" key={match.brandId}>
                      <strong>{match.brandName}</strong>
                      <p>{match.category} · {match.diagnosisName} · {match.strength} similarity ({match.score})</p>
                      <ul>{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                      <em>{match.keyDifference}</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <ShieldAlert size={16} />
                  <h3>Evidence missing before action</h3>
                </div>
                <div className="data-card-grid">
                  {patternRadar.evidenceGaps.map((gap) => (
                    <article className={`data-card ${gap.decisionRisk === 'High' ? 'primary' : ''}`} key={gap.id}>
                      <strong>{gap.label}</strong>
                      <p>{gap.decisionRisk} decision risk · affects {gap.affectedBrandIds.length} connected brand{gap.affectedBrandIds.length === 1 ? '' : 's'}</p>
                      <em>{gap.whyItMatters}</em>
                      <span>{gap.nextSource} · {gap.ownerCandidate}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <Pill size={16} />
                  <h3>Treatment memory</h3>
                </div>
                <div className="data-card-grid">
                  {patternRadar.treatmentMemory.map((item) => (
                    <article className="data-card" key={item.treatmentId}>
                      <strong>{item.treatmentName}</strong>
                      <p>{item.family}</p>
                      <em>{item.whyItAppears}</em>
                      <ul>{item.requiredEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="graph-section">
                <div className="graph-section-title">
                  <FileJson size={16} />
                  <h3>Raw graph packet</h3>
                </div>
                <JsonBlock value={patternRadar} />
              </section>
            </div>
          )}

          {activeTab === 'intelligence_packet' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>Brand Intelligence Packet</h2>
                <span><BrainCircuit size={14} /> Future agent packet</span>
              </div>

              <section className="packet-hero">
                <div>
                  <span>Packet summary</span>
                  <h3>{intelligencePacket.brand.brandName}</h3>
                  <p>{intelligencePacket.brand.country} · {intelligencePacket.brand.category} · {intelligencePacket.brand.period}</p>
                  <p>{intelligencePacket.diagnosisResult.primary.diagnosis.name} · {intelligencePacket.momentumIntelligence.headline}</p>
                  <em>{intelligencePacket.displayLanguage.perceivedValueRequiredLanguage}</em>
                </div>
                <div className="packet-summary-grid">
                  <article>
                    <strong>{intelligencePacket.dataCoverage.metricCount}</strong>
                    <span>BBE metrics</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.dataCoverage.trendMetricCount}</strong>
                    <span>Trend series</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.evidenceGaps.length}</strong>
                    <span>Evidence gaps</span>
                  </article>
                  <article>
                    <strong>{intelligencePacket.recommendedViewIds.length}</strong>
                    <span>Approved views</span>
                  </article>
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Data coverage</h3>
                </div>
                <div className="packet-coverage-grid">
                  {[
                    ['Core metrics', `${intelligencePacket.dataCoverage.metricCount} loaded`, true],
                    ['Trend metrics', `${intelligencePacket.dataCoverage.trendMetricCount} loaded`, intelligencePacket.dataCoverage.trendMetricCount > 0],
                    ['Occasions', `${intelligencePacket.dataCoverage.occasionCount} loaded`, intelligencePacket.dataCoverage.occasionCount > 0],
                    ['Growth Navigator', intelligencePacket.dataCoverage.growthNavigatorEvidenceMode.replaceAll('_', ' '), intelligencePacket.dataCoverage.hasGrowthNavigator],
                    ['Market context', intelligencePacket.dataCoverage.hasMarketContext ? 'Loaded' : 'Missing', intelligencePacket.dataCoverage.hasMarketContext],
                    ['Brand Strategic Context', intelligencePacket.strategicContext.status.replaceAll('_', ' '), intelligencePacket.dataCoverage.hasBrandStrategicContext],
                    ['Approved strategic source', intelligencePacket.strategicContextReadiness.status.replaceAll('_', ' '), intelligencePacket.dataCoverage.hasApprovedBrandStrategicContext],
                    ['Runtime strategic file drop', intelligencePacket.dataCoverage.hasRuntimeBrandStrategicContextSourceFileDrop ? 'Enabled' : 'Disabled', intelligencePacket.dataCoverage.hasRuntimeBrandStrategicContextSourceFileDrop],
                    ['SMD contribution weights', intelligencePacket.dataCoverage.hasSmdContributionWeights ? 'Loaded' : 'Missing', intelligencePacket.dataCoverage.hasSmdContributionWeights],
                    ['Room-to-grow inputs', intelligencePacket.dataCoverage.hasRoomToGrowInputs ? 'Loaded' : 'Missing', intelligencePacket.dataCoverage.hasRoomToGrowInputs],
                    ['Approved Momentum source', intelligencePacket.dataCoverage.hasApprovedMomentumSource ? 'Loaded' : 'Not ready', intelligencePacket.dataCoverage.hasApprovedMomentumSource],
                    ['Runtime Momentum file drop', intelligencePacket.dataCoverage.hasRuntimeMomentumSourceFileDrop ? 'Enabled' : 'Disabled', intelligencePacket.dataCoverage.hasRuntimeMomentumSourceFileDrop]
                  ].map(([label, value, covered]) => (
                    <article key={String(label)}>
                      <div>
                        <strong>{label}</strong>
                        <p>{value}</p>
                      </div>
                      <StatusPill label={covered ? 'Available' : 'Gap'} tone={coverageTone(Boolean(covered))} />
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <LineChart size={16} />
                  <h3>Momentum Intelligence source status</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill label={intelligencePacket.roomToGrow.status} tone={statusTone(intelligencePacket.roomToGrow.status)} />
                    <strong>{intelligencePacket.roomToGrow.label}</strong>
                    <p>{intelligencePacket.roomToGrow.read}</p>
                  </div>
                  <div>
                    <span>Room-to-grow source</span>
                    <p>{intelligencePacket.roomToGrow.sourceLabel ?? 'No governed room-to-grow source loaded'} · {intelligencePacket.roomToGrow.evidenceMode?.replaceAll('_', ' ') ?? 'missing'}</p>
                  </div>
                  {intelligencePacket.marketContext && (
                    <div>
                      <span>Market context</span>
                      <p>{intelligencePacket.marketContext.market} · {intelligencePacket.marketContext.period} · {intelligencePacket.marketContext.maturity}</p>
                    </div>
                  )}
                  {intelligencePacket.peerSet && (
                    <div>
                      <span>Peer set</span>
                      <p>{intelligencePacket.peerSet.label} · {intelligencePacket.peerSet.peerCount} peers · {intelligencePacket.peerSet.selectionBasis}</p>
                    </div>
                  )}
                  {intelligencePacket.smdContributionWeights && (
                    <div>
                      <span>SMD contribution weights</span>
                      <p>
                        Salient {Math.round(intelligencePacket.smdContributionWeights.salient * 100)}% · Meaningful {Math.round(intelligencePacket.smdContributionWeights.meaningful * 100)}% · Different {Math.round(intelligencePacket.smdContributionWeights.different * 100)}%
                      </p>
                      <p>{intelligencePacket.smdContributionWeights.sourceLabel}</p>
                    </div>
                  )}
                  <ul>
                    {intelligencePacket.roomToGrow.caveats.map((caveat) => <li key={`rtg-${caveat}`}>{caveat}</li>)}
                    {intelligencePacket.peerSet?.caveats.map((caveat) => <li key={`peer-${caveat}`}>{caveat}</li>)}
                    {intelligencePacket.smdContributionWeights?.caveats.map((caveat) => <li key={`smd-${caveat}`}>{caveat}</li>)}
                  </ul>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Momentum source readiness</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill
                      label={intelligencePacket.momentumSourceReadiness.status.replaceAll('_', ' ')}
                      tone={intelligencePacket.momentumSourceReadiness.canonicalForExecutiveUse ? 'good' : intelligencePacket.momentumSourceReadiness.sourceLabel ? 'warn' : 'bad'}
                    />
                    <strong>{intelligencePacket.momentumSourceReadiness.sourcePath.replaceAll('_', ' ')}</strong>
                    <p>{intelligencePacket.momentumSourceReadiness.sourceLabel ?? 'No Momentum source context loaded.'}</p>
                  </div>
                  <div>
                    <span>Executive use</span>
                    <p>{intelligencePacket.momentumSourceReadiness.canonicalForExecutiveUse ? 'Source-owner ready after human review' : 'Blocked until approved source-owner extracts cover the required blocks'}</p>
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.momentumSourceReadiness.checks.map((check) => (
                      <article className={`packet-card ${check.status === 'missing' ? 'high' : check.status === 'prototype_only' || check.status === 'partial' ? 'medium' : ''}`} key={check.id}>
                        <div className="packet-card-head">
                          <strong>{check.label}</strong>
                          <StatusPill label={check.status.replaceAll('_', ' ')} tone={check.status === 'source_ready' ? 'good' : check.status === 'missing' ? 'bad' : 'warn'} />
                        </div>
                        <p>{check.detail}</p>
                        <em>{check.requiredSource}</em>
                      </article>
                    ))}
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.momentumSourceReadiness.handoffRequirements.map((requirement) => (
                      <article className={`packet-card ${requirement.currentStatus === 'missing' ? 'high' : requirement.currentStatus === 'source_ready' ? '' : 'medium'}`} key={requirement.id}>
                        <div className="packet-card-head">
                          <strong>{requirement.label}</strong>
                          <StatusPill label={requirement.currentStatus.replaceAll('_', ' ')} tone={requirement.currentStatus === 'source_ready' ? 'good' : requirement.currentStatus === 'missing' ? 'bad' : 'warn'} />
                        </div>
                        <p>{requirement.sourceOwnerRole}</p>
                        <p>{requirement.nextAction}</p>
                        <em>{requirement.acceptedExtractShape} · {requirement.promotionGate.replaceAll('_', ' ')}</em>
                      </article>
                    ))}
                  </div>
                  <ul>
                    {intelligencePacket.momentumSourceReadiness.caveats.map((caveat) => <li key={`source-ready-${caveat}`}>{caveat}</li>)}
                  </ul>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Database size={16} />
                  <h3>Runtime Momentum file-drop readiness</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill
                      label={intelligencePacket.momentumRuntimeSourceFileDropReadiness.status.replaceAll('_', ' ')}
                      tone={intelligencePacket.momentumRuntimeSourceFileDropReadiness.status === 'ready' ? 'good' : 'bad'}
                    />
                    <strong>{intelligencePacket.momentumRuntimeSourceFileDropReadiness.policyId}</strong>
                    <p>{intelligencePacket.momentumRuntimeSourceFileDropReadiness.expectedSourceDirectory}</p>
                  </div>
                  <div>
                    <span>Runtime consumption</span>
                    <p>{intelligencePacket.momentumRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled ? 'Enabled' : 'Disabled'} · Canonical use {intelligencePacket.momentumRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'enabled' : 'disabled'}</p>
                  </div>
                  <div>
                    <span>Accepted bundle</span>
                    <p>{intelligencePacket.momentumRuntimeSourceFileDropReadiness.acceptedBundleType} · {intelligencePacket.momentumRuntimeSourceFileDropReadiness.templatePath}</p>
                  </div>
                  <div>
                    <span>Read-only audit</span>
                    <p>{intelligencePacket.momentumRuntimeSourceFileDropReadiness.audit.auditMode.replaceAll('_', ' ')} · {intelligencePacket.momentumRuntimeSourceFileDropReadiness.audit.sourceDirectoryExists ? 'directory found' : 'directory missing'} · {intelligencePacket.momentumRuntimeSourceFileDropReadiness.audit.candidateFileCount} JSON candidates</p>
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.momentumRuntimeSourceFileDropReadiness.audit.fileKindAudits.map((audit) => (
                      <article className="packet-card high" key={audit.fileKind}>
                        <div className="packet-card-head">
                          <strong>{audit.fileKind.replaceAll('_', ' ')}</strong>
                          <StatusPill label={audit.present ? 'Present' : 'Missing'} tone={audit.present ? 'good' : 'bad'} />
                        </div>
                        <p>{audit.present ? `${audit.rowCount} rows across ${audit.brandIds.length || 0} brands.` : 'Required before runtime source replacement.'}</p>
                        <em>{audit.expectedPathHint}</em>
                        {audit.issues.slice(0, 2).map((issue) => <em key={`${audit.fileKind}-${issue}`}>{issue}</em>)}
                      </article>
                    ))}
                  </div>
                  <ul>
                    {intelligencePacket.momentumRuntimeSourceFileDropReadiness.blockers.slice(0, 5).map((blocker) => <li key={`runtime-source-${blocker}`}>{blocker}</li>)}
                    {intelligencePacket.momentumRuntimeSourceFileDropReadiness.guardrails.slice(0, 3).map((guardrail) => <li key={`runtime-source-guardrail-${guardrail}`}>{guardrail}</li>)}
                  </ul>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <LineChart size={16} />
                  <h3>Multi-quarter momentum context</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill label={intelligencePacket.momentumTrendContext.status} tone={statusTone(intelligencePacket.momentumTrendContext.status)} />
                    <strong>{intelligencePacket.momentumTrendContext.sourcePeriodLabel}</strong>
                    <p>{intelligencePacket.momentumTrendContext.caveats.join(' ')}</p>
                  </div>
                  {intelligencePacket.momentumTrendContext.metricReads.map((read) => (
                    <div key={read.metric}>
                      <span>{read.metric}</span>
                      <p>{read.read}</p>
                    </div>
                  ))}
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Momentum output quality checks</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.momentumQualityChecks.map((check) => (
                    <article className={`packet-card ${check.status === 'gap' ? 'high' : check.status === 'watch' ? 'medium' : ''}`} key={check.id}>
                      <div className="packet-card-head">
                        <strong>{check.label}</strong>
                        <StatusPill label={check.status} tone={check.status === 'pass' ? 'good' : check.status === 'gap' ? 'bad' : 'warn'} />
                      </div>
                      <p>{check.detail}</p>
                      <em>{check.guardrail}</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Governed output quality checks</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.outputQualityChecks.map((check) => (
                    <article className={`packet-card ${check.status === 'gap' ? 'high' : check.status === 'watch' ? 'medium' : ''}`} key={check.id}>
                      <div className="packet-card-head">
                        <strong>{check.label}</strong>
                        <StatusPill label={check.status} tone={check.status === 'pass' ? 'good' : check.status === 'gap' ? 'bad' : 'warn'} />
                      </div>
                      <p>{check.detail}</p>
                      <em>{check.guardrail}</em>
                      <span>Applies to: {check.appliesTo.join(' · ')}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <BookText size={16} />
                  <h3>Brand Strategic Context status</h3>
                </div>
                <article className="packet-context-card">
                  <div>
                    <StatusPill label={intelligencePacket.strategicContext.status} tone={statusTone(intelligencePacket.strategicContext.status)} />
                    <strong>{intelligencePacket.strategicContext.officialName}</strong>
                    <p>{intelligencePacket.strategicContext.brandStatement ?? intelligencePacket.strategicContext.portfolioContext ?? 'No approved brand statement, positioning, objectives, creative platform, or planning priorities are loaded yet.'}</p>
                  </div>
                  <div>
                    <span>Source</span>
                    <p>{intelligencePacket.strategicContext.sourceLabel ?? 'No source loaded'} · {intelligencePacket.strategicContext.reviewStatus.replaceAll('_', ' ')}</p>
                  </div>
                  <div>
                    <span>Owner / date</span>
                    <p>{intelligencePacket.strategicContext.sourceOwner ?? 'Unknown owner'} · {intelligencePacket.strategicContext.sourceDate ?? 'Unknown date'}</p>
                  </div>
                  <div>
                    <span>Executive use</span>
                    <p>{intelligencePacket.strategicContextReadiness.canonicalForExecutiveUse ? 'Source-owner ready after human review' : 'Blocked until approved brand foundations, positioning/objectives, and creative/claims sources are loaded'}</p>
                  </div>
                  <div>
                    <span>Runtime file drop</span>
                    <p>{intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.status.replaceAll('_', ' ')} · {intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.defaultRuntimeConsumptionEnabled ? 'runtime enabled' : 'runtime disabled'} · {intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.canonicalUseEnabled ? 'canonical use enabled' : 'canonical use disabled'}</p>
                  </div>
                  <div>
                    <span>Expected source directory</span>
                    <p>{intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.expectedSourceDirectory}</p>
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.strategicContextReadiness.checks.map((check) => (
                      <article className={`packet-card ${check.status === 'missing' ? 'high' : check.status === 'source_ready' ? '' : 'medium'}`} key={check.id}>
                        <div className="packet-card-head">
                          <strong>{check.label}</strong>
                          <StatusPill label={check.status.replaceAll('_', ' ')} tone={check.status === 'source_ready' ? 'good' : check.status === 'missing' ? 'bad' : 'warn'} />
                        </div>
                        <p>{check.detail}</p>
                        <em>{check.requiredSource}</em>
                      </article>
                    ))}
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.strategicContextReadiness.handoffRequirements.map((requirement) => (
                      <article className={`packet-card ${requirement.currentStatus === 'missing' ? 'high' : requirement.currentStatus === 'source_ready' ? '' : 'medium'}`} key={requirement.id}>
                        <div className="packet-card-head">
                          <strong>{requirement.label}</strong>
                          <StatusPill label={requirement.currentStatus.replaceAll('_', ' ')} tone={requirement.currentStatus === 'source_ready' ? 'good' : requirement.currentStatus === 'missing' ? 'bad' : 'warn'} />
                        </div>
                        <p>{requirement.sourceOwnerRole}</p>
                        <p>{requirement.nextAction}</p>
                        <em>{requirement.acceptedSourceTypes.join(', ')} · {requirement.promotionGate.replaceAll('_', ' ')}</em>
                      </article>
                    ))}
                  </div>
                  <div className="packet-card-grid">
                    {intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.audit.fileKindAudits.map((audit) => (
                      <article className={`packet-card ${audit.present ? '' : 'high'}`} key={audit.fileKind}>
                        <div className="packet-card-head">
                          <strong>{audit.fileKind.replaceAll('_', ' ')}</strong>
                          <StatusPill label={audit.present ? 'Present' : 'Missing'} tone={audit.present ? 'good' : 'bad'} />
                        </div>
                        <p>{audit.present ? `${audit.rowCount} rows across ${audit.brandIds.length || 0} brands.` : 'Required before official Brand Strategic Context runtime replacement.'}</p>
                        <em>{audit.expectedPathHint}</em>
                        {audit.issues.slice(0, 2).map((issue) => <em key={`${audit.fileKind}-${issue}`}>{issue}</em>)}
                      </article>
                    ))}
                  </div>
                  {intelligencePacket.strategicContext.objectives.length > 0 && (
                    <div>
                      <span>Objectives</span>
                      <p>{intelligencePacket.strategicContext.objectives.join(' · ')}</p>
                    </div>
                  )}
                  {intelligencePacket.strategicContext.planningPriorities.length > 0 && (
                    <div>
                      <span>Planning priorities</span>
                      <p>{intelligencePacket.strategicContext.planningPriorities.join(' · ')}</p>
                    </div>
                  )}
                  {intelligencePacket.strategicContext.approvedClaims.length > 0 && (
                    <div>
                      <span>Claims allowed by this source</span>
                      <p>{intelligencePacket.strategicContext.approvedClaims.join(' · ')}</p>
                    </div>
                  )}
                  {intelligencePacket.strategicContext.claimsNotToMake.length > 0 && (
                    <div>
                      <span>Claims not to make</span>
                      <p>{intelligencePacket.strategicContext.claimsNotToMake.join(' · ')}</p>
                    </div>
                  )}
                  <ul>
                    {intelligencePacket.strategicContextRuntimeSourceFileDropReadiness.blockers.slice(0, 4).map((blocker) => <li key={`strategic-runtime-${blocker}`}>{blocker}</li>)}
                    {intelligencePacket.strategicContextReadiness.caveats.map((caveat) => <li key={`strategic-ready-${caveat}`}>{caveat}</li>)}
                    {intelligencePacket.strategicContext.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}
                  </ul>
                </article>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Evidence gaps</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.evidenceGaps.map((gap) => (
                    <article className={`packet-card ${gap.severity}`} key={gap.id}>
                      <div className="packet-card-head">
                        <strong>{gap.label}</strong>
                        <StatusPill label={gap.severity} tone={gap.severity === 'high' ? 'bad' : gap.severity === 'medium' ? 'warn' : 'neutral'} />
                      </div>
                      <p>{gap.missingInput}</p>
                      <em>{gap.whyItMatters}</em>
                      <span>{gap.bestNextSource}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <Sparkles size={16} />
                  <h3>Starter provocations</h3>
                </div>
                <div className="packet-card-grid">
                  {intelligencePacket.starterProvocations.map((provocation) => (
                    <article className="packet-card" key={provocation.id}>
                      <div className="packet-card-head">
                        <strong>{provocation.title}</strong>
                        <StatusPill label={provocation.urgency.replaceAll('_', ' ')} tone={provocation.urgency === 'act_now' ? 'warn' : 'neutral'} />
                      </div>
                      <p><b>What:</b> {provocation.what}</p>
                      <p><b>So what:</b> {provocation.soWhat}</p>
                      <p><b>Now what:</b> {provocation.nowWhat}</p>
                      {!!provocation.evidenceLabels.length && <em>Evidence: {provocation.evidenceLabels.join(' · ')}</em>}
                      {!!provocation.caveats.length && <ul>{provocation.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>}
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <LineChart size={16} />
                  <h3>Recommended dynamic views</h3>
                </div>
                <div className="packet-card-grid">
                  {recommendedViews.map((view) => (
                    <article className="packet-card" key={view.id}>
                      <div className="packet-card-head">
                        <strong>{view.name}</strong>
                        <StatusPill label={view.family.replaceAll('_', ' ')} />
                      </div>
                      <p>{view.purpose}</p>
                      <em>Data: {view.requiredData.join(' · ')}</em>
                      <span>{view.evidenceRequired ? 'Evidence required' : 'Evidence optional'} · {view.supportedModes.join(' · ')}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="packet-section">
                <div className="packet-section-title">
                  <ShieldAlert size={16} />
                  <h3>Agent guardrails</h3>
                </div>
                <div className="packet-guardrail-list">
                  {intelligencePacket.agentGuardrails.map((guardrail) => <p key={guardrail}>{guardrail}</p>)}
                </div>
              </section>

              <details className="packet-json-panel">
                <summary><FileJson size={16} /> Raw Brand Intelligence Packet JSON</summary>
                <JsonBlock value={intelligencePacket} />
              </details>
            </div>
          )}

          {activeTab === 'ai_packet' && (
            <div className="data-section">
              <div className="data-section-head">
                <h2>AI Context Packet</h2>
                <span><FileJson size={14} /> Scoped packet, no secrets</span>
              </div>
              <JsonBlock value={packet.aiContextPacket} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
