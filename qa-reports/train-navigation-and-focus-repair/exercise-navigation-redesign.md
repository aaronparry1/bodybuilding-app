# Exercise navigation redesign

Verdict: **PROVEN** by mounted-source contracts and focused state tests; interactive geometry on the replacement iPhone binary is **NOT PROVEN**.

The permanently expanded `ExerciseRail` was removed. The default state now contains:

- one compact `Exercise X of N` navigator;
- current exercise name and completed-set count;
- previous/next controls;
- one action to open the full exercise list;
- one current/first-incomplete set row;
- an `All sets` disclosure;
- a separate `Method and coaching details` disclosure.

The on-demand exercise sheet shows order, name, current/completed/upcoming status and completed versus prescribed sets. Selection changes only the visible exercise; it does not change prescriptions or generate work.

Grouped methods retain their canonical `methodExecution.sequenceLabel`, method and order in the sheet. The redesign does not flatten linked rounds, supersets, trisets or other production-supported execution structures.

Interaction counts by implemented contract:

- adjacent exercise: one tap;
- any exercise: open list, select exercise (two taps);
- minimise: one tap;
- resume from Home: one tap.
