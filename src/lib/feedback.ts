import { isHapticsOn, isSoundOn } from "./settings";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

type ToneOpts = {
  freq?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
};

export function tone({ freq = 440, duration = 0.15, type = "sine", volume = 0.15 }: ToneOpts = {}) {
  if (!isSoundOn()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export function vibe(pattern: number | number[] = 20) {
  if (!isHapticsOn()) return;
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as Navigator).vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

// Presets
export const sfx = {
  tap: () => {
    tone({ freq: 520, duration: 0.08, type: "triangle", volume: 0.12 });
    vibe(10);
  },
  good: () => {
    tone({ freq: 660, duration: 0.09, type: "triangle" });
    setTimeout(() => tone({ freq: 880, duration: 0.12, type: "triangle" }), 90);
    vibe(15);
  },
  bad: () => {
    tone({ freq: 180, duration: 0.2, type: "sawtooth", volume: 0.12 });
    vibe([30, 40, 30]);
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => tone({ freq: f, duration: 0.16, type: "triangle" }), i * 110),
    );
    vibe([20, 40, 20, 40, 60]);
  },
  chime: () => {
    tone({ freq: 740, duration: 0.25, type: "sine", volume: 0.14 });
  },
};