export const MAP_NODES: Record<string, { x: number; y: number }> = {
  london: { x: 118, y: 92 },
  dublin: { x: 62, y: 88 },
  amsterdam: { x: 196, y: 108 },
  brussels: { x: 184, y: 128 },
  paris: { x: 168, y: 148 },
  lyon: { x: 198, y: 188 },
  milan: { x: 236, y: 198 },
  munich: { x: 248, y: 168 },
  berlin: { x: 268, y: 118 },
  barcelona: { x: 158, y: 228 },
  madrid: { x: 98, y: 228 },
  lisbon: { x: 48, y: 236 },
  rome: { x: 258, y: 228 },
  frankfurt: { x: 228, y: 138 },
  zurich: { x: 228, y: 178 },
  geneva: { x: 208, y: 188 },
  marseille: { x: 198, y: 218 },
  hamburg: { x: 236, y: 96 },
};

export function nodeOf(slug: string) {
  return MAP_NODES[slug] ?? { x: 180, y: 160 };
}
