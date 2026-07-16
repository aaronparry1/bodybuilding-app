/** Development-only interaction spans. Metadata must never contain user or workout content. */
export type PerformanceSpan = Readonly<{ name: string; startedAt: number; endedAt: number; durationMs: number; metadata?: Readonly<Record<string, string | number | boolean>> }>;

const active = new Map<number, { name: string; startedAt: number; metadata?: Readonly<Record<string, string | number | boolean>> }>();
let nextId = 1;
const completed: PerformanceSpan[] = [];
const MAX_COMPLETED_SPANS = 200;

function clock(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}

export function startPerformanceSpan(name: string, metadata?: Readonly<Record<string, string | number | boolean>>): number | null {
  if (process.env.NODE_ENV === "production") return null;
  const id = nextId++;
  active.set(id, { name, startedAt: clock(), metadata });
  return id;
}

export function finishPerformanceSpan(id: number | null): PerformanceSpan | null {
  if (id === null) return null;
  const started = active.get(id);
  if (!started) return null;
  active.delete(id);
  const endedAt = clock();
  const span = { ...started, endedAt, durationMs: Math.max(0, endedAt - started.startedAt) };
  completed.push(span);
  if (completed.length > MAX_COMPLETED_SPANS) completed.splice(0, completed.length - MAX_COMPLETED_SPANS);
  return span;
}

export function getCompletedPerformanceSpans(): readonly PerformanceSpan[] { return completed.slice(); }
export function resetPerformanceSpans(): void { active.clear(); completed.length = 0; }
