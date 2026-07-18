import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";
import { CbtCoach } from "@/components/CbtCoach";
import { signal as frust } from "@/lib/frustration";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/stopgo")({
  head: () => ({
    meta: [
      { title: "Stop & Go — FoxFocus" },
      { name: "description", content: "Tap green, freeze on red. A classic go/no-go game that builds impulse control." },
    ],
  }),
  component: StopGo,
});

type State = "idle" | "playing" | "done";
type Signal = "go" | "stop" | null;

const ROUND_MS = 30_000;

function StopGo() {
  const [state, setState] = useState<State>("idle");
  const [signal, setSignal] = useState<Signal>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000);
  const timers = useRef<number[]>([]);
  const { add } = useStars();

  function clearAll() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function schedule() {
    const gap = 700 + Math.random() * 1200;
    const isGo = Math.random() < 0.75;
    const showFor = isGo ? 900 : 800;
    const t1 = window.setTimeout(() => {
      setSignal(isGo ? "go" : "stop");
      const t2 = window.setTimeout(() => {
        setSignal((s) => {
          if (s === "go") setMisses((m) => m + 1);
          return null;
        });
        schedule();
      }, showFor);
      timers.current.push(t2);
    }, gap);
    timers.current.push(t1);
  }

  function start() {
    clearAll();
    setScore(0);
    setMisses(0);
    setSignal(null);
    setTimeLeft(ROUND_MS / 1000);
    setState("playing");
    schedule();
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((ROUND_MS - (Date.now() - startedAt)) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        window.clearInterval(tick);
      }
    }, 200);
    const end = window.setTimeout(() => {
      clearAll();
      window.clearInterval(tick);
      setSignal(null);
      setState("done");
    }, ROUND_MS);
    timers.current.push(end);
  }

  useEffect(() => () => clearAll(), []);

  useEffect(() => {
    if (state !== "done") return;
    const reward = Math.max(0, Math.floor(score / 3) - misses);
    if (reward > 0) {
      add(reward);
      sfx.win();
    }
  }, [state, score, misses, add]);

  function tap() {
    if (state !== "playing") return;
    if (signal === "go") {
      sfx.good();
      setScore((s) => s + 1);
      setSignal(null);
      frust("stopgo", "hit");
    } else if (signal === "stop") {
      sfx.bad();
      setMisses((m) => m + 1);
      setSignal(null);
      frust("stopgo", "miss");
    }
  }

  useEndlessAutoRestart("stopgo", state === "done", () => start());

  const bg =
    signal === "go"
      ? "bg-[oklch(0.75_0.18_150)]"
      : signal === "stop"
        ? "bg-destructive"
        : "bg-muted";
  const label = signal === "go" ? "GO — tap!" : signal === "stop" ? "STOP — hands off!" : "Wait…";

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Stop & Go</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the circle when it is <b className="text-foreground">green</b>. Freeze when it is <b className="text-foreground">red</b>.
      </p>
      <CbtCoach gameId="stopgo" />

      <div className="mt-4 flex justify-between text-sm font-bold">
        <span>Score: <span className="tabular-nums text-primary">{score}</span></span>
        <span>Misses: <span className="tabular-nums text-destructive">{misses}</span></span>
        <span>Time: <span className="tabular-nums">{timeLeft}s</span></span>
      </div>

      <button
        onClick={tap}
        disabled={state !== "playing"}
        aria-label="Tap when green"
        className={`mt-6 flex aspect-square w-full items-center justify-center rounded-full text-3xl font-display text-primary-foreground transition-colors ${bg} disabled:opacity-70`}
      >
        {state === "idle" ? "Ready?" : state === "done" ? "Done!" : label}
      </button>

      {state === "done" ? (
        <div className="mt-6 rounded-2xl bg-accent p-4 text-center font-bold text-accent-foreground">
          <div className="flex items-center justify-center gap-2">
            <Star className="size-5 fill-current" />
            +{Math.max(0, Math.floor(score / 3) - misses)} stars
          </div>
          <p className="mt-1 text-sm font-semibold opacity-80">
            {score} correct · {misses} slip-ups
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          {state === "playing" ? <RotateCcw className="size-5" /> : <Play className="size-5" />}
          {state === "playing" ? "Restart" : state === "done" ? "Play again" : "Start"}
        </button>
      </div>
    </div>
  );
}