"use client";

import { AIRLINES, DESTINATIONS, airlineFit, capsuleFor, fetchForecast, weatherSourceLabel, type StyleId } from "@penta/wearthere";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";

export function TripApp() {
  const params = useSearchParams();
  const city = params.get("city") ?? "paris";
  const start = params.get("start") ?? "2026-10-12";
  const end = params.get("end") ?? "2026-10-17";
  const style = (params.get("style") ?? "classic") as StyleId;
  const dest = DESTINATIONS.find((d) => d.slug === city);
  const month = Number(start.slice(5, 7));
  const [now] = useState(() => Date.now());
  const daysAhead = Math.round((new Date(start).getTime() - now) / 86400000);
  const [forecast, setForecast] = useState<string | null>(null);

  const capsule = useMemo(() => (dest ? capsuleFor(dest, month, style) : null), [dest, month, style]);
  const source = weatherSourceLabel({ hasForecast: Boolean(forecast), daysAhead });

  useEffect(() => {
    if (!dest) return;
    if (daysAhead > 14 || daysAhead < 0) return;
    fetchForecast(dest.lat, dest.lon, start, end).then((data) => {
      if (!data?.daily) return;
      const max = data.daily.temperature_2m_max;
      const min = data.daily.temperature_2m_min;
      setForecast(`${Math.min(...min)}–${Math.max(...max)}°C forecast for your dates`);
    });
  }, [dest, start, end, daysAhead]);

  if (!dest || !capsule) return <p>Unknown destination in this batch.</p>;
  const air = airlineFit(capsule.volume_l, capsule.weight_kg, AIRLINES[0]);

  return (
    <div>
      <p className="text-sm tracking-[0.16em] uppercase text-[#8a4b32]">Private trip · noindex</p>
      <h1 className="mt-3 text-6xl">{dest.city}</h1>
      <p className="mt-2 text-xl">
        {start} – {end}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="wt-card p-5 md:col-span-2">
          <p className="text-sm">{source.label}</p>
          <p className="mt-3 font-[family-name:var(--font-wt-serif)] text-5xl">
            {capsule.weather.tmin_c}–{capsule.weather.tmax_c}°C
          </p>
          <p className="mt-2">
            Rain likely? {capsule.weather.rain_days >= 8 ? "Typical month is wet." : "Typical month is drier."}
          </p>
          {forecast ? <p className="mt-3 text-sm">{forecast}</p> : null}
        </article>
        <article className="wt-card p-5">
          <p className="font-[family-name:var(--font-wt-serif)] text-4xl">{capsule.pieces.length} pieces</p>
          <p className="mt-2">{capsule.outfits} outfits</p>
          <p>{capsule.weight_kg} kg · {capsule.volume_l} L</p>
        </article>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capsule.pieces.map((p) => (
          <li key={p.id} className="wt-card p-4">
            <p className="font-[family-name:var(--font-wt-serif)] text-2xl">{p.name}</p>
            <p className="text-sm">
              {p.category} · warmth {p.warmth}
            </p>
          </li>
        ))}
      </ul>
      {capsule.remove_hint ? <p className="mt-6">{capsule.remove_hint}</p> : null}
      {capsule.missing.map((m) => (
        <p key={m} className="mt-3">
          {m} Affiliation is offered only after this gap.
        </p>
      ))}
      <p className="mt-6 text-sm">{air.message}</p>
      <section className="mt-10 wt-card p-5">
        <h2 className="text-3xl">Scan my wardrobe</h2>
        <p className="mt-2 text-sm leading-6">Photograph a garment. Confirm category, colour, warmth. Nothing is added silently.</p>
        <input type="file" accept="image/*" className="mt-3 block text-sm" />
      </section>
      <div className="mt-10">
        <Feedback site="wearthere" />
      </div>
    </div>
  );
}
