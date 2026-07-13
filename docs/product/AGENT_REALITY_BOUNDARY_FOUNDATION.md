# Agent Reality Boundary Foundation

## Purpose

The Brand Assistant and Jarvis experience should feel ambitious, premium, and alive, but they must be precise about what the prototype can actually do today.

This foundation keeps the agent honest without making normal answers sound like governance logs. It gives the assistant a reusable product-truth layer for capability questions, latest/current questions, executive-output language, share/export requests, and missing-evidence moments.

## Runtime Source

The active config is:

```text
src/data/config/assistant-reality-boundaries.json
```

The runtime helper is:

```text
src/lib/intelligence/assistant-reality-boundaries.ts
```

The config is product knowledge, not UI copy. It feeds:

- direct Assistant answers after the high-quality scoped Brand Doctor writer runs;
- Assistant self-introductions and capability explanations;
- approval-work-order language;
- coverage and missing-evidence logging;
- future Jarvis and Brand Work Item output language.

## Capability Buckets

The assistant should describe itself in three buckets:

1. Available today: active-brand answers, proof/gap explanation, source-period disclosure, treatment paths to test, and user-initiated text/voice grounded in the loaded packet.
2. Prototype governed workspaces: approval-gated QBR reads, proof packs, treatment paths, learning paths, and readiness workspaces built from approved skills, templates, and views.
3. Gated or future: official approval, export/circulation, canonical source writes, production certification, autonomous work, enterprise persistence, and continuous/background voice.

## Demo Must-Haves

For the funding demo, do not keep expanding foundation rails. Prove these five things exceptionally well:

- truth boundary core: loaded data, source period, measured/prototype status, available-now capabilities, and gated capabilities;
- excellent Lay's conversation: momentum, CMO read, next actions, proof, and gaps;
- one polished CMO-review output generated from conversation and opened as a durable workspace;
- Jarvis flow: direct answer, approval-gated deeper work, Recent Work shelf, focused output page;
- evidence and gaps confidence: what we know, what we do not know, and what funding/connectivity closes next.

## Language Rules

Use:

- `CMO-review draft`
- `leadership-review workspace`
- `review draft workspace`
- `URL-addressable prototype workspace`
- `official export/circulation remains gated`

Avoid implying:

- CMO-ready, board-ready, final, approved, shareable, or export-ready artifacts;
- live market data when the answer is based on the loaded packet;
- production readiness;
- autonomous work;
- canonical source writes;
- enterprise persistence or official approval.

## Missing Evidence Taxonomy

When users ask beyond the loaded packet, the assistant should answer what it can, then name missing evidence instead of pretending it has the data. The initial logged categories are:

- AI/search visibility;
- owned-site / brand.com analytics;
- media / creative effectiveness;
- sales, share, and penetration;
- Category Entry Point movement;
- distinctive asset linkage;
- official Brand Strategic Context.

## Current Architectural Decision

Keep the validated hybrid:

- Direct answers use the scoped Brand Doctor conversation writer first because it gives the best Lay's momentum and CMO-read quality.
- The reality boundary wraps that answer only when the user asks for latest/current, share/export, executive-ready/final language, capability identity, or outside evidence.
- Heavier work still pauses for approval and becomes a governed work order.
- Jarvis and future premium surfaces should consume this same boundary layer rather than invent their own capability language.
