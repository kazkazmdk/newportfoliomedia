import Link from "next/link";
import { APPLIANCES, ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { HomeScanner } from "./components/home-scanner";
import { SafetyLegend, SectionLabel, StateBadge } from "./components/system-ui";

export const metadata = pageMeta({
  title: "FixCode — What's wrong?",
  description: "Enter a confirmed appliance error code or symptom. Get an evidence-scoped diagnosis with risk and likely cost.",
  canonical: "/fixcode",
});

export default function FixcodeHome() {
  const popular = [...ALL_ERRORS].sort((a, b) => b.search_demand - a.search_demand).slice(0, 8);
  return (
    <main>
      <HomeScanner />
      <ViewportScene className="fc-scene fc-index-scene" id="code-index">
        <div className="fc-section-heading">
          <div>
            <SectionLabel number="02">Search verified error trees</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-4xl leading-none">Start from a code already on file.</h2>
          </div>
          <p className="fc-section-note">
            Ranked by current catalog demand. Every row stays scoped to a brand and appliance.
          </p>
        </div>
        <ol className="fc-code-grid mt-10">
          {popular.map((item, i) => (
            <li key={item.id}>
              <Link
                href={`/fixcode/${item.brand_slug}/${item.appliance_slug}/${item.code_slug}`}
                className="fc-hypo"
              >
                <span className="fixcode-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{item.brand} {item.appliance}</strong>
                  <small>{item.meaning}</small>
                </span>
                <span className="fc-code-token">{item.code}</span>
              </Link>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene" id="appliance-index">
        <div className="fc-section-heading">
          <div>
            <SectionLabel number="03">Browse the hierarchy</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-4xl leading-none">Identify before interpreting.</h2>
          </div>
          <SafetyLegend />
        </div>
        <div className="fc-appliance-grid mt-10">
          {APPLIANCES.map((item, index) => {
            const entry = ALL_ERRORS.find((error) => error.appliance_slug === item.slug);
            return (
              <article key={item.slug} className="fc-appliance-card">
                <span className="fc-card-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--fc-mute)]">{item.blurb}</p>
                </div>
                {entry ? (
                  <Link className="fc-inline-link" href={`/fixcode/${entry.brand_slug}/${entry.appliance_slug}`}>
                    Browse covered codes <span aria-hidden>↗</span>
                  </Link>
                ) : (
                  <StateBadge state="idle">No published tree</StateBadge>
                )}
              </article>
            );
          })}
        </div>
        <div className="fc-coverage-strip">
          <div>
            <p className="fc-kicker">Brand paths</p>
            <p className="mt-2 text-sm text-[var(--fc-mute)]">{BRANDS.length} brands with verified catalog records. Missing brands are not invented.</p>
          </div>
          <ul className="fc-brand-links" aria-label="Covered brands">
            {BRANDS.map((brand) => (
              <li key={brand.slug}><Link href={`/fixcode/${brand.slug}`}>{brand.name}</Link></li>
            ))}
          </ul>
        </div>
      </ViewportScene>
    </main>
  );
}
