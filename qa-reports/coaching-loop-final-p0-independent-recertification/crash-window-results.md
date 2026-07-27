# Crash-window results

Verdict: **PROVEN**.

Thirteen durable transaction states were fault-injected or replayed. Thirteen
converged; zero remained pending without a truthful outcome.

The exact post-CAS/pre-receipt case retained the committed future carrier,
restarted, recalculated the actual delta against the persisted pre-carrier,
persisted one applied receipt and terminalised the work item. A second restart
did nothing and the carrier revision remained fixed.

The pre-CAS case retained prepared intent and unchanged pre-state, then
committed one revision after restart. Missing intent and newer/conflicting
carriers failed closed without rolling back completed history or attempting a
second mutation.

Generated-group identity no-ops do not prepare intent, so receipt
reconstruction cannot turn them into applied results.
