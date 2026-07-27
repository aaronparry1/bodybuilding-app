# Longitudinal results

The 12-week window is an observation window only.

The requested fresh two-run, 12-scenario per-opportunity replay is **NOT PROVEN**. The historical artifact contains aggregate totals but no executable per-opportunity result stream, and six scenarios depended on simulated facts unavailable to mounted production. This certification does not relabel those simulations as production evidence.

What is freshly proven:

- repeated mounted success creates bounded numeric progression;
- repeated mounted comparable failure creates bounded numeric regression;
- evidence and decisions persist through restart;
- receipt replay is idempotent;
- projected committed identity remains consistent.

What remains: a durable isolated-process longitudinal runner that emits every opportunity for all production-mounted contexts, plus separate simulation-only results for unavailable facts.
