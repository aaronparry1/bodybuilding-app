import { describe, expect, it } from "vitest";
import { observeOrdinaryV2Shadow, ORDINARY_SHADOW_OBSERVATION_DISABLED } from "@/domain/training/ordinary-v2-shadow-observation";

const production = { lane: "hypertrophy", min: 10, max: 15 };

describe("D4E3C4E3C ordinary production shadow observation", () => {
  it("is disabled by default and preserves production output", () => {
    let called = false;
    expect(observeOrdinaryV2Shadow({ family: "ordinary", role: "accessory", production, shadow: () => { called = true; return { classification: "aligned", reasonCode: "aligned" }; } })).toBe(production);
    expect(called).toBe(false);
    expect(ORDINARY_SHADOW_OBSERVATION_DISABLED.enabled).toBe(false);
  });
  it("observes only with explicit policy and always returns production", () => {
    const events: unknown[] = [];
    const result = observeOrdinaryV2Shadow({ family: "ordinary", role: "primary_compound", production, shadow: () => ({ classification: "risky_difference", reasonCode: "authority_difference" }), emit: (event) => events.push(event) }, { enabled: true, timeoutMs: 20 });
    expect(result).toBe(production); expect(events).toHaveLength(1); expect((events[0] as any).authority).toBe("production");
  });
  it.each(["power", "override", "unknown"])("excludes uncertified family %s", (family) => expect(observeOrdinaryV2Shadow({ family, role: "accessory", production, shadow: () => { throw new Error("must not run"); } }, { enabled: true, timeoutMs: 20 })).toBe(production));
  it("swallows shadow, timeout-shaped, and telemetry failures", () => {
    expect(observeOrdinaryV2Shadow({ family: "ordinary", role: "accessory", production, shadow: () => { throw new Error("shadow"); }, emit: () => { throw new Error("telemetry"); } }, { enabled: true, timeoutMs: 20 })).toEqual(production);
  });
});
