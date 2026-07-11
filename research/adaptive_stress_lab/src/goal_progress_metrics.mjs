const GOAL_MODELS = {
  strength: {
    goal: "strength",
    primary_metrics: [
      "estimated strength trend for Competition Squat",
      "estimated strength trend for Competition Bench Press",
      "estimated strength trend for Competition Deadlift",
      "owned-load trend on competition lifts",
      "comparable-load performance on competition lifts",
    ],
    secondary_metrics: [
      "Standing Overhead Press / Military Press trend",
      "Bent Over Row trend",
      "rep PRs at meaningful loads",
      "top-end performance when repeated or supported by trend",
    ],
    optional_user_supplied_metrics: ["meet results", "tested 1RM where safely available"],
    forbidden_or_low_trust_metrics: ["isolation exercise progress as primary strength progress", "one lifetime PR without supporting trend", "scale weight alone"],
    confidence_requirements: ["at least three comparable exposures for a primary lift", "planned-session evidence preferred over extra-session noise", "avoid strong claims from one outlier"],
    progress_definition: "Primary competition lift trend improves or owned loads rise while comparable performance and recovery stay acceptable.",
    regression_definition: "Multiple primary lifts decline across comparable exposures, especially with below-minimum or shutdown evidence.",
    maintenance_definition: "Primary lifts remain stable within normal weekly variation while training continuity remains acceptable.",
    nonlinear_trend_handling: "Accept waves and temporary consolidation; judge rolling trend rather than one week.",
  },
  build_muscle: {
    goal: "build_muscle",
    primary_metrics: [
      "total quality work volume trend",
      "quality sets by target muscle",
      "productive volume completed inside target ranges",
      "ability to perform more quality work over time",
      "progression in hypertrophy-relevant rep ranges",
    ],
    secondary_metrics: ["owned-load trend in hypertrophy ranges", "exercise-level rep PRs", "training consistency", "recovery capacity"],
    optional_user_supplied_metrics: ["photos", "measurements", "bodyweight as context only"],
    forbidden_or_low_trust_metrics: ["scale weight as primary muscle-gain evidence", "junk volume", "warm-up sets", "extra sessions unless explicitly intended as planned evidence"],
    confidence_requirements: ["planned working sets with target-range success", "target muscle volume evidence", "recovery not collapsing"],
    progress_definition: "Rolling quality volume or target-muscle quality sets trend upward without repeated missed ranges or recovery collapse.",
    regression_definition: "Quality volume declines, missed ranges rise, or volume increases only by adding junk fatigue.",
    maintenance_definition: "Quality volume and target-range completion remain stable with acceptable recovery.",
    nonlinear_trend_handling: "Two steps forward and one step back is acceptable; waves are normal if rolling trend improves.",
  },
  build_muscle_strength: {
    goal: "build_muscle_strength",
    primary_metrics: [
      "competition or main compound estimated strength trend",
      "total quality work volume trend",
      "quality sets by target muscle",
      "owned-load trend in main lifts",
    ],
    secondary_metrics: ["Standing Overhead Press / Military Press", "Bent Over Row", "rep PRs at meaningful loads", "training consistency"],
    optional_user_supplied_metrics: ["measurements", "bodyweight context", "tested 1RM if safely available"],
    forbidden_or_low_trust_metrics: ["scale weight alone", "one isolated PR while quality volume collapses", "junk volume"],
    confidence_requirements: ["both strength and hypertrophy evidence must be present for high confidence", "planned evidence preferred"],
    progress_definition: "Strength metrics and quality work capacity are stable-to-improving together.",
    regression_definition: "Strength and quality work both decline, or one improves only by damaging recovery and the other goal.",
    maintenance_definition: "One side improves while the other is stable, or both remain stable during consolidation.",
    nonlinear_trend_handling: "Strength and hypertrophy signals may alternate; judge combined rolling trend.",
  },
  get_lean: {
    goal: "get_lean",
    primary_metrics: ["body fat percentage trend when user supplies it"],
    secondary_metrics: ["waist measurement if added later", "body weight trend if supplied", "performance preservation", "strength maintenance", "training consistency", "quality work retained during cut"],
    optional_user_supplied_metrics: ["body fat percentage", "waist measurement", "body weight"],
    forbidden_or_low_trust_metrics: ["body weight alone as fat-loss proof", "calling weight gain bad automatically", "claiming fat loss without body-composition evidence"],
    confidence_requirements: ["body-composition data required for high body-composition confidence", "training evidence can still show muscle-retention progress"],
    progress_definition: "Body fat trend improves when supplied, while strength and quality work are preserved as much as possible.",
    regression_definition: "Body composition worsens with declining performance or quality work, or performance collapses during the cut.",
    maintenance_definition: "Body-composition evidence is absent or stable while training performance is preserved.",
    nonlinear_trend_handling: "Weight and body composition fluctuate; use rolling trend and avoid judging single weigh-ins.",
  },
  athletic_performance: {
    goal: "athletic_performance",
    primary_metrics: ["key compound pattern strength", "power or explosive exercise performance where programmed", "dynamic lift performance", "moderate-load quality performance"],
    secondary_metrics: ["jump metrics if added later", "throw metrics if added later", "sprint metrics if added later", "training consistency", "recovery capacity"],
    optional_user_supplied_metrics: ["jump height", "sprint time", "throw distance"],
    forbidden_or_low_trust_metrics: ["bar speed claims without velocity data", "sensor claims without sensors", "one explosive outlier"],
    confidence_requirements: ["programmed power-movement evidence for moderate confidence", "timing/velocity/sensor evidence required for high power confidence"],
    progress_definition: "Strength and programmed dynamic-performance measures trend upward without excessive fatigue.",
    regression_definition: "Strength or dynamic work declines across comparable exposures, especially with safety/fatigue evidence.",
    maintenance_definition: "Strength and dynamic work stay stable during consolidation or sport-stress periods.",
    nonlinear_trend_handling: "Power can be noisy; require repeated comparable exposures before strong conclusions.",
  },
  maintenance_general_fitness: {
    goal: "maintenance_general_fitness",
    primary_metrics: ["training consistency", "strength maintenance", "quality work retained", "recovery capacity", "movement exposure breadth"],
    secondary_metrics: ["cardio/capacity completion where relevant", "bodyweight/body composition as optional context", "session enjoyment/adherence context"],
    optional_user_supplied_metrics: ["bodyweight", "waist measurement", "subjective energy as context"],
    forbidden_or_low_trust_metrics: ["forcing progression as success", "scale weight alone", "novelty without adherence"],
    confidence_requirements: ["planned-session completion and stable performance evidence"],
    progress_definition: "The athlete maintains core capacities with manageable fatigue and consistent training.",
    regression_definition: "Consistency, performance, and quality work decline together.",
    maintenance_definition: "Performance and quality work remain broadly stable with good recovery and adherence.",
    nonlinear_trend_handling: "Maintenance can deliberately hold steady; absence of progression is not failure.",
  },
};

export function getGoalProgressModel(goal) {
  const normalised = normaliseGoal(goal);
  const model = GOAL_MODELS[normalised];
  if (!model) throw new Error(`Unsupported goal ${goal}`);
  return structuredClone(model);
}

export function listGoalProgressModels() {
  return Object.values(GOAL_MODELS).map((model) => structuredClone(model));
}

export function calculateGoalProgress({ goal, evidence, previousProgress = null, now = new Date() }) {
  const model = getGoalProgressModel(goal);
  const metrics = evidence.goalProgressEvidence ?? {};
  const strength = scoreStrength(metrics.strengthMetrics ?? []);
  const muscle = scoreMuscle(metrics.qualityVolume ?? {});
  const leanness = scoreLeanness(metrics.bodyComposition ?? {}, metrics.performancePreservation ?? {});
  const athletic = scoreAthletic(metrics.athleticMetrics ?? [], strength);
  const consistency = scoreConsistency(evidence);
  const recoveryPenalty = recoveryPenaltyFromEvidence(evidence);
  const warnings = [];

  let score;
  let confidence;
  let primarySummary;
  let secondarySummary;

  switch (model.goal) {
    case "strength":
      score = 0.72 * strength.score + 0.16 * consistency.score + 0.12 * (100 - recoveryPenalty);
      confidence = Math.min(strength.confidence, evidenceConfidenceCeiling(evidence));
      primarySummary = strength.summary;
      secondarySummary = "Secondary strength trends support confidence but do not replace competition lift evidence.";
      break;
    case "build_muscle":
      score = 0.68 * muscle.score + 0.17 * consistency.score + 0.15 * (100 - recoveryPenalty);
      confidence = Math.min(muscle.confidence, evidenceConfidenceCeiling(evidence));
      primarySummary = muscle.summary;
      secondarySummary = "Scale weight is optional context only; target-range quality volume carries authority.";
      break;
    case "build_muscle_strength":
      score = 0.42 * strength.score + 0.42 * muscle.score + 0.10 * consistency.score + 0.06 * (100 - recoveryPenalty);
      confidence = Math.min(Math.round((strength.confidence + muscle.confidence) / 2), evidenceConfidenceCeiling(evidence));
      primarySummary = `Strength: ${strength.summary} Muscle: ${muscle.summary}`;
      secondarySummary = "Combined goal needs both strength and quality-volume evidence before high confidence.";
      break;
    case "get_lean":
      score = 0.55 * leanness.score + 0.25 * consistency.score + 0.20 * (100 - recoveryPenalty);
      if (!leanness.hasBodyFat) score = Math.min(score, 60);
      confidence = Math.min(leanness.confidence, evidenceConfidenceCeiling(evidence));
      primarySummary = leanness.summary;
      secondarySummary = "When body-fat evidence is missing, ASC can coach retention but cannot claim fat loss.";
      if (!leanness.hasBodyFat) warnings.push("Body-composition confidence is low because body fat percentage is missing.");
      break;
    case "athletic_performance":
      score = 0.48 * athletic.score + 0.28 * strength.score + 0.14 * consistency.score + 0.10 * (100 - recoveryPenalty);
      confidence = Math.min(athletic.confidence, evidenceConfidenceCeiling(evidence));
      primarySummary = athletic.summary;
      secondarySummary = "Without sensors, dynamic performance claims remain lower confidence.";
      break;
    case "maintenance_general_fitness":
      score = 0.40 * consistency.score + 0.25 * strength.maintenanceScore + 0.20 * muscle.maintenanceScore + 0.15 * (100 - recoveryPenalty);
      confidence = Math.min(Math.max(consistency.confidence, 45), evidenceConfidenceCeiling(evidence));
      primarySummary = "Maintenance rewards stable planned training, quality work retained, and recovery capacity.";
      secondarySummary = "Progression is optional; stability can be success.";
      break;
    default:
      throw new Error(`Unhandled goal ${model.goal}`);
  }

  const progressScore = clampScore(score);
  const trend = classifyTrend(progressScore, confidence, previousProgress);
  if (recoveryPenalty >= 30) warnings.push("Progress score was reduced because volume or strength evidence carries high fatigue cost.");
  if (confidence < 55) warnings.push("Progress confidence is low; use this as context, not a firm coaching conclusion.");

  return {
    goal: model.goal,
    progress_score: progressScore,
    trend,
    confidence: clampScore(confidence),
    primary_metric_summary: primarySummary,
    secondary_metric_summary: secondarySummary,
    warnings,
    evidence_sources: buildEvidenceSources({ model, evidence, metrics }),
    last_updated: now.toISOString(),
  };
}

export function normaliseGoal(goal) {
  const value = String(goal ?? "").toLowerCase();
  if (["hypertrophy", "build_muscle", "muscle"].includes(value)) return "build_muscle";
  if (["strength_hypertrophy", "build_muscle_strength", "muscle_strength"].includes(value)) return "build_muscle_strength";
  if (["powerlifting", "strength"].includes(value)) return "strength";
  if (["get_lean", "fat_loss", "recomposition_cut"].includes(value)) return "get_lean";
  if (["athletic", "athletic_performance", "performance"].includes(value)) return "athletic_performance";
  if (["maintenance", "general_fitness", "maintenance_general_fitness"].includes(value)) return "maintenance_general_fitness";
  return value;
}

function scoreStrength(items) {
  const primary = items.filter((item) => ["competition_squat", "competition_bench_press", "competition_deadlift"].includes(item.exercise));
  const secondary = items.filter((item) => ["standing_overhead_press", "military_press", "bent_over_row"].includes(item.exercise));
  const primaryScore = average(primary.map(scoreStrengthMetric), 50);
  const secondaryScore = average(secondary.map(scoreStrengthMetric), 50);
  const confidence = confidenceFromCounts(primary.length, primary.reduce((sum, item) => sum + (item.comparableExposures ?? 0), 0), primary.length >= 3 ? 88 : 62);
  return {
    score: clampScore(primaryScore * 0.82 + secondaryScore * 0.18),
    maintenanceScore: clampScore(average(items.map(scoreMaintenanceMetric), 55)),
    confidence,
    summary: primary.length
      ? `Competition lift trend score ${Math.round(primaryScore)} from ${primary.length} primary lift(s).`
      : "No competition lift evidence; strength confidence stays low.",
  };
}

function scoreMuscle(volume) {
  const trend = volume.totalQualityVolumeTrend ?? "stable";
  const setTrend = volume.qualitySetsByMuscleTrend ?? "stable";
  const targetCompletion = volume.targetRangeCompletionRate ?? 0.7;
  const junkRatio = volume.junkVolumeRatio ?? 0;
  const plannedRatio = volume.plannedVolumeRatio ?? 1;
  let score = 50 + trendPoints(trend, 24) + trendPoints(setTrend, 18);
  score += (targetCompletion - 0.7) * 40;
  score -= junkRatio * 35;
  score += Math.min(10, plannedRatio * 10);
  if (volume.recoveryCost === "high") score -= 18;
  const confidence = clampScore(35 + (volume.plannedQualitySetCount ?? 0) * 4 + targetCompletion * 22 - junkRatio * 20);
  return {
    score: clampScore(score),
    maintenanceScore: clampScore(50 + trendPoints(trend, 8) + targetCompletion * 20 - junkRatio * 20),
    confidence,
    summary: `Quality volume trend is ${trend}; target-range completion ${Math.round(targetCompletion * 100)}%; junk volume ${Math.round(junkRatio * 100)}%.`,
  };
}

function scoreLeanness(bodyComposition, preservation) {
  const hasBodyFat = Number.isFinite(bodyComposition.bodyFatTrendPct);
  let score = hasBodyFat ? 50 - bodyComposition.bodyFatTrendPct * 12 : 50;
  score += trendPoints(preservation.strengthTrend ?? "stable", 12);
  score += trendPoints(preservation.qualityWorkRetainedTrend ?? "stable", 12);
  const confidence = hasBodyFat ? 78 : 42;
  return {
    score: clampScore(score),
    confidence,
    hasBodyFat,
    summary: hasBodyFat
      ? `Body fat trend is ${bodyComposition.bodyFatTrendPct}% with ${preservation.strengthTrend ?? "stable"} strength preservation.`
      : "No body-fat trend supplied; progress can only be judged from retention and consistency.",
  };
}

function scoreAthletic(items, strength) {
  const dynamicItems = items.filter((item) => item.metricType === "power" || item.metricType === "dynamic_strength");
  const dynamicScore = average(dynamicItems.map((item) => 50 + trendPoints(item.trend ?? "stable", 24)), 50);
  const hasSensor = dynamicItems.some((item) => item.source === "timed" || item.source === "velocity_sensor");
  return {
    score: clampScore(dynamicScore * 0.7 + strength.score * 0.3),
    confidence: clampScore((hasSensor ? 72 : 52) + dynamicItems.length * 7),
    summary: dynamicItems.length
      ? `Dynamic performance score ${Math.round(dynamicScore)} from ${dynamicItems.length} programmed power/dynamic metric(s).`
      : "No dynamic performance evidence; athletic confidence relies on strength patterns only.",
  };
}

function scoreConsistency(evidence) {
  const history = evidence.sessionHistory ?? {};
  const planned = history.plannedSessionsCompleted ?? 0;
  const missed = history.plannedSessionsMissed ?? 0;
  const completionQuality = history.sessionCompletionQuality ?? "mixed";
  let score = 50 + Math.min(24, planned * 5) - Math.min(28, missed * 9);
  if (history.sessionSpacing === "normal") score += 8;
  if (history.sessionSpacing === "irregular") score -= 6;
  if (history.sessionSpacing === "extended") score -= 12;
  if (completionQuality === "good") score += 8;
  if (completionQuality === "poor") score -= 14;
  return { score: clampScore(score), confidence: clampScore(40 + planned * 8) };
}

function recoveryPenaltyFromEvidence(evidence) {
  const exercises = evidence.exerciseHistory ?? [];
  const below = exercises.reduce((sum, item) => sum + (item.belowMinimumEvents ?? 0), 0);
  const shutdowns = exercises.reduce((sum, item) => sum + (item.shutdowns ?? 0), 0);
  const recoveryCost = evidence.goalProgressEvidence?.qualityVolume?.recoveryCost;
  return Math.min(60, below * 7 + shutdowns * 12 + (recoveryCost === "high" ? 18 : 0));
}

function evidenceConfidenceCeiling(evidence) {
  const confidence = evidence.evidenceConfidence ?? {};
  let ceiling = 55;
  ceiling += Math.min(18, (confidence.plannedEvidenceCount ?? 0) * 4);
  ceiling += Math.min(18, (confidence.comparableExposureCount ?? 0) * 4);
  if (confidence.recency === "recent") ceiling += 8;
  if (confidence.dataCompleteness === "high") ceiling += 8;
  if (confidence.dataCompleteness === "low") ceiling -= 12;
  return clampScore(ceiling);
}

function scoreStrengthMetric(item) {
  let score = 50 + trendPoints(item.estimatedStrengthTrend ?? "stable", 24);
  score += trendPoints(item.ownedLoadTrend ?? "stable", 16);
  score += trendPoints(item.comparableLoadPerformance ?? "stable", 12);
  score += Math.min(10, (item.meaningfulRepPrCount ?? 0) * 4);
  if (item.outlierPr && (item.comparableExposures ?? 0) < 3) score -= 12;
  return clampScore(score);
}

function scoreMaintenanceMetric(item) {
  const trend = item.estimatedStrengthTrend ?? item.ownedLoadTrend ?? "stable";
  if (trend === "declining") return 35;
  if (trend === "improving") return 72;
  return 62;
}

function trendPoints(trend, magnitude) {
  if (trend === "improving") return magnitude;
  if (trend === "declining") return -magnitude;
  if (trend === "mixed") return -Math.round(magnitude * 0.25);
  return 0;
}

function classifyTrend(score, confidence, previousProgress) {
  if (confidence < 40) return "insufficient_evidence";
  const prior = previousProgress?.progress_score;
  if (Number.isFinite(prior)) {
    if (score >= prior + 6) return "improving";
    if (score <= prior - 8) return "declining";
  }
  if (score >= 65) return "improving";
  if (score <= 42) return "declining";
  return "stable";
}

function buildEvidenceSources({ model, evidence, metrics }) {
  const sources = [`goal_model:${model.goal}`];
  sources.push(`planned_sessions:${evidence.sessionHistory?.plannedSessionsCompleted ?? 0}`);
  sources.push(`exercise_records:${evidence.exerciseHistory?.length ?? 0}`);
  if (metrics.strengthMetrics) sources.push(`strength_metrics:${metrics.strengthMetrics.length}`);
  if (metrics.qualityVolume) sources.push("quality_volume");
  if (metrics.bodyComposition) sources.push("body_composition_context");
  if (metrics.athleticMetrics) sources.push(`athletic_metrics:${metrics.athleticMetrics.length}`);
  return sources;
}

function confidenceFromCounts(metricCount, exposureCount, base) {
  return clampScore(base + Math.min(12, metricCount * 3) + Math.min(16, exposureCount * 2));
}

function average(values, fallback) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : fallback;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
