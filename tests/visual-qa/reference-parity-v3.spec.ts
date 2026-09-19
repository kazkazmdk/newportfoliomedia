import { expect, test, type Page } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { findScenarioByBestMode } from "@penta/tripcost";

const ROOT = path.join(process.cwd(), "docs/reference-visual-rebuild-v3");
const CURRENT = path.join(ROOT, "current");
const REFERENCE = path.join(ROOT, "reference");
const COMPARISON = path.join(ROOT, "comparison");

const HOMES = [
  { name: "wearthere-home", path: "/wearthere", main: ".wt-stage", hero: ".wt-stage-photo img" },
  { name: "autospec-home", path: "/autospec", main: ".as-cinema", hero: ".as-car-img" },
  { name: "chargematch-home", path: "/chargematch", main: ".cm-bench-scene", hero: ".cm-hw-img" },
  { name: "fixcode-home", path: "/fixcode", main: ".fc-anatomy", hero: null },
  { name: "tripcost-home", path: "/tripcost", main: ".tc-atlas", hero: null },
];

const DECISIONS = [
  { name: "wearthere-tokyo", path: "/wearthere/tokyo", main: ".wt-stage", hero: ".wt-stage-photo img" },
  { name: "autospec-vehicle", path: "/autospec/bmw/3-series/g20/320d-b47", main: ".as-cinema", hero: ".as-car-img" },
  { name: "chargematch-result", path: "/chargematch/iphone-16/with/apple-20w", main: ".cm-verdict", hero: ".cm-hw-img" },
  { name: "fixcode-error", path: "/fixcode/samsung/washer/4c", main: ".fc-code-giant", hero: null },
  { name: "tripcost-result", path: "/tripcost/paris/to/lyon?travellers=2", main: ".tc-result-hero", hero: null },
];

const HOME_REFERENCES = [
  { name: "wearthere-home", url: "https://www.insideasiatours.com/month" },
  { name: "autospec-home", url: "https://racing.porsche.com/" },
  { name: "chargematch-home", url: "https://zaptec.com/" },
  { name: "fixcode-home", url: "https://shinkei.systems/" },
  { name: "tripcost-home", url: "https://www.madeforspainandportugal.com/" },
];

const FEATURE_REFERENCES = [
  { name: "wearthere-feature", url: "https://www.insideasiatours.com/month" },
  { name: "autospec-feature", url: "https://motorsports.porsche.com/international/en/category/cars/911-gt3-cup" },
  { name: "chargematch-feature", url: "https://zaptec.com/en-gb/products/zaptec-go" },
  { name: "fixcode-feature", url: "https://shinkei.systems/" },
  { name: "tripcost-feature", url: "https://www.madeforspainandportugal.com/" },
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
    await Promise.all(
      [...document.images].map((img) => {
        const hero = img.closest(".wt-stage-photo, .as-car-photo, .cm-hw");
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          const ok = () => resolve();
          const fail = () => (hero ? reject(new Error(`hero image failed ${img.currentSrc || img.src}`)) : resolve());
          img.addEventListener("load", ok, { once: true });
          img.addEventListener("error", fail, { once: true });
          window.setTimeout(() => {
            if (img.complete && img.naturalWidth > 0) resolve();
            else if (hero) reject(new Error(`hero image timeout ${img.currentSrc || img.src}`));
            else resolve();
          }, 8000);
        });
      }),
    );
  });
}

async function assertAppReady(page: Page, main: string) {
  await expect(page.locator(main).first()).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body.length, "app body text").toBeGreaterThan(40);
  const height = await page.evaluate(() => document.body.scrollHeight);
  expect(height, "app body height").toBeGreaterThan(500);
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
    const structural = Boolean(document.querySelector("main, h1, video, canvas, [class*='hero' i], [class*='product' i]"));
    return imaged || structural;
  }).catch(() => false);
  if (blocked || text.length < 80 || height < 500 || !hasHero) {
    return { status: "NOT VERIFIED" as const, textLength: text.length, height, hasHero, blocked };
  }
  return { status: "captured" as const, textLength: text.length, height, hasHero, blocked: false, finalUrl: page.url() };
}

test.describe("reference parity v3 captures", () => {
  test("desktop fold / fullpage and mobile fold", async ({ page }) => {
    test.setTimeout(240_000);
    ensureDirs();
    const matrix = [
      { name: "desktop-fold", width: 1440, height: 1000, full: false },
      { name: "desktop-fullpage", width: 1440, height: 1000, full: true },
      { name: "mobile-fold", width: 390, height: 844, full: false },
    ];
    for (const vp of matrix) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of [...HOMES, ...DECISIONS]) {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => undefined);
        await settleVisual(page);
        await assertAppReady(page, route.main);
        if (vp.full) {
          const height = await page.evaluate(() => document.body.scrollHeight);
          expect(height, `${route.name} fullpage must exceed viewport`).toBeGreaterThan(vp.height);
        }
        await shot(page, `${route.name}-${vp.name}.png`, vp.full);
      }
    }
  });

  test("dynamic interaction states assert expected state", async ({ page }) => {
    test.setTimeout(180_000);
    ensureDirs();
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await page.getByRole("button", { name: /^Nov$/ }).click();
    await expect(page.getByRole("button", { name: /^Nov$/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".wt-stage")).toHaveAttribute("data-view", "climate");
    const novSrc = await page.locator(".wt-stage-photo img").first().getAttribute("src");
    expect(novSrc, "November hero src").toBeTruthy();
    await settleVisual(page);
    await shot(page, "wearthere-climate-nov.png");

    await page.getByRole("button", { name: /^Jul$/ }).click();
    await expect(page.getByRole("button", { name: /^Jul$/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".wt-stage")).toHaveAttribute("data-view", "climate");
    const julSrc = await page.locator(".wt-stage-photo img").first().getAttribute("src");
    expect(julSrc, "July hero must change from November").not.toBe(novSrc);
    await settleVisual(page);
    await shot(page, "wearthere-climate-jul.png");

    await page.getByRole("button", { name: /^Pack$/ }).click();
    await expect(page.locator(".wt-stage")).toHaveAttribute("data-view", "pack");
    await expect(page.locator(".wt-stage-pack")).toBeVisible();
    await expect(page.locator(".wt-stage-climate")).toHaveCount(0);
    await shot(page, "wearthere-pack.png");

    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await expect(page.locator(".as-stage")).toHaveAttribute("data-zone", "body");
    await shot(page, "autospec-body.png");
    for (const zone of ["engine", "tyres", "battery", "service"] as const) {
      await page.getByRole("button", { name: new RegExp(`^${zone}$`, "i") }).click();
      await expect(page.locator(".as-stage")).toHaveAttribute("data-zone", zone);
      await expect(page.locator(`.as-plate.is-${zone}`)).toBeVisible();
      if (zone === "engine") await expect(page.locator(".as-plate.is-engine")).toContainText(/B47|engine|identity/i);
      if (zone === "tyres") await expect(page.locator(".as-plate.is-tyres")).toContainText(/225|fitment|—/i);
      if (zone === "battery") await expect(page.locator(".as-plate.is-battery")).toContainText(/12V/i);
      if (zone === "service") await expect(page.locator(".as-plate.is-service")).toContainText(/interval|scheduled|unknown/i);
      await shot(page, `autospec-${zone}.png`);
    }

    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await page.getByLabel("Device").selectOption({ label: "iPhone 16" });
    await page.getByLabel("Charger", { exact: true }).selectOption({ label: "Anker 65W USB-C (Nano II class)" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "device");
    await shot(page, "chargematch-device-limit.png");

    await page.getByLabel("Device").selectOption({ label: "MacBook Pro 14-inch (M3)" });
    await page.getByLabel("Charger", { exact: true }).selectOption({ label: "Apple 70W USB-C" });
    await page.getByRole("button", { name: /cable & port/i }).click();
    await page.getByLabel("Cable").selectOption({ label: "Apple USB-C 60W" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "cable");
    await shot(page, "chargematch-cable-limit.png");

    await page.getByLabel("Device").selectOption({ label: "iPhone 16" });
    await page.getByLabel("Charger", { exact: true }).selectOption({ label: "Apple 20W USB-C" });
    await expect(page.locator(".cm-verdict")).toHaveAttribute("data-limit", "port");
    await shot(page, "chargematch-port-limit.png");

    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    const waterSteps = [
      ["source", "01"],
      ["hose", "02"],
      ["valve", "03"],
      ["control", "04"],
    ] as const;
    for (const [id, file] of waterSteps) {
      await page.locator(`[data-water-step-id="${id}"]`).click();
      await expect(page.locator(".fc-machine").first()).toHaveAttribute("data-water-step-active", id);
      await shot(page, `fixcode-step-${file}.png`);
    }

    const notes: string[] = [];
    for (const mode of ["train", "car", "flight", "bus", "ev"] as const) {
      const scenario = findScenarioByBestMode(mode);
      if (!scenario) {
        await writeFile(path.join(CURRENT, `tripcost-${mode}.NOT_AVAILABLE.txt`), `${mode} dynamic state NOT AVAILABLE IN DATASET\n`);
        notes.push(`${mode}: NOT AVAILABLE IN DATASET`);
        continue;
      }
      await page.goto(`/tripcost/${scenario.from}/to/${scenario.to}?travellers=${scenario.travellers}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => undefined);
      await settleVisual(page);
      await expect(page.locator(".tc-result-hero")).toHaveAttribute("data-best-mode", mode);
      await expect(page.locator(".tc-map")).toHaveAttribute("data-mode", mode);
      await shot(page, `tripcost-${mode}.png`);
      notes.push(`${mode}: ${scenario.from} → ${scenario.to} travellers=${scenario.travellers}`);
    }
    await writeFile(path.join(CURRENT, "TRIPCOST_SCENARIOS.md"), notes.join("\n"));
  });
});

test.describe("official reference captures v3", () => {
  test("capture home and feature references with acceptance checks", async ({ page }) => {
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
            await Promise.race([
              page.waitForLoadState("networkidle"),
              page.waitForTimeout(1200),
            ]);
            await dismissCookies(page);
            await Promise.race([
              page.evaluate(() => document.fonts?.ready),
              page.waitForTimeout(800),
            ]);
            const check = await validateReferencePage(page);
            const file = path.join(REFERENCE, `${ref.name}-desktop-1440x1000.png`);
            if (check.status !== "captured") {
              await writeFile(
                path.join(REFERENCE, `${ref.name}-desktop-1440x1000.UNAVAILABLE.txt`),
                `NOT VERIFIED\n${ref.url}\n${JSON.stringify(check)}\n`,
              );
              notes.push(`${ref.name}: NOT VERIFIED ${page.url()}`);
              return;
            }
            await page.screenshot({ path: file, fullPage: false });
            notes.push(`${ref.name}: captured ${page.url()} text=${check.textLength} height=${check.height}`);
          })(),
          page.waitForTimeout(18_000).then(() => {
            throw new Error("per-url timeout");
          }),
        ]);
      } catch (error) {
        await writeFile(path.join(REFERENCE, `${ref.name}-desktop-1440x1000.UNAVAILABLE.txt`), `NOT VERIFIED\n${ref.url}\n${String(error)}\n`);
        notes.push(`${ref.name}: NOT VERIFIED`);
      }
    }
    await writeFile(path.join(REFERENCE, "CAPTURE_LOG.md"), notes.join("\n"));
  });

  test("compose home and feature side-by-side when both sides exist", async ({ page }) => {
    ensureDirs();
    const pairs = [
      ["wearthere-home", "wearthere-home-desktop-fold.png", "wearthere-home-desktop.png"],
      ["autospec-home", "autospec-home-desktop-fold.png", "autospec-home-desktop.png"],
      ["chargematch-home", "chargematch-home-desktop-fold.png", "chargematch-home-desktop.png"],
      ["fixcode-home", "fixcode-home-desktop-fold.png", "fixcode-home-desktop.png"],
      ["tripcost-home", "tripcost-home-desktop-fold.png", "tripcost-home-desktop.png"],
      ["wearthere-feature", "wearthere-tokyo-desktop-fold.png", "wearthere-feature-desktop.png"],
      ["autospec-feature", "autospec-engine.png", "autospec-feature-desktop.png"],
      ["chargematch-feature", "chargematch-device-limit.png", "chargematch-feature-desktop.png"],
      ["fixcode-feature", "fixcode-step-01.png", "fixcode-feature-desktop.png"],
      ["tripcost-feature", "tripcost-train.png", "tripcost-feature-desktop.png"],
    ] as const;
    for (const [ref, current, out] of pairs) {
      const left = path.join(REFERENCE, `${ref}-desktop-1440x1000.png`);
      const right = path.join(CURRENT, current);
      if (!existsSync(left) || !existsSync(right)) continue;
      const leftUri = `data:image/png;base64,${(await import("node:fs")).readFileSync(left).toString("base64")}`;
      const rightUri = `data:image/png;base64,${(await import("node:fs")).readFileSync(right).toString("base64")}`;
      await page.setViewportSize({ width: 1600, height: 1100 });
      await page.setContent(`<!doctype html><html><body style="margin:0;background:#111110;display:flex;gap:12px;align-items:start">
        <figure style="margin:0;flex:1;min-width:0"><figcaption style="color:#fff;font:12px sans-serif;padding:8px 10px">${ref} reference</figcaption><img src="${leftUri}" style="width:100%;height:auto;display:block"></figure>
        <figure style="margin:0;flex:1;min-width:0"><figcaption style="color:#fff;font:12px sans-serif;padding:8px 10px">Penta</figcaption><img src="${rightUri}" style="width:100%;height:auto;display:block"></figure>
      </body></html>`);
      await page.screenshot({ path: path.join(COMPARISON, out), fullPage: true });
    }
  });
});
