# Conflicts and competing authorities

## C1 — Canonical evidence writer versus evaluator contract

- Severity: P0
- Conflict: actual evidence contains performed work/completion totals; v2 evaluation waits for caller-authored transition/deload booleans.
- Production path: Train → recorded-session application → evidence repository; evaluator is unmounted.
- Affected: all users after completed training.
- Consequence: stable, improving, stalled and poor-recovery athletes converge on no future change.
- Confidence: high.
- Direction: introduce a mounted factual interpretation owner that derives bounded evaluations from actual evidence and approved policy.
- Code change: yes.
- Insufficient evidence: no.

## C2 — Construction load key/provenance mismatch

- Severity: P0
- Conflict: `resolveCanonicalConstructionFacts` writes slot-keyed loads with no `loadEvidence`; Session Construction requires exercise-keyed load plus evidence.
- Production path: any decision/duration reconstruction.
- Affected: calibration-first users.
- Consequence: future load remains calibration-required or unavailable.
- Confidence: high.
- Direction: versioned exercise-scoped calibration facts with freshness/comparability and unit provenance.
- Code change: yes.
- Insufficient evidence: no.

## C3 — Persisted source labels versus empty reconstructed facts

- Severity: P1
- Conflict: carrier references claim settings limitations/preferences and Progress history sources; resolver returns `limitations: []`, `history: []`, no preferences.
- Production path: reconstruction after duration/decision application.
- Affected: users with constraints or learned preferences.
- Consequence: regenerated future sessions can violate or forget prior personalization.
- Confidence: high.
- Direction: retain validated construction facts or resolve them from real versioned stores; fail closed if unavailable.
- Code change: yes.
- Insufficient evidence: no.

## C4 — Full-gym engine capability versus onboarding truth

- Severity: P1
- Conflict: equipment materially changes exercise selection, but onboarding hardcodes all equipment.
- Production path: onboarding framework probes and commit.
- Affected: home/limited-equipment users.
- Consequence: a valid canonical programme can prescribe unavailable equipment.
- Confidence: high.
- Direction: collect equipment capabilities or explicitly label a full-gym-only product constraint.
- Code change: yes.
- Insufficient evidence: no.

## C5 — Immutable substitution schema versus absent mounted author

- Severity: P1
- Conflict: ledger/projections support substitutions and learned preferences, but Train has no swap UI/command path.
- Production path: Train.
- Affected: users unable or unwilling to perform a selected exercise.
- Consequence: the advertised substitution/individual-learning capability is not executable.
- Confidence: high.
- Direction: add canonical suitability-preserving substitution through the existing ledger, then derive a bounded preference record.
- Code change: yes.
- Insufficient evidence: no.

## C6 — Registered legacy programme routes

- Severity: P2
- Conflict: protected layout registers a legacy programme/session repository surface alongside the canonical active plan.
- Production path: deep link or direct route.
- Affected: users reaching those routes.
- Consequence: “Start Session” can imply authority without a canonical session.
- Confidence: high.
- Direction: prove callers/deep links, then remove or make the routes explicitly non-executable previews.
- Code change: yes.
- Insufficient evidence: caller provenance is incomplete; direct route registration is proven.

## C7 — Initial personalization versus longitudinal learning

- Severity: P0
- Conflict: initial input differences produce material plans, but actual later performance differences do not.
- Production path: entire post-completion loop.
- Affected: all long-lived users.
- Consequence: “coach in your pocket” becomes a static generator plus logger.
- Confidence: high.
- Direction: close the loop before adding breadth.
- Code change: yes.
- Insufficient evidence: no.
