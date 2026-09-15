"use client";

import { AIRLINES, DESTINATIONS, airlineFit, capsuleFor, fetchForecast, weatherSourceLabel, type StyleId } from "@penta/wearthere";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Feedback } from "@/components/feedback";
import { ClimateRibbon } from "./components/climate-ribbon";
import { DestinationHero } from "./components/destination-hero";
import { WardrobeBoard } from "./components/wardrobe-board";
import { useClimateMood } from "./components/climate-context";
import { climateMood } from "./components/climate-theme";

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
  const { setMood } = useClimateMood();

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

  useEffect(() => {
    if (capsule) setMood(climateMood(capsule.weather));
  }, [capsule, setMood]);

  if (!dest || !capsule) return <p className="wt-scene">Unknown destination in this batch.</p>;
  const air = airlineFit(capsule.volume_l, capsule.weight_kg, AIRLINES[0]);

  return (
    <div>
      <DestinationHero initialCity={dest.slug} />
      <ClimateRibbon weather={capsule.weather} />
      <section className="wt-scene">
        <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">Private trip · noindex · {source.label}</p>
        <h1 className="wt-serif mt-4 text-6xl">{dest.city}</h1>
        <p className="mt-2 text-xl">
          {start} – {end}
        </p>
        {forecast ? <p className="mt-3 text-sm">{forecast}</p> : null}
        <p className="mt-6 text-sm opacity-80">
          {capsule.pieces.length} pieces · {capsule.outfits} outfits · {capsule.weight_kg} kg · {capsule.volume_l} L
        </p>
      </section>
      <WardrobeBoard pieces={capsule.pieces} />
      <section className="wt-scene">
        {capsule.remove_hint ? <p>{capsule.remove_hint}</p> : null}
        {capsule.missing.map((m) => (
          <p key={m} className="mt-3">
            {m} Affiliation is offered only after this gap.
          </p>
        ))}
        <p className="mt-6 text-sm">{air.message}</p>
        <h2 className="wt-serif mt-12 text-4xl">Scan my wardrobe</h2>
        <p className="mt-2 text-sm leading-6 opacity-80">Photograph a garment. Confirm category, colour, warmth. Nothing is added silently.</p>
        <input type="file" accept="image/*" className="mt-3 block text-sm" />
        <div className="mt-10">
          <Feedback site="wearthere" />
        </div>
      </section>
    </div>
  );
}
