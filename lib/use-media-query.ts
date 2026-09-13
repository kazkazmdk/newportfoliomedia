"use client";

import { useEffect, useState } from "react";
import { subscribeMediaQuery } from "@/lib/media";

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);

  useEffect(() => subscribeMediaQuery(query, setMatches), [query]);

  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsMobileViewport() {
  return useMediaQuery("(max-width: 768px)");
}
