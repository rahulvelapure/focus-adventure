import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookA, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx, vibe } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { signal as frust } from "@/lib/frustration";
import { useBest } from "@/lib/scores";

export const Route = createFileRoute("/words")({
  head: () => ({
    meta: [
      { title: "Word Builder — FoxFocus" },
      { name: "description", content: "Fill the missing letter to build the word. Adaptive language mini-game with star rewards." },
    ],
  }),
  component: Words,
});

const EASY = ["cat", "dog", "sun", "hat", "pig", "bat", "cup", "run", "fox", "map", "top", "red"];
const MED = ["frog", "milk", "star", "jump", "book", "duck", "fish", "moon", "wind", "kite", "bird", "tree"];
const HARD = ["planet", "school", "bridge", "castle", "friend", "rocket", "silver", "orange", "market", "window"];

const VOWELS = ["a", "e", "i", "o", "u"];

function pool(level: string) {
  if (level === "hard") return HARD;
  if (level === "medium") return MED;
  return EASY;
}

type Q = { word: string; hideIdx: number; missing: string; choices: string[] };

function makeQuestion(level: string): Q {
  const words = pool(level);
  const word = words[Math.floor(Math.random() * words.length)];
  // Prefer hiding a vowel for easy/medium; any letter for hard.
  let hideIdx = -1;
  if (level !== "hard") {
    const vowelIdxs = word.split("").map((c, i) => (VOWELS.includes(c) ? i : -1)).filter((i) => i >= 0);
    if (vowelIdxs.length) hideIdx = vowelIdxs[Math.floor(Math.random() * vowelIdxs.length)];
  }
  if (hideIdx < 0) hideIdx = 1 + Math.floor(Math.random() * (word.length - 1));
  const missing = word[hideIdx];
  const set = new Set<string>([missing]);
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  while (set.size < 4) set.add(alphabet[Math.floor(Math.random() * 26)]);
  const choices = Array.from(set).sort(() => Math.random() - 0.5);
  return { word, hideIdx, missing, choices };
}

function Words() {
  const { effective } = useDifficulty("words");
  const [q, setQ] = useState<Q>(() => makeQuestion(effective));
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const { add } = useStars();
  const { best, submit } = useBest("words", "max");

  useEffect(() => {
    setQ(makeQuestion(effective));
    setPicked(null);
  }, [effective]);

  const next = useCallback(() => {
    setPicked(null);
    setQ(makeQuestion(effective));
  }, [effective]);

  function pick(letter: string) {
    if (picked) return;
    setPicked(letter);
    setTotal((t) => t + 1);
    if (letter === q.missing) {
      sfx.good();
      vibe(15);
      frust("words", "hit");
      const s = streak + 1;
      setStreak(s);
      setCorrect((c) => {
        const nc = c + 1;
        submit(nc);
        return nc;
      });
      add(s % 5 === 0 ? 2 : 1);
      window.setTimeout(next, 650);
    } else {
      sfx.bad();
      vibe([30, 40, 30]);
      frust("words", "miss");
      setStreak(0);
      window.setTimeout(next, 900);
    }
  }

  useEffect(() => {
    if (total > 0 && total % 8 === 0) {
      recordPlay({ gameId: "words", accuracy: correct / total, correctCount: correct });
    }
  }, [total, correct]);

  const acc = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [correct, total]);

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <BookA className="size-5" />
        </span>
        <h1 className="text-2xl font-display">Word Builder</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick the missing letter. Words grow as your reading grows.
      </p>
      <DifficultyPicker gameId="words" endlessSupported />
      <CbtCoach gameId="words" />

      <div className="mt-4 flex justify-between text-sm font-bold">
        <span>Streak: <span className="text-primary tabular-nums">{streak}</span></span>
        <span>Best: <span className="text-primary tabular-nums">{best ?? 0}</span></span>
        <span>{acc}% right</span>
      </div>

      <div className="mt-6 rounded-3xl bg-card border border-border p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="font-display text-5xl tracking-wider uppercase">
          {q.word.split("").map((c, i) => (
            <span
              key={i}
              className={
                i === q.hideIdx
                  ? "mx-1 inline-block min-w-10 rounded-lg bg-primary/10 px-2 text-primary"
                  : "mx-0.5"
              }
            >
              {i === q.hideIdx ? (picked ?? "_") : c}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === q.missing;
          const showCorrect = picked != null && isCorrect;
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`rounded-2xl p-5 font-display text-3xl uppercase min-h-16 btn-pop active:btn-pop-active ${
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

      {picked && picked === q.missing ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-accent p-3 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> +{streak % 5 === 0 && streak > 0 ? 2 : 1} star
        </div>
      ) : null}
    </div>
  );
}