import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { GarageApp } from "../garage-app";

export const metadata = pageMeta({
  title: "My Garage — AutoSpec",
  description: "Private vehicle profile.",
  canonical: "/autospec/garage",
  noindex: true,
});

export default function GaragePage() {
  return (
    <Suspense fallback={<p>Loading garage…</p>}>
      <GarageApp />
    </Suspense>
  );
}
