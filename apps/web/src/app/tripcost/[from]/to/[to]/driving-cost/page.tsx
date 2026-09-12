import { notFound } from "next/navigation";
import { ROUTES, getRoute } from "@penta/tripcost";
import { compareRoute } from "@penta/tripcost";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

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
  return (
    <main>
      <h1 className="text-4xl">
        {route.from.name} to {route.to.name} driving cost
      </h1>
      <p className="mt-4 tc-mono text-5xl">€{car.cash_eur}</p>
      <p className="mt-2">Cash: fuel + tolls + parking. Wear is optional on the comparison.</p>
      <ul className="mt-6 tc-card p-4 text-sm leading-7">
        {car.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <Link className="tc-cta mt-8 inline-block" href={`/tripcost/${from}/to/${to}`}>
        Compare all modes
      </Link>
    </main>
  );
}
