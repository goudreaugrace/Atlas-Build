# Operator Guide

This prototype is intentionally JSON-first. Most changes should happen in config files, then pass validation before anyone demos the app.

## Common Files

- Brand records: `src/data/demo/brand-health-records.json`
- Diagnosis definitions: `src/data/config/diagnosis-definitions.json`
- Diagnosis rules: `src/data/config/diagnosis_rules.json`
- Treatments: `src/data/config/treatment-definitions.json`
- Diagnosis-treatment links: `src/data/config/diagnosis-treatment-links.json`
- Personas: `src/data/config/personas.json`
- Live Consult actions: `src/data/config/live-consult-actions.json`
- Live Consult scenarios: `src/data/config/live-consult-scenarios.json`
- Wiki nav: `src/data/config/wiki-nav.json`
- Wiki content: `docs/wiki/*.md`

## Safe Update Flow

1. Edit JSON or markdown source.
2. Run `pnpm validate:data`.
3. Run `pnpm typecheck`.
4. Run `pnpm build`.
5. Browser-test the affected route.
6. Update `STATUS.md` and `BACKLOG.md`.
7. Commit and push to the private GitHub repo.

## Config Rule

Diagnosis and treatment logic should come from config and service-layer computation. React components should render computed/configured content, not hide business logic.

## Wiki Exports

The shareable Word and PDF guide is generated from the same markdown files that power `/wiki`.

- Source docs live in `docs/wiki`.
- Navigation and summaries live in `src/data/config/wiki-nav.json`.
- The Word export lives at `public/exports/bbe-brand-doctor-system-wiki.docx`.
- The PDF export lives at `public/exports/bbe-brand-doctor-system-wiki.pdf`.
- Regenerate the Word file with `scripts/export-wiki-docs.py`, then render it to PDF with the document renderer before sharing.

The Word file is meant for team edits, comments, and clarification requests. The PDF is meant for read-ahead sharing when people should not edit the artifact directly.

## What To Avoid

- Do not add Supabase until the JSON-first contract is stable.
- Do not bring back AIM run framing.
- Do not turn the app into a two-brand comparison tool.
- Do not put API keys or local secrets in Git.
- Do not overwrite source data without validation and preview.

## Future Editing Workflow

When config editing is added, it should use:

- Draft changes.
- Impact preview.
- Accept or reject.
- Batch acceptance.
- Version history.
- Rollback/export.
