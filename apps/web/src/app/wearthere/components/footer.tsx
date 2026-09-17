import Link from "next/link";
import { DESTINATIONS } from "@penta/wearthere";
import { FooterMeta } from "@/components/footer-meta";

export function WearthereFooter() {
  const list = [...DESTINATIONS].sort((a, b) => a.city.localeCompare(b.city)).slice(0, 18);
  return (
    <footer className="wt-footer">
      <div>
        <p className="text-xs uppercase tracking-[0.22em]">Editorial index</p>
        <p className="wt-serif mt-4 text-4xl leading-none">Wear<br />There</p>
      </div>
      <div className="wt-dest-list">
        {list.map((d) => (
          <Link key={d.id} href={`/wearthere/${d.slug}`}>
            {d.city}
          </Link>
        ))}
        <Link href="/wearthere">Explore all destinations →</Link>
      </div>
      <FooterMeta
        product="WearThere"
        homeHref="/wearthere"
        toolHref="/wearthere/trip"
        toolLabel="Plan a trip"
        note="Packing guidance uses typical climate patterns, not a live forecast. Check current conditions before departure."
      />
    </footer>
  );
}
