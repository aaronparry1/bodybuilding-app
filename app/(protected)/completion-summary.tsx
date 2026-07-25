import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function CompletionSummaryScreen() {
  const { recordedSessionId } = useLocalSearchParams<{ recordedSessionId?: string }>();
  const aggregate = recordedSessionId ? canonicalRecordedSessionLedger.get(String(recordedSessionId)) : { status: "not_found" as const };
  if (aggregate.status !== "found") return <AppScreen><Text style={{ color: colors.text, ...type.hero }}>Workout complete</Text><Text style={{ color: colors.textMuted }}>This summary is no longer available.</Text><PrimaryButton label="Done" onPress={() => router.replace("/(protected)/(tabs)")} /></AppScreen>;
  const summary = projectCanonicalCompletionSummary({ session: aggregate.session, events: aggregate.events });
  return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.hero }}>{summary.title}</Text><Text style={{ color: colors.text, ...type.section }}>{summary.workoutName}</Text><Text style={{ color: colors.textMuted }}>{summary.completedWorkingSets} completed working {summary.completedWorkingSets === 1 ? "set" : "sets"} · {summary.exercisesCompleted} {summary.exercisesCompleted === 1 ? "exercise" : "exercises"} · {Math.floor(summary.elapsedSeconds / 60)} min</Text>{summary.methodsPerformed.length ? <Text style={{ color: colors.textMuted }}>Methods performed: {summary.methodsPerformed.join(" · ")}</Text> : null}{summary.totalVolume === null ? null : <Text style={{ color: colors.text }}>Performed load volume: {summary.totalVolume} kg</Text>}<Text style={{ color: colors.textMuted }}>{summary.coachingOutcome}</Text><PrimaryButton label="Done" onPress={() => router.replace("/(protected)/(tabs)" )} /><SecondaryButton label="View Progress" onPress={() => router.replace("/(protected)/(tabs)/analytics")} /></View></AppScreen>;
}
