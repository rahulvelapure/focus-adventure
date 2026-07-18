import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Star, ListOrdered } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/sort")({
  head: () => ({
    meta: [
      { title: "Number Line — FoxFocus" },
      { name: "description", content: "Tap the numbers in order from smallest to biggest. Trains planning and sequencing." },
    ],
  }),
  component: Sort,
});

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeSet(level: number) {
  const size = 4 + level; // 5..10
  const pool = shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, size);
  return pool.sort(() => Math.random() - 0.5);
}

function Sort() {
  const [level, setLevel] = useState(1);
  const [nums, setNums] = useState<number[]>([]);
  const [tapped, setTapped] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("sort-level");

  useEffect(() => {
    setNums(makeSet(1));
  }, []);

  function start() {
    sfx.tap();
    setNums(makeSet(level));
    setTapped([]);
    setStartedAt(performance.now());
    setRunning(true);
    setLastMs(null);
  }

  function tap(n: number) {
    if (!running) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const expected = sorted[tapped.length];
    if (n !== expected) {
      sfx.bad();
      return;
    }
    sfx.tap();
    const next = [...tapped, n];
    setTapped(next);
    if (next.length === nums.length) {
      const ms = Math.round(performance.now() - startedAt);
      setLastMs(ms);
      setRunning(false);
      sfx.win();
      add(1 + level);
      submit(level);
      if (level < 6) setLevel((l) => l + 1);
    }
  }

  useEndlessAutoRestart("sort", !running && lastMs != null, () => start());

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Number Line</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap smallest → biggest. No skipping!
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Level<br /><span className="text-primary text-lg">{level}</span></span>
        <span className="rounded-xl bg-muted p-2">Last<br /><span className="text-primary text-lg tabular-nums">{lastMs ? (lastMs / 1000).toFixed(1) + "s" : "—"}</span></span>
        <span className="rounded-xl bg-muted p-2">Best lvl<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {nums.map((n) => {
          const done = tapped.includes(n);
          return (
            <button
              key={n}
              onClick={() => tap(n)}
              disabled={!running || done}
              className={`aspect-square rounded-3xl font-display text-2xl transition-all ${
                done
                  ? "bg-secondary text-secondary-foreground opacity-40"
                  : "bg-primary text-primary-foreground btn-pop active:btn-pop-active"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {running ? "Restart" : "Start"}
        </button>
      </div>

      {!running && lastMs != null && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> Nice! Level {level - 1} in {(lastMs / 1000).toFixed(1)}s
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ListOrdered className="size-3.5" /> Trains: planning + sequencing (executive function).
      </p>
    </div>
  );
}