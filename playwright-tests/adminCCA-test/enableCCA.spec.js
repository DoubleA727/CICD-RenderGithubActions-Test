// playwright-tests/enableCCA.spec.js
const { test, expect } = require("@playwright/test");

test.describe("CCA Admin Management", () => {
  test("Admin can enable a disabled CCA", async ({ page }) => {
    // 1) Go to site
    await page.goto("http://localhost:3001");

    // 2) Login (admin1 / 123)
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /login/i }).click();

    await page.getByRole("textbox", { name: /username/i }).fill("admin1");
    await page.getByRole("textbox", { name: /password/i }).fill("123");
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForLoadState("networkidle");

    // 3) Click Admin in navbar
    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /^admin$/i }).click();

    // 4) Click CCA Management in sidebar
    await page.getByRole("link", { name: /cca management/i }).click();

    // 5) Auto-accept ALL dialogs (confirm + success alert)
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // 6) Filter to Disabled CCAs
    await page.locator("#categoryFilter").selectOption("disabled");

    // 7) Ensure table has at least 1 row (a disabled CCA exists)
    const rows = page.locator("#ccaTable tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const firstDisabledRow = rows.first();

    // (Optional) capture name for checking later
    const ccaName = (await firstDisabledRow.locator("td").nth(1).innerText()).trim();

    // 8) Click Enable on the first disabled CCA
    await firstDisabledRow.getByRole("button", { name: /enable/i }).click();

    // 9) Verify it disappears from Disabled list
    // (table will re-render after enabling)
    await expect(page.locator("#ccaTable")).not.toContainText(ccaName, {
      timeout: 15000,
    });

    // Optional: switch back to All and verify it appears again
    await page.locator("#categoryFilter").selectOption("all");
    await expect(page.locator("#ccaTable")).toContainText(ccaName, {
      timeout: 15000,
    });
  });
});
