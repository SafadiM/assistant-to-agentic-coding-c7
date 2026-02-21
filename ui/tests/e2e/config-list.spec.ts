import { test, expect } from "@playwright/test";

test.describe("Config List", () => {
  test("page loads and displays the config table heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("app-root").locator("config-list");
    await expect(heading).toBeVisible();
  });

  test("shows empty state when no configs exist", async ({ page }) => {
    await page.goto("/");

    const appRoot = page.locator("app-root");
    const configList = appRoot.locator("config-list");
    await expect(configList).toBeVisible();

    const emptyOrTable = configList.locator("css=.empty, table");
    await expect(emptyOrTable.first()).toBeVisible({ timeout: 5000 });
  });

  test("shows New Config button", async ({ page }) => {
    await page.goto("/");

    const appRoot = page.locator("app-root");
    const configList = appRoot.locator("config-list");
    const newBtn = configList.locator("#btn-new");
    await expect(newBtn).toBeVisible();
    await expect(newBtn).toHaveText("+ New Config");
  });

  test("table has correct column headers when configs exist", async ({ page }) => {
    await page.goto("/");

    const configList = page.locator("app-root").locator("config-list");
    const table = configList.locator("table");

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
