import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Music } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/rhythm")({
  head: () => ({
    meta: [
      { title: "Steady Beat — FoxFocus" },
      { name: "description", content: "Tap on the beat. Trains timing and self-regulation." },
    ],
  }),
  component: Rhythm,
});

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { bpm: 120, beats: 20, window: 180 };
  if (level === "medium") return { bpm: 90, beats: 16, window: 220 };
  return { bpm: 70, beats: 12, window: 280 };
}

function Rhythm() {
  const { effective } = useDifficulty("rhythm");
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pulse, setPulse] = useState(false);
  const beatTimes = useRef<number[]>([]);
  const usedIdx = useRef<Set<number>>(new Set());
  const timer = useRef<number | null>(null);
  const startAt = useRef<number>(0);
  const { add } = useStars();
  const { best, submit } = useBest("rhythm");

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const p = paramsFor(effective);
  const period = 60000 / p.bpm;

  function start() {
    sfx.tap();
    setHits(0); setMisses(0); setBeat(0);
    setRunning(true);
    usedIdx.current = new Set();
    startAt.current = Date.now() + 800; // count-in
    beatTimes.current = Array.from({ length: p.beats }, (_, i) => startAt.current + i * period);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const now = Date.now();
      // pulse indicator on nearest beat
      const nearest = Math.round((now - startAt.current) / period);
      if (nearest >= 0 && nearest < p.beats) {
        setBeat(nearest + 1);
        setPulse(true);
        setTimeout(() => setPulse(false), Math.min(120, period / 3));
      }
      if (now > beatTimes.current[p.beats - 1] + p.window + 100) {
        finish();
      }
    }, Math.max(40, period / 6));
  }

  function tap() {
    if (!running) return;
    const now = Date.now();
    // find closest unused beat
    let bestI = -1;
    let bestD = Infinity;
    for (let i = 0; i < beatTimes.current.length; i++) {
      if (usedIdx.current.has(i)) continue;
      const d = Math.abs(now - beatTimes.current[i]);
      if (d < bestD) { bestD = d; bestI = i; }
    }
    if (bestI < 0 || bestD > p.window) {
      sfx.bad();
      setMisses((m) => m + 1);
      return;
    }
    usedIdx.current.add(bestI);
    sfx.good();
    setHits((h) => h + 1);
  }

  function finish() {
    if (timer.current) window.clearInterval(timer.current);
    setRunning(false);
    const missed = p.beats - hits;
    const total = p.beats;
    const acc = hits / total;
    add(Math.max(1, Math.floor(hits / 3)));
    submit(hits);
    sfx.win();
    recordPlay({ gameId: "rhythm", accuracy: acc, correctCount: hits });
    setMisses((m) => m + Math.max(0, missed - m));
  }

  useEndlessAutoRestart("rhythm", !running && (hits + misses) > 0, () => start());

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Steady Beat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the big pad on every pulse. Steady beats = steady brain.
      </p>
      <DifficultyPicker gameId="rhythm" />
      <CbtCoach gameId="rhythm" />

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Hits<br /><span className="text-primary text-lg">{hits}</span></span>
        <span className="rounded-xl bg-muted p-2">Miss<br /><span className="text-primary text-lg">{misses}</span></span>
        <span className="rounded-xl bg-muted p-2">Beat<br /><span className="text-primary text-lg tabular-nums">{beat}/{p.beats}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <button
        onClick={tap}
        disabled={!running}
        className="mt-5 grid aspect-square w-full max-w-sm mx-auto place-items-center rounded-full border-4 border-border bg-card transition-transform disabled:opacity-40"
        style={{ transform: pulse ? "scale(1.06)" : "scale(1)", background: pulse ? "var(--gradient-sunrise, oklch(0.7 0.18 45))" : undefined }}
        aria-label="Tap on the beat"
      >
        <span className="text-6xl">🥁</span>
      </button>

      <div className="mt-6 flex justify-center">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {running ? "Restart" : "Start"}
        </button>
      </div>

      {!running && hits + misses > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {hits} on-beat taps
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Music className="size-3.5" /> Trains: timing + motor self-regulation (kids with ADHD often show timing variability — Noreika 2013).
      </p>
    </div>
  );
}
