import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Tento test beží v chromium projekte — session je načítaná z playwright/.auth/user.json

test.describe('Vytvorenie novej platby', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('vytvorí novú platbu a overí transakciu v zozname', async ({ page }) => {
    const amount = '50';
    const note = faker.lorem.sentence();

    // Získame aktuálny balance pred platbou
    const balanceLocator = page
      .getByRole('heading', { name: 'Account Balance' })
      .locator('..')
      .getByRole('heading')
      .first();
    const balanceBefore = await balanceLocator.textContent();

    // 1. Kliknutie na 'New' v Transaction sekcii
    await page.getByTestId('nav-top-new-transaction').click();

    // 2. Výber prijemcu zo zoznamu kontaktov
    await page.getByTestId('user-list-search-input').fill('Kristian');
    const contact = page.locator('[data-test^="user-list-item-"]').first();
    await contact.waitFor({ state: 'visible' });
    const recipientName = await contact.locator('[class*="MuiListItemText-primary"]').textContent();
    await contact.click();

    // 3. Zadanie sumy
    await page.getByPlaceholder('Amount').fill(amount);

    // 4. Pridanie poznámky
    await page.getByPlaceholder('Add a note').fill(note);

    // 5. Kliknutie na 'Pay'
    await page.getByTestId('transaction-create-submit-payment').click();

    // 6. Overenie úspešného vytvorenia — zobrazí sa Complete obrazovka
    await expect(page.getByRole('heading', { name: /Paid \$50\.00/ })).toBeVisible();

    // 7. Návrat na zoznam transakcií a prepnutie na tab "Mine"
    await page.getByRole('link', { name: 'Return To Transactions' }).click();
    await page.getByTestId('nav-personal-tab').click();

    // 8. Overenie, že transakcia sa zobrazuje v zozname s korektnou sumou a poznámkou
    const firstTransaction = page.locator('[data-test^="transaction-item-"]').first();
    await expect(firstTransaction).toBeVisible();
    await expect(firstTransaction.locator('[data-test^="transaction-amount-"]')).toHaveText(`-$${parseFloat(amount).toFixed(2)}`);
    await expect(firstTransaction.getByText(note)).toBeVisible();
    await expect(firstTransaction.locator('[data-test^="transaction-receiver-"]')).toHaveText(recipientName!);

    // 9. Overenie, že balance sa znížil presne o zaplatenú sumu
    // toHaveText má vstavaný retry — čaká kým sa DOM aktualizuje
    const parseBalance = (text: string) => parseFloat(text.replace(/[$,]/g, ''));
    const expectedBalance = parseBalance(balanceBefore!) - parseFloat(amount);
    const formattedExpected = '$' + expectedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await expect(balanceLocator).toHaveText(formattedExpected);
  });
});
