import Link from "next/link";
import { APPLIANCES, ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { pageMeta } from "@/lib/seo";
import { ViewportScene } from "@/components/creative";
import { HomeScanner } from "./components/home-scanner";

export const metadata = pageMeta({
  title: "FixCode — What's wrong?",
  description: "Show us the error code, a photo, or a symptom. Get a ranked diagnosis with risk and likely cost.",
  canonical: "/fixcode",
});

export default function FixcodeHome() {
  const popular = [...ALL_ERRORS].sort((a, b) => b.search_demand - a.search_demand).slice(0, 8);
  return (
    <main>
      <HomeScanner />
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Verified error trees</p>
        <h2 className="mt-4 max-w-xl text-4xl leading-none">The codes we can actually diagnose.</h2>
        <ol className="mt-10 grid gap-0 md:grid-cols-2">
          {popular.map((item, i) => (
            <li key={item.id}>
              <Link
                href={`/fixcode/${item.brand_slug}/${item.appliance_slug}/${item.code_slug}`}
                className="fc-hypo"
              >
                <span className="fixcode-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {item.brand} {item.appliance}
                </span>
                <span className="fixcode-mono">{item.code}</span>
              </Link>
            </li>
          ))}
        </ol>
      </ViewportScene>
      <ViewportScene className="fc-scene">
        <p className="fc-kicker">Appliances on file</p>
        <div className="mt-6 grid gap-8 md:grid-cols-4">
          {APPLIANCES.map((item) => (
            <article key={item.slug}>
              <p className="text-2xl">{item.name}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--fc-mute)]">{item.blurb}</p>
            </article>
          ))}
        </div>
        <p className="mt-12 text-sm text-[var(--fc-mute)]">
          Coverage: {BRANDS.length} brands verified ({BRANDS.map((b) => b.name).join(", ")}). Missing brands are not invented.
        </p>
      </ViewportScene>
    </main>
  );
}
