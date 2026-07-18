import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Star, Brain } from "lucide-react";
import { useStars } from "@/lib/stars";
import { useBest } from "@/lib/scores";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/nback")({
  head: () => ({
    meta: [
      { title: "Match Back — FoxFocus" },
      { name: "description", content: "Say match if the shape is the same as one step ago. A gentle working-memory workout." },
    ],
  }),
  component: NBack,
});

const SHAPES = ["🍎", "🐟", "⭐", "🌈", "🚀", "🐝"];

function paramsFor(level: "easy" | "medium" | "hard") {
  if (level === "hard") return { trials: 30, n: 2, matchProb: 0.3 };
  if (level === "medium") return { trials: 25, n: 1, matchProb: 0.35 };
  return { trials: 15, n: 1, matchProb: 0.4 };
}

function NBack() {
  const [seq, setSeq] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<"" | "ok" | "no">("");
  const timer = useRef<number | null>(null);
  const { add } = useStars();
  const { best, submit } = useBest("nback");
  const { effective } = useDifficulty("nback");
  const { trials: TRIALS, n: N } = paramsFor(effective);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function build() {
    const s: string[] = [];
    const { matchProb } = paramsFor(effective);
    for (let k = 0; k < TRIALS; k++) {
      if (k >= N && Math.random() < matchProb) s.push(s[k - N]);
      else s.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
    return s;
  }

  function start() {
    sfx.tap();
    setSeq(build());
    setI(0);
    setScore(0);
    setFeedback("");
    setRunning(true);
  }

  function decide(said: boolean) {
    if (!running) return;
    const isMatch = i >= N && seq[i] === seq[i - N];
    const correct = said === isMatch;
    if (correct) {
      setScore((s) => s + 1);
      sfx.good();
      setFeedback("ok");
    } else {
      sfx.bad();
      setFeedback("no");
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFeedback(""), 250);
    if (i + 1 >= seq.length) {
      setRunning(false);
      const finalScore = score + (correct ? 1 : 0);
      const reward = finalScore >= 15 ? 3 : 1;
      add(reward);
      submit(finalScore);
      recordPlay({ gameId: "nback", accuracy: finalScore / TRIALS, correctCount: finalScore });
      setTimeout(() => sfx.win(), 300);
    } else {
      setI(i + 1);
    }
  }

  const current = seq[i];
  useEndlessAutoRestart("nback", !running && seq.length > 0, () => start());

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Match Back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Is this the same as the one {N} step{N > 1 ? "s" : ""} ago? Tap Match or Different.
      </p>
      <DifficultyPicker gameId="nback" />
      <CbtCoach gameId="nback" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <span className="rounded-xl bg-muted p-2">Trial<br /><span className="text-primary text-lg">{running ? i + 1 : "—"}/{TRIALS}</span></span>
        <span className="rounded-xl bg-muted p-2">Correct<br /><span className="text-primary text-lg">{score}</span></span>
        <span className="rounded-xl bg-muted p-2">Best<br /><span className="text-primary text-lg">{best ?? "—"}</span></span>
      </div>

      <div
        className={`mt-6 grid aspect-square place-items-center rounded-3xl text-8xl transition-colors ${
          feedback === "ok"
            ? "bg-[oklch(0.85_0.14_150)]"
            : feedback === "no"
              ? "bg-destructive/60"
              : "bg-card border border-border"
        }`}
      >
        {running ? current : "🎯"}
      </div>

      {running ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => decide(false)}
            className="rounded-2xl bg-secondary py-4 font-display text-lg text-secondary-foreground btn-pop active:btn-pop-active"
          >
            Different
          </button>
          <button
            onClick={() => decide(true)}
            className="rounded-2xl bg-primary py-4 font-display text-lg text-primary-foreground btn-pop active:btn-pop-active"
          >
            Match
          </button>
        </div>
      ) : (
        <div className="mt-6 flex justify-center">
          <button
            onClick={start}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-11"
          >
            <Play className="size-5" /> {seq.length ? "Play again" : "Start"}
          </button>
        </div>
      )}

      {!running && seq.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> {score} / {TRIALS} correct
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Brain className="size-3.5" /> Trains: working memory (1-back task).
      </p>
    </div>
  );
}