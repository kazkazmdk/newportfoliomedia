import type { Place, RouteRecord } from "./index";

export const MORE_PLACES: Place[] = [
  { id: "rome", name: "Rome", slug: "rome", country: "IT" },
  { id: "madrid", name: "Madrid", slug: "madrid", country: "ES" },
  { id: "frankfurt", name: "Frankfurt", slug: "frankfurt", country: "DE" },
  { id: "zurich", name: "Zurich", slug: "zurich", country: "CH" },
  { id: "marseille", name: "Marseille", slug: "marseille", country: "FR" },
  { id: "lisbon", name: "Lisbon", slug: "lisbon", country: "PT" },
  { id: "hamburg", name: "Hamburg", slug: "hamburg", country: "DE" },
  { id: "geneva", name: "Geneva", slug: "geneva", country: "CH" },
];

type RouteSeed = Omit<RouteRecord, "id" | "from" | "to"> & { from: Place; to: Place };

function route(seed: RouteSeed): RouteRecord {
  return { id: `${seed.from.slug}-${seed.to.slug}`, ...seed };
}

export function moreRoutes(allPlaces: Place[]): RouteRecord[] {
  const p = (slug: string) => {
    const hit = allPlaces.find((row) => row.slug === slug);
    if (!hit) throw new Error(`Unknown place ${slug}`);
    return hit;
  };
  return [
    route({
      from: p("paris"), to: p("rome"), km: 1420, demand: 82,
      tolls_eur: 95, fuel_l_per_100: 7.1, fuel_eur_per_l: 1.79, parking_eur: 18, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 18.5, ev_eur_per_kwh: 0.42, ev_charge_stops: 4, ev_charge_minutes: 110,
      train_eur_pp: 140, train_minutes: 680, bus_eur_pp: 55, bus_minutes: 1080,
      flight_eur_pp: 90, flight_minutes: 115, airport_access_minutes: 55, city_transfer_minutes: 50, security_buffer_minutes: 90,
      rideshare_eur: 0,
    }),
    route({
      from: p("amsterdam"), to: p("berlin"), km: 660, demand: 78,
      tolls_eur: 0, fuel_l_per_100: 6.9, fuel_eur_per_l: 1.76, parking_eur: 14, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 17.5, ev_eur_per_kwh: 0.4, ev_charge_stops: 1, ev_charge_minutes: 30,
      train_eur_pp: 48, train_minutes: 370, bus_eur_pp: 28, bus_minutes: 480,
      flight_eur_pp: 75, flight_minutes: 75, airport_access_minutes: 50, city_transfer_minutes: 45, security_buffer_minutes: 80,
      rideshare_eur: 380,
    }),
    route({
      from: p("madrid"), to: p("barcelona"), km: 620, demand: 84,
      tolls_eur: 0, fuel_l_per_100: 6.8, fuel_eur_per_l: 1.65, parking_eur: 16, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 17, ev_eur_per_kwh: 0.38, ev_charge_stops: 1, ev_charge_minutes: 28,
      train_eur_pp: 55, train_minutes: 160, bus_eur_pp: 28, bus_minutes: 480,
      flight_eur_pp: 70, flight_minutes: 75, airport_access_minutes: 50, city_transfer_minutes: 45, security_buffer_minutes: 80,
      rideshare_eur: 340,
    }),
    route({
      from: p("rome"), to: p("milan"), km: 570, demand: 80,
      tolls_eur: 42, fuel_l_per_100: 7.0, fuel_eur_per_l: 1.81, parking_eur: 16, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 18, ev_eur_per_kwh: 0.41, ev_charge_stops: 1, ev_charge_minutes: 32,
      train_eur_pp: 52, train_minutes: 190, bus_eur_pp: 22, bus_minutes: 420,
      flight_eur_pp: 65, flight_minutes: 70, airport_access_minutes: 50, city_transfer_minutes: 45, security_buffer_minutes: 80,
      rideshare_eur: 300,
    }),
    route({
      from: p("london"), to: p("amsterdam"), km: 540, demand: 86,
      tolls_eur: 0, fuel_l_per_100: 7.3, fuel_eur_per_l: 1.72, parking_eur: 22, wear_eur_per_km: 0.09,
      ev_kwh_per_100: 19, ev_eur_per_kwh: 0.44, ev_charge_stops: 1, ev_charge_minutes: 40,
      train_eur_pp: 95, train_minutes: 240, bus_eur_pp: 32, bus_minutes: 540,
      flight_eur_pp: 68, flight_minutes: 75, airport_access_minutes: 60, city_transfer_minutes: 45, security_buffer_minutes: 90,
      rideshare_eur: 0,
    }),
    route({
      from: p("paris"), to: p("frankfurt"), km: 575, demand: 74,
      tolls_eur: 28, fuel_l_per_100: 7.0, fuel_eur_per_l: 1.79, parking_eur: 16, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 18, ev_eur_per_kwh: 0.41, ev_charge_stops: 1, ev_charge_minutes: 28,
      train_eur_pp: 90, train_minutes: 230, bus_eur_pp: 30, bus_minutes: 480,
      flight_eur_pp: 80, flight_minutes: 80, airport_access_minutes: 55, city_transfer_minutes: 40, security_buffer_minutes: 85,
      rideshare_eur: 360,
    }),
    route({
      from: p("munich"), to: p("zurich"), km: 310, demand: 68,
      tolls_eur: 12, fuel_l_per_100: 7.2, fuel_eur_per_l: 1.84, parking_eur: 18, wear_eur_per_km: 0.09,
      ev_kwh_per_100: 18.5, ev_eur_per_kwh: 0.45, ev_charge_stops: 0, ev_charge_minutes: 0,
      train_eur_pp: 65, train_minutes: 220, bus_eur_pp: 28, bus_minutes: 300,
      flight_eur_pp: 0, flight_minutes: 0, airport_access_minutes: 50, city_transfer_minutes: 40, security_buffer_minutes: 75,
      rideshare_eur: 240,
    }),
    route({
      from: p("lyon"), to: p("marseille"), km: 315, demand: 70,
      tolls_eur: 26, fuel_l_per_100: 7.0, fuel_eur_per_l: 1.79, parking_eur: 12, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 17, ev_eur_per_kwh: 0.4, ev_charge_stops: 0, ev_charge_minutes: 0,
      train_eur_pp: 42, train_minutes: 105, bus_eur_pp: 18, bus_minutes: 240,
      flight_eur_pp: 0, flight_minutes: 0, airport_access_minutes: 50, city_transfer_minutes: 40, security_buffer_minutes: 80,
      rideshare_eur: 190,
    }),
    route({
      from: p("berlin"), to: p("hamburg"), km: 290, demand: 66,
      tolls_eur: 0, fuel_l_per_100: 6.7, fuel_eur_per_l: 1.74, parking_eur: 12, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 17, ev_eur_per_kwh: 0.39, ev_charge_stops: 0, ev_charge_minutes: 0,
      train_eur_pp: 28, train_minutes: 110, bus_eur_pp: 16, bus_minutes: 220,
      flight_eur_pp: 0, flight_minutes: 0, airport_access_minutes: 50, city_transfer_minutes: 35, security_buffer_minutes: 70,
      rideshare_eur: 180,
    }),
    route({
      from: p("paris"), to: p("geneva"), km: 540, demand: 72,
      tolls_eur: 32, fuel_l_per_100: 7.2, fuel_eur_per_l: 1.79, parking_eur: 20, wear_eur_per_km: 0.09,
      ev_kwh_per_100: 18.5, ev_eur_per_kwh: 0.43, ev_charge_stops: 1, ev_charge_minutes: 25,
      train_eur_pp: 88, train_minutes: 190, bus_eur_pp: 34, bus_minutes: 420,
      flight_eur_pp: 0, flight_minutes: 0, airport_access_minutes: 55, city_transfer_minutes: 35, security_buffer_minutes: 80,
      rideshare_eur: 350,
    }),
    route({
      from: p("brussels"), to: p("amsterdam"), km: 210, demand: 68,
      tolls_eur: 0, fuel_l_per_100: 6.8, fuel_eur_per_l: 1.77, parking_eur: 16, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 16.5, ev_eur_per_kwh: 0.4, ev_charge_stops: 0, ev_charge_minutes: 0,
      train_eur_pp: 38, train_minutes: 110, bus_eur_pp: 16, bus_minutes: 180,
      flight_eur_pp: 0, flight_minutes: 0, airport_access_minutes: 50, city_transfer_minutes: 35, security_buffer_minutes: 80,
      rideshare_eur: 150,
    }),
    route({
      from: p("lisbon"), to: p("madrid"), km: 625, demand: 64,
      tolls_eur: 22, fuel_l_per_100: 6.9, fuel_eur_per_l: 1.68, parking_eur: 14, wear_eur_per_km: 0.08,
      ev_kwh_per_100: 17.5, ev_eur_per_kwh: 0.37, ev_charge_stops: 1, ev_charge_minutes: 30,
      train_eur_pp: 45, train_minutes: 620, bus_eur_pp: 24, bus_minutes: 540,
      flight_eur_pp: 55, flight_minutes: 75, airport_access_minutes: 45, city_transfer_minutes: 40, security_buffer_minutes: 80,
      rideshare_eur: 0,
    }),
  ];
}
