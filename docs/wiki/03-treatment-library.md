# Treatment Library

The treatment library is the pharmacy. It provides treatment paths to consider or test after the diagnosis is established.

## Treatment Definitions

Treatment definitions live in `treatment-definitions.json`. Each treatment includes:

- Name and family.
- Tier.
- Time to impact.
- Cost.
- Difficulty.
- Likelihood.
- Owners.
- Dependencies.
- Expected metric movement.
- Follow-up signals.

## Diagnosis Links

`diagnosis-treatment-links.json` maps diagnoses to treatment paths. The link explains why a treatment fits a diagnosis and when not to use it.

## Ranking

Treatment ranking is computed in the service layer. The ranking considers:

- Diagnosis-treatment link priority.
- Treatment config.
- Expected metric movement.
- Likelihood.
- Binding-constraint fit.
- Foundation-first logic.

React components do not manually prescribe or reorder treatments. They render the ranked options and reasons.

## Prescription Language

Treatment language should remain careful:

- Say "options to consider."
- Say "paths to test."
- Say "draft plan."
- Do not say the system has made the final prescription decision.

The human brand and insights team owns the prescription decision.

## Follow-Up Signals

Follow-up signals connect treatment paths back to proof. They tell the team what to watch next quarter and over six to twelve months.
