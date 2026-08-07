import { beforeEach, describe, expect, it } from "vitest";
import { collectAndroidRecoveryEvidence } from "@/application/diagnostics/android-recovery-evidence";
import { appSettingsStore } from "@/application/settings/app-settings";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { getLocalStorage, getLocalStorageKeys } from "@/data/local/local-storage";
import { jsonStore } from "@/data/local/json-store";
import { canonicalFiveDayFixtureInput } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";

describe("Android recovery evidence", () => {
  beforeEach(() => { jsonStore.clearByPrefix("iron-logic."); jsonStore.resetCache(); appSettingsStore.resetCache(); });
  it("reports only counts, presence and identity equality without changing storage", () => {
    canonicalActivePlanState.create(canonicalFiveDayFixtureInput("diagnostic-plan"));
    const plan = canonicalActivePlanV2Repository.get();
    if (plan.status !== "saved") throw new Error("fixture missing");
    canonicalActivePlanOwnerRepository.save({ planId: plan.carrier.planId, ownerUserId: "private-user-id", boundAt: "2026-08-07T10:00:00.000Z", provenance: "authenticated_onboarding" });
    const before = Object.fromEntries(getLocalStorageKeys().map((key) => [key, getLocalStorage().getItem(key)]));
    const evidence = collectAndroidRecoveryEvidence("private-user-id", "2026-08-07T11:00:00.000Z");
    const after = Object.fromEntries(getLocalStorageKeys().map((key) => [key, getLocalStorage().getItem(key)]));
    expect(after).toEqual(before);
    expect(evidence.identity).toMatchObject({ authenticated: true, ownerPresent: true, ownerMatchesAuthenticatedAccount: true, planMatchesOwner: true });
    expect(JSON.stringify(evidence)).not.toContain("private-user-id");
    expect(JSON.stringify(evidence)).not.toContain("@example");
  });
});
