# Insurance Order Entry — Playwright/JavaScript QA Automation

Playwright automation for the Insurance Order Entry platform (MassMutual India tech forum
project), covering agent authentication, client intake, product/rider configuration,
beneficiary management, document upload, full application submission, and API validation.

Built in plain JavaScript (CommonJS) with the Page Object Model, matching the conventions
used in the companion FinServe Retail Demo Platform automation project.

## ⚠️ Before you run anything: locator verification required

Every page object and several fixtures were written directly from the project's written
functional spec (field names, button labels, route structure) — **not from inspecting the
live application**, since it isn't available in this environment. Every assumed selector,
field label, or business-rule constant is marked with a `VERIFY` comment. Run a search for
them before trusting any test result:

```bash
grep -rn "VERIFY" --include="*.js" .
```

This is the same pattern that caught the FinServe `LoginPage` testid mismatch — expect to
spend a first pass in DevTools confirming or correcting these before the suite is reliable.
Highest-impact items to check first:

- **`fixtures/users.js`** — do all six seeded account types (valid, new, locked, MFA, admin,
  invalid) actually exist for your cohort, and is email the login identifier?
- **`fixtures/applicationData.js`** — `productId`/`riderId` values (`WL-STANDARD-001`, `ADB`,
  `WAIVER-DISABILITY`, etc.) are placeholders. Confirm real IDs via `GET /api/products` and
  `GET /api/riders` first, or every rider/product test will fail on a 404 rather than the
  behavior being tested.
- **`pages/LoginPage.js`, `pages/*.js`** — every field label regex (`getByLabel(/email/i)`,
  etc.) and every `data-testid` string needs a DevTools check.
- **`tests/workflow/application-submission.spec.js`** — the "Save Draft" button and the
  exact page sequence (does product selection happen on `/products` first, or directly on
  `/applications/:id/product`?) are assumed; confirm against the real flow.
- **`utils/apiClient.js`** — assumes a bearer token returned from `POST /api/auth/login`.
  If the app uses cookie-based sessions instead, this whole client needs reworking.

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env   # then fill in real BASE_URL, API_BASE_URL, and agent credentials
```

This container had no network access, so dependencies were never installed here and no test
run or `--list` collection check was performed — only `node --check` syntax validation on
every file. **Your first command after `npm install` should be:**

```bash
npx playwright test --list
```

to confirm Playwright discovers all specs before doing anything else — the same first step
used to catch the FinServe "No tests found" issue.

## Running tests

```bash
npm test                 # full suite, all browser projects
npm run test:smoke       # @smoke-tagged tests only
npm run test:regression  # @regression-tagged tests
npm run test:api         # API project only, no browser needed
npm run test:auth        # just tests/auth
npm run test:headed      # any of the above with a visible browser
npm run report           # open the last HTML report
```

## Project structure

```
insurance-order-entry-playwright-automation/
├── tests/
│   ├── auth/                  # AUTH-V01..V06
│   ├── client-information/    # CLI-V01..V03
│   ├── product-selection/     # PROD-V01, V03
│   ├── riders/                 # RIDER-V01, V02, V04, V05
│   ├── beneficiaries/          # BEN-V01, V02, V03, V05, V08
│   ├── documents/              # DOC-V02, VAL-V03
│   ├── workflow/               # WF-V01, WF-V03 (+ V04/V06 assertions inline)
│   └── api/                    # API-V01..V08
├── pages/                      # One Page Object per screen (Section 4.4)
├── fixtures/
│   ├── users.js                 # Seeded agent accounts
│   ├── applicationData.js       # Prebuilt data bundles for common scenarios
│   └── auth.fixture.js          # `agentPage`, `dashboardPage`, `newApplicationId` fixtures
├── utils/
│   ├── routes.js                # Centralized route map
│   ├── dataGenerator.js         # Random/boundary client, address, beneficiary data
│   ├── apiClient.js             # Playwright request-context wrapper for API tests
│   ├── assertions.js            # Shared custom assertions
│   ├── fileUploadHelper.js      # Temp file generation for upload tests
│   └── testHelpers.js           # Misc shared helpers
├── reports/                     # HTML/JSON/JUnit reports land here (gitignored contents)
├── playwright.config.js
├── .env.example
└── .github/workflows/playwright.yml
```

## Test scope (reduced cohort: ~32 tests)

Per the spec's guidance for shorter cohorts ("30-35 tests while retaining authentication,
one full application submission E2E flow, beneficiary allocation validation, rider
validation, API validation, and reporting artifacts"):

| Module | Tests | Validation IDs covered |
|---|---|---|
| Authentication | 6 | AUTH-V01–V06 (V07 lockout stubbed as `test.skip`, needs a disposable account) |
| Client Information | 3 | CLI-V01, V02, V03 |
| Product Selection | 2 | PROD-V01, V03 |
| Riders | 4 | RIDER-V01, V02, V04, V05 |
| Beneficiaries | 5 | BEN-V01, V02, V03, V05, V08 |
| Documents / Validation | 2 | DOC-V02, VAL-V03 |
| Full E2E Workflow | 2 | WF-V01, WF-V03 (asserts V04 read-only + V06 dashboard status inline) |
| API | 8 | API-V01–V08 |
| **Total** | **32** | |

Not automated in this reduced scope (candidates for the next cycle, per the full ~60-test
table in the spec): Dashboard module tests (DASH-V01–V06), remaining Client Info edge cases
(CLI-V04–V10), remaining Product tests (PROD-V02, V04–V07), remaining Rider tests
(RIDER-V03, V06, V07), remaining Beneficiary tests (BEN-V04, V06, V07, V09), DOC-V01/V03,
VAL-V01/V02, and WF-V02/V05/V07.

## Reporting artifacts (Section 4.5 / evidence guidelines)

`playwright.config.js` is configured to always produce:

- HTML report → `reports/html-report/`
- JSON results → `reports/results.json`
- JUnit XML → `reports/junit-results.xml`
- Screenshots on failure, video retained on failure, trace on first retry →
  `test-results/`

For a submission package, zip `reports/` and `test-results/` alongside the code repository
after a full `npm test` run.

## Distinguishing application defects from automation defects

Per the automation best practices in the spec, if a test fails:

1. Open the trace (`npx playwright show-trace test-results/<test>/trace.zip`) before
   assuming it's an app bug.
2. Check whether the failure is a locator mismatch (an automation/test-authoring issue —
   fix the page object) versus genuinely wrong application behavior (a real defect — log it,
   following the same Defect Log format used for the FinServe project).
3. Only escalate to the defect log once you've ruled out the test's own assumptions —
   several `VERIFY` items above are exactly the kind of thing that produces a false failure.
