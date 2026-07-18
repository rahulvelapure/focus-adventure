import { useCallback, useEffect, useState } from "react";

// Persistent best-score storage per game.
// Higher-is-better by default; pass mode: "min" for time-like scores.

const PREFIX = "foxfocus.score.v1.";

function key(id: string) {
  return PREFIX + id;
}

export function readBest(id: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(id));
    return raw == null ? null : Number(raw);
  } catch {
    return null;
  }
}

export function writeBest(id: string, value: number) {
  try {
    window.localStorage.setItem(key(id), String(value));
  } catch {
    /* ignore */
  }
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