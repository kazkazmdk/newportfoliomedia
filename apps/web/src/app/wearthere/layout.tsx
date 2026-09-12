import { Cormorant_Garamond, Outfit } from "next/font/google";
import Link from "next/link";
import "./wearthere.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-wt-serif" });
const sans = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-wt-sans" });

export default function WearthereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${serif.variable} ${sans.variable} ${sans.className} wearthere min-h-screen bg-[#f6ebe1] text-[#2a221c]`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/wearthere" className="font-[family-name:var(--font-wt-serif)] text-2xl">
          WearThere
        </Link>
        <Link href="/wearthere/tokyo/november/what-to-wear" className="text-sm">
          Tokyo in November
        </Link>
      </header>
      <div className="mx-auto w-full max-w-6xl px-6 pb-20">{children}</div>
    </div>
  );
}
