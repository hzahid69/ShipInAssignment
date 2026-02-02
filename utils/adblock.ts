// Playwright adblock helper
import { Page } from '@playwright/test';

/**
 * Blocks common ad URLs and hides ad elements on the page.
 * Call this at the start of each test or in a test.beforeEach().
 */
export async function blockAds(page: Page) {
  // Block network requests to common ad domains and image types
  await page.route(/(ads|doubleclick|googlesyndication|adservice)\./i, route => route.abort());
  await page.route('**/*.{jpg,jpeg,png,gif,svg,webp}', route => route.abort());

  // Hide ad elements with CSS
  await page.addStyleTag({
    content: `
      .ad, [id*="ad"], [class*="ad"], [src*="ad"],
      [id*="banner"], [class*="banner"],
      [id*="sponsor"], [class*="sponsor"] {
        display: none !important;
      }
    `
  });
}
