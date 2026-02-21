import { test, expect } from "@playwright/test";

const uniqueKey = `e2e_test_${Date.now()}`;

test.describe("Config CRUD flow", () => {
  test("create → read → update → delete lifecycle", async ({ page }) => {
    await page.goto("/");

    const appRoot = page.locator("app-root");

    // --- CREATE ---
    const configList = appRoot.locator("config-list");
    await expect(configList).toBeVisible({ timeout: 5000 });

    const newBtn = configList.locator("#btn-new");
    await newBtn.click();

    const form = appRoot.locator("config-form");
    await expect(form).toBeVisible();

    const keyInput = form.locator('input[name="key"]');
    const valueInput = form.locator('textarea[name="value"]');
    await keyInput.fill(uniqueKey);
    await valueInput.fill("test_value");

    const saveBtn = form.locator('button[type="submit"]');
    await saveBtn.click();

    // Should navigate back to list
    const listAfterCreate = appRoot.locator("config-list");
    await expect(listAfterCreate).toBeVisible({ timeout: 5000 });

    // Verify the new config appears in the table
    const table = listAfterCreate.locator("table");
    await expect(table).toBeVisible({ timeout: 5000 });
    const newRow = table.locator(`td:has-text("${uniqueKey}")`);
    await expect(newRow).toBeVisible();

    // --- VIEW DETAIL ---
    const viewBtn = table
      .locator("tr", { has: page.locator(`td:has-text("${uniqueKey}")`) })
      .locator(".btn-view");
    await viewBtn.click();

    const detail = appRoot.locator("config-detail");
    await expect(detail).toBeVisible();
    const detailText = detail.locator(`dd:has-text("${uniqueKey}")`);
    await expect(detailText).toBeVisible();

    // --- EDIT from detail ---
    const editBtn = detail.locator(".btn-edit");
    await editBtn.click();

    const editForm = appRoot.locator("config-form");
    await expect(editForm).toBeVisible();

    const editValueInput = editForm.locator('textarea[name="value"]');
    await editValueInput.clear();
    await editValueInput.fill("updated_value");

    const editSaveBtn = editForm.locator('button[type="submit"]');
    await editSaveBtn.click();

    // Should navigate back to list
    const listAfterEdit = appRoot.locator("config-list");
    await expect(listAfterEdit).toBeVisible({ timeout: 5000 });

    // Verify updated value
    const updatedTable = listAfterEdit.locator("table");
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

    const dialog = listAfterEdit.locator("confirm-dialog dialog");
    await expect(dialog).toBeVisible();

    const confirmBtn = dialog.locator(".btn-danger");
    await confirmBtn.click();

    // Verify the config is removed from the list
    await expect(
      updatedTable.locator(`td:has-text("${uniqueKey}")`)
    ).not.toBeVisible({ timeout: 5000 });
  });
});
