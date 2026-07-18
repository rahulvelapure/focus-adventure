// Lightweight frustration detector.
// Games call `signal(gameId, kind)` after events.
// When a rolling window shows too many misses / rage-taps / slow starts,
// we emit a global "foxfocus:frustrated" event with a suggestion payload
// that the root <FrustrationCoach /> renders as a calming micro-break.

import { useEffect, useState } from "react";

export type FrustrationKind =
  | "miss"       // wrong answer / no-go slip
  | "hit"        // successful answer (resets counters)
  | "ragetap"    // rapid repeated taps in <200ms
  | "quit"       // user hit reset/restart mid-round
  | "timeout";   // response window elapsed with no action

export type Suggestion = {
  title: string;
  body: string;
  action?: { label: string; to: string };
};

type State = {
  misses: number;
  ragetaps: number;
  quits: number;
  timeouts: number;
  lastTapAt: number;
  lastFireAt: number;
};

const buckets = new Map<string, State>();

function get(id: string): State {
  let s = buckets.get(id);
  if (!s) {
    s = { misses: 0, ragetaps: 0, quits: 0, timeouts: 0, lastTapAt: 0, lastFireAt: 0 };
    buckets.set(id, s);
  }
  return s;
}

function suggestionFor(gameId: string): Suggestion {
  const map: Record<string, Suggestion> = {
    whack:   { title: "Fast board? Let's slow the room down.", body: "Try Easy for one round, or drop to a shorter burst.", action: { label: "Calm bubble", to: "/breathe" } },
    reaction:{ title: "Twitchy fingers? That's normal.", body: "One slow breath, then wait for the green.", action: { label: "Steady beat", to: "/rhythm" } },
    stroop:  { title: "Word tricking you? Reset with color.", body: "Whisper the ink color before you tap.", action: { label: "Calm bubble", to: "/breathe" } },
    flanker: { title: "Eyes pulling wide? Zoom back in.", body: "Look only at the middle arrow.", action: { label: "Calm bubble", to: "/breathe" } },
    memory:  { title: "Cards feel jumbled?", body: "Chunk the board into rows of 2 — one row at a time.", action: { label: "Copy Cat", to: "/simon" } },
    nback:   { title: "Whiteboard full?", body: "Whisper each shape out loud — it lightens the load.", action: { label: "Chunk practice", to: "/memory" } },
    simon:   { title: "Pattern getting long?", body: "Break it into chunks of 2 like a phone number.", action: { label: "Match Back", to: "/nback" } },
    stopgo:  { title: "Hand jumping the gun?", body: "STOP. Breathe. Then choose.", action: { label: "Calm bubble", to: "/breathe" } },
    hold:    { title: "Long waits are hard!", body: "Count 'one-Mississippi' in your head while you hold.", action: { label: "Steady beat", to: "/rhythm" } },
    rhythm:  { title: "Off the beat? No stress.", body: "Nod your head, then tap on — not before — the next pulse.", action: { label: "Hold steady", to: "/hold" } },
    sort:    { title: "Board looks big?", body: "Scan for the smallest first. Then the next smallest.", action: { label: "Plan → Do", to: "/plando" } },
    spot:    { title: "Star hiding?", body: "Sweep left-to-right, top-to-bottom like reading.", action: { label: "Odd One Out", to: "/oddone" } },
    oddone:  { title: "All look the same?", body: "Slow eyes beat fast eyes — scan in a path.", action: { label: "Find the Star", to: "/spot" } },
    plando:  { title: "Plan slipped?", body: "Say the steps out loud before you tap the first one.", action: { label: "Number Line", to: "/sort" } },
    switch:  { title: "Rule switching your brain?", body: "Whisper the rule ('COLOR' or 'SHAPE') before every tap.", action: { label: "Middle Arrow", to: "/flanker" } },
    math:    { title: "Numbers feeling tricky?", body: "Slow down. Read it, whisper it, then tap.", action: { label: "Calm bubble", to: "/breathe" } },
    words:   { title: "Letters getting muddled?", body: "Sound the word out loud, one chunk at a time.", action: { label: "Calm bubble", to: "/breathe" } },
  };
  return map[gameId] ?? { title: "Take a tiny break.", body: "One slow breath in. One slow breath out. You've got this.", action: { label: "Calm bubble", to: "/breathe" } };
}

function fire(gameId: string) {
  if (typeof window === "undefined") return;
  const s = get(gameId);
  const now = Date.now();
  if (now - s.lastFireAt < 25_000) return; // cooldown
  s.lastFireAt = now;
  s.misses = 0; s.ragetaps = 0; s.quits = 0; s.timeouts = 0;
  const detail = { gameId, suggestion: suggestionFor(gameId) };
  window.dispatchEvent(new CustomEvent("foxfocus:frustrated", { detail }));
}

export function signal(gameId: string, kind: FrustrationKind) {
  const s = get(gameId);
  const now = Date.now();
  if (kind === "hit") {
    s.misses = Math.max(0, s.misses - 1);
    s.ragetaps = Math.max(0, s.ragetaps - 1);
    return;
  }
  if (kind === "miss") s.misses += 1;
  if (kind === "quit") s.quits += 1;
  if (kind === "timeout") s.timeouts += 1;
  if (kind === "ragetap" || (now - s.lastTapAt < 200 && kind === "miss")) s.ragetaps += 1;
  s.lastTapAt = now;

  if (s.misses >= 4 || s.ragetaps >= 3 || s.quits >= 2 || s.timeouts >= 3) {
    fire(gameId);
  }
}

/** Manual trigger — e.g. a "Feeling stuck?" button */
export function triggerBreak(gameId: string) {
  fire(gameId);
}

export function useFrustrationEvent(): { gameId: string; suggestion: Suggestion } | null {
  const [ev, setEv] = useState<{ gameId: string; suggestion: Suggestion } | null>(null);
  useEffect(() => {
    const onFire = (e: Event) => setEv((e as CustomEvent).detail);
    window.addEventListener("foxfocus:frustrated", onFire as EventListener);
    return () => window.removeEventListener("foxfocus:frustrated", onFire as EventListener);
  }, []);
  return ev;
}

export function clearFrustration() {
  buckets.forEach((s) => { s.misses = 0; s.ragetaps = 0; s.quits = 0; s.timeouts = 0; });
}