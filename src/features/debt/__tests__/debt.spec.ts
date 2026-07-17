import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

test.describe("Debt BDD — Liquidaciones", () => {
  test("[@happy-path] navigate to debt list via sidebar", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("heading", { name: "Deuda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generar Liquidacion" })).toBeVisible();
  });

  test("[@display] open generate modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("heading", { name: "Generar Liquidacion" })).toBeVisible();
    await expect(page.getByText("Unidad individual")).toBeVisible();
    await expect(page.getByText("Todas las UF")).toBeVisible();
  });

  test("[@happy-path] generate modal shows period and unit inputs", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);

    await expect(page.locator("#gen-period")).toBeVisible();
    await expect(page.locator("#gen-unit")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generar", exact: true })).toBeVisible();
  });

  test("[@display] batch mode shows info and generate button", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);

    await page.getByText("Todas las UF").click();
    await page.waitForTimeout(200);

    await expect(page.getByRole("button", { name: "Generar para todas las UF" })).toBeVisible();
  });

  test("[@happy-path] batch confirmation dialog appears", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Liquidacion" }).click();
    await page.waitForTimeout(300);

    await page.getByText("Todas las UF").click();
    await page.waitForTimeout(200);

    await page.locator("#gen-batch-period").fill("202606");
    await page.getByRole("button", { name: "Generar para todas las UF" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("heading", { name: "Generar liquidaciones" })).toBeVisible();
  });

  test("[@happy-path] navigate to certificados list via Deuda page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Certificados").click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("heading", { name: "Certificados de Deuda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generar Certificado" })).toBeVisible();
  });

  test("[@display] certificados generate dialog appears", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Certificados").click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Generar Certificado" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Generar Certificado de Deuda")).toBeVisible();
    await expect(page.locator("#cert-unit")).toBeVisible();
    await expect(page.locator("#cert-liq")).toBeVisible();
  });
  test("[@empty-state] certificados list shows empty message when no data", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Deuda" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Certificados").click();
    await page.waitForTimeout(500);

    await expect(page.getByText("No hay certificados de deuda.")).toBeVisible();
  });
});
