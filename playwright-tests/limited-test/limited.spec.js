const { test, expect } = require("@playwright/test");

test.describe("Homepage – Limited Time Deals", () => {
  test("Limited Time Deals cards render correctly", async ({ page }) => {
    // 1) Go to homepage (no login needed)
    await page.goto("/index.html");

    // 2) Limited deals container exists
    const container = page.locator("#limitedCards");
    await expect(container).toBeVisible({ timeout: 15000 });

    // 3) At least one limited card is rendered
    const cards = page.locator(".limited-card");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // 4) Check first card structure
    const firstCard = cards.first();

    // Image
    await expect(firstCard.locator("img")).toBeVisible();

    // Name
    await expect(firstCard.locator("h3")).toBeVisible();

    // Description
    await expect(firstCard.locator("p")).toBeVisible();

    // Prices
    await expect(firstCard.locator(".new-price")).toBeVisible();
    await expect(firstCard.locator(".old-price")).toBeVisible();

    // Discount button
    await expect(
      firstCard.getByRole("button", { name: /view deal/i })
    ).toBeVisible();
  });
});
