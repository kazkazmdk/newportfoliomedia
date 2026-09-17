import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, ALL_SYMPTOMS, APPLIANCES, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { ProcessRail, SectionLabel, StateBadge } from "../../components/system-ui";

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
    <main>
      <section className="fc-scene fc-hub-intro">
        <nav className="fc-kicker">
          <Link href={`/fixcode/${brand}`}>{name}</Link> / {applianceName}
        </nav>
        <div className="fc-hub-heading">
          <div>
            <h1 className="fc-display mt-5">{name}<br />{applianceName}</h1>
            <p className="mt-5 max-w-lg leading-7">Match the displayed code exactly, or use a documented symptom path.</p>
          </div>
          <StateBadge state="ready">{errors.length} code trees</StateBadge>
        </div>
        <ProcessRail active={1} />
      </section>
      <section className="fc-scene">
        <SectionLabel number="02">Search by displayed code</SectionLabel>
        <ul className="mt-8">
          {errors.map((item, index) => (
            <li key={item.id}>
              <Link href={`/fixcode/${brand}/${appliance}/${item.code_slug}`} className="fc-hypo">
                <span className="fixcode-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{item.code}</strong><small>{item.meaning}</small></span>
                <StateBadge state="ready">{item.confidence}</StateBadge>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {symptoms.length ? (
        <section className="fc-scene">
          <SectionLabel number="03">Browse by observed symptom</SectionLabel>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--fc-mute)]">Use this route when no code is shown. Symptoms stay scoped to this brand and appliance.</p>
          <ul className="mt-8">
            {symptoms.map((item, index) => (
              <li key={item.id}>
                <Link href={`/fixcode/${brand}/${appliance}/${item.symptom_slug}`} className="fc-hypo">
                  <span className="fixcode-mono text-xs">SY.{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.symptom}</strong><small>Documented symptom path</small></span>
                  <span aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
