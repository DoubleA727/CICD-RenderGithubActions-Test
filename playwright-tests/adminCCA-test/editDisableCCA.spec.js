// playwright-tests/admin-cca.spec.js
const { test, expect } = require("@playwright/test");

test.describe("CCA Admin Management", () => {
  test("Admin can login, go to CCA Management, edit and disable a CCA", async ({ page }) => {
    // 1) Go to site
    await page.goto("/");

    // 2) Login (admin1 / 123)
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /login/i }).click();

    await page.getByRole("textbox", { name: /username/i }).fill("admin1");
    await page.getByRole("textbox", { name: /password/i }).fill("123");
    await page.getByRole("button", { name: /login/i }).click();

    // If your app redirects after login, adjust this URL to your real admin landing/profile page
    await page.waitForLoadState("networkidle");

    // 3) Click Admin in navbar
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /^admin$/i }).click();

    // 4) Click CCA Management in sidebar
    await page.getByRole("link", { name: /cca management/i }).click();

    // 5) Ensure table is loaded
    const table = page.locator("#ccaTable");
    await expect(table).toBeVisible({ timeout: 15000 });

    const rows = page.locator("#ccaTable tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    // Pick first row
    const firstRow = rows.first();

    const oldName = (await firstRow.locator("td").nth(1).innerText()).trim();

    // ------------------------------------------------------------
    // PART A: EDIT
    // ------------------------------------------------------------
    // Click Edit button in that row (change /edit/i if your button text differs)
    await firstRow.getByRole("button", { name: /edit/i }).click();

    // Modal appears
    const modal = page.locator("#editCCAModal");
    await expect(modal).toBeVisible({ timeout: 8000 });

    // Fill fields (IDs from your adminCCA.html)
    const newName = `${oldName} (PW Edited)`;
    await page.locator("#editCCAName").fill(newName);
    // await page.locator("#editCCADescription").fill("Edited via Playwright E2E test");
    // await page.locator("#editCCAImageUrl").fill("https://example.com/pw.jpg");

    // Save
    await page.locator("#saveCCAChanges").click();

    // Modal closes
    await expect(modal).toBeHidden({ timeout: 15000 });

    // Verify table updated
    await expect(page.locator("#ccaTable")).toContainText(newName, { timeout: 15000 });

    // ------------------------------------------------------------
    // PART B: DISABLE
    // ------------------------------------------------------------
    const editedRow = page.locator("#ccaTable tbody tr", { hasText: newName }).first();
    await expect(editedRow).toBeVisible({ timeout: 15000 });

  
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // Click Disable button (change /disable/i if your button text differs)
    await editedRow.getByRole("button", { name: /disable/i }).click();


    await page.locator("#categoryFilter").selectOption("disabled");
    await expect(page.locator("#ccaTable")).toContainText(newName, { timeout: 15000 });


    
  });
});
