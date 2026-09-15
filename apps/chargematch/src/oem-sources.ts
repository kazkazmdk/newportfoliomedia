import { provenance, type ProvenanceRecord } from "@penta/data-provenance";

const RETRIEVED = "2026-09-15T00:00:00.000Z";

/** Manufacturer support articles verified this pass. Incomplete wattage tables stay PRIMARY_GENERAL. */
export const DEVICE_OEM_SOURCES: Record<string, ProvenanceRecord> = {
  "dev:iphone-16": provenance({
    source_id: "apple-iphone-16-tech-specs",
    source_type: "MANUFACTURER",
    source_name: "iPhone 16 - Tech Specs",
    source_url: "https://support.apple.com/en-us/121029",
    retrieved_at: RETRIEVED,
    confidence: 78,
    raw_value: "Fast-charge capable with 20W adapter or higher; MagSafe up to 25W with 30W adapter",
    normalized_value: "usb-c pd + magsafe 25w",
    verification_method: "MANUFACTURER_DOC",
    locator: {
      document_title: "iPhone 16 - Tech Specs",
      section: "Charging and Expansion",
      page: "support-article-121029",
    },
  }),
  "dev:iphone-15": provenance({
    source_id: "apple-iphone-charge-speeds",
    source_type: "MANUFACTURER",
    source_name: "About iPhone charge speeds",
    source_url: "https://support.apple.com/en-us/120619",
    retrieved_at: RETRIEVED,
    confidence: 76,
    raw_value: "USB-C Power Delivery for iPhone 15 and later; USB-A max 7.5W",
    normalized_value: "usb-c pd",
    verification_method: "MANUFACTURER_DOC",
    locator: {
      document_title: "About iPhone charge speeds",
      section: "Wired charging",
      page: "support-article-120619",
    },
  }),
};

export function deviceOemSource(deviceId: string): ProvenanceRecord | undefined {
  return DEVICE_OEM_SOURCES[deviceId];
}

export function deviceProvenanceList(deviceId: string, fallback: ProvenanceRecord): ProvenanceRecord[] {
  const oem = DEVICE_OEM_SOURCES[deviceId];
  return oem ? [oem, fallback] : [fallback];
}
