import { describe, expect, it } from "vitest";
import { resolveCurrentHypertrophyLowerBProgrammeGuidance, resolveCurrentHypertrophyLowerProgrammeGuidance, resolveCurrentHypertrophyProgrammeGuidance, resolveCurrentHypertrophyUpperBProgrammeGuidance } from "@/domain/training/current-hypertrophy-programme-guidance-policy";
import { mapPolicySlotToD2Input } from "@/domain/training/current-programme-guidance-policy-contracts";
import { constructCurrentProgrammeSpecification } from "@/domain/training/current-programme-specification-construction";
import { hydrateCurrentMesocycleProgrammeSpecification } from "@/domain/training/current-programme-specification";

const base: any = { schemaVersion: "v1", goal: "build_muscle", experienceLevel: "intermediate", trainingDays: 4, split: "upper_lower", mesocyclePurpose: "hypertrophy", microcyclePriority: "normal_productive", equipmentCapabilities: ["full_gym"], constructionPolicyVersion: "v1", guidancePolicyVersion: "hypertrophy_programme_guidance_v1" };
const sessions = [{ role: "Upper", identity: "upper-a", resolve: resolveCurrentHypertrophyProgrammeGuidance }, { role: "Lower", identity: "lower-a", resolve: resolveCurrentHypertrophyLowerProgrammeGuidance }, { role: "Upper", identity: "upper-b", resolve: resolveCurrentHypertrophyUpperBProgrammeGuidance }, { role: "Lower", identity: "lower-b", resolve: resolveCurrentHypertrophyLowerBProgrammeGuidance }] as const;
describe("hypertrophy Upper/Lower programme certification", () => {
  it("constructs, hydrates and certifies the four-template policy", () => {
    const resolved = sessions.map((session) => ({ ...session, result: session.resolve({ ...base, sessionRole: session.role, sessionIdentity: session.identity }) }));
    expect(resolved.every((session) => session.result.status === "resolved")).toBe(true);
    const specification = constructCurrentProgrammeSpecification({ planId: "plan", mesocycleId: "meso", mesocyclePurpose: "hypertrophy", programmeId: "programme", purposePolicyVersion: "v1", creationSource: "new_current_plan", firstMicrocycleNumber: 1, sessionTemplates: resolved.map((session, templateIndex) => { if (session.result.status !== "resolved") throw new Error("policy unresolved"); return { id: `template-${session.identity}`, orderingKey: `${templateIndex + 1}-${session.identity}`, sessionRole: session.role, purpose: "hypertrophy", constructionPolicyVersion: "v1", prescriptionSlots: session.result.definitions.map((definition, slotIndex) => mapPolicySlotToD2Input(definition, `slot-${templateIndex}-${slotIndex}`)) }; }) });
    expect(specification.status).toBe("created"); if (specification.status !== "created") return;
    expect(hydrateCurrentMesocycleProgrammeSpecification(specification.specification).status).toBe("hydrated_current_programme");
    expect(specification.specification.sessionTemplates.map((template) => template.orderingKey)).toEqual(["1-upper-a", "2-lower-a", "3-upper-b", "4-lower-b"]);
    const slots = specification.specification.sessionTemplates.flatMap((template) => template.prescriptionSlots);
    expect(new Set(slots.map((slot) => slot.id)).size).toBe(slots.length);
    const targets = new Set([...slots.map((slot) => slot.targetId), ...slots.flatMap((slot) => slot.selectionConstraints)]);
    ["horizontal_press", "vertical_press", "horizontal_pull", "vertical_pull", "knee_dominant", "hip_hinge", "knee_flexion", "calves"].forEach((target) => expect(targets.has(target)).toBe(true));
    const totals = specification.specification.sessionTemplates.map((template) => template.prescriptionSlots.reduce((sum, slot) => ({ min: sum.min + slot.recommendedMinSets, max: sum.max + slot.recommendedMaxSets }), { min: 0, max: 0 }));
    expect(totals).toEqual([{ min: 16, max: 23 }, { min: 13, max: 19 }, { min: 16, max: 23 }, { min: 13, max: 19 }]);
    expect(totals.reduce((sum, total) => sum + total.max, 0)).toBe(84);
  });
  it("locks A/B priority differentiation", () => {
    const upperA = resolveCurrentHypertrophyProgrammeGuidance({ ...base, sessionRole: "Upper", sessionIdentity: "upper-a" }); const upperB = resolveCurrentHypertrophyUpperBProgrammeGuidance({ ...base, sessionRole: "Upper", sessionIdentity: "upper-b" }); const lowerA = resolveCurrentHypertrophyLowerProgrammeGuidance({ ...base, sessionRole: "Lower", sessionIdentity: "lower-a" }); const lowerB = resolveCurrentHypertrophyLowerBProgrammeGuidance({ ...base, sessionRole: "Lower", sessionIdentity: "lower-b" });
    expect(upperA.status === "resolved" && upperA.definitions[0]?.target.id).toBe("horizontal_press"); expect(upperB.status === "resolved" && upperB.definitions[0]?.target.id).toBe("vertical_pull"); expect(lowerA.status === "resolved" && lowerA.definitions[0]?.target.id).toBe("knee_dominant"); expect(lowerB.status === "resolved" && lowerB.definitions[0]?.target.id).toBe("hip_hinge");
  });
});
