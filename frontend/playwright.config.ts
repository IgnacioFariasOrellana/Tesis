import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["./tests/reporters/iteration-console-reporter.ts"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : undefined,
    trace: "retain-on-failure",
    screenshot: "on",
    // Las capturas y el informe HTML son suficientes como evidencia. Mantener el
    // video apagado evita exigir FFmpeg en cada computador de desarrollo.
    video: "off",
  },
  outputDir: "test-results",
});

