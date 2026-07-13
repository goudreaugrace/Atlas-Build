# System Overview

BBE Brand Doctor is a single-brand diagnostic prototype for brand managers and insights leads. It treats the brand as the patient, BBE and Growth Navigator as the test results, deterministic rules as the doctor, and the treatment library as the pharmacy.

Better Brand Equity is the diagnostic spine. Connected systems such as Growth Navigator, Mental Availability / Category Entry Points, distinctive asset evidence, physical availability, machine availability, personas, chat, and Live Consult help explain, challenge, and action the BBE read. They should not be treated as a replacement for BBE or as a competing master framework.

The product journey is intentionally sequenced:

1. Start Here
2. Find My Brand
3. Brand Health Panel
4. Current Diagnosis
5. Why We Believe It
6. Root Cause Explorer
7. Dialog With Data
8. Treatment Pharmacy
9. Prescription & Action Plan
10. Follow-Up Signals

The core principle is belief before prescription. A user should understand the health record, believe the diagnosis, inspect the evidence, and only then consider treatment paths to test.

## Who It Serves

- Brand managers need a clear read, practical implications, and treatment paths.
- Insights leads need evidence depth, rule trace, caveats, source periods, and guardrails.
- Stakeholders need the system to explain itself without becoming a black box.

## What It Is Not

- It is not a two-brand comparison tool.
- It is not AIM run orchestration.
- It is not Supabase-backed yet.
- It is not SKU-level pricing guidance.
- It is not cannibalization, substitution, portfolio migration, or causality proof.

## Current Prototype State

The current app is JSON-first. Brand records, diagnosis definitions, rules, treatment definitions, treatment links, personas, prompts, and Live Consult actions all live in local config or data files. React components render. Services compute. Config defines.
