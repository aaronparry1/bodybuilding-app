import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const assetIconPath = join(root, "assets/icon.png");
const nativeIosIconPath = join(root, "ios/AdaptiveStrengthCoach/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png");

function fileHash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("app icon configuration", () => {
  it("uses the Adaptive Strength Coach icon for Expo and iOS", () => {
    const config = readFileSync(join(root, "app.config.ts"), "utf8");

    expect(config).toContain('icon: "./assets/icon.png"');
    expect(config).toContain('ios: {\n    icon: "./assets/icon.png"');
  });

  it("keeps the native iOS AppIcon synced to the branded source icon", () => {
    expect(fileHash(nativeIosIconPath)).toBe(fileHash(assetIconPath));
  });

  it("does not keep the placeholder native iOS bundle identifier", () => {
    const project = readFileSync(join(root, "ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj"), "utf8");
    const plist = readFileSync(join(root, "ios/AdaptiveStrengthCoach/Info.plist"), "utf8");

    expect(project).not.toContain("com.yourcompany.ironlogic");
    expect(plist).not.toContain("com.yourcompany.ironlogic");
    expect(plist).not.toContain("Iron Logic Staging");
    expect(project).toContain("com.aaronparry.adaptivestrengthcoach");
    expect(project).not.toContain("com.aaronparry.adaptivestrengthcoach.staging");
    expect(plist).toContain("Adaptive Strength Coach");
    expect(plist).not.toContain("A.S.C. Staging");
    expect(plist).not.toContain("A.S.C. Dev");
  });
});
