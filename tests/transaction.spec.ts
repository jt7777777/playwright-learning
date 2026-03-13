import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { HomePage } from './pages/home.page';
import { NewTransactionPage } from './pages/new-transaction.page';

function formatAmount(amount: string) {
  return Number.parseFloat(amount).toFixed(2);
}

test.describe('Vytvorenie novej platby', () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).goto();
  });

  test('vytvorí novú platbu a overí transakciu v zozname', async ({ page }) => {
    const homePage = new HomePage(page);
    const newTransactionPage = new NewTransactionPage(page);
    const amount = '50';
    const note = faker.lorem.sentence();

    const balanceBefore = await homePage.getAccountBalanceText();

    await homePage.openNewTransaction();
    const recipientName = await newTransactionPage.selectFirstRecipient('Kristian');
    await newTransactionPage.fillPaymentDetails(amount, note);
    await newTransactionPage.submitPayment();
    await newTransactionPage.expectPaymentCompleted(amount);

    await newTransactionPage.returnToTransactions();
    await homePage.openMineTab();

    await homePage.expectTransaction({
      note,
      amount: `-$${formatAmount(amount)}`,
      recipientName,
    });
    await homePage.expectBalanceDecreasedBy(balanceBefore, amount);
  });
});

test.describe('Vytvorenie novej žiadosti o platbu (Request)', () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).goto();
  });

  test('vytvorí novú žiadosť o platbu a overí ju v zozname transakcií', async ({ page }) => {
    const homePage = new HomePage(page);
    const newTransactionPage = new NewTransactionPage(page);
    const amount = '35';
    const note = faker.lorem.sentence();

    await homePage.openNewTransaction();
    const recipientName = await newTransactionPage.selectFirstRecipient('Kristian');
    await newTransactionPage.fillPaymentDetails(amount, note);
    await newTransactionPage.submitRequest();
    await newTransactionPage.expectRequestCompleted(amount);

    await newTransactionPage.returnToTransactions();
    await homePage.openMineTab();

    await homePage.expectTransaction({
      note,
      amount: `+$${formatAmount(amount)}`,
      recipientName,
    });
  });
});
