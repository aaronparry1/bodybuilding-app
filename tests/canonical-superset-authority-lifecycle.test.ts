import { beforeEach, describe, expect, it } from "vitest";
import { getCanonicalSupersetLifecycleState, reconcileCanonicalSupersetLifecycleFixture, resetCanonicalSupersetLifecycleFixture, seedCanonicalSupersetDisabledExposure, seedCanonicalSupersetOfflineCompletion } from "@/application/design-qa/canonical-superset-lifecycle-fixture";
import { CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION, resolveCanonicalSupersetAuthority, setCanonicalSupersetProfilingAuthority } from "@/application/training/canonical-superset-authority";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";

describe("versioned antagonist-superset authority lifecycle", () => {
  beforeEach(() => {
    process.env.APP_ENV = "development";
    process.env.EXPO_PUBLIC_DESIGN_QA_MODE = "1";
    process.env.EXPO_PUBLIC_QA_PREMIUM_FIXTURE = "1";
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://invalid.local";
    resetCanonicalSupersetLifecycleFixture();
  });

  it("defaults to shadow and persists only the profiling certification override", () => {
    expect(resolveCanonicalSupersetAuthority()).toMatchObject({ version: CANONICAL_ANTAGONIST_SUPERSET_AUTHORITY_VERSION, mode: "shadow_only" });
    expect(setCanonicalSupersetProfilingAuthority("certification_authority").status).toBe("saved");
    expect(resolveCanonicalSupersetAuthority()).toMatchObject({ mode: "certification_authority", source: "profiling_override" });
    process.env.APP_ENV = "production";
    expect(resolveCanonicalSupersetAuthority()).toMatchObject({ mode: "shadow_only", source: "production_default" });
  });

  it("retains offline evidence, reconciles once, and preserves rollback across replay", () => {
    expect(setCanonicalSupersetProfilingAuthority("certification_authority").status).toBe("saved");
    const pending = seedCanonicalSupersetOfflineCompletion();
    expect(pending).toMatchObject({ phase: "offline_pending", connection: "certified_offline", mutationCount: 0, receiptCount: 0, progressCount: 0 });
    expect(pending.evidenceFingerprint.length).toBeGreaterThan(0);
    const before = canonicalActivePlanV2Repository.get();
    expect(before.status).toBe("saved");
    const reconciled = reconcileCanonicalSupersetLifecycleFixture();
    expect(reconciled).toMatchObject({ phase: "reconciled", evaluationCount: 1, mutationCount: 1, receiptCount: 1, progressCount: 1 });
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({ status: "saved", carrier: { revision: reconciled.baselineRevision } });
    expect(reconcileCanonicalSupersetLifecycleFixture()).toMatchObject({ evaluationCount: 1, mutationCount: 1, receiptCount: 1, progressCount: 1 });

    expect(setCanonicalSupersetProfilingAuthority("disabled").status).toBe("saved");
    const disabled = seedCanonicalSupersetDisabledExposure();
    expect(disabled).toMatchObject({ phase: "disabled_pending", mutationCount: 1, receiptCount: 1, progressCount: 1 });
    const priorReceipt = canonicalSupersetApplicationRepository.list(disabled.planId).find((item) => item.receipt)?.receipt;
    expect(priorReceipt).toBeTruthy();
    expect(setCanonicalSupersetProfilingAuthority("certification_authority").status).toBe("saved");
    const replay = reconcileCanonicalSupersetLifecycleFixture();
    expect(replay).toMatchObject({ mutationCount: 1, receiptCount: 1, progressCount: 1 });
    expect(canonicalSupersetApplicationRepository.list(replay.planId).find((item) => item.receipt)?.receipt).toEqual(priorReceipt);
    expect(getCanonicalSupersetLifecycleState()).toEqual(replay);
  });
});
