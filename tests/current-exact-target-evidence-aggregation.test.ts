import { describe, expect, it } from "vitest";
import { aggregateExactTargetExtraction } from "@/domain/training/current-exact-target-evidence-aggregation";
import type { ExactTargetExtraction, ExactTargetSetFact } from "@/domain/training/current-exact-target-evidence";
const fact = (overrides: Partial<ExactTargetSetFact> = {}): ExactTargetSetFact => ({ workoutId: "w1", mesocycleId: "hypertrophy_base", microcycleNumber: 2, planSessionIndex: 0, exerciseId: "e1", setOrdinal: 0, targetReps: 8, actualReps: 8, completion: "met", stoppedByDropOff: false, ...overrides });
const extraction = (facts: ExactTargetSetFact[]): ExactTargetExtraction => ({ facts, incompleteWorkoutIds: [], invalidWorkoutIds: [], ignoredNonPlannedIds: [] });
describe("current exact target aggregation", () => {
  it("groups fact-only evidence by exercise and planned session", () => { const result = aggregateExactTargetExtraction(extraction([fact(), fact({ setOrdinal: 1, completion: "missed", actualReps: 6 }), fact({ workoutId: "w2", planSessionIndex: 1, exerciseId: "e2", completion: "stopped", stoppedByDropOff: true })])); expect(result.breadth).toEqual({ sets: 3, exercises: 2, sessions: 2 }); expect(result.counts).toMatchObject({ met: 1, missed: 1, stopped: 1 }); });
  it("deduplicates identical facts and exposes conflicts", () => { const one = fact(); expect(aggregateExactTargetExtraction(extraction([one, { ...one }])).breadth.sets).toBe(1); expect(aggregateExactTargetExtraction(extraction([one, { ...one, actualReps: 7, completion: "missed" }])).status).toBe("invalid"); });
});
