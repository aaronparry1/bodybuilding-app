import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { getAppEnvironment, isV2CoachingQaRequested } from "@/application/runtime/app-environment";
import {
  applyDesignQaFixture,
  applyCanonicalHomeVisualPreview,
  clearDesignQaFixtures,
  designQaFixtures,
  getActiveDesignQaFixture,
  subscribeDesignQaFixture,
  type DesignQaFixtureDefinition,
} from "@/application/design-qa/design-qa-fixtures";
import { AppScreen, ErrorState, PremiumCard, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function DesignQaScreen() {
  const environment = getAppEnvironment();
  const { clear, fixture } = useLocalSearchParams<{ clear?: string; fixture?: string }>();
  const [activeFixture, setActiveFixture] = useState(() => getActiveDesignQaFixture());
  const [error, setError] = useState<string | null>(null);
  const fixturesByArea = useMemo(() => groupFixturesByArea(designQaFixtures), []);
  const showV2BenchmarkQa = isV2CoachingQaRequested();

  useEffect(() => subscribeDesignQaFixture(() => setActiveFixture(getActiveDesignQaFixture())), []);

  useEffect(() => {
    if (clear === "1") {
      clearFixtures({ redirectToSettings: false });
      return;
    }
    if (!fixture || !designQaFixtures.some((candidate) => candidate.id === fixture)) return;
    const definition = designQaFixtures.find((candidate) => candidate.id === fixture)!;
    applyFixture(definition);
    // The applyFixture callback intentionally closes over the latest environment and router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear, fixture]);

  const applyFixture = (fixture: DesignQaFixtureDefinition) => {
    try {
      setError(null);
      applyDesignQaFixture(fixture.id, environment);
      router.replace(fixture.targetHref);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to apply Design QA fixture.");
    }
  };

  const clearFixtures = ({ redirectToSettings = false }: { redirectToSettings?: boolean } = {}) => {
    try {
      setError(null);
      clearDesignQaFixtures(environment);
      if (redirectToSettings) router.replace("/(protected)/settings");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to clear Design QA fixtures.");
    }
  };

  const previewCanonicalHome = (state: "planned" | "active" | "paused" | "completed" | "rest_day") => {
    try {
      setError(null);
      applyCanonicalHomeVisualPreview(state, environment);
      router.replace({ pathname: "/(protected)/(tabs)", params: state === "rest_day" ? { qaHomePreview: "rest_day" } : {} });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to apply canonical Home preview.");
    }
  };

  return (
    <AppScreen>
      <View style={{ gap: spacing.sm }}>
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          Design QA / Demo fixtures
        </Text>
        <Text selectable style={{ ...type.title, color: colors.text }}>
          Fixture switcher
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Dev/staging only. Fixtures populate local repositories and are blocked from manual cloud sync.
        </Text>
      </View>

      {error ? <ErrorState message={error} /> : null}

      {showV2BenchmarkQa ? (
        <PremiumCard tone="locked">
          <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
            V2 Benchmark Sessions
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Inspect complete V2 coaching sessions as workout-style cards. QA flag only.
          </Text>
          <SecondaryButton label="Open V2 Benchmark Sessions" onPress={() => router.push("/(protected)/v2-benchmark-qa")} />
        </PremiumCard>
      ) : null}

      <PremiumCard tone={activeFixture ? "locked" : "quiet"}>
        <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
          {activeFixture ? `Active: ${activeFixture.label}` : "No QA fixture active"}
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {activeFixture ? `Applied ${new Date(activeFixture.appliedAt).toLocaleTimeString()}. Local visual QA only.` : "Pick a state below to inspect Home, Train, Plan, or Progress."}
        </Text>
        <SecondaryButton label="Clear QA fixtures" onPress={() => clearFixtures({ redirectToSettings: false })} />
      </PremiumCard>

      <PremiumCard tone="quiet">
        <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Home visual states</Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>Current five-day allocator output, exercised through canonical plan and ledger owners.</Text>
        <SecondaryButton label="Preview certified planned Home" onPress={() => previewCanonicalHome("planned")} />
        <SecondaryButton label="Preview certified active Home" onPress={() => previewCanonicalHome("active")} />
        <SecondaryButton label="Preview certified paused Home" onPress={() => previewCanonicalHome("paused")} />
        <SecondaryButton label="Preview certified completed Home" onPress={() => previewCanonicalHome("completed")} />
        <SecondaryButton label="Preview certified rest Home" onPress={() => previewCanonicalHome("rest_day")} />
        <SecondaryButton label="Preview Home storage error" onPress={() => router.replace({ pathname: "/(protected)/(tabs)", params: { qaHomePreview: "storage_error" } })} />
      </PremiumCard>

      {Object.entries(fixturesByArea).map(([area, fixtures]) => (
        <SectionList key={area} title={area}>
          <View style={{ gap: spacing.sm }}>
            {fixtures.map((fixture) => (
              <PremiumCard key={fixture.id} tone={activeFixture?.id === fixture.id ? "locked" : "quiet"}>
                <Text selectable style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
                  {fixture.label}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {fixture.description}
                </Text>
                <SecondaryButton label={`Apply ${fixture.label}`} onPress={() => applyFixture(fixture)} compact />
              </PremiumCard>
            ))}
          </View>
        </SectionList>
      ))}
    </AppScreen>
  );
}

function groupFixturesByArea(fixtures: DesignQaFixtureDefinition[]) {
  return fixtures.reduce<Record<string, DesignQaFixtureDefinition[]>>((groups, fixture) => {
    groups[fixture.area] = [...(groups[fixture.area] ?? []), fixture];
    return groups;
  }, {});
}
