# Release readiness

## Decision

- Build 47: **UNSAFE**
- Source repository after repair and certification: **PROVEN** ready to create a replacement TestFlight candidate
- Public release readiness: **NOT PROVEN**
- Deployment authorization: **NOT PROVEN**

The source gate is satisfied by a green full suite, TypeScript, production Expo configuration, web export, zero production-payload findings, and scoped rendered-web evidence. No version/build metadata changed in this task.

Creating a replacement candidate requires:

1. a new iOS build number;
2. production App Store/TestFlight build and upload under separate authorization;
3. installation on a genuine iPhone;
4. verification that an established authenticated account bypasses onboarding with programme/history intact;
5. verification of conditional recent-frequency presentation for a new setup;
6. verification that Create Programme visibly loads, leaves onboarding, and opens the same plan on Home, Plan, and Train;
7. interruption/restart and account-switch smoke checks.

No build, upload, App Store submission, deployment, or release occurred during this repair.

