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
  status: "changed" | "unchanged" | "ambiguous";
  deltas: readonly CanonicalMaterialPrescriptionDelta[];
  reason?: "grouped_method_semantics_ambiguous";
  ambiguousPaths?: readonly string[];
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
  const ambiguousPaths = [...prior, ...next]
    .flatMap(([key, projection]) => projection.ambiguousPaths.map((path) => `${key}:${path}`))
    .sort();
  if (ambiguousPaths.length) {
    return {
      status: "ambiguous",
      deltas: [],
      reason: "grouped_method_semantics_ambiguous",
      ambiguousPaths,
    };
  }

  for (const key of keys) {
    const left = prior.get(key)?.value;
    const right = next.get(key)?.value;
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

function projectSession(session: CanonicalPlannedSessionSnapshot): Readonly<{ value: unknown; ambiguousPaths: readonly string[] }> {
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const sourceSlots = Array.isArray(snapshot.slots)
    ? (snapshot.slots as Array<Record<string, unknown>>)
      .slice()
      .sort((left, right) => Number(left.index) - Number(right.index))
    : [];
  const grouping = deriveSemanticGroupMembership(sourceSlots);
  const slots = sourceSlots.map((slot, index) => projectSlot(slot, grouping.membersBySlotIndex.get(index)));
  return {
    value: {
      role: session.role,
      kind: session.kind,
      sessionPurpose: snapshot.sessionPurpose ?? snapshot.purpose ?? null,
      slots,
    },
    ambiguousPaths: grouping.ambiguousPaths,
  };
}

function projectSlot(slot: Record<string, unknown>, semanticGroupMembers?: readonly string[]): unknown {
  const structure = isRecord(slot.methodStructure) ? slot.methodStructure : {};
  const projectedStructure = materialObject(structure);
  return {
    slotKey: `${Number(slot.index)}:${String(slot.exerciseId)}`,
    index: slot.index,
    exerciseId: slot.exerciseId,
    lane: slot.lane,
    method: slot.method,
    methodStructure: isRecord(projectedStructure) && semanticGroupMembers
      ? { ...projectedStructure, semanticGroupMembers: [...semanticGroupMembers] }
      : projectedStructure,
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

function deriveSemanticGroupMembership(slots: readonly Record<string, unknown>[]): Readonly<{
  membersBySlotIndex: ReadonlyMap<number, readonly string[]>;
  ambiguousPaths: readonly string[];
}> {
  const membersBySlotIndex = new Map<number, readonly string[]>();
  const ambiguousPaths: string[] = [];
  const consumed = new Set<number>();

  for (let index = 0; index < slots.length; index += 1) {
    if (consumed.has(index)) continue;
    const slot = slots[index]!;
    const structure = isRecord(slot.methodStructure) ? slot.methodStructure : {};
    if (!isGroupedStructure(structure)) continue;

    const groupSize = positiveInteger(structure.groupSize)
      ?? (structure.kind === "linked_pair" ? 2 : undefined);
    const position = positiveInteger(structure.position)
      ?? (structure.kind === "linked_pair" ? 1 : undefined);

    if (groupSize && position === 1) {
      const candidates = slots.slice(index, index + groupSize);
      const valid = candidates.length === groupSize
        && candidates.every((candidate, offset) => {
          const candidateStructure = isRecord(candidate.methodStructure) ? candidate.methodStructure : {};
          const candidateSize = positiveInteger(candidateStructure.groupSize)
            ?? (candidateStructure.kind === "linked_pair" ? 2 : undefined);
          const candidatePosition = positiveInteger(candidateStructure.position)
            ?? (candidateStructure.kind === "linked_pair" ? offset + 1 : undefined);
          return isGroupedStructure(candidateStructure)
            && candidateSize === groupSize
            && candidatePosition === offset + 1
            && candidateStructure.kind === structure.kind
            && candidateStructure.method === structure.method;
        });
      if (valid) {
        const members = candidates.map((candidate) => semanticSlotMember(candidate));
        candidates.forEach((_candidate, offset) => {
          membersBySlotIndex.set(index + offset, members);
          consumed.add(index + offset);
        });
        continue;
      }
    }

    const groupId = typeof structure.groupId === "string" && structure.groupId ? structure.groupId : undefined;
    if (groupId) {
      const groupedIndexes = slots.flatMap((candidate, candidateIndex) => {
        const candidateStructure = isRecord(candidate.methodStructure) ? candidate.methodStructure : {};
        return candidateStructure.groupId === groupId ? [candidateIndex] : [];
      });
      if (groupedIndexes.length > 0) {
        const ordered = groupedIndexes
          .slice()
          .sort((left, right) => {
            const leftStructure = isRecord(slots[left]!.methodStructure) ? slots[left]!.methodStructure as Record<string, unknown> : {};
            const rightStructure = isRecord(slots[right]!.methodStructure) ? slots[right]!.methodStructure as Record<string, unknown> : {};
            return (positiveInteger(leftStructure.position) ?? left) - (positiveInteger(rightStructure.position) ?? right);
          });
        const members = ordered.map((candidateIndex) => semanticSlotMember(slots[candidateIndex]!));
        ordered.forEach((candidateIndex) => {
          membersBySlotIndex.set(candidateIndex, members);
          consumed.add(candidateIndex);
        });
        continue;
      }
    }

    ambiguousPaths.push(`slots[${index}].methodStructure`);
  }

  return { membersBySlotIndex, ambiguousPaths: [...new Set(ambiguousPaths)].sort() };
}

function isGroupedStructure(value: Readonly<Record<string, unknown>>): boolean {
  return value.kind === "linked_rounds"
    || value.kind === "linked_pair"
    || positiveInteger(value.groupSize) !== undefined
    || positiveInteger(value.position) !== undefined;
}

function positiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

function semanticSlotMember(slot: Readonly<Record<string, unknown>>): string {
  return `${Number(slot.index)}:${String(slot.exerciseId)}`;
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
      .filter(([key, item]) => item !== undefined && !NON_MATERIAL_KEYS.has(key))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, materialObject(item)]),
  );
}

const NON_MATERIAL_KEYS = new Set([
  "id",
  "version",
  "revision",
  "staleRevision",
  "createdAt",
  "updatedAt",
  "generatedAt",
  "timestamp",
  "sessionId",
  "prescriptionId",
  "exerciseInstanceId",
  "slotId",
  "carrierId",
  "operationalIdentity",
  "groupId",
  "provenance",
  "reason",
  "reasonCodes",
  "label",
  "displayName",
  "executionLabel",
  "pairedExerciseName",
  "unit",
]);

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
