import Link from "next/link";
import { notFound } from "next/navigation";
import { CHARGERS, DEVICES, getDevice } from "@penta/chargematch";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return DEVICES.map((d) => ({ device: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ device: string }> }) {
  const { device } = await params;
  const d = getDevice(device);
  if (!d) return {};
  return pageMeta({
    title: `${d.name} charging wattage`,
    description: `${d.name} takes ${d.min_watts}–${d.max_watts} W.`,
    canonical: `/chargematch/${device}`,
  });
}

export default async function DeviceHub({ params }: { params: Promise<{ device: string }> }) {
  const { device } = await params;
  const d = getDevice(device);
  if (!d) notFound();
  return (
    <main>
      <p className="cm-mono text-xs">{d.tag.replaceAll("_", " ")}</p>
      <h1 className="mt-3 text-5xl">{d.name}</h1>
      <p className="mt-4 cm-mono text-4xl">{d.min_watts}–{d.max_watts} W</p>
      <p className="mt-3 max-w-lg leading-7">{d.notes}</p>
      <ul className="mt-8 grid gap-2">
        {CHARGERS.map((c) => (
          <li key={c.id}>
            <Link className="cm-box flex justify-between px-4 py-3" href={`/chargematch/${d.slug}/with/${c.slug}`}>
              <span>{c.name}</span>
              <span className="cm-mono text-sm">{c.total_watts} W</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
