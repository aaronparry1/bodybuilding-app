# Executive summary

## Verdict

Adaptive Strength Coach is a substantial local-first React Native product with a coherent canonical programme/workout model and unusually deep deterministic coaching tests. It is not yet cross-platform verified, scientifically validated, or proven fast on current physical devices. [repository-derived; test-derived]

The strongest current property is the protected training lifecycle: retained training gates onboarding, a versioned carrier owns future prescriptions, recorded-session snapshots and events preserve performed work, completion drives one persisted coaching decision/application chain, and Home/Plan/Train share projections. The full suite passed: 396 files, 2,410 tests. [test-derived]

The largest risks are evidence and product-operation gaps:

1. No Android visual/device evidence was found, so parity is unknown despite shared code.
2. Native performance budgets are unmeasured; historical profiler documents explicitly certify none.
3. Persistence is safe-minded but fragmented across one SQLite KV database, at least 24 local repository modules, runtime stores/caches, a sync queue, auth identity and four cloud repository families. Atomicity exists at important boundaries but is not globally transactional.
4. Programme builder/session builder remain production routes backed by a separate custom-programme repository. They do not override the canonical plan, but their product meaning is confusing.
5. The athlete model is mostly current settings + carrier constraints + immutable observations, not a first-class model with provenance, confidence, decay, contradictions and correction.
6. At baseline commit `411d9f6`, the requested 16-file `project_sources/` pack was absent. A later supplied corpus outside the repository enabled inspection of 15/16 exact filenames and 26 page-attributable candidates; source 16 is corrupt. The candidates add definitions and heuristics, not scientifically validated hard rules.

## Authority and evidence counts

| Metric | Result |
|---|---:|
| Mounted post-workout adaptation authorities | 1 [test-derived] |
| Competing post-workout adaptation authorities | 0 [test-derived] |
| UI adaptation authorities | 0 [test-derived] |
| Production-reachable route files | 31 including layouts/index [repository-derived] |
| Local repository modules | 24 [repository-derived] |
| Supplied PDFs at baseline repository path | 0/16 at commit `411d9f6` [directly verified] |
| Later supplied corpus inspectable | 15/16; 1 corrupt [directly verified] |
| Supplied-source candidates approved as hard rules | 0/26 |
| Modern evidence topics with a safe hard-rule basis | few; most support bounded heuristics/explanations [externally sourced] |

## Product direction

Retain the canonical carrier/ledger/CAS architecture, deterministic prescriptions, dark identity and workout-sized controls. First complete Candidate 111's retained-device gate. Then take the smallest safe slice: instrument and certify startup-to-usable, open-workout, set-completion, timer and force-close/resume on one current iPhone and representative Android device, while adding one read-only authority/backup diagnostic contract. No rewrite is justified.

The source supplement should feed a later governed claim registry: retain exact page provenance, attach modern conflicting evidence, keep rights status separate from evidence strength, and promote only neutral bounded policies. Do not ship the PDFs/OCR or recreate commercial programmes.
