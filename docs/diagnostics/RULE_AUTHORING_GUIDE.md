# Rule Authoring Guide

## Goal

Allow experts to add or change diagnosis logic and treatment mapping without changing application code.

## Diagnosis rule structure

```json
{
  "diagnosisId": "salient_but_generic",
  "name": "Salient but Generic",
  "triggerLogic": {
    "salient": ["strong", "ahead"],
    "different": ["weak", "not_ahead"],
    "pricingPower": ["weak", "not_ahead"]
  },
  "counterSignals": ["Strong GN growth", "Strong Meaningful"],
  "primaryTreatmentFamilies": ["Functional Difference", "Emotive Difference", "Distinctive Brand Assets"]
}
```

## Treatment eligibility logic

Treatments should be linked to diagnoses, but also filtered by:
- prerequisites
- contraindications
- owner availability
- evidence completeness
- time horizon
- cost/effort

## Rule safety

Rules should never:
- make causal claims without evidence
- make SKU-level pricing recommendations from Pricing Power
- infer portfolio migration from BBE alone
- infer occasion substitution unless supported
- declare a brand miscast from one period
