import { describe, expect, it } from "vitest";
import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import { compareCanonicalMaterialPrescriptions } from "@/domain/training/canonical-material-prescription-delta";

describe("canonical material prescription semantic identity", () => {
  it.each([
    ["generated prescription id", (value: Session) => mutate(value, (slot, snapshot) => { snapshot.prescriptionId = "regenerated"; })],
    ["generated session id", (value: Session) => ({ ...value, id: "regenerated-session", prescriptionSnapshot: { ...value.prescriptionSnapshot, sessionId: "regenerated-session", operationalIdentity: "regenerated" } })],
    ["generated exercise instance id", (value: Session) => mutate(value, (slot) => { slot.exerciseInstanceId = "regenerated-exercise-instance"; })],
    ["generated slot id", (value: Session) => mutate(value, (slot) => { slot.id = "regenerated-slot"; slot.slotId = "regenerated-carrier"; })],
    ["timestamp", (value: Session) => mutate(value, (slot) => { (slot.progression as Record<string, unknown>).staleRevision = "2030-01-01T00:00:00.000Z"; })],
    ["revision metadata", (value: Session) => ({ ...value, revision: 99 })],
    ["display unit", (value: Session) => mutate(value, (slot) => { (slot.settings as Record<string, unknown>).unit = "lb"; })],
    ["presentation metadata", (value: Session) => mutate(value, (slot) => { (slot.methodStructure as Record<string, unknown>).executionLabel = "Regenerated label"; })],
    ["generated method group identity", (value: Session) => mutate(value, (_slot, snapshot) => {
      (snapshot.slots as Slot[]).forEach((slot) => { (slot.methodStructure as Record<string, unknown>).groupId = "regenerated-group"; });
    })],
  ])("ignores %s when it is the only difference", (_name, change) => {
    const before = session();
    expect(compareCanonicalMaterialPrescriptions([before as never], [change(before) as never])).toEqual({ status: "unchanged", deltas: [] });
  });

  it("normalises session and slot ordering without losing semantic pairing", () => {
    const left = [session(0, "push"), session(1, "pull")];
    const right = left.slice().reverse().map((item) => ({
      ...item,
      prescriptionSnapshot: {
        ...item.prescriptionSnapshot,
        slots: item.prescriptionSnapshot.slots.slice().reverse(),
      },
    }));
    expect(compareCanonicalMaterialPrescriptions(left as never, right as never)).toEqual({ status: "unchanged", deltas: [] });
  });

  it.each([
    ["exercise substitution", (slot: Slot) => { slot.exerciseId = "exercise-b"; }],
    ["sets", (slot: Slot) => { (slot.settings as Record<string, unknown>).requiredSets = 4; }],
    ["repetitions", (slot: Slot) => { slot.exactTargets = [9, 9, 9]; }],
    ["load", (slot: Slot) => { (slot.loadPrescription as Record<string, unknown>).prescribedBaseLoad = 72.5; }],
    ["rest", (slot: Slot) => { (slot.rest as Record<string, unknown>).seconds = 150; }],
    ["method", (slot: Slot) => { slot.method = "rest_pause"; }],
  ])("retains a genuine %s change", (_name, change) => {
    const before = session();
    const after = mutate(before, change);
    expect(compareCanonicalMaterialPrescriptions([before as never], [after as never])).toMatchObject({ status: "changed" });
  });

  it("is symmetric and deterministic", () => {
    const before = session();
    const after = mutate(before, (slot) => { (slot.rest as Record<string, unknown>).seconds = 180; });
    const forward = compareCanonicalMaterialPrescriptions([before as never], [after as never]);
    const reverse = compareCanonicalMaterialPrescriptions([after as never], [before as never]);
    expect(forward.status).toBe("changed");
    expect(reverse.status).toBe("changed");
    expect(forward.deltas.map((item) => item.field)).toEqual(reverse.deltas.map((item) => item.field));
    expect(compareCanonicalMaterialPrescriptions([before as never], [after as never])).toEqual(forward);
  });
});

type Slot = Record<string, unknown> & { exerciseId: string; exactTargets: number[] };
type Session = CanonicalPlannedSessionSnapshot & {
  prescriptionSnapshot: Record<string, unknown> & { slots: Slot[] };
};

function session(index = 0, role = "push"): Session {
  return {
    id: `generated-session-${index}`,
    microcycleId: "microcycle-1",
    role,
    planSessionIndex: index,
    status: "planned",
    kind: "planned",
    constructionVersion: "canonical_plan_v3",
    revision: 1,
    prescriptionSnapshot: {
      schemaVersion: "canonical_session_snapshot_v3",
      sessionId: `generated-session-${index}`,
      planSessionIndex: index,
      role,
      slots: [0, 1].map((slotIndex) => ({
        id: `generated-slot-${slotIndex}`,
        index: slotIndex,
        exerciseId: slotIndex ? "exercise-pair" : "exercise-a",
        lane: "hypertrophy",
        method: "antagonist_superset",
        methodStructure: { kind: "linked_pair", groupId: "generated-group", rounds: 3, executionLabel: "Generated" },
        exactTargets: [8, 8, 8],
        targetReps: 8,
        settings: { requiredSets: 3, unit: "kg" },
        loadPrescription: { state: "established", prescribedBaseLoad: 70, baseUnit: "kg", rounding: { increment: 2.5 } },
        prescribedLoad: 70,
        loadingMode: "rep_progression",
        rest: { seconds: 120, unit: "seconds", reason: "generated" },
        progression: { rule: "rep_progression", staleRevision: "2026-07-25T00:00:00.000Z" },
        stopRule: { threshold: 6 },
        substitutionConstraints: [],
      })),
    },
  } as Session;
}

function mutate(value: Session, change: (slot: Slot, snapshot: Record<string, unknown>) => void): Session {
  const copy = JSON.parse(JSON.stringify(value)) as Session;
  change(copy.prescriptionSnapshot.slots[0]!, copy.prescriptionSnapshot);
  return copy;
}
