// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');

const VALID_PASSWORD = 'secret_sauce';
const VALID_USERS    = ['standard_user', 'performance_glitch_user', 'problem_user', 'error_user'];

// ── POSITIVE ──────────────────────────────────────────────────────────────────
test.describe('Login — Positive', () => {

  for (const username of VALID_USERS) {
    test(`TC-P-00x | valid login as ${username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      await loginPage.goto();
      await loginPage.login(username, VALID_PASSWORD);
      await expect(page).toHaveURL(/inventory\.html/);
      expect(await inventoryPage.getItemCount()).toBe(6);
    });
  }

  test('TC-P-001 | standard_user redirected to /inventory.html', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', VALID_PASSWORD);
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('TC-P-001 | login button is enabled on page load', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('TC-P-001 | page title is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Swag Labs/);
  });
});

// ── NEGATIVE ──────────────────────────────────────────────────────────────────
test.describe('Login — Negative', () => {

  test('TC-N-001 | wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorText()).toContain('Username and password do not match');
  });

  test('TC-N-002 | empty credentials shows username required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorText()).toContain('Username is required');
  });

  test('TC-N-003 | empty password shows password required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorText()).toContain('Password is required');
  });

  test('TC-N-004 | locked_out_user shows locked error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_out_user', VALID_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorText()).toContain('locked out');
  });

  test('TC-N-005 | SQL injection does not bypass login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("' OR 1=1--", VALID_PASSWORD);
    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-N-006 | XSS payload is not executed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Listen for dialog — if XSS fires, it might show alert
    let alertFired = false;
    page.on('dialog', async dialog => {
      alertFired = true;
      await dialog.dismiss();
    });

    await loginPage.login('<script>alert(1)</script>', VALID_PASSWORD);
    expect(alertFired).toBe(false);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('TC-N-007 | very long username handled gracefully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const longUser = 'a'.repeat(500);
    await loginPage.login(longUser, VALID_PASSWORD);
    // Should not crash; page should remain stable
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('TC-N-008 | direct navigation to /inventory.html without auth redirects to login', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('TC-N-009 | direct navigation to /cart.html without auth redirects to login', async ({ page }) => {
    await page.goto('/cart.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('TC-N-010 | direct navigation to /checkout-step-one without auth redirects to login', async ({ page }) => {
    await page.goto('/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
