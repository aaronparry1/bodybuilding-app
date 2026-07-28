import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { spacing, type, workoutColors } from "@/ui/theme";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";

const TRAIN = workoutColors;

export default function CompletionSummaryScreen() {
  const { recordedSessionId } = useLocalSearchParams<{ recordedSessionId?: string }>();
  const aggregate = recordedSessionId ? canonicalRecordedSessionLedger.get(String(recordedSessionId)) : { status: "not_found" as const };
  if (aggregate.status !== "found") return <AppScreen><Text style={{ color: TRAIN.text, ...type.hero }}>Workout complete</Text><Text style={{ color: TRAIN.muted }}>This summary is no longer available.</Text><PrimaryButton label="Done" onPress={() => router.replace("/(protected)/(tabs)")} /></AppScreen>;
  const decision = canonicalProgressDecisionRepository.list(aggregate.session.planId)
    .filter((candidate) => candidate.phaseOne?.sourceRecordedSessionId === aggregate.session.recordedSessionId)
    .sort((left, right) => left.phaseOne!.decidedAt.localeCompare(right.phaseOne!.decidedAt) || left.decisionId.localeCompare(right.decisionId))
    .at(-1);
  const summary = projectCanonicalCompletionSummary({ session: aggregate.session, events: aggregate.events, coachingExplanation: decision?.explanation });
  return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: TRAIN.text, ...type.hero }}>{summary.title}</Text><Text style={{ color: TRAIN.text, ...type.section }}>{summary.workoutName}</Text><Text style={{ color: TRAIN.muted }}>{summary.completedWorkingSets} completed working {summary.completedWorkingSets === 1 ? "set" : "sets"} · {summary.exercisesCompleted} {summary.exercisesCompleted === 1 ? "exercise" : "exercises"} · {Math.floor(summary.elapsedSeconds / 60)} min</Text>{summary.methodsPerformed.length ? <Text style={{ color: TRAIN.muted }}>Methods performed: {summary.methodsPerformed.join(" · ")}</Text> : null}{summary.totalVolume === null ? null : <Text style={{ color: TRAIN.text }}>Performed load volume: {summary.totalVolume} kg</Text>}<Text style={{ color: TRAIN.muted }}>{summary.coachingOutcome}</Text><PrimaryButton label="Done" onPress={() => router.replace("/(protected)/(tabs)" )} /><SecondaryButton label="View Progress" onPress={() => router.replace("/(protected)/(tabs)/analytics")} /></View></AppScreen>;
}
