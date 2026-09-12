import { IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./fixcode.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fixcode",
});

export default function FixcodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plex.variable} ${plex.className} fixcode-shell min-h-screen bg-[#f7f5f1] text-[#1c1c1a]`}>
      <header className="mx-auto flex max-w-3xl items-baseline justify-between px-5 py-6">
        <Link href="/fixcode" className="text-[15px] font-medium tracking-tight">
          FixCode
        </Link>
        <nav className="flex gap-5 text-sm text-[#5c5c56]">
          <Link href="/fixcode/samsung/washer">Washers</Link>
          <Link href="/ops">Sources</Link>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-3xl px-5 pb-16">{children}</div>
    </div>
  );
}
