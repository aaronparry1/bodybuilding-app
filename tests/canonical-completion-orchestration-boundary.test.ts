import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
describe("canonical completion authority boundary", () => {
  it("removes the unreferenced legacy orchestrator", () => {
    expect(existsSync(resolve(process.cwd(), "src/domain/training/current-completion-orchestration.ts"))).toBe(false);
  });
});
