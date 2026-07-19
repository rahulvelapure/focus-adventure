import { useEffect, useState, useCallback } from "react";
import { readString, writeString } from "./storage";
import { useWindowEvent } from "./use-window-event";

const KEY = "foxfocus.stars.v1";

function read(): number {
  return Number(readString(KEY) ?? 0) || 0;
}

export function useStars() {
  const [stars, setStars] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStars(read());
    setHydrated(true);
  }, []);

  useWindowEvent("storage", (e) => {
    if ((e as StorageEvent).key === KEY) setStars(read());
  });

  const add = useCallback((n: number) => {
    const next = Math.max(0, read() + n);
    writeString(KEY, String(next));
    setStars(next);
  }, []);

  return { stars, add, hydrated };
}