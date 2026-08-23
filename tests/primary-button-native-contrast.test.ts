import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("primary button native contrast", () => {
  it("does not place the enabled dark label on a disabled dark surface", () => {
    const source = readFileSync("src/ui/primitives.tsx", "utf8");
    expect(source).toContain('color: disabled ? colors.textSubtle : "#12110d"');
    expect(source).not.toContain("opacity: disabled ? 0.55 : 1");
  });
});
