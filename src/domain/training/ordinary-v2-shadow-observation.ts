import { encodeOrdinaryV2BoundaryEvent, type OrdinaryV2BoundaryEvent } from "@/domain/training/ordinary-v2-readiness";

export type OrdinaryShadowObservationPolicy = Readonly<{ enabled: boolean; timeoutMs: number }>;
export const ORDINARY_SHADOW_OBSERVATION_DISABLED: OrdinaryShadowObservationPolicy = Object.freeze({ enabled: false, timeoutMs: 20 });
export type OrdinaryShadowObservationInput<T> = Readonly<{ family: string; role: string; production: T; shadow: () => { classification: "aligned" | "acceptable_difference" | "risky_difference" | "blocked" | "unavailable"; reasonCode: string } | null; emit?: (event: OrdinaryV2BoundaryEvent) => void }>;

export function observeOrdinaryV2Shadow<T>(input: OrdinaryShadowObservationInput<T>, policy: OrdinaryShadowObservationPolicy = ORDINARY_SHADOW_OBSERVATION_DISABLED): T {
  if (!policy.enabled || !["primary_compound", "secondary_compound", "accessory"].includes(input.role) || input.family !== "ordinary") return input.production;
  try {
    const started = Date.now();
    const result = input.shadow();
    const outcome = result?.classification === "aligned" ? "v2_canary_selected" : "production_fallback";
    const event = encodeOrdinaryV2BoundaryEvent({ outcome, reasonCode: result?.reasonCode ?? "shadow_unavailable", family: "ordinary", role: input.role, authority: "production", durationBucket: Date.now() - started, evidenceSource: "real_user_shadow" });
    try { input.emit?.(event); } catch { /* telemetry is best-effort */ }
  } catch {
    try { input.emit?.(encodeOrdinaryV2BoundaryEvent({ outcome: "exception_fallback", reasonCode: "shadow_exception", family: "ordinary", role: input.role, authority: "production" })); } catch { /* never affect production */ }
  }
  return input.production;
}
