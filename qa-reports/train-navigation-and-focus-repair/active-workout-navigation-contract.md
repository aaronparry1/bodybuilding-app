# Active-workout navigation contract

Verdict: **PROVEN** in production-path state tests; physical iPhone behavior is **NOT PROVEN** until a replacement binary is installed.

## Minimise

- Header control is labelled `Minimise workout and return to Home`.
- The current attempt is persisted as paused before navigation.
- Completed work, edits, attempt identity, planned-session identity and rest state remain attached.
- Home/authenticated tabs remain available and expose the existing Resume affordance.
- Resume uses the same attempt; it cannot create a second attempt.
- Startup auto-enters a still-started attempt but respects a deliberately paused/minimised attempt.

## Finish early

- Available only from the distinct Workout actions menu when at least one valid working set exists and prescribed work remains.
- Copy states exact completed and remaining set counts.
- Deliberate confirmation is required.
- Existing canonical partial-completion behavior records performed work truthfully; remaining sets are not presented as performed.

## Normal finish

- `Finish workout` is shown only after every prescribed working set is complete and the existing finish predicate is satisfied.

## Discard

- Remains separate from minimise and completion.
- Uses the already-certified discard transaction and preserves the planned prescription under its existing contract.

The action menu exposes `Resume later`, `Finish early` where eligible, and `Discard workout`; the header minimise control is not overloaded with destructive meanings.
