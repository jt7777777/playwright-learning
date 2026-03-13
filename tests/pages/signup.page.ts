import { expect, type Locator, type Page } from '@playwright/test';

export type SignupFormData = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword?: string;
};

export class SignupPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly firstNameRequiredError: Locator;
  readonly passwordMismatchError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="signup-first-name"] input');
    this.lastNameInput = page.locator('[data-test="signup-last-name"] input');
    this.usernameInput = page.locator('[data-test="signup-username"] input');
    this.passwordInput = page.locator('[data-test="signup-password"] input');
    this.confirmPasswordInput = page.locator('[data-test="signup-confirmPassword"] input');
    this.submitButton = page.locator('[data-test="signup-submit"]');
    this.firstNameRequiredError = page.getByText(/first name is required/i);
    this.passwordMismatchError = page.getByText(/password does not match/i);
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async fillForm({ firstName, lastName, username, password, confirmPassword = password }: SignupFormData) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async submit() {
    await this.submitButton.click();
  }

  async triggerFirstNameValidation() {
    await this.firstNameInput.click();
    await this.lastNameInput.click();
  }

  async blurConfirmPassword() {
    await this.confirmPasswordInput.press('Tab');
  }

  async expectRedirectedToSignIn() {
    await expect(this.page).toHaveURL(/signin/);
  }

  async expectFirstNameRequiredError() {
    await expect(this.firstNameRequiredError).toBeVisible();
  }

  async expectPasswordMismatchError() {
    await expect(this.passwordMismatchError).toBeVisible();
  }
}
