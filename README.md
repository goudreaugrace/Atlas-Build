# BBE Brand Doctor

PepsiCo internal prototype for deep brand-equity diagnosis, evidence-backed explanation, and treatment-path planning.

Better Brand Equity is the diagnostic spine. Growth Navigator, Mental Availability / CEPs, Growth Availability, Pattern Radar, AI chat, and Live Consult are support lenses that help explain the BBE read and move toward better marketing action. They do not replace BBE or create a new master framework.

## Product Model

The brand is the patient. BBE and Growth Navigator data are the test results. The deterministic diagnosis engine is the doctor. The treatment library is the pharmacy. The brand and insights team makes the prescription decision.

The core principle:

> Data calculates. Rules diagnose. Treatments are configured. LLMs explain, interrogate, and translate. Humans decide.

## Current Prototype State

- Next.js App Router + TypeScript.
- Local JSON-first data model centered on `BrandHealthRecord`.
- 30 demo Brand Health Records across Snacks and Better-for-You Snacks.
- Product IA follows "one brand home, one intelligence agent, many durable outputs."
- `/` is the solution home, `/brand/[brandId]` is the brand command home, and `/brand/[brandId]/report` preserves the original diagnostic report.
- Deterministic diagnosis rules loaded from JSON config.
- Governed treatment definitions and diagnosis-treatment links loaded from JSON.
- Six-section brand report IA:
  - Executive Decision Brief.
  - BBE Bloodwork.
  - Diagnosis And Evidence.
  - Explanation Lenses.
  - Pattern Radar / Portfolio Pattern Context.
  - Treatment Path To Test.
- Brand Manager and Insights Lead audience modes.
- Rule & Evidence Trace drawer for No Magic diagnosis inspection.
- Scoped Dialog With Data and brand conversation page.
- Product-facing Brand Assistant at `/brand/[brandId]/assistant`, using the high-quality scoped Brand Doctor writer for direct answers plus governed proof/gaps/work planning.
- Agent Reality Boundary foundation through `assistant-reality-boundaries-v1`, keeping capability, latest/current, CMO-review, share/export, and missing-evidence language consistent and honest.
- Premium Jarvis Preview at `/brand/[brandId]/jarvis`, reusing the same Assistant brain, approval gates, event stream, governed work runtime, and recent-work shelf.
- Brand Work Item shelf/detail routes at `/brand/[brandId]/work` and `/brand/[brandId]/work/[workId]`, with prototype-local persistence through `/api/brand-work`.
- Web-native executive asset foundation for slide-quality, URL-addressable work outputs. The Work Shelf now exposes a governed CMO Review Intelligence Asset plus PPTX-derived showcase assets such as Primary MDS Dashboard Read, Benchmark Lens Explainer, Category Position Read, Momentum Over Time Read, Driver Relationship Map, Perceived Value Guardrail, Brand Jobs To Be Done, Demographic Diagnostic Boundary, and Leadership Provocation Questions.
- Named executive assets are governed in `src/data/config/executive-intelligence-asset-page-module-registry.json`; Work Shelf, focused work-detail rendering, validation, and Assistant suggested moves all consume those definitions instead of duplicating asset logic in React or route code.
- Live Consult panel with Realtime voice path, guided prompts, evidence chips, and allowlisted screen actions.
- Brand data view with source packet tabs and Knowledge Graph inspection.
- Agent Lab Brand Growth Command Center at `/agent-lab` with governed Talk or Type, Push To Talk, approved work orders, dynamic workspaces, proof rails, and chained OpenAI Voice Reply.
- Cross-brand `/portfolio` Pattern Radar.
- `/start-here`, `/learn`, and `/wiki` education/reference surfaces.

## Key Routes

```text
/                         Main prototype entry
/brands                   Brand picker
/brand/lay-s              Lay's brand command home
/brand/lay-s/report       Preserved Lay's diagnostic report
/brand/lay-s/assistant    Product-facing Assistant
/brand/lay-s/jarvis       Premium Jarvis Preview
/brand/lay-s/work         Brand Work Item shelf
/brand/siete              Siete brand command home
/brand/cheetos            Cheetos brand command home
/brand/[brandId]/conversation
/brand/[brandId]/data
/brand/[brandId]/work/[workId]
/agent-lab
/portfolio
/start-here
/learn
/wiki
/avatar-test
```

## Demo Brand Guidance

Lay's is the recommended primary recording brand when the story is "a large iconic brand can still need a disciplined equity read."

- Diagnosis: Strong but Slipping.
- BBE read: Demand Power, Meaningful, and Salient are very strong, but Demand Power and Meaningful are declining.
- Pricing Power and Different are not ahead, creating a useful caution around value and distinctiveness.
- GN provenance: measured partial workbook extract from US Savory Q1 2026.

Good alternate demo brands:

- Siete: strongest for a growth-brand / underbuilt-equity story.
- Cheetos: strongest if the demo needs fuller measured Growth Navigator support.
- Tostitos: useful for price-value and measured GN storytelling.

## Recommended Recording Flow

1. Start at `/`.
   Frame the solution: choose a brand, understand equity health, ask the intelligence agent, and turn approved requests into durable workspaces.
2. Open `/brand/lay-s`.
   Use the brand command home to show the current read and the main paths: Report, Assistant, Jarvis, Data, and Work.
3. Open `/brand/lay-s/report`.
   Show the trusted diagnostic report, evidence, rule trace, and treatment path.
4. Open `/brand/lay-s/assistant`.
   Ask `Tell me about Lay's momentum.` and `What would I tell the CMO?` to prove the conversation brain is strong and human.
5. Ask `What can you do?`.
   Confirm the assistant explains available today, prototype governed workspaces, and gated/future capabilities.
6. Ask for a meeting prep/proof output.
   Confirm the assistant pauses for approval when work needs to be created and labels the output as a review draft with official export/circulation gated.
7. Open `/brand/lay-s/jarvis`.
   Show the premium interaction layer: same brain, immersive command surface, approval-gated work, recent work shelf, and focused output path.
8. Open `/brand/lay-s/work`.
   Show that generated and starter work becomes URL-addressable and inspectable instead of disappearing in chat.
9. Open `/brand/lay-s/work/perceived-value-guardrail` or `/brand/lay-s/work/benchmark-lens-explainer`.
   Show the web-native executive asset pattern: slide-level focus, proof drawers, blocked overclaims, source posture, and smart follow-up prompts.

Current testing note: the foundation, Assistant, Jarvis flow, truth boundaries, work persistence, BBE/AIM reading-artifact UI, and first executive asset showcase set are functioning well. This is a good pause point. The next highest-value work is user-testing the showcase assets, then choosing either a small cleanup slice or the next asset/ask-this-asset phase.

## Evidence Caveats

- Growth Navigator coverage is complete for demo purposes, but evidence tiers differ:
  - Cheetos and Tostitos have measured full extracts.
  - Eight US savory brands, including Lay's, use measured partial workbook extracts.
  - The remaining brands use clearly labeled synthetic GN assumptions.
- Mental Availability / CEP and Growth Availability demo packets are prototype support evidence unless replaced by measured sources.
- Diagnosis rules are deterministic and config-driven, but still a prototype ruleset pending stakeholder calibration.
- Treatments are options to test, not final commands.
- Pricing Power is broad brand-equity price justification, not SKU-level pricing guidance.
- The category lens must stay visible and caveated.
- Do not claim causality without causal evidence.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Optional voice reply config for Agent Lab:

```bash
OPENAI_API_KEY=...
OPENAI_TTS_ENABLED=true
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=marin
OPENAI_TTS_SPEED=1.12
```

Optional Realtime voice config for the product-facing Brand Assistant:

```bash
ASSISTANT_REALTIME_ENABLED=true
ASSISTANT_REALTIME_MODEL=gpt-realtime
ASSISTANT_REALTIME_VOICE=marin
```

`/brand/[brandId]/assistant` uses OpenAI Realtime as the primary user-initiated voice shell when available. The Realtime agent calls the same `/api/assistant` brain used by typed input before answering or requesting approval for governed work. Chained OpenAI TTS/browser speech remains the fallback path. Wake-word capture, background listening, autonomous speaking, production voice governance, and enterprise transcript storage remain out of scope.

## Verification

```bash
pnpm validate:data
pnpm typecheck
pnpm eval:mlv
pnpm eval:agent
pnpm build
```

Current validation covers brand records, diagnosis config, treatment config, brand assets, learning modules, personas, Live Consult actions/scenarios, agent skills, dynamic views, experience templates, the MLV checkpoint path, artifact readiness, voice orchestration readiness, persistence readiness, review identity policy, runtime surfaces, source handoff requirements, growth availability, mental availability, wiki pages, and exported wiki artifacts.

Latest checkpoint validated: `npm run validate:data`, `npm run typecheck`, `AGENT_EVAL_BASE_URL=http://127.0.0.1:3000 npm run eval:assistant`, `npm run build`, `git diff --check`, route smoke for Work Shelf and focused asset pages, and targeted Assistant API smoke for the Perceived Value Guardrail suggested move. Checkpoint commit: `6377bc9d Centralize executive asset definitions`.

## Repository Map

```text
app/                         Next.js routes and main report client
src/lib/data.ts              JSON-backed service/computation layer
src/lib/diagnostics/engine.ts Deterministic diagnosis evaluator
src/data/demo/               Demo Brand Health Records and support packets
src/data/config/             Diagnoses, treatments, rules, personas, prompts, learning, wiki nav
src/data/config/executive-intelligence-asset-page-module-registry.json
                             Executive asset page modules and named asset definitions
src/components/              Report-adjacent feature components
docs/design/                 UI and IA specs
docs/product/                Product strategy, roadmap, learning strategy
docs/wiki/                   System Wiki source pages
docs/process/                Runbook and operating notes
schemas/                     Brand Health Record schema
scripts/                     Validation and export scripts
```
