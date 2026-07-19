import { useEffect, useState, useCallback } from "react";

import { warnSwallowed } from "./log";

const KEY = "foxfocus.stars.v1";

function read(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(KEY) ?? 0) || 0;
  } catch (error) {
    warnSwallowed("stars.read", error);
    return 0;
  }
}

export function useStars() {
  const [stars, setStars] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStars(read());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setStars(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((n: number) => {
    const next = Math.max(0, read() + n);
    try {
      window.localStorage.setItem(KEY, String(next));
    } catch (error) {
      warnSwallowed("stars.add", error);
    }
    setStars(next);
  }, []);

  return { stars, add, hydrated };
}