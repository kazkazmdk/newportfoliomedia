import { Suspense } from "react";
import { Barlow, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { TripcostFooter } from "./components/footer";
import { TripcostHeader } from "./components/header";
import "./tripcost.css";

const sans = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tc-sans" });
const display = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-tc-display" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-tc-mono" });

export default function TripcostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sans.variable} ${display.variable} ${mono.variable} ${sans.className} tripcost min-h-screen`}>
      <Suspense fallback={<header className="tc-planner"><span className="tc-planner-mark">TripCost</span></header>}>
        <TripcostHeader />
      </Suspense>
      {children}
      <TripcostFooter />
    </div>
  );
}
