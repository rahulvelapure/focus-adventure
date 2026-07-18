import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx, tone } from "@/lib/feedback";

export const Route = createFileRoute("/breathe")({
  head: () => ({
    meta: [
      { title: "Calm Bubble — FoxFocus" },
      { name: "description", content: "A guided breathing bubble to help kids with ADHD calm down and reset." },
    ],
  }),
  component: Breathe,
});

// 4-7-8 style, softened for kids: inhale 4, hold 4, exhale 6
type Phase = { name: string; secs: number; scale: number };
const PHASES: Phase[] = [
  { name: "Breathe in", secs: 4, scale: 1 },
  { name: "Hold", secs: 4, scale: 1 },
  { name: "Breathe out", secs: 6, scale: 0.55 },
];

function Breathe() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].secs);
  const [cycles, setCycles] = useState(0);
  const { add } = useStars();
  const awarded = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((s) => {
        if (s > 1) return s - 1;
        // advance phase
        setPhase((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          // gentle chime on phase change
          tone({
            freq: next === 0 ? 520 : next === 1 ? 660 : 440,
            duration: 0.18,
            type: "sine",
            volume: 0.12,
          });
          return next;
        });
        // remaining will be reset by the effect below reacting to phase
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Reset remaining whenever phase changes (keeps timer in sync)
  useEffect(() => {
    setRemaining(PHASES[phase].secs);
  }, [phase]);

  useEffect(() => {
    if (cycles >= 3 && !awarded.current) {
      awarded.current = true;
      add(2);
      sfx.win();
    }
  }, [cycles, add]);

  const current = PHASES[phase];

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Calm Bubble</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Watch the bubble. Breathe with it. Three rounds = a star.
      </p>

      <div className="mt-8 flex flex-col items-center">
        <div
          className="relative flex size-64 items-center justify-center rounded-full"
          style={{ background: "var(--gradient-sky)" }}
        >
          <div
            className="flex size-56 items-center justify-center rounded-full bg-white/40 backdrop-blur"
            style={{
              transform: `scale(${current.scale})`,
              transition: `transform ${current.secs}s ease-in-out`,
            }}
          >
            <div className="text-center text-secondary-foreground">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">
                {current.name}
              </p>
              <p className="mt-1 font-display text-5xl tabular-nums">{remaining}</p>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm font-semibold text-muted-foreground">
          Rounds completed: <b className="text-foreground">{cycles}</b>
        </p>

        {cycles >= 3 ? (
          <div className="mt-4 flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-bold text-accent-foreground">
            <Star className="size-5 fill-current" /> +2 stars
          </div>
        ) : null}

        <button
          onClick={() => {
            sfx.tap();
            setRunning((r) => !r);
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}