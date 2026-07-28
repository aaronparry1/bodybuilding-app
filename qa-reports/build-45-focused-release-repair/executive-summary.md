# Build 45 focused release repair

Verdict: **PARTIALLY PROVEN**

Starting source was `d3a192ab772ba3441bd18c1f1a35af80f426859d`. The bounded production repair is `3c26d5002a103a14121a7a34eb74b67065cbc98d`.

The Discard defect was reproduced as a real process-interruption window: the mutable recorded-session ledger was deleted before the restored planned-session carrier CAS, and no durable transaction record survived a crash between those writes. A durable discard intent now precedes destructive work and contains the exact aggregate required to restore or finish the transaction after restart. The existing contract is preserved: Discard removes the mutable attempt and its evidence/timer, then restores the exact planned workout once.

The current source already had one unambiguous dark/gold workout palette in `src/ui/theme.ts`. The remaining source inconsistency was an incomplete semantic-token migration in Train fallback/paywall and completion summary. Those surfaces now use `workoutColors`. This source inconsistency does not prove why an older installed Build 45 displayed a different palette; that binary-level cause remains **NOT PROVEN**.

Local rendered-web verification exercised a production-reachable planned workout, active workout, close sheet, destructive confirmation, cancel, confirm, navigation, and restored Home state. It observed the canonical dark surfaces, gold active controls, and red destructive control with no browser errors. No genuine iPhone verification was performed.

Automated Discard coverage proves restart convergence, idempotency, immutable completed-history protection, evidence isolation, exact timeline restoration, and Home/Plan/Train agreement. The mounted Train UI does not currently expose an exercise-replacement control, so visual replacement-flow certification is **UNREACHABLE** in this task even though substituted performed-work evidence is safely removed by Discard.

No programme prescription, coaching policy, P0/P1A authority, or release metadata changed. No build, upload, or deployment occurred.
