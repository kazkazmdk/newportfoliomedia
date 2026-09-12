import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { TripApp } from "../trip-app";

export const metadata = pageMeta({
  title: "Your packing plan — WearThere",
  description: "Personalized trip. Noindex.",
  canonical: "/wearthere/trip",
  noindex: true,
});

export default function TripPage() {
  return (
    <Suspense fallback={<p>Building your capsule…</p>}>
      <TripApp />
    </Suspense>
  );
}
