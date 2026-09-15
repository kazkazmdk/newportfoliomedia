import { notFound } from "next/navigation";
import { CABLES, allChargematchPages, compatibility, getCharger, getDevice } from "@penta/chargematch";
import { pageMeta } from "@/lib/seo";
import { PairStudio } from "../../../components/pair-studio";

export function generateStaticParams() {
  return allChargematchPages()
    .filter((p) => p.family === "can-charger-charge")
    .map((p) => {
      const parts = p.url.split("/").filter(Boolean);
      return { device: parts[1], charger: parts[3] };
    });
}

export async function generateMetadata({ params }: { params: Promise<{ device: string; charger: string }> }) {
  const { device, charger } = await params;
  const page = allChargematchPages().find((p) => p.url === `/chargematch/${device}/with/${charger}`);
  if (!page) return {};
  return pageMeta({
    title: page.title,
    description: page.meta_description,
    canonical: page.canonical,
    noindex: page.noindex,
  });
}

export default async function PairPage({ params }: { params: Promise<{ device: string; charger: string }> }) {
  const { device: dSlug, charger: cSlug } = await params;
  const device = getDevice(dSlug);
  const charger = getCharger(cSlug);
  if (!device || !charger) notFound();
  compatibility(device, charger, CABLES[0]);
  return <PairStudio device={device} charger={charger} />;
}
