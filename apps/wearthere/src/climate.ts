export type MonthClimate = {
  month: number;
  tmin_c: number;
  tmax_c: number;
  rain_days: number;
  rain_mm: number;
  humidity: number;
  wind_kmh: number;
  uv: number;
};

export function climate(
  month: number,
  tmin: number,
  tmax: number,
  rain_days: number,
  rain_mm: number,
  humidity = 70,
  wind_kmh = 14,
  uv = 4,
): MonthClimate {
  return { month, tmin_c: tmin, tmax_c: tmax, rain_days, rain_mm, humidity, wind_kmh, uv };
}
