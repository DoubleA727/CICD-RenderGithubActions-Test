// playwright-tests/export.spec.js
const { test, expect } = require("@playwright/test");
const fs = require("fs");

test.skip(({ browserName }) => browserName === "webkit", "WebKit download event is flaky for export feature.");


async function expectDownload(page, clickFn, ext) {
  const downloadPromise = page.waitForEvent("download");
  await clickFn();
  const download = await downloadPromise;

  const name = download.suggestedFilename().toLowerCase();
  expect(name).toMatch(new RegExp(`\\.${ext}$`));

  // Optional: save & ensure file not empty
  const filePath = `test-results/downloads/${Date.now()}-${name}`;
  await download.saveAs(filePath);
  const stat = fs.statSync(filePath);
  expect(stat.size).toBeGreaterThan(0);
}

test.describe("Admin Export Feature", () => {
  test("Exports: PDF, XLSX, Bar PNG, Pie PNG, CSV download successfully", async ({
    page,
  }) => {
    // 1) Go to site
    await page.goto("http://localhost:3001");

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

    // Helper to open dropdown each time
    const openExport = async () => {
      await page.getByRole("button", { name: /export/i }).click();
    };

    // PDF
    await openExport();
    await expectDownload(
      page,
      () => page.getByText(/export as pdf/i).click(),
      "pdf"
    );

    // Excel
    await openExport();
    await expectDownload(
      page,
      () => page.getByText(/export excel/i).click(),
      "xlsx"
    );

    // Bar chart PNG
    await openExport();
    await expectDownload(
      page,
      () => page.getByText(/export bar chart/i).click(),
      "png"
    );

    // Pie chart PNG
    await openExport();
    await expectDownload(
      page,
      () => page.getByText(/export pie chart/i).click(),
      "png"
    );

    // CSV
    await openExport();
    await expectDownload(
      page,
      () => page.getByText(/export table as csv/i).click(),
      "csv"
    );
  });
});
