import { describe, expect, it } from "vitest";
import { CBT_LESSONS, getLesson, type CbtLesson, type CbtLevel } from "./cbt";

const LEVELS: CbtLevel[] = ["easy", "medium", "hard"];

describe("getLesson", () => {
  it("returns the lesson for a known game and level", () => {
    const lesson = getLesson("whack", "easy");
    expect(lesson).not.toBeNull();
    expect(lesson!.skill).toContain("Stop");
  });

  it("returns null for an unknown game", () => {
    expect(getLesson("does-not-exist", "easy")).toBeNull();
  });

  it("falls back to the easy lesson for an unknown level", () => {
    const easy = getLesson("whack", "easy");
    // Cast to bypass the typed level param to exercise the runtime fallback.
    const bogus = getLesson("whack", "impossible" as CbtLevel);
    expect(bogus).toEqual(easy);
  });

  it("returns distinct content across difficulty levels for whack", () => {
    const easy = getLesson("whack", "easy")!;
    const hard = getLesson("whack", "hard")!;
    // Hard adds an extra rehearsal drill step.
    expect(hard.drill.length).toBeGreaterThan(easy.drill.length);
  });
});

describe("CBT_LESSONS content integrity", () => {
  const entries = Object.entries(CBT_LESSONS);

  it("covers every game at all three levels", () => {
    for (const [game, byLevel] of entries) {
      for (const level of LEVELS) {
        expect(byLevel[level], `${game}.${level}`).toBeTruthy();
      }
    }
  });

  const allLessons: [string, CbtLesson][] = entries.flatMap(([game, byLevel]) =>
    LEVELS.map((level) => [`${game}.${level}`, byLevel[level]] as [string, CbtLesson]),
  );

  it("every lesson has a skill, rationale and at least one lesson bullet", () => {
    for (const [id, lesson] of allLessons) {
      expect(lesson.skill.length, id).toBeGreaterThan(0);
      expect(lesson.why.length, id).toBeGreaterThan(0);
      expect(lesson.lesson.length, id).toBeGreaterThan(0);
      expect(lesson.drill.length, id).toBeGreaterThan(0);
    }
  });

  it("choice-based drills point their correct index at a real choice", () => {
    for (const [id, lesson] of allLessons) {
      for (const step of lesson.drill) {
        expect(step.prompt.length, id).toBeGreaterThan(0);
        if (step.choices) {
          expect(step.correct, id).toBeTypeOf("number");
          expect(step.correct!).toBeGreaterThanOrEqual(0);
          expect(step.correct!).toBeLessThan(step.choices.length);
        }
      }
    }
  });
});
