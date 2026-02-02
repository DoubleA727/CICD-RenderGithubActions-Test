// tests/aireview-test/AIReview.spec.js
const { test, expect } = require('@playwright/test');

test('Can see AI Analysis of the Reviews', async ({ page }) => {
  await page.goto('http://localhost:3001');

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'REVIEW' }).click();

  await expect(page.getByText('Rating:')).toBeVisible({ timeout: 10_000 });

  const aiBtn = page.locator('#aiSummaryBtn');
  await expect(aiBtn).toBeEnabled();
  await aiBtn.click();

  // wait for AI summary result
  await expect(page.locator('#aiSummaryBox')).toBeVisible({ timeout: 20_000 });
});


