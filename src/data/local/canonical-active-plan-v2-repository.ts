import { jsonStore } from "@/data/local/json-store";
import { compareCanonicalActivePlans, parseCanonicalActivePlan, serializeCanonicalActivePlan, type CanonicalActivePlanCarrier, type CanonicalCarrierValidation } from "@/domain/training/canonical-active-plan-carrier";

const key = "iron-logic.canonical-active-plan-v2";

export type CanonicalPlanRepositoryResult =
  | Readonly<{ status: "saved"; carrier: CanonicalActivePlanCarrier }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "invalid"; reason: string }>;

export type CanonicalAtomicWriteResult = CanonicalPlanRepositoryResult | Readonly<{ status: "conflict"; reason: "stale_revision" | "same_revision_different_content" }>;

export const canonicalActivePlanV2Repository = {
  get(): CanonicalPlanRepositoryResult {
    const raw = jsonStore.get<string | null>(key, null);
    if (!raw) return { status: "missing" };
    const parsed = parseCanonicalActivePlan(raw);
    return parsed.status === "valid" ? { status: "saved", carrier: parsed.carrier } : { status: "invalid", reason: parsed.reason };
  },
  save(carrier: CanonicalActivePlanCarrier): CanonicalPlanRepositoryResult {
    try {
      const serialized = serializeCanonicalActivePlan(carrier);
      jsonStore.set(key, serialized);
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
    const previousRaw = jsonStore.get<string | null>(key, null);
    try {
      const serialized = serializeCanonicalActivePlan(carrier);
      jsonStore.set(key, serialized);
      const readBack = this.get();
      if (readBack.status !== "saved" || compareCanonicalActivePlans(readBack.carrier, carrier).status !== "equivalent") throw new Error("read_back_mismatch");
      return readBack;
    } catch (error) {
      if (previousRaw === null) jsonStore.remove(key); else jsonStore.set(key, previousRaw);
      return { status: "invalid", reason: error instanceof Error ? error.message : "atomic_write_failed" };
    }
  },
  clear(): void { jsonStore.remove(key); },
};

export function validateCanonicalPlanRepositoryInput(value: unknown): CanonicalCarrierValidation { return parseCanonicalActivePlan(JSON.stringify(value)); }
