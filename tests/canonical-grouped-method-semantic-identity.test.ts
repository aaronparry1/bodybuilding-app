import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { validateCanonicalActivePlan, type CanonicalActivePlanCarrier, type CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import { compareCanonicalMaterialPrescriptions } from "@/domain/training/canonical-material-prescription-delta";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical grouped-method semantic identity", () => {
  it.each([
    ["different group IDs", (carrier: CanonicalActivePlanCarrier) => regenerateGroupIds(carrier, "different")],
    ["group IDs removed from candidate", (carrier: CanonicalActivePlanCarrier) => removeGroupIds(carrier)],
    ["all generated group IDs regenerated", (carrier: CanonicalActivePlanCarrier) => regenerateGroupIds(carrier, "all")],
    ["generated session slot exercise-instance and group IDs", (carrier: CanonicalActivePlanCarrier) => regenerateAllIds(carrier)],
    ["timestamps and revisions with group churn", (carrier: CanonicalActivePlanCarrier) => regenerateMetadata(carrier)],
    ["nested grouped-method objects regenerated", (carrier: CanonicalActivePlanCarrier) => regenerateNestedStructures(carrier)],
    ["partially missing optional legacy identities", (carrier: CanonicalActivePlanCarrier) => removeOptionalLegacyIdentities(carrier)],
    ["restart round trip before comparison", (carrier: CanonicalActivePlanCarrier) => restartRoundTrip(removeGroupIds(carrier))],
    ["display unit with group churn", (carrier: CanonicalActivePlanCarrier) => changeDisplayUnits(carrier)],
    ["rounded request swallowed with group churn", (carrier: CanonicalActivePlanCarrier) => addSwallowedProposal(carrier)],
  ])("normalises %s as no change", (_name, mutate) => {
    const original = groupedCarrier();
    const candidate = mutate(structuredClone(original));
    expect(validateCanonicalActivePlan(original).status).toBe("valid");
    expect(validateCanonicalActivePlan(candidate).status).toBe("valid");
    expect(compareCanonicalMaterialPrescriptions(original.plannedSessions, candidate.plannedSessions)).toEqual({ status: "unchanged", deltas: [] });
    expect(compareCanonicalMaterialPrescriptions(candidate.plannedSessions, original.plannedSessions)).toEqual({ status: "unchanged", deltas: [] });
  });

  it("normalises group IDs absent from committed, candidate, or both", () => {
    const complete = groupedCarrier();
    const absent = removeGroupIds(structuredClone(complete));
    expect(compareCanonicalMaterialPrescriptions(absent.plannedSessions, complete.plannedSessions)).toEqual({ status: "unchanged", deltas: [] });
    expect(compareCanonicalMaterialPrescriptions(complete.plannedSessions, absent.plannedSessions)).toEqual({ status: "unchanged", deltas: [] });
    expect(compareCanonicalMaterialPrescriptions(absent.plannedSessions, structuredClone(absent).plannedSessions)).toEqual({ status: "unchanged", deltas: [] });
  });

  it.each([
    ["member removed", (pair: GroupPair) => { pair.session.prescriptionSnapshot.slots.splice(pair.rightIndex, 1); }, /slots|semanticGroupMembers/],
    ["member reordered", (pair: GroupPair) => {
      const left = structure(pair.left);
      const right = structure(pair.right);
      left.position = 2;
      right.position = 1;
    }, /position|semanticGroupMembers/],
    ["group size", (pair: GroupPair) => { structure(pair.left).groupSize = 3; structure(pair.right).groupSize = 3; }, /groupSize/],
    ["exercise substitution", (pair: GroupPair) => { pair.left.exerciseId = "ex-incline-dumbbell-press"; }, /exerciseId|semanticGroupMembers/],
    ["rounds", (pair: GroupPair) => { structure(pair.left).rounds = Number(structure(pair.left).rounds) + 1; }, /rounds/],
    ["between exercise rest", (pair: GroupPair) => { structure(pair.left).intraMethodRestSeconds = 15; }, /intraMethodRestSeconds/],
    ["between round rest", (pair: GroupPair) => { structure(pair.left).interRoundRestSeconds = 90; }, /interRoundRestSeconds/],
    ["method", (pair: GroupPair) => { pair.left.method = "straight_sets"; structure(pair.left).method = "straight_sets"; }, /method/],
    ["execution policy", (pair: GroupPair) => { structure(pair.left).policyId = "different_policy"; }, /policyId/],
    ["member position", (pair: GroupPair) => { structure(pair.left).position = 2; }, /position|semanticGroupMembers/],
  ])("detects genuine %s changes", (_name, change, expected) => {
    const before = groupedCarrier();
    const after = structuredClone(before);
    change(firstGroup(after));
    const forward = compareCanonicalMaterialPrescriptions(before.plannedSessions, after.plannedSessions);
    const reverse = compareCanonicalMaterialPrescriptions(after.plannedSessions, before.plannedSessions);
    expect(forward.status, JSON.stringify(forward)).toBe("changed");
    expect(reverse.status, JSON.stringify(reverse)).toBe("changed");
    expect(forward.deltas.some((delta) => expected.test(delta.field))).toBe(true);
    expect(forward.deltas.map((delta) => delta.field)).toEqual(reverse.deltas.map((delta) => delta.field));
  });

  it("detects a semantic change despite complete generated-ID churn", () => {
    const before = groupedCarrier();
    const after = regenerateAllIds(structuredClone(before));
    structure(firstGroup(after).left).rounds = 4;
    const result = compareCanonicalMaterialPrescriptions(before.plannedSessions, after.plannedSessions);
    expect(result.status).toBe("changed");
    expect(result.deltas.map((delta) => delta.field)).toContain("slots[1].methodStructure.rounds");
    expect(result.deltas.some((delta) => delta.field.includes("groupId"))).toBe(false);
  });

  it("detects a grouped member addition in the reverse direction", () => {
    const withMember = groupedCarrier();
    const withoutMember = structuredClone(withMember);
    const pair = firstGroup(withoutMember);
    pair.session.prescriptionSnapshot.slots.splice(pair.rightIndex, 1);
    const result = compareCanonicalMaterialPrescriptions(withoutMember.plannedSessions, withMember.plannedSessions);
    expect(result.status).toBe("changed");
    expect(result.deltas.some((delta) => /slots|semanticGroupMembers/.test(delta.field))).toBe(true);
  });

  it("detects two structurally distinct groups being merged", () => {
    const split = carrierWithTwoGroups();
    const merged = structuredClone(split);
    mergeFirstTwoGroups(merged);
    expect(validateCanonicalActivePlan(split).status).toBe("valid");
    expect(validateCanonicalActivePlan(merged).status).toBe("valid");
    const result = compareCanonicalMaterialPrescriptions(split.plannedSessions, merged.plannedSessions);
    expect(result.status).toBe("changed");
    expect(result.deltas.some((delta) => /groupSize|position|semanticGroupMembers/.test(delta.field))).toBe(true);
  });

  it("detects one semantic group being split", () => {
    const split = carrierWithTwoGroups();
    const merged = mergeFirstTwoGroups(structuredClone(split));
    const result = compareCanonicalMaterialPrescriptions(merged.plannedSessions, split.plannedSessions);
    expect(result.status).toBe("changed");
    expect(result.deltas.some((delta) => /groupSize|position|semanticGroupMembers/.test(delta.field))).toBe(true);
  });

  it("fails closed when surviving grouped structure cannot establish membership", () => {
    const before = groupedCarrier();
    const ambiguous = removeGroupIds(structuredClone(before));
    const pair = firstGroup(ambiguous);
    delete structure(pair.left).position;
    delete structure(pair.left).groupSize;
    const result = compareCanonicalMaterialPrescriptions(before.plannedSessions, ambiguous.plannedSessions);
    expect(result).toMatchObject({
      status: "ambiguous",
      deltas: [],
      reason: "grouped_method_semantics_ambiguous",
    });
  });
});

type MutableSlot = Record<string, unknown> & { index: number; exerciseId: string; method: string; methodStructure?: Record<string, unknown> };
type MutableSession = Omit<CanonicalPlannedSessionSnapshot, "prescriptionSnapshot"> & {
  prescriptionSnapshot: Record<string, unknown> & { slots: MutableSlot[] };
};
type GroupPair = { session: MutableSession; left: MutableSlot; right: MutableSlot; leftIndex: number; rightIndex: number };

function groupedCarrier(): CanonicalActivePlanCarrier {
  const result = constructCanonicalActivePlanFromCanonicalInputs({
    planId: "grouped-semantic-certification",
    createdAt: "2026-07-26T08:00:00.000Z",
    updatedAt: "2026-07-26T08:00:00.000Z",
    goal: "strength_hypertrophy",
    macrocycleGoal: "build_muscle_and_strength",
    experienceLevel: "intermediate",
    daysPerWeek: 5,
    preferredSplit: "let_app_choose",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    selectedMesocycleId: "powerbuilding_hypertrophy",
    microcycleSequenceNumber: 4,
    exercises: exerciseLibrary,
    limitations: [],
    exercisePreferences: {},
    history: [],
    establishedLoads: Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 60])),
    loadEvidence: {},
  });
  if (result.status !== "constructed") throw new Error(result.reason);
  expect(allGroupSlots(result.carrier).length).toBeGreaterThan(0);
  return result.carrier;
}

function allGroupSlots(carrier: CanonicalActivePlanCarrier): MutableSlot[] {
  return carrier.plannedSessions.flatMap((session) =>
    ((session.prescriptionSnapshot as Record<string, unknown>).slots as MutableSlot[])
      .filter((slot) => structure(slot).kind === "linked_rounds"));
}

function firstGroup(carrier: CanonicalActivePlanCarrier): GroupPair {
  for (const sessionValue of carrier.plannedSessions) {
    const session = sessionValue as MutableSession;
    const leftIndex = session.prescriptionSnapshot.slots.findIndex((slot) => structure(slot).kind === "linked_rounds" && structure(slot).position === 1);
    if (leftIndex >= 0) {
      return {
        session,
        left: session.prescriptionSnapshot.slots[leftIndex]!,
        right: session.prescriptionSnapshot.slots[leftIndex + 1]!,
        leftIndex,
        rightIndex: leftIndex + 1,
      };
    }
  }
  throw new Error("group pair missing");
}

function structure(slot: MutableSlot): Record<string, unknown> {
  return slot.methodStructure ?? {};
}

function removeGroupIds(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  allGroupSlots(carrier).forEach((slot) => { delete structure(slot).groupId; });
  return carrier;
}

function regenerateGroupIds(carrier: CanonicalActivePlanCarrier, suffix: string): CanonicalActivePlanCarrier {
  const remap = new Map<string, string>();
  allGroupSlots(carrier).forEach((slot) => {
    const prior = String(structure(slot).groupId);
    if (!remap.has(prior)) remap.set(prior, `regenerated:${suffix}:${remap.size}`);
    structure(slot).groupId = remap.get(prior);
  });
  return carrier;
}

function regenerateAllIds(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  regenerateGroupIds(carrier, "all");
  carrier.plannedSessions.forEach((sessionValue, sessionIndex) => {
    const session = sessionValue as MutableSession;
    (session as { id: string }).id = `regenerated-session-${sessionIndex}`;
    session.prescriptionSnapshot.sessionId = `regenerated-session-${sessionIndex}`;
    session.prescriptionSnapshot.slots.forEach((slot, slotIndex) => {
      slot.id = `regenerated-slot-${sessionIndex}-${slotIndex}`;
      slot.slotId = `regenerated-slot-${sessionIndex}-${slotIndex}`;
      slot.exerciseInstanceId = `regenerated-exercise-${sessionIndex}-${slotIndex}`;
    });
  });
  return carrier;
}

function regenerateMetadata(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  regenerateGroupIds(carrier, "metadata");
  carrier.plannedSessions.forEach((sessionValue) => {
    const session = sessionValue as MutableSession;
    (session as { revision: number }).revision += 10;
    session.prescriptionSnapshot.updatedAt = "2027-01-01T00:00:00.000Z";
    session.prescriptionSnapshot.slots.forEach((slot) => { structure(slot).generatedAt = "2027-01-01T00:00:00.000Z"; });
  });
  return carrier;
}

function regenerateNestedStructures(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  regenerateGroupIds(carrier, "nested");
  allGroupSlots(carrier).forEach((slot) => {
    slot.methodStructure = Object.fromEntries(Object.entries(structure(slot)).reverse());
  });
  return carrier;
}

function changeDisplayUnits(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  regenerateGroupIds(carrier, "units");
  carrier.plannedSessions.forEach((sessionValue) => {
    const session = sessionValue as MutableSession;
    session.prescriptionSnapshot.slots.forEach((slot) => {
      slot.settings = { ...(slot.settings as Record<string, unknown>), unit: "lb" };
    });
  });
  return carrier;
}

function addSwallowedProposal(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  regenerateGroupIds(carrier, "rounded");
  allGroupSlots(carrier).forEach((slot) => {
    slot.proposedUnroundedLoad = 61.1;
    slot.reason = "rounded_to_existing_60";
  });
  return carrier;
}

function removeOptionalLegacyIdentities(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  removeGroupIds(carrier);
  carrier.plannedSessions.forEach((sessionValue) => {
    const session = sessionValue as MutableSession;
    session.prescriptionSnapshot.slots.forEach((slot) => {
      delete slot.slotId;
      delete slot.exerciseInstanceId;
    });
  });
  return carrier;
}

function restartRoundTrip(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  return JSON.parse(JSON.stringify(carrier)) as CanonicalActivePlanCarrier;
}

function carrierWithTwoGroups(): CanonicalActivePlanCarrier {
  const carrier = groupedCarrier();
  const pair = firstGroup(carrier);
  const semanticExercises = pair.session.prescriptionSnapshot.slots.slice(0, 4).map((slot) => slot.exerciseId);
  const source = [pair.left, pair.right, pair.left, pair.right];
  pair.session.prescriptionSnapshot.slots = source.map((slot, index) => {
    const copy = structuredClone(slot);
    copy.id = `two-groups:slot:${index}`;
    copy.index = index;
    copy.exerciseId = semanticExercises[index] ?? copy.exerciseId;
    copy.method = "antagonist_superset";
    copy.methodStructure = {
      ...structure(copy),
      kind: "linked_rounds",
      method: "antagonist_superset",
      groupId: `two-groups:${Math.floor(index / 2)}`,
      groupSize: 2,
      position: index % 2 + 1,
    };
    return copy;
  });
  return carrier;
}

function mergeFirstTwoGroups(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanCarrier {
  const session = firstGroup(carrier).session;
  session.prescriptionSnapshot.slots.forEach((slot, index) => {
    slot.method = "antagonist_superset";
    slot.methodStructure = {
      ...structure(slot),
      kind: "linked_rounds",
      method: "antagonist_superset",
      groupId: "merged-generated-id",
      groupSize: 4,
      position: index + 1,
    };
  });
  return carrier;
}
