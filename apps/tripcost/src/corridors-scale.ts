import type { Place, RouteRecord } from "./index";

type City = Place & { lat: number; lon: number; demand: number };

const CITIES: City[] = [
  { id: "paris", name: "Paris", slug: "paris", country: "FR", lat: 48.86, lon: 2.35, demand: 96 },
  { id: "lyon", name: "Lyon", slug: "lyon", country: "FR", lat: 45.76, lon: 4.84, demand: 84 },
  { id: "marseille", name: "Marseille", slug: "marseille", country: "FR", lat: 43.3, lon: 5.37, demand: 80 },
  { id: "toulouse", name: "Toulouse", slug: "toulouse", country: "FR", lat: 43.6, lon: 1.44, demand: 76 },
  { id: "nice", name: "Nice", slug: "nice", country: "FR", lat: 43.7, lon: 7.27, demand: 78 },
  { id: "bordeaux", name: "Bordeaux", slug: "bordeaux", country: "FR", lat: 44.84, lon: -0.58, demand: 74 },
  { id: "nantes", name: "Nantes", slug: "nantes", country: "FR", lat: 47.22, lon: -1.55, demand: 70 },
  { id: "lille", name: "Lille", slug: "lille", country: "FR", lat: 50.63, lon: 3.06, demand: 72 },
  { id: "strasbourg", name: "Strasbourg", slug: "strasbourg", country: "FR", lat: 48.57, lon: 7.75, demand: 71 },
  { id: "rennes", name: "Rennes", slug: "rennes", country: "FR", lat: 48.11, lon: -1.68, demand: 66 },
  { id: "montpellier", name: "Montpellier", slug: "montpellier", country: "FR", lat: 43.61, lon: 3.88, demand: 68 },
  { id: "grenoble", name: "Grenoble", slug: "grenoble", country: "FR", lat: 45.19, lon: 5.72, demand: 62 },
  { id: "dijon", name: "Dijon", slug: "dijon", country: "FR", lat: 47.32, lon: 5.04, demand: 58 },
  { id: "rouen", name: "Rouen", slug: "rouen", country: "FR", lat: 49.44, lon: 1.1, demand: 56 },
  { id: "tours", name: "Tours", slug: "tours", country: "FR", lat: 47.39, lon: 0.69, demand: 55 },
  { id: "london", name: "London", slug: "london", country: "UK", lat: 51.51, lon: -0.13, demand: 95 },
  { id: "manchester", name: "Manchester", slug: "manchester", country: "UK", lat: 53.48, lon: -2.24, demand: 82 },
  { id: "birmingham", name: "Birmingham", slug: "birmingham", country: "UK", lat: 52.48, lon: -1.9, demand: 78 },
  { id: "edinburgh", name: "Edinburgh", slug: "edinburgh", country: "UK", lat: 55.95, lon: -3.19, demand: 76 },
  { id: "glasgow", name: "Glasgow", slug: "glasgow", country: "UK", lat: 55.86, lon: -4.25, demand: 72 },
  { id: "bristol", name: "Bristol", slug: "bristol", country: "UK", lat: 51.45, lon: -2.59, demand: 68 },
  { id: "leeds", name: "Leeds", slug: "leeds", country: "UK", lat: 53.8, lon: -1.55, demand: 66 },
  { id: "liverpool", name: "Liverpool", slug: "liverpool", country: "UK", lat: 53.41, lon: -2.99, demand: 64 },
  { id: "cardiff", name: "Cardiff", slug: "cardiff", country: "UK", lat: 51.48, lon: -3.18, demand: 60 },
  { id: "berlin", name: "Berlin", slug: "berlin", country: "DE", lat: 52.52, lon: 13.4, demand: 92 },
  { id: "munich", name: "Munich", slug: "munich", country: "DE", lat: 48.14, lon: 11.58, demand: 86 },
  { id: "hamburg", name: "Hamburg", slug: "hamburg", country: "DE", lat: 53.55, lon: 9.99, demand: 80 },
  { id: "frankfurt", name: "Frankfurt", slug: "frankfurt", country: "DE", lat: 50.11, lon: 8.68, demand: 82 },
  { id: "cologne", name: "Cologne", slug: "cologne", country: "DE", lat: 50.94, lon: 6.96, demand: 76 },
  { id: "stuttgart", name: "Stuttgart", slug: "stuttgart", country: "DE", lat: 48.78, lon: 9.18, demand: 74 },
  { id: "dusseldorf", name: "Dusseldorf", slug: "dusseldorf", country: "DE", lat: 51.23, lon: 6.77, demand: 70 },
  { id: "dresden", name: "Dresden", slug: "dresden", country: "DE", lat: 51.05, lon: 13.74, demand: 62 },
  { id: "leipzig", name: "Leipzig", slug: "leipzig", country: "DE", lat: 51.34, lon: 12.37, demand: 60 },
  { id: "hanover", name: "Hanover", slug: "hanover", country: "DE", lat: 52.38, lon: 9.73, demand: 58 },
  { id: "nuremberg", name: "Nuremberg", slug: "nuremberg", country: "DE", lat: 49.45, lon: 11.08, demand: 61 },
  { id: "madrid", name: "Madrid", slug: "madrid", country: "ES", lat: 40.42, lon: -3.7, demand: 90 },
  { id: "barcelona", name: "Barcelona", slug: "barcelona", country: "ES", lat: 41.39, lon: 2.17, demand: 88 },
  { id: "valencia", name: "Valencia", slug: "valencia", country: "ES", lat: 39.47, lon: -0.38, demand: 74 },
  { id: "seville", name: "Seville", slug: "seville", country: "ES", lat: 37.39, lon: -5.98, demand: 70 },
  { id: "bilbao", name: "Bilbao", slug: "bilbao", country: "ES", lat: 43.26, lon: -2.93, demand: 64 },
  { id: "malaga", name: "Malaga", slug: "malaga", country: "ES", lat: 36.72, lon: -4.42, demand: 68 },
  { id: "zaragoza", name: "Zaragoza", slug: "zaragoza", country: "ES", lat: 41.65, lon: -0.88, demand: 56 },
  { id: "rome", name: "Rome", slug: "rome", country: "IT", lat: 41.9, lon: 12.5, demand: 90 },
  { id: "milan", name: "Milan", slug: "milan", country: "IT", lat: 45.46, lon: 9.19, demand: 86 },
  { id: "naples", name: "Naples", slug: "naples", country: "IT", lat: 40.85, lon: 14.27, demand: 74 },
  { id: "turin", name: "Turin", slug: "turin", country: "IT", lat: 45.07, lon: 7.69, demand: 68 },
  { id: "florence", name: "Florence", slug: "florence", country: "IT", lat: 43.77, lon: 11.25, demand: 72 },
  { id: "bologna", name: "Bologna", slug: "bologna", country: "IT", lat: 44.49, lon: 11.34, demand: 64 },
  { id: "venice", name: "Venice", slug: "venice", country: "IT", lat: 45.44, lon: 12.32, demand: 70 },
  { id: "genoa", name: "Genoa", slug: "genoa", country: "IT", lat: 44.41, lon: 8.93, demand: 58 },
  { id: "amsterdam", name: "Amsterdam", slug: "amsterdam", country: "NL", lat: 52.37, lon: 4.9, demand: 86 },
  { id: "rotterdam", name: "Rotterdam", slug: "rotterdam", country: "NL", lat: 51.92, lon: 4.48, demand: 68 },
  { id: "utrecht", name: "Utrecht", slug: "utrecht", country: "NL", lat: 52.09, lon: 5.12, demand: 58 },
  { id: "the-hague", name: "The Hague", slug: "the-hague", country: "NL", lat: 52.07, lon: 4.3, demand: 60 },
  { id: "brussels", name: "Brussels", slug: "brussels", country: "BE", lat: 50.85, lon: 4.35, demand: 80 },
  { id: "antwerp", name: "Antwerp", slug: "antwerp", country: "BE", lat: 51.22, lon: 4.4, demand: 64 },
  { id: "luxembourg", name: "Luxembourg", slug: "luxembourg", country: "LU", lat: 49.61, lon: 6.13, demand: 62 },
  { id: "zurich", name: "Zurich", slug: "zurich", country: "CH", lat: 47.38, lon: 8.54, demand: 78 },
  { id: "geneva", name: "Geneva", slug: "geneva", country: "CH", lat: 46.2, lon: 6.15, demand: 74 },
  { id: "basel", name: "Basel", slug: "basel", country: "CH", lat: 47.56, lon: 7.59, demand: 62 },
  { id: "vienna", name: "Vienna", slug: "vienna", country: "AT", lat: 48.21, lon: 16.37, demand: 80 },
  { id: "salzburg", name: "Salzburg", slug: "salzburg", country: "AT", lat: 47.81, lon: 13.04, demand: 64 },
  { id: "innsbruck", name: "Innsbruck", slug: "innsbruck", country: "AT", lat: 47.27, lon: 11.39, demand: 58 },
  { id: "lisbon", name: "Lisbon", slug: "lisbon", country: "PT", lat: 38.72, lon: -9.14, demand: 80 },
  { id: "porto", name: "Porto", slug: "porto", country: "PT", lat: 41.15, lon: -8.61, demand: 70 },
  { id: "warsaw", name: "Warsaw", slug: "warsaw", country: "PL", lat: 52.23, lon: 21.01, demand: 74 },
  { id: "krakow", name: "Krakow", slug: "krakow", country: "PL", lat: 50.06, lon: 19.94, demand: 68 },
  { id: "prague", name: "Prague", slug: "prague", country: "CZ", lat: 50.08, lon: 14.44, demand: 82 },
  { id: "budapest", name: "Budapest", slug: "budapest", country: "HU", lat: 47.5, lon: 19.04, demand: 76 },
  { id: "copenhagen", name: "Copenhagen", slug: "copenhagen", country: "DK", lat: 55.68, lon: 12.57, demand: 78 },
  { id: "stockholm", name: "Stockholm", slug: "stockholm", country: "SE", lat: 59.33, lon: 18.07, demand: 80 },
  { id: "gothenburg", name: "Gothenburg", slug: "gothenburg", country: "SE", lat: 57.71, lon: 11.97, demand: 64 },
  { id: "oslo", name: "Oslo", slug: "oslo", country: "NO", lat: 59.91, lon: 10.75, demand: 72 },
  { id: "helsinki", name: "Helsinki", slug: "helsinki", country: "FI", lat: 60.17, lon: 24.94, demand: 68 },
  { id: "dublin", name: "Dublin", slug: "dublin", country: "IE", lat: 53.35, lon: -6.26, demand: 78 },
  { id: "athens", name: "Athens", slug: "athens", country: "GR", lat: 37.98, lon: 23.73, demand: 74 },
  { id: "zagreb", name: "Zagreb", slug: "zagreb", country: "HR", lat: 45.82, lon: 15.98, demand: 58 },
  { id: "split", name: "Split", slug: "split", country: "HR", lat: 43.51, lon: 16.44, demand: 56 },
];

const FUEL: Record<string, number> = {
  FR: 1.79, UK: 1.62, DE: 1.72, ES: 1.55, IT: 1.81, NL: 1.84, BE: 1.7, LU: 1.48,
  CH: 1.72, AT: 1.58, PT: 1.68, PL: 1.38, CZ: 1.45, HU: 1.52, DK: 1.9, SE: 1.7,
  NO: 1.85, FI: 1.75, IE: 1.68, GR: 1.72, HR: 1.5,
};

const TOLL_KM: Record<string, number> = {
  FR: 0.075, IT: 0.07, ES: 0.035, PT: 0.055, PL: 0.02, HR: 0.04, GR: 0.03,
};

const ADJACENT: Record<string, string[]> = {
  FR: ["BE", "LU", "DE", "CH", "IT", "ES", "UK"],
  UK: ["FR", "IE", "BE", "NL"],
  DE: ["FR", "BE", "NL", "LU", "CH", "AT", "CZ", "PL", "DK"],
  ES: ["FR", "PT"],
  IT: ["FR", "CH", "AT", "SI", "HR"],
  NL: ["BE", "DE", "UK"],
  BE: ["FR", "NL", "DE", "LU", "UK"],
  LU: ["FR", "BE", "DE"],
  CH: ["FR", "DE", "AT", "IT"],
  AT: ["DE", "CH", "IT", "CZ", "HU", "HR"],
  PT: ["ES"],
  PL: ["DE", "CZ"],
  CZ: ["DE", "AT", "PL"],
  HU: ["AT", "HR"],
  DK: ["DE", "SE"],
  SE: ["DK", "NO"],
  NO: ["SE"],
  FI: ["SE"],
  IE: ["UK"],
  GR: ["HR"],
  HR: ["AT", "HU", "IT"],
};

function haversine(a: City, b: City): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function placeOf(city: City): Place {
  return { id: city.id, name: city.name, slug: city.slug, country: city.country };
}

function modelRoute(from: City, to: City): RouteRecord {
  const greatCircle = haversine(from, to);
  const km = Math.round(greatCircle * 1.28);
  const fuel_eur_per_l = Number(((FUEL[from.country] + FUEL[to.country]) / 2).toFixed(2));
  const tollRate = ((TOLL_KM[from.country] ?? 0) + (TOLL_KM[to.country] ?? 0)) / 2;
  const tolls_eur = Math.round(km * tollRate);
  const fuel_l_per_100 = from.country === to.country ? 6.8 : 7.1;
  const train_eur_pp = Math.max(12, Math.round(km * (from.country === to.country ? 0.14 : 0.18)));
  const train_minutes = Math.round(km / 1.15 + 25);
  const bus_eur_pp = Math.max(8, Math.round(km * 0.07));
  const bus_minutes = Math.round(km / 0.75 + 20);
  const flight = km >= 450;
  const demand = Math.min(96, Math.round((from.demand + to.demand) / 2));
  return {
    id: `${from.slug}-${to.slug}`,
    from: placeOf(from),
    to: placeOf(to),
    km,
    demand,
    tolls_eur,
    fuel_l_per_100,
    fuel_eur_per_l,
    parking_eur: km > 250 ? 16 : 10,
    wear_eur_per_km: 0.08,
    ev_kwh_per_100: 17.5,
    ev_eur_per_kwh: 0.4,
    ev_charge_stops: km > 350 ? Math.ceil((km - 250) / 280) : 0,
    ev_charge_minutes: km > 350 ? Math.ceil((km - 250) / 280) * 28 : 0,
    train_eur_pp,
    train_minutes,
    bus_eur_pp,
    bus_minutes,
    flight_eur_pp: flight ? Math.max(40, Math.round(55 + km * 0.04)) : 0,
    flight_minutes: flight ? Math.round(55 + km / 12) : 0,
    airport_access_minutes: 50,
    city_transfer_minutes: 40,
    security_buffer_minutes: flight ? 80 : 0,
    rideshare_eur: km < 220 ? Math.round(km * 1.35) : 0,
  };
}

export function cityCoordinates(slug: string): { lat: number; lon: number } | null {
  const city = CITIES.find((item) => item.slug === slug);
  return city ? { lat: city.lat, lon: city.lon } : null;
}

export function allCityCoordinates(): Record<string, { lat: number; lon: number }> {
  return Object.fromEntries(CITIES.map((city) => [city.slug, { lat: city.lat, lon: city.lon }]));
}

export function scalePlaces(): Place[] {
  return CITIES.map(placeOf);
}

export function scaleCorridors(existingIds: Set<string>): RouteRecord[] {
  const byCountry = new Map<string, City[]>();
  for (const city of CITIES) {
    const list = byCountry.get(city.country) ?? [];
    list.push(city);
    byCountry.set(city.country, list);
  }
  const picked: RouteRecord[] = [];
  const seen = new Set(existingIds);

  const push = (from: City, to: City) => {
    if (from.slug === to.slug) return;
    const id = `${from.slug}-${to.slug}`;
    if (seen.has(id)) return;
    const km = haversine(from, to) * 1.28;
    if (km < 45 || km > 1600) return;
    seen.add(id);
    picked.push(modelRoute(from, to));
  };

  for (const group of byCountry.values()) {
    const ranked = [...group].sort((a, b) => b.demand - a.demand);
    for (let i = 0; i < ranked.length; i++) {
      const nearest = ranked
        .filter((_, j) => j !== i)
        .map((other) => ({ other, km: haversine(ranked[i], other) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 8);
      for (const row of nearest) push(ranked[i], row.other);
    }
  }

  for (const from of CITIES) {
    for (const to of CITIES) {
      if (from.country === to.country) continue;
      if (!(ADJACENT[from.country] ?? []).includes(to.country)) continue;
      if (from.demand < 64 || to.demand < 64) continue;
      push(from, to);
    }
  }

  const majors = CITIES.filter((c) => c.demand >= 80);
  for (const from of majors) {
    for (const to of majors) {
      if (from.slug >= to.slug) continue;
      push(from, to);
      push(to, from);
    }
  }

  return picked;
}
