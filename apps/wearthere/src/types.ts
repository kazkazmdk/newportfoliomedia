import type { MonthClimate } from "./climate";

export type Destination = {
  id: string;
  city: string;
  slug: string;
  country: string;
  lat: number;
  lon: number;
  demand: number;
  climate: MonthClimate[];
  activities_default: string[];
};
