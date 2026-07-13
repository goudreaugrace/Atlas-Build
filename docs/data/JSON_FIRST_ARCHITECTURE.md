# JSON-First Architecture

## Why JSON first

The prototype needs speed, clarity, and changeability. JSON-first lets the team iterate on:
- diagnosis definitions
- treatment definitions
- visual specs
- dialog prompts
- seeded brand records

without database setup or migration complexity.

## How to avoid throwaway work

Use a provider abstraction:

```ts
interface BrandDataProvider {
  listBrands(): Promise<BrandSummary[]>;
  getBrandHealthRecord(brandId: string): Promise<BrandHealthRecord>;
  getDiagnoses(): Promise<DiagnosisDefinition[]>;
  getTreatments(): Promise<TreatmentDefinition[]>;
}
```

`JsonBrandDataProvider` is v1. `SupabaseBrandDataProvider` is future.

## Rule

React components should not directly know where data comes from.
