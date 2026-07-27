# Bodyweight semantic contract

Overall verdict: **UNREACHABLE** for exact weighted/assisted numeric adaptation; **PROVEN** for recording-direction and fail-closed behavior.

| State | Comparable identity | Effective demand | Progression direction | Regression direction | Current result |
|---|---|---|---|---|---|
| Unweighted bodyweight | same exercise, role, method, set structure and loading mode | cannot calculate external force without athlete bodyweight; repetitions remain factual | more exact reps | fewer exact reps | recorded, but P1A holds |
| Weighted bodyweight | unweighted identity plus `weighted_bodyweight`; entered added load is factual | athlete bodyweight + added load, but athlete bodyweight and exact prescribed added load are absent | added load up or reps up | added load down or reps down | numeric coaching unreachable |
| Assisted bodyweight | assisted mode plus exact equipment variant | athlete bodyweight minus assistance only if machine mechanics are known | assistance down or reps up | assistance up or reps down | numeric coaching unreachable |
| Counterweighted machine | exact machine/ratio required | bodyweight minus effective counterweight | counterweight down | counterweight up | ratio not mounted |
| Mixed bodyweight/external | exact external load and athlete bodyweight required | bodyweight plus external load | external load/reps up | external load/reps down | incomplete carrier |

Production currently mounts the load-input semantic: unweighted work records zero, weighted work records positive added load, assisted work records positive assistance, and kg/lb inputs normalize to canonical kilograms. Zero or negative added/assistance values are rejected.

The canonical `bodyweight` load prescription contains only state, loading mode and instruction. It has no prescribed added/assistance amount, rounding increment, athlete bodyweight, measurement time, equipment ratio or effective-demand fingerprint. Therefore:

- bodyweight change with unchanged external load cannot be evaluated;
- assistance greater than bodyweight cannot be detected;
- missing bodyweight cannot be distinguished from unchanged bodyweight;
- assisted-to-unassisted, unweighted-to-weighted and equipment-variant changes must remain incomparable;
- edited completed sets remain factual but cannot create an authorised numeric target.

Receipt behavior: the current numeric decision records `bodyweight_numeric_state_not_mounted`, produces no numeric application intent and cannot produce an applied receipt. The enclosing coaching decision may persist an explicit unchanged receipt, but it has no truthful bodyweight-specific before/after demand fields. A future supported receipt should name “target repetitions”, “added load” or “assistance” explicitly and must reverse the numeric direction for assistance; that wording is a required contract, not current behavior.

Required future contract: a versioned bodyweight demand carrier with measured bodyweight provenance/freshness, load semantic, exact prescribed external/assistance amount, equipment identity/ratio and increment. Until then receipts must say the bodyweight prescription was held because exact numeric demand is unavailable.
