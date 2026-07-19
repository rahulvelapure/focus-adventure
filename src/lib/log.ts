// Lightweight logging for otherwise-swallowed, non-fatal errors.
//
// Persistence and browser-API calls (localStorage access, JSON parsing) must
// never throw into the child-facing UI, so the codebase wraps them in
// try/catch. Discarding the error entirely, however, makes real problems —
// storage quota exceeded, corrupted saved data, serialization bugs — invisible
// and impossible to diagnose. This surfaces them in development while staying
// completely silent in production so the resilient no-op behavior is preserved.

export function warnSwallowed(scope: string, error: unknown): void {
  if (import.meta.env.PROD) return;
  console.warn(`[focus-adventure] non-fatal error in ${scope}:`, error);
}
