# BBE v7 Spec Review Notes - Extracted Text

Source file: `BBE_v7_Spec_Review_Notes.docx`

# BBE Momentum Intelligence

v7 Spec: Recommended Changes

24 June 2026   ·   Stage: Proof of Concept (pre-pilot)

I went back through the v7 spec against the earlier BBE materials in the folder to see whether anything useful from that work was worth pulling in. Below are the changes I’d recommend, grouped by what to fold into the spec, one to flag for the build, and a few clean-ups. Most are small. Where I’ve suggested wording, treat it as a starting point. Adjust as you see fit. The same recommendations are also marked up as tracked changes directly in the spec, if that’s easier to action.

Proof-of-concept scope. My recommendation is to keep the POC to the US Salty Snacks and Better-for-You data sets, the data Brion already holds and is working with. Broader categories (CSDs, beverages, international, and deliberate data-gap cases) I’d treat as later-phase, not part of the POC.

At a glance


| Recommendation | Where it lands |
| --- | --- |
| Reorder the framework from MDS to SMD | Add to spec |
| Rework §7.3: Momentum × room to grow (not Ahead/Behind) | Add to spec |
| Show the data trended over time | Add to spec |
| Output-quality checks built into the tool | Add to spec |
| Read each brand against the right competitive set | Add to spec |
| Tag each provocation by urgency and horizon | Add to spec |
| A simple brand statement + real trend context | Add to spec |
| Repurpose Ahead/Behind as a size-check | Add to spec |
| Draft → reviewed → published, with version history | For the build |
| Cross-quarter memory of prior reads | Phase 2 |
| Spec clean-ups (naming, numbering, wording) | Clean-up |
| Color-coding across the three benchmark lenses | Confirm |

Add to spec = fold into v7    ·    For the build = build-phase    ·    Phase 2 = deferred    ·    Clean-up = editorial fix    ·    Confirm = check intent

Recommended for the spec

1. Reorder the framework from MDS to SMD

Recommend: Reorder the three equity levers from MDS (Meaningful, Different, Salient) to SMD (Salient, Meaningful, Different) throughout.

Why: “MDS” is Kantar’s own ordering. A core benefit of building this in-house is that we don’t have to accept Kantar’s framing. We can tailor it to our needs. Leading with Salient and ending with Different signals our Principles-of-Growth priorities (mental availability and penetration first, difference last), and matches what the Demand Power algorithm actually rewards: Difference is the least-weighted driver (snacks DP weights are roughly Meaningful 48 / Salient 30 / Different 22).

Keep in mind: The order signals emphasis, not a competitive ranking. The levers still operate as a connected system (§8.3 / §10).

Heads-up: This cascades: every table flips (for example §8.2’s “Green-Yellow-Green” becomes “Green-Green-Yellow”), along with the prototype, configs, system prompt, and checklist. It’s mechanical but everywhere, and means rework for the build team. Best done now, before the POC locks, rather than after.

2. Rework the §7.3 read: Momentum × room to grow

Recommend:  Replace the §7.3 grid’s second axis. Today it crosses Momentum with Ahead/Behind, and Ahead/Behind is just a rank against ~15 brands – useful descriptive stat but not a measure of opportunity. So, a flat brand that sits top-of-panel reads as “Strong but watchful” when it’s going nowhere. Worse, it’s blind to the category itself: a brand can be “Ahead” while its whole category is shrinking, and being ahead in a dying category is not a growth unlock. Keep Momentum as the verdict and swap the second axis for room to grow: penetration headroom, the §9.2 demand-power-share vs market-share gap, and category growth. That last piece catches the dying-category case the rank never could.


|  | Room to grow | Little room left |
| --- | --- | --- |
| Equity Gaining | Open runway. Building where there’s room; keep pushing. | Defend & extend. Winning, but room is tightening; protect it and hunt new growth opportunities. |
| Equity Holding | Untapped. Room is there but equity isn’t converting it; dig into why. | Plateaued, needs new sources of growth. Flat, little room left in its current frame; growth has to come from new categories or occasions. |
| Equity Declining | High upside, high urgency. Losing ground where there’s room; fixable but pressing. | Eroding from a spent position. Losing ground with little room left; re-base or manage down. |

How to read: rows = equity momentum on Demand Power and Perceived Value (95% CI year-on-year). Columns = room to grow, from penetration headroom, the §9.2 demand-power-share vs market-share gap, and category growth.

The two fixed cells: “Holding + Ahead” becomes “Plateaued, needs new sources of growth.” “Declining + Ahead” becomes “Eroding from a spent position.” Nothing reads as healthy unless the brand is gaining or there’s genuine room.

Replaces: This grid replaces v7’s six so-what labels. Keep v7’s wind-down exception and the driver note (name which lever is slipping).

Ahead/Behind’s new job: Out of the headline. It gets one job instead, set out in the Ahead/Behind size-check recommendation below.

Data fallback: Room-to-grow needs penetration and market data, which is patchy (§9.2, §4.3). When we have it → use the grid. When we don’t → lead with Momentum on its own and flag that the opportunity read isn’t available. We do not drop back to Ahead/Behind as a stand-in. That’s the trap being removed.

Net flow: category health → maturity (sets the bar) → momentum (the verdict) → room to grow (the modifier) → so-what. Ahead/Behind sits aside as a size-check, and Difference stays out of the growth read entirely.

3. Show the data trended over time

Recommend: Say explicitly that the read shows how the metrics move across recent quarters, not only as a single-period momentum reading.

Why: Right now the spec expresses change-over-time mainly as momentum (a single year-on-year delta). The Define & Design session asked for a “fluid and cumulative” model where quarterly signals build into a cross-quarter view rather than a one-time data dump. This makes that intent explicit.

Suggested wording (§8 outputs, echoed in §11):

Metrics should be shown cumulatively across available time periods, not just as a single-period momentum reading. Each run should let the user see how Demand Power, Perceived Value, and M/D/S have moved across recent quarters, so quarterly signals build into a cross-quarter view rather than a one-time data dump.

For the POC:  Feed multiple quarters of the exports we already hold (2024–2025 plus Q1’26) as static inputs. No dependency on the live API. Having the tool remember its own prior reads is phase 2; multi-quarter data alone reconstructs the trend.

4. Build the output-quality checks into the tool

Recommend: Build this short, plain-English checklist into the tool as a self-check: the model runs every read against it before producing it. Even better, surface that self-check to the user, so they can see how a read measured up on each point rather than take it on trust. The team uses the same list as its bar. Reused from the earlier work, with the internal jargon stripped out.

Why: The spec sets a quality bar but no practical way to check against it. Building the checklist into the tool gives every read a consistent standard, and showing the self-check to the user makes the quality visible, which feeds the explainability the spec already wants (§12.8). It is deliberately lightweight, so it can be sharpened from real output rather than perfected up front.

Starter checklist. The tool checks each read against these, and shows the user the result:

- Leads with the point. Every section opens with the conclusion or the tension, not a warm-up sentence.
- Interprets, doesn’t narrate. Every paragraph adds a “so what,” rather than restating what the chart already shows.
- Honest about certainty. Causes are written as likely explanations, not stated as fact; confident where the signal is strong, hedged where it is mixed.
- Plain language throughout. No formulas, weights, or p-values; equity in everyday terms (relevance, distinctiveness, mental availability); and value framed as whether people believe the brand is worth paying more for, not actual price.
- A mirror, not a cheerleader. Surfaces the uncomfortable signals and the hard questions instead of smoothing them over.
- Grounded in the category. The brand is always read against its category context, never in a vacuum.
- Grounded in the real brand. Anchored in the brand’s actual positioning and story, not a generic template.
- Right comparison set. Each brand is judged against its own relevant competitors.
- Names a watch-out. Every read surfaces what could go wrong, not just what is going right.
- Ends in a provocation. Findings are framed as sharp questions the team needs to answer, each with a clear “so what” and “now what.”
It’s a starting point, not the finished standard. As the prototype produces real reads, the team can add, cut, and sharpen these based on what actually helps.

5. Read each brand against the right competitive set

Recommend:  Allow a category read to span more than one BBE tracker, with each brand read against its own tracker’s competitive set, and the read reflecting how many peers that set contains.

Why:  The POC data itself, US Salty Snacks plus Better-for-You, spans two trackers with different competitive sets. Blending them would produce misleading ahead / behind reads: being ahead of 7 peers is a different signal than being ahead of 17.

Where:  §4.1 / §8.1; today the spec says “a few whole category groups read together,” with no tracker distinction.

6. Tag each provocation by urgency and horizon

Recommend: Give each provocation a simple sense of urgency, in plain language: act now (needs a response this quarter), watch (an emerging signal to revisit next quarter), or longer-term theme (a bigger strategic question to build on over time).

Why: Without it, every provocation reads as equally urgent and the workshop gets driven by the calendar rather than the signal. The tags keep attention on what’s pressing.

Note: The “longer-term theme” tag is most powerful once provocations can be tracked across quarters (that firms up in phase 2), but the label works in a single read today.

7. Set the scene: a simple brand statement and real trend context

Recommend: Add two light context inputs: (a) a simple brand statement (a sentence or two on what the brand is and its role in the category), and (b) category context drawn from the existing trend learnings (Mintel, Change Compass), rather than placeholder text.

Why: Everything the tool reads is metrics. Without a short brand statement and real trend context, reads drift generic, the opposite of the spec’s “insight-led voice” (§5.7) and its “grounded, not generic” aim (§13.3).

Scope note: This is the lightweight version for the tool, a simple statement, not a full brand foundation (that intake is a separate workstream). Brion’s team can reuse the existing US Salty Snacks config, which already has the brand statements written and the trend structure built; it just needs the real trend learnings wired in rather than the current placeholder text. One heads-up: that config is built around portfolio roles (Growth Engine, Harvest, role-fit). Keep that as portfolio context only, not part of the equity read, per §9.1.

8. Repurpose Ahead/Behind as a size-check

Recommend: Take Ahead/Behind out of the headline and use it for one thing: a size-check on the category index. Read the two together to see whether a high or low index is real equity or just size. The tells are the off-diagonal cases: a high index but “Not Ahead” means it’s flattered by size; a low index but “Ahead” means a small brand punching above its weight. It’s not momentum, not opportunity, and not a verdict on its own.

Recommended for the build

Worth including, but implemented in the build phase. Not needed to stand up the proof of concept.

Draft → reviewed → published, with version history

Recommend: A read moves through a clear draft → analyst-reviewed → published state. The published version is the one that circulates; edits made before publishing are tracked, with a simple record of who published and when.

Why: Insights already works in a “publish” motion. Results get shared and acted on. Having one clearly published version, rather than a half-edited draft going out, keeps the tool a mirror the analyst owns, and makes a generated provocation defensible if a brand team challenges it.

Where: Strengthen §13.5 to name the draft → reviewed → published states; today it only says the output is “editable.” Version history and audit trail are build-phase. The POC only needs today’s edit / regenerate capability.

To confirm, and a few clean-ups

Colour-coding: which metrics carry a traffic light?

How it works today: Across the spec, the Green / Yellow / Red traffic light is fully defined only for Momentum (§7.2). The Ahead flag borrows Green/Red from the tracker (§7.1.2); the Vs-Category index has no rule of its own, yet §7.2 still references a “red vs. category index”; and the §8.2 brand-type targets use green / yellow as required levels. So in practice colour is already applied across all three benchmark lenses, not just one.

The question: Should the traffic light be reserved for Momentum, the metric the spec itself calls “the headline” (§7.1.1) and “the critical alert” (§7.2), or applied across all three lenses, as it is now?

The trade-off: Colouring a single metric puts the emphasis squarely on it; that is the case for reserving the traffic light for Momentum, the verdict. But we already colour all three, consistent and familiar, at the cost of diluting that emphasis and making the context lenses (Ahead and Vs-Category) read like verdicts when they are really context. Worth deciding deliberately rather than by default.

Editorial fixes

- Naming: §4.4 says to retire “Pricing Power” in favour of “Perceived Value,” but the §6.2 and §8.2 tables still say “Pricing Power.” Align the user-facing label (the underlying measure name can stay).
- Numbering: 12.10 and 12.11 are both titled “Integrity and anti-gaming”; 12.11 is actually the cluster view. And the list numbering in 7.1 is out of sequence.
- Consistency: the “don’t state the rule explicitly” / anti-gaming guidance (§8.2, §12.10) sits awkwardly next to the “fully transparent and explainable” requirement (§12.8); worth reconciling.