// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput   = page.locator('[data-test="username"]');
    this.passwordInput   = page.locator('[data-test="password"]');
    this.loginButton     = page.locator('[data-test="login-button"]');
    this.errorMessage    = page.locator('[data-test="error"]');
    this.errorContainer  = page.locator('.error-message-container');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }
}

module.exports = { LoginPage };
