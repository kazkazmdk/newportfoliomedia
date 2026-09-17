export type ErrorFamilyRule = {
  brand_slug: string;
  appliance_slug: string;
  canonical: string;
  aliases: string[];
};

/** Same official table row, different glyphs. Canonical keeps the PUBLISHABLE URL. */
export const ERROR_FAMILIES: ErrorFamilyRule[] = [
  { brand_slug: "samsung", appliance_slug: "washer", canonical: "4E", aliases: ["4C"] },
  { brand_slug: "samsung", appliance_slug: "washer", canonical: "5E", aliases: ["5C"] },
  { brand_slug: "samsung", appliance_slug: "washer", canonical: "OE", aliases: ["0E"] },
  { brand_slug: "samsung", appliance_slug: "washer", canonical: "UE", aliases: ["Ub", "UC"] },
  { brand_slug: "samsung", appliance_slug: "dishwasher", canonical: "4E", aliases: ["4C"] },
  { brand_slug: "samsung", appliance_slug: "dishwasher", canonical: "5E", aliases: ["5C"] },
  { brand_slug: "bosch", appliance_slug: "washer", canonical: "F17", aliases: ["E17"] },
  { brand_slug: "bosch", appliance_slug: "washer", canonical: "F18", aliases: ["E18"] },
  { brand_slug: "siemens", appliance_slug: "washer", canonical: "F17", aliases: ["E17"] },
  { brand_slug: "siemens", appliance_slug: "washer", canonical: "F18", aliases: ["E18"] },
];

export function canonicalErrorCode(brand: string, appliance: string, code: string): string {
  const hit = ERROR_FAMILIES.find(
    (row) =>
      row.brand_slug === brand &&
      row.appliance_slug === appliance &&
      (row.canonical.toLowerCase() === code.toLowerCase() ||
        row.aliases.some((alias) => alias.toLowerCase() === code.toLowerCase())),
  );
  return hit?.canonical ?? code;
}

export function isAliasError(brand: string, appliance: string, code: string): boolean {
  return ERROR_FAMILIES.some(
    (row) =>
      row.brand_slug === brand &&
      row.appliance_slug === appliance &&
      row.aliases.some((alias) => alias.toLowerCase() === code.toLowerCase()),
  );
}
