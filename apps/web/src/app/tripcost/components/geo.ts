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

const COAST: Array<[number, number]> = [
  [37.0, -8.9],
  [38.7, -9.4],
  [43.3, -9.0],
  [48.4, -4.8],
  [51.7, -10.2],
  [55.3, -7.3],
  [58.6, -5.2],
  [55.0, -1.5],
  [53.0, 1.4],
  [51.2, 3.8],
  [53.5, 6.8],
  [57.7, 8.5],
  [54.8, 13.2],
  [54.4, 16.4],
  [49.0, 16.2],
  [45.4, 13.7],
  [41.9, 16.0],
  [38.1, 15.5],
  [37.5, 12.5],
  [43.3, 10.0],
  [43.7, 7.3],
  [41.4, 2.2],
  [36.7, -2.5],
  [36.2, -5.6],
  [37.0, -8.9],
];

export const EUROPE_LAND = COAST.map(([lat, lon], i) => {
  const p = project(lat, lon);
  return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}).join(" ") + " Z";
