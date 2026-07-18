import { createFileRoute, Link } from "@tanstack/react-router";
import { Timer, Brain, Hand, Repeat, Zap, Eye, Wind } from "lucide-react";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "All games — FoxFocus" },
      { name: "description", content: "Every FoxFocus brain game in one place." },
    ],
  }),
  component: Games,
});

const items = [
  { to: "/focus", title: "Focus Streak", desc: "Timed focus with star rewards", Icon: Timer, tag: "Focus" },
  { to: "/memory", title: "Memory Match", desc: "Flip and pair cards", Icon: Brain, tag: "Memory" },
  { to: "/stopgo", title: "Stop & Go", desc: "Go/no-go inhibition drill", Icon: Hand, tag: "Self-control" },
  { to: "/simon", title: "Copy Cat", desc: "Repeat the color sequence", Icon: Repeat, tag: "Memory" },
  { to: "/reaction", title: "Quick Tap", desc: "Reaction time challenge", Icon: Zap, tag: "Alertness" },
  { to: "/oddone", title: "Odd One Out", desc: "Spot the different tile", Icon: Eye, tag: "Attention" },
  { to: "/breathe", title: "Calm Bubble", desc: "Guided breathing reset", Icon: Wind, tag: "Calm" },
] as const;

function Games() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">All games</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick anything. Each one trains a different ADHD skill.
      </p>
      <ul className="mt-5 space-y-3">
        {items.map(({ to, title, desc, Icon, tag }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-display text-base">{title}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                {tag}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}