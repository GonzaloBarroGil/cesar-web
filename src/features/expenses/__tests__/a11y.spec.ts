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

test.describe("Expenses a11y audit", () => {
  test("[@a11y] expenses list page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] expenses list with filters applied passes accessibility check", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.locator("#filter-type").selectOption("EXTRAORDINARIA");
    await page.waitForTimeout(300);
    await a11yAudit(page);
  });

  test("[@a11y] create expense form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] create expense form with validation errors passes accessibility check", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Crear Gasto" }).click();
    await page.waitForTimeout(300);
    await a11yAudit(page);
  });

  test("[@a11y] expense detail page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /Mantenimiento mensual/ }).click();
    await page.waitForTimeout(1000);
    await a11yAudit(page);
  });

  test("[@a11y] concepts page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Conceptos").click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] concepts page filtered by group passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Conceptos").click();
    await page.waitForTimeout(500);

    const mantenimientoButton = page.getByRole("button", { name: "Mantenimiento" });
    if (await mantenimientoButton.isVisible()) {
      await mantenimientoButton.click();
      await page.waitForTimeout(300);
    }
    await a11yAudit(page);
  });

  test("[@a11y] providers page passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Proveedores").click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });

  test("[@a11y] provider create form passes accessibility check", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Proveedores").click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /nuevo proveedor/i }).click();
    await page.waitForTimeout(500);
    await a11yAudit(page);
  });
});
