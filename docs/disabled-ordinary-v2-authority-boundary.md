# Disabled ordinary v2 authority boundary

D4E3C4E3A adds an inert internal boundary for the already-certified ordinary family. The default policy is `production_only`; only an explicitly injected test-canary policy with the exact certification and rollback identities can select a wholly translated v2 decision.

The boundary is atomic: any missing fact, unsupported method, stale identity, translation failure, or v2 failure returns the already-computed production decision. No application call site enables it, and no real-user activation, persistence, UI, telemetry, or generated-output change is present. The next phase must separately approve any canary call-site integration.
