import { useEffect, useState, useCallback } from "react";

export type Theme = "sunrise" | "ocean" | "forest" | "candy" | "night";

export const THEMES: { id: Theme; label: string; swatch: string[] }[] = [
  { id: "sunrise", label: "Sunrise", swatch: ["#F0784A", "#FFC96B", "#FAF5EA"] },
  { id: "ocean", label: "Ocean", swatch: ["#2D8FB8", "#5CD1D1", "#EAF6FA"] },
  { id: "forest", label: "Forest", swatch: ["#3E8E5A", "#B8D96A", "#F1F5EA"] },
  { id: "candy", label: "Candy", swatch: ["#E85A9E", "#B592F0", "#FCEFF6"] },
  { id: "night", label: "Night", swatch: ["#8FA6FF", "#F1C86A", "#1A1B2E"] },
];

type Settings = {
  theme: Theme;
  sound: boolean;
  haptics: boolean;
  name: string;
};

const KEY = "foxfocus.settings.v1";
const DEFAULT: Settings = { theme: "sunrise", sound: true, haptics: true, name: "" };

function read(): Settings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function write(s: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("foxfocus:settings"));
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "night") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = read();
    setSettings(s);
    applyTheme(s.theme);
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