import { createFileRoute, Link } from "@tanstack/react-router";
import { Timer, Brain, Hand, Wind, Star, Sparkles } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useStars } from "@/lib/stars";

export const Route = createFileRoute("/")({
  component: Home,
});

const games = [
  {
    to: "/focus" as const,
    title: "Focus Streak",
    desc: "Short bursts. Big wins.",
    Icon: Timer,
    grad: "var(--gradient-sunrise)",
  },
  {
    to: "/memory" as const,
    title: "Memory Match",
    desc: "Flip. Remember. Repeat.",
    Icon: Brain,
    grad: "var(--gradient-sky)",
  },
  {
    to: "/stopgo" as const,
    title: "Stop & Go",
    desc: "Tap green. Freeze red.",
    Icon: Hand,
    grad: "var(--gradient-play)",
  },
  {
    to: "/breathe" as const,
    title: "Calm Bubble",
    desc: "Slow the wiggles.",
    Icon: Wind,
    grad: "linear-gradient(135deg, oklch(0.82 0.13 220), oklch(0.86 0.11 145))",
  },
];

function Home() {
  const { stars, hydrated } = useStars();
  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Hi friend 👋</p>
          <h1 className="mt-1 text-3xl font-display">FoxFocus</h1>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground shadow-[var(--shadow-soft)]"
          aria-label={`${stars} stars earned`}
        >
          <Star className="size-4 fill-current" aria-hidden />
          <span className="font-bold tabular-nums">{hydrated ? stars : 0}</span>
        </div>
      </header>

      <section
        className="relative mt-6 overflow-hidden rounded-3xl p-5"
        style={{ background: "var(--gradient-sunrise)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={mascot}
            alt="Rex the fox, your focus buddy"
            width={112}
            height={112}
            className="size-28 shrink-0 drop-shadow"
          />
          <div className="text-primary-foreground">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-90">
              <Sparkles className="size-3.5" aria-hidden /> Today
            </p>
            <p className="mt-1 text-lg font-display leading-tight">
              Pick a game. Play 5 minutes. Earn a star.
            </p>
          </div>
        </div>
      </section>

      <h2 className="mt-8 text-lg font-display">Brain games</h2>
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {games.map(({ to, title, desc, Icon, grad }) => (
          <li key={to}>
            <Link
              to={to}
              className="group block h-full rounded-3xl p-4 text-primary-foreground btn-pop active:btn-pop-active min-h-32"
              style={{ background: grad }}
            >
              <Icon className="size-7" aria-hidden />
              <p className="mt-3 font-display text-base leading-tight">{title}</p>
              <p className="text-xs opacity-90">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/learn"
        className="mt-6 block rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">For grown-ups</p>
        <p className="mt-1 font-display">How this helps → learning methodology</p>
      </Link>
    </div>
  );
}
