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
    <main>
      <p className="text-sm text-[#6a6a64]">Brand hub</p>
      <h1 className="mt-2 text-4xl">{row.name}</h1>
      <p className="mt-3 max-w-lg leading-7">
        {errors.length} verified error trees. Missing codes are omitted on purpose.
      </p>
      <ul className="mt-8 grid gap-2">
        {appliances.map((appliance) => (
          <li key={appliance}>
            <Link className="border border-[#e2ddd4] bg-[#fffcf7] px-4 py-3 block" href={`/fixcode/${brand}/${appliance}`}>
              {row.name} {appliance}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
