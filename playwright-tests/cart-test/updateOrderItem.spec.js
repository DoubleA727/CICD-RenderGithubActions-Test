import { test, expect } from "@playwright/test";

test("update order item success, item quantity is changed in cart", async ({
  page,
}) => {
  await page.goto("http://localhost:3001/login.html");
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("admin1");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("123");
  await page.getByRole("button", { name: "Login" }).click();
  // waits for token to load
  await page.waitForURL("http://localhost:3001/profile.html");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "MERCH", exact: true }).click();
  await page.getByRole("button", { name: "Buy" }).first().click();
  await page.locator('#orderForm input[name="quantity"]').click();
  await page.locator('#orderForm input[name="quantity"]').fill("3");
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole("button", { name: "Add to Order" }).click();
  // this ensures that as long as the Swimsuit 2028 is visible, we can proceed to update the quantity
  await expect(page.getByText("Swimsuit 2028")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();

  const qtyInput = page.getByRole("spinbutton", { name: "Quantity" });
  await qtyInput.click();
  await qtyInput.fill("6");

  // ✅ CAPTURE the quantity BEFORE saving
  const newQty = await qtyInput.inputValue();

  await page.getByRole("button", { name: "Save changes" }).click();

  // Locate the order card containing the product
  const orderCard = page
    .locator("#orderCardsContainer")
    .locator(":scope *", { hasText: "Swimsuit 2028" })
    .first();

  // Ensure UI updated
  await expect(orderCard).toBeVisible();

  // Assert updated quantity dynamically
  await expect(orderCard).toContainText(
    new RegExp(`Quantity:\\s*${newQty}\\b`)
  );
  await expect(orderCard).toContainText(/Price:\s*\$/);
});
