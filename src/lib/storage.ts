// Shared, SSR-safe localStorage helpers plus the tiny cross-component
// event bus every persisted store uses to stay in sync. Centralised here so
// each store no longer re-implements the same `typeof window` guards and
// try/catch swallowing.

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Read a raw string value. Returns null when missing, unavailable, or on error. */
export function readString(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Write a raw string value. Silently no-ops when storage is unavailable. */
export function writeString(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** Remove a key. Silently no-ops when storage is unavailable. */
export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Read and JSON-parse a value, returning `fallback` when missing or on error. */
export function readJSON<T>(key: string, fallback: T): T {
  const raw = readString(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON-stringify and write a value. Silently no-ops on error. */
export function writeJSON(key: string, value: unknown): void {
  try {
    writeString(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Dispatch a same-tab custom event used to notify subscribed stores. */
export function emit(event: string): void {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(event));
  } catch {
    /* ignore */
  }
}
