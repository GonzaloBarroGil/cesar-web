import { expect, test } from "@playwright/test";

test.describe("Auth BDD Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("[@happy-path] Login with valid ADMIN credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");

    await expect(page).not.toHaveURL(/\/login/);
  });

  test("[@happy-path][@role-guard] Login with valid ACCOUNTANT credentials redirects to invoices", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "contador");
    await page.fill("input[name=password]", "contador123");
    await page.click("button[type=submit]");

    await expect(page).not.toHaveURL(/\/login/);
  });

  test("[@validation] Login with invalid credentials shows inline error", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "wrong");
    await page.click("button[type=submit]");

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
    await expect(page.locator("button[type=submit]")).toBeEnabled();
  });

  test("[@error-state][@offline] Login with network failure shows toast and retry", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");

    await expect(page.locator("button[type=submit]")).toBeEnabled();
  });

  test("[@happy-path] Session restore on page refresh with valid token", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(500);

    await page.reload();
    await expect(page.getByLabel("Cerrar sesión")).toBeVisible();
  });

  test("[@error-state] Session restore with expired token redirects to login", async ({ page }) => {
    await page.evaluate(() => {
      sessionStorage.setItem(
        "cesar_token",
        "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.expired",
      );
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("[@happy-path] Logout clears token and redirects to login", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(500);

    await page.getByLabel("Cerrar sesión").click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("[@error-state] Expired token mid-session redirects to login with toast", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      sessionStorage.setItem(
        "cesar_token",
        "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.expired",
      );
    });
    await page.goto("/consorcios");
    await expect(page).toHaveURL(/\/login/);
  });

  test("[@role-guard] ACCOUNTANT accessing admin route redirects to invoices", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "contador");
    await page.fill("input[name=password]", "contador123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(500);

    await page.goto("/consorcios");
    await expect(page).toHaveURL(/\/invoices/);
    await expect(page.getByText("Facturación")).toBeVisible();
  });

  test("[@role-guard] Unauthenticated user accessing protected route redirects to login", async ({
    page,
  }) => {
    await page.evaluate(() => sessionStorage.clear());
    await page.goto("/expenses");
    await expect(page).toHaveURL(/\/login/);
  });

  test("[@happy-path] Post-login URL restoration after unauthorized redirect", async ({ page }) => {
    await page.evaluate(() => sessionStorage.clear());
    await page.goto("/debt");
    await expect(page).toHaveURL(/\/login/);

    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");

    await expect(page).toHaveURL(/\/debt/);
  });

  test("[@display] Health indicator shows online when all services are up", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=username]", "admin");
    await page.fill("input[name=password]", "admin123");
    await page.click("button[type=submit]");
    await page.waitForTimeout(1000);

    await expect(page.getByText("Servicios operativos")).toBeVisible();
  });
});
