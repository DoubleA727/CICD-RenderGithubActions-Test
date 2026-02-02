const { test, expect } = require('@playwright/test');
const path = require('path');

// admin add merch
test('admin create merch successful', async ({ page }) => {
    test.setTimeout(120000);

    const imagePath = path.resolve(
    __dirname,
    '../src/public/assets/images/hf.png'
    );
    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: '+ Add Merch' }).click();
    await page.getByRole('textbox', { name: 'Name *' }).fill('SP Swimming 2031 Shirt');
    await page.getByRole('spinbutton', { name: 'Price *' }).click();
    await page.getByRole('spinbutton', { name: 'Price *' }).fill('15.69');
    await page.getByLabel('CCA *').selectOption('14');
    await page.getByRole('spinbutton', { name: 'Tier ID (1–3) *' }).click();
    await page.getByRole('spinbutton', { name: 'Tier ID (1–3) *' }).fill('3');
    await page.getByRole('textbox', { name: 'Story' }).click();
    await page.getByRole('textbox', { name: 'Story' }).fill('SP Swimming Competition');
    await page.getByRole('button', { name: 'Image *' }).click();
    await page.getByRole('button', { name: 'Image *' }).setInputFiles(imagePath);
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('BEST CCA IN SP');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/Merch created successfully./i)).toBeVisible({ timeout: 10000 });
});

// admin edit merch
test('admin edit merch details successful', async ({page}) => {
    test.setTimeout(120000);

    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByRole('spinbutton', { name: 'Tier ID (1–3) *' }).click();
    await page.getByRole('spinbutton', { name: 'Tier ID (1–3) *' }).fill('3');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/Merch and story updated/i)).toBeVisible({ timeout: 10000 });
});

// admin archive merch
test('admin archive merch successful', async ({page}) => {
    test.setTimeout(120000);

    await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Merch Management' }).click();
    
    page.once('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
    });
    await page.locator('tr:nth-child(9) > .text-end > .btn.btn-sm.btn-outline-danger').click();
    

    // expected output
    await expect(page.getByText(/Merch archived successfully/i)).toBeVisible({ timeout: 10000 });
});

// admin unarchive merch
test('admin unarchive merch successful', async ({page}) => {
    test.setTimeout(120000);
    
     await page.goto('http://localhost:3001/login.html');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin1');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ADMIN' }).click();
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Merch Management' }).click();
    page.once('dialog', async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept(); // OK
    });
    await page.getByRole('button', { name: 'Unarchive' }).first().click();

    // expected output
    await expect(page.getByText(/Merch unarchived successfully/i)).toBeVisible({ timeout: 10000 });
});