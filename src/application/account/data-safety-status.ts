import type { SubscriptionState } from "@/application/billing/subscription";
import type { SyncDiagnosticsStatus } from "@/application/sync/sync-diagnostics";

export type DataSafetyTone = "default" | "success" | "warning";

export interface DataSafetyStatusInput {
  userEmail?: string | null;
  isOfflineMode?: boolean;
  subscription: SubscriptionState;
  syncStatus?: SyncDiagnosticsStatus;
  unsyncedQueueCount?: number;
  now?: Date | string;
}

export interface DataSafetyStatusViewModel {
  title: string;
  status: string;
  body: string;
  meta?: string;
  helper?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  retryActionLabel?: string;
  tone: DataSafetyTone;
}

export function buildDataSafetyStatus(input: DataSafetyStatusInput): DataSafetyStatusViewModel {
  const signedIn = Boolean(input.userEmail);
  const premiumAccess = Boolean(input.subscription.isPremium);
  const queueCount = input.unsyncedQueueCount ?? 0;
  const syncFailed = signedIn && Boolean(input.syncStatus?.lastError);

  if (input.isOfflineMode) {
    return {
      title: "Offline Mode",
      status: "Saved on this device",
      body: "Your workouts are saved on this device and will sync when you’re back online.",
      helper: "You can keep training.",
      tone: "default",
    };
  }

  if (!signedIn && premiumAccess) {
    return {
      title: "Protect your training history",
      status: "Account backup not enabled",
      body: "Create a free account to back up your progress and keep your training synced across devices.",
      primaryActionLabel: "Create Free Account",
      secondaryActionLabel: "Sign In",
      tone: "warning",
    };
  }

  if (!signedIn) {
    return {
      title: "Account",
      status: "Not signed in",
      body: "Your workouts are safely stored on this device.",
      helper: "Create a free account to back up your training and sync across devices.",
      primaryActionLabel: "Create Free Account",
      secondaryActionLabel: "Sign In",
      tone: "default",
    };
  }

  if (syncFailed) {
    return {
      title: "Backup needs attention",
      status: "Retry available",
      body: "Your latest changes are saved on this device, but we couldn’t back them up yet.",
      helper: "You can keep training. We’ll try again automatically.",
      retryActionLabel: "Retry Sync",
      tone: "warning",
    };
  }

  if (queueCount > 0) {
    return {
      title: "Cloud Backup Active",
      status: "Sync pending",
      body: "Your latest changes are saved on this device and queued for backup.",
      helper: "We’ll keep trying automatically.",
      retryActionLabel: "Retry Sync",
      tone: "default",
    };
  }

  if (!input.syncStatus?.lastSuccessAt) {
    return {
      title: "Account connected",
      status: "Backup pending",
      body: "Your training is saved on this device. Cloud backup has not completed yet.",
      helper: "Keep the app open and retry backup when you have a connection.",
      retryActionLabel: "Retry Sync",
      tone: "default",
    };
  }

  return {
    title: "Cloud Backup Active",
    status: "Signed in",
    body: "Your training has been backed up and is ready to restore on another device.",
    meta: input.syncStatus?.lastSuccessAt ? `Last synced: ${formatLastSynced(input.syncStatus.lastSuccessAt, input.now)}` : undefined,
    primaryActionLabel: "Manage Account",
    tone: "success",
  };
}

function formatLastSynced(value: string, now: Date | string = new Date()): string {
  const syncedAt = new Date(value);
  const current = new Date(now);
  if (!Number.isFinite(syncedAt.getTime()) || !Number.isFinite(current.getTime())) return "Recently";
  if (syncedAt.toDateString() === current.toDateString()) return "Today";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(syncedAt);
}
