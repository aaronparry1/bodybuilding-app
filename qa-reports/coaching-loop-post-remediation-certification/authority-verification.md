# Authority verification

## Result

- Mounted automatic post-workout adaptation authorities: **1**
- Competing mounted authorities that can change the same future prescription: **0**
- Verdict: **PROVEN**

`orchestrateCanonicalPostWorkoutAdaptation` has one executable importer outside its own module: `canonical-recorded-session-application.ts`. The mounted Train route reaches it only through durable planned-workout completion.

`canonical-home-commands.ts` and `canonical-recommendation-actions.ts` expose explicit command boundaries, but repository caller tracing found no mounted UI invocation that independently mutates the same post-workout future prescription. Design-QA and tests are not production authorities. Settings duration change, onboarding creation, restore/reconciliation, and cloud transport have different commands and ownership.

## Authority ownership

- Progress: persisted evidence, evaluation, decision, attempt/receipt coordination.
- Mesocycle/Microcycle: bounded cycle policy and successor constraints.
- Session Construction: exact future exercises, slots, sets, reps, load state, rest, and methods.
- Active-plan application: CAS and atomic carrier coordination.
- UI: presentation and command dispatch only.

## Legacy/shadow participation

No legacy, ordinary-v2, Design-QA, test-only, or shadow evaluator participates in the mounted v3 post-workout path. Older exported evaluators remain repository surfaces but are not invoked by this completion chain.

## Finding AV-01

- Severity: P2
- Exact evidence: registered older product surfaces exist, but source caller proof finds no invocation into the v3 completion chain
- Production path: separate/unmounted
- Affected configurations: none in mounted post-workout completion
- Consequence: maintenance and future deletion burden, not competing prescription authority
- Confidence: high
- Verdict: PROVEN isolated
- Remediation direction: retain or delete only under separate caller-proof tasks
- Production code change required: no for this certification
