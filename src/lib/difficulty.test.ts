import { beforeEach, describe, expect, it } from "vitest";
import {
  effectiveLevel,
  pushSample,
  readEndless,
  readLevel,
  recentAccuracy,
  writeEndless,
  writeLevel,
} from "./difficulty";

describe("difficulty level storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to easy when nothing is stored", () => {
    expect(readLevel("whack")).toBe("easy");
  });

  it("round-trips each valid level", () => {
    for (const level of ["easy", "medium", "hard", "adaptive"] as const) {
      writeLevel("whack", level);
      expect(readLevel("whack")).toBe(level);
    }
  });

  it("falls back to easy for a corrupted value", () => {
    window.localStorage.setItem("foxfocus.diff.v1.whack", "bogus");
    expect(readLevel("whack")).toBe("easy");
  });

  it("dispatches foxfocus:difficulty on write", () => {
    let fired = 0;
    const on = () => (fired += 1);
    window.addEventListener("foxfocus:difficulty", on);
    writeLevel("whack", "hard");
    window.removeEventListener("foxfocus:difficulty", on);
    expect(fired).toBe(1);
  });
});

describe("endless mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to ON when unset", () => {
    expect(readEndless("whack")).toBe(true);
  });

  it("respects an explicit off value", () => {
    writeEndless("whack", false);
    expect(readEndless("whack")).toBe(false);
    expect(window.localStorage.getItem("foxfocus.endless.v1.whack")).toBe("0");
  });

  it("respects an explicit on value", () => {
    writeEndless("whack", true);
    expect(readEndless("whack")).toBe(true);
    expect(window.localStorage.getItem("foxfocus.endless.v1.whack")).toBe("1");
  });
});

describe("adaptive accuracy tracking", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns 0.5 with no samples", () => {
    expect(recentAccuracy("whack")).toBe(0.5);
  });

  it("clamps samples into the 0..1 range", () => {
    pushSample("whack", 5);
    pushSample("whack", -2);
    expect(recentAccuracy("whack")).toBe(0.5); // (1 + 0) / 2
  });

  it("averages only the last five samples", () => {
    // 1 will be evicted from the trailing-5 window.
    [1, 0, 0, 0, 0, 0].forEach((v) => pushSample("whack", v));
    expect(recentAccuracy("whack")).toBe(0);
  });

  it("keeps at most eight samples in storage", () => {
    for (let i = 0; i < 12; i++) pushSample("whack", 1);
    const arr = JSON.parse(window.localStorage.getItem("foxfocus.hist.v1.whack")!) as number[];
    expect(arr).toHaveLength(8);
  });
});

describe("effectiveLevel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the chosen level directly when not adaptive", () => {
    writeLevel("whack", "medium");
    expect(effectiveLevel("whack")).toBe("medium");
  });

  it("maps high adaptive accuracy to hard", () => {
    writeLevel("whack", "adaptive");
    [0.9, 0.9, 0.9].forEach((v) => pushSample("whack", v));
    expect(effectiveLevel("whack")).toBe("hard");
  });

  it("maps mid adaptive accuracy to medium", () => {
    writeLevel("whack", "adaptive");
    [0.6, 0.6, 0.6].forEach((v) => pushSample("whack", v));
    expect(effectiveLevel("whack")).toBe("medium");
  });

  it("maps low adaptive accuracy to easy", () => {
    writeLevel("whack", "adaptive");
    [0.1, 0.1, 0.1].forEach((v) => pushSample("whack", v));
    expect(effectiveLevel("whack")).toBe("easy");
  });

  it("treats adaptive with no history (0.5) as easy, since 0.5 < 0.55", () => {
    writeLevel("whack", "adaptive");
    expect(effectiveLevel("whack")).toBe("easy");
  });
});
