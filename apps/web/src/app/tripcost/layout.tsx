import { Barlow, IBM_Plex_Mono } from "next/font/google";
import { CursorFollower } from "@/components/creative";
import { TripcostFooter } from "./components/footer";
import { TripcostHeader } from "./components/header";
import "./tripcost.css";

const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tc-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-tc-mono" });

export default function TripcostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sans.variable} ${mono.variable} ${sans.className} tripcost min-h-screen`}>
      <CursorFollower label="Route" color="#0a1628" />
      <TripcostHeader />
      {children}
      <TripcostFooter />
    </div>
  );
}
