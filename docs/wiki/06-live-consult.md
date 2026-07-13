# Live Consult

Live Consult is the voice-plus-proof experience. The user can sit back, ask questions, and watch the system move through the report.

## What Makes It Work

The experience is not just speech. It combines:

- A brand-scoped voice session.
- Prompt chips for guided voice testing.
- Browser voice fallback.
- A premium doctor presence.
- Allowlisted screen actions.
- Transcript rendering.
- Evidence chips.
- No Magic context.

## Allowed Screen Actions

Live Consult can only control the UI through configured actions in `live-consult-actions.json`.

Examples:

- Open Executive Summary.
- Open Current Diagnosis.
- Open Rule & Evidence Trace.
- Highlight KPI modules.
- Open Prescription & Action Plan.
- Select the top treatment path.
- Create a meeting takeaway stub.

The assistant cannot mutate source data, invent treatments, or bypass deterministic diagnosis logic.

## Guided Prompts

Live Consult includes its own scenario prompts for common executive questions such as the boardroom readout, proof, first treatment path, and decision takeaway.

These prompts are contained inside the voice panel so the main brand report stays product-first rather than presenter-control-first.

## Evidence Chips

Live Consult transcript moments attach chips such as:

- Brand.
- Diagnosis.
- Rule.
- Source.
- Metric.
- Treatment.

This keeps the voice interaction grounded and makes the "prove it" moment visible.

## Voice Key

The OpenAI API key stays server-side. The browser receives a short-lived Realtime client secret from `/api/live-consult/session`.
