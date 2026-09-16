"use client";

import { DESTINATIONS, capsuleFor, typicalWeather, type StyleId } from "@penta/wearthere";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CursorCanvas } from "@/components/creative";
import { destinationMedia } from "@/lib/media-catalog";
import { useClimateMood } from "./climate-context";
import { climateCopy, climateMood } from "./climate-theme";

function monthLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

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
  const media = destinationMedia(dest.slug);
  const capsule = useMemo(() => capsuleFor(dest, month, style), [dest, month, style]);
  const { setMood } = useClimateMood();
  useEffect(() => {
    setMood(mood);
  }, [mood, setMood]);

  const essential = capsule.pieces
    .filter((p) => p.layer === "shell" || p.layer === "mid" || p.layer === "shoes" || /coat|knit|rain|boot|sneaker/i.test(p.name))
    .slice(0, 3)
    .map((p) => p.name)
    .join(" + ");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/wearthere/trip?city=${city}&start=${start}&end=${end}&style=${style}`);
  }

  return (
    <section className="wt-hero" data-climate={mood}>
      <div className="wt-hero-grid">
        <div className="wt-hero-type">
          <p className="text-[11px] uppercase tracking-[0.28em]">
            {monthLabel(start)}–{monthLabel(end)}
          </p>
          <h1 className="wt-city">{dest.city}</h1>
          <div className="wt-climate-read">
            <p className="wt-serif text-3xl leading-none md:text-4xl">
              {weather.tmin_c}–{weather.tmax_c}°C
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.16em] opacity-80">
              {weather.rain_days >= 8 ? "Rain likely" : `${weather.rain_days} rain days`}
              {" · "}
              {weather.humidity}% humidity
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 opacity-80">{climateCopy(mood)}</p>
          </div>
        </div>
        <div className="wt-answer">
          <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">Wear this</p>
          <p className="wt-serif mt-2 text-2xl leading-tight md:text-3xl">{essential || capsule.pieces[0]?.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] opacity-70">Typical climate → packing decision</p>
        </div>
        <CursorCanvas label="Explore" color="#f4eadf" className="wt-hero-frame">
          <div className="wt-photo" data-climate={mood} key={media.hero}>
            <Image
              src={media.hero}
              alt={media.heroAlt}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="wt-weather-veil" aria-hidden />
          </div>
          <p className="wt-photo-meta">
            {weather.tmin_c}–{weather.tmax_c}° · {weather.rain_days} rain days · {weather.humidity}%
          </p>
        </CursorCanvas>
        <form id="plan" onSubmit={onSubmit} className="wt-planner">
          <label>
            Destination
            <select aria-label="Destination city" value={city} onChange={(e) => setCity(e.target.value)}>
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
            <select aria-label="Packing style" value={style} onChange={(e) => setStyle(e.target.value as StyleId)}>
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
