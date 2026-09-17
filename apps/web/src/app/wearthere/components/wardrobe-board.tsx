"use client";

import { useState } from "react";
import type { ClothingPiece, MonthClimate } from "@penta/wearthere";
import { GarmentSvg, garmentKind } from "./garment-svg";

const LOOK_KINDS = ["coat", "knit", "trousers", "boots"] as const;

function packLabel(on: boolean) {
  return on ? "Remove from case" : "Add to case";
}

function recommendationReason(
  piece: ClothingPiece,
  weather?: MonthClimate,
  activities: string[] = [],
) {
  if (weather && piece.water_resistance >= 4 && weather.rain_days >= 8) {
    return `Rain layer: this period typically has ${weather.rain_days} rain days.`;
  }
  if (weather && piece.warmth >= 5 && weather.tmin_c < 10) {
    return `Cold-weather anchor: typical lows reach ${weather.tmin_c}°C.`;
  }
  if (weather && piece.breathability >= 4 && weather.tmax_c >= 24) {
    return `Breathable option for typical highs around ${weather.tmax_c}°C.`;
  }
  if (weather && piece.layer === "shoes" && weather.rain_days >= 8) {
    return `Footwear chosen for a typically wetter period.`;
  }
  const covered = activities.filter((activity) => piece.activity.includes(activity));
  if (covered.length > 0) {
    return `Included for ${covered.slice(0, 2).join(" and ")}.`;
  }
  if (piece.layer === "mid" || piece.layer === "shell") {
    return "A flexible layer for temperature changes through the day.";
  }
  return "A versatile base for more than one outfit combination.";
}

export function WardrobeBoard({
  pieces,
  weather,
  activities = [],
}: {
  pieces: ClothingPiece[];
  weather?: MonthClimate;
  activities?: string[];
}) {
  const [unpacked, setUnpacked] = useState<string[]>([]);
  const visible = pieces;
  const packedPieces = visible.filter((piece) => !unpacked.includes(piece.id));
  const count = packedPieces.length;
  const hero =
    packedPieces.find((p) => garmentKind(p) === "coat") ??
    packedPieces.find((p) => garmentKind(p) === "knit") ??
    packedPieces[0];
  const worn = LOOK_KINDS.map((kind) => packedPieces.find((p) => garmentKind(p) === kind)).filter(
    (p): p is ClothingPiece => Boolean(p),
  );
  const secondary = visible.filter((p) => !worn.some((w) => w.id === p.id));

  function toggle(id: string) {
    setUnpacked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="wt-lookbook">
      <div className="wt-suitcase" aria-live="polite">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Packed</p>
        <p className="wt-serif mt-2 text-4xl" data-packed-count={count}>
          {String(count).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
        </p>
        <p className="mt-2 text-sm opacity-70">Pack or unpack a piece. The look updates.</p>
      </div>
      <div className="wt-look">
        <article className={`wt-look-hero${count === 0 ? " is-empty" : ""}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">The look</p>
          {count === 0 ? (
            <div className="wt-look-empty">
              <h3 className="wt-serif mt-6 text-4xl">Nothing packed yet.</h3>
              <p className="mt-2 text-sm opacity-70">Add pieces to rebuild the look.</p>
            </div>
          ) : (
            <>
              <div
                className="wt-look-stack"
                data-look-ids={worn.map((p) => p.id).join(",")}
                aria-live="polite"
                aria-label={worn.map((p) => p.name).join(", ") || "Packed look"}
              >
                {worn.map((piece) => (
                  <GarmentSvg key={piece.id} kind={garmentKind(piece)} />
                ))}
              </div>
              <h3 className="wt-serif mt-4 text-4xl">{hero?.name ?? "Capsule"}</h3>
              <p className="mt-2 text-sm opacity-70">
                {worn.map((p) => p.name).join(" · ") || hero?.name}
              </p>
              {hero ? (
                <button type="button" className="wt-pack mt-5" onClick={() => toggle(hero.id)}>
                  {packLabel(!unpacked.includes(hero.id))}
                </button>
              ) : null}
            </>
          )}
        </article>
        <div className="grid gap-3">
          {secondary.slice(0, 4).map((piece) => {
            const on = !unpacked.includes(piece.id);
            return (
              <article key={piece.id} className={`wt-garment ${on ? "is-packed" : "is-open"}`}>
                <GarmentSvg kind={garmentKind(piece)} />
                <h3 className="wt-serif mt-3 text-2xl">{piece.name}</h3>
                <p className="wt-garment-meta">
                  {piece.layer} · warmth {piece.warmth}
                </p>
                <p className="wt-garment-reason">{recommendationReason(piece, weather, activities)}</p>
                <button type="button" className="wt-pack mt-3" onClick={() => toggle(piece.id)}>
                  {packLabel(on)}
                </button>
              </article>
            );
          })}
        </div>
      </div>
      <div className="wt-board">
        {visible.map((piece, i) => {
          const on = !unpacked.includes(piece.id);
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
              <p className="wt-garment-meta">
                {piece.layer} · warmth {piece.warmth} · rain {piece.water_resistance}
              </p>
              <p className="wt-garment-reason">{recommendationReason(piece, weather, activities)}</p>
              <button type="button" className="wt-pack mt-5" onClick={() => toggle(piece.id)}>
                {packLabel(on)}
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
          if (id) setUnpacked((prev) => prev.filter((pieceId) => pieceId !== id));
        }}
      >
        Suitcase zone — buttons also pack and unpack
      </div>
    </div>
  );
}
