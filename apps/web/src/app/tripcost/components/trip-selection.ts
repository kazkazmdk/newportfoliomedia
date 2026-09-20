"use client";

import { PLACES, ROUTES } from "@penta/tripcost";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useTripSelection() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const parts = pathname.split("/").filter(Boolean);
  const live = parts[0] === "tripcost" && parts[2] === "to";
  const origins = useMemo(
    () => PLACES.filter((place) => ROUTES.some((route) => route.from.slug === place.slug)),
    [],
  );

  const from = live ? parts[1] : (search.get("from") ?? "paris");
  const requestedTo = live ? parts[3] : (search.get("to") ?? "lyon");
  const destinations = useMemo(
    () => ROUTES.filter((route) => route.from.slug === from && !route.compare_only).map((route) => route.to),
    [from],
  );
  const to = destinations.some((place) => place.slug === requestedTo) ? requestedTo : destinations[0]?.slug;
  const travellers = Number(search.get("travellers") ?? 2) || 2;
  const corridor = ROUTES.find((route) => route.from.slug === from && route.to.slug === to);
  const fromName = origins.find((place) => place.slug === from)?.name ?? from.replaceAll("-", " ");
  const toName = destinations.find((place) => place.slug === to)?.name ?? (to ?? "").replaceAll("-", " ");

  function go(next: { from?: string; to?: string; travellers?: number }) {
    const nextFrom = next.from ?? from;
    const options = ROUTES.filter((route) => route.from.slug === nextFrom && !route.compare_only);
    const nextTo = options.some((route) => route.to.slug === (next.to ?? to))
      ? (next.to ?? to)
      : options[0]?.to.slug;
    const people = next.travellers ?? travellers;
    if (!nextTo) return;
    if (live || pathname !== "/tripcost") {
      router.push(`/tripcost/${nextFrom}/to/${nextTo}?travellers=${people}`);
      return;
    }
    router.replace(`/tripcost?from=${nextFrom}&to=${nextTo}&travellers=${people}`, { scroll: false });
  }

  return {
    live,
    from,
    to,
    fromName,
    toName,
    travellers,
    origins,
    destinations,
    corridor,
    go,
  };
}
