import { jsonStore } from "@/data/local/json-store";
import { parseCanonicalActivePlan, serializeCanonicalActivePlan, type CanonicalActivePlanCarrier, type CanonicalCarrierValidation } from "@/domain/training/canonical-active-plan-carrier";

const key = "iron-logic.canonical-active-plan-v2";

export type CanonicalPlanRepositoryResult =
  | Readonly<{ status: "saved"; carrier: CanonicalActivePlanCarrier }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "invalid"; reason: string }>;

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
  clear(): void { jsonStore.remove(key); },
};

export function validateCanonicalPlanRepositoryInput(value: unknown): CanonicalCarrierValidation { return parseCanonicalActivePlan(JSON.stringify(value)); }
