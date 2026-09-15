"use client";

import { useMemo, useState } from "react";
import type { ClothingPiece } from "@penta/wearthere";
import { GarmentSvg, garmentKind } from "./garment-svg";

export function WardrobeBoard({ pieces }: { pieces: ClothingPiece[] }) {
  const [packed, setPacked] = useState<string[]>(() => pieces.map((p) => p.id));
  const visible = useMemo(() => pieces, [pieces]);
  const count = packed.length;

  return (
    <div className="wt-lookbook">
      <div className="wt-suitcase" aria-live="polite">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Packed</p>
        <p className="wt-serif mt-2 text-4xl">
          {String(count).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
        </p>
        <p className="mt-2 text-sm opacity-70">Click or drop a piece into the case.</p>
      </div>
      <div className="wt-board">
        {visible.map((piece, i) => {
          const on = packed.includes(piece.id);
          return (
            <article
              key={piece.id}
              className={`wt-garment kind-${garmentKind(piece)} ${on ? "is-packed" : "is-open"}`}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", piece.id)}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{String(i + 1).padStart(2, "0")}</p>
              <GarmentSvg kind={garmentKind(piece)} />
              <h3 className="wt-serif mt-4 text-3xl">{piece.name}</h3>
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
                {on ? "Packed" : "Add to case"}
              </button>
            </article>
          );
        })}
      </div>
      <div
        className="wt-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const id = event.dataTransfer.getData("text/plain");
          if (id) setPacked((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }}
      >
        Suitcase zone
      </div>
    </div>
  );
}
