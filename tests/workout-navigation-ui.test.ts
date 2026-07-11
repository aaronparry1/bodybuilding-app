import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const trainScreen = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const homeScreen = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");
const libraryScreen = readFileSync("app/(protected)/(tabs)/library.tsx", "utf8");
const libraryDetailScreen = readFileSync("app/(protected)/library/[id].tsx", "utf8");
const historyDetailScreen = readFileSync("app/(protected)/history/[id].tsx", "utf8");
const progressScreen = readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");
const advancedReportingSource = readFileSync("src/domain/training/advanced-reporting.ts", "utf8");
const shareCardsSource = readFileSync("src/domain/training/share-cards.ts", "utf8");
const sharePreviewSource = readFileSync("src/features/social-sharing/branded-share-card-preview.tsx", "utf8");
const shareServiceSource = readFileSync("src/features/social-sharing/share-progress-card.ts", "utf8");
const packageSource = readFileSync("package.json", "utf8");
const appConfigSource = readFileSync("app.config.ts", "utf8");
const planScreen = readFileSync("app/(protected)/(tabs)/programmes.tsx", "utf8");
const sessionPrepScreen = readFileSync("app/(protected)/session-prep.tsx", "utf8");
const capacityFocusScreen = readFileSync("app/(protected)/capacity-focus.tsx", "utf8");
const primitives = readFileSync("src/ui/primitives.tsx", "utf8");
const movementGuideSource = readFileSync("src/ui/movement-guide.tsx", "utf8");
const workoutLoggerSource = readFileSync("src/features/workout-logging/use-workout-logger.ts", "utf8");
const activeWorkoutSource = readFileSync("src/domain/training/active-workout.ts", "utf8");
const exercisePreferenceSource = readFileSync("src/domain/training/exercise-preferences.ts", "utf8");
const plannedWorkoutSource = readFileSync("src/domain/training/planned-workout.ts", "utf8");
const trainingSessionSelectionSource = readFileSync("src/domain/training/training-session-selection.ts", "utf8");
const xcodeProjectSource = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj", "utf8");
const performanceDrawerSource = trainScreen.slice(trainScreen.indexOf("function PerformanceLoggingDrawer"), trainScreen.indexOf("function PrepInlineAction"));
const sessionExerciseRowSource = trainScreen.slice(trainScreen.indexOf("function SessionExerciseRow"), trainScreen.indexOf("function OverviewSetRow"));
const overviewSetRowSource = trainScreen.slice(trainScreen.indexOf("function OverviewSetRow"), trainScreen.indexOf("function ExerciseReasonSheet"));
const exerciseMorePanelSource = trainScreen.slice(trainScreen.indexOf("type ExerciseMorePanelRow"), trainScreen.indexOf("function PerformanceLoggingDrawer"));
const addExercisePickerSource = trainScreen.slice(trainScreen.indexOf("function AddExercisePicker"), trainScreen.indexOf("function SwapExercisePicker"));
const swapExercisePickerSource = trainScreen.slice(trainScreen.indexOf("function SwapExercisePicker"), trainScreen.indexOf("function SwapCandidateRow"));
const swapCandidateRowSource = trainScreen.slice(trainScreen.indexOf("function SwapCandidateRow"), trainScreen.indexOf("function CreateSwapExerciseForm"));
const replaceExerciseConfirmationModalSource = trainScreen.slice(trainScreen.indexOf("function ReplaceExerciseConfirmationModal"), trainScreen.indexOf("function CompactTextAction"));
const warmupPrepCustomerFacingSource = [
  trainScreen,
  homeScreen,
  sessionPrepScreen,
  capacityFocusScreen,
  movementGuideSource,
  readFileSync("src/domain/training/session-prep.ts", "utf8"),
  readFileSync("src/domain/training/prep-capacity-guides.ts", "utf8"),
  readFileSync("src/ui/training-system-guide-content.ts", "utf8"),
].join("\n");

describe("workout navigation and logging UI contracts", () => {
  it("renders Home training week as premium session cards while keeping the disclosure collapsible", () => {
    expect(homeScreen).toContain("function HomeCollapsibleSection");
    expect(homeScreen).toContain("const [open, setOpen] = useState(false)");
    expect(homeScreen).toContain('title="Training Week"');
    expect(homeScreen).toContain('summary={trainingWeekSummary}');
    expect(homeScreen).toContain('actionLabel="View Sessions"');
    expect(homeScreen).toContain("TrainingWeekCard");
    expect(homeScreen).not.toContain("Complete all planned sessions to unlock the next training week.");
    expect(homeScreen).toContain("Current session");
    expect(homeScreen).toContain("Upcoming");
    expect(homeScreen).toContain("Completed");
    expect(homeScreen).toContain('label="Start workout"');
    expect(homeScreen).toContain("Session {sessionNumber} of {sessionTotal}");
    expect(homeScreen).toContain("workout.status === \"current\"");
  });

  it("keeps planned workout and session selection modules out of a runtime import cycle", () => {
    expect(plannedWorkoutSource).toContain('export { displayWorkoutName } from "@/domain/training/workout-name"');
    expect(trainingSessionSelectionSource).toContain('from "@/domain/training/workout-name"');
    expect(trainingSessionSelectionSource).not.toContain('from "@/domain/training/planned-workout"');
  });

  it("does not add an explicit duplicate libc++ linker flag on the app target", () => {
    expect(xcodeProjectSource).not.toContain('"-lc++",');
    expect(xcodeProjectSource).toContain("CLANG_CXX_LIBRARY = \"libc++\";");
  });

  it("shows current planning context on Home without changing plan actions", () => {
    expect(homeScreen).toContain("dashboard.planningContext.mesocyclePurpose");
    expect(homeScreen).toContain("dashboard.planningContext.microcycleLabel");
    expect(homeScreen).toContain("dashboard.planningContext.sessionRole");
    expect(homeScreen).not.toContain("dashboard.currentBlock.contextLabel");
    expect(homeScreen).not.toContain("dashboard.nextBlockPreview");
  });

  it("renders completed Home state as a compact action-first status card", () => {
    expect(homeScreen).toContain('dashboard.todayState === "completed_today" ? (');
    expect(homeScreen).toContain("Done today");
    expect(homeScreen).toContain("Next: {upNextName}");
    expect(homeScreen).toContain('DetailToggle label="More" compact');
    expect(homeScreen).toContain('dashboard.showUpNext && dashboard.todayState !== "completed_today"');
    expect(homeScreen).not.toContain("fontSize: 42, lineHeight: 46");
  });

  it("orders Home around today's action and collapses secondary sections by default", () => {
    expect(homeScreen.indexOf("<PremiumCard>")).toBeLessThan(homeScreen.indexOf('<SectionList title="Recovery & Capacity">'));
    expect(homeScreen.indexOf('<SectionList title="Recovery & Capacity">')).toBeLessThan(homeScreen.indexOf('title="Coach Insight"'));
    expect(homeScreen.indexOf('title="Coach Insight"')).toBeLessThan(homeScreen.indexOf('title="Training Week"'));
    expect(homeScreen.indexOf('title="Training Week"')).toBeLessThan(homeScreen.indexOf('title="Recent PRs"'));
    expect(homeScreen.indexOf('title="Recent PRs"')).toBeLessThan(homeScreen.indexOf('title="Completed This Week"'));
    expect(homeScreen).toContain('actionLabel="View Analysis"');
    expect(homeScreen).toContain('hideLabel="Hide Analysis"');
    expect(homeScreen).toContain('summary={coachInsightSummary}');
    expect(homeScreen).toContain('meta={currentTrainingWeekWorkout ? `Current: ${currentTrainingWeekWorkout.label}` : undefined}');
    expect(homeScreen).toContain("completedThisWeekSummary");
  });

  it("surfaces recent PRs on Home without replacing the Progress tab", () => {
    expect(homeScreen).toContain("detectPersonalRecords");
    expect(homeScreen).toContain("homeRecentPrs.length > 0");
    expect(homeScreen).toContain('title="Recent PRs"');
    expect(homeScreen).toContain('actionLabel="View PRs"');
    expect(homeScreen).toContain('label="View Progress"');
  });

  it("shows dated PR history in the Strength Dashboard", () => {
    expect(progressScreen).toContain("Recent PRs");
    expect(progressScreen).toContain("toLocaleDateString");
    expect(progressScreen).toContain("Load PR ·");
    expect(progressScreen).toContain("e1RM PR ·");
  });

  it("surfaces branded share buttons only around meaningful PR and strength surfaces", () => {
    expect(progressScreen).toContain("buildStrengthProgressSharePayload");
    expect(progressScreen).toContain("buildPowerliftingTotalSharePayload");
    expect(progressScreen).toContain("BrandedShareCardPreviewModal");
    expect(progressScreen).toContain("setSharePayload");
    expect(progressScreen).toContain('label="Share progress"');
    expect(progressScreen).toContain('label="Share total"');
    expect(progressScreen).toContain('label="Share PR"');
    expect(homeScreen).toContain("buildPrSharePayload");
    expect(homeScreen).toContain("BrandedShareCardPreviewModal");
    expect(homeScreen).toContain('label="Share PR"');
    expect(trainScreen).toContain("buildWorkoutSummarySharePayload");
    expect(trainScreen).toContain("BrandedShareCardPreviewModal");
    expect(trainScreen).toContain('label="Share summary"');
    expect(trainScreen).toContain('label="Share PR"');
  });

  it("keeps built-in exercises read-only while exposing custom exercise edit and delete controls", () => {
    expect(libraryDetailScreen).toContain("exercise.isCustom ? (");
    expect(libraryDetailScreen).toContain("Edit custom exercise");
    expect(libraryDetailScreen).toContain('label="Edit"');
    expect(libraryDetailScreen).toContain("Delete custom exercise?");
    expect(libraryDetailScreen).toContain("Past completed workouts stay intact");
    expect(libraryDetailScreen).toContain("updateCustomExercise");
    expect(libraryDetailScreen).toContain("deleteCustomExercise");
  });

  it("renders image-card preview sharing with text fallback", () => {
    expect(packageSource).toContain('"expo-sharing"');
    expect(packageSource).toContain('"react-native-view-shot"');
    expect(appConfigSource).toContain('"expo-sharing"');
    expect(sharePreviewSource).toContain("assets/share-card-logo.png");
    expect(sharePreviewSource).toContain("ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL");
    expect(sharePreviewSource).toContain("height: 400");
    expect(sharePreviewSource).toContain("paddingBottom: 30");
    expect(sharePreviewSource).toContain("Share image");
    expect(shareCardsSource).toContain("Adaptive Strength Coach");
    expect(shareCardsSource).toContain("SHARE_CARD_EXPORT_WIDTH = 1080");
    expect(shareCardsSource).toContain("SHARE_CARD_EXPORT_HEIGHT = 1350");
    expect(shareServiceSource).toContain("captureRef");
    expect(shareServiceSource).toContain("SHARE_CARD_EXPORT_WIDTH");
    expect(shareServiceSource).toContain("SHARE_CARD_EXPORT_HEIGHT");
    expect(shareServiceSource).toContain("Sharing.shareAsync");
    expect(shareServiceSource).toContain("fallbackShareMessage");
  });

  it("keeps smart app download links wired for share captions and app links", () => {
    expect(shareCardsSource).toContain("ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL");
    expect(shareCardsSource).toContain("https://adaptivestrengthcoach.com/download");
    expect(shareCardsSource).toContain('"Download:"');
    expect(appConfigSource).toContain('const appDownloadUrl = env("APP_DOWNLOAD_URL"');
    expect(appConfigSource).toContain("const appStoreUrl = process.env.APP_STORE_URL");
    expect(appConfigSource).toContain("const googlePlayUrl = process.env.GOOGLE_PLAY_URL");
    expect(appConfigSource).toContain('associatedDomains: ["applinks:adaptivestrengthcoach.com"]');
    expect(appConfigSource).toContain('host: "adaptivestrengthcoach.com"');
    expect(appConfigSource).toContain('pathPrefix: "/download"');
    expect(appConfigSource).toContain('autoVerify: true');
  });

  it("renders compact advanced reporting sections in Progress", () => {
    expect(progressScreen).toContain("buildAdvancedReports");
    expect(progressScreen).toContain("AdvancedReportsSection");
    expect(advancedReportingSource).toContain("Strength Report");
    expect(advancedReportingSource).toContain("Volume Report");
    expect(advancedReportingSource).toContain("Recovery & Capacity Report");
    expect(advancedReportingSource).toContain("Consistency Report");
  });

  it("keeps shared headers and buttons from wrapping labels awkwardly", () => {
    expect(primitives).toContain("adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1}");
    expect(primitives).toContain("minimumFontScale={0.78}");
    expect(primitives).toContain("minimumFontScale={0.8}");
  });

  it("keeps exercise detail stat cards from splitting short values awkwardly", () => {
    expect(primitives).toContain("export function StatTile");
    expect(primitives).toContain("adjustsFontSizeToFit");
    expect(primitives).toContain("minimumFontScale={0.58}");
    expect(primitives).toContain("numberOfLines={1}");
    expect(libraryDetailScreen).toContain('if (kind === "bodyweight") return "BW";');
    expect(libraryDetailScreen).toContain('return "Bodyweight movement";');
    expect(libraryDetailScreen).toContain('getExerciseMeasurementType(exercise.defaultSettings) === "duration" ? "Typical duration boundary" : "Typical prescription boundary"');
    expect(libraryDetailScreen).toContain("Your generated workout uses exact per-set targets");
    expect(libraryDetailScreen).toContain("formatTargetRange(exercise.defaultRepRange");
    expect(libraryDetailScreen).toContain('<StatTile label="Load jump"');
    expect(libraryDetailScreen).toContain('<StatTile label="Kind"');
  });

  it("renders workout overview as clean exercise cards with set rows", () => {
    expect(trainScreen).toContain("OverviewSetRow");
    expect(trainScreen).toContain("Last set:");
    expect(trainScreen).toContain("productive sets");
    expect(trainScreen).toContain("Performance");
    expect(trainScreen).not.toContain("Log here");
    expect(trainScreen).not.toContain("OverviewExerciseLogger");
  });

  it("opens a compact performance drawer for set logging", () => {
    expect(trainScreen).toContain("PerformanceLoggingDrawer");
    expect(trainScreen).toContain("Set {setNumber} performance");
    expect(trainScreen).toContain("Load");
    expect(trainScreen).toContain("metricLabel");
    expect(trainScreen).toContain("Log set");
    expect(trainScreen).toContain("Exact targets are today’s progression opportunity.");
    expect(trainScreen).toContain("Calibration boundary:");
    expect(trainScreen).toContain("Cancel");
  });

  it("keeps the Train screen compact and action-first by default", () => {
    expect(trainScreen).toContain("WorkoutHeaderMetric");
    expect(trainScreen).toContain("NextExerciseCard");
    expect(trainScreen).toContain("Next up");
    expect(trainScreen).toContain('DetailToggle label="Coach note"');
    expect(trainScreen).not.toContain("Session briefing");
    expect(trainScreen).not.toContain("The plan sets the target");
    expect(trainScreen).not.toContain("Progress chance");
  });

  it("keeps exercise-specific target zone coaching behind disclosure on the active exercise view", () => {
    expect(trainScreen).toContain('measurementType === "duration" ? "Duration" : "Reps"');
    expect(trainScreen).not.toContain('CockpitMetric label="Target Zone"');
    expect(trainScreen).toContain("activeTargetZone.guidance");
    expect(trainScreen).toContain("resolveExerciseTargetZone");
    expect(trainScreen).toContain("formatTargetRange(activeTargetZone.targetZone, measurementType)");
  });

  it("separates warm-up and work rows on exercise cards", () => {
    expect(sessionExerciseRowSource).toContain("Warm-Up Sets");
    expect(sessionExerciseRowSource).toContain("ramp sets");
    expect(sessionExerciseRowSource).toContain("Work sets");
    expect(sessionExerciseRowSource).toContain("overviewSetSectionDividerStyle");
    expect(sessionExerciseRowSource).toContain("plannedRows.warmupRows.map");
    expect(sessionExerciseRowSource).toContain("visibleWorkRows.map");
  });

  it("shows prescribed work-set reps beside load without duplicate set-summary copy", () => {
    expect(trainScreen).toContain("const currentPlannedWorkTarget = resolveTrainExecutionTarget");
    expect(trainScreen).toContain("const plannedWorkTargetMissing = setMode === \"work\" && currentPlannedWorkTarget.source === \"planned_target_missing\"");
    expect(trainScreen).toContain("function formatPlannedWorkSetDisplay");
    expect(trainScreen).toContain("return `${loadLabel} × ${reps}${suffix}`;");
    expect(trainScreen).toContain("activeUnknownLoadLabel(exercise)");
    expect(trainScreen).toContain('return isCalibrationLoadExercise(exercise) ? "Find working load" : "Choose load";');
    expect(trainScreen).toContain("loadLabel: plannedLoadLabel");
    expect(sessionExerciseRowSource).toContain("row.set ? formatSetLoadDisplay(row.set");
    expect(sessionExerciseRowSource).not.toContain("working sets`");
    expect(sessionExerciseRowSource).not.toContain("formatTargetRange(exercise.settings.repRange");
    expect(sessionExerciseRowSource).not.toContain("Last set: no work sets yet");
  });

  it("keeps active exercise More detail athlete-facing and blocks raw engine text", () => {
    expect(sessionExerciseRowSource).toContain("ExerciseMorePanel");
    expect(sessionExerciseRowSource).toContain("buildExerciseMorePanelRows(exercise, metadata, index, sessionKind)");
    expect(sessionExerciseRowSource).toContain('label={showDetails ? "Hide more" : "More"}');
    expect(sessionExerciseRowSource).toContain('label="Open detail"');
    expect(sessionExerciseRowSource).toContain('label={actionsOpen ? "Hide actions" : "Actions"}');
    expect(sessionExerciseRowSource).not.toContain("showDetails && exercise.notes");
    expect(sessionExerciseRowSource).not.toContain("{exercise.notes}");
    expect(exerciseMorePanelSource).toContain("Why this exercise");
    expect(exerciseMorePanelSource).toContain("Today’s target");
    expect(exerciseMorePanelSource).toContain("Own all sets before load increases.");
    expect(exerciseMorePanelSource).toContain("INTERNAL_EXERCISE_DETAIL_PATTERN");
    expect(exerciseMorePanelSource).not.toContain("{exercise.notes}");
    expect(exerciseMorePanelSource).not.toContain("decisionTrace content");
    expect(exerciseMorePanelSource).not.toContain("session.id");
    expect(exerciseMorePanelSource).not.toContain("loadSource");
    expect(exerciseMorePanelSource).not.toContain("decisionTrace.map");
  });

  it("keeps prep and warm-up terminology customer-facing and consistent", () => {
    expect(warmupPrepCustomerFacingSource).not.toMatch(/winning warm-up|winning warmup|wenning warm-up|wenning warmup/i);
    expect(warmupPrepCustomerFacingSource).toContain("Session Prep");
    expect(warmupPrepCustomerFacingSource).toContain("Warm-Up Sets");
    expect(sessionPrepScreen).toContain("Setup: {routine.setupLabel}");
    expect(sessionPrepScreen).toContain('label="Continue to Workout"');
    expect(sessionPrepScreen).toContain('label="Skip Prep"');
    expect(sessionPrepScreen).not.toContain("useState");
    expect(sessionPrepScreen).not.toContain("Start prep");
    expect(sessionPrepScreen).not.toContain("Start workout");
    expect(sessionPrepScreen).toContain('continueToWorkout("completed")');
    expect(sessionPrepScreen).toContain('continueToWorkout("skipped")');
    expect(sessionPrepScreen).toContain("Optional. This prepares the session and does not affect progression.");
    expect(warmupPrepCustomerFacingSource).toContain("Warm-Up Sets happen inside an exercise.");
    expect(warmupPrepCustomerFacingSource).toContain("Session Prep happens before the workout.");
  });

  it("hides future uncompleted work rows after shutdown while keeping logged rows editable", () => {
    expect(sessionExerciseRowSource).toContain('const isFinishedEarly = exercise.status === "shutdown" || Boolean(exercise.finishedManually);');
    expect(sessionExerciseRowSource).toContain("isFinishedEarly ? plannedRows.workRows.filter((row) => row.set) : plannedRows.workRows");
    expect(sessionExerciseRowSource).toContain("Shut down here. Move on.");
    expect(trainScreen).toContain("disabled={disabled && !logged}");
    expect(trainScreen).toContain('{logged ? "Logged · Edit" : "Performance"}');
  });

  it("lets users swipe-delete future unlogged work rows without changing logged-set editing", () => {
    expect(sessionExerciseRowSource).toContain("onDeleteFutureWorkSet");
    expect(sessionExerciseRowSource).toContain("onDeleteLoggedSet");
    expect(sessionExerciseRowSource).toContain("const loggedSetId = row.set?.id;");
    expect(sessionExerciseRowSource).toContain("loggedSetId ? () => onDeleteLoggedSet(loggedSetId)");
    expect(sessionExerciseRowSource).toContain("exercise.status === \"active\" ? () => onDeleteFutureWorkSet(row.setNumber)");
    expect(sessionExerciseRowSource).toContain("onDeleteFutureWorkSet(row.setNumber)");
    expect(trainScreen).toContain("confirmDeleteLoggedSetFromOverview");
    expect(trainScreen).toContain("This removes the logged set from today’s workout.");
    expect(overviewSetRowSource).toContain("PanResponder.create");
    expect(overviewSetRowSource).toContain("Delete set ${setNumber}");
    expect(overviewSetRowSource).toContain('pointerEvents={deleteRevealed ? "auto" : "none"}');
    expect(workoutLoggerSource).toContain("removeFutureWorkSetAtIndex");
    expect(trainScreen).toContain("removedFutureWorkSetNumbers");
  });

  it("lets users manually finish an exercise from More with a reason modal", () => {
    expect(sessionExerciseRowSource).toContain('label="Finish exercise"');
    expect(trainScreen).toContain("ManualFinishExerciseModal");
    expect(trainScreen).toContain("manualFinishReasonOptions");
    expect(trainScreen).toContain('label="Finish"');
    expect(trainScreen).toContain("Completed enough for today");
    expect(trainScreen).toContain("Fatigue / performance dropping");
    expect(trainScreen).toContain("Pain or limitation");
    expect(trainScreen).toContain("Equipment unavailable");
    expect(trainScreen).toContain("Taking it easy today");
    expect(trainScreen).toContain("Out of time");
    expect(trainScreen).toContain('label="Finish Exercise"');
    expect(trainScreen).toContain("finishExerciseAtIndex(index, reason)");
    expect(trainScreen).toContain("recordPendingExerciseReason");
  });

  it("allows warm-up row prescription adjustments without changing training logic", () => {
    expect(trainScreen).toContain("warmupRowCounts");
    expect(trainScreen).toContain("handleAddWarmupRow");
    expect(trainScreen).toContain("handleRemoveWarmupRow");
    expect(sessionExerciseRowSource).toContain('label="+ Warm-up set"');
    expect(sessionExerciseRowSource).toContain('label="- Warm-up set"');
    expect(sessionExerciseRowSource).not.toContain('label="Remove warm-up"');
    expect(trainScreen).toContain("Math.max(loggedWarmups, currentCount - 1)");
  });

  it("keeps warm-up controls below rows and makes warm-up sections collapsible", () => {
    expect(trainScreen).toContain("warmupExpansionOverrides");
    expect(trainScreen).toContain("handleToggleWarmup");
    expect(trainScreen).toContain("summary.index === 0");
    expect(sessionExerciseRowSource).toContain("warmupExpanded");
    expect(sessionExerciseRowSource).toContain('label={warmupExpanded ? "Hide" : "Show"}');
    expect(sessionExerciseRowSource.indexOf("plannedRows.warmupRows.map")).toBeGreaterThan(-1);
    expect(sessionExerciseRowSource.indexOf('label="+ Warm-up set"')).toBeGreaterThan(sessionExerciseRowSource.indexOf("plannedRows.warmupRows.map"));
    expect(sessionExerciseRowSource.indexOf('label="- Warm-up set"')).toBeGreaterThan(sessionExerciseRowSource.indexOf("plannedRows.warmupRows.map"));
  });

  it("allows logged sets to be edited from set history", () => {
    expect(trainScreen).toContain("EditableSetGroup");
    expect(trainScreen).toContain("Edit Set");
    expect(trainScreen).toContain("Save Changes");
    expect(trainScreen).toContain("Delete Set");
    expect(trainScreen).toContain("onEditSet");
    expect(trainScreen).toContain("onDeleteSet");
  });

  it("keeps edit-set mode separate from new-set logging context", () => {
    const editBranchSource = performanceDrawerSource.slice(performanceDrawerSource.indexOf("editingSetId ? ("), performanceDrawerSource.indexOf(") : ("));
    expect(editBranchSource).toContain("Edit Set");
    expect(editBranchSource).toContain("Save Changes");
    expect(editBranchSource).toContain("Delete Set");
    expect(editBranchSource).toContain('label="Cancel"');
    expect(editBranchSource).not.toContain("RestTimerPanel");
    expect(editBranchSource).not.toContain("Log set");
    expect(editBranchSource).not.toContain("Target:");
    expect(editBranchSource).not.toContain("productiveSetGuidance");
  });

  it("refreshes the edited row and closes the edit drawer after save, cancel, or delete", () => {
    expect(performanceDrawerSource).toContain("const [displayExercise, setDisplayExercise] = useState(exercise)");
    expect(performanceDrawerSource).toContain("const updatedExercise = onEditSet");
    expect(performanceDrawerSource).toContain("setDisplayExercise(updatedExercise)");
    expect(performanceDrawerSource).toContain("const savedSet = updatedExercise.sets.find");
    expect(performanceDrawerSource).toContain("Keyboard.dismiss();\n      setEditingSetId(null);\n      onClose();");
    expect(performanceDrawerSource).toContain("const updatedExercise = onDeleteSet");
    expect(performanceDrawerSource).toContain("Keyboard.dismiss();\n            setEditingSetId(null);\n            onClose();");
    expect(performanceDrawerSource).toContain("Keyboard.dismiss();\n                        setEditingSetId(null);\n                        onClose();");
    expect(workoutLoggerSource).toContain("return nextSession.exercises[index] ?? null");
  });

  it("keeps performance and edit drawers keyboard-aware and dismissible", () => {
    expect(performanceDrawerSource).toContain("KeyboardAvoidingView");
    expect(performanceDrawerSource).toContain('keyboardDismissMode="on-drag"');
    expect(performanceDrawerSource).toContain('keyboardShouldPersistTaps="handled"');
    expect(performanceDrawerSource).toContain("onPress={Keyboard.dismiss}");
    expect(performanceDrawerSource).toContain('returnKeyType="done"');
    expect(performanceDrawerSource).toContain("onSubmitEditing={Keyboard.dismiss}");
    expect(performanceDrawerSource).toContain("Keyboard.dismiss();");
    expect(performanceDrawerSource).toContain("InputAccessoryView");
    expect(performanceDrawerSource).toContain("Done");
  });

  it("dismisses transient Train overlays when navigating away from the Train tab", () => {
    expect(trainScreen).toContain("useFocusEffect");
    expect(trainScreen).toContain("Keyboard.dismiss();\n        setPerformanceDrawer(null);");
    expect(trainScreen).toContain("setSwapPickerIndex(null);");
    expect(trainScreen).toContain("setShowAddExercise(false);");
    expect(trainScreen).toContain("setPendingEscalationPrompt(null);");
    expect(trainScreen).toContain("setPendingExerciseReasonAction(null);");
    expect(trainScreen).toContain("setPendingAddExercise(null);");
  });

  it("opens logged set rows as edit targets", () => {
    expect(trainScreen).toContain("editSetId");
    expect(trainScreen).toContain("initialEditSetId");
    expect(trainScreen).toContain("row.set?.id");
    expect(trainScreen).toContain("Logged · Edit");
    expect(trainScreen).toContain("accessibilityLabel={logged ? `Edit set ${setNumber}`");
  });

  it("logs the committed manual load on the first attempt", () => {
    expect(trainScreen).toContain("const committedLoad = commitLoad();");
    expect(trainScreen).toContain("onLogSet(exerciseIndex, value, mode, committedLoad);");
    expect(trainScreen).toContain("logSetAtIndex(index, reps, type, loadOverride)");
  });

  it("keeps active workout data ahead of programme-day creation when Train remounts", () => {
    expect(activeWorkoutSource).toContain("export function getLatestOpenSession");
    expect(workoutLoggerSource.indexOf("const latestOpenSession = getLatestOpenSession(sessions);")).toBeGreaterThan(-1);
    expect(workoutLoggerSource.indexOf("const latestOpenSession = getLatestOpenSession(sessions);")).toBeLessThan(workoutLoggerSource.indexOf("const programmeSession = createSessionFromProgrammeDay(user?.id);"));
    expect(workoutLoggerSource).toContain("const latestOpenSession = getLatestOpenSession(workoutSessionRepository.list());");
    expect(workoutLoggerSource).toContain("setSession(latestOpenSession);");
  });

  it("uses the recovery constructor as the only active-plan workout path", () => {
    expect(workoutLoggerSource).toContain("buildRecoveryWorkoutSession");
    expect(workoutLoggerSource).toContain("Production recovery has one entry point");
    expect(workoutLoggerSource).toContain('case "blocked_by_intervention":');
    expect(workoutLoggerSource).toContain('case "no_eligible_candidate":');
    expect(workoutLoggerSource).toContain('case "invalid_input":');
  });

  it("starts the active-plan Train flow when the legacy preview is unavailable instead of restarting onboarding", () => {
    const homeScreen = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");

    expect(homeScreen).toContain('if (!activePlan || !requirePremiumForTodayWorkout("start")) return;');
    expect(homeScreen).toContain('router.push("/(protected)/(tabs)/train");');
    expect(homeScreen).not.toContain('router.push("/(protected)/onboarding");');
  });

  it("keeps V2 live prescriptions out of a visible QA card on Train", () => {
    expect(trainScreen).not.toContain("V2CoachingQaPanel");
    expect(trainScreen).not.toContain("V2 QA");
  });

  it("prompts before replacing a different active workout from Home", () => {
    expect(homeScreen).toContain("handleActiveWorkoutConflict");
    expect(homeScreen).toContain("buildWorkoutConflictCopy");
    expect(homeScreen).toContain("isSameWorkoutStartTarget(openWorkout, target)");
    expect(homeScreen).toContain('Alert.alert(copy.title, copy.body');
    expect(homeScreen).toContain("workoutSessionRepository.remove(openWorkout.id);");
    expect(homeScreen).toContain("onDiscardAndStart();");
    expect(homeScreen).toContain("router.push(\"/(protected)/(tabs)/train\")");
  });

  it("keeps unknown-load guidance readable in overview set rows", () => {
    expect(trainScreen).toContain("overviewSetLoadTextStyle");
    expect(trainScreen).not.toContain("<Text selectable numberOfLines={1} style={{ color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: \"800\", flex: 1 }}");
    expect(trainScreen).toContain("flexShrink: 1");
    expect(trainScreen).toContain("minWidth: 0");
    expect(trainScreen).toContain("loadDisplayForExercise(exercise, metadata, exercise.settings.unit, { preserveExact: true })");
  });

  it("only shows in-session escalation when another work row remains", () => {
    expect(trainScreen).toContain("hasNextWorkSet");
    expect(trainScreen).toContain("hasFutureUncompletedWorkSetAfterLog");
    expect(trainScreen).toContain("mode === \"work\" && hasFutureWorkSet && !suppressLoadEscalation");
    expect(trainScreen).toContain("summary.setPrescription.recommendedMaxSets");
    expect(trainScreen).toContain("!activeHasNextWorkSet");
    expect(trainScreen).toContain("!inSessionLoadSuggestion.shouldSuggest");
  });

  it("wires immediate in-session load drops into the live workout logger", () => {
    expect(workoutLoggerSource).toContain("getInSessionLoadDropSuggestion");
    expect(workoutLoggerSource).toContain("const shouldUsePlannedLoadEvidence = session.sessionKind == null || session.sessionKind === \"planned\";");
    expect(workoutLoggerSource).toContain("const correctedExerciseLoad = loadDrop?.shouldDrop ? loadDrop.suggestedLoad : nextExerciseLoad;");
    expect(workoutLoggerSource).toContain("load: correctedExerciseLoad");
  });

  it("shows in-session escalation as a modal after the drawer closes", () => {
    expect(trainScreen).toContain("pendingEscalationPrompt");
    expect(trainScreen).toContain("InSessionEscalationModal");
    expect(trainScreen).toContain('animationType="fade"');
    expect(trainScreen).toContain("onRequestClose={onKeep}");
    expect(trainScreen).toContain("You earned more weight.");
    expect(trainScreen).toContain("onEscalationSuggestion");
    expect(trainScreen).toContain("setPerformanceDrawer(null);");
    expect(trainScreen).toContain("Try {suggestedLoadLabel} on the next {prompt.exerciseName} set?");
    expect(trainScreen).toContain("Top reps hit across productive sets. Fatigue still looks under control.");
    expect(trainScreen).toContain('label="Keep current load"');
    expect(trainScreen).toContain("label={`Use ${suggestedLoadLabel}`}");
    expect(sessionExerciseRowSource).not.toContain("pendingEscalationPrompt");
    expect(sessionExerciseRowSource).not.toContain("overviewEscalationPromptStyle");
    expect(performanceDrawerSource).not.toContain("You hit the top of the range.");
    expect(performanceDrawerSource).not.toContain("Suggested next set:");
    expect(performanceDrawerSource).not.toContain("Keep current load");
  });

  it("keeps rest timer visible while scrolling and alerts when rest ends", () => {
    expect(trainScreen).toContain("WorkoutRestTimerStrip");
    expect(trainScreen).toContain("workoutRestTimerRegionStyle");
    expect(trainScreen).toContain("workoutRestTimerStripStyle");
    expect(trainScreen).toContain("⏱ Rest: {formatRestTime(remainingSeconds)}");
    expect(trainScreen).toContain('{expanded ? "Hide" : "Controls"}');
    expect(trainScreen).toContain("expanded ? (");
    expect(trainScreen.indexOf('label="-15s"')).toBeLessThan(trainScreen.indexOf('label="+15s"'));
    expect(trainScreen.indexOf('label="+15s"')).toBeLessThan(trainScreen.indexOf('label="Skip"'));
    expect(trainScreen).toContain("<RestTimerControlButton label=\"Skip\" onPress={onSkip} emphasis />");
    expect(trainScreen).toContain("restTimerControlButtonStyle(pressed, emphasis)");
    expect(trainScreen).not.toContain("FloatingRestTimer");
    expect(trainScreen).not.toContain("floatingRestTimerContainerStyle");
    expect(trainScreen).not.toContain("paddingBottom: tabAwareBottomPadding + (restTimer ? 116 : 0)");
    expect(sessionExerciseRowSource).not.toContain("WorkoutRestTimerStrip");
    expect(workoutLoggerSource).toContain("Alert.alert(\"Rest complete\"");
    expect(workoutLoggerSource).toContain("getRestCompleteMessage");
    expect(workoutLoggerSource).toContain("lastRestCompleteMessage");
    expect(workoutLoggerSource).toContain("setRestTimer(null)");
    expect(workoutLoggerSource).not.toContain("${restTimer.exerciseName} is ready.");
  });

  it("surfaces cardio interference guidance in the cardio logging flow without changing lifting controls", () => {
    expect(trainScreen).toContain("evaluateCardioInterference");
    expect(trainScreen).toContain("cardioInterference");
    expect(trainScreen).toContain("interference?: CardioInterferenceResult | null");
    expect(trainScreen).toContain('interference.verdict !== "allowed"');
    expect(trainScreen).toContain("Keep this easy");
    expect(trainScreen).toContain("Interference check");
    expect(trainScreen).toContain("interference.suggestedAlternative");
    expect(trainScreen).toContain("Save cardio session");
  });

  it("keeps performance drawer reps as a single editable field without preset chips", () => {
    expect(performanceDrawerSource).toContain("overviewRepInputStyle");
    expect(performanceDrawerSource).toContain("placeholder={metricLabel}");
    expect(performanceDrawerSource).toContain("metricInputLabel(measurementType)");
    expect(performanceDrawerSource).not.toContain("quickReps.map");
    expect(performanceDrawerSource).not.toContain("overviewRepChipStyle");
    expect(performanceDrawerSource).not.toContain("Log 12 reps");
  });

  it("does not let warm-up load entry update the working-load prescription", () => {
    expect(performanceDrawerSource).toContain("commitLoad(mode === \"work\")");
    expect(performanceDrawerSource).toContain("if (updateWorkingLoad) {");
    expect(performanceDrawerSource).toContain("if (mode === \"work\") {");
    expect(performanceDrawerSource).toContain("onUpdateLoad(exerciseIndex, nextLoad)");
    expect(workoutLoggerSource).toContain('const nextExerciseLoad = type === "work" ? effectiveLoad : targetExercise.load');
    expect(workoutLoggerSource).toContain('const nextExerciseLoadKnown = type === "work" ? true : targetExercise.loadKnown');
  });

  it("keeps load unit inline with the drawer load input", () => {
    expect(performanceDrawerSource).toContain("inlineUnitInputStyle");
    expect(performanceDrawerSource).toContain("overviewLoadInputInlineStyle");
    expect(performanceDrawerSource).toContain("{unit}");
  });

  it("shows prep as a small text action instead of a bulky overview card", () => {
    expect(trainScreen).toContain("Prep: {statusLabel}");
    expect(trainScreen).toContain("PrepInlineAction");
    expect(trainScreen).not.toContain("sessionPrepPanelStyle");
    expect(trainScreen).not.toContain("compactPrepRowStyle");
  });

  it("shows Complete Workout with early and ready confirmation copy", () => {
    expect(trainScreen).toContain("CompleteWorkoutButton");
    expect(trainScreen).toContain("confirmCompleteWorkout(plannedWorkComplete, handleOpenWorkoutReview)");
    expect(trainScreen).toContain("Workout Review");
    expect(trainScreen).toContain("Approve all and finish");
    expect(workoutLoggerSource).toContain("activeExerciseIndex >= nextSession.exercises.length - 1");
    expect(workoutLoggerSource).toContain("persistSession(nextSession)");
    expect(trainScreen).toContain("Complete workout early?");
    expect(trainScreen).toContain("Some planned work sets are still unfinished. Complete anyway?");
    expect(trainScreen).toContain("Complete workout?");
    expect(trainScreen).toContain("All planned work is complete. Save this session?");
    expect(trainScreen).toContain("Complete workout");
    expect(trainScreen).not.toContain("confirmEndWorkout");
    expect(trainScreen).not.toContain("End Workout");
  });

  it("shows PRs and baselines separately in Workout Review", () => {
    expect(trainScreen).toContain("New PRs");
    expect(trainScreen).toContain("New baselines");
    expect(trainScreen).toContain("review.personalRecords");
    expect(trainScreen).toContain("review.baselines");
    expect(trainScreen).toContain("First tracked bests. Useful, but not a victory lap yet.");
  });

  it("colours Complete Workout as destructive until planned work is complete, then success", () => {
    expect(trainScreen).toContain("completeWorkoutButtonStyle(pressed, ready)");
    expect(trainScreen).toContain("borderColor: ready ? colors.success : colors.danger");
    expect(trainScreen).toContain("backgroundColor: ready ? (pressed ? \"#173522\" : colors.successSoft) : pressed ? colors.dangerSoft : \"transparent\"");
  });

  it("uses required work sets, not warm-ups, to decide workout completion", () => {
    expect(trainScreen).toContain("function isExercisePlannedWorkComplete");
    expect(trainScreen).toContain('exercise.status === "complete"');
    expect(trainScreen).toContain('exercise.status === "shutdown"');
    expect(trainScreen).toContain("getWorkSets(exercise.sets).length >= getRequiredSets(exercise.settings)");
    expect(trainScreen).not.toContain("getWarmupSets(exercise.sets).length >= exercise.settings.requiredWorkSets");
  });

  it("separates finishing a workout from cancelling and discarding it", () => {
    expect(trainScreen).toContain('label="Cancel Workout"');
    expect(trainScreen).toContain("confirmCancelWorkout");
    expect(trainScreen).toContain("Cancel workout?");
    expect(trainScreen).toContain("This will discard logged sets from this active workout.");
    expect(trainScreen).toContain("Keep workout");
  });

  it("keeps calibration active workout guidance minimal and avoids fake exact loads", () => {
    expect(trainScreen).toContain("function isCalibrationLoadExercise");
    expect(trainScreen).toContain("activeUnknownMetricLabel(exercise)");
    expect(trainScreen).toContain("activeUnknownLoadLabel(exercise)");
    expect(trainScreen).toContain("Calibrate");
    expect(trainScreen).not.toContain("0kg");
    expect(trainScreen).not.toContain("0 kg");
  });

  it("shows a concise deload note when the active block is deload", () => {
    expect(trainScreen).toContain("currentBlock?.type === \"deload\"");
    expect(trainScreen).toContain("Keep it easy enough to rebound.");
  });

  it("keeps compact card actions available without dominant buttons", () => {
    expect(trainScreen).toContain("CompactTextAction");
    expect(trainScreen).toContain('label={showDetails ? "Hide more" : "More"}');
    expect(trainScreen).toContain('label="Open detail"');
    expect(trainScreen).toContain('actionsOpen ? "Hide actions" : "Actions"');
    expect(trainScreen).not.toContain('CompactTextAction label="Swap"');
    expect(trainScreen).not.toContain('CompactTextAction label="Remove"');
    expect(trainScreen).toContain('label="Swap exercise"');
    expect(trainScreen).toContain('label="Remove for today"');
    expect(trainScreen).toContain("Actions");
    expect(trainScreen).not.toContain("Swipe actions");
  });

  it("renders More Open detail Actions below the set rows", () => {
    expect(sessionExerciseRowSource.indexOf("overviewSetTableStyle")).toBeGreaterThan(-1);
    expect(sessionExerciseRowSource.indexOf('label={showDetails ? "Hide more" : "More"}')).toBeGreaterThan(sessionExerciseRowSource.indexOf("overviewSetTableStyle"));
    expect(sessionExerciseRowSource.indexOf('label="Open detail"')).toBeGreaterThan(sessionExerciseRowSource.indexOf("overviewSetTableStyle"));
    expect(sessionExerciseRowSource.indexOf('actionsOpen ? "Hide actions" : "Actions"')).toBeGreaterThan(sessionExerciseRowSource.indexOf("overviewSetTableStyle"));
  });

  it("opens a dedicated swap picker instead of rendering suggestions at the bottom of the workout", () => {
    expect(trainScreen).toContain("SwapExercisePicker");
    expect(trainScreen).toContain("Swap Exercise");
    expect(trainScreen).toContain("Choose a replacement for {exercise.exerciseName}");
    expect(trainScreen).toContain("Recommended");
    expect(trainScreen).toContain("Browse Library");
    expect(trainScreen).toContain("Search Results");
    expect(trainScreen).toContain("No exercises found. Try another search or create a new exercise above.");
    expect(trainScreen).toContain("Search all exercises");
    expect(trainScreen).toContain("Create new exercise");
    expect(swapExercisePickerSource.indexOf('SecondaryButton label={showCreate ? "Hide create new exercise" : "Create new exercise"}')).toBeLessThan(swapExercisePickerSource.indexOf('accessibilityLabel="Search all exercises"'));
    expect(swapExercisePickerSource.indexOf('accessibilityLabel="Search all exercises"')).toBeLessThan(swapExercisePickerSource.indexOf("isSearching ?"));
    expect(swapExercisePickerSource).toContain("{isSearching ? (");
    expect(swapExercisePickerSource).toContain("searchableExercises.length === 0");
    expect(trainScreen).toContain("ReplaceExerciseConfirmationModal");
    expect(trainScreen).toContain("visible={swapPickerIndex != null && !pendingSwapExercise}");
    expect(replaceExerciseConfirmationModalSource).toContain("<Modal visible={visible} transparent animationType=\"fade\"");
    expect(replaceExerciseConfirmationModalSource).toContain("Replace exercise?");
    expect(replaceExerciseConfirmationModalSource).toContain("Replace {currentExerciseName} with {replacementExerciseName ?? \"this exercise\"}?");
    expect(replaceExerciseConfirmationModalSource).toContain('SecondaryButton label="Cancel"');
    expect(replaceExerciseConfirmationModalSource).toContain('PrimaryButton label="Replace"');
    expect(swapExercisePickerSource).not.toContain("Replace {exercise.exerciseName} with {pendingExercise.name}?");
    expect(swapExercisePickerSource).not.toContain("swapConfirmationInlineStyle");
    expect(trainScreen).toContain("handleConfirmSwapReplacement");
    expect(trainScreen).toContain("const swapped = swapExerciseAtIndex(pending.exerciseIndex, pendingSwapExercise.id)");
    expect(trainScreen).toContain('recordPendingExerciseReason(pending, "prefer_another")');
    expect(workoutLoggerSource).toContain("...targetExercise.settings");
    expect(trainScreen).toContain("setSwapPickerIndex(null)");
    expect(trainScreen).toContain("onCancel={() => setPendingSwapExercise(null)}");
    expect(trainScreen).not.toContain("OverviewSwapPanel");
  });

  it("asks for a fast reason when swapping, removing, or skipping an exercise", () => {
    expect(trainScreen).toContain("ExerciseReasonSheet");
    expect(trainScreen).toContain("Why {actionLabel} this exercise?");
    expect(exercisePreferenceSource).toContain("Pain / limitation");
    expect(exercisePreferenceSource).toContain("Equipment unavailable");
    expect(exercisePreferenceSource).toContain("Machine occupied");
    expect(exercisePreferenceSource).toContain("Temporary skip");
    expect(trainScreen).toContain("recordExerciseReasonForFutureCoaching");
    expect(trainScreen).toContain("recordPendingExerciseReason");
    expect(trainScreen).toContain('type: "remove"');
    expect(trainScreen).toContain('type: "skip"');
    expect(trainScreen).toContain('type: "swap"');
  });

  it("opens a dedicated Add Exercise picker with recommendations, full search, and custom creation", () => {
    expect(trainScreen).toContain("AddExercisePicker");
    expect(trainScreen).toContain("buildRecommendedAddExerciseOptions");
    expect(trainScreen).toContain("Choose an exercise");
    expect(trainScreen).toContain("Adds to this workout only. Your programme stays clean.");
    expect(trainScreen).toContain("Recommended");
    expect(trainScreen).toContain("Search Library");
    expect(trainScreen).toContain("Search all exercises");
    expect(trainScreen).toContain("Create new exercise");
    expect(trainScreen).toContain("Add {pendingExercise.name}?");
    expect(trainScreen).toContain("addExercise(pendingAddExercise.id, addPosition)");
    expect(trainScreen).not.toContain('showAddExercise ? "Hide add exercise" : "Add exercise"');
  });

  it("orders Add Exercise picker as Recommended, Create New Exercise, then Search Library", () => {
    expect(addExercisePickerSource.indexOf("Recommended")).toBeGreaterThan(-1);
    expect(addExercisePickerSource.indexOf("Create new exercise")).toBeGreaterThan(addExercisePickerSource.indexOf("Recommended"));
    expect(addExercisePickerSource.indexOf("Search Library")).toBeGreaterThan(addExercisePickerSource.indexOf("Create new exercise"));
    expect(addExercisePickerSource).toContain("const [showCreate, setShowCreate] = useState(false)");
    expect(addExercisePickerSource).toContain("showCreate ? <CreateSwapExerciseForm");
  });

  it("uses full-library name and taxonomy search in Add and Swap pickers", () => {
    expect(addExercisePickerSource).toContain("allExercises.filter");
    expect(addExercisePickerSource).toContain("candidate.name");
    expect(addExercisePickerSource).toContain("candidate.family.replaceAll");
    expect(addExercisePickerSource).toContain("candidate.equipment.join");
    expect(addExercisePickerSource).toContain("candidate.swapTags.join");
    expect(trainScreen).toContain("function SwapExercisePicker");
    expect(trainScreen).toContain("const haystack = [candidate.name, candidate.family.replaceAll");
    expect(swapExercisePickerSource).toContain("candidate.swapTags.join");
  });

  it("keeps exercise detail secondary but clearly navigable back to the workout", () => {
    expect(trainScreen).toContain("← Workout");
    expect(trainScreen).toContain("Detail");
  });

  it("keeps nested prep and capacity routes escapable", () => {
    expect(sessionPrepScreen).toContain('label="Back"');
    expect(capacityFocusScreen).toContain('label="Back"');
    expect(capacityFocusScreen).not.toContain("Back to settings");
  });

  it("keeps prep and capacity how guides behind disclosure controls", () => {
    expect(sessionPrepScreen).toContain("GuideDisclosureRow");
    expect(capacityFocusScreen).not.toContain("GuideDisclosureRow");
    expect(capacityFocusScreen).toContain("Example exercises");
    expect(capacityFocusScreen).toContain("Progression guidance");
    expect(movementGuideSource).toContain('label="Why?"');
    expect(movementGuideSource).toContain('label="How?"');
    expect(movementGuideSource).toContain('flexDirection: "row"');
    expect(movementGuideSource).toContain("type GuidePanel = \"why\" | \"how\" | null");
    expect(movementGuideSource).toContain("buildConciseGuideItems");
    expect(movementGuideSource).toContain(".slice(0, 5)");
    expect(movementGuideSource).toContain("Cue: ${guide.cues[0]}");
    expect(movementGuideSource).toContain("Avoid: ${avoid}");
    expect(movementGuideSource).toContain("useState<GuidePanel>(null)");
    expect(primitives).toContain("{open ?");
  });

  it("shows Progress recommendation actions without automatic plan mutation", () => {
    expect(progressScreen).toContain("progress.journeyActions.primary.label");
    expect(progressScreen).toContain("progress.journeyActions.primary.href");
    expect(progressScreen).toContain("progress.journeyActions.secondary.label");
    expect(progressScreen).toContain("Alert.alert");
  });

  it("keeps Beginner metadata off default Library cards", () => {
    expect(libraryScreen).toContain('meta={exercise.isCustom ? "Custom" : undefined}');
    expect(libraryScreen).not.toContain('isBeginnerFriendly ? "Beginner"');
  });

  it("puts Library search before filters and switches active search into results-only mode", () => {
    expect(libraryScreen.indexOf('AppInput label="Search"')).toBeGreaterThan(-1);
    expect(libraryScreen.indexOf('AppInput label="Search"')).toBeLessThan(libraryScreen.indexOf('<FilterRail label="Muscle"'));
    expect(libraryScreen).toContain("const activeSearch = query.trim().length > 0");
    expect(libraryScreen).toContain("!activeSearch ? (");
    expect(libraryScreen).toContain("Search mode");
    expect(libraryScreen).toContain("Showing matching exercises only");
    expect(libraryScreen).toContain("search result");
    expect(libraryScreen).toContain("No matches yet. Clear the search or add a custom exercise.");
    expect(primitives).toContain('keyboardDismissMode="on-drag"');
  });

  it("moves cardio out of the generic Extra Session picker and into Recovery & Capacity", () => {
    expect(homeScreen).toContain("isCardioExtraSessionMode");
    expect(homeScreen).toContain("Cardio & Conditioning");
    expect(homeScreen).not.toContain("Improve fitness while supporting recovery and performance.");
    expect(homeScreen).toContain('Alert.alert("Timing check"');
    expect(homeScreen).toContain("recoveryCapacityTarget.timingGuidance.bestTimingGuidance");
    expect(homeScreen).toContain('label={recoveryCapacityTarget?.actionLabel ?? "Start Cardio Session"}');
    expect(homeScreen).toContain("startCardioSession");
    expect(homeScreen).toContain("Recommended this week");
    expect(homeScreen).toContain("{recoveryCapacityTarget.completedSessions} / {recoveryCapacityTarget.targetSessions} completed");
    expect(homeScreen).toContain("Target: {recoveryCapacityTarget.targetLabel}");
    expect(homeScreen).toContain("cardio-best");
    expect(homeScreen).toContain("cardio-avoid");
    expect(homeScreen).not.toContain("{recoveryCapacityTarget.completedSessions} / {recoveryCapacityTarget.targetSessions} sessions completed");
    expect(homeScreen).not.toContain("Recovery target evidence");
    expect(homeScreen).toContain("extraSessionModeLabel(mode)");
    expect(homeScreen).not.toContain('{ value: "capacity", label: "Capacity" }');
    expect(homeScreen).not.toContain('{ value: "recovery_cardio", label: "Recovery Cardio" }');
    expect(homeScreen).not.toContain('{ value: "capacity_cardio", label: "Capacity Cardio" }');
    expect(homeScreen).not.toContain('{ value: "performance_conditioning", label: "Performance Conditioning" }');
    expect(homeScreen).toContain("cardioMode ? (");
    expect(homeScreen).toContain("Easy work for recovery and work capacity. Low fatigue by design.");
    expect(homeScreen).toContain("Moderate conditioning. Useful, but it should not fight the lifting plan.");
  });

  it("routes low back capacity into the Extra Session capacity flow", () => {
    expect(capacityFocusScreen).toContain('label="Start Low Back Capacity Session"');
    expect(capacityFocusScreen).toContain('params: { extraSession: "capacity" }');
    expect(homeScreen).toContain("useLocalSearchParams");
    expect(homeScreen).toContain('params.extraSession !== "capacity"');
    expect(homeScreen).toContain('startExtraSession("capacity")');
    expect(homeScreen).toContain('selectedMode === "capacity"');
    expect(homeScreen).toContain("buildCapacitySessionProgramme");
    expect(homeScreen).toContain('PrimaryButton label="Start Capacity Session"');
  });

  it("surfaces current-week completed workouts from Home for editing", () => {
    expect(homeScreen).toContain("Completed This Week");
    expect(homeScreen).toContain('actionLabel="View Completed"');
    expect(homeScreen).toContain("View/Edit");
    expect(homeScreen).toContain("completedSessionsForWeek");
    expect(homeScreen).not.toContain("Complete Week");
  });

  it("keeps completed workout editing scoped to current-week history", () => {
    expect(historyDetailScreen).toContain("Current-week workout. Tap a set to edit load, reps, or warm-up/work.");
    expect(historyDetailScreen).toContain("Older workouts are read-only for now.");
    expect(historyDetailScreen).toContain("allowCompleted: true");
    expect(historyDetailScreen).toContain("Edit set");
    expect(historyDetailScreen).toContain("Delete set?");
  });

  it("keeps Plan focused by removing redundant action buttons", () => {
    expect(planScreen).not.toContain('label="Create session"');
    expect(planScreen).not.toContain('label={canCreateProgramme ? "Plan settings" : "Upgrade"}');
    expect(planScreen).not.toContain("Library shortcut");
    expect(homeScreen).toContain("Create Extra Session");
    expect(homeScreen).toContain("Settings");
  });

  it("presents planning context before approved choices without a legacy roadmap", () => {
    expect(planScreen).toContain("PlanningContextCard");
    expect(planScreen).toContain("currentMesocyclePurpose");
    expect(planScreen).toContain("currentMicrocycle.number");
    expect(planScreen).toContain("currentSessionRole");
    expect(planScreen).toContain('Session role: {viewModel.currentSessionRole ?? "Planned session"}');
    expect(planScreen).toContain("approvedNextMesocycles");
    expect(planScreen.indexOf("<PlanningContextCard")).toBeLessThan(planScreen.indexOf('title="Approved next mesocycle states"'));
    expect(planScreen).not.toContain("<RoadmapStageCard");
    expect(planScreen).not.toContain("onSelectBlock");
    expect(planScreen).not.toContain("BlockExplanationModal");
    expect(planScreen).not.toContain("NextBlockChooserModal");
  });

  it("bounds long titles and exercise names instead of allowing ugly wrapping or clipping", () => {
    expect(planScreen).not.toContain("blockExplanationTitleStyle");
    expect(primitives).toContain("numberOfLines={2} ellipsizeMode=\"tail\"");
    expect(sessionExerciseRowSource).toContain("numberOfLines={2} ellipsizeMode=\"tail\"");
    expect(addExercisePickerSource).toContain("Add {pendingExercise.name}?");
    expect(addExercisePickerSource).toContain("numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.84}");
    expect(swapCandidateRowSource).toContain("numberOfLines={2} ellipsizeMode=\"tail\"");
    expect(replaceExerciseConfirmationModalSource).toContain("numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.84}");
    expect(libraryScreen).toContain("<RowItem");
  });

  it("does not retain a Plan explanation-modal flow", () => {
    expect(planScreen).not.toContain("useFocusEffect");
    expect(planScreen).not.toContain("BlockExplanationModal");
    expect(planScreen).not.toContain("blockExplanationFor");
    expect(planScreen).not.toContain("formatBlockSubtitle");
  });
});
