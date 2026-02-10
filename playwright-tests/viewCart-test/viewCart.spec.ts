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

  // Wait for at least one merch card to appear
  await page.waitForSelector('.merch-card', { state: 'visible' });

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'MERCH', exact: true }).click();
  await page.getByRole('button', { name: 'Buy' }).first().click();
  await page.locator('#orderForm input[name="quantity"]').click();
  await page.locator('#orderForm input[name="quantity"]').fill('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Add to Order' }).click();
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'VIEW CART' }).click();

  await expect(page.locator('h5').filter({ hasText: /^DB Festival 2022 Shirt$/ })).toBeVisible();
});