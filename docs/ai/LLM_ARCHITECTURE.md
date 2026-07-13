# LLM Architecture

## Principle

The LLM is not the diagnostic engine. The diagnostic engine is rules + evidence + treatment configuration. The LLM is the translator, interrogator, and explainer.

## Modes

### 1. Explain Diagnosis

Input:
- BrandHealthRecord
- DiagnosisDefinition
- Evidence items

Output:
- plain-English explanation
- what supports it
- what complicates it
- what not to conclude

### 2. Dialog With Data

Input:
- user question
- active brand
- active visual
- evidence ledger
- diagnosis/treatment config

Output:
- direct answer
- evidence basis
- caveat or missing-data statement
- suggested next question

### 3. Compare Treatments

Input:
- diagnosis
- treatment options
- constraints

Output:
- ranked treatment options
- tradeoffs
- foundation-first recommendation

### 4. Challenge the Read

Input:
- diagnosis and evidence

Output:
- what could be wrong
- strongest counter-signal
- missing data
- what not to conclude

## Guardrails

- Do not invent data.
- Do not invent treatments.
- Do not invent diagnoses.
- Do not claim causality.
- Do not issue final prescriptions.
- Do not provide SKU pricing guidance from Perceived Value.
- Do not infer portfolio migration or cannibalization.

## Mock-first behavior

The included `/api/chat` route can return mock responses. Codex may wire to an approved LLM later, but must preserve the same scoped inputs and response schema.
