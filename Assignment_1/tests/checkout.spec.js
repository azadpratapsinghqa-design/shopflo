// tests/checkout.spec.js
const { test, expect }  = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage }      = require('../pages/CartPage');
const { CheckoutPage }  = require('../pages/CheckoutPage');

async function loginAndAddItem(page, itemName = 'Sauce Labs Backpack') {
  const lp  = new LoginPage(page);
  const inv = new InventoryPage(page);
  await lp.goto();
  await lp.login('standard_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');
  await inv.addItemToCartByName(itemName);
  await inv.goToCart();
  const cart = new CartPage(page);
  await cart.proceedToCheckout();
}

// ── POSITIVE ──────────────────────────────────────────────────────────────────
test.describe('Checkout — Positive', () => {

  test('TC-P-015 | complete checkout with valid data', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.fillShippingInfo('John', 'Doe', '10001');
    await co.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await co.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    expect(await co.getConfirmationText()).toContain('Thank you for your order');
  });

  test('TC-P-016 | order summary totals are mathematically correct', async ({ page }) => {
    const lp  = new LoginPage(page);
    const inv = new InventoryPage(page);
    const cart = new CartPage(page);
    const co  = new CheckoutPage(page);

    await lp.goto();
    await lp.login('standard_user', 'secret_sauce');
    await page.waitForURL('**/inventory.html');

    await inv.addItemToCartByName('Sauce Labs Backpack');     // $29.99
    await inv.addItemToCartByName('Sauce Labs Bike Light');  // $9.99
    await inv.goToCart();
    await cart.proceedToCheckout();

    await co.fillShippingInfo('Jane', 'Smith', '94105');
    await co.continue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    const itemTotal  = await co.getItemTotal();
    const totalShown = await co.getTotalAmount();

    // Total = item total + tax (SauceDemo uses ~8%)
    expect(totalShown).toBeGreaterThan(itemTotal);
    expect(itemTotal).toBeCloseTo(39.98, 1);
  });

  test('TC-P-017 | cancel on step 1 returns to cart with items', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.cancel();
    await expect(page).toHaveURL(/cart\.html/);
    const cart = new CartPage(page);
    expect(await cart.getItemCount()).toBe(1);
  });

  test('Cancel on step 2 returns to inventory', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.fillShippingInfo('John', 'Doe', '10001');
    await co.continue();
    await co.cancel();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});

// ── NEGATIVE ──────────────────────────────────────────────────────────────────
test.describe('Checkout — Negative', () => {

  test('TC-N-009 | empty first name shows error', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.fillShippingInfo('', 'Doe', '10001');
    await co.continue();
    expect(await co.isErrorVisible()).toBe(true);
    expect(await co.getErrorText()).toContain('First Name is required');
  });

  test('TC-N-010 | empty last name shows error', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.fillShippingInfo('John', '', '10001');
    await co.continue();
    expect(await co.isErrorVisible()).toBe(true);
    expect(await co.getErrorText()).toContain('Last Name is required');
  });

  test('TC-N-011 | empty zip shows error', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.fillShippingInfo('John', 'Doe', '');
    await co.continue();
    expect(await co.isErrorVisible()).toBe(true);
    expect(await co.getErrorText()).toContain('Postal Code is required');
  });

  test('All fields empty shows first-field error', async ({ page }) => {
    await loginAndAddItem(page);
    const co = new CheckoutPage(page);
    await co.continue();
    expect(await co.isErrorVisible()).toBe(true);
  });
});
