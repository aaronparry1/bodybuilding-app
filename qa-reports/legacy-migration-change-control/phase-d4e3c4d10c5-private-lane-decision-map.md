# D4E3C4D10C5 — private lane decision extraction

Status: `private_lane_decision_drift`, reverted.

The candidate mechanically moved the complete `resolveTrainingLane` branch body into one private `resolveTrainingLaneDecision` helper and made the exported façade return `.lane`. Primitive lane characterization passed, but three existing architecture tests failed because they intentionally asserted that no private rich lane helper existed: D4E3C4D10, D4E3C4D10C3 and D4E3C4D10C4. The production extraction was reverted; those guards were not weakened.

This is test-infrastructure drift, not a lane-value drift. The smallest safe next boundary is to update the architecture gates only after an isolated candidate proves primitive/generated output equivalence, then rerun the full suite with the candidate patch preserved.
