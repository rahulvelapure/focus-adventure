import { useCallback, useEffect, useState } from "react";
import { readString, writeString } from "./storage";

// Persistent best-score storage per game.
// Higher-is-better by default; pass mode: "min" for time-like scores.

const PREFIX = "foxfocus.score.v1.";

function key(id: string) {
  return PREFIX + id;
}

export function readBest(id: string): number | null {
  const raw = readString(key(id));
  return raw == null ? null : Number(raw);
}

export function writeBest(id: string, value: number) {
  writeString(key(id), String(value));
}

export function useBest(id: string, mode: "max" | "min" = "max") {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(readBest(id));
  }, [id]);

  const submit = useCallback(
    (v: number) => {
      const cur = readBest(id);
      const better =
        cur == null ? true : mode === "max" ? v > cur : v < cur;
      if (better) {
        writeBest(id, v);
        setBest(v);
        return true;
      }
      return false;
    },
    [id, mode],
  );

  return { best, submit };
}