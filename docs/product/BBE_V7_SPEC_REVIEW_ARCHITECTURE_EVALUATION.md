# BBE v7 Spec Review - Architecture Evaluation

## Context

Source reviewed: `docs/source-materials/reference-materials/source-reports/bbe-v7-spec-review/2026-07-01/BBE_v7_Spec_Review_Notes.docx`

Companion extraction: `docs/source-materials/reference-materials/source-reports/bbe-v7-spec-review/2026-07-01/BBE_v7_Spec_Review_Notes.extracted.md`

The document is a tactical set of recommended changes for a BBE Momentum Intelligence v7 proof of concept. It is not a full architecture spec for the newer Brand Growth Intelligence direction, but it is highly compatible with the current architecture if treated as one governed skill and output family inside a broader bottom-up, many-use-case platform.

## Overall Read

Adopt most of the v7 recommendations, but do not let the v7 POC narrow the system back into a single-purpose report generator.

The strongest interpretation is:

- BBE Momentum Intelligence becomes one high-value governed output family.
- Jarvis remains the conversational/orchestration layer that can route many use cases.
- ExperiencePlans and approved dynamic views remain the contract for generating outputs.
- Source materials, canonical facts, Brand Intelligence Packets, evidence ledgers, and review gates remain separate.
- Every output is governed by proof, caveats, source readiness, quality checks, and human review where needed.

In other words: the spec improves the first flagship use case, while the architecture should preserve the "stable brain, flexible surfaces" model already present in the repo.

## Implementation Alignment Checkpoint - 2026-07-01

The accepted interpretation is now current product truth, not a separate `v7` policy layer.

Implemented foundation updates:

- Perceived Value is the user-facing label while Pricing Power remains the source metric lineage.
- SMD ordering, Momentum-as-verdict policy, Ahead/Behind-as-size-check policy, and Pricing Power / Perceived Value guardrails live in shared config.
- `output-quality-standards.json` defines reusable governed-output quality checks for executive reads, treatment recommendations, briefs/stories, evidence reads, and meeting outputs.
- `BrandIntelligencePacket.outputQualityChecks` exposes those checks to Jarvis, Assistant, Data, and governed work artifacts.
- Global treatment definitions remain a platform library; active brand recommendations now carry `recommendationScope`, `globalLibraryRole`, `brandSpecificBasis`, and `evidenceNeeds`.
- Brand Home, Brand Data, dynamic treatment cards, QBR story drafts, and Executive QBR work-detail pages now show treatments as paths to consider and areas to inspect, not autonomous prescriptions.
- Agent evals now protect the packet-level output-quality and brand-ranked treatment contract.

Remaining cleanup:

- Active older report, learning, and support surfaces have been aligned to Perceived Value display language and SMD ordering. Remaining raw `Pricing Power` references should be limited to source metric lineage, source-material preservation, source-keyed config, or guardrail copy that explicitly names the source metric.

## Fit Against The Current Architecture

### Strong Fits

- The spec's POC scope aligns with the current reviewed-local Momentum source packet strategy: use the data we have first, keep source caveats visible, and defer broader category/international/data-gap cases.
- The Momentum x room-to-grow recommendation is already represented by `momentum_room_to_grow_grid`, `RoomToGrowRead`, source packet inputs, and the guardrail that Ahead/Behind must not stand in for opportunity.
- The SMD recommendation is implemented in shared config, active learning content, the base report, Brand Home, Data views, and dynamic views while preserving source-field names where external/Kantar data still arrives in another order.
- The multi-quarter trend recommendation is already partially implemented in `MomentumTrendContext` and source-provided trend evidence support.
- The output-quality recommendation fits the governed runtime pattern, but should be generalized beyond Momentum so every Jarvis-produced artifact gets a visible self-check.
- The urgency/horizon recommendation is already in the `create_growth_provocations` skill and `growth_provocation_list` view contract.
- Draft -> reviewed -> published aligns with existing disabled artifact export/circulation gates, local review queues, review identity manifests, and Brand Work Item shells.
- The "simple brand statement + real trend context" recommendation fits the Brand Strategic Context packet and source-owner handoff model.

### Main Gaps

- Active user-facing surfaces now use `Perceived Value` externally while preserving Pricing Power as the source metric name where source lineage or source-keyed config requires it.
- Current runtime quality checks prove governance mechanics, but they do not fully cover the spec's editorial quality checklist: leads with the point, interprets rather than narrates, mirror not cheerleader, grounded in the real brand, names a watch-out, ends in a provocation.
- Publish/version states exist as gates and shells, but not as a complete artifact lifecycle. Brand Work Items still need saved full runtime snapshots, output-specific renderers, review status transitions, and enterprise persistence before they can be treated as official published outputs.
- Competitive-set logic is present in source packet peer sets, but the regular report and Jarvis answers need to consistently expose peer-set basis and peer count where Ahead/Behind or comparisons appear.
- Color rules remain an open decision. Momentum should remain the verdict color, while Ahead/Behind and vs-category should be displayed as context unless the team deliberately approves traffic-light parity.

## Recommendation-by-Recommendation Evaluation

### 1. Reorder MDS To SMD

Disposition: Adopt, with migration discipline.

Architecture read: This strengthens the mental availability-first stance and matches the current `smd_driver_map` direction. It should be a product-language and view-ordering change, not a new metric model.

Implementation implications:

- Update user-facing metric ordering in reports, Jarvis work outputs, prompts, dynamic views, learning content, and quality checks.
- Preserve source field names and source lineage where external/Kantar data still arrives as M/D/S.
- Add a migration note so "SMD" is clearly an emphasis/order convention, not a claim that the metrics operate independently.

### 2. Replace Momentum x Ahead/Behind With Momentum x Room To Grow

Disposition: Adopt as core to BBE Momentum Intelligence.

Architecture read: This is one of the strongest spec recommendations. It prevents a rank statistic from masquerading as opportunity. It also fits the source-readiness model because room to grow can be available, partial, or missing.

Implementation implications:

- Keep Momentum as the verdict.
- Use penetration headroom, demand-power-share vs market-share gap, and category growth for room to grow where source evidence exists.
- When room-to-grow evidence is missing, show a gap state instead of falling back to Ahead/Behind.
- Keep Ahead/Behind as a size-check only.

### 3. Show Data Trended Over Time

Disposition: Adopt for POC and beyond.

Architecture read: Multi-quarter data is the right first step. Cross-quarter memory of the assistant's prior reads is phase 2 and should remain governed memory, not hidden model memory.

Implementation implications:

- Feed available 2024-2025 plus Q1 2026 exports as static POC inputs where available.
- Keep source-period compatibility and significance caveats visible.
- Treat trend deltas as directional unless source-provided significance exists.

### 4. Build Output-Quality Checks Into The Tool

Disposition: Adopt and broaden.

Architecture read: The spec describes a content-quality self-check. The current runtime quality system is stronger on governance checks than editorial judgment. Both are needed.

Implementation implications:

- Add a content-quality checklist layer for Jarvis outputs and Brand Work Items.
- Keep the check visible as proof, not hidden prompt behavior.
- Apply it to QBR reads, treatment paths, agency briefs, learning paths, meeting takeaways, and source-readiness outputs, not only BBE Momentum reads.
- Keep failed checks as "watch" or "needs review" rather than letting the model silently rewrite facts.

### 5. Read Each Brand Against The Right Competitive Set

Disposition: Adopt.

Architecture read: This is essential for a bottom-up source architecture. Competitive-set membership is source metadata and must travel with the fact.

Implementation implications:

- Every Ahead/Behind or peer comparison should display peer-set basis and peer count.
- Do not blend US Salty Snacks and Better-for-You trackers without tracker-level caveats.
- Comparison outputs should use approved peer-set context and continue avoiding cannibalization or migration claims without measured evidence.

### 6. Tag Each Provocation By Urgency And Horizon

Disposition: Adopt.

Architecture read: This fits the existing growth provocation and treatment planning surfaces. It also helps Jarvis distinguish urgent action from monitoring and longer-term learning.

Implementation implications:

- Use `act_now`, `watch`, and `longer_term_theme` in structured outputs.
- Tie urgency to evidence strength, trend severity, data freshness, and decision horizon.
- Keep labels plain-English in the UI.

### 7. Add Simple Brand Statement And Real Trend Context

Disposition: Adopt with source caveats.

Architecture read: This is exactly what Brand Strategic Context packets are for. The key is to keep portfolio role, brand statement, positioning, and trend context separated from the equity diagnosis.

Implementation implications:

- Use approved or reviewed-local Brand Strategic Context where available.
- If context is prototype-only, label it as such.
- Do not infer official brand strategy, annual objectives, or creative platform from metrics.

### 8. Repurpose Ahead/Behind As A Size-Check

Disposition: Adopt.

Architecture read: This should become a persistent guardrail in report copy, Jarvis answers, learning content, and quality checks.

Implementation implications:

- Remove Ahead/Behind from headline verdict language.
- Use it to interpret whether category index may be flattered or suppressed by brand size.
- Keep it out of opportunity sizing unless paired with proper room-to-grow source data.

### 9. Draft -> Reviewed -> Published With Version History

Disposition: Accept as build-phase architecture, not POC blocker.

Architecture read: This is crucial for governed outputs across any use case. It should attach to Brand Work Items and artifacts, not only BBE Momentum reads.

Implementation implications:

- POC can keep edit/regenerate plus review-required labels.
- Next stage should add artifact lifecycle states, version history, reviewer identity, saved runtime snapshots, and publish/circulation gates.
- Export/share should remain disabled until artifact readiness and approval policy clear.

### 10. Cross-Quarter Memory Of Prior Reads

Disposition: Defer to phase 2.

Architecture read: The current system should reconstruct trend from source data first. Assistant memory should be reviewed, auditable, and reversible.

Implementation implications:

- Keep prior-read memory out of canonical facts.
- Use reviewed memory only as working context until enterprise persistence and memory governance mature.

### 11. Color-Coding Across Benchmark Lenses

Disposition: Confirm before implementation.

Architecture read: The safest product stance is to reserve verdict color for Momentum and use quieter context treatments for Ahead/Behind and vs-category. If all three are colored, the UI must label which lens is verdict versus context.

Implementation implications:

- Avoid making context lenses look like final health verdicts.
- Update `color_coding_rules.json` only after the product decision is explicit.

### 12. Editorial Cleanups

Disposition: Adopt.

Architecture read: These are small but important trust fixes.

Implementation implications:

- Use `Perceived Value` as the user-facing label for the Pricing Power source metric.
- Reconcile anti-gaming language with explainability: show enough rule logic, source basis, and caveats for trust without exposing implementation in a way that encourages score-chasing.
- Fix duplicated numbering/titles in the source spec if the spec itself is revised.

## Architecture Risks To Watch

- POC scope risk: The spec's US Salty Snacks and Better-for-You focus is fine for source readiness, but the prototype still needs at least six demo brands and should not remove broader demo coverage.
- Use-case narrowing risk: BBE Momentum should not become the only Jarvis work order. It is the flagship proof path inside a general governed output system.
- Output authority risk: Generated reads should remain draft/review-required until publication workflow, reviewer identity, and circulation policy are implemented.
- Evidence inflation risk: Source documents, trend context, and brand statements can explain a read, but they cannot become canonical facts without review.
- Color-verdict risk: Traffic lights can overstate certainty if context lenses look like final outcomes.

## Priority Implementation Backlog From This Review

1. Continue policing new surfaces so Perceived Value remains the display label while Pricing Power remains source lineage only.
2. Add a visible content-quality self-check for governed outputs, distinct from runtime governance checks.
3. Ensure peer-set basis and peer count appear wherever Ahead/Behind or comparisons are used.
4. Add Brand Work Item lifecycle states: draft, reviewed, published, with version metadata.
5. Extend output-specific renderers for QBR read, proof pack, treatment path, learning path, agency brief, and source-readiness check.
6. Make color-lens policy explicit before changing benchmark coloring.

## Bottom Line

The updated spec is directionally right. It sharpens the BBE Momentum flagship use case and reinforces the exact governance posture the larger architecture needs: source-aware, evidence-visible, cautious about overclaiming, and human-reviewed before circulation.

The architectural decision is to absorb these recommendations as reusable rails for Jarvis-governed outputs, not as a one-off report spec. That keeps the product open to many future use cases while making the first one much more credible.
