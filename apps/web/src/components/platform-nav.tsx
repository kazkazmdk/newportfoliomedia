import Link from "next/link";

const LINKS = [
  ["/platform", "Overview"],
  ["/platform/keys", "API keys"],
  ["/platform/usage", "Usage"],
  ["/platform/widgets", "Widgets"],
  ["/platform/leads", "Leads"],
  ["/platform/data", "Data requests"],
  ["/platform/settings", "Settings"],
] as const;

export function PlatformNav({ current }: { current: string }) {
  return (
    <nav className="px-b2b-nav" aria-label="Local platform">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
