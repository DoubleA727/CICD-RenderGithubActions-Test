// tests/profilePage.spec.js
const { test, expect } = require('@playwright/test');

test('Can login and see profile page', async ({ page }) => {
  await page.goto('http://localhost:3001');

  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'LOGIN' }).click();

  await page.getByRole('textbox', { name: 'Username' }).fill('Alan');
  await page.getByRole('textbox', { name: 'Password' }).fill('123');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('http://localhost:3001/profile.html');

  const token = await page.evaluate(() => localStorage.getItem('token'));
  const role = await page.evaluate(() => localStorage.getItem('role'));

  expect(token).toBeTruthy();
  expect(role).toBeTruthy();
});
