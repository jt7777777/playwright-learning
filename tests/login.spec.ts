import { test, expect } from '@playwright/test';
import { env } from '../playwright.config';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
  });

  test('zobrazí login formulár', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('úspešné prihlásenie so správnymi údajmi', async ({ page }) => {
    await page.locator('#username').fill(env.userName);
    await page.locator('#password').fill(env.userPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');

    await expect(page).toHaveURL('/');
  });

  test('neúspešné prihlásenie so zlým heslom', async ({ page }) => {
    await page.locator('#username').fill(env.userName);
    await page.locator('#password').fill('zle_heslo');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/username or password is invalid/i)).toBeVisible();
  });

  test('zobrazí validačné chyby pri prázdnych poliach', async ({ page }) => {
    await page.locator('#username').click();
    await page.keyboard.press('Tab'); // blur na username — triggeruje validáciu
    await expect(page.getByText(/username is required/i)).toBeVisible();

    await page.locator('#password').fill('a');
    await page.keyboard.press('Tab'); // blur na password — triggeruje validáciu
    await expect(page.getByText(/password must contain at least 4 characters/i)).toBeVisible();
  });
});
