import { pageMeta } from "@/lib/seo";
import { CheckForm } from "./check-form";

export const metadata = pageMeta({
  title: "ChargeMatch — What are you trying to connect?",
  description: "Device, charger, optional cable. Compatibility, port allocation, and confidence — not a review roundup.",
  canonical: "/chargematch",
});

export default function ChargematchHome() {
  return (
    <main>
      <p className="cm-mono text-xs tracking-[0.22em]">POWER COMPATIBILITY ENGINE</p>
      <h1 className="mt-4 text-5xl md:text-6xl">What are you trying to connect?</h1>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[#444]">
        Will it work? Then: make the kit smaller. We do not declare compatibility from a language model.
      </p>
      <CheckForm />
    </main>
  );
}
