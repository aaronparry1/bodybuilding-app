# Performance baseline

## Evidence

No current native interactive timings were measured. Historical profiler reports state that no interactive budget is certified. The audit ran TypeScript and Vitest only; test duration is not app performance. [directly verified; historical report]

Static findings:

- synchronous JSON serialization and SQLite-KV operations occur on the JS path;
- full-history export/aggregation and cloud restore payloads grow with all sessions/events/evidence;
- several screens subscribe to shared plan state, creating render fan-out risk;
- auth/billing/provider lifecycle can introduce network latency before settled state;
- timer design uses absolute timestamps, which is robust against tick drift, but render frequency/native suspension are unmeasured;
- development startup/settings logging exists; production gates most logs.

| Journey | Result/source | Budget proposal |
|---|---|---|
| Cold start to usable local state | unmeasured | p95 <=2.0 s modern supported device; <=3.0 s floor device |
| Warm start | unmeasured | p95 <=750 ms |
| Tab/navigation response | unmeasured | input-to-feedback <=100 ms; settled <=300 ms |
| Open workout | unmeasured | p95 <=500 ms local, no network requirement |
| Complete set | unmeasured | visual/haptic <=100 ms; durable write <=250 ms |
| Timer | test-derived semantics only | display error <=1 s after resume; no cumulative drift |
| Active persistence | test-derived | every material edit durable <=250 ms; restore <=1 s |
| Local DB operations | static | p95 point read/write <=50/100 ms; bounded queries <=200 ms |
| Backup | unmeasured | UI acknowledgement only after queued write; “verified” only after remote readback |
| Stability | unknown | crash-free workout sessions >=99.9%; Android ANR <0.1% |

Required protocol: release-like profiling builds, fixed fresh/100/1,000-session fixtures, cold/warm/repeated runs, one current iPhone and compact representative Android, network offline/slow/normal, memory before/after 20 navigation cycles, render counts for timer and set completion.
