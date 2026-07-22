'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileSearch,
  Filter,
  Globe2,
  Layers3,
  LineChart,
  Loader2,
  Mic,
  Newspaper,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  TrendingUp,
  X
} from 'lucide-react';
import {
  atlasIntelligenceSeed,
  buildAtlasIntelligencePacket,
  buildBuyingGroupWorkspacePacket,
  buildNegotiationPlanPacket,
  buildRetrievalMessage,
  calculateScenarioOutputs,
  competitorMovesFor,
  documentsFor,
  euros,
  getBuyingGroup,
  getMarket,
  pct,
  riskRank,
  signalsFor,
  timelineFor
} from '@/src/lib/atlas-intelligence/kernel';
import type {
  AtlasConfidence,
  AtlasRiskLevel,
  AtlasStatus,
  BuyingGroup,
  CompetitorMove,
  CrossMarketPattern,
  DocumentArtifact,
  ExternalSignal,
  Market,
  ScenarioInputs,
  SourceMeta,
  TimelineEvent
} from '@/src/lib/atlas-intelligence/types';

type HubView =
  | 'overview'
  | 'markets'
  | 'market'
  | 'buyingGroups'
  | 'buyingGroup'
  | 'signals'
  | 'competitors'
  | 'financialImpact'
  | 'documents'
  | 'timeline'
  | 'database'
  | 'howItWorks'
  | 'scenarioModels'
  | 'scenarioCompare'
  | 'assistant';

type AtlasIntelligenceHubProps = {
  view: HubView;
  marketId?: string;
  buyingGroupId?: string;
  initialPrompt?: string;
  initialGeneratedView?: string;
  initialScenarioCaseId?: string;
  initialScenarioId?: string;
  initialScenarioLabMode?: string;
  initialSort?: string;
  initialMonitorTab?: string;
  initialBuyingGroupView?: string;
  initialBuyingGroupPhase?: string;
  initialBuyingGroupPrompt?: string;
  returnLabel?: string;
  returnTo?: string;
};

const packet = buildAtlasIntelligencePacket();

type BuyingGroupWorkspacePacket = NonNullable<ReturnType<typeof buildBuyingGroupWorkspacePacket>>;

type ScenarioLabMode = 'review' | 'create';

type ScenarioLabOption = {
  atlasScore: number;
  buyerResponse: string;
  basedOnId?: string;
  caseId?: string;
  createdAt: string;
  description: string;
  evidenceStrength: number;
  extraLeverSummary?: string[];
  guardrailRisk: string;
  id: string;
  inputs: ScenarioInputs;
  likelihood: number;
  name: string;
  origin: 'atlas' | 'manual';
  outputs: ReturnType<typeof calculateScenarioOutputs>;
  recommendedEdit: string;
  relationshipRisk: string;
  scenarioStyle: string;
  valueProtected: number;
  why: string;
};

type ScenarioCase = {
  actionLabel: string;
  approaches: ScenarioLabOption[];
  buyingGroup: string;
  buyingGroupId?: string;
  confidence: 'High' | 'Medium-high' | 'Medium';
  createdAt: string;
  decisionQuestion: string;
  id: string;
  impactLabel: string;
  impactValue: string;
  market: string;
  marketId?: string;
  order: string;
  priority: 'action' | 'watch' | 'reference';
  reaction: string;
  recommendedApproachId: string;
  sourceLabel: string;
  sources: string[];
  status: 'Needs CNO review' | 'Ready to use' | 'Monitoring';
  title: string;
  trigger: string;
  triggerType: string;
  whyAtlasModeled: string;
};

type StrategyPosture = {
  accent: string;
  clockLabel: string;
  drivers: string[];
  guidance: string[];
  posture: string;
  pressureScore: number;
  rationale: string;
  segmentIndex: number;
};

const strategyPostureSegments = [
  { description: 'The buyer and CNO are exchanging positions, but value has not been clearly attached yet.', fill: '#d8e2eb', label: 'Bartering' },
  { description: 'The buyer is likely to counter repeatedly and test how quickly PepsiCo moves from the ask.', fill: '#c8d8e4', label: 'Haggling' },
  { description: 'The scenario protects margin aggressively, but creates higher buyer resistance and escalation risk.', fill: '#e8cac8', label: 'Hard Bargaining' },
  { description: 'Both sides are trading specific terms, support, or commitments rather than only arguing price.', fill: '#cddbd0', label: 'Dealing' },
  { description: 'Concessions are likely needed, so every move should be tied to a measurable buyer commitment.', fill: '#f4aa00', label: 'Concession Trading' },
  { description: 'Both sides trade low-cost, high-value items and search for extra contract value.', fill: '#c5ddb8', label: 'Win-Win' },
  { description: 'The scenario leans on shared planning, category growth, and longer-term relationship value.', fill: '#b7d2a8', label: 'Partnership' },
  { description: 'The move protects trust and momentum before asking the buyer to accept a harder trade.', fill: '#a9c9ed', label: 'Relationship Building' }
];

const strategyPostureClockLabels = ['1:30', '3:00', '4:30', '6:00', '7:30', '8:30', '9:30', '10:30'];

function polarToClockPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

function clockArcPath(startDeg: number, endDeg: number, innerRadius: number, outerRadius: number) {
  const cx = 120;
  const cy = 120;
  const outerStart = polarToClockPoint(cx, cy, outerRadius, startDeg);
  const outerEnd = polarToClockPoint(cx, cy, outerRadius, endDeg);
  const innerEnd = polarToClockPoint(cx, cy, innerRadius, endDeg);
  const innerStart = polarToClockPoint(cx, cy, innerRadius, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z'
  ].join(' ');
}

function clockSegmentDistance(a: number, b: number, total: number) {
  const raw = Math.abs(a - b);
  return Math.min(raw, total - raw);
}

function strategyPostureForScenario(
  inputs: ScenarioInputs,
  scenarioStyle = '',
  relationshipRisk = '',
  buyerResponse = ''
): StrategyPosture {
  const style = scenarioStyle.toLowerCase();
  const risk = relationshipRisk.toLowerCase();
  const response = buyerResponse.toLowerCase();
  const askRealizationGap = Math.max(0, inputs.priceIncreasePercent - inputs.expectedRealizationPercent);
  const acceptance = inputs.buyerAcceptanceProbability;
  const riskBoost = risk.includes('very high') ? 14 : risk.includes('high') ? 10 : risk.includes('medium') ? 5 : 0;
  const styleBoost = style.includes('aggressive') ? 8 : style.includes('buyer') || response.includes('counter') ? 6 : style.includes('conservative') ? -5 : 0;
  const supportRelief = Math.max(0, inputs.tradeSpendChange) / 90000;
  const volumeRelief = Math.max(0, inputs.volumeChangePercent) * 5;
  const pressureScore = Math.round(
    inputs.priceIncreasePercent * 9 +
    askRealizationGap * 18 +
    riskBoost +
    styleBoost -
    acceptance * 0.28 -
    supportRelief -
    volumeRelief
  );
  const drivers = [
    `${pct(inputs.priceIncreasePercent)} ask vs ${pct(inputs.expectedRealizationPercent)} expected realization`,
    `${acceptance.toFixed(0)}% buyer acceptance probability`,
    `${euros(inputs.tradeSpendChange)} trade support modeled`,
    `${pct(inputs.volumeChangePercent)} volume risk`,
    `${pressureScore} posture score from ask, realization, support, acceptance, volume, and risk`
  ];
  if (relationshipRisk) drivers.push(`${relationshipRisk} relationship / guardrail read`);

  let segmentIndex = 4;
  if (pressureScore >= 34 || (risk.includes('high') && acceptance < 58)) {
    segmentIndex = 2;
    drivers.push('The lever mix creates enough pressure that the buyer is likely to read this as hard bargaining.');
  } else if (pressureScore >= 24 || response.includes('counter')) {
    segmentIndex = 1;
    drivers.push('The buyer-counter pattern means the scenario is likely to become positional.');
  } else if (askRealizationGap >= 0.45 || inputs.tradeSpendChange >= 300000) {
    segmentIndex = 4;
    drivers.push('The ask-to-realization gap or support level means concessions must be traded, not given.');
  } else if (inputs.tradeSpendChange > 150000) {
    segmentIndex = 3;
    drivers.push('Trade support is active, so the negotiation moves into a deal structure.');
  } else if (acceptance >= 74 && inputs.volumeChangePercent >= -0.6) {
    segmentIndex = 5;
    drivers.push('Higher acceptance with limited volume risk points to mutual value creation.');
  } else if (style.includes('conservative') || acceptance >= 68) {
    segmentIndex = 7;
    drivers.push('Lower-friction assumptions point to preserving trust and momentum.');
  } else {
    segmentIndex = 6;
    drivers.push('Limited concession pressure lets the CNO frame the move as shared planning.');
  }

  const posture = strategyPostureSegments[segmentIndex]?.label ?? 'Concession Trading';
  const clockLabel = strategyPostureClockLabels[segmentIndex] ?? '7:30';
  const postureGuidance: Record<string, Pick<StrategyPosture, 'accent' | 'guidance' | 'rationale'>> = {
    Bartering: {
      accent: '#5f7687',
      guidance: [
        'Anchor the ask before trading concessions.',
        'Do not give support without a matching volume, timing, or execution commitment.',
        'Keep the fallback visible so the buyer does not reset the corridor.'
      ],
      rationale: 'This path is still mostly transactional. Use clear give-get language before adding trade support.'
    },
    Haggling: {
      accent: '#4f738b',
      guidance: [
        'Expect a counter below the modeled realization.',
        'Use prior outcomes to avoid moving too early.',
        'Hold the red line until the buyer gives value back.'
      ],
      rationale: 'ATLAS expects price challenge behavior, so the scenario needs a stronger counter-response plan.'
    },
    'Hard Bargaining': {
      accent: '#d84c2a',
      guidance: [
        'Escalate guardrail risk before sharing externally.',
        'Lead with evidence, not a larger opening ask.',
        'Prepare one non-price alternative if the buyer rejects the corridor.'
      ],
      rationale: 'This posture creates higher resistance and should only be used when margin recovery outweighs relationship risk.'
    },
    Dealing: {
      accent: '#6f8874',
      guidance: [
        'Pair pricing with specific operational value.',
        'Make the concession conditional and measurable.',
        'Track whether the buyer accepts the service-value exchange.'
      ],
      rationale: 'The scenario is moving from position-setting into a structured trade.'
    },
    'Concession Trading': {
      accent: '#f4aa00',
      guidance: [
        'Attach every concession to a buyer commitment.',
        'Use phased support so the floor is protected if volume misses.',
        'Watch for an early trade ask before the buyer accepts the price corridor.'
      ],
      rationale: 'The ask and expected realization are separated enough that the CNO should trade value carefully, not discount early.'
    },
    'Win-Win': {
      accent: '#3b8a05',
      guidance: [
        'Frame around shared category growth.',
        'Use evidence to keep the buyer aligned to the corridor.',
        'Protect the upside by documenting the mutual value exchange.'
      ],
      rationale: 'The scenario has better landing probability and lower relationship risk when value is explicit.'
    },
    Partnership: {
      accent: '#6d9860',
      guidance: [
        'Connect the move to longer-term joint planning.',
        'Use market signals as context, not as pressure.',
        'Keep pricing guardrails visible while strengthening the relationship frame.'
      ],
      rationale: 'This posture favors relationship leverage and shared planning over short-term concession pressure.'
    },
    'Relationship Building': {
      accent: '#1a73e8',
      guidance: [
        'Use a lower-friction opening to preserve momentum.',
        'Anchor the next round around proof and service outcomes.',
        'Avoid overloading the buyer with every evidence point at once.'
      ],
      rationale: 'This path is best when acceptance is higher and the goal is keeping trust while protecting the ask.'
    }
  };
  const postureRead = postureGuidance[posture] ?? postureGuidance['Concession Trading'];
  return {
    accent: postureRead.accent,
    clockLabel,
    drivers,
    guidance: postureRead.guidance,
    posture,
    pressureScore,
    rationale: postureRead.rationale,
    segmentIndex
  };
}

function StrategyPostureClock({
  buyerResponse,
  buyerNegotiator,
  compact = false,
  comparisonOptions = [],
  inputs,
  relationshipRisk,
  selectedOptionId,
  scenarioStyle
}: {
  buyerResponse?: string;
  buyerNegotiator?: {
    name: string;
    style: string;
  };
  compact?: boolean;
  comparisonOptions?: ScenarioLabOption[];
  inputs: ScenarioInputs;
  relationshipRisk?: string;
  selectedOptionId?: string;
  scenarioStyle?: string;
}) {
  const posture = strategyPostureForScenario(inputs, scenarioStyle, relationshipRisk, buyerResponse);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const segmentAngle = 360 / strategyPostureSegments.length;
  const gap = 3;
  const winWinSegmentIndex = strategyPostureSegments.findIndex((segment) => segment.label === 'Win-Win');
  const buyerNegotiatorName = buyerNegotiator?.name ?? 'Buyer negotiator';
  const buyerNegotiatorStyle = buyerNegotiator?.style ?? 'buyer behavior';
  const buyerInputs: ScenarioInputs = {
    ...inputs,
    buyerAcceptanceProbability: Math.max(35, inputs.buyerAcceptanceProbability - 12),
    expectedRealizationPercent: Math.max(0, inputs.expectedRealizationPercent - 0.35),
    tradeSpendChange: inputs.tradeSpendChange * 0.65,
    volumeChangePercent: Math.min(inputs.volumeChangePercent, inputs.volumeChangePercent - 0.2)
  };
  const buyerPosture = strategyPostureForScenario(
    buyerInputs,
    'Buyer counter',
    relationshipRisk,
    buyerResponse || 'Likely to counter and test the concession boundary.'
  );
  const postureDistance = clockSegmentDistance(posture.segmentIndex, buyerPosture.segmentIndex, strategyPostureSegments.length);
  const alignmentRead = postureDistance <= 1
    ? {
        label: 'Aligned',
        tone: 'aligned',
        text: 'Buyer behavior is likely to stay close to this scenario posture.'
      }
    : postureDistance === 2
      ? {
          label: 'Watch',
          tone: 'watch',
          text: 'Buyer behavior may pull the room toward a harder posture.'
        }
      : {
          label: 'Misaligned',
          tone: 'misaligned',
          text: 'The scenario is more collaborative than the buyer is likely to behave.'
        };
  const innerRadius = compact ? 48 : 54;
  const outerRadius = compact ? 84 : 98;
  const tickInnerRadius = compact ? 88 : 102;
  const tickOuterRadius = compact ? 98 : 114;
  const labelRadius = compact ? 96 : 118;
  const markerRadius = compact ? 94 : 110;
  const centerRadius = compact ? 43 : 52;
  const markerAngle = posture.segmentIndex * segmentAngle;
  const markerPoint = polarToClockPoint(120, 120, markerRadius, markerAngle);
  const buyerMarkerPoint = polarToClockPoint(120, 120, markerRadius + (compact ? 10 : 14), buyerPosture.segmentIndex * segmentAngle + 4);
  const plottedSegmentCounts = new Map<number, number>();
  const selectedOption = comparisonOptions.find((option) => option.id === selectedOptionId);
  const plottedOptions = comparisonOptions.map((option, index) => {
    const isSelected = option.id === selectedOptionId;
    const optionInputs = isSelected ? inputs : option.inputs;
    const optionPosture = strategyPostureForScenario(
      optionInputs,
      option.scenarioStyle,
      isSelected ? relationshipRisk : option.relationshipRisk,
      isSelected ? buyerResponse : option.buyerResponse
    );
    const duplicateIndex = plottedSegmentCounts.get(optionPosture.segmentIndex) ?? 0;
    plottedSegmentCounts.set(optionPosture.segmentIndex, duplicateIndex + 1);
    const offsetAngle = duplicateIndex ? (duplicateIndex % 2 === 0 ? -1 : 1) * (4 + duplicateIndex * 2) : 0;
    const offsetRadius = markerRadius + (duplicateIndex ? Math.min(10, duplicateIndex * 4) : 0);
    const point = polarToClockPoint(120, 120, offsetRadius, optionPosture.segmentIndex * segmentAngle + offsetAngle);
    return {
      clockLabel: optionPosture.clockLabel,
      id: option.id,
      index: index + 1,
      isSelected,
      name: option.name,
      point,
      posture: optionPosture.posture,
      segmentIndex: optionPosture.segmentIndex
    };
  });
  const hoveredSegment = hoveredSegmentIndex === null ? null : strategyPostureSegments[hoveredSegmentIndex];
  const postureDriverSummary = [
    { label: 'Ask / realization', value: `${pct(inputs.priceIncreasePercent)} / ${pct(inputs.expectedRealizationPercent)}` },
    { label: 'Land', value: `${inputs.buyerAcceptanceProbability.toFixed(0)}%` },
    { label: 'Support', value: euros(inputs.tradeSpendChange) }
  ];
  const postureMove = posture.guidance[0] ?? 'Keep the move tied to measurable buyer value.';
  const winWinRecommendation = posture.segmentIndex === winWinSegmentIndex
    ? 'This approach is already closest to win-win. Keep the value exchange explicit and protect the guardrail.'
    : alignmentRead.tone === 'misaligned'
      ? 'Move closer to win-win by adding a buyer give-back before offering more support.'
    : inputs.tradeSpendChange > 150000
      ? 'Move this toward win-win by tying support to volume, OSA, or timing so the buyer gives value back.'
      : inputs.priceIncreasePercent - inputs.expectedRealizationPercent > 0.4
        ? 'Move this toward win-win by narrowing the ask-to-realization gap with proof and phased value.'
        : 'Move this toward win-win by adding a clear mutual-value exchange before conceding on price.';
  const compactPostureSummary = selectedOption
    ? `${selectedOption.name} lands at ${posture.clockLabel}; ${buyerNegotiatorName} is expected near ${buyerPosture.clockLabel}.`
    : `This scenario lands at ${posture.clockLabel}; the buyer is expected near ${buyerPosture.clockLabel}.`;
  const compactBuyerResponseRead = postureDistance <= 1
    ? `${buyerNegotiatorName} is likely to stay close to this posture if the value exchange is held.`
    : postureDistance === 2
      ? `${buyerNegotiatorName} may pull the discussion toward ${buyerPosture.posture.toLowerCase()} unless the give-back is clear.`
      : `${buyerNegotiatorName} is likely to challenge this posture and push for a harder counter.`;

  return (
    <section className={`atlas-strategy-posture ${compact ? 'compact' : ''}`} aria-label={`Strategy posture: ${posture.clockLabel} ${posture.posture}`}>
      <div className="atlas-strategy-posture-clock-wrap">
        <svg
          className={`atlas-clock-wheel ${compact ? 'compact' : ''}`}
          onMouseLeave={() => setHoveredSegmentIndex(null)}
          role="img"
          viewBox="0 0 240 240"
          aria-label={`${posture.clockLabel} ${posture.posture}`}
        >
          {strategyPostureSegments.map((segment, index) => {
            const start = index * segmentAngle - segmentAngle / 2 + gap;
            const end = (index + 1) * segmentAngle - segmentAngle / 2 - gap;
            const labelPoint = polarToClockPoint(120, 120, labelRadius, index * segmentAngle);
            return (
              <Fragment key={segment.label}>
                <path
                  aria-label={`Inspect ${segment.label}: ${segment.description}`}
                  className={`atlas-clock-segment ${index === posture.segmentIndex ? 'active' : ''}`}
                  d={clockArcPath(start, end, innerRadius, outerRadius)}
                  fill={index === posture.segmentIndex ? posture.accent : segment.fill}
                  onBlur={() => setHoveredSegmentIndex(null)}
                  onFocus={() => setHoveredSegmentIndex(index)}
                  onMouseEnter={() => setHoveredSegmentIndex(index)}
                  role="button"
                  tabIndex={0}
                />
                <line
                  className="atlas-clock-tick"
                  x1={polarToClockPoint(120, 120, tickInnerRadius, index * segmentAngle).x}
                  x2={polarToClockPoint(120, 120, tickOuterRadius, index * segmentAngle).x}
                  y1={polarToClockPoint(120, 120, tickInnerRadius, index * segmentAngle).y}
                  y2={polarToClockPoint(120, 120, tickOuterRadius, index * segmentAngle).y}
                />
                {!compact && index === posture.segmentIndex ? (
                  <text
                    className={`atlas-clock-label ${index === posture.segmentIndex ? 'active' : ''}`}
                    textAnchor="middle"
                    x={labelPoint.x}
                    y={labelPoint.y}
                  >
                    {segment.label}
                  </text>
                ) : null}
              </Fragment>
            );
          })}
          <circle className="atlas-clock-center" cx="120" cy="120" r={centerRadius} />
          <text className="atlas-clock-center-time" textAnchor="middle" x="120" y="116">{posture.clockLabel}</text>
          <text className="atlas-clock-center-label" textAnchor="middle" x="120" y="134">{posture.posture}</text>
          {plottedOptions.length ? plottedOptions.map((option) => (
            <g
              className={`atlas-clock-option-marker ${option.isSelected ? 'selected' : ''}`}
              key={option.id}
              transform={`translate(${option.point.x}, ${option.point.y})`}
            >
              <title>{`${option.name}: ${option.clockLabel} ${option.posture}`}</title>
              <rect
                className="atlas-clock-position-badge"
                height={compact ? 18 : 22}
                rx={compact ? 9 : 11}
                width={option.isSelected ? (compact ? 26 : 32) : (compact ? 20 : 24)}
                x={option.isSelected ? (compact ? -13 : -16) : (compact ? -10 : -12)}
                y={compact ? -9 : -11}
              />
              <text
                dominantBaseline="middle"
                textAnchor="middle"
                x="0"
                y="0"
              >
                {option.isSelected ? 'S' : option.index}
              </text>
            </g>
          )) : (
            <g className="atlas-clock-option-marker selected" transform={`translate(${markerPoint.x}, ${markerPoint.y})`}>
              <rect
                className="atlas-clock-position-badge"
                height={compact ? 18 : 22}
                rx={compact ? 9 : 11}
                width={compact ? 26 : 32}
                x={compact ? -13 : -16}
                y={compact ? -9 : -11}
              />
              <text dominantBaseline="middle" textAnchor="middle" x="0" y="0">S</text>
            </g>
          )}
          <g className="atlas-clock-buyer-marker" transform={`translate(${buyerMarkerPoint.x}, ${buyerMarkerPoint.y})`}>
            <title>{`${buyerNegotiatorName}: ${buyerPosture.clockLabel} ${buyerPosture.posture} based on ${buyerNegotiatorStyle.toLowerCase()}`}</title>
            <rect
              className="atlas-clock-buyer-badge"
              height={compact ? 18 : 22}
              rx={compact ? 9 : 11}
              width={compact ? 24 : 30}
              x={compact ? -12 : -15}
              y={compact ? -9 : -11}
            />
            <text dominantBaseline="middle" textAnchor="middle" x="0" y="0">B</text>
          </g>
        </svg>
        {hoveredSegment ? (
          <div className="atlas-clock-tooltip" role="status">
            <strong>{hoveredSegment.label}</strong>
            <span>{hoveredSegment.description}</span>
          </div>
        ) : null}
        <span className="atlas-strategy-posture-chip">Selected posture - {posture.clockLabel} {posture.posture}</span>
      </div>
      <div className="atlas-strategy-posture-read">
        <span>Strategy posture</span>
        <h3>{posture.clockLabel} {posture.posture}</h3>
        <p>{compact ? compactPostureSummary : selectedOption ? `${selectedOption.name} plots against ${buyerNegotiatorName}'s likely posture. ${winWinRecommendation}` : winWinRecommendation}</p>
        {!compact ? (
          <div className={`atlas-strategy-alignment-read ${alignmentRead.tone}`}>
            <span>{alignmentRead.label}</span>
            <p>{alignmentRead.text}</p>
            <small>{buyerNegotiatorName}: {buyerPosture.clockLabel} {buyerPosture.posture}</small>
          </div>
        ) : null}
        {!compact ? (
          <aside className="atlas-strategy-posture-inspector">
            <span>Move toward win-win</span>
            <strong>{postureMove}</strong>
          </aside>
        ) : null}
        {plottedOptions.length ? (
          <div className="atlas-clock-scenario-key" aria-label="Scenario positions on posture clock">
            <span className="selected"><i>S</i>Selected scenario</span>
            <span><i>2</i>Other scenarios</span>
            <span className="buyer"><i>B</i>{buyerNegotiatorName}</span>
          </div>
        ) : null}
        {compact ? (
          <div className="atlas-clock-interpretation" aria-label="Clock interpretation">
            <article>
              <span>Current position</span>
              <p>{posture.clockLabel} {posture.posture}. {postureMove}</p>
            </article>
            <article>
              <span>Likely buyer response</span>
              <p>{compactBuyerResponseRead}</p>
            </article>
          </div>
        ) : null}
        {!compact ? (
          <dl className="atlas-strategy-posture-drivers" aria-label="Posture drivers">
            {postureDriverSummary.map((driver) => (
              <div key={driver.label}>
                <dt>{driver.label}</dt>
                <dd>{driver.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

const atlasMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatAtlasDate(dateInput: string, options: { includeTime?: boolean; includeYear?: boolean } = {}) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;
  const month = atlasMonthLabels[date.getUTCMonth()] ?? 'Jan';
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const dateLabel = `${month} ${day}${options.includeYear ? `, ${year}` : ''}`;
  if (!options.includeTime) return dateLabel;
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const hour12 = hours % 12 || 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${dateLabel}, ${hour12}:${minutes} ${period}`;
}

function normalizeAtlasReturnHref(value?: string) {
  if (!value) return '';
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '';
  } catch {
    return value.startsWith('/') && !value.startsWith('//') ? value : '';
  }
}

function normalizeAtlasReturnLabel(value?: string) {
  return value?.trim().slice(0, 72) ?? '';
}

function appendAtlasReturnContext(href: string, returnTo: string, returnLabel: string) {
  if (!returnTo) return href;
  const [path, query = ''] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('returnTo', returnTo);
  if (returnLabel) params.set('returnLabel', returnLabel);
  return `${path}?${params.toString()}`;
}

type PageIntentKey =
  | 'overview'
  | 'markets'
  | 'marketDetail'
  | 'buyingGroups'
  | 'buyingGroupProfile'
  | 'pepsicoImpact'
  | 'scenarioModels'
  | 'strategyBuilder'
  | 'generatedViews'
  | 'database'
  | 'howItWorks';

type RelevanceReasonType =
  | 'materiality'
  | 'urgency'
  | 'strategy'
  | 'source'
  | 'pattern'
  | 'memory'
  | 'action';

const pageIntentConfig: Record<PageIntentKey, {
  defaultRead: string;
  intent: string;
  primaryAction: string;
  surfacingLogic: RelevanceReasonType[];
}> = {
  overview: {
    defaultRead: 'External alerts, scenario risks, source gaps, and model changes that should be tested before buyer priority is decided.',
    intent: 'What changed that needs scenario modeling first?',
    primaryAction: 'Model the alert impact, then open the derived buyer or negotiation priority.',
    surfacingLogic: ['materiality', 'urgency', 'action', 'source']
  },
  markets: {
    defaultRead: 'Market pressure, buyer exposure, external signals, and scenario entry points.',
    intent: 'How are markets comparing, and where is pressure or opportunity?',
    primaryAction: 'Model the market pressure or open the buyer most affected by it.',
    surfacingLogic: ['materiality', 'pattern', 'action']
  },
  marketDetail: {
    defaultRead: 'Current market read, affected buyers, external signals, and next action.',
    intent: 'What is happening in this market and what is driving it?',
    primaryAction: 'Open affected buyer or model the market move.',
    surfacingLogic: ['materiality', 'strategy', 'action', 'source']
  },
  buyingGroups: {
    defaultRead: 'Buyer relationships ranked by risk, negotiation state, exposure, and intervention trigger.',
    intent: 'Which buyer relationships need attention?',
    primaryAction: 'Open the buyer profile.',
    surfacingLogic: ['materiality', 'urgency', 'memory', 'action']
  },
  buyingGroupProfile: {
    defaultRead: 'Buyer posture, scenario recommendations, history patterns, market signals, guardrails, and debrief memory.',
    intent: 'What could happen with this buyer, what should I test, and what should I do?',
    primaryAction: 'Run or adjust a scenario, save it to memory, then use the selected scenario downstream.',
    surfacingLogic: ['strategy', 'urgency', 'materiality', 'memory', 'source']
  },
  pepsicoImpact: {
    defaultRead: 'PepsiCo goals, P&L-style gaps, market contributors, and buyer contributors.',
    intent: 'Are we going to make PepsiCo’s financial goals?',
    primaryAction: 'Open the market or buyer driving the gap.',
    surfacingLogic: ['materiality', 'pattern', 'action']
  },
  scenarioModels: {
    defaultRead: 'Multi-level modeling across buyer, market, category, SKU drill-in, and custom levers.',
    intent: 'What if I change this move, and how is the buyer likely to respond?',
    primaryAction: 'Compare scenarios, save the decision, or export the evidence behind the chosen move.',
    surfacingLogic: ['materiality', 'strategy', 'action', 'source']
  },
  strategyBuilder: {
    defaultRead: 'Selected scenario, evidence, buyer pushback, and assumptions that shape the next move.',
    intent: 'How does the selected scenario change what we should do next?',
    primaryAction: 'Use the tested scenario as the working negotiation position.',
    surfacingLogic: ['strategy', 'memory', 'source', 'action']
  },
  generatedViews: {
    defaultRead: 'Answer-first output with source trust, editable content, download, and save destination.',
    intent: 'Export the scenario evidence or buyer read I need after choosing a move.',
    primaryAction: 'Edit, download, save to memory, or reuse in the Scenario Lab.',
    surfacingLogic: ['action', 'source', 'materiality']
  },
  database: {
    defaultRead: 'Source records, type, owner, confidence, date, linked pages, and scenario-linked outputs.',
    intent: 'Where did this information come from?',
    primaryAction: 'Inspect or open the source record.',
    surfacingLogic: ['source', 'memory']
  },
  howItWorks: {
    defaultRead: 'Page intent map, surfacing logic, trust labels, loop behavior, and scope.',
    intent: 'How does ATLAS decide what to show and how does the loop work?',
    primaryAction: 'Use as the scenario-workspace reference.',
    surfacingLogic: ['source', 'action', 'strategy']
  }
};

const relevanceReasonCopy: Record<RelevanceReasonType, { label: string; text: string }> = {
  action: { label: 'Actionability', text: 'creates a clear next step' },
  materiality: { label: 'Materiality', text: 'affects revenue, margin, volume, trade spend, price realization, or gap to plan' },
  memory: { label: 'Memory impact', text: 'comes from history, debriefs, saved scenarios, uploaded documents, or locked strategy' },
  pattern: { label: 'Pattern impact', text: 'connects to a cross-market or cross-buyer pattern' },
  source: { label: 'Source impact', text: 'changes confidence, freshness, validation, or source status' },
  strategy: { label: 'Strategy impact', text: 'changes the in-going position, concession path, levers, risk posture, or fallback' },
  urgency: { label: 'Urgency', text: 'affects a current negotiation, milestone, decision, or escalation' }
};

type BuyerProfileDocumentUpdate = {
  id: string;
  fileName: string;
  documentType: string;
  note: string;
  impactType: string;
  createdAt: string;
  confirmedAt?: string;
  buyerAskDelta: number;
  expectedRealizationDelta: number;
  marginAtRiskDelta: number;
  tradeSpendDelta: number;
  profileImpactSummary?: string;
  riskDelta?: 'increased' | 'reduced' | 'unchanged';
  confidenceDelta?: 'increased' | 'reduced' | 'unchanged';
};

type BuyerProfileRead = {
  currentState: BuyingGroupWorkspacePacket['currentState'];
  exposure: BuyingGroup['financialExposure'];
  source: SourceMeta;
  updateImpacts: {
    buyerAskDelta: number;
    expectedRealizationDelta: number;
    marginAtRiskDelta: number;
    tradeSpendDelta: number;
  };
  updateCount: number;
  updateSummary: string;
  lastUpdate?: BuyerProfileDocumentUpdate;
};

type StoredGeneratedView = {
  artifactType?: 'generated_view' | 'negotiation_plan' | 'scenario_output';
  audienceMode?: 'internal_cno' | 'leadership_safe' | 'kam_safe' | 'customer_safe';
  id: string;
  lifecycleState?: 'retrieved' | 'draft' | 'edited' | 'attached' | 'superseded';
  title: string;
  prompt: string;
  mode: 'retrieved' | 'new_draft' | 'duplicated';
  buyingGroupId?: string;
  marketId?: string;
  revisionCount?: number;
  savedDestination?: 'buyer_profile' | 'market_profile' | 'atlas_database';
  savedToProfileAt?: string;
  sourceDocumentId?: string;
  sourceDecision?: string;
  summary?: string;
  sourceName: string;
  sourceDate: string;
  confidence: string;
  contentSnapshot?: {
    sections: unknown[];
    summary: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
};

const GENERATED_VIEW_STORAGE_KEY = 'atlas-generated-views';

function classNameForRisk(risk: AtlasRiskLevel) {
  return `risk-${risk}`;
}

function classNameForStatus(status: AtlasStatus) {
  return `status-${status.replace('_', '-')}`;
}

function labelForStatus(status: AtlasStatus) {
  if (status === 'needs_validation') return 'source review';
  return status.replace('_', ' ');
}

function sourceTypeLabel(source: SourceMeta) {
  const sourceType = source.sourceType as string;
  if (source.sourceType === 'internal') return 'Database fact';
  if (source.sourceType === 'external') return 'External signal';
  if (source.sourceType === 'ai_generated') return 'AI-derived';
  if (source.sourceType === 'modeled') return 'Modeled estimate';
  if (source.sourceType === 'user_entered') return 'User-added';
  if (source.sourceType === 'historical') return 'Historical memory';
  return sourceType.replaceAll('_', ' ');
}

function sourceTypeClass(source: SourceMeta) {
  return `source-type-${source.sourceType.replaceAll('_', '-')}`;
}

function cleanSourceDisplayText(value: string | null | undefined, fallback: string) {
  const cleaned = (value ?? '')
    .replace(/\bplaceholder\b/gi, '')
    .replace(/\bprototype\b/gi, 'POC')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || fallback;
}

function sourceDisplayName(source: Pick<SourceMeta, 'sourceName'> | { sourceName?: string }) {
  return cleanSourceDisplayText(source.sourceName, 'ATLAS source');
}

function sourceTrustDecision(source: SourceMeta) {
  if (source.sourceType === 'ai_generated') return 'Derived by ATLAS from available context';
  if (source.sourceType === 'modeled') return 'Calculated from scenario assumptions';
  if (source.sourceType === 'user_entered') return 'Added to buyer memory by user';
  if (source.sourceType === 'external') return 'Pulled from public or external signal memory';
  if (source.sourceType === 'historical') return 'Pulled from buyer history';
  return 'Stored source in Intelligence Library';
}

function sourceHealthSummary(source: SourceMeta) {
  const sourceAge = source.lastUpdated && source.lastUpdated !== source.sourceDate
    ? `refreshed ${source.lastUpdated}`
    : `dated ${source.sourceDate}`;
  const caveat = cleanSourceDisplayText(source.governance?.caveats?.[0], '');
  const missingOrStale = source.status === 'stale' || source.status === 'missing' || source.status === 'needs_validation';
  if (missingOrStale) {
    return `${labelForStatus(source.status)} · ${sourceAge}${caveat ? ` · ${caveat}` : ''}`;
  }
  if (source.sourceType === 'modeled' || source.sourceType === 'ai_generated') {
    return `${source.confidence} confidence · assumption-backed · ${sourceAge}`;
  }
  return `${source.confidence} confidence · ${sourceAge}`;
}

function readinessLabel(status: BuyingGroupWorkspacePacket['readiness']['status']) {
  if (status === 'escalation_needed') return 'Escalation needed';
  if (status === 'needs_review') return 'Needs review';
  return 'Ready';
}

function parsePctValue(value: string) {
  const parsed = Number(value.replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampProfileNumber(value: number, min = 0) {
  return Math.max(min, Number(value.toFixed(1)));
}

function signedPointLabel(value: number) {
  if (value === 0) return 'No movement';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} pts from supporting docs`;
}

function signedEuroLabel(value: number) {
  if (value === 0) return 'No movement';
  return `${value > 0 ? '+' : ''}${euros(value)}`;
}

function profileRiskDelta(update: BuyerProfileDocumentUpdate): NonNullable<BuyerProfileDocumentUpdate['riskDelta']> {
  if (update.marginAtRiskDelta > 0 || update.tradeSpendDelta > 0 || update.buyerAskDelta > 0) return 'increased';
  if (update.marginAtRiskDelta < 0 || update.tradeSpendDelta < 0 || update.expectedRealizationDelta > 0) return 'reduced';
  return 'unchanged';
}

function profileConfidenceDelta(update: BuyerProfileDocumentUpdate): NonNullable<BuyerProfileDocumentUpdate['confidenceDelta']> {
  if (update.note.trim().length > 24 && update.fileName.trim()) return 'increased';
  if (!update.note.trim()) return 'reduced';
  return 'unchanged';
}

function profileImpactSummary(update: BuyerProfileDocumentUpdate) {
  const risk = profileRiskDelta(update);
  const confidence = profileConfidenceDelta(update);
  const riskPhrase = risk === 'increased' ? 'raises risk' : risk === 'reduced' ? 'reduces risk' : 'keeps risk flat';
  const confidencePhrase = confidence === 'increased' ? 'adds confidence' : confidence === 'reduced' ? 'needs stronger source detail' : 'keeps confidence flat';
  return `${update.documentType.replaceAll('_', ' ')} ${riskPhrase}; ${confidencePhrase}. Buyer ask ${signedPointLabel(update.buyerAskDelta).toLowerCase()}, PepsiCo position ${signedPointLabel(update.expectedRealizationDelta).toLowerCase()}, margin ${signedEuroLabel(update.marginAtRiskDelta).toLowerCase()}.`;
}

function buildUserEnteredSource(update: BuyerProfileDocumentUpdate | undefined, fallback: SourceMeta): SourceMeta {
  if (!update) return fallback;
  return {
    sourceName: update.fileName,
    sourceType: 'user_entered',
    sourceDate: update.createdAt.slice(0, 10),
    lastUpdated: update.createdAt.slice(0, 10),
    confidence: 'medium',
    status: 'modeled',
    governance: {
      sourceType: 'user_entered',
      sourceOwner: 'CNO user',
      approvalStatus: 'draft',
      allowedUse: ['demo', 'review_draft'],
      canonicalUseAllowed: 'with_caveat',
      confidence: 'medium',
      caveats: ['Prototype update based on document metadata and user-entered impacts. File parsing is not connected yet.'],
      replacementRequirement: 'Connect source ingestion before official use.'
    }
  };
}

function buildGeneratedViewSource(view: StoredGeneratedView, fallback: SourceMeta): SourceMeta {
  const lifecycleState = view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft');
  return {
    ...fallback,
    sourceName: view.sourceName || fallback.sourceName,
    sourceType: 'ai_generated',
    sourceDate: (view.savedToProfileAt ?? view.updatedAt ?? view.createdAt).slice(0, 10),
    lastUpdated: (view.updatedAt ?? view.savedToProfileAt ?? view.createdAt).slice(0, 10),
    confidence: view.confidence === 'low' || view.confidence === 'medium' || view.confidence === 'high' ? view.confidence : fallback.confidence,
    status: lifecycleState === 'retrieved' ? 'ready' : lifecycleState === 'attached' ? 'modeled' : 'needs_validation',
    governance: {
      sourceType: 'ai_generated',
      sourceOwner: 'ATLAS scenario output',
      approvalStatus: 'draft',
      allowedUse: ['demo', 'review_draft'],
      canonicalUseAllowed: 'with_caveat',
      confidence: view.confidence === 'low' || view.confidence === 'medium' || view.confidence === 'high' ? view.confidence : fallback.confidence,
      caveats: [
        view.sourceDecision ?? 'Generated or retrieved in prototype mode. Review before official use.',
        lifecycleState === 'attached'
          ? 'Attached to buyer or market memory as a working artifact, not an approved source.'
          : 'Saved as a draft until attached or superseded.'
      ],
      replacementRequirement: 'Attach a validated source before customer-facing use.'
    }
  };
}

function buildBuyerProfileRead(workspace: BuyingGroupWorkspacePacket, updates: BuyerProfileDocumentUpdate[]): BuyerProfileRead {
  const exposure = workspace.buyingGroup.financialExposure;
  const totals = updates.reduce(
    (acc, update) => ({
      buyerAskDelta: acc.buyerAskDelta + update.buyerAskDelta,
      expectedRealizationDelta: acc.expectedRealizationDelta + update.expectedRealizationDelta,
      marginAtRiskDelta: acc.marginAtRiskDelta + update.marginAtRiskDelta,
      tradeSpendDelta: acc.tradeSpendDelta + update.tradeSpendDelta
    }),
    { buyerAskDelta: 0, expectedRealizationDelta: 0, marginAtRiskDelta: 0, tradeSpendDelta: 0 }
  );
  const lastUpdate = updates[0];
  const adjustedExpectedRealization = clampProfileNumber(exposure.expectedPriceRealization + totals.expectedRealizationDelta);
  const adjustedMarginAtRisk = Math.max(0, exposure.marginAtRisk + totals.marginAtRiskDelta + Math.max(0, totals.buyerAskDelta) * 800000);
  const adjustedGapToPlan = Math.max(0, exposure.gapToPlan - totals.expectedRealizationDelta * 1100000 + Math.max(0, totals.buyerAskDelta) * 650000);

  return {
    currentState: {
      ...workspace.currentState,
      latestBuyerAsk: pct(clampProfileNumber(parsePctValue(workspace.currentState.latestBuyerAsk) + totals.buyerAskDelta)),
      pepsicoPosition: pct(clampProfileNumber(parsePctValue(workspace.currentState.pepsicoPosition) + totals.expectedRealizationDelta)),
      nextMilestone: lastUpdate
        ? `Updated from ${lastUpdate.fileName}: ${lastUpdate.note || lastUpdate.impactType.replaceAll('_', ' ')}.`
        : workspace.currentState.nextMilestone
    },
    exposure: {
      ...exposure,
      expectedPriceRealization: adjustedExpectedRealization,
      acceptedPriceRealization: exposure.acceptedPriceRealization
        ? clampProfileNumber(exposure.acceptedPriceRealization + totals.expectedRealizationDelta * 0.5)
        : undefined,
      marginAtRisk: adjustedMarginAtRisk,
      tradeSpendExposure: Math.max(0, exposure.tradeSpendExposure + totals.tradeSpendDelta),
      gapToPlan: adjustedGapToPlan
    },
    source: buildUserEnteredSource(lastUpdate, workspace.documents[0]?.source ?? workspace.buyingGroup.source),
    updateImpacts: totals,
    updateCount: updates.length,
    updateSummary: updates.length
      ? `${updates.length} supporting ${updates.length === 1 ? 'document is' : 'documents are'} shaping this buyer profile.`
      : 'Base read from ATLAS source memory.',
    lastUpdate
  };
}

function commandHref(command: string) {
  const normalized = command.trim().toLowerCase();
  const encoded = encodeURIComponent(command.trim());
  const directBuyingGroup = packet.buyingGroups.find((group) => normalized.includes(group.name.toLowerCase()) || normalized.includes(group.id));
  if (directBuyingGroup && /profile|history|financial|overview|buyer|buying group|group|carrefour|edeka|tesco|aldi|lidl|rewe|auchan|intermarche|coop/.test(normalized)) {
    const view = /financial|margin|scenario|price|realization|volume|trade/.test(normalized)
      ? 'financials'
      : /history|memory|debrief|document|source|prior/.test(normalized)
        ? 'memory'
        : 'snapshot';
    return `/buying-groups/${directBuyingGroup.id}?ask=${encoded}&view=${view}`;
  }
  if (/financial|margin exposure|margin risk|revenue|gap|volume exposure|exposure|losing money|offset/.test(normalized)) return `/scenario-lab?ask=${encoded}&view=money-at-risk`;
  if (/scenario|model|price move|realization|3\.2|trade spend|stress test/.test(normalized)) return `/scenario-lab?ask=${encoded}&view=scenario`;
  if (/competitor|mondelez|kellanova|coca|nestle|private label/.test(normalized)) return `/?ask=${encoded}&view=competitor-impact`;
  if (/intelligence|data source|source table|raw data|actual data|source link|source links/.test(normalized)) return `/intelligence?ask=${encoded}&view=source-database`;
  if (/document|source|file/.test(normalized)) return `/intelligence?ask=${encoded}&view=source-readiness`;
  if (/intelligence|memory|history|decision|debrief/.test(normalized)) return `/intelligence?ask=${encoded}&view=memory-index`;
  if (/market|germany|france|uk|united kingdom|spain|italy|poland|netherlands|belgium/.test(normalized)) return `/scenario-lab?ask=${encoded}&view=market-impact`;
  if (/buying group|buyer|carrefour|edeka|tesco|aldi|lidl|rewe|auchan|round|intervention/.test(normalized)) return `/buying-groups?ask=${encoded}&view=buyer-ranking`;
  if (/signal|news|changed|external|public|inflation|regulatory/.test(normalized)) return `/?ask=${encoded}&view=signal-impact`;
  return `/?ask=${encoded}&view=focus`;
}

function tokenizeCommand(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%.\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !['the', 'and', 'for', 'with', 'show', 'pull', 'open', 'make', 'create', 'generate', 'give', 'report', 'view'].includes(token));
}

function documentSearchText(document: DocumentArtifact) {
  const group = document.buyingGroupId ? getBuyingGroup(document.buyingGroupId)?.name ?? document.buyingGroupId : '';
  const market = document.marketId ? getMarket(document.marketId)?.name ?? document.marketId : '';
  return [
    document.title,
    document.documentType.replaceAll('_', ' '),
    document.summary,
    group,
    market,
    String(document.year),
    document.status,
    document.source.sourceName
  ].join(' ').toLowerCase();
}

function findExistingReportForCommand(command: string) {
  const tokens = tokenizeCommand(command);
  if (!tokens.length) return undefined;

  return packet.documents
    .map((document) => {
      const searchText = documentSearchText(document);
      const score = tokens.reduce((total, token) => total + (searchText.includes(token) ? 1 : 0), 0)
        + (/debrief|brief|report|pack|summary|visual|document|deck|source|corridor|scenario|profile/i.test(command) && document.reusable ? 1 : 0)
        + (document.status === 'approved' || document.status === 'ready' ? 0.5 : 0);
      return { document, score };
    })
    .filter((item) => item.score >= Math.max(2, Math.ceil(tokens.length * 0.35)))
    .sort((a, b) => b.score - a.score)[0]?.document;
}

function isReportCommand(command: string) {
  return /report|brief|pack|deck|pdf|document|data view|data visualization|visual|readout|summary|prep|debrief|source|pull up|show me|show|find|what|where|which|create|generate|make|give me/i.test(command);
}

function isGeneratedOutputHref(href: string) {
  return href.startsWith('/generated-views') || href.startsWith('/atlas-output');
}

function generatedOutputLinkProps(href: string) {
  return isGeneratedOutputHref(href) ? { rel: 'noreferrer', target: '_blank' } : {};
}

function outputHrefForCommand(command: string) {
  const encoded = encodeURIComponent(command.trim());
  const existing = findExistingReportForCommand(command);
  if (existing) {
    const scope = `${existing.buyingGroupId ? `&buyingGroupId=${encodeURIComponent(existing.buyingGroupId)}` : ''}${existing.marketId ? `&marketId=${encodeURIComponent(existing.marketId)}` : ''}`;
    return `/generated-views?prompt=${encoded}&mode=retrieved&documentId=${encodeURIComponent(existing.id)}${scope}`;
  }
  if (isReportCommand(command)) {
    return `/generated-views?prompt=${encoded}&mode=draft&editable=1`;
  }
  return commandHref(command);
}

function SourceTrustBar({ linked = true, source }: { linked?: boolean; source: SourceMeta }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="atlas-source-trust-bar" aria-label="Source trust">
        <span className={`atlas-source-type-pill ${sourceTypeClass(source)}`}>{sourceTypeLabel(source)}</span>
        {source.url && linked ? (
          <a href={source.url} rel="noreferrer" target="_blank">{sourceDisplayName(source)}</a>
        ) : (
          <strong>{sourceDisplayName(source)}</strong>
        )}
        <span>{sourceTrustDecision(source)}</span>
        <span>{source.sourceDate}</span>
        <span>Updated {source.lastUpdated}</span>
        <span className={`confidence-${source.confidence}`}>Confidence {source.confidence}</span>
        <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
        <span>{sourceHealthSummary(source)}</span>
        <span>{source.governance.canonicalUseAllowed === 'yes' ? 'Canonical use' : source.governance.canonicalUseAllowed === 'with_caveat' ? 'Use with caveat' : 'Not canonical'}</span>
        <button type="button" onClick={() => setOpen(true)}>Inspect source</button>
      </div>
      {open ? <SourceDetailDrawer onClose={() => setOpen(false)} source={source} /> : null}
    </>
  );
}

function SourceDetailDrawer({ onClose, source }: { onClose: () => void; source: SourceMeta }) {
  const governance = source.governance;
  const allowedUse = governance.allowedUse.map((item) => item.replaceAll('_', ' ')).join(', ');
  const canonicalLabel = governance.canonicalUseAllowed === 'yes'
    ? 'Canonical use approved'
    : governance.canonicalUseAllowed === 'with_caveat'
      ? 'Use with caveat'
      : 'Not canonical';

  return (
    <div className="atlas-source-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="atlas-source-drawer" aria-label="Source detail" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Source detail</span>
            <h2>{sourceDisplayName(source)}</h2>
          </div>
          <button type="button" aria-label="Close source detail" onClick={onClose}><X size={17} /></button>
        </header>
        <section className="atlas-source-drawer-summary">
          <div><span>Type</span><strong>{source.sourceType.replaceAll('_', ' ')}</strong></div>
          <div><span>Status</span><strong>{labelForStatus(source.status)}</strong></div>
          <div><span>Confidence</span><strong>{source.confidence}</strong></div>
          <div><span>Canonical</span><strong>{canonicalLabel}</strong></div>
        </section>
        <dl>
          <div><dt>Source owner</dt><dd>{cleanSourceDisplayText(governance.sourceOwner, 'ATLAS source owner')}</dd></div>
          <div><dt>Source date</dt><dd>{source.sourceDate}</dd></div>
          <div><dt>Last updated</dt><dd>{source.lastUpdated}</dd></div>
          <div><dt>Validation status</dt><dd>{governance.approvalStatus.replaceAll('_', ' ')}</dd></div>
          <div><dt>Allowed use</dt><dd>{allowedUse || 'No allowed-use state listed'}</dd></div>
          <div><dt>Replacement requirement</dt><dd>{cleanSourceDisplayText(governance.replacementRequirement, 'No replacement required for POC read')}</dd></div>
        </dl>
        {governance.caveats.length ? (
          <section>
            <h3>Caveats</h3>
            <ul>
              {governance.caveats.map((caveat) => <li key={caveat}>{cleanSourceDisplayText(caveat, 'Source caveat')}</li>)}
            </ul>
          </section>
        ) : null}
        <footer>
          {source.url ? <a href={source.url} rel="noreferrer" target="_blank">Open linked source</a> : <span>No source link connected yet</span>}
          <a href={`/intelligence?source=${encodeURIComponent(source.sourceName)}`}>Find in database</a>
        </footer>
      </aside>
    </div>
  );
}

function useStoredGeneratedViews(filter: { buyingGroupId?: string; marketId?: string }) {
  const [views, setViews] = useState<StoredGeneratedView[]>([]);

  useEffect(() => {
    function loadViews() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
        const allViews = Array.isArray(parsed) ? parsed as StoredGeneratedView[] : [];
        setViews(allViews.filter((view) => {
          if (filter.buyingGroupId) return view.buyingGroupId === filter.buyingGroupId;
          if (filter.marketId) return view.marketId === filter.marketId;
          return true;
        }));
      } catch {
        setViews([]);
      }
    }

    loadViews();
    window.addEventListener('storage', loadViews);
    window.addEventListener('focus', loadViews);
    return () => {
      window.removeEventListener('storage', loadViews);
      window.removeEventListener('focus', loadViews);
    };
  }, [filter.buyingGroupId, filter.marketId]);

  return views;
}

function saveStoredGeneratedView(view: StoredGeneratedView) {
  if (typeof window === 'undefined') return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GENERATED_VIEW_STORAGE_KEY) ?? '[]');
    const allViews = Array.isArray(parsed) ? parsed as StoredGeneratedView[] : [];
    const nextViews = [view, ...allViews.filter((item) => item.id !== view.id)].slice(0, 60);
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify(nextViews));
    window.dispatchEvent(new Event('storage'));
  } catch {
    window.localStorage.setItem(GENERATED_VIEW_STORAGE_KEY, JSON.stringify([view]));
    window.dispatchEvent(new Event('storage'));
  }
}

function SavedGeneratedViewsShelf({ buyingGroupId, marketId }: { buyingGroupId?: string; marketId?: string }) {
  const savedViews = useStoredGeneratedViews({ buyingGroupId, marketId });
  if (!savedViews.length) return null;
  const attachedCount = savedViews.filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached').length;
  const shelfTitle = buyingGroupId
    ? 'Scenario outputs saved to buyer memory'
    : marketId
      ? 'Scenario outputs saved to market memory'
      : 'Scenario outputs saved to ATLAS';

  return (
    <section className="atlas-saved-generated-views" aria-label="Saved scenario outputs">
      <header>
        <h3>{shelfTitle}</h3>
        <span>{attachedCount} attached / {savedViews.length} total</span>
      </header>
      <div>
        {savedViews.slice(0, 5).map((view) => (
          <a href={hrefForStoredGeneratedView(view)} key={view.id} rel="noreferrer" target="_blank">
            <div>
              <strong>{view.title}</strong>
              <span>{view.summary ?? view.prompt}</span>
            </div>
            <em>{(view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')).replaceAll('_', ' ')}</em>
            <small>{sourceDisplayName({ sourceName: view.sourceName })} · {formatAtlasDate(view.updatedAt, { includeYear: true })} · {view.confidence}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: AtlasStatus }) {
  return <span className={`atlas-status-chip ${classNameForStatus(status)}`}>{labelForStatus(status)}</span>;
}

function ConfidenceChip({ confidence }: { confidence: AtlasConfidence }) {
  return <span className={`atlas-confidence-chip confidence-${confidence}`}>Confidence {confidence}</span>;
}

function FinancialImpactStrip({
  revenue,
  margin,
  volume,
  trade
}: {
  revenue?: number;
  margin?: number;
  volume?: number;
  trade?: number;
}) {
  return (
    <div className="atlas-financial-strip">
      <span><small>Revenue</small><strong>{Number.isFinite(revenue) ? euros(revenue ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Margin</small><strong>{Number.isFinite(margin) ? euros(margin ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Volume</small><strong>{Number.isFinite(volume) ? euros(volume ?? 0) : 'Not modeled'}</strong></span>
      <span><small>Trade spend</small><strong>{Number.isFinite(trade) ? euros(trade ?? 0) : 'Not modeled'}</strong></span>
    </div>
  );
}

function TimelineImpactPills({
  revenue,
  margin,
  trade
}: {
  revenue?: number;
  margin?: number;
  trade?: number;
}) {
  const items: Array<readonly [string, number]> = [];
  if (revenue !== undefined) items.push(['Revenue', revenue]);
  if (margin !== undefined) items.push(['Margin', margin]);
  if (trade !== undefined) items.push(['Trade', trade]);
  if (!items.length) return null;
  return (
    <div className="atlas-timeline-impact-pills" aria-label="Financial impact">
      {items.map(([label, value]) => (
        <span className={value < 0 ? 'tone-risk' : value > 0 ? 'tone-good' : 'tone-neutral'} key={label}>
          <small>{label}</small>
          <strong>{signedEuroLabel(value)}</strong>
        </span>
      ))}
    </div>
  );
}

function CommandBar({ initialPrompt = '' }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState('');

  function submit(command = prompt) {
    const trimmed = command.trim();
    if (!trimmed) return;
    setStatus('Routing intelligence request...');
    window.setTimeout(() => {
      window.location.href = commandHref(trimmed);
    }, 500);
  }

  const examples = [
    'Show high-risk buying groups in Germany',
    'What changed across Europe this week?',
    'Find competitor moves affecting Carrefour',
    'Show margin exposure by market',
    'Retrieve prior-year EDEKA debrief',
    'Run a 3.2% scenario for France'
  ];

  return (
    <section className="atlas-command-bar" aria-label="ATLAS command bar">
      <Search size={17} />
      <input
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
        placeholder="Ask ATLAS to find a signal, explain financial risk, retrieve a document, or model a scenario..."
        aria-label="Ask ATLAS"
      />
      <button type="button" onClick={() => submit()}><ArrowRight size={16} /> Ask</button>
      <button type="button" className="quiet" onClick={() => setStatus('Voice capture ready for explicit-start input.')}><Mic size={15} /> Voice</button>
      <div className="atlas-command-examples">
        {examples.map((example) => (
          <button type="button" key={example} onClick={() => submit(example)}>{example}</button>
        ))}
      </div>
      {status ? <p>{status}</p> : null}
    </section>
  );
}

function isNavItemActive(href: string, view: HubView) {
  if (href === '/' && view === 'overview') return true;
  if (href.startsWith('/buying-groups') && (view === 'buyingGroups' || view === 'buyingGroup')) return true;
  if (href.startsWith('/scenario-lab') && (view === 'scenarioModels' || view === 'scenarioCompare' || view === 'financialImpact')) return true;
  if (href.startsWith('/intelligence') && (view === 'database' || view === 'documents' || view === 'timeline' || view === 'signals' || view === 'competitors' || view === 'markets' || view === 'market')) return true;
  if (href.startsWith('/assistant') && view === 'assistant') return true;
  return false;
}

function hubCommandConfig({
  buyingGroupId,
  marketId,
  view
}: {
  buyingGroupId?: string;
  marketId?: string;
  view: HubView;
}) {
  const buyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
  const market = marketId ? getMarket(marketId) : undefined;

  if (buyingGroup) {
    return {
      basePath: `/buying-groups/${buyingGroup.id}`,
      examples: [
        `Show me ${buyingGroup.name} financial exposure`,
        `Pull ${buyingGroup.name} buyer history`,
        `Model ${buyingGroup.name} buyer counter`
      ],
      placeholder: `Ask ATLAS about ${buyingGroup.name}, its numbers, history, documents, or scenario options...`
    };
  }

  if (market) {
    return {
      basePath: `/markets/${market.id}`,
      examples: [
        `Show ${market.name} margin exposure`,
        `Which buyers are driving ${market.name} pressure?`,
        `Create a ${market.name} market readout`
      ],
      placeholder: `Ask ATLAS about ${market.name}, buyer pressure, margin risk, or market signals...`
    };
  }

  if (view === 'markets') {
    return {
      basePath: '/markets',
      examples: ['Where am I losing money by market?', 'Which buyers are affected by market pressure?', 'Rank markets by margin risk'],
      placeholder: 'Ask for market risk, buyer pressure, margin exposure, or scenarios to test...'
    };
  }

  if (view === 'buyingGroups') {
    return {
      basePath: '/buying-groups',
      examples: ['Which buying groups need CNO intervention?', 'Show groups below target realization', 'Show buyers with external pressure'],
      placeholder: 'Ask for high-risk groups, long negotiation rounds, target gaps, or external pressure...'
    };
  }

  if (view === 'financialImpact') {
    return {
      basePath: '/scenario-lab',
      examples: ['Show margin exposure by market', 'Where am I below plan?', 'Show a risk waterfall for Carrefour'],
      placeholder: 'Ask for margin risk, gap to plan, realization, or trade spend exposure...'
    };
  }

  if (view === 'scenarioModels' || view === 'scenarioCompare') {
    return {
      basePath: '/scenario-lab',
      examples: ['Run a 3.2% scenario for Carrefour', 'Compare Germany and France exposure', 'Predict EDEKA buyer counter'],
      placeholder: 'Ask ATLAS to model a buyer, market, SKU drill-in, custom lever, trade shift, or buyer counter...'
    };
  }

  if (view === 'database') {
    return {
      basePath: '/intelligence',
      examples: ['Show stale source records', 'Find source links for Carrefour', 'Show prediction accuracy for EDEKA'],
      placeholder: 'Ask for memory, debriefs, prediction accuracy, sources, confidence, or approval status...'
    };
  }

  if (view === 'competitors') {
    return {
      basePath: '/signals',
      examples: ['Find competitor moves affecting Carrefour', 'Show private label pressure', 'Create competitor leverage readout'],
      placeholder: 'Ask for competitor moves, buyer leverage, affected markets, or margin impact...'
    };
  }

  return {
      basePath: '/',
      examples: ['What changed across Europe this week?', 'Which alerts should I model first?', 'What scenario risk changed?'],
      placeholder: 'Ask ATLAS to pull an alert, source gap, scenario risk, or modeled impact...'
  };
}

export function AppShell({
  buyingGroupId,
  children,
  commandPrompt,
  hideCommandSurface,
  marketId,
  view
}: {
  buyingGroupId?: string;
  children: React.ReactNode;
  commandPrompt?: string;
  hideCommandSurface?: boolean;
  marketId?: string;
  view: HubView;
}) {
  const [isNavCompact, setIsNavCompact] = useState(false);
  const commandConfig = hubCommandConfig({ buyingGroupId, marketId, view });
  
  const totalAlertsCount = useMemo(() => {
    return computeTotalTriageAlertsCount();
  }, []);

  const primaryNav = [
    { label: 'Triage', href: '/' },
    { label: 'Scenarios', href: '/scenario-lab' },
    { label: 'Buyers', href: '/buying-groups' },
    { label: 'Library', href: '/intelligence' },
    { label: 'AI Assistant', href: '/assistant' }
  ];
  const buyingGroupMenu = [...packet.buyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk);

  useEffect(() => {
    const updateNavState = () => setIsNavCompact(window.scrollY > 24);

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
    return () => window.removeEventListener('scroll', updateNavState);
  }, []);

  return (
    <main className={`atlas-hub-shell atlas-hub-shell--${view}`}>
      <section className={`atlas-hub-main atlas-hub-main--${view}`}>
        <header className={`atlas-hub-header${isNavCompact ? ' is-compact' : ''}`}>
          <a className="atlas-hub-brand" href="/">
            <img src="/atlas-logo.png" alt="Atlas" />
          </a>
          <nav className="atlas-primary-nav" aria-label="Primary intelligence navigation">
            {primaryNav.map((item) => {
              if (item.href === '/buying-groups') {
                return (
                  <div className="atlas-primary-nav-item has-menu" key={item.href}>
                    <a
                      href={item.href}
                      className={isNavItemActive(item.href, view) ? 'active' : ''}
                      aria-haspopup="true"
                    >
                      {item.label}
                    </a>
                    <div className="atlas-nav-dropdown" role="menu" aria-label="Buying group shortcuts">
                      {buyingGroupMenu.map((group) => (
                        <a href={`/buying-groups/${group.id}`} key={group.id} role="menuitem">
                          <span>{group.name}</span>
                          <em>{group.riskLevel} · {euros(group.financialExposure.marginAtRisk)}</em>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div className="atlas-primary-nav-item" key={item.href}>
                  <a href={item.href} className={isNavItemActive(item.href, view) ? 'active' : ''}>
                    {item.label}
                  </a>
                </div>
              );
            })}
          </nav>
          <div className="atlas-hub-context">
            <a href="/" className="atlas-nav-alert-badge" aria-label="Active alerts count">
              <AlertCircle size={20} />
              <span>{totalAlertsCount}</span>
            </a>
            <img src="/user-avatar.png" alt="User Avatar" className="atlas-user-avatar" />
          </div>
        </header>
        {children}
        {!hideCommandSurface && (
          <AtlasCommandSurface
            basePath={commandConfig.basePath}
            className="atlas-global-command-surface"
            examples={commandConfig.examples}
            initialPrompt={commandPrompt}
            placeholder={commandConfig.placeholder}
          />
        )}
      </section>
    </main>
  );
}

function PageBrief({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <section className="atlas-page-brief">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      <strong>{action}</strong>
    </section>
  );
}

function IntentBrief({
  action,
  body,
  eyebrow,
  metrics,
  title
}: {
  action: string;
  body?: string;
  eyebrow?: string;
  metrics?: Array<{ label: string; value: string; tone?: 'risk' | 'good' | 'watch' }>;
  title: string;
}) {
  return (
    <section className="atlas-intent-brief">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
      </div>
      {metrics?.length ? (
        <dl>
          {metrics.map((metric) => (
            <div className={metric.tone ? `tone-${metric.tone}` : ''} key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <strong>{action}</strong>
    </section>
  );
}

function relevanceLabels(reasons: RelevanceReasonType[]) {
  return reasons.map((reason) => relevanceReasonCopy[reason].label).join(' / ');
}

function WhyShownLine({
  detail,
  reasons
}: {
  detail: string;
  reasons: RelevanceReasonType[];
}) {
  return (
    <div className="atlas-why-shown-line">
      <Sparkles size={13} />
      <span>Why shown</span>
      <em>{relevanceLabels(reasons)}</em>
      <small>{detail}</small>
    </div>
  );
}

function ClosedLoopMemoryTag({
  label,
  status = 'available'
}: {
  label: string;
  status?: 'available' | 'saved' | 'used' | 'watch';
}) {
  return <span className={`atlas-loop-memory-tag status-${status}`}>{label}</span>;
}

function PageIntentNote({ intentKey }: { intentKey: PageIntentKey }) {
  const config = pageIntentConfig[intentKey];
  return (
    <aside className="atlas-page-intent-note" aria-label="Page intent">
      <strong>{config.intent}</strong>
      <span>{config.defaultRead}</span>
      <em>{config.primaryAction}</em>
    </aside>
  );
}

function SnapshotStrip({
  items
}: {
  items: Array<{ action?: string; body: string; href?: string; label: string; title: string; value?: string }>;
}) {
  return (
    <section className="atlas-snapshot-strip" aria-label="Key snapshots">
      {items.map((item) => {
        const content = (
          <>
            <span>{item.label}</span>
            {item.value ? <strong>{item.value}</strong> : null}
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.action ? <em>{item.action}</em> : null}
          </>
        );
        if (item.href) return <a href={item.href} key={item.label} {...generatedOutputLinkProps(item.href)}>{content}</a>;
        return <article key={item.label}>{content}</article>;
      })}
    </section>
  );
}

function inferGeneratedView(prompt?: string, fallback = 'focus') {
  const normalized = (prompt ?? '').toLowerCase();
  if (!normalized) return fallback;
  if (/market|germany|france|uk|spain|italy|poland|netherlands|belgium|offset/.test(normalized)) return 'market-comparison';
  if (/buying group|buyer|carrefour|edeka|tesco|aldi|lidl|rewe|round|intervention/.test(normalized)) return 'buyer-ranking';
  if (/financial|margin|revenue|gap|volume|trade|exposure|losing money|realization/.test(normalized)) return 'money-at-risk';
  if (/signal|news|changed|external|inflation|commodity|private label/.test(normalized)) return 'signal-impact';
  if (/competitor|mondelez|kellanova|coca|nestle/.test(normalized)) return 'competitor-impact';
  if (/document|source|file|prep|deck|debrief|validation/.test(normalized)) return 'source-readiness';
  if (/memory|timeline|history|decision|debrief/.test(normalized)) return 'memory-index';
  return fallback;
}

type AtlasQuickAnswer = {
  actionLabel: string;
  answer: string;
  href: string;
  source: SourceMeta;
  title: string;
};

function buildAtlasQuickAnswer(command: string, basePath: string): AtlasQuickAnswer {
  const normalized = command.toLowerCase();
  const existingReport = findExistingReportForCommand(command);
  const buyerMatch = basePath.match(/^\/buying-groups\/([^/?#]+)/);
  const marketMatch = basePath.match(/^\/markets\/([^/?#]+)/);
  const scope = [
    buyerMatch ? `buyingGroupId=${encodeURIComponent(buyerMatch[1])}` : '',
    marketMatch ? `marketId=${encodeURIComponent(marketMatch[1])}` : ''
  ].filter(Boolean).join('&');
  const unscopedReportHref = outputHrefForCommand(command);
  const reportHref = unscopedReportHref.startsWith('/generated-views') && scope && !unscopedReportHref.includes('buyingGroupId=') && !unscopedReportHref.includes('marketId=')
    ? `${unscopedReportHref}${unscopedReportHref.includes('?') ? '&' : '?'}${scope}`
    : unscopedReportHref;
  const buyerWorkspace = buyerMatch ? buildBuyingGroupWorkspacePacket(buyerMatch[1]) : undefined;

  if (existingReport) {
    return {
      actionLabel: 'Open existing report',
      answer: `ATLAS found an existing ${existingReport.documentType.replaceAll('_', ' ')} for this request. Use it first, then edit if the room context has changed.`,
      href: reportHref,
      source: existingReport.source,
      title: existingReport.title
    };
  }

  if (isReportCommand(command) && reportHref.startsWith('/generated-views')) {
    const source = buyerWorkspace?.documents[0]?.source ?? packet.documents[0].source;
    return {
      actionLabel: 'Open editable draft',
      answer: 'ATLAS does not have an exact reusable report for this request, so it is creating an editable draft from the available buyer, market, and source memory.',
      href: reportHref,
      source,
      title: 'New editable report'
    };
  }

  if (buyerWorkspace) {
    const profileRead = buildBuyerProfileRead(buyerWorkspace, []);
    const exposure = profileRead.exposure;
    const signal = buyerWorkspace.signals[0];
    const source = signal?.source ?? profileRead.source;

    if (/financial|margin|revenue|gap|volume|trade|price|realization|exposure/.test(normalized)) {
      return {
        actionLabel: 'Open scenario workspace',
        answer: `${buyerWorkspace.buyingGroup.name} has ${euros(exposure.marginAtRisk)} margin at risk and expected realization is ${pct(exposure.expectedPriceRealization)} versus ${pct(exposure.targetPriceRealization)} target.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=strategy`,
        source: profileRead.source,
        title: 'Scenario input answer'
      };
    }

    if (/history|timeline|debrief|document|source|prep|reaction|respond/.test(normalized)) {
      const latest = buyerWorkspace.timelineEvents[0];
      return {
        actionLabel: 'Open scenario memory',
        answer: latest
          ? `Latest buyer memory: ${latest.title}. This is the strongest current clue for how ${buyerWorkspace.buyingGroup.name} may respond.`
          : `No recent buyer memory is attached yet. Add a debrief or supporting document to improve the read.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=strategy`,
        source: latest?.source ?? buyerWorkspace.documents[0]?.source ?? profileRead.source,
        title: 'Buyer memory answer'
      };
    }

    if (/signal|news|competitor|private label|market|changed|world|pressure/.test(normalized)) {
      return {
        actionLabel: 'Open overview',
        answer: signal
          ? `${buyerWorkspace.buyingGroup.name} is likely to use this pressure point: ${signal.title}. ${signal.recommendedAction}`
          : `${buyerWorkspace.buyingGroup.name} has no buyer-specific external signal in the prototype data yet.`,
        href: `${basePath}?ask=${encodeURIComponent(command)}&view=snapshot`,
        source,
        title: 'Market signal answer'
      };
    }

    return {
      actionLabel: 'Open buyer scenario read',
      answer: signal
        ? `${buyerWorkspace.buyingGroup.name} is likely to push on ${signal.title.toLowerCase()}. ATLAS created a buyer scenario read using the buyer profile, financial state, and source memory.`
        : `${buyerWorkspace.buyingGroup.name} should be read from its current position, active financial exposure, and latest timeline event first. ATLAS created a buyer scenario read from available memory.`,
      href: `${basePath}?ask=${encodeURIComponent(command)}&view=custom`,
      source,
      title: 'Buyer scenario answer'
    };
  }

  const href = commandHref(command);
  const source = packet.signals[0]?.source ?? packet.markets[0].source;
  return {
    actionLabel: 'Open scenario output',
    answer: 'ATLAS matched this request to the closest intelligence view. Open it for ranked data, source context, scenario implications, and next action.',
    href,
    source,
    title: 'Fast answer'
  };
}

function AtlasCommandSurface({
  basePath,
  className = '',
  examples,
  initialPrompt = '',
  placeholder
}: {
  basePath: string;
  className?: string;
  examples: string[];
  initialPrompt?: string;
  placeholder: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<AtlasQuickAnswer | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function resetCommandSurface() {
    setPrompt(initialPrompt);
    setStatus('');
    setIsThinking(false);
    setQuickAnswer(null);
  }

  useEffect(() => {
    resetCommandSurface();
  }, [basePath, initialPrompt]);

  useEffect(() => {
    function handlePageShow() {
      resetCommandSurface();
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [basePath, initialPrompt]);

  function scopedGeneratedViewHref(href: string) {
    if (!href.startsWith('/generated-views')) return href;
    const buyerMatch = basePath.match(/^\/buying-groups\/([^/?#]+)/);
    const marketMatch = basePath.match(/^\/markets\/([^/?#]+)/);
    const scope = [
      buyerMatch ? `buyingGroupId=${encodeURIComponent(buyerMatch[1])}` : '',
      marketMatch ? `marketId=${encodeURIComponent(marketMatch[1])}` : ''
    ].filter(Boolean).join('&');
    if (!scope || href.includes('buyingGroupId=') || href.includes('marketId=')) return href;
    return `${href}${href.includes('?') ? '&' : '?'}${scope}`;
  }

  function submit(command = prompt) {
    const trimmed = command.trim();
    if (!trimmed || isThinking) return;
    const href = scopedGeneratedViewHref(outputHrefForCommand(trimmed));
    const isOutput = href.startsWith('/generated-views') || href.startsWith('/atlas-output');

    // Report-generating commands → open generated-views in new tab (existing behavior)
    if (isOutput) {
      const pendingOutputTab = window.open('about:blank', '_blank');
      setIsThinking(true);
      setQuickAnswer(null);
      setStatus('ATLAS is checking the database and preparing the scenario output...');
      if (pendingOutputTab) {
        pendingOutputTab.document.write('<!doctype html><title>ATLAS is preparing</title><body style="margin:0;font-family:Inter,Arial,sans-serif;background:#fff;color:#0b1f33;display:grid;min-height:100vh;place-items:center;"><div style="text-align:center;"><strong style="font-size:18px;">ATLAS is preparing your scenario output</strong><p style="color:#5f6f80;font-size:13px;">Checking the database and opening the evidence readout...</p></div></body>');
        pendingOutputTab.document.close();
      }
      window.setTimeout(() => {
        setIsThinking(false);
        if (pendingOutputTab) {
          pendingOutputTab.location.href = href;
          setStatus('Scenario output opened in a new tab.');
          return;
        }
        setStatus('Popup blocked. Opening here...');
        window.location.href = href;
      }, 650);
      return;
    }

    // Conversational queries → navigate to /assistant with pre-filled prompt
    window.location.href = `/assistant?prompt=${encodeURIComponent(trimmed)}`;
  }

  function stageExample(example: string) {
    if (isThinking) return;
    setPrompt(example);
    setStatus('');
    inputRef.current?.focus();
  }

  let activeState: 'Default' | 'Hover' | 'Focused' | 'Processing' = 'Default';
  if (isThinking) {
    activeState = 'Processing';
  } else if (isFocused) {
    activeState = 'Focused';
  } else if (isHovered) {
    activeState = 'Hover';
  }

  const showSuggestions = isFocused && !isThinking && examples.length > 0;

  return (
    <section 
      className={`atlas-command-surface atlas-global-command-surface state-${activeState.toLowerCase()}${className ? ` ${className}` : ''}`} 
      aria-label="Ask ATLAS"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
          inputRef.current?.focus();
        }
      }}
    >
      <form onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
        <div className={`atlas-command-input-wrapper${isFocused ? ' focused' : ''}`}>
          <input
            ref={inputRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-label="Ask ATLAS for a scenario output"
            disabled={isThinking}
          />
          <button 
            type="button" 
            className="voice" 
            onClick={() => setStatus('Voice capture ready. Typed commands create the same scenario outputs in this POC.')} 
            disabled={isThinking}
            aria-label="Voice input"
          >
            <Mic size={16} />
          </button>
        </div>
        
        <button 
          type="submit" 
          className="send" 
          disabled={isThinking || !prompt.trim()}
          aria-label={isThinking ? 'Processing' : 'Send'}
        >
          {isThinking ? <Square size={14} className="stop-icon" /> : <Send size={14} />}
        </button>
      </form>
      
      {quickAnswer ? (
        <article className="atlas-command-answer">
          <span>Answer</span>
          <h3>{quickAnswer.title}</h3>
          <p>{quickAnswer.answer}</p>
          <SourceTrustMini source={quickAnswer.source} />
          <a href={quickAnswer.href} {...generatedOutputLinkProps(quickAnswer.href)}>{quickAnswer.actionLabel} <ArrowRight size={13} /></a>
        </article>
      ) : null}
      
      {showSuggestions && (
        <div className="atlas-command-surface-examples">
          {examples.map((example) => (
            <button 
              type="button" 
              key={example} 
              onMouseDown={(e) => {
                e.preventDefault();
                stageExample(example);
              }}
              disabled={isThinking}
            >
              {example}
            </button>
          ))}
        </div>
      )}
      
      {status ? <p className="atlas-command-status">{status}</p> : null}
    </section>
  );
}

function GeneratedWorkspace({
  ask,
  children,
  description,
  title
}: {
  ask?: string;
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="atlas-generated-workspace">
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
          {ask ? <em>Asked: “{ask}”</em> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function NextActionRail({
  actions
}: {
  actions: Array<{ href: string; label: string; reason: string }>;
}) {
  return (
    <section className="atlas-next-action-rail" aria-label="Recommended actions">
      {actions.map((action) => (
        <a href={action.href} key={action.label} {...generatedOutputLinkProps(action.href)}>
          <strong>{action.label}</strong>
          <span>{action.reason}</span>
          <ArrowRight size={14} />
        </a>
      ))}
    </section>
  );
}

function NextStepStrip({
  steps
}: {
  steps: Array<{ label: string; href: string; reason: string }>;
}) {
  return (
    <section className="atlas-next-step-strip" aria-label="Recommended next steps">
      {steps.map((step) => (
        <a href={step.href} key={step.label} {...generatedOutputLinkProps(step.href)}>
          <strong>{step.label}</strong>
          <span>{step.reason}</span>
          <ArrowRight size={14} />
        </a>
      ))}
    </section>
  );
}

function KpiRow() {
  const kpis = [
    { label: 'Revenue under negotiation', value: euros(packet.summary.revenueUnderNegotiation), delta: '+12% vs last refresh', note: 'Driven by Germany and UK renewals' },
    { label: 'Margin at risk', value: euros(packet.summary.marginAtRisk), delta: '+9% vs last refresh', note: 'EDEKA, Tesco and Carrefour lead exposure' },
    { label: 'Gap to plan', value: euros(packet.summary.gapToPlan), delta: '+EUR 1.6M vs last refresh', note: 'Expected realization trails target' },
    { label: 'High-risk buying groups', value: String(packet.summary.highRiskBuyingGroups), delta: `${packet.summary.activeBuyingGroups} active total`, note: 'Prioritize critical and high risk groups' }
  ];
  return (
    <section className="atlas-kpi-row">
      {kpis.map((kpi) => (
        <article key={kpi.label}>
          <strong>{kpi.value}</strong>
          <span>{kpi.label}</span>
          <em>{kpi.delta}</em>
          <p>{kpi.note}</p>
        </article>
      ))}
    </section>
  );
}

function NewsFinancialTape() {
  const items = [
    { label: 'Revenue in negotiation', value: euros(packet.summary.revenueUnderNegotiation), note: 'Europe active cycle' },
    { label: 'Margin at risk', value: euros(packet.summary.marginAtRisk), note: 'Highest in Germany and UK' },
    { label: 'Gap to plan', value: euros(packet.summary.gapToPlan), note: 'Realization behind target' },
    { label: 'High-risk groups', value: `${packet.summary.highRiskBuyingGroups}/${packet.summary.activeBuyingGroups}`, note: 'CNO watchlist' }
  ];

  return (
    <section className="atlas-news-tape" aria-label="Europe financial summary">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em>{item.note}</em>
        </div>
      ))}
    </section>
  );
}

function IntelligenceCard({
  title,
  whatHappened,
  whyItMatters,
  financial,
  affected,
  action,
  source,
  href,
  icon
}: {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  financial: { revenue?: number; margin?: number; volume?: number; trade?: number };
  affected: string;
  action: string;
  source: SourceMeta;
  href?: string;
  icon?: React.ReactNode;
}) {
  const content = (
    <>
      <header>
        <span>{icon}</span>
        <h3>{title}</h3>
      </header>
      <strong className="atlas-card-action">Recommended: {action}</strong>
      <FinancialImpactStrip revenue={financial.revenue} margin={financial.margin} volume={financial.volume} trade={financial.trade} />
      <dl className="atlas-card-read">
        <div><dt>Why now</dt><dd>{whyItMatters}</dd></div>
        <div><dt>Affected data</dt><dd>{affected}</dd></div>
        <div><dt>Signal</dt><dd>{whatHappened}</dd></div>
      </dl>
      <SourceTrustBar linked={!href} source={source} />
    </>
  );

  if (href) return <a className="atlas-intelligence-card" href={href}>{content}</a>;
  return <article className="atlas-intelligence-card">{content}</article>;
}

function MarketPressureGrid({ markets = packet.markets }: { markets?: Market[] }) {
  return (
    <section className="atlas-market-grid">
      {markets.map((market) => (
        <a className={`atlas-market-card ${classNameForRisk(market.pressureLevel)}`} href={`/markets/${market.id}`} key={market.id}>
          <span>{market.pressureLevel}</span>
          <h3>{market.name}</h3>
          <FinancialImpactStrip revenue={market.revenueUnderNegotiation} margin={market.marginAtRisk} volume={market.volumeExposure} trade={market.tradeSpendExposure} />
          <p>{market.topDrivers[0]}</p>
          <SourceTrustBar linked={false} source={market.source} />
        </a>
      ))}
    </section>
  );
}

function BuyingGroupTable({ groups }: { groups: BuyingGroup[] }) {
  return (
    <section className="atlas-hub-table" aria-label="Buying group exposure ranking">
      <div className="atlas-table-head">
        <span>Buying group</span>
        <span>Stage</span>
        <span>Revenue</span>
        <span>Margin risk</span>
        <span>Realization</span>
        <span>Action</span>
      </div>
      {groups.map((group) => (
        <a className="atlas-table-row" href={`/buying-groups/${group.id}`} key={group.id}>
          <span><strong>{group.name}</strong><em>{group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')}</em></span>
          <span><StatusChip status={group.negotiationStage === 'closed' ? 'approved' : group.riskLevel === 'critical' ? 'needs_validation' : 'modeled'} /></span>
          <span>{euros(group.financialExposure.revenueUnderNegotiation)}</span>
          <span>{euros(group.financialExposure.marginAtRisk)}</span>
          <span>{pct(group.financialExposure.expectedPriceRealization)} / target {pct(group.financialExposure.targetPriceRealization)}</span>
          <span>Open intelligence <ArrowRight size={13} /></span>
        </a>
      ))}
    </section>
  );
}

function SignalCards({ signals }: { signals: ExternalSignal[] }) {
  return (
    <section className="atlas-card-grid">
      {signals.map((signal) => {
        const firstGroup = signal.affectedBuyingGroups[0];
        const firstMarket = signal.affectedMarkets[0];
        const modelParams = new URLSearchParams();
        if (firstMarket) modelParams.set('market', firstMarket);
        if (firstGroup) modelParams.set('buyingGroup', firstGroup);
        modelParams.set('source', 'external-alert');
        modelParams.set('alert', signal.id);
        return (
          <IntelligenceCard
            key={signal.id}
            icon={<Newspaper size={16} />}
            title={signal.title}
            whatHappened={signal.summary}
            whyItMatters={signal.negotiationImplication}
            financial={{ revenue: signal.estimatedRevenueImpact, margin: signal.estimatedMarginImpact }}
            affected={`${signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')} / ${signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(', ')}`}
            action={signal.recommendedAction}
            source={signal.source}
            href={`/scenario-lab?${modelParams.toString()}`}
          />
        );
      })}
    </section>
  );
}

function CompetitorCards({ moves }: { moves: CompetitorMove[] }) {
  return (
    <section className="atlas-card-grid">
      {moves.map((move) => {
        const firstGroup = move.affectedBuyingGroups[0];
        const firstMarket = move.affectedMarkets[0];
        const modelParams = new URLSearchParams();
        if (firstMarket) modelParams.set('market', firstMarket);
        if (firstGroup) modelParams.set('buyingGroup', firstGroup);
        modelParams.set('source', 'competitor-alert');
        modelParams.set('alert', move.id);
        return (
          <IntelligenceCard
            key={move.id}
            icon={<TrendingUp size={16} />}
            title={`${move.competitor}: ${move.title}`}
            whatHappened={move.summary}
            whyItMatters={`${move.possibleBuyerLeverage} ${move.pepsicoImplication}`}
            financial={{ revenue: move.estimatedRevenueImpact, margin: move.estimatedMarginImpact }}
            affected={`${move.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(', ')} / ${move.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(', ')}`}
            action={move.recommendedAction}
            source={move.source}
            href={`/scenario-lab?${modelParams.toString()}`}
          />
        );
      })}
    </section>
  );
}

type AtlasActiveAlert = {
  action: string;
  affected: string;
  alertTypeLabel: 'News alert' | 'Scenario modeled' | 'Pattern identified' | 'Competitor move' | 'Memory update';
  effectLabel?: string;
  href: string;
  id: string;
  metrics: Array<{ label: string; value: string }>;
  modelHref?: string;
  possibleEffect: string;
  source: SourceMeta;
  title: string;
  tone: 'critical' | 'watch' | 'opportunity' | 'memory';
  trigger: string;
  value: string;
};

type TriageScenarioSnapshot = {
  description?: string;
  href: string;
  metrics: Array<{ label: string; value: string }>;
  status: string;
  title: string;
};

function alertToneFromRisk(risk: AtlasRiskLevel | Market['pressureLevel']): AtlasActiveAlert['tone'] {
  if (risk === 'critical' || risk === 'high') return 'critical';
  if (risk === 'medium') return 'watch';
  return 'opportunity';
}

function paramFromScenarioHref(href: string | undefined, key: string) {
  if (!href) return null;
  const query = href.split('?')[1];
  if (!query) return null;
  return new URLSearchParams(query).get(key);
}

function scenarioHrefWithId(href: string, scenarioId: string) {
  return `${href}${href.includes('?') ? '&' : '?'}scenario=${scenarioId}`;
}

function triageBuyingGroupIdForAlert(alert: AtlasActiveAlert) {
  return paramFromScenarioHref(alert.modelHref, 'buyingGroup')
    ?? paramFromScenarioHref(alert.href, 'buyingGroup');
}

function triageMarketIdForAlert(alert: AtlasActiveAlert) {
  return paramFromScenarioHref(alert.modelHref, 'market')
    ?? paramFromScenarioHref(alert.href, 'market');
}

function triageAtlasActionForAlert(alert: AtlasActiveAlert, scenarioSnapshot?: TriageScenarioSnapshot | null) {
  const buyingGroupId = triageBuyingGroupIdForAlert(alert);
  const marketId = triageMarketIdForAlert(alert);

  if (scenarioSnapshot && buyingGroupId) {
    const compareParams = new URLSearchParams();
    compareParams.append('scenario', 'recommended');
    compareParams.append('scenario', 'buyer-counter');
    compareParams.set('buyingGroup', buyingGroupId);
    if (marketId) compareParams.set('market', marketId);
    return {
      href: `/scenario-lab/compare?${compareParams.toString()}`,
      label: alert.alertTypeLabel === 'Scenario modeled' ? 'Compare scenarios' : 'See ATLAS scenarios'
    };
  }

  if (scenarioSnapshot) {
    return {
      href: scenarioSnapshot.href,
      label: 'Open ATLAS run'
    };
  }

  return {
    href: alert.modelHref ?? alert.href,
    label: alert.alertTypeLabel === 'Memory update' ? 'Open memory' : 'Open ATLAS work'
  };
}

function scenarioSnapshotForAlert(alert: AtlasActiveAlert): TriageScenarioSnapshot | null {
  if (!alert.modelHref?.startsWith('/scenario-lab') || alert.alertTypeLabel === 'Memory update') return null;

  const buyingGroupId = paramFromScenarioHref(alert.modelHref, 'buyingGroup');
  const marketId = paramFromScenarioHref(alert.modelHref, 'market');
  const matchedScenario = packet.scenarioModels.find((model) => (
    (buyingGroupId ? model.buyingGroupId === buyingGroupId : true)
    && (marketId ? model.marketId === marketId : true)
  )) ?? packet.scenarioModels.find((model) => buyingGroupId && model.buyingGroupId === buyingGroupId);

  if (matchedScenario) {
    return {
      href: scenarioHrefWithId(alert.modelHref, matchedScenario.id),
      metrics: [
        { label: 'Land', value: `${Math.round(matchedScenario.inputs.buyerAcceptanceProbability)}%` },
        { label: 'NR', value: euros(matchedScenario.outputs.revenueImpact) }
      ],
      status: 'AI-Scenario',
      title: matchedScenario.name,
      description: matchedScenario.outputs.recommendation
    };
  }

  return {
    href: alert.modelHref,
    metrics: [
      { label: 'Land', value: alert.tone === 'critical' ? '58%' : alert.tone === 'watch' ? '64%' : '71%' },
      { label: 'NR', value: alert.value }
    ],
    status: 'AI-Scenario',
    title: alert.tone === 'critical' ? 'Counterstrategy Needed' : 'Scenario Impact Modeled',
    description: alert.action
  };
}

function TriageScenarioSnapshotCard({ snapshot }: { snapshot: TriageScenarioSnapshot }) {
  return (
    <div className="atlas-triage-scenario-snapshot">
      <div className="atlas-triage-scenario-snapshot-head">
        <span className="atlas-triage-snapshot-category">{snapshot.status.toUpperCase()}</span>
      </div>
      <div className="atlas-triage-snapshot-body">
        <strong className="atlas-triage-snapshot-title">{snapshot.title}</strong>
        {snapshot.description ? (
          <p className="atlas-triage-snapshot-desc">{snapshot.description}</p>
        ) : null}
      </div>
      <div className="atlas-triage-snapshot-kv-list">
        {snapshot.metrics.map((metric) => (
          <div className="atlas-triage-snapshot-kv" key={`${snapshot.title}-${metric.label}`}>
            <span>{metric.label}</span>
            <span>{metric.value}</span>
          </div>
        ))}
      </div>
      <a className="atlas-triage-run-scenario-btn" href={snapshot.href}>
        <Sparkles size={14} />
        <span>Run Scenario</span>
      </a>
    </div>
  );
}

function triageCompletedActionsForAlert(alert: AtlasActiveAlert): TriageScenarioSnapshot[] {
  const scenarioSnapshot = scenarioSnapshotForAlert(alert) ?? {
    href: alert.modelHref ?? `/scenario-lab?buyingGroup=${triageBuyingGroupIdForAlert(alert) ?? ''}`,
    metrics: [
      { label: 'Land', value: alert.tone === 'critical' ? '58%' : alert.tone === 'watch' ? '64%' : '71%' },
      { label: 'NR', value: alert.value }
    ],
    status: 'AI-Scenario',
    title: alert.tone === 'critical' ? 'Counterstrategy Needed' : 'Scenario Impact Modeled',
    description: alert.action
  };

  const buyerCountMetric = alert.metrics.find((metric) => /buyer/i.test(metric.label));
  const marketCountMetric = alert.metrics.find((metric) => /market/i.test(metric.label));

  return [
    scenarioSnapshot,
    {
      description: 'Atlas routed the trigger into the current scenario assumptions and updated the workspace.',
      href: alert.modelHref ?? alert.href,
      metrics: [
        { label: 'Trigger', value: alert.trigger.toLowerCase() },
        { label: 'Buyers affected', value: buyerCountMetric?.value ?? alert.affected.split('·')[0]?.trim() ?? '1' }
      ],
      status: 'Impact mapping',
      title: 'Connected Alert to Negotiation Impact'
    },
    {
      description: 'Atlas checked the source trail and linked the alert to the verified evidence ledger.',
      href: alert.href,
      metrics: [
        { label: 'Source', value: sourceDisplayName(alert.source) },
        { label: 'Markets affected', value: marketCountMetric?.value ?? '1' }
      ],
      status: 'Evidence checked',
      title: 'Prepared Evidence Trail'
    }
  ];
}

function alertScopeForMarkets(marketIds: string[]) {
  return marketIds.map((id) => getMarket(id)?.name ?? id).join(' / ');
}

function alertScopeForBuyers(groupIds: string[]) {
  return groupIds.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ');
}

function alertCountLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function signalToAlert(signal: ExternalSignal): AtlasActiveAlert {
  const firstBuyer = signal.affectedBuyingGroups[0];
  const firstMarket = signal.affectedMarkets[0];
  const firstBuyerName = firstBuyer ? getBuyingGroup(firstBuyer)?.name ?? firstBuyer : null;
  const modelParams = new URLSearchParams();
  if (firstMarket) modelParams.set('market', firstMarket);
  if (firstBuyer) modelParams.set('buyingGroup', firstBuyer);
  modelParams.set('source', 'external-alert');
  modelParams.set('alert', signal.id);
  const scenarioHref = modelParams.toString() ? `/scenario-lab?${modelParams.toString()}` : '/scenario-lab';
  return {
    action: firstBuyerName ? `Model alert impact before prioritizing ${firstBuyerName}` : 'Model alert impact',
    affected: `${alertScopeForMarkets(signal.affectedMarkets)} · ${alertScopeForBuyers(signal.affectedBuyingGroups)}`,
    alertTypeLabel: 'News alert',
    effectLabel: 'Scenario assumptions / buyer priority after modeling',
    href: scenarioHref,
    id: `signal-${signal.id}`,
    metrics: [
      { label: signal.estimatedMarginImpact !== undefined ? 'Margin impact' : 'Revenue impact', value: euros(signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0) },
      { label: 'Markets affected', value: alertCountLabel(signal.affectedMarkets.length, 'market') },
      { label: 'Buyers affected', value: alertCountLabel(signal.affectedBuyingGroups.length, 'buyer') }
    ],
    modelHref: scenarioHref,
    possibleEffect: `${signal.negotiationImplication} Model this first to see whether it changes the ask, fallback, evidence set, concession path, and downstream buyer priority.`,
    source: signal.source,
    title: signal.title,
    tone: signal.estimatedMarginImpact && signal.estimatedMarginImpact > 1000000 ? 'critical' : 'watch',
    trigger: signal.signalType === 'world_news' ? 'world news' : signal.signalType.replaceAll('_', ' '),
    value: euros(signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0)
  };
}

function competitorToAlert(move: CompetitorMove): AtlasActiveAlert {
  const firstBuyer = move.affectedBuyingGroups[0];
  const firstMarket = move.affectedMarkets[0];
  const firstBuyerName = firstBuyer ? getBuyingGroup(firstBuyer)?.name ?? firstBuyer : null;
  const modelParams = new URLSearchParams();
  if (firstMarket) modelParams.set('market', firstMarket);
  if (firstBuyer) modelParams.set('buyingGroup', firstBuyer);
  modelParams.set('source', 'competitor-alert');
  modelParams.set('alert', move.id);
  const scenarioHref = modelParams.toString() ? `/scenario-lab?${modelParams.toString()}` : '/scenario-lab';
  return {
    action: firstBuyerName ? `Model competitor impact before prioritizing ${firstBuyerName}` : 'Model competitor impact',
    affected: `${alertScopeForMarkets(move.affectedMarkets)} · ${alertScopeForBuyers(move.affectedBuyingGroups)}`,
    alertTypeLabel: 'Competitor move',
    effectLabel: 'Scenario assumptions / concession risk',
    href: scenarioHref,
    id: `competitor-${move.id}`,
    metrics: [
      { label: move.estimatedMarginImpact !== undefined ? 'Margin impact' : 'Revenue impact', value: euros(move.estimatedMarginImpact ?? move.estimatedRevenueImpact ?? 0) },
      { label: 'Markets affected', value: alertCountLabel(move.affectedMarkets.length, 'market') },
      { label: 'Buyers affected', value: alertCountLabel(move.affectedBuyingGroups.length, 'buyer') }
    ],
    modelHref: scenarioHref,
    possibleEffect: `${move.possibleBuyerLeverage} ${move.pepsicoImplication} Model this before deciding whether it creates new buyer pushback, proof needs, or negotiation priority.`,
    source: move.source,
    title: `${move.competitor}: ${move.title}`,
    tone: move.estimatedMarginImpact && move.estimatedMarginImpact > 1000000 ? 'critical' : 'watch',
    trigger: move.moveType.replaceAll('_', ' '),
    value: euros(move.estimatedMarginImpact ?? move.estimatedRevenueImpact ?? 0)
  };
}

function marketToAlert(market: Market): AtlasActiveAlert {
  const read = buildMarketDecisionRead(market);
  const buyerName = read.topBuyer?.name ?? `${read.groups.length} buying groups`;
  const modelParams = new URLSearchParams();
  modelParams.set('market', market.id);
  modelParams.set('source', 'market-pressure');
  if (read.topBuyer) modelParams.set('buyingGroup', read.topBuyer.id);
  const scenarioHref = `/scenario-lab?${modelParams.toString()}`;
  return {
    action: read.topBuyer ? `Model pressure before changing ${read.topBuyer.name}'s priority` : 'Model market exposure',
    affected: `${buyerName} · ${market.activeBuyingGroups.length} active buyers`,
    alertTypeLabel: 'Pattern identified',
    effectLabel: 'Pricing corridor / derived buyer priority',
    href: scenarioHref,
    id: `market-${market.id}`,
    metrics: [
      { label: 'Margin at risk', value: euros(market.marginAtRisk) },
      { label: 'Active buyers', value: String(market.activeBuyingGroups.length) },
      { label: 'Pressure level', value: market.pressureLevel }
    ],
    modelHref: scenarioHref,
    possibleEffect: `${market.name}'s pressure state can change pricing corridor, concession path, and buyer response assumptions.`,
    source: market.source,
    title: `${market.name} moved to ${market.pressureLevel} market pressure`,
    tone: alertToneFromRisk(market.pressureLevel),
    trigger: `${market.pressureLevel} market pressure`,
    value: euros(market.marginAtRisk)
  };
}

function buyerTriggeredAlertRead(group: BuyingGroup, signal?: ExternalSignal) {
  const primaryMarket = getMarket(group.primaryMarkets[0]);
  const targetGap = group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization;
  if (signal) {
    return {
      action: `Model how this changes ${group.name}'s buyer response`,
      title: `${signal.title} affects ${group.name}`,
      trigger: signal.signalType === 'world_news' ? 'world news alert' : signal.signalType.replaceAll('_', ' '),
      possibleEffect: `${signal.negotiationImplication} This could change ${group.name}'s likely counter, evidence needs, and concession path.`
    };
  }
  if (targetGap >= 0.8) {
    return {
      action: 'Test fallback and red-line response before the next round',
      title: `${group.name} realization gap widened to ${pct(targetGap)}`,
      trigger: 'price realization below target',
      possibleEffect: `${group.name} is tracking ${pct(targetGap)} below target, which can change the in-going ask, fallback, red line, and buyer acceptance likelihood.`
    };
  }
  if (group.financialExposure.marginAtRisk >= 3000000) {
    return {
      action: 'Model margin recovery options before prioritizing concessions',
      title: `${group.name} margin exposure crossed ${euros(group.financialExposure.marginAtRisk)}`,
      trigger: 'margin exposure threshold crossed',
      possibleEffect: `${euros(group.financialExposure.marginAtRisk)} is at risk, so ATLAS should test price, trade spend, and volume assumptions before the next buyer move.`
    };
  }
  if (group.riskLevel === 'critical' || group.riskLevel === 'high') {
    return {
      action: 'Run buyer-response scenario before setting the next ask',
      title: `${group.name} moved into ${group.riskLevel} negotiation risk`,
      trigger: `${group.riskLevel} risk state`,
      possibleEffect: `${group.name}'s risk state can change buyer pushback, confidence in the recommended ask, and which proof should be prepared.`
    };
  }
  return {
    action: 'Check whether this changes the current scenario',
    title: `${group.name} has a new ${primaryMarket?.name ?? 'market'} negotiation signal`,
    trigger: 'buyer signal updated',
    possibleEffect: `A new signal for ${group.name} may affect the current scenario assumptions and negotiation priority.`
  };
}

function buyingGroupToAlert(group: BuyingGroup): AtlasActiveAlert {
  const signal = signalsFor({ buyingGroupId: group.id })[0];
  const targetGap = group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization;
  const alertRead = buyerTriggeredAlertRead(group, signal);
  return {
    action: alertRead.action,
    affected: `${group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · ${buyerRoundLabel(group)}`,
    alertTypeLabel: 'Pattern identified',
    effectLabel: 'Ask / fallback / buyer counter',
    href: `/scenario-lab?buyingGroup=${group.id}&source=buyer-risk`,
    id: `buyer-${group.id}`,
    metrics: [
      { label: 'Margin at risk', value: euros(group.financialExposure.marginAtRisk) },
      { label: 'Realization gap', value: pct(targetGap) },
      { label: 'Round', value: buyerRoundLabel(group) }
    ],
    modelHref: `/scenario-lab?buyingGroup=${group.id}&source=buyer-risk`,
    possibleEffect: alertRead.possibleEffect,
    source: signal?.source ?? group.source,
    title: alertRead.title,
    tone: alertToneFromRisk(group.riskLevel),
    trigger: alertRead.trigger,
    value: euros(group.financialExposure.marginAtRisk)
  };
}

function scenarioToAlert(model = packet.scenarioModels[0]): AtlasActiveAlert {
  const buyer = getBuyingGroup(model.buyingGroupId);
  const market = getMarket(model.marketId);
  const source = packet.documents.find((document) => model.sourceIds.includes(document.id))?.source ?? buyer?.source ?? market?.source ?? packet.markets[0].source;
  const scenarioTitle = buyer?.name && model.name.toLowerCase().startsWith(buyer.name.toLowerCase())
    ? model.name
    : `${buyer?.name ?? model.buyingGroupId}: ${model.name}`;
  return {
    action: 'Review scenario result',
    affected: `${buyer?.name ?? model.buyingGroupId} · ${market?.name ?? model.marketId}`,
    alertTypeLabel: 'Scenario modeled',
    effectLabel: 'Likelihood / value protected',
    href: `/scenario-lab?buyingGroup=${model.buyingGroupId}&market=${model.marketId}`,
    id: `scenario-${model.id}`,
    metrics: [
      { label: 'Risk-adjusted value', value: euros(model.outputs.riskAdjustedValue) },
      { label: 'Expected realization', value: pct(model.inputs.expectedRealizationPercent) },
      { label: 'Buyer acceptance', value: `${Math.round(model.inputs.buyerAcceptanceProbability)}%` }
    ],
    modelHref: `/scenario-lab?buyingGroup=${model.buyingGroupId}&market=${model.marketId}`,
    possibleEffect: `${model.outputs.recommendation} CNO should decide whether to use this modeled position, adjust the fallback, or rerun the scenario before the next negotiation.`,
    source,
    title: scenarioTitle,
    tone: model.outputs.riskLevel === 'high' ? 'critical' : model.outputs.riskLevel === 'medium' ? 'watch' : 'opportunity',
    trigger: `${pct(model.inputs.expectedRealizationPercent)} expected realization`,
    value: euros(model.outputs.riskAdjustedValue)
  };
}

function memoryToAlert(event: TimelineEvent): AtlasActiveAlert {
  const buyerId = event.buyingGroupIds[0];
  const scenarioHref = buyerId ? `/buying-groups/${buyerId}?view=strategy` : '/intelligence';
  return {
    action: buyerId ? 'Use memory in buyer scenario' : 'Review memory',
    affected: `${alertScopeForMarkets(event.marketIds)} · ${alertScopeForBuyers(event.buyingGroupIds)}`,
    alertTypeLabel: 'Memory update',
    effectLabel: 'Future prediction / buyer behavior',
    href: scenarioHref,
    id: `memory-${event.id}`,
    metrics: [
      { label: event.financialImpact?.marginImpact !== undefined ? 'Margin impact' : 'Revenue impact', value: euros(event.financialImpact?.marginImpact ?? event.financialImpact?.revenueImpact ?? 0) },
      { label: 'Markets affected', value: alertCountLabel(event.marketIds.length, 'market') },
      { label: 'Buyers affected', value: alertCountLabel(event.buyingGroupIds.length, 'buyer') }
    ],
    modelHref: scenarioHref,
    possibleEffect: event.summary,
    source: event.source,
    title: event.title,
    tone: 'memory',
    trigger: event.eventType.replaceAll('_', ' '),
    value: euros(event.financialImpact?.marginImpact ?? event.financialImpact?.revenueImpact ?? 0)
  };
}

function patternToAlert(pattern: CrossMarketPattern): AtlasActiveAlert {
  const firstBuyer = pattern.affectedBuyingGroups[0];
  const firstMarket = pattern.affectedMarkets[0];
  const modelParams = new URLSearchParams();
  if (firstMarket) modelParams.set('market', firstMarket);
  if (firstBuyer) modelParams.set('buyingGroup', firstBuyer);
  modelParams.set('source', 'cross-market-pattern');
  modelParams.set('pattern', pattern.id);
  const href = `/scenario-lab?${modelParams.toString()}`;
  const value = pattern.financialImplication.marginAtRisk
    ?? pattern.financialImplication.revenueAtRisk
    ?? pattern.financialImplication.tradeSpendExposure
    ?? 0;
  return {
    action: pattern.recommendedAction,
    affected: `${alertScopeForMarkets(pattern.affectedMarkets)} · ${alertScopeForBuyers(pattern.affectedBuyingGroups)}`,
    alertTypeLabel: 'Pattern identified',
    effectLabel: 'Repeated negotiation signal',
    href,
    id: `pattern-${pattern.id}`,
    metrics: [
      { label: pattern.financialImplication.marginAtRisk !== undefined ? 'Margin at risk' : pattern.financialImplication.revenueAtRisk !== undefined ? 'Revenue at risk' : 'Trade exposure', value: euros(value) },
      { label: 'Markets affected', value: alertCountLabel(pattern.affectedMarkets.length, 'market') },
      { label: 'Buyers affected', value: alertCountLabel(pattern.affectedBuyingGroups.length, 'buyer') }
    ],
    modelHref: href,
    possibleEffect: `${pattern.summary} CNO should decide whether this pattern changes which scenarios to test or which evidence should be prepared.`,
    source: pattern.source,
    title: pattern.title,
    tone: value > 1000000 ? 'critical' : 'watch',
    trigger: pattern.patternType.replaceAll('_', ' '),
    value: euros(value)
  };
}

function ActiveAlertsPanel({
  alerts,
  eyebrow = 'Active alerts',
  limit = 4,
  title = 'What changed and what it could affect.'
}: {
  alerts: AtlasActiveAlert[];
  eyebrow?: string;
  limit?: number;
  title?: string;
}) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);
  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.includes(alert.id)).slice(0, limit);
  if (!visibleAlerts.length) return null;

  return (
    <section className="atlas-active-alerts-panel" aria-label={eyebrow}>
      <header>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </header>
      <div>
        {visibleAlerts.map((alert) => {
          const isExpanded = expandedAlerts.includes(alert.id);
          return (
            <article className={`atlas-active-alert-card tone-${alert.tone} ${isExpanded ? 'is-expanded' : ''}`} key={alert.id}>
              <div className="atlas-active-alert-card-top">
                <div className="atlas-active-alert-story">
                  <span className="atlas-active-alert-type">{alert.alertTypeLabel}</span>
                  <strong>{alert.title}</strong>
                </div>
              </div>
              <div className="atlas-active-alert-content">
                <dl className="atlas-active-alert-metrics">
                  {alert.metrics.map((metric) => (
                    <div key={`${alert.id}-${metric.label}`}>
                      <dt>{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="atlas-active-alert-card-actions">
                <button
                  aria-expanded={isExpanded}
                  className="atlas-active-alert-details-toggle"
                  onClick={() => setExpandedAlerts((current) => (
                    current.includes(alert.id)
                      ? current.filter((id) => id !== alert.id)
                      : [...current, alert.id]
                  ))}
                  type="button"
                >
                  Why flagged <ChevronDown size={14} />
                </button>
              </div>
              {isExpanded ? (
                <div className="atlas-active-alert-expanded">
                  <p>{alert.possibleEffect}</p>
                  <dl className="atlas-active-alert-expanded-facts">
                    <div><dt>Downstream impact</dt><dd>{alert.affected}</dd></div>
                    <div><dt>Could change</dt><dd>{alert.effectLabel ?? 'Negotiation scenario'}</dd></div>
                    <div><dt>Modeling move</dt><dd>{alert.action}</dd></div>
                  </dl>
                  <footer>
                    <SourceTrustMini linked={false} source={alert.source} />
                    <a href={alert.modelHref ?? alert.href} title={alert.action}>
                      Open Scenario Lab <ArrowRight size={12} />
                    </a>
                  </footer>
                </div>
              ) : null}
              <button
                aria-label={`Dismiss ${alert.title}`}
                className="atlas-active-alert-dismiss"
                onClick={() => setDismissedAlerts((current) => [...current, alert.id])}
                type="button"
              >
                <X size={12} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type ScenarioEntryQueueItem = {
  action: string;
  href: string;
  impact: string;
  source: SourceMeta;
  title: string;
  trigger: string;
  why: string;
};

function triageAlertsForBuyingGroup(group: BuyingGroup) {
  const groupSignals = signalsFor({ buyingGroupId: group.id })
    .slice(0, 2)
    .map(signalToAlert);
  const groupScenarios = packet.scenarioModels
    .filter((model) => model.buyingGroupId === group.id)
    .slice(0, 2)
    .map(scenarioToAlert);
  const groupPatterns = packet.crossMarketPatterns
    .filter((pattern) => pattern.affectedBuyingGroups.includes(group.id))
    .slice(0, 1)
    .map(patternToAlert);

  const rawAlerts = [
    buyingGroupToAlert(group),
    ...groupSignals,
    ...groupScenarios,
    ...groupPatterns
  ];

  return rawAlerts.map((alert) => ({
    ...alert,
    id: `${group.id}-${alert.id}`
  }));
}

function computeTotalTriageAlertsCount() {
  const mvpBuyingGroups = [...packet.buyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
    .slice(0, 4);

  const groupScopes = mvpBuyingGroups.map((group) => ({
    alerts: triageAlertsForBuyingGroup(group)
  }));

  const holisticAlerts = groupScopes.flatMap((scope) => scope.alerts);
  return holisticAlerts.length;
}

function ScenarioEntryQueue({
  eyebrow = 'Alert-to-scenario queue',
  items,
  title = 'Model these alerts before deciding buyer or negotiation priority.'
}: {
  eyebrow?: string;
  items: ScenarioEntryQueueItem[];
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="atlas-scenario-entry-queue" aria-label={eyebrow}>
      <header>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </header>
      <div>
        {items.map((item) => (
          <a href={item.href} key={`${item.trigger}-${item.title}`}>
            <span>{item.trigger}</span>
            <strong>{item.title}</strong>
            <p>{item.action}</p>
            <div className="atlas-scenario-entry-impact">
              <span>Impact</span>
              <strong>{item.impact}</strong>
            </div>
            <footer>
              <SourceTrustMini linked={false} source={item.source} />
              <em>Model impact <ArrowRight size={12} /></em>
            </footer>
          </a>
        ))}
      </div>
    </section>
  );
}

function TriageCommandCenter({
  alerts
}: {
  alerts: AtlasActiveAlert[];
  items: ScenarioEntryQueueItem[];
}) {
  const [activeScopeId, setActiveScopeId] = useState('holistic');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const mvpBuyingGroups = [...packet.buyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
    .slice(0, 4);

  const groupScopes = mvpBuyingGroups.map((group) => ({
    id: group.id,
    label: group.name,
    meta: group.primaryMarkets.map((marketId) => getMarket(marketId)?.name ?? marketId).join(' / '),
    alerts: triageAlertsForBuyingGroup(group)
  }));

  const holisticAlerts = groupScopes.flatMap((scope) => scope.alerts);

  const triageScopes = [
    {
      id: 'holistic',
      label: 'All alerts',
      meta: 'Holistic view',
      alerts: holisticAlerts
    },
    ...groupScopes
  ];
  const activeScope = triageScopes.find((scope) => scope.id === activeScopeId) ?? triageScopes[0];
  const visibleAlerts = activeScope.alerts.filter((alert) => !dismissedAlertIds.includes(alert.id));
  const criticalCount = visibleAlerts.filter((alert) => alert.tone === 'critical').length;
  const totalModeledValue = visibleAlerts.reduce((sum, alert) => {
    const parsedValue = Number(alert.value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsedValue) ? sum + parsedValue : sum;
  }, 0);

  return (
    <section className="atlas-triage-command-center atlas-triage-command-center-v2" aria-label="Negotiation command center">
      <header className="atlas-triage-page-header">
        <div className="home-hero" aria-hidden="true" />
        <h1>Negotiation Command Center</h1>
        <p>Start with changes that could alter a buying group scenario: news, modeled risk, market patterns, and buyer memory.</p>
      </header>

      <div className="atlas-triage-workspace">
        <aside className="atlas-triage-side-nav" aria-label="Triage views">
          <span>View by</span>
          <nav>
            {triageScopes.map((scope) => {
              const scopeVisibleCount = scope.alerts.filter((alert) => !dismissedAlertIds.includes(alert.id)).length;
              return (
                <button
                  aria-current={scope.id === activeScope.id ? 'page' : undefined}
                  className={scope.id === activeScope.id ? 'is-active' : ''}
                  key={scope.id}
                  onClick={() => {
                    setActiveScopeId(scope.id);
                    setExpandedAlertId(null);
                  }}
                  type="button"
                >
                  <div>
                    <strong>{scope.label}</strong>
                    <small>{scope.meta}</small>
                  </div>
                  <em>{scopeVisibleCount}</em>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="atlas-triage-main-pane" key={activeScope.id}>
          <header className="atlas-triage-feed-header">
            <div className="atlas-triage-feed-header-left">
              <div className="atlas-triage-feed-header-title-row">
                <AlertCircle size={20} className="atlas-triage-alert-icon" />
                <h2 className="atlas-triage-alert-count">{visibleAlerts.length} Alerts</h2>
              </div>
              <p>{activeScope.id === 'holistic'
                ? 'All buying group alerts ranked by scenario impact.'
                : 'Review the alerts, history, and modeled risks that could change this buying group scenario.'}</p>
            </div>
            <a href="/buying-groups" className="atlas-triage-view-buyers-btn">
              <span>View Buying Groups</span>
              <ArrowRight size={14} />
            </a>
          </header>

        <div className="atlas-triage-alert-list atlas-triage-alert-list-v2">
          {visibleAlerts.length ? visibleAlerts.map((alert, index) => {
            const isExpanded = expandedAlertId === alert.id;
            const scenarioSnapshot = scenarioSnapshotForAlert(alert);
            const atlasAction = triageAtlasActionForAlert(alert, scenarioSnapshot);
            const buyingGroupId = triageBuyingGroupIdForAlert(alert);
            const buyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
          return (
              <article className={`atlas-triage-alert-row atlas-triage-alert-row-v2 tone-${alert.tone}${isExpanded ? ' is-expanded' : ''}`} key={alert.id}>
                {/* Upper block: alert summary */}
                <div className="atlas-triage-alert-main">
                  <div className="atlas-triage-alert-copy">
                    <div className="atlas-triage-alert-title-block">
                      <p className="atlas-triage-alert-eyebrow-label">{alert.alertTypeLabel}</p>
                      <h3>{alert.title}</h3>
                    </div>
                    <dl className="atlas-triage-row-metrics">
                      {alert.metrics.slice(0, 3).map((metric) => (
                        <div key={`${alert.id}-${metric.label}`}>
                          <dt>{metric.label}</dt>
                          <dd>{metric.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <button
                    className="atlas-triage-chevron-btn"
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${alert.title}`}
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                    type="button"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Lower block: Atlas reaction row (always visible) */}
                <div className="atlas-triage-alert-footer-row">
                  <div className="atlas-triage-alert-reaction-info">
                    <img src="/images/backgrounds/isotope_orbs 1.png" alt="Atlas" className="atlas-triage-reaction-logo" />
                    <div className="atlas-triage-reaction-text">
                      <span>Atlas Reaction:</span>
                      <span>{alert.action}</span>
                    </div>
                  </div>
                  <div className="atlas-triage-alert-cta-row">
                    <a className="atlas-triage-alert-secondary-cta" href={buyingGroupId ? `/buying-groups/${buyingGroupId}?view=current` : '/buying-groups'}>
                      {buyingGroup ? `Open ${buyingGroup.name}` : 'Open buying groups'}
                    </a>
                    <a className="atlas-triage-alert-primary-cta" href={atlasAction.href}>
                      {atlasAction.label} <ArrowRight size={13} />
                    </a>
                  </div>
                </div>

                {/* Expanded: AI work cards */}
                <div className="atlas-triage-alert-detail-wrapper">
                  <div className="atlas-triage-alert-detail-inner">
                    <section className="atlas-triage-alert-detail">
                      <div className="atlas-triage-alert-detail-copy">
                        <div>
                          <span>Why it matters</span>
                          <p>{alert.possibleEffect}</p>
                        </div>
                        <div>
                          <span>Dig deeper</span>
                          <p>{sourceDisplayName(alert.source)} · {formatAtlasDate(alert.source.sourceDate, { includeYear: true })} · {alert.source.confidence} confidence</p>
                        </div>
                      </div>
                      <div className="atlas-triage-completed-actions" aria-label="ATLAS completed work">
                        {triageCompletedActionsForAlert(alert).map((snapshot) => (
                          <TriageScenarioSnapshotCard key={`${alert.id}-${snapshot.status}-${snapshot.title}`} snapshot={snapshot} />
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </article>
            );
          }) : (
            <article className="atlas-triage-empty-state">
              <strong>No active alerts in this view.</strong>
              <p>Dismissed alerts stay out of the triage feed for this session. Switch to another buying group or return to the holistic view.</p>
            </article>
          )}
        </div>
      </section>
      </div>
    </section>
  );
}

function DocumentLibrary({ documents, buyingGroupId }: { documents: DocumentArtifact[]; buyingGroupId?: string }) {
  const retrieval = buyingGroupId ? buildRetrievalMessage(buyingGroupId) : null;
  return (
    <section className="atlas-document-section">
      {retrieval ? (
        <article className={`atlas-retrieval-note ${retrieval.noteType}`}>
          <FileSearch size={18} />
          <div>
            <strong>{retrieval.noteType.replaceAll('_', ' ')}</strong>
            <p>{retrieval.message}</p>
          </div>
        </article>
      ) : null}
      <section className="atlas-card-grid">
        {documents.map((document) => (
          <article className="atlas-document-card" key={document.id}>
            <header>
              <BookOpen size={16} />
              <span>{document.documentType.replaceAll('_', ' ')}</span>
              <StatusChip status={document.status} />
            </header>
            <h3>{document.title}</h3>
            <p>{document.summary}</p>
            <div className="atlas-document-meta">
              <span>{document.reusable ? 'Reusable source' : 'Draft-only source'}</span>
              <span>{document.lastUsed ? `Last used ${document.lastUsed}` : 'Not used yet'}</span>
              {document.supersededBy ? <span>Superseded by {document.supersededBy}</span> : null}
            </div>
            <div className="atlas-document-actions">
              <a href={hrefForDocumentArtifact(document)} rel="noreferrer" target="_blank">Open document <ArrowRight size={13} /></a>
              {document.buyingGroupId ? <a href={`/buying-groups/${document.buyingGroupId}?view=strategy`}>Buyer scenario memory</a> : null}
              {document.marketId ? <a href={`/markets/${document.marketId}`}>Market</a> : null}
            </div>
            <SourceTrustBar source={document.source} />
          </article>
        ))}
      </section>
    </section>
  );
}

function hrefForDocumentArtifact(document: DocumentArtifact) {
  const scope = `${document.buyingGroupId ? `&buyingGroupId=${encodeURIComponent(document.buyingGroupId)}` : ''}${document.marketId ? `&marketId=${encodeURIComponent(document.marketId)}` : ''}`;
  return `/generated-views?prompt=${encodeURIComponent(`Retrieve ${document.title}`)}&mode=retrieved&documentId=${encodeURIComponent(document.id)}${scope}`;
}

function hrefForStoredGeneratedView(view: StoredGeneratedView) {
  return `/generated-views?prompt=${encodeURIComponent(view.prompt)}&mode=draft&editable=1&storedViewId=${encodeURIComponent(view.id)}${view.buyingGroupId ? `&buyingGroupId=${view.buyingGroupId}` : ''}${view.marketId ? `&marketId=${view.marketId}` : ''}`;
}

function UploadSourceTray({ buyingGroup }: { buyingGroup: BuyingGroup }) {
  const [drafts, setDrafts] = useState<Array<{ id: string; name: string; note: string; type: string }>>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('prep_document');
  const [note, setNote] = useState('');

  function addDraft() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDrafts((current) => [
      {
        id: `uploaded-${Date.now()}`,
        name: trimmed,
        note: note.trim() || 'Placeholder extraction pending. User-added source memory only.',
        type
      },
      ...current
    ]);
    setName('');
    setNote('');
  }

  return (
    <section className="atlas-upload-source-tray">
      <header>
        <span>Attach source memory</span>
        <h3>Add scenario reports, debriefs, or supporting files to {buyingGroup.name}.</h3>
        <p>Prototype upload stores metadata and notes only. Added files are labeled as user-entered source memory.</p>
      </header>
      <div className="atlas-upload-fields">
        <label>
          <span>Document name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Carrefour scenario evidence report.pdf" />
        </label>
        <label>
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="prep_document">Scenario evidence</option>
            <option value="debrief">Debrief</option>
            <option value="source_doc">Source document</option>
            <option value="strategy_file">Buyer workspace note</option>
          </select>
        </label>
        <label className="wide">
          <span>Notes or excerpt</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Key assumption, pasted excerpt, or why this matters..." />
        </label>
        <button type="button" onClick={addDraft}>Add to buyer memory</button>
      </div>
      <div className="atlas-upload-drafts">
        {drafts.length ? drafts.map((draft) => (
          <article key={draft.id}>
            <div>
              <strong>{draft.name}</strong>
              <span>{draft.type.replaceAll('_', ' ')} / user-entered source</span>
              <p>{draft.note}</p>
            </div>
            <button type="button" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}>Remove</button>
          </article>
        )) : (
          <p>No added source documents in this browser session yet.</p>
        )}
      </div>
    </section>
  );
}

function BuyerProfileUpdatePanel({
  buyingGroup,
  onAddUpdate,
  updates
}: {
  buyingGroup: BuyingGroup;
  onAddUpdate: (update: BuyerProfileDocumentUpdate) => void;
  updates: BuyerProfileDocumentUpdate[];
}) {
  const [fileName, setFileName] = useState('');
  const [documentType, setDocumentType] = useState('prep_document');
  const [impactType, setImpactType] = useState('buyer_counter');
  const [note, setNote] = useState('');
  const [buyerAskDelta, setBuyerAskDelta] = useState(0.2);
  const [expectedRealizationDelta, setExpectedRealizationDelta] = useState(0);
  const [marginAtRiskDelta, setMarginAtRiskDelta] = useState(0.8);
  const [tradeSpendDelta, setTradeSpendDelta] = useState(0.4);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<BuyerProfileDocumentUpdate | null>(null);
  const latestConfirmed = updates[0];
  const impactFields: Array<{
    label: string;
    setter: (next: number) => void;
    unit: string;
    value: number;
  }> = [
    { label: 'Buyer ask', value: buyerAskDelta, setter: setBuyerAskDelta, unit: 'pts' },
    { label: 'Expected realization', value: expectedRealizationDelta, setter: setExpectedRealizationDelta, unit: 'pts' },
    { label: 'Margin at risk', value: marginAtRiskDelta, setter: setMarginAtRiskDelta, unit: 'EUR M' },
    { label: 'Trade spend', value: tradeSpendDelta, setter: setTradeSpendDelta, unit: 'EUR M' }
  ];

  function applyPreset(nextImpactType: string) {
    setImpactType(nextImpactType);
    setPendingUpdate(null);
    if (nextImpactType === 'buyer_counter') {
      setBuyerAskDelta(0.2);
      setExpectedRealizationDelta(0);
      setMarginAtRiskDelta(0.8);
      setTradeSpendDelta(0.4);
    }
    if (nextImpactType === 'finance_update') {
      setBuyerAskDelta(0);
      setExpectedRealizationDelta(0.2);
      setMarginAtRiskDelta(-0.6);
      setTradeSpendDelta(0);
    }
    if (nextImpactType === 'promo_pressure') {
      setBuyerAskDelta(0.1);
      setExpectedRealizationDelta(-0.1);
      setMarginAtRiskDelta(0.5);
      setTradeSpendDelta(0.9);
    }
    if (nextImpactType === 'market_offset') {
      setBuyerAskDelta(0);
      setExpectedRealizationDelta(0.3);
      setMarginAtRiskDelta(-0.9);
      setTradeSpendDelta(-0.2);
    }
  }

  function buildDraftUpdate(): BuyerProfileDocumentUpdate | null {
    const trimmedName = fileName.trim();
    if (!trimmedName) return null;
    const draft: BuyerProfileDocumentUpdate = {
      id: `buyer-profile-update-${Date.now()}`,
      fileName: trimmedName,
      documentType,
      impactType,
      note: note.trim() || 'Supporting document impact entered by user.',
      createdAt: new Date().toISOString(),
      buyerAskDelta,
      expectedRealizationDelta,
      marginAtRiskDelta: marginAtRiskDelta * 1000000,
      tradeSpendDelta: tradeSpendDelta * 1000000
    };
    return {
      ...draft,
      riskDelta: profileRiskDelta(draft),
      confidenceDelta: profileConfidenceDelta(draft),
      profileImpactSummary: profileImpactSummary(draft)
    };
  }

  function previewUpdate() {
    const draft = buildDraftUpdate();
    if (!draft) return;
    setPendingUpdate(draft);
  }

  function confirmUpdate() {
    if (!pendingUpdate) return;
    onAddUpdate({
      ...pendingUpdate,
      confirmedAt: new Date().toISOString()
    });
    setFileName('');
    setNote('');
    setPendingUpdate(null);
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="atlas-buyer-profile-update-compact">
        <button type="button" onClick={() => setIsOpen(true)}>Add update</button>
        {latestConfirmed ? (
          <span>Latest confirmed: {latestConfirmed.fileName} changed profile read {formatAtlasDate(latestConfirmed.confirmedAt ?? latestConfirmed.createdAt)}.</span>
        ) : null}
      </div>
    );
  }

  return (
    <section className="atlas-buyer-profile-update open" id="group-update">
      <header>
        <div>
          <span>Add update</span>
          <h3>Debrief or supporting document</h3>
        </div>
        <button type="button" onClick={() => setIsOpen(false)}>Close form</button>
      </header>

      <div className="atlas-profile-update-form">
        <label className="file">
          <span>Supporting document</span>
          <input type="file" onChange={(event) => { setFileName(event.target.files?.[0]?.name ?? ''); setPendingUpdate(null); }} />
        </label>
        <label>
          <span>Or document name</span>
          <input value={fileName} onChange={(event) => { setFileName(event.target.value); setPendingUpdate(null); }} placeholder={`${buyingGroup.name} latest prep update.pdf`} />
        </label>
        <label>
          <span>Document type</span>
          <select value={documentType} onChange={(event) => { setDocumentType(event.target.value); setPendingUpdate(null); }}>
            <option value="prep_document">Prep document</option>
            <option value="debrief">Debrief</option>
            <option value="finance_update">Finance update</option>
            <option value="customer_note">Customer note</option>
            <option value="market_source">Market source</option>
          </select>
        </label>
        <label>
          <span>Impact pattern</span>
          <select value={impactType} onChange={(event) => applyPreset(event.target.value)}>
            <option value="buyer_counter">Buyer counter increased pressure</option>
            <option value="finance_update">Finance improved the read</option>
            <option value="promo_pressure">Promo pressure increased</option>
            <option value="market_offset">Market offset found</option>
          </select>
        </label>
        <label className="wide">
          <span>What changed?</span>
          <input value={note} onChange={(event) => { setNote(event.target.value); setPendingUpdate(null); }} placeholder="Example: latest debrief says buyer moved ask up and requires Q4 promo support." />
        </label>
      </div>

      <div className="atlas-profile-impact-editor" aria-label="Profile number impacts">
        {impactFields.map((field) => (
          <label key={field.label}>
            <span>{field.label}</span>
            <div>
              <input
                type="number"
                step="0.1"
                value={field.value}
                onChange={(event) => { field.setter(Number(event.target.value)); setPendingUpdate(null); }}
              />
              <em>{field.unit}</em>
            </div>
          </label>
        ))}
        <button type="button" onClick={previewUpdate}>Preview impact</button>
      </div>

      {pendingUpdate ? (
        <article className="atlas-profile-impact-preview">
          <header>
            <div>
              <span>Pending buyer-profile change</span>
              <h4>{pendingUpdate.fileName}</h4>
            </div>
            <strong>{pendingUpdate.riskDelta === 'increased' ? 'Risk up' : pendingUpdate.riskDelta === 'reduced' ? 'Risk down' : 'Risk flat'}</strong>
          </header>
          <p>{pendingUpdate.profileImpactSummary}</p>
          <dl>
            <div>
              <dt>Buyer ask</dt>
              <dd>{signedPointLabel(pendingUpdate.buyerAskDelta)}</dd>
            </div>
            <div>
              <dt>PepsiCo position</dt>
              <dd>{signedPointLabel(pendingUpdate.expectedRealizationDelta)}</dd>
            </div>
            <div>
              <dt>Margin at risk</dt>
              <dd>{signedEuroLabel(pendingUpdate.marginAtRiskDelta)}</dd>
            </div>
            <div>
              <dt>Trade spend</dt>
              <dd>{signedEuroLabel(pendingUpdate.tradeSpendDelta)}</dd>
            </div>
          </dl>
          <div className="atlas-profile-impact-actions">
            <button type="button" onClick={confirmUpdate}>Confirm and update profile</button>
            <button type="button" onClick={() => setPendingUpdate(null)}>Dismiss preview</button>
          </div>
        </article>
      ) : null}
    </section>
  );
}

function ConfirmedProfileImpactStrip({ updates }: { updates: BuyerProfileDocumentUpdate[] }) {
  const latest = updates[0];
  if (!latest) return null;
  return (
    <section className="atlas-confirmed-profile-impact" aria-label="Confirmed buyer profile impact">
      <div>
        <span>Working read updated</span>
        <strong>{latest.profileImpactSummary ?? latest.note}</strong>
      </div>
      <dl>
        <div>
          <dt>Buyer ask</dt>
          <dd>{signedPointLabel(latest.buyerAskDelta)}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{signedPointLabel(latest.expectedRealizationDelta)}</dd>
        </div>
        <div>
          <dt>Margin</dt>
          <dd>{signedEuroLabel(latest.marginAtRiskDelta)}</dd>
        </div>
      </dl>
    </section>
  );
}

type TimelineMemoryEntry = {
  date: string;
  eventType: string;
  financialImpact?: TimelineEvent['financialImpact'];
  id: string;
  kind: 'event' | 'document' | 'update' | 'generated';
  openHref?: string;
  source?: SourceMeta;
  status: AtlasStatus;
  summary: string;
  title: string;
};

function timelineEntryWeight(entry: TimelineMemoryEntry): 'major' | 'local' | 'finance' | 'debrief' | 'supporting' | 'artifact' | 'system' {
  const normalized = `${entry.kind} ${entry.eventType} ${entry.title}`.toLowerCase();
  if (/finance|nrm|guardrail|corridor|red line/.test(normalized)) return 'finance';
  if (/kam|local|retailer kpi|cma|signed agreement|local input/.test(normalized)) return 'local';
  if (/debrief|learning|post-negotiation/.test(normalized)) return 'debrief';
  if (entry.financialImpact?.revenueImpact || entry.financialImpact?.marginImpact || entry.financialImpact?.tradeSpendImpact) return 'major';
  if (/decision|debrief|buyer ask|financial change|strategy|lock|concession|scenario/.test(normalized) && entry.kind !== 'generated') return 'major';
  if (entry.kind === 'document' || entry.kind === 'update') return 'supporting';
  if (entry.kind === 'generated') return 'artifact';
  return 'system';
}

function timelineEntryWeightLabel(weight: ReturnType<typeof timelineEntryWeight>) {
  if (weight === 'major') return 'Major decision';
  if (weight === 'local') return 'Validated local input';
  if (weight === 'finance') return 'Finance guardrail';
  if (weight === 'debrief') return 'Debrief learning';
  if (weight === 'supporting') return 'Supporting document';
  if (weight === 'artifact') return 'Generated artifact';
  return 'System note';
}

function timelineValidationRole(entry: TimelineMemoryEntry) {
  const normalized = `${entry.kind} ${entry.eventType} ${entry.title} ${entry.summary} ${entry.source?.sourceName ?? ''}`.toLowerCase();
  if (/finance|nrm|guardrail|corridor|red line|margin model/.test(normalized)) return 'Finance/NRM';
  if (/kam|local|retailer kpi|cma|signed agreement|field/.test(normalized)) return 'Local account team';
  if (entry.source?.sourceType === 'ai_generated' || entry.source?.sourceType === 'modeled' || entry.kind === 'generated') return 'AI-derived from source memory';
  return 'CNO';
}

function timelineEventLabel(entry: TimelineMemoryEntry) {
  const normalized = `${entry.eventType} ${entry.title}`.toLowerCase();
  if (/buyer ask|round|negotiation update/.test(normalized)) return 'Buyer ask';
  if (/scenario/.test(normalized)) return 'Scenario saved';
  if (/debrief/.test(normalized)) return 'Debrief';
  if (/decision/.test(normalized)) return 'Decision';
  if (/signal|affordability|external/.test(normalized)) return 'Market signal';
  if (/document|source|prep|profile|agreement|cma|signed/.test(normalized)) return 'Source added';
  if (/financial|margin|revenue|trade/.test(normalized)) return 'Financial change';
  return timelineEntryWeightLabel(timelineEntryWeight(entry));
}

function isNegotiationHistoryEntry(entry: TimelineMemoryEntry) {
  const normalized = `${entry.kind} ${entry.eventType} ${entry.title} ${entry.summary}`.toLowerCase();
  if (entry.financialImpact?.revenueImpact || entry.financialImpact?.marginImpact || entry.financialImpact?.tradeSpendImpact) return true;
  if (entry.kind === 'document') return /debrief|signed|agreement|strategy|negotiation|meeting|prep/.test(normalized);
  if (entry.kind === 'generated') return /scenario|debrief|strategy|room|financial|concession/.test(normalized);
  return /ask|round|decision|debrief|financial|margin|trade|concession|scenario|strategy|meeting|approval|position|red line|fallback|signal|promo|value-pack|affordability|pressure/.test(normalized);
}

function timelineImpactSummary(entry: TimelineMemoryEntry) {
  if (entry.financialImpact?.marginImpact || entry.financialImpact?.tradeSpendImpact || entry.financialImpact?.revenueImpact) {
    const parts = [
      entry.financialImpact.revenueImpact ? `Revenue ${signedEuroLabel(entry.financialImpact.revenueImpact)}` : null,
      entry.financialImpact.marginImpact ? `Margin ${signedEuroLabel(entry.financialImpact.marginImpact)}` : null,
      entry.financialImpact.tradeSpendImpact ? `Trade ${signedEuroLabel(entry.financialImpact.tradeSpendImpact)}` : null
    ].filter(Boolean);
    return parts.join(' / ');
  }
  const normalized = `${entry.eventType} ${entry.title}`.toLowerCase();
  if (/finance|nrm|guardrail|red line|corridor/.test(normalized)) return 'Finance guardrail';
  if (/kam|local|retailer kpi|cma|signed/.test(normalized)) return 'Validated local input';
  if (/debrief/.test(normalized)) return 'Debrief learning';
  if (/scenario/.test(normalized)) return 'Scenario memory';
  if (/document|prep|agreement/.test(normalized)) return 'Source evidence';
  if (/strategy|lock/.test(normalized)) return 'Strategy memory';
  return 'Negotiation memory';
}

function yearForTimelineDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date.slice(0, 4) || 'Unknown';
  return String(parsed.getFullYear());
}

function buildTimelineMemoryEntries({
  documents = [],
  events,
  generatedViews = [],
  updates = []
}: {
  documents?: DocumentArtifact[];
  events: TimelineEvent[];
  generatedViews?: StoredGeneratedView[];
  updates?: BuyerProfileDocumentUpdate[];
}): TimelineMemoryEntry[] {
  const documentEntries: TimelineMemoryEntry[] = documents.map((document) => ({
    date: document.source.sourceDate || `${document.year}-01-01`,
    eventType: `Supporting document / ${document.documentType.replaceAll('_', ' ')}`,
    id: `doc-${document.id}`,
    kind: 'document',
    openHref: hrefForDocumentArtifact(document),
    source: document.source,
    status: document.status,
    summary: `${document.summary} Uploaded ${document.source.sourceDate}.`,
    title: document.title
  }));
  const updateEntries: TimelineMemoryEntry[] = updates.map((update) => ({
    date: update.confirmedAt ?? update.createdAt,
    eventType: `Confirmed profile update / ${update.documentType.replaceAll('_', ' ')}`,
    financialImpact: {
      marginImpact: update.marginAtRiskDelta,
      tradeSpendImpact: update.tradeSpendDelta
    },
    id: `update-${update.id}`,
    kind: 'update',
    source: documents[0]?.source ? buildUserEnteredSource(update, documents[0].source) : undefined,
    status: 'modeled',
    summary: update.profileImpactSummary ?? update.note,
    title: update.fileName
  }));
  const generatedEntries: TimelineMemoryEntry[] = generatedViews
    .filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached')
    .map((view, index) => ({
      date: view.savedToProfileAt ?? view.updatedAt,
      eventType: `${view.mode.replaceAll('_', ' ')} / attached scenario output`,
      id: `generated-${view.id}-${index}`,
      kind: 'generated',
      openHref: hrefForStoredGeneratedView(view),
      source: buildGeneratedViewSource(view, documents[0]?.source ?? events[0]?.source ?? atlasIntelligenceSeed.documents[0].source),
      status: 'modeled',
      summary: view.summary || view.sourceDecision || `Generated from prompt: ${view.prompt}`,
      title: view.title
    }));
  const eventEntries: TimelineMemoryEntry[] = events.map((event) => ({
    date: event.timestamp,
    eventType: event.eventType.replaceAll('_', ' '),
    financialImpact: event.financialImpact,
    id: event.id,
    kind: 'event',
    source: event.source,
    status: event.status,
    summary: event.summary,
    title: event.title
  }));

  return [...updateEntries, ...generatedEntries, ...eventEntries, ...documentEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function TimelineFeed({
  documents,
  events,
  generatedViews,
  updates
}: {
  documents?: DocumentArtifact[];
  events: TimelineEvent[];
  generatedViews?: StoredGeneratedView[];
  updates?: BuyerProfileDocumentUpdate[];
}) {
  const entries = buildTimelineMemoryEntries({ documents, events, generatedViews, updates });
  const [hiddenEntryIds, setHiddenEntryIds] = useState<string[]>([]);
  const visibleEntries = entries.filter((entry) => !hiddenEntryIds.includes(entry.id));
  const negotiationEntries = visibleEntries.filter(isNegotiationHistoryEntry);
  const currentYear = '2026';
  const grouped = negotiationEntries.reduce<Record<string, TimelineMemoryEntry[]>>((acc, entry) => {
    const year = yearForTimelineDate(entry.date);
    acc[year] = [...(acc[year] ?? []), entry];
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const hasCurrentYear = years.includes(currentYear);

  return (
    <section className="atlas-timeline-feed">
      {years.map((year, index) => (
        <details className="atlas-timeline-year" key={year} open={year === currentYear || (!hasCurrentYear && index === 0)}>
          <summary>
            <span>{year}</span>
            <em>{grouped[year].length} negotiation {grouped[year].length === 1 ? 'event' : 'events'}</em>
          </summary>
          <div className="atlas-timeline-year-items">
            {grouped[year].map((entry) => (
              <article className={`timeline-${entry.kind} importance-${timelineEntryWeight(entry)}`} key={entry.id}>
                <time>{formatAtlasDate(entry.date, { includeTime: true })}</time>
                <div>
                  <div className="atlas-timeline-entry-top">
                    <span className="atlas-timeline-kind">{timelineEventLabel(entry)}</span>
                    <em>{timelineEntryWeightLabel(timelineEntryWeight(entry))}</em>
                    <button type="button" onClick={() => setHiddenEntryIds((current) => [...current, entry.id])}>Not relevant</button>
                  </div>
                  <h3>{entry.title}</h3>
                  <p className="atlas-timeline-impact-read">{timelineImpactSummary(entry)} · Validated by {timelineValidationRole(entry)}</p>
                  {entry.financialImpact ? (
                    <TimelineImpactPills
                      revenue={entry.financialImpact.revenueImpact}
                      margin={entry.financialImpact.marginImpact}
                      trade={entry.financialImpact.tradeSpendImpact}
                    />
                  ) : null}
                  <details className="atlas-timeline-entry-details">
                    <summary>View full event</summary>
                    <p>{entry.summary}</p>
                    <small>{entry.eventType}</small>
                    {entry.source ? <SourceTrustMini source={entry.source} /> : null}
                    {entry.openHref ? <a className="atlas-timeline-open-link" href={entry.openHref} {...generatedOutputLinkProps(entry.openHref)}>Open artifact <ArrowRight size={13} /></a> : null}
                  </details>
                </div>
              </article>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}

function DebriefMemoryComparison({
  workspace
}: {
  workspace: BuyingGroupWorkspacePacket;
}) {
  const plan = buildNegotiationPlanPacket(workspace.buyingGroup.id);
  const historicalEvent = workspace.timelineEvents.find((event) => /debrief|agreement|outcome|signed|decision/i.test(`${event.eventType} ${event.title}`)) ?? workspace.timelineEvents[0];
  if (!plan || !historicalEvent) return null;
  const plannedAsk = plan.versionHistory.find((version) => version.status === 'superseded') ? plan.targetPercent : plan.ingoingAskPercent;
  const landedAsk = Math.max(0, Number((plan.fallbackPercent + 0.2).toFixed(1)));
  const variance = Number((landedAsk - plannedAsk).toFixed(1));
  const marginImpact = historicalEvent.financialImpact?.marginImpact ?? Math.round(workspace.buyingGroup.financialExposure.marginAtRisk * 0.11);
  const lesson = variance < 0
    ? 'Prior cycle landed below plan; keep fallback tied to measurable buyer commitments.'
    : 'Prior cycle protected the planned corridor; reuse evidence before adding trade spend.';

  return (
    <section className="atlas-debrief-memory-comparison" aria-label="Final versus planned negotiation memory">
      <header>
        <div>
          <span>Debrief memory</span>
          <h3>Final vs planned outcome feeding this strategy.</h3>
        </div>
        <SourceTrustMini source={historicalEvent.source} />
      </header>
      <dl>
        <div><dt>Planned position</dt><dd>{plannedAsk.toFixed(1)}%</dd></div>
        <div><dt>Final outcome</dt><dd>{landedAsk.toFixed(1)}%</dd></div>
        <div className={variance < 0 ? 'tone-risk' : 'tone-good'}><dt>Variance</dt><dd>{variance > 0 ? '+' : ''}{variance.toFixed(1)} pts</dd></div>
        <div><dt>Margin learning</dt><dd>{euros(marginImpact)}</dd></div>
      </dl>
      <p>{lesson}</p>
    </section>
  );
}

type SupportingDocumentQuickEntry = {
  date: string;
  href: string;
  id: string;
  source?: SourceMeta;
  status: AtlasStatus;
  summary?: string;
  title: string;
  type: string;
};

function SupportingDocumentLedger({
  buyingGroupId,
  documents,
  generatedViews,
  updates
}: {
  buyingGroupId: string;
  documents: DocumentArtifact[];
  generatedViews?: StoredGeneratedView[];
  updates: BuyerProfileDocumentUpdate[];
}) {
  const entries: SupportingDocumentQuickEntry[] = [
    ...documents.map((document) => ({
      date: document.source.sourceDate || `${document.year}-01-01`,
      href: document.source.url ?? `/intelligence?buyingGroup=${buyingGroupId}&document=${document.id}`,
      id: document.id,
      source: document.source,
      status: document.status,
      summary: document.summary,
      title: document.title,
      type: document.documentType.replaceAll('_', ' ')
    })),
    ...updates.map((update) => ({
      date: update.createdAt,
      href: `/intelligence?buyingGroup=${buyingGroupId}&document=${update.id}`,
      id: update.id,
      source: documents[0]?.source ? buildUserEnteredSource(update, documents[0].source) : undefined,
      status: 'modeled' as AtlasStatus,
      summary: update.profileImpactSummary ?? update.note,
      title: update.fileName,
      type: update.documentType.replaceAll('_', ' ')
    })),
    ...(generatedViews ?? [])
      .filter((view) => (view.lifecycleState ?? (view.savedToProfileAt ? 'attached' : 'draft')) === 'attached')
      .map((view, index) => ({
      date: view.savedToProfileAt ?? view.updatedAt,
      href: hrefForStoredGeneratedView(view),
      id: `${view.id}-${index}`,
      source: buildGeneratedViewSource(view, documents[0]?.source ?? atlasIntelligenceSeed.documents[0].source),
      status: 'modeled' as AtlasStatus,
      summary: view.summary || view.sourceDecision,
      title: view.title,
      type: view.artifactType === 'negotiation_plan'
        ? 'strategy plan'
        : view.artifactType === 'scenario_output'
          ? 'scenario output'
          : 'scenario output'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="atlas-supporting-document-ledger">
      {entries.map((entry) => (
        <a href={entry.href} key={entry.id} {...generatedOutputLinkProps(entry.href)}>
          <div>
            <h3>{entry.title}</h3>
            <p>{entry.type} / {formatAtlasDate(entry.date, { includeYear: true })}</p>
          </div>
        </a>
      ))}
    </section>
  );
}

function CompactSourceLine({ source }: { source: SourceMeta }) {
  return (
    <p className="atlas-compact-source">
      <ShieldCheck size={13} />
      <span className={`atlas-source-type-pill ${sourceTypeClass(source)}`}>{sourceTypeLabel(source)}</span>
      {source.url ? (
        <a href={source.url} rel="noreferrer" target="_blank">{sourceDisplayName(source)}</a>
      ) : (
        <span>{sourceDisplayName(source)}</span>
      )}
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function CompactSourceText({ source }: { source: SourceMeta }) {
  return (
    <p className="atlas-compact-source">
      <ShieldCheck size={13} />
      <span className={`atlas-source-type-pill ${sourceTypeClass(source)}`}>{sourceTypeLabel(source)}</span>
      <span>{sourceDisplayName(source)}</span>
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function CompactImpactLine({
  revenue,
  margin,
  volume,
  trade
}: {
  revenue?: number;
  margin?: number;
  volume?: number;
  trade?: number;
}) {
  const values = [
    Number.isFinite(revenue) ? `Revenue ${euros(revenue ?? 0)}` : null,
    Number.isFinite(margin) ? `Margin ${euros(margin ?? 0)}` : null,
    Number.isFinite(volume) ? `Volume ${euros(volume ?? 0)}` : null,
    Number.isFinite(trade) ? `Trade ${euros(trade ?? 0)}` : null
  ].filter(Boolean);

  return <p className="atlas-compact-impact">{values.length ? values.join(' / ') : 'Financial impact not modeled'}</p>;
}

function SourceTrustMini({ linked = true, source }: { linked?: boolean; source: SourceMeta }) {
  return (
    <p className="atlas-source-mini" title={sourceHealthSummary(source)}>
      <ShieldCheck size={12} />
      <span className={`atlas-source-type-pill ${sourceTypeClass(source)}`}>{sourceTypeLabel(source)}</span>
      {source.url && linked ? (
        <a href={source.url} rel="noreferrer" target="_blank">{sourceDisplayName(source)}</a>
      ) : (
        <span>{sourceDisplayName(source)}</span>
      )}
      <span>{source.sourceDate}</span>
      <span className={`confidence-${source.confidence}`}>{source.confidence}</span>
      <span className={classNameForStatus(source.status)}>{labelForStatus(source.status)}</span>
    </p>
  );
}

function BuyerPrepCompleteness({
  savedViews,
  workspace
}: {
  savedViews: StoredGeneratedView[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const approvedDocuments = workspace.documents.filter((document) => document.status === 'approved' || document.status === 'ready');
  const sourceGaps = workspace.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const savedScenarios = savedViews.filter((view) => /scenario|model/i.test(`${view.title} ${view.prompt}`));
  const strategyVersions = savedViews.filter((view) => /strategy/i.test(`${view.title} ${view.prompt}`));
  const rows = [
    {
      label: 'Financials',
      state: 'Current',
      source: workspace.buyingGroup.source,
      value: euros(workspace.buyingGroup.financialExposure.marginAtRisk)
    },
    {
      label: 'Buyer memory',
      state: workspace.timelineEvents.length ? `${workspace.timelineEvents.length} events` : 'Add debrief',
      source: workspace.timelineEvents[0]?.source ?? workspace.buyingGroup.source,
      value: workspace.timelineEvents[0]?.title ?? 'No recent event'
    },
    {
      label: 'Key docs',
      state: approvedDocuments.length ? `${approvedDocuments.length} ready` : 'No approved docs',
      source: approvedDocuments[0]?.source ?? workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      value: sourceGaps.length ? `${sourceGaps.length} source gaps` : 'Sources ready'
    },
    {
      label: 'Scenario',
      state: savedScenarios.length ? `${savedScenarios.length} saved` : 'Not saved yet',
      source: savedScenarios[0] ? buildGeneratedViewSource(savedScenarios[0], workspace.buyingGroup.source) : workspace.buyingGroup.source,
      value: savedScenarios[0]?.title ?? 'Model next move'
    },
    {
      label: 'Scenario output',
      state: strategyVersions.length ? 'Saved in memory' : 'Not exported yet',
      source: strategyVersions[0] ? buildGeneratedViewSource(strategyVersions[0], workspace.buyingGroup.source) : workspace.buyingGroup.source,
      value: strategyVersions[0]?.title ?? 'Export selected scenario'
    }
  ];

  return (
    <section className="atlas-buyer-prep-completeness" aria-label={`${workspace.buyingGroup.name} prep completeness`}>
      <header>
        <h3>Prep completeness</h3>
        <a href={`/buying-groups/${workspace.buyingGroup.id}?view=strategy`}>Scenario memory <ArrowRight size={13} /></a>
      </header>
      <div>
        {rows.map((row) => (
          <article key={row.label}>
            <span>{row.label}</span>
            <strong>{row.state}</strong>
            <em>{row.value}</em>
            <SourceTrustMini source={row.source} />
          </article>
        ))}
      </div>
    </section>
  );
}

function LatestMemoryUpdates({
  savedViews,
  workspace
}: {
  savedViews: StoredGeneratedView[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const generated = savedViews.slice(0, 2).map((view) => ({
    action: 'Open saved view',
    href: hrefForStoredGeneratedView(view),
    source: buildGeneratedViewSource(view, workspace.buyingGroup.source),
    title: view.title,
    value: view.summary ?? view.sourceDecision ?? 'Saved to buyer history'
  }));
  const events = workspace.timelineEvents.slice(0, Math.max(0, 3 - generated.length)).map((event) => ({
    action: 'Use in scenario',
    href: `/buying-groups/${workspace.buyingGroup.id}?view=strategy`,
    source: event.source,
    title: event.title,
    value: compactFinancialImpact({
      margin: event.financialImpact?.marginImpact,
      revenue: event.financialImpact?.revenueImpact,
      trade: event.financialImpact?.tradeSpendImpact
    })
  }));
  const rows = [...generated, ...events].slice(0, 3);

  return (
    <section className="atlas-latest-memory-updates" aria-label={`${workspace.buyingGroup.name} latest memory updates`}>
      <header>
        <h3>Latest memory updates</h3>
        <a href={`/buying-groups/${workspace.buyingGroup.id}?view=strategy`}>Scenario memory <ArrowRight size={13} /></a>
      </header>
      <div>
        {rows.length ? rows.map((row) => (
          <a href={row.href} key={`${row.title}-${row.value}`} {...generatedOutputLinkProps(row.href)}>
            <strong>{row.title}</strong>
            <span>{row.value}</span>
            <SourceTrustMini source={row.source} />
          </a>
        )) : <EmptyGeneratedState label="Memory" />}
      </div>
    </section>
  );
}

type ScenarioComparisonChoice = {
  id: 'current' | 'fallback' | 'downside';
  label: string;
  name: string;
  inputs: ScenarioInputs;
  source: SourceMeta;
  summary: string;
};

function scenarioComparisonChoices(workspace: BuyingGroupWorkspacePacket, fallbackSource: SourceMeta): ScenarioComparisonChoice[] {
  const current = scenarioInputsForBuyingGroup(workspace.buyingGroup);
  const exposure = workspace.buyingGroup.financialExposure;
  const approvedSource = workspace.documents.find((document) => document.status === 'approved')?.source ?? fallbackSource;
  const modeledSource = workspace.scenarioModels[0]?.sourceIds
    ? packet.documents.find((document) => workspace.scenarioModels[0].sourceIds.includes(document.id))?.source ?? fallbackSource
    : fallbackSource;
  const targetGap = Math.max(0, exposure.targetPriceRealization - exposure.expectedPriceRealization);

  return [
    {
      id: 'current',
      inputs: current,
      label: 'A',
      name: 'Current position',
      source: approvedSource,
      summary: `${pct(exposure.expectedPriceRealization)} expected realization, held against current buyer ask.`
    },
    {
      id: 'fallback',
      inputs: {
        ...current,
        buyerAcceptanceProbability: Math.min(92, current.buyerAcceptanceProbability + 10),
        concessionAmount: Math.round(exposure.marginAtRisk * 0.1),
        expectedRealizationPercent: Number(Math.min(exposure.targetPriceRealization, exposure.expectedPriceRealization + Math.max(0.2, targetGap * 0.45)).toFixed(1)),
        tradeSpendChange: Math.round(exposure.tradeSpendExposure * 1.12),
        volumeChangePercent: Number(Math.min(2, current.volumeChangePercent + 0.6).toFixed(1))
      },
      label: 'B',
      name: 'Fallback / concession',
      source: modeledSource,
      summary: 'Improves acceptance with measured trade-spend and margin pressure.'
    },
    {
      id: 'downside',
      inputs: {
        ...current,
        buyerAcceptanceProbability: Math.min(95, current.buyerAcceptanceProbability + 16),
        competitorPressureLevel: 'high',
        concessionAmount: Math.round(exposure.marginAtRisk * 0.18),
        expectedRealizationPercent: Number(Math.max(0, exposure.expectedPriceRealization - 0.4).toFixed(1)),
        tradeSpendChange: Math.round(exposure.tradeSpendExposure * 1.24),
        volumeChangePercent: Number(Math.max(-5, current.volumeChangePercent - 0.9).toFixed(1))
      },
      label: 'C',
      name: 'Downside / market pressure',
      source: workspace.signals[0]?.source ?? modeledSource,
      summary: 'Shows what changes if the buyer forces lower realization or extra support.'
    }
  ];
}

function ScenarioComparisonPanel({
  compact = false,
  workspace
}: {
  compact?: boolean;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const baseRevenue = workspace.buyingGroup.financialExposure.revenueUnderNegotiation;
  const choices = scenarioComparisonChoices(workspace, workspace.buyingGroup.source);
  const baselineOutput = calculateScenarioOutputs(choices[0].inputs, baseRevenue);

  return (
    <section className={`atlas-abc-scenario-comparison ${compact ? 'compact' : ''}`} aria-label={`${workspace.buyingGroup.name} A/B/C scenario comparison`}>
      <header>
        <div>
          <h3>A/B/C scenario comparison</h3>
          <span>{workspace.buyingGroup.name} · {workspace.markets.map((market) => market.name).join(' / ')}</span>
        </div>
        <a href={`/scenario-lab?buyingGroup=${workspace.buyingGroup.id}`}>Open scenario workspace <ArrowRight size={13} /></a>
      </header>
      <div>
        {choices.map((choice) => {
          const output = calculateScenarioOutputs(choice.inputs, baseRevenue);
          const revenueDelta = output.revenueImpact - baselineOutput.revenueImpact;
          const marginDelta = output.marginImpact - baselineOutput.marginImpact;
          const useHref = `/buying-groups/${workspace.buyingGroup.id}?view=strategy&scenario=${choice.id}`;
          return (
            <article key={choice.id}>
              <div className="atlas-abc-scenario-topline">
                <span>{choice.label}</span>
                <div>
                  <strong>{choice.name}</strong>
                  <em>{choice.summary}</em>
                </div>
              </div>
              <dl>
                <div><dt>Acceptance</dt><dd>{choice.inputs.buyerAcceptanceProbability.toFixed(0)}%</dd></div>
                <div><dt>Revenue</dt><dd>{euros(output.revenueImpact)}</dd></div>
                <div><dt>GM</dt><dd>{euros(output.marginImpact)}</dd></div>
                <div><dt>Volume</dt><dd>{euros(output.volumeImpact)}</dd></div>
                <div><dt>Trade</dt><dd>{euros(output.tradeSpendImpact)}</dd></div>
                <div><dt>Gap</dt><dd>{euros(output.gapToPlanImpact)}</dd></div>
              </dl>
              <div className="atlas-abc-scenario-why">
                <strong>{choice.label === 'A' ? 'Baseline scenario' : `Changes vs A: ${revenueDelta >= 0 ? '+' : ''}${euros(revenueDelta)} revenue / ${marginDelta >= 0 ? '+' : ''}${euros(marginDelta)} GM`}</strong>
                <span>{output.recommendation}</span>
              </div>
              <SourceTrustMini source={choice.source} />
              <a href={useHref}>Use in buyer workspace <ArrowRight size={13} /></a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OverviewCallout({
  action,
  detail,
  href,
  label,
  tone,
  value
}: {
  action: string;
  detail: string;
  href: string;
  label: string;
  tone: 'risk' | 'watch' | 'source' | 'signal';
  value: string;
}) {
  return (
    <a className={`atlas-overview-callout ${tone}`} href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
      <em>{action}</em>
    </a>
  );
}

function PriorityQueue() {
  return (
    <section className="atlas-priority-queue" aria-label="Highest priority CNO watchouts">
      <header>
        <span>Priority queue</span>
        <strong>Act on these first</strong>
      </header>
      {packet.cnoWatchlist.slice(0, 3).map((item, index) => (
        <a href={item.href} key={item.id} {...generatedOutputLinkProps(item.href)}>
          <b>{index + 1}</b>
          <div>
            <span>{item.itemType.replaceAll('_', ' ')}</span>
            <h3>{item.title}</h3>
            <p>{item.whyItMatters}</p>
            <SourceTrustMini source={item.source} />
          </div>
          <aside>
            <strong>{euros(item.financialImplication.marginAtRisk ?? item.financialImplication.revenueAtRisk ?? 0)}</strong>
            <em>margin risk</em>
            <small>{item.recommendedAction}</small>
          </aside>
        </a>
      ))}
    </section>
  );
}

function MarketExposureVisual() {
  const maxMargin = Math.max(...packet.highPressureMarkets.map((market) => market.marginAtRisk));

  return (
    <section className="atlas-exposure-visual" aria-label="Highest market margin exposure">
      <header>
        <span>Market exposure</span>
        <strong>Margin at risk by pressure market</strong>
      </header>
      {packet.highPressureMarkets.slice(0, 4).map((market) => (
        <a href={`/markets/${market.id}`} key={market.id}>
          <div>
            <span>{market.name}</span>
            <strong>{euros(market.marginAtRisk)}</strong>
          </div>
          <i aria-hidden="true"><b style={{ width: `${Math.max(12, Math.round((market.marginAtRisk / maxMargin) * 100))}%` }} /></i>
          <em>{market.pressureLevel} pressure</em>
        </a>
      ))}
    </section>
  );
}

function IntelligenceSnapshot() {
  const latestSignal = packet.signals[0];
  const competitorMove = packet.competitorMoves[0];
  const scenario = packet.scenarioModels[0];
  const scenarioGroup = getBuyingGroup(scenario.buyingGroupId)?.name ?? scenario.buyingGroupId;
  const scenarioMarket = getMarket(scenario.marketId)?.name ?? scenario.marketId;

  const cards = [
    {
      label: 'What changed',
      title: latestSignal.title,
      body: latestSignal.negotiationImplication,
      value: euros(latestSignal.estimatedMarginImpact ?? 0),
      meta: 'estimated margin implication',
      href: `/signals?signal=${latestSignal.id}`,
      action: latestSignal.recommendedAction,
      source: latestSignal.source
    },
    {
      label: 'Competitor leverage',
      title: `${competitorMove.competitor}: ${competitorMove.title}`,
      body: competitorMove.possibleBuyerLeverage,
      value: euros(competitorMove.estimatedMarginImpact ?? 0),
      meta: 'estimated margin pressure',
      href: `/signals?move=${competitorMove.id}`,
      action: competitorMove.recommendedAction,
      source: competitorMove.source
    },
    {
      label: 'Scenario prompt',
      title: `${scenarioGroup} / ${scenarioMarket}`,
      body: scenario.outputs.recommendation,
      value: euros(scenario.outputs.riskAdjustedValue),
      meta: `${pct(scenario.inputs.expectedRealizationPercent)} expected realization`,
      href: `/scenario-lab?scenario=${scenario.id}`,
      action: 'Open scenario model',
      source: atlasIntelligenceSeed.documents.find((document) => scenario.sourceIds.includes(document.id))?.source ?? packet.topExposureBuyingGroups[0].source
    }
  ];

  return (
    <section className="atlas-intelligence-snapshot" aria-label="What changed and recommended actions">
      {cards.map((card) => (
        <a href={card.href} key={card.label} {...generatedOutputLinkProps(card.href)}>
          <span>{card.label}</span>
          <h3>{card.title}</h3>
          <strong>{card.value}</strong>
          <em>{card.meta}</em>
          <p>{card.body}</p>
          <SourceTrustMini source={card.source} />
          <small>{card.action}</small>
        </a>
      ))}
    </section>
  );
}

function NewsStoryRow({
  eyebrow,
  title,
  body,
  impact,
  source,
  href,
  action,
  status
}: {
  eyebrow: string;
  title: string;
  body: string;
  impact: React.ReactNode;
  source: SourceMeta;
  href: string;
  action: string;
  status?: AtlasStatus;
}) {
  return (
    <a className="atlas-news-row" href={href}>
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <strong className="atlas-news-action">Recommended: {action}</strong>
        <p>{body}</p>
        <CompactSourceLine source={source} />
      </div>
      <aside>
        {status ? <StatusChip status={status} /> : null}
        {impact}
      </aside>
    </a>
  );
}

function MonitorTabs({ initialTab = 'watchlist' }: { initialTab?: string }) {
  const staleDocuments = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const tabs = [
    {
      id: 'watchlist',
      label: 'CNO watchlist',
      count: packet.cnoWatchlist.length
    },
    {
      id: 'markets',
      label: 'Markets',
      count: packet.highPressureMarkets.length
    },
    {
      id: 'signals',
      label: 'Signals',
      count: packet.signals.length
    },
    {
      id: 'competitors',
      label: 'Competitors',
      count: packet.competitorMoves.length
    },
    {
      id: 'sources',
      label: 'Sources',
      count: staleDocuments.length
    }
  ];
  const activeTab = tabs.some((tab) => tab.id === initialTab) ? initialTab : 'watchlist';

  return (
    <section className="atlas-monitor-desk">
      <header>
        <div>
          <span>Monitor</span>
          <h2>What needs attention now</h2>
        </div>
        <a href="/intelligence">Open full intelligence memory <ArrowRight size={14} /></a>
      </header>
      <nav aria-label="Monitor feed filters">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.id === 'watchlist' ? '/' : `/?monitor=${tab.id}`}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
            <span>{tab.count}</span>
          </a>
        ))}
      </nav>
      <div className="atlas-monitor-feed">
        {activeTab === 'watchlist' ? packet.cnoWatchlist.slice(0, 6).map((item) => (
          <NewsStoryRow
            key={item.id}
            eyebrow={item.itemType.replaceAll('_', ' ')}
            title={item.title}
            body={item.whyItMatters}
            impact={(
              <CompactImpactLine
                revenue={item.financialImplication.revenueAtRisk}
                margin={item.financialImplication.marginAtRisk}
                volume={item.financialImplication.volumeExposure}
                trade={item.financialImplication.tradeSpendExposure}
              />
            )}
            source={item.source}
            href={item.href}
            action={item.recommendedAction}
            status={item.status}
          />
        )) : null}
        {activeTab === 'markets' ? packet.highPressureMarkets.map((market) => (
          <NewsStoryRow
            key={market.id}
            eyebrow={`${market.pressureLevel} pressure market`}
            title={`${market.name}: ${market.topDrivers[0]}`}
            body={`${market.activeBuyingGroups.length} buying groups in scope. ${market.topDrivers.slice(1).join(' ')}`}
            impact={<CompactImpactLine revenue={market.revenueUnderNegotiation} margin={market.marginAtRisk} volume={market.volumeExposure} trade={market.tradeSpendExposure} />}
            source={market.source}
            href={`/markets/${market.id}`}
            action="Open market read"
            status={market.pressureLevel === 'critical' || market.pressureLevel === 'high' ? 'needs_validation' : 'modeled'}
          />
        )) : null}
        {activeTab === 'signals' ? packet.signals.slice(0, 6).map((signal) => (
          <NewsStoryRow
            key={signal.id}
            eyebrow={signal.signalType.replaceAll('_', ' ')}
            title={signal.title}
            body={`${signal.summary} ${signal.negotiationImplication}`}
            impact={<CompactImpactLine revenue={signal.estimatedRevenueImpact} margin={signal.estimatedMarginImpact} />}
            source={signal.source}
            href={`/signals?signal=${signal.id}`}
            action={signal.recommendedAction}
            status={signal.source.status}
          />
        )) : null}
        {activeTab === 'competitors' ? packet.competitorMoves.slice(0, 6).map((move) => (
          <NewsStoryRow
            key={move.id}
            eyebrow={`${move.competitor} / ${move.moveType.replaceAll('_', ' ')}`}
            title={move.title}
            body={`${move.summary} ${move.possibleBuyerLeverage}`}
            impact={<CompactImpactLine revenue={move.estimatedRevenueImpact} margin={move.estimatedMarginImpact} />}
            source={move.source}
            href={`/signals?move=${move.id}`}
            action={move.recommendedAction}
            status={move.source.status}
          />
        )) : null}
        {activeTab === 'sources' ? staleDocuments.slice(0, 6).map((document) => (
          <NewsStoryRow
            key={document.id}
            eyebrow={document.documentType.replaceAll('_', ' ')}
            title={document.title}
            body={document.summary}
            impact={<p className="atlas-compact-impact">{document.reusable ? 'Reusable after validation' : 'Draft-only source'}</p>}
            source={document.source}
            href="/intelligence"
            action={document.status === 'missing' ? 'Upload or generate draft' : 'Validate before use'}
            status={document.status}
          />
        )) : null}
      </div>
    </section>
  );
}

function TodaysBriefingPanel() {
  const topGroups = packet.topExposureBuyingGroups.slice(0, 3).map((group) => group.name).join(', ');
  const topMarkets = packet.highPressureMarkets.slice(0, 3).map((market) => market.name).join(', ');

  return (
    <section className="atlas-briefing-panel">
      <div className="atlas-briefing-copy">
        <span>Today’s Intelligence Brief</span>
        <h2>Europe risk is concentrated in three markets.</h2>
        <p>{topMarkets} carry the near-term negotiation risk. Watch {topGroups} first, then validate source readiness before using scenario outputs.</p>
        <MarketExposureVisual />
      </div>
      <PriorityQueue />
    </section>
  );
}

function OverviewAttentionBrief() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const latestSignal = packet.signals[0];
  const staleSourceCount = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing').length;

  const attentionItems = [
    {
      action: 'Open buyer',
      href: `/buying-groups/${topGroup.id}`,
      label: 'Buyer risk',
      meta: `${pct(topGroup.financialExposure.expectedPriceRealization)} realized / ${pct(topGroup.financialExposure.targetPriceRealization)} target`,
      movement: '+EUR 1.1M vs prior read',
      title: topGroup.name,
      tone: 'risk',
      value: euros(topGroup.financialExposure.marginAtRisk)
    },
    {
      action: 'Compare markets',
      href: `/markets/${topMarket.id}`,
      label: 'Market pressure',
      meta: topMarket.topDrivers.slice(0, 2).join(' / '),
      movement: '+9% pressure index',
      title: topMarket.name,
      tone: 'watch',
      value: euros(topMarket.marginAtRisk)
    },
    {
      action: 'Read signal',
      href: '/?ask=What changed across Europe this week?&view=signal-impact',
      label: 'World signal',
      meta: latestSignal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).slice(0, 2).join(' / '),
      movement: latestSignal.source.sourceDate,
      title: latestSignal.title,
      tone: 'signal',
      value: euros(latestSignal.estimatedMarginImpact ?? latestSignal.estimatedRevenueImpact ?? 0)
    },
    {
      action: 'Review sources',
      href: '/intelligence?view=source-readiness',
      label: 'Source watchout',
      meta: 'Stale / needs validation / missing',
      movement: 'Blocks official output',
      title: 'Source readiness',
      tone: 'source',
      value: `${staleSourceCount}`
    }
  ];

  return (
    <section className="atlas-overview-attention" aria-label="What needs attention first">
      <header>
        <h1>{topGroup.name} has {euros(topGroup.financialExposure.marginAtRisk)} margin at risk; {topMarket.name} is the pressure market.</h1>
        <a href={`/buying-groups/${topGroup.id}`}>Open {topGroup.name} <ArrowRight size={14} /></a>
      </header>
      <div>
        {attentionItems.map((item) => (
          <a className={item.tone} href={item.href} key={item.label}>
            <strong>{item.value}</strong>
            <h2>{item.title}</h2>
            <p>{item.meta}</p>
            <em>{item.movement}</em>
            <b>{item.action}</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function PepsiCoImpactAttention() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const realizationGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;
  const marketShare = topMarket.marginAtRisk / packet.summary.marginAtRisk;
  const buyerShare = topGroup.financialExposure.marginAtRisk / packet.summary.marginAtRisk;

  const items = [
    {
      action: 'Open exposure',
      href: '#exposure',
      label: 'Margin at risk',
      meta: '+9% vs last refresh',
      tone: 'risk',
      title: 'Europe active cycle',
      value: euros(packet.summary.marginAtRisk)
    },
    {
      action: 'Open buyer',
      href: `/buying-groups/${topGroup.id}?view=strategy`,
      label: 'Top buyer',
      meta: `${pct(realizationGap)} realization gap`,
      tone: 'risk',
      title: topGroup.name,
      value: euros(topGroup.financialExposure.marginAtRisk)
    },
    {
      action: 'Open market',
      href: `/markets/${topMarket.id}`,
      label: 'Top market',
      meta: `${pct(marketShare * 100)} of margin risk`,
      tone: 'watch',
      title: topMarket.name,
      value: euros(topMarket.marginAtRisk)
    },
    {
      action: 'Model move',
      href: `/scenario-lab?buyingGroup=${topGroup.id}`,
      label: 'Gap to plan',
      meta: `${pct(buyerShare * 100)} from ${topGroup.name}`,
      tone: 'signal',
      title: 'Scenario needed',
      value: euros(packet.summary.gapToPlan)
    }
  ];

  return (
    <section className="atlas-overview-attention atlas-impact-attention" aria-label="PepsiCo financial impact">
      <header>
        <h1>{euros(packet.summary.marginAtRisk)} margin at risk; {topGroup.name} and {topMarket.name} drive the read.</h1>
        <a href={`/scenario-lab?buyingGroup=${topGroup.id}`}>Model {topGroup.name} <ArrowRight size={14} /></a>
      </header>
      <div>
        {items.map((item) => (
          <a className={item.tone} href={item.href} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <h2>{item.title}</h2>
            <p>{item.meta}</p>
            <b>{item.action}</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function FinancialExposureVisual() {
  const maxMargin = Math.max(...packet.topExposureBuyingGroups.map((group) => group.financialExposure.marginAtRisk));
  const maxMarket = Math.max(...packet.highPressureMarkets.map((market) => market.marginAtRisk));

  return (
    <section className="atlas-impact-visual-grid" id="exposure">
      <article className="atlas-chart-card atlas-impact-chart">
        <SectionTitle title="Buyer margin exposure" />
        {packet.topExposureBuyingGroups.slice(0, 7).map((group) => (
          <a className="atlas-impact-bar-row" href={`/buying-groups/${group.id}?view=strategy`} key={group.id}>
            <span>{group.name}</span>
            <i><b style={{ width: `${Math.max(10, Math.round((group.financialExposure.marginAtRisk / maxMargin) * 100))}%` }} /></i>
            <strong>{euros(group.financialExposure.marginAtRisk)}</strong>
            <em>{pct(group.financialExposure.expectedPriceRealization)} / {pct(group.financialExposure.targetPriceRealization)}</em>
          </a>
        ))}
      </article>
      <article className="atlas-chart-card atlas-impact-chart">
        <SectionTitle title="Market margin pressure" />
        {packet.highPressureMarkets.slice(0, 6).map((market) => (
          <a className="atlas-impact-bar-row" href={`/markets/${market.id}`} key={market.id}>
            <span>{market.name}</span>
            <i><b style={{ width: `${Math.max(10, Math.round((market.marginAtRisk / maxMarket) * 100))}%` }} /></i>
            <strong>{euros(market.marginAtRisk)}</strong>
            <em>{market.pressureLevel}</em>
          </a>
        ))}
      </article>
    </section>
  );
}

function RealizationGapVisual() {
  return (
    <section className="atlas-chart-card atlas-realization-visual">
      <SectionTitle title="Price realization gap" />
      {packet.topExposureBuyingGroups.slice(0, 7).map((group) => {
        const expected = group.financialExposure.expectedPriceRealization;
        const target = group.financialExposure.targetPriceRealization;
        const gap = Math.max(0, target - expected);
        return (
          <a href={`/buying-groups/${group.id}?view=strategy`} key={group.id}>
            <span>{group.name}</span>
            <div>
              <i style={{ width: `${Math.min(100, expected * 16)}%` }} />
              <b style={{ left: `${Math.min(96, target * 16)}%` }} />
            </div>
            <strong>{pct(expected)}</strong>
            <em>{pct(gap)} gap</em>
          </a>
        );
      })}
    </section>
  );
}

function buildFinancialDecisionRead() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const topMarket = packet.highPressureMarkets[0];
  const offsetMarket = [...packet.markets]
    .filter((market) => market.id !== topMarket.id)
    .sort((a, b) => a.marginAtRisk - b.marginAtRisk || a.gapToPlan - b.gapToPlan)[0];
  const sourceDocument = packet.documents.find((document) => document.buyingGroupId === topGroup.id && (document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing'))
    ?? packet.documents.find((document) => document.buyingGroupId === topGroup.id)
    ?? packet.documents[0];
  const realizationGap = topGroup.financialExposure.targetPriceRealization - topGroup.financialExposure.expectedPriceRealization;
  const highRiskGroups = packet.buyingGroups.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high');
  const belowTargetGroups = packet.buyingGroups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);

  return {
    belowTargetGroups,
    highRiskGroups,
    offsetMarket,
    sourceDocument,
    topGroup,
    topMarket,
    headline: `${euros(packet.summary.marginAtRisk)} margin at risk; ${topGroup.name} drives the buyer exposure and ${topMarket.name} drives the market exposure.`,
    nextAction: `Open ${topGroup.name}, then model downside realization before using an updated counter.`,
    realizationGap
  };
}

function FinancialDecisionLens() {
  const read = buildFinancialDecisionRead();
  const decisions = [
    {
      action: 'Open buyer',
      href: `/buying-groups/${read.topGroup.id}?view=strategy`,
      label: 'Buyer exposure',
      source: read.topGroup.source,
      title: read.topGroup.name,
      value: euros(read.topGroup.financialExposure.marginAtRisk),
      meta: `${pct(read.realizationGap)} gap to target`
    },
    {
      action: 'Run scenario',
      href: `/scenario-lab?buyingGroup=${read.topGroup.id}`,
      label: 'Scenario needed',
      source: read.topGroup.source,
      title: 'Downside realization',
      value: pct(read.topGroup.financialExposure.expectedPriceRealization),
      meta: `${euros(read.topGroup.financialExposure.revenueUnderNegotiation)} revenue in play`
    },
    {
      action: 'Open market',
      href: `/markets/${read.topMarket.id}`,
      label: 'Market pressure',
      source: read.topMarket.source,
      title: read.topMarket.name,
      value: euros(read.topMarket.marginAtRisk),
      meta: `${read.topMarket.activeBuyingGroups.length} active buyers`
    },
    {
      action: 'Check offset',
      href: read.offsetMarket ? `/markets/${read.offsetMarket.id}` : '/markets',
      label: 'Offset candidate',
      source: read.offsetMarket?.source ?? read.topMarket.source,
      title: read.offsetMarket?.name ?? 'No offset market',
      value: read.offsetMarket ? euros(read.offsetMarket.marginAtRisk) : 'None',
      meta: read.offsetMarket ? `${read.offsetMarket.pressureLevel} pressure` : 'Review market list'
    },
    {
      action: 'Open source',
      href: `/generated-views?prompt=${encodeURIComponent(`Retrieve ${read.sourceDocument.title}`)}&mode=retrieved&documentId=${read.sourceDocument.id}${read.sourceDocument.buyingGroupId ? `&buyingGroupId=${read.sourceDocument.buyingGroupId}` : ''}`,
      label: 'Source check',
      source: read.sourceDocument.source,
      title: read.sourceDocument.title,
      value: labelForStatus(read.sourceDocument.status),
      meta: read.sourceDocument.source.sourceDate
    }
  ];

  return (
    <section className="atlas-financial-decision-lens" aria-label="Financial decisions">
      <header>
        <div>
          <h2>{read.headline}</h2>
          <p>{read.nextAction}</p>
        </div>
        <dl>
          <div><dt>High-risk buyers</dt><dd>{read.highRiskGroups.length}</dd></div>
          <div><dt>Below target</dt><dd>{read.belowTargetGroups.length}</dd></div>
          <div><dt>Gap to plan</dt><dd>{euros(packet.summary.gapToPlan)}</dd></div>
        </dl>
      </header>
      <div>
        {decisions.map((decision) => (
          <a href={decision.href} key={decision.label} {...generatedOutputLinkProps(decision.href)}>
            <span>{decision.label}</span>
            <strong>{decision.value}</strong>
            <h3>{decision.title}</h3>
            <p>{decision.meta}</p>
            <SourceTrustMini source={decision.source} />
            <em>{decision.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

function PepsiCoImpactWorkspace() {
  const topGroup = packet.topExposureBuyingGroups[0];
  const secondGroup = packet.topExposureBuyingGroups[1] ?? topGroup;
  const topMarket = packet.highPressureMarkets[0];
  const latestSignal = packet.signals[0];
  const marketRows = packet.highPressureMarkets.slice(0, 4);
  const buyerRows = packet.topExposureBuyingGroups.slice(0, 4);
  const maxMarketRisk = Math.max(...marketRows.map((market) => market.marginAtRisk), 1);
  const maxBuyerRisk = Math.max(...buyerRows.map((group) => group.financialExposure.marginAtRisk), 1);
  const tradeSpendExposure = packet.buyingGroups.reduce((total, group) => total + group.financialExposure.tradeSpendExposure, 0);
  const belowTargetGroups = packet.buyingGroups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);
  const revenueWeights = packet.buyingGroups.reduce((total, group) => total + group.financialExposure.revenueUnderNegotiation, 0);
  const weightedExpectedRealization = packet.buyingGroups.reduce((total, group) => (
    total + group.financialExposure.expectedPriceRealization * group.financialExposure.revenueUnderNegotiation
  ), 0) / Math.max(1, revenueWeights);
  const weightedTargetRealization = packet.buyingGroups.reduce((total, group) => (
    total + group.financialExposure.targetPriceRealization * group.financialExposure.revenueUnderNegotiation
  ), 0) / Math.max(1, revenueWeights);
  const netRevenueOutlook = packet.summary.revenueUnderNegotiation - packet.summary.gapToPlan;
  const marginRiskCeiling = 24000000;
  const tradeSpendCap = 18000000;
  const marginOverGoal = Math.max(0, packet.summary.marginAtRisk - marginRiskCeiling);
  const tradeOverGoal = Math.max(0, tradeSpendExposure - tradeSpendCap);
  const priceGap = Math.max(0, weightedTargetRealization - weightedExpectedRealization);

  const goalCards = [
    {
      action: `Close ${euros(packet.summary.gapToPlan)} plan gap`,
      current: euros(netRevenueOutlook),
      gap: `${euros(packet.summary.gapToPlan)} short`,
      goal: euros(packet.summary.revenueUnderNegotiation),
      label: 'Net revenue goal',
      status: 'Off track',
      tone: 'risk'
    },
    {
      action: `Reduce exposure by ${euros(marginOverGoal)}`,
      current: euros(packet.summary.marginAtRisk),
      gap: `${euros(marginOverGoal)} over ceiling`,
      goal: `Under ${euros(marginRiskCeiling)}`,
      label: 'Margin risk ceiling',
      status: 'Off track',
      tone: 'risk'
    },
    {
      action: `Recover ${pct(priceGap)} realization`,
      current: pct(weightedExpectedRealization),
      gap: `${pct(priceGap)} gap`,
      goal: pct(weightedTargetRealization),
      label: 'Price realization goal',
      status: 'Watch',
      tone: 'warning'
    },
    {
      action: `Rebalance ${euros(tradeOverGoal)}`,
      current: euros(tradeSpendExposure),
      gap: `${euros(tradeOverGoal)} over cap`,
      goal: `Under ${euros(tradeSpendCap)}`,
      label: 'Trade spend cap',
      status: tradeOverGoal > 0 ? 'Watch' : 'On track',
      tone: tradeOverGoal > 0 ? 'warning' : 'good'
    }
  ];

  const impactAlerts = [
    buyingGroupToAlert(topGroup),
    buyingGroupToAlert(secondGroup),
    marketToAlert(topMarket),
    signalToAlert(latestSignal)
  ];
  const impactScenarioEntries: ScenarioEntryQueueItem[] = [
    ...impactAlerts.slice(0, 4).map((alert) => ({
      action: alert.action,
      href: alert.modelHref ?? alert.href,
      impact: alert.value,
      source: alert.source,
      title: alert.title,
      trigger: alert.trigger,
      why: alert.possibleEffect
    })),
    ...buyerRows.slice(0, 2).map((group) => {
      const gap = group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization;
      return {
        action: 'Open buyer scenario workspace',
        href: `/buying-groups/${group.id}?view=strategy`,
        impact: euros(group.financialExposure.marginAtRisk),
        source: group.source,
        title: `${group.name}: ${buyerScenarioToTest(group)}`,
        trigger: `${pct(gap)} target gap`,
        why: `${buyerRiskReason(group)} Model this before changing price, trade, fallback, or red line.`
      };
    })
  ];

  return (
    <section className="atlas-impact-workspace" aria-label="PepsiCo financial impact workspace">
      <section className="atlas-impact-hero-v2">
        <div>
          <span className="atlas-market-readiness-pill readiness-escalation_needed">Scenario focus</span>
          <h1>{euros(packet.summary.gapToPlan)} plan gap needs scenario testing.</h1>
          <p>{topMarket.name} and {topGroup.name} are the first places to model buyer response, guardrails, and margin recovery.</p>
          <WhyShownLine
            detail="this page identifies which financial gaps should become buyer, market, or portfolio scenarios"
            reasons={pageIntentConfig.pepsicoImpact.surfacingLogic}
          />
        </div>
        <a href={`/scenario-lab?market=${topMarket.id}&buyingGroup=${topGroup.id}`}>
          Test top scenario <ArrowRight size={14} />
        </a>
      </section>

      <ActiveAlertsPanel
        alerts={impactAlerts}
        eyebrow="Financial alerts"
        title="What should feed scenario testing."
      />

      <ScenarioEntryQueue
        eyebrow="Financial scenario entry"
        items={impactScenarioEntries}
        title="Turn the P&L gap into the next buyer, market, or downside scenario to test."
      />

      <section className="atlas-impact-goal-board" aria-label="PepsiCo financial goals">
        <header>
          <h2>Financial gaps to test</h2>
        </header>
        <div>
          {goalCards.map((goal) => (
            <article className={goal.tone} key={goal.label}>
              <div>
                <span>{goal.label}</span>
                <b>{goal.status}</b>
              </div>
              <strong>{goal.current}</strong>
              <dl>
                <div><dt>Goal</dt><dd>{goal.goal}</dd></div>
                <div><dt>Gap</dt><dd>{goal.gap}</dd></div>
              </dl>
              <em>{goal.action}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-impact-main-grid">
        <article className="atlas-impact-rank-panel">
          <header>
            <h2>Market gaps to model</h2>
            <a href="/markets">Compare markets</a>
          </header>
          <div className="atlas-impact-rank-list">
            {marketRows.map((market) => (
              <a href={`/scenario-lab?market=${market.id}`} key={market.id}>
                <div>
                  <strong>{market.name}</strong>
                  <span>{market.pressureLevel} pressure · {market.activeBuyingGroups.length} active buyers</span>
                </div>
                <i><b style={{ width: `${Math.max(12, Math.round((market.marginAtRisk / maxMarketRisk) * 100))}%` }} /></i>
                <dl>
                  <div><dt>Margin risk</dt><dd>{euros(market.marginAtRisk)}</dd></div>
                  <div><dt>Gap</dt><dd>{euros(market.gapToPlan)}</dd></div>
                </dl>
                <SourceTrustMini source={market.source} />
              </a>
            ))}
          </div>
        </article>

        <article className="atlas-impact-rank-panel">
          <header>
            <div>
              <h2>Buying groups to scenario plan</h2>
              <span className="atlas-impact-header-stat">{belowTargetGroups.length} below target · {packet.summary.highRiskBuyingGroups} high risk</span>
            </div>
            <a href="/buying-groups">All groups</a>
          </header>
          <div className="atlas-impact-rank-list">
            {buyerRows.map((group) => {
              const gap = group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization;
              return (
                <a href={`/buying-groups/${group.id}?view=strategy`} key={group.id}>
                  <div>
                    <strong>{group.name}</strong>
                    <span>{buyerRoundLabel(group)} · {group.riskLevel} risk</span>
                  </div>
                  <i><b style={{ width: `${Math.max(12, Math.round((group.financialExposure.marginAtRisk / maxBuyerRisk) * 100))}%` }} /></i>
                  <dl>
                    <div><dt>Margin risk</dt><dd>{euros(group.financialExposure.marginAtRisk)}</dd></div>
                    <div><dt>Target gap</dt><dd>{pct(gap)}</dd></div>
                  </dl>
                  <SourceTrustMini source={group.source} />
                </a>
              );
            })}
          </div>
        </article>
      </section>

    </section>
  );
}

function AnimatedStatCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    const duration = 1000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    requestAnimationFrame(step);
  }, [isVisible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function OverviewBriefingCanvas({ generatedView, initialPrompt }: { generatedView: string; initialPrompt?: string }) {
  const generatedReadIsRequested = Boolean(initialPrompt && generatedView !== 'focus');
  const externalAlertSignals = packet.signals
    .filter((signal) => ['world_news', 'economic', 'regulatory', 'commodity', 'supply_chain', 'inflation', 'retailer_pressure'].includes(signal.signalType))
    .slice(0, 1)
    .map(signalToAlert);
  const scenarioResultAlerts = packet.scenarioModels
    .slice(0, 1)
    .map(scenarioToAlert);
  const patternAlerts = packet.crossMarketPatterns
    .slice(0, 1)
    .map(patternToAlert);
  const overviewAlerts = [
    ...externalAlertSignals,
    ...scenarioResultAlerts,
    ...patternAlerts
  ];
  const overviewScenarioEntries: ScenarioEntryQueueItem[] = overviewAlerts.slice(0, 4).map((alert) => ({
      action: alert.action,
      href: alert.modelHref ?? alert.href,
      impact: alert.value,
      source: alert.source,
      title: alert.title,
      trigger: alert.trigger,
      why: alert.possibleEffect
  }));
  return (
    <>
      <section className="atlas-overview-v3" aria-label="Europe overview briefing">
        <TriageCommandCenter alerts={overviewAlerts} items={overviewScenarioEntries} />

        {generatedReadIsRequested ? <OverviewGeneratedRead ask={initialPrompt} view={generatedView} /> : null}
      </section>

      <footer className="atlas-triage-intelligence-library-footer" aria-label="Intelligence library summary">
        <div className="atlas-triage-library-inner">
          <div className="atlas-triage-library-left">
            <span className="atlas-triage-library-eyebrow">Intelligence Library</span>
            <h2><AnimatedStatCounter target={64} suffix="+" /> records to validate sources, approve memory, and audit prediction confidence.</h2>
            <a href="/intelligence" className="atlas-triage-view-buyers-btn">
              <span>Go to Intelligence Library</span>
              <ArrowRight size={14} />
            </a>
          </div>
          <div className="atlas-triage-library-right">
            <div className="atlas-triage-stat-card">
              <h2><AnimatedStatCounter target={64} /></h2>
              <span>Records</span>
            </div>
            <div className="atlas-triage-stat-card">
              <h2><AnimatedStatCounter target={11} /></h2>
              <span>high confidence records.</span>
            </div>
            <div className="atlas-triage-stat-card">
              <h2><AnimatedStatCounter target={27} /></h2>
              <span>Source Watchouts</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function SignalActionBoard({ signals }: { signals: ExternalSignal[] }) {
  return (
    <section className="atlas-data-action-board" aria-label="Signal actions">
      {signals.map((signal) => {
        const href = `/generated-views?prompt=${encodeURIComponent(`Create signal impact readout for ${signal.title}`)}&mode=draft&editable=1`;

        return (
          <article className="atlas-data-action-card" key={signal.id}>
            <strong>{euros(signal.estimatedMarginImpact ?? signal.estimatedRevenueImpact ?? 0)}</strong>
            <div>
              <h3>{signal.title}</h3>
              <p>{signal.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {signal.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
              <SourceTrustMini source={signal.source} />
            </div>
            <div className="atlas-data-action-meta">
              <em>{signal.recommendedAction}</em>
              <a className="atlas-data-action-link" href={href} {...generatedOutputLinkProps(href)}>Open readout <ArrowRight size={13} /></a>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CompetitorActionBoard({ moves }: { moves: CompetitorMove[] }) {
  return (
    <section className="atlas-data-action-board" aria-label="Competitor actions">
      {moves.map((move) => {
        const href = `/generated-views?prompt=${encodeURIComponent(`Create competitor leverage readout for ${move.competitor}: ${move.title}`)}&mode=draft&editable=1`;

        return (
          <article className="atlas-data-action-card" key={move.id}>
            <strong>{euros(move.estimatedMarginImpact ?? move.estimatedRevenueImpact ?? 0)}</strong>
            <div>
              <h3>{move.competitor}: {move.title}</h3>
              <p>{move.affectedMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ')} · {move.affectedBuyingGroups.map((id) => getBuyingGroup(id)?.name ?? id).join(' / ')}</p>
              <SourceTrustMini source={move.source} />
            </div>
            <div className="atlas-data-action-meta">
              <em>{move.recommendedAction}</em>
              <a className="atlas-data-action-link" href={href} {...generatedOutputLinkProps(href)}>Open readout <ArrowRight size={13} /></a>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ImpactSnapshotBoard() {
  const topGroups = packet.topExposureBuyingGroups.slice(0, 4);
  const rows = [
    {
      href: `/buying-groups/${topGroups[0].id}?view=strategy`,
      label: topGroups[0].name,
      metric: euros(topGroups[0].financialExposure.marginAtRisk),
      sub: `${pct(topGroups[0].financialExposure.expectedPriceRealization)} realized / ${pct(topGroups[0].financialExposure.targetPriceRealization)} target`,
      action: 'Open buyer'
    },
    {
      href: `/buying-groups/${topGroups[1].id}?view=strategy`,
      label: topGroups[1].name,
      metric: euros(topGroups[1].financialExposure.marginAtRisk),
      sub: `${pct(topGroups[1].financialExposure.targetPriceRealization - topGroups[1].financialExposure.expectedPriceRealization)} gap`,
      action: 'Model downside'
    },
    {
      href: `/markets/${packet.highPressureMarkets[0].id}`,
      label: packet.highPressureMarkets[0].name,
      metric: euros(packet.highPressureMarkets[0].marginAtRisk),
      sub: `${packet.highPressureMarkets[0].activeBuyingGroups.length} active buyers`,
      action: 'Open market'
    },
    {
      href: '/scenario-lab',
      label: 'Gap to plan',
      metric: euros(packet.summary.gapToPlan),
      sub: `${packet.summary.highRiskBuyingGroups} high-risk groups`,
      action: 'Run scenario'
    }
  ];

  return (
    <section className="atlas-impact-snapshot-board" aria-label="Financial impact snapshots">
      {rows.map((row) => (
        <a href={row.href} key={row.label}>
          <span>{row.label}</span>
          <strong>{row.metric}</strong>
          <p>{row.sub}</p>
          <em>{row.action} <ArrowRight size={13} /></em>
        </a>
      ))}
    </section>
  );
}

function BriefingActionPanel() {
  return (
    <section className="atlas-briefing-action-panel">
      <div>
        <span>Next action</span>
        <h3>Model downside realization for EDEKA, Tesco and Carrefour.</h3>
        <p>Validate stale or missing source documents before creating any new output or using generated assumptions.</p>
      </div>
      <div className="atlas-briefing-actions">
        <a href="/scenario-lab">Open scenario workspace <ArrowRight size={14} /></a>
        <a href="/intelligence">Review source readiness</a>
      </div>
    </section>
  );
}

function CommandPanel({ initialPrompt = '' }: { initialPrompt?: string }) {
  return (
    <section className="atlas-command-panel">
      <span>Command desk</span>
      <h2>Ask ATLAS for a specific read.</h2>
      <p>Use this when the brief raises a question and you want ATLAS to route you to the right intelligence view.</p>
      <CommandBar initialPrompt={initialPrompt} />
    </section>
  );
}

function CnoWatchlistBrief() {
  return (
    <section className="atlas-brief-list">
      {packet.cnoWatchlist.slice(0, 5).map((item) => (
        <a href={item.href} key={item.id} {...generatedOutputLinkProps(item.href)}>
          <div>
            <h3>{item.title}</h3>
            <CompactImpactLine
              revenue={item.financialImplication.revenueAtRisk}
              margin={item.financialImplication.marginAtRisk}
              volume={item.financialImplication.volumeExposure}
              trade={item.financialImplication.tradeSpendExposure}
            />
            <CompactSourceLine source={item.source} />
          </div>
          <aside>
            <strong>{item.recommendedAction}</strong>
          </aside>
        </a>
      ))}
    </section>
  );
}

function CrossMarketPatternBrief() {
  return (
    <section className="atlas-pattern-brief">
      {packet.crossMarketPatterns.map((pattern) => (
        <article key={pattern.id}>
          <h3>{pattern.title}</h3>
          <CompactImpactLine
            revenue={pattern.financialImplication.revenueAtRisk}
            margin={pattern.financialImplication.marginAtRisk}
            volume={pattern.financialImplication.volumeExposure}
            trade={pattern.financialImplication.tradeSpendExposure}
          />
          <CompactSourceLine source={pattern.source} />
          <a href="/scenario-lab">{pattern.recommendedAction}</a>
        </article>
      ))}
    </section>
  );
}

function InvestigationLinks() {
  const links = [
    {
      title: 'Markets',
      body: 'Compare pressure and exposure by market.',
      href: '/markets',
      icon: <Globe2 size={17} />
    },
    {
      title: 'Buying Groups',
      body: 'Open Carrefour, EDEKA, Tesco or other buyer intelligence centers.',
      href: '/buying-groups',
      icon: <Layers3 size={17} />
    },
    {
      title: 'Signals',
      body: 'Review public-world changes with source and financial implication.',
      href: '/signals',
      icon: <Newspaper size={17} />
    },
    {
      title: 'Financial Impact',
      body: 'Trace margin-at-risk, realization gaps and exposure ranking.',
      href: '/scenario-lab',
      icon: <CircleDollarSign size={17} />
    }
  ];

  return (
    <section className="atlas-investigation-links">
      {links.map((link) => (
        <a href={link.href} key={link.href} {...generatedOutputLinkProps(link.href)}>
          {link.icon}
          <strong>{link.title}</strong>
          <span>{link.body}</span>
        </a>
      ))}
    </section>
  );
}

function OverviewGeneratedRead({ ask, view }: { ask?: string; view: string }) {
  if (view === 'money-at-risk') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Where money is most at risk"
        description="Margin risk, gap to plan and expected realization are the first financial lens before drilling into buyers."
      >
        <NewsFinancialTape />
        <BuyingGroupTable groups={packet.topExposureBuyingGroups.slice(0, 5)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'market-comparison') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Markets compared by pressure and offset potential"
        description="Use this to see where exposure is concentrated and where cross-market offsets may be possible."
      >
        <MarketPressureGrid markets={packet.highPressureMarkets.slice(0, 5)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'buyer-ranking') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Buying groups affected after scenario impact"
        description="Use this as a downstream read after alerts or scenario risks show which negotiations may need attention."
      >
        <BuyingGroupTable groups={packet.topExposureBuyingGroups.slice(0, 7)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'signal-impact') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="What changed in the market this week"
        description="External changes translated into scenario impact, affected buyers, financial implication and recommended modeling action."
      >
        <SignalCards signals={packet.signals.slice(0, 4)} />
      </GeneratedWorkspace>
    );
  }

  if (view === 'competitor-impact') {
    return (
      <GeneratedWorkspace
        ask={ask}
        title="Competitor moves creating buyer leverage"
        description="Public competitor activity translated into scenario assumptions, buyer leverage, and PepsiCo financial implications."
      >
        <CompetitorCards moves={packet.competitorMoves.slice(0, 4)} />
      </GeneratedWorkspace>
    );
  }

  return (
    <GeneratedWorkspace
      ask={ask}
      title="Model these changes first"
      description=""
    >
      <section className="atlas-generated-stack">
        <CnoWatchlistBrief />
        <CrossMarketPatternBrief />
      </section>
    </GeneratedWorkspace>
  );
}

function EuropeOverview({ initialGeneratedView, initialMonitorTab, initialPrompt }: { initialGeneratedView?: string; initialMonitorTab?: string; initialPrompt?: string }) {
  const generatedView = initialGeneratedView || inferGeneratedView(initialPrompt || initialMonitorTab, 'focus');

  return (
    <OverviewBriefingCanvas generatedView={generatedView} initialPrompt={initialPrompt} />
  );
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <header className="atlas-section-title">
      <h2>{title}</h2>
      {detail ? <p>{detail}</p> : null}
    </header>
  );
}

function sortMarkets(markets: Market[], sort?: string) {
  const { direction, key: selected } = parseSortParam(sort);
  const compareNumbers = (aValue: number, bValue: number) => direction === 'asc' ? aValue - bValue : bValue - aValue;
  return [...markets].sort((a, b) => {
    if (selected === 'margin') return compareNumbers(a.marginAtRisk, b.marginAtRisk);
    if (selected === 'gap') return compareNumbers(a.gapToPlan, b.gapToPlan);
    if (selected === 'trade') return compareNumbers(a.tradeSpendExposure, b.tradeSpendExposure);
    if (selected === 'revenue') return compareNumbers(a.revenueUnderNegotiation, b.revenueUnderNegotiation);
    if (selected === 'buyers') return compareNumbers(a.activeBuyingGroups.length, b.activeBuyingGroups.length);
    return compareNumbers(riskRank(a.pressureLevel), riskRank(b.pressureLevel)) || compareNumbers(a.marginAtRisk, b.marginAtRisk);
  });
}

function filterMarketsForAsk(markets: Market[], ask?: string) {
  const normalized = (ask ?? '').toLowerCase();
  if (/losing money|margin|money at risk|risk/.test(normalized)) {
    return markets.filter((market) => market.marginAtRisk >= 3_000_000 || market.pressureLevel === 'critical' || market.pressureLevel === 'high');
  }
  if (/gap|plan|below/.test(normalized)) {
    return markets.filter((market) => market.gapToPlan >= 1_000_000);
  }
  if (/trade|promo|spend/.test(normalized)) {
    return [...markets].sort((a, b) => b.tradeSpendExposure - a.tradeSpendExposure);
  }
  if (/absorb|offset|safer|low pressure/.test(normalized)) {
    return markets.filter((market) => market.pressureLevel === 'low' || market.pressureLevel === 'medium');
  }
  return markets;
}

function marketMetricTone(metric: 'margin' | 'gap' | 'trade' | 'buyers', market: Market) {
  if (metric === 'margin') {
    if (market.marginAtRisk >= 7_000_000) return 'critical';
    if (market.marginAtRisk >= 4_000_000) return 'warning';
    return 'good';
  }
  if (metric === 'gap') {
    if (market.gapToPlan >= 2_500_000) return 'critical';
    if (market.gapToPlan >= 1_000_000) return 'warning';
    return 'good';
  }
  if (metric === 'trade') {
    if (market.tradeSpendExposure >= 5_000_000) return 'critical';
    if (market.tradeSpendExposure >= 2_500_000) return 'warning';
    return 'good';
  }
  if (market.activeBuyingGroups.length >= 3) return 'critical';
  if (market.activeBuyingGroups.length === 2) return 'warning';
  return 'good';
}

function marketMovementTone(movement: number) {
  if (movement >= 0.12) return 'risk';
  if (movement >= 0.06) return 'watch';
  return 'neutral';
}

function marketMovementLabel(value: number, movement: number, noun: string) {
  return `${movement >= 0 ? '+' : ''}${Math.round(movement * 100)}% ${noun}`;
}

function titleCaseText(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function parseSortParam(sort?: string, fallback = 'priority') {
  const raw = (sort || fallback).trim();
  const normalized = raw.replace(':', '-');
  if (normalized.endsWith('-asc')) return { direction: 'asc' as const, key: normalized.replace(/-asc$/, '') || fallback };
  if (normalized.endsWith('-desc')) return { direction: 'desc' as const, key: normalized.replace(/-desc$/, '') || fallback };
  return { direction: 'desc' as const, key: normalized || fallback };
}

function nextSortParam(activeSort: string | undefined, targetSort: string) {
  const active = parseSortParam(activeSort);
  const nextDirection = active.key === targetSort && active.direction === 'desc' ? 'asc' : 'desc';
  return nextDirection === 'desc' ? targetSort : `${targetSort}-asc`;
}

function sortDirectionArrow(activeSort: string | undefined, targetSort: string) {
  const active = parseSortParam(activeSort);
  if (active.key !== targetSort) return null;
  return active.direction === 'asc' ? '↑' : '↓';
}

function buildMarketDecisionRead(market: Market) {
  const groups = market.activeBuyingGroups
    .map((id) => getBuyingGroup(id))
    .filter((group): group is BuyingGroup => Boolean(group))
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk);
  const topBuyer = groups[0];
  const marketSignals = signalsFor({ marketId: market.id });
  const moves = competitorMovesFor({ marketId: market.id });
  const marketDocuments = documentsFor({ marketId: market.id });
  const marketTimeline = timelineFor({ marketId: market.id });
  const readinessStatus: BuyingGroupWorkspacePacket['readiness']['status'] = market.pressureLevel === 'critical' || market.marginAtRisk >= 7_000_000
    ? 'escalation_needed'
    : market.pressureLevel === 'high' || market.gapToPlan >= 1_000_000 || market.tradeSpendExposure >= 3_000_000
      ? 'needs_review'
      : 'ready';
  const topWatchouts = [
    market.gapToPlan >= 1_000_000 ? `${euros(market.gapToPlan)} gap to plan` : null,
    market.tradeSpendExposure >= 2_500_000 ? `${euros(market.tradeSpendExposure)} trade spend exposed` : null,
    topBuyer ? `${topBuyer.name}: ${buyerInterventionTrigger(topBuyer)}` : null,
    marketDocuments.find((document) => document.status === 'stale' || document.status === 'needs_validation') ? 'Source memory needs review' : null,
    marketSignals[0]?.title,
    moves[0] ? `${moves[0].competitor}: ${moves[0].possibleBuyerLeverage}` : null
  ].filter((item): item is string => Boolean(item)).slice(0, 4);

  return {
    groups,
    marketDocuments,
    marketSignals,
    marketTimeline,
    moves,
    readinessStatus,
    topBuyer,
    topWatchouts,
    headline: `${market.name}: ${euros(market.marginAtRisk)} margin at risk across ${market.activeBuyingGroups.length} active buying groups.`,
    recommendedAction: topBuyer
      ? `Open ${topBuyer.name} first, then model the ${market.name} exposure.`
      : `Model ${market.name} exposure and check source memory.`
  };
}

function MarketSortBar({ activeSort }: { activeSort?: string }) {
  const selected = activeSort || 'priority';
  const sorts = [
    ['priority', 'Priority'],
    ['margin', 'Margin risk'],
    ['gap', 'Gap to plan'],
    ['trade', 'Trade spend'],
    ['buyers', 'Buyer count'],
    ['revenue', 'Revenue']
  ];

  return (
    <section className="atlas-buyer-list-head atlas-market-list-head">
      <h1>Markets</h1>
      <nav aria-label="Sort markets">
        {sorts.map(([sort, label]) => (
          <a href={sort === 'priority' ? '/markets' : `/markets?sort=${sort}`} className={selected === sort ? 'active' : ''} key={sort}>{label}</a>
        ))}
      </nav>
    </section>
  );
}

function marketTableSortHref(sort: string) {
  return sort === 'priority' ? '/markets' : `/markets?sort=${sort}`;
}

function MarketSortableHeader({
  activeSort,
  label,
  sort
}: {
  activeSort: string;
  label: string;
  sort: string;
}) {
  const active = parseSortParam(activeSort).key === sort;
  const nextSort = nextSortParam(activeSort, sort);
  return (
    <a className={active ? 'active' : ''} href={marketTableSortHref(nextSort)} aria-current={active ? 'true' : undefined}>
      {label}
      {active ? <span aria-hidden="true">{sortDirectionArrow(activeSort, sort)}</span> : null}
    </a>
  );
}

function marketPressureReason(market: Market) {
  const read = buildMarketDecisionRead(market);
  const diagnosis = marketPerformanceDiagnosis(market);
  if (market.pressureLevel === 'critical') {
    return `${euros(market.marginAtRisk)} margin at risk, ${diagnosis.averageRealizationGap.toFixed(1)} pts realization gap, ${read.groups.length} buyer groups affected.`;
  }
  if (market.pressureLevel === 'high') {
    return `${euros(market.marginAtRisk)} margin at risk with ${read.groups.length} active buyer groups.`;
  }
  if (market.pressureLevel === 'medium') {
    return `${euros(market.tradeSpendExposure)} trade pressure, but no market-wide escalation trigger yet.`;
  }
  return 'Low pressure relative to the current market set.';
}

function MarketTriageCard({ market, rank }: { market: Market; rank: number }) {
  const read = buildMarketDecisionRead(market);
  const topGroup = read.topBuyer;

  return (
    <a href={`/markets/${market.id}`} className={`atlas-market-triage-card ${classNameForRisk(market.pressureLevel)}`}>
      <header>
        <div>
          <span>#{rank} / {market.pressureLevel} pressure</span>
          <h3>{market.name}</h3>
          <p>{read.recommendedAction}</p>
        </div>
        <span className={`atlas-risk-pill risk-${market.pressureLevel}`}>{readinessLabel(read.readinessStatus)}</span>
      </header>
      <section className="atlas-buyer-triage-metrics" aria-label={`${market.name} financial exposure`}>
        <div className={`metric-${marketMetricTone('margin', market)}`}><span>Margin risk</span><strong>{euros(market.marginAtRisk)}</strong></div>
        <div><span>Revenue</span><strong>{euros(market.revenueUnderNegotiation)}</strong></div>
        <div className={`metric-${marketMetricTone('gap', market)}`}><span>Gap to plan</span><strong>{euros(market.gapToPlan)}</strong></div>
        <div className={`metric-${marketMetricTone('trade', market)}`}><span>Trade spend</span><strong>{euros(market.tradeSpendExposure)}</strong></div>
      </section>
      <dl className="atlas-buyer-triage-state">
        <div className={`metric-${marketMetricTone('buyers', market)}`}><dt>Buying groups</dt><dd>{market.activeBuyingGroups.length} active · {topGroup ? `${topGroup.name} first` : 'No buyer linked'}</dd></div>
        <div><dt>Watchout</dt><dd>{read.topWatchouts[0] ?? market.topDrivers[0]}</dd></div>
      </dl>
      <footer>
        <SourceTrustMini source={market.source} />
        <span>Open market read <ArrowRight size={13} /></span>
      </footer>
    </a>
  );
}

function MarketTriageQueue({ markets }: { markets: Market[] }) {
  if (!markets.length) return <EmptyGeneratedState label="Markets" />;
  return (
    <section className="atlas-market-triage-queue" aria-label="Prioritized market list">
      {markets.map((market, index) => <MarketTriageCard market={market} key={market.id} rank={index + 1} />)}
    </section>
  );
}

function marketPerformanceDiagnosis(market: Market) {
  const buyers = market.activeBuyingGroups.map((id) => getBuyingGroup(id)).filter((group): group is BuyingGroup => Boolean(group));
  const belowTargetBuyers = buyers.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);
  const criticalBuyers = buyers.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high');
  const averageRealizationGap = buyers.length
    ? buyers.reduce((sum, group) => sum + Math.max(0, group.financialExposure.targetPriceRealization - group.financialExposure.expectedPriceRealization), 0) / buyers.length
    : Math.max(0, market.gapToPlan / Math.max(market.revenueUnderNegotiation, 1)) * 100;
  const marginMovement = Math.round((market.marginAtRisk / Math.max(market.revenueUnderNegotiation, 1)) * 100);
  const tradePressure = Math.round((market.tradeSpendExposure / Math.max(market.revenueUnderNegotiation, 1)) * 100);
  const topBuyer = criticalBuyers[0] ?? belowTargetBuyers[0] ?? buyers[0];

  return {
    averageRealizationGap,
    belowTargetBuyers,
    criticalBuyers,
    marginMovement,
    topBuyer,
    tradePressure
  };
}

function MarketsBriefingCanvas({ activeSort, initialPrompt, markets }: { activeSort?: string; initialPrompt?: string; markets: Market[] }) {
  const topMarket = markets[0] ?? packet.highPressureMarkets[0];
  const topRead = buildMarketDecisionRead(topMarket);
  const topBuyer = topRead.topBuyer;
  const topDiagnosis = marketPerformanceDiagnosis(topMarket);
  const topBuyerRoutes = topRead.groups.slice(0, 4);
  const marketAlerts = markets.filter((market) => market.pressureLevel === 'critical' || market.pressureLevel === 'high');
  const isMultiMarketAlert = marketAlerts.length > 1;
  const alertMarkets = marketAlerts.slice(0, 3);
  const selected = activeSort || 'priority';
  const marketOverviewAlerts = [
    ...marketAlerts.slice(0, 3).map(marketToAlert),
    ...packet.signals
      .filter((signal) => signal.affectedMarkets.some((marketId) => marketAlerts.some((market) => market.id === marketId)))
      .slice(0, 2)
      .map(signalToAlert)
  ];
  const scenarioEntryItems: ScenarioEntryQueueItem[] = [
    ...marketOverviewAlerts.slice(0, 3).map((alert) => ({
      action: alert.action,
      href: alert.modelHref ?? alert.href,
      impact: alert.value,
      source: alert.source,
      title: alert.title,
      trigger: alert.trigger,
      why: alert.possibleEffect
    })),
    ...topBuyerRoutes.slice(0, 2).map((group) => ({
      action: 'Open buyer scenario workspace',
      href: `/buying-groups/${group.id}?view=strategy`,
      impact: euros(group.financialExposure.marginAtRisk),
      source: group.source,
      title: `${group.name} should absorb the market read first.`,
      trigger: `${group.riskLevel} buyer risk`,
      why: `${buyerInterventionTrigger(group)} This can change the ask, fallback, red line, or likely buyer counter.`
    }))
  ];

  return (
    <section className="atlas-markets-v3" aria-label="Markets comparison">
      <section className="atlas-markets-v3-hero atlas-market-overview-hero">
        <div>
          <span className={`atlas-market-readiness-pill readiness-${topRead.readinessStatus}`}>Market pressure</span>
          <h1>{isMultiMarketAlert ? `${marketAlerts.length} markets need attention.` : `${topMarket.name} is the first market to inspect.`}</h1>
          <p>
            {isMultiMarketAlert
              ? 'Start with the markets below: each has material margin risk, buyer pressure, or a gap to plan that can change negotiation strategy.'
              : `${topBuyer ? topBuyer.name : topMarket.name} is driving the current read through buyer exposure, realization gap, and trade pressure.`}
          </p>
          <div className="atlas-market-hero-source">
            <SourceTrustMini source={topMarket.source} />
          </div>
        </div>
        {isMultiMarketAlert ? (
          <div className="atlas-market-alert-strip" aria-label="Markets needing attention">
            {alertMarkets.map((market) => {
              const diagnosis = marketPerformanceDiagnosis(market);
              const read = buildMarketDecisionRead(market);
              return (
                <a href={`/markets/${market.id}`} key={market.id}>
                  <strong>{market.name}</strong>
                  <span>{euros(market.marginAtRisk)} margin at risk</span>
                  <small>{market.pressureLevel} pressure · {diagnosis.averageRealizationGap.toFixed(1)} pts gap · {read.groups.length} buyer groups</small>
                </a>
              );
            })}
          </div>
        ) : (
          <dl>
            <div><dt>Top market risk</dt><dd>{euros(topMarket.marginAtRisk)}</dd></div>
            <div><dt>Realization gap</dt><dd>{topDiagnosis.averageRealizationGap.toFixed(1)} pts</dd></div>
            <div><dt>Trade pressure</dt><dd>{euros(topMarket.tradeSpendExposure)}</dd></div>
            <div><dt>Buyers driving risk</dt><dd>{topRead.groups.length}</dd></div>
          </dl>
        )}
      </section>

      {initialPrompt ? (
        <section className="atlas-markets-v3-asked">
          <span>Asked</span>
          <strong>{initialPrompt}</strong>
        </section>
      ) : null}

      <ActiveAlertsPanel
        alerts={marketOverviewAlerts}
        eyebrow="Market alerts"
        title="These market changes can alter buyer scenarios."
        limit={3}
      />

      <ScenarioEntryQueue
        eyebrow="Scenario entry queue"
        items={scenarioEntryItems}
        title="Use the market read to choose which buyer or market scenario to test next."
      />

      <section className="atlas-market-comparison-board" aria-label="Market comparison board">
        <header>
          <div>
            <span>Market comparison</span>
            <h2>Compare markets by the numbers that change negotiation priority.</h2>
          </div>
          <a href="/scenario-lab">PepsiCo Impact <ArrowRight size={13} /></a>
        </header>
        <section className="atlas-buyer-triage-table-wrap atlas-market-triage-table-wrap" aria-label="Market triage table">
          <table className="atlas-buyer-triage-table atlas-market-triage-table">
            <thead>
              <tr>
                <th>Market</th>
                <th><MarketSortableHeader activeSort={selected} label="Pressure" sort="priority" /></th>
                <th><MarketSortableHeader activeSort={selected} label="Margin at risk" sort="margin" /></th>
                <th><MarketSortableHeader activeSort={selected} label="Gap to plan" sort="gap" /></th>
                <th><MarketSortableHeader activeSort={selected} label="Trade spend" sort="trade" /></th>
                <th><MarketSortableHeader activeSort={selected} label="Buying groups" sort="buyers" /></th>
                <th>Scenario</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => {
                const read = buildMarketDecisionRead(market);
                const buyer = read.topBuyer;
                const href = `/markets/${market.id}`;
                return (
                  <tr
                    className={`risk-${market.pressureLevel}`}
                    key={market.id}
                    onClick={() => { window.location.href = href; }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        window.location.href = href;
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <td>
                      <strong>{market.name}</strong>
                      <small>{sourceDisplayName(market.source)} · {market.source.confidence} confidence</small>
                    </td>
                    <td>
                      <span className="atlas-buyer-risk-explain" title={marketPressureReason(market)}>
                        <span className={`atlas-buyer-risk-table-pill risk-${market.pressureLevel}`}>{market.pressureLevel}</span>
                        <span className="atlas-risk-tooltip" role="tooltip">{marketPressureReason(market)}</span>
                      </span>
                    </td>
                    <td className={`metric-${marketMetricTone('margin', market)}`}>{euros(market.marginAtRisk)}</td>
                    <td className={`metric-${marketMetricTone('gap', market)}`}>{euros(market.gapToPlan)}</td>
                    <td className={`metric-${marketMetricTone('trade', market)}`}>{euros(market.tradeSpendExposure)}</td>
                    <td>{buyer?.name ?? `${market.activeBuyingGroups.length} buyers`} · {read.groups.length} groups</td>
                    <td>
                      <button
                        className="atlas-table-scenario-action"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.location.href = `/scenario-lab?market=${market.id}${buyer ? `&buyingGroup=${buyer.id}` : ''}`;
                        }}
                        type="button"
                      >
                        Test scenario
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </section>
    </section>
  );
}

function MarketStatePanel({ market }: { market: Market }) {
  const read = buildMarketDecisionRead(market);
  const pressureMovement = market.pressureLevel === 'critical' ? 0.18 : market.pressureLevel === 'high' ? 0.12 : market.pressureLevel === 'medium' ? 0.06 : 0.02;
  const headerMetrics = [
    {
      label: 'Revenue in negotiation',
      movement: marketMovementLabel(market.revenueUnderNegotiation, pressureMovement, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement),
      value: euros(market.revenueUnderNegotiation)
    },
    {
      label: 'Margin at risk',
      movement: marketMovementLabel(market.marginAtRisk, pressureMovement + 0.04, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement + 0.04),
      value: euros(market.marginAtRisk)
    },
    {
      label: 'Gap to plan',
      movement: marketMovementLabel(market.gapToPlan, pressureMovement + 0.02, 'worse than last read'),
      tone: marketMovementTone(pressureMovement + 0.02),
      value: euros(market.gapToPlan)
    },
    {
      label: 'Trade spend',
      movement: marketMovementLabel(market.tradeSpendExposure, pressureMovement, 'vs last cycle'),
      tone: marketMovementTone(pressureMovement),
      value: euros(market.tradeSpendExposure)
    }
  ];

  return (
    <section className="atlas-market-state-panel">
      <div>
        <span className={`atlas-market-readiness-pill readiness-${read.readinessStatus}`}>{readinessLabel(read.readinessStatus)}</span>
        <h2>{market.name}</h2>
        <div className="atlas-market-state-watchouts">
          {read.topWatchouts.slice(0, 3).map((watchout) => <span key={watchout}>{watchout}</span>)}
        </div>
      </div>
      <dl>
        {headerMetrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>
              <strong>{metric.value}</strong>
              <em className={`movement-${metric.tone}`}>{metric.movement}</em>
            </dd>
          </div>
        ))}
      </dl>
      <aside>
        <span>Recommended action</span>
        <strong>{read.recommendedAction}</strong>
        <div className="atlas-market-state-actions">
          <a href={read.topBuyer ? `/buying-groups/${read.topBuyer.id}` : `/markets/${market.id}`}>Open buyer</a>
          <a href={`/scenario-lab?market=${market.id}`}>Model market</a>
          <a href={`/intelligence?market=${market.id}`}>Sources</a>
        </div>
        <SourceTrustMini source={market.source} />
      </aside>
    </section>
  );
}

function MarketLoopPanel({ market }: { market: Market }) {
  const read = buildMarketDecisionRead(market);
  const savedViews = useStoredGeneratedViews({ marketId: market.id });
  const firstDocument = read.marketDocuments[0];
  const latestEvent = read.marketTimeline[0];
  const firstBuyer = read.topBuyer;
  const sourceWatchouts = read.marketDocuments.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const cards = [
    {
      action: firstDocument ? 'Open source' : 'Open documents',
      href: firstDocument ? hrefForDocumentArtifact(firstDocument) : `/intelligence?market=${market.id}`,
      label: 'Sources',
      meta: sourceWatchouts.length ? `${sourceWatchouts.length} watchouts` : 'Ready',
      source: firstDocument?.source,
      title: `${read.marketDocuments.length} documents`
    },
    {
      action: latestEvent?.buyingGroupIds[0] ? 'Use in buyer scenario' : 'Open timeline',
      href: latestEvent?.buyingGroupIds[0] ? `/buying-groups/${latestEvent.buyingGroupIds[0]}?view=strategy` : `/intelligence?market=${market.id}`,
      label: 'Memory',
      meta: latestEvent ? compactFinancialImpact({
        margin: latestEvent.financialImpact?.marginImpact,
        revenue: latestEvent.financialImpact?.revenueImpact,
        trade: latestEvent.financialImpact?.tradeSpendImpact
      }) : 'No modeled impact',
      source: latestEvent?.source,
      title: `${read.marketTimeline.length} events`
    },
    {
      action: savedViews[0] ? 'Open latest output' : 'Create output',
      href: savedViews[0] ? `/generated-views?prompt=${encodeURIComponent(savedViews[0].prompt)}&mode=draft&editable=1&marketId=${market.id}` : `/generated-views?prompt=${encodeURIComponent(`Create ${market.name} market exposure readout`)}&mode=draft&editable=1&marketId=${market.id}`,
      label: 'Scenario outputs',
      meta: savedViews[0]?.sourceName ? sourceDisplayName({ sourceName: savedViews[0].sourceName }) : 'Editable draft if new',
      title: `${savedViews.length} saved`
    },
    {
      action: firstBuyer ? 'Open buyer' : 'Open buying groups',
      href: firstBuyer ? `/buying-groups/${firstBuyer.id}` : '/buying-groups',
      label: 'Buyer to open',
      meta: firstBuyer ? buyerInterventionTrigger(firstBuyer) : `${market.activeBuyingGroups.length} active buyers`,
      source: firstBuyer?.source,
      title: firstBuyer?.name ?? 'No buyer selected'
    }
  ];

  return (
    <section className="atlas-market-loop-panel" aria-label={`${market.name} intelligence loop`}>
      <header>
        <h2>Market loop</h2>
        <span>{market.name} · sources, memory, buyers, scenario outputs</span>
      </header>
      <div>
        {cards.map((card) => (
          <a href={card.href} key={card.label} {...generatedOutputLinkProps(card.href)}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.meta}</p>
            {card.source ? <SourceTrustMini source={card.source} /> : null}
            <em>{card.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

type MarketDetailTab = 'buyers' | 'drivers' | 'scenario';

function normalizeMarketDetailTab(view?: string, prompt?: string): MarketDetailTab {
  const normalized = `${view ?? ''} ${prompt ?? ''}`.toLowerCase();
  if (/signal|signals|driver|drivers|news|world|changed|pressure|competitor|private label|leverage/.test(normalized)) return 'drivers';
  if (/strategy|scenario|model|corridor|guardrail|position|pricing|source|document|memory|history|timeline|generated|database|proof/.test(normalized)) return 'scenario';
  return 'buyers';
}

function MarketDetailTabs({
  activeTab,
  market,
  metrics
}: {
  activeTab: MarketDetailTab;
  market: Market;
  metrics: {
    buyers: number;
    drivers: number;
    scenario: number;
  };
}) {
  const tabs: Array<[MarketDetailTab, string, number]> = [
    ['buyers', 'Buyer gaps', metrics.buyers],
    ['drivers', 'Market drivers', metrics.drivers],
    ['scenario', 'Scenario inputs', metrics.scenario]
  ];

  return (
    <nav className="atlas-market-detail-tabs" aria-label={`${market.name} market views`}>
      {tabs.map(([tab, label, count]) => (
        <a href={`/markets/${market.id}?view=${tab}`} className={activeTab === tab ? 'active' : ''} key={tab}>
          <span>{label}</span>
          <strong>{count}</strong>
        </a>
      ))}
    </nav>
  );
}

function MarketBuyerGapTable({ groups }: { groups: BuyingGroup[] }) {
  if (!groups.length) return <EmptyGeneratedState label="Buyer gaps" />;
  return <MarketBuyerGapRangeChart groups={groups} />;
}

function MarketBuyerGapRangeChart({ groups }: { groups: BuyingGroup[] }) {
  const pointGap = (value: number) => `${value.toFixed(1)} pts`;
  const rows = groups.map((group) => {
    const exposure = group.financialExposure;
    const gap = Math.max(0, exposure.targetPriceRealization - exposure.expectedPriceRealization);
    const progress = Math.max(0, Math.min(100, (exposure.expectedPriceRealization / Math.max(exposure.targetPriceRealization, 0.1)) * 100));
    return { exposure, gap, group, progress };
  });
  const totalMarginAtRisk = groups.reduce((sum, group) => sum + group.financialExposure.marginAtRisk, 0);
  const totalRevenue = groups.reduce((sum, group) => sum + group.financialExposure.revenueUnderNegotiation, 0);
  const weightedGap = totalRevenue
    ? groups.reduce((sum, group) => {
      const exposure = group.financialExposure;
      return sum + Math.max(0, exposure.targetPriceRealization - exposure.expectedPriceRealization) * exposure.revenueUnderNegotiation;
    }, 0) / totalRevenue
    : 0;
  const buyersBelowTarget = rows.filter((row) => row.gap > 0).length;
  const severityFor = (group: BuyingGroup, gap: number) => {
    if (group.riskLevel === 'critical' || gap >= 1.2) return 'critical';
    if (group.riskLevel === 'high' || gap >= 0.8) return 'high';
    if (group.riskLevel === 'medium' || gap >= 0.4) return 'medium';
    return 'low';
  };

  return (
    <section className="atlas-market-buyer-gap-range atlas-market-buyer-dumbbell" aria-label="Buyer realization gap range">
      <header>
        <div>
          <span>Buyer scenario gaps</span>
          <h3>Which buyer gaps should become scenarios?</h3>
        </div>
        <p>Use this to see which buying group is below target, how much margin is exposed, and where to open the scenario workspace.</p>
      </header>
      <section className="atlas-market-gap-summary" aria-label="Market buyer gap summary">
        <div><span>Market average gap</span><strong>{pointGap(weightedGap)}</strong></div>
        <div><span>Buyers below target</span><strong>{buyersBelowTarget}</strong></div>
        <div><span>Total margin at risk</span><strong>{euros(totalMarginAtRisk)}</strong></div>
      </section>
      <div className="atlas-market-buyer-gap-range-head" aria-hidden="true">
        <span>Buying group</span>
        <span>Captured vs target</span>
        <span>Gap / risk</span>
        <span>Scenario route</span>
      </div>
      <div className="atlas-market-buyer-gap-range-rows">
        {rows.map(({ exposure, gap, group, progress }) => {
          const severity = severityFor(group, gap);
          return (
            <a className={`severity-${severity}`} href={`/buying-groups/${group.id}?view=strategy`} key={group.id}>
              <div className="atlas-market-buyer-gap-range-label">
                <strong>{group.name}</strong>
                <span>{group.riskLevel} risk · {buyerRoundLabel(group)}</span>
              </div>
              <div className="atlas-market-buyer-gap-read">
                <div className="atlas-market-buyer-gap-values">
                  <span><small>Current</small><strong>{pct(exposure.expectedPriceRealization)}</strong></span>
                  <span><small>Target</small><strong>{pct(exposure.targetPriceRealization)}</strong></span>
                </div>
                <div className="atlas-market-buyer-gap-progress" aria-label={`${group.name} has captured ${pct(exposure.expectedPriceRealization)} of ${pct(exposure.targetPriceRealization)} target`}>
                  <i><b style={{ width: `${progress}%` }} /></i>
                </div>
              </div>
              <div className="atlas-market-buyer-gap-close">
                <strong>{pointGap(gap)}</strong>
                <span>{buyerRiskReason(group)}</span>
              </div>
              <div className="atlas-market-buyer-gap-range-impact">
                <strong>{euros(exposure.marginAtRisk)}</strong>
                <span>{buyerScenarioToTest(group)}</span>
                <em>Open scenario workspace <ArrowRight size={12} /></em>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function MarketDriverCards({ market, moves, signals }: { market: Market; moves: CompetitorMove[]; signals: ExternalSignal[] }) {
  const drivers = [
    ...signals.map((signal) => ({
      actionHref: signal.affectedBuyingGroups[0] ? `/buying-groups/${signal.affectedBuyingGroups[0]}` : `/signals?signal=${signal.id}`,
      impact: compactFinancialImpact({ margin: signal.estimatedMarginImpact, revenue: signal.estimatedRevenueImpact }),
      label: 'External signal',
      source: signal.source,
      story: signal.negotiationImplication,
      title: signal.title
    })),
    ...moves.map((move) => ({
      actionHref: move.affectedBuyingGroups[0] ? `/buying-groups/${move.affectedBuyingGroups[0]}` : `/signals?move=${move.id}`,
      impact: compactFinancialImpact({ margin: move.estimatedMarginImpact, revenue: move.estimatedRevenueImpact }),
      label: 'Competitor pressure',
      source: move.source,
      story: move.possibleBuyerLeverage,
      title: `${move.competitor}: ${move.title}`
    }))
  ].slice(0, 6);

  if (!drivers.length) return <EmptyGeneratedState label={`${market.name} drivers`} />;

  return (
    <section className="atlas-market-driver-grid" aria-label={`${market.name} market drivers`}>
      {drivers.map((driver) => (
        <a href={driver.actionHref} key={`${driver.label}-${driver.title}`}>
          <span>{driver.label}</span>
          <h3>{driver.title}</h3>
          <p>{driver.story}</p>
          <div>
            <strong>{driver.impact}</strong>
            <SourceTrustMini source={driver.source} />
          </div>
        </a>
      ))}
    </section>
  );
}

function MarketScenarioInputsPanel({
  groups,
  market,
  moves,
  signals
}: {
  groups: BuyingGroup[];
  market: Market;
  moves: CompetitorMove[];
  signals: ExternalSignal[];
}) {
  const diagnosis = marketPerformanceDiagnosis(market);
  const topBuyer = groups[0];
  const sourceWatchouts = packet.documents.filter((document) => (
    document.marketId === market.id && (document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing')
  ));
  const latestMemory = packet.timelineEvents.find((event) => event.marketIds.includes(market.id));
  const strategyInputs = [
    {
      action: topBuyer ? 'Open buyer workspace' : 'Open buying groups',
      href: topBuyer ? `/buying-groups/${topBuyer.id}?view=strategy` : '/buying-groups',
      label: 'Buyer priority',
      source: topBuyer?.source ?? market.source,
      title: topBuyer ? `${topBuyer.name} should anchor the market scenario.` : `${market.name} needs buyer prioritization.`,
      value: topBuyer ? euros(topBuyer.financialExposure.marginAtRisk) : `${market.activeBuyingGroups.length} buyers`
    },
    {
      action: 'Model market scenario',
      href: `/scenario-lab?market=${market.id}${topBuyer ? `&buyingGroup=${topBuyer.id}` : ''}`,
      label: 'Pricing corridor',
      source: market.source,
      title: `${diagnosis.averageRealizationGap.toFixed(1)} pts average realization gap needs scenario testing.`,
      value: `${diagnosis.averageRealizationGap.toFixed(1)} pts`
    },
    {
      action: 'Review drivers',
      href: `/markets/${market.id}?view=drivers`,
      label: 'Market evidence',
      source: signals[0]?.source ?? moves[0]?.source ?? market.source,
      title: signals[0]?.title ?? moves[0]?.title ?? market.topDrivers[0],
      value: `${signals.length + moves.length} drivers`
    },
    {
      action: latestMemory?.buyingGroupIds[0] ? 'Use in buyer scenario' : 'Review memory',
      href: latestMemory?.buyingGroupIds[0] ? `/buying-groups/${latestMemory.buyingGroupIds[0]}?view=strategy` : `/markets/${market.id}?view=scenario`,
      label: 'Historical memory',
      source: latestMemory?.source ?? market.source,
      title: latestMemory ? latestMemory.summary : 'No market-specific memory captured yet.',
      value: latestMemory ? latestMemory.eventType.replaceAll('_', ' ') : 'Add debrief'
    },
    {
      action: 'Review source gaps',
      href: `/intelligence?market=${market.id}`,
      label: 'Source readiness',
      source: sourceWatchouts[0]?.source ?? market.source,
      title: sourceWatchouts.length ? `${sourceWatchouts.length} source gaps need validation before official use.` : 'Market source set is ready for scenario use.',
      value: sourceWatchouts.length ? `${sourceWatchouts.length} gaps` : 'Ready'
    }
  ];

  return (
    <section className="atlas-market-strategy-inputs" aria-label={`${market.name} scenario inputs`}>
      {strategyInputs.map((input) => (
        <article key={input.label}>
          <span>{input.label}</span>
          <strong>{input.value}</strong>
          <p>{input.title}</p>
          <SourceTrustMini source={input.source} />
          <a href={input.href}>{input.action} <ArrowRight size={13} /></a>
        </article>
      ))}
    </section>
  );
}

function MarketDetailRead({ market, initialPrompt, view }: { market: Market; initialPrompt?: string; view?: string }) {
  const read = buildMarketDecisionRead(market);
  const groups = sortBuyingGroups(read.groups, 'priority');
  const marketSignals = read.marketSignals;
  const moves = read.moves;
  const activeTab = normalizeMarketDetailTab(view, initialPrompt);
  const diagnosis = marketPerformanceDiagnosis(market);
  const leadBuyer = groups[0];
  const detailAlerts = [
    marketToAlert(market),
    ...marketSignals.slice(0, 2).map(signalToAlert),
    ...groups.slice(0, 2).map(buyingGroupToAlert)
  ];
  const scenarioEntries = detailAlerts.slice(0, 4).map((alert) => ({
    action: alert.action,
    href: alert.modelHref ?? alert.href,
    impact: alert.value,
    source: alert.source,
    title: alert.title,
    trigger: alert.trigger,
    why: alert.possibleEffect
  }));

  return (
    <section className="atlas-market-detail-read">
      {initialPrompt ? <p className="atlas-generated-prompt">Asked: “{initialPrompt}”</p> : null}
      <ActiveAlertsPanel
        alerts={detailAlerts}
        eyebrow={`${market.name} alerts`}
        title="These changes can alter buyer scenarios in this market."
        limit={3}
      />

      <section className="atlas-market-scenario-brief" aria-label={`${market.name} scenario context`}>
        <div>
          <span>Scenario context</span>
          <h2>
            {leadBuyer
              ? `${leadBuyer.name} is the first buyer to scenario test in ${market.name}.`
              : `${market.name} needs buyer attribution before scenario planning.`}
          </h2>
          <p>{read.topWatchouts.slice(0, 2).join(' · ')}</p>
          <SourceTrustMini source={market.source} />
        </div>
        <dl>
          <div><dt>Margin at risk</dt><dd>{euros(market.marginAtRisk)}</dd></div>
          <div><dt>Avg target gap</dt><dd>{diagnosis.averageRealizationGap.toFixed(1)} pts</dd></div>
          <div><dt>Trade pressure</dt><dd>{euros(market.tradeSpendExposure)}</dd></div>
          <div><dt>Buyer groups</dt><dd>{groups.length}</dd></div>
        </dl>
      </section>

      <ScenarioEntryQueue
        eyebrow={`${market.name} scenario entry`}
        items={scenarioEntries}
        title="Route market pressure into the buyer scenario it changes."
      />

      <MarketDetailTabs
        activeTab={activeTab}
        market={market}
        metrics={{
          buyers: groups.length,
          drivers: marketSignals.length + moves.length,
          scenario: marketSignals.length + moves.length + read.marketTimeline.length + groups.length
        }}
      />

      <section className="atlas-market-tab-panel">
        {activeTab === 'buyers' ? (
          <MarketBuyerGapTable groups={groups} />
        ) : null}

        {activeTab === 'drivers' ? (
          <>
            <SectionTitle title="Market drivers" />
            <MarketDriverCards market={market} moves={moves} signals={marketSignals} />
          </>
        ) : null}

        {activeTab === 'scenario' ? (
          <>
            <SectionTitle title="What should feed scenario planning" />
            <MarketScenarioInputsPanel groups={groups} market={market} moves={moves} signals={marketSignals} />
          </>
        ) : null}
      </section>
    </section>
  );
}

function MarketsView({
  initialGeneratedView,
  initialPrompt,
  initialSort,
  marketId
}: {
  initialGeneratedView?: string;
  initialPrompt?: string;
  initialSort?: string;
  marketId?: string;
}) {
  const market = marketId ? getMarket(marketId) : undefined;

  if (market) {
    return (
      <MarketDetailRead initialPrompt={initialPrompt} market={market} view={initialGeneratedView} />
    );
  }

  const markets = filterMarketsForAsk(sortMarkets(packet.markets, initialSort), initialPrompt);

  return (
    <MarketsBriefingCanvas activeSort={initialSort} initialPrompt={initialPrompt} markets={markets} />
  );
}

function BuyingGroupStatePanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const { buyingGroup } = workspace;
  const currentState = profileRead.currentState;
  const latestEvent = workspace.timelineEvents[0];
  const topSignal = workspace.signals[0];
  const topCompetitorMove = workspace.competitorMoves[0];
  const riskMovement = buyingGroup.riskLevel === 'critical' ? 0.7 : buyingGroup.riskLevel === 'high' ? 0.5 : buyingGroup.riskLevel === 'medium' ? 0.3 : 0.1;
  const buyerAskValue = Number.parseFloat(currentState.latestBuyerAsk);
  const pepsicoPositionValue = Number.parseFloat(currentState.pepsicoPosition);
  const positionGap = Number.isFinite(buyerAskValue) && Number.isFinite(pepsicoPositionValue)
    ? `${(buyerAskValue - pepsicoPositionValue).toFixed(1)} pts ask gap`
    : 'Gap not modeled';
  const relevantMarket = workspace.markets
    .filter((market) => (
      market.gapToPlan >= 1_000_000 ||
      market.marginAtRisk >= profileRead.exposure.marginAtRisk * 0.8 ||
      market.pressureLevel === 'critical' ||
      market.pressureLevel === 'high'
    ))
    .sort((a, b) => b.gapToPlan - a.gapToPlan || b.marginAtRisk - a.marginAtRisk)[0];
  const postureReasons = [
    {
      label: 'Buyer posture',
      source: profileRead.source,
      text: `Ask is ${positionGap}; defend ${currentState.pepsicoPosition} before concession.`
    },
    relevantMarket ? {
      label: 'Market pressure',
      source: topSignal?.source ?? relevantMarket.source,
      text: `${relevantMarket.name} gap is ${euros(relevantMarket.gapToPlan)} and may harden the room.`
    } : null,
    topCompetitorMove ? {
      label: 'Competitive pressure',
      source: topCompetitorMove.source,
      text: `${topCompetitorMove.competitor} creates leverage; attach evidence before trading support.`
    } : latestEvent ? {
      label: 'History signal',
      source: latestEvent.source,
      text: `${latestEvent.title} is shaping the read.`
    } : null
  ].filter(Boolean) as Array<{ label: string; source: SourceMeta; text: string }>;
  const headerMetrics = [
    {
      label: 'Latest buyer ask',
      movement: `+${riskMovement.toFixed(1)} pts vs last negotiation`,
      tone: 'risk',
      value: currentState.latestBuyerAsk
    },
    {
      label: 'PepsiCo position',
      movement: positionGap,
      tone: 'watch',
      value: currentState.pepsicoPosition
    },
    {
      label: 'Target',
      movement: `${pct(profileRead.exposure.expectedPriceRealization)} expected realization`,
      tone: 'neutral',
      value: currentState.target
    },
    {
      label: 'Red line',
      movement: 'guardrail for concessions',
      tone: 'risk',
      value: currentState.redLine
    },
    {
      label: 'Margin at risk',
      movement: `${pct(profileRead.exposure.expectedPriceRealization)} expected realization`,
      tone: buyingGroup.riskLevel === 'critical' || buyingGroup.riskLevel === 'high' ? 'risk' : 'neutral',
      value: euros(profileRead.exposure.marginAtRisk)
    }
  ];

  return (
    <section className="atlas-buying-group-hero" id="group-overview">
      <div className="atlas-buyer-hero-nav">
        <a href="/buying-groups" aria-label="Back to buying groups">‹</a>
        <span>Back to buying groups</span>
      </div>
      <div className="atlas-buyer-hero-title">
        <span className={`atlas-buyer-risk-badge risk-${buyingGroup.riskLevel}`}>{buyingGroup.riskLevel} risk</span>
        <h2>{buyingGroup.name}</h2>
        <p>
          <span>Markets <strong>{workspace.markets.map((market) => market.name).join(' / ')}</strong></span>
          <span>Round <strong>{currentState.negotiationRound}</strong></span>
          <span>Stage <strong>{buyingGroup.negotiationStage}</strong></span>
        </p>
      </div>
      <section className="atlas-buyer-report-shell" aria-label={`${buyingGroup.name} posture read`}>
        <div className="atlas-buyer-hero-read">
          <span>Summary generated by AI</span>
          <h3>{buyingGroup.name} is likely to pressure affordability; hold position and attach evidence before trading support.</h3>
          <div className="atlas-buyer-hero-read-reasons">
            {postureReasons.map((reason) => (
              <article key={reason.label}>
                <strong>{reason.label}</strong>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="atlas-buyer-hero-summary">
          <dl>
            {headerMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  <strong>{metric.value}</strong>
                  <em className={`movement-${metric.tone}`}>{metric.movement}</em>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </section>
  );
}

function BuyingGroupFinancialPanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const exposure = profileRead.exposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const financialSource = profileRead.source;
  const acceptedRealization = exposure.acceptedPriceRealization ?? exposure.expectedPriceRealization;
  const financialHighlights = [
    {
      label: 'Realization gap',
      value: `${pct(realizationGap)} below plan`,
      detail: `${pct(exposure.expectedPriceRealization)} expected vs ${pct(exposure.targetPriceRealization)} target`
    },
    {
      label: 'Buyer exposure',
      value: euros(exposure.revenueUnderNegotiation),
      detail: 'revenue under negotiation'
    },
    {
      label: 'Trade pressure',
      value: euros(exposure.tradeSpendExposure),
      detail: 'support exposed in current ask'
    },
    {
      label: 'Current accepted',
      value: pct(acceptedRealization),
      detail: 'latest modeled acceptance'
    }
  ];

  return (
    <section className="atlas-buying-group-financials" id="group-financials">
      <header>
        <div>
          <span>Financials</span>
          <h2>{euros(exposure.marginAtRisk)} margin at risk if the current position holds.</h2>
          <SourceTrustMini source={financialSource} />
        </div>
        <a href={`/scenario-lab?buyingGroup=${workspace.buyingGroup.id}`}>Open PepsiCo impact <ArrowRight size={14} /></a>
      </header>
      <section className="atlas-buyer-financial-highlight-grid" aria-label="Key financial read">
        {financialHighlights.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <em>{item.detail}</em>
          </article>
        ))}
      </section>
      <FinancialImpactStrip
        revenue={exposure.revenueUnderNegotiation}
        margin={exposure.marginAtRisk}
        volume={exposure.volumeExposure}
        trade={exposure.tradeSpendExposure}
      />
      <ScenarioComparisonPanel compact workspace={workspace} />
      <div className="atlas-buyer-tab-actions">
        <a href={`/scenario-lab?buyingGroup=${workspace.buyingGroup.id}`}>Open scenario workspace <ArrowRight size={14} /></a>
        <a href={`/buying-groups/${workspace.buyingGroup.id}`}>Return to buyer workspace <ArrowRight size={14} /></a>
      </div>
    </section>
  );
}

function BuyingGroupScenarioModeler({
  buyingGroup,
  inputs,
  onUpdateInput,
  outputs,
  source
}: {
  buyingGroup: BuyingGroup;
  inputs: ScenarioInputs;
  onUpdateInput: <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => void;
  outputs: ReturnType<typeof calculateScenarioOutputs>;
  source: SourceMeta;
}) {
  const [saveStatus, setSaveStatus] = useState('');
  const scenarioLevers: Array<{
    affects: string;
    key: keyof ScenarioInputs;
    label: string;
    max: number;
    min: number;
    step: number;
  }> = [
    { key: 'expectedRealizationPercent', label: 'Expected realization', min: 0, max: Math.max(5, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Price realization, gap to plan, margin' },
    { key: 'volumeChangePercent', label: 'Volume change', min: -5, max: 3, step: 0.1, affects: 'Volume, revenue, risk-adjusted value' },
    { key: 'tradeSpendChange', label: 'Trade spend change', min: 0, max: Math.max(1000000, inputs.tradeSpendChange * 1.5), step: 25000, affects: 'Trade spend, margin, buyer acceptance' },
    { key: 'concessionAmount', label: 'Concession amount', min: 0, max: Math.max(1000000, inputs.concessionAmount * 1.75), step: 25000, affects: 'Revenue, margin, gap to plan' },
    { key: 'buyerAcceptanceProbability', label: 'Buyer acceptance', min: 0, max: 100, step: 1, affects: 'Risk-adjusted value, landing confidence' }
  ];
  const needsReview = outputs.marginImpact < 0 || outputs.riskLevel === 'high' || inputs.buyerAcceptanceProbability < 50;
  const currentExposure = buyingGroup.financialExposure;
  const scenarioReadRows = [
    {
      current: pct(currentExposure.expectedPriceRealization),
      delta: euros(outputs.priceRealizationImpact),
      label: 'Price realization',
      modeled: pct(inputs.expectedRealizationPercent),
      tone: outputs.priceRealizationImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.marginAtRisk),
      delta: euros(outputs.marginImpact),
      label: 'Margin',
      modeled: outputs.marginImpact >= 0 ? 'Improves' : 'Pressured',
      tone: outputs.marginImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.volumeExposure),
      delta: euros(outputs.volumeImpact),
      label: 'Volume',
      modeled: `${inputs.volumeChangePercent.toFixed(1)}% move`,
      tone: outputs.volumeImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.tradeSpendExposure),
      delta: euros(outputs.tradeSpendImpact),
      label: 'Trade spend',
      modeled: euros(inputs.tradeSpendChange),
      tone: outputs.tradeSpendImpact >= 0 ? 'positive' : 'negative'
    },
    {
      current: euros(currentExposure.gapToPlan),
      delta: euros(outputs.gapToPlanImpact),
      label: 'Gap to plan',
      modeled: outputs.gapToPlanImpact <= 0 ? 'Closes gap' : 'Gap remains',
      tone: outputs.gapToPlanImpact <= 0 ? 'positive' : 'negative'
    }
  ];
  const scenarioViewPrompt = `Create an editable scenario view for ${buyingGroup.name}: expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, margin impact ${euros(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`;

  function saveScenarioToHistory() {
    const now = new Date().toISOString();
    const prompt = `Saved scenario for ${buyingGroup.name}: expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, margin impact ${euros(outputs.marginImpact)}.`;
    saveStoredGeneratedView({
      artifactType: 'scenario_output',
      audienceMode: 'internal_cno',
      buyingGroupId: buyingGroup.id,
      confidence: source.confidence,
      createdAt: now,
      id: `scenario-memory-${buyingGroup.id}-${Date.now().toString(36)}`,
      lifecycleState: 'attached',
      marketId: buyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt,
      revisionCount: 0,
      savedDestination: 'buyer_profile',
      savedToProfileAt: now,
      sourceDate: source.sourceDate,
      sourceDecision: needsReview
        ? 'Saved scenario output as buyer memory with review required because the move creates risk or a guardrail dependency.'
        : 'Saved scenario output as buyer memory from the inline financial model.',
      sourceName: source.sourceName,
      summary: `${outputs.recommendation} Revenue ${euros(outputs.revenueImpact)}, margin ${euros(outputs.marginImpact)}, trade ${euros(outputs.tradeSpendImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
      title: `${buyingGroup.name} scenario: ${inputs.expectedRealizationPercent.toFixed(1)}% realization`,
      updatedAt: now
    });
    setSaveStatus(needsReview ? 'Saved to History with review trigger.' : 'Saved to History.');
  }

  return (
    <section className="atlas-buyer-scenario-model" aria-label={`${buyingGroup.name} scenario model`}>
      <header>
        <div>
          <span>Scenario model</span>
          <h3>Test the next pricing move for {buyingGroup.name}</h3>
          <p>Change a lever, then read the affected metrics before saving the scenario to this buyer history.</p>
        </div>
        <a href={`/scenario-lab?buyingGroup=${buyingGroup.id}`}>Open full model <ArrowRight size={14} /></a>
      </header>
      <section className="atlas-buyer-scenario-impact-key" aria-label="Scenario affected metrics">
        {['Price realization', 'Margin', 'Volume', 'Trade spend', 'Gap to plan', 'Risk-adjusted value'].map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </section>
      <div className="atlas-buyer-scenario-grid">
        <div className="atlas-buyer-scenario-levers">
          {scenarioLevers.map(({ key, label, max, min, step }) => (
            <label className="atlas-buyer-scenario-lever" key={key}>
              <span>{label}</span>
              <strong>{key === 'tradeSpendChange' || key === 'concessionAmount' ? euros(Number(inputs[key])) : `${Number(inputs[key]).toFixed(key === 'buyerAcceptanceProbability' ? 0 : 1)}%`}</strong>
              <input
                max={max}
                min={min}
                onChange={(event) => onUpdateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])}
                onInput={(event) => onUpdateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])}
                step={step}
                type="range"
                value={Number(inputs[key])}
              />
            </label>
          ))}
          <label className="atlas-buyer-scenario-lever">
            <span>Competitor pressure</span>
            <select value={inputs.competitorPressureLevel} onChange={(event) => onUpdateInput('competitorPressureLevel', event.currentTarget.value as ScenarioInputs['competitorPressureLevel'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="atlas-buyer-scenario-results">
          <article className={`atlas-buyer-scenario-verdict risk-${outputs.riskLevel}`}>
            <span>Scenario read</span>
            <strong>{outputs.riskLevel} risk · {euros(outputs.riskAdjustedValue)} risk-adjusted value</strong>
            <p>{outputs.recommendation}</p>
          </article>
          <section className="atlas-buyer-scenario-read-table" aria-label="Current versus modeled scenario read">
            <header>
              <span>Metric</span>
              <span>Current</span>
              <span>Modeled</span>
              <span>Delta</span>
            </header>
            {scenarioReadRows.map((row) => (
              <div key={row.label}>
                <strong>{row.label}</strong>
                <span>{row.current}</span>
                <span>{row.modeled}</span>
                <em className={`tone-${row.tone}`}>{row.delta}</em>
              </div>
            ))}
          </section>
          <FinancialImpactStrip
            revenue={outputs.revenueImpact}
            margin={outputs.marginImpact}
            volume={outputs.volumeImpact}
            trade={outputs.tradeSpendImpact}
          />
          <div className="atlas-buyer-scenario-bars">
            {[
              ['Gap to plan', outputs.gapToPlanImpact],
              ['Price realization', outputs.priceRealizationImpact],
              ['Risk-adjusted value', outputs.riskAdjustedValue]
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <i className={Number(value) < 0 ? 'negative' : ''}><b style={{ width: `${Math.min(100, Math.max(10, Math.abs(Number(value)) / 12000))}%` }} /></i>
                <strong>{euros(Number(value))}</strong>
              </div>
            ))}
          </div>
          <SourceTrustMini source={source} />
          <div className="atlas-buyer-scenario-actions">
            <button type="button" onClick={saveScenarioToHistory}>Save scenario to buyer history</button>
            <a href={`/generated-views?prompt=${encodeURIComponent(scenarioViewPrompt)}&buyingGroupId=${buyingGroup.id}&mode=draft&editable=1`} rel="noreferrer" target="_blank">Open editable scenario view <ArrowRight size={13} /></a>
            {saveStatus ? <span>{saveStatus}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type BuyingGroupGeneratedView = 'snapshot' | 'financials' | 'memory' | 'strategy' | 'intelligence' | 'custom';

function inferBuyingGroupView(prompt: string): BuyingGroupGeneratedView {
  const normalized = prompt.toLowerCase();
  if (/financial|margin|revenue|gap|price|realization|volume|trade|model|scenario|sku|lever|what if|counter/.test(normalized)) return 'strategy';
  if (/memory|history|timeline|debrief|last year|prior|respond|reaction|meeting|document|source|prep|file|evidence|validation|proof/.test(normalized)) return 'memory';
  if (/signal|news|competitor|private label|market|pressure|changed|strategy|plan|concession|lever/.test(normalized)) return 'strategy';
  if (/live|room|negotiator|meeting|listen|call/.test(normalized)) return 'memory';
  return 'strategy';
}

function labelForBuyingGroupView(view: BuyingGroupGeneratedView) {
  if (view === 'snapshot' || view === 'intelligence' || view === 'strategy') return 'Scenario workspace';
  if (view === 'financials') return 'Scenario inputs';
  if (view === 'memory') return 'Scenario memory';
  return 'Custom scenario view';
}

function EmptyGeneratedState({ label }: { label: string }) {
  return (
    <article className="atlas-generated-empty">
      <span>{label}</span>
      <h3>No matching records in the prototype data.</h3>
      <p>Ask ATLAS or add a source document to expand this buyer read.</p>
    </article>
  );
}

function BuyingGroupSnapshotGrid({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const latestEvent = workspace.timelineEvents[0];
  const exposure = profileRead.exposure;
  const competitorPressure = workspace.competitorMoves[0];
  const financialSource = profileRead.source;

  const snapshots = [
    {
      label: 'Financial',
      title: `${euros(exposure.marginAtRisk)} margin at risk`,
      body: `${pct(exposure.expectedPriceRealization)} vs ${pct(exposure.targetPriceRealization)} target`,
      action: 'Open scenario workspace',
      source: financialSource,
      view: 'strategy' as BuyingGroupGeneratedView
    },
    {
      label: 'Memory',
      title: latestEvent?.title ?? 'No memory event yet',
      body: latestEvent ? 'Latest event captured' : 'No recent event',
      action: 'Use in scenario',
      source: latestEvent?.source ?? workspace.buyingGroup.source,
      view: 'memory' as BuyingGroupGeneratedView
    },
    {
      label: 'Pressure',
      title: competitorPressure ? competitorPressure.title : 'No competitor pressure linked',
      body: competitorPressure ? competitorPressure.competitor : 'No linked move',
      action: 'Open scenario workspace',
      source: competitorPressure?.source ?? workspace.buyingGroup.source,
      view: 'strategy' as BuyingGroupGeneratedView
    },
    {
      label: 'History',
      title: `${workspace.timelineEvents.length} events / ${workspace.documents.length} docs`,
      body: 'Timeline, debriefs and supporting files',
      action: 'Use in scenario',
      source: workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      view: 'memory' as BuyingGroupGeneratedView
    }
  ];

  return (
    <section className="atlas-snapshot-grid" aria-label="Buying group snapshots">
      {snapshots.map((snapshot) => (
        <a href={`/buying-groups/${workspace.buyingGroup.id}?view=${snapshot.view}`} key={snapshot.label}>
          <span>{snapshot.label}</span>
          <strong>{snapshot.title}</strong>
          <p>{snapshot.body}</p>
          <SourceTrustMini source={snapshot.source} />
          <em>{snapshot.action}</em>
        </a>
      ))}
    </section>
  );
}

function BuyingGroupPhaseControl({
  activePhase,
  buyingGroupId,
  view
}: {
  activePhase: string;
  buyingGroupId: string;
  view: BuyingGroupGeneratedView;
}) {
  const phases = [
    ['monitor', 'Monitor'],
    ['prep', 'Prep'],
    ['active', 'Active room'],
    ['review', 'Review'],
    ['debrief', 'Debrief memory']
  ];

  return (
    <nav className="atlas-phase-control" aria-label="Buying group phase focus">
      {phases.map(([phase, label]) => (
        <a href={`/buying-groups/${buyingGroupId}?view=${view}&phase=${phase}`} key={phase} className={activePhase === phase ? 'active' : ''}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function BuyingGroupCustomReport({
  prompt,
  profileRead,
  workspace
}: {
  prompt: string;
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const normalized = prompt.toLowerCase();
  const exposure = profileRead.exposure;
  const primarySignal = workspace.signals[0];
  const primaryDocument = workspace.documents[0];
  const latestEvent = workspace.timelineEvents[0];
  const outputMode = /history|timeline|debrief|prior|respond|reaction/.test(normalized)
    ? 'buyer history'
    : /document|source|prep|file|proof/.test(normalized)
      ? 'source review'
      : /signal|news|competitor|private label|market|changed/.test(normalized)
        ? 'market signal read'
        : /live|room|meeting|call/.test(normalized)
          ? 'debrief preparation'
          : 'financial readout';

  return (
    <section className="atlas-custom-report-tab" aria-label="Custom scenario output">
      <article className="atlas-custom-report-hero">
        <div>
          <span>Created output</span>
          <h3>{labelForBuyingGroupView('custom')}: {outputMode}</h3>
          <p>{prompt}</p>
        </div>
        <button type="button" className="atlas-custom-report-download" onClick={() => window.print()}>
          <Download size={14} />
          Export output
        </button>
      </article>
      <section className="atlas-custom-report-grid">
        <article>
          <h4>{workspace.buyingGroup.name} is still a financially material watch item.</h4>
          <p>{euros(exposure.marginAtRisk)} margin remains at risk, with expected realization at {pct(exposure.expectedPriceRealization)} versus {pct(exposure.targetPriceRealization)} target.</p>
        </article>
        <article>
          <span>What changed</span>
          <h4>{primarySignal?.title ?? latestEvent?.title ?? 'No new external change linked'}</h4>
          <p>{primarySignal?.negotiationImplication ?? latestEvent?.summary ?? 'Use the source tray to add new buyer-specific context.'}</p>
        </article>
        <article>
          <span>Recommended view</span>
          <h4>{outputMode === 'financial readout' ? 'Open Scenario workspace next' : outputMode === 'source review' ? 'Open Scenario workspace next' : outputMode === 'debrief preparation' ? 'Open debrief memory next' : 'Open Scenario workspace next'}</h4>
          <p>{profileRead.currentState.nextMilestone}</p>
        </article>
      </section>
      <section className="atlas-custom-report-proof">
        <div>
          <span>Source used</span>
          <h4>{primaryDocument?.title ?? sourceDisplayName(profileRead.source)}</h4>
          <SourceTrustMini source={primaryDocument?.source ?? profileRead.source} />
        </div>
        <a href={`/generated-views?prompt=${encodeURIComponent(`Create a buyer scenario output for ${workspace.buyingGroup.name}: ${prompt}`)}&buyingGroupId=${workspace.buyingGroup.id}&mode=draft&editable=1`} rel="noreferrer" target="_blank">Open editable output <ArrowRight size={14} /></a>
      </section>
    </section>
  );
}

function publicSignalHref(title: string, source?: SourceMeta) {
  if (source?.url) return source.url;
  return `https://news.google.com/search?q=${encodeURIComponent(title)}`;
}

function RelevantMarketGapCallout({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const relevantMarket = workspace.markets
    .filter((market) => (
      market.gapToPlan >= 1_000_000 ||
      market.marginAtRisk >= profileRead.exposure.marginAtRisk * 0.8 ||
      market.pressureLevel === 'critical' ||
      market.pressureLevel === 'high'
    ))
    .sort((a, b) => b.gapToPlan - a.gapToPlan || b.marginAtRisk - a.marginAtRisk)[0];

  if (!relevantMarket) return null;

  const signal = workspace.signals.find((item) => item.affectedMarkets.includes(relevantMarket.id));
  const reason = signal
    ? `${relevantMarket.name} pressure is linked to ${signal.title.toLowerCase()}`
    : `${workspace.buyingGroup.name} is active in ${relevantMarket.name}, where the market gap can change strategy`;

  return (
    <article className="atlas-relevant-market-gap">
      <div>
        <ClosedLoopMemoryTag label="Market gap feeding buyer read" status="watch" />
        <h3>{relevantMarket.name} gap may affect the {workspace.buyingGroup.name} strategy.</h3>
        <p>{reason}</p>
        <WhyShownLine
          detail="this market gap is tied to the buyer’s active negotiation and can change the plan"
          reasons={['materiality', 'strategy', 'pattern']}
        />
      </div>
      <dl>
        <div><dt>Gap to plan</dt><dd>{euros(relevantMarket.gapToPlan)}</dd></div>
        <div><dt>Market margin risk</dt><dd>{euros(relevantMarket.marginAtRisk)}</dd></div>
        <div><dt>Buyer margin risk</dt><dd>{euros(profileRead.exposure.marginAtRisk)}</dd></div>
      </dl>
      <div>
        <SourceTrustMini source={signal?.source ?? relevantMarket.source} />
        <a href={`/markets/${relevantMarket.id}`}>Open market <ArrowRight size={13} /></a>
      </div>
    </article>
  );
}

function BuyingGroupOverviewPanel({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const exposure = profileRead.exposure;
  const latestEvent = workspace.timelineEvents[0];
  const topSignal = workspace.signals[0];
  const topCompetitorMove = workspace.competitorMoves[0];
  const buyerAskValue = Number.parseFloat(profileRead.currentState.latestBuyerAsk);
  const pepsicoPositionValue = Number.parseFloat(profileRead.currentState.pepsicoPosition);
  const askGap = Number.isFinite(buyerAskValue) && Number.isFinite(pepsicoPositionValue)
    ? `${(buyerAskValue - pepsicoPositionValue).toFixed(1)} pts`
    : 'Not modeled';
  const relevantMarket = workspace.markets
    .filter((market) => (
      market.gapToPlan >= 1_000_000 ||
      market.marginAtRisk >= exposure.marginAtRisk * 0.8 ||
      market.pressureLevel === 'critical' ||
      market.pressureLevel === 'high'
    ))
    .sort((a, b) => b.gapToPlan - a.gapToPlan || b.marginAtRisk - a.marginAtRisk)[0];
  const postureReasons = [
    {
      label: 'Buyer posture',
      source: profileRead.source,
      text: `Buyer ask is ${askGap} above PepsiCo position; defend ${profileRead.currentState.pepsicoPosition} before any concession.`
    },
    relevantMarket ? {
      label: 'Market pressure',
      source: topSignal?.source ?? relevantMarket.source,
      text: `${relevantMarket.name} has ${euros(relevantMarket.gapToPlan)} gap to plan, so local pressure may harden the buyer stance.`
    } : null,
    topCompetitorMove ? {
      label: 'Competitive pressure',
      source: topCompetitorMove.source,
      text: `${topCompetitorMove.competitor} gives the buyer leverage; prepare evidence before trading support.`
    } : latestEvent ? {
      label: 'History signal',
      source: latestEvent.source,
      text: `${latestEvent.title} is the latest memory item shaping this negotiation read.`
    } : null
  ].filter(Boolean) as Array<{ label: string; source: SourceMeta; text: string }>;

  return (
    <section className="atlas-buyer-overview-panel" aria-label={`${workspace.buyingGroup.name} overview`}>
      <section className="atlas-buyer-focus-shell">
        <header>
          <span>AI generated posture read</span>
          <h3>{workspace.buyingGroup.name} is likely to pressure affordability; hold position and bring evidence before trading support.</h3>
        </header>
        <div className="atlas-buyer-posture-reasons">
          {postureReasons.map((reason) => (
            <article key={reason.label}>
              <span>{reason.label}</span>
              <p>{reason.text}</p>
              <SourceTrustMini source={reason.source} />
            </article>
          ))}
        </div>
        <footer>
          <a href={`/buying-groups/${workspace.buyingGroup.id}`}>Open scenario workspace <ArrowRight size={13} /></a>
          <a href={`/buying-groups/${workspace.buyingGroup.id}?view=strategy`}>Review scenario memory <ArrowRight size={13} /></a>
          <a href={`/scenario-lab?buyingGroup=${workspace.buyingGroup.id}`}>Open scenario workspace <ArrowRight size={13} /></a>
        </footer>
      </section>
    </section>
  );
}

type StrategyInputStatus = 'used' | 'recommended' | 'excluded' | 'needs_review';
type BuyerStrategyWorkspaceTab = 'position' | 'stress' | 'evidence' | 'pushback' | 'output';
type ScenarioWorkspaceLevel = 'portfolio' | 'buying_group' | 'market' | 'category' | 'sku' | 'custom';
type PredictiveWorkspaceModuleId = 'recommendations' | 'lab' | 'patterns' | 'signals' | 'guardrails' | 'evidence' | 'debrief' | 'saved';
type ScenarioSkuRow = {
  id: string;
  margin: number;
  priceMove: number;
  sensitivity: string;
  sku: string;
  volumeRisk: number;
};
type ScenarioCustomLeverRow = {
  id: string;
  impact: string;
  name: string;
  status: string;
  value: string;
  weight: number;
};
type ScenarioDebriefEntry = {
  attachments: string;
  behavior: string;
  buyingGroupId?: string;
  buyerCounter: string;
  concessions: string;
  createdAt: string;
  evidenceStrengthAfter?: number;
  finalLanded: string;
  id: string;
  nextCycle: string;
  note: string;
  plannedEvidenceStrength?: number;
  plannedGuardrailRisk?: string;
  plannedLikelihood?: number;
  plannedValueProtected?: number;
  predictionAfter?: string;
  predictionBefore?: string;
  predictionImpact: string;
  scenarioId?: string;
  selectedScenarioLabel?: string;
};
type SavedScenarioMemoryEntry = {
  actualOutcome?: string;
  atlasScore: number;
  evidenceStrength: number;
  guardrailRisk: string;
  id: string;
  label: string;
  likelihood: number;
  predictionImpact: string;
  savedAt: string;
  supersededByDebriefId?: string;
  valueProtected: number;
};
type PredictiveWorkspaceSavedView = {
  createdAt: string;
  hiddenModules: PredictiveWorkspaceModuleId[];
  id: string;
  label: string;
  pinnedModules: PredictiveWorkspaceModuleId[];
  selectedLevel: ScenarioWorkspaceLevel;
  selectedScenarioId: string;
};

const scenarioWorkspaceModules: Array<{ id: PredictiveWorkspaceModuleId; label: string }> = [
  { id: 'recommendations', label: 'Recommended scenarios' },
  { id: 'lab', label: 'Predictive scenario lab' },
  { id: 'patterns', label: 'Historical pattern insights' },
  { id: 'signals', label: 'Market and external signals' },
  { id: 'guardrails', label: 'Finance guardrails' },
  { id: 'evidence', label: 'Evidence and source trail' },
  { id: 'debrief', label: 'Debrief memory' },
  { id: 'saved', label: 'Saved scenario outputs' }
];

const SCENARIO_DEBRIEF_STORAGE_KEY = 'atlas-scenario-debriefs';

function readScenarioDebriefMemory(buyingGroupId?: string): ScenarioDebriefEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SCENARIO_DEBRIEF_STORAGE_KEY) ?? '[]');
    const entries = Array.isArray(parsed) ? parsed as ScenarioDebriefEntry[] : [];
    return buyingGroupId ? entries.filter((entry) => entry.buyingGroupId === buyingGroupId) : entries;
  } catch {
    return [];
  }
}

function writeScenarioDebriefMemory(entry: ScenarioDebriefEntry) {
  if (typeof window === 'undefined') return;
  const entries = readScenarioDebriefMemory();
  const nextEntries = [entry, ...entries.filter((item) => item.id !== entry.id)].slice(0, 80);
  window.localStorage.setItem(SCENARIO_DEBRIEF_STORAGE_KEY, JSON.stringify(nextEntries));
  window.dispatchEvent(new Event('storage'));
}

function parseProfilePercent(value?: string) {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildInlineStrategyTest(
  workspace: BuyingGroupWorkspacePacket,
  profileRead: BuyerProfileRead,
  strategyPlan: ReturnType<typeof buildNegotiationPlanPacket>,
  overrides?: {
    fallbackPercent: number;
    ingoingAskPercent: number;
    redLinePercent: number;
    targetPercent: number;
  }
) {
  const exposure = workspace.buyingGroup.financialExposure;
  const buyerAsk = parseProfilePercent(profileRead.currentState.latestBuyerAsk);
  const pepsicoPosition = overrides?.ingoingAskPercent ?? strategyPlan?.ingoingAskPercent ?? parseProfilePercent(profileRead.currentState.pepsicoPosition);
  const target = overrides?.targetPercent ?? strategyPlan?.targetPercent ?? parseProfilePercent(profileRead.currentState.target);
  const fallback = overrides?.fallbackPercent ?? strategyPlan?.fallbackPercent ?? Math.max(0, target - 0.4);
  const redLine = overrides?.redLinePercent ?? strategyPlan?.redLinePercent ?? parseProfilePercent(profileRead.currentState.redLine);
  const askGap = Math.max(0, buyerAsk - pepsicoPosition);
  const realizationGap = Math.max(0, exposure.targetPriceRealization - exposure.expectedPriceRealization);
  const evidenceBonus = Math.min(8, Math.round((workspace.documents.length + workspace.timelineEvents.length) / 2));
  const likelihood = Math.max(34, Math.min(86, Math.round(78 - askGap * 7 - riskRank(workspace.buyingGroup.riskLevel) * 5 + evidenceBonus)));
  const scenarioInputs = scenarioInputsForBuyingGroup(workspace.buyingGroup);
  const scenarioOutputs = calculateScenarioOutputs({
    ...scenarioInputs,
    priceIncreasePercent: pepsicoPosition,
    expectedRealizationPercent: target,
    concessionAmount: Math.round(exposure.tradeSpendExposure * 0.14),
    buyerAcceptanceProbability: likelihood
  }, exposure.revenueUnderNegotiation);
  const guardrailRisk = fallback <= redLine + 0.1
    ? 'High'
    : fallback <= redLine + 0.35
      ? 'Watch'
      : 'Inside corridor';
  const primarySignal = workspace.signals[0];
  const primaryHistory = workspace.timelineEvents[0];
  const recommendedEdits = [
    fallback < redLine + 0.25
      ? `Raise fallback to ${(redLine + 0.3).toFixed(1)}% before modeling concessions; current fallback is too close to the red line.`
      : `Keep fallback at ${fallback.toFixed(1)}% and only trade support for volume or execution commitments.`,
    primaryHistory
      ? `Use ${primaryHistory.title.toLowerCase()} before leading with concessions.`
      : 'Add prior-year concession evidence before leading with this ask.',
    primarySignal
      ? `Use ${primarySignal.affectedMarkets[0] ?? 'market'} signal only when the buyer challenges affordability or volume.`
      : 'Do not introduce external pressure unless the buyer challenges the category value story.'
  ];

  return {
    askGap,
    buyerAsk,
    expectedBuyerResponse: likelihood < 55
      ? 'Buyer likely pushes for trade support before accepting the price corridor.'
      : 'Buyer may challenge the evidence, but the strategy can stay inside the corridor when the source trail is ready.',
    guardrailRisk,
    leveragePoints: [
      `${euros(exposure.marginAtRisk)} margin at risk`,
      `${pct(realizationGap)} realization gap`,
      primarySignal ? `${primarySignal.affectedMarkets[0] ?? 'Market'} signal pressure` : 'history-led concession risk'
    ],
    likelihood,
    pepsicoPosition,
    recommendedEdits,
    scenarioOutputs
  };
}

function StrategyStatusPill({ status }: { status: StrategyInputStatus }) {
  const label = status === 'used'
    ? 'Used in scenario'
    : status === 'excluded'
      ? 'Excluded'
      : status === 'needs_review'
        ? 'Needs review'
        : 'ATLAS recommended';
  return <span className={`atlas-strategy-status-pill status-${status}`}>{label}</span>;
}

function StrategyPricingCorridor({
  buyerAsk,
  fallback,
  ingoingAsk,
  redLine,
  target
}: {
  buyerAsk: number;
  fallback: number;
  ingoingAsk: number;
  redLine: number;
  target: number;
}) {
  const values = [buyerAsk, ingoingAsk, target, fallback, redLine].filter(Number.isFinite);
  const min = Math.max(0, Math.min(...values) - 0.4);
  const max = Math.max(...values) + 0.5;
  const position = (value: number) => `${Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}%`;
  const markers = [
    { label: 'Buyer ask', value: buyerAsk, tone: 'buyer' },
    { label: 'PepsiCo ask', value: ingoingAsk, tone: 'ask' },
    { label: 'Target', value: target, tone: 'target' },
    { label: 'Fallback', value: fallback, tone: 'fallback' },
    { label: 'Red line', value: redLine, tone: 'red' }
  ];

  return (
    <article className="atlas-strategy-corridor-card">
      <header>
        <span>Pricing corridor</span>
        <strong>{ingoingAsk.toFixed(1)}% ask sits {Math.abs(ingoingAsk - target).toFixed(1)} pts from target.</strong>
      </header>
      <div className="atlas-strategy-corridor-track" aria-label="Pricing corridor from buyer ask to red line">
        {markers.map((marker) => (
          <span className={`atlas-strategy-corridor-marker tone-${marker.tone}`} key={marker.label} style={{ left: position(marker.value) }}>
            <i />
            <em>{marker.label}</em>
            <b>{marker.value.toFixed(1)}%</b>
          </span>
        ))}
      </div>
    </article>
  );
}

function StrategyInputInbox({
  savedViews,
  statuses,
  workspace
}: {
  savedViews: StoredGeneratedView[];
  statuses: Record<string, StrategyInputStatus>;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const sourceGap = workspace.readiness.reasons[0]
    ?? (workspace.readiness.staleSourceCount ? `${workspace.readiness.staleSourceCount} stale sources` : null)
    ?? (workspace.readiness.missingDocCount ? `${workspace.readiness.missingDocCount} missing documents` : null);
  const items = [
    {
      id: 'market-gap',
      label: 'Market gap',
      metric: workspace.markets[0] ? `${workspace.markets[0].name} pressure` : 'Market pressure',
      note: `${euros(workspace.buyingGroup.financialExposure.marginAtRisk)} margin risk affects the price corridor.`,
      status: statuses['market-gap'] ?? 'recommended'
    },
    {
      id: 'saved-scenario',
      label: 'Saved scenario',
      metric: workspace.scenarioModels[0]?.name ?? 'No saved scenario yet',
      note: workspace.scenarioModels[0]?.outputs.recommendation ?? 'Model the current ask before changing fallback.',
      status: statuses['saved-scenario'] ?? (workspace.scenarioModels[0] ? 'used' : 'needs_review')
    },
    {
      id: 'history',
      label: 'Negotiation history',
      metric: workspace.timelineEvents[0]?.title ?? 'No history event',
      note: workspace.timelineEvents[0]?.summary ?? 'Add prior-year debrief before trusting this scenario.',
      status: statuses.history ?? (workspace.timelineEvents[0] ? 'used' : 'needs_review')
    },
    {
      id: 'external-signal',
      label: 'External signal',
      metric: workspace.signals[0]?.title ?? 'No active signal',
      note: workspace.signals[0]?.negotiationImplication ?? 'Only use external signals when they change the buyer response.',
      status: statuses['external-signal'] ?? (workspace.signals[0] ? 'recommended' : 'excluded')
    },
    {
      id: 'generated-report',
      label: 'Scenario output',
      metric: savedViews[0]?.title ?? 'No saved output',
      note: savedViews[0] ? 'Available as scenario evidence and buyer memory.' : 'Create only if it will support the ask or pushback response.',
      status: statuses['generated-report'] ?? (savedViews[0] ? 'recommended' : 'excluded')
    },
    {
      id: 'source-gap',
      label: 'Source gap',
      metric: sourceGap ?? 'No open source gap',
      note: sourceGap ? 'Resolve or mark as not relevant before using this scenario.' : 'Current scenario has enough source coverage for draft review.',
      status: statuses['source-gap'] ?? (sourceGap ? 'needs_review' : 'used')
    }
  ];

  return (
    <section className="atlas-strategy-input-inbox" aria-label="Scenario input inbox">
      <header>
        <span>Scenario input inbox</span>
        <h3>Everything here feeds the buyer scenario, or gets explicitly excluded.</h3>
      </header>
      <div>
        {items.map((item) => (
          <article key={item.id}>
            <span>{item.label}</span>
            <strong>{item.metric}</strong>
            <p>{item.note}</p>
            <StrategyStatusPill status={item.status} />
          </article>
        ))}
      </div>
    </section>
  );
}

function BuyerPredictiveScenarioWorkspace({
  profileRead,
  savedViews,
  scenarioAlerts = [],
  workspace
}: {
  profileRead: BuyerProfileRead;
  savedViews: StoredGeneratedView[];
  scenarioAlerts?: AtlasActiveAlert[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const defaultInputs = useMemo(() => scenarioInputsForBuyingGroup(workspace.buyingGroup), [workspace.buyingGroup]);
  const [inputs, setInputs] = useState<ScenarioInputs>(defaultInputs);
  const [selectedLevel, setSelectedLevel] = useState<ScenarioWorkspaceLevel>('buying_group');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [hiddenModules, setHiddenModules] = useState<PredictiveWorkspaceModuleId[]>(['recommendations', 'signals', 'guardrails', 'saved']);
  const [pinnedModules, setPinnedModules] = useState<PredictiveWorkspaceModuleId[]>(['lab', 'patterns', 'evidence', 'debrief']);
  const [irrelevantModules, setIrrelevantModules] = useState<PredictiveWorkspaceModuleId[]>([]);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [workspaceSavedViews, setWorkspaceSavedViews] = useState<PredictiveWorkspaceSavedView[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [savedScenarioIds, setSavedScenarioIds] = useState<string[]>(workspace.scenarioModels.map((scenario) => scenario.id));
  const [savedScenarioMemory, setSavedScenarioMemory] = useState<SavedScenarioMemoryEntry[]>([]);
  const [evidenceStatuses, setEvidenceStatuses] = useState<Record<string, StrategyInputStatus>>({});
  const [strategyStatus, setStrategyStatus] = useState('');
  const [workspaceStatus, setWorkspaceStatus] = useState('');
  const [debriefStatus, setDebriefStatus] = useState('');
  const [quickDebriefOpen, setQuickDebriefOpen] = useState(false);
  const [debriefText, setDebriefText] = useState('');
  const [debriefBuyerCounter, setDebriefBuyerCounter] = useState('');
  const [debriefFinalLanded, setDebriefFinalLanded] = useState('');
  const [debriefConcessions, setDebriefConcessions] = useState('');
  const [debriefBehavior, setDebriefBehavior] = useState('Price challenged with affordability pressure');
  const [debriefNextCycle, setDebriefNextCycle] = useState('');
  const [debriefAttachments, setDebriefAttachments] = useState('');
  const [debriefEntries, setDebriefEntries] = useState<ScenarioDebriefEntry[]>([]);
  const [skuRows, setSkuRows] = useState<ScenarioSkuRow[]>([
    { id: 'sku-family-share', sku: 'Core multipack family', priceMove: defaultInputs.priceIncreasePercent, volumeRisk: Math.abs(defaultInputs.volumeChangePercent), margin: 31.4, sensitivity: 'Medium' },
    { id: 'sku-promo-pack', sku: 'Promo pack architecture', priceMove: Math.max(0.5, defaultInputs.priceIncreasePercent - 0.4), volumeRisk: Math.abs(defaultInputs.volumeChangePercent) + 0.6, margin: 27.8, sensitivity: 'High' }
  ]);
  const [customLevers, setCustomLevers] = useState<ScenarioCustomLeverRow[]>([
    { id: 'terms', name: 'Payment terms flexibility', value: '30 days', impact: 'Protects cash exposure', status: 'Assumption', weight: 4 },
    { id: 'service', name: 'Service commitment', value: 'Priority replenishment', impact: 'Improves buyer acceptance', status: 'User-added', weight: 3 }
  ]);
  const exposure = workspace.buyingGroup.financialExposure;
  const latestHistory = workspace.timelineEvents[0];
  const topSignal = workspace.signals[0];
  const financeSource = workspace.documents.find((document) => /finance|nrm|guardrail|pricing/i.test(document.title))?.source ?? profileRead.source;
  const historySource = latestHistory?.source ?? workspace.buyingGroup.source;
  const signalSource = topSignal?.source ?? workspace.markets[0]?.source ?? workspace.buyingGroup.source;
  const latestDebrief = debriefEntries[0];

  useEffect(() => {
    setInputs(defaultInputs);
  }, [defaultInputs]);

  useEffect(() => {
    setDebriefEntries(readScenarioDebriefMemory(workspace.buyingGroup.id));
  }, [workspace.buyingGroup.id]);

  function updateInput<K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
    setSelectedScenarioId('custom');
  }

  function inputsForLevel(level: ScenarioWorkspaceLevel): ScenarioInputs {
    if (level === 'market') {
      return scenarioInputsForMarket(workspace.markets[0]);
    }
    if (level === 'category') {
      return {
        ...defaultInputs,
        concessionAmount: Math.round(defaultInputs.concessionAmount * 1.08),
        costInflationPercent: Math.min(7, defaultInputs.costInflationPercent + 0.8),
        expectedRealizationPercent: Math.max(0.5, defaultInputs.expectedRealizationPercent - 0.2),
        tradeSpendChange: Math.round(defaultInputs.tradeSpendChange * 1.18),
        volumeChangePercent: defaultInputs.volumeChangePercent - 0.4
      };
    }
    if (level === 'sku') {
      const averagePriceMove = skuRows.reduce((sum, row) => sum + row.priceMove, 0) / Math.max(1, skuRows.length);
      const averageVolumeRisk = skuRows.reduce((sum, row) => sum + row.volumeRisk, 0) / Math.max(1, skuRows.length);
      const highSensitivityRows = skuRows.filter((row) => row.sensitivity.toLowerCase().includes('high')).length;
      return {
        ...defaultInputs,
        buyerAcceptanceProbability: Math.max(25, defaultInputs.buyerAcceptanceProbability - highSensitivityRows * 4),
        expectedRealizationPercent: Math.max(0.5, averagePriceMove - 0.35),
        priceIncreasePercent: averagePriceMove,
        volumeChangePercent: -Math.abs(averageVolumeRisk)
      };
    }
    if (level === 'custom') {
      const leverWeight = customLevers.reduce((sum, lever) => sum + lever.weight, 0);
      return {
        ...inputs,
        buyerAcceptanceProbability: Math.max(20, Math.min(95, inputs.buyerAcceptanceProbability + Math.round(leverWeight / 3))),
        concessionAmount: Math.max(0, Math.round(inputs.concessionAmount + leverWeight * 18000)),
        tradeSpendChange: Math.max(0, Math.round(inputs.tradeSpendChange + leverWeight * 22000))
      };
    }
    return defaultInputs;
  }

  function selectScenarioLevel(level: ScenarioWorkspaceLevel) {
    setSelectedLevel(level);
    setInputs(inputsForLevel(level));
    setSelectedScenarioId(level === 'buying_group' ? 'recommended' : 'custom');
  }

  function scenarioCandidate(id: string, label: string, description: string, baseInputs: ScenarioInputs, why: string, source: SourceMeta) {
    const outputs = calculateScenarioOutputs(baseInputs, exposure.revenueUnderNegotiation);
    const likelihood = Math.max(1, Math.min(99, Math.round(baseInputs.buyerAcceptanceProbability)));
    const guardrailRisk = baseInputs.expectedRealizationPercent < profileRead.exposure.expectedPriceRealization
      ? 'Breach risk'
      : baseInputs.expectedRealizationPercent < profileRead.exposure.targetPriceRealization - 0.4
        ? 'Watch'
        : 'Inside guardrail';
    const relationshipRisk = baseInputs.priceIncreasePercent > defaultInputs.priceIncreasePercent + 0.5 || baseInputs.volumeChangePercent < defaultInputs.volumeChangePercent - 0.8
      ? 'High'
      : baseInputs.priceIncreasePercent < defaultInputs.priceIncreasePercent - 0.4
        ? 'Low'
        : 'Medium';
    const debriefMemoryBoost = debriefEntries.length * 6;
    const evidenceStrength = Math.min(96, 58 + workspace.timelineEvents.length * 5 + workspace.documents.length * 4 + debriefMemoryBoost);
    const guardrailScore = guardrailRisk === 'Inside guardrail' ? 18 : guardrailRisk === 'Watch' ? 6 : -16;
    const relationshipScore = relationshipRisk === 'Low' ? 12 : relationshipRisk === 'Medium' ? 4 : -12;
    const normalizedValue = Math.max(0, Math.min(100, outputs.riskAdjustedValue / Math.max(1, exposure.marginAtRisk) * 100));
    const baseAtlasScore = Math.round(likelihood * 0.32 + normalizedValue * 0.26 + evidenceStrength * 0.22 + guardrailScore + relationshipScore);
    const confidence = source.confidence;
    const likelyCounter = Math.max(0.4, baseInputs.priceIncreasePercent - (relationshipRisk === 'High' ? 0.8 : relationshipRisk === 'Medium' ? 0.5 : 0.3));
    const debriefCounter = latestDebrief?.buyerCounter ? parseProfilePercent(latestDebrief.buyerCounter) : 0;
    const debriefLanded = latestDebrief?.finalLanded ? parseProfilePercent(latestDebrief.finalLanded) : 0;
    const landedAlignment = latestDebrief && debriefLanded
      ? Math.max(-6, Math.round(8 - Math.abs(baseInputs.expectedRealizationPercent - debriefLanded) * 8))
      : 0;
    const counterAlignment = latestDebrief && debriefCounter
      ? Math.max(-4, Math.round(5 - Math.abs(likelyCounter - debriefCounter) * 6))
      : 0;
    const behaviorPenalty = latestDebrief && id === 'aggressive' && /affordability|delayed|countered|support|escalated/i.test(latestDebrief.behavior)
      ? -8
      : 0;
    const behaviorBoost = latestDebrief && id === 'buyer-counter'
      ? 6
      : latestDebrief && id === 'conservative' && /affordability|support|countered/i.test(latestDebrief.behavior)
        ? 4
        : 0;
    const memoryAdjustment = latestDebrief
      ? Math.max(-12, Math.min(14, landedAlignment + counterAlignment + behaviorBoost + behaviorPenalty))
      : 0;
    const atlasScore = Math.max(1, Math.min(100, baseAtlasScore + memoryAdjustment));
    const buyerResponse = latestDebrief
      ? `Updated from debrief: likely to counter near ${latestDebrief.buyerCounter || `${likelyCounter.toFixed(1)}%`} and repeat "${latestDebrief.behavior}".`
      : likelihood >= 72
        ? `Likely to challenge the evidence, then land near ${likelyCounter.toFixed(1)}%.`
        : likelihood >= 55
          ? `Likely to counter near ${likelyCounter.toFixed(1)}% and ask for trade support.`
          : `Likely to resist the ask and use affordability or volume risk as leverage.`;
    const expectedObjection = latestDebrief?.behavior
      ? latestDebrief.behavior
      : relationshipRisk === 'High'
      ? 'Price move is too high for current shopper and volume conditions.'
      : guardrailRisk === 'Breach risk'
        ? 'PepsiCo fallback may be too weak to defend internally.'
        : 'Buyer will ask why this move is needed now.';
    const recommendedResponse = latestDebrief?.nextCycle
      ? latestDebrief.nextCycle
      : guardrailRisk === 'Breach risk'
      ? 'Raise the landed realization before using this scenario.'
      : evidenceStrength < 75
        ? 'Attach prior-year outcome and Finance guardrail evidence before taking this into the room.'
        : 'Lead with margin impact, then use buyer history if the buyer pushes for concessions.';
    const memoryReason = latestDebrief
      ? `${memoryAdjustment >= 0 ? '+' : ''}${memoryAdjustment} memory adjustment from latest debrief.`
      : 'No debrief adjustment yet.';
    const rankReason = `${atlasScore}/100 score from landing likelihood, value protected, guardrail fit, evidence strength, relationship risk, and buyer memory. ${memoryReason}`;

    return {
      atlasScore,
      buyerResponse,
      confidence,
      description,
      evidenceStrength,
      expectedObjection,
      guardrailRisk,
      id,
      label,
      likelihood,
      memoryAdjustment,
      memoryReason,
      outputs,
      rankReason,
      recommendedResponse,
      relationshipRisk,
      source,
      valueProtected: outputs.riskAdjustedValue,
      why
    };
  }

  const activeScenarioInputs = useMemo(() => inputsForLevel(selectedLevel), [customLevers, defaultInputs, inputs, selectedLevel, skuRows, workspace.markets]);
  const generatedScenarios = useMemo(() => {
    const recommended = scenarioCandidate(
      'recommended',
      'ATLAS recommended',
      'Balanced ask that protects the target corridor while leaving room for a controlled counter.',
      defaultInputs,
      `Uses ${workspace.buyingGroup.name} history, ${workspace.markets[0]?.name ?? 'market'} pressure, and Finance guardrails as the default case.`,
      financeSource
    );
    const conservativeInputs: ScenarioInputs = {
      ...defaultInputs,
      buyerAcceptanceProbability: Math.min(92, defaultInputs.buyerAcceptanceProbability + 12),
      concessionAmount: Math.round(defaultInputs.concessionAmount * 1.12),
      expectedRealizationPercent: Math.max(0.5, defaultInputs.expectedRealizationPercent - 0.3),
      priceIncreasePercent: Math.max(0.8, defaultInputs.priceIncreasePercent - 0.4),
      tradeSpendChange: Math.round(defaultInputs.tradeSpendChange * 1.08),
      volumeChangePercent: Math.min(1.5, defaultInputs.volumeChangePercent + 0.7)
    };
    const aggressiveInputs: ScenarioInputs = {
      ...defaultInputs,
      buyerAcceptanceProbability: Math.max(30, defaultInputs.buyerAcceptanceProbability - 14),
      concessionAmount: Math.round(defaultInputs.concessionAmount * 0.78),
      expectedRealizationPercent: defaultInputs.expectedRealizationPercent + 0.4,
      priceIncreasePercent: defaultInputs.priceIncreasePercent + 0.7,
      tradeSpendChange: Math.round(defaultInputs.tradeSpendChange * 0.82),
      volumeChangePercent: defaultInputs.volumeChangePercent - 0.9
    };
    const buyerCounterInputs: ScenarioInputs = {
      ...defaultInputs,
      buyerAcceptanceProbability: Math.max(35, defaultInputs.buyerAcceptanceProbability - 8),
      concessionAmount: Math.round(defaultInputs.concessionAmount * 1.35),
      expectedRealizationPercent: Math.max(0.5, defaultInputs.expectedRealizationPercent - 0.6),
      priceIncreasePercent: Math.max(0.8, defaultInputs.priceIncreasePercent - 0.7),
      tradeSpendChange: Math.round(defaultInputs.tradeSpendChange * 1.25),
      volumeChangePercent: defaultInputs.volumeChangePercent - 0.2
    };

    return [
      recommended,
      scenarioCandidate('conservative', 'Conservative', 'Higher landing odds, lower protected value, more trade support required.', conservativeInputs, 'Use if the buyer prioritizes affordability or category volume risk.', profileRead.source),
      scenarioCandidate('aggressive', 'Aggressive', 'Stronger value protection with higher buyer pushback and relationship risk.', aggressiveInputs, 'Use only if Finance needs stronger recovery and evidence is ready.', financeSource),
      scenarioCandidate('buyer-counter', 'Likely buyer counter', 'Simulates the first counter ATLAS expects from prior behavior and market pressure.', buyerCounterInputs, latestHistory ? `Based on ${latestHistory.title.toLowerCase()} and prior concession memory.` : 'Based on historical buyer response patterns.', historySource),
      scenarioCandidate('custom', 'My adjusted scenario', 'Manual case based on the current levers in the scenario lab.', activeScenarioInputs, 'Updates as the CNO changes assumptions, scenario level, SKU rows, and custom levers.', workspace.buyingGroup.source)
    ];
  }, [activeScenarioInputs, debriefEntries, defaultInputs, exposure.revenueUnderNegotiation, financeSource, historySource, latestDebrief, latestHistory, profileRead.source, workspace.buyingGroup.name, workspace.buyingGroup.source, workspace.markets]);

  const rankedScenarios = useMemo(() => [...generatedScenarios].sort((a, b) => b.atlasScore - a.atlasScore), [generatedScenarios]);
  const topAtlasScenario = rankedScenarios[0] ?? generatedScenarios[0];
  const selectedScenario = generatedScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? generatedScenarios[0];
  const recommendedScenario = generatedScenarios.find((scenario) => scenario.id === 'recommended') ?? generatedScenarios[0];
  const cockpitComparisonScenarios = ['recommended', 'custom', 'buyer-counter']
    .map((scenarioId) => generatedScenarios.find((scenario) => scenario.id === scenarioId))
    .filter((scenario): scenario is NonNullable<typeof scenario> => Boolean(scenario));
  const comparisonRoleLabel: Record<string, string> = {
    'buyer-counter': 'Expected buyer move',
    custom: 'Your current test',
    recommended: 'Default starting point'
  };
  const predictionBasisRows = [
    {
      impact: latestDebrief
        ? `Moves buyer response toward ${latestDebrief.buyerCounter || 'the captured counter'} and uses "${latestDebrief.behavior}".`
        : selectedScenario.id === 'buyer-counter'
          ? 'Anchors the expected counter and likely objection.'
          : 'Sets the buyer behavior pattern ATLAS expects in the room.',
      label: 'Buyer memory',
      source: historySource,
      value: latestDebrief ? `Debrief: landed ${latestDebrief.finalLanded || 'outcome captured'}` : latestHistory?.title ?? 'No recent debrief'
    },
    {
      impact: selectedScenario.relationshipRisk === 'High'
        ? 'Raises relationship risk and lowers landing confidence.'
        : selectedScenario.likelihood >= recommendedScenario.likelihood
          ? 'Supports the current landing odds.'
          : 'Creates pressure ATLAS expects the buyer to use.',
      label: 'Market signal',
      source: signalSource,
      value: topSignal?.title ?? workspace.markets[0]?.name ?? 'No active signal'
    },
    {
      impact: selectedScenario.guardrailRisk === 'Breach risk'
        ? 'Flags this move as below the finance guardrail.'
        : selectedScenario.guardrailRisk === 'Watch'
          ? 'Keeps the move under watch against target realization.'
          : 'Keeps the move inside the target corridor.',
      label: 'Finance guardrail',
      source: financeSource,
      value: `${pct(exposure.targetPriceRealization)} target realization`
    }
  ];
  const scenarioDeltaRows = [
    {
      label: 'Likelihood to land',
      value: `${selectedScenario.likelihood - recommendedScenario.likelihood >= 0 ? '+' : ''}${selectedScenario.likelihood - recommendedScenario.likelihood} pts`,
      story: selectedScenario.likelihood >= recommendedScenario.likelihood ? 'More likely than the default recommendation.' : 'Lower landing odds than the default recommendation.'
    },
    {
      label: 'Risk-adjusted value',
      value: euros(selectedScenario.valueProtected - recommendedScenario.valueProtected),
      story: selectedScenario.valueProtected >= recommendedScenario.valueProtected ? 'Protects more value than the default.' : 'Trades value for acceptance or flexibility.'
    },
    {
      label: 'Trade spend',
      value: euros(selectedScenario.outputs.tradeSpendImpact - recommendedScenario.outputs.tradeSpendImpact),
      story: selectedScenario.outputs.tradeSpendImpact > recommendedScenario.outputs.tradeSpendImpact ? 'Requires more trade support.' : 'Uses less trade support than the default.'
    },
    {
      label: 'Volume impact',
      value: euros(selectedScenario.outputs.volumeImpact - recommendedScenario.outputs.volumeImpact),
      story: selectedScenario.outputs.volumeImpact >= recommendedScenario.outputs.volumeImpact ? 'Reduces downside volume pressure.' : 'Creates more volume risk.'
    }
  ];
  const levelContextRows = selectedLevel === 'market'
    ? [
      ['Market context', workspace.markets[0]?.name ?? 'Selected market'],
      ['Pressure modeled', inputs.competitorPressureLevel],
      ['Source', sourceDisplayName(signalSource)]
    ]
    : selectedLevel === 'category'
      ? [
        ['Category pressure', `${activeScenarioInputs.costInflationPercent.toFixed(1)}% cost inflation`],
        ['Mix impact', `${activeScenarioInputs.volumeChangePercent.toFixed(1)}% modeled movement`],
        ['Trade response', euros(activeScenarioInputs.tradeSpendChange)]
      ]
      : selectedLevel === 'sku'
        ? [
          ['SKU rows', `${skuRows.length}`],
          ['Avg price move', `${activeScenarioInputs.priceIncreasePercent.toFixed(1)}%`],
          ['Avg volume risk', `${Math.abs(activeScenarioInputs.volumeChangePercent).toFixed(1)}%`]
        ]
        : selectedLevel === 'custom'
          ? [
            ['Custom levers', `${customLevers.length}`],
            ['Total weight', `${customLevers.reduce((sum, lever) => sum + lever.weight, 0)}`],
            ['Status', 'User-modeled assumption']
          ]
          : [
            ['Buyer context', workspace.buyingGroup.name],
            ['Default ask', `${defaultInputs.priceIncreasePercent.toFixed(1)}%`],
            ['History source', sourceDisplayName(historySource)]
          ];
  const scenarioReportPrompt = `Create a scenario evidence output for ${workspace.buyingGroup.name}: ${selectedScenario.label}. Include assumptions, predicted buyer response, source trail, and recommended next move.`;
  const visibleModules = scenarioWorkspaceModules
    .filter((module) => !hiddenModules.includes(module.id))
    .sort((a, b) => Number(pinnedModules.includes(b.id)) - Number(pinnedModules.includes(a.id)));
  const levels: Array<{ id: ScenarioWorkspaceLevel; label: string }> = [
    { id: 'buying_group', label: 'Buying group' },
    { id: 'market', label: 'Market' },
    { id: 'category', label: 'Category' },
    { id: 'sku', label: 'SKU drill-in' },
    { id: 'custom', label: 'Custom lever' }
  ];
  const labControls: Array<{ key: keyof ScenarioInputs; label: string; max: number; min: number; step: number; suffix: string }> = [
    { key: 'priceIncreasePercent', label: 'Proposed price move', min: 0, max: 6, step: 0.1, suffix: '%' },
    { key: 'expectedRealizationPercent', label: 'Expected landed realization', min: 0, max: 5, step: 0.1, suffix: '%' },
    { key: 'volumeChangePercent', label: 'Modeled volume movement', min: -8, max: 4, step: 0.1, suffix: '%' },
    { key: 'tradeSpendChange', label: 'Trade spend change', min: 0, max: Math.max(2_500_000, Math.ceil(defaultInputs.tradeSpendChange * 1.5)), step: 25000, suffix: 'EUR' },
    { key: 'concessionAmount', label: 'Concession envelope', min: 0, max: Math.max(2_000_000, Math.ceil(defaultInputs.concessionAmount * 1.5)), step: 25000, suffix: 'EUR' },
    { key: 'buyerAcceptanceProbability', label: 'Buyer acceptance probability', min: 20, max: 95, step: 1, suffix: '%' }
  ];
  const formatLabControlValue = (suffix: string, value: number) => suffix === 'EUR'
    ? euros(value)
    : `${value.toFixed(suffix === '%' ? 1 : 0)}${suffix}`;
  const cockpitQuickControls = labControls.filter(({ key }) => (
    key === 'priceIncreasePercent'
    || key === 'expectedRealizationPercent'
    || key === 'buyerAcceptanceProbability'
    || key === 'tradeSpendChange'
  ));
  const labControlGroups = [
    {
      controls: labControls.slice(0, 2),
      subtitle: 'What PepsiCo asks for and what is expected to land.',
      title: 'Price and landing'
    },
    {
      controls: labControls.slice(2),
      subtitle: 'The assumptions that change buyer response and P&L impact.',
      title: 'Commercial assumptions'
    }
  ];
  const historicalInsights = [
    latestDebrief ? {
      changes: latestDebrief.predictionImpact,
      id: latestDebrief.id,
      source: historySource,
      story: `Latest debrief says buyer countered at ${latestDebrief.buyerCounter || 'an updated counter'} and landed at ${latestDebrief.finalLanded || 'a new outcome'}.`
    } : null,
    {
      changes: 'Build a counter case before using concessions.',
      id: 'counter-gap',
      source: historySource,
      story: `${workspace.buyingGroup.name} usually counters about 0.5 pts below the first PepsiCo offer.`
    },
    {
      changes: 'Expect a longer cycle if evidence is not shown early.',
      id: 'round-count',
      source: historySource,
      story: 'Prior rounds show buyer movement typically happens after 3 to 4 exchanges.'
    },
    {
      changes: 'Keep affordability evidence ready, but do not lead with it.',
      id: 'signal-use',
      source: signalSource,
      story: topSignal ? `${topSignal.title} may be used by the buyer to challenge the price move.` : 'External pressure should only be used when it changes buyer response.'
    }
  ].filter((insight): insight is { changes: string; id: string; source: SourceMeta; story: string } => Boolean(insight))
    .filter((insight) => !dismissedInsights.includes(insight.id));
  const evidenceRows = [
    {
      claim: 'Proposed price move',
      id: 'price-move-evidence',
      proof: `${inputs.priceIncreasePercent.toFixed(1)}% ask`,
      source: financeSource,
      use: 'Supports starting position',
      whatItChanges: 'Raises or lowers the opening ask and guardrail risk.'
    },
    {
      claim: 'Expected buyer counter',
      id: 'buyer-counter-evidence',
      proof: generatedScenarios.find((scenario) => scenario.id === 'buyer-counter')?.outputs.priceRealizationImpact ? pct(Math.max(0.4, inputs.expectedRealizationPercent - 0.6)) : 'Counter case',
      source: historySource,
      use: 'Prepares response path',
      whatItChanges: 'Anchors the buyer-counter scenario and likely objection.'
    },
    {
      claim: 'Margin protection',
      id: 'margin-protection-evidence',
      proof: euros(selectedScenario.outputs.marginImpact),
      source: profileRead.source,
      use: 'Shows financial consequence',
      whatItChanges: 'Changes value protected, GM impact, and recommended next move.'
    },
    {
      claim: 'Market pressure',
      id: 'market-pressure-evidence',
      proof: topSignal?.title ?? workspace.markets[0]?.name ?? 'Current market',
      source: signalSource,
      use: 'Explains why scenario matters now',
      whatItChanges: 'Changes when to introduce external evidence in the room.'
    }
  ];
  const includedEvidenceRows = evidenceRows.filter((row) => evidenceStatuses[row.id] !== 'excluded');
  const reviewEvidenceRows = evidenceRows.filter((row) => evidenceStatuses[row.id] === 'needs_review');
  const excludedEvidenceRows = evidenceRows.filter((row) => evidenceStatuses[row.id] === 'excluded');
  const workspaceScenarioReportParams = new URLSearchParams({
    atlasScore: String(selectedScenario.atlasScore),
    buyerResponse: selectedScenario.buyerResponse,
    customLeverCount: String(customLevers.length),
    editable: '1',
    evidenceStrength: String(selectedScenario.evidenceStrength),
    gmImpact: String(selectedScenario.outputs.marginImpact),
    guardrailRisk: selectedScenario.guardrailRisk,
    likelihood: String(selectedScenario.likelihood),
    mode: 'draft',
    nrImpact: String(selectedScenario.outputs.revenueImpact),
    prompt: scenarioReportPrompt,
    recommendedEdit: selectedScenario.recommendedResponse,
    relationshipRisk: selectedScenario.relationshipRisk,
    reportType: 'scenario_evidence',
    riskAdjustedValue: String(selectedScenario.valueProtected),
    scenarioLevel: selectedLevel,
    scenarioName: selectedScenario.label,
    skuCount: String(skuRows.length),
    topRecommendedMemoryAdjustment: String(topAtlasScenario.memoryAdjustment),
    topRecommendedReason: topAtlasScenario.rankReason,
    topRecommendedScenario: topAtlasScenario.label,
    topRecommendedScore: String(topAtlasScenario.atlasScore),
    tradeImpact: String(selectedScenario.outputs.tradeSpendImpact),
    volumeImpact: String(selectedScenario.outputs.volumeImpact)
  });
  workspaceScenarioReportParams.set('selectedEvidence', includedEvidenceRows.map((row) => `${row.claim}: ${row.proof}`).join(' | '));
  if (reviewEvidenceRows.length) {
    workspaceScenarioReportParams.set('reviewEvidence', reviewEvidenceRows.map((row) => `${row.claim}: ${row.whatItChanges}`).join(' | '));
  }
  if (excludedEvidenceRows.length) {
    workspaceScenarioReportParams.set('excludedEvidence', excludedEvidenceRows.map((row) => row.claim).join(' | '));
  }
  workspaceScenarioReportParams.set('buyingGroupId', workspace.buyingGroup.id);
  if (workspace.markets[0]?.id) workspaceScenarioReportParams.set('marketId', workspace.markets[0].id);
  if (latestDebrief) {
    workspaceScenarioReportParams.set('debriefMemory', `${latestDebrief.predictionImpact} Counter ${latestDebrief.buyerCounter || 'not entered'}, landed ${latestDebrief.finalLanded || 'not entered'}.`);
  }
  const workspaceScenarioReportHref = `/generated-views?${workspaceScenarioReportParams.toString()}`;
  const selectedScenarioSaved = savedScenarioIds.includes(selectedScenario.id);
  const latestSavedScenario = savedScenarioMemory[0];
  const selectedSavedScenario = savedScenarioMemory.find((entry) => entry.id === selectedScenario.id);
  const selectedScenarioLoopState = latestDebrief
    ? 'Debrief is updating this buyer prediction'
    : selectedScenarioSaved
      ? 'Scenario saved; debrief after the next round'
      : 'Save this scenario before using it as memory';
  const defaultCounterAnchor = `${Math.max(0.4, defaultInputs.priceIncreasePercent - 0.5).toFixed(1)}%`;
  const debriefPredictionRows = [
    {
      after: latestDebrief?.buyerCounter || defaultCounterAnchor,
      before: defaultCounterAnchor,
      label: 'Counter anchor',
      story: latestDebrief ? 'Updated from the latest debrief.' : 'Estimated from buyer history until a debrief is captured.'
    },
    {
      after: latestDebrief?.behavior || selectedScenario.expectedObjection,
      before: selectedScenario.expectedObjection,
      label: 'Likely behavior',
      story: latestDebrief ? 'Buyer behavior now drives the counter scenario.' : 'ATLAS is using historical pattern memory.'
    },
    {
      after: `${selectedScenario.evidenceStrength}%`,
      before: `${Math.max(0, selectedScenario.evidenceStrength - (latestDebrief ? 6 : 0))}%`,
      label: 'Evidence strength',
      story: latestDebrief ? 'Debrief memory increases confidence in the prediction.' : 'Attach outcome memory to strengthen confidence.'
    },
    {
      after: latestDebrief?.nextCycle || selectedScenario.recommendedResponse,
      before: selectedScenario.recommendedResponse,
      label: 'Next test',
      story: latestDebrief ? 'Next-cycle learning is now the recommended test.' : 'Use the top recommended scenario before the next round.'
    }
  ];
  const debriefPlanActualRows = latestDebrief ? [
    {
      actual: latestDebrief.finalLanded || latestDebrief.buyerCounter || latestDebrief.behavior,
      label: 'Outcome',
      planned: latestDebrief.selectedScenarioLabel || selectedScenario.label,
      story: 'The saved scenario is now grounded in the actual negotiation result.'
    },
    {
      actual: latestDebrief.buyerCounter || 'No counter captured',
      label: 'Buyer counter',
      planned: latestDebrief.predictionBefore || selectedScenario.buyerResponse,
      story: 'Future counter predictions use the captured buyer behavior.'
    },
    {
      actual: latestDebrief.finalLanded || latestDebrief.concessions || 'Outcome captured',
      label: 'Value protected',
      planned: euros(latestDebrief.plannedValueProtected ?? selectedScenario.valueProtected),
      story: `${latestDebrief.plannedLikelihood ?? selectedScenario.likelihood}% planned likelihood · ${latestDebrief.plannedGuardrailRisk ?? selectedScenario.guardrailRisk} guardrail read.`
    }
  ] : [];

  function toggleModule(id: PredictiveWorkspaceModuleId) {
    setHiddenModules((current) => current.includes(id) ? current.filter((moduleId) => moduleId !== id) : [...current, id]);
  }

  function togglePin(id: PredictiveWorkspaceModuleId) {
    setPinnedModules((current) => current.includes(id) ? current.filter((moduleId) => moduleId !== id) : [...current, id]);
  }

  function restoreModule(id: PredictiveWorkspaceModuleId) {
    setHiddenModules((current) => current.filter((moduleId) => moduleId !== id));
    setIrrelevantModules((current) => current.filter((moduleId) => moduleId !== id));
    setWorkspaceStatus(`${scenarioWorkspaceModules.find((module) => module.id === id)?.label ?? 'Module'} restored.`);
  }

  function markModuleIrrelevant(id: PredictiveWorkspaceModuleId) {
    setIrrelevantModules((current) => current.includes(id) ? current : [...current, id]);
    setHiddenModules((current) => current.includes(id) ? current : [...current, id]);
    setPinnedModules((current) => current.filter((moduleId) => moduleId !== id));
    setWorkspaceStatus(`${scenarioWorkspaceModules.find((module) => module.id === id)?.label ?? 'Module'} marked irrelevant for this workspace.`);
  }

  function setEvidenceStatus(id: string, status: StrategyInputStatus) {
    setEvidenceStatuses((current) => ({ ...current, [id]: status }));
    const label = evidenceRows.find((row) => row.id === id)?.claim ?? 'Evidence';
    setWorkspaceStatus(`${label} marked ${status.replaceAll('_', ' ')} for this scenario.`);
  }

  function saveWorkspaceView(label?: string) {
    const savedView: PredictiveWorkspaceSavedView = {
      createdAt: new Date().toISOString(),
      hiddenModules,
      id: `workspace-view-${Date.now()}`,
      label: label ?? `${workspace.buyingGroup.name} scenario view ${workspaceSavedViews.length + 1}`,
      pinnedModules,
      selectedLevel,
      selectedScenarioId
    };
    setWorkspaceSavedViews((current) => [savedView, ...current]);
    setActiveSavedViewId(savedView.id);
    setWorkspaceStatus(`${savedView.label} saved for this session.`);
  }

  function applyWorkspaceView(view: PredictiveWorkspaceSavedView) {
    setHiddenModules(view.hiddenModules);
    setPinnedModules(view.pinnedModules);
    setSelectedLevel(view.selectedLevel);
    setSelectedScenarioId(view.selectedScenarioId);
    setActiveSavedViewId(view.id);
    setWorkspaceStatus(`${view.label} loaded.`);
  }

  function applyWorkspacePreset(preset: 'scenario' | 'evidence' | 'debrief') {
    if (preset === 'scenario') {
      setPinnedModules(['lab', 'patterns', 'evidence', 'debrief']);
      setHiddenModules(['recommendations', 'signals', 'guardrails', 'saved']);
      setSelectedLevel('buying_group');
      setWorkspaceStatus('Scenario modeling workspace loaded.');
    } else if (preset === 'evidence') {
      setPinnedModules(['evidence', 'guardrails', 'signals']);
      setHiddenModules(['debrief']);
      setSelectedLevel('category');
      setWorkspaceStatus('Evidence review workspace loaded.');
    } else {
      setPinnedModules(['debrief', 'patterns', 'saved']);
      setHiddenModules(['guardrails']);
      setSelectedLevel('buying_group');
      setWorkspaceStatus('Debrief review workspace loaded.');
    }
    setActiveSavedViewId('');
  }

  function focusWorkspaceModule(id: PredictiveWorkspaceModuleId, message: string) {
    setHiddenModules((current) => current.filter((moduleId) => moduleId !== id));
    setPinnedModules((current) => current.includes(id) ? current : [...current, id]);
    setWorkspaceStatus(message);
  }

  function saveScenario(id: string) {
    const scenario = generatedScenarios.find((item) => item.id === id);
    setSavedScenarioIds((current) => current.includes(id) ? current : [...current, id]);
    if (scenario) {
      const memoryEntry: SavedScenarioMemoryEntry = {
        atlasScore: scenario.atlasScore,
        evidenceStrength: scenario.evidenceStrength,
        guardrailRisk: scenario.guardrailRisk,
        id: scenario.id,
        label: scenario.label,
        likelihood: scenario.likelihood,
        predictionImpact: `${scenario.label} now anchors future prediction at ${scenario.likelihood}% likelihood with ${scenario.guardrailRisk.toLowerCase()} guardrail risk.`,
        savedAt: new Date().toISOString(),
        valueProtected: scenario.valueProtected
      };
      setSavedScenarioMemory((current) => [memoryEntry, ...current.filter((entry) => entry.id !== id)]);
    }
    setHiddenModules((current) => current.filter((moduleId) => moduleId !== 'saved'));
    setPinnedModules((current) => current.includes('saved') ? current : [...current, 'saved']);
    setStrategyStatus(`${scenario?.label ?? 'Scenario'} saved to buyer memory.`);
  }

  function useScenarioInStrategy(id: string) {
    setSelectedScenarioId(id);
    setStrategyStatus(`${generatedScenarios.find((scenario) => scenario.id === id)?.label ?? 'Scenario'} is now the active buyer scenario case.`);
  }

  function addSkuRow() {
    setSkuRows((current) => [
      ...current,
      { id: `sku-${current.length + 1}`, sku: 'User-added SKU / pack', priceMove: inputs.priceIncreasePercent, volumeRisk: Math.abs(inputs.volumeChangePercent), margin: 29.5, sensitivity: 'Needs review' }
    ]);
    setSelectedLevel('sku');
    setSelectedScenarioId('custom');
  }

  function updateSkuRow<K extends keyof ScenarioSkuRow>(id: string, key: K, value: ScenarioSkuRow[K]) {
    setSkuRows((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
    setSelectedScenarioId('custom');
  }

  function removeSkuRow(id: string) {
    setSkuRows((current) => current.filter((row) => row.id !== id));
    setSelectedScenarioId('custom');
  }

  function addCustomLever() {
    setCustomLevers((current) => [
      ...current,
      { id: `lever-${current.length + 1}`, name: 'User-added lever', value: 'New assumption', impact: 'Needs scenario testing', status: 'User-added', weight: 2 }
    ]);
    setSelectedLevel('custom');
    setSelectedScenarioId('custom');
  }

  function updateCustomLever<K extends keyof ScenarioCustomLeverRow>(id: string, key: K, value: ScenarioCustomLeverRow[K]) {
    setCustomLevers((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
    setSelectedScenarioId('custom');
  }

  function removeCustomLever(id: string) {
    setCustomLevers((current) => current.filter((row) => row.id !== id));
    setSelectedScenarioId('custom');
  }

  function saveDebrief() {
    const hasDebrief = debriefText.trim() || debriefBuyerCounter.trim() || debriefFinalLanded.trim() || debriefConcessions.trim() || debriefNextCycle.trim();
    if (!hasDebrief) {
      setDebriefStatus('Add a note, outcome, counter, or next-cycle implication before saving the debrief.');
      return;
    }
    const plannedMemory = savedScenarioMemory.find((item) => item.id === selectedScenario.id);
    const predictionImpact = debriefNextCycle.trim()
      ? `Prediction updated: next cycle should account for "${debriefNextCycle.trim()}".`
      : debriefBuyerCounter.trim()
        ? `Prediction updated: buyer-counter scenario now anchors around ${debriefBuyerCounter.trim()}.`
        : 'Prediction updated: buyer behavior memory now informs future scenario recommendations.';
    const entry: ScenarioDebriefEntry = {
      attachments: debriefAttachments.trim(),
      behavior: debriefBehavior,
      buyingGroupId: workspace.buyingGroup.id,
      buyerCounter: debriefBuyerCounter.trim(),
      concessions: debriefConcessions.trim(),
      createdAt: new Date().toISOString(),
      evidenceStrengthAfter: selectedScenario.evidenceStrength,
      finalLanded: debriefFinalLanded.trim(),
      id: `debrief-${Date.now()}`,
      nextCycle: debriefNextCycle.trim(),
      note: debriefText.trim(),
      plannedEvidenceStrength: plannedMemory?.evidenceStrength ?? selectedScenario.evidenceStrength,
      plannedGuardrailRisk: plannedMemory?.guardrailRisk ?? selectedScenario.guardrailRisk,
      plannedLikelihood: plannedMemory?.likelihood ?? selectedScenario.likelihood,
      plannedValueProtected: plannedMemory?.valueProtected ?? selectedScenario.valueProtected,
      predictionAfter: predictionImpact,
      predictionBefore: selectedScenario.buyerResponse,
      scenarioId: selectedScenario.id,
      selectedScenarioLabel: selectedScenario.label,
      predictionImpact
    };
    writeScenarioDebriefMemory(entry);
    setDebriefEntries((current) => [entry, ...current]);
    setSavedScenarioMemory((current) => current.map((memory) => memory.id === selectedScenario.id ? {
      ...memory,
      actualOutcome: debriefFinalLanded.trim() || debriefBuyerCounter.trim() || debriefBehavior,
      predictionImpact: `${memory.label} superseded by debrief: ${predictionImpact}`,
      supersededByDebriefId: entry.id
    } : memory));
    setDebriefStatus(`Debrief saved. ${predictionImpact}`);
    setWorkspaceStatus('Buyer memory updated for this session.');
    setHiddenModules((current) => current.filter((moduleId) => moduleId !== 'debrief' && moduleId !== 'saved'));
    setPinnedModules((current) => {
      const nextModules: PredictiveWorkspaceModuleId[] = [...current, 'debrief', 'saved'];
      return [...new Set(nextModules)];
    });
    setDebriefText('');
    setDebriefBuyerCounter('');
    setDebriefFinalLanded('');
    setDebriefConcessions('');
    setDebriefNextCycle('');
    setDebriefAttachments('');
    setQuickDebriefOpen(false);
  }

  const renderModuleHeader = (module: { id: PredictiveWorkspaceModuleId; label: string }, summary: string) => (
    <header className="atlas-predictive-module-header">
      <div>
        <h3>{module.label}</h3>
        <p>{summary}</p>
      </div>
      <details className="atlas-module-options">
        <summary>Options</summary>
        <div>
          <button type="button" onClick={() => togglePin(module.id)}>{pinnedModules.includes(module.id) ? 'Unpin' : 'Pin'}</button>
          <button type="button" onClick={() => toggleModule(module.id)}>Hide</button>
          <button type="button" onClick={() => markModuleIrrelevant(module.id)}>Not relevant</button>
        </div>
      </details>
    </header>
  );

  return (
    <section className="atlas-predictive-workspace" aria-label={`${workspace.buyingGroup.name} predictive scenario workspace`}>
      <header className="atlas-predictive-hero">
        <span>Predictive scenario workspace</span>
        <h2>Model what could happen with {workspace.buyingGroup.name} before deciding the move.</h2>
        <p>Test likely buyer response, add debrief memory, and save the scenario evidence that should travel with the next move.</p>
        <div className="atlas-predictive-hero-metrics">
          <article><span>Margin at risk</span><strong>{euros(exposure.marginAtRisk)}</strong></article>
          <article><span>Latest buyer ask</span><strong>{profileRead.currentState.latestBuyerAsk}</strong></article>
          <article><span>PepsiCo position</span><strong>{profileRead.currentState.pepsicoPosition}</strong></article>
          <article><span>Predicted counter</span><strong>{Math.max(0.4, defaultInputs.priceIncreasePercent - 0.5).toFixed(1)}%</strong></article>
        </div>
      </header>

      {scenarioAlerts.length ? (
        <section className="atlas-workspace-scenario-inputs" aria-label="Scenario inputs changing this buyer read">
          <header>
            <span>Scenario inputs</span>
            <strong>What changed and why it may move the buyer response.</strong>
          </header>
          <div>
            {scenarioAlerts.slice(0, 4).map((alert) => (
              <article className={`tone-${alert.tone}`} key={alert.id}>
                <span>{alert.trigger}</span>
                <strong>{alert.title}</strong>
                <p>{alert.possibleEffect}</p>
                <footer>
                  <em>{alert.value}</em>
                  <small>{sourceTypeLabel(alert.source)} · {alert.source.confidence}</small>
                </footer>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="atlas-scenario-cockpit" aria-label="Active scenario cockpit">
        <header>
          <span>Scenario cockpit</span>
          <h3>{selectedScenario.label}</h3>
          <p>{selectedScenario.buyerResponse}</p>
        </header>
        <div className="atlas-scenario-cockpit-grid">
          <article className="primary">
            <span>Current test result</span>
            <strong>{selectedScenario.likelihood}% likely · {selectedScenario.guardrailRisk}</strong>
            <p>{selectedScenario.recommendedResponse}</p>
          </article>
          <article>
            <span>Possible financial effect</span>
            <strong>{euros(selectedScenario.outputs.revenueImpact)} NR / {euros(selectedScenario.outputs.marginImpact)} GM</strong>
            <p>{euros(selectedScenario.outputs.tradeSpendImpact)} trade · {euros(selectedScenario.outputs.volumeImpact)} volume</p>
          </article>
          <article>
            <span>Model depth</span>
            <strong>{selectedLevel.replaceAll('_', ' ')}</strong>
            <p>{selectedLevel === 'sku' ? `${skuRows.length} SKU rows` : selectedLevel === 'custom' ? `${customLevers.length} custom levers` : `${workspace.markets[0]?.name ?? 'buyer'} context`}</p>
          </article>
          <article>
            <span>Closed loop</span>
            <strong>{selectedScenarioLoopState}</strong>
            <p>{latestDebrief ? `${latestDebrief.predictionImpact} Top next test: ${topAtlasScenario.label}.` : selectedSavedScenario ? selectedSavedScenario.predictionImpact : `${savedScenarioIds.length} saved scenarios · ${workspaceSavedViews.length} saved workspace views`}</p>
          </article>
        </div>
        <section className="atlas-history-prediction-strip" aria-label="Historical intelligence shaping this prediction">
          <article>
            <span>Likely counter</span>
            <strong>{latestDebrief?.buyerCounter || `${Math.max(0.4, inputs.priceIncreasePercent - 0.5).toFixed(1)}%`}</strong>
            <p>{latestDebrief ? 'From latest debrief memory' : 'Modeled from buyer history and relationship risk'}</p>
          </article>
          <article>
            <span>Expected pushback</span>
            <strong>{selectedScenario.expectedObjection}</strong>
            <p>{selectedScenario.relationshipRisk} relationship risk · {selectedScenario.guardrailRisk}</p>
          </article>
          <article>
            <span>Memory effect</span>
            <strong>{latestDebrief ? selectedScenario.memoryReason : 'No debrief adjustment yet'}</strong>
            <p>{latestDebrief ? latestDebrief.behavior : 'Add a debrief after the room to improve the next prediction.'}</p>
          </article>
        </section>
        <section className="atlas-scenario-quick-test" aria-label="Quick scenario test">
          <header>
            <div>
              <span>Test without leaving this screen</span>
              <strong>Adjust the move and watch the buyer prediction change.</strong>
            </div>
            <div className="atlas-scenario-quick-actions" aria-label="Scenario loop actions">
              <button type="button" onClick={() => saveScenario(selectedScenario.id)}>{selectedScenarioSaved ? 'Saved' : 'Save scenario'}</button>
              <button type="button" onClick={() => setQuickDebriefOpen((open) => !open)}>{quickDebriefOpen ? 'Close debrief' : 'Add debrief'}</button>
              {latestDebrief && topAtlasScenario.id !== selectedScenario.id ? (
                <button type="button" onClick={() => setSelectedScenarioId(topAtlasScenario.id)}>Use top next test</button>
              ) : null}
            </div>
          </header>
          {quickDebriefOpen ? (
            <section className="atlas-scenario-inline-debrief" aria-label="Quick debrief capture">
              <header>
                <span>Close the loop</span>
                <strong>Capture what happened so future buyer predictions improve.</strong>
              </header>
              <div>
                <label>
                  <span>Buyer counter</span>
                  <input value={debriefBuyerCounter} onChange={(event) => setDebriefBuyerCounter(event.currentTarget.value)} placeholder="ex: 2.1%" />
                </label>
                <label>
                  <span>Final landed</span>
                  <input value={debriefFinalLanded} onChange={(event) => setDebriefFinalLanded(event.currentTarget.value)} placeholder="ex: 2.6%" />
                </label>
                <label>
                  <span>Buyer behavior</span>
                  <select value={debriefBehavior} onChange={(event) => setDebriefBehavior(event.currentTarget.value)}>
                    <option>Price challenged with affordability pressure</option>
                    <option>Countered below prior-year landing point</option>
                    <option>Delayed decision to create leverage</option>
                    <option>Accepted evidence but asked for trade support</option>
                    <option>Escalated to senior commercial review</option>
                  </select>
                </label>
                <label>
                  <span>Next-cycle implication</span>
                  <input value={debriefNextCycle} onChange={(event) => setDebriefNextCycle(event.currentTarget.value)} placeholder="ex: lead with prior outcome evidence" />
                </label>
              </div>
              <textarea value={debriefText} onChange={(event) => setDebriefText(event.currentTarget.value)} placeholder="Short note: what changed, what evidence worked, what should ATLAS remember?" />
              <footer>
                <button type="button" onClick={() => setDebriefStatus('Voice note ready. Add the spoken summary as text for this POC.')}><Mic size={14} /> Voice note</button>
                <button type="button" onClick={saveDebrief}>Save debrief</button>
              </footer>
            </section>
          ) : null}
          <div className="atlas-scenario-quick-decision-row">
            <div className="atlas-scenario-decision-compare" aria-label="Scenario decision comparison">
              {cockpitComparisonScenarios.map((scenario) => (
                <button
                  className={`${selectedScenarioId === scenario.id ? 'active' : ''} guardrail-${scenario.guardrailRisk.toLowerCase().replaceAll(' ', '-')}`}
                  key={scenario.id}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  type="button"
                >
                  <span>{comparisonRoleLabel[scenario.id] ?? scenario.label}</span>
                  <strong>{scenario.label}</strong>
                  <dl>
                    <div><dt>Land</dt><dd>{scenario.likelihood}%</dd></div>
                    <div><dt>NR</dt><dd>{euros(scenario.outputs.revenueImpact)}</dd></div>
                    <div><dt>GM</dt><dd>{euros(scenario.outputs.marginImpact)}</dd></div>
                    <div><dt>Risk</dt><dd>{scenario.guardrailRisk}</dd></div>
                  </dl>
                  {latestDebrief ? <small className={scenario.memoryAdjustment >= 0 ? 'memory-up' : 'memory-down'}>{scenario.memoryReason}</small> : null}
                  <p>{scenario.recommendedResponse}</p>
                </button>
              ))}
            </div>
            <section className="atlas-scenario-prediction-basis-mini" aria-label="Why ATLAS predicts this">
              <header>
                <span>Why ATLAS predicts this</span>
                <strong>{selectedScenario.rankReason}</strong>
              </header>
              <div>
                {latestDebrief ? (
                  <article>
                    <span>Debrief learning</span>
                    <strong>{selectedScenario.memoryReason}</strong>
                    <em>{latestDebrief.finalLanded || latestDebrief.buyerCounter || latestDebrief.behavior}</em>
                  </article>
                ) : null}
                {predictionBasisRows.map((row) => (
                  <article key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.impact}</strong>
                    <p>{row.value}</p>
                    <em>{sourceTypeLabel(row.source)} · {row.source.confidence}</em>
                  </article>
                ))}
              </div>
            </section>
            <aside className="atlas-scenario-inline-levers" aria-label="Adjust current scenario">
              <header>
                <span>Adjust current test</span>
                <strong>Change the inputs that move the buyer prediction.</strong>
              </header>
              <div className="atlas-scenario-quick-grid">
                {cockpitQuickControls.map(({ key, label, max, min, step, suffix }) => {
                  const currentValue = Number(inputs[key]);
                  const defaultValue = Number(defaultInputs[key]);
                  const delta = currentValue - defaultValue;
                  const deltaLabel = suffix === 'EUR'
                    ? euros(delta)
                    : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} pts`;
                  return (
                    <label key={key}>
                      <div>
                        <span>{label}</span>
                        <strong>{formatLabControlValue(suffix, currentValue)}</strong>
                      </div>
                      <input
                        max={max}
                        min={min}
                        onChange={(event) => updateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])}
                        step={step}
                        type="range"
                        value={currentValue}
                      />
                      <small>{delta === 0 ? 'At default' : `${deltaLabel} from default`}</small>
                    </label>
                  );
                })}
              </div>
              <div className="atlas-scenario-change-read" aria-label="What changed from the default case">
                {scenarioDeltaRows.slice(0, 3).map((row) => (
                  <span key={row.label}>
                    <small>{row.label}</small>
                    <strong>{row.value}</strong>
                  </span>
                ))}
              </div>
            </aside>
          </div>
          {(selectedScenarioSaved || strategyStatus || debriefStatus) ? (
            <p className="atlas-scenario-inline-status">
              {debriefStatus || strategyStatus || `${selectedScenario.label} is saved to buyer memory.`}
            </p>
          ) : null}
        </section>
        <div className="atlas-scenario-cockpit-actions">
          <button type="button" onClick={() => focusWorkspaceModule('patterns', 'Historical buyer patterns moved up for review.')}>Review buyer memory</button>
          <button type="button" onClick={() => useScenarioInStrategy(selectedScenario.id)}>Set as working scenario</button>
          <a href={workspaceScenarioReportHref} rel="noreferrer" target="_blank"><Download size={14} /> Export evidence</a>
        </div>
        <section className="atlas-scenario-loop-capture atlas-scenario-loop-summary" aria-label="Closed-loop memory summary">
          {latestDebrief ? (
            <>
              <div className="atlas-debrief-plan-actual" aria-label="Planned scenario versus actual outcome">
                {debriefPlanActualRows.map((row) => (
                  <article key={row.label}>
                    <span>{row.label}</span>
                    <div>
                      <strong>{row.planned}</strong>
                      <ArrowRight size={14} aria-hidden="true" />
                      <strong>{row.actual}</strong>
                    </div>
                    <p>{row.story}</p>
                  </article>
                ))}
              </div>
              <div className="atlas-scenario-memory-impact" aria-label="Prediction memory impact">
                {debriefPredictionRows.map((row) => (
                  <article key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.after}</strong>
                    <p>{row.story}</p>
                  </article>
                ))}
              </div>
            </>
          ) : latestSavedScenario ? (
            <div className="atlas-scenario-memory-impact" aria-label="Saved scenario memory impact">
              <article>
                <span>Saved scenario</span>
                <strong>{latestSavedScenario.label}</strong>
                <p>{latestSavedScenario.predictionImpact}</p>
              </article>
              <article>
                <span>Future prediction</span>
                <strong>{latestSavedScenario.likelihood}% likelihood</strong>
                <p>ATLAS will use this case as buyer memory until a debrief replaces it with the actual outcome.</p>
              </article>
              <article>
                <span>Evidence state</span>
                <strong>{latestSavedScenario.evidenceStrength}% strength</strong>
                <p>Saved {formatAtlasDate(latestSavedScenario.savedAt, { includeTime: true })} · {euros(latestSavedScenario.valueProtected)} value protected.</p>
              </article>
            </div>
          ) : (
            <p className="atlas-scenario-loop-hint">No debrief saved yet. Use the inline debrief in the scenario test to update the counter anchor, likely behavior, evidence strength, and next test.</p>
          )}
        </section>
      </section>

      <section className="atlas-predictive-toolbar" aria-label="Workspace controls">
        <div>
          <strong>Workspace view</strong>
          <span>{visibleModules.length} visible · {pinnedModules.length} pinned · {irrelevantModules.length} irrelevant</span>
        </div>
        <div>
          {hiddenModules.length ? (
            <button type="button" onClick={() => setHiddenModules([])}>Show hidden</button>
          ) : null}
          <button type="button" onClick={() => setCustomizerOpen((open) => !open)}>{customizerOpen ? 'Close customize' : 'Customize'}</button>
          <button type="button" onClick={() => saveWorkspaceView()}>Save view</button>
        </div>
        {workspaceStatus ? <p>{workspaceStatus}</p> : null}
      </section>

      {customizerOpen ? (
        <section className="atlas-workspace-customizer" aria-label="Customize workspace modules">
          <div className="atlas-workspace-presets">
            <span>Starter views</span>
            <button type="button" onClick={() => applyWorkspacePreset('scenario')}>Scenario modeling</button>
            <button type="button" onClick={() => applyWorkspacePreset('evidence')}>Evidence review</button>
            <button type="button" onClick={() => applyWorkspacePreset('debrief')}>Debrief review</button>
          </div>
          <div className="atlas-workspace-module-list">
            {scenarioWorkspaceModules.map((module) => {
              const isHidden = hiddenModules.includes(module.id);
              const isPinned = pinnedModules.includes(module.id);
              const isIrrelevant = irrelevantModules.includes(module.id);
              return (
                <article key={module.id}>
                  <div>
                    <strong>{module.label}</strong>
                    <span>{isIrrelevant ? 'Marked irrelevant' : isHidden ? 'Hidden' : isPinned ? 'Pinned' : 'Visible'}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => togglePin(module.id)}>{isPinned ? 'Unpin' : 'Pin'}</button>
                    <button type="button" onClick={() => isHidden ? restoreModule(module.id) : toggleModule(module.id)}>{isHidden ? 'Show' : 'Hide'}</button>
                    <button type="button" onClick={() => markModuleIrrelevant(module.id)}>Irrelevant</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="atlas-workspace-saved-views">
            <span>Saved workspace views</span>
            {workspaceSavedViews.length ? workspaceSavedViews.map((view) => (
              <button className={activeSavedViewId === view.id ? 'active' : ''} key={view.id} type="button" onClick={() => applyWorkspaceView(view)}>
                {view.label}
                <small>{formatAtlasDate(view.createdAt, { includeTime: true })}</small>
              </button>
            )) : <p>No saved views yet. Save the current layout to reuse it in this session.</p>}
          </div>
        </section>
      ) : null}

      {hiddenModules.length || irrelevantModules.length ? (
        <section className="atlas-workspace-hidden-summary" aria-label="Hidden workspace modules">
          <span>Hidden from this view</span>
          <div>
            {[...new Set([...hiddenModules, ...irrelevantModules])].map((moduleId) => (
              <button key={moduleId} type="button" onClick={() => restoreModule(moduleId)}>
                {scenarioWorkspaceModules.find((module) => module.id === moduleId)?.label ?? moduleId}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {visibleModules.map((module) => (
        <section className={`atlas-predictive-module module-${module.id}`} key={module.id}>
          {module.id === 'recommendations' ? (
            <>
              {renderModuleHeader(module, 'Use this only when you need alternative cases beyond the three shown in the cockpit.')}
              <div className="atlas-scenario-recommendation-grid">
                {rankedScenarios.filter((scenario) => !cockpitComparisonScenarios.some((cockpitScenario) => cockpitScenario.id === scenario.id)).map((scenario, index) => (
                  <article className={selectedScenarioId === scenario.id ? 'selected' : ''} key={scenario.id}>
                    <div>
                      <span>Alternative {index + 1} · {sourceTypeLabel(scenario.source)}</span>
                      <strong>{scenario.description}</strong>
                      <p>{scenario.why}</p>
                      <small>{scenario.memoryReason}</small>
                    </div>
                    <dl>
                      <div><dt>ATLAS score</dt><dd>{scenario.atlasScore}/100</dd></div>
                      <div><dt>Likelihood</dt><dd>{scenario.likelihood}%</dd></div>
                      <div><dt>Value protected</dt><dd>{euros(scenario.valueProtected)}</dd></div>
                      <div><dt>Guardrail</dt><dd>{scenario.guardrailRisk}</dd></div>
                    </dl>
                    <footer>
                      <button type="button" onClick={() => setSelectedScenarioId(scenario.id)}>View</button>
                      <button type="button" onClick={() => saveScenario(scenario.id)}>Save</button>
                      <button type="button" onClick={() => useScenarioInStrategy(scenario.id)}>Use as active case</button>
                    </footer>
                  </article>
                  ))}
              </div>
              <details className="atlas-scenario-comparison-disclosure">
                <summary>Compare all generated scenarios</summary>
                <div className="atlas-scenario-comparison-table" aria-label="Scenario comparison">
                  <table>
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>ATLAS score</th>
                        <th>Likelihood</th>
                        <th>Memory</th>
                        <th>Predicted response</th>
                        <th>NR impact</th>
                        <th>GM impact</th>
                        <th>Trade spend</th>
                        <th>Volume impact</th>
                        <th>Guardrail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedScenarios.map((scenario) => (
                        <tr className={selectedScenarioId === scenario.id ? 'selected' : ''} key={scenario.id} onClick={() => setSelectedScenarioId(scenario.id)}>
                          <td>{scenario.label}</td>
                          <td>{scenario.atlasScore}/100</td>
                          <td>{scenario.likelihood}%</td>
                          <td>{scenario.memoryAdjustment >= 0 ? '+' : ''}{scenario.memoryAdjustment}</td>
                          <td>{scenario.buyerResponse}</td>
                          <td>{euros(scenario.outputs.revenueImpact)}</td>
                          <td>{euros(scenario.outputs.marginImpact)}</td>
                          <td>{euros(scenario.outputs.tradeSpendImpact)}</td>
                          <td>{euros(scenario.outputs.volumeImpact)}</td>
                          <td>{scenario.guardrailRisk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              {strategyStatus ? <p className="atlas-predictive-status">{strategyStatus}</p> : null}
            </>
          ) : null}

          {module.id === 'lab' ? (
            <>
              {renderModuleHeader(module, 'Build scenarios manually or drill into market, category, SKU, and custom levers when the decision needs more detail.')}
              <div className="atlas-scenario-level-tabs" aria-label="Scenario level">
                {levels.map((level) => (
                  <button className={selectedLevel === level.id ? 'active' : ''} key={level.id} onClick={() => selectScenarioLevel(level.id)} type="button">{level.label}</button>
                ))}
              </div>
              <div className="atlas-scenario-context-strip">
                {levelContextRows.map(([label, value]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>
              <div className="atlas-scenario-lab-layout">
                <div className="atlas-scenario-controls-shell">
                  {labControlGroups.map((group) => (
                    <section className="atlas-scenario-control-group" key={group.title}>
                      <header>
                        <span>{group.title}</span>
                        <p>{group.subtitle}</p>
                      </header>
                      <div className="atlas-scenario-control-grid">
                        {group.controls.map(({ key, label, max, min, step, suffix }) => {
                          const currentValue = Number(inputs[key]);
                          const defaultValue = Number(defaultInputs[key]);
                          return (
                            <label key={key}>
                              <div className="atlas-scenario-control-topline">
                                <span>{label}</span>
                                <strong>{formatLabControlValue(suffix, currentValue)}</strong>
                              </div>
                              <input type="range" min={min} max={max} step={step} value={currentValue} onChange={(event) => updateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])} />
                              <small>Default {formatLabControlValue(suffix, defaultValue)} · Range {formatLabControlValue(suffix, min)} to {formatLabControlValue(suffix, max)}</small>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                  <section className="atlas-scenario-control-group compact">
                    <header>
                      <span>Buyer environment</span>
                      <p>Pressure level adjusts how hard ATLAS expects the buyer to push back.</p>
                    </header>
                    <label>
                      <div className="atlas-scenario-control-topline">
                        <span>Competitor pressure</span>
                        <strong>{inputs.competitorPressureLevel}</strong>
                      </div>
                      <select value={inputs.competitorPressureLevel} onChange={(event) => updateInput('competitorPressureLevel', event.currentTarget.value as ScenarioInputs['competitorPressureLevel'])}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                  </section>
                </div>
                <article className="atlas-scenario-active-read">
                  <div className="atlas-scenario-outcome-head">
                    <span>Outcome preview</span>
                    <h3>{selectedScenario.label}</h3>
                    <p>{selectedScenario.recommendedResponse}</p>
                  </div>
                  <dl>
                    <div><dt>NR impact</dt><dd>{euros(selectedScenario.outputs.revenueImpact)}</dd></div>
                    <div><dt>GM impact</dt><dd>{euros(selectedScenario.outputs.marginImpact)}</dd></div>
                    <div><dt>Trade spend</dt><dd>{euros(selectedScenario.outputs.tradeSpendImpact)}</dd></div>
                    <div><dt>Volume impact</dt><dd>{euros(selectedScenario.outputs.volumeImpact)}</dd></div>
                    <div><dt>Buyer response</dt><dd>{selectedScenario.likelihood}% likely</dd></div>
                    <div><dt>Evidence strength</dt><dd>{selectedScenario.evidenceStrength}%</dd></div>
                  </dl>
                  <div className="atlas-active-buyer-prediction">
                    <article>
                      <span>Expected buyer move</span>
                      <strong>{selectedScenario.buyerResponse}</strong>
                    </article>
                    <article>
                      <span>Likely objection</span>
                      <strong>{selectedScenario.expectedObjection}</strong>
                    </article>
                    <article>
                      <span>ATLAS recommended edit</span>
                      <strong>{selectedScenario.recommendedResponse}</strong>
                    </article>
                  </div>
                  <p>{selectedScenario.why}</p>
                  <div className="atlas-scenario-change-logic">
                    {scenarioDeltaRows.map((row) => (
                      <article key={row.label}>
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                        <p>{row.story}</p>
                      </article>
                    ))}
                  </div>
                  <a href={workspaceScenarioReportHref} rel="noreferrer" target="_blank"><Download size={14} /> Export scenario evidence</a>
                </article>
              </div>
              {selectedLevel === 'sku' ? (
                <section className="atlas-scenario-detail-table">
                  <header><h4>Optional SKU / pack drill-in</h4><button type="button" onClick={addSkuRow}>Add SKU</button></header>
                  <table>
                    <thead><tr><th>SKU / pack</th><th>Price move</th><th>Volume risk</th><th>GM rate</th><th>Buyer sensitivity</th><th>Action</th></tr></thead>
                    <tbody>
                      {skuRows.map((row) => (
                        <tr key={row.id}>
                          <td><input value={row.sku} onChange={(event) => updateSkuRow(row.id, 'sku', event.currentTarget.value)} /></td>
                          <td><input type="number" step="0.1" value={row.priceMove} onChange={(event) => updateSkuRow(row.id, 'priceMove', Number(event.currentTarget.value))} />%</td>
                          <td><input type="number" step="0.1" value={row.volumeRisk} onChange={(event) => updateSkuRow(row.id, 'volumeRisk', Number(event.currentTarget.value))} />%</td>
                          <td><input type="number" step="0.1" value={row.margin} onChange={(event) => updateSkuRow(row.id, 'margin', Number(event.currentTarget.value))} />%</td>
                          <td>
                            <select value={row.sensitivity} onChange={(event) => updateSkuRow(row.id, 'sensitivity', event.currentTarget.value)}>
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                              <option>Needs review</option>
                            </select>
                          </td>
                          <td><button type="button" onClick={() => removeSkuRow(row.id)}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}
              {selectedLevel === 'custom' ? (
                <section className="atlas-scenario-detail-table">
                  <header><h4>Custom levers</h4><button type="button" onClick={addCustomLever}>Add lever</button></header>
                  <table>
                    <thead><tr><th>Lever</th><th>Value</th><th>Impact</th><th>Weight</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {customLevers.map((row) => (
                        <tr key={row.id}>
                          <td><input value={row.name} onChange={(event) => updateCustomLever(row.id, 'name', event.currentTarget.value)} /></td>
                          <td><input value={row.value} onChange={(event) => updateCustomLever(row.id, 'value', event.currentTarget.value)} /></td>
                          <td><input value={row.impact} onChange={(event) => updateCustomLever(row.id, 'impact', event.currentTarget.value)} /></td>
                          <td><input type="number" min="0" max="10" value={row.weight} onChange={(event) => updateCustomLever(row.id, 'weight', Number(event.currentTarget.value))} /></td>
                          <td>
                            <select value={row.status} onChange={(event) => updateCustomLever(row.id, 'status', event.currentTarget.value)}>
                              <option>Assumption</option>
                              <option>User-added</option>
                              <option>Needs review</option>
                              <option>Validated</option>
                            </select>
                          </td>
                          <td><button type="button" onClick={() => removeCustomLever(row.id)}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}
            </>
          ) : null}

          {module.id === 'patterns' ? (
            <>
              {renderModuleHeader(module, 'Historical memory predicts how this buyer may respond and what should change in the scenario.')}
              <div className="atlas-history-pattern-grid">
                {historicalInsights.map((insight) => (
                  <article key={insight.id}>
                    <button aria-label={`Dismiss ${insight.id}`} onClick={() => setDismissedInsights((current) => [...current, insight.id])} type="button"><X size={12} /></button>
                    <strong>{insight.story}</strong>
                    <p>{insight.changes}</p>
                    <SourceTrustMini source={insight.source} />
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {module.id === 'signals' ? (
            <>
              {renderModuleHeader(module, 'Only signals that change buyer response, price corridor, or evidence should be used in scenario planning.')}
              <div className="atlas-signal-rows">
                {(workspace.signals.length ? workspace.signals : packet.signals.slice(0, 2)).slice(0, 3).map((signal) => (
                  <article key={signal.id}>
                    <span>{signal.signalType}</span>
                    <strong>{signal.title}</strong>
                    <p>{signal.negotiationImplication}</p>
                    <SourceTrustMini source={signal.source} />
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {module.id === 'guardrails' ? (
            <>
              {renderModuleHeader(module, 'Finance/NRM appears as a validation layer, not a separate workflow for this POC.')}
              <div className="atlas-guardrail-grid">
                <article><span>Target realization</span><strong>{pct(exposure.targetPriceRealization)}</strong><p>Guardrail from Finance model</p></article>
                <article><span>Expected realization</span><strong>{pct(inputs.expectedRealizationPercent)}</strong><p>{inputs.expectedRealizationPercent < exposure.expectedPriceRealization ? 'Needs Finance review' : 'Inside current model'}</p></article>
                <article><span>Trade envelope</span><strong>{euros(inputs.tradeSpendChange)}</strong><p>Reviewed as scenario assumption</p></article>
                <article><span>Red-line proxy</span><strong>{pct(Math.max(0.4, exposure.expectedPriceRealization - 0.4))}</strong><p>Do-not-cross threshold for this model</p></article>
              </div>
              <SourceTrustMini source={financeSource} />
            </>
          ) : null}

          {module.id === 'evidence' ? (
            <>
              {renderModuleHeader(module, 'Evidence is attached to a specific number, buyer objection, or scenario assumption.')}
              <div className="atlas-scenario-evidence-cards" aria-label="Scenario evidence decisions">
                {evidenceRows.map((row) => {
                  const status = evidenceStatuses[row.id] ?? 'recommended';
                  return (
                    <article className={`status-${status}`} key={row.id}>
                      <header>
                        <span>{row.claim}</span>
                        <StrategyStatusPill status={status} />
                      </header>
                      <strong>{row.proof}</strong>
                      <p>{row.use}</p>
                      <em>{row.whatItChanges}</em>
                      <footer>
                        <SourceTrustMini source={row.source} />
                        <div>
                          <button type="button" onClick={() => setEvidenceStatus(row.id, 'used')}>Include</button>
                          <button type="button" onClick={() => setEvidenceStatus(row.id, 'needs_review')}>Review</button>
                          <button type="button" onClick={() => setEvidenceStatus(row.id, 'excluded')}>Exclude</button>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
              <p className="atlas-evidence-export-read">
                Export includes {includedEvidenceRows.length} evidence items
                {reviewEvidenceRows.length ? ` · ${reviewEvidenceRows.length} need review` : ''}
                {excludedEvidenceRows.length ? ` · ${excludedEvidenceRows.length} excluded` : ''}.
              </p>
            </>
          ) : null}

          {module.id === 'debrief' ? (
            <>
              {renderModuleHeader(module, 'Debriefs close the loop so future scenario predictions learn from what happened in the room.')}
              <div className="atlas-debrief-capture">
                {latestDebrief ? (
                  <section className="atlas-prediction-updated-card" aria-label="Prediction updated">
                    <span>Prediction updated</span>
                    <strong>{latestDebrief.predictionImpact}</strong>
                    <p>Latest landed outcome: {latestDebrief.finalLanded || 'not entered'} · Buyer counter: {latestDebrief.buyerCounter || 'not entered'} · Scenario: {latestDebrief.selectedScenarioLabel || selectedScenario.label}</p>
                  </section>
                ) : null}
                {latestDebrief ? (
                  <section className="atlas-debrief-plan-actual" aria-label="Planned scenario versus actual outcome">
                    {debriefPlanActualRows.map((row) => (
                      <article key={row.label}>
                        <span>{row.label}</span>
                        <div>
                          <strong>{row.planned}</strong>
                          <ArrowRight size={14} aria-hidden="true" />
                          <strong>{row.actual}</strong>
                        </div>
                        <p>{row.story}</p>
                      </article>
                    ))}
                  </section>
                ) : null}
                <section className="atlas-debrief-impact-preview" aria-label="What the debrief updates">
                  <span>What this updates</span>
                  <div>
                    {debriefPredictionRows.map((row) => (
                      <article key={row.label}>
                        <strong>{row.label}</strong>
                        <p>{row.story}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <div className="atlas-debrief-field-grid">
                  <label>
                    <span>Buyer counter</span>
                    <input value={debriefBuyerCounter} onChange={(event) => setDebriefBuyerCounter(event.currentTarget.value)} placeholder="ex: 2.1%" />
                  </label>
                  <label>
                    <span>Final landed outcome</span>
                    <input value={debriefFinalLanded} onChange={(event) => setDebriefFinalLanded(event.currentTarget.value)} placeholder="ex: 2.6%" />
                  </label>
                  <label>
                    <span>Concessions given</span>
                    <input value={debriefConcessions} onChange={(event) => setDebriefConcessions(event.currentTarget.value)} placeholder="ex: promo support held back" />
                  </label>
                  <label>
                    <span>Buyer behavior</span>
                    <select value={debriefBehavior} onChange={(event) => setDebriefBehavior(event.currentTarget.value)}>
                      <option>Price challenged with affordability pressure</option>
                      <option>Countered below prior-year landing point</option>
                      <option>Delayed decision to create leverage</option>
                      <option>Accepted evidence but asked for trade support</option>
                      <option>Escalated to senior commercial review</option>
                    </select>
                  </label>
                  <label>
                    <span>Next-cycle implication</span>
                    <input value={debriefNextCycle} onChange={(event) => setDebriefNextCycle(event.currentTarget.value)} placeholder="ex: lead with prior outcome evidence" />
                  </label>
                  <label>
                    <span>Attachments</span>
                    <input value={debriefAttachments} onChange={(event) => setDebriefAttachments(event.currentTarget.value)} placeholder="ex: signed CMA, room notes" />
                  </label>
                </div>
                <textarea value={debriefText} onChange={(event) => setDebriefText(event.currentTarget.value)} placeholder="Type what happened, buyer counter, final landed number, concessions, behavior, and next-cycle implications." />
                <div>
                  <button type="button" onClick={() => setDebriefStatus('Voice note ready. Add the spoken summary as text for this POC.')}><Mic size={14} /> Voice note</button>
                  <button type="button">Attach file</button>
                  <button type="button" onClick={saveDebrief}>Save debrief</button>
                </div>
                {debriefStatus ? <p>{debriefStatus}</p> : null}
                {debriefEntries.length ? (
                  <section className="atlas-debrief-memory-list" aria-label="Saved debrief memory">
                    <h4>Debrief memory added this session</h4>
                    {debriefEntries.map((entry) => (
                      <article key={entry.id}>
                        <time>{formatAtlasDate(entry.createdAt, { includeTime: true, includeYear: true })}</time>
                        <strong>{entry.behavior}</strong>
                        <p>{entry.predictionImpact}</p>
                        <dl>
                          <div><dt>Scenario</dt><dd>{entry.selectedScenarioLabel || 'Active case'}</dd></div>
                          <div><dt>Counter</dt><dd>{entry.buyerCounter || 'Not entered'}</dd></div>
                          <div><dt>Landed</dt><dd>{entry.finalLanded || 'Not entered'}</dd></div>
                          <div><dt>Concessions</dt><dd>{entry.concessions || 'None entered'}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </section>
                ) : null}
              </div>
            </>
          ) : null}

          {module.id === 'saved' ? (
            <>
              {renderModuleHeader(module, 'Saved scenarios, exported outputs, and debriefs become memory for the next scenario cycle.')}
              <div className="atlas-saved-scenario-list">
                {generatedScenarios.filter((scenario) => savedScenarioIds.includes(scenario.id)).map((scenario) => {
                  const memory = savedScenarioMemory.find((entry) => entry.id === scenario.id);
                  return (
                  <article className={memory ? 'has-memory' : ''} key={scenario.id}>
                    <span>Saved scenario</span>
                    <strong>{scenario.label}</strong>
                    <p>{memory?.predictionImpact ?? scenario.description}</p>
                    {memory ? (
                      <dl>
                        <div><dt>Likelihood</dt><dd>{memory.likelihood}%</dd></div>
                        <div><dt>Value</dt><dd>{euros(memory.valueProtected)}</dd></div>
                        <div><dt>Evidence</dt><dd>{memory.evidenceStrength}%</dd></div>
                      </dl>
                    ) : null}
                    <button type="button" onClick={() => useScenarioInStrategy(scenario.id)}>Use as active case</button>
                  </article>
                  );
                })}
                {savedViews.slice(0, 3).map((view) => (
                  <article key={view.id}>
                    <span>Scenario output</span>
                    <strong>{view.title}</strong>
                    <p>Saved to buyer memory and available as scenario evidence when relevant.</p>
                  </article>
                ))}
                {debriefEntries.map((entry) => (
                  <article key={entry.id}>
                    <span>Debrief memory</span>
                    <strong>{entry.behavior}</strong>
                    <p>{entry.predictionImpact}</p>
                    <button type="button" onClick={() => setSelectedScenarioId('buyer-counter')}>Re-test buyer counter</button>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ))}
    </section>
  );
}

function BuyerProfileStrategyWorkspace({
  profileRead,
  savedViews,
  strategyPlan,
  workspace
}: {
  profileRead: BuyerProfileRead;
  savedViews: StoredGeneratedView[];
  strategyPlan: ReturnType<typeof buildNegotiationPlanPacket>;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const initialIngoingAsk = strategyPlan?.ingoingAskPercent ?? parseProfilePercent(profileRead.currentState.pepsicoPosition);
  const initialTarget = strategyPlan?.targetPercent ?? parseProfilePercent(profileRead.currentState.target);
  const initialFallback = strategyPlan?.fallbackPercent ?? Math.max(0, initialTarget - 0.4);
  const initialRedLine = strategyPlan?.redLinePercent ?? parseProfilePercent(profileRead.currentState.redLine);
  const defaultNetPricePerCase = Number((
    12.75
    + (profileRead.exposure.expectedPriceRealization * 0.42)
    + (profileRead.exposure.revenueUnderNegotiation / 100000000)
  ).toFixed(2));
  const defaultAnnualCaseVolume = Math.max(100000, Math.round(profileRead.exposure.revenueUnderNegotiation / defaultNetPricePerCase));
  const defaultGrossMarginRate = 31;
  const defaultVolumeRiskPercent = -Number(Math.min(6, Math.max(1.2, (profileRead.exposure.volumeExposure / profileRead.exposure.revenueUnderNegotiation) * 100)).toFixed(1));
  const defaultApprovedNumbers = {
    annualCaseVolume: defaultAnnualCaseVolume,
    currentNetPricePerCase: defaultNetPricePerCase,
    fallbackPercent: initialFallback,
    grossMarginRate: defaultGrossMarginRate,
    ingoingAskPercent: initialIngoingAsk,
    redLinePercent: initialRedLine,
    targetPercent: initialTarget,
    tradeSpendEnvelope: Math.round(profileRead.exposure.tradeSpendExposure * 0.16),
    volumeRiskPercent: defaultVolumeRiskPercent
  };
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<BuyerStrategyWorkspaceTab>('position');
  const [activeEvidenceId, setActiveEvidenceId] = useState('pepsico-position');
  const [numberSourceOpen, setNumberSourceOpen] = useState(false);
  const [numberSaveState, setNumberSaveState] = useState('');
  const [approvedNumbers, setApprovedNumbers] = useState(() => defaultApprovedNumbers);
  const [inputStatuses, setInputStatuses] = useState<Record<string, StrategyInputStatus>>({});
  const testRead = useMemo(() => buildInlineStrategyTest(workspace, profileRead, strategyPlan, approvedNumbers), [approvedNumbers, profileRead, strategyPlan, workspace]);
  const defaultTestRead = useMemo(
    () => buildInlineStrategyTest(workspace, profileRead, strategyPlan, defaultApprovedNumbers),
    [initialFallback, initialIngoingAsk, initialRedLine, initialTarget, profileRead, strategyPlan, workspace]
  );
  const target = approvedNumbers.targetPercent;
  const fallback = approvedNumbers.fallbackPercent;
  const redLine = approvedNumbers.redLinePercent;
  const ingoingAsk = approvedNumbers.ingoingAskPercent;
  const currentNetPricePerCase = approvedNumbers.currentNetPricePerCase;
  const proposedNetPricePerCase = priceAfterIncrease(currentNetPricePerCase, ingoingAsk);
  const targetNetPricePerCase = priceAfterIncrease(currentNetPricePerCase, target);
  const projectedNrImpact = Math.round(approvedNumbers.annualCaseVolume * (proposedNetPricePerCase - currentNetPricePerCase));
  const projectedGmImpact = Math.round(projectedNrImpact * (approvedNumbers.grossMarginRate / 100));
  const projectedVolumeRisk = Math.round(approvedNumbers.annualCaseVolume * currentNetPricePerCase * (approvedNumbers.volumeRiskPercent / 100));
  const defaultProposedNetPricePerCase = priceAfterIncrease(defaultApprovedNumbers.currentNetPricePerCase, defaultApprovedNumbers.ingoingAskPercent);
  const defaultTargetNetPricePerCase = priceAfterIncrease(defaultApprovedNumbers.currentNetPricePerCase, defaultApprovedNumbers.targetPercent);
  const defaultProjectedNrImpact = Math.round(defaultApprovedNumbers.annualCaseVolume * (defaultProposedNetPricePerCase - defaultApprovedNumbers.currentNetPricePerCase));
  const defaultProjectedGmImpact = Math.round(defaultProjectedNrImpact * (defaultApprovedNumbers.grossMarginRate / 100));
  const defaultProjectedVolumeRisk = Math.round(defaultApprovedNumbers.annualCaseVolume * defaultApprovedNumbers.currentNetPricePerCase * (defaultApprovedNumbers.volumeRiskPercent / 100));
  const impactPreviewItems = [
    {
      defaultValue: defaultApprovedNumbers.currentNetPricePerCase,
      label: 'Current net price',
      value: currentNetPricePerCase,
      valueLabel: netPricePerCase(currentNetPricePerCase)
    },
    {
      defaultValue: defaultProposedNetPricePerCase,
      label: 'Proposed net price',
      value: proposedNetPricePerCase,
      valueLabel: netPricePerCase(proposedNetPricePerCase)
    },
    {
      defaultValue: defaultTargetNetPricePerCase,
      label: 'Target landed price',
      value: targetNetPricePerCase,
      valueLabel: netPricePerCase(targetNetPricePerCase)
    },
    {
      defaultValue: defaultProjectedNrImpact,
      label: 'NR impact',
      value: projectedNrImpact,
      valueLabel: euros(projectedNrImpact)
    },
    {
      defaultValue: defaultProjectedGmImpact,
      label: 'GM impact',
      value: projectedGmImpact,
      valueLabel: euros(projectedGmImpact)
    },
    {
      defaultValue: defaultProjectedVolumeRisk,
      label: 'Volume risk',
      value: projectedVolumeRisk,
      valueLabel: euros(projectedVolumeRisk)
    },
    {
      defaultValue: defaultApprovedNumbers.tradeSpendEnvelope,
      label: 'Trade spend envelope',
      value: approvedNumbers.tradeSpendEnvelope,
      valueLabel: euros(approvedNumbers.tradeSpendEnvelope)
    }
  ];
  const primarySource = workspace.documents.find((document) => document.status === 'approved')?.source
    ?? workspace.documents[0]?.source
    ?? workspace.buyingGroup.source;
  const numberEvidenceItems = [
    {
      id: 'buyer-ask',
      label: 'Buyer ask',
      metric: profileRead.currentState.latestBuyerAsk,
      supports: 'Explains the gap the buyer is trying to anchor before PepsiCo counters.',
      calculation: `Buyer ask is ${testRead.askGap.toFixed(1)} pts above PepsiCo proposed ask; ATLAS treats that gap as the opening pressure to test.`,
      proofType: 'Buyer behavior',
      priorOutcome: workspace.timelineEvents[0]?.title ?? 'No prior-year ask outcome loaded',
      source: workspace.timelineEvents[0]?.source ?? primarySource
    },
    {
      id: 'pepsico-position',
      label: 'PepsiCo proposed ask',
      metric: `${ingoingAsk.toFixed(1)}% · ${netPricePerCase(proposedNetPricePerCase)}`,
      supports: 'Sets the opening position and translates the percent ask into the price CNO is taking into the room.',
      calculation: `${netPricePerCase(currentNetPricePerCase)} current net price moves to ${netPricePerCase(proposedNetPricePerCase)}, creating ${euros(projectedNrImpact)} projected NR impact.`,
      proofType: 'Finance model',
      priorOutcome: workspace.documents[0]?.title ?? 'Finance pricing model',
      source: primarySource
    },
    {
      id: 'target',
      label: 'Target landed price',
      metric: `${target.toFixed(1)}% · ${netPricePerCase(targetNetPricePerCase)}`,
      supports: 'Defines the outcome ATLAS expects the team to defend after negotiation movement.',
      calculation: `${target.toFixed(1)}% landed increase protects about ${euros(grossMarginImpact(target))} GM before trade support.`,
      proofType: 'Approved target',
      priorOutcome: workspace.documents[0]?.title ?? 'Approved finance target',
      source: workspace.documents[0]?.source ?? primarySource
    },
    {
      id: 'guardrail',
      label: 'Fallback / red line',
      metric: `${fallback.toFixed(1)}% / ${redLine.toFixed(1)}%`,
      supports: 'Defines where concessions can move and where the CNO should stop.',
      calculation: `${fallback.toFixed(1)}% is ${Math.max(0, fallback - redLine).toFixed(1)} pts above the red line; current guardrail read is ${testRead.guardrailRisk}.`,
      proofType: 'Guardrail',
      priorOutcome: workspace.documents[1]?.title ?? 'Finance/NRM guardrail memory',
      source: workspace.documents[1]?.source ?? primarySource
    },
    {
      id: 'margin-impact',
      label: 'Margin impact',
      metric: euros(profileRead.exposure.marginAtRisk),
      supports: 'Shows why the corridor should not be traded away without a give/get commitment.',
      calculation: `${euros(projectedGmImpact)} projected GM impact versus ${euros(profileRead.exposure.marginAtRisk)} buyer-level margin at risk.`,
      proofType: 'P&L exposure',
      priorOutcome: workspace.buyingGroup.name,
      source: workspace.buyingGroup.source
    },
    {
      id: 'volume-risk',
      label: 'Volume risk',
      metric: `${approvedNumbers.volumeRiskPercent.toFixed(1)}% · ${euros(projectedVolumeRisk)}`,
      supports: 'Shows the downside ATLAS is testing against the buyer response.',
      calculation: `${approvedNumbers.annualCaseVolume.toLocaleString()} cases at ${netPricePerCase(currentNetPricePerCase)} with ${approvedNumbers.volumeRiskPercent.toFixed(1)}% modeled volume movement.`,
      proofType: 'Buyer response model',
      priorOutcome: workspace.scenarioModels[0]?.name ?? 'Scenario memory',
      source: workspace.scenarioModels[0]?.sourceIds?.[0] ? primarySource : workspace.buyingGroup.source
    }
  ];
  const activeEvidence = numberEvidenceItems.find((item) => item.id === activeEvidenceId) ?? numberEvidenceItems[0];
  const pushbackItems = [
    {
      objection: 'Buyer says the ask is above market tolerance.',
      response: `Hold ${ingoingAsk.toFixed(1)}% and show the corridor before discussing support.`,
      proof: 'Pricing corridor + prior-year landed outcome',
      why: `${testRead.askGap.toFixed(1)} pts ask gap gives the buyer a reason to challenge the first counter.`,
      boundary: `Do not move below ${fallback.toFixed(1)}% without a volume or execution commitment.`
    },
    {
      objection: 'Buyer asks for trade spend before accepting the counter.',
      response: `Keep support conditional; do not move below ${fallback.toFixed(1)}% without a commitment.`,
      proof: 'Trade spend impact bridge',
      why: `${euros(approvedNumbers.tradeSpendEnvelope)} support envelope is available, but it should protect ${netPricePerCase(priceAfterIncrease(currentNetPricePerCase, fallback))} fallback pricing.`,
      boundary: `Escalate if requested support exceeds ${euros(approvedNumbers.tradeSpendEnvelope)}.`
    },
    {
      objection: 'Buyer challenges category value or affordability.',
      response: 'Use external signal only as backup, then bring the conversation back to value and execution.',
      proof: workspace.signals[0]?.title ?? 'Market signal summary',
      why: workspace.signals[0]?.negotiationImplication ?? 'External signals are useful only when they change the buyer response.',
      boundary: 'Do not lead with market pressure unless the buyer raises affordability or volume.'
    }
  ];
  const financeInputRows: Array<{
    basis: string;
    context: (value: number) => string;
    group: 'price' | 'assumption';
    key: keyof typeof approvedNumbers;
    label: string;
    source: SourceMeta;
    sourceSummary: string;
    suffix: '%' | 'EUR' | 'EUR / case' | 'cases';
  }> = [
    {
      basis: 'Increase vs current customer net price',
      context: (value) => `${netPricePerCase(currentNetPricePerCase)} to ${netPricePerCase(priceAfterIncrease(currentNetPricePerCase, value))}; ${euros(netRevenueImpact(value))} estimated NR impact.`,
      group: 'price',
      key: 'ingoingAskPercent',
      label: 'PepsiCo proposed net price increase',
      source: primarySource,
      sourceSummary: 'Editable working ask for PepsiCo. The default is seeded from ATLAS recommendation logic using target, prior-year landed outcome, current buyer ask, and buyer-response model.',
      suffix: '%'
    },
    {
      basis: 'Expected landed increase after negotiation',
      context: (value) => `${netPricePerCase(priceAfterIncrease(currentNetPricePerCase, value))} expected landed net price; protects ${euros(grossMarginImpact(value))} gross margin.`,
      group: 'price',
      key: 'targetPercent',
      label: 'Target landed net price increase',
      source: workspace.documents[0]?.source ?? primarySource,
      sourceSummary: 'Pulled from approved finance target and adjusted against buyer-level margin exposure.',
      suffix: '%'
    },
    {
      basis: 'Concession floor before red line',
      context: (value) => `${netPricePerCase(priceAfterIncrease(currentNetPricePerCase, value))} fallback net price; ${euros(netRevenueImpact(value))} NR before conditional support.`,
      group: 'price',
      key: 'fallbackPercent',
      label: 'Fallback landed increase',
      source: workspace.documents[1]?.source ?? primarySource,
      sourceSummary: 'Built from Finance/NRM guardrail memory and the concession floor used in the latest scenario plan.',
      suffix: '%'
    },
    {
      basis: 'Do-not-cross price realization guardrail',
      context: (value) => `${netPricePerCase(priceAfterIncrease(currentNetPricePerCase, value))} minimum net price; below this ATLAS flags margin guardrail breach.`,
      group: 'price',
      key: 'redLinePercent',
      label: 'Red line',
      source: workspace.documents[1]?.source ?? primarySource,
      sourceSummary: 'Uses guardrail logic from approved finance memory and flags where margin risk becomes unacceptable.',
      suffix: '%'
    },
    {
      basis: 'Current buyer net price base',
      context: (value) => `${netPricePerCase(value)} used as the base for price-move impact calculations.`,
      group: 'assumption',
      key: 'currentNetPricePerCase',
      label: 'Current net price',
      source: primarySource,
      sourceSummary: 'Estimated buyer net price per case used to translate percent moves into actual pricing.',
      suffix: 'EUR / case'
    },
    {
      basis: 'Annual cases under negotiation',
      context: (value) => `${value.toLocaleString()} annual cases used to translate price moves into NR impact.`,
      group: 'assumption',
      key: 'annualCaseVolume',
      label: 'Annual case volume',
      source: workspace.buyingGroup.source,
      sourceSummary: 'Estimated annual case volume tied to this buying group negotiation scope.',
      suffix: 'cases'
    },
    {
      basis: 'Gross margin conversion rate',
      context: (value) => `${value.toFixed(1)}% gross margin rate applied to estimated net revenue impact.`,
      group: 'assumption',
      key: 'grossMarginRate',
      label: 'Gross margin rate',
      source: workspace.documents[0]?.source ?? primarySource,
      sourceSummary: 'Finance-modeled gross margin rate used for strategy impact preview.',
      suffix: '%'
    },
    {
      basis: 'Expected volume downside',
      context: (value) => `${value.toFixed(1)}% volume risk creates ${euros(Math.round(approvedNumbers.annualCaseVolume * currentNetPricePerCase * (value / 100)))} downside exposure.`,
      group: 'assumption',
      key: 'volumeRiskPercent',
      label: 'Volume risk',
      source: workspace.scenarioModels[0]?.sourceIds?.[0] ? primarySource : workspace.buyingGroup.source,
      sourceSummary: 'Modeled buyer response risk from prior outcomes, market pressure, and current ask gap.',
      suffix: '%'
    },
    {
      basis: 'Conditional support budget',
      context: (value) => `${euros(value)} available against ${euros(profileRead.exposure.tradeSpendExposure)} trade spend exposure.`,
      group: 'assumption',
      key: 'tradeSpendEnvelope',
      label: 'Trade spend envelope',
      source: workspace.buyingGroup.source,
      sourceSummary: 'Estimated from buyer trade spend exposure and current market pressure for this buying group.',
      suffix: 'EUR'
    }
  ];
  const priceMoveRows = financeInputRows.filter((row) => row.group === 'price');
  const pricingAssumptionRows = financeInputRows.filter((row) => row.group === 'assumption');
  const guidedTabs: Array<{ id: BuyerStrategyWorkspaceTab; label: string; read: string }> = [
    { id: 'position', label: 'Set position', read: 'Build the pricing position' },
    { id: 'stress', label: 'Stress test', read: 'Compare A/B/C outcomes' },
    { id: 'evidence', label: 'Evidence', read: 'Choose support for the scenario' },
    { id: 'pushback', label: 'Pushback', read: 'Prepare buyer response' },
    { id: 'output', label: 'Output', read: 'Export selected evidence' }
  ];
  const buyerCounterNumbers = {
    ...approvedNumbers,
    fallbackPercent: Math.max(redLine, fallback - 0.25),
    ingoingAskPercent: Math.max(redLine, ingoingAsk - 0.35),
    targetPercent: Math.max(redLine, target - 0.3),
    tradeSpendEnvelope: Math.round(approvedNumbers.tradeSpendEnvelope * 1.18),
    volumeRiskPercent: Number((approvedNumbers.volumeRiskPercent - 0.8).toFixed(1))
  };
  const scenarioCards = [
    {
      id: 'default',
      label: 'A',
      name: 'ATLAS recommended',
      read: 'Default strategy based on approved finance inputs, buyer history, and current market pressure.',
      test: defaultTestRead,
      numbers: defaultApprovedNumbers
    },
    {
      id: 'adjusted',
      label: 'B',
      name: 'CNO adjusted',
      read: 'Current working strategy using the inputs edited on this page.',
      test: testRead,
      numbers: approvedNumbers
    },
    {
      id: 'counter',
      label: 'C',
      name: 'Likely buyer counter',
      read: 'Downside case if the buyer forces more support or lower landed realization.',
      test: buildInlineStrategyTest(workspace, profileRead, strategyPlan, {
        fallbackPercent: buyerCounterNumbers.fallbackPercent,
        ingoingAskPercent: buyerCounterNumbers.ingoingAskPercent,
        redLinePercent: buyerCounterNumbers.redLinePercent,
        targetPercent: buyerCounterNumbers.targetPercent
      }),
      numbers: buyerCounterNumbers
    }
  ];
  const usedEvidenceCount = Object.values(inputStatuses).filter((status) => status === 'used').length || 3;
  const outputEvidenceItems = numberEvidenceItems.filter((item) => (inputStatuses[item.id] ?? 'recommended') !== 'excluded').slice(0, Math.max(3, usedEvidenceCount));

  function setStatus(id: string, status: StrategyInputStatus) {
    setInputStatuses((current) => ({ ...current, [id]: status }));
  }

  function updateApprovedNumber(key: keyof typeof approvedNumbers, value: number) {
    setApprovedNumbers((current) => ({ ...current, [key]: Number.isFinite(value) ? value : current[key] }));
    setNumberSaveState('');
  }

  function resetApprovedNumbers() {
    setApprovedNumbers(defaultApprovedNumbers);
    setNumberSaveState('Reset to default values');
  }

  function saveApprovedNumbers() {
    setNumberSaveState('Inputs saved for this strategy draft');
  }

  function formatNumberInputValue(row: { suffix: '%' | 'EUR' | 'EUR / case' | 'cases' }, value: number) {
    if (row.suffix === '%') return `${value.toFixed(1)}%`;
    if (row.suffix === 'EUR / case') return netPricePerCase(value);
    if (row.suffix === 'cases') return value.toLocaleString();
    return euros(value);
  }

  function inputStepForSuffix(suffix: '%' | 'EUR' | 'EUR / case' | 'cases') {
    if (suffix === '%') return 0.1;
    if (suffix === 'EUR / case') return 0.05;
    if (suffix === 'cases') return 10000;
    return 10000;
  }

  function netPricePerCase(value: number) {
    return `EUR ${value.toFixed(2)} / case`;
  }

  function priceAfterIncrease(basePrice: number, increasePercent: number) {
    return Number((basePrice * (1 + increasePercent / 100)).toFixed(2));
  }

  function netRevenueImpact(increasePercent: number) {
    return Math.round(profileRead.exposure.revenueUnderNegotiation * (increasePercent / 100));
  }

  function grossMarginImpact(increasePercent: number) {
    return Math.round(netRevenueImpact(increasePercent) * 0.31);
  }

  function numberDeltaPercent(value: number, baseline: number) {
    if (!baseline) return 0;
    return ((value - baseline) / baseline) * 100;
  }

  function deltaTone(delta: number) {
    if (Math.abs(delta) < 0.05) return 'neutral';
    return delta > 0 ? 'positive' : 'negative';
  }

  function deltaLabel(delta: number) {
    if (Math.abs(delta) < 0.05) return '0% from default';
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}% from default`;
  }

  function compactDeltaLabel(delta: number) {
    if (Math.abs(delta) < 0.05) return '0%';
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  }

  function impactDeltaPercent(value: number, baseline: number) {
    if (!baseline) return 0;
    return ((value - baseline) / Math.abs(baseline)) * 100;
  }

  return (
    <section className="atlas-buyer-strategy-workspace" aria-label={`${workspace.buyingGroup.name} embedded strategy workspace`}>
      <section className="atlas-buyer-strategy-guided-layout">
        <aside className="atlas-buyer-strategy-side-tabs" aria-label="Buying group strategy views">
          {guidedTabs.map((tab) => (
            <button
              className={activeWorkspaceTab === tab.id ? 'active' : ''}
              key={tab.id}
              onClick={() => setActiveWorkspaceTab(tab.id)}
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{tab.read}</span>
            </button>
          ))}
        </aside>

        <div className="atlas-buyer-strategy-tab-panel">
          {activeWorkspaceTab === 'position' ? (
            <section className="atlas-set-numbers-card">
              <section className="atlas-ai-starting-point-panel">
                <header>
                  <span>AI recommendation</span>
                  <h3>
                    Start from the recommended pricing position, then adjust the approved finance inputs and watch the strategy test update.
                  </h3>
                </header>
                <dl>
                  <button className={activeEvidenceId === 'buyer-ask' ? 'active' : ''} type="button" onClick={() => setActiveEvidenceId('buyer-ask')}>
                    <dt>Buyer ask</dt><dd>{profileRead.currentState.latestBuyerAsk}</dd>
                  </button>
                  <button className={activeEvidenceId === 'pepsico-position' ? 'active' : ''} type="button" onClick={() => setActiveEvidenceId('pepsico-position')}>
                    <dt>PepsiCo ask</dt><dd>{defaultApprovedNumbers.ingoingAskPercent.toFixed(1)}% · {netPricePerCase(defaultProposedNetPricePerCase)}</dd>
                  </button>
                  <button className={activeEvidenceId === 'target' ? 'active' : ''} type="button" onClick={() => setActiveEvidenceId('target')}>
                    <dt>Target landed</dt><dd>{defaultApprovedNumbers.targetPercent.toFixed(1)}% · {netPricePerCase(defaultTargetNetPricePerCase)}</dd>
                  </button>
                  <button className={activeEvidenceId === 'guardrail' ? 'active' : ''} type="button" onClick={() => setActiveEvidenceId('guardrail')}>
                    <dt>Fallback / red line</dt><dd>{defaultApprovedNumbers.fallbackPercent.toFixed(1)}% / {defaultApprovedNumbers.redLinePercent.toFixed(1)}%</dd>
                  </button>
                </dl>
              </section>
              <section className="atlas-finance-number-builder">
                <header className="atlas-set-pricing-header">
                  <span>Set Pricing</span>
                </header>
                <aside className="atlas-pricing-impact-preview">
                  <header>
                    <span>What these inputs do</span>
                    <h4>Impact preview</h4>
                  </header>
                  <dl>
                    {impactPreviewItems.map((item) => {
                      const delta = impactDeltaPercent(item.value, item.defaultValue);
                      return (
                        <div key={item.label}>
                          <dt>{item.label}</dt>
                          <dd>
                            <strong>{item.valueLabel}</strong>
                            <b className={`atlas-number-delta-pill tone-${deltaTone(delta)}`}>{compactDeltaLabel(delta)}</b>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </aside>
                <section className="atlas-live-strategy-read" aria-label="Live strategy test while setting pricing">
                  <header>
                    <span>Live strategy test</span>
                    <h3>{testRead.likelihood}% likely to land · {testRead.guardrailRisk}</h3>
                    <p>{testRead.expectedBuyerResponse}</p>
                  </header>
                  <dl>
                    <div><dt>NR impact</dt><dd>{euros(projectedNrImpact)}</dd></div>
                    <div><dt>GM impact</dt><dd>{euros(projectedGmImpact)}</dd></div>
                    <div><dt>Trade spend</dt><dd>{euros(approvedNumbers.tradeSpendEnvelope)}</dd></div>
                    <div><dt>Volume risk</dt><dd>{euros(projectedVolumeRisk)}</dd></div>
                  </dl>
                  <div className="atlas-live-strategy-edits">
                    {testRead.recommendedEdits.map((edit) => <p key={edit}>{edit}</p>)}
                  </div>
                </section>
                <div className="atlas-pricing-builder-layout">
                  <section className="atlas-pricing-worksheet">
                    <header>
                      <h4>Editable pricing worksheet</h4>
                      <span>Change approved inputs, then compare the updated impact above.</span>
                    </header>
                    <div className="atlas-pricing-worksheet-rows">
                      <div className="atlas-pricing-worksheet-group atlas-pricing-worksheet-group-with-actions">
                        <span>Price move</span>
                        <div className="atlas-pricing-worksheet-actions">
                          {numberSaveState ? <small>{numberSaveState}</small> : null}
                          <button type="button" onClick={saveApprovedNumbers}>Save inputs</button>
                          <button type="button" onClick={resetApprovedNumbers}>Reset to default</button>
                        </div>
                      </div>
                      {priceMoveRows.map((row) => {
                        const value = approvedNumbers[row.key];
                        const defaultValue = defaultApprovedNumbers[row.key];
                        const delta = numberDeltaPercent(value, defaultValue);
                        return (
                          <label className="atlas-pricing-worksheet-row" key={row.key}>
                            <span>
                              <strong>{row.label}</strong>
                              <small>{row.basis}</small>
                            </span>
                            <div className="atlas-pricing-input-control">
                              <input
                                min={0}
                                onChange={(event) => updateApprovedNumber(row.key, Number.parseFloat(event.target.value))}
                                step={inputStepForSuffix(row.suffix)}
                                type="number"
                                value={value}
                              />
                              <em>{row.suffix}</em>
                            </div>
                            <b className={`atlas-number-delta-pill tone-${deltaTone(delta)}`}>{deltaLabel(delta)}</b>
                            <button className="atlas-row-evidence-link" type="button" onClick={() => setActiveEvidenceId(row.key === 'targetPercent' ? 'target' : row.key === 'fallbackPercent' || row.key === 'redLinePercent' ? 'guardrail' : 'pepsico-position')}>
                              Evidence
                            </button>
                          </label>
                        );
                      })}
                      <div className="atlas-pricing-worksheet-group">Pricing assumptions</div>
                      {pricingAssumptionRows.map((row) => {
                        const value = approvedNumbers[row.key];
                        const defaultValue = defaultApprovedNumbers[row.key];
                        const delta = numberDeltaPercent(value, defaultValue);
                        return (
                          <label className="atlas-pricing-worksheet-row" key={row.key}>
                            <span>
                              <strong>{row.label}</strong>
                              <small>{row.basis}</small>
                            </span>
                            <div className="atlas-pricing-input-control">
                              <input
                                min={row.key === 'volumeRiskPercent' ? -20 : 0}
                                onChange={(event) => updateApprovedNumber(row.key, Number.parseFloat(event.target.value))}
                                step={inputStepForSuffix(row.suffix)}
                                type="number"
                                value={value}
                              />
                              <em>{row.suffix}</em>
                            </div>
                            <b className={`atlas-number-delta-pill tone-${deltaTone(delta)}`}>{deltaLabel(delta)}</b>
                            <button className="atlas-row-evidence-link" type="button" onClick={() => setActiveEvidenceId(row.key === 'volumeRiskPercent' ? 'volume-risk' : row.key === 'tradeSpendEnvelope' ? 'margin-impact' : 'pepsico-position')}>
                              Evidence
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                </div>
                <div className="atlas-number-source-row">
                  <SourceTrustMini source={primarySource} />
                  <button className="atlas-number-source-link" type="button" onClick={() => setNumberSourceOpen(true)}>
                    Dig deeper: where did the numbers come from?
                  </button>
                </div>
              </section>
              <section className="atlas-number-evidence-tray" aria-label="Evidence tied to selected pricing number">
                <header>
                  <span>{activeEvidence.proofType}</span>
                  <h3>{activeEvidence.label}: {activeEvidence.metric}</h3>
                  <p>{activeEvidence.supports}</p>
                </header>
                <div>
                  <article>
                    <span>Calculation logic</span>
                    <strong>{activeEvidence.calculation}</strong>
                  </article>
                  <article>
                    <span>Prior outcome / memory</span>
                    <strong>{activeEvidence.priorOutcome}</strong>
                  </article>
                  <article>
                    <span>Source validation</span>
                    <strong>{sourceDisplayName(activeEvidence.source)}</strong>
                    <SourceTrustMini source={activeEvidence.source} />
                  </article>
                </div>
                <footer>
                  <StrategyStatusPill status={inputStatuses[activeEvidence.id] ?? 'recommended'} />
                  <button type="button" onClick={() => setStatus(activeEvidence.id, 'used')}>Use in scenario</button>
                  <button type="button" onClick={() => setStatus(activeEvidence.id, 'needs_review')}>Needs review</button>
                  <button type="button" onClick={() => setStatus(activeEvidence.id, 'excluded')}>Exclude</button>
                </footer>
              </section>
              {numberSourceOpen ? (
                <div className="atlas-source-drawer-backdrop" role="presentation" onClick={() => setNumberSourceOpen(false)}>
                  <aside className="atlas-source-drawer atlas-number-source-drawer" aria-label="Number source detail" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                    <header>
                      <div>
                        <span>Number source summary</span>
                        <h2>Where the strategy inputs came from</h2>
                      </div>
                      <button type="button" aria-label="Close number source detail" onClick={() => setNumberSourceOpen(false)}><X size={17} /></button>
                    </header>
                    <section className="atlas-number-source-summary">
                      <p>
                        ATLAS prefilled these values from approved finance inputs, buyer history, current market pressure, and modeled concession guardrails. Any change you make is treated as a CNO working assumption until saved and reviewed.
                      </p>
                    </section>
                    <div className="atlas-number-source-list">
                      {financeInputRows.map((row) => {
                        const value = approvedNumbers[row.key];
                        const defaultValue = defaultApprovedNumbers[row.key];
                        const delta = numberDeltaPercent(value, defaultValue);
                        return (
                          <article key={row.key}>
                            <div>
                              <span>{row.label}</span>
                              <strong>{formatNumberInputValue(row, value)}</strong>
                            </div>
                            <p>{row.sourceSummary}</p>
                            <dl>
                              <div><dt>Default</dt><dd>{formatNumberInputValue(row, defaultValue)}</dd></div>
                              <div><dt>Change</dt><dd>{deltaLabel(delta)}</dd></div>
                              <div><dt>Commercial read</dt><dd>{row.context(value)}</dd></div>
                              <div><dt>Source</dt><dd>{sourceDisplayName(row.source)}</dd></div>
                              <div><dt>Confidence</dt><dd>{row.source.confidence}</dd></div>
                            </dl>
                          </article>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              ) : null}
              <StrategyPricingCorridor buyerAsk={testRead.buyerAsk} fallback={fallback} ingoingAsk={ingoingAsk} redLine={redLine} target={target} />
              <section className="atlas-buyer-likely-response-panel">
                <header>
                  <span>Buyer likely response</span>
                  <h3>{testRead.expectedBuyerResponse}</h3>
                </header>
                <div>
                  <article>
                    <span>Past behavior</span>
                    <strong>{workspace.timelineEvents[0]?.title ?? 'No prior-year event loaded'}</strong>
                    <p>{workspace.timelineEvents[0]?.summary ?? 'Add prior-year negotiation memory before locking this strategy.'}</p>
                  </article>
                  <article>
                    <span>Market signal</span>
                    <strong>{workspace.signals[0]?.title ?? 'No external signal attached'}</strong>
                    <p>{workspace.signals[0]?.negotiationImplication ?? 'Do not introduce external signals unless they change the buyer response.'}</p>
                  </article>
                  <article>
                    <span>ATLAS read</span>
                    <strong>{testRead.likelihood}% likelihood to land</strong>
                    <p>Buyer leverage is shaped by {testRead.leveragePoints.join(', ')}.</p>
                  </article>
                </div>
              </section>
            </section>
          ) : null}

          {activeWorkspaceTab === 'stress' ? (
            <section className="atlas-buyer-scenario-module" aria-label="Inline strategy scenarios">
              <header>
                <span>Stress test</span>
                <h3>Compare the recommended plan, your adjusted plan, and likely buyer counter.</h3>
                <p>Use this to see whether the current position still protects margin, lands inside guardrails, and gives the CNO a defensible response path.</p>
              </header>
              <div className="atlas-buyer-scenario-cards">
                {scenarioCards.map((scenario) => (
                  <article key={scenario.id}>
                    <span>{scenario.label} · {scenario.name}</span>
                    <strong>{scenario.test.likelihood}% likely · {scenario.test.guardrailRisk}</strong>
                    <p>{scenario.read}</p>
                    <dl>
                      <div><dt>Ask</dt><dd>{scenario.numbers.ingoingAskPercent.toFixed(1)}%</dd></div>
                      <div><dt>Target</dt><dd>{scenario.numbers.targetPercent.toFixed(1)}%</dd></div>
                      <div><dt>Fallback</dt><dd>{scenario.numbers.fallbackPercent.toFixed(1)}%</dd></div>
                      <div><dt>NR</dt><dd>{euros(scenario.test.scenarioOutputs.revenueImpact)}</dd></div>
                      <div><dt>GM</dt><dd>{euros(scenario.test.scenarioOutputs.marginImpact)}</dd></div>
                      <div><dt>Trade</dt><dd>{euros(scenario.test.scenarioOutputs.tradeSpendImpact)}</dd></div>
                    </dl>
                    <p>{scenario.test.recommendedEdits[0]}</p>
                    <SourceTrustMini source={scenario.id === 'counter' ? workspace.signals[0]?.source ?? primarySource : primarySource} />
                  </article>
                ))}
              </div>
              <section className="atlas-strategy-test-card atlas-buyer-inline-test-card">
                <span>Current tested read</span>
                <strong>{testRead.likelihood}% likelihood to land</strong>
                <p>{testRead.expectedBuyerResponse}</p>
                <dl>
                  <div><dt>Guardrail</dt><dd>{testRead.guardrailRisk}</dd></div>
                  <div><dt>Margin</dt><dd>{euros(testRead.scenarioOutputs.marginImpact)}</dd></div>
                  <div><dt>Trade</dt><dd>{euros(testRead.scenarioOutputs.tradeSpendImpact)}</dd></div>
                </dl>
              </section>
              <section className="atlas-strategy-recommendation-panel">
                <header>
                  <span>ATLAS recommended edits</span>
                  <h3>Change only what improves likelihood without breaking the corridor.</h3>
                </header>
                <div>
                  {testRead.recommendedEdits.map((edit) => <p key={edit}>{edit}</p>)}
                </div>
              </section>
            </section>
          ) : null}

          {activeWorkspaceTab === 'evidence' ? (
            <>
              <StrategyInputInbox savedViews={savedViews} statuses={inputStatuses} workspace={workspace} />
              <section className="atlas-buyer-embedded-evidence-grid" aria-label="Evidence tied to strategy numbers">
                <header>
                  <span>Evidence</span>
                  <h3>Choose evidence that explains the pricing position, not generic supporting documents.</h3>
                </header>
                <div>
                  {numberEvidenceItems.map((item) => {
                    const status = inputStatuses[item.id] ?? 'recommended';
                    return (
                      <article key={item.id}>
                        <div>
                          <span>{item.proofType}</span>
                          <strong>{item.label}: {item.metric}</strong>
                        </div>
                        <p>{item.supports}</p>
                        <p>{item.calculation}</p>
                        <SourceTrustMini source={item.source} />
                        <StrategyStatusPill status={status} />
                        <footer>
                          <button onClick={() => setStatus(item.id, 'used')} type="button">Include</button>
                          <button onClick={() => setStatus(item.id, 'needs_review')} type="button">Review</button>
                          <button onClick={() => setStatus(item.id, 'excluded')} type="button">Exclude</button>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}

          {activeWorkspaceTab === 'pushback' ? (
            <section className="atlas-buyer-pushback-grid" aria-label="Buyer pushback preparation">
              <header>
                <span>Prepare pushback</span>
              <h3>What the buyer may say, what to answer, and what evidence to show.</h3>
              </header>
              <div>
                {pushbackItems.map((item) => (
                  <article key={item.objection}>
                    <span>Expected objection</span>
                    <strong>{item.objection}</strong>
                    <p>{item.why}</p>
                    <p>{item.response}</p>
                    <em>{item.proof}</em>
                    <small>{item.boundary}</small>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeWorkspaceTab === 'output' ? (
            <section className="atlas-room-plan-preview atlas-strategy-deck-preview">
              <div>
                <span>Scenario output</span>
                <h3>Export the selected scenario evidence.</h3>
                <p>This output uses the current pricing inputs, tested scenario read, selected evidence, buyer pushback responses, and concession stop point.</p>
                <dl>
                  <div><dt>PepsiCo ask</dt><dd>{ingoingAsk.toFixed(1)}% · {netPricePerCase(proposedNetPricePerCase)}</dd></div>
                  <div><dt>Likelihood</dt><dd>{testRead.likelihood}% · {testRead.guardrailRisk}</dd></div>
                  <div><dt>Margin risk</dt><dd>{euros(profileRead.exposure.marginAtRisk)}</dd></div>
                  <div><dt>Evidence items</dt><dd>{outputEvidenceItems.length}</dd></div>
                </dl>
                <ul className="atlas-deck-proof-list">
                  {outputEvidenceItems.map((item) => (
                    <li key={item.id}>{item.label}: {item.metric}</li>
                  ))}
                </ul>
              </div>
              <button type="button" onClick={() => window.print()}><Download size={15} /> Export scenario output</button>
            </section>
          ) : null}
        </div>
      </section>
    </section>
  );
}

function BuyingGroupGeneratedPanel({
  onAddProfileUpdate,
  profileRead,
  prompt,
  profileUpdates,
  scenarioAlerts,
  view,
  workspace
}: {
  onAddProfileUpdate: (update: BuyerProfileDocumentUpdate) => void;
  profileRead: BuyerProfileRead;
  prompt?: string;
  profileUpdates: BuyerProfileDocumentUpdate[];
  scenarioAlerts: AtlasActiveAlert[];
  view: BuyingGroupGeneratedView;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const savedViews = useStoredGeneratedViews({ buyingGroupId: workspace.buyingGroup.id });
  return (
    <section className="atlas-generated-panel">
      {view === 'financials' ? <BuyingGroupFinancialPanel profileRead={profileRead} workspace={workspace} /> : null}

      {view === 'memory' ? (
        <section className="atlas-generated-memory" id="group-timeline">
          <ConfirmedProfileImpactStrip updates={profileUpdates} />
          <section className="atlas-history-source-grid">
            <div>
              <div className="atlas-history-section-head">
                <SectionTitle title="Negotiation history" />
                <BuyerProfileUpdatePanel buyingGroup={workspace.buyingGroup} onAddUpdate={onAddProfileUpdate} updates={profileUpdates} />
              </div>
              <DebriefMemoryComparison workspace={workspace} />
              {workspace.timelineEvents.length || workspace.documents.length || profileUpdates.length || savedViews.length ? (
                <TimelineFeed documents={workspace.documents} events={workspace.timelineEvents} generatedViews={savedViews} updates={profileUpdates} />
              ) : <EmptyGeneratedState label="History" />}
            </div>
            <div>
              <SectionTitle title="Stored documents" />
              <SupportingDocumentLedger buyingGroupId={workspace.buyingGroup.id} documents={workspace.documents} generatedViews={savedViews} updates={profileUpdates} />
            </div>
          </section>
        </section>
      ) : null}

      {view === 'strategy' ? (
        <BuyerPredictiveScenarioWorkspace
          profileRead={profileRead}
          savedViews={savedViews}
          scenarioAlerts={scenarioAlerts}
          workspace={workspace}
        />
      ) : null}

      {view === 'custom' ? (
        <BuyingGroupCustomReport prompt={prompt || `Create a focused read for ${workspace.buyingGroup.name}.`} profileRead={profileRead} workspace={workspace} />
      ) : null}
    </section>
  );
}

function normalizeGeneratedView(view?: string): BuyingGroupGeneratedView {
  if (view === 'documents' || view === 'memory' || view === 'history') return 'strategy';
  if (view === 'snapshot' || view === 'intelligence' || view === 'overview') return 'strategy';
  if (view === 'financials' || view === 'scenario' || view === 'scenarios' || view === 'live') return 'strategy';
  if (view === 'strategy' || view === 'custom') return view;
  return 'strategy';
}

function normalizePhase(phase?: string, fallback = 'monitor') {
  if (phase === 'monitor' || phase === 'prep' || phase === 'active' || phase === 'review' || phase === 'debrief') return phase;
  return fallback;
}

function BuyingGroupWorkspaceTabs({
  activeView,
  customPrompt,
  onSelectView,
  workspace
}: {
  activeView: BuyingGroupGeneratedView;
  customPrompt: string;
  onSelectView: (view: BuyingGroupGeneratedView) => void;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const baseTabs: Array<{ description: string; label: string; view: BuyingGroupGeneratedView }> = [
    { view: 'strategy', label: 'Scenario workspace', description: 'Model buyer response and choose a move' },
    { view: 'memory', label: 'Scenario memory', description: 'Use outcomes, docs, and debrief patterns' },
    { view: 'financials', label: 'Scenario inputs', description: 'Pressure-test price and concessions' }
  ];
  const tabs = customPrompt
    ? [...baseTabs, { view: 'custom' as BuyingGroupGeneratedView, label: 'Custom scenario view', description: 'Open the requested buyer read' }]
    : baseTabs;

  return (
    <nav className="atlas-buyer-workspace-tabs atlas-buyer-guided-tabs" aria-label={`${workspace.buyingGroup.name} guided workflow`}>
      {tabs.map((tab) => (
        <button
          className={activeView === tab.view ? 'active' : ''}
          key={tab.view}
          onClick={() => onSelectView(tab.view)}
          type="button"
        >
          <strong>{tab.label}</strong>
          <small>{tab.description}</small>
        </button>
      ))}
    </nav>
  );
}

function BuyingGroupGenerativeWorkspace({
  initialPhase,
  initialPrompt,
  initialView,
  onAddProfileUpdate,
  profileRead,
  profileUpdates,
  scenarioAlerts,
  workspace
}: {
  initialPhase?: string;
  initialPrompt?: string;
  initialView?: string;
  onAddProfileUpdate: (update: BuyerProfileDocumentUpdate) => void;
  profileRead: BuyerProfileRead;
  profileUpdates: BuyerProfileDocumentUpdate[];
  scenarioAlerts: AtlasActiveAlert[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const defaultPhase = workspace.buyingGroup.negotiationStage === 'active' ? 'active' : workspace.buyingGroup.negotiationStage === 'prep' ? 'prep' : 'monitor';
  const derivedView = normalizeGeneratedView(initialView);
  const [activeView, setActiveView] = useState<BuyingGroupGeneratedView>(derivedView);
  const activePhase = normalizePhase(initialPhase, defaultPhase);
  const [customPrompt, setCustomPrompt] = useState(initialView === 'custom' ? initialPrompt ?? '' : '');

  function selectView(view: BuyingGroupGeneratedView) {
    setActiveView(view);
    const askParam = view === 'custom' && customPrompt ? `&ask=${encodeURIComponent(customPrompt)}` : '';
    window.history.replaceState(null, '', `/buying-groups/${workspace.buyingGroup.id}?view=${view}&phase=${activePhase}${askParam}`);
  }

  return (
    <section className="atlas-generative-buying-group">
      <BuyingGroupGeneratedPanel
        onAddProfileUpdate={onAddProfileUpdate}
        profileRead={profileRead}
        profileUpdates={profileUpdates}
        prompt={customPrompt}
        scenarioAlerts={scenarioAlerts}
        view={activeView}
        workspace={workspace}
      />
    </section>
  );
}

type BuyingGroupMiniView = 'profile' | 'current' | 'timeline';

function buyerNegotiatorProfile(workspace: BuyingGroupWorkspacePacket) {
  const { buyingGroup } = workspace;
  const marketName = workspace.markets[0]?.name ?? 'Europe';
  const topSignal = workspace.signals[0];
  const competitor = workspace.competitorMoves[0];
  const profileMap: Record<string, { name: string; role: string; style: string; cadence: string; watch: string }> = {
    carrefour: {
      cadence: 'Uses cross-market comparisons early, then waits for PepsiCo to define the value exchange.',
      name: 'Claire Moreau',
      role: 'Group Purchasing Director, Beverages',
      style: 'Relationship-led but price disciplined',
      watch: 'Will ask whether France, Belgium, Spain, and Italy are receiving the same corridor.'
    },
    edeka: {
      cadence: 'Pushes late-cycle concessions and tests whether local operating pressure changes the floor.',
      name: 'Markus Weber',
      role: 'National Buyer, Impulse and Beverages',
      style: 'Direct, margin-first, evidence skeptical',
      watch: 'Will pressure affordability and ask for proof before accepting a phased landed increase.'
    },
    tesco: {
      cadence: 'Uses shopper value language and competitor benchmarks before moving on price.',
      name: 'Sophie Clarke',
      role: 'Category Commercial Lead',
      style: 'Analytical, value-focused, highly prepared',
      watch: 'Will compare the ask against value-pack competitors and volume risk.'
    },
    rewe: {
      cadence: 'Escalates when the ask is not tied to category growth or operational support.',
      name: 'Anna Schneider',
      role: 'Senior Category Buyer',
      style: 'Collaborative but guardrail-aware',
      watch: 'Will ask for execution support if the landed price stays above the expected corridor.'
    }
  };
  const fallback = {
    cadence: 'Usually counters below target first, then asks for trade support or phasing.',
    name: `${buyingGroup.name} lead negotiator`,
    role: `${marketName} commercial buyer`,
    style: buyingGroup.riskLevel === 'critical' ? 'Pressure-oriented, price-led' : 'Commercial, evidence-led',
    watch: topSignal?.title ?? competitor?.possibleBuyerLeverage ?? 'Watch for affordability, competitor comparison, and trade support requests.'
  };
  return profileMap[buyingGroup.id] ?? fallback;
}

function buyerBehaviorPatterns(workspace: BuyingGroupWorkspacePacket) {
  const profile = buyerNegotiatorProfile(workspace);
  const signal = workspace.signals[0];
  const competitor = workspace.competitorMoves[0];
  return [
    {
      action: 'Hold the opening ask until the buyer puts a specific counter on the table.',
      detail: 'This gives the CNO a baseline for pacing the first exchange and avoids giving away value before the buyer has clarified the tradeoff they want.',
      expectedResponse: 'Buyer is likely to reject the first position, then reframe around affordability, service support, or a phased landing.',
      label: 'Typical opening move',
      value: profile.cadence,
      source: workspace.timelineEvents[0]?.source ?? workspace.buyingGroup.source
    },
    {
      action: 'Keep price corridor, commodity evidence, and comparable market outcomes ready before responding.',
      detail: 'This is the pushback pattern the CNO should expect the buying group to use when challenging the PepsiCo position.',
      expectedResponse: 'Buyer will likely test whether PepsiCo can defend the ask with facts, not just a percentage increase.',
      label: 'Common pushback',
      value: signal
        ? signal.negotiationImplication
        : competitor
          ? competitor.possibleBuyerLeverage
          : 'Challenges the evidence first, then asks for support before accepting the landed number.',
      source: signal?.source ?? competitor?.source ?? workspace.buyingGroup.source
    },
    {
      action: 'Pair the price position with a clear value exchange, then keep concessions conditional.',
      detail: 'This is the pattern that has produced stronger outcomes with this buying group and similar European retailers.',
      expectedResponse: 'Buyer is more likely to stay engaged when the room story connects margin protection to execution, service, or category value.',
      label: 'What works',
      value: 'Use buyer history, finance guardrails, and a scenario-backed value exchange before offering concessions.',
      source: workspace.documents[0]?.source ?? workspace.buyingGroup.source
    }
  ];
}

function buyerNextRoundFlags(workspace: BuyingGroupWorkspacePacket) {
  const primarySignal = workspace.signals[0];
  const competitor = workspace.competitorMoves[0];
  const history = workspace.timelineEvents[0];
  const baseSource = primarySignal?.source ?? competitor?.source ?? history?.source ?? workspace.buyingGroup.source;
  const marketLabel = workspace.markets.map((market) => market.name).slice(0, 2).join(' / ') || 'current market';

  return [
    {
      action: 'Anchor the room story in evidence before introducing any support package.',
      change: primarySignal?.title ?? 'Affordability pressure is moving into the next round',
      id: 'active-signal',
      implication: primarySignal?.negotiationImplication ?? 'Buyer may challenge the price move before discussing volume, phasing, or service value.',
      label: 'Market signal',
      response: 'Expect the buyer to use the signal as a reason to slow acceptance or ask for extra trade support.',
      source: primarySignal?.source ?? baseSource,
      strategyUse: 'Lead with evidence before offering support.'
    },
    {
      action: 'Bring comparable rounds and market guardrails so the buyer cannot isolate one market as the benchmark.',
      change: competitor?.title ?? 'Cross-market comparison likely',
      id: 'competitive-benchmark',
      implication: competitor?.possibleBuyerLeverage ?? `Buyer may compare the ${marketLabel} corridor against other European outcomes.`,
      label: 'Competitive read',
      response: 'Expect pressure to match a lower landed outcome, especially if the buyer references adjacent markets.',
      source: competitor?.source ?? baseSource,
      strategyUse: 'Keep corridor rationale and comparable rounds ready.'
    },
    {
      action: 'Use the saved scenario as the concession boundary before reacting to the first counter.',
      change: history?.title ?? 'Prior negotiation memory is shaping the counter',
      id: 'history-memory',
      implication: history?.summary ?? 'Past rounds suggest the buyer will counter below target and wait for PepsiCo to define the tradeoff.',
      label: 'Buyer memory',
      response: 'Expect a below-target counter and delayed acceptance unless PepsiCo makes the tradeoff explicit.',
      source: history?.source ?? baseSource,
      strategyUse: 'Use scenario-backed walk-away logic before making a concession.'
    }
  ];
}

function BuyingGroupIntelligenceCard({
  action,
  detail,
  eyebrow,
  expectedResponse,
  onOpenSource,
  source,
  title
}: {
  action: string;
  detail: string;
  eyebrow: string;
  expectedResponse: string;
  onOpenSource: (source: SourceMeta) => void;
  source: SourceMeta;
  title: string;
}) {
  return (
    <section className="atlas-bg-intelligence-card">
      <div className={`atlas-bg-card-header${eyebrow ? '' : ' atlas-bg-card-header-source-only'}`}>
        {eyebrow ? <small>{eyebrow}</small> : null}
        <BuyingGroupProfileSourceButton onOpen={onOpenSource} source={source} />
      </div>
      <h4>{title}</h4>
      <p>{detail}</p>
      <dl className="atlas-bg-intelligence-card-facts">
        <div>
          <dt>CNO move</dt>
          <dd>{action}</dd>
        </div>
        <div>
          <dt>Buyer read</dt>
          <dd>{expectedResponse}</dd>
        </div>
      </dl>
    </section>
  );
}

function buyerScenarioRead(workspace: BuyingGroupWorkspacePacket) {
  const baseInputs = scenarioInputsForBuyingGroup(workspace.buyingGroup);
  const exposure = workspace.buyingGroup.financialExposure;
  const baseSource = workspace.documents[0]?.source ?? workspace.buyingGroup.source;
  const signalSource = workspace.signals[0]?.source ?? baseSource;
  const historySource = workspace.timelineEvents[0]?.source ?? baseSource;
  const scenarioRows = [
    {
      basis: 'Buyer history and approved finance guardrail',
      id: 'recommended',
      inputs: baseInputs,
      name: 'Evidence-backed landed ask',
      priority: 'Recommended',
      response: 'Buyer is likely to challenge the evidence first, then counter for support.',
      source: baseSource
    },
    {
      basis: workspace.signals[0]?.title ?? 'Active market signal',
      id: 'market-pressure',
      inputs: {
        ...baseInputs,
        buyerAcceptanceProbability: Math.max(25, baseInputs.buyerAcceptanceProbability - 8),
        expectedRealizationPercent: Math.max(0.5, baseInputs.expectedRealizationPercent - 0.25),
        tradeSpendChange: Math.round(baseInputs.tradeSpendChange * 1.18),
        volumeChangePercent: baseInputs.volumeChangePercent - 0.4
      },
      name: 'Market-pressure counter',
      priority: 'Watch',
      response: 'Buyer may use market pressure to ask for either price relief or execution support.',
      source: signalSource
    },
    {
      basis: workspace.timelineEvents[0]?.title ?? 'Prior negotiation memory',
      id: 'history-counter',
      inputs: {
        ...baseInputs,
        buyerAcceptanceProbability: Math.min(92, baseInputs.buyerAcceptanceProbability + 9),
        concessionAmount: Math.round(baseInputs.concessionAmount * 1.2),
        expectedRealizationPercent: Math.max(0.5, baseInputs.expectedRealizationPercent - 0.45),
        priceIncreasePercent: Math.max(0.7, baseInputs.priceIncreasePercent - 0.35)
      },
      name: 'Likely buyer counter',
      priority: 'Have on hand',
      response: 'Buyer likely counters below target and asks PepsiCo to prove why support should be conditional.',
      source: historySource
    }
  ];

  return scenarioRows.map((scenario) => {
    const outputs = calculateScenarioOutputs(scenario.inputs, exposure.revenueUnderNegotiation);
    return {
      ...scenario,
      outputs,
      likelihood: Math.round(scenario.inputs.buyerAcceptanceProbability),
      recommendedAction: outputs.marginImpact < 0
        ? 'Do not use unless Finance approves the tradeoff.'
        : scenario.id === 'recommended'
          ? 'Use as the primary room-ready scenario.'
          : 'Keep available if the buyer pushes into this path.'
    };
  });
}

function BuyingGroupProfileSourceButton({
  onOpen,
  source
}: {
  onOpen: (source: SourceMeta) => void;
  source: SourceMeta;
}) {
  return (
    <button
      className="atlas-bg-source-button"
      title={`${sourceDisplayName(source)} / Confidence ${source.confidence}`}
      type="button"
      onClick={() => onOpen(source)}
    >
      Sources
    </button>
  );
}

function BuyingGroupProfileMiniView({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const negotiator = buyerNegotiatorProfile(workspace);
  const patterns = buyerBehaviorPatterns(workspace);
  const flaggedInsights = buyerNextRoundFlags(workspace);
  const latestMemory = workspace.timelineEvents[0];
  const markets = workspace.markets.map((market) => market.name).join(' / ');
  const [openSource, setOpenSource] = useState<SourceMeta | null>(null);

  return (
    <>
      <section className="atlas-bg-mini-view atlas-bg-profile-view atlas-bg-profile-view-v2">
        <div className="atlas-bg-profile-topline">
          <article className="atlas-bg-profile-lead">
            <span>Buyer profile</span>
            <h2>{workspace.buyingGroup.name} usually responds through {negotiator.style.toLowerCase()} behavior.</h2>
            <p>{negotiator.watch}</p>
            <dl className="atlas-bg-profile-facts">
              <div><dt>Markets</dt><dd>{markets}</dd></div>
              <div><dt>Stage</dt><dd>{workspace.buyingGroup.negotiationStage}</dd></div>
              <div><dt>Current risk</dt><dd>{workspace.buyingGroup.riskLevel}</dd></div>
              <div><dt>Latest ask</dt><dd>{profileRead.currentState.latestBuyerAsk}</dd></div>
            </dl>
          </article>

          <article className="atlas-bg-negotiator-card">
            <div className="atlas-bg-card-header">
              <span>Negotiator read</span>
              <BuyingGroupProfileSourceButton onOpen={setOpenSource} source={latestMemory?.source ?? workspace.buyingGroup.source} />
            </div>
            <h3>{negotiator.name}</h3>
            <p>{negotiator.role}</p>
            <dl>
              <div><dt>Style</dt><dd>{negotiator.style}</dd></div>
              <div><dt>Expected cadence</dt><dd>{negotiator.cadence}</dd></div>
            </dl>
          </article>
        </div>

        <article className="atlas-bg-ai-flags">
          <div className="atlas-bg-ai-flags-header">
            <span>AI flagged for next negotiation</span>
            <h3>External and historical signals this buyer may bring into the room</h3>
          </div>
          <div className="atlas-bg-ai-flag-list">
            {flaggedInsights.map((insight) => (
              <BuyingGroupIntelligenceCard
                action={insight.action}
                detail={`${insight.change}. ${insight.implication}`}
                eyebrow={insight.label}
                expectedResponse={insight.response}
                key={insight.id}
                onOpenSource={setOpenSource}
                source={insight.source}
                title={insight.strategyUse}
              />
            ))}
          </div>
        </article>

        <div className="atlas-bg-behavior-grid">
          {patterns.map((pattern) => (
            <BuyingGroupIntelligenceCard
              action={pattern.action}
              detail={pattern.detail}
              eyebrow={pattern.label}
              expectedResponse={pattern.expectedResponse}
              key={pattern.label}
              onOpenSource={setOpenSource}
              source={pattern.source}
              title={pattern.value}
            />
          ))}
        </div>
      </section>
      {openSource ? <SourceDetailDrawer onClose={() => setOpenSource(null)} source={openSource} /> : null}
    </>
  );
}

function BuyingGroupCurrentNegotiationMiniView({
  profileRead,
  workspace
}: {
  profileRead: BuyerProfileRead;
  workspace: BuyingGroupWorkspacePacket;
}) {
  const exposure = profileRead.exposure;
  const currentState = profileRead.currentState;
  const scenarios = buyerScenarioRead(workspace);
  const latestEvent = workspace.timelineEvents[0];
  const primarySignal = workspace.signals[0];
  const competitor = workspace.competitorMoves[0];
  const targetGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const buyerAskValue = Number.parseFloat(currentState.latestBuyerAsk);
  const pepsicoPositionValue = Number.parseFloat(currentState.pepsicoPosition);
  const askGap = Number.isFinite(buyerAskValue) && Number.isFinite(pepsicoPositionValue)
    ? buyerAskValue - pepsicoPositionValue
    : targetGap;
  const guardrailStatus = targetGap > 0.7 ? 'Pressure above corridor' : 'Inside corridor';
  const firstApproval = currentState.openApprovals[0] ?? 'No open approval blocking the current read';
  const likelyObjection = primarySignal
    ? primarySignal.negotiationImplication
    : competitor
      ? competitor.possibleBuyerLeverage
      : 'Buyer is likely to challenge the price move before discussing volume, phasing, or service value.';
  const numberCards = [
    { label: 'Buyer ask', value: currentState.latestBuyerAsk, detail: 'Current buyer anchor' },
    { label: 'PepsiCo position', value: currentState.pepsicoPosition, detail: `${askGap.toFixed(1)} pts below ask` },
    { label: 'Target', value: currentState.target, detail: `${targetGap.toFixed(1)} pts from current read` },
    { label: 'Red line', value: currentState.redLine, detail: 'Finance floor' },
    { label: 'Margin at risk', value: euros(exposure.marginAtRisk), detail: `${euros(exposure.revenueUnderNegotiation)} revenue at stake` },
    { label: 'Trade exposure', value: euros(exposure.tradeSpendExposure), detail: 'Support pressure' }
  ];
  const cycleCards = [
    { label: 'Cycle state', value: buyerRoundLabel(workspace.buyingGroup), detail: currentState.negotiationRound },
    { label: 'Last buyer move', value: currentState.latestBuyerAsk, detail: askGap > 0 ? `${askGap.toFixed(1)} pts above PepsiCo position` : 'No modeled gap to PepsiCo position' },
    { label: 'Next milestone', value: currentState.nextMilestone, detail: firstApproval }
  ];
  const changeCards = [
    {
      detail: `ATLAS reads the current ask as ${askGap.toFixed(1)} pts away from PepsiCo's position and ${targetGap.toFixed(1)} pts away from target.`,
      label: 'Buyer movement',
      source: profileRead.source,
      title: `Current ask is ${currentState.latestBuyerAsk}`
    },
    {
      detail: primarySignal?.negotiationImplication ?? latestEvent?.summary ?? 'No new external signal is currently stronger than buyer history.',
      label: primarySignal ? 'External signal' : 'Buyer memory',
      source: primarySignal?.source ?? latestEvent?.source ?? workspace.buyingGroup.source,
      title: primarySignal?.title ?? latestEvent?.title ?? 'History is the active context'
    },
    {
      detail: competitor?.possibleBuyerLeverage ?? 'No competitor move is currently strong enough to change the primary price corridor.',
      label: competitor ? 'Competitive pressure' : 'Source check',
      source: competitor?.source ?? workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      title: competitor?.title ?? firstApproval
    }
  ];
  const scenarioCompareParams = new URLSearchParams();
  scenarioCompareParams.set('buyingGroup', workspace.buyingGroup.id);
  scenarios.slice(0, 2).forEach((scenario) => scenarioCompareParams.append('scenario', scenario.id));
  scenarioCompareParams.set('returnTo', `/buying-groups/${workspace.buyingGroup.id}?view=current`);
  scenarioCompareParams.set('returnLabel', `${workspace.buyingGroup.name} current negotiation`);
  const scenarioBriefParams = new URLSearchParams({
    buyingGroupId: workspace.buyingGroup.id,
    editable: '1',
    mode: 'draft',
    prompt: `Create the room-ready scenario brief for ${workspace.buyingGroup.name}`
  });
  const evidenceParams = new URLSearchParams({
    buyingGroup: workspace.buyingGroup.id,
    type: 'pricing-evidence'
  });
  function currentNegotiationScenarioHref(scenarioId: string) {
    const params = new URLSearchParams({
      buyingGroup: workspace.buyingGroup.id,
      returnLabel: `${workspace.buyingGroup.name} current negotiation`,
      returnTo: `/buying-groups/${workspace.buyingGroup.id}?view=current`,
      scenario: scenarioId
    });
    return `/scenario-lab?${params.toString()}`;
  }
  const preparationCards = [
    {
      actionHref: `/generated-views?${scenarioBriefParams.toString()}`,
      actionLabel: 'Open brief',
      detail: `ATLAS drafted the response around the live ask gap, finance floor, and likely objection: ${likelyObjection}`,
      label: 'Report created',
      source: primarySignal?.source ?? competitor?.source ?? workspace.buyingGroup.source,
      title: 'Room response brief is ready.'
    },
    {
      actionHref: `/scenario-lab/compare?${scenarioCompareParams.toString()}`,
      actionLabel: 'Open comparison',
      detail: scenarios[1]
        ? `ATLAS compared ${scenarios[0]?.name ?? 'the recommended case'} against ${scenarios[1].name} so the CNO can see the likely counter path before responding.`
        : `ATLAS modeled ${scenarios[0]?.name ?? 'the current buyer case'} against the live corridor and buyer history.`,
      label: 'Scenario modeled',
      source: scenarios[0]?.source ?? workspace.buyingGroup.source,
      title: scenarios[0]?.name ?? 'Buyer scenario is ready.'
    },
    {
      actionHref: `/intelligence?${evidenceParams.toString()}`,
      actionLabel: 'Review evidence',
      detail: latestEvent?.summary ?? 'ATLAS pulled the latest buyer memory, comparable rounds, and approved finance guardrail into the evidence trail.',
      label: 'Evidence compiled',
      source: latestEvent?.source ?? workspace.documents[0]?.source ?? workspace.buyingGroup.source,
      title: latestEvent?.title ?? 'Pricing evidence pack is ready.'
    },
    {
      actionHref: `/buying-groups/${workspace.buyingGroup.id}?view=profile`,
      actionLabel: 'Open profile read',
      detail: `ATLAS applied buyer memory to the negotiation posture so the response can account for ${buyerRoundLabel(workspace.buyingGroup).toLowerCase()}, prior concessions, and current relationship pressure.`,
      label: 'Buyer read applied',
      source: profileRead.source,
      title: 'Buyer response pattern is loaded.'
    }
  ];

  return (
    <section className="atlas-bg-mini-view atlas-bg-current-view atlas-bg-current-view-v2">
      <section className="atlas-bg-cycle-read">
        <header>
          <span>Current cycle read</span>
          <h2>{workspace.buyingGroup.name} is in {currentState.negotiationRound.toLowerCase()} with a {askGap.toFixed(1)} pt ask gap.</h2>
          <p>Start here to see what changed in this cycle, what ATLAS thinks it means, and what needs to be ready before the next room.</p>
        </header>
        <div className="atlas-bg-current-read-grid">
          {cycleCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
        <div className="atlas-bg-cycle-change-grid">
          {changeCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
              <SourceTrustMini source={card.source} />
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-bg-current-numbers">
        <header>
          <span>Numbers and guardrails</span>
          <h2>Use the current corridor before changing the negotiation position.</h2>
          <p>These are the sourced baseline numbers CNOs need before selecting a scenario or trading support.</p>
        </header>
        <div className="atlas-bg-current-number-grid">
          {numberCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
        <aside className="atlas-bg-guardrail-note">
          <span>Guardrail read</span>
          <strong>{guardrailStatus}</strong>
          <p>{firstApproval}</p>
        </aside>
        <SourceTrustMini source={profileRead.source} />
      </section>

      <section className="atlas-bg-prep-section">
        <header>
          <span>Prepare for the room</span>
          <h2>ATLAS has prepared the assets the CNO should review before responding.</h2>
          <p>The heavy lifting is already done: response draft, modeled scenarios, evidence trail, and buyer behavior read.</p>
        </header>
        <div className="atlas-bg-prep-grid">
          {preparationCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
              <footer>
                <a href={card.actionHref}>{card.actionLabel} <ArrowRight size={13} /></a>
                <SourceTrustMini source={card.source} />
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-bg-scenario-section">
        <header>
          <span>Predictive scenarios</span>
          <h2>Scenarios to keep ready for this buying group</h2>
          <p>Each scenario connects the current numbers to expected buyer response, financial impact, and the CNO move.</p>
        </header>
        <div className="atlas-bg-scenario-list">
          {scenarios.map((scenario) => (
            <article key={scenario.id}>
              <div className="atlas-bg-scenario-summary">
                <span>{scenario.priority}</span>
                <h3>{scenario.name}</h3>
                <p>Based on {scenario.basis}, ATLAS modeled {pct(scenario.inputs.priceIncreasePercent)} ask / {pct(scenario.inputs.expectedRealizationPercent)} expected realization.</p>
              </div>
              <dl>
                <div><dt>Land</dt><dd>{scenario.likelihood}%</dd></div>
                <div><dt>NR</dt><dd>{euros(scenario.outputs.revenueImpact)}</dd></div>
                <div><dt>GM</dt><dd>{euros(scenario.outputs.marginImpact)}</dd></div>
                <div><dt>Trade</dt><dd>{euros(scenario.outputs.tradeSpendImpact)}</dd></div>
              </dl>
              <div className="atlas-bg-scenario-read">
                <section>
                  <span>Buyer response</span>
                  <p>{scenario.response}</p>
                </section>
                <section>
                  <span>CNO action</span>
                  <strong>{scenario.recommendedAction}</strong>
                </section>
              </div>
              <footer>
                <a href={currentNegotiationScenarioHref(scenario.id)}>Open scenario <ArrowRight size={13} /></a>
                <SourceTrustMini source={scenario.source} />
              </footer>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function BuyingGroupTimelineMiniView({
  profileUpdates,
  workspace
}: {
  profileUpdates: BuyerProfileDocumentUpdate[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const savedViews = useStoredGeneratedViews({ buyingGroupId: workspace.buyingGroup.id });
  const negotiationEventTypes: TimelineEvent['eventType'][] = [
    'competitor_move',
    'negotiation_update',
    'decision_made',
    'debrief_created',
    'validation_completed',
    'financial_change'
  ];
  const negotiationEvents = workspace.timelineEvents.filter((event) => negotiationEventTypes.includes(event.eventType) && Number(event.timestamp.slice(0, 4)) >= 2025);
  const supportingEvents = workspace.timelineEvents.filter((event) => !negotiationEvents.some((visibleEvent) => visibleEvent.id === event.id));
  const hiddenInteractionCount =
    supportingEvents.length + workspace.documents.length + savedViews.length + profileUpdates.length;
  const timelineRows = negotiationEvents.map((event) => {
    const financialImpact = compactFinancialImpact({
      margin: event.financialImpact?.marginImpact,
      revenue: event.financialImpact?.revenueImpact,
      trade: event.financialImpact?.tradeSpendImpact
    });
    return {
      date: event.timestamp,
      detail: event.summary,
      id: event.id,
      impact: financialImpact,
      label: timelineMemoryLabel(event.eventType),
      predictionEffect: timelinePredictionEffect(event.eventType, event.title, financialImpact),
      source: event.source,
      sourceLine: `${sourceDisplayName(event.source)} · ${event.source.confidence} confidence · ${formatAtlasDate(event.source.sourceDate, { includeYear: true })}`,
      title: event.title
    };
  })
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestRow = timelineRows[0];
  const currentYear = latestRow?.date.slice(0, 4) ?? '2026';
  const timelineYears = timelineRows.reduce<Array<{ rows: typeof timelineRows; year: string }>>((years, row) => {
    const year = row.date.slice(0, 4);
    const existing = years.find((group) => group.year === year);
    if (existing) {
      existing.rows.push(row);
    } else {
      years.push({ rows: [row], year });
    }
    return years;
  }, []);
  const supportingActivity = [
    {
      count: supportingEvents.filter((event) => event.eventType === 'scenario_modeled').length + savedViews.filter((view) => /scenario|model/i.test(`${view.title} ${view.prompt}`)).length,
      label: 'Scenario saves',
      detail: 'Available in Scenario Lab and source detail.'
    },
    {
      count: workspace.documents.length,
      label: 'Documents',
      detail: 'Used for source validation, not shown as negotiation milestones.'
    },
    {
      count: profileUpdates.length + savedViews.filter((view) => !/scenario|model/i.test(`${view.title} ${view.prompt}`)).length,
      label: 'Workspace activity',
      detail: 'Profile edits and generated reads stay outside the main timeline.'
    }
  ].filter((item) => item.count > 0);

  return (
    <section className="atlas-bg-mini-view atlas-bg-timeline-view atlas-bg-timeline-view-v2">
      <header className="atlas-bg-timeline-header">
        <div>
          <span>Negotiation memory</span>
          <h2>{workspace.buyingGroup.name} negotiation timeline</h2>
          <p>Only the moments that changed the negotiation read stay visible: buyer movement, finance guardrails, decisions, and debrief learning.</p>
        </div>
        <a href={`/intelligence?buyingGroup=${workspace.buyingGroup.id}&action=add-debrief`}>Add debrief</a>
      </header>

      {latestRow ? (
        <section className="atlas-bg-timeline-current-read">
          <div>
            <span>Current read</span>
            <strong>{latestRow.title}</strong>
            <p>{latestRow.predictionEffect}</p>
          </div>
          <dl>
            <div>
              <dt>Latest update</dt>
              <dd>{formatAtlasDate(latestRow.date, { includeYear: true })}</dd>
            </div>
            <div>
              <dt>Modeled impact</dt>
              <dd>{latestRow.impact}</dd>
            </div>
            <div>
              <dt>Hidden activity</dt>
              <dd>{hiddenInteractionCount} source items</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="atlas-bg-timeline-ledger">
        <header>
          <span>Cycle timeline</span>
          <h3>Negotiation events ATLAS uses for predictions</h3>
        </header>
        <div className="atlas-bg-timeline-list">
          {timelineYears.map((yearGroup) => (
            <details className="atlas-bg-timeline-year-group" key={yearGroup.year} open={yearGroup.year === currentYear}>
              <summary>
                <div>
                  <span>{yearGroup.year}</span>
                  <strong>{yearGroup.year === currentYear ? 'Current negotiation cycle' : 'Prior-cycle memory'}</strong>
                </div>
                <em>{yearGroup.rows.length} events</em>
              </summary>
              <div className="atlas-bg-timeline-year-events">
                {yearGroup.rows.map((row, index) => (
                  <article key={row.id} className={row.id === latestRow?.id ? 'is-latest' : undefined}>
                    <time>{formatAtlasDate(row.date, { includeYear: true })}</time>
                    <div className="atlas-bg-timeline-marker" aria-hidden="true">
                      <span>{index + 1}</span>
                    </div>
                    <div className="atlas-bg-timeline-content">
                      <div className="atlas-bg-timeline-row-kicker">
                        <span>{row.label}</span>
                        {row.id === latestRow?.id ? <em>Latest</em> : null}
                      </div>
                      <h3>{row.title}</h3>
                      <p>{row.detail}</p>
                      <dl>
                        <div>
                          <dt>Changed</dt>
                          <dd>{row.impact}</dd>
                        </div>
                        <div>
                          <dt>Prediction effect</dt>
                          <dd>{row.predictionEffect}</dd>
                        </div>
                      </dl>
                      <p className="atlas-bg-timeline-source-line">Source: {row.sourceLine}</p>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {supportingActivity.length ? (
        <details className="atlas-bg-timeline-supporting">
          <summary>
            <span>View supporting activity</span>
            <em>{hiddenInteractionCount} hidden</em>
          </summary>
          <div>
            {supportingActivity.map((item) => (
              <article key={item.label}>
                <strong>{item.count}</strong>
                <span>{item.label}</span>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function timelineMemoryLabel(eventType: TimelineEvent['eventType']) {
  switch (eventType) {
    case 'decision_made':
      return 'Major decision';
    case 'debrief_created':
      return 'Debrief';
    case 'validation_completed':
      return 'Validated input';
    case 'scenario_modeled':
      return 'Scenario modeled';
    case 'financial_change':
      return 'Finance guardrail';
    case 'negotiation_update':
      return 'Buyer movement';
    case 'competitor_move':
      return 'Competitive signal';
    case 'signal_detected':
      return 'External signal';
    case 'document_added':
    case 'document_retrieved':
      return 'Source update';
    default:
      return String(eventType).replaceAll('_', ' ');
  }
}

function timelinePredictionEffect(eventType: TimelineEvent['eventType'], title: string, impact: string) {
  const lowerTitle = title.toLowerCase();
  if (eventType === 'decision_made') return 'Locked decision becomes the current plan of record.';
  if (eventType === 'debrief_created') return 'Debrief learning changes future buyer-response predictions.';
  if (eventType === 'validation_completed') return 'Validated input can be used without extra source review.';
  if (eventType === 'scenario_modeled') return 'Modeled output is available for scenario comparison and buyer planning.';
  if (eventType === 'financial_change' || lowerTitle.includes('guardrail')) return `Finance corridor and exposure read updated: ${impact}.`;
  if (eventType === 'negotiation_update') return 'Buyer posture and likely counter are recalculated from this movement.';
  if (eventType === 'competitor_move') return 'Competitor pressure may change buyer leverage and required proof.';
  if (eventType === 'signal_detected') return 'Market signal can change which scenarios ATLAS recommends.';
  return 'Source memory updated for future recommendations.';
}

function BuyingGroupReimaginedWorkspace({
  initialView,
  profileRead,
  profileUpdates,
  workspace
}: {
  initialView?: string;
  profileRead: BuyerProfileRead;
  profileUpdates: BuyerProfileDocumentUpdate[];
  workspace: BuyingGroupWorkspacePacket;
}) {
  const initialMiniView: BuyingGroupMiniView = initialView === 'timeline' || initialView === 'memory' || initialView === 'history'
    ? 'timeline'
    : initialView === 'current' || initialView === 'numbers' || initialView === 'strategy' || initialView === 'scenario'
      ? 'current'
      : 'profile';
  const [activeView, setActiveView] = useState<BuyingGroupMiniView>(initialMiniView);
  const negotiator = buyerNegotiatorProfile(workspace);
  const topScenario = buyerScenarioRead(workspace)[0];
  const miniViews: Array<{ id: BuyingGroupMiniView; label: string; helper: string }> = [
    { id: 'profile', label: 'Profile', helper: 'Buyer behavior and negotiator read' },
    { id: 'current', label: 'Current negotiation', helper: 'Numbers and predictive scenarios' },
    { id: 'timeline', label: 'Timeline', helper: 'Cycle memory and source events' }
  ];

  function selectView(view: BuyingGroupMiniView) {
    setActiveView(view);
    window.history.replaceState(null, '', `/buying-groups/${workspace.buyingGroup.id}?view=${view}`);
  }

  return (
    <section className="atlas-bg-workspace">
      <div className="atlas-bg-back-row">
        <a href="/buying-groups" aria-label="Back to buying groups">‹</a>
        <span>Back to buying groups</span>
      </div>

      <header className="atlas-bg-hero">
        <div>
          <span>Living buying group intelligence</span>
          <h1>Buying Group Profile: {workspace.buyingGroup.name}</h1>
          <p>Historical notes, negotiator behavior, current numbers, and predictive scenarios converted into guidance for the next negotiation.</p>
        </div>
        <dl>
          <div><dt>Risk</dt><dd>{workspace.buyingGroup.riskLevel}</dd></div>
          <div><dt>Margin at risk</dt><dd>{euros(profileRead.exposure.marginAtRisk)}</dd></div>
          <div><dt>Top scenario</dt><dd>{topScenario.name}</dd></div>
        </dl>
      </header>

      <nav className="atlas-bg-mini-tabs" aria-label={`${workspace.buyingGroup.name} views`}>
        {miniViews.map((view) => (
          <button className={activeView === view.id ? 'active' : ''} key={view.id} onClick={() => selectView(view.id)} type="button">
            <strong>{view.label}</strong>
            <small>{view.helper}</small>
          </button>
        ))}
      </nav>

      {activeView === 'profile' ? <BuyingGroupProfileMiniView profileRead={profileRead} workspace={workspace} /> : null}
      {activeView === 'current' ? <BuyingGroupCurrentNegotiationMiniView profileRead={profileRead} workspace={workspace} /> : null}
      {activeView === 'timeline' ? <BuyingGroupTimelineMiniView profileUpdates={profileUpdates} workspace={workspace} /> : null}
    </section>
  );
}

function BuyingGroupWorkspaceView({
  buyingGroupId,
  initialPhase,
  initialPrompt,
  initialView
}: {
  buyingGroupId: string;
  initialPhase?: string;
  initialPrompt?: string;
  initialView?: string;
}) {
  const workspace = buildBuyingGroupWorkspacePacket(buyingGroupId);
  const updates: BuyerProfileDocumentUpdate[] = [];
  if (!workspace) {
    return (
      <PageBrief
        eyebrow="Buying Group"
        title="Buying group not found."
        body="ATLAS could not find this buying group in the synthetic Europe intelligence packet."
        action="Recommended action: return to all buying groups."
      />
    );
  }
  const profileRead = buildBuyerProfileRead(workspace, updates);

  return (
    <BuyingGroupReimaginedWorkspace
      initialView={initialView}
      profileRead={profileRead}
      profileUpdates={updates}
      workspace={workspace}
    />
  );
}

function buyerRoundLabel(group: BuyingGroup) {
  if (group.negotiationStage === 'closed') return 'Closed cycle';
  if (group.negotiationStage === 'prep') return 'Prep / round 0';
  if (group.negotiationStage === 'paused') return 'Paused / round 6';
  if (group.riskLevel === 'critical') return 'Round 15';
  if (group.riskLevel === 'high') return 'Round 9';
  if (group.riskLevel === 'medium') return 'Round 5';
  return 'Monitoring';
}

function buyerInterventionTrigger(group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const latestSignal = signalsFor({ buyingGroupId: group.id })[0];
  const competitor = competitorMovesFor({ buyingGroupId: group.id })[0];

  if (group.riskLevel === 'critical') return 'CNO intervention likely needed';
  if (realizationGap >= 0.7) return `${pct(realizationGap)} below target realization`;
  if (competitor) return `${competitor.competitor} gives buyer leverage`;
  if (latestSignal) return latestSignal.title;
  return 'Monitor for movement';
}

function filterBuyingGroupsForAsk(groups: BuyingGroup[], ask?: string, view?: string) {
  const normalized = (ask ?? '').toLowerCase();
  if (/below target|target|realization|gap/.test(normalized)) {
    return groups.filter((group) => group.financialExposure.expectedPriceRealization < group.financialExposure.targetPriceRealization);
  }
  if (/intervention|step in|high-risk|high risk|critical|round|stuck|15/.test(normalized)) {
    return groups.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high' || buyerRoundLabel(group).includes('15'));
  }
  return groups;
}

function BuyingGroupFocusFilters({ activeView }: { activeView: string }) {
  const filters = [
    ['Needs intervention', '/buying-groups?ask=Which%20buying%20groups%20need%20CNO%20intervention%3F&view=buyer-ranking'],
    ['Below target', '/buying-groups?ask=Show%20groups%20below%20target%20realization&view=buyer-ranking'],
    ['Late rounds', '/buying-groups?ask=Show%20buyers%20stuck%20after%2010%20rounds&view=buyer-ranking'],
    ['External pressure', '/buying-groups?ask=Show%20buyers%20with%20competitor%20or%20external%20pressure&view=competitor-impact']
  ];

  return (
    <nav className="atlas-buyer-focus-filters" aria-label="Buying group focus filters">
      {filters.map(([label, href]) => (
        <a className={activeView === 'competitor-impact' && label === 'External pressure' ? 'active' : ''} href={href} key={label}>{label}</a>
      ))}
    </nav>
  );
}

function BuyingGroupSortControls({ activeSort = 'priority' }: { activeSort?: string }) {
  const sorts = [
    ['priority', 'Priority'],
    ['margin', 'Margin risk'],
    ['gap', 'Target gap'],
    ['round', 'Round'],
    ['revenue', 'Revenue']
  ];

  return (
    <nav className="atlas-buyer-table-sort" aria-label="View buying groups by">
      {sorts.map(([sort, label]) => (
        <a className={activeSort === sort ? 'active' : ''} href={sort === 'priority' ? '/buying-groups' : `/buying-groups?sort=${sort}`} key={sort}>
          {label}
        </a>
      ))}
    </nav>
  );
}

function sortBuyingGroups(groups: BuyingGroup[], sort?: string) {
  const { direction, key: selected } = parseSortParam(sort);
  const compareNumbers = (aValue: number, bValue: number) => direction === 'asc' ? aValue - bValue : bValue - aValue;
  return [...groups].sort((a, b) => {
    if (selected === 'margin') return compareNumbers(a.financialExposure.marginAtRisk, b.financialExposure.marginAtRisk);
    if (selected === 'revenue') return compareNumbers(a.financialExposure.revenueUnderNegotiation, b.financialExposure.revenueUnderNegotiation);
    if (selected === 'gap') {
      const gapA = a.financialExposure.targetPriceRealization - a.financialExposure.expectedPriceRealization;
      const gapB = b.financialExposure.targetPriceRealization - b.financialExposure.expectedPriceRealization;
      return compareNumbers(gapA, gapB);
    }
    if (selected === 'round') return compareNumbers(Number(buyerRoundLabel(a).match(/\d+/)?.[0] ?? 0), Number(buyerRoundLabel(b).match(/\d+/)?.[0] ?? 0));
    return compareNumbers(riskRank(a.riskLevel), riskRank(b.riskLevel)) || compareNumbers(a.financialExposure.marginAtRisk, b.financialExposure.marginAtRisk);
  });
}

function BuyingGroupSortBar() {
  const rankedGroups = sortBuyingGroups(packet.buyingGroups, 'priority');
  const interventionGroups = rankedGroups.filter((group) => group.riskLevel === 'critical' || group.riskLevel === 'high');
  const isMultiIntervention = interventionGroups.length > 1;
  const topGroup = interventionGroups[0] ?? packet.topExposureBuyingGroups[0] ?? packet.buyingGroups[0];

  return (
    <section className={`atlas-buyer-list-head${isMultiIntervention ? ' atlas-buyer-list-head-multi' : ''}`}>
      <div>
        <span className="atlas-buyer-header-kicker">Buying group triage</span>
        <h1>{isMultiIntervention ? `${interventionGroups.length} buyers need scenario planning.` : `Open ${topGroup.name} first.`}</h1>
        <p>Sort the table to choose which buyer scenario to test first.</p>
      </div>
    </section>
  );
}

function buyerMetricTone(metric: 'gap' | 'margin' | 'realization' | 'round', group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const roundNumber = Number(buyerRoundLabel(group).match(/\d+/)?.[0] ?? 0);

  if (metric === 'margin') {
    if (exposure.marginAtRisk >= 4_000_000) return 'critical';
    if (exposure.marginAtRisk >= 2_500_000) return 'warning';
    return 'good';
  }
  if (metric === 'gap') {
    if (realizationGap >= 0.8) return 'critical';
    if (realizationGap >= 0.4) return 'warning';
    return 'good';
  }
  if (metric === 'realization') {
    if (exposure.expectedPriceRealization < exposure.targetPriceRealization - 0.8) return 'critical';
    if (exposure.expectedPriceRealization < exposure.targetPriceRealization - 0.4) return 'warning';
    return 'good';
  }
  if (roundNumber >= 10) return 'critical';
  if (roundNumber >= 6) return 'warning';
  return 'good';
}

function buyerNextMilestone(group: BuyingGroup) {
  if (group.negotiationStage === 'closed') return 'Cycle closed';
  if (group.negotiationStage === 'prep') return 'Prep lock';
  if (group.negotiationStage === 'paused') return 'Restart decision';
  if (group.riskLevel === 'critical') return 'CNO checkpoint';
  if (group.riskLevel === 'high') return 'Next buyer meeting';
  return 'Monitor';
}

function buyerRiskReason(group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const roundLabel = buyerRoundLabel(group).toLowerCase();

  if (group.riskLevel === 'critical') {
    return `${roundLabel}, ${euros(exposure.marginAtRisk)} margin at risk, ${pct(realizationGap)} target gap.`;
  }
  if (group.riskLevel === 'high') {
    return `${euros(exposure.marginAtRisk)} margin at risk with ${pct(realizationGap)} target gap.`;
  }
  if (group.riskLevel === 'medium') {
    return `Active negotiation, ${pct(realizationGap)} target gap, no CNO intervention trigger yet.`;
  }
  return `Low exposure and no active intervention trigger.`;
}

function buyerScenarioToTest(group: BuyingGroup) {
  const exposure = group.financialExposure;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  const signal = signalsFor({ buyingGroupId: group.id })[0];

  if (group.riskLevel === 'critical') return `Counter response at ${pct(exposure.expectedPriceRealization)} realization`;
  if (realizationGap >= 0.8) return `Fallback needed to close ${pct(realizationGap)} gap`;
  if (signal) return `Test response to ${signal.signalType.replaceAll('_', ' ')}`;
  if (group.negotiationStage === 'prep') return 'Set first ask and guardrail';
  if (group.negotiationStage === 'closed') return 'Debrief outcome into memory';
  return 'Monitor buyer response';
}

function tableSortHref(sort: string) {
  return sort === 'priority' ? '/buying-groups' : `/buying-groups?sort=${sort}`;
}

function BuyingGroupSortableHeader({
  activeSort,
  label,
  sort
}: {
  activeSort: string;
  label: string;
  sort: string;
}) {
  const active = parseSortParam(activeSort).key === sort;
  const nextSort = nextSortParam(activeSort, sort);
  return (
    <a className={active ? 'active' : ''} href={tableSortHref(nextSort)} aria-current={active ? 'true' : undefined}>
      {label}
      {active ? <span aria-hidden="true">{sortDirectionArrow(activeSort, sort)}</span> : null}
    </a>
  );
}

function BuyingGroupTriageTable({ activeSort = 'priority', groups }: { activeSort?: string; groups: BuyingGroup[] }) {
  if (!groups.length) return <EmptyGeneratedState label="Buying groups" />;

  return (
    <section className="atlas-buyer-triage-table-wrap" aria-label="Buying group triage table">
      <table className="atlas-buyer-triage-table">
        <thead>
          <tr>
            <th>Buying group</th>
            <th><BuyingGroupSortableHeader activeSort={activeSort} label="Risk" sort="priority" /></th>
            <th><BuyingGroupSortableHeader activeSort={activeSort} label="Margin at risk" sort="margin" /></th>
            <th><BuyingGroupSortableHeader activeSort={activeSort} label="Target gap" sort="gap" /></th>
            <th>Scenario to test</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const exposure = group.financialExposure;
            const markets = group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ');
            const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
            const href = `/buying-groups/${group.id}?view=strategy`;
            return (
              <tr
                className={`risk-${group.riskLevel}`}
                key={group.id}
                onClick={() => { window.location.href = href; }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.location.href = href;
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <td>
                  <strong>{group.name}</strong>
                  <small>{markets} · {buyerRoundLabel(group)} · {group.negotiationStage}</small>
                </td>
                <td>
                  <span className="atlas-buyer-risk-explain" title={buyerRiskReason(group)}>
                    <span className={`atlas-buyer-risk-table-pill risk-${group.riskLevel}`}>{group.riskLevel}</span>
                    <span className="atlas-risk-tooltip" role="tooltip">{buyerRiskReason(group)}</span>
                  </span>
                </td>
                <td className={`metric-${buyerMetricTone('margin', group)}`}>{euros(exposure.marginAtRisk)}</td>
                <td className={`metric-${buyerMetricTone('gap', group)}`}>{pct(realizationGap)}</td>
                <td>
                  <span className="atlas-buyer-scenario-route">
                    {buyerScenarioToTest(group)}
                    <em>Open workspace</em>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function BuyingGroupTriageCard({ group, rank }: { group: BuyingGroup; rank: number }) {
  const exposure = group.financialExposure;
  const markets = group.primaryMarkets.map((id) => getMarket(id)?.name ?? id).join(' / ');
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;

  return (
    <a href={`/buying-groups/${group.id}`} className={`atlas-buyer-triage-card ${classNameForRisk(group.riskLevel)}`}>
      <div className="atlas-buyer-triage-main">
        <header>
          <span>#{rank} / {group.riskLevel} risk</span>
          <h3>{group.name}</h3>
          <p>{markets} · {group.categories.join(', ')}</p>
          <WhyShownLine
            detail="this buyer changes relationship priority, exposure, or intervention need"
            reasons={['materiality', 'urgency', 'action']}
          />
        </header>
        <dl className="atlas-buyer-triage-state">
          <div className={`metric-${buyerMetricTone('round', group)}`}><dt>Stage</dt><dd>{buyerRoundLabel(group)} · {group.negotiationStage}</dd></div>
          <div><dt>Open first because</dt><dd>{buyerInterventionTrigger(group)}</dd></div>
        </dl>
      </div>
      <section className="atlas-buyer-triage-metrics" aria-label={`${group.name} financial exposure`}>
        <div className={`metric-${buyerMetricTone('margin', group)}`}>
          <span>Margin risk</span>
          <strong>{euros(exposure.marginAtRisk)}</strong>
        </div>
        <div className={`metric-${buyerMetricTone('gap', group)}`}>
          <span>Gap to target</span>
          <strong>{pct(realizationGap)}</strong>
        </div>
        <div>
          <span>Revenue in play</span>
          <strong>{euros(exposure.revenueUnderNegotiation)}</strong>
        </div>
        <div className={`metric-${buyerMetricTone('realization', group)}`}>
          <span>Expected / target</span>
          <strong>{pct(exposure.expectedPriceRealization)} / {pct(exposure.targetPriceRealization)}</strong>
        </div>
      </section>
    </a>
  );
}

function BuyingGroupTriageQueue({ groups }: { groups: BuyingGroup[] }) {
  if (!groups.length) return <EmptyGeneratedState label="Buying groups" />;
  return (
    <section className="atlas-buyer-triage-queue" aria-label="Prioritized buying group triage queue">
      {groups.map((group, index) => <BuyingGroupTriageCard group={group} key={group.id} rank={index + 1} />)}
    </section>
  );
}

function BuyingGroupsView({
  buyingGroupId,
  initialPhase,
  initialPrompt,
  initialSort,
  initialView
}: {
  buyingGroupId?: string;
  initialPhase?: string;
  initialPrompt?: string;
  initialSort?: string;
  initialView?: string;
}) {
  if (buyingGroupId) {
    return (
      <BuyingGroupWorkspaceView
        buyingGroupId={buyingGroupId}
        initialPhase={initialPhase}
        initialPrompt={initialPrompt}
        initialView={initialView}
      />
    );
  }

  const groups = sortBuyingGroups(packet.buyingGroups, initialSort);
  const generatedView = initialView || inferGeneratedView(initialPrompt, 'buyer-ranking');
  const visibleGroups = filterBuyingGroupsForAsk(groups, initialPrompt, generatedView);
  return (
    <>
      <BuyingGroupSortBar />
      <section className="atlas-buyer-list-shell">
        <BuyingGroupTriageTable activeSort={initialSort || 'priority'} groups={visibleGroups} />
      </section>
    </>
  );
}

function FinancialImpactView({ initialPrompt: _initialPrompt }: { initialGeneratedView?: string; initialPrompt?: string }) {
  return <PepsiCoImpactWorkspace />;
}

function scenarioInputsForBuyingGroup(group?: BuyingGroup): ScenarioInputs {
  const exposure = group?.financialExposure;
  if (!group || !exposure) return packet.scenarioModels[0].inputs;
  const realizationGap = exposure.targetPriceRealization - exposure.expectedPriceRealization;
  return {
    buyerAcceptanceProbability: Math.max(35, Math.min(82, Math.round(72 - realizationGap * 14 - riskRank(group.riskLevel) * 4))),
    competitorPressureLevel: group.competitorMoves.length ? 'medium' : 'low',
    concessionAmount: Math.max(0, Math.round(exposure.marginAtRisk * 0.08)),
    contractLengthMonths: 12,
    costInflationPercent: Math.max(1.8, Math.min(5.5, exposure.targetPriceRealization + 0.4)),
    expectedRealizationPercent: exposure.expectedPriceRealization,
    priceIncreasePercent: exposure.targetPriceRealization,
    tradeSpendChange: Math.max(0, exposure.tradeSpendExposure ?? Math.round(exposure.marginAtRisk * 0.12)),
    volumeChangePercent: exposure.volumeExposure ? Math.max(-5, Math.min(3, exposure.volumeExposure / exposure.revenueUnderNegotiation * 100)) : -1.2
  };
}

function scenarioInputsForMarket(market?: Market): ScenarioInputs {
  if (!market) return packet.scenarioModels[0].inputs;
  const expectedRealizationPercent = Math.max(1.4, Math.min(3.4, 3.4 - riskRank(market.pressureLevel) * 0.32));
  return {
    buyerAcceptanceProbability: Math.max(38, Math.min(78, 72 - riskRank(market.pressureLevel) * 8)),
    competitorPressureLevel: market.pressureLevel === 'critical' ? 'high' : market.pressureLevel === 'high' ? 'medium' : 'low',
    concessionAmount: Math.round(market.marginAtRisk * 0.16),
    contractLengthMonths: 12,
    costInflationPercent: market.pressureLevel === 'critical' ? 3.9 : market.pressureLevel === 'high' ? 3.4 : 2.7,
    expectedRealizationPercent,
    priceIncreasePercent: Math.max(expectedRealizationPercent + 0.5, 3.2),
    tradeSpendChange: Math.round(market.tradeSpendExposure * 0.12),
    volumeChangePercent: Math.max(-5, Math.min(2.5, market.gapToPlan / market.revenueUnderNegotiation * -100))
  };
}

type ScenarioFocus = 'full' | 'price' | 'risk' | 'trade' | 'volume';

function normalizeScenarioFocus(view?: string, prompt?: string): ScenarioFocus {
  const normalized = `${view ?? ''} ${prompt ?? ''}`.toLowerCase();
  if (/trade|promo|spend|investment/.test(normalized)) return 'trade';
  if (/volume|recovery|cases|unit/.test(normalized)) return 'volume';
  if (/risk|acceptance|probability|competitor|pressure/.test(normalized)) return 'risk';
  if (/price|realization|target|red line|ask|counter/.test(normalized)) return 'price';
  return 'full';
}

function scenarioFocusLabel(focus: ScenarioFocus) {
  if (focus === 'price') return 'Price realization';
  if (focus === 'trade') return 'Trade spend';
  if (focus === 'volume') return 'Volume recovery';
  if (focus === 'risk') return 'Buyer risk';
  return 'Full financial model';
}

function ScenarioModelsView({
  buyingGroupId,
  initialScenarioCaseId,
  initialScenarioId,
  initialScenarioLabMode,
  initialPrompt,
  marketId,
  returnLabel,
  returnTo
}: {
  buyingGroupId?: string;
  initialScenarioCaseId?: string;
  initialScenarioId?: string;
  initialScenarioLabMode?: string;
  initialPrompt?: string;
  initialView?: string;
  marketId?: string;
  returnLabel?: string;
  returnTo?: string;
}) {
  const defaultScenario = packet.scenarioModels[0];
  const attachedBuyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
  const attachedMarkets = attachedBuyingGroup?.primaryMarkets.map((id) => getMarket(id)).filter((market): market is Market => Boolean(market)) ?? [];
  const requestedMarket = marketId ? getMarket(marketId) : undefined;
  const selectedMarket = requestedMarket && (!attachedBuyingGroup || attachedBuyingGroup.primaryMarkets.includes(requestedMarket.id))
    ? requestedMarket
    : undefined;
  const attachedMarket = !attachedBuyingGroup ? selectedMarket : undefined;
  const initialInputs = useMemo(() => attachedBuyingGroup ? scenarioInputsForBuyingGroup(attachedBuyingGroup) : scenarioInputsForMarket(attachedMarket), [attachedBuyingGroup, attachedMarket]);
  const baseRevenue = attachedBuyingGroup?.financialExposure.revenueUnderNegotiation ?? attachedMarket?.revenueUnderNegotiation ?? 22000000;
  const scenarioSource = attachedBuyingGroup?.source ?? attachedMarket?.source ?? packet.documents.find((document) => document.id === defaultScenario.sourceIds[0])?.source ?? packet.markets[0].source;
  const [inputs, setInputs] = useState<ScenarioInputs>(initialInputs);
  const [scenarioSaveStatus, setScenarioSaveStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ScenarioWorkspaceLevel>(attachedBuyingGroup ? 'buying_group' : attachedMarket ? 'market' : 'portfolio');
  const [selectedScenarioId, setSelectedScenarioId] = useState(initialScenarioId ?? '');
  const [scenarioLabMode, setScenarioLabMode] = useState<ScenarioLabMode>(initialScenarioLabMode === 'create' ? 'create' : 'review');
  const [scenarioTypeFilter, setScenarioTypeFilter] = useState('all');
  const [scenarioCaseTriggerFilter, setScenarioCaseTriggerFilter] = useState('all');
  const [expandedScenarioEventIds, setExpandedScenarioEventIds] = useState<string[]>([]);
  const [expandedScenarioRowIds, setExpandedScenarioRowIds] = useState<string[]>([]);
  const [compareScenarioIds, setCompareScenarioIds] = useState<string[]>([]);
  const [savedManualScenarios, setSavedManualScenarios] = useState<ScenarioLabOption[]>([]);
  const [scenarioEditOverrides, setScenarioEditOverrides] = useState<Record<string, ScenarioLabOption>>({});
  const [fullScenarioAdjusting, setFullScenarioAdjusting] = useState(false);
  const [fullScenarioDraftInputs, setFullScenarioDraftInputs] = useState<ScenarioInputs | null>(null);
  const [fullScenarioExtraLevers, setFullScenarioExtraLevers] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [skuRows, setSkuRows] = useState<ScenarioSkuRow[]>([
    { id: 'scenario-sku-core', sku: 'Core multipack family', priceMove: initialInputs.priceIncreasePercent, volumeRisk: Math.abs(initialInputs.volumeChangePercent), margin: 31.2, sensitivity: 'Medium' },
    { id: 'scenario-sku-promo', sku: 'Promo pack architecture', priceMove: Math.max(0.5, initialInputs.priceIncreasePercent - 0.4), volumeRisk: Math.abs(initialInputs.volumeChangePercent) + 0.7, margin: 27.6, sensitivity: 'High' }
  ]);
  const [customLevers, setCustomLevers] = useState<ScenarioCustomLeverRow[]>([
    { id: 'scenario-custom-terms', name: 'Payment terms', value: '30 days', impact: 'Protects cash exposure', status: 'Assumption', weight: 4 },
    { id: 'scenario-custom-kpi', name: 'Retailer KPI support', value: 'Visibility commitment', impact: 'Improves buyer acceptance', status: 'User-added', weight: 3 }
  ]);
  const [scenarioDebriefStatus, setScenarioDebriefStatus] = useState('');
  const [scenarioDebriefText, setScenarioDebriefText] = useState('');
  const [scenarioDebriefBuyerCounter, setScenarioDebriefBuyerCounter] = useState('');
  const [scenarioDebriefFinalLanded, setScenarioDebriefFinalLanded] = useState('');
  const [scenarioDebriefBehavior, setScenarioDebriefBehavior] = useState('Asked for trade support before accepting price');
  const [scenarioDebriefNextCycle, setScenarioDebriefNextCycle] = useState('');
  const [scenarioDebriefAttachments, setScenarioDebriefAttachments] = useState('');
  const [scenarioDebriefEntries, setScenarioDebriefEntries] = useState<ScenarioDebriefEntry[]>([]);
  const resolvedReturnHref = normalizeAtlasReturnHref(returnTo);
  const resolvedReturnLabel = normalizeAtlasReturnLabel(returnLabel);
  const outputs = useMemo(() => calculateScenarioOutputs(inputs, baseRevenue), [baseRevenue, inputs]);
  const scenarioOwnerName = attachedBuyingGroup?.name ?? attachedMarket?.name ?? 'Europe portfolio';
  const scenarioScopeName = attachedBuyingGroup && selectedMarket
    ? `${attachedBuyingGroup.name} · ${selectedMarket.name}`
    : scenarioOwnerName;
  const selectedMarketId = selectedMarket?.id ?? '';
  const selectedBuyingGroupId = attachedBuyingGroup?.id ?? '';
  const marketOptions = attachedBuyingGroup ? attachedMarkets : packet.markets;
  const marketScopedBuyingGroups = selectedMarket
    ? packet.buyingGroups.filter((group) => group.primaryMarkets.includes(selectedMarket.id))
    : packet.buyingGroups;
  const scenarioContextGroups = [...marketScopedBuyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
    .slice(0, 5);
  const attachedWorkspace = attachedBuyingGroup ? buildBuyingGroupWorkspacePacket(attachedBuyingGroup.id) : undefined;
  const latestScenarioDebrief = scenarioDebriefEntries[0];
  function scenarioHref({ buyer = selectedBuyingGroupId, market = selectedMarketId }: { buyer?: string; market?: string } = {}) {
    const params = new URLSearchParams();
    if (market) params.set('market', market);
    if (buyer) params.set('buyingGroup', buyer);
    const query = params.toString();
    return query ? `/scenario-lab?${query}` : '/scenario-lab';
  }

  function scenarioHrefWithReturn(href: string) {
    return appendAtlasReturnContext(href, resolvedReturnHref, resolvedReturnLabel);
  }

  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  useEffect(() => {
    setScenarioDebriefEntries(readScenarioDebriefMemory(attachedBuyingGroup?.id));
  }, [attachedBuyingGroup?.id]);

  function updateInput<K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
    setSelectedScenarioId('custom');
  }

  function inputsForScenarioLevel(level: ScenarioWorkspaceLevel): ScenarioInputs {
    if (level === 'portfolio') {
      const topMarket = packet.highPressureMarkets[0];
      return {
        ...scenarioInputsForMarket(topMarket),
        buyerAcceptanceProbability: Math.max(32, scenarioInputsForMarket(topMarket).buyerAcceptanceProbability - 8),
        concessionAmount: Math.round(packet.summary.gapToPlan * 0.08),
        tradeSpendChange: Math.round(packet.summary.marginAtRisk * 0.06)
      };
    }
    if (level === 'market') return scenarioInputsForMarket(selectedMarket ?? attachedMarket ?? workspacePrimaryMarket(attachedWorkspace));
    if (level === 'category') {
      return {
        ...initialInputs,
        buyerAcceptanceProbability: Math.max(25, initialInputs.buyerAcceptanceProbability - 5),
        concessionAmount: Math.round(initialInputs.concessionAmount * 1.08),
        costInflationPercent: Math.min(7, initialInputs.costInflationPercent + 0.6),
        expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.2),
        tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.15),
        volumeChangePercent: initialInputs.volumeChangePercent - 0.4
      };
    }
    if (level === 'sku') {
      const averagePriceMove = skuRows.reduce((sum, row) => sum + row.priceMove, 0) / Math.max(1, skuRows.length);
      const averageVolumeRisk = skuRows.reduce((sum, row) => sum + row.volumeRisk, 0) / Math.max(1, skuRows.length);
      const highSensitivityCount = skuRows.filter((row) => row.sensitivity.toLowerCase().includes('high')).length;
      return {
        ...initialInputs,
        buyerAcceptanceProbability: Math.max(20, initialInputs.buyerAcceptanceProbability - highSensitivityCount * 5),
        expectedRealizationPercent: Math.max(0.4, averagePriceMove - 0.35),
        priceIncreasePercent: averagePriceMove,
        volumeChangePercent: -Math.abs(averageVolumeRisk)
      };
    }
    if (level === 'custom') {
      const leverWeight = customLevers.reduce((sum, row) => sum + row.weight, 0);
      return {
        ...inputs,
        buyerAcceptanceProbability: Math.max(20, Math.min(95, inputs.buyerAcceptanceProbability + Math.round(leverWeight / 3))),
        concessionAmount: Math.round(inputs.concessionAmount + leverWeight * 18000),
        tradeSpendChange: Math.round(inputs.tradeSpendChange + leverWeight * 22000)
      };
    }
    return scenarioInputsForBuyingGroup(attachedBuyingGroup ?? attachedWorkspace?.buyingGroup);
  }

  function selectScenarioLevel(level: ScenarioWorkspaceLevel) {
    setSelectedLevel(level);
    setInputs(inputsForScenarioLevel(level));
    setSelectedScenarioId(level === 'buying_group' || level === 'portfolio' ? 'recommended' : 'custom');
  }

  function workspacePrimaryMarket(workspace?: BuyingGroupWorkspacePacket) {
    return workspace?.markets[0];
  }

  function updateSkuRow<K extends keyof ScenarioSkuRow>(id: string, key: K, value: ScenarioSkuRow[K]) {
    setSkuRows((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
    setSelectedLevel('sku');
    setSelectedScenarioId('custom');
  }

  function addSkuRow() {
    setSkuRows((current) => [
      ...current,
      { id: `scenario-sku-${current.length + 1}`, sku: 'User-added SKU / pack', priceMove: inputs.priceIncreasePercent, volumeRisk: Math.abs(inputs.volumeChangePercent), margin: 29.5, sensitivity: 'Needs review' }
    ]);
    setSelectedLevel('sku');
    setSelectedScenarioId('custom');
  }

  function removeSkuRow(id: string) {
    setSkuRows((current) => current.filter((row) => row.id !== id));
    setSelectedScenarioId('custom');
  }

  function updateCustomLever<K extends keyof ScenarioCustomLeverRow>(id: string, key: K, value: ScenarioCustomLeverRow[K]) {
    setCustomLevers((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
    setSelectedLevel('custom');
    setSelectedScenarioId('custom');
  }

  function addCustomLever() {
    setCustomLevers((current) => [
      ...current,
      { id: `scenario-lever-${current.length + 1}`, name: 'User-added lever', value: 'Define value', impact: 'Describe impact', status: 'Needs review', weight: 2 }
    ]);
    setSelectedLevel('custom');
    setSelectedScenarioId('custom');
  }

  function removeCustomLever(id: string) {
    setCustomLevers((current) => current.filter((row) => row.id !== id));
    setSelectedScenarioId('custom');
  }

  function saveScenarioDebrief() {
    const hasDebrief = scenarioDebriefText.trim()
      || scenarioDebriefBuyerCounter.trim()
      || scenarioDebriefFinalLanded.trim()
      || scenarioDebriefNextCycle.trim()
      || scenarioDebriefAttachments.trim();
    if (!hasDebrief) {
      setScenarioDebriefStatus('Add a note, outcome, buyer counter, or next-cycle learning before saving.');
      return;
    }
    const predictionImpact = scenarioDebriefNextCycle.trim()
      ? `Prediction updated: next model should account for "${scenarioDebriefNextCycle.trim()}".`
      : scenarioDebriefBuyerCounter.trim()
        ? `Prediction updated: buyer-counter case now anchors near ${scenarioDebriefBuyerCounter.trim()}.`
        : 'Prediction updated: buyer behavior memory now adjusts the scenario read.';
    const entry: ScenarioDebriefEntry = {
      attachments: scenarioDebriefAttachments.trim(),
      behavior: scenarioDebriefBehavior,
      buyingGroupId: attachedBuyingGroup?.id,
      buyerCounter: scenarioDebriefBuyerCounter.trim(),
      concessions: '',
      createdAt: new Date().toISOString(),
      evidenceStrengthAfter: selectedPredictiveScenario.evidenceStrength,
      finalLanded: scenarioDebriefFinalLanded.trim(),
      id: `scenario-debrief-${Date.now()}`,
      nextCycle: scenarioDebriefNextCycle.trim(),
      note: scenarioDebriefText.trim(),
      predictionAfter: predictionImpact,
      predictionBefore: selectedPredictiveScenario.buyerResponse,
      scenarioId: selectedPredictiveScenario.id,
      selectedScenarioLabel: selectedPredictiveScenario.name,
      predictionImpact
    };
    writeScenarioDebriefMemory(entry);
    setScenarioDebriefEntries((current) => [entry, ...current]);
    setScenarioDebriefStatus(`Debrief saved. ${predictionImpact}`);
    setScenarioDebriefText('');
    setScenarioDebriefBuyerCounter('');
    setScenarioDebriefFinalLanded('');
    setScenarioDebriefNextCycle('');
    setScenarioDebriefAttachments('');
  }

  const scenarioControlRows: Array<{ affects: string; key: keyof ScenarioInputs; label: string; max: number; min: number; step: number }> = [
    { key: 'priceIncreasePercent', label: 'Price increase %', min: 0, max: Math.max(6, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Target ask, acceptance, revenue' },
    { key: 'expectedRealizationPercent', label: 'Expected realization %', min: 0, max: Math.max(5, inputs.priceIncreasePercent + 1), step: 0.1, affects: 'Gap to plan, margin, risk value' },
    { key: 'volumeChangePercent', label: 'Volume change %', min: -5, max: 3, step: 0.1, affects: 'Volume, revenue, buyer risk' },
    { key: 'tradeSpendChange', label: 'Trade spend change EUR', min: 0, max: Math.max(1000000, inputs.tradeSpendChange * 1.5), step: 25000, affects: 'Trade spend, margin, acceptance' },
    { key: 'concessionAmount', label: 'Concession amount EUR', min: 0, max: Math.max(1000000, inputs.concessionAmount * 1.75), step: 25000, affects: 'Revenue leakage, guardrail pressure' },
    { key: 'costInflationPercent', label: 'Cost inflation %', min: 0, max: Math.max(6, inputs.costInflationPercent + 1), step: 0.1, affects: 'Evidence strength, defendability' },
    { key: 'buyerAcceptanceProbability', label: 'Buyer acceptance probability', min: 0, max: 100, step: 1, affects: 'Risk-adjusted value' },
    { key: 'contractLengthMonths', label: 'Contract length months', min: 3, max: 24, step: 1, affects: 'Exposure window, lock-in risk' }
  ];
  const primaryScenarioControlKeys = new Set<keyof ScenarioInputs>([
    'priceIncreasePercent',
    'expectedRealizationPercent',
    'volumeChangePercent',
    'tradeSpendChange',
    'buyerAcceptanceProbability'
  ]);
  const visibleScenarioControls = scenarioControlRows.filter((row) => primaryScenarioControlKeys.has(row.key));
  const advancedScenarioControls = scenarioControlRows.filter((row) => !primaryScenarioControlKeys.has(row.key));
  function formatScenarioInputValue(key: keyof ScenarioInputs, value: number) {
    if (key === 'buyerAcceptanceProbability' || key.includes('Percent')) return `${value.toFixed(key === 'buyerAcceptanceProbability' ? 0 : 1)}%`;
    if (key === 'contractLengthMonths') return `${value.toFixed(0)} mo`;
    return euros(value);
  }
  function scenarioDeltaLabel(value: number) {
    if (value === 0) return 'No change';
    return `${value > 0 ? '+' : ''}${euros(value)}`;
  }
  function scenarioPercentChange(delta: number, baseline: number) {
    if (!baseline) return 'n/a';
    const percentage = (delta / baseline) * 100;
    if (Math.abs(percentage) < 0.05) return '0.0%';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }
  const scenarioBaselineMetrics = attachedBuyingGroup
    ? {
        margin: attachedBuyingGroup.financialExposure.marginAtRisk,
        revenue: attachedBuyingGroup.financialExposure.revenueUnderNegotiation,
        trade: attachedBuyingGroup.financialExposure.tradeSpendExposure,
        volume: attachedBuyingGroup.financialExposure.volumeExposure
      }
    : attachedMarket
      ? {
          margin: attachedMarket.marginAtRisk,
          revenue: attachedMarket.revenueUnderNegotiation,
          trade: attachedMarket.tradeSpendExposure,
          volume: 0
        }
      : {
          margin: 0,
          revenue: baseRevenue,
          trade: inputs.tradeSpendChange,
          volume: 0
        };
  const scenarioMetricCards = [
    { delta: outputs.revenueImpact, label: 'Revenue', value: scenarioBaselineMetrics.revenue },
    { delta: outputs.marginImpact, label: 'Margin', value: scenarioBaselineMetrics.margin },
    { delta: outputs.volumeImpact, label: 'Volume', value: scenarioBaselineMetrics.volume },
    { delta: outputs.tradeSpendImpact, label: 'Trade spend', value: scenarioBaselineMetrics.trade }
  ];
  const buyerAskForCorridor = attachedWorkspace ? Number.parseFloat(attachedWorkspace.currentState.latestBuyerAsk) : inputs.priceIncreasePercent + 1.2;
  const currentPositionForCorridor = attachedWorkspace ? Number.parseFloat(attachedWorkspace.currentState.pepsicoPosition) : inputs.expectedRealizationPercent;
  const recommendedAskForCorridor = inputs.priceIncreasePercent;
  const targetForCorridor = Math.max(inputs.expectedRealizationPercent, recommendedAskForCorridor - 0.2);
  const fallbackForCorridor = Math.max(0, inputs.expectedRealizationPercent - 0.4);
  const redLineForCorridor = Math.max(0, fallbackForCorridor - 0.7);
  const corridorValues = [
    { label: 'Buyer ask', value: buyerAskForCorridor, tone: 'buyer' },
    { label: 'Current', value: currentPositionForCorridor, tone: 'current' },
    { label: 'Recommended ask', value: recommendedAskForCorridor, tone: 'recommended' },
    { label: 'Target', value: targetForCorridor, tone: 'target' },
    { label: 'Fallback', value: fallbackForCorridor, tone: 'fallback' },
    { label: 'Red line', value: redLineForCorridor, tone: 'redline' }
  ];
  const corridorMin = Math.min(...corridorValues.map((item) => item.value), 0);
  const corridorMax = Math.max(...corridorValues.map((item) => item.value), buyerAskForCorridor, recommendedAskForCorridor, 1);
  const corridorPosition = (value: number) => `${Math.min(100, Math.max(0, ((value - corridorMin) / Math.max(corridorMax - corridorMin, 1)) * 100))}%`;
  const corridorBreached = inputs.expectedRealizationPercent < redLineForCorridor || outputs.marginImpact < -Math.max(350000, scenarioBaselineMetrics.margin * 0.08);
  const scenarioReportPrompt = [
    `Create a PDF-ready financial scenario output for ${scenarioScopeName}.`,
    attachedBuyingGroup ? `Buying group: ${attachedBuyingGroup.name}.` : null,
    selectedMarket ? `Market: ${selectedMarket.name}.` : attachedMarket ? `Market: ${attachedMarket.name}.` : 'Market scope: Europe.',
    `Inputs: price increase ${inputs.priceIncreasePercent.toFixed(1)}%, expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, volume change ${inputs.volumeChangePercent.toFixed(1)}%, trade spend ${euros(inputs.tradeSpendChange)}, concession ${euros(inputs.concessionAmount)}, cost inflation ${inputs.costInflationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, competitor pressure ${inputs.competitorPressureLevel}, contract length ${inputs.contractLengthMonths} months.`,
    latestScenarioDebrief ? `Latest debrief memory: buyer counter ${latestScenarioDebrief.buyerCounter || 'not entered'}, landed ${latestScenarioDebrief.finalLanded || 'not entered'}, behavior "${latestScenarioDebrief.behavior}", next-cycle learning "${latestScenarioDebrief.nextCycle || latestScenarioDebrief.predictionImpact}".` : null,
    `Outputs: revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, volume ${scenarioDeltaLabel(outputs.volumeImpact)}, trade spend ${scenarioDeltaLabel(outputs.tradeSpendImpact)}, gap to plan ${scenarioDeltaLabel(outputs.gapToPlanImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}, risk ${outputs.riskLevel}.`,
    `Include current baseline, raw changes, percentage changes, source/freshness/confidence, assumptions, and recommended follow-up.`
  ].filter(Boolean).join('\n');
  const scenarioReportParams = new URLSearchParams({
    mode: 'draft',
    print: '1',
    prompt: scenarioReportPrompt,
    reportOnly: '1',
    reportType: 'scenario_evidence'
  });
  if (selectedBuyingGroupId) scenarioReportParams.set('buyingGroupId', selectedBuyingGroupId);
  if (selectedMarketId) scenarioReportParams.set('marketId', selectedMarketId);
  const scenarioAlerts = [
    attachedBuyingGroup ? buyingGroupToAlert(attachedBuyingGroup) : null,
    attachedMarket ? marketToAlert(attachedMarket) : selectedMarket ? marketToAlert(selectedMarket) : null,
    attachedWorkspace?.signals[0] ? signalToAlert(attachedWorkspace.signals[0]) : null,
    scenarioToAlert(defaultScenario)
  ].filter((alert): alert is AtlasActiveAlert => Boolean(alert));
  const scenarioLevels: Array<{ id: ScenarioWorkspaceLevel; label: string; note: string }> = [
    { id: 'portfolio', label: 'Portfolio', note: 'Europe risk scan' },
    { id: 'market', label: 'Market', note: selectedMarket?.name ?? attachedMarket?.name ?? 'Europe' },
    { id: 'buying_group', label: 'Buying group', note: attachedBuyingGroup?.name ?? 'Select buyer' },
    { id: 'category', label: 'Category', note: attachedBuyingGroup?.categories[0] ?? 'Category mix' },
    { id: 'sku', label: 'SKU drill-in', note: `${skuRows.length} rows` },
    { id: 'custom', label: 'Custom levers', note: `${customLevers.length} levers` }
  ];
  const portfolioTopGroup = packet.topExposureBuyingGroups[0];
  const portfolioSecondGroup = packet.topExposureBuyingGroups[1] ?? portfolioTopGroup;
  const portfolioTopMarket = packet.highPressureMarkets[0];
  const portfolioSecondMarket = packet.highPressureMarkets[1] ?? portfolioTopMarket;
  const scenarioOpportunityRows = [
    {
      action: 'Start portfolio scan',
      detail: `${packet.summary.highRiskBuyingGroups} high-risk buyers · ${euros(packet.summary.gapToPlan)} gap to plan`,
      effect: 'Compare the top market and buyer risks before choosing a focused scenario.',
      href: '/scenario-lab',
      level: 'Portfolio',
      title: 'Europe plan exposure needs a scenario scan',
      value: euros(packet.summary.marginAtRisk)
    },
    {
      action: `Model ${portfolioTopGroup.name}`,
      detail: `${pct(portfolioTopGroup.financialExposure.expectedPriceRealization)} expected vs ${pct(portfolioTopGroup.financialExposure.targetPriceRealization)} target`,
      effect: 'Predict buyer counter, margin impact, and whether the move should feed buyer memory.',
      href: `/scenario-lab?buyingGroup=${portfolioTopGroup.id}`,
      level: 'Buying group',
      title: `${portfolioTopGroup.name} has the highest buyer exposure`,
      value: euros(portfolioTopGroup.financialExposure.marginAtRisk)
    },
    {
      action: `Model ${portfolioTopMarket.name}`,
      detail: `${portfolioTopMarket.activeBuyingGroups.length} buyers active · ${portfolioTopMarket.pressureLevel} pressure`,
      effect: 'Test whether market pressure should change buyer scenarios or stay as watchout context.',
      href: `/scenario-lab?market=${portfolioTopMarket.id}`,
      level: 'Market',
      title: `${portfolioTopMarket.name} pressure could affect multiple buyers`,
      value: euros(portfolioTopMarket.marginAtRisk)
    },
    {
      action: 'Compare buyer counter',
      detail: `${portfolioSecondGroup.name} and ${portfolioTopGroup.name} are both below target realization`,
      effect: 'Use A/B/C comparison to decide which buyer counter is worth preparing first.',
      href: `/scenario-lab?buyingGroup=${portfolioSecondGroup.id}`,
      level: 'Buyer counter',
      title: 'Buyer-counter scenarios need prioritization',
      value: `${pct(portfolioSecondGroup.financialExposure.targetPriceRealization - portfolioSecondGroup.financialExposure.expectedPriceRealization)} gap`
    },
    {
      action: 'Test category/SKU drill-in',
      detail: `${portfolioTopGroup.categories[0] ?? 'Core category'} · optional SKU rows only when material`,
      effect: 'Use SKU-level inputs only if a specific pack, category, or customer lever changes the decision.',
      href: `/scenario-lab?buyingGroup=${portfolioTopGroup.id}`,
      level: 'SKU optional',
      title: 'SKU or custom levers may matter for the top buyer',
      value: `${skuRows.length} starter rows`
    },
    {
      action: `Model ${portfolioSecondMarket.name}`,
      detail: `${portfolioSecondMarket.activeBuyingGroups.length} active buyers · ${euros(portfolioSecondMarket.gapToPlan)} gap`,
      effect: 'Check whether the second market creates an offset, watchout, or buyer-specific scenario input.',
      href: `/scenario-lab?market=${portfolioSecondMarket.id}`,
      level: 'Market',
      title: `${portfolioSecondMarket.name} is the next market to test`,
      value: euros(portfolioSecondMarket.marginAtRisk)
    }
  ];
  const levelContextRows = [
    { label: 'Scope', value: scenarioScopeName },
    { label: 'Level', value: scenarioLevels.find((level) => level.id === selectedLevel)?.label ?? 'Scenario' },
    { label: 'Source', value: sourceTypeLabel(scenarioSource) },
    { label: 'Confidence', value: scenarioSource.confidence }
  ];
  function predictiveScenario(
    id: string,
    name: string,
    description: string,
    scenarioInputs: ScenarioInputs,
    why: string
  ): Omit<ScenarioLabOption, 'createdAt' | 'origin' | 'scenarioStyle'> {
    const scenarioOutputs = calculateScenarioOutputs(scenarioInputs, baseRevenue);
    const likelihood = Math.max(1, Math.min(99, Math.round(scenarioInputs.buyerAcceptanceProbability)));
    const valueRatio = scenarioOutputs.riskAdjustedValue / Math.max(1, scenarioBaselineMetrics.margin || baseRevenue * 0.12);
    const debriefMemoryBoost = latestScenarioDebrief ? 10 : 0;
    const evidenceStrength = Math.min(96, 62 + (attachedWorkspace?.timelineEvents.length ?? 1) * 4 + (attachedWorkspace?.documents.length ?? 1) * 3 + debriefMemoryBoost);
    const guardrailRisk = scenarioInputs.expectedRealizationPercent < Math.max(0.4, initialInputs.expectedRealizationPercent - 0.5)
      ? 'Guardrail breach'
      : scenarioInputs.expectedRealizationPercent < initialInputs.expectedRealizationPercent
        ? 'Watch'
        : 'Inside corridor';
    const relationshipRisk = scenarioInputs.priceIncreasePercent > initialInputs.priceIncreasePercent + 0.55 || scenarioInputs.volumeChangePercent < initialInputs.volumeChangePercent - 0.8
      ? 'High'
      : scenarioInputs.priceIncreasePercent < initialInputs.priceIncreasePercent - 0.35
        ? 'Low'
        : 'Medium';
    const guardrailScore = guardrailRisk === 'Inside corridor' ? 16 : guardrailRisk === 'Watch' ? 4 : -18;
    const relationshipScore = relationshipRisk === 'Low' ? 10 : relationshipRisk === 'Medium' ? 4 : -10;
    const atlasScore = Math.max(1, Math.min(100, Math.round(likelihood * 0.36 + Math.max(0, Math.min(100, valueRatio * 100)) * 0.24 + evidenceStrength * 0.22 + guardrailScore + relationshipScore)));
    const likelyCounter = Math.max(0.4, scenarioInputs.priceIncreasePercent - (relationshipRisk === 'High' ? 0.8 : relationshipRisk === 'Medium' ? 0.5 : 0.3));
    const buyerResponse = latestScenarioDebrief
      ? `Updated from debrief: likely to counter near ${latestScenarioDebrief.buyerCounter || `${likelyCounter.toFixed(1)}%`} and repeat "${latestScenarioDebrief.behavior}".`
      : likelihood >= 72
      ? `Likely to challenge proof, then land near ${likelyCounter.toFixed(1)}%.`
      : likelihood >= 55
        ? `Likely to counter near ${likelyCounter.toFixed(1)}% and ask for trade support.`
        : 'Likely to resist and use affordability, volume, or competitor pressure as leverage.';
    const recommendedEdit = latestScenarioDebrief?.nextCycle
      ? latestScenarioDebrief.nextCycle
      : guardrailRisk === 'Guardrail breach'
      ? 'Raise expected realization before using this scenario.'
      : evidenceStrength < 76
        ? 'Attach prior-year outcome and source proof before taking this into the room.'
        : 'Usable for planning; pressure-test buyer counter before saving.';
    return {
      atlasScore,
      buyerResponse,
      description,
      evidenceStrength,
      guardrailRisk,
      id,
      inputs: scenarioInputs,
      likelihood,
      name,
      outputs: scenarioOutputs,
      recommendedEdit,
      relationshipRisk,
      valueProtected: scenarioOutputs.riskAdjustedValue,
      why
    };
  }
  const recommendedScenarioInputs = initialInputs;
  const conservativeScenarioInputs: ScenarioInputs = {
    ...initialInputs,
    buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 10),
    concessionAmount: Math.round(initialInputs.concessionAmount * 1.08),
    expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.25),
    priceIncreasePercent: Math.max(0.7, initialInputs.priceIncreasePercent - 0.3),
    tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.1),
    volumeChangePercent: Math.min(1.5, initialInputs.volumeChangePercent + 0.35)
  };
  const buyerCounterInputs: ScenarioInputs = {
    ...initialInputs,
    buyerAcceptanceProbability: Math.max(25, initialInputs.buyerAcceptanceProbability - 16),
    concessionAmount: Math.round(initialInputs.concessionAmount * 1.22),
    expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.55),
    priceIncreasePercent: Math.max(initialInputs.expectedRealizationPercent, initialInputs.priceIncreasePercent - 0.35),
    tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.18),
    volumeChangePercent: initialInputs.volumeChangePercent - 0.8
  };
  const aggressiveScenarioInputs: ScenarioInputs = {
    ...initialInputs,
    buyerAcceptanceProbability: Math.max(20, initialInputs.buyerAcceptanceProbability - 12),
    concessionAmount: Math.round(initialInputs.concessionAmount * 0.82),
    expectedRealizationPercent: Math.min(5.5, initialInputs.expectedRealizationPercent + 0.35),
    priceIncreasePercent: Math.min(6, initialInputs.priceIncreasePercent + 0.45),
    tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 0.88),
    volumeChangePercent: initialInputs.volumeChangePercent - 0.55
  };
  const planningScenarioOptions = [
    {
      createdAt: '2026-07-17T09:18:00.000Z',
      description: 'Pairs the price ask with a service-value commitment to improve acceptance without opening a pure concession.',
      id: 'service-value-tradeoff',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 6),
        tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.04),
        volumeChangePercent: Math.min(1.5, initialInputs.volumeChangePercent + 0.2)
      },
      name: 'Service-value tradeoff',
      scenarioStyle: 'Planning',
      why: 'Tests whether non-price value can protect the ask before adding trade support.'
    },
    {
      createdAt: '2026-07-17T09:21:00.000Z',
      description: 'Stages the realization ask across the agreement period to reduce first-round buyer resistance.',
      id: 'phased-realization-path',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 8),
        expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.15),
        priceIncreasePercent: Math.max(0.7, initialInputs.priceIncreasePercent - 0.1)
      },
      name: 'Phased realization path',
      scenarioStyle: 'Planning',
      why: 'Tests if a staged ask keeps the negotiation inside guardrails while improving the chance to land.'
    },
    {
      createdAt: '2026-07-17T09:24:00.000Z',
      description: 'Uses a controlled promo envelope to defend volume while keeping the landed price near target.',
      id: 'promo-envelope-defense',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 5),
        expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.1),
        tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.15),
        volumeChangePercent: Math.min(1.5, initialInputs.volumeChangePercent + 0.45)
      },
      name: 'Promo envelope defense',
      scenarioStyle: 'Planning',
      why: 'Tests whether a small, bounded support package prevents volume risk without breaking the pricing case.'
    },
    {
      createdAt: '2026-07-17T09:27:00.000Z',
      description: 'Offsets buyer pushback by shifting focus toward higher-margin categories in the same buying group.',
      id: 'category-mix-offset',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.max(25, initialInputs.buyerAcceptanceProbability - 2),
        expectedRealizationPercent: Math.min(5.2, initialInputs.expectedRealizationPercent + 0.1),
        priceIncreasePercent: Math.min(5.8, initialInputs.priceIncreasePercent + 0.15),
        volumeChangePercent: initialInputs.volumeChangePercent - 0.2
      },
      name: 'Category mix offset',
      scenarioStyle: 'Planning',
      why: 'Tests if the strategy can protect value by moving pressure away from the most sensitive category.'
    },
    {
      createdAt: '2026-07-17T09:30:00.000Z',
      description: 'Holds the price position but adds a guardrail review before any concession is offered.',
      id: 'finance-guardrail-review',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.max(30, initialInputs.buyerAcceptanceProbability - 4),
        concessionAmount: Math.round(initialInputs.concessionAmount * 0.72),
        expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.05),
        tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 0.94)
      },
      name: 'Finance guardrail review',
      scenarioStyle: 'Planning',
      why: 'Tests whether the team should slow the negotiation until Finance confirms the concession boundary.'
    }
  ].map((scenario) => ({
    ...predictiveScenario(scenario.id, scenario.name, scenario.description, scenario.inputs, scenario.why),
    createdAt: scenario.createdAt,
    origin: 'atlas' as const,
    scenarioStyle: scenario.scenarioStyle
  }));
  const referenceScenarioOptions = [
    {
      createdAt: '2026-07-17T09:34:00.000Z',
      description: 'Keeps the current recommended ask and only monitors buyer response timing against prior cycles.',
      id: 'response-cadence-watch',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 2)
      },
      name: 'Response cadence watch',
      scenarioStyle: 'Reference',
      why: 'Keeps the scenario available as a low-risk watchout if buyer timing starts to look unusual.'
    },
    {
      createdAt: '2026-07-17T09:37:00.000Z',
      description: 'Tests whether stronger source documentation changes confidence without changing the commercial move.',
      id: 'source-proof-only',
      inputs: initialInputs,
      name: 'Source proof only',
      scenarioStyle: 'Reference',
      why: 'Useful as a documentation check, but it does not change the pricing position by itself.'
    },
    {
      createdAt: '2026-07-17T09:40:00.000Z',
      description: 'Evaluates payment-term language as a minor support lever without changing price or trade spend.',
      id: 'terms-language-check',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 1)
      },
      name: 'Terms language check',
      scenarioStyle: 'Reference',
      why: 'Keeps a light operational lever in view without treating it as a primary scenario.'
    },
    {
      createdAt: '2026-07-17T09:43:00.000Z',
      description: 'Tracks whether an external market signal should stay as context rather than change the buyer move.',
      id: 'market-signal-monitor',
      inputs: initialInputs,
      name: 'Market signal monitor',
      scenarioStyle: 'Reference',
      why: 'Useful for awareness, but the signal is not material enough to change the current scenario.'
    },
    {
      createdAt: '2026-07-17T09:46:00.000Z',
      description: 'Keeps a buyer-history pattern visible for future rounds without changing this round’s assumption set.',
      id: 'history-pattern-reference',
      inputs: initialInputs,
      name: 'History pattern reference',
      scenarioStyle: 'Reference',
      why: 'Preserves the closed-loop learning, but it is not urgent unless the buyer repeats the pattern.'
    },
    {
      createdAt: '2026-07-17T09:49:00.000Z',
      description: 'Checks whether shelf-visibility language should be added as supporting evidence, not a financial lever.',
      id: 'visibility-language-check',
      inputs: {
        ...initialInputs,
        buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 1)
      },
      name: 'Visibility language check',
      scenarioStyle: 'Reference',
      why: 'A useful room-prep note, but not enough to change the modeled price or guardrail read.'
    }
  ].map((scenario) => ({
    ...predictiveScenario(scenario.id, scenario.name, scenario.description, scenario.inputs, scenario.why),
    createdAt: scenario.createdAt,
    origin: 'atlas' as const,
    scenarioStyle: scenario.scenarioStyle
  }));
	  const baseScenarioOptions = [
    { ...predictiveScenario('recommended', 'Balanced evidence-backed ask', 'Best current move based on buyer history, finance guardrails, and market signals.', recommendedScenarioInputs, 'Best default when the team needs a sourced starting point.'), createdAt: '2026-07-17T09:00:00.000Z', origin: 'atlas' as const, scenarioStyle: 'Recommended' },
    { ...predictiveScenario('conservative', 'Lower-risk landing path', 'Protect landing probability with a smaller price move and controlled support.', conservativeScenarioInputs, 'Best when relationship risk or source confidence makes the full move harder to land.'), createdAt: '2026-07-17T09:05:00.000Z', origin: 'atlas' as const, scenarioStyle: 'Conservative' },
    { ...predictiveScenario('aggressive', 'Value capture stretch', 'Push for more price realization with less trade support and higher buyer resistance.', aggressiveScenarioInputs, 'Use when margin protection is more important than relationship safety.'), createdAt: '2026-07-17T09:08:00.000Z', origin: 'atlas' as const, scenarioStyle: 'Aggressive' },
    { ...predictiveScenario('buyer-counter', 'Likely buyer counter', 'Models the buyer pushing back with lower realization and more trade support.', buyerCounterInputs, 'Use to prepare the downside case and pushback response.'), createdAt: '2026-07-17T09:10:00.000Z', origin: 'atlas' as const, scenarioStyle: 'Buyer counter' },
    { ...predictiveScenario('custom', 'Current working model', 'Uses the current levers, scenario level, SKU rows, and custom assumptions.', inputs, 'Updates as the CNO changes the model.'), createdAt: '2026-07-17T09:15:00.000Z', origin: 'atlas' as const, scenarioStyle: 'Custom' },
    ...planningScenarioOptions,
    ...referenceScenarioOptions,
    ...savedManualScenarios
	  ];
	  const scenarioOptions = baseScenarioOptions.map((scenario) => scenarioEditOverrides[scenario.id] ?? scenario);
	  const topRecommendedScenario = [...scenarioOptions].sort((a, b) => b.atlasScore - a.atlasScore)[0];
	  const selectedPredictiveScenario = scenarioOptions.find((scenario) => scenario.id === selectedScenarioId) ?? scenarioOptions[0];
	  useEffect(() => {
	    if (initialScenarioLabMode !== 'create' || !initialScenarioId) return;
	    const scenario = scenarioOptions.find((item) => item.id === initialScenarioId);
	    if (!scenario) return;
	    setInputs(scenario.inputs);
	    setSelectedScenarioId(scenario.id);
	  }, [initialScenarioId, initialScenarioLabMode]);
  function scenarioAttentionReason(scenario: ScenarioLabOption) {
    if (scenario.guardrailRisk === 'Guardrail breach') return 'Guardrail risk';
    if (scenario.relationshipRisk === 'High') return 'Buyer pushback risk';
    if (scenario.outputs.revenueImpact < -750000) return 'NR exposure';
    if (scenario.outputs.marginImpact < -300000) return 'Margin exposure';
    if (scenario.scenarioStyle === 'Buyer counter') return 'Likely counter';
    if (scenario.scenarioStyle === 'Aggressive') return 'Stress test';
    if (scenario.scenarioStyle === 'Reference') return 'Reference only';
    return scenario.likelihood >= 70 ? 'High likelihood' : 'Planning option';
  }

  function scenarioBuyingGroupContext(scenario: ScenarioLabOption) {
	    if (attachedBuyingGroup) {
	      return {
	        buyingGroup: attachedBuyingGroup.name,
	        buyingGroupId: attachedBuyingGroup.id,
	        market: attachedMarkets.map((market) => market.name).slice(0, 2).join(' / ') || selectedMarket?.name || 'Market',
	        marketId: selectedMarket?.id || attachedBuyingGroup.primaryMarkets[0]
	      };
	    }
    const directModel = packet.scenarioModels.find((model) => model.id === scenario.id || scenario.id.includes(model.buyingGroupId));
    const directGroup = directModel ? getBuyingGroup(directModel.buyingGroupId) : undefined;
    const seed = scenario.id.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const group = directGroup ?? scenarioContextGroups[seed % Math.max(1, scenarioContextGroups.length)];
    const market = group?.primaryMarkets.map((id) => getMarket(id)?.name ?? id).slice(0, 2).join(' / ') ?? selectedMarket?.name ?? 'Europe portfolio';
	    return {
	      buyingGroup: group?.name ?? scenarioOwnerName,
	      buyingGroupId: group?.id,
	      market,
	      marketId: group?.primaryMarkets[0] ?? selectedMarket?.id
	    };
	  }

  const scenarioDecisionRows = [
    {
      label: 'Selected case',
      value: selectedPredictiveScenario.name,
      detail: `${selectedPredictiveScenario.atlasScore}/100 score · ${selectedPredictiveScenario.likelihood}% likely`
    },
    {
      label: 'Buyer response',
      value: selectedPredictiveScenario.buyerResponse,
      detail: latestScenarioDebrief ? 'Updated by debrief memory' : 'Predicted from buyer history and current context'
    },
    {
      label: 'Modeled impact',
      value: `${scenarioDeltaLabel(selectedPredictiveScenario.outputs.revenueImpact)} NR / ${scenarioDeltaLabel(selectedPredictiveScenario.outputs.marginImpact)} GM`,
      detail: `${selectedPredictiveScenario.guardrailRisk} · ${selectedPredictiveScenario.relationshipRisk} relationship risk`
    },
    {
      label: 'Recommended adjustment',
      value: selectedPredictiveScenario.recommendedEdit,
      detail: `${selectedPredictiveScenario.evidenceStrength}% evidence strength`
    }
  ];
  scenarioReportParams.set('scenarioName', selectedPredictiveScenario.name);
  scenarioReportParams.set('scenarioLevel', selectedLevel);
  scenarioReportParams.set('atlasScore', String(selectedPredictiveScenario.atlasScore));
  scenarioReportParams.set('likelihood', String(selectedPredictiveScenario.likelihood));
  scenarioReportParams.set('buyerResponse', selectedPredictiveScenario.buyerResponse);
  scenarioReportParams.set('recommendedEdit', selectedPredictiveScenario.recommendedEdit);
  scenarioReportParams.set('evidenceStrength', String(selectedPredictiveScenario.evidenceStrength));
  scenarioReportParams.set('guardrailRisk', selectedPredictiveScenario.guardrailRisk);
  scenarioReportParams.set('relationshipRisk', selectedPredictiveScenario.relationshipRisk);
  scenarioReportParams.set('nrImpact', String(selectedPredictiveScenario.outputs.revenueImpact));
  scenarioReportParams.set('gmImpact', String(selectedPredictiveScenario.outputs.marginImpact));
  scenarioReportParams.set('volumeImpact', String(selectedPredictiveScenario.outputs.volumeImpact));
  scenarioReportParams.set('tradeImpact', String(selectedPredictiveScenario.outputs.tradeSpendImpact));
  scenarioReportParams.set('riskAdjustedValue', String(selectedPredictiveScenario.valueProtected));
  scenarioReportParams.set('skuCount', String(skuRows.length));
  scenarioReportParams.set('customLeverCount', String(customLevers.length));
  scenarioReportParams.set('topRecommendedScenario', topRecommendedScenario.name);
  scenarioReportParams.set('topRecommendedScore', String(topRecommendedScenario.atlasScore));
  scenarioReportParams.set('topRecommendedMemoryAdjustment', latestScenarioDebrief ? '10' : '0');
  scenarioReportParams.set('topRecommendedReason', `${topRecommendedScenario.why} ${topRecommendedScenario.recommendedEdit}`);
  if (latestScenarioDebrief) {
    scenarioReportParams.set('debriefMemory', `${latestScenarioDebrief.predictionImpact} Counter ${latestScenarioDebrief.buyerCounter || 'not entered'}, landed ${latestScenarioDebrief.finalLanded || 'not entered'}.`);
  }
  const scenarioReportHref = `/generated-views?${scenarioReportParams.toString()}`;

  function scenarioReportHrefFor(scenario: ScenarioLabOption) {
    const params = new URLSearchParams(scenarioReportParams.toString());
    params.set('scenarioName', scenario.name);
    params.set('atlasScore', String(scenario.atlasScore));
    params.set('likelihood', String(scenario.likelihood));
    params.set('buyerResponse', scenario.buyerResponse);
    params.set('recommendedEdit', scenario.recommendedEdit);
    params.set('evidenceStrength', String(scenario.evidenceStrength));
    params.set('guardrailRisk', scenario.guardrailRisk);
    params.set('relationshipRisk', scenario.relationshipRisk);
    params.set('nrImpact', String(scenario.outputs.revenueImpact));
    params.set('gmImpact', String(scenario.outputs.marginImpact));
    params.set('volumeImpact', String(scenario.outputs.volumeImpact));
    params.set('tradeImpact', String(scenario.outputs.tradeSpendImpact));
    params.set('riskAdjustedValue', String(scenario.valueProtected));
    return `/generated-views?${params.toString()}`;
  }

  function applyPredictiveScenario(scenarioId: string) {
    const scenario = scenarioOptions.find((item) => item.id === scenarioId);
    if (!scenario) return;
    if (selectedScenarioId === scenario.id) {
      setSelectedScenarioId('');
      return;
    }
    setSelectedScenarioId(scenario.id);
    setInputs(scenario.inputs);
  }

  function editScenarioFromCard(scenarioId: string) {
    const scenario = scenarioOptions.find((item) => item.id === scenarioId);
    if (!scenario) return;
    setSelectedScenarioId(scenario.id);
    setInputs(scenario.inputs);
    setSelectedLevel(scenario.id === 'custom' || scenario.origin === 'manual' ? 'custom' : selectedLevel);
    window.location.href = scenarioEditHref(scenario.id);
  }

  function selectScenarioRow(scenarioId: string) {
    applyPredictiveScenario(scenarioId);
    toggleCompareScenario(scenarioId);
  }

  function saveAdjustedScenarioToTable() {
    const createdAt = new Date().toISOString();
    const manualScenario: ScenarioLabOption = {
      ...predictiveScenario(
        `manual-${Date.now().toString(36)}`,
        `Manual scenario ${savedManualScenarios.length + 1}`,
        `CNO adjusted case using ${inputs.priceIncreasePercent.toFixed(1)}% price ask, ${inputs.expectedRealizationPercent.toFixed(1)}% realization, and ${inputs.buyerAcceptanceProbability.toFixed(0)}% buyer acceptance.`,
        inputs,
        'Saved from the manual scenario workspace for comparison against ATLAS generated scenarios.'
      ),
      createdAt,
      origin: 'manual',
      scenarioStyle: 'Manual adjustment'
    };
    setSavedManualScenarios((current) => [manualScenario, ...current]);
    setSelectedScenarioId(manualScenario.id);
    setCompareScenarioIds((current) => [manualScenario.id, ...current.filter((id) => id !== manualScenario.id)].slice(0, 4));
    setScenarioTypeFilter('all');
    setScenarioLabMode('review');
    setScenarioSaveStatus('Manual scenario added to the scenario table.');
  }

  function saveScenarioToBuyingGroup() {
    if (!attachedBuyingGroup) {
      setScenarioSaveStatus('Select a buying group before saving this scenario.');
      return;
    }
    const now = new Date().toISOString();
    saveStoredGeneratedView({
      artifactType: 'scenario_output',
      audienceMode: 'internal_cno',
      buyingGroupId: attachedBuyingGroup.id,
      confidence: scenarioSource.confidence,
      contentSnapshot: {
        sections: [
          {
            title: 'Scenario inputs',
            body: `Price increase ${inputs.priceIncreasePercent.toFixed(1)}%, expected realization ${inputs.expectedRealizationPercent.toFixed(1)}%, buyer acceptance ${inputs.buyerAcceptanceProbability.toFixed(0)}%, competitor pressure ${inputs.competitorPressureLevel}.`,
            bullets: [
              `Trade spend: ${euros(inputs.tradeSpendChange)}`,
              `Concession: ${euros(inputs.concessionAmount)}`,
              `Volume change: ${inputs.volumeChangePercent.toFixed(1)}%`,
              `Contract length: ${inputs.contractLengthMonths} months`
            ]
          },
          {
            title: 'Pricing corridor and guardrail',
            body: `${corridorBreached ? 'Guardrail review needed' : 'Scenario stays inside corridor'}: recommended ask ${recommendedAskForCorridor.toFixed(1)}%, target ${targetForCorridor.toFixed(1)}%, fallback ${fallbackForCorridor.toFixed(1)}%, red line ${redLineForCorridor.toFixed(1)}%.`,
            bullets: [
              `Buyer ask: ${buyerAskForCorridor.toFixed(1)}%`,
              `Current PepsiCo position: ${currentPositionForCorridor.toFixed(1)}%`,
              `Finance/NRM guardrail source: ${sourceDisplayName(scenarioSource)}`
            ].concat(latestScenarioDebrief ? [
              `Latest debrief: buyer counter ${latestScenarioDebrief.buyerCounter || 'not entered'}, final landed ${latestScenarioDebrief.finalLanded || 'not entered'}`
            ] : [])
          },
          {
            title: 'Predictive buyer response',
            body: selectedPredictiveScenario.buyerResponse,
            bullets: [
              `Selected scenario: ${selectedPredictiveScenario.name}`,
              `ATLAS score: ${selectedPredictiveScenario.atlasScore}/100`,
              `Likelihood to land: ${selectedPredictiveScenario.likelihood}%`,
              `Recommended edit: ${selectedPredictiveScenario.recommendedEdit}`
            ]
          },
          {
            title: 'Modeled impact',
            body: `Risk-adjusted value is ${euros(outputs.riskAdjustedValue)} with ${outputs.riskLevel} risk.`,
            bullets: [
              `Revenue: ${scenarioDeltaLabel(outputs.revenueImpact)} (${scenarioPercentChange(outputs.revenueImpact, scenarioBaselineMetrics.revenue)} from current)`,
              `Margin: ${scenarioDeltaLabel(outputs.marginImpact)} (${scenarioPercentChange(outputs.marginImpact, scenarioBaselineMetrics.margin)} from current)`,
              `Volume: ${scenarioDeltaLabel(outputs.volumeImpact)} (${scenarioPercentChange(outputs.volumeImpact, scenarioBaselineMetrics.volume)} from current)`,
              `Trade spend: ${scenarioDeltaLabel(outputs.tradeSpendImpact)} (${scenarioPercentChange(outputs.tradeSpendImpact, scenarioBaselineMetrics.trade)} from current)`
            ]
          }
        ],
        summary: `${outputs.riskLevel} risk scenario for ${attachedBuyingGroup.name}: revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
        title: `${attachedBuyingGroup.name} scenario model · ${inputs.expectedRealizationPercent.toFixed(1)}% realization`
      },
      createdAt: now,
      id: `scenario-model-${attachedBuyingGroup.id}-${Date.now().toString(36)}`,
      lifecycleState: 'attached',
      marketId: selectedMarketId || attachedBuyingGroup.primaryMarkets[0],
      mode: 'new_draft',
      prompt: scenarioReportPrompt,
      revisionCount: 0,
      savedDestination: 'buyer_profile',
      savedToProfileAt: now,
      sourceDate: scenarioSource.sourceDate,
      sourceDecision: 'Saved from Scenario Lab as buyer-specific pricing corridor and guardrail memory.',
      sourceName: scenarioSource.sourceName,
      summary: `${selectedPredictiveScenario.name}: ${selectedPredictiveScenario.buyerResponse} Revenue ${scenarioDeltaLabel(outputs.revenueImpact)}, margin ${scenarioDeltaLabel(outputs.marginImpact)}, risk-adjusted value ${euros(outputs.riskAdjustedValue)}.`,
      title: `${attachedBuyingGroup.name} ${selectedPredictiveScenario.name.replace(/^.\. /, '')}: ${inputs.expectedRealizationPercent.toFixed(1)}% realization`,
      updatedAt: now
    });
    setScenarioSaveStatus(`Saved to ${attachedBuyingGroup.name} scenario memory.`);
  }

  const mvpScenarioBuyingGroups = [...packet.topExposureBuyingGroups]
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel) || b.financialExposure.marginAtRisk - a.financialExposure.marginAtRisk)
    .slice(0, 4);
	  const railMarkets = [...marketOptions]
	    .sort((a, b) => riskRank(b.pressureLevel) - riskRank(a.pressureLevel) || b.marginAtRisk - a.marginAtRisk)
	    .slice(0, 5);
	  const scenarioTrigger = scenarioAlerts[0];
	  function scenarioDetailHref(scenarioId: string) {
	    const params = new URLSearchParams();
	    if (selectedMarketId) params.set('market', selectedMarketId);
	    if (selectedBuyingGroupId) params.set('buyingGroup', selectedBuyingGroupId);
	    params.set('scenario', scenarioId);
	    return scenarioHrefWithReturn(`/scenario-lab?${params.toString()}`);
	  }
  function scenarioCaseDetailHref(caseId: string, scenarioId?: string) {
    const params = new URLSearchParams();
    if (selectedMarketId) params.set('market', selectedMarketId);
    if (selectedBuyingGroupId) params.set('buyingGroup', selectedBuyingGroupId);
    params.set('case', caseId);
    if (scenarioId) params.set('scenario', scenarioId);
    return scenarioHrefWithReturn(`/scenario-lab?${params.toString()}`);
  }
	  function scenarioEditHref(scenarioId: string) {
	    const params = new URLSearchParams();
	    if (selectedMarketId) params.set('market', selectedMarketId);
	    if (selectedBuyingGroupId) params.set('buyingGroup', selectedBuyingGroupId);
	    params.set('mode', 'create');
	    params.set('scenario', scenarioId);
	    return scenarioHrefWithReturn(`/scenario-lab?${params.toString()}`);
	  }
  function scenarioCreateHref() {
    const params = new URLSearchParams();
    if (selectedMarketId) params.set('market', selectedMarketId);
    if (selectedBuyingGroupId) params.set('buyingGroup', selectedBuyingGroupId);
    params.set('mode', 'create');
    return scenarioHrefWithReturn(`/scenario-lab?${params.toString()}`);
  }
	  const compareParams = new URLSearchParams();
  compareScenarioIds.forEach((id) => compareParams.append('scenario', id));
  if (selectedBuyingGroupId) compareParams.set('buyingGroup', selectedBuyingGroupId);
  if (selectedMarketId) compareParams.set('market', selectedMarketId);
  if (resolvedReturnHref) {
    compareParams.set('returnTo', resolvedReturnHref);
    if (resolvedReturnLabel) compareParams.set('returnLabel', resolvedReturnLabel);
  }
  const compareHref = compareScenarioIds.length >= 2 ? `/scenario-lab/compare?${compareParams.toString()}` : '#';

  function scenarioById(scenarioId: string) {
    return scenarioOptions.find((scenario) => scenario.id === scenarioId);
  }

  function scenarioApproaches(ids: string[], caseId?: string) {
    const seen = new Set<string>();
    const useOnce = (scenario: ScenarioLabOption) => {
      if (seen.has(scenario.id)) return false;
      seen.add(scenario.id);
      return true;
    };
    const baseApproaches = ids
      .map((id) => scenarioById(id))
      .filter((scenario): scenario is ScenarioLabOption => Boolean(scenario))
      .filter(useOnce);
    const customApproaches = caseId
      ? savedManualScenarios.filter((scenario) => scenario.caseId === caseId).filter(useOnce)
      : [];
    return [...baseApproaches, ...customApproaches];
  }

  function eventGroupAt(index: number) {
    return attachedBuyingGroup ?? mvpScenarioBuyingGroups[index] ?? scenarioContextGroups[index] ?? mvpScenarioBuyingGroups[0] ?? scenarioContextGroups[0];
  }

  const primaryEventGroup = eventGroupAt(0);
  const secondaryEventGroup = eventGroupAt(1);
  const tertiaryEventGroup = eventGroupAt(2);
  const fourthEventGroup = eventGroupAt(3);
  const eventMarketName = selectedMarket?.name ?? attachedMarket?.name ?? attachedMarkets[0]?.name ?? getMarket(primaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? 'Europe';
  const scenarioCases: ScenarioCase[] = [
    {
      actionLabel: 'Open modeled approaches',
      approaches: scenarioApproaches(['recommended', 'conservative', 'aggressive', 'buyer-counter'], 'event-buyer-pressure'),
      buyingGroup: primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: primaryEventGroup?.id,
      confidence: 'High' as const,
      createdAt: '2026-07-17T09:10:00.000Z',
      decisionQuestion: 'Should the team hold the price position, trade service value, or plan for the likely counter?',
      id: 'event-buyer-pressure',
      impactLabel: 'Margin exposure',
      impactValue: scenarioDeltaLabel(topRecommendedScenario.outputs.marginImpact),
      market: eventMarketName,
      marketId: primaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '01',
      priority: 'action' as const,
      reaction: 'ATLAS modeled four response paths and recommends the balanced evidence-backed ask before the next buyer counter.',
      recommendedApproachId: 'recommended',
      sourceLabel: 'Buyer ask · Finance guardrail · Prior rounds',
      sources: ['Buyer ask', 'Finance guardrail', 'Prior rounds'],
      status: 'Needs CNO review' as const,
      title: `${primaryEventGroup?.name ?? scenarioOwnerName} price realization pressure`,
      trigger: `${primaryEventGroup?.name ?? scenarioOwnerName} movement changed the expected landing range for the current negotiation.`,
      triggerType: 'Buyer event',
      whyAtlasModeled: 'The trigger can change price realization, fallback logic, buyer acceptance, and the response package the CNO should carry into the room.'
    },
    {
      actionLabel: 'Review market-driven runs',
      approaches: scenarioApproaches(['service-value-tradeoff', 'phased-realization-path', 'promo-envelope-defense', 'finance-guardrail-review'], 'event-market-pressure'),
      buyingGroup: secondaryEventGroup?.name ?? primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: secondaryEventGroup?.id ?? primaryEventGroup?.id,
      confidence: 'Medium-high' as const,
      createdAt: '2026-07-17T09:28:00.000Z',
      decisionQuestion: 'Does the market signal require a pricing move, or should it stay as negotiation evidence?',
      id: 'event-market-pressure',
      impactLabel: 'NR swing tested',
      impactValue: scenarioDeltaLabel(scenarioById('service-value-tradeoff')?.outputs.revenueImpact ?? outputs.revenueImpact),
      market: getMarket(secondaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: secondaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '02',
      priority: 'watch' as const,
      reaction: 'ATLAS tested value, phasing, promo support, and finance review paths to avoid treating the market signal as a generic concession.',
      recommendedApproachId: 'service-value-tradeoff',
      sourceLabel: 'Market signal · Promo exposure · Category mix',
      sources: ['Market signal', 'Promo exposure', 'Category mix'],
      status: 'Monitoring' as const,
      title: 'Market pressure may change the buyer response',
      trigger: 'Cost and private-label pressure increased the chance that buyers challenge price with affordability or volume arguments.',
      triggerType: 'Market signal',
      whyAtlasModeled: 'The signal could change the evidence package, trade envelope, and how strongly PepsiCo should defend the ask.'
    },
    {
      actionLabel: 'Open memory-backed runs',
      approaches: scenarioApproaches(['buyer-counter', 'response-cadence-watch', 'source-proof-only', 'visibility-language-check'], 'event-response-delay'),
      buyingGroup: tertiaryEventGroup?.name ?? primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: tertiaryEventGroup?.id ?? primaryEventGroup?.id,
      confidence: 'Medium' as const,
      createdAt: '2026-07-17T09:46:00.000Z',
      decisionQuestion: 'Should buyer memory change the next-round response or simply stay as room context?',
      id: 'event-history-pattern',
      impactLabel: 'Likely counter',
      impactValue: `${pct(buyerCounterInputs.expectedRealizationPercent)} realization`,
      market: getMarket(tertiaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: tertiaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '03',
      priority: 'reference' as const,
      reaction: 'ATLAS kept buyer-history runs available because timing, proof quality, and visibility language can change the room response.',
      recommendedApproachId: 'buyer-counter',
      sourceLabel: 'Debrief memory · Source proof · Response cadence',
      sources: ['Debrief memory', 'Source proof', 'Response cadence'],
      status: 'Ready to use' as const,
      title: 'Buyer history suggests a counter pattern',
      trigger: 'Prior rounds show the buyer often waits before countering and asks for additional proof before moving from the first position.',
      triggerType: 'History pattern',
      whyAtlasModeled: 'Closed-loop buyer memory can change predicted response, round count, and the evidence the CNO should lead with.'
    },
    {
      actionLabel: 'Open promo scenarios',
      approaches: scenarioApproaches(['promo-envelope-defense', 'conservative', 'buyer-counter'], 'event-trade-spend'),
      buyingGroup: fourthEventGroup?.name ?? primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: fourthEventGroup?.id ?? primaryEventGroup?.id,
      confidence: 'Medium-high' as const,
      createdAt: '2026-07-17T10:02:00.000Z',
      decisionQuestion: 'Should PepsiCo protect price by tightening the promo envelope or prepare a service tradeoff?',
      id: 'event-promo-pressure',
      impactLabel: 'Trade exposure',
      impactValue: scenarioDeltaLabel(scenarioById('promo-envelope-defense')?.outputs.tradeSpendImpact ?? outputs.tradeSpendImpact),
      market: getMarket(fourthEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: fourthEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '04',
      priority: 'action' as const,
      reaction: 'ATLAS modeled promo-envelope defense against conservative and buyer-counter paths before trade support is offered.',
      recommendedApproachId: 'promo-envelope-defense',
      sourceLabel: 'Promo exposure · Buyer ask · Finance guardrail',
      sources: ['Promo exposure', 'Buyer ask', 'Finance guardrail'],
      status: 'Needs CNO review' as const,
      title: `${fourthEventGroup?.name ?? 'Buyer'} promo envelope pressure`,
      trigger: 'Buyer-side promo support request moved above the approved planning range.',
      triggerType: 'Buyer event',
      whyAtlasModeled: 'The ask could turn a pricing discussion into a trade-spend negotiation and weaken the guardrail if accepted too early.'
    },
    {
      actionLabel: 'Review guardrail runs',
      approaches: scenarioApproaches(['finance-guardrail-review', 'aggressive', 'recommended'], 'event-finance-guardrail'),
      buyingGroup: primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: primaryEventGroup?.id,
      confidence: 'High' as const,
      createdAt: '2026-07-17T10:18:00.000Z',
      decisionQuestion: 'Does the current position stay inside Finance guardrails after the latest counter?',
      id: 'event-finance-guardrail',
      impactLabel: 'Guardrail risk',
      impactValue: 'Finance review',
      market: eventMarketName,
      marketId: primaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '05',
      priority: 'watch' as const,
      reaction: 'ATLAS compared finance review, aggressive recovery, and the recommended path to keep escalation visible.',
      recommendedApproachId: 'finance-guardrail-review',
      sourceLabel: 'Finance model · Corridor v3 · Current ask',
      sources: ['Finance model', 'Corridor v3', 'Current ask'],
      status: 'Monitoring' as const,
      title: `${primaryEventGroup?.name ?? scenarioOwnerName} guardrail check`,
      trigger: 'Modeled fallback moved close to the approved floor after the latest concession request.',
      triggerType: 'Buyer event',
      whyAtlasModeled: 'Finance guardrails define where the team should pause, escalate, or replace price concession with value exchange.'
    },
    {
      actionLabel: 'Open market signal runs',
      approaches: scenarioApproaches(['service-value-tradeoff', 'recommended', 'aggressive'], 'event-commodity-signal'),
      buyingGroup: secondaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: secondaryEventGroup?.id,
      confidence: 'Medium' as const,
      createdAt: '2026-07-17T10:31:00.000Z',
      decisionQuestion: 'Should private-label pressure change the evidence package or the actual ask?',
      id: 'event-private-label-pressure',
      impactLabel: 'Price defense',
      impactValue: `${pct(recommendedScenarioInputs.expectedRealizationPercent)} realization`,
      market: getMarket(secondaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: secondaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '06',
      priority: 'watch' as const,
      reaction: 'ATLAS tested whether the market pressure should trigger a value tradeoff or remain negotiation evidence.',
      recommendedApproachId: 'service-value-tradeoff',
      sourceLabel: 'Market signal · Category mix · Buyer profile',
      sources: ['Market signal', 'Category mix', 'Buyer profile'],
      status: 'Monitoring' as const,
      title: 'Private-label pressure affecting price defense',
      trigger: 'Private-label activity increased in a core category tied to the current annual plan.',
      triggerType: 'Market signal',
      whyAtlasModeled: 'Market pressure can change the buyer objection pattern and the evidence the CNO needs ready in the room.'
    },
    {
      actionLabel: 'Open cadence runs',
      approaches: scenarioApproaches(['response-cadence-watch', 'buyer-counter', 'conservative'], 'event-stall-pattern'),
      buyingGroup: tertiaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: tertiaryEventGroup?.id,
      confidence: 'Medium-high' as const,
      createdAt: '2026-07-17T10:44:00.000Z',
      decisionQuestion: 'Is the delayed response a negotiation tactic or a signal to adjust the offer?',
      id: 'event-response-delay',
      impactLabel: 'Round timing',
      impactValue: 'Cadence watch',
      market: getMarket(tertiaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: tertiaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '07',
      priority: 'reference' as const,
      reaction: 'ATLAS modeled response-cadence, likely counter, and conservative paths so the team does not concede because of silence.',
      recommendedApproachId: 'response-cadence-watch',
      sourceLabel: 'Debrief memory · Response cadence · Prior outcomes',
      sources: ['Debrief memory', 'Response cadence', 'Prior outcomes'],
      status: 'Ready to use' as const,
      title: `${tertiaryEventGroup?.name ?? 'Buyer'} response delay pattern`,
      trigger: 'The buyer response window is tracking longer than comparable prior rounds.',
      triggerType: 'History pattern',
      whyAtlasModeled: 'History suggests delay can be a pressure tactic, so the model keeps the team anchored before changing the economics.'
    },
    {
      actionLabel: 'Open source-proof runs',
      approaches: scenarioApproaches(['source-proof-only', 'recommended', 'buyer-counter'], 'event-source-gap'),
      buyingGroup: fourthEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: fourthEventGroup?.id,
      confidence: 'Medium' as const,
      createdAt: '2026-07-17T11:06:00.000Z',
      decisionQuestion: 'Is stronger source proof enough, or does the commercial position need to move?',
      id: 'event-source-proof-gap',
      impactLabel: 'Evidence gap',
      impactValue: 'Proof review',
      market: getMarket(fourthEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: fourthEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '08',
      priority: 'reference' as const,
      reaction: 'ATLAS kept source-proof-only scenarios available to separate evidence readiness from price movement.',
      recommendedApproachId: 'source-proof-only',
      sourceLabel: 'Source trail · Buyer objection · Prior proof',
      sources: ['Source trail', 'Buyer objection', 'Prior proof'],
      status: 'Ready to use' as const,
      title: 'Buyer asked for stronger pricing proof',
      trigger: 'Buyer feedback challenged the proof behind the current price increase instead of the mechanics of the offer.',
      triggerType: 'History pattern',
      whyAtlasModeled: 'The right move may be evidence sequencing, not economic concession, if the buyer is asking for proof rather than different terms.'
    },
    {
      actionLabel: 'Open service tradeoff runs',
      approaches: scenarioApproaches(['service-value-tradeoff', 'phased-realization-path', 'conservative'], 'event-category-mix'),
      buyingGroup: primaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: primaryEventGroup?.id,
      confidence: 'High' as const,
      createdAt: '2026-07-17T11:24:00.000Z',
      decisionQuestion: 'Can service value protect the price ask without expanding trade spend?',
      id: 'event-service-commitment',
      impactLabel: 'Value exchange',
      impactValue: scenarioDeltaLabel(scenarioById('service-value-tradeoff')?.valueProtected ?? topRecommendedScenario.valueProtected),
      market: eventMarketName,
      marketId: primaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '09',
      priority: 'action' as const,
      reaction: 'ATLAS modeled service-value and phased paths because execution commitments may protect the ask better than cash support.',
      recommendedApproachId: 'service-value-tradeoff',
      sourceLabel: 'Buyer KPI · Service history · Finance guardrail',
      sources: ['Buyer KPI', 'Service history', 'Finance guardrail'],
      status: 'Needs CNO review' as const,
      title: `${primaryEventGroup?.name ?? scenarioOwnerName} service-value exchange`,
      trigger: 'Buyer signaled operational support could matter more than additional price concession.',
      triggerType: 'Buyer event',
      whyAtlasModeled: 'A service-value exchange could preserve margin while giving the buyer a credible reason to accept the pricing path.'
    },
    {
      actionLabel: 'Open volume-risk runs',
      approaches: scenarioApproaches(['phased-realization-path', 'buyer-counter', 'aggressive'], 'event-counterprep'),
      buyingGroup: secondaryEventGroup?.name ?? scenarioOwnerName,
      buyingGroupId: secondaryEventGroup?.id,
      confidence: 'Medium-high' as const,
      createdAt: '2026-07-17T11:47:00.000Z',
      decisionQuestion: 'Should the team phase the price move if buyer volume risk increases?',
      id: 'event-volume-risk',
      impactLabel: 'Volume risk',
      impactValue: pct(buyerCounterInputs.volumeChangePercent),
      market: getMarket(secondaryEventGroup?.primaryMarkets[0] ?? '')?.name ?? eventMarketName,
      marketId: secondaryEventGroup?.primaryMarkets[0] ?? selectedMarketId,
      order: '10',
      priority: 'watch' as const,
      reaction: 'ATLAS modeled phased, buyer-counter, and aggressive paths to show where volume risk starts changing the best move.',
      recommendedApproachId: 'phased-realization-path',
      sourceLabel: 'Volume trend · Buyer counter · Market signal',
      sources: ['Volume trend', 'Buyer counter', 'Market signal'],
      status: 'Monitoring' as const,
      title: 'Volume risk could change the price path',
      trigger: 'Latest planning inputs show increased risk that the buyer ties acceptance to volume protection.',
      triggerType: 'Market signal',
      whyAtlasModeled: 'Volume risk changes the tradeoff between immediate realization, phased implementation, and relationship safety.'
    }
  ].filter((event) => event.approaches.length > 0);

  function approachRoleLabel(scenario: ScenarioLabOption) {
    if (scenario.id === 'recommended') return 'Best for PepsiCo';
    if (scenario.id === 'buyer-counter') return 'Likely buyer counter';
    return scenario.scenarioStyle;
  }

  function scenarioStatusReason(scenarioCase: ScenarioCase) {
    if (scenarioCase.status === 'Needs CNO review') return 'Open first because the modeled change can affect the current negotiation position.';
    if (scenarioCase.status === 'Monitoring') return 'Watch this because ATLAS found a signal that may change the next round.';
    return 'Ready to use as reference context if the buyer raises this point.';
  }

  function visibleApproachesForEvent(event: ScenarioCase) {
    return event.approaches.filter((scenario) => {
      if (scenarioTypeFilter === 'all') return true;
      if (scenarioTypeFilter === 'atlas') return scenario.origin === 'atlas';
      if (scenarioTypeFilter === 'manual') return scenario.origin === 'manual';
      return scenario.id === scenarioTypeFilter || scenario.scenarioStyle.toLowerCase().replace(/\s+/g, '-') === scenarioTypeFilter;
    });
  }

  const visibleScenarioCases = scenarioCases
    .map((event) => ({ ...event, approaches: visibleApproachesForEvent(event) }))
    .filter((event) => {
      if (!event.approaches.length) return false;
      if (selectedBuyingGroupId && event.buyingGroupId !== selectedBuyingGroupId && !event.approaches.some((scenario) => scenarioBuyingGroupContext(scenario).buyingGroupId === selectedBuyingGroupId)) return false;
      if (selectedMarketId && event.marketId !== selectedMarketId) return false;
      if (scenarioCaseTriggerFilter !== 'all' && event.triggerType !== scenarioCaseTriggerFilter) return false;
      return true;
    });

  function eventCompareHref(event: ScenarioCase) {
    return scenarioCaseDetailHref(event.id, recommendedApproachForCase(event).id);
  }

  function scenarioCaseBuyingGroups(event: ScenarioCase) {
    const names = [event.buyingGroup];
    if (event.triggerType === 'Market signal') {
      scenarioContextGroups.slice(0, 4).forEach((group) => names.push(group.name));
    }
    return Array.from(new Set(names.filter(Boolean)));
  }

  function scenarioCaseMarkets(event: ScenarioCase) {
    const names = [event.market];
    if (event.triggerType === 'Market signal') {
      scenarioContextGroups.slice(0, 4).forEach((group) => {
        group.primaryMarkets.forEach((marketId) => {
          const market = getMarket(marketId);
          if (market) names.push(market.name);
        });
      });
    }
    return Array.from(new Set(names.filter(Boolean)));
  }

  function ScenarioTableEntityCell({ items, singular, plural }: { items: string[]; singular: string; plural: string }) {
    const label = items.length > 1 ? `${items.length} ${plural}` : items[0] ?? `No ${singular}`;
    const detail = items.join(', ');

    return (
      <span
        className="atlas-scenario-table-entity"
        data-multiple={items.length > 1 ? 'true' : undefined}
        tabIndex={items.length > 1 ? 0 : undefined}
        title={items.length > 1 ? detail : undefined}
      >
        <span>{label}</span>
        {items.length > 1 ? <span className="atlas-scenario-table-tooltip" role="tooltip">{detail}</span> : null}
      </span>
    );
  }

  function recommendedApproachForCase(scenarioCase: ScenarioCase) {
    return scenarioCase.approaches.find((scenario) => scenario.id === scenarioCase.recommendedApproachId) ?? scenarioCase.approaches[0];
  }

  function scenarioCaseForScenarioId(scenarioId?: string) {
    if (!scenarioId) return undefined;
    return scenarioCases.find((scenarioCase) => scenarioCase.approaches.some((scenario) => scenario.id === scenarioId));
  }

  const fullScenarioCase = initialScenarioLabMode !== 'create'
    ? scenarioCases.find((scenarioCase) => scenarioCase.id === initialScenarioCaseId) ?? scenarioCaseForScenarioId(initialScenarioId)
    : undefined;
  const activeFullScenarioId = selectedScenarioId || initialScenarioId;
  const fullViewScenario = fullScenarioCase
    ? fullScenarioCase.approaches.find((scenario) => scenario.id === activeFullScenarioId) ?? recommendedApproachForCase(fullScenarioCase)
    : undefined;

	  function toggleCompareScenario(scenarioId: string) {
	    setCompareScenarioIds((current) => {
	      if (current.includes(scenarioId)) return current.filter((id) => id !== scenarioId);
	      return [...current, scenarioId].slice(-4);
	    });
	  }

  function toggleScenarioEventExpansion(eventId: string) {
    setExpandedScenarioEventIds((current) => (
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    ));
  }

  function toggleScenarioRowExpansion(scenarioId: string) {
    setExpandedScenarioRowIds((current) => (
      current.includes(scenarioId)
        ? current.filter((id) => id !== scenarioId)
        : [...current, scenarioId]
    ));
  }

	  if (fullViewScenario) {
	    const scenario = fullViewScenario;
	    const scenarioCase = fullScenarioCase ?? scenarioCaseForScenarioId(scenario.id);
	    const scenarioContext = scenarioBuyingGroupContext(scenario);
	    const scenarioWorkspace = scenarioContext.buyingGroupId ? buildBuyingGroupWorkspacePacket(scenarioContext.buyingGroupId) : undefined;
	    const scenarioNegotiator = scenarioWorkspace
	      ? buyerNegotiatorProfile(scenarioWorkspace)
	      : {
	          name: `${scenarioContext.buyingGroup} negotiator`,
	          style: 'Buyer behavior'
	        };
	    const attentionReason = scenarioCase?.status ?? scenarioAttentionReason(scenario);
	    const scenarioBasis = scenario.origin === 'manual'
	      ? 'This scenario uses CNO-adjusted assumptions plus current buyer context and saved local inputs.'
	      : scenarioCase
	        ? scenarioCase.whyAtlasModeled
	        : `${scenario.why}${scenarioTrigger ? ` It was refreshed after ATLAS reviewed ${scenarioTrigger.title.toLowerCase()}.` : ''}`;
	    const scenarioFullSummary = `Based on ${scenario.scenarioStyle.toLowerCase()} logic, ATLAS modeled ${pct(scenario.inputs.priceIncreasePercent)} ask / ${pct(scenario.inputs.expectedRealizationPercent)} realization with ${scenarioDeltaLabel(scenario.outputs.revenueImpact)} NR impact and ${scenario.likelihood}% likelihood to land.`;
	    const scenarioCaseTriggerText = scenarioCase?.trigger ?? scenarioBasis;
	    const scenarioCaseModeledText = scenarioCase?.reaction ?? scenarioFullSummary;
	    const scenarioCaseDecisionText = scenarioCase?.decisionQuestion ?? 'Decide whether this is the path to save, adjust, or carry into buyer preparation.';
	    const fullScenarioBackHref = resolvedReturnHref || scenarioHref();
	    const fullScenarioBackLabel = resolvedReturnLabel || 'Scenario Lab';
	    const selectedApproaches = scenarioCase?.approaches ?? [scenario];
	    const recommendedApproach = selectedApproaches.find((approach) => approach.id === scenarioCase?.recommendedApproachId) ?? selectedApproaches[0];
	    const scenarioRecommendedText = recommendedApproach
	      ? `${recommendedApproach.name}: ${recommendedApproach.recommendedEdit}`
	      : 'Use the selected path only after checking buyer response, guardrail risk, and source confidence.';
	    const activeScenarioInputs = fullScenarioDraftInputs ?? scenario.inputs;
	    const activeScenarioOutputs = calculateScenarioOutputs(activeScenarioInputs, baseRevenue);
	    const activeAcceptance = Math.max(1, Math.min(99, Math.round(activeScenarioInputs.buyerAcceptanceProbability)));
	    const activeGuardrailRisk = activeScenarioInputs.expectedRealizationPercent < Math.max(0.4, initialInputs.expectedRealizationPercent - 0.5) || activeScenarioOutputs.marginImpact < -450000
	      ? 'Guardrail breach'
	      : activeScenarioInputs.expectedRealizationPercent < initialInputs.expectedRealizationPercent || activeScenarioOutputs.marginImpact < 0
	        ? 'Watch'
	        : 'Inside corridor';
	    const activeRelationshipRisk = activeScenarioInputs.priceIncreasePercent > initialInputs.priceIncreasePercent + 0.55 || activeScenarioInputs.volumeChangePercent < initialInputs.volumeChangePercent - 0.8
	      ? 'High'
	      : activeScenarioInputs.priceIncreasePercent < initialInputs.priceIncreasePercent - 0.35
	        ? 'Low'
	        : 'Medium';
	    const activeCounterPoint = Math.max(0.5, activeScenarioInputs.expectedRealizationPercent - 0.4).toFixed(1);
	    const activeBuyerResponse = activeGuardrailRisk === 'Guardrail breach' && activeAcceptance < 55
	      ? 'Likely to reject unless proof or the give-get improves.'
	      : activeGuardrailRisk === 'Guardrail breach'
	        ? `Likely to counter hard near ${activeCounterPoint}% unless the value exchange is tightened.`
	        : activeAcceptance >= 70
	          ? `Likely to challenge proof, then land near ${Math.max(0.5, activeScenarioInputs.priceIncreasePercent - 0.3).toFixed(1)}%.`
	          : activeAcceptance >= 55
	            ? `Likely to counter near ${Math.max(0.5, activeScenarioInputs.priceIncreasePercent - 0.5).toFixed(1)}% and ask for support.`
	            : 'Likely to resist and use affordability or competitor pressure as leverage.';
	    const updateFullScenarioDraftInput = <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => {
	      setFullScenarioDraftInputs((current) => ({
	        ...(current ?? scenario.inputs),
	        [key]: value
	      }));
	    };
	    const scenarioDecisionStatusFor = ({
	      guardrailRisk,
	      isRecommended,
	      likelihood,
	      marginImpact,
	      relationshipRisk
	    }: {
	      guardrailRisk: string;
	      isRecommended: boolean;
	      likelihood: number;
	      marginImpact: number;
	      relationshipRisk: string;
	    }) => {
	      if (isRecommended) {
	        return {
	          label: 'Recommended',
	          reason: 'ATLAS selected this as the best balance of margin protection, landing probability, and relationship risk.',
	          tone: 'recommended'
	        };
	      }
	      if (guardrailRisk.toLowerCase().includes('breach') || marginImpact < -450000) {
	        return {
	          label: 'Guardrail watch',
	          reason: 'This path may still be useful, but Finance or margin guardrails need to be checked before it is carried forward.',
	          tone: 'watch'
	        };
	      }
	      if (likelihood < 55 || relationshipRisk.toLowerCase().includes('high')) {
	        return {
	          label: 'Stress case',
	          reason: 'Open this when you need to understand downside exposure or likely buyer pressure.',
	          tone: 'negative'
	        };
	      }
	      if (likelihood < 65) {
	        return {
	          label: 'Needs proof',
	          reason: 'This can work if the team leads with stronger evidence and a clearer value exchange.',
	          tone: 'watch'
	        };
	      }
	      return {
	        label: 'Viable',
	        reason: 'This path is within the modeled range and can be used as an alternative to the recommended move.',
	        tone: 'positive'
	      };
	    };
	    const approachRationale = (approach: ScenarioLabOption, read = scenarioDecisionStatusFor({
	      guardrailRisk: approach.guardrailRisk,
	      isRecommended: approach.id === scenarioCase?.recommendedApproachId,
	      likelihood: approach.likelihood,
	      marginImpact: approach.outputs.marginImpact,
	      relationshipRisk: approach.relationshipRisk
	    })) => {
	      const isRecommended = approach.id === scenarioCase?.recommendedApproachId;
	      if (isRecommended) {
	        return {
	          ...read,
	          text: `Best current path because ${approach.recommendedEdit.charAt(0).toLowerCase()}${approach.recommendedEdit.slice(1)}`
	        };
	      }
	      if (approach.relationshipRisk.toLowerCase().includes('high') || approach.guardrailRisk.toLowerCase().includes('breach')) {
	        return {
	          ...read,
	          text: `Useful as a stress case, but ${approach.buyerResponse.charAt(0).toLowerCase()}${approach.buyerResponse.slice(1)}`
	        };
	      }
	      if (approach.likelihood < 55) {
	        return {
	          ...read,
	          text: `Use to understand downside exposure. ${approach.buyerResponse}`
	        };
	      }
	      return {
	        ...read,
	        text: approach.recommendedEdit
	      };
	    };
	    const activeDecisionStatus = scenarioDecisionStatusFor({
	      guardrailRisk: activeGuardrailRisk,
	      isRecommended: scenario.id === scenarioCase?.recommendedApproachId,
	      likelihood: activeAcceptance,
	      marginImpact: activeScenarioOutputs.marginImpact,
	      relationshipRisk: activeRelationshipRisk
	    });
	    const activeApproachRead = approachRationale({
	      ...scenario,
	      buyerResponse: activeBuyerResponse,
	      guardrailRisk: activeGuardrailRisk,
	      likelihood: activeAcceptance,
	      outputs: activeScenarioOutputs,
	      relationshipRisk: activeRelationshipRisk
	    }, activeDecisionStatus);
	    const activeScenarioUse = scenario.id === scenarioCase?.recommendedApproachId
	      ? 'Use this as the working path unless the buyer opens with a materially lower counter.'
	      : activeDecisionStatus.label === 'Stress case'
	        ? 'Keep this as a pressure test. Do not lead with it unless leadership accepts the relationship risk.'
	        : activeDecisionStatus.label === 'Guardrail watch'
	          ? 'Use this only after Finance checks the floor and the team has a clean escalation story.'
	          : activeDecisionStatus.label === 'Needs proof'
	            ? 'Use this as an alternate path if stronger evidence is ready before the next buyer exchange.'
	            : 'Keep this available as a practical fallback if the recommended path loses momentum.';
	    const activeEvidenceCue = scenario.evidenceStrength < 72
	      ? 'Add one stronger proof point before using this in the room.'
	      : scenario.evidenceStrength < 84
	        ? 'Evidence is usable, but lead with the prior outcome or market signal first.'
	        : 'Evidence is strong enough to support this path; keep the source trail available if challenged.';
	    const activeReadItems = [
	      {
	        label: scenario.id === scenarioCase?.recommendedApproachId ? 'Why ATLAS recommends it' : 'Why this path matters',
	        text: activeApproachRead.text
	      },
	      {
	        label: 'CNO move',
	        text: activeScenarioUse
	      },
	      {
	        label: 'Buyer watch',
	        text: activeBuyerResponse
	      },
	      {
	        label: 'Proof needed',
	        text: activeEvidenceCue
	      }
	    ];
	    const buyerResponseRecommendation = activeAcceptance < 55
	      ? 'Improve the response by lowering the ask pressure or adding a clearer give-get before sharing this path.'
	      : activeRelationshipRisk.toLowerCase().includes('high')
	        ? 'Improve the response by leading with proof and one non-price alternative before the buyer asks for trade support.'
	        : 'Keep the response stronger by tying every concession to volume, execution, or timing commitments.';
	    const savedExtraLeverSummary = () => fullScenarioExtraLevers.map((lever) => {
	      const leverOption = customLeverOptions.find((option) => option.id === lever.name);
	      return `${leverOption?.label ?? lever.name}: ${lever.value || 'not set'}`;
	    });
	    const buildScenarioFromFullDraft = ({
	      basedOnId,
	      createdAt,
	      description,
	      id,
	      name,
	      origin,
	      scenarioStyle,
	      why
	    }: {
	      basedOnId?: string;
	      createdAt: string;
	      description: string;
	      id: string;
	      name: string;
	      origin: ScenarioLabOption['origin'];
	      scenarioStyle: string;
	      why: string;
	    }): ScenarioLabOption => {
	      const savedInputs = fullScenarioDraftInputs ?? scenario.inputs;
	      return {
	        ...predictiveScenario(id, name, description, savedInputs, why),
	        basedOnId,
	        buyerResponse: activeBuyerResponse,
	        caseId: scenarioCase?.id ?? scenario.caseId,
	        createdAt,
	        extraLeverSummary: savedExtraLeverSummary(),
	        guardrailRisk: activeGuardrailRisk,
	        likelihood: activeAcceptance,
	        origin,
	        outputs: activeScenarioOutputs,
	        recommendedEdit: buyerResponseRecommendation,
	        relationshipRisk: activeRelationshipRisk,
	        scenarioStyle
	      };
	    };
	    const finishFullScenarioDraftSave = (status: string) => {
	      setFullScenarioAdjusting(false);
	      setFullScenarioDraftInputs(null);
	      setFullScenarioExtraLevers([]);
	      setScenarioSaveStatus(status);
	    };
	    const saveFullScenarioDraftEdits = () => {
	      const editedScenario = buildScenarioFromFullDraft({
	        basedOnId: scenario.basedOnId,
	        createdAt: scenario.createdAt,
	        description: `Edited CNO scenario using ${pct(activeScenarioInputs.priceIncreasePercent)} ask, ${pct(activeScenarioInputs.expectedRealizationPercent)} expected realization, and ${activeAcceptance.toFixed(0)}% buyer acceptance.`,
	        id: scenario.id,
	        name: scenario.name,
	        origin: scenario.origin,
	        scenarioStyle: scenario.scenarioStyle,
	        why: `Saved edits to ${scenario.name} from the full scenario view.`
	      });
	      setScenarioEditOverrides((current) => ({
	        ...current,
	        [editedScenario.id]: editedScenario
	      }));
	      if (scenario.origin === 'manual') {
	        setSavedManualScenarios((current) => current.map((item) => (
	          item.id === editedScenario.id ? editedScenario : item
	        )));
	      }
	      finishFullScenarioDraftSave('Edits saved to this scenario.');
	    };
	    const saveFullScenarioDraftAsCustom = () => {
	      const savedInputs = fullScenarioDraftInputs ?? scenario.inputs;
	      const savedId = `custom-${scenarioCase?.id ?? scenario.id}-${Date.now().toString(36)}`;
	      const savedScenario = buildScenarioFromFullDraft({
	        basedOnId: scenario.id,
	        createdAt: new Date().toISOString(),
	        description: `Saved CNO adjustment using ${pct(savedInputs.priceIncreasePercent)} ask, ${pct(savedInputs.expectedRealizationPercent)} expected realization, and ${savedInputs.buyerAcceptanceProbability.toFixed(0)}% buyer acceptance.`,
	        id: savedId,
	        name: `Custom ${scenario.name.replace(/^Custom\s+/i, '').replace(/^Custom:\s*/i, '')}`,
	        origin: 'manual',
	        scenarioStyle: 'Custom',
	        why: `Saved from ${scenario.name} after adjusting the levers in the full scenario view.`
	      });
	      setSavedManualScenarios((current) => [savedScenario, ...current.filter((item) => item.id !== savedScenario.id)]);
	      setSelectedScenarioId(savedScenario.id);
	      finishFullScenarioDraftSave('New scenario added to the comparison table.');
	      if (typeof window !== 'undefined') {
	        window.history.replaceState(null, '', scenarioCase ? scenarioCaseDetailHref(scenarioCase.id, savedScenario.id) : scenarioDetailHref(savedScenario.id));
	      }
	    };
	    const customLeverOptions: Array<{
	      control: 'number' | 'select' | 'text';
	      id: string;
	      label: string;
	      max?: number;
	      min?: number;
	      options?: string[];
	      step?: number;
	      suffix?: string;
	    }> = [
	      {
	        control: 'select',
	        id: 'paymentTerms',
	        label: 'Payment terms',
	        options: ['Net 30', 'Net 45', 'Net 60']
	      },
	      {
	        control: 'select',
	        id: 'serviceSupport',
	        label: 'Service support',
	        options: ['Standard', 'Enhanced', 'Priority']
	      },
	      {
	        control: 'number',
	        id: 'promoEvents',
	        label: 'Promo events',
	        max: 8,
	        min: 0,
	        step: 1
	      },
	      {
	        control: 'number',
	        id: 'osaCommitment',
	        label: 'OSA commitment',
	        max: 99,
	        min: 94,
	        step: 0.1,
	        suffix: '%'
	      },
	      {
	        control: 'text',
	        id: 'skuLever',
	        label: 'SKU / pack lever'
	      }
	    ];
	    const activePepsiPosture = strategyPostureForScenario(
	      activeScenarioInputs,
	      scenario.scenarioStyle,
	      activeRelationshipRisk,
	      activeBuyerResponse
	    );
	    const activeBuyerPostureInputs: ScenarioInputs = {
	      ...activeScenarioInputs,
	      buyerAcceptanceProbability: Math.max(35, activeScenarioInputs.buyerAcceptanceProbability - 12),
	      expectedRealizationPercent: Math.max(0, activeScenarioInputs.expectedRealizationPercent - 0.35),
	      tradeSpendChange: activeScenarioInputs.tradeSpendChange * 0.65,
	      volumeChangePercent: Math.min(activeScenarioInputs.volumeChangePercent, activeScenarioInputs.volumeChangePercent - 0.2)
	    };
	    const activeBuyerPosture = strategyPostureForScenario(
	      activeBuyerPostureInputs,
	      'Buyer counter',
	      activeRelationshipRisk,
	      activeBuyerResponse
	    );
	    const negotiatorCadence = 'cadence' in scenarioNegotiator
	      ? scenarioNegotiator.cadence
	      : 'Usually counters below target first, then asks for trade support or phasing.';
	    const negotiatorWatch = 'watch' in scenarioNegotiator
	      ? scenarioNegotiator.watch
	      : 'Watch for affordability, competitor comparison, and trade support requests.';
	    const livePredictionRead = activeAcceptance < 55
	      ? 'Current levers are likely to trigger a harder counter.'
	      : activeAcceptance >= 68 && !activeRelationshipRisk.toLowerCase().includes('high')
	        ? 'Current levers are likely to keep the buyer engaged.'
	        : 'Current levers are workable, but the buyer will test the give-get.';
	    const buyerLikelyMove = activeAcceptance < 55
	      ? `${scenarioNegotiator.name} is likely to reject the first move and counter below ${pct(activeScenarioInputs.expectedRealizationPercent)}.`
	      : activeRelationshipRisk.toLowerCase().includes('high')
	        ? `${scenarioNegotiator.name} is likely to challenge the evidence before accepting the value exchange.`
	        : `${scenarioNegotiator.name} is likely to test the give-get, then stay near ${pct(activeScenarioInputs.expectedRealizationPercent)} if the commitments are clear.`;
	    const buyerResponseEvidence = [
	      {
	        label: 'Buyer memory',
	        text: negotiatorCadence
	      },
	      {
	        label: 'Lever read',
	        text: `${livePredictionRead} ${pct(activeScenarioInputs.priceIncreasePercent)} ask, ${pct(activeScenarioInputs.expectedRealizationPercent)} realization, ${euros(activeScenarioInputs.tradeSpendChange)} support.`
	      },
	      {
	        label: 'Posture read',
	        text: `${scenarioNegotiator.name} profiles near ${activeBuyerPosture.clockLabel} ${activeBuyerPosture.posture}; this path lands at ${activePepsiPosture.clockLabel} ${activePepsiPosture.posture}.`
	      }
	    ];
	    const buyerResponseActions = [
	      buyerResponseRecommendation,
	      activeEvidenceCue
	    ];
	    const buyerResponseWatchItems = [
	      negotiatorWatch,
	      scenario.id === 'buyer-counter'
	        ? 'Counter stays below the modeled floor unless PepsiCo trades volume or service commitments.'
	        : `Counter pressure clusters around ${pct(Math.max(0, activeScenarioInputs.expectedRealizationPercent - 0.5))}-${pct(activeScenarioInputs.expectedRealizationPercent)} realization.`
	    ];
	    const setupLevers = [
	      {
	        fill: Math.min(100, Math.max(0, (activeScenarioInputs.priceIncreasePercent / 6) * 100)),
	        inputKey: 'priceIncreasePercent' as const,
	        label: 'Price ask',
	        max: 6,
	        min: 0,
	        postureImpact: activeScenarioInputs.priceIncreasePercent >= 4
	          ? 'Pushes posture harder'
	          : 'Keeps ask controlled',
	        range: '0% - 6%',
	        step: 0.1,
	        value: pct(activeScenarioInputs.priceIncreasePercent)
	      },
	      {
	        fill: Math.min(100, Math.max(0, (activeScenarioInputs.expectedRealizationPercent / 5) * 100)),
	        inputKey: 'expectedRealizationPercent' as const,
	        label: 'Expected realization',
	        max: 5,
	        min: 0,
	        postureImpact: activeScenarioInputs.expectedRealizationPercent >= activeScenarioInputs.priceIncreasePercent - 0.25
	          ? 'Supports win-win'
	          : 'Creates concession gap',
	        range: '0% - 5%',
	        step: 0.1,
	        value: pct(activeScenarioInputs.expectedRealizationPercent)
	      },
	      {
	        fill: Math.min(100, Math.max(12, (Math.abs(activeScenarioInputs.tradeSpendChange) / 750000) * 100)),
	        inputKey: 'tradeSpendChange' as const,
	        label: 'Trade support',
	        max: 750000,
	        min: -750000,
	        postureImpact: activeScenarioInputs.tradeSpendChange > 150000
	          ? 'Needs buyer give-back'
	          : 'Protects the floor',
	        range: 'Low - high',
	        step: 25000,
	        value: euros(activeScenarioInputs.tradeSpendChange)
	      },
	      {
	        fill: Math.min(100, Math.max(0, 50 + (activeScenarioInputs.volumeChangePercent * 18))),
	        inputKey: 'volumeChangePercent' as const,
	        label: 'Volume movement',
	        max: 3,
	        min: -3,
	        postureImpact: activeScenarioInputs.volumeChangePercent >= 0
	          ? 'Adds shared value'
	          : 'Raises buyer risk',
	        range: '-3% - +3%',
	        step: 0.1,
	        value: pct(activeScenarioInputs.volumeChangePercent)
	      },
	      {
	        fill: activeScenarioInputs.buyerAcceptanceProbability,
	        inputKey: 'buyerAcceptanceProbability' as const,
	        label: 'Buyer acceptance',
	        max: 100,
	        min: 0,
	        postureImpact: activeScenarioInputs.buyerAcceptanceProbability >= 65
	          ? 'Buyer can engage'
	          : 'Expect harder counter',
	        range: 'Low - high',
	        step: 1,
	        value: `${activeScenarioInputs.buyerAcceptanceProbability.toFixed(0)}%`
	      }
	    ];
	    const visibleExtraLevers = fullScenarioExtraLevers.map((lever) => {
	      const selectedLeverOption = customLeverOptions.find((option) => option.id === lever.name) ?? customLeverOptions[0];
	      const numericValue = Number(lever.value);
	      const hasNumericRange = selectedLeverOption.control === 'number' && Number.isFinite(numericValue);
	      const min = selectedLeverOption.min ?? 0;
	      const max = selectedLeverOption.max ?? 100;
	      const fill = hasNumericRange && max > min
	        ? Math.min(100, Math.max(0, ((numericValue - min) / (max - min)) * 100))
	        : 55;
	      return {
	        fill,
	        id: lever.id,
	        label: selectedLeverOption.label,
	        postureImpact: selectedLeverOption.id === 'paymentTerms'
	          ? 'Changes concession timing'
	          : selectedLeverOption.id === 'serviceSupport'
	            ? 'Adds non-price value'
	            : selectedLeverOption.id === 'promoEvents'
	              ? 'Changes trade pressure'
	              : selectedLeverOption.id === 'osaCommitment'
	                ? 'Adds service proof'
	                : 'Adds custom context',
	        range: selectedLeverOption.control === 'number'
	          ? `${min}${selectedLeverOption.suffix ?? ''} - ${max}${selectedLeverOption.suffix ?? ''}`
	          : 'Custom lever',
	        value: `${lever.value || 'Not set'}${selectedLeverOption.control === 'number' && selectedLeverOption.suffix && lever.value ? selectedLeverOption.suffix : ''}`
	      };
	    });
	    return (
	      <section className="atlas-scenario-full-view" aria-label={`${scenarioCase?.title ?? scenario.name} full scenario view`}>
	        <header className="atlas-scenario-full-header">
	          <a href={fullScenarioBackHref}>Back to {fullScenarioBackLabel}</a>
	          <div>
	            <span>{attentionReason} · {scenarioContext.buyingGroup} · {scenarioContext.market}</span>
	            <h1>{scenarioCase?.title ?? scenario.name.replace(/^[A-C]\.\s*/, '')}</h1>
	            {!scenarioCase ? <p>{scenarioFullSummary}</p> : null}
	          </div>
	        </header>

	        <section className="atlas-scenario-brief-strip" aria-label="Scenario brief">
	          <article>
	            <span>Trigger</span>
	            <p>{scenarioCaseTriggerText}</p>
	          </article>
	          <article>
	            <span>Modeled</span>
	            <p>{scenarioCaseModeledText}</p>
	          </article>
	          <article>
	            <span>Decision</span>
	            <p>{scenarioCaseDecisionText}</p>
	          </article>
	          <article className="atlas-scenario-brief-recommendation">
	            <span>ATLAS recommends</span>
	            <p>{scenarioRecommendedText}</p>
	          </article>
	        </section>

	        <section className="atlas-scenario-approach-board" aria-label="Compare modeled approaches">
	          <header>
	            <span>Compare scenarios</span>
	          </header>
	          <div className="atlas-scenario-approach-compare-layout">
	            <div className="atlas-scenario-approach-grid-table" role="table" aria-label="Modeled approach comparison">
	              <div className="atlas-scenario-approach-grid-head" role="row">
	                <span role="columnheader">Scenario</span>
	                <span role="columnheader">Margin</span>
	                <span role="columnheader">Land</span>
	                <span role="columnheader">Decision</span>
	              </div>
	              {selectedApproaches.map((approach) => {
	                const isActive = approach.id === scenario.id;
	                const isRecommended = approach.id === scenarioCase?.recommendedApproachId;
	                const rowInputs = isActive ? activeScenarioInputs : approach.inputs;
	                const rowOutputs = isActive ? activeScenarioOutputs : approach.outputs;
	                const rowLikelihood = isActive ? activeAcceptance : approach.likelihood;
	                const rowRelationshipRisk = isActive ? activeRelationshipRisk : approach.relationshipRisk;
	                const rowGuardrailRisk = isActive ? activeGuardrailRisk : approach.guardrailRisk;
	                const rowDecisionStatus = scenarioDecisionStatusFor({
	                  guardrailRisk: rowGuardrailRisk,
	                  isRecommended,
	                  likelihood: rowLikelihood,
	                  marginImpact: rowOutputs.marginImpact,
	                  relationshipRisk: rowRelationshipRisk
	                });
	                const approachHref = scenarioCase ? scenarioCaseDetailHref(scenarioCase.id, approach.id) : scenarioDetailHref(approach.id);
	                const selectApproach = () => {
	                  setSelectedScenarioId(approach.id);
	                  setFullScenarioAdjusting(false);
	                  setFullScenarioDraftInputs(null);
	                  setFullScenarioExtraLevers([]);
	                  if (typeof window !== 'undefined') {
	                    window.history.replaceState(null, '', approachHref);
	                  }
	                };
	                return (
	                  <button
	                    aria-current={isActive ? 'true' : undefined}
	                    className={[
	                      'atlas-scenario-approach-grid-row',
	                      isActive ? 'active' : '',
	                      isRecommended ? 'recommended' : ''
	                    ].filter(Boolean).join(' ')}
	                    key={approach.id}
	                    onClick={selectApproach}
	                    type="button"
	                  >
	                    <span className="atlas-scenario-approach-title-cell">
	                      <strong>{approach.name}</strong>
	                      <span>{approachRoleLabel(approach)}</span>
	                      <small>{pct(rowInputs.priceIncreasePercent)} ask · {pct(rowInputs.expectedRealizationPercent)} realization · {scenarioDeltaLabel(rowOutputs.revenueImpact)} NR</small>
	                    </span>
	                    <span className={rowOutputs.marginImpact >= 0 ? 'is-positive' : 'is-negative'}>{scenarioDeltaLabel(rowOutputs.marginImpact)}</span>
	                    <span className={rowLikelihood >= 70 ? 'is-positive' : rowLikelihood >= 60 ? 'is-watch' : 'is-negative'}>{rowLikelihood}%</span>
	                    <span
	                      className={`atlas-scenario-status-badge is-status-${rowDecisionStatus.tone}`}
	                      title={rowDecisionStatus.reason}
	                    >
	                      {rowDecisionStatus.label}
	                    </span>
	                  </button>
	                );
	              })}
	            </div>
	            <aside className="atlas-scenario-approach-reasons" aria-label="Selected scenario read">
	              <span>Selected read</span>
	              <section className="active" key={scenario.id}>
	                <header>
	                  <em className={activeApproachRead.label === 'Recommended' ? 'recommended' : undefined} title={activeApproachRead.reason}>{activeApproachRead.label}</em>
	                </header>
	                <h3>{scenario.name}</h3>
	                <div className="atlas-scenario-approach-read-stack">
	                  {activeReadItems.map((item) => (
	                    <article key={item.label}>
	                      <span>{item.label}</span>
	                      <p>{item.text}</p>
	                    </article>
	                  ))}
	                </div>
	              </section>
	            </aside>
	          </div>
	        </section>

	        <section className="atlas-scenario-workbench-detail" aria-label="Scenario setup">
	          <aside className="atlas-scenario-lever-panel">
	            <div>
	              <span>Scenario setup</span>
	              <h2>{scenario.name}</h2>
	              <p>{scenarioContext.buyingGroup} · {scenarioCase?.trigger ?? scenarioBasis}</p>
	            </div>
	            <div className="atlas-scenario-lever-posture-read" aria-label="Live posture read from scenario levers">
	              <article>
	                <span>Scenario posture</span>
	                <strong>{activePepsiPosture.clockLabel} {activePepsiPosture.posture}</strong>
	              </article>
	              <article>
	                <span>Buyer likely posture</span>
	                <strong>{activeBuyerPosture.clockLabel} {activeBuyerPosture.posture}</strong>
	              </article>
	              <article>
	                <span>Live prediction</span>
	                <strong>{livePredictionRead}</strong>
	              </article>
	            </div>
	            <div className="atlas-scenario-lever-list">
	              {setupLevers.map((lever) => (
	                <div className="atlas-scenario-lever-row" key={lever.label}>
	                  <div>
	                    <span>{lever.label}</span>
	                    <strong>{lever.value}</strong>
	                  </div>
	                  {fullScenarioAdjusting ? (
	                    <input
	                      aria-label={lever.label}
	                      className="atlas-scenario-lever-slider"
	                      max={lever.max}
	                      min={lever.min}
	                      onChange={(event) => updateFullScenarioDraftInput(lever.inputKey, Number(event.currentTarget.value))}
	                      step={lever.step}
	                      type="range"
	                      value={activeScenarioInputs[lever.inputKey]}
	                    />
	                  ) : (
	                    <div className="atlas-scenario-lever-bar" aria-hidden="true">
	                      <i style={{ width: `${lever.fill}%` }} />
	                    </div>
	                  )}
	                  <small>{lever.range}</small>
	                  <em>{lever.postureImpact}</em>
	                </div>
	              ))}
	              {visibleExtraLevers.map((lever) => (
	                <div className="atlas-scenario-lever-row custom" key={lever.id}>
	                  <div>
	                    <span>{lever.label}</span>
	                    <strong>{lever.value}</strong>
	                  </div>
	                  <div className="atlas-scenario-lever-bar" aria-hidden="true">
	                    <i style={{ width: `${lever.fill}%` }} />
	                  </div>
	                  <small>{lever.range}</small>
	                  <em>{lever.postureImpact}</em>
	                </div>
	              ))}
	            </div>
	            {fullScenarioAdjusting ? (
	              <section className="atlas-scenario-inline-adjustments" aria-label="Adjust scenario levers">
	                <div className="atlas-scenario-extra-levers">
	                  <header>
	                    <span>Additional levers</span>
	                    <button
	                      onClick={() => setFullScenarioExtraLevers((current) => [
	                        ...current,
	                        { id: `lever-${Date.now()}`, name: 'paymentTerms', value: 'Net 45' }
	                      ])}
	                      type="button"
	                    >
	                      Add lever
	                    </button>
	                  </header>
	                  {fullScenarioExtraLevers.length ? (
	                    <div className="atlas-scenario-extra-lever-list">
	                      {fullScenarioExtraLevers.map((lever) => {
	                        const selectedLeverOption = customLeverOptions.find((option) => option.id === lever.name) ?? customLeverOptions[0];
	                        const numericValue = Number.isFinite(Number(lever.value))
	                          ? Number(lever.value)
	                          : selectedLeverOption.min ?? 0;
	                        const updateCustomLever = (value: string) => {
	                          setFullScenarioExtraLevers((current) => current.map((item) => (
	                            item.id === lever.id ? { ...item, value } : item
	                          )));
	                        };
	                        return (
	                          <div className="atlas-scenario-extra-lever-row" key={lever.id}>
	                            <select
	                              aria-label="Lever type"
	                              onChange={(event) => {
	                                const nextOption = customLeverOptions.find((option) => option.id === event.currentTarget.value) ?? customLeverOptions[0];
	                                const nextValue = nextOption.control === 'select'
	                                  ? nextOption.options?.[0] ?? ''
	                                  : nextOption.control === 'number'
	                                    ? String(nextOption.min ?? 0)
	                                    : '';
	                                setFullScenarioExtraLevers((current) => current.map((item) => (
	                                  item.id === lever.id ? { ...item, name: nextOption.id, value: nextValue } : item
	                                )));
	                              }}
	                              value={selectedLeverOption.id}
	                            >
	                              {customLeverOptions.map((option) => (
	                                <option key={option.id} value={option.id}>{option.label}</option>
	                              ))}
	                            </select>
	                            {selectedLeverOption.control === 'select' ? (
	                              <select
	                                aria-label={`${selectedLeverOption.label} value`}
	                                onChange={(event) => updateCustomLever(event.currentTarget.value)}
	                                value={lever.value || selectedLeverOption.options?.[0] || ''}
	                              >
	                                {(selectedLeverOption.options ?? []).map((option) => (
	                                  <option key={option} value={option}>{option}</option>
	                                ))}
	                              </select>
	                            ) : selectedLeverOption.control === 'number' ? (
	                              <div className="atlas-scenario-custom-slider">
	                                <input
	                                  aria-label={`${selectedLeverOption.label} value`}
	                                  max={selectedLeverOption.max}
	                                  min={selectedLeverOption.min}
	                                  onChange={(event) => updateCustomLever(event.currentTarget.value)}
	                                  step={selectedLeverOption.step}
	                                  type="range"
	                                  value={numericValue}
	                                />
	                                <strong>{numericValue}{selectedLeverOption.suffix ?? ''}</strong>
	                              </div>
	                            ) : (
	                              <input
	                                aria-label={`${selectedLeverOption.label} value`}
	                                onChange={(event) => updateCustomLever(event.currentTarget.value)}
	                                placeholder="Add detail"
	                                type="text"
	                                value={lever.value}
	                              />
	                            )}
	                          </div>
	                        );
	                      })}
	                    </div>
	                  ) : null}
	                </div>
	              </section>
	            ) : null}
	            {fullScenarioAdjusting ? (
	              <div className="atlas-scenario-save-actions" aria-label="Save scenario edits">
	                <button
	                  className="atlas-scenario-panel-action"
	                  onClick={saveFullScenarioDraftEdits}
	                  type="button"
	                >
	                  Save edits
	                </button>
	                <button
	                  className="atlas-scenario-panel-action secondary"
	                  onClick={saveFullScenarioDraftAsCustom}
	                  type="button"
	                >
	                  Save as new scenario
	                </button>
	              </div>
	            ) : (
	              <button
	                className="atlas-scenario-panel-action"
	                onClick={() => {
	                  setFullScenarioAdjusting(true);
	                  setFullScenarioDraftInputs((current) => current ?? scenario.inputs);
	                }}
	                type="button"
	              >
	                Adjust levers
	              </button>
	            )}
	            {scenarioSaveStatus ? <span className="atlas-scenario-save-status">{scenarioSaveStatus}</span> : null}
	          </aside>
	        </section>

	        <section className="atlas-scenario-posture-row" aria-label="Strategy posture">
	          <StrategyPostureClock
	            buyerResponse={activeBuyerResponse}
	            buyerNegotiator={{
	              name: scenarioNegotiator.name,
	              style: scenarioNegotiator.style
	            }}
	            compact
	            comparisonOptions={selectedApproaches}
	            inputs={activeScenarioInputs}
	            relationshipRisk={activeRelationshipRisk}
	            selectedOptionId={scenario.id}
	            scenarioStyle={scenario.scenarioStyle}
	          />
	        </section>

	        <section className="atlas-scenario-buyer-response-row" aria-label="ATLAS predicted buyer response">
	          <section className="atlas-scenario-buyer-response-card atlas-scenario-buyer-response-card--closed-loop">
	            <header>
	              <span>ATLAS predicted buyer response</span>
	              <em>{activeAcceptance.toFixed(0)}% response likelihood</em>
	            </header>
	            <p className="atlas-scenario-buyer-response-lead">{buyerLikelyMove}</p>
	            <div className="atlas-buyer-response-intelligence" aria-label="Buyer response intelligence">
	              <article className="atlas-buyer-response-intelligence-card atlas-buyer-response-intelligence-card--wide">
	                <span>Why ATLAS thinks this</span>
	                <div>
	                  {buyerResponseEvidence.map((item) => (
	                    <p key={item.label}><strong>{item.label}</strong>{item.text}</p>
	                  ))}
	                </div>
	              </article>
	              <article className="atlas-buyer-response-intelligence-card">
	                <span>CNO move</span>
	                <div>
	                  {buyerResponseActions.map((item) => (
	                    <p key={item}>{item}</p>
	                  ))}
	                </div>
	              </article>
	              <article className="atlas-buyer-response-intelligence-card">
	                <span>Watch for</span>
	                <div>
	                  {buyerResponseWatchItems.map((item) => (
	                    <p key={item}>{item}</p>
	                  ))}
	                </div>
	              </article>
	            </div>
	          </section>
	        </section>

	        <nav className="atlas-scenario-full-actions-row" aria-label="Scenario actions">
	          <a href={scenarioReportHrefFor(scenario)}>Download report</a>
	          {scenarioContext.buyingGroupId ? (
	            <a href={`/buying-groups/${scenarioContext.buyingGroupId}?view=current`}>Save to buying group</a>
	          ) : null}
	        </nav>

	        <section className="atlas-scenario-source-row" aria-label="Scenario source trail">
	          <h2>Source trail</h2>
	          <p>{scenarioCase ? `${scenarioCase.sources.join(', ')} support this scenario case.` : 'Buyer history, current scenario inputs, market signals, and Finance guardrails support this scenario.'}</p>
	          <SourceTrustMini source={scenarioSource} />
	        </section>
	      </section>
	    );
	  }

	  return (
	    <section className="atlas-scenario-modeler" aria-label="Scenario Lab intelligent modeler">
	      <header className="atlas-scenario-modeler-head">
	        <div>
	          <h1>{scenarioLabMode === 'create' ? 'Create scenario' : 'Scenario Lab'}</h1>
	          <p>
	            {scenarioLabMode === 'create'
	              ? 'Adjust the primary levers, test the impact, and save the new scenario back into the review table.'
	              : 'Review modeled cases. Open a scenario for the numbers, approaches, and evidence.'}
	          </p>
	        </div>
	        <div className="atlas-scenario-header-actions">
	          {scenarioLabMode === 'create' ? (
	            <a href={scenarioHrefWithReturn(scenarioHref())}>Back to scenario review</a>
	          ) : (
	            <a href={scenarioCreateHref()}>Create new scenario</a>
	          )}
	        </div>
	      </header>

		      {scenarioLabMode === 'review' ? <section className="atlas-scenario-overview" aria-label="Modeled scenario cases">
		        <div className="atlas-scenario-table-toolbar">
		          <div className="atlas-scenario-index-summary">
		            <span>{visibleScenarioCases.length} scenario cases</span>
		          </div>
		          <div className="atlas-scenario-table-filters atlas-scenario-table-filters-visible" aria-label="Scenario case filters">
		            <label>
		              <span>Scenario type</span>
		              <select value={scenarioTypeFilter} onChange={(event) => setScenarioTypeFilter(event.currentTarget.value)}>
		                <option value="all">All scenarios</option>
		                <option value="atlas">ATLAS generated</option>
		                <option value="manual">Manual / adjusted</option>
		                <option value="recommended">Recommended</option>
		                <option value="conservative">Conservative</option>
		                <option value="aggressive">Aggressive</option>
		                <option value="buyer-counter">Buyer counter</option>
		                <option value="custom">Custom working</option>
		              </select>
		            </label>
		            <label>
		              <span>Trigger type</span>
		              <select value={scenarioCaseTriggerFilter} onChange={(event) => setScenarioCaseTriggerFilter(event.currentTarget.value)}>
		                <option value="all">All triggers</option>
		                <option value="Buyer event">Buyer event</option>
		                <option value="Market signal">Market signal</option>
		                <option value="History pattern">History pattern</option>
		              </select>
		            </label>
		            <label>
		              <span>Buying group</span>
		              <select
		                value={selectedBuyingGroupId}
		                onChange={(event) => {
		                  window.location.href = scenarioHref({ buyer: event.currentTarget.value, market: selectedMarketId });
		                }}
		              >
		                <option value="">All buying groups</option>
		                {mvpScenarioBuyingGroups.map((group) => (
		                  <option value={group.id} key={group.id}>{group.name}</option>
		                ))}
		              </select>
		            </label>
		            <label>
		              <span>Market</span>
		              <select
		                value={selectedMarketId}
		                onChange={(event) => {
		                  window.location.href = scenarioHref({ buyer: selectedBuyingGroupId, market: event.currentTarget.value });
		                }}
		              >
		                <option value="">All markets</option>
		                {railMarkets.map((market) => (
		                  <option value={market.id} key={market.id}>{market.name}</option>
		                ))}
		              </select>
		            </label>
		          </div>
		        </div>

		        <div className="atlas-scenario-table-shell">
		          <table className="atlas-scenario-case-table">
		            <thead>
		              <tr>
		                <th>Scenario</th>
		                <th>Status</th>
		                <th>Scenario type</th>
		                <th>Created</th>
		                <th>Buying group</th>
		                <th>Market</th>
		              </tr>
		            </thead>
		            <tbody>
		              {visibleScenarioCases.map((scenarioCase) => {
		                const recommendedApproach = recommendedApproachForCase(scenarioCase);
		                const buyingGroups = scenarioCaseBuyingGroups(scenarioCase);
		                const markets = scenarioCaseMarkets(scenarioCase);
		                const scenarioCaseHref = scenarioCaseDetailHref(scenarioCase.id, recommendedApproach.id);
		                return (
		                  <tr
		                    className={`priority-${scenarioCase.priority}`}
		                    key={scenarioCase.id}
		                    onClick={() => { window.location.href = scenarioCaseHref; }}
		                    onKeyDown={(event) => {
		                      if (event.key === 'Enter' || event.key === ' ') {
		                        event.preventDefault();
		                        window.location.href = scenarioCaseHref;
		                      }
		                    }}
		                    role="link"
		                    tabIndex={0}
		                  >
		                    <td>
		                      <div className="atlas-scenario-table-title">
		                        <span>{scenarioCase.title}</span>
		                      </div>
		                    </td>
		                    <td>
		                      <span
		                        className="atlas-scenario-table-impact-level"
		                        data-reason={scenarioStatusReason(scenarioCase)}
		                        data-status={scenarioCase.status}
		                        title={scenarioStatusReason(scenarioCase)}
		                      >
		                        {scenarioCase.status}
		                      </span>
		                    </td>
		                    <td>
		                      <div className="atlas-scenario-table-type">
		                        <span>{recommendedApproach.origin === 'atlas' ? 'ATLAS generated' : 'Manual'}</span>
		                      </div>
		                    </td>
		                    <td><time dateTime={scenarioCase.createdAt}>{formatAtlasDate(scenarioCase.createdAt, { includeYear: true })}</time></td>
		                    <td><ScenarioTableEntityCell items={buyingGroups} singular="buying group" plural="buying groups" /></td>
		                    <td><ScenarioTableEntityCell items={markets} singular="market" plural="markets" /></td>
		                  </tr>
		                );
		              })}
		            </tbody>
		          </table>
		          {!visibleScenarioCases.length ? (
		            <article className="atlas-scenario-empty-state">
		              <h2>No scenario cases match these filters.</h2>
		              <p>Clear a filter or create a new scenario to model another buying group, market signal, or buyer response.</p>
		            </article>
		          ) : null}
		          {scenarioSaveStatus ? <span className="atlas-scenario-save-status">{scenarioSaveStatus}</span> : null}
		        </div>
		      </section> : null}

      {scenarioLabMode === 'create' ? <section className="atlas-scenario-lever-workbench atlas-scenario-modeler-levers" aria-label="Scenario lever controls">
        <header>
          <div>
            <span>Manual scenario</span>
            <h2>Change the primary levers and save the adjusted scenario back to the table.</h2>
          </div>
          <div className="atlas-scenario-manual-actions">
            <label>
              <span>Competitor pressure</span>
              <select value={inputs.competitorPressureLevel} onChange={(event) => updateInput('competitorPressureLevel', event.target.value as ScenarioInputs['competitorPressureLevel'])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <button type="button" onClick={saveAdjustedScenarioToTable}>Save adjusted scenario to table</button>
          </div>
        </header>
        <div className="atlas-scenario-delta-strip" aria-label="Difference from ATLAS prediction">
          {scenarioMetricCards.map((metric) => (
            <article className={metric.delta < 0 ? 'negative' : metric.delta > 0 ? 'positive' : ''} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{scenarioDeltaLabel(metric.delta)}</strong>
              <em>{scenarioPercentChange(metric.delta, metric.value)} from current</em>
            </article>
          ))}
        </div>
        <StrategyPostureClock
          buyerResponse={outputs.recommendation}
          inputs={inputs}
          relationshipRisk={outputs.riskLevel}
          scenarioStyle={selectedLevel === 'custom' ? 'Custom working' : selectedLevel.replaceAll('_', ' ')}
        />
        <div className="atlas-scenario-lever-grid">
          {visibleScenarioControls.map(({ key, label, max, min, step }) => (
            <label className="atlas-scenario-input" key={key}>
              <span>{label}</span>
              <strong>{formatScenarioInputValue(key, Number(inputs[key]))}</strong>
              <input type="range" min={min} max={max} step={step} value={Number(inputs[key])} onChange={(event) => updateInput(key, Number(event.target.value) as ScenarioInputs[typeof key])} onInput={(event) => updateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])} />
              <small><span>{formatScenarioInputValue(key, min)}</span><span>{formatScenarioInputValue(key, max)}</span></small>
            </label>
          ))}
        </div>
      </section> : null}

      {scenarioLabMode === 'create' ? <details className="atlas-scenario-advanced-workbench">
          <summary>Advanced modeling: levels, SKU drill-in, custom levers, and debrief memory</summary>
          <div className="atlas-scenario-level-buttons">
            {scenarioLevels.map((level) => (
              <button className={selectedLevel === level.id ? 'active' : ''} key={level.id} onClick={() => selectScenarioLevel(level.id)} type="button">
                <span>{level.label}</span>
                <small>{level.note}</small>
              </button>
            ))}
          </div>
          <div className="atlas-scenario-lever-grid">
            {advancedScenarioControls.map(({ key, label, max, min, step }) => (
              <label className="atlas-scenario-input" key={key}>
                <span>{label}</span>
                <strong>{formatScenarioInputValue(key, Number(inputs[key]))}</strong>
                <input type="range" min={min} max={max} step={step} value={Number(inputs[key])} onChange={(event) => updateInput(key, Number(event.target.value) as ScenarioInputs[typeof key])} onInput={(event) => updateInput(key, Number(event.currentTarget.value) as ScenarioInputs[typeof key])} />
                <small><span>{formatScenarioInputValue(key, min)}</span><span>{formatScenarioInputValue(key, max)}</span></small>
              </label>
            ))}
          </div>
          <section className="atlas-scenario-detail-table atlas-standalone-scenario-detail-table">
            <header><h4>Optional SKU / pack drill-in</h4><button type="button" onClick={addSkuRow}>Add SKU</button></header>
            <table>
              <thead><tr><th>SKU / pack</th><th>Price move</th><th>Volume risk</th><th>GM rate</th><th>Buyer sensitivity</th><th>Action</th></tr></thead>
              <tbody>
                {skuRows.map((row) => (
                  <tr key={row.id}>
                    <td><input value={row.sku} onChange={(event) => updateSkuRow(row.id, 'sku', event.currentTarget.value)} /></td>
                    <td><input type="number" step="0.1" value={row.priceMove} onChange={(event) => updateSkuRow(row.id, 'priceMove', Number(event.currentTarget.value))} />%</td>
                    <td><input type="number" step="0.1" value={row.volumeRisk} onChange={(event) => updateSkuRow(row.id, 'volumeRisk', Number(event.currentTarget.value))} />%</td>
                    <td><input type="number" step="0.1" value={row.margin} onChange={(event) => updateSkuRow(row.id, 'margin', Number(event.currentTarget.value))} />%</td>
                    <td>
                      <select value={row.sensitivity} onChange={(event) => updateSkuRow(row.id, 'sensitivity', event.currentTarget.value)}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Needs review</option>
                      </select>
                    </td>
                    <td><button type="button" onClick={() => removeSkuRow(row.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="atlas-scenario-detail-table atlas-standalone-scenario-detail-table">
            <header><h4>Custom scenario levers</h4><button type="button" onClick={addCustomLever}>Add lever</button></header>
            <table>
              <thead><tr><th>Lever</th><th>Value</th><th>Impact</th><th>Weight</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {customLevers.map((row) => (
                  <tr key={row.id}>
                    <td><input value={row.name} onChange={(event) => updateCustomLever(row.id, 'name', event.currentTarget.value)} /></td>
                    <td><input value={row.value} onChange={(event) => updateCustomLever(row.id, 'value', event.currentTarget.value)} /></td>
                    <td><input value={row.impact} onChange={(event) => updateCustomLever(row.id, 'impact', event.currentTarget.value)} /></td>
                    <td><input type="number" min="0" max="10" value={row.weight} onChange={(event) => updateCustomLever(row.id, 'weight', Number(event.currentTarget.value))} /></td>
                    <td>
                      <select value={row.status} onChange={(event) => updateCustomLever(row.id, 'status', event.currentTarget.value)}>
                        <option>Assumption</option>
                        <option>User-added</option>
                        <option>Needs review</option>
                        <option>Validated</option>
                      </select>
                    </td>
                    <td><button type="button" onClick={() => removeCustomLever(row.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="atlas-scenario-debrief-loop" aria-label="Debrief updates scenario prediction">
            <header>
              <div>
                <span>Debrief memory</span>
                <h3>Capture what happened so the next model is smarter.</h3>
              </div>
              {latestScenarioDebrief ? <strong>Prediction updated</strong> : <strong>Not yet captured</strong>}
            </header>
            <div className="atlas-scenario-debrief-grid">
              <div className="atlas-scenario-debrief-form">
                <textarea value={scenarioDebriefText} onChange={(event) => setScenarioDebriefText(event.currentTarget.value)} placeholder="What happened in the room? Add buyer ask, objections, concessions, and outcome." />
                <div>
                  <label><span>Buyer counter</span><input value={scenarioDebriefBuyerCounter} onChange={(event) => setScenarioDebriefBuyerCounter(event.currentTarget.value)} placeholder="ex: 2.1%" /></label>
                  <label><span>Final landed</span><input value={scenarioDebriefFinalLanded} onChange={(event) => setScenarioDebriefFinalLanded(event.currentTarget.value)} placeholder="ex: 2.6%" /></label>
                  <label>
                    <span>Behavior pattern</span>
                    <select value={scenarioDebriefBehavior} onChange={(event) => setScenarioDebriefBehavior(event.currentTarget.value)}>
                      <option>Asked for trade support before accepting price</option>
                      <option>Delayed decision until Finance evidence was shown</option>
                      <option>Challenged volume risk and category pressure</option>
                      <option>Accepted price after prior-year outcome proof</option>
                    </select>
                  </label>
                  <label><span>Attachment note</span><input value={scenarioDebriefAttachments} onChange={(event) => setScenarioDebriefAttachments(event.currentTarget.value)} placeholder="ex: room notes, signed CMA" /></label>
                </div>
                <input value={scenarioDebriefNextCycle} onChange={(event) => setScenarioDebriefNextCycle(event.currentTarget.value)} placeholder="Next-cycle learning, ex: lead with prior-year concession evidence" />
                <button type="button" onClick={saveScenarioDebrief}>Save debrief to memory</button>
              </div>
              <aside>
                {latestScenarioDebrief ? (
                  <>
                    <span>{new Date(latestScenarioDebrief.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <strong>{latestScenarioDebrief.predictionImpact}</strong>
                    <p>Counter: {latestScenarioDebrief.buyerCounter || 'not entered'} / Landed: {latestScenarioDebrief.finalLanded || 'not entered'}</p>
                  </>
                ) : (
                  <>
                    <span>Closed loop</span>
                    <strong>Debriefs update buyer-counter predictions and report evidence.</strong>
                    <p>Use this after a round to capture what changed and what should influence the next scenario.</p>
                  </>
                )}
                {scenarioDebriefStatus ? <em>{scenarioDebriefStatus}</em> : null}
              </aside>
            </div>
          </section>
      </details> : null}
    </section>
  );
}

function ScenarioCompareView({
  buyingGroupId,
  initialView,
  marketId,
  returnLabel,
  returnTo
}: {
  buyingGroupId?: string;
  initialView?: string;
  marketId?: string;
  returnLabel?: string;
  returnTo?: string;
}) {
  const attachedBuyingGroup = buyingGroupId ? getBuyingGroup(buyingGroupId) : undefined;
  const requestedMarket = marketId ? getMarket(marketId) : undefined;
  const selectedMarket = requestedMarket && (!attachedBuyingGroup || attachedBuyingGroup.primaryMarkets.includes(requestedMarket.id))
    ? requestedMarket
    : requestedMarket;
  const initialInputs = useMemo(() => attachedBuyingGroup ? scenarioInputsForBuyingGroup(attachedBuyingGroup) : scenarioInputsForMarket(selectedMarket), [attachedBuyingGroup, selectedMarket]);
  const baseRevenue = attachedBuyingGroup?.financialExposure.revenueUnderNegotiation ?? selectedMarket?.revenueUnderNegotiation ?? 22000000;
  const scenarioSource = attachedBuyingGroup?.source
    ?? selectedMarket?.source
    ?? packet.documents.find((document) => document.id === packet.scenarioModels[0]?.sourceIds[0])?.source
    ?? packet.markets[0].source;
  const contextLabel = attachedBuyingGroup
    ? `${attachedBuyingGroup.name}${selectedMarket ? ` / ${selectedMarket.name}` : ''}`
    : selectedMarket
      ? `${selectedMarket.name} market`
      : 'Europe portfolio';
  const scenarioDefinitions = useMemo(() => {
    const conservative: ScenarioInputs = {
      ...initialInputs,
      buyerAcceptanceProbability: Math.min(95, initialInputs.buyerAcceptanceProbability + 10),
      concessionAmount: Math.round(initialInputs.concessionAmount * 1.08),
      expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.25),
      priceIncreasePercent: Math.max(0.7, initialInputs.priceIncreasePercent - 0.3),
      tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.1),
      volumeChangePercent: Math.min(1.5, initialInputs.volumeChangePercent + 0.35)
    };
    const buyerCounter: ScenarioInputs = {
      ...initialInputs,
      buyerAcceptanceProbability: Math.max(25, initialInputs.buyerAcceptanceProbability - 16),
      concessionAmount: Math.round(initialInputs.concessionAmount * 1.22),
      expectedRealizationPercent: Math.max(0.5, initialInputs.expectedRealizationPercent - 0.55),
      priceIncreasePercent: Math.max(initialInputs.expectedRealizationPercent, initialInputs.priceIncreasePercent - 0.35),
      tradeSpendChange: Math.round(initialInputs.tradeSpendChange * 1.18),
      volumeChangePercent: initialInputs.volumeChangePercent - 0.8
    };
    const aggressive: ScenarioInputs = {
      ...initialInputs,
      buyerAcceptanceProbability: Math.max(25, initialInputs.buyerAcceptanceProbability - 12),
      expectedRealizationPercent: initialInputs.expectedRealizationPercent + 0.25,
      priceIncreasePercent: initialInputs.priceIncreasePercent + 0.45,
      tradeSpendChange: Math.max(0, Math.round(initialInputs.tradeSpendChange * 0.92)),
      volumeChangePercent: initialInputs.volumeChangePercent - 0.55
    };
    return [
      {
        id: 'recommended',
        inputs: initialInputs,
        name: 'Recommended',
        note: 'ATLAS default based on current buyer history, market pressure, and finance guardrails.'
      },
      {
        id: 'conservative',
        inputs: conservative,
        name: 'Conservative',
        note: 'Protects landing probability with a smaller price move and controlled support.'
      },
      {
        id: 'buyer-counter',
        inputs: buyerCounter,
        name: 'Buyer counter',
        note: 'Models the buyer pushing back with lower realization and more trade support.'
      },
      {
        id: 'aggressive',
        inputs: aggressive,
        name: 'Aggressive',
        note: 'Tests a stronger ask with higher relationship and volume risk.'
      },
      {
        id: 'custom',
        inputs: initialInputs,
        name: 'Custom',
        note: 'Editable working scenario for CNO assumptions.'
      }
    ];
  }, [initialInputs]);
  const requestedIds = (initialView ?? '').split(',').map((item) => item.trim()).filter(Boolean);
  const initialIds = requestedIds.length >= 2 ? requestedIds : ['recommended', 'buyer-counter'];
  const [compareScenarios, setCompareScenarios] = useState(() => {
    const selected = initialIds
      .map((id) => scenarioDefinitions.find((scenario) => scenario.id === id))
      .filter((scenario): scenario is typeof scenarioDefinitions[number] => Boolean(scenario));
    return (selected.length >= 2 ? selected : scenarioDefinitions.slice(0, 2)).map((scenario) => ({ ...scenario, inputs: { ...scenario.inputs } }));
  });
  const compareBackParams = new URLSearchParams();
  if (attachedBuyingGroup) compareBackParams.set('buyingGroup', attachedBuyingGroup.id);
  if (selectedMarket) compareBackParams.set('market', selectedMarket.id);
  const compareBackHref = `/scenario-lab${compareBackParams.toString() ? `?${compareBackParams.toString()}` : ''}`;
  const resolvedReturnHref = normalizeAtlasReturnHref(returnTo);
  const resolvedReturnLabel = normalizeAtlasReturnLabel(returnLabel);
  const resolvedCompareBackHref = resolvedReturnHref || compareBackHref;
  const resolvedCompareBackLabel = resolvedReturnLabel || 'Scenario Lab';

  function updateCompareInput(scenarioId: string, key: keyof ScenarioInputs, value: number) {
    setCompareScenarios((current) => current.map((scenario) => scenario.id === scenarioId
      ? { ...scenario, inputs: { ...scenario.inputs, [key]: value } }
      : scenario
    ));
  }

  function addCompareScenario(scenarioId: string) {
    const definition = scenarioDefinitions.find((scenario) => scenario.id === scenarioId);
    if (!definition) return;
    setCompareScenarios((current) => {
      if (current.some((scenario) => scenario.id === definition.id)) return current;
      return [...current, { ...definition, inputs: { ...definition.inputs } }].slice(0, 4);
    });
  }

  function removeCompareScenario(scenarioId: string) {
    setCompareScenarios((current) => current.length <= 2 ? current : current.filter((scenario) => scenario.id !== scenarioId));
  }

  function compareDeltaLabel(value: number) {
    if (value === 0) return 'No change';
    return `${value > 0 ? '+' : ''}${euros(value)}`;
  }

  function compareInputValue(key: keyof ScenarioInputs, value: number) {
    if (key === 'buyerAcceptanceProbability' || key.includes('Percent')) return `${value.toFixed(key === 'buyerAcceptanceProbability' ? 0 : 1)}%`;
    if (key === 'contractLengthMonths') return `${value.toFixed(0)} mo`;
    return euros(value);
  }

  function compareGuardrail(inputs: ScenarioInputs, outputs: ReturnType<typeof calculateScenarioOutputs>) {
    if (inputs.expectedRealizationPercent < Math.max(0.4, initialInputs.expectedRealizationPercent - 0.5) || outputs.marginImpact < -450000) return 'Guardrail breach';
    if (inputs.expectedRealizationPercent < initialInputs.expectedRealizationPercent || outputs.marginImpact < 0) return 'Watch';
    return 'Inside corridor';
  }

  function compareBuyerResponse(inputs: ScenarioInputs, guardrail: string) {
    if (guardrail === 'Guardrail breach') return 'Likely to reject unless evidence or tradeoff changes.';
    if (inputs.buyerAcceptanceProbability >= 70) return `Likely to challenge proof, then land near ${Math.max(0.5, inputs.priceIncreasePercent - 0.3).toFixed(1)}%.`;
    if (inputs.buyerAcceptanceProbability >= 55) return `Likely to counter near ${Math.max(0.5, inputs.priceIncreasePercent - 0.5).toFixed(1)}% and ask for support.`;
    return 'Likely to resist and use affordability or competitor pressure as leverage.';
  }

  const compareRows = compareScenarios.map((scenario) => {
    const outputs = calculateScenarioOutputs(scenario.inputs, baseRevenue);
    const guardrail = compareGuardrail(scenario.inputs, outputs);
    return {
      ...scenario,
      buyerResponse: compareBuyerResponse(scenario.inputs, guardrail),
      guardrail,
      outputs
    };
  });
  const bestScenario = [...compareRows].sort((a, b) => b.outputs.riskAdjustedValue - a.outputs.riskAdjustedValue)[0];
  const availableToAdd = scenarioDefinitions.filter((definition) => !compareScenarios.some((scenario) => scenario.id === definition.id));

  return (
    <section className="atlas-scenario-compare-workspace" aria-label="Scenario comparison workspace">
      <header className="atlas-scenario-compare-head">
        <a href={resolvedCompareBackHref}>Back to {resolvedCompareBackLabel}</a>
        <span>{contextLabel}</span>
        <h1>Compare scenarios</h1>
        <p>Edit the levers inside each scenario and compare how the buyer response, NR, GM, trade spend, volume risk, and guardrails change.</p>
      </header>

      <section className="atlas-scenario-compare-summary" aria-label="Comparison summary">
        <header>
          <div>
            <span>Best current read</span>
            <h2>{bestScenario?.name ?? 'Scenario'} protects the most risk-adjusted value.</h2>
          </div>
          <label>
            <span>Add scenario</span>
            <select value="" onChange={(event) => addCompareScenario(event.currentTarget.value)}>
              <option value="">Choose scenario</option>
              {availableToAdd.map((scenario) => (
                <option value={scenario.id} key={scenario.id}>{scenario.name}</option>
              ))}
            </select>
          </label>
        </header>
        <div className="atlas-scenario-compare-table">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Likelihood</th>
                <th>NR</th>
                <th>GM</th>
                <th>Trade spend</th>
                <th>Volume risk</th>
                <th>Guardrail</th>
                <th>Buyer response</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((scenario) => (
                <tr key={scenario.id}>
                  <td>{scenario.name}</td>
                  <td>{scenario.inputs.buyerAcceptanceProbability.toFixed(0)}%</td>
                  <td>{compareDeltaLabel(scenario.outputs.revenueImpact)}</td>
                  <td>{compareDeltaLabel(scenario.outputs.marginImpact)}</td>
                  <td>{compareDeltaLabel(scenario.outputs.tradeSpendImpact)}</td>
                  <td>{compareDeltaLabel(scenario.outputs.volumeImpact)}</td>
                  <td><span className={`atlas-scenario-guardrail ${scenario.guardrail.toLowerCase().replaceAll(' ', '-')}`}>{scenario.guardrail}</span></td>
                  <td>{scenario.buyerResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="atlas-scenario-compare-columns" aria-label="Editable scenario columns">
        {compareRows.map((scenario) => (
          <article key={scenario.id}>
            <header>
              <div>
                <span>{scenario.guardrail}</span>
                <h2>{scenario.name}</h2>
                <p>{scenario.note}</p>
              </div>
              <button disabled={compareScenarios.length <= 2} onClick={() => removeCompareScenario(scenario.id)} type="button">Remove</button>
            </header>
            <div className="atlas-scenario-compare-metrics">
              <div><span>NR</span><strong>{compareDeltaLabel(scenario.outputs.revenueImpact)}</strong></div>
              <div><span>GM</span><strong>{compareDeltaLabel(scenario.outputs.marginImpact)}</strong></div>
              <div><span>Value</span><strong>{euros(scenario.outputs.riskAdjustedValue)}</strong></div>
            </div>
            <StrategyPostureClock
              buyerResponse={scenario.buyerResponse}
              compact
              inputs={scenario.inputs}
              relationshipRisk={scenario.guardrail === 'Guardrail breach' ? 'High' : scenario.inputs.buyerAcceptanceProbability < 60 ? 'Medium' : 'Low'}
              scenarioStyle={scenario.name}
            />
            <div className="atlas-scenario-compare-levers">
              {([
                ['priceIncreasePercent', 'Price ask %', 0, Math.max(6, scenario.inputs.priceIncreasePercent + 1), 0.1],
                ['expectedRealizationPercent', 'Expected realization %', 0, Math.max(5, scenario.inputs.priceIncreasePercent + 1), 0.1],
                ['tradeSpendChange', 'Trade spend EUR', 0, Math.max(1000000, scenario.inputs.tradeSpendChange * 1.5), 25000],
                ['volumeChangePercent', 'Volume risk %', -5, 3, 0.1],
                ['buyerAcceptanceProbability', 'Buyer acceptance', 0, 100, 1]
              ] as Array<[keyof ScenarioInputs, string, number, number, number]>).map(([key, label, min, max, step]) => (
                <label key={key}>
                  <span>{label}</span>
                  <strong>{compareInputValue(key, Number(scenario.inputs[key]))}</strong>
                  <input
                    max={max}
                    min={min}
                    onChange={(event) => updateCompareInput(scenario.id, key, Number(event.currentTarget.value))}
                    step={step}
                    type="range"
                    value={Number(scenario.inputs[key])}
                  />
                </label>
              ))}
            </div>
            <footer>
              <span>Buyer response</span>
              <p>{scenario.buyerResponse}</p>
            </footer>
          </article>
        ))}
      </section>

      <SourceTrustMini source={scenarioSource} />
    </section>
  );
}

function sourceDecisionForDocument(document: DocumentArtifact) {
  if (document.status === 'approved' || document.status === 'ready') {
    return document.reusable ? 'Use as approved source' : 'Use as supporting context';
  }
  if (document.status === 'stale') return 'Review before reuse';
  if (document.status === 'superseded') return 'Open replacement source';
  if (document.status === 'missing') return 'Request source';
  return 'Keep as draft input';
}

function MemoryDecisionPanel({
  documents,
  events,
  title = 'Source decisions'
}: {
  documents: DocumentArtifact[];
  events: TimelineEvent[];
  title?: string;
}) {
  const reusable = documents.filter((document) => document.reusable && (document.status === 'approved' || document.status === 'ready'));
  const sourceWatchouts = documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const generated = documents.filter((document) => document.source.sourceType === 'ai_generated' || document.documentType === 'generated_report' || document.documentType === 'live_debrief');
  const topWatchout = sourceWatchouts[0] ?? documents.find((document) => document.status !== 'approved') ?? documents[0];
  const latestEvent = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const latestBuyerId = latestEvent?.buyingGroupIds[0] ?? topWatchout?.buyingGroupId;

  const cards = [
    {
      action: reusable[0] ? 'Open source' : 'Review library',
      href: reusable[0] ? hrefForDocumentArtifact(reusable[0]) : '/intelligence',
      label: 'Approved sources',
      source: reusable[0]?.source,
      title: `${reusable.length} reusable`,
      value: reusable[0]?.title ?? 'No approved source selected'
    },
    {
      action: topWatchout ? 'Resolve source' : 'Open documents',
      href: topWatchout ? hrefForDocumentArtifact(topWatchout) : '/intelligence',
      label: 'Source watchout',
      source: topWatchout?.source,
      tone: sourceWatchouts.length ? 'watch' : 'good',
      title: sourceWatchouts.length ? `${sourceWatchouts.length} need review` : 'No open source gaps',
      value: topWatchout ? sourceDecisionForDocument(topWatchout) : 'All sources ready'
    },
    {
      action: latestBuyerId ? 'Use in buyer scenario' : 'Open timeline',
      href: latestBuyerId ? `/buying-groups/${latestBuyerId}?view=strategy` : '/intelligence',
      label: 'Latest memory',
      source: latestEvent?.source,
      title: latestEvent?.title ?? 'No memory event',
      value: latestEvent ? compactFinancialImpact({
        margin: latestEvent.financialImpact?.marginImpact,
        revenue: latestEvent.financialImpact?.revenueImpact,
        trade: latestEvent.financialImpact?.tradeSpendImpact
      }) : 'No modeled impact'
    },
    {
      action: generated[0] ? 'Open latest brief' : 'Create scenario brief',
      href: generated[0] ? hrefForDocumentArtifact(generated[0]) : '/generated-views?prompt=Create%20source-backed%20CNO%20readout&mode=draft&editable=1',
      label: 'Scenario briefs',
      source: generated[0]?.source,
      title: `${generated.length} stored`,
      value: generated[0]?.title ?? 'Create only after a scenario is selected'
    }
  ];

  return (
    <section className="atlas-source-decision-panel" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <span>{documents.length} documents / {events.length} memory events</span>
      </header>
      <div>
        {cards.map((card) => (
          <a className={`atlas-source-decision-card ${card.tone ?? ''}`} href={card.href} key={`${card.label}-${card.title}`}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.value}</p>
            {card.source ? <SourceTrustMini source={card.source} /> : null}
            <em>{card.action} <ArrowRight size={13} /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

function TimelineDecisionPanel({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const buyerLinked = sorted.filter((event) => event.buyingGroupIds.length);
  const debriefs = sorted.filter((event) => event.eventType === 'debrief_created');
  const scenarios = sorted.filter((event) => event.eventType === 'scenario_modeled');
  const sourceWatchouts = sorted.filter((event) => event.status === 'stale' || event.status === 'needs_validation' || event.status === 'missing');
  const firstBuyer = buyerLinked[0]?.buyingGroupIds[0];

  const rows = [
    {
      href: firstBuyer ? `/buying-groups/${firstBuyer}?view=strategy` : '/buying-groups',
      label: 'Buyer memory',
      metric: String(buyerLinked.length),
      title: buyerLinked[0]?.title ?? 'Open buyer memory',
      source: buyerLinked[0]?.source
    },
    {
      href: debriefs[0]?.buyingGroupIds[0] ? `/buying-groups/${debriefs[0].buyingGroupIds[0]}?view=strategy` : '/intelligence',
      label: 'Debriefs',
      metric: String(debriefs.length),
      title: debriefs[0]?.title ?? 'No debrief event selected',
      source: debriefs[0]?.source
    },
    {
      href: scenarios[0]?.buyingGroupIds[0] ? `/buying-groups/${scenarios[0].buyingGroupIds[0]}?view=strategy` : '/scenario-lab',
      label: 'Scenario memory',
      metric: String(scenarios.length),
      title: scenarios[0]?.title ?? 'No scenario event selected',
      source: scenarios[0]?.source
    },
    {
      href: sourceWatchouts[0]?.buyingGroupIds[0] ? `/buying-groups/${sourceWatchouts[0].buyingGroupIds[0]}?view=strategy` : '/intelligence',
      label: 'Source watchouts',
      metric: String(sourceWatchouts.length),
      title: sourceWatchouts[0]?.title ?? 'No open watchouts',
      source: sourceWatchouts[0]?.source
    }
  ];

  return (
    <section className="atlas-memory-decision-strip" aria-label="Timeline memory decision read">
      {rows.map((row) => (
        <a href={row.href} key={row.label} {...generatedOutputLinkProps(row.href)}>
          <span>{row.label}</span>
          <strong>{row.metric}</strong>
          <p>{row.title}</p>
          {row.source ? <SourceTrustMini source={row.source} /> : null}
        </a>
      ))}
    </section>
  );
}

function DocumentsView({ initialPrompt }: { initialPrompt?: string }) {
  const staleOrMissing = packet.documents.filter((document) => document.status === 'stale' || document.status === 'needs_validation' || document.status === 'missing');
  const reusable = packet.documents.filter((document) => document.reusable && document.status === 'approved');
  const generated = packet.documents.filter((document) => document.source.sourceType === 'ai_generated' || document.documentType === 'generated_report' || document.documentType === 'live_debrief');

  return (
    <>
      <IntentBrief
        eyebrow="Documents"
        title={`${staleOrMissing.length} source watchouts before official outputs.`}
        body={`${reusable.length} approved reusable sources / ${generated.length} generated or live artifacts stored.`}
        action="Retrieve approved sources first. Create only when the source does not exist."
        metrics={[
          { label: 'Approved reusable', value: String(reusable.length), tone: 'good' },
          { label: 'Source review', value: String(staleOrMissing.length), tone: 'watch' },
          { label: 'Generated artifacts', value: String(generated.length) }
        ]}
      />
      <MemoryDecisionPanel documents={packet.documents} events={packet.latestTimelineEvents} />
      <section className="atlas-hub-section">
        <SectionTitle title="Document library" />
        <DocumentLibrary documents={packet.documents} />
      </section>
    </>
  );
}

function TimelineView({ initialPrompt }: { initialPrompt?: string }) {
  const debriefEvents = packet.latestTimelineEvents.filter((event) => event.eventType === 'debrief_created');
  const modeledEvents = packet.latestTimelineEvents.filter((event) => event.eventType === 'scenario_modeled');
  const validationEvents = packet.latestTimelineEvents.filter((event) => event.status === 'needs_validation' || event.eventType === 'validation_completed');

  return (
    <>
      <IntentBrief
        eyebrow="Timeline"
        title={`${debriefEvents.length} debriefs and ${modeledEvents.length} modeled events changed buyer memory.`}
        body={`${validationEvents.length} memory items need a source/status check before official reuse.`}
        action="Open the affected buying group when an event changes the current read."
        metrics={[
          { label: 'Recent debriefs', value: String(debriefEvents.length) },
          { label: 'Modeled events', value: String(modeledEvents.length) },
          { label: 'Validation watchouts', value: String(validationEvents.length), tone: 'watch' }
        ]}
      />
      <TimelineDecisionPanel events={packet.latestTimelineEvents} />
      <section className="atlas-hub-section">
        <SectionTitle title="Source-of-truth event memory" />
        <TimelineFeed events={packet.latestTimelineEvents} />
      </section>
    </>
  );
}

function SignalsView({ initialPrompt }: { initialPrompt?: string }) {
  const topSignal = packet.signals[0];
  return (
    <>
      <IntentBrief
        title={`${euros(topSignal.estimatedMarginImpact ?? 0)} signal impact across ${new Set(packet.signals.flatMap((signal) => signal.affectedBuyingGroups)).size} buyers.`}
        body=""
        action={topSignal.recommendedAction}
        metrics={[
          { label: 'Top signal impact', value: euros(topSignal.estimatedMarginImpact ?? 0), tone: 'watch' },
          { label: 'Affected markets', value: String(new Set(packet.signals.flatMap((signal) => signal.affectedMarkets)).size) },
          { label: 'Affected buyers', value: String(new Set(packet.signals.flatMap((signal) => signal.affectedBuyingGroups)).size) }
        ]}
      />
      <ActiveAlertsPanel
        alerts={packet.signals.map(signalToAlert)}
        eyebrow="Signal alerts"
        title="External changes and their possible negotiation effect."
      />
      <SignalActionBoard signals={packet.signals} />
    </>
  );
}

function CompetitorsView({ initialPrompt }: { initialPrompt?: string }) {
  const topMove = packet.competitorMoves[0];
  return (
    <>
      <IntentBrief
        title={`${euros(topMove.estimatedMarginImpact ?? 0)} competitor pressure across ${new Set(packet.competitorMoves.flatMap((move) => move.affectedBuyingGroups)).size} buyers.`}
        body=""
        action={topMove.recommendedAction}
        metrics={[
          { label: 'Top margin implication', value: euros(topMove.estimatedMarginImpact ?? 0), tone: 'watch' },
          { label: 'Competitor moves', value: String(packet.competitorMoves.length) },
          { label: 'Affected buyers', value: String(new Set(packet.competitorMoves.flatMap((move) => move.affectedBuyingGroups)).size) }
        ]}
      />
      <ActiveAlertsPanel
        alerts={packet.competitorMoves.map(competitorToAlert)}
        eyebrow="Competitor alerts"
        title="Competitor moves that could change buyer leverage."
      />
      <CompetitorActionBoard moves={packet.competitorMoves} />
    </>
  );
}

type SourceDatabaseRow = {
  id: string;
  recordType: string;
  recordName: string;
  affectedMarkets: string;
  affectedBuyingGroups: string;
  financialImpact: string;
  source: SourceMeta;
  recordHref: string;
};

function marketNames(ids: string[]) {
  if (!ids.length) return 'Europe';
  return ids.map((id) => getMarket(id)?.name ?? id).join(', ');
}

function buyingGroupNames(ids: string[]) {
  if (!ids.length) return 'All buying groups';
  return ids.map((id) => getBuyingGroup(id)?.name ?? id).join(', ');
}

function compactFinancialImpact(input: { gap?: number; margin?: number; revenue?: number; trade?: number; volume?: number }) {
  const items = [
    input.revenue !== undefined ? `Revenue ${euros(input.revenue)}` : null,
    input.margin !== undefined ? `Margin ${euros(input.margin)}` : null,
    input.volume !== undefined ? `Volume ${euros(input.volume)}` : null,
    input.trade !== undefined ? `Trade ${euros(input.trade)}` : null,
    input.gap !== undefined ? `Gap ${euros(input.gap)}` : null
  ].filter((item): item is string => Boolean(item));
  return items.length ? items.join(' / ') : 'No financial impact modeled';
}

function buildSourceDatabaseRows(): SourceDatabaseRow[] {
  const marketRows = packet.markets.map((market): SourceDatabaseRow => ({
    id: `market-${market.id}`,
    recordType: 'Market',
    recordName: market.name,
    affectedMarkets: market.name,
    affectedBuyingGroups: buyingGroupNames(market.activeBuyingGroups),
    financialImpact: compactFinancialImpact({
      gap: market.gapToPlan,
      margin: market.marginAtRisk,
      revenue: market.revenueUnderNegotiation,
      trade: market.tradeSpendExposure,
      volume: market.volumeExposure
    }),
    source: market.source,
    recordHref: `/markets/${market.id}`
  }));
  const buyingGroupRows = packet.buyingGroups.map((group): SourceDatabaseRow => ({
    id: `buyer-${group.id}`,
    recordType: 'Buying group',
    recordName: group.name,
    affectedMarkets: marketNames(group.primaryMarkets),
    affectedBuyingGroups: group.name,
    financialImpact: compactFinancialImpact({
      gap: group.financialExposure.gapToPlan,
      margin: group.financialExposure.marginAtRisk,
      revenue: group.financialExposure.revenueUnderNegotiation,
      trade: group.financialExposure.tradeSpendExposure,
      volume: group.financialExposure.volumeExposure
    }),
    source: group.source,
    recordHref: `/buying-groups/${group.id}`
  }));
  const signalRows = packet.signals.map((signal): SourceDatabaseRow => ({
    id: `signal-${signal.id}`,
    recordType: 'External signal',
    recordName: signal.title,
    affectedMarkets: marketNames(signal.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(signal.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({ margin: signal.estimatedMarginImpact, revenue: signal.estimatedRevenueImpact }),
    source: signal.source,
    recordHref: `/signals?signal=${signal.id}`
  }));
  const competitorRows = packet.competitorMoves.map((move): SourceDatabaseRow => ({
    id: `competitor-${move.id}`,
    recordType: 'Competitor move',
    recordName: `${move.competitor}: ${move.title}`,
    affectedMarkets: marketNames(move.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(move.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({ margin: move.estimatedMarginImpact, revenue: move.estimatedRevenueImpact }),
    source: move.source,
    recordHref: `/signals?move=${move.id}`
  }));
  const documentRows = packet.documents.map((document): SourceDatabaseRow => ({
    id: `document-${document.id}`,
    recordType: 'Document',
    recordName: document.title,
    affectedMarkets: document.marketId ? marketNames([document.marketId]) : 'Not market-specific',
    affectedBuyingGroups: document.buyingGroupId ? buyingGroupNames([document.buyingGroupId]) : 'Not buyer-specific',
    financialImpact: document.lastUsed ? `Last used ${document.lastUsed}` : document.reusable ? 'Reusable source' : 'Draft source',
    source: document.source,
    recordHref: `/intelligence?document=${document.id}`
  }));
  const timelineRows = packet.timelineEvents.map((event): SourceDatabaseRow => ({
    id: `timeline-${event.id}`,
    recordType: 'Timeline event',
    recordName: event.title,
    affectedMarkets: marketNames(event.marketIds),
    affectedBuyingGroups: buyingGroupNames(event.buyingGroupIds),
    financialImpact: compactFinancialImpact({
      margin: event.financialImpact?.marginImpact,
      revenue: event.financialImpact?.revenueImpact,
      trade: event.financialImpact?.tradeSpendImpact
    }),
    source: event.source,
    recordHref: `/intelligence?event=${event.id}`
  }));
  const patternRows = packet.crossMarketPatterns.map((pattern): SourceDatabaseRow => ({
    id: `pattern-${pattern.id}`,
    recordType: 'Cross-market pattern',
    recordName: pattern.title,
    affectedMarkets: marketNames(pattern.affectedMarkets),
    affectedBuyingGroups: buyingGroupNames(pattern.affectedBuyingGroups),
    financialImpact: compactFinancialImpact({
      margin: pattern.financialImplication.marginAtRisk,
      revenue: pattern.financialImplication.revenueAtRisk,
      trade: pattern.financialImplication.tradeSpendExposure,
      volume: pattern.financialImplication.volumeExposure
    }),
    source: pattern.source,
    recordHref: `/?monitor=patterns`
  }));
  const scenarioRows = packet.scenarioModels.map((scenario): SourceDatabaseRow => {
    const source = packet.documents.find((document) => scenario.sourceIds.includes(document.id))?.source ?? getBuyingGroup(scenario.buyingGroupId)?.source ?? packet.markets[0].source;
    return {
      id: `scenario-${scenario.id}`,
      recordType: 'Scenario model',
      recordName: scenario.name,
      affectedMarkets: marketNames([scenario.marketId]),
      affectedBuyingGroups: buyingGroupNames([scenario.buyingGroupId]),
      financialImpact: compactFinancialImpact({
        gap: scenario.outputs.gapToPlanImpact,
        margin: scenario.outputs.marginImpact,
        revenue: scenario.outputs.revenueImpact,
        trade: scenario.outputs.tradeSpendImpact,
        volume: scenario.outputs.volumeImpact
      }),
      source,
      recordHref: `/scenario-lab?buyingGroup=${scenario.buyingGroupId}`
    };
  });

  return [...marketRows, ...buyingGroupRows, ...signalRows, ...competitorRows, ...documentRows, ...timelineRows, ...patternRows, ...scenarioRows]
    .sort((a, b) => b.source.lastUpdated.localeCompare(a.source.lastUpdated) || a.recordType.localeCompare(b.recordType));
}

function filterSourceDatabaseRows(rows: SourceDatabaseRow[], ask?: string) {
  const normalized = (ask ?? '').toLowerCase().trim();
  if (!normalized) return rows;
  return rows.filter((row) => {
    const haystack = [
      row.recordType,
      row.recordName,
      row.affectedMarkets,
      row.affectedBuyingGroups,
      row.financialImpact,
      row.source.sourceName,
      row.source.sourceType,
      row.source.status,
      row.source.confidence,
      row.source.governance.approvalStatus,
      row.source.governance.canonicalUseAllowed
    ].join(' ').toLowerCase();
    if (/stale|watchout|missing|validation|review/.test(normalized)) {
      return row.source.status === 'stale' || row.source.status === 'needs_validation' || row.source.status === 'missing';
    }
    if (/approved|ready|usable|canonical/.test(normalized)) {
      return row.source.status === 'approved' || row.source.status === 'ready' || row.source.governance.canonicalUseAllowed === 'yes';
    }
    if (/high confidence|trusted/.test(normalized)) return row.source.confidence === 'high';
    if (/generated|modeled|assumption|user entered/.test(normalized)) return row.source.sourceType === 'ai_generated' || row.source.sourceType === 'user_entered' || row.source.status === 'modeled';
    return normalized.split(/\s+/).filter((token) => token.length > 2).some((token) => haystack.includes(token));
  });
}

function SourceDatabaseView({ initialPrompt }: { initialPrompt?: string }) {
  const allRows = buildSourceDatabaseRows();
  const rows = filterSourceDatabaseRows(allRows, initialPrompt);
  const sourceWatchouts = allRows.filter((row) => row.source.status === 'stale' || row.source.status === 'needs_validation' || row.source.status === 'missing');
  const approvedRows = allRows.filter((row) => row.source.status === 'approved' || row.source.status === 'ready');
  const highConfidenceRows = allRows.filter((row) => row.source.confidence === 'high');
  const modeledRows = allRows.filter((row) => row.source.status === 'modeled' || row.source.sourceType === 'ai_generated' || row.source.sourceType === 'user_entered');
  const nonCanonicalRows = allRows.filter((row) => row.source.governance.canonicalUseAllowed !== 'yes');
  const governanceCards = [
    {
      action: 'Use first',
      detail: 'Approved or ready records can be retrieved before ATLAS creates new work.',
      label: 'Approved / ready',
      tone: 'good',
      value: String(approvedRows.length)
    },
    {
      action: 'Resolve before official use',
      detail: 'Stale, missing, or source-review records should not silently drive outputs.',
      label: 'Source watchouts',
      tone: 'watch',
      value: String(sourceWatchouts.length)
    },
    {
      action: 'Treat as assumption',
      detail: 'Modeled, user-entered, and generated records remain working context until validated.',
      label: 'Modeled / generated',
      tone: 'draft',
      value: String(modeledRows.length)
    },
    {
      action: 'Do not treat as source truth',
      detail: 'Non-canonical records need owner validation or replacement before governed use.',
      label: 'Non-canonical',
      tone: 'blocked',
      value: String(nonCanonicalRows.length)
    }
  ];

  return (
    <>
      <IntentBrief
        eyebrow="Intelligence Library"
        title={`${rows.length} memory, source, and scenario records / ${sourceWatchouts.length} watchouts.`}
        body={`${approvedRows.length} approved or ready / ${highConfidenceRows.length} high confidence records.`}
        action="Use this library to validate sources, approve memory, and audit prediction confidence."
        metrics={[
          { label: 'Records', value: String(rows.length) },
          { label: 'High confidence', value: String(highConfidenceRows.length), tone: 'good' },
          { label: 'Source watchouts', value: String(sourceWatchouts.length), tone: 'watch' }
        ]}
      />
      <MemoryDecisionPanel documents={packet.documents} events={packet.latestTimelineEvents} title="Library control read" />
      <section className="atlas-source-governance-summary" aria-label="Source governance summary">
        {governanceCards.map((card) => (
          <article className={`tone-${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
            <em>{card.action}</em>
          </article>
        ))}
      </section>
      <SavedGeneratedViewsShelf />
      <section className="atlas-source-database">
        <header>
          <div>
            <h2>{initialPrompt ? 'Filtered source records' : 'All ATLAS source records'}</h2>
          </div>
          <p>{rows.length} shown / {allRows.length} total. {sourceWatchouts.length} source watchouts / {approvedRows.length} usable records.</p>
        </header>
        {initialPrompt ? <p className="atlas-source-database-filter">Asked: “{initialPrompt}”</p> : null}
        <div className="atlas-source-database-table" role="table" aria-label="ATLAS source database">
          <div className="atlas-source-database-head" role="row">
            <span>Record</span>
            <span>Source</span>
            <span>Date</span>
            <span>Status</span>
            <span>Affected</span>
            <span>Financial data</span>
            <span>Links</span>
          </div>
          {rows.map((row) => (
            <article className="atlas-source-database-row" key={row.id} role="row">
              <div>
                <em>{row.recordType}</em>
                <strong>{row.recordName}</strong>
              </div>
              <div>
                <em>{row.source.sourceType}</em>
                <strong>{sourceDisplayName(row.source)}</strong>
              </div>
              <span>{row.source.sourceDate}</span>
              <div className="atlas-source-database-status">
                <StatusChip status={row.source.status} />
                <ConfidenceChip confidence={row.source.confidence} />
              </div>
              <span>{row.affectedMarkets} / {row.affectedBuyingGroups}</span>
              <span>{row.financialImpact}</span>
              <div className="atlas-source-database-links">
                <a href={row.source.url ?? `/intelligence?source=${encodeURIComponent(row.id)}`}>Open source</a>
                <a href={row.recordHref}>Open record</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function HowItWorksView() {
  const loopSteps = [
    {
      action: 'Open Overview, then drill into the highest-risk market or buyer.',
      input: 'Market pressure, watchlist, external movement, financial exposure.',
      output: 'Top focus areas and recommended next actions.',
      step: 'Monitor'
    },
    {
      action: 'Compare markets or buying groups by margin risk, realization gap, round, and pressure.',
      input: 'Revenue, margin, volume, trade spend, gap to plan, competitor pressure.',
      output: 'Where attention should go first.',
      step: 'Diagnose'
    },
    {
      action: 'Open the buying group profile.',
      input: 'Current negotiation state, documents, history, signals, competitor moves.',
      output: 'What is happening with this exact buyer.',
      step: 'Drill in'
    },
    {
      action: 'Run the Scenario Lab from the buyer workspace, market, or Impact page.',
      input: 'Price realization, volume, trade spend, concession, buyer acceptance, category/SKU drill-ins, and custom levers.',
      output: 'Predicted buyer response, financial implication, and risk-adjusted value.',
      step: 'Model'
    },
    {
      action: 'Choose a scenario and decide which evidence, history, and assumptions should carry forward.',
      input: 'Buyer profile, market gaps, saved scenarios, documents, debriefs, source records, and scenario outputs.',
      output: 'Selected move with evidence, assumptions, and pushback preparation.',
      step: 'Decide'
    },
    {
      action: 'Generate a scenario evidence report only after the user chooses what to carry forward.',
      input: 'Selected scenario, buyer history, source records, evidence choices, and assumptions.',
      output: 'Editable report artifact with PDF download and save-to-profile action.',
      step: 'Generate'
    },
    {
      action: 'Add scenario outputs, debriefs, documents, and scenario events back to buyer or market memory.',
      input: 'What changed, document evidence, financial deltas, decisions, scenario output links.',
      output: 'Updated memory for the next cycle.',
      step: 'Debrief / Memory'
    }
  ];
  const futureProcessSteps = [
    'AI summarizes prior-year local account and CNO inputs from history.',
    'Local account teams validate negotiation results, signed CMAs, retailer KPIs, and buyer feedback.',
    'CNO validates sector-level inputs, market priorities, and the 3-year plan.',
    'Finance/NRM guardrails define the pricing corridor, fallback, and red line.',
    'ATLAS diagnoses market and customer performance shifts that affect the negotiation.',
    'Scenario Lab tests pricing moves, buyer counters, category/SKU drill-ins, and custom levers.',
    'CNO uses the chosen scenario, evidence, and pushback read to decide the negotiation move.',
    'Debrief, signed agreements, saved scenarios, and scenario outputs save back to buyer history.'
  ];
  const pageIntents = [
    {
      answer: 'Top watchouts, top buyer risk, market pressure, what changed.',
      page: 'Overview',
      problem: 'CNOs need to know where to focus first without reading a dashboard wall.',
      source: 'Watchlist, market packets, buying group packets, signals, competitor moves.',
      intent: 'What do I need to focus on right now?',
      action: 'Open the top buyer, compare markets, or ask ATLAS to create a scenario read.'
    },
    {
      answer: 'Market comparison by margin risk, gap to plan, trade spend, active buyer pressure.',
      page: 'Markets',
      problem: 'Users need to see if one market is losing money and where pressure can be offset.',
      source: 'Market records, linked buying groups, signals, competitor moves.',
      intent: 'How are markets performing against each other?',
      action: 'Open the highest-pressure market or find offset potential.'
    },
    {
      answer: 'Compact buyer list with margin risk, expected realization, stage, intervention trigger.',
      page: 'Buying Groups',
      problem: 'Users need to quickly see who is stuck, risky, below target, or needs escalation.',
      source: 'Buying group records, financial exposure, negotiation stage, source memory.',
      intent: 'Which customer relationships need attention?',
      action: 'Open the buyer profile.'
    },
    {
      answer: 'Current round, latest ask, PepsiCo position, target, margin risk, history, docs, scenarios.',
      page: 'Buying Group Profile',
      problem: 'Users need one customizable workspace to model the buyer, read history, and update the memory loop.',
      source: 'Buyer packet, timeline, supporting documents, signals, competitor moves, scenarios.',
      intent: 'What could happen with this buyer, and what scenario should I test?',
      action: 'Run a scenario, inspect history, add debrief, or save the modeled output.'
    },
    {
      answer: 'Margin at risk, gap to plan, realization tracker, exposure ranking.',
      page: 'PepsiCo Impact',
      problem: 'Users need to know where money is at risk before deciding what to model.',
      source: 'Europe summary, market records, buyer financial exposure.',
      intent: 'Where is money at risk and what can be offset?',
      action: 'Open buyer profile or scenario model.'
    },
    {
      answer: 'Modeled revenue, margin, volume, trade spend, gap to plan, risk-adjusted value.',
      page: 'Scenario Lab',
      problem: 'Users need to test a pricing move, buyer counter, category/SKU drill-in, or custom lever before deciding what to do.',
      source: 'Buyer financials, scenario assumptions, linked source documents.',
      intent: 'What happens if we move price, trade spend, volume, concessions, SKU mix, or buyer-specific levers?',
      action: 'Compare scenarios, download a scenario report, or save modeled output to buyer/market memory.'
    },
    {
      answer: 'Selected scenario, evidence, buyer pushback, assumptions, and source trail.',
      page: 'Scenario decision output',
      problem: 'Users need the intelligence to become a defensible move, not remain scattered across pages.',
      source: 'Buyer profile, history, saved scenarios, documents, market signals, scenario outputs, user edits.',
      intent: 'Which modeled move should carry forward, and why?',
      action: 'Confirm, remove, edit, save, or export the selected scenario evidence.'
    },
    {
      answer: 'Editable report artifact with source decision, metrics, sections, PDF download, duplicate/edit, and save destination.',
      page: 'Scenario Outputs',
      problem: 'Users need ATLAS to retrieve reusable scenario evidence when it exists, or create an editable scenario artifact when it does not.',
      source: 'Document library, source metadata, buyer/market scope, scenario generation service.',
      intent: 'Can I export the scenario evidence behind this move right now?',
      action: 'Download PDF, duplicate/edit, save to memory, or reuse in the Scenario Lab.'
    },
    {
      answer: 'Recommended action, buyer leverage, affected financials, affected buyers, source.',
      page: 'Competitors / Signals',
      problem: 'External events need to become negotiation implications, not generic news.',
      source: 'External signal records, competitor move records, affected buyer links.',
      intent: 'What changed in the world or competitive set, and who does it affect?',
      action: 'Open affected buyer or model downside.'
    },
    {
      answer: 'Every source record, status, confidence, source date, affected data, source link.',
      page: 'Database',
      problem: 'Trust depends on users being able to find where every number came from.',
      source: 'All normalized source metadata across ATLAS objects.',
      intent: 'Where is the actual data behind this read?',
      action: 'Open source or open record.'
    }
  ];

  return (
    <>
      <IntentBrief
        eyebrow="Builder explainer"
        title="How ATLAS gets a CNO from question to tested scenario in 60 seconds."
        body="ATLAS is an intelligence loop: monitor what changed, diagnose financial exposure, drill into the buyer, model possible moves, choose what carries forward, then save the result back to memory."
        action="Design goal: every page should answer the user’s question, show affected financials, show source trust, and make the next action obvious."
        metrics={[
          { label: 'Goal', value: '<60 sec' },
          { label: 'Core object', value: 'Buying group' },
          { label: 'Trust layer', value: 'Source database', tone: 'good' }
        ]}
      />

      <section className="atlas-how-loop">
        <header>
          <span>System loop</span>
          <h2>Monitor → Diagnose → Drill in → Model → Decide → Generate → Debrief → Memory</h2>
        </header>
        <div>
          {loopSteps.map((step, index) => (
            <article key={step.step}>
              <em>{String(index + 1).padStart(2, '0')}</em>
              <h3>{step.step}</h3>
              <dl>
                <div><dt>Input</dt><dd>{step.input}</dd></div>
                <div><dt>Output</dt><dd>{step.output}</dd></div>
                <div><dt>Action</dt><dd>{step.action}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-how-answer-model">
        <div>
          <span>Relevance logic</span>
          <h2>ATLAS does not cap data. Every visible item must earn its place.</h2>
        </div>
        <ol>
          <li><strong>Materiality.</strong><span>Affects revenue, margin, volume, trade spend, price realization, or gap to plan.</span></li>
          <li><strong>Urgency.</strong><span>Affects a current negotiation, upcoming milestone, open decision, or escalation.</span></li>
          <li><strong>Strategy impact.</strong><span>Changes the in-going position, concession path, levers, risk posture, or fallback.</span></li>
          <li><strong>Source impact.</strong><span>Is high-confidence, newly updated, stale, disputed, or user-added.</span></li>
          <li><strong>Pattern impact.</strong><span>Connects to a cross-market or cross-buyer pattern.</span></li>
          <li><strong>Memory impact.</strong><span>Comes from a prior negotiation, debrief, saved scenario, uploaded document, or locked strategy.</span></li>
          <li><strong>Actionability.</strong><span>Creates a clear next step for the user.</span></li>
        </ol>
      </section>

      <section className="atlas-how-strategy-loop">
        <header>
          <span>Predictive scenario value loop</span>
          <h2>The Scenario Lab is where intelligence becomes a tested move.</h2>
        </header>
        <div>
          <article>
            <strong>ATLAS proposes</strong>
            <p>Market gaps, buyer history, saved scenarios, scenario outputs, supporting documents, and source records become scenario recommendations.</p>
          </article>
          <article>
            <strong>User tests</strong>
            <p>The CNO can adjust price, volume, trade, category/SKU assumptions, and custom levers before choosing what carries forward.</p>
          </article>
          <article>
            <strong>Scenario saves</strong>
            <p>The selected scenario becomes the working reference for evidence, pushback prep, and scenario outputs.</p>
          </article>
          <article>
            <strong>Memory updates</strong>
            <p>Saved scenarios, reports, debriefs, and outcomes return to buyer history and affect future predictions only when relevant.</p>
          </article>
        </div>
      </section>

      <section className="atlas-how-future-process">
        <header>
          <div>
            <span>Future process loop</span>
            <h2>How ATLAS supports predictive negotiation planning.</h2>
          </div>
          <p>Local account and Finance inputs are represented as source roles in this POC. Full local-account workflows, Finance workflows, meeting capture, and production integrations stay in backlog.</p>
        </header>
        <ol>
          {futureProcessSteps.map((step, index) => (
            <li key={step}>
              <em>{String(index + 1).padStart(2, '0')}</em>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="atlas-how-intent-table">
        <header>
          <div>
            <span>Page intent map</span>
            <h2>User intent, problem solved, and expected answer by page.</h2>
          </div>
          <p>This is the builder reference for deciding what belongs on each page and what should be hidden behind drilldown or Ask ATLAS.</p>
        </header>
        <div className="atlas-how-intent-head">
          <span>Page</span>
          <span>User intent</span>
          <span>Problem solved</span>
          <span>Default answer</span>
          <span>Source / data</span>
          <span>Next action</span>
        </div>
        {pageIntents.map((item) => (
          <article className="atlas-how-intent-row" key={item.page}>
            <strong>{item.page}</strong>
            <span>{item.intent}</span>
            <span>{item.problem}</span>
            <span>{item.answer}</span>
            <span>{item.source}</span>
            <span>{item.action}</span>
          </article>
        ))}
      </section>
    </>
  );
}

function AtlasIntelligenceContent({
  view,
  marketId,
  buyingGroupId,
  initialBuyingGroupPhase,
  initialBuyingGroupPrompt,
  initialBuyingGroupView,
  initialGeneratedView,
  initialMonitorTab,
  initialPrompt,
  initialScenarioCaseId,
  initialScenarioId,
  initialScenarioLabMode,
  initialSort,
  returnLabel,
  returnTo
}: AtlasIntelligenceHubProps) {
  if (view === 'markets' || view === 'market') return <MarketsView initialGeneratedView={initialGeneratedView} initialPrompt={initialPrompt} initialSort={initialSort} marketId={marketId} />;
  if (view === 'buyingGroups' || view === 'buyingGroup') {
    return (
      <BuyingGroupsView
        buyingGroupId={buyingGroupId}
        initialPhase={initialBuyingGroupPhase}
        initialPrompt={buyingGroupId ? initialBuyingGroupPrompt : initialPrompt}
        initialSort={initialSort}
        initialView={buyingGroupId ? initialBuyingGroupView : initialGeneratedView}
      />
    );
  }
  if (view === 'signals') return <SignalsView initialPrompt={initialPrompt} />;
  if (view === 'competitors') return <CompetitorsView initialPrompt={initialPrompt} />;
  if (view === 'financialImpact') return <FinancialImpactView initialGeneratedView={initialGeneratedView} initialPrompt={initialPrompt} />;
  if (view === 'documents') return <DocumentsView initialPrompt={initialPrompt} />;
  if (view === 'timeline') return <TimelineView initialPrompt={initialPrompt} />;
  if (view === 'database') return <SourceDatabaseView initialPrompt={initialPrompt} />;
  if (view === 'howItWorks') return <HowItWorksView />;
  if (view === 'scenarioCompare') return <ScenarioCompareView buyingGroupId={buyingGroupId} initialView={initialGeneratedView} marketId={marketId} returnLabel={returnLabel} returnTo={returnTo} />;
  if (view === 'scenarioModels') return <ScenarioModelsView buyingGroupId={buyingGroupId} initialPrompt={initialPrompt} initialScenarioCaseId={initialScenarioCaseId} initialScenarioId={initialScenarioId} initialScenarioLabMode={initialScenarioLabMode} initialView={initialGeneratedView} marketId={marketId} returnLabel={returnLabel} returnTo={returnTo} />;
  return <EuropeOverview initialGeneratedView={initialGeneratedView} initialMonitorTab={initialMonitorTab} initialPrompt={initialPrompt} />;
}

export default function AtlasIntelligenceHub(props: AtlasIntelligenceHubProps) {
  const commandPrompt = props.buyingGroupId
    ? props.initialBuyingGroupPrompt || props.initialPrompt
    : props.initialPrompt;
  return (
    <AppShell buyingGroupId={props.buyingGroupId} commandPrompt={commandPrompt} marketId={props.marketId} view={props.view}>
      <AtlasIntelligenceContent {...props} />
    </AppShell>
  );
}
