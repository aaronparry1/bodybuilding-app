import { describe, expect, it, vi } from "vitest";
import { resolveCanonicalStartupHydration } from "@/application/training/canonical-startup-hydration";
import { projectCanonicalHome } from "@/application/training/canonical-home-projection";
import { restoreCloudDataForUser } from "@/application/sync/cloud-data-sync";
import { STARTUP_BRANCH_DEADLINE_MS } from "@/application/startup/startup-observability";

describe("Living Programme Stage 1 startup", () => {
  it.each(["idle", "restoring", "delayed", "error"] as const)("keeps a valid local plan interactive while cloud state is %s", (accountDataStatus) => {
    expect(resolveCanonicalStartupHydration({ authLoading: false, authenticatedUserId: "account-a", localPlanStatus: "saved", retainedTrainingStatus: "plan", accountDataStatus })).toEqual({ status: "ready", reason: "local_plan_available" });
  });

  it("does not expose mismatched account data", () => {
    expect(resolveCanonicalStartupHydration({ authLoading: false, authenticatedUserId: "account-b", localPlanStatus: "saved", retainedTrainingStatus: "account_mismatch", accountDataStatus: "restoring" }).status).toBe("retry_required");
  });

  it("waits for remote restoration only when no safe local plan exists", () => {
    expect(resolveCanonicalStartupHydration({ authLoading: false, authenticatedUserId: "account-a", localPlanStatus: "missing", retainedTrainingStatus: "none", accountDataStatus: "restoring" })).toEqual({ status: "waiting", reason: "account_data_restoring" });
  });

  it("makes a timed-out missing-plan restore recoverable", () => {
    expect(resolveCanonicalStartupHydration({ authLoading: false, authenticatedUserId: "account-a", localPlanStatus: "missing", retainedTrainingStatus: "none", accountDataStatus: "delayed" })).toEqual({ status: "retry_required", reason: "account_data_restore_failed" });
  });

  it("isolates stalled remote branches behind a finite deadline", async () => {
    vi.useFakeTimers();
    const never = <T,>() => new Promise<T>(() => undefined);
    const restore = restoreCloudDataForUser("account-a", {
      client: {} as never,
      workoutCloudRepository: { loadWorkoutHistory: () => never() },
      programmeCloudRepository: { loadProgrammes: () => never() },
      exerciseCloudRepository: { loadExercises: () => never() },
      userSettingsCloudRepository: { loadUserSettingsBlob: () => never() },
      localWorkoutRepository: { list: () => [], save: () => undefined },
    });
    const assertion = expect(restore).resolves.toMatchObject({ settingsReadStatus: "failed", restoredSessions: 0 });
    await vi.advanceTimersByTimeAsync(STARTUP_BRANCH_DEADLINE_MS + 1);
    await assertion;
    vi.useRealTimers();
  });
});

describe("Living Programme Today truthfulness", () => {
  it("does not fabricate readiness, a programme name, or coaching progress with no plan", () => {
    const home = projectCanonicalHome({ status: "empty", model: null });
    expect(home.status).toBe("empty");
    expect(JSON.stringify(home)).not.toMatch(/readiness|PowerBuild|prescription held|progressing/i);
    expect(home.actions).toContainEqual({ type: "setup_plan" });
  });

  it("gives storage failure a retry without replacing data", () => {
    const home = projectCanonicalHome({ status: "error", model: null });
    expect(home.status).toBe("storage_error");
    expect(home.attention?.detail).toContain("Nothing has been changed");
    expect(home.actions).toContainEqual({ type: "retry_storage" });
  });
});
