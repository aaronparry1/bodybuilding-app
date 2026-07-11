import { gauntletScenariosV0_2 } from "./scenarios_v0_2.mjs";
import { buildDetailedEvidence } from "../src/evidence_detail.mjs";

export const gauntletScenariosV0_3 = gauntletScenariosV0_2.map((scenario) => {
  const detail = buildDetailedEvidence(scenario.evidence);
  const id = scenario.id.replace(/^v02_/, "v03_").replace(/^l([1-4])_/, "v03_l$1_");
  return {
    ...scenario,
    id,
    evidence: {
      ...scenario.evidence,
      id: scenario.evidence.id.replace(/^v02_/, "v03_").replace(/^l([1-4])_/, "v03_l$1_"),
      notes: [
        ...(scenario.evidence.notes ?? []),
        "V0.3 migration: concrete evidence fields are present; legacy broad signals are retained only for compatibility comparison.",
      ],
      sessionHistory: detail.sessionHistory,
      exerciseHistory: detail.exerciseHistory,
      swapHistory: detail.swapHistory,
      consolidationHistory: detail.consolidationHistory,
      frequencyStimulus: detail.frequencyStimulus,
      safetyContext: detail.safetyContext,
      evidenceConfidence: detail.evidenceConfidence,
    },
  };
});
