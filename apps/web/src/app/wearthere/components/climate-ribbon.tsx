import type { MonthClimate } from "@penta/wearthere";

export function ClimateRibbon({ weather }: { weather: MonthClimate }) {
  return (
    <section className="wt-ribbon" id="weather" aria-labelledby="wt-climate-summary">
      <div className="wt-ribbon-title">
        <p className="wt-kicker" id="wt-climate-summary">Typical climate</p>
        <p className="wt-ribbon-disclaimer">Monthly normal · not a live forecast</p>
      </div>
      <dl className="wt-ribbon-grid">
        <div className="wt-ribbon-primary">
          <dt>Temperature</dt>
          <dd>{weather.tmin_c}–{weather.tmax_c}<span>°C</span></dd>
          <div className="wt-temperature-line" aria-hidden="true">
            <i style={{ width: `${Math.min(100, Math.max(20, (weather.tmax_c - weather.tmin_c) * 5))}%` }} />
          </div>
        </div>
        <div>
          <dt>Rain</dt>
          <dd>{weather.rain_days}<span>days</span></dd>
          <small>{weather.rain_mm} mm total</small>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{weather.wind_kmh}<span>km/h</span></dd>
          <small>Typical monthly level</small>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{weather.humidity}<span>%</span></dd>
          <small>Typical monthly level</small>
        </div>
      </dl>
    </section>
  );
}
