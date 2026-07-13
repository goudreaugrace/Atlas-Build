# Intelligence Output Mode Foundation

## Purpose

BBE Brand Doctor needs to balance three truths at once:

- the PPTX is the current-state source context,
- Kate/Lydia feedback calibrates how the product should reason from that context,
- the web-native system can create higher-value interactive outputs that go beyond a static deck.

The foundation should not collapse those into one undifferentiated answer. Every governed executive asset page should declare an output mode before it is rendered or used by chat/voice.

## Output Modes

### `source_recreation`

Use when the asset is recreating, explaining, or reconciling current PPT/source material.

Allowed:

- source deck terminology when it is present in the source,
- chart/source-slide references,
- source methodology context,
- explicit reconciliation and source-owner approval status.

Required:

- source module IDs,
- source posture,
- evidence needed for faithful reproduction,
- blocked claims where chart/source evidence is not yet reconciled.

Do not:

- turn source labels into the product diagnosis,
- hide source-owner approval gaps,
- imply the system has more precise chart data than the source ledger supports.

### `diagnostic_read`

Use when the asset applies the governed Brand Doctor reasoning layer to current data.

Allowed:

- Momentum-first verdicts,
- Ahead/Behind as brand-size adjustment,
- category index as context,
- M/D/S and Perceived Value interpreted together,
- treatment paths to test.

Required:

- evidence basis and proof disclosure,
- blocked overclaims,
- source posture,
- treatment language framed as options to consider or paths to test.

Do not:

- call a brand strong from a single positive lens,
- use source typology labels as the product verdict,
- turn Perceived Value into SKU-level price guidance,
- claim causality without causal evidence.

### `future_extension`

Use when the asset demonstrates web-native value or next-step operations beyond the current PPT deliverable.

Allowed:

- source-owner ask lists,
- proof-gap workflows,
- simulated workflow demonstrations when clearly labeled,
- interactive next questions,
- future source/context lanes.

Required:

- visible caveats,
- replacement/source-owner requirements,
- review state,
- blocked-use language.

Do not:

- present simulated or future-state data as measured current-state evidence,
- imply the static PPT already supports the extension,
- promote future workflow output to pilot/canonical truth without source-owner review.

## Current Implementation

The output mode contract is implemented in:

- `src/lib/intelligence/executive-intelligence-asset-spec.ts`
- `src/data/config/executive-intelligence-asset-page-module-registry.json`
- `scripts/validate-data.mjs`
- `/api/executive-assets?brandId=lay-s`
- `/brand/lay-s/work/cmo-review-intelligence-asset`

Each page module now declares:

- `outputMode`,
- `outputModeRationale`,
- required source modules,
- required proof kinds,
- evidence minimums,
- source posture requirement,
- blocked-claim signal groups,
- evidence-needed signal groups,
- allowed revision types,
- next operation candidates.

## Current Lay's CMO Review Mode Map

| Page | Mode | Reason |
| --- | --- | --- |
| Executive Verdict | `diagnostic_read` | Product interpretation of the current BBE/GN packet. |
| Benchmark Lens Read | `diagnostic_read` | Applies deck doctrine and Kate feedback to benchmark interpretation. |
| Primary Chart Read | `source_recreation` | Recreates/explains the current source-deck chart pattern. |
| Driver Diagnosis | `diagnostic_read` | Interprets M/D/S and Perceived Value through governed rules. |
| Demographic Diagnostic Boundary | `future_extension` | Demonstrates the intended demographic workflow while official cuts are missing. |
| Leadership Questions | `future_extension` | Converts current reads and feedback into next questions/source-owner asks. |
| Treatment Paths To Consider | `diagnostic_read` | Suggests paths to test from the governed diagnostic read and treatment library. |
| Source Readiness And Next Proof | `future_extension` | Converts source gaps into pilot/source-owner work. |

## Core Foundation Rule

The system should be source-faithful before it is impressive.

That means:

- source artifacts are preserved,
- source terminology is allowed only in source context,
- product diagnosis uses governed reasoning,
- future/prototype extensions are clearly labeled,
- every page can show proof, gaps, and blocked overclaims,
- chat/voice should inherit the active output mode before answering about an asset.

