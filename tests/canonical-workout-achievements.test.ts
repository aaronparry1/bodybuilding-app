import { describe, expect, it } from "vitest";
import { deriveCanonicalWorkoutAchievements, type CanonicalWorkoutAggregate } from "@/domain/training/canonical-workout-achievements";

describe("canonical workout achievements", () => {
  it("recognises one strongest defensible achievement per exact exercise", () => {
    const history = [workout("prior", "2026-07-01T10:00:00.000Z", [set("bench", 1, 100, 5), set("bench", 2, 100, 5), set("row", 1, 70, 8)])];
    const current = workout("current", "2026-07-08T10:00:00.000Z", [set("bench", 1, 105, 5), set("bench", 2, 105, 5), set("row", 1, 70, 10)]);
    const result = deriveCanonicalWorkoutAchievements({ current, history, exerciseName: name });
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "load", exerciseName: "Bench Press", value: 105, previousValue: 100 }),
      expect.objectContaining({ kind: "comparable_reps", exerciseName: "Chest-Supported Row", load: 70, reps: 10, previousValue: 8 }),
    ]));
    expect(result.filter((item) => item.exerciseId === "bench")).toHaveLength(1);
  });

  it("uses exact loading mode and exercise identity for comparisons", () => {
    const history = [workout("prior", "2026-07-01T10:00:00.000Z", [set("bench", 1, 100, 5)], { bench: "machine" })];
    const current = workout("current", "2026-07-08T10:00:00.000Z", [set("bench", 1, 120, 8)], { bench: "external_load" });
    expect(deriveCanonicalWorkoutAchievements({ current, history, exerciseName: name })).toEqual([]);
  });

  it("excludes partial, calibration, invalid and incomplete evidence", () => {
    const history = [workout("prior", "2026-07-01T10:00:00.000Z", [set("bench", 1, 100, 5)])];
    const current = workout("current", "2026-07-08T10:00:00.000Z", [
      set("bench", 1, 200, 10, "partial"),
      set("calibration", 1, 200, 10),
      set("bench", 2, 100, 0),
    ], { calibration: "calibration_required" });
    expect(deriveCanonicalWorkoutAchievements({ current, history, exerciseName: name })).toEqual([]);
    expect(deriveCanonicalWorkoutAchievements({ current: { ...current, session: { ...current.session, status: "started" } }, history, exerciseName: name })).toEqual([]);
  });

  it("requires a meaningful volume margin and at least three completed sets", () => {
    const history = [workout("prior", "2026-07-01T10:00:00.000Z", [set("bench", 1, 100, 5), set("bench", 2, 100, 5), set("bench", 3, 100, 5)])];
    const near = workout("near", "2026-07-08T10:00:00.000Z", [set("bench", 1, 100, 5), set("bench", 2, 100, 5), set("bench", 3, 100, 5)]);
    expect(deriveCanonicalWorkoutAchievements({ current: near, history, exerciseName: name })).toEqual([]);
    const meaningful = workout("meaningful", "2026-07-15T10:00:00.000Z", [set("bench", 1, 100, 6), set("bench", 2, 100, 6), set("bench", 3, 100, 6)]);
    const result = deriveCanonicalWorkoutAchievements({ current: meaningful, history, exerciseName: name });
    expect(result[0]).toMatchObject({ kind: "comparable_reps" });
    const volume = workout("volume", "2026-07-22T10:00:00.000Z", [set("bench", 1, 100, 5), set("bench", 2, 100, 5), set("bench", 3, 100, 5), set("bench", 4, 100, 5)]);
    expect(deriveCanonicalWorkoutAchievements({ current: volume, history, exerciseName: name })[0]).toMatchObject({ kind: "meaningful_volume", value: 2000, previousValue: 1500 });
  });

  it("recognises a conservative estimated-strength best without relabelling a load or same-load rep best", () => {
    const history = [workout("prior", "2026-07-01T10:00:00.000Z", [set("bench", 1, 100, 5)])];
    const current = workout("current", "2026-07-08T10:00:00.000Z", [set("bench", 1, 95, 8)]);
    expect(deriveCanonicalWorkoutAchievements({ current, history, exerciseName: name })[0]).toMatchObject({ kind: "estimated_strength" });
  });

  it("does not turn first exposure or bodyweight unit artefacts into PRs", () => {
    const first = workout("first", "2026-07-01T10:00:00.000Z", [set("pullup", 1, 0, 8)], { pullup: "bodyweight" });
    expect(deriveCanonicalWorkoutAchievements({ current: first, history: [], exerciseName: name })).toEqual([]);
    const current = workout("current", "2026-07-08T10:00:00.000Z", [set("pullup", 1, 0, 10)], { pullup: "bodyweight" });
    expect(deriveCanonicalWorkoutAchievements({ current, history: [first], exerciseName: name })[0]).toMatchObject({ kind: "comparable_reps", reps: 10 });
  });

  it("emits deterministic programme and consistency milestones without duplicates", () => {
    const dates = ["2026-06-08", "2026-06-09", "2026-06-10", "2026-06-15", "2026-06-16", "2026-06-17", "2026-06-22", "2026-06-23", "2026-06-24"];
    const history = dates.map((date, index) => workout(`prior-${index}`, `${date}T10:00:00.000Z`, [set("bench", 1, 100, 5)]));
    const current = workout("current", "2026-06-29T10:00:00.000Z", [set("bench", 1, 100, 5)]);
    const result = deriveCanonicalWorkoutAchievements({ current, history, exerciseName: name });
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "exercise_milestone", value: 10 }),
      expect.objectContaining({ kind: "programme_milestone", value: 10 }),
      expect.objectContaining({ kind: "consistency_milestone", value: 4 }),
    ]));
    expect(new Set(result.map((item) => item.id)).size).toBe(result.length);
  });

  it("isolates account and programme history", () => {
    const otherAccount = workout("other", "2026-07-01T10:00:00.000Z", [set("bench", 1, 200, 5)], {}, "other-athlete");
    const otherPlan = { ...workout("other-plan", "2026-07-01T10:00:00.000Z", [set("bench", 1, 200, 5)]), session: { ...workout("other-plan", "2026-07-01T10:00:00.000Z", [set("bench", 1, 200, 5)]).session, planId: "other-plan" } };
    const baseline = workout("baseline", "2026-07-02T10:00:00.000Z", [set("bench", 1, 100, 5)]);
    const current = workout("current", "2026-07-08T10:00:00.000Z", [set("bench", 1, 105, 5)]);
    expect(deriveCanonicalWorkoutAchievements({ current, history: [otherAccount, otherPlan, baseline], exerciseName: name })[0]).toMatchObject({ previousValue: 100 });
  });
});

function set(exerciseId: string, order: number, load: number, reps: number, completion: "complete" | "partial" = "complete") { return { exerciseId, order, load, reps, completion }; }
function name(id: string): string { return ({ bench: "Bench Press", row: "Chest-Supported Row", pullup: "Pull-Up", calibration: "Bench Press" } as Record<string, string>)[id] ?? id; }

function workout(id: string, completedAt: string, sets: Array<ReturnType<typeof set>>, modes: Record<string, string> = {}, athleteId = "athlete"): CanonicalWorkoutAggregate {
  const exerciseIds = [...new Set(sets.map((item) => item.exerciseId))];
  const slots = exerciseIds.map((exerciseId, index) => ({ id: `slot-${exerciseId}`, index, exerciseId, loadPrescription: modes[exerciseId] === "calibration_required" ? { loadingMode: "external_load", state: "calibration_required" } : { loadingMode: modes[exerciseId] ?? "external_load", state: "exact_history" } }));
  const events: any[] = sets.map((item, index) => ({ eventId: `${id}:set:${index}`, aggregateId: id, expectedVersion: index, type: "performance", occurredAt: completedAt, operationId: `${id}:set:${index}`, payload: { setId: `${id}:set:${index}`, slotId: `slot-${item.exerciseId}`, exerciseId: item.exerciseId, setOrder: item.order, load: item.load, reps: item.reps, unit: "kg", completion: item.completion } }));
  events.push({ eventId: `${id}:complete`, aggregateId: id, expectedVersion: sets.length, type: "completed", occurredAt: completedAt, operationId: `${id}:complete`, payload: {} });
  return { session: { schemaVersion: "canonical_recorded_session_v1", recordedSessionId: id, plannedSessionId: `${id}:planned`, planId: "plan", startRevision: 1, macrocycleId: "macro", mesocycleId: "meso", microcycleId: "micro", role: "Push", prescriptionSnapshot: { slots }, prescriptionHash: JSON.stringify({ slots }), provenance: {}, athleteId, version: sets.length + 1, status: "completed", createdAt: completedAt, startedAt: completedAt }, events };
}
