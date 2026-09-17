import Link from "next/link";
import { CookieSettingsButton } from "./cookie-consent";

export function FooterMeta({
  product,
  note,
  homeHref,
  toolHref,
  toolLabel,
}: {
  product: string;
  note: string;
  homeHref: string;
  toolHref: string;
  toolLabel: string;
}) {
  return (
    <div className="penta-footer-meta">
      <div>
        <p className="penta-footer-product">{product}</p>
        <p className="penta-footer-note">{note}</p>
      </div>
      <nav className="penta-footer-legal" aria-label={`${product} legal`}>
        <Link href={homeHref}>Home</Link>
        <Link href={toolHref}>{toolLabel}</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/terms">Terms</Link>
        <CookieSettingsButton />
      </nav>
      <p className="penta-footer-copyright">
        © 2026 Penta · Independent decision support
      </p>
    </div>
  );
}
