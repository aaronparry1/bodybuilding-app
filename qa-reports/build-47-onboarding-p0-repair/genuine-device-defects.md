# Genuine device defects

The TestFlight 1.0.15 (47) observations are accepted as authoritative device evidence:

1. An established authenticated user with an active programme was shown onboarding.
2. The future schedule and recent historical frequency appeared to be the same question.
3. Create Programme left the user on the review screen.

These observations establish the user-visible defects, but the device build supplied no branch-level diagnostic log. The exact source defects were therefore established by tracing Build 47 production code and reproducing its state transitions, not by inferring a hidden device exception.

The source repair does not retroactively repair Build 47. No claim is made that the existing TestFlight binary is usable.

## Scope

Changed behavior is limited to:

- auth/account/startup hydration and routing;
- compatibility metadata and account ownership;
- presentation of recent historical frequency;
- onboarding commit, feedback, retry, and destination.

Workout prescriptions, programme volume, progression/regression, method policy, completed history, and release metadata are unchanged.

