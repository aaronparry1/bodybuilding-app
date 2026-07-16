import { describe, expect, it } from "vitest";

type SyntheticSession = { id: string; sets: number; completed: boolean };
function buildSyntheticSessions(count: number): SyntheticSession[] {
  return Array.from({ length: count }, (_, index) => ({ id: `synthetic-${index}`, sets: 12, completed: index % 10 !== 0 }));
}

describe("long-lived synthetic performance fixtures", () => {
  it.each([0, 100, 500, 2_000, 10_000])("builds the %i-session fixture without real data", (count) => {
    const sessions = buildSyntheticSessions(count);
    expect(sessions).toHaveLength(count);
    expect(sessions.every((session) => session.id.startsWith("synthetic-"))).toBe(true);
  });

  it("keeps interaction assertions independent of total history size", () => {
    const small = buildSyntheticSessions(100);
    const large = buildSyntheticSessions(2_000);
    const swapCandidate = (sessions: SyntheticSession[]) => sessions.find((session) => session.id === "synthetic-0")?.id;
    expect(swapCandidate(small)).toBe(swapCandidate(large));
  });
});
