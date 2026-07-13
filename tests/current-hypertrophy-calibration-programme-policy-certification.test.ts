import { describe, expect, it } from "vitest";

import {
  HYPERTROPHY_CALIBRATION_PROGRAMME_CERTIFICATION,
  certifyCurrentHypertrophyCalibrationProgrammePolicy,
} from "@/domain/training/current-hypertrophy-calibration-programme-policy-certification";
import { resolveCurrentHypertrophyCalibrationProgrammeGuidance } from "@/domain/training/current-hypertrophy-calibration-programme-guidance-policy";
import { mapPolicySlotToD2Input } from "@/domain/training/current-programme-guidance-policy-contracts";
import { constructCurrentProgrammeSpecification } from "@/domain/training/current-programme-specification-construction";
import {
  findProgrammePrescriptionSlot,
  findProgrammeSessionTemplate,
  hydrateCurrentMesocycleProgrammeSpecification,
} from "@/domain/training/current-programme-specification";

const policyInput = {
  schemaVersion: "v1" as const,
  goal: "build_muscle",
  experienceLevel: "intermediate" as const,
  trainingDays: 4,
  split: "upper_lower",
  mesocyclePurpose: "hypertrophy_calibration" as const,
  microcyclePriority: "normal_productive",
  equipmentCapabilities: ["full_gym"],
  constructionPolicyVersion: "v1",
  guidancePolicyVersion: "v1",
};

const sessions = [
  { role: "Upper", identity: "upper-a" },
  { role: "Lower", identity: "lower-a" },
  { role: "Upper", identity: "upper-b" },
  { role: "Lower", identity: "lower-b" },
] as const;

function resolvedSessions() {
  return sessions.map((session) => ({
    ...session,
    result: resolveCurrentHypertrophyCalibrationProgrammeGuidance({
      ...policyInput,
      sessionRole: session.role,
      sessionIdentity: session.identity,
    }),
  }));
}

function certificationInput(constructionVerified = true) {
  const resolved = resolvedSessions();
  if (resolved.some((session) => session.result.status !== "resolved")) throw new Error("policy unresolved");
  return {
    certificationVersion: "v1" as const,
    policyId: "intermediate_upper_lower_hypertrophy_calibration_v1" as const,
    policyVersion: "v1" as const,
    purpose: "hypertrophy_calibration" as const,
    programmeFamilyId: "intermediate_four_day_full_gym_upper_lower" as const,
    templateFamilyId: "upper_lower_ab_v1" as const,
    templateOrder: sessions.map((session) => session.identity),
    definitionsBySession: resolved.map((session) => ({
      sessionIdentity: session.identity,
      definitions: (session.result as Extract<typeof session.result, { status: "resolved" }>).definitions,
    })),
    evidenceCompatibility: "planned_roles_and_exact_targets" as const,
    constructionVerified,
  };
}

describe("hypertrophy-calibration programme-policy certification", () => {
  it("constructs and hydrates a four-template D2/D1 calibration programme with caller-supplied identity", () => {
    const resolved = resolvedSessions();
    const construction = constructCurrentProgrammeSpecification({
      planId: "calibration-plan",
      mesocycleId: "hypertrophy_calibration",
      mesocyclePurpose: "hypertrophy_calibration",
      programmeId: "calibration-programme",
      purposePolicyVersion: "v1",
      creationSource: "new_current_mesocycle",
      firstMicrocycleNumber: 1,
      sessionTemplates: resolved.map((session, templateIndex) => {
        if (session.result.status !== "resolved") throw new Error("policy unresolved");
        return {
          id: `calibration-template-${session.identity}`,
          orderingKey: `${templateIndex + 1}-${session.identity}`,
          sessionRole: session.role,
          purpose: "hypertrophy_calibration",
          constructionPolicyVersion: "hypertrophy_calibration_construction_v1",
          prescriptionSlots: session.result.definitions.map((definition, slotIndex) =>
            mapPolicySlotToD2Input(definition, `calibration-slot-${templateIndex}-${slotIndex}`),
          ),
        };
      }),
    });

    expect(construction.status).toBe("created");
    if (construction.status !== "created") return;
    const hydrated = hydrateCurrentMesocycleProgrammeSpecification(construction.specification);
    expect(hydrated.status).toBe("hydrated_current_programme");
    expect(construction.specification.sessionTemplates.map((template) => template.orderingKey)).toEqual([
      "1-upper-a",
      "2-lower-a",
      "3-upper-b",
      "4-lower-b",
    ]);

    const templates = construction.specification.sessionTemplates;
    const slots = templates.flatMap((template) => template.prescriptionSlots);
    expect(new Set(templates.map((template) => template.id)).size).toBe(4);
    expect(new Set(slots.map((slot) => slot.id)).size).toBe(slots.length);
    expect(slots.every((slot) => slot.programmeId === "calibration-programme" && slot.programmeVersion === 1 && slot.targetVersion === 1)).toBe(true);
    expect(slots.every((slot) => !("selectedExerciseId" in slot))).toBe(true);
    expect(resolved.flatMap((session) => session.result.status === "resolved" ? session.result.definitions : []).every((slot) => !("id" in slot))).toBe(true);

    const template = findProgrammeSessionTemplate(construction.specification, "calibration-template-upper-a");
    expect(template.status).toBe("found");
    const slot = findProgrammePrescriptionSlot(construction.specification, "calibration-template-upper-a", "calibration-slot-0-0");
    expect(slot.status).toBe("found");
    if (slot.status === "found") {
      const originalConstraint = slot.value.selectionConstraints[0];
      (slot.value.selectionConstraints as string[])[0] = "mutated";
      const reread = findProgrammePrescriptionSlot(construction.specification, "calibration-template-upper-a", "calibration-slot-0-0");
      expect(reread.status).toBe("found");
      if (reread.status === "found") {
        expect(reread.value.selectionConstraints[0]).toBe(originalConstraint);
        expect(reread.value.selectionConstraints).not.toContain("mutated");
      }
    }
  });

  it("certifies the exact calibration family only after the independent D2/D1 proof", () => {
    const result = certifyCurrentHypertrophyCalibrationProgrammePolicy(certificationInput());
    expect(result).toMatchObject({
      status: "certified_calibration_policy",
      certificationId: HYPERTROPHY_CALIBRATION_PROGRAMME_CERTIFICATION,
      certificationVersion: "v1",
    });
  });

  it.each([
    ["missing horizontal press", (value: any) => ({ ...value, definitionsBySession: value.definitionsBySession.map((session: any) => ({ ...session, definitions: session.definitions.filter((definition: any) => definition.target.id !== "horizontal_press") })) }), "incomplete_movement_coverage"],
    ["reintroduced biceps", (value: any) => ({ ...value, definitionsBySession: value.definitionsBySession.map((session: any, index: number) => index === 0 ? { ...session, definitions: [...session.definitions, { ...session.definitions[4], ordinal: "06-elbow-flexion", target: { domain: "movement_pattern", id: "elbow_flexion" } }] } : session) }), "invalid_optionality"],
    ["missing D2/D1 proof", (value: any) => ({ ...value, constructionVerified: false }), "invalid_programme"],
    ["wrong family", (value: any) => ({ ...value, programmeFamilyId: "beginner_family" }), "unsupported_family"],
  ])("rejects %s", (_name, change, status) => {
    expect(certifyCurrentHypertrophyCalibrationProgrammePolicy(change(certificationInput()) as any).status).toBe(status);
  });
});
