import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { constructCanonicalActivePlanFromCanonicalInputs, type CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import {
  completeCanonicalOnboardingSetup,
  normalizeRecentTrainingInput,
  onboardingStepKeys,
  resolveExecutableOnboardingFrameworks,
} from "@/application/training/canonical-onboarding-setup";
import { appSettingsStore } from "@/application/settings/app-settings";
import { startCanonicalSession, prescriptionHash } from "@/application/training/canonical-recorded-session-application";
import { commitCanonicalOnboardingPlan } from "@/application/training/canonical-release-reconciliation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import type { PreferredSplit } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";

const reportedStartingContext: CanonicalStartingVolumeContext = {
  continuity: "currently_training",
  recentTrainingDaysPerWeek: 3,
  recentSessionWorkload: "high",
  recentSessionDurationMinutes: 90,
  recovery: "ordinary",
  history: "none",
  workCapacity: "not_demonstrated",
  concurrentSport: "none",
  loadConfidence: "calibration_required",
  dosageConfidence: "declared_recent_training",
};

function reportedInput(
  preferredSplit: PreferredSplit = "push_pull_legs",
  timestamp = "2026-07-25T08:00:00.000Z",
): CanonicalGeneratedPlanInput {
  return {
    planId: `reported-five-day-hypertrophy:${timestamp}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "advanced",
    daysPerWeek: 5,
    preferredSplit,
    equipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight", "bands", "other"],
    units: "kg",
    recoveryCardioPreference: "recommended",
    availableSessionMinutes: 90,
    startingVolumeContext: reportedStartingContext,
    exercises: exerciseLibrary,
  };
}

describe("onboarding programme integrity", () => {
  beforeEach(() => {
    canonicalActivePlanV2Repository.clear();
    canonicalRecordedSessionLedger.clear();
    jsonStore.resetCache();
    canonicalActivePlanState.clear();
    vi.restoreAllMocks();
  });

  it("constructs every executable framework shown for advanced five-day hypertrophy", () => {
    const { planId: _planId, createdAt: _createdAt, updatedAt: _updatedAt, preferredSplit: _preferredSplit, ...facts } = reportedInput();
    const options = resolveExecutableOnboardingFrameworks({ ...facts, goalId: "build_muscle" });

    expect(options.map((option) => option.value)).toEqual([
      "let_app_choose",
      "push_pull_legs",
      "upper_lower",
      "full_body",
      "body_part_split",
    ]);
    expect(options[0]).toMatchObject({ label: "ASC Recommended", resolvedLabel: "Push/Pull/Legs", isRecommended: true });

    for (const option of options) {
      const result = constructCanonicalActivePlanFromCanonicalInputs(reportedInput(option.value));
      expect(result.status, result.status === "constructed" ? "" : `${option.value}:${result.reason}`).toBe("constructed");
      if (result.status === "constructed") expect(result.carrier.plannedSessions).toHaveLength(5);
    }
  });

  it("bypasses a framework non-choice but retains real multiple-choice steps", () => {
    const { planId: _planId, createdAt: _createdAt, updatedAt: _updatedAt, preferredSplit: _preferredSplit, ...facts } = reportedInput();
    const soleOption = resolveExecutableOnboardingFrameworks({
      ...facts,
      goalId: "build_muscle",
      daysPerWeek: 6,
    });
    expect(soleOption.map((option) => option.value)).toEqual(["push_pull_legs"]);
    expect(onboardingStepKeys({ eventDriven: false, frameworkOptionCount: soleOption.length })).not.toContain("split");
    expect(onboardingStepKeys({ eventDriven: false, frameworkOptionCount: 5 })).toContain("split");
  });

  it("preserves a selected supported framework across deterministic recalculation", () => {
    const { planId: _planId, createdAt: _createdAt, updatedAt: _updatedAt, preferredSplit: _preferredSplit, ...facts } = reportedInput();
    const before = resolveExecutableOnboardingFrameworks({ ...facts, goalId: "build_muscle" });
    const selected: PreferredSplit = "upper_lower";
    const after = resolveExecutableOnboardingFrameworks({ ...facts, goalId: "build_muscle" });
    expect(before.some((option) => option.value === selected)).toBe(true);
    expect(after.some((option) => option.value === selected)).toBe(true);
    expect(after).toEqual(before);
  });

  it("normalizes contradictory recent-training state without asking layoff users for a second frequency", () => {
    expect(normalizeRecentTrainingInput({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 0,
    })).toEqual({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 1,
    });
    expect(normalizeRecentTrainingInput({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 3,
    })).toEqual({
      continuity: "currently_training",
      recentTrainingDaysPerWeek: 3,
    });
    expect(normalizeRecentTrainingInput({
      continuity: "short_layoff",
      recentTrainingDaysPerWeek: 3,
    })).toEqual({
      continuity: "short_layoff",
      recentTrainingDaysPerWeek: 0,
    });
  });

  it("persists the supplied fixture once and projects a planned first session with zero completed sessions", () => {
    const input = reportedInput();
    expect(commitCanonicalOnboardingPlan(input)).toMatchObject({
      status: "saved",
      reason: "onboarding_created_canonical_plan",
      priorRevision: null,
      newRevision: 0,
    });
    canonicalActivePlanState.hydrate();
    const home = readCanonicalHomeProjection();
    expect(home.primary).toMatchObject({
      kind: "planned",
      ctaLabel: "Review workout",
      workout: { lifecycle: "planned", completedSetCount: 0 },
    });
    expect(home.programme).toMatchObject({
      sessionPosition: "Session 1 of 5",
      completionLabel: "0 of 5 sessions completed",
    });
  });

  it("derives exercise, set, and duration summaries from the same generated session snapshot", () => {
    expect(commitCanonicalOnboardingPlan(reportedInput()).status).toBe("saved");
    canonicalActivePlanState.hydrate();
    const home = readCanonicalHomeProjection();
    const stored = canonicalActivePlanV2Repository.get();
    expect(stored.status).toBe("saved");
    if (stored.status !== "saved") return;
    const snapshot = stored.carrier.plannedSessions[0]!.prescriptionSnapshot as CanonicalSessionSnapshotV3;
    const slots = snapshot.slots;
    const workingSets = slots.reduce((total, slot) => total + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0);
    expect(home.primary?.workout).toMatchObject({
      exerciseCount: slots.length,
      workingSetCount: workingSets,
      estimatedDurationMinutes: snapshot.estimatedDurationMinutes,
    });
    expect(home.primary?.workout).toMatchObject({
      exerciseCount: 6,
      workingSetCount: 22,
      estimatedDurationMinutes: 60,
    });
    expect(snapshot.estimatedDurationMinutes).toBeLessThanOrEqual(90);
  });

  it("changes Start to Continue only after explicitly starting the same workout", () => {
    expect(commitCanonicalOnboardingPlan(reportedInput()).status).toBe("saved");
    const stored = canonicalActivePlanV2Repository.get();
    if (stored.status !== "saved") throw new Error("plan missing");
    const planned = stored.carrier.plannedSessions[0]!;
    expect(startCanonicalSession({
      planId: stored.carrier.planId,
      expectedPlanRevision: stored.carrier.revision,
      plannedSessionId: planned.id,
      expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
      operationId: "onboarding-integrity:start",
      startedAt: "2026-07-25T08:01:00.000Z",
      provenance: "onboarding_integrity_test",
    }).status).toBe("started");
    canonicalActivePlanState.hydrate();
    expect(readCanonicalHomeProjection().primary).toMatchObject({
      kind: "active",
      ctaLabel: "Continue workout",
    });
  });

  it("fails an atomic storage write without leaving a programme, workout, or completion state", () => {
    vi.spyOn(canonicalActivePlanV2Repository, "saveAtomically").mockReturnValueOnce({
      status: "invalid",
      reason: "storage_write_failed",
    });
    expect(commitCanonicalOnboardingPlan(reportedInput())).toMatchObject({
      status: "rejected",
      reason: "atomic_onboarding_commit_failed",
      priorRevision: null,
      newRevision: null,
    });
    expect(canonicalActivePlanV2Repository.get().status).toBe("missing");
    expect(canonicalRecordedSessionLedger.list(reportedInput().planId)).toEqual([]);
  });

  it("rolls the canonical carrier back if onboarding settings cannot be persisted", () => {
    const previousSettings = appSettingsStore.get();
    vi.spyOn(appSettingsStore, "patch").mockImplementationOnce(() => {
      throw new Error("synthetic settings failure");
    });
    const input = reportedInput();
    expect(completeCanonicalOnboardingSetup({
      command: input,
      settings: {
        unit: "kg",
        trainingGoal: "hypertrophy",
        experienceLevel: "advanced",
        recoveryCardioPreference: "recommended",
        availableSessionMinutes: 90,
        startingVolumeContext: reportedStartingContext,
      },
    })).toMatchObject({
      status: "rejected",
      reason: "onboarding_settings_persistence_failed",
      rollback: "restored",
    });
    expect(canonicalActivePlanV2Repository.get().status).toBe("missing");
    expect(appSettingsStore.get()).toEqual(previousSettings);
  });

  it("is idempotent when the same creation operation is retried", () => {
    const input = reportedInput();
    expect(commitCanonicalOnboardingPlan(input).status).toBe("saved");
    const first = canonicalActivePlanV2Repository.get();
    expect(commitCanonicalOnboardingPlan(input)).toMatchObject({
      status: "saved",
      reason: "onboarding_commit_already_applied",
      priorRevision: 0,
      newRevision: 0,
    });
    expect(canonicalActivePlanV2Repository.get()).toEqual(first);
  });

  it("reports the actual active-attempt collision and leaves the prior carrier byte-for-byte unchanged", () => {
    expect(commitCanonicalOnboardingPlan(reportedInput()).status).toBe("saved");
    const current = canonicalActivePlanV2Repository.get();
    if (current.status !== "saved") throw new Error("plan missing");
    const planned = current.carrier.plannedSessions[0]!;
    expect(startCanonicalSession({
      planId: current.carrier.planId,
      expectedPlanRevision: current.carrier.revision,
      plannedSessionId: planned.id,
      expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
      operationId: "onboarding-integrity:collision",
      startedAt: "2026-07-25T08:01:00.000Z",
      provenance: "onboarding_integrity_test",
    }).status).toBe("started");
    const before = canonicalActivePlanV2Repository.get();
    expect(commitCanonicalOnboardingPlan(reportedInput("upper_lower", "2026-07-25T09:00:00.000Z"))).toMatchObject({
      status: "rejected",
      reason: "active_attempt_must_be_completed_or_discarded",
    });
    expect(canonicalActivePlanV2Repository.get()).toEqual(before);
  });

  it("keeps layout, plain-language, and Home metric source boundaries explicit", () => {
    const onboarding = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    const primitives = readFileSync("src/ui/primitives.tsx", "utf8");
    const home = readFileSync("src/ui/home-dashboard.tsx", "utf8");
    expect(onboarding).toContain("<AppScreen bottom={96} respectTopSafeArea scrollRef={scrollRef}>");
    expect(onboarding).toContain("scrollRef.current?.scrollTo({ y: 0, animated: false })");
    expect(primitives).toContain("respectTopSafeArea ? Math.max(spacing.lg, insets.top)");
    expect(onboarding).not.toContain('"weekly session budget"');
    expect(onboarding).not.toContain('"first dose"');
    expect(onboarding).not.toContain('"recovery budget"');
    expect(onboarding).not.toContain('"provisional starting point"');
    expect(home).toContain("primary.workout.exerciseCount");
    expect(home).toContain("primary.workout.workingSetCount");
    expect(home).toContain("projection.progress.headline");
    expect(home).toContain("projection.progress.completedThisMicrocycle");
    expect(home).not.toContain("CURRENT SESSION WORKING SETS");
  });
});
