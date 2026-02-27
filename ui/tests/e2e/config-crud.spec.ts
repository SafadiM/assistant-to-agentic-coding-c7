import { test, expect } from "@playwright/test";

const uniqueKey = `e2e_test_${Date.now()}`;

test.describe("Config CRUD flow", () => {
  test("create → read → update → delete lifecycle", async ({ page }) => {
    await page.goto("/");

    // --- CREATE ---
    const newBtn = page.locator("text=+ New Config");
    await expect(newBtn).toBeVisible({ timeout: 5000 });
    await newBtn.click();

    const keyInput = page.locator('input[name="key"]');
    const valueInput = page.locator('textarea[name="value"]');
    await expect(keyInput).toBeVisible();
    await keyInput.fill(uniqueKey);
    await valueInput.fill("test_value");

    await page.locator('button[type="submit"]').click();

    // Should navigate back to list
    await expect(page.locator("text=Configurations")).toBeVisible({ timeout: 5000 });

    // Verify the new config appears in the table
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 5000 });
    const newRow = table.locator(`td:has-text("${uniqueKey}")`);
    await expect(newRow).toBeVisible();

    // --- VIEW DETAIL ---
    const row = table.locator("tr", { has: page.locator(`td:has-text("${uniqueKey}")`) });
    await row.locator(".btn-view").click();

    const detail = page.locator(".config-detail");
    await expect(detail).toBeVisible();
    await expect(detail.locator(`dd:has-text("${uniqueKey}")`)).toBeVisible();

    // --- EDIT from detail ---
    await detail.locator(".btn-edit").click();

    const editValueInput = page.locator('textarea[name="value"]');
    await expect(editValueInput).toBeVisible();
    await editValueInput.clear();
    await editValueInput.fill("updated_value");
    await page.locator('button[type="submit"]').click();

    // Should navigate back to list
    await expect(page.locator("text=Configurations")).toBeVisible({ timeout: 5000 });

    // Verify updated value
    const updatedTable = page.locator("table");
    await expect(updatedTable).toBeVisible();
    const updatedCell = updatedTable
      .locator("tr", { has: page.locator(`td:has-text("${uniqueKey}")`) })
      .locator(".value-cell");
    await expect(updatedCell).toHaveText("updated_value");

    // --- DELETE ---
    const deleteBtn = updatedTable
      .locator("tr", { has: page.locator(`td:has-text("${uniqueKey}")`) })
      .locator(".btn-delete");
    await deleteBtn.click();

    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator(".btn-danger").click();

    // Verify the config is removed from the list
    await expect(
      updatedTable.locator(`td:has-text("${uniqueKey}")`)
    ).not.toBeVisible({ timeout: 5000 });
  });
});
