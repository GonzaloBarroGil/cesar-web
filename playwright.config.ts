import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/features",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx vite --port 5173",
    port: 5173,
    reuseExistingServer: true,
  },
});
