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

test.describe("Layout BDD Scenarios", () => {
  test("[@happy-path][@role-guard] ADMIN sees all sidebar navigation links", async ({ page }) => {
    await loginAs(page, "ADMIN");

    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Consorcios" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Expensas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Facturación" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Deuda" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pagos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ing./Egr." })).toBeVisible();
  });

  test("[@happy-path][@role-guard] ACCOUNTANT only sees Facturación link", async ({ page }) => {
    await loginAs(page, "ACCOUNTANT");

    await expect(page.getByRole("link", { name: "Facturación" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inicio" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Consorcios" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Expensas" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Deuda" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Pagos" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Ing./Egr." })).not.toBeVisible();
  });

  test("[@happy-path] active link is highlighted on navigation", async ({ page }) => {
    await loginAs(page, "ADMIN");

    await page.getByRole("link", { name: "Expensas" }).click();
    await expect(page).toHaveURL("/expenses");

    const activeLink = page.getByRole("link", { name: "Expensas" });
    await expect(activeLink).toHaveClass(/bg-neutral-700/);

    const inactiveLink = page.getByRole("link", { name: "Inicio" });
    await expect(inactiveLink).not.toHaveClass(/bg-neutral-700/);
  });

  test("[@happy-path] consorcio selector shows active consorcio name", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.selectOption("select.rounded-md", { index: 1 });
    await page.waitForTimeout(200);

    await expect(page.getByText("Torre Norte")).toBeVisible();
  });

  test("[@empty-state] consorcio selector shows placeholder when none selected", async ({
    page,
  }) => {
    await loginAs(page, "ADMIN");

    await expect(page.getByRole("combobox")).toContainText("Seleccionar consorcio");
  });

  test("[@display] user menu shows name and role", async ({ page }) => {
    await loginAs(page, "ADMIN");

    await expect(page.getByText("Administrador General")).toBeVisible();
    await expect(page.getByText("ADMIN")).toBeVisible();
  });

  test("[@happy-path] logout from user menu redirects to login", async ({ page }) => {
    await loginAs(page, "ADMIN");

    await page.getByText("Salir").click();
    await expect(page).toHaveURL("/login");
  });

  test("[@display] breadcrumbs show correct path", async ({ page }) => {
    await loginAs(page, "ADMIN");

    await page.goto("/expenses/550e8400-e29b-41d4-a716-446655440701");
    await page.waitForTimeout(300);

    await expect(page.getByLabelText("Migas de pan")).toContainText("Inicio");
    await expect(page.getByLabelText("Migas de pan")).toContainText("Expensas");
    await expect(page.getByLabelText("Migas de pan")).toContainText("Detalle");
  });

  test("[@display] mobile sidebar opens with hamburger and closes on backdrop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await loginAs(page, "ADMIN");

    await expect(page.getByRole("link", { name: "Inicio" })).not.toBeVisible();

    await page.getByRole("button", { name: "Menú" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
    await expect(page.locator(".bg-black\\/50")).toBeVisible();

    await page.locator(".bg-black\\/50").click();
    await page.waitForTimeout(300);

    await expect(page.getByRole("link", { name: "Inicio" })).not.toBeVisible();
  });

  test("[@display] mobile sidebar closes after selecting a link", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await loginAs(page, "ADMIN");

    await page.getByRole("button", { name: "Menú" }).click();
    await page.waitForTimeout(300);

    await page.getByRole("link", { name: "Expensas" }).click();
    await page.waitForTimeout(300);

    await expect(page).toHaveURL("/expenses");
    await expect(page.getByRole("link", { name: "Inicio" })).not.toBeVisible();
  });

  test("[@display] health indicator shows green dot when service is online", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.waitForTimeout(2000);

    const indicator = page.locator("[title='Servicios operativos']");
    await expect(indicator).toBeVisible();
    await expect(indicator.locator(".bg-green-500")).toBeVisible();
  });

  test("[@display] desktop shows persistent sidebar without hamburger", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await loginAs(page, "ADMIN");

    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menú" })).not.toBeVisible();
  });
});
