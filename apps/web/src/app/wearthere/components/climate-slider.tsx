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
    <section className="wt-scene wt-climate-tool">
      <div>
        <p className="wt-kicker">Climate → wardrobe</p>
        <h2 className="wt-serif mt-4 max-w-xl text-5xl leading-none">See how a typical temperature changes the edit.</h2>
        <p className="mt-5 max-w-lg text-sm leading-6 opacity-75">
          This explores compiled monthly normals for {dest.city}. It does not simulate or predict live weather.
        </p>
      </div>
      <div className="wt-slider-control">
      <label className="grid gap-3 text-xs uppercase tracking-[0.18em]">
        Typical temperature <strong className="wt-serif text-5xl normal-case tracking-normal">{temp}°C</strong>
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
      </div>
      <div className="wt-slider-result">
        <WardrobeBoard pieces={capsule.pieces} weather={month} activities={dest.activities_default} />
      </div>
    </section>
  );
}
