const { test, expect } = require('@playwright/test');

// admin edit user
test('admin successfully edit user\'s details', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.getByRole('link', { name: 'User Management' }).click();
    await page.getByRole('button', { name: 'Edit' }).nth(4).click();
    await page.locator('#editPassword').click();
    await page.locator('#editPassword').fill('123');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText(/User updated/i)).toBeVisible({ timeout: 10000 });
});

// admin delete user
test('admin successfully delete user', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.getByRole('link', { name: 'User Management' }).click();

    page.once('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete' }).first().click();
});

// admin search user
test('admin successfully searches for specific user', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(page.locator('#adminButton')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.getByRole('link', { name: 'User Management' }).click();
    await page.getByRole('textbox', { name: 'Search username/email/id...' }).click();
    await page.getByRole('textbox', { name: 'Search username/email/id...' }).fill('NICHOLASONG.24@ichat.sp.edu.sg');

    // 1) expect the meta says 1 user(s)
    await expect(page.locator('#usersMeta')).toHaveText(/1\s*user\(s\)/);

    // 2) expect only 1 row in the table body
    const rows = page.locator('#usersTable tbody tr');
    await expect(rows).toHaveCount(1);

    // 3) expect email in the Email column (4th column)
    const emailCell = rows.first().locator('td').nth(3);
    await expect(emailCell).toHaveText('NICHOLASONG.24@ichat.sp.edu.sg');
});
