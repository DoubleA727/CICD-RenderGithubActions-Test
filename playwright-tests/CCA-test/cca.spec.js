const { test, expect } = require("@playwright/test");

test.describe("CCA Page", () => {
  test("loads CCAs and opens modal with recommendations", async ({ page }) => {
    // 1) Mock /api/cca/
    await page.route("**/api/cca/", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              ccaId: 1,
              name: "Basketball",
              category: "Sports",
              description: "Hoop hoop",
              imageUrl: "/img/basketball.png",
            },
            {
              ccaId: 2,
              name: "Dance Club",
              category: "Performing Arts",
              description: "Dance!",
              imageUrl: "/img/dance.png",
            },
            {
              ccaId: 3,
              name: "AI Society",
              category: "Clubs",
              description: "ML stuff",
              imageUrl: "/img/ai.png",
            },
          ],
        }),
      });
    });

    // 2) Mock click tracking POST
    let clickTracked = false;
    await page.route("**/api/cca/1/click", async (route) => {
      clickTracked = true;
      return route.fulfill({ status: 200, body: "{}" });
    });

    // 3) Mock recommendations endpoint
    await page.route("**/api/cca/recommend/1", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              ccaId: 3,
              name: "AI Society",
              category: "Clubs",
              description: "ML stuff",
              imageUrl: "/img/ai.png",
            },
          ],
        }),
      });
    });

    // Go to your page
    await page.goto("http://localhost:3001/cca.html");

    // Wait for cards to render
    await expect(page.locator(".cca-card")).toHaveCount(3);

    // Sections should be visible (since each has 1)
    await expect(page.locator("#sports")).toBeVisible();
    await expect(page.locator("#arts")).toBeVisible();
    await expect(page.locator("#clubs")).toBeVisible();

    // Click Basketball card (Sports)
    await page.locator('.cca-card[data-id="1"]').click();

    // Modal appears + content filled
    await expect(page.locator("#quickViewModal")).toBeVisible();
    await expect(page.locator("#modalTitle")).toHaveText("Basketball");
    await expect(page.locator("#modalCategory")).toHaveText("Sports");
    await expect(page.locator("#modalDesc")).toHaveText("Hoop hoop");

    // Merch link has correct ccaId
    await expect(page.locator("#modalLink")).toHaveAttribute(
      "href",
      /merch\.html\?ccaId=1$/
    );

    // Recommendation card exists
    await expect(page.locator(".recommended-card")).toHaveCount(1);
    await expect(page.locator(".recommended-card h4")).toHaveText("AI Society");

    // Click tracking fired
    expect(clickTracked).toBeTruthy();
  });

  test("search filters CCAs", async ({ page }) => {
    await page.route("**/api/cca/", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              ccaId: 1,
              name: "Basketball",
              category: "Sports",
              description: "",
              imageUrl: "/img/a.png",
            },
            {
              ccaId: 2,
              name: "Badminton",
              category: "Sports",
              description: "",
              imageUrl: "/img/b.png",
            },
            {
              ccaId: 3,
              name: "Dance Club",
              category: "Performing Arts",
              description: "",
              imageUrl: "/img/c.png",
            },
          ],
        }),
      });
    });

    await page.goto("http://localhost:3001/cca.html");
    await expect(page.locator(".cca-card")).toHaveCount(3);

    await page.fill("#searchInput", "dance");
    await expect(page.locator(".cca-card")).toHaveCount(1);
    await expect(page.locator(".cca-card h3")).toHaveText("Dance Club");

    // Clear search restores
    await page.fill("#searchInput", "");
    await expect(page.locator(".cca-card")).toHaveCount(3);
  });

  test("category filter only shows selected category", async ({ page }) => {
    await page.route("**/api/cca/", async (route) => {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              ccaId: 1,
              name: "Basketball",
              category: "Sports",
              description: "",
              imageUrl: "/img/a.png",
            },
            {
              ccaId: 2,
              name: "Dance Club",
              category: "Performing Arts",
              description: "",
              imageUrl: "/img/b.png",
            },
          ],
        }),
      });
    });

    await page.goto("http://localhost:3001/cca.html");
    await expect(page.locator(".cca-card")).toHaveCount(2);

    await page.selectOption("#categoryFilter", "Sports");
    await expect(page.locator(".cca-card")).toHaveCount(1);
    await expect(page.locator(".cca-card h3")).toHaveText("Basketball");

    // arts section should be hidden by your render logic
    await expect(page.locator("#arts")).toBeHidden();
  });
});
