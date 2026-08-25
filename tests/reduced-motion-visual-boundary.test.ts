import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const motion = readFileSync("src/ui/motion.ts", "utf8");
const primitives = readFileSync("src/ui/primitives.tsx", "utf8");
const train = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const completion = readFileSync("app/(protected)/completion-summary.tsx", "utf8");

describe("premium motion accessibility boundary", () => {
  it("tracks the platform Reduce Motion preference and live changes in one shared hook", () => {
    expect(motion).toContain("AccessibilityInfo.isReduceMotionEnabled()");
    expect(motion).toContain('AccessibilityInfo.addEventListener("reduceMotionChanged"');
    expect(motion).toContain("subscription.remove()");
  });

  it("disables decorative list and completion reveals when reduced motion is enabled", () => {
    expect(primitives).toContain("const reduceMotion = useReducedMotion()");
    expect(primitives).toContain("entering={reduceMotion ? undefined : FadeInUp");
    expect(completion).toContain("const reduceMotion = useReducedMotion()");
    expect(completion).toContain("function CompletionReveal");
    expect(completion).toContain('if (reduceMotion || Platform.OS === "web") return <View>{children}</View>');
    expect(completion).toContain("entering={FadeInUp");
  });

  it("keeps Train motion, modals and scroll transitions on the same preference", () => {
    expect(train).toContain("const reduceMotion = useReducedMotion()");
    expect(train).toContain('animationType={reduceMotion ? "none" : "fade"}');
    expect(train).toContain("animated: !reduceMotion");
  });
});
