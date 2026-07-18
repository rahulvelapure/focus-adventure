import { LEVELS, useDifficulty, type Level } from "@/lib/difficulty";
import { Sparkles } from "lucide-react";

type Props = {
  gameId: string;
  endlessSupported?: boolean;
};

export function DifficultyPicker({ gameId, endlessSupported }: Props) {
  const { level, effective, endless, setLevel, setEndless } = useDifficulty(gameId);
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Level</p>
        {level === "adaptive" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="size-3" /> Adaptive → {effective}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevel(l.id as Level)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold min-h-9 ${
              level === l.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
        {endlessSupported ? (
          <button
            onClick={() => setEndless(!endless)}
            className={`ml-auto rounded-full px-3 py-1.5 text-xs font-bold min-h-9 ${
              endless ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
            aria-pressed={endless}
          >
            ∞ Endless
          </button>
        ) : null}
      </div>
    </div>
  );
}