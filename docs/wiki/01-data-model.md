# Data Model

The central contract is the Brand Health Record. Every major product surface reads from this record or from config-driven services derived from it.

## Brand Health Record

The Brand Health Record contains:

- Brand identity: `brandId`, `brandName`, category, country, period, typology, and portfolio role.
- Category lens: valid uses, invalid uses, and known blind spots.
- Core BBE metrics: Demand Power, Perceived Value, Salient, Meaningful, and Different.
- Metric metadata: value, benchmark band, Ahead status, momentum, source, wave, and slide.
- Trends: lightweight over-time points for selected metrics.
- Occasions: occasion-level memory or association signals where available.
- Growth Navigator bridge: seeded commercial vitals for brands with available GN extracts.
- Source files: the documents or extracts backing the record.

## Config Around The Record

The record does not contain all product logic. The system combines it with config:

- `diagnosis-definitions.json` defines diagnosis meaning and treatment families.
- `diagnosis_rules.json` defines deterministic rule conditions.
- `treatment-definitions.json` defines treatment paths.
- `diagnosis-treatment-links.json` maps diagnoses to treatments.
- `personas.json` defines AI personalities.
- `live-consult-actions.json` defines allowed screen actions.

## Source Period Rule

Every interpretation should preserve the source period. A metric from MAT Q126 should not be described as current market truth outside that period. The app should state when Growth Navigator or momentum data is missing rather than filling gaps.

## Data View

The `/brand/[brandId]/data` route exposes the source packet in a read-only way. It is the best place to inspect the Brand Health Record, metrics, trends, occasions, GN bridge, diagnosis rules, treatment config, and AI context packet.
