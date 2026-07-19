import { beforeEach, describe, expect, it } from "vitest";
import { readBest, writeBest } from "./scores";

describe("scores", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no best exists", () => {
    expect(readBest("whack")).toBeNull();
  });

  it("round-trips a written value", () => {
    writeBest("whack", 42);
    expect(readBest("whack")).toBe(42);
  });

  it("stores scores per game id", () => {
    writeBest("whack", 10);
    writeBest("reaction", 20);
    expect(readBest("whack")).toBe(10);
    expect(readBest("reaction")).toBe(20);
  });

  it("namespaces keys under the score prefix", () => {
    writeBest("whack", 5);
    expect(window.localStorage.getItem("foxfocus.score.v1.whack")).toBe("5");
  });

  it("coerces stored strings back to numbers", () => {
    window.localStorage.setItem("foxfocus.score.v1.g", "7");
    expect(readBest("g")).toBe(7);
  });

  it("overwrites the previous value", () => {
    writeBest("g", 1);
    writeBest("g", 2);
    expect(readBest("g")).toBe(2);
  });
});
