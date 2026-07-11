const SCORE_MIN = 0;
const SCORE_MAX = 100;

export function calculateAthleteState({ athlete, evidence, now = new Date() }) {
  const evidenceCount = countEvidence(evidence);
  const confidenceLevel = evidence.evidenceQuality;

  const adaptation = scoreAdaptation(evidence, confidenceLevel);
  const fatigue = scoreFatigue(evidence, athlete, confidenceLevel);
  const recovery = scoreRecovery(evidence, athlete, confidenceLevel);
  const momentum = scoreMomentum(evidence, confidenceLevel);
  const confidence = scoreAthleteConfidence(evidence, athlete, confidenceLevel);
  const evidenceQuality = scoreEvidenceQuality(evidence, evidenceCount);

  return {
    scenario_id: evidence.id,
    athlete_profile_id: athlete.id,
    status: "draft_research_output",
    adaptation: adaptation.score,
    fatigue: fatigue.score,
    recovery: recovery.score,
    momentum: momentum.score,
    confidence: confidence.score,
    evidence_quality: evidenceQuality.score,
    confidence_reason: buildConfidenceReason({ evidence, evidenceCount }),
    last_updated: now.toISOString(),
    evidence_count: evidenceCount,
    evidence_summary: buildEvidenceSummary({ athlete, evidence }),
    score_explanations: {
      adaptation: adaptation.explanations,
      fatigue: fatigue.explanations,
      recovery: recovery.explanations,
      momentum: momentum.explanations,
      confidence: confidence.explanations,
      evidence_quality: evidenceQuality.explanations,
    },
    open_questions: buildOpenQuestions({ athlete, evidence }),
  };
}

function scoreAdaptation(evidence, confidenceLevel) {
  const explanations = [];
  let score = 50;

  score += add(explanations, trendMovement(evidence.performanceTrend, { improving: 22, stable: 8, stagnant: 0, mixed: -4, declining: -18 }), `Performance trend is ${evidence.performanceTrend}.`, confidenceLevel);

  for (const signal of evidence.localLiftSignals) {
    if (signal.signal === "above_range") score += add(explanations, severityMovement(signal.severity, 8, 14, 20), `${signal.lift} is above the target range.`, confidenceLevel);
    if (signal.signal === "inside_range") score += add(explanations, severityMovement(signal.severity, 6, 8, 10), `${signal.lift} is inside the target range.`, confidenceLevel);
    if (signal.signal === "productive_fatigue") score += add(explanations, 14, `${signal.lift} shows successful load progression with productive fatigue.`, confidenceLevel);
    if (signal.signal === "below_range") score += add(explanations, -severityMovement(signal.severity, 8, 14, 20), `${signal.lift} missed the prescribed range.`, confidenceLevel);
    if (signal.signal === "dropoff") score += add(explanations, -severityMovement(signal.severity, 4, 8, 12), `${signal.lift} shows rep drop-off evidence.`, confidenceLevel);
    if (signal.signal === "technique_limit") score += add(explanations, -severityMovement(signal.severity, 6, 12, 18), `${signal.lift} has technique-limited evidence.`, confidenceLevel);
  }

  if (evidence.systemicSignals.includes("multiple_lifts_down")) {
    score += add(explanations, -16, "Multiple lifts are down, so current adaptation expression is less reliable.", confidenceLevel);
  }
  if (evidence.trainingContinuity === "missed_week") {
    score += add(explanations, -10, "A missed week reduces confidence in current adaptation expression.", confidenceLevel);
  }

  return withScore(score, explanations);
}

function scoreFatigue(evidence, athlete, confidenceLevel) {
  const explanations = [];
  let score = 50;

  score += add(explanations, stateMovement(evidence.fatigueState, { low: -22, moderate: 0, high: 24 }), `Fatigue state is ${evidence.fatigueState}.`, confidenceLevel);

  if (athlete.recoveryContext?.fatigueTrend === "rising") score += add(explanations, 8, "Athlete profile has a rising fatigue trend.", "moderate");
  if (athlete.constraints?.stress === "high") score += add(explanations, 6, "Athlete profile includes high life stress.", "moderate");
  if (evidence.systemicSignals.includes("high_soreness")) score += add(explanations, 12, "High soreness is present.", confidenceLevel);
  if (evidence.systemicSignals.includes("sleep_disrupted")) score += add(explanations, 10, "Sleep disruption is present.", confidenceLevel);
  if (evidence.systemicSignals.includes("high_stress")) score += add(explanations, 10, "High stress is present.", confidenceLevel);
  if (evidence.systemicSignals.includes("multiple_lifts_down")) score += add(explanations, 12, "Multiple lifts are down.", confidenceLevel);
  if (evidence.systemicSignals.includes("good_readiness")) score += add(explanations, -8, "Good readiness lowers current fatigue concern.", confidenceLevel);

  for (const signal of evidence.localLiftSignals) {
    if (signal.signal === "below_range") score += add(explanations, severityMovement(signal.severity, 5, 9, 13), `${signal.lift} below-range evidence adds local fatigue cost.`, confidenceLevel);
    if (signal.signal === "dropoff") score += add(explanations, severityMovement(signal.severity, 4, 8, 12), `${signal.lift} drop-off adds fatigue evidence.`, confidenceLevel);
    if (signal.signal === "productive_fatigue") score += add(explanations, 5, `${signal.lift} productive fatigue adds a small expected fatigue cost.`, confidenceLevel);
  }

  return withScore(score, explanations);
}

function scoreRecovery(evidence, athlete, confidenceLevel) {
  const explanations = [];
  let score = 50;

  score += add(explanations, stateMovement(evidence.recoveryState, { good: 22, mixed: 2, poor: -24 }), `Recovery state is ${evidence.recoveryState}.`, confidenceLevel);

  if (athlete.recoveryContext?.readiness === "high") score += add(explanations, 8, "Athlete profile readiness is high.", "moderate");
  if (athlete.recoveryContext?.readiness === "low") score += add(explanations, -10, "Athlete profile readiness is low.", "moderate");
  if (athlete.recoveryContext?.sleepQuality === "poor") score += add(explanations, -10, "Athlete profile sleep quality is poor.", "moderate");
  if (evidence.systemicSignals.includes("good_readiness")) score += add(explanations, 14, "Good readiness is present.", confidenceLevel);
  if (evidence.systemicSignals.includes("sleep_disrupted")) score += add(explanations, -16, "Sleep disruption lowers recovery.", confidenceLevel);
  if (evidence.systemicSignals.includes("high_soreness")) score += add(explanations, -12, "High soreness lowers recovery.", confidenceLevel);
  if (evidence.systemicSignals.includes("missed_sessions")) score += add(explanations, -6, "Missed sessions reduce continuity but do not automatically mean poor recovery.", confidenceLevel);

  return withScore(score, explanations);
}

function scoreMomentum(evidence, confidenceLevel) {
  const explanations = [];
  let score = 50;

  score += add(explanations, trendMovement(evidence.performanceTrend, { improving: 18, stable: 8, stagnant: -4, mixed: -6, declining: -20 }), `Performance trend is ${evidence.performanceTrend}.`, confidenceLevel);
  score += add(explanations, stateMovement(evidence.trainingContinuity, { consistent: 14, interrupted: -8, missed_week: -24 }), `Training continuity is ${evidence.trainingContinuity}.`, confidenceLevel);

  if (evidence.systemicSignals.includes("missed_sessions")) score += add(explanations, -12, "Missed sessions reduce training rhythm.", confidenceLevel);
  if (evidence.systemicSignals.includes("time_constraint")) score += add(explanations, -6, "Time constraints add adherence friction.", confidenceLevel);
  if (evidence.systemicSignals.includes("good_readiness")) score += add(explanations, 8, "Good readiness supports momentum.", confidenceLevel);

  for (const signal of evidence.localLiftSignals) {
    if (signal.signal === "productive_fatigue") score += add(explanations, 12, `${signal.lift} creates a clear productive win.`, confidenceLevel);
    if (signal.signal === "inside_range") score += add(explanations, 5, `${signal.lift} was completed inside range.`, confidenceLevel);
    if (signal.signal === "below_range") score += add(explanations, -severityMovement(signal.severity, 4, 8, 12), `${signal.lift} below-range evidence reduces momentum.`, confidenceLevel);
  }

  return withScore(score, explanations);
}

function scoreAthleteConfidence(evidence, athlete, confidenceLevel) {
  const explanations = [];
  let score = 50;

  score += add(explanations, trendMovement(evidence.performanceTrend, { improving: 16, stable: 7, stagnant: -3, mixed: -5, declining: -16 }), `Performance trend is ${evidence.performanceTrend}.`, confidenceLevel);

  if (athlete.experienceLevel === "beginner") score += add(explanations, -4, "Beginner status means confidence is more sensitive to unclear feedback.", "moderate");
  if (athlete.constraints?.adherence === "strong") score += add(explanations, 6, "Strong adherence history supports confidence.", "moderate");
  if (athlete.constraints?.adherence === "fragile") score += add(explanations, -8, "Fragile adherence increases confidence risk.", "moderate");
  if (evidence.trainingContinuity === "missed_week") score += add(explanations, -14, "A missed week can reduce training confidence.", confidenceLevel);
  if (evidence.systemicSignals.includes("good_readiness")) score += add(explanations, 8, "Good readiness supports confidence.", confidenceLevel);

  for (const signal of evidence.localLiftSignals) {
    if (signal.signal === "productive_fatigue") score += add(explanations, 14, `${signal.lift} is a successful progression signal.`, confidenceLevel);
    if (signal.signal === "inside_range") score += add(explanations, 6, `${signal.lift} stayed in range.`, confidenceLevel);
    if (signal.signal === "below_range") score += add(explanations, -severityMovement(signal.severity, 5, 9, 13), `${signal.lift} missed range and may reduce confidence.`, confidenceLevel);
    if (signal.signal === "technique_limit") score += add(explanations, -severityMovement(signal.severity, 4, 8, 12), `${signal.lift} technique limitation may reduce confidence.`, confidenceLevel);
  }

  return withScore(score, explanations);
}

function scoreEvidenceQuality(evidence, evidenceCount) {
  const explanations = [];
  let score = 50;

  score += add(explanations, stateMovement(evidence.evidenceQuality, { low: -20, moderate: 5, high: 28 }), `Scenario evidence quality is ${evidence.evidenceQuality}.`, evidence.evidenceQuality);
  score += add(explanations, Math.min(12, evidenceCount * 2), `${evidenceCount} evidence items are available in the fixture.`, evidence.evidenceQuality);

  if (evidence.trainingContinuity === "missed_week") {
    score += add(explanations, -8, "A missed week makes recent performance evidence less complete.", evidence.evidenceQuality);
  }

  return withScore(score, explanations);
}

function buildEvidenceSummary({ athlete, evidence }) {
  return [
    `Athlete: ${athlete.label}.`,
    `Goal: ${athlete.goal}; training age: ${athlete.trainingAge}; schedule: ${athlete.daysPerWeek} days/week.`,
    `Scenario: ${evidence.scenario}.`,
    `Performance: ${evidence.performanceTrend}; fatigue: ${evidence.fatigueState}; recovery: ${evidence.recoveryState}.`,
    `Continuity: ${evidence.trainingContinuity}; evidence quality: ${evidence.evidenceQuality}.`,
    `Local signals: ${evidence.localLiftSignals.map((signal) => `${signal.lift}:${signal.signal}:${signal.severity}`).join(", ")}.`,
    `Systemic signals: ${evidence.systemicSignals.join(", ")}.`,
  ];
}

function buildConfidenceReason({ evidence, evidenceCount }) {
  if (evidence.evidenceQuality === "high") {
    return `High confidence because ${evidenceCount} scenario evidence items are available and the fixture marks evidence quality as high.`;
  }
  if (evidence.evidenceQuality === "moderate") {
    return `Moderate confidence because the fixture has usable evidence, but not enough detail for production-grade scoring.`;
  }
  return `Low confidence because evidence is sparse or interrupted; the state should be descriptive only.`;
}

function buildOpenQuestions({ athlete, evidence }) {
  return [
    "Aaron approval required: are these six state fields sufficient, or should readiness and adherence be separate top-level fields?",
    "Aaron approval required: should fatigue be represented as higher-is-worse while the other scores are higher-is-better, or should all scores point in the same direction?",
    "Aaron approval required: what minimum evidence_count should be required before the state can influence future production coaching?",
    "Research question: how should real completed workouts, working sets, missed reps, shutdowns, recovery weeks, and missed sessions be normalised into this schema?",
    `Research question: should ${athlete.label} use goal-specific state weighting for ${evidence.scenario}?`,
  ];
}

function countEvidence(evidence) {
  const systemicCount = evidence.systemicSignals.filter((signal) => signal !== "none").length;
  return 4 + evidence.localLiftSignals.length + systemicCount;
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

function add(explanations, movement, evidence, confidenceLevel) {
  explanations.push({
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
