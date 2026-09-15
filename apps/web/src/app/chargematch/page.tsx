import { pageMeta } from "@/lib/seo";
import { ConnectHero } from "./components/connect-hero";

export const metadata = pageMeta({
  title: "ChargeMatch — What are you trying to connect?",
  description: "Device, charger, optional cable. Compatibility, port allocation, and confidence — not a review roundup.",
  canonical: "/chargematch",
});

export default function ChargematchHome() {
  return (
    <main>
      <ConnectHero />
    </main>
  );
}
