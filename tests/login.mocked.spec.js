// tests/login.mocked.spec.js
const { test, expect } = require('@playwright/test');

test('login success (mocked api) redirects and stores token', async ({ page }) => {
  await page.route('**/api/login', async (route) => {
    // Optional: inspect the request body
    const req = route.request();
    const body = req.postDataJSON();

    // Check credentials being sent
    expect(body.username).toBe('admin1');
    expect(body.password).toBe('123');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        role: 'admin',
      }),
    });
  });

  await page.goto('/login.html');

  await page.fill('#username', 'admin1');
  await page.fill('#password', '123');

  await Promise.all([
    page.waitForURL('**/profile.html'),
    page.click('button[type="submit"]'),
  ]);

  const token = await page.evaluate(() => localStorage.getItem('token'));
  const role = await page.evaluate(() => localStorage.getItem('role'));

  expect(token).toBe('fake-jwt-token');
  expect(role).toBe('admin');
});
