import type { ClothingPiece } from "@penta/wearthere";

export function garmentKind(piece: ClothingPiece) {
  if (piece.layer === "shell" || /coat|jacket|rain/i.test(piece.name)) return "coat";
  if (piece.category === "knit" || /knit|hoodie/i.test(piece.name)) return "knit";
  if (piece.layer === "bottom") return "trousers";
  if (piece.layer === "shoes") return "boots";
  if (/scarf|hat|glove|umbrella/i.test(piece.name)) return "extra";
  return "shirt";
}

export function GarmentSvg({ kind }: { kind: ReturnType<typeof garmentKind> }) {
  return (
    <svg className="wt-garment-svg" viewBox="0 0 160 200" aria-hidden>
      {kind === "coat" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M28 38 C48 18 112 18 132 38 L148 78 V188 H108 V118 H52 V188 H12 V78 Z" />
          <path d="M80 38 V118" />
          <path d="M28 38 C40 52 48 70 48 92" />
          <path d="M132 38 C120 52 112 70 112 92" />
        </g>
      ) : null}
      {kind === "knit" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M36 46 C54 24 106 24 124 46 L138 78 V176 H22 V78 Z" />
          <path d="M48 86 H112 M48 104 H112 M48 122 H112" opacity="0.45" />
        </g>
      ) : null}
      {kind === "shirt" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M32 44 L58 28 H102 L128 44 L148 72 V176 H12 V72 Z" />
          <path d="M80 28 V72 L64 88 M80 72 L96 88" />
        </g>
      ) : null}
      {kind === "trousers" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M42 22 H118 L132 188 H92 L80 86 L68 188 H28 Z" />
        </g>
      ) : null}
      {kind === "boots" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M18 88 H58 V132 C58 150 78 162 110 162 H142 V188 H22 C12 188 10 170 10 150 V88 Z" />
          <path d="M22 120 H56" />
        </g>
      ) : null}
      {kind === "extra" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M28 78 C48 40 112 40 132 78" />
          <path d="M40 92 C58 70 102 70 120 92" />
        </g>
      ) : null}
    </svg>
  );
}
