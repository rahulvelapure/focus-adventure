import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStars } from "./stars";

const KEY = "foxfocus.stars.v1";

describe("useStars", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates from an empty store to zero stars", () => {
    const { result } = renderHook(() => useStars());
    expect(result.current.stars).toBe(0);
    expect(result.current.hydrated).toBe(true);
  });

  it("hydrates from a previously stored value", () => {
    window.localStorage.setItem(KEY, "7");
    const { result } = renderHook(() => useStars());
    expect(result.current.stars).toBe(7);
  });

  it("adds stars and persists them", () => {
    const { result } = renderHook(() => useStars());
    act(() => result.current.add(3));
    expect(result.current.stars).toBe(3);
    expect(window.localStorage.getItem(KEY)).toBe("3");
  });

  it("accumulates across multiple adds", () => {
    const { result } = renderHook(() => useStars());
    act(() => result.current.add(2));
    act(() => result.current.add(5));
    expect(result.current.stars).toBe(7);
  });

  it("never drops below zero", () => {
    window.localStorage.setItem(KEY, "2");
    const { result } = renderHook(() => useStars());
    act(() => result.current.add(-10));
    expect(result.current.stars).toBe(0);
    expect(window.localStorage.getItem(KEY)).toBe("0");
  });
});
