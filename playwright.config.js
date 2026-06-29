// @ts-check — enables editor IntelliSense without adding TypeScript to the project.
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for the Notes Manager Next.js application.
 *
 * @description The `webServer` block is the key integration point between
 * Playwright and Next.js:
 *
 *  - **Local development:** Playwright checks whether port 3000 is already
 *    occupied (`reuseExistingServer: true`). If a dev server is running (e.g.
 *    from a previous `npm run dev` call), Playwright reuses it immediately —
 *    no cold start. If the port is free it boots one automatically.
 *
 *  - **CI environments:** The port is always free, so Playwright starts
 *    `npm run dev` itself, waits until the URL responds, then runs the full
 *    suite and tears the server down on completion. Zero manual orchestration.
 *
 * @see https://playwright.dev/docs/test-webserver
 */
module.exports = defineConfig({
  /** Root directory where Playwright will discover test files. */
  testDir: './e2e/tests',

  /** Maximum time a single test is allowed to run before it is marked as failed. */
  timeout: 30_000,

  /** Parallelise files but run tests within a file serially to avoid state conflicts. */
  fullyParallel: true,

  /** Fail the CI build on accidental `.only` calls left in test files. */
  forbidOnly: !!process.env.CI,

  /** Retry failing tests once on CI to absorb transient flakiness. */
  retries: process.env.CI ? 1 : 0,

  /** Limit parallel workers on CI to avoid resource contention. */
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    /** Base URL used by `page.goto('/')` and relative navigation calls. */
    baseURL: 'http://localhost:3000',

    /** Capture a screenshot and a trace on first retry to speed up debugging. */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /**
   * Automatically manage the Next.js dev server lifecycle.
   *
   * `reuseExistingServer` makes the local inner loop fast: run `npm run dev`
   * in one terminal, then `npm run e2e` in another — Playwright skips the boot
   * entirely. On CI the flag is effectively ignored because port 3000 is always
   * free, so the server always starts fresh.
   */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
