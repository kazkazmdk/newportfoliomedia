import Link from "next/link";
import { ALL_ERRORS, APPLIANCES, BRANDS } from "@penta/fixcode";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { SafetyLegend } from "./system-ui";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

export function FixcodeFooter() {
  const families = [...new Set(ALL_ERRORS.map((item) => item.code[0] ?? "#"))].sort();

  return (
    <footer className="fc-manual">
      <div className="fc-manual-head">
        <p className="fc-manual-word">FixCode</p>
        <p>Industrial diagnostic index. Missing brands and codes stay missing.</p>
      </div>
      <div className="fc-manual-alpha" aria-label="Error families">
        {LETTERS.map((letter) => {
          const live = families.includes(letter);
          const sample = ALL_ERRORS.find((item) => item.code.startsWith(letter));
          return live && sample ? (
            <Link key={letter} href={`/fixcode/${sample.brand_slug}/${sample.appliance_slug}/${sample.code_slug}`}>{letter}</Link>
          ) : (
            <span key={letter}>{letter}</span>
          );
        })}
      </div>
      <div className="fc-manual-cols">
        <section>
          <p>Brands</p>
          <ul>
            {BRANDS.map((brand) => (
              <li key={brand.slug}><Link href={`/fixcode/${brand.slug}`}>{brand.name}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <p>Appliances</p>
          <ul>
            {APPLIANCES.map((item) => {
              const entry = ALL_ERRORS.find((error) => error.appliance_slug === item.slug);
              return (
                <li key={item.slug}>
                  {entry ? <Link href={`/fixcode/${entry.brand_slug}/${entry.appliance_slug}`}>{item.name}</Link> : item.name}
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <p>Systems / safety</p>
          <ul>
            <li><Link href="/fixcode#code-index">Error codes</Link></li>
            <li><Link href="/fixcode#appliance-index">Repair guides</Link></li>
            <li><Link href="/fixcode/diagnose">Troubleshooting</Link></li>
          </ul>
          <SafetyLegend />
        </section>
        <section>
          <p>Method</p>
          <ul>
            <li><Link href="/fixcode/diagnose">Methodology</Link></li>
            <li><Link href="/ops">Sources</Link></li>
            <li><Link href="/ops">Corrections</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><CookieSettingsButton /></li>
          </ul>
        </section>
      </div>
    </footer>
  );
}
