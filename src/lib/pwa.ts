// Guarded service-worker registration. Refuses in dev, iframe, and Lovable
// preview hosts. Supports ?sw=off kill switch. Safe to import from the client.

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  if (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  ) return true;
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;
  return false;
}

export async function registerPwa() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (shouldSkip()) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        if (r.active?.scriptURL?.endsWith("/sw.js")) await r.unregister();
      }
    } catch {}
    return;
  }
  try {
    // @ts-ignore - virtual module provided by vite-plugin-pwa
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch {}
}