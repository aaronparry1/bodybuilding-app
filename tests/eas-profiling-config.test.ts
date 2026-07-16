import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("EAS profiling build isolation", () => {
  it("uses internal development distribution and non-production sentinels", () => {
    const eas = JSON.parse(readFileSync("eas.json", "utf8")) as any;
    const profile = eas.build["profiling-development"];
    expect(profile.developmentClient).toBe(true);
    expect(profile.distribution).toBe("internal");
    expect(profile.channel).toBe("profiling-development");
    expect(profile.env.APP_ENV).toBe("development");
    expect(profile.env.EXPO_PUBLIC_DESIGN_QA_MODE).toBe("1");
    expect(profile.env.EXPO_PUBLIC_SUPABASE_URL).toBe("https://invalid.local");
    expect(profile.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe("profiling-disabled");
    expect(profile.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY).toBe("profiling-disabled");
    expect(eas.submit?.["profiling-development"]).toBeUndefined();
  });

  it("keeps production native identity separate from profiling identity", () => {
    const eas = JSON.parse(readFileSync("eas.json", "utf8")) as any;
    const project = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj", "utf8");
    const scheme = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/xcshareddata/xcschemes/AdaptiveStrengthCoachProfiling.xcscheme", "utf8");
    expect(project).toContain("name = DebugProfiling;");
    expect(project).toContain("PRODUCT_BUNDLE_IDENTIFIER = com.aaronparry.adaptivestrengthcoach.profiling;");
    expect(project).toContain("PRODUCT_BUNDLE_IDENTIFIER = com.aaronparry.adaptivestrengthcoach;");
    expect(project).toMatch(/APP_URL_SCHEME = [\"]?ironlogic-profiling[\"]?;/);
    expect(scheme).toContain('buildConfiguration = "DebugProfiling"');
    expect(eas.build["profiling-development"].ios.scheme).toBe("AdaptiveStrengthCoachProfiling");
    expect(eas.build["profiling-development"].ios.buildConfiguration).toBe("DebugProfiling");
    expect(eas.build.production.ios?.scheme).toBeUndefined();
  });
});
