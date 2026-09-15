"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ClimateMood } from "./climate-theme";

const Ctx = createContext<{ mood: ClimateMood; setMood: (mood: ClimateMood) => void }>({
  mood: "rain",
  setMood: () => undefined,
});

export function ClimateProvider({
  initial = "rain",
  children,
}: {
  initial?: ClimateMood;
  children: ReactNode;
}) {
  const [mood, setMood] = useState<ClimateMood>(initial);
  const value = useMemo(() => ({ mood, setMood }), [mood]);
  return (
    <Ctx.Provider value={value}>
      <div className="wearthere min-h-screen" data-climate={mood}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useClimateMood() {
  return useContext(Ctx);
}
