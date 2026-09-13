import { describe, expect, it } from "vitest";
import {
  canSendMessage,
  checkBrowserCapability,
  downloadPercent,
  getLanguageModelApi,
  inputPlaceholder,
  mapAvailability,
} from "./ai-capability";

describe("getLanguageModelApi", () => {
  it("returns null when the API is missing", () => {
    expect(getLanguageModelApi({})).toBeNull();
    expect(getLanguageModelApi({ LanguageModel: {} })).toBeNull();
  });

  it("returns the API only when availability and create exist", () => {
    const LanguageModel = {
      availability: async () => "available",
      create: async () => ({}),
    };
    expect(getLanguageModelApi({ LanguageModel })).toBe(LanguageModel);
  });
});

describe("checkBrowserCapability", () => {
  it("reports UNSUPPORTED when the constructor is absent", async () => {
    await expect(checkBrowserCapability({})).resolves.toBe("UNSUPPORTED");
  });

  it("maps unavailable / downloadable / available / readily", async () => {
    await expect(
      checkBrowserCapability({
        LanguageModel: {
          availability: async () => "unavailable",
          create: async () => ({}),
        },
      })
    ).resolves.toBe("UNAVAILABLE");
    await expect(
      checkBrowserCapability({
        LanguageModel: {
          availability: async () => "downloadable",
          create: async () => ({}),
        },
      })
    ).resolves.toBe("DOWNLOADABLE");
    await expect(
      checkBrowserCapability({
        LanguageModel: {
          availability: async () => "available",
          create: async () => ({}),
        },
      })
    ).resolves.toBe("AVAILABLE");
  });
});

describe("mapAvailability", () => {
  it("covers the Prompt API availability strings", () => {
    expect(mapAvailability("unavailable")).toBe("UNAVAILABLE");
    expect(mapAvailability("downloadable")).toBe("DOWNLOADABLE");
    expect(mapAvailability("downloading")).toBe("DOWNLOADING");
    expect(mapAvailability("available")).toBe("AVAILABLE");
    expect(mapAvailability("readily")).toBe("AVAILABLE");
  });
});

describe("downloadPercent", () => {
  it("accepts 0-1 ratios and loaded/total pairs", () => {
    expect(downloadPercent(0.63)).toBe(63);
    expect(downloadPercent(63, 100)).toBe(63);
  });
});

describe("send gating", () => {
  it("disables send before a session exists", () => {
    expect(
      canSendMessage({
        session: null,
        sending: false,
        creating: false,
        input: "hello",
      })
    ).toBe(false);
  });

  it("disables send while creating or sending or empty", () => {
    const session = {};
    expect(
      canSendMessage({ session, sending: true, creating: false, input: "hi" })
    ).toBe(false);
    expect(
      canSendMessage({ session, sending: false, creating: true, input: "hi" })
    ).toBe(false);
    expect(
      canSendMessage({ session, sending: false, creating: false, input: "  " })
    ).toBe(false);
    expect(
      canSendMessage({ session, sending: false, creating: false, input: "hi" })
    ).toBe(true);
  });
});

describe("inputPlaceholder", () => {
  it("asks the user to enable local AI before chatting", () => {
    expect(inputPlaceholder("AVAILABLE")).toMatch(/Enable local AI/i);
    expect(inputPlaceholder("READY")).toMatch(/Write a message/i);
  });
});
