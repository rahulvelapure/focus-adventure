import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claim, recordEvent } from "./quests";

const KEY = "foxfocus.quests.v1";
const TODAY = "2024-06-15";
const YESTERDAY = "2024-06-14";

type StoredState = {
  date: string;
  quests: string[];
  progress: Record<string, number>;
  claimed: string[];
  streak: number;
  lastCompletedDate: string | null;
};

function seed(partial: Partial<StoredState>) {
  const state: StoredState = {
    date: TODAY,
    quests: [],
    progress: {},
    claimed: [],
    streak: 0,
    lastCompletedDate: null,
    ...partial,
  };
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

function load(): StoredState {
  return JSON.parse(window.localStorage.getItem(KEY)!) as StoredState;
}

beforeEach(() => {
  window.localStorage.clear();
  // Fix "today" so the daily-quest roll and date comparisons are deterministic.
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("daily quest selection", () => {
  it("is deterministic for a given day", () => {
    recordEvent("plays", "noop"); // triggers a read+fresh, persisting today's roll
    const first = load().quests;
    window.localStorage.clear();
    recordEvent("plays", "noop");
    const second = load().quests;
    expect(second).toEqual(first);
  });

  it("picks exactly three distinct quests", () => {
    recordEvent("plays", "noop");
    const { quests } = load();
    expect(quests).toHaveLength(3);
    expect(new Set(quests).size).toBe(3);
  });
});

describe("recordEvent", () => {
  it("advances an any-game plays quest", () => {
    seed({ quests: ["warmup"], progress: {} });
    recordEvent("plays", "memory", 1);
    expect(load().progress.warmup).toBe(1);
  });

  it("only advances quests matching the bound gameId", () => {
    seed({ quests: ["whack20"] });
    recordEvent("correct", "simon", 5); // wrong game
    expect(load().progress.whack20 ?? 0).toBe(0);
    recordEvent("correct", "whack", 5);
    expect(load().progress.whack20).toBe(5);
  });

  it("clamps progress at the quest target", () => {
    seed({ quests: ["warmup"] }); // target 2
    recordEvent("plays", "memory", 10);
    expect(load().progress.warmup).toBe(2);
  });

  it("ignores events whose kind does not match", () => {
    seed({ quests: ["focus5"] }); // kind minutes
    recordEvent("plays", "focus", 3);
    expect(load().progress.focus5 ?? 0).toBe(0);
  });
});

describe("claim", () => {
  it("returns 0 and does not claim an unfinished quest", () => {
    seed({ quests: ["warmup"], progress: { warmup: 1 } }); // target 2
    expect(claim("warmup")).toBe(0);
    expect(load().claimed).toEqual([]);
  });

  it("returns the reward and marks a finished quest claimed", () => {
    seed({ quests: ["warmup"], progress: { warmup: 2 } });
    expect(claim("warmup")).toBe(2);
    expect(load().claimed).toContain("warmup");
  });

  it("cannot be claimed twice", () => {
    seed({ quests: ["warmup"], progress: { warmup: 2 } });
    expect(claim("warmup")).toBe(2);
    expect(claim("warmup")).toBe(0);
  });

  it("returns 0 for an unknown quest id", () => {
    seed({ quests: ["warmup"], progress: { warmup: 2 } });
    expect(claim("nope")).toBe(0);
  });

  it("increments the streak when finishing all quests the day after the last", () => {
    seed({
      quests: ["warmup", "calm"],
      progress: { warmup: 2, calm: 1 },
      lastCompletedDate: YESTERDAY,
      streak: 3,
    });
    claim("warmup");
    expect(load().streak).toBe(4);
    expect(load().lastCompletedDate).toBe(TODAY);
  });

  it("resets the streak to 1 after a gap", () => {
    seed({
      quests: ["warmup", "calm"],
      progress: { warmup: 2, calm: 1 },
      lastCompletedDate: "2024-06-01",
      streak: 9,
    });
    claim("warmup");
    expect(load().streak).toBe(1);
  });

  it("does not bump the streak until every quest is done", () => {
    seed({
      quests: ["warmup", "calm"],
      progress: { warmup: 2, calm: 0 },
      lastCompletedDate: YESTERDAY,
      streak: 3,
    });
    claim("warmup");
    expect(load().streak).toBe(3);
    expect(load().lastCompletedDate).toBe(YESTERDAY);
  });
});
