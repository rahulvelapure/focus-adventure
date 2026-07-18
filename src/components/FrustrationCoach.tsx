import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wind, X, Sparkles } from "lucide-react";
import { useFrustrationEvent, clearFrustration, type Suggestion } from "@/lib/frustration";
import { sfx } from "@/lib/feedback";

/**
 * A friendly, low-friction overlay that appears when the frustration
 * detector fires. Runs a 3-cycle box-breath (in-4 / hold-2 / out-6),
 * then shows a personalized next-step suggestion. Non-blocking — the
 * child can dismiss any time and keep playing.
 */
export function FrustrationCoach() {
  const ev = useFrustrationEvent();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (!ev) return;
    setSuggestion(ev.suggestion);
    setPhase("in");
    setCycle(0);
    setOpen(true);
    sfx.tap();
  }, [ev]);

  useEffect(() => {
    if (!open) return;
    const dur = phase === "in" ? 4000 : phase === "hold" ? 2000 : 6000;
    const t = window.setTimeout(() => {
      if (phase === "in") setPhase("hold");
      else if (phase === "hold") setPhase("out");
      else {
        if (cycle >= 2) return; // stop after 3 cycles, keep card open
        setCycle((c) => c + 1);
        setPhase("in");
      }
    }, dur);
    return () => window.clearTimeout(t);
  }, [open, phase, cycle]);

  if (!open || !suggestion) return null;

  const done = cycle >= 2 && phase === "out";
  const scale = phase === "in" ? 1 : phase === "hold" ? 1 : 0.55;
  const label = phase === "in" ? "Breathe in…" : phase === "hold" ? "Hold…" : "Breathe out…";

  function close() {
    clearFrustration();
    setOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Take a calm break"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            <Wind className="size-3.5" /> Micro-break
          </span>
          <button
            aria-label="Close"
            onClick={close}
            className="grid size-9 place-items-center rounded-full text-muted-foreground min-h-11 min-w-11"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Looks like this round is tricky. Let's reset for a few breaths, then
          keep going.
        </p>

        <div className="mt-4 grid aspect-square place-items-center">
          <div
            aria-hidden
            className="grid size-40 place-items-center rounded-full bg-primary/20 text-primary transition-transform duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${scale})`, transitionDuration: phase === "hold" ? "2000ms" : phase === "in" ? "4000ms" : "6000ms" }}
          >
            <span className="font-display text-lg">{label}</span>
          </div>
        </div>

        {done ? (
          <div className="mt-4 rounded-2xl bg-muted p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Try this next
            </p>
            <p className="mt-1 font-display text-base">{suggestion.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{suggestion.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestion.action ? (
                <Link
                  to={suggestion.action.to}
                  onClick={close}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground min-h-11"
                >
                  <Sparkles className="size-4" /> {suggestion.action.label}
                </Link>
              ) : null}
              <button
                onClick={close}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground min-h-11"
              >
                Keep playing
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {3 - cycle} calm breath{3 - cycle > 1 ? "s" : ""} to go
          </p>
        )}
      </div>
    </div>
  );
}