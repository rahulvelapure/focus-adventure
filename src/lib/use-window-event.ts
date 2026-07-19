import { useEffect, useRef } from "react";

/**
 * Subscribe to a window event for the lifetime of the component.
 * The latest `handler` is always invoked without re-subscribing on every
 * render, matching the "add once, remove on unmount" pattern the persisted
 * stores previously hand-rolled.
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (ev: WindowEventMap[K]) => void,
): void;
export function useWindowEvent(event: string, handler: (ev: Event) => void): void;
export function useWindowEvent(event: string, handler: (ev: Event) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = (ev: Event) => ref.current(ev);
    window.addEventListener(event, on);
    return () => window.removeEventListener(event, on);
  }, [event]);
}
