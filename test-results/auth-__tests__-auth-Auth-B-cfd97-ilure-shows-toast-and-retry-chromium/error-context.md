# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/__tests__/auth.spec.ts >> Auth BDD Scenarios >> [@error-state][@offline] Login with network failure shows toast and retry
- Location: src/features/auth/__tests__/auth.spec.ts:36:3

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator: locator('button[type=submit]')
Expected: enabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeEnabled" with timeout 5000ms
  - waiting for locator('button[type=submit]')
    - locator resolved to <button disabled type="submit" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2 w-full">Iniciando sesión...</button>
    - unexpected value "disabled"

```

```yaml
- complementary:
  - text: CESAR
  - navigation:
    - link "Inicio":
      - /url: /
      - img
      - text: Inicio
    - link "Consorcios":
      - /url: /consorcios
      - img
      - text: Consorcios
    - link "Expensas":
      - /url: /expenses
      - img
      - text: Expensas
    - link "Facturación":
      - /url: /invoices
      - img
      - text: Facturación
    - link "Deuda":
      - /url: /debt
      - img
      - text: Deuda
    - link "Pagos":
      - /url: /payments
      - img
      - text: Pagos
    - link "Ing./Egr.":
      - /url: /incomes-outputs
      - img
      - text: Ing./Egr.
- banner:
  - img
  - combobox "Seleccionar consorcio":
    - option "Seleccionar consorcio" [selected]
    - option "Torre Norte"
  - img
  - text: Administrador General ADMIN
  - button "Cerrar sesión":
    - img
    - text: Salir
- main: Panel de Control — Próximamente
- contentinfo: CESAR v0.1.0 Servicios operativos
- region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Auth BDD Scenarios", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto("/");
  6   |   });
  7   | 
  8   |   test("[@happy-path] Login with valid ADMIN credentials redirects to dashboard", async ({ page }) => {
  9   |     await page.goto("/login");
  10  |     await page.fill("input[name=username]", "admin");
  11  |     await page.fill("input[name=password]", "admin123");
  12  |     await page.click("button[type=submit]");
  13  | 
  14  |     await expect(page).not.toHaveURL(/\/login/);
  15  |   });
  16  | 
  17  |   test("[@happy-path][@role-guard] Login with valid ACCOUNTANT credentials redirects to invoices", async ({ page }) => {
  18  |     await page.goto("/login");
  19  |     await page.fill("input[name=username]", "contador");
  20  |     await page.fill("input[name=password]", "contador123");
  21  |     await page.click("button[type=submit]");
  22  | 
  23  |     await expect(page).not.toHaveURL(/\/login/);
  24  |   });
  25  | 
  26  |   test("[@validation] Login with invalid credentials shows inline error", async ({ page }) => {
  27  |     await page.goto("/login");
  28  |     await page.fill("input[name=username]", "admin");
  29  |     await page.fill("input[name=password]", "wrong");
  30  |     await page.click("button[type=submit]");
  31  | 
  32  |     await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  33  |     await expect(page.locator("button[type=submit]")).toBeEnabled();
  34  |   });
  35  | 
  36  |   test("[@error-state][@offline] Login with network failure shows toast and retry", async ({ page }) => {
  37  |     await page.goto("/login");
  38  |     await page.fill("input[name=username]", "admin");
  39  |     await page.fill("input[name=password]", "admin123");
  40  |     await page.click("button[type=submit]");
  41  | 
> 42  |     await expect(page.locator("button[type=submit]")).toBeEnabled();
      |                                                       ^ Error: expect(locator).toBeEnabled() failed
  43  |   });
  44  | 
  45  |   test("[@happy-path] Session restore on page refresh with valid token", async ({ page }) => {
  46  |     await page.goto("/login");
  47  |     await page.fill("input[name=username]", "admin");
  48  |     await page.fill("input[name=password]", "admin123");
  49  |     await page.click("button[type=submit]");
  50  |     await page.waitForTimeout(500);
  51  | 
  52  |     await page.reload();
  53  |     await expect(page.getByLabel("Cerrar sesión")).toBeVisible();
  54  |   });
  55  | 
  56  |   test("[@error-state] Session restore with expired token redirects to login", async ({ page }) => {
  57  |     await page.evaluate(() => {
  58  |       sessionStorage.setItem("cesar_token", "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.expired");
  59  |     });
  60  |     await page.goto("/");
  61  |     await expect(page).toHaveURL(/\/login/);
  62  |   });
  63  | 
  64  |   test("[@happy-path] Logout clears token and redirects to login", async ({ page }) => {
  65  |     await page.goto("/login");
  66  |     await page.fill("input[name=username]", "admin");
  67  |     await page.fill("input[name=password]", "admin123");
  68  |     await page.click("button[type=submit]");
  69  |     await page.waitForTimeout(500);
  70  | 
  71  |     await page.getByLabel("Cerrar sesión").click();
  72  |     await expect(page).toHaveURL(/\/login/);
  73  |   });
  74  | 
  75  |   test("[@error-state] Expired token mid-session redirects to login with toast", async ({ page }) => {
  76  |     await page.goto("/login");
  77  |     await page.fill("input[name=username]", "admin");
  78  |     await page.fill("input[name=password]", "admin123");
  79  |     await page.click("button[type=submit]");
  80  |     await page.waitForTimeout(500);
  81  | 
  82  |     await page.evaluate(() => {
  83  |       sessionStorage.setItem("cesar_token", "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDB9.expired");
  84  |     });
  85  |     await page.goto("/consorcios");
  86  |     await expect(page).toHaveURL(/\/login/);
  87  |   });
  88  | 
  89  |   test("[@role-guard] ACCOUNTANT accessing admin route redirects to invoices", async ({ page }) => {
  90  |     await page.goto("/login");
  91  |     await page.fill("input[name=username]", "contador");
  92  |     await page.fill("input[name=password]", "contador123");
  93  |     await page.click("button[type=submit]");
  94  |     await page.waitForTimeout(500);
  95  | 
  96  |     await page.goto("/consorcios");
  97  |     await expect(page).toHaveURL(/\/invoices/);
  98  |     await expect(page.getByText("Facturación — Próximamente")).toBeVisible();
  99  |   });
  100 | 
  101 |   test("[@role-guard] Unauthenticated user accessing protected route redirects to login", async ({ page }) => {
  102 |     await page.evaluate(() => sessionStorage.clear());
  103 |     await page.goto("/expenses");
  104 |     await expect(page).toHaveURL(/\/login/);
  105 |   });
  106 | 
  107 |   test("[@happy-path] Post-login URL restoration after unauthorized redirect", async ({ page }) => {
  108 |     await page.evaluate(() => sessionStorage.clear());
  109 |     await page.goto("/debt");
  110 |     await expect(page).toHaveURL(/\/login/);
  111 | 
  112 |     await page.fill("input[name=username]", "admin");
  113 |     await page.fill("input[name=password]", "admin123");
  114 |     await page.click("button[type=submit]");
  115 | 
  116 |     await expect(page).toHaveURL(/\/debt/);
  117 |   });
  118 | 
  119 |   test("[@display] Health indicator shows online when all services are up", async ({ page }) => {
  120 |     await page.goto("/login");
  121 |     await page.fill("input[name=username]", "admin");
  122 |     await page.fill("input[name=password]", "admin123");
  123 |     await page.click("button[type=submit]");
  124 |     await page.waitForTimeout(1000);
  125 | 
  126 |     await expect(page.getByText("Servicios operativos")).toBeVisible();
  127 |   });
  128 | });
  129 | 
```