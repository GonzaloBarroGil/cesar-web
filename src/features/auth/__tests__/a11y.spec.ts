import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function loginAs(page: ReturnType<typeof test.info>["page"], role: "ADMIN" | "ACCOUNTANT") {
  const credentials = {
    ADMIN: { username: "admin", password: "admin123" },
    ACCOUNTANT: { username: "contador", password: "contador123" },
  };
  const cred = credentials[role];
  await page.goto("/login");
  await page.fill("input[name=username]", cred.username);
  await page.fill("input[name=password]", cred.password);
  await page.click("button[type=submit]");
  await page.waitForTimeout(500);
}

test.describe("Auth a11y audit", () => {
  test("[@a11y] login page passes accessibility check", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] login page with validation error passes accessibility check", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "wrong");
    await page.click("button[type=submit]");
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] login page loading state passes accessibility check", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(100);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] dashboard route passes accessibility check as ADMIN", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] invoices route passes accessibility check as ACCOUNTANT", async ({ page }) => {
    await loginAs(page, "ACCOUNTANT");
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
