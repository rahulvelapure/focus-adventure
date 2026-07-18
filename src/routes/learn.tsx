import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Brain, HeartHandshake, Zap, Wind, BookOpen } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn about your brain — FoxFocus" },
      { name: "description", content: "Kid-friendly, evidence-based lessons about ADHD, focus, feelings, and how the brain learns." },
    ],
  }),
  component: Learn,
});

type Lesson = {
  id: string;
  emoji: string;
  title: string;
  hook: string;
  body: string[];
  tryIt?: { label: string; to: string };
  fact: string;
};

const LESSONS: Lesson[] = [
  {
    id: "brain",
    emoji: "🧠",
    title: "Your ADHD brain is a race car",
    hook: "Fast engine, still-learning brakes.",
    body: [
      "Kids with ADHD have a super-fast, curious brain. It runs on chemicals called dopamine and noradrenaline that help you focus.",
      "The 'brakes' — the part that says 'wait' — take longer to grow. That's why waiting, sitting still, and stopping can feel really hard.",
      "Good news: brakes get stronger every time you practice pausing. That's what most of our games do!",
    ],
    fact: "About 1 in 20 kids around the world has ADHD. You are not alone.",
  },
  {
    id: "focus",
    emoji: "🎯",
    title: "Focus is a muscle",
    hook: "Small workouts. Big brain gains.",
    body: [
      "Just like arms get stronger with push-ups, focus gets stronger with short focus workouts.",
      "Try 5 minutes of one thing → move your body → 5 more minutes. That's called chunking.",
      "You do NOT have to focus for a whole hour to be smart. Short and often beats long and painful.",
    ],
    tryIt: { label: "Try Focus Streak", to: "/focus" },
    fact: "Scientists call short work + reward the 'Pomodoro' method.",
  },
  {
    id: "brake",
    emoji: "🛑",
    title: "The brain's brake pedal",
    hook: "Pausing is a superpower.",
    body: [
      "When you feel a big urge to shout, jump, or grab — that's your engine.",
      "Take one slow breath. That gives your brake pedal time to switch on.",
      "Every time you pause on purpose, your brake gets a tiny bit stronger.",
    ],
    tryIt: { label: "Play Stop & Go", to: "/stopgo" },
    fact: "This is called 'response inhibition'. It's the #1 skill in ADHD research.",
  },
  {
    id: "memory",
    emoji: "🧩",
    title: "Working memory: your mind's whiteboard",
    hook: "Hold ideas while you use them.",
    body: [
      "Working memory is the little whiteboard in your head that holds phone numbers, steps of a game, or 'go get shoes AND coat'.",
      "ADHD brains have a smaller whiteboard that erases fast. That's why homework instructions vanish.",
      "Games like Match Back and Memory Match make the whiteboard bigger and less erasey.",
    ],
    tryIt: { label: "Try Match Back", to: "/nback" },
    fact: "Writing steps down is not cheating. Great engineers do it too.",
  },
  {
    id: "feelings",
    emoji: "🌊",
    title: "Big feelings are waves",
    hook: "They rise, they fall, they pass.",
    body: [
      "ADHD brains feel emotions BIGGER and FASTER than most brains. That's not bad — it's just loud.",
      "A feeling wave takes about 90 seconds to peak. If you can breathe through the peak, it starts to shrink on its own.",
      "Name the feeling out loud: 'I'm frustrated.' Naming it turns down the volume in your brain.",
    ],
    tryIt: { label: "Open Calm Bubble", to: "/breathe" },
    fact: "Doctors call this 'name it to tame it'.",
  },
  {
    id: "body",
    emoji: "🏃",
    title: "Move to think",
    hook: "Wiggles wake your focus up.",
    body: [
      "Sitting still ≠ paying attention. For ADHD brains, moving actually turns focus ON.",
      "Try: jump 10 times → do 1 game → jump 10 more. Your brain will thank you.",
      "Walking, dancing, and climbing all help your focus chemicals show up.",
    ],
    fact: "20 minutes of movement can boost focus for up to an hour.",
  },
  {
    id: "sleep",
    emoji: "🌙",
    title: "Sleep = focus fuel",
    hook: "Tired brains can't brake.",
    body: [
      "When you sleep, your brain cleans up and locks in what you learned that day.",
      "Try: same bedtime, dim lights, a book, and Calm Bubble breathing.",
      "No screens in the last hour before bed — blue light tricks your brain into thinking it's daytime.",
    ],
    tryIt: { label: "Bedtime Calm Bubble", to: "/breathe" },
    fact: "Kids 6–13 need 9–12 hours of sleep to focus their best.",
  },
  {
    id: "kind",
    emoji: "💛",
    title: "Be kind to your brain",
    hook: "Yelling at yourself doesn't help you learn.",
    body: [
      "Everyone misses steps, loses socks, and forgets homework sometimes. Especially ADHD brains.",
      "Instead of 'I'm dumb', try 'my brain got distracted — I can start again'. This is called self-compassion.",
      "Ask for help early. Grown-ups love helping — they just can't read your mind.",
    ],
    fact: "Self-compassion helps kids with ADHD try harder next time, not less hard.",
  },
  {
    id: "strengths",
    emoji: "✨",
    title: "ADHD superpowers",
    hook: "The same brain that wiggles also invents.",
    body: [
      "Hyperfocus: when something is interesting, you can dive DEEP.",
      "Creativity: your brain makes surprise connections nobody else sees.",
      "Energy: you can outlast everyone at the things you love.",
      "Kindness: many ADHDers notice how others feel and jump in to help.",
    ],
    fact: "Many artists, athletes, and scientists have ADHD. It can be an engine, not just a challenge.",
  },
  {
    id: "mindful",
    emoji: "🧘",
    title: "Mindfulness: notice, don't react",
    hook: "Your thoughts are clouds passing by.",
    body: [
      "Mindfulness means noticing what's happening RIGHT NOW without judging it.",
      "Feel your feet on the floor. Hear 3 sounds. Take one long breath. That's mindfulness.",
      "Practicing for even a few minutes a day helps ADHD brains catch distractions before they run away.",
    ],
    tryIt: { label: "Calm Bubble", to: "/breathe" },
    fact: "The MYmind study showed 8 weeks of mindfulness reduced ADHD symptoms in kids and teens.",
  },
  {
    id: "exercise",
    emoji: "⚽",
    title: "Exercise is brain medicine",
    hook: "Sweat helps your focus chemicals show up.",
    body: [
      "Aerobic exercise (running, biking, swimming, dancing) makes more dopamine — the exact chemical ADHD meds boost.",
      "Aim for 30–60 minutes most days. Even a 10-minute burst before homework helps.",
      "Team sports and martial arts also train the brain's brake pedal.",
    ],
    fact: "Meta-analyses show regular aerobic exercise improves attention, working memory, and behavior in kids with ADHD.",
  },
  {
    id: "food",
    emoji: "🥑",
    title: "Food that fuels focus",
    hook: "Your brain eats what you eat.",
    body: [
      "Start the day with protein (eggs, yogurt, nut butter) — it keeps focus steady.",
      "Omega-3 fats (salmon, walnuts, flax) help brain cells talk to each other.",
      "Too much sugar or food dye can make wiggles worse for some kids. Water beats soda.",
    ],
    fact: "Several studies suggest omega-3 supplements give a small but real boost to attention in ADHD.",
  },
  {
    id: "plan",
    emoji: "📋",
    title: "Break big into small",
    hook: "One step at a time is how mountains get climbed.",
    body: [
      "Big tasks feel scary to ADHD brains. Break them into 3 tiny steps you can SEE.",
      "Write each step on a sticky note. Move it to 'done' when finished.",
      "This is called task decomposition and it's one of the strongest coping skills for ADHD.",
    ],
    tryIt: { label: "Number Line", to: "/sort" },
    fact: "Doctors call this an 'executive function scaffold'.",
  },
  {
    id: "outside",
    emoji: "🌳",
    title: "Green time > screen time",
    hook: "Nature is free ADHD therapy.",
    body: [
      "Time outdoors — parks, backyards, hikes — calms hyperactivity and refills attention.",
      "20 minutes of 'green time' after school works better than sitting on the couch.",
      "Trees, dirt, and sunshine reset your brain's focus battery.",
    ],
    fact: "Studies by Faber Taylor & Kuo show kids with ADHD focus better after green outdoor play.",
  },
];

function Learn() {
  const [openId, setOpenId] = useState<string | null>("brain");

  return (
    <div className="mx-auto max-w-xl px-5 pt-8 pb-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
        <Sparkles className="size-3.5" /> For kids
      </div>
      <h1 className="mt-1 text-3xl font-display">Learn your brain</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fun, true stuff about ADHD and how to help your brain do its best. Tap
        any card to open it.
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { Icon: Brain, label: "Brain" },
          { Icon: Zap, label: "Focus" },
          { Icon: HeartHandshake, label: "Feelings" },
          { Icon: Wind, label: "Calm" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-2xl bg-card border border-border p-2 text-[11px] font-bold"
          >
            <Icon className="size-5 text-primary" />
            {label}
          </div>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {LESSONS.map((l) => {
          const open = openId === l.id;
          return (
            <li
              key={l.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
            >
              <button
                onClick={() => setOpenId(open ? null : l.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-2xl">
                  {l.emoji}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-base leading-tight">
                    {l.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {l.hook}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`transition-transform ${open ? "rotate-90" : ""}`}
                >
                  ›
                </span>
              </button>
              {open && (
                <div className="border-t border-border px-4 pb-4 pt-3 text-sm">
                  {l.body.map((p, i) => (
                    <p key={i} className="mt-2 first:mt-0 text-muted-foreground">
                      {p}
                    </p>
                  ))}
                  <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-xs font-semibold">
                    Did you know? {l.fact}
                  </p>
                  {l.tryIt && (
                    <Link
                      to={l.tryIt.to}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground btn-pop active:btn-pop-active"
                    >
                      {l.tryIt.label}
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Link
        to="/guide"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <BookOpen className="size-5 text-primary" />
        <span className="flex-1">
          <span className="block font-display text-sm">For grown-ups</span>
          <span className="block text-xs text-muted-foreground">
            Research, clinical background & parent tips
          </span>
        </span>
        <span aria-hidden>›</span>
      </Link>
    </div>
  );
}