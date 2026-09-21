import { Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { isDesignQaModeAvailable, isDesignQaModeRequested } from "@/application/design-qa/design-qa-runtime";
import { runCanonicalLedgerDeviceBenchmark, type CanonicalLedgerDeviceBenchmarkResult } from "@/application/design-qa/canonical-ledger-device-benchmark";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { AppScreen, PremiumCard, PrimaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function LedgerMigrationQaScreen() {
  const allowed = isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CanonicalLedgerDeviceBenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!allowed) return <Redirect href="/(protected)/(tabs)/train" />;

  const run = () => {
    setRunning(true);
    setError(null);
    setTimeout(() => {
      try { setResult(runCanonicalLedgerDeviceBenchmark()); }
      catch (value) { setError(value instanceof Error ? value.message : String(value)); }
      finally { setRunning(false); }
    }, 80);
  };

  return (
    <AppScreen>
      <View style={{ gap: spacing.sm }}>
        <Text style={{ ...type.label, color: colors.accent }}>REAL-DEVICE STORAGE QA</Text>
        <Text style={{ ...type.title, color: colors.text }}>Ledger migration benchmark</Text>
        <Text style={{ ...type.body, color: colors.textMuted }}>Seeds 2,500 historical sessions in the legacy SQLite value, compares cold active-session reads, migrates the real data, and verifies scoped export plus one V2 set write.</Text>
      </View>
      <PrimaryButton label={running ? "Running…" : "Run benchmark"} disabled={running} onPress={run} />
      {running ? <ActivityIndicator color={colors.accent} /> : null}
      {error ? <PremiumCard tone="locked"><Text selectable style={{ color: colors.danger }}>{error}</Text></PremiumCard> : null}
      {result ? (
        <PremiumCard>
          <Metric label="Physical storage" value={result.deviceStorage} />
          <Metric label="History" value={`${result.historySessions.toLocaleString()} completed sessions`} />
          <Metric label="Events" value={result.eventsSeeded.toLocaleString()} />
          <Metric label="Legacy payload" value={`${(result.legacyPayloadBytes / 1_048_576).toFixed(2)} MiB`} />
          <Metric label="Before: cold active lookup" value={`${result.legacyInspectActiveMs.toFixed(2)} ms`} />
          <Metric label="Before: log one set" value={`${result.legacyAppendMs.toFixed(2)} ms`} />
          <Metric label="Migration" value={`${result.migrationMs.toFixed(2)} ms · ${result.migratedSessions.toLocaleString()} sessions`} />
          <Metric label="After: cold active lookup" value={`${result.v2ColdInspectActiveMs.toFixed(2)} ms`} />
          <Metric label="After: full plan export" value={`${result.v2ExportPlanMs.toFixed(2)} ms`} />
          <Metric label="After: log one set" value={`${result.v2AppendMs.toFixed(2)} ms`} />
          <Metric label="Read speed-up" value={`${result.readSpeedup.toFixed(1)}×`} />
          <Metric label="Measured speed-up" value={`${result.speedup.toFixed(1)}×`} />
          <Metric label="V2 active record" value={`${(result.v2RecordBytes / 1024).toFixed(1)} KiB`} />
          <Text selectable style={{ color: colors.textSubtle, fontSize: 12 }}>{result.completedAt}</Text>
        </PremiumCard>
      ) : null}
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={{ gap: spacing.xs }}><Text style={{ ...type.label, color: colors.textSubtle }}>{label}</Text><Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>{value}</Text></View>;
}
