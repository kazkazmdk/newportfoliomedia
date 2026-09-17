import Link from "next/link";

export function LegalShell({
  eyebrow,
  title,
  updated = "17 September 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-brand">Penta</Link>
        <nav aria-label="Legal navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>
      <main className="legal-main">
        <p className="legal-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated {updated}</p>
        <div className="legal-content">{children}</div>
      </main>
      <footer className="legal-footer">
        <p>© 2026 Penta · Independent decision support</p>
        <nav aria-label="Products">
          <Link href="/fixcode">FixCode</Link>
          <Link href="/autospec">AutoSpec</Link>
          <Link href="/wearthere">WearThere</Link>
          <Link href="/chargematch">ChargeMatch</Link>
          <Link href="/tripcost">TripCost</Link>
        </nav>
      </footer>
    </div>
  );
}
