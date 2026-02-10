const { test, expect } = require('@playwright/test');

test('login success redirects to profile and stores token', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/profile\.html/, { timeout: 10000 });

  // Verify localStorage got set by loginUser.js callback
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const role = await page.evaluate(() => localStorage.getItem('role'));

  expect(token).toBeTruthy();
  expect(role).toBeTruthy();
});

test('login failure shows warning card', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('1234');
  await page.getByRole('button', { name: 'Login' }).click();

  // warningCard should become visible (d-none removed)
  const warningCard = page.locator('#warningCard');
  await expect(warningCard).toBeVisible();

  // message comes from backend, so just check there is some text
  await expect(page.locator('#warningText')).not.toHaveText('');
});


