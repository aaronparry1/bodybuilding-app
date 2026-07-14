# Ordinary v2 shadow deployment runbook

Observation is configured only through the exact build-time value `EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION=enabled`. Absence or any other value disables it. Development, preview, and production EAS profiles remain disabled unless an explicitly reviewed build value is supplied; no remote configuration or authority flag exists.

The generation boundary computes production settings first, then passes the same object through the observation seam. Shadow work is bounded to 20ms and failures are swallowed. To stop observation, ship a replacement build with the value absent or non-`enabled`; this is build-time rollback, not an immediate remote kill switch. Confirm events through the existing privacy-safe delivery path, retrieve a bounded real-user window, and evaluate it with the readiness gates. Readiness never activates v2 authority.
