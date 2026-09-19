"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ClimateMood } from "./climate-theme";

export type SceneView = "climate" | "pack";
export type ScenePlace = { city: string; country: string; slug: string; month?: string };

const Ctx = createContext<{
  mood: ClimateMood;
  setMood: (mood: ClimateMood) => void;
  view: SceneView;
  setView: (view: SceneView) => void;
  place: ScenePlace | null;
  setPlace: (place: ScenePlace) => void;
}>({
  mood: "rain",
  setMood: () => undefined,
  view: "climate",
  setView: () => undefined,
  place: null,
  setPlace: () => undefined,
});

export function ClimateProvider({
  initial = "rain",
  children,
}: {
  initial?: ClimateMood;
  children: ReactNode;
}) {
  const [mood, setMood] = useState<ClimateMood>(initial);
  const [view, setView] = useState<SceneView>("climate");
  const [place, setPlace] = useState<ScenePlace | null>(null);
  const value = useMemo(
    () => ({ mood, setMood, view, setView, place, setPlace }),
    [mood, view, place],
  );
  return (
    <Ctx.Provider value={value}>
      <div className="wearthere min-h-screen" data-climate={mood} data-view={view}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useClimateMood() {
  return useContext(Ctx);
}
