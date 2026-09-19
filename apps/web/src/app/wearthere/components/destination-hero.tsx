"use client";

import { DESTINATIONS, capsuleFor, typicalWeather, type StyleId } from "@penta/wearthere";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { destinationSeasonMedia } from "@/lib/media-catalog";
import { GarmentSvg, garmentKind } from "./garment-svg";
import { useClimateMood } from "./climate-context";
import { climateCopy, climateMood } from "./climate-theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STYLES: StyleId[] = ["minimal", "streetwear", "classic", "business", "outdoor", "luxury", "casual"];

function monthLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
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
  const [edit, setEdit] = useState<"city" | "dates" | "style" | null>(null);
  const dest = DESTINATIONS.find((d) => d.slug === city) ?? DESTINATIONS[0];
  const month = Number(start.slice(5, 7)) || 11;
  const weather = useMemo(() => typicalWeather(dest, month), [dest, month]);
  const mood = climateMood(weather, dest.slug);
  const media = destinationSeasonMedia(dest.slug, month);
  const capsule = useMemo(() => capsuleFor(dest, month, style), [dest, month, style]);
  const { setMood, view, setPlace } = useClimateMood();

  useEffect(() => {
    setMood(mood);
  }, [mood, setMood]);

  useEffect(() => {
    setPlace({ city: dest.city, country: dest.country, slug: dest.slug, month: MONTHS[month - 1] });
  }, [dest.city, dest.country, dest.slug, month, setPlace]);

  const look = capsule.pieces.filter((p) => {
    const kind = garmentKind(p);
    return kind === "coat" || kind === "knit" || kind === "trousers" || kind === "boots";
  }).slice(0, 4);

  function setMonth(nextMonth: number) {
    const padded = String(nextMonth).padStart(2, "0");
    const year = start.slice(0, 4) || "2026";
    setStart(`${year}-${padded}-12`);
    setEnd(`${year}-${padded}-18`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(`/wearthere/trip?city=${city}&start=${start}&end=${end}&style=${style}`);
  }

  return (
    <section className="wt-stage" data-climate={mood} data-view={view}>
      <div className="wt-stage-photo" data-season={media.hero}>
        <Image
          key={media.hero}
          src={media.hero}
          alt={media.heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover wt-stage-img"
        />
        <div className="wt-stage-veil" aria-hidden />
      </div>

      <div className="wt-stage-body">
        <div className="wt-stage-copy">
          <p className="wt-kicker">{dest.country}</p>
          <h1 className="wt-city">{dest.city}</h1>
          <p className="wt-city-deck">{climateCopy(mood)}</p>
        </div>

        {view === "climate" ? (
          <dl className="wt-stage-climate" aria-live="polite">
            <div>
              <dt>Typical range</dt>
              <dd>{weather.tmin_c}–{weather.tmax_c}<small>°C</small></dd>
            </div>
            <div>
              <dt>Rain</dt>
              <dd>{weather.rain_days}<small>days</small></dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{weather.humidity}<small>%</small></dd>
            </div>
          </dl>
        ) : (
          <ul className="wt-stage-pack" aria-live="polite">
            {look.map((piece, index) => (
              <li key={piece.id} className={`is-${garmentKind(piece)} ${index === 0 ? "is-hero" : ""}`}>
                <GarmentSvg kind={garmentKind(piece)} />
                <span>{piece.name}</span>
              </li>
            ))}
          </ul>
        )}

        <ol className="wt-month-rail" aria-label={`${dest.city} months`}>
          {MONTHS.map((label, index) => {
            const value = index + 1;
            return (
              <li key={label}>
                <button type="button" aria-pressed={month === value} onClick={() => setMonth(value)}>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        <form id="plan" onSubmit={onSubmit} className="wt-inline-plan">
          <div className="wt-inline-values">
            <button type="button" aria-expanded={edit === "city"} onClick={() => setEdit(edit === "city" ? null : "city")}>
              <span>Where</span>
              <strong>{dest.city}</strong>
            </button>
            <button type="button" aria-expanded={edit === "dates"} onClick={() => setEdit(edit === "dates" ? null : "dates")}>
              <span>When</span>
              <strong>{monthLabel(start)} — {monthLabel(end)}</strong>
            </button>
            <button type="button" aria-expanded={edit === "style"} onClick={() => setEdit(edit === "style" ? null : "style")}>
              <span>How</span>
              <strong>{style}</strong>
            </button>
          </div>
          {edit === "city" ? (
            <label className="wt-inline-control">
              Destination
              <select aria-label="Destination city" value={city} onChange={(e) => setCity(e.target.value)}>
                {DESTINATIONS.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.city}</option>
                ))}
              </select>
            </label>
          ) : null}
          {edit === "dates" ? (
            <div className="wt-inline-dates">
              <label>
                From
                <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </label>
              <label>
                To
                <input required type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
              </label>
            </div>
          ) : null}
          {edit === "style" ? (
            <label className="wt-inline-control">
              Style
              <select aria-label="Packing style" value={style} onChange={(e) => setStyle(e.target.value as StyleId)}>
                {STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          ) : null}
          <button className="wt-cta" type="submit">Build capsule</button>
          <p className="wt-inline-note">Typical monthly climate, not a live forecast.</p>
        </form>
      </div>
    </section>
  );
}
