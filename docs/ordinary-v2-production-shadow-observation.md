# Ordinary v2 production shadow observation

D4E3C4E3C adds an observation-only seam with a distinct disabled policy. It accepts only ordinary primary, secondary, and accessory roles, invokes a bounded injected shadow operation, emits only the privacy-safe boundary event, and always returns the precomputed production value.

No safe deployable observation configuration exists in the current app, so no normal application call site enables the seam. The deployment prerequisite is an approved best-effort event delivery path and a separately managed observation-only configuration. Current readiness remains `insufficient_evidence` until genuine deployed observations exist. v2 authority remains disabled.
