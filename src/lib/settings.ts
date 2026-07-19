import { useEffect, useState, useCallback } from "react";

import { warnSwallowed } from "./log";

export type Theme =
  | "sunrise"
  | "ocean"
  | "forest"
  | "candy"
  | "night"
  | "galaxy"
  | "mint"
  | "peach"
  | "berry"
  | "bumblebee";

export const THEMES: { id: Theme; label: string; swatch: string[] }[] = [
  { id: "sunrise", label: "Sunrise", swatch: ["#F0784A", "#FFC96B", "#FAF5EA"] },
  { id: "ocean", label: "Ocean", swatch: ["#2D8FB8", "#5CD1D1", "#EAF6FA"] },
  { id: "forest", label: "Forest", swatch: ["#3E8E5A", "#B8D96A", "#F1F5EA"] },
  { id: "candy", label: "Candy", swatch: ["#E85A9E", "#B592F0", "#FCEFF6"] },
  { id: "night", label: "Night", swatch: ["#8FA6FF", "#F1C86A", "#1A1B2E"] },
  { id: "galaxy", label: "Galaxy", swatch: ["#7A5CF0", "#F26AC8", "#1B1638"] },
  { id: "mint", label: "Mint", swatch: ["#3FBFA6", "#A8ECD4", "#EEFBF6"] },
  { id: "peach", label: "Peach", swatch: ["#FF8FA0", "#FFD3A3", "#FFF3EC"] },
  { id: "berry", label: "Berry", swatch: ["#8A3FA6", "#E36BB0", "#F7ECF6"] },
  { id: "bumblebee", label: "Bumblebee", swatch: ["#F5B301", "#2A2A2A", "#FFF8DC"] },
];

type Settings = {
  theme: Theme;
  sound: boolean;
  haptics: boolean;
  name: string;
  focusMode: boolean;
  // Accessibility
  dyslexiaFont: boolean;
  textScale: "sm" | "md" | "lg" | "xl";
  highContrast: boolean;
  // Coaching
  frustrationSensitivity: "low" | "medium" | "high";
  coachIntensity: "minimal" | "balanced" | "frequent";
};

const KEY = "foxfocus.settings.v1";
const DEFAULT: Settings = {
  theme: "sunrise",
  sound: true,
  haptics: true,
  name: "",
  focusMode: false,
  dyslexiaFont: false,
  textScale: "md",
  highContrast: false,
  frustrationSensitivity: "medium",
  coachIntensity: "balanced",
};

function read(): Settings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch (error) {
    warnSwallowed("settings.read", error);
    return DEFAULT;
  }
}

function write(s: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("foxfocus:settings"));
  } catch (error) {
    warnSwallowed("settings.write", error);
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "night") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export function applyA11y(s: Pick<Settings, "dyslexiaFont" | "textScale" | "highContrast">) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-font", s.dyslexiaFont ? "dyslexic" : "default");
  html.setAttribute("data-text-scale", s.textScale);
  if (s.highContrast) html.setAttribute("data-contrast", "high");
  else html.removeAttribute("data-contrast");
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = read();
    setSettings(s);
    applyTheme(s.theme);
    applyA11y(s);
    setHydrated(true);
    const on = () => setSettings(read());
    window.addEventListener("foxfocus:settings", on);
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) on();
    });
    return () => window.removeEventListener("foxfocus:settings", on);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...read(), ...patch };
    write(next);
    setSettings(next);
    if (patch.theme) applyTheme(patch.theme);
    if ("dyslexiaFont" in patch || "textScale" in patch || "highContrast" in patch) applyA11y(next);
  }, []);

  return { settings, update, hydrated };
}

// Non-reactive readers for feedback
export function isSoundOn() {
  return read().sound;
}
export function isHapticsOn() {
  return read().haptics;
}
export function isFocusModeOn() {
  return read().focusMode;
}
export function getFrustrationSensitivity(): "low" | "medium" | "high" {
  return read().frustrationSensitivity;
}
export function getCoachIntensity(): "minimal" | "balanced" | "frequent" {
  return read().coachIntensity;
}

/** Best-effort request for browser fullscreen. Silently no-ops if blocked. */
export async function tryEnterFullscreen() {
  if (typeof document === "undefined") return;
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    }
  } catch {
    /* ignore — browser may block outside a user gesture */
  }
}

export async function exitFullscreen() {
  if (typeof document === "undefined") return;
  const d = document as Document & { webkitExitFullscreen?: () => Promise<void> };
  try {
    if (document.fullscreenElement) {
      if (d.exitFullscreen) await d.exitFullscreen();
      else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
    }
  } catch { /* ignore */ }
}