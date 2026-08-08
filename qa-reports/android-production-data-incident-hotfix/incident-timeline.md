# Incident timeline

- 2026-08-04 18:18 Europe/London: versionCode 109 reached production; Play later showed 100% rollout.
- Before 2026-08-07 repair checkpoint: first tester reports were received; the exact first-report timestamp was not independently recorded.
- 2026-08-07: retained-data/startup/programme repair committed as `7c238b04`; Candidate 110 built and submitted to Alpha.
- 2026-08-08: Alpha showed Candidate 110 serving/available, but no real-device smoke result was available.
- 2026-08-08: shipped Supabase authority restored; schema inventory showed required tables but zero remote training records.
- 2026-08-08: production schema hardening migration deployed; Candidate 110 backup acknowledgement defect found.
- 2026-08-08: Candidate 111 source checkpoint `27ea0674` prepared and automated gates passed; build initiated.

Earliest safe promotion path: Candidate 111 artifact validation → Alpha submission/review → in-place retained-data smoke on an enrolled existing user → controlled production rollout.
