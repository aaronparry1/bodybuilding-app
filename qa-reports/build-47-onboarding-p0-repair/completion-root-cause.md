# Create Programme root cause

## Source failure path

The prior handler set React state and immediately performed synchronous construction/persistence, so “Creating Programme…” was not guaranteed to paint. Its only successful navigation was `router.replace("/(protected)")`, although the mounted app destination is `/(protected)/(tabs)`. Rapid taps depended on asynchronously committed React state. Rejections shared generic wording, and unexpected errors had no bounded diagnostic classification.

An existing user wrongly sent to onboarding could also carry a live attempt. The canonical commit correctly rejects replacing that attempt, but the old screen made that state look like a dead button rather than explaining that the workout must be finished or discarded.

## Correction

- A synchronous submission gate admits one fingerprint at a time.
- The handler yields a frame before construction so loading feedback can render.
- Construction, carrier persistence, owner binding, and onboarding settings form one recoverable user-visible transaction.
- Success targets `/(protected)/(tabs)`.
- If navigation throws after commit, the screen displays “Open Programme”; retrying the same fingerprint opens the committed plan without creating another.
- Failure resets the gate, keeps answers, re-enables retry, and displays an actionable reason.
- Safe diagnostic logging records reason/type without workout or personal content.

Behavioral verdict: **PROVEN**. Loading paint and success navigation were rendered on web. The exact TestFlight/iPhone correction remains **NOT PROVEN** until a replacement binary is installed.

