import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";

describe("committed test discovery integrity", () => {
  it("contains no focused tests and no unjustified skipped tests", () => {
    const result = spawnSync("rg", ["-n", "\\.(?:only|skip|todo)\\s*\\(", "tests", "--glob", "*.test.ts"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout || result.stderr).toBe(1);
  });
});
