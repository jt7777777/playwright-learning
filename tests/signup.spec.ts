import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { SignupPage } from './pages/signup.page';

test.describe('Registrácia', () => {
  test.beforeEach(async ({ page }) => {
    await new SignupPage(page).goto();
  });

  test('úspešná registrácia nového používateľa', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const password = faker.internet.password({ length: 8 });

    await signupPage.fillForm({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      password,
      confirmPassword: password,
    });
    await signupPage.submit();
    await signupPage.expectRedirectedToSignIn();
  });

  test('zobrazí chybu pri prázdnom first name poli', async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.triggerFirstNameValidation();
    await signupPage.expectFirstNameRequiredError();
  });

  test('zobrazí chybu ak sa heslá nezhodujú', async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.fillForm({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 8 }),
      confirmPassword: 'ine_heslo',
    });
    await signupPage.blurConfirmPassword();
    await signupPage.expectPasswordMismatchError();
  });
});
