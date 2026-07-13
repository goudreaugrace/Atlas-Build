import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Database, Layers3, Sparkles } from 'lucide-react';
import { bps, pct } from '@/src/lib/atlas/assistant';
import { demoNegotiation, demoStrategyWatchouts, demoVisualEvidenceModules } from '@/src/lib/atlas/demo-data';
import type { NegotiationLever, Scenario } from '@/src/lib/atlas/types';
import AtlasReportActions from './AtlasReportActions';

type ReportPageProps = {
  params: Promise<{ negotiationId: string; reportType: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ManualState = {
  concessionPct: number;
  priceMovePct: number;
  sanctionPressurePct: number;
  tradeInvestmentEuros: number;
  volumeElasticity: number;
};

type LeverImpact = {
  grossMarginDeltaBps: number;
  label: string;
  netRevenueDeltaEuros: number;
  probabilityDeltaPts: number;
  sanctionPressureDelta: number;
  tradeSpendEuros: number;
  volumeDeltaPct: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numericParam(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(firstParam(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function eurosWhole(value: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(value);
}

function formatSignedEuros(value: number) {
  const formatted = Math.abs(value) >= 1000000
    ? new Intl.NumberFormat('en-GB', { currency: 'EUR', notation: 'compact', style: 'currency' }).format(value)
    : eurosWhole(value);
  return value > 0 ? `+${formatted}` : formatted;
}

function riskScore(risk: Scenario['sanctionRisk']) {
  if (risk === 'high') return 82;
  if (risk === 'medium') return 52;
  return 24;
}

function redLineLabel(value: number, redLine: number): Scenario['redLineProximity'] {
  if (value < redLine) return 'breach';
  if (value - redLine < 0.4) return 'watch';
  return 'safe';
}

function defaultLeverLevels(scenario: Scenario) {
  return Object.fromEntries(demoNegotiation.levers.map((lever) => [
    lever.id,
    scenario.levers.includes(lever.id) ? 60 : 0
  ]));
}

function parseLeverLevels(value: string | string[] | undefined, scenario: Scenario) {
  const levels = defaultLeverLevels(scenario);
  const raw = firstParam(value);
  if (!raw) return levels;
  for (const pair of raw.split(',')) {
    const [id, level] = pair.split(':');
    const parsed = Number(level);
    if (id && Number.isFinite(parsed)) levels[id] = clamp(parsed, 0, 100);
  }
  return levels;
}

function leverImpact(lever: NegotiationLever, level: number): LeverImpact {
  const intensity = level / 100;
  const tradeSpendEuros = Math.round(lever.costEuros * intensity);

  if (lever.type === 'phasing') {
    return {
      grossMarginDeltaBps: Math.round(-6 * intensity),
      label: 'Softer shelf-price transition; protects base price if phase two is locked.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .35 + level * 12000),
      probabilityDeltaPts: Math.round(14 * intensity),
      sanctionPressureDelta: Math.round(-10 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.35 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'promo') {
    return {
      grossMarginDeltaBps: Math.round(-14 * intensity),
      label: 'Improves customer value story but can leak margin if stacked with concession.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .62 + level * 18000),
      probabilityDeltaPts: Math.round(12 * intensity),
      sanctionPressureDelta: Math.round(-5 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.8 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'innovation') {
    return {
      grossMarginDeltaBps: Math.round(4 * intensity),
      label: 'Adds growth narrative and premiumization proof with low red-line exposure.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .22 + level * 24000),
      probabilityDeltaPts: Math.round(7 * intensity),
      sanctionPressureDelta: Math.round(-3 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.45 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'sanction_mitigation') {
    return {
      grossMarginDeltaBps: Math.round(-18 * intensity),
      label: 'Raises continuity odds only when sanction language is explicit and approved.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .72),
      probabilityDeltaPts: Math.round(16 * intensity),
      sanctionPressureDelta: Math.round(-24 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.65 * intensity).toFixed(1))
    };
  }

  if (lever.type === 'scope') {
    return {
      grossMarginDeltaBps: Math.round(-9 * intensity),
      label: 'Trades local executional scope without reopening central base-price strategy.',
      netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .45 + level * 9000),
      probabilityDeltaPts: Math.round(9 * intensity),
      sanctionPressureDelta: Math.round(-6 * intensity),
      tradeSpendEuros,
      volumeDeltaPct: Number((.35 * intensity).toFixed(1))
    };
  }

  return {
    grossMarginDeltaBps: Math.round(-8 * intensity),
    label: 'Commercial support lever with approval and source-confidence checks.',
    netRevenueDeltaEuros: Math.round(-tradeSpendEuros * .5 + level * 10000),
    probabilityDeltaPts: Math.round(8 * intensity),
    sanctionPressureDelta: Math.round(-4 * intensity),
    tradeSpendEuros,
    volumeDeltaPct: Number((.3 * intensity).toFixed(1))
  };
}

function buildModels(scenario: Scenario, manual: ManualState, leverLevels: Record<string, number>) {
  const impacts = demoNegotiation.levers.map((lever) => ({
    impact: leverImpact(lever, leverLevels[lever.id] ?? 0),
    lever,
    level: leverLevels[lever.id] ?? 0
  }));
  const leverModel = {
    grossMarginDeltaBps: impacts.reduce((sum, item) => sum + item.impact.grossMarginDeltaBps, 0),
    impacts,
    netRevenueDeltaEuros: impacts.reduce((sum, item) => sum + item.impact.netRevenueDeltaEuros, 0),
    probabilityDeltaPts: impacts.reduce((sum, item) => sum + item.impact.probabilityDeltaPts, 0),
    sanctionPressureDelta: impacts.reduce((sum, item) => sum + item.impact.sanctionPressureDelta, 0),
    tradeSpendEuros: impacts.reduce((sum, item) => sum + item.impact.tradeSpendEuros, 0),
    volumeDeltaPct: Number(impacts.reduce((sum, item) => sum + item.impact.volumeDeltaPct, 0).toFixed(1))
  };
  const priceDelta = manual.priceMovePct - scenario.priceMovePct;
  const concessionDelta = manual.concessionPct - scenario.concessionPct;
  const netRevenueImpactEuros = Math.round(
    scenario.netRevenueImpactEuros
    + priceDelta * 1180000
    - concessionDelta * 690000
    - manual.tradeInvestmentEuros
    + leverModel.netRevenueDeltaEuros
  );
  const grossMarginImpactBps = Math.round(
    scenario.grossMarginImpactBps
    + priceDelta * 24
    - concessionDelta * 18
    - manual.tradeInvestmentEuros / 95000
    + leverModel.grossMarginDeltaBps
  );
  const probabilityToLandPct = Math.round(clamp(
    scenario.probabilityToLandPct
    - priceDelta * 7
    + concessionDelta * 5
    + manual.tradeInvestmentEuros / 260000
    + leverModel.probabilityDeltaPts
    - (manual.sanctionPressurePct - riskScore(scenario.sanctionRisk)) * 0.18,
    12,
    92
  ));
  const adjustedSanctionPressure = clamp(manual.sanctionPressurePct + leverModel.sanctionPressureDelta, 0, 100);
  const sanctionRisk: Scenario['sanctionRisk'] = adjustedSanctionPressure >= 68 ? 'high' : adjustedSanctionPressure >= 38 ? 'medium' : 'low';

  return {
    leverModel,
    manualModel: {
      adjustedSanctionPressure,
      grossMarginImpactBps,
      netRevenueImpactEuros,
      probabilityToLandPct,
      redLineProximity: redLineLabel(manual.priceMovePct, demoNegotiation.pricingPosition.redLinePriceIncreasePct.value),
      sanctionRisk,
      tradeSpendEuros: manual.tradeInvestmentEuros + leverModel.tradeSpendEuros,
      volumeImpactPct: Number((-manual.priceMovePct * manual.volumeElasticity + leverModel.volumeDeltaPct).toFixed(1))
    }
  };
}

function ReportMetricStrip({
  isKamSafe,
  manual,
  manualModel
}: {
  isKamSafe: boolean;
  manual: ManualState;
  manualModel: ReturnType<typeof buildModels>['manualModel'];
}) {
  const metrics = isKamSafe
    ? [
      ['Price move', pct(manual.priceMovePct)],
      ['Support', pct(manual.concessionPct)],
      ['NR impact', formatSignedEuros(manualModel.netRevenueImpactEuros)],
      ['Land odds', `${manualModel.probabilityToLandPct}%`],
      ['Risk', manualModel.sanctionRisk],
      ['Readiness', 'field-safe draft']
    ]
    : [
      ['Price', pct(manual.priceMovePct)],
      ['Concession', pct(manual.concessionPct)],
      ['NR', formatSignedEuros(manualModel.netRevenueImpactEuros)],
      ['GM', bps(manualModel.grossMarginImpactBps)],
      ['Volume', pct(manualModel.volumeImpactPct)],
      ['Land', `${manualModel.probabilityToLandPct}%`],
      ['Risk', manualModel.sanctionRisk],
      ['Red line', manualModel.redLineProximity]
    ];

  return (
    <div className={`atlas-report-metrics ${isKamSafe ? 'kam-safe' : ''}`}>
      {metrics.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ReportPanel({
  children,
  eyebrow,
  title
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="atlas-report-panel">
      <span className="section-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function StrategyDeckOutput({ scenario }: { scenario: Scenario }) {
  const currentUpdate = demoNegotiation.strategyUpdates[0];
  const weakeningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status !== 'supports_strategy');
  const strengtheningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status === 'supports_strategy');

  return (
    <main className="atlas-report-page strategy-deck-report">
      <section className="atlas-report-actionbar" aria-label="Deck navigation">
        <Link href={`/negotiation/${demoNegotiation.id}?panel=evidence#visual-evidence`}>
          <ArrowLeft size={15} /> Back to Strategy
        </Link>
        <AtlasReportActions />
      </section>

      <article className="atlas-deck-document">
        <section className="atlas-report-brandbar" aria-label="Deck brand">
          <strong>PepsiCo</strong>
          <span>ATLAS Strategy Workspace</span>
          <em>Strategy deck PDF output</em>
        </section>

        <section className="atlas-deck-slide atlas-deck-cover">
          <span className="section-kicker"><Layers3 size={14} /> Generated strategy deck</span>
          <h1>{demoNegotiation.customer} Group 2026 Negotiation Strategy</h1>
          <p>{demoNegotiation.sellStory.narrative}</p>
          <dl>
            <div><dt>Recommended position</dt><dd>{demoNegotiation.recommendedPosition}</dd></div>
            <div><dt>Buyer ask</dt><dd>{pct(demoNegotiation.pricingPosition.currentCustomerAskPct.value)}</dd></div>
            <div><dt>Target</dt><dd>{pct(demoNegotiation.pricingPosition.targetPriceIncreasePct.value)}</dd></div>
            <div><dt>Readiness</dt><dd>{demoNegotiation.strategyReadinessState}</dd></div>
          </dl>
        </section>

        <section className="atlas-deck-slide">
          <span className="section-kicker">Slide 1 / strategy position</span>
          <h2>Hold 3.0% counter while validating fallback capacity.</h2>
          <div className="atlas-deck-two-column">
            <div>
              <h3>Defense logic</h3>
              <p>{demoNegotiation.sellStory.defense}</p>
            </div>
            <div>
              <h3>Next decision</h3>
              <p>{demoNegotiation.blockingIssue}</p>
            </div>
          </div>
        </section>

        <section className="atlas-deck-slide">
          <span className="section-kicker">Slide 2 / evidence storyboard</span>
          <h2>Proof sequence for the sell story.</h2>
          <div className="atlas-deck-storyboard">
            {demoVisualEvidenceModules.map((module, index) => (
              <article key={module.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{module.deckUse}</strong>
                  <h3>{module.title}</h3>
                  <p>{module.keyTakeaway}</p>
                  <em>{module.source.source} / {module.source.freshness} / {module.source.confidence} confidence</em>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="atlas-deck-slide">
          <span className="section-kicker">Slide 3 / scenario movement</span>
          <h2>{scenario.name}: strategic movement path.</h2>
          <div className="atlas-deck-metrics">
            <div><span>Price move</span><strong>{pct(scenario.priceMovePct)}</strong></div>
            <div><span>Concession</span><strong>{pct(scenario.concessionPct)}</strong></div>
            <div><span>NR impact</span><strong>{formatSignedEuros(scenario.netRevenueImpactEuros)}</strong></div>
            <div><span>GM impact</span><strong>{bps(scenario.grossMarginImpactBps)}</strong></div>
            <div><span>Volume</span><strong>{pct(scenario.volumeImpactPct)}</strong></div>
            <div><span>Land odds</span><strong>{scenario.probabilityToLandPct}%</strong></div>
          </div>
          <p>{scenario.recommendedUseCase}</p>
        </section>

        <section className="atlas-deck-slide">
          <span className="section-kicker">Slide 4 / watchouts</span>
          <h2>What can change the recommendation.</h2>
          <div className="atlas-deck-two-column">
            <div>
              <h3>Could weaken</h3>
              <ul>
                {weakeningWatchouts.slice(0, 3).map((watchout) => (
                  <li key={watchout.id}>{watchout.title}: {watchout.action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Could strengthen</h3>
              <ul>
                {strengtheningWatchouts.map((watchout) => (
                  <li key={watchout.id}>{watchout.title}: {watchout.action}</li>
                ))}
                <li>Commodity data still supports a defended price position if refreshed before review.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="atlas-deck-slide">
          <span className="section-kicker">Slide 5 / version and source trail</span>
          <h2>{currentUpdate.version} update: why the strategy moved.</h2>
          <div className="atlas-deck-two-column">
            <div>
              <h3>What changed</h3>
              <ul>
                {currentUpdate.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
            </div>
            <div>
              <h3>Source trail</h3>
              <p>{currentUpdate.triggeredBy}</p>
              <p>{currentUpdate.source.source} / {currentUpdate.source.freshness} / {currentUpdate.source.confidence} confidence.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

export default async function AtlasReportPage({ params, searchParams }: ReportPageProps) {
  const { negotiationId, reportType } = await params;
  const query = await searchParams ?? {};
  if (negotiationId !== demoNegotiation.id) notFound();
  if (reportType !== 'cno-prep-brief' && reportType !== 'kam-safe-pack' && reportType !== 'strategy-deck') notFound();

  const scenarioId = firstParam(query.scenario) ?? demoNegotiation.activeScenarioId;
  const scenario = demoNegotiation.scenarios.find((item) => item.id === scenarioId) ?? demoNegotiation.scenarios[1];
  const manual: ManualState = {
    concessionPct: numericParam(query.concession, scenario.concessionPct),
    priceMovePct: numericParam(query.price, scenario.priceMovePct),
    sanctionPressurePct: numericParam(query.sanction, riskScore(scenario.sanctionRisk)),
    tradeInvestmentEuros: numericParam(query.trade, 0),
    volumeElasticity: numericParam(query.elasticity, Math.abs(scenario.volumeImpactPct / Math.max(scenario.priceMovePct, 1)))
  };
  const leverLevels = parseLeverLevels(query.levers, scenario);
  const { leverModel, manualModel } = buildModels(scenario, manual, leverLevels);
  if (reportType === 'strategy-deck') return <StrategyDeckOutput scenario={scenario} />;

  const isKamSafe = reportType === 'kam-safe-pack';
  const activeLevers = leverModel.impacts.filter((item) => item.level > 0);
  const reportTitle = isKamSafe
    ? `${demoNegotiation.customer} ${demoNegotiation.market} KAM-safe Pack`
    : `${demoNegotiation.customer} ${demoNegotiation.market} CNO Prep Brief`;
  return (
    <main className={`atlas-report-page ${isKamSafe ? 'kam-safe-report' : 'cno-report'}`}>
      <section className="atlas-report-actionbar" aria-label="Report navigation">
        <Link href={`/negotiation/${demoNegotiation.id}?panel=scenario#scenario`}>
          <ArrowLeft size={15} /> Back to Strategy Stress Test
        </Link>
        <Link href="/">
          <ArrowLeft size={15} /> Back to ATLAS
        </Link>
        <AtlasReportActions />
      </section>

      <article className="atlas-report-document">
        <section className="atlas-report-brandbar" aria-label="Report brand">
          <strong>PepsiCo</strong>
          <span>ATLAS Negotiation OS</span>
          <em>{isKamSafe ? 'KAM-safe PDF output' : 'CNO internal PDF output'}</em>
        </section>

        <section className="atlas-report-cover">
          <div>
            <span className="section-kicker"><Sparkles size={14} /> {isKamSafe ? 'KAM-safe pack' : 'CNO prep brief'}</span>
            <h1>{reportTitle}</h1>
            <p>{isKamSafe
              ? `${scenario.name}: Field guidance for value framing, phased timing, approved levers, and escalation handling.`
              : `${scenario.name}: ${scenario.strategy}`}
            </p>
          </div>
          <dl>
            <div><dt>Customer</dt><dd>{demoNegotiation.customer}</dd></div>
            <div><dt>Market</dt><dd>{demoNegotiation.market}</dd></div>
            <div><dt>Cycle</dt><dd>{demoNegotiation.cycle}</dd></div>
            <div><dt>Source freshness</dt><dd>{demoNegotiation.lastSourceSync}</dd></div>
          </dl>
        </section>

        <ReportMetricStrip isKamSafe={isKamSafe} manual={manual} manualModel={manualModel} />

        {isKamSafe ? (
          <section className="atlas-report-grid">
            <ReportPanel eyebrow="Field posture" title="Lead with value; keep internal thresholds out of the room.">
              <p>Use {scenario.name} as the field guidance basis. Position phasing, shopper activation, and category value before any permanent concession language.</p>
              <ul>
                <li>Anchor on customer value and continuity.</li>
                <li>Use approved proof only.</li>
                <li>Escalate delisting, reduced visibility, or base-price reopening requests.</li>
              </ul>
            </ReportPanel>

            <ReportPanel eyebrow="Talk track" title="What the field team can say.">
              <ul>
                <li>We can discuss phased timing and shopper activation to help the transition land with shoppers.</li>
                <li>We are protecting category value and continuity while keeping the plan practical for France.</li>
                <li>We can bring approved evidence on cost-to-serve, category performance, and execution support.</li>
              </ul>
            </ReportPanel>

            <ReportPanel eyebrow="Permitted levers" title="Approved levers at the indicated intensity.">
              <div className="atlas-report-lever-list">
                {activeLevers.map(({ impact, lever, level }) => (
                  <article key={lever.id}>
                    <strong>{lever.label}</strong>
                    <span>{level}% / {lever.owner} / {lever.availability.replaceAll('_', ' ')}</span>
                    <p>{lever.expectedCustomerValue}</p>
                    <em>{impact.label}</em>
                  </article>
                ))}
              </div>
            </ReportPanel>

            <ReportPanel eyebrow="Escalation" title="When the field team must come back to central.">
              <ul>
                {demoNegotiation.levers.filter((lever) => lever.availability === 'approval_required').map((lever) => (
                  <li key={lever.id}>{lever.escalationTrigger}</li>
                ))}
                <li>Any request for permanent trade-margin relief or customer-facing confirmation of internal fallback logic.</li>
              </ul>
            </ReportPanel>
          </section>
        ) : (
          <section className="atlas-report-grid">
            <ReportPanel eyebrow="Recommendation" title={`Use ${scenario.name} as the working CNO path.`}>
              <p>{scenario.recommendedUseCase}</p>
              <p>Current cockpit view: {pct(manual.priceMovePct)} price move, {pct(manual.concessionPct)} concession, {formatSignedEuros(manualModel.netRevenueImpactEuros)} NR, {bps(manualModel.grossMarginImpactBps)} GM, {manualModel.probabilityToLandPct}% probability to land.</p>
            </ReportPanel>

            <ReportPanel eyebrow="Financial impact" title="Value, margin, and risk implications.">
              <dl className="atlas-report-dl">
                <div><dt>Net revenue</dt><dd>{formatSignedEuros(manualModel.netRevenueImpactEuros)}</dd></div>
                <div><dt>Gross margin</dt><dd>{bps(manualModel.grossMarginImpactBps)}</dd></div>
                <div><dt>Volume</dt><dd>{pct(manualModel.volumeImpactPct)}</dd></div>
                <div><dt>Lever spend</dt><dd>{eurosWhole(manualModel.tradeSpendEuros)}</dd></div>
                <div><dt>Sanction pressure</dt><dd>{Math.round(manualModel.adjustedSanctionPressure)} / 100</dd></div>
                <div><dt>Red-line proximity</dt><dd>{manualModel.redLineProximity}</dd></div>
              </dl>
            </ReportPanel>

            <ReportPanel eyebrow="Guardrails" title="What must stay internal.">
              <ul>
                <li>Do not reveal red line: {pct(demoNegotiation.pricingPosition.redLinePriceIncreasePct.value)}.</li>
                <li>Do not expose fallback thresholds, sensitive margin controls, or confidence gaps.</li>
                <li>Require CNO approval before field guidance if any approval-required lever is active.</li>
              </ul>
            </ReportPanel>

            <ReportPanel eyebrow="Next best action" title="Recommended move in the negotiation.">
              <p>Defend value with proof, use phased timing before permanent concession, and escalate if sanction language becomes explicit. Keep {scenario.name} as the working path unless Carrefour reopens base price or makes a hard sanction threat.</p>
            </ReportPanel>

            <ReportPanel eyebrow="Selected levers" title="Scenario controls and modeled impact.">
              <div className="atlas-report-lever-list">
                {activeLevers.map(({ impact, lever, level }) => (
                  <article key={lever.id}>
                    <strong>{lever.label}</strong>
                    <span>{level}% / {lever.owner} / {lever.availability.replaceAll('_', ' ')}</span>
                    <p>{impact.label}</p>
                    <em>Spend {eurosWhole(impact.tradeSpendEuros)} / NR {formatSignedEuros(impact.netRevenueDeltaEuros)} / GM {bps(impact.grossMarginDeltaBps)} / Land {impact.probabilityDeltaPts >= 0 ? '+' : ''}{impact.probabilityDeltaPts} pts</em>
                  </article>
                ))}
              </div>
            </ReportPanel>

            <ReportPanel eyebrow="Open decisions" title="Items for CNO alignment before field cascade.">
              <ul>
                <li>Confirm whether the active concession is the maximum approved field posture.</li>
                <li>Confirm which approval-required levers can be converted into KAM-safe guidance.</li>
                <li>Decide whether sanction mitigation remains held for explicit threat language only.</li>
              </ul>
            </ReportPanel>
          </section>
        )}

        <section className="atlas-report-proof-row">
          <ReportPanel eyebrow="Evidence trail" title="Sources attached to this output.">
            <div className="atlas-report-proof-list">
              {demoNegotiation.evidenceClaims.slice(0, isKamSafe ? 3 : 5).filter((claim) => !isKamSafe || claim.audienceSafe.includes('kam_safe')).map((claim) => (
                <article key={claim.id}>
                  <Database size={15} />
                  <div>
                    <strong>{claim.label.replaceAll('_', ' ')} / {claim.confidence}</strong>
                    <p>{claim.claim}</p>
                    <em>{claim.source} / {claim.freshness}</em>
                  </div>
                </article>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel eyebrow="Assumptions" title={isKamSafe ? 'Field-safe constraints' : 'Confidence and assumptions'}>
            <ul>
              {scenario.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
              <li>{scenario.confidence} model confidence; source freshness is {demoNegotiation.lastSourceSync}.</li>
              <li>{isKamSafe ? 'Sensitive internal thresholds, fallback logic, margin controls, and confidence gaps are redacted.' : demoNegotiation.sourceReadiness}</li>
            </ul>
          </ReportPanel>
        </section>
      </article>
    </main>
  );
}
