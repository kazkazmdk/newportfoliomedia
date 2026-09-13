export function subscribeMediaQuery(
  query: string,
  onChange: (matches: boolean) => void,
): () => void {
  const media = window.matchMedia(query);
  const listener = (event: MediaQueryListEvent) => onChange(event.matches);
  onChange(media.matches);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function clampDevicePixelRatio(
  devicePixelRatio: number,
  max = 2,
): number {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) {
    return 1;
  }
  return Math.min(devicePixelRatio, max);
}
