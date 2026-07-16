import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical current Progress context deletion boundary", () => {
  it("has no legacy resolver module or executable symbol", () => {
    expect(existsSync(resolve(process.cwd(), "src/domain/training/current-progress-context.ts"))).toBe(false);
    for (const file of ["src", "tests"]) {
      const paths = file === "src" ? ["src/domain/training/canonical-progress-context.ts"] : ["tests/current-progress-context.test.ts"];
      for (const path of paths) {
        if (!existsSync(resolve(process.cwd(), path))) continue;
        expect(readFileSync(resolve(process.cwd(), path), "utf8")).not.toContain("resolveCurrentProgressContext");
      }
    }
  });
});
