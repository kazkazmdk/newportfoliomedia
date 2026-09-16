import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ROUTES, allTripcostPages, getRoute, sanitizeTravellers } from "@penta/tripcost";
import { pageMeta } from "@/lib/seo";
import { RouteCompare } from "../../../route-compare";

export function generateStaticParams() {
  return ROUTES.map((r) => ({ from: r.from.slug, to: r.to.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ from: string; to: string }> }) {
  const { from, to } = await params;
  const page = allTripcostPages().find((p) => p.url === `/tripcost/${from}/to/${to}`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function RoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ from: string; to: string }>;
  searchParams: Promise<{ travellers?: string | string[] }>;
}) {
  const { from, to } = await params;
  const query = await searchParams;
  const route = getRoute(from, to);
  if (!route) notFound();
  return (
    <Suspense fallback={<p className="tc-scene">Loading corridor…</p>}>
      <RouteCompare route={route} initialTravellers={sanitizeTravellers(query.travellers)} />
    </Suspense>
  );
}
