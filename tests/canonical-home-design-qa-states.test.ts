import { beforeEach, describe, expect, it } from "vitest";
import { applyDesignQaFixture, clearDesignQaFixtures } from "@/application/design-qa/design-qa-fixtures";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

describe("canonical Home Design-QA states", () => {
  beforeEach(() => {
    clearDesignQaFixtures();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
  });

  it("represents planned and zero-history Home", () => {
    applyDesignQaFixture("home_active_plan");
    const home = readCanonicalHomeProjection();
    expect(home.primary?.kind).toBe("planned");
    expect(home.progress.historicalCount).toBe(0);
    expect(home.progress.evidenceStatus).toBe("not_yet_available");
    expect(home.progress.reviewAvailable).toBe(false);
    expect(home.actions.some((action) => action.type === "open_progress")).toBe(false);
  });

  it("represents the active workout from recorded ledger facts", () => {
    applyDesignQaFixture("home_active_workout");
    const home = readCanonicalHomeProjection();
    expect(home.primary).toMatchObject({ kind: "active", workout: { lifecycle: "active", completedSetCount: 1 } });
    expect(home.actions[0]?.type).toBe("resume_recorded_session");
  });

  it("represents completion today without consuming the next prescription", () => {
    applyDesignQaFixture("home_completed_today");
    const home = readCanonicalHomeProjection();
    expect(home.primary?.kind).toBe("completed_today");
    expect(home.progress.historicalCount).toBe(1);
    expect(home.primary?.detail).toContain("11 working sets");
    expect(home.actions.some((action) => action.type === "open_planned_session")).toBe(true);
  });

  it("keeps the rest-day fixture on canonical plan facts", () => {
    applyDesignQaFixture("home_rest_day");
    const home = readCanonicalHomeProjection({ now: Date.parse("2026-01-02T12:00:00.000Z") });
    expect(home.status).toBe("ready");
    expect(home.planId).toBe("design-qa:home_rest_day");
  });

  it("represents no plan without exposing stale workout navigation", () => {
    applyDesignQaFixture("home_no_plan");
    canonicalActivePlanState.hydrate();
    const home = readCanonicalHomeProjection();
    expect(home.status).toBe("empty");
    expect(home.actions).toEqual([{ type: "setup_plan" }]);
    expect(canonicalActivePlanState.getReadModel()).toBeNull();
  });
});
