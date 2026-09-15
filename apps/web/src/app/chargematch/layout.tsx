import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { CursorFollower } from "@/components/creative";
import { ChargematchFooter } from "./components/footer";
import { ChargematchHeader } from "./components/header";
import "./chargematch.css";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-cm-mono" });
const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-cm-sans" });

export default function ChargematchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${mono.variable} ${sans.variable} ${sans.className} chargematch min-h-screen`}>
      <CursorFollower label="Port" color="#11110f" />
      <ChargematchHeader />
      {children}
      <ChargematchFooter />
    </div>
  );
}
