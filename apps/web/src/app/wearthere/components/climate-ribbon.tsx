import type { MonthClimate } from "@penta/wearthere";

export function ClimateRibbon({ weather }: { weather: MonthClimate }) {
  const min = weather.tmin_c;
  const max = weather.tmax_c;
  const span = Math.max(max - min, 1);
  const rain = Math.min(100, weather.rain_days * 8);
  const wind = Math.min(100, weather.wind_kmh * 3);
  const hum = Math.min(100, weather.humidity);
  return (
    <div className="wt-ribbon" id="weather">
      <svg viewBox="0 0 920 120" className="wt-band" role="img" aria-label={`Typical range ${min} to ${max} degrees, ${weather.rain_days} rain days, wind ${weather.wind_kmh} km/h, humidity ${weather.humidity} percent`}>
        <text x="8" y="28" className="wt-band-label">
          {min}°
        </text>
        <text x="860" y="28" className="wt-band-label">
          {max}°
        </text>
        <line x1="48" y1="22" x2="840" y2="22" stroke="currentColor" strokeWidth="1.2" />
        <path
          d={`M 180 22 L ${180 + span * 18} 8 L ${220 + span * 18} 36 Z`}
          fill="currentColor"
          opacity="0.45"
        />
        <text x="8" y="58" className="wt-band-label">
          rain
        </text>
        <rect x="72" y="48" width={rain * 7.4} height="10" fill="currentColor" />
        <text x="8" y="84" className="wt-band-label">
          wind
        </text>
        <path d={`M72 80 H${72 + wind * 7.4}`} stroke="currentColor" strokeWidth="2" markerEnd="url(#wt-arrow)" />
        <text x="8" y="110" className="wt-band-label">
          humidity
        </text>
        <line x1="72" y1="106" x2={72 + hum * 7.4} y2="106" stroke="currentColor" strokeWidth="3" />
        <defs>
          <marker id="wt-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L8 3 L0 6 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
      <p className="wt-ribbon-note">
        {weather.rain_mm} mm · {weather.rain_days} rain days · {weather.wind_kmh} km/h · {weather.humidity}%
      </p>
    </div>
  );
}
