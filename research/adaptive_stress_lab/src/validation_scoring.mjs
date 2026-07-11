export function scoreDraftDecision(evidence, recommendation) {
  const scientificConfidence = scoreScientificConfidence(evidence.evidenceQuality);
  const fatigueCost = scoreFatigueCost(recommendation);
  const safety = scoreSafety(evidence, recommendation);
  const behaviouralSimplicity = scoreBehaviouralSimplicity(recommendation);
  const adaptationPotential = scoreAdaptationPotential(evidence, recommendation);
  const overallConfidence = Math.max(
    1,
    Math.min(
      5,
      Math.round((scientificConfidence + safety + behaviouralSimplicity + adaptationPotential + (6 - fatigueCost)) / 5),
    ),
  );

  return {
    scientificConfidence,
    adaptationPotential,
    fatigueCost,
    safety,
    behaviouralSimplicity,
    overallConfidence,
  };
}

function scoreScientificConfidence(evidenceQuality) {
  if (evidenceQuality === "high") return 4;
  if (evidenceQuality === "moderate") return 3;
  return 2;
}

function scoreFatigueCost(recommendation) {
  if (recommendation === "push_cautiously") return 3;
  if (recommendation === "redistribute_stimulus") return 3;
  if (recommendation === "hold_and_confirm") return 2;
  if (recommendation === "reduce_local_stress") return 2;
  if (recommendation === "reduce_session_stress") return 2;
  if (recommendation === "recovery_bias") return 1;
  if (recommendation === "resume_gently") return 1;
  return 2;
}

function scoreSafety(evidence, recommendation) {
  if (evidence.fatigueState === "high" && recommendation === "push_cautiously") return 2;
  if (evidence.performanceTrend === "declining" && recommendation === "push_cautiously") return 1;
  if (recommendation === "recovery_bias" || recommendation === "reduce_session_stress") return 5;
  if (recommendation === "reduce_local_stress" || recommendation === "resume_gently") return 4;
  return 3;
}

function scoreBehaviouralSimplicity(recommendation) {
  if (recommendation === "redistribute_stimulus") return 2;
  if (recommendation === "needs_human_review") return 2;
  if (recommendation === "hold_and_confirm" || recommendation === "resume_gently") return 5;
  return 4;
}

function scoreAdaptationPotential(evidence, recommendation) {
  if (evidence.performanceTrend === "improving" && recommendation === "push_cautiously") return 4;
  if (evidence.performanceTrend === "stagnant" && recommendation === "redistribute_stimulus") return 4;
  if (evidence.performanceTrend === "declining" && recommendation === "recovery_bias") return 3;
  if (recommendation === "hold_and_confirm") return 3;
  return 3;
}
