import type { OrdinaryShadowObservationPolicy } from "@/domain/training/ordinary-v2-shadow-observation";

export function resolveOrdinaryShadowObservationPolicy(env: Record<string, string | undefined> = process.env): OrdinaryShadowObservationPolicy {
  return env.EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION === "enabled" ? { enabled: true, timeoutMs: 20 } : { enabled: false, timeoutMs: 20 };
}
