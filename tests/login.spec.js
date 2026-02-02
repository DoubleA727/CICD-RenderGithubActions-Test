// tests/login.spec.js
const { test, expect } = require('@playwright/test');

test('login success redirects to profile and stores token', async ({ page }) => {
  // Your webServer is http://127.0.0.1:3001 from config
  await page.goto('/login.html');

  await page.fill('#username', 'admin1');
  await page.fill('#password', '123');

  // Click and wait for navigation (your code does window.location.href = "profile.html")
  await Promise.all([
    page.waitForURL('**/profile.html', { timeout: 10_000 }),
    page.click('button[type="submit"]'),
  ]);

  // Verify localStorage got set by loginUser.js callback
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const role = await page.evaluate(() => localStorage.getItem('role'));

  expect(token).toBeTruthy();
  expect(role).toBeTruthy(); // or expect(role).toBe('admin') if you know exact value
});

test('login failure shows warning card', async ({ page }) => {
  await page.goto('/login.html');

  await page.fill('#username', 'admin1');
  await page.fill('#password', 'wrongpassword');

  await page.click('button[type="submit"]');

  // warningCard should become visible (d-none removed)
  const warningCard = page.locator('#warningCard');
  await expect(warningCard).toBeVisible();

  // message comes from backend, so just check there is some text
  await expect(page.locator('#warningText')).not.toHaveText('');
});
