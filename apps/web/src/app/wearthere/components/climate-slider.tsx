"use client";

import { capsuleFor, type Destination } from "@penta/wearthere";
import { useMemo, useState } from "react";
import { WardrobeBoard } from "./wardrobe-board";

export function ClimateSlider({ dest }: { dest: Destination }) {
  const mid = dest.climate[0] ? Math.round((dest.climate[0].tmin_c + dest.climate[0].tmax_c) / 2) : 12;
  const [temp, setTemp] = useState(mid);
  const month = useMemo(() => {
    return dest.climate.reduce((best, row) => {
      const avg = (row.tmin_c + row.tmax_c) / 2;
      const bestAvg = (best.tmin_c + best.tmax_c) / 2;
      return Math.abs(avg - temp) < Math.abs(bestAvg - temp) ? row : best;
    }, dest.climate[0]);
  }, [dest, temp]);
  const capsule = useMemo(() => capsuleFor(dest, month.month, "classic"), [dest, month.month]);
  return (
    <section className="wt-scene">
      <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">Climate → wardrobe</p>
      <label className="mt-6 grid max-w-md gap-2 text-xs uppercase tracking-[0.18em]">
        Typical temperature {temp}°C
        <input
          type="range"
          min={-8}
          max={34}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
        />
      </label>
      <p className="mt-3 text-sm opacity-80">
        Closest compiled month: {month.month} · {month.tmin_c}–{month.tmax_c}°C · {month.rain_days} rain days
      </p>
      <div className="mt-8">
        <WardrobeBoard pieces={capsule.pieces} />
      </div>
    </section>
  );
}
