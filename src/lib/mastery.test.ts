import { beforeEach, describe, expect, it } from "vitest";
import { median, recordMath, recordWords, type MathSession, type WordsSession } from "./mastery";

const mathSession = (over: Partial<MathSession> = {}): MathSession => ({
  at: Date.now(),
  range: 10,
  correct: 8,
  total: 10,
  accuracy: 0.8,
  rtMs: 900,
  ...over,
});

const wordsSession = (over: Partial<WordsSession> = {}): WordsSession => ({
  at: Date.now(),
  poolLevel: 1,
  correct: 5,
  total: 6,
  accuracy: 5 / 6,
  ...over,
});

describe("median", () => {
  it("returns 0 for an empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns the middle value for odd-length input", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("averages the two middle values for even-length input, rounded", () => {
    expect(median([1, 2, 3, 4])).toBe(3); // (2+3)/2 = 2.5 -> rounds to 3
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  it("does not mutate the input array", () => {
    const input = [5, 1, 3];
    median(input);
    expect(input).toEqual([5, 1, 3]);
  });
});

describe("math/words session logging", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists math sessions under the math key", () => {
    recordMath(mathSession({ correct: 7 }));
    const raw = window.localStorage.getItem("foxfocus.mastery.v1.math");
    expect(raw).not.toBeNull();
    const arr = JSON.parse(raw!) as MathSession[];
    expect(arr).toHaveLength(1);
    expect(arr[0].correct).toBe(7);
  });

  it("persists words sessions under a separate key", () => {
    recordWords(wordsSession({ poolLevel: 3 }));
    expect(window.localStorage.getItem("foxfocus.mastery.v1.math")).toBeNull();
    const arr = JSON.parse(
      window.localStorage.getItem("foxfocus.mastery.v1.words")!,
    ) as WordsSession[];
    expect(arr[0].poolLevel).toBe(3);
  });

  it("appends sessions in order", () => {
    recordMath(mathSession({ range: 10 }));
    recordMath(mathSession({ range: 20 }));
    const arr = JSON.parse(
      window.localStorage.getItem("foxfocus.mastery.v1.math")!,
    ) as MathSession[];
    expect(arr.map((s) => s.range)).toEqual([10, 20]);
  });

  it("caps the ring buffer at 60 entries, dropping the oldest", () => {
    for (let i = 0; i < 65; i++) recordMath(mathSession({ range: i }));
    const arr = JSON.parse(
      window.localStorage.getItem("foxfocus.mastery.v1.math")!,
    ) as MathSession[];
    expect(arr).toHaveLength(60);
    // Oldest five (0..4) were dropped; first remaining is range 5.
    expect(arr[0].range).toBe(5);
    expect(arr[arr.length - 1].range).toBe(64);
  });

  it("dispatches a foxfocus:mastery event on record", () => {
    let fired = 0;
    const on = () => (fired += 1);
    window.addEventListener("foxfocus:mastery", on);
    recordMath(mathSession());
    window.removeEventListener("foxfocus:mastery", on);
    expect(fired).toBe(1);
  });
});
