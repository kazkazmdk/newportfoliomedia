import { Fraunces, Outfit } from "next/font/google";
import Link from "next/link";
import "./autospec.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-as-display", weight: ["500", "600"] });
const sans = Outfit({ subsets: ["latin"], variable: "--font-as-sans", weight: ["400", "500", "600"] });

export default function AutospecLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable} ${sans.className} autospec min-h-screen bg-[#efe8dc] text-[#1b242c]`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/autospec" className="tracking-[0.18em] text-xs uppercase">
          AutoSpec
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/autospec/garage">My Garage</Link>
          <Link href="/autospec/bmw/3-series/g20/320d-b47">BMW 320d</Link>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl px-6 pb-20">{children}</div>
    </div>
  );
}
