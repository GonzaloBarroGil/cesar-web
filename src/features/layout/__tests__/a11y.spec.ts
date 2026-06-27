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

const PROTECTED_ROUTES = [
  { path: "/", label: "Panel de Control" },
  { path: "/consorcios", label: "Consorcios" },
  { path: "/expenses", label: "Expensas" },
  { path: "/invoices", label: "Facturación" },
  { path: "/debt", label: "Deuda" },
  { path: "/payments", label: "Pagos" },
  { path: "/incomes-outputs", label: "Ingresos/Egresos" },
];

function a11yScan(page: ReturnType<typeof test.info>["page"]) {
  return new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
}

test.describe("Layout a11y audit — Desktop", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`[@a11y] ${route.label} passes accessibility check (desktop)`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await loginAs(page, "ADMIN");
      await page.goto(route.path);
      await page.waitForTimeout(300);

      const results = await a11yScan(page);

      expect(results.violations).toEqual([]);
    });
  }

  test("[@a11y] mobile sidebar open passes accessibility check", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await loginAs(page, "ADMIN");

    await page.getByRole("button", { name: "Menú" }).click();
    await page.waitForTimeout(300);

    const results = await a11yScan(page);

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] mobile sidebar closed passes accessibility check", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await loginAs(page, "ADMIN");
    await page.waitForTimeout(300);

    const results = await a11yScan(page);

    expect(results.violations).toEqual([]);
  });

  test("[@a11y] consorcio selector empty state passes accessibility check", async ({ page }) => {
    await loginAs(page, "ADMIN");
    await page.evaluate(() => localStorage.removeItem("cesar_consorcio_id"));
    await page.reload();
    await page.waitForTimeout(300);

    const results = await a11yScan(page);

    expect(results.violations).toEqual([]);
  });
});
