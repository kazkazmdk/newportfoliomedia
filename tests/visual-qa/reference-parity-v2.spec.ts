import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "docs/reference-visual-rebuild-v2");
const CURRENT = path.join(ROOT, "current");
const REFERENCE = path.join(ROOT, "reference");
const COMPARISON = path.join(ROOT, "comparison");

const HOMES = [
  { name: "wearthere-home", path: "/wearthere", main: ".wt-stage", hero: ".wt-stage-photo img" },
  { name: "autospec-home", path: "/autospec", main: ".as-cinema", hero: ".as-car-img" },
  { name: "chargematch-home", path: "/chargematch", main: ".cm-bench-scene", hero: null },
  { name: "fixcode-home", path: "/fixcode", main: ".fc-anatomy", hero: null },
  { name: "tripcost-home", path: "/tripcost", main: ".tc-atlas", hero: null },
];

const DECISIONS = [
  { name: "wearthere-tokyo", path: "/wearthere/tokyo", main: ".wt-stage", hero: ".wt-stage-photo img" },
  { name: "autospec-vehicle", path: "/autospec/bmw/3-series/g20/320d-b47", main: ".as-cinema", hero: ".as-car-img" },
  { name: "chargematch-result", path: "/chargematch/iphone-16/with/apple-20w", main: ".cm-verdict", hero: null },
  { name: "fixcode-error", path: "/fixcode/samsung/washer/4c", main: ".fc-code-giant", hero: null },
  { name: "tripcost-result", path: "/tripcost/paris/to/lyon?travellers=2", main: ".tc-verdicts", hero: null },
];

const REFERENCES = [
  { name: "wearthere", url: "https://www.insideasiatours.com/month" },
  { name: "autospec", url: "https://racing.porsche.com/" },
  { name: "chargematch", url: "https://zaptec.com/" },
  { name: "fixcode", url: "https://shinkei.systems/" },
  { name: "tripcost", url: "https://www.madeforspainandportugal.com/" },
];

function ensureDirs() {
  for (const dir of [CURRENT, REFERENCE, COMPARISON]) mkdirSync(dir, { recursive: true });
}

async function dismissCookies(page: Page) {
  const notice = page.getByRole("region", { name: "Cookie notice" });
  if (await notice.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Reject optional" }).click().catch(() => undefined);
  }
}

async function settleVisual(page: Page) {
  await dismissCookies(page);
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((img) => {
        const hero = img.closest(".wt-stage-photo, .as-car-photo");
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

async function assertHeroReady(page: Page, selector: string | null) {
  if (!selector) return;
  const img = page.locator(selector).first();
  await expect(img).toBeVisible();
  const ready = await img.evaluate((node) => {
    const el = node as HTMLImageElement;
    return el.complete === true && el.naturalWidth > 0 && el.naturalHeight > 0;
  });
  expect(ready, `hero ${selector} must be fully decoded`).toBeTruthy();
}

async function shot(page: Page, file: string, fullPage = false) {
  await page.screenshot({ path: path.join(CURRENT, file), fullPage, animations: "disabled" });
}

function dataUri(file: string) {
  const buf = readFileSync(file);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function composeSideBySide(page: Page, leftFile: string, rightFile: string, outFile: string) {
  const left = dataUri(leftFile);
  const right = dataUri(rightFile);
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#111110;display:flex;gap:12px;align-items:start">
    <figure style="margin:0;flex:1;min-width:0"><figcaption style="color:#fff;font:12px sans-serif;padding:8px 10px;letter-spacing:.16em;text-transform:uppercase">Reference</figcaption><img src="${left}" style="width:100%;height:auto;display:block"></figure>
    <figure style="margin:0;flex:1;min-width:0"><figcaption style="color:#fff;font:12px sans-serif;padding:8px 10px;letter-spacing:.16em;text-transform:uppercase">Penta</figcaption><img src="${right}" style="width:100%;height:auto;display:block"></figure>
  </body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: outFile, fullPage: true });
}

test.describe("reference parity v2 captures", () => {
  test("desktop fold / tall / fullpage and mobile fold", async ({ page }) => {
    test.setTimeout(240_000);
    ensureDirs();
    const matrix = [
      { name: "desktop-fold", width: 1440, height: 1000, full: false },
      { name: "desktop-tall", width: 1440, height: 1600, full: false },
      { name: "desktop-fullpage", width: 1440, height: 1000, full: true },
      { name: "mobile-fold", width: 390, height: 844, full: false },
    ];
    for (const vp of matrix) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of [...HOMES, ...DECISIONS]) {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expect(page.locator(route.main).first()).toBeVisible();
        await settleVisual(page);
        await assertHeroReady(page, route.hero);
        await shot(page, `${route.name}-${vp.name}.png`, vp.full);
      }
    }
  });

  test("dynamic interaction states", async ({ page }) => {
    test.setTimeout(180_000);
    ensureDirs();
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await page.getByRole("button", { name: /^Nov$/ }).click();
    await settleVisual(page);
    await assertHeroReady(page, ".wt-stage-photo img");
    await shot(page, "wearthere-climate-nov.png");
    await page.getByRole("button", { name: /^Jul$/ }).click();
    await settleVisual(page);
    await assertHeroReady(page, ".wt-stage-photo img");
    await shot(page, "wearthere-climate-jul.png");
    await page.getByRole("button", { name: /^Pack$/ }).click();
    await expect(page.locator(".wt-stage-pack")).toBeVisible();
    await shot(page, "wearthere-pack.png");

    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await assertHeroReady(page, ".as-car-img");
    await shot(page, "autospec-body.png");
    for (const zone of ["engine", "tyres", "battery", "service"] as const) {
      await page.getByRole("button", { name: new RegExp(`^${zone}$`, "i") }).click();
      await expect(page.locator(".as-stage")).toHaveAttribute("data-zone", zone);
      await shot(page, `autospec-${zone}.png`);
    }

    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await shot(page, "chargematch-default.png");
    await page.getByLabel("Device").selectOption({ label: "iPhone 16" });
    await page.getByLabel("Charger", { exact: true }).selectOption({ label: "Anker 65W USB-C (Nano II class)" });
    await expect(page.locator(".cm-verdict")).toContainText(/bottleneck/i);
    await shot(page, "chargematch-device-limit.png");
    await page.getByRole("button", { name: /cable & port/i }).click();
    await page.getByLabel("Cable").selectOption({ index: 1 }).catch(() => undefined);
    await shot(page, "chargematch-cable-limit.png");

    await page.goto("/chargematch/macbook-air-13-m3/with/anker-100w-2c", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await shot(page, "chargematch-multiport-one.png");
    await page.getByRole("button", { name: /empty/i }).first().click();
    await shot(page, "chargematch-multiport-two.png");

    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    const steps = page.locator("[data-water-step]");
    for (let i = 0; i < 4; i += 1) {
      const step = steps.nth(i);
      if (await step.count()) {
        await step.scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
      }
      await shot(page, `fixcode-step-0${i + 1}.png`);
    }

    await page.goto("/tripcost/paris/to/lyon?travellers=2", { waitUntil: "domcontentloaded" });
    await settleVisual(page);
    await shot(page, "tripcost-train.png");
    await page.locator(".tc-path.is-train, .tc-map").first().waitFor();
    await page.getByLabel("Number of travellers").evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = "5";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await shot(page, "tripcost-car.png");
    await page.goto("/tripcost/paris/to/barcelona?travellers=1", { waitUntil: "domcontentloaded" }).catch(async () => {
      await page.goto("/tripcost/paris/to/lyon?travellers=1", { waitUntil: "domcontentloaded" });
    });
    await settleVisual(page);
    await shot(page, "tripcost-flight.png");
    await page.goto("/tripcost/paris/to/lyon?travellers=3", { waitUntil: "domcontentloaded" });
    await page.locator(".tc-be").scrollIntoViewIfNeeded();
    await shot(page, "tripcost-break-even.png");
  });

  test("true first-fold bounding boxes at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    await fullyIn(page.locator(".wt-city").first(), 844, "WearThere city");
    await fullyIn(page.locator(".wt-month-rail").first(), 844, "WearThere months");
    await fullyIn(page.locator(".wt-stage-climate, .wt-stage-pack").first(), 844, "WearThere climate/pack");
    await fullyIn(page.getByRole("button", { name: /build capsule/i }), 844, "WearThere CTA");

    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    await fullyIn(page.locator(".as-cinema h1, .as-cinema-copy h1").first(), 844, "AutoSpec identity");
    await fullyIn(page.locator(".as-car-photo").first(), 844, "AutoSpec vehicle");
    await fullyIn(page.locator(".as-zone-rail").first(), 844, "AutoSpec systems");

    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await fullyIn(page.locator(".cm-object.is-phone, .cm-pick.is-device").first(), 844, "ChargeMatch device object");
    await fullyIn(page.locator(".cm-object.is-brick, .cm-pick.is-charger").first(), 844, "ChargeMatch charger object");
    await fullyIn(page.locator(".cm-verdict").first(), 844, "ChargeMatch watts");
    await fullyIn(page.getByRole("button", { name: /check this path/i }), 844, "ChargeMatch action");

    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    await fullyIn(page.locator(".fc-code-giant").first(), 844, "FixCode code");
    await fullyIn(page.getByText(/first reversible check/i).locator("visible=true").first(), 844, "FixCode first action");
    const machine = page.locator(".fc-hero .fc-machine, .fc-stage .fc-machine").first();
    await expect(machine).toBeVisible();
    const machineBox = await machine.boundingBox();
    expect(machineBox, "FixCode machine box").toBeTruthy();
    if (machineBox) {
      expect(machineBox.y, "FixCode machine starts in fold").toBeLessThan(844);
    }

    await page.goto("/tripcost", { waitUntil: "domcontentloaded" });
    await fullyIn(page.locator(".tc-atlas-pair").first(), 844, "TripCost endpoints");
    await fullyIn(page.getByRole("button", { name: /compare trip/i }), 844, "TripCost edit/compare");
  });
});

test.describe("official reference captures", () => {
  test("capture official surfaces when reachable", async ({ page }) => {
    ensureDirs();
    test.setTimeout(180_000);
    const notes: string[] = [];
    for (const ref of REFERENCES) {
      for (const vp of [
        { name: "desktop-1440x1000", width: 1440, height: 1000 },
        { name: "desktop-1440x1600", width: 1440, height: 1600 },
        { name: "mobile-390x844", width: 390, height: 844 },
      ]) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        try {
          const res = await page.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 25_000 });
          if (!res || !res.ok()) throw new Error(`status ${res?.status()}`);
          await page.waitForTimeout(1200);
          const file = path.join(REFERENCE, `${ref.name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: false });
          notes.push(`${ref.name} ${vp.name}: captured ${ref.url}`);
        } catch (error) {
          const file = path.join(REFERENCE, `${ref.name}-${vp.name}.UNAVAILABLE.txt`);
          await writeFile(file, `NOT VERIFIED\n${ref.url}\n${String(error)}\n`);
          notes.push(`${ref.name} ${vp.name}: NOT VERIFIED`);
        }
      }
    }
    await writeFile(path.join(REFERENCE, "CAPTURE_LOG.md"), notes.join("\n"));
  });

  test("compose side-by-side when both sides exist", async ({ page }) => {
    ensureDirs();
    const pairs = [
      ["wearthere", "wearthere-home-desktop-fold.png"],
      ["autospec", "autospec-home-desktop-fold.png"],
      ["chargematch", "chargematch-home-desktop-fold.png"],
      ["fixcode", "fixcode-home-desktop-fold.png"],
      ["tripcost", "tripcost-home-desktop-fold.png"],
    ] as const;
    const decisionPairs = [
      ["wearthere", "wearthere-tokyo-desktop-fold.png", "wearthere-decision-desktop.png"],
      ["autospec", "autospec-vehicle-desktop-fold.png", "autospec-decision-desktop.png"],
      ["chargematch", "chargematch-result-desktop-fold.png", "chargematch-decision-desktop.png"],
      ["fixcode", "fixcode-error-desktop-fold.png", "fixcode-decision-desktop.png"],
      ["tripcost", "tripcost-result-desktop-fold.png", "tripcost-decision-desktop.png"],
    ] as const;
    for (const [ref, current] of pairs) {
      const left = path.join(REFERENCE, `${ref}-desktop-1440x1000.png`);
      const right = path.join(CURRENT, current);
      if (!existsSync(left) || !existsSync(right)) continue;
      await composeSideBySide(page, left, right, path.join(COMPARISON, `${ref}-home-desktop.png`));
    }
    const mobilePairs = [
      ["wearthere", "wearthere-home-mobile-fold.png"],
      ["autospec", "autospec-home-mobile-fold.png"],
      ["chargematch", "chargematch-home-mobile-fold.png"],
      ["fixcode", "fixcode-home-mobile-fold.png"],
      ["tripcost", "tripcost-home-mobile-fold.png"],
    ] as const;
    for (const [ref, current] of mobilePairs) {
      const left = path.join(REFERENCE, `${ref}-mobile-390x844.png`);
      const right = path.join(CURRENT, current);
      if (!existsSync(left) || !existsSync(right)) continue;
      await composeSideBySide(page, left, right, path.join(COMPARISON, `${ref}-home-mobile.png`));
    }
    for (const [ref, current, out] of decisionPairs) {
      const left = path.join(REFERENCE, `${ref}-desktop-1440x1000.png`);
      const right = path.join(CURRENT, current);
      if (!existsSync(left) || !existsSync(right)) continue;
      await composeSideBySide(page, left, right, path.join(COMPARISON, out));
    }
  });
});

async function fullyIn(locator: Locator, height: number, label: string) {
  await expect(locator, label).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} box`).toBeTruthy();
  if (!box) return;
  expect(box.y + box.height, `${label} below fold y=${box.y} h=${box.height}`).toBeLessThanOrEqual(height + 8);
}
