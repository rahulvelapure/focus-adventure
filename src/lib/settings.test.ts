import { beforeEach, describe, expect, it } from "vitest";
import {
  applyA11y,
  applyTheme,
  getCoachIntensity,
  getFrustrationSensitivity,
  isFocusModeOn,
  isHapticsOn,
  isSoundOn,
} from "./settings";

const KEY = "foxfocus.settings.v1";

describe("settings readers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses sensible defaults when nothing is stored", () => {
    expect(isSoundOn()).toBe(true);
    expect(isHapticsOn()).toBe(true);
    expect(isFocusModeOn()).toBe(false);
    expect(getFrustrationSensitivity()).toBe("medium");
    expect(getCoachIntensity()).toBe("balanced");
  });

  it("merges stored partial settings over defaults", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ sound: false }));
    expect(isSoundOn()).toBe(false);
    // Unspecified keys still fall back to defaults.
    expect(isHapticsOn()).toBe(true);
  });

  it("reflects stored coaching preferences", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ frustrationSensitivity: "high", coachIntensity: "frequent" }),
    );
    expect(getFrustrationSensitivity()).toBe("high");
    expect(getCoachIntensity()).toBe("frequent");
  });

  it("falls back to defaults on malformed JSON", () => {
    window.localStorage.setItem(KEY, "not json");
    expect(isSoundOn()).toBe(true);
    expect(getFrustrationSensitivity()).toBe("medium");
  });
});

describe("applyTheme", () => {
  it("sets the data-theme attribute", () => {
    applyTheme("ocean");
    expect(document.documentElement.getAttribute("data-theme")).toBe("ocean");
  });

  it("adds the dark class only for the night theme", () => {
    applyTheme("night");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("sunrise");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("applyA11y", () => {
  it("sets font and text scale attributes", () => {
    applyA11y({ dyslexiaFont: true, textScale: "lg", highContrast: false });
    expect(document.documentElement.getAttribute("data-font")).toBe("dyslexic");
    expect(document.documentElement.getAttribute("data-text-scale")).toBe("lg");
    expect(document.documentElement.hasAttribute("data-contrast")).toBe(false);
  });

  it("toggles the high-contrast attribute", () => {
    applyA11y({ dyslexiaFont: false, textScale: "md", highContrast: true });
    expect(document.documentElement.getAttribute("data-font")).toBe("default");
    expect(document.documentElement.getAttribute("data-contrast")).toBe("high");

    applyA11y({ dyslexiaFont: false, textScale: "md", highContrast: false });
    expect(document.documentElement.hasAttribute("data-contrast")).toBe(false);
  });
});
