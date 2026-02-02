import { test, expect } from "@playwright/test";

test("delete order item from cart success, item is not visible in cart", async ({
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
  //add an item to cart first, so that the delete button on the item card is shown
  await page.locator('#orderForm input[name="quantity"]').click();
  await page.locator('#orderForm input[name="quantity"]').fill("3");
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole("button", { name: "Add to Order" }).click();
  await expect(page.getByText("Swimsuit 2028")).toBeVisible();
  //once item is shown in cart, delete button appears on the item card
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByLabel("Remove Item")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText("Swimsuit 2028")).not.toBeVisible();
});
