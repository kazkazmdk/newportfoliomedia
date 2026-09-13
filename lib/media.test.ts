import { clampDevicePixelRatio, subscribeMediaQuery } from "./media";

describe("subscribeMediaQuery", () => {
  it("notifies the current match and later changes", () => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const media = {
      matches: false,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
      removeEventListener: () => {
        listeners.length = 0;
      },
    };
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => media,
    });

    const seen: boolean[] = [];
    const unsubscribe = subscribeMediaQuery("(max-width: 768px)", (matches) => {
      seen.push(matches);
    });

    expect(seen).toEqual([false]);
    listeners[0]?.({ matches: true } as MediaQueryListEvent);
    expect(seen).toEqual([false, true]);
    unsubscribe();
  });
});

describe("clampDevicePixelRatio", () => {
  it("caps high DPR values", () => {
    expect(clampDevicePixelRatio(3)).toBe(2);
    expect(clampDevicePixelRatio(1.5)).toBe(1.5);
    expect(clampDevicePixelRatio(0)).toBe(1);
  });
});
