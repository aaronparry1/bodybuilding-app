import {
  buildDetailedEvidence,
  explicitEvidenceDrivers,
  hasEvidenceDetail,
  hasGoodObjectiveReadiness,
  hasMissedPlannedSessions,
  hasMultipleExerciseDecline,
  hasTimeConstraintEvidence,
  inferFatigueLevel,
  inferLocalEvidenceSignals,
  inferPerformanceDirection,
  inferRecoveryStatus,
  inferTrainingContinuity,
  qualityLevelForEvidence,
  deriveEvidenceQuality,
  usesConfidenceWeightedEvidence,
  usesFullyDerivedQualityEvidence,
  usesSummaryShortcutFreeEvidence,
} from "./evidence_detail.mjs";

const SCORE_MIN = 0;
const SCORE_MAX = 100;

export function calculateCoachingState({ athlete, evidence, now = new Date() }) {
  const evidenceCount = countEvidence(evidence);
  const objectivePressure = calculateObjectivePressure(evidence);
  const safetyFlags = getSafetyFlags(evidence);
  const hasSevereSafetyFlag = safetyFlags.length > 0;

  const adaptation = scoreAdaptation(evidence);
  const recoveryCapacity = scoreRecoveryCapacity(evidence, athlete);
  const momentum = scoreMomentum(evidence);
  const confidence = scoreConfidence(evidence, athlete);
  const evidenceQuality = scoreEvidenceQuality(evidence, evidenceCount);
  const coachingOpportunity = scoreCoachingOpportunity({
    evidence,
    objectivePressure,
    recoveryCapacity: recoveryCapacity.score,
    adaptation: adaptation.score,
    momentum: momentum.score,
    hasSevereSafetyFlag,
  });

  return {
    scenario_id: evidence.id,
    athlete_profile_id: athlete.id,
    status: "draft_research_output",
    adaptation: adaptation.score,
    recovery_capacity: recoveryCapacity.score,
    momentum: momentum.score,
    confidence: confidence.score,
    evidence_quality: evidenceQuality.score,
    coaching_opportunity: coachingOpportunity.score,
    confidence_reason: buildConfidenceReason({ evidence, evidenceCount, objectivePressure, hasSevereSafetyFlag }),
    last_updated: now.toISOString(),
    evidence_count: evidenceCount,
    evidence_summary: buildEvidenceSummary({ athlete, evidence }),
    authority_summary: buildAuthoritySummary(evidence),
    subjective_context_handling: buildSubjectiveContextHandling({ evidence, objectivePressure, hasSevereSafetyFlag }),
    safety_flags: safetyFlags,
    score_explanations: {
      adaptation: adaptation.explanations,
      recovery_capacity: recoveryCapacity.explanations,
      momentum: momentum.explanations,
      confidence: confidence.explanations,
      evidence_quality: evidenceQuality.explanations,
      coaching_opportunity: coachingOpportunity.explanations,
    },
    open_questions: buildOpenQuestions({ athlete, evidence }),
  };
}

function scoreAdaptation(evidence) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;
  const performanceDirection = inferPerformanceDirection(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);

  score += add(explanations, "objective_performance", trendMovement(performanceDirection, { improving: 24, stable: 10, stagnant: 0, mixed: -4, declining: -22 }), `Objective performance direction inferred as ${performanceDirection}.`, quality);

  for (const signal of localSignals) {
    if (signal.signal === "above_range") score += add(explanations, "objective_performance", severityMovement(signal.severity, 8, 14, 20), `${signal.lift} exceeded the target range.`, quality);
    if (signal.signal === "inside_range") score += add(explanations, "objective_performance", severityMovement(signal.severity, 6, 8, 10), `${signal.lift} stayed inside the target range.`, quality);
    if (signal.signal === "productive_fatigue") score += add(explanations, "objective_performance", 16, `${signal.lift} shows successful progression with productive fatigue.`, quality);
    if (signal.signal === "below_range") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 9, 16, 24), `${signal.lift} missed the prescribed range.`, quality);
    if (signal.signal === "dropoff") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 4, 9, 14), `${signal.lift} shows comparable-workload drop-off evidence.`, quality);
    if (signal.signal === "technique_limit") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 6, 12, 18), `${signal.lift} has technique-limited evidence.`, quality);
  }

  if (hasMultipleExerciseDecline(evidence)) {
    score += add(explanations, "objective_performance", -18, "Multiple lifts are down, reducing adaptation expression.", quality);
  }

  applySubjectiveContext(explanations, evidence, "adaptation");

  return withScore(score, explanations);
}

function scoreRecoveryCapacity(evidence, athlete) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;
  const fatigueLevel = inferFatigueLevel(evidence);
  const recoveryStatus = inferRecoveryStatus(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);
  const continuity = inferTrainingContinuity(evidence);

  score += add(explanations, "objective_performance", stateMovement(fatigueLevel, { low: 20, moderate: 0, high: -22 }), `Objective fatigue pressure is inferred as ${fatigueLevel}; recovery capacity uses positive score semantics.`, quality);
  score += add(explanations, "recovery_behaviour", stateMovement(recoveryStatus, { good: 20, mixed: 2, poor: -24 }), `Recovery status is inferred as ${recoveryStatus}.`, quality);

  if (continuity === "missed_week") score += add(explanations, "training_behaviour", -8, "Missed week lowers confidence in current training tolerance.", quality);
  if (hasMultipleExerciseDecline(evidence)) score += add(explanations, "objective_performance", -16, "Multiple exercise declines suggest reduced recovery capacity.", quality);
  if (hasGoodObjectiveReadiness(evidence)) score += add(explanations, "objective_performance", 8, "Objective readiness evidence supports recovery capacity.", quality);
  if (hasMissedPlannedSessions(evidence)) score += add(explanations, "training_behaviour", -6, "Missed planned sessions reduce continuity but are not treated as recovery failure alone.", quality);

  for (const signal of localSignals) {
    if (signal.signal === "below_range") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 5, 10, 16), `${signal.lift} below-range evidence lowers recovery capacity.`, quality);
    if (signal.signal === "dropoff") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 4, 8, 12), `${signal.lift} drop-off lowers recovery capacity.`, quality);
    if (signal.signal === "productive_fatigue") score += add(explanations, "objective_performance", -4, `${signal.lift} productive fatigue adds a small expected recovery cost.`, quality);
  }

  if (athlete.constraints?.stress === "high") {
    score += add(explanations, "subjective_context", -3, "High stress context slightly softens recovery capacity, but does not dominate objective evidence.", "moderate");
  }
  if (athlete.recoveryContext?.sleepQuality === "poor") {
    score += add(explanations, "subjective_context", -4, "Poor sleep context slightly softens recovery capacity, but remains lower authority than performance.", "moderate");
  }

  score += applySubjectiveContext(explanations, evidence, "recovery_capacity");

  if (hasSevereSafety(evidence)) {
    score += add(explanations, "safety_flag", -55, "Severe pain/safety flag can override normal subjective weighting.", "high");
  }

  return withScore(score, explanations);
}

function scoreMomentum(evidence) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;
  const performanceDirection = inferPerformanceDirection(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);
  const continuity = inferTrainingContinuity(evidence);

  score += add(explanations, "objective_performance", trendMovement(performanceDirection, { improving: 20, stable: 9, stagnant: -4, mixed: -6, declining: -22 }), `Objective performance direction is inferred as ${performanceDirection}.`, quality);
  score += add(explanations, "training_behaviour", stateMovement(continuity, { consistent: 15, interrupted: -8, missed_week: -24 }), `Training continuity is inferred as ${continuity}.`, quality);

  if (hasMissedPlannedSessions(evidence)) score += add(explanations, "training_behaviour", -14, "Missed planned sessions reduce momentum.", quality);
  if (hasTimeConstraintEvidence(evidence)) score += add(explanations, "training_behaviour", -5, "Time constraints add training-friction context.", quality);
  if (hasGoodObjectiveReadiness(evidence)) score += add(explanations, "objective_performance", 7, "Objective readiness supports momentum.", quality);

  for (const signal of localSignals) {
    if (signal.signal === "productive_fatigue") score += add(explanations, "objective_performance", 14, `${signal.lift} creates a clear productive win.`, quality);
    if (signal.signal === "inside_range") score += add(explanations, "objective_performance", 6, `${signal.lift} was completed inside range.`, quality);
    if (signal.signal === "below_range") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 5, 9, 14), `${signal.lift} below-range evidence reduces momentum.`, quality);
  }

  score += applySubjectiveContext(explanations, evidence, "momentum");

  return withScore(score, explanations);
}

function scoreConfidence(evidence, athlete) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;
  const performanceDirection = inferPerformanceDirection(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);
  const continuity = inferTrainingContinuity(evidence);

  score += add(explanations, "objective_performance", trendMovement(performanceDirection, { improving: 17, stable: 8, stagnant: -3, mixed: -5, declining: -18 }), `Objective performance direction is inferred as ${performanceDirection}.`, quality);

  if (athlete.experienceLevel === "beginner") score += add(explanations, "training_behaviour", -3, "Beginner status makes confidence more sensitive to unclear evidence.", "moderate");
  if (athlete.constraints?.adherence === "strong") score += add(explanations, "training_behaviour", 6, "Strong adherence history supports confidence.", "moderate");
  if (athlete.constraints?.adherence === "fragile") score += add(explanations, "training_behaviour", -6, "Fragile adherence context slightly lowers confidence.", "moderate");
  if (continuity === "missed_week") score += add(explanations, "training_behaviour", -14, "A missed week can reduce training confidence.", quality);

  for (const signal of localSignals) {
    if (signal.signal === "productive_fatigue") score += add(explanations, "objective_performance", 15, `${signal.lift} is a successful progression signal.`, quality);
    if (signal.signal === "inside_range") score += add(explanations, "objective_performance", 7, `${signal.lift} stayed in range.`, quality);
    if (signal.signal === "below_range") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 5, 10, 15), `${signal.lift} missed range and may reduce confidence.`, quality);
    if (signal.signal === "technique_limit") score += add(explanations, "objective_performance", -severityMovement(signal.severity, 4, 8, 12), `${signal.lift} technique limitation may reduce confidence.`, quality);
  }

  score += applySubjectiveContext(explanations, evidence, "confidence");

  if (hasSevereSafety(evidence)) {
    score += add(explanations, "safety_flag", -25, "Severe pain/safety flag lowers confidence regardless of otherwise positive context.", "high");
  }

  return withScore(score, explanations);
}

function scoreEvidenceQuality(evidence, evidenceCount) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;

  if (usesFullyDerivedQualityEvidence(evidence)) {
    const breakdown = deriveEvidenceQuality(evidence);
    score = breakdown.final_score;
    explanations.push({ authority: "fixture_quality", evidence: `Derived evidence quality from explicit data: final_score=${breakdown.final_score}.`, movement: 0, contribution: "neutral", confidence_level: quality });
    explanations.push({ authority: "fixture_quality", evidence: `Breakdown: data=${breakdown.data_completeness}, recency=${breakdown.recency}, planned=${breakdown.planned_evidence}, comparable=${breakdown.comparable_exposures}, source=${breakdown.source_quality}, consistency=${breakdown.consistency}.`, movement: 0, contribution: "neutral", confidence_level: quality });
    return withScore(score, explanations);
  }

  score += add(explanations, "fixture_quality", stateMovement(quality, { low: -22, moderate: 6, high: 30 }), `Scenario evidence quality is ${quality}.`, quality);
  score += add(explanations, "fixture_quality", Math.min(12, evidenceCount * 2), `${evidenceCount} evidence items are available in the fixture.`, quality);

  if (hasEvidenceDetail(evidence) && usesConfidenceWeightedEvidence(evidence)) {
    const detail = buildDetailedEvidence(evidence);
    score += add(explanations, "fixture_quality", stateMovement(detail.evidenceConfidence.dataCompleteness, { low: -16, moderate: 0, high: 10 }), `Explicit data completeness is ${detail.evidenceConfidence.dataCompleteness}.`, detail.evidenceConfidence.evidenceSourceQuality);
    score += add(explanations, "fixture_quality", stateMovement(detail.evidenceConfidence.recency, { stale: -12, mixed: -4, recent: 6 }), `Explicit evidence recency is ${detail.evidenceConfidence.recency}.`, detail.evidenceConfidence.evidenceSourceQuality);
    score += add(explanations, "objective_performance", Math.min(12, detail.evidenceConfidence.comparableExposureCount * 3), `${detail.evidenceConfidence.comparableExposureCount} comparable exposure(s) are available.`, detail.evidenceConfidence.evidenceSourceQuality);
    score += add(explanations, "training_behaviour", Math.min(10, detail.evidenceConfidence.plannedEvidenceCount * 2), `${detail.evidenceConfidence.plannedEvidenceCount} planned evidence item(s) are available.`, detail.evidenceConfidence.evidenceSourceQuality);
  }

  if (inferTrainingContinuity(evidence) === "missed_week") {
    score += add(explanations, "training_behaviour", -8, "A missed week makes current performance evidence less complete.", quality);
  }

  if (evidence.subjectiveContext) {
    score += add(explanations, "subjective_context", 0, "Subjective context was present but did not increase evidence authority.", "low");
  }

  return withScore(score, explanations);
}

function scoreCoachingOpportunity({ evidence, objectivePressure, recoveryCapacity, adaptation, momentum, hasSevereSafetyFlag }) {
  const explanations = [];
  const quality = qualityLevelForEvidence(evidence);
  let score = 50;

  if (objectivePressure.positive >= 2 && recoveryCapacity >= 60) {
    score += add(explanations, "objective_performance", 18, "Strong objective performance and adequate recovery capacity create useful coaching opportunity.", quality);
  }
  if (objectivePressure.negative >= 2) {
    score += add(explanations, "objective_performance", 12, "Objective problems create an opportunity for coaching attention.", quality);
  }
  if (adaptation >= 75 && momentum >= 70) {
    score += add(explanations, "objective_performance", 10, "High adaptation and momentum create room for careful future coaching.", quality);
  }
  if (recoveryCapacity < 35) {
    score += add(explanations, "objective_performance", -18, "Low recovery capacity limits coaching opportunity despite any desire to push.", quality);
  }
  if (inferTrainingContinuity(evidence) === "missed_week") {
    score += add(explanations, "training_behaviour", -12, "Interrupted training lowers immediate coaching opportunity.", quality);
  }
  if (hasSevereSafetyFlag) {
    score += add(explanations, "safety_flag", -40, "Severe pain/safety flag constrains coaching opportunity.", "high");
  }

  if (hasEvidenceDetail(evidence) && usesConfidenceWeightedEvidence(evidence)) {
    const detail = buildDetailedEvidence(evidence);
    if (detail.evidenceConfidence.dataCompleteness === "low" || detail.evidenceConfidence.comparableExposureCount <= 1) {
      score += add(explanations, "fixture_quality", -18, "Low explicit evidence confidence compresses coaching opportunity toward hold.", detail.evidenceConfidence.evidenceSourceQuality);
    }
    if (detail.evidenceConfidence.dataCompleteness === "high" && detail.evidenceConfidence.comparableExposureCount >= 4) {
      score += add(explanations, "fixture_quality", 10, "High explicit evidence confidence allows firmer coaching action when the evidence supports it.", detail.evidenceConfidence.evidenceSourceQuality);
    }
  }

  score += applySubjectiveContext(explanations, evidence, "coaching_opportunity");

  if (explanations.length === 0) {
    score += add(explanations, "objective_performance", 0, "No strong objective coaching opportunity signal was present; state remains neutral.", quality);
  }

  return withScore(score, explanations);
}

function applySubjectiveContext(explanations, evidence, field) {
  const context = evidence.subjectiveContext;
  if (!context) return 0;

  let movement = 0;

  if (context.readiness === "poor" && ["recovery_capacity", "coaching_opportunity", "confidence"].includes(field)) {
    movement += add(explanations, "subjective_context", -4, "Poor reported readiness softens the score slightly but cannot dominate objective evidence.", "low");
  }
  if (context.readiness === "great" && ["recovery_capacity", "coaching_opportunity", "confidence"].includes(field)) {
    movement += add(explanations, "subjective_context", 3, "Great reported readiness adds only a small context boost.", "low");
  }
  if (context.stress === "high" && ["recovery_capacity", "coaching_opportunity", "confidence"].includes(field)) {
    movement += add(explanations, "subjective_context", -4, "High reported stress softens the score slightly but cannot trigger a major change alone.", "low");
  }
  if (context.sleep === "poor" && ["recovery_capacity", "coaching_opportunity"].includes(field)) {
    movement += add(explanations, "subjective_context", -4, "Poor reported sleep is considered as context only.", "low");
  }
  if (context.motivation === "low" && ["momentum", "confidence"].includes(field)) {
    movement += add(explanations, "subjective_context", -4, "Low motivation is noted but weighed below completed training behaviour.", "low");
  }
  if (context.motivation === "high" && ["momentum", "confidence"].includes(field)) {
    movement += add(explanations, "subjective_context", 3, "High motivation adds only a small context boost.", "low");
  }

  return movement;
}

function buildEvidenceSummary({ athlete, evidence }) {
  const detail = buildDetailedEvidence(evidence);
  const quality = qualityLevelForEvidence(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);
  const subjective = evidence.subjectiveContext
    ? `Subjective context: readiness=${evidence.subjectiveContext.readiness ?? "not_reported"}, stress=${evidence.subjectiveContext.stress ?? "not_reported"}, sleep=${evidence.subjectiveContext.sleep ?? "not_reported"}, motivation=${evidence.subjectiveContext.motivation ?? "not_reported"}, safety=${evidence.subjectiveContext.safetyFlag ?? "none"}.`
    : "Subjective context: none supplied.";

  const lines = [
    `Athlete: ${athlete.label}.`,
    `Goal: ${athlete.goal}; training age: ${athlete.trainingAge}; schedule: ${athlete.daysPerWeek} days/week.`,
    `Scenario: ${evidence.scenario}.`,
    `Objective performance direction: ${inferPerformanceDirection(evidence)}; fatigue pressure: ${inferFatigueLevel(evidence)}; recovery status: ${inferRecoveryStatus(evidence)}.`,
    `Training behaviour: ${inferTrainingContinuity(evidence)}.`,
    `Evidence quality: ${quality}.`,
    `Local objective signals: ${localSignals.map((signal) => `${signal.lift}:${signal.signal}:${signal.severity}`).join(", ")}.`,
    `Systemic evidence: ${hasMultipleExerciseDecline(evidence) ? "multiple movement patterns affected" : "no broad multi-pattern decline inferred"}.`,
    subjective,
  ];

  if (hasEvidenceDetail(evidence)) {
    lines.push(`Explicit session history: planned completed=${detail.sessionHistory.plannedSessionsCompleted}, missed=${detail.sessionHistory.plannedSessionsMissed}, extra=${detail.sessionHistory.extraSessionsCompleted}, completed sets=${detail.sessionHistory.completedSets}, quality=${detail.sessionHistory.sessionCompletionQuality}.`);
    lines.push(`Explicit exercise history: ${detail.exerciseHistory.map((item) => `${item.exerciseName}:${item.movementPattern}:within=${item.withinRange}:below=${item.belowMinimumEvents}:above=${item.aboveRangeEvents}:shutdowns=${item.shutdowns}:trend=${item.comparableLoadTrend}`).join(", ")}.`);
    if (detail.swapHistory) lines.push(`Explicit swap history: ${detail.swapHistory.swappedFrom} -> ${detail.swapHistory.swappedTo}; post-swap=${detail.swapHistory.postSwapPerformance}; exposures=${detail.swapHistory.exposuresSinceSwap}; confirmed=${detail.swapHistory.improvementConfirmed}.`);
    lines.push(`Explicit consolidation history: recentPush=${detail.consolidationHistory.recentPushOccurred}, plannedDue=${detail.consolidationHistory.plannedConsolidationDue}, completed=${detail.consolidationHistory.consolidationCompleted}, ownsNewLoad=${detail.consolidationHistory.ownsNewLoad}.`);
    lines.push(`Explicit frequency/stimulus: daysAvailable=${detail.frequencyStimulus.trainingDaysAvailable}, currentFrequency=${detail.frequencyStimulus.currentFrequency}, sessionDensity=${detail.frequencyStimulus.sessionDensity}, compoundDensity=${detail.frequencyStimulus.compoundDensity}, axialDensity=${detail.frequencyStimulus.axialLoadingDensity}.`);
    lines.push(`Explicit safety context: scope=${detail.safetyContext.safetyIssueScope}, area=${detail.safetyContext.affectedArea}, painTrend=${detail.safetyContext.painTrend}, painSeverity=${detail.safetyContext.painSeverity}, redFlags=${detail.safetyContext.systemicRedFlags.join(",") || "none"}.`);
    lines.push(`Explicit evidence confidence: planned=${detail.evidenceConfidence.plannedEvidenceCount}, comparable=${detail.evidenceConfidence.comparableExposureCount}, recency=${detail.evidenceConfidence.recency}, completeness=${detail.evidenceConfidence.dataCompleteness}, source=${detail.evidenceConfidence.evidenceSourceQuality}.`);
    if (usesFullyDerivedQualityEvidence(evidence)) {
      const breakdown = deriveEvidenceQuality(evidence);
      lines.push(`Derived evidence quality: data=${breakdown.data_completeness}, recency=${breakdown.recency}, planned=${breakdown.planned_evidence}, comparable=${breakdown.comparable_exposures}, source=${breakdown.source_quality}, consistency=${breakdown.consistency}, final=${breakdown.final_score}.`);
    }
  }

  return lines;
}

function buildAuthoritySummary(evidence) {
  const lines = [
    "Authority 1: objective performance evidence controls the primary state movement.",
    "Authority 2: training behaviour modifies momentum and evidence quality.",
    "Authority 3: recovery behaviour modifies recovery capacity only when present.",
    evidence.subjectiveContext
      ? "Authority 4: subjective feedback was included as low-weight context and could not dominate objective evidence."
      : "Authority 4: subjective feedback was absent.",
    "Authority 5: future wearable data is not used in this lab.",
  ];
  if (hasEvidenceDetail(evidence)) {
    lines.unshift(usesSummaryShortcutFreeEvidence(evidence)
      ? "V0.5 explicit evidence is available; concrete session, exercise, stimulus, swap, consolidation, confidence, and safety fields are authoritative."
      : "Explicit evidence is available; concrete session, exercise, stimulus, swap, consolidation, and safety fields are preferred where rules support them.");
  }
  return lines;
}

function buildSubjectiveContextHandling({ evidence, objectivePressure, hasSevereSafetyFlag }) {
  if (!evidence.subjectiveContext) {
    return ["No subjective context supplied."];
  }

  const lines = ["Subjective inputs were considered as context, not dominant state drivers."];

  if (objectivePressure.positive > objectivePressure.negative) {
    lines.push("Objective evidence was mostly positive, so negative subjective feedback only softened scores slightly.");
  }
  if (objectivePressure.negative > objectivePressure.positive) {
    lines.push("Objective evidence was mostly negative, so positive subjective feedback did not override performance decline.");
  }
  if (objectivePressure.negative === objectivePressure.positive) {
    lines.push("Objective evidence was mixed or stable, so subjective feedback explained uncertainty without taking control.");
  }
  if (hasSevereSafetyFlag) {
    lines.push("Severe pain/safety flag was allowed to override normal subjective weighting for safety.");
  }

  return lines;
}

function buildConfidenceReason({ evidence, evidenceCount, objectivePressure, hasSevereSafetyFlag }) {
  if (hasEvidenceDetail(evidence)) {
    const drivers = explicitEvidenceDrivers(evidence).join(", ");
    if (usesFullyDerivedQualityEvidence(evidence)) {
      return `Confidence uses explicit v0.7 evidence fields with fully derived evidence quality (${drivers}).`;
    }
    return usesSummaryShortcutFreeEvidence(evidence)
      ? `Confidence uses explicit v0.5 evidence fields without summary shortcuts (${drivers}).`
      : `Confidence uses explicit evidence fields where available (${drivers}) with legacy compatibility for earlier gauntlets.`;
  }
  if (hasSevereSafetyFlag) {
    return "High caution because a severe safety flag is present; this is the only subjective path allowed to override normal weighting.";
  }
  if (qualityLevelForEvidence(evidence) === "high" && objectivePressure.total > 0) {
    return `High confidence because ${evidenceCount} evidence items are available and objective performance evidence is present.`;
  }
  if (qualityLevelForEvidence(evidence) === "moderate") {
    return "Moderate confidence because objective evidence is usable but still fixture-level.";
  }
  return "Low confidence because evidence is sparse, interrupted, or fixture-level only.";
}

function buildOpenQuestions({ athlete, evidence }) {
  return [
    "Aaron approval required: is coaching_opportunity the right sixth state field, or should it be split into opportunity and caution?",
    "Aaron approval required: should severe pain/safety flags live in CoachingState or a separate safety gate?",
    "Aaron approval required: what production threshold should objective evidence meet before subjective feedback can be considered at all?",
    "Research question: how should completed planned workouts, working sets, load, reps/seconds, missed ranges, shutdowns, and comparable workloads be normalised from production data?",
    `Research question: should ${athlete.label} use goal-specific weighting for ${evidence.scenario}?`,
  ];
}

function calculateObjectivePressure(evidence) {
  let positive = 0;
  let negative = 0;
  const performanceDirection = inferPerformanceDirection(evidence);
  const localSignals = inferLocalEvidenceSignals(evidence);

  if (["improving", "stable"].includes(performanceDirection)) positive += 1;
  if (["declining", "mixed"].includes(performanceDirection)) negative += 1;

  for (const signal of localSignals) {
    if (["above_range", "inside_range", "productive_fatigue"].includes(signal.signal)) positive += 1;
    if (["below_range", "dropoff", "technique_limit", "same_load_collapse", "repeated_shutdown"].includes(signal.signal)) negative += 1;
  }

  if (hasMultipleExerciseDecline(evidence)) negative += 2;
  if (hasGoodObjectiveReadiness(evidence)) positive += 1;
  const continuity = inferTrainingContinuity(evidence);
  if (continuity === "consistent") positive += 1;
  if (["interrupted", "missed_week"].includes(continuity)) negative += 1;

  return { positive, negative, total: positive + negative };
}

function countEvidence(evidence) {
  const systemicCount = hasMultipleExerciseDecline(evidence) ? 1 : 0;
  const localSignals = inferLocalEvidenceSignals(evidence);
  const subjectiveCount = evidence.subjectiveContext
    ? Object.values(evidence.subjectiveContext).filter((value) => value && value !== "none").length
    : 0;
  if (!hasEvidenceDetail(evidence)) return 4 + localSignals.length + systemicCount + subjectiveCount;
  const detail = buildDetailedEvidence(evidence);
  const explicitCount = [
    detail.sessionHistory,
    ...detail.exerciseHistory,
    detail.swapHistory,
    detail.consolidationHistory,
    detail.frequencyStimulus,
    detail.safetyContext,
    detail.evidenceConfidence,
  ].filter(Boolean).length;
  return 4 + localSignals.length + systemicCount + subjectiveCount + explicitCount;
}

function getSafetyFlags(evidence) {
  const safetyFlag = evidence.subjectiveContext?.safetyFlag;
  if (["sharp_pain", "worsening_pain", "severe_pain", "injury_concern", "dizziness", "unusual_symptoms", "unsafe", "medical_red_flag"].includes(safetyFlag)) {
    return [`subjective_${safetyFlag}`];
  }
  return [];
}

function hasSevereSafety(evidence) {
  return getSafetyFlags(evidence).length > 0;
}

function trendMovement(value, map) {
  return map[value] ?? 0;
}

function stateMovement(value, map) {
  return map[value] ?? 0;
}

function severityMovement(severity, low, moderate, high) {
  if (severity === "high") return high;
  if (severity === "moderate") return moderate;
  if (severity === "low") return low;
  return 0;
}

function add(explanations, authority, movement, evidence, confidenceLevel) {
  explanations.push({
    authority,
    evidence,
    movement,
    contribution: movement === 0 ? "neutral" : movement > 0 ? "increased score" : "decreased score",
    confidence_level: normaliseConfidenceLevel(confidenceLevel),
  });
  return movement;
}

function normaliseConfidenceLevel(value) {
  if (value === "high" || value === "moderate" || value === "low") return value;
  return "low";
}

function withScore(score, explanations) {
  return {
    score: clamp(Math.round(score)),
    explanations,
  };
}

function clamp(value) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, value));
}
