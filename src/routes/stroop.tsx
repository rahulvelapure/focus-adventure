import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Palette } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/stroop")({
  head: () => ({
    meta: [
      { title: "Color Words — FoxFocus" },
      { name: "description", content: "Tap the INK color, not the word. Inhibition training." },
    ],
  }),
  component: Stroop,
});

const COLORS = [
  { id: "red", label: "RED", css: "oklch(0.65 0.22 25)" },
  { id: "blue", label: "BLUE", css: "oklch(0.60 0.20 250)" },
  { id: "green", label: "GREEN", css: "oklch(0.68 0.18 145)" },
  { id: "yellow", label: "YELLOW", css: "oklch(0.85 0.16 95)" },
] as const;

type C = typeof COLORS[number];

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { trials: 20, incongruentProb: 0.85, timeMs: 2500 };
  if (level === "medium") return { trials: 15, incongruentProb: 0.7, timeMs: 3500 };
  return { trials: 10, incongruentProb: 0.5, timeMs: 5000 };
}

function draw(prev: { word: C; ink: C } | null, incongruent: number): { word: C; ink: C } {
  for (let i = 0; i < 20; i++) {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    let ink = word;
    if (Math.random() < incongruent) {
      const others = COLORS.filter((c) => c.id !== word.id);
      ink = others[Math.floor(Math.random() * others.length)];
    }
    if (!prev || prev.word.id !== word.id || prev.ink.id !== ink.id) return { word, ink };
  }
  return { word: COLORS[0], ink: COLORS[1] };
}

function Stroop() {
  const { effective } = useDifficulty("stroop");
  const [running, setRunning] = useState(false);
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [cur, setCur] = useState<{ word: C; ink: C } | null>(null);
  const [left, setLeft] = useState(0);
  const deadline = useRef<number | null>(null);
  const tick = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("stroop");

  useEffect(() => () => { if (tick.current) window.clearInterval(tick.current); }, []);

  function nextTrial(prev: { word: C; ink: C } | null) {
    const p = paramsFor(effective);
    const c = draw(prev, p.incongruentProb);
    setCur(c);
    deadline.current = Date.now() + p.timeMs;
    setLeft(p.timeMs);
    if (tick.current) window.clearInterval(tick.current);
    tick.current = window.setInterval(() => {
      const r = (deadline.current ?? 0) - Date.now();
      setLeft(Math.max(0, r));
      if (r <= 0) handleAnswer(null);
    }, 80);
  }

  function start() {
    sfx.tap();
    setScore(0); setMisses(0); setTrial(0);
    setRunning(true);
    nextTrial(null);
  }

  function handleAnswer(pickId: string | null) {
    if (!cur) return;
    if (tick.current) window.clearInterval(tick.current);
    const correct = pickId === cur.ink.id;
    if (correct) { sfx.good(); setScore((s) => s + 1); }
    else { sfx.bad(); setMisses((m) => m + 1); }
    const p = paramsFor(effective);
    const nextN = trial + 1;
    const newScore = correct ? score + 1 : score;
    const newMisses = correct ? misses : misses + 1;
    if (nextN >= p.trials) return finish(newScore, newMisses);
    setTrial(nextN);
    setTimeout(() => nextTrial(cur), 250);
  }

  function finish(s: number, m: number) {
    setRunning(false);
    setCur(null);
    const total = s + m;
    const acc = total > 0 ? s / total : 0.5;
    const reward = Math.max(1, Math.floor(s / 3));
    add(reward);
    submit(s);
    sfx.win();
    recordPlay({ gameId: "stroop", accuracy: acc, correctCount: s });
  }

  useEndlessAutoRestart("stroop", !running && (score + misses) > 0, () => start());

  const p = paramsFor(effective);

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Color Words</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap the <b>ink color</b>, not the word! Your brain will want to read — pause it.
      </p>
      <DifficultyPicker gameId="stroop" />
      <CbtCoach gameId="stroop" />

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Score<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Slips<br /><span className="text-primary text-lg">{misses}</span></span>
        <span className="rounded-xl bg-muted p-2">Trial<br /><span className="text-primary text-lg tabular-nums">{Math.min(trial + (running ? 1 : 0), p.trials)}/{p.trials}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div className="mt-5 grid aspect-video place-items-center rounded-3xl bg-card border border-border">
        {cur ? (
          <div className="text-center">
            <p className="text-5xl font-display tracking-wide" style={{ color: cur.ink.css }}>{cur.word.label}</p>
            <div className="mt-2 h-1.5 w-32 mx-auto overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${(left / p.timeMs) * 100}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Press Start</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => running && handleAnswer(c.id)}
            disabled={!running}
            className="rounded-2xl py-4 text-lg font-display text-white btn-pop active:btn-pop-active disabled:opacity-40 min-h-14"
            style={{ background: c.css }}
          >
            {c.label.toLowerCase()}
          </button>
        ))}
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
          <Star className="size-5 fill-current" /> {score} right, {misses} slips
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Palette className="size-3.5" /> Trains: inhibition + selective attention (Stroop paradigm).
      </p>
    </div>
  );
}
