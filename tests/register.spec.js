const { test, expect } = require('@playwright/test');

test('Register page loads', async ({ page }) => {
  // Uses baseURL from playwright.config.js
  await page.goto('/register.html');
  await expect(page).toHaveURL('**/register.html');
});
