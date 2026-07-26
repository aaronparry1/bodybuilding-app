import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";

export const CANONICAL_MATERIAL_PRESCRIPTION_DELTA_VERSION = "canonical_material_prescription_delta_v1" as const;

export type CanonicalMaterialPrescriptionDelta = Readonly<{
  schemaVersion: typeof CANONICAL_MATERIAL_PRESCRIPTION_DELTA_VERSION;
  sessionKey: string;
  slotKey?: string;
  field: string;
  before: unknown;
  after: unknown;
}>;

export type CanonicalMaterialPrescriptionComparison = Readonly<{
  status: "changed" | "unchanged";
  deltas: readonly CanonicalMaterialPrescriptionDelta[];
}>;

/**
 * Compares future prescription semantics, not regenerated carrier shape.
 * Generated ids, timestamps, revisions, provenance and display-only metadata
 * can never turn an application into a material coaching change.
 */
export function compareCanonicalMaterialPrescriptions(
  before: readonly CanonicalPlannedSessionSnapshot[],
  after: readonly CanonicalPlannedSessionSnapshot[],
): CanonicalMaterialPrescriptionComparison {
  const prior = new Map(before.map((session) => [sessionKey(session), projectSession(session)]));
  const next = new Map(after.map((session) => [sessionKey(session), projectSession(session)]));
  const deltas: CanonicalMaterialPrescriptionDelta[] = [];
  const keys = [...new Set([...prior.keys(), ...next.keys()])].sort();

  for (const key of keys) {
    const left = prior.get(key);
    const right = next.get(key);
    if (!left || !right) {
      deltas.push(delta(key, undefined, "session", left ?? null, right ?? null));
      continue;
    }
    compareValue(key, undefined, "", left, right, deltas);
  }

  return { status: deltas.length ? "changed" : "unchanged", deltas };
}

function sessionKey(session: CanonicalPlannedSessionSnapshot): string {
  return `${session.planSessionIndex}:${session.role}:${session.kind}`;
}

function projectSession(session: CanonicalPlannedSessionSnapshot): unknown {
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots)
    ? (snapshot.slots as Array<Record<string, unknown>>)
      .slice()
      .sort((left, right) => Number(left.index) - Number(right.index))
      .map(projectSlot)
    : [];
  return {
    role: session.role,
    kind: session.kind,
    sessionPurpose: snapshot.sessionPurpose ?? snapshot.purpose ?? null,
    slots,
  };
}

function projectSlot(slot: Record<string, unknown>): unknown {
  return {
    slotKey: `${Number(slot.index)}:${String(slot.exerciseId)}`,
    index: slot.index,
    exerciseId: slot.exerciseId,
    lane: slot.lane,
    method: slot.method,
    methodStructure: materialObject(slot.methodStructure),
    exactTargets: slot.exactTargets,
    targetReps: slot.targetReps,
    settings: materialObject(slot.settings),
    loadPrescription: materialLoadPrescription(slot.loadPrescription),
    prescribedLoad: slot.prescribedLoad,
    loadingMode: slot.loadingMode,
    rest: materialObject(slot.rest),
    progression: materialObject(slot.progression),
    stopRule: materialObject(slot.stopRule),
    substitutionConstraints: slot.substitutionConstraints,
  };
}

function materialLoadPrescription(value: unknown): unknown {
  if (!value || typeof value !== "object") return value ?? null;
  const item = value as Record<string, unknown>;
  return materialObject({
    state: item.state,
    prescribedBaseLoad: item.prescribedBaseLoad,
    baseUnit: item.baseUnit,
    loadingMode: item.loadingMode,
    rounding: item.rounding,
    target: item.target,
    targetRange: item.targetRange,
    calibration: item.calibration,
    autoregulation: item.autoregulation,
  });
}

function materialObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(materialObject);
  if (!value || typeof value !== "object") return value ?? null;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key, item]) => item !== undefined && !["id", "version", "createdAt", "updatedAt", "staleRevision", "provenance", "reason", "label", "displayName", "unit"].includes(key))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, materialObject(item)]),
  );
}

function compareValue(
  session: string,
  slot: string | undefined,
  path: string,
  before: unknown,
  after: unknown,
  output: CanonicalMaterialPrescriptionDelta[],
): void {
  if (JSON.stringify(before) === JSON.stringify(after)) return;
  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    for (let index = 0; index < length; index += 1) compareValue(session, slot, `${path}[${index}]`, before[index], after[index], output);
    return;
  }
  if (isRecord(before) && isRecord(after)) {
    const nextSlot = typeof after.slotKey === "string" ? after.slotKey : typeof before.slotKey === "string" ? before.slotKey : slot;
    for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => key !== "slotKey").sort()) {
      compareValue(session, nextSlot, path ? `${path}.${key}` : key, before[key], after[key], output);
    }
    return;
  }
  output.push(delta(session, slot, path || "prescription", before ?? null, after ?? null));
}

function delta(sessionKeyValue: string, slotKey: string | undefined, field: string, before: unknown, after: unknown): CanonicalMaterialPrescriptionDelta {
  return {
    schemaVersion: CANONICAL_MATERIAL_PRESCRIPTION_DELTA_VERSION,
    sessionKey: sessionKeyValue,
    ...(slotKey ? { slotKey } : {}),
    field,
    before,
    after,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
