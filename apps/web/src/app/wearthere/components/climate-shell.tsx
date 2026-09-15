"use client";

import { DESTINATIONS, typicalWeather } from "@penta/wearthere";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ClimateProvider } from "./climate-context";
import { climateMood } from "./climate-theme";

export function ClimateShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2];
  const dest = DESTINATIONS.find((d) => d.slug === slug) ?? DESTINATIONS.find((d) => d.slug === "tokyo") ?? DESTINATIONS[0];
  const month = new Date().getUTCMonth() + 1;
  const mood = climateMood(typicalWeather(dest, month), dest.slug);
  return <ClimateProvider initial={mood}>{children}</ClimateProvider>;
}
