import * as Notifications from "expo-notifications";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { appSettingsStore } from "@/application/settings/app-settings";
import { sessionRoleDisplayName } from "@/application/training/display-labels";

/**
 * Two local, on-device reminder types. No server/push infrastructure involved —
 * everything is computed from data already on the device and scheduled with
 * expo-notifications, so no user training data ever leaves the device for this.
 *
 * 1. "evening" — the user has a next session ready, hasn't trained *today*,
 *    and it's getting late. Note: sessions are NOT bound to calendar days in
 *    this app (no fixed Mon/Wed/Fri schedule) — "today's session" means
 *    "whatever's next in sequence", not a specific assigned workout.
 * 2. "streak" — the user has an active consecutive-week training streak
 *    (matching the same ISO-week definition the achievement system already
 *    uses) and this week has zero completions yet, with the week about to end.
 */

const EVENING_REMINDER_ID = "training-reminder-evening";
const STREAK_REMINDER_ID = "training-reminder-streak";
const EVENING_REMINDER_HOUR = 19;

function startOfIsoWeek(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function nextDateAt(hour: number, dayOfWeekIso?: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, 0, 0, 0);
  if (dayOfWeekIso != null) {
    const currentIso = now.getDay() || 7;
    let daysUntil = dayOfWeekIso - currentIso;
    if (daysUntil < 0 || (daysUntil === 0 && target <= now)) daysUntil += 7;
    target.setDate(target.getDate() + daysUntil);
  } else if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export type ReminderPlan = Readonly<{
  eveningReminder: Readonly<{ needed: boolean; sessionName: string | null }>;
  streakReminder: Readonly<{ needed: boolean; weeksSoFar: number }>;
}>;

/** Reads on-device data only; makes no network calls and mutates nothing. */
export function computeReminderPlan(): ReminderPlan {
  const plan = canonicalActivePlanState.getReadModel();
  if (!plan || !plan.nextSession) {
    return { eveningReminder: { needed: false, sessionName: null }, streakReminder: { needed: false, weeksSoFar: 0 } };
  }

  const evidence = canonicalProgressEvidenceRepository.list(plan.planId).filter((item) => item.kind === "completion");
  const now = new Date();
  const trainedToday = evidence.some((item) => isSameLocalDay(new Date(item.observedAt), now));

  const currentWeekStart = startOfIsoWeek(now);
  const trainedThisWeek = evidence.some((item) => new Date(item.observedAt) >= currentWeekStart);

  // Consecutive prior weeks with at least one completion, walking backward from last week.
  let weeksSoFar = 0;
  const weekKeys = new Set(evidence.map((item) => startOfIsoWeek(new Date(item.observedAt)).getTime()));
  const cursor = new Date(currentWeekStart);
  cursor.setDate(cursor.getDate() - 7);
  while (weekKeys.has(cursor.getTime())) {
    weeksSoFar += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  const nextSession = plan.plannedSessions.find((session) => session.id === plan.nextSession?.id);
  const sessionName = nextSession ? sessionRoleDisplayName(nextSession.role) : null;

  return {
    eveningReminder: { needed: !trainedToday, sessionName },
    // Only nudge if there's an active streak worth protecting (>=1 prior consecutive week)
    // and this week hasn't been logged yet. Sunday-only firing is handled by the caller.
    streakReminder: { needed: weeksSoFar >= 1 && !trainedThisWeek, weeksSoFar },
  };
}

export async function requestTrainingReminderPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

/** Cancels and re-schedules both reminder types based on current on-device state. Safe to call often. */
export async function rescheduleTrainingReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(EVENING_REMINDER_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID).catch(() => {});

  const settings = appSettingsStore.get();
  if (!settings.trainingRemindersEnabled) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const plan = computeReminderPlan();

  if (plan.eveningReminder.needed) {
    const fireAt = nextDateAt(EVENING_REMINDER_HOUR);
    // Skip if that computed time has already passed today with no tomorrow fallback
    // needed — nextDateAt() already rolls to tomorrow when today's slot has passed.
    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_REMINDER_ID,
      content: {
        title: "Don't lose the day",
        body: plan.eveningReminder.sessionName
          ? `Quick session? ${plan.eveningReminder.sessionName} is up whenever you're ready.`
          : "Quick session? Your next workout is up whenever you're ready.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
  }

  if (plan.streakReminder.needed) {
    const fireAt = nextDateAt(EVENING_REMINDER_HOUR, 7); // 7 = Sunday in ISO weekday numbering
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_REMINDER_ID,
      content: {
        title: "Don't lose the week",
        body: `${plan.streakReminder.weeksSoFar} week${plan.streakReminder.weeksSoFar === 1 ? "" : "s"} in a row so far — a quick session today keeps it going.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
  }
}
