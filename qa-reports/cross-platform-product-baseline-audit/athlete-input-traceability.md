# Athlete input traceability

| Input | Class / collection | Storage | Exact consumer/effect | Status |
|---|---|---|---|---|
| Goal | user-stated/onboarding | settings + carrier | macrocycle, mesocycle policy, cardio | used/tested |
| Target/competition date | user-stated/conditional onboarding | carrier | horizon/taper/event planning | used conditionally; event type propagation needs review |
| Experience | user-stated | settings/carrier | framework, volume, methods | used/tested |
| Available days | user-stated | carrier constraints | microcycle roles/frequency | used/tested |
| Session duration | user-stated/settings | settings/carrier | allocation/feasibility/estimate | used/tested |
| Equipment | inferred/default catalogue | carrier construction facts | exercise suitability | consumer exists; collection is weak/decorative |
| Preferred split | user-stated | carrier | executable framework resolver | used; may resolve to same output |
| Exercise preferences/dislikes | user actions | customisation/preference repos | construction selector | current swap works; future preference continuity incomplete |
| Injuries/limitations | not meaningfully collected | typed carrier facts | safety/suitability | consumer exists; mounted collection absent |
| Recent consistency/days/workload | user-stated onboarding | starting-volume context | initial volume only | used/tested; expires implicitly after construction |
| Recovery/cardio preference | user-stated | settings/carrier | conditioning prescription | used/tested |
| Units/load jumps | user-stated/settings | settings | display/load increments | used/tested |
| Completed sets/load/reps | observed | ledger + evidence | completion, trends, bounded progression | used/tested |
| Rep drop-off/failed target | derived | evidence | stop rule and repeated comparable progression/regression | used after sufficient comparable evidence |
| Rest duration | partly observed timer state | timer/ledger boundary | execution, not clearly longitudinal model | collected but longitudinally unused |
| Attendance/missed sessions | observed from status | ledger/carrier | display; reflow capability | material future consumer not fully proven |
| Substitutions/added exercises | observed/user-edited | ledger/customisations | current session; evidence compatibility | current used; future learning incomplete |
| Skipped sets | observed | ledger | completion/evidence sufficiency | used as absence/quality; model semantics limited |
| Session duration | derived timestamps | ledger | reporting | coaching consumer unverified |
| Pain flags | user-stated in-session where exposed | safety event/policy | immediate stop/constraint | bounded safety consumer; no diagnosis |
| Readiness/sleep/soreness/stress | user-stated check-in contracts | readiness repo | fatigue/readiness context | production writer exists, material policy effect requires device/trace proof |
| Bodyweight | not found in core AppSettings | unknown | no proven consumer | unused/unverified |
| e1RM/strength history | derived from performed work | metrics/evidence | trends/load evidence | used in reporting/load policies with confidence bounds |

Decorative/overpromised inputs: equipment is silently broad rather than athlete-specific; limitation collection is missing; rest/session-duration and missed-session observations do not clearly learn longitudinally; bodyweight is absent; preferences lack an inspectable confidence/expiry model. No input currently has a user-facing “told/observed/inferred/confidence/changed this decision” record.
