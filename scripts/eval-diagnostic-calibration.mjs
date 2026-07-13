import fs from 'node:fs';

function read(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function lower(value) {
  return String(value ?? '').toLowerCase();
}

const brandRecords = read('src/data/demo/brand-health-records.json');
const domainPacks = read('src/data/config/domain-pack-registry.json');
const simulatedDemographics = read('src/data/demo/simulated-demographic-equity-records.json');
const sourceLedger = read('src/data/processed/bbe_source_data_ledger.json');
const deckChartLedger = read('docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/deck-chart-ledger.json');
const processedMetricRows = read('src/data/processed/bbe_metric_records.json');
const deckDoctrine = read('src/data/config/bbe-deck-doctrine.json');

const bbePack = domainPacks.find((pack) => pack.id === 'bbe-brand-equity');
assert(bbePack, 'diagnostic calibration: missing BBE domain pack');
assert(bbePack.reasoningReadType === 'EquityReasoningRead', 'diagnostic calibration: BBE pack must declare EquityReasoningRead');
assert(bbePack.pilotReadinessGates.includes('demographic_evidence_gate'), 'diagnostic calibration: BBE pack needs demographic evidence gate');
assert(bbePack.guardrails.some((item) => lower(item).includes('category')), 'diagnostic calibration: BBE pack needs category-index guardrail');
assert(bbePack.guardrails.some((item) => lower(item).includes('simulated')), 'diagnostic calibration: BBE pack needs simulated-data guardrail');
assert(bbePack.reasoningArtifacts.includes('src/data/config/bbe-deck-doctrine.json'), 'diagnostic calibration: BBE pack must include deck doctrine artifact');

const lensById = new Map(deckDoctrine.benchmarkLensHierarchy.map((lens) => [lens.id, lens]));
assert(lensById.get('momentum')?.precedence === 1, 'diagnostic calibration: Momentum must be the first-precedence lens');
assert(lower(lensById.get('momentum')?.role).includes('headline'), 'diagnostic calibration: Momentum must be the headline verdict lens');
assert(lower(lensById.get('aheadBehind')?.role).includes('size'), 'diagnostic calibration: Ahead/Behind must be the size-adjusted check');
assert(lower(lensById.get('vsCategory')?.productRule).includes('cannot prove brand health'), 'diagnostic calibration: category index must not prove health');
assert(deckDoctrine.typologyPolicy.allowedUse === 'source_context_only', 'diagnostic calibration: typology must be source context only');
assert(lower(deckDoctrine.typologyPolicy.blockedUse).includes('final product verdict'), 'diagnostic calibration: typology must be blocked as product verdict');
assert(deckDoctrine.strengthLanguagePolicy.blockedTerms.includes('strong'), 'diagnostic calibration: strong must be governed by strength-language policy');
assert(lower(deckDoctrine.driverRelationships['Demand Power'].read).includes('meaningful') && lower(deckDoctrine.driverRelationships['Demand Power'].read).includes('salient'), 'diagnostic calibration: Demand Power driver rule must prioritize Meaningful/Salient');
assert(lower(deckDoctrine.driverRelationships['Pricing Power'].read).includes('meaningful') && lower(deckDoctrine.driverRelationships['Pricing Power'].read).includes('different'), 'diagnostic calibration: Pricing Power driver rule must prioritize Meaningful/Different');
assert(lower(deckDoctrine.demographicPolicy.productRule).includes('official bbe demographic cuts'), 'diagnostic calibration: demographic doctrine must require official BBE cuts');

const lays = brandRecords.find((record) => record.brandId === 'lay-s');
assert(lays, 'diagnostic calibration: missing Lay\'s record');

const demandPower = lays.metrics['Demand Power'];
const meaningful = lays.metrics.Meaningful;
const different = lays.metrics.Different;
const pricingPower = lays.metrics['Pricing Power'];
assert(demandPower?.categoryBand === 'Category Leading', 'diagnostic calibration: Lay\'s should retain category-leading context');
assert(demandPower?.momentum === 'Declining', 'diagnostic calibration: Lay\'s Demand Power should show declining momentum');
assert(meaningful?.momentum === 'Declining', 'diagnostic calibration: Lay\'s Meaningful should show declining momentum');
assert(different?.ahead === 'Not Ahead', 'diagnostic calibration: Lay\'s Different should be Not Ahead');
assert(pricingPower?.ahead === 'Not Ahead', 'diagnostic calibration: Lay\'s Pricing Power should be Not Ahead');

const laysLargeButVulnerable = demandPower?.categoryBand === 'Category Leading'
  && (demandPower?.momentum === 'Declining' || meaningful?.momentum === 'Declining' || different?.ahead === 'Not Ahead' || pricingPower?.ahead === 'Not Ahead');
assert(laysLargeButVulnerable, 'diagnostic calibration: Lay\'s should classify as large/category-leading but vulnerable');

const bbeSource = sourceLedger.sources.find((source) => source.sourceId === 'bbe-snacks-tracker-2026-q1-us-snacks');
assert(bbeSource, 'diagnostic calibration: missing governed BBE source ledger entry');
assert(bbeSource.reviewStatus === 'reviewed_for_prototype', 'diagnostic calibration: BBE source ledger must be prototype-reviewed, not canonical by default');
assert(bbeSource.evidenceMode === 'measured_partial_extract', 'diagnostic calibration: BBE source ledger should identify measured partial extract posture');
assert(lower(sourceLedger.canonicalPolicy.pilotPromotionRequirement).includes('source owner'), 'diagnostic calibration: source ledger must require source-owner promotion before pilot use');
assert(deckChartLedger.governance.blockedUses.includes('pilot_canonical_data_store'), 'diagnostic calibration: deck source must block direct pilot canonical use');
assert(deckChartLedger.counts.nativeCharts === 107, 'diagnostic calibration: deck source ledger should retain 107 native chart count');
assert(deckChartLedger.counts.embeddedWorkbooksLinkedToCharts === 107, 'diagnostic calibration: deck source ledger should retain 107 linked workbook count');

const laysSourceRows = processedMetricRows.filter((row) => row.Brand === "Lay's");
const laysSourceSlides = new Set(laysSourceRows.map((row) => row.Slide));
assert(laysSourceRows.length > 0, 'diagnostic calibration: Lay\'s needs processed BBE source rows');
assert(laysSourceSlides.has('17'), 'diagnostic calibration: Lay\'s needs source rows from MDS dashboard slide 17');

for (const brandId of ['lay-s', 'cheetos', 'doritos', 'tostitos']) {
  const packet = simulatedDemographics.find((item) => item.brandId === brandId);
  assert(packet, `diagnostic calibration: missing simulated demographic packet for ${brandId}`);
  assert(packet.sourceType === 'simulated', `diagnostic calibration: ${brandId} demographics must be simulated`);
  assert(packet.approvalStatus === 'prototype_simulation', `diagnostic calibration: ${brandId} demographics must be prototype_simulation`);
  assert(lower(packet.caveat).includes('not measured'), `diagnostic calibration: ${brandId} demographic caveat must say not measured`);
  assert(lower(packet.replacementRequirement).includes('official bbe'), `diagnostic calibration: ${brandId} demographics need official BBE replacement requirement`);
  assert(packet.segments.some((segment) => segment.segment === '18-24'), `diagnostic calibration: ${brandId} needs 18-24 segment for Kate-style questions`);
}

console.log('Diagnostic calibration eval passed');
console.log('- BBE domain pack declares reusable shell boundary and EquityReasoningRead');
console.log('- Deck doctrine prioritizes Momentum, treats category index as context, and keeps typology source-only');
console.log('- Lay\'s pressure test classifies as large/category-leading but vulnerable');
console.log('- BBE source ledger is prototype-reviewed, source-owner promotion-gated, and linked to Lay\'s processed rows');
console.log('- Simulated demographic packets are visibly prototype-only and replacement-gated');
