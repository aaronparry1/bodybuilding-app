# Recommended set guidance repository resolution

E2E2 binds E2E1 through read-only active-plan and workout-session facades. Planned references are filtered only by persisted planned mesocycle, microcycle and session identity, then ordered by identity. The existing active plan has no persisted programme-guidance target container with the complete E2E1 identity, so target lookup remains a required narrow read adapter and returns `target_not_found` rather than guessing.

No write, normalization, range routing, or timing approval occurs here.

The identity/timing audit records the missing persisted target and recommends next-microcycle effectiveness; E2E3 remains blocked pending product-owner approval.
