import { describe, expect, it } from "vitest";
import { FOLIO_DESCRIPTION, FOLIO_TITLE } from "./folio-metadata";

describe("folio metadata", () => {
  it("uses a professional description rather than a developer placeholder", () => {
    expect(FOLIO_TITLE).toMatch(/Lissandre/);
    expect(FOLIO_DESCRIPTION.toLowerCase()).not.toContain("waiting to be replaced");
    expect(FOLIO_DESCRIPTION.length).toBeGreaterThan(40);
  });
});
