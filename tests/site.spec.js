const { test, expect } = require("@playwright/test");

async function openNavigationIfNeeded(page) {
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  if (await menu.isVisible()) await menu.click();
}

test("direct pages expose metadata and persistent navigation", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Mathieu Gravey/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /researcher/i);
  await page.evaluate(() => { window.__barbaPersistenceCheck = "preserved"; });

  await openNavigationIfNeeded(page);
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page).toHaveTitle(/Projects/);
  const projectsMain = page.locator('main[data-barba-namespace="projects"]');
  await expect(projectsMain).toBeFocused();
  await expect(page.locator('main[data-barba="container"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.__barbaPersistenceCheck)).toBe("preserved");
  expect(errors).toEqual([]);
});

test("filters and popups are keyboard accessible", async ({ page }) => {
  await page.goto("/projects/");
  const filter = page.getByRole("button", { name: "Finished" });
  await filter.click();
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-filter-item]:visible").first()).toBeVisible();

  await page.goto("/");
  const portrait = page.getByRole("button", { name: "Mathieu Gravey" });
  await portrait.press("Enter");
  await expect(page.locator('.popup[aria-hidden="false"]')).toBeVisible();
  const olderPortrait = page.locator('.popup[aria-hidden="false"] img');
  const olderRatios = await olderPortrait.evaluate((image) => {
    const box = image.getBoundingClientRect();
    return {
      natural: image.naturalWidth / image.naturalHeight,
      rendered: box.width / box.height
    };
  });
  expect(Math.abs(olderRatios.natural - olderRatios.rendered)).toBeLessThan(0.02);
  await page.keyboard.press("Escape");
  await expect(page.locator('.popup[aria-hidden="true"]')).toBeHidden();
});

test("contact survey opens without blocking static navigation", async ({ page }) => {
  await page.goto("/contact/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("link", { name: "Unlock general email" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Viewpoints remains outside Barba", async ({ page }) => {
  await page.goto("/");
  await openNavigationIfNeeded(page);
  const viewpoints = page.getByLabel("Main navigation").getByRole("link", { name: "Viewpoints" });
  await expect(viewpoints).toHaveAttribute("data-barba-prevent", "all");
});

test("compact chrome, proportional portrait and experience symbols", async ({ page }) => {
  await page.goto("/");
  await openNavigationIfNeeded(page);
  const navigation = page.getByLabel("Main navigation");
  await expect(page.getByRole("button", { name: "More" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Experience", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "For Students", exact: true })).toBeVisible();

  const footerHeight = await page.locator(".site-footer").evaluate((footer) => footer.getBoundingClientRect().height);
  expect(footerHeight).toBeLessThanOrEqual(42);
  await expect(page.locator(".footer-right .social svg, .footer-right .social-mark")).toHaveCount(5);

  const portrait = page.locator(".about-photo");
  await expect(portrait).toBeVisible();
  const ratios = await portrait.evaluate((image) => {
    const box = image.getBoundingClientRect();
    return {
      natural: image.naturalWidth / image.naturalHeight,
      rendered: box.width / box.height
    };
  });
  expect(Math.abs(ratios.natural - ratios.rendered)).toBeLessThan(0.02);

  await navigation.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(page.locator(".experience-table").first()).toBeVisible();
  await expect(page.locator(".experience-table .cnum").first()).toBeVisible();
});

test("mobile navigation and reduced motion remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 840 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: "Research", exact: true }).click();
  await expect(page).toHaveURL(/\/research\/$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("Jekyll navigation remains available", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("href", "/projects/");
    await page.getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });
});
