import { expect, test } from "@playwright/test";

const TORRE_NORTE_ID = "550e8400-e29b-41d4-a716-446655440001";

async function loginAsAdmin(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill("input[name=username]", "admin");
  await page.fill("input[name=password]", "admin123");
  await page.click("button[type=submit]");
  await page.waitForTimeout(500);
}

test.describe("Consorcio BDD Scenarios", () => {
  test("[@happy-path] create consorcio successfully", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/consorcios/new");

    await page.fill("#cuit", "30711111112");
    await page.fill("#razon_social", "Consorcio Torre Sur");
    await page.fill("#nombre_fantasia", "Torre Sur");
    await page.fill("#matricula_caba", "MAT-2024-001235");
    await page.fill("#domicilio", "Av. Rivadavia 8500, CABA");
    await page.locator("form").getByRole("combobox").selectOption("RI");

    await page.getByRole("button", { name: /crear consorcio/i }).click();
    await page.waitForTimeout(500);

    await expect(page).not.toHaveURL(/\/consorcios\/new/);
    await expect(page.getByRole("heading", { name: /torre sur/i })).toBeVisible();
    await expect(page.getByText("Activo")).toBeVisible();
  });

  test("[@validation] duplicate CUIT shows error", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/consorcios/new");

    await page.fill("#cuit", "30711111111");
    await page.fill("#razon_social", "Consorcio Test");
    await page.getByRole("button", { name: /crear consorcio/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/ya.*registrado|already registered/i)).toBeVisible();
  });

  test("[@validation] invalid CUIT shows format error", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/consorcios/new");

    await page.fill("#cuit", "123");
    await page.fill("#razon_social", "Test");
    await page.getByRole("button", { name: /crear consorcio/i }).click();

    await expect(page.getByText(/cuit inválido/i)).toBeVisible();
  });

  test("[@happy-path] view consorcio detail", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);

    await expect(page.getByRole("heading", { name: /torre norte/i })).toBeVisible();
    await expect(page.getByText("CUIT: 30711111111").first()).toBeVisible();
    await expect(page.getByText("Unidades Funcionales")).toBeVisible();
    await expect(page.getByText("Propietarios")).toBeVisible();
    await expect(page.getByText("Períodos")).toBeVisible();
    await expect(page.getByRole("link", { name: /editar/i })).toBeVisible();
  });

  test("[@happy-path] edit consorcio", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/consorcios/${TORRE_NORTE_ID}/edit`);

    await page.fill("#nombre_fantasia", "Torre Norte Modificado");
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(`/consorcios/${TORRE_NORTE_ID}`);
    await expect(page.getByRole("heading", { name: /torre norte/i })).toBeVisible();
  });

  test("[@error-state] consorcio not found shows error", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/consorcios/00000000-0000-0000-0000-000000000000");

    await expect(page.getByText("Consorcio no encontrado")).toBeVisible();
    await expect(page.getByRole("link", { name: /volver a consorcios/i })).toBeVisible();
  });
});

test.describe("Period BDD Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("[@happy-path] open new fiscal period", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Períodos").click();
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: /abrir período/i }).click();
    await expect(page.locator("#code")).toBeVisible();

    await page.fill("#code", "202607");
    await page.fill("#start_date", "2026-07-01");
    await page.fill("#end_date", "2026-07-31");
    await page
      .locator(".bg-neutral-50")
      .getByRole("button", { name: /confirmar/i })
      .click();
    await page.waitForTimeout(800);

    await expect(page.getByText("202607")).toBeVisible();
  });

  test("[@happy-path] close an open period with confirmation", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Períodos").click();
    await page.waitForTimeout(300);

    const cerrarButton = page.getByRole("button", { name: /cerrar/i }).first();
    await cerrarButton.click();

    const dialog = page.getByRole("alertdialog");
    await dialog.waitFor({ state: "visible", timeout: 3000 });
    await expect(dialog.getByText(/cerrar el período 202606/i)).toBeVisible();

    await dialog.getByRole("button", { name: /confirmar/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Cerrado")).toBeVisible();
  });

  test("[@happy-path] archive a closed period with confirmation", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Períodos").click();
    await page.waitForTimeout(300);

    const archivarButton = page.getByRole("button", { name: /archivar/i }).first();
    await archivarButton.click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByText(/archivar el período 202605/i)).toBeVisible();

    await dialog.getByRole("button", { name: /confirmar/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText("Archivado")).toBeVisible();
  });

  test("[@error-state] closed period does not show Close button", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Períodos").click();
    await page.waitForTimeout(300);

    const row = page.locator("tr", { hasText: "202605" });
    await expect(row.getByRole("button", { name: /cerrar/i })).not.toBeVisible();
    await expect(row.getByRole("button", { name: /archivar/i })).toBeVisible();
  });
});

test.describe("Propietario BDD Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("[@happy-path] register a propietario", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}/propietarios/new`);

    await expect(page.getByLabel("Condición IVA")).toBeVisible();
    await page.fill("#tax_id", "20111111111");
    await page.fill("#nombre_completo", "Roberto Carlos Gómez");
    await page.getByLabel("Condición IVA").selectOption("RI");
    await page.fill("#email", "rgomez@email.com");
    await page.fill("#phone", "1155550201");
    await page.getByLabel(/es propietario/i).check();

    await page.getByRole("button", { name: /registrar propietario/i }).click();
    await page.waitForURL("**/consorcios/*?tab=propietarios**", { timeout: 5000 });
    await page
      .waitForResponse((resp) => resp.url().includes("/propietarios") && resp.status() === 200, {
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(1000);

    await expect(page.getByText("Roberto Carlos Gómez")).toBeVisible();
  });

  test("[@validation] invalid CUIT format shows error", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}/propietarios/new`);

    await page.fill("#tax_id", "12345");
    await page.fill("#nombre_completo", "Test");
    await page.getByRole("button", { name: /registrar propietario/i }).click();

    await expect(page.getByText(/cuit inválido/i)).toBeVisible();
  });

  test("[@happy-path] list propietarios for consorcio", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}?tab=propietarios`);
    await page.waitForTimeout(2000);

    await expect(page.getByText("Juan Carlos López")).toBeVisible();
    await expect(page.getByText("20123456781")).toBeVisible();
  });

  test("[@happy-path] search propietario by CUIT", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}?tab=propietarios`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder(/buscar por cuit/i).fill("20123456781");
    await page.getByLabel("Buscar").click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Juan Carlos López")).toBeVisible();
  });

  test("[@error-state] search propietario by CUIT not found", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}?tab=propietarios`);
    await page.waitForTimeout(2000);

    await page.getByPlaceholder(/buscar por cuit/i).fill("20999999991");
    await page.getByLabel("Buscar").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/no se encontró propietario/i)).toBeVisible();
  });

  test("[@happy-path] register an inquilino (not propietario)", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}/propietarios/new`);

    await page.selectOption("#tax_id_type", "DNI");
    await page.fill("#tax_id", "20123456789");
    await page.fill("#nombre_completo", "Inquilino Test");
    await page.fill("#email", "inquilino@test.com");
    await page.getByRole("button", { name: /registrar propietario/i }).click();
    await page.waitForURL("**/consorcios/*?tab=propietarios**", { timeout: 5000 });
    await page
      .waitForResponse((resp) => resp.url().includes("/propietarios") && resp.status() === 200, {
        timeout: 5000,
      })
      .catch(() => {});
    await page.waitForTimeout(1000);

    await expect(page.getByText("Inquilino Test")).toBeVisible();
  });
});

test.describe("UF BDD Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("[@happy-path] view UF configuration table", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Unidades Funcionales").click();
    await page.waitForTimeout(300);

    await expect(page.getByText("1A")).toBeVisible();
    await expect(page.getByText("1B")).toBeVisible();
    await expect(page.getByText("2A")).toBeVisible();
    await expect(page.getByText("100.00%").first()).toBeVisible();
  });

  test("[@validation] percentages exceeding 100% show warning", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Unidades Funcionales").click();
    await page.waitForTimeout(300);

    const input = page.getByRole("row", { name: /1A/ }).getByRole("spinbutton").first();
    await input.fill("80");
    await page.waitForTimeout(200);

    await expect(page.getByText(/grupo a.*140/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /guardar/i })).toBeDisabled();
  });

  test("[@validation] percentages below 100% show warning", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Unidades Funcionales").click();
    await page.waitForTimeout(300);

    const input = page.getByRole("row", { name: /1A/ }).getByRole("spinbutton").first();
    await input.fill("10");
    await page.waitForTimeout(200);

    await expect(page.getByText(/grupo a.*70/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /guardar/i })).toBeDisabled();
  });

  test("[@happy-path] edit UF percentages with valid sums", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Unidades Funcionales").click();
    await page.waitForTimeout(300);

    const row1A = page.getByRole("row", { name: /1A/ });
    const row2A = page.getByRole("row", { name: /2A/ });
    await row1A.getByRole("spinbutton").first().fill("45");
    await row2A.getByRole("spinbutton").first().fill("20");
    await page.waitForTimeout(200);

    await expect(page.getByRole("button", { name: /guardar/i })).toBeEnabled();
    await page.getByRole("button", { name: /guardar/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("button", { name: /guardar/i })).toBeEnabled();
  });

  test("[@happy-path] mark UF as exempt from a group", async ({ page }) => {
    await page.goto(`/consorcios/${TORRE_NORTE_ID}`);
    await page.getByText("Unidades Funcionales").click();
    await page.waitForTimeout(300);

    const row1B = page.getByRole("row", { name: /1B/ });
    await expect(row1B.getByText("EX")).toBeVisible();
  });
});
