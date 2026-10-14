const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const users = require('./users');
const { extractApplicationId } = require('../utils/testHelpers');

/**
 * Extends Playwright's base test with an `agentPage` fixture: a page that's
 * already logged in as the valid agent, plus the DashboardPage object ready
 * to use. Saves every workflow/E2E test from repeating the login boilerplate.
 *
 * Usage:
 *   const { test, expect } = require('../../fixtures/auth.fixture');
 *   test('...', async ({ agentPage, dashboardPage }) => { ... });
 */
const test = base.test.extend({
  agentPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.validAgent.email, users.validAgent.password);
    await base.expect(page).toHaveURL(/\/dashboard/);
    await use(page);
  },

  dashboardPage: async ({ agentPage }, use) => {
    await use(new DashboardPage(agentPage));
  },

  /**
   * Starts a fresh draft application and hands back its id, so module-level
   * tests (client info, riders, beneficiaries, etc.) can jump straight to
   * their route instead of re-driving the dashboard every time.
   * VERIFY: confirm "New Application" actually redirects to
   * /applications/:id/client (or wherever the flow starts) so the id
   * extraction below matches the real first step.
   */
  newApplicationId: async ({ agentPage, dashboardPage }, use) => {
    await dashboardPage.startNewApplication();
    await base.expect(agentPage).toHaveURL(/\/applications\/[^/]+/);
    const applicationId = extractApplicationId(agentPage.url());
    await use(applicationId);
  },
});

module.exports = { test, expect: base.expect };
