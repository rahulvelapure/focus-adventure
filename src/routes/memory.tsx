import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { CbtCoach } from "@/components/CbtCoach";
import { useDifficulty } from "@/lib/difficulty";
import { recordPlay } from "@/lib/progress";
import { useEndlessAutoRestart } from "@/lib/endless";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Match — FoxFocus" },
      { name: "description", content: "Flip cards to match pairs. Trains working memory for kids with ADHD." },
    ],
  }),
  component: Memory,
});

const EMOJIS = ["🦊", "⭐", "🍎", "🚀", "🐢", "🌈", "🍩", "⚽"];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(pairs: number): Card[] {
  const chosen = EMOJIS.slice(0, pairs);
  const doubled = [...chosen, ...chosen];
  return shuffle(doubled).map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

function Memory() {
  const { effective } = useDifficulty("memory");
  const defaultPairs = effective === "hard" ? 8 : effective === "medium" ? 6 : 4;
  const [pairs, setPairs] = useState(defaultPairs);
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(defaultPairs));
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { add } = useStars();
  const [awarded, setAwarded] = useState(false);

  const won = useMemo(() => deck.length > 0 && deck.every((c) => c.matched), [deck]);
  useEndlessAutoRestart("memory", won && awarded, () => reset(pairs));

  useEffect(() => {
    if (won && !awarded) {
      setAwarded(true);
      add(pairs);
      sfx.win();
      const bestMoves = pairs; // perfect = 1 move per pair
      recordPlay({ gameId: "memory", accuracy: Math.max(0, Math.min(1, bestMoves / Math.max(1, moves))), correctCount: pairs });
    }
  }, [won, awarded, add, pairs, moves]);

  useEffect(() => {
    if (picked.length !== 2) return;
    const [a, b] = picked;
    const t = window.setTimeout(() => {
      setDeck((d) => {
        const same = d[a].emoji === d[b].emoji;
        if (same) sfx.good();
        else sfx.bad();
        return d.map((c, i) =>
          i === a || i === b ? { ...c, flipped: same, matched: same } : c,
        );
      });
      setPicked([]);
    }, 700);
    return () => window.clearTimeout(t);
  }, [picked]);

  function reset(p = pairs) {
    setPairs(p);
    setDeck(makeDeck(p));
    setPicked([]);
    setMoves(0);
    setAwarded(false);
  }

  function flip(i: number) {
    if (picked.length === 2) return;
    if (deck[i].flipped || deck[i].matched) return;
    sfx.tap();
    setDeck((d) => d.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setPicked((p) => {
      const next = [...p, i];
      if (next.length === 2) setMoves((m) => m + 1);
      return next;
    });
  }

  const cols = pairs <= 6 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display">Memory Match</h1>
          <p className="mt-1 text-sm text-muted-foreground">Find the pairs. Moves: <b className="tabular-nums text-foreground">{moves}</b></p>
        </div>
        <button
          onClick={() => reset()}
          aria-label="New game"
          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm font-bold text-muted-foreground min-h-11"
        >
          <RotateCcw className="size-4" /> New
        </button>
      </div>
      <DifficultyPicker gameId="memory" />
      <CbtCoach gameId="memory" />

      <div className="mt-4 flex gap-2">
        {[4, 6, 8].map((p) => (
          <button
            key={p}
            onClick={() => reset(p)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold min-h-11 min-w-11 ${
              p === pairs ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {p} pairs
          </button>
        ))}
      </div>

      <ul className={`mt-5 grid ${cols} gap-2.5`}>
        {deck.map((c, i) => (
          <li key={c.id} className="aspect-square">
            <button
              onClick={() => flip(i)}
              aria-label={c.flipped || c.matched ? `Card ${c.emoji}` : "Hidden card"}
              className={`size-full rounded-2xl text-4xl font-bold transition-all btn-pop active:btn-pop-active ${
                c.flipped || c.matched
                  ? c.matched
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-card-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {c.flipped || c.matched ? c.emoji : "?"}
            </button>
          </li>
        ))}
      </ul>

      {won ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent p-4 font-bold text-accent-foreground">
          <Star className="size-5 fill-current" /> You did it! +{pairs} stars
        </div>
      ) : null}
    </div>
  );
}