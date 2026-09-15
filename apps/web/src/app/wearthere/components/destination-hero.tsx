"use client";

import { DESTINATIONS, typicalWeather, type StyleId } from "@penta/wearthere";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { NoiseTexture } from "@/components/creative";
import { useClimateMood } from "./climate-context";
import { climateCopy, climateMood } from "./climate-theme";

export function DestinationHero({
  initialCity = "tokyo",
}: {
  initialCity?: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [start, setStart] = useState("2026-11-12");
  const [end, setEnd] = useState("2026-11-18");
  const [style, setStyle] = useState<StyleId>("classic");
  const dest = DESTINATIONS.find((d) => d.slug === city) ?? DESTINATIONS[0];
  const month = Number(start.slice(5, 7)) || 11;
  const weather = useMemo(() => typicalWeather(dest, month), [dest, month]);
  const mood = climateMood(weather, dest.slug);
  const { setMood } = useClimateMood();
  useEffect(() => {
    setMood(mood);
  }, [mood, setMood]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/wearthere/trip?city=${city}&start=${start}&end=${end}&style=${style}`);
  }

  return (
    <section className="wt-hero" data-climate={mood}>
      <div className="wt-atmosphere" />
      <NoiseTexture className="opacity-[0.18] mix-blend-soft-light" />
      <div className="wt-hero-inner">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em]">
            {dest.city} · {start.slice(5)} — {end.slice(5)}
          </p>
          <h1 className="wt-city mt-4">{dest.city}</h1>
          <p className="wt-serif mt-6 max-w-md text-4xl leading-none">What will it feel like?</p>
          <p className="mt-5 max-w-sm text-sm leading-7 opacity-80">{climateCopy(mood)}</p>
        </div>
        <form id="plan" onSubmit={onSubmit} className="wt-planner">
          <label>
            Destination
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {DESTINATIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.city}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label>
              From
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <label>
            Style
            <select value={style} onChange={(e) => setStyle(e.target.value as StyleId)}>
              {["minimal", "streetwear", "classic", "business", "outdoor", "luxury", "casual"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button className="wt-cta w-fit" type="submit">
            Plan this trip
          </button>
        </form>
      </div>
    </section>
  );
}
