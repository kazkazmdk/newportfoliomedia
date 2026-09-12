import Link from "next/link";
import { APPLIANCES, BRANDS, ALL_ERRORS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { HomeForm } from "./home-form";

export const metadata = pageMeta({
  title: "FixCode — What's wrong?",
  description: "Show us the error code, a photo, or a symptom. Get a ranked diagnosis with risk and likely cost.",
  canonical: "/fixcode",
});

export default function FixcodeHome() {
  const popular = ALL_ERRORS.slice(0, 6);
  return (
    <main>
      <p className="text-sm text-[#6a6a64]">Appliance diagnostic engine</p>
      <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">What's wrong?</h1>
      <p className="mt-4 max-w-md text-[17px] leading-7 text-[#4f4f49]">
        Show us the code, the screen, or the symptom. We rank likely causes. We will say when we don't know.
      </p>
      <HomeForm />
      <section className="mt-16">
        <h2 className="text-sm tracking-[0.14em] uppercase text-[#6a6a64]">Popular problems</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {popular.map((item) => (
            <li key={item.id}>
              <Link
                href={`/fixcode/${item.brand_slug}/${item.appliance_slug}/${item.code_slug}`}
                className="flex items-baseline justify-between border border-[#e2ddd4] bg-[#fffcf7] px-4 py-3"
              >
                <span>
                  {item.brand} {item.appliance}
                </span>
                <span className="font-medium">{item.code}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {APPLIANCES.map((item) => (
          <div key={item.slug} className="border border-[#e6e1d8] px-3 py-4">
            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-sm text-[#6a6a64]">{item.blurb}</p>
          </div>
        ))}
      </section>
      <p className="mt-10 text-sm text-[#6a6a64]">
        Verified brands in this batch: {BRANDS.map((b) => b.name).join(", ")}. Missing brands are not invented.
      </p>
    </main>
  );
}
