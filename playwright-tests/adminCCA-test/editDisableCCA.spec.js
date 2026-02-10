// playwright-tests/admin-cca.spec.js
const { test, expect } = require("@playwright/test");

async function closeBlockingModal(page) {
  const modal = page.locator("#exampleModal");

  if (await modal.isVisible().catch(() => false)) {
    const closeBtn = modal
      .getByRole("button", { name: /close/i })
      .first();

    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true });
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
  }

  await modal
    .waitFor({ state: "hidden", timeout: 5000 })
    .catch(() => {});
}

test.describe("CCA Admin Management", () => {
  test("Admin can login, go to CCA Management, edit and disable a CCA", async ({ page }) => {
    // 1) Go to site
    await page.goto("/");

    // 2) Login (admin1 / 123)
    await closeBlockingModal(page);

    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /login/i }).click();

    await page.getByRole("textbox", { name: /username/i }).fill("admin1");
    await page.getByRole("textbox", { name: /password/i }).fill("123");
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForLoadState("networkidle");

    // 3) Go to Admin section
    await closeBlockingModal(page);

    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /^admin$/i }).click();

    // 4) Open CCA Management
    await page.getByRole("link", { name: /cca management/i }).click();

    // 5) Wait for table
    const table = page.locator("#ccaTable");
    await expect(table).toBeVisible({ timeout: 15000 });

    const rows = page.locator("#ccaTable tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const firstRow = rows.first();
    const oldName = (await firstRow.locator("td").nth(1).innerText()).trim();

    // ------------------------------------------------------------
    // PART A: EDIT
    // ------------------------------------------------------------
    await firstRow.getByRole("button", { name: /edit/i }).click();

    const editModal = page.locator("#editCCAModal");
    await expect(editModal).toBeVisible({ timeout: 8000 });

    const newName = `${oldName} (PW Edited)`;
    await page.locator("#editCCAName").fill(newName);

    await page.locator("#saveCCAChanges").click();

    await expect(editModal).toBeHidden({ timeout: 15000 });
    await expect(page.locator("#ccaTable")).toContainText(newName, {
      timeout: 15000,
    });

    // ------------------------------------------------------------
    // PART B: DISABLE
    // ------------------------------------------------------------
    const editedRow = page
      .locator("#ccaTable tbody tr", { hasText: newName })
      .first();

    await expect(editedRow).toBeVisible({ timeout: 15000 });

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await editedRow.getByRole("button", { name: /disable/i }).click();

    await page.locator("#categoryFilter").selectOption("disabled");
    await expect(page.locator("#ccaTable")).toContainText(newName, {
      timeout: 15000,
    });
  });
});
