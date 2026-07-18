import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Hourglass } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";

export const Route = createFileRoute("/hold")({
  head: () => ({
    meta: [
      { title: "Hold Steady — FoxFocus" },
      { name: "description", content: "Press and hold — release only when the star glows. Impulse control training." },
    ],
  }),
  component: Hold,
});

function paramsFor(level: "easy" | "medium" | "hard") {
  // ranges in ms for target hold windows, grows each round
  if (level === "hard") return { rounds: 6, base: 2500, grow: 800, tol: 300 };
  if (level === "medium") return { rounds: 5, base: 1800, grow: 600, tol: 450 };
  return { rounds: 4, base: 1200, grow: 400, tol: 700 };
}

function Hold() {
  const { effective } = useDifficulty("hold");
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [phase, setPhase] = useState<"idle" | "wait" | "hold" | "result">("idle");
  const [msg, setMsg] = useState("");
  const startedAt = useRef<number>(0);
  const tick = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("hold");

  useEffect(() => () => { if (tick.current) window.clearInterval(tick.current); }, []);

  const p = paramsFor(effective);

  function beginRound(r: number) {
    const t = p.base + r * p.grow;
    setTarget(t);
    setElapsed(0);
    setPhase("wait");
    setMsg("Press and hold when ready…");
  }

  function start() {
    sfx.tap();
    setScore(0); setMisses(0); setRound(0);
    setRunning(true);
    beginRound(0);
  }

  function onDown() {
    if (!running || phase !== "wait") {
      if (running && phase === "hold") return;
      return;
    }
    setPressing(true);
    setPhase("hold");
    startedAt.current = Date.now();
    setElapsed(0);
    if (tick.current) window.clearInterval(tick.current);
    tick.current = window.setInterval(() => {
      setElapsed(Date.now() - startedAt.current);
    }, 50);
  }

  function onUp() {
    if (!running || phase !== "hold") { setPressing(false); return; }
    setPressing(false);
    if (tick.current) window.clearInterval(tick.current);
    const e = Date.now() - startedAt.current;
    const diff = Math.abs(e - target);
    const ok = diff <= p.tol;
    if (ok) { sfx.good(); setScore((s) => s + 1); setMsg(`Perfect! (${diff}ms off)`); }
    else if (e < target) { sfx.bad(); setMisses((m) => m + 1); setMsg(`Too early — need ${target}ms, held ${e}ms`); }
    else { sfx.bad(); setMisses((m) => m + 1); setMsg(`Too late — held ${e}ms`); }
    setPhase("result");
    const next = round + 1;
    setTimeout(() => {
      if (next >= p.rounds) {
        finish(ok ? score + 1 : score, ok ? misses : misses + 1);
      } else {
        setRound(next);
        beginRound(next);
      }
    }, 900);
  }

  function finish(s: number, m: number) {
    setRunning(false);
    setPhase("idle");
    const acc = (s + m) > 0 ? s / (s + m) : 0.5;
    add(Math.max(1, s));
    submit(s);
    sfx.win();
    recordPlay({ gameId: "hold", accuracy: acc, correctCount: s });
  }

  const progress = target > 0 ? Math.min(1, elapsed / target) : 0;
  const inWindow = elapsed >= target - p.tol && elapsed <= target + p.tol;

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Hold Steady</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Press and <b>hold</b>. Let go when the ring turns green. Wait — don't rush!
      </p>
      <DifficultyPicker gameId="hold" />
      <CbtCoach gameId="hold" />

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Round<br /><span className="text-primary text-lg tabular-nums">{Math.min(round + 1, p.rounds)}/{p.rounds}</span></span>
        <span className="rounded-xl bg-muted p-2">Target<br /><span className="text-primary text-lg tabular-nums">{(target / 1000).toFixed(1)}s</span></span>
        <span className="rounded-xl bg-muted p-2">Perfect<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className="mt-5 grid aspect-square w-full max-w-sm mx-auto place-items-center">
        <button
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={() => pressing && onUp()}
          disabled={!running || phase === "result"}
          aria-label="Hold pad"
          className="relative grid size-full place-items-center rounded-full border-8 transition-colors disabled:opacity-50"
          style={{
            borderColor: inWindow ? "oklch(0.7 0.2 145)" : pressing ? "oklch(0.7 0.18 60)" : "var(--border)",
            background: pressing ? "var(--muted)" : "var(--card)",
          }}
        >
          <div className="text-center">
            <span className="block text-5xl">{inWindow ? "⭐" : pressing ? "🟠" : "⚪"}</span>
            <span className="mt-2 block text-xs font-bold tabular-nums text-muted-foreground">
              {pressing ? `${(elapsed / 1000).toFixed(2)}s` : msg || "Ready"}
            </span>
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
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
          <Star className="size-5 fill-current" /> {score} perfect holds
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Hourglass className="size-3.5" /> Trains: sustained motor inhibition + time estimation.
      </p>
    </div>
  );
}
