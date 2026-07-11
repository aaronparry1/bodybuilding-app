import { scoreDraftDecision } from "./validation_scoring.mjs";

export function decideNextCoachingAction({ athlete, evidence }) {
  const recommendation = chooseDraftRecommendation({ athlete, evidence });
  const interventions = buildDraftInterventions(recommendation, evidence);
  const rationale = buildDraftRationale({ athlete, evidence, recommendation });

  return {
    scenarioId: evidence.id,
    athleteProfileId: athlete.id,
    status: "draft_research_output",
    primaryRecommendation: recommendation,
    interventions,
    rationale,
    validationScore: scoreDraftDecision(evidence, recommendation),
    productionEligible: false,
    openQuestions: buildOpenQuestions({ athlete, evidence, recommendation }),
  };
}

function chooseDraftRecommendation({ athlete, evidence }) {
  if (evidence.trainingContinuity === "missed_week") return "resume_gently";
  if (evidence.systemicSignals.includes("low_frequency") || athlete.constraints.time === "low") return "redistribute_stimulus";
  if (evidence.systemicSignals.includes("multiple_lifts_down") && evidence.fatigueState === "high") return "recovery_bias";
  if (evidence.performanceTrend === "declining" && evidence.fatigueState === "high") return "recovery_bias";
  if (hasLocalFailure(evidence) && !evidence.systemicSignals.includes("multiple_lifts_down")) return "reduce_local_stress";
  if (evidence.performanceTrend === "stagnant" && evidence.fatigueState === "high") return "reduce_session_stress";
  if (evidence.performanceTrend === "stagnant" && evidence.fatigueState === "low") return "hold_and_confirm";
  if (evidence.performanceTrend === "improving" && evidence.fatigueState === "high") return "hold_and_confirm";
  if (evidence.performanceTrend === "improving" && evidence.fatigueState === "low") return "push_cautiously";
  return "hold_and_confirm";
}

function hasLocalFailure(evidence) {
  return evidence.localLiftSignals.some((signal) => signal.signal === "below_range" || signal.signal === "technique_limit");
}

function buildDraftInterventions(recommendation, evidence) {
  const common = { approvalStatus: "draft_requires_aaron_approval" };
  switch (recommendation) {
    case "push_cautiously":
      return [
        { ...common, type: "add_rep", scope: "exercise", intent: "Use the smallest effective progression before adding load." },
        { ...common, type: "maintain_sets", scope: "session", intent: "Avoid adding volume when current stress is already productive." },
      ];
    case "reduce_local_stress":
      return [
        { ...common, type: "reduce_load", scope: "exercise", intent: "Correct the failing lift without escalating to a whole-programme recovery week." },
        { ...common, type: "hold_load", scope: "session", intent: "Keep unrelated lifts stable until more evidence appears." },
      ];
    case "reduce_session_stress":
      return [
        { ...common, type: "reduce_sets", scope: "session", intent: "Lower fatigue cost while preserving the main training pattern." },
        { ...common, type: "recovery_guidance", scope: "week", intent: "Use recovery support before more aggressive deloading." },
      ];
    case "recovery_bias":
      return [
        { ...common, type: "consolidation_week", scope: "week", intent: "Reduce systemic stress when multiple signals suggest poor recovery." },
        { ...common, type: "reduce_sets", scope: "session", intent: "Protect training quality during the recovery-biased period." },
      ];
    case "resume_gently":
      return [
        { ...common, type: "hold_load", scope: "session", intent: "Rebuild rhythm after interruption before interpreting performance." },
        { ...common, type: "maintain_sets", scope: "session", intent: "Keep the first session back simple and finishable." },
      ];
    case "redistribute_stimulus":
      return [
        { ...common, type: "redistribute_volume", scope: "week", intent: "Preserve useful weekly stimulus within a lower-frequency schedule." },
        { ...common, type: "maintain_sets", scope: "session", intent: "Avoid turning limited-frequency sessions into junk-volume marathons." },
      ];
    case "hold_and_confirm":
    default:
      return [
        { ...common, type: "hold_load", scope: "exercise", intent: "Wait for clearer evidence before increasing stress." },
        { ...common, type: "no_change", scope: "session", intent: "Avoid unnecessary intervention when evidence is uncertain or mixed." },
      ];
  }
}

function buildDraftRationale({ athlete, evidence, recommendation }) {
  const rationale = [
    `Athlete profile: ${athlete.label}.`,
    `Evidence state: performance ${evidence.performanceTrend}, fatigue ${evidence.fatigueState}, recovery ${evidence.recoveryState}.`,
    "Draft principle: choose the lowest-fatigue intervention that plausibly supports adaptation.",
  ];

  if (recommendation === "recovery_bias") {
    rationale.push("Systemic signals suggest the issue is broader than one lift.");
  }
  if (recommendation === "reduce_local_stress") {
    rationale.push("Local lift failure should be corrected locally before changing the whole training week.");
  }
  if (recommendation === "redistribute_stimulus") {
    rationale.push("Low frequency or time pressure requires stimulus distribution, not simple set counting.");
  }
  if (recommendation === "push_cautiously") {
    rationale.push("Improving performance and low fatigue may justify a small progression, but not an aggressive jump.");
  }

  return rationale;
}

function buildOpenQuestions({ athlete, evidence, recommendation }) {
  return [
    "Aaron approval required: are these athlete profile fields sufficient, too broad, or missing key commercial coaching context?",
    "Aaron approval required: should fatigue, safety, and confidence use a 1-5 scale, a traffic-light model, or both?",
    "Aaron approval required: should this recommendation category exist as named, or should it be reframed before any user-facing design?",
    `Research question: does ${athlete.label} need goal-specific intervention ordering beyond this stub?`,
    `Research question: what production evidence would be required before '${recommendation}' could become automated?`,
  ];
}
