# Remaining findings

## Exercise replacement UI

- Verdict: **UNREACHABLE**
- Severity: P1
- Evidence: the canonical Train projection supports substitution IDs, but `app/(protected)/(tabs)/train.tsx` has no mounted replacement control or command.
- Consequence: the required replacement interaction and its rendered brand states cannot be certified.
- Scope: separate bounded product task; not silently added to this repair.

## Genuine iPhone visual verification

- Verdict: **NOT PROVEN**
- Severity: P1 release-candidate evidence gap
- Evidence: local rendered web only.
- Consequence: installed TestFlight colour, safe-area, keyboard, modal, and native navigation behavior still require physical-device inspection.

## Build 45 binary-specific colour cause

- Verdict: **NOT PROVEN**
- Severity: P2
- Evidence: current starting source already resolves the mounted Train route to canonical dark/gold values. The fixed token bypasses mapped to the same values.
- Consequence: an earlier compiled bundle, stale update, or older source may explain the report, but repository evidence cannot select among them.

P0/P1A limitations documented by their authoritative certification remain unchanged and were not broadened here.
