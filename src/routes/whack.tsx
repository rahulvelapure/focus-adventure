import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Target } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/whack")({
  head: () => ({
    meta: [
      { title: "Whack-a-Fox — FoxFocus" },
      { name: "description", content: "Tap the friendly foxes, skip the sleepy ones. A go/no-go attention game." },
    ],
  }),
  component: Whack,
});

type Cell = "empty" | "go" | "nogo";
const GRID = 9;
const ROUND_MS = 30_000;

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { spawnMs: 500, nogoProb: 0.45 };
  if (level === "medium") return { spawnMs: 600, nogoProb: 0.35 };
  return { spawnMs: 800, nogoProb: 0.2 };
}

function Whack() {
  const [cells, setCells] = useState<Cell[]>(() => Array(GRID).fill("empty"));
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [left, setLeft] = useState(ROUND_MS);
  const [running, setRunning] = useState(false);
  const spawn = useRef<number | null>(null);
  const tick = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("whack");
  const { effective, endless } = useDifficulty("whack");

  useEffect(() => {
    return () => {
      if (spawn.current) window.clearInterval(spawn.current);
      if (tick.current) window.clearInterval(tick.current);
    };
  }, []);

  function start() {
    sfx.tap();
    setScore(0);
    setMisses(0);
    setLeft(ROUND_MS);
    setCells(Array(GRID).fill("empty"));
    setRunning(true);
    if (spawn.current) window.clearInterval(spawn.current);
    if (tick.current) window.clearInterval(tick.current);
    const { spawnMs, nogoProb } = paramsFor(effective);
    spawn.current = window.setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        // clear one random active
        const active = next
          .map((c, i) => (c !== "empty" ? i : -1))
          .filter((i) => i >= 0);
        if (active.length > 2) {
          next[active[Math.floor(Math.random() * active.length)]] = "empty";
        }
        const empties = next
          .map((c, i) => (c === "empty" ? i : -1))
          .filter((i) => i >= 0);
        if (empties.length) {
          const idx = empties[Math.floor(Math.random() * empties.length)];
          next[idx] = Math.random() < 1 - nogoProb ? "go" : "nogo";
        }
        return next;
      });
    }, spawnMs);
    if (endless) return; // no timer in endless mode
    tick.current = window.setInterval(() => {
      setLeft((l) => {
        const n = l - 100;
        if (n <= 0) {
          finish();
          return 0;
        }
        return n;
      });
    }, 100);
  }

  function finish() {
    if (spawn.current) window.clearInterval(spawn.current);
    if (tick.current) window.clearInterval(tick.current);
    setRunning(false);
    setCells(Array(GRID).fill("empty"));
    setScore((s) => {
      const reward = Math.max(1, Math.floor(s / 5));
      add(reward);
      submit(s);
      sfx.win();
      const total = s + misses;
      const acc = total > 0 ? s / total : 0.5;
      recordPlay({ gameId: "whack", accuracy: acc, correctCount: s });
      return s;
    });
  }

  function tap(i: number) {
    if (!running) return;
    const c = cells[i];
    if (c === "go") {
      sfx.good();
      setScore((s) => s + 1);
      setCells((prev) => {
        const n = [...prev];
        n[i] = "empty";
        return n;
      });
    } else if (c === "nogo") {
      sfx.bad();
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s - 1));
      setCells((prev) => {
        const n = [...prev];
        n[i] = "empty";
        return n;
      });
    }
  }

  useEndlessAutoRestart("whack", !running && (score + misses) > 0, () => start());

  const secs = (left / 1000).toFixed(1);

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Whack-a-Fox</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the orange foxes 🦊. Skip the sleepy purple ones 😴.
      </p>
      <DifficultyPicker gameId="whack" endlessSupported />
      <CbtCoach gameId="whack" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Score<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Time<br /><span className="text-primary text-lg tabular-nums">{secs}s</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {cells.map((c, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            aria-label={`hole ${i + 1}`}
            className="relative aspect-square rounded-3xl bg-muted"
          >
            {c === "go" && (
              <span className="absolute inset-2 grid place-items-center rounded-full bg-primary text-3xl">🦊</span>
            )}
            {c === "nogo" && (
              <span className="absolute inset-2 grid place-items-center rounded-full bg-secondary text-3xl">😴</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {running ? "Restart" : "Start round"}
        </button>
        {running && endless ? (
          <button
            onClick={finish}
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-3 text-sm font-bold text-muted-foreground min-h-11"
          >
            Stop
          </button>
        ) : null}
      </div>

      {!running && score > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {score} taps, {misses} slips
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="size-3.5" /> Trains: selective attention + inhibition.
      </p>
    </div>
  );
}