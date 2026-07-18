import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function files(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith(".test.ts") ? [join(dir, entry.name)] : []); }

describe("committed test discovery integrity", () => {
  it("contains no focused tests and no unjustified skipped tests", () => {
    const source = files(join(process.cwd(), "tests")).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/\.only\s*\(/);
    expect(source).not.toMatch(/\.skip\s*\(/);
    expect(source).not.toMatch(/\.todo\s*\(/);
  });
});
