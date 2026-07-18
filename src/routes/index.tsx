import { createFileRoute, Link } from "@tanstack/react-router";
import { Timer, Brain, Hand, Wind, Star, Sparkles, Zap, Palette, Eye, Repeat, Target, Search, ListOrdered, Layers, BookOpen, Flame, MoveHorizontal, Music, Hourglass, ClipboardList, Shuffle, GraduationCap } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useStars } from "@/lib/stars";
import { useQuests } from "@/lib/quests";
import { OfflineBadge } from "@/components/OfflineBadge";

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
  {
    to: "/simon" as const,
    title: "Copy Cat",
    desc: "Watch. Copy. Grow.",
    Icon: Repeat,
    grad: "linear-gradient(135deg, oklch(0.72 0.18 150), oklch(0.82 0.16 100))",
  },
  {
    to: "/reaction" as const,
    title: "Quick Tap",
    desc: "Fast, but not too fast.",
    Icon: Zap,
    grad: "linear-gradient(135deg, oklch(0.7 0.19 25), oklch(0.82 0.17 65))",
  },
  {
    to: "/oddone" as const,
    title: "Odd One Out",
    desc: "Spot the different one.",
    Icon: Eye,
    grad: "linear-gradient(135deg, oklch(0.68 0.18 300), oklch(0.78 0.14 250))",
  },
  {
    to: "/whack" as const,
    title: "Whack-a-Fox",
    desc: "Tap fox, skip sleepy.",
    Icon: Target,
    grad: "linear-gradient(135deg, oklch(0.72 0.19 35), oklch(0.7 0.18 350))",
  },
  {
    to: "/nback" as const,
    title: "Match Back",
    desc: "Same as last one?",
    Icon: Layers,
    grad: "linear-gradient(135deg, oklch(0.65 0.16 200), oklch(0.75 0.15 260))",
  },
  {
    to: "/sort" as const,
    title: "Number Line",
    desc: "Small to big!",
    Icon: ListOrdered,
    grad: "linear-gradient(135deg, oklch(0.72 0.17 140), oklch(0.82 0.15 90))",
  },
  {
    to: "/spot" as const,
    title: "Find the Star",
    desc: "Scan and tap.",
    Icon: Search,
    grad: "linear-gradient(135deg, oklch(0.75 0.15 60), oklch(0.72 0.18 25))",
  },
  {
    to: "/stroop" as const,
    title: "Color Words",
    desc: "Ink, not word!",
    Icon: Palette,
    grad: "linear-gradient(135deg, oklch(0.68 0.2 320), oklch(0.72 0.18 20))",
  },
  {
    to: "/flanker" as const,
    title: "Middle Arrow",
    desc: "Ignore the rest.",
    Icon: MoveHorizontal,
    grad: "linear-gradient(135deg, oklch(0.68 0.16 210), oklch(0.72 0.18 170))",
  },
  {
    to: "/rhythm" as const,
    title: "Steady Beat",
    desc: "Tap the pulse.",
    Icon: Music,
    grad: "linear-gradient(135deg, oklch(0.7 0.19 340), oklch(0.78 0.16 40))",
  },
  {
    to: "/hold" as const,
    title: "Hold Steady",
    desc: "Wait for green.",
    Icon: Hourglass,
    grad: "linear-gradient(135deg, oklch(0.7 0.16 130), oklch(0.68 0.19 190))",
  },
  {
    to: "/plando" as const,
    title: "Plan → Do",
    desc: "Memorize. Then execute.",
    Icon: ClipboardList,
    grad: "linear-gradient(135deg, oklch(0.72 0.16 170), oklch(0.78 0.15 220))",
  },
  {
    to: "/switch" as const,
    title: "Rule Switch",
    desc: "Rule keeps flipping!",
    Icon: Shuffle,
    grad: "linear-gradient(135deg, oklch(0.7 0.19 300), oklch(0.72 0.17 40))",
  },
];

function Home() {
  const { stars, hydrated } = useStars();
  const { streak, doneCount, total } = useQuests();
  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Hi friend 👋</p>
          <h1 className="mt-1 text-3xl font-display">FoxFocus</h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-muted-foreground"
            aria-label={`${streak} day streak`}
            title="Day streak"
          >
            <Flame className="size-4 text-primary" aria-hidden />
            <span className="font-bold tabular-nums text-foreground">{hydrated ? streak : 0}</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground shadow-[var(--shadow-soft)]"
            aria-label={`${stars} stars earned`}
          >
            <Star className="size-4 fill-current" aria-hidden />
            <span className="font-bold tabular-nums">{hydrated ? stars : 0}</span>
          </div>
        </div>
      </header>
      <OfflineBadge />

      <Link
        to="/quests"
        className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
      >
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Flame className="size-3.5 text-primary" /> Today's quests
          </p>
          <p className="mt-1 font-display text-base">
            {doneCount} of {total} done — keep the streak going!
          </p>
        </div>
        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Open</span>
      </Link>

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

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/settings"
          className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
        >
          <Palette className="size-5 text-primary" aria-hidden />
          <p className="mt-2 font-display text-sm">Themes & sounds</p>
          <p className="text-xs text-muted-foreground">Make it yours</p>
        </Link>
        <Link
          to="/learn"
          className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
        >
          <BookOpen className="size-5 text-primary" aria-hidden />
          <p className="mt-2 font-display text-sm">Learn your brain</p>
          <p className="text-xs text-muted-foreground">Fun ADHD lessons</p>
        </Link>
      </div>

      <Link
        to="/learnplay"
        className="mt-3 flex items-center gap-3 rounded-2xl p-4 text-primary-foreground shadow-[var(--shadow-soft)]"
        style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 210), oklch(0.75 0.16 320))" }}
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-white/25">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block font-display text-base leading-tight">Learn &amp; Play</span>
          <span className="block text-xs opacity-90">Quick Math &amp; Word Builder — adaptive, star-rewarded</span>
        </span>
        <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">Open</span>
      </Link>
    </div>
  );
}
