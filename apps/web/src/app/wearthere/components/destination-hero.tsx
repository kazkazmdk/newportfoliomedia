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
  initialStart = "2026-11-12",
  initialEnd = "2026-11-18",
  initialStyle = "classic",
}: {
  initialCity?: string;
  initialStart?: string;
  initialEnd?: string;
  initialStyle?: StyleId;
}) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [style, setStyle] = useState<StyleId>(initialStyle);
  const [view, setView] = useState<"climate" | "capsule">("climate");
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
          <p className="wt-kicker">{dest.country} · destination guide</p>
          <h1 className="wt-city">{dest.city}</h1>
          <p className="wt-city-deck">{climateCopy(mood)}</p>
          <div className="wt-view-switch" role="group" aria-label="Guide view">
            <button
              type="button"
              id="wt-tab-climate"
              aria-controls="wt-panel-climate"
              aria-pressed={view === "climate"}
              onClick={() => setView("climate")}
            >
              Climate
            </button>
            <button
              type="button"
              id="wt-tab-capsule"
              aria-controls="wt-panel-capsule"
              aria-pressed={view === "capsule"}
              onClick={() => setView("capsule")}
            >
              Capsule
            </button>
          </div>
          <div
            className="wt-hero-facts"
            id="wt-panel-climate"
            role="region"
            aria-labelledby="wt-tab-climate"
            hidden={view !== "climate"}
          >
            <div>
              <span>Typical range</span>
              <strong>{weather.tmin_c}–{weather.tmax_c}°C</strong>
            </div>
            <div>
              <span>Rain pattern</span>
              <strong>{weather.rain_days} days · {weather.rain_mm} mm</strong>
            </div>
            <div>
              <span>Humidity</span>
              <strong>{weather.humidity}%</strong>
            </div>
          </div>
          <div
            className="wt-hero-facts"
            id="wt-panel-capsule"
            role="region"
            aria-labelledby="wt-tab-capsule"
            hidden={view !== "capsule"}
          >
            <div>
              <span>Recommended</span>
              <strong>{capsule.pieces.length} pieces</strong>
            </div>
            <div>
              <span>Combinations</span>
              <strong>{capsule.outfits} outfits</strong>
            </div>
            <div>
              <span>Core layers</span>
              <strong>{essential || capsule.pieces[0]?.name}</strong>
            </div>
          </div>
          <p className="wt-normal-note">
            <span aria-hidden="true">○</span>
            Typical monthly climate, not a live forecast
          </p>
        </div>
        <div className="wt-answer">
          <p className="wt-kicker">The packing edit</p>
          <p className="wt-serif mt-3 text-2xl leading-tight md:text-3xl">{essential || capsule.pieces[0]?.name}</p>
          <p className="mt-3 text-sm leading-6 opacity-75">
            Selected for this month&apos;s temperature range, rain pattern and your {style} style.
          </p>
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
            <div className="wt-photo-caption">
              <span>{dest.city}</span>
              <span>Typical {new Date(`${start}T12:00:00`).toLocaleDateString("en-GB", { month: "long" })}</span>
            </div>
          </div>
        </CursorCanvas>
        <form id="plan" onSubmit={onSubmit} className="wt-planner">
          <div className="wt-planner-intro">
            <div>
              <p className="wt-kicker">Build your edit</p>
              <h2 className="wt-serif mt-2 text-3xl">Where, when, how?</h2>
            </div>
            <p>
              Planning dates: {monthLabel(start)}–{monthLabel(end)}
            </p>
          </div>
          <div className="wt-planner-row">
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
            <label>
              Style
              <select aria-label="Packing style" value={style} onChange={(e) => setStyle(e.target.value as StyleId)}>
                {["minimal", "streetwear", "classic", "business", "outdoor", "luxury", "casual"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="wt-dates">
            <label>
              From
              <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              To
              <input required type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>
          <div className="wt-planner-action">
            <button className="wt-cta" type="submit">
              Build my capsule
            </button>
            <span>This preview uses typical climate. No live forecast is loaded.</span>
          </div>
        </form>
      </div>
    </section>
  );
}
