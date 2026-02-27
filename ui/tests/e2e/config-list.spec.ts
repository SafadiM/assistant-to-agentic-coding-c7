import { test, expect } from "@playwright/test";

test.describe("Config List", () => {
  test("page loads and displays the configurations heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Configurations")).toBeVisible({ timeout: 5000 });
  });

  test("shows empty state or table when loaded", async ({ page }) => {
    await page.goto("/");

    const emptyOrTable = page.locator(".empty, table");
    await expect(emptyOrTable.first()).toBeVisible({ timeout: 5000 });
  });

  test("shows New Config button", async ({ page }) => {
    await page.goto("/");

    const newBtn = page.locator("text=+ New Config");
    await expect(newBtn).toBeVisible();
  });

  test("table has correct column headers when configs exist", async ({ page }) => {
    await page.goto("/");

    const table = page.locator("table");
    const hasTable = await table.isVisible().catch(() => false);
    if (hasTable) {
      const headers = table.locator("th");
      await expect(headers.nth(0)).toHaveText("Key");
      await expect(headers.nth(1)).toHaveText("Value");
      await expect(headers.nth(2)).toHaveText("Updated");
      await expect(headers.nth(3)).toHaveText("Actions");
    }
  });
});
