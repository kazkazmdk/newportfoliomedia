import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, ALL_SYMPTOMS, APPLIANCES, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return ALL_ERRORS.map((item) => ({ brand: item.brand_slug, appliance: item.appliance_slug })).filter(
    (row, index, all) => all.findIndex((item) => item.brand === row.brand && item.appliance === row.appliance) === index,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string; appliance: string }> }) {
  const { brand, appliance } = await params;
  const name = BRANDS.find((item) => item.slug === brand)?.name;
  const applianceName = APPLIANCES.find((item) => item.slug === appliance)?.name;
  if (!name || !applianceName) return {};
  return pageMeta({
    title: `${name} ${applianceName} errors`,
    description: `${name} ${applianceName} error codes with causes, checks, and risk.`,
    canonical: `/fixcode/${brand}/${appliance}`,
  });
}

export default async function ApplianceHub({
  params,
}: {
  params: Promise<{ brand: string; appliance: string }>;
}) {
  const { brand, appliance } = await params;
  const name = BRANDS.find((item) => item.slug === brand)?.name;
  const applianceName = APPLIANCES.find((item) => item.slug === appliance)?.name;
  const errors = ALL_ERRORS.filter((item) => item.brand_slug === brand && item.appliance_slug === appliance);
  const symptoms = ALL_SYMPTOMS.filter((item) => item.brand_slug === brand && item.appliance_slug === appliance);
  if (!name || !errors.length) notFound();
  return (
    <main className="fc-scene">
      <nav className="fc-kicker">
        <Link href={`/fixcode/${brand}`}>{name}</Link> / {applianceName}
      </nav>
      <h1 className="fc-display mt-4">
        {name}
        <br />
        {applianceName}
      </h1>
      <p className="mt-5 max-w-lg leading-7">Pick a code. The machine becomes the diagnosis.</p>
      <ul className="mt-12">
        {errors.map((item) => (
          <li key={item.id}>
            <Link href={`/fixcode/${brand}/${appliance}/${item.code_slug}`} className="fc-hypo">
              <span className="fixcode-mono">{item.code}</span>
              <span className="text-[var(--fc-mute)]">{item.meaning}</span>
              <span className="fixcode-mono text-xs">{item.confidence}</span>
            </Link>
          </li>
        ))}
      </ul>
      {symptoms.length ? (
        <section className="mt-14">
          <p className="fc-kicker">Symptoms</p>
          <ul className="mt-4">
            {symptoms.map((item) => (
              <li key={item.id}>
                <Link href={`/fixcode/${brand}/${appliance}/${item.symptom_slug}`} className="fc-hypo">
                  <span className="fixcode-mono text-xs">SY</span>
                  <span>{item.symptom}</span>
                  <span />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
