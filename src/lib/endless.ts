import { useEffect, useRef } from "react";
import { readEndless } from "./difficulty";

/**
 * When `done` becomes true and endless mode is on for this game,
 * call `restart()` after `delay` ms. Games can flip a "round-over"
 * flag to true and let this hook loop them forever.
 */
export function useEndlessAutoRestart(
  gameId: string,
  done: boolean,
  restart: () => void,
  delay = 1400,
) {
  const ref = useRef(restart);
  ref.current = restart;
  useEffect(() => {
    if (!done) return;
    if (!readEndless(gameId)) return;
    const t = window.setTimeout(() => ref.current(), delay);
    return () => window.clearTimeout(t);
  }, [gameId, done, delay]);
}