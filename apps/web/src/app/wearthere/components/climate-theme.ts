import type { MonthClimate } from "@penta/wearthere";

export type ClimateMood = "polar" | "humid" | "sun" | "rain" | "cool" | "mild";

export function climateMood(w: MonthClimate, city?: string): ClimateMood {
  const slug = city ?? "";
  if (slug === "singapore" || (w.tmax_c >= 28 && w.humidity >= 75)) return "humid";
  if (slug === "reykjavik" || w.tmax_c <= 6) return "polar";
  if (slug === "lisbon" && w.tmax_c >= 18) return "sun";
  if (slug === "tokyo" || w.rain_days >= 8) return "rain";
  if (w.tmax_c >= 22 && w.rain_days <= 6) return "sun";
  if (w.tmax_c < 14) return "cool";
  return "mild";
}

export function climateCopy(mood: ClimateMood): string {
  if (mood === "polar") return "Cold air. Wind reads first.";
  if (mood === "humid") return "Dense heat. Rain is a layer, not a day.";
  if (mood === "sun") return "Warm light. Terracotta hours.";
  if (mood === "rain") return "Steel sky. Keep a shell close.";
  if (mood === "cool") return "Cool city. Mid-layer weather.";
  return "Mild air. Pack for evenings.";
}
