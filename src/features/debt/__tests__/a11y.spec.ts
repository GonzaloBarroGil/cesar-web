import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

async function a11yAudit(page: ReturnType<typeof test.info>["page"]) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe("Debt a11y audit", () => {
  test("[@a11y] debt list page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] generate modal open passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);
    await a11yAudit(page);
  });

  test("[@a11y] generate modal batch mode passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);

    await page.getByText("Todas las UF").click();
    await page.waitForTimeout(200);
    await a11yAudit(page);
  });

  test("[@a11y] certificados list page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Certificados").click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });
});
