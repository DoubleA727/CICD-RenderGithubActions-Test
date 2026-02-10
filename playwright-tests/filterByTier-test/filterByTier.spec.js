import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'LOGIN' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test1');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('1');
  await page.getByRole('button', { name: 'Login' }).click();

  // waits for token to load
  await page.waitForURL('/profile.html');

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'MERCH', exact: true }).click();

  // Wait for loader to disappear
  await page.waitForSelector('#merchLoader', { state: 'hidden' });

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'MERCH', exact: true }).click();

  await expect(page.locator('span').filter({ hasText: /^Tier 1$/ })).toBeVisible();
});