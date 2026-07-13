# Restricted D3 calibration programme persistence

Restricted D3 persists the certified calibration programme only for newly created intermediate, four-day, full-gym Upper/Lower plans whose exact mesocycle purpose is `hypertrophy_calibration`. The support gate requires the certified programme family, template family, mapping row, policy identity and certification identity.

Supported plans receive one immutable version-1 D1 specification containing `upper-a`, `lower-a`, `upper-b` and `lower-b`, plus one exact bound microcycle programme reference. Programme, template and prescription-slot IDs are allocated by the caller and passed through D2; policies and hydration never generate identity.

The active-plan container is optional. A plan without it remains an explicit compatibility plan, preserving existing creation, generated settings and workout behaviour. A plan claiming D3 metadata with incomplete, mismatched or dangling data is invalid rather than silently downgraded.

The local repository round-trips the metadata defensively and validates current D3 records. Existing sync payloads carry the optional fields without a new conflict strategy. No latest-version lookup, timestamp identity, block/week mapping or lazy migration is used.

The specification is shadow planning metadata until D4. Session construction continues to use generated exercise settings. No slot mutation API, adjustment writer, exercise selector, exact-target writer, UI authority or dual-write path was introduced. E2E target identity is read-only and resolves through exact D1 programme/template/slot identity; application binding remains deferred to E2E3C.

Next phases are D4 construction read-authority projection, D5 microcycle reference binding and E2E3C application binding. Other programme families and existing plans remain compatibility-only.
