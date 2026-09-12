import { IBM_Plex_Mono, Geist } from "next/font/google";
import Link from "next/link";
import "./chargematch.css";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-cm-mono" });
const sans = Geist({ subsets: ["latin"], variable: "--font-cm-sans" });

export default function ChargematchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${mono.variable} ${sans.variable} ${sans.className} chargematch min-h-screen bg-[#f3f3f0] text-[#111]`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/chargematch" className="font-[family-name:var(--font-cm-mono)] text-sm tracking-[0.14em]">
          CHARGEMATCH
        </Link>
        <Link href="/chargematch/kit" className="text-sm">
          My Power Kit
        </Link>
      </header>
      <div className="mx-auto w-full max-w-5xl px-5 pb-16">{children}</div>
    </div>
  );
}
