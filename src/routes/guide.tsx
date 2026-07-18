import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Parent guide — FoxFocus" },
      { name: "description", content: "Evidence-informed guide to using FoxFocus with a child who has ADHD: token economy, chunking, inhibition training, and clinical background." },
    ],
  }),
  component: Guide,
});

const method = [
  {
    tag: "Method",
    title: "Short-burst focus (Pomodoro for kids)",
    body:
      "Children with ADHD show best sustained attention with brief, clearly-timed effort followed by movement or reward. FoxFocus uses 3–10 minute focus streaks that mirror classroom-tested 'chunking + immediate reinforcement' approaches.",
  },
  {
    tag: "Method",
    title: "Working-memory training",
    body:
      "Memory Match and Match Back load the working-memory circuits most affected by ADHD (dorsolateral prefrontal + parietal). Difficulty scales so the child stays in the 'just-right' zone — challenging but reachable.",
  },
  {
    tag: "Method",
    title: "Go / No-Go for self-control",
    body:
      "Stop & Go and Whack-a-Fox are classic inhibition tasks from cognitive neuroscience. Practicing 'act on green, freeze on red' rehearses response inhibition — the same skill that helps a child pause before blurting out or acting on impulse.",
  },
  {
    tag: "Method",
    title: "Self-regulation with slow breathing",
    body:
      "Calm Bubble teaches 4-4-6 diaphragmatic breathing, which activates the parasympathetic nervous system and lowers arousal. Use it before homework, after a meltdown, or as a bedtime wind-down.",
  },
  {
    tag: "Design",
    title: "Immediate visible rewards (token economy)",
    body:
      "Every finished activity earns stars. Token-economy systems are one of the best-supported behavioral interventions for ADHD (Pelham & Fabiano, 2008; AAP 2019 guideline). Trade weekly star totals for a chosen off-screen reward.",
  },
  {
    tag: "Design",
    title: "Predictable structure, low friction",
    body:
      "One tap to a game. Timers are visible. Choices are limited to 2–4 options. Reducing decisions and surprises keeps executive load light so the child spends energy on the task itself.",
  },
];

const research = [
  {
    title: "Behavioral therapy is first-line for ages 4–12",
    body:
      "The American Academy of Pediatrics 2019 Clinical Practice Guideline recommends parent- and teacher-delivered behavioral training as first-line treatment for preschoolers, and combined with medication when needed for school-age children. FoxFocus supports (not replaces) that behavioral scaffolding at home.",
  },
  {
    title: "Cognitive training helps most when it looks like life",
    body:
      "Meta-analyses of computerised cognitive training (Cortese et al., 2015) show reliable near-transfer to trained tasks but modest far-transfer to school outcomes. The strongest gains come from short, consistent practice paired with real-life coaching — the parent guide tips are the leverage point.",
  },
  {
    title: "Movement + focus, not focus alone",
    body:
      "Physical activity produces small-to-moderate improvements in attention and executive function in children with ADHD (Vysniauske et al., 2020). Alternate a FoxFocus session with 5 minutes of active play.",
  },
  {
    title: "Sleep is a behavior lever",
    body:
      "Up to 50% of children with ADHD have sleep-onset problems. A predictable wind-down (Calm Bubble → dim lights → book) improves next-day attention. Screens off 60 minutes before bed.",
  },
  {
    title: "Praise the process, not the outcome",
    body:
      "Effort-based praise ('you kept going even when it was hard') builds internal motivation more than outcome praise ('you're so smart'). Name the specific skill: 'that was your brain's brake pedal working'.",
  },
  {
    title: "Mindfulness-based interventions (MYmind)",
    body:
      "Randomized trials of MYmind (an 8-week mindfulness program adapted for children with ADHD and their parents) show reductions in inattention and parent-rated symptoms (van de Weijer-Bergsma et al., 2012; van der Oord et al., 2012). Short daily 'notice-your-breath' practice pairs well with the Calm Bubble.",
  },
  {
    title: "Aerobic and coordination exercise",
    body:
      "Cerrillo-Urbina et al. (2015) and Vysniauske et al. (2020) meta-analyses report moderate improvements in attention, executive function, and hyperactivity after regular aerobic exercise (≥30 min, 3–5×/week) and coordinative training (martial arts, dance, ball sports).",
  },
  {
    title: "Omega-3 supplementation (adjunct)",
    body:
      "Bloch & Qawasmi (2011) meta-analysis found a small but statistically significant benefit of EPA/DHA supplementation on ADHD symptoms. Effect size is modest; discuss with your pediatrician as an adjunct, not a replacement.",
  },
  {
    title: "Sleep hygiene as an evidence-based lever",
    body:
      "Hiscock et al. (2015, BMJ) randomized trial: a brief behavioral sleep intervention improved ADHD symptoms, daily functioning, behavior, and quality of life at 3 and 6 months. Consistent bedtime, dark room, no screens 60 min before bed.",
  },
  {
    title: "Parent behavior training (PBT / PMT)",
    body:
      "Programs like Parent-Child Interaction Therapy, Incredible Years, Triple P, and the New Forest Parenting Programme have strong evidence for preschool and school-age ADHD (Daley et al., 2014). Focus: labelled praise, planned ignoring, clear commands, if-then routines.",
  },
  {
    title: "School accommodations that work",
    body:
      "Daily Report Cards, movement breaks every 15–20 min, front-row seating, chunked instructions, and visual timers are supported by the MTA follow-up and DuPaul & Stoner's classroom research. Share the child's star totals as an at-home data point.",
  },
  {
    title: "CBT-informed skills for older kids",
    body:
      "For ages 9+, cognitive-behavioral coping skills — self-talk ('stop, plan, go'), problem-solving worksheets, and cognitive reframing — improve emotional regulation (Sprich et al., 2016). Practice one skill at a time.",
  },
  {
    title: "Environmental design",
    body:
      "Reduce visual clutter on the desk, use noise-cancelling headphones, keep a 'launch pad' for shoes/bag by the door, and post a 3-step morning checklist. Externalising executive function to the environment lowers demand on the child's still-developing prefrontal cortex.",
  },
];

const tips = [
  "Play in short sittings (5–15 min), 1–2× a day. Consistency > length.",
  "Sit next to your child at first. Body-doubling helps ADHD focus.",
  "Name the skill: 'That was your brain's brake pedal working!'",
  "Trade star totals for real-life rewards on a weekly rhythm.",
  "Never remove earned stars as punishment — keep the system positive.",
  "Use Calm Bubble before hard tasks or right after big feelings.",
  "Pair app time with movement — 5 min play, 5 min run, 5 min play.",
  "Keep the same start-time each day; predictability lowers resistance.",
];

const redFlags = [
  "Difficulty is present in more than one setting (home + school) for 6+ months.",
  "Sleep is chronically <9 hours or takes >45 min to fall asleep.",
  "Big emotions escalate to self-harm or harming others.",
  "School performance is dropping despite effort and support.",
  "You feel burned out — parent support and coaching help too.",
];

function Guide() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-8 pb-8">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary-foreground">
        For grown-ups
      </p>
      <h1 className="mt-1 text-3xl font-display">Parent guide</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The evidence base behind FoxFocus and how to fold it into daily life.
      </p>

      <h2 className="mt-8 font-display text-xl">How each activity helps</h2>
      <ul className="mt-3 space-y-3">
        {method.map((s) => (
          <li
            key={s.title}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              {s.tag}
            </p>
            <h3 className="mt-1 font-display text-lg">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-xl">What the research says</h2>
      <ul className="mt-3 space-y-3">
        {research.map((s) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-display text-base">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ul>

      <section
        className="mt-10 rounded-2xl p-5 text-primary-foreground"
        style={{ background: "var(--gradient-play)" }}
      >
        <h2 className="font-display text-lg">Daily tips</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-10 font-display text-xl">When to reach out to a clinician</h2>
      <ul className="mt-3 space-y-2">
        {redFlags.map((f) => (
          <li key={f} className="rounded-xl bg-muted p-3 text-sm">
            {f}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        FoxFocus is a supportive practice tool, not a medical treatment or diagnosis.
        Sources: AAP Clinical Practice Guideline for ADHD (2019); Cortese et al.,
        JAACAP 2015; Pelham & Fabiano, JCCAP 2008; Vysniauske et al., J Atten
        Disord 2020. For a diagnosis or care plan, talk with a qualified clinician.
      </p>
    </div>
  );
}