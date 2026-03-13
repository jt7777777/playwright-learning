import { expect, type Locator, type Page } from '@playwright/test';

export type TransactionExpectation = {
  note: string;
  amount: string;
  recipientName: string;
};

export class HomePage {
  readonly page: Page;
  readonly accountBalanceAmount: Locator;
  readonly newTransactionButton: Locator;
  readonly mineTab: Locator;
  readonly myAccountLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountBalanceAmount = page
      .getByRole('heading', { name: 'Account Balance' })
      .locator('..')
      .getByRole('heading')
      .first();
    this.newTransactionButton = page.getByTestId('nav-top-new-transaction');
    this.mineTab = page.getByTestId('nav-personal-tab');
    this.myAccountLink = page.getByRole('link', { name: /my account/i });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async getAccountBalanceText() {
    const balance = (await this.accountBalanceAmount.textContent())?.trim();

    if (!balance) {
      throw new Error('Nepodarilo sa načítať account balance.');
    }

    return balance;
  }

  async expectAccountBalance(expectedBalance: string) {
    await expect(this.accountBalanceAmount).toHaveText(expectedBalance);
  }

  async expectBalanceDecreasedBy(balanceBefore: string, amount: string) {
    const before = Number.parseFloat(balanceBefore.replace(/[$,]/g, ''));
    const expected = before - Number.parseFloat(amount);
    const formatted = '$' + expected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await expect(this.accountBalanceAmount).toHaveText(formatted);
  }

  async openNewTransaction() {
    await this.newTransactionButton.click();
  }

  async openMineTab() {
    await this.mineTab.click();
  }

  async expectSignedIn() {
    await expect(this.myAccountLink).toBeVisible({ timeout: 15000 });
    await expect(this.logoutButton).toBeVisible();
  }

  transactionItem(note: string) {
    return this.page.locator('[data-test^="transaction-item-"]', { hasText: note });
  }

  async expectTransaction({ note, amount, recipientName }: TransactionExpectation) {
    const transaction = this.transactionItem(note);

    await expect(transaction).toBeVisible();
    await expect(transaction.locator('[data-test^="transaction-amount-"]')).toHaveText(amount);
    await expect(transaction.locator('[data-test^="transaction-receiver-"]')).toHaveText(recipientName);
  }
}
