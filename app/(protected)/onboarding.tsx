import { Stack, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppSettings } from "@/application/settings/app-settings";
import {
  completeCanonicalOnboardingSetup,
  normalizeRecentTrainingInput,
  onboardingStepKeys,
  resolveExecutableOnboardingFrameworks,
} from "@/application/training/canonical-onboarding-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExperienceLevel, ProgrammeGoal, UnitSystem } from "@/domain/training/models";
import {
  type PreferredSplit,
  type RecoveryCardioPreference,
  type TrainingSetupGoal,
} from "@/domain/training/plan-setup";
import {
  deriveTrainingCommitment,
  getCompatibleTrainingEventTypes,
  isTrainingEventTypeCompatibleWithGoal,
  type TrainingCommitmentType,
  type TrainingEventType,
} from "@/domain/training/training-commitment";
import { trainingExperiences } from "@/domain/training/training-experience";
import { trainingFrequencyOptions, type TrainingDaysPerWeek } from "@/domain/training/training-frequency";
import type { TrainingGoalId } from "@/domain/training/training-goals";
import { AppScreen, HeroPanel, PremiumCard, PrimaryButton, SecondaryButton, stableUiIdentifier } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { canonicalSessionDurationOptions, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";
import { type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";

type StepKey = "goal" | "commitment" | "event" | "schedule" | "split" | "experience" | "recent_training" | "recovery" | "review";

const goalOptions: Array<{ value: TrainingSetupGoal; label: string; detail: string }> = [
  { value: "build_muscle", label: "Hypertrophy", detail: "Build muscle with productive volume and steady performance." },
  { value: "build_muscle_and_strength", label: "Powerbuilding", detail: "Build muscle and strength together with heavy anchors and productive volume." },
  { value: "build_strength", label: "Strength", detail: "Build force production with enough muscle work to support it." },
  { value: "athletic_performance", label: "Athletic Performance", detail: "Power and strength without forgetting tissue." },
  { value: "get_leaner", label: "Getting Lean", detail: "Preserve useful strength and muscle while managing recovery and conditioning." },
];

const commitmentOptions: Array<{ value: TrainingCommitmentType; label: string; detail: string }> = [
  { value: "continuous_development", label: "No — I just want to keep improving.", detail: "ASC will manage the training structure as you progress." },
  { value: "event_driven", label: "Yes — I have a target date.", detail: "ASC will work backward from the date without asking you to choose a block length." },
];

const eventOptions: Array<{ value: TrainingEventType; label: string; detail: string }> = [
  { value: "powerlifting_meet", label: "Powerlifting meet", detail: "For squat, bench, and deadlift performance on a fixed date." },
  { value: "athletic_event_or_season", label: "Athletic event or season", detail: "For a season, competition, or performance date." },
  { value: "physique_event", label: "Physique event", detail: "For a stage or appearance-focused deadline." },
  { value: "holiday_or_photoshoot", label: "Holiday or photoshoot", detail: "For a visible body-composition target date." },
  { value: "custom", label: "Custom", detail: "For a target date that does not fit the standard categories." },
];

const recoveryCardioOptions: Array<{ value: RecoveryCardioPreference; label: string; detail: string }> = [
  { value: "recommended", label: "Recommended", detail: "ASC adds recovery and capacity work where it supports your lifting." },
  { value: "minimal", label: "Minimal", detail: "Only add recovery/capacity work when there is a clear reason." },
  { value: "off", label: "No Added Cardio", detail: "No planned cardio. Recovery and fatigue coaching still stays active." },
];

const unitOptions: Array<{ value: UnitSystem; label: string; detail: string }> = [
  { value: "kg", label: "Kilograms", detail: "Use kilograms for workout loads and progression displays." },
  { value: "lb", label: "Pounds", detail: "Use pounds for workout loads and progression displays." },
];

const continuityOptions: Array<{ value: CanonicalStartingVolumeContext["continuity"]; label: string; detail: string }> = [
  { value: "currently_training", label: "Yes — I’m training consistently", detail: "Use my recent routine to choose an appropriate starting workload." },
  { value: "short_layoff", label: "I’ve had a short break", detail: "Keep my experience in mind, but ease me back into regular training." },
  { value: "extended_layoff", label: "I’ve been away for longer", detail: "Start more conservatively while I rebuild training consistency." },
];

const recentWorkloadOptions: Array<{ value: CanonicalStartingVolumeContext["recentSessionWorkload"]; label: string; detail: string }> = [
  { value: "light", label: "Light", detail: "Usually a few main movements or shorter, lower-volume sessions." },
  { value: "moderate", label: "Moderate", detail: "A normal full workout with several useful exercises and working sets." },
  { value: "high", label: "High", detail: "Longer or higher-volume sessions that I have been recovering from consistently." },
];

const perceivedRecoveryOptions: Array<{ value: CanonicalStartingVolumeContext["recovery"]; label: string; detail: string }> = [
  { value: "low_acceptable", label: "Recovery is limited", detail: "I often carry fatigue or need extra time to recover." },
  { value: "ordinary", label: "Recovery is generally good", detail: "I usually feel ready for the next planned session." },
  { value: "high", label: "I recover very well", detail: "Recent training has been consistent and I reliably tolerate the workload." },
];

const concurrentSportOptions: Array<{ value: CanonicalStartingVolumeContext["concurrentSport"]; label: string; detail: string }> = [
  { value: "none", label: "No regular lower-body sport", detail: "Plan recovery around lifting." },
  { value: "lower_body_loading", label: "Yes — regular sport or running", detail: "Account for meaningful lower-body loading outside the gym." },
];

export default function OnboardingScreen() {
  const { settings } = useAppSettings();
  const scrollRef = useRef<ScrollView | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [unit, setUnit] = useState<UnitSystem>(settings.unit);
  const [setupGoal, setSetupGoal] = useState<TrainingSetupGoal>("build_muscle");
  const [commitmentType, setCommitmentType] = useState<TrainingCommitmentType>("continuous_development");
  const [eventType, setEventType] = useState<TrainingEventType>("custom");
  const [targetDate, setTargetDate] = useState("2026-12-01");
  const [daysPerWeek, setDaysPerWeek] = useState<TrainingDaysPerWeek>(5);
  const [availableSessionMinutes, setAvailableSessionMinutes] = useState<CanonicalSessionDurationMinutes>(settings.availableSessionMinutes);
  const [preferredSplit, setPreferredSplit] = useState<PreferredSplit>("let_app_choose");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(settings.experienceLevel);
  const [recoveryCardioPreference, setRecoveryCardioPreference] = useState<RecoveryCardioPreference>(settings.recoveryCardioPreference);
  const [continuity, setContinuity] = useState<CanonicalStartingVolumeContext["continuity"]>(settings.startingVolumeContext.continuity);
  const [recentTrainingDaysPerWeek, setRecentTrainingDaysPerWeek] = useState<CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"]>(settings.startingVolumeContext.recentTrainingDaysPerWeek);
  const [recentSessionWorkload, setRecentSessionWorkload] = useState<CanonicalStartingVolumeContext["recentSessionWorkload"]>(settings.startingVolumeContext.recentSessionWorkload);
  const [perceivedRecovery, setPerceivedRecovery] = useState<CanonicalStartingVolumeContext["recovery"]>(settings.startingVolumeContext.recovery);
  const [concurrentSport, setConcurrentSport] = useState<CanonicalStartingVolumeContext["concurrentSport"]>(settings.startingVolumeContext.concurrentSport);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationPending, setCreationPending] = useState(false);
  const [creationAttempt, setCreationAttempt] = useState<Readonly<{ fingerprint: string; timestamp: string }> | null>(null);

  const trainingGoalId = trainingGoalIdForSetup(setupGoal);
  const compatibleEventOptions = eventOptions.filter((option) => isTrainingEventTypeCompatibleWithGoal(trainingGoalId, option.value));
  const selectedEventType = isTrainingEventTypeCompatibleWithGoal(trainingGoalId, eventType) ? eventType : compatibleEventOptions[0]?.value ?? "custom";
  const trainingCommitment = deriveTrainingCommitment({
    goalId: trainingGoalId,
    commitmentType,
    eventType: selectedEventType,
    targetDate,
  });
  const normalizedRecentTraining = normalizeRecentTrainingInput({ continuity, recentTrainingDaysPerWeek });
  const startingVolumeContext = useMemo<CanonicalStartingVolumeContext>(() => ({
    continuity: normalizedRecentTraining.continuity,
    recentTrainingDaysPerWeek: normalizedRecentTraining.recentTrainingDaysPerWeek,
    recentSessionWorkload,
    recentSessionDurationMinutes: recentSessionWorkload === "light" ? 45 : recentSessionWorkload === "high" ? 90 : 60,
    recovery: perceivedRecovery,
    history: "none",
    workCapacity: "not_demonstrated",
    concurrentSport,
    loadConfidence: "calibration_required",
    dosageConfidence: normalizedRecentTraining.continuity === "currently_training" ? "declared_recent_training" : "low_after_layoff",
  }), [concurrentSport, normalizedRecentTraining.continuity, normalizedRecentTraining.recentTrainingDaysPerWeek, perceivedRecovery, recentSessionWorkload]);
  const splitOptions = useMemo(() => resolveExecutableOnboardingFrameworks({
    goalId: trainingGoalId,
    goal: programmeGoalForSetup(setupGoal, experienceLevel),
    macrocycleGoal: setupGoal,
    targetDate: trainingCommitment.targetDate,
    daysPerWeek,
    experienceLevel,
    equipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight", "bands", "other"],
    units: unit,
    recoveryCardioPreference,
    availableSessionMinutes,
    startingVolumeContext,
    exercises: exerciseLibrary,
  }), [
    availableSessionMinutes,
    daysPerWeek,
    experienceLevel,
    recoveryCardioPreference,
    setupGoal,
    startingVolumeContext,
    trainingCommitment.targetDate,
    trainingGoalId,
    unit,
  ]);
  const steps = useMemo(
    () => onboardingStepKeys({
      eventDriven: commitmentType === "event_driven",
      frameworkOptionCount: splitOptions.length,
    }) as readonly StepKey[],
    [commitmentType, splitOptions.length],
  );
  const step = steps[Math.min(stepIndex, steps.length - 1)] ?? "goal";
  const progressLabel = `${Math.min(stepIndex + 1, steps.length)} of ${steps.length}`;
  const selectedFramework = splitOptions.find((option) => option.value === preferredSplit);
  const frameworkSummary = selectedFramework
    ? selectedFramework.value === "let_app_choose"
      ? `${selectedFramework.label} · ${selectedFramework.resolvedLabel}`
      : selectedFramework.label
    : "Framework unavailable";

  const goNext = () => setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));
  const chooseGoal = (goal: TrainingSetupGoal) => {
    setSetupGoal(goal);
    const nextGoalId = trainingGoalIdForSetup(goal);
    if (!isTrainingEventTypeCompatibleWithGoal(nextGoalId, eventType)) {
      setEventType(getCompatibleTrainingEventTypes(nextGoalId)[0] ?? "custom");
    }
  };
  const chooseRecentTrainingDays = (days: CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"]) => {
    setRecentTrainingDaysPerWeek(days);
    if (days === 0 && continuity === "currently_training") setContinuity("short_layoff");
  };
  const chooseContinuity = (value: CanonicalStartingVolumeContext["continuity"]) => {
    setContinuity(value);
    if (value === "currently_training" && recentTrainingDaysPerWeek === 0) setRecentTrainingDaysPerWeek(1);
  };

  useEffect(() => {
    if (!splitOptions.length) return;
    if (!splitOptions.some((option) => option.value === preferredSplit)) {
      setPreferredSplit(splitOptions[0]!.value);
    }
  }, [preferredSplit, splitOptions]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const finish = () => {
    if (creationPending) return;
    setCreationError(null);
    setCreationPending(true);
    const fingerprint = JSON.stringify({
      setupGoal,
      targetDate: trainingCommitment.targetDate,
      daysPerWeek,
      availableSessionMinutes,
      preferredSplit,
      experienceLevel,
      unit,
      recoveryCardioPreference,
      startingVolumeContext,
    });
    const attempt = creationAttempt?.fingerprint === fingerprint
      ? creationAttempt
      : { fingerprint, timestamp: new Date().toISOString() };
    if (creationAttempt?.fingerprint !== fingerprint) setCreationAttempt(attempt);
    const trainingGoal = programmeGoalForSetup(setupGoal, experienceLevel);
    const committed = completeCanonicalOnboardingSetup({
      command: {
        planId: `canonical-plan:${attempt.timestamp}`,
        createdAt: attempt.timestamp,
        updatedAt: attempt.timestamp,
        goal: trainingGoal,
        macrocycleGoal: setupGoal,
        targetDate: trainingCommitment.targetDate,
        daysPerWeek,
        preferredSplit,
        experienceLevel,
        equipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight", "bands", "other"],
        units: unit,
        recoveryCardioPreference,
        availableSessionMinutes,
        startingVolumeContext,
        exercises: exerciseLibrary,
      },
      settings: {
        unit,
        trainingGoal,
        experienceLevel,
        recoveryCardioPreference,
        availableSessionMinutes,
        startingVolumeContext,
      },
    });
    if (committed.status !== "saved") {
      const durationFailure = committed.reason.includes("chronic_volume_floor_unmet");
      const activeAttemptFailure = committed.reason === "active_attempt_must_be_completed_or_discarded";
      console.error("[onboarding:programme-creation]", {
        reason: committed.reason,
        priorRevision: committed.priorRevision,
        requestedDays: daysPerWeek,
        requestedDuration: availableSessionMinutes,
      });
      setCreationError(durationFailure
        ? `This ${availableSessionMinutes}-minute, ${daysPerWeek}-day schedule cannot retain the required rolling training coverage. Choose longer workouts or fewer training days.`
        : activeAttemptFailure
          ? "Finish or discard your current workout, then return here to create this programme. Your choices are still saved on this screen."
          : `Your programme was not changed (${programmeCreationReason(committed.reason)}). Review your choices and try again.`);
      setCreationPending(false);
      return;
    }
    setCreationPending(false);
    router.replace("/(protected)");
  };

  return (
    <AppScreen bottom={96} respectTopSafeArea scrollRef={scrollRef}>
      <Stack.Screen options={{ title: step === "review" ? "Your Programme" : "Welcome" }} />
      <HeroPanel eyebrow={`Setup · ${progressLabel}`} title={titleForStep(step)} subtitle={subtitleForStep(step)} />
      <ProgressDots count={steps.length} active={stepIndex} />

      {step === "goal" ? <OptionList<TrainingSetupGoal> options={goalOptions} selected={setupGoal} onSelect={chooseGoal} /> : null}
      {step === "commitment" ? <OptionList<TrainingCommitmentType> options={commitmentOptions} selected={commitmentType} onSelect={setCommitmentType} /> : null}
      {step === "event" ? (
        <View style={{ gap: spacing.lg }}>
          <PremiumCard>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Training target</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>
              The coach handles the macrocycle. Give it the target date so it can plan the route.
            </Text>
          </PremiumCard>
          <OptionList<TrainingEventType> options={compatibleEventOptions} selected={selectedEventType} onSelect={setEventType} />
          <LabeledInput label="Target date" value={targetDate} onChangeText={setTargetDate} placeholder="2026-12-01" />
        </View>
      ) : null}
      {step === "schedule" ? (
        <View style={{ gap: spacing.xl }}>
          <View style={{ gap: spacing.sm }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>Training days</Text>
            <OptionList<TrainingDaysPerWeek>
              options={trainingFrequencyOptions.map((day) => ({ value: day, label: `${day} days` }))}
              selected={daysPerWeek}
              onSelect={setDaysPerWeek}
              guidance="Choose the number of training days you can repeat most weeks."
            />
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>Workout length</Text>
            <OptionList<CanonicalSessionDurationMinutes>
              options={canonicalSessionDurationOptions.map((minutes) => ({ value: minutes, label: `${minutes} minutes` }))}
              selected={availableSessionMinutes}
              onSelect={setAvailableSessionMinutes}
              guidance="Choose the time you can reliably protect for each workout."
            />
          </View>
        </View>
      ) : null}
      {step === "split" ? <OptionList<PreferredSplit> options={splitOptions} selected={preferredSplit} onSelect={setPreferredSplit} /> : null}
      {step === "experience" ? (
        <OptionList<ExperienceLevel>
          options={trainingExperiences.map((experience) => ({ value: experience.id, label: experience.displayName, detail: experience.description }))}
          selected={experienceLevel}
          onSelect={setExperienceLevel}
        />
      ) : null}
      {step === "recent_training" ? (
        <View style={{ gap: spacing.lg }}>
          <OptionList<CanonicalStartingVolumeContext["continuity"]> options={continuityOptions} selected={continuity} onSelect={chooseContinuity} />
          <PremiumCard>
            <Text selectable style={{ ...type.label, color: colors.textSubtle }}>Recent training days</Text>
            <OptionList<CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"]>
              options={([0, 1, 2, 3, 4, 5, 6, 7] as const).map((days) => ({ value: days, label: `${days} ${days === 1 ? "day" : "days"} per week` }))}
              selected={recentTrainingDaysPerWeek}
              onSelect={chooseRecentTrainingDays}
              guidance="Choose your actual recent average, not your intended schedule."
            />
          </PremiumCard>
          <PremiumCard>
            <Text selectable style={{ ...type.label, color: colors.textSubtle }}>Typical recent workout</Text>
            <OptionList<CanonicalStartingVolumeContext["recentSessionWorkload"]> options={recentWorkloadOptions} selected={recentSessionWorkload} onSelect={setRecentSessionWorkload} />
          </PremiumCard>
          <PremiumCard>
            <Text selectable style={{ ...type.label, color: colors.textSubtle }}>How have you been recovering?</Text>
            <OptionList<CanonicalStartingVolumeContext["recovery"]> options={perceivedRecoveryOptions} selected={perceivedRecovery} onSelect={setPerceivedRecovery} />
          </PremiumCard>
          <PremiumCard>
            <Text selectable style={{ ...type.label, color: colors.textSubtle }}>Sport outside the gym</Text>
            <OptionList<CanonicalStartingVolumeContext["concurrentSport"]> options={concurrentSportOptions} selected={concurrentSport} onSelect={setConcurrentSport} />
          </PremiumCard>
        </View>
      ) : null}
      {step === "recovery" ? (
        <OptionList<RecoveryCardioPreference> options={recoveryCardioOptions} selected={recoveryCardioPreference} onSelect={setRecoveryCardioPreference} />
      ) : null}
      {creationError ? <PremiumCard><Text accessibilityRole="alert" style={{ color: colors.danger, ...type.body }}>{creationError}</Text></PremiumCard> : null}
      {step === "review" ? (
        <ReviewPanel
          goal={labelFor(goalOptions, setupGoal)}
          commitment={trainingCommitment.userFacingSummary}
          daysPerWeek={daysPerWeek}
          availableSessionMinutes={availableSessionMinutes}
          framework={frameworkSummary}
          experience={labelForExperience(experienceLevel)}
          recentTraining={`${labelFor(continuityOptions, continuity)} · ${recentTrainingDaysPerWeek} days/week · ${labelFor(recentWorkloadOptions, recentSessionWorkload)}`}
          recoveryCapacity={labelFor(recoveryCardioOptions, recoveryCardioPreference)}
          unit={unit}
          unitLabel={labelFor(unitOptions, unit)}
          onSelectUnit={setUnit}
        />
      ) : null}

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {stepIndex > 0 ? <SecondaryButton label="Back" onPress={goBack} /> : null}
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={step === "review" ? creationPending ? "Creating Programme…" : "Create Programme" : "Continue"}
            onPress={step === "review" ? finish : goNext}
            disabled={creationPending || (step === "split" && splitOptions.length === 0)}
          />
        </View>
      </View>
    </AppScreen>
  );
}

function OptionList<T extends string | number>({
  options,
  selected,
  onSelect,
  guidance,
}: {
  options: readonly Readonly<{ value: T; label: string; detail?: string }>[];
  selected: T;
  onSelect(value: T): void;
  guidance?: string;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            testID={stableUiIdentifier("option", option.value)}
            onPress={() => onSelect(option.value)}
            style={{
              borderRadius: radius.lg,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: active ? colors.accent : colors.line,
              backgroundColor: active ? colors.accentSoft : colors.surfaceMuted,
              padding: spacing.lg,
              gap: spacing.xs,
            }}
          >
            <Text selectable style={{ color: active ? colors.accent : colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
              {option.label}
            </Text>
            {option.detail ? (
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
                {option.detail}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
      {guidance ? <Text selectable style={{ ...type.body, color: colors.textMuted }}>{guidance}</Text> : null}
    </View>
  );
}

function ReviewPanel({
  goal,
  commitment,
  daysPerWeek,
  availableSessionMinutes,
  framework,
  experience,
  recentTraining,
  recoveryCapacity,
  unit,
  unitLabel,
  onSelectUnit,
}: {
  goal: string;
  commitment: string;
  daysPerWeek: number;
  availableSessionMinutes: CanonicalSessionDurationMinutes;
  framework: string;
  experience: string;
  recentTraining: string;
  recoveryCapacity: string;
  unit: UnitSystem;
  unitLabel: string;
  onSelectUnit(value: UnitSystem): void;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Programme summary
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          ASC will use these choices to build your first programme.
        </Text>
        <View style={{ gap: spacing.md }}>
          <SummaryRow label="Goal" value={goal} />
          <SummaryRow label="Training commitment" value={commitment} />
          <SummaryRow label="Training days" value={`${daysPerWeek} days/week`} />
          <SummaryRow label="Workout length" value={`${availableSessionMinutes} minutes`} />
          <SummaryRow label="Framework" value={framework} />
          <SummaryRow label="Experience" value={experience} />
          <SummaryRow label="Recent training" value={recentTraining} />
          <SummaryRow label="Recovery & Capacity" value={recoveryCapacity} />
          <SummaryRow label="Units" value={unitLabel} />
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Units
        </Text>
        <OptionList<UnitSystem> options={unitOptions} selected={unit} onSelect={onSelectUnit} />
      </PremiumCard>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}

function LabeledInput({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText(value: string): void; placeholder: string }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textMuted }}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        value={value}
        style={{
          minHeight: 52,
          borderRadius: radius.md,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surfaceMuted,
          color: colors.text,
          paddingHorizontal: spacing.lg,
          fontSize: 16,
        }}
      />
    </View>
  );
}

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.xs }}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: index <= active ? colors.accent : colors.lineSoft,
          }}
        />
      ))}
    </View>
  );
}

function titleForStep(step: StepKey): string {
  const titles: Record<StepKey, string> = {
    goal: "What are you training for?",
    commitment: "Are you training for something specific?",
    event: "Set the target",
    schedule: "What fits your week?",
    split: "Choose a training framework",
    experience: "How would you describe your lifting experience?",
    recent_training: "What has your recent training looked like?",
    recovery: "Recovery & Cardio",
    review: "Your Programme",
  };
  return titles[step];
}

function subtitleForStep(step: StepKey): string {
  if (step === "schedule") {
    return "Choose the number you can consistently achieve. You can change this later and ASC will adjust your programme.";
  }
  if (step === "split") return "Every option shown can build a complete programme from your choices.";
  if (step === "experience") {
    return "This helps ASC choose an appropriate starting coaching strategy. It will continue learning from your training over time.";
  }
  if (step === "recent_training") return "Your recent routine helps set an appropriate starting workload.";
  if (step === "review") return "Confirm your setup before ASC builds your first programme.";
  return "A few clear choices are enough to build your programme.";
}

function labelFor<T extends string | number>(options: Array<{ value: T; label: string }>, value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value);
}

function labelForExperience(value: ExperienceLevel): string {
  return trainingExperiences.find((experience) => experience.id === value)?.displayName ?? titleValue(value);
}

function titleValue(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function trainingGoalIdForSetup(goal: TrainingSetupGoal): TrainingGoalId {
  if (goal === "build_strength" || goal === "powerlifting_meet") return "get_stronger";
  if (goal === "build_muscle_and_strength") return "build_muscle_strength";
  if (goal === "get_leaner") return "lose_fat";
  if (goal === "athletic_performance") return "athletic_performance";
  return "build_muscle";
}

function programmeGoalForSetup(goal: TrainingSetupGoal, experienceLevel: ExperienceLevel): ProgrammeGoal {
  if (goal === "build_strength" || goal === "build_muscle_and_strength") return "strength_hypertrophy";
  if (goal === "powerlifting_meet") return "strength_hypertrophy";
  if (goal === "get_leaner") return "body_recomposition";
  if (experienceLevel === "beginner") return "beginner_hypertrophy";
  return "hypertrophy";
}

function programmeCreationReason(reason: string): string {
  if (reason === "stale_plan_revision") return "the programme changed while it was being saved";
  if (reason === "atomic_onboarding_commit_failed") return "local storage did not confirm the save";
  if (reason.startsWith("unrestorable_existing_plan:")) return "the existing programme needs recovery first";
  if (reason.includes("unsupported_framework")) return "the selected framework is no longer compatible";
  return "the programme could not be validated";
}
