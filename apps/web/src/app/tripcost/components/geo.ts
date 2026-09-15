export const GEO: Record<string, { lat: number; lon: number }> = {
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

const LON_MIN = -11;
const LON_MAX = 16.5;
const LAT_MIN = 36;
const LAT_MAX = 60;

export function project(lat: number, lon: number, w = 1000, h = 720) {
  return {
    x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * w,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * h,
  };
}

export function pointOf(slug: string) {
  const g = GEO[slug] ?? { lat: 48.5, lon: 6 };
  return project(g.lat, g.lon);
}

export function geodesic(a: { x: number; y: number }, b: { x: number; y: number }, lift = 48) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - lift;
  return `M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

/** Reduced Europe land — decorative coastline, cities stay on real coordinates. */
export const EUROPE_LAND =
  "M 210 70 L 250 78 L 268 62 L 310 70 L 340 58 L 390 80 L 430 70 L 470 90 L 510 110 L 560 130 L 620 160 L 680 210 L 700 270 L 690 330 L 640 380 L 600 430 L 540 470 L 480 510 L 420 540 L 360 560 L 300 540 L 250 500 L 200 470 L 150 430 L 110 380 L 80 320 L 90 260 L 70 210 L 90 160 L 140 120 L 180 90 Z";
