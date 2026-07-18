import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx, tone } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/simon")({
  head: () => ({
    meta: [
      { title: "Copy Cat — FoxFocus" },
      { name: "description", content: "Watch the color sequence, then copy it. Trains attention and working memory." },
    ],
  }),
  component: Simon,
});

const PADS = [
  { color: "bg-[oklch(0.72_0.18_150)]", freq: 330 },
  { color: "bg-[oklch(0.7_0.19_25)]", freq: 440 },
  { color: "bg-[oklch(0.72_0.16_235)]", freq: 550 },
  { color: "bg-[oklch(0.85_0.15_85)]", freq: 660 },
];

type Phase = "idle" | "showing" | "input" | "over";

function Simon() {
  const { effective } = useDifficulty("simon");
  const stepMs = effective === "hard" ? 380 : effective === "medium" ? 520 : 700;
  const flashMs = effective === "hard" ? 260 : effective === "medium" ? 340 : 420;
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { add } = useStars();
  const awarded = useRef(false);

  const flash = useCallback((i: number, ms = flashMs) => {
    setActive(i);
    tone({ freq: PADS[i].freq, duration: ms / 1000, type: "triangle" });
    setTimeout(() => setActive(null), ms);
  }, [flashMs]);

  const play = useCallback(
    (list: number[]) => {
      setPhase("showing");
      list.forEach((i, idx) => {
        setTimeout(() => {
          flash(i);
          if (idx === list.length - 1) {
            setTimeout(() => {
              setPhase("input");
              setStep(0);
            }, 500);
          }
        }, stepMs * idx + 400);
      });
    },
    [flash, stepMs],
  );

  function begin() {
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    awarded.current = false;
    play(first);
  }

  function nextRound() {
    const next = [...seq, Math.floor(Math.random() * 4)];
    setSeq(next);
    play(next);
  }

  function tap(i: number) {
    if (phase !== "input") return;
    flash(i, 200);
    if (seq[step] !== i) {
      sfx.bad();
      setPhase("over");
      const reward = Math.max(0, seq.length - 1);
      if (reward > 0 && !awarded.current) {
        awarded.current = true;
        add(reward);
      }
      recordPlay({ gameId: "simon", accuracy: Math.min(1, (seq.length - 1) / 8), correctCount: seq.length - 1 });
      return;
    }
    const nextStep = step + 1;
    if (nextStep === seq.length) {
      setTimeout(() => {
        sfx.good();
        nextRound();
      }, 400);
    } else {
      setStep(nextStep);
    }
  }

  useEffect(() => () => setActive(null), []);
  useEndlessAutoRestart("simon", phase === "over", () => { setStep(0); begin(); });

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Copy Cat</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Watch the pattern. Tap it back. Round: <b className="text-foreground">{seq.length}</b>
      </p>
      <DifficultyPicker gameId="simon" />
      <CbtCoach gameId="simon" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        {PADS.map((p, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            disabled={phase !== "input"}
            aria-label={`Pad ${i + 1}`}
            className={`aspect-square rounded-3xl transition-all ${p.color} ${
              active === i ? "scale-95 brightness-125 ring-4 ring-white/70" : "opacity-90"
            } disabled:opacity-70`}
          />
        ))}
      </div>

      {phase === "over" ? (
        <div className="mt-6 rounded-2xl bg-accent p-4 text-center font-bold text-accent-foreground">
          <div className="flex items-center justify-center gap-2">
            <Star className="size-5 fill-current" /> +{Math.max(0, seq.length - 1)} stars
          </div>
          <p className="mt-1 text-sm opacity-80">Best streak: {seq.length - 1}</p>
        </div>
      ) : null}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            sfx.tap();
            begin();
          }}
          disabled={phase === "showing" || phase === "input"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11 disabled:opacity-60"
        >
          <Play className="size-5" />
          {phase === "over" ? "Play again" : phase === "idle" ? "Start" : "Watching…"}
        </button>
      </div>
    </div>
  );
}