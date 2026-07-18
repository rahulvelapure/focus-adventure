import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx, vibe } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { signal as frust } from "@/lib/frustration";
import { useBest } from "@/lib/scores";

export const Route = createFileRoute("/math")({
  head: () => ({
    meta: [
      { title: "Quick Math — FoxFocus" },
      { name: "description", content: "Adaptive add, subtract, and missing-number drills that reward focus with stars." },
    ],
  }),
  component: QuickMath,
});

type Op = "+" | "-" | "?";
type Q = { a: number; b: number; op: Op; answer: number; choices: number[]; prompt: string };

function rangeFor(level: string) {
  if (level === "hard") return { max: 50, sub: true, missing: true };
  if (level === "medium") return { max: 20, sub: true, missing: true };
  return { max: 10, sub: false, missing: false };
}

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

function buildQuestion(level: string): Q {
  const { max, sub, missing } = rangeFor(level);
  const modes: Op[] = ["+"];
  if (sub) modes.push("-");
  if (missing) modes.push("?");
  const op = modes[rand(modes.length)];
  let a = rand(max) + 1;
  let b = rand(max) + 1;
  let answer: number;
  let prompt: string;
  if (op === "+") {
    answer = a + b;
    prompt = `${a} + ${b} = ?`;
  } else if (op === "-") {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
    prompt = `${a} − ${b} = ?`;
  } else {
    // missing number: a + ? = c
    const c = a + b;
    answer = b;
    prompt = `${a} + ? = ${c}`;
  }
  // Build 4 choices around the correct answer.
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const off = rand(5) + 1;
    const val = answer + (Math.random() < 0.5 ? -off : off);
    if (val >= 0) set.add(val);
  }
  const choices = Array.from(set).sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices, prompt };
}

function QuickMath() {
  const { effective } = useDifficulty("math");
  const [q, setQ] = useState<Q>(() => buildQuestion(effective));
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const { add } = useStars();
  const { best, submit } = useBest("math", "max");

  useEffect(() => {
    setQ(buildQuestion(effective));
    setPicked(null);
  }, [effective]);

  const next = useCallback(() => {
    setPicked(null);
    setQ(buildQuestion(effective));
  }, [effective]);

  function pick(v: number) {
    if (picked != null) return;
    setPicked(v);
    setTotal((t) => t + 1);
    if (v === q.answer) {
      sfx.good();
      vibe(15);
      frust("math", "hit");
      const s = streak + 1;
      setStreak(s);
      setCorrect((c) => {
        const nc = c + 1;
        submit(nc);
        return nc;
      });
      const bonus = s % 5 === 0 ? 2 : 1;
      add(bonus);
      window.setTimeout(next, 550);
    } else {
      sfx.bad();
      vibe([30, 40, 30]);
      frust("math", "miss");
      setStreak(0);
      window.setTimeout(next, 900);
    }
  }

  // Endless: report accuracy periodically for adaptive tuning.
  useEffect(() => {
    if (total > 0 && total % 8 === 0) {
      recordPlay({ gameId: "math", accuracy: correct / total, correctCount: correct });
    }
  }, [total, correct]);

  const acc = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [correct, total]);

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Calculator className="size-5" />
        </span>
        <h1 className="text-2xl font-display">Quick Math</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Add, subtract, and missing-number puzzles. Numbers grow as you improve.
      </p>
      <DifficultyPicker gameId="math" endlessSupported />
      <CbtCoach gameId="math" />

      <div className="mt-4 flex justify-between text-sm font-bold">
        <span>Streak: <span className="text-primary tabular-nums">{streak}</span></span>
        <span>Best: <span className="text-primary tabular-nums">{best ?? 0}</span></span>
        <span>{acc}% right</span>
      </div>

      <div className="mt-6 rounded-3xl bg-card border border-border p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="font-display text-4xl tabular-nums">{q.prompt}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === q.answer;
          const showCorrect = picked != null && isCorrect;
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`rounded-2xl p-5 font-display text-2xl tabular-nums min-h-16 btn-pop active:btn-pop-active ${
                isPicked && isCorrect
                  ? "bg-primary text-primary-foreground"
                  : isPicked && !isCorrect
                    ? "bg-destructive text-destructive-foreground"
                    : showCorrect
                      ? "bg-primary/20"
                      : "bg-card border border-border"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {picked != null && picked === q.answer ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> +{streak % 5 === 0 && streak > 0 ? 2 : 1} star
        </div>
      ) : null}
    </div>
  );
}