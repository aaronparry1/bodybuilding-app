import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { exerciseLibrary } from "@/domain/training/presets";
import {
  buildV2QaPreviewRecords,
  type V2QaPreviewCase,
  type V2QaPreviewRecord,
  V2_QA_PREVIEW_CASES,
} from "@/domain/training/run-v2-qa-preview";

export const COACH_REVIEW_DASHBOARD_PATH = "reports/adaptive_stress_lab/coach_review_dashboard.html";

export interface CoachReviewDashboardRecord {
  id: string;
  name: string;
  goal: string;
  phase: string;
  exercise: string;
  context: string;
  cycle: string;
  intent: string;
  reps: string;
  load: string;
  sets: string;
  confidence: number;
  flags: string[];
}

export interface CoachReviewDashboardSummary {
  totalScenarios: number;
  flaggedScenarios: number;
  unsupportedFallbackCount: number;
  lowConfidenceCount: number;
  generatedAt: string;
}

export interface CoachReviewDashboardData {
  summary: CoachReviewDashboardSummary;
  records: CoachReviewDashboardRecord[];
}

export function buildCoachReviewDashboardData(generatedAt = new Date().toISOString()): CoachReviewDashboardData {
  const previewRecords = buildV2QaPreviewRecords();
  const records = previewRecords.map((record) => dashboardRecord(record, V2_QA_PREVIEW_CASES.find((candidate) => candidate.id === record.id)));

  return {
    summary: {
      totalScenarios: records.length,
      flaggedScenarios: records.filter((record) => record.flags.length > 0).length,
      unsupportedFallbackCount: records.filter((record) => record.flags.includes("unsupported_fallback")).length,
      lowConfidenceCount: records.filter((record) => record.flags.includes("low_confidence")).length,
      generatedAt,
    },
    records,
  };
}

export function generateCoachReviewDashboardHtml(data = buildCoachReviewDashboardData()) {
  const { summary, records } = data;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Adaptive Strength Coach - V2 Coach Review Dashboard</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #070707;
      --panel: #111111;
      --panel-soft: #171717;
      --line: #2b2618;
      --text: #f6f0df;
      --muted: #b8ad96;
      --gold: #d7b35a;
      --gold-soft: #3a2d12;
      --danger: #f28b82;
      --warning: #ffd166;
      --ok: #9be7a3;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }
    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 40px 20px 64px;
    }
    header {
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: clamp(2rem, 4vw, 4rem);
      line-height: 0.95;
      letter-spacing: 0;
    }
    p { margin: 0; color: var(--muted); }
    .instructions {
      margin-top: 18px;
      display: grid;
      gap: 6px;
      color: var(--text);
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
      margin: 22px 0 28px;
    }
    .metric {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
    }
    .metric strong {
      display: block;
      font-size: 1.8rem;
      line-height: 1;
      color: var(--gold);
      margin-bottom: 6px;
    }
    .metric span {
      color: var(--muted);
      font-size: 0.9rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      min-width: 0;
    }
    .card.flagged {
      border-color: var(--gold);
      box-shadow: inset 0 0 0 1px rgba(215, 179, 90, 0.2);
    }
    .card h2 {
      margin: 0 0 12px;
      font-size: 1.08rem;
      letter-spacing: 0;
    }
    .meta, .outputs {
      display: grid;
      gap: 8px;
      margin-bottom: 14px;
    }
    .row {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: 8px;
      align-items: baseline;
      font-size: 0.93rem;
    }
    .row span:first-child {
      color: var(--muted);
    }
    .row span:last-child {
      color: var(--text);
      overflow-wrap: anywhere;
    }
    .flag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 12px 0 14px;
    }
    .flag {
      border: 1px solid var(--gold);
      background: var(--gold-soft);
      color: var(--warning);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.78rem;
    }
    .flag.none {
      border-color: #263526;
      background: #101d10;
      color: var(--ok);
    }
    .verdict {
      border-top: 1px solid var(--line);
      padding-top: 12px;
      display: grid;
      gap: 8px;
      color: var(--text);
      font-size: 0.92rem;
    }
    .verdict-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .notes {
      color: var(--muted);
      min-height: 28px;
      border-bottom: 1px solid #3b3527;
      padding-bottom: 6px;
    }
    footer {
      margin-top: 30px;
      color: var(--muted);
      font-size: 0.86rem;
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Coach Review Dashboard</h1>
      <p>Static V2 QA preview for Adaptive Strength Coach. No server, network, Expo, app build, or production UI required.</p>
      <div class="instructions">
        <strong>Open this file in your browser.</strong>
        <span>Review each card and mark your verdict manually.</span>
      </div>
    </header>
    <section class="summary" aria-label="Dashboard summary">
      ${metric("Total scenarios", summary.totalScenarios)}
      ${metric("Flagged scenarios", summary.flaggedScenarios)}
      ${metric("Unsupported fallback", summary.unsupportedFallbackCount)}
      ${metric("Low confidence", summary.lowConfidenceCount)}
      ${metric("Generated", formatTimestamp(summary.generatedAt))}
    </section>
    <section class="grid" aria-label="Scenario review cards">
      ${records.map(cardHtml).join("\n")}
    </section>
    <footer>Generated at ${escapeHtml(summary.generatedAt)} from the local V2 QA preview harness.</footer>
  </main>
</body>
</html>
`;
}

export function writeCoachReviewDashboard(path = COACH_REVIEW_DASHBOARD_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, generateCoachReviewDashboardHtml());
  return path;
}

function dashboardRecord(record: V2QaPreviewRecord, previewCase: V2QaPreviewCase | undefined): CoachReviewDashboardRecord {
  const metadata = previewCase?.exerciseId ? exerciseLibrary.find((candidate) => candidate.id === previewCase.exerciseId) : undefined;
  const chips = record.output?.chips;
  return {
    id: record.id,
    name: record.name,
    goal: label(previewCase?.goal ?? "unknown"),
    phase: label(previewCase?.blockType ?? "unknown"),
    exercise: previewCase?.exerciseName ?? metadata?.name ?? "Mystery Lift",
    context: contextLabel(previewCase),
    cycle: chips?.cycle ?? "No output",
    intent: chips?.intent ?? "No output",
    reps: chips?.reps ?? "No output",
    load: chips?.load ?? "No output",
    sets: chips?.sets ?? "No output",
    confidence: record.output?.confidence ?? 0,
    flags: record.flags,
  };
}

function cardHtml(record: CoachReviewDashboardRecord) {
  const flags = record.flags.length > 0 ? record.flags.map((flag) => `<span class="flag">${escapeHtml(flag)}</span>`).join("") : `<span class="flag none">none</span>`;
  return `<article class="card${record.flags.length > 0 ? " flagged" : ""}">
    <h2>${escapeHtml(record.name)}</h2>
    <div class="meta">
      ${row("Goal", record.goal)}
      ${row("Phase", record.phase)}
      ${row("Exercise", record.exercise)}
      ${row("Context", record.context)}
    </div>
    <div class="outputs">
      ${row("Cycle", record.cycle)}
      ${row("Intent", record.intent)}
      ${row("Reps", record.reps)}
      ${row("Load", record.load)}
      ${row("Sets", record.sets)}
      ${row("Confidence", `${record.confidence}%`)}
    </div>
    <div class="flag-list" aria-label="Flags">${flags}</div>
    <div class="verdict">
      <strong>Aaron verdict</strong>
      <div class="verdict-options">
        <span>✅ Looks right</span>
        <span>⚠️ Needs tweak</span>
        <span>❌ Wrong</span>
      </div>
      <div class="notes">Notes: ________________________________</div>
    </div>
  </article>`;
}

function row(labelText: string, value: string) {
  return `<div class="row"><span>${escapeHtml(labelText)}</span><span>${escapeHtml(value)}</span></div>`;
}

function metric(labelText: string, value: string | number) {
  return `<div class="metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(labelText)}</span></div>`;
}

function contextLabel(previewCase: V2QaPreviewCase | undefined) {
  if (!previewCase) return "No preview context";
  const pieces = [];
  if (previewCase.blockType === "deload") pieces.push("deload/recovery context");
  else pieces.push("normal recovery context");
  if (previewCase.loadKnown === false) pieces.push("low load confidence");
  if ((previewCase.reps?.length ?? 0) === 0) pieces.push("no completed sets");
  else pieces.push(`sets ${previewCase.load ?? 0} x ${previewCase.reps?.join(", ")}`);
  if (previewCase.expectedNoIncrease) pieces.push("conservative load expected");
  return pieces.join(" · ");
}

function formatTimestamp(timestamp: string) {
  return timestamp.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
