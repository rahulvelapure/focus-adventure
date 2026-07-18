import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Star, Eye, Hand } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { signal } from "@/lib/frustration";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/plando")({
  head: () => ({
    meta: [
      { title: "Plan → Do — FoxFocus" },
      { name: "description", content: "Study the plan, then tap the steps in order. Builds planning and sequencing." },
    ],
  }),
  component: PlanDo,
});

const ICONS = ["🍎", "🐟", "⭐", "🌈", "🚀", "🐝", "🍩", "🎈", "🐢"];

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { steps: 6, planMs: 6000 };
  if (level === "medium") return { steps: 5, planMs: 7000 };
  return { steps: 3, planMs: 8000 };
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function PlanDo() {
  const { effective } = useDifficulty("plando");
  const p = paramsFor(effective);
  const [phase, setPhase] = useState<"idle" | "plan" | "do" | "done">("idle");
  const [plan, setPlan] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [planLeft, setPlanLeft] = useState(0);
  const [wrong, setWrong] = useState(false);
  const timer = useRef<number | null>(null);
  const roundStats = useRef({ hits: 0, misses: 0 });
  const { add } = useStars();
  const { best, submit } = useBest("plando");

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  function newRound() {
    const items = shuffle(ICONS).slice(0, p.steps);
    setPlan(items);
    setBoard(shuffle(items));
    setPos(0);
    setWrong(false);
    setPhase("plan");
    setPlanLeft(p.planMs);
    if (timer.current) window.clearInterval(timer.current);
    const started = Date.now();
    timer.current = window.setInterval(() => {
      const left = p.planMs - (Date.now() - started);
      if (left <= 0) {
        if (timer.current) window.clearInterval(timer.current);
        setPlanLeft(0);
        setPhase("do");
      } else {
        setPlanLeft(left);
      }
    }, 100);
  }

  function start() {
    sfx.tap();
    setScore(0);
    setRounds(0);
    roundStats.current = { hits: 0, misses: 0 };
    newRound();
  }

  function tap(icon: string, i: number) {
    if (phase !== "do") return;
    const want = plan[pos];
    if (icon !== want) {
      sfx.bad();
      setWrong(true);
      roundStats.current.misses += 1;
      signal("plando", "miss");
      window.setTimeout(() => setWrong(false), 250);
      return;
    }
    sfx.good();
    signal("plando", "hit");
    roundStats.current.hits += 1;
    setScore((s) => s + 1);
    // remove tapped
    setBoard((b) => b.filter((_, idx) => idx !== i));
    if (pos + 1 >= plan.length) {
      // round complete
      setRounds((r) => r + 1);
      const { hits, misses } = roundStats.current;
      const acc = hits + misses > 0 ? hits / (hits + misses) : 1;
      recordPlay({ gameId: "plando", accuracy: acc, correctCount: hits });
      roundStats.current = { hits: 0, misses: 0 };
      sfx.win();
      setPhase("done");
    } else {
      setPos(pos + 1);
    }
  }

  function finish() {
    const total = score;
    if (total > 0) {
      add(Math.max(1, Math.floor(total / 3)));
      submit(total);
    }
  }

  useEndlessAutoRestart("plando", phase === "done", () => newRound());

  useEffect(() => {
    if (phase !== "done") return;
    // one-shot: bank stars once per round
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const cols = board.length <= 4 ? "grid-cols-2" : board.length <= 6 ? "grid-cols-3" : "grid-cols-3";

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Plan → Do</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Study the plan. Then tap the tiles in the exact same order.
      </p>
      <DifficultyPicker gameId="plando" />
      <CbtCoach gameId="plando" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Round<br /><span className="text-primary text-lg">{rounds}</span></span>
        <span className="rounded-xl bg-muted p-2">Correct<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      {phase === "plan" ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-primary bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Eye className="size-4" /> Memorize the plan
          </div>
          <ol className="mt-3 flex flex-wrap justify-center gap-2 text-3xl">
            {plan.map((e, i) => (
              <li key={i} className="grid size-14 place-items-center rounded-2xl bg-primary/10">
                <span className="text-[10px] font-bold text-primary block leading-none">{i + 1}</span>
                <span>{e}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-100"
              style={{ width: `${(planLeft / p.planMs) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => { if (timer.current) window.clearInterval(timer.current); setPhase("do"); }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground min-h-11"
            >
              I'm ready
            </button>
          </div>
        </div>
      ) : null}

      {phase === "do" ? (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
            <Hand className="size-4" /> Step {pos + 1} of {plan.length}
          </div>
          <ul className={`mt-3 grid ${cols} gap-2.5`}>
            {board.map((e, i) => (
              <li key={`${e}-${i}`} className="aspect-square">
                <button
                  onClick={() => tap(e, i)}
                  className={`size-full rounded-2xl bg-card text-4xl btn-pop active:btn-pop-active ${wrong ? "ring-2 ring-destructive" : ""}`}
                  aria-label={`Tile ${e}`}
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {phase === "idle" || phase === "done" ? (
        <div className="mt-6 flex justify-center">
          <button
            onClick={phase === "done" ? newRound : start}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
          >
            <Play className="size-5" /> {phase === "done" ? "Next round" : "Start"}
          </button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> Round done!
        </div>
      ) : null}
    </div>
  );
}