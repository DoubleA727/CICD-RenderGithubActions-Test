// tests/review-test/3DMerch.spec.js
const { test, expect } = require('@playwright/test');

test('Can See the shirt models', async ({ page, browserName }) => {
  await page.goto('/');
  
  const canvas = page.locator('canvas');

  await expect(canvas).toHaveCount(1);
  await expect(page.getByText('Failed to load 3D model')).toHaveCount(0);
});