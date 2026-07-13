# 2026 Q1 United States Snacks BBE Automated Report

## Source

- Original local file: `/Users/briongoudreau/Downloads/2026.q1.united_states.snacks_.pptx`
- Preserved copy: `docs/source-materials/reference-materials/source-reports/bbe-snacks-tracker/2026-07-03/2026.q1.united_states.snacks_.pptx`
- Extracted text: `2026.q1.united_states.snacks_.extracted.txt`
- Slide inventory: `slide-inventory.json`
- Deck chart ledger: `deck-chart-ledger.json`
- Product source data ledger: `src/data/processed/bbe_source_data_ledger.json`

## Status

Available source report with first-pass prototype-reviewed extraction ledger.

This deck should be treated as source material for BBE methodology, automated-report structure, benchmark interpretation, metric definitions, Jobs To Be Done, and source-data requirements. It should not be treated as final product copy or canonical source truth until reviewed by the business/source owners.

The generated ledgers make the deck inspectable for prototype validation: 128 slides, 107 native charts, 107 chart-linked embedded Excel workbooks, and 11,158 processed BBE metric rows have been mapped into governed JSON artifacts. The ledgers are suitable for prototype reasoning calibration and report-module design, not official business publication.

## Notes

- The deck contains 128 slides.
- LibreOffice PDF conversion succeeded for spot-checking key methodology slides.
- The artifact-tool slide renderer failed on this deck with a canvas downcast error, so the full rendered PNG set was not created in-repo.
- Visual spot checks confirmed the three-benchmark framework on slide 10 and the dummy chart-read example on slide 12.
- `pnpm extract:source-ledger` regenerates the chart/source ledgers from the preserved PPTX and processed metric records.
- `pnpm validate:data` now checks the ledger counts, source posture, chart linkage, and reconciliation statuses.
