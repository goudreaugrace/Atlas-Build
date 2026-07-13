# DECISIONS.md

## Decision 001 — Single-brand first

We are starting from scratch around a single-brand diagnostic experience. Prior pair-comparison and AIM-run framing is deferred.

## Decision 002 — Brand Doctor metaphor boundary

Brand Doctor can remain the product name and the internal engine can still use diagnostic concepts, but marketer-facing education should not lean on the doctor/patient metaphor. The preferred language is: signal -> strategic read -> evidence lens -> action path to test -> follow-up proof.

Use clinical terms only where they describe internal contracts, legacy product areas, or explicit rule-engine behavior. In Learn, Start Here, and guided cases, prefer brand strategy language such as equity signal panel, BBE read, evidence trail, action path, and action library.

## Decision 003 — Hybrid rules + LLM

Diagnosis and treatment eligibility are rules/config-driven. LLMs explain, interrogate, and translate but do not invent diagnoses or treatments.

## Decision 004 — JSON-first, Supabase-ready

The prototype starts with local JSON but uses data contracts that can later map to Supabase/Postgres.

## Decision 005 — Two audiences

The same system serves brand managers and insights leads through progressive disclosure.

- Brand Manager: marketer-level brand read, plain-English implication, practical action paths to test, follow-up signals, and only the methodology needed to build confidence.
- Insights Lead: evidence ledger, rule trace, benchmark/source definitions, confidence and readiness states, missing evidence, caveats, and provenance.

Audience mode does not change the Brand Health Record, deterministic diagnosis, treatment library, category lens, guardrails, or AI persona. It changes default disclosure depth and language precision. Brand Manager mode should never become vague or unsupported; Insights Lead mode should never hide evidence, rule logic, or limitations.

## Decision 006 — Additive Start Here Merge

The Start Here grounding patch is merged as an additive `/start-here` route plus prominent entry/reminder links from the current diagnostic page. Full route restructuring into `/brands` and `/brand/[brandId]` is deferred so the working single-brand prototype remains stable.

## Decision 007 — Package 2 Merge Strategy

`Patches/bbe_brand_doctor_codex_package 2` is treated as the original full source package and roadmap reference, not a replacement for the current working app. Current app/service/type files are newer, so package 2 is audited and merged conceptually. Missing plan capabilities should be added incrementally through JSON-first services and report sections.

## Decision 008 — GN Vitals As Commercial Vitals

Growth Navigator is shown as a commercial vitals panel, not a full dashboard. When GN bridge data is present, signals map into Proposition, Reach, Resonance, Available & Visible, and Value. When it is absent, the UI shows explicit missing-data states rather than inferring commercial evidence.

## Decision 009 — Deterministic Diagnosis Rules Own Primary Diagnosis

Primary diagnosis now comes from `src/data/config/diagnosis_rules.json` evaluated by `src/lib/diagnostics/engine.ts`. Seeded `BrandHealthRecord.diagnosisIds` remain in the packet as fallback and cross-check evidence, but React components and LLM context should use the computed diagnosis result.

## Decision 010 — Treatment Ranking Is A Service Layer Concern

Treatment ordering is computed in `src/lib/data.ts` from diagnosis-treatment links, treatment definitions, expected metric movement, binding-constraint fit, and foundation-first logic. Components render the ranked options and reasons; they should not manually reorder or prescribe paths.

## Decision 011 — Shareable Routes Stay Additive

`/brands` and `/brand/[brandId]` are additive entry points into the same single-brand Brand Doctor app. `/` remains the working demo route, and the route split does not introduce portfolio comparison or AIM-style run framing.

## Decision 012 — Start Here Chat Is Deterministic For V1

Start Here includes a scoped education helper grounded in `grounding-education-modules.json`. It answers BBE concept questions and misread warnings deterministically for trust, speed, and cost control; LLM-backed education chat is a later evaluation item.

## Decision 013 — AI Personas Are Separate From Audience Mode

Brand Manager and Insights Lead remain audience/depth modes for the product UI. Dialog With Data now has a separate config-driven AI persona selector sourced from `src/data/config/personas.json`, so personality and reasoning posture can change without changing the product view or hard-coding prompt copy in React.

## Decision 014 — Rule Trace Before Rule Editing

The prototype exposes deterministic diagnosis logic through a read-only Rule & Evidence Trace drawer before adding any edit controls. This keeps stakeholder workshops transparent while avoiding ungoverned config mutation. Future editing should create draft changes, validate them, preview impact across brands, and batch/version accepted changes.

## Decision 015 — Brand Conversation And Data Views First

Conversation and data transparency are built first at brand scope through `/brand/[brandId]/conversation` and `/brand/[brandId]/data`. This keeps V1 honest as a single-brand diagnostic system while establishing reusable patterns for later category, market, portfolio, and system-level views.

## Decision 016 — No Magic Citation Standard

AI-facing experiences should label what came from observed data, what came from deterministic/configured logic, and what the AI interpreted or drafted. The first implementation is the conversation page citation panel: Evidence Used, Logic Used, and AI Role.

## Decision 017 — Voice Consult Before Avatar Vendor

The next wow experience should prove a brand-scoped Live Consult with voice, transcript, No Magic citations, and visual page actions before committing to a full video avatar provider. A lightweight doctor presence can create stage value immediately, while Tavus CVI, HeyGen, or another avatar vendor should be evaluated only after the voice-plus-proof contract is working end to end.

## Decision 018 — Live Consult Uses Allowlisted Screen Actions

The Live Consult assistant can only drive the report through JSON-configured, allowlisted actions. It may open sections, highlight KPI modules, open Rule & Evidence Trace, select a ranked treatment path, or draft a meeting takeaway, but it cannot mutate source data, invent diagnoses, create unconfigured treatments, or bypass deterministic rules. This preserves the No Magic principle while making the interface feel conversational and future-facing.

## Decision 019 — BBE Remains The Signal-Reading Spine

Better Brand Equity remains the center of the V1 product and the executive orientation. Connected systems such as Growth Navigator, Mental Availability / CEPs, distinctive assets, physical availability, machine availability, personas, chat, and Live Consult exist to make BBE easier to understand, trust, explain, and act on. They should not be positioned as a replacement framework or a competing master score. Start Here should teach marketers how BBE leads to better brand decisions; connected systems should be introduced as supporting evidence and action lenses around the BBE read.

## Decision 020 — Executive Summary Is A One-Page Decision Brief

The executive summary should prioritize diagnosis, implication, evidence basis, what is working, what to do next, and the KPI strip. Evidence Readiness stays in the summary as a compact trust cue with a clear route to the Evidence Ledger, not a nested mini-report. Detailed available/missing evidence belongs in Insights Lead surfaces, Rule & Evidence Trace, data views, or expandable evidence/provenance areas so the top card remains report-first and action-oriented.

## Decision 021 — Source Ledgers Before Deck Generation

Generated reports, Jarvis canvases, QBR artifacts, and future deck exports should consume governed source ledgers and canonical reasoning objects, not raw PowerPoint files directly. The Q1 2026 United States Snacks automated report is now preserved as raw source material, with `deck-chart-ledger.json` and `bbe_source_data_ledger.json` providing the first prototype-reviewed bridge from deck structure to product data.

This keeps the architecture modular and reusable: a future domain pack can bring different raw data and knowledge rules, but it should still promote raw source material into reviewed source ledgers before outputs or LLM explanations use it. The current ledger is valid for prototype reasoning calibration and report-module design. It is not approved as canonical pilot data until source owners review the underlying BBE export/workbooks and metric mapping.

## Decision 022 — Executive Asset Definitions Live With Page Modules

Named web-native executive assets are governed compositions of proof-backed page modules, not a separate skill catalog.

The source of truth is `src/data/config/executive-intelligence-asset-page-module-registry.json`. It now owns:

- page-module definitions and proof contracts,
- named executive asset definitions,
- module sequences,
- source prompts,
- proof-summary expectations,
- trigger terms for Assistant recommendations,
- source basis,
- and safe page-level copy overrides.

This keeps the architecture clear:

- Agent skills are capabilities.
- Experience templates are larger workspace shells.
- Dynamic views are reusable runtime views.
- Executive asset definitions are named compositions of executive page modules.

Work Shelf starter items, focused work-detail rendering, data validation, and Assistant suggested moves should consume the same executive asset definitions. Do not reintroduce hard-coded executive asset maps in React components, route files, or `brand-work.ts` unless the copy is purely presentational.

Future fresh-generation behavior can promote selected assets into experience templates if needed, but that should be an intentional expansion rather than a duplicate registry.
