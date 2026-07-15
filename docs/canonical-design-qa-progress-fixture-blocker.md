# Canonical Design-QA Progress fixture migration blocker

The remaining 34 Progress/decision fixtures have a canonical evidence repository and a canonical evaluator, but the repository has no canonical decision producer that turns an evaluation into a validated `CanonicalProgressDecision` and persists it through `canonicalProgressDecisionRepository`.

The application boundary can apply an existing decision with `canonicalActivePlanState.applyProgressDecision`, but it cannot honestly manufacture the decision, successor identity, transition, deload, continuation, review, or recommendation outcomes required by these fixtures. The existing Design-QA Progress dispatcher therefore remains unchanged in this phase; removing it would either lose meaningful coverage or introduce fabricated authority.

The next implementation must add the missing canonical decision-production owner (including approved successor resolution and evidence-chain validation) before any Progress fixture can be migrated or the final Design-QA matrix deleted.
