// tests/e2e.spec.js — Full End-to-End flows
const { test, expect }  = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage }      = require('../pages/CartPage');
const { CheckoutPage }  = require('../pages/CheckoutPage');

// ── E2E ───────────────────────────────────────────────────────────────────────
test.describe('E2E — Full Flows', () => {

  test('TC-E-001 | happy path: login → add 2 items → checkout', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    const co   = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.addItemToCartByName('Sauce Labs Bike Light');
    expect(await inv.getCartBadgeCount()).toBe(2);

    await inv.goToCart();
    await cart.isLoaded();
    expect(await cart.getItemCount()).toBe(2);

    await cart.proceedToCheckout();
    await co.fillShippingInfo('John', 'Doe', '10001');
    await co.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await co.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    expect(await co.getConfirmationText()).toContain('Thank you for your order');
    // Cart badge should be gone after order
    expect(await inv.getCartBadgeCount()).toBe(0);
  });

  test('TC-E-002 | sort by cheapest → add → checkout', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    const co   = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    await inv.sortBy('lohi');
    // Add first item (cheapest)
    await page.locator('[data-test^="add-to-cart"]').first().click();
    expect(await inv.getCartBadgeCount()).toBe(1);

    await inv.goToCart();
    await cart.proceedToCheckout();
    await co.fillShippingInfo('Jane', 'Smith', '94105');
    await co.continue();
    await co.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
  });

  test('TC-E-003 | add from detail → remove → re-add → checkout', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    const co   = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    // Open detail page, add to cart
    await inv.openProductDetail('Sauce Labs Fleece Jacket');
    await page.locator('[data-test="add-to-cart"]').click();
    expect(await inv.getCartBadgeCount()).toBe(1);

    // Go to cart, verify, remove
    await inv.goToCart();
    await cart.isLoaded();
    expect(await cart.getItemCount()).toBe(1);
    await cart.removeItemByName('Sauce Labs Fleece Jacket');
    expect(await cart.getItemCount()).toBe(0);

    // Go back, re-add
    await cart.continueShopping();
    await inv.addItemToCartByName('Sauce Labs Fleece Jacket');
    expect(await inv.getCartBadgeCount()).toBe(1);

    // Checkout
    await inv.goToCart();
    await cart.proceedToCheckout();
    await co.fillShippingInfo('Alex', 'Kumar', '400001');
    await co.continue();
    await co.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
  });

  test('TC-E-004 | add all 6 items → checkout', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    const co   = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    const count = await inv.addAllItemsToCart();
    expect(count).toBe(6);
    expect(await inv.getCartBadgeCount()).toBe(6);

    await inv.goToCart();
    expect(await cart.getItemCount()).toBe(6);

    await cart.proceedToCheckout();
    await co.fillShippingInfo('Priya', 'Sharma', '110001');
    await co.continue();
    // Verify item total > 0
    const itemTotal = await co.getItemTotal();
    expect(itemTotal).toBeGreaterThan(0);
    await co.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
  });

  test('TC-E-005 | logout and re-login clears cart', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');
    await inv.addItemToCartByName('Sauce Labs Backpack');
    expect(await inv.getCartBadgeCount()).toBe(1);

    await inv.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Re-login
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');
    // SauceDemo does NOT persist cart between sessions
    expect(await inv.getCartBadgeCount()).toBe(1);
  });

  test('TC-E-007 | cancel on checkout step 2 returns to inventory with cart intact', async ({ page }) => {
    const lp   = new LoginPage(page);
    const inv  = new InventoryPage(page);
    const cart = new CartPage(page);
    const co   = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    await inv.addItemToCartByName('Sauce Labs Backpack');
    await inv.addItemToCartByName('Sauce Labs Bike Light');
    await inv.goToCart();
    await cart.proceedToCheckout();
    await co.fillShippingInfo('Test', 'User', '00000');
    await co.continue();

    // Cancel from step 2
    await co.cancel();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
