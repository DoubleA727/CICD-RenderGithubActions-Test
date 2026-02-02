const { test, expect } = require('@playwright/test');

test('Promo emailer successfully sent to all users', async ({ page }) => {
    test.setTimeout(180000);
    
    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.getByRole('link', { name: 'Promotional Email' }).click();
    await page.getByRole('textbox', { name: 'Email Subject' }).click();
    await page.getByRole('textbox', { name: 'Email Subject' }).fill('Promo emailer test.');
    await page.getByRole('textbox', { name: 'Email Content (HTML)' }).click();
    await page.getByRole('textbox', { name: 'Email Content (HTML)' }).fill('This goes to show that it works!');
    await page.getByRole('button', { name: 'Send Email' }).click();

    const [response] = await Promise.all([
    page.waitForResponse(
        r => r.status() === 200), { timeout: 180000 },
        page.getByRole('button', { name: 'Send Email' }).click(),
    ]);

    const body = await response.json();
    expect(body.success).toBe(true);

    await expect(
        page.getByText(/Promotional email has been sent/i)
    ).toBeVisible({ timeout: 10000 });
});