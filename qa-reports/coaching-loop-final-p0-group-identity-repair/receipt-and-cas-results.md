# Receipt and CAS results

Verdict: **PROVEN** for the repaired generated-identity path.

Production-reachable probe:

`completed workout → factual evidence → decision → Session Construction → material comparison → application`

When only generated group identity differs:

- comparison is `unchanged`;
- material deltas are empty;
- no application intent is persisted;
- carrier CAS is not invoked for a coaching change;
- the receipt is v2 `unchanged / explicit_no_change`;
- prior and resulting receipt revisions are equal;
- explanation says the future prescription is materially equivalent;
- replay returns the already-persisted unchanged receipt;
- repeated replay does not alter the carrier.

When grouped meaning is genuinely changed, the existing prepared-intent,
carrier-CAS and v2 receipt path remains active and retains exact field-level
before/after deltas. Existing post-CAS reconciliation tests remain green.

When membership is genuinely ambiguous, application persists a typed
`blocked_no_change` state requiring
`unambiguous_grouped_method_prescription_semantics`, with
`canonical_construction_facts_persisted` as the reevaluation event. It creates
no material application.
