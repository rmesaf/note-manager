/**
 * E2E infrastructure smoke test — validates that Playwright can reach the
 * Next.js application managed by the `webServer` block and that the home
 * page renders its core content.
 *
 * @description Intentionally minimal. This file only exercises infrastructure:
 *   - The `webServer` block booted (or reused) the Next.js dev server.
 *   - Playwright's browser can open the base URL.
 *   - The page title set in `layout.js` is present in the document head.
 *   - The main heading rendered by `page.js` is visible in the DOM.
 *
 * No forms, no Tiptap interactions, no IndexedDB calls. Those belong to
 * dedicated feature spec files that will be added iteratively.
 */

const { test, expect } = require('@playwright/test');

test.describe('Infrastructure smoke test', () => {
  test('home page loads and renders the main heading', async ({ page }) => {
    await page.goto('/');

    // The <h1> rendered by page.js contains "Your Notes".
    const heading = page.getByRole('heading', { name: 'Your Notes', level: 1 });
    await expect(heading).toBeVisible();
  });

  test('document has a non-empty title', async ({ page }) => {
    await page.goto('/');

    // Confirms the <title> tag in layout.js is served and not empty.
    await expect(page).toHaveTitle(/.+/);
  });
});
