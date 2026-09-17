import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { ProcessRail, SectionLabel, StateBadge } from "../components/system-ui";

export function generateStaticParams() {
  return BRANDS.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const row = BRANDS.find((item) => item.slug === brand);
  if (!row) return {};
  return pageMeta({
    title: `${row.name} appliance errors`,
    description: `Verified ${row.name} error codes with diagnostic trees.`,
    canonical: `/fixcode/${brand}`,
  });
}

export default async function BrandHub({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const row = BRANDS.find((item) => item.slug === brand);
  if (!row) notFound();
  const errors = ALL_ERRORS.filter((item) => item.brand_slug === brand);
  const appliances = [...new Set(errors.map((item) => item.appliance_slug))];
  return (
    <main>
      <section className="fc-scene fc-hub-intro">
        <SectionLabel number="01">Brand identification</SectionLabel>
        <div className="fc-hub-heading">
          <div>
            <h1 className="fc-display mt-5">{row.name}</h1>
            <p className="mt-5 max-w-lg leading-7">{errors.length} verified error trees. Missing codes are omitted on purpose.</p>
          </div>
          <StateBadge state="ready">Brand on file</StateBadge>
        </div>
        <ProcessRail active={1} />
      </section>
      <section className="fc-scene">
        <SectionLabel number="02">Choose the appliance</SectionLabel>
        <ul className="mt-8">
        {appliances.map((appliance) => (
          <li key={appliance}>
            <Link className="fc-hypo" href={`/fixcode/${brand}/${appliance}`}>
              <span className="fixcode-mono text-xs">{String(appliances.indexOf(appliance) + 1).padStart(2, "0")}</span>
              <span>
                <strong>{row.name} {appliance}</strong>
                <small>Open the code and symptom index</small>
              </span>
              <span className="fc-code-token">{errors.filter((e) => e.appliance_slug === appliance).length}</span>
            </Link>
          </li>
        ))}
        </ul>
      </section>
    </main>
  );
}
