import { allCityCoordinates, cityCoordinates } from "@penta/tripcost";

export type GeoPoint = { lat: number; lon: number };

const MANUAL: Record<string, GeoPoint> = {
  paris: { lat: 48.8566, lon: 2.3522 },
  lyon: { lat: 45.764, lon: 4.8357 },
  barcelona: { lat: 41.3851, lon: 2.1734 },
  london: { lat: 51.5074, lon: -0.1278 },
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  berlin: { lat: 52.52, lon: 13.405 },
  munich: { lat: 48.1351, lon: 11.582 },
  milan: { lat: 45.4642, lon: 9.19 },
  brussels: { lat: 50.8503, lon: 4.3517 },
  rome: { lat: 41.9028, lon: 12.4964 },
  madrid: { lat: 40.4168, lon: -3.7038 },
  frankfurt: { lat: 50.1109, lon: 8.6821 },
  zurich: { lat: 47.3769, lon: 8.5417 },
  marseille: { lat: 43.2965, lon: 5.3698 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  hamburg: { lat: 53.5511, lon: 9.9937 },
  geneva: { lat: 46.2044, lon: 6.1432 },
  dublin: { lat: 53.3498, lon: -6.2603 },
};

export const GEO: Record<string, GeoPoint> = {
  ...allCityCoordinates(),
  ...MANUAL,
};

export function coordOf(slug: string): GeoPoint | null {
  return GEO[slug] ?? cityCoordinates(slug);
}

export function greatCircle(a: GeoPoint, b: GeoPoint, steps = 48): [number, number][] {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const toDeg = (n: number) => (n * 180) / Math.PI;
  const φ1 = toRad(a.lat);
  const λ1 = toRad(a.lon);
  const φ2 = toRad(b.lat);
  const λ2 = toRad(b.lon);
  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ));
  if (!Number.isFinite(Δ) || Δ < 1e-6) return [[a.lon, a.lat], [b.lon, b.lat]];
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
    const B = Math.sin(f * Δ) / Math.sin(Δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    points.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  return points;
}

export function corridorKind(mode?: string) {
  if (mode === "flight") {
    return {
      kind: "great-circle" as const,
      label: "Great-circle overview",
      note: "Airport-to-airport great-circle arc. Not a filed flight path.",
    };
  }
  return {
    kind: "connection-corridor" as const,
    label: "Connection corridor",
    note: "Known city coordinates only. Not a road route or turn-by-turn itinerary.",
  };
}
