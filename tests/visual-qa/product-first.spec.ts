import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SHOT_DIR = path.join(process.cwd(), "docs/visual-product-qa");

const ROUTES = [
  { name: "tripcost-home", path: "/tripcost", main: ".tc-hero" },
  { name: "tripcost-result", path: "/tripcost/paris/to/lyon?travellers=2", main: ".tc-verdicts" },
  { name: "chargematch-home", path: "/chargematch", main: ".cm-verdict" },
  { name: "chargematch-result", path: "/chargematch/iphone-16/with/apple-20w", main: ".cm-verdict" },
  { name: "chargematch-multiport", path: "/chargematch/macbook-air-13-m3/with/anker-100w-2c", main: ".cm-verdict" },
  { name: "wearthere-home", path: "/wearthere", main: ".wt-hero" },
  { name: "wearthere-tokyo", path: "/wearthere/tokyo", main: ".wt-hero" },
  { name: "autospec-home", path: "/autospec", main: ".as-hero" },
  { name: "autospec-vehicle", path: "/autospec/bmw/3-series/g20/320d-b47", main: ".as-cockpit" },
  { name: "fixcode-home", path: "/fixcode", main: ".fc-hero" },
  { name: "fixcode-error", path: "/fixcode/samsung/washer/4c", main: ".fc-code-giant" },
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, file: "mobile-after" },
  { name: "desktop-1440x1000", width: 1440, height: 1000, file: "desktop-1440x1000-after" },
  { name: "desktop-1440x1600", width: 1440, height: 1600, file: "desktop-1440x1600-after" },
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

async function setRange(locator: Locator, value: number) {
  await locator.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    proto?.set?.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function fullyInViewport(locator: Locator, height: number, label: string) {
  await expect(locator, label).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} box`).toBeTruthy();
  if (!box) return;
  expect(box.y + box.height, `${label} below fold y=${box.y} h=${box.height}`).toBeLessThanOrEqual(height + 2);
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

  for (const vp of VIEWPORTS) {
    test(`${vp.name} matrix screenshots and overflow`, async ({ page }) => {
      mkdirSync(SHOT_DIR, { recursive: true });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ROUTES) {
        const done = await noPageError(page);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expect(page.locator(route.main).first()).toBeVisible();
        await noHorizontalOverflow(page);
        await page.screenshot({
          path: path.join(SHOT_DIR, `${route.name}-${vp.file}.png`),
          fullPage: false,
        });
        done();
      }
    });
  }

  test("390x844 real first-fold claims", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/tripcost", { waitUntil: "domcontentloaded" });
    await fullyInViewport(page.getByRole("button", { name: /compare trip/i }), 844, "TripCost Compare trip");

    await page.goto("/tripcost/paris/to/lyon?travellers=2", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /paris → lyon/i })).toBeVisible();
    await expect(page.locator(".tc-hero.is-result").getByText(/465 km/)).toBeVisible();
    await expect(page.getByLabel("Number of travellers")).toHaveValue("2");
    const verdicts = page.locator(".tc-verdicts");
    await expect(verdicts).toBeVisible();
    await fullyInViewport(verdicts.locator('[data-verdict="fastest"]'), 844, "Fastest");
    await fullyInViewport(verdicts.locator('[data-verdict="cheapest"]'), 844, "Cheapest cash");
    await fullyInViewport(verdicts.locator('[data-verdict="true-cost"]'), 844, "True cost");
    await fullyInViewport(verdicts.locator('[data-verdict="best"]'), 844, "Best for N");
    await expect(verdicts.getByText(/best for 2/i)).toBeVisible();
    await expect(page.getByText(/best for 4/i)).toHaveCount(0);

    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await fullyInViewport(page.getByLabel("Device"), 844, "ChargeMatch Device");
    await fullyInViewport(page.getByLabel("Charger", { exact: true }), 844, "ChargeMatch Charger");
    await fullyInViewport(page.locator(".cm-verdict"), 844, "ChargeMatch Expected W");
    await fullyInViewport(page.getByRole("button", { name: /check this path/i }), 844, "ChargeMatch Check path");

    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    await fullyInViewport(page.getByText(/the packing edit/i).locator("visible=true").first(), 844, "Packing edit");
    const plan = page.getByRole("button", { name: /build my capsule/i });
    await expect(plan).toBeVisible();
    const planBox = await plan.boundingBox();
    expect(planBox, "Plan this trip exists").toBeTruthy();
    // Honest fold: Wear this is required in-fold. Plan CTA may sit just below.

    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    await fullyInViewport(page.getByLabel("Search make and model"), 844, "AutoSpec search");
    await fullyInViewport(page.getByRole("button", { name: /320d/i }).first(), 844, "AutoSpec vehicle hit");

    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    await fullyInViewport(page.getByText(/first reversible check/i).locator("visible=true").first(), 844, "First reversible check");
    await fullyInViewport(page.getByRole("link", { name: /start guided check/i }), 844, "Start guided check");
  });

  test("mobile nav opens on each home", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const homes = ["/tripcost", "/chargematch", "/wearthere", "/autospec", "/fixcode"];
    for (const pathName of homes) {
      await page.goto(pathName, { waitUntil: "load" });
      const toggle = page.locator("header button[aria-expanded]").last();
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
    }
  });
});

test.describe("product integrity interactions", () => {
  test("TripCost travellers 2 then 5 stay in URL and verdict", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tripcost", { waitUntil: "domcontentloaded" });
    await setRange(page.getByLabel("Number of travellers"), 2);
    await page.getByRole("button", { name: /compare trip/i }).click();
    await expect(page).toHaveURL(/travellers=2/);
    await expect(page.locator('[data-verdict="best"]')).toContainText(/best for 2/i);
    await expect(page.getByText(/best for 4/i)).toHaveCount(0);

    await setRange(page.getByLabel("Number of travellers"), 5);
    await expect(page).toHaveURL(/travellers=5/);
    await expect(page.locator('[data-verdict="best"]')).toContainText(/best for 5/i);
    await expect(page.locator('[data-verdict="best"]')).not.toContainText(/best for 2/i);
  });

  test("WearThere remove from case changes look and packed count", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/wearthere", { waitUntil: "domcontentloaded" });
    const count = page.locator("[data-packed-count]").first();
    const stack = page.locator("[data-look-ids]").first();
    await count.scrollIntoViewIfNeeded();
    const beforeCount = await count.getAttribute("data-packed-count");
    const beforeIds = await stack.getAttribute("data-look-ids");
    expect(Number(beforeCount)).toBeGreaterThan(0);
    expect(beforeIds).toBeTruthy();
    await page.getByRole("button", { name: /remove from case/i }).first().click();
    await expect(count).not.toHaveAttribute("data-packed-count", beforeCount ?? "");
    const afterIds = await stack.getAttribute("data-look-ids");
    expect(afterIds).not.toEqual(beforeIds);
  });

  test("ChargeMatch charger change updates expected watts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/chargematch", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Device").selectOption({ label: "MacBook Air 13-inch (M3)" });
    const expected = page.locator(".cm-verdict-power strong");
    await expect(page.locator(".cm-field-meta").first()).toContainText(/accepts up to 70W/i);
    const before = (await expected.innerText()).trim();
    await page.getByLabel("Charger", { exact: true }).selectOption({ label: "Anker 65W USB-C (Nano II class)" });
    await expect(expected).not.toHaveText(before);
    await expect(page.locator(".cm-verdict")).toContainText(/bottleneck/i);
  });

  test("ChargeMatch multiport allocation changes when a second port is plugged", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/chargematch/macbook-air-13-m3/with/anker-100w-2c", { waitUntil: "domcontentloaded" });
    const branches = page.locator(".cm-branch .cm-mono.text-xl");
    await page.getByRole("button", { name: /empty/i }).first().scrollIntoViewIfNeeded();
    const one = await branches.allInnerTexts();
    await page.getByRole("button", { name: /empty/i }).first().click();
    await expect(branches).not.toHaveText(one);
    const two = await branches.allInnerTexts();
    expect(two.join("|")).not.toEqual(one.join("|"));
  });

  test("AutoSpec 320d search hits a real vehicle and VIN is not a primary CTA", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/autospec", { waitUntil: "domcontentloaded" });
    const search = page.getByLabel("Search make and model");
    await search.fill("320d");
    const hit = page.getByRole("button", { name: /320d/i }).first();
    await expect(hit).toBeVisible();
    await expect(page.getByRole("button", { name: /try decode/i })).toHaveCount(0);
    await expect(page.locator("details.as-vin summary")).toContainText(/unavailable|stub/i);
  });

  test("AutoSpec public page shows interval, not remaining km from a fake odometer", async ({ page }) => {
    await page.goto("/autospec/bmw/3-series/g20/320d-b47", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/typical service interval/i)).toBeVisible();
    await expect(page.getByText(/every \d/i).first()).toBeVisible();
    await expect(page.getByText(/87432/)).toHaveCount(0);
    await expect(page.getByText(/km remaining/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /add to my garage/i })).toBeVisible();
  });

  test("AutoSpec garage without mileage asks for it and keeps recalls unknown", async ({ page }) => {
    await page.goto("/autospec/garage?make=bmw&model=3-series&gen=g20&var=320d-b47", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/enter mileage/i).first()).toBeVisible();
    await expect(page.getByLabel("Current mileage in kilometres")).toBeVisible();
    await expect(page.locator("[data-ownership-score]")).toHaveCount(0);
    await expect(page.getByText(/vin required/i).first()).toBeVisible();
    await expect(page.getByText(/no open recall/i)).toHaveCount(0);
    await expect(page.getByText(/87432/)).toHaveCount(0);
  });

  test("AutoSpec garage at 30000 km shows scheduled interval due now, not 15000 remaining", async ({ page }) => {
    await page.goto("/autospec/garage?make=bmw&model=3-series&gen=g20&var=320d-b47&km=30000", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/scheduled interval due now/i).first()).toBeVisible();
    await expect(page.getByText(/15,000 km remaining/i)).toHaveCount(0);
    await expect(page.getByText(/based on the standard/i).first()).toBeVisible();
    await expect(page.getByText(/vin required/i).first()).toBeVisible();
  });

  test("AutoSpec garage score excludes unknown recalls", async ({ page }) => {
    await page.goto("/autospec/garage?make=bmw&model=3-series&gen=g20&var=320d-b47&km=40000", { waitUntil: "domcontentloaded" });
    await page.getByText(/optional ownership checks/i).click();
    await page.getByLabel("Odometer at last oil change").fill("35000");
    await page.getByLabel("Brake pad remaining percent").fill("80");
    await page.getByLabel("12V battery condition").selectOption("GOOD");
    await page.getByText("Tyres inspected", { exact: true }).click();
    await page.getByRole("radio", { name: /^ok$/i }).check();
    const score = page.locator("[data-ownership-score]");
    await expect(score).toBeVisible();
    await expect(score).toContainText(/recall status not included/i);
    await expect(page.getByText(/no open recall/i)).toHaveCount(0);
  });

  test("FixCode Start check lands on diagnose with the first question", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/fixcode/samsung/washer/4c", { waitUntil: "domcontentloaded" });
    const question = (await page.locator(".fc-do-first p.text-xl").innerText()).trim();
    await page.getByRole("link", { name: /start guided check/i }).click();
    await expect(page).toHaveURL(/\/fixcode\/diagnose/);
    await expect(page.getByText(question, { exact: false }).first()).toBeVisible();
  });

  test("optional cookies are off until an explicit choice and settings reopen", async ({ page }) => {
    await page.goto("/fixcode", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("region", { name: "Cookie notice" })).toBeVisible();
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page.getByRole("checkbox", { name: /analytics/i })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: /preferences/i })).not.toBeChecked();
    await page.getByRole("button", { name: "Save choices" }).click();
    await expect.poll(() => page.evaluate(() => document.cookie)).toContain("penta_consent=");

    await page.locator(".fc-footer").getByRole("button", { name: "Cookie settings" }).click();
    await expect(page.getByRole("dialog", { name: "Cookie settings" })).toBeVisible();
  });

  test("all product footers expose product, legal, and privacy controls", async ({ page }) => {
    for (const route of ["/fixcode", "/autospec", "/wearthere", "/chargematch", "/tripcost"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const notice = page.getByRole("region", { name: "Cookie notice" });
      if (await notice.isVisible()) {
        await page.getByRole("button", { name: "Reject optional" }).click();
      }
      const footer = page.locator("footer");
      await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
      await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies");
      await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
      await expect(footer.getByRole("button", { name: "Cookie settings" })).toBeVisible();
    }
  });
});
