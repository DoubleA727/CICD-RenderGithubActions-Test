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

  await page.getByRole('button', { name: 'Buy' }).first().click();
  await page.locator('#orderForm input[name="quantity"]').click();
  await page.locator('#orderForm input[name="quantity"]').fill('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Add to Order' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.locator('input[name="address"]').click();
  await page.locator('input[name="address"]').fill('Dover');
  await page.getByRole('textbox', { name: 'John Tan' }).click();
  await page.getByRole('textbox', { name: 'John Tan' }).fill('test1');
  await page.getByRole('textbox', { name: 'john@example.com' }).click();
  await page.getByRole('textbox', { name: 'john@example.com' }).fill('test1@test1');
  await page.getByPlaceholder('5678 9012 3456').click();
  await page.getByPlaceholder('5678 9012 3456').fill('4242424242424242');
  await page.getByRole('textbox', { name: 'MM/YY' }).click();
  await page.getByRole('textbox', { name: 'MM/YY' }).fill('12/30');
  await page.getByPlaceholder('123', { exact: true }).click();
  await page.getByPlaceholder('123', { exact: true }).fill('23');
  await page.getByPlaceholder('123', { exact: true }).click();
  await page.getByPlaceholder('123', { exact: true }).fill('123');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Place Order' }).click();
});