import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  runProductionV2CompleteSessionReviewSuite,
  type CompleteCoachingSessionReview,
  type CompleteSessionExerciseReview,
  type CompleteSessionReviewFlag,
} from "@/domain/training/coaching-review-suite";

export const BENCHMARK_SESSION_REVIEW_PACK_PATH = "reports/adaptive_stress_lab/benchmark_session_review_pack.html";

export interface BenchmarkSessionReviewPackSummary {
  totalSessions: number;
  questionableSessions: number;
  repeatedExerciseBiasCount: number;
  unnecessaryFatigueCount: number;
  poorSpecificityCount: number;
  lackOfVarietyCount: number;
  unnecessaryComplexityCount: number;
  lowConfidenceCount: number;
  fallbackMappingCount: number;
  generatedAt: string;
}

export interface BenchmarkSessionReviewPackData {
  summary: BenchmarkSessionReviewPackSummary;
  sessions: CompleteCoachingSessionReview[];
}

export function buildBenchmarkSessionReviewPackData(generatedAt = new Date().toISOString()): BenchmarkSessionReviewPackData {
  const result = runProductionV2CompleteSessionReviewSuite();

  return {
    summary: {
      totalSessions: result.session_count,
      questionableSessions: result.questionable_sessions.length,
      repeatedExerciseBiasCount: result.repeated_exercise_bias.length,
      unnecessaryFatigueCount: result.unnecessary_fatigue.length,
      poorSpecificityCount: result.poor_specificity.length,
      lackOfVarietyCount: result.lack_of_variety.length,
      unnecessaryComplexityCount: result.unnecessary_complexity.length,
      lowConfidenceCount: result.sessions.filter((session) => session.review_flags.includes("low_confidence_session")).length,
      fallbackMappingCount: result.sessions.filter((session) => session.review_flags.includes("questionable_exercise")).length,
      generatedAt,
    },
    sessions: result.sessions,
  };
}

export function generateBenchmarkSessionReviewPackHtml(data = buildBenchmarkSessionReviewPackData()) {
  const { summary, sessions } = data;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Adaptive Strength Coach - Benchmark Session Review Pack</title>
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
      --info: #93c5fd;
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
      max-width: 1240px;
      margin: 0 auto;
      padding: 40px 20px 72px;
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
    h2, h3, h4 { letter-spacing: 0; }
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
    .session {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      margin: 0 0 18px;
      break-inside: avoid;
    }
    .session.flagged {
      border-color: var(--gold);
      box-shadow: inset 0 0 0 1px rgba(215, 179, 90, 0.2);
    }
    .session-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .session h2 {
      margin: 0 0 8px;
      font-size: 1.35rem;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .pill {
      border: 1px solid #343024;
      background: var(--panel-soft);
      border-radius: 999px;
      padding: 4px 8px;
      color: var(--muted);
      font-size: 0.8rem;
    }
    .pill.flag {
      border-color: var(--gold);
      background: var(--gold-soft);
      color: var(--warning);
    }
    .pill.clean {
      border-color: #263526;
      background: #101d10;
      color: var(--ok);
    }
    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      margin: 14px 0;
    }
    .box {
      background: var(--panel-soft);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      min-width: 0;
    }
    .box h3 {
      margin: 0 0 10px;
      color: var(--gold);
      font-size: 0.98rem;
    }
    .row {
      display: grid;
      grid-template-columns: 118px minmax(0, 1fr);
      gap: 8px;
      margin: 6px 0;
      font-size: 0.9rem;
    }
    .row span:first-child {
      color: var(--muted);
    }
    .row span:last-child {
      color: var(--text);
      overflow-wrap: anywhere;
    }
    ul {
      margin: 0;
      padding-left: 18px;
      color: var(--text);
    }
    li { margin: 4px 0; }
    .exercise {
      border-top: 1px solid var(--line);
      padding-top: 14px;
      margin-top: 14px;
    }
    .exercise h4 {
      margin: 0 0 10px;
      font-size: 1.02rem;
      color: var(--info);
    }
    .review {
      border-top: 1px solid var(--line);
      padding-top: 14px;
      margin-top: 16px;
      display: grid;
      gap: 10px;
    }
    .verdict-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: var(--text);
    }
    .score-line, .notes-line {
      color: var(--text);
      border-bottom: 1px solid #3b3527;
      min-height: 30px;
      padding-bottom: 6px;
    }
    footer {
      margin-top: 30px;
      color: var(--muted);
      font-size: 0.86rem;
    }
    @media print {
      body { background: #fff; color: #111; }
      .session, .box, .metric { border-color: #ddd; background: #fff; }
      .pill { border-color: #ddd; background: #fff; color: #111; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Benchmark Session Review Pack</h1>
      <p>Static review pack for complete V2 coaching sessions. No server, network, Expo, simulator, app build, or production UI required.</p>
      <div class="instructions">
        <strong>Open this file in your browser.</strong>
        <span>Review each Benchmark Session and mark your verdict manually.</span>
        <span>Gold status is earned after Aaron review.</span>
      </div>
    </header>
    <section class="summary" aria-label="Review pack summary">
      ${metric("Total sessions", summary.totalSessions)}
      ${metric("Questionable sessions", summary.questionableSessions)}
      ${metric("Repeated exercise bias", summary.repeatedExerciseBiasCount)}
      ${metric("Unnecessary fatigue", summary.unnecessaryFatigueCount)}
      ${metric("Poor specificity", summary.poorSpecificityCount)}
      ${metric("Lack of variety", summary.lackOfVarietyCount)}
      ${metric("Unnecessary complexity", summary.unnecessaryComplexityCount)}
      ${metric("Average Aaron score", "___ / 10")}
    </section>
    <section aria-label="Benchmark session cards">
      ${sessions.map(sessionCardHtml).join("\n")}
    </section>
    <footer>Generated at ${escapeHtml(summary.generatedAt)} from local Benchmark Sessions. Gold status is earned after Aaron review.</footer>
  </main>
</body>
</html>
`;
}

export function writeBenchmarkSessionReviewPack(path = BENCHMARK_SESSION_REVIEW_PACK_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, generateBenchmarkSessionReviewPackHtml());
  return path;
}

function sessionCardHtml(session: CompleteCoachingSessionReview) {
  const context = contextForSession(session);
  return `<article class="session${session.review_flags.length ? " flagged" : ""}">
    <div class="session-header">
      <div>
        <h2>${escapeHtml(session.session_name)}</h2>
        <div class="meta">
          ${pill(`Goal: ${label(session.goal)}`)}
          ${pill(`Phase: ${label(session.trainingPhase)}`)}
          ${pill(`Recovery: ${context.recovery}`)}
          ${pill(`Performance: ${context.performance}`)}
          ${pill(`Confidence: ${session.confidence}%`)}
        </div>
      </div>
      <div class="meta" aria-label="Session flags">${flagPills(session.review_flags)}</div>
    </div>
    <div class="section-grid">
      <section class="box">
        <h3>Coach Intent</h3>
        ${row("Macro intent", session.cycle_strategy.macro_intent)}
        ${row("Meso focus", session.cycle_strategy.meso_focus)}
        ${row("Micro emphasis", session.cycle_strategy.micro_emphasis)}
        ${row("Stress budget", session.cycle_strategy.stress_budget_bias)}
        ${row("Session objective", dominantSessionObjective(session))}
      </section>
      <section class="box">
        <h3>Required Stimuli</h3>
        ${stimulusList("Primary", session.stimulus_plan.primary_stimuli.map((target) => target.stimulus_id))}
        ${stimulusList("Secondary", session.stimulus_plan.secondary_stimuli.map((target) => target.stimulus_id))}
        ${stimulusList("Optional", session.stimulus_plan.optional_stimuli.map((target) => target.stimulus_id))}
        ${stimulusList("Avoided", session.stimulus_plan.avoid_stimuli)}
      </section>
    </div>
    <section class="box">
      <h3>Flag Summary</h3>
      ${flagSummary(session.review_flags)}
    </section>
    ${session.exercises.map(exerciseCardHtml).join("\n")}
    <section class="review">
      <strong>Coaching Review</strong>
      <div class="score-line">Aaron score: ___ / 10</div>
      <div class="verdict-options">
        <span>✅ Approve</span>
        <span>⚠️ Needs tweak</span>
        <span>❌ Reject</span>
      </div>
      <div class="notes-line">Notes: ________________________________________________________________________________</div>
    </section>
  </article>`;
}

function exerciseCardHtml(exercise: CompleteSessionExerciseReview) {
  return `<section class="exercise">
    <h4>${escapeHtml(exercise.selected_exercise)}</h4>
    <div class="section-grid">
      <div class="box">
        <h3>Exercise Delivery</h3>
        ${row("Stimulus", exercise.stimulus_id)}
        ${row("Archetype", exercise.delivery.exercise_archetype)}
        ${row("Delivery", exercise.delivery.preferred_delivery_type)}
        ${row("Alternatives", exercise.delivery.acceptable_alternatives.join(", "))}
        ${row("Specificity", `${exercise.delivery.specificity_score}%`)}
        ${row("Fatigue", `${exercise.delivery.fatigue_score}%`)}
        ${row("Confidence", `${exercise.delivery.confidence}%`)}
        ${row("Why selected", exercise.why_exercise_selected)}
      </div>
      <div class="box">
        <h3>Prescription</h3>
        ${row("Reps", exercise.rep_prescription.short_reason)}
        ${row("Load strategy", `${exercise.load_prescription.load_action} / ${exercise.load_prescription.load_strategy}`)}
        ${row("Load reason", exercise.why_load)}
        ${row("Set allocation", exercise.set_allocation?.short_reason ?? "No set preview")}
        ${row("Set reason", exercise.why_sets)}
        ${row("Rep reason", exercise.why_reps)}
      </div>
    </div>
  </section>`;
}

function contextForSession(session: CompleteCoachingSessionReview) {
  const debug = session.stimulus_plan.debug_reasons.join(" ");
  const recovery = debug.match(/recovery ([a-z_]+)/)?.[1] ?? "normal";
  const performance = debug.match(/signal ([a-z_]+)/)?.[1] ?? "appropriate";
  return { recovery, performance };
}

function dominantSessionObjective(session: CompleteCoachingSessionReview) {
  const counts = session.exercises.reduce<Record<string, number>>((acc, exercise) => {
    acc[exercise.session_strategy.set_objective] = (acc[exercise.session_strategy.set_objective] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}

function stimulusList(labelText: string, values: string[]) {
  const content = values.length ? `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>` : "<span>none</span>";
  return `<div class="row"><span>${escapeHtml(labelText)}</span><span>${content}</span></div>`;
}

function flagSummary(flags: CompleteSessionReviewFlag[]) {
  const labels: CompleteSessionReviewFlag[] = [
    "repeated_exercise_bias",
    "unnecessary_fatigue",
    "poor_specificity",
    "lack_of_variety",
    "unnecessary_complexity",
    "low_confidence_session",
    "questionable_exercise",
  ];
  return `<div class="meta">${labels.map((flag) => pill(`${flag}: ${flags.includes(flag) ? "yes" : "no"}`, flags.includes(flag) ? "flag" : "clean")).join("")}</div>`;
}

function flagPills(flags: CompleteSessionReviewFlag[]) {
  if (flags.length === 0) return pill("no flags", "clean");
  return flags.map((flag) => pill(flag, "flag")).join("");
}

function row(labelText: string, value: string) {
  return `<div class="row"><span>${escapeHtml(labelText)}</span><span>${escapeHtml(value)}</span></div>`;
}

function metric(labelText: string, value: string | number) {
  return `<div class="metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(labelText)}</span></div>`;
}

function pill(value: string, tone: "flag" | "clean" | "normal" = "normal") {
  return `<span class="pill${tone === "flag" ? " flag" : tone === "clean" ? " clean" : ""}">${escapeHtml(value)}</span>`;
}

function label(value: string) {
  return value.replace(/_/g, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
