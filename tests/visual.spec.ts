import { test, type Page } from '@playwright/test';
import { Eyes, Target, BatchInfo, Configuration } from '@applitools/eyes-playwright';
import { env } from '../playwright.config';
import { SigninPage } from './pages/signin.page';

const batch = new BatchInfo({ name: 'Playwright Learning – Visual Tests' });

function createEyes() {
  const eyes = new Eyes();

  const config = new Configuration();
  config.setApiKey(process.env.APPLITOOLS_API_KEY!);
  config.setBatch(batch);
  eyes.setConfiguration(config);

  return eyes;
}

async function openEyes(eyes: Eyes, page: Page, title: string) {
  await eyes.open(page, 'Cypress RealWorld App', title, {
    width: 1280,
    height: 720,
  });
}

async function closeEyes(eyes: Eyes) {
  try {
    if (eyes.getIsOpen()) {
      await eyes.close(false);
    }
  } finally {
    await eyes.abort();
  }
}

test.describe('Visual Tests – Login', () => {

  // Stav 1: prázdny formulár — zachytí default layout
  test('login stránka – default stav', async ({ page }) => {
    const signinPage = new SigninPage(page);
    const eyes = createEyes();

    try {
      await openEyes(eyes, page, test.info().title);
      await signinPage.goto();
      await eyes.check('Login page – default', Target.window().fully());
    } finally {
      await closeEyes(eyes);
    }
  });

  // Stav 2: error stav — iný vizuálny stav, iné farby, error správa
  test('login stránka – error stav po zlom hesle', async ({ page }) => {
    const signinPage = new SigninPage(page);
    const eyes = createEyes();

    try {
      await openEyes(eyes, page, test.info().title);
      await signinPage.goto();
      await signinPage.login(env.userName, 'zle_heslo');
      await signinPage.expectInvalidCredentialsError();
      await eyes.check('Login page – error state', Target.window().fully());
    } finally {
      await closeEyes(eyes);
    }
  });
});
