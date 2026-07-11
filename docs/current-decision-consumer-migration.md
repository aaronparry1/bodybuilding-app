# Current decision consumer migration

Stage 2 introduces one explicit application boundary: `applyCurrentMesocycleDecision`. It loads the persisted current decision and referenced readiness snapshot, validates the current plan/mesocycle/microcycle identity, and applies only a ready decision once.

`delay` and `review_required` preserve plan state. `continue` creates the next current microcycle in the same mesocycle; `deload` creates a reduced-stress current microcycle; `advance` uses the decision's already selected approved target. No outcome updates block week, selects an array item, or mutates completed workouts.

The application boundary is complete, but direct recommendation, completion, Progress, volume, Train/logger, and Plan/Home consumer migration remains pending. They continue to be Stage 2 work and must be routed to the current producer/writer/application boundaries before legacy block authority can be retired.

## Stage 2A application contract

The application service returns explicit delay/review no-ops, identity failures, stale/superseded decisions, snapshot failures, and applied lifecycle results. It persists the plan first and then marks a decision applied. Since local repositories are not transactional, a lifecycle persistence failure is reported as an application failure; recovery must inspect current identities rather than replaying the mutation.
