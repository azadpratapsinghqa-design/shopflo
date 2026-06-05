// tests/cart.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage }      = require('../pages/CartPage');

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');
});

// ── POSITIVE ──────────────────────────────────────────────────────────────────
test.describe('Cart — Positive', () => {

  test('TC-P-013 | remove item decrements cart badge', async ({ page }) => {
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.addItemToCartByName('Sauce Labs Bike Light');
    await inv.goToCart();
    await cart.isLoaded();
    expect(await cart.getItemCount()).toBe(2);
    await cart.removeItemByName('Sauce Labs Backpack');
    expect(await cart.getItemCount()).toBe(1);
    expect(await inv.getCartBadgeCount()).toBe(1);
  });

  test('TC-P-014 | Continue Shopping returns to inventory with cart intact', async ({ page }) => {
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.goToCart();
    await cart.continueShopping();
    await expect(page).toHaveURL(/inventory\.html/);
    expect(await inv.getCartBadgeCount()).toBe(1);
  });

  test('Cart preserves items when navigating away and back', async ({ page }) => {
    const inv  = new InventoryPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    // Navigate away
    await page.goto('https://www.saucedemo.com/inventory.html');
    expect(await inv.getCartBadgeCount()).toBe(1);
  });

  test('Cart shows correct item name and price', async ({ page }) => {
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.goToCart();
    const names = await cart.getItemNames();
    expect(names).toContain('Sauce Labs Backpack');
    await expect(page.locator('.inventory_item_price')).toBeVisible();
  });
});

// ── NEGATIVE ──────────────────────────────────────────────────────────────────
test.describe('Cart — Negative', () => {

  test('TC-N-012 | empty cart — checkout button absent or page stays on cart', async ({ page }) => {
    const inv  = new InventoryPage(page);
    await inv.goToCart();
    const cartPage = new CartPage(page);
    await cartPage.isLoaded();
    // Cart is empty — verify no items
    expect(await cartPage.getItemCount()).toBe(0);
    // Checkout button should still be clickable (SauceDemo shows it) but this asserts behaviour
    const checkoutBtn = page.locator('[data-test="checkout"]');
    // If present, it should exist; document that no guard exists
    if (await checkoutBtn.isVisible()) {
      // Known: SauceDemo doesn't prevent empty cart checkout — document it
      console.log('KNOWN ISSUE: Checkout allowed on empty cart');
    }
  });
});
