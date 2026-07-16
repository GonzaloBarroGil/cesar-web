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

test.describe("Invoices a11y audit", () => {
  test("[@a11y] invoices list page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] Factura A form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await page.locator('a[href="/invoices/factura-a/new"]').click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] Factura A form with validation errors passes accessibility check", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await page.locator('a[href="/invoices/factura-a/new"]').click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Emitir Factura A" }).click();
    await page.waitForTimeout(300);
    await a11yAudit(page);
  });

  test("[@a11y] Factura B form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await page.locator('a[href="/invoices/factura-b/new"]').click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] Factura C form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await page.locator('a[href="/invoices/factura-c/new"]').click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] invoice detail page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);
    await a11yAudit(page);
  });

  test("[@a11y] nota credito form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("link", { name: "Crear Nota de Crédito" }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] recibo form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Facturación" }).click();
    await page.waitForTimeout(500);
    await page.locator('a[href="/invoices/recibos/new"]').click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });
});
