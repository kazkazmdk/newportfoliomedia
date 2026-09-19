import Link from "next/link";
import { APPLIANCES, ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { HomeScanner } from "./components/home-scanner";

export const metadata = pageMeta({
  title: "FixCode — What's wrong?",
  description: "Enter a confirmed appliance error code or symptom. Get an evidence-scoped diagnosis with risk and likely cost.",
  canonical: "/fixcode",
});

export default function FixcodeHome() {
  const popular = [...ALL_ERRORS].sort((a, b) => b.search_demand - a.search_demand).slice(0, 10);
  return (
    <main>
      <HomeScanner />
      <ViewportScene className="fc-scene fc-index-scene" id="code-index">
        <p className="fc-kicker">Diagnostic atlas</p>
        <h2 className="mt-5 max-w-2xl text-4xl leading-none">Codes already on file.</h2>
        <ol className="fc-atlas">
          {popular.map((item) => (
            <li key={item.id}>
              <Link href={`/fixcode/${item.brand_slug}/${item.appliance_slug}/${item.code_slug}`}>
                <b className="fixcode-mono">{item.code}</b>
                <span>{item.brand} {item.appliance}</span>
                <small>{item.meaning}</small>
              </Link>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene" id="appliance-index">
        <p className="fc-kicker">Equipment families</p>
        <ul className="fc-family-list">
          {APPLIANCES.map((item) => {
            const entry = ALL_ERRORS.find((error) => error.appliance_slug === item.slug);
            return (
              <li key={item.slug}>
                {entry ? (
                  <Link href={`/fixcode/${entry.brand_slug}/${entry.appliance_slug}`}>
                    <strong>{item.name}</strong>
                    <span>{item.blurb}</span>
                  </Link>
                ) : (
                  <span>
                    <strong>{item.name}</strong>
                    <em>No published tree</em>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <ul className="fc-brand-links" aria-label="Covered brands">
          {BRANDS.map((brand) => (
            <li key={brand.slug}><Link href={`/fixcode/${brand.slug}`}>{brand.name}</Link></li>
          ))}
        </ul>
      </ViewportScene>
    </main>
  );
}
