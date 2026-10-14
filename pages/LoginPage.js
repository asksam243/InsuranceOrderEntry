const routes = require('../utils/routes');

/**
 * VERIFY against the live app: field labels ("Email"/"Password"), the
 * login button's accessible name, and every data-testid below. These
 * follow the stable-locator guidance in Section 4.6 (getByRole/getByLabel
 * first, data-testid as fallback) but are placeholders until confirmed —
 * same pattern as the FinServe LoginPage fix.
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /log in|sign in/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });

    this.generalError = page.getByTestId('login-error-message');
    this.emailFieldError = page.getByTestId('email-error');
    this.passwordFieldError = page.getByTestId('password-error');
    this.accountLockedMessage = page.getByTestId('account-locked-message');
    this.mfaCodeInput = page.getByLabel(/verification code|otp/i);
    this.mfaSubmitButton = page.getByRole('button', { name: /verify/i });
  }

  async goto() {
    await this.page.goto(routes.LOGIN);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async submitEmptyForm() {
    await this.emailInput.fill('');
    await this.passwordInput.fill('');
    await this.loginButton.click();
  }

  async logout() {
    await this.page.getByRole('button', { name: /logout|log out/i }).click();
  }

  async submitMfaCode(code) {
    await this.mfaCodeInput.fill(code);
    await this.mfaSubmitButton.click();
  }
}

module.exports = { LoginPage };
