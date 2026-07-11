export const RUBRIC_FIELDS = [
  "charter_alignment",
  "scientific_support",
  "coaching_quality",
  "safety",
  "long_term_progress",
  "confidence_building",
  "simplicity",
];

export function scoreGauntletDecision({ scenario, recommendation, safetyGate }) {
  const expected = scenario.expected;
  const typeAllowed = expected.recommendation_types.includes(recommendation.recommendation_type);
  const typeForbidden = expected.forbidden_recommendation_types.includes(recommendation.recommendation_type);
  const aggressionAllowed = expected.aggressiveness.includes(recommendation.aggressiveness);
  const safetyMatches = safetyGate.status === expected.safety_gate_status;
  const confidenceOk = recommendation.confidence >= expected.confidence_min;

  const scores = {
    charter_alignment: scoreCharterAlignment({ recommendation, typeAllowed, typeForbidden }),
    scientific_support: scoreScientificSupport({ scenario, recommendation, typeAllowed, typeForbidden }),
    coaching_quality: scoreCoachingQuality({ recommendation, typeAllowed, aggressionAllowed }),
    safety: scoreSafety({ scenario, recommendation, safetyGate, safetyMatches, typeForbidden }),
    long_term_progress: scoreLongTermProgress({ recommendation, typeAllowed, aggressionAllowed }),
    confidence_building: scoreConfidenceBuilding({ recommendation, typeForbidden }),
    simplicity: scoreSimplicity(recommendation),
  };

  const total = RUBRIC_FIELDS.reduce((sum, field) => sum + scores[field], 0);
  const max = RUBRIC_FIELDS.length * 5;
  const percentage = Math.round((total / max) * 100);
  const pass = percentage >= 72 && typeAllowed && !typeForbidden && safetyMatches;

  return {
    scenario_id: scenario.id,
    level: scenario.level,
    level_label: scenario.level_label,
    pass,
    percentage,
    total,
    max,
    scores,
    expectation: {
      recommendation_types: expected.recommendation_types,
      forbidden_recommendation_types: expected.forbidden_recommendation_types,
      aggressiveness: expected.aggressiveness,
      safety_gate_status: expected.safety_gate_status,
      confidence_min: expected.confidence_min,
    },
    checks: {
      type_allowed: typeAllowed,
      type_forbidden: typeForbidden,
      aggressiveness_allowed: aggressionAllowed,
      safety_gate_matches: safetyMatches,
      confidence_ok: confidenceOk,
    },
    failure_reasons: failureReasons({ typeAllowed, typeForbidden, aggressionAllowed, safetyMatches, confidenceOk }),
  };
}

function scoreCharterAlignment({ recommendation, typeAllowed, typeForbidden }) {
  if (typeForbidden) return 1;
  if (typeAllowed && recommendation.charter_alignment?.notes?.length > 0) return 5;
  if (typeAllowed) return 4;
  return 2;
}

function scoreScientificSupport({ scenario, recommendation, typeAllowed, typeForbidden }) {
  if (typeForbidden) return 1;
  if (scenario.evidence.evidenceQuality === "low" && recommendation.recommendation_type === "push") return 1;
  if ((scenario.evidence.systemicSignals ?? []).includes("multiple_lifts_down") && recommendation.recommendation_type === "push") return 1;
  if (typeAllowed) return scenario.evidence.evidenceQuality === "high" ? 5 : 4;
  return 3;
}

function scoreCoachingQuality({ recommendation, typeAllowed, aggressionAllowed }) {
  if (typeAllowed && aggressionAllowed) return 5;
  if (typeAllowed) return 4;
  if (recommendation.recommendation_type === "hold") return 3;
  return 2;
}

function scoreSafety({ recommendation, safetyGate, safetyMatches, typeForbidden }) {
  if (typeForbidden) return 1;
  if (safetyGate.status === "stop" && !["stop_movement", "stop_session"].includes(recommendation.recommendation_type)) return 1;
  if (safetyGate.status === "restrict" && recommendation.recommendation_type === "push") return 1;
  if (safetyMatches) return 5;
  return 3;
}

function scoreLongTermProgress({ recommendation, typeAllowed, aggressionAllowed }) {
  if (recommendation.aggressiveness === "high") return 2;
  if (typeAllowed && aggressionAllowed) return 5;
  if (typeAllowed) return 4;
  return 3;
}

function scoreConfidenceBuilding({ recommendation, typeForbidden }) {
  if (typeForbidden) return 1;
  if (recommendation.user_message.length > 0 && !recommendation.user_message.includes("failed")) return 5;
  return 3;
}

function scoreSimplicity(recommendation) {
  if (recommendation.secondary_interventions.length <= 2 && recommendation.user_message.length <= 140) return 5;
  if (recommendation.secondary_interventions.length <= 3) return 4;
  return 3;
}

function failureReasons({ typeAllowed, typeForbidden, aggressionAllowed, safetyMatches, confidenceOk }) {
  const reasons = [];
  if (!typeAllowed) reasons.push("recommendation type not in expected set");
  if (typeForbidden) reasons.push("recommendation type was explicitly forbidden");
  if (!aggressionAllowed) reasons.push("aggressiveness outside expected range");
  if (!safetyMatches) reasons.push("Safety Gate status did not match expected status");
  if (!confidenceOk) reasons.push("confidence below expected minimum");
  return reasons;
}
