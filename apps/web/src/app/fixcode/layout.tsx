import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { CursorFollower, ScrollProgress } from "@/components/creative";
import { FixcodeFooter } from "./components/footer";
import { FixcodeHeader } from "./components/header";
import "./fixcode.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fixcode",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fixcode-mono",
});

export default function FixcodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${plex.variable} ${mono.variable} ${plex.className} fixcode-shell min-h-screen`}>
      <ScrollProgress className="text-[var(--fc-ink)]" />
      <CursorFollower label="Scan" color="#161513" />
      <FixcodeHeader />
      {children}
      <FixcodeFooter />
    </div>
  );
}
