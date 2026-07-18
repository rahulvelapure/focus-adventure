import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, BookA, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/learnplay")({
  head: () => ({
    meta: [
      { title: "Learn & Play — FoxFocus" },
      { name: "description", content: "Gamified math and language mini-games with adaptive difficulty and star rewards." },
    ],
  }),
  component: LearnPlay,
});

const items = [
  {
    to: "/math" as const,
    title: "Quick Math",
    desc: "Add, subtract, and missing-number puzzles that grow with you.",
    Icon: Calculator,
    grad: "linear-gradient(135deg, oklch(0.72 0.18 210), oklch(0.78 0.15 260))",
  },
  {
    to: "/words" as const,
    title: "Word Builder",
    desc: "Fill the missing letter. Easy → tricky vocabulary.",
    Icon: BookA,
    grad: "linear-gradient(135deg, oklch(0.72 0.19 30), oklch(0.78 0.16 350))",
  },
];

function LearnPlay() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </span>
        <h1 className="text-2xl font-display">Learn &amp; Play</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Short, gamified drills for maths and reading. Every one adapts as you improve — and pays out in stars.
      </p>

      <ul className="mt-6 grid gap-3">
        {items.map(({ to, title, desc, Icon, grad }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-4 rounded-3xl p-4 text-primary-foreground btn-pop active:btn-pop-active min-h-24"
              style={{ background: grad }}
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-white/25">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg leading-tight">{title}</span>
                <span className="block text-xs opacity-90">{desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
        These drills are optional. The core FoxFocus games train attention and self-control; Learn &amp; Play adds friendly academic reps on top.
      </p>
    </div>
  );
}