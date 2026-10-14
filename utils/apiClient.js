/**
 * Thin wrapper around Playwright's APIRequestContext for the endpoints in
 * Section 3.9. Centralizing auth-header handling here means every API test
 * doesn't have to re-derive the token/session logic.
 *
 * VERIFY: confirm the real auth scheme (bearer token vs. cookie session)
 * against the live app — this assumes a bearer token returned from
 * POST /api/auth/login, consistent with the "token/session response"
 * language in API-V01's validation focus.
 */

async function login(request, baseURL, { email, password }) {
  const response = await request.post(`${baseURL}/api/auth/login`, {
    data: { email, password },
  });
  let token = null;
  if (response.ok()) {
    const body = await response.json().catch(() => ({}));
    token = body.token || body.accessToken || null;
  }
  return { response, token };
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getProducts(request, baseURL, token) {
  return request.get(`${baseURL}/api/products`, { headers: authHeaders(token) });
}

async function getProductDetail(request, baseURL, token, productId) {
  return request.get(`${baseURL}/api/products/${productId}`, { headers: authHeaders(token) });
}

async function getApplications(request, baseURL, token) {
  return request.get(`${baseURL}/api/applications`, { headers: authHeaders(token) });
}

async function getApplicationStatus(request, baseURL, token, applicationId) {
  return request.get(`${baseURL}/api/applications/${applicationId}/status`, {
    headers: authHeaders(token),
  });
}

async function updateClientInfo(request, baseURL, token, applicationId, clientPayload) {
  return request.post(`${baseURL}/api/applications/${applicationId}/client`, {
    headers: authHeaders(token),
    data: clientPayload,
  });
}

async function validateApplication(request, baseURL, token, applicationId) {
  return request.post(`${baseURL}/api/applications/${applicationId}/validate`, {
    headers: authHeaders(token),
  });
}

async function submitApplication(request, baseURL, token, applicationId) {
  return request.post(`${baseURL}/api/applications/${applicationId}/submit`, {
    headers: authHeaders(token),
  });
}

async function getBeneficiaries(request, baseURL, token, applicationId) {
  return request.get(`${baseURL}/api/applications/${applicationId}/beneficiaries`, {
    headers: authHeaders(token),
  });
}

async function postBeneficiaries(request, baseURL, token, applicationId, beneficiariesPayload) {
  return request.post(`${baseURL}/api/applications/${applicationId}/beneficiaries`, {
    headers: authHeaders(token),
    data: beneficiariesPayload,
  });
}

module.exports = {
  login,
  authHeaders,
  getProducts,
  getProductDetail,
  getApplications,
  getApplicationStatus,
  updateClientInfo,
  validateApplication,
  submitApplication,
  getBeneficiaries,
  postBeneficiaries,
};
