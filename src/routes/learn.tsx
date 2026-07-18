import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning methodology — FoxFocus" },
      { name: "description", content: "The evidence-informed methodology behind FoxFocus: short-burst focus training, working memory, self-regulation and behavioral rewards for kids with ADHD." },
    ],
  }),
  component: Learn,
});

const sections = [
  {
    tag: "Method",
    title: "Short-burst focus (Pomodoro for kids)",
    body: "Kids with ADHD do best with short, clearly-timed effort followed by movement or reward. FoxFocus uses 3–10 minute focus streaks and pairs each finish with a visible star reward. This mirrors the classroom-tested 'chunking + immediate reinforcement' approach.",
  },
  {
    tag: "Method",
    title: "Working-memory training",
    body: "Memory Match trains the working-memory circuits most affected by ADHD. Difficulty scales (4 → 8 pairs) so the child stays in the 'just-right' zone — challenging enough to grow, easy enough to succeed.",
  },
  {
    tag: "Method",
    title: "Go / No-Go for self-control",
    body: "Stop & Go is a classic inhibition task from cognitive neuroscience. Practicing 'tap green, freeze red' rehearses the brake pedal of the brain — the same skill that helps a child pause before blurting out or acting on impulse.",
  },
  {
    tag: "Method",
    title: "Self-regulation with slow breathing",
    body: "The Calm Bubble teaches 4-4-6 diaphragmatic breathing, which activates the parasympathetic nervous system and lowers arousal. Use it before homework, after a meltdown, or as a bedtime wind-down.",
  },
  {
    tag: "Design",
    title: "Immediate visible rewards (token economy)",
    body: "Every finished activity earns stars. Token-economy systems are one of the best-supported behavioral interventions for ADHD. Let your child trade weekly star totals for a chosen off-screen reward (park visit, extra story, choosing dinner).",
  },
  {
    tag: "Design",
    title: "Predictable structure, low friction",
    body: "One tap to a game. Timers are visible. Choices are limited to 2–4 options. Reducing decisions and surprises keeps executive load light and lets the child spend energy on the task itself.",
  },
];

const tips = [
  "Play in short sittings (5–15 min), 1–2× a day. Consistency > length.",
  "Sit next to your child at first. Body-doubling helps ADHD focus.",
  "Name the skill: 'That was your brain's brake pedal working!'",
  "Trade star totals for real-life rewards on a weekly rhythm.",
  "Never remove earned stars as punishment — keep the system positive.",
  "Use Calm Bubble before hard tasks or right after big feelings.",
];

function Learn() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary-foreground">
        For grown-ups
      </p>
      <h1 className="mt-1 text-3xl font-display">How FoxFocus helps</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A short guide to the learning methodology behind the four games — and how
        to weave them into daily life.
      </p>

      <ul className="mt-6 space-y-3">
        {sections.map((s) => (
          <li
            key={s.title}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              {s.tag}
            </p>
            <h2 className="mt-1 font-display text-lg">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ul>

      <section
        className="mt-6 rounded-2xl p-5 text-primary-foreground"
        style={{ background: "var(--gradient-play)" }}
      >
        <h2 className="font-display text-lg">6 tips for parents</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        FoxFocus is a supportive practice tool, not a medical treatment. For a
        diagnosis or care plan, talk with a qualified clinician.
      </p>
    </div>
  );
}