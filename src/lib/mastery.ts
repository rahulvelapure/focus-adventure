// Per-game session logs used by the Progress dashboard.
// Kept intentionally tiny — a bounded ring buffer in localStorage.
import { useEffect, useState, useCallback } from "react";

export type MathSession = {
  at: number;
  range: number;          // max number the child faced this run
  correct: number;        // total correct in the run
  total: number;          // total answered
  accuracy: number;       // 0..1
  rtMs: number;           // median reaction time on correct answers
};

export type WordsSession = {
  at: number;
  poolLevel: 1 | 2 | 3;   // 1 easy / 2 medium / 3 hard word pool
  correct: number;
  total: number;
  accuracy: number;       // missing-letter accuracy 0..1
};

const KEY = (id: string) => `foxfocus.mastery.v1.${id}`;
const CAP = 60;

function read<T>(id: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(id));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function push<T>(id: string, item: T) {
  try {
    const arr = read<T>(id);
    arr.push(item);
    while (arr.length > CAP) arr.shift();
    window.localStorage.setItem(KEY(id), JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("foxfocus:mastery"));
  } catch {}
}

export function recordMath(s: MathSession) { push("math", s); }
export function recordWords(s: WordsSession) { push("words", s); }

export function useHistory<T>(id: "math" | "words"): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    setItems(read<T>(id));
    const on = () => setItems(read<T>(id));
    window.addEventListener("foxfocus:mastery", on);
    return () => window.removeEventListener("foxfocus:mastery", on);
  }, [id]);
  return items;
}

export function useClearMastery() {
  return useCallback((id: "math" | "words") => {
    try {
      window.localStorage.removeItem(KEY(id));
      window.dispatchEvent(new CustomEvent("foxfocus:mastery"));
    } catch {}
  }, []);
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}