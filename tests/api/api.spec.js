const { test, expect } = require('@playwright/test');
const apiClient = require('../../utils/apiClient');
const users = require('../../fixtures/users');
const dataGen = require('../../utils/dataGenerator');
const applicationData = require('../../fixtures/applicationData');

const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:8083';

test.describe('API Validation — Insurance Order Entry', () => {
  let token;
  let secondAgentToken;

  test.beforeAll(async ({ request }) => {
    const result = await apiClient.login(request, BASE_URL, users.validAgent);
    token = result.token;

    const secondResult = await apiClient.login(request, BASE_URL, users.newAgent);
    secondAgentToken = secondResult.token;
  });

  test('API-V01: Products API returns 200 and expected schema @api @regression', async ({ request }) => {
    const response = await apiClient.getProducts(request, BASE_URL, token);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.products || body)).toBe(true);
    const list = body.products || body;
    if (list.length > 0) {
      // VERIFY exact schema keys against the real API response shape.
      expect(list[0]).toHaveProperty('id');
      expect(list[0]).toHaveProperty('name');
    }
  });

  test('API-V02: Application API requires authorization @api @regression', async ({ request }) => {
    const response = await apiClient.getApplications(request, BASE_URL, null);
    expect([401, 403]).toContain(response.status());
  });

  test('API-V03: Client API rejects invalid DOB @api @regression', async ({ request }) => {
    // Uses a placeholder application id — VERIFY whether the API validates
    // DOB before checking application existence, or requires a real,
    // previously-created application id for this endpoint to respond meaningfully.
    const futureDobPayload = { ...dataGen.futureDobClient() };
    const response = await apiClient.updateClientInfo(
      request,
      BASE_URL,
      token,
      'placeholder-app-id',
      futureDobPayload
    );
    expect([400, 422]).toContain(response.status());
  });

  test('API-V04: Validation API returns beneficiary allocation error @api @regression', async ({
    request,
  }) => {
    const response = await apiClient.postBeneficiaries(
      request,
      BASE_URL,
      token,
      'placeholder-app-id',
      applicationData.beneficiaries.underAllocated
    );
    const body = await response.json().catch(() => ({}));
    expect([400, 422]).toContain(response.status());
    // VERIFY the actual error field/shape the API returns for allocation issues.
    expect(JSON.stringify(body).toLowerCase()).toContain('allocation');
  });

  test('API-V05: Submission API rejects incomplete application @api @regression', async ({ request }) => {
    const response = await apiClient.submitApplication(request, BASE_URL, token, 'placeholder-app-id');
    expect([400, 409, 422]).toContain(response.status());
  });

  test('API-V06: Application status API matches dashboard @api @regression', async ({ request }) => {
    const appsResponse = await apiClient.getApplications(request, BASE_URL, token);
    expect(appsResponse.status()).toBe(200);
    const body = await appsResponse.json();
    const applications = body.applications || body;

    test.skip(!applications || applications.length === 0, 'No applications exist yet to compare status for.');

    const first = applications[0];
    const statusResponse = await apiClient.getApplicationStatus(request, BASE_URL, token, first.id);
    expect(statusResponse.status()).toBe(200);
    const statusBody = await statusResponse.json();
    expect(statusBody.status).toBe(first.status);
  });

  test('API-V07: Product API supports product detail retrieval @api @regression', async ({ request }) => {
    const listResponse = await apiClient.getProducts(request, BASE_URL, token);
    const body = await listResponse.json();
    const list = body.products || body;

    test.skip(!list || list.length === 0, 'No products returned to fetch a detail for.');

    const productId = list[0].id;
    const detailResponse = await apiClient.getProductDetail(request, BASE_URL, token, productId);
    expect(detailResponse.status()).toBe(200);
    const detail = await detailResponse.json();
    expect(detail.id).toBe(productId);
  });

  test('API-V08: Applications API returns only logged-in agent records @api @regression', async ({
    request,
  }) => {
    const firstAgentResponse = await apiClient.getApplications(request, BASE_URL, token);
    const secondAgentResponse = await apiClient.getApplications(request, BASE_URL, secondAgentToken);

    expect(firstAgentResponse.status()).toBe(200);
    expect(secondAgentResponse.status()).toBe(200);

    const firstBody = await firstAgentResponse.json();
    const secondBody = await secondAgentResponse.json();
    const firstIds = (firstBody.applications || firstBody).map((a) => a.id);
    const secondIds = (secondBody.applications || secondBody).map((a) => a.id);

    const overlap = firstIds.filter((id) => secondIds.includes(id));
    expect(overlap.length).toBe(0);
  });
});
