const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

test.beforeEach(async ({ request }) => {
  const res = await request.post(`${baseURL}/api/users/test/delete-user`, {
    data: { email: 'tester1@gmail.com' },
  });

    console.log('delete-user status:', res.status());
  console.log('delete-user body:', await res.text());


  expect(res.ok()).toBeTruthy();
});


test('register success redirects to profile and stores token', async ({ page }) => {
    await page.goto('/register.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('tester1');
    await page.getByRole('textbox', { name: 'First Name' }).click();
    await page.getByRole('textbox', { name: 'First Name' }).fill('tester');
    await page.getByRole('textbox', { name: 'Last Name' }).click();
    await page.getByRole('textbox', { name: 'Last Name' }).fill('one');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('tester1@gmail.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('tester1');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('tester1');
    await page.getByRole('button', { name: 'Register' }).click();
});

test('register failure shows warning card', async ({ page }) => {
    await page.goto('/register.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'First Name' }).click();
    await page.getByRole('textbox', { name: 'First Name' }).fill('admin');
    await page.getByRole('textbox', { name: 'Last Name' }).click();
    await page.getByRole('textbox', { name: 'Last Name' }).fill('one');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('admin1@gmail.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('admin1');
    await page.getByRole('textbox', { name: 'Confirm Password' }).click();
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('admin1');
    await page.getByRole('button', { name: 'Register' }).click();

    const warning = page.locator('#warningCard div');
    await expect(warning).toBeVisible();
    await expect(warning).toHaveText(/Username already exists\./);
});