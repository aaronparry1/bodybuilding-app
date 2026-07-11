# Current progression and transition decision design

## Executive summary

Exercise/set progression, session adjustment, microcycle continuation, mesocycle transition, and fatigue management are separate decisions. The current app has exact targets, stored outcomes, current mesocycle/microcycle state, and approved successors; it does not have validated subjective recovery or medical inputs. Therefore the model must be evidence-gated, conservative, and explicit when evidence is incomplete.

## Evidence synthesis

ACSM's current overview-of-reviews and its earlier progression position stand support progressive resistance training, but do not validate one universal mesocycle length or automatic fixed-week deload. Periodization evidence supports structured variation more strongly for strength than for volume-equated hypertrophy, while the optimal implementation remains uncertain. Deload practice is common coaching practice, but the available deload survey is descriptive rather than causal; treat exact timing and dose as product policy, not established science. Higher volume/proximity to failure can increase acute fatigue signals, but app decisions should use repeated observed suppression and stop/drop-off patterns, not a single session.

Evidence strength: direct for exact performance and completed-work adherence as facts; moderate/inferential for structured variation and fatigue-management; low for fixed deload timing, universal exposure counts, or a single fatigue threshold.

## Ownership

| Decision | Owner | Meaning | Not meaning |
| --- | --- | --- | --- |
| Exercise progression | exercise/set progression | Next exact prescription from stored performance | Mesocycle transition |
| Session adjustment | live coaching | Current/future set instruction | Historical rewrite |
| Repeat | microcycle continuation | Start another attempt under same mesocycle objective | Reopen completed work |
| Delay | transition lifecycle | Preserve state because decision evidence/state is insufficient or blocked | A training action |
| Deload | authorised fatigue-management microcycle | Temporarily reduce stress without changing macrocycle rationale | Automatic fixed-week block |
| Advance | mesocycle transition engine | Enter an approved successor after objective/readiness conditions | Add reps/load |

Repeat and delay remain distinct: **repeat is an action that creates a next microcycle attempt; delay is a lifecycle status that applies no training-state mutation.**

## Evidence and precedence

Required inputs: current plan/mesocycle/microcycle identity; completed planned-session evidence; stored exact prescriptions and actuals; current transition eligibility; approved successor state. Supporting inputs: adherence, target achievement, repeated drop-off/stop rules, exercise trends, volume signals, disruption. Disqualifying inputs: incomplete compatibility, unresolved planned session, intervention-blocked construction, contradictory or missing current identity. Custom sessions are irrelevant to plan completion.

Precedence:

1. invalid/incomplete compatibility — no decision;
2. unresolved planned session or intervention-blocked construction — delay;
3. insufficient/contradictory evidence — delay;
4. repeated material fatigue evidence — deload eligibility;
5. current mesocycle remains productive — repeat;
6. objective concluded, eligibility satisfied, successor approved — advance.

Advance does not outrank material fatigue automatically: if both are present, a deload microcycle may bridge the transition only when the mesocycle policy authorises it; otherwise surface an owner decision. No single missed target/session/set is sufficient for deload, repeat, or advance.

## Deload design

Deload is a pre-planned or reactive, mesocycle-authorised fatigue-management microcycle. It remains inside the mesocycle by default; it may bridge an approved transition only as explicit policy. Preserve exercise eligibility and movement intent, reduce productive-set exposure and/or effort/relative loading according to the existing deload prescription, and pause escalation rather than rewrite original prescriptions. Frequency reduction is optional policy, not a default. A completed deload with continued suppression returns delay/incomplete evaluation, not an automatic macrocycle change. Exact timing, minimum exposure, and dose require product-owner policy approval.

## State transition matrix

| Decision | Inputs | Mutation | Does not change | Identity |
| --- | --- | --- | --- | --- |
| Advance | readiness + approved successor + sufficient planned evidence | mesocycle ID; new microcycle | history, stored prescriptions, interventions | plan, prior/target mesocycle, decision ID |
| Repeat | productive objective + sufficient evaluation | next microcycle attempt in same mesocycle | completed sessions/history | plan, mesocycle, next microcycle, decision ID |
| Delay | blocked/incomplete/insufficient evidence | lifecycle status/reason only | schedule, mesocycle, microcycle | plan, current cycle, reason |
| Deload | repeated fatigue evidence + authorised state | fatigue-management microcycle state | macrocycle rationale/history | plan, mesocycle, deload microcycle, decision ID |

## Volume context

`CurrentVolumeContext` should contain goal, mesocycle purpose, microcycle priority/type, planned completed work, current progression status, accumulated evidence quality, and deload state. Legacy block type has a valid equivalent only for historical compatibility labels; block week/order have no valid current authority equivalent.

## Representative scenarios

| Scenario | Decision | Confidence | Prohibited alternative |
| --- | --- | --- | --- |
| Objective achieved with approved successor | advance | moderate | load-only progression labelled transition |
| Improving but insufficient exposure | delay, then repeat when evaluation complete | high | premature advance |
| One missed target | continue current microcycle/session policy | high | deload/repeat |
| Repeated suppression and excessive drop-off | deload eligible | moderate | automatic macrocycle change |
| Life disruption/missed sessions | delay | high | regression |
| Custom sessions replace planned work | delay | high | count as planned completion |
| Intervention blocks required slot | delay/construction block | high | repeat or unrelated transition |
| Productive beyond minimum duration | repeat | moderate | fixed-week advance |
| Eligible but no successor | delay | high | free-form successor |
| Incomplete legacy plan | incomplete compatibility | high | infer first block |
| Suppression after deload | delay and reassess | low/moderate | automatic escalation |
| Objective achieved plus fatigue | authorised deload bridge or owner decision | low/moderate | unconditional advance |

## Proposed contract (pseudocode)

```ts
type TransitionDecision =
 | { kind: "advance"; targetMesocycleId: MesocycleId; evidence: DecisionEvidence }
 | { kind: "repeat_microcycle"; evidence: DecisionEvidence }
 | { kind: "delay"; reason: "insufficient_evidence" | "construction_blocked" | "unresolved_session" }
 | { kind: "deload_microcycle"; evidence: DecisionEvidence }
 | { kind: "unavailable"; reason: "incomplete_compatibility" | "invalid_plan" };

type MesocycleReadiness = { eligibility: "not_ready" | "eligible" | "blocked"; evidenceQuality: "sufficient" | "insufficient" };
type CurrentVolumeContext = { goal: Goal; mesocyclePurpose: string; microcyclePriority: string; progressionStatus: string; plannedWork: number; evidenceQuality: "sufficient" | "insufficient"; deloadState: "none" | "eligible" | "active" };
```

## Implementation gates

| Gate | Status |
| --- | --- |
| Layer ownership | resolved from architecture |
| Repeat/delay distinction | resolved as action vs lifecycle status |
| Exact decision thresholds/minimum exposure | requires product-owner policy |
| Deload dose/timing/frequency policy | requires product-owner policy |
| Available objective evidence | resolved: targets, adherence, drop-off, stops, trends |
| Subjective/medical recovery inputs | unavailable; excluded |
| Compatibility behaviour | resolved: unavailable/incomplete, never fabricated |
| Precedence for advance plus fatigue | requires product-owner policy |

## Non-goals

This design does not implement decisions, prescribe medical care, define universal thresholds, alter exact targets, or replace live coaching.
