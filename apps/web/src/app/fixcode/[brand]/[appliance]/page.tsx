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
    <main>
      <nav className="text-sm text-[#6a6a64]">
        <Link href={`/fixcode/${brand}`}>{name}</Link> / {applianceName}
      </nav>
      <h1 className="mt-3 text-4xl">
        {name} {applianceName}
      </h1>
      <p className="mt-3 max-w-lg leading-7">Pick a code to see ranked causes, then start the interactive diagnosis.</p>
      <ul className="mt-8 grid gap-2">
        {errors.map((item) => (
          <li key={item.id}>
            <Link href={`/fixcode/${brand}/${appliance}/${item.code_slug}`} className="flex justify-between border border-[#e2ddd4] bg-[#fffcf7] px-4 py-3">
              <span>{item.code}</span>
              <span className="text-sm text-[#5c5c56]">{item.meaning}</span>
            </Link>
          </li>
        ))}
      </ul>
      {symptoms.length ? (
        <section className="mt-10">
          <h2 className="text-sm tracking-[0.14em] uppercase">Symptoms</h2>
          <ul className="mt-3 grid gap-2">
            {symptoms.map((item) => (
              <li key={item.id}>
                <Link href={`/fixcode/${brand}/${appliance}/${item.symptom_slug}`} className="block border border-[#e2ddd4] px-4 py-3">
                  {item.symptom}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
