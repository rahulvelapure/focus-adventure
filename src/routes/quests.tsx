import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Flame, Gift, Star } from "lucide-react";
import { useQuests } from "@/lib/quests";
import { useStars } from "@/lib/stars";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Daily Quests — FoxFocus" },
      { name: "description", content: "Fresh challenges every day. Build a play streak and earn stars." },
    ],
  }),
  component: Quests,
});

function Quests() {
  const { quests, streak, doneCount, total, claim, hydrated } = useQuests();
  const { add } = useStars();

  function onClaim(id: string) {
    const r = claim(id);
    if (r > 0) add(r);
  }

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display">Daily Quests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Three fresh goals every day. Finish them all to keep your streak alive.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-accent-foreground shadow-[var(--shadow-soft)]">
          <Flame className="size-4 fill-current" />
          <span className="font-bold tabular-nums">{hydrated ? streak : 0}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-muted p-3 text-sm font-bold">
        Progress: <span className="text-primary">{doneCount}</span> / {total} done today
      </div>

      <ul className="mt-4 space-y-3">
        {quests.map((q) => {
          const pct = Math.min(100, Math.round((q.current / q.target) * 100));
          return (
            <li key={q.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base">{q.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    +{q.reward} stars
                  </p>
                </div>
                {q.claimed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                    <CheckCircle2 className="size-3" /> Claimed
                  </span>
                ) : q.done ? (
                  <button
                    onClick={() => onClaim(q.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground btn-pop active:btn-pop-active min-h-9"
                  >
                    <Gift className="size-3.5" /> Claim
                  </button>
                ) : (
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {q.current}/{q.target}
                  </span>
                )}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-2xl bg-accent/50 p-4 text-sm">
        <p className="flex items-center gap-2 font-display">
          <Star className="size-4" /> Why streaks help
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Short daily practice builds the brain circuits kids with ADHD rely on for focus and
          self-control. Consistency beats long sessions.
        </p>
      </div>
    </div>
  );
}