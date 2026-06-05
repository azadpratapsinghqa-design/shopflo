// pages/CartPage.js
class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems       = page.locator('.cart_item');
    this.checkoutButton  = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async isLoaded() {
    await this.page.waitForURL('**/cart.html');
  }

  async getItemCount() {
    return this.cartItems.count();
  }

  async getItemNames() {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async removeItemByName(name) {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator('[data-test^="remove"]').click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}

module.exports = { CartPage };
