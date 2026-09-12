import { pageMeta } from "@/lib/seo";
import { KitApp } from "../kit-app";

export const metadata = pageMeta({
  title: "My Power Kit — ChargeMatch",
  description: "Private inventory.",
  canonical: "/chargematch/kit",
  noindex: true,
});

export default function KitPage() {
  return <KitApp />;
}
