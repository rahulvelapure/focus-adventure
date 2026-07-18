// CBT-based mini-lesson + drill content, keyed by game + difficulty level.
// Content is inspired by evidence-based CBT skills for children with ADHD
// (Barkley, Safren, Antshel): psychoeducation, cognitive restructuring,
// self-instructional training (Meichenbaum), problem-solving, and
// behavioural rehearsal.

import { useCallback, useEffect, useState } from "react";

export type CbtLevel = "easy" | "medium" | "hard";

export type DrillStep = {
  prompt: string;
  // Optional choice-based step. When present, the correct index is the
  // "helpful thought / skillful action". Others are common unhelpful
  // automatic thoughts kids report.
  choices?: string[];
  correct?: number;
  // Optional short self-talk phrase the child rehearses out loud.
  sayItOutLoud?: string;
};

export type CbtLesson = {
  skill: string; // e.g. "Stop-Think-Go"
  why: string;   // 1 sentence rationale (kid friendly)
  lesson: string[]; // 2–3 short bullets
  drill: DrillStep[]; // 2–4 interactive steps
};

type LessonMap = Record<string, Record<CbtLevel, CbtLesson>>;

const stopThinkGo = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Stop · Think · Go",
  why: "Slowing down for one breath lets your brain's brake switch on before you act.",
  lesson: [
    "STOP: notice the urge before your hand moves.",
    "THINK: is this a GO or a WAIT?",
    "GO: only tap when your brain says yes.",
  ],
  drill: [
    {
      prompt: "You see a sleepy fox. Your finger is itching to tap. What's the helpful thought?",
      choices: [
        "Tap fast, sort it out later!",
        "STOP — one breath — is this a GO?",
        "I always mess this up.",
      ],
      correct: 1,
      sayItOutLoud: "Stop. Breathe. Choose.",
    },
    {
      prompt: "You tapped a wrong one. What do you tell yourself?",
      choices: [
        "I'm bad at this game.",
        "One slip is data — next tap I'll wait a beat.",
        "This game is unfair.",
      ],
      correct: 1,
      sayItOutLoud: "A slip is a clue, not a fail.",
    },
  ],
  ...extra,
});

const chunking = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Chunk it small",
  why: "Your working-memory whiteboard is small. Group items so it fits.",
  lesson: [
    "Group cards or numbers into tiny sets of 2–3.",
    "Whisper each chunk to yourself as you see it.",
    "If you lose it, don't panic — restart the chunk.",
  ],
  drill: [
    {
      prompt: "You just saw: 7 · 3 · 9 · 2. What's the smart way to hold it?",
      choices: [
        "Try to remember all 4 at once.",
        "Split into two chunks: 7-3 · 9-2 and whisper them.",
        "Give up, I'll never remember.",
      ],
      correct: 1,
      sayItOutLoud: "Chunk it. Whisper it. Own it.",
    },
    {
      prompt: "You forgot the second chunk. Best move?",
      choices: [
        "Guess and be angry.",
        "Breathe, restart the last chunk, keep going.",
        "Quit the round.",
      ],
      correct: 1,
    },
  ],
  ...extra,
});

const restructure = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Swap the thought",
  why: "Unhelpful thoughts make ADHD brains freeze. Swapping them keeps you playing.",
  lesson: [
    "Catch the sticky thought ('I always lose').",
    "Check it — is it 100% true? Usually not.",
    "Change it to a coach thought ('I'm learning; next round').",
  ],
  drill: [
    {
      prompt: "Sticky thought: 'I'm too slow.' Coach swap?",
      choices: [
        "I'm too slow AND lazy.",
        "I'm getting faster with practice.",
        "Everyone is better than me.",
      ],
      correct: 1,
      sayItOutLoud: "I'm getting faster with practice.",
    },
    {
      prompt: "Sticky: 'I can't focus for even 1 minute.' Coach swap?",
      choices: [
        "I focused for 20 seconds — I can add 10 more.",
        "My brain is broken.",
        "Focus is for other kids.",
      ],
      correct: 0,
    },
  ],
  ...extra,
});

const grounding = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "5-4-3-2-1 grounding",
  why: "When your engine revs, senses bring you back to now so you can play smart.",
  lesson: [
    "Name 5 things you see, 4 you feel, 3 you hear.",
    "Take one slow belly breath.",
    "Then start the round — calm brain, sharp brain.",
  ],
  drill: [
    {
      prompt: "Try it now. Look around and pick 3 things you can SEE.",
      sayItOutLoud: "I see ___, ___, and ___.",
    },
    {
      prompt: "Now 2 things you can FEEL (feet on floor? cool screen?).",
      sayItOutLoud: "I feel ___ and ___.",
    },
    {
      prompt: "One slow breath in through the nose, out through the mouth.",
      sayItOutLoud: "In… and out. Ready.",
    },
  ],
  ...extra,
});

const planning = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Plan · Do · Check",
  why: "A tiny plan before you start beats a big rush that loses points.",
  lesson: [
    "PLAN: look at the whole puzzle first (5 seconds).",
    "DO: place the easiest piece.",
    "CHECK: pause after each move — does it still look right?",
  ],
  drill: [
    {
      prompt: "New round starts. Best first move?",
      choices: [
        "Tap the first thing I see.",
        "Scan the whole board for 5 seconds, then start.",
        "Complain that it's hard.",
      ],
      correct: 1,
      sayItOutLoud: "Scan. Then start.",
    },
  ],
  ...extra,
});

const selfCompassion = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Be your own coach",
  why: "Yelling inside your head makes ADHD brains give up. Kind coaching keeps you playing.",
  lesson: [
    "Talk to yourself like your best friend would.",
    "Every mistake = one clue about what to try next.",
    "Effort points count more than score points.",
  ],
  drill: [
    {
      prompt: "You lost the round. What would a good coach say?",
      choices: [
        "That was awful, quit.",
        "Nice try — one thing to change next time?",
        "See, you're bad at this.",
      ],
      correct: 1,
      sayItOutLoud: "Nice try. One small change.",
    },
  ],
  ...extra,
});

const focusMuscle = (extra: Partial<CbtLesson> = {}): CbtLesson => ({
  skill: "Anchor the focus muscle",
  why: "Your attention drifts — that's normal. Bringing it back IS the workout.",
  lesson: [
    "Pick one anchor (Rex's ring, your breath, the number on screen).",
    "When you notice a drift, gently say 'back' and return.",
    "Every return = one rep for your focus muscle.",
  ],
  drill: [
    {
      prompt: "You caught your mind wandering. Best move?",
      choices: [
        "Get mad at myself.",
        "Say 'back' softly and return to my anchor.",
        "Quit — I can't focus.",
      ],
      correct: 1,
      sayItOutLoud: "Notice… and… back.",
    },
  ],
  ...extra,
});

// One lesson per game per level. Higher levels add a step or nudge.
export const CBT_LESSONS: LessonMap = {
  whack: {
    easy: stopThinkGo(),
    medium: stopThinkGo({
      lesson: [
        "STOP the tap urge — one breath.",
        "THINK: fox or sleepy?",
        "GO only for GO cues. Slips are data.",
      ],
    }),
    hard: stopThinkGo({
      why: "Faster spawns mean stronger urges — practice the pause every time.",
      drill: [
        ...stopThinkGo().drill,
        {
          prompt: "The board is buzzing. What's your rule for this round?",
          choices: [
            "Tap first, think never.",
            "Every tap gets a half-second STOP.",
            "Speed = winning at all costs.",
          ],
          correct: 1,
          sayItOutLoud: "Every tap gets a pause.",
        },
      ],
    }),
  },
  reaction: {
    easy: stopThinkGo({
      skill: "Wait for the green",
      why: "Impulse control means waiting even when you REALLY want to tap.",
      lesson: [
        "Hands still. Eyes on the box.",
        "Wait for GREEN before tapping.",
        "Jumping the gun costs the round.",
      ],
    }),
    medium: grounding(),
    hard: grounding({
      why: "At hard level the wait is longer — grounding keeps your brain from firing early.",
    }),
  },
  memory: {
    easy: chunking(),
    medium: chunking(),
    hard: chunking({
      why: "More cards = bigger whiteboard load. Chunk aggressively.",
      drill: [
        ...chunking().drill,
        {
          prompt: "Board has 12 cards. Where do you look first?",
          choices: [
            "Flip anywhere fast.",
            "Start in a corner and scan row by row.",
            "Flip the middle repeatedly.",
          ],
          correct: 1,
        },
      ],
    }),
  },
  nback: {
    easy: focusMuscle(),
    medium: chunking({
      skill: "Hold and compare",
      why: "Match-Back asks your whiteboard to hold AND compare — a double workout.",
    }),
    hard: chunking({
      skill: "Two-back rehearsal",
      why: "2-back means holding two items at once. Rehearse them out loud.",
      lesson: [
        "Whisper the last two items as they appear.",
        "When a new one shows, compare to the older one.",
        "Drop the oldest — keep the pair fresh.",
      ],
    }),
  },
  simon: {
    easy: focusMuscle({
      skill: "One thing at a time",
      why: "Watch every flash — no thinking about the next tap yet.",
    }),
    medium: chunking({
      skill: "Chunk the pattern",
      lesson: [
        "Group the flashes into 2s (like a phone number).",
        "Whisper each chunk.",
        "Replay in chunks, not one big blur.",
      ],
    }),
    hard: chunking({
      skill: "Chunk + rehearse",
      why: "Long patterns overload the whiteboard. Chunk then repeat silently.",
    }),
  },
  focus: {
    easy: focusMuscle(),
    medium: focusMuscle({
      lesson: [
        "Pick one anchor for the whole timer.",
        "Every drift = 1 quiet 'back' and 1 point for the focus muscle.",
        "You don't have to be perfect — you have to return.",
      ],
    }),
    hard: restructure({
      why: "Longer sessions bring sticky thoughts. Swap them and keep going.",
    }),
  },
  stopgo: {
    easy: stopThinkGo(),
    medium: stopThinkGo(),
    hard: stopThinkGo({
      why: "Fast cues test your brake. Every pause is a rep.",
    }),
  },
  breathe: {
    easy: grounding(),
    medium: grounding(),
    hard: selfCompassion(),
  },
  sort: {
    easy: planning(),
    medium: planning(),
    hard: planning({
      why: "Bigger sets need a plan — no random tapping.",
    }),
  },
  spot: {
    easy: planning({
      skill: "Scan in a pattern",
      why: "Random scanning misses targets. A path finds them.",
      lesson: [
        "Scan left-to-right, top-to-bottom like reading.",
        "Slow eyes beat fast eyes.",
        "If you miss, restart the path.",
      ],
    }),
    medium: planning({ skill: "Scan in a pattern" }),
    hard: focusMuscle({
      skill: "Anchor your gaze",
      why: "When the board is busy, drifting eyes are the enemy — anchor and sweep.",
    }),
  },
  oddone: {
    easy: planning({ skill: "Scan in a pattern" }),
    medium: planning({ skill: "Scan in a pattern" }),
    hard: selfCompassion(),
  },
  stroop: {
    easy: stopThinkGo({
      skill: "Pause the reader",
      why: "Your brain reads before you notice — a tiny pause lets you pick the color instead.",
      lesson: [
        "See the word, but don't obey it.",
        "Whisper the INK color under your breath.",
        "Then tap.",
      ],
    }),
    medium: restructure({
      skill: "Swap the auto-thought",
      why: "Reading is automatic. Coach yourself: 'color, not word.'",
    }),
    hard: restructure({
      why: "Fast trials tempt slips — a coach phrase resets you every time.",
    }),
  },
  flanker: {
    easy: focusMuscle({
      skill: "Zoom to the middle",
      why: "Your eyes want to widen — pull them to one spot instead.",
      lesson: [
        "Look ONLY at the middle arrow.",
        "Blur the others like background.",
        "Then tap the direction.",
      ],
    }),
    medium: focusMuscle({ skill: "Zoom to the middle" }),
    hard: stopThinkGo({
      skill: "Zoom · Check · Tap",
      why: "More flankers means more noise — pause a half second to be sure.",
    }),
  },
  rhythm: {
    easy: focusMuscle({
      skill: "Ride the beat",
      why: "Steady rhythms calm the ADHD engine — your body learns to wait its turn.",
      lesson: [
        "Hear the beat before you tap.",
        "Nod along with your head.",
        "Tap on — not before — the pulse.",
      ],
    }),
    medium: focusMuscle({ skill: "Ride the beat" }),
    hard: selfCompassion({
      skill: "Reset on a miss",
      why: "One off-beat tap doesn't ruin the song — jump back on the next one.",
    }),
  },
  hold: {
    easy: stopThinkGo({
      skill: "Wait for the star",
      why: "The wait is the workout — every extra second is a rep for your brake muscle.",
      lesson: [
        "Count in your head: one-Mississippi…",
        "Watch the ring, not the clock.",
        "Release only when it turns green.",
      ],
    }),
    medium: stopThinkGo({ skill: "Wait for the star" }),
    hard: selfCompassion({
      skill: "Kind coach on a slip",
      why: "Long waits are hard — celebrate the try, not just the perfect.",
    }),
  },
  plando: {
    easy: planning({
      skill: "Plan · Do · Check",
      why: "A tiny plan before you tap beats a rush that loses points.",
      lesson: [
        "PLAN: whisper each step in the plan out loud.",
        "DO: tap the FIRST step first — no jumping ahead.",
        "CHECK: after each tap, ask 'what's next?'",
      ],
    }),
    medium: planning({
      skill: "Whisper-and-tap",
      why: "Saying the next step out loud keeps your working memory anchored.",
      drill: [
        {
          prompt: "You forgot step 3. Best move?",
          choices: [
            "Panic-tap the shiniest tile.",
            "Pause, whisper the last step you remember, then look for the pattern.",
            "Quit the round.",
          ],
          correct: 1,
          sayItOutLoud: "Pause. Whisper. Then tap.",
        },
      ],
    }),
    hard: planning({
      skill: "Chunk the plan",
      why: "Longer plans (6 steps) blow past the whiteboard — split them into pairs.",
      lesson: [
        "Break the plan into pairs: (1-2) (3-4) (5-6).",
        "Whisper one pair, tap it, then load the next.",
        "Missing a step is a chunk problem, not a you problem.",
      ],
    }),
  },
  switch: {
    easy: focusMuscle({
      skill: "Read the rule first",
      why: "Task-switching stumbles happen when the brain follows the OLD rule. Read the rule EVERY trial.",
      lesson: [
        "Before you look at the shape, LOOK AT THE RULE.",
        "Whisper it: 'COLOR' or 'SHAPE'.",
        "Then answer.",
      ],
    }),
    medium: stopThinkGo({
      skill: "Pause · Rule · Answer",
      why: "One extra half-second on switch trials cuts errors in half.",
      lesson: [
        "PAUSE — feel the switch coming.",
        "READ the rule out loud in your head.",
        "ANSWER only after the rule is loaded.",
      ],
      drill: [
        {
          prompt: "The rule just flipped from COLOR to SHAPE. What do you do first?",
          choices: [
            "Answer with the same button as last time.",
            "Whisper 'SHAPE' first, then look at the card.",
            "Guess quickly.",
          ],
          correct: 1,
          sayItOutLoud: "New rule. Whisper it. Then answer.",
        },
      ],
    }),
    hard: restructure({
      skill: "Swap the auto-thought",
      why: "Fast switching is exhausting — coach yourself instead of scolding yourself.",
      lesson: [
        "Catch the sticky thought ('I keep messing up').",
        "Check it: one slip ≠ all slips.",
        "Swap to: 'switch trials are the workout — every rep counts.'",
      ],
    }),
  },
};

const DONE_KEY = (gameId: string, level: CbtLevel) =>
  `foxfocus.cbt.done.v1.${gameId}.${level}`;

export function getLesson(gameId: string, level: CbtLevel): CbtLesson | null {
  const g = CBT_LESSONS[gameId];
  if (!g) return null;
  return g[level] ?? g.easy ?? null;
}

export function useCbtDone(gameId: string, level: CbtLevel) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    try {
      setDone(window.localStorage.getItem(DONE_KEY(gameId, level)) === "1");
    } catch {}
  }, [gameId, level]);
  const markDone = useCallback(() => {
    try {
      window.localStorage.setItem(DONE_KEY(gameId, level), "1");
    } catch {}
    setDone(true);
  }, [gameId, level]);
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(DONE_KEY(gameId, level));
    } catch {}
    setDone(false);
  }, [gameId, level]);
  return { done, markDone, reset };
}