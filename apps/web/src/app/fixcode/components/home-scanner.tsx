"use client";

import { ALL_ERRORS, ALL_SYMPTOMS, APPLIANCES, BRANDS } from "@penta/fixcode";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { MachineVisual, zoneFromText } from "./machine-visual";

export function HomeScanner() {
  const router = useRouter();
  const [code, setCode] = useState("4C");
  const [brand, setBrand] = useState("samsung");
  const [appliance, setAppliance] = useState("washer");
  const [edit, setEdit] = useState(false);
  const [path, setPath] = useState<"code" | "symptom">("code");
  const [symptom, setSymptom] = useState("");

  const symptoms = useMemo(
    () => ALL_SYMPTOMS.filter((item) => item.brand_slug === brand && item.appliance_slug === appliance),
    [brand, appliance],
  );
  const selectedSymptom = symptoms.find((item) => item.symptom_slug === symptom);
  const match = useMemo(
    () => ALL_ERRORS.find((e) => e.brand_slug === brand && e.appliance_slug === appliance && e.code.toLowerCase() === code.trim().toLowerCase()),
    [brand, appliance, code],
  );
  const zone = zoneFromText(`${code} ${selectedSymptom?.meaning ?? ""} ${match?.meaning ?? ""} ${match?.causes[0]?.name ?? ""}`);
  const brandName = BRANDS.find((item) => item.slug === brand)?.name ?? brand;
  const applianceName = APPLIANCES.find((item) => item.slug === appliance)?.name ?? appliance;

  function go(event: FormEvent) {
    event.preventDefault();
    if (path === "symptom") {
      if (!selectedSymptom) return;
      router.push(`/fixcode/${brand}/${appliance}/${selectedSymptom.symptom_slug}`);
      return;
    }
    const params = new URLSearchParams({ brand, appliance, code });
    router.push(`/fixcode/diagnose?${params.toString()}`);
  }

  return (
    <section className="fc-anatomy">
      <div className="fc-anatomy-machine">
        <p className="fc-kicker">{applianceName}</p>
        <MachineVisual zone={zone} ready={Boolean(match)} appliance={appliance} />
      </div>
      <form onSubmit={go} className="fc-anatomy-copy">
        <p className="fc-kicker">{match ? match.meaning : "Identify, then diagnose"}</p>
        <p className="fc-code-giant">{path === "code" ? code || "—" : "SY"}</p>
        <button type="button" className="fc-identity-line" onClick={() => setEdit((v) => !v)} aria-expanded={edit}>
          {brandName} / {applianceName} / {path === "code" ? code : selectedSymptom?.symptom || "symptom"}
        </button>
        {edit ? (
          <div className="fc-identity-edit">
            <label>
              Brand
              <select className="fc-select" value={brand} onChange={(e) => { setBrand(e.target.value); setSymptom(""); }}>
                {BRANDS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Appliance
              <select className="fc-select" value={appliance} onChange={(e) => { setAppliance(e.target.value); setSymptom(""); }}>
                {APPLIANCES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <div className="fc-path-switch" role="group" aria-label="How the fault appears">
              <button type="button" aria-pressed={path === "code"} onClick={() => setPath("code")}>Code</button>
              <button type="button" aria-pressed={path === "symptom"} onClick={() => setPath("symptom")} disabled={symptoms.length === 0}>Symptom</button>
            </div>
            {path === "code" ? (
              <label>
                Error code
                <input className="fc-input fixcode-mono" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
              </label>
            ) : (
              <label>
                Documented symptom
                <select className="fc-select" value={symptom} onChange={(e) => setSymptom(e.target.value)}>
                  <option value="">Choose a symptom on file</option>
                  {symptoms.map((item) => (
                    <option key={item.symptom_slug} value={item.symptom_slug}>{item.symptom}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ) : null}
        <button className="fc-run" type="submit">
          {path === "symptom" ? "Open symptom path" : "Start diagnosis"}
        </button>
        <p className="fc-form-note">
          {match ? `${match.brand} ${match.appliance} · verified tree` : "Unknown codes stay unknown."}
        </p>
      </form>
    </section>
  );
}
