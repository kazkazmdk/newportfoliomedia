"use client";

import { useMemo, useState } from "react";
import type { ClothingPiece } from "@penta/wearthere";
import { GarmentSvg, garmentKind } from "./garment-svg";

export function WardrobeBoard({ pieces }: { pieces: ClothingPiece[] }) {
  const [packed, setPacked] = useState<string[]>(() => pieces.map((p) => p.id));
  const visible = useMemo(() => pieces, [pieces]);
  const count = packed.length;
  const hero = visible.find((p) => garmentKind(p) === "coat") ?? visible[0];
  const worn = visible.filter((p) => ["coat", "knit", "trousers", "boots"].includes(garmentKind(p))).slice(0, 4);
  const secondary = visible.filter((p) => !worn.some((w) => w.id === p.id));

  function toggle(id: string) {
    setPacked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="wt-lookbook">
      <div className="wt-suitcase" aria-live="polite">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Packed</p>
        <p className="wt-serif mt-2 text-4xl">
          {String(count).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
        </p>
        <p className="mt-2 text-sm opacity-70">Pack or unpack a piece. The look updates.</p>
      </div>
      <div className="wt-look">
        <article className="wt-look-hero">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">The look</p>
          <div className="wt-look-stack" aria-hidden>
            {worn.map((piece) => (
              <GarmentSvg key={piece.id} kind={garmentKind(piece)} />
            ))}
          </div>
          <h3 className="wt-serif mt-4 text-4xl">{hero?.name ?? "Capsule"}</h3>
          <p className="mt-2 text-sm opacity-70">
            {worn.map((p) => p.name).join(" · ")}
          </p>
          {hero ? (
            <button type="button" className="wt-pack mt-5" onClick={() => toggle(hero.id)}>
              {packed.includes(hero.id) ? "Packed" : "Add to case"}
            </button>
          ) : null}
        </article>
        <div className="grid gap-3">
          {secondary.slice(0, 4).map((piece) => {
            const on = packed.includes(piece.id);
            return (
              <article key={piece.id} className={`wt-garment ${on ? "is-packed" : "is-open"}`}>
                <GarmentSvg kind={garmentKind(piece)} />
                <h3 className="wt-serif mt-3 text-2xl">{piece.name}</h3>
                <p className="mt-1 text-sm opacity-70">
                  {piece.layer} · warmth {piece.warmth}
                </p>
                <button type="button" className="wt-pack mt-3" onClick={() => toggle(piece.id)}>
                  {on ? "Packed" : "Unpack / add"}
                </button>
              </article>
            );
          })}
        </div>
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
              <button type="button" className="wt-pack mt-5" onClick={() => toggle(piece.id)}>
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
