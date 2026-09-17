import { notFound } from "next/navigation";
import { ROUTES, compareRoute, costLabel, getRoute, routeCosts } from "@penta/tripcost";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { RouteMap } from "../../../../components/route-map";

export function generateStaticParams() {
  return ROUTES.map((r) => ({ from: r.from.slug, to: r.to.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ from: string; to: string }> }) {
  const { from, to } = await params;
  const route = getRoute(from, to);
  if (!route) return {};
  return pageMeta({
    title: `${route.from.name} to ${route.to.name} driving cost: fuel + tolls`,
    description: `${route.km} km, tolls ${route.tolls_eur} €.`,
    canonical: `/tripcost/${from}/to/${to}/driving-cost`,
  });
}

export default async function DrivingPage({ params }: { params: Promise<{ from: string; to: string }> }) {
  const { from, to } = await params;
  const route = getRoute(from, to);
  if (!route) notFound();
  const car = compareRoute(route, 1).modes.find((m) => m.mode === "car")!;
  const costs = routeCosts(route);
  return (
    <main>
      <section className="tc-driving-stage">
        <div className="tc-result-intro">
          <p className="tc-kicker">Driving study · {route.km} km</p>
          <p>Cash estimate for one traveller, using the existing corridor assumptions.</p>
        </div>
        <RouteMap from={route.from.slug} to={route.to.slug} mode="car" />
      </section>
      <section className="tc-scene tc-driving-summary">
        <p className="tc-section-index tc-mono">01 / Driving cost</p>
        <h1 className="tc-scene-title">
          {route.from.name} to {route.to.name} driving cost
        </h1>
        <div className="tc-driving-detail">
          <p className="tc-driving-price tc-mono">€{car.cash_eur}</p>
          <p>Cash: fuel + tolls + parking. Wear is optional on the comparison.</p>
          <p className="tc-model-notice">{costLabel("HEURISTIC")} · typical estimate · not a live ticket</p>
          <ul>
            {car.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <div className="tc-driving-evidence" aria-label="Cost evidence">
            <span>Fuel · {costLabel(costs.fuel.evidence)}</span>
            <span>Tolls · {costLabel(costs.tolls.evidence)}</span>
            <span>Parking · {costLabel(costs.parking.evidence)}</span>
          </div>
          <Link className="tc-cta" href={`/tripcost/${from}/to/${to}`}>
            Compare all modes <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
