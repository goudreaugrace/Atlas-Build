import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = 'docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03';
const pptxPath = path.join(sourceRoot, '2026.q1.united_states.snacks_.pptx');
const slideInventoryPath = path.join(sourceRoot, 'slide-inventory.json');
const metricRecordsPath = 'src/data/processed/bbe_metric_records.json';
const chartLedgerPath = path.join(sourceRoot, 'deck-chart-ledger.json');
const sourceLedgerPath = 'src/data/processed/bbe_source_data_ledger.json';
const ledgerGeneratedAt = '2026-07-04T00:00:00.000Z';

const maxPreviewItems = 8;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function unzipList(zipPath) {
  return execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function unzipRead(zipPath, entryPath) {
  try {
    return execFileSync('unzip', ['-p', zipPath, entryPath], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024
    });
  } catch {
    return '';
  }
}

function decodeXml(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAttributes(rawAttributes) {
  const attributes = {};
  const attributePattern = /([\w:]+)="([^"]*)"/g;
  let match;
  while ((match = attributePattern.exec(rawAttributes)) !== null) {
    attributes[match[1]] = decodeXml(match[2]);
  }
  return attributes;
}

function parseRelationships(xml) {
  const relationships = [];
  const relationshipPattern = /<Relationship\b([^>]*)\/?>/g;
  let match;
  while ((match = relationshipPattern.exec(xml)) !== null) {
    relationships.push(parseAttributes(match[1]));
  }
  return relationships;
}

function sortByNumberedPath(a, b) {
  const aNumber = Number(a.match(/(\d+)\.xml$/)?.[1] ?? 0);
  const bNumber = Number(b.match(/(\d+)\.xml$/)?.[1] ?? 0);
  return aNumber - bNumber;
}

function slideNumberFromPath(entryPath) {
  return Number(entryPath.match(/slide(\d+)\.xml\.rels$/)?.[1] ?? 0);
}

function chartNumberFromPath(entryPath) {
  return Number(entryPath.match(/chart(\d+)\.xml$/)?.[1] ?? 0);
}

function extractTextTags(xml, tagName) {
  const values = [];
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'g');
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    const value = decodeXml(match[1]);
    if (value) values.push(value);
  }
  return values;
}

function extractTitle(chartXml) {
  const titleBlock = chartXml.match(/<c:title\b[\s\S]*?<\/c:title>/)?.[0] ?? '';
  const titleText = extractTextTags(titleBlock, 'a:t').join('');
  return titleText || null;
}

function extractBlocks(xml, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`, 'g');
  return xml.match(pattern) ?? [];
}

function extractPointValues(xml) {
  const values = [];
  const pointPattern = /<c:pt\b[^>]*>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>[\s\S]*?<\/c:pt>/g;
  let match;
  while ((match = pointPattern.exec(xml)) !== null) {
    values.push(decodeXml(match[1]));
  }
  return values;
}

function asNumberIfPossible(value) {
  if (value === '') return value;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
}

function extractChartTypes(chartXml) {
  const candidates = [
    'areaChart',
    'barChart',
    'bubbleChart',
    'doughnutChart',
    'lineChart',
    'ofPieChart',
    'pieChart',
    'radarChart',
    'scatterChart',
    'surfaceChart'
  ];
  return candidates.filter(candidate => chartXml.includes(`<c:${candidate}`));
}

function extractSeries(chartXml) {
  return extractBlocks(chartXml, 'c:ser').map((seriesXml, index) => {
    const txBlock = seriesXml.match(/<c:tx\b[\s\S]*?<\/c:tx>/)?.[0] ?? '';
    const catBlock = seriesXml.match(/<c:cat\b[\s\S]*?<\/c:cat>/)?.[0] ?? '';
    const valBlock = seriesXml.match(/<c:val\b[\s\S]*?<\/c:val>/)?.[0] ?? '';
    const xValBlock = seriesXml.match(/<c:xVal\b[\s\S]*?<\/c:xVal>/)?.[0] ?? '';
    const yValBlock = seriesXml.match(/<c:yVal\b[\s\S]*?<\/c:yVal>/)?.[0] ?? '';
    const seriesName = extractPointValues(txBlock)[0] ?? extractTextTags(txBlock, 'a:t').join('') ?? `Series ${index + 1}`;
    const categories = extractPointValues(catBlock || xValBlock);
    const rawValues = extractPointValues(valBlock || yValBlock);
    const values = rawValues.map(asNumberIfPossible);

    return {
      name: seriesName || `Series ${index + 1}`,
      pointCount: Math.max(categories.length, values.length),
      categoriesPreview: categories.slice(0, maxPreviewItems),
      valuesPreview: values.slice(0, maxPreviewItems)
    };
  });
}

function buildSlideChartMap(entries) {
  const slideChartMap = new Map();
  const slideRelsEntries = entries
    .filter(entry => /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(entry))
    .sort(sortByNumberedPath);

  for (const relsPath of slideRelsEntries) {
    const slideNumber = slideNumberFromPath(relsPath);
    const relsXml = unzipRead(pptxPath, relsPath);
    const chartTargets = parseRelationships(relsXml)
      .filter(rel => rel.Type?.endsWith('/chart') && rel.Target?.includes('chart'))
      .map(rel => `ppt/charts/${path.basename(rel.Target)}`);
    if (chartTargets.length > 0) {
      slideChartMap.set(slideNumber, chartTargets);
    }
  }

  return slideChartMap;
}

function summarizeMetricRows(rows) {
  const rowsBySlide = new Map();
  for (const row of rows) {
    const slideNumber = Number(row.Slide);
    if (!Number.isFinite(slideNumber)) continue;
    if (!rowsBySlide.has(slideNumber)) {
      rowsBySlide.set(slideNumber, {
        count: 0,
        brands: new Set(),
        metrics: new Set(),
        sourceFiles: new Set(),
        rowsWithAhead: 0,
        rowsWithMomentum: 0
      });
    }
    const summary = rowsBySlide.get(slideNumber);
    summary.count += 1;
    if (row.Brand) summary.brands.add(row.Brand.trim());
    if (row.Metric) summary.metrics.add(row.Metric.trim());
    if (row.sourceFile) summary.sourceFiles.add(row.sourceFile.trim());
    if (row.Ahead !== null && row.Ahead !== undefined && row.Ahead !== '') summary.rowsWithAhead += 1;
    if (row.Momentum !== null && row.Momentum !== undefined && row.Momentum !== '') summary.rowsWithMomentum += 1;
  }
  return rowsBySlide;
}

function serializeMetricSummary(summary) {
  if (!summary) {
    return {
      rowCount: 0,
      brandsPreview: [],
      brandCount: 0,
      metricsPreview: [],
      metricCount: 0,
      sourceFiles: [],
      rowsWithAhead: 0,
      rowsWithMomentum: 0
    };
  }
  const brands = [...summary.brands].sort();
  const metrics = [...summary.metrics].sort();
  return {
    rowCount: summary.count,
    brandsPreview: brands.slice(0, maxPreviewItems),
    brandCount: brands.length,
    metricsPreview: metrics.slice(0, maxPreviewItems),
    metricCount: metrics.length,
    sourceFiles: [...summary.sourceFiles].sort(),
    rowsWithAhead: summary.rowsWithAhead,
    rowsWithMomentum: summary.rowsWithMomentum
  };
}

function reconciliationStatus(hasNativeCharts, hasProcessedRows) {
  if (hasNativeCharts && hasProcessedRows) return 'native_chart_and_processed_rows';
  if (hasNativeCharts) return 'native_chart_no_processed_rows';
  if (hasProcessedRows) return 'processed_rows_no_native_chart';
  return 'no_machine_readable_metric_payload';
}

const entries = unzipList(pptxPath);
const slideInventory = readJson(slideInventoryPath);
const metricRows = readJson(metricRecordsPath);
const rowsBySlide = summarizeMetricRows(metricRows);
const slideChartMap = buildSlideChartMap(entries);
const chartToSlide = new Map();
for (const [slideNumber, chartTargets] of slideChartMap.entries()) {
  for (const chartTarget of chartTargets) chartToSlide.set(chartTarget, slideNumber);
}

const chartEntries = entries
  .filter(entry => /^ppt\/charts\/chart\d+\.xml$/.test(entry))
  .sort(sortByNumberedPath)
  .map(chartPath => {
    const chartXml = unzipRead(pptxPath, chartPath);
    const chartRelsPath = chartPath.replace('ppt/charts/', 'ppt/charts/_rels/') + '.rels';
    const chartRelationships = parseRelationships(unzipRead(pptxPath, chartRelsPath));
    const embeddedWorkbook = chartRelationships.find(rel => rel.Type?.endsWith('/package'))?.Target ?? null;
    const slideNumber = chartToSlide.get(chartPath) ?? null;
    const slideInfo = slideInventory.find(slide => slide.slide === slideNumber);
    const metricSummary = serializeMetricSummary(slideNumber ? rowsBySlide.get(slideNumber) : null);

    return {
      chartId: path.basename(chartPath, '.xml'),
      chartNumber: chartNumberFromPath(chartPath),
      sourcePath: chartPath,
      slide: slideNumber,
      slideTitle: slideInfo?.title ?? null,
      chartTitle: extractTitle(chartXml),
      chartTypes: extractChartTypes(chartXml),
      seriesCount: extractBlocks(chartXml, 'c:ser').length,
      seriesPreview: extractSeries(chartXml).slice(0, 6),
      embeddedWorkbookPath: embeddedWorkbook ? `ppt/embeddings/${path.basename(embeddedWorkbook)}` : null,
      processedMetricCoverage: metricSummary,
      reconciliationStatus: reconciliationStatus(true, metricSummary.rowCount > 0)
    };
  });

const slides = slideInventory.map(slide => {
  const chartTargets = slideChartMap.get(slide.slide) ?? [];
  const metricSummary = serializeMetricSummary(rowsBySlide.get(slide.slide));
  return {
    slide: slide.slide,
    title: slide.title,
    textCount: slide.text_count,
    nativeChartCount: chartTargets.length,
    nativeCharts: chartTargets.map(chartTarget => path.basename(chartTarget, '.xml')),
    processedMetricCoverage: metricSummary,
    reconciliationStatus: reconciliationStatus(chartTargets.length > 0, metricSummary.rowCount > 0)
  };
});

const workbookPaths = new Set(chartEntries.map(chart => chart.embeddedWorkbookPath).filter(Boolean));
const unmatchedEmbeddedWorkbooks = entries
  .filter(entry => /^ppt\/embeddings\/Microsoft_Excel_Worksheet.*\.xlsx$/.test(entry))
  .filter(entry => !workbookPaths.has(entry))
  .sort();

const statusCounts = slides.reduce((counts, slide) => {
  counts[slide.reconciliationStatus] = (counts[slide.reconciliationStatus] ?? 0) + 1;
  return counts;
}, {});

const ledger = {
  sourceId: 'bbe-snacks-tracker-2026-q1-us-snacks',
  generatedAt: ledgerGeneratedAt,
  sourceReport: {
    title: '2026 Q1 United States Snacks BBE Automated Report',
    preservedCopy: pptxPath,
    extractedText: path.join(sourceRoot, '2026.q1.united_states.snacks_.extracted.txt'),
    slideInventory: slideInventoryPath,
    processedMetricRecords: metricRecordsPath
  },
  governance: {
    sourceType: 'source_report_extract',
    reviewStatus: 'reviewed_for_prototype',
    approvalStatus: 'prototype_governance_review_required',
    evidenceMode: 'measured_partial_extract',
    allowedUses: ['prototype_demo', 'diagnostic_reasoning_calibration', 'report_module_design'],
    blockedUses: ['official_business_readout', 'pilot_canonical_data_store', 'unreviewed_external_distribution'],
    caveats: [
      'The deck is a preserved source report and has not been promoted to official canonical product data.',
      'Chart cache values and processed text-derived metric records are suitable for prototype validation, not final business publication.',
      'Embedded workbook data should be source-owner reviewed before pilot use or automated deck replacement.'
    ]
  },
  counts: {
    slides: slides.length,
    nativeCharts: chartEntries.length,
    embeddedWorkbooksLinkedToCharts: workbookPaths.size,
    embeddedWorkbooksUnmatchedToCharts: unmatchedEmbeddedWorkbooks.length,
    processedMetricRows: metricRows.length,
    processedMetricSlides: rowsBySlide.size,
    reconciliationStatusCounts: statusCounts
  },
  slides,
  charts: chartEntries,
  unmatchedEmbeddedWorkbooks
};

const sourceLedger = {
  ledgerId: 'bbe-source-data-ledger',
  generatedAt: ledger.generatedAt,
  canonicalPolicy: {
    principle: 'Product reasoning consumes governed ledgers and source packets, not raw PowerPoint files directly.',
    prototypeDefault: 'reviewed_for_prototype',
    pilotPromotionRequirement: 'Source owner must approve the underlying BBE export/workbook and the metric mapping before promotion to canonical source data.',
    reasoningGuardrail: 'Missing source coverage must block measured conclusions rather than trigger generated filler.'
  },
  sources: [
    {
      sourceId: ledger.sourceId,
      title: ledger.sourceReport.title,
      sourceType: ledger.governance.sourceType,
      reviewStatus: ledger.governance.reviewStatus,
      evidenceMode: ledger.governance.evidenceMode,
      preservedCopy: ledger.sourceReport.preservedCopy,
      chartLedger: chartLedgerPath,
      processedMetricRecords: ledger.sourceReport.processedMetricRecords,
      counts: ledger.counts,
      caveats: ledger.governance.caveats
    }
  ]
};

writeJson(chartLedgerPath, ledger);
writeJson(sourceLedgerPath, sourceLedger);

console.log(`Wrote ${chartLedgerPath}`);
console.log(`Wrote ${sourceLedgerPath}`);
console.log(`Mapped ${chartEntries.length} native charts, ${workbookPaths.size} linked embedded workbooks, and ${metricRows.length} processed metric rows.`);
