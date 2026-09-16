import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SHOT_DIR = path.join(process.cwd(), "docs/visual-product-qa");

const ROUTES = [
  { name: "tripcost-home", path: "/tripcost", cta: /compare trip/i, main: ".tc-hero" },
  { name: "tripcost-result", path: "/tripcost/paris/to/lyon", cta: /best for/i, main: ".tc-verdicts" },
  { name: "chargematch-home", path: "/chargematch", cta: /check power/i, main: ".cm-expected" },
  { name: "chargematch-result", path: "/chargematch/iphone-16/with/apple-20w", cta: /expected/i, main: ".cm-result-bar" },
  { name: "chargematch-multiport", path: "/chargematch/macbook-air-13-m3/with/anker-100w-2c", cta: /how power splits|plugged/i, main: ".cm-hero" },
  { name: "wearthere-home", path: "/wearthere", cta: /plan this trip/i, main: ".wt-hero" },
  { name: "wearthere-tokyo", path: "/wearthere/tokyo", cta: /wear this|plan this trip/i, main: ".wt-hero" },
  { name: "autospec-home", path: "/autospec", cta: /what do|add /i, main: ".as-hero" },
  { name: "autospec-vehicle", path: "/autospec/bmw/3-series/g20/320d-b47", cta: /add to my garage|service/i, main: ".as-cockpit" },
  { name: "fixcode-home", path: "/fixcode", cta: /run diagnostic|diagnose/i, main: ".fc-hero" },
  { name: "fixcode-error", path: "/fixcode/samsung/washer/4c", cta: /do this first|next branch/i, main: ".fc-code-giant" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop-1440x1000", width: 1440, height: 1000 },
];

async function noPageError(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scroll: doc.scrollWidth, client: doc.clientWidth };
  });
  expect(overflow.scroll, `horizontal overflow ${overflow.scroll} > ${overflow.client}`).toBeLessThanOrEqual(
    overflow.client + 1,
  );
}

test.describe("product-first visual QA", () => {
  for (const route of ROUTES) {
    test(`${route.name} loads without runtime errors`, async ({ page }) => {
      const done = await noPageError(page);
      const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(res?.ok(), `${route.path} status`).toBeTruthy();
      await expect(page.locator(route.main).first()).toBeVisible();
      done();
    });
  }

  test("390x844 first viewport has primary CTA or result", async ({ page }) => {
    mkdirSync(SHOT_DIR, { recursive: true });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ROUTES) {
      const done = await noPageError(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await noHorizontalOverflow(page);
      const cta = page.getByText(route.cta).first();
      await expect(cta, `${route.path} CTA`).toBeVisible();
      const box = await cta.boundingBox();
      expect(box, `${route.path} CTA box`).toBeTruthy();
      if (box) {
        expect(box.y, `${route.path} CTA below fold`).toBeLessThan(844);
      }
      await page.screenshot({
        path: path.join(SHOT_DIR, `${route.name}-mobile-qa.png`),
        fullPage: false,
      });
      done();
    }
  });

  test("1440x1000 screenshots and main landmark", async ({ page }) => {
    mkdirSync(SHOT_DIR, { recursive: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page.locator(route.main).first()).toBeVisible();
      await noHorizontalOverflow(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `${route.name}-desktop-qa.png`),
        fullPage: false,
      });
    }
  });

  test("mobile nav opens on each home", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const homes = [
      { path: "/tripcost", button: /route/i, link: /compare|routes/i },
      { path: "/chargematch", button: /panel/i, link: /check|devices/i },
      { path: "/wearthere", button: /index/i, link: /destinations|capsule/i },
      { path: "/autospec", button: /menu/i, link: /garage|vehicle/i },
      { path: "/fixcode", button: /menu/i, link: /diagnose|errors/i },
    ];
    for (const home of homes) {
      await page.goto(home.path, { waitUntil: "domcontentloaded" });
      const toggle = page.getByRole("button", { name: home.button });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(page.getByRole("link", { name: home.link }).first()).toBeVisible();
    }
  });
});

test.describe("viewport matrix", () => {
  for (const vp of VIEWPORTS) {
    test(`tripcost home ${vp.name} CTA in first screen`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/tripcost", { waitUntil: "domcontentloaded" });
      const cta = page.getByRole("button", { name: /compare trip/i });
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      expect(box?.y ?? 9999).toBeLessThan(vp.height);
    });
  }
});
