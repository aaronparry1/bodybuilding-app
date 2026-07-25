# Evidence register

## Repository evidence

| ID | Evidence | What it proves | Confidence |
| --- | --- | --- | --- |
| R1 | `app.config.ts` production router resolution | `app-production` is the audited production entrypoint | High |
| R2 | `app-production/(protected)/**` re-exports | Repaired shared routes are mounted in production | High |
| R3 | `canonical-active-plan-construction.ts` lines 25–99 | Initial Macro/Meso/Micro/Session Construction orchestration | High |
| R4 | `canonical-onboarding-setup.ts` | Atomic plan/settings commit and rollback | High |
| R5 | `canonical-active-plan-carrier.ts` and v2 repository | One persisted canonical carrier with immutable snapshots | High |
| R6 | `canonical-recorded-session-application.ts` lines 65, 95, 116 | Exact performed/completion evidence shape | High |
| R7 | `canonical-progress-evaluator.ts` lines 34–40 | Transition/deload intent depends on flags not derived by R6 | High |
| R8 | mounted `analytics.tsx` and `canonical-progress-presentation.ts` | Progress is presentation-only in the mounted route | High |
| R9 | repository-wide caller search | No mounted evaluator, decision producer or decision application caller | High |
| R10 | `canonical-mesocycle-load-adjustment-policy.ts` lines 50–55 | Every automatic numeric load path fails closed | High |
| R11 | `canonical-construction-facts.ts` lines 8–19 | Reconstruction drops limitations/history/preferences and keys load by slot | High |
| R12 | `canonical-load-prescription.ts` and construction pipeline | Established state needs exercise-scoped load and matching evidence | High |
| R13 | mounted `train.tsx` | Current Train records sets but has no pain/readiness/substitution authoring control | High |
| R14 | `canonical-training-method-policy.ts` | Method eligibility, structure, limits and fail-closed behavior | High |
| R15 | `programme/session.tsx` and protected layout | Registered separate legacy programme/session surface | High |
| R16 | isolated `audit-runner.ts` outputs | Twelve deterministic constructions and 0 mounted longitudinal adaptations | High |

## Supplied training references

The source corpus was read directly from `/Users/aaronparry/Downloads/canonical-policy-source-corpus/`. No PDF was changed or copied into the repository.

| File | Pages | Source class | Audit use |
| --- | ---: | --- | --- |
| 01-Wendler-531-Manual.pdf | 97 | Expert coaching system | Phase-specific progression/loading comparison; not imported as universal policy |
| 02-Vault-T-Nation.pdf | 200 | Compiled coaching programmes/articles | Rest-pause terminology and exact row example, page 132 |
| 03-531-Football.pdf | 169 | Expert coaching system | Population/context limits for strength programming |
| 04-Managing-the-Training-of-Weightlifters-0-112-allx.pdf | 130 | Foundational coaching text | Training-management and evidence context |
| 05-Zatsiorsky-Science-and-Practice.pdf | 247 | Foundational textbook | Adaptation, specificity and fatigue context |
| 06-Fundamentals-of-Special-Strength-Training-in-Sport-Y.V.-Verkhoshansky-1977-1986-1-200x.pdf | 207 | Foundational/historical textbook | Special-strength and phase-context limits |
| 07-WestsideforAthletes.pdf | 32 | Expert coaching system | Method/population context; not universalised |
| 08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf | 251 | Expert coaching system | Antagonist pairs page 103/printed 87; example rest page 232 |
| 09-Weightlifting-Training-Database-Book.pdf | 239 | Coaching reference/database | Exercise/loading reference context |
| 10-The-Poliquin-Principles.pdf | 139 | Expert coaching system | Exercise/method context, not universal authority |
| 11-Pavel-Tsatsouline-Bullet-Proof-Abs-2.pdf | 134 | Expert/historical programme | Limited core-training context |
| 12-Mike-Mentzer-Heavy-Duty.pdf | 43 | Historical/anecdotal system | Competing philosophy; not treated as consensus |
| 13-Chad-Waterbury-s-Programs.pdf | 33 | Expert programme | Programme examples only |
| 14-Charles-Atlas-Bodybuilding-Course.pdf | 91 | Historical practice | Historical context only |
| 15-Development-of-the-Russian-Conjugate-SS.pdf | 40 | Historical/expert system | Conjugate history/context only |
| 16-Applied-Strongman-Training-for-Sport-POLIQUIN-and-McDERMOTT.pdf | unavailable | Expert coaching text | File exists (14 MB) but PDF xref/pages are corrupt to `pdfinfo`; no material claim relies on it |

## Evidence hierarchy

1. Executable mounted production source and persisted contracts.
2. Deterministic pure-function reproduction from production code.
3. Existing focused/full tests.
4. Foundational textbooks and expert coaching systems for conditional principles.
5. Historical/anecdotal programmes as context only.

No current-consensus or safety-critical claim in this audit is based solely on a historical programme. No long copyrighted passage is reproduced.

## Evidence gap

The Applied Strongman PDF is present but unreadable by the local PDF parser due to invalid cross-reference/page objects. This blocks source-specific claims from that book only. It does not block the production reachability findings.
