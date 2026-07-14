import { jsonStore } from "@/data/local/json-store";
import { compareCanonicalActivePlans, parseCanonicalActivePlan, serializeCanonicalActivePlan, type CanonicalActivePlanCarrier, type CanonicalCarrierValidation } from "@/domain/training/canonical-active-plan-carrier";

const key = "iron-logic.canonical-active-plan-v2";

export type CanonicalOpaqueStorage = Readonly<{ read(): string | null; write(value: string): void; remove(): void }>;
const defaultStorage: CanonicalOpaqueStorage = { read: () => jsonStore.get<string | null>(key, null), write: (value) => jsonStore.set(key, value), remove: () => jsonStore.remove(key) };

export type CanonicalPlanRepositoryResult =
  | Readonly<{ status: "saved"; carrier: CanonicalActivePlanCarrier }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "invalid"; reason: string }>;

export type CanonicalAtomicWriteResult = CanonicalPlanRepositoryResult | Readonly<{ status: "conflict"; reason: "stale_revision" | "same_revision_different_content" }>;

export function createCanonicalActivePlanV2Repository(storage: CanonicalOpaqueStorage = defaultStorage) {
  const repository = {
  get(): CanonicalPlanRepositoryResult {
    let raw: string | null;
    try { raw = storage.read(); } catch { return { status: "invalid", reason: "storage_read_failed" }; }
    if (!raw) return { status: "missing" };
    const parsed = parseCanonicalActivePlan(raw);
    return parsed.status === "valid" ? { status: "saved", carrier: parsed.carrier } : { status: "invalid", reason: parsed.reason };
  },
  save(carrier: CanonicalActivePlanCarrier): CanonicalPlanRepositoryResult {
    try {
      const serialized = serializeCanonicalActivePlan(carrier);
      storage.write(serialized);
      const readBack = this.get();
      if (readBack.status !== "saved" || readBack.carrier.planId !== carrier.planId || readBack.carrier.revision !== carrier.revision) return { status: "invalid", reason: "read_back_mismatch" };
      return readBack;
    } catch (error) {
      return { status: "invalid", reason: error instanceof Error ? error.message : "serialization_failed" };
    }
  },
  saveAtomically(carrier: CanonicalActivePlanCarrier, expectedRevision?: number): CanonicalAtomicWriteResult {
    const previous = this.get();
    if (expectedRevision !== undefined && previous.status === "saved" && previous.carrier.revision !== expectedRevision) return { status: "conflict", reason: "stale_revision" };
    if (previous.status === "saved" && previous.carrier.revision === carrier.revision) {
      return compareCanonicalActivePlans(previous.carrier, carrier).status === "equivalent" ? previous : { status: "conflict", reason: "same_revision_different_content" };
    }
    let previousRaw: string | null;
    try { previousRaw = storage.read(); } catch { return { status: "invalid", reason: "storage_read_failed" }; }
    try {
      const serialized = serializeCanonicalActivePlan(carrier);
      storage.write(serialized);
      const readBack = this.get();
      if (readBack.status !== "saved" || compareCanonicalActivePlans(readBack.carrier, carrier).status !== "equivalent") throw new Error("read_back_mismatch");
      return readBack;
    } catch (error) {
      try { if (previousRaw === null) storage.remove(); else storage.write(previousRaw); } catch { return { status: "invalid", reason: "rollback_failed" }; }
      return { status: "invalid", reason: error instanceof Error ? error.message : "atomic_write_failed" };
    }
  },
  clear(): void { storage.remove(); },
  };
  return repository;
}

export const canonicalActivePlanV2Repository = createCanonicalActivePlanV2Repository();

export function validateCanonicalPlanRepositoryInput(value: unknown): CanonicalCarrierValidation { return parseCanonicalActivePlan(JSON.stringify(value)); }
