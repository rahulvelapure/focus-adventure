import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, MoveHorizontal } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";
import { signal as frust } from "@/lib/frustration";

export const Route = createFileRoute("/flanker")({
  head: () => ({
    meta: [
      { title: "Middle Arrow — FoxFocus" },
      { name: "description", content: "Tap the direction of the MIDDLE arrow. Ignore the rest." },
    ],
  }),
  component: Flanker,
});

type Dir = "L" | "R";

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { trials: 24, flankers: 4, incongruent: 0.7, timeMs: 1500 };
  if (level === "medium") return { trials: 18, flankers: 4, incongruent: 0.55, timeMs: 2200 };
  return { trials: 12, flankers: 2, incongruent: 0.4, timeMs: 3000 };
}

function makeTrial(flankers: number, incongruent: number) {
  const middle: Dir = Math.random() < 0.5 ? "L" : "R";
  const side: Dir = Math.random() < incongruent ? (middle === "L" ? "R" : "L") : middle;
  const half = Math.floor(flankers / 2);
  const arr: Dir[] = [...Array(half).fill(side), middle, ...Array(flankers - half).fill(side)];
  return { arr, middle };
}

function Flanker() {
  const { effective } = useDifficulty("flanker");
  const [running, setRunning] = useState(false);
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [cur, setCur] = useState<{ arr: Dir[]; middle: Dir } | null>(null);
  const [left, setLeft] = useState(0);
  const deadline = useRef<number | null>(null);
  const tick = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("flanker");

  useEffect(() => () => { if (tick.current) window.clearInterval(tick.current); }, []);

  function next() {
    const p = paramsFor(effective);
    setCur(makeTrial(p.flankers, p.incongruent));
    deadline.current = Date.now() + p.timeMs;
    setLeft(p.timeMs);
    if (tick.current) window.clearInterval(tick.current);
    tick.current = window.setInterval(() => {
      const r = (deadline.current ?? 0) - Date.now();
      setLeft(Math.max(0, r));
      if (r <= 0) answer(null);
    }, 60);
  }

  function start() {
    sfx.tap();
    setScore(0); setMisses(0); setTrial(0);
    setRunning(true);
    next();
  }

  function answer(pick: Dir | null) {
    if (!cur) return;
    if (tick.current) window.clearInterval(tick.current);
    const ok = pick === cur.middle;
    if (ok) { sfx.good(); setScore((s) => s + 1); } else { sfx.bad(); setMisses((m) => m + 1); }
    const p = paramsFor(effective);
    const n = trial + 1;
    const ns = ok ? score + 1 : score;
    const nm = ok ? misses : misses + 1;
    if (n >= p.trials) return finish(ns, nm);
    setTrial(n);
    setTimeout(next, 200);
  }

  function finish(s: number, m: number) {
    setRunning(false);
    setCur(null);
    const total = s + m;
    const acc = total > 0 ? s / total : 0.5;
    add(Math.max(1, Math.floor(s / 4)));
    submit(s);
    sfx.win();
    recordPlay({ gameId: "flanker", accuracy: acc, correctCount: s });
  }

  const p = paramsFor(effective);

  useEndlessAutoRestart("flanker", !running && (score + misses) > 0, () => start());

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Middle Arrow</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Only the <b>middle</b> arrow counts. Ignore the ones around it.
      </p>
      <DifficultyPicker gameId="flanker" />
      <CbtCoach gameId="flanker" />

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Score<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Slips<br /><span className="text-primary text-lg">{misses}</span></span>
        <span className="rounded-xl bg-muted p-2">Trial<br /><span className="text-primary text-lg tabular-nums">{Math.min(trial + (running ? 1 : 0), p.trials)}/{p.trials}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className="mt-5 grid aspect-video place-items-center rounded-3xl bg-card border border-border">
        {cur ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-5xl">
              {cur.arr.map((d, i) => {
                const isMid = i === Math.floor(cur.arr.length / 2);
                return (
                  <span key={i} className={isMid ? "text-primary font-black" : "text-muted-foreground opacity-60"}>
                    {d === "L" ? "◀" : "▶"}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 h-1.5 w-32 mx-auto overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${(left / p.timeMs) * 100}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Press Start</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => running && answer("L")}
          disabled={!running}
          className="rounded-2xl bg-secondary py-6 text-3xl font-display text-secondary-foreground btn-pop active:btn-pop-active disabled:opacity-40 min-h-14"
          aria-label="Left"
        >
          ◀ Left
        </button>
        <button
          onClick={() => running && answer("R")}
          disabled={!running}
          className="rounded-2xl bg-primary py-6 text-3xl font-display text-primary-foreground btn-pop active:btn-pop-active disabled:opacity-40 min-h-14"
          aria-label="Right"
        >
          Right ▶
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          <Play className="size-5" /> {running ? "Restart" : "Start"}
        </button>
      </div>

      {!running && score + misses > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {score} right, {misses} slips
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <MoveHorizontal className="size-3.5" /> Trains: selective attention + conflict resolution (Eriksen flanker).
      </p>
    </div>
  );
}
