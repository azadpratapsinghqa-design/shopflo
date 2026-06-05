// tests/inventory.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');
});

// ── POSITIVE ──────────────────────────────────────────────────────────────────
test.describe('Inventory — Positive', () => {

  test('TC-P-005 | exactly 6 products displayed', async ({ page }) => {
    const inv = new InventoryPage(page);
    expect(await inv.getItemCount()).toBe(6);
  });

  test('TC-P-006 | sort A→Z orders products alphabetically ascending', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.sortBy('az');
    const names = await inv.getProductNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('TC-P-007 | sort Z→A orders products alphabetically descending', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.sortBy('za');
    const names = await inv.getProductNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  test('TC-P-008 | sort Price Low→High is ascending', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.sortBy('lohi');
    const prices = await inv.getProductPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('TC-P-009 | sort Price High→Low is descending', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.sortBy('hilo');
    const prices = await inv.getProductPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test('TC-P-010 | product detail page opens with correct content', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.openProductDetail('Sauce Labs Backpack');
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toContainText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_details_price')).toBeVisible();
    await expect(page.locator('[data-test="add-to-cart"]')).toBeVisible();
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('TC-P-010 | back button from detail page returns to inventory', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.openProductDetail('Sauce Labs Backpack');
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('TC-P-011 | add to cart shows badge count 1', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    expect(await inv.getCartBadgeCount()).toBe(1);
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('TC-P-012 | add multiple items increments badge correctly', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.addItemToCartByName('Sauce Labs Bike Light');
    await inv.addItemToCartByName('Sauce Labs Bolt T-Shirt');
    expect(await inv.getCartBadgeCount()).toBe(3);
  });

  test('All products have prices greater than $0', async ({ page }) => {
    const inv = new InventoryPage(page);
    const prices = await inv.getProductPrices();
    prices.forEach(p => expect(p).toBeGreaterThan(0));
  });
});

// ── NEGATIVE ──────────────────────────────────────────────────────────────────
test.describe('Inventory — Negative', () => {

test('TC-N-013 | problem_user sees incorrect product images', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('problem_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');

  // Get all product image src URLs
  const imageSrcs = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.inventory_item img'));
    return imgs.map(img => img.src);
  });

  // Known defect: problem_user sees duplicate image URLs (all pointing to same image)
  const uniqueSrcs = new Set(imageSrcs);
  expect(uniqueSrcs.size).toBeLessThan(imageSrcs.length);
});
});
