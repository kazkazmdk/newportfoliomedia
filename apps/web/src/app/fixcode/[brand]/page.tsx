import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";

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
    <main className="fc-scene">
      <p className="fc-kicker">Brand instrument</p>
      <h1 className="fc-display mt-4">{row.name}</h1>
      <p className="mt-5 max-w-lg leading-7">
        {errors.length} verified error trees. Missing codes are omitted on purpose.
      </p>
      <ul className="mt-12">
        {appliances.map((appliance) => (
          <li key={appliance}>
            <Link className="fc-hypo" href={`/fixcode/${brand}/${appliance}`}>
              <span className="fixcode-mono text-xs">AP</span>
              <span>
                {row.name} {appliance}
              </span>
              <span className="fixcode-mono">{errors.filter((e) => e.appliance_slug === appliance).length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
