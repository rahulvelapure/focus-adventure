import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Repeat } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { signal } from "@/lib/frustration";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/switch")({
  head: () => ({
    meta: [
      { title: "Rule Switch — FoxFocus" },
      { name: "description", content: "Follow the rule that keeps changing. Trains task-switching and cognitive flexibility." },
    ],
  }),
  component: SwitchGame,
});

// Task-switching (set-shifting) paradigm inspired by Miyake's shift task.
// Each trial the cue tells you which rule to apply to a bi-dimensional card:
//  - "COLOR": is the shape RED or BLUE?
//  - "SHAPE": is it a CIRCLE or SQUARE?

type Rule = "COLOR" | "SHAPE";
type Card = { color: "red" | "blue"; shape: "circle" | "square" };

function paramsFor(level: "easy" | "medium" | "hard") {
  // switchProb = chance the rule changes trial-to-trial
  if (level === "hard") return { trials: 24, switchProb: 0.7, windowMs: 1800 };
  if (level === "medium") return { trials: 20, switchProb: 0.5, windowMs: 2400 };
  return { trials: 15, switchProb: 0.3, windowMs: 3200 };
}

function randCard(): Card {
  return {
    color: Math.random() < 0.5 ? "red" : "blue",
    shape: Math.random() < 0.5 ? "circle" : "square",
  };
}

function SwitchGame() {
  const { effective } = useDifficulty("switch");
  const p = paramsFor(effective);
  const [running, setRunning] = useState(false);
  const [rule, setRule] = useState<Rule>("COLOR");
  const [card, setCard] = useState<Card>(() => randCard());
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<"" | "ok" | "no">("");
  const [remaining, setRemaining] = useState(p.windowMs);
  const trialStart = useRef(0);
  const raf = useRef<number | null>(null);
  const timeout = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("switch");
  const prevRule = useRef<Rule>("COLOR");

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timeout.current) window.clearTimeout(timeout.current);
  }, []);

  function newTrial() {
    const nextRule: Rule = Math.random() < p.switchProb
      ? (prevRule.current === "COLOR" ? "SHAPE" : "COLOR")
      : prevRule.current;
    prevRule.current = nextRule;
    setRule(nextRule);
    setCard(randCard());
    setFlash("");
    setRemaining(p.windowMs);
    trialStart.current = Date.now();
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => {
      // Miss (timeout)
      setMisses((m) => m + 1);
      signal("switch", "timeout");
      sfx.bad();
      setFlash("no");
      window.setTimeout(next, 400);
    }, p.windowMs);
    const tick = () => {
      const left = p.windowMs - (Date.now() - trialStart.current);
      setRemaining(Math.max(0, left));
      if (left > 0) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  function start() {
    sfx.tap();
    setScore(0);
    setMisses(0);
    setTrial(0);
    prevRule.current = Math.random() < 0.5 ? "COLOR" : "SHAPE";
    setRunning(true);
    newTrial();
  }

  function next() {
    if (timeout.current) window.clearTimeout(timeout.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    const nextT = trial + 1;
    if (nextT >= p.trials) {
      setRunning(false);
      const total = score;
      const acc = (score + misses) > 0 ? score / (score + misses) : 0;
      recordPlay({ gameId: "switch", accuracy: acc, correctCount: score });
      submit(total);
      if (total > 0) add(total >= p.trials * 0.7 ? 3 : 1);
      setTimeout(() => sfx.win(), 200);
      return;
    }
    setTrial(nextT);
    newTrial();
  }

  function answer(kind: "red" | "blue" | "circle" | "square") {
    if (!running) return;
    const truth = rule === "COLOR" ? card.color : card.shape;
    const applicable = rule === "COLOR" ? (kind === "red" || kind === "blue") : (kind === "circle" || kind === "square");
    if (!applicable) {
      // Wrong dimension — punish gently
      setMisses((m) => m + 1);
      signal("switch", "miss");
      sfx.bad();
      setFlash("no");
      return;
    }
    if (kind === truth) {
      setScore((s) => s + 1);
      signal("switch", "hit");
      sfx.good();
      setFlash("ok");
    } else {
      setMisses((m) => m + 1);
      signal("switch", "miss");
      sfx.bad();
      setFlash("no");
    }
    window.setTimeout(next, 250);
  }

  useEndlessAutoRestart("switch", !running && (score + misses) > 0, () => start());

  const pct = (remaining / p.windowMs) * 100;
  const colorClass = card.color === "red" ? "text-[oklch(0.6_0.24_25)]" : "text-[oklch(0.55_0.22_250)]";

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Rule Switch</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow the rule at the top. It might change each round. Whisper the rule before you tap!
      </p>
      <DifficultyPicker gameId="switch" />
      <CbtCoach gameId="switch" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Trial<br /><span className="text-primary text-lg">{running ? trial + 1 : "—"}/{p.trials}</span></span>
        <span className="rounded-xl bg-muted p-2">Correct<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className={`mt-6 rounded-3xl border-2 p-6 transition-colors ${
        flash === "ok" ? "border-transparent bg-[oklch(0.85_0.14_150)]" : flash === "no" ? "border-transparent bg-destructive/40" : "border-border bg-card"
      }`}>
        <div className="flex items-center justify-center gap-2">
          <Repeat className="size-4 text-muted-foreground" />
          <span className="rounded-full bg-primary px-4 py-1 font-display text-lg text-primary-foreground">
            RULE: {running ? rule : "—"}
          </span>
        </div>

        <div className="mt-4 grid aspect-square place-items-center">
          {running ? (
            card.shape === "circle" ? (
              <div className={`size-40 rounded-full bg-current ${colorClass}`} aria-label={`${card.color} circle`} />
            ) : (
              <div className={`size-40 rounded-xl bg-current ${colorClass}`} aria-label={`${card.color} square`} />
            )
          ) : (
            <span className="text-6xl">🎯</span>
          )}
        </div>

        {running ? (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        ) : null}
      </div>

      {running ? (
        rule === "COLOR" ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => answer("red")} className="rounded-2xl bg-[oklch(0.6_0.24_25)] py-4 font-display text-lg text-white btn-pop active:btn-pop-active min-h-11">RED</button>
            <button onClick={() => answer("blue")} className="rounded-2xl bg-[oklch(0.55_0.22_250)] py-4 font-display text-lg text-white btn-pop active:btn-pop-active min-h-11">BLUE</button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => answer("circle")} className="rounded-2xl bg-secondary py-4 font-display text-lg text-secondary-foreground btn-pop active:btn-pop-active min-h-11">● CIRCLE</button>
            <button onClick={() => answer("square")} className="rounded-2xl bg-secondary py-4 font-display text-lg text-secondary-foreground btn-pop active:btn-pop-active min-h-11">■ SQUARE</button>
          </div>
        )
      ) : (
        <div className="mt-6 flex justify-center">
          <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11">
            <Play className="size-5" /> {(score + misses) > 0 ? "Play again" : "Start"}
          </button>
        </div>
      )}

      {!running && (score + misses) > 0 ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {score} correct · {misses} slips
        </div>
      ) : null}
    </div>
  );
}