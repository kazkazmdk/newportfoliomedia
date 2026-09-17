import Link from "next/link";
import { ROUTES } from "@penta/tripcost";
import { FooterMeta } from "@/components/footer-meta";

export function TripcostFooter() {
  return (
    <footer className="tc-footer">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em]">Route network</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--tc-mute)]">
          Cash cost first. True cost optional. Fares on file are typical estimates unless labelled otherwise.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ROUTES.slice(0, 10).map((r) => (
          <li key={r.id}>
            <Link href={`/tripcost/${r.from.slug}/to/${r.to.slug}`} className="flex justify-between border-b border-[var(--tc-line)] py-2 text-sm">
              <span>
                {r.from.name} → {r.to.name}
              </span>
              <span className="tc-mono">{r.km} km</span>
            </Link>
          </li>
        ))}
      </ul>
      <FooterMeta
        product="TripCost"
        homeHref="/tripcost"
        toolHref="/tripcost"
        toolLabel="Compare a trip"
        note="Costs are modelled from declared assumptions unless a dated quote says otherwise. No result is presented as a live fare."
      />
    </footer>
  );
}
