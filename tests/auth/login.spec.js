const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const users = require('../../fixtures/users');
const { repeatInvalidLogin } = require('../../utils/testHelpers');

test.describe('Insurance Order Entry — Authentication', () => {
  test('AUTH-V01: valid agent can log in successfully @smoke @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.validAgent.email, users.validAgent.password);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('AUTH-V02: invalid password displays correct error message @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.validAgent.email, 'WrongPassword123!');

    await expect(loginPage.generalError).toBeVisible();
  });

  test('AUTH-V03: blank username and password show mandatory validation @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitEmptyForm();

    await expect(loginPage.emailFieldError).toBeVisible();
    await expect(loginPage.passwordFieldError).toBeVisible();
  });

  test('AUTH-V04: logout clears session and redirects to login page @smoke @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.validAgent.email, users.validAgent.password);
    await expect(page).toHaveURL(/\/dashboard/);

    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);

    // Protected route should now redirect back to login (ties into AUTH-V05).
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-V05: direct access to dashboard without login is blocked @smoke @auth @regression', async ({ browser }) => {
    // Fresh, unauthenticated context — no cookies/session carried over.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });

  test('AUTH-V06: locked user cannot access dashboard @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.lockedAgent.email, users.lockedAgent.password);

    await expect(loginPage.accountLockedMessage).toBeVisible();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  // Included for completeness though outside the reduced 30-35 core count —
  // exercises the same lockout-after-5-attempts rule as AUTH-V07 in the spec.
  test.skip('AUTH-V07: account locks after five failed login attempts @auth @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await repeatInvalidLogin(loginPage, users.validAgent.email, 'WrongPassword123!', 5);

    await expect(loginPage.accountLockedMessage).toBeVisible();
  });
});
