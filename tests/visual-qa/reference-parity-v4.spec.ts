import { expect, test, type Page } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { findScenarioByBestMode } from "@penta/tripcost";

const ROOT = path.join(process.cwd(), "docs/reference-visual-rebuild-v4");
const CURRENT = path.join(ROOT, "current");
const REFERENCE = path.join(ROOT, "reference");
const COMPARISON = path.join(ROOT, "comparison");

const HOMES = [
  { name: "wearthere-home", path: "/wearthere", main: ".wt-stage", header: ".wt-issue", footer: ".wt-colophon", hero: ".wt-stage-photo img" },
  { name: "autospec-home", path: "/autospec", main: ".as-cinema", header: ".as-bay", footer: ".as-manual", hero: ".as-car-img" },
  { name: "chargematch-home", path: "/chargematch", main: ".cm-bench-scene", header: ".cm-bare", footer: ".cm-hw-footer", hero: ".cm-hw-img" },
  { name: "fixcode-home", path: "/fixcode", main: ".fc-anatomy", header: ".fc-console", footer: ".fc-manual", hero: ".fc-machine-photo" },
  { name: "tripcost-home", path: "/tripcost", main: ".tc-atlas", header: ".tc-planner", footer: ".tc-atlas-footer", hero: ".tc-realmap-canvas" },
];

const HOME_REFERENCES = [
  { name: "wearthere-home", url: "https://www.insideasiatours.com/month", role: "EDITORIAL" },
  { name: "autospec-home", url: "https://racing.porsche.com/", role: "EDITORIAL" },
  { name: "chargematch-home", url: "https://zaptec.com/", role: "EDITORIAL" },
  { name: "fixcode-home", url: "https://shinkei.systems/", role: "EDITORIAL" },
  { name: "tripcost-home", url: "https://www.madeforspainandportugal.com/", role: "EDITORIAL" },
];

const FEATURE_REFERENCES = [
  { name: "wearthere-feature", url: "https://www.insideasiatours.com/month", role: "EDITORIAL" },
  { name: "autospec-feature", url: "https://motorsports.porsche.com/international/en/category/cars/911-gt3-cup", role: "EDITORIAL" },
  { name: "chargematch-feature", url: "https://zaptec.com/en-gb/products/zaptec-go", role: "EDITORIAL" },
  { name: "fixcode-feature", url: "https://shinkei.systems/", role: "EDITORIAL" },
  { name: "tripcost-feature-editorial", url: "https://www.madeforspainandportugal.com/", role: "EDITORIAL" },
  { name: "tripcost-feature-functional", url: "https://www.rome2rio.com/map/Paris/Lyon", role: "FUNCTIONAL" },
];

function ensureDirs() {
  for (const dir of [CURRENT, REFERENCE, COMPARISON]) mkdirSync(dir, { recursive: true });
}

async function dismissCookies(page: Page) {
  const candidates = [
    page.getByRole("button", { name: /reject optional/i }),
    page.getByRole("button", { name: /reject all/i }),
    page.getByRole("button", { name: /only necessary/i }),
    page.getByRole("button", { name: /accept all/i }),
    page.locator("#onetrust-reject-all-handler"),
  ];
  for (const button of candidates) {
    if (await button.isVisible().catch(() => false)) {
      await button.click().catch(() => undefined);
      break;
    }
  }
}

async function settleVisual(page: Page) {
  await dismissCookies(page);
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const heroes = [...document.images].filter((img) =>
      img.closest(".wt-stage-photo, .as-car-photo, .cm-hw, .fc-machine-physical"),
    );
    await Promise.all(
      heroes.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          const ok = () => resolve();
          const fail = () => reject(new Error(`hero image failed ${img.currentSrc || img.src}`));
          img.addEventListener("load", ok, { once: true });
          img.addEventListener("error", fail, { once: true });
          window.setTimeout(() => {
            if (img.complete && img.naturalWidth > 0) resolve();
            else reject(new Error(`hero image timeout ${img.currentSrc || img.src}`));
          }, 4000);
        });
      }),
    );
  });
  const map = page.locator(".tc-realmap").first();
  if (await map.count()) {
    await expect(map).toHaveAttribute("data-map-status", /ready|failed/, { timeout: 12_000 }).catch(() => undefined);
  }
}

async function assertAppReady(page: Page, main: string) {
  await expect(page.locator(main).first()).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body.length, "app body text").toBeGreaterThan(40);
  const height = await page.evaluate(() => document.body.scrollHeight);
  expect(height, "app body height").toBeGreaterThan(500);
}

async function structuralMetrics(page: Page, selectors: { header: string; hero?: string | null }) {
  return page.evaluate((sel) => {
    const header = document.querySelector(sel.header);
    const h1 = document.querySelector("h1");
    const hero = sel.hero ? document.querySelector(sel.hero) : document.querySelector("main");
    const images = [...document.images];
    const imageArea = images.reduce((sum, img) => {
      const box = img.getBoundingClientRect();
      return sum + Math.max(0, box.width) * Math.max(0, box.height);
    }, 0);
    const headerBox = header?.getBoundingClientRect();
    const heroBox = hero?.getBoundingClientRect();
    const h1Box = h1?.getBoundingClientRect();
    const object = document.querySelector(".cm-object, .as-car-photo, .wt-stage-photo, .fc-machine, .tc-realmap");
    const objectBox = object?.getBoundingClientRect();
    const cta = document.querySelector("header input, header select, header button, .tc-planner-go, .cm-cta, .wt-cta, .tc-cta");
    const ctaBox = cta?.getBoundingClientRect();
    const firstResult = document.querySelector(".cm-verdict, .tc-atlas-decisions, .tc-result-hero, .as-plate, .wt-stage-pack, .fc-code-giant");
    const firstResultBox = firstResult?.getBoundingClientRect();
    const regions = [...document.querySelectorAll("header, .wt-stage, .as-cinema, .cm-bench-scene, .fc-anatomy, .tc-atlas, footer")]
      .filter((node) => node.getBoundingClientRect().height > 40);
    const fold = window.innerHeight;
    const bands = [...document.querySelectorAll("main > *, .tc-atlas > *, .wt-stage > *")]
      .map((node) => node.getBoundingClientRect())
      .filter((box) => box.height > 80 && box.top < fold);
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      headerHeight: headerBox?.height ?? 0,
      heroHeight: heroBox?.height ?? 0,
      heroVisualOccupancy: heroBox ? (heroBox.height * heroBox.width) / (window.innerWidth * window.innerHeight) : 0,
      imageAreaRatio: imageArea / (window.innerWidth * window.innerHeight),
      h1FontSize: h1 ? Number.parseFloat(getComputedStyle(h1).fontSize) : 0,
      h1Width: h1Box?.width ?? 0,
      h1FoldPosition: h1Box?.top ?? -1,
      mainProductObject: objectBox ? { x: objectBox.x, y: objectBox.y, width: objectBox.width, height: objectBox.height } : null,
      primaryCtaOrInput: ctaBox ? { x: ctaBox.x, y: ctaBox.y, width: ctaBox.width, height: ctaBox.height } : null,
      firstResultPosition: firstResultBox ? { top: firstResultBox.top, height: firstResultBox.height } : null,
      primaryVisualRegions: regions.length,
      majorWhitespaceBands: bands.length,
      cardDensity: document.querySelectorAll("article, .tc-verdict, .cm-object, .as-plate").length,
      mobileFoldKeyElements: window.innerWidth < 500
        ? {
            header: (headerBox?.bottom ?? 0) < fold,
            hero: (heroBox?.top ?? 9999) < fold,
            firstResult: firstResultBox ? firstResultBox.top < fold : false,
          }
        : null,
    };
  }, selectors);
}

async function shot(page: Page, file: string, fullPage = false) {
  await page.screenshot({ path: path.join(CURRENT, file), fullPage, animations: "disabled" });
}

async function validateReferencePage(page: Page) {
  const text = await page.locator("body").innerText().catch(() => "");
  const blocked = /access denied|cloudflare|just a moment|attention required|enable javascript|error 1020|blocked/i.test(text);
  const height = await page.evaluate(() => document.body.scrollHeight).catch(() => 0);
  const hasHero = await page.evaluate(() => {
    const imaged = [...document.images].some((img) => img.naturalWidth > 80 && img.getBoundingClientRect().height > 32);
    const structural = Boolean(document.querySelector("main, h1, video, canvas, [class*='hero' i], [class*='product' i], .maplibregl-map"));
    return imaged || structural;
  }).catch(() => false);
  if (blocked || text.length < 80 || height < 500 || !hasHero) {
    return { status: "NOT_VERIFIED" as const, textLength: text.length, height, hasHero, blocked };
  }
  return { status: "captured" as const, textLength: text.length, height, hasHero, blocked: false, finalUrl: page.url() };
}

test.describe("reference visual rebuild v4", () => {
  test("desktop fold / fullpage and mobile fold + structural metrics", async ({ page }) => {
    test.setTimeout(360_000);
    ensureDirs();
    const metrics: Record<string, unknown> = {};
    const matrix = [
      { name: "desktop-fold", width: 1440, height: 1000, full: false },
      { name: "desktop-fullpage", width: 1440, height: 1600, full: true },
      { name: "mobile-fold", width: 390, height: 844, full: false },
    ];
    for (const vp of matrix) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of HOMES) {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load", { timeout: 8_000 }).catch(() => undefined);
        await settleVisual(page);
        await assertAppReady(page, route.main);
        await expect(page.locator(route.header).first()).toBeVisible();
        if (vp.full) {
          await expect(page.locator(route.footer).first()).toBeVisible();
          const height = await page.evaluate(() => document.body.scrollHeight);
          expect(height, `${route.name} fullpage must exceed viewport`).toBeGreaterThan(vp.height);
        }
        metrics[`${route.name}-${vp.name}`] = await structuralMetrics(page, { header: route.header, hero: route.hero });
        await shot(page, `${route.name}-${vp.name}.png`, vp.full);
      }
    }
    const headers = HOMES.map((home) => home.header);
    expect(new Set(headers).size, "headers must not share one class").toBe(headers.length);
    const footers = HOMES.map((home) => home.footer);
    expect(new Set(footers).size, "footers must not share one class").toBe(footers.length);
    const structuralOk = Object.values(metrics).every((row) => {
      const item = row as { headerHeight?: number; heroHeight?: number };
      return (item.headerHeight ?? 0) > 20 && (item.heroHeight ?? 0) > 40;
    });
    await writeFile(path.join(ROOT, "METRICS.json"), JSON.stringify({
      generatedAt: new Date().toISOString(),
      note: "Structural DOM measurements only. Not a design score. REFERENCE_PARITY_PASS requires verified home+feature references, structural + regression pass, and MANUAL_VISUAL_STATUS=MANUAL_PASS.",
      REFERENCE_CAPTURE_PASS: false,
      STRUCTURAL_ALIGNMENT_PASS: structuralOk,
      REGRESSION_PASS: false,
      MANUAL_VISUAL_STATUS: "NOT_REVIEWED",
      REFERENCE_PARITY_PASS: false,
      metrics,
    }, null, 2));
  });

  test("product states and data-truth surfaces", async ({ page }) => {
    test.setTimeout(200_000);
    ensureDirs();
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    for (const month of ["Jan", "Jul", "Nov"] as const) {
      await page.getByRole("button", { name: new RegExp(`^${month}$`) }).click({ force: true });
      await expect(page.getByRole("button", { name: new RegExp(`^${month}$`) })).toHaveAttribute("aria-pressed", "true");
      await settleVisual(page);
      await shot(page, `wearthere-${month.toLowerCase()}.png`);
    }
    await page.getByRole("button", { name: /^Pack$/ }).click();
    await expect(page.locator(".wt-stage")).toHaveAttribute("data-view", "pack");
    await shot(page, "wearthere-pack.png");

    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    for (const zone of ["body", "engine", "tyres", "battery", "service"] as const) {
      await page.getByRole("button", { name: new RegExp(`^${zone}$`, "i") }).click();
      await expect(page.locator(".as-stage")).toHaveAttribute("data-zone", zone);
      if (zone !== "body") {
        await expect(page.locator(`.as-plate.is-${zone}`)).toBeVisible();
        await expect(page.locator(".as-class-label")).toContainText(/class reference/i);
      }
      await shot(page, `autospec-${zone}.png`);
    }

    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    const bench = page.locator(".cm-bench-scene");
    await bench.getByLabel("Device", { exact: true }).selectOption({ label: "iPhone 16" });
    await bench.getByLabel("Charger", { exact: true }).selectOption({ label: "Anker 65W USB-C (Nano II class)" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "device");
    await expect(page.locator(".cm-object.is-limit")).toContainText(/DEVICE/i);
    await shot(page, "chargematch-device-limited.png");

    await bench.getByLabel("Device", { exact: true }).selectOption({ label: "MacBook Pro 14-inch (M3)" });
    await bench.getByLabel("Charger", { exact: true }).selectOption({ label: "Apple 70W USB-C" });
    await page.getByRole("button", { name: /cable & port/i }).click();
    await bench.getByLabel("Cable").selectOption({ label: "Apple USB-C 60W" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "cable");
    await shot(page, "chargematch-cable-limited.png");

    await bench.getByLabel("Device", { exact: true }).selectOption({ label: "iPhone 16" });
    await bench.getByLabel("Charger", { exact: true }).selectOption({ label: "Apple 20W USB-C" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "port");
    await shot(page, "chargematch-charger-limited.png");

    await page.goto("/chargematch/macbook-air-13-m3/with/anker-100w-2c", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await shot(page, "chargematch-multiport.png");

    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    for (const id of ["source", "hose", "valve"] as const) {
      await page.locator(`[data-water-step-id="${id}"]`).click();
      await expect(page.locator(".fc-machine").first()).toHaveAttribute("data-water-step-active", id);
      await shot(page, `fixcode-${id}.png`);
    }

    await page.goto("/tripcost", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await expect(page.locator(".tc-map")).toHaveAttribute("data-map", "world");
    const corridorNote = (await page.locator(".tc-map-note").innerText()).toLowerCase();
    expect(corridorNote).toMatch(/connection corridor|great-circle/);
    expect(corridorNote.startsWith("road route")).toBe(false);
    expect(corridorNote).toMatch(/not a road route|not a filed flight|not turn-by-turn/);

    const notes: string[] = [];
    for (const mode of ["train", "car", "flight", "bus", "ev"] as const) {
      const scenario = findScenarioByBestMode(mode);
      if (!scenario) {
        await writeFile(path.join(CURRENT, `tripcost-${mode}.NOT_AVAILABLE.txt`), `${mode} dynamic state NOT AVAILABLE IN DATASET\n`);
        notes.push(`${mode}: NOT AVAILABLE IN DATASET`);
        continue;
      }
      await page.goto(`/tripcost/${scenario.from}/to/${scenario.to}?travellers=${scenario.travellers}`, { waitUntil: "domcontentloaded" });
      await settleVisual(page);
      await expect(page.locator(".tc-result-hero")).toHaveAttribute("data-best-mode", mode);
      await expect(page.locator(".tc-map")).toHaveAttribute("data-map", "world");
      await shot(page, `tripcost-${mode}.png`);
      notes.push(`${mode}: ${scenario.from} → ${scenario.to} travellers=${scenario.travellers}`);
    }
    await writeFile(path.join(CURRENT, "TRIPCOST_SCENARIOS.md"), notes.join("\n"));
  });
});

test.describe("official reference captures v4", () => {
  test("capture references without claiming verification on failure", async ({ page }) => {
    ensureDirs();
    test.setTimeout(240_000);
    const notes: string[] = [];
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const ref of [...HOME_REFERENCES, ...FEATURE_REFERENCES]) {
      try {
        await Promise.race([
          (async () => {
            const res = await page.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 12_000 });
            if (!res || !res.ok()) throw new Error(`status ${res?.status()}`);
            await Promise.race([page.waitForLoadState("networkidle"), page.waitForTimeout(1200)]);
            await dismissCookies(page);
            const check = await validateReferencePage(page);
            if (check.status !== "captured") {
              await writeFile(path.join(REFERENCE, `${ref.name}-desktop-1440x1000.UNAVAILABLE.txt`), `NOT_VERIFIED\n${ref.role}\n${ref.url}\n${JSON.stringify(check)}\n`);
              notes.push(`${ref.name}: NOT_VERIFIED ${ref.role}`);
              return;
            }
            await page.screenshot({ path: path.join(REFERENCE, `${ref.name}-desktop-1440x1000.png`), fullPage: false });
            notes.push(`${ref.name}: captured ${ref.role} ${page.url()}`);
          })(),
          page.waitForTimeout(18_000).then(() => {
            throw new Error("per-url timeout");
          }),
        ]);
      } catch (error) {
        await writeFile(path.join(REFERENCE, `${ref.name}-desktop-1440x1000.UNAVAILABLE.txt`), `NOT_VERIFIED\n${ref.role}\n${ref.url}\n${String(error)}\n`);
        notes.push(`${ref.name}: NOT_VERIFIED`);
      }
    }
    await writeFile(path.join(REFERENCE, "CAPTURE_LOG.md"), notes.join("\n"));
  });
});
