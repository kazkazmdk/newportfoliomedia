import { Oswald, Source_Sans_3 } from "next/font/google";
import { CursorFollower } from "@/components/creative";
import { AutospecFooter } from "./components/footer";
import { AutospecHeader } from "./components/header";
import "./autospec.css";

const display = Oswald({ subsets: ["latin"], variable: "--font-as-display", weight: ["400", "500"] });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-as-sans", weight: ["400", "500", "600"] });

export default function AutospecLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable} ${sans.className} autospec min-h-screen`}>
      <CursorFollower label="Inspect" color="#101418" />
      <AutospecHeader />
      {children}
      <AutospecFooter />
    </div>
  );
}
