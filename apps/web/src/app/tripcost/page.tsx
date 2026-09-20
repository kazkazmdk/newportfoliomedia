import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { HomeMap } from "./components/home-map";

export const metadata = pageMeta({
  title: "TripCost — Where are you going?",
  description: "Compare the real cost of car, EV, train, bus, and flight. Door-to-door, not block time.",
  canonical: "/tripcost",
});

export default function TripcostHome() {
  return (
    <main>
      <Suspense fallback={<section className="tc-atlas"><p className="tc-realmap-state">Loading world map</p></section>}>
        <HomeMap />
      </Suspense>
    </main>
  );
}
