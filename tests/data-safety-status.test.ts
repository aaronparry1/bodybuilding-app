import { describe, expect, it } from "vitest";
import { buildDataSafetyStatus } from "@/application/account/data-safety-status";
import type { SubscriptionState } from "@/application/billing/subscription";

const freeSubscription: SubscriptionState = { status: "free", provider: "mock", isPremium: false };
const trialSubscription: SubscriptionState = { status: "trial", provider: "mock", isPremium: true, isTrialActive: true };

describe("account data safety status", () => {
  it("frames not signed in as a backup opportunity, not a local account warning", () => {
    expect(buildDataSafetyStatus({ subscription: freeSubscription })).toMatchObject({
      title: "Account",
      status: "Not signed in",
      body: "Your workouts are safely stored on this device.",
      helper: "Create a free account to back up your training and sync across devices.",
      primaryActionLabel: "Create Free Account",
      secondaryActionLabel: "Sign In",
      tone: "default",
    });
  });

  it("encourages trial and subscribed users to protect training history when not signed in", () => {
    expect(buildDataSafetyStatus({ subscription: trialSubscription })).toMatchObject({
      title: "Protect your training history",
      status: "Account backup not enabled",
      body: "Create a free account to back up your progress and keep your training synced across devices.",
      primaryActionLabel: "Create Free Account",
      secondaryActionLabel: "Sign In",
      tone: "warning",
    });
  });

  it("shows cloud backup active for signed-in users with recent sync", () => {
    expect(
      buildDataSafetyStatus({
        userEmail: "aaron@example.com",
        subscription: trialSubscription,
        syncStatus: { lastSuccessAt: "2026-06-27T08:30:00.000Z" },
        now: "2026-06-27T12:00:00.000Z",
      }),
    ).toMatchObject({
      title: "Cloud Backup Active",
      status: "Signed in",
      body: "Your training is backed up and ready to sync across devices.",
      meta: "Last synced: Today",
      primaryActionLabel: "Manage Account",
      tone: "success",
    });
  });

  it("uses calm offline mode copy", () => {
    expect(buildDataSafetyStatus({ subscription: trialSubscription, isOfflineMode: true })).toMatchObject({
      title: "Offline Mode",
      status: "Saved on this device",
      body: "Your workouts are saved on this device and will sync when you’re back online.",
      helper: "You can keep training.",
      tone: "default",
    });
  });

  it("shows a calm retry state for real sync failures", () => {
    expect(
      buildDataSafetyStatus({
        userEmail: "aaron@example.com",
        subscription: trialSubscription,
        syncStatus: { lastError: "network down" },
      }),
    ).toMatchObject({
      title: "Backup needs attention",
      status: "Retry available",
      body: "Your latest changes are saved on this device, but we couldn’t back them up yet.",
      helper: "You can keep training. We’ll try again automatically.",
      retryActionLabel: "Retry Sync",
      tone: "warning",
    });
  });

  it("shows pending backup without a red error framing", () => {
    expect(
      buildDataSafetyStatus({
        userEmail: "aaron@example.com",
        subscription: trialSubscription,
        unsyncedQueueCount: 2,
      }),
    ).toMatchObject({
      title: "Cloud Backup Active",
      status: "Sync pending",
      body: "Your latest changes are saved on this device and queued for backup.",
      helper: "We’ll keep trying automatically.",
      retryActionLabel: "Retry Sync",
      tone: "default",
    });
  });
});
