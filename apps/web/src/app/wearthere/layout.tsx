import { Manrope, Playfair_Display } from "next/font/google";
import { CursorFollower } from "@/components/creative";
import { ClimateShell } from "./components/climate-shell";
import { WearthereFooter } from "./components/footer";
import { WearthereHeader } from "./components/header";
import "./wearthere.css";

const serif = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-wt-serif" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-wt-sans" });

export default function WearthereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${serif.variable} ${sans.variable} ${sans.className}`}>
      <ClimateShell>
        <CursorFollower label="Look" color="#f4eadf" />
        <WearthereHeader />
        {children}
        <WearthereFooter />
      </ClimateShell>
    </div>
  );
}
