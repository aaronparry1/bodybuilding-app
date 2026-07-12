# Primary evidence extraction map

`buildPrimaryEvidence` now consumes `LegacyProgressPrimaryEvidenceInput`:

* historical: completed workouts and source;
* strategic: history sufficiency and recommendation title/message/reasons;
* recovery: existing priority and fatigue classifier;
* rotation: existing rotation action;
* volume: existing primary and personalised recommendations.

Branch order is unchanged: insufficient history, recovery, personalised volume, legacy volume, rotation, strategic default. The adapter is structural only. Journey and action-flow retain raw legacy dependencies until later extraction phases.
