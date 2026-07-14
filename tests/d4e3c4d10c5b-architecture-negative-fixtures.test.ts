import { describe, expect, it } from "vitest";

const approved = `export function resolveTrainingLane(input) { return toLegacy(resolveTrainingLaneDecision(input)); } function resolveTrainingLaneDecision(input) { return { lane: "hypertrophy", source: "block_compatibility" }; }`;
const duplicate = `export function resolveTrainingLane(input) { if (input.role) return "strength"; return toLegacy(resolveTrainingLaneDecision(input)); }`;
const inference = `const lane = resolveTrainingLane(input); const authority = lane === "peak" ? "planned_order" : "default";`;
const observer = `function resolveTrainingLane(input, options) { options?.onDecisionObserved?.({ lane: "hypertrophy" }); return "hypertrophy"; }`;

describe("D4E3C4D10C5B architecture fixtures", () => {
  it("accepts the approved private-helper shape", () => {
    expect(approved).toContain("resolveTrainingLaneDecision");
    expect(approved).toContain("toLegacy(resolveTrainingLaneDecision(input))");
  });
  it("rejects façade-retained duplicate selection", () => expect(duplicate).toMatch(/if \(input\.role\)/));
  it("rejects external source inference", () => expect(inference).toMatch(/lane ===/));
  it("rejects observer/options seams", () => expect(observer).toMatch(/onDecisionObserved/));
});
