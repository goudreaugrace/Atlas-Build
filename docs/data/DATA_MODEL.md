# Data Model

## Expanded intelligence-layer design

See `docs/data/BRAND_GROWTH_INTELLIGENCE_DATA_DESIGN.md` for the broader PepsiCo Brand Growth Intelligence data blueprint.

The current `BrandHealthRecord` remains the V1 serving contract. The expanded design defines the future source families, canonical facts, serving records, and relationships needed for Growth Availability, Mental Availability / CEPs, Distinctive Assets, Physical Availability, Machine Availability, buyer behavior, treatment outcomes, and portfolio intelligence.

## Core product contract

The central object is `BrandHealthRecord`.

```ts
type BrandHealthRecord = {
  brandId: string;
  brandName: string;
  country: string;
  category: string;
  period: string;
  categoryLens: CategoryLens;
  portfolioRole: string;
  typology: string;
  pricingPower9Box?: string;
  powerShare?: number;
  metrics: Record<string, BrandMetric>;
  trends: Record<string, TimeSeriesPoint[]>;
  occasions: OccasionScore[];
  growthNavigator?: GrowthNavigatorBridge;
  diagnosisIds: string[];
  sourceFiles: string[];
};
```

## Why this contract matters

The UI, chat, diagnosis engine, evidence drawer, and treatment pharmacy should all work from this object. Today it is built from JSON. Later it can be built from Supabase/Postgres without changing the UI contract.

## Included data

- `src/data/processed/bbe_metric_records.json`: full parsed BBE raw records from the two text exports.
- `src/data/demo/brand-health-records.json`: brand-level records derived from raw BBE data.
- `src/data/config/diagnosis-definitions.json`: diagnosis library.
- `src/data/config/treatment-definitions.json`: treatment pharmacy.
- `src/data/config/diagnosis-treatment-links.json`: links between ailments and treatments.
- `src/data/config/visualization-specs.json`: visualization design metadata.
- `src/data/config/dialog-question-library.json`: scoped dialog prompts.

## Future relational model

Tables:
- brands
- markets
- categories
- category_lenses
- source_systems
- source_periods
- metric_definitions
- brand_metric_facts
- brand_health_records_cache
- diagnosis_definitions
- diagnosis_rules
- brand_diagnosis_results
- treatment_definitions
- diagnosis_treatment_links
- treatment_plans
- evidence_items
- llm_runs
- chat_messages
- feedback_events

## Guardrail fields

Every metric should retain:
- source file/system
- period/wave
- benchmark type
- category lens
- ahead status
- momentum status
- caveat where comparison is limited
