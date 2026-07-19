import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Zap } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { warnSwallowed } from "@/lib/log";

export const Route = createFileRoute("/reaction")({
  head: () => ({
    meta: [
      { title: "Quick Tap — FoxFocus" },
      { name: "description", content: "Wait for green, then tap fast. A reaction-time game that trains alertness and self-control." },
    ],
  }),
  component: Reaction,
});

type State = "idle" | "waiting" | "go" | "early" | "done";

function Reaction() {
  const [state, setState] = useState<State>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const timer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const { add } = useStars();
  const { effective, endless } = useDifficulty("reaction");

  useEffect(() => {
    const raw = window.localStorage.getItem("foxfocus.reaction.best");
    if (raw) setBest(Number(raw));
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function start() {
    setMs(null);
    setState("waiting");
    // Higher levels shorten the pre-cue window (harder to anticipate).
    const base = effective === "hard" ? 600 : effective === "medium" ? 900 : 1200;
    const jitter = effective === "hard" ? 1200 : effective === "medium" ? 1800 : 2500;
    const wait = base + Math.random() * jitter;
    timer.current = window.setTimeout(() => {
      setState("go");
      startedAt.current = performance.now();
    }, wait);
  }

  function tap() {
    if (state === "waiting") {
      if (timer.current) window.clearTimeout(timer.current);
      sfx.bad();
      setState("early");
      return;
    }
    if (state === "go") {
      const t = Math.round(performance.now() - startedAt.current);
      setMs(t);
      setState("done");
      sfx.good();
      const reward = t < 300 ? 3 : t < 500 ? 2 : 1;
      add(reward);
      recordPlay({ gameId: "reaction", accuracy: t < 400 ? 1 : t < 600 ? 0.7 : 0.4, correctCount: 1 });
      setRound((r) => r + 1);
      if (best == null || t < best) {
        setBest(t);
        try {
          window.localStorage.setItem("foxfocus.reaction.best", String(t));
        } catch (error) {
          warnSwallowed("reaction.writeBest", error);
        }
      }
      if (endless) {
        window.setTimeout(() => start(), 900);
      }
    } else if (state === "idle" || state === "early" || state === "done") {
      start();
    }
  }

  const bg =
    state === "go"
      ? "bg-[oklch(0.72_0.18_150)]"
      : state === "waiting"
        ? "bg-destructive"
        : state === "early"
          ? "bg-destructive"
          : "bg-muted";
  const label =
    state === "idle"
      ? "Tap to start"
      : state === "waiting"
        ? "Wait for green…"
        : state === "go"
          ? "TAP!"
          : state === "early"
            ? "Too soon — try again"
            : `${ms} ms`;

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Quick Tap</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wait for green. Tap as fast as you can. Don't jump the gun.
      </p>
      <DifficultyPicker gameId="reaction" endlessSupported />
      <CbtCoach gameId="reaction" />

      <div className="mt-4 flex justify-between text-sm font-bold">
        <span className="inline-flex items-center gap-1">
          <Zap className="size-4 text-primary" /> Best:{" "}
          <span className="tabular-nums">{best ?? "—"}</span> ms
        </span>
        {ms != null && state === "done" ? (
          <span>
            Last: <span className="tabular-nums text-primary">{ms}</span> ms · Round {round}
          </span>
        ) : null}
      </div>

      <button
        onClick={tap}
        aria-label="Reaction pad"
        className={`mt-6 flex aspect-square w-full items-center justify-center rounded-3xl font-display text-2xl text-primary-foreground transition-colors ${bg}`}
      >
        {label}
      </button>

      {state === "done" ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent p-4 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> +{ms != null && ms < 300 ? 3 : ms != null && ms < 500 ? 2 : 1} stars
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
          <Play className="size-5" /> {state === "idle" ? "Start" : "New round"}
        </button>
      </div>
    </div>
  );
}