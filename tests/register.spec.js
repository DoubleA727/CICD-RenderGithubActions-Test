const { test, expect } = require('@playwright/test');

test('Register new user', async ({ page } => {
    await page.goto('http://localhost:3001');

    await expect(page.toHaveTitle())
}))