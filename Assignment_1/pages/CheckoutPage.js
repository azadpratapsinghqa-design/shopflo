// pages/CheckoutPage.js
class CheckoutPage {
  constructor(page) {
    this.page = page;
    // Step 1
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput  = page.locator('[data-test="lastName"]');
    this.zipCodeInput   = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton   = page.locator('[data-test="cancel"]');
    this.errorMessage   = page.locator('[data-test="error"]');
    // Step 2
    this.finishButton   = page.locator('[data-test="finish"]');
    this.itemTotal      = page.locator('.summary_subtotal_label');
    this.taxAmount      = page.locator('.summary_tax_label');
    this.totalAmount    = page.locator('.summary_total_label');
    // Confirmation
    this.confirmationHeader = page.locator('.complete-header');
  }

  async fillShippingInfo(firstName, lastName, zip) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipCodeInput.fill(zip);
  }

  async continue() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getErrorText() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }

  async getConfirmationText() {
    return this.confirmationHeader.textContent();
  }

  async getItemTotal() {
    const text = await this.itemTotal.textContent();
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTotalAmount() {
    const text = await this.totalAmount.textContent();
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }
}

module.exports = { CheckoutPage };
