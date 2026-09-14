export type ConfidenceTone = "high" | "medium" | "low" | "unknown";

export function confidenceTone(
  level: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" | string,
): ConfidenceTone {
  const normalized = level.toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  if (normalized === "low") return "low";
  return "unknown";
}

export function formatConfidence(score: number): string {
  if (score < 0) return "Unknown";
  return `${Math.round(score)}%`;
}

export const INDEX_LABEL: Record<string, string> = {
  INDEXABLE: "Indexable",
  NOINDEX_PRODUCT: "Product only",
  GRAPH_ONLY: "Graph only",
  DRAFT: "Draft",
  READY: "Ready",
  PUBLISHED: "Published",
};

export function prefersReducedMotion(): boolean {
  const g = globalThis as { window?: { matchMedia?: (q: string) => { matches: boolean } } };
  if (!g.window?.matchMedia) return false;
  return g.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
