import { expect, type Locator, type Page } from '@playwright/test';

export class SigninPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly invalidCredentialsError: Locator;
  readonly usernameRequiredError: Locator;
  readonly passwordLengthError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.invalidCredentialsError = page.getByText(/username or password is invalid/i);
    this.usernameRequiredError = page.getByText(/username is required/i);
    this.passwordLengthError = page.getByText(/password must contain at least 4 characters/i);
  }

  async goto() {
    await this.page.goto('/signin');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectInvalidCredentialsError() {
    await expect(this.invalidCredentialsError).toBeVisible();
  }

  async triggerUsernameValidation() {
    await this.usernameInput.click();
    await this.page.keyboard.press('Tab');
  }

  async triggerPasswordValidation(value = 'a') {
    await this.passwordInput.fill(value);
    await this.page.keyboard.press('Tab');
  }

  async expectUsernameRequiredError() {
    await expect(this.usernameRequiredError).toBeVisible();
  }

  async expectPasswordLengthError() {
    await expect(this.passwordLengthError).toBeVisible();
  }
}
