import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx, tone } from "@/lib/feedback";
import { CbtCoach } from "@/components/CbtCoach";
import { recordPlay } from "@/lib/progress";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Streak — FoxFocus" },
      { name: "description", content: "A kid-sized Pomodoro timer that builds focus in short 5-minute streaks with star rewards." },
    ],
  }),
  component: Focus,
});

const CHOICES = [3, 5, 10] as const;

function Focus() {
  const [minutes, setMinutes] = useState<(typeof CHOICES)[number]>(5);
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  const { add } = useStars();
  const done = useRef(false);

  useEffect(() => {
    setLeft(minutes * 60);
    setRunning(false);
    done.current = false;
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setRunning(false);
          if (!done.current) {
            done.current = true;
            add(minutes);
            sfx.win();
            recordPlay({ gameId: "focus", accuracy: 1, minutes });
          }
          return 0;
        }
        if (s <= 4 && s > 1) tone({ freq: 660, duration: 0.08, type: "triangle", volume: 0.1 });
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, add, minutes]);

  const total = minutes * 60;
  const pct = 1 - left / total;
  const mm = Math.floor(left / 60);
  const ss = left % 60;
  const finished = left === 0;

  const size = 240;
  const r = 108;
  const c = 2 * Math.PI * r;

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Focus Streak</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a length. Start. When Rex's ring fills up, you earn stars.
      </p>
      <CbtCoach gameId="focus" />

      <div className="mt-6 flex justify-center gap-2">
        {CHOICES.map((m) => (
          <button
            key={m}
            onClick={() => setMinutes(m)}
            className={`rounded-full px-4 py-2 text-sm font-bold min-h-11 min-w-11 ${
              m === minutes
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {m} min
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="var(--card)" stroke="var(--muted)" strokeWidth="14" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <text
            x="50%"
            y="52%"
            textAnchor="middle"
            fontFamily="Fredoka, sans-serif"
            fontSize="44"
            fontWeight="700"
            fill="var(--foreground)"
          >
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </text>
        </svg>
      </div>

      {finished ? (
        <div
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent p-4 text-accent-foreground font-bold"
          role="status"
        >
          <Star className="size-5 fill-current" aria-hidden />
          Nice! +{minutes} stars
        </div>
      ) : null}

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => {
            sfx.tap();
            if (finished) {
              setLeft(minutes * 60);
              done.current = false;
            }
            setRunning((r) => !r);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Pause" : finished ? "Again" : "Start"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setLeft(minutes * 60);
            done.current = false;
          }}
          aria-label="Reset"
          className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-3 font-bold text-muted-foreground min-h-11 min-w-11"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  );
}