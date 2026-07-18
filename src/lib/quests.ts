import { useCallback, useEffect, useState } from "react";

export type Quest = {
  id: string;
  label: string;
  target: number;
  gameId?: string; // if bound to a specific game
  kind: "plays" | "correct" | "minutes" | "any";
  reward: number; // stars
};

const POOL: Quest[] = [
  { id: "warmup", label: "Play any 2 games", target: 2, kind: "plays", reward: 2 },
  { id: "focus5", label: "Do 5 focus minutes", target: 5, kind: "minutes", gameId: "focus", reward: 3 },
  { id: "memory1", label: "Finish Memory Match", target: 1, kind: "plays", gameId: "memory", reward: 3 },
  { id: "calm", label: "Do a Calm Bubble round", target: 1, kind: "plays", gameId: "breathe", reward: 2 },
  { id: "stopgo", label: "Play Stop & Go once", target: 1, kind: "plays", gameId: "stopgo", reward: 2 },
  { id: "whack20", label: "Score 20 in Whack-a-Fox", target: 20, kind: "correct", gameId: "whack", reward: 4 },
  { id: "simon5", label: "Reach round 5 in Copy Cat", target: 5, kind: "correct", gameId: "simon", reward: 4 },
  { id: "nback12", label: "Get 12 right in Match Back", target: 12, kind: "correct", gameId: "nback", reward: 4 },
  { id: "react", label: "Play Quick Tap 3 times", target: 3, kind: "plays", gameId: "reaction", reward: 2 },
  { id: "spot2", label: "Find the Star twice", target: 2, kind: "plays", gameId: "spot", reward: 2 },
];

type Progress = Record<string, number>;
type State = {
  date: string;
  quests: string[]; // ids picked for today
  progress: Progress;
  claimed: string[];
  streak: number;
  lastCompletedDate: string | null;
};

const KEY = "foxfocus.quests.v1";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function pickTodaysQuests(): string[] {
  // Deterministic per day so refreshes don't reroll.
  const t = today();
  let seed = 0;
  for (let i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0;
  const arr = [...POOL];
  const chosen: string[] = [];
  for (let i = 0; i < 3 && arr.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % arr.length;
    chosen.push(arr[idx].id);
    arr.splice(idx, 1);
  }
  return chosen;
}

function fresh(prev?: State): State {
  const t = today();
  return {
    date: t,
    quests: pickTodaysQuests(),
    progress: {},
    claimed: [],
    streak: prev?.streak ?? 0,
    lastCompletedDate: prev?.lastCompletedDate ?? null,
  };
}

function read(): State {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw) as State;
    if (s.date !== today()) return fresh(s);
    return s;
  } catch {
    return fresh();
  }
}

function write(s: State) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("foxfocus:quests"));
  } catch {}
}

export type QuestView = Quest & { current: number; done: boolean; claimed: boolean };

function view(s: State): QuestView[] {
  return s.quests
    .map((id) => POOL.find((q) => q.id === id))
    .filter((q): q is Quest => !!q)
    .map((q) => {
      const current = s.progress[q.id] ?? 0;
      return { ...q, current, done: current >= q.target, claimed: s.claimed.includes(q.id) };
    });
}

export function recordEvent(kind: Quest["kind"], gameId: string, amount = 1) {
  const s = read();
  let dirty = false;
  for (const qid of s.quests) {
    const q = POOL.find((x) => x.id === qid);
    if (!q) continue;
    if (q.kind !== kind && q.kind !== "any") continue;
    if (q.gameId && q.gameId !== gameId) continue;
    const cur = s.progress[q.id] ?? 0;
    if (cur >= q.target) continue;
    s.progress[q.id] = Math.min(q.target, cur + amount);
    dirty = true;
  }
  if (dirty) write(s);
}

export function claim(id: string): number {
  const s = read();
  const q = POOL.find((x) => x.id === id);
  if (!q) return 0;
  const cur = s.progress[id] ?? 0;
  if (cur < q.target || s.claimed.includes(id)) return 0;
  s.claimed.push(id);
  // Update streak if this is the first quest completed today.
  const allDone = s.quests.every((qid) => (s.progress[qid] ?? 0) >= (POOL.find((p) => p.id === qid)?.target ?? Infinity));
  if (allDone && s.lastCompletedDate !== s.date) {
    if (s.lastCompletedDate === yesterdayOf(s.date)) s.streak += 1;
    else s.streak = 1;
    s.lastCompletedDate = s.date;
  }
  write(s);
  return q.reward;
}

export function useQuests() {
  const [state, setState] = useState<State>(() => fresh());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const on = () => setState(read());
    window.addEventListener("foxfocus:quests", on);
    return () => window.removeEventListener("foxfocus:quests", on);
  }, []);

  const list = view(state);
  const doneCount = list.filter((q) => q.done).length;

  const claimCb = useCallback((id: string) => claim(id), []);

  return { quests: list, streak: state.streak, hydrated, claim: claimCb, doneCount, total: list.length };
}