import { pushSample } from "./difficulty";
import { recordEvent } from "./quests";
import { readJSON, writeJSON } from "./storage";

const SYNC_QUEUE_KEY = "foxfocus.syncqueue.v1";

/**
 * Central hook every game calls when a session ends.
 * accuracy: 0..1 (used by adaptive engine)
 * correctCount: raw score used by 'correct' quests
 * minutes: for time-based quests (focus)
 */
export function recordPlay(opts: {
  gameId: string;
  accuracy?: number;
  correctCount?: number;
  minutes?: number;
}) {
  const { gameId, accuracy, correctCount, minutes } = opts;
  if (typeof accuracy === "number") pushSample(gameId, accuracy);
  recordEvent("plays", gameId, 1);
  if (typeof correctCount === "number" && correctCount > 0) {
    recordEvent("correct", gameId, correctCount);
  }
  if (typeof minutes === "number" && minutes > 0) {
    recordEvent("minutes", gameId, minutes);
  }
  // Queue for future cloud sync when reconnected.
  const arr = readJSON<Array<Record<string, unknown>>>(SYNC_QUEUE_KEY, []);
  arr.push({ ...opts, at: Date.now() });
  while (arr.length > 200) arr.shift();
  writeJSON(SYNC_QUEUE_KEY, arr);
}