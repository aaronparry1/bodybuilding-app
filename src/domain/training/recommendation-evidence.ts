export type RecommendationConfidence = "high" | "medium" | "low" | "insufficient_data";

export type RecommendationSource = "history" | "default" | "fixture" | "limited_data";

export interface RecommendationEvidence {
  type: string;
  confidence: RecommendationConfidence;
  source: RecommendationSource;
  summary: string;
  dataPoints: string[];
  reason: string;
  actionAllowed: boolean;
}

export function evidence(input: RecommendationEvidence): RecommendationEvidence {
  return input;
}

export function insufficientEvidence(type: string, reason = "Log 3-5 completed workouts first."): RecommendationEvidence {
  return {
    type,
    confidence: "insufficient_data",
    source: "limited_data",
    summary: "Not enough completed training history.",
    dataPoints: [reason],
    reason,
    actionAllowed: false,
  };
}

export function fixtureSource(isFixture: boolean): RecommendationSource {
  return isFixture ? "fixture" : "history";
}

export function isActionableEvidence(recommendationEvidence?: RecommendationEvidence | null): boolean {
  return Boolean(recommendationEvidence?.actionAllowed && recommendationEvidence.confidence !== "insufficient_data");
}
