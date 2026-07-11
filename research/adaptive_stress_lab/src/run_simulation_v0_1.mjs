import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { calculateGoalProgress } from "./goal_progress_metrics.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "simulation_v0_1_report.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

export const simulationTracks = [
  { profileId: "beginner_hypertrophy", goal: "build_muscle", label: "Beginner hypertrophy: normal wave progress" },
  { profileId: "intermediate_strength_hypertrophy", goal: "build_muscle_strength", label: "Intermediate hybrid: smooth progress with local stall" },
  { profileId: "advanced_powerlifting", goal: "strength", label: "Advanced powerlifting: systemic fatigue and recovery week" },
  { profileId: "busy_parent_time_constrained", goal: "get_lean", label: "Busy parent: missed week and low body-composition confidence" },
  { profileId: "recovery_limited_lifter", goal: "athletic_performance", label: "Recovery-limited lifter: productive load progression with conservative recovery" },
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runSimulation();
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, renderReport(results), "utf8");

  console.log("Simulation v0.1 complete");
  console.log(`Tracks: ${results.length}`);
  console.log(`Weeks: ${results.reduce((sum, item) => sum + item.weeks.length, 0)}`);
  console.log(`Report: ${reportPath}`);
}

export function runSimulation() {
  return simulationTracks.map((track) => {
    const athlete = profiles.find((profile) => profile.id === track.profileId);
    if (!athlete) throw new Error(`Missing athlete profile ${track.profileId}`);
    let previousProgress = null;
    const weeks = Array.from({ length: 12 }, (_, index) => {
      const week = index + 1;
      const evidence = buildWeeklyEvidence({ track, athlete, week });
      const coachingState = calculateCoachingState({ athlete, evidence, now: dateForWeek(week) });
      const safetyGate = evaluateSafetyGate({ athlete, evidence, coachingState });
      const recommendation = createCoachingRecommendation({ athlete, evidence, coachingState, safetyGate });
      const goalProgress = calculateGoalProgress({ goal: track.goal, evidence, previousProgress, now: dateForWeek(week) });
      previousProgress = goalProgress;
      return { week, evidence, coachingState, safetyGate, recommendation, goalProgress };
    });
    return { track, athlete, weeks };
  });
}

function buildWeeklyEvidence({ track, athlete, week }) {
  const phase = phaseForWeek(week);
  const profileId = track.profileId;
  const goalEvidence = goalProgressEvidenceFor(track.goal, profileId, week, phase);
  const exerciseHistory = exerciseHistoryFor(profileId, week, phase);
  const sessionHistory = sessionHistoryFor(profileId, week, phase);
  return {
    id: `sim_v0_1_${profileId}_week_${week}`,
    scenario: `${track.label} week ${week}: ${phase}`,
    athleteProfileId: athlete.id,
    evidenceModelVersion: "v0.7",
    status: "simulation_research_fixture",
    sessionHistory,
    exerciseHistory,
    swapHistory: swapHistoryFor(profileId, week),
    consolidationHistory: consolidationFor(week, phase),
    frequencyStimulus: stimulusFor(profileId, phase),
    safetyContext: safetyFor(profileId, phase),
    evidenceConfidence: confidenceFor(sessionHistory, exerciseHistory, phase),
    subjectiveContext: subjectiveFor(profileId, phase),
    goalProgressEvidence: goalEvidence,
    notes: ["Simulation v0.1 synthetic weekly evidence; not production data."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function phaseForWeek(week) {
  if (week === 1) return "low_evidence_early_phase";
  if (week === 3) return "normal_wave";
  if (week === 4) return "productive_load_progression";
  if (week === 5) return "local_lift_stall";
  if (week === 6) return "missed_week";
  if (week === 8) return "systemic_fatigue";
  if (week === 9) return "recovery_week";
  if (week === 11) return "normal_wave";
  return "smooth_progress";
}

function sessionHistoryFor(profileId, week, phase) {
  const planned = week === 1 ? 1 : phase === "missed_week" ? 0 : phase === "recovery_week" ? 3 : profileId === "advanced_powerlifting" ? 5 : profileId === "busy_parent_time_constrained" ? 3 : 4;
  const missed = phase === "missed_week" ? 3 : phase === "systemic_fatigue" ? 0 : 0;
  return {
    plannedSessionsCompleted: planned,
    plannedSessionsMissed: missed,
    extraSessionsCompleted: phase === "productive_load_progression" ? 1 : 0,
    sessionSpacing: phase === "missed_week" ? "extended" : phase === "systemic_fatigue" ? "normal" : phase === "normal_wave" ? "irregular" : "normal",
    completedSets: phase === "missed_week" ? 0 : phase === "recovery_week" ? 8 : planned * 4,
    skippedExercises: phase === "systemic_fatigue" ? 1 : 0,
    sessionDurationMinutes: profileId === "advanced_powerlifting" ? 85 : profileId === "busy_parent_time_constrained" ? 40 : 60,
    sessionCompletionQuality: phase === "systemic_fatigue" ? "poor" : phase === "missed_week" ? "mixed" : "good",
  };
}

function exerciseHistoryFor(profileId, week, phase) {
  if (phase === "missed_week") return [exercise("bench_press", "pressing pattern", { comparableLoadTrend: "mixed", repeatedSuccessfulExposuresAtLoad: 0, repsOrSeconds: [] })];
  if (phase === "systemic_fatigue") {
    return [
      exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, shutdowns: 1, withinRange: false, repsOrSeconds: [5] }),
      exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, shutdowns: 1, withinRange: false, repsOrSeconds: [6] }),
    ];
  }
  if (phase === "local_lift_stall") {
    return [
      exercise("overhead_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false, repsOrSeconds: [6] }),
      exercise("leg_press", "squat/lower-body pattern", { comparableLoadTrend: "stable", withinRange: true, repeatedSuccessfulExposuresAtLoad: 2 }),
    ];
  }
  if (phase === "productive_load_progression") {
    return [exercise("leg_press", "squat/lower-body pattern", { comparableLoadTrend: "improving", aboveRangeEvents: 2, productiveFatigue: true, loadEvents: ["increase"], repeatedSuccessfulExposuresAtLoad: 2, repsOrSeconds: [13, 11] })];
  }
  if (phase === "recovery_week") {
    return [exercise("bench_press", "pressing pattern", { comparableLoadTrend: "stable", withinRange: true, repeatedSuccessfulExposuresAtLoad: 1, repsOrSeconds: [8, 8] })];
  }
  return [
    exercise("bench_press", "pressing pattern", { comparableLoadTrend: week >= 7 ? "improving" : "stable", aboveRangeEvents: week >= 10 ? 2 : 0, repeatedSuccessfulExposuresAtLoad: week >= 10 ? 3 : 2 }),
    exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: week >= 7 ? "improving" : "stable", repeatedSuccessfulExposuresAtLoad: week >= 10 ? 3 : 2 }),
  ];
}

function goalProgressEvidenceFor(goal, profileId, week, phase) {
  const qualityTrend = phase === "systemic_fatigue" ? "declining" : phase === "missed_week" ? "declining" : phase === "normal_wave" ? "mixed" : "improving";
  const strengthTrend = phase === "systemic_fatigue" ? "declining" : phase === "local_lift_stall" ? "mixed" : phase === "recovery_week" ? "stable" : week >= 4 ? "improving" : "stable";
  const base = {
    strengthMetrics: [
      strengthMetric("competition_squat", strengthTrend, week),
      strengthMetric("competition_bench_press", strengthTrend, week),
      strengthMetric("competition_deadlift", phase === "systemic_fatigue" ? "declining" : "stable", week),
      strengthMetric("standing_overhead_press", phase === "local_lift_stall" ? "declining" : "stable", week),
      strengthMetric("bent_over_row", strengthTrend === "declining" ? "stable" : strengthTrend, week),
    ],
    qualityVolume: {
      totalQualityVolumeTrend: qualityTrend,
      qualitySetsByMuscleTrend: qualityTrend,
      targetRangeCompletionRate: phase === "systemic_fatigue" ? 0.55 : phase === "local_lift_stall" ? 0.7 : phase === "missed_week" ? 0.2 : 0.82,
      junkVolumeRatio: phase === "systemic_fatigue" ? 0.2 : 0.04,
      plannedVolumeRatio: phase === "missed_week" ? 0.1 : 1,
      plannedQualitySetCount: phase === "missed_week" ? 0 : phase === "recovery_week" ? 8 : 16,
      recoveryCost: phase === "systemic_fatigue" ? "high" : "moderate",
    },
    performancePreservation: {
      strengthTrend: strengthTrend === "declining" ? "declining" : "stable",
      qualityWorkRetainedTrend: phase === "missed_week" ? "declining" : "stable",
    },
    athleticMetrics: [
      { metricType: "power", exercise: "jump_squat", trend: phase === "systemic_fatigue" ? "declining" : week >= 7 ? "improving" : "stable", source: "programmed_performance" },
      { metricType: "dynamic_strength", exercise: "push_press", trend: phase === "local_lift_stall" ? "mixed" : strengthTrend, source: "programmed_performance" },
    ],
  };
  if (goal === "get_lean") {
    base.bodyComposition = profileId === "busy_parent_time_constrained"
      ? { bodyWeightTrendKg: week <= 6 ? -0.5 : -1.2 }
      : { bodyFatTrendPct: week >= 8 ? -1.2 : -0.4, bodyWeightTrendKg: -1 };
  }
  return base;
}

function strengthMetric(exerciseName, trend, week) {
  return {
    exercise: exerciseName,
    estimatedStrengthTrend: trend,
    ownedLoadTrend: trend === "mixed" ? "stable" : trend,
    comparableLoadPerformance: trend,
    meaningfulRepPrCount: trend === "improving" && week >= 4 ? 1 : 0,
    comparableExposures: Math.min(4, Math.max(1, week - 1)),
    outlierPr: false,
  };
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: [10, 10, 10],
    withinRange: true,
    comparableLoadTrend: "stable",
    loadEvents: [],
    shutdowns: 0,
    belowMinimumEvents: 0,
    aboveRangeEvents: 0,
    productiveFatigue: false,
    newExercise: false,
    techniqueBreakdown: "none",
    repeatedSuccessfulExposuresAtLoad: 2,
    ...overrides,
  };
}

function swapHistoryFor(profileId, week) {
  if (profileId === "recovery_limited_lifter" && week === 7) {
    return { swappedFrom: "barbell_row", swappedTo: "chest_supported_row", reason: "fatigue management", postSwapPerformance: "improved", exposuresSinceSwap: 1, improvementConfirmed: false };
  }
  return null;
}

function consolidationFor(week, phase) {
  return {
    recentPushOccurred: phase === "productive_load_progression",
    plannedConsolidationDue: phase === "recovery_week",
    consolidationCompleted: week > 9,
    ownsNewLoad: week >= 10,
    repeatedSuccessfulExposuresAtNewLoad: week >= 10 ? 3 : 1,
  };
}

function stimulusFor(profileId, phase) {
  return {
    trainingDaysAvailable: profileId === "busy_parent_time_constrained" ? 3 : 4,
    currentFrequency: profileId === "advanced_powerlifting" ? 5 : profileId === "busy_parent_time_constrained" ? 3 : 4,
    sessionDensity: phase === "systemic_fatigue" ? "high" : "moderate",
    compoundDensity: profileId === "advanced_powerlifting" ? "high" : "moderate",
    weeklyHardSetEstimate: phase === "systemic_fatigue" ? 22 : 14,
    axialLoadingDensity: profileId === "advanced_powerlifting" ? "high" : "moderate",
    highFatigueMovementClustering: phase === "systemic_fatigue" ? "high" : "low",
    lowFrequencyHighDensityWarning: false,
    highFrequencyFatigue: phase === "systemic_fatigue" && profileId === "advanced_powerlifting",
    hiddenOverreachRisk: phase === "systemic_fatigue",
  };
}

function safetyFor(profileId, phase) {
  return {
    affectedArea: phase === "local_lift_stall" ? "pressing pattern" : "none",
    affectedMovementPattern: phase === "local_lift_stall" ? "overhead_press" : "none",
    painTrend: "none",
    painSeverity: "none",
    techniqueBreakdown: false,
    systemicRedFlags: [],
    safetyIssueScope: "none",
  };
}

function confidenceFor(sessionHistory, exerciseHistory, phase) {
  return {
    plannedEvidenceCount: sessionHistory.plannedSessionsCompleted,
    comparableExposureCount: Math.max(0, ...exerciseHistory.map((item) => item.repeatedSuccessfulExposuresAtLoad ?? 0)),
    recency: phase === "missed_week" ? "stale" : "recent",
    dataCompleteness: phase === "low_evidence_early_phase" || phase === "missed_week" ? "low" : "high",
    evidenceSourceQuality: "high",
  };
}

function subjectiveFor(profileId, phase) {
  if (phase === "systemic_fatigue") return { readiness: "poor", stress: "high", sleep: "poor", motivation: "moderate", soreness: "high", safetyFlag: "none", notes: "Simulation subjective context." };
  if (profileId === "busy_parent_time_constrained") return { readiness: "mixed", stress: "high", sleep: "mixed", motivation: "moderate", soreness: "moderate", safetyFlag: "none", notes: "Simulation subjective context." };
  return undefined;
}

function dateForWeek(week) {
  const date = new Date("2026-01-05T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);
  return date;
}

function renderReport(simulation) {
  const allWeeks = simulation.flatMap((track) => track.weeks.map((week) => ({ track, week })));
  const weird = allWeeks.filter(({ week }) =>
    week.recommendation.recommendation_type === "recover" && week.goalProgress.confidence < 55
  );

  return `# Simulation v0.1 Report

Generated: ${generatedAt.toISOString()}

## Scope

Simulation v0.1 runs five research athlete profiles over twelve synthetic weeks. Each week generates:

- Coaching State
- Safety Gate
- Decision Recommendation
- Goal Progress

This is not production logic and does not modify V1.

## Goal Metrics Defined

- Strength: Competition Squat, Competition Bench Press, and Competition Deadlift are primary. Standing Overhead Press / Military Press and Bent Over Row are secondary.
- Build Muscle: primary progress is quality work volume and quality target-muscle sets, not scale weight.
- Build Muscle + Strength: combines strength and quality-volume evidence.
- Get Lean: body fat percentage is primary when supplied; missing body-fat data keeps body-composition confidence low.
- Athletic Performance: combines compound strength with programmed power/dynamic work; no bar-speed claims without sensors.
- Maintenance / General Fitness: stable quality work, consistency, recovery, and retained strength can be success.

## Simulation Profiles

${simulation.map((item) => `- ${item.athlete.label}: ${item.track.goal} (${item.track.label})`).join("\n")}

## Summary Results

${simulation.map(renderTrackSummary).join("\n")}

## Examples Of Progress Scoring

${renderExamples(simulation)}

## Failures / Weird Decisions

${weird.length ? weird.map(({ track, week }) => `- ${track.athlete.label} week ${week.week}: recover with low progress confidence (${week.goalProgress.confidence}).`).join("\n") : "- No recover recommendation was issued from low-confidence goal progress evidence."}

## Unrealistic Assumptions

- Weekly evidence is synthetic and simplified.
- Goal progress metrics use transparent heuristic weights, not validated production coefficients.
- Body-composition data is mocked or absent; Get Lean cannot claim fat loss without user-supplied body-fat data.
- Athletic performance lacks real jump, sprint, throw, bar-speed, or timing data.
- Simulation does not yet model annual training, injury history, exact exercise prescriptions, or user behaviour after recommendations.

## Open Aaron Decisions

1. Should Strength progress require all three competition lifts to be stable/improving, or can two of three be enough?
2. Should Build Muscle quality volume be scored by muscle group before total volume?
3. Should Get Lean prompt for body-fat/waist data, or keep body-composition confidence low by default?
4. Should Athletic Performance remain a lower-confidence goal until explicit power metrics are added?
5. What minimum simulation pass criteria should exist before any V2 production prototype?

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
`;
}

function renderTrackSummary(item) {
  const first = item.weeks[0].goalProgress;
  const last = item.weeks.at(-1).goalProgress;
  const distribution = groupBy(item.weeks, (week) => week.recommendation.recommendation_type);
  return `### ${item.athlete.label}

- Goal: \`${item.track.goal}\`
- Week 1 progress: ${first.progress_score} / ${first.trend} / confidence ${first.confidence}
- Week 12 progress: ${last.progress_score} / ${last.trend} / confidence ${last.confidence}
- Recommendation distribution: ${Object.entries(distribution).map(([type, weeks]) => `${type} ${weeks.length}`).join(", ")}
- Final primary metric summary: ${last.primary_metric_summary}
`;
}

function renderExamples(simulation) {
  return simulation.map((item) => {
    const selected = [1, 4, 8, 9, 12].map((weekNumber) => item.weeks.find((week) => week.week === weekNumber));
    return `### ${item.athlete.label}

${selected.map((week) => `- Week ${week.week}: progress ${week.goalProgress.progress_score} (${week.goalProgress.trend}, confidence ${week.goalProgress.confidence}); recommendation \`${week.recommendation.recommendation_type}\`; safety \`${week.safetyGate.status}\`.`).join("\n")}
`;
  }).join("\n");
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}
