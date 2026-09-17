import Link from "next/link";
import { ALL_ERRORS, BRANDS } from "@penta/fixcode";
import { FooterMeta } from "@/components/footer-meta";
import { SafetyLegend } from "./system-ui";

export function FixcodeFooter() {
  const index = ALL_ERRORS.slice(0, 8);
  return (
    <footer className="fc-footer">
      <div>
        <p className="fc-kicker">Instrument index</p>
        <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--fc-mute)]">
          Diagnostic trees only. Missing brands and codes stay missing.
        </p>
      </div>
      <div className="fc-index">
        {index.map((item) => (
          <Link key={item.id} href={`/fixcode/${item.brand_slug}/${item.appliance_slug}/${item.code_slug}`}>
            <span>
              {item.brand} {item.appliance}
            </span>
            <span className="fixcode-mono">{item.code}</span>
          </Link>
        ))}
      </div>
      <div>
        <p className="fc-kicker">Coverage</p>
        <p className="mt-3 text-sm leading-7">
          {BRANDS.map((b) => b.name).join(" · ")}
        </p>
        <div className="mt-6">
          <SafetyLegend />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--fc-mute)]">
          Source trace lives with every diagnosis
        </p>
      </div>
      <FooterMeta
        product="FixCode"
        homeHref="/fixcode"
        toolHref="/fixcode/diagnose"
        toolLabel="Start diagnosis"
        note="Codes and diagnostic branches are evidence-scoped. Stop when the safety boundary says to stop."
      />
    </footer>
  );
}
