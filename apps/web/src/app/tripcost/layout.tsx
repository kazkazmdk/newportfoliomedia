import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./tripcost.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tc-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-tc-mono" });

export default function TripcostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sans.variable} ${mono.variable} ${sans.className} tripcost min-h-screen bg-[#eef3f8] text-[#102033]`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/tripcost" className="text-sm font-medium tracking-tight">
          TripCost
        </Link>
        <Link href="/tripcost/paris/to/lyon" className="text-sm">
          Paris → Lyon
        </Link>
      </header>
      <div className="mx-auto w-full max-w-5xl px-5 pb-16">{children}</div>
    </div>
  );
}
