import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useBest } from "./scores";

describe("useBest", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts with the stored best (or null)", () => {
    const { result } = renderHook(() => useBest("whack"));
    expect(result.current.best).toBeNull();
  });

  it("accepts the first score submitted", () => {
    const { result } = renderHook(() => useBest("whack"));
    let accepted = false;
    act(() => {
      accepted = result.current.submit(10);
    });
    expect(accepted).toBe(true);
    expect(result.current.best).toBe(10);
  });

  it("in max mode keeps only higher scores", () => {
    const { result } = renderHook(() => useBest("whack", "max"));
    act(() => result.current.submit(10));
    let accepted = true;
    act(() => {
      accepted = result.current.submit(5);
    });
    expect(accepted).toBe(false);
    expect(result.current.best).toBe(10);

    act(() => {
      accepted = result.current.submit(15);
    });
    expect(accepted).toBe(true);
    expect(result.current.best).toBe(15);
  });

  it("in min mode keeps only lower scores", () => {
    const { result } = renderHook(() => useBest("reaction", "min"));
    act(() => result.current.submit(300));
    let accepted = false;
    act(() => {
      accepted = result.current.submit(250);
    });
    expect(accepted).toBe(true);
    expect(result.current.best).toBe(250);

    act(() => {
      accepted = result.current.submit(400);
    });
    expect(accepted).toBe(false);
    expect(result.current.best).toBe(250);
  });
});
