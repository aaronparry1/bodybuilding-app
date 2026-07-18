import * as Haptics from "expo-haptics";

export type HapticFeedback = Readonly<{ setCompleted(): Promise<void>; workoutCompleted(): Promise<void>; restFinished(): Promise<void> }>;

export const hapticFeedback: HapticFeedback = {
  setCompleted: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).then(() => undefined),
  workoutCompleted: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).then(() => undefined),
  restFinished: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).then(() => undefined),
};
