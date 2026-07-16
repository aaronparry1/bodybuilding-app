import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_EXTRA_SESSION_LEDGER_LINK_VERSION } from "@/application/training/canonical-extra-session";

describe("canonical Extra Session ledger link", () => {
  it("publishes the bounded link command version", () => {
    expect(CANONICAL_EXTRA_SESSION_LEDGER_LINK_VERSION).toBe("canonical_extra_session_ledger_link_command_v1");
  });
  it("keeps the route canonical and navigates only after link/start", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(protected)/programmes/ai.tsx"), "utf8");
    expect(source).toContain("startCanonicalExtraSession");
    expect(source).toContain("linked_and_started");
    expect(source).not.toContain("workoutSessionRepository");
    expect(source).not.toContain("programmeRepository");
  });
});
