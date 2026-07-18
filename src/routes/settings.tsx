import { createFileRoute } from "@tanstack/react-router";
import { Volume2, VolumeX, Vibrate, Star, RotateCcw } from "lucide-react";
import { useSettings, THEMES, type Theme } from "@/lib/settings";
import { useStars } from "@/lib/stars";
import { sfx } from "@/lib/feedback";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FoxFocus" },
      { name: "description", content: "Pick a color theme, toggle sound and haptics, and manage star progress." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { settings, update } = useSettings();
  const { stars, add } = useStars();

  return (
    <div className="mx-auto max-w-xl px-5 pt-8">
      <h1 className="text-2xl font-display">Settings</h1>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Theme
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {THEMES.map((t) => {
            const active = settings.theme === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => {
                    update({ theme: t.id as Theme });
                    sfx.tap();
                  }}
                  aria-pressed={active}
                  className={`w-full rounded-2xl border-2 p-3 text-left transition-all min-h-16 ${
                    active
                      ? "border-primary bg-card shadow-[var(--shadow-soft)]"
                      : "border-border bg-card/60"
                  }`}
                >
                  <div className="flex gap-1.5">
                    {t.swatch.map((c) => (
                      <span
                        key={c}
                        className="size-6 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-display text-sm">{t.label}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Feedback
        </h2>
        <Toggle
          label="Game sounds"
          desc="Playful blips and win jingles"
          on={settings.sound}
          onToggle={() => {
            update({ sound: !settings.sound });
            if (!settings.sound) setTimeout(() => sfx.good(), 30);
          }}
          IconOn={Volume2}
          IconOff={VolumeX}
        />
        <Toggle
          label="Haptic feedback"
          desc="Gentle buzz on Android devices"
          on={settings.haptics}
          onToggle={() => {
            update({ haptics: !settings.haptics });
            if (!settings.haptics) setTimeout(() => sfx.tap(), 30);
          }}
          IconOn={Vibrate}
          IconOff={Vibrate}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Progress
        </h2>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-accent text-accent" aria-hidden />
            <span className="font-display text-lg">{stars} stars</span>
          </div>
          <button
            onClick={() => {
              if (confirm("Reset all stars to zero?")) {
                add(-stars);
                sfx.chime();
              }
            }}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm font-bold text-muted-foreground min-h-11"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onToggle,
  IconOn,
  IconOff,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
  IconOn: React.ComponentType<{ className?: string }>;
  IconOff: React.ComponentType<{ className?: string }>;
}) {
  const Icon = on ? IconOn : IconOff;
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left min-h-16"
    >
      <span
        className={`grid size-11 place-items-center rounded-full ${
          on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-base">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-muted"
        }`}
        aria-hidden
      >
        <span
          className="absolute top-0.5 size-6 rounded-full bg-white shadow transition-all"
          style={{ left: on ? "22px" : "2px" }}
        />
      </span>
    </button>
  );
}