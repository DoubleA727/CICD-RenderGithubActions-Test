// tests/profilepic-test/ProfilePic.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');

test('Can login and upload profile picture', async ({ page }) => {
  await page.goto('/');

  // Open navigation and go to LOGIN
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'LOGIN' }).click();

  // Fill credentials
  await page.getByRole('textbox', { name: 'Username' }).fill('Alan');
  await page.getByRole('textbox', { name: 'Password' }).fill('123');

  await page.getByRole('button', { name: 'Login' }).click();

  // Confirm navigation to profile page
  await expect(page).toHaveURL('/profile.html');

  // Optional: click the "Choose File" button for realism
  const chooseFileBtn = page.getByRole('button', { name: 'Choose File' });
  await chooseFileBtn.click(); 

  // Attach the file programmatically (required for automation)
  const filePath = path.resolve(__dirname, 'Default_pfp.jpg');
  await chooseFileBtn.setInputFiles(filePath);

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Upload' }).click(); 
});
