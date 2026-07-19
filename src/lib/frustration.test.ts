import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearFrustration, signal, triggerBreak, type Suggestion } from "./frustration";

const SETTINGS_KEY = "foxfocus.settings.v1";

type Fired = { gameId: string; suggestion: Suggestion };

function listen(): { fires: Fired[]; stop: () => void } {
  const fires: Fired[] = [];
  const on = (e: Event) => fires.push((e as CustomEvent).detail as Fired);
  window.addEventListener("foxfocus:frustrated", on as EventListener);
  return {
    fires,
    stop: () => window.removeEventListener("foxfocus:frustrated", on as EventListener),
  };
}

let gameCounter = 0;
/** Unique id per test — buckets are module-level and persist across tests. */
function freshGame(): string {
  return `game-${gameCounter++}`;
}

function setSensitivity(level: "low" | "medium" | "high") {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ frustrationSensitivity: level }));
}

beforeEach(() => {
  window.localStorage.clear();
  clearFrustration();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("signal thresholds (medium sensitivity)", () => {
  it("fires after four misses", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    for (let i = 0; i < 3; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300); // avoid rage-tap coupling
    }
    expect(fires).toHaveLength(0);
    signal(g, "miss");
    expect(fires).toHaveLength(1);
    expect(fires[0].gameId).toBe(g);
    expect(fires[0].suggestion.title.length).toBeGreaterThan(0);
    stop();
  });

  it("fires after two quits", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    signal(g, "quit");
    expect(fires).toHaveLength(0);
    signal(g, "quit");
    expect(fires).toHaveLength(1);
    stop();
  });

  it("a hit reduces the miss counter, delaying the fire", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    for (let i = 0; i < 3; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    signal(g, "hit"); // 3 -> 2
    vi.advanceTimersByTime(300);
    signal(g, "miss"); // back to 3, not yet 4
    expect(fires).toHaveLength(0);
    stop();
  });
});

describe("cooldown", () => {
  it("does not fire twice within the 25s cooldown", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    for (let i = 0; i < 4; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    expect(fires).toHaveLength(1);
    for (let i = 0; i < 4; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    expect(fires).toHaveLength(1); // still 1 — inside cooldown
    stop();
  });

  it("fires again once the cooldown elapses", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    for (let i = 0; i < 4; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    expect(fires).toHaveLength(1);
    vi.advanceTimersByTime(26_000);
    for (let i = 0; i < 4; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    expect(fires).toHaveLength(2);
    stop();
  });
});

describe("sensitivity", () => {
  it("high sensitivity fires sooner (two misses)", () => {
    setSensitivity("high");
    const g = freshGame();
    const { fires, stop } = listen();
    signal(g, "miss");
    vi.advanceTimersByTime(300);
    signal(g, "miss");
    expect(fires).toHaveLength(1);
    stop();
  });

  it("low sensitivity needs more misses", () => {
    setSensitivity("low");
    const g = freshGame();
    const { fires, stop } = listen();
    for (let i = 0; i < 5; i++) {
      signal(g, "miss");
      vi.advanceTimersByTime(300);
    }
    expect(fires).toHaveLength(0); // low needs 6 misses
    signal(g, "miss");
    expect(fires).toHaveLength(1);
    stop();
  });
});

describe("triggerBreak", () => {
  it("fires a suggestion immediately with a fallback for unknown games", () => {
    const g = freshGame();
    const { fires, stop } = listen();
    triggerBreak(g);
    expect(fires).toHaveLength(1);
    expect(fires[0].suggestion.action?.to).toBe("/breathe");
    stop();
  });
});
