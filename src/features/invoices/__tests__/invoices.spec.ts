import { expect, test } from "@playwright/test";

const VALID_CUIT = "20123456786";
const CONSORCIO_ID = "550e8400-e29b-41d4-a716-446655440001";

async function loginAsAdmin(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

async function loginAsAccountant(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "contador");
  await page.fill('input[name="password"]', "contador123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

async function gotoInvoices(page: ReturnType<typeof test.info>["page"]) {
  await page.getByRole("link", { name: "Facturación" }).click();
  await page.waitForTimeout(500);
}

async function fillFacturaAForm(page: ReturnType<typeof test.info>["page"]) {
  await page.fill("#fa-consorcio", CONSORCIO_ID);
  await page.fill("#fa-cae", "12345678901234");
  await page.fill("#fa-cae-vencimiento", "2026-12-31");
  await page.fill("#fa-emisor-cuit", VALID_CUIT);
  await page.fill("#fa-emisor-razon", "Administracion Norte SA");
  await page.fill("#fa-emisor-domicilio", "Av. Corrientes 1234");
  await page.fill("#fa-emisor-inicio", "2020-01-01");
  await page.fill("#fa-receptor-cuit", VALID_CUIT);
  await page.fill("#fa-receptor-razon", "Juan Carlos López");
  await page.fill("#fa-receptor-domicilio", "Calle Falsa 123");
  await page.getByLabel("Descripcion item 1").fill("Mantenimiento ascensores");
  await page.getByLabel("Precio unitario item 1").fill("45000");
}

test.describe("Invoices BDD Scenarios", () => {
  test("[@happy-path][@role-guard] ADMIN sees invoices page with sidebar", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await expect(page.getByRole("heading", { name: "Facturación" })).toBeVisible();
    await expect(page.locator('a[href="/invoices/factura-a/new"]')).toBeVisible();
    await expect(page.locator('a[href="/invoices/factura-b/new"]')).toBeVisible();
    await expect(page.locator('a[href="/invoices/factura-c/new"]')).toBeVisible();
    await expect(page.locator('a[href="/invoices/recibos/new"]')).toBeVisible();
  });

  test("[@happy-path][@role-guard] ACCOUNTANT sees invoices page but not admin nav links", async ({
    page,
  }) => {
    await loginAsAccountant(page);
    await gotoInvoices(page);

    await expect(page).toHaveURL(/\/invoices/);
    await expect(page.getByRole("heading", { name: "Facturación" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Expensas" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Consorcios" })).not.toBeVisible();
  });

  test("[@happy-path] create Factura A redirects to detail with CAE", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-a/new"]').click();
    await page.waitForTimeout(500);

    await fillFacturaAForm(page);
    await page.getByRole("button", { name: "Emitir Factura A" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]{36}$/);
    await expect(page.getByText("CAE", { exact: true })).toBeVisible();
    await expect(page.getByText("CAE valido")).toBeVisible();
  });

  test("[@happy-path] create Factura B with CUIT for total >= $5000", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-b/new"]').click();
    await page.waitForTimeout(500);

    await page.fill("#fb-consorcio", CONSORCIO_ID);
    await page.fill("#fb-cae", "23456789012345");
    await page.fill("#fb-cae-vencimiento", "2026-12-31");
    await page.fill("#fb-emisor-cuit", VALID_CUIT);
    await page.fill("#fb-emisor-razon", "Administracion Norte SA");
    await page.fill("#fb-emisor-domicilio", "Av. Corrientes 1234");
    await page.fill("#fb-emisor-inicio", "2020-01-01");
    await page.getByLabel("Descripcion item 1").fill("Limpieza general");
    await page.getByLabel("Precio unitario item 1").fill("35000");
    await page.fill("#fb-receptor-cuit", VALID_CUIT);

    await page.getByRole("button", { name: "Emitir Factura B" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]{36}$/);
  });

  test("[@happy-path] create Factura C without CUIT", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-c/new"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator("#fc-receptor-cuit")).toHaveCount(0);

    await page.fill("#fc-consorcio", CONSORCIO_ID);
    await page.fill("#fc-cae", "34567890123456");
    await page.fill("#fc-cae-vencimiento", "2026-12-31");
    await page.fill("#fc-emisor-cuit", VALID_CUIT);
    await page.fill("#fc-emisor-razon", "Administracion Norte SA");
    await page.fill("#fc-emisor-domicilio", "Av. Corrientes 1234");
    await page.fill("#fc-emisor-inicio", "2020-01-01");
    await page.getByLabel("Descripcion item 1").fill("Servicio mensual");
    await page.getByLabel("Precio unitario item 1").fill("5000");

    await page.getByRole("button", { name: "Emitir Factura C" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/[0-9a-f-]{36}$/);
  });

  test("[@display] Factura B marks CUIT required when total >= $5000", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-b/new"]').click();
    await page.waitForTimeout(500);

    await page.getByLabel("Descripcion item 1").fill("Limpieza general");
    await page.getByLabel("Precio unitario item 1").fill("5000");
    await page.waitForTimeout(200);

    await expect(page.getByText("CUIT Receptor (requerido)")).toBeVisible();
    await expect(page.getByText(/El CUIT es obligatorio para montos/)).toBeVisible();
  });

  test("[@display] Factura B marks CUIT optional when total < $5000", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-b/new"]').click();
    await page.waitForTimeout(500);

    await page.getByLabel("Descripcion item 1").fill("Limpieza general");
    await page.getByLabel("Precio unitario item 1").fill("3000");
    await page.waitForTimeout(200);

    await expect(page.getByText("CUIT Receptor (opcional)")).toBeVisible();
    await expect(page.getByText(/El CUIT es obligatorio para montos/)).not.toBeVisible();
  });

  test("[@happy-path] view invoice detail with CAE and IVA breakdown", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText("12345678901234").first()).toBeVisible();
    await expect(page.getByText("Neto Gravado 21%")).toBeVisible();
    await expect(page.getByText("IVA 21%")).toBeVisible();
    await expect(page.getByText("Mantenimiento ascensores")).toBeVisible();
  });

  test("[@happy-path] ADMIN annuls invoice with DEC-002 confirmation dialog", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000002" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Anular" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Anular documento")).toBeVisible();
    await expect(page.getByText(/¿Anular esta factura\?/)).toBeVisible();

    await page.getByRole("alertdialog").getByRole("button", { name: "Anular" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText("Anulada")).toBeVisible();
    await expect(page.getByRole("button", { name: "Anular" })).not.toBeVisible();
  });

  test("[@role-guard] ACCOUNTANT does not see annul button on detail", async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText("Neto Gravado 21%")).toBeVisible();
    await expect(page.getByRole("button", { name: "Anular" })).not.toBeVisible();
  });

  test("[@happy-path] create Nota Credito linked to invoice", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("link", { name: "Crear Nota de Crédito" }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Nueva Nota de Credito")).toBeVisible();
    await expect(page.getByText("Comprobante asociado")).toBeVisible();
    await expect(page.getByText(/Monto disponible:/)).toBeVisible();

    await page.fill("#nota-cae", "98765432109876");
    await page.fill("#nota-cae-vencimiento", "2026-12-31");
    await page.getByLabel("Descripcion item 1").fill("Devolucion parcial");
    await page.getByLabel("Precio unitario item 1").fill("10000");

    await page.getByRole("button", { name: "Emitir Nota de Credito" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/550e8400-e29b-41d4-a716-446655440801$/);
  });

  test("[@validation] NC amount cannot exceed parent invoice remaining", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("link", { name: "Crear Nota de Crédito" }).click();
    await page.waitForTimeout(500);

    await page.fill("#nota-cae", "98765432109876");
    await page.fill("#nota-cae-vencimiento", "2026-12-31");
    await page.getByLabel("Descripcion item 1").fill("Devolucion total");
    await page.getByLabel("Precio unitario item 1").fill("60000");

    await page.getByRole("button", { name: "Emitir Nota de Credito" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/El monto supera el disponible/)).toBeVisible();
  });

  test("[@happy-path] create Nota Debito linked to invoice", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);

    await page.getByRole("link", { name: "0001-00000001" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("link", { name: "Crear Nota de Débito" }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Nueva Nota de Debito")).toBeVisible();

    await page.fill("#nota-cae", "87654321098765");
    await page.fill("#nota-cae-vencimiento", "2026-12-31");
    await page.getByLabel("Descripcion item 1").fill("Intereses punitorios");
    await page.getByLabel("Precio unitario item 1").fill("5000");

    await page.getByRole("button", { name: "Emitir Nota de Debito" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/550e8400-e29b-41d4-a716-446655440801$/);
  });

  test("[@happy-path] create Recibo with auto Recibo B type", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/recibos/new"]').click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Recibo B")).toBeVisible();

    await page.fill("#recibo-consorcio", CONSORCIO_ID);
    await page.fill("#recibo-referencia", "550e8400-e29b-41d4-a716-446655440801");
    await page.fill("#recibo-importe", "54450");

    await page.getByRole("button", { name: "Emitir Recibo" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/\/invoices\/recibos\/[0-9a-f-]{36}$/);
  });

  test("[@validation] Factura A form shows validation errors on empty submit", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-a/new"]').click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Emitir Factura A" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("El consorcio es requerido.")).toBeVisible();
    await expect(page.getByText("CUIT del receptor es requerido para Factura A.")).toBeVisible();
    await expect(
      page.getByText("Cada item debe tener descripcion y precio mayor a 0."),
    ).toBeVisible();
  });

  test("[@validation] Factura B requires CUIT for totals >= $5000 on submit", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoInvoices(page);
    await page.locator('a[href="/invoices/factura-b/new"]').click();
    await page.waitForTimeout(500);

    await page.fill("#fb-consorcio", CONSORCIO_ID);
    await page.fill("#fb-cae", "23456789012345");
    await page.fill("#fb-cae-vencimiento", "2026-12-31");
    await page.fill("#fb-emisor-cuit", VALID_CUIT);
    await page.fill("#fb-emisor-razon", "Administracion Norte SA");
    await page.fill("#fb-emisor-domicilio", "Av. Corrientes 1234");
    await page.fill("#fb-emisor-inicio", "2020-01-01");
    await page.getByLabel("Descripcion item 1").fill("Limpieza general");
    await page.getByLabel("Precio unitario item 1").fill("35000");

    await page.getByRole("button", { name: "Emitir Factura B" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("CUIT requerido para montos ≥ $5.000.")).toBeVisible();
  });
});
