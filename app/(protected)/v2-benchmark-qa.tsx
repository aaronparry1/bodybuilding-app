import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { isV2CoachingQaRequested } from "@/application/design-qa/design-qa-runtime";
import {
  runProductionV2CompleteSessionReviewSuite,
  type CompleteCoachingSessionReview,
  type CompleteSessionExerciseReview,
} from "@/domain/training/coaching-review-suite";
import { AppScreen, PremiumCard, SectionList } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function V2BenchmarkQaScreen() {
  if (!isV2CoachingQaRequested()) return <Redirect href="/(protected)/(tabs)/train" />;

  const result = runProductionV2CompleteSessionReviewSuite();
  const flaggedCount = result.sessions.filter((session) => session.review_flags.length > 0).length;

  return (
    <AppScreen>
      <View style={{ gap: spacing.sm }}>
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          V2 coaching QA only
        </Text>
        <Text selectable style={{ ...type.title, color: colors.text }}>
          Benchmark Sessions
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Advisory V2 pipeline preview. V1 workout logic remains unchanged.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <SummaryPill label="Sessions" value={String(result.session_count)} />
        <SummaryPill label="Exercises" value={String(result.exercise_count)} />
        <SummaryPill label="Flagged" value={String(flaggedCount)} tone={flaggedCount > 0 ? "warning" : "success"} />
      </View>

      <SectionList title="Playable QA Cards">
        <View style={{ gap: spacing.lg }}>
          {result.sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </View>
      </SectionList>
    </AppScreen>
  );
}

function SessionCard({ session }: { session: CompleteCoachingSessionReview }) {
  const flagged = session.review_flags.length > 0;

  return (
    <PremiumCard tone={flagged ? "locked" : "quiet"}>
      <View style={{ gap: spacing.sm }}>
        <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
          {session.session_name}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          <Chip label={session.goal.replaceAll("_", " ")} />
          <Chip label={session.trainingPhase} />
          <Chip label={session.sessionType.replaceAll("_", " ")} />
          <Chip label={`${session.confidence}% confidence`} tone={session.confidence < 70 ? "warning" : "default"} />
        </View>
        {flagged ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            {session.review_flags.map((flag) => (
              <Chip key={flag} label={flag.replaceAll("_", " ")} tone="warning" />
            ))}
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <InfoRow label="Cycle" value={`${session.cycle_strategy.macro_intent} / ${session.cycle_strategy.meso_focus}`} />
        <InfoRow label="Micro" value={`${session.cycle_strategy.micro_emphasis} / ${session.cycle_strategy.stress_budget_bias}`} />
        <InfoRow label="Primary" value={session.stimulus_plan.primary_stimuli.map((stimulus) => stimulus.stimulus_id.replaceAll("_", " ")).join(", ")} />
        <InfoRow label="Avoid" value={session.stimulus_plan.avoid_stimuli.length > 0 ? session.stimulus_plan.avoid_stimuli.map((stimulus) => stimulus.replaceAll("_", " ")).join(", ") : "None"} />
      </View>

      <View style={{ gap: spacing.md }}>
        {session.exercises.map((exercise, index) => (
          <ExerciseCard key={`${session.session_id}-${exercise.stimulus_id}-${index}`} exercise={exercise} index={index} />
        ))}
      </View>
    </PremiumCard>
  );
}

function ExerciseCard({ exercise, index }: { exercise: CompleteSessionExerciseReview; index: number }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.lineSoft,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
        <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
          {index + 1}
        </Text>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
            {exercise.selected_exercise}
          </Text>
          <Text selectable style={{ ...type.label, color: colors.textMuted }}>
            {exercise.stimulus_id.replaceAll("_", " ")}
          </Text>
        </View>
      </View>

      <InfoRow label="Why" value={exercise.why_exercise_selected} />
      <InfoRow label="Intent" value={`${exercise.session_strategy.set_objective} / ${exercise.session_strategy.coaching_bias}`} />
      <InfoRow label="Reps" value={formatRepPrescription(exercise)} />
      <InfoRow label="Load" value={`${exercise.load_prescription.load_action.replaceAll("_", " ")} / ${exercise.load_prescription.load_strategy.replaceAll("_", " ")}`} />
      <InfoRow label="Sets" value={exercise.set_allocation ? `${exercise.set_allocation.recommended_next.replaceAll("_", " ")} / ${exercise.set_allocation.short_reason}` : "No set preview"} />
      <InfoRow label="Alt" value={exercise.delivery.acceptable_alternatives.map((item) => item.replaceAll("_", " ")).join(", ")} />
    </View>
  );
}

function formatRepPrescription(exercise: CompleteSessionExerciseReview) {
  const rep = exercise.rep_prescription;
  if (rep.prescription_type === "duration_hold" || rep.prescription_type === "duration_carry") {
    if (rep.target_seconds) return `${rep.target_seconds} sec`;
    if (rep.duration_range) return `${rep.duration_range.min}-${rep.duration_range.max} sec`;
  }
  if (rep.target_reps) return `${rep.target_reps} reps`;
  if (rep.rep_range) return `${rep.rep_range.min}-${rep.rep_range.max} reps`;
  if (rep.amrap_cap) return `AMRAP cap ${rep.amrap_cap}`;
  return rep.prescription_type.replaceAll("_", " ");
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" }}>
      <Text selectable style={{ width: 62, color: colors.textSubtle, fontSize: 12, lineHeight: 17, fontWeight: "900" }}>
        {label}
      </Text>
      <Text selectable style={{ flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}

function SummaryPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "success";
}) {
  const toneStyle =
    tone === "warning"
      ? { backgroundColor: colors.warningSoft, borderColor: colors.warning, valueColor: colors.warning }
      : tone === "success"
        ? { backgroundColor: colors.successSoft, borderColor: colors.success, valueColor: colors.success }
        : { backgroundColor: colors.surfaceSoft, borderColor: colors.line, valueColor: colors.accent };

  return (
    <View style={{ borderWidth: 1, borderColor: toneStyle.borderColor, backgroundColor: toneStyle.backgroundColor, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
      <Text selectable style={{ color: toneStyle.valueColor, fontSize: 18, lineHeight: 23, fontWeight: "900" }}>
        {value}
      </Text>
      <Text selectable style={{ color: colors.textMuted, fontSize: 11, lineHeight: 15, fontWeight: "800" }}>
        {label}
      </Text>
    </View>
  );
}

function Chip({ label, tone = "default" }: { label: string; tone?: "default" | "warning" }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: tone === "warning" ? colors.warning : colors.line,
        backgroundColor: tone === "warning" ? colors.warningSoft : colors.surfaceSoft,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      }}
    >
      <Text selectable style={{ color: tone === "warning" ? colors.warning : colors.textMuted, fontSize: 11, lineHeight: 15, fontWeight: "800", textTransform: "capitalize" }}>
        {label}
      </Text>
    </View>
  );
}
