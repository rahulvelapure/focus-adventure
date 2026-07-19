import { useCallback, useEffect, useState } from "react";
import { emit, isBrowser, readJSON, readString, writeString } from "./storage";
import { useWindowEvent } from "./use-window-event";

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
  const v = readString(LEVEL_KEY(id));
  if (v === "easy" || v === "medium" || v === "hard" || v === "adaptive") return v;
  return "easy";
}

export function writeLevel(id: string, level: Level) {
  writeString(LEVEL_KEY(id), level);
  emit("foxfocus:difficulty");
}

export function readEndless(id: string): boolean {
  if (!isBrowser()) return false;
  const v = readString(ENDLESS_KEY(id));
  if (v === "0") return false;
  // Default ON — every game runs endless until the child opts out.
  return true;
}

export function writeEndless(id: string, v: boolean) {
  writeString(ENDLESS_KEY(id), v ? "1" : "0");
  emit("foxfocus:difficulty");
}

/** Push a normalized 0..1 accuracy sample used by adaptive engine. */
export function pushSample(id: string, accuracy: number) {
  const arr = readJSON<number[]>(HIST_KEY(id), []);
  arr.push(Math.max(0, Math.min(1, accuracy)));
  while (arr.length > 8) arr.shift();
  writeString(HIST_KEY(id), JSON.stringify(arr));
}

export function recentAccuracy(id: string): number {
  const arr = readJSON<number[]>(HIST_KEY(id), []);
  if (!arr.length) return 0.5;
  const last = arr.slice(-5);
  return last.reduce((a, b) => a + b, 0) / last.length;
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
    setLevel(readLevel(id));
    setEndlessState(readEndless(id));
    setEffective(effectiveLevel(id));
  }, [id]);

  useWindowEvent("foxfocus:difficulty", () => {
    setLevel(readLevel(id));
    setEndlessState(readEndless(id));
    setEffective(effectiveLevel(id));
  });

  const setLevelCb = useCallback((l: Level) => { writeLevel(id, l); }, [id]);
  const setEndless = useCallback((v: boolean) => { writeEndless(id, v); }, [id]);

  return { level, effective, endless, setLevel: setLevelCb, setEndless };
}