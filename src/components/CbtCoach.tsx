import { useMemo, useState } from "react";
import { Brain, CheckCircle2, RotateCcw, Sparkles, X } from "lucide-react";
import { useDifficulty } from "@/lib/difficulty";
import { getLesson, useCbtDone, type CbtLevel } from "@/lib/cbt";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";
import { useSettings } from "@/lib/settings";
import { useFrustrationEvent } from "@/lib/frustration";
import { useEffect } from "react";

type Props = { gameId: string; title?: string };

/**
 * CbtCoach — a short, interactive CBT mini-lesson + drill matched to the
 * currently selected game and difficulty level. Renders as a collapsible
 * card so it never gets in the way of actual play.
 */
export function CbtCoach({ gameId, title = "Brain coach" }: Props) {
  const { effective } = useDifficulty(gameId);
  const level = effective as CbtLevel;
  const lesson = useMemo(() => getLesson(gameId, level), [gameId, level]);
  const { done, markDone, reset } = useCbtDone(gameId, level);
  const { add } = useStars();
  const { settings } = useSettings();
  const frustration = useFrustrationEvent();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  // Auto-surface the coach only when the child struggles in this game
  // during Focus Mode.
  useEffect(() => {
    if (settings.focusMode && frustration?.gameId === gameId) setOpen(true);
  }, [frustration, settings.focusMode, gameId]);

  if (!lesson) return null;
  // Focus Mode: hide the whole card unless the child (or frustration
  // detector) has opened it. Keeps the play screen distraction-free.
  if (settings.focusMode && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open brain coach"
        className="fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg"
      >
        <Brain className="size-5" />
      </button>
    );
  }
  const drill = lesson.drill;
  const current = drill[step];
  const isLast = step === drill.length - 1;

  function onChoose(i: number) {
    if (!current?.choices || current.correct == null) return;
    setPicked(i);
    if (i === current.correct) {
      sfx.good();
      setWrong(false);
    } else {
      sfx.bad();
      setWrong(true);
    }
  }

  function next() {
    // Non-choice steps (grounding) — just advance.
    const ok = !current?.choices || picked === current.correct;
    if (!ok) return;
    if (isLast) {
      markDone();
      add(1);
      sfx.win();
      setOpen(false);
      return;
    }
    setStep((s) => s + 1);
    setPicked(null);
    setWrong(false);
  }

  function restart() {
    reset();
    setStep(0);
    setPicked(null);
    setWrong(false);
    setOpen(true);
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3 text-left"
        aria-expanded={open}
      >
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Brain className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title} · {level}
          </span>
          <span className="block font-display text-sm leading-tight">
            {lesson.skill}
          </span>
        </span>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-foreground">
            <CheckCircle2 className="size-3" /> done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
            <Sparkles className="size-3" /> 1★
          </span>
        )}
        <span aria-hidden className={`ml-1 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">{lesson.why}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {lesson.lesson.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-primary">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-muted p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Drill {step + 1} / {drill.length}
              </p>
              {done ? (
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground"
                  aria-label="Restart drill"
                >
                  <RotateCcw className="size-3" /> redo
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-semibold">{current.prompt}</p>

            {current.choices ? (
              <div className="mt-2 space-y-1.5">
                {current.choices.map((c, i) => {
                  const isPicked = picked === i;
                  const isCorrect = current.correct === i;
                  const revealCorrect = wrong && isCorrect;
                  return (
                    <button
                      key={i}
                      onClick={() => onChoose(i)}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm min-h-11 ${
                        isPicked && isCorrect
                          ? "bg-primary text-primary-foreground"
                          : isPicked && !isCorrect
                          ? "bg-destructive/20 text-destructive-foreground"
                          : revealCorrect
                          ? "bg-primary/20"
                          : "bg-card"
                      }`}
                      aria-pressed={isPicked}
                    >
                      {c}
                    </button>
                  );
                })}
                {wrong ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <X className="size-3" /> Not quite — try the highlighted one.
                  </p>
                ) : null}
              </div>
            ) : null}

            {current.sayItOutLoud ? (
              <p className="mt-3 rounded-lg bg-accent/40 px-3 py-2 text-xs font-semibold">
                🗣️ Say it out loud: “{current.sayItOutLoud}”
              </p>
            ) : null}

            <div className="mt-3 flex justify-end">
              <button
                onClick={next}
                disabled={!!current.choices && picked !== current.correct}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground btn-pop active:btn-pop-active disabled:opacity-40 min-h-11"
              >
                {isLast ? "Finish drill (+1★)" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}