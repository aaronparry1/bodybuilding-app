# Historical 452 evidence limit

Verdict: **NOT PROVEN** at individual-opportunity level.

Durable surviving facts:

- total missed opportunities: 452 per historical longitudinal run;
- aggregate reason: `successful_exposure_retained+automatic_numeric_adjustment_not_authorised`;
- scenario totals and the prior mounted/simulation-assisted split.

Not retained:

- the 452 individual completed prescriptions;
- exact per-slot evidence histories;
- individual comparable keys;
- evaluator inputs and timestamps;
- role, method, load and repetition detail for each opportunity;
- individual eligibility verdicts under P1A.

Current source fixtures can create a new deterministic simulation, but that would use current code and reconstructed fixture state. It would not be evidentially equivalent to the historical run and cannot retroactively classify the original 452.

Future certification must emit one immutable opportunity record per evaluator/slot containing evidence IDs, comparable key, eligibility, decision, target identity, before/after state, receipt and reachability classification. This is audit logging only and must not alter production coaching behavior.
