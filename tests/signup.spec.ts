import { test, expect, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

async function fillSignupForm(page: Page, { firstName, lastName, username, password }: { firstName: string, lastName: string, username: string, password: string }) {
  await page.locator('[data-test="signup-first-name"] input').fill(firstName);
  await page.locator('[data-test="signup-last-name"] input').fill(lastName);
  await page.locator('[data-test="signup-username"] input').fill(username);
  await page.locator('[data-test="signup-password"] input').fill(password);
}

test.describe('Registrácia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('úspešná registrácia nového používateľa', async ({ page }) => {
    const password = faker.internet.password({ length: 8 });
    await fillSignupForm(page, {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      password,
    });
    await page.locator('[data-test="signup-confirmPassword"] input').fill(password);
    await page.locator('[data-test="signup-submit"]').click();

    await expect(page).toHaveURL(/signin/);
  });

  test('zobrazí chybu pri prázdnom first name poli', async ({ page }) => {
    await page.locator('[data-test="signup-first-name"] input').click();
    await page.locator('[data-test="signup-last-name"] input').click();

    await expect(page.getByText(/first name is required/i)).toBeVisible();
  });

  test('zobrazí chybu ak sa heslá nezhodujú', async ({ page }) => {
    await fillSignupForm(page, {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 8 }),
    });
    await page.locator('[data-test="signup-confirmPassword"] input').fill('ine_heslo');
    await page.locator('[data-test="signup-confirmPassword"] input').press('Tab');

    await expect(page.getByText(/password does not match/i)).toBeVisible();
  });
});
