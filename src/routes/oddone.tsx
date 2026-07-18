import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";

export const Route = createFileRoute("/oddone")({
  head: () => ({
    meta: [
      { title: "Odd One Out — FoxFocus" },
      { name: "description", content: "Spot the different tile before time runs out. Trains visual scanning and focus." },
    ],
  }),
  component: OddOne,
});

const ROUND_MS = 45_000;

function makeBoard(round: number) {
  const size = Math.min(6, 3 + Math.floor(round / 2)); // 3..6
  const count = size * size;
  // Base hue random 0-360
  const hue = Math.floor(Math.random() * 360);
  const baseL = 0.72;
  const baseC = 0.16;
  // Delta shrinks as rounds go up
  const delta = Math.max(0.015, 0.08 - round * 0.005);
  const odd = Math.floor(Math.random() * count);
  const base = `oklch(${baseL} ${baseC} ${hue})`;
  const off = `oklch(${baseL - delta} ${baseC} ${hue})`;
  return { size, count, odd, base, off };
}

function OddOne() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(() => makeBoard(0));
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000);
  const endT = useRef<number | null>(null);
  const tickT = useRef<number | null>(null);
  const { add } = useStars();

  const cells = useMemo(
    () => Array.from({ length: board.count }, (_, i) => (i === board.odd ? board.off : board.base)),
    [board],
  );

  function start() {
    setScore(0);
    setRound(0);
    setBoard(makeBoard(0));
    setState("playing");
    setTimeLeft(ROUND_MS / 1000);
    const startedAt = Date.now();
    tickT.current = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((ROUND_MS - (Date.now() - startedAt)) / 1000));
      setTimeLeft(left);
      if (left === 0 && tickT.current) window.clearInterval(tickT.current);
    }, 200);
    endT.current = window.setTimeout(() => {
      finish();
    }, ROUND_MS);
  }

  function finish() {
    if (tickT.current) window.clearInterval(tickT.current);
    if (endT.current) window.clearTimeout(endT.current);
    setState("done");
    setScore((s) => {
      const reward = Math.max(1, Math.ceil(s / 2));
      if (s > 0) add(reward);
      return s;
    });
  }

  useEffect(
    () => () => {
      if (tickT.current) window.clearInterval(tickT.current);
      if (endT.current) window.clearTimeout(endT.current);
    },
    [],
  );

  function tap(i: number) {
    if (state !== "playing") return;
    if (i === board.odd) {
      sfx.good();
      setScore((s) => s + 1);
      setRound((r) => {
        const nr = r + 1;
        setBoard(makeBoard(nr));
        return nr;
      });
    } else {
      sfx.bad();
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Odd One Out</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find the tile that's a tiny bit different. It gets trickier each round.
      </p>

      <div className="mt-4 flex justify-between text-sm font-bold">
        <span>Score: <span className="tabular-nums text-primary">{score}</span></span>
        <span>Round: <span className="tabular-nums">{round + 1}</span></span>
        <span>Time: <span className="tabular-nums">{timeLeft}s</span></span>
      </div>

      <div
        className="mt-5 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))` }}
      >
        {cells.map((color, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            disabled={state !== "playing"}
            aria-label={`Tile ${i + 1}`}
            className="aspect-square rounded-2xl transition-transform active:scale-95 disabled:opacity-70"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {state === "done" ? (
        <div className="mt-6 rounded-2xl bg-accent p-4 text-center font-bold text-accent-foreground">
          <div className="flex items-center justify-center gap-2">
            <Star className="size-5 fill-current" /> +{Math.max(1, Math.ceil(score / 2))} stars
          </div>
          <p className="mt-1 text-sm opacity-80">You found {score} tiles</p>
        </div>
      ) : null}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            sfx.tap();
            start();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {state === "idle" ? "Start" : "Play again"}
        </button>
      </div>
    </div>
  );
}