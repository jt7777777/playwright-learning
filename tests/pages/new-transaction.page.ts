import { expect, type Locator, type Page } from '@playwright/test';

export class NewTransactionPage {
  readonly page: Page;
  readonly recipientSearchInput: Locator;
  readonly contactItems: Locator;
  readonly amountInput: Locator;
  readonly noteInput: Locator;
  readonly payButton: Locator;
  readonly requestButton: Locator;
  readonly returnToTransactionsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.recipientSearchInput = page.getByTestId('user-list-search-input');
    this.contactItems = page.locator('[data-test^="user-list-item-"]');
    this.amountInput = page.getByPlaceholder('Amount');
    this.noteInput = page.getByPlaceholder('Add a note');
    this.payButton = page.getByTestId('transaction-create-submit-payment');
    this.requestButton = page.getByTestId('transaction-create-submit-request');
    this.returnToTransactionsLink = page.getByRole('link', { name: 'Return To Transactions' });
  }

  async selectFirstRecipient(searchTerm: string) {
    await this.recipientSearchInput.fill(searchTerm);

    const contact = this.contactItems.first();
    await contact.waitFor({ state: 'visible' });

    const recipientName = (await contact.locator('[class*="MuiListItemText-primary"]').textContent())?.trim();

    if (!recipientName) {
      throw new Error(`Nepodarilo sa načítať meno príjemcu pre vyhľadávanie "${searchTerm}".`);
    }

    await contact.click();
    return recipientName;
  }

  async fillPaymentDetails(amount: string, note: string) {
    await this.amountInput.fill(amount);
    await this.noteInput.fill(note);
  }

  async submitPayment() {
    await this.payButton.click();
  }

  async submitRequest() {
    await this.requestButton.click();
  }

  async expectPaymentCompleted(amount: string) {
    await expect(this.page.getByRole('heading', { name: new RegExp(`Paid \\$${this.formatAmount(amount)}`) })).toBeVisible();
  }

  async expectRequestCompleted(amount: string) {
    await expect(this.page.getByRole('heading', { name: new RegExp(`Requested \\$${this.formatAmount(amount)}`) })).toBeVisible();
  }

  async returnToTransactions() {
    await this.returnToTransactionsLink.click();
  }

  private formatAmount(amount: string) {
    return Number.parseFloat(amount).toFixed(2);
  }
}
