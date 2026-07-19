import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { projectCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { projectCanonicalHome } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import { constructGoldenProgramme, canonicalRepresentativeGoldenCases } from "@/domain/training/canonical-adaptive-planning-certification";
import { resolveCanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { resolveCanonicalExactTarget } from "@/domain/training/canonical-exact-target-policy";
import { canonicalExperiencePlanningPolicy } from "@/domain/training/canonical-microcycle-volume-allocator";
import { canonicalHypertrophyLandmark, canonicalHypertrophyVolumePolicy, resolveCanonicalHypertrophyVolumeProgression } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { AllocatedSlot } from "@/domain/training/canonical-microcycle-volume-allocator";
import { exerciseLibrary } from "@/domain/training/presets";
import { selectSetMethod } from "@/domain/training/set-method-governance";

const fullGym = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;

describe("final canonical adaptive-planning product rules", () => {
  it("keeps the three experience levels materially distinct without treating advanced as automatic volume", () => {
    expect(Object.keys(canonicalExperiencePlanningPolicy).filter((key) => key !== "policyId")).toEqual(["beginner", "intermediate", "advanced"]);
    const beginner = construct("experience-beginner", "beginner");
    const intermediate = construct("experience-intermediate", "intermediate");
    const advanced = construct("experience-advanced", "advanced");
    expect(beginner.status).toBe("constructed"); expect(intermediate.status).toBe("constructed"); expect(advanced.status).toBe("constructed");
    if (beginner.status !== "constructed" || intermediate.status !== "constructed" || advanced.status !== "constructed") return;
    const sets = (result: typeof beginner) => result.carrier.plannedSessions.flatMap((session) => (session.prescriptionSnapshot as any).slots).reduce((sum: number, slot: any) => sum + slot.settings.requiredSets, 0);
    expect(sets(beginner)).toBeLessThan(sets(intermediate));
    expect(sets(advanced)).toBeGreaterThanOrEqual(sets(intermediate));
    expect(canonicalExperiencePlanningPolicy.advanced.planning).toContain("no_automatic_more_sets");
  });

  it("owns exact evidence-bounded add, retain, remove and reallocate rules", () => {
    const base = { experience: "intermediate" as const, region: "chest" as const, currentDirectSets: 7 };
    expect(resolveCanonicalHypertrophyVolumeProgression({ ...base, evidence: evidence("improving") })).toMatchObject({ disposition: "add_one_set", setDelta: 1 });
    expect(resolveCanonicalHypertrophyVolumeProgression({ ...base, currentDirectSets: 9, evidence: evidence("stable") })).toMatchObject({ disposition: "retain", setDelta: 0 });
    expect(resolveCanonicalHypertrophyVolumeProgression({ ...base, currentDirectSets: 12, evidence: { ...evidence("drop_off"), recovery: "local_fatigue", repeatedSignal: true } })).toMatchObject({ disposition: "remove_two_sets", setDelta: -2 });
    expect(resolveCanonicalHypertrophyVolumeProgression({ ...base, currentDirectSets: 10, evidence: { ...evidence("stagnating"), sourceRegionAtOrAboveTarget: true, destinationBelowTarget: true } })).toMatchObject({ disposition: "reallocate_one_set", setDelta: 0 });
    expect(resolveCanonicalHypertrophyVolumeProgression({ ...base, evidence: { ...evidence("stable"), recovery: "systemic_fatigue" } })).toMatchObject({ disposition: "review_systemic_fatigue", setDelta: 0 });
    expect(canonicalHypertrophyVolumePolicy.progression.add).toContain("three comparable completed observations");
  });

  it("keeps beginner, intermediate and advanced landmarks bounded by region", () => {
    const beginner = canonicalHypertrophyLandmark("beginner", "chest");
    const intermediate = canonicalHypertrophyLandmark("intermediate", "chest");
    const advanced = canonicalHypertrophyLandmark("advanced", "chest");
    expect(beginner.starting).toBeLessThan(intermediate.starting);
    expect(advanced.maximumAuthorisedStarting).toBeLessThanOrEqual(advanced.target.max);
    expect(intermediate.starting).toBeGreaterThanOrEqual(intermediate.target.min);
  });

  it("resolves exact method targets only inside Mesocycle permission", () => {
    const policyResult = resolveMesocyclePrescriptionPolicy("strength_accumulation", { goal: "build_strength" });
    expect(policyResult.status).toBe("resolved");
    if (policyResult.status !== "resolved") return;
    expect(policyResult.policy.methods.permitted).toContain("five_three_one");
    expect(selectSetMethod({ mesocycleId: "strength_accumulation", experience: "intermediate", exerciseRole: "primary_compound", sessionRole: "Squat strength" })).toBe("five_three_one");
    const exercise = exerciseLibrary.find((item) => item.id === "ex-bench-press")!;
    const target = resolveCanonicalExactTarget({ exercise, slot: slot(3), envelope: policyResult.policy.targetEnvelopes.primary.strength!, policy: policyResult.policy, lane: "strength", method: "five_three_one", experience: "intermediate" });
    expect(target).toMatchObject({ status: "resolved", targets: [5, 3, 1], targetKinds: ["reps", "reps", "reps"] });
    expect(selectSetMethod({ mesocycleId: "strength_accumulation", experience: "beginner", exerciseRole: "primary_compound", sessionRole: "Squat strength" })).not.toBe("five_three_one");
  });

  it("constructs a corrected dense five-day PPL with exact set targets and load states", () => {
    const result = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "intermediate-hypertrophy-5")!);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(result.rotation.publicFrameworkPreference).toBe("push_pull_legs");
    expect(result.sessions.map((session) => session.role)).toEqual(["Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D", "Pull hypertrophy E"]);
    expect(result.sessions.every((session) => session.exercises.length >= 6)).toBe(true);
    expect(result.sessions.every((session) => session.exercises.every((exercise) => exercise.exactReps.length === exercise.workingSets))).toBe(true);
    expect(result.accounting.totalWorkingSets).toBe(95);
    expect(result.accounting.totalWorkingSets).toBeGreaterThan(49);
    expect(result.sessions.flatMap((session) => session.exercises).some((exercise) => exercise.loadState === "calibration_required")).toBe(true);
  });

  it("requires direct transfer rationales for strength-focused assistance", () => {
    const result = constructGoldenProgramme(canonicalRepresentativeGoldenCases.find((item) => item.id === "intermediate-strength-4")!);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const strengthSessions = result.sessions.filter((session) => session.exercises.some((exercise) => exercise.transferRationale));
    expect(strengthSessions.length).toBeGreaterThan(0);
    expect(strengthSessions.every((session) => session.exercises.filter((exercise) => exercise.transferRationale).length >= 2)).toBe(true);
  });

  it("creates exact concurrent prescriptions and never changes the lifting count", () => {
    const base = { planId: "cardio", experience: "intermediate" as const, liftingDays: 4, liftingDayOffsets: [0, 1, 3, 4] };
    const lean = resolveCanonicalCardioPrescription({ ...base, goal: "get_leaner", preference: "recommended" });
    const athletic = resolveCanonicalCardioPrescription({ ...base, goal: "athletic_performance", preference: "recommended", sportSessionsPerWeek: 1 });
    const off = resolveCanonicalCardioPrescription({ ...base, goal: "build_muscle", preference: "off" });
    expect(lean.sessions).toHaveLength(3);
    expect(lean.sessions.every((session) => session.durationMinutes === 25 && session.intensity === "moderate_zone_2")).toBe(true);
    expect(athletic.sessions.some((session) => session.intervalStructure?.repetitions === 6)).toBe(true);
    expect(off).toMatchObject({ status: "off", weeklyFrequency: 0, sessions: [] });
    expect([...lean.interferenceRules, ...athletic.interferenceRules]).toContain("cardio_never_changes_lifting_session_count");
  });

  it("projects the next conditioning action on Home and the full schedule on Plan", () => {
    const construction = constructCanonicalActivePlanFromCanonicalInputs({ planId: "conditioning-presentations", createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: "body_recomposition", macrocycleGoal: "get_leaner", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", recoveryCardioPreference: "recommended", equipment: fullGym, units: "kg", exercises: exerciseLibrary });
    expect(construction.status).toBe("constructed");
    if (construction.status !== "constructed") return;
    const model = projectCanonicalActivePlan(construction.carrier);
    const home = projectCanonicalHome({ status: "ready", model });
    const plan = projectCanonicalPlanPresentation({ status: "ready", model });
    expect(home.conditioning?.detail).toContain("25 min");
    expect(plan.conditioning).toHaveLength(3);
    expect(plan.schedule).toHaveLength(4);
  });

  it("keeps onboarding free from internal strategies and legacy choices", () => {
    const source = readFileSync(new URL("../app/(protected)/onboarding.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/ASC Recommended|Body-Part Split|Bench\/Squat\/Deadlift|asc_recommended|body_part_split|bench_squat_deadlift/);
    expect(source).toContain("trainingExperiences.map");
    expect(readFileSync(new URL("../src/domain/training/training-experience.ts", import.meta.url), "utf8")).toContain('id: "advanced"');
  });
});

function construct(planId: string, experienceLevel: "beginner" | "intermediate" | "advanced") {
  return constructCanonicalActivePlanFromCanonicalInputs({ planId, createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: experienceLevel === "beginner" ? "beginner_hypertrophy" : "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel, daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: fullGym, units: "kg", exercises: exerciseLibrary });
}

function evidence(performance: "improving" | "stable" | "stagnating" | "drop_off" | "conflicting") { return { comparableObservations: 3, performance, recovery: "acceptable" as const, repeatedSignal: false }; }

function slot(workingSets: number): AllocatedSlot { return { sessionIndex: 0, sessionRole: "Bench strength", order: 0, exerciseRole: "primary_compound", constructionRole: "primary", muscles: ["chest"], requiredStimuli: ["chest"], purpose: "bench strength", movementPatterns: ["horizontal_push"], primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice", workingSets }; }
