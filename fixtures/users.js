/**
 * Seeded agent accounts — Section 3.1 "User types".
 * Values are pulled from .env so real credentials never live in source
 * control (Section 4.6 access/credentials guidance).
 *
 * VERIFY: confirm these six account types actually exist in your cohort's
 * seed data, and that email is the login identifier (not a username/agent ID).
 */
require('dotenv').config();

module.exports = {
  validAgent: {
    email: process.env.VALID_AGENT_EMAIL || 'agent.valid@insurance.test',
    password: process.env.VALID_AGENT_PASSWORD || 'ChangeMe123!',
  },
  newAgent: {
    email: process.env.NEW_AGENT_EMAIL || 'agent.new@insurance.test',
    password: process.env.NEW_AGENT_PASSWORD || 'ChangeMe123!',
  },
  lockedAgent: {
    email: process.env.LOCKED_AGENT_EMAIL || 'agent.locked@insurance.test',
    password: process.env.LOCKED_AGENT_PASSWORD || 'ChangeMe123!',
  },
  mfaAgent: {
    email: process.env.MFA_AGENT_EMAIL || 'agent.mfa@insurance.test',
    password: process.env.MFA_AGENT_PASSWORD || 'ChangeMe123!',
  },
  adminUser: {
    email: process.env.ADMIN_EMAIL || 'admin@insurance.test',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },
  invalidUser: {
    email: 'nonexistent.agent@insurance.test',
    password: 'WrongPassword999!',
  },
};
