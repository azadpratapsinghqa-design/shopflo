// pages/InventoryPage.js
class InventoryPage {
  constructor(page) {
    this.page = page;
    this.inventoryItems  = page.locator('.inventory_item');
    this.sortDropdown    = page.locator('[data-test="product-sort-container"]');
    this.cartBadge       = page.locator('.shopping_cart_badge');
    this.cartIcon        = page.locator('.shopping_cart_link');
    this.burgerMenu      = page.locator('#react-burger-menu-btn');
    this.logoutLink      = page.locator('#logout_sidebar_link');
  }

  async isLoaded() {
    await this.page.waitForURL('**/inventory.html');
    return this.inventoryItems.first().isVisible();
  }

  async getItemCount() {
    return this.inventoryItems.count();
  }

  async addItemToCartByName(name) {
    const item = this.page.locator('.inventory_item').filter({ hasText: name });
    await item.locator('button').click();
  }

async addAllItemsToCart() {
  const items = this.page.locator('[data-test="inventory-item"]');
  const count = await items.count();
  
  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    const itemName = await item.locator('[data-test="inventory-item-name"]').textContent();
    
    // Click the button inside this specific item
    await item.locator('button').click();
    
    console.log(`Added "${itemName}" to cart`);
    await this.page.waitForTimeout(500);
  }
  return count;
}

  async getCartBadgeCount() {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text, 10);
  }

  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames() {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices() {
    const priceTexts = await this.page.locator('.inventory_item_price').allTextContents();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async openProductDetail(name) {
    await this.page.locator('.inventory_item_name').filter({ hasText: name }).click();
  }

  async logout() {
    await this.burgerMenu.click();
    await this.logoutLink.click();
  }
}

module.exports = { InventoryPage };
