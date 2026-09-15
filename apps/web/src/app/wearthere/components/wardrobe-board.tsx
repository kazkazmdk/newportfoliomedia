"use client";

import { useMemo, useState } from "react";
import type { ClothingPiece } from "@penta/wearthere";

function silhouette(piece: ClothingPiece) {
  if (piece.layer === "shell" || /coat|jacket|rain/i.test(piece.name)) return "jacket";
  if (piece.category === "knit" || /knit|hoodie/i.test(piece.name)) return "knit";
  if (piece.layer === "bottom") return "trousers";
  if (piece.layer === "shoes") return "shoes";
  return "shirt";
}

export function WardrobeBoard({ pieces }: { pieces: ClothingPiece[] }) {
  const [packed, setPacked] = useState<string[]>(() => pieces.map((p) => p.id));
  const visible = useMemo(() => pieces, [pieces]);

  return (
    <div className="wt-board">
      {visible.map((piece, i) => {
        const on = packed.includes(piece.id);
        return (
          <article key={piece.id} className="wt-garment" style={{ opacity: on ? 1 : 0.35 }}>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{String(i + 1).padStart(2, "0")}</p>
            <div className={`wt-silhouette ${silhouette(piece)} mt-6`} />
            <h3 className="wt-serif mt-6 text-3xl">{piece.name}</h3>
            <p className="mt-2 text-sm opacity-70">
              {piece.layer} · warmth {piece.warmth} · rain {piece.water_resistance}
            </p>
            <button
              type="button"
              className="wt-pack mt-5"
              onClick={() =>
                setPacked((prev) => (prev.includes(piece.id) ? prev.filter((id) => id !== piece.id) : [...prev, piece.id]))
              }
            >
              {on ? "Packed" : "Add"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
