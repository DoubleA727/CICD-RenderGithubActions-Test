// tests/review-test/WholeReview.spec.js
const { test, expect } = require('@playwright/test');

//need to have no review made, and have all 3 accounts registered already with db fes 2021 shirt bouth with no review

test('Can login, make review, edit review, then delete it', async ({ page, browserName }) => {
  await page.goto('http://localhost:3001');

  // --- LOGIN ---
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'LOGIN' }).click();
  
  await page.waitForURL('**/login*', { timeout: 10000 });
  await page.getByRole('textbox', { name: 'Username' }).waitFor({ state: 'visible' });
  
  // Use unique username per browser
  const username = `Alan_${browserName}`;
  console.log(username);
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill('123');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load' }),
    page.getByRole('button', { name: 'Login' }).click()
  ]);

  // --- MAKE REVIEW ---
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'REVIEW' }).click();
  await page.goto('http://localhost:3001/review.html?merchId=7');
  await page.getByRole('button', { name: 'Make Review' }).click();

  const starRadio = page.getByRole('radio', { name: '⭐⭐ 2' });
  await starRadio.waitFor({ state: 'visible' });
  await starRadio.check();

  const commentBox = page.getByRole('textbox', { name: 'Your Comments:' });
  await commentBox.fill('please work');

  const submitBtn = page.getByRole('button', { name: 'Submit' });
  await submitBtn.scrollIntoViewIfNeeded();

  // Handle dialog and submit
  page.once('dialog', dialog => dialog.accept());
  await submitBtn.click();
  
  // Wait for navigation
  await page.waitForURL('**/userReviews*', { timeout: 15000 });
  await page.getByRole('heading', { name: 'All My Reviews' }).waitFor({ timeout: 10000 });

  // --- EDIT REVIEW ---
  const editBtn = page.getByRole('button', { name: 'Edit Review' });
  await editBtn.scrollIntoViewIfNeeded();
  await editBtn.click();

  await page.getByRole('textbox', { name: 'Comments' }).fill('please edit this time');
  await page.getByLabel('Rating').selectOption('1');
  
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Update Review' }).click();
  
  await page.waitForURL('**/userReviews*', { timeout: 15000 });
  await page.getByRole('heading', { name: 'All My Reviews' }).waitFor({ timeout: 10000 });

  // --- DELETE REVIEW ---
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete Review' }).click();
  
  await page.getByRole('button', { name: 'Delete Review' }).waitFor({ state: 'detached', timeout: 10000 });
});