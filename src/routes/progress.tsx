import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Calculator, BookA, Trash2 } from "lucide-react";
import { useHistory, useClearMastery, median, type MathSession, type WordsSession } from "@/lib/mastery";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — FoxFocus" },
      { name: "description", content: "See skill growth over time for Quick Math and Word Builder." },
    ],
  }),
  component: ProgressPage,
});

function Sparkline({ values, max, suffix = "", stroke = "var(--color-primary)" }: { values: number[]; max?: number; suffix?: string; stroke?: string }) {
  if (!values.length) {
    return <div className="text-xs text-muted-foreground">Play a few rounds to see a trend line.</div>;
  }
  const w = 260, h = 60, pad = 4;
  const M = max ?? Math.max(...values, 1);
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / M) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = values[values.length - 1];
  return (
    <div className="flex items-end gap-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" aria-label="Trend chart">
        <polyline fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
      <div className="shrink-0 text-right">
        <div className="font-display text-lg tabular-nums">{last}{suffix}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">latest</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg tabular-nums">{value}</div>
    </div>
  );
}

function ProgressPage() {
  const math = useHistory<MathSession>("math");
  const words = useHistory<WordsSession>("words");
  const clear = useClearMastery();

  const mathAcc = math.map((s) => Math.round(s.accuracy * 100));
  const mathRange = math.map((s) => s.range);
  const mathRt = math.map((s) => Math.round(s.rtMs));
  const bestRange = math.length ? Math.max(...mathRange) : 0;
  const bestAcc = math.length ? Math.max(...mathAcc) : 0;
  const bestRt = math.filter((s) => s.rtMs > 0).map((s) => s.rtMs);
  const fastRt = bestRt.length ? Math.min(...bestRt) : 0;
  const medRt = median(mathRt.filter((n) => n > 0));

  const wordAcc = words.map((s) => Math.round(s.accuracy * 100));
  const wordPool = words.map((s) => s.poolLevel);
  const currentPool = words.length ? wordPool[wordPool.length - 1] : 0;
  const bestWordAcc = words.length ? Math.max(...wordAcc) : 0;

  return (
    <div className="mx-auto max-w-xl px-5 pt-8 pb-8">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <TrendingUp className="size-5" />
        </span>
        <h1 className="text-2xl font-display">Progress</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Skill growth over time. Trends update every 8 answers per game.
      </p>

      {/* MATH */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Calculator className="size-4" />
            </span>
            <h2 className="font-display text-lg">Quick Math</h2>
          </div>
          <Link to="/math" className="text-xs font-bold text-primary underline underline-offset-2">Play</Link>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Range" value={bestRange ? `1–${bestRange}` : "—"} />
          <Stat label="Best acc." value={bestAcc ? `${bestAcc}%` : "—"} />
          <Stat label="Fastest" value={fastRt ? `${fastRt}ms` : "—"} />
        </div>

        <div className="mt-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy trend</div>
          <Sparkline values={mathAcc} max={100} suffix="%" />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Number range</div>
          <Sparkline values={mathRange} stroke="var(--color-secondary)" />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reaction time (ms · median {medRt || "—"})</div>
          <Sparkline values={mathRt} stroke="var(--color-accent)" suffix="ms" />
        </div>

        {math.length ? (
          <button
            onClick={() => { if (confirm("Clear Math progress history?")) clear("math"); }}
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        ) : null}
      </section>

      {/* WORDS */}
      <section className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <BookA className="size-4" />
            </span>
            <h2 className="font-display text-lg">Word Builder</h2>
          </div>
          <Link to="/words" className="text-xs font-bold text-primary underline underline-offset-2">Play</Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Pool level" value={currentPool ? `Lv ${currentPool} / 3` : "—"} />
          <Stat label="Best acc." value={bestWordAcc ? `${bestWordAcc}%` : "—"} />
        </div>

        <div className="mt-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Missing-letter accuracy</div>
          <Sparkline values={wordAcc} max={100} suffix="%" />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Word pool level</div>
          <Sparkline values={wordPool} max={3} stroke="var(--color-secondary)" />
        </div>

        {words.length ? (
          <button
            onClick={() => { if (confirm("Clear Words progress history?")) clear("words"); }}
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        ) : null}
      </section>
    </div>
  );
}