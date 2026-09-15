import type { MonthClimate } from "@penta/wearthere";

export function ClimateRibbon({ weather }: { weather: MonthClimate }) {
  return (
    <div className="wt-ribbon" id="weather">
      <article>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Temperature</p>
        <p className="wt-serif mt-2 text-3xl">
          {weather.tmin_c}–{weather.tmax_c}°
        </p>
      </article>
      <article>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Rain</p>
        <p className="wt-serif mt-2 text-3xl">{weather.rain_days}d</p>
        <p className="mt-1 text-sm opacity-70">{weather.rain_mm} mm</p>
      </article>
      <article>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Wind</p>
        <p className="wt-serif mt-2 text-3xl">{weather.wind_kmh}</p>
        <p className="mt-1 text-sm opacity-70">km/h typical</p>
      </article>
      <article>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Humidity</p>
        <p className="wt-serif mt-2 text-3xl">{weather.humidity}%</p>
      </article>
    </div>
  );
}
