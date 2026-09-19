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
        <p className="wt-kicker">Packed</p>
        <p className="wt-serif mt-2 text-4xl" data-packed-count={count}>
          {String(count).padStart(2, "0")} / {String(visible.length).padStart(2, "0")}
        </p>
        <p className="mt-2 text-sm opacity-70">Pack or unpack a piece. The look rebuilds.</p>
      </div>

      <div className={`wt-figure${count === 0 ? " is-empty" : ""}`}>
        {count === 0 ? (
          <div className="wt-look-empty">
            <h3 className="wt-serif text-4xl">Nothing packed yet.</h3>
            <p className="mt-2 text-sm opacity-70">Add pieces to rebuild the look.</p>
          </div>
        ) : (
          <>
            <div
              className="wt-figure-stack"
              data-look-ids={worn.map((p) => p.id).join(",")}
              aria-live="polite"
              aria-label={worn.map((p) => p.name).join(", ") || "Packed look"}
            >
              {worn.map((piece) => (
                <figure key={piece.id} className={`wt-figure-item is-${garmentKind(piece)}`}>
                  <GarmentSvg kind={garmentKind(piece)} />
                  <figcaption>
                    <strong>{piece.name}</strong>
                    <span>{recommendationReason(piece, weather, activities)}</span>
                    <button type="button" className="wt-pack" onClick={() => toggle(piece.id)}>
                      {packLabel(!unpacked.includes(piece.id))}
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="wt-figure-lead wt-serif">{hero?.name ?? "Capsule"}</p>
          </>
        )}
      </div>

      <ul className="wt-loose">
        {secondary.map((piece) => {
          const on = !unpacked.includes(piece.id);
          return (
            <li key={piece.id} className={`wt-loose-item ${on ? "is-packed" : "is-open"}`}>
              <GarmentSvg kind={garmentKind(piece)} />
              <div>
                <h3>{piece.name}</h3>
                <p>{recommendationReason(piece, weather, activities)}</p>
                <button type="button" className="wt-pack" onClick={() => toggle(piece.id)}>
                  {packLabel(on)}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
