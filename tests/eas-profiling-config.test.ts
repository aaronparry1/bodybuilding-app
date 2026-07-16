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
});
