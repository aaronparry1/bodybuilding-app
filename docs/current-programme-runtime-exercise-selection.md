# Current programme runtime exercise selection (D4D2)

For the restricted D3 calibration family, D4C now passes certified D4B jobs to `selectCurrentProgrammeJobs`. The batch validates identity, ordinal order, parent trace and duplicate source slots, then invokes the D4D1 single-job seam once per job.

Required failures are atomic: no partial batch is returned and no compatibility fallback is attempted. Optional failures produce explicit omission records. Successful results preserve prescription-slot IDs, ordinal order, selected exercise IDs and defensive source traces. Guidance remains metadata and exact-target generation remains downstream.

Compatibility plans exit through the existing compatibility construction result before this batch is called. D4D2 does not mutate D3 metadata, persist workouts, apply adjustments, or change selector mechanics.
