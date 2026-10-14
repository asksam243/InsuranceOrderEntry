const dataGen = require('../utils/dataGenerator');

/**
 * Pre-built data bundles for the most common test scenarios, so tests read
 * declaratively (`applicationData.validSubmission`) instead of rebuilding
 * client/rider/beneficiary data inline every time.
 *
 * VERIFY: productId/riderId values are placeholders — confirm the real
 * seeded product and rider identifiers/names in the live catalog
 * (GET /products, GET /riders) before relying on these in tests.
 */
module.exports = {
  // A complete, valid end-to-end application payload (WF-V03).
  validSubmission: {
    client: dataGen.validClient(),
    address: dataGen.validAddress(),
    contact: dataGen.validContact(),
    kyc: dataGen.validKyc(),
    product: {
      productId: 'WL-STANDARD-001', // VERIFY against live product catalog
      faceValue: '250000',
      premiumFrequency: 'Monthly',
      paymentTerm: '20 Pay',
      policyTerm: 'Whole Life',
    },
    riders: [
      { riderId: 'ADB', name: 'Accidental Death Benefit' }, // VERIFY rider id
    ],
    beneficiaries: [
      dataGen.beneficiary({ relationship: 'Spouse', allocationPercent: 100 }),
    ],
  },

  // Rider edge cases (RIDER-V02, V04, V05).
  riders: {
    excessiveCoverageRider: { riderId: 'ADB', coverageAmount: '999999999' },
    waiverRiderA: 'WAIVER-DISABILITY', // VERIFY id
    waiverRiderB: 'WAIVER-UNEMPLOYMENT', // VERIFY id — mutually exclusive with A
    maxRiderAttemptList: [
      'ADB', 'WAIVER-DISABILITY', 'CRITICAL-ILLNESS', 'CHILD-TERM',
      'GUARANTEED-INSURABILITY', 'ACCELERATED-DEATH-BENEFIT',
    ], // VERIFY actual max-count threshold in the live app before relying on this list length
  },

  // Beneficiary edge cases (BEN-V02, V03, V05, V08).
  beneficiaries: {
    underAllocated: [dataGen.beneficiary({ allocationPercent: 40 })],
    overAllocated: [
      dataGen.beneficiary({ allocationPercent: 70 }),
      dataGen.beneficiary({ allocationPercent: 60 }),
    ],
    minor: dataGen.beneficiary({ age: 10, relationship: 'Child' }),
    duplicatePair() {
      const first = dataGen.beneficiary({ firstName: 'Dana', lastName: 'Duplicate', relationship: 'Sibling' });
      const duplicate = { ...first }; // same Name + DOB + Relationship -> should be blocked
      return [first, duplicate];
    },
  },

  // Product boundary data (PROD-V03).
  product: {
    belowMinimumFaceValue: '1000', // VERIFY actual product minimum before asserting rejection
  },
};
