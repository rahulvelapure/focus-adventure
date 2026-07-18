import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Star, Search } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";

export const Route = createFileRoute("/spot")({
  head: () => ({
    meta: [
      { title: "Find the Star — FoxFocus" },
      { name: "description", content: "Scan the grid and find the hidden star as fast as you can." },
    ],
  }),
  component: Spot,
});

const ROUND_MS = 45_000;
const DISTRACTORS = ["🌸", "🍓", "🐞", "🍄", "🌼", "🎈"];

type Board = { grid: string[]; targetIndex: number; size: number };

function makeBoard(level: number): Board {
  const size = Math.min(6, 3 + Math.floor(level / 2)); // 3..6
  const total = size * size;
  const distractor = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
  const grid = Array(total).fill(distractor);
  const targetIndex = Math.floor(Math.random() * total);
  grid[targetIndex] = "⭐";
  return { grid, targetIndex, size };
}

function Spot() {
  const [board, setBoard] = useState<Board>(() => makeBoard(1));
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(ROUND_MS);
  const [running, setRunning] = useState(false);
  const { add } = useStars();
  const { best, submit } = useBest("spot");

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setLeft((l) => {
        const n = l - 100;
        if (n <= 0) {
          finish();
          return 0;
        }
        return n;
      });
    }, 100);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    sfx.tap();
    setLevel(1);
    setScore(0);
    setLeft(ROUND_MS);
    setBoard(makeBoard(1));
    setRunning(true);
  }

  function finish() {
    setRunning(false);
    setScore((s) => {
      add(Math.max(1, Math.floor(s / 3)));
      submit(s);
      sfx.win();
      return s;
    });
  }

  function tap(i: number) {
    if (!running) return;
    if (i === board.targetIndex) {
      sfx.good();
      setScore((s) => s + 1);
      setLevel((l) => l + 1);
      setBoard(makeBoard(level + 1));
    } else {
      sfx.bad();
      setLeft((l) => Math.max(0, l - 1500));
    }
  }

  const secs = (left / 1000).toFixed(1);

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Find the Star</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Scan the grid. Tap the ⭐ before time runs out.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Found<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Time<br /><span className="text-primary text-lg tabular-nums">{secs}s</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div
        className="mt-5 grid gap-1.5 rounded-3xl bg-card p-3 border border-border"
        style={{ gridTemplateColumns: `repeat(${board.size}, minmax(0,1fr))` }}
      >
        {board.grid.map((c, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className="aspect-square rounded-2xl bg-muted text-2xl active:scale-95 transition-transform"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {running ? "Restart" : "Start"}
        </button>
      </div>

      {!running && score > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {score} stars found
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Search className="size-3.5" /> Trains: visual search + sustained attention.
      </p>
    </div>
  );
}