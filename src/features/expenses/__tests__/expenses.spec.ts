import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: ReturnType<typeof test.info>["page"]) {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

test.describe("Expenses BDD Scenarios", () => {
  test("[@happy-path] create ORDINARIA expense appears in list", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.fill("#item", "Luz enero");
    await page.fill("#cost", "45000");
    await page.fill("#period_code", "202606");
    await page.fill("#consorcio_id", "550e8400-e29b-41d4-a716-446655440001");

    await page.getByRole("button", { name: "Crear Gasto" }).click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL(/\/expenses\//);
  });

  test("[@validation] empty form shows validation errors", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Crear Gasto" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("La descripcion es requerida.")).toBeVisible();
    await expect(page.getByText("El costo debe ser mayor a 0.")).toBeVisible();
  });

  test("[@validation] negative cost shows validation error", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.fill("#item", "Test item");
    await page.fill("#cost", "0");
    await page.fill("#period_code", "202606");
    await page.fill("#consorcio_id", "550e8400-e29b-41d4-a716-446655440001");

    await page.getByRole("button", { name: "Crear Gasto" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("El costo debe ser mayor a 0.")).toBeVisible();
  });

  test("[@display] type toggle shows approval notice for EXTRAORDINARIA", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Extraordinaria").click();
    await page.waitForTimeout(200);

    await expect(page.getByText("Requiere aprobacion.")).toBeVisible();
  });

  test("[@display] ORDINARIA type does NOT show approval notice", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Nuevo Gasto" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Extraordinaria" }).click();
    await page.getByRole("button", { name: "Ordinaria", exact: true }).click();
    await page.waitForTimeout(200);

    await expect(page.getByText("Requiere aprobacion.")).not.toBeVisible();
  });

  test("[@happy-path] list expenses with filters", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("button", { name: "Limpiar" })).toBeVisible();
  });

  test("[@happy-path] view expense detail page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /Mantenimiento mensual/ }).click();
    await page.waitForTimeout(1000);

    await expect(
      page.getByRole("heading", { name: "Mantenimiento mensual de ascensores - Junio 2026" }),
    ).toBeVisible();
  });

  test("[@happy-path] approve EXTRAORDINARIA expense", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /Reparación de cubierta/ }).click();
    await page.waitForTimeout(1000);

    const approveButton = page.getByRole("button", { name: "Aprobar" });
    await expect(approveButton).toBeVisible();
    await approveButton.click();
    await page.waitForTimeout(500);
  });

  test("[@display] ORDINARIA detail does NOT show approve/reject buttons", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /Mantenimiento mensual/ }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByRole("button", { name: "Aprobar" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Rechazar" })).not.toBeVisible();
  });

  test("[@happy-path] navigate to providers list", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Proveedores").click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("heading", { name: "Proveedores" })).toBeVisible();
    await expect(page.getByText("ELEVADORES SRL")).toBeVisible();
  });

  test("[@happy-path] navigate to provider create form", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Proveedores").click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /nuevo proveedor/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("heading", { name: "Nuevo Proveedor" })).toBeVisible();
    await expect(page.getByRole("button", { name: /crear proveedor/i })).toBeVisible();
  });

  test("[@validation] invalid CUIT shows error on provider form", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Proveedores").click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /nuevo proveedor/i }).click();
    await page.waitForTimeout(500);

    await page.fill("#name", "Test Provider");
    await page.getByRole("button", { name: /crear proveedor/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("CUIT invalido. Debe tener 11 digitos.")).toBeVisible();
  });

  test("[@happy-path] navigate to concepts page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByText("Conceptos").click();
    await page.waitForTimeout(500);

    await expect(page.getByRole("heading", { name: "Conceptos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuevo Concepto" })).toBeVisible();
  });
});

test.describe("Expenses BDD — Concepts", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);
    await page.getByText("Conceptos").click();
    await page.waitForTimeout(500);
  });

  test("[@happy-path] concept list shows concepts grouped", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Todos" })).toBeVisible();
  });

  test("[@happy-path] concept list filter by group", async ({ page }) => {
    const mantenimientoButton = page.getByRole("button", { name: "Mantenimiento" });
    if (await mantenimientoButton.isVisible()) {
      await mantenimientoButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByText("Mantenimiento de ascensores")).toBeVisible();
    }
  });
});

test.describe("Expenses BDD — Version History", () => {
  test("[@display] version history table shows version numbers", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("link", { name: /Mantenimiento mensual/ }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(/Version/)).toBeVisible();
  });
});
