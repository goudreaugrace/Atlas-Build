import { NextRequest } from 'next/server';
import { bps, pct } from '@/src/lib/atlas/assistant';
import { demoNegotiation, demoStrategyWatchouts, demoVisualEvidenceModules, getScenario } from '@/src/lib/atlas/demo-data';

export const runtime = 'nodejs';

type ZipEntry = {
  data: Buffer;
  name: string;
};

const slideWidth = 12192000;
const slideHeight = 6858000;

function escapeXml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipDateTime(date = new Date()) {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function makeZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const { dosDate, dosTime } = zipDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

function paragraph(text: string, options: { bold?: boolean; color?: string; size?: number } = {}) {
  const { bold = false, color = '173A55', size = 1800 } = options;
  return `
    <a:p>
      <a:r>
        <a:rPr lang="en-US" sz="${size}"${bold ? ' b="1"' : ''}>
          <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
        </a:rPr>
        <a:t>${escapeXml(text)}</a:t>
      </a:r>
    </a:p>`;
}

function textBox(id: number, x: number, y: number, cx: number, cy: number, lines: string[], options: { bold?: boolean; color?: string; size?: number } = {}) {
  return `
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="${id}" name="Text ${id}"/>
        <p:cNvSpPr txBox="1"/>
        <p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:noFill/>
        <a:ln><a:noFill/></a:ln>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square"/>
        <a:lstStyle/>
        ${lines.map((line) => paragraph(line, options)).join('')}
      </p:txBody>
    </p:sp>`;
}

function slideXml(shapes: string[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
      <p:spTree>
        <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
        <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${slideWidth}" cy="${slideHeight}"/><a:chOff x="0" y="0"/><a:chExt cx="${slideWidth}" cy="${slideHeight}"/></a:xfrm></p:grpSpPr>
        ${shapes.join('')}
      </p:spTree>
    </p:cSld>
    <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
  </p:sld>`;
}

function contentTypes(slideCount: number) {
  const slideOverrides = Array.from({ length: slideCount }, (_, index) => `
    <Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    ${slideOverrides}
  </Types>`;
}

function presentationXml(slideCount: number) {
  const slides = Array.from({ length: slideCount }, (_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:sldIdLst>${slides}</p:sldIdLst>
    <p:sldSz cx="${slideWidth}" cy="${slideHeight}" type="screen16x9"/>
    <p:notesSz cx="6858000" cy="9144000"/>
  </p:presentation>`;
}

function presentationRels(slideCount: number) {
  const slideRels = Array.from({ length: slideCount }, (_, index) => `
    <Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    ${slideRels}
  </Relationships>`;
}

function buildSlides() {
  const record = demoNegotiation;
  const scenario = getScenario(record);
  const currentUpdate = record.strategyUpdates[0];
  const weakeningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status !== 'supports_strategy').slice(0, 3);
  const strengtheningWatchouts = demoStrategyWatchouts.filter((watchout) => watchout.status === 'supports_strategy');

  return [
    slideXml([
      textBox(2, 650000, 750000, 10600000, 1400000, [`${record.customer} Group 2026 Negotiation Strategy`], { bold: true, color: '005EB8', size: 4200 }),
      textBox(3, 700000, 2250000, 9800000, 900000, [record.sellStory.narrative], { color: '173A55', size: 2000 }),
      textBox(4, 700000, 3650000, 2600000, 1000000, ['Recommended position', record.recommendedPosition], { bold: true, color: '062844', size: 1800 }),
      textBox(5, 3500000, 3650000, 1900000, 1000000, ['Buyer ask', pct(record.pricingPosition.currentCustomerAskPct.value)], { bold: true, color: '062844', size: 1800 }),
      textBox(6, 5600000, 3650000, 1900000, 1000000, ['Target', pct(record.pricingPosition.targetPriceIncreasePct.value)], { bold: true, color: '062844', size: 1800 }),
      textBox(7, 7700000, 3650000, 3200000, 1000000, ['Readiness', record.strategyReadinessState], { bold: true, color: '062844', size: 1800 })
    ]),
    slideXml([
      textBox(2, 650000, 550000, 10500000, 850000, ['Hold 3.0% counter while validating fallback capacity.'], { bold: true, color: '062844', size: 3600 }),
      textBox(3, 750000, 1800000, 4700000, 2300000, ['Defense logic', record.sellStory.defense], { color: '173A55', size: 1800 }),
      textBox(4, 6200000, 1800000, 4700000, 2300000, ['Next decision', record.blockingIssue], { color: '173A55', size: 1800 })
    ]),
    slideXml([
      textBox(2, 650000, 550000, 10500000, 700000, ['Evidence sequence for the sell story'], { bold: true, color: '062844', size: 3400 }),
      textBox(3, 800000, 1500000, 10100000, 4400000, demoVisualEvidenceModules.map((module, index) => `${index + 1}. ${module.deckUse}: ${module.title} - ${module.keyTakeaway} (${module.source.source}, ${module.source.confidence})`), { color: '173A55', size: 1550 })
    ]),
    slideXml([
      textBox(2, 650000, 550000, 10500000, 760000, [`${scenario.name}: strategic movement path`], { bold: true, color: '062844', size: 3400 }),
      textBox(3, 750000, 1600000, 9700000, 900000, [scenario.recommendedUseCase], { color: '173A55', size: 1800 }),
      textBox(4, 750000, 3000000, 9000000, 1800000, [
        `Price move: ${pct(scenario.priceMovePct)}`,
        `Concession: ${pct(scenario.concessionPct)}`,
        `NR impact: €${Math.round(scenario.netRevenueImpactEuros / 1000000)}M`,
        `GM impact: ${bps(scenario.grossMarginImpactBps)}`,
        `Volume: ${pct(scenario.volumeImpactPct)}`,
        `Probability to land: ${scenario.probabilityToLandPct}%`
      ], { color: '173A55', size: 1900 })
    ]),
    slideXml([
      textBox(2, 650000, 550000, 10500000, 760000, ['What can change the recommendation'], { bold: true, color: '062844', size: 3400 }),
      textBox(3, 750000, 1600000, 4700000, 3200000, ['Could weaken', ...weakeningWatchouts.map((watchout) => `${watchout.title}: ${watchout.action}`)], { color: '173A55', size: 1650 }),
      textBox(4, 6200000, 1600000, 4700000, 3200000, ['Could strengthen', ...strengtheningWatchouts.map((watchout) => `${watchout.title}: ${watchout.action}`), 'Commodity data still supports a defended price position if refreshed before review.'], { color: '173A55', size: 1650 })
    ]),
    slideXml([
      textBox(2, 650000, 550000, 10500000, 760000, [`${currentUpdate.version} update: why the strategy moved`], { bold: true, color: '062844', size: 3400 }),
      textBox(3, 750000, 1550000, 5100000, 3300000, ['What changed', ...currentUpdate.changes], { color: '173A55', size: 1650 }),
      textBox(4, 6500000, 1550000, 4400000, 3300000, ['Source trail', currentUpdate.triggeredBy, `${currentUpdate.source.source} / ${currentUpdate.source.freshness} / ${currentUpdate.source.confidence} confidence`], { color: '173A55', size: 1650 })
    ])
  ];
}

function buildPptx() {
  const slides = buildSlides();
  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: Buffer.from(contentTypes(slides.length)) },
    {
      name: '_rels/.rels',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
        <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
      </Relationships>`)
    },
    { name: 'ppt/presentation.xml', data: Buffer.from(presentationXml(slides.length)) },
    { name: 'ppt/_rels/presentation.xml.rels', data: Buffer.from(presentationRels(slides.length)) },
    {
      name: 'docProps/core.xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <dc:title>ATLAS Carrefour Group Strategy Deck</dc:title>
        <dc:creator>ATLAS Strategy Workspace</dc:creator>
        <cp:lastModifiedBy>ATLAS Strategy Workspace</cp:lastModifiedBy>
        <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
        <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
      </cp:coreProperties>`)
    },
    {
      name: 'docProps/app.xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
        <Application>ATLAS Strategy Workspace</Application>
        <Slides>${slides.length}</Slides>
      </Properties>`)
    },
    ...slides.map((slide, index) => ({ name: `ppt/slides/slide${index + 1}.xml`, data: Buffer.from(slide) }))
  ];

  return makeZip(entries);
}

export async function GET(request: NextRequest) {
  const negotiationId = request.nextUrl.searchParams.get('negotiationId');
  if (negotiationId && negotiationId !== demoNegotiation.id) {
    return new Response('Unsupported negotiation', { status: 404 });
  }

  const pptx = buildPptx();
  return new Response(pptx, {
    headers: {
      'Content-Disposition': `attachment; filename="ATLAS-Carrefour-Group-2026-Strategy-Deck.pptx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }
  });
}
