import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { buildCanonicalPlanningCertificationArtifacts, canonicalCertificationGoals, canonicalRepresentativeGoldenCases, constructGoldenProgramme, planningArtifactMarkdown } from "@/domain/training/canonical-adaptive-planning-certification";
import { canonicalPlanningAuthority, canonicalPlanningInputRegistry, canonicalPlanningPrecedence, validateCanonicalPlanningActivation } from "@/domain/training/canonical-adaptive-planning-system";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { validateMacrocycleTimeline } from "@/domain/training/macrocycle-engine";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { createMicrocycle, reflowCanonicalMicrocycleAfterMissedSession } from "@/domain/training/microcycle-scheduler";
import type { Equipment, ExperienceLevel, ProgrammeGoal } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { getCustomerFrameworksForFrequency, getSelectableFrameworkOptionsForGoal, resolveCanonicalProgrammeFramework } from "@/domain/training/programme-framework-rules";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";

const reportsDirectory = new URL("../qa-reports/planning-system/", import.meta.url);
const fullEquipment: readonly Equipment[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];

describe("complete canonical adaptive planning system", () => {
  it("has one typed influential-input registry and explicit precedence", () => {
    expect(canonicalPlanningInputRegistry.length).toBeGreaterThanOrEqual(25);
    expect(new Set(canonicalPlanningInputRegistry.map((entry) => entry.id)).size).toBe(canonicalPlanningInputRegistry.length);
    expect(canonicalPlanningInputRegistry.every((entry) => entry.sourceOfTruth && entry.validation && entry.applies)).toBe(true);
    expect(canonicalPlanningPrecedence[0]).toBe("safety_or_limitation");
    expect(canonicalPlanningAuthority.map((entry) => entry.owner)).toEqual(["Macrocycle", "Mesocycle", "Microcycle", "Session Construction", "Set Prescription", "Progress"]);
    const sensitivity = buildCanonicalPlanningCertificationArtifacts()["variable-sensitivity"].results;
    expect(sensitivity.map((entry) => entry.input)).toEqual(canonicalPlanningInputRegistry.map((entry) => entry.id));
    expect(sensitivity.every((entry) => entry.evidence !== "missing_evidence")).toBe(true);
  });

  it("constructs every onboarding-selectable goal × experience × 2-6-day × framework case", () => {
    let count = 0;
    for (const goal of canonicalCertificationGoals) {
      for (const experience of ["beginner", "intermediate", "advanced"] as const) {
        for (const frequency of [2, 3, 4, 5, 6] as const) {
          for (const option of getSelectableFrameworkOptionsForGoal(goal.uiGoal, frequency)) {
            count += 1;
            const result = construct(goal.setupGoal, programmeGoal(goal.setupGoal, experience), experience, frequency, preferredSplit(option.id), fullEquipment, `matrix-${count}`);
            expect(result.status, `${goal.setupGoal}/${experience}/${frequency}/${option.id}:${result.status === "constructed" ? "" : result.reason}`).toBe("constructed");
            if (result.status === "constructed") {
              expect(result.carrier.planningRationale?.goalStrategyId).toMatch(/^canonical_goal_/);
              expect(result.carrier.planningRationale?.rotationReasons).toContain(`frequency:${frequency}`);
              expect(result.carrier.planningRationale?.sessionReasons).toHaveLength(frequency);
            }
          }
        }
      }
    }
    expect(count).toBe(120);
  });

  it("uses the exact three-framework frequency truth table", () => {
    expect([2, 3, 4, 5, 6].map((frequency) => getCustomerFrameworksForFrequency(frequency))).toEqual([
      ["full_body", "upper_lower"],
      ["full_body", "push_pull_legs"],
      ["upper_lower", "push_pull_legs"],
      ["push_pull_legs"],
      ["push_pull_legs"],
    ]);
    for (const goal of ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"] as const) {
      for (const frequency of [2, 3, 4, 5, 6]) expect(getSelectableFrameworkOptionsForGoal(goal, frequency).every((option) => ["full_body", "upper_lower", "push_pull_legs"].includes(option.id))).toBe(true);
    }
  });

  it("lets phase authority morph delivery without imprisoning or ignoring preference", () => {
    expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle_and_strength", sessionsPerWeek: 5, requested: "push_pull_legs", phase: "powerbuilding_hypertrophy" })).toMatchObject({ status: "resolved", framework: "push_pull_legs", reason: "explicit_supported_preference" });
    expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle_and_strength", sessionsPerWeek: 5, requested: "push_pull_legs", phase: "powerbuilding_intensification" })).toMatchObject({ status: "resolved", framework: "bench_squat_deadlift", reason: "phase_specific_morph" });
    expect(resolveCanonicalProgrammeFramework({ goal: "build_strength", sessionsPerWeek: 4, requested: "upper_lower", phase: "strength_specific" })).toMatchObject({ status: "resolved", framework: "bench_squat_deadlift" });
    expect(resolveCanonicalProgrammeFramework({ goal: "athletic_performance", sessionsPerWeek: 4, requested: "upper_lower", phase: "athletic_power" })).toMatchObject({ status: "resolved", framework: "upper_lower", morphPolicy: { deliveryStrategy: "athletic_asymmetric_rotation" } });
  });

  it("certifies every representative golden case or records its explicit unsupported contract", () => {
    const results = canonicalRepresentativeGoldenCases.map(constructGoldenProgramme);
    for (const result of results) {
      const expected = canonicalRepresentativeGoldenCases.find((item) => item.id === result.id)!.expected;
      expect(result.status).toBe(expected === "constructed" ? "constructed" : "unsupported");
      if (result.status === "constructed") {
        expect(result.certification.allocation.status).toBe("passed");
        expect(result.certification.constructed.status).toBe("passed");
        expect(result.sessions.every((session) => session.exercises.length > 0 && session.workingSets! > 0)).toBe(true);
      }
    }
  });

  it("constructs the dense intermediate hypertrophy five-day PPL from production paths", () => {
    const options = getSelectableFrameworkOptionsForGoal("build_muscle", 5);
    expect(options.map((option) => option.id)).toEqual(["push_pull_legs"]);
    const outputs = options.map((option) => constructGoldenProgramme({ id: `five-${option.id}`, label: option.displayName, setupGoal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", frequency: 5, framework: preferredSplit(option.id), equipment: fullEquipment, expected: "constructed" }));
    expect(outputs.every((output) => output.status === "constructed")).toBe(true);
    for (const output of outputs) if (output.status === "constructed") {
      expect(output.sessions).toHaveLength(5);
      expect(output.sessions.every((session) => session.exercises.every((exercise) => exercise.workingSets! > 0 && exercise.exactReps.length === exercise.workingSets && exercise.restSeconds > 0))).toBe(true);
      expect(output.accounting.totalWorkingSets).toBeGreaterThan(49);
      expect(output.accounting.perSessionEstimatedMinutes.every((minutes) => minutes <= 90)).toBe(true);
    }
    const paired = buildCanonicalPlanningCertificationArtifacts()["intermediate-hypertrophy-five-day"].cases;
    expect(paired).toHaveLength(2);
    for (const option of options) {
      const cases = paired.flatMap((item) => item.status === "constructed" && item.input.requestedFramework === preferredSplit(option.id) ? [item] : []);
      expect(cases).toHaveLength(2);
      expect(cases.find((item) => item.input.establishedHistory === false)?.sessions.flatMap((session) => session.exercises).some((exercise) => exercise.loadState === "calibration_required")).toBe(true);
      expect(cases.find((item) => item.input.establishedHistory === true)?.sessions.flatMap((session) => session.exercises).some((exercise) => exercise.loadState === "established")).toBe(true);
    }
  });

  it("treats units as presentation while retaining physiological targets", () => {
    const kg = construct("build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", fullEquipment, "unit-kg", "kg");
    const lb = construct("build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", fullEquipment, "unit-lb", "lb");
    expect(kg.status).toBe("constructed"); expect(lb.status).toBe("constructed");
    if (kg.status !== "constructed" || lb.status !== "constructed") return;
    expect(physiology(kg.carrier.plannedSessions.map((item) => item.prescriptionSnapshot as CanonicalSessionSnapshotV3))).toEqual(physiology(lb.carrier.plannedSessions.map((item) => item.prescriptionSnapshot as CanonicalSessionSnapshotV3)));
  });

  it("changes equipment selection without omitting the owned slot coverage", () => {
    const dumbbells = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "limited-dumbbells")!);
    const machines = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "limited-machines")!);
    expect(dumbbells.status).toBe("constructed"); expect(machines.status).toBe("constructed");
    if (dumbbells.status !== "constructed" || machines.status !== "constructed") return;
    expect(dumbbells.sessions.flatMap((session) => session.exercises).map((exercise) => exercise.exerciseId)).not.toEqual(machines.sessions.flatMap((session) => session.exercises).map((exercise) => exercise.exerciseId));
    for (const requiredRegion of ["chest", "lats", "upper_back", "quadriceps", "hip_extension", "hamstrings_knee_flexion", "calves"]) {
      expect(dumbbells.accounting.directSets[requiredRegion as keyof typeof dumbbells.accounting.directSets]).toBeGreaterThan(0);
      expect(machines.accounting.directSets[requiredRegion as keyof typeof machines.accounting.directSets]).toBeGreaterThan(0);
    }
  });

  it("constructs a coherent barbell-and-bodyweight plan without inventing unavailable isolation work", () => {
    const result = construct("build_muscle", "hypertrophy", "intermediate", 4, "upper_lower", ["barbell"], "limited-barbell");
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const snapshots = result.carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
    expect(snapshots.flatMap((snapshot) => snapshot.slots).every((slot) => slot.loadPrescription.state !== "unavailable")).toBe(true);
    expect(snapshots.flatMap((snapshot) => snapshot.slots).some((slot) => slot.loadPrescription.state === "bodyweight")).toBe(true);
  });

  it("lets learned preference influence a valid equivalent but never create or remove a slot", () => {
    const baseInput = { planId: "preference-base", createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: "hypertrophy" as const, macrocycleGoal: "build_muscle" as const, experienceLevel: "intermediate" as const, daysPerWeek: 4 as const, preferredSplit: "upper_lower" as const, equipment: fullEquipment, units: "kg" as const, exercises: exerciseLibrary };
    const baseline = constructCanonicalActivePlanFromCanonicalInputs(baseInput);
    expect(baseline.status).toBe("constructed");
    if (baseline.status !== "constructed") return;
    const baselineSnapshot = baseline.carrier.plannedSessions[0]!.prescriptionSnapshot as CanonicalSessionSnapshotV3;
    const avoidedExerciseId = baselineSnapshot.slots[0]!.exerciseId;
    const preferred = constructCanonicalActivePlanFromCanonicalInputs({ ...baseInput, planId: "preference-applied", exercisePreferences: { [avoidedExerciseId]: { avoidedExerciseId, reason: "dislike_exercise", action: "swap", count: 6, firstAt: "2026-07-01T00:00:00.000Z", lastAt: "2026-07-18T00:00:00.000Z", recency: "2026-07-18T00:00:00.000Z", temporary: false, confidence: "high", persistent: true } } });
    expect(preferred.status).toBe("constructed");
    if (preferred.status !== "constructed") return;
    const preferredSnapshot = preferred.carrier.plannedSessions[0]!.prescriptionSnapshot as CanonicalSessionSnapshotV3;
    expect(preferredSnapshot.slots).toHaveLength(baselineSnapshot.slots.length);
    expect(preferredSnapshot.slots[0]!.exerciseId).not.toBe(avoidedExerciseId);
    expect(preferredSnapshot.slots[0]!.reason).toBe(baselineSnapshot.slots[0]!.reason);
  });

  it("uses established evidence for loads and does not convert missing load to zero", () => {
    const established = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "established-loads")!);
    const absent = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "no-load-history")!);
    expect(established.status).toBe("constructed"); expect(absent.status).toBe("constructed");
    if (established.status !== "constructed" || absent.status !== "constructed") return;
    expect(established.sessions.flatMap((item) => item.exercises).some((item) => item.loadState === "established" && item.prescribedBaseLoad === 50)).toBe(true);
    expect(absent.sessions.flatMap((item) => item.exercises).some((item) => item.loadState === "calibration_required")).toBe(true);
    expect(absent.sessions.flatMap((item) => item.exercises).some((item) => item.prescribedBaseLoad === 0)).toBe(false);
  });

  it("applies a typed limitation before preference or variety", () => {
    const limited = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "exercise-limitation")!);
    expect(limited.status).toBe("constructed");
    if (limited.status !== "constructed") return;
    expect(limited.sessions.flatMap((session) => session.exercises).map((exercise) => exercise.exerciseId)).not.toContain("ex-bench-press");
    expect(limited.certification.constructed.status).toBe("passed");
  });

  it("reflows a missed session without changing order or inventing a deload", () => {
    const original = createMicrocycle({ parentMesocycleId: "hypertrophy_base", trainingDays: 5, split: "push_pull_legs" });
    const reflowed = reflowCanonicalMicrocycleAfterMissedSession(original, 3, 2);
    expect(reflowed.sessionRoles).toEqual(original.sessionRoles);
    expect(reflowed.sessionDayOffsets.slice(0, 3)).toEqual(original.sessionDayOffsets.slice(0, 3));
    expect(reflowed.sessionDayOffsets.slice(3)).toEqual(original.sessionDayOffsets.slice(3).map((day) => day + 2));
    expect(reflowed.scheduleMode).toBe("asymmetric_rotation");
    expect(reflowed.progressionState).toBe("repeat");
  });

  it("keeps advanced methods inside explicit Mesocycle authority", () => {
    for (const mesocycle of mesocycleLibrary) {
      const result = resolveMesocyclePrescriptionPolicy(mesocycle.id, { goal: mesocycle.engine === "hypertrophy" ? "build_muscle" : mesocycle.engine === "powerbuilding" ? "build_muscle_and_strength" : mesocycle.engine === "strength" ? "build_strength" : "athletic_performance" });
      expect(result.status).toBe("resolved");
      if (result.status !== "resolved") continue;
      if (/powerbuilding_(foundation|hypertrophy|strength)/.test(mesocycle.id)) expect(result.policy.methods.permitted).not.toContain("dynamic_effort");
      if (/taper|intensification/.test(mesocycle.id)) expect(result.policy.methods.permitted).not.toContain("eight_across");
      if (/taper|transition|consolidation|realisation/.test(mesocycle.id)) expect(result.policy.methods.conditional).not.toContain("bbb");
      expect(result.policy.methods.permitted.filter((method) => result.policy.methods.prohibited.includes(method))).toEqual([]);
    }
  });

  it("fails activation closed for unsafe or impossible inputs", () => {
    expect(validateCanonicalPlanningActivation({ goal: "build_muscle", experience: "intermediate", daysPerWeek: 5, preferredSplit: "bench_squat_deadlift", equipment: fullEquipment, units: "kg", createdAt: "2026-07-19" })).toMatchObject({ status: "invalid", reason: "unsupported_input_combination" });
    expect(validateCanonicalPlanningActivation({ goal: "build_muscle", experience: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: fullEquipment, units: "kg", createdAt: "2026-07-19", limitations: ["shoulder hurts"] })).toMatchObject({ status: "invalid", reason: "unsafe_limitation_conflict" });
    expect(validateMacrocycleTimeline("build_strength", "intermediate", "2026-08-01", "2026-07-19")).toMatchObject({ status: "invalid", reason: "impossible_event_timeline" });
  });

  it("keeps canonical planning source free of legacy annual/block authority", () => {
    for (const relative of ["src/application/training/canonical-active-plan-construction.ts", "src/domain/training/canonical-adaptive-planning-system.ts", "src/domain/training/canonical-microcycle-volume-allocator.ts", "src/domain/training/canonical-session-construction-pipeline.ts"]) {
      const source = readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/ActiveTrainingPlan|TrainingBlock|TrainingYear|annualPlanner|currentBlock|activeBlockId/);
    }
  });

  it("matches deterministic machine-readable and readable certification artifacts", () => {
    const artifacts = buildCanonicalPlanningCertificationArtifacts();
    if (process.env.UPDATE_CANONICAL_PLANNING_REPORTS === "1") {
      if (!existsSync(reportsDirectory)) mkdirSync(reportsDirectory, { recursive: true });
      for (const [name, artifact] of Object.entries(artifacts)) {
        writeFileSync(new URL(`${name}.json`, reportsDirectory), `${JSON.stringify(artifact, null, 2)}\n`);
        writeFileSync(new URL(`${name}.md`, reportsDirectory), planningArtifactMarkdown(name, artifact));
      }
    }
    for (const [name, artifact] of Object.entries(artifacts)) {
      expect(readFileSync(new URL(`${name}.json`, reportsDirectory), "utf8")).toBe(`${JSON.stringify(artifact, null, 2)}\n`);
      expect(readFileSync(new URL(`${name}.md`, reportsDirectory), "utf8")).toBe(planningArtifactMarkdown(name, artifact));
    }
  });
});

function construct(goal: TrainingSetupGoal, programme: ProgrammeGoal, experience: ExperienceLevel, frequency: 2 | 3 | 4 | 5 | 6, framework: PreferredSplit, equipment: readonly Equipment[], id: string, units: "kg" | "lb" = "kg") {
  return constructCanonicalActivePlanFromCanonicalInputs({ planId: id, createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: programme, macrocycleGoal: goal, experienceLevel: experience, daysPerWeek: frequency, preferredSplit: framework, equipment, units, exercises: exerciseLibrary });
}
function programmeGoal(goal: TrainingSetupGoal, experience: ExperienceLevel): ProgrammeGoal { if (goal === "build_strength" || goal === "build_muscle_and_strength" || goal === "powerlifting_meet") return "strength_hypertrophy"; if (goal === "get_leaner") return "body_recomposition"; return experience === "beginner" ? "beginner_hypertrophy" : "hypertrophy"; }
function preferredSplit(framework: string): PreferredSplit { return framework === "asc_recommended" ? "let_app_choose" : framework === "body_part_split" ? "body_part_split" : framework as PreferredSplit; }
function physiology(snapshots: readonly CanonicalSessionSnapshotV3[]) { return snapshots.map((snapshot) => snapshot.slots.map((slot) => ({ exerciseId: slot.exerciseId, sets: slot.settings.requiredSets, targetReps: slot.targetReps, exactTargets: slot.exactTargets, lane: slot.lane, method: slot.method, restSeconds: slot.rest.seconds, loadState: slot.loadPrescription.state, baseLoad: slot.loadPrescription.state === "established" ? slot.loadPrescription.prescribedBaseLoad : undefined }))); }
