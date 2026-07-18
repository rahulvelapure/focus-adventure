import { useCallback, useEffect, useState } from "react";

export type Level = "easy" | "medium" | "hard" | "adaptive";

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "easy", label: "Easy", hint: "Learn the game" },
  { id: "medium", label: "Medium", hint: "Just right" },
  { id: "hard", label: "Hard", hint: "Big challenge" },
  { id: "adaptive", label: "Adaptive", hint: "Grows with you" },
];

const LEVEL_KEY = (id: string) => `foxfocus.diff.v1.${id}`;
const HIST_KEY = (id: string) => `foxfocus.hist.v1.${id}`;
const ENDLESS_KEY = (id: string) => `foxfocus.endless.v1.${id}`;

export function readLevel(id: string): Level {
  if (typeof window === "undefined") return "easy";
  try {
    const v = window.localStorage.getItem(LEVEL_KEY(id));
    if (v === "easy" || v === "medium" || v === "hard" || v === "adaptive") return v;
  } catch {}
  return "easy";
}

export function writeLevel(id: string, level: Level) {
  try {
    window.localStorage.setItem(LEVEL_KEY(id), level);
    window.dispatchEvent(new CustomEvent("foxfocus:difficulty"));
  } catch {}
}

export function readEndless(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ENDLESS_KEY(id)) === "1";
  } catch {
    return false;
  }
}

export function writeEndless(id: string, v: boolean) {
  try {
    window.localStorage.setItem(ENDLESS_KEY(id), v ? "1" : "0");
    window.dispatchEvent(new CustomEvent("foxfocus:difficulty"));
  } catch {}
}

/** Push a normalized 0..1 accuracy sample used by adaptive engine. */
export function pushSample(id: string, accuracy: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(HIST_KEY(id));
    const arr: number[] = raw ? JSON.parse(raw) : [];
    arr.push(Math.max(0, Math.min(1, accuracy)));
    while (arr.length > 8) arr.shift();
    window.localStorage.setItem(HIST_KEY(id), JSON.stringify(arr));
  } catch {}
}

export function recentAccuracy(id: string): number {
  if (typeof window === "undefined") return 0.5;
  try {
    const raw = window.localStorage.getItem(HIST_KEY(id));
    const arr: number[] = raw ? JSON.parse(raw) : [];
    if (!arr.length) return 0.5;
    const last = arr.slice(-5);
    return last.reduce((a, b) => a + b, 0) / last.length;
  } catch {
    return 0.5;
  }
}

/**
 * Resolve the effective level for a game.
 * Adaptive: promotes when recent accuracy >= .8 for last 3+, drops when <= .4.
 */
export function effectiveLevel(id: string): Exclude<Level, "adaptive"> {
  const chosen = readLevel(id);
  if (chosen !== "adaptive") return chosen;
  const acc = recentAccuracy(id);
  if (acc >= 0.8) return "hard";
  if (acc >= 0.55) return "medium";
  return "easy";
}

export function useDifficulty(id: string) {
  const [level, setLevel] = useState<Level>("easy");
  const [endless, setEndlessState] = useState(false);
  const [effective, setEffective] = useState<Exclude<Level, "adaptive">>("easy");

  useEffect(() => {
    const sync = () => {
      setLevel(readLevel(id));
      setEndlessState(readEndless(id));
      setEffective(effectiveLevel(id));
    };
    sync();
    window.addEventListener("foxfocus:difficulty", sync);
    return () => window.removeEventListener("foxfocus:difficulty", sync);
  }, [id]);

  const setLevelCb = useCallback((l: Level) => { writeLevel(id, l); }, [id]);
  const setEndless = useCallback((v: boolean) => { writeEndless(id, v); }, [id]);

  return { level, effective, endless, setLevel: setLevelCb, setEndless };
}