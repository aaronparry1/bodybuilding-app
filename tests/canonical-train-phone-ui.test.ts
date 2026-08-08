import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalTrainNarrowLayout, canonicalTrainWorkoutActions, resolveCanonicalTrainCompletionAffordance, validateCanonicalCalibrationEntry, validateCanonicalTrainSetEntry } from "@/application/training/canonical-train-interaction";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";

const trainSource = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const tabsSource = readFileSync("app/(protected)/(tabs)/_layout.tsx", "utf8");

describe("phone-first canonical Train UI", () => {
  it("keeps preview read-only until its explicit Start action", () => {
    const preview = trainSource.slice(trainSource.indexOf("function WorkoutPreview"), trainSource.indexOf("function ExerciseNavigator"));
    expect(preview).toContain("Start workout");
    expect(preview.indexOf('testID="train-start"')).toBeLessThan(preview.indexOf("presentation.exercises.map"));
    expect(preview).toContain('testID="train-preview-details-toggle"');
    expect(preview).toContain("Review ${presentation.exercises.length} exercises");
    expect(preview).not.toContain("startCanonicalSession");
    expect(preview).not.toContain("recordCanonicalPerformedWork");
  });

  it("offers distinct minimise, finish-early, and discard actions and routes system back through minimise", () => {
    expect(canonicalTrainWorkoutActions.map((action) => action.label)).toEqual(["Resume later", "Finish early", "Discard workout"]);
    expect(trainSource).toContain("BackHandler.addEventListener");
    expect(trainSource).toContain("pauseAndLeave()");
    expect(trainSource).toContain('setModal("actions")');
    expect(trainSource).toContain("Minimise workout and return to Home");
    expect(trainSource).toContain("Discard active attempt?");
    expect(tabsSource).toMatch(/name="train" options=\{\{ title: "Train", headerShown: false/);
    expect(tabsSource).toContain("minimiseBeforeLeavingTrain");
    expect(tabsSource).not.toContain("focusedWorkoutActive ? null");
  });

  it("fulfils explicit resume navigation with one guarded canonical command", () => {
    expect(trainSource).toContain('route.lifecycle !== "resume"');
    expect(trainSource).toContain('aggregate.session.status !== "paused"');
    expect(trainSource).toContain("routeResumeAttempt.current === attempt");
    expect(trainSource).toContain("routeResumeAttempt.current = attempt");
    expect(trainSource).toContain("resume();");
    expect(trainSource).toContain('testID="train-resume"');
  });

  it("uses a bounded four-column set row with a non-wrapping accessible completion control", () => {
    const layout = canonicalTrainNarrowLayout(320, 1.4);
    expect(layout).toEqual({ rowGap: 6, setWidth: 36, doneWidth: 48, minimumHitSize: 44, horizontalOverflow: false, completionCanWrap: false });
    expect(trainSource).toContain(">Set</Text>");
    expect(trainSource).toContain(">Reps</Text>");
    expect(trainSource).toContain(">Load</Text>");
    expect(trainSource).toContain(">Done</Text>");
    expect(trainSource).toContain("styles.doneControl");
    expect(trainSource).toContain('numberOfLines={1} style={[styles.doneGlyph');
    expect(trainSource).not.toContain(">Complete</Text>");
  });

  it("validates the exact field before one authoritative performed-work command", () => {
    expect(validateCanonicalTrainSetEntry({ repsText: "6.5", loadText: "80", loadSemantic: "external_load", displayUnit: "kg" })).toEqual({ status: "invalid", field: "reps", reason: "Enter whole completed reps greater than zero." });
    expect(validateCanonicalTrainSetEntry({ repsText: "6", loadText: "", loadSemantic: "external_load", displayUnit: "kg" })).toMatchObject({ status: "invalid", field: "load" });
    expect(validateCanonicalTrainSetEntry({ repsText: "10", loadText: "", loadSemantic: "bodyweight", displayUnit: "kg" })).toEqual({ status: "valid", reps: 10, baseLoadKg: 0 });
    expect(trainSource.match(/recordCanonicalPerformedWork\(/g)).toHaveLength(1);
    expect(trainSource).toContain("inFlightSets.current.has(set.id)");
  });

  it("turns numeric keyboard completion into the current validated workout action", () => {
    expect(trainSource).toContain('label: "Confirm load"');
    expect(trainSource).toContain('label: "Log set"');
    expect(trainSource).toContain('label: "Save set"');
    expect(trainSource).toContain('testID="train-keyboard-action"');
    expect(trainSource).toContain("onSubmit={props.onConfirmCalibration}");
    expect(trainSource).toContain("onSubmitEditing={() => editing ? props.onSaveEdit(set) : current ? props.onComplete(set) : undefined}");
    expect(trainSource).not.toContain('testID="train-keyboard-done"');
  });

  it("requires exact calibration reps and exposes bodyweight, added-load, and assistance semantics", () => {
    expect(validateCanonicalCalibrationEntry({ repsText: "5", loadText: "60", exactTargetReps: 6, displayUnit: "kg" })).toMatchObject({ status: "invalid", field: "reps" });
    expect(validateCanonicalCalibrationEntry({ repsText: "6", loadText: "60", exactTargetReps: 6, displayUnit: "kg" })).toMatchObject({ status: "valid", reps: 6, baseLoadKg: 60 });
    const loadStates = [
      project({ state: "bodyweight", loadingMode: "bodyweight" }),
      project({ state: "bodyweight", loadingMode: "weighted_bodyweight" }),
      project({ state: "bodyweight", loadingMode: "assisted_bodyweight" }),
    ].map((result) => result.exercises[0]?.sets[0]);
    expect(loadStates.map((set) => [set?.loadSemantic, set?.loadLabel, set?.requiresLoadInput])).toEqual([
      ["bodyweight", "Bodyweight", false],
      ["added_load", "Added load", true],
      ["assistance", "Assistance", true],
    ]);
    expect(project({ state: "calibration_required", loadingMode: "rep_progression" }).exercises[0]?.calibration?.title).toBe("Find today’s starting load");
    expect(trainSource).toContain("Confirm starting load");
  });

  it("wires persisted rest controls, completed-set editing, and truthful completion affordances", () => {
    for (const token of ["restoreCanonicalRestTimer", "pauseCanonicalRestTimer", "resumeCanonicalRestTimer", "addCanonicalRestTime", "skipCanonicalRestTimer", "editCanonicalPerformedWork", "Finish early?"]) expect(trainSource).toContain(token);
    expect(trainSource).toContain("Edit completed set");
    expect(trainSource).toContain("Save edits to set");
    expect(resolveCanonicalTrainCompletionAffordance(1, 22, true)).toEqual({ normalFinishAvailable: false, earlyFinishAvailable: true, completedSets: 1, remainingSets: 21 });
    expect(resolveCanonicalTrainCompletionAffordance(22, 22, true)).toEqual({ normalFinishAvailable: true, earlyFinishAvailable: false, completedSets: 22, remainingSets: 0 });
    expect(trainSource).not.toContain("Your recorded working sets are ready to complete.");
    expect(trainSource).toContain("isPositiveTrainFeedback");
    expect(trainSource).toContain("feedbackBannerPositive");
    expect(trainSource).toContain('positiveFeedback ? "polite" : "assertive"');
  });

  it("keeps the current exercise focused and opens the full list only on demand", () => {
    expect(trainSource).toContain("function ExerciseNavigator");
    expect(trainSource).toContain("function ExerciseSwitcherModal");
    expect(trainSource).toContain('testID="train-exercise-switcher-open"');
    expect(trainSource).toContain('testID="train-all-sets-toggle"');
    expect(trainSource).not.toContain("function ExerciseRail");
    expect(trainSource).not.toContain("<ExerciseRail");
  });

  it("rejects legacy authority and raw internal labels recursively", () => {
    expect(trainSource).not.toMatch(/ActiveTrainingPlan|TrainingBlock|TrainingYear|activeBlockId|currentBlock|progressionState|workoutSessionRepository|buildWorkout|legacyProgramme/);
    const result = projectCanonicalWorkoutPresentation({ session: null, snapshot: snapshot({ state: "unavailable", loadingMode: "unavailable" }) });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/ex-test|straight_sets|canonical_session_snapshot/);
    expect(serialized).toContain("Exercise unavailable");
    expect(serialized).toContain("Load unavailable");
  });
});

function project(load: { state: string; loadingMode: string }) { return projectCanonicalWorkoutPresentation({ session: null, snapshot: snapshot(load) }); }
function snapshot(load: { state: string; loadingMode: string }) { return { schemaVersion: "canonical_session_snapshot_v3", sessionId: "planned", role: "Upper", slots: [{ id: "slot-test", index: 0, exerciseId: "ex-test", method: "straight_sets", loadingMode: load.loadingMode, settings: { requiredSets: 1, repRange: { min: 8, max: 12 } }, targetReps: 8, rest: { seconds: 90 }, loadPrescription: { schemaVersion: "canonical_load_prescription_v1", ...load, instruction: "test", reason: "test", evidenceStatus: "missing" } }] }; }
