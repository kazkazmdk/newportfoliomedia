import { provenance, type ProvenanceRecord } from "@penta/data-provenance";
import type { ErrorProfile } from "./types";

const RETRIEVED = "2026-09-15T00:00:00.000Z";
const VERIFIED = "2026-09-15T00:00:00.000Z";

function exactOem(input: {
  brand: string;
  code: string;
  meaning: string;
  url: string;
  title: string;
  section: string;
  table?: string;
  page?: string;
}): ProvenanceRecord {
  return provenance({
    source_id: `${input.brand.toLowerCase()}-oem-exact:${input.code.toLowerCase()}`,
    source_type: "MANUFACTURER",
    source_name: input.title,
    source_url: input.url,
    retrieved_at: RETRIEVED,
    verified_at: VERIFIED,
    confidence: 92,
    raw_value: `${input.code} ${input.meaning}`,
    normalized_value: input.meaning,
    verification_method: "MANUFACTURER_DOC",
    locator: {
      document_title: input.title,
      section: input.section,
      table: input.table,
      page: input.page,
      publication_date: "2025-02-19",
    },
  });
}

const SAMSUNG_WASHER_TABLE = {
  url: "https://www.samsung.com/uk/support/home-appliances/what-do-the-codes-on-my-washing-machine-mean/",
  title: "What do the codes on my washing machine mean?",
  section: "Error code table",
  table: "washing-machine-error-codes",
  page: "support-article",
};

const SAMSUNG_4E_ARTICLE = {
  url: "https://www.samsung.com/uk/support/home-appliances/the-4e-error-is-displayed-on-the-panel-of-my-washing-machine-what-can-i-do/",
  title: "The 4E error is displayed on the panel of my washing machine. What can I do?",
  section: "4E / 4C water supply",
  page: "support-article",
};

const LG_WASHER_LIST = {
  url: "https://www.lg.com/us/support/help-library/lg-washer-error-code-list--20150140270078",
  title: "LG Washer Error Code List",
  section: "Error code list",
  table: "lg-washer-error-codes",
  page: "help-library",
};

const BOSCH_E15 = {
  url: "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dishwasher-error-e15",
  title: "Dishwasher error E15",
  section: "Water in the base / E15",
  page: "self-help",
};

/** Official table meanings that match our rows. Do not attach mismatched codes. */
const EXACT: Record<string, ProvenanceRecord> = {
  "samsung:washer:4c": exactOem({ brand: "Samsung", code: "4C", meaning: "Water supply error", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:4e": exactOem({ brand: "Samsung", code: "4E", meaning: "Water supply error", ...SAMSUNG_4E_ARTICLE }),
  "samsung:washer:4c2": exactOem({ brand: "Samsung", code: "4C2", meaning: "Hot / second inlet water supply", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:5e": exactOem({ brand: "Samsung", code: "5E", meaning: "Drain error", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:5c": exactOem({ brand: "Samsung", code: "5C", meaning: "Drain error", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:1e": exactOem({ brand: "Samsung", code: "1E", meaning: "Water level sensor", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:1c": exactOem({ brand: "Samsung", code: "1C", meaning: "Water level sensor", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:3e": exactOem({ brand: "Samsung", code: "3E", meaning: "Motor / hall sensor", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:3c": exactOem({ brand: "Samsung", code: "3C", meaning: "Motor error", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:8c": exactOem({ brand: "Samsung", code: "8C", meaning: "MEMS / vibration sensor", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:ue": exactOem({ brand: "Samsung", code: "UE", meaning: "Unbalanced load", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:ub": exactOem({ brand: "Samsung", code: "Ub", meaning: "Unbalanced load", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:he": exactOem({ brand: "Samsung", code: "HE", meaning: "Water temperature issue", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:hc": exactOem({ brand: "Samsung", code: "HC", meaning: "Water temperature issue", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:sud": exactOem({ brand: "Samsung", code: "Sud", meaning: "Too many suds", ...SAMSUNG_WASHER_TABLE }),
  "samsung:washer:dc1": exactOem({ brand: "Samsung", code: "DC1", meaning: "Additional door / door lock", ...SAMSUNG_WASHER_TABLE }),
  "lg:washer:oe": exactOem({ brand: "LG", code: "OE", meaning: "Drain error", ...LG_WASHER_LIST }),
  "lg:washer:ie": exactOem({ brand: "LG", code: "IE", meaning: "Water inlet error", ...LG_WASHER_LIST }),
  "lg:washer:ue": exactOem({ brand: "LG", code: "UE", meaning: "Unbalanced load", ...LG_WASHER_LIST }),
  "lg:washer:pe": exactOem({ brand: "LG", code: "PE", meaning: "Water level sensor", ...LG_WASHER_LIST }),
  "lg:washer:le": exactOem({ brand: "LG", code: "LE", meaning: "Motor locked", ...LG_WASHER_LIST }),
  "lg:washer:te": exactOem({ brand: "LG", code: "tE", meaning: "Thermistor error", ...LG_WASHER_LIST }),
  "lg:washer:de": exactOem({ brand: "LG", code: "dE", meaning: "Door error", ...LG_WASHER_LIST }),
  "lg:washer:fe": exactOem({ brand: "LG", code: "FE", meaning: "Overflow", ...LG_WASHER_LIST }),
  "bosch:dishwasher:e15": exactOem({
    brand: "Bosch",
    code: "E15",
    meaning: "Water in the base tray",
    ...BOSCH_E15,
  }),
};

export function exactOemKey(profile: Pick<ErrorProfile, "brand_slug" | "appliance_slug" | "code">): string {
  return `${profile.brand_slug}:${profile.appliance_slug}:${profile.code.toLowerCase()}`;
}

export function attachExactOem(profile: ErrorProfile): ErrorProfile {
  const hit = EXACT[exactOemKey(profile)];
  if (!hit) return profile;
  return {
    ...profile,
    provenance: [hit, ...profile.provenance.filter((p) => p.source_id !== hit.source_id)],
  };
}

export function exactOemCount(profiles: ErrorProfile[]): number {
  return profiles.filter((p) => EXACT[exactOemKey(p)]).length;
}

export const EXACT_OEM_KEYS = Object.keys(EXACT);
