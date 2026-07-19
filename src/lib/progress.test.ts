import { beforeEach, describe, expect, it } from "vitest";
import { recordPlay } from "./progress";
import { recentAccuracy } from "./difficulty";

const SYNC_KEY = "foxfocus.syncqueue.v1";

function syncQueue(): Array<Record<string, unknown>> {
  const raw = window.localStorage.getItem(SYNC_KEY);
  return raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
}

describe("recordPlay", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("feeds accuracy into the adaptive engine's recent-accuracy history", () => {
    recordPlay({ gameId: "whack", accuracy: 0.9 });
    expect(recentAccuracy("whack")).toBeCloseTo(0.9, 5);
  });

  it("skips the accuracy sample when accuracy is omitted", () => {
    recordPlay({ gameId: "whack", correctCount: 3 });
    expect(window.localStorage.getItem("foxfocus.hist.v1.whack")).toBeNull();
  });

  it("queues the play for future cloud sync with a timestamp", () => {
    recordPlay({ gameId: "whack", accuracy: 0.5, correctCount: 4, minutes: 2 });
    const queue = syncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      gameId: "whack",
      accuracy: 0.5,
      correctCount: 4,
      minutes: 2,
    });
    expect(queue[0].at).toBeTypeOf("number");
  });

  it("appends multiple plays to the sync queue", () => {
    recordPlay({ gameId: "a" });
    recordPlay({ gameId: "b" });
    expect(syncQueue().map((e) => e.gameId)).toEqual(["a", "b"]);
  });

  it("bounds the sync queue at 200 entries", () => {
    for (let i = 0; i < 205; i++) recordPlay({ gameId: `g${i}` });
    const queue = syncQueue();
    expect(queue).toHaveLength(200);
    // Oldest entries were dropped; the newest remains.
    expect(queue[queue.length - 1].gameId).toBe("g204");
    expect(queue[0].gameId).toBe("g5");
  });
});
