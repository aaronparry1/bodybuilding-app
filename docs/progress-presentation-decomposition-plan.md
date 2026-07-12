# Progress presentation decomposition plan

The shared Progress helpers currently consume one legacy strategic presenter result that mixes strategic, recovery, rotation, volume, historical, and display-order concerns. A direct recovery substitution changes deferred behavior, so extraction must precede semantic migration.

The safe sequence is: freeze helper outputs; extract leaf copy inputs; extract evidence; extract journey inputs; extract action-flow ordering; then replace recovery, rotation, and volume categories independently. The presenter can be removed from Progress only after no helper receives its raw result.

The later recovery correction is explicitly semantic: historical fatigue becomes a warning, not an authorised recovery action. It is not part of the structural extraction seam.

First extraction complete: copy helpers now consume `LegacyProgressCopyPresentationInput`, built once at the legacy presenter compatibility boundary. Evidence, journey, and action-flow families remain raw-legacy consumers until their separately scoped extraction phases.

Second extraction complete: primary evidence now consumes `LegacyProgressPrimaryEvidenceInput`; journey and action-flow remain deferred.

Third extraction complete: journey actions now consume `LegacyProgressJourneyActionsInput`, built at the legacy presenter compatibility boundary. Action-flow ordering remains the next raw legacy extraction family.

Fourth extraction complete: action flow now consumes `LegacyProgressActionFlowInput`, with separate legacy history, recovery, rotation, volume, strategic-transition, and ordering candidates. The next phase is the approved recovery semantic replacement.

Recovery semantic replacement complete: the recovery candidate is now current-derived across action flow, evidence, journey, and copy. Rotation, volume, and strategic compatibility replacement remain separate phases.

Rotation semantic replacement complete: Progress presents only persisted intervention/applied replacement facts; historical rotation observations are non-actionable.

Volume replacement is deferred behind the separate volume authority/mutation audit. Progress must not consume a fabricated current volume context while formula, event policy, record identity, and mutation authority remain block-scoped.
