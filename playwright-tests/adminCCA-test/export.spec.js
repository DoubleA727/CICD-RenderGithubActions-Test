// playwright-tests/export.spec.js
const { test, expect } = require("@playwright/test");
const fs = require("fs");

async function closeBlockingModal(page) {
  const modal = page.locator("#exampleModal");

  if (await modal.isVisible().catch(() => false)) {
    const closeBtn = modal.getByRole("button", { name: /close/i }).first();

    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click({ force: true });
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
  }

  await modal.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  await page
    .locator(".modal-backdrop")
    .waitFor({ state: "detached", timeout: 5000 })
    .catch(() => {});
}

async function expectDownload(page, clickFn, ext) {
  const downloadPromise = page.waitForEvent("download");
  await clickFn();
  const download = await downloadPromise;

  const name = download.suggestedFilename().toLowerCase();
  expect(name).toMatch(new RegExp(`\\.${ext}$`));

  const filePath = `test-results/downloads/${Date.now()}-${name}`;
  await download.saveAs(filePath);

  const stat = fs.statSync(filePath);
  expect(stat.size).toBeGreaterThan(0);
}

test.describe("Admin Export Feature", () => {
  test("Exports: PDF, XLSX, Bar PNG, Pie PNG, CSV download successfully", async ({ page }) => {
    await page.goto("/");

    await closeBlockingModal(page);

    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /login/i }).click();

    await page.getByRole("textbox", { name: /username/i }).fill("admin1");
    await page.getByRole("textbox", { name: /password/i }).fill("123");
    await page.getByRole("button", { name: /login/i }).click();

    await page.waitForLoadState("networkidle");

    await closeBlockingModal(page);

    await page.getByRole("button", { name: /toggle navigation/i }).click();
    await page.getByRole("link", { name: /^admin$/i }).click();

    await page.getByRole("link", { name: /cca management/i }).click();

    const openExport = async () => {
      await closeBlockingModal(page);
      await page.getByRole("button", { name: /export/i }).click();
    };

    await openExport();
    await expectDownload(page, () => page.getByText(/export as pdf/i).click(), "pdf");

    await openExport();
    await expectDownload(page, () => page.getByText(/export excel/i).click(), "xlsx");

    await openExport();
    await expectDownload(page, () => page.getByText(/export bar chart/i).click(), "png");

    await openExport();
    await expectDownload(page, () => page.getByText(/export pie chart/i).click(), "png");

    await openExport();
    await expectDownload(page, () => page.getByText(/export table as csv/i).click(), "csv");
  });
});
