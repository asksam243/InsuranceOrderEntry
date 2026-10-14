const routes = require('../utils/routes');

/**
 * VERIFY: exact testids for dynamic beneficiary rows/cards, the allocation
 * total element, and duplicate/guardian error copy against the live app.
 * Beneficiary rows are assumed to be indexed (0-based) in DOM order.
 */
class BeneficiaryPage {
  constructor(page) {
    this.page = page;
    this.addBeneficiaryButton = page.getByRole('button', { name: /add beneficiary/i });
    this.allocationTotal = page.getByTestId('allocation-total');
    this.secondaryAllocationTotal = page.getByTestId('secondary-allocation-total');

    this.beneficiaryRow = (index) => page.getByTestId(`beneficiary-row-${index}`);
    this.firstNameInput = (index) => page.getByTestId(`beneficiary-${index}-first-name`);
    this.lastNameInput = (index) => page.getByTestId(`beneficiary-${index}-last-name`);
    this.relationshipSelect = (index) => page.getByTestId(`beneficiary-${index}-relationship`);
    this.allocationInput = (index) => page.getByTestId(`beneficiary-${index}-allocation`);
    this.typeSelect = (index) => page.getByTestId(`beneficiary-${index}-type`);
    this.dobInput = (index) => page.getByTestId(`beneficiary-${index}-dob`);
    this.guardianNameInput = (index) => page.getByTestId(`beneficiary-${index}-guardian-name`);
    this.removeButton = (index) => page.getByTestId(`beneficiary-${index}-remove`);

    this.trustNameInput = (index) => page.getByTestId(`beneficiary-${index}-trust-name`);
    this.trusteeNameInput = (index) => page.getByTestId(`beneficiary-${index}-trustee-name`);
    this.orgRegistrationInput = (index) =>
      page.getByTestId(`beneficiary-${index}-registration-number`);

    this.allocationError = page.getByTestId('allocation-error');
    this.duplicateError = page.getByTestId('duplicate-beneficiary-error');
    this.guardianRequiredError = page.getByTestId('guardian-name-error');

    this.nextButton = page.getByRole('button', { name: /next|continue/i });
  }

  async goto(applicationId) {
    await this.page.goto(routes.beneficiaries(applicationId));
  }

  async addAndFill(index, beneficiary) {
    await this.addBeneficiaryButton.click();
    await this.firstNameInput(index).fill(beneficiary.firstName);
    await this.lastNameInput(index).fill(beneficiary.lastName);
    await this.relationshipSelect(index).selectOption(beneficiary.relationship);
    await this.typeSelect(index).selectOption(beneficiary.type);
    await this.dobInput(index).fill(beneficiary.dateOfBirth);
    await this.allocationInput(index).fill(String(beneficiary.allocationPercent));

    if (beneficiary.guardianName) {
      await this.guardianNameInput(index).fill(beneficiary.guardianName);
    }
    if (beneficiary.trustName) {
      await this.trustNameInput(index).fill(beneficiary.trustName);
      await this.trusteeNameInput(index).fill(beneficiary.trusteeName);
    }
    if (beneficiary.registrationNumber) {
      await this.orgRegistrationInput(index).fill(beneficiary.registrationNumber);
    }
  }

  async addMultiple(beneficiaries) {
    for (let i = 0; i < beneficiaries.length; i++) {
      await this.addAndFill(i, beneficiaries[i]);
    }
  }

  async removeBeneficiary(index) {
    await this.removeButton(index).click();
  }

  async next() {
    await this.nextButton.click();
  }
}

module.exports = { BeneficiaryPage };
