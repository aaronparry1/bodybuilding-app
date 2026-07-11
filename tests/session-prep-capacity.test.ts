import { beforeEach, describe, expect, it } from "vitest";
import { defaultAppSettings, normalizeAppSettings } from "@/application/settings/app-settings";
import { capacityFocusRepository } from "@/data/local/capacity-focus-repository";
import { jsonStore } from "@/data/local/json-store";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import {
  buildCapacityFocusRecord,
  defaultCapacityFocusSettings,
  getCapacityRoutine,
  isCapacityRoutineImplemented,
  listComingSoonCapacityRoutines,
  listCapacityRoutines,
  listEnabledCapacityRoutines,
} from "@/domain/training/capacity-focus";
import { getMovementGuide, listMovementGuideNames } from "@/domain/training/prep-capacity-guides";
import { exerciseLibrary } from "@/domain/training/presets";
import {
  buildSessionPrepOverview,
  buildSessionPrepRecord,
  countSessionPrepStations,
  getSessionPrepExerciseLogistics,
  getSessionPrepRoutine,
  listSessionPrepStations,
  listSessionPrepRoutines,
  sessionPrepPrimerPool,
  trainingPreparationSafetyCopy,
  universalCoreBracingPool,
} from "@/domain/training/session-prep";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";

describe("session prep and capacity focus", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
  });

  it("selects workout-specific prep routines", () => {
    expect(getSessionPrepRoutine("Push").exercises.map((exercise) => exercise.name)).toEqual([
      "Dead Bug",
      "Band Pull Apart",
      "Band Face Pull",
      "Push Up",
      "Cuban Press",
    ]);
    expect(getSessionPrepRoutine("Pull").exercises.map((exercise) => exercise.name)).toContain("Bird Dog");
    expect(getSessionPrepRoutine("Legs").exercises.map((exercise) => exercise.name)).toContain("Deep Squat Hold");
    expect(getSessionPrepRoutine("Full Body").estimatedMinutes).toBeGreaterThanOrEqual(3);
    expect(getSessionPrepRoutine("Full Body").estimatedMinutes).toBeLessThanOrEqual(8);
  });

  it("keeps ramp-up sets and primer movements out of normal Session Prep", () => {
    const routines = listSessionPrepRoutines();
    const exerciseNames = routines.flatMap((routine) => routine.exercises.map((exercise) => exercise.name));

    expect(exerciseNames).not.toContain("Ramp-up Sets");
    expect(exerciseNames).not.toContain("Wenning Warm-up");
    expect(listMovementGuideNames()).not.toContain("Wenning Warm-up");
    for (const primer of sessionPrepPrimerPool) {
      expect(exerciseNames).not.toContain(primer);
    }
  });

  it("includes one universal core or bracing movement in every prep routine", () => {
    for (const routine of listSessionPrepRoutines()) {
      const coreMovements = routine.exercises.filter((exercise) => universalCoreBracingPool.some((name) => name === exercise.name));

      expect(coreMovements.length, routine.name).toBe(1);
      expect(routine.exercises.length, routine.name).toBeGreaterThanOrEqual(3);
      expect(routine.exercises.length, routine.name).toBeLessThanOrEqual(5);
    }
  });

  it("selects only approved movements for the main prep pools without station-heavy defaults", () => {
    const withoutCore = (type: string) =>
      getSessionPrepRoutine(type)
        .exercises
        .map((exercise) => exercise.name)
        .filter((name) => !universalCoreBracingPool.some((coreName) => coreName === name));

    expect(withoutCore("Push")).toEqual(["Band Pull Apart", "Band Face Pull", "Push Up", "Cuban Press"]);
    expect(withoutCore("Legs")).toEqual(["Cat-Camel", "Deep Squat Hold", "Full Range Split Squat", "Goblet Squat"]);
    expect(withoutCore("Pull")).toEqual(["Band Pull Apart", "Straight Arm Band Pulldown", "Trap 3 Raise", "Pullover"]);
    expect(withoutCore("Full Body")).toEqual(["Band Pull Apart", "Push Up", "Full Range Split Squat", "Deep Squat Hold"]);
    expect(withoutCore("Arms")).toEqual(["Band Pull Apart", "Band Face Pull", "Pullover"]);
  });

  it("lets first lift context override broad session type for prep selection", () => {
    expect(getSessionPrepRoutine({ workoutType: "push", firstExerciseName: "Standing Barbell Overhead Press" }).focus).toBe("overhead_press");
    expect(getSessionPrepRoutine({ workoutType: "legs", firstExerciseName: "Deadlift" }).focus).toBe("hinge");
    expect(getSessionPrepRoutine({ workoutType: "pull", firstExerciseName: "Pull-Up" }).focus).toBe("pullup");
    expect(getSessionPrepRoutine({ workoutType: "upper", firstExerciseName: "Bench Press" }).focus).toBe("bench");
  });

  it("keeps kettlebell swings and primers separate from prep even when hinge focused", () => {
    const routine = getSessionPrepRoutine({ workoutType: "lower", firstExerciseName: "Deadlift" });
    const names = routine.exercises.map((exercise) => exercise.name);

    expect(routine.focus).toBe("hinge");
    expect(names).toEqual(["Bird Dog", "Single Leg Glute Bridge", "Outer Hip Circuit", "Pigeon Strength"]);
    expect(names).not.toContain("Kettlebell Swing");
    for (const primer of sessionPrepPrimerPool) {
      expect(names).not.toContain(primer);
    }
  });

  it("chooses low-station clusters for first-lift prep", () => {
    const bench = getSessionPrepRoutine({ workoutType: "push", firstExerciseName: "Bench Press" });
    const squat = getSessionPrepRoutine({ workoutType: "legs", firstExerciseName: "Squat" });
    const hinge = getSessionPrepRoutine({ workoutType: "lower", firstExerciseName: "Deadlift" });
    const pullup = getSessionPrepRoutine({ workoutType: "pull", firstExerciseName: "Pull-Up" });
    const cable = getSessionPrepRoutine({ workoutType: "pull", firstExerciseName: "Cable Row" });

    expect(bench.setupLabel).toBe("Bench + bodyweight + band");
    expect(squat.setupLabel).toBe("Rack + floor + band");
    expect(hinge.setupLabel).toBe("Platform + floor + band");
    expect(pullup.setupLabel).toBe("Pull-up station + floor");
    expect(cable.setupLabel).toBe("Cable + bodyweight");

    expect(countSessionPrepStations(bench)).toBeLessThanOrEqual(1);
    expect(countSessionPrepStations(squat)).toBeLessThanOrEqual(2);
    expect(countSessionPrepStations(hinge)).toBeLessThanOrEqual(1);
    expect(countSessionPrepStations(pullup)).toBeLessThanOrEqual(1);
    expect(countSessionPrepStations(cable)).toBeLessThanOrEqual(1);
    expect(listSessionPrepStations(cable)).toEqual(expect.arrayContaining(["cable", "floor"]));
    expect(listSessionPrepStations(cable)).not.toContain("machine");
    expect(listSessionPrepStations(cable)).not.toContain("pullup_station");
  });

  it("keeps full body prep purposeful instead of mixing every station", () => {
    const routine = getSessionPrepRoutine("Full Body");
    const stations = listSessionPrepStations(routine);

    expect(routine.setupLabel).toBe("Floor + band");
    expect(routine.exercises.map((exercise) => exercise.name)).toEqual([
      "Dead Bug",
      "Band Pull Apart",
      "Push Up",
      "Full Range Split Squat",
      "Deep Squat Hold",
    ]);
    expect(countSessionPrepStations(routine)).toBeLessThanOrEqual(1);
    expect(stations).not.toContain("cable");
    expect(stations).not.toContain("machine");
    expect(stations).not.toContain("pullup_station");
  });

  it("does not inject unapproved or high-friction prep exercises during clustering", () => {
    const approved = new Set([
      ...universalCoreBracingPool,
      "Band Pull Apart",
      "Pullover",
      "Cuban Press",
      "Push Up",
      "Band Face Pull",
      "Trap 3 Raise",
      "Scap Push Up",
      "External Rotation",
      "Wall Slide",
      "Deep Squat Hold",
      "Single Leg Glute Bridge",
      "Loaded Butterfly",
      "Couch Stretch",
      "Tibialis Raise",
      "Deep Calf Raise",
      "Reverse Step Up",
      "Hip Flexor Kick Out",
      "Full Range Split Squat",
      "Goblet Squat",
      "Back Extension",
      "Reverse Hyper",
      "Active Hang",
      "Pigeon Strength",
      "Outer Hip Circuit",
      "Straight Arm Band Pulldown",
      "Scapular Pull Up",
      "Scapular Pull Down",
      "Cat-Camel",
    ]);

    for (const routine of listSessionPrepRoutines()) {
      for (const exercise of routine.exercises) {
        expect(approved.has(exercise.name), `${routine.name}: ${exercise.name}`).toBe(true);
        expect(getSessionPrepExerciseLogistics(exercise.name).stations.length).toBeGreaterThan(0);
      }
    }
  });

  it("treats Trap 3 Raise as a bilateral both-hands prep exercise", () => {
    const trapEntries = listSessionPrepRoutines()
      .flatMap((routine) => routine.exercises)
      .filter((exercise) => exercise.name === "Trap 3 Raise");
    const guideCopy = JSON.stringify(getMovementGuide("Trap 3 Raise"));

    expect(trapEntries.length).toBeGreaterThan(0);
    expect(trapEntries.every((exercise) => exercise.dose === "1 x 8-12")).toBe(true);
    expect(trapEntries.map((exercise) => exercise.dose).join(" ")).not.toMatch(/each side|single-arm|single arm/i);
    expect(guideCopy).toMatch(/both hands/i);
    expect(guideCopy).not.toMatch(/one arm|single-arm|single arm|each side/i);
  });

  it("uses the standing Hip Flexor Kick Out prep guide", () => {
    const routineEntry = getSessionPrepRoutine({ workoutType: "legs", firstExerciseName: "Squat" }).exercises.find((exercise) => exercise.name === "Hip Flexor Kick Out");
    const guide = getMovementGuide("Hip Flexor Kick Out");
    const guideCopy = JSON.stringify(guide);
    const logistics = getSessionPrepExerciseLogistics("Hip Flexor Kick Out");

    expect(routineEntry?.purpose).toMatch(/active hip flexor control/i);
    expect(guide.setup.join(" ")).toMatch(/stand tall/i);
    expect(guide.setup.join(" ")).toMatch(/rack or bench/i);
    expect(guide.steps.join(" ")).toMatch(/lift one knee/i);
    expect(guide.steps.join(" ")).toMatch(/controlled kick/i);
    expect(guide.cues.join(" ")).toMatch(/avoid leaning backwards/i);
    expect(guide.cues.join(" ")).toMatch(/core lightly braced/i);
    expect(guideCopy).not.toMatch(/kneel|kneeling|half-kneel|half kneel/i);
    expect(logistics.equipmentTags).toEqual(expect.arrayContaining(["bodyweight", "rack optional", "bench optional"]));
    expect(logistics.stations).toEqual(expect.arrayContaining(["rack_platform", "bench"]));
  });

  it("tracks completed and skipped prep separately from workouts", () => {
    const routine = getSessionPrepRoutine("Push");

    sessionPrepRepository.save(buildSessionPrepRecord({ routine, workoutName: "Push", status: "completed", now: new Date("2026-06-05T10:00:00.000Z") }));
    sessionPrepRepository.save(buildSessionPrepRecord({ routine, workoutName: "Push", status: "skipped", now: new Date("2026-06-06T10:00:00.000Z") }));

    expect(sessionPrepRepository.list().map((record) => record.status)).toEqual(["skipped", "completed"]);
    expect(workoutSessionRepository.list()).toEqual([]);
    expect(new LocalSyncQueueStore().read()).toEqual([]);
    expect(summarizeWorkoutHistory(workoutSessionRepository.list())).toEqual([]);
  });

  it("builds visible prep overview states for not started, completed, and skipped prep", () => {
    const routine = getSessionPrepRoutine("Push");
    const completed = buildSessionPrepRecord({
      routine,
      workoutName: "Push",
      status: "completed",
      now: new Date("2026-06-05T10:00:00.000Z"),
    });
    const skipped = buildSessionPrepRecord({
      routine,
      workoutName: "Push",
      status: "skipped",
      now: new Date("2026-06-06T10:00:00.000Z"),
    });

    expect(buildSessionPrepOverview({ records: [], workoutName: "Push" })).toMatchObject({
      status: "not_started",
      title: "Session Prep",
      primaryAction: "start",
      secondaryAction: "skip",
    });
    expect(buildSessionPrepOverview({ records: [completed], workoutName: "Push" })).toMatchObject({
      status: "completed",
      title: "Prep completed",
      primaryAction: "view",
    });
    expect(buildSessionPrepOverview({ records: [completed, skipped], workoutName: "Push" })).toMatchObject({
      status: "skipped",
      title: "Prep skipped",
      primaryAction: "view",
    });
  });

  it("keeps skipped prep optional and outside progression or volume data", () => {
    const routine = getSessionPrepRoutine("Push");
    sessionPrepRepository.save(buildSessionPrepRecord({ routine, workoutName: "Push", status: "skipped" }));

    expect(buildSessionPrepOverview({ records: sessionPrepRepository.list(), workoutName: "Push" }).status).toBe("skipped");
    expect(workoutSessionRepository.list()).toEqual([]);
    expect(new LocalSyncQueueStore().read()).toEqual([]);
    expect(summarizeWorkoutHistory(workoutSessionRepository.list())).toEqual([]);
  });

  it("provides bucket-balanced low back capacity routines", () => {
    const routines = listCapacityRoutines("low_back");

    expect(routines.map((routine) => routine.name)).toEqual(["Low Back Foundation", "Low Back Capacity", "Low Back Load Tolerance"]);
    for (const routine of routines) {
      const buckets = routine.exercises.map((exercise) => exercise.bucket);

      expect(routine.exercises.length, routine.name).toBeGreaterThanOrEqual(3);
      expect(routine.exercises.length, routine.name).toBeLessThanOrEqual(5);
      expect(buckets).toContain("bracing_trunk_stiffness");
      expect(buckets).toContain("anti_rotation_lateral_flexion");
      expect(buckets).toContain("hip_extension_posterior_chain");
      expect(routine.frequency).toMatch(/1-2|Optional 3rd/i);
      expect(routine.purpose).toMatch(/trunk control|load tolerance|training tolerance/i);
    }
    expect(getCapacityRoutine("low_back", 3).exercises.filter((exercise) => exercise.bucket === "progressive_load_exposure")).toHaveLength(1);
  });

  it("tracks capacity focus separately from workout progression data", () => {
    const routine = getCapacityRoutine("low_back", 1);
    capacityFocusRepository.save(buildCapacityFocusRecord({ routine, now: new Date("2026-06-05T10:00:00.000Z") }));

    expect(capacityFocusRepository.list()[0]).toMatchObject({
      area: "low_back",
      level: 1,
      routineId: "capacity-low-back-foundation-control",
      status: "completed",
    });
    expect(workoutSessionRepository.list()).toEqual([]);
    expect(new LocalSyncQueueStore().read()).toEqual([]);
    expect(summarizeWorkoutHistory(workoutSessionRepository.list())).toEqual([]);
  });

  it("normalizes capacity focus settings but only lists implemented enabled tracks", () => {
    const settings = normalizeAppSettings({
      ...defaultAppSettings,
      capacityFocus: {
        ...defaultCapacityFocusSettings,
        low_back: true,
        shoulders: true,
      },
    });

    expect(settings.capacityFocus.low_back).toBe(true);
    expect(settings.capacityFocus.shoulders).toBe(true);
    expect(listEnabledCapacityRoutines(settings.capacityFocus).map((routine) => routine.area)).toEqual(["low_back", "low_back", "low_back"]);
    expect(listEnabledCapacityRoutines(settings.capacityFocus).some((routine) => routine.area === "shoulders")).toBe(false);
    expect(listComingSoonCapacityRoutines()).toEqual([]);
    expect(listCapacityRoutines().every((routine) => isCapacityRoutineImplemented(routine))).toBe(true);
  });

  it("adds a hyperextension family for capacity-oriented posterior-chain options", () => {
    const hyperextensions = exerciseLibrary.filter((exercise) => exercise.family === "hyperextension");

    expect(hyperextensions.map((exercise) => exercise.name)).toEqual(
      expect.arrayContaining([
        "Back Extension",
        "45 Degree Back Extension",
        "Horizontal Back Extension",
        "Weighted Back Extension",
        "Iso Hold Back Extension",
        "Single-Leg Back Extension",
        "Reverse Hyper",
        "Single-Leg Reverse Hyper",
        "Banded Reverse Hyper",
        "Machine Reverse Hyper",
      ]),
    );
    expect(hyperextensions.every((exercise) => exercise.roles.some((role) => role === "accessory" || role === "resilience" || role === "capacity"))).toBe(true);
  });

  it("keeps safety copy explicit and non-medical", () => {
    const copy = [
      ...trainingPreparationSafetyCopy,
      ...listSessionPrepRoutines().flatMap((routine) => routine.safetyCopy),
      ...listCapacityRoutines().flatMap((routine) => [routine.name, routine.purpose, routine.frequency, ...routine.progressionNotes, ...routine.safetyCopy]),
    ].join(" ");

    expect(copy).toContain("This is training preparation and capacity work.");
    expect(copy).toContain("Not medical advice.");
    expect(copy).toContain("Stop exercises that cause pain.");
    expect(copy).toContain("seek qualified medical advice");
    expect(copy).not.toMatch(/fix your back|cure pain|rehab|therapy|recovery protocol|physiotherapy|diagnosis|treatment/i);
  });

  it("provides a how guide for every session prep exercise", () => {
    const exercises = listSessionPrepRoutines().flatMap((routine) => routine.exercises);

    expect(exercises.length).toBeGreaterThan(0);
    for (const exercise of exercises) {
      expect(exercise.guide.setup.length, `${exercise.name} setup`).toBeGreaterThan(0);
      expect(exercise.guide.steps.length, `${exercise.name} steps`).toBeGreaterThan(0);
      expect(exercise.guide.cues.length, `${exercise.name} cues`).toBeGreaterThan(0);
      expect(exercise.guide.commonMistakes.length, `${exercise.name} mistakes`).toBeGreaterThan(0);
      expect(exercise.guide.avoid?.join(" ")).toMatch(/comfortable|controlled|pain|fatigue/i);
    }
  });

  it("provides a how guide for every capacity focus exercise", () => {
    const exercises = listCapacityRoutines().flatMap((routine) => routine.exercises);

    expect(exercises.length).toBeGreaterThan(0);
    for (const exercise of exercises) {
      expect(exercise.guide.setup.length, `${exercise.name} setup`).toBeGreaterThan(0);
      expect(exercise.guide.steps.length, `${exercise.name} steps`).toBeGreaterThan(0);
      expect(exercise.guide.cues.length, `${exercise.name} cues`).toBeGreaterThan(0);
      expect(exercise.guide.commonMistakes.length, `${exercise.name} mistakes`).toBeGreaterThan(0);
    }
  });

  it("keeps why and how guide content separate", () => {
    const exercise = getSessionPrepRoutine("Push").exercises.find((item) => item.name === "Cuban Press")!;

    expect(exercise.purpose).toBe("Prime shoulder rotation.");
    expect(exercise.guide.steps.join(" ")).toContain("Rotate");
    expect(exercise.guide.steps.join(" ")).not.toBe(exercise.purpose);
  });

  it("keeps movement guides free of rehab or pain-cure claims", () => {
    const copy = listMovementGuideNames()
      .map((name) => JSON.stringify(getMovementGuide(name)))
      .join(" ");

    expect(copy).not.toMatch(/rehab|therapy|cure|fix(es)? pain|treat(s|ing)? injury|recovery protocol/i);
  });

  it("keeps neck bridge guidance cautious if the progression is used", () => {
    const neckExercises = [
      ...listSessionPrepRoutines().flatMap((routine) => routine.exercises),
      ...listCapacityRoutines().flatMap((routine) => routine.exercises),
    ].filter((exercise) => /neck bridge/i.test(exercise.name));

    for (const exercise of neckExercises) {
      const copy = JSON.stringify(exercise.guide);
      expect(copy).toMatch(/advanced/i);
      expect(copy).toMatch(/dizziness/i);
      expect(copy).toMatch(/nerve/i);
      expect(copy).toMatch(/pain/i);
    }
  });
});
