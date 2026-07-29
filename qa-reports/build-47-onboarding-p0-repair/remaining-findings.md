# Remaining findings

1. **P0 / NOT PROVEN** — the repaired source has not been installed on a genuine iPhone. The Build 47 binary remains defective.
2. **P1 / PARTIALLY PROVEN** — authenticated remote restore/routing is behavior-tested but was not rendered against an isolated Supabase account.
3. **P2 / PARTIALLY PROVEN** — the loading yield is source- and behavior-proven; the transient loading label was not captured as a rendered frame.
4. **P2 / PARTIALLY PROVEN** — actionable navigation and persistence failure states are tested but were not forced in rendered web execution.
5. **P2 / NOT PROVEN** — old carriers did not persist account ownership. The migration can bind truthfully to the currently restored authenticated session, but cannot reconstruct historical ownership evidence that never existed.

No remaining finding requires changing coaching policy, prescriptions, methods, progression, or dependencies. The next bounded step is a new TestFlight candidate with a new build number, followed by the three genuine-device journeys.

