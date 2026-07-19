import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes, keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("supports conditional object syntax", () => {
    expect(cn({ a: true, b: false }, "c")).toBe("a c");
  });
});
