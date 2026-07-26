# Decision contract

Base schema: `canonical_progress_decision_v1`

Phase 1 details: `canonical_coaching_decision_details_v1`

Every decision persists:

- deterministic decision/operation ID;
- plan, revision, Macrocycle, Mesocycle, and Microcycle;
- evaluation and source evidence IDs/versions;
- source recorded session and immutable prescription hash;
- decision type and stable reason codes;
- reproducible factual evaluation summary: target completion, comparable exposure count, drop-off, recovery state, and transition/deload eligibility;
- prior future-session identities;
- bounded adjustment kind and affected exercise IDs;
- `numericLoadAdjustmentAuthorised: false`;
- explicit change/no-change/blocked result;
- deterministic timestamp from durable completion evidence;
- idempotency key.

Application receipt: `canonical_coaching_application_receipt_v1`

The receipt records applied/unchanged/blocked status, prior/new revisions, exact resulting future-session IDs, and deterministic application time. The read model projects the latest persisted explanation and receipt without becoming coaching authority.
