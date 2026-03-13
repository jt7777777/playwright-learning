import { test, expect, type APIRequestContext } from '@playwright/test';
import { env } from '../../playwright.config';

async function loginRequest(request: APIRequestContext, username: string, password: string) {
  return request.post('/login', {
    data: { username, password },
  });
}

test.describe('API: Login', () => {
  test('úspešné prihlásenie vráti používateľa', async ({ request }) => {
    const response = await loginRequest(request, env.userName, env.userPassword);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('username', env.userName);
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('email');
  });

  test.fixme('login response nesmie obsahovať password hash', async ({ request }) => {
    // TODO: backend vracia password hash v response (bezpečnostný bug)
    const response = await loginRequest(request, env.userName, env.userPassword);
    const body = await response.json();
    expect(body.user).not.toHaveProperty('password');
  });

  test('nesprávne heslo vráti 401', async ({ request }) => {
    const response = await loginRequest(request, env.userName, 'zle_heslo');

    expect(response.status()).toBe(401);
  });

  test('neexistujúci používateľ vráti 401', async ({ request }) => {
    const response = await loginRequest(request, 'neexistujuci_user_xyz', 'heslo123');

    expect(response.status()).toBe(401);
  });

  test('chýbajúce credentials vrátia 400', async ({ request }) => {
    const response = await request.post('/login', { data: {} });

    expect(response.status()).toBe(400);
  });

  test('session po prihlásení umožní autentifikované volania', async ({ request }) => {
    await loginRequest(request, env.userName, env.userPassword);

    const response = await request.get('/checkAuth');

    expect(response.status()).toBe(200);
  });
});
