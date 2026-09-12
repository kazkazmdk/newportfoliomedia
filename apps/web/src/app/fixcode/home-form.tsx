"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HomeForm() {
  const router = useRouter();
  const [code, setCode] = useState("4C");
  const [brand, setBrand] = useState("samsung");
  const [appliance, setAppliance] = useState("washer");
  const [note, setNote] = useState("");

  function goDiagnose(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ brand, appliance, code, note });
    router.push(`/fixcode/diagnose?${params.toString()}`);
  }

  return (
    <div className="mt-10 grid gap-3">
      <form onSubmit={goDiagnose} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" className="border border-[#d8d3c8] bg-[#fffcf7] px-4 py-4 text-left" onClick={() => router.push("/fixcode/diagnose?mode=scan")}>
            <span className="block text-sm text-[#6a6a64]">Photo</span>
            Scan the error
          </button>
          <button type="submit" className="border border-[#1c1c1a] bg-[#1c1c1a] px-4 py-4 text-left text-[#f7f5f1]">
            <span className="block text-sm text-[#c9c7c0]">Typed</span>
            Enter a code
          </button>
          <button type="button" className="border border-[#d8d3c8] bg-[#fffcf7] px-4 py-4 text-left" onClick={() => router.push("/fixcode/samsung/washer/not-draining")}>
            <span className="block text-sm text-[#6a6a64]">Words</span>
            Describe the problem
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Brand
            <select className="fixcode-input" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="samsung">Samsung</option>
              <option value="lg">LG</option>
              <option value="bosch">Bosch</option>
              <option value="miele">Miele</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Appliance
            <select className="fixcode-input" value={appliance} onChange={(e) => setAppliance(e.target.value)}>
              <option value="washer">Washer</option>
              <option value="dishwasher">Dishwasher</option>
              <option value="dryer">Dryer</option>
              <option value="fridge">Fridge</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Error code
            <input className="fixcode-input" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Anything else you noticed
          <input className="fixcode-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. water never enters the drum" />
        </label>
        <button className="fixcode-btn w-fit" type="submit">
          Start diagnosis
        </button>
      </form>
    </div>
  );
}
