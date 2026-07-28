# Home, Plan and Train consistency

Verdict: **PROVEN**

After committed Discard:

- canonical active-plan model has no active recorded-session reference;
- Home status is `ready`, primary kind is `planned`, CTA is `Start workout`, and action targets the original planned-session ID;
- Plan schedule marks that same ID `next`;
- Train projection for the discarded recorded-session ID rejects with `recorded_session_not_found`;
- the restored prescription equals the pre-start prescription;
- restart produces the same result;
- a subsequent explicit start uses the same planned-session ID and creates one clean ledger.

During post-carrier cleanup interruption, the in-memory projections reload the committed carrier and expose the restored planned state while the durable intent remains pending. Restart finishes cleanup without another carrier revision.
