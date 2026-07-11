import {
  buildDetailedEvidence,
  hasEvidenceDetail,
  hasMissedPlannedSessions,
  hasMultipleExerciseDecline,
  hasSystemicFatiguePattern,
  inferFatigueLevel,
  inferLocalEvidenceSignals,
  qualityLevelForEvidence,
  usesFullyDerivedQualityEvidence,
  usesConfidenceWeightedEvidence,
} from "./evidence_detail.mjs";

const DEFAULT_ALLOWED = [
  "continue normal planned training",
  "monitor next comparable workload",
  "use normal coaching state downstream",
];

const CAUTION_ALLOWED = [
  "continue with controlled execution",
  "monitor the next comparable set or session",
  "keep aggressive progression off by default",
];

const RESTRICT_ALLOWED = [
  "use conservative alternatives for affected area",
  "reduce aggression for affected movement pattern",
  "continue unaffected training if comfortable",
  "monitor symptoms and performance trend",
];

const STOP_ALLOWED = [
  "stop the affected movement today",
  "continue only unaffected, comfortable work if appropriate",
  "seek professional advice when pain is sharp, worsening, unusual, or concerning",
];

export function evaluateSafetyGate({ athlete, evidence, coachingState }) {
  const reasons = [];
  const evidenceSources = [];
  const affectedAreas = new Set();
  let level = 0;
  const hasDetail = hasEvidenceDetail(evidence);
  const detail = buildDetailedEvidence(evidence);

  if (hasDetail) {
    for (const exercise of detail.exerciseHistory) {
      const area = exercise.movementPattern;
      if (exercise.belowMinimumEvents > 0) {
        const confirmed = detail.evidenceConfidence.plannedEvidenceCount > 1 && detail.evidenceConfidence.comparableExposureCount > 1;
        const severity = confirmed && exercise.belowMinimumEvents >= 2 ? 2 : 1;
        raise(severity, `${exercise.exerciseName} has ${exercise.belowMinimumEvents} below-minimum event(s).`, `explicit:${exercise.exerciseName}:below_minimum_events`);
        affectedAreas.add(area);
      }
      if (exercise.shutdowns > 0) {
        raise(2, `${exercise.exerciseName} has ${exercise.shutdowns} shutdown event(s).`, `explicit:${exercise.exerciseName}:shutdowns`);
        affectedAreas.add(area);
      }
      if (exercise.comparableLoadTrend === "sharp_drop") {
        raise(2, `${exercise.exerciseName} shows sharp comparable-load decline.`, `explicit:${exercise.exerciseName}:sharp_comparable_drop`);
        affectedAreas.add(area);
      }
      if (exercise.comparableLoadTrend === "declining") {
        const severity = 1;
        raise(severity, `${exercise.exerciseName} shows declining comparable-load trend.`, `explicit:${exercise.exerciseName}:declining_comparable_trend`);
        affectedAreas.add(area);
      }
      if (exercise.techniqueBreakdown && exercise.techniqueBreakdown !== "none") {
        raise(1, `${exercise.exerciseName} has explicit technique breakdown evidence.`, `explicit:${exercise.exerciseName}:technique_breakdown`);
        affectedAreas.add(area);
      }
    }

    if (detail.safetyContext.painSeverity === "mild" || detail.safetyContext.painSeverity === "moderate") {
      const pairedWithDecline = detail.exerciseHistory.some((exercise) => exercise.comparableLoadTrend === "declining" || exercise.belowMinimumEvents > 0);
      raise(pairedWithDecline ? 2 : 1, "Explicit pain context was reported; monitor and avoid aggressive progression.", "explicit:safety:pain_context");
      affectedAreas.add(detail.safetyContext.affectedArea);
    }
    if (detail.safetyContext.painSeverity === "sharp" || detail.safetyContext.painSeverity === "severe" || detail.safetyContext.painTrend === "worsening") {
      raise(4, "Explicit pain context requires stopping the affected movement.", "explicit:safety:movement_stop");
      affectedAreas.add(detail.safetyContext.affectedArea);
    }
    if (detail.safetyContext.systemicRedFlags.length > 0 || detail.safetyContext.safetyIssueScope === "session_wide") {
      raise(4, "Explicit systemic safety context requires stopping the session.", "explicit:safety:session_wide_stop");
      affectedAreas.add("systemic");
    }
  }

  for (const signal of inferLocalEvidenceSignals(evidence)) {
    const area = affectedAreaForLift(signal.lift);
    if (signal.signal === "below_range") {
      raise(signal.severity === "high" ? 2 : 1, `${signal.lift} missed the prescribed minimum range.`, `objective:${signal.lift}:below_range`);
      affectedAreas.add(area);
    }
    if (signal.signal === "dropoff") {
      raise(signal.severity === "high" ? 2 : 1, `${signal.lift} shows comparable-workload drop-off.`, `objective:${signal.lift}:dropoff`);
      affectedAreas.add(area);
    }
    if (signal.signal === "same_load_collapse") {
      raise(signal.severity === "high" ? 2 : 1, `${signal.lift} shows repeated same-load collapse.`, `objective:${signal.lift}:same_load_collapse`);
      affectedAreas.add(area);
    }
    if (signal.signal === "repeated_shutdown") {
      raise(2, `${signal.lift} has repeated shutdown evidence.`, `objective:${signal.lift}:repeated_shutdown`);
      affectedAreas.add(area);
    }
    if (signal.signal === "technique_limit" && signal.severity !== "none") {
      raise(1, `${signal.lift} has technique-limited evidence.`, `objective:${signal.lift}:technique_limit`);
      affectedAreas.add(area);
    }
  }

  if (hasMissedPlannedSessions(evidence) && inferFatigueLevel(evidence) === "high") {
    raise(1, "Missed sessions occurred alongside high fatigue evidence.", "training_behaviour:missed_sessions_after_overload");
    affectedAreas.add("systemic");
  }
  if (hasMissedPlannedSessions(evidence) && detail.evidenceConfidence.dataCompleteness !== "low" && detail.sessionHistory.completedSets === 0) {
    raise(1, "Missed planned sessions have enough context to monitor continuity.", "training_behaviour:missed_sessions_contextual");
  }
  if (hasSystemicFatiguePattern(evidence)) {
    raise(2, "Multiple movement patterns are down with poor session quality.", "explicit:systemic:multi_pattern_fatigue");
    affectedAreas.add("systemic");
  }
  if (detail.frequencyStimulus.hiddenOverreachRisk) {
    const aboveRangeCount = detail.exerciseHistory.reduce((sum, exercise) => sum + exercise.aboveRangeEvents, 0);
    raise(aboveRangeCount >= 2 ? 2 : 1, "Workload risk is present in explicit training-stress evidence.", "explicit:stimulus:workload_risk");
    affectedAreas.add("systemic");
  }

  const safetyFlag = evidence.subjectiveContext?.safetyFlag ?? "none";
  if (safetyFlag === "pain") {
    raise(1, "Pain was reported; monitor and avoid aggressive progression.", "subjective_safety:pain");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }
  if (safetyFlag === "sharp_pain") {
    raise(4, "Sharp pain was reported.", "subjective_safety:sharp_pain");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }
  if (safetyFlag === "worsening_pain") {
    raise(4, "Pain is worsening across sessions.", "subjective_safety:worsening_pain");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }
  if (safetyFlag === "severe_pain") {
    raise(4, "Severe pain was reported.", "subjective_safety:severe_pain");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }
  if (safetyFlag === "injury_concern") {
    raise(3, "Injury concern was reported.", "subjective_safety:injury_concern");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }
  if (safetyFlag === "dizziness" || safetyFlag === "unusual_symptoms" || safetyFlag === "unsafe" || safetyFlag === "medical_red_flag") {
    raise(4, "Unusual or unsafe symptoms were reported.", `subjective_safety:${safetyFlag}`);
    affectedAreas.add("systemic");
  }
  if (evidence.subjectiveContext?.soreness === "high" && evidence.subjectiveContext?.notes?.includes("changes movement")) {
    raise(2, "Severe soreness is changing movement.", "subjective_safety:soreness_changes_movement");
    addSubjectiveAffectedArea(evidence, affectedAreas);
  }

  if (reasons.length === 0) {
    reasons.push("No meaningful safety concern found in objective evidence or safety context.");
    evidenceSources.push("safety_gate:no_concern");
  }

  const status = statusForLevel(level);
  const severity = severityForLevel(level);
  const confidence = confidenceForGate({ evidence, coachingState, level });

  return {
    scenario_id: evidence.id,
    athlete_profile_id: athlete.id,
    status,
    severity,
    veto: status === "restrict" || status === "stop",
    affected_areas: Array.from(affectedAreas.size ? affectedAreas : new Set(["none"])),
    reasons,
    allowed_actions: allowedActionsForStatus(status),
    blocked_actions: blockedActionsForStatus(status),
    recommended_user_message: messageForStatus(status, confidence),
    confidence,
    evidence_sources: evidenceSources,
  };

  function raise(candidateLevel, reason, source) {
    if (candidateLevel > level) level = candidateLevel;
    reasons.push(reason);
    evidenceSources.push(source);
  }
}

function statusForLevel(level) {
  if (level >= 4) return "stop";
  if (level >= 2) return "restrict";
  if (level >= 1) return "caution";
  return "clear";
}

function severityForLevel(level) {
  if (level >= 4) return "severe";
  if (level === 3) return "high";
  if (level === 2) return "moderate";
  if (level === 1) return "low";
  return "none";
}

function allowedActionsForStatus(status) {
  if (status === "stop") return STOP_ALLOWED;
  if (status === "restrict") return RESTRICT_ALLOWED;
  if (status === "caution") return CAUTION_ALLOWED;
  return DEFAULT_ALLOWED;
}

function blockedActionsForStatus(status) {
  if (status === "stop") {
    return [
      "affected movement training today",
      "PR attempts",
      "load increases for affected area",
      "high-fatigue work for affected area",
    ];
  }
  if (status === "restrict") {
    return [
      "aggressive progression",
      "PR attempts",
      "load increases for affected area",
      "extra volume for affected area",
      "high-fatigue movements for affected area",
      "affected-pattern loading",
    ];
  }
  if (status === "caution") {
    return [
      "aggressive progression without confirmation",
    ];
  }
  return [];
}

function messageForStatus(status, confidence = 70) {
  if (status === "stop") {
    return "Stop this movement for today. If pain is sharp, worsening or unusual, seek professional advice.";
  }
  if (status === "restrict") {
    return "We'll avoid pushing this area today and choose a safer option.";
  }
  if (status === "caution") {
    if (confidence < 60) return "We don't have enough history to be certain, so we'll keep this controlled.";
    return "Your recent training shows a clear pattern, so we'll keep this controlled and monitor the next session.";
  }
  return "No safety concern detected. Continue with normal controlled training.";
}

function confidenceForGate({ evidence, coachingState, level }) {
  const quality = qualityLevelForEvidence(evidence);
  let confidence = 45;
  if (quality === "high") confidence += 25;
  if (quality === "moderate") confidence += 12;
  if (level >= 3) confidence += 15;
  if (coachingState?.evidence_quality >= 80) confidence += 8;
  if (evidence.subjectiveContext?.safetyFlag && evidence.subjectiveContext.safetyFlag !== "none") confidence += 6;
  if (usesConfidenceWeightedEvidence(evidence) && hasEvidenceDetail(evidence)) {
    const detail = buildDetailedEvidence(evidence);
    if (detail.evidenceConfidence.dataCompleteness === "low") confidence -= 10;
    if (detail.evidenceConfidence.evidenceSourceQuality === "low") confidence -= 8;
    if (detail.evidenceConfidence.recency === "stale") confidence -= 6;
    if (level >= 3 && detail.safetyContext.painSeverity !== "none") confidence += 12;
    if (level >= 4 && detail.safetyContext.systemicRedFlags.length > 0) confidence += 12;
  }
  if (usesFullyDerivedQualityEvidence(evidence)) {
    if (quality === "low") confidence -= 8;
    if (level >= 4) confidence += 10;
  }
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function addSubjectiveAffectedArea(evidence, affectedAreas) {
  for (const signal of inferLocalEvidenceSignals(evidence)) {
    if (signal.lift && signal.lift !== "all") affectedAreas.add(affectedAreaForLift(signal.lift));
  }
  if (affectedAreas.size === 0) affectedAreas.add("reported area");
}

function affectedAreaForLift(lift) {
  const value = lift.toLowerCase();
  if (value.includes("squat") || value.includes("leg_press")) return "squat/lower-body pattern";
  if (value.includes("deadlift") || value.includes("row")) return "hinge/pull pattern";
  if (value.includes("bench") || value.includes("press")) return "pressing pattern";
  if (value.includes("curl")) return "arm isolation";
  if (value === "all") return "systemic";
  return lift.replaceAll("_", " ");
}
